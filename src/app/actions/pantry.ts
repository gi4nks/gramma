"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addOrUpdatePantryItem(formData: FormData) {
  const name = formData.get("name") as string;
  const quantity = parseFloat(formData.get("quantity") as string);
  const unit = formData.get("unit") as string;

  if (!name || isNaN(quantity)) return;

  const ingredient = await db.ingredient.upsert({
    where: { name: name.toLowerCase() },
    update: {},
    create: { name: name.toLowerCase() },
  });

  await db.pantryItem.upsert({
    where: { ingredientId: ingredient.id },
    update: { 
      quantity: { increment: quantity },
      unit // Aggiorna l'unità se diversa, o mantiene la stessa
    },
    create: {
      ingredientId: ingredient.id,
      quantity,
      unit,
    },
  });

  revalidatePath("/pantry");
  revalidatePath("/shopping-list");
  revalidatePath("/inspiration");
  revalidatePath("/");
}

export async function adjustPantryQuantity(id: string, delta: number) {
  const item = await db.pantryItem.findUnique({ where: { id } });
  if (!item) return;

  const newQuantity = Math.max(0, item.quantity + delta);

  if (newQuantity === 0) {
    await db.pantryItem.delete({ where: { id } });
  } else {
    await db.pantryItem.update({
      where: { id },
      data: { quantity: newQuantity },
    });
  }

  revalidatePath("/pantry");
  revalidatePath("/shopping-list");
  revalidatePath("/inspiration");
  revalidatePath("/");
}

/**
 * Trasferisce tutto il contenuto della lista della spesa in dispensa
 */
export async function addShoppingListToPantry() {
  const [plans, pantry] = await Promise.all([
    db.weeklyPlan.findMany({
      include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } }
    }),
    db.pantryItem.findMany({
      include: { ingredient: true }
    })
  ]);

  const { normalizeQuantity } = await import("@/lib/ingredients");
  const requiredBase: Record<string, { name: string; totalValue: number; baseUnit: string }> = {};
  const IGNORED = ["acqua", "acqua tiepida", "acqua calda", "acqua fredda", "acqua (tiepida)", "sale", "sale fino", "sale grosso", "sale marino"];

  // 1. Ricalcola il fabbisogno
  plans.forEach(plan => {
    plan.recipe.ingredients.forEach(ri => {
      const name = ri.ingredient.name.toLowerCase();
      if (IGNORED.includes(name)) return;
      const { value, baseUnit } = normalizeQuantity(ri.quantity, ri.unit);
      if (!requiredBase[name]) {
        requiredBase[name] = { name: ri.ingredient.name, totalValue: 0, baseUnit };
      }
      requiredBase[name].totalValue += value;
    });
  });

  // 2. Per ogni elemento necessario, calcola il delta e aggiorna la dispensa
  for (const [name, item] of Object.entries(requiredBase)) {
    // Cerca se esiste già un item simile in dispensa
    const pantryItem = pantry.find(p => 
      p.ingredient.name.toLowerCase() === name || 
      p.ingredient.name.toLowerCase().includes(name) ||
      name.includes(p.ingredient.name.toLowerCase())
    );

    let inPantryValue = 0;
    if (pantryItem) {
      const normalizedPantry = normalizeQuantity(pantryItem.quantity, pantryItem.unit);
      if (normalizedPantry.baseUnit === item.baseUnit) {
        inPantryValue = normalizedPantry.value;
      }
    }

    const neededValueBase = Math.max(0, item.totalValue - inPantryValue);

    if (neededValueBase > 0) {
      let targetIngredientId: string;
      let targetUnit: string = item.baseUnit;
      let incrementValue: number = neededValueBase;

      if (pantryItem) {
        // Se abbiamo trovato un match, aggiorniamo QUELLO specifico ingrediente in dispensa
        targetIngredientId = pantryItem.ingredientId;
        targetUnit = pantryItem.unit;
        // Calcoliamo il fattore di conversione per mantenere l'unità della dispensa
        const normalizedOne = normalizeQuantity(1, targetUnit).value || 1;
        incrementValue = neededValueBase / normalizedOne;
      } else {
        // Altrimenti creiamo/usiamo l'ingrediente esatto della ricetta
        const ingredient = await db.ingredient.upsert({
          where: { name: name },
          update: {},
          create: { name: name }
        });
        targetIngredientId = ingredient.id;
      }

      await db.pantryItem.upsert({
        where: { ingredientId: targetIngredientId },
        update: { 
          quantity: { increment: incrementValue },
          unit: targetUnit
        },
        create: {
          ingredientId: targetIngredientId,
          quantity: incrementValue,
          unit: targetUnit
        }
      });
    }
  }

  revalidatePath("/pantry");
  revalidatePath("/shopping-list");
  revalidatePath("/inspiration");
  revalidatePath("/");
}

export async function deletePantryItem(id: string) {
  await db.pantryItem.delete({
    where: { id },
  });
  revalidatePath("/pantry");
  revalidatePath("/shopping-list");
  revalidatePath("/inspiration");
  revalidatePath("/");
}
