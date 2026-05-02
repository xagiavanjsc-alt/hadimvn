import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);

    // Auto-recover from stale chunk errors after Vercel redeploy
    // Browser has cached old index.html → tries to fetch old chunk hash → fails
    const msg = error?.message || "";
    const isStaleChunkError =
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("Importing a module script failed") ||
      msg.includes("error loading dynamically imported module") ||
      /Loading chunk .+ failed/.test(msg);

    if (isStaleChunkError) {
      // Prevent infinite reload loop
      const RELOAD_KEY = "kts_chunk_reload_at";
      const lastReload = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
      if (Date.now() - lastReload > 10000) {
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
        console.log("[ErrorBoundary] Stale chunk detected — clearing cache & reloading");
        // Clear service worker cache + hard reload
        if ("caches" in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then(regs => {
            regs.forEach(r => r.unregister());
          });
        }
        setTimeout(() => window.location.reload(), 100);
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center px-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
              <i className="ri-error-warning-line text-red-400 text-2xl"></i>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Ôi, có lỗi xảy ra rồi!</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Trang này gặp sự cố không mong muốn. Thử tải lại hoặc quay về trang chủ nhé.
            </p>
            {this.state.error && (
              <details className="mb-5 text-left">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 mb-2">Chi tiết lỗi (dành cho dev)</summary>
                <pre className="text-xs bg-gray-100 rounded-xl p-3 overflow-auto text-red-500 max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-[#22c55e] text-white text-sm font-semibold hover:bg-[#16a34a] transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-refresh-line mr-1.5"></i>
                Thử lại
              </button>
              <a
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                <i className="ri-home-line mr-1.5"></i>
                Về trang chủ
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
