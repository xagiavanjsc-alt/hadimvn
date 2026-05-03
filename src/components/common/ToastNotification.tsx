import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export function ToastNotification({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: { icon: "ri-checkbox-circle-fill", color: "#34d399", bg: "rgba(52, 211, 153, 0.1)", border: "rgba(52, 211, 153, 0.3)" },
    error: { icon: "ri-error-warning-fill", color: "#f87171", bg: "rgba(248, 113, 113, 0.1)", border: "rgba(248, 113, 113, 0.3)" },
    info: { icon: "ri-information-fill", color: "#60a5fa", bg: "rgba(96, 165, 250, 0.1)", border: "rgba(96, 165, 250, 0.3)" },
  };

  const cfg = config[type];

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 ${visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
      style={{
        backgroundColor: "rgba(26, 26, 38, 0.95)",
        borderColor: cfg.border,
        minWidth: "320px",
        maxWidth: "400px",
      }}
    >
      <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
        <i className={`${cfg.icon} text-lg`} style={{ color: cfg.color }}></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/90 text-sm font-medium leading-snug">{message}</p>
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 text-white/40 hover:text-white/70 transition-colors"
      >
        <i className="ri-close-line text-sm"></i>
      </button>
    </div>
  );
}

// Hook để sử dụng toast notification
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" | "info" }>>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { showToast, toasts, removeToast };
}

// Container component để render tất cả toasts
export function ToastContainer({ toasts, removeToast }: { toasts: Array<{ id: string; message: string; type: "success" | "error" | "info" }>, removeToast: (id: string) => void }) {
  return (
    <>
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}
