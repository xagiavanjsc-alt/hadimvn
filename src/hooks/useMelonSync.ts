import { useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface MelonStudyEntry {
  song_id: string;
  song_title: string;
  artist: string;
  cover_url?: string;
  genre?: string;
  ai_analysis?: Record<string, unknown> | null;
  vocabulary?: unknown[];
  quiz_score?: number | null;
  quiz_total?: number | null;
  studied_at?: string;
}

export interface MelonFlashcardEntry {
  song_id: string;
  word: string;
  is_known: boolean;
}

export function useMelonSync() {
  /** Save or update a study entry after AI analysis */
  const saveMelonStudy = useCallback(async (userId: string, entry: MelonStudyEntry) => {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from("melon_study_history").upsert(
        {
          user_id: userId,
          song_id: entry.song_id,
          song_title: entry.song_title,
          artist: entry.artist,
          cover_url: entry.cover_url ?? null,
          genre: entry.genre ?? null,
          ai_analysis: entry.ai_analysis ?? null,
          vocabulary: entry.vocabulary ?? [],
          quiz_score: entry.quiz_score ?? null,
          quiz_total: entry.quiz_total ?? null,
          studied_at: entry.studied_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,song_id" }
      );
    } catch {
      // silent fail
    }
  }, []);

  /** Update quiz score for an existing entry */
  const updateQuizScore = useCallback(async (userId: string, songId: string, score: number, total: number) => {
    if (!isSupabaseConfigured) return;
    try {
      await supabase
        .from("melon_study_history")
        .update({ quiz_score: score, quiz_total: total, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("song_id", songId);
    } catch {
      // silent fail
    }
  }, []);

  /** Load all study history from Supabase */
  const loadMelonHistory = useCallback(async (userId: string): Promise<MelonStudyEntry[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const { data } = await supabase
        .from("melon_study_history")
        .select("*")
        .eq("user_id", userId)
        .order("studied_at", { ascending: false });
      return (data ?? []) as MelonStudyEntry[];
    } catch {
      return [];
    }
  }, []);

  /** Save flashcard known/unknown status */
  const saveMelonFlashcardProgress = useCallback(async (userId: string, entries: MelonFlashcardEntry[]) => {
    if (!isSupabaseConfigured || entries.length === 0) return;
    try {
      const rows = entries.map((e) => ({
        user_id: userId,
        song_id: e.song_id,
        word: e.word,
        is_known: e.is_known,
        updated_at: new Date().toISOString(),
      }));
      await supabase
        .from("melon_flashcard_progress")
        .upsert(rows, { onConflict: "user_id,song_id,word" });
    } catch {
      // silent fail
    }
  }, []);

  /** Load flashcard progress: returns a Set of "songId::word" for known cards */
  const loadMelonFlashcardProgress = useCallback(async (userId: string): Promise<Map<string, boolean>> => {
    if (!isSupabaseConfigured) return new Map();
    try {
      const { data } = await supabase
        .from("melon_flashcard_progress")
        .select("song_id,word,is_known")
        .eq("user_id", userId);
      const map = new Map<string, boolean>();
      (data ?? []).forEach((row: { song_id: string; word: string; is_known: boolean }) => {
        map.set(`${row.song_id}::${row.word}`, row.is_known);
      });
      return map;
    } catch {
      return new Map();
    }
  }, []);

  return {
    saveMelonStudy,
    updateQuizScore,
    loadMelonHistory,
    saveMelonFlashcardProgress,
    loadMelonFlashcardProgress,
  };
}
