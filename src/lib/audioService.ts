/**
 * Korean text-to-speech audio service.
 *
 * Flow:
 *   1. Frontend asks for audio of `text`.
 *   2. We hit the `tts-cache` edge function.
 *   3. Cache hit  → server returns the cached `audio_url` immediately.
 *   4. Cache miss → if a provider is configured server-side, the function
 *      generates + uploads + returns the new URL.
 *   5. No provider yet (503) or any other server error → we fall back to
 *      the browser's Web Speech API so the user always hears *something*,
 *      and the miss is recorded on the server so admin can batch-generate
 *      audio later.
 *
 * Per-session in-memory cache: we don't want to round-trip the function
 * twice for the same word in the same tab.
 */

import { supabase } from "@/lib/supabase";
import { normalizeForCache } from "@/utils/koreanRomanize";

const sessionUrlCache = new Map<string, string>();
const sessionMissCache = new Set<string>(); // texts known to have no provider

interface TtsCacheResponse {
  url?: string;
  source?: "cache" | "generated";
  error?: string;
  needsAdmin?: boolean;
}

/**
 * Resolve a Korean text to an audio URL via the edge function.
 * Returns `null` if no cache + no provider (caller should fall back to
 * Web Speech).
 */
export async function getKoreanAudioUrl(text: string, opts?: { force?: boolean }): Promise<string | null> {
  const normalized = normalizeForCache(text);
  if (!normalized) return null;

  if (!opts?.force) {
    const cached = sessionUrlCache.get(normalized);
    if (cached) return cached;
    if (sessionMissCache.has(normalized)) return null;
  }

  try {
    const { data, error } = await supabase.functions.invoke<TtsCacheResponse>("tts-cache", {
      body: { text: normalized, force: opts?.force ?? false },
    });
    if (error) {
      // Edge function returned non-2xx. If it's the "no provider" case the
      // server has already recorded the miss for admin; just fall back.
      sessionMissCache.add(normalized);
      return null;
    }
    if (data?.url) {
      sessionUrlCache.set(normalized, data.url);
      return data.url;
    }
    sessionMissCache.add(normalized);
    return null;
  } catch (err) {
    console.warn("[audioService] tts-cache invoke failed:", err);
    sessionMissCache.add(normalized);
    return null;
  }
}

/**
 * Play Korean audio. Tries the cache/provider first; on miss, falls back
 * to Web Speech API. Returns a Promise that resolves when playback ends
 * (or rejects on hard failure).
 */
// Track the currently-playing HTMLAudio so a fast second tap stops the first
// instead of overlapping. Module-level (singleton) — only one Korean audio
// should play at a time across the whole app.
let currentAudio: HTMLAudioElement | null = null;

export async function playKoreanAudio(text: string, opts?: { force?: boolean }): Promise<void> {
  // Stop any in-flight playback before starting a new one.
  if (currentAudio) {
    try { currentAudio.pause(); } catch { /* noop */ }
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try { window.speechSynthesis.cancel(); } catch { /* noop */ }
  }

  const url = await getKoreanAudioUrl(text, opts);
  if (url) {
    const audio = new Audio(url);
    audio.crossOrigin = "anonymous";
    currentAudio = audio;
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => { if (currentAudio === audio) currentAudio = null; resolve(); };
      audio.onerror = () => { if (currentAudio === audio) currentAudio = null; reject(new Error("Audio playback failed")); };
      audio.play().catch(reject);
    });
    return;
  }
  // Fallback: Web Speech API (robot voice but free + ~always available).
  speakWithWebSpeech(text);
}

/** Stop any currently-playing Korean audio. Safe to call from unmount cleanup. */
export function stopKoreanAudio(): void {
  if (currentAudio) {
    try { currentAudio.pause(); } catch { /* noop */ }
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try { window.speechSynthesis.cancel(); } catch { /* noop */ }
  }
}

/**
 * Browser TTS fallback. Best-effort: returns immediately, no playback Promise.
 * The Web Speech API queues utterances internally so calling rapidly is fine.
 */
export function speakWithWebSpeech(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel(); // stop any in-flight utterance
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ko-KR";
    utter.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find(v => v.lang?.toLowerCase().startsWith("ko"));
    if (koVoice) utter.voice = koVoice;
    window.speechSynthesis.speak(utter);
  } catch (err) {
    console.warn("[audioService] Web Speech fallback failed:", err);
  }
}

/** Clear the per-session caches — useful after admin actions in the same tab. */
export function clearAudioSessionCache(): void {
  sessionUrlCache.clear();
  sessionMissCache.clear();
}
