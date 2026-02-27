"use client";

import { useState } from "react";
import { Plus, Trash2, Save, ChefHat, Loader2, X } from "lucide-react";
import { addManualRecipe } from "@/app/actions/recipes";

export function RecipeManualForm({ modalId }: { modalId: string }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", quantity: 1, unit: "pz" }]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: 1, unit: "pz" }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: string, value: string | number) => {
    const newIngredients = [...ingredients];
    (newIngredients[index] as any)[field] = value;
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addManualRecipe({ name, tags, ingredients });
      // Reset form
      setName("");
      setTags("");
      setIngredients([{ name: "", quantity: 1, unit: "pz" }]);
      // Close modal
      const checkbox = document.getElementById(modalId) as HTMLInputElement;
      if (checkbox) checkbox.checked = false;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-box rounded-[2rem] max-w-2xl w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary">
            <ChefHat size={24} />
          </div>
          <h3 className="font-black text-xl italic uppercase">Nuova Ricetta Personale</h3>
        </div>
        <label htmlFor={modalId} className="btn btn-ghost btn-circle">
          <X size={20} />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label"><span className="label-text font-bold opacity-50 text-[10px] tracking-widest">NOME RICETTA</span></label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es: Pasta della Nonna" 
              className="input input-bordered rounded-xl" 
              required 
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text font-bold opacity-50 text-[10px] tracking-widest">TAG (separati da virgola)</span></label>
            <input 
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Es: primo, tradizione, veloce" 
              className="input input-bordered rounded-xl" 
            />
          </div>
        </div>

        <div className="divider text-[10px] font-black opacity-30 tracking-widest">INGREDIENTI</div>

        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto px-1">
          {ingredients.map((ing, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <input 
                  value={ing.name}
                  onChange={(e) => updateIngredient(index, "name", e.target.value)}
                  placeholder="Nome ingrediente" 
                  className="input input-bordered input-sm w-full rounded-lg" 
                  required 
                />
              </div>
              <div className="w-20">
                <input 
                  type="number"
                  step="0.1"
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(index, "quantity", parseFloat(e.target.value))}
                  className="input input-bordered input-sm w-full rounded-lg" 
                  required 
                />
              </div>
              <div className="w-20">
                <input 
                  value={ing.unit}
                  onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                  placeholder="Unità" 
                  className="input input-bordered input-sm w-full rounded-lg" 
                  required 
                />
              </div>
              <button 
                type="button" 
                onClick={() => removeIngredient(index)}
                className="btn btn-ghost btn-sm text-error"
                disabled={ingredients.length === 1}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button 
          type="button" 
          onClick={addIngredient}
          className="btn btn-ghost btn-sm self-start gap-2 opacity-60 hover:opacity-100"
        >
          <Plus size={16} /> Aggiungi ingrediente
        </button>

        <div className="modal-action">
          <button 
            type="submit" 
            className="btn btn-primary px-10 shadow-lg shadow-primary/20 rounded-2xl"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Salva Ricetta
          </button>
        </div>
      </form>
    </div>
  );
}
