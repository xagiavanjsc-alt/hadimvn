import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SRSData {
  [cardId: string]: {
    interval: number;
    easeFactor: number;
    repetitions: number;
    nextReview: string;
    lastRating: number;
  };
}

interface DayActivity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

// ─── Heatmap Cell ─────────────────────────────────────────────────────────────
function HeatmapCell({ day }: { day: DayActivity }) {
  const colors = [
    "bg-app-card/50",
    "bg-emerald-500/20",
    "bg-emerald-500/40",
    "bg-emerald-500/65",
    "bg-emerald-500",
  ];
  const date = new Date(day.date);
  const label = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  return (
    <div
      className={`w-3 h-3 rounded-sm ${colors[day.level]} cursor-default transition-all hover:scale-125`}
      title={`${label}: ${day.count} từ`}
    ></div>
  );
}

// ─── Generate heatmap data ────────────────────────────────────────────────────
function generateHeatmap(srsData: SRSData): DayActivity[] {
  const days: DayActivity[] = [];
  const now = new Date();
  const activityMap: Record<string, number> = {};

  // Simulate activity from SRS data
  Object.values(srsData).forEach(card => {
    const d = new Date(card.nextReview);
    d.setDate(d.getDate() - card.interval);
    const key = d.toISOString().split("T")[0];
    activityMap[key] = (activityMap[key] || 0) + 1;
  });

  // Fill 52 weeks (364 days)
  for (let i = 363; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().split("T")[0];
    // Chỉ dùng data thật từ SRS — không bịa fake data
    const count = activityMap[key] || 0;
    const level = count === 0 ? 0 : count < 3 ? 1 : count < 7 ? 2 : count < 12 ? 3 : 4;
    days.push({ date: key, count, level: level as 0 | 1 | 2 | 3 | 4 });
  }
  return days;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VocabStatsPage() {
  const [totalVocab, setTotalVocab] = useState(0);
  const [categoryStats, setCategoryStats] = useState<{ category: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [srsData] = useLocalStorage<SRSData>("kts_srs_flashcard_level", {});
  const [masteredWords] = useLocalStorage<string[]>("kts_mastered_vocab", []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("hanja_vocab_entries")
        .select("category, difficulty");
      if (data) {
        setTotalVocab(data.length);
        const catMap: Record<string, number> = {};
        data.forEach((r: { category: string }) => {
          catMap[r.category] = (catMap[r.category] || 0) + 1;
        });
        setCategoryStats(Object.entries(catMap).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count));
      }
      setLoading(false);
    };
    load();
  }, []);

  const heatmapData = useMemo(() => generateHeatmap(srsData), [srsData]);

  // SRS stats
  const srsEntries = Object.values(srsData);
  const totalReviewed = srsEntries.length;
  const masteredCount = masteredWords.length;
  const avgInterval = srsEntries.length > 0
    ? Math.round(srsEntries.reduce((s, e) => s + e.interval, 0) / srsEntries.length)
    : 0;
  const avgEase = srsEntries.length > 0
    ? (srsEntries.reduce((s, e) => s + e.easeFactor, 0) / srsEntries.length).toFixed(2)
    : "2.50";

  // Prediction: words per day (estimate from heatmap)
  const recentDays = heatmapData.slice(-30);
  const activeDays = recentDays.filter(d => d.count > 0).length;
  const avgWordsPerDay = activeDays > 0
    ? Math.round(recentDays.reduce((s, d) => s + d.count, 0) / activeDays)
    : 5;
  const remaining = totalVocab - masteredCount;
  const daysToFinish = avgWordsPerDay > 0 ? Math.ceil(remaining / avgWordsPerDay) : 999;
  const finishDate = new Date();
  finishDate.setDate(finishDate.getDate() + daysToFinish);

  // Streak
  let currentStreak = 0;
  const today = new Date().toISOString().split("T")[0];
  for (let i = heatmapData.length - 1; i >= 0; i--) {
    if (heatmapData[i].count > 0) currentStreak++;
    else if (heatmapData[i].date !== today) break;
  }

  // Weekly activity
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const found = heatmapData.find(h => h.date === key);
    return {
      day: d.toLocaleDateString("vi-VN", { weekday: "short" }),
      count: found?.count || 0,
    };
  });
  const maxWeekly = Math.max(...weeklyData.map(w => w.count), 1);

  // Rating distribution
  const ratingDist = [1, 2, 3, 4, 5].map(r => ({
    rating: r,
    count: srsEntries.filter(e => e.lastRating === r).length,
    label: ["Không nhớ", "Khó", "Nhớ được", "Dễ", "Rất dễ"][r - 1],
    color: ["#f87171", "#fb923c", "app-accent-primary", "#34d399", "#a78bfa"][r - 1],
  }));
  const maxRating = Math.max(...ratingDist.map(r => r.count), 1);

  // Weeks grid for heatmap
  const weeks: DayActivity[][] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  return (
    <DashboardLayout
      title="Thống kê từ vựng cá nhân"
      subtitle="Heatmap ôn tập, tốc độ học và dự đoán thời gian thuộc hết"
    >
      {/* Top stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: "Tổng từ vựng", value: totalVocab, icon: "ri-book-open-line", color: "app-accent-primary", sub: "trong database" },
          { label: "Đã thuộc", value: masteredCount, icon: "ri-check-double-line", color: "#34d399", sub: `${totalVocab > 0 ? Math.round((masteredCount / totalVocab) * 100) : 0}% tổng số` },
          { label: "Đã ôn tập", value: totalReviewed, icon: "ri-refresh-line", color: "#fb923c", sub: "lần với SRS" },
          { label: "Streak hiện tại", value: `${currentStreak} ngày`, icon: "ri-fire-line", color: "#f87171", sub: "liên tiếp" },
          { label: "Interval TB", value: `${avgInterval} ngày`, icon: "ri-calendar-line", color: "#a78bfa", sub: `Ease: ${avgEase}` },
        ].map(s => (
          <div key={s.label} className="bg-app-bg border border-app-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
              </div>
              <p className="text-app-text-secondary text-[10px]">{s.label}</p>
            </div>
            <p className="text-white font-bold text-xl">{loading ? "..." : s.value}</p>
            <p className="text-app-text-muted text-[10px] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Heatmap */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">Heatmap ôn tập (52 tuần)</h3>
              <div className="flex items-center gap-2 text-[10px] text-app-text-muted">
                <span>Ít</span>
                {[0, 1, 2, 3, 4].map(l => (
                  <div key={l} className={`w-3 h-3 rounded-sm ${["bg-app-card/50", "bg-emerald-500/20", "bg-emerald-500/40", "bg-emerald-500/65", "bg-emerald-500"][l]}`}></div>
                ))}
                <span>Nhiều</span>
              </div>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1 flex-shrink-0">
                  {week.map((day, di) => (
                    <HeatmapCell key={di} day={day} />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-app-text-muted">
              <span>52 tuần trước</span>
              <span>Hôm nay</span>
            </div>
          </div>

          {/* Weekly bar chart */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Hoạt động 7 ngày gần nhất</h3>
            <div className="flex items-end gap-3 h-32">
              {weeklyData.map((w, i) => {
                const pct = (w.count / maxWeekly) * 100;
                const isToday = i === 6;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-app-text-secondary text-[10px]">{w.count}</span>
                    <div className="w-full flex items-end" style={{ height: "80px" }}>
                      <div
                        className="w-full rounded-t-lg transition-all duration-500"
                        style={{
                          height: `${Math.max(pct, 4)}%`,
                          backgroundColor: isToday ? "app-accent-primary" : "rgba(255,255,255,0.1)",
                        }}
                      ></div>
                    </div>
                    <span className={`text-[10px] ${isToday ? "text-app-accent-primary font-bold" : "text-app-text-muted"}`}>{w.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Từ vựng theo chủ đề</h3>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-app-card/50 rounded-lg animate-pulse"></div>)}
              </div>
            ) : (
              <div className="space-y-2.5">
                {categoryStats.map((cat, i) => {
                  const pct = totalVocab > 0 ? (cat.count / totalVocab) * 100 : 0;
                  const colors = ["app-accent-primary", "#34d399", "#fb923c", "#f87171", "#a78bfa", "#84cc16", "#06b6d4", "#f472b6"];
                  const color = colors[i % colors.length];
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/60 text-xs">{cat.category}</span>
                        <span className="text-xs font-bold" style={{ color }}>{cat.count} từ</span>
                      </div>
                      <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Prediction card */}
          <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <i className="ri-time-line text-app-accent-primary text-sm"></i>
              <h3 className="text-white font-semibold text-sm">Dự đoán hoàn thành</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-app-text-secondary text-xs">Còn lại</span>
                <span className="text-white font-bold">{remaining} từ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-app-text-secondary text-xs">Tốc độ TB</span>
                <span className="text-app-accent-primary font-bold">{avgWordsPerDay} từ/ngày</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-app-text-secondary text-xs">Thời gian ước tính</span>
                <span className="text-white font-bold">{daysToFinish} ngày</span>
              </div>
              <div className="h-px bg-white/8 my-2"></div>
              <div className="text-center">
                <p className="text-app-text-muted text-xs mb-1">Dự kiến hoàn thành</p>
                <p className="text-app-accent-primary font-bold text-lg">
                  {finishDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </p>
              </div>
            </div>
            {/* Progress ring */}
            <div className="flex justify-center mt-4">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke="app-accent-primary" strokeWidth="3"
                    strokeDasharray={`${totalVocab > 0 ? (masteredCount / totalVocab) * 94.2 : 0} 94.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-app-accent-primary font-black text-lg">{totalVocab > 0 ? Math.round((masteredCount / totalVocab) * 100) : 0}%</span>
                  <span className="text-app-text-muted text-[9px]">hoàn thành</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rating distribution */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Phân bố đánh giá SRS</h3>
            {srsEntries.length === 0 ? (
              <p className="text-app-text-muted text-xs text-center py-4">Chưa có dữ liệu SRS. Hãy học flashcard!</p>
            ) : (
              <div className="space-y-2.5">
                {ratingDist.map(r => (
                  <div key={r.rating}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold w-3" style={{ color: r.color }}>{r.rating}</span>
                        <span className="text-app-text-secondary text-xs">{r.label}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: r.color }}>{r.count}</span>
                    </div>
                    <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(r.count / maxRating) * 100}%`, backgroundColor: r.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Study tips */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-robot-line text-app-accent-primary text-sm"></i>
              <h3 className="text-white font-semibold text-sm">Phân tích AI</h3>
            </div>
            <div className="space-y-2 text-xs text-app-text-secondary leading-relaxed">
              {masteredCount < 50 && (
                <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Hãy tập trung ôn tập từ cơ bản (A1) trước để xây nền tảng vững chắc.</p>
              )}
              {avgWordsPerDay < 5 && (
                <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Tăng tốc độ học lên 10 từ/ngày để hoàn thành nhanh hơn.</p>
              )}
              {currentStreak < 7 && (
                <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Duy trì streak 7 ngày liên tiếp để tăng hiệu quả ghi nhớ.</p>
              )}
              {avgInterval > 10 && (
                <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Interval trung bình cao — bạn đang ghi nhớ tốt! Tiếp tục duy trì.</p>
              )}
              <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Học đều đặn mỗi ngày hiệu quả hơn học dồn vào cuối tuần.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

