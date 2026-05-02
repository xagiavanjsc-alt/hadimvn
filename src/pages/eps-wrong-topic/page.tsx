import { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsLessons, EPS_LESSON_TOPICS, type EpsVocabItem } from "@/mocks/epsLessons";

// ── Types ──────────────────────────────────────────────────────────────────
interface WrongItem {
  korean: string;
  vietnamese: string;
  pronunciation: string;
  example: string;
  exampleVi: string;
  lessonId: number;
  lessonTitle: string;
  topic: string;
  wrongCount: number;
  lastWrong: string;
}

type ReviewMode = "flashcard" | "quiz" | "fill" | "listen";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speakKorean(text: string, rate = 0.75): Promise<void> {
  return new Promise(resolve => {
    if (!window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = rate;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold shadow-lg flex items-center gap-2 animate-bounce-in"
      style={{ animation: "slideUp 0.3s ease" }}
      onAnimationEnd={() => setTimeout(onDone, 2200)}
    >
      <i className="ri-checkbox-circle-fill text-base"></i>
      {message}
    </div>
  );
}

// ── Flashcard Review ───────────────────────────────────────────────────────
function FlashcardReview({
  items,
  onMastered,
}: {
  items: WrongItem[];
  onMastered: (korean: string) => void;
}) {
  const [cards] = useState(() => shuffle(items));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredSet, setMasteredSet] = useState<Set<string>>(new Set());
  const [stillWrong, setStillWrong] = useState<Set<string>>(new Set());

  const card = cards[idx];
  const progress = ((idx + 1) / cards.length) * 100;

  const handleMastered = () => {
    setMasteredSet(prev => new Set([...prev, card.korean]));
    onMastered(card.korean);
    advance();
  };

  const handleStillWrong = () => {
    setStillWrong(prev => new Set([...prev, card.korean]));
    advance();
  };

  const advance = () => {
    setFlipped(false);
    setTimeout(() => setIdx(i => Math.min(i + 1, cards.length - 1)), 200);
  };

  if (idx >= cards.length) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-app-accent-primary/10 rounded-full">
          <i className="ri-trophy-line text-app-accent-primary text-3xl"></i>
        </div>
        <h3 className="text-white text-xl font-bold mb-2">Hoàn thành!</h3>
        <p className="text-white/50 text-sm mb-6">
          Đã nhớ: <span className="text-app-accent-success font-bold">{masteredSet.size}</span> từ &nbsp;|&nbsp;
          Vẫn sai: <span className="text-red-400 font-bold">{stillWrong.size}</span> từ
        </p>
        <button
          onClick={() => { setIdx(0); setFlipped(false); setMasteredSet(new Set()); setStillWrong(new Set()); }}
          className="px-6 py-3 bg-app-accent-primary text-black font-bold rounded-xl cursor-pointer whitespace-nowrap"
        >
          Ôn lại từ đầu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-app-accent-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-app-text-secondary text-xs whitespace-nowrap">{idx + 1}/{cards.length}</span>
      </div>

      <div className="flex gap-4 justify-center text-sm">
        <span className="text-app-accent-success">✓ {masteredSet.size} đã nhớ</span>
        <span className="text-red-400">✗ {stillWrong.size} vẫn sai</span>
      </div>

      <div className="flex justify-center">
        <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
          Đã sai {card.wrongCount} lần
        </span>
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="bg-app-card/50 border border-app-border rounded-2xl p-8 text-center cursor-pointer hover:border-white/20 transition-all min-h-[220px] flex flex-col items-center justify-center"
      >
        {!flipped ? (
          <>
            <p className="text-white text-4xl font-bold mb-3">{card.korean}</p>
            <p className="text-white/35 text-sm">{card.pronunciation}</p>
            <p className="text-app-text-muted text-xs mt-4">Nhấn để xem nghĩa</p>
          </>
        ) : (
          <>
            <p className="text-app-accent-primary text-2xl font-bold mb-2">{card.vietnamese}</p>
            {card.example && (
              <div className="mt-3 text-left w-full border-t border-app-border pt-3">
                <p className="text-white/50 text-sm italic">{card.example}</p>
                <p className="text-app-text-muted text-xs mt-1">{card.exampleVi}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleStillWrong}
          className="flex-1 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-medium cursor-pointer whitespace-nowrap hover:bg-red-500/20 transition-all"
        >
          <i className="ri-close-line mr-1"></i> Vẫn chưa nhớ
        </button>
        <button
          onClick={handleMastered}
          className="flex-1 py-3 bg-emerald-500/10 border border-emerald-500/20 text-app-accent-success rounded-xl font-medium cursor-pointer whitespace-nowrap hover:bg-emerald-500/20 transition-all"
        >
          <i className="ri-check-line mr-1"></i> Đã nhớ rồi!
        </button>
      </div>
    </div>
  );
}

// ── Quiz Review ────────────────────────────────────────────────────────────
function QuizReview({ items, allItems }: { items: WrongItem[]; allItems: WrongItem[] }) {
  const [questions] = useState(() => {
    const shuffled = shuffle(items).slice(0, Math.min(20, items.length));
    return shuffled.map(q => {
      const wrong = shuffle(allItems.filter(v => v.korean !== q.korean)).slice(0, 3);
      const options = shuffle([q, ...wrong]);
      return { question: q, options, correctIdx: options.indexOf(q) };
    });
  });

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<WrongItem[]>([]);

  const q = questions[current];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correctIdx) {
      setScore(s => s + 1);
    } else {
      setWrongAnswers(prev => [...prev, q.question]);
    }
    setTimeout(() => {
      if (current + 1 >= questions.length) setFinished(true);
      else { setCurrent(c => c + 1); setSelected(null); }
    }, 1000);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-app-accent-primary/10 rounded-full">
          <i className="ri-trophy-line text-app-accent-primary text-4xl"></i>
        </div>
        <h3 className="text-white text-2xl font-bold mb-2">Kết quả</h3>
        <p className="text-5xl font-black mb-2" style={{ color: pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171" }}>
          {pct}%
        </p>
        <p className="text-white/50 text-sm mb-6">{score}/{questions.length} câu đúng</p>
        {wrongAnswers.length > 0 && (
          <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mb-6 text-left">
            <p className="text-red-400 text-xs font-semibold mb-2">Từ vẫn sai ({wrongAnswers.length}):</p>
            <div className="flex flex-wrap gap-2">
              {wrongAnswers.map((w, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-red-500/10 text-red-300 rounded-lg">{w.korean}</span>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => { setCurrent(0); setSelected(null); setScore(0); setFinished(false); setWrongAnswers([]); }}
          className="px-6 py-3 bg-app-accent-primary text-black font-bold rounded-xl cursor-pointer whitespace-nowrap"
        >
          Làm lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-app-accent-primary rounded-full transition-all duration-300" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
        <span className="text-app-text-secondary text-xs whitespace-nowrap">{current + 1}/{questions.length}</span>
      </div>

      <div className="bg-app-card/50 border border-app-border rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-3">
          <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            Đã sai {q.question.wrongCount} lần
          </span>
        </div>
        <p className="text-app-text-secondary text-xs mb-3">Nghĩa của từ này là gì?</p>
        <p className="text-white text-4xl font-bold mb-2">{q.question.korean}</p>
        <p className="text-white/35 text-sm">{q.question.pronunciation}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {q.options.map((opt, idx) => {
          let cls = "bg-app-card/50 border border-app-border text-white/70 hover:border-white/20 hover:bg-white/8";
          if (selected !== null) {
            if (idx === q.correctIdx) cls = "bg-app-accent-success/15 border border-emerald-500/40 text-app-accent-success";
            else if (idx === selected) cls = "bg-red-500/15 border border-red-500/40 text-red-400";
            else cls = "bg-app-surface/50 border border-app-border text-app-text-muted";
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full py-3 px-5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${cls}`}
            >
              {opt.vietnamese}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Fill Blank Review ──────────────────────────────────────────────────────
function FillReview({ items }: { items: WrongItem[] }) {
  const [cards] = useState(() => shuffle(items));
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const card = cards[idx];
  const isCorrect = submitted && input.trim().toLowerCase() === card.korean.toLowerCase();

  const handleSubmit = () => {
    if (!input.trim()) return;
    setSubmitted(true);
    if (input.trim().toLowerCase() === card.korean.toLowerCase()) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setInput("");
    setSubmitted(false);
    if (idx + 1 >= cards.length) setFinished(true);
    else setIdx(i => i + 1);
  };

  if (finished) {
    const pct = Math.round((score / cards.length) * 100);
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-app-accent-primary/10 rounded-full">
          <i className="ri-trophy-line text-app-accent-primary text-4xl"></i>
        </div>
        <h3 className="text-white text-2xl font-bold mb-2">Kết quả điền từ</h3>
        <p className="text-5xl font-black mb-2" style={{ color: pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171" }}>
          {pct}%
        </p>
        <p className="text-white/50 text-sm mb-6">{score}/{cards.length} câu đúng</p>
        <button
          onClick={() => { setIdx(0); setInput(""); setSubmitted(false); setScore(0); setFinished(false); }}
          className="px-6 py-3 bg-app-accent-primary text-black font-bold rounded-xl cursor-pointer whitespace-nowrap"
        >
          Làm lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-app-accent-primary rounded-full transition-all duration-300" style={{ width: `${((idx + 1) / cards.length) * 100}%` }} />
        </div>
        <span className="text-app-text-secondary text-xs whitespace-nowrap">{idx + 1}/{cards.length}</span>
      </div>

      <div className="bg-app-card/50 border border-app-border rounded-2xl p-8 text-center space-y-3">
        <div className="flex justify-center">
          <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            Đã sai {card.wrongCount} lần
          </span>
        </div>
        <p className="text-app-text-secondary text-xs">Điền từ tiếng Hàn có nghĩa:</p>
        <p className="text-app-accent-primary text-2xl font-bold">{card.vietnamese}</p>
        {card.example && (
          <p className="text-app-text-muted text-xs italic">{card.exampleVi}</p>
        )}
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !submitted) handleSubmit(); }}
          disabled={submitted}
          placeholder="Nhập từ tiếng Hàn..."
          className={`w-full rounded-xl px-5 py-4 text-lg font-bold text-center border transition-all focus:outline-none ${
            submitted
              ? isCorrect
                ? "bg-emerald-500/10 border-emerald-500/40 text-app-accent-success"
                : "bg-red-500/10 border-red-500/40 text-red-400"
              : "bg-app-card/50 border-app-border text-white focus:border-app-accent-primary/40"
          }`}
        />

        {submitted && (
          <div className={`p-4 rounded-xl border text-center ${isCorrect ? "bg-emerald-500/8 border-emerald-500/20" : "bg-red-500/8 border-red-500/20"}`}>
            {isCorrect ? (
              <p className="text-app-accent-success font-bold">Chính xác!</p>
            ) : (
              <>
                <p className="text-red-400 font-bold mb-1">Sai rồi!</p>
                <p className="text-white/60 text-sm">Đáp án đúng: <span className="text-white font-bold">{card.korean}</span></p>
                <p className="text-white/35 text-xs mt-1">[{card.pronunciation}]</p>
              </>
            )}
          </div>
        )}

        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="w-full py-3 bg-app-accent-primary text-black font-bold rounded-xl cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed hover:bg-app-accent-primary/90 transition-all"
          >
            Kiểm tra
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-app-card/70 text-white font-bold rounded-xl cursor-pointer whitespace-nowrap hover:bg-white/15 transition-all"
          >
            Từ tiếp theo <i className="ri-arrow-right-line ml-1"></i>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Listen & Fill Review ───────────────────────────────────────────────────
function ListenFillReview({ items }: { items: WrongItem[] }) {
  const [cards] = useState(() => shuffle(items));
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const card = cards[idx];
  const isCorrect = submitted && input.trim().toLowerCase() === card.korean.toLowerCase();

  const handlePlay = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setPlayCount(c => c + 1);
    await speakKorean(card.korean, 0.65);
    setIsPlaying(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [card.korean, isPlaying]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setSubmitted(true);
    if (input.trim().toLowerCase() === card.korean.toLowerCase()) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setInput("");
    setSubmitted(false);
    setPlayCount(0);
    setShowHint(false);
    if (idx + 1 >= cards.length) setFinished(true);
    else setIdx(i => i + 1);
  };

  if (finished) {
    const pct = Math.round((score / cards.length) * 100);
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-app-accent-primary/10 rounded-full">
          <i className="ri-trophy-line text-app-accent-primary text-4xl"></i>
        </div>
        <h3 className="text-white text-2xl font-bold mb-2">Kết quả Nghe & Điền</h3>
        <p className="text-5xl font-black mb-2" style={{ color: pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171" }}>
          {pct}%
        </p>
        <p className="text-white/50 text-sm mb-6">{score}/{cards.length} câu đúng</p>
        <button
          onClick={() => { setIdx(0); setInput(""); setSubmitted(false); setScore(0); setFinished(false); setPlayCount(0); setShowHint(false); }}
          className="px-6 py-3 bg-app-accent-primary text-black font-bold rounded-xl cursor-pointer whitespace-nowrap"
        >
          Làm lại
        </button>
      </div>
    );
  }

  // Build hint: show first char + underscores
  const hintText = card.korean.length > 0
    ? card.korean[0] + "_".repeat(Math.max(0, card.korean.length - 1))
    : "";

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-app-accent-primary rounded-full transition-all duration-300" style={{ width: `${((idx + 1) / cards.length) * 100}%` }} />
        </div>
        <span className="text-app-text-secondary text-xs whitespace-nowrap">{idx + 1}/{cards.length}</span>
      </div>

      <div className="flex gap-4 justify-center text-sm">
        <span className="text-app-accent-success">✓ {score} đúng</span>
        <span className="text-red-400">✗ {idx - score} sai</span>
      </div>

      {/* Wrong count badge */}
      <div className="flex justify-center">
        <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
          Đã sai {card.wrongCount} lần
        </span>
      </div>

      {/* Listen card */}
      <div className="bg-app-card/50 border border-app-border rounded-2xl p-8 text-center space-y-5">
        <p className="text-white/50 text-sm">Nghe phát âm rồi điền từ tiếng Hàn</p>

        {/* Big play button */}
        <button
          onClick={handlePlay}
          disabled={isPlaying || submitted}
          className={`mx-auto w-24 h-24 flex items-center justify-center rounded-full border-2 transition-all cursor-pointer ${
            isPlaying
              ? "border-app-accent-primary bg-app-accent-primary/20 scale-110"
              : submitted
              ? "border-app-border bg-app-surface/50 opacity-50 cursor-not-allowed"
              : "border-app-accent-primary/50 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 hover:scale-105"
          }`}
        >
          <i className={`${isPlaying ? "ri-volume-up-fill" : "ri-volume-up-line"} text-app-accent-primary text-4xl`}></i>
        </button>

        {playCount > 0 && !submitted && (
          <p className="text-app-text-muted text-xs">Đã nghe {playCount} lần — nhấn lại để nghe thêm</p>
        )}
        {playCount === 0 && (
          <p className="text-app-text-muted text-xs">Nhấn nút loa để nghe phát âm</p>
        )}

        {/* Meaning hint */}
        <div className="border-t border-app-border pt-4">
          <p className="text-app-text-muted text-xs mb-1">Nghĩa tiếng Việt:</p>
          <p className="text-app-accent-primary text-lg font-bold">{card.vietnamese}</p>
        </div>

        {/* Hint toggle */}
        {!submitted && playCount >= 2 && (
          <button
            onClick={() => setShowHint(h => !h)}
            className="text-xs text-app-text-muted hover:text-white/60 cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-lightbulb-line mr-1"></i>
            {showHint ? "Ẩn gợi ý" : "Xem gợi ý (chữ cái đầu)"}
          </button>
        )}
        {showHint && !submitted && (
          <p className="text-white/50 text-lg font-mono tracking-widest">{hintText}</p>
        )}
      </div>

      {/* Input */}
      <div className="space-y-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !submitted) handleSubmit(); }}
          disabled={submitted}
          placeholder="Điền từ tiếng Hàn bạn vừa nghe..."
          className={`w-full rounded-xl px-5 py-4 text-lg font-bold text-center border transition-all focus:outline-none ${
            submitted
              ? isCorrect
                ? "bg-emerald-500/10 border-emerald-500/40 text-app-accent-success"
                : "bg-red-500/10 border-red-500/40 text-red-400"
              : "bg-app-card/50 border-app-border text-white focus:border-app-accent-primary/40"
          }`}
        />

        {submitted && (
          <div className={`p-4 rounded-xl border text-center ${isCorrect ? "bg-emerald-500/8 border-emerald-500/20" : "bg-red-500/8 border-red-500/20"}`}>
            {isCorrect ? (
              <div>
                <p className="text-app-accent-success font-bold text-lg mb-1">Chính xác!</p>
                <p className="text-app-text-secondary text-xs">[{card.pronunciation}]</p>
              </div>
            ) : (
              <>
                <p className="text-red-400 font-bold mb-1">Sai rồi!</p>
                <p className="text-white/60 text-sm">Đáp án đúng: <span className="text-white font-bold text-xl">{card.korean}</span></p>
                <p className="text-white/35 text-xs mt-1">[{card.pronunciation}]</p>
                {card.example && (
                  <p className="text-app-text-muted text-xs mt-2 italic">{card.example}</p>
                )}
              </>
            )}
          </div>
        )}

        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || playCount === 0}
            className="w-full py-3 bg-app-accent-primary text-black font-bold rounded-xl cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed hover:bg-app-accent-primary/90 transition-all"
          >
            {playCount === 0 ? "Nghe trước rồi điền" : "Kiểm tra"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-app-card/70 text-white font-bold rounded-xl cursor-pointer whitespace-nowrap hover:bg-white/15 transition-all"
          >
            Từ tiếp theo <i className="ri-arrow-right-line ml-1"></i>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Export Modal ───────────────────────────────────────────────────────────
function ExportModal({ items, onClose }: { items: WrongItem[]; onClose: () => void }) {
  const [format, setFormat] = useState<"csv" | "txt" | "anki">("csv");
  const [includeExample, setIncludeExample] = useState(true);
  const [includePronunciation, setIncludePronunciation] = useState(true);

  const generateContent = () => {
    if (format === "csv") {
      const header = ["Tiếng Hàn", "Tiếng Việt", includePronunciation ? "Phát âm" : null, includeExample ? "Ví dụ" : null, includeExample ? "Dịch ví dụ" : null, "Số lần sai", "Chủ đề"]
        .filter(Boolean).join(",");
      const rows = items.map(item => {
        const cols = [
          `"${item.korean}"`,
          `"${item.vietnamese}"`,
          includePronunciation ? `"${item.pronunciation}"` : null,
          includeExample ? `"${item.example}"` : null,
          includeExample ? `"${item.exampleVi}"` : null,
          item.wrongCount,
          `"${item.topic}"`,
        ].filter(v => v !== null);
        return cols.join(",");
      });
      return [header, ...rows].join("\n");
    }

    if (format === "txt") {
      return items.map((item, i) => {
        const lines = [
          `${i + 1}. ${item.korean} — ${item.vietnamese}`,
          includePronunciation ? `   Phát âm: [${item.pronunciation}]` : null,
          includeExample && item.example ? `   Ví dụ: ${item.example}` : null,
          includeExample && item.exampleVi ? `   Dịch: ${item.exampleVi}` : null,
          `   Sai: ${item.wrongCount} lần | Chủ đề: ${item.topic}`,
        ].filter(Boolean);
        return lines.join("\n");
      }).join("\n\n");
    }

    // Anki format: front\tback
    return items.map(item => {
      const front = item.korean + (includePronunciation ? `\n[${item.pronunciation}]` : "");
      const back = item.vietnamese + (includeExample && item.example ? `\n${item.example}\n${item.exampleVi}` : "");
      return `${front}\t${back}`;
    }).join("\n");
  };

  const handleDownload = () => {
    const content = generateContent();
    const ext = format === "anki" ? "txt" : format;
    const mimeType = format === "csv" ? "text/csv;charset=utf-8;" : "text/plain;charset=utf-8;";
    const blob = new Blob(["\uFEFF" + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tu-sai-eps-${new Date().toISOString().slice(0, 10)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateContent());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-app-border">
          <div>
            <h3 className="text-white font-bold">Xuất danh sách từ sai</h3>
            <p className="text-app-text-secondary text-xs mt-0.5">{items.length} từ cần ôn lại</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-app-text-secondary cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Format */}
          <div>
            <p className="text-white/50 text-xs font-semibold mb-3">Định dạng xuất</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {([
                { id: "csv", icon: "ri-file-excel-line", label: "CSV", desc: "Excel/Sheets" },
                { id: "txt", icon: "ri-file-text-line", label: "TXT", desc: "Văn bản thuần" },
                { id: "anki", icon: "ri-stack-line", label: "Anki", desc: "Flashcard app" },
              ] as const).map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    format === f.id
                      ? "border-app-accent-primary/40 bg-app-accent-primary/8"
                      : "border-app-border bg-app-surface/50 hover:border-white/15"
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center mx-auto mb-1">
                    <i className={`${f.icon} text-xl ${format === f.id ? "text-app-accent-primary" : "text-app-text-secondary"}`}></i>
                  </div>
                  <p className={`text-xs font-bold ${format === f.id ? "text-app-accent-primary" : "text-white/60"}`}>{f.label}</p>
                  <p className="text-app-text-muted text-[10px]">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <p className="text-white/50 text-xs font-semibold mb-3">Tùy chọn nội dung</p>
            <div className="space-y-2">
              {[
                { label: "Bao gồm phát âm", value: includePronunciation, setter: setIncludePronunciation },
                { label: "Bao gồm câu ví dụ", value: includeExample, setter: setIncludeExample },
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => opt.setter(!opt.value)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-app-border hover:border-white/15 transition-all cursor-pointer"
                >
                  <span className="text-white/60 text-sm">{opt.label}</span>
                  <div className={`w-10 h-5 rounded-full transition-all relative ${opt.value ? "bg-app-accent-primary" : "bg-app-card/70"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${opt.value ? "left-5" : "left-0.5"}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-app-surface/50 border border-app-border rounded-xl p-3 max-h-32 overflow-y-auto">
            <p className="text-app-text-muted text-[10px] font-semibold mb-2 ">Xem trước</p>
            <pre className="text-white/50 text-[10px] font-mono whitespace-pre-wrap leading-relaxed">
              {generateContent().slice(0, 300)}{generateContent().length > 300 ? "..." : ""}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 py-3 bg-white/8 border border-app-border text-white/70 rounded-xl font-medium cursor-pointer whitespace-nowrap hover:bg-white/12 transition-all text-sm"
            >
              <i className="ri-clipboard-line mr-2"></i>Sao chép
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-3 bg-app-accent-primary text-black font-bold rounded-xl cursor-pointer whitespace-nowrap hover:bg-app-accent-primary/90 transition-all text-sm"
            >
              <i className="ri-download-line mr-2"></i>Tải xuống
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function EpsWrongTopicPage() {
  const navigate = useNavigate();
  const [wrongHistory] = useLocalStorage<Record<string, { count: number; lastWrong: string }>>(
    "kts_eps_wrong_history",
    {}
  );
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [reviewMode, setReviewMode] = useState<ReviewMode>("flashcard");
  const [started, setStarted] = useState(false);
  const [masteredWords, setMasteredWords] = useLocalStorage<string[]>("kts_eps_mastered_wrong", []);
  const [showExport, setShowExport] = useState(false);

  // Build wrong items from history
  const allWrongItems = useMemo<WrongItem[]>(() => {
    const result: WrongItem[] = [];
    epsLessons.forEach(lesson => {
      lesson.vocabulary.forEach((v: EpsVocabItem) => {
        const key = v.korean;
        if (wrongHistory[key] && !masteredWords.includes(key)) {
          result.push({
            korean: v.korean,
            vietnamese: v.vietnamese,
            pronunciation: v.pronunciation || "",
            example: v.example || "",
            exampleVi: v.exampleVi || "",
            lessonId: lesson.id,
            lessonTitle: lesson.titleVi,
            topic: lesson.topic,
            wrongCount: wrongHistory[key].count,
            lastWrong: wrongHistory[key].lastWrong,
          });
        }
      });
    });
    return result.sort((a, b) => b.wrongCount - a.wrongCount);
  }, [wrongHistory, masteredWords]);

  // Count wrong items per topic
  const topicWrongCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    EPS_LESSON_TOPICS.forEach(t => { counts[t.id] = 0; });
    allWrongItems.forEach(item => {
      if (counts[item.topic] !== undefined) counts[item.topic]++;
    });
    return counts;
  }, [allWrongItems]);

  // Filtered wrong items
  const filteredWrongItems = useMemo(() => {
    if (selectedTopics.size === 0) return allWrongItems;
    return allWrongItems.filter(item => selectedTopics.has(item.topic));
  }, [allWrongItems, selectedTopics]);

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMastered = (korean: string) => {
    setMasteredWords(prev => [...prev.filter(w => w !== korean), korean]);
  };

  const handleClearMastered = () => {
    setMasteredWords([]);
  };

  const totalWrong = allWrongItems.length;

  // If no wrong history at all
  if (totalWrong === 0 && !started) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 transition-all cursor-pointer"
            >
              <i className="ri-arrow-left-line text-white/60"></i>
            </button>
            <div>
              <h1 className="text-white text-xl font-bold">Ôn tập sai theo chủ đề</h1>
              <p className="text-app-text-secondary text-sm">Lọc và ôn lại từ vựng đã sai theo nhóm chủ đề</p>
            </div>
          </div>

          <div className="text-center py-20">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-emerald-500/10 rounded-full">
              <i className="ri-checkbox-circle-line text-app-accent-success text-4xl"></i>
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Chưa có từ sai nào!</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
              Hãy làm bài tập trong các bài học EPS để hệ thống ghi lại từ bạn trả lời sai.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => navigate("/eps-lessons")}
                className="px-5 py-2.5 bg-app-accent-primary text-black font-bold rounded-xl cursor-pointer whitespace-nowrap"
              >
                <i className="ri-book-open-line mr-2"></i>Đến 60 Bài Học EPS
              </button>
              <button
                onClick={() => navigate("/eps-topic-study")}
                className="px-5 py-2.5 bg-white/8 text-white/70 rounded-xl cursor-pointer whitespace-nowrap border border-app-border"
              >
                <i className="ri-bookmark-3-line mr-2"></i>Học theo chủ đề
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => started ? setStarted(false) : navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 transition-all cursor-pointer"
          >
            <i className="ri-arrow-left-line text-white/60"></i>
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Ôn tập sai theo chủ đề</h1>
            <p className="text-app-text-secondary text-sm">
              {totalWrong} từ cần ôn lại · {masteredWords.length} từ đã nhớ
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Export button */}
            {allWrongItems.length > 0 && !started && (
              <button
                onClick={() => setShowExport(true)}
                className="flex items-center gap-2 px-4 py-2 bg-app-card/50 border border-app-border text-white/60 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-app-card/70 hover:text-white/80 transition-all"
              >
                <i className="ri-download-line text-sm"></i>
                Xuất file
              </button>
            )}
            {masteredWords.length > 0 && !started && (
              <button
                onClick={handleClearMastered}
                className="text-xs text-app-text-muted hover:text-white/60 cursor-pointer whitespace-nowrap"
              >
                <i className="ri-refresh-line mr-1"></i>Reset đã nhớ
              </button>
            )}
          </div>
        </div>

        {!started ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Topic picker */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold">Chọn chủ đề để ôn</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTopics(new Set(EPS_LESSON_TOPICS.map(t => t.id)))}
                    className="text-xs text-app-accent-primary hover:underline cursor-pointer whitespace-nowrap"
                  >
                    Chọn tất cả
                  </button>
                  <span className="text-app-text-muted">|</span>
                  <button
                    onClick={() => setSelectedTopics(new Set())}
                    className="text-xs text-app-text-secondary hover:text-white/60 cursor-pointer whitespace-nowrap"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EPS_LESSON_TOPICS.map(topic => {
                  const count = topicWrongCounts[topic.id] || 0;
                  const isSelected = selectedTopics.has(topic.id);
                  return (
                    <button
                      key={topic.id}
                      onClick={() => toggleTopic(topic.id)}
                      disabled={count === 0}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        isSelected
                          ? "border-red-500/40 bg-red-500/8"
                          : "border-app-border bg-app-surface/50 hover:border-white/20 hover:bg-app-card/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${topic.color}20` }}
                        >
                          <i className={`${topic.icon} text-lg`} style={{ color: topic.color }}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${isSelected ? "text-red-400" : "text-white/80"}`}>
                            {topic.label}
                          </p>
                          <p className="text-app-text-secondary text-xs">
                            {count > 0 ? `${count} từ cần ôn` : "Không có từ sai"}
                          </p>
                        </div>
                        {isSelected && count > 0 && (
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                            <i className="ri-check-line text-red-400 text-sm"></i>
                          </div>
                        )}
                      </div>
                      {count > 0 && (
                        <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, (count / Math.max(...Object.values(topicWrongCounts))) * 100)}%`,
                              backgroundColor: topic.color,
                            }}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Top wrong words preview */}
              {filteredWrongItems.length > 0 && (
                <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
                  <p className="text-white/50 text-xs font-semibold mb-3">Từ sai nhiều nhất</p>
                  <div className="flex flex-wrap gap-2">
                    {filteredWrongItems.slice(0, 10).map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/8 border border-red-500/15 rounded-lg">
                        <span className="text-white/70 text-xs font-medium">{item.korean}</span>
                        <span className="text-red-400 text-[10px] font-bold">×{item.wrongCount}</span>
                      </div>
                    ))}
                    {filteredWrongItems.length > 10 && (
                      <span className="text-app-text-muted text-xs px-2 py-1.5">+{filteredWrongItems.length - 10} từ nữa</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Mode + Start */}
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                <p className="text-white/50 text-xs mb-1">Từ cần ôn lại</p>
                <p className="text-red-400 text-2xl font-bold">{filteredWrongItems.length}</p>
                <p className="text-app-text-muted text-xs mt-1">
                  từ {selectedTopics.size > 0 ? selectedTopics.size : EPS_LESSON_TOPICS.length} chủ đề
                </p>
              </div>

              {/* Mode picker */}
              <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 space-y-2">
                <p className="text-white/50 text-xs mb-3">Chế độ ôn tập</p>
                {(
                  [
                    { id: "flashcard", icon: "ri-stack-line", label: "Flashcard", desc: "Lật thẻ — nhớ/chưa nhớ" },
                    { id: "quiz", icon: "ri-survey-line", label: "Trắc nghiệm", desc: "Chọn đáp án đúng" },
                    { id: "fill", icon: "ri-edit-line", label: "Điền từ", desc: "Gõ từ tiếng Hàn" },
                    { id: "listen", icon: "ri-headphone-line", label: "Nghe & Điền", desc: "Nghe phát âm rồi điền" },
                  ] as const
                ).map(m => (
                  <button
                    key={m.id}
                    onClick={() => setReviewMode(m.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer text-left ${
                      reviewMode === m.id
                        ? "border-red-500/30 bg-red-500/8"
                        : "border-app-border hover:border-white/15 hover:bg-app-surface/50"
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 flex-shrink-0">
                      <i className={`${m.icon} text-sm ${reviewMode === m.id ? "text-red-400" : "text-app-text-secondary"}`}></i>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${reviewMode === m.id ? "text-red-400" : "text-white/70"}`}>{m.label}</p>
                      <p className="text-app-text-muted text-xs">{m.desc}</p>
                    </div>
                    {reviewMode === m.id && (
                      <div className="ml-auto w-4 h-4 flex items-center justify-center">
                        <i className="ri-check-line text-red-400 text-sm"></i>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Start button */}
              <button
                onClick={() => setStarted(true)}
                disabled={filteredWrongItems.length === 0}
                className="w-full py-4 bg-red-500 text-white font-bold rounded-xl cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-500/90 transition-all text-sm"
              >
                <i className="ri-refresh-line mr-2"></i>
                Bắt đầu ôn ({filteredWrongItems.length} từ)
              </button>

              {/* Quick links */}
              <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 space-y-2">
                <p className="text-app-text-secondary text-xs mb-2">Liên kết nhanh</p>
                <button
                  onClick={() => navigate("/eps-lessons")}
                  className="w-full flex items-center gap-2 text-white/50 hover:text-white/80 text-xs py-1.5 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-book-open-line text-sm"></i>
                  60 Bài học EPS
                </button>
                <button
                  onClick={() => navigate("/eps-topic-study")}
                  className="w-full flex items-center gap-2 text-white/50 hover:text-white/80 text-xs py-1.5 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-bookmark-3-line text-sm"></i>
                  Học theo chủ đề
                </button>
                <button
                  onClick={() => navigate("/wrong-review")}
                  className="w-full flex items-center gap-2 text-white/50 hover:text-white/80 text-xs py-1.5 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-error-warning-line text-sm"></i>
                  Ôn tập sai (tổng hợp)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Review screen ── */
          <div className="space-y-4">
            {/* Mode tabs */}
            <div className="flex items-center gap-1 bg-app-surface/50 border border-app-border rounded-xl p-1 w-fit flex-wrap">
              {(
                [
                  { id: "flashcard", icon: "ri-stack-line", label: "Flashcard" },
                  { id: "quiz", icon: "ri-survey-line", label: "Quiz" },
                  { id: "fill", icon: "ri-edit-line", label: "Điền từ" },
                  { id: "listen", icon: "ri-headphone-line", label: "Nghe & Điền" },
                ] as const
              ).map(m => (
                <button
                  key={m.id}
                  onClick={() => setReviewMode(m.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                    reviewMode === m.id
                      ? "bg-red-500 text-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  <i className={`${m.icon} text-sm`}></i>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Info bar */}
            <div className="flex items-center gap-4 text-xs text-app-text-muted">
              <span>
                {selectedTopics.size > 0
                  ? Array.from(selectedTopics)
                      .map(id => EPS_LESSON_TOPICS.find(t => t.id === id)?.label)
                      .filter(Boolean)
                      .join(", ")
                  : "Tất cả chủ đề"}
              </span>
              <span>•</span>
              <span>{filteredWrongItems.length} từ cần ôn</span>
            </div>

            {/* Review content */}
            {reviewMode === "flashcard" && (
              <FlashcardReview
                key={`fc-${filteredWrongItems.length}`}
                items={filteredWrongItems}
                onMastered={handleMastered}
              />
            )}
            {reviewMode === "quiz" && (
              <QuizReview
                key={`qz-${filteredWrongItems.length}`}
                items={filteredWrongItems}
                allItems={allWrongItems}
              />
            )}
            {reviewMode === "fill" && (
              <FillReview
                key={`fl-${filteredWrongItems.length}`}
                items={filteredWrongItems}
              />
            )}
            {reviewMode === "listen" && (
              <ListenFillReview
                key={`lf-${filteredWrongItems.length}`}
                items={filteredWrongItems}
              />
            )}
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExport && (
        <ExportModal
          items={filteredWrongItems.length > 0 ? filteredWrongItems : allWrongItems}
          onClose={() => setShowExport(false)}
        />
      )}
    </DashboardLayout>
  );
}


