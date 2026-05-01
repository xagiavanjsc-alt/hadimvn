import { useState, useMemo, useCallback, useRef } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { useStudySync } from "@/hooks/useStudySync";
import { useXPSystem } from "@/hooks/useXPSystem";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";

interface FlashcardItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  example?: string;
  lessonTitle: string;
  artist: string;
  mastered: boolean;
  reviewCount: number;
}

interface StudySession {
  cardId: string;
  result: "know" | "dontknow";
  date: string;
}

// ─── Flip Card ────────────────────────────────────────────────────────────
function FlipCard({ card, onKnow, onDontKnow }: {
  card: FlashcardItem;
  onKnow: () => void;
  onDontKnow: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeHint, setSwipeHint] = useState<"left" | "right" | null>(null);

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
      if (!flipped) {
        // Flip first if not flipped
        setFlipped(true);
        return;
      }
      if (dx > 0) {
        onKnow();
        setFlipped(false);
      } else {
        onDontKnow();
        setFlipped(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Swipe hint overlay */}
      {swipeHint && (
        <div className={`fixed inset-0 pointer-events-none z-10 flex items-center justify-center transition-opacity ${swipeHint ? "opacity-100" : "opacity-0"}`}>
          <div className={`px-6 py-3 rounded-2xl text-white font-bold text-lg ${swipeHint === "right" ? "bg-emerald-500/80" : "bg-red-500/80"}`}>
            {swipeHint === "right" ? (
              <><i className="ri-check-line mr-2"></i>Đã thuộc</>
            ) : (
              <><i className="ri-close-line mr-2"></i>Chưa thuộc</>
            )}
          </div>
        </div>
      )}

      {/* Mobile swipe hint */}
      <div className="flex items-center gap-4 text-xs text-white/20 md:hidden">
        <span><i className="ri-arrow-left-line mr-1"></i>Vuốt trái = Chưa thuộc</span>
        <span>Vuốt phải = Đã thuộc<i className="ri-arrow-right-line ml-1"></i></span>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-lg cursor-pointer select-none"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped(f => !f)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            height: "260px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border border-white/10 flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: "hidden", backgroundColor: "#0f1117" }}
          >
            <div className="w-10 h-10 flex items-center justify-center bg-[#e8c84a]/10 rounded-xl mb-5">
              <i className="ri-translate-2 text-[#e8c84a] text-lg"></i>
            </div>
            <p className="text-4xl font-bold text-white mb-3">{card.word}</p>
            <p className="text-white/30 text-sm">{card.reading}</p>
            <div className="mt-6 flex items-center gap-1.5 text-white/20 text-xs">
              <i className="ri-hand-coin-line text-xs"></i>
              Nhấn để lật thẻ
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl border border-[#e8c84a]/20 flex flex-col items-center justify-center p-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              backgroundColor: "#0f1117",
            }}
          >
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">Nghĩa</p>
            <p className="text-2xl font-bold text-[#e8c84a] mb-4">{card.meaning}</p>
            {card.example && (
              <div className="bg-white/3 border border-white/5 rounded-xl px-4 py-3 max-w-sm">
                <p className="text-white/50 text-sm leading-relaxed italic">{card.example}</p>
              </div>
            )}
            <div className="mt-4 flex items-center gap-1.5 text-white/20 text-xs">
              <i className="ri-music-2-line text-xs"></i>
              {card.lessonTitle} — {card.artist}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {flipped && (
        <div className="flex gap-4 w-full max-w-lg">
          <button
            onClick={(e) => { e.stopPropagation(); onDontKnow(); setFlipped(false); }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-close-line text-lg"></i>
            Chưa thuộc
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onKnow(); setFlipped(false); }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-check-line text-lg"></i>
            Đã thuộc
          </button>
        </div>
      )}

      {!flipped && (
        <div className="flex gap-4 w-full max-w-lg">
          <button
            onClick={onDontKnow}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 text-white/30 font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-line"></i>
            Bỏ qua
          </button>
          <button
            onClick={() => setFlipped(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            Lật thẻ
            <i className="ri-refresh-line"></i>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Session Complete ─────────────────────────────────────────────────────
function SessionComplete({ known, total, onRestart, onReview }: {
  known: number; total: number; onRestart: () => void; onReview: () => void;
}) {
  const pct = total > 0 ? Math.round((known / total) * 100) : 0;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
      <div className="w-20 h-20 flex items-center justify-center rounded-2xl mb-6" style={{ backgroundColor: pct >= 70 ? "#34d39920" : "#fb923c20" }}>
        <i className={`text-4xl ${pct >= 70 ? "ri-trophy-line text-emerald-400" : "ri-refresh-line text-orange-400"}`}></i>
      </div>
      <h2 className="text-white font-bold text-2xl mb-2">
        {pct >= 70 ? "Xuất sắc!" : pct >= 40 ? "Khá tốt!" : "Cần ôn thêm!"}
      </h2>
      <p className="text-white/40 text-sm mb-6">
        Bạn đã thuộc <span className="text-[#e8c84a] font-bold">{known}/{total}</span> từ ({pct}%)
      </p>
      <div className="w-full bg-white/5 rounded-full h-2 mb-8">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? "#34d399" : "#fb923c" }}
        />
      </div>
      <div className="flex gap-3 w-full">
        {known < total && (
          <button
            onClick={onReview}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap"
          >
            Ôn lại chưa thuộc
          </button>
        )}
        <button
          onClick={onRestart}
          className="flex-1 py-3 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
        >
          Học lại từ đầu
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function FlashcardPage() {
  const { user, profile } = useAuth();
  const { syncToCloud, updateLeaderboard } = useStudySync();
  const { awardXP } = useXPSystem();
  const [approvedLessons] = useLocalStorage<ApprovedLesson[]>("kts_melon_lessons", []);
  const [masteredIds, setMasteredIds] = useLocalStorage<string[]>("kts_flashcard_mastered", []);
  const [sessions, setSessions] = useLocalStorage<StudySession[]>("kts_flashcard_sessions", []);
  const [cloudSynced, setCloudSynced] = useState(false);

  const [mode, setMode] = useState<"browse" | "study" | "done">("browse");
  const [filterLesson, setFilterLesson] = useState<"all" | "unmastered">("unmastered");
  const [selectedLessonRank, setSelectedLessonRank] = useState<number | "all">("all");
  const [studyQueue, setStudyQueue] = useState<FlashcardItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionKnown, setSessionKnown] = useState<string[]>([]);
  const [sessionDontKnow, setSessionDontKnow] = useState<string[]>([]);

  // Build all flashcards from approved lessons
  const allCards = useMemo<FlashcardItem[]>(() => {
    const cards: FlashcardItem[] = [];
    approvedLessons.forEach(lesson => {
      (lesson.vocab ?? []).forEach((v, i) => {
        const id = `${lesson.song.rank}-vocab-${i}`;
        cards.push({
          id,
          word: v.word,
          reading: v.reading ?? "",
          meaning: v.meaning,
          example: v.example,
          lessonTitle: lesson.song.title,
          artist: lesson.song.artist,
          mastered: masteredIds.includes(id),
          reviewCount: sessions.filter(s => s.cardId === id).length,
        });
      });
    });
    return cards;
  }, [approvedLessons, masteredIds, sessions]);

  const filteredCards = useMemo(() => {
    let cards = allCards;
    if (selectedLessonRank !== "all") {
      const lesson = approvedLessons.find(l => l.song.rank === selectedLessonRank);
      if (lesson) {
        cards = cards.filter(c => c.lessonTitle === lesson.song.title);
      }
    }
    if (filterLesson === "unmastered") {
      cards = cards.filter(c => !c.mastered);
    }
    return cards;
  }, [allCards, selectedLessonRank, filterLesson, approvedLessons]);

  const masteredCount = allCards.filter(c => c.mastered).length;

  const startStudy = useCallback(() => {
    const queue = [...filteredCards].sort(() => Math.random() - 0.5);
    setStudyQueue(queue);
    setCurrentIdx(0);
    setSessionKnown([]);
    setSessionDontKnow([]);
    setMode("study");
  }, [filteredCards]);

  const triggerCloudSync = useCallback(() => {
    if (!user) return;
    const displayName = profile?.display_name || user.email?.split("@")[0] || "Học viên";
    setCloudSynced(false);
    Promise.all([
      syncToCloud(user.id),
      updateLeaderboard(user.id, displayName),
    ]).then(() => setCloudSynced(true));
  }, [user, profile, syncToCloud, updateLeaderboard]);

  const handleKnow = useCallback(() => {
    const card = studyQueue[currentIdx];
    if (!card) return;
    setSessionKnown(prev => [...prev, card.id]);
    setMasteredIds(prev => prev.includes(card.id) ? prev : [...prev, card.id]);
    setSessions(prev => [...prev, { cardId: card.id, result: "know", date: new Date().toISOString() }]);
    awardXP({ type: "flashcard_learned", amount: 5 });
    if (currentIdx + 1 >= studyQueue.length) {
      setMode("done");
      triggerCloudSync();
    } else {
      setCurrentIdx(i => i + 1);
    }
  }, [studyQueue, currentIdx, setMasteredIds, setSessions, triggerCloudSync]);

  const handleDontKnow = useCallback(() => {
    const card = studyQueue[currentIdx];
    if (!card) return;
    setSessionDontKnow(prev => [...prev, card.id]);
    setSessions(prev => [...prev, { cardId: card.id, result: "dontknow", date: new Date().toISOString() }]);
    if (currentIdx + 1 >= studyQueue.length) {
      setMode("done");
      triggerCloudSync();
    } else {
      setCurrentIdx(i => i + 1);
    }
  }, [studyQueue, currentIdx, setSessions, triggerCloudSync]);

  const handleReviewDontKnow = useCallback(() => {
    const queue = studyQueue.filter(c => sessionDontKnow.includes(c.id));
    setStudyQueue(queue);
    setCurrentIdx(0);
    setSessionKnown([]);
    setSessionDontKnow([]);
    setMode("study");
  }, [studyQueue, sessionDontKnow]);

  const handleUnmaster = (id: string) => {
    setMasteredIds(prev => prev.filter(x => x !== id));
  };

  const currentCard = studyQueue[currentIdx];
  const progress = studyQueue.length > 0 ? ((currentIdx) / studyQueue.length) * 100 : 0;

  return (
    <DashboardLayout
      title="Flashcard"
      subtitle="Học từ vựng từ truyện chêm — lật thẻ, đánh dấu đã thuộc"
      actions={
        mode === "browse" ? (
          <button
            onClick={startStudy}
            disabled={filteredCards.length === 0}
            className="flex items-center gap-2 bg-[#e8c84a] hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-[#0f1117] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-play-line"></i>
            Bắt đầu học ({filteredCards.length} thẻ)
          </button>
        ) : mode === "study" ? (
          <button
            onClick={() => setMode("browse")}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-stop-line"></i>
            Dừng học
          </button>
        ) : null
      }
    >
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng từ vựng", value: allCards.length, icon: "ri-translate-2", color: "#e8c84a" },
          { label: "Đã thuộc", value: masteredCount, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Chưa thuộc", value: allCards.length - masteredCount, icon: "ri-time-line", color: "#fb923c" },
          { label: "Lần ôn tập", value: sessions.length, icon: "ri-refresh-line", color: "#a78bfa" },
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

      {/* Progress bar overall */}
      {allCards.length > 0 && (
        <div className="bg-[#0f1117] border border-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-xs font-medium">Tiến độ tổng thể</p>
            <p className="text-[#e8c84a] text-xs font-bold">{Math.round((masteredCount / allCards.length) * 100)}%</p>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#e8c84a] transition-all"
              style={{ width: `${(masteredCount / allCards.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Study mode */}
      {mode === "study" && currentCard && (
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-8">
          {/* Progress */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-white/40 text-xs">{currentIdx + 1} / {studyQueue.length}</p>
            <div className="flex-1 mx-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[#e8c84a] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 text-xs font-bold">{sessionKnown.length} thuộc</span>
              <span className="text-red-400 text-xs font-bold">{sessionDontKnow.length} chưa</span>
            </div>
          </div>
          <FlipCard card={currentCard} onKnow={handleKnow} onDontKnow={handleDontKnow} />
        </div>
      )}

      {/* Done mode */}
      {mode === "done" && (
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-8">
          <SessionComplete
            known={sessionKnown.length}
            total={studyQueue.length}
            onRestart={() => { setMode("browse"); setCloudSynced(false); }}
            onReview={handleReviewDontKnow}
          />
          {user && (
            <div className={`mt-4 flex items-center gap-2 justify-center text-xs ${cloudSynced ? "text-emerald-400/70" : "text-[#e8c84a]/50"}`}>
              <i className={`${cloudSynced ? "ri-cloud-line" : "ri-loader-4-line animate-spin"} text-sm`}></i>
              {cloudSynced ? "Tiến độ đã đồng bộ lên cloud & cập nhật bảng xếp hạng!" : "Đang đồng bộ lên cloud..."}
            </div>
          )}
        </div>
      )}

      {/* Browse mode */}
      {mode === "browse" && (
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex bg-white/5 rounded-xl p-1">
              {(["unmastered", "all"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterLesson(f)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    filterLesson === f ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {f === "unmastered" ? "Chưa thuộc" : "Tất cả"}
                </button>
              ))}
            </div>
            <select
              value={selectedLessonRank === "all" ? "all" : String(selectedLessonRank)}
              onChange={e => setSelectedLessonRank(e.target.value === "all" ? "all" : parseInt(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/60 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0f1117]">Tất cả bài học</option>
              {approvedLessons.map(l => (
                <option key={l.song.rank} value={l.song.rank} className="bg-[#0f1117]">
                  {l.song.title}
                </option>
              ))}
            </select>
            <p className="text-white/30 text-xs ml-auto">{filteredCards.length} thẻ</p>
          </div>

          {/* Card grid */}
          {filteredCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 flex items-center justify-center bg-white/5 rounded-2xl mb-4">
                <i className="ri-translate-2 text-white/20 text-3xl"></i>
              </div>
              {allCards.length === 0 ? (
                <>
                  <p className="text-white/40 text-sm font-medium mb-1">Chưa có từ vựng nào</p>
                  <p className="text-white/20 text-xs">Tạo bài học trong K-pop Lesson để có flashcard</p>
                </>
              ) : (
                <>
                  <p className="text-white/40 text-sm font-medium mb-1">Bạn đã thuộc hết rồi!</p>
                  <p className="text-white/20 text-xs mb-4">Chuyển sang "Tất cả" để ôn lại</p>
                  <button onClick={() => setFilterLesson("all")} className="text-[#e8c84a] text-xs font-medium cursor-pointer hover:underline whitespace-nowrap">
                    Xem tất cả từ vựng
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
              {filteredCards.map(card => (
                <div
                  key={card.id}
                  className={`p-4 rounded-xl border transition-all ${
                    card.mastered
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-white/5 bg-white/3 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-bold text-base">{card.word}</p>
                    {card.mastered && (
                      <button
                        onClick={() => handleUnmaster(card.id)}
                        className="w-5 h-5 flex items-center justify-center cursor-pointer"
                        title="Bỏ đánh dấu thuộc"
                      >
                        <i className="ri-checkbox-circle-fill text-emerald-400 text-sm"></i>
                      </button>
                    )}
                  </div>
                  {card.reading && <p className="text-white/30 text-[10px] mb-1">{card.reading}</p>}
                  <p className="text-[#e8c84a] text-xs font-medium mb-2">{card.meaning}</p>
                  <p className="text-white/25 text-[10px] truncate">{card.lessonTitle}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
