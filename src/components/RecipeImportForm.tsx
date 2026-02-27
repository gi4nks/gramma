"use client";

import { useState } from "react";
import { Link as LinkIcon, Loader2, Sparkles } from "lucide-react";
import { addRecipeFromUrl } from "@/app/actions/recipes";

export function RecipeImportForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await addRecipeFromUrl(formData);
      const form = document.getElementById("import-form") as HTMLFormElement;
      form?.reset();
    } catch (e) {
      setError("Errore durante l'importazione. Riprova con un altro link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg border border-primary/20 overflow-hidden">
      <div className="card-body p-6 md:p-10">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-black italic flex items-center justify-center md:justify-start gap-2 text-primary">
              <Sparkles size={24} /> Nuova Ricetta?
            </h2>
            <p className="text-sm opacity-70 mt-1">Incolla l&apos;URL e noi penseremo a tutto il resto.</p>
          </div>
          
          <form id="import-form" action={handleSubmit} className="w-full md:w-2/3">
            <div className="join w-full shadow-xl">
              <div className="relative flex-1 join-item">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
                <input
                  name="url"
                  type="url"
                  placeholder="https://ricette.giallozafferano.it/..."
                  className={`input input-bordered w-full pl-12 h-14 ${error ? 'input-error' : ''}`}
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn btn-primary h-14 px-8 join-item" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span className="hidden md:inline">Analisi...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon size={20} />
                    <span>Importa</span>
                  </>
                )}
              </button>
            </div>
            {error && <p className="text-error text-xs font-bold mt-2 text-center md:text-left">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
