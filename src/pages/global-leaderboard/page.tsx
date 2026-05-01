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
  { rank: 1, name: "Nguyễn Thị Lan", country: "Việt Nam", countryFlag: "🇻🇳", level: "C1", xp: 98450, streak: 365, wordsLearned: 2840, avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20young%20woman%20student%20smiling%20portrait%20professional%20photo&width=80&height=80&seq=av1&orientation=squarish", badge: "ri-vip-crown-2-line", weeklyXP: 4200 },
  { rank: 2, name: "Trần Minh Khoa", country: "Việt Nam", countryFlag: "🇻🇳", level: "B2", xp: 87320, streak: 280, wordsLearned: 2450, avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20young%20man%20student%20smiling%20portrait%20professional%20photo&width=80&height=80&seq=av2&orientation=squarish", badge: "ri-medal-line", weeklyXP: 3850 },
  { rank: 3, name: "Lê Thu Hương", country: "Việt Nam", countryFlag: "🇻🇳", level: "B2", xp: 76890, streak: 210, wordsLearned: 2180, avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20woman%20professional%20portrait%20smiling%20office%20background&width=80&height=80&seq=av3&orientation=squarish", badge: "ri-award-line", weeklyXP: 3200 },
  { rank: 4, name: "Phạm Đức Anh", country: "Việt Nam", countryFlag: "🇻🇳", level: "B1", xp: 65400, streak: 180, wordsLearned: 1920, avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20man%20young%20professional%20portrait%20casual%20smile&width=80&height=80&seq=av4&orientation=squarish", badge: "ri-star-line", weeklyXP: 2900 },
  { rank: 5, name: "Hoàng Thị Mai", country: "Việt Nam", countryFlag: "🇻🇳", level: "B1", xp: 58700, streak: 145, wordsLearned: 1750, avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20young%20woman%20casual%20portrait%20smiling%20happy&width=80&height=80&seq=av5&orientation=squarish", badge: "ri-fire-line", weeklyXP: 2650 },
  { rank: 6, name: "Vũ Thanh Tùng", country: "Việt Nam", countryFlag: "🇻🇳", level: "A2", xp: 45200, streak: 98, wordsLearned: 1340, avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20man%20student%20portrait%20casual%20background&width=80&height=80&seq=av6&orientation=squarish", badge: "ri-shield-star-line", weeklyXP: 2100 },
  { rank: 7, name: "Đặng Thị Hoa", country: "Việt Nam", countryFlag: "🇻🇳", level: "A2", xp: 38900, streak: 76, wordsLearned: 1120, avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20woman%20portrait%20smiling%20natural%20light&width=80&height=80&seq=av7&orientation=squarish", badge: "ri-leaf-line", weeklyXP: 1850 },
  { rank: 8, name: "Bùi Văn Nam", country: "Việt Nam", countryFlag: "🇻🇳", level: "A2", xp: 32100, streak: 54, wordsLearned: 980, avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20young%20man%20casual%20portrait%20outdoor&width=80&height=80&seq=av8&orientation=squarish", badge: "ri-seedling-line", weeklyXP: 1600 },
  { rank: 9, name: "Ngô Thị Linh", country: "Việt Nam", countryFlag: "🇻🇳", level: "A1", xp: 24500, streak: 32, wordsLearned: 720, avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20girl%20student%20portrait%20smiling%20school&width=80&height=80&seq=av9&orientation=squarish", badge: "ri-plant-line", weeklyXP: 1200 },
  { rank: 10, name: "Đinh Quang Huy", country: "Việt Nam", countryFlag: "🇻🇳", level: "A1", xp: 18700, streak: 21, wordsLearned: 540, avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20young%20man%20portrait%20casual%20smile%20outdoor&width=80&height=80&seq=av10&orientation=squarish", badge: "ri-star-smile-line", weeklyXP: 980 },
  { rank: 11, name: "Trịnh Thị Yến", country: "Việt Nam", countryFlag: "🇻🇳", level: "A1", xp: 15200, streak: 15, wordsLearned: 420, avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20woman%20portrait%20natural%20smile%20casual&width=80&height=80&seq=av11&orientation=squarish", badge: "ri-emotion-happy-line", weeklyXP: 780 },
  { rank: 12, name: "Lý Văn Đức", country: "Việt Nam", countryFlag: "🇻🇳", level: "A1", xp: 12400, streak: 10, wordsLearned: 310, avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20man%20portrait%20casual%20outdoor%20smile&width=80&height=80&seq=av12&orientation=squarish", badge: "ri-thumb-up-line", weeklyXP: 620 },
  { rank: 47, name: "Bạn", country: "Việt Nam", countryFlag: "🇻🇳", level: "A2", xp: 3240, streak: 7, wordsLearned: 180, avatar: "", badge: "ri-user-line", weeklyXP: 320, isCurrentUser: true },
];

const WEEKLY_TOP: GlobalUser[] = [
  { rank: 1, name: "Nguyễn Thị Lan", country: "Việt Nam", countryFlag: "🇻🇳", level: "C1", xp: 98450, streak: 365, wordsLearned: 2840, avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20young%20woman%20student%20smiling%20portrait%20professional%20photo&width=80&height=80&seq=av1&orientation=squarish", badge: "ri-vip-crown-2-line", weeklyXP: 4200 },
  { rank: 2, name: "Hoàng Thị Mai", country: "Việt Nam", countryFlag: "🇻🇳", level: "B1", xp: 58700, streak: 145, wordsLearned: 1750, avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20young%20woman%20casual%20portrait%20smiling%20happy&width=80&height=80&seq=av5&orientation=squarish", badge: "ri-fire-line", weeklyXP: 3950 },
  { rank: 3, name: "Trần Minh Khoa", country: "Việt Nam", countryFlag: "🇻🇳", level: "B2", xp: 87320, streak: 280, wordsLearned: 2450, avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20young%20man%20student%20smiling%20portrait%20professional%20photo&width=80&height=80&seq=av2&orientation=squarish", badge: "ri-medal-line", weeklyXP: 3850 },
];

const TABS = ["Tổng XP", "Tuần này", "Streak", "Từ vựng"];

const rankMedal = (rank: number) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
};

const levelColor: Record<string, string> = {
  A1: "text-emerald-400 bg-emerald-500/15",
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
          <div className="text-white/30 text-sm"><i className="ri-global-line mr-1"></i>979 từ vựng · 1,200+ học viên</div>
        </div>

        {/* Top 3 Podium */}
        <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-white/8">
          <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-6 text-center">Top 3 {activeTab}</h3>
          <div className="flex items-end justify-center gap-4">
            {/* 2nd */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="relative">
                <img src={top3[1]?.avatar} alt={top3[1]?.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/20" onError={e => { (e.target as HTMLImageElement).src = "https://readdy.ai/api/search-image?query=person%20portrait%20avatar%20neutral%20background&width=80&height=80&seq=def2&orientation=squarish"; }} />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#C0C0C0] flex items-center justify-center text-xs font-bold text-black">2</div>
              </div>
              <p className="text-white/70 text-xs font-medium text-center truncate w-full">{top3[1]?.name}</p>
              <p className="text-white/40 text-xs">{top3[1] ? getMetric(top3[1]) : ""}</p>
              <div className="w-full h-16 bg-white/8 rounded-t-lg flex items-center justify-center">
                <span className="text-3xl">🥈</span>
              </div>
            </div>
            {/* 1st */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</div>
                <img src={top3[0]?.avatar} alt={top3[0]?.name} className="w-18 h-18 rounded-full object-cover border-2 border-[#e8c84a]/60 mt-2" style={{ width: 72, height: 72 }} onError={e => { (e.target as HTMLImageElement).src = "https://readdy.ai/api/search-image?query=person%20portrait%20avatar%20neutral%20background&width=80&height=80&seq=def1&orientation=squarish"; }} />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#e8c84a] flex items-center justify-center text-xs font-bold text-black">1</div>
              </div>
              <p className="text-[#e8c84a] text-xs font-bold text-center truncate w-full">{top3[0]?.name}</p>
              <p className="text-[#e8c84a]/70 text-xs">{top3[0] ? getMetric(top3[0]) : ""}</p>
              <div className="w-full h-24 bg-[#e8c84a]/10 border border-[#e8c84a]/20 rounded-t-lg flex items-center justify-center">
                <span className="text-3xl">🥇</span>
              </div>
            </div>
            {/* 3rd */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="relative">
                <img src={top3[2]?.avatar} alt={top3[2]?.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/20" onError={e => { (e.target as HTMLImageElement).src = "https://readdy.ai/api/search-image?query=person%20portrait%20avatar%20neutral%20background&width=80&height=80&seq=def3&orientation=squarish"; }} />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#CD7F32] flex items-center justify-center text-xs font-bold text-white">3</div>
              </div>
              <p className="text-white/70 text-xs font-medium text-center truncate w-full">{top3[2]?.name}</p>
              <p className="text-white/40 text-xs">{top3[2] ? getMetric(top3[2]) : ""}</p>
              <div className="w-full h-10 bg-white/5 rounded-t-lg flex items-center justify-center">
                <span className="text-3xl">🥉</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === tab ? "bg-[#e8c84a]/20 text-[#e8c84a] font-semibold" : "text-white/40 hover:text-white/60"}`}>{tab}</button>
            ))}
          </div>
          <div className="flex-1 relative min-w-48">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm"></i>
            <input type="text" placeholder="Tìm học viên..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#e8c84a]/40" />
          </div>
        </div>

        {/* Leaderboard list */}
        <div className="bg-[#1a1f2e] rounded-xl border border-white/8 overflow-hidden">
          <div className="divide-y divide-white/5">
            {sortedUsers.map((user, idx) => (
              <div key={user.name + idx} className={`flex items-center gap-4 px-5 py-3.5 transition-all ${user.isCurrentUser ? "bg-[#e8c84a]/5 border-l-2 border-[#e8c84a]" : "hover:bg-white/3"}`}>
                {/* Rank */}
                <div className="w-10 text-center flex-shrink-0">
                  {user.rank <= 3 ? (
                    <span className="text-xl">{rankMedal(user.rank)}</span>
                  ) : (
                    <span className={`text-sm font-bold ${user.isCurrentUser ? "text-[#e8c84a]" : "text-white/40"}`}>#{user.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "https://readdy.ai/api/search-image?query=person%20portrait%20avatar%20neutral%20background&width=80&height=80&seq=defav&orientation=squarish"; }} />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#e8c84a]/20 flex items-center justify-center">
                      <i className="ri-user-line text-[#e8c84a]"></i>
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 text-sm">{user.countryFlag}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold truncate ${user.isCurrentUser ? "text-[#e8c84a]" : "text-white/85"}`}>
                      {user.name}
                      {user.isCurrentUser && <span className="ml-1.5 text-[10px] bg-[#e8c84a]/20 text-[#e8c84a] px-1.5 py-0.5 rounded-full">Bạn</span>}
                    </p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${levelColor[user.level]}`}>{user.level}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-white/30 text-xs"><i className="ri-fire-line mr-0.5 text-orange-400"></i>{user.streak}d</span>
                    <span className="text-white/30 text-xs"><i className="ri-translate-2 mr-0.5"></i>{user.wordsLearned.toLocaleString()}</span>
                  </div>
                </div>

                {/* Metric */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${user.isCurrentUser ? "text-[#e8c84a]" : "text-white/70"}`}>{getMetric(user)}</p>
                  {activeTab !== "Tuần này" && <p className="text-white/25 text-xs">+{user.weeklyXP.toLocaleString()} tuần</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current user position */}
        {currentUser && !search && (
          <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/20 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#e8c84a]/20 flex items-center justify-center flex-shrink-0">
              <i className="ri-user-line text-[#e8c84a]"></i>
            </div>
            <div className="flex-1">
              <p className="text-[#e8c84a] font-semibold text-sm">Vị trí của bạn: #{currentUser.rank}</p>
              <p className="text-white/40 text-xs">Cần thêm {(GLOBAL_USERS[currentUser.rank - 2]?.xp - currentUser.xp).toLocaleString()} XP để lên hạng #{currentUser.rank - 1}</p>
            </div>
            <div className="text-right">
              <p className="text-[#e8c84a] font-bold">{currentUser.xp.toLocaleString()} XP</p>
              <p className="text-white/30 text-xs">+{currentUser.weeklyXP} tuần này</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Tổng học viên", value: "1,247", icon: "ri-group-line", color: "text-emerald-400" },
            { label: "Đang online", value: "89", icon: "ri-wifi-line", color: "text-teal-400" },
            { label: "Từ vựng TB", value: "847", icon: "ri-translate-2", color: "text-amber-400" },
            { label: "Streak TB", value: "43 ngày", icon: "ri-fire-line", color: "text-orange-400" },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1a1f2e] rounded-xl p-4 border border-white/8 text-center">
              <i className={`${stat.icon} ${stat.color} text-xl mb-1 block`}></i>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-white/30 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
