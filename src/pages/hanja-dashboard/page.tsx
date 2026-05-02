import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";

interface HanjaNode {
  id: string;
  korean: string;
  hanja: string;
  vietnamese: string;
  root_char: string;
  difficulty: number;
  category: string;
  pronunciation?: string;
  meaning_detail?: string;
}

const LEARNED_KEY = "hanja_tree_learned";
const STREAK_KEY = "hanja_streak_log";
const ROOT_MEANINGS: Record<string, string> = {
  "人": "Người", "大": "Lớn", "國": "Quốc gia", "學": "Học", "心": "Tâm/Lòng",
};

function loadLearned(): Set<string> {
  try {
    const raw = localStorage.getItem(LEARNED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function loadStreakDays(): string[] {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function calcStreak(days: string[]): { current: number; longest: number; total: number } {
  if (days.length === 0) return { current: 0, longest: 0, total: 0 };
  const sorted = [...new Set(days)].sort();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  let current = 0;
  let longest = 0;
  let streak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = sorted[i];
    if (i === sorted.length - 1) {
      if (d === today || d === yesterday) { streak = 1; }
      else break;
    } else {
      const prev = sorted[i + 1];
      const diff = (new Date(prev).getTime() - new Date(d).getTime()) / 86400000;
      if (diff === 1) streak++;
      else break;
    }
  }
  current = streak;
  let tmp = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
    if (diff === 1) { tmp++; longest = Math.max(longest, tmp); }
    else tmp = 1;
  }
  longest = Math.max(longest, current);
  return { current, longest, total: sorted.length };
}

function exportLearnedCSV(nodes: HanjaNode[], learnedSet: Set<string>) {
  const learned = nodes.filter(n => learnedSet.has(n.korean));
  if (learned.length === 0) return;
  const header = "korean,hanja,vietnamese,root_char,difficulty,category";
  const rows = learned.map(n =>
    `"${n.korean}","${n.hanja}","${n.vietnamese}","${n.root_char}",${n.difficulty},"${n.category}"`
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hanja_da_hoc_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Global Search Component ──────────────────────────────────────────────────
function GlobalSearchPanel({ nodes }: { nodes: HanjaNode[] }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState<HanjaNode | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return nodes.filter(n =>
      n.korean.toLowerCase().includes(q) ||
      n.hanja.includes(q) ||
      n.vietnamese.toLowerCase().includes(q) ||
      (n.pronunciation || "").toLowerCase().includes(q) ||
      (n.meaning_detail || "").toLowerCase().includes(q)
    ).slice(0, 12);
  }, [query, nodes]);

  const handleSelect = (node: HanjaNode) => {
    setSelected(node);
    setQuery("");
    setFocused(false);
  };

  return (
    <div className="relative mb-6">
      <div className={`flex items-center gap-3 border-2 rounded-2xl px-4 py-3 transition-all ${focused ? "border-rose-500/60 bg-app-card/50" : "border-app-border bg-app-card/50"}`}>
        <i className="ri-search-line text-app-text-secondary text-lg flex-shrink-0"></i>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Tìm kiếm Hán Hàn... (tiếng Hàn, Hán tự, nghĩa tiếng Việt)"
          className="flex-1 text-sm text-white/80 placeholder-white/30 focus:outline-none bg-transparent"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-app-text-muted hover:text-white/60 cursor-pointer flex-shrink-0">
            <i className="ri-close-line text-lg"></i>
          </button>
        )}
        <span className="text-xs text-app-text-muted flex-shrink-0 hidden sm:block">{nodes.length} từ</span>
      </div>

      {focused && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1d27] border border-app-border rounded-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
          {results.map(node => (
            <button
              key={node.id}
              onMouseDown={() => handleSelect(node)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-app-card/50 transition-colors cursor-pointer text-left border-b border-app-border last:border-0"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-rose-500/20 rounded-xl flex-shrink-0">
                <span className="text-rose-400 font-bold text-sm">{node.hanja}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white/90 text-sm">{node.korean}</span>
                  <span className="text-xs text-app-text-secondary">{node.pronunciation}</span>
                </div>
                <p className="text-xs text-white/50 truncate">{node.vietnamese}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-app-text-secondary">{node.root_char}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  node.difficulty === 1 ? "bg-emerald-500/20 text-app-accent-success" :
                  node.difficulty === 2 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                }`}>{node.difficulty === 1 ? "Dễ" : node.difficulty === 2 ? "TB" : "Khó"}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {focused && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1d27] border border-app-border rounded-2xl p-6 text-center z-50">
          <i className="ri-search-line text-2xl text-app-text-muted mb-2 block"></i>
          <p className="text-sm text-app-text-secondary">Không tìm thấy từ nào cho &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {selected && (
        <div className="mt-3 bg-[#1a1d27] border-2 border-rose-500/30 rounded-2xl p-4 relative">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/12 text-app-text-secondary cursor-pointer"
          >
            <i className="ri-close-line text-sm"></i>
          </button>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 flex items-center justify-center bg-rose-500/20 rounded-2xl flex-shrink-0">
              <span className="text-rose-400 font-black text-2xl">{selected.hanja}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-black text-white/90">{selected.korean}</span>
                {selected.pronunciation && (
                  <span className="text-sm text-app-text-secondary">[{selected.pronunciation}]</span>
                )}
              </div>
              <p className="text-sm font-semibold text-white/70 mb-1">{selected.vietnamese}</p>
              {selected.meaning_detail && (
                <p className="text-xs text-app-text-secondary leading-relaxed">{selected.meaning_detail}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-app-text-secondary">Gốc: {selected.root_char}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-app-text-secondary">{selected.category}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  selected.difficulty === 1 ? "bg-emerald-500/20 text-app-accent-success" :
                  selected.difficulty === 2 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                }`}>{selected.difficulty === 1 ? "Dễ" : selected.difficulty === 2 ? "Trung bình" : "Khó"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Review Quiz Modal ────────────────────────────────────────────────────────
type QuizCard = HanjaNode & { showAnswer: boolean };

function ReviewQuizModal({ nodes, learnedSet, onClose }: {
  nodes: HanjaNode[];
  learnedSet: Set<string>;
  onClose: () => void;
}) {
  const learnedNodes = useMemo(() =>
    nodes.filter(n => learnedSet.has(n.korean)),
    [nodes, learnedSet]
  );

  const [cards, setCards] = useState<QuizCard[]>(() => {
    const shuffled = [...learnedNodes].sort(() => Math.random() - 0.5).slice(0, 20);
    return shuffled.map(n => ({ ...n, showAnswer: false }));
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [finished, setFinished] = useState(false);
  const [quizMode, setQuizMode] = useState<"kr-to-vi" | "vi-to-kr">("kr-to-vi");
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentCard = cards[currentIdx];

  const generateOptions = useCallback((card: QuizCard, allNodes: HanjaNode[], mode: "kr-to-vi" | "vi-to-kr") => {
    const correct = mode === "kr-to-vi" ? card.vietnamese : card.korean;
    const pool = allNodes
      .filter(n => n.korean !== card.korean)
      .map(n => mode === "kr-to-vi" ? n.vietnamese : n.korean)
      .filter((v, i, arr) => arr.indexOf(v) === i);
    const wrong = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    return [...wrong, correct].sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {
    if (currentCard && nodes.length >= 4) {
      setOptions(generateOptions(currentCard, nodes, quizMode));
      setSelectedOption(null);
    }
  }, [currentIdx, quizMode, currentCard, nodes, generateOptions]);

  if (learnedNodes.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-[#1a1d27] border border-app-border rounded-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
          <i className="ri-book-open-line text-4xl text-app-text-muted mb-3 block"></i>
          <h3 className="text-lg font-bold text-white/80 mb-2">Chưa có từ đã học</h3>
          <p className="text-sm text-app-text-secondary mb-4">Hãy vào Hán Hàn hình cây và đánh dấu một số từ đã học trước nhé!</p>
          <button onClick={onClose} className="w-full py-2.5 bg-rose-500 text-white font-bold rounded-xl cursor-pointer whitespace-nowrap">Đóng</button>
        </div>
      </div>
    );
  }

  if (finished) {
    const total = score.correct + score.wrong;
    const pct = total > 0 ? Math.round((score.correct / total) * 100) : 0;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-[#1a1d27] border border-app-border rounded-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
          <div className="w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4" style={{ backgroundColor: pct >= 70 ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)" }}>
            <i className={`text-4xl ${pct >= 70 ? "ri-trophy-line text-app-accent-success" : "ri-emotion-sad-line text-rose-400"}`}></i>
          </div>
          <h3 className="text-xl font-bold text-white/90 mb-1">{pct}%</h3>
          <p className="text-sm text-white/50 mb-4">
            {score.correct}/{total} câu đúng
            {pct >= 80 ? " — Xuất sắc!" : pct >= 60 ? " — Khá tốt!" : " — Cần ôn thêm!"}
          </p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <p className="text-2xl font-bold text-app-accent-success">{score.correct}</p>
              <p className="text-xs text-emerald-500/70">Đúng</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-2xl font-bold text-red-400">{score.wrong}</p>
              <p className="text-xs text-red-500/70">Sai</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const shuffled = [...learnedNodes].sort(() => Math.random() - 0.5).slice(0, 20);
                setCards(shuffled.map(n => ({ ...n, showAnswer: false })));
                setCurrentIdx(0);
                setScore({ correct: 0, wrong: 0 });
                setFinished(false);
                setSelectedOption(null);
              }}
              className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl cursor-pointer whitespace-nowrap text-sm"
            >
              Ôn lại
            </button>
            <button onClick={onClose} className="flex-1 py-2.5 bg-white/8 hover:bg-white/12 text-white/70 font-bold rounded-xl cursor-pointer whitespace-nowrap text-sm">
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAnswer = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    const correct = quizMode === "kr-to-vi" ? currentCard.vietnamese : currentCard.korean;
    const isCorrect = option === correct;
    setScore(s => ({ ...s, correct: s.correct + (isCorrect ? 1 : 0), wrong: s.wrong + (isCorrect ? 0 : 1) }));
    setTimeout(() => {
      if (currentIdx + 1 >= cards.length) {
        setFinished(true);
      } else {
        setCurrentIdx(i => i + 1);
      }
    }, 900);
  };

  const correctAnswer = quizMode === "kr-to-vi" ? currentCard.vietnamese : currentCard.korean;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1a1d27] border border-app-border rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <i className="ri-brain-line text-rose-400"></i>
            <span className="text-sm font-bold text-white/80">Ôn tập từ đã học</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuizMode(m => m === "kr-to-vi" ? "vi-to-kr" : "kr-to-vi")}
              className="text-xs px-2.5 py-1 rounded-full bg-white/8 hover:bg-white/12 text-white/60 cursor-pointer whitespace-nowrap"
            >
              {quizMode === "kr-to-vi" ? "HK → VN" : "VN → HK"}
            </button>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/12 text-app-text-secondary cursor-pointer">
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>
        </div>

        <div className="px-5 pb-3">
          <div className="flex items-center justify-between text-xs text-app-text-secondary mb-1.5">
            <span>{currentIdx + 1}/{cards.length}</span>
            <span className="text-app-accent-success font-medium">{score.correct} đúng</span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-rose-400 rounded-full transition-all" style={{ width: `${((currentIdx) / cards.length) * 100}%` }} />
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center mb-4">
            {quizMode === "kr-to-vi" ? (
              <>
                <p className="text-4xl font-black text-white/90 mb-1">{currentCard.korean}</p>
                <p className="text-lg text-rose-400 font-bold">{currentCard.hanja}</p>
                {currentCard.pronunciation && (
                  <p className="text-sm text-app-text-secondary mt-1">[{currentCard.pronunciation}]</p>
                )}
                <p className="text-xs text-app-text-muted mt-2">Nghĩa tiếng Việt là gì?</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-white/80 mb-1">{currentCard.vietnamese}</p>
                <p className="text-xs text-app-text-muted mt-2">Từ tiếng Hàn tương ứng là gì?</p>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {options.map(opt => {
              const isCorrect = opt === correctAnswer;
              const isSelected = opt === selectedOption;
              let cls = "border-app-border bg-app-card/50 text-white/70 hover:border-white/20 hover:bg-white/8";
              if (selectedOption) {
                if (isCorrect) cls = "border-emerald-500/50 bg-app-accent-success/15 text-app-accent-success";
                else if (isSelected) cls = "border-red-500/50 bg-red-500/15 text-red-400";
                else cls = "border-app-border bg-app-surface/50 text-app-text-muted";
              }
              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!selectedOption}
                  className={`border-2 rounded-xl px-3 py-3 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap text-center ${cls}`}
                >
                  {opt}
                  {selectedOption && isCorrect && <i className="ri-check-line ml-1 text-app-accent-success"></i>}
                  {selectedOption && isSelected && !isCorrect && <i className="ri-close-line ml-1 text-red-400"></i>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Daily New Words Component ──────────────────────────────────────────────
const DAILY_WORDS_KEY = "hanja_daily_words";

function loadDailyWords(nodes: HanjaNode[], learnedSet: Set<string>): HanjaNode[] {
  try {
    const today = new Date().toISOString().split("T")[0];
    const raw = localStorage.getItem(DAILY_WORDS_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as { date: string; wordIds: string[] };
      if (saved.date === today) {
        const words = saved.wordIds.map(id => nodes.find(n => n.id === id)).filter(Boolean) as HanjaNode[];
        if (words.length > 0) return words;
      }
    }
    const unlearned = nodes.filter(n => !learnedSet.has(n.korean));
    const shuffled = [...unlearned].sort(() => Math.random() - 0.5).slice(0, 8);
    localStorage.setItem(DAILY_WORDS_KEY, JSON.stringify({ date: today, wordIds: shuffled.map(n => n.id) }));
    return shuffled;
  } catch { return []; }
}

function DailyWordsPanel({ nodes, learnedSet, onToggleLearned }: {
  nodes: HanjaNode[];
  learnedSet: Set<string>;
  onToggleLearned: (korean: string) => void;
}) {
  const [dailyWords, setDailyWords] = useState<HanjaNode[]>([]);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (nodes.length > 0) {
      setDailyWords(loadDailyWords(nodes, learnedSet));
    }
  }, [nodes, learnedSet]);

  const toggleFlip = (id: string) => {
    setFlipped(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const refreshDaily = () => {
    localStorage.removeItem(DAILY_WORDS_KEY);
    setDailyWords(loadDailyWords(nodes, learnedSet));
    setFlipped(new Set());
  };

  const learnedToday = dailyWords.filter(n => learnedSet.has(n.korean)).length;

  if (dailyWords.length === 0) return null;

  return (
    <div className="bg-app-card/50 border border-app-border rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center bg-rose-500/20 rounded-xl">
            <i className="ri-sun-line text-rose-400 text-sm"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white/80">Học từ mới hôm nay</h3>
            <p className="text-xs text-app-text-secondary">{learnedToday}/{dailyWords.length} từ đã học · Nhấn thẻ để xem nghĩa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {learnedToday === dailyWords.length && dailyWords.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-app-accent-success font-semibold bg-app-accent-success/15 px-2.5 py-1 rounded-full">
              <i className="ri-checkbox-circle-fill"></i>Hoàn thành!
            </span>
          )}
          <button onClick={refreshDaily} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/12 text-app-text-secondary cursor-pointer transition-all" title="Làm mới danh sách">
            <i className="ri-refresh-line text-sm"></i>
          </button>
        </div>
      </div>

      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500"
          style={{ width: `${dailyWords.length > 0 ? (learnedToday / dailyWords.length) * 100 : 0}%` }} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {dailyWords.map(node => {
          const isFlipped = flipped.has(node.id);
          const isLearned = learnedSet.has(node.korean);
          return (
            <div key={node.id} className="relative">
              <div
                onClick={() => toggleFlip(node.id)}
                className={`rounded-xl border-2 p-3 cursor-pointer transition-all min-h-[100px] flex flex-col justify-between ${
                  isLearned
                    ? "border-emerald-500/30 bg-emerald-500/8"
                    : isFlipped
                    ? "border-rose-500/30 bg-rose-500/8"
                    : "border-app-border bg-white/4 hover:border-rose-500/30 hover:bg-rose-500/8"
                }`}
              >
                {!isFlipped ? (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-black text-white/90">{node.korean}</p>
                        <p className="text-sm text-rose-400 font-bold">{node.hanja}</p>
                      </div>
                      {isLearned && (
                        <div className="w-5 h-5 flex items-center justify-center bg-emerald-500/20 rounded-full flex-shrink-0">
                          <i className="ri-check-line text-app-accent-success text-[10px]"></i>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-app-text-muted mt-1">{node.pronunciation}</p>
                    <p className="text-[10px] text-app-text-muted mt-1 text-center">Nhấn để xem nghĩa</p>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-bold text-white/80 mb-0.5">{node.korean} · {node.hanja}</p>
                      <p className="text-sm font-semibold text-rose-400">{node.vietnamese}</p>
                      {node.meaning_detail && (
                        <p className="text-[10px] text-app-text-secondary mt-1 leading-relaxed line-clamp-2">{node.meaning_detail}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                        node.difficulty === 1 ? "bg-emerald-500/20 text-app-accent-success" :
                        node.difficulty === 2 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                      }`}>{node.difficulty === 1 ? "Dễ" : node.difficulty === 2 ? "TB" : "Khó"}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/8 text-app-text-secondary">{node.category}</span>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => onToggleLearned(node.korean)}
                className={`absolute -top-1.5 -right-1.5 w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#141720] cursor-pointer transition-all ${
                  isLearned ? "bg-emerald-400 text-white" : "bg-white/15 text-app-text-secondary hover:bg-emerald-400 hover:text-white"
                }`}
                title={isLearned ? "Bỏ đánh dấu" : "Đánh dấu đã học"}
              >
                <i className="ri-check-line text-[10px]"></i>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function HanjaDashboardPage() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<HanjaNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [learnedSet, setLearnedSet] = useState<Set<string>>(loadLearned);
  const [showReview, setShowReview] = useState(false);
  const [streakDays, setStreakDays] = useState<string[]>(loadStreakDays);

  const toggleLearned = useCallback((korean: string) => {
    setLearnedSet(prev => {
      const next = new Set(prev);
      next.has(korean) ? next.delete(korean) : next.add(korean);
      localStorage.setItem(LEARNED_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  useEffect(() => {
    const fetchNodes = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("hanja_tree_nodes")
        .select("id, korean, hanja, vietnamese, root_char, difficulty, category, pronunciation, meaning_detail")
        .order("root_char");
      if (data) setNodes(data as HanjaNode[]);
      setLoading(false);
    };
    fetchNodes();
  }, []);

  useEffect(() => {
    const onStorage = () => {
      setLearnedSet(loadLearned());
      setStreakDays(loadStreakDays());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (learnedSet.size === 0) return;
    const today = new Date().toISOString().split("T")[0];
    setStreakDays(prev => {
      if (prev.includes(today)) return prev;
      const next = [...prev, today];
      localStorage.setItem(STREAK_KEY, JSON.stringify(next));
      return next;
    });
  }, [learnedSet.size]);

  const treeStats = useMemo(() => {
    const groups: Record<string, HanjaNode[]> = {};
    nodes.forEach(n => {
      if (!groups[n.root_char]) groups[n.root_char] = [];
      groups[n.root_char].push(n);
    });
    return Object.entries(groups).map(([rootChar, grpNodes]) => {
      const learned = grpNodes.filter(n => learnedSet.has(n.korean)).length;
      return {
        rootChar,
        rootMeaning: ROOT_MEANINGS[rootChar] || rootChar,
        total: grpNodes.length,
        learned,
        pct: grpNodes.length > 0 ? Math.round((learned / grpNodes.length) * 100) : 0,
      };
    });
  }, [nodes, learnedSet]);

  const totalLearned = nodes.filter(n => learnedSet.has(n.korean)).length;
  const totalPct = nodes.length > 0 ? Math.round((totalLearned / nodes.length) * 100) : 0;

  const diffStats = useMemo(() => {
    const easy = nodes.filter(n => n.difficulty === 1);
    const med = nodes.filter(n => n.difficulty === 2);
    const hard = nodes.filter(n => n.difficulty === 3);
    return [
      { label: "Dễ", total: easy.length, learned: easy.filter(n => learnedSet.has(n.korean)).length, color: "#10b981" },
      { label: "Trung bình", total: med.length, learned: med.filter(n => learnedSet.has(n.korean)).length, color: "#f59e0b" },
      { label: "Khó", total: hard.length, learned: hard.filter(n => learnedSet.has(n.korean)).length, color: "#f43f5e" },
    ];
  }, [nodes, learnedSet]);

  const recentLearned = useMemo(() => {
    return nodes.filter(n => learnedSet.has(n.korean)).slice(-10).reverse();
  }, [nodes, learnedSet]);

  const streak = useMemo(() => calcStreak(streakDays), [streakDays]);

  return (
    <DashboardLayout title="Tổng quan Hán Hàn" subtitle="Theo dõi tiến độ học từ vựng Hán Hàn và quản lý dữ liệu">
      <div className="p-6">
        {/* Global Search */}
        <GlobalSearchPanel nodes={nodes} />

        {/* Daily new words */}
        {!loading && (
          <DailyWordsPanel
            nodes={nodes}
            learnedSet={learnedSet}
            onToggleLearned={toggleLearned}
          />
        )}

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Tổng từ vựng", value: nodes.length, icon: "ri-character-recognition-line", color: "#f43f5e" },
            { label: "Đã học", value: totalLearned, icon: "ri-checkbox-circle-line", color: "#10b981" },
            { label: "Tiến độ", value: `${totalPct}%`, icon: "ri-pie-chart-2-line", color: "#f59e0b" },
            { label: "Streak hiện tại", value: `${streak.current} ngày`, icon: "ri-fire-line", color: "#f97316" },
          ].map(s => (
            <div key={s.label} className="bg-app-card/50 border border-app-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}20` }}>
                <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
              </div>
              <div>
                <p className="text-xl font-bold text-white/90">{loading ? "..." : s.value}</p>
                <p className="text-xs text-app-text-secondary">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Overall progress bar + actions */}
        <div className="bg-app-card/50 border border-app-border rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-white/70">Tiến độ tổng thể</p>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <p className="text-sm font-bold text-rose-400">{totalLearned}/{nodes.length} từ</p>
              {totalLearned > 0 && (
                <button onClick={() => exportLearnedCSV(nodes, learnedSet)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap transition-all">
                  <i className="ri-download-2-line"></i>Xuất CSV
                </button>
              )}
              {totalLearned > 0 && (
                <button onClick={() => setShowReview(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap transition-all">
                  <i className="ri-brain-line"></i>Ôn tập ({totalLearned} từ)
                </button>
              )}
            </div>
          </div>
          <div className="h-3 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-700" style={{ width: `${totalPct}%` }} />
          </div>
          <p className="text-xs text-app-text-muted mt-1.5">Còn {nodes.length - totalLearned} từ chưa học</p>
        </div>

        {/* Streak card */}
        <div className="bg-orange-500/8 border border-orange-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center bg-orange-500/20 rounded-xl flex-shrink-0">
                <i className="ri-fire-line text-orange-400 text-xl"></i>
              </div>
              <div>
                <p className="text-xs text-orange-400 font-semibold">Streak học Hán Hàn</p>
                <p className="text-xl font-bold text-orange-300">{streak.current} <span className="text-sm font-normal text-orange-400/70">ngày liên tiếp</span></p>
              </div>
            </div>
            <div className="flex items-center gap-6 ml-auto flex-wrap">
              <div className="text-center">
                <p className="text-lg font-bold text-white/70">{streak.longest}</p>
                <p className="text-[10px] text-app-text-muted">Dài nhất</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white/70">{streak.total}</p>
                <p className="text-[10px] text-app-text-muted">Tổng ngày</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white/70">{totalLearned}</p>
                <p className="text-[10px] text-app-text-muted">Đã học</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Tree progress + Difficulty */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-app-card/50 border border-app-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white/80">Tiến độ theo cây</h3>
                <button onClick={() => navigate("/hanja-tree")} className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 cursor-pointer font-medium">
                  Vào học <i className="ri-arrow-right-line"></i>
                </button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <i className="ri-loader-4-line animate-spin text-app-text-muted"></i>
                </div>
              ) : treeStats.length === 0 ? (
                <div className="text-center py-8 text-app-text-muted">
                  <i className="ri-tree-line text-3xl mb-2 block"></i>
                  <p className="text-sm">Chưa có dữ liệu. Import CSV để bắt đầu!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {treeStats.map(t => (
                    <button key={t.rootChar} onClick={() => navigate("/hanja-tree")}
                      className="w-full flex items-center gap-3 hover:bg-app-card/50 rounded-xl p-2 transition-all cursor-pointer text-left">
                      <div className="w-10 h-10 flex items-center justify-center bg-rose-500/20 rounded-xl text-lg font-bold text-rose-400 flex-shrink-0">{t.rootChar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-white/70">{t.rootMeaning}</p>
                          <span className="text-xs text-app-text-secondary">{t.learned}/{t.total} · {t.pct}%</span>
                        </div>
                        <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${t.pct}%`, backgroundColor: t.pct >= 80 ? "#10b981" : t.pct >= 50 ? "#f59e0b" : "#f43f5e" }} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-app-card/50 border border-app-border rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white/80 mb-4">Phân bổ theo độ khó</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {diffStats.map(d => (
                  <div key={d.label} className="text-center p-4 rounded-xl border border-app-border bg-app-surface/50">
                    <p className="text-2xl font-bold mb-1" style={{ color: d.color }}>{d.learned}</p>
                    <p className="text-xs text-white/50 mb-2">{d.label}</p>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${d.total > 0 ? (d.learned / d.total) * 100 : 0}%`, backgroundColor: d.color }} />
                    </div>
                    <p className="text-[10px] text-app-text-muted mt-1">{d.learned}/{d.total}</p>
                  </div>
                ))}
              </div>
            </div>

            {recentLearned.length > 0 && (
              <div className="bg-app-card/50 border border-app-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white/80">Từ vừa học gần đây</h3>
                  <button onClick={() => setShowReview(true)} className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer font-medium flex items-center gap-1">
                    <i className="ri-brain-line"></i> Ôn tập ngay
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentLearned.map((n, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <span className="text-sm font-bold text-white/80">{n.korean}</span>
                      <span className="text-xs text-rose-400">{n.hanja}</span>
                      <span className="text-xs text-app-text-secondary">{n.vietnamese}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Quick actions */}
          <div>
            <div className="bg-app-card/50 border border-app-border rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-white/50 mb-3">Truy cập nhanh</h3>
              {[
                { label: "Học theo cây", icon: "ri-git-merge-line", path: "/hanja-tree", color: "#f43f5e" },
                { label: "Từ vựng Hán Hàn", icon: "ri-translate-2", path: "/hanja-vocab", color: "#a78bfa" },
                { label: "Hán Hàn chi tiết", icon: "ri-character-recognition-line", path: "/hanja-detail", color: "#f59e0b" },
              ].map(a => (
                <button key={a.path} onClick={() => navigate(a.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-app-card/50 transition-all cursor-pointer text-left border border-app-border">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${a.color}20` }}>
                    <i className={`${a.icon} text-sm`} style={{ color: a.color }}></i>
                  </div>
                  <span className="text-sm font-medium text-white/70">{a.label}</span>
                  <i className="ri-arrow-right-s-line text-app-text-muted ml-auto"></i>
                </button>
              ))}
            </div>

            <div className="mt-4 bg-amber-500/8 border border-amber-500/20 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <i className="ri-shield-keyhole-line text-amber-400 text-sm flex-shrink-0 mt-0.5"></i>
                <div>
                  <p className="text-xs font-semibold text-amber-400">Import dữ liệu</p>
                  <p className="text-[10px] text-amber-400/60 mt-0.5">Chức năng import CSV/Excel chỉ dành cho quản trị viên. Truy cập trang Admin để thực hiện.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReview && (
        <ReviewQuizModal
          nodes={nodes}
          learnedSet={learnedSet}
          onClose={() => setShowReview(false)}
        />
      )}
    </DashboardLayout>
  );
}


