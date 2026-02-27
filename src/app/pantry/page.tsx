import { db } from "@/lib/db";
import { addOrUpdatePantryItem, deletePantryItem, adjustPantryQuantity } from "@/app/actions/pantry";
import { Trash2, Plus, Minus, Search, Refrigerator, PlusCircle, ArrowUpDown } from "lucide-react";
import Link from "next/link";

export default async function PantryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const [pantryItems, allIngredients] = await Promise.all([
    db.pantryItem.findMany({
      where: search ? {
        ingredient: {
          name: { contains: search }
        }
      } : {},
      include: { ingredient: true },
      orderBy: { ingredient: { name: "asc" } },
    }),
    db.ingredient.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="w-full flex flex-col gap-6 py-2">
      
      <datalist id="ingredients-list">
        {allIngredients.map((ing) => (
          <option key={ing.id} value={ing.name} />
        ))}
      </datalist>

      {/* Header Slim & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-base-100 p-5 rounded-3xl shadow-sm border border-base-200">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Refrigerator size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Dispensa</h1>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{pantryItems.length} Articoli</p>
          </div>
        </div>
        
        <form method="GET" className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={16} />
          <input 
            name="search"
            defaultValue={search}
            placeholder="Filtra ingredienti in lista..."
            className="input input-bordered w-full pl-10 rounded-xl bg-base-200/50 border-none focus:bg-base-100 transition-all h-10 text-sm"
          />
          {search && (
            <Link href="/pantry" className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-40 hover:opacity-100">
              CANCELLA
            </Link>
          )}
        </form>
      </div>

      {/* Quick Add Row - Compatta */}
      <div className="bg-base-100 p-4 rounded-3xl shadow-sm border border-base-200">
        <form action={addOrUpdatePantryItem} className="flex flex-wrap md:flex-nowrap gap-3 items-end">
          <div className="form-control flex-1 min-w-[200px]">
            <label className="label py-1"><span className="label-text text-[9px] font-bold opacity-40 uppercase">Nome Ingrediente</span></label>
            <input 
              name="name" 
              list="ingredients-list"
              placeholder="Es: Farina 00" 
              className="input input-bordered rounded-lg w-full h-9 text-sm" 
              required 
            />
          </div>
          <div className="form-control w-20">
            <label className="label py-1"><span className="label-text text-[9px] font-bold opacity-40 uppercase">Q.tà</span></label>
            <input name="quantity" type="number" step="0.1" placeholder="1" className="input input-bordered rounded-lg w-full h-9 text-sm" required />
          </div>
          <div className="form-control w-24">
            <label className="label py-1"><span className="label-text text-[9px] font-bold opacity-40 uppercase">Unità</span></label>
            <input name="unit" placeholder="kg, l, pz" className="input input-bordered rounded-lg w-full h-9 text-sm" required />
          </div>
          <button type="submit" className="btn btn-primary btn-sm rounded-lg h-9 px-4 shadow-md shadow-primary/20">
            <PlusCircle size={16} /> <span>Aggiungi</span>
          </button>
        </form>
      </div>

      {/* Inventory List - Professional Table Style */}
      <div className="bg-base-100 rounded-3xl shadow-sm border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="bg-base-200/30 border-none text-[9px] font-black uppercase tracking-widest opacity-50">
                <th className="py-3 pl-8">Ingrediente <ArrowUpDown size={8} className="inline ml-1"/></th>
                <th className="py-3 text-center">Quantità</th>
                <th className="py-3">Unità</th>
                <th className="py-3 text-right pr-8">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {pantryItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center italic text-xs opacity-30">
                    {search ? `Nessun risultato per "${search}"` : "La dispensa è vuota."}
                  </td>
                </tr>
              ) : (
                pantryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="py-3 pl-8">
                      <span className="font-semibold text-sm capitalize">{item.ingredient.name}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-center gap-2">
                        <form action={adjustPantryQuantity.bind(null, item.id, -1)}>
                          <button className="btn btn-square btn-ghost btn-xs border border-base-300 h-7 w-7">
                            <Minus size={12} />
                          </button>
                        </form>
                        
                        <div className="w-12 text-center">
                          <span className="text-base font-bold">{item.quantity}</span>
                        </div>
                        
                        <form action={adjustPantryQuantity.bind(null, item.id, 1)}>
                          <button className="btn btn-square btn-ghost btn-xs border border-base-300 h-7 w-7">
                            <Plus size={12} />
                          </button>
                        </form>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="badge badge-ghost font-bold text-[9px] uppercase opacity-60">{item.unit}</span>
                    </td>
                    <td className="py-3 text-right pr-8">
                      <form action={deletePantryItem.bind(null, item.id)}>
                        <button className="btn btn-ghost btn-xs text-error/20 hover:text-error hover:bg-error/10 rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center mt-2">
        <Link href="/shopping-list" className="btn btn-ghost btn-xs gap-2 font-bold opacity-30 hover:opacity-100 transition-all">
          VAI ALLA LISTA DELLA SPESA <PlusCircle size={14} />
        </Link>
      </div>
    </div>
  );
}
