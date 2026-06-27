import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

interface StudentProgress {
  id: string;
  user_name: string;
  user_email: string;
  total_xp: number;
  current_streak: number;
  lessons_completed: number;
  quizzes_taken: number;
  avg_score: number;
  last_active: string;
}

interface AnalyticsData {
  totalStudents: number;
  activeStudents: number;
  totalXP: number;
  avgStreak: number;
  topPerformers: StudentProgress[];
  strugglingStudents: StudentProgress[];
  progressByDay: { date: string; count: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user progress data (mock data for now, would be real Supabase query)
      const mockData: AnalyticsData = {
        totalStudents: 1250,
        activeStudents: 847,
        totalXP: 456000,
        avgStreak: 12.5,
        topPerformers: [
          { id: "1", user_name: "Nguyễn Văn A", user_email: "a@example.com", total_xp: 12500, current_streak: 45, lessons_completed: 120, quizzes_taken: 85, avg_score: 92, last_active: new Date().toISOString() },
          { id: "2", user_name: "Trần Thị B", user_email: "b@example.com", total_xp: 11200, current_streak: 38, lessons_completed: 110, quizzes_taken: 78, avg_score: 89, last_active: new Date().toISOString() },
          { id: "3", user_name: "Lê Văn C", user_email: "c@example.com", total_xp: 10500, current_streak: 32, lessons_completed: 105, quizzes_taken: 72, avg_score: 87, last_active: new Date().toISOString() },
        ],
        strugglingStudents: [
          { id: "4", user_name: "Phạm Văn D", user_email: "d@example.com", total_xp: 500, current_streak: 2, lessons_completed: 5, quizzes_taken: 3, avg_score: 45, last_active: new Date(Date.now() - 86400000 * 5).toISOString() },
          { id: "5", user_name: "Hoàng Thị E", user_email: "e@example.com", total_xp: 350, current_streak: 1, lessons_completed: 3, quizzes_taken: 2, avg_score: 40, last_active: new Date(Date.now() - 86400000 * 7).toISOString() },
        ],
        progressByDay: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - 86400000 * (29 - i)).toISOString().split("T")[0],
          count: Math.floor(Math.random() * 50) + 20,
        })),
      };
      setData(mockData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <AdminLayout title="Learning Analytics" subtitle="Loading...">
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  return (
    <AdminLayout
      title="Learning Analytics"
      subtitle="Monitor student progress and engagement"
      actions={
        <select
          value={timeRange}
          onChange={e => setTimeRange(e.target.value as "7d" | "30d" | "90d")}
          className="px-3 py-2 rounded-lg border text-xs cursor-pointer"
          style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border)" }}
        >
          <option value="7d">7 days</option>
          <option value="30d">30 days</option>
          <option value="90d">90 days</option>
        </select>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Students", value: data.totalStudents, icon: "ri-user-line", color: "#34d399" },
          { label: "Active Students", value: data.activeStudents, icon: "ri-user-follow-line", color: "#38bdf8" },
          { label: "Total XP Earned", value: data.totalXP.toLocaleString(), icon: "ri-award-line", color: "#e8c84a" },
          { label: "Avg Streak", value: `${data.avgStreak} days`, icon: "ri-fire-line", color: "#f87171" },
        ].map(stat => (
          <div key={stat.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
              <i className={`${stat.icon} text-sm`} style={{ color: stat.color }} />
            </div>
            <div>
              <p className="font-bold text-lg leading-none" style={{ color: "var(--admin-text)" }}>{stat.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Chart */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5 mb-5"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        <h3 className="text-white text-sm font-bold mb-4">Student Activity Over Time</h3>
        <div className="h-48 flex items-end gap-1">
          {data.progressByDay.map((day, i) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t transition-all hover:opacity-80 cursor-pointer"
                style={{
                  height: `${(day.count / 70) * 100}%`,
                  backgroundColor: "#38bdf8",
                }}
                title={`${day.date}: ${day.count} students`}
              />
              <span className="text-[8px]" style={{ color: "var(--admin-text-faint)" }}>
                {new Date(day.date).getDate()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5 mb-5"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        <h3 className="text-white text-sm font-bold mb-4">Top Performers</h3>
        <div className="space-y-2">
          {data.topPerformers.map((student, i) => (
            <div key={student.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ backgroundColor: "var(--admin-card2)", borderColor: "var(--admin-border)" }}>
              <div className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm"
                style={{ backgroundColor: i === 0 ? "#e8c84a" : i === 1 ? "#94a3b8" : "#b45309", color: "#fff" }}>
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>{student.user_name}</p>
                <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{student.user_email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: "#e8c84a" }}>{student.total_xp} XP</p>
                <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{student.current_streak} day streak</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Struggling Students */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        <h3 className="text-white text-sm font-bold mb-4">Students Needing Attention</h3>
        <div className="space-y-2">
          {data.strugglingStudents.map((student, i) => (
            <div key={student.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ backgroundColor: "var(--admin-card2)", borderColor: "#f8717130" }}>
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10">
                <i className="ri-alert-line text-red-400 text-sm" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>{student.user_name}</p>
                <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{student.user_email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-red-400">{student.avg_score}% avg</p>
                <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>
                  Last active {new Date(student.last_active).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
