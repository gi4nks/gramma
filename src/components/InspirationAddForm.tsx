"use client";

import { useState } from "react";
import { addToWeeklyPlan } from "@/app/actions/weekly-plan";
import { Utensils, Loader2 } from "lucide-react";

interface Props {
  recipeId: string;
  recipeName: string;
  modalId: string;
  days: string[];
  meals: string[];
}

export function InspirationAddForm({ recipeId, recipeName, modalId, days, meals }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await addToWeeklyPlan(formData);
      // Chiude il modal deselezionando il checkbox
      const checkbox = document.getElementById(modalId) as HTMLInputElement;
      if (checkbox) checkbox.checked = false;
    } catch (e) {
      console.error("Errore durante la pianificazione", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-box rounded-[2rem]">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-2xl text-primary">
          <Utensils size={24} />
        </div>
        <h3 className="font-black text-xl italic uppercase truncate">{recipeName}</h3>
      </div>

      <form action={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="recipeId" value={recipeId} />

        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold opacity-50 text-[10px] tracking-widest uppercase">GIORNO</span>
          </label>
          <select 
            name="day" 
            className="select select-bordered w-full rounded-xl" 
            required 
            defaultValue=""
            disabled={loading}
          >
            <option value="" disabled>Scegli il giorno...</option>
            {days.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold opacity-50 text-[10px] tracking-widest uppercase">PASTO</span>
          </label>
          <select 
            name="mealType" 
            className="select select-bordered w-full rounded-xl" 
            required 
            defaultValue="Pranzo"
            disabled={loading}
          >
            {meals.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="modal-action">
          <label htmlFor={modalId} className={`btn btn-ghost ${loading ? 'btn-disabled' : ''}`}>
            Annulla
          </label>
          <button 
            type="submit" 
            className="btn btn-primary px-10 shadow-lg shadow-primary/20"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Aggiungi al Piano"}
          </button>
        </div>
      </form>
    </div>
  );
}
