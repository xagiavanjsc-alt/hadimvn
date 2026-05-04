import { StrictMode } from 'react'
import './i18n'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'remixicon/fonts/remixicon.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/common/ErrorBoundary'

// ─── Polyfill requestIdleCallback for Safari ───────────────────────────────────────
// Safari doesn't support requestIdleCallback, so polyfill with setTimeout
if (!('requestIdleCallback' in window)) {
  (window as any).requestIdleCallback = (cb: IdleRequestCallback, options?: IdleRequestOptions) => {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
      });
    }, 1);
  };
  (window as any).cancelIdleCallback = (id: number) => clearTimeout(id);
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
