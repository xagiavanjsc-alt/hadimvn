import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WeekRecord {
  weekKey: string;
  weekLabel: string;
  completedCount: number;
  totalCount: number;
  xpEarned: number;
  bonusClaimed: boolean;
  completedIds: string[];
}

// ─── Challenge metadata (same as weekly-challenge page) ───────────────────────
const CHALLENGE_META: Record<string, { title: string; icon: string; color: string; xpReward: number }> = {
  flash_50:    { title: "Flashcard Marathon",    icon: "ri-stack-line",      color: "#e8c84a", xpReward: 100 },
  exam_3:      { title: "Chiến binh EPS",        icon: "ri-timer-line",      color: "#34d399", xpReward: 150 },
  streak_7:    { title: "Không bỏ ngày nào",     icon: "ri-fire-line",       color: "#fb923c", xpReward: 200 },
  drill_5:     { title: "Luyện chủ đề EPS",      icon: "ri-focus-3-line",    color: "#06b6d4", xpReward: 120 },
  community_3: { title: "Chia sẻ kiến thức",     icon: "ri-group-line",      color: "#f472b6", xpReward: 90  },
  vocab_topic: { title: "Từ vựng theo chủ đề",   icon: "ri-translate-2",     color: "#a78bfa", xpReward: 80  },
  quiz_10:     { title: "Quiz Master",            icon: "ri-survey-line",     color: "#84cc16", xpReward: 70  },
};

const TOTAL_CHALLENGES = Object.keys(CHALLENGE_META).length;
const MAX_XP_PER_WEEK = Object.values(CHALLENGE_META).reduce((s, c) => s + c.xpReward, 0) + 300; // +300 bonus

// History loaded from localStorage kts_challenge_history (saved by weekly-challenge page)

// ─── Streak calculator ────────────────────────────────────────────────────────
function calcChallengeStreak(records: WeekRecord[]): number {
  let streak = 0;
  for (const r of records) {
    if (r.completedCount >= Math.ceil(r.totalCount / 2)) streak++;
    else break;
  }
  return streak;
}

