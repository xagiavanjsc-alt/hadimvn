import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_PUBLIC_SUPABASE_URL as string) || "https://placeholder.supabase.co";
const supabaseAnonKey = (import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string) || "placeholder-anon-key";

export const isSupabaseConfigured =
  Boolean(import.meta.env.VITE_PUBLIC_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_vip: boolean;
  vip_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

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
