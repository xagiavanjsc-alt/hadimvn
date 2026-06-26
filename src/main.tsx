import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'remixicon/fonts/remixicon.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { migrateStorageKeys } from './utils/migrateStorageKeys'

// ─── Polyfill requestIdleCallback for Safari ───────────────────────────────────────
// Safari doesn't support requestIdleCallback, so polyfill with setTimeout
type IdleWindow = Window & {
  requestIdleCallback?: (cb: IdleRequestCallback, options?: { timeout?: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};
if (!('requestIdleCallback' in window)) {
  const w = window as IdleWindow;
  w.requestIdleCallback = (cb, _options) => {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
      });
    }, 1) as unknown as number;
  };
  w.cancelIdleCallback = (id) => clearTimeout(id);
}

// ─── Run localStorage key migration ─────────────────────────────────────────────────
// Migrate old kts_* keys to new keys for consistency
try {
  migrateStorageKeys();
} catch (error) {
  console.warn("Storage migration skipped due to runtime error:", error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

// ─── Register Service Worker ───────────────────────────────────────────────────────────────────
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // Check for updates every 60 seconds
        setInterval(() => reg.update(), 60 * 1000);
      })
      .catch(() => {
        // SW registration failed silently
      });
  });
}
