import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface XPSettings {
  streak_weight: number;
  best_score_weight: number;
  average_score_weight: number;
  correct_answer_weight: number;
  flashcard_weight: number;
  exam_completed_bonus: number;
  flashcard_xp_cap: number;
  min_sec_per_question: number;
  exam_cooldown_sec: number;
  max_exams_per_day: number;
}

export const DEFAULT_XP_SETTINGS: XPSettings = {
  streak_weight: 30,
  best_score_weight: 8,
  average_score_weight: 5,
  correct_answer_weight: 3,
  flashcard_weight: 4,
  exam_completed_bonus: 10,
  flashcard_xp_cap: 500,
  min_sec_per_question: 3,
  exam_cooldown_sec: 30,
  max_exams_per_day: 20,
};

const CACHE_KEY = "kts_xp_settings_cache";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

interface CacheEntry {
  data: XPSettings;
  expiresAt: number;
}

function readCache(): XPSettings | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (Date.now() > parsed.expiresAt) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data: XPSettings): void {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, expiresAt: Date.now() + CACHE_TTL_MS })
    );
  } catch { /* ignore quota */ }
}

/** Fetch XP settings từ Supabase (cache 5 phút). Fallback to defaults nếu lỗi. */
export function useXPSettings(): XPSettings {
  const [settings, setSettings] = useState<XPSettings>(
    () => readCache() ?? DEFAULT_XP_SETTINGS
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("xp_settings")
        .select("*")
        .eq("id", "global")
        .maybeSingle();
      if (!mounted || !data) return;
      const next: XPSettings = {
        streak_weight: data.streak_weight,
        best_score_weight: data.best_score_weight,
        average_score_weight: data.average_score_weight,
        correct_answer_weight: data.correct_answer_weight,
        flashcard_weight: data.flashcard_weight,
        exam_completed_bonus: data.exam_completed_bonus,
        flashcard_xp_cap: data.flashcard_xp_cap,
        min_sec_per_question: data.min_sec_per_question,
        exam_cooldown_sec: data.exam_cooldown_sec,
        max_exams_per_day: data.max_exams_per_day,
      };
      writeCache(next);
      setSettings(next);
    })();
    return () => { mounted = false; };
  }, []);

  return settings;
}

/** Force refresh (gọi sau khi admin save). */
export function clearXPSettingsCache(): void {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}
