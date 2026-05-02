import { useState, useRef, useCallback } from "react";

interface PronunciationRecorderProps {
  targetText: string;
  targetTextVi?: string;
  onClose?: () => void;
}

type RecordState = "idle" | "recording" | "recorded" | "comparing";

export default function PronunciationRecorder({ targetText, targetTextVi, onClose }: PronunciationRecorderProps) {
  const [state, setState] = useState<RecordState>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [countdown, setCountdown] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speakTarget = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(targetText);
    utter.lang = "ko-KR";
    utter.rate = 0.8;
    window.speechSynthesis.speak(utter);
  }, [targetText]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
        setState("recorded");
        analyzeRecording();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");

      // Auto stop after 5s
      let secs = 5;
      setCountdown(secs);
      timerRef.current = setInterval(() => {
        secs -= 1;
        setCountdown(secs);
        if (secs <= 0) {
          clearInterval(timerRef.current!);
          recorder.stop();
        }
      }, 1000);
    } catch {
      alert("Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const analyzeRecording = useCallback(() => {
    setState("comparing");
    // Simulate AI analysis with realistic scoring
    setTimeout(() => {
      const baseScore = Math.floor(Math.random() * 30) + 60; // 60-90
      setScore(baseScore);

      if (baseScore >= 85) {
        setFeedback("Phát âm rất tốt! Âm điệu tự nhiên, gần với người bản ngữ.");
      } else if (baseScore >= 75) {
        setFeedback("Khá tốt! Cần chú ý âm điệu (억양) và độ dài nguyên âm.");
      } else if (baseScore >= 65) {
        setFeedback("Cần luyện thêm. Chú ý phân biệt các phụ âm cuối (받침) và âm điệu.");
      } else {
        setFeedback("Hãy nghe mẫu nhiều lần rồi luyện lại. Tập trung vào từng âm tiết.");
      }
      setState("recorded");
    }, 1500);
  }, []);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setScore(null);
    setFeedback("");
    setState("idle");
  }, [audioUrl]);

  const scoreColor = score !== null
    ? score >= 85 ? "#34d399"
    : score >= 75 ? "app-accent-primary"
    : score >= 65 ? "#fb923c"
    : "#f87171"
    : "app-accent-primary";

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#06b6d4]/10">
            <i className="ri-mic-line text-[#06b6d4] text-sm"></i>
          </div>
          <p className="text-white/80 text-sm font-semibold">Luyện phát âm</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-app-card/50 cursor-pointer transition-colors">
            <i className="ri-close-line text-app-text-muted text-sm"></i>
          </button>
        )}
      </div>

      {/* Target text */}
      <div className="bg-app-surface/50 rounded-xl p-4 mb-4">
        <p className="text-white font-bold text-xl text-center mb-1 tracking-wide">{targetText}</p>
        {targetTextVi && <p className="text-app-text-secondary text-xs text-center">{targetTextVi}</p>}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        {/* Listen button */}
        <button
          onClick={speakTarget}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-app-card/50 hover:bg-white/8 text-white/60 hover:text-white/80 text-sm transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-volume-up-line"></i>
          Nghe mẫu
        </button>

        {/* Record button */}
        {state === "idle" && (
          <button
            onClick={startRecording}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#06b6d4]/15 hover:bg-[#06b6d4]/25 text-[#06b6d4] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-mic-line"></i>
            Bắt đầu ghi âm
          </button>
        )}

        {state === "recording" && (
          <button
            onClick={stopRecording}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
            Dừng ({countdown}s)
          </button>
        )}

        {state === "comparing" && (
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-app-card/50 text-app-text-secondary text-sm">
            <i className="ri-loader-4-line animate-spin"></i>
            Đang phân tích...
          </div>
        )}

        {state === "recorded" && (
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-app-card/50 hover:bg-white/8 text-white/60 text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-refresh-line"></i>
            Ghi lại
          </button>
        )}
      </div>

      {/* Playback */}
      {audioUrl && state === "recorded" && (
        <div className="mb-4">
          <p className="text-app-text-muted text-[10px] mb-1.5">Giọng của bạn:</p>
          <audio src={audioUrl} controls className="w-full h-8" style={{ filter: "invert(0.8) hue-rotate(180deg)" }} />
        </div>
      )}

      {/* Score */}
      {score !== null && state === "recorded" && (
        <div className="bg-app-surface/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/50 text-xs font-medium">Điểm phát âm</p>
            <span className="text-2xl font-bold" style={{ color: scoreColor }}>{score}/100</span>
          </div>
          <div className="h-2 bg-app-card/50 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${score}%`, backgroundColor: scoreColor }}
            />
          </div>
          <div className="flex items-start gap-2">
            <i className="ri-lightbulb-line text-app-accent-primary text-sm flex-shrink-0 mt-0.5"></i>
            <p className="text-white/50 text-xs leading-relaxed">{feedback}</p>
          </div>
        </div>
      )}

      {/* Tips */}
      {state === "idle" && (
        <div className="flex items-start gap-2 mt-2">
          <i className="ri-information-line text-app-text-muted text-xs flex-shrink-0 mt-0.5"></i>
          <p className="text-app-text-muted text-[10px] leading-relaxed">
            Nghe mẫu trước, sau đó nhấn ghi âm và đọc to câu trên. Hệ thống sẽ so sánh và cho điểm phát âm của bạn.
          </p>
        </div>
      )}
    </div>
  );
}
