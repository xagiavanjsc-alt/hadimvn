import { useEffect, useState } from "react";

export type ToastType = "info" | "success" | "warning" | "error";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const TYPE_STYLES = {
  info: {
    bg: "bg-[#1a1d27]",
    border: "border-blue-500/30",
    icon: "ri-information-line",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    textColor: "text-blue-200",
  },
  success: {
    bg: "bg-[#1a1d27]",
    border: "border-emerald-500/30",
    icon: "ri-check-line",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    textColor: "text-emerald-200",
  },
  warning: {
    bg: "bg-[#1a1d27]",
    border: "border-amber-500/30",
    icon: "ri-timer-line",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    textColor: "text-amber-200",
  },
  error: {
    bg: "bg-[#1a1d27]",
    border: "border-red-500/30",
    icon: "ri-error-warning-line",
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
    textColor: "text-red-200",
  },
};

export default function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const style = TYPE_STYLES[type];

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-2xl ${style.bg} border ${style.border} shadow-lg shadow-black/40 animate-[fadeInDown_0.3s_ease] max-w-sm`}
      >
        <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${style.iconBg} flex-shrink-0`}>
          <i className={`${style.icon} text-lg ${style.iconColor}`}></i>
        </div>
        <p className={`${style.textColor} text-sm font-medium`}>{message}</p>
      </div>
    </div>
  );
}

// Hook for using toast in components
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType; duration: number } | null>(null);

  const showToast = (message: string, type: ToastType = "info", duration: number = 3000) => {
    setToast({ message, type, duration });
  };

  const ToastComponent = () => {
    if (!toast) return null;
    return <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={() => setToast(null)} />;
  };

  return { showToast, ToastComponent };
}
