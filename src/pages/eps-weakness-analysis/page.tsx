import { useState, useMemo, useRef, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsQuestions } from "@/mocks/epsQuestions";
import { useNavigate } from "react-router-dom";

// --- Types ----------------------------------------------------------------
interface TopicAnalysis {
  topic: string;
  total: number;
  wrong: number;
  correct: number;
  accuracy: number;
  wrongQuestions: typeof epsQuestions;
  level: "critical" | "weak" | "average" | "strong";
}

interface RoadmapStep {
  order: number;
  topic: string;
  action: string;
  duration: string;
  priority: "high" | "medium" | "low";
  icon: string;
}

// --- Helpers --------------------------------------------------------------
function getLevel(accuracy: number): TopicAnalysis["level"] {
  if (accuracy < 40) return "critical";
  if (accuracy < 60) return "weak";
  if (accuracy < 80) return "average";
  return "strong";
}

function getLevelConfig(level: TopicAnalysis["level"]) {
  switch (level) {
    case "critical": return { label: "R?t y?u", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)", icon: "ri-alarm-warning-line" };
    case "weak": return { label: "Y?u", color: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.2)", icon: "ri-error-warning-line" };
    case "average": return { label: "Trung bình", color: "app-accent-primary", bg: "rgba(232,200,74,0.08)", border: "rgba(232,200,74,0.2)", icon: "ri-subtract-line" };
    case "strong": return { label: "T?t", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)", icon: "ri-checkbox-circle-line" };
  }
}

// --- Stat Card ------------------------------------------------------------
function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 flex items-center justify-center rounded-2xl flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
        <i className={`${icon} text-xl`} style={{ color }}></i>
      </div>
      <div>
        <p className="text-white font-bold text-2xl leading-none">{value}</p>
        <p className="text-white/50 text-xs mt-1">{label}</p>
        {sub && <p className="text-app-text-muted text-[10px] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// --- Topic Bar ------------------------------------------------------------
function TopicBar({ analysis, rank, onClick, isSelected }: {
  analysis: TopicAnalysis; rank: number; onClick: () => void; isSelected: boolean;
}) {
  const cfg = getLevelConfig(analysis.level);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected ? "border-white/20 bg-app-card/50" : "border-app-border bg-app-bg hover:bg-app-surface/50"
      }`}
    >
      <div className="flex items-center gap-3 mb-2.5">
        <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${cfg.color}15` }}>
          <span className="text-[10px] font-bold" style={{ color: cfg.color }}>#{rank}</span>
        </div>
        <p className="text-white/80 text-sm font-medium flex-1 truncate">{analysis.topic}</p>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className={`${cfg.icon} text-xs`} style={{ color: cfg.color }}></i>
          </div>
          <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-app-card/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${analysis.accuracy}%`, backgroundColor: cfg.color }}
          ></div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 text-xs">
          <span className="text-app-text-muted">{analysis.correct}/{analysis.total}</span>
          <span className="font-bold" style={{ color: cfg.color }}>{analysis.accuracy}%</span>
        </div>
      </div>
    </button>
  );
}

// --- Roadmap Card ---------------------------------------------------------
function RoadmapCard({ step }: { step: RoadmapStep }) {
  const priorityColor = step.priority === "high" ? "#f87171" : step.priority === "medium" ? "app-accent-primary" : "#34d399";
  const priorityLabel = step.priority === "high" ? "Uu tiên cao" : step.priority === "medium" ? "Uu tiên TB" : "Uu tiên th?p";
  return (
    <div className="flex items-start gap-4 p-4 bg-app-bg border border-app-border rounded-xl">
      <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${priorityColor}15` }}>
        <i className={`${step.icon} text-sm`} style={{ color: priorityColor }}></i>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-app-text-muted text-[10px] font-bold">Bu?c {step.order}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${priorityColor}15`, color: priorityColor }}>
            {priorityLabel}
          </span>
        </div>
        <p className="text-white/75 text-sm font-medium mb-0.5">{step.topic}</p>
        <p className="text-app-text-secondary text-xs">{step.action}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-app-text-muted text-[10px]">{step.duration}</p>
      </div>
    </div>
  );
}

