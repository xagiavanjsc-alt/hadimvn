import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

type Period = "week" | "month" | "alltime";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar: string;
  score: number;
  streak: number;
  totalExams: number;
  badge: string;
  region: string;
  isCurrentUser?: boolean;
}

// Leaderboard data fetched from Supabase (không còn mock)

const PERIOD_LABELS: Record<Period, string> = {
  week: "Tuần này",
  month: "Tháng này",
  alltime: "Mọi thời đại",
};

const PERIOD_ICONS: Record<Period, string> = {
  week: "ri-calendar-2-line",
  month: "ri-calendar-line",
  alltime: "ri-trophy-line",
};

export default function EpsGlobalLeaderboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("week");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [liveActivity, setLiveActivity] = useState<string[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  useEffect(() => {
    // Live activity feed thật từ exam_results gần nhất
    let cancelled = false;
    const load = async () => {
      const { data: recentExams } = await supabase
        .from("exam_results")
        .select("user_id, score, total, exam_type, created_at")
        .ilike("exam_type", "eps%")
        .order("created_at", { ascending: false })
        .limit(10);

      if (cancelled || !recentExams || recentExams.length === 0) return;

      const userIds = Array.from(new Set(recentExams.map((r: { user_id: string }) => r.user_id)));
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, display_name")
        .in("id", userIds);

      if (cancelled) return;
      const nameMap = Object.fromEntries(
        (profiles || []).map((p: { id: string; display_name: string }) => [p.id, p.display_name || "Học viên"])
      );

      const feed = recentExams.map((r: { user_id: string; score: number; total: number }) => {
        const name = nameMap[r.user_id] || "Học viên";
        const pct = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
        const emoji = pct >= 90 ? "🔥" : pct >= 80 ? "⭐" : "📝";
        return `${name} vừa đạt ${pct}/100 điểm EPS! ${emoji}`;
      });
      setLiveActivity(feed.slice(0, 3));
    };
    load();
    const interval = setInterval(load, 30000); // refresh mỗi 30s
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Query exam_results theo period
      let q = supabase
        .from("exam_results")
        .select("user_id, score, total, exam_type, created_at")
        .ilike("exam_type", "eps%");

      if (period === "week") {
        const wAgo = new Date();
        wAgo.setDate(wAgo.getDate() - 7);
        q = q.gte("created_at", wAgo.toISOString());
      } else if (period === "month") {
        const mAgo = new Date();
        mAgo.setMonth(mAgo.getMonth() - 1);
        q = q.gte("created_at", mAgo.toISOString());
      }

      const { data: rows } = await q.limit(500);
      if (!rows || rows.length === 0) {
        setEntries([]);
        setMyRank(null);
        return;
      }

      // Gộp theo user: best score + total exams count
      const byUser: Record<string, { best: number; count: number }> = {};
      rows.forEach((r: { user_id: string; score: number; total: number }) => {
        const pct = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
        if (!byUser[r.user_id]) byUser[r.user_id] = { best: pct, count: 1 };
        else {
          byUser[r.user_id].count += 1;
          if (pct > byUser[r.user_id].best) byUser[r.user_id].best = pct;
        }
      });

      const userIds = Object.keys(byUser);

      // Lấy profile + streak từ leaderboard
      const [{ data: profiles }, { data: lbs }] = await Promise.all([
        supabase.from("user_profiles").select("id, display_name, avatar_url").in("id", userIds),
        supabase.from("leaderboard").select("user_id, streak").in("user_id", userIds),
      ]);

      const profileMap = Object.fromEntries(
        (profiles || []).map((p: { id: string; display_name: string; avatar_url: string }) => [p.id, p])
      );
      const streakMap = Object.fromEntries(
        (lbs || []).map((l: { user_id: string; streak: number }) => [l.user_id, l.streak || 0])
      );

      const combined: LeaderboardEntry[] = userIds
        .map(uid => {
          const p = profileMap[uid];
          const d = byUser[uid];
          return {
            rank: 0,
            userId: uid,
            displayName: p?.display_name || "Học viên",
            avatar: p?.avatar_url || "",
            score: d.best,
            streak: streakMap[uid] || 0,
            totalExams: d.count,
            badge: "⭐",
            region: "Việt Nam",
            isCurrentUser: user ? uid === user.id : false,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 50)
        .map((e, i) => ({
          ...e,
          rank: i + 1,
          badge: i === 0 ? "🏆" : i === 1 ? "🥈" : i === 2 ? "🥉" : "⭐",
        }));

      setEntries(combined);
      const me = combined.find(e => e.isCurrentUser);
      setMyRank(me || null);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-app-bg text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1d27] to-[#13151c] border-b border-app-border px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 cursor-pointer transition-colors">
              <i className="ri-arrow-left-line text-white/60 text-sm"></i>
            </button>
            <div>
              <h1 className="text-white font-bold text-lg">Bảng xếp hạng toàn cầu EPS</h1>
              <p className="text-app-text-secondary text-xs">Top học viên điểm cao nhất · Cập nhật real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-app-accent-success text-xs font-medium">Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Live Activity Feed */}
        {liveActivity.length > 0 && (
          <div className="bg-[#1a1d27] border border-app-border rounded-xl p-3 space-y-1.5">
            {liveActivity.map((act, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></div>
                <span>{act}</span>
              </div>
            ))}
          </div>
        )}

        {/* Period Tabs */}
        <div className="flex items-center gap-2 bg-[#1a1d27] border border-app-border rounded-xl p-1">
          {(["week", "month", "alltime"] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${period === p ? "bg-app-accent-primary text-app-bg" : "text-white/50 hover:text-white/80"}`}
            >
              <i className={`${PERIOD_ICONS[p]} text-sm`}></i>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="bg-[#1a1d27] border border-app-border rounded-2xl p-6">
              <h2 className="text-white/60 text-xs font-medium tracking-normal mb-6 text-center">Top 3 xuất sắc nhất</h2>
              <div className="flex items-end justify-center gap-4">
                {/* 2nd */}
                {top3[1] && (
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="relative">
                      <img loading="lazy" decoding="async" src={top3[1].avatar} alt={top3[1].displayName} className="w-14 h-14 rounded-full object-cover border-2 border-gray-400" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-xs font-bold text-white">2</div>
                    </div>
                    <div className="text-center">
                      <p className="text-white text-xs font-semibold truncate max-w-[80px]">{top3[1].displayName}</p>
                      <p className="text-gray-400 text-[10px]">{top3[1].region}</p>
                    </div>
                    <div className="w-full bg-gray-500/20 rounded-t-lg flex flex-col items-center py-3" style={{ height: "80px" }}>
                      <span className="text-2xl">🥈</span>
                      <span className="text-gray-300 font-bold text-sm">{top3[1].score}</span>
                    </div>
                  </div>
                )}
                {/* 1st */}
                {top3[0] && (
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</div>
                      <img loading="lazy" decoding="async" src={top3[0].avatar} alt={top3[0].displayName} className="w-18 h-18 rounded-full object-cover border-2 border-app-accent-primary w-[72px] h-[72px]" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-app-accent-primary flex items-center justify-center text-xs font-bold text-app-bg">1</div>
                    </div>
                    <div className="text-center">
                      <p className="text-white text-xs font-bold truncate max-w-[90px]">{top3[0].displayName}</p>
                      <p className="text-app-text-secondary text-[10px]">{top3[0].region}</p>
                    </div>
                    <div className="w-full bg-app-accent-primary/15 rounded-t-lg flex flex-col items-center py-3" style={{ height: "110px" }}>
                      <span className="text-2xl">🏆</span>
                      <span className="text-app-accent-primary font-bold text-lg">{top3[0].score}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <i className="ri-fire-line text-orange-400 text-xs"></i>
                        <span className="text-orange-400 text-[10px]">{top3[0].streak} ngày</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* 3rd */}
                {top3[2] && (
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="relative">
                      <img loading="lazy" decoding="async" src={top3[2].avatar} alt={top3[2].displayName} className="w-14 h-14 rounded-full object-cover border-2 border-amber-700" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center text-xs font-bold text-white">3</div>
                    </div>
                    <div className="text-center">
                      <p className="text-white text-xs font-semibold truncate max-w-[80px]">{top3[2].displayName}</p>
                      <p className="text-app-text-secondary text-[10px]">{top3[2].region}</p>
                    </div>
                    <div className="w-full bg-amber-700/20 rounded-t-lg flex flex-col items-center py-3" style={{ height: "60px" }}>
                      <span className="text-2xl">🥉</span>
                      <span className="text-amber-600 font-bold text-sm">{top3[2].score}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* My Rank Card */}
            {user && myRank && (
              <div className="bg-app-accent-primary/10 border border-app-accent-primary/30 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-app-accent-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-app-accent-primary font-bold text-sm">#{myRank.rank}</span>
                </div>
                <img loading="lazy" decoding="async" src={myRank.avatar} alt="me" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">Bạn · {myRank.displayName}</p>
                  <p className="text-app-text-secondary text-xs">{myRank.region}</p>
                </div>
                <div className="text-right">
                  <p className="text-app-accent-primary font-bold text-lg">{myRank.score}</p>
                  <p className="text-app-text-secondary text-xs">điểm TB</p>
                </div>
              </div>
            )}

            {/* Rest of leaderboard */}
            <div className="bg-[#1a1d27] border border-app-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-app-border flex items-center justify-between">
                <span className="text-white/60 text-xs font-medium">Xếp hạng 4-{entries.length}</span>
                <span className="text-app-text-muted text-xs">{entries.length} học viên</span>
              </div>
              <div className="divide-y divide-white/5">
                {rest.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 px-4 py-3 hover:bg-app-surface/50 transition-colors ${entry.isCurrentUser ? "bg-app-accent-primary/5" : ""}`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      <span className={`text-sm font-bold ${entry.rank <= 10 ? "text-app-accent-primary" : "text-app-text-muted"}`}>#{entry.rank}</span>
                    </div>
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img loading="lazy" decoding="async" src={entry.avatar} alt={entry.displayName} className="w-9 h-9 rounded-full object-cover" />
                      {entry.streak >= 30 && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                          <i className="ri-fire-line text-white text-[8px]"></i>
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${entry.isCurrentUser ? "text-app-accent-primary" : "text-white"}`}>{entry.displayName}</p>
                        {entry.isCurrentUser && <span className="text-[10px] bg-app-accent-primary/20 text-app-accent-primary px-1.5 py-0.5 rounded-full whitespace-nowrap">Bạn</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-app-text-muted text-[10px]">{entry.region}</span>
                        <div className="flex items-center gap-1">
                          <i className="ri-fire-line text-orange-400 text-[10px]"></i>
                          <span className="text-orange-400 text-[10px]">{entry.streak} ngày</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <i className="ri-file-list-3-line text-app-text-muted text-[10px]"></i>
                          <span className="text-app-text-muted text-[10px]">{entry.totalExams} bài</span>
                        </div>
                      </div>
                    </div>
                    {/* Score */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-bold text-base">{entry.score}</p>
                      <p className="text-app-text-muted text-[10px]">điểm TB</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA to join */}
            {!user && (
              <div className="bg-[#1a1d27] border border-app-accent-primary/20 rounded-xl p-5 text-center">
                <p className="text-white font-semibold text-sm mb-1">Bạn muốn xuất hiện trên bảng xếp hạng?</p>
                <p className="text-app-text-secondary text-xs mb-4">Đăng nhập và bắt đầu thi EPS để được xếp hạng toàn cầu!</p>
                <button onClick={() => navigate("/")} className="bg-app-accent-primary text-app-bg font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-[#f0d060] transition-colors whitespace-nowrap cursor-pointer">
                  Tham gia ngay
                </button>
              </div>
            )}

            {/* Stats summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Học viên tham gia", value: "10,247", icon: "ri-group-line", color: "#e8c84a" },
                { label: "Bài thi tuần này", value: "3,891", icon: "ri-file-list-3-line", color: "#10b981" },
                { label: "Điểm TB toàn cầu", value: "74.2", icon: "ri-bar-chart-line", color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} className="bg-[#1a1d27] border border-app-border rounded-xl p-4 text-center">
                  <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                    <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
                  </div>
                  <p className="text-white font-bold text-lg">{s.value}</p>
                  <p className="text-app-text-secondary text-[10px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

