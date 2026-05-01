import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/feature/DashboardLayout";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Vocab {
  id: number;
  book_id: string;
  lesson_id: string;
  korean: string;
  pronunciation: string;
  vietnamese: string;
  part_of_speech: string;
  example: string;
  example_vi: string;
  hanja: string;
}

interface Lesson {
  id: string;
  book_id: string;
  lesson_number: number;
  title: string;
}

type Mode = "select" | "flashcard" | "quiz" | "matching" | "fill";
type QuizAnswer = { word: Vocab; choices: string[]; correct: string; userAnswer: string | null };

const BOOKS = [
  { id: "1A", label: "Seoul 1A", color: "#34d399" },
  { id: "1B", label: "Seoul 1B", color: "#34d399" },
  { id: "2A", label: "Seoul 2A", color: "#e8c84a" },
  { id: "2B", label: "Seoul 2B", color: "#e8c84a" },
  { id: "3A", label: "Seoul 3A", color: "#f87171" },
  { id: "3B", label: "Seoul 3B", color: "#f87171" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Flashcard Mode ───────────────────────────────────────────────────────────
function FlashcardMode({ words, onBack }: { words: Vocab[]; onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());
  const shuffled = useMemo(() => shuffle(words), [words]);
  const card = shuffled[idx];
  const progress = ((idx + 1) / shuffled.length) * 100;

  const next = (mark?: "known" | "unknown") => {
    if (mark === "known") setKnown(s => new Set([...s, card.id]));
    if (mark === "unknown") setUnknown(s => new Set([...s, card.id]));
    setFlipped(false);
    setTimeout(() => setIdx(i => Math.min(i + 1, shuffled.length - 1)), 150);
  };

  const prev = () => {
    setFlipped(false);
    setTimeout(() => setIdx(i => Math.max(i - 1, 0)), 150);
  };

  const done = idx === shuffled.length - 1 && (known.size + unknown.size >= shuffled.length - 1);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-muted, #6b7280)" }}>
          <i className="ri-arrow-left-line"></i> Quay lại
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-emerald-500">{known.size} biết</span>
          <span className="text-xs" style={{ color: "#6b7280" }}>{idx + 1}/{shuffled.length}</span>
          <span className="text-xs font-semibold text-rose-500">{unknown.size} chưa biết</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full mb-6 overflow-hidden bg-gray-100">
        <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped(f => !f)}
        className="relative cursor-pointer select-none"
        style={{ perspective: "1000px", height: 280 }}
      >
        <div
          className="absolute inset-0 rounded-3xl border-2 transition-all duration-500 flex flex-col items-center justify-center p-8"
          style={{
            backgroundColor: flipped ? "#1a1a2e" : "white",
            borderColor: flipped ? "#f87171" : "#e5e7eb",
            transform: flipped ? "rotateY(0deg)" : "rotateY(0deg)",
          }}
        >
          {!flipped ? (
            <>
              <p className="text-5xl font-black mb-3" style={{ color: "#111827" }}>{card.korean}</p>
              <p className="text-base text-gray-400">[{card.pronunciation}]</p>
              <p className="text-xs text-gray-300 mt-4">Nhấn để xem nghĩa</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-black mb-2 text-white">{card.vietnamese}</p>
              <p className="text-sm text-gray-400 mb-1">{card.part_of_speech}</p>
              {card.hanja && <p className="text-sm text-yellow-400 mb-3">{card.hanja}</p>}
              {card.example && (
                <div className="text-center mt-2 px-4 py-2 rounded-xl bg-white/10">
                  <p className="text-sm text-white/80">{card.example}</p>
                  <p className="text-xs text-white/50 mt-1">{card.example_vi}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button onClick={prev} disabled={idx === 0}
          className="w-12 h-12 flex items-center justify-center rounded-full border-2 cursor-pointer disabled:opacity-30"
          style={{ borderColor: "#e5e7eb" }}>
          <i className="ri-arrow-left-s-line text-xl text-gray-500"></i>
        </button>
        {flipped && (
          <>
            <button onClick={() => next("unknown")}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm cursor-pointer bg-rose-500 text-white">
              <i className="ri-close-line"></i> Chưa biết
            </button>
            <button onClick={() => next("known")}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm cursor-pointer bg-emerald-500 text-white">
              <i className="ri-check-line"></i> Đã biết
            </button>
          </>
        )}
        {!flipped && (
          <button onClick={() => setFlipped(true)}
            className="px-8 py-3 rounded-2xl font-bold text-sm cursor-pointer text-white"
            style={{ background: "linear-gradient(135deg, #f87171, #fb923c)" }}>
            Lật thẻ
          </button>
        )}
        <button onClick={() => next()} disabled={idx === shuffled.length - 1}
          className="w-12 h-12 flex items-center justify-center rounded-full border-2 cursor-pointer disabled:opacity-30"
          style={{ borderColor: "#e5e7eb" }}>
          <i className="ri-arrow-right-s-line text-xl text-gray-500"></i>
        </button>
      </div>

      {done && (
        <div className="mt-6 p-5 rounded-2xl text-center" style={{ background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)" }}>
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-bold text-emerald-700">Hoàn thành! {known.size}/{shuffled.length} từ đã biết</p>
          <button onClick={onBack} className="mt-3 px-6 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold cursor-pointer">
            Chọn bài khác
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Quiz Mode ────────────────────────────────────────────────────────────────
function QuizMode({ words, onBack }: { words: Vocab[]; onBack: () => void }) {
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const questions = useMemo<QuizAnswer[]>(() => {
    const shuffled = shuffle(words).slice(0, Math.min(10, words.length));
    return shuffled.map(word => {
      const others = shuffle(words.filter(w => w.id !== word.id)).slice(0, 3).map(w => w.vietnamese);
      const choices = shuffle([word.vietnamese, ...others]);
      return { word, choices, correct: word.vietnamese, userAnswer: null };
    });
  }, [words]);

  const current = questions[qIdx];

  const handleAnswer = (ans: string) => {
    if (selected !== null) return;
    setSelected(ans);
    const isCorrect = ans === current.correct;
    if (isCorrect) setScore(s => s + 1);
    const updated = [...answers];
    updated[qIdx] = { ...current, userAnswer: ans };
    setAnswers(updated);
    setTimeout(() => {
      if (qIdx < questions.length - 1) {
        setQIdx(i => i + 1);
        setSelected(null);
      } else {
        setFinished(true);
      }
    }, 1000);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="p-8 rounded-3xl border-2 mb-6" style={{ borderColor: pct >= 80 ? "#34d399" : pct >= 60 ? "#e8c84a" : "#f87171" }}>
          <p className="text-6xl font-black mb-2" style={{ color: pct >= 80 ? "#34d399" : pct >= 60 ? "#e8c84a" : "#f87171" }}>{pct}%</p>
          <p className="text-xl font-bold text-gray-700 mb-1">{score}/{questions.length} câu đúng</p>
          <p className="text-gray-500">{pct >= 80 ? "Xuất sắc! 🎉" : pct >= 60 ? "Khá tốt! 👍" : "Cần ôn thêm 📚"}</p>
        </div>
        <div className="space-y-2 mb-6 text-left">
          {answers.map((a, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
              style={{ borderColor: a.userAnswer === a.correct ? "#34d399" : "#f87171", backgroundColor: a.userAnswer === a.correct ? "#f0fdf4" : "#fff5f5" }}>
              <i className={`text-sm ${a.userAnswer === a.correct ? "ri-check-line text-emerald-500" : "ri-close-line text-rose-500"}`}></i>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm text-gray-800">{a.word.korean}</span>
                <span className="text-xs text-gray-500 ml-2">→ {a.correct}</span>
              </div>
              {a.userAnswer !== a.correct && (
                <span className="text-xs text-rose-500 line-through">{a.userAnswer}</span>
              )}
            </div>
          ))}
        </div>
        <button onClick={onBack} className="px-8 py-3 rounded-2xl font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #f87171, #fb923c)" }}>
          Chọn bài khác
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm cursor-pointer text-gray-500">
          <i className="ri-arrow-left-line"></i> Quay lại
        </button>
        <span className="text-sm font-semibold text-gray-500">{qIdx + 1}/{questions.length}</span>
      </div>
      <div className="h-1.5 rounded-full mb-6 overflow-hidden bg-gray-100">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((qIdx) / questions.length) * 100}%`, background: "linear-gradient(90deg, #f87171, #fb923c)" }} />
      </div>

      <div className="text-center mb-8 p-8 rounded-3xl border-2 border-gray-100">
        <p className="text-5xl font-black text-gray-900 mb-2">{current.word.korean}</p>
        <p className="text-gray-400">[{current.word.pronunciation}]</p>
        <p className="text-sm text-gray-400 mt-2">{current.word.part_of_speech}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {current.choices.map((choice, i) => {
          let bg = "white";
          let border = "#e5e7eb";
          let textColor = "#111827";
          if (selected !== null) {
            if (choice === current.correct) { bg = "#f0fdf4"; border = "#34d399"; textColor = "#166534"; }
            else if (choice === selected) { bg = "#fff5f5"; border = "#f87171"; textColor = "#991b1b"; }
          }
          return (
            <button key={i} onClick={() => handleAnswer(choice)}
              className="p-4 rounded-2xl border-2 text-sm font-semibold cursor-pointer transition-all text-left"
              style={{ backgroundColor: bg, borderColor: border, color: textColor }}>
              <span className="text-xs font-bold mr-2 opacity-50">{String.fromCharCode(65 + i)}.</span>
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Matching Mode ────────────────────────────────────────────────────────────
function MatchingMode({ words, onBack }: { words: Vocab[]; onBack: () => void }) {
  const pairs = useMemo(() => shuffle(words).slice(0, 8), [words]);
  const koreans = useMemo(() => shuffle(pairs.map(p => p.korean)), [pairs]);
  const vietnameses = useMemo(() => shuffle(pairs.map(p => p.vietnamese)), [pairs]);
  const [selectedK, setSelectedK] = useState<string | null>(null);
  const [selectedV, setSelectedV] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!selectedK || !selectedV) return;
    const pair = pairs.find(p => p.korean === selectedK);
    if (pair && pair.vietnamese === selectedV) {
      setMatched(s => new Set([...s, selectedK, selectedV]));
      setScore(s => s + 1);
    } else {
      setWrong(new Set([selectedK, selectedV]));
      setTimeout(() => setWrong(new Set()), 600);
    }
    setSelectedK(null);
    setSelectedV(null);
  }, [selectedK, selectedV, pairs]);

  const done = matched.size === pairs.length * 2;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm cursor-pointer text-gray-500">
          <i className="ri-arrow-left-line"></i> Quay lại
        </button>
        <span className="text-sm font-semibold text-gray-500">{score}/{pairs.length} cặp</span>
      </div>

      {done ? (
        <div className="text-center p-8 rounded-3xl" style={{ background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)" }}>
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-2xl font-black text-emerald-700 mb-2">Hoàn thành!</p>
          <p className="text-emerald-600 mb-4">Bạn đã ghép đúng tất cả {pairs.length} cặp từ!</p>
          <button onClick={onBack} className="px-8 py-3 rounded-2xl bg-emerald-500 text-white font-bold cursor-pointer">
            Chọn bài khác
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 tracking-wider mb-3">Tiếng Hàn</p>
            {koreans.map(k => {
              const isMatched = matched.has(k);
              const isSelected = selectedK === k;
              const isWrong = wrong.has(k);
              return (
                <button key={k} onClick={() => !isMatched && setSelectedK(k)}
                  className="w-full p-3 rounded-2xl border-2 text-sm font-bold cursor-pointer transition-all"
                  style={{
                    backgroundColor: isMatched ? "#f0fdf4" : isWrong ? "#fff5f5" : isSelected ? "#fef3c7" : "white",
                    borderColor: isMatched ? "#34d399" : isWrong ? "#f87171" : isSelected ? "#f59e0b" : "#e5e7eb",
                    color: isMatched ? "#166534" : isWrong ? "#991b1b" : isSelected ? "#92400e" : "#111827",
                    opacity: isMatched ? 0.6 : 1,
                  }}>
                  {k}
                </button>
              );
            })}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 tracking-wider mb-3">Tiếng Việt</p>
            {vietnameses.map(v => {
              const isMatched = matched.has(v);
              const isSelected = selectedV === v;
              const isWrong = wrong.has(v);
              return (
                <button key={v} onClick={() => !isMatched && setSelectedV(v)}
                  className="w-full p-3 rounded-2xl border-2 text-xs font-semibold cursor-pointer transition-all text-left"
                  style={{
                    backgroundColor: isMatched ? "#f0fdf4" : isWrong ? "#fff5f5" : isSelected ? "#fef3c7" : "white",
                    borderColor: isMatched ? "#34d399" : isWrong ? "#f87171" : isSelected ? "#f59e0b" : "#e5e7eb",
                    color: isMatched ? "#166534" : isWrong ? "#991b1b" : isSelected ? "#92400e" : "#374151",
                    opacity: isMatched ? 0.6 : 1,
                  }}>
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Fill in the Blank Mode ───────────────────────────────────────────────────
function FillMode({ words, onBack }: { words: Vocab[]; onBack: () => void }) {
  const questions = useMemo(() => shuffle(words).slice(0, Math.min(10, words.length)), [words]);
  const [qIdx, setQIdx] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[qIdx];

  const check = () => {
    const correct = input.trim().toLowerCase() === current.korean.toLowerCase();
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (qIdx < questions.length - 1) {
        setQIdx(i => i + 1);
        setInput("");
        setResult(null);
      } else {
        setFinished(true);
      }
    }, 1200);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="p-8 rounded-3xl border-2 mb-6" style={{ borderColor: pct >= 80 ? "#34d399" : "#f87171" }}>
          <p className="text-6xl font-black mb-2" style={{ color: pct >= 80 ? "#34d399" : "#f87171" }}>{pct}%</p>
          <p className="text-xl font-bold text-gray-700">{score}/{questions.length} câu đúng</p>
        </div>
        <button onClick={onBack} className="px-8 py-3 rounded-2xl font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #f87171, #fb923c)" }}>
          Chọn bài khác
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm cursor-pointer text-gray-500">
          <i className="ri-arrow-left-line"></i> Quay lại
        </button>
        <span className="text-sm font-semibold text-gray-500">{qIdx + 1}/{questions.length}</span>
      </div>
      <div className="h-1.5 rounded-full mb-6 overflow-hidden bg-gray-100">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(qIdx / questions.length) * 100}%`, background: "linear-gradient(90deg, #a78bfa, #f87171)" }} />
      </div>

      <div className="text-center mb-6 p-6 rounded-3xl border-2 border-gray-100">
        <p className="text-sm text-gray-400 mb-2">Điền từ tiếng Hàn tương ứng</p>
        <p className="text-2xl font-black text-gray-900 mb-1">{current.vietnamese}</p>
        <p className="text-sm text-gray-400">{current.part_of_speech}</p>
        {current.example_vi && (
          <p className="text-xs text-gray-400 mt-2 italic">"{current.example_vi}"</p>
        )}
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && input.trim() && !result && check()}
          placeholder="Nhập từ tiếng Hàn..."
          className="w-full px-5 py-4 rounded-2xl border-2 text-xl font-bold text-center outline-none transition-all"
          style={{
            borderColor: result === "correct" ? "#34d399" : result === "wrong" ? "#f87171" : "#e5e7eb",
            backgroundColor: result === "correct" ? "#f0fdf4" : result === "wrong" ? "#fff5f5" : "white",
            color: result === "correct" ? "#166534" : result === "wrong" ? "#991b1b" : "#111827",
          }}
          disabled={result !== null}
          autoFocus
        />
        {result === "wrong" && (
          <p className="text-center text-sm text-emerald-600 mt-2 font-semibold">
            Đáp án đúng: <span className="font-black">{current.korean}</span> [{current.pronunciation}]
          </p>
        )}
      </div>

      <button onClick={check} disabled={!input.trim() || result !== null}
        className="w-full py-4 rounded-2xl font-bold text-white text-base cursor-pointer disabled:opacity-40 transition-all"
        style={{ background: "linear-gradient(135deg, #a78bfa, #f87171)" }}>
        Kiểm tra
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SeoulVocabPracticePage() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>("1A");
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [words, setWords] = useState<Vocab[]>([]);
  const [mode, setMode] = useState<Mode>("select");
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState<Record<string, number>>({});

  // Load lessons
  useEffect(() => {
    supabase.from("seoul_lessons").select("*").order("book_id").order("lesson_number")
      .then(({ data }) => setLessons(data || []));
  }, []);

  // Load word counts per lesson
  useEffect(() => {
    supabase.from("seoul_vocabulary").select("lesson_id")
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        (data || []).forEach(r => { counts[r.lesson_id] = (counts[r.lesson_id] || 0) + 1; });
        setWordCount(counts);
      });
  }, []);

  const bookLessons = useMemo(() => lessons.filter(l => l.book_id === selectedBook), [lessons, selectedBook]);

  const loadWords = useCallback(async (lessonId: string) => {
    setLoading(true);
    const { data } = await supabase.from("seoul_vocabulary").select("*").eq("lesson_id", lessonId);
    setWords(data || []);
    setLoading(false);
  }, []);

  const handleSelectLesson = async (lessonId: string) => {
    setSelectedLesson(lessonId);
    await loadWords(lessonId);
  };

  const handleStartMode = (m: Mode) => {
    if (words.length < 4 && m !== "flashcard") return;
    setMode(m);
  };

  const handleBack = () => {
    setMode("select");
  };

  const selectedLessonData = lessons.find(l => l.id === selectedLesson);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border cursor-pointer" style={{ borderColor: "#e5e7eb" }}>
            <i className="ri-arrow-left-line text-gray-500"></i>
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Luyện từ vựng Seoul</h1>
            <p className="text-sm text-gray-500">Flashcard · Quiz · Ghép cặp · Điền từ theo từng bài học</p>
          </div>
        </div>

        {mode === "select" && (
          <>
            {/* Book selector */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
              {BOOKS.map(b => (
                <button key={b.id} onClick={() => { setSelectedBook(b.id); setSelectedLesson(null); setWords([]); }}
                  className="py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all border-2"
                  style={{
                    backgroundColor: selectedBook === b.id ? b.color : "white",
                    borderColor: selectedBook === b.id ? b.color : "#e5e7eb",
                    color: selectedBook === b.id ? "white" : "#374151",
                  }}>
                  {b.label}
                </button>
              ))}
            </div>

            {/* Lesson list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {bookLessons.map(lesson => {
                const count = wordCount[lesson.id] || 0;
                const isSelected = selectedLesson === lesson.id;
                return (
                  <button key={lesson.id} onClick={() => handleSelectLesson(lesson.id)}
                    className="flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all text-left"
                    style={{
                      backgroundColor: isSelected ? "#fff7ed" : "white",
                      borderColor: isSelected ? "#fb923c" : "#e5e7eb",
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white text-sm"
                      style={{ background: "linear-gradient(135deg, #f87171, #fb923c)" }}>
                      {lesson.lesson_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{lesson.title}</p>
                      <p className="text-xs text-gray-400">{count} từ vựng</p>
                    </div>
                    {isSelected && <i className="ri-checkbox-circle-line text-orange-400 text-lg flex-shrink-0"></i>}
                  </button>
                );
              })}
            </div>

            {/* Mode selector */}
            {selectedLesson && words.length > 0 && (
              <div className="rounded-3xl border-2 p-6" style={{ borderColor: "#e5e7eb" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f87171, #fb923c)" }}>
                    <i className="ri-book-open-line text-white"></i>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{selectedLessonData?.title}</p>
                    <p className="text-sm text-gray-500">{words.length} từ vựng · Chọn chế độ luyện tập</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { mode: "flashcard" as Mode, icon: "ri-stack-line", label: "Flashcard", desc: "Lật thẻ học từ", color: "#34d399", minWords: 1 },
                    { mode: "quiz" as Mode, icon: "ri-question-line", label: "Quiz", desc: "Trắc nghiệm 4 đáp án", color: "#a78bfa", minWords: 4 },
                    { mode: "matching" as Mode, icon: "ri-links-line", label: "Ghép cặp", desc: "Nối từ với nghĩa", color: "#e8c84a", minWords: 4 },
                    { mode: "fill" as Mode, icon: "ri-edit-line", label: "Điền từ", desc: "Nhập từ tiếng Hàn", color: "#f87171", minWords: 1 },
                  ].map(m => {
                    const disabled = words.length < m.minWords;
                    return (
                      <button key={m.mode} onClick={() => !disabled && handleStartMode(m.mode)}
                        disabled={disabled}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all disabled:opacity-40"
                        style={{ borderColor: "#e5e7eb", backgroundColor: "white" }}>
                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl" style={{ backgroundColor: `${m.color}15` }}>
                          <i className={`${m.icon} text-xl`} style={{ color: m.color }}></i>
                        </div>
                        <p className="font-bold text-sm text-gray-900">{m.label}</p>
                        <p className="text-[10px] text-gray-400 text-center">{m.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedLesson && loading && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Đang tải từ vựng...</p>
              </div>
            )}

            {selectedLesson && !loading && words.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <i className="ri-book-2-line text-3xl mb-2 block"></i>
                <p>Bài học này chưa có từ vựng</p>
              </div>
            )}
          </>
        )}

        {mode === "flashcard" && <FlashcardMode words={words} onBack={handleBack} />}
        {mode === "quiz" && <QuizMode words={words} onBack={handleBack} />}
        {mode === "matching" && <MatchingMode words={words} onBack={handleBack} />}
        {mode === "fill" && <FillMode words={words} onBack={handleBack} />}
      </div>
    </DashboardLayout>
  );
}
