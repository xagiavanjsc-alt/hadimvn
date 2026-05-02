import { useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ExamResult {
  id: string;
  date: string;
  score: number;
  total: number;
  timeUsed: number;
}

function getWeekKey(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0];
}

function getWeekLabel(weekKey: string) {
  const start = new Date(weekKey);
  const end = new Date(weekKey);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} – ${end.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}`;
}

interface WeekStat {
  weekKey: string;
  label: string;
  avgScore: number;
  maxScore: number;
  count: number;
  results: ExamResult[];
}

export default function EpsWeeklyProgressPage() {
  const [realResults] = useLocalStorage<ExamResult[]>("kts_eps_exam_history", []);
  const results = realResults;

  const weekStats = useMemo<WeekStat[]>(() => {
    const map: Record<string, ExamResult[]> = {};
    results.forEach(r => {
      const wk = getWeekKey(r.date);
      if (!map[wk]) map[wk] = [];
      map[wk].push(r);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekKey, rs]) => {
        const pcts = rs.map(r => Math.round((r.score / r.total) * 100));
        return {
          weekKey,
          label: getWeekLabel(weekKey),
          avgScore: Math.round(pcts.reduce((s, v) => s + v, 0) / pcts.length),
          maxScore: Math.max(...pcts),
          count: rs.length,
          results: rs,
        };
      })
      .slice(-8); // last 8 weeks
  }, [results]);

  const currentWeek = weekStats[weekStats.length - 1];
  const prevWeek = weekStats[weekStats.length - 2];
  const twoWeeksAgo = weekStats[weekStats.length - 3];

  const weekDiff = currentWeek && prevWeek ? currentWeek.avgScore - prevWeek.avgScore : 0;
  const trend = weekStats.length >= 3
    ? weekStats.slice(-4).map(w => w.avgScore)
    : [];

  // Linear regression prediction
  const predictedScore = useMemo(() => {
    if (weekStats.length < 3) return null;
    const n = weekStats.length;
    const xs = weekStats.map((_, i) => i);
    const ys = weekStats.map(w => w.avgScore);
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
    const sumX2 = xs.reduce((s, x) => s + x * x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const nextWeek = Math.round(intercept + slope * n);
    const weeksTo80 = slope > 0 && currentWeek.avgScore < 80
      ? Math.ceil((80 - (intercept + slope * (n - 1))) / slope)
      : null;
    return { nextWeek: Math.min(100, Math.max(0, nextWeek)), slope, weeksTo80 };
  }, [weekStats]);

  const maxBar = Math.max(...weekStats.map(w => w.avgScore), 80);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#34d399";
    if (score >= 60) return "app-accent-primary";
    return "#f87171";
  };

  const allResults = results
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <DashboardLayout title="Phân tích tiến bộ EPS theo tuần" subtitle="So sánh điểm thi tuần này vs tuần trước · Dự đoán điểm thi thật">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Top summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* This week avg */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-4">
            <p className="text-app-text-secondary text-xs mb-2">Tuần này (TB)</p>
            <p className="text-3xl font-extrabold" style={{ color: getScoreColor(currentWeek?.avgScore ?? 0) }}>
              {currentWeek?.avgScore ?? "—"}%
            </p>
            <div className="flex items-center gap-1 mt-1">
              {weekDiff !== 0 && (
                <>
                  <i className={`text-xs ${weekDiff > 0 ? "ri-arrow-up-line text-app-accent-success" : "ri-arrow-down-line text-red-400"}`}></i>
                  <span className={`text-xs font-semibold ${weekDiff > 0 ? "text-app-accent-success" : "text-red-400"}`}>
                    {weekDiff > 0 ? "+" : ""}{weekDiff}% so với tuần trước
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Best score */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-4">
            <p className="text-app-text-secondary text-xs mb-2">Điểm cao nhất</p>
            <p className="text-3xl font-extrabold text-app-accent-primary">
              {currentWeek?.maxScore ?? Math.max(...results.map(r => Math.round((r.score / r.total) * 100)))}%
            </p>
            <p className="text-app-text-muted text-xs mt-1">Tuần này</p>
          </div>

          {/* Exams count */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-4">
            <p className="text-app-text-secondary text-xs mb-2">Số lần thi</p>
            <p className="text-3xl font-extrabold text-white">{results.length}</p>
            <p className="text-app-text-muted text-xs mt-1">Tổng cộng · {currentWeek?.count ?? 0} tuần này</p>
          </div>

          {/* Prediction */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-4">
            <p className="text-app-text-secondary text-xs mb-2">Dự đoán tuần tới</p>
            <p className="text-3xl font-extrabold" style={{ color: getScoreColor(predictedScore?.nextWeek ?? 0) }}>
              {predictedScore?.nextWeek ?? "—"}%
            </p>
            <p className="text-app-text-muted text-xs mt-1">
              {predictedScore?.slope && predictedScore.slope > 0 ? `+${predictedScore.slope.toFixed(1)}%/tuần` : "Xu hướng ổn định"}
            </p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold text-sm">Biểu đồ điểm trung bình theo tuần</h2>
            <div className="flex items-center gap-3 text-[10px] text-app-text-muted">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-app-accent-primary/30"></div>Điểm TB</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500/30"></div>Điểm cao nhất</div>
              <div className="flex items-center gap-1 border-l border-app-border pl-3"><div className="w-6 h-0.5 bg-red-400/50 border-dashed border-t border-red-400/50"></div>Ngưỡng đậu 80%</div>
            </div>
          </div>

          <div className="relative">
            {/* 80% threshold line */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-red-400/30 z-10 flex items-center"
              style={{ bottom: `${(80 / maxBar) * 180}px` }}
            >
              <span className="text-red-400/50 text-[9px] ml-1 bg-app-bg px-1">80%</span>
            </div>

            <div className="flex items-end gap-2 h-48 pt-4">
              {weekStats.map((week, i) => {
                const isLast = i === weekStats.length - 1;
                const avgH = (week.avgScore / maxBar) * 180;
                const maxH = (week.maxScore / maxBar) * 180;
                const avgColor = getScoreColor(week.avgScore);
                return (
                  <div key={week.weekKey} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1a1d27] border border-app-border rounded-xl px-3 py-2 text-[10px] text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                      <p className="font-bold" style={{ color: avgColor }}>{week.avgScore}% TB · {week.maxScore}% max</p>
                      <p className="text-app-text-secondary">{week.count} lần thi · {week.label}</p>
                    </div>

                    <div className="w-full flex items-end gap-0.5 justify-center" style={{ height: "180px" }}>
                      {/* Max bar (lighter) */}
                      <div
                        className="w-2 rounded-t-sm transition-all duration-500"
                        style={{ height: `${maxH}px`, backgroundColor: `${avgColor}30` }}
                      />
                      {/* Avg bar */}
                      <div
                        className={`flex-1 rounded-t-lg transition-all duration-500 ${isLast ? "ring-1 ring-offset-1 ring-offset-[#0f1117]" : ""}`}
                        style={{ height: `${avgH}px`, backgroundColor: isLast ? avgColor : `${avgColor}70` }}
                      />
                    </div>
                    <p className="text-app-text-muted text-[9px] text-center leading-tight">{week.label.split("–")[0]}</p>
                    {isLast && <span className="text-[8px] text-app-accent-primary font-bold">Tuần này</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Week comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* This week vs last week */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">So sánh tuần này vs tuần trước</h3>
            {currentWeek && prevWeek ? (
              <div className="space-y-4">
                {[
                  { label: "Điểm trung bình", curr: currentWeek.avgScore, prev: prevWeek.avgScore, unit: "%" },
                  { label: "Điểm cao nhất", curr: currentWeek.maxScore, prev: prevWeek.maxScore, unit: "%" },
                  { label: "Số lần thi", curr: currentWeek.count, prev: prevWeek.count, unit: " lần" },
                ].map(item => {
                  const diff = item.curr - item.prev;
                  const color = diff > 0 ? "#34d399" : diff < 0 ? "#f87171" : "app-accent-primary";
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-white/50 text-xs">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-app-text-muted text-xs">{item.prev}{item.unit}</span>
                          <i className="ri-arrow-right-line text-app-text-muted text-xs"></i>
                          <span className="text-white text-xs font-bold">{item.curr}{item.unit}</span>
                          {diff !== 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
                              {diff > 0 ? "+" : ""}{diff}{item.unit}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (item.curr / Math.max(item.curr, item.prev, 1)) * 100)}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-app-text-muted text-sm text-center py-4">Cần ít nhất 2 tuần dữ liệu</p>
            )}
          </div>

          {/* Prediction */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Dự đoán & Mục tiêu</h3>
            {predictedScore ? (
              <div className="space-y-4">
                <div className="bg-app-surface/50 rounded-xl p-4 text-center">
                  <p className="text-app-text-secondary text-xs mb-1">Dự đoán điểm thi thật</p>
                  <p className="text-4xl font-extrabold" style={{ color: getScoreColor(predictedScore.nextWeek) }}>
                    {predictedScore.nextWeek}%
                  </p>
                  <p className="text-app-text-muted text-xs mt-1">
                    Dựa trên xu hướng {weekStats.length} tuần gần nhất
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-xs">Tốc độ cải thiện</span>
                    <span className={`text-xs font-bold ${predictedScore.slope > 0 ? "text-app-accent-success" : "text-red-400"}`}>
                      {predictedScore.slope > 0 ? "+" : ""}{predictedScore.slope.toFixed(1)}%/tuần
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-xs">Ngưỡng đậu EPS (80%)</span>
                    {currentWeek?.avgScore >= 80 ? (
                      <span className="text-app-accent-success text-xs font-bold">✅ Đã đạt!</span>
                    ) : predictedScore.weeksTo80 && predictedScore.weeksTo80 > 0 ? (
                      <span className="text-app-accent-primary text-xs font-bold">~{predictedScore.weeksTo80} tuần nữa</span>
                    ) : (
                      <span className="text-red-400 text-xs">Cần tăng tốc độ học</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-xs">Đánh giá</span>
                    <span className="text-xs font-bold" style={{ color: getScoreColor(predictedScore.nextWeek) }}>
                      {predictedScore.nextWeek >= 80 ? "Sẵn sàng thi thật! 🏆" : predictedScore.nextWeek >= 60 ? "Đang tiến bộ tốt 💪" : "Cần ôn luyện thêm 📚"}
                    </span>
                  </div>
                </div>

                {/* Progress to 80% */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-app-text-secondary text-xs">Tiến độ đến ngưỡng đậu</span>
                    <span className="text-app-text-secondary text-xs">{currentWeek?.avgScore ?? 0}% / 80%</span>
                  </div>
                  <div className="h-2 bg-app-card/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, ((currentWeek?.avgScore ?? 0) / 80) * 100)}%`,
                        backgroundColor: getScoreColor(currentWeek?.avgScore ?? 0),
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-app-text-muted text-sm text-center py-4">Cần ít nhất 3 tuần dữ liệu để dự đoán</p>
            )}
          </div>
        </div>

        {/* Trend mini chart */}
        {trend.length >= 3 && (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Xu hướng 4 tuần gần nhất</h3>
            <div className="flex items-end gap-4 h-20">
              {trend.map((score, i) => {
                const isLast = i === trend.length - 1;
                const color = getScoreColor(score);
                const h = (score / 100) * 72;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold" style={{ color }}>{score}%</span>
                    <div className="w-full rounded-t-lg" style={{ height: `${h}px`, backgroundColor: isLast ? color : `${color}50` }} />
                    <span className="text-app-text-muted text-[9px]">T-{trend.length - 1 - i === 0 ? "0 (nay)" : trend.length - 1 - i}</span>
                  </div>
                );
              })}
              {predictedScore && (
                <>
                  <div className="w-px h-16 bg-app-card/70 self-end mb-4"></div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-app-text-secondary">{predictedScore.nextWeek}%</span>
                    <div
                      className="w-full rounded-t-lg border-2 border-dashed"
                      style={{
                        height: `${(predictedScore.nextWeek / 100) * 72}px`,
                        borderColor: `${getScoreColor(predictedScore.nextWeek)}60`,
                        backgroundColor: `${getScoreColor(predictedScore.nextWeek)}15`,
                      }}
                    />
                    <span className="text-app-text-muted text-[9px]">Dự đoán</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Recent exams table */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">10 lần thi gần nhất</h3>
          <div className="space-y-2">
            {allResults.map((r, i) => {
              const pct = Math.round((r.score / r.total) * 100);
              const color = getScoreColor(pct);
              const weekKey = getWeekKey(r.date);
              const isThisWeek = currentWeek?.weekKey === weekKey;
              return (
                <div key={r.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isThisWeek ? "bg-app-accent-primary/5 border border-app-accent-primary/10" : "bg-app-surface/50"}`}>
                  <span className="text-app-text-muted text-xs w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                    <span className="text-sm font-extrabold" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs font-medium">{r.score}/{r.total} câu đúng</p>
                    <p className="text-app-text-muted text-[10px]">
                      {new Date(r.date).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })}
                      {" · "}{Math.floor(r.timeUsed / 60)} phút {r.timeUsed % 60}s
                      {isThisWeek && <span className="ml-1 text-app-accent-primary/60 font-semibold">· Tuần này</span>}
                    </p>
                  </div>
                  <div className="w-24 h-1.5 bg-app-card/50 rounded-full overflow-hidden flex-shrink-0">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <i className="ri-lightbulb-line text-app-accent-primary"></i>
            Gợi ý cải thiện
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                icon: "ri-error-warning-line",
                color: "#f87171",
                title: "Ôn câu sai",
                desc: "Tập trung vào các câu đã sai nhiều lần — đây là cách nhanh nhất để tăng điểm",
                path: "/eps-smart-wrong",
              },
              {
                icon: "ri-focus-3-line",
                color: "app-accent-primary",
                title: "Thi theo chủ đề yếu",
                desc: "Xác định chủ đề điểm thấp nhất và thi thử tập trung vào đó",
                path: "/eps-topic-exam",
              },
              {
                icon: "ri-calendar-check-line",
                color: "#34d399",
                title: "Lộ trình 30 ngày",
                desc: "Theo lộ trình có cấu trúc để cải thiện đều đặn mỗi ngày",
                path: "/eps-30day-plan",
              },
            ].map(item => (
              <a
                key={item.title}
                href={item.path}
                className="flex items-start gap-3 p-4 bg-app-surface/50 rounded-xl hover:bg-app-card/50 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                  <i className={`${item.icon} text-base`} style={{ color: item.color }}></i>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-semibold mb-0.5">{item.title}</p>
                  <p className="text-white/35 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
