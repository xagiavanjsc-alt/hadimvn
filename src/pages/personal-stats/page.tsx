import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import { useAuth } from "@/hooks/useAuth";
import { getStreakData } from "@/utils/streak";

interface XPEntry {
  date: string;
  amount: number;
  type: string;
}

interface ExamResult {
  id: string;
  date: string;
  score: number;
  total: number;
  timeUsed: number;
}

type Period = "week" | "month" | "3months";
type StatsTab = "overview" | "streak" | "weakness" | "xp";

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, maxVal, color, labels }: {
  data: number[];
  maxVal: number;
  color: string;
  labels: string[];
}) {
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((val, i) => {
        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex items-end justify-center" style={{ height: "100px" }}>
              {val > 0 && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1a1600] border border-app-accent-primary/20 rounded px-1.5 py-0.5 text-[9px] text-app-accent-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {val} XP
                </div>
              )}
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{ height: `${Math.max(pct, val > 0 ? 4 : 0)}%`, backgroundColor: val > 0 ? color : "rgba(255,255,255,0.05)" }}
              ></div>
            </div>
            <span className="text-[9px] text-app-text-muted whitespace-nowrap">{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Line Chart ───────────────────────────────────────────────────────────────
function LineChart({ data, maxVal, color }: { data: number[]; maxVal: number; color: string }) {
  if (data.length < 2) return null;
  const w = 100 / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * w;
    const y = maxVal > 0 ? 100 - (v / maxVal) * 90 : 95;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-16">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {data.map((v, i) => {
        const x = i * w;
        const y = maxVal > 0 ? 100 - (v / maxVal) * 90 : 95;
        return (
          <circle key={i} cx={x} cy={y} r="1.5" fill={color} vectorEffect="non-scaling-stroke" />
        );
      })}
    </svg>
  );
}

