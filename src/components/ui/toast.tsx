"use client";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  /** Errors persist until dismissed; everything else auto-dismisses. */
  sticky: boolean;
}

type ToastInput = {
  message: string;
  type: "success" | "error" | "info";
  /** Override the default: errors sticky, success/info transient. */
  sticky?: boolean;
};

let toastQueue: ((toast: ToastInput) => void)[] = [];

export function showToast(toast: ToastInput) {
  toastQueue.forEach((fn) => fn(toast));
}

const AUTO_DISMISS_MS = 4000;
const MAX_VISIBLE = 4;

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (toast: ToastInput) => {
      const id = Math.random().toString(36).slice(2);
      // A critical error must not vanish before the user can read or act on it.
      const sticky = toast.sticky ?? toast.type === "error";
      setToasts((prev) => [...prev, { ...toast, id, sticky }].slice(-MAX_VISIBLE));
      if (!sticky) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, AUTO_DISMISS_MS);
      }
    };
    toastQueue.push(handler);
    return () => {
      toastQueue = toastQueue.filter((fn) => fn !== handler);
    };
  }, []);

  return (
    <div
      className="fixed bottom-4 right-4 z-[2000] flex flex-col gap-2 max-w-[calc(100vw-2rem)] sm:max-w-sm"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-lg
            ${
              toast.type === "success"
                ? "bg-green-600 text-white"
                : toast.type === "error"
                  ? "bg-red-600 text-white"
                  : "bg-neutral-800 text-white border border-white/20"
            }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          ) : toast.type === "error" ? (
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <span className="flex-1 min-w-0">{toast.message}</span>
          <button
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            className="shrink-0 -mr-1 -mt-0.5 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
