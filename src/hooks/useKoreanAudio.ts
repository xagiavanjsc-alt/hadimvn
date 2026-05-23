import { useCallback, useState } from "react";
import { playKoreanAudio } from "@/lib/audioService";

/**
 * Hook for playing Korean text audio in components.
 *
 *   const { play, isPlaying } = useKoreanAudio();
 *   <button onClick={() => play("안녕하세요")}>🔊</button>
 *
 * Resolves through the site-wide TTS cache (Supabase edge function); falls
 * back to Web Speech API if no provider is configured yet. The hook tracks
 * an `isPlaying` flag so callers can show a loading state without managing
 * their own state.
 *
 * Pass `force: true` to ignore the cache and request a fresh generation —
 * useful from the admin "regenerate" button.
 */
export function useKoreanAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const play = useCallback(async (text: string, opts?: { force?: boolean }) => {
    if (!text?.trim()) return;
    setIsPlaying(true);
    setError(null);
    try {
      await playKoreanAudio(text, opts);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsPlaying(false);
    }
  }, []);

  return { play, isPlaying, error };
}
