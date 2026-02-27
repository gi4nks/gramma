import { db } from "@/lib/db";
import { CheckCircle2, ShoppingCart, Scale, Truck } from "lucide-react";
import { PrintButton } from "@/components/PrintButton";
import { normalizeQuantity, formatOutput, sanitizeIngredientName } from "@/lib/ingredients";
import { addShoppingListToPantry } from "@/app/actions/pantry";

export default async function ShoppingListPage() {
  const [plans, pantry] = await Promise.all([
    db.weeklyPlan.findMany({
      include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } }
    }),
    db.pantryItem.findMany({
      include: { ingredient: true }
    })
  ]);

  const requiredBase: Record<string, { name: string; totalValue: number; baseUnit: string }> = {};
  const IGNORED_INGREDIENTS = ["acqua", "acqua tiepida", "acqua calda", "acqua fredda", "acqua (tiepida)", "sale", "sale fino", "sale grosso", "sale marino"];

  plans.forEach(plan => {
    plan.recipe.ingredients.forEach(ri => {
      const name = ri.ingredient.name.toLowerCase();
      if (IGNORED_INGREDIENTS.includes(name)) return;

      const { value, baseUnit } = normalizeQuantity(ri.quantity, ri.unit);
      const key = name;
      
      if (!requiredBase[key]) {
        requiredBase[key] = { name: ri.ingredient.name, totalValue: 0, baseUnit };
      }
      requiredBase[key].totalValue += value;
    });
  });

  const shoppingList = Object.entries(requiredBase).map(([key, item]) => {
    const sanitizedKey = sanitizeIngredientName(key);
    
    // Matching ultra-flessibile
    const pantryItem = pantry.find(p => {
      const sanitizedPantryName = sanitizeIngredientName(p.ingredient.name);
      return sanitizedPantryName === sanitizedKey || 
             sanitizedPantryName.includes(sanitizedKey) ||
             sanitizedKey.includes(sanitizedPantryName);
    });

    let inPantryValue = 0;
    if (pantryItem) {
      const normalizedPantry = normalizeQuantity(pantryItem.quantity, pantryItem.unit);
      
      // Se le unità base sono diverse (es. ml vs pz), facciamo un matching di esistenza
      // Se hai una bottiglia di salsa di soia (pz) e ne servono 2 cucchiai (ml),
      // consideriamo che l'hai già in casa per non sporcare la lista spesa.
      if (normalizedPantry.baseUnit === item.baseUnit) {
        inPantryValue = normalizedPantry.value;
      } else {
        // Se l'unità è diversa ma l'ingrediente è lo stesso, consideriamo "coperto"
        // se la quantità in dispensa è > 0 (fallback pragmatico)
        if (pantryItem.quantity > 0) {
          inPantryValue = item.totalValue; // Copre tutto il fabbisogno
        }
      }
    }

    const neededValue = Math.max(0, item.totalValue - inPantryValue);
    
    return {
      name: item.name,
      neededFormatted: formatOutput(neededValue, item.baseUnit),
      totalFormatted: formatOutput(item.totalValue, item.baseUnit),
      pantryFormatted: formatOutput(inPantryValue, item.baseUnit),
      neededValue
    };
  }).filter(item => item.neededValue > 0);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold italic">Lista della Spesa</h1>
        <div className="badge badge-primary p-4 gap-2 font-bold">
          <ShoppingCart size={16} />
          {shoppingList.length} Articoli necessari
        </div>
      </div>

      {shoppingList.length === 0 ? (
        <div className="card bg-success/10 border border-success/20 shadow-xl p-12 flex flex-col items-center gap-4 text-center">
          <CheckCircle2 size={64} className="text-success" />
          <div>
            <h2 className="text-2xl font-bold text-success">Dispensa al completo!</h2>
            <p className="text-base-content/70 italic">Hai tutto il necessario per le ricette pianificate.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {shoppingList.map((item, idx) => (
            <div key={idx} className="card bg-base-100 shadow-md border border-base-200 hover:border-primary/30 transition-colors">
              <div className="card-body p-4 flex-row justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold capitalize leading-tight">{item.name}</h3>
                  <div className="flex gap-2 text-[10px] uppercase font-bold opacity-40 mt-1">
                    <span>Ricetta: {item.totalFormatted}</span>
                    <span>•</span>
                    <span>In Casa: {item.pantryFormatted}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold opacity-50 mb-[-4px]">MANCANO</span>
                  <span className="text-2xl font-black text-primary">{item.neededFormatted}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="flex flex-col md:flex-row gap-3 mt-6">
            <div className="flex-1">
               <PrintButton />
            </div>
            <form action={addShoppingListToPantry} className="flex-1">
              <button type="submit" className="btn btn-secondary w-full gap-2 shadow-lg shadow-secondary/20 h-full">
                <Truck size={18} />
                Ho fatto la spesa!
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="stats shadow bg-base-100 border border-base-300 mt-4">
        <div className="stat">
          <div className="stat-figure text-primary"><Scale size={24} /></div>
          <div className="stat-title">Matching Intelligente</div>
          <div className="stat-desc">Conversioni Kg/g e L/ml attive</div>
        </div>
      </div>
    </div>
  );
}
