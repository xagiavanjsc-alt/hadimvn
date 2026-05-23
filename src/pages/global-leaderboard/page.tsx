import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface GlobalUser {
  rank: number;
  name: string;
  country: string;
  countryFlag: string;
  level: string;
  xp: number;
  streak: number;
  wordsLearned: number;
  avatar: string;
  badge: string;
  weeklyXP: number;
  isCurrentUser?: boolean;
}

const GLOBAL_USERS: GlobalUser[] = [
  { rank: 1, name: "Nguyễn Thị Lan", country: "Việt Nam", countryFlag: "🇻🇳", level: "C1", xp: 98450, streak: 365, wordsLearned: 2840, avatar: "/images/brand/logo.svg", badge: "ri-vip-crown-2-line", weeklyXP: 4200 },
  { rank: 2, name: "Trần Minh Khoa", country: "Việt Nam", countryFlag: "🇻🇳", level: "B2", xp: 87320, streak: 280, wordsLearned: 2450, avatar: "/images/brand/logo.svg", badge: "ri-medal-line", weeklyXP: 3850 },
  { rank: 3, name: "Lê Thu Hương", country: "Việt Nam", countryFlag: "🇻🇳", level: "B2", xp: 76890, streak: 210, wordsLearned: 2180, avatar: "/images/brand/logo.svg", badge: "ri-award-line", weeklyXP: 3200 },
  { rank: 4, name: "Phạm Đức Anh", country: "Việt Nam", countryFlag: "🇻🇳", level: "B1", xp: 65400, streak: 180, wordsLearned: 1920, avatar: "/images/brand/logo.svg", badge: "ri-star-line", weeklyXP: 2900 },
  { rank: 5, name: "Hoàng Thị Mai", country: "Việt Nam", countryFlag: "🇻🇳", level: "B1", xp: 58700, streak: 145, wordsLearned: 1750, avatar: "/images/brand/logo.svg", badge: "ri-fire-line", weeklyXP: 2650 },
  { rank: 6, name: "Vũ Thanh Tùng", country: "Việt Nam", countryFlag: "🇻🇳", level: "A2", xp: 45200, streak: 98, wordsLearned: 1340, avatar: "/images/brand/logo.svg", badge: "ri-shield-star-line", weeklyXP: 2100 },
  { rank: 7, name: "Đặng Thị Hoa", country: "Việt Nam", countryFlag: "🇻🇳", level: "A2", xp: 38900, streak: 76, wordsLearned: 1120, avatar: "/images/brand/logo.svg", badge: "ri-leaf-line", weeklyXP: 1850 },
  { rank: 8, name: "Bùi Văn Nam", country: "Việt Nam", countryFlag: "🇻🇳", level: "A2", xp: 32100, streak: 54, wordsLearned: 980, avatar: "/images/brand/logo.svg", badge: "ri-seedling-line", weeklyXP: 1600 },
  { rank: 9, name: "Ngô Thị Linh", country: "Việt Nam", countryFlag: "🇻🇳", level: "A1", xp: 24500, streak: 32, wordsLearned: 720, avatar: "/images/brand/logo.svg", badge: "ri-plant-line", weeklyXP: 1200 },
  { rank: 10, name: "Đinh Quang Huy", country: "Việt Nam", countryFlag: "🇻🇳", level: "A1", xp: 18700, streak: 21, wordsLearned: 540, avatar: "/images/brand/logo.svg", badge: "ri-star-smile-line", weeklyXP: 980 },
  { rank: 11, name: "Trịnh Thị Yến", country: "Việt Nam", countryFlag: "🇻🇳", level: "A1", xp: 15200, streak: 15, wordsLearned: 420, avatar: "/images/brand/logo.svg", badge: "ri-emotion-happy-line", weeklyXP: 780 },
  { rank: 12, name: "Lý Văn Đức", country: "Việt Nam", countryFlag: "🇻🇳", level: "A1", xp: 12400, streak: 10, wordsLearned: 310, avatar: "/images/brand/logo.svg", badge: "ri-thumb-up-line", weeklyXP: 620 },
  { rank: 47, name: "Bạn", country: "Việt Nam", countryFlag: "🇻🇳", level: "A2", xp: 3240, streak: 7, wordsLearned: 180, avatar: "", badge: "ri-user-line", weeklyXP: 320, isCurrentUser: true },
];

