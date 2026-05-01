import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { seoulBooks } from "@/mocks/seoulTextbook";

// ─── Types ─────────────────────────────────────────────────────────────────
interface WrongWord {
  korean: string;
  vietnamese: string;
  pronunciation: string;
  example: string;
  exampleVi: string;
  lessonId: string;
  lessonTitle: string;
  bookId: string;
  bookColor: string;
  wrongCount: number;
  lastWrong: string;
}

type ReviewMode = "flashcard" | "quiz" | "listen";

// ─── Helpers ───────────────────────────────────────────────────────────────
function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Flashcard Review ──────────────────────────────────────────────────────
function FlashcardReview({ words, onFinish, onMarkKnown }: {
  words: WrongWord[];
  onFinish: (score: number) => void;
  onMarkKnown: (korean: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  const current = words[index];
  const total = words.length;

  const handleKnow = () => {
    onMarkKnown(current.korean);
    setKnown(prev => new Set([...prev, index]));
    if (index < total - 1) { setIndex(i => i + 1); setFlipped(false); }
    else onFinish(known.size + 1);
  };

  const handleUnknow = () => {
    if (index < total - 1) { setIndex(i => i + 1); setFlipped(false); }
    else onFinish(known.size);
  };

  return (
    <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/40 text-xs">{index + 1} / {total}</span>
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-xs font-semibold">Sai {current.wrongCount} lần</span>
          </div>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-red-500/60 transition-all duration-500" style={{ width: `${Math.round((index / total) * 100)}%` }} />
        </div>
      </div>

      <div className="w-full cursor-pointer" onClick={() => setFlipped(f => !f)} style={{ perspective: "1000px" }}>
        <div className="relative w-full transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: "220px" }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl border border-red-500/20 bg-[#0f1117]" style={{ backfaceVisibility: "hidden" }}>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 mb-4">{current.lessonTitle}</span>
            <p className="text-white text-5xl font-bold mb-3 text-center">{current.korean}</p>
            <p className="text-white/30 text-sm">[{current.pronunciation}]</p>
            <button onClick={e => { e.stopPropagation(); speakKorean(current.korean); }} className="mt-4 w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 cursor-pointer">
              <i className="ri-volume-up-line text-lg text-red-400"></i>
            </button>
            <p className="text-white/20 text-xs mt-4">Click để xem nghĩa</p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl border border-red-500/20 bg-red-500/5" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <p className="text-white text-3xl font-bold mb-2 text-center">{current.korean}</p>
            <p className="text-red-300 text-2xl font-bold mb-3 text-center">{current.vietnamese}</p>
            <p className="text-white/50 text-sm text-center italic mb-1">{current.example}</p>
            <p className="text-white/30 text-xs text-center italic">{current.exampleVi}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full">
        <button onClick={handleUnknow} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-close-line text-lg"></i>Chưa thuộc
        </button>
        <button onClick={() => setFlipped(f => !f)} className="w-12 h-12 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 hover:bg-white/10 transition-colors cursor-pointer">
          <i className="ri-refresh-line text-lg"></i>
        </button>
        <button onClick={handleKnow} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/20 transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-check-line text-lg"></i>Đã thuộc
        </button>
      </div>
    </div>
  );
}

// ─── Quiz Review ───────────────────────────────────────────────────────────
function QuizReview({ words, allWords, onFinish, onMarkKnown }: {
  words: WrongWord[];
  allWords: WrongWord[];
  onFinish: (score: number) => void;
  onMarkKnown: (korean: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const questions = useMemo(() => {
    return words.map(w => {
      const pool = allWords.length >= 4 ? allWords : [...allWords, ...seoulBooks.flatMap(b => b.lessons.flatMap(l => l.vocabulary.map(v => ({ korean: v.korean, vietnamese: v.vietnamese }))))];
      const wrong = shuffle(pool.filter(x => x.korean !== w.korean)).slice(0, 3);
      const opts = shuffle([w, ...wrong]);
      return { word: w, options: opts, correctIdx: opts.findIndex(o => o.korean === w.korean) };
    });
  }, [words, allWords]);

  const current = questions[index];
  const total = questions.length;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowResult(true);
    const correct = idx === current.correctIdx;
    if (correct) {
      setScore(s => s + 1);
      onMarkKnown(current.word.korean);
    }
    setTimeout(() => {
      if (index < total - 1) { setIndex(i => i + 1); setSelected(null); setShowResult(false); }
      else onFinish(correct ? score + 1 : score);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/40 text-xs">Câu {index + 1} / {total}</span>
          <span className="text-red-400 text-xs font-semibold">{score} đúng</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-red-500/60 transition-all duration-500" style={{ width: `${Math.round((index / total) * 100)}%` }} />
        </div>
      </div>
      <div className="bg-[#0f1117] border border-red-500/15 rounded-2xl p-8 text-center">
        <p className="text-white/40 text-xs mb-3">Nghĩa của từ này là gì?</p>
        <p className="text-white text-5xl font-bold mb-2">{current.word.korean}</p>
        <p className="text-white/30 text-sm">[{current.word.pronunciation}]</p>
        <button onClick={() => speakKorean(current.word.korean)} className="mt-3 w-9 h-9 flex items-center justify-center rounded-xl mx-auto cursor-pointer bg-red-500/10">
          <i className="ri-volume-up-line text-sm text-red-400"></i>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {current.options.map((opt, i) => {
          let cls = "border border-white/10 bg-white/3 text-white/70 hover:border-white/20 hover:bg-white/6";
          if (showResult && selected !== null) {
            if (i === current.correctIdx) cls = "border-emerald-500/50 bg-emerald-500/15 text-emerald-400";
            else if (i === selected && selected !== current.correctIdx) cls = "border-red-500/50 bg-red-500/15 text-red-400";
            else cls = "border-white/5 bg-white/2 text-white/30";
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} className={`p-4 rounded-xl text-sm font-medium transition-all cursor-pointer text-center ${cls}`}>
              {opt.vietnamese}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Listen Review ─────────────────────────────────────────────────────────
function ListenReview({ words, onFinish, onMarkKnown }: {
  words: WrongWord[];
  onFinish: (score: number) => void;
  onMarkKnown: (korean: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [listenCount, setListenCount] = useState(0);

  const current = words[index];
  const total = words.length;

  const handleListen = () => { speakKorean(current.korean); setListenCount(c => c + 1); };

  const handleSubmit = () => {
    if (!input.trim()) return;
    setSubmitted(true);
    const correct = input.trim() === current.korean;
    if (correct) {
      setScore(s => s + 1);
      onMarkKnown(current.korean);
    }
    setTimeout(() => {
      if (index < total - 1) { setIndex(i => i + 1); setInput(""); setSubmitted(false); setListenCount(0); }
      else onFinish(correct ? score + 1 : score);
    }, 1500);
  };

  const isCorrect = submitted && input.trim() === current.korean;

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/40 text-xs">Câu {index + 1} / {total}</span>
          <span className="text-red-400 text-xs font-semibold">{score} đúng</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-red-500/60 transition-all duration-500" style={{ width: `${Math.round((index / total) * 100)}%` }} />
        </div>
      </div>
      <div className="bg-[#0f1117] border border-red-500/15 rounded-2xl p-8 text-center">
        <p className="text-white/40 text-xs mb-4">Nghe và điền từ tiếng Hàn</p>
        <p className="text-white/60 text-sm mb-2">Nghĩa: <span className="text-white font-semibold">{current.vietnamese}</span></p>
        <button onClick={handleListen} className="w-20 h-20 flex items-center justify-center rounded-full mx-auto cursor-pointer transition-all hover:scale-105 bg-red-500/15 border-2 border-red-500/30">
          <i className="ri-volume-up-line text-4xl text-red-400"></i>
        </button>
        <p className="text-white/30 text-xs mt-3">Đã nghe {listenCount} lần</p>
        {listenCount >= 2 && <p className="mt-2 text-red-400/60 text-sm font-medium">[{current.pronunciation}]</p>}
      </div>
      <div className="flex gap-3">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !submitted && handleSubmit()} placeholder="Nhập từ tiếng Hàn..." disabled={submitted}
          className={`flex-1 px-4 py-3 rounded-xl border text-sm text-white placeholder-white/20 bg-white/3 outline-none transition-colors ${submitted ? isCorrect ? "border-emerald-500/50 bg-emerald-500/10" : "border-red-500/50 bg-red-500/10" : "border-white/10 focus:border-white/25"}`} />
        <button onClick={handleSubmit} disabled={submitted || !input.trim()} className="px-5 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 bg-red-500/15 text-red-400 hover:bg-red-500/25">
          Kiểm tra
        </button>
      </div>
      {submitted && (
        <div className={`p-4 rounded-xl text-center ${isCorrect ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
          {isCorrect ? <p className="text-emerald-400 font-semibold">Chính xác!</p> : (
            <div><p className="text-red-400 font-semibold mb-1">Chưa đúng</p><p className="text-white/60 text-sm">Đáp án: <span className="text-white font-bold">{current.korean}</span></p></div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Export Helpers ────────────────────────────────────────────────────────
function exportToCSV(words: WrongWord[]) {
  const header = "Tiếng Hàn,Phiên âm,Tiếng Việt,Ví dụ,Dịch ví dụ,Bài học,Số lần sai";
  const rows = words.map(w =>
    [w.korean, w.pronunciation, w.vietnamese, w.example, w.exampleVi, w.lessonTitle, w.wrongCount]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tu-sai-seoul-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToTXT(words: WrongWord[]) {
  const lines = words.map((w, i) =>
    `${i + 1}. ${w.korean} [${w.pronunciation}] — ${w.vietnamese}\n   Ví dụ: ${w.example}\n   Dịch: ${w.exampleVi}\n   Bài: ${w.lessonTitle} | Sai: ${w.wrongCount} lần`
  );
  const txt = `TỪ SAI SEOUL — Xuất ngày ${new Date().toLocaleDateString("vi-VN")}\n${"=".repeat(50)}\n\n${lines.join("\n\n")}`;
  const blob = new Blob([txt], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tu-sai-seoul-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function SeoulWrongReviewPage() {
  const navigate = useNavigate();
  const [wrongWords, setWrongWords] = useLocalStorage<WrongWord[]>("kts_seoul_wrong_words", []);
  const [mode, setMode] = useState<ReviewMode>("flashcard");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [filterBook, setFilterBook] = useState<string>("all");
  const [key, setKey] = useState(0);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Sort by wrongCount desc, then by lastWrong desc
  const sortedWords = useMemo(() => {
    const filtered = filterBook === "all" ? wrongWords : wrongWords.filter(w => w.bookId === filterBook);
    return [...filtered].sort((a, b) => b.wrongCount - a.wrongCount || new Date(b.lastWrong).getTime() - new Date(a.lastWrong).getTime());
  }, [wrongWords, filterBook]);

  const booksWithWrong = useMemo(() => {
    const ids = new Set(wrongWords.map(w => w.bookId));
    return seoulBooks.filter(b => ids.has(b.id));
  }, [wrongWords]);

  const handleMarkKnown = useCallback((korean: string) => {
    setWrongWords(prev => prev.map(w => w.korean === korean ? { ...w, wrongCount: Math.max(0, w.wrongCount - 1) } : w).filter(w => w.wrongCount > 0));
  }, [setWrongWords]);

  const handleClearAll = () => {
    if (window.confirm("Xóa tất cả từ sai? Hành động này không thể hoàn tác.")) {
      setWrongWords([]);
    }
  };

  const handleStart = () => {
    if (sortedWords.length === 0) return;
    setStarted(true);
    setFinished(false);
    setFinalScore(0);
    setKey(k => k + 1);
  };

  const handleFinish = (score: number) => {
    setFinalScore(score);
    setFinished(true);
  };

  const handleRetry = () => {
    setFinished(false);
    setFinalScore(0);
    setKey(k => k + 1);
  };

  const modeInfo = {
    flashcard: { icon: "ri-stack-line", label: "Flashcard", desc: "Lật thẻ ôn lại" },
    quiz: { icon: "ri-survey-line", label: "Quiz", desc: "Trắc nghiệm" },
    listen: { icon: "ri-headphone-line", label: "Nghe & Điền", desc: "Nghe và gõ" },
  };

  const pct = sortedWords.length > 0 && finished ? Math.round((finalScore / sortedWords.length) * 100) : 0;

  return (
    <DashboardLayout
      title="Ôn tập từ sai — Seoul"
      subtitle="Ôn lại những từ trả lời sai trong quiz và ghép cặp"
      actions={
        <div className="flex items-center gap-2">
          {wrongWords.length > 0 && (
            <div className="relative">
              <button onClick={() => setShowExportMenu(v => !v)} className="flex items-center gap-2 bg-[#34d399]/10 hover:bg-[#34d399]/20 text-[#34d399] text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-download-line"></i>Xuất danh sách
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 bg-[#0f1117] border border-white/10 rounded-xl overflow-hidden z-50 min-w-[160px]">
                  <button onClick={() => { exportToCSV(sortedWords); setShowExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap">
                    <i className="ri-file-excel-line text-emerald-400"></i>Xuất CSV
                  </button>
                  <button onClick={() => { exportToTXT(sortedWords); setShowExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap">
                    <i className="ri-file-text-line text-[#e8c84a]"></i>Xuất TXT
                  </button>
                </div>
              )}
            </div>
          )}
          {wrongWords.length > 0 && (
            <button onClick={handleClearAll} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-delete-bin-line"></i>Xóa tất cả
            </button>
          )}
          <button onClick={() => navigate("/seoul-practice")} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-gamepad-line"></i>Luyện tập Seoul
          </button>
        </div>
      }
    >
      {wrongWords.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-emerald-500/10 mb-6">
            <i className="ri-checkbox-circle-line text-4xl text-emerald-400"></i>
          </div>
          <p className="text-white text-xl font-bold mb-2">Chưa có từ sai nào!</p>
          <p className="text-white/40 text-sm mb-6">Hãy luyện tập Quiz hoặc Ghép cặp trong Seoul Practice để ghi lại từ sai.</p>
          <button onClick={() => navigate("/seoul-practice")} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-[#34d399]/15 text-[#34d399] hover:bg-[#34d399]/25 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-gamepad-line"></i>Đến trang luyện tập
          </button>
        </div>
      ) : !started ? (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0f1117] border border-red-500/15 rounded-2xl p-5 text-center">
              <p className="text-red-400 text-3xl font-bold">{wrongWords.length}</p>
              <p className="text-white/40 text-xs mt-1">Từ cần ôn</p>
            </div>
            <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5 text-center">
              <p className="text-white text-3xl font-bold">{booksWithWrong.length}</p>
              <p className="text-white/40 text-xs mt-1">Cuốn sách</p>
            </div>
            <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5 text-center">
              <p className="text-[#e8c84a] text-3xl font-bold">{Math.max(...wrongWords.map(w => w.wrongCount), 0)}</p>
              <p className="text-white/40 text-xs mt-1">Sai nhiều nhất</p>
            </div>
          </div>

          {/* Filter by book */}
          {booksWithWrong.length > 1 && (
            <div>
              <p className="text-white/50 text-xs font-semibold tracking-normal mb-3">Lọc theo cuốn sách</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterBook("all")} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${filterBook === "all" ? "bg-white/10 text-white" : "bg-white/3 text-white/40 hover:bg-white/6"}`}>
                  Tất cả ({wrongWords.length})
                </button>
                {booksWithWrong.map(book => {
                  const count = wrongWords.filter(w => w.bookId === book.id).length;
                  return (
                    <button key={book.id} onClick={() => setFilterBook(book.id)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${filterBook === book.id ? "text-white" : "text-white/40 hover:text-white/60"}`}
                      style={{ backgroundColor: filterBook === book.id ? `${book.color}20` : "rgba(255,255,255,0.03)", color: filterBook === book.id ? book.color : undefined }}>
                      {book.level} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode selector */}
          <div>
            <p className="text-white/50 text-xs font-semibold tracking-normal mb-3">Chọn chế độ ôn tập</p>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(modeInfo) as [ReviewMode, typeof modeInfo[ReviewMode]][]).map(([m, info]) => (
                <button key={m} onClick={() => setMode(m)} className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${mode === m ? "border-red-500/30 bg-red-500/8" : "border-white/8 bg-white/2 hover:border-white/15"}`}>
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto mb-2" style={{ backgroundColor: mode === m ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)" }}>
                    <i className={`${info.icon} text-lg`} style={{ color: mode === m ? "#f87171" : "rgba(255,255,255,0.3)" }}></i>
                  </div>
                  <p className={`text-sm font-semibold ${mode === m ? "text-red-300" : "text-white/50"}`}>{info.label}</p>
                  <p className="text-white/30 text-xs mt-0.5">{info.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Word list preview */}
          <div>
            <p className="text-white/50 text-xs font-semibold tracking-normal mb-3">Danh sách từ sai ({sortedWords.length} từ)</p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {sortedWords.map((word, i) => {
                const book = seoulBooks.find(b => b.id === word.bookId);
                return (
                  <div key={`${word.korean}-${i}`} className="flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/2">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${word.bookColor}15` }}>
                      <span className="text-xs font-bold" style={{ color: word.bookColor }}>{word.wrongCount}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm">{word.korean}</p>
                      <p className="text-white/40 text-xs truncate">{word.vietnamese}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${word.bookColor}15`, color: word.bookColor }}>{word.lessonTitle}</span>
                    </div>
                    <button onClick={() => handleMarkKnown(word.korean)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer flex-shrink-0">
                      <i className="ri-check-line text-sm"></i>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Start button */}
          <div className="flex justify-center pt-2">
            <button onClick={handleStart} className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all cursor-pointer whitespace-nowrap bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/20">
              <i className="ri-play-fill text-xl"></i>
              Bắt đầu ôn tập ({sortedWords.length} từ)
            </button>
          </div>
        </div>
      ) : finished ? (
        // Result
        <div className="flex flex-col items-center gap-6 py-8 max-w-md mx-auto text-center">
          <div className="w-24 h-24 flex items-center justify-center rounded-full bg-red-500/10 border-2 border-red-500/30">
            <p className="text-3xl font-bold text-red-300">{pct}%</p>
          </div>
          <div>
            <p className="text-white text-2xl font-bold mb-1">{pct >= 80 ? "Tuyệt vời!" : pct >= 60 ? "Tiến bộ rồi!" : "Cần ôn thêm!"}</p>
            <p className="text-white/50 text-sm">Đúng {finalScore}/{sortedWords.length} từ</p>
            {wrongWords.length > 0 && <p className="text-white/30 text-xs mt-2">Còn {wrongWords.length} từ cần ôn lại</p>}
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={handleRetry} className="flex-1 py-3 rounded-xl border border-white/15 text-white/60 font-semibold text-sm hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-refresh-line mr-2"></i>Làm lại
            </button>
            <button onClick={() => setStarted(false)} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap bg-red-500/15 text-red-300 hover:bg-red-500/25">
              <i className="ri-arrow-left-line mr-2"></i>Danh sách từ sai
            </button>
          </div>
        </div>
      ) : (
        // Practice
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setStarted(false)} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm cursor-pointer transition-colors">
              <i className="ri-arrow-left-line"></i>Quay lại
            </button>
            <span className="text-xs px-2 py-1 rounded-full font-semibold bg-red-500/10 text-red-400">
              {modeInfo[mode].label} — Ôn tập từ sai
            </span>
          </div>
          {mode === "flashcard" && <FlashcardReview key={key} words={sortedWords} onFinish={handleFinish} onMarkKnown={handleMarkKnown} />}
          {mode === "quiz" && <QuizReview key={key} words={sortedWords} allWords={sortedWords} onFinish={handleFinish} onMarkKnown={handleMarkKnown} />}
          {mode === "listen" && <ListenReview key={key} words={sortedWords} onFinish={handleFinish} onMarkKnown={handleMarkKnown} />}
        </div>
      )}
    </DashboardLayout>
  );
}
