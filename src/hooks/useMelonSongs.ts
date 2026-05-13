import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MelonSong, mockMelonSongs } from "@/mocks/melonSongs";

const LOCAL_KEY = "kts_melon_songs";
const CACHE_KEY = "kts_melon_songs_cache_time";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function mapRow(row: Record<string, unknown>): MelonSong {
  return {
    rank: row.rank as number,
    title: row.title as string,
    artist: row.artist as string,
    genre: row.genre as string,
    lyrics: row.lyrics as string,
    albumArt: row.album_art as string,
    processed: row.processed as boolean,
    releaseDate: row.release_date as string,
    album: row.album as string,
    translation: row.translation as MelonSong["translation"],
    vocabulary: row.vocabulary as MelonSong["vocabulary"],
    grammar: row.grammar as MelonSong["grammar"],
    difficulty: row.difficulty as MelonSong["difficulty"],
    audioUrl: row.audio_url as string | undefined,
  };
}

export function useMelonSongs() {
  const [songs, setSongs] = useState<MelonSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "localstorage" | "mock">("mock");

  const loadSongs = useCallback(async () => {
    setLoading(true);

    // 1. Try Supabase first
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("melon_songs")
          .select("*")
          .order("rank", { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped = data.map(row => mapRow(row as Record<string, unknown>));
          setSongs(mapped);
          setSource("supabase");
          // Cache locally for offline/fast load
          localStorage.setItem(LOCAL_KEY, JSON.stringify(mapped));
          localStorage.setItem(CACHE_KEY, Date.now().toString());
          setLoading(false);
          return;
        }
      } catch {
        // Supabase failed, fallback below
      }
    }

    // 2. Fallback to localStorage
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const data = JSON.parse(raw) as MelonSong[];
        if (data.length > 0) {
          setSongs(data);
          setSource("localstorage");
          setLoading(false);
          return;
        }
      }
    } catch {
      // localStorage failed
    }

    // 3. Final fallback to mock data
    setSongs(mockMelonSongs);
    setSource("mock");
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  return { songs, loading, source, reload: loadSongs };
}

// Admin: save songs to Supabase + localStorage
export async function saveMelonSongsToSupabase(songs: MelonSong[]): Promise<{ ok: boolean; error?: string }> {
  // Always save to localStorage
  localStorage.setItem(LOCAL_KEY, JSON.stringify(songs));

  if (!isSupabaseConfigured) {
    return { ok: true };
  }

  try {
    // Delete existing and re-insert
    const { error: delError } = await supabase
      .from("melon_songs")
      .delete()
      .gte("rank", 0);

    if (delError) throw delError;

    const rows = songs.map(s => ({
      rank: s.rank,
      title: s.title,
      artist: s.artist,
      genre: s.genre,
      lyrics: s.lyrics,
      album_art: s.albumArt,
      processed: s.processed ?? false,
      release_date: s.releaseDate ?? "",
      album: s.album ?? "",
      translation: s.translation ?? null,
      vocabulary: s.vocabulary ?? null,
      grammar: s.grammar ?? null,
      difficulty: s.difficulty ?? null,
      audio_url: s.audioUrl ?? null,
    }));

    const { error: insError } = await supabase
      .from("melon_songs")
      .insert(rows);

    if (insError) throw insError;

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: msg };
  }
}

// Admin: clear all songs
export async function clearMelonSongsFromSupabase(): Promise<{ ok: boolean; error?: string }> {
  localStorage.removeItem(LOCAL_KEY);
  localStorage.removeItem(CACHE_KEY);

  if (!isSupabaseConfigured) {
    return { ok: true };
  }

  try {
    const { error } = await supabase
      .from("melon_songs")
      .delete()
      .gte("rank", 0);

    if (error) throw error;
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: msg };
  }
}
