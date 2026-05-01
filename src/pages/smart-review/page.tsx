import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// SM-2 Spaced Repetition Algorithm
interface SRCard {
  id: string;
  korean: string;
  vietnamese: string;
  example?: string;
  source: "eps" | "seoul" | "topik";
  sourceLabel: string;
  // SM-2 fields
  interval: number;       // days until next review
  repetitions: number;    // number of successful reviews
  easeFactor: number;     // difficulty multiplier (default 2.5)
  nextReview: string;     // ISO date string
  lastReview?: string;
  totalReviews: number;
  correctReviews: number;
}

const INITIAL_CARDS: SRCard[] = [
  // EPS cards
  { id: "e1", korean: "작업장", vietnamese: "Nơi làm việc", example: "작업장에서 안전을 지켜야 합니다", source: "eps", sourceLabel: "EPS", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "e2", korean: "안전모", vietnamese: "Mũ bảo hộ", example: "안전모를 꼭 써야 합니다", source: "eps", sourceLabel: "EPS", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "e3", korean: "계약서", vietnamese: "Hợp đồng", example: "계약서에 서명해 주세요", source: "eps", sourceLabel: "EPS", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "e4", korean: "월급", vietnamese: "Lương tháng", example: "월급이 얼마예요?", source: "eps", sourceLabel: "EPS", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "e5", korean: "퇴근", vietnamese: "Tan ca / Về nhà", example: "오늘 몇 시에 퇴근해요?", source: "eps", sourceLabel: "EPS", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "e6", korean: "출근", vietnamese: "Đi làm", example: "매일 8시에 출근해요", source: "eps", sourceLabel: "EPS", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "e7", korean: "야근", vietnamese: "Làm thêm giờ", example: "오늘 야근이 있어요", source: "eps", sourceLabel: "EPS", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "e8", korean: "휴가", vietnamese: "Nghỉ phép", example: "다음 주에 휴가를 쓸 거예요", source: "eps", sourceLabel: "EPS", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  // Seoul cards
  { id: "s1", korean: "가족", vietnamese: "Gia đình", example: "우리 가족은 4명이에요", source: "seoul", sourceLabel: "Seoul 1A", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "s2", korean: "학교", vietnamese: "Trường học", example: "학교에 가요", source: "seoul", sourceLabel: "Seoul 1A", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "s3", korean: "친구", vietnamese: "Bạn bè", example: "친구와 같이 공부해요", source: "seoul", sourceLabel: "Seoul 1B", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "s4", korean: "음식", vietnamese: "Đồ ăn / Thức ăn", example: "한국 음식이 맛있어요", source: "seoul", sourceLabel: "Seoul 1B", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "s5", korean: "여행", vietnamese: "Du lịch", example: "제주도로 여행을 갔어요", source: "seoul", sourceLabel: "Seoul 2A", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "s6", korean: "날씨", vietnamese: "Thời tiết", example: "오늘 날씨가 좋아요", source: "seoul", sourceLabel: "Seoul 2A", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "s7", korean: "경험", vietnamese: "Kinh nghiệm", example: "좋은 경험이었어요", source: "seoul", sourceLabel: "Seoul 3A", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "s8", korean: "문화", vietnamese: "Văn hóa", example: "한국 문화를 배우고 싶어요", source: "seoul", sourceLabel: "Seoul 3B", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  // TOPIK cards
  { id: "t1", korean: "공부하다", vietnamese: "Học tập", example: "열심히 공부해요", source: "topik", sourceLabel: "TOPIK I", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "t2", korean: "이해하다", vietnamese: "Hiểu", example: "잘 이해했어요", source: "topik", sourceLabel: "TOPIK I", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "t3", korean: "생각하다", vietnamese: "Suy nghĩ", example: "어떻게 생각해요?", source: "topik", sourceLabel: "TOPIK I", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "t4", korean: "준비하다", vietnamese: "Chuẩn bị", example: "시험을 준비해요", source: "topik", sourceLabel: "TOPIK I", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
  { id: "t5", korean: "설명하다", vietnamese: "Giải thích", example: "선생님이 설명해요", source: "topik", sourceLabel: "TOPIK II", interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString().split("T")[0], totalReviews: 0, correctReviews: 0 },
];

// SM-2 algorithm
function sm2Update(card: SRCard, quality: 0 | 1 | 2 | 3 | 4 | 5): SRCard {
  const today = new Date().toISOString().split("T")[0];
  let { interval, repetitions, easeFactor } = card;

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

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    ...card,
    interval,
    repetitions,
    easeFactor,
    nextReview: nextDate.toISOString().split("T")[0],
    lastReview: today,
    totalReviews: card.totalReviews + 1,
    correctReviews: card.correctReviews + (quality >= 3 ? 1 : 0),
  };
}

function getDaysUntilReview(nextReview: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(nextReview);
  next.setHours(0, 0, 0, 0);
  return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const sourceColors: Record<string, string> = {
  eps: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  seoul: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  topik: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

type ViewMode = "review" | "overview";

export default function SmartReviewPage() {
  const [cards, setCards] = useLocalStorage<SRCard[]>("kts_sr_cards", INITIAL_CARDS);
  const [viewMode, setViewMode] = useState<ViewMode>("review");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, xpEarned: 0 });
  const [xpData, setXpData] = useLocalStorage<{ total: number }>("kts_xp_total", { total: 0 });
  const [filterSource, setFilterSource] = useState("all");

  const today = new Date().toISOString().split("T")[0];

  const dueCards = cards.filter(c => {
    const sourceOk = filterSource === "all" || c.source === filterSource;
    return sourceOk && c.nextReview <= today;
  });

  const currentCard = dueCards[currentCardIndex];

  const handleQuality = useCallback((quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (!currentCard) return;

    const updated = sm2Update(currentCard, quality);
    setCards(prev => prev.map(c => c.id === currentCard.id ? updated : c));

    const xpGain = quality >= 4 ? 15 : quality >= 3 ? 10 : 3;
    setXpData(prev => ({ total: (prev.total || 0) + xpGain }));
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (quality >= 3 ? 1 : 0),
      xpEarned: prev.xpEarned + xpGain,
    }));

    setShowAnswer(false);

    if (currentCardIndex >= dueCards.length - 1) {
      setSessionDone(true);
    } else {
      setCurrentCardIndex(prev => prev + 1);
    }
  }, [currentCard, currentCardIndex, dueCards.length, setCards, setXpData]);

  const resetSession = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSessionDone(false);
    setSessionStats({ reviewed: 0, correct: 0, xpEarned: 0 });
  };

  const speakKorean = (text: string) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ko-KR";
    utt.rate = 0.85;
    synth.speak(utt);
  };

  // Stats
  const totalCards = cards.length;
  const masteredCards = cards.filter(c => c.repetitions >= 5).length;
  const learningCards = cards.filter(c => c.repetitions > 0 && c.repetitions < 5).length;
  const newCards = cards.filter(c => c.repetitions === 0).length;
  const dueToday = cards.filter(c => c.nextReview <= today).length;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Ôn tập thông minh
            </h1>
            <p className="text-white/40 text-sm mt-0.5">Spaced Repetition — hệ thống nhắc lại từ vựng sắp quên</p>
          </div>
          <div className="flex gap-1 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setViewMode("review")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${viewMode === "review" ? "bg-amber-500/20 text-amber-400" : "text-white/40 hover:text-white/70"}`}
            >
              Ôn tập
            </button>
            <button
              onClick={() => setViewMode("overview")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${viewMode === "overview" ? "bg-amber-500/20 text-amber-400" : "text-white/40 hover:text-white/70"}`}
            >
              Tổng quan
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Cần ôn hôm nay", value: dueToday, color: "text-red-400", icon: "ri-alarm-warning-line" },
            { label: "Đã thuộc", value: masteredCards, color: "text-emerald-400", icon: "ri-checkbox-circle-line" },
            { label: "Đang học", value: learningCards, color: "text-amber-400", icon: "ri-refresh-line" },
            { label: "Từ mới", value: newCards, color: "text-sky-400", icon: "ri-add-circle-line" },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 border border-white/8 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`${stat.icon} ${stat.color} text-sm`}></i>
                </div>
                <p className="text-white/40 text-xs">{stat.label}</p>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {viewMode === "review" ? (
          <>
            {/* Filter */}
            <div className="flex gap-2">
              {[["all", "Tất cả"], ["eps", "EPS"], ["seoul", "Seoul"], ["topik", "TOPIK"]].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => { setFilterSource(val); resetSession(); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    filterSource === val ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/5 text-white/40 hover:text-white/70 border border-transparent"
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="ml-auto text-white/30 text-xs self-center">{dueCards.length} từ cần ôn</span>
            </div>

            {/* Review card */}
            {dueCards.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-emerald-500/10 rounded-full mx-auto mb-4">
                  <i className="ri-checkbox-circle-line text-emerald-400 text-3xl"></i>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Tuyệt vời! Không có từ nào cần ôn hôm nay</h3>
                <p className="text-white/40 text-sm">Hệ thống sẽ nhắc bạn khi có từ sắp quên. Hãy quay lại ngày mai!</p>
              </div>
            ) : sessionDone ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-amber-500/10 rounded-full mx-auto mb-4">
                  <i className="ri-trophy-line text-amber-400 text-3xl"></i>
                </div>
                <h3 className="text-white font-semibold text-xl mb-2">Phiên ôn tập hoàn thành!</h3>
                <div className="flex justify-center gap-6 my-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{sessionStats.reviewed}</p>
                    <p className="text-white/40 text-xs">Đã ôn</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-emerald-400">{sessionStats.correct}</p>
                    <p className="text-white/40 text-xs">Đúng</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-400">+{sessionStats.xpEarned}</p>
                    <p className="text-white/40 text-xs">XP</p>
                  </div>
                </div>
                <button
                  onClick={resetSession}
                  className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 rounded-xl px-6 py-2.5 text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
                >
                  Ôn lại từ đầu
                </button>
              </div>
            ) : currentCard ? (
              <>
                {/* Progress */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                      style={{ width: `${(currentCardIndex / dueCards.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-white/30 text-xs whitespace-nowrap">{currentCardIndex + 1}/{dueCards.length}</span>
                </div>

                {/* Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-8">
                    {/* Source badge */}
                    <div className="flex items-center gap-2 mb-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${sourceColors[currentCard.source]}`}>
                        {currentCard.sourceLabel}
                      </span>
                      {currentCard.repetitions > 0 && (
                        <span className="text-white/30 text-xs">Đã ôn {currentCard.totalReviews} lần</span>
                      )}
                      <span className="ml-auto text-white/20 text-xs">
                        {currentCard.repetitions === 0 ? "Từ mới" : `Lần ${currentCard.repetitions + 1}`}
                      </span>
                    </div>

                    {/* Korean */}
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <p className="text-5xl font-bold text-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                          {currentCard.korean}
                        </p>
                        <button
                          onClick={() => speakKorean(currentCard.korean)}
                          className="w-10 h-10 flex items-center justify-center bg-white/8 hover:bg-white/15 rounded-full transition-all cursor-pointer"
                        >
                          <i className="ri-volume-up-line text-white/50 text-lg"></i>
                        </button>
                      </div>

                      {!showAnswer ? (
                        <button
                          onClick={() => setShowAnswer(true)}
                          className="mt-4 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 rounded-xl px-8 py-3 text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
                        >
                          Xem nghĩa
                        </button>
                      ) : (
                        <div className="mt-4 space-y-3">
                          <p className="text-white/80 text-2xl font-medium">{currentCard.vietnamese}</p>
                          {currentCard.example && (
                            <div className="bg-white/5 rounded-xl px-4 py-3 inline-block">
                              <p className="text-white/50 text-sm" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{currentCard.example}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Rating buttons */}
                    {showAnswer && (
                      <div>
                        <p className="text-white/30 text-xs text-center mb-3">Bạn nhớ từ này như thế nào?</p>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { quality: 0 as const, label: "Không nhớ", sub: "Ôn lại ngay", color: "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25" },
                            { quality: 2 as const, label: "Khó nhớ", sub: "Ôn lại sớm", color: "bg-orange-500/15 border-orange-500/30 text-orange-400 hover:bg-orange-500/25" },
                            { quality: 3 as const, label: "Nhớ được", sub: `${Math.round(sm2Update(currentCard, 3).interval)} ngày`, color: "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25" },
                            { quality: 5 as const, label: "Thuộc lòng", sub: `${Math.round(sm2Update(currentCard, 5).interval)} ngày`, color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25" },
                          ].map(btn => (
                            <button
                              key={btn.quality}
                              onClick={() => handleQuality(btn.quality)}
                              className={`border rounded-xl p-3 text-center transition-all cursor-pointer ${btn.color}`}
                            >
                              <p className="font-medium text-sm">{btn.label}</p>
                              <p className="text-xs opacity-60 mt-0.5">{btn.sub}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </>
        ) : (
          /* Overview mode */
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/8 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Tất cả từ vựng ({totalCards} từ)</h3>
              <div className="space-y-2">
                {cards.map(card => {
                  const daysUntil = getDaysUntilReview(card.nextReview);
                  const accuracy = card.totalReviews > 0 ? Math.round((card.correctReviews / card.totalReviews) * 100) : 0;
                  return (
                    <div key={card.id} className="flex items-center gap-4 py-2.5 border-b border-white/5 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{card.korean}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] border ${sourceColors[card.source]}`}>{card.sourceLabel}</span>
                        </div>
                        <p className="text-white/40 text-xs mt-0.5">{card.vietnamese}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-xs font-medium ${daysUntil <= 0 ? "text-red-400" : daysUntil <= 3 ? "text-amber-400" : "text-emerald-400"}`}>
                          {daysUntil <= 0 ? "Cần ôn ngay" : `${daysUntil} ngày nữa`}
                        </p>
                        <p className="text-white/25 text-[10px]">
                          {card.totalReviews > 0 ? `${accuracy}% đúng · ${card.totalReviews} lần` : "Chưa ôn"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Algorithm explanation */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-violet-500/10 rounded-lg flex-shrink-0">
                  <i className="ri-brain-line text-violet-400 text-sm"></i>
                </div>
                <div>
                  <p className="text-white/60 text-sm font-medium mb-1">Thuật toán SM-2 (Spaced Repetition)</p>
                  <p className="text-white/35 text-xs leading-relaxed">
                    Hệ thống tự động tính toán khoảng thời gian ôn tập tối ưu dựa trên mức độ ghi nhớ của bạn. Từ bạn nhớ tốt sẽ được nhắc lại sau nhiều ngày hơn, từ khó sẽ được nhắc lại sớm hơn — giúp bạn ghi nhớ lâu dài với ít thời gian nhất.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
