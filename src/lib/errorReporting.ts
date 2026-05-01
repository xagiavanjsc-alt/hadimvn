// ─── Error Reporting Service ──────────────────────────────────────────────
// Sends errors to admin panel instead of console.logging

interface ErrorReport {
  type: string;
  message: string;
  userId?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  stack?: string;
}

const ERROR_QUEUE: ErrorReport[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

function flushErrors() {
  if (ERROR_QUEUE.length === 0) return;
  
  const errors = [...ERROR_QUEUE];
  ERROR_QUEUE.length = 0;
  
  // Send to Supabase (fire and forget)
  fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/rest/v1/error_logs`, {
    method: 'POST',
    headers: {
      'apikey': import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || '',
      'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || ''}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(errors.map(e => ({
      type: e.type,
      message: e.message,
      user_id: e.userId,
      url: e.url,
      user_agent: e.userAgent,
      stack: e.stack,
    })))
  }).catch(() => {
    // If error logging fails, silently drop to avoid infinite loops
  });
}

function scheduleFlush() {
  if (flushTimeout) return;
  flushTimeout = setTimeout(() => {
    flushTimeout = null;
    flushErrors();
  }, 5000);
}

export function reportError({
  type,
  message,
  userId,
  stack,
}: {
  type: string;
  message: string;
  userId?: string;
  stack?: string;
}) {
  const report: ErrorReport = {
    type,
    message,
    userId,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    stack,
  };
  
  ERROR_QUEUE.push(report);
  scheduleFlush();
  
  // Also log to console in development
  if (import.meta.env.DEV) {
    console.error(`[${type}]`, message);
  }
}

// Global error handler
window.addEventListener('error', (event) => {
  reportError({
    type: 'GLOBAL_ERROR',
    message: event.message,
    stack: event.error?.stack,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason instanceof Error ? event.reason.message : String(event.reason);
  const stack = event.reason instanceof Error ? event.reason.stack : undefined;
  
  reportError({
    type: 'UNHANDLED_PROMISE_REJECTION',
    message,
    stack,
  });
});
