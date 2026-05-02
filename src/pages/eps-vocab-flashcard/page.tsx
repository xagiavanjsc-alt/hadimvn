import { useState, useMemo, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsVocabulary, EPS_VOCAB_TOPICS, type EpsVocabItem } from "@/mocks/epsVocabulary";
import { useXPSystem } from "@/hooks/useXPSystem";

// ─── Topic filter for new topics ─────────────────────────────────────────────
const FEATURED_TOPICS = [
  { id: "health", label: "Y tế & Sức khỏe", icon: "ri-heart-pulse-line", color: "#f43f5e", desc: "Từ vựng khám bệnh, thuốc, triệu chứng" },
  { id: "transport", label: "Giao thông & Di chuyển", icon: "ri-bus-line", color: "#22d3ee", desc: "Tàu điện ngầm, xe buýt, taxi, đường phố" },
  { id: "housing", label: "Nhà ở & Sinh sống", icon: "ri-home-4-line", color: "#84cc16", desc: "Thuê nhà, hóa đơn, hàng xóm, khu phố" },
  { id: "safety", label: "An toàn lao động", icon: "ri-shield-check-line", color: "#fb923c", desc: "Thiết bị bảo hộ, quy trình an toàn" },
  { id: "workplace", label: "Nơi làm việc", icon: "ri-briefcase-line", color: "#38bdf8", desc: "Văn phòng, nhà máy, đồng nghiệp" },
  { id: "daily", label: "Sinh hoạt hàng ngày", icon: "ri-home-smile-line", color: "app-accent-primary", desc: "Mua sắm, ăn uống, giải trí" },
  { id: "law", label: "Pháp luật lao động", icon: "ri-scales-3-line", color: "#f59e0b", desc: "Hợp đồng, lương, quyền lợi" },
  { id: "greeting", label: "Giao tiếp cơ bản", icon: "ri-chat-smile-2-line", color: "#34d399", desc: "Chào hỏi, xã giao, điện thoại" },
  { id: "culture", label: "Văn hóa Hàn Quốc", icon: "ri-building-2-line", color: "#a78bfa", desc: "Phong tục, lễ hội, ẩm thực" },
];

type FlashcardMode = "front" | "back";
type StudyMode = "flashcard" | "quiz" | "match";

// ─── Flashcard Component ──────────────────────────────────────────────────────
function Flashcard({
  item,
  flipped,
  onFlip,
  onKnow,
  onDontKnow,
  current,
  total,
}: {
  item: EpsVocabItem;
  flipped: boolean;
  onFlip: () => void;
  onKnow: () => void;
  onDontKnow: () => void;
  current: number;
  total: number;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-app-accent-primary rounded-full transition-all duration-300" style={{ width: `${(current / total) * 100}%` }}></div>
        </div>
        <span className="text-app-text-muted text-xs whitespace-nowrap">{current}/{total}</span>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-lg cursor-pointer select-none"
        style={{ perspective: "1000px" }}
        onClick={onFlip}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "220px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border border-app-border flex flex-col items-center justify-center p-8 bg-app-bg"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-app-text-muted text-xs mb-4 tracking-normal">Tiếng Hàn</p>
            <p className="text-white text-5xl font-bold mb-3">{item.korean}</p>
            <p className="text-app-text-secondary text-lg">[{item.reading}]</p>
            <p className="text-app-text-muted text-xs mt-6">Nhấn để lật thẻ</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl border border-app-accent-primary/20 flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", backgroundColor: "#1a1600" }}
          >
            <p className="text-app-accent-primary/40 text-xs mb-4 tracking-normal">Tiếng Việt</p>
            <p className="text-white text-3xl font-bold mb-4 text-center">{item.vietnamese}</p>
            <div className="bg-app-card/50 rounded-xl px-4 py-3 text-center max-w-sm">
              <p className="text-white/60 text-sm">{item.example}</p>
              <p className="text-app-text-muted text-xs mt-1 italic">{item.exampleVi}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 w-full max-w-lg">
        <button
          onClick={onDontKnow}
          className="flex-1 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
        >
          <i className="ri-close-line text-lg"></i>Chưa nhớ
        </button>
        <button
          onClick={onKnow}
          className="flex-1 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-app-accent-success text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-emerald-500/10 transition-colors flex items-center justify-center gap-2"
        >
          <i className="ri-check-line text-lg"></i>Đã nhớ
        </button>
      </div>
    </div>
  );
}

