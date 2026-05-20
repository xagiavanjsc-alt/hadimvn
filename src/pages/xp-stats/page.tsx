import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useXPSystem } from "@/hooks/useXPSystem";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getStreakData } from "@/utils/streak";

type Period = "7days" | "30days" | "90days";

const XP_SOURCE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  flashcard_learned: { label: "Flashcard", icon: "ri-stack-line", color: "app-accent-primary" },
  eps_exam_completed: { label: "Thi EPS", icon: "ri-timer-line", color: "#34d399" },
  topic_drill_completed: { label: "Luyện chủ đề", icon: "ri-focus-3-line", color: "#06b6d4" },
  quiz_completed: { label: "Quiz", icon: "ri-survey-line", color: "#a78bfa" },
  streak_day: { label: "Streak hàng ngày", icon: "ri-fire-line", color: "#fb923c" },
  streak_bonus_7: { label: "Streak 7 ngày", icon: "ri-fire-fill", color: "#fb923c" },
  streak_bonus_30: { label: "Streak 30 ngày", icon: "ri-fire-fill", color: "#ef4444" },
  community_post: { label: "Cộng đồng", icon: "ri-group-line", color: "#f472b6" },
  topik_exam_completed: { label: "Thi TOPIK", icon: "ri-file-list-3-line", color: "#84cc16" },
};

function getSourceLabel(type: string) {
  return XP_SOURCE_CONFIG[type]?.label || type.replace(/_/g, " ");
}
function getSourceColor(type: string) {
  return XP_SOURCE_CONFIG[type]?.color || "app-accent-primary";
}
function getSourceIcon(type: string) {
  return XP_SOURCE_CONFIG[type]?.icon || "ri-star-line";
}

function getDayLabel(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function groupByDay(history: { type: string; amount: number; ts: number }[], days: number) {
  const now = Date.now();
  const cutoff = now - days * 86400000;
  const map: Record<string, { xp: number; sources: Record<string, number> }> = {};

  // Init all days
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const key = d.toISOString().split("T")[0];
    map[key] = { xp: 0, sources: {} };
  }

  history.forEach(h => {
    if (h.ts < cutoff) return;
    const key = new Date(h.ts).toISOString().split("T")[0];
    if (!map[key]) return;
    map[key].xp += h.amount;
    map[key].sources[h.type] = (map[key].sources[h.type] || 0) + h.amount;
  });

  return Object.entries(map).map(([date, data]) => ({
    date,
    label: new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    ...data,
  }));
}

function groupByWeek(history: { type: string; amount: number; ts: number }[], weeks: number) {
  const now = Date.now();
  const result: { label: string; xp: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = now - (i + 1) * 7 * 86400000;
    const end = now - i * 7 * 86400000;
    const xp = history.filter(h => h.ts >= start && h.ts < end).reduce((s, h) => s + h.amount, 0);
    const d = new Date(end);
    result.push({ label: `T${weeks - i}`, xp });
  }
  return result;
}

const COMMUNITY_BENCHMARKS = [
  { label: "Top 10%", xpPerDay: 80, color: "#34d399" },
  { label: "Top 25%", xpPerDay: 45, color: "app-accent-primary" },
  { label: "Trung bình", xpPerDay: 20, color: "#fb923c" },
  { label: "Mới bắt đầu", xpPerDay: 5, color: "#f87171" },
];

