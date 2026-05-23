import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { HanjaEntry } from "@/mocks/hanjaData";
import { useHanjaData } from "@/contexts/HanjaDataContext";
import { useXPSystem } from "@/hooks/useXPSystem";
import {
  SpeechRecognitionEventLike,
  SpeechRecognitionErrorEventLike,
  getSpeechRecognitionCtor,
} from "@/lib/speechRecognition";

const PRON_HISTORY_KEY = "hanja_pronunciation_history";

interface PronunciationRecord {
  korean: string;
  hanja: string;
  vietnamese: string;
  score: number; // 0-100
  date: string;
}

type RecordingState = "idle" | "countdown" | "recording" | "processing" | "result";

function speakKorean(text: string, rate = 0.8): Promise<void> {
  return new Promise(resolve => {
    if (!window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ko-KR";
    utter.rate = rate;
    utter.onend = () => resolve();
    window.speechSynthesis.speak(utter);
  });
}

function getInitial(char: string): string {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return char[0];
  const idx = Math.floor(code / 588);
  const initials = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  return initials[idx] || char[0];
}

const ALPHABET_GROUPS = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

// Simulate pronunciation scoring using Web Speech API recognition
async function recognizeSpeech(): Promise<string> {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = getSpeechRecognitionCtor();
    if (!SpeechRecognition) {
      reject(new Error("not_supported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      reject(new Error(event.error));
    };

    recognition.onend = () => {
      resolve("");
    };

    recognition.start();

    // Auto stop after 3 seconds
    setTimeout(() => {
      try { recognition.stop(); } catch { /* ignore */ }
    }, 3000);
  });
}

function scorePronounciation(target: string, recognized: string): number {
  if (!recognized) return 0;
  const t = target.trim().toLowerCase();
  const r = recognized.trim().toLowerCase();
  if (t === r) return 100;

  // Character-level similarity
  let matches = 0;
  const minLen = Math.min(t.length, r.length);
  for (let i = 0; i < minLen; i++) {
    if (t[i] === r[i]) matches++;
  }
  const similarity = (matches / Math.max(t.length, r.length)) * 100;

  // Bonus if recognized contains target
  if (r.includes(t) || t.includes(r)) return Math.min(100, similarity + 20);
  return Math.round(similarity);
}

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : score >= 40 ? "#fb923c" : "#ef4444";

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
        <circle cx="56" cy="56" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div className="text-center">
        <p className="text-2xl font-bold" style={{ color }}>{score}</p>
        <p className="text-xs text-white/40">/ 100</p>
      </div>
    </div>
  );
}

