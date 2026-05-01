import { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VocabCard {
  id: string;
  korean: string;
  vietnamese: string;
  example?: string;
  topic?: string;
  level?: string;
}

interface CardMemory {
  id: string;
  easeFactor: number;    // 1.3 – 2.5
  interval: number;      // days
  repetitions: number;
  nextReview: string;    // ISO date
  lastReview: string;
  totalReviews: number;
  correctCount: number;
  streak: number;
}

type Rating = 1 | 2 | 3 | 4; // 1=Again, 2=Hard, 3=Good, 4=Easy

// ─── SM-2 Algorithm ───────────────────────────────────────────────────────────
function sm2(memory: CardMemory, rating: Rating): CardMemory {
  const q = rating; // 1-4 mapped to quality
  let { easeFactor, interval, repetitions } = memory;

  if (q < 2) {
    // Again — reset
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  // Update ease factor
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (4 - q) * (0.08 + (4 - q) * 0.02));

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    ...memory,
    easeFactor,
    interval,
    repetitions,
    nextReview: nextDate.toISOString().split("T")[0],
    lastReview: new Date().toISOString().split("T")[0],
    totalReviews: memory.totalReviews + 1,
    correctCount: q >= 2 ? memory.correctCount + 1 : memory.correctCount,
    streak: q >= 3 ? memory.streak + 1 : 0,
  };
}

function getDefaultMemory(id: string): CardMemory {
  return {
    id,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: new Date().toISOString().split("T")[0],
    lastReview: "",
    totalReviews: 0,
    correctCount: 0,
    streak: 0,
  };
}

// ─── Mock fallback vocab ──────────────────────────────────────────────────────
const mockVocab: VocabCard[] = [
  { id: "m1", korean: "사랑", vietnamese: "Tình yêu", example: "사랑해요.", topic: "Cảm xúc", level: "A1" },
  { id: "m2", korean: "행복", vietnamese: "Hạnh phúc", example: "행복하세요!", topic: "Cảm xúc", level: "A1" },
  { id: "m3", korean: "공부하다", vietnamese: "Học bài", example: "열심히 공부해요.", topic: "Giáo dục", level: "A1" },
  { id: "m4", korean: "친구", vietnamese: "Bạn bè", example: "친구를 만났어요.", topic: "Xã hội", level: "A1" },
  { id: "m5", korean: "음식", vietnamese: "Thức ăn", example: "음식이 맛있어요.", topic: "Ẩm thực", level: "A1" },
  { id: "m6", korean: "여행", vietnamese: "Du lịch", example: "여행을 좋아해요.", topic: "Hoạt động", level: "A2" },
  { id: "m7", korean: "경험", vietnamese: "Kinh nghiệm", example: "좋은 경험이었어요.", topic: "Trừu tượng", level: "B1" },
  { id: "m8", korean: "노력", vietnamese: "Nỗ lực", example: "노력하면 됩니다.", topic: "Trừu tượng", level: "B1" },
  { id: "m9", korean: "발전", vietnamese: "Phát triển", example: "많이 발전했어요.", topic: "Xã hội", level: "B1" },
  { id: "m10", korean: "환경", vietnamese: "Môi trường", example: "환경을 보호해요.", topic: "Xã hội", level: "B1" },
  { id: "m11", korean: "문화", vietnamese: "Văn hóa", example: "한국 문화가 좋아요.", topic: "Xã hội", level: "A2" },
  { id: "m12", korean: "기회", vietnamese: "Cơ hội", example: "좋은 기회예요.", topic: "Trừu tượng", level: "B1" },
  { id: "m13", korean: "변화", vietnamese: "Sự thay đổi", example: "큰 변화가 있었어요.", topic: "Trừu tượng", level: "B1" },
  { id: "m14", korean: "성공", vietnamese: "Thành công", example: "성공하고 싶어요.", topic: "Trừu tượng", level: "A2" },
  { id: "m15", korean: "습관", vietnamese: "Thói quen", example: "좋은 습관을 만들어요.", topic: "Trừu tượng", level: "B1" },
  { id: "m16", korean: "태도", vietnamese: "Thái độ", example: "좋은 태도가 중요해요.", topic: "Trừu tượng", level: "B1" },
  { id: "m17", korean: "이해", vietnamese: "Sự thấu hiểu", example: "이해해 주세요.", topic: "Trừu tượng", level: "A2" },
  { id: "m18", korean: "표현", vietnamese: "Biểu hiện/Diễn đạt", example: "감정을 표현해요.", topic: "Ngôn ngữ", level: "B1" },
  { id: "m19", korean: "추천", vietnamese: "Đề xuất/Giới thiệu", example: "이 책을 추천해요.", topic: "Hoạt động", level: "A2" },
  { id: "m20", korean: "설명", vietnamese: "Giải thích", example: "설명해 주세요.", topic: "Ngôn ngữ", level: "A2" },
];