const WEEKLY_TOP: GlobalUser[] = [
  { rank: 1, name: "Nguyễn Thị Lan", country: "Việt Nam", countryFlag: "🇻🇳", level: "C1", xp: 98450, streak: 365, wordsLearned: 2840, avatar: "/images/brand/logo.svg", badge: "ri-vip-crown-2-line", weeklyXP: 4200 },
  { rank: 2, name: "Hoàng Thị Mai", country: "Việt Nam", countryFlag: "🇻🇳", level: "B1", xp: 58700, streak: 145, wordsLearned: 1750, avatar: "/images/brand/logo.svg", badge: "ri-fire-line", weeklyXP: 3950 },
  { rank: 3, name: "Trần Minh Khoa", country: "Việt Nam", countryFlag: "🇻🇳", level: "B2", xp: 87320, streak: 280, wordsLearned: 2450, avatar: "/images/brand/logo.svg", badge: "ri-medal-line", weeklyXP: 3850 },
];

const TABS = ["Tổng XP", "Tuần này", "Streak", "Từ vựng"];

const rankMedal = (rank: number) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
};

const levelColor: Record<string, string> = {
  A1: "text-app-accent-success bg-app-accent-success/15",
  A2: "text-teal-400 bg-teal-500/15",
  B1: "text-amber-400 bg-amber-500/15",
  B2: "text-orange-400 bg-orange-500/15",
  C1: "text-rose-400 bg-rose-500/15",
};

