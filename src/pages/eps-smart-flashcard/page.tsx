import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import { epsVocabulary, EPS_VOCAB_TOPICS, type EpsVocabItem } from "@/mocks/epsVocabulary";

// SR intervals in days
const SR_INTERVALS = [0, 1, 3, 7, 14, 30, 60];

interface SmartCard {
  id: string;
  interval: number; // index into SR_INTERVALS
  nextReview: string; // ISO date
  failCount: number;
  successCount: number;
  lastSeen: string;
}

function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ko-KR";
  utter.rate = 0.75;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

function getNextReviewDate(intervalIdx: number): string {
  const days = SR_INTERVALS[Math.min(intervalIdx, SR_INTERVALS.length - 1)];
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function isCardDue(card: SmartCard): boolean {
  const today = new Date().toISOString().split("T")[0];
  return card.nextReview <= today;
}

type StudyPhase = "select" | "study" | "done";

export default function EpsSmartFlashcardPage() {
  const { awardXP } = useXPSystem();
  const [cardData, setCardData] = useLocalStorage<Record<string, SmartCard>>("kts_eps_smart_cards", {});
  const [phase, setPhase] = useState<StudyPhase>("select");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [studyQueue, setStudyQueue] = useState<EpsVocabItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ known: 0, unknown: 0, total: 0 });
  const [showExample, setShowExample] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stats
  const stats = useMemo(() => {
    const all = epsVocabulary;
    const dueToday = all.filter(v => {
      const c = cardData[v.id];
      return !c || isCardDue(c);
    });
    const mastered = all.filter(v => {
      const c = cardData[v.id];
      return c && c.interval >= 5;
    });
    const learning = all.filter(v => {
      const c = cardData[v.id];
      return c && c.interval > 0 && c.interval < 5;
    });
    const newCards = all.filter(v => !cardData[v.id]);
    return { dueToday: dueToday.length, mastered: mastered.length, learning: learning.length, newCards: newCards.length };
  }, [cardData]);

  // Build study queue based on selected topics + priority
  const buildQueue = useCallback((topics: string[]) => {
    const pool = topics.length > 0
      ? epsVocabulary.filter(v => topics.includes(v.topicId))
      : epsVocabulary;

    // Priority: due cards first, then new cards, sorted by fail count desc
    const due = pool.filter(v => {
      const c = cardData[v.id];
      return c && isCardDue(c);
    }).sort((a, b) => {
      const ca = cardData[a.id];
      const cb = cardData[b.id];
      return (cb?.failCount || 0) - (ca?.failCount || 0);
    });

    const newCards = pool.filter(v => !cardData[v.id]).slice(0, 20);

    const combined = [...due, ...newCards].slice(0, 30);
    return combined.length > 0 ? combined : pool.slice(0, 20);
  }, [cardData]);

  const startStudy = useCallback((topics: string[]) => {
    const queue = buildQueue(topics);
    setStudyQueue(queue);
    setCurrentIdx(0);
    setFlipped(false);
    setShowExample(false);
    setSessionStats({ known: 0, unknown: 0, total: queue.length });
    setPhase("study");
  }, [buildQueue]);

  const handleKnow = useCallback(() => {
    const item = studyQueue[currentIdx];
    if (!item) return;
    const existing = cardData[item.id];
    const newInterval = Math.min((existing?.interval || 0) + 1, SR_INTERVALS.length - 1);
    setCardData(prev => ({
      ...prev,
      [item.id]: {
        id: item.id,
        interval: newInterval,
        nextReview: getNextReviewDate(newInterval),
        failCount: existing?.failCount || 0,
        successCount: (existing?.successCount || 0) + 1,
        lastSeen: new Date().toISOString(),
      },
    }));
    setSessionStats(s => ({ ...s, known: s.known + 1 }));
    awardXP({ type: "flashcard_learned" });
    nextCard();
  }, [studyQueue, currentIdx, cardData, setCardData, awardXP]);

  const handleDontKnow = useCallback(() => {
    const item = studyQueue[currentIdx];
    if (!item) return;
    const existing = cardData[item.id];
    setCardData(prev => ({
      ...prev,
      [item.id]: {
        id: item.id,
        interval: 0, // reset to beginning
        nextReview: getNextReviewDate(0),
        failCount: (existing?.failCount || 0) + 1,
        successCount: existing?.successCount || 0,
        lastSeen: new Date().toISOString(),
      },
    }));
    setSessionStats(s => ({ ...s, unknown: s.unknown + 1 }));
    nextCard();
  }, [studyQueue, currentIdx, cardData, setCardData]);

  const nextCard = useCallback(() => {
    setFlipped(false);
    setShowExample(false);
    if (currentIdx + 1 >= studyQueue.length) {
      setPhase("done");
    } else {
      setCurrentIdx(i => i + 1);
    }
  }, [currentIdx, studyQueue.length]);

  const handleSpeak = useCallback((text: string) => {
    setIsPlaying(true);
    speakKorean(text);
    if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
    audioTimeoutRef.current = setTimeout(() => setIsPlaying(false), 2000);
  }, []);

  const currentItem = studyQueue[currentIdx];
  const currentCard = currentItem ? cardData[currentItem.id] : null;

  const topicsWithStats = useMemo(() => {
    return EPS_VOCAB_TOPICS.map(t => {
      const items = epsVocabulary.filter(v => v.topicId === t.id);
      const due = items.filter(v => {
        const c = cardData[v.id];
        return !c || isCardDue(c);
      }).length;
      const mastered = items.filter(v => {
        const c = cardData[v.id];
        return c && c.interval >= 5;
      }).length;
      return { ...t, total: items.length, due, mastered };
    }).filter(t => t.total > 0);
  }, [cardData]);

  // ── SELECT PHASE ──────────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <DashboardLayout title="Flashcard thông minh EPS" subtitle="Tự động ưu tiên từ chưa thuộc · Phát âm tiếng Hàn · Spaced Repetition">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-5">
            {/* Quick start */}
            <div className="bg-gradient-to-r from-[#1a1600] to-[#0f1117] border border-[#e8c84a]/15 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#e8c84a]/15 flex-shrink-0">
                  <i className="ri-brain-line text-[#e8c84a] text-2xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-base">Học thông minh hôm nay</h3>
                  <p className="text-white/40 text-sm mt-0.5">
                    <span className="text-[#e8c84a] font-semibold">{stats.dueToday}</span> từ cần ôn hôm nay
                    {stats.newCards > 0 && <span> · <span className="text-[#34d399] font-semibold">{Math.min(stats.newCards, 20)}</span> từ mới</span>}
                  </p>
                </div>
                <button
                  onClick={() => startStudy([])}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm cursor-pointer whitespace-nowrap transition-colors"
                >
                  <i className="ri-play-circle-line text-lg"></i>
                  Học ngay
                </button>
              </div>
            </div>

            {/* Topic selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">Hoặc chọn chủ đề cụ thể</h3>
                {selectedTopics.length > 0 && (
                  <button
                    onClick={() => startStudy(selectedTopics)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e8c84a]/10 border border-[#e8c84a]/20 text-[#e8c84a] text-xs font-semibold cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-play-circle-line"></i>
                    Học {selectedTopics.length} chủ đề đã chọn
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {topicsWithStats.map(topic => {
                  const isSelected = selectedTopics.includes(topic.id);
                  const masteredPct = topic.total > 0 ? Math.round((topic.mastered / topic.total) * 100) : 0;
                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopics(prev => isSelected ? prev.filter(t => t !== topic.id) : [...prev, topic.id])}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? "border-[#e8c84a]/40 bg-[#e8c84a]/5" : "border-white/8 bg-[#0f1117] hover:border-white/15"}`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-[#e8c84a]">
                          <i className="ri-check-line text-[#0f1117] text-[10px] font-bold"></i>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${topic.color}15` }}>
                          <i className={`${topic.icon} text-sm`} style={{ color: topic.color }}></i>
                        </div>
                        <p className="text-white/70 text-xs font-medium leading-tight">{topic.label}</p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] mb-1.5">
                        <span className="text-white/30">{topic.total} từ</span>
                        {topic.due > 0 && <span className="text-[#e8c84a] font-semibold">{topic.due} cần ôn</span>}
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${masteredPct}%`, backgroundColor: topic.color }} />
                      </div>
                      <p className="text-white/20 text-[9px] mt-1">{masteredPct}% thuộc lòng</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4"><i className="ri-bar-chart-line text-[#e8c84a] mr-2"></i>Tổng quan học tập</h3>
              <div className="space-y-3">
                {[
                  { label: "Cần ôn hôm nay", value: stats.dueToday, color: "#f87171", icon: "ri-alarm-line" },
                  { label: "Đang học", value: stats.learning, color: "#e8c84a", icon: "ri-book-open-line" },
                  { label: "Thuộc lòng", value: stats.mastered, color: "#34d399", icon: "ri-checkbox-circle-line" },
                  { label: "Từ mới chưa học", value: stats.newCards, color: "#a78bfa", icon: "ri-add-circle-line" },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                      <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-white/40 text-xs">{s.label}</span>
                      <span className="font-bold text-sm" style={{ color: s.color }}>{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3"><i className="ri-lightbulb-line text-[#e8c84a] mr-2"></i>Cách hoạt động</h3>
              <div className="space-y-2.5 text-white/40 text-xs leading-relaxed">
                <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Từ chưa thuộc được ưu tiên hiển thị trước</p>
                <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Nhấn loa để nghe phát âm tiếng Hàn</p>
                <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Nhấn thẻ để lật và xem nghĩa + ví dụ</p>
                <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Spaced Repetition: từ đã thuộc sẽ ôn lại sau nhiều ngày hơn</p>
                <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Từ sai sẽ được đưa về đầu hàng đợi</p>
              </div>
            </div>

            <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">Lịch ôn tập SR</h3>
              <div className="space-y-1.5">
                {SR_INTERVALS.map((days, i) => {
                  const count = Object.values(cardData).filter(c => c.interval === i).length;
                  const colors = ["#f87171", "#fb923c", "#e8c84a", "#34d399", "#06b6d4", "#a78bfa", "#ec4899"];
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i] }}></div>
                      <span className="text-white/30 text-[10px] flex-1">{days === 0 ? "Mới" : `${days} ngày`}</span>
                      <span className="text-white/50 text-[10px] font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── STUDY PHASE ───────────────────────────────────────────────────────────
  if (phase === "study" && currentItem) {
    const progress = ((currentIdx) / studyQueue.length) * 100;
    const cardInfo = cardData[currentItem.id];
    const isDue = !cardInfo || isCardDue(cardInfo);
    const isNew = !cardInfo;

    return (
      <DashboardLayout
        title="Flashcard thông minh"
        subtitle={`${currentIdx + 1}/${studyQueue.length} · ${sessionStats.known} đã nhớ · ${sessionStats.unknown} chưa nhớ`}
        actions={
          <button onClick={() => setPhase("select")} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/50 text-sm cursor-pointer whitespace-nowrap hover:bg-white/5">
            <i className="ri-arrow-left-line"></i>Thoát
          </button>
        }
      >
        <div className="max-w-xl mx-auto space-y-5">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full bg-[#e8c84a] rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-white/30 text-xs whitespace-nowrap">{currentIdx + 1}/{studyQueue.length}</span>
          </div>

          {/* Card status badge */}
          <div className="flex items-center gap-2">
            {isNew && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/20">
                <i className="ri-add-circle-line"></i>Từ mới
              </span>
            )}
            {!isNew && isDue && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e8c84a]/15 text-[#e8c84a] border border-[#e8c84a]/20">
                <i className="ri-alarm-line"></i>Đến hạn ôn
              </span>
            )}
            {cardInfo && cardInfo.failCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                <i className="ri-error-warning-line"></i>Sai {cardInfo.failCount} lần
              </span>
            )}
            {cardInfo && cardInfo.interval >= 3 && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <i className="ri-checkbox-circle-line"></i>Đang thuộc
              </span>
            )}
          </div>

          {/* Flashcard */}
          <div
            className="w-full cursor-pointer select-none"
            style={{ perspective: "1000px" }}
            onClick={() => setFlipped(v => !v)}
          >
            <div
              className="relative w-full transition-transform duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                minHeight: "260px",
              }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 rounded-2xl border border-white/8 flex flex-col items-center justify-center p-8 bg-[#0f1117]"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={e => { e.stopPropagation(); handleSpeak(currentItem.korean); }}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${isPlaying ? "bg-[#e8c84a]/20 text-[#e8c84a]" : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60"}`}
                  >
                    <i className={`${isPlaying ? "ri-volume-up-fill" : "ri-volume-up-line"} text-lg`}></i>
                  </button>
                  <div className="text-center">
                    <p className="text-white/20 text-xs tracking-normal mb-1">Tiếng Hàn</p>
                    <p className="text-white text-5xl font-bold">{currentItem.korean}</p>
                    <p className="text-white/40 text-base mt-1">[{currentItem.reading}]</p>
                  </div>
                  <div className="w-10"></div>
                </div>

                {/* Topic badge */}
                {(() => {
                  const topicInfo = EPS_VOCAB_TOPICS.find(t => t.id === currentItem.topicId);
                  return topicInfo ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: `${topicInfo.color}15` }}>
                      <i className={`${topicInfo.icon} text-xs`} style={{ color: topicInfo.color }}></i>
                      <span className="text-xs" style={{ color: topicInfo.color }}>{topicInfo.label}</span>
                    </div>
                  ) : null;
                })()}

                <p className="text-white/20 text-xs mt-6">Nhấn để xem nghĩa</p>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 rounded-2xl border border-[#e8c84a]/20 flex flex-col items-center justify-center p-8"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", backgroundColor: "#1a1600" }}
              >
                <p className="text-[#e8c84a]/40 text-xs tracking-normal mb-3">Tiếng Việt</p>
                <p className="text-white text-3xl font-bold mb-2 text-center">{currentItem.vietnamese}</p>
                <p className="text-white/40 text-sm mb-4">[{currentItem.reading}]</p>

                <button
                  onClick={e => { e.stopPropagation(); setShowExample(v => !v); }}
                  className="flex items-center gap-1.5 text-xs text-[#e8c84a]/60 hover:text-[#e8c84a] cursor-pointer mb-3"
                >
                  <i className={showExample ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  {showExample ? "Ẩn ví dụ" : "Xem ví dụ"}
                </button>

                {showExample && (
                  <div className="bg-white/5 rounded-xl px-4 py-3 text-center max-w-sm w-full">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white/60 text-sm flex-1">{currentItem.example}</p>
                      <button
                        onClick={e => { e.stopPropagation(); handleSpeak(currentItem.example); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-white/30 hover:text-white/60 cursor-pointer flex-shrink-0 ml-2"
                      >
                        <i className="ri-volume-up-line text-xs"></i>
                      </button>
                    </div>
                    <p className="text-white/30 text-xs italic">{currentItem.exampleVi}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDontKnow}
              className="flex-1 py-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
            >
              <i className="ri-close-line text-lg"></i>Chưa nhớ
            </button>
            <button
              onClick={() => { setFlipped(true); }}
              className="px-4 py-3.5 rounded-xl border border-white/10 bg-white/3 text-white/40 text-sm cursor-pointer whitespace-nowrap hover:bg-white/8 transition-colors flex items-center justify-center gap-2"
            >
              <i className="ri-refresh-line"></i>Lật
            </button>
            <button
              onClick={handleKnow}
              className="flex-1 py-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-emerald-500/10 transition-colors flex items-center justify-center gap-2"
            >
              <i className="ri-check-line text-lg"></i>Đã nhớ
            </button>
          </div>

          {/* SR info */}
          {cardInfo && (
            <div className="flex items-center justify-center gap-4 text-[10px] text-white/20">
              <span><i className="ri-check-line text-emerald-400/50 mr-1"></i>{cardInfo.successCount} lần đúng</span>
              <span><i className="ri-close-line text-red-400/50 mr-1"></i>{cardInfo.failCount} lần sai</span>
              <span><i className="ri-calendar-line mr-1"></i>Ôn lại sau {SR_INTERVALS[Math.min(cardInfo.interval + 1, SR_INTERVALS.length - 1)]} ngày</span>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ── DONE PHASE ────────────────────────────────────────────────────────────
  if (phase === "done") {
    const pct = sessionStats.total > 0 ? Math.round((sessionStats.known / sessionStats.total) * 100) : 0;
    return (
      <DashboardLayout title="Hoàn thành phiên học!" subtitle="Kết quả phiên flashcard thông minh">
        <div className="max-w-md mx-auto text-center py-8 space-y-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: pct >= 70 ? "#34d39915" : "#e8c84a15" }}>
            <i className={`text-4xl ${pct >= 70 ? "ri-trophy-fill text-[#34d399]" : "ri-refresh-line text-[#e8c84a]"}`}></i>
          </div>

          <div>
            <p className="text-white text-3xl font-bold">{pct}%</p>
            <p className="text-white/40 text-sm mt-1">Tỷ lệ nhớ trong phiên này</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
              <p className="text-emerald-400 text-2xl font-bold">{sessionStats.known}</p>
              <p className="text-white/40 text-xs mt-1">Đã nhớ</p>
            </div>
            <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
              <p className="text-red-400 text-2xl font-bold">{sessionStats.unknown}</p>
              <p className="text-white/40 text-xs mt-1">Chưa nhớ</p>
            </div>
            <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-4">
              <p className="text-[#e8c84a] text-2xl font-bold">{stats.mastered}</p>
              <p className="text-white/40 text-xs mt-1">Tổng thuộc lòng</p>
            </div>
          </div>

          <div className="bg-[#0f1117] border border-white/5 rounded-xl p-4 text-left">
            <p className="text-white/50 text-xs font-semibold mb-2">Lịch ôn tập tiếp theo</p>
            <p className="text-white/30 text-xs">
              Từ đã nhớ sẽ được ôn lại sau {SR_INTERVALS[1]}-{SR_INTERVALS[3]} ngày. Từ chưa nhớ sẽ xuất hiện lại ngay hôm nay.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => startStudy(selectedTopics)} className="flex-1 py-3 rounded-xl border border-[#e8c84a]/20 bg-[#e8c84a]/5 text-[#e8c84a] text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-[#e8c84a]/10">
              <i className="ri-refresh-line mr-2"></i>Học lại
            </button>
            <button onClick={() => setPhase("select")} className="flex-1 py-3 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] text-sm font-bold cursor-pointer whitespace-nowrap">
              <i className="ri-home-line mr-2"></i>Về trang chủ
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return null;
}


