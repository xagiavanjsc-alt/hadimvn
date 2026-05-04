import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * XP settings configuration for the application
 * Controls how XP is calculated and anti-cheat thresholds
 */
export interface XPSettings {
  // ─── XP formula weights (dùng bởi compute_user_xp + client lib/xp.ts) ──
  streak_weight: number;
  best_score_weight: number;
  average_score_weight: number;
  correct_answer_weight: number;
  flashcard_weight: number;
  exam_completed_bonus: number;
  // ─── Community weights (từ migration 030) ─────────────────────────────
  post_weight: number;
  comment_weight: number;
  like_received_weight: number;
  rating_given_weight: number;
  daily_post_cap: number;
  daily_comment_cap: number;
  // ─── Anti-cheat ────────────────────────────────────────────────────────
  flashcard_xp_cap: number;
  min_sec_per_question: number;
  exam_cooldown_sec: number;
  max_exams_per_day: number;
}

/**
 * Default XP settings if database fetch fails
 */
export const DEFAULT_XP_SETTINGS: XPSettings = {
  streak_weight: 30,
  best_score_weight: 8,
  average_score_weight: 5,
  correct_answer_weight: 3,
  flashcard_weight: 4,
  exam_completed_bonus: 10,
  post_weight: 50,
  comment_weight: 20,
  like_received_weight: 5,
  rating_given_weight: 10,
  daily_post_cap: 5,
  daily_comment_cap: 20,
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

/**
 * Read cached XP settings from localStorage
 * @returns XP settings if cache is valid and not expired, null otherwise
 */
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

/**
 * Write XP settings to localStorage cache
 * @param data - XP settings to cache
 */
function writeCache(data: XPSettings): void {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, expiresAt: Date.now() + CACHE_TTL_MS })
    );
  } catch { /* ignore quota */ }
}

/**
 * Fetch XP settings from Supabase with 5-minute cache
 * Falls back to default settings if fetch fails
 * 
 * @returns XP settings from cache or database
 */
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
        post_weight: data.post_weight ?? DEFAULT_XP_SETTINGS.post_weight,
        comment_weight: data.comment_weight ?? DEFAULT_XP_SETTINGS.comment_weight,
        like_received_weight: data.like_received_weight ?? DEFAULT_XP_SETTINGS.like_received_weight,
        rating_given_weight: data.rating_given_weight ?? DEFAULT_XP_SETTINGS.rating_given_weight,
        daily_post_cap: data.daily_post_cap ?? DEFAULT_XP_SETTINGS.daily_post_cap,
        daily_comment_cap: data.daily_comment_cap ?? DEFAULT_XP_SETTINGS.daily_comment_cap,
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

/**
 * Force refresh of XP settings cache
 * Call this after admin saves new settings
 */
export function clearXPSettingsCache(): void {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}