// ─── AI Suggestion Engine ─────────────────────────────────────────────────────
function getAISuggestions(vocab: VocabCard[], memories: Record<string, CardMemory>) {
  const today = new Date().toISOString().split("T")[0];

  const scored = vocab.map(v => {
    const mem = memories[v.id] || getDefaultMemory(v.id);
    const daysSinceReview = mem.lastReview
      ? Math.floor((Date.now() - new Date(mem.lastReview).getTime()) / 86400000)
      : 999;
    const isDue = mem.nextReview <= today;
    const isNew = mem.totalReviews === 0;
    const accuracy = mem.totalReviews > 0 ? mem.correctCount / mem.totalReviews : 0;
    const forgettingRisk = isDue ? Math.min(100, daysSinceReview * 15) : 0;

    let priority = 0;
    if (isNew) priority = 50;
    else if (isDue) priority = 80 + forgettingRisk;
    else priority = 10;

    // Boost weak cards
    if (accuracy < 0.5 && mem.totalReviews > 2) priority += 30;

    return { vocab: v, memory: mem, priority, isDue, isNew, accuracy, forgettingRisk };
  });

  return scored.sort((a, b) => b.priority - a.priority);
}

// ─── Flashcard Component ──────────────────────────────────────────────────────
function FlashCard({ card, onRate, cardIndex, total }: {
  card: VocabCard;
  onRate: (rating: Rating) => void;
  cardIndex: number;
  total: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleFlip = () => {
    if (!animating) setFlipped(v => !v);
  };

  const handleRate = (r: Rating) => {
    setAnimating(true);
    setTimeout(() => {
      setFlipped(false);
      setAnimating(false);
      onRate(r);
    }, 200);
  };

  const handleTTS = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "ko-KR";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  const ratings: { label: string; value: Rating; color: string; desc: string }[] = [
    { label: "Lại", value: 1, color: "bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25", desc: "Không nhớ" },
    { label: "Khó", value: 2, color: "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25", desc: "Nhớ mờ" },
    { label: "Tốt", value: 3, color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25", desc: "Nhớ được" },
    { label: "Dễ", value: 4, color: "bg-[#e8c84a]/15 border-[#e8c84a]/30 text-[#e8c84a] hover:bg-[#e8c84a]/25", desc: "Rất dễ" },
  ];

  return (
    <div className={`transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}>
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/40 text-sm">{cardIndex + 1} / {total}</span>
        <div className="flex-1 mx-4 h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-[#e8c84a] rounded-full transition-all duration-300"
            style={{ width: `${((cardIndex) / total) * 100}%` }} />
        </div>
        <span className="text-white/40 text-sm">{Math.round((cardIndex / total) * 100)}%</span>
      </div>

      {/* Card */}
      <div onClick={handleFlip}
        className="relative w-full rounded-2xl border border-white/10 bg-white/3 cursor-pointer select-none transition-all hover:border-white/20 mb-5"
        style={{ minHeight: "260px" }}>
        <div className="absolute top-3 right-3 flex gap-2">
          {card.level && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/40 font-bold">{card.level}</span>
          )}
          {card.topic && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/40">{card.topic}</span>
          )}
        </div>

        <div className="flex flex-col items-center justify-center p-8 min-h-[260px]">
          {!flipped ? (
            <div className="text-center">
              <p className="text-white/30 text-xs mb-4 tracking-wider">Tiếng Hàn</p>
              <p className="text-white font-bold text-4xl mb-3">{card.korean}</p>
              <button onClick={e => handleTTS(e, card.korean)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/8 hover:bg-white/15 text-white/50 hover:text-white/80 transition-colors mx-auto">
                <i className="ri-volume-up-line text-lg"></i>
              </button>
              <p className="text-white/25 text-xs mt-6">Nhấn để lật thẻ</p>
            </div>
          ) : (
            <div className="text-center w-full">
              <p className="text-white/30 text-xs mb-4 tracking-wider">Tiếng Việt</p>
              <p className="text-[#e8c84a] font-bold text-3xl mb-3">{card.vietnamese}</p>
              <p className="text-white font-medium text-xl mb-4">{card.korean}</p>
              {card.example && (
                <div className="mt-4 pt-4 border-t border-white/8 w-full">
                  <p className="text-white/50 text-sm italic mb-1">{card.example}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          {ratings.map(r => (
            <button key={r.value} onClick={() => handleRate(r.value)}
              className={`flex flex-col items-center py-3 rounded-xl border text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${r.color}`}>
              <span className="text-base mb-0.5">{r.label}</span>
              <span className="text-[10px] opacity-70">{r.desc}</span>
            </button>
          ))}
        </div>
      )}

      {!flipped && (
        <button onClick={handleFlip}
          className="w-full py-3 rounded-xl bg-white/8 hover:bg-white/12 text-white/60 hover:text-white text-sm font-medium cursor-pointer transition-colors whitespace-nowrap">
          <i className="ri-refresh-line mr-2"></i>Lật thẻ để xem đáp án
        </button>
      )}
    </div>
  );
}

// ─── Stats Panel ──────────────────────────────────────────────────────────────
function StatsPanel({ memories, vocab }: { memories: Record<string, CardMemory>; vocab: VocabCard[] }) {
  const today = new Date().toISOString().split("T")[0];
  const dueCount = vocab.filter(v => (memories[v.id]?.nextReview || today) <= today).length;
  const newCount = vocab.filter(v => !memories[v.id] || memories[v.id].totalReviews === 0).length;
  const learnedCount = vocab.filter(v => memories[v.id]?.repetitions >= 2).length;
  const totalReviews = Object.values(memories).reduce((s, m) => s + m.totalReviews, 0);
  const avgAccuracy = Object.values(memories).filter(m => m.totalReviews > 0)
    .reduce((s, m, _, arr) => s + m.correctCount / m.totalReviews / arr.length, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      {[
        { label: "Cần ôn hôm nay", value: dueCount, color: "#f87171", icon: "ri-alarm-line" },
        { label: "Từ mới", value: newCount, color: "#e8c84a", icon: "ri-add-circle-line" },
        { label: "Đã thuộc", value: learnedCount, color: "#34d399", icon: "ri-checkbox-circle-line" },
        { label: "Tổng lần ôn", value: totalReviews, color: "#a78bfa", icon: "ri-repeat-line" },
        { label: "Độ chính xác", value: `${Math.round(avgAccuracy * 100)}%`, color: "#fbbf24", icon: "ri-percent-line" },
      ].map(s => (
        <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-3 text-center">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg mx-auto mb-1.5" style={{ backgroundColor: `${s.color}20` }}>
            <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
          </div>
          <p className="text-white font-bold text-lg leading-tight">{s.value}</p>
          <p className="text-white/35 text-[10px]">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── AI Insight Panel ─────────────────────────────────────────────────────────
function AIInsightPanel({ suggestions }: { suggestions: ReturnType<typeof getAISuggestions> }) {
  const weakCards = suggestions.filter(s => s.accuracy < 0.5 && s.memory.totalReviews > 2).slice(0, 3);
  const dueCards = suggestions.filter(s => s.isDue && !s.isNew).slice(0, 3);
  const streakCards = suggestions.filter(s => s.memory.streak >= 3).slice(0, 3);

  return (
    <div className="rounded-2xl border border-[#e8c84a]/15 bg-[#e8c84a]/3 p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#e8c84a]/15">
          <i className="ri-robot-2-line text-[#e8c84a] text-sm"></i>
        </div>
        <div>
          <p className="text-[#e8c84a] font-bold text-sm">AI Phân tích học tập</p>
          <p className="text-white/40 text-xs">Dựa trên thuật toán SM-2 và lịch sử ôn tập của bạn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weak cards */}
        <div>
          <p className="text-rose-400 text-xs font-semibold mb-2 flex items-center gap-1">
            <i className="ri-error-warning-line"></i> Từ cần chú ý ({weakCards.length})
          </p>
          {weakCards.length > 0 ? weakCards.map(s => (
            <div key={s.vocab.id} className="flex items-center justify-between py-1.5">
              <span className="text-white/70 text-sm font-medium">{s.vocab.korean}</span>
              <span className="text-rose-400 text-xs">{Math.round(s.accuracy * 100)}% đúng</span>
            </div>
          )) : <p className="text-white/30 text-xs">Chưa có dữ liệu</p>}
        </div>

        {/* Due cards */}
        <div>
          <p className="text-amber-400 text-xs font-semibold mb-2 flex items-center gap-1">
            <i className="ri-time-line"></i> Đến hạn ôn ({dueCards.length})
          </p>
          {dueCards.length > 0 ? dueCards.map(s => (
            <div key={s.vocab.id} className="flex items-center justify-between py-1.5">
              <span className="text-white/70 text-sm font-medium">{s.vocab.korean}</span>
              <span className="text-amber-400 text-xs">{s.memory.interval}d interval</span>
            </div>
          )) : <p className="text-white/30 text-xs">Không có từ đến hạn</p>}
        </div>

        {/* Streak cards */}
        <div>
          <p className="text-emerald-400 text-xs font-semibold mb-2 flex items-center gap-1">
            <i className="ri-fire-line"></i> Đang streak ({streakCards.length})
          </p>
          {streakCards.length > 0 ? streakCards.map(s => (
            <div key={s.vocab.id} className="flex items-center justify-between py-1.5">
              <span className="text-white/70 text-sm font-medium">{s.vocab.korean}</span>
              <span className="text-emerald-400 text-xs">{s.memory.streak}x streak</span>
            </div>
          )) : <p className="text-white/30 text-xs">Chưa có streak</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Session Complete ─────────────────────────────────────────────────────────
function SessionComplete({ results, onRestart }: {
  results: { card: VocabCard; rating: Rating }[];
  onRestart: () => void;
}) {
  const correct = results.filter(r => r.rating >= 3).length;
  const pct = Math.round((correct / results.length) * 100);

  return (
    <div className="text-center py-10">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 ${pct >= 75 ? "bg-emerald-500/15" : pct >= 50 ? "bg-amber-500/15" : "bg-rose-500/15"}`}>
        <i className={`text-4xl ${pct >= 75 ? "ri-trophy-line text-emerald-400" : pct >= 50 ? "ri-thumb-up-line text-amber-400" : "ri-refresh-line text-rose-400"}`}></i>
      </div>
      <h2 className="text-white font-bold text-2xl mb-2">Phiên học hoàn thành!</h2>
      <p className="text-white/50 text-sm mb-6">
        {correct}/{results.length} từ nhớ tốt ({pct}%)
      </p>

      <div className="grid grid-cols-4 gap-3 mb-8 max-w-sm mx-auto">
        {[
          { label: "Lại", count: results.filter(r => r.rating === 1).length, color: "#f87171" },
          { label: "Khó", count: results.filter(r => r.rating === 2).length, color: "#fbbf24" },
          { label: "Tốt", count: results.filter(r => r.rating === 3).length, color: "#34d399" },
          { label: "Dễ", count: results.filter(r => r.rating === 4).length, color: "#e8c84a" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 border border-white/8 bg-white/3">
            <p className="font-bold text-xl" style={{ color: s.color }}>{s.count}</p>
            <p className="text-white/40 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="text-white/40 text-sm mb-6">
        AI đã cập nhật lịch ôn tập cho {results.length} từ. Từ khó sẽ xuất hiện sớm hơn!
      </p>

      <button onClick={onRestart}
        className="px-8 py-3 rounded-xl bg-[#e8c84a] text-[#141720] font-bold text-sm cursor-pointer whitespace-nowrap">
        <i className="ri-refresh-line mr-2"></i>Học tiếp
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AISmartFlashcardPage() {
  const [vocab, setVocab] = useState<VocabCard[]>(mockVocab);
  const [memories, setMemories] = useState<Record<string, CardMemory>>(() => {
    try {
      const saved = localStorage.getItem("kts_ai_flashcard_memories");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [mode, setMode] = useState<"overview" | "session" | "complete">("overview");
  const [sessionCards, setSessionCards] = useState<VocabCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionResults, setSessionResults] = useState<{ card: VocabCard; rating: Rating }[]>([]);
  const [sessionSize, setSessionSize] = useState(10);
  const [filterMode, setFilterMode] = useState<"due" | "new" | "all" | "weak">("due");

  // Load vocab from Supabase
  useEffect(() => {
    supabase.from("topik_vocabulary").select("id, korean, vietnamese, example, topic, level").limit(100)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setVocab(data.map(d => ({
            id: String(d.id),
            korean: d.korean || "",
            vietnamese: d.vietnamese || "",
            example: d.example || "",
            topic: d.topic || "",
            level: d.level || "",
          })));
        }
      });
  }, []);

  // Save memories to localStorage
  useEffect(() => {
    localStorage.setItem("kts_ai_flashcard_memories", JSON.stringify(memories));
  }, [memories]);

  const suggestions = useMemo(() => getAISuggestions(vocab, memories), [vocab, memories]);

  const startSession = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    let pool: VocabCard[];

    if (filterMode === "due") {
      pool = suggestions.filter(s => s.isDue || s.isNew).map(s => s.vocab);
    } else if (filterMode === "new") {
      pool = suggestions.filter(s => s.isNew).map(s => s.vocab);
    } else if (filterMode === "weak") {
      pool = suggestions.filter(s => s.accuracy < 0.6 && s.memory.totalReviews > 0).map(s => s.vocab);
    } else {
      pool = suggestions.map(s => s.vocab);
    }

    if (pool.length === 0) pool = vocab.slice(0, sessionSize);
    const cards = pool.slice(0, sessionSize);
    setSessionCards(cards);
    setCurrentIdx(0);
    setSessionResults([]);
    setMode("session");
  }, [suggestions, filterMode, sessionSize, vocab]);

  const handleRate = useCallback((rating: Rating) => {
    const card = sessionCards[currentIdx];
    const mem = memories[card.id] || getDefaultMemory(card.id);
    const updated = sm2(mem, rating);

    setMemories(prev => ({ ...prev, [card.id]: updated }));
    setSessionResults(prev => [...prev, { card, rating }]);

    if (currentIdx + 1 >= sessionCards.length) {
      setMode("complete");
    } else {
      setCurrentIdx(i => i + 1);
    }
  }, [sessionCards, currentIdx, memories]);

  const dueCount = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return vocab.filter(v => (memories[v.id]?.nextReview || today) <= today).length;
  }, [vocab, memories]);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-white font-bold text-2xl">Flashcard thông minh AI</h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#e8c84a]/15 text-[#e8c84a] font-bold">SM-2</span>
          </div>
          <p className="text-white/50 text-sm">AI gợi ý từ cần ôn dựa trên đường cong quên lãng — học đúng lúc, nhớ lâu hơn</p>
        </div>

        {mode === "overview" && (
          <>
            <StatsPanel memories={memories} vocab={vocab} />
            <AIInsightPanel suggestions={suggestions} />

            {/* Session config */}
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5 mb-5">
              <h3 className="text-white font-bold text-base mb-4">Bắt đầu phiên học</h3>

              {/* Filter mode */}
              <div className="mb-4">
                <p className="text-white/50 text-xs mb-2">Chọn loại từ</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: "due", label: "Đến hạn ôn", icon: "ri-alarm-line", color: "#f87171", count: dueCount },
                    { value: "new", label: "Từ mới", icon: "ri-add-circle-line", color: "#e8c84a", count: vocab.filter(v => !memories[v.id] || memories[v.id].totalReviews === 0).length },
                    { value: "weak", label: "Từ yếu", icon: "ri-error-warning-line", color: "#fbbf24", count: suggestions.filter(s => s.accuracy < 0.6 && s.memory.totalReviews > 0).length },
                    { value: "all", label: "Tất cả", icon: "ri-apps-line", color: "#a78bfa", count: vocab.length },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => setFilterMode(opt.value as typeof filterMode)}
                      className={`flex flex-col items-center py-3 rounded-xl border transition-all cursor-pointer ${filterMode === opt.value ? "border-opacity-50" : "border-white/8 bg-white/3 hover:bg-white/5"}`}
                      style={filterMode === opt.value ? { backgroundColor: `${opt.color}15`, borderColor: `${opt.color}40` } : {}}>
                      <i className={`${opt.icon} text-lg mb-1`} style={{ color: filterMode === opt.value ? opt.color : "rgba(255,255,255,0.3)" }}></i>
                      <span className="text-xs font-semibold" style={{ color: filterMode === opt.value ? opt.color : "rgba(255,255,255,0.5)" }}>{opt.label}</span>
                      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{opt.count} từ</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Session size */}
              <div className="mb-5">
                <p className="text-white/50 text-xs mb-2">Số thẻ mỗi phiên: <span className="text-white font-bold">{sessionSize}</span></p>
                <input type="range" min={5} max={30} step={5} value={sessionSize} onChange={e => setSessionSize(Number(e.target.value))}
                  className="w-full accent-[#e8c84a]" />
                <div className="flex justify-between text-white/25 text-xs mt-1">
                  <span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
                </div>
              </div>

              <button onClick={startSession}
                className="w-full py-3.5 rounded-xl bg-[#e8c84a] text-[#141720] font-bold text-sm cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90">
                <i className="ri-play-circle-line mr-2"></i>
                Bắt đầu học ({Math.min(sessionSize, vocab.length)} thẻ)
              </button>
            </div>

            {/* Card list preview */}
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <h3 className="text-white font-bold text-sm mb-4">
                <i className="ri-list-check mr-2 text-white/40"></i>
                Danh sách từ ưu tiên hôm nay
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {suggestions.slice(0, 15).map((s, i) => (
                  <div key={s.vocab.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <span className="text-white/25 text-xs w-5 text-center">{i + 1}</span>
                    <div className="flex-1">
                      <span className="text-white/80 text-sm font-medium">{s.vocab.korean}</span>
                      <span className="text-white/40 text-xs ml-2">{s.vocab.vietnamese}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.isNew && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#e8c84a]/15 text-[#e8c84a] font-bold">MỚI</span>}
                      {s.isDue && !s.isNew && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-bold">ĐẾN HẠN</span>}
                      {s.memory.totalReviews > 0 && (
                        <span className="text-white/25 text-xs">{Math.round(s.accuracy * 100)}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === "session" && sessionCards.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setMode("overview")}
                className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm cursor-pointer transition-colors">
                <i className="ri-arrow-left-line"></i> Dừng phiên
              </button>
              <span className="text-white/40 text-xs">
                <i className="ri-robot-2-line mr-1 text-[#e8c84a]"></i>
                AI đang theo dõi tiến độ
              </span>
            </div>
            <FlashCard
              card={sessionCards[currentIdx]}
              onRate={handleRate}
              cardIndex={currentIdx}
              total={sessionCards.length}
            />
          </div>
        )}

        {mode === "complete" && (
          <SessionComplete
            results={sessionResults}
            onRestart={() => setMode("overview")}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
