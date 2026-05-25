import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface OnlineUser {
  id: string;
  name: string;
  level: string;
  streak: number;
  color: string;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  detail: string;
  time: number; // seconds ago
  icon: string;
  color: string;
}

const COLORS = ["#e8c84a", "#34d399", "#60a5fa", "#f472b6", "#fb923c", "#a78bfa"];

function timeAgoShort(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function xpToLevel(xp: number): string {
  if (xp >= 10000) return "C1";
  if (xp >= 5000) return "B2";
  if (xp >= 2000) return "B1";
  if (xp >= 500) return "A2";
  return "A1";
}

export default function OnlineUsersWidget() {
  const [onlineCount, setOnlineCount] = useState(0);
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load users "online" (proxy: có login_sessions hoặc updated_at gần đây)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);

      // 1) Tổng user đã đăng ký (fallback cho online count)
      const { count: totalUsers } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true });

      // 2) Top learners theo leaderboard — lấy 12 người có XP cao nhất
      const { data: lbData } = await supabase
        .from("leaderboard")
        .select("user_id, xp, streak, display_name")
        .order("xp", { ascending: false })
        .limit(12);

      if (cancelled) return;

      const recentUsers: OnlineUser[] = (lbData || []).map((row, i: number) => ({
        id: row.user_id,
        name: row.display_name || "Học viên",
        level: xpToLevel(row.xp || 0),
        streak: row.streak || 0,
        color: COLORS[i % COLORS.length],
      }));
      setUsers(recentUsers);
      setOnlineCount(totalUsers || 0);

      // 3) Activity feed thật từ exam_results + topik_quiz_history
      const since = new Date();
      since.setDate(since.getDate() - 7);
      const sinceStr = since.toISOString();

      const [{ data: examRows }, { data: quizRows }] = await Promise.all([
        supabase
          .from("exam_results")
          .select("id, user_id, score, total, exam_type, created_at")
          .gte("created_at", sinceStr)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("topik_quiz_history")
          .select("id, user_id, score, total, level, created_at")
          .gte("created_at", sinceStr)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (cancelled) return;

      // Map user_id → display_name từ users đã load (để tránh thêm query join)
      const userIds = new Set<string>();
      (examRows || []).forEach((r: { user_id: string }) => userIds.add(r.user_id));
      (quizRows || []).forEach((r: { user_id: string }) => userIds.add(r.user_id));

      let nameMap: Record<string, string> = {};
      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("id, display_name")
          .in("id", Array.from(userIds));
        nameMap = Object.fromEntries((profiles || []).map((p: { id: string; display_name: string }) => [p.id, p.display_name || "Học viên"]));
      }

      const now = Date.now();
      const feed: ActivityItem[] = [];

      (examRows || []).forEach((row: { id: string; user_id: string; score: number; total: number; exam_type: string; created_at: string }) => {
        const pct = row.total > 0 ? Math.round((row.score / row.total) * 100) : 0;
        feed.push({
          id: `ex_${row.id}`,
          user: nameMap[row.user_id] || "Học viên",
          action: "hoàn thành",
          detail: `${row.exam_type.toUpperCase()} - ${pct}%`,
          time: Math.max(0, Math.floor((now - new Date(row.created_at).getTime()) / 1000)),
          icon: "ri-trophy-line",
          color: pct >= 80 ? "#34d399" : "#e8c84a",
        });
      });

      (quizRows || []).forEach((row: { id: string; user_id: string; score: number; total: number; level: string; created_at: string }) => {
        const pct = row.total > 0 ? Math.round((row.score / row.total) * 100) : 0;
        feed.push({
          id: `qz_${row.id}`,
          user: nameMap[row.user_id] || "Học viên",
          action: "làm quiz",
          detail: `TOPIK ${row.level || ""} - ${pct}%`,
          time: Math.max(0, Math.floor((now - new Date(row.created_at).getTime()) / 1000)),
          icon: "ri-survey-line",
          color: "#60a5fa",
        });
      });

      feed.sort((a, b) => a.time - b.time);
      setActivities(feed.slice(0, 15));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Tick để activity "seconds ago" cập nhật mỗi giây
  useEffect(() => {
    const t = setInterval(() => {
      setActivities(prev => prev.map(a => ({ ...a, time: a.time + 1 })));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const displayedUsers = showAll ? users : users.slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Users Top Learners */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <h3 className="text-white font-semibold text-sm">Top học viên</h3>
          </div>
          {onlineCount > 0 && (
            <span className="text-[#34d399] font-bold text-sm">{onlineCount.toLocaleString()}</span>
          )}
        </div>

        {loading && displayedUsers.length === 0 ? (
          <div className="py-6 text-center text-app-text-muted text-xs">Đang tải...</div>
        ) : displayedUsers.length === 0 ? (
          <div className="py-6 text-center text-app-text-muted text-xs">Chưa có dữ liệu</div>
        ) : (
          <div className="space-y-2">
            {displayedUsers.map(user => (
              <div key={user.id} className="flex items-center gap-2.5">
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${user.color}20`, color: user.color }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#0f1117]"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/75 text-xs font-medium truncate">{user.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${user.color}15`, color: user.color }}>{user.level}</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <i className="ri-fire-line text-[#fb923c] text-[10px]"></i>
                  <span className="text-[10px] text-app-text-muted">{user.streak}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {users.length > 6 && (
          <button
            onClick={() => setShowAll(v => !v)}
            className="w-full mt-3 py-1.5 text-[10px] text-app-text-muted hover:text-white/60 transition-colors cursor-pointer whitespace-nowrap"
          >
            {showAll ? "Thu gọn" : `Xem thêm ${users.length - 6} người`}
          </button>
        )}
      </div>

      {/* Activity Feed */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-app-accent-primary animate-pulse"></div>
          <h3 className="text-white font-semibold text-sm">Hoạt động gần đây</h3>
        </div>

        {loading && activities.length === 0 ? (
          <div className="py-6 text-center text-app-text-muted text-xs">Đang tải...</div>
        ) : activities.length === 0 ? (
          <div className="py-6 text-center text-app-text-muted text-xs">Chưa có hoạt động</div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {activities.map((item, i) => (
              <div
                key={item.id}
                className="flex items-start gap-2.5 transition-all duration-300"
                style={{ opacity: i === 0 ? 1 : Math.max(0.3, 1 - i * 0.08) }}
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${item.color}15` }}>
                  <i className={`${item.icon} text-[10px]`} style={{ color: item.color }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.6)" }}>
                    <span className="font-semibold text-white/80">{item.user}</span>
                    {" "}{item.action}{" "}
                    <span style={{ color: item.color }}>{item.detail}</span>
                  </p>
                </div>
                <span className="text-[9px] flex-shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>
                  {item.time === 0 ? "vừa xong" : `${timeAgoShort(item.time)} trước`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
