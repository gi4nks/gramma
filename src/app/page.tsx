import { db } from "@/lib/db";
import Link from "next/link";
import { Refrigerator, Calendar, ShoppingBasket, Search, ArrowRight, Sparkles, ChefHat, Utensils } from "lucide-react";

export default async function Home() {
  const [pantryCount, recipesCount, nextMeal, allRecipes, pantryItems] = await Promise.all([
    db.pantryItem.count(),
    db.recipe.count(),
    db.weeklyPlan.findFirst({
      include: { recipe: true },
    }),
    db.recipe.findMany({
      include: { ingredients: { include: { ingredient: true } } }
    }),
    db.pantryItem.findMany({
      include: { ingredient: true }
    })
  ]);

  const suggestions = allRecipes.map(recipe => {
    const totalReq = recipe.ingredients.length;
    if (totalReq === 0) return { ...recipe, matchCount: 0, percent: 0 };
    const matches = recipe.ingredients.filter(ri => 
      pantryItems.some(p => p.ingredientId === ri.ingredientId)
    ).length;
    return { ...recipe, matchCount: matches, percent: (matches / totalReq) * 100 };
  })
  .filter(r => r.matchCount > 0)
  .sort((a, b) => b.percent - a.percent)
  .slice(0, 3);

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto py-4">
      
      {/* 1. Header & Quick Stats (Compact) */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-2">Ciao! 👋</h1>
          <p className="text-xl text-base-content/60">Cosa bolle in pentola?</p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">In Dispensa</span>
            <span className="text-2xl font-black text-primary">{pantryCount}</span>
          </div>
          <div className="divider divider-horizontal mx-0"></div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Ricette</span>
            <span className="text-2xl font-black text-secondary">{recipesCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Search Section (Clean & Focused) */}
      <section className="flex flex-col gap-6">
        <div className="relative group max-w-2xl mx-auto w-full">
          <form action="/recipes" method="GET" className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={24} />
            <input 
              name="search"
              className="input input-bordered w-full h-16 pl-16 rounded-full text-lg shadow-sm border-base-300 focus:border-primary focus:outline-none transition-all bg-base-100" 
              placeholder="Cerca un ingrediente o una ricetta..."
            />
            <button type="submit" className="absolute right-3 top-2 bottom-2 px-6 rounded-full btn btn-primary btn-sm h-auto">
              Cerca
            </button>
          </form>
        </div>
      </section>

      {/* 3. Suggestions Grid (Visual Cards) */}
      <section className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ChefHat size={24} className="text-primary" />
            Suggeriti per te
          </h2>
          <span className="badge badge-ghost font-mono text-[10px]">SVUOTA FRIGO ACTIVE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {suggestions.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-base-200/50 rounded-3xl border-2 border-dashed border-base-300">
              <p className="text-base-content/40 italic">Aggiungi ingredienti in dispensa per vedere cosa puoi cucinare!</p>
            </div>
          ) : (
            suggestions.map(recipe => (
              <Link 
                key={recipe.id}
                href={`/recipes?search=${recipe.name}`}
                className="card bg-base-100 shadow-sm hover:shadow-xl transition-all border border-base-200 overflow-hidden group"
              >
                <div className="p-6 flex flex-col h-full gap-4">
                  <div className="flex justify-between items-start">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Utensils size={20} />
                    </div>
                    <div className={`badge ${recipe.percent === 100 ? 'badge-success' : 'badge-warning'} badge-sm font-bold`}>
                      {Math.round(recipe.percent)}% OK
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                      {recipe.name}
                    </h3>
                    <p className="text-xs opacity-50 mt-2 uppercase font-bold tracking-tighter">
                      {recipe.matchCount} ingredienti pronti
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Vedi Ricetta <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* 4. Next Meal Card (Minimalist) */}
      {nextMeal && (
        <section className="bg-neutral text-neutral-content p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-6">
            <div className="bg-white/10 p-4 rounded-2xl">
              <Calendar size={32} />
            </div>
            <div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-widest mb-1">In programma per {nextMeal.day}</p>
              <h3 className="text-2xl font-black">{nextMeal.recipe.name}</h3>
            </div>
          </div>
          <Link href="/weekly-plan" className="btn btn-outline btn-primary border-white/20 text-white hover:bg-white hover:text-black hover:border-white">
            Apri Piano
          </Link>
        </section>
      )}

    </div>
  );
}
