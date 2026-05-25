import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { epsQuestions, EpsQuestion } from "@/mocks/epsQuestions";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { usePageSEO } from "@/hooks/usePageSEO";
import { SITE_URL } from "@/lib/siteConfig";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ExamResult {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeSpent: number;
}

type ExamPhase = "intro" | "exam" | "result";

// ─── Constants ───────────────────────────────────────────────────────────────
const TOTAL_QUESTIONS = 40;
const EXAM_DURATION = 40 * 60; // 40 phút tính bằng giây

// ─── Helpers ─────────────────────────────────────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function selectExamQuestions(): EpsQuestion[] {
  // Ưu tiên câu có ảnh và audio, sau đó fill đủ 40 câu
  const withImage = epsQuestions.filter(q => q.imageUrl);
  const withAudio = epsQuestions.filter(q => q.audioText && !q.imageUrl);
  const rest = epsQuestions.filter(q => !q.imageUrl && !q.audioText);

  const selected: EpsQuestion[] = [];
  // Lấy tối đa 10 câu có ảnh
  selected.push(...shuffleArray(withImage).slice(0, 10));
  // Lấy tối đa 15 câu có audio
  selected.push(...shuffleArray(withAudio).slice(0, 15));
  // Fill phần còn lại
  const needed = TOTAL_QUESTIONS - selected.length;
  selected.push(...shuffleArray(rest).slice(0, needed));

  return shuffleArray(selected).slice(0, TOTAL_QUESTIONS);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Audio Player Component ───────────────────────────────────────────────────
