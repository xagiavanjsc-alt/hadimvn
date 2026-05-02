import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_PUBLIC_SUPABASE_URL as string) || "https://placeholder.supabase.co";
const supabaseAnonKey = (import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string) || "placeholder-anon-key";

export const isSupabaseConfigured =
  Boolean(import.meta.env.VITE_PUBLIC_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Storage URL helper ───────────────────────────────────────────────────────
// Store ONLY relative paths in DB (e.g. "community-images/filename.webp")
// When migrating to VPS, just change this function
const STORAGE_BASE = import.meta.env.VITE_STORAGE_BASE || `${supabaseUrl}/storage/v1/object/public`;

/**
 * Get full URL for a storage path.
 * @param relativePath - e.g. "community-images/123_photo.webp"
 * When migrating to VPS, set VITE_STORAGE_BASE to your new domain.
 */
export function getStorageUrl(relativePath: string | null | undefined): string {
  if (!relativePath) return "";
  // Already a full URL? Return as-is
  if (relativePath.startsWith("http")) return relativePath;
  return `${STORAGE_BASE}/${relativePath}`;
}

export type UserProfile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_vip: boolean;
  vip_type: "none" | "month" | "year";
  vip_expires_at: string | null;
  is_admin: boolean;
  user_role: "super_admin" | "smod" | "moderator" | "member";
  created_at: string;
  updated_at: string;
};

/** Kiểm tra VIP còn hiệu lực: is_vip=true VÀ chưa hết hạn */
export function isVipActive(profile: { is_vip?: boolean; vip_expires_at?: string | null } | null | undefined): boolean {
  if (!profile?.is_vip) return false;
  if (!profile.vip_expires_at) return true; // không có ngày hết hạn → coi như còn VIP
  const active = new Date(profile.vip_expires_at).getTime() > Date.now();
  console.log("[isVipActive]", { is_vip: profile.is_vip, vip_expires_at: profile.vip_expires_at, active });
  return active;
}

export type StudyProgress = {
  id: string;
  user_id: string;
  streak_count: number;
  streak_last_date: string | null;
  eps_answers: Record<string, number>;
  flashcard_known: Record<string, boolean>;
  hangul_known: Record<string, boolean>;
  quiz_history: { date: string; score: number; total: number; lesson: string }[];
  news_lessons: { id: string; title: string; date: string }[];
  pdf_exports_count: number;
  pdf_exports_month: string | null;
  updated_at: string;
};

export type ExamResult = {
  id: string;
  user_id: string;
  score: number;
  total: number;
  time_used: number;
  correct_ids: string[];
  taken_at: string;
};

export type LeaderboardEntry = {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  xp: number;
  streak: number;
  best_score: number;
  words_learned: number;
  level: string;
  updated_at: string;
};
