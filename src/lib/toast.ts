export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type ToastListener = (toast: Toast) => void;

let listener: ToastListener | null = null;

export function showToast(message: string, type: ToastType = "info") {
  const toast: Toast = { id: crypto.randomUUID(), message, type };
  listener?.(toast);
}

export function onToast(cb: ToastListener) {
  listener = cb;
  return () => { listener = null; };
}