function AudioPlayer({ text, autoPlay = false }: { text: string; autoPlay?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setSupported(false);
      return;
    }
    if (autoPlay) {
      setTimeout(() => playAudio(), 500);
    }
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [text]);

  const playAudio = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ko-KR";
    utter.rate = 0.85;
    utter.pitch = 1;
    utter.onstart = () => setPlaying(true);
    utter.onend = () => setPlaying(false);
    utter.onerror = () => setPlaying(false);
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [text]);

  const stopAudio = useCallback(() => {
    window.speechSynthesis?.cancel();
    setPlaying(false);
  }, []);

  if (!supported) return null;

  return (
    <div className="flex items-center gap-3 p-4 bg-[#06b6d4]/8 border border-[#06b6d4]/20 rounded-xl mb-4">
      <button
        onClick={playing ? stopAudio : playAudio}
        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer flex-shrink-0 ${
          playing
            ? "bg-[#06b6d4] text-white animate-pulse"
            : "bg-[#06b6d4]/20 text-[#06b6d4] hover:bg-[#06b6d4]/30"
        }`}
      >
        <i className={`text-xl ${playing ? "ri-stop-fill" : "ri-play-fill"}`}></i>
      </button>
      <div className="flex-1">
        <p className="text-[#06b6d4] text-xs font-semibold mb-1">Câu nghe hiểu</p>
        <div className="flex items-center gap-1">
          {playing ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-[#06b6d4] rounded-full animate-bounce"
                style={{ height: `${8 + Math.random() * 16}px`, animationDelay: `${i * 0.1}s` }}
              />
            ))
          ) : (
            <div className="h-1 w-full bg-[#06b6d4]/20 rounded-full">
              <div className="h-full w-0 bg-[#06b6d4] rounded-full" />
            </div>
          )}
        </div>
        <p className="text-app-text-muted text-[10px] mt-1">Nhấn để nghe • Tiếng Hàn chuẩn</p>
      </div>
      <button
        onClick={playAudio}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary hover:text-white/70 hover:bg-white/8 transition-colors cursor-pointer"
        title="Nghe lại"
      >
        <i className="ri-repeat-line text-sm"></i>
      </button>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────
interface QuestionCardProps {
  question: EpsQuestion;
  index: number;
  total: number;
  selected: number | null;
  onSelect: (idx: number) => void;
  showResult?: boolean;
}

function QuestionCard({ question, index, total, selected, onSelect, showResult }: QuestionCardProps) {
  const isListening = question.topic === "listening";
  const isReading = question.topic === "reading";

  return (
    <div className="space-y-4">
      {/* Question header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-accent-primary/15 flex-shrink-0">
          <span className="text-app-accent-primary text-sm font-bold">{index + 1}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-app-text-secondary font-medium">
            {question.topicVi}
          </span>
          {question.imageUrl && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#a78bfa]/15 text-[#a78bfa] font-medium flex items-center gap-1">
              <i className="ri-image-line text-[10px]"></i> Có ảnh
            </span>
          )}
          {isListening && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#06b6d4]/15 text-[#06b6d4] font-medium flex items-center gap-1">
              <i className="ri-headphone-line text-[10px]"></i> Nghe hiểu
            </span>
          )}
          {isReading && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ec4899]/15 text-[#ec4899] font-medium flex items-center gap-1">
              <i className="ri-book-open-line text-[10px]"></i> Đọc hiểu
            </span>
          )}
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            question.difficulty === "easy" ? "bg-app-accent-success/15 text-app-accent-success" :
            question.difficulty === "medium" ? "bg-amber-500/15 text-amber-400" :
            "bg-rose-500/15 text-rose-400"
          }`}>
            {question.difficulty === "easy" ? "Dễ" : question.difficulty === "medium" ? "Trung bình" : "Khó"}
          </span>
        </div>
        <span className="ml-auto text-app-text-muted text-xs">{index + 1}/{total}</span>
      </div>

      {/* Image */}
      {question.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-app-border">
          <div className="w-full h-48 bg-app-card/50">
            <img
              src={question.imageUrl}
              alt={question.imageAlt || "Hình minh họa"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {question.imageCaption && (
            <div className="px-3 py-2 bg-app-surface/50 border-t border-app-border">
              <p className="text-app-text-secondary text-xs italic">{question.imageCaption}</p>
            </div>
          )}
        </div>
      )}

      {/* Audio player for listening questions */}
      {isListening && question.audioText && (
        <AudioPlayer text={question.audioText} autoPlay={false} />
      )}

      {/* Question text */}
      <div className="bg-app-surface/50 rounded-xl p-4 border border-app-border">
        {question.question.includes("\n") ? (
          <div className="space-y-2">
            {question.question.split("\n").map((line, i) => (
              <p key={i} className={`${i === 0 ? "text-white font-medium text-sm" : "text-[#06b6d4] text-sm bg-[#06b6d4]/8 px-3 py-2 rounded-lg border border-[#06b6d4]/15"}`}>
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-white font-medium text-sm leading-relaxed">{question.question}</p>
        )}
        <p className="text-app-text-secondary text-xs mt-2 leading-relaxed">{question.questionVi}</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          let style = "bg-app-surface/50 border-app-border text-white/70 hover:bg-white/6 hover:border-white/15";
          if (selected === i) {
            if (showResult) {
              style = i === question.correctIndex
                ? "bg-app-accent-success/15 border-emerald-500/40 text-emerald-300"
                : "bg-rose-500/15 border-rose-500/40 text-rose-300";
            } else {
              style = "bg-app-accent-primary/12 border-app-accent-primary/40 text-app-accent-primary";
            }
          } else if (showResult && i === question.correctIndex) {
            style = "bg-emerald-500/10 border-emerald-500/30 text-app-accent-success";
          }

          return (
            <button
              key={i}
              onClick={() => !showResult && onSelect(i)}
              disabled={showResult}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border transition-all text-left cursor-pointer ${style} ${showResult ? "cursor-default" : ""}`}
            >
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 mt-0.5 ${
                selected === i && !showResult ? "bg-app-accent-primary/20 text-app-accent-primary" :
                showResult && i === question.correctIndex ? "bg-emerald-500/20 text-app-accent-success" :
                showResult && selected === i ? "bg-rose-500/20 text-rose-400" :
                "bg-white/8 text-app-text-secondary"
              }`}>
                {["①", "②", "③", "④"][i]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{opt}</p>
                <p className="text-xs opacity-60 mt-0.5">{question.optionsVi[i]}</p>
              </div>
              {showResult && i === question.correctIndex && (
                <i className="ri-check-line text-app-accent-success flex-shrink-0 mt-0.5"></i>
              )}
              {showResult && selected === i && i !== question.correctIndex && (
                <i className="ri-close-line text-rose-400 flex-shrink-0 mt-0.5"></i>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation (show result mode) */}
      {showResult && (
        <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-lightbulb-line text-app-accent-primary text-sm"></i>
            <span className="text-app-accent-primary text-xs font-semibold">Giải thích</span>
          </div>
          <p className="text-white/60 text-xs leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ─── Intro Screen ─────────────────────────────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-app-accent-primary/15 border border-app-accent-primary/20 mx-auto mb-4">
          <i className="ri-file-list-3-line text-app-accent-primary text-4xl"></i>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Thi thử EPS mô phỏng thật</h1>
        <p className="text-white/50 text-sm">Đề thi giống format EPS-TOPIK chính thức nhất</p>
      </div>

      {/* Exam info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { icon: "ri-file-list-3-line", label: "Số câu hỏi", value: "40 câu", color: "#e8c84a" },
          { icon: "ri-timer-line", label: "Thời gian", value: "40 phút", color: "#34d399" },
          { icon: "ri-image-line", label: "Câu có ảnh", value: "~10 câu", color: "#a78bfa" },
          { icon: "ri-headphone-line", label: "Câu nghe hiểu", value: "~15 câu", color: "#06b6d4" },
        ].map((item, i) => (
          <div key={i} className="bg-app-surface/50 border border-app-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
              <i className={`${item.icon} text-lg`} style={{ color: item.color }}></i>
            </div>
            <div>
              <p className="text-app-text-secondary text-xs">{item.label}</p>
              <p className="text-white font-bold text-sm">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Format info */}
      <div className="bg-app-surface/50 border border-app-border rounded-xl p-5 mb-6 space-y-3">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <i className="ri-information-line text-app-accent-primary"></i>
          Thông tin đề thi
        </h3>
        {[
          { icon: "ri-image-2-line", text: "Câu hỏi có ảnh minh họa — nhìn hình chọn đáp án đúng", color: "#a78bfa" },
          { icon: "ri-volume-up-line", text: "Câu nghe hiểu — nhấn nút phát để nghe tiếng Hàn chuẩn", color: "#06b6d4" },
          { icon: "ri-book-open-line", text: "Câu đọc hiểu — đọc đoạn văn và chọn đáp án", color: "#ec4899" },
          { icon: "ri-chat-smile-2-line", text: "Câu giao tiếp — tình huống thực tế tại nơi làm việc", color: "#34d399" },
          { icon: "ri-scales-3-line", text: "Câu pháp luật — quyền lợi và nghĩa vụ người lao động", color: "#f59e0b" },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
            </div>
            <p className="text-white/50 text-xs leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Scoring */}
      <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <i className="ri-trophy-line text-app-accent-primary"></i>
          <span className="text-app-accent-primary font-semibold text-sm">Thang điểm</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Đậu", score: "≥ 80 điểm", color: "#34d399" },
            { label: "Trung bình", score: "60-79 điểm", color: "#e8c84a" },
            { label: "Chưa đậu", score: "< 60 điểm", color: "#f87171" },
          ].map((item, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-app-surface/50">
              <p className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.label}</p>
              <p className="text-white/50 text-[10px]">{item.score}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full py-4 bg-app-accent-primary text-app-bg font-bold text-base rounded-xl hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
      >
        <i className="ri-play-fill text-lg"></i>
        Bắt đầu thi ngay
      </button>
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────
interface ResultScreenProps {
  questions: EpsQuestion[];
  results: ExamResult[];
  timeUsed: number;
  onReview: () => void;
  onRetry: () => void;
}

function ResultScreen({ questions, results, timeUsed, onReview, onRetry }: ResultScreenProps) {
  const navigate = useNavigate();
  const correct = results.filter(r => r.isCorrect).length;
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= 80;

  // Topic breakdown
  const topicStats: Record<string, { correct: number; total: number; label: string }> = {};
  questions.forEach((q, i) => {
    if (!topicStats[q.topic]) topicStats[q.topic] = { correct: 0, total: 0, label: q.topicVi };
    topicStats[q.topic].total++;
    if (results[i]?.isCorrect) topicStats[q.topic].correct++;
  });

  // Save to history
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.EPS_EXAM_HISTORY) || "[]");
    history.unshift({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: "mock",
      typeLabel: "Thi mô phỏng thật",
      score,
      correct,
      total: questions.length,
      timeUsed,
      passed,
    });
    localStorage.setItem(STORAGE_KEYS.EPS_EXAM_HISTORY, JSON.stringify(history.slice(0, 50)));

    // Save wrong answers
    const wrongAnswers = JSON.parse(localStorage.getItem(STORAGE_KEYS.EPS_WRONG_ANSWERS) || "[]");
    results.forEach((r, i) => {
      if (!r.isCorrect) {
        const q = questions[i];
        const existing = wrongAnswers.findIndex((w: { questionId: string }) => w.questionId === q.id);
        if (existing >= 0) {
          wrongAnswers[existing].wrongCount = (wrongAnswers[existing].wrongCount || 1) + 1;
          wrongAnswers[existing].lastWrong = new Date().toISOString();
        } else {
          wrongAnswers.push({
            questionId: q.id,
            question: q,
            selectedIndex: r.selectedIndex,
            wrongCount: 1,
            lastWrong: new Date().toISOString(),
            source: "mock",
          });
        }
      }
    });
    localStorage.setItem(STORAGE_KEYS.EPS_WRONG_ANSWERS, JSON.stringify(wrongAnswers));
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Score card */}
      <div className={`rounded-2xl p-6 text-center border ${passed ? "bg-emerald-500/8 border-emerald-500/20" : "bg-rose-500/8 border-rose-500/20"}`}>
        <div className={`w-24 h-24 flex items-center justify-center rounded-full mx-auto mb-4 ${passed ? "bg-app-accent-success/15" : "bg-rose-500/15"}`}>
          <span className={`text-4xl font-black ${passed ? "text-app-accent-success" : "text-rose-400"}`}>{score}</span>
        </div>
        <h2 className={`text-xl font-bold mb-1 ${passed ? "text-app-accent-success" : "text-rose-400"}`}>
          {passed ? "ĐẬU! Xuất sắc!" : "Chưa đậu — Cố lên!"}
        </h2>
        <p className="text-white/50 text-sm">{correct}/{questions.length} câu đúng • {formatTime(timeUsed)} đã dùng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Câu đúng", value: correct, color: "#34d399", icon: "ri-check-line" },
          { label: "Câu sai", value: questions.length - correct, color: "#f87171", icon: "ri-close-line" },
          { label: "Điểm số", value: `${score}/100`, color: "#e8c84a", icon: "ri-trophy-line" },
        ].map((item, i) => (
          <div key={i} className="bg-app-surface/50 border border-app-border rounded-xl p-4 text-center">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${item.color}15` }}>
              <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
            </div>
            <p className="text-white font-bold text-lg">{item.value}</p>
            <p className="text-app-text-secondary text-xs">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Topic breakdown */}
      <div className="bg-app-surface/50 border border-app-border rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <i className="ri-bar-chart-2-line text-app-accent-primary"></i>
          Kết quả theo chủ đề
        </h3>
        <div className="space-y-3">
          {Object.entries(topicStats).map(([topic, stat]) => {
            const pct = Math.round((stat.correct / stat.total) * 100);
            const color = pct >= 80 ? "#34d399" : pct >= 60 ? "#e8c84a" : "#f87171";
            return (
              <div key={topic}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60 text-xs">{stat.label}</span>
                  <span className="text-xs font-bold" style={{ color }}>{stat.correct}/{stat.total} ({pct}%)</span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onReview}
          className="flex items-center justify-center gap-2 py-3 bg-app-card/50 border border-app-border rounded-xl text-white/70 text-sm font-medium hover:bg-white/8 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-eye-line"></i>
          Xem lại đáp án
        </button>
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 py-3 bg-app-accent-primary text-app-bg rounded-xl text-sm font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-refresh-line"></i>
          Thi lại
        </button>
      </div>
      <button
        onClick={() => navigate("/eps-smart-wrong")}
        className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium hover:bg-rose-500/15 transition-colors cursor-pointer whitespace-nowrap"
      >
        <i className="ri-error-warning-line"></i>
        Ôn tập câu sai thông minh
      </button>
    </div>
  );
}

// ─── Persisted session shape ─────────────────────────────────────────────────
// EPS users typically take the exam on mobile with flaky 4G — an accidental
// refresh or backgrounded tab would otherwise wipe 20+ minutes of work.
interface PersistedExamSession {
  questions: EpsQuestion[];
  answers: (number | null)[];
  currentIndex: number;
  timeLeft: number;
  savedAt: number;
}

function loadPersistedSession(): PersistedExamSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EPS_MOCK_EXAM_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedExamSession;
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) return null;
    if (!Array.isArray(parsed.answers) || parsed.answers.length !== parsed.questions.length) return null;
    // Drop sessions older than 2× exam duration to avoid resuming abandoned attempts
    if (Date.now() - parsed.savedAt > EXAM_DURATION * 2 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearPersistedSession(): void {
  try { localStorage.removeItem(STORAGE_KEYS.EPS_MOCK_EXAM_SESSION); } catch {}
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EpsMockExamPage() {
  // Lazily resume any in-progress exam saved before an accidental refresh
  const resumed = useRef<PersistedExamSession | null>(typeof window !== "undefined" ? loadPersistedSession() : null);

  const [phase, setPhase] = useState<ExamPhase>(resumed.current ? "exam" : "intro");
  const [questions, setQuestions] = useState<EpsQuestion[]>(resumed.current?.questions ?? []);
  const [currentIndex, setCurrentIndex] = useState(resumed.current?.currentIndex ?? 0);
  const [answers, setAnswers] = useState<(number | null)[]>(resumed.current?.answers ?? []);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(resumed.current?.timeLeft ?? EXAM_DURATION);
  const [timeUsed, setTimeUsed] = useState(0);

  usePageSEO({
    title: "Thi thử EPS-TOPIK online — 40 câu, 50 phút | Hàn Quốc Ơi!",
    description: "Thi thử EPS-TOPIK miễn phí: 40 câu nghe + đọc trong 50 phút, đúng format đề thi chính thức. Có đáp án + giải thích sau khi thi. Phân tích điểm yếu theo chủ đề.",
    keywords: "thi thử EPS, thi thử EPS-TOPIK online, đề thi EPS 40 câu, luyện thi EPS XKLĐ Hàn Quốc, kiểm tra EPS",
    path: "/eps-mock-exam",
    ogType: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: "Thi thử EPS-TOPIK online",
      description: "Bài thi thử EPS-TOPIK 40 câu trong 50 phút theo chuẩn đề thi chính thức.",
      educationalLevel: "EPS-TOPIK",
      learningResourceType: "Practice Exam",
      inLanguage: ["ko", "vi"],
      timeRequired: "PT50M",
      numberOfQuestions: 40,
      isAccessibleForFree: true,
      provider: {
        "@type": "EducationalOrganization",
        name: "Hàn Quốc Ơi!",
        url: SITE_URL,
      },
    },
  });
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startExam = useCallback(() => {
    const qs = selectExamQuestions();
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(null));
    setCurrentIndex(0);
    setTimeLeft(EXAM_DURATION);
    setTimeUsed(0);
    setQuestionStartTime(Date.now());
    setPhase("exam");
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== "exam") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Persist in-progress exam so an accidental refresh / tab close doesn't lose
  // 20+ minutes of work for users on flaky mobile connections.
  useEffect(() => {
    if (phase !== "exam" || questions.length === 0) return;
    try {
      const session: PersistedExamSession = { questions, answers, currentIndex, timeLeft, savedAt: Date.now() };
      localStorage.setItem(STORAGE_KEYS.EPS_MOCK_EXAM_SESSION, JSON.stringify(session));
    } catch {
      // Quota or storage unavailable — silent fallback, exam continues in-memory
    }
  }, [phase, questions, answers, currentIndex, timeLeft]);

  const selectAnswer = useCallback((idx: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentIndex] = idx;
      return next;
    });
  }, [currentIndex]);

  const goNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  }, [currentIndex, questions.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  }, [currentIndex]);

  const submitExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const used = EXAM_DURATION - timeLeft;
    setTimeUsed(used);
    const res: ExamResult[] = questions.map((q, i) => ({
      questionId: q.id,
      selectedIndex: answers[i] ?? -1,
      isCorrect: answers[i] === q.correctIndex,
      timeSpent: 0,
    }));
    setResults(res);
    setPhase("result");
    clearPersistedSession();
  }, [questions, answers, timeLeft]);

  const answered = answers.filter(a => a !== null).length;
  const timerColor = timeLeft < 300 ? "#f87171" : timeLeft < 600 ? "#fb923c" : "#34d399";

  if (phase === "intro") {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8">
          <IntroScreen onStart={startExam} />
        </div>
      </DashboardLayout>
    );
  }

  if (phase === "result") {
    if (reviewMode) {
      const q = questions[reviewIndex];
      const r = results[reviewIndex];
      return (
        <DashboardLayout>
          <div className="p-6 md:p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setReviewMode(false)}
                className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors cursor-pointer text-sm"
              >
                <i className="ri-arrow-left-line"></i>
                Về kết quả
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReviewIndex(prev => Math.max(0, prev - 1))}
                  disabled={reviewIndex === 0}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary hover:bg-white/8 disabled:opacity-30 cursor-pointer"
                >
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                <span className="text-white/50 text-sm">{reviewIndex + 1}/{questions.length}</span>
                <button
                  onClick={() => setReviewIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={reviewIndex === questions.length - 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary hover:bg-white/8 disabled:opacity-30 cursor-pointer"
                >
                  <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
            </div>
            <div className={`mb-4 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${r.isCorrect ? "bg-emerald-500/10 text-app-accent-success" : "bg-rose-500/10 text-rose-400"}`}>
              <i className={r.isCorrect ? "ri-check-line" : "ri-close-line"}></i>
              {r.isCorrect ? "Trả lời đúng" : "Trả lời sai"}
            </div>
            <QuestionCard
              question={q}
              index={reviewIndex}
              total={questions.length}
              selected={r.selectedIndex}
              onSelect={() => {}}
              showResult
            />
          </div>
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout>
        <div className="p-6 md:p-8">
          <ResultScreen
            questions={questions}
            results={results}
            timeUsed={timeUsed}
            onReview={() => { setReviewMode(true); setReviewIndex(0); }}
            onRetry={() => { setPhase("intro"); setResults([]); clearPersistedSession(); }}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Exam phase
  const currentQ = questions[currentIndex];
  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <div className="flex-shrink-0 bg-app-bg border-b border-app-border px-4 py-3 flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-app-card/50 border border-app-border">
            <i className="ri-timer-line text-sm" style={{ color: timerColor }}></i>
            <span className="font-mono font-bold text-sm" style={{ color: timerColor }}>{formatTime(timeLeft)}</span>
          </div>

          {/* Progress */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-app-text-secondary text-xs">Câu {currentIndex + 1}/{questions.length}</span>
              <span className="text-app-text-secondary text-xs">{answered}/{questions.length} đã trả lời</span>
            </div>
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-app-accent-primary rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={submitExam}
            className="px-4 py-1.5 bg-app-accent-primary text-app-bg rounded-lg text-xs font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap"
          >
            Nộp bài
          </button>
        </div>

        {/* Question area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4 md:p-6">
            <QuestionCard
              question={currentQ}
              index={currentIndex}
              total={questions.length}
              selected={answers[currentIndex]}
              onSelect={selectAnswer}
            />
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="flex-shrink-0 bg-app-bg border-t border-app-border px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-app-card/50 border border-app-border rounded-xl text-white/60 text-sm hover:bg-white/8 disabled:opacity-30 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-arrow-left-line"></i>
              Câu trước
            </button>

            {/* Question dots */}
            <div className="flex-1 flex items-center gap-1 overflow-x-auto py-1">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-6 h-6 flex-shrink-0 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    i === currentIndex
                      ? "bg-app-accent-primary text-app-bg"
                      : answers[i] !== null
                      ? "bg-app-accent-primary/20 text-app-accent-primary"
                      : "bg-white/8 text-app-text-muted"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={currentIndex === questions.length - 1 ? submitExam : goNext}
              className="flex items-center gap-2 px-4 py-2.5 bg-app-accent-primary text-app-bg rounded-xl text-sm font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap"
            >
              {currentIndex === questions.length - 1 ? "Nộp bài" : "Câu tiếp"}
              <i className={currentIndex === questions.length - 1 ? "ri-check-line" : "ri-arrow-right-line"}></i>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

