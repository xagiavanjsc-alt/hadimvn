/**
 * useAudioCache — Hook quản lý cache âm thanh nâng cấp
 *
 * Chiến lược:
 * 1. Kiểm tra Cache Storage (vĩnh viễn)
 * 2. Nếu có → phát từ cache (không tốn API/token)
 * 3. Nếu không có → gọi Google TTS API → lưu lên VPS → cache lại
 * 4. Fallback: Web Speech API
 *
 * Tên file âm thanh: dùng phiên âm latinh (romanization) thay vì tiếng Hàn
 * để tránh lỗi encoding trên VPS/hosting không hỗ trợ Unicode trong tên file.
 * Ví dụ: 안전모 → anjeonmo.mp3
 */

import { useCallback, useEffect, useRef } from "react";
import { AUDIO_HOST_URL } from "@/lib/siteConfig";

const AUDIO_CACHE_NAME = "hanquocoi-audio-v2";

// ─── Korean Romanization (basic) ─────────────────────────────────────────────
// Bảng chuyển đổi phụ âm đầu (초성)
const CHOSEONG = ["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"];
// Bảng chuyển đổi nguyên âm (중성)
const JUNGSEONG = ["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"];
// Bảng chuyển đổi phụ âm cuối (종성)
const JONGSEONG = ["","g","kk","gs","n","nj","nh","d","l","lg","lm","lb","ls","lt","lp","lh","m","b","bs","s","ss","ng","j","ch","k","t","p","h"];

/**
 * Chuyển tiếng Hàn sang phiên âm latinh (romanization đơn giản)
 * Dùng để tạo tên file an toàn cho VPS/hosting
 */
export function koreanToRomanization(korean: string): string {
  let result = "";
  for (const char of korean) {
    const code = char.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      // Ký tự Hangul syllable
      const offset = code - 0xAC00;
      const cho = Math.floor(offset / (21 * 28));
      const jung = Math.floor((offset % (21 * 28)) / 28);
      const jong = offset % 28;
      result += (CHOSEONG[cho] || "") + (JUNGSEONG[jung] || "") + (JONGSEONG[jong] || "");
    } else if (code >= 0x3131 && code <= 0x314E) {
      // Jamo phụ âm đơn
      result += char;
    } else if (code >= 0x314F && code <= 0x3163) {
      // Jamo nguyên âm đơn
      result += char;
    } else if (/[a-zA-Z0-9\s]/.test(char)) {
      result += char.toLowerCase();
    } else {
      result += "_";
    }
  }
  // Làm sạch: bỏ ký tự đặc biệt, thay khoảng trắng bằng dấu gạch dưới
  return result.replace(/[^a-z0-9_]/g, "").replace(/\s+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "") || "audio";
}

/**
 * Tạo URL âm thanh từ VPS dùng phiên âm latinh làm tên file
 * Ví dụ: 안전모 → {AUDIO_HOST_URL}/tts/anjeonmo.mp3
 */
export function getAudioUrl(korean: string, baseUrl = `${AUDIO_HOST_URL}/tts`): string {
  const romanized = koreanToRomanization(korean.trim());
  return `${baseUrl}/${romanized}.mp3`;
}

/**
 * Tạo URL Google TTS (miễn phí, không cần API key)
 * Dùng làm nguồn tạo âm thanh khi VPS chưa có file
 */
