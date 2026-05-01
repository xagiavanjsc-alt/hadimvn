import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VocabCard {
  id: string;
  korean: string;
  hanja: string;
  vietnamese: string;
  pronunciation: string;
  examples: { korean: string; vietnamese: string }[];
  category: string;
  difficulty: number;
}

interface SRSData {
  [cardId: string]: {
    interval: number;      // days until next review
    easeFactor: number;    // 1.3 - 2.5
    repetitions: number;   // times reviewed
    nextReview: string;    // ISO date
    lastRating: number;    // 0-5
  };
}

// ─── SRS Algorithm (SM-2) ────────────────────────────────────────────────────
function updateSRS(srs: SRSData, cardId: string, rating: number): SRSData {
  const card = srs[cardId] || { interval: 1, easeFactor: 2.5, repetitions: 0, nextReview: new Date().toISOString(), lastRating: 0 };
  let { interval, easeFactor, repetitions } = card;

  if (rating >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    ...srs,
    [cardId]: { interval, easeFactor, repetitions, nextReview: nextReview.toISOString(), lastRating: rating },
  };
}

const LEVEL_MAP: Record<number, { label: string; color: string; bg: string; border: string; koreanLevel: string }> = {
  1: { label: "A1 · Sơ cấp 1", color: "#34d399", bg: "bg-emerald-500/10", border: "border-emerald-500/20", koreanLevel: "A1" },
  2: { label: "A2–B1 · Trung cấp", color: "#e8c84a", bg: "bg-yellow-500/10", border: "border-yellow-500/20", koreanLevel: "A2" },
  3: { label: "B2–C1 · Nâng cao", color: "#f87171", bg: "bg-red-500/10", border: "border-red-500/20", koreanLevel: "C1" },
};

const RATING_LABELS = [
  { value: 1, label: "Không nhớ", color: "#f87171", icon: "ri-close-circle-line" },
  { value: 2, label: "Khó", color: "#fb923c", icon: "ri-emotion-unhappy-line" },
  { value: 3, label: "Nhớ được", color: "#e8c84a", icon: "ri-emotion-normal-line" },
  { value: 4, label: "Dễ", color: "#34d399", icon: "ri-emotion-happy-line" },
  { value: 5, label: "Rất dễ", color: "#a78bfa", icon: "ri-emotion-laugh-line" },
];

