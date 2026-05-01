import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

interface WeeklyRow { day: string; minutes: number; words: number }
interface MonthlyRow { month: string; minutes: number; words: number; lessons: number }

export default function StudyStatsDetailPage() {
  const { user } = useAuth();
  const [view, setView] = useState<"week" | "month">("week");
  const [completedLessons] = useLocalStorage<Record<number, { score: number; completedAt: string }>>("kts_eps_lessons_progress", {});
  const [weeklyData, setWeeklyData] = useState<WeeklyRow[]>(
    Array.from({ length: 7 }, (_, i) => ({ day: DAYS[i], minutes: 0, words: 0 }))
  );
  const [monthlyData, setMonthlyData] = useState<MonthlyRow[]>(
    Array.from({ length: 12 }, (_, i) => ({ month: MONTHS[i], minutes: 0, words: 0, lessons: 0 }))
  );

  // Load data thật từ bảng study_history
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      // 7 ngày gần nhất cho weekly
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];

      const { data: weekRows } = await supabase
        .from("study_history")
        .select("study_date, study_time, vocab_count, grammar_count")
        .eq("user_id", user.id)
        .gte("study_date", weekAgoStr);

      if (cancelled) return;

      // Gom theo thứ trong tuần (0=CN, 1=T2, ...)
      const weeklyMap: Record<number, WeeklyRow> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayIdx = d.getDay();
        weeklyMap[i] = { day: DAYS[dayIdx], minutes: 0, words: 0 };
      }
      for (const row of weekRows || []) {
        const rowDate = new Date(row.study_date);
        const diffDays = Math.floor((Date.now() - rowDate.getTime()) / (1000 * 60 * 60 * 24));
        const idx = 6 - diffDays;
        if (idx >= 0 && idx < 7) {
          weeklyMap[idx].minutes += Math.round((row.study_time || 0) / 60);
          weeklyMap[idx].words += row.vocab_count || 0;
        }
      }
      setWeeklyData(Object.values(weeklyMap));

      // 12 tháng gần nhất cho monthly
      const yearAgo = new Date();
      yearAgo.setMonth(yearAgo.getMonth() - 11);
      yearAgo.setDate(1);
      const yearAgoStr = yearAgo.toISOString().split("T")[0];

      const { data: monthRows } = await supabase
        .from("study_history")
        .select("study_date, study_time, vocab_count, grammar_count")
        .eq("user_id", user.id)
        .gte("study_date", yearAgoStr);

      if (cancelled) return;

      const monthlyAgg: Record<number, MonthlyRow> = {};
      for (let i = 0; i < 12; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        monthlyAgg[i] = { month: MONTHS[d.getMonth()], minutes: 0, words: 0, lessons: 0 };
      }
      for (const row of monthRows || []) {
        const rowDate = new Date(row.study_date);
        const monthDiff =
          (new Date().getFullYear() - rowDate.getFullYear()) * 12 +
          (new Date().getMonth() - rowDate.getMonth());
        const idx = 11 - monthDiff;
        if (idx >= 0 && idx < 12) {
          monthlyAgg[idx].minutes += Math.round((row.study_time || 0) / 60);
          monthlyAgg[idx].words += row.vocab_count || 0;
          monthlyAgg[idx].lessons += row.grammar_count || 0;
        }
      }
      setMonthlyData(Object.values(monthlyAgg));
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  const totalLessons = Object.keys(completedLessons).length;
  const totalWords = useMemo(() => monthlyData.reduce((s, d) => s + d.words, 0), [monthlyData]);
  const totalMinutes = useMemo(() => monthlyData.reduce((s, d) => s + d.minutes, 0), [monthlyData]);
  const avgScore = totalLessons > 0
    ? Math.round(Object.values(completedLessons).reduce((s, v) => s + v.score, 0) / totalLessons * 10)
    : 0;

  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 1);
  const maxMonthMinutes = Math.max(...monthlyData.map(d => d.minutes), 1);

  const recentActivity = Object.entries(completedLessons)
    .sort((a, b) => new Date(b[1].completedAt).getTime() - new Date(a[1].completedAt).getTime())
    .slice(0, 8);

  return (
    <DashboardLayout title="Thống kê học tập chi tiết" subtitle="Biểu đồ tiến độ theo tuần/tháng, thời gian học và từ vựng đã học">
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Bài đã học", value: totalLessons, icon: "ri-book-open-line", color: "#e8c84a" },
          { label: "Từ vựng", value: `~${totalWords}`, icon: "ri-translate-2", color: "#34d399" },
          { label: "Thời gian (phút)", value: totalMinutes, icon: "ri-time-line", color: "#a78bfa" },
          { label: "Điểm TB", value: `${avgScore}%`, icon: "ri-star-line", color: "#fb923c" },
        ].map(s => (
          <div key={s.label} className="bg-[#0f1117] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{s.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold text-sm">Thời gian học</h3>
            <p className="text-white/40 text-xs mt-0.5">Phút học mỗi {view === "week" ? "ngày" : "tháng"}</p>
          </div>
          <div className="flex rounded-lg border border-white/8 overflow-hidden">
            {(["week", "month"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${view === v ? "bg-[#e8c84a]/15 text-[#e8c84a]" : "text-white/40 hover:text-white/60"}`}>
                {v === "week" ? "Tuần" : "Tháng"}
              </button>
            ))}
          </div>
        </div>

        {view === "week" ? (
          <div className="flex items-end gap-2 h-40">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <p className="text-white/40 text-[10px]">{d.minutes}p</p>
                <div className="w-full rounded-t-md bg-[#e8c84a]/20 hover:bg-[#e8c84a]/35 transition-colors cursor-default"
                  style={{ height: `${(d.minutes / maxMinutes) * 100}px`, minHeight: "4px" }} />
                <p className="text-white/40 text-[10px]">{d.day}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-end gap-1.5 h-40">
            {monthlyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-[#a78bfa]/25 hover:bg-[#a78bfa]/40 transition-colors cursor-default"
                  style={{ height: `${(d.minutes / maxMonthMinutes) * 100}px`, minHeight: "4px" }} />
                <p className="text-white/30 text-[9px]">{d.month}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Từ vựng theo tuần */}
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Từ vựng học mỗi ngày</h3>
          <div className="space-y-2">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <p className="text-white/40 text-xs w-6">{d.day}</p>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#34d399]" style={{ width: `${(d.words / 35) * 100}%` }} />
                </div>
                <p className="text-white/40 text-xs w-8 text-right">{d.words}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hoạt động gần đây */}
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Bài học gần đây</h3>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-white/30">
              <i className="ri-book-open-line text-3xl mb-2 block"></i>
              <p className="text-sm">Chưa có bài học nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map(([id, data]) => (
                <div key={id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/2 border border-white/5">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#e8c84a]/10 flex-shrink-0">
                    <span className="text-[#e8c84a] text-xs font-bold">{id}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs font-medium">Bài {id}</p>
                    <p className="text-white/30 text-[10px]">{new Date(data.completedAt).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <span className="text-emerald-400 text-xs font-bold">{data.score} đúng</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly summary */}
      <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5 mt-6">
        <h3 className="text-white font-semibold text-sm mb-4">Tổng kết theo tháng</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/30 border-b border-white/5">
                <th className="text-left pb-2 font-medium">Tháng</th>
                <th className="text-right pb-2 font-medium">Thời gian</th>
                <th className="text-right pb-2 font-medium">Từ vựng</th>
                <th className="text-right pb-2 font-medium">Bài học</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((d, i) => (
                <tr key={i} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                  <td className="py-2 text-white/60">{d.month}</td>
                  <td className="py-2 text-right text-white/50">{d.minutes}p</td>
                  <td className="py-2 text-right text-[#34d399]">{d.words}</td>
                  <td className="py-2 text-right text-[#e8c84a]">{d.lessons}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
