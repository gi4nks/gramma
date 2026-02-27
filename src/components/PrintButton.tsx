"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="btn btn-primary w-full h-full no-print gap-2 shadow-lg shadow-primary/20"
    >
      <Printer size={18} />
      Stampa Lista
    </button>
  );
}
