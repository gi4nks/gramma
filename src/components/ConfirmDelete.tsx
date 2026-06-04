"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface Props {
  onConfirm: () => void;
  label?: string;
  itemName?: string;
}

export function ConfirmDelete({ onConfirm, label = "Elimina", itemName }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={label}
        className="btn btn-ghost btn-xs text-error opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto min-h-0"
      >
        <Trash2 size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="bg-base-100 rounded-3xl shadow-2xl border border-base-200 p-8 max-w-sm mx-4 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-error/10 p-3 rounded-2xl text-error">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-black text-lg">Conferma eliminazione</h3>
                {itemName && <p className="text-sm opacity-60 truncate max-w-[200px]">{itemName}</p>}
              </div>
            </div>
            <p className="text-sm opacity-70 mb-6">Questa azione è irreversibile. Procedere?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="btn btn-ghost rounded-xl gap-2"
              >
                <X size={16} /> Annulla
              </button>
              <form action={onConfirm}>
                <button
                  type="submit"
                  className="btn btn-error rounded-xl gap-2 shadow-lg shadow-error/20"
                >
                  <Trash2 size={16} /> Elimina
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
