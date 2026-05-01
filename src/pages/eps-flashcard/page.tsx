import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsVocabulary, EPS_VOCAB_TOPICS, type EpsVocabItem } from "@/mocks/epsVocabulary";
import { useXPSystem } from "@/hooks/useXPSystem";

// ─── Flip Card ────────────────────────────────────────────────────────────
function EpsFlipCard({
  card,
  onKnow,
  onDontKnow,
  current,
  total,
}: {
  card: EpsVocabItem;
  onKnow: () => void;
  onDontKnow: () => void;
  current: number;
  total: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const topic = EPS_VOCAB_TOPICS.find(t => t.id === card.topic);
  const diffColor = card.difficulty === "easy" ? "#34d399" : card.difficulty === "medium" ? "#e8c84a" : "#f87171";

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeHint, setSwipeHint] = useState<"left" | "right" | null>(null);

  // Reset flip when card changes
  useEffect(() => { setFlipped(false); }, [card.id]);

  // Auto TTS when card flips to back (Vietnamese side)
  useEffect(() => {
    if (flipped) {
      speakKorean();
    }
  }, [flipped]);

  const speakKorean = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(card.korean);
    utter.lang = "ko-KR";
    utter.rate = 0.8;
    window.speechSynthesis.speak(utter);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.touches[0].clientY - (touchStartY.current ?? 0));
    if (Math.abs(dx) > 20 && dy < 60) {
      setSwipeHint(dx > 0 ? "right" : "left");
    } else {
      setSwipeHint(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setSwipeHint(null);
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - (touchStartY.current ?? 0));
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) > 60 && dy < 80) {
      if (!flipped) { setFlipped(true); return; }
      if (dx > 0) { onKnow(); setFlipped(false); }
      else { onDontKnow(); setFlipped(false); }
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto">
      {/* Swipe hint overlay */}
      {swipeHint && (
        <div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className={`px-6 py-3 rounded-2xl text-white font-bold text-lg ${swipeHint === "right" ? "bg-emerald-500/80" : "bg-red-500/80"}`}>
            {swipeHint === "right" ? <><i className="ri-check-line mr-2"></i>Đã thuộc</> : <><i className="ri-close-line mr-2"></i>Chưa thuộc</>}
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="w-full flex items-center gap-3">
        <p className="text-white/30 text-xs whitespace-nowrap">{current}/{total}</p>
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-[#e8c84a] transition-all" style={{ width: `${(current / total) * 100}%` }} />
        </div>
      </div>

      {/* Mobile swipe hint */}
      <div className="flex items-center gap-4 text-xs text-white/20 md:hidden">
        <span><i className="ri-arrow-left-line mr-1"></i>Vuốt trái = Chưa thuộc</span>
        <span>Vuốt phải = Đã thuộc<i className="ri-arrow-right-line ml-1"></i></span>
      </div>

      {/* Card */}
      <div
        className="w-full cursor-pointer select-none"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped(f => !f)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", height: "280px" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border border-white/8 flex flex-col items-center justify-center p-8 text-center bg-[#0f1117]"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Badges */}
            <div className="flex items-center gap-2 mb-5">
              {topic && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${topic.color}15`, color: topic.color }}>
                  <i className={`${topic.icon} mr-1`}></i>{topic.label}
                </span>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${diffColor}15`, color: diffColor }}>
                {card.difficulty === "easy" ? "Dễ" : card.difficulty === "medium" ? "TB" : "Khó"}
              </span>
            </div>
            <p className="text-5xl font-bold text-white mb-3 tracking-wide">{card.korean}</p>
            <p className="text-white/25 text-sm font-mono">[{card.reading}]</p>
            <button
              onClick={e => { e.stopPropagation(); speakKorean(); }}
              className="mt-4 flex items-center gap-1.5 text-[10px] text-white/25 hover:text-white/50 cursor-pointer transition-colors bg-white/5 hover:bg-white/8 px-3 py-1.5 rounded-lg whitespace-nowrap"
            >
              <i className="ri-volume-up-line text-xs"></i>Nghe phát âm
            </button>
            <p className="mt-5 text-white/15 text-xs">Nhấn để xem nghĩa</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl border border-[#e8c84a]/20 flex flex-col items-center justify-center p-8 text-center bg-[#0f1117]"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Nghĩa tiếng Việt</p>
            <p className="text-3xl font-bold text-[#e8c84a] mb-5">{card.vietnamese}</p>
            <div className="bg-white/3 border border-white/5 rounded-xl px-5 py-3 max-w-sm w-full">
              <p className="text-white/60 text-sm leading-relaxed mb-1">{card.example}</p>
              <p className="text-white/30 text-xs italic">{card.exampleVi}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={onDontKnow}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-500/25 bg-red-500/8 hover:bg-red-500/15 text-red-400 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-close-line text-lg"></i>
          Chưa thuộc
        </button>
        <button
          onClick={onKnow}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/8 hover:bg-emerald-500/15 text-emerald-400 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-check-line text-lg"></i>
          Đã thuộc
        </button>
      </div>
    </div>
  );
}

// ─── Session Result ───────────────────────────────────────────────────────
function SessionResult({
  known,
  total,
  onRestart,
  onReviewWrong,
  hasWrong,
}: {
  known: number;
  total: number;
  onRestart: () => void;
  onReviewWrong: () => void;
  hasWrong: boolean;
}) {
  const pct = total > 0 ? Math.round((known / total) * 100) : 0;
  const color = pct >= 80 ? "#34d399" : pct >= 60 ? "#e8c84a" : "#fb923c";
  const label = pct >= 80 ? "Xuất sắc!" : pct >= 60 ? "Khá tốt!" : "Cần ôn thêm!";

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center max-w-sm mx-auto">
      <div className="w-20 h-20 flex items-center justify-center rounded-2xl mb-5" style={{ backgroundColor: `${color}15` }}>
        <i className={`text-4xl ${pct >= 80 ? "ri-trophy-line" : pct >= 60 ? "ri-medal-line" : "ri-refresh-line"}`} style={{ color }}></i>
      </div>
      <h2 className="text-white font-bold text-2xl mb-2">{label}</h2>
      <p className="text-white/40 text-sm mb-5">
        Đã thuộc <span className="font-bold" style={{ color }}>{known}/{total}</span> từ ({pct}%)
      </p>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-8">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="flex gap-3 w-full">
        {hasWrong && (
          <button
            onClick={onReviewWrong}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap"
          >
            Ôn lại chưa thuộc
          </button>
        )}
        <button
          onClick={onRestart}
          className="flex-1 py-3 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
        >
          Học lại
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function EpsFlashcardPage() {
  const [masteredIds, setMasteredIds] = useLocalStorage<string[]>("kts_eps_vocab_mastered", []);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<"all" | "unmastered">("unmastered");
  const [mode, setMode] = useState<"browse" | "study" | "done">("browse");
  const [studyQueue, setStudyQueue] = useState<EpsVocabItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionKnown, setSessionKnown] = useState<string[]>([]);
  const [sessionWrong, setSessionWrong] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { awardXP } = useXPSystem();

  // Filtered cards for browse/study
  const filteredCards = useMemo(() => {
    let cards = epsVocabulary;
    if (selectedTopic !== "all") cards = cards.filter(c => c.topic === selectedTopic);
    if (filterMode === "unmastered") cards = cards.filter(c => !masteredIds.includes(c.id));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      cards = cards.filter(c => c.korean.includes(searchQuery) || c.vietnamese.toLowerCase().includes(q));
    }
    return cards;
  }, [selectedTopic, filterMode, masteredIds, searchQuery]);

  // Stats
  const topicStats = useMemo(() => {
    const stats: Record<string, { total: number; mastered: number }> = {};
    EPS_VOCAB_TOPICS.forEach(t => {
      const qs = epsVocabulary.filter(v => v.topic === t.id);
      stats[t.id] = { total: qs.length, mastered: qs.filter(v => masteredIds.includes(v.id)).length };
    });
    return stats;
  }, [masteredIds]);

  const totalMastered = masteredIds.filter(id => epsVocabulary.some(v => v.id === id)).length;
  const overallPct = epsVocabulary.length > 0 ? Math.round((totalMastered / epsVocabulary.length) * 100) : 0;

  const startStudy = useCallback(() => {
    const queue = [...filteredCards].sort(() => Math.random() - 0.5);
    setStudyQueue(queue);
    setCurrentIdx(0);
    setSessionKnown([]);
    setSessionWrong([]);
    setMode("study");
  }, [filteredCards]);

  const handleKnow = useCallback(() => {
    const card = studyQueue[currentIdx];
    if (!card) return;
    setSessionKnown(prev => [...prev, card.id]);
    setMasteredIds(prev => prev.includes(card.id) ? prev : [...prev, card.id]);
    // Award XP for learning a new word
    if (!masteredIds.includes(card.id)) {
      awardXP({ type: "flashcard_learned" });
    }
    if (currentIdx + 1 >= studyQueue.length) setMode("done");
    else setCurrentIdx(i => i + 1);
  }, [studyQueue, currentIdx, setMasteredIds, masteredIds, awardXP]);

  const handleDontKnow = useCallback(() => {
    const card = studyQueue[currentIdx];
    if (!card) return;
    setSessionWrong(prev => [...prev, card.id]);
    if (currentIdx + 1 >= studyQueue.length) setMode("done");
    else setCurrentIdx(i => i + 1);
  }, [studyQueue, currentIdx]);

  const handleReviewWrong = useCallback(() => {
    const queue = studyQueue.filter(c => sessionWrong.includes(c.id)).sort(() => Math.random() - 0.5);
    setStudyQueue(queue);
    setCurrentIdx(0);
    setSessionKnown([]);
    setSessionWrong([]);
    setMode("study");
  }, [studyQueue, sessionWrong]);

  const currentCard = studyQueue[currentIdx];

  return (
    <DashboardLayout
      title="Flashcard EPS theo Chủ đề"
      subtitle="Học từ vựng EPS có hệ thống — an toàn, pháp luật, giao tiếp"
      actions={
        mode === "browse" ? (
          <button
            onClick={startStudy}
            disabled={filteredCards.length === 0}
            className="flex items-center gap-2 bg-[#e8c84a] hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-[#0f1117] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-play-line"></i>
            Học ngay ({filteredCards.length} thẻ)
          </button>
        ) : mode !== "browse" ? (
          <button
            onClick={() => setMode("browse")}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-line"></i>
            Về danh sách
          </button>
        ) : undefined
      }
    >
      {/* Overall stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Tổng từ vựng", value: epsVocabulary.length, icon: "ri-translate-2", color: "#e8c84a" },
          { label: "Đã thuộc", value: totalMastered, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Chưa thuộc", value: epsVocabulary.length - totalMastered, icon: "ri-time-line", color: "#fb923c" },
          { label: "Tiến độ", value: `${overallPct}%`, icon: "ri-pie-chart-line", color: "#a78bfa" },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0f1117] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
              <i className={`${stat.icon} text-lg`} style={{ color: stat.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{stat.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Study mode */}
      {mode === "study" && currentCard && (
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 text-xs font-bold">{sessionKnown.length} thuộc</span>
              <span className="text-red-400 text-xs font-bold">{sessionWrong.length} chưa</span>
            </div>
          </div>
          <EpsFlipCard
            card={currentCard}
            onKnow={handleKnow}
            onDontKnow={handleDontKnow}
            current={currentIdx + 1}
            total={studyQueue.length}
          />
        </div>
      )}

      {/* Done mode */}
      {mode === "done" && (
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-8">
          <SessionResult
            known={sessionKnown.length}
            total={studyQueue.length}
            onRestart={() => setMode("browse")}
            onReviewWrong={handleReviewWrong}
            hasWrong={sessionWrong.length > 0}
          />
        </div>
      )}

      {/* Browse mode */}
      {mode === "browse" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Left: card list */}
          <div>
            {/* Filters */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex items-center bg-white/5 rounded-xl p-1">
                {(["unmastered", "all"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterMode(f)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${filterMode === f ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/60"}`}
                  >
                    {f === "unmastered" ? "Chưa thuộc" : "Tất cả"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2 flex-1">
                <i className="ri-search-line text-white/30 text-sm"></i>
                <input
                  type="text"
                  placeholder="Tìm từ vựng..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white/70 text-sm outline-none placeholder-white/20"
                />
              </div>
              <p className="text-white/30 text-xs whitespace-nowrap">{filteredCards.length} từ</p>
            </div>

            {/* Card grid */}
            {filteredCards.length === 0 ? (
              <div className="text-center py-16 bg-[#0f1117] border border-white/5 rounded-2xl">
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 mx-auto mb-3">
                  <i className="ri-checkbox-circle-line text-emerald-400 text-2xl"></i>
                </div>
                <p className="text-white/40 text-sm font-medium mb-1">Bạn đã thuộc hết rồi!</p>
                <button onClick={() => setFilterMode("all")} className="text-[#e8c84a] text-xs cursor-pointer hover:underline whitespace-nowrap">Xem tất cả từ vựng</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCards.map(card => {
                  const topic = EPS_VOCAB_TOPICS.find(t => t.id === card.topic);
                  const isMastered = masteredIds.includes(card.id);
                  const diffColor = card.difficulty === "easy" ? "#34d399" : card.difficulty === "medium" ? "#e8c84a" : "#f87171";
                  return (
                    <div
                      key={card.id}
                      className={`p-4 rounded-xl border transition-all ${isMastered ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-[#0f1117] hover:border-white/10"}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white font-bold text-xl leading-tight">{card.korean}</p>
                        {isMastered ? (
                          <button onClick={() => setMasteredIds(prev => prev.filter(id => id !== card.id))} className="cursor-pointer flex-shrink-0">
                            <i className="ri-checkbox-circle-fill text-emerald-400 text-base"></i>
                          </button>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${diffColor}15`, color: diffColor }}>
                            {card.difficulty === "easy" ? "Dễ" : card.difficulty === "medium" ? "TB" : "Khó"}
                          </span>
                        )}
                      </div>
                      <p className="text-white/25 text-[10px] font-mono mb-1.5">[{card.reading}]</p>
                      <p className="text-[#e8c84a] text-sm font-semibold mb-2">{card.vietnamese}</p>
                      <p className="text-white/30 text-xs leading-relaxed line-clamp-2">{card.exampleVi}</p>
                      {topic && (
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <i className={`${topic.icon} text-[10px]`} style={{ color: topic.color }}></i>
                          <span className="text-[10px] font-medium" style={{ color: topic.color }}>{topic.label}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: topic selector */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm mb-3">Chọn chủ đề</h3>
            <button
              onClick={() => setSelectedTopic("all")}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${selectedTopic === "all" ? "border-white/15 bg-white/5" : "border-white/5 hover:border-white/10"}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#e8c84a]/10 flex-shrink-0">
                  <i className="ri-apps-line text-[#e8c84a] text-sm"></i>
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${selectedTopic === "all" ? "text-white" : "text-white/60"}`}>Tất cả chủ đề</p>
                  <p className="text-white/25 text-[10px]">{epsVocabulary.length} từ vựng</p>
                </div>
                <span className="text-[10px] font-bold text-[#e8c84a]">{overallPct}%</span>
              </div>
            </button>

            {EPS_VOCAB_TOPICS.map(topic => {
              const stats = topicStats[topic.id] || { total: 0, mastered: 0 };
              const pct = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
              const isSelected = selectedTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? "border-white/15 bg-white/5" : "border-white/5 hover:border-white/10"}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${topic.color}15` }}>
                      <i className={`${topic.icon} text-sm`} style={{ color: topic.color }}></i>
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${isSelected ? "text-white" : "text-white/60"}`}>{topic.label}</p>
                      <p className="text-white/25 text-[10px]">{stats.total} từ · {stats.mastered} thuộc</p>
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: topic.color }}>{pct}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: topic.color }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
