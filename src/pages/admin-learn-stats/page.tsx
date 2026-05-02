import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";
import { useAdminUsers } from "@/hooks/useAdminUsers";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DayBucket { date: string; label: string; count: number }
interface ExamStat { score: number; total: number; taken_at: string }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildDayBuckets(days: number): DayBucket[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      count: 0,
    };
  });
}

function buildWeekBuckets(weeks: number): DayBucket[] {
  return Array.from({ length: weeks }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (weeks - 1 - i) * 7);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    return {
      date: weekStart.toISOString().slice(0, 10),
      label: `T${weeks - i}`,
      count: 0,
    };
  });
}

function buildMonthBuckets(months: number): DayBucket[] {
  return Array.from({ length: months }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (months - 1 - i));
    return {
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("vi-VN", { month: "short", year: "2-digit" }),
      count: 0,
    };
  });
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, color, height = 120, showLabels = true }: {
  data: DayBucket[]; color: string; height?: number; showLabels?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div>
      <div className="flex items-end gap-0.5" style={{ height }}>
        {data.map((d, i) => {
          const barH = Math.max((d.count / max) * (height - 8), d.count > 0 ? 4 : 2);
          const isHovered = hovered === i;
          return (
            <div key={i} className="flex-1 flex flex-col items-center relative group"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}>
              {isHovered && d.count > 0 && (
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
                  style={{ minWidth: "60px" }}>
                  <div className="rounded-lg px-2 py-1.5 text-center"
                    style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border2)" }}>
                    <p className="text-[10px] font-bold" style={{ color }}>{d.count}</p>
                    <p className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>{d.label}</p>
                  </div>
                </div>
              )}
              <div className="w-full rounded-t-sm transition-all duration-200"
                style={{
                  height: `${barH}px`,
                  backgroundColor: isHovered ? color : `${color}50`,
                  minHeight: "2px",
                }} />
            </div>
          );
        })}
      </div>
      {showLabels && (
        <div className="flex items-center gap-0.5 mt-1">
          {data.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              {(i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1) && (
                <span className="text-[8px]" style={{ color: "var(--admin-text-faint)" }}>{d.label}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, trend }: {
  icon: string; label: string; value: string | number; sub?: string; color: string; trend?: number;
}) {
  return (
    <div className="rounded-xl p-5 border" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <i className={`${icon} text-base`} style={{ color }}></i>
        </div>
        {trend !== undefined && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? "bg-emerald-500/12 text-app-accent-success" : "bg-rose-500/12 text-rose-400"}`}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color: "var(--admin-text)" }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: "var(--admin-text-muted)" }}>{label}</p>
      {sub && <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-faint)" }}>{sub}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminLearnStatsPage() {
  const { users, loading: usersLoading } = useAdminUsers();
  const [examStats, setExamStats] = useState<ExamStat[]>([]);
  const [studyProgressCount, setStudyProgressCount] = useState(0);
  const [melonHistoryCount, setMelonHistoryCount] = useState(0);
  const [communityPostsCount, setCommunityPostsCount] = useState(0);
  const [period, setPeriod] = useState<"30d" | "12w" | "12m">("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const [examsRes, studyRes, melonRes, communityRes] = await Promise.all([
        supabase.from("exam_results").select("score, total, taken_at"),
        supabase.from("study_progress").select("id", { count: "exact", head: true }),
        supabase.from("melon_study_history").select("id", { count: "exact", head: true }),
        supabase.from("community_posts").select("id", { count: "exact", head: true }),
      ]);
      setExamStats(examsRes.data ?? []);
      setStudyProgressCount(studyRes.count ?? 0);
      setMelonHistoryCount(melonRes.count ?? 0);
      setCommunityPostsCount(communityRes.count ?? 0);
      setLoading(false);
    };
    fetchStats();
  }, []);

  // ── User growth chart ──────────────────────────────────────────────────────
  const userGrowthData = useMemo(() => {
    if (period === "30d") {
      const buckets = buildDayBuckets(30);
      users.forEach(u => {
        const d = u.created_at.slice(0, 10);
        const b = buckets.find(b => b.date === d);
        if (b) b.count++;
      });
      return buckets;
    } else if (period === "12w") {
      const buckets = buildWeekBuckets(12);
      users.forEach(u => {
        const d = new Date(u.created_at);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toISOString().slice(0, 10);
        const b = buckets.find(b => b.date === key);
        if (b) b.count++;
      });
      return buckets;
    } else {
      const buckets = buildMonthBuckets(12);
      users.forEach(u => {
        const key = u.created_at.slice(0, 7);
        const b = buckets.find(b => b.date === key);
        if (b) b.count++;
      });
      return buckets;
    }
  }, [users, period]);

  // ── Exam score distribution ────────────────────────────────────────────────
  const examScoreDist = useMemo(() => {
    const buckets = [
      { label: "0-20%", min: 0, max: 20, count: 0, color: "#f87171" },
      { label: "21-40%", min: 21, max: 40, count: 0, color: "#fb923c" },
      { label: "41-60%", min: 41, max: 60, count: 0, color: "app-accent-primary" },
      { label: "61-80%", min: 61, max: 80, count: 0, color: "#34d399" },
      { label: "81-100%", min: 81, max: 100, count: 0, color: "#a78bfa" },
    ];
    examStats.forEach(e => {
      const pct = e.total > 0 ? Math.round((e.score / e.total) * 100) : 0;
      const b = buckets.find(b => pct >= b.min && pct <= b.max);
      if (b) b.count++;
    });
    return buckets;
  }, [examStats]);

  // ── VIP distribution ───────────────────────────────────────────────────────
  const vipDist = useMemo(() => {
    const free = users.filter(u => !u.is_vip).length;
    const vipMonth = users.filter(u => {
      if (!u.is_vip || !u.vip_expires_at) return false;
      const d = Math.floor((new Date(u.vip_expires_at).getTime() - Date.now()) / 86400000);
      return d <= 30;
    }).length;
    const vipYear = users.filter(u => {
      if (!u.is_vip || !u.vip_expires_at) return false;
      const d = Math.floor((new Date(u.vip_expires_at).getTime() - Date.now()) / 86400000);
      return d > 30;
    }).length;
    return [
      { label: "Free", count: free, color: "var(--admin-text-faint)", pct: users.length > 0 ? Math.round((free / users.length) * 100) : 0 },
      { label: "VIP Tháng", count: vipMonth, color: "#34d399", pct: users.length > 0 ? Math.round((vipMonth / users.length) * 100) : 0 },
      { label: "VIP Năm", count: vipYear, color: "app-accent-primary", pct: users.length > 0 ? Math.round((vipYear / users.length) * 100) : 0 },
    ];
  }, [users]);

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalUsers = users.length;
  const newThisWeek = users.filter(u => {
    const d = (Date.now() - new Date(u.created_at).getTime()) / 86400000;
    return d <= 7;
  }).length;
  const newLastWeek = users.filter(u => {
    const d = (Date.now() - new Date(u.created_at).getTime()) / 86400000;
    return d > 7 && d <= 14;
  }).length;
  const weekGrowth = newLastWeek > 0 ? Math.round(((newThisWeek - newLastWeek) / newLastWeek) * 100) : 0;
  const avgScore = examStats.length > 0
    ? Math.round(examStats.reduce((s, e) => s + (e.total > 0 ? (e.score / e.total) * 100 : 0), 0) / examStats.length)
    : 0;
  const activeUsers = users.filter(u => u.last_active && (Date.now() - new Date(u.last_active).getTime()) / 86400000 <= 7).length;
  const retentionRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  const maxExamDist = Math.max(...examScoreDist.map(b => b.count), 1);

  return (
    <AdminLayout
      title="Thống kê Học tập Chi tiết"
      subtitle="Biểu đồ tăng trưởng người dùng, điểm thi, hoạt động học tập"
    >
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="ri-user-add-line" label="Người dùng mới tuần này" value={newThisWeek} sub={`${totalUsers} tổng`} color="#34d399" trend={weekGrowth} />
        <StatCard icon="ri-pulse-line" label="Hoạt động 7 ngày qua" value={activeUsers} sub={`${retentionRate}% retention`} color="#a78bfa" />
        <StatCard icon="ri-survey-line" label="Tổng lượt thi" value={examStats.length} sub={`Điểm TB: ${avgScore}%`} color="app-accent-primary" />
        <StatCard icon="ri-book-open-line" label="Lượt học tập" value={studyProgressCount.toLocaleString()} sub={`${melonHistoryCount} K-pop · ${communityPostsCount} bài đăng`} color="#fb923c" />
      </div>

      {/* User growth chart */}
      <div className="rounded-2xl border p-5 mb-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Tăng trưởng người dùng mới</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
              Tổng mới trong kỳ: <span className="font-bold" style={{ color: "#34d399" }}>
                {userGrowthData.reduce((s, d) => s + d.count, 0)}
              </span>
            </p>
          </div>
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--admin-card2)" }}>
            {([
              { id: "30d" as const, label: "30 ngày" },
              { id: "12w" as const, label: "12 tuần" },
              { id: "12m" as const, label: "12 tháng" },
            ]).map(opt => (
              <button key={opt.id} onClick={() => setPeriod(opt.id)}
                className="px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer whitespace-nowrap transition-all"
                style={{ backgroundColor: period === opt.id ? "var(--admin-hover)" : "transparent", color: period === opt.id ? "var(--admin-text)" : "var(--admin-text-faint)" }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {usersLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <BarChart data={userGrowthData} color="#34d399" height={140} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Exam score distribution */}
        <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--admin-text)" }}>Phân bố điểm thi</h3>
          <p className="text-xs mb-4" style={{ color: "var(--admin-text-muted)" }}>{examStats.length} lượt thi · Điểm TB: {avgScore}%</p>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="w-6 h-6 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
            </div>
          ) : examStats.length === 0 ? (
            <div className="text-center py-8" style={{ color: "var(--admin-text-faint)" }}>
              <i className="ri-survey-line text-3xl mb-2 block"></i>
              <p className="text-xs">Chưa có dữ liệu thi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {examScoreDist.map(b => (
                <div key={b.label} className="flex items-center gap-3">
                  <span className="text-xs w-16 flex-shrink-0" style={{ color: "var(--admin-text-muted)" }}>{b.label}</span>
                  <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--admin-hover)" }}>
                    <div className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                      style={{ width: `${(b.count / maxExamDist) * 100}%`, backgroundColor: b.color, minWidth: b.count > 0 ? "24px" : "0" }}>
                      {b.count > 0 && <span className="text-[9px] font-bold text-black/70">{b.count}</span>}
                    </div>
                  </div>
                  <span className="text-xs w-8 text-right font-bold" style={{ color: b.color }}>{b.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VIP distribution */}
        <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--admin-text)" }}>Phân bố loại thành viên</h3>
          <p className="text-xs mb-4" style={{ color: "var(--admin-text-muted)" }}>{totalUsers} tổng thành viên</p>
          {usersLoading ? (
            <div className="flex items-center justify-center h-24">
              <div className="w-6 h-6 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Donut chart */}
              <div className="flex items-center gap-6 mb-4">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" />
                    {(() => {
                      let offset = 0;
                      return vipDist.map((seg, i) => {
                        const dash = seg.pct;
                        const el = (
                          <path key={i}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none" stroke={seg.color} strokeWidth="3.5"
                            strokeDasharray={`${dash}, 100`}
                            strokeDashoffset={-offset}
                          />
                        );
                        offset += dash;
                        return el;
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-bold text-lg" style={{ color: "var(--admin-text)" }}>{totalUsers}</span>
                    <span className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>thành viên</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {vipDist.map(seg => (
                    <div key={seg.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }}></div>
                          <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{seg.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold" style={{ color: seg.color }}>{seg.count}</span>
                          <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{seg.pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--admin-hover)" }}>
                        <div className="h-full rounded-full" style={{ width: `${seg.pct}%`, backgroundColor: seg.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Activity breakdown */}
      <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--admin-text)" }}>Tổng quan hoạt động học tập</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Lượt học tập (study_progress)", value: studyProgressCount, icon: "ri-book-open-line", color: "#34d399", sub: "Tổng bản ghi" },
            { label: "Lịch sử K-pop", value: melonHistoryCount, icon: "ri-music-2-line", color: "#a78bfa", sub: "melon_study_history" },
            { label: "Bài đăng cộng đồng", value: communityPostsCount, icon: "ri-group-line", color: "#fb923c", sub: "community_posts" },
            { label: "Lượt thi thử", value: examStats.length, icon: "ri-survey-line", color: "app-accent-primary", sub: "exam_results" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 px-4 py-4 rounded-xl"
              style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
              <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-base`} style={{ color: s.color }}></i>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xl" style={{ color: "var(--admin-text)" }}>{s.value.toLocaleString()}</p>
                <p className="text-xs truncate" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
                <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
