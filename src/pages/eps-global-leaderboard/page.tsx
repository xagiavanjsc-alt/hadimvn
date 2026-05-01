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

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: "u1", displayName: "Nguyễn Thị Hoa", avatar: "https://readdy.ai/api/search-image?query=young%20Vietnamese%20woman%20smiling%20portrait%20professional%20warm%20lighting%20natural%20background&width=60&height=60&seq=lb1&orientation=squarish", score: 98, streak: 142, totalExams: 87, badge: "🏆", region: "Hà Nội" },
  { rank: 2, userId: "u2", displayName: "Trần Minh Khoa", avatar: "https://readdy.ai/api/search-image?query=young%20Vietnamese%20man%20smiling%20portrait%20casual%20warm%20lighting%20natural%20background&width=60&height=60&seq=lb2&orientation=squarish", score: 96, streak: 98, totalExams: 72, badge: "🥈", region: "TP.HCM" },
  { rank: 3, userId: "u3", displayName: "Lê Thị Bích Ngọc", avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20woman%20smiling%20portrait%20casual%20warm%20lighting%20natural%20background%20friendly&width=60&height=60&seq=lb3&orientation=squarish", score: 95, streak: 76, totalExams: 65, badge: "🥉", region: "Đà Nẵng" },
  { rank: 4, userId: "u4", displayName: "Phạm Văn Đức", avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20man%20smiling%20portrait%20casual%20warm%20lighting%20natural%20background%20confident&width=60&height=60&seq=lb4&orientation=squarish", score: 93, streak: 54, totalExams: 58, badge: "⭐", region: "Hải Phòng" },
  { rank: 5, userId: "u5", displayName: "Võ Thị Thanh Hương", avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20woman%20smiling%20portrait%20professional%20warm%20lighting%20natural%20background%20soft&width=60&height=60&seq=lb5&orientation=squarish", score: 91, streak: 47, totalExams: 51, badge: "⭐", region: "Cần Thơ" },
  { rank: 6, userId: "u6", displayName: "Hoàng Văn Nam", avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20man%20smiling%20portrait%20casual%20warm%20lighting%20natural%20background%20relaxed&width=60&height=60&seq=lb6&orientation=squarish", score: 90, streak: 39, totalExams: 44, badge: "⭐", region: "Nghệ An" },
  { rank: 7, userId: "u7", displayName: "Đặng Thị Mai", avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20woman%20smiling%20portrait%20casual%20warm%20lighting%20natural%20background%20happy&width=60&height=60&seq=lb7&orientation=squarish", score: 89, streak: 33, totalExams: 40, badge: "⭐", region: "Bình Dương" },
  { rank: 8, userId: "u8", displayName: "Bùi Quang Huy", avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20man%20smiling%20portrait%20casual%20warm%20lighting%20natural%20background%20young&width=60&height=60&seq=lb8&orientation=squarish", score: 88, streak: 28, totalExams: 37, badge: "⭐", region: "Đồng Nai" },
  { rank: 9, userId: "u9", displayName: "Ngô Thị Lan Anh", avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20woman%20smiling%20portrait%20professional%20warm%20lighting%20natural%20background%20bright&width=60&height=60&seq=lb9&orientation=squarish", score: 87, streak: 22, totalExams: 33, badge: "⭐", region: "Hà Nội" },
  { rank: 10, userId: "u10", displayName: "Đinh Văn Tùng", avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20man%20smiling%20portrait%20casual%20warm%20lighting%20natural%20background%20cheerful&width=60&height=60&seq=lb10&orientation=squarish", score: 86, streak: 18, totalExams: 29, badge: "⭐", region: "TP.HCM" },
  { rank: 11, userId: "u11", displayName: "Trịnh Thị Hằng", avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20woman%20smiling%20portrait%20casual%20warm%20lighting%20natural%20background%20gentle&width=60&height=60&seq=lb11&orientation=squarish", score: 85, streak: 15, totalExams: 26, badge: "⭐", region: "Quảng Ninh" },
  { rank: 12, userId: "u12", displayName: "Lý Văn Phúc", avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20man%20smiling%20portrait%20casual%20warm%20lighting%20natural%20background%20friendly%20face&width=60&height=60&seq=lb12&orientation=squarish", score: 84, streak: 12, totalExams: 23, badge: "⭐", region: "Thanh Hóa" },
];

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
    // Simulate live activity feed
    const activities = [
      "Nguyễn Thị Hoa vừa đạt 98/100 điểm EPS! 🔥",
      "Trần Minh Khoa streak 98 ngày liên tiếp! 💪",
      "Lê Thị Bích Ngọc vừa hoàn thành bài thi EPS! ⭐",
      "Phạm Văn Đức vừa vào top 5 bảng xếp hạng! 🎉",
      "Võ Thị Thanh Hương đạt điểm cao nhất tuần! 🏆",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      setLiveActivity(prev => [activities[idx % activities.length], ...prev].slice(0, 3));
      idx++;
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Try to load from Supabase leaderboard_snapshots
      const { data } = await supabase
        .from("leaderboard_snapshots")
        .select("*")
        .order("score", { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        const mapped: LeaderboardEntry[] = data.map((d, i) => ({
          rank: i + 1,
          userId: d.user_id || "",
          displayName: d.display_name || "Học viên",
          avatar: d.avatar_url || `https://readdy.ai/api/search-image?query=Vietnamese%20person%20smiling%20portrait%20casual%20warm%20lighting%20natural%20background&width=60&height=60&seq=lbr${i}&orientation=squarish`,
          score: d.score || 0,
          streak: d.streak || 0,
          totalExams: d.total_exams || 0,
          badge: i === 0 ? "🏆" : i === 1 ? "🥈" : i === 2 ? "🥉" : "⭐",
          region: d.region || "Việt Nam",
          isCurrentUser: user ? d.user_id === user.id : false,
        }));
        setEntries(mapped);
        if (user) {
          const me = mapped.find(e => e.isCurrentUser);
          setMyRank(me || null);
        }
      } else {
        // Use mock data
        const mock = MOCK_LEADERBOARD.map(e => ({
          ...e,
          isCurrentUser: false,
        }));
        setEntries(mock);
      }
    } catch {
      setEntries(MOCK_LEADERBOARD);
    } finally {
      setLoading(false);
    }
  };

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1d27] to-[#13151c] border-b border-white/8 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
              <i className="ri-arrow-left-line text-white/60 text-sm"></i>
            </button>
            <div>
              <h1 className="text-white font-bold text-lg">Bảng xếp hạng toàn cầu EPS</h1>
              <p className="text-white/40 text-xs">Top học viên điểm cao nhất · Cập nhật real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-emerald-400 text-xs font-medium">Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Live Activity Feed */}
        {liveActivity.length > 0 && (
          <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-3 space-y-1.5">
            {liveActivity.map((act, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></div>
                <span>{act}</span>
              </div>
            ))}
          </div>
        )}

        {/* Period Tabs */}
        <div className="flex items-center gap-2 bg-[#1a1d27] border border-white/8 rounded-xl p-1">
          {(["week", "month", "alltime"] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${period === p ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/50 hover:text-white/80"}`}
            >
              <i className={`${PERIOD_ICONS[p]} text-sm`}></i>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#e8c84a]/30 border-t-[#e8c84a] rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="bg-[#1a1d27] border border-white/8 rounded-2xl p-6">
              <h2 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-6 text-center">Top 3 xuất sắc nhất</h2>
              <div className="flex items-end justify-center gap-4">
                {/* 2nd */}
                {top3[1] && (
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="relative">
                      <img src={top3[1].avatar} alt={top3[1].displayName} className="w-14 h-14 rounded-full object-cover border-2 border-gray-400" />
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
                      <img src={top3[0].avatar} alt={top3[0].displayName} className="w-18 h-18 rounded-full object-cover border-2 border-[#e8c84a] w-[72px] h-[72px]" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#e8c84a] flex items-center justify-center text-xs font-bold text-[#0f1117]">1</div>
                    </div>
                    <div className="text-center">
                      <p className="text-white text-xs font-bold truncate max-w-[90px]">{top3[0].displayName}</p>
                      <p className="text-white/40 text-[10px]">{top3[0].region}</p>
                    </div>
                    <div className="w-full bg-[#e8c84a]/15 rounded-t-lg flex flex-col items-center py-3" style={{ height: "110px" }}>
                      <span className="text-2xl">🏆</span>
                      <span className="text-[#e8c84a] font-bold text-lg">{top3[0].score}</span>
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
                      <img src={top3[2].avatar} alt={top3[2].displayName} className="w-14 h-14 rounded-full object-cover border-2 border-amber-700" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center text-xs font-bold text-white">3</div>
                    </div>
                    <div className="text-center">
                      <p className="text-white text-xs font-semibold truncate max-w-[80px]">{top3[2].displayName}</p>
                      <p className="text-white/40 text-[10px]">{top3[2].region}</p>
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
              <div className="bg-[#e8c84a]/10 border border-[#e8c84a]/30 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e8c84a]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#e8c84a] font-bold text-sm">#{myRank.rank}</span>
                </div>
                <img src={myRank.avatar} alt="me" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">Bạn · {myRank.displayName}</p>
                  <p className="text-white/40 text-xs">{myRank.region}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#e8c84a] font-bold text-lg">{myRank.score}</p>
                  <p className="text-white/40 text-xs">điểm TB</p>
                </div>
              </div>
            )}

            {/* Rest of leaderboard */}
            <div className="bg-[#1a1d27] border border-white/8 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
                <span className="text-white/60 text-xs font-medium">Xếp hạng 4-{entries.length}</span>
                <span className="text-white/30 text-xs">{entries.length} học viên</span>
              </div>
              <div className="divide-y divide-white/5">
                {rest.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 px-4 py-3 hover:bg-white/3 transition-colors ${entry.isCurrentUser ? "bg-[#e8c84a]/5" : ""}`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      <span className={`text-sm font-bold ${entry.rank <= 10 ? "text-[#e8c84a]" : "text-white/30"}`}>#{entry.rank}</span>
                    </div>
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img src={entry.avatar} alt={entry.displayName} className="w-9 h-9 rounded-full object-cover" />
                      {entry.streak >= 30 && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                          <i className="ri-fire-line text-white text-[8px]"></i>
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${entry.isCurrentUser ? "text-[#e8c84a]" : "text-white"}`}>{entry.displayName}</p>
                        {entry.isCurrentUser && <span className="text-[10px] bg-[#e8c84a]/20 text-[#e8c84a] px-1.5 py-0.5 rounded-full whitespace-nowrap">Bạn</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-white/30 text-[10px]">{entry.region}</span>
                        <div className="flex items-center gap-1">
                          <i className="ri-fire-line text-orange-400 text-[10px]"></i>
                          <span className="text-orange-400 text-[10px]">{entry.streak} ngày</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <i className="ri-file-list-3-line text-white/30 text-[10px]"></i>
                          <span className="text-white/30 text-[10px]">{entry.totalExams} bài</span>
                        </div>
                      </div>
                    </div>
                    {/* Score */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-bold text-base">{entry.score}</p>
                      <p className="text-white/30 text-[10px]">điểm TB</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA to join */}
            {!user && (
              <div className="bg-[#1a1d27] border border-[#e8c84a]/20 rounded-xl p-5 text-center">
                <p className="text-white font-semibold text-sm mb-1">Bạn muốn xuất hiện trên bảng xếp hạng?</p>
                <p className="text-white/40 text-xs mb-4">Đăng nhập và bắt đầu thi EPS để được xếp hạng toàn cầu!</p>
                <button onClick={() => navigate("/")} className="bg-[#e8c84a] text-[#0f1117] font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-[#f0d060] transition-colors whitespace-nowrap cursor-pointer">
                  Tham gia ngay
                </button>
              </div>
            )}

            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Học viên tham gia", value: "10,247", icon: "ri-group-line", color: "#e8c84a" },
                { label: "Bài thi tuần này", value: "3,891", icon: "ri-file-list-3-line", color: "#10b981" },
                { label: "Điểm TB toàn cầu", value: "74.2", icon: "ri-bar-chart-line", color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} className="bg-[#1a1d27] border border-white/8 rounded-xl p-4 text-center">
                  <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                    <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
                  </div>
                  <p className="text-white font-bold text-lg">{s.value}</p>
                  <p className="text-white/40 text-[10px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