// ─── Quiz Mode ────────────────────────────────────────────────────────────────
function QuizMode({
  items,
  onFinish,
}: {
  items: EpsVocabItem[];
  onFinish: (score: number, total: number) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const current = items[currentIdx];

  const options = useMemo(() => {
    const wrong = epsVocabulary
      .filter(v => v.id !== current.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(v => v.vietnamese);
    const all = [...wrong, current.vietnamese].sort(() => Math.random() - 0.5);
    return all;
  }, [currentIdx]);

  const correctIdx = options.indexOf(current.vietnamese);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === correctIdx) setScore(s => s + 1);
    setTimeout(() => {
      if (currentIdx + 1 >= items.length) {
        onFinish(score + (idx === correctIdx ? 1 : 0), items.length);
      } else {
        setCurrentIdx(i => i + 1);
        setSelected(null);
      }
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <span className="text-app-text-muted text-sm">{currentIdx + 1}/{items.length}</span>
        <span className="text-app-accent-primary text-sm font-bold">{score} đúng</span>
      </div>
      <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
        <p className="text-app-text-muted text-xs mb-3">Nghĩa tiếng Việt của từ này là gì?</p>
        <p className="text-white text-4xl font-bold mb-2">{current.korean}</p>
        <p className="text-app-text-secondary text-lg">[{current.reading}]</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, i) => {
          let cls = "bg-app-surface/50 border-app-border text-white/70 hover:bg-white/8";
          if (selected !== null) {
            if (i === correctIdx) cls = "bg-app-accent-success/15 border-emerald-500/30 text-app-accent-success";
            else if (i === selected && selected !== correctIdx) cls = "bg-red-500/15 border-red-500/30 text-red-400";
            else cls = "bg-app-surface/50 border-app-border text-app-text-muted";
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`p-3 rounded-xl border text-sm font-medium cursor-pointer whitespace-nowrap transition-all ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({
  score,
  total,
  knownCount,
  unknownCount,
  onRestart,
  onReviewUnknown,
}: {
  score: number;
  total: number;
  knownCount: number;
  unknownCount: number;
  onRestart: () => void;
  onReviewUnknown: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  return (
    <div className="flex flex-col items-center gap-6 py-8 max-w-md mx-auto text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: pct >= 80 ? "#34d39915" : "app-accent-primary15" }}>
        <i className={`text-4xl ${pct >= 80 ? "ri-trophy-fill text-[#34d399]" : "ri-refresh-line text-app-accent-primary"}`}></i>
      </div>
      <div>
        <p className="text-white text-3xl font-bold">{pct}%</p>
        <p className="text-app-text-secondary text-sm mt-1">{score}/{total} câu đúng</p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
          <p className="text-app-accent-success text-2xl font-bold">{knownCount}</p>
          <p className="text-app-text-secondary text-xs mt-1">Đã nhớ</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
          <p className="text-red-400 text-2xl font-bold">{unknownCount}</p>
          <p className="text-app-text-secondary text-xs mt-1">Chưa nhớ</p>
        </div>
      </div>
      <div className="flex gap-3 w-full">
        {unknownCount > 0 && (
          <button onClick={onReviewUnknown} className="flex-1 py-3 rounded-xl border border-app-accent-primary/20 bg-app-accent-primary/5 text-app-accent-primary text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-app-accent-primary/10 transition-colors">
            <i className="ri-refresh-line mr-2"></i>Ôn từ chưa nhớ ({unknownCount})
          </button>
        )}
        <button onClick={onRestart} className="flex-1 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-sm font-bold cursor-pointer whitespace-nowrap transition-colors">
          <i className="ri-restart-line mr-2"></i>Học lại
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EpsVocabFlashcardPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState<StudyMode>("flashcard");
  const [isStudying, setIsStudying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [unknownIds, setUnknownIds] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [progress, setProgress] = useLocalStorage<Record<string, number>>("kts_vocab_topic_progress", {});
  const { awardXP } = useXPSystem();

  const topicItems = useMemo(() => {
    if (!selectedTopic) return [];
    return epsVocabulary.filter(v => v.topicId === selectedTopic);
  }, [selectedTopic]);

  const studyItems = useMemo(() => {
    if (reviewMode) return topicItems.filter(v => unknownIds.has(v.id));
    return topicItems;
  }, [topicItems, reviewMode, unknownIds]);

  const currentItem = studyItems[currentIdx];

  const handleStartStudy = (topic: string, mode: StudyMode) => {
    setSelectedTopic(topic);
    setStudyMode(mode);
    setIsStudying(true);
    setCurrentIdx(0);
    setFlipped(false);
    setKnownIds(new Set());
    setUnknownIds(new Set());
    setShowResult(false);
    setReviewMode(false);
  };

  const handleKnow = useCallback(() => {
    if (!currentItem) return;
    const isNewWord = !knownIds.has(currentItem.id);
    setKnownIds(prev => new Set([...prev, currentItem.id]));
    setFlipped(false);
    // Award XP for each new word learned
    if (isNewWord) {
      awardXP({ type: "flashcard_learned" });
    }
    if (currentIdx + 1 >= studyItems.length) {
      setShowResult(true);
      if (selectedTopic) {
        setProgress(prev => ({ ...prev, [selectedTopic]: Math.round((knownIds.size + 1) / topicItems.length * 100) }));
      }
    } else {
      setCurrentIdx(i => i + 1);
    }
  }, [currentItem, currentIdx, studyItems.length, knownIds, topicItems.length, selectedTopic, awardXP]);

  const handleDontKnow = useCallback(() => {
    if (!currentItem) return;
    setUnknownIds(prev => new Set([...prev, currentItem.id]));
    setFlipped(false);
    if (currentIdx + 1 >= studyItems.length) {
      setShowResult(true);
    } else {
      setCurrentIdx(i => i + 1);
    }
  }, [currentItem, currentIdx, studyItems.length]);

  const handleReviewUnknown = () => {
    setReviewMode(true);
    setCurrentIdx(0);
    setFlipped(false);
    setKnownIds(new Set());
    setShowResult(false);
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setFlipped(false);
    setKnownIds(new Set());
    setUnknownIds(new Set());
    setShowResult(false);
    setReviewMode(false);
  };

  const handleBack = () => {
    setIsStudying(false);
    setSelectedTopic(null);
    setShowResult(false);
    setReviewMode(false);
  };

  // Topic selection screen
  if (!isStudying) {
    return (
      <DashboardLayout
        title="Flashcard từ vựng EPS theo chủ đề"
        subtitle="Học từ vựng theo từng chủ đề với flashcard lật thẻ và quiz"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURED_TOPICS.map(topic => {
                const items = epsVocabulary.filter(v => v.topicId === topic.id);
                const topicProgress = progress[topic.id] || 0;
                const topicInfo = EPS_VOCAB_TOPICS.find(t => t.id === topic.id);
                return (
                  <div key={topic.id} className="bg-app-bg border border-app-border rounded-2xl p-5 hover:border-app-border transition-all group">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${topic.color}15` }}>
                        <i className={`${topic.icon} text-xl`} style={{ color: topic.color }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm leading-tight">{topic.label}</p>
                        <p className="text-app-text-muted text-[10px] mt-0.5">{items.length} từ vựng</p>
                      </div>
                    </div>
                    <p className="text-app-text-secondary text-xs mb-4 leading-relaxed">{topic.desc}</p>

                    {topicProgress > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-app-text-muted text-[10px]">Tiến độ</span>
                          <span className="text-[10px] font-bold" style={{ color: topic.color }}>{topicProgress}%</span>
                        </div>
                        <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${topicProgress}%`, backgroundColor: topic.color }}></div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartStudy(topic.id, "flashcard")}
                        className="flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all border"
                        style={{ backgroundColor: `${topic.color}10`, color: topic.color, borderColor: `${topic.color}25` }}
                      >
                        <i className="ri-stack-line mr-1"></i>Flashcard
                      </button>
                      <button
                        onClick={() => handleStartStudy(topic.id, "quiz")}
                        className="flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all bg-app-card/50 text-white/50 border border-app-border hover:text-white/70"
                      >
                        <i className="ri-survey-line mr-1"></i>Quiz
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4"><i className="ri-bar-chart-line text-app-accent-primary mr-2"></i>Thống kê học tập</h3>
              <div className="space-y-3">
                {[
                  { label: "Tổng từ vựng EPS", value: epsVocabulary.length, color: "app-accent-primary" },
                  { label: "Chủ đề có sẵn", value: FEATURED_TOPICS.length, color: "#34d399" },
                  { label: "Chủ đề đã học", value: Object.keys(progress).filter(k => progress[k] > 0).length, color: "#60a5fa" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-app-text-secondary text-xs">{s.label}</span>
                    <span className="font-bold text-sm" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3"><i className="ri-lightbulb-line text-app-accent-primary mr-2"></i>Mẹo học flashcard</h3>
              <div className="space-y-2.5 text-app-text-secondary text-xs leading-relaxed">
                <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Nhấn vào thẻ để lật và xem nghĩa</p>
                <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Chọn "Đã nhớ" hoặc "Chưa nhớ" để phân loại</p>
                <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Ôn lại từ chưa nhớ sau khi hoàn thành</p>
                <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Dùng Quiz để kiểm tra sau khi học flashcard</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-focus-3-line text-app-accent-primary"></i>
                <p className="text-white font-semibold text-sm">Chủ đề ưu tiên EPS</p>
              </div>
              <p className="text-app-text-secondary text-xs leading-relaxed">
                Tập trung vào <strong className="text-white/60">Y tế</strong>, <strong className="text-white/60">Giao thông</strong> và <strong className="text-white/60">Nhà ở</strong> — 3 chủ đề mới được bổ sung cho kỳ thi EPS-TOPIK gần đây.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Study screen
  const topicInfo = FEATURED_TOPICS.find(t => t.id === selectedTopic);

  return (
    <DashboardLayout
      title={topicInfo?.label || "Flashcard"}
      subtitle={`${studyItems.length} từ vựng · ${studyMode === "flashcard" ? "Chế độ Flashcard" : "Chế độ Quiz"}`}
      actions={
        <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-app-border text-white/50 text-sm cursor-pointer whitespace-nowrap hover:bg-app-card/50 transition-colors">
          <i className="ri-arrow-left-line"></i>Chọn chủ đề khác
        </button>
      }
    >
      <div className="max-w-2xl mx-auto">
        {showResult ? (
          <ResultScreen
            score={quizScore || knownIds.size}
            total={studyItems.length}
            knownCount={knownIds.size}
            unknownCount={unknownIds.size}
            onRestart={handleRestart}
            onReviewUnknown={handleReviewUnknown}
          />
        ) : studyMode === "flashcard" && currentItem ? (
          <Flashcard
            item={currentItem}
            flipped={flipped}
            onFlip={() => setFlipped(v => !v)}
            onKnow={handleKnow}
            onDontKnow={handleDontKnow}
            current={currentIdx + 1}
            total={studyItems.length}
          />
        ) : studyMode === "quiz" ? (
          <QuizMode
            items={studyItems}
            onFinish={(score, total) => {
              setQuizScore(score);
              setShowResult(true);
            }}
          />
        ) : null}
      </div>
    </DashboardLayout>
  );
}

