import { lazy, Suspense, Component, ReactNode } from "react";
import PageSkeleton from "@/components/base/PageSkeleton";

export type SkeletonVariant = "dashboard" | "full" | "vocab" | "exam" | "flashcard";

interface ErrorBoundaryProps { children: ReactNode; name?: string }
interface ErrorBoundaryState { hasError: boolean; error?: Error }

export class LazyErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <i className="ri-error-warning-line text-4xl text-red-400"></i>
          <h2 className="text-white text-lg font-semibold">Đã xảy ra lỗi</h2>
          <p className="text-white/50 text-sm text-center max-w-md">{this.state.error?.message || "Không thể tải trang này. Thử lại sau."}</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="mt-2 px-5 py-2 rounded-lg bg-app-accent-primary text-app-bg font-semibold text-sm hover:bg-app-accent-primary/90 transition-colors cursor-pointer">Tải lại trang</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function lazyPage(
  factory: () => Promise<{ default: React.ComponentType<unknown> }>,
  skeleton: SkeletonVariant = "dashboard"
) {
  const LazyComponent = lazy(factory);
  return function LazyRouteWrapper() {
    return (
      <LazyErrorBoundary>
        <Suspense fallback={<PageSkeleton variant={skeleton} />}>
          <LazyComponent />
        </Suspense>
      </LazyErrorBoundary>
    );
  };
}

const preloadCache = new Set<string>();
const abortControllers = new Map<string, AbortController>();

export function preload(factory: () => Promise<unknown>, key: string) {
  if (preloadCache.has(key)) return;
  preloadCache.add(key);

  const controller = new AbortController();
  abortControllers.set(key, controller);

  factory().catch(() => {/* ignore */}).finally(() => {
    abortControllers.delete(key);
  });
}

export function cancelPreloads() {
  abortControllers.forEach((controller) => controller.abort());
  abortControllers.clear();
}
