"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check } from "lucide-react";

type ToastInput = {
  title: string;
  description?: string;
};

type ToastItem = ToastInput & { id: number };

type ToastContextValue = {
  push: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue>({ push: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const nextId = useRef(1);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((toast: ToastInput) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3400);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-2xl border border-white/10 bg-ink px-4 py-3 text-cream shadow-lift"
          >
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-butter text-ink">
              <Check aria-hidden="true" className="size-3.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{toast.title}</span>
              {toast.description && (
                <span className="mt-0.5 block text-xs leading-relaxed text-cream/60">
                  {toast.description}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