// --- Share Modal ----------------------------------------------------------
function ShareModal({
  onClose,
  topicAnalysis,
  overallAccuracy,
  totalAnswered,
  criticalTopics,
  strongTopics,
}: {
  onClose: () => void;
  topicAnalysis: TopicAnalysis[];
  overallAccuracy: number;
  totalAnswered: number;
  criticalTopics: TopicAnalysis[];
  strongTopics: TopicAnalysis[];
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const handleShareCommunity = useCallback(() => {
    onClose();
    navigate("/community");
  }, [navigate, onClose]);

  const scoreColor = overallAccuracy >= 70 ? "#34d399" : overallAccuracy >= 50 ? "app-accent-primary" : "#f87171";
  const worstTopics = [...topicAnalysis].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
  const bestTopics = [...topicAnalysis].sort((a, b) => b.accuracy - a.accuracy).slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-app-border">
          <div>
            <p className="text-white font-bold text-base">Chia s? k?t qu? phân tích</p>
            <p className="text-white/35 text-xs mt-0.5">T?o ?nh t?ng k?t d? chia s? lên c?ng d?ng</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-app-card/70 text-app-text-secondary cursor-pointer transition-colors">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Preview card */}
        <div className="p-5">
          <div
            ref={cardRef}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1a1600 0%, #0f1117 50%, #0a0d14 100%)",
              border: "1px solid rgba(232,200,74,0.2)",
            }}
          >
            {/* Card header */}
            <div className="px-5 pt-5 pb-4 border-b border-app-border">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="https://public.readdy.ai/ai/img_res/e4aac832-9a5b-4b61-8ca3-dd8be9f9e28b.png"
                  alt="logo"
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <div>
                  <p className="text-white font-bold text-sm">Hàn Qu?c Oi!</p>
                  <p className="text-white/35 text-[10px]">Phân tích di?m y?u EPS-TOPIK</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-bold text-2xl" style={{ color: scoreColor }}>{overallAccuracy}%</p>
                  <p className="text-app-text-muted text-[9px]">Ð? chính xác</p>
                </div>
              </div>

              {/* Overall bar */}
              <div className="h-2 bg-app-card/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${overallAccuracy}%`, backgroundColor: scoreColor }}></div>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[9px] text-app-text-muted">
                <span>{totalAnswered} câu dã làm</span>
                <span>{topicAnalysis.length} ch? d?</span>
              </div>
            </div>

            {/* Weak topics */}
            <div className="px-5 py-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-[#f87171] text-[10px] font-semibold mb-2 flex items-center gap-1">
                    <i className="ri-alarm-warning-line"></i> C?n ôn g?p ({criticalTopics.length})
                  </p>
                  <div className="space-y-1.5">
                    {worstTopics.map(t => (
                      <div key={t.topic} className="flex items-center justify-between">
                        <span className="text-white/50 text-[10px] truncate flex-1 mr-2">{t.topic}</span>
                        <span className="text-[#f87171] text-[10px] font-bold flex-shrink-0">{t.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[#34d399] text-[10px] font-semibold mb-2 flex items-center gap-1">
                    <i className="ri-checkbox-circle-line"></i> Ch? d? m?nh ({strongTopics.length})
                  </p>
                  <div className="space-y-1.5">
                    {bestTopics.map(t => (
                      <div key={t.topic} className="flex items-center justify-between">
                        <span className="text-white/50 text-[10px] truncate flex-1 mr-2">{t.topic}</span>
                        <span className="text-[#34d399] text-[10px] font-bold flex-shrink-0">{t.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Level distribution mini */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["critical", "weak", "average", "strong"] as const).map(level => {
                  const cfg = getLevelConfig(level);
                  const count = topicAnalysis.filter(t => t.level === level).length;
                  if (count === 0) return null;
                  return (
                    <div key={level} className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: `${cfg.color}15` }}>
                      <div className="w-3 h-3 flex items-center justify-center">
                        <i className={`${cfg.icon} text-[9px]`} style={{ color: cfg.color }}></i>
                      </div>
                      <span className="text-[9px] font-semibold" style={{ color: cfg.color }}>{cfg.label}: {count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-4 flex items-center justify-between">
              <p className="text-app-text-muted text-[9px]">hanquocoi.com · EPS-TOPIK Analyzer</p>
              <p className="text-app-accent-primary/40 text-[9px]">{new Date().toLocaleDateString("vi-VN")}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 space-y-2">
          <button
            onClick={handleShareCommunity}
            className="w-full py-3 bg-app-accent-primary text-app-bg font-bold text-sm rounded-xl cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            <i className="ri-group-line"></i>
            Chia s? lên C?ng d?ng
          </button>
          <button
            onClick={handleCopyLink}
            className="w-full py-3 bg-app-card/50 hover:bg-white/8 text-white/60 text-sm rounded-xl cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 transition-colors"
          >
            <i className={copied ? "ri-check-line text-[#34d399]" : "ri-link"}></i>
            <span className={copied ? "text-[#34d399]" : ""}>{copied ? "Ðã sao chép link!" : "Sao chép link trang"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ------------------------------------------------------------
export default function EpsWeaknessAnalysisPage() {
  const navigate = useNavigate();
  const [epsAnswers] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "roadmap" | "detail">("overview");
  const [sortBy, setSortBy] = useState<"accuracy" | "wrong" | "total">("accuracy");
  const [showShare, setShowShare] = useState(false);

  // --- Phân tích theo ch? d? ---------------------------------------------
  const topicAnalysis = useMemo((): TopicAnalysis[] => {
    const topicMap: Record<string, { total: number; wrong: number; correct: number; wrongQs: typeof epsQuestions }> = {};

    epsQuestions.forEach(q => {
      const topic = q.topic || "Chua phân lo?i";
      if (!topicMap[topic]) topicMap[topic] = { total: 0, wrong: 0, correct: 0, wrongQs: [] };
      topicMap[topic].total++;

      if (q.id in epsAnswers) {
        const userAns = epsAnswers[q.id];
        if (userAns === q.correctIndex) {
          topicMap[topic].correct++;
        } else {
          topicMap[topic].wrong++;
          topicMap[topic].wrongQs.push(q);
        }
      }
    });

    return Object.entries(topicMap)
      .filter(([, v]) => v.total > 0)
      .map(([topic, v]) => {
        const answered = v.correct + v.wrong;
        const accuracy = answered > 0 ? Math.round((v.correct / answered) * 100) : 100;
        return {
          topic,
          total: v.total,
          wrong: v.wrong,
          correct: v.correct,
          accuracy,
          wrongQuestions: v.wrongQs,
          level: getLevel(accuracy),
        };
      })
      .sort((a, b) => {
        if (sortBy === "accuracy") return a.accuracy - b.accuracy;
        if (sortBy === "wrong") return b.wrong - a.wrong;
        return b.total - a.total;
      });
  }, [epsAnswers, sortBy]);

  // --- T?ng quan --------------------------------------------------------
  const totalAnswered = useMemo(() => Object.keys(epsAnswers).length, [epsAnswers]);
  const totalCorrect = useMemo(() => {
    return Object.entries(epsAnswers).filter(([id, ans]) => {
      const q = epsQuestions.find(q => q.id === id);
      return q && ans === q.correctIndex;
    }).length;
  }, [epsAnswers]);
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const criticalTopics = topicAnalysis.filter(t => t.level === "critical" || t.level === "weak");
  const strongTopics = topicAnalysis.filter(t => t.level === "strong");

  // --- L? trình cá nhân hóa ---------------------------------------------
  const roadmap = useMemo((): RoadmapStep[] => {
    const steps: RoadmapStep[] = [];
    let order = 1;

    // Uu tiên ch? d? r?t y?u
    criticalTopics.slice(0, 3).forEach(t => {
      steps.push({
        order: order++,
        topic: t.topic,
        action: t.level === "critical"
          ? `Ôn l?i toàn b? t? v?ng và ${t.wrong} câu sai — b?t d?u t? flashcard co b?n`
          : `Luy?n l?i ${t.wrong} câu sai, t?p trung vào t? khóa quan tr?ng`,
        duration: t.level === "critical" ? "3–5 ngày" : "2–3 ngày",
        priority: t.level === "critical" ? "high" : "medium",
        icon: t.level === "critical" ? "ri-alarm-warning-line" : "ri-error-warning-line",
      });
    });

    // Thêm bu?c ôn SR
    if (criticalTopics.length > 0) {
      steps.push({
        order: order++,
        topic: "Spaced Repetition",
        action: "Thêm t?t c? câu sai vào hàng d?i SR d? ôn l?i theo thu?t toán SM-2",
        duration: "Hàng ngày",
        priority: "high",
        icon: "ri-brain-line",
      });
    }

    // Ch? d? trung bình
    topicAnalysis.filter(t => t.level === "average").slice(0, 2).forEach(t => {
      steps.push({
        order: order++,
        topic: t.topic,
        action: `Làm thêm bài t?p ch? d? này, m?c tiêu d?t 80%+ d? chính xác`,
        duration: "1–2 ngày",
        priority: "medium",
        icon: "ri-focus-3-line",
      });
    });

    // Thi th?
    steps.push({
      order: order++,
      topic: "Thi th? EPS t?ng h?p",
      action: "Làm bài thi th? 40 câu d? ki?m tra ti?n d? sau khi ôn t?p",
      duration: "1 ngày",
      priority: "medium",
      icon: "ri-file-list-3-line",
    });

    // Duy trì ch? d? m?nh
    if (strongTopics.length > 0) {
      steps.push({
        order: order++,
        topic: "Duy trì ch? d? m?nh",
        action: `${strongTopics.map(t => t.topic).slice(0, 3).join(", ")} — ôn nh? 1 l?n/tu?n d? không quên`,
        duration: "1 l?n/tu?n",
        priority: "low",
        icon: "ri-checkbox-circle-line",
      });
    }

    return steps;
  }, [criticalTopics, topicAnalysis, strongTopics]);

  const selectedAnalysis = topicAnalysis.find(t => t.topic === selectedTopic);

  return (
    <DashboardLayout
      title="Phân tích di?m y?u EPS"
      subtitle="Phân tích ch? d? có t? l? sai cao và d? xu?t l? trình ôn t?p cá nhân hóa"
    >
      {showShare && (
        <ShareModal
          onClose={() => setShowShare(false)}
          topicAnalysis={topicAnalysis}
          overallAccuracy={overallAccuracy}
          totalAnswered={totalAnswered}
          criticalTopics={criticalTopics}
          strongTopics={strongTopics}
        />
      )}
      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon="ri-question-answer-line" label="Câu dã làm" value={totalAnswered} sub={`/ ${epsQuestions.length} câu`} color="app-accent-primary" />
        <StatCard icon="ri-percent-line" label="Ð? chính xác t?ng" value={`${overallAccuracy}%`} sub={`${totalCorrect} câu dúng`} color={overallAccuracy >= 70 ? "#34d399" : overallAccuracy >= 50 ? "app-accent-primary" : "#f87171"} />
        <StatCard icon="ri-alarm-warning-line" label="Ch? d? c?n ôn" value={criticalTopics.length} sub="y?u + r?t y?u" color="#f87171" />
        <StatCard icon="ri-trophy-line" label="Ch? d? t?t" value={strongTopics.length} sub="trên 80% chính xác" color="#34d399" />
      </div>

      {/* Tabs + Share button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center bg-app-card/50 rounded-xl p-1 w-fit">
          {(["overview", "roadmap", "detail"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/70"
              }`}
            >
              {tab === "overview" ? "T?ng quan" : tab === "roadmap" ? "L? trình ôn t?p" : "Chi ti?t câu sai"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowShare(true)}
          className="flex items-center gap-2 px-4 py-2 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 border border-app-accent-primary/20 text-app-accent-primary text-sm font-medium rounded-xl cursor-pointer whitespace-nowrap transition-colors"
        >
          <i className="ri-share-line"></i>
          Chia s? k?t qu?
        </button>
      </div>

      {/* -- Tab: T?ng quan -- */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left: Topic list */}
          <div>
            {/* Sort controls */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/60 text-sm font-semibold">
                {topicAnalysis.length} ch? d?
                {totalAnswered === 0 && <span className="text-app-text-muted font-normal ml-2">— Hãy làm bài thi EPS d? có d? li?u phân tích</span>}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-app-text-muted text-xs">S?p x?p:</span>
                {(["accuracy", "wrong", "total"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                      sortBy === s ? "bg-app-accent-primary/15 text-app-accent-primary" : "text-app-text-muted hover:text-white/60"
                    }`}
                  >
                    {s === "accuracy" ? "Ð? chính xác" : s === "wrong" ? "S? câu sai" : "T?ng câu"}
                  </button>
                ))}
              </div>
            </div>

            {topicAnalysis.length === 0 ? (
              <div className="bg-app-bg border border-app-border rounded-2xl p-12 text-center">
                <i className="ri-bar-chart-grouped-line text-white/10 text-5xl mb-4 block"></i>
                <p className="text-app-text-secondary text-base font-medium mb-2">Chua có d? li?u phân tích</p>
                <p className="text-app-text-muted text-sm mb-6">Hãy làm bài thi EPS d? h? th?ng phân tích di?m y?u c?a b?n</p>
                <button
                  onClick={() => navigate("/eps")}
                  className="px-6 py-3 bg-app-accent-primary text-app-bg font-bold text-sm rounded-xl cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-play-line mr-2"></i>B?t d?u luy?n thi EPS
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {topicAnalysis.map((t, i) => (
                  <TopicBar
                    key={t.topic}
                    analysis={t}
                    rank={i + 1}
                    onClick={() => { setSelectedTopic(t.topic); setActiveTab("detail"); }}
                    isSelected={selectedTopic === t.topic}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="space-y-4">
            {/* Level distribution */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <p className="text-white font-semibold text-sm mb-4">Phân b? trình d?</p>
              {(["critical", "weak", "average", "strong"] as const).map(level => {
                const cfg = getLevelConfig(level);
                const count = topicAnalysis.filter(t => t.level === level).length;
                const pct = topicAnalysis.length > 0 ? Math.round((count / topicAnalysis.length) * 100) : 0;
                return (
                  <div key={level} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 flex items-center justify-center">
                          <i className={`${cfg.icon} text-[10px]`} style={{ color: cfg.color }}></i>
                        </div>
                        <span className="text-xs" style={{ color: cfg.color }}>{cfg.label}</span>
                      </div>
                      <span className="text-app-text-muted text-xs">{count} ch? d? ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cfg.color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Worst topics */}
            {criticalTopics.length > 0 && (
              <div className="bg-app-bg border border-app-border rounded-2xl p-5">
                <p className="text-white font-semibold text-sm mb-3">
                  <i className="ri-alarm-warning-line text-[#f87171] mr-1.5"></i>
                  C?n ôn g?p
                </p>
                <div className="space-y-2">
                  {criticalTopics.slice(0, 5).map(t => {
                    const cfg = getLevelConfig(t.level);
                    return (
                      <button
                        key={t.topic}
                        onClick={() => { setSelectedTopic(t.topic); setActiveTab("detail"); }}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-app-surface/50 transition-colors cursor-pointer text-left"
                      >
                        <span className="text-white/60 text-xs truncate flex-1">{t.topic}</span>
                        <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color: cfg.color }}>{t.accuracy}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <p className="text-white font-semibold text-sm mb-3">Hành d?ng nhanh</p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/eps-spaced-review")}
                  className="w-full flex items-center gap-2.5 p-3 bg-app-surface/50 hover:bg-white/6 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#a78bfa]/10 flex-shrink-0">
                    <i className="ri-brain-line text-[#a78bfa] text-sm"></i>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium">Ôn t?p Spaced Repetition</p>
                    <p className="text-app-text-muted text-[10px]">Thêm câu sai vào SR queue</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/eps-topic-drill")}
                  className="w-full flex items-center gap-2.5 p-3 bg-app-surface/50 hover:bg-white/6 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-accent-primary/10 flex-shrink-0">
                    <i className="ri-focus-3-line text-app-accent-primary text-sm"></i>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium">Luy?n theo ch? d?</p>
                    <p className="text-app-text-muted text-[10px]">T?p trung vào ch? d? y?u</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/eps-exam")}
                  className="w-full flex items-center gap-2.5 p-3 bg-app-surface/50 hover:bg-white/6 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#34d399]/10 flex-shrink-0">
                    <i className="ri-timer-line text-[#34d399] text-sm"></i>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium">Thi th? EPS 40 câu</p>
                    <p className="text-app-text-muted text-[10px]">Ki?m tra ti?n d? t?ng th?</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -- Tab: L? trình -- */}
      {activeTab === "roadmap" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div>
            <div className="bg-app-bg border border-app-border rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-app-accent-primary/10">
                  <i className="ri-route-line text-app-accent-primary"></i>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">L? trình ôn t?p cá nhân hóa</p>
                  <p className="text-white/35 text-xs">D?a trên phân tích {totalAnswered} câu dã làm c?a b?n</p>
                </div>
              </div>

              {roadmap.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-route-line text-white/10 text-4xl mb-3 block"></i>
                  <p className="text-white/35 text-sm">Chua có d? d? li?u d? t?o l? trình</p>
                  <p className="text-app-text-muted text-xs mt-1">Hãy làm ít nh?t 20 câu EPS d? nh?n l? trình cá nhân hóa</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {roadmap.map(step => <RoadmapCard key={step.order} step={step} />)}
                </div>
              )}
            </div>

            {/* Estimated time */}
            {roadmap.length > 0 && (
              <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-time-line text-app-accent-primary"></i>
                  <p className="text-white font-semibold text-sm">U?c tính th?i gian hoàn thành</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Ôn ch? d? y?u", value: `${criticalTopics.length * 3}–${criticalTopics.length * 5} ngày`, color: "#f87171" },
                    { label: "Luy?n t?ng h?p", value: "3–5 ngày", color: "app-accent-primary" },
                    { label: "T?ng c?ng", value: `${criticalTopics.length * 3 + 3}–${criticalTopics.length * 5 + 5} ngày`, color: "#34d399" },
                  ].map(s => (
                    <div key={s.label} className="text-center p-3 bg-app-surface/50 rounded-xl">
                      <p className="font-bold text-sm mb-1" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-white/35 text-[10px]">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Tips */}
          <div className="space-y-4">
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <p className="text-white font-semibold text-sm mb-3">M?o h?c hi?u qu?</p>
              <div className="space-y-3">
                {[
                  { icon: "ri-time-line", color: "app-accent-primary", tip: "H?c 15–20 phút m?i ngày hi?u qu? hon h?c 2 ti?ng 1 l?n/tu?n" },
                  { icon: "ri-brain-line", color: "#a78bfa", tip: "Dùng Spaced Repetition d? ôn câu sai — não nh? lâu hon 5x" },
                  { icon: "ri-focus-3-line", color: "#34d399", tip: "T?p trung vào 1–2 ch? d? y?u nh?t tru?c, d?ng h?c dàn tr?i" },
                  { icon: "ri-headphone-line", color: "#38bdf8", tip: "Nghe TTS phát âm khi h?c flashcard d? nh? t? nhanh hon" },
                  { icon: "ri-repeat-line", color: "#fb923c", tip: "Ôn l?i câu sai ngay sau khi làm bài — d?ng d? qua ngày hôm sau" },
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className={`${t.icon} text-sm`} style={{ color: t.color }}></i>
                    </div>
                    <p className="text-white/45 text-xs leading-relaxed">{t.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <p className="text-white font-semibold text-sm mb-3">M?c tiêu EPS-TOPIK</p>
              <div className="space-y-2.5">
                {[
                  { label: "Ði?m d?u t?i thi?u", value: "80/200", color: "app-accent-primary" },
                  { label: "Ð? chính xác c?n d?t", value: "= 70%", color: "#34d399" },
                  { label: "S? câu dúng t?i thi?u", value: "32/40 câu", color: "#38bdf8" },
                  { label: "Th?i gian làm bài", value: "70 phút", color: "#a78bfa" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-app-text-secondary text-xs">{s.label}</span>
                    <span className="font-bold text-sm" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -- Tab: Chi ti?t câu sai -- */}
      {activeTab === "detail" && (
        <div className="grid grid-cols-[260px_1fr] gap-6">
          {/* Left: Topic selector */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 h-fit">
            <p className="text-app-text-secondary text-xs font-semibold tracking-normal mb-3">Ch?n ch? d?</p>
            <div className="space-y-1">
              {topicAnalysis.map(t => {
                const cfg = getLevelConfig(t.level);
                return (
                  <button
                    key={t.topic}
                    onClick={() => setSelectedTopic(t.topic)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all cursor-pointer ${
                      selectedTopic === t.topic ? "bg-white/8 text-white" : "text-white/45 hover:text-white/70 hover:bg-app-surface/50"
                    }`}
                  >
                    <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                      <i className={`${cfg.icon} text-[10px]`} style={{ color: cfg.color }}></i>
                    </div>
                    <span className="text-xs flex-1 truncate">{t.topic}</span>
                    <span className="text-[10px] font-bold flex-shrink-0" style={{ color: cfg.color }}>{t.accuracy}%</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Wrong questions */}
          <div>
            {!selectedAnalysis ? (
              <div className="bg-app-bg border border-app-border rounded-2xl p-12 text-center">
                <i className="ri-cursor-line text-white/10 text-4xl mb-3 block"></i>
                <p className="text-white/35 text-sm">Ch?n m?t ch? d? d? xem chi ti?t câu sai</p>
              </div>
            ) : (
              <div>
                {/* Topic header */}
                <div className="bg-app-bg border border-app-border rounded-2xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-white font-bold text-base">{selectedAnalysis.topic}</h3>
                      <p className="text-white/35 text-xs mt-0.5">
                        {selectedAnalysis.correct} dúng / {selectedAnalysis.wrong} sai / {selectedAnalysis.total} câu trong ngân hàng
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-2xl" style={{ color: getLevelConfig(selectedAnalysis.level).color }}>
                        {selectedAnalysis.accuracy}%
                      </p>
                      <p className="text-xs" style={{ color: getLevelConfig(selectedAnalysis.level).color }}>
                        {getLevelConfig(selectedAnalysis.level).label}
                      </p>
                    </div>
                  </div>
                  <div className="h-2 bg-app-card/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${selectedAnalysis.accuracy}%`, backgroundColor: getLevelConfig(selectedAnalysis.level).color }}
                    ></div>
                  </div>
                </div>

                {/* Wrong questions list */}
                {selectedAnalysis.wrongQuestions.length === 0 ? (
                  <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
                    <i className="ri-checkbox-circle-line text-[#34d399] text-4xl mb-3 block"></i>
                    <p className="text-white/60 text-sm font-medium">Không có câu sai trong ch? d? này!</p>
                    <p className="text-app-text-muted text-xs mt-1">B?n dang làm r?t t?t ? ch? d? này</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-app-text-secondary text-xs font-semibold tracking-normal">
                      {selectedAnalysis.wrongQuestions.length} câu dã làm sai
                    </p>
                    {selectedAnalysis.wrongQuestions.map((q, i) => {
                      const userAns = epsAnswers[q.id];
                      return (
                        <div key={q.id} className="bg-app-bg border border-app-border rounded-2xl p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#f87171]/10 flex-shrink-0 mt-0.5">
                              <span className="text-[#f87171] text-[10px] font-bold">{i + 1}</span>
                            </div>
                            <p className="text-white/80 text-sm leading-relaxed flex-1">{q.question}</p>
                          </div>

                          <div className="space-y-2 mb-3">
                            {q.options.map((opt, idx) => {
                              const isCorrect = idx === q.correctIndex;
                              const isUserWrong = idx === userAns && !isCorrect;
                              return (
                                <div
                                  key={idx}
                                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${
                                    isCorrect ? "bg-[#34d399]/10 border border-[#34d399]/20" :
                                    isUserWrong ? "bg-[#f87171]/10 border border-[#f87171]/20" :
                                    "bg-app-surface/50 border border-transparent"
                                  }`}
                                >
                                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                                    {isCorrect ? <i className="ri-checkbox-circle-fill text-[#34d399] text-sm"></i> :
                                     isUserWrong ? <i className="ri-close-circle-fill text-[#f87171] text-sm"></i> :
                                     <span className="text-app-text-muted text-[10px]">{String.fromCharCode(65 + idx)}</span>}
                                  </div>
                                  <span className={isCorrect ? "text-[#34d399]" : isUserWrong ? "text-[#f87171]" : "text-white/45"}>
                                    {opt}
                                  </span>
                                  {isCorrect && <span className="ml-auto text-[#34d399] text-[10px] font-semibold">Ðáp án dúng</span>}
                                  {isUserWrong && <span className="ml-auto text-[#f87171] text-[10px] font-semibold">B?n ch?n</span>}
                                </div>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <div className="bg-app-accent-primary/5 border border-app-accent-primary/10 rounded-lg px-3 py-2">
                              <p className="text-app-accent-primary/70 text-[10px] font-semibold mb-1">Gi?i thích:</p>
                              <p className="text-white/50 text-xs leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}



