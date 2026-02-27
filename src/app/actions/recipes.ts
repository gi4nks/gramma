"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import * as cheerio from "cheerio";

interface ExtractedIngredient {
  name: string;
  quantity: number;
  unit: string;
}

function parseIngredientString(input: string): ExtractedIngredient {
  const cleanInput = input
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]*>?/gm, "")
    .trim()
    .replace(/\s+/g, " ");
  
  if (/q\.?b\.?/i.test(cleanInput)) {
    return {
      name: cleanInput.replace(/q\.?b\.?/i, "").replace(/,$/, "").trim(),
      quantity: 1,
      unit: "q.b."
    };
  }

  const commonUnits = ["g", "gr", "grammi", "kg", "chili", "chilo", "l", "ml", "cl", "dl", "litri", "litro", "cucchiai", "cucchiaio", "cucchiaino", "cucchiaini", "pz", "pezzi", "fette", "foglie", "spicchi", "spicchio", "bicchieri", "bicchiere", "vasetti", "vasetto", "pizzico", "bustina", "bustine", "panetto", "panetti", "mazzetto", "mazzetti"];
  const unitsRegex = commonUnits.join("|");

  const standardRegex = new RegExp(`^([\\d.,/\\s]+)\\s*(${unitsRegex})?\\b\\s*(?:di|d'|del|dei|delle|degli)?\\s*(.*)$`, "i");
  const standardMatch = cleanInput.match(standardRegex);

  if (standardMatch) {
    const qty = parseNumericQuantity(standardMatch[1]);
    return {
      quantity: qty,
      unit: standardMatch[2] || "pz",
      name: standardMatch[3].trim()
    };
  }

  const reverseRegex = new RegExp(`^(.*?)\\s*\\(?([\\d.,/\\s]+)\\s*(${unitsRegex})?\\b\\)?$`, "i");
  const reverseMatch = cleanInput.match(reverseRegex);

  if (reverseMatch && reverseMatch[2]) {
    const qty = parseNumericQuantity(reverseMatch[2]);
    return {
      name: reverseMatch[1].replace(/,$/, "").trim(),
      quantity: qty,
      unit: reverseMatch[3] || "pz"
    };
  }

  return { name: cleanInput, quantity: 1, unit: "pz" };
}

function parseNumericQuantity(qtyStr: string): number {
  let normalized = qtyStr.replace(",", ".").replace(/\s/g, "");
  if (normalized.includes("/")) {
    const [num, den] = normalized.split("/").map(Number);
    return den !== 0 ? num / den : 1;
  }
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 1 : parsed;
}

async function extractRecipeFromJsonLd(url: string) {
  try {
    const response = await fetch(url, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Cache-Control": "no-cache"
      },
      cache: 'no-store'
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    let recipeData: any = null;

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).text());
        const findRecipe = (obj: any): any => {
          if (!obj) return null;
          if (Array.isArray(obj)) {
            for (const item of obj) {
              const found = findRecipe(item);
              if (found) return found;
            }
          }
          if (obj["@type"] === "Recipe" || (Array.isArray(obj["@type"]) && obj["@type"].includes("Recipe"))) return obj;
          if (obj["@graph"] && Array.isArray(obj["@graph"])) return findRecipe(obj["@graph"]);
          return null;
        };
        const found = findRecipe(json);
        if (found) { recipeData = found; return false; }
      } catch (e) {}
    });

    if (!recipeData) {
      return { name: $("h1").first().text().trim() || $("title").text().trim(), ingredients: [], tags: "" };
    }

    // Estrazione Tag (Category + Keywords)
    const tagsArr: string[] = [];
    if (recipeData.recipeCategory) {
      if (Array.isArray(recipeData.recipeCategory)) tagsArr.push(...recipeData.recipeCategory);
      else tagsArr.push(recipeData.recipeCategory);
    }
    if (recipeData.keywords && typeof recipeData.keywords === "string") {
      tagsArr.push(...recipeData.keywords.split(","));
    }

    const forbiddenTags = ["ricetta", "ricette", "cucina", "cucinare", "piatti", "portata", "preparazione"];

    const cleanTags = Array.from(new Set(
      tagsArr
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 2 && t.length < 20 && !forbiddenTags.includes(t))
    )).join(",");

    const rawIngredients = recipeData.recipeIngredient || recipeData.ingredients || [];
    
    return {
      name: recipeData.name || $("h1").first().text().trim(),
      ingredients: rawIngredients.map((ing: string) => parseIngredientString(ing.toString())),
      tags: cleanTags
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function addRecipeFromUrl(formData: FormData) {
  const url = formData.get("url") as string;
  if (!url) return;

  try {
    const existingRecipe = await db.recipe.findFirst({ where: { sourceUrl: url } });
    if (existingRecipe) return;

    const extracted = await extractRecipeFromJsonLd(url);

    const recipe = await db.recipe.create({
      data: {
        name: extracted.name,
        sourceUrl: url,
        tags: extracted.tags,
      },
    });

    for (const ing of extracted.ingredients) {
      const ingredient = await db.ingredient.upsert({
        where: { name: ing.name.toLowerCase() },
        update: {},
        create: { name: ing.name.toLowerCase() },
      });

      await db.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          ingredientId: ingredient.id,
          quantity: ing.quantity,
          unit: ing.unit,
        },
      });
    }

    revalidatePath("/recipes");
    revalidatePath("/");
  } catch (e) {
    console.error(e);
  }
}

export async function deleteRecipe(id: string) {
  await db.recipeIngredient.deleteMany({ where: { recipeId: id } });
  await db.weeklyPlan.deleteMany({ where: { recipeId: id } });
  await db.recipe.delete({ where: { id } });
  revalidatePath("/recipes");
  revalidatePath("/");
}

export async function addManualRecipe(data: { name: string; tags: string; ingredients: { name: string; quantity: number; unit: string }[] }) {
  const recipe = await db.recipe.create({
    data: {
      name: data.name,
      tags: data.tags,
    },
  });

  for (const ing of data.ingredients) {
    const ingredient = await db.ingredient.upsert({
      where: { name: ing.name.toLowerCase() },
      update: {},
      create: { name: ing.name.toLowerCase() },
    });

    await db.recipeIngredient.create({
      data: {
        recipeId: recipe.id,
        ingredientId: ingredient.id,
        quantity: ing.quantity,
        unit: ing.unit,
      },
    });
  }

  revalidatePath("/recipes");
  revalidatePath("/");
}
