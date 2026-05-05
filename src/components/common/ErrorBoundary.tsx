import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isWebSocketError: boolean;
  autoRecovering: boolean;
}

// Keys to clear on WebSocket error (avoid stale auth/session causing crash on reload)
const CACHE_KEYS_TO_CLEAR = ["sb-auth-token", "supabase.auth.token"];

function isWebSocketError(error?: Error): boolean {
  if (!error) return false;
  const msg = error.message?.toLowerCase() || "";
  return (
    msg.includes("websocket") ||
    msg.includes("ws:") ||
    msg.includes("wss:") ||
    msg.includes("the operation is")
  );
}

export class ErrorBoundary extends Component<Props, State> {
  private autoRecoverTimer?: ReturnType<typeof setTimeout>;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isWebSocketError: false, autoRecovering: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const wsError = isWebSocketError(error);
    return { hasError: true, error, isWebSocketError: wsError, autoRecovering: wsError };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // If it's a WebSocket error, auto-recover after 1.5s
    if (isWebSocketError(error)) {
      this.autoRecoverTimer = setTimeout(() => {
        this.handleAutoRecover();
      }, 1500);
    }
  }

  componentWillUnmount() {
    if (this.autoRecoverTimer) clearTimeout(this.autoRecoverTimer);
  }

  handleAutoRecover = () => {
    // Clear potentially stale auth cache that may cause repeated WebSocket errors
    try {
      CACHE_KEYS_TO_CLEAR.forEach((key) => {
        try { localStorage.removeItem(key); } catch {}
        try { sessionStorage.removeItem(key); } catch {}
      });
      // Clear all supabase-related keys
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          try { localStorage.removeItem(key); } catch {}
        }
      });
    } catch {}
    // Redirect to home (not reload — avoids re-triggering same error)
    window.location.href = "/";
  };

  handleManualRecover = () => {
    this.handleAutoRecover();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // WebSocket error: show minimal UI + auto-recover countdown
      if (this.state.isWebSocketError) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-app-bg p-4">
            <div className="max-w-md w-full text-center">
              <div className="text-5xl mb-4">🔄</div>
              <h1 className="text-xl font-bold text-white mb-2">Đang khởi động lại...</h1>
              <p className="text-app-text-muted text-sm mb-6">
                Trình duyệt của bạn không hỗ trợ kết nối realtime. Ứng dụng vẫn hoạt động bình thường — đang về trang chủ...
              </p>
              <div className="w-full h-1 bg-app-surface rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-app-accent-primary rounded-full animate-pulse"
                  style={{ width: "100%" }}
                />
              </div>
              <button
                onClick={this.handleManualRecover}
                className="px-6 py-3 bg-app-accent-primary text-black font-semibold rounded-xl hover:bg-[#d4b43a] transition-colors"
              >
                Về trang chủ ngay
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-app-bg p-4">
          <div className="max-w-md w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-2">Có lỗi xảy ra</h1>
            <p className="text-app-text-muted mb-6">
              Đã có lỗi không mong muốn. Vui lòng tải lại trang.
            </p>
            {this.state.error && (
              <details className="text-left mb-6 p-4 bg-app-surface/50 rounded-xl border border-app-border">
                <summary className="text-xs text-app-text-muted cursor-pointer mb-2">
                  Chi tiết lỗi
                </summary>
                <pre className="text-xs text-red-400 overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-app-accent-primary text-black font-semibold rounded-xl hover:bg-[#d4b43a] transition-colors"
              >
                Tải lại trang
              </button>
              <button
                onClick={() => { window.location.href = "/"; }}
                className="px-6 py-3 bg-app-surface text-white font-semibold rounded-xl border border-app-border hover:border-white/30 transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