export default function PronunciationTab() {
  const HANJA_DATA = useHanjaData();
  const [selectedInitial, setSelectedInitial] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [recordState, setRecordState] = useState<RecordingState>("idle");
  const [countdown, setCountdown] = useState(3);
  const [recognized, setRecognized] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [history, setHistory] = useState<PronunciationRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem(PRON_HISTORY_KEY) || "[]"); } catch { return []; }
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [notSupported, setNotSupported] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const { addXP } = useXPSystem();
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pool = useMemo(() => {
    if (selectedInitial) return HANJA_DATA.filter(d => getInitial(d.korean[0]) === selectedInitial);
    return HANJA_DATA;
  }, [selectedInitial]);

  const current = pool[currentIdx % pool.length];

  useEffect(() => {
    setCurrentIdx(0);
    setRecordState("idle");
    setScore(null);
    setRecognized("");
  }, [selectedInitial]);

  const handleSpeak = async () => {
    if (isSpeaking || !current) return;
    setIsSpeaking(true);
    await speakKorean(current.korean);
    setIsSpeaking(false);
  };

  const handleSpeakSlow = async () => {
    if (isSpeaking || !current) return;
    setIsSpeaking(true);
    await speakKorean(current.korean, 0.5);
    setIsSpeaking(false);
  };

  const startRecording = useCallback(async () => {
    // Check support
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setNotSupported(true);
      return;
    }

    setRecordState("countdown");
    setCountdown(3);
    setScore(null);
    setRecognized("");

    // Countdown
    let c = 3;
    countdownRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(countdownRef.current!);
        setRecordState("recording");
        doRecord();
      }
    }, 1000);
  }, [current]);

  const doRecord = async () => {
    try {
      const result = await recognizeSpeech();
      setRecognized(result);
      const s = scorePronounciation(current.korean, result);
      setScore(s);
      setRecordState("result");

      // Save to history
      const record: PronunciationRecord = {
        korean: current.korean,
        hanja: current.hanja,
        vietnamese: current.vietnamese,
        score: s,
        date: new Date().toLocaleString("vi-VN"),
      };
      setHistory(prev => {
        const next = [record, ...prev].slice(0, 50);
        localStorage.setItem(PRON_HISTORY_KEY, JSON.stringify(next));
        return next;
      });

      // Award XP if score >= 60 (synced to server via useXPSystem)
      if (s >= 60) {
        const xp = s >= 80 ? 10 : 5;
        setXpGained(xp);
        addXP(xp, "Luyện phát âm Hán-Hàn");
        setTimeout(() => setXpGained(null), 2000);
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === "not_supported") {
        setNotSupported(true);
      }
      setRecordState("idle");
    }
  };

  const nextWord = () => {
    setCurrentIdx(i => (i + 1) % pool.length);
    setRecordState("idle");
    setScore(null);
    setRecognized("");
  };

  const prevWord = () => {
    setCurrentIdx(i => (i - 1 + pool.length) % pool.length);
    setRecordState("idle");
    setScore(null);
    setRecognized("");
  };

  const avgScore = history.length > 0 ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length) : 0;
  const perfectCount = history.filter(h => h.score >= 80).length;

  if (showHistory) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setShowHistory(false)}
            className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 cursor-pointer">
            <i className="ri-arrow-left-line"></i> Quay lại
          </button>
          <h2 className="text-base font-bold text-white">Lịch sử phát âm</h2>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <i className="ri-mic-line text-4xl"></i>
            <p className="mt-2 text-sm">Chưa có lịch sử phát âm</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 bg-app-surface/50 border border-app-border rounded-xl">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 text-sm font-bold ${
                  h.score >= 80 ? "bg-green-500/20 text-green-400" :
                  h.score >= 60 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {h.score}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{h.korean}</span>
                    <span className="text-app-accent-primary font-bold text-sm">{h.hanja}</span>
                  </div>
                  <p className="text-xs text-white/40">{h.vietnamese} · {h.date}</p>
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  h.score >= 80 ? "bg-green-500/20 text-green-400" :
                  h.score >= 60 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {h.score >= 80 ? "Tốt" : h.score >= 60 ? "Khá" : "Cần luyện"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Header stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Đã luyện", value: history.length, icon: "ri-mic-line", color: "#f43f5e" },
          { label: "Điểm TB", value: avgScore ? `${avgScore}%` : "—", icon: "ri-bar-chart-line", color: "#fb923c" },
          { label: "Phát âm tốt", value: perfectCount, icon: "ri-star-line", color: "#34d399" },
        ].map(s => (
          <div key={s.label} className="bg-app-surface/50 border border-app-border rounded-xl p-4 text-center">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-white/40">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <button onClick={() => setSelectedInitial(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${!selectedInitial ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/70 hover:bg-app-surface/80"}`}>
          Tất cả
        </button>
        {ALPHABET_GROUPS.map(g => (
          <button key={g} onClick={() => setSelectedInitial(selectedInitial === g ? null : g)}
            className={`px-2.5 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${selectedInitial === g ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/70 hover:bg-app-surface/80"}`}>
            {g}
          </button>
        ))}
      </div>

      {/* Not supported warning */}
      {notSupported && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4 flex items-start gap-3">
          <i className="ri-error-warning-line text-amber-400 flex-shrink-0 mt-0.5"></i>
          <div>
            <p className="text-sm font-semibold text-amber-400">Trình duyệt không hỗ trợ nhận dạng giọng nói</p>
            <p className="text-xs text-amber-400 mt-0.5">Vui lòng dùng Chrome hoặc Edge để sử dụng tính năng ghi âm. Bạn vẫn có thể nghe phát âm chuẩn TTS.</p>
          </div>
        </div>
      )}

      {/* Main card */}
      {current && (
        <div className="bg-app-surface/50 border-2 border-app-border rounded-2xl overflow-hidden mb-4">
          {/* Word display */}
          <div className="p-6 text-center border-b border-app-border">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevWord}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-app-surface/50 text-white/50 cursor-pointer hover:bg-app-surface/80 transition-colors">
                <i className="ri-arrow-left-line"></i>
              </button>
              <span className="text-xs text-white/40">{(currentIdx % pool.length) + 1} / {pool.length}</span>
              <button onClick={nextWord}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-app-surface/50 text-white/50 cursor-pointer hover:bg-app-surface/80 transition-colors">
                <i className="ri-arrow-right-line"></i>
              </button>
            </div>

            <p className="text-5xl font-bold text-white mb-2">{current.korean}</p>
            <p className="text-2xl font-bold text-app-accent-primary mb-1">{current.hanja}</p>
            <p className="text-sm text-white/50">{current.vietnamese}</p>
          </div>

          {/* TTS buttons */}
          <div className="flex gap-3 p-4 border-b border-app-border">
            <button onClick={handleSpeak} disabled={isSpeaking}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all ${isSpeaking ? "bg-app-accent-primary text-app-bg" : "bg-app-accent-primary/10 text-app-accent-primary hover:bg-app-accent-primary/20"}`}>
              <i className={isSpeaking ? "ri-volume-up-fill" : "ri-volume-up-line"}></i>
              {isSpeaking ? "Đang phát..." : "Nghe phát âm chuẩn"}
            </button>
            <button onClick={handleSpeakSlow} disabled={isSpeaking}
              className="flex items-center gap-2 px-4 py-3 bg-app-surface/30 text-white/70 rounded-xl text-sm font-medium cursor-pointer hover:bg-app-surface/70 transition-all whitespace-nowrap">
              <i className="ri-speed-line"></i>Chậm
            </button>
          </div>

          {/* Recording area */}
          <div className="p-6">
            {recordState === "idle" && (
              <div className="text-center">
                <p className="text-sm text-white/50 mb-4">Nghe phát âm chuẩn, sau đó nhấn ghi âm để luyện tập</p>
                <button onClick={startRecording}
                  className="flex items-center gap-3 px-8 py-4 bg-app-accent-primary text-app-bg rounded-2xl font-bold text-base cursor-pointer hover:bg-app-accent-primary/90 transition-all mx-auto">
                  <i className="ri-mic-line text-xl"></i>
                  Bắt đầu ghi âm
                </button>
                {notSupported && (
                  <p className="text-xs text-white/40 mt-3">Tính năng ghi âm không khả dụng trên trình duyệt này</p>
                )}
              </div>
            )}

            {recordState === "countdown" && (
              <div className="text-center py-4">
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-app-accent-primary/20 mx-auto mb-3">
                  <span className="text-4xl font-bold text-app-accent-primary">{countdown}</span>
                </div>
                <p className="text-sm text-white/50">Chuẩn bị đọc từ...</p>
              </div>
            )}

            {recordState === "recording" && (
              <div className="text-center py-4">
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-500/20 mx-auto mb-3 relative">
                  <i className="ri-mic-fill text-red-400 text-3xl"></i>
                  <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-30"></div>
                </div>
                <p className="text-sm font-semibold text-red-400">Đang ghi âm... Hãy đọc to từ trên!</p>
                <p className="text-xs text-white/40 mt-1">Tự động dừng sau 3 giây</p>
              </div>
            )}

            {recordState === "processing" && (
              <div className="text-center py-4">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-amber-500/20 mx-auto mb-3">
                  <i className="ri-loader-4-line text-amber-400 text-2xl animate-spin"></i>
                </div>
                <p className="text-sm text-white/50">Đang phân tích phát âm...</p>
              </div>
            )}

            {recordState === "result" && score !== null && (
              <div>
                {/* XP notification */}
                {xpGained && (
                  <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <i className="ri-star-fill text-amber-400"></i>
                    <span className="text-sm font-bold text-amber-400">+{xpGained} XP kiếm được!</span>
                  </div>
                )}

                <div className="flex items-center gap-6 mb-4">
                  <ScoreRing score={score} />
                  <div className="flex-1">
                    <p className={`text-lg font-bold mb-1 ${score >= 80 ? "text-green-400" : score >= 60 ? "text-amber-400" : "text-red-400"}`}>
                      {score >= 80 ? "Phát âm tốt!" : score >= 60 ? "Khá tốt!" : score >= 40 ? "Cần luyện thêm" : "Thử lại nhé!"}
                    </p>
                    {recognized && (
                      <div className="text-sm text-white/50">
                        <span className="text-white/40">Nhận dạng được: </span>
                        <span className="font-medium text-white/80">&ldquo;{recognized}&rdquo;</span>
                      </div>
                    )}
                    {!recognized && (
                      <p className="text-sm text-white/40">Không nhận dạng được giọng nói</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-white/40">Chuẩn:</span>
                      <span className="text-sm font-bold text-white">{current.korean}</span>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-app-surface/30 rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-white/70 mb-1">
                    {score >= 80 ? "Xuất sắc! Tiếp tục duy trì!" :
                     score >= 60 ? "Mẹo cải thiện:" : "Cần chú ý:"}
                  </p>
                  <p className="text-xs text-white/50">
                    {score >= 80 ? "Phát âm của bạn rất chuẩn. Hãy thử từ khó hơn!" :
                     score >= 60 ? "Nghe lại phát âm chuẩn và chú ý âm điệu. Luyện tập chậm trước." :
                     "Hãy nghe phát âm chuẩn nhiều lần, sau đó đọc theo từng âm tiết."}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={startRecording}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-app-accent-primary text-app-bg rounded-xl font-semibold cursor-pointer hover:bg-app-accent-primary/90 transition-colors">
                    <i className="ri-mic-line"></i>Thử lại
                  </button>
                  <button onClick={nextWord}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-app-border text-white/80 rounded-xl font-semibold cursor-pointer hover:bg-app-surface/50 transition-colors">
                    Từ tiếp theo<i className="ri-arrow-right-line"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips & History button */}
      <div className="flex gap-3">
        <div className="flex-1 bg-app-accent-primary/10 border border-app-accent-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-lightbulb-line text-app-accent-primary"></i>
            <span className="text-sm font-semibold text-app-accent-primary">Hướng dẫn luyện phát âm</span>
          </div>
          <ul className="space-y-1 text-xs text-app-accent-primary">
            <li className="flex items-start gap-1.5"><i className="ri-arrow-right-s-line mt-0.5 flex-shrink-0"></i>Nghe phát âm chuẩn TTS trước khi ghi âm</li>
            <li className="flex items-start gap-1.5"><i className="ri-arrow-right-s-line mt-0.5 flex-shrink-0"></i>Đọc to, rõ ràng trong môi trường yên tĩnh</li>
            <li className="flex items-start gap-1.5"><i className="ri-arrow-right-s-line mt-0.5 flex-shrink-0"></i>Đạt 80+ điểm để nhận +10 XP mỗi từ</li>
          </ul>
        </div>
        <button onClick={() => setShowHistory(true)}
          className="flex flex-col items-center justify-center gap-2 px-5 bg-app-surface/50 border border-app-border rounded-xl cursor-pointer hover:border-app-accent-primary transition-colors">
          <i className="ri-history-line text-white/40 text-xl"></i>
          <span className="text-xs text-white/50 whitespace-nowrap">Lịch sử</span>
          {history.length > 0 && (
            <span className="text-xs font-bold text-app-accent-primary">{history.length}</span>
          )}
        </button>
      </div>
    </div>
  );
}

