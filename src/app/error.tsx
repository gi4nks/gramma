"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="bg-error/10 p-6 rounded-full text-error">
        <AlertTriangle size={48} />
      </div>
      <h1 className="text-4xl font-black italic">Qualcosa è andato storto</h1>
      <p className="text-lg opacity-60 max-w-md">
        Errore durante il caricamento. Riprova o torna alla dashboard.
      </p>
      <div className="flex gap-4 mt-4">
        <button
          onClick={reset}
          className="btn btn-primary btn-lg rounded-2xl gap-3 shadow-lg shadow-primary/20"
        >
          <RefreshCw size={20} /> Riprova
        </button>
        <a href="/" className="btn btn-ghost btn-lg rounded-2xl">
          Dashboard
        </a>
      </div>
    </div>
  );
}
