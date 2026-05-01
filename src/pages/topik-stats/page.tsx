import { useState, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { vocabularyData, VOCAB_CATEGORIES } from "@/mocks/vocabularyData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface SpacedCard {
  id: string;
  nextReview: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
  lastDifficulty?: string;
}

interface FlashcardSession {
  cards: SpacedCard[];
  lastUpdated: number;
}

interface QuizHistory {
  date: string;
  score: number;
  total: number;
  level: string;
  topic: string;
  quiz_type?: string;
}

interface CloudQuizHistory {
  id: string;
  quiz_type: string;
  level: string;
  topic: string;
  score: number;
  total: number;
  created_at: string;
}

const LEVELS = [
  { id: "A1", label: "A1 - Sơ cấp 1", color: "#34d399", desc: "Giao tiếp cơ bản hàng ngày" },
  { id: "A2", label: "A2 - Sơ cấp 2", color: "#38bdf8", desc: "Tình huống quen thuộc" },
  { id: "B1", label: "B1 - Trung cấp 1", color: "#fb923c", desc: "Chủ đề phổ biến, công việc" },
  { id: "B2", label: "B2 - Trung cấp 2", color: "#f87171", desc: "Văn bản phức tạp, trừu tượng" },
];

function RadialProgress({ value, color, size = 80 }: { value: number; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

export default function TopikStatsPage() {
  const { user } = useAuth();
  const [spacedData] = useLocalStorage<FlashcardSession>("topik_spaced_v1", { cards: [], lastUpdated: Date.now() });
  const [localQuizHistory] = useLocalStorage<QuizHistory[]>("topik_quiz_history", []);
  const [cloudHistory, setCloudHistory] = useState<CloudQuizHistory[]>([]);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "levels" | "categories" | "history">("overview");
  const [animated, setAnimated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Load cloud quiz history when user is logged in
  useEffect(() => {
    if (!user) return;
    setLoadingCloud(true);
    supabase
      .from("topik_quiz_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) setCloudHistory(data as CloudQuizHistory[]);
        setLoadingCloud(false);
      });
  }, [user]);

  // Merge local + cloud history (deduplicate by date+score+total)
  const quizHistory: QuizHistory[] = user
    ? cloudHistory.map((c) => ({
        date: c.created_at,
        score: c.score,
        total: c.total,
        level: c.level,
        topic: c.topic || "Tổng hợp",
        quiz_type: c.quiz_type,
      }))
    : localQuizHistory;

  const syncLocalToCloud = async () => {
    if (!user || localQuizHistory.length === 0) return;
    setSyncStatus("syncing");
    try {
      const rows = localQuizHistory.map((q) => ({
        user_id: user.id,
        quiz_type: q.quiz_type || "vocab",
        level: q.level,
        topic: q.topic,
        score: q.score,
        total: q.total,
        created_at: q.date,
      }));
      await supabase.from("topik_quiz_history").upsert(rows, { onConflict: "user_id,created_at" });
      setSyncStatus("done");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (err) {
      console.error("Sync error:", err);
      setSyncStatus("error");
    }
  };

  // Compute stats per level
  const levelStats = LEVELS.map((lv) => {
    const words = vocabularyData.filter((w) => w.topikLevel === lv.id);
    const total = words.length;
    const studied = words.filter((w) => spacedData.cards.find((c) => c.id === w.id && c.repetitions > 0)).length;
    const mastered = words.filter((w) => spacedData.cards.find((c) => c.id === w.id && c.repetitions >= 3)).length;
    const due = words.filter((w) => {
      const cd = spacedData.cards.find((c) => c.id === w.id);
      return cd && cd.nextReview <= Date.now();
    }).length;
    const studiedPct = total > 0 ? Math.round((studied / total) * 100) : 0;
    const masteredPct = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { ...lv, total, studied, mastered, due, studiedPct, masteredPct };
  });

  // Category stats
  const categoryStats = VOCAB_CATEGORIES.map((cat) => {
    const words = vocabularyData.filter((w) => w.category === cat.id);
    const total = words.length;
    const mastered = words.filter((w) => spacedData.cards.find((c) => c.id === w.id && c.repetitions >= 3)).length;
    const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { ...cat, total, mastered, pct };
  }).sort((a, b) => b.pct - a.pct);

  // Overall stats
  const totalWords = vocabularyData.length;
  const totalStudied = vocabularyData.filter((w) => spacedData.cards.find((c) => c.id === w.id && c.repetitions > 0)).length;
  const totalMastered = vocabularyData.filter((w) => spacedData.cards.find((c) => c.id === w.id && c.repetitions >= 3)).length;
  const totalDue = vocabularyData.filter((w) => {
    const cd = spacedData.cards.find((c) => c.id === w.id);
    return cd && cd.nextReview <= Date.now();
  }).length;
  const overallPct = totalWords > 0 ? Math.round((totalMastered / totalWords) * 100) : 0;

  // Quiz stats
  const avgScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((s, q) => s + (q.score / q.total) * 100, 0) / quizHistory.length)
    : 0;
  const bestScore = quizHistory.length > 0
    ? Math.max(...quizHistory.map((q) => Math.round((q.score / q.total) * 100)))
    : 0;

  // Streak from spaced data
  const studyDays = new Set(
    spacedData.cards
      .filter((c) => c.repetitions > 0)
      .map((c) => new Date(c.nextReview - c.interval * 86400000).toDateString())
  ).size;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Thống kê TOPIK</h1>
            <p className="text-white/40 text-sm">Theo dõi tiến độ học từ vựng TOPIK I/II theo cấp độ A1–B2</p>
          </div>
          {user && (
            <button
              onClick={syncLocalToCloud}
              disabled={syncStatus === "syncing"}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <i className={`ri-cloud-line text-sm ${syncStatus === "syncing" ? "animate-pulse text-[#e8c84a]" : syncStatus === "done" ? "text-[#34d399]" : ""}`}></i>
              {syncStatus === "syncing" ? "Đang đồng bộ..." : syncStatus === "done" ? "Đã đồng bộ!" : "Đồng bộ lên cloud"}
            </button>
          )}
        </div>

        {/* Top KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Tổng từ vựng", value: totalWords, icon: "ri-book-2-line", color: "#e8c84a" },
            { label: "Đã học", value: totalStudied, icon: "ri-eye-line", color: "#38bdf8" },
            { label: "Đã thuộc", value: totalMastered, icon: "ri-check-double-line", color: "#34d399" },
            { label: "Cần ôn hôm nay", value: totalDue, icon: "ri-alarm-line", color: "#fb923c" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white/3 border border-white/8 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${kpi.color}20` }}>
                  <i className={`${kpi.icon} text-sm`} style={{ color: kpi.color }}></i>
                </div>
                <p className="text-white/40 text-xs">{kpi.label}</p>
              </div>
              <p className="text-2xl font-bold text-white">{kpi.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/3 border border-white/8 rounded-xl p-1 mb-6 w-fit">
          {(["overview", "levels", "categories", "history"] as const).map((tab) => {
            const labels = { overview: "Tổng quan", levels: "Theo cấp độ", categories: "Theo chủ đề", history: "Lịch sử quiz" };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab ? "bg-[#e8c84a]/15 text-[#e8c84a]" : "text-white/40 hover:text-white/70"
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Big radial + level breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Overall progress */}
              <div className="bg-white/3 border border-white/8 rounded-2xl p-6 flex flex-col items-center justify-center">
                <p className="text-white/50 text-sm mb-4">Tiến độ tổng thể</p>
                <div className="relative">
                  <RadialProgress value={animated ? overallPct : 0} color="#e8c84a" size={140} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-white">{overallPct}%</p>
                    <p className="text-white/30 text-xs">đã thuộc</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 w-full">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#34d399]">{totalMastered}</p>
                    <p className="text-white/30 text-xs">Đã thuộc</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white/50">{totalWords - totalMastered}</p>
                    <p className="text-white/30 text-xs">Chưa thuộc</p>
                  </div>
                </div>
              </div>

              {/* Level mini cards */}
              <div className="space-y-3">
                {levelStats.map((lv) => (
                  <div key={lv.id} className="bg-white/3 border border-white/8 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: `${lv.color}20`, color: lv.color }}>
                          {lv.id}
                        </span>
                        <span className="text-white/50 text-xs">{lv.total} từ</span>
                      </div>
                      <span className="text-white/60 text-sm font-bold">{lv.masteredPct}%</span>
                    </div>
                    <div className="h-2 bg-white/6 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: animated ? `${lv.masteredPct}%` : "0%", backgroundColor: lv.color }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-white/25 text-xs">{lv.mastered} đã thuộc</span>
                      {lv.due > 0 && (
                        <span className="text-[#fb923c] text-xs">{lv.due} cần ôn</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz summary */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <p className="text-white/60 text-sm font-medium mb-4">Kết quả Quiz</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#e8c84a]">{quizHistory.length}</p>
                  <p className="text-white/30 text-xs">Bài đã làm</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#34d399]">{avgScore}%</p>
                  <p className="text-white/30 text-xs">Điểm trung bình</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#38bdf8]">{bestScore}%</p>
                  <p className="text-white/30 text-xs">Điểm cao nhất</p>
                </div>
              </div>
            </div>

            {/* Study activity */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <p className="text-white/60 text-sm font-medium mb-4">Hoạt động học tập</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#e8c84a]">{spacedData.cards.length}</p>
                  <p className="text-white/30 text-xs">Thẻ đã xem</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#34d399]">{studyDays}</p>
                  <p className="text-white/30 text-xs">Ngày học</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#fb923c]">{totalDue}</p>
                  <p className="text-white/30 text-xs">Cần ôn hôm nay</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Levels tab */}
        {activeTab === "levels" && (
          <div className="space-y-4">
            {levelStats.map((lv) => (
              <div key={lv.id} className="bg-white/3 border border-white/8 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 rounded-lg text-sm font-bold" style={{ backgroundColor: `${lv.color}20`, color: lv.color }}>
                        {lv.id}
                      </span>
                      <span className="text-white/70 text-sm font-medium">{lv.label.split(" - ")[1]}</span>
                    </div>
                    <p className="text-white/30 text-xs">{lv.desc}</p>
                  </div>
                  <div className="relative flex-shrink-0">
                    <RadialProgress value={animated ? lv.masteredPct : 0} color={lv.color} size={70} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-sm font-bold" style={{ color: lv.color }}>{lv.masteredPct}%</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Tổng từ", value: lv.total, color: "text-white" },
                    { label: "Đã học", value: lv.studied, color: "text-[#38bdf8]" },
                    { label: "Đã thuộc", value: lv.mastered, color: "text-[#34d399]" },
                    { label: "Cần ôn", value: lv.due, color: "text-[#fb923c]" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/3 rounded-xl p-3 text-center">
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-white/30 text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress bars */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/40">Đã học</span>
                      <span className="text-[#38bdf8]">{lv.studiedPct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                      <div className="h-full bg-[#38bdf8] rounded-full transition-all duration-1000" style={{ width: animated ? `${lv.studiedPct}%` : "0%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/40">Đã thuộc</span>
                      <span className="text-[#34d399]">{lv.masteredPct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                      <div className="h-full bg-[#34d399] rounded-full transition-all duration-1000" style={{ width: animated ? `${lv.masteredPct}%` : "0%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories tab */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryStats.map((cat) => (
              <div key={cat.id} className="bg-white/3 border border-white/8 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${cat.color}20` }}>
                    <i className={`${cat.icon} text-sm`} style={{ color: cat.color }}></i>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">{cat.label}</p>
                    <p className="text-white/30 text-xs">{cat.total} từ</p>
                  </div>
                  <span className="ml-auto text-sm font-bold" style={{ color: cat.color }}>{cat.pct}%</span>
                </div>
                <div className="h-2 bg-white/6 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: animated ? `${cat.pct}%` : "0%", backgroundColor: cat.color }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-white/25 text-xs">{cat.mastered} đã thuộc</span>
                  <span className="text-white/25 text-xs">{cat.total - cat.mastered} còn lại</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History tab */}
        {activeTab === "history" && (
          <div>
            {/* Cloud sync banner */}
            {!user && (
              <div className="mb-4 p-3 bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl flex items-center gap-3">
                <i className="ri-cloud-off-line text-[#e8c84a]/60 text-sm"></i>
                <p className="text-[#e8c84a]/60 text-xs">Đăng nhập để lưu lịch sử quiz lên cloud và xem trên mọi thiết bị</p>
              </div>
            )}
            {user && loadingCloud && (
              <div className="mb-4 p-3 bg-white/3 border border-white/8 rounded-xl flex items-center gap-3">
                <i className="ri-loader-4-line text-white/30 text-sm animate-spin"></i>
                <p className="text-white/30 text-xs">Đang tải lịch sử từ cloud...</p>
              </div>
            )}
            {quizHistory.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-history-line text-white/20 text-2xl"></i>
                </div>
                <p className="text-white/30 text-sm">Chưa có lịch sử quiz</p>
                <p className="text-white/20 text-xs mt-1">Làm bài quiz TOPIK để xem kết quả ở đây</p>
              </div>
            ) : (
              <div className="space-y-2">
                {quizHistory.map((q, i) => {
                  const pct = Math.round((q.score / q.total) * 100);
                  const color = pct >= 80 ? "#34d399" : pct >= 60 ? "#e8c84a" : "#f87171";
                  const typeLabel = q.quiz_type === "reading" ? "Đọc hiểu" : q.quiz_type === "listening" ? "Nghe" : "Từ vựng";
                  return (
                    <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                        <p className="text-sm font-bold" style={{ color }}>{pct}%</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white/70 text-sm font-medium">{q.topic || "Tổng hợp"}</p>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/8 text-white/30">{typeLabel}</span>
                        </div>
                        <p className="text-white/30 text-xs">{q.level} · {q.score}/{q.total} câu đúng</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-white/20 text-xs">{new Date(q.date).toLocaleDateString("vi-VN")}</p>
                        {user && <i className="ri-cloud-fill text-[#34d399]/40 text-xs mt-0.5 block"></i>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