export default function GlobalLeaderboardPage() {
  const [activeTab, setActiveTab] = useState("Tổng XP");
  const [search, setSearch] = useState("");

  const getSortedUsers = () => {
    let users = [...GLOBAL_USERS.filter(u => !u.isCurrentUser)];
    if (activeTab === "Tuần này") users = users.sort((a, b) => b.weeklyXP - a.weeklyXP).map((u, i) => ({ ...u, rank: i + 1 }));
    else if (activeTab === "Streak") users = users.sort((a, b) => b.streak - a.streak).map((u, i) => ({ ...u, rank: i + 1 }));
    else if (activeTab === "Từ vựng") users = users.sort((a, b) => b.wordsLearned - a.wordsLearned).map((u, i) => ({ ...u, rank: i + 1 }));
    if (search) users = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
    return users;
  };

  const sortedUsers = getSortedUsers();
  const currentUser = GLOBAL_USERS.find(u => u.isCurrentUser);
  const top3 = activeTab === "Tuần này" ? WEEKLY_TOP : sortedUsers.slice(0, 3);

  const getMetric = (user: GlobalUser) => {
    if (activeTab === "Tuần này") return `${user.weeklyXP.toLocaleString()} XP`;
    if (activeTab === "Streak") return `${user.streak} ngày`;
    if (activeTab === "Từ vựng") return `${user.wordsLearned.toLocaleString()} từ`;
    return `${user.xp.toLocaleString()} XP`;
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Bảng Xếp Hạng Toàn Cầu</h1>
            <p className="text-white/50 text-sm mt-1">So sánh với học viên trên toàn thế giới</p>
          </div>
          <div className="text-app-text-muted text-sm"><i className="ri-global-line mr-1"></i>979 từ vựng · 1,200+ học viên</div>
        </div>

        {/* Top 3 Podium */}
        <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-app-border">
          <h3 className="text-white/60 text-xs tracking-normal font-semibold mb-6 text-center">Top 3 {activeTab}</h3>
          <div className="flex items-end justify-center gap-4">
            {/* 2nd */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="relative">
                <img src={top3[1]?.avatar} alt={top3[1]?.name} loading="lazy" decoding="async" className="w-14 h-14 rounded-full object-cover border-2 border-white/20" onError={e => { (e.target as HTMLImageElement).src = "/images/brand/logo.svg"; }} />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#C0C0C0] flex items-center justify-center text-xs font-bold text-black">2</div>
              </div>
              <p className="text-white/70 text-xs font-medium text-center truncate w-full">{top3[1]?.name}</p>
              <p className="text-app-text-secondary text-xs">{top3[1] ? getMetric(top3[1]) : ""}</p>
              <div className="w-full h-16 bg-white/8 rounded-t-lg flex items-center justify-center">
                <span className="text-3xl">🥈</span>
              </div>
            </div>
            {/* 1st */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</div>
                <img loading="lazy" decoding="async" src={top3[0]?.avatar} alt={top3[0]?.name} className="w-18 h-18 rounded-full object-cover border-2 border-app-accent-primary/60 mt-2" style={{ width: 72, height: 72 }} onError={e => { (e.target as HTMLImageElement).src = "/images/brand/logo.svg"; }} />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-app-accent-primary flex items-center justify-center text-xs font-bold text-black">1</div>
              </div>
              <p className="text-app-accent-primary text-xs font-bold text-center truncate w-full">{top3[0]?.name}</p>
              <p className="text-app-accent-primary/70 text-xs">{top3[0] ? getMetric(top3[0]) : ""}</p>
              <div className="w-full h-24 bg-app-accent-primary/10 border border-app-accent-primary/20 rounded-t-lg flex items-center justify-center">
                <span className="text-3xl">🥇</span>
              </div>
            </div>
            {/* 3rd */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="relative">
                <img src={top3[2]?.avatar} alt={top3[2]?.name} loading="lazy" decoding="async" className="w-14 h-14 rounded-full object-cover border-2 border-white/20" onError={e => { (e.target as HTMLImageElement).src = "/images/brand/logo.svg"; }} />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#CD7F32] flex items-center justify-center text-xs font-bold text-white">3</div>
              </div>
              <p className="text-white/70 text-xs font-medium text-center truncate w-full">{top3[2]?.name}</p>
              <p className="text-app-text-secondary text-xs">{top3[2] ? getMetric(top3[2]) : ""}</p>
              <div className="w-full h-10 bg-app-card/50 rounded-t-lg flex items-center justify-center">
                <span className="text-3xl">🥉</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-app-card/50 rounded-lg p-1">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === tab ? "bg-app-accent-primary/20 text-app-accent-primary font-semibold" : "text-app-text-secondary hover:text-white/60"}`}>{tab}</button>
            ))}
          </div>
          <div className="flex-1 relative min-w-48">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
            <input type="text" placeholder="Tìm học viên..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-app-card/50 border border-app-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-app-accent-primary/40" />
          </div>
        </div>

        {/* Leaderboard list */}
        <div className="bg-[#1a1f2e] rounded-xl border border-app-border overflow-hidden">
          <div className="divide-y divide-white/5">
            {sortedUsers.map((user, idx) => (
              <div key={user.name + idx} className={`flex items-center gap-4 px-5 py-3.5 transition-all ${user.isCurrentUser ? "bg-app-accent-primary/5 border-l-2 border-app-accent-primary" : "hover:bg-app-surface/50"}`}>
                {/* Rank */}
                <div className="w-10 text-center flex-shrink-0">
                  {user.rank <= 3 ? (
                    <span className="text-xl">{rankMedal(user.rank)}</span>
                  ) : (
                    <span className={`text-sm font-bold ${user.isCurrentUser ? "text-app-accent-primary" : "text-app-text-secondary"}`}>#{user.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} loading="lazy" decoding="async" className="w-10 h-10 rounded-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/images/brand/logo.svg"; }} />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-app-accent-primary/20 flex items-center justify-center">
                      <i className="ri-user-line text-app-accent-primary"></i>
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 text-sm">{user.countryFlag}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold truncate ${user.isCurrentUser ? "text-app-accent-primary" : "text-white/85"}`}>
                      {user.name}
                      {user.isCurrentUser && <span className="ml-1.5 text-[10px] bg-app-accent-primary/20 text-app-accent-primary px-1.5 py-0.5 rounded-full">Bạn</span>}
                    </p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${levelColor[user.level]}`}>{user.level}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-app-text-muted text-xs"><i className="ri-fire-line mr-0.5 text-orange-400"></i>{user.streak}d</span>
                    <span className="text-app-text-muted text-xs"><i className="ri-translate-2 mr-0.5"></i>{user.wordsLearned.toLocaleString()}</span>
                  </div>
                </div>

                {/* Metric */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${user.isCurrentUser ? "text-app-accent-primary" : "text-white/70"}`}>{getMetric(user)}</p>
                  {activeTab !== "Tuần này" && <p className="text-app-text-muted text-xs">+{user.weeklyXP.toLocaleString()} tuần</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current user position */}
        {currentUser && !search && (
          <div className="bg-app-accent-primary/5 border border-app-accent-primary/20 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-app-accent-primary/20 flex items-center justify-center flex-shrink-0">
              <i className="ri-user-line text-app-accent-primary"></i>
            </div>
            <div className="flex-1">
              <p className="text-app-accent-primary font-semibold text-sm">Vị trí của bạn: #{currentUser.rank}</p>
              <p className="text-app-text-secondary text-xs">Cần thêm {(GLOBAL_USERS[currentUser.rank - 2]?.xp - currentUser.xp).toLocaleString()} XP để lên hạng #{currentUser.rank - 1}</p>
            </div>
            <div className="text-right">
              <p className="text-app-accent-primary font-bold">{currentUser.xp.toLocaleString()} XP</p>
              <p className="text-app-text-muted text-xs">+{currentUser.weeklyXP} tuần này</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Tổng học viên", value: "1,247", icon: "ri-group-line", color: "text-app-accent-success" },
            { label: "Đang online", value: "89", icon: "ri-wifi-line", color: "text-teal-400" },
            { label: "Từ vựng TB", value: "847", icon: "ri-translate-2", color: "text-amber-400" },
            { label: "Streak TB", value: "43 ngày", icon: "ri-fire-line", color: "text-orange-400" },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1a1f2e] rounded-xl p-4 border border-app-border text-center">
              <i className={`${stat.icon} ${stat.color} text-xl mb-1 block`}></i>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-app-text-muted text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
