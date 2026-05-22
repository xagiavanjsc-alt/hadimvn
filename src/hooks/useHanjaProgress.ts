import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const LEARNED_KEY = "kts_hanja_pro_known";
const GUEST_STREAK_KEY = "kts_hanja_streak_days";
const LEGACY_STREAK_KEY = "hanja_streak";

export function localDateISO(d: Date = new Date()): string {
  // sv-SE gives YYYY-MM-DD in the local timezone (no UTC drift around midnight).
  return d.toLocaleDateString("sv-SE");
}

function loadLearnedFromLS(): Set<number> {
  try {
    const raw = localStorage.getItem(LEARNED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed.map(Number));
    if (parsed && typeof parsed === "object") {
      return new Set(
        Object.entries(parsed)
          .filter(([, v]) => v)
          .map(([k]) => Number(k))
      );
    }
  } catch { /* corrupted JSON, fall through */ }
  return new Set();
}

function saveLearnedToLS(set: Set<number>) {
  try {
    localStorage.setItem(
      LEARNED_KEY,
      JSON.stringify(Object.fromEntries(Array.from(set).map(id => [id, true])))
    );
  } catch { /* quota exceeded - ignore */ }
}

function loadGuestStreakDays(): string[] {
  try {
    const raw = localStorage.getItem(GUEST_STREAK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(s => typeof s === "string");
    }
    // Migrate from legacy "hanja_streak" key (best-effort, handles both shapes).
    const legacy = localStorage.getItem(LEGACY_STREAK_KEY);
    if (legacy) {
      const data = JSON.parse(legacy);
      if (data?.history && typeof data.history === "object") {
        return Object.keys(data.history).filter(k => data.history[k] > 0);
      }
      if (Array.isArray(data)) return data;
    }
  } catch { /* corrupted JSON */ }
  return [];
}

function saveGuestStreakDays(days: string[]) {
  try {
    localStorage.setItem(GUEST_STREAK_KEY, JSON.stringify(days));
  } catch { /* quota */ }
}

export interface UseHanjaProgress {
  /** Set of learned hanja IDs. */
  learnedSet: Set<number>;
  /** Whether `id` has been learned by the current user. */
  isLearned: (id: number) => boolean;
  /** Toggle learned status. Optimistic with rollback on DB failure (logged-in users). */
  toggle: (id: number) => Promise<void>;
  /** Number of learned items. */
  count: number;
  /** Unique YYYY-MM-DD local dates on which the user marked something learned. */
  streakDays: string[];
  /** True while the initial DB load is in flight (logged-in users only). */
  loading: boolean;
  /** Last error message from a sync attempt; consumers can show a toast and clear it. */
  lastError: string | null;
  /** Clear `lastError`. */
  clearError: () => void;
}

/**
 * Unified hook for Hanja "learned" progress.
 *
 * - Logged-in users: source of truth is Supabase `user_hanja_progress`.
 *   On first mount per user, any localStorage entries are migrated (insert-or-ignore).
 * - Guests: source of truth is localStorage at `kts_hanja_pro_known`.
 *
 * Use the returned `toggle(id)` instead of writing to localStorage directly so that
 * dashboard / flashcard / hanja-pro / hanja-pro-detail stay in sync.
 */
export function useHanjaProgress(): UseHanjaProgress {
  const { user } = useAuthContext();
  const userId = user?.id ?? null;

  const [learnedSet, setLearnedSet] = useState<Set<number>>(loadLearnedFromLS);
  const [streakDays, setStreakDays] = useState<string[]>(loadGuestStreakDays);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [lastError, setLastError] = useState<string | null>(null);

  // Guards against double-fire on rapid clicks.
  const pendingRef = useRef<Set<number>>(new Set());
  // One-time per-user migration flag.
  const migratedRef = useRef<Set<string>>(new Set());

  // Load from DB when logged in; reset to localStorage on logout.
  useEffect(() => {
    if (!userId) {
      setLearnedSet(loadLearnedFromLS());
      setStreakDays(loadGuestStreakDays());
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from("user_hanja_progress")
        .select("hanja_id, learned_at")
        .eq("user_id", userId)
        .order("learned_at", { ascending: true });

      if (cancelled) return;
      if (error) {
        setLastError("Không tải được tiến độ Hán Hàn từ máy chủ");
        setLoading(false);
        return;
      }

      const rows = data || [];
      const dbIds = new Set<number>(rows.map(r => Number(r.hanja_id)));

      // One-time migration of guest data into DB on first login.
      if (!migratedRef.current.has(userId)) {
        migratedRef.current.add(userId);
        const localSet = loadLearnedFromLS();
        const toUpload = Array.from(localSet).filter(id => !dbIds.has(id));
        if (toUpload.length > 0) {
          const { error: upErr } = await supabase
            .from("user_hanja_progress")
            .insert(toUpload.map(id => ({ user_id: userId, hanja_id: id })));
          if (cancelled) return;
          if (!upErr || upErr.code === "23505") {
            toUpload.forEach(id => dbIds.add(id));
          } else {
            // Non-fatal; user still sees what's in DB.
            console.warn("[useHanjaProgress] migration upload failed:", upErr);
          }
        }
      }

      const days = Array.from(
        new Set(rows.map(r => localDateISO(new Date(r.learned_at as string))))
      );

      setLearnedSet(dbIds);
      setStreakDays(days);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [userId]);

  // Cross-tab sync (guest only).
  useEffect(() => {
    if (userId) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === LEARNED_KEY) setLearnedSet(loadLearnedFromLS());
      else if (e.key === GUEST_STREAK_KEY) setStreakDays(loadGuestStreakDays());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [userId]);

  const toggle = useCallback(async (id: number) => {
    if (pendingRef.current.has(id)) return;
    pendingRef.current.add(id);

    // Read latest state synchronously via functional updater (avoids stale closure).
    let wasLearned = false;
    setLearnedSet(prev => {
      wasLearned = prev.has(id);
      const next = new Set(prev);
      if (wasLearned) next.delete(id);
      else next.add(id);
      if (!userId) saveLearnedToLS(next);
      return next;
    });

    // Update streakDays on add (any user type).
    if (!wasLearned) {
      const today = localDateISO();
      setStreakDays(prev => {
        if (prev.includes(today)) return prev;
        const next = [...prev, today];
        if (!userId) saveGuestStreakDays(next);
        return next;
      });
    }

    if (!userId) {
      pendingRef.current.delete(id);
      return;
    }

    try {
      const { error } = wasLearned
        ? await supabase
            .from("user_hanja_progress")
            .delete()
            .eq("user_id", userId)
            .eq("hanja_id", id)
        : await supabase
            .from("user_hanja_progress")
            .insert({ user_id: userId, hanja_id: id });

      // 23505 = unique_violation on insert (already learned) — consistent state, ignore.
      if (error && !(!wasLearned && error.code === "23505")) {
        setLearnedSet(prev => {
          const rollback = new Set(prev);
          if (wasLearned) rollback.add(id);
          else rollback.delete(id);
          return rollback;
        });
        setLastError("Không lưu được tiến độ, vui lòng thử lại");
        console.error("[useHanjaProgress] sync failed:", error);
      }
    } finally {
      pendingRef.current.delete(id);
    }
  }, [userId]);

  const isLearned = useCallback((id: number) => learnedSet.has(id), [learnedSet]);
  const clearError = useCallback(() => setLastError(null), []);

  return {
    learnedSet,
    isLearned,
    toggle,
    count: learnedSet.size,
    streakDays,
    loading,
    lastError,
    clearError,
  };
}
