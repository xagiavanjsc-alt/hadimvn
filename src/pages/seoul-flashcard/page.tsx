import { useState, useCallback, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useXPSystem } from "@/hooks/useXPSystem";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { seoulBooks, SeoulVocabItem } from "@/mocks/seoulTextbook";

// ─── Types ────────────────────────────────────────────────────────────────
interface FlashcardItem extends SeoulVocabItem {
  id: string;
  bookId: string;
  bookName: string;
  bookColor: string;
  lessonId: string;
  lessonTitle: string;
}

type CardStatus = "new" | "learning" | "known";
type ProgressMap = Record<string, CardStatus>;

// ─── Build flashcard pool from seoulBooks ─────────────────────────────────
function buildFlashcards(): FlashcardItem[] {
  const cards: FlashcardItem[] = [];
  seoulBooks.forEach(book => {
    book.lessons.forEach(lesson => {
      lesson.vocabulary.forEach((v, vi) => {
        cards.push({
          ...v,
          id: `${lesson.id}-v${vi}`,
          bookId: book.id,
          bookName: book.name,
          bookColor: book.color,
          lessonId: lesson.id,
          lessonTitle: lesson.titleVi,
        });
      });
    });
  });
  return cards;
}

const ALL_FLASHCARDS = buildFlashcards();