export default function XPStatsPage() {
  const [period, setPeriod] = useState<Period>("7days");
  const { totalXP, xpHistory, currentRank, nextRank, xpToNext, progress } = useXPSystem();
  const streak = getStreakData();

  const days = period === "7days" ? 7 : period === "30days" ? 30 : 90;

  const dailyData = useMemo(() => groupByDay(xpHistory, days), [xpHistory, days]);
  const weeklyData = useMemo(() => groupByWeek(xpHistory, 4), [xpHistory]);

  const chartData = period === "30days"
    ? weeklyData.map(w => ({ label: w.label, xp: w.xp }))
    : dailyData.map(d => ({ label: d.label, xp: d.xp }));

  const periodXP = dailyData.reduce((s, d) => s + d.xp, 0);
  const avgXPPerDay = days > 0 ? Math.round(periodXP / days) : 0;
  const maxXP = Math.max(...dailyData.map(d => d.xp), 1);
  const bestDay = dailyData.find(d => d.xp === maxXP);
  const activeDays = dailyData.filter(d => d.xp > 0).length;
  const consistency = Math.round((activeDays / days) * 100);

  // XP by source
  const xpBySource = useMemo(() => {
    const map: Record<string, number> = {};
    xpHistory.forEach(h => {
      const key = h.type.startsWith("badge_") ? "badge" : h.type;
      map[key] = (map[key] || 0) + h.amount;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [xpHistory]);

  const totalSourceXP = xpBySource.reduce((s, [, v]) => s + v, 0);

  // Prediction: days to next level
  const daysToNextLevel = useMemo(() => {
    if (!nextRank || avgXPPerDay <= 0) return null;
    return Math.ceil(xpToNext / avgXPPerDay);
  }, [nextRank, avgXPPerDay, xpToNext]);

  // User benchmark
  const userBenchmark = avgXPPerDay >= 80 ? 0 : avgXPPerDay >= 45 ? 1 : avgXPPerDay >= 20 ? 2 : 3;

  const chartMax = Math.max(...chartData.map(d => d.xp), 1);

  return (
    <DashboardLayout
      title="Thống kê XP chi tiết"
      subtitle="Theo dõi tiến trình tích lũy XP và dự đoán thời gian lên cấp"
    >
      {/* Period selector */}
      <div className="flex items-center gap-2 mb-6">
        {([["7days", "7 ngày"], ["30days", "30 ngày"], ["90days", "90 ngày"]] as [Period, string][]).map(([p, label]) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${period === p ? "bg-app-accent-primary/15 text-app-accent-primary border border-app-accent-primary/25" : "bg-app-surface/50 text-app-text-secondary border border-app-border hover:text-white/60"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng XP tích lũy", value: totalXP.toLocaleString(), icon: "ri-award-line", color: "app-accent-primary", sub: `Cấp ${currentRank.name}` },
          { label: `XP trong ${days} ngày`, value: periodXP.toLocaleString(), icon: "ri-bar-chart-line", color: "#34d399", sub: `${avgXPPerDay} XP/ngày TB` },
          { label: "Ngày tốt nhất", value: maxXP > 0 ? maxXP : "—", icon: "ri-trophy-line", color: "#fb923c", sub: bestDay?.label || "Chưa có" },
          { label: "Tỷ lệ nhất quán", value: `${consistency}%`, icon: "ri-calendar-check-line", color: "#a78bfa", sub: `${activeDays}/${days} ngày hoạt động` },
        ].map(card => (
          <div key={card.label} className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${card.color}15` }}>
                <i className={`${card.icon} text-sm`} style={{ color: card.color }}></i>
              </div>
              <p className="text-app-text-secondary text-xs">{card.label}</p>
            </div>
            <p className="text-white font-bold text-2xl">{card.value}</p>
            <p className="text-app-text-muted text-[10px] mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Bar chart */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-6">
            <h3 className="text-white font-semibold text-sm mb-5">
              Biểu đồ XP — {period === "7days" ? "7 ngày qua" : period === "30days" ? "4 tuần qua" : "90 ngày qua"}
            </h3>
            {periodXP === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <i className="ri-bar-chart-line text-white/10 text-4xl mb-3"></i>
                <p className="text-app-text-muted text-sm">Chưa có dữ liệu XP trong kỳ này</p>
                <p className="text-app-text-muted text-xs mt-1">Hãy học flashcard, làm bài thi để tích lũy XP!</p>
              </div>
            ) : (
              <div className="flex items-end gap-1.5 h-48">
                {chartData.map((d, i) => {
                  const height = Math.max((d.xp / chartMax) * 100, d.xp > 0 ? 4 : 1);
                  const isLast = i === chartData.length - 1;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-app-surface border border-app-border rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {d.xp} XP
                      </div>
                      <div
                        className={`w-full rounded-t-md transition-all ${isLast ? "bg-app-accent-primary" : d.xp > 0 ? "bg-app-accent-primary/40 group-hover:bg-app-accent-primary/60" : "bg-app-card/50"}`}
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-[9px] text-app-text-muted whitespace-nowrap">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* XP by source */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-6">
            <h3 className="text-white font-semibold text-sm mb-5">Nguồn XP (tổng tích lũy)</h3>
            {xpBySource.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-app-text-muted text-sm">Chưa có dữ liệu nguồn XP</p>
              </div>
            ) : (
              <div className="space-y-3">
                {xpBySource.map(([type, xp]) => {
                  const pct = totalSourceXP > 0 ? Math.round((xp / totalSourceXP) * 100) : 0;
                  const color = getSourceColor(type);
                  const icon = getSourceIcon(type);
                  const label = getSourceLabel(type);
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                        <i className={`${icon} text-xs`} style={{ color }}></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white/60 text-xs">{label}</span>
                          <span className="text-white/80 text-xs font-semibold">{xp} XP <span className="text-app-text-muted font-normal">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent XP history */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Lịch sử XP gần đây</h3>
            {xpHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-app-text-muted text-sm">Chưa có lịch sử XP</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {xpHistory.slice(0, 20).map((h, i) => {
                  const color = getSourceColor(h.type);
                  const icon = getSourceIcon(h.type);
                  const label = getSourceLabel(h.type);
                  const time = new Date(h.ts).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/2 hover:bg-white/4 transition-colors">
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                        <i className={`${icon} text-xs`} style={{ color }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/60 text-xs">{label}</p>
                        <p className="text-app-text-muted text-[10px]">{time}</p>
                      </div>
                      <span className="text-xs font-bold" style={{ color }}>+{h.amount} XP</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Current rank + progress */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Cấp bậc hiện tại</h3>
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ backgroundColor: `${currentRank.color}08`, border: `1px solid ${currentRank.color}20` }}>
              <div className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${currentRank.color}15` }}>
                <i className={`${currentRank.icon} text-2xl`} style={{ color: currentRank.color }}></i>
              </div>
              <div>
                <p className="font-bold text-base" style={{ color: currentRank.color }}>{currentRank.name}</p>
                <p className="text-app-text-secondary text-xs">{currentRank.nameKo} · {totalXP.toLocaleString()} XP</p>
              </div>
            </div>

            {nextRank && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-app-text-secondary text-xs">Tiến độ lên {nextRank.name}</span>
                  <span className="text-xs font-bold" style={{ color: currentRank.color }}>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-app-card/50 rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: currentRank.color }}></div>
                </div>
                <p className="text-app-text-muted text-xs text-center">Còn <strong className="text-white/60">{xpToNext.toLocaleString()} XP</strong> để lên cấp</p>
              </>
            )}
            {!nextRank && (
              <div className="text-center py-2">
                <i className="ri-vip-crown-fill text-app-accent-primary text-2xl mb-1"></i>
                <p className="text-app-accent-primary text-sm font-bold">Cấp tối đa!</p>
              </div>
            )}
          </div>

          {/* Level-up prediction */}
          {nextRank && (
            <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-time-line text-app-accent-primary text-sm"></i>
                <h3 className="text-white font-semibold text-sm">Dự đoán lên cấp</h3>
              </div>
              {daysToNextLevel !== null && avgXPPerDay > 0 ? (
                <>
                  <div className="text-center py-3">
                    <p className="text-app-accent-primary font-bold text-3xl">{daysToNextLevel}</p>
                    <p className="text-app-text-secondary text-xs mt-1">ngày nữa</p>
                  </div>
                  <div className="space-y-2 mt-3">
                    {[
                      { label: "Tốc độ hiện tại", value: `${avgXPPerDay} XP/ngày` },
                      { label: "XP còn thiếu", value: `${xpToNext.toLocaleString()} XP` },
                      { label: "Cấp tiếp theo", value: nextRank.name },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-app-text-muted text-xs">{s.label}</span>
                        <span className="text-white/70 text-xs font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-app-border">
                    <p className="text-app-text-muted text-[10px] text-center">
                      Dựa trên tốc độ học {days} ngày qua
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-app-text-muted text-sm">Chưa đủ dữ liệu</p>
                  <p className="text-app-text-muted text-xs mt-1">Hãy học ít nhất 1 ngày để dự đoán</p>
                </div>
              )}
            </div>
          )}

          {/* Community comparison */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">So sánh cộng đồng</h3>
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ backgroundColor: `${COMMUNITY_BENCHMARKS[userBenchmark].color}08`, border: `1px solid ${COMMUNITY_BENCHMARKS[userBenchmark].color}20` }}>
              <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${COMMUNITY_BENCHMARKS[userBenchmark].color}15` }}>
                <i className="ri-user-star-line text-lg" style={{ color: COMMUNITY_BENCHMARKS[userBenchmark].color }}></i>
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: COMMUNITY_BENCHMARKS[userBenchmark].color }}>{COMMUNITY_BENCHMARKS[userBenchmark].label}</p>
                <p className="text-app-text-secondary text-xs">{avgXPPerDay} XP/ngày của bạn</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {COMMUNITY_BENCHMARKS.map((b, i) => {
                const isUser = i === userBenchmark;
                return (
                  <div key={b.label} className={`flex items-center gap-3 p-2 rounded-lg ${isUser ? "bg-app-card/50" : ""}`}>
                    <span className="text-xs w-20 text-right" style={{ color: isUser ? b.color : "rgba(255,255,255,0.3)" }}>{b.label}</span>
                    <div className="flex-1 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(b.xpPerDay / 80) * 100}%`, backgroundColor: isUser ? b.color : "rgba(255,255,255,0.1)" }}></div>
                    </div>
                    <span className="text-[10px] text-app-text-muted w-16">{b.xpPerDay} XP/ng</span>
                    {isUser && <i className="ri-arrow-left-line text-xs" style={{ color: b.color }}></i>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-lightbulb-line text-app-accent-primary text-sm"></i>
              <h3 className="text-white font-semibold text-sm">Tăng tốc XP</h3>
            </div>
            <div className="space-y-2">
              {[
                { icon: "ri-stack-line", text: "Flashcard: +5 XP/từ thuộc", color: "app-accent-primary" },
                { icon: "ri-timer-line", text: "Thi EPS: +20–50 XP/lần", color: "#34d399" },
                { icon: "ri-fire-line", text: "Streak 7 ngày: +50 XP bonus", color: "#fb923c" },
                { icon: "ri-focus-3-line", text: "Luyện chủ đề: +15 XP/lần", color: "#06b6d4" },
                { icon: "ri-group-line", text: "Đăng bài cộng đồng: +15 XP", color: "#f472b6" },
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <i className={`${tip.icon} text-xs`} style={{ color: tip.color }}></i>
                  </div>
                  <p className="text-app-text-secondary text-xs">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


