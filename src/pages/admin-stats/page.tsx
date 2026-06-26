import { useMemo, useState, useEffect } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ApprovedLesson } from "@/types/melon";
import type { EbookSeries } from "@/types/ebook";
import { epsQuestions } from "@/mocks/epsQuestions";
import { epsVocabulary } from "@/mocks/epsVocabulary";
import { exportRevenueCSV } from "@/utils/exportUtils";
import { supabase } from "@/lib/supabase";

interface RevenueEntry {
  id: string;
  seriesId: string;
  buyerName: string;
  amount: number;
  date: string;
}

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <i className={`${icon} text-base`} style={{ color }}></i>
        </div>
      </div>
      <p className="text-white text-2xl font-bold">{value}</p>
      <p className="text-app-text-secondary text-xs mt-1">{label}</p>
      {sub && <p className="text-app-text-muted text-[10px] mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex-1 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function AdminStatsPage() {
  const [approvedLessons] = useLocalStorage<ApprovedLesson[]>("kts_melon_lessons", []);
  const [seriesList] = useLocalStorage<EbookSeries[]>("kts_series_list", []);
  const [revenues] = useLocalStorage<RevenueEntry[]>("kts_revenues", []);

  // Real Supabase stats
  const [dbStats, setDbStats] = useState({ totalExams: 0, totalUsers: 0, totalVip: 0, avgScore: 0, recentExams: 0 });
  useEffect(() => {
    const fetchDbStats = async () => {
      const [usersRes, examsRes, vipRes] = await Promise.all([
        supabase.from("user_profiles").select("id", { count: "exact", head: true }),
        supabase.from("exam_results").select("score, total, taken_at"),
        supabase.from("user_profiles").select("id", { count: "exact", head: true }).eq("is_vip", true),
      ]);
      const exams = examsRes.data || [];
      const avgScore = exams.length > 0
        ? Math.round(exams.reduce((s, e) => s + (e.total > 0 ? (e.score / e.total) * 100 : 0), 0) / exams.length)
        : 0;
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const recentExams = exams.filter(e => e.taken_at >= sevenDaysAgo).length;
      setDbStats({
        totalUsers: usersRes.count || 0,
        totalExams: exams.length,
        totalVip: vipRes.count || 0,
        avgScore,
        recentExams,
      });
    };
    fetchDbStats();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0);
    const thisMonth = new Date();
    const monthRevenue = revenues.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear();
    }).reduce((s, r) => s + r.amount, 0);

    const highStarLessons = approvedLessons.filter(l => (l.stars ?? 0) >= 4).length;
    const epsWithImage = epsQuestions.filter(q => q.imageUrl).length;

    // Monthly revenue chart — last 6 months
    const monthlyChart: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString("vi-VN", { month: "short" });
      const value = revenues.filter(r => {
        const rd = new Date(r.date);
        return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
      }).reduce((s, r) => s + r.amount, 0);
      monthlyChart.push({ label, value });
    }

    // Series performance
    const seriesPerf = seriesList.map(s => {
      const rev = revenues.filter(r => r.seriesId === s.id).reduce((sum, r) => sum + r.amount, 0);
      const sales = revenues.filter(r => r.seriesId === s.id).length;
      return { ...s, revenue: rev, sales };
    }).sort((a, b) => b.revenue - a.revenue);

    return { totalRevenue, monthRevenue, highStarLessons, epsWithImage, monthlyChart, seriesPerf };
  }, [approvedLessons, seriesList, revenues]);

  const formatVND = (n: number) => n.toLocaleString("vi-VN") + "đ";
  const maxChart = Math.max(...stats.monthlyChart.map(m => m.value), 1);

  const contentStats = [
    { label: "Câu hỏi EPS", value: epsQuestions.length, max: 200, color: "#e8c84a", icon: "ri-survey-line" },
    { label: "Câu có ảnh", value: stats.epsWithImage, max: epsQuestions.length, color: "#34d399", icon: "ri-image-line" },
    { label: "Từ vựng EPS", value: epsVocabulary.length, max: 500, color: "#fb923c", icon: "ri-translate-2" },
    { label: "Bài K-pop đã duyệt", value: approvedLessons.length, max: 100, color: "#a78bfa", icon: "ri-music-2-line" },
    { label: "Bài 4-5 sao", value: stats.highStarLessons, max: approvedLessons.length || 1, color: "#f59e0b", icon: "ri-star-fill" },
    { label: "Series ebook", value: seriesList.length, max: 20, color: "#06b6d4", icon: "ri-stack-line" },
  ];

  return (
    <AdminLayout
      title="Thống kê Nội dung"
      subtitle="Tổng quan về nội dung học tập và doanh thu ebook"
      actions={
        <button
          onClick={() => exportRevenueCSV(revenues)}
          className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap bg-emerald-500/10 text-app-accent-success border border-emerald-500/20 hover:bg-emerald-500/20"
        >
          <i className="ri-download-2-line"></i>
          Export doanh thu CSV
        </button>
      }
    >
      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4" style={{ contentVisibility: "auto", containIntrinsicHeight: "120px" }}>
        <StatCard icon="ri-money-dollar-circle-line" label="Tổng doanh thu" value={formatVND(stats.totalRevenue)} sub={`${revenues.length} đơn hàng`} color="#34d399" />
        <StatCard icon="ri-calendar-line" label="Doanh thu tháng này" value={formatVND(stats.monthRevenue)} color="#e8c84a" />
        <StatCard icon="ri-survey-line" label="Câu hỏi EPS" value={epsQuestions.length} sub={`${stats.epsWithImage} có ảnh`} color="#fb923c" />
        <StatCard icon="ri-music-2-line" label="Bài K-pop đã duyệt" value={approvedLessons.length} sub={`${stats.highStarLessons} bài 4-5 sao`} color="#a78bfa" />
      </div>
      {/* Real DB stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon="ri-user-line" label="Tổng học viên (DB)" value={dbStats.totalUsers} sub={`${dbStats.totalVip} VIP`} color="#06b6d4" />
        <StatCard icon="ri-file-list-3-line" label="Lượt thi thử (DB)" value={dbStats.totalExams} sub={`${dbStats.recentExams} tuần này`} color="#a78bfa" />
        <StatCard icon="ri-percent-line" label="Điểm TB (DB)" value={`${dbStats.avgScore}%`} sub="Tất cả bài thi" color="#f59e0b" />
        <StatCard icon="ri-vip-crown-line" label="Học viên VIP" value={dbStats.totalVip} sub={`${dbStats.totalUsers > 0 ? Math.round((dbStats.totalVip / dbStats.totalUsers) * 100) : 0}% tổng số`} color="#ec4899" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6" style={{ contentVisibility: "auto", containIntrinsicHeight: "400px" }}>
        {/* Revenue chart */}
        <div className="col-span-2 bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold text-sm">Doanh thu 6 tháng</h3>
              <p className="text-app-text-muted text-xs mt-0.5">Theo tháng (VNĐ)</p>
            </div>
          </div>
          {revenues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <i className="ri-bar-chart-2-line text-white/10 text-4xl mb-3"></i>
              <p className="text-app-text-muted text-sm">Chưa có doanh thu nào</p>
              <p className="text-white/15 text-xs mt-1">Ghi nhận doanh thu từ trang Thống kê</p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-3 h-32 mb-3">
                {stats.monthlyChart.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                    <div
                      className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${Math.max((m.value / maxChart) * 112, m.value > 0 ? 6 : 2)}px`,
                        backgroundColor: m.value > 0 ? "#34d399" : "rgba(255,255,255,0.05)",
                      }}
                    />
                    {m.value > 0 && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#1a1d27] border border-app-border text-white/70 text-[9px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {formatVND(m.value)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                {stats.monthlyChart.map((m, i) => (
                  <div key={i} className="flex-1 text-center">
                    <span className="text-app-text-muted text-[10px]">{m.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Series performance */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1">Series theo doanh thu</h3>
          <p className="text-app-text-muted text-xs mb-4">Top series bán chạy nhất</p>
          {stats.seriesPerf.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <i className="ri-stack-line text-white/10 text-3xl mb-2"></i>
              <p className="text-app-text-muted text-xs">Chưa có dữ liệu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.seriesPerf.slice(0, 5).map(s => {
                const maxRev = stats.seriesPerf[0]?.revenue || 1;
                return (
                  <div key={s.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/60 text-xs font-medium truncate max-w-[120px]">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-app-text-muted text-[10px]">{s.sales} đơn</span>
                        <span className="text-app-accent-success text-xs font-bold">{formatVND(s.revenue)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${maxRev > 0 ? (s.revenue / maxRev) * 100 : 0}%`, backgroundColor: s.coverAccent ?? "#34d399" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content breakdown */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5 mb-6" style={{ contentVisibility: "auto", containIntrinsicHeight: "300px" }}>
        <h3 className="text-white font-semibold text-sm mb-4">Chi tiết nội dung</h3>
        <div className="grid grid-cols-2 gap-4">
          {contentStats.map(s => (
            <div key={s.label} className="flex items-center gap-3 px-4 py-3 bg-app-surface/50 rounded-xl">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-base`} style={{ color: s.color }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/60 text-xs font-medium">{s.label}</span>
                  <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}{s.max < 9999 ? `/${s.max}` : ""}</span>
                </div>
                <MiniBar value={s.value} max={s.max} color={s.color} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EPS image coverage */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5" style={{ contentVisibility: "auto", containIntrinsicHeight: "200px" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-sm">Độ phủ ảnh EPS</h3>
            <p className="text-app-text-muted text-xs mt-0.5">Câu hỏi có ảnh minh họa</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-app-accent-success text-sm font-bold">{stats.epsWithImage}</span>
            <span className="text-app-text-muted text-xs">/ {epsQuestions.length}</span>
            <span className="text-white/50 text-xs font-bold bg-app-card/50 px-2 py-1 rounded-lg">
              {Math.round((stats.epsWithImage / epsQuestions.length) * 100)}%
            </span>
          </div>
        </div>
        <div className="h-3 bg-app-card/50 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${(stats.epsWithImage / epsQuestions.length) * 100}%`, backgroundColor: "#34d399" }}
          />
        </div>
        <div className="flex items-center gap-4 text-xs text-app-text-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Có ảnh: {stats.epsWithImage}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-app-card/70"></div>
            <span>Chưa có: {epsQuestions.length - stats.epsWithImage}</span>
          </div>
          <a href="/admin/eps" className="ml-auto text-rose-400/70 hover:text-rose-400 transition-colors cursor-pointer whitespace-nowrap">
            Thêm ảnh →
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}


