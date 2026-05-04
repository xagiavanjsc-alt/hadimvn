import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { epsLessons, EPS_LESSON_TOPICS, EpsVocabItem } from "@/mocks/epsLessons";

// ── Types ──────────────────────────────────────────────────────────────────
interface VocabCard {
  korean: string;
  vietnamese: string;
  pronunciation: string;
  example: string;
  exampleVi: string;
  lessonId: number;
  lessonTitle: string;
}

type StudyMode = "browse" | "flashcard" | "quiz" | "listen" | "fill";

// ── Helpers ────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

// ── Sub-components ─────────────────────────────────────────────────────────
function TopicCard({
  topic,
  count,
  isSelected,
  onClick,
}: {
  topic: (typeof EPS_LESSON_TOPICS)[0];
  count: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? "border-app-accent-primary bg-app-accent-primary/10"
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
          <p className={`text-sm font-semibold truncate ${isSelected ? "text-app-accent-primary" : "text-white/80"}`}>
            {topic.label}
          </p>
          <p className="text-app-text-secondary text-xs">{count} từ vựng</p>
        </div>
        {isSelected && (
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <i className="ri-check-line text-app-accent-primary text-sm"></i>
          </div>
        )}
      </div>
    </button>
  );
}

function BrowseMode({ vocab }: { vocab: VocabCard[] }) {
  const [search, setSearch] = useState("");
  const [showVi, setShowVi] = useState(true);

  const filtered = useMemo(() => {
    if (!search.trim()) return vocab;
    const q = search.toLowerCase();
    return vocab.filter(
      (v) =>
        v.korean.toLowerCase().includes(q) ||
        v.vietnamese.toLowerCase().includes(q) ||
        v.pronunciation.toLowerCase().includes(q)
    );
  }, [vocab, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
            <i className="ri-search-line text-app-text-muted text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Tìm từ vựng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-app-card/50 border border-app-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-app-accent-primary/40"
          />
        </div>
        <button
          onClick={() => setShowVi(!showVi)}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            showVi ? "bg-app-accent-primary/10 text-app-accent-primary border border-app-accent-primary/30" : "bg-app-card/50 text-white/50 border border-app-border"
          }`}
        >
          {showVi ? "Ẩn nghĩa" : "Hiện nghĩa"}
        </button>
      </div>

      <p className="text-app-text-muted text-xs">{filtered.length} từ</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((v, i) => (
          <div
            key={i}
            className="bg-app-surface/50 border border-app-border rounded-xl p-4 hover:border-white/15 transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-lg leading-tight">{v.korean}</p>
                  <button
                    onClick={() => speakKorean(v.korean)}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-app-accent-primary/10 hover:bg-app-accent-primary/20 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <i className="ri-volume-up-line text-app-accent-primary text-xs"></i>
                  </button>
                </div>
                <p className="text-white/35 text-xs mt-0.5">{v.pronunciation}</p>
              </div>
              <span className="text-[10px] text-app-text-muted bg-app-card/50 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                Bài {v.lessonId}
              </span>
            </div>
            {showVi && (
              <p className="text-app-accent-primary text-sm font-medium mb-2">{v.vietnamese}</p>
            )}
            {v.example && (
              <div className="border-t border-app-border pt-2 mt-2">
                <p className="text-white/50 text-xs italic">{v.example}</p>
                {showVi && v.exampleVi && (
                  <p className="text-app-text-muted text-xs mt-0.5">{v.exampleVi}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-app-text-muted">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <i className="ri-search-line text-3xl"></i>
          </div>
          <p>Không tìm thấy từ nào</p>
        </div>
      )}
    </div>
  );
}

function FlashcardMode({ vocab }: { vocab: VocabCard[] }) {
  const [cards] = useState(() => shuffle(vocab));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());

  const card = cards[idx];
  const progress = ((idx + 1) / cards.length) * 100;

  const handleKnow = () => {
    setKnown((prev) => new Set([...prev, idx]));
    setFlipped(false);
    setTimeout(() => setIdx((i) => Math.min(i + 1, cards.length - 1)), 200);
  };

  const handleUnknow = () => {
    setUnknown((prev) => new Set([...prev, idx]));
    setFlipped(false);
    setTimeout(() => setIdx((i) => Math.min(i + 1, cards.length - 1)), 200);
  };

  if (idx >= cards.length) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-app-accent-primary/10 rounded-full">
          <i className="ri-trophy-line text-app-accent-primary text-3xl"></i>
        </div>
        <h3 className="text-white text-xl font-bold mb-2">Hoàn thành!</h3>
        <p className="text-white/50 text-sm mb-6">
          Biết: <span className="text-app-accent-success font-bold">{known.size}</span> từ &nbsp;|&nbsp;
          Chưa biết: <span className="text-red-400 font-bold">{unknown.size}</span> từ
        </p>
        <button
          onClick={() => { setIdx(0); setFlipped(false); setKnown(new Set()); setUnknown(new Set()); }}
          className="px-6 py-3 bg-app-accent-primary text-black font-bold rounded-xl cursor-pointer whitespace-nowrap"
        >
          Học lại từ đầu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-app-accent-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="text-app-text-secondary text-xs whitespace-nowrap">{idx + 1}/{cards.length}</span>
      </div>

      <div className="flex gap-4 justify-center text-sm">
        <span className="text-app-accent-success">✓ {known.size} biết</span>
        <span className="text-red-400">✗ {unknown.size} chưa biết</span>
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="bg-app-card/50 border border-app-border rounded-2xl p-8 text-center cursor-pointer hover:border-white/20 transition-all min-h-[220px] flex flex-col items-center justify-center"
      >
        {!flipped ? (
          <>
            <p className="text-white text-4xl font-bold mb-3">{card.korean}</p>
            <p className="text-white/35 text-sm">{card.pronunciation}</p>
            <button
              onClick={e => { e.stopPropagation(); speakKorean(card.korean); }}
              className="mt-3 w-9 h-9 flex items-center justify-center rounded-xl bg-app-accent-primary/10 hover:bg-app-accent-primary/20 transition-colors cursor-pointer"
            >
              <i className="ri-volume-up-line text-app-accent-primary"></i>
            </button>
            <p className="text-app-text-muted text-xs mt-3">Nhấn để xem nghĩa</p>
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
          onClick={handleUnknow}
          className="flex-1 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-medium cursor-pointer whitespace-nowrap hover:bg-red-500/20 transition-all"
        >
          <i className="ri-close-line mr-1"></i> Chưa biết
        </button>
        <button
          onClick={handleKnow}
          className="flex-1 py-3 bg-emerald-500/10 border border-emerald-500/20 text-app-accent-success rounded-xl font-medium cursor-pointer whitespace-nowrap hover:bg-emerald-500/20 transition-all"
        >
          <i className="ri-check-line mr-1"></i> Đã biết
        </button>
      </div>
    </div>
  );
}

function QuizMode({ vocab }: { vocab: VocabCard[] }) {
  const [questions] = useState(() => {
    const shuffled = shuffle(vocab).slice(0, Math.min(20, vocab.length));
    return shuffled.map((q) => {
      const wrong = shuffle(vocab.filter((v) => v.korean !== q.korean)).slice(0, 3);
      const options = shuffle([q, ...wrong]);
      return { question: q, options, correctIdx: options.indexOf(q) };
    });
  });

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[current];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correctIdx) setScore((s) => s + 1);
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setFinished(true);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
      }
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
        <p className="text-white/50 text-sm mb-6">
          {score}/{questions.length} câu đúng
        </p>
        <button
          onClick={() => { setCurrent(0); setSelected(null); setScore(0); setFinished(false); }}
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
          <div
            className="h-full bg-app-accent-primary rounded-full transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <span className="text-app-text-secondary text-xs whitespace-nowrap">{current + 1}/{questions.length}</span>
      </div>

      <div className="bg-app-card/50 border border-app-border rounded-2xl p-8 text-center">
        <p className="text-app-text-secondary text-xs mb-3">Nghĩa của từ này là gì?</p>
        <p className="text-white text-4xl font-bold mb-2">{q.question.korean}</p>
        <p className="text-white/35 text-sm">{q.question.pronunciation}</p>
        <button
          onClick={() => speakKorean(q.question.korean)}
          className="mt-3 w-9 h-9 flex items-center justify-center rounded-xl bg-app-accent-primary/10 hover:bg-app-accent-primary/20 transition-colors cursor-pointer mx-auto"
        >
          <i className="ri-volume-up-line text-app-accent-primary"></i>
        </button>
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

// ── Listen Mode (Nghe phát âm + điền từ) ──────────────────────────────────
function ListenMode({ vocab }: { vocab: VocabCard[] }) {
  const [cards] = useState(() => shuffle(vocab).slice(0, Math.min(20, vocab.length)));
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const card = cards[idx];

  useEffect(() => {
    if (!submitted) {
      inputRef.current?.focus();
    }
  }, [idx, submitted]);

  const playAudio = () => {
    speakKorean(card.korean);
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000);
  };

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
    setShowHint(false);
    if (idx + 1 >= cards.length) setFinished(true);
    else setIdx(i => i + 1);
  };

  const isCorrect = submitted && input.trim().toLowerCase() === card.korean.toLowerCase();

  if (finished) {
    const pct = Math.round((score / cards.length) * 100);
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-app-accent-primary/10 rounded-full">
          <i className="ri-trophy-line text-app-accent-primary text-4xl"></i>
        </div>
        <h3 className="text-white text-2xl font-bold mb-2">Kết quả nghe</h3>
        <p className="text-5xl font-black mb-2" style={{ color: pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171" }}>
          {pct}%
        </p>
        <p className="text-white/50 text-sm mb-6">{score}/{cards.length} câu đúng</p>
        <button
          onClick={() => { setIdx(0); setInput(""); setSubmitted(false); setScore(0); setFinished(false); setShowHint(false); }}
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

      <div className="flex gap-4 justify-center text-sm">
        <span className="text-app-accent-success">✓ {score} đúng</span>
        <span className="text-red-400">✗ {idx - score} sai</span>
      </div>

      {/* Audio card */}
      <div className="bg-app-card/50 border border-app-border rounded-2xl p-8 text-center space-y-4">
        <p className="text-app-text-secondary text-xs">Nghe và điền từ tiếng Hàn</p>

        {/* Big play button */}
        <button
          onClick={playAudio}
          className={`w-24 h-24 flex items-center justify-center rounded-full mx-auto transition-all cursor-pointer ${
            isPlaying
              ? "bg-app-accent-primary scale-110"
              : "bg-app-accent-primary/15 hover:bg-app-accent-primary/25 hover:scale-105"
          }`}
        >
          <i className={`${isPlaying ? "ri-volume-up-fill" : "ri-play-circle-line"} text-4xl ${isPlaying ? "text-black" : "text-app-accent-primary"}`}></i>
        </button>

        {isPlaying && (
          <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-app-accent-primary rounded-full animate-pulse"
                style={{ height: `${8 + Math.random() * 16}px`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}

        <p className="text-app-text-muted text-xs">Nhấn để nghe phát âm</p>

        {/* Hint: Vietnamese meaning */}
        <div className="border-t border-app-border pt-3">
          {showHint ? (
            <p className="text-app-accent-primary text-sm font-medium">{card.vietnamese}</p>
          ) : (
            <button
              onClick={() => setShowHint(true)}
              className="text-app-text-muted text-xs hover:text-white/50 cursor-pointer whitespace-nowrap"
            >
              <i className="ri-eye-line mr-1"></i>Xem gợi ý nghĩa
            </button>
          )}
        </div>
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
          placeholder="Điền từ tiếng Hàn bạn nghe được..."
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

// ── Fill Mode (Xem nghĩa + điền từ tiếng Hàn) ─────────────────────────────
function FillMode({ vocab }: { vocab: VocabCard[] }) {
  const [cards] = useState(() => shuffle(vocab).slice(0, Math.min(20, vocab.length)));
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const card = cards[idx];

  useEffect(() => {
    if (!submitted) inputRef.current?.focus();
  }, [idx, submitted]);

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

  const isCorrect = submitted && input.trim().toLowerCase() === card.korean.toLowerCase();

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

      <div className="flex gap-4 justify-center text-sm">
        <span className="text-app-accent-success">✓ {score} đúng</span>
        <span className="text-red-400">✗ {idx - score} sai</span>
      </div>

      <div className="bg-app-card/50 border border-app-border rounded-2xl p-8 text-center space-y-3">
        <p className="text-app-text-secondary text-xs">Điền từ tiếng Hàn có nghĩa:</p>
        <p className="text-app-accent-primary text-2xl font-bold">{card.vietnamese}</p>
        {card.example && (
          <p className="text-app-text-muted text-xs italic">{card.exampleVi}</p>
        )}
        <button
          onClick={() => speakKorean(card.korean)}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-app-accent-primary/10 hover:bg-app-accent-primary/20 transition-colors cursor-pointer mx-auto"
        >
          <i className="ri-volume-up-line text-app-accent-primary text-sm"></i>
        </button>
      </div>

      <div className="space-y-3">
        <input
          ref={inputRef}
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

// ── Main Page ──────────────────────────────────────────────────────────────
export default function EpsTopicStudyPage() {
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [studyMode, setStudyMode] = useState<StudyMode>("browse");
  const [started, setStarted] = useState(false);

  const allVocab = useMemo<VocabCard[]>(() => {
    const topics = selectedTopics.size > 0 ? selectedTopics : new Set(EPS_LESSON_TOPICS.map((t) => t.id));
    const result: VocabCard[] = [];
    epsLessons.forEach((lesson) => {
      if (!topics.has(lesson.topic)) return;
      lesson.vocabulary.forEach((v: EpsVocabItem) => {
        result.push({
          korean: v.korean,
          vietnamese: v.vietnamese,
          pronunciation: v.pronunciation || "",
          example: v.example || "",
          exampleVi: v.exampleVi || "",
          lessonId: lesson.id,
          lessonTitle: lesson.titleVi,
        });
      });
    });
    return result;
  }, [selectedTopics]);

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    EPS_LESSON_TOPICS.forEach((t) => { counts[t.id] = 0; });
    epsLessons.forEach((lesson) => {
      if (counts[lesson.topic] !== undefined) {
        counts[lesson.topic] += lesson.vocabulary.length;
      }
    });
    return counts;
  }, []);

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedTopics(new Set(EPS_LESSON_TOPICS.map((t) => t.id)));
  const clearAll = () => setSelectedTopics(new Set());

  const handleStart = () => {
    if (allVocab.length === 0) return;
    setStarted(true);
  };

  const MODES = [
    { id: "browse" as const, icon: "ri-list-check-2", label: "Duyệt từ vựng", desc: "Xem và tìm kiếm từ" },
    { id: "flashcard" as const, icon: "ri-stack-line", label: "Flashcard", desc: "Lật thẻ học từ" },
    { id: "quiz" as const, icon: "ri-survey-line", label: "Trắc nghiệm", desc: "Kiểm tra kiến thức" },
    { id: "listen" as const, icon: "ri-headphone-line", label: "Nghe & Điền", desc: "Nghe phát âm rồi điền" },
    { id: "fill" as const, icon: "ri-edit-line", label: "Điền từ", desc: "Xem nghĩa, điền tiếng Hàn" },
  ];

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
            <h1 className="text-white text-xl font-bold">Học theo chủ đề</h1>
            <p className="text-app-text-secondary text-sm">Lọc và học từ vựng theo nhóm chủ đề EPS</p>
          </div>
        </div>

        {!started ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: topic picker */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold">Chọn chủ đề</h2>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs text-app-accent-primary hover:underline cursor-pointer whitespace-nowrap">Chọn tất cả</button>
                  <span className="text-app-text-muted">|</span>
                  <button onClick={clearAll} className="text-xs text-app-text-secondary hover:text-white/60 cursor-pointer whitespace-nowrap">Bỏ chọn</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EPS_LESSON_TOPICS.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    count={topicCounts[topic.id] || 0}
                    isSelected={selectedTopics.has(topic.id)}
                    onClick={() => toggleTopic(topic.id)}
                  />
                ))}
              </div>
            </div>

            {/* Right: mode + start */}
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
                <p className="text-white/50 text-xs mb-1">Từ vựng đã chọn</p>
                <p className="text-white text-2xl font-bold">{allVocab.length}</p>
                <p className="text-app-text-muted text-xs mt-1">
                  từ từ {selectedTopics.size > 0 ? selectedTopics.size : EPS_LESSON_TOPICS.length} chủ đề
                </p>
              </div>

              {/* Mode picker */}
              <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 space-y-2">
                <p className="text-white/50 text-xs mb-3">Chế độ học</p>
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setStudyMode(m.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer text-left ${
                      studyMode === m.id
                        ? "border-app-accent-primary/40 bg-app-accent-primary/8"
                        : "border-app-border hover:border-white/15 hover:bg-app-surface/50"
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 flex-shrink-0">
                      <i className={`${m.icon} text-sm ${studyMode === m.id ? "text-app-accent-primary" : "text-app-text-secondary"}`}></i>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${studyMode === m.id ? "text-app-accent-primary" : "text-white/70"}`}>{m.label}</p>
                      <p className="text-app-text-muted text-xs">{m.desc}</p>
                    </div>
                    {studyMode === m.id && (
                      <div className="ml-auto w-4 h-4 flex items-center justify-center">
                        <i className="ri-check-line text-app-accent-primary text-sm"></i>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Start button */}
              <button
                onClick={handleStart}
                disabled={allVocab.length === 0}
                className="w-full py-4 bg-app-accent-primary text-black font-bold rounded-xl cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed hover:bg-app-accent-primary/90 transition-all text-sm"
              >
                <i className="ri-play-fill mr-2"></i>
                Bắt đầu học ({allVocab.length} từ)
              </button>

              {/* Quick links */}
              <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 space-y-2">
                <p className="text-app-text-secondary text-xs mb-2">Học thêm</p>
                <button
                  onClick={() => navigate("/eps-lessons")}
                  className="w-full flex items-center gap-2 text-white/50 hover:text-white/80 text-xs py-1.5 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-book-open-line text-sm"></i>
                  60 Bài học EPS
                </button>
                <button
                  onClick={() => navigate("/eps-quick-review")}
                  className="w-full flex items-center gap-2 text-white/50 hover:text-white/80 text-xs py-1.5 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-flashlight-line text-sm"></i>
                  Ôn tập nhanh
                </button>
                <button
                  onClick={() => navigate("/eps-wrong-topic")}
                  className="w-full flex items-center gap-2 text-white/50 hover:text-white/80 text-xs py-1.5 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-error-warning-line text-sm"></i>
                  Ôn tập sai theo chủ đề
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Study screen ── */
          <div className="space-y-4">
            {/* Mode tabs */}
            <div className="flex items-center gap-1 bg-app-surface/50 border border-app-border rounded-xl p-1 flex-wrap">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setStudyMode(m.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    studyMode === m.id
                      ? "bg-app-accent-primary text-black"
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
                      .map((id) => EPS_LESSON_TOPICS.find((t) => t.id === id)?.label)
                      .filter(Boolean)
                      .join(", ")
                  : "Tất cả chủ đề"}
              </span>
              <span>•</span>
              <span>{allVocab.length} từ</span>
            </div>

            {/* Study content */}
            {studyMode === "browse" && <BrowseMode vocab={allVocab} />}
            {studyMode === "flashcard" && <FlashcardMode key={`fc-${allVocab.length}`} vocab={allVocab} />}
            {studyMode === "quiz" && <QuizMode key={`qz-${allVocab.length}`} vocab={allVocab} />}
            {studyMode === "listen" && <ListenMode key={`ls-${allVocab.length}`} vocab={allVocab} />}
            {studyMode === "fill" && <FillMode key={`fl-${allVocab.length}`} vocab={allVocab} />}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