// ─── Flip Card Component ──────────────────────────────────────────────────
function FlipCard({
  card,
  onKnow,
  onLearn,
  showBack,
  onFlip,
}: {
  card: FlashcardItem;
  onKnow: () => void;
  onLearn: () => void;
  showBack: boolean;
  onFlip: () => void;
}) {
  function speakKorean(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-full max-w-lg cursor-pointer select-none"
        style={{ perspective: "1000px" }}
        onClick={onFlip}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: showBack ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "280px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border border-app-border bg-app-bg flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${card.bookColor}15`, color: card.bookColor }}>
                {card.bookName}
              </span>
              <span className="text-[10px] text-app-text-muted">{card.lessonTitle}</span>
            </div>
            <p className="text-5xl font-bold text-white mb-3 text-center">{card.korean}</p>
            <p className="text-app-text-secondary text-sm">[{card.pronunciation}]</p>
            <p className="text-app-text-muted text-xs mt-8">Nhấn để lật thẻ</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl border border-app-border bg-app-bg flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${card.bookColor}15`, color: card.bookColor }}>
                {card.partOfSpeech}
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-2 text-center">{card.vietnamese}</p>
            <p className="text-white/50 text-sm mb-4 text-center">{card.korean} [{card.pronunciation}]</p>
            <div className="w-full bg-app-surface/50 rounded-xl p-3 text-center">
              <p className="text-white/60 text-sm">{card.example}</p>
              <p className="text-app-text-muted text-xs mt-1 italic">{card.exampleVi}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mt-6 w-full max-w-lg">
        <button
          onClick={e => { e.stopPropagation(); speakKorean(card.korean); }}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-app-border text-app-text-secondary hover:text-white/70 hover:bg-app-card/50 transition-all cursor-pointer"
        >
          <i className="ri-volume-up-line"></i>
        </button>

        {showBack ? (
          <>
            <button
              onClick={onLearn}
              className="flex-1 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 font-semibold text-sm hover:bg-red-500/10 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-refresh-line mr-2"></i>Chưa nhớ
            </button>
            <button
              onClick={onKnow}
              className="flex-1 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-app-accent-success font-semibold text-sm hover:bg-emerald-500/10 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-checkbox-circle-line mr-2"></i>Đã nhớ!
            </button>
          </>
        ) : (
          <button
            onClick={onFlip}
            className="flex-1 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm transition-all cursor-pointer whitespace-nowrap"
          >
            Lật thẻ xem nghĩa
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function SeoulFlashcardPage() {
  const { addXP } = useXPSystem();
  const { user } = useAuth();

  // Local progress (fallback when not logged in)
  const [localProgress, setLocalProgress] = useState<ProgressMap>(() => {
    try {
      return JSON.parse(localStorage.getItem("kts_seoul_flashcard_status") || "{}");
    } catch {
      return {};
    }
  });

  // DB progress (when logged in)
  const [dbProgress, setDbProgress] = useState<ProgressMap>({});
  const [dbLoading, setDbLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedBook, setSelectedBook] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "learning" | "known">("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [sessionKnown, setSessionKnown] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [mode, setMode] = useState<"study" | "overview">("study");

  // Merge local + DB progress (DB takes priority)
  const progress: ProgressMap = useMemo(() => {
    return { ...localProgress, ...dbProgress };
  }, [localProgress, dbProgress]);

  // Load DB progress when user logs in
  useEffect(() => {
    if (!user) return;
    setDbLoading(true);
    supabase
      .from("seoul_flashcard_progress")
      .select("card_id, status")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) {
          const map: ProgressMap = {};
          data.forEach(row => { map[row.card_id] = row.status as CardStatus; });
          setDbProgress(map);
        }
        setDbLoading(false);
      });
  }, [user]);

  // Save progress to DB (upsert)
  const saveToDb = useCallback(async (cardId: string, bookId: string, lessonId: string, status: CardStatus) => {
    if (!user) return;
    setSaving(true);
    await supabase.from("seoul_flashcard_progress").upsert({
      user_id: user.id,
      card_id: cardId,
      book_id: bookId,
      lesson_id: lessonId,
      status,
      repetitions: status === "known" ? 1 : 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,card_id" });
    setSaving(false);
  }, [user]);

  // Update progress (local + DB)
  const updateProgress = useCallback((card: FlashcardItem, status: CardStatus) => {
    // Update local
    setLocalProgress(prev => {
      const next = { ...prev, [card.id]: status };
      localStorage.setItem("kts_seoul_flashcard_status", JSON.stringify(next));
      return next;
    });
    // Update DB if logged in
    if (user) {
      setDbProgress(prev => ({ ...prev, [card.id]: status }));
      saveToDb(card.id, card.bookId, card.lessonId, status);
    }
  }, [user, saveToDb]);

  const filteredCards = useMemo(() => {
    return ALL_FLASHCARDS.filter(c => {
      if (selectedBook !== "all" && c.bookId !== selectedBook) return false;
      const st = progress[c.id] ?? "new";
      if (filterStatus !== "all" && st !== filterStatus) return false;
      return true;
    });
  }, [selectedBook, filterStatus, progress]);

  const currentCard = filteredCards[currentIdx];

  const handleKnow = useCallback(() => {
    if (!currentCard) return;
    const wasNew = !progress[currentCard.id] || progress[currentCard.id] === "new";
    updateProgress(currentCard, "known");
    setSessionKnown(n => n + 1);
    setSessionTotal(n => n + 1);
    if (wasNew) addXP(5, "Học từ vựng Seoul");
    setShowBack(false);
    setCurrentIdx(i => Math.min(i + 1, filteredCards.length - 1));
  }, [currentCard, progress, updateProgress, addXP, filteredCards.length]);

  const handleLearn = useCallback(() => {
    if (!currentCard) return;
    updateProgress(currentCard, "learning");
    setSessionTotal(n => n + 1);
    setShowBack(false);
    setCurrentIdx(i => Math.min(i + 1, filteredCards.length - 1));
  }, [currentCard, updateProgress, filteredCards.length]);

  const handlePrev = () => { setCurrentIdx(i => Math.max(i - 1, 0)); setShowBack(false); };
  const handleNext = () => { setCurrentIdx(i => Math.min(i + 1, filteredCards.length - 1)); setShowBack(false); };

  const totalKnown = ALL_FLASHCARDS.filter(c => progress[c.id] === "known").length;
  const totalLearning = ALL_FLASHCARDS.filter(c => progress[c.id] === "learning").length;
  const totalNew = ALL_FLASHCARDS.length - totalKnown - totalLearning;

  return (
    <DashboardLayout
      title="Flashcard Seoul"
      subtitle="Ôn từ vựng toàn bộ giáo trình Seoul — tiến độ được lưu tự động"
    >
      <div className="p-6 md:p-8">
        {/* Login notice */}
        {!user && (
          <div className="mb-5 flex items-center gap-3 bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl px-4 py-3">
            <i className="ri-information-line text-app-accent-primary text-sm"></i>
            <p className="text-app-accent-primary/70 text-xs">Đăng nhập để lưu tiến độ vào cloud — không mất dữ liệu khi đổi thiết bị</p>
          </div>
        )}

        {/* DB sync status */}
        {user && (
          <div className="mb-5 flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-4 py-3">
            <div className={`w-2 h-2 rounded-full ${saving ? "bg-app-accent-primary animate-pulse" : dbLoading ? "bg-app-surface/500 animate-pulse" : "bg-emerald-400"}`}></div>
            <p className="text-app-accent-success/70 text-xs">
              {dbLoading ? "Đang tải tiến độ từ cloud..." : saving ? "Đang lưu..." : "Tiến độ được đồng bộ cloud tự động"}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Tổng từ vựng", value: ALL_FLASHCARDS.length, color: "app-accent-primary", icon: "ri-stack-line" },
            { label: "Đã thuộc", value: totalKnown, color: "#34d399", icon: "ri-checkbox-circle-line" },
            { label: "Đang học", value: totalLearning, color: "#fb923c", icon: "ri-refresh-line" },
            { label: "Chưa học", value: totalNew, color: "#a78bfa", icon: "ri-time-line" },
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

        {/* Overall progress bar */}
        <div className="mb-6 bg-app-bg border border-app-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/50 text-xs">Tiến độ tổng thể</span>
            <span className="text-app-accent-primary text-xs font-bold">{ALL_FLASHCARDS.length > 0 ? Math.round((totalKnown / ALL_FLASHCARDS.length) * 100) : 0}% đã thuộc</span>
          </div>
          <div className="h-2 bg-app-card/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${ALL_FLASHCARDS.length > 0 ? (totalKnown / ALL_FLASHCARDS.length) * 100 : 0}%`,
                background: "linear-gradient(90deg, app-accent-primary, #34d399)"
              }}
            />
          </div>
        </div>

        {/* Mode + Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex rounded-xl border border-app-border overflow-hidden">
            {(["study", "overview"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${mode === m ? "bg-app-accent-primary/15 text-app-accent-primary" : "text-app-text-secondary hover:text-white/60"}`}
              >
                {m === "study" ? "Học flashcard" : "Tổng quan"}
              </button>
            ))}
          </div>

          <select
            value={selectedBook}
            onChange={e => { setSelectedBook(e.target.value); setCurrentIdx(0); setShowBack(false); }}
            className="bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả cuốn</option>
            {seoulBooks.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.cefrLevel})</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value as typeof filterStatus); setCurrentIdx(0); setShowBack(false); }}
            className="bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="new">Chưa học</option>
            <option value="learning">Đang học</option>
            <option value="known">Đã thuộc</option>
          </select>

          {sessionTotal > 0 && (
            <div className="ml-auto flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              <i className="ri-trophy-line text-app-accent-success text-xs"></i>
              <span className="text-app-accent-success text-xs font-bold">{sessionKnown}/{sessionTotal} đúng phiên này</span>
            </div>
          )}
        </div>

        {/* Study mode */}
        {mode === "study" && (
          <div className="max-w-2xl mx-auto">
            {filteredCards.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-app-card/50 mx-auto mb-4">
                  <i className="ri-stack-line text-3xl text-app-text-muted"></i>
                </div>
                <p className="text-app-text-secondary text-sm">Không có thẻ nào phù hợp với bộ lọc</p>
                <button
                  onClick={() => { setFilterStatus("all"); setCurrentIdx(0); }}
                  className="mt-4 px-4 py-2 rounded-lg bg-app-card/50 text-white/50 text-xs hover:bg-app-card/70 cursor-pointer whitespace-nowrap"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                {/* Progress bar */}
                <div className="flex items-center gap-3 mb-5">
                  <p className="text-app-text-muted text-xs whitespace-nowrap">{currentIdx + 1} / {filteredCards.length}</p>
                  <div className="flex-1 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-app-accent-primary transition-all" style={{ width: `${((currentIdx + 1) / filteredCards.length) * 100}%` }} />
                  </div>
                  <div className="flex gap-1">
                    {filteredCards.slice(Math.max(0, currentIdx - 2), currentIdx + 5).map(c => {
                      const st = progress[c.id] ?? "new";
                      return (
                        <div key={c.id} className={`w-2 h-2 rounded-full ${st === "known" ? "bg-emerald-500" : st === "learning" ? "bg-orange-400" : "bg-white/15"}`} />
                      );
                    })}
                  </div>
                </div>

                {currentCard && (
                  <FlipCard
                    card={currentCard}
                    onKnow={handleKnow}
                    onLearn={handleLearn}
                    showBack={showBack}
                    onFlip={() => setShowBack(b => !b)}
                  />
                )}

                {/* Nav */}
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={handlePrev}
                    disabled={currentIdx === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-app-border text-app-text-secondary hover:text-white/60 hover:bg-app-card/50 text-sm transition-all cursor-pointer disabled:opacity-30 whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line"></i>Trước
                  </button>

                  <div className="flex gap-4">
                    {(["new", "learning", "known"] as const).map(st => {
                      const cnt = filteredCards.filter(c => (progress[c.id] ?? "new") === st).length;
                      const colors = { new: "text-app-text-muted", learning: "text-orange-400", known: "text-app-accent-success" };
                      const labels = { new: "Mới", learning: "Đang học", known: "Thuộc" };
                      return (
                        <div key={st} className="text-center">
                          <p className={`text-xs font-bold ${colors[st]}`}>{cnt}</p>
                          <p className="text-app-text-muted text-[10px]">{labels[st]}</p>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={currentIdx >= filteredCards.length - 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-app-border text-app-text-secondary hover:text-white/60 hover:bg-app-card/50 text-sm transition-all cursor-pointer disabled:opacity-30 whitespace-nowrap"
                  >
                    Tiếp<i className="ri-arrow-right-line"></i>
                  </button>
                </div>

                {/* Restart session */}
                {currentIdx >= filteredCards.length - 1 && (
                  <div className="mt-6 text-center">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                      <i className="ri-trophy-line text-3xl text-app-accent-success mb-2 block"></i>
                      <p className="text-app-accent-success font-bold mb-1">Hoàn thành bộ thẻ!</p>
                      <p className="text-app-text-muted text-xs mb-4">Đã học {sessionKnown}/{sessionTotal} từ trong phiên này</p>
                      <button
                        onClick={() => { setCurrentIdx(0); setShowBack(false); setSessionKnown(0); setSessionTotal(0); }}
                        className="px-6 py-2.5 rounded-xl bg-emerald-500/20 text-app-accent-success font-semibold text-sm hover:bg-emerald-500/30 cursor-pointer whitespace-nowrap"
                      >
                        Học lại từ đầu
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Overview mode */}
        {mode === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seoulBooks.map(book => {
              const bookCards = ALL_FLASHCARDS.filter(c => c.bookId === book.id);
              const known = bookCards.filter(c => progress[c.id] === "known").length;
              const learning = bookCards.filter(c => progress[c.id] === "learning").length;
              const pct = bookCards.length > 0 ? Math.round((known / bookCards.length) * 100) : 0;
              return (
                <div key={book.id} className="bg-app-bg border border-app-border rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${book.color}15`, color: book.color }}>
                          {book.level}
                        </span>
                        <span className="text-app-text-muted text-xs">{book.cefrLevel}</span>
                      </div>
                      <h3 className="text-white font-semibold text-sm">{book.name}</h3>
                      <p className="text-app-text-muted text-xs mt-0.5">{bookCards.length} từ vựng</p>
                    </div>
                    <button
                      onClick={() => { setSelectedBook(book.id); setFilterStatus("all"); setCurrentIdx(0); setShowBack(false); setMode("study"); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all hover:opacity-80"
                      style={{ backgroundColor: `${book.color}15`, color: book.color }}
                    >
                      Học ngay
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-app-text-muted">Đã thuộc</span>
                      <span className="font-bold" style={{ color: book.color }}>{known}/{bookCards.length} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-app-card/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: book.color }} />
                    </div>
                    <div className="flex gap-3 text-[10px]">
                      <span className="text-app-accent-success">{known} thuộc</span>
                      <span className="text-orange-400">{learning} đang học</span>
                      <span className="text-app-text-muted">{bookCards.length - known - learning} mới</span>
                    </div>
                  </div>

                  {/* Lessons breakdown */}
                  <div className="mt-3 pt-3 border-t border-app-border">
                    <p className="text-app-text-muted text-[10px] mb-2">Tiến độ theo bài học</p>
                    <div className="flex flex-wrap gap-1">
                      {book.lessons.map(lesson => {
                        const lCards = ALL_FLASHCARDS.filter(c => c.lessonId === lesson.id);
                        const lKnown = lCards.filter(c => progress[c.id] === "known").length;
                        const lPct = lCards.length > 0 ? lKnown / lCards.length : 0;
                        return (
                          <div
                            key={lesson.id}
                            title={`Bài ${lesson.lessonNumber}: ${lKnown}/${lCards.length} từ`}
                            className="w-4 h-4 rounded-sm cursor-pointer"
                            style={{ backgroundColor: lPct === 1 ? book.color : lPct > 0 ? `${book.color}40` : "rgba(255,255,255,0.05)" }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
