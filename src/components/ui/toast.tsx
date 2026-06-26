"use client";
import { useState, useEffect } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let toastQueue: ((toast: Omit<Toast, "id">) => void)[] = [];

export function showToast(toast: Omit<Toast, "id">) {
  toastQueue.forEach((fn) => fn(toast));
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };
    toastQueue.push(handler);
    return () => {
      toastQueue = toastQueue.filter((fn) => fn !== handler);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition-all
            ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                  ? "bg-red-500 text-white"
                  : "bg-white/10 text-white border border-white/20"
            }`}
        >
          {toast.type === "success" ? "✓ " : toast.type === "error" ? "✗ " : ""}
          {toast.message}
        </div>
      ))}
    </div>
  );
}
