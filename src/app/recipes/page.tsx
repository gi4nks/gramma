import { db } from "@/lib/db";
import { deleteRecipe } from "@/app/actions/recipes";
import { Trash2, ExternalLink, ChevronDown, ChevronLeft, ChevronRight, SortAsc, Clock, Search as SearchIcon, Plus } from "lucide-react";
import { RecipeImportForm } from "@/components/RecipeImportForm";
import { RecipeManualForm } from "@/components/RecipeManualForm";
import Link from "next/link";
import { Prisma } from "@prisma/client";

const PAGE_SIZE = 12;

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; sort?: string }>;
}) {
  const { search, page, sort } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1"));
  const currentSort = sort || "newest";

  let orderBy: Prisma.RecipeOrderByWithRelationInput = { name: "asc" };
  if (currentSort === "newest") orderBy = { id: "desc" };
  if (currentSort === "name_desc") orderBy = { name: "desc" };

  // Definizione filtri di ricerca globali (Nome OR Ingredienti)
  const whereClause: Prisma.RecipeWhereInput = search ? {
    OR: [
      { name: { contains: search } },
      {
        ingredients: {
          some: {
            ingredient: {
              name: { contains: search }
            }
          }
        }
      }
    ]
  } : {};

  const [recipes, totalCount] = await Promise.all([
    db.recipe.findMany({
      where: whereClause,
      include: { ingredients: { include: { ingredient: true } } },
      orderBy: orderBy,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.recipe.count({
      where: whereClause,
    })
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-10 w-full">
      {/* 1. Header & Import (Full Width) */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end px-2 md:px-0">
          <h1 className="text-4xl font-black italic text-base-content">Le tue Ricette</h1>
          
          <label htmlFor="modal-manual-recipe" className="btn btn-primary rounded-2xl gap-2 shadow-lg shadow-primary/20">
            <Plus size={20} />
            <span className="hidden md:inline">Crea Manualmente</span>
          </label>
        </div>

        <RecipeImportForm />

        {/* Modal per ricetta manuale */}
        <input type="checkbox" id="modal-manual-recipe" className="modal-toggle" />
        <div className="modal" role="dialog">
          <RecipeManualForm modalId="modal-manual-recipe" />
          <label className="modal-backdrop" htmlFor="modal-manual-recipe">Close</label>
        </div>
      </div>

      {/* 2. Toolbar: Search & Sort */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-base-100 p-4 rounded-2xl shadow-sm border border-base-200">
        <p className="text-sm font-bold opacity-50 px-2">
          {totalCount} RICETTE TROVATE
        </p>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <form className="join flex-1 md:flex-none">
            <div className="relative join-item flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18} />
              <input 
                name="search" 
                defaultValue={search}
                placeholder="Cerca per nome..." 
                className="input input-bordered pl-10 w-full"
              />
            </div>
            <button type="submit" className="btn btn-ghost join-item border-base-300">Cerca</button>
          </form>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-outline gap-2 border-base-300">
              {currentSort === "newest" ? <Clock size={18}/> : <SortAsc size={18}/>}
              Ordina
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box w-52 border border-base-300">
              <li><Link href={`/recipes?sort=newest&search=${search || ""}`}>Ultime aggiunte</Link></li>
              <li><Link href={`/recipes?sort=name_asc&search=${search || ""}`}>Dalla A alla Z</Link></li>
              <li><Link href={`/recipes?sort=name_desc&search=${search || ""}`}>Dalla Z alla A</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Recipes Grid */}
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.length === 0 ? (
            <div className="col-span-full bg-base-100 border-2 border-dashed border-base-300 rounded-3xl py-24 text-center">
              <p className="italic opacity-40 text-xl">Nessuna ricetta corrisponde ai tuoi criteri.</p>
            </div>
          ) : (
            recipes.map((recipe) => (
              <div key={recipe.id} className="card bg-base-100 shadow-sm border border-base-200 hover:border-primary/40 transition-all hover:shadow-md group">
                <div className="card-body p-5">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="card-title text-lg capitalize line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {recipe.name}
                    </h3>
                    <form action={deleteRecipe.bind(null, recipe.id)}>
                      <button className="btn btn-ghost btn-xs text-error opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto min-h-0">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>

                  {/* Visualizzazione Tag */}
                  {recipe.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {recipe.tags.split(",").slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[9px] font-bold uppercase tracking-tighter bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <div className="badge badge-secondary badge-outline badge-xs py-2 px-3">{recipe.ingredients.length} ingredienti</div>
                    {recipe.sourceUrl && (
                      <a href={recipe.sourceUrl} target="_blank" className="btn btn-link btn-xs p-0 min-h-0 h-auto gap-1 no-underline opacity-50 hover:opacity-100 text-xs">
                        <ExternalLink size={12}/> Fonte
                      </a>
                    )}
                  </div>

                  <div className="collapse bg-base-200/40 mt-4 rounded-xl">
                    <input type="checkbox" className="peer" /> 
                    <div className="collapse-title text-[10px] font-black tracking-widest flex items-center justify-between py-2 min-h-0">
                      INGREDIENTI <ChevronDown size={14} className="transition-transform peer-checked:rotate-180 opacity-50"/>
                    </div>
                    <div className="collapse-content px-4"> 
                      <ul className="text-xs divide-y divide-base-300/50">
                        {recipe.ingredients.map((ri) => (
                          <li key={ri.id} className="py-2 flex justify-between gap-4">
                            <span className="capitalize opacity-80">{ri.ingredient.name}</span>
                            <span className="font-mono font-bold whitespace-nowrap">{ri.quantity} {ri.unit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 4. Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <div className="join shadow-md border border-base-300 bg-base-100">
              <Link 
                href={`/recipes?page=${currentPage - 1}&search=${search || ""}&sort=${currentSort}`}
                className={`join-item btn btn-ghost ${currentPage === 1 ? 'btn-disabled' : ''}`}
              >
                <ChevronLeft size={20}/>
              </Link>
              <button className="join-item btn btn-ghost no-animation pointer-events-none font-bold">
                {currentPage} / {totalPages}
              </button>
              <Link 
                href={`/recipes?page=${currentPage + 1}&search=${search || ""}&sort=${currentSort}`}
                className={`join-item btn btn-ghost ${currentPage === totalPages ? 'btn-disabled' : ''}`}
              >
                <ChevronRight size={20}/>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
