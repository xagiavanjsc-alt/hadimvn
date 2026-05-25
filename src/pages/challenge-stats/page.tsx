import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";

interface ChallengeSession {
  id: string;
  createdAt: string;
  creatorName: string;
  topic: string;
  questionCount: number;
  questions: string[];
  myScore?: number;
  myTime?: number;
  opponentScore?: number;
  opponentName?: string;
  opponentTime?: number;
  status: "waiting" | "completed";
}

const TOPIC_LABELS: Record<string, string> = {
  all: "Tất cả", greeting: "Chào hỏi", workplace: "Nơi làm việc",
  safety: "An toàn", law: "Pháp luật", daily: "Sinh hoạt",
  culture: "Văn hóa", emergency: "Khẩn cấp", listening: "Nghe hiểu", reading: "Đọc hiểu",
};

const TOPIC_COLORS: Record<string, string> = {
  greeting: "#34d399", workplace: "#e8c84a", safety: "#f87171",
  law: "#a78bfa", daily: "#fb923c", culture: "#38bdf8",
  emergency: "#f43f5e", listening: "#06b6d4", reading: "#84cc16",
};

// Mock data for demo
const MOCK_CHALLENGES: ChallengeSession[] = [
  { id: "1", createdAt: "2026-04-14T10:00:00Z", creatorName: "Bạn", topic: "workplace", questionCount: 10, questions: [], myScore: 9, myTime: 145, opponentScore: 7, opponentName: "Nguyễn Lan", opponentTime: 180, status: "completed" },
  { id: "2", createdAt: "2026-04-13T15:30:00Z", creatorName: "Bạn", topic: "safety", questionCount: 10, questions: [], myScore: 6, myTime: 200, opponentScore: 8, opponentName: "Trần Minh", opponentTime: 160, status: "completed" },
  { id: "3", createdAt: "2026-04-12T09:00:00Z", creatorName: "Bạn", topic: "greeting", questionCount: 5, questions: [], myScore: 5, myTime: 90, opponentScore: 5, opponentName: "Lê Hoa", opponentTime: 95, status: "completed" },
  { id: "4", createdAt: "2026-04-11T14:00:00Z", creatorName: "Bạn", topic: "law", questionCount: 15, questions: [], myScore: 12, myTime: 280, opponentScore: 10, opponentName: "Phạm Bảo", opponentTime: 310, status: "completed" },
  { id: "5", createdAt: "2026-04-10T11:00:00Z", creatorName: "Bạn", topic: "daily", questionCount: 10, questions: [], myScore: 7, myTime: 170, opponentScore: 9, opponentName: "Hoàng Mai", opponentTime: 155, status: "completed" },
  { id: "6", createdAt: "2026-04-09T16:00:00Z", creatorName: "Bạn", topic: "workplace", questionCount: 10, questions: [], myScore: 10, myTime: 130, opponentScore: 8, opponentName: "Vũ Thành", opponentTime: 175, status: "completed" },
  { id: "7", createdAt: "2026-04-08T10:30:00Z", creatorName: "Bạn", topic: "safety", questionCount: 10, questions: [], myScore: 8, myTime: 160, opponentScore: 6, opponentName: "Đặng Linh", opponentTime: 190, status: "completed" },
];