// ─── Week Card ────────────────────────────────────────────────────────────────
function WeekCard({ record, isExpanded, onToggle }: {
  record: WeekRecord;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const pct = Math.round((record.completedCount / record.totalCount) * 100);
  const isFullComplete = record.completedCount === record.totalCount;
  const color = isFullComplete ? "#34d399" : pct >= 70 ? "#e8c84a" : pct >= 40 ? "#fb923c" : "#f87171";
  const label = isFullComplete ? "Hoàn hảo!" : pct >= 70 ? "Tốt" : pct >= 40 ? "Trung bình" : "Cần cố gắng";

  return (
    <div className={`bg-app-bg border rounded-2xl overflow-hidden transition-all ${isFullComplete ? "border-emerald-500/20" : "border-app-border"}`}>
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left cursor-pointer hover:bg-white/2 transition-colors"
      >
        {/* Week label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white font-semibold text-sm">{record.weekLabel}</p>
            {isFullComplete && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-app-accent-success/15 text-app-accent-success">
                <i className="ri-vip-crown-fill"></i>Hoàn hảo
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-app-text-secondary text-xs">{record.completedCount}/{record.totalCount} thử thách</span>
            <span className="text-app-text-muted">·</span>
            <span className="text-xs font-semibold" style={{ color }}>{label}</span>
          </div>
        </div>

        {/* Progress ring-like */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white font-bold text-lg">{record.xpEarned}</p>
            <p className="text-app-text-muted text-[10px]">XP nhận được</p>
          </div>
          <div className="w-12 h-12 relative flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke={color} strokeWidth="3"
                strokeDasharray={`${pct * 0.942} 94.2`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color }}>{pct}%</span>
          </div>
          {isExpanded ? <i className="ri-arrow-up-s-line text-app-text-muted text-lg"></i> : <i className="ri-arrow-down-s-line text-app-text-muted text-lg"></i>}
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-app-border pt-4">
          <p className="text-app-text-muted text-xs mb-3">Thử thách đã hoàn thành:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CHALLENGE_META).map(([id, meta]) => {
              const done = record.completedIds.includes(id);
              return (
                <div
                  key={id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl ${done ? "bg-app-surface/50" : "opacity-30"}`}
                >
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${meta.color}15` }}>
                    <i className={`${done ? meta.icon : "ri-close-line"} text-xs`} style={{ color: done ? meta.color : "#f87171" }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${done ? "text-white/70" : "text-app-text-muted"}`}>{meta.title}</p>
                    <p className="text-[10px]" style={{ color: done ? meta.color : "rgba(255,255,255,0.2)" }}>
                      {done ? `+${meta.xpReward} XP` : "Chưa hoàn thành"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {record.bonusClaimed && (
            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-app-accent-primary/8 border border-app-accent-primary/15">
              <i className="ri-vip-crown-fill text-app-accent-primary text-sm"></i>
              <p className="text-app-accent-primary text-xs font-semibold">Bonus hoàn thành tất cả: +300 XP</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ChallengeHistoryPage() {
  const [claimedIds] = useLocalStorage<string[]>("kts_weekly_claimed", []);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [filterView, setFilterView] = useState<"all" | "perfect" | "incomplete">("all");

  const [history] = useLocalStorage<WeekRecord[]>("kts_challenge_history", []);

  const challengeStreak = calcChallengeStreak(history);
  const totalXPFromChallenges = history.reduce((s, r) => s + r.xpEarned, 0);
  const perfectWeeks = history.filter(r => r.completedCount === r.totalCount).length;
  const avgCompletion = history.length > 0
    ? Math.round(history.reduce((s, r) => s + (r.completedCount / r.totalCount) * 100, 0) / history.length)
    : 0;

  const filteredHistory = useMemo(() => {
    if (filterView === "perfect") return history.filter(r => r.completedCount === r.totalCount);
    if (filterView === "incomplete") return history.filter(r => r.completedCount < r.totalCount);
    return history;
  }, [history, filterView]);

  // XP by challenge type across all weeks
  const xpByChallenge = useMemo(() => {
    const map: Record<string, number> = {};
    history.forEach(r => {
      r.completedIds.forEach(id => {
        map[id] = (map[id] || 0) + (CHALLENGE_META[id]?.xpReward || 0);
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [history]);

  return (
    <DashboardLayout
      title="Lịch sử thử thách"
      subtitle="Xem lại kết quả các tuần trước và streak thử thách của bạn"
    >
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Streak thử thách", value: `${challengeStreak} tuần`, icon: "ri-fire-line", color: "#fb923c", sub: "Liên tiếp ≥50% thử thách" },
          { label: "Tuần hoàn hảo", value: perfectWeeks, icon: "ri-vip-crown-line", color: "#e8c84a", sub: `/${history.length} tuần đã ghi nhận` },
          { label: "Tổng XP từ thử thách", value: totalXPFromChallenges.toLocaleString(), icon: "ri-star-line", color: "#34d399", sub: "Tích lũy từ tất cả tuần" },
          { label: "Tỷ lệ hoàn thành TB", value: `${avgCompletion}%`, icon: "ri-bar-chart-line", color: "#a78bfa", sub: "Trung bình mỗi tuần" },
        ].map(s => (
          <div key={s.label} className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
              </div>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
            </div>
            <p className="text-white font-bold text-2xl">{s.value}</p>
            <p className="text-app-text-muted text-[10px] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left: week list */}
        <div>
          {/* Filter */}
          <div className="flex items-center gap-2 mb-4">
            {([["all", "Tất cả"], ["perfect", "Hoàn hảo"], ["incomplete", "Chưa hoàn thành"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterView(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${filterView === key ? "bg-app-accent-primary/15 text-app-accent-primary border border-app-accent-primary/25" : "bg-app-surface/50 text-app-text-secondary border border-app-border hover:text-white/60"}`}
              >
                {label}
                {key === "perfect" && perfectWeeks > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-app-accent-primary/20 text-app-accent-primary text-[9px] font-bold rounded-full">{perfectWeeks}</span>
                )}
              </button>
            ))}
          </div>

          {/* Week cards */}
          <div className="space-y-3">
            {filteredHistory.length === 0 ? (
              <div className="bg-app-bg border border-app-border rounded-2xl p-12 text-center">
                <i className="ri-calendar-line text-white/10 text-4xl mb-3"></i>
                <p className="text-app-text-muted text-sm">Không có tuần nào phù hợp</p>
              </div>
            ) : (
              filteredHistory.map(record => (
                <WeekCard
                  key={record.weekKey}
                  record={record}
                  isExpanded={expandedWeek === record.weekKey}
                  onToggle={() => setExpandedWeek(prev => prev === record.weekKey ? null : record.weekKey)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Streak visual */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Streak thử thách</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#fb923c]/15 flex-shrink-0">
                <i className="ri-fire-fill text-[#fb923c] text-3xl"></i>
              </div>
              <div>
                <p className="text-[#fb923c] font-bold text-3xl">{challengeStreak}</p>
                <p className="text-app-text-secondary text-xs">tuần liên tiếp</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {history.slice(0, 8).reverse().map((r, i) => {
                const isGood = r.completedCount >= Math.ceil(r.totalCount / 2);
                const isPerfect = r.completedCount === r.totalCount;
                return (
                  <div
                    key={r.weekKey}
                    className="aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold"
                    style={{
                      backgroundColor: isPerfect ? "rgba(232,200,74,0.20)" : isGood ? "#fb923c15" : "rgba(255,255,255,0.03)",
                      color: isPerfect ? "#e8c84a" : isGood ? "#fb923c" : "rgba(255,255,255,0.2)",
                      border: `1px solid ${isPerfect ? "rgba(232,200,74,0.30)" : isGood ? "#fb923c20" : "rgba(255,255,255,0.05)"}`,
                    }}
                    title={r.weekLabel}
                  >
                    {isPerfect ? "★" : isGood ? "✓" : "·"}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 mt-3 text-[10px] text-app-text-muted">
              <span className="flex items-center gap-1"><span className="text-app-accent-primary">★</span> Hoàn hảo</span>
              <span className="flex items-center gap-1"><span className="text-[#fb923c]">✓</span> Tốt</span>
              <span className="flex items-center gap-1"><span>·</span> Chưa đạt</span>
            </div>
          </div>

          {/* XP by challenge type */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">XP theo loại thử thách</h3>
            <div className="space-y-2.5">
              {xpByChallenge.map(([id, xp]) => {
                const meta = CHALLENGE_META[id];
                if (!meta) return null;
                const maxXP = xpByChallenge[0]?.[1] || 1;
                const pct = Math.round((xp / maxXP) * 100);
                return (
                  <div key={id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <i className={`${meta.icon} text-xs`} style={{ color: meta.color }}></i>
                        <span className="text-white/50 text-[10px]">{meta.title}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: meta.color }}>{xp} XP</span>
                    </div>
                    <div className="h-1 bg-app-card/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: meta.color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Motivation */}
          <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-lightbulb-line text-app-accent-primary text-sm"></i>
              <h3 className="text-white font-semibold text-sm">Mẹo duy trì streak</h3>
            </div>
            <div className="space-y-2 text-app-text-secondary text-xs leading-relaxed">
              <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Ưu tiên thử thách Streak 7 ngày trước</p>
              <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Flashcard Marathon dễ hoàn thành nhất</p>
              <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Cập nhật tiến độ mỗi ngày để không quên</p>
              <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Hoàn thành 4+ thử thách để giữ streak</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


