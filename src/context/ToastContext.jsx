import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message }) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, type, title, message }]);
      window.setTimeout(() => removeToast(id), type === "error" ? 6500 : 4200);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] || Info;

          return (
            <div
              key={toast.id}
              className="pointer-events-auto rounded-2xl border border-white/80 bg-white/95 p-4 shadow-soft backdrop-blur"
              role="status"
            >
              <div className="flex gap-3">
                <Icon
                  className={`mt-0.5 h-5 w-5 flex-none ${
                    toast.type === "error"
                      ? "text-blush-500"
                      : toast.type === "success"
                        ? "text-sage-500"
                        : "text-aura-600"
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  {toast.title ? (
                    <p className="text-sm font-semibold text-ink-900">{toast.title}</p>
                  ) : null}
                  {toast.message ? (
                    <p className="mt-1 text-sm leading-6 text-ink-600">{toast.message}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="focus-ring -m-1 rounded-full p-1 text-ink-600 transition hover:bg-aura-50 hover:text-ink-900"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Fechar aviso"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast deve ser usado dentro de ToastProvider.");
  return context;
}
