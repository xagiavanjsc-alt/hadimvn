import { useState, useMemo, useEffect } from "react";
import { HANJA_DATA } from "@/mocks/hanjaData";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  wordsLearned: number;
  quizScore: number;
  streak: number;
  xp: number;
  isMe?: boolean;
}

interface WeeklyProgress {
  wordsLearned: number;
  quizScore: number;
  streak: number;
  xp: number;
  lastUpdated: string;
}

const LEADERBOARD_KEY = "hanja_weekly_leaderboard";
const MY_PROGRESS_KEY = "hanja_weekly_my_progress";

function getWeekId(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

function getDaysLeftInWeek(): number {
  const now = new Date();
  const dayOfWeek = now.getDay();
  return dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
}

// Mock friends data (simulated)
const MOCK_FRIENDS: LeaderboardEntry[] = [
  { id: "f1", name: "Minh Tuấn", avatar: "MT", wordsLearned: 48, quizScore: 92, streak: 12, xp: 1240 },
  { id: "f2", name: "Thu Hương", avatar: "TH", wordsLearned: 35, quizScore: 88, streak: 7, xp: 980 },
  { id: "f3", name: "Quang Huy", avatar: "QH", wordsLearned: 52, quizScore: 76, streak: 5, xp: 1100 },
  { id: "f4", name: "Lan Anh", avatar: "LA", wordsLearned: 29, quizScore: 95, streak: 14, xp: 1380 },
  { id: "f5", name: "Đức Thành", avatar: "ĐT", wordsLearned: 41, quizScore: 83, streak: 9, xp: 1050 },
  { id: "f6", name: "Phương Linh", avatar: "PL", wordsLearned: 22, quizScore: 71, streak: 3, xp: 620 },
  { id: "f7", name: "Văn Khoa", avatar: "VK", wordsLearned: 60, quizScore: 89, streak: 18, xp: 1560 },
  { id: "f8", name: "Bảo Châu", avatar: "BC", wordsLearned: 17, quizScore: 65, streak: 2, xp: 410 },
];

function loadMyProgress(): WeeklyProgress {
  try {
    const raw = localStorage.getItem(MY_PROGRESS_KEY);
    if (!raw) return { wordsLearned: 0, quizScore: 0, streak: 0, xp: 0, lastUpdated: "" };
    return JSON.parse(raw);
  } catch {
    return { wordsLearned: 0, quizScore: 0, streak: 0, xp: 0, lastUpdated: "" };
  }
}

function computeMyProgress(): WeeklyProgress {
  try {
    const srData: Record<string, { interval: number; totalReviews: number }> =
      JSON.parse(localStorage.getItem("hanja_sr_data") || "{}");
    const wordsLearned = Object.values(srData).filter(c => c.interval >= 7).length;
    const streakData = JSON.parse(localStorage.getItem("hanja_streak") || "{}");
    const streak = streakData.currentStreak || 0;
    const totalXp = parseInt(localStorage.getItem("kts_total_xp") || "0", 10);
    return {
      wordsLearned,
      quizScore: Math.min(100, Math.round((wordsLearned / Math.max(1, HANJA_DATA.length)) * 100 * 10)),
      streak,
      xp: totalXp,
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return { wordsLearned: 0, quizScore: 0, streak: 0, xp: 0, lastUpdated: "" };
  }
}

type SortKey = "xp" | "wordsLearned" | "quizScore" | "streak";

export default function WeeklyLeaderboardTab() {
  const [sortBy, setSortBy] = useState<SortKey>("xp");
  const [myProgress, setMyProgress] = useState<WeeklyProgress>(loadMyProgress);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const weekId = getWeekId();
  const daysLeft = getDaysLeftInWeek();

  // Refresh my progress
  useEffect(() => {
    const fresh = computeMyProgress();
    setMyProgress(fresh);
    localStorage.setItem(MY_PROGRESS_KEY, JSON.stringify(fresh));
  }, []);

  const meEntry: LeaderboardEntry = {
    id: "me",
    name: "Bạn",
    avatar: "BN",
    wordsLearned: myProgress.wordsLearned,
    quizScore: myProgress.quizScore,
    streak: myProgress.streak,
    xp: myProgress.xp,
    isMe: true,
  };

  const allEntries = useMemo(() => {
    return [...MOCK_FRIENDS, meEntry].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [sortBy, myProgress]);

  const myRank = useMemo(() => {
    return allEntries.findIndex(e => e.isMe) + 1;
  }, [allEntries]);

  const top3 = allEntries.slice(0, 3);
  const rest = allEntries.slice(3);

  const handleShare = () => {
    const text = `Tuần ${weekId}: Tôi đã học ${myProgress.wordsLearned} từ Hán-Hàn, đạt ${myProgress.xp} XP! Xếp hạng #${myRank} trong nhóm bạn bè. 🎯`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setShowShareModal(false);
  };

  const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const rankIcons = ["ri-trophy-fill", "ri-medal-fill", "ri-award-fill"];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Bảng xếp hạng tuần</h2>
            <p className="text-sm text-gray-500">Tuần {weekId} · Còn {daysLeft} ngày</p>
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-rose-600 transition-colors whitespace-nowrap"
          >
            <i className="ri-share-line"></i>Chia sẻ
          </button>
        </div>

        {/* My stats */}
        <div className="bg-white/70 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 flex items-center justify-center bg-rose-500 text-white rounded-full font-bold text-sm flex-shrink-0">
              BN
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm">Bạn · Hạng #{myRank}</p>
              <p className="text-xs text-gray-500">Tuần này</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 rounded-full">
              <i className="ri-star-fill text-rose-500 text-xs"></i>
              <span className="text-rose-600 font-bold text-sm">{myProgress.xp.toLocaleString()} XP</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Từ đã học", value: myProgress.wordsLearned, icon: "ri-book-open-line", color: "#e11d48" },
              { label: "Quiz tốt nhất", value: `${myProgress.quizScore}%`, icon: "ri-gamepad-line", color: "#f97316" },
              { label: "Streak", value: `${myProgress.streak}d`, icon: "ri-fire-line", color: "#f59e0b" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-1" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                </div>
                <p className="font-bold text-gray-900 text-sm">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <span className="text-xs text-gray-500 self-center">Sắp xếp theo:</span>
        {([
          { key: "xp" as SortKey, label: "XP" },
          { key: "wordsLearned" as SortKey, label: "Từ học" },
          { key: "quizScore" as SortKey, label: "Quiz" },
          { key: "streak" as SortKey, label: "Streak" },
        ]).map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${sortBy === opt.key ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[top3[1], top3[0], top3[2]].map((entry, podiumIdx) => {
          if (!entry) return <div key={podiumIdx} />;
          const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
          const heights = ["h-24", "h-32", "h-20"];
          const h = heights[podiumIdx];
          return (
            <div key={entry.id} className={`flex flex-col items-center ${podiumIdx === 1 ? "order-2" : podiumIdx === 0 ? "order-1" : "order-3"}`}>
              <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-sm mb-1 border-2 ${entry.isMe ? "bg-rose-500 text-white border-rose-300" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
                {entry.avatar}
              </div>
              <p className="text-xs font-semibold text-gray-700 mb-1 text-center leading-tight">{entry.name}</p>
              <p className="text-xs text-gray-500 mb-2">{entry[sortBy].toLocaleString()}{sortBy === "quizScore" ? "%" : sortBy === "streak" ? "d" : sortBy === "xp" ? " XP" : " từ"}</p>
              <div className={`w-full ${h} rounded-t-xl flex items-start justify-center pt-2`} style={{ backgroundColor: `${rankColors[rank - 1]}20`, border: `2px solid ${rankColors[rank - 1]}40` }}>
                <i className={`${rankIcons[rank - 1]} text-xl`} style={{ color: rankColors[rank - 1] }}></i>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest of leaderboard */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_80px_80px_80px_80px] bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-500 border-b border-gray-100">
          <span>#</span>
          <span>Người học</span>
          <span className="text-center">Từ học</span>
          <span className="text-center">Quiz</span>
          <span className="text-center">Streak</span>
          <span className="text-center">XP</span>
        </div>
        <div className="divide-y divide-gray-50">
          {allEntries.map((entry, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;
            return (
              <div
                key={entry.id}
                className={`grid grid-cols-[40px_1fr_80px_80px_80px_80px] px-4 py-3 items-center transition-colors ${entry.isMe ? "bg-rose-50/50" : "hover:bg-gray-50/50"}`}
              >
                <div className="flex items-center justify-center">
                  {isTop3 ? (
                    <i className={`${rankIcons[rank - 1]} text-base`} style={{ color: rankColors[rank - 1] }}></i>
                  ) : (
                    <span className="text-sm font-bold text-gray-400">{rank}</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${entry.isMe ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                    {entry.avatar}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${entry.isMe ? "text-rose-600" : "text-gray-800"}`}>
                      {entry.name}
                      {entry.isMe && <span className="ml-1.5 text-xs bg-rose-100 text-rose-500 px-1.5 py-0.5 rounded-full">Bạn</span>}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <span className={`text-sm font-bold ${sortBy === "wordsLearned" ? "text-rose-600" : "text-gray-700"}`}>{entry.wordsLearned}</span>
                </div>
                <div className="text-center">
                  <span className={`text-sm font-bold ${sortBy === "quizScore" ? "text-orange-500" : "text-gray-700"}`}>{entry.quizScore}%</span>
                </div>
                <div className="text-center">
                  <span className={`text-sm font-bold ${sortBy === "streak" ? "text-amber-500" : "text-gray-700"}`}>{entry.streak}d</span>
                </div>
                <div className="text-center">
                  <span className={`text-sm font-bold ${sortBy === "xp" ? "text-rose-600" : "text-gray-700"}`}>{entry.xp.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note about data */}
      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3">
        <p className="text-xs text-amber-700 flex items-start gap-2">
          <i className="ri-information-line flex-shrink-0 mt-0.5"></i>
          <span>Dữ liệu bạn bè là mô phỏng. Kết nối Supabase để so sánh tiến độ thật với bạn bè trong thời gian thực.</span>
        </p>
      </div>

      {/* Share modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <i className="ri-share-line text-rose-500"></i>Chia sẻ tiến độ
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-700 leading-relaxed">
              Tuần {weekId}: Tôi đã học <strong>{myProgress.wordsLearned} từ</strong> Hán-Hàn, đạt <strong>{myProgress.xp} XP</strong>! Xếp hạng <strong>#{myRank}</strong> trong nhóm bạn bè. 🎯
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowShareModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition-colors">Hủy</button>
              <button onClick={handleShare} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-rose-600 transition-colors">
                {copied ? <><i className="ri-check-line mr-1"></i>Đã sao chép!</> : <><i className="ri-clipboard-line mr-1"></i>Sao chép</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

