/**
 * useExamAudio — Hybrid audio player cho listening questions của EPS exams.
 *
 * Phát MP3 nếu có; lỗi/404/autoplay-block → tự fallback Web Speech TTS với
 * audioScript. Không có URL → TTS luôn.
 *
 * Convention path quy ước trong từng `src/data/eps_de{N}.ts`:
 *   {DE{N}_INFO.audioBase}/{questionId}.mp3
 *   e.g. /images/audio/de1/21.mp3
 *
 * Mỗi đề có folder riêng (de1/, de2/, …) → KHÔNG bao giờ trùng tên file giữa
 * các đề. Đề chưa thu MP3 thì bỏ trống `audioBase` trong DE_INFO → hook tự
 * chạy TTS.
 *
 * API:
 *   const { play, stop, playing } = useExamAudio();
 *   play({ text, audioUrl, onEnd });
 *   stop();
 */
import { useCallback, useRef, useState } from "react";

export interface PlayOptions {
  /** Text tiếng Hàn dùng cho TTS (fallback khi MP3 lỗi, hoặc khi không có audioUrl). */
  text?: string;
  /** URL MP3 đầy đủ. Lỗi/404 → fallback TTS với `text`. */
  audioUrl?: string;
  /** Gọi khi audio kết thúc bình thường (không gọi khi stop chủ động). */
  onEnd?: () => void;
}

export function useExamAudio() {
  const [playing, setPlaying] = useState(false);
  const [ttsSupported] = useState(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    const old = audioRef.current;
    if (old) {
      // Detach handlers BEFORE pausing/clearing src, otherwise the error event
      // that fires when src is reset will re-trigger fallback for the previous
      // play() call — that was the "phát cả MP3 lẫn TTS" bug on rapid clicks.
      old.onplay = null;
      old.onended = null;
      old.onerror = null;
      old.pause();
      old.src = "";
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
  }, []);

  const play = useCallback(
    (opts: PlayOptions) => {
      stop();

      const speakTTS = () => {
        if (!ttsSupported || !opts.text) {
          opts.onEnd?.();
          return;
        }
        const utter = new SpeechSynthesisUtterance(opts.text);
        utter.lang = "ko-KR";
        utter.rate = 0.88;
        utter.pitch = 1;
        const voices = window.speechSynthesis.getVoices();
        const koVoice = voices.find(v => v.lang.startsWith("ko"));
        if (koVoice) utter.voice = koVoice;
        utter.onstart = () => setPlaying(true);
        utter.onend = () => { setPlaying(false); opts.onEnd?.(); };
        utter.onerror = () => setPlaying(false);
        window.speechSynthesis.speak(utter);
      };

      if (opts.audioUrl) {
        const audio = new Audio(opts.audioUrl);
        audioRef.current = audio;
        let playStarted = false;
        let fellBack = false;
        const fallbackOnce = () => {
          if (fellBack) return;
          // Already superseded by stop()/another play() — owner has cleaned up,
          // do not run side effects for this stale closure.
          if (audioRef.current !== audio) return;
          fellBack = true;
          audioRef.current = null;
          if (playStarted) {
            // MP3 started OK then errored mid-playback. Treat as ended —
            // do NOT speak TTS over what the user just heard.
            setPlaying(false);
            opts.onEnd?.();
          } else {
            // Never got to play (404, decode error, autoplay block) → TTS.
            speakTTS();
          }
        };
        audio.onplay = () => { playStarted = true; setPlaying(true); };
        audio.onended = () => { setPlaying(false); opts.onEnd?.(); };
        audio.onerror = fallbackOnce;
        audio.play().catch(fallbackOnce);
      } else {
        speakTTS();
      }
    },
    [stop, ttsSupported]
  );

  return { play, stop, playing };
}
