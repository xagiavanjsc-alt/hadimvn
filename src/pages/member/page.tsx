import { useParams, useNavigate } from "react-router-dom";
import MobileNav from "@/components/feature/MobileNav";

const MemberProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const member = {
    id: userId ?? "unknown",
    name: "Kim Minji",
    level: "Intermediate",
    streak: 42,
    xp: 8_420,
    avatar: `https://readdy.ai/api/search-image?query=portrait%20young%20asian%20woman%20smiling%20friendly%20profile%20photo%20soft%20lighting%20clean%20background&width=200&height=200&seq=member${userId}&orientation=squarish`,
    badges: ["🔥 Streak 30", "⭐ Top Learner", "📚 Bookworm", "🎯 Quiz Master"],
    stats: { words: 1240, quizzes: 87, reviews: 320 },
  };

  return (
    <div className="min-h-screen bg-[#0f1117] pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0f1117]/95 backdrop-blur-md border-b border-white/8 h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/60 hover:text-white cursor-pointer transition-colors"
        >
          <i className="ri-arrow-left-line text-base" />
        </button>
        <h1 className="text-sm font-bold text-white">Hồ sơ thành viên</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Profile Card */}
        <div className="bg-white/3 border border-white/6 rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-20 h-20 rounded-full object-cover object-top border-2 border-white/10"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center bg-[#e8c84a] rounded-full">
              <i className="ri-star-fill text-[#0f1117] text-[10px]" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">{member.name}</h2>
          <span className="text-xs text-[#e8c84a] font-semibold bg-[#e8c84a]/10 border border-[#e8c84a]/20 px-3 py-1 rounded-full">
            {member.level}
          </span>

          {/* Stats Row */}
          <div className="flex w-full mt-5 divide-x divide-white/8">
            <div className="flex-1 flex flex-col items-center py-2">
              <span className="text-base font-bold text-white">{member.streak}</span>
              <span className="text-[10px] text-white/35 mt-0.5">Streak</span>
            </div>
            <div className="flex-1 flex flex-col items-center py-2">
              <span className="text-base font-bold text-[#e8c84a]">{member.xp.toLocaleString()}</span>
              <span className="text-[10px] text-white/35 mt-0.5">XP</span>
            </div>
            <div className="flex-1 flex flex-col items-center py-2">
              <span className="text-base font-bold text-white">{member.stats.words}</span>
              <span className="text-[10px] text-white/35 mt-0.5">Từ vựng</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <h3 className="text-xs font-bold text-white/50 tracking-normal mb-3">Huy hiệu</h3>
          <div className="flex flex-wrap gap-2">
            {member.badges.map((badge) => (
              <span
                key={badge}
                className="text-xs bg-[#e8c84a]/8 border border-[#e8c84a]/15 text-[#e8c84a]/80 px-3 py-1.5 rounded-full font-medium"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <h3 className="text-xs font-bold text-white/50 tracking-normal mb-3">Hoạt động học tập</h3>
          <div className="space-y-3">
            {[
              { label: "Bài kiểm tra hoàn thành", value: member.stats.quizzes, icon: "ri-question-line", color: "text-[#e8c84a]", bg: "bg-[#e8c84a]/10" },
              { label: "Lượt ôn tập", value: member.stats.reviews, icon: "ri-refresh-line", color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Từ vựng đã học", value: member.stats.words, icon: "ri-book-open-line", color: "text-sky-400", bg: "bg-sky-500/10" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center rounded-xl ${stat.bg} flex-shrink-0`}>
                  <i className={`${stat.icon} text-sm ${stat.color}`} />
                </div>
                <span className="flex-1 text-sm text-white/55">{stat.label}</span>
                <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <h3 className="text-xs font-bold text-white/50 tracking-normal mb-3">Hoạt động gần đây</h3>
          <div className="space-y-2.5">
            {[
              { text: "Hoàn thành bài kiểm tra TOPIK I", time: "2 giờ trước", icon: "ri-checkbox-circle-line", color: "text-emerald-400" },
              { text: "Học 15 từ vựng mới", time: "Hôm qua", icon: "ri-book-2-line", color: "text-[#e8c84a]" },
              { text: "Streak 42 ngày liên tiếp", time: "3 ngày trước", icon: "ri-fire-line", color: "text-orange-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                  <i className={`${item.icon} text-sm ${item.color}`} />
                </div>
                <p className="flex-1 text-xs text-white/55">{item.text}</p>
                <span className="text-[10px] text-white/25 whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
};

export default MemberProfilePage;
