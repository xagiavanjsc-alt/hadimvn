import { createContext, useContext, useState, useCallback, ReactNode, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type AdminToastType = "approve" | "reject" | "delete" | "restore" | "ban" | "vip" | "role" | "backup" | "success" | "error" | "info";

export interface AdminToastItem {
  id: string;
  type: AdminToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface AdminToastContextValue {
  toasts: AdminToastItem[];
  showToast: (toast: Omit<AdminToastItem, "id">) => void;
  dismissToast: (id: string) => void;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const TOAST_CONFIG: Record<AdminToastType, { icon: string; color: string; bg: string; border: string }> = {
  approve: { icon: "ri-checkbox-circle-line", color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)" },
  reject:  { icon: "ri-close-circle-line",    color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" },
  delete:  { icon: "ri-delete-bin-line",       color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" },
  restore: { icon: "ri-refresh-line",          color: "#fb923c", bg: "rgba(251,146,60,0.12)",  border: "rgba(251,146,60,0.3)" },
  ban:     { icon: "ri-user-forbid-line",      color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" },
  vip:     { icon: "ri-vip-crown-line",        color: "#e8c84a", bg: "rgba(232,200,74,0.12)",  border: "rgba(232,200,74,0.3)" },
  role:    { icon: "ri-shield-keyhole-line",   color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)" },
  backup:  { icon: "ri-save-line",             color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)" },
  success: { icon: "ri-checkbox-circle-line",  color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)" },
  error:   { icon: "ri-error-warning-line",    color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" },
  info:    { icon: "ri-information-line",      color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)" },
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AdminToastContext = createContext<AdminToastContextValue | null>(null);

// ─── Toast Item Component ─────────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: AdminToastItem; onDismiss: (id: string) => void }) {
  const cfg = TOAST_CONFIG[toast.type];
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md animate-[slideInRight_0.25s_ease-out]"
      style={{
        backgroundColor: "var(--admin-card, #1e2030)",
        borderColor: cfg.border,
        minWidth: "280px",
        maxWidth: "360px",
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${cfg.border}`,
      }}
    >
      <div
        className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5"
        style={{ backgroundColor: cfg.bg }}
      >
        <i className={`${cfg.icon} text-sm`} style={{ color: cfg.color }}></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold leading-tight" style={{ color: "var(--admin-text, #f1f5f9)" }}>
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--admin-text-muted, #94a3b8)" }}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="w-5 h-5 flex items-center justify-center rounded cursor-pointer flex-shrink-0 mt-0.5 transition-opacity hover:opacity-70"
        style={{ color: "var(--admin-text-faint, #64748b)" }}
      >
        <i className="ri-close-line text-xs"></i>
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<AdminToastItem[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const showToast = useCallback((toast: Omit<AdminToastItem, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = toast.duration ?? 4000;
    setToasts(prev => [...prev.slice(-4), { ...toast, id }]);
    timersRef.current[id] = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      delete timersRef.current[id];
    }, duration);
  }, []);

  return (
    <AdminToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      {/* Toast container */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
          style={{ pointerEvents: "none" }}
        >
          {toasts.map(t => (
            <div key={t.id} style={{ pointerEvents: "auto" }}>
              <ToastItem toast={t} onDismiss={dismissToast} />
            </div>
          ))}
        </div>
      )}
    </AdminToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) throw new Error("useAdminToast must be used within AdminToastProvider");
  return ctx;
}