// ─── Flashcard Component ──────────────────────────────────────────────────────
function FlashCard({ card, onRate, srsData }: {
  card: VocabCard;
  onRate: (rating: number) => void;
  srsData: SRSData;
}) {
  const [flipped, setFlipped] = useState(false);
  const cfg = LEVEL_MAP[card.difficulty] || LEVEL_MAP[1];
  const cardSRS = srsData[card.id];

  const speak = () => {
    if (window.speechSynthesis) {
      const utt = new SpeechSynthesisUtterance(card.korean);
      utt.lang = "ko-KR";
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div
        className="w-full max-w-lg cursor-pointer select-none"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped(v => !v)}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: "280px" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-[#0f1117] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} border ${cfg.border}`} style={{ color: cfg.color }}>
                {cfg.koreanLevel} · {card.category}
              </span>
            </div>
            <p className="text-white font-black text-5xl mb-2 text-center">{card.korean}</p>
            {card.hanja && card.hanja !== card.korean && (
              <p className="text-white/25 text-sm mb-3">{card.hanja}</p>
            )}
            <p className="text-white/30 text-sm">[{card.pronunciation}]</p>
            <div className="mt-6 flex items-center gap-2 text-white/20 text-xs">
              <i className="ri-hand-coin-line"></i>
              <span>Nhấn để xem nghĩa</span>
            </div>
            {cardSRS && (
              <div className="absolute top-4 right-4 flex items-center gap-1 text-white/20 text-[10px]">
                <i className="ri-repeat-line"></i>
                <span>{cardSRS.repetitions}x · {cardSRS.interval}d</span>
              </div>
            )}
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-[#0f1117] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-white font-bold text-3xl mb-2 text-center">{card.vietnamese}</p>
            <p className="text-white/40 text-sm mb-4">[{card.pronunciation}]</p>
            {card.examples?.[0] && (
              <div className="w-full bg-white/3 rounded-2xl p-4 mb-4">
                <p className="text-white/70 text-sm text-center">{card.examples[0].korean}</p>
                <p className="text-white/35 text-xs text-center mt-1">{card.examples[0].vietnamese}</p>
              </div>
            )}
            <button
              onClick={e => { e.stopPropagation(); speak(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 text-xs cursor-pointer transition-colors"
            >
              <i className="ri-volume-up-line"></i>
              Phát âm
            </button>
          </div>
        </div>
      </div>

      {/* Rating buttons — only show when flipped */}
      {flipped && (
        <div className="mt-6 w-full max-w-lg">
          <p className="text-white/30 text-xs text-center mb-3">Bạn nhớ từ này như thế nào?</p>
          <div className="flex gap-2">
            {RATING_LABELS.map(r => (
              <button
                key={r.value}
                onClick={() => { setFlipped(false); onRate(r.value); }}
                className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border border-white/8 hover:border-white/20 cursor-pointer transition-all hover:scale-105"
                style={{ backgroundColor: `${r.color}10` }}
              >
                <i className={`${r.icon} text-lg`} style={{ color: r.color }}></i>
                <span className="text-[10px] font-medium" style={{ color: r.color }}>{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FlashcardLevelPage() {
  const [allCards, setAllCards] = useState<VocabCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sessionCards, setSessionCards] = useState<VocabCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, hard: 0, total: 0 });
  const [srsData, setSrsData] = useLocalStorage<SRSData>("kts_srs_flashcard_level", {});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("hanja_vocab_entries")
        .select("id, korean, hanja, vietnamese, pronunciation, examples, category, difficulty")
        .order("difficulty", { ascending: true });
      if (data) setAllCards(data as VocabCard[]);
      setLoading(false);
    };
    load();
  }, []);

  const categories = ["all", ...Array.from(new Set(allCards.map(c => c.category)))];

  const filteredCards = allCards.filter(c => {
    const matchDiff = selectedDifficulty === "all" || c.difficulty === selectedDifficulty;
    const matchCat = selectedCategory === "all" || c.category === selectedCategory;
    return matchDiff && matchCat;
  });

  // Cards due for review today (SRS)
  const dueCards = filteredCards.filter(c => {
    const srs = srsData[c.id];
    if (!srs) return true; // never reviewed
    return new Date(srs.nextReview) <= new Date();
  });

  const startSession = useCallback((cards: VocabCard[]) => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5).slice(0, Math.min(20, cards.length));
    setSessionCards(shuffled);
    setCurrentIndex(0);
    setSessionDone(false);
    setSessionStats({ correct: 0, hard: 0, total: shuffled.length });
    setSessionStarted(true);
  }, []);

  const handleRate = (rating: number) => {
    const card = sessionCards[currentIndex];
    if (!card) return;

    const newSRS = updateSRS(srsData, card.id, rating);
    setSrsData(newSRS);

    setSessionStats(prev => ({
      ...prev,
      correct: rating >= 3 ? prev.correct + 1 : prev.correct,
      hard: rating < 3 ? prev.hard + 1 : prev.hard,
    }));

    if (currentIndex + 1 >= sessionCards.length) {
      setSessionDone(true);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const currentCard = sessionCards[currentIndex];
  const progress = sessionCards.length > 0 ? ((currentIndex) / sessionCards.length) * 100 : 0;

  const masteredCount = Object.values(srsData).filter(s => s.repetitions >= 3).length;
  const totalReviewed = Object.keys(srsData).length;

  return (
    <DashboardLayout
      title="Flashcard theo cấp độ"
      subtitle="Lật thẻ từ vựng A1→C1 với thuật toán SRS (Spaced Repetition)"
    >
      {!sessionStarted ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Tổng từ vựng", value: allCards.length, icon: "ri-book-open-line", color: "#e8c84a" },
              { label: "Cần ôn hôm nay", value: dueCards.length, icon: "ri-calendar-check-line", color: "#fb923c" },
              { label: "Đã ôn tập", value: totalReviewed, icon: "ri-refresh-line", color: "#34d399" },
              { label: "Đã thuộc (3+ lần)", value: masteredCount, icon: "ri-check-double-line", color: "#a78bfa" },
            ].map(s => (
              <div key={s.label} className="bg-[#0f1117] border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
                  </div>
                  <p className="text-white/40 text-xs">{s.label}</p>
                </div>
                <p className="text-white font-bold text-2xl">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5 mb-5">
            <h3 className="text-white font-semibold text-sm mb-4">Chọn bộ thẻ</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Difficulty */}
              <div>
                <p className="text-white/30 text-xs mb-2">Cấp độ</p>
                <div className="flex flex-wrap gap-2">
                  {([["all", "Tất cả", "#e8c84a"], [1, "A1 · Cơ bản", "#34d399"], [2, "A2-B1 · Trung cấp", "#e8c84a"], [3, "B2-C1 · Nâng cao", "#f87171"]] as const).map(([val, label, color]) => (
                    <button
                      key={String(val)}
                      onClick={() => setSelectedDifficulty(val as number | "all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap border ${
                        selectedDifficulty === val ? "border-white/20 text-white" : "border-white/8 text-white/40 hover:text-white/60"
                      }`}
                      style={selectedDifficulty === val ? { backgroundColor: `${color}15`, borderColor: `${color}30`, color } : {}}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Category */}
              <div>
                <p className="text-white/30 text-xs mb-2">Chủ đề</p>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium cursor-pointer transition-all whitespace-nowrap border ${
                        selectedCategory === cat ? "bg-[#e8c84a]/15 border-[#e8c84a]/30 text-[#e8c84a]" : "border-white/8 text-white/35 hover:text-white/55"
                      }`}
                    >
                      {cat === "all" ? "Tất cả" : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <p className="text-white/40 text-sm">
                <span className="text-white font-bold">{filteredCards.length}</span> từ · <span className="text-[#fb923c] font-bold">{dueCards.length}</span> cần ôn hôm nay
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => startSession(dueCards.length > 0 ? dueCards : filteredCards)}
                  disabled={filteredCards.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#fb923c]/15 border border-[#fb923c]/25 text-[#fb923c] text-sm font-semibold cursor-pointer hover:bg-[#fb923c]/25 transition-colors disabled:opacity-40 whitespace-nowrap"
                >
                  <i className="ri-calendar-check-line"></i>
                  Ôn hôm nay ({dueCards.length})
                </button>
                <button
                  onClick={() => startSession(filteredCards)}
                  disabled={filteredCards.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e8c84a]/15 border border-[#e8c84a]/25 text-[#e8c84a] text-sm font-semibold cursor-pointer hover:bg-[#e8c84a]/25 transition-colors disabled:opacity-40 whitespace-nowrap"
                >
                  <i className="ri-play-fill"></i>
                  Học tất cả
                </button>
              </div>
            </div>
          </div>

          {/* Level breakdown */}
          <div className="grid grid-cols-3 gap-4">
            {([1, 2, 3] as const).map(diff => {
              const cfg = LEVEL_MAP[diff];
              const cards = allCards.filter(c => c.difficulty === diff);
              const due = cards.filter(c => {
                const srs = srsData[c.id];
                return !srs || new Date(srs.nextReview) <= new Date();
              });
              const mastered = cards.filter(c => (srsData[c.id]?.repetitions || 0) >= 3);
              return (
                <div key={diff} className={`bg-[#0f1117] border ${cfg.border} rounded-2xl p-5`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-black" style={{ color: cfg.color }}>{cfg.koreanLevel}</span>
                    <span className="text-white/40 text-xs">{cfg.label.split("·")[1]?.trim()}</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/40">Tổng từ</span>
                      <span className="text-white font-bold">{cards.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Cần ôn hôm nay</span>
                      <span className="font-bold" style={{ color: cfg.color }}>{due.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Đã thuộc</span>
                      <span className="text-emerald-400 font-bold">{mastered.length}</span>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${cards.length > 0 ? (mastered.length / cards.length) * 100 : 0}%`, backgroundColor: cfg.color }}></div>
                  </div>
                  <button
                    onClick={() => { setSelectedDifficulty(diff); startSession(cards); }}
                    className="mt-3 w-full py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                  >
                    Học ngay
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : sessionDone ? (
        /* Session complete */
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#e8c84a]/15 mb-6">
            <i className="ri-trophy-fill text-[#e8c84a] text-4xl"></i>
          </div>
          <h2 className="text-white font-bold text-2xl mb-2">Hoàn thành phiên học!</h2>
          <p className="text-white/40 text-sm mb-8">Bạn đã ôn tập {sessionStats.total} từ vựng</p>
          <div className="grid grid-cols-3 gap-6 mb-8">
            {[
              { label: "Nhớ được", value: sessionStats.correct, color: "#34d399", icon: "ri-check-line" },
              { label: "Cần ôn thêm", value: sessionStats.hard, color: "#f87171", icon: "ri-close-line" },
              { label: "Tổng từ", value: sessionStats.total, color: "#e8c84a", icon: "ri-stack-line" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl mx-auto mb-2" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-2xl`} style={{ color: s.color }}></i>
                </div>
                <p className="text-white font-bold text-2xl">{s.value}</p>
                <p className="text-white/40 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setSessionStarted(false); setSessionDone(false); }}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-semibold cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              Về trang chọn
            </button>
            <button
              onClick={() => startSession(sessionCards)}
              className="px-6 py-3 rounded-xl bg-[#e8c84a]/15 border border-[#e8c84a]/25 text-[#e8c84a] text-sm font-semibold cursor-pointer hover:bg-[#e8c84a]/25 transition-colors whitespace-nowrap"
            >
              Học lại
            </button>
          </div>
        </div>
      ) : (
        /* Active session */
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSessionStarted(false)}
              className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm cursor-pointer transition-colors"
            >
              <i className="ri-arrow-left-line"></i>
              Thoát
            </button>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-[#e8c84a] rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            <span className="text-white/40 text-sm whitespace-nowrap">{currentIndex + 1} / {sessionCards.length}</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#e8c84a]/30 border-t-[#e8c84a] rounded-full animate-spin"></div>
            </div>
          ) : currentCard ? (
            <FlashCard card={currentCard} onRate={handleRate} srsData={srsData} />
          ) : null}

          {/* SRS info */}
          <div className="mt-6 flex items-center justify-center gap-4 text-white/20 text-xs">
            {RATING_LABELS.map(r => (
              <span key={r.value} className="flex items-center gap-1">
                <i className={r.icon} style={{ color: r.color }}></i>
                {r.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
