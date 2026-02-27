"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { normalizeQuantity } from "@/lib/ingredients";

export async function addToWeeklyPlan(formData: FormData) {
  const day = formData.get("day") as string;
  const mealType = formData.get("mealType") as string;
  const recipeId = formData.get("recipeId") as string;

  if (!day || !mealType || !recipeId) return;

  await db.weeklyPlan.create({
    data: { day, mealType, recipeId },
  });

  revalidatePath("/weekly-plan");
}

export async function removeFromWeeklyPlan(id: string) {
  await db.weeklyPlan.delete({ where: { id } });
  revalidatePath("/weekly-plan");
}

export async function moveWeeklyPlanItem(id: string, day: string, mealType: string) {
  await db.weeklyPlan.update({
    where: { id },
    data: { day, mealType },
  });
  revalidatePath("/weekly-plan");
  revalidatePath("/");
}

/**
 * Funzione "Cucinato!": Sottrae gli ingredienti della ricetta dalla dispensa
 * e rimuove il pasto dal piano settimanale.
 */
export async function markAsCooked(planId: string) {
  const plan = await db.weeklyPlan.findUnique({
    where: { id: planId },
    include: {
      recipe: {
        include: {
          ingredients: { include: { ingredient: true } }
        }
      }
    }
  });

  if (!plan) return;

  // 1. Processa ogni ingrediente della ricetta
  for (const ri of plan.recipe.ingredients) {
    const { value: reqVal, baseUnit: reqUnit } = normalizeQuantity(ri.quantity, ri.unit);
    
    // Cerca in dispensa (matching flessibile)
    const pantryItem = await db.pantryItem.findFirst({
      where: {
        OR: [
          { ingredient: { name: ri.ingredient.name.toLowerCase() } },
          { ingredient: { name: { contains: ri.ingredient.name.toLowerCase() } } }
        ]
      },
      include: { ingredient: true }
    });

    if (pantryItem) {
      const { value: panVal, baseUnit: panUnit } = normalizeQuantity(pantryItem.quantity, pantryItem.unit);
      
      if (panUnit === reqUnit) {
        const newValueBase = Math.max(0, panVal - reqVal);
        
        if (newValueBase <= 0) {
          await db.pantryItem.delete({ where: { id: pantryItem.id } });
        } else {
          // Riconverte in unità originale del pantry prima di salvare
          const ratio = pantryItem.quantity / panVal;
          await db.pantryItem.update({
            where: { id: pantryItem.id },
            data: { quantity: newValueBase * ratio }
          });
        }
      }
    }
  }

  // 2. Rimuove il pasto dal piano
  await db.weeklyPlan.delete({ where: { id: planId } });

  revalidatePath("/weekly-plan");
  revalidatePath("/pantry");
  revalidatePath("/shopping-list");
  revalidatePath("/");
}
