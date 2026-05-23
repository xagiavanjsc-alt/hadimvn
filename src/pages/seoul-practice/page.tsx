import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { seoulBooks, type SeoulLesson, type SeoulBook } from "@/mocks/seoulTextbook";
import { STORAGE_KEYS } from "@/lib/storageKeys";

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

// ─── Helpers ──────────────────────────────────────────────────────────────
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

type PracticeMode = "flashcard" | "quiz" | "listen" | "matching" | "fillblank";

interface VocabItem {
  korean: string;
  vietnamese: string;
  pronunciation: string;
  example: string;
  exampleVi: string;
  lessonId: string;
  lessonTitle: string;
  bookColor: string;
}

// ─── Flashcard Mode ────────────────────────────────────────────────────────
function FlashcardMode({ words, onFinish }: { words: VocabItem[]; onFinish: (score: number) => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());

  const current = words[index];
  const total = words.length;
  const progress = Math.round(((known.size + unknown.size) / total) * 100);

  const handleKnow = () => {
    setKnown(prev => new Set([...prev, index]));
    if (index < total - 1) { setIndex(i => i + 1); setFlipped(false); }
    else onFinish(known.size + 1);
  };

  const handleUnknow = () => {
    setUnknown(prev => new Set([...prev, index]));
    if (index < total - 1) { setIndex(i => i + 1); setFlipped(false); }
    else onFinish(known.size);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-app-text-secondary text-xs">{index + 1} / {total}</span>
          <div className="flex items-center gap-3">
            <span className="text-app-accent-success text-xs font-semibold">{known.size} thuộc</span>
            <span className="text-red-400 text-xs font-semibold">{unknown.size} chưa thuộc</span>
          </div>
        </div>
        <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[app-accent-primary] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="w-full max-w-lg cursor-pointer" onClick={() => setFlipped(f => !f)} style={{ perspective: "1000px" }}>
        <div className="relative w-full transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: "240px" }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl border border-app-border bg-app-bg" style={{ backfaceVisibility: "hidden" }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${current.bookColor}20`, color: current.bookColor }}>{current.lessonTitle}</span>
            </div>
            <p className="text-white text-5xl font-bold mb-3 text-center">{current.korean}</p>
            <p className="text-app-text-muted text-sm">[{current.pronunciation}]</p>
            <button onClick={e => { e.stopPropagation(); speakKorean(current.korean); }} className="mt-4 w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer transition-colors" style={{ backgroundColor: `${current.bookColor}20` }}>
              <i className="ri-volume-up-line text-lg" style={{ color: current.bookColor }}></i>
            </button>
            <p className="text-app-text-muted text-xs mt-4">Click để xem nghĩa</p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl border border-app-border" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", backgroundColor: `${current.bookColor}08`, borderColor: `${current.bookColor}30` }}>
            <p className="text-white text-3xl font-bold mb-2 text-center">{current.korean}</p>
            <p className="text-2xl font-bold mb-3 text-center" style={{ color: current.bookColor }}>{current.vietnamese}</p>
            <p className="text-white/50 text-sm text-center italic mb-1">{current.example}</p>
            <p className="text-app-text-muted text-xs text-center italic">{current.exampleVi}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full max-w-lg">
        <button onClick={handleUnknow} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-close-line text-lg"></i>Chưa thuộc
        </button>
        <button onClick={() => setFlipped(f => !f)} className="w-12 h-12 flex items-center justify-center rounded-xl border border-app-border bg-app-card/50 text-app-text-secondary hover:bg-app-card/70 transition-colors cursor-pointer">
          <i className="ri-refresh-line text-lg"></i>
        </button>
        <button onClick={handleKnow} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-app-accent-success font-semibold text-sm hover:bg-emerald-500/20 transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-check-line text-lg"></i>Đã thuộc
        </button>
      </div>
    </div>
  );
}

// ─── Quiz Mode ─────────────────────────────────────────────────────────────
function QuizMode({ words, onFinish, onWrong }: { words: VocabItem[]; onFinish: (score: number) => void; onWrong?: (word: VocabItem) => void }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const questions = useMemo(() => {
    return words.map(w => {
      const wrong = shuffle(words.filter(x => x.korean !== w.korean)).slice(0, 3);
      const opts = shuffle([w, ...wrong]);
      return { word: w, options: opts, correctIdx: opts.findIndex(o => o.korean === w.korean) };
    });
  }, [words]);

  const current = questions[index];
  const total = questions.length;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowResult(true);
    const correct = idx === current.correctIdx;
    if (correct) setScore(s => s + 1);
    else if (onWrong) onWrong(current.word);
    setTimeout(() => {
      if (index < total - 1) { setIndex(i => i + 1); setSelected(null); setShowResult(false); }
      else onFinish(correct ? score + 1 : score);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-app-text-secondary text-xs">Câu {index + 1} / {total}</span>
          <span className="text-app-accent-primary text-xs font-semibold">{score} điểm</span>
        </div>
        <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-app-accent-primary transition-all duration-500" style={{ width: `${Math.round((index / total) * 100)}%` }} />
        </div>
      </div>
      <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
        <p className="text-app-text-secondary text-xs mb-3">Nghĩa của từ này là gì?</p>
        <p className="text-white text-5xl font-bold mb-2">{current.word.korean}</p>
        <p className="text-app-text-muted text-sm">[{current.word.pronunciation}]</p>
        <button onClick={() => speakKorean(current.word.korean)} className="mt-3 w-9 h-9 flex items-center justify-center rounded-xl mx-auto cursor-pointer transition-colors" style={{ backgroundColor: `${current.word.bookColor}20` }}>
          <i className="ri-volume-up-line text-sm" style={{ color: current.word.bookColor }}></i>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {current.options.map((opt, i) => {
          let cls = "border border-app-border bg-app-surface/50 text-white/70 hover:border-white/20 hover:bg-white/6";
          if (showResult && selected !== null) {
            if (i === current.correctIdx) cls = "border-emerald-500/50 bg-app-accent-success/15 text-app-accent-success";
            else if (i === selected && selected !== current.correctIdx) cls = "border-red-500/50 bg-red-500/15 text-red-400";
            else cls = "border-app-border bg-white/2 text-app-text-muted";
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

// ─── Listen Mode ───────────────────────────────────────────────────────────
function ListenMode({ words, onFinish }: { words: VocabItem[]; onFinish: (score: number) => void }) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [listenCount, setListenCount] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const current = words[index];
  const total = words.length;

  const handleListen = () => { speakKorean(current.korean); setListenCount(c => c + 1); };

  const handleSubmit = () => {
    if (!input.trim()) return;
    setSubmitted(true);
    const correct = input.trim() === current.korean;
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (index < total - 1) { setIndex(i => i + 1); setInput(""); setSubmitted(false); setListenCount(0); setShowHint(false); }
      else onFinish(correct ? score + 1 : score);
    }, 1500);
  };

  const isCorrect = submitted && input.trim() === current.korean;

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-app-text-secondary text-xs">Câu {index + 1} / {total}</span>
          <span className="text-app-accent-primary text-xs font-semibold">{score} điểm</span>
        </div>
        <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-app-accent-primary transition-all duration-500" style={{ width: `${Math.round((index / total) * 100)}%` }} />
        </div>
      </div>
      <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
        <p className="text-app-text-secondary text-xs mb-4">Nghe và điền từ tiếng Hàn</p>
        <p className="text-white/60 text-sm mb-2">Nghĩa: <span className="text-white font-semibold">{current.vietnamese}</span></p>
        <button onClick={handleListen} className="w-20 h-20 flex items-center justify-center rounded-full mx-auto cursor-pointer transition-all hover:scale-105" style={{ backgroundColor: `${current.bookColor}20`, border: `2px solid ${current.bookColor}40` }}>
          <i className="ri-volume-up-line text-4xl" style={{ color: current.bookColor }}></i>
        </button>
        <p className="text-app-text-muted text-xs mt-3">Đã nghe {listenCount} lần</p>
        {listenCount >= 2 && !showHint && <button onClick={() => setShowHint(true)} className="mt-2 text-app-accent-primary/60 text-xs underline cursor-pointer">Xem gợi ý</button>}
        {showHint && <p className="mt-2 text-app-accent-primary/70 text-sm font-medium">[{current.pronunciation}]</p>}
      </div>
      <div className="flex gap-3">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !submitted && handleSubmit()} placeholder="Nhập từ tiếng Hàn..." disabled={submitted}
          className={`flex-1 px-4 py-3 rounded-xl border text-sm text-white placeholder-white/20 bg-app-surface/50 outline-none transition-colors ${submitted ? isCorrect ? "border-emerald-500/50 bg-emerald-500/10" : "border-red-500/50 bg-red-500/10" : "border-app-border focus:border-white/25"}`} />
        <button onClick={handleSubmit} disabled={submitted || !input.trim()} className="px-5 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40" style={{ backgroundColor: `${current.bookColor}20`, color: current.bookColor }}>
          Kiểm tra
        </button>
      </div>
      {submitted && (
        <div className={`p-4 rounded-xl text-center ${isCorrect ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
          {isCorrect ? <p className="text-app-accent-success font-semibold">Chính xác!</p> : (
            <div><p className="text-red-400 font-semibold mb-1">Chưa đúng</p><p className="text-white/60 text-sm">Đáp án: <span className="text-white font-bold">{current.korean}</span></p></div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Matching Mode ─────────────────────────────────────────────────────────
function MatchingMode({ words, onFinish, onWrong }: { words: VocabItem[]; onFinish: (score: number) => void; onWrong?: (word: VocabItem) => void }) {
  const BATCH = 8;
  const [batchIndex, setBatchIndex] = useState(0);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selectedKorean, setSelectedKorean] = useState<string | null>(null);
  const [selectedViet, setSelectedViet] = useState<string | null>(null);
  const [wrongPair, setWrongPair] = useState<{ k: string; v: string } | null>(null);
  const [correctPair, setCorrectPair] = useState<{ k: string; v: string } | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  const totalBatches = Math.ceil(words.length / BATCH);
  const batchWords = useMemo(() => words.slice(batchIndex * BATCH, (batchIndex + 1) * BATCH), [words, batchIndex]);
  const koreanCards = useMemo(() => shuffle(batchWords.map(w => w.korean)), [batchWords]);
  const vietCards = useMemo(() => shuffle(batchWords.map(w => w.vietnamese)), [batchWords]);

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);

  const handleKorean = (k: string) => {
    if (matched.has(k) || wrongPair) return;
    setSelectedKorean(k);
    if (selectedViet) checkMatch(k, selectedViet);
  };

  const handleViet = (v: string) => {
    if (matched.has(v) || wrongPair) return;
    setSelectedViet(v);
    if (selectedKorean) checkMatch(selectedKorean, v);
  };

  const checkMatch = (k: string, v: string) => {
    const word = batchWords.find(w => w.korean === k);
    if (word && word.vietnamese === v) {
      setCorrectPair({ k, v });
      setTimeout(() => {
        setMatched(prev => new Set([...prev, k, v]));
        setSelectedKorean(null);
        setSelectedViet(null);
        setCorrectPair(null);
        setTotalScore(s => s + 1);
        // eslint-disable-next-line no-unused-expressions
        // Check if batch complete
        const newMatched = new Set([...matched, k, v]);
        const batchComplete = batchWords.every(w => newMatched.has(w.korean) && newMatched.has(w.vietnamese));
        if (batchComplete) {
          if (batchIndex + 1 < totalBatches) {
            setTimeout(() => {
              setBatchIndex(i => i + 1);
              setMatched(new Set());
            }, 600);
          } else {
            setTimeout(() => onFinish(totalScore + 1), 800);
          }
        }
      }, 500);
    } else {
      setWrongPair({ k, v });
      if (onWrong) {
        const wrongWord = batchWords.find(w => w.korean === k);
        if (wrongWord) onWrong(wrongWord);
      }
      setTimeout(() => {
        setWrongPair(null);
        setSelectedKorean(null);
        setSelectedViet(null);
      }, 800);
    }
  };

  const batchMatchedCount = batchWords.filter(w => matched.has(w.korean)).length;
  const overallProgress = Math.round(((batchIndex * BATCH + batchMatchedCount) / words.length) * 100);

  const getKoreanState = (k: string) => {
    if (matched.has(k)) return "matched";
    if (correctPair?.k === k) return "correct";
    if (wrongPair?.k === k) return "wrong";
    if (selectedKorean === k) return "selected";
    return "idle";
  };

  const getVietState = (v: string) => {
    const word = batchWords.find(w => w.vietnamese === v);
    if (!word) return "idle";
    if (matched.has(word.korean)) return "matched";
    if (correctPair?.v === v) return "correct";
    if (wrongPair?.v === v) return "wrong";
    if (selectedViet === v) return "selected";
    return "idle";
  };

  const stateClass = (state: string, color: string) => {
    switch (state) {
      case "matched": return "opacity-30 cursor-default border-app-border bg-white/2";
      case "correct": return `border-emerald-500/60 bg-app-accent-success/15 text-emerald-300`;
      case "wrong": return `border-red-500/60 bg-red-500/15 text-red-300`;
      case "selected": return `border-white/40 bg-white/8 text-white`;
      default: return `border-app-border bg-app-surface/50 text-white/70 hover:border-white/20 hover:bg-white/6 cursor-pointer`;
    }
  };

  const bookColor = words[0]?.bookColor || "app-accent-primary";

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-app-text-secondary text-xs">Vòng {batchIndex + 1}/{totalBatches}</span>
            <span className="text-app-text-secondary text-xs">·</span>
            <span className="text-app-text-secondary text-xs">{batchMatchedCount}/{batchWords.length} cặp</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-app-accent-primary text-xs font-semibold">{totalScore} điểm</span>
            <span className="text-app-text-muted text-xs">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</span>
          </div>
        </div>
        <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${overallProgress}%`, backgroundColor: bookColor }} />
        </div>
      </div>

      <p className="text-app-text-secondary text-xs text-center">Chọn từ tiếng Hàn và nghĩa tương ứng để ghép cặp</p>

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Korean column */}
        <div className="space-y-2">
          <p className="text-app-text-muted text-[10px] tracking-normal text-center mb-3">Tiếng Hàn</p>
          {koreanCards.map(k => {
            const state = getKoreanState(k);
            return (
              <button
                key={k}
                onClick={() => handleKorean(k)}
                disabled={state === "matched"}
                className={`w-full p-3 rounded-xl border text-sm font-bold text-center transition-all ${stateClass(state, bookColor)}`}
              >
                {state === "matched" ? <span className="line-through opacity-40">{k}</span> : k}
                {state === "matched" && <i className="ri-check-line text-app-accent-success ml-2"></i>}
              </button>
            );
          })}
        </div>

        {/* Vietnamese column */}
        <div className="space-y-2">
          <p className="text-app-text-muted text-[10px] tracking-normal text-center mb-3">Tiếng Việt</p>
          {vietCards.map(v => {
            const state = getVietState(v);
            return (
              <button
                key={v}
                onClick={() => handleViet(v)}
                disabled={state === "matched"}
                className={`w-full p-3 rounded-xl border text-sm text-center transition-all ${stateClass(state, bookColor)}`}
              >
                {state === "matched" ? <span className="line-through opacity-40">{v}</span> : v}
                {state === "matched" && <i className="ri-check-line text-app-accent-success ml-2"></i>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hint */}
      <div className="text-center">
        <p className="text-app-text-muted text-xs">Click từ tiếng Hàn → Click nghĩa tương ứng để ghép cặp</p>
      </div>
    </div>
  );
}

// ─── Fill Blank Mode ───────────────────────────────────────────────────────
function FillBlankMode({ words, onFinish, onWrong }: { words: VocabItem[]; onFinish: (score: number) => void; onWrong?: (word: VocabItem) => void }) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const current = words[index];
  const total = words.length;

  // Build fill-blank sentence: replace the Korean word in example with blanks
  const blankSentence = useMemo(() => {
    if (!current.example) return null;
    const escaped = current.korean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "g");
    if (!regex.test(current.example)) return null;
    return current.example.replace(new RegExp(escaped, "g"), "___");
  }, [current]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setSubmitted(true);
    const correct = input.trim() === current.korean;
    if (correct) setScore(s => s + 1);
    else if (onWrong) onWrong(current);
    setTimeout(() => {
      if (index < total - 1) { setIndex(i => i + 1); setInput(""); setSubmitted(false); setShowHint(false); }
      else onFinish(correct ? score + 1 : score);
    }, 1600);
  };

  const isCorrect = submitted && input.trim() === current.korean;

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-app-text-secondary text-xs">Câu {index + 1} / {total}</span>
          <span className="text-app-accent-primary text-xs font-semibold">{score} điểm</span>
        </div>
        <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-app-accent-primary transition-all duration-500" style={{ width: `${Math.round((index / total) * 100)}%` }} />
        </div>
      </div>

      <div className="bg-app-bg border border-app-border rounded-2xl p-6">
        <p className="text-app-text-secondary text-xs mb-4 text-center">Điền từ tiếng Hàn vào chỗ trống</p>

        {/* Meaning hint */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-white/50 text-sm">Nghĩa:</span>
          <span className="text-white font-bold text-sm">{current.vietnamese}</span>
          <button onClick={() => speakKorean(current.korean)} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors" style={{ backgroundColor: `${current.bookColor}20` }}>
            <i className="ri-volume-up-line text-xs" style={{ color: current.bookColor }}></i>
          </button>
        </div>

        {/* Example sentence with blank */}
        {blankSentence ? (
          <div className="bg-app-surface/50 rounded-xl p-4 mb-4">
            <p className="text-app-text-muted text-[10px] tracking-normal mb-2">Câu ví dụ</p>
            <p className="text-white text-base leading-relaxed font-medium">
              {blankSentence.split("___").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block px-3 py-0.5 mx-1 rounded-lg border-b-2 text-app-accent-primary font-bold" style={{ borderColor: current.bookColor, backgroundColor: `${current.bookColor}10`, minWidth: "60px" }}>
                      {submitted ? (isCorrect ? current.korean : <span className="text-red-400">{input || "?"}</span>) : "___"}
                    </span>
                  )}
                </span>
              ))}
            </p>
            <p className="text-app-text-muted text-xs italic mt-2">{current.exampleVi}</p>
          </div>
        ) : (
          <div className="bg-app-surface/50 rounded-xl p-4 mb-4 text-center">
            <p className="text-app-text-muted text-[10px] tracking-normal mb-2">Phiên âm</p>
            <p className="text-white/60 text-sm">[{current.pronunciation}]</p>
          </div>
        )}

        {/* Hint toggle */}
        {!showHint && !submitted && (
          <button onClick={() => setShowHint(true)} className="text-app-text-muted text-xs underline cursor-pointer hover:text-app-text-secondary transition-colors block mx-auto">
            Xem gợi ý (phiên âm)
          </button>
        )}
        {showHint && !submitted && (
          <p className="text-center text-app-accent-primary/60 text-sm">[{current.pronunciation}]</p>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !submitted && handleSubmit()}
          placeholder="Nhập từ tiếng Hàn..."
          disabled={submitted}
          className={`flex-1 px-4 py-3 rounded-xl border text-sm text-white placeholder-white/20 bg-app-surface/50 outline-none transition-colors ${submitted ? isCorrect ? "border-emerald-500/50 bg-emerald-500/10" : "border-red-500/50 bg-red-500/10" : "border-app-border focus:border-white/25"}`}
        />
        <button
          onClick={handleSubmit}
          disabled={submitted || !input.trim()}
          className="px-5 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 text-app-bg"
          style={{ backgroundColor: current.bookColor }}
        >
          Kiểm tra
        </button>
      </div>

      {/* Result feedback */}
      {submitted && (
        <div className={`p-4 rounded-xl text-center ${isCorrect ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
          {isCorrect ? (
            <p className="text-app-accent-success font-semibold">Chính xác! <span className="text-white font-bold">{current.korean}</span></p>
          ) : (
            <div>
              <p className="text-red-400 font-semibold mb-1">Chưa đúng</p>
              <p className="text-white/60 text-sm">Đáp án: <span className="text-white font-bold">{current.korean}</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Result Screen ─────────────────────────────────────────────────────────
function ResultScreen({ score, total, mode, onRetry, onBack, bookColor }: { score: number; total: number; mode: PracticeMode; onRetry: () => void; onBack: () => void; bookColor: string }) {
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 90 ? "Xuất sắc!" : pct >= 70 ? "Tốt lắm!" : pct >= 50 ? "Cố gắng thêm!" : "Cần ôn lại!";
  const gradeColor = pct >= 90 ? "#34d399" : pct >= 70 ? "app-accent-primary" : pct >= 50 ? "#fb923c" : "#f87171";

  return (
    <div className="flex flex-col items-center gap-6 py-8 max-w-md mx-auto text-center">
      <div className="w-24 h-24 flex items-center justify-center rounded-full" style={{ backgroundColor: `${gradeColor}15`, border: `3px solid ${gradeColor}40` }}>
        <p className="text-3xl font-bold" style={{ color: gradeColor }}>{pct}%</p>
      </div>
      <div>
        <p className="text-white text-2xl font-bold mb-1" style={{ color: gradeColor }}>{grade}</p>
        <p className="text-white/50 text-sm">Đúng {score}/{total} từ</p>
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={onRetry} className="flex-1 py-3 rounded-xl border border-white/15 text-white/60 font-semibold text-sm hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-refresh-line mr-2"></i>Làm lại
        </button>
        <button onClick={onBack} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap text-app-bg" style={{ backgroundColor: bookColor }}>
          <i className="ri-arrow-left-line mr-2"></i>Chọn bài khác
        </button>
      </div>
    </div>
  );
}

// ─── Leaderboard Panel ─────────────────────────────────────────────────────
function LeaderboardPanel() {
  const [practiceResults] = useLocalStorage<Record<string, { score: number; total: number; mode: string; date: string }[]>>("kts_seoul_practice", {});
  const [wrongWords] = useLocalStorage<WrongWord[]>("kts_seoul_wrong_words", []);

  const stats = useMemo(() => {
    const totalSessions = Object.values(practiceResults).reduce((sum, arr) => sum + arr.length, 0);
    const totalCorrect = Object.values(practiceResults).reduce((sum, arr) => sum + arr.reduce((s, r) => s + r.score, 0), 0);
    const totalWords = Object.values(practiceResults).reduce((sum, arr) => sum + arr.reduce((s, r) => s + r.total, 0), 0);
    const accuracy = totalWords > 0 ? Math.round((totalCorrect / totalWords) * 100) : 0;
    const bestLesson = Object.entries(practiceResults).reduce<{ id: string; pct: number } | null>((best, [id, arr]) => {
      const maxPct = Math.max(...arr.map(r => Math.round((r.score / r.total) * 100)));
      if (!best || maxPct > best.pct) return { id, pct: maxPct };
      return best;
    }, null);
    return { totalSessions, accuracy, wrongCount: wrongWords.length, bestLesson };
  }, [practiceResults, wrongWords]);

  const mockLeaderboard = [
    { rank: 1, name: "Nguyễn Thị Lan", xp: 2840, streak: 45, accuracy: 94, avatar: "ri-user-smile-line", color: "app-accent-primary" },
    { rank: 2, name: "Trần Văn Minh", xp: 2310, streak: 32, accuracy: 89, avatar: "ri-user-3-line", color: "#34d399" },
    { rank: 3, name: "Lê Thị Hoa", xp: 1980, streak: 28, accuracy: 91, avatar: "ri-user-heart-line", color: "#fb923c" },
    { rank: 4, name: "Phạm Quốc Bảo", xp: 1650, streak: 21, accuracy: 85, avatar: "ri-user-star-line", color: "#a78bfa" },
    { rank: 5, name: "Bạn", xp: stats.totalSessions * 50 + stats.accuracy * 10, streak: 0, accuracy: stats.accuracy, avatar: "ri-user-line", color: "#06b6d4", isMe: true },
  ].sort((a, b) => b.xp - a.xp).map((u, i) => ({ ...u, rank: i + 1 }));

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 flex items-center justify-center">
          <i className="ri-trophy-line text-app-accent-primary text-lg"></i>
        </div>
        <p className="text-white font-semibold text-sm">Bảng xếp hạng Seoul</p>
      </div>

      {/* My stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-app-surface/50 rounded-xl p-3 text-center">
          <p className="text-app-accent-primary text-xl font-bold">{stats.totalSessions}</p>
          <p className="text-app-text-muted text-[10px] mt-0.5">Buổi học</p>
        </div>
        <div className="bg-app-surface/50 rounded-xl p-3 text-center">
          <p className="text-app-accent-success text-xl font-bold">{stats.accuracy}%</p>
          <p className="text-app-text-muted text-[10px] mt-0.5">Độ chính xác</p>
        </div>
        <div className="bg-app-surface/50 rounded-xl p-3 text-center">
          <p className="text-red-400 text-xl font-bold">{stats.wrongCount}</p>
          <p className="text-app-text-muted text-[10px] mt-0.5">Từ cần ôn</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {mockLeaderboard.map(user => (
          <div key={user.rank} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${(user as { isMe?: boolean }).isMe ? "bg-[#06b6d4]/8 border border-[#06b6d4]/20" : "bg-white/2"}`}>
            <div className={`w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 text-xs font-bold ${user.rank === 1 ? "bg-app-accent-primary/20 text-app-accent-primary" : user.rank === 2 ? "bg-app-card/70 text-white/60" : user.rank === 3 ? "bg-[#fb923c]/20 text-[#fb923c]" : "bg-app-card/50 text-app-text-muted"}`}>
              {user.rank === 1 ? <i className="ri-trophy-fill text-xs"></i> : user.rank}
            </div>
            <div className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: `${user.color}15` }}>
              <i className={`${user.avatar} text-xs`} style={{ color: user.color }}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate ${(user as { isMe?: boolean }).isMe ? "text-[#06b6d4]" : "text-white/70"}`}>{user.name}</p>
              <p className="text-app-text-muted text-[10px]">{user.accuracy}% chính xác</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white/60 text-xs font-bold">{user.xp.toLocaleString()} XP</p>
              {user.streak > 0 && <p className="text-app-accent-primary text-[10px]"><i className="ri-fire-line"></i> {user.streak}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function SeoulPracticePage() {
  const navigate = useNavigate();
  const [completedLessons] = useLocalStorage<Record<string, boolean>>("kts_seoul_progress", {});
  const [practiceResults, setPracticeResults] = useLocalStorage<Record<string, { score: number; total: number; mode: string; date: string }[]>>("kts_seoul_practice", {});
  const [wrongWords, setWrongWords] = useLocalStorage<WrongWord[]>("kts_seoul_wrong_words", []);

  // Track study time for streak reminder
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LAST_STUDY_TIME, JSON.stringify({ timestamp: Date.now() }));
  }, []);

  const [selectedBook, setSelectedBook] = useState<SeoulBook | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<SeoulLesson | null>(null);
  const [mode, setMode] = useState<PracticeMode>("flashcard");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [shuffledWords, setShuffledWords] = useState<VocabItem[]>([]);
  const [key, setKey] = useState(0);

  // Save wrong word
  const handleWrongWord = useCallback((word: VocabItem) => {
    setWrongWords(prev => {
      const existing = prev.find(w => w.korean === word.korean);
      if (existing) {
        return prev.map(w => w.korean === word.korean ? { ...w, wrongCount: w.wrongCount + 1, lastWrong: new Date().toISOString() } : w);
      }
      const newWord: WrongWord = {
        korean: word.korean,
        vietnamese: word.vietnamese,
        pronunciation: word.pronunciation,
        example: word.example,
        exampleVi: word.exampleVi,
        lessonId: word.lessonId,
        lessonTitle: word.lessonTitle,
        bookId: selectedBook?.id || "",
        bookColor: word.bookColor,
        wrongCount: 1,
        lastWrong: new Date().toISOString(),
      };
      return [...prev, newWord];
    });
  }, [setWrongWords, selectedBook]);

  const availableBooks = useMemo(() => seoulBooks.filter(b => b.lessons.length > 0), []);

  const getWords = useCallback((lesson: SeoulLesson, book: SeoulBook): VocabItem[] => {
    return lesson.vocabulary.map(v => ({
      korean: v.korean,
      vietnamese: v.vietnamese,
      pronunciation: v.pronunciation,
      example: v.example,
      exampleVi: v.exampleVi,
      lessonId: lesson.id,
      lessonTitle: `${book.level} - Bài ${lesson.lessonNumber}`,
      bookColor: book.color,
    }));
  }, []);

  const handleStart = () => {
    if (!selectedLesson || !selectedBook) return;
    const words = shuffle(getWords(selectedLesson, selectedBook));
    setShuffledWords(words);
    setStarted(true);
    setFinished(false);
    setFinalScore(0);
    setKey(k => k + 1);
  };

  const handleFinish = (score: number) => {
    setFinalScore(score);
    setFinished(true);
    if (selectedLesson) {
      const k2 = selectedLesson.id;
      const entry = { score, total: shuffledWords.length, mode, date: new Date().toISOString() };
      setPracticeResults(prev => ({ ...prev, [k2]: [...(prev[k2] || []), entry] }));
    }
  };

  const handleRetry = () => {
    if (!selectedLesson || !selectedBook) return;
    const words = shuffle(getWords(selectedLesson, selectedBook));
    setShuffledWords(words);
    setFinished(false);
    setFinalScore(0);
    setKey(k => k + 1);
  };

  const handleBack = () => { setStarted(false); setFinished(false); setSelectedLesson(null); };

  const getLessonBestScore = (lessonId: string) => {
    const results = practiceResults[lessonId] || [];
    if (results.length === 0) return null;
    return Math.max(...results.map(r => Math.round((r.score / r.total) * 100)));
  };

  const modeInfo: Record<PracticeMode, { icon: string; label: string; desc: string }> = {
    flashcard: { icon: "ri-stack-line", label: "Flashcard", desc: "Lật thẻ học từ vựng" },
    quiz: { icon: "ri-survey-line", label: "Quiz", desc: "Trắc nghiệm 4 đáp án" },
    listen: { icon: "ri-headphone-line", label: "Nghe & Điền", desc: "Nghe và gõ từ tiếng Hàn" },
    matching: { icon: "ri-links-line", label: "Ghép cặp", desc: "Nối từ với nghĩa" },
    fillblank: { icon: "ri-edit-box-line", label: "Điền chỗ trống", desc: "Điền từ vào câu ví dụ" },
  };

  return (
    <DashboardLayout
      title="Luyện tập Giáo trình Seoul"
      subtitle="Flashcard, Quiz, Nghe & Điền và Ghép cặp theo từng bài học"
      actions={
        <div className="flex items-center gap-2">
          {wrongWords.length > 0 && (
            <button onClick={() => navigate("/seoul-wrong-review")} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-error-warning-line"></i>Ôn từ sai ({wrongWords.length})
            </button>
          )}
          <button onClick={() => navigate("/seoul-textbook")} className="flex items-center gap-2 bg-app-card/50 hover:bg-app-card/70 text-white/60 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-book-3-line"></i>Xem giáo trình
          </button>
        </div>
      }
    >
      {!started ? (
        <div className="space-y-6">
          {/* Book selector */}
          <div>
            <p className="text-white/50 text-xs font-semibold tracking-normal mb-3">Chọn cuốn sách</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {availableBooks.map(book => (
                <button key={book.id} onClick={() => { setSelectedBook(book); setSelectedLesson(null); }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${selectedBook?.id === book.id ? "border-white/25 bg-app-card/50" : "border-app-border bg-white/2 hover:border-white/15"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${book.color}20`, color: book.color }}>{book.level}</span>
                  </div>
                  <p className="text-white text-sm font-semibold">{book.name}</p>
                  <p className="text-app-text-muted text-xs mt-1">{book.lessons.length} bài có dữ liệu</p>
                </button>
              ))}
            </div>
          </div>

          {/* Lesson selector */}
          {selectedBook && (
            <div>
              <p className="text-white/50 text-xs font-semibold tracking-normal mb-3">Chọn bài học</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {selectedBook.lessons.map(lesson => {
                  const best = getLessonBestScore(lesson.id);
                  const isCompleted = !!completedLessons[lesson.id];
                  return (
                    <button key={lesson.id} onClick={() => setSelectedLesson(lesson)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-4 ${selectedLesson?.id === lesson.id ? "border-white/25 bg-app-card/50" : "border-app-border bg-white/2 hover:border-white/15"}`}>
                      <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 text-sm font-bold ${isCompleted ? "bg-app-accent-success/15 text-app-accent-success" : "bg-app-card/50 text-app-text-muted"}`}>
                        {isCompleted ? <i className="ri-checkbox-circle-fill text-lg"></i> : lesson.lessonNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-sm font-semibold truncate">{lesson.titleVi}</p>
                        <p className="text-app-text-muted text-xs truncate">{lesson.vocabulary.length} từ vựng</p>
                      </div>
                      {best !== null && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${best >= 80 ? "bg-app-accent-success/15 text-app-accent-success" : "bg-app-accent-primary/15 text-app-accent-primary"}`}>{best}%</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode selector */}
          {selectedLesson && (
            <div>
              <p className="text-white/50 text-xs font-semibold tracking-normal mb-3">Chọn chế độ luyện tập</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {(Object.entries(modeInfo) as [PracticeMode, typeof modeInfo[PracticeMode]][]).map(([m, info]) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${mode === m ? "border-white/25 bg-app-card/50" : "border-app-border bg-white/2 hover:border-white/15"}`}>
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto mb-2" style={{ backgroundColor: mode === m ? `${selectedBook?.color || "app-accent-primary"}20` : "rgba(255,255,255,0.05)" }}>
                      <i className={`${info.icon} text-lg`} style={{ color: mode === m ? (selectedBook?.color || "app-accent-primary") : "rgba(255,255,255,0.3)" }}></i>
                    </div>
                    <p className={`text-sm font-semibold ${mode === m ? "text-white" : "text-white/50"}`}>{info.label}</p>
                    <p className="text-app-text-muted text-xs mt-0.5">{info.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start button */}
          {selectedLesson && selectedBook && (
            <div className="flex justify-center pt-2">
              <button onClick={handleStart} className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all cursor-pointer whitespace-nowrap text-app-bg hover:opacity-90" style={{ backgroundColor: selectedBook.color }}>
                <i className="ri-play-fill text-xl"></i>
                Bắt đầu luyện tập ({selectedLesson.vocabulary.length} từ)
              </button>
            </div>
          )}

          {/* Stats overview + Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Object.keys(practiceResults).length > 0 && (
              <div className="bg-app-bg border border-app-border rounded-2xl p-5">
                <p className="text-white/50 text-xs font-semibold tracking-normal mb-4">Kết quả gần đây</p>
                <div className="space-y-2">
                  {Object.entries(practiceResults).slice(-5).reverse().map(([lessonId, results]) => {
                    const last = results[results.length - 1];
                    const pct = Math.round((last.score / last.total) * 100);
                    const lesson = seoulBooks.flatMap(b => b.lessons).find(l => l.id === lessonId);
                    if (!lesson) return null;
                    return (
                      <div key={lessonId} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white/60 text-xs truncate">{lesson.titleVi}</p>
                          <p className="text-app-text-muted text-[10px]">{modeInfo[last.mode as PracticeMode]?.label} · {new Date(last.date).toLocaleDateString("vi-VN")}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pct >= 80 ? "bg-app-accent-success/15 text-app-accent-success" : "bg-app-accent-primary/15 text-app-accent-primary"}`}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <LeaderboardPanel />
          </div>
        </div>
      ) : finished ? (
        <ResultScreen score={finalScore} total={shuffledWords.length} mode={mode} onRetry={handleRetry} onBack={handleBack} bookColor={selectedBook?.color || "app-accent-primary"} />
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={handleBack} className="flex items-center gap-2 text-app-text-secondary hover:text-white/70 text-sm cursor-pointer transition-colors">
              <i className="ri-arrow-left-line"></i>Quay lại
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: `${selectedBook?.color || "app-accent-primary"}20`, color: selectedBook?.color || "app-accent-primary" }}>
                {modeInfo[mode].label}
              </span>
              <span className="text-app-text-secondary text-xs">{selectedLesson?.titleVi}</span>
            </div>
          </div>
          {mode === "flashcard" && <FlashcardMode key={key} words={shuffledWords} onFinish={handleFinish} />}
          {mode === "quiz" && <QuizMode key={key} words={shuffledWords} onFinish={handleFinish} onWrong={handleWrongWord} />}
          {mode === "listen" && <ListenMode key={key} words={shuffledWords} onFinish={handleFinish} />}
          {mode === "matching" && <MatchingMode key={key} words={shuffledWords} onFinish={handleFinish} onWrong={handleWrongWord} />}
          {mode === "fillblank" && <FillBlankMode key={key} words={shuffledWords} onFinish={handleFinish} onWrong={handleWrongWord} />}
        </div>
      )}
    </DashboardLayout>
  );
}

