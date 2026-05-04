import { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAudioCache } from "@/hooks/useAudioCache";
import { epsVocabulary, EPS_VOCAB_TOPICS, type EpsVocabItem } from "@/mocks/epsVocabulary";
import { epsQuestions, EPS_TOPICS, type EpsQuestion } from "@/mocks/epsQuestions";

// --- SM-2 Algorithm -------------------------------------------------------
interface SRCard {
  id: string;
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReview: string;
  lastReview?: string;
  totalReviews: number;
  correctStreak: number;
}

// SR card for wrong EPS questions
interface SRQuestionCard extends SRCard {
  type: "question";
  wrongCount: number;
  addedAt: string;
}

function sm2(card: SRCard, quality: 0 | 1 | 2 | 3 | 4 | 5): SRCard {
  let { repetitions, easeFactor, interval } = card;
  if (quality >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  return {
    ...card,
    repetitions,
    easeFactor,
    interval,
    nextReview: nextReview.toISOString().split("T")[0],
    lastReview: new Date().toISOString().split("T")[0],
    totalReviews: card.totalReviews + 1,
    correctStreak: quality >= 3 ? card.correctStreak + 1 : 0,
  };
}

function getDefaultCard(id: string): SRCard {
  return { id, repetitions: 0, easeFactor: 2.5, interval: 0, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctStreak: 0 };
}

const QUALITY_LABELS = [
  { q: 0 as const, label: "Không nh?", color: "#f87171", bg: "bg-red-500/10 border-red-500/20 hover:bg-red-500/20", icon: "ri-close-circle-line" },
  { q: 2 as const, label: "Khó", color: "#fb923c", bg: "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20", icon: "ri-emotion-sad-line" },
  { q: 3 as const, label: "Ðu?c", color: "app-accent-primary", bg: "bg-app-accent-primary/10 border-app-accent-primary/20 hover:bg-app-accent-primary/20", icon: "ri-emotion-normal-line" },
  { q: 5 as const, label: "D?", color: "#34d399", bg: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20", icon: "ri-emotion-happy-line" },
];

// --- Stats Panel ----------------------------------------------------------
function StatsPanel({ cards, srData }: { cards: EpsVocabItem[]; srData: Record<string, SRCard> }) {
  const today = new Date().toISOString().split("T")[0];
  const dueToday = cards.filter(c => { const sr = srData[c.id]; return !sr || sr.nextReview <= today; }).length;
  const learned = Object.values(srData).filter(s => s.repetitions > 0).length;
  const mastered = Object.values(srData).filter(s => s.repetitions >= 5 && s.easeFactor >= 2.5).length;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {[
        { label: "C?n ôn hôm nay", value: dueToday, color: dueToday > 0 ? "#f87171" : "#34d399", icon: "ri-time-line" },
        { label: "Ðã h?c", value: learned, color: "app-accent-primary", icon: "ri-book-open-line" },
        { label: "Thu?c lòng", value: mastered, color: "#a78bfa", icon: "ri-brain-line" },
        { label: "T?ng t?", value: cards.length, color: "#fb923c", icon: "ri-file-list-3-line" },
      ].map(s => (
        <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
            <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-none">{s.value}</p>
            <p className="text-app-text-secondary text-xs mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Wrong Questions Stats Panel -----------------------------------------
function WrongQStatsPanel({ srQData, totalWrong }: { srQData: Record<string, SRQuestionCard>; totalWrong: number }) {
  const today = new Date().toISOString().split("T")[0];
  const dueToday = Object.values(srQData).filter(c => c.nextReview <= today).length;
  const mastered = Object.values(srQData).filter(c => c.repetitions >= 4).length;
  const inQueue = Object.keys(srQData).length;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {[
        { label: "Câu sai dã thêm", value: totalWrong, color: "#f87171", icon: "ri-error-warning-line" },
        { label: "Trong hàng d?i SR", value: inQueue, color: "#fb923c", icon: "ri-time-line" },
        { label: "C?n ôn hôm nay", value: dueToday, color: dueToday > 0 ? "#f87171" : "#34d399", icon: "ri-calendar-check-line" },
        { label: "Ðã n?m v?ng", value: mastered, color: "#a78bfa", icon: "ri-brain-line" },
      ].map(s => (
        <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
            <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-none">{s.value}</p>
            <p className="text-app-text-secondary text-xs mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Review Card (Vocab) --------------------------------------------------
function ReviewCard({ item, srCard, onRate, sessionIdx, sessionTotal }: {
  item: EpsVocabItem; srCard: SRCard; onRate: (q: 0 | 1 | 2 | 3 | 4 | 5) => void; sessionIdx: number; sessionTotal: number;
}) {
  const [revealed, setRevealed] = useState(false);
  const { playKorean } = useAudioCache();
  const topic = EPS_VOCAB_TOPICS.find(t => t.id === item.topicId);

  useEffect(() => { setRevealed(false); }, [item.id]);
  useEffect(() => { if (revealed) playKorean(item.korean); }, [revealed]);

  const nextReviewText = () => {
    const days = srCard.interval;
    if (days === 0) return "Hôm nay";
    if (days === 1) return "Ngày mai";
    if (days < 7) return `${days} ngày n?a`;
    if (days < 30) return `${Math.round(days / 7)} tu?n n?a`;
    return `${Math.round(days / 30)} tháng n?a`;
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-2 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full bg-app-accent-primary rounded-full transition-all duration-500" style={{ width: `${(sessionIdx / sessionTotal) * 100}%` }} />
        </div>
        <span className="text-app-text-muted text-xs whitespace-nowrap">{sessionIdx}/{sessionTotal}</span>
      </div>
      <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden mb-4">
        <div className="p-8 text-center border-b border-app-border">
          <div className="flex items-center justify-center gap-2 mb-4">
            {topic && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${topic.color}15`, color: topic.color }}>{topic.label}</span>}
            {srCard.repetitions > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-card/50 text-app-text-muted">L?n {srCard.totalReviews + 1} · {nextReviewText()}</span>}
          </div>
          <p className="text-5xl font-bold text-white mb-3">{item.korean}</p>
          <p className="text-app-text-muted text-sm font-mono">[{item.reading}]</p>
          <button onClick={() => playKorean(item.korean)} className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary hover:text-white/70 text-sm transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-volume-up-line"></i>Nghe phát âm
          </button>
        </div>
        {!revealed ? (
          <div className="p-6 text-center">
            <button onClick={() => setRevealed(true)} className="px-8 py-3 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm rounded-xl transition-colors cursor-pointer whitespace-nowrap">Xem nghia</button>
            <p className="text-app-text-muted text-xs mt-3">Th? nh? nghia tru?c khi xem dáp án</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="text-center mb-5">
              <p className="text-app-accent-primary text-2xl font-bold mb-2">{item.vietnamese}</p>
              {item.example && (
                <div className="bg-app-surface/50 rounded-xl p-3 mt-3 text-left">
                  <p className="text-white/50 text-xs">{item.example}</p>
                  <p className="text-app-text-muted text-[10px] italic mt-1">{item.exampleVi}</p>
                </div>
              )}
            </div>
            <p className="text-app-text-muted text-xs text-center mb-3">B?n nh? t? này ? m?c nào?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {QUALITY_LABELS.map(({ q, label, bg, icon }) => (
                <button key={q} onClick={() => onRate(q)} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${bg}`}>
                  <i className={`${icon} text-lg`}></i><span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {srCard.repetitions > 0 && (
        <div className="flex items-center justify-center gap-4 text-[10px] text-app-text-muted">
          <span><i className="ri-repeat-line mr-1"></i>{srCard.repetitions} l?n ôn</span>
          <span><i className="ri-fire-line mr-1"></i>{srCard.correctStreak} streak</span>
          <span><i className="ri-settings-3-line mr-1"></i>EF: {srCard.easeFactor.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

// --- Wrong Question Review Card -------------------------------------------
function WrongQuestionCard({ question, srCard, onRate, sessionIdx, sessionTotal }: {
  question: EpsQuestion; srCard: SRQuestionCard; onRate: (q: 0 | 1 | 2 | 3 | 4 | 5) => void; sessionIdx: number; sessionTotal: number;
}) {
  const [revealed, setRevealed] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const topic = EPS_TOPICS.find(t => t.id === question.topic);

  useEffect(() => { setRevealed(false); setSelectedIdx(null); }, [question.id]);

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelectedIdx(idx);
    setRevealed(true);
  };

  const isCorrect = selectedIdx === question.correctIndex;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-2 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full bg-[#f87171] rounded-full transition-all duration-500" style={{ width: `${(sessionIdx / sessionTotal) * 100}%` }} />
        </div>
        <span className="text-app-text-muted text-xs whitespace-nowrap">{sessionIdx}/{sessionTotal}</span>
      </div>

      <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden mb-4">
        {/* Header */}
        <div className="p-5 border-b border-app-border">
          <div className="flex items-center gap-2 mb-3">
            {topic && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${topic.color}15`, color: topic.color }}>{topic.label}</span>}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-bold">
              <i className="ri-error-warning-line mr-1"></i>Ðã sai {srCard.wrongCount} l?n
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-card/50 text-app-text-muted">Ôn l?n {srCard.totalReviews + 1}</span>
          </div>
          <p className="text-white font-semibold text-base leading-relaxed mb-1">{question.question}</p>
          <p className="text-app-text-secondary text-sm italic">{question.questionVi}</p>
        </div>

        {/* Options */}
        <div className="p-5 space-y-2.5">
          {question.options.map((opt, idx) => {
            let cls = "border-app-border bg-app-surface/50 text-white/70 hover:bg-white/8";
            if (revealed) {
              if (idx === question.correctIndex) cls = "border-emerald-500/40 bg-emerald-500/10 text-app-accent-success";
              else if (idx === selectedIdx) cls = "border-red-500/40 bg-red-500/10 text-red-400";
              else cls = "border-app-border bg-white/2 text-app-text-muted";
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={revealed}
                className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${cls}`}
              >
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/8 text-xs font-bold flex-shrink-0 mt-0.5">
                  {String.fromCharCode(65 + idx)}
                </span>
                <div>
                  <p className="text-sm font-medium">{opt}</p>
                  <p className="text-xs opacity-60 mt-0.5">{question.optionsVi[idx]}</p>
                </div>
                {revealed && idx === question.correctIndex && <i className="ri-checkbox-circle-fill text-app-accent-success ml-auto flex-shrink-0 mt-0.5"></i>}
                {revealed && idx === selectedIdx && idx !== question.correctIndex && <i className="ri-close-circle-fill text-red-400 ml-auto flex-shrink-0 mt-0.5"></i>}
              </button>
            );
          })}
        </div>

        {/* Explanation + Rating */}
        {revealed && (
          <div className="px-5 pb-5 border-t border-app-border pt-4">
            <div className={`rounded-xl p-4 mb-4 ${isCorrect ? "bg-emerald-500/8 border border-emerald-500/15" : "bg-red-500/8 border border-red-500/15"}`}>
              <div className="flex items-center gap-2 mb-2">
                <i className={`${isCorrect ? "ri-checkbox-circle-fill text-app-accent-success" : "ri-close-circle-fill text-red-400"} text-base`}></i>
                <span className={`text-sm font-bold ${isCorrect ? "text-app-accent-success" : "text-red-400"}`}>{isCorrect ? "Chính xác!" : "Chua dúng"}</span>
              </div>
              <p className="text-white/55 text-xs leading-relaxed">{question.explanation}</p>
            </div>
            <p className="text-app-text-muted text-xs text-center mb-3">B?n nh? câu này ? m?c nào?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {QUALITY_LABELS.map(({ q, label, bg, icon }) => (
                <button key={q} onClick={() => onRate(q)} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${bg}`}>
                  <i className={`${icon} text-lg`}></i><span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Session Complete -----------------------------------------------------
function SessionComplete({ results, onRestart, onClose }: {
  results: { correct: number; total: number; newCards: number }; onRestart: () => void; onClose: () => void;
}) {
  const pct = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;
  return (
    <div className="max-w-md mx-auto text-center py-8">
      <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-app-accent-primary/10 mx-auto mb-5">
        <i className="ri-trophy-line text-app-accent-primary text-4xl"></i>
      </div>
      <h2 className="text-white font-bold text-2xl mb-2">Phiên ôn t?p hoàn thành!</h2>
      <p className="text-app-text-secondary text-sm mb-6">Tuy?t v?i! B?n dã ôn xong {results.total} th? hôm nay.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-app-bg border border-app-border rounded-xl p-4">
          <p className="text-app-accent-success font-bold text-2xl">{results.correct}</p>
          <p className="text-app-text-secondary text-xs mt-1">Nh? du?c</p>
        </div>
        <div className="bg-app-bg border border-app-border rounded-xl p-4">
          <p className="text-app-accent-primary font-bold text-2xl">{pct}%</p>
          <p className="text-app-text-secondary text-xs mt-1">T? l? dúng</p>
        </div>
        <div className="bg-app-bg border border-app-border rounded-xl p-4">
          <p className="text-[#a78bfa] font-bold text-2xl">{results.newCards}</p>
          <p className="text-app-text-secondary text-xs mt-1">Th? m?i</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onRestart} className="flex-1 py-3 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm rounded-xl transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-refresh-line mr-2"></i>Ôn ti?p
        </button>
        <button onClick={onClose} className="flex-1 py-3 bg-app-card/50 hover:bg-app-card/70 border border-app-border text-white/60 text-sm rounded-xl transition-colors cursor-pointer whitespace-nowrap">Xong</button>
      </div>
    </div>
  );
}

// --- Wrong Questions Tab --------------------------------------------------
function WrongQuestionsTab() {
  const [epsAnswers] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [srQData, setSrQData] = useLocalStorage<Record<string, SRQuestionCard>>("kts_eps_wrong_sr", {});
  const [sessionCards, setSessionCards] = useState<EpsQuestion[]>([]);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [sessionResults, setSessionResults] = useState<{ correct: number; total: number; newCards: number } | null>(null);
  const [mode, setMode] = useState<"setup" | "review" | "complete">("setup");
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [maxCards, setMaxCards] = useState(20);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [importDone, setImportDone] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Find all wrong questions from kts_eps_answers
  const wrongQuestions = useMemo(() => {
    const wrongIds = Object.entries(epsAnswers)
      .filter(([, ans]) => ans !== undefined)
      .map(([id]) => id);
    // Cross-reference with epsQuestions to find ones answered wrong
    return epsQuestions.filter(q => {
      const userAns = epsAnswers[q.id];
      return userAns !== undefined && userAns !== q.correctIndex;
    });
  }, [epsAnswers]);

  // Auto-import wrong questions into SR queue
  const importWrongToSR = useCallback(() => {
    const newEntries: Record<string, SRQuestionCard> = {};
    wrongQuestions.forEach(q => {
      if (!srQData[q.id]) {
        newEntries[q.id] = {
          id: q.id,
          type: "question",
          repetitions: 0,
          easeFactor: 2.5,
          interval: 0,
          nextReview: today,
          totalReviews: 0,
          correctStreak: 0,
          wrongCount: 1,
          addedAt: today,
        };
      }
    });
    if (Object.keys(newEntries).length > 0) {
      setSrQData(prev => ({ ...prev, ...newEntries }));
    }
    setImportDone(true);
  }, [wrongQuestions, srQData, setSrQData, today]);

  // Due cards
  const dueCards = useMemo(() => {
    const filtered = selectedTopic === "all"
      ? epsQuestions.filter(q => srQData[q.id])
      : epsQuestions.filter(q => srQData[q.id] && q.topic === selectedTopic);
    return filtered.filter(q => {
      const sr = srQData[q.id];
      return sr && sr.nextReview <= today;
    });
  }, [srQData, selectedTopic, today]);

  const newCards = useMemo(() => {
    return epsQuestions.filter(q => srQData[q.id] && srQData[q.id].repetitions === 0 && srQData[q.id].nextReview <= today);
  }, [srQData, today]);

  const startSession = useCallback(() => {
    const due = dueCards.slice(0, maxCards);
    if (due.length === 0) return;
    setSessionCards(due.sort(() => Math.random() - 0.5));
    setSessionIdx(0);
    setSessionCorrect(0);
    setSessionResults(null);
    setMode("review");
  }, [dueCards, maxCards]);

  const handleRate = useCallback((quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    const card = sessionCards[sessionIdx];
    if (!card) return;
    const existing = srQData[card.id] || { id: card.id, type: "question" as const, repetitions: 0, easeFactor: 2.5, interval: 0, nextReview: today, totalReviews: 0, correctStreak: 0, wrongCount: 1, addedAt: today };
    const updated = { ...sm2(existing, quality), type: "question" as const, wrongCount: existing.wrongCount, addedAt: existing.addedAt };
    setSrQData(prev => ({ ...prev, [card.id]: updated as SRQuestionCard }));
    if (quality >= 3) setSessionCorrect(c => c + 1);
    if (sessionIdx + 1 >= sessionCards.length) {
      setSessionResults({ correct: sessionCorrect + (quality >= 3 ? 1 : 0), total: sessionCards.length, newCards: 0 });
      setMode("complete");
    } else {
      setSessionIdx(i => i + 1);
    }
  }, [sessionCards, sessionIdx, srQData, setSrQData, sessionCorrect, today]);

  const resetSession = useCallback(() => {
    setMode("setup");
    setSessionCards([]);
    setSessionIdx(0);
    setSessionResults(null);
  }, []);

  const currentCard = sessionCards[sessionIdx];
  const currentSR = currentCard ? srQData[currentCard.id] : null;

  // Topics that have wrong questions
  const topicsWithWrong = useMemo(() => {
    const topicIds = new Set(Object.keys(srQData).map(id => {
      const q = epsQuestions.find(q => q.id === id);
      return q?.topic;
    }).filter(Boolean));
    return EPS_TOPICS.filter(t => topicIds.has(t.id));
  }, [srQData]);

  if (mode === "review" && currentCard && currentSR) {
    return (
      <WrongQuestionCard
        question={currentCard}
        srCard={currentSR}
        onRate={handleRate}
        sessionIdx={sessionIdx}
        sessionTotal={sessionCards.length}
      />
    );
  }

  if (mode === "complete" && sessionResults) {
    return <SessionComplete results={sessionResults} onRestart={startSession} onClose={resetSession} />;
  }

  return (
    <>
      <WrongQStatsPanel srQData={srQData} totalWrong={wrongQuestions.length} />

      {/* Import banner */}
      {wrongQuestions.length > 0 && (
        <div className="bg-[#f87171]/5 border border-[#f87171]/20 rounded-2xl p-5 mb-5 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#f87171]/10 flex-shrink-0">
            <i className="ri-error-warning-line text-[#f87171] text-2xl"></i>
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm mb-0.5">
              Phát hi?n {wrongQuestions.length} câu EPS b?n dã làm sai
            </p>
            <p className="text-app-text-secondary text-xs">
              H? th?ng t? d?ng dua các câu sai vào hàng d?i Spaced Repetition d? ôn l?i dúng th?i di?m.
            </p>
          </div>
          <button
            onClick={importWrongToSR}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#f87171] hover:bg-[#ef4444] text-white font-bold text-sm rounded-xl cursor-pointer whitespace-nowrap transition-colors flex-shrink-0"
          >
            <i className="ri-add-circle-line"></i>
            {importDone ? "Ðã c?p nh?t!" : "Thêm vào SR"}
          </button>
        </div>
      )}

      {wrongQuestions.length === 0 && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 mb-5 text-center">
          <i className="ri-checkbox-circle-line text-app-accent-success text-3xl mb-2 block"></i>
          <p className="text-app-accent-success font-semibold text-sm mb-1">Chua có câu sai nào!</p>
          <p className="text-app-text-secondary text-xs">Hãy làm bài thi EPS tru?c. Các câu sai s? t? d?ng xu?t hi?n ? dây.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-5">
          {/* Topic filter */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-4">L?c theo ch? d?</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTopic("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedTopic === "all" ? "bg-[#f87171] text-white" : "bg-app-card/50 text-app-text-secondary hover:text-white/60"}`}
              >
                T?t c? ({Object.keys(srQData).length})
              </button>
              {topicsWithWrong.map(topic => {
                const count = Object.keys(srQData).filter(id => {
                  const q = epsQuestions.find(q => q.id === id);
                  return q?.topic === topic.id;
                }).length;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedTopic === topic.id ? "text-white" : "bg-app-card/50 text-app-text-secondary hover:text-white/60"}`}
                    style={selectedTopic === topic.id ? { backgroundColor: topic.color } : {}}
                  >
                    <i className={`${topic.icon} text-xs`}></i>
                    {topic.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session config */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-4">C?u hình phiên ôn t?p</p>
            <div className="flex items-center gap-4 mb-5">
              <p className="text-white/50 text-sm">S? câu m?i phiên:</p>
              <div className="flex items-center bg-app-card/50 rounded-xl p-1">
                {[10, 20, 30, 50].map(n => (
                  <button key={n} onClick={() => setMaxCards(n)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${maxCards === n ? "bg-[#f87171] text-white" : "text-app-text-secondary hover:text-white/60"}`}>{n}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-app-surface/50 rounded-xl p-3">
                <p className="text-app-text-secondary text-xs mb-1">C?n ôn l?i</p>
                <p className="text-[#f87171] font-bold text-xl">{dueCards.length}</p>
                <p className="text-app-text-muted text-[10px]">câu d?n h?n hôm nay</p>
              </div>
              <div className="bg-app-surface/50 rounded-xl p-3">
                <p className="text-app-text-secondary text-xs mb-1">Trong hàng d?i</p>
                <p className="text-app-accent-primary font-bold text-xl">{Object.keys(srQData).length}</p>
                <p className="text-app-text-muted text-[10px]">câu dã thêm vào SR</p>
              </div>
            </div>
            <button
              onClick={startSession}
              disabled={dueCards.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#f87171] hover:bg-[#ef4444] disabled:opacity-40 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-play-line text-base"></i>
              B?t d?u ôn câu sai ({Math.min(maxCards, dueCards.length)} câu)
            </button>
            {dueCards.length === 0 && Object.keys(srQData).length > 0 && (
              <p className="text-app-accent-success text-xs text-center mt-3">
                <i className="ri-checkbox-circle-line mr-1"></i>
                Tuy?t v?i! Không có câu nào c?n ôn hôm nay.
              </p>
            )}
          </div>
        </div>

        {/* Right: How it works */}
        <div className="space-y-4">
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-4">Cách ho?t d?ng</p>
            <div className="space-y-3">
              {[
                { icon: "ri-error-warning-line", color: "#f87171", text: "Câu EPS làm sai t? d?ng du?c thêm vào hàng d?i SR" },
                { icon: "ri-time-line", color: "#fb923c", text: "SM-2 tính toán th?i di?m ôn l?i t?i uu cho t?ng câu" },
                { icon: "ri-brain-line", color: "app-accent-primary", text: "Câu khó xu?t hi?n l?i s?m hon, câu d? ôn sau nhi?u ngày" },
                { icon: "ri-checkbox-circle-line", color: "#34d399", text: "Sau 4+ l?n ôn dúng, câu du?c dánh d?u n?m v?ng" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                    <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
                  </div>
                  <p className="text-white/45 text-xs leading-relaxed pt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#f87171]/5 border border-[#f87171]/15 rounded-xl p-4">
            <p className="text-[#f87171] text-xs font-semibold mb-2">M?o h?c hi?u qu?</p>
            <div className="space-y-1.5 text-[10px] text-white/35 leading-relaxed">
              <p><i className="ri-arrow-right-s-line text-[#f87171] mr-1"></i>Làm bài thi EPS thu?ng xuyên d? tích luy câu sai</p>
              <p><i className="ri-arrow-right-s-line text-[#f87171] mr-1"></i>Ôn SR m?i ngày 10-15 phút là d?</p>
              <p><i className="ri-arrow-right-s-line text-[#f87171] mr-1"></i>Ð?c k? gi?i thích sau m?i câu d? hi?u sâu</p>
              <p><i className="ri-arrow-right-s-line text-[#f87171] mr-1"></i>Nh?n "Thêm vào SR" sau m?i l?n làm bài m?i</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- Vocab SR Tab ---------------------------------------------------------
function VocabSRTab() {
  const [srData, setSrData] = useLocalStorage<Record<string, SRCard>>("kts_eps_sr_cards", {});
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [sessionCards, setSessionCards] = useState<EpsVocabItem[]>([]);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [sessionResults, setSessionResults] = useState<{ correct: number; total: number; newCards: number } | null>(null);
  const [mode, setMode] = useState<"setup" | "review" | "complete">("setup");
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionNewCards, setSessionNewCards] = useState(0);
  const [maxCards, setMaxCards] = useState(20);

  const today = new Date().toISOString().split("T")[0];

  const filteredVocab = useMemo(() => {
    if (selectedTopic === "all") return epsVocabulary;
    return epsVocabulary.filter(v => v.topicId === selectedTopic);
  }, [selectedTopic]);

  const dueCards = useMemo(() => filteredVocab.filter(v => { const sr = srData[v.id]; return !sr || sr.nextReview <= today; }), [filteredVocab, srData, today]);
  const newCards = useMemo(() => filteredVocab.filter(v => !srData[v.id]), [filteredVocab, srData]);

  const startSession = useCallback(() => {
    const due = dueCards.slice(0, Math.min(maxCards, dueCards.length));
    const remaining = maxCards - due.length;
    const newBatch = newCards.filter(c => !due.some(d => d.id === c.id)).slice(0, remaining);
    const session = [...due, ...newBatch].sort(() => Math.random() - 0.5);
    if (session.length === 0) return;
    setSessionCards(session);
    setSessionIdx(0);
    setSessionCorrect(0);
    setSessionNewCards(newBatch.length);
    setSessionResults(null);
    setMode("review");
  }, [dueCards, newCards, maxCards]);

  const handleRate = useCallback((quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    const card = sessionCards[sessionIdx];
    if (!card) return;
    const existing = srData[card.id] || getDefaultCard(card.id);
    const updated = sm2(existing, quality);
    setSrData(prev => ({ ...prev, [card.id]: updated }));
    if (quality >= 3) setSessionCorrect(c => c + 1);
    if (sessionIdx + 1 >= sessionCards.length) {
      setSessionResults({ correct: sessionCorrect + (quality >= 3 ? 1 : 0), total: sessionCards.length, newCards: sessionNewCards });
      setMode("complete");
    } else {
      setSessionIdx(i => i + 1);
    }
  }, [sessionCards, sessionIdx, srData, setSrData, sessionCorrect, sessionNewCards]);

  const resetSession = useCallback(() => { setMode("setup"); setSessionCards([]); setSessionIdx(0); setSessionResults(null); }, []);

  const intervalBuckets = useMemo(() => {
    const buckets = [
      { label: "M?i", min: 0, max: 0, color: "#f87171" },
      { label: "1 ngày", min: 1, max: 1, color: "#fb923c" },
      { label: "2-6 ngày", min: 2, max: 6, color: "app-accent-primary" },
      { label: "1-2 tu?n", min: 7, max: 14, color: "#34d399" },
      { label: "Thu?c lòng", min: 15, max: 9999, color: "#a78bfa" },
    ];
    return buckets.map(b => ({ ...b, count: Object.values(srData).filter(s => s.interval >= b.min && s.interval <= b.max).length }));
  }, [srData]);

  const currentCard = sessionCards[sessionIdx];
  const currentSR = currentCard ? (srData[currentCard.id] || getDefaultCard(currentCard.id)) : null;

  if (mode === "review" && currentCard && currentSR) {
    return <ReviewCard item={currentCard} srCard={currentSR} onRate={handleRate} sessionIdx={sessionIdx} sessionTotal={sessionCards.length} />;
  }
  if (mode === "complete" && sessionResults) {
    return <SessionComplete results={sessionResults} onRestart={startSession} onClose={resetSession} />;
  }

  return (
    <>
      <StatsPanel cards={filteredVocab} srData={srData} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-5">
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-4">Ch?n ch? d? ôn t?p</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedTopic("all")} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedTopic === "all" ? "bg-app-accent-primary text-app-bg" : "bg-app-card/50 text-app-text-secondary hover:text-white/60"}`}>
                T?t c? ({epsVocabulary.length})
              </button>
              {EPS_VOCAB_TOPICS.map(topic => {
                const count = epsVocabulary.filter(v => v.topicId === topic.id).length;
                const dueCount = dueCards.filter(v => v.topicId === topic.id).length;
                return (
                  <button key={topic.id} onClick={() => setSelectedTopic(topic.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedTopic === topic.id ? "text-app-bg" : "bg-app-card/50 text-app-text-secondary hover:text-white/60"}`} style={selectedTopic === topic.id ? { backgroundColor: topic.color } : {}}>
                    <i className={`${topic.icon} text-xs`}></i>{topic.label} ({count})
                    {dueCount > 0 && <span className="text-[9px] px-1 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">{dueCount}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-4">C?u hình phiên ôn t?p</p>
            <div className="flex items-center gap-4 mb-5">
              <p className="text-white/50 text-sm">S? t? m?i phiên:</p>
              <div className="flex items-center bg-app-card/50 rounded-xl p-1">
                {[10, 20, 30, 50].map(n => (
                  <button key={n} onClick={() => setMaxCards(n)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${maxCards === n ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}>{n}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-app-surface/50 rounded-xl p-3">
                <p className="text-app-text-secondary text-xs mb-1">C?n ôn l?i</p>
                <p className="text-[#f87171] font-bold text-xl">{dueCards.length}</p>
                <p className="text-app-text-muted text-[10px]">t? d?n h?n hôm nay</p>
              </div>
              <div className="bg-app-surface/50 rounded-xl p-3">
                <p className="text-app-text-secondary text-xs mb-1">T? m?i</p>
                <p className="text-app-accent-primary font-bold text-xl">{newCards.length}</p>
                <p className="text-app-text-muted text-[10px]">chua h?c l?n nào</p>
              </div>
            </div>
            <button onClick={startSession} disabled={dueCards.length === 0 && newCards.length === 0} className="w-full flex items-center justify-center gap-2 py-3.5 bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 text-app-bg font-bold text-sm rounded-xl transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-play-line text-base"></i>B?t d?u ôn t?p ({Math.min(maxCards, dueCards.length + newCards.length)} t?)
            </button>
            {dueCards.length === 0 && newCards.length === 0 && (
              <p className="text-app-accent-success text-xs text-center mt-3"><i className="ri-checkbox-circle-line mr-1"></i>Tuy?t v?i! B?n dã ôn h?t t? v?ng hôm nay.</p>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-4">Phân b? kho?ng ôn t?p</p>
            <div className="space-y-3">
              {intervalBuckets.map(b => {
                const total = Object.keys(srData).length;
                const pct = total > 0 ? Math.round((b.count / Math.max(total, 1)) * 100) : 0;
                return (
                  <div key={b.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }}></div><span className="text-white/50 text-xs">{b.label}</span></div>
                      <span className="text-app-text-muted text-xs">{b.count} t?</span>
                    </div>
                    <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: b.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4">
            <p className="text-app-accent-primary text-xs font-semibold mb-2">Thu?t toán SM-2 ho?t d?ng th? nào?</p>
            <div className="space-y-2 text-[10px] text-white/35 leading-relaxed">
              <p><i className="ri-check-line text-app-accent-success mr-1"></i>T? b?n nh? t?t ? ôn l?i sau nhi?u ngày hon</p>
              <p><i className="ri-close-line text-red-400 mr-1"></i>T? b?n quên ? ôn l?i ngay ngày mai</p>
              <p><i className="ri-time-line text-app-accent-primary mr-1"></i>Kho?ng cách tang d?n: 1 ? 6 ? 15 ? 30 ngày...</p>
              <p><i className="ri-brain-line text-[#a78bfa] mr-1"></i>T?i uu hóa b? nh? dài h?n theo khoa h?c</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- Main Page ------------------------------------------------------------
export default function EpsSpacedReviewPage() {
  const [activeTab, setActiveTab] = useState<"vocab" | "wrong">("vocab");

  const tabs = [
    { id: "vocab" as const, label: "T? v?ng EPS", icon: "ri-translate-2", color: "app-accent-primary" },
    { id: "wrong" as const, label: "Câu h?i sai", icon: "ri-error-warning-line", color: "#f87171" },
  ];

  return (
    <DashboardLayout
      title="Ôn t?p Spaced Repetition — EPS"
      subtitle="Thu?t toán SM-2 t? d?ng nh?c ôn dúng th?i di?m — h?c ít, nh? lâu"
    >
      {/* Tab switcher */}
      <div className="flex items-center bg-app-card/50 rounded-xl p-1 mb-6 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? "text-app-bg" : "text-app-text-secondary hover:text-white/70"}`}
            style={activeTab === tab.id ? { backgroundColor: tab.color } : {}}
          >
            <i className={`${tab.icon} text-base`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "vocab" ? <VocabSRTab /> : <WrongQuestionsTab />}
    </DashboardLayout>
  );
}



