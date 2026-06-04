"use client";

import { useState, useEffect, useCallback } from "react";
import { onToast, type Toast } from "@/lib/toast";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: "bg-success text-success-content border-success/30",
  error: "bg-error text-error-content border-error/30",
  info: "bg-info text-info-content border-info/30",
  warning: "bg-warning text-warning-content border-warning/30",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return onToast((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3500);
    });
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-sm animate-slide-up ${COLORS[toast.type]}`}
          >
            <Icon size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-bold flex-1">{toast.message}</p>
            <button
              onClick={() => remove(toast.id)}
              className="btn btn-ghost btn-xs p-0 h-auto min-h-0 opacity-60 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