// ─── Streak Calendar ──────────────────────────────────────────────────────────
function StreakCalendar({ xpLog }: { xpLog: XPEntry[] }) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const xpByDay = useMemo(() => {
    const map: Record<string, number> = {};
    xpLog.forEach(e => {
      const day = e.date?.split("T")[0];
      if (day) map[day] = (map[day] || 0) + (e.amount || 0);
    });
    return map;
  }, [xpLog]);

  const calendarDays = useMemo(() => {
    const { year, month } = viewMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (string | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push(dateStr);
    }
    return days;
  }, [viewMonth]);

  const today = new Date().toISOString().split("T")[0];
  const monthLabel = new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  const getIntensity = (xp: number) => {
    if (xp === 0) return 0;
    if (xp < 50) return 1;
    if (xp < 150) return 2;
    if (xp < 300) return 3;
    return 4;
  };

  const intensityColors = [
    "rgba(255,255,255,0.04)",
    "rgba(232,200,74,0.20)",
    "rgba(232,200,74,0.40)",
    "rgba(232,200,74,0.65)",
    "app-accent-primary",
  ];

  const activeDaysThisMonth = calendarDays.filter(d => d && (xpByDay[d] || 0) > 0).length;
  const totalXPThisMonth = calendarDays.reduce((s, d) => s + (d ? (xpByDay[d] || 0) : 0), 0);

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold text-sm">Lịch học tập (Streak Calendar)</h3>
          <p className="text-app-text-muted text-xs mt-0.5">
            {activeDaysThisMonth} ngày học · {totalXPThisMonth.toLocaleString()} XP tháng này
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMonth(v => {
              const d = new Date(v.year, v.month - 1, 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary hover:text-white/70 cursor-pointer"
          >
            <i className="ri-arrow-left-s-line text-sm"></i>
          </button>
          <span className="text-white/60 text-xs font-medium min-w-[100px] text-center">{monthLabel}</span>
          <button
            onClick={() => setViewMonth(v => {
              const d = new Date(v.year, v.month + 1, 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary hover:text-white/70 cursor-pointer"
          >
            <i className="ri-arrow-right-s-line text-sm"></i>
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map(d => (
          <div key={d} className="text-center text-[10px] text-app-text-muted py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dateStr, i) => {
          if (!dateStr) return <div key={i} />;
          const xp = xpByDay[dateStr] || 0;
          const intensity = getIntensity(xp);
          const isToday = dateStr === today;
          const dayNum = parseInt(dateStr.split("-")[2]);
          return (
            <div
              key={dateStr}
              className="relative aspect-square rounded-md flex items-center justify-center group cursor-default"
              style={{
                backgroundColor: intensityColors[intensity],
                border: isToday ? "1px solid rgba(232,200,74,0.5)" : "1px solid transparent",
              }}
            >
              <span className="text-[10px]" style={{ color: intensity > 0 ? (intensity >= 3 ? "#0f1117" : "app-accent-primary") : "rgba(255,255,255,0.25)" }}>
                {dayNum}
              </span>
              {xp > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <div className="bg-[#1a1600] border border-app-accent-primary/20 rounded px-2 py-1 text-[9px] text-app-accent-primary whitespace-nowrap">
                    {xp} XP
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-[10px] text-app-text-muted">Ít</span>
        {intensityColors.map((c, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c, border: "1px solid rgba(255,255,255,0.05)" }} />
        ))}
        <span className="text-[10px] text-app-text-muted">Nhiều</span>
      </div>
    </div>
  );
}

// ─── Weakness Analysis ────────────────────────────────────────────────────────
function WeaknessAnalysis({ examResults }: { examResults: ExamResult[] }) {
  const [answeredMap] = useLocalStorage<Record<string, { correct: boolean; topic?: string }>>("kts_eps_answers_detail", {});

  const topicStats = useMemo(() => {
    const stats: Record<string, { correct: number; total: number }> = {};
    Object.entries(answeredMap).forEach(([, val]) => {
      const topic = val.topic || "Chung";
      if (!stats[topic]) stats[topic] = { correct: 0, total: 0 };
      stats[topic].total++;
      if (val.correct) stats[topic].correct++;
    });
    return Object.entries(stats)
      .map(([topic, s]) => ({
        topic,
        correct: s.correct,
        total: s.total,
        accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      }))
      .sort((a, b) => a.accuracy - b.accuracy);
  }, [answeredMap]);

  const recentExams = examResults.slice(-10);
  const avgScore = recentExams.length > 0
    ? Math.round(recentExams.reduce((s, r) => s + (r.score / r.total) * 100, 0) / recentExams.length)
    : 0;

  const weakTopics = topicStats.filter(t => t.accuracy < 60 && t.total >= 3);
  const strongTopics = topicStats.filter(t => t.accuracy >= 80 && t.total >= 3);

  const EPS_TOPICS = [
    { name: "Lao động", icon: "ri-tools-line", color: "app-accent-primary" },
    { name: "An toàn", icon: "ri-shield-check-line", color: "#34d399" },
    { name: "Bảo hiểm", icon: "ri-heart-pulse-line", color: "#f87171" },
    { name: "Hợp đồng", icon: "ri-file-text-line", color: "#a78bfa" },
    { name: "Tiền lương", icon: "ri-money-dollar-circle-line", color: "#fb923c" },
    { name: "Từ vựng", icon: "ri-translate-2", color: "#06b6d4" },
  ];

  return (
    <div className="space-y-5">
      {/* Score overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Điểm TB gần đây", value: `${avgScore}%`, color: avgScore >= 80 ? "#34d399" : avgScore >= 60 ? "app-accent-primary" : "#f87171", icon: "ri-bar-chart-line" },
          { label: "Chủ đề yếu", value: weakTopics.length, color: "#f87171", icon: "ri-error-warning-line" },
          { label: "Chủ đề mạnh", value: strongTopics.length, color: "#34d399", icon: "ri-checkbox-circle-line" },
        ].map(s => (
          <div key={s.label} className="bg-app-bg border border-app-border rounded-2xl p-5 text-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto mb-3" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
            </div>
            <p className="font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
            <p className="text-app-text-secondary text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Topic breakdown */}
      {topicStats.length > 0 ? (
        <div className="bg-app-bg border border-app-border rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-5">Phân tích theo chủ đề</h3>
          <div className="space-y-3">
            {topicStats.slice(0, 8).map(t => {
              const color = t.accuracy < 50 ? "#f87171" : t.accuracy < 70 ? "app-accent-primary" : "#34d399";
              return (
                <div key={t.topic} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-white/50 truncate flex-shrink-0">{t.topic}</div>
                  <div className="flex-1 h-2 bg-app-card/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${t.accuracy}%`, backgroundColor: color }}
                    />
                  </div>
                  <div className="text-xs font-bold w-10 text-right flex-shrink-0" style={{ color }}>
                    {t.accuracy}%
                  </div>
                  <div className="text-[10px] text-app-text-muted w-16 text-right flex-shrink-0">
                    {t.correct}/{t.total} câu
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-app-bg border border-app-border rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-4">Phân tích điểm yếu theo chủ đề EPS</h3>
          <div className="grid grid-cols-2 gap-3">
            {EPS_TOPICS.map(t => (
              <div key={t.name} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${t.color}15` }}>
                  <i className={`${t.icon} text-sm`} style={{ color: t.color }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 text-xs font-medium">{t.name}</p>
                  <div className="h-1 bg-app-card/50 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-app-card/70" style={{ width: "0%" }} />
                  </div>
                </div>
                <span className="text-[10px] text-app-text-muted">Chưa có dữ liệu</span>
              </div>
            ))}
          </div>
          <p className="text-app-text-muted text-xs text-center mt-4">Làm bài thi để xem phân tích điểm yếu chi tiết</p>
        </div>
      )}

      {/* Recommendations */}
      {weakTopics.length > 0 && (
        <div className="bg-app-bg border border-rose-500/15 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <i className="ri-lightbulb-line text-app-accent-primary"></i>
            <h3 className="text-white font-semibold text-sm">Gợi ý cải thiện</h3>
          </div>
          <div className="space-y-2">
            {weakTopics.slice(0, 3).map(t => (
              <div key={t.topic} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.12)" }}>
                <i className="ri-focus-3-line text-rose-400 flex-shrink-0"></i>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs">Ôn luyện chủ đề <strong className="text-rose-400">{t.topic}</strong></p>
                  <p className="text-app-text-muted text-[10px] mt-0.5">Độ chính xác hiện tại: {t.accuracy}% — cần đạt 80%+</p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-rose-500/15 text-rose-400 font-bold flex-shrink-0">
                  {t.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── XP Breakdown ─────────────────────────────────────────────────────────────
function XPBreakdown({ xpLog }: { xpLog: XPEntry[] }) {
  const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
    eps_exam_completed: { label: "Thi thử EPS", color: "app-accent-primary", icon: "ri-file-list-3-line" },
    flashcard_learned: { label: "Flashcard", color: "#a78bfa", icon: "ri-stack-line" },
    quiz_completed: { label: "Quiz", color: "#34d399", icon: "ri-survey-line" },
    streak_bonus: { label: "Streak", color: "#fb923c", icon: "ri-fire-line" },
    daily_study: { label: "Học hàng ngày", color: "#06b6d4", icon: "ri-book-open-line" },
    other: { label: "Khác", color: "#6b7280", icon: "ri-star-line" },
  };

  const xpByType = useMemo(() => {
    const map: Record<string, number> = {};
    xpLog.forEach(e => {
      const t = e.type || "other";
      map[t] = (map[t] || 0) + (e.amount || 0);
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([type, amount]) => ({ type, amount }));
  }, [xpLog]);

  const totalXPAllTime = xpLog.reduce((s, e) => s + (e.amount || 0), 0);

  // XP by day of week
  const xpByDow = useMemo(() => {
    const dow = [0, 0, 0, 0, 0, 0, 0];
    xpLog.forEach(e => {
      if (e.date) {
        const d = new Date(e.date).getDay();
        dow[d] += e.amount || 0;
      }
    });
    return dow;
  }, [xpLog]);
  const maxDow = Math.max(...xpByDow, 1);
  const dowLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className="space-y-5">
      {/* XP by activity */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-6">
        <h3 className="text-white font-semibold text-sm mb-5">Phân bổ XP theo hoạt động</h3>
        {xpByType.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {xpByType.map(({ type, amount }) => {
              const info = typeLabels[type] || typeLabels.other;
              const pct = totalXPAllTime > 0 ? Math.round((amount / totalXPAllTime) * 100) : 0;
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${info.color}15` }}>
                    <i className={`${info.icon} text-sm`} style={{ color: info.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/60 text-xs">{info.label}</span>
                      <span className="text-xs font-bold" style={{ color: info.color }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: info.color }} />
                    </div>
                    <p className="text-app-text-muted text-[10px] mt-0.5">{amount.toLocaleString()} XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="ri-bar-chart-line text-white/10 text-3xl mb-2 block"></i>
            <p className="text-app-text-muted text-sm">Chưa có dữ liệu XP. Hãy bắt đầu học!</p>
          </div>
        )}
      </div>

      {/* XP by day of week */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-6">
        <h3 className="text-white font-semibold text-sm mb-5">XP theo ngày trong tuần</h3>
        <div className="flex items-end gap-2" style={{ height: 100 }}>
          {xpByDow.map((xp, i) => {
            const pct = (xp / maxDow) * 100;
            const isMax = xp === maxDow && xp > 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="relative w-full flex items-end justify-center" style={{ height: 80 }}>
                  {xp > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      <div className="bg-[#1a1600] border border-app-accent-primary/20 rounded px-1.5 py-0.5 text-[9px] text-app-accent-primary whitespace-nowrap">
                        {xp.toLocaleString()} XP
                      </div>
                    </div>
                  )}
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max(pct, xp > 0 ? 5 : 0)}%`,
                      backgroundColor: isMax ? "app-accent-primary" : xp > 0 ? "rgba(232,200,74,0.4)" : "rgba(255,255,255,0.04)",
                    }}
                  />
                </div>
                <span className="text-[10px] text-app-text-muted">{dowLabels[i]}</span>
              </div>
            );
          })}
        </div>
        <p className="text-app-text-muted text-xs mt-3 text-center">
          {xpByDow.indexOf(Math.max(...xpByDow)) >= 0 && Math.max(...xpByDow) > 0
            ? `Bạn học nhiều nhất vào ${dowLabels[xpByDow.indexOf(Math.max(...xpByDow))]}`
            : "Chưa có dữ liệu"}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PersonalStatsPage() {
  const navigate = useNavigate();
  const { totalXP, currentRank } = useXPSystem();
  const [activeTab, setActiveTab] = useState<StatsTab>("overview");
  const [period, setPeriod] = useState<Period>("week");
  const [xpLog] = useLocalStorage<XPEntry[]>("kts_xp_log", []);
  const [examResults] = useLocalStorage<ExamResult[]>("kts_eps_exam_history", []);
  const streak = getStreakData();
  const [flashcardProgress] = useLocalStorage<Record<string, boolean>>("flashcard_known", {});

  // Generate date range
  const dateRange = useMemo(() => {
    const days = period === "week" ? 7 : period === "month" ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return d.toISOString().split("T")[0];
    });
  }, [period]);

  // XP per day
  const xpByDay = useMemo(() => {
    const map: Record<string, number> = {};
    xpLog.forEach(entry => {
      const day = entry.date?.split("T")[0];
      if (day) map[day] = (map[day] || 0) + (entry.amount || 0);
    });
    return dateRange.map(d => map[d] || 0);
  }, [xpLog, dateRange]);

  const totalXPInPeriod = xpByDay.reduce((s, v) => s + v, 0);
  const maxXPDay = Math.max(...xpByDay, 1);
  const activeDays = xpByDay.filter(v => v > 0).length;
  const avgXPPerDay = activeDays > 0 ? Math.round(totalXPInPeriod / activeDays) : 0;

  const chartLabels = useMemo(() => {
    if (period === "week") {
      const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      return dateRange.map(d => days[new Date(d).getDay()]);
    }
    if (period === "month") {
      return dateRange.map((d, i) => i % 5 === 0 ? d.slice(8) : "");
    }
    return dateRange.map((d, i) => i % 15 === 0 ? d.slice(5) : "");
  }, [dateRange, period]);

  const prevXPTotal = useMemo(() => {
    const days = period === "week" ? 7 : period === "month" ? 30 : 90;
    const prevRange = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days * 2 - 1 - i));
      return d.toISOString().split("T")[0];
    });
    const map: Record<string, number> = {};
    xpLog.forEach(entry => {
      const day = entry.date?.split("T")[0];
      if (day) map[day] = (map[day] || 0) + (entry.amount || 0);
    });
    return prevRange.reduce((s, d) => s + (map[d] || 0), 0);
  }, [xpLog, period]);

  const xpChange = totalXPInPeriod - prevXPTotal;
  const xpChangePct = prevXPTotal > 0 ? Math.round((xpChange / prevXPTotal) * 100) : 0;

  const examTrend = useMemo(() => {
    const sorted = [...examResults].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.slice(-10).map(r => Math.round((r.score / r.total) * 100));
  }, [examResults]);

  const avgExamScore = examTrend.length > 0 ? Math.round(examTrend.reduce((s, v) => s + v, 0) / examTrend.length) : 0;
  const latestExamScore = examTrend[examTrend.length - 1] ?? 0;
  const prevExamScore = examTrend[examTrend.length - 2] ?? 0;
  const examImprovement = latestExamScore - prevExamScore;

  const daysToGoal = useMemo(() => {
    if (latestExamScore >= 80) return 0;
    if (examTrend.length < 2) return null;
    const recentTrend = examTrend.slice(-5);
    if (recentTrend.length < 2) return null;
    const avgImprovement = (recentTrend[recentTrend.length - 1] - recentTrend[0]) / (recentTrend.length - 1);
    if (avgImprovement <= 0) return null;
    const needed = 80 - latestExamScore;
    return Math.ceil(needed / avgImprovement);
  }, [examTrend, latestExamScore]);

  const TABS: { id: StatsTab; label: string; icon: string }[] = [
    { id: "overview", label: "Tổng quan", icon: "ri-dashboard-line" },
    { id: "streak", label: "Streak Calendar", icon: "ri-calendar-check-line" },
    { id: "weakness", label: "Điểm yếu", icon: "ri-focus-3-line" },
    { id: "xp", label: "Phân tích XP", icon: "ri-bar-chart-2-line" },
  ];

  return (
    <DashboardLayout
      title="Thống kê học tập cá nhân"
      subtitle="Biểu đồ tiến độ, streak calendar và phân tích điểm yếu"
    >
      <div className="space-y-6">
        {/* Header stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: "ri-flashlight-line", color: "app-accent-primary", bg: "bg-app-accent-primary/10", label: "Tổng XP", value: totalXP.toLocaleString(), sub: `Hạng ${currentRank.name}` },
            { icon: "ri-fire-line", color: "#fb923c", bg: "bg-[#fb923c]/10", label: "Streak hiện tại", value: `${streak.currentStreak} ngày`, sub: "Liên tiếp" },
            { icon: "ri-file-list-3-line", color: "#34d399", bg: "bg-emerald-500/10", label: "Lần thi EPS", value: examResults.length, sub: `TB ${avgExamScore}%` },
            { icon: "ri-stack-line", color: "#a78bfa", bg: "bg-[#a78bfa]/10", label: "Từ đã thuộc", value: Object.values(flashcardProgress).filter(Boolean).length, sub: "Qua Flashcard" },
          ].map(s => (
            <div key={s.label} className="bg-app-bg border border-app-border rounded-2xl p-5">
              <div className={`w-10 h-10 flex items-center justify-center ${s.bg} rounded-xl mb-3`}>
                <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
              </div>
              <p className="text-white font-bold text-2xl leading-none">{s.value}</p>
              <p className="text-app-text-secondary text-xs mt-1">{s.label}</p>
              <p className="text-app-text-muted text-[10px] mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-app-card/50 p-1 rounded-xl border border-app-border">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${
                activeTab === tab.id ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"
              }`}
            >
              <i className={`${tab.icon} text-sm`}></i>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <>
            {/* XP Chart */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-white font-semibold text-sm">Biểu đồ XP theo thời gian</h3>
                  <p className="text-app-text-muted text-xs mt-0.5">
                    {totalXPInPeriod.toLocaleString()} XP trong kỳ này
                    {prevXPTotal > 0 && (
                      <span className={`ml-2 font-semibold ${xpChange >= 0 ? "text-app-accent-success" : "text-red-400"}`}>
                        {xpChange >= 0 ? "+" : ""}{xpChangePct}% so với kỳ trước
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-1 bg-app-card/50 p-1 rounded-xl">
                  {(["week", "month", "3months"] as Period[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${period === p ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}
                    >
                      {p === "week" ? "7 ngày" : p === "month" ? "30 ngày" : "3 tháng"}
                    </button>
                  ))}
                </div>
              </div>
              <BarChart data={xpByDay} maxVal={maxXPDay} color="app-accent-primary" labels={chartLabels} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-app-border">
                {[
                  { label: "Tổng XP kỳ này", value: totalXPInPeriod.toLocaleString(), color: "app-accent-primary" },
                  { label: "Ngày hoạt động", value: `${activeDays}/${dateRange.length}`, color: "#34d399" },
                  { label: "TB XP/ngày học", value: avgXPPerDay.toLocaleString(), color: "#a78bfa" },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-app-text-muted text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Exam trend */}
              <div className="bg-app-bg border border-app-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-sm">Tiến bộ thi EPS</h3>
                    <p className="text-app-text-muted text-xs mt-0.5">10 lần thi gần nhất</p>
                  </div>
                  {examTrend.length >= 2 && (
                    <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-xl ${examImprovement >= 0 ? "bg-emerald-500/10 text-app-accent-success" : "bg-red-500/10 text-red-400"}`}>
                      <i className={examImprovement >= 0 ? "ri-arrow-up-line" : "ri-arrow-down-line"}></i>
                      {Math.abs(examImprovement)}%
                    </div>
                  )}
                </div>
                {examTrend.length >= 2 ? (
                  <>
                    <LineChart data={examTrend} maxVal={100} color="app-accent-primary" />
                    <div className="mt-3 grid grid-cols-3 gap-3 pt-3 border-t border-app-border">
                      <div className="text-center">
                        <p className="text-app-accent-primary font-bold text-lg">{latestExamScore}%</p>
                        <p className="text-app-text-muted text-[10px]">Lần gần nhất</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold text-lg">{avgExamScore}%</p>
                        <p className="text-app-text-muted text-[10px]">Trung bình</p>
                      </div>
                      <div className="text-center">
                        <p className="text-app-accent-success font-bold text-lg">{Math.max(...examTrend)}%</p>
                        <p className="text-app-text-muted text-[10px]">Cao nhất</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-app-surface/50">
                      <div className="w-3 h-0.5 bg-app-accent-primary"></div>
                      <span className="text-app-text-muted text-[10px]">Ngưỡng đậu EPS: 80%</span>
                      {latestExamScore >= 80 ? (
                        <span className="ml-auto text-app-accent-success text-[10px] font-bold">Đã đạt!</span>
                      ) : (
                        <span className="ml-auto text-app-text-muted text-[10px]">Còn {80 - latestExamScore}%</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <i className="ri-bar-chart-line text-white/10 text-3xl mb-2"></i>
                    <p className="text-app-text-muted text-sm">Cần ít nhất 2 lần thi để hiển thị biểu đồ</p>
                    <button onClick={() => navigate("/eps-exam")} className="mt-3 text-app-accent-primary text-xs cursor-pointer">Thi thử ngay →</button>
                  </div>
                )}
              </div>

              {/* Goal prediction */}
              <div className="bg-app-bg border border-app-border rounded-2xl p-6">
                <h3 className="text-white font-semibold text-sm mb-4">Dự đoán đạt mục tiêu EPS</h3>
                <div className="flex items-center justify-center mb-5">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke={latestExamScore >= 80 ? "#34d399" : "app-accent-primary"}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(latestExamScore / 100) * 251.2} 251.2`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-white font-bold text-2xl">{latestExamScore || 0}%</p>
                      <p className="text-app-text-muted text-[10px]">Điểm hiện tại</p>
                    </div>
                  </div>
                </div>
                {latestExamScore >= 80 ? (
                  <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <i className="ri-trophy-fill text-app-accent-success text-2xl mb-2 block"></i>
                    <p className="text-app-accent-success font-bold text-sm">Đã đạt ngưỡng đậu EPS!</p>
                    <p className="text-app-text-secondary text-xs mt-1">Tiếp tục duy trì và ôn luyện</p>
                  </div>
                ) : daysToGoal !== null ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-3 py-2.5 bg-app-surface/50 rounded-xl">
                      <span className="text-app-text-secondary text-xs">Cần đạt thêm</span>
                      <span className="text-app-accent-primary font-bold text-sm">{80 - (latestExamScore || 0)}%</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2.5 bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl">
                      <span className="text-app-accent-primary/70 text-xs">Dự đoán đạt mục tiêu</span>
                      <span className="text-app-accent-primary font-bold text-sm">~{daysToGoal} lần thi nữa</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-app-text-muted text-sm">Thi thêm để có dự đoán chính xác hơn</p>
                    <button onClick={() => navigate("/eps-exam")} className="mt-3 text-app-accent-primary text-xs cursor-pointer">Thi thử ngay →</button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Thi thử EPS", icon: "ri-file-list-3-line", color: "app-accent-primary", route: "/eps-exam" },
                { label: "Thi theo chủ đề", icon: "ri-focus-3-line", color: "#34d399", route: "/eps-topic-exam" },
                { label: "Phân tích điểm yếu", icon: "ri-bar-chart-2-line", color: "#a78bfa", route: "/eps-weakness-analysis" },
                { label: "Lịch sử thi", icon: "ri-history-line", color: "#fb923c", route: "/eps-exam-history" },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.route)}
                  className="flex flex-col items-center gap-2 p-4 bg-app-bg border border-app-border rounded-2xl hover:border-app-border transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${item.color}15` }}>
                    <i className={`${item.icon} text-lg`} style={{ color: item.color }}></i>
                  </div>
                  <span className="text-white/60 text-xs text-center">{item.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Tab: Streak Calendar */}
        {activeTab === "streak" && (
          <div className="space-y-5">
            <StreakCalendar xpLog={xpLog} />
            {/* Streak stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Streak hiện tại", value: `${streak.currentStreak} ngày`, color: "#fb923c", icon: "ri-fire-line" },
                { label: "Tổng ngày học", value: new Set(xpLog.map(e => e.date?.split("T")[0]).filter(Boolean)).size, color: "#34d399", icon: "ri-calendar-check-line" },
                { label: "Tháng này", value: xpLog.filter(e => e.date?.startsWith(new Date().toISOString().slice(0, 7))).length > 0
                  ? new Set(xpLog.filter(e => e.date?.startsWith(new Date().toISOString().slice(0, 7))).map(e => e.date?.split("T")[0])).size
                  : 0, color: "app-accent-primary", icon: "ri-calendar-line" },
              ].map(s => (
                <div key={s.label} className="bg-app-bg border border-app-border rounded-2xl p-5 text-center">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto mb-3" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
                  </div>
                  <p className="font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-app-text-secondary text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Weakness */}
        {activeTab === "weakness" && <WeaknessAnalysis examResults={examResults} />}

        {/* Tab: XP */}
        {activeTab === "xp" && <XPBreakdown xpLog={xpLog} />}
      </div>
    </DashboardLayout>
  );
}

