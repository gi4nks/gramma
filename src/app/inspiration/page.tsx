import { db } from "@/lib/db";
import { normalizeQuantity, sanitizeIngredientName } from "@/lib/ingredients";
import { CheckCircle2, Sparkles, CalendarPlus, Search, X } from "lucide-react";
import Link from "next/link";
import { InspirationAddForm } from "@/components/InspirationAddForm";

const DAYS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
const MEALS = ["Colazione", "Pranzo", "Cena"];

interface RecipeWithInspiration extends Recipe {
  percent: number;
  missingCount: number;
  missingList: string[];
}

import { Recipe } from "@prisma/client";

export default async function InspirationPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; search?: string }>;
}) {
  const { filter, search } = await searchParams;
  const currentFilter = filter || "almost"; // Default su "Manca Poco" perché è il più utile
  const searchQuery = search?.toLowerCase() || "";

  const [recipes, pantry] = await Promise.all([
    db.recipe.findMany({
      include: { ingredients: { include: { ingredient: true } } }
    }),
    db.pantryItem.findMany({
      include: { ingredient: true }
    })
  ]);

  const IGNORED = ["acqua", "acqua tiepida", "acqua calda", "acqua fredda", "acqua (tiepida)", "sale", "sale fino", "sale grosso", "pepe", "olio", "sale marino"];

  const analyzedRecipes = recipes.map(recipe => {
    let matches = 0;
    let totalEssential = 0;
    const missing: string[] = [];

    recipe.ingredients.forEach(ri => {
      const name = ri.ingredient.name.toLowerCase();
      if (IGNORED.includes(name)) return;
      totalEssential++;
      const { value: reqVal, baseUnit: reqUnit } = normalizeQuantity(ri.quantity, ri.unit);
      const sanitizedReqName = sanitizeIngredientName(name);
      
      const pantryItem = pantry.find(p => {
        const sanitizedPantryName = sanitizeIngredientName(p.ingredient.name);
        return sanitizedPantryName === sanitizedReqName || 
               sanitizedPantryName.includes(sanitizedReqName) ||
               sanitizedReqName.includes(sanitizedPantryName);
      });

      if (pantryItem) {
        const { value: panVal, baseUnit: panUnit } = normalizeQuantity(pantryItem.quantity, pantryItem.unit);
        if (panUnit === reqUnit) {
          if (panVal >= reqVal) matches++;
          else missing.push(ri.ingredient.name);
        } else {
          if (pantryItem.quantity > 0) matches++;
          else missing.push(ri.ingredient.name);
        }
      } else {
        missing.push(ri.ingredient.name);
      }
    });

    const percent = totalEssential > 0 ? (matches / totalEssential) * 100 : 0;
    
    return {
      ...recipe,
      percent,
      missingCount: missing.length,
      missingList: missing
    };
  })
  .filter(r => {
    // Filtro ricerca testuale
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery)) return false;
    return true;
  })
  .sort((a, b) => b.percent - a.percent);

  const readyNow = analyzedRecipes.filter(r => r.percent === 100 && r.ingredients.length > 0);
  const almostReady = analyzedRecipes.filter(r => r.percent < 100 && r.percent >= 50);
  const others = analyzedRecipes.filter(r => r.percent < 50);

  let displayedRecipes = analyzedRecipes;
  if (currentFilter === "ready") displayedRecipes = readyNow;
  if (currentFilter === "almost") displayedRecipes = almostReady;
  if (currentFilter === "others") displayedRecipes = others;

  return (
    <div className="flex flex-col gap-6 w-full py-2 pb-20">
      
      {/* 1. Header Dinamico */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-base-100 p-4 rounded-3xl shadow-sm border border-base-200">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-secondary/10 p-2 rounded-xl text-secondary">
            <Sparkles size={24} />
          </div>
          <h1 className="text-xl font-black italic">Ispirazione</h1>
        </div>

        {/* Search Bar */}
        <form className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={18} />
          <input 
            name="search"
            defaultValue={search}
            placeholder="Cerca tra i piatti fattibili..."
            className="input input-bordered w-full pl-12 rounded-2xl bg-base-200/50 border-none focus:bg-base-100 h-11 text-sm"
          />
          {search && (
            <Link href="/inspiration" className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle">
              <X size={14} />
            </Link>
          )}
        </form>

        {/* Filter Tabs Compact */}
        <div className="tabs tabs-boxed bg-base-200 rounded-2xl p-1">
          <Link href={`/inspiration?filter=ready&search=${search || ""}`} className={`tab tab-sm rounded-xl font-bold text-[10px] ${currentFilter === "ready" ? "tab-active bg-success text-success-content" : ""}`}>PRONTI ({readyNow.length})</Link>
          <Link href={`/inspiration?filter=almost&search=${search || ""}`} className={`tab tab-sm rounded-xl font-bold text-[10px] ${currentFilter === "almost" ? "tab-active bg-warning text-warning-content" : ""}`}>MANCA POCO ({almostReady.length})</Link>
          <Link href={`/inspiration?filter=others&search=${search || ""}`} className={`tab tab-sm rounded-xl font-bold text-[10px] ${currentFilter === "others" ? "tab-active bg-neutral text-neutral-content" : ""}`}>ALTRE ({others.length})</Link>
          <Link href={`/inspiration?filter=all&search=${search || ""}`} className={`tab tab-sm rounded-xl font-bold text-[10px] ${currentFilter === "all" ? "tab-active bg-primary text-primary-content" : ""}`}>TUTTE</Link>
        </div>
      </div>

      {/* 2. Compact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {displayedRecipes.length === 0 ? (
          <div className="col-span-full py-24 bg-base-100 rounded-[2rem] border-2 border-dashed border-base-300 text-center opacity-40">
            <p className="italic">Nessuna ricetta trovata con questi filtri.</p>
          </div>
        ) : (
          displayedRecipes.map(recipe => (
            <RecipeDenseCard key={recipe.id} recipe={recipe as RecipeWithInspiration} />
          ))
        )}
      </div>
    </div>
  );
}

function RecipeDenseCard({ recipe }: { recipe: RecipeWithInspiration }) {
  const modalId = `modal-plan-${recipe.id}`;
  const isReady = recipe.percent === 100;
  const isAlmost = recipe.percent >= 50 && recipe.percent < 100;

  return (
    <div className={`card bg-base-100 shadow-sm hover:shadow-md transition-all border border-base-200 rounded-3xl overflow-hidden group flex flex-col h-full`}>
      <div className="p-5 flex flex-col h-full gap-3">
        
        {/* Header: Title & Action */}
        <div className="flex justify-between items-start gap-2">
          <Link href={`/recipes?search=${recipe.name}`} className="flex-1">
            <h3 className="text-sm font-black leading-tight group-hover:text-primary transition-colors capitalize line-clamp-2">{recipe.name}</h3>
          </Link>
          <label 
            htmlFor={modalId} 
            className="btn btn-ghost btn-xs btn-circle bg-base-200 group-hover:bg-primary group-hover:text-white transition-all cursor-pointer shadow-sm flex-shrink-0"
          >
            <CalendarPlus size={14} />
          </label>
        </div>

        {/* Percentage Badge */}
        <div className="flex items-center gap-2">
          <div className={`h-1.5 flex-1 bg-base-200 rounded-full overflow-hidden`}>
            <div 
              className={`h-full transition-all ${isReady ? 'bg-success' : isAlmost ? 'bg-warning' : 'bg-neutral'}`}
              style={{ width: `${recipe.percent}%` }}
            ></div>
          </div>
          <span className="text-[9px] font-black opacity-40">{Math.round(recipe.percent)}%</span>
        </div>

        {/* Missing Section */}
        <div className="flex-1">
          {isReady ? (
            <div className="flex items-center gap-1.5 text-success text-[10px] font-bold">
              <CheckCircle2 size={12} /> DISPONIBILE ORA
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Da comprare:</span>
              <div className="flex flex-wrap gap-1">
                {recipe.missingList.map((m: string, i: number) => (
                   <span key={i} className="text-[10px] font-bold text-error/70 bg-error/5 border border-error/10 px-2 py-0.5 rounded-lg leading-tight">
                     {m}
                   </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Tags */}
        {recipe.tags && (
          <div className="flex flex-wrap gap-1 border-t border-base-200 pt-3 mt-1">
            {recipe.tags.split(',').slice(0, 2).map((tag: string, i: number) => (
              <span key={i} className="text-[8px] font-black opacity-30 uppercase tracking-tighter">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Modal Integration */}
      <input type="checkbox" id={modalId} className="modal-toggle" />
      <div className="modal" role="dialog">
        <InspirationAddForm 
          recipeId={recipe.id}
          recipeName={recipe.name}
          modalId={modalId}
          days={DAYS}
          meals={MEALS}
        />
        <label className="modal-backdrop" htmlFor={modalId}>Close</label>
      </div>
    </div>
  );
}