export function getGoogleTTSUrl(korean: string, lang = "ko"): string {
  const encoded = encodeURIComponent(korean.trim());
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`;
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

export async function isAudioCached(url: string): Promise<boolean> {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = await cache.match(url);
    return !!response;
  } catch {
    return false;
  }
}

export async function cacheAudioFromBlob(url: string, blob: Blob): Promise<boolean> {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const existing = await cache.match(url);
    if (existing) return true;
    const response = new Response(blob, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "max-age=31536000" },
    });
    await cache.put(url, response);
    return true;
  } catch {
    return false;
  }
}

export async function cacheAudio(url: string): Promise<boolean> {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const existing = await cache.match(url);
    if (existing) return true;
    await cache.add(url);
    return true;
  } catch {
    return false;
  }
}

export async function getCachedAudioList(): Promise<string[]> {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const keys = await cache.keys();
    return keys.map(req => req.url);
  } catch {
    return [];
  }
}

export async function deleteCachedAudio(url: string): Promise<void> {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    await cache.delete(url);
  } catch {
    // ignore
  }
}

// ─── Upload to VPS helper ─────────────────────────────────────────────────────
/**
 * Upload file âm thanh lên VPS qua API endpoint
 * VPS cần có endpoint: POST {AUDIO_HOST_URL}/upload
 * Body: FormData { file: Blob, filename: string }
 */
export async function uploadAudioToVPS(
  blob: Blob,
  filename: string,
  uploadEndpoint = `${AUDIO_HOST_URL}/upload`
): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append("file", blob, filename);
    formData.append("filename", filename);
    const res = await fetch(uploadEndpoint, { method: "POST", body: formData });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Main hook ────────────────────────────────────────────────────────────────
export function useAudioCache() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Phát âm thanh với chiến lược cache thông minh:
   * 1. Kiểm tra Cache Storage → phát ngay nếu có
   * 2. Thử phát từ VPS (file đã upload trước)
   * 3. Nếu VPS không có → dùng Google TTS → cache lại → upload VPS (nếu có endpoint)
   * 4. Fallback: Web Speech API
   */
  const playKorean = useCallback(async (
    korean: string,
    options?: {
      vpsBaseUrl?: string;
      uploadEndpoint?: string;
      googleTTS?: boolean;
      rate?: number;
      onCached?: () => void;
    }
  ) => {
    const {
      vpsBaseUrl = `${AUDIO_HOST_URL}/tts`,
      uploadEndpoint,
      googleTTS = true,
      rate = 0.8,
      onCached,
    } = options || {};

    // Dừng âm thanh đang phát
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const vpsUrl = getAudioUrl(korean, vpsBaseUrl);
    const romanized = koreanToRomanization(korean.trim());
    const filename = `${romanized}.mp3`;

    // ── Bước 1: Kiểm tra cache ──────────────────────────────────────────────
    try {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      const cached = await cache.match(vpsUrl);
      if (cached) {
        const blob = await cached.blob();
        const objectUrl = URL.createObjectURL(blob);
        const audio = new Audio(objectUrl);
        audioRef.current = audio;
        audio.onended = () => URL.revokeObjectURL(objectUrl);
        audio.onerror = () => speakWithBrowser(korean, rate);
        await audio.play().catch(() => speakWithBrowser(korean, rate));
        return;
      }
    } catch {
      // Cache không khả dụng, tiếp tục
    }

    // ── Bước 2: Thử phát từ VPS ─────────────────────────────────────────────
    try {
      const vpsRes = await fetch(vpsUrl, { method: "HEAD" });
      if (vpsRes.ok) {
        const audio = new Audio(vpsUrl);
        audioRef.current = audio;
        audio.oncanplaythrough = async () => {
          await audio.play().catch(() => {});
          // Cache lại từ VPS
          try {
            const res = await fetch(vpsUrl);
            const blob = await res.blob();
            await cacheAudioFromBlob(vpsUrl, blob);
            if (onCached) onCached();
          } catch {
            // ignore cache error
          }
        };
        audio.onerror = () => tryGoogleTTS();
        audio.load();
        return;
      }
    } catch {
      // VPS không có file, tiếp tục
    }

    // ── Bước 3: Google TTS → cache → upload VPS ─────────────────────────────
    async function tryGoogleTTS() {
      if (!googleTTS) {
        speakWithBrowser(korean, rate);
        return;
      }
      try {
        const ttsUrl = getGoogleTTSUrl(korean);
        const res = await fetch(ttsUrl);
        if (!res.ok) throw new Error("TTS failed");
        const blob = await res.blob();

        // Cache vào browser
        await cacheAudioFromBlob(vpsUrl, blob);
        if (onCached) onCached();

        // Upload lên VPS nếu có endpoint
        if (uploadEndpoint) {
          uploadAudioToVPS(blob, filename, uploadEndpoint).catch(() => {});
        }

        // Phát âm thanh
        const objectUrl = URL.createObjectURL(blob);
        const audio = new Audio(objectUrl);
        audioRef.current = audio;
        audio.onended = () => URL.revokeObjectURL(objectUrl);
        audio.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          speakWithBrowser(korean, rate);
        };
        await audio.play().catch(() => speakWithBrowser(korean, rate));
      } catch {
        speakWithBrowser(korean, rate);
      }
    }

    await tryGoogleTTS();
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  // Stop audio when the consuming component unmounts (route change, modal
  // close). Without this the Audio() in audioRef plays to completion.
  useEffect(() => stopAudio, [stopAudio]);

  return { playKorean, stopAudio, koreanToRomanization, getAudioUrl };
}

function speakWithBrowser(text: string, rate = 0.8) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ko-KR";
  utter.rate = rate;
  window.speechSynthesis.speak(utter);
}