function WeeklyChart({ data }: { data: { week: string; wins: number; losses: number; draws: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.wins + d.losses + d.draws), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => {
        const total = d.wins + d.losses + d.draws;
        const winH = total > 0 ? (d.wins / maxVal) * 100 : 0;
        const lossH = total > 0 ? (d.losses / maxVal) * 100 : 0;
        const drawH = total > 0 ? (d.draws / maxVal) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: "100px" }}>
              {winH > 0 && <div className="w-full rounded-sm bg-emerald-500/60" style={{ height: `${winH}%` }}></div>}
              {drawH > 0 && <div className="w-full rounded-sm bg-app-accent-primary/60" style={{ height: `${drawH}%` }}></div>}
              {lossH > 0 && <div className="w-full rounded-sm bg-red-500/40" style={{ height: `${lossH}%` }}></div>}
            </div>
            <span className="text-app-text-muted text-[9px]">{d.week}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ChallengeStatsPage() {
  const navigate = useNavigate();
  const [savedChallenges] = useLocalStorage<ChallengeSession[]>("kts_friend_challenges", []);
  const [activeTab, setActiveTab] = useState<"overview" | "topics" | "history">("overview");

  // Merge mock + real data
  const allChallenges = useMemo(() => {
    const real = savedChallenges.filter(c => c.status === "completed" && c.myScore !== undefined);
    return real.length > 0 ? real : MOCK_CHALLENGES;
  }, [savedChallenges]);

  const completed = allChallenges.filter(c => c.status === "completed" && c.myScore !== undefined && c.opponentScore !== undefined);

  const stats = useMemo(() => {
    const wins = completed.filter(c => c.myScore! > c.opponentScore!).length;
    const losses = completed.filter(c => c.myScore! < c.opponentScore!).length;
    const draws = completed.filter(c => c.myScore! === c.opponentScore!).length;
    const total = completed.length;
    const avgScore = total > 0
      ? Math.round(completed.reduce((s, c) => s + (c.myScore! / c.questionCount) * 100, 0) / total)
      : 0;
    const avgTime = total > 0
      ? Math.round(completed.reduce((s, c) => s + (c.myTime || 0), 0) / total)
      : 0;
    const bestScore = total > 0
      ? Math.max(...completed.map(c => Math.round((c.myScore! / c.questionCount) * 100)))
      : 0;

    // Win streak
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    for (const c of [...completed].reverse()) {
      if (c.myScore! > c.opponentScore!) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    // Current streak (from most recent)
    for (const c of completed) {
      if (c.myScore! > c.opponentScore!) currentStreak++;
      else break;
    }

    return { wins, losses, draws, total, avgScore, avgTime, bestScore, currentStreak, maxStreak };
  }, [completed]);

  // Topic breakdown
  const topicStats = useMemo(() => {
    const topics: Record<string, { wins: number; losses: number; draws: number; total: number; avgScore: number }> = {};
    completed.forEach(c => {
      if (!topics[c.topic]) topics[c.topic] = { wins: 0, losses: 0, draws: 0, total: 0, avgScore: 0 };
      topics[c.topic].total++;
      const score = Math.round((c.myScore! / c.questionCount) * 100);
      topics[c.topic].avgScore = Math.round((topics[c.topic].avgScore * (topics[c.topic].total - 1) + score) / topics[c.topic].total);
      if (c.myScore! > c.opponentScore!) topics[c.topic].wins++;
      else if (c.myScore! < c.opponentScore!) topics[c.topic].losses++;
      else topics[c.topic].draws++;
    });
    return Object.entries(topics).map(([topic, data]) => ({
      topic,
      label: TOPIC_LABELS[topic] || topic,
      color: TOPIC_COLORS[topic] || "#e8c84a",
      ...data,
      winRate: data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0,
    })).sort((a, b) => b.winRate - a.winRate);
  }, [completed]);

  // Weekly data (last 8 weeks)
  const weeklyData = useMemo(() => {
    const weeks: { week: string; wins: number; losses: number; draws: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekChallenges = completed.filter(c => {
        const date = new Date(c.createdAt);
        return date >= weekStart && date <= weekEnd;
      });

      weeks.push({
        week: `T${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        wins: weekChallenges.filter(c => c.myScore! > c.opponentScore!).length,
        losses: weekChallenges.filter(c => c.myScore! < c.opponentScore!).length,
        draws: weekChallenges.filter(c => c.myScore! === c.opponentScore!).length,
      });
    }
    return weeks;
  }, [completed]);

  const strongestTopic = topicStats[0];
  const weakestTopic = topicStats[topicStats.length - 1];

  return (
    <DashboardLayout
      title="Thống kê thách đấu cá nhân"
      subtitle="Phân tích chi tiết kết quả thách đấu — chủ đề mạnh/yếu, xu hướng theo tuần"
      actions={
        <button
          onClick={() => navigate("/challenge")}
          className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-sword-line"></i>Tạo thách đấu mới
        </button>
      }
    >
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng trận", value: stats.total, icon: "ri-gamepad-line", color: "#e8c84a" },
          { label: "Tỷ lệ thắng", value: `${stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0}%`, icon: "ri-trophy-line", color: "#34d399" },
          { label: "Điểm TB", value: `${stats.avgScore}%`, icon: "ri-bar-chart-line", color: "#a78bfa" },
          { label: "Streak hiện tại", value: stats.currentStreak, icon: "ri-fire-line", color: "#fb923c" },
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

      {/* Tabs */}
      <div className="flex gap-1 bg-app-surface/50 p-1 rounded-xl mb-6 w-fit">
        {(["overview", "topics", "history"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}
          >
            {tab === "overview" ? "Tổng quan" : tab === "topics" ? "Theo chủ đề" : "Lịch sử"}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-5">
            {/* Win/Loss/Draw donut */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <p className="text-white font-semibold text-sm mb-5">Kết quả tổng hợp</p>
              <div className="flex items-center gap-8">
                {/* Visual bar */}
                <div className="flex-1">
                  <div className="flex h-8 rounded-xl overflow-hidden gap-0.5">
                    {stats.total > 0 ? (
                      <>
                        <div className="bg-emerald-500/60 flex items-center justify-center text-xs font-bold text-white" style={{ width: `${(stats.wins / stats.total) * 100}%` }}>
                          {stats.wins > 0 && stats.wins}
                        </div>
                        <div className="bg-app-accent-primary/60 flex items-center justify-center text-xs font-bold text-app-bg" style={{ width: `${(stats.draws / stats.total) * 100}%` }}>
                          {stats.draws > 0 && stats.draws}
                        </div>
                        <div className="bg-red-500/40 flex items-center justify-center text-xs font-bold text-white" style={{ width: `${(stats.losses / stats.total) * 100}%` }}>
                          {stats.losses > 0 && stats.losses}
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 bg-app-card/50 flex items-center justify-center text-app-text-muted text-xs">Chưa có trận nào</div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></div><span className="text-white/50 text-xs">Thắng ({stats.wins})</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-app-accent-primary/60"></div><span className="text-white/50 text-xs">Hòa ({stats.draws})</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div><span className="text-white/50 text-xs">Thua ({stats.losses})</span></div>
                  </div>
                </div>
                {/* Big number */}
                <div className="text-center flex-shrink-0">
                  <p className="text-app-accent-success font-bold text-4xl">{stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0}%</p>
                  <p className="text-app-text-muted text-xs mt-1">Tỷ lệ thắng</p>
                </div>
              </div>
            </div>

            {/* Weekly chart */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <p className="text-white font-semibold text-sm mb-4">Thắng/Thua theo tuần (8 tuần gần nhất)</p>
              <WeeklyChart data={weeklyData} />
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60"></div><span className="text-app-text-secondary text-xs">Thắng</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-app-accent-primary/60"></div><span className="text-app-text-secondary text-xs">Hòa</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-500/40"></div><span className="text-app-text-secondary text-xs">Thua</span></div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Personal records */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <p className="text-white font-semibold text-sm mb-4">Kỷ lục cá nhân</p>
              <div className="space-y-3">
                {[
                  { label: "Điểm cao nhất", value: `${stats.bestScore}%`, icon: "ri-trophy-line", color: "#e8c84a" },
                  { label: "Streak thắng dài nhất", value: `${stats.maxStreak} trận`, icon: "ri-fire-fill", color: "#fb923c" },
                  { label: "Thời gian TB", value: `${Math.floor(stats.avgTime / 60)}:${String(stats.avgTime % 60).padStart(2, "0")}`, icon: "ri-time-line", color: "#38bdf8" },
                  { label: "Tổng trận đã chơi", value: stats.total, icon: "ri-gamepad-line", color: "#a78bfa" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                        <i className={`${item.icon} text-xs`} style={{ color: item.color }}></i>
                      </div>
                      <span className="text-app-text-secondary text-xs">{item.label}</span>
                    </div>
                    <span className="text-white font-bold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strong/Weak topics */}
            {strongestTopic && (
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                <p className="text-app-accent-success text-xs font-semibold mb-2">Chủ đề mạnh nhất</p>
                <p className="text-white font-bold text-base">{strongestTopic.label}</p>
                <p className="text-app-text-secondary text-xs mt-1">{strongestTopic.winRate}% tỷ lệ thắng · {strongestTopic.total} trận</p>
              </div>
            )}
            {weakestTopic && weakestTopic.topic !== strongestTopic?.topic && (
              <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                <p className="text-red-400 text-xs font-semibold mb-2">Chủ đề cần cải thiện</p>
                <p className="text-white font-bold text-base">{weakestTopic.label}</p>
                <p className="text-app-text-secondary text-xs mt-1">{weakestTopic.winRate}% tỷ lệ thắng · {weakestTopic.total} trận</p>
                <button
                  onClick={() => navigate("/eps-topic-drill")}
                  className="mt-2 text-[10px] text-red-400 hover:text-red-300 cursor-pointer whitespace-nowrap"
                >
                  Luyện tập chủ đề này →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Topics tab */}
      {activeTab === "topics" && (
        <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-app-border flex items-center gap-4 text-[10px] text-app-text-muted font-semibold tracking-normal">
            <span className="flex-1">Chủ đề</span>
            <span className="w-16 text-center">Trận</span>
            <span className="w-16 text-center">Thắng</span>
            <span className="w-16 text-center">Thua</span>
            <span className="w-20 text-center">Tỷ lệ thắng</span>
            <span className="w-20 text-center">Điểm TB</span>
          </div>
          {topicStats.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-bar-chart-line text-white/10 text-3xl mb-2 block"></i>
              <p className="text-app-text-muted text-sm">Chưa có dữ liệu thách đấu</p>
            </div>
          ) : (
            <div className="divide-y divide-white/3">
              {topicStats.map((t, i) => (
                <div key={t.topic} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${t.color}15` }}>
                      <span className="text-xs font-bold" style={{ color: t.color }}>#{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm font-semibold">{t.label}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {t.winRate >= 70 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-app-accent-success/15 text-app-accent-success font-bold">Mạnh</span>}
                        {t.winRate < 40 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 font-bold">Cần cải thiện</span>}
                      </div>
                    </div>
                  </div>
                  <span className="w-16 text-center text-white/50 text-sm">{t.total}</span>
                  <span className="w-16 text-center text-app-accent-success font-bold text-sm">{t.wins}</span>
                  <span className="w-16 text-center text-red-400/70 text-sm">{t.losses}</span>
                  <div className="w-20 text-center">
                    <span className={`text-sm font-bold ${t.winRate >= 60 ? "text-app-accent-success" : t.winRate >= 40 ? "text-app-accent-primary" : "text-red-400"}`}>
                      {t.winRate}%
                    </span>
                    <div className="h-1 bg-app-card/50 rounded-full overflow-hidden mt-1">
                      <div className="h-full rounded-full" style={{ width: `${t.winRate}%`, backgroundColor: t.color }} />
                    </div>
                  </div>
                  <span className="w-20 text-center text-white/50 text-sm">{t.avgScore}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {completed.length === 0 ? (
            <div className="text-center py-16 bg-app-bg border border-app-border rounded-2xl">
              <i className="ri-history-line text-white/10 text-3xl mb-2 block"></i>
              <p className="text-app-text-muted text-sm">Chưa có lịch sử thách đấu</p>
              <button onClick={() => navigate("/challenge")} className="mt-3 text-app-accent-primary text-xs cursor-pointer">Tạo thách đấu ngay →</button>
            </div>
          ) : (
            completed.map((c, i) => {
              const myPct = Math.round((c.myScore! / c.questionCount) * 100);
              const oppPct = Math.round((c.opponentScore! / c.questionCount) * 100);
              const result = c.myScore! > c.opponentScore! ? "win" : c.myScore! < c.opponentScore! ? "loss" : "draw";
              const resultColor = result === "win" ? "#34d399" : result === "loss" ? "#f87171" : "#e8c84a";
              const resultLabel = result === "win" ? "Thắng" : result === "loss" ? "Thua" : "Hòa";
              const topicColor = TOPIC_COLORS[c.topic] || "#e8c84a";

              return (
                <div key={c.id || i} className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${resultColor}15` }}>
                    <i className={`${result === "win" ? "ri-trophy-line" : result === "loss" ? "ri-close-circle-line" : "ri-scales-3-line"} text-xl`} style={{ color: resultColor }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${resultColor}15`, color: resultColor }}>{resultLabel}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${topicColor}10`, color: topicColor }}>
                        {TOPIC_LABELS[c.topic] || c.topic}
                      </span>
                      <span className="text-app-text-muted text-[10px]">{c.questionCount} câu</span>
                    </div>
                    <p className="text-white/50 text-xs">vs. {c.opponentName || "Đối thủ"}</p>
                    <p className="text-app-text-muted text-[10px] mt-0.5">{new Date(c.createdAt).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm">{myPct}% <span className="text-app-text-muted">vs</span> {oppPct}%</p>
                    <p className="text-app-text-muted text-[10px]">{c.myScore}/{c.questionCount} đúng</p>
                    {c.myTime && <p className="text-app-text-muted text-[10px]">{Math.floor(c.myTime / 60)}:{String(c.myTime % 60).padStart(2, "0")} phút</p>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </DashboardLayout>
  );
}


