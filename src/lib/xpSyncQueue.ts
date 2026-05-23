/**
 * Durable XP sync queue.
 *
 * The leaderboard kept showing "lúc được lúc không" because the original
 * implementation debounced the user_progress upsert by 1.5s and silently
 * swallowed errors — so any of these scenarios dropped XP forever on the
 * server side:
 *   - user earned XP and navigated away within the debounce window
 *   - network blip during the upsert
 *   - tab closed mid-flight
 *
 * This queue persists the latest pending payload per user in localStorage,
 * retries on a backoff schedule, drains on `online` / mount, and best-effort
 * fires a `fetch(..., { keepalive: true })` on `beforeunload` so the row
 * still lands even if the tab is about to die.
 */
import { supabase } from "@/lib/supabase";

const QUEUE_KEY = "kts_xp_sync_pending";
const MAX_ATTEMPTS = 6;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface XPSyncPayload {
  user_id: string;
  xp: number;
  level?: string;
  streak_count?: number;
  streak_last_date?: string | null;
  words_learned?: number;
  best_score?: number;
  last_active_at?: string;
  updated_at?: string;
}

interface QueuedItem {
  payload: XPSyncPayload;
  attempts: number;
  firstAttemptAt: number;
}

function loadQueue(): QueuedItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQueue(items: QueuedItem[]): void {
  try {
    if (items.length === 0) localStorage.removeItem(QUEUE_KEY);
    else localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch (e) {
    // Quota exceeded — log + try shedding oldest entries so the latest XP still lands
    console.warn("[xpSyncQueue] localStorage quota; trimming queue", e);
    try {
      // Keep only the last 5 items (most recent XP wins via GREATEST trigger anyway)
      const trimmed = items.slice(-5);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
    } catch {
      // Still over quota — drop the queue entirely rather than block the app
      try { localStorage.removeItem(QUEUE_KEY); } catch { /* nothing more we can do */ }
    }
  }
}

/**
 * Enqueue an XP sync. Coalesces multiple writes per user (latest wins),
 * which is safe because the server-side trigger uses GREATEST().
 */
export function enqueueXPSync(payload: XPSyncPayload): void {
  if (!payload.user_id) return;
  const q = loadQueue();
  const filtered = q.filter(i => i.payload.user_id !== payload.user_id);
  filtered.push({ payload, attempts: 0, firstAttemptAt: Date.now() });
  saveQueue(filtered);
}

let flushInFlight = false;

/**
 * Drain the queue using the supabase JS client. Items that error are
 * retained with bumped `attempts`; items exceeding the attempt/age budget
 * are dropped (to bound localStorage growth).
 */
export async function flushXPQueue(): Promise<void> {
  if (flushInFlight) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  const queue = loadQueue();
  if (queue.length === 0) return;
  flushInFlight = true;
  const remaining: QueuedItem[] = [];
  try {
    for (const item of queue) {
      try {
        const { error } = await supabase
          .from("user_progress")
          .upsert(item.payload, { onConflict: "user_id" });
        if (error) throw error;
        // success: drop
      } catch (e) {
        const attempts = item.attempts + 1;
        const age = Date.now() - item.firstAttemptAt;
        if (attempts < MAX_ATTEMPTS && age < MAX_AGE_MS) {
          remaining.push({ ...item, attempts });
        } else {
          console.warn("[xpSyncQueue] dropping after exhausted retries:", e);
        }
      }
    }
    saveQueue(remaining);
  } finally {
    flushInFlight = false;
  }
}

/**
 * Best-effort fire-and-forget flush for `beforeunload` / `pagehide`.
 * Uses fetch with `keepalive: true` which lets the request finish even
 * after the document is unloaded (capped at ~64KB body per browser).
 *
 * Does NOT clear the queue — if the request lands, the row is already
 * upserted; if it doesn't, the next page load's `flushXPQueue()` will
 * retry and the GREATEST trigger collapses duplicate writes safely.
 */
export function flushXPQueueBeacon(
  supabaseUrl: string,
  anonKey: string,
  authToken: string | null
): void {
  const queue = loadQueue();
  if (queue.length === 0) return;
  const url = `${supabaseUrl}/rest/v1/user_progress?on_conflict=user_id`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: anonKey,
    Authorization: `Bearer ${authToken ?? anonKey}`,
    Prefer: "resolution=merge-duplicates",
  };
  for (const item of queue) {
    try {
      fetch(url, {
        method: "POST",
        keepalive: true,
        headers,
        body: JSON.stringify(item.payload),
      }).catch(() => {
        /* ignore */
      });
    } catch {
      /* ignore */
    }
  }
}

/** Number of pending items — useful for debug UI. */
export function getPendingXPSyncCount(): number {
  return loadQueue().length;
}
