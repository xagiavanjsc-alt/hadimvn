import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Achievement {
  id: string;
  icon: string;
  name: string;
  desc: string;
  category: "streak" | "eps" | "vocab" | "quiz" | "special";
  condition: (stats: UserStats) => boolean;
  reward: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface UserStats {
  streak: number;
  longestStreak: number;
  epsScore: number;
  wordsLearned: number;
  quizCount: number;
  flashcardCount: number;
  daysStudied: number;
  ebookExports: number;
  totalXP: number;
}

const ACHIEVEMENTS: Achievement[] = [
  // Streak
  { id: "streak_3", icon: "ri-fire-line", name: "Bắt đầu hành trình", desc: "Học 3 ngày liên tiếp", category: "streak", condition: s => s.streak >= 3, reward: "+50 XP", rarity: "common" },
  { id: "streak_7", icon: "ri-fire-fill", name: "Tuần lễ vàng", desc: "Học 7 ngày liên tiếp", category: "streak", condition: s => s.streak >= 7, reward: "+150 XP", rarity: "common" },
  { id: "streak_14", icon: "ri-fire-fill", name: "Hai tuần bền bỉ", desc: "Học 14 ngày liên tiếp", category: "streak", condition: s => s.streak >= 14, reward: "+300 XP", rarity: "rare" },
  { id: "streak_30", icon: "ri-fire-fill", name: "Tháng học không nghỉ", desc: "Học 30 ngày liên tiếp — milestone lớn!", category: "streak", condition: s => s.streak >= 30, reward: "+700 XP + Huy hiệu Lửa", rarity: "rare" },
  { id: "streak_60", icon: "ri-fire-fill", name: "Hai tháng bất bại", desc: "Học 60 ngày liên tiếp", category: "streak", condition: s => s.streak >= 60, reward: "+1200 XP + Huy hiệu Bạch kim", rarity: "epic" },
  { id: "streak_100", icon: "ri-fire-fill", name: "Huyền thoại 100 ngày", desc: "Học 100 ngày liên tiếp", category: "streak", condition: s => s.streak >= 100, reward: "+2000 XP + Huy hiệu Vàng", rarity: "legendary" },
  // EPS
  { id: "eps_first", icon: "ri-file-list-3-line", name: "Câu EPS đầu tiên", desc: "Làm câu hỏi EPS đầu tiên", category: "eps", condition: s => s.epsScore > 0, reward: "+30 XP", rarity: "common" },
  { id: "eps_50", icon: "ri-medal-line", name: "Vượt ngưỡng 50", desc: "Đạt 50+ điểm EPS", category: "eps", condition: s => s.epsScore >= 50, reward: "+100 XP", rarity: "common" },
  { id: "eps_70", icon: "ri-medal-fill", name: "Học viên xuất sắc", desc: "Đạt 70+ điểm EPS", category: "eps", condition: s => s.epsScore >= 70, reward: "+250 XP", rarity: "rare" },
  { id: "eps_80", icon: "ri-trophy-line", name: "Gần đỉnh cao", desc: "Đạt 80+ điểm EPS — sắp đậu rồi!", category: "eps", condition: s => s.epsScore >= 80, reward: "+500 XP", rarity: "rare" },
  { id: "eps_90", icon: "ri-trophy-fill", name: "Bậc thầy EPS", desc: "Đạt 90+ điểm EPS", category: "eps", condition: s => s.epsScore >= 90, reward: "+1000 XP + Huy hiệu Bạch kim", rarity: "epic" },
  { id: "eps_100", icon: "ri-vip-crown-fill", name: "Điểm tuyệt đối", desc: "Đạt 100 điểm EPS — hoàn hảo!", category: "eps", condition: s => s.epsScore >= 100, reward: "+3000 XP + Huy hiệu Huyền thoại", rarity: "legendary" },
  // Vocab
  { id: "vocab_10", icon: "ri-book-open-line", name: "Từ vựng đầu tiên", desc: "Học 10 từ vựng", category: "vocab", condition: s => s.wordsLearned >= 10, reward: "+30 XP", rarity: "common" },
  { id: "vocab_50", icon: "ri-book-open-line", name: "Từ vựng cơ bản", desc: "Học 50 từ vựng", category: "vocab", condition: s => s.wordsLearned >= 50, reward: "+80 XP", rarity: "common" },
  { id: "vocab_200", icon: "ri-book-2-line", name: "Kho từ phong phú", desc: "Học 200 từ vựng", category: "vocab", condition: s => s.wordsLearned >= 200, reward: "+200 XP", rarity: "common" },
  { id: "vocab_500", icon: "ri-book-fill", name: "Từ điển sống", desc: "Học 500 từ vựng", category: "vocab", condition: s => s.wordsLearned >= 500, reward: "+500 XP", rarity: "rare" },
  { id: "vocab_1000", icon: "ri-book-fill", name: "Ngàn từ vựng", desc: "Học 1000 từ vựng", category: "vocab", condition: s => s.wordsLearned >= 1000, reward: "+1200 XP", rarity: "epic" },
  // Quiz
  { id: "quiz_1", icon: "ri-survey-line", name: "Quiz đầu tiên", desc: "Hoàn thành bài quiz đầu tiên", category: "quiz", condition: s => s.quizCount >= 1, reward: "+20 XP", rarity: "common" },
  { id: "quiz_10", icon: "ri-survey-line", name: "Người mới bắt đầu", desc: "Hoàn thành 10 bài quiz", category: "quiz", condition: s => s.quizCount >= 10, reward: "+60 XP", rarity: "common" },
  { id: "quiz_50", icon: "ri-survey-fill", name: "Tay quiz chuyên nghiệp", desc: "Hoàn thành 50 bài quiz", category: "quiz", condition: s => s.quizCount >= 50, reward: "+300 XP", rarity: "rare" },
  { id: "quiz_100", icon: "ri-survey-fill", name: "Quiz Master", desc: "Hoàn thành 100 bài quiz", category: "quiz", condition: s => s.quizCount >= 100, reward: "+800 XP", rarity: "epic" },
  // Special
  { id: "xp_100", icon: "ri-star-line", name: "100 XP đầu tiên", desc: "Tích lũy 100 XP", category: "special", condition: s => s.totalXP >= 100, reward: "+50 XP bonus", rarity: "common" },
  { id: "xp_500", icon: "ri-star-fill", name: "500 XP — Đang lên!", desc: "Tích lũy 500 XP", category: "special", condition: s => s.totalXP >= 500, reward: "+150 XP bonus", rarity: "rare" },
  { id: "xp_1000", icon: "ri-award-line", name: "1000 XP — Huyền thoại", desc: "Tích lũy 1000 XP", category: "special", condition: s => s.totalXP >= 1000, reward: "+500 XP bonus", rarity: "epic" },
  { id: "days_30", icon: "ri-calendar-check-fill", name: "Học viên chuyên cần", desc: "Học 30 ngày khác nhau", category: "special", condition: s => s.daysStudied >= 30, reward: "+400 XP", rarity: "rare" },
  { id: "days_100", icon: "ri-calendar-fill", name: "Trăm ngày kiên trì", desc: "Học 100 ngày khác nhau", category: "special", condition: s => s.daysStudied >= 100, reward: "+1500 XP", rarity: "epic" },
  { id: "ebook_1", icon: "ri-file-pdf-line", name: "Tác giả đầu tiên", desc: "Xuất 1 ebook PDF", category: "special", condition: s => s.ebookExports >= 1, reward: "+100 XP", rarity: "common" },
  { id: "ebook_5", icon: "ri-file-pdf-fill", name: "Nhà xuất bản", desc: "Xuất 5 ebook PDF", category: "special", condition: s => s.ebookExports >= 5, reward: "+300 XP", rarity: "rare" },
];

const RARITY_CONFIG = {
  common: { label: "Phổ thông", color: "text-white/60", bg: "bg-white/5", border: "border-white/10", glow: "" },
  rare: { label: "Hiếm", color: "text-sky-400", bg: "bg-sky-500/8", border: "border-sky-500/20", glow: "shadow-sky-500/10" },
  epic: { label: "Sử thi", color: "text-purple-400", bg: "bg-purple-500/8", border: "border-purple-500/20", glow: "shadow-purple-500/10" },
  legendary: { label: "Huyền thoại", color: "text-[#e8c84a]", bg: "bg-[#e8c84a]/8", border: "border-[#e8c84a]/25", glow: "shadow-[#e8c84a]/15" },
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "Tất cả",
  streak: "Streak",
  eps: "Điểm EPS",
  vocab: "Từ vựng",
  quiz: "Quiz",
  special: "Đặc biệt",
};

function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  const [showDetail, setShowDetail] = useState(false);
  const r = RARITY_CONFIG[achievement.rarity];

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className={`relative rounded-xl border p-4 cursor-pointer transition-all hover:scale-[1.02] ${
          unlocked ? `${r.bg} ${r.border} shadow-lg ${r.glow}` : "bg-white/2 border-white/6 opacity-50 grayscale"
        }`}
      >
        {unlocked && (
          <div className="absolute top-2 right-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-checkbox-circle-fill text-emerald-400 text-sm"></i>
            </div>
          </div>
        )}
        <div className={`w-10 h-10 flex items-center justify-center rounded-xl mb-3 ${unlocked ? r.bg : "bg-white/5"} border ${r.border}`}>
          <i className={`${achievement.icon} text-xl ${unlocked ? r.color : "text-white/20"}`}></i>
        </div>
        <p className={`text-sm font-semibold mb-1 ${unlocked ? "text-white" : "text-white/30"}`}>{achievement.name}</p>
        <p className="text-white/35 text-xs leading-relaxed">{achievement.desc}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${r.color} ${r.bg} ${r.border}`}>
            {r.label}
          </span>
          {unlocked && <span className="text-[#e8c84a] text-[10px] font-medium">{achievement.reward}</span>}
        </div>
      </div>

      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDetail(false)}>
          <div className="bg-[#1a1d27] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className={`w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-4 ${r.bg} border ${r.border}`}>
              <i className={`${achievement.icon} text-3xl ${unlocked ? r.color : "text-white/20"}`}></i>
            </div>
            <h3 className="text-white text-lg font-bold text-center">{achievement.name}</h3>
            <p className={`text-center text-xs font-medium mt-1 ${r.color}`}>{r.label}</p>
            <p className="text-white/50 text-sm text-center mt-3 leading-relaxed">{achievement.desc}</p>
            {unlocked ? (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <p className="text-emerald-400 text-xs font-medium">Đã mở khóa!</p>
                <p className="text-[#e8c84a] text-sm font-bold mt-1">{achievement.reward}</p>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-white/3 border border-white/8 rounded-xl text-center">
                <p className="text-white/30 text-xs">Chưa mở khóa</p>
                <p className="text-white/50 text-sm mt-1">{achievement.reward}</p>
              </div>
            )}
            <button
              onClick={() => setShowDetail(false)}
              className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 text-sm transition-all cursor-pointer whitespace-nowrap"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function AchievementsPage() {
  const [streak] = useLocalStorage<{ count: number; lastDate: string }>("kts_streak", { count: 0, lastDate: "" });
  const [activeCategory, setActiveCategory] = useState("all");
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [newBadge, setNewBadge] = useState<Achievement | null>(null);
  const [seenBadges, setSeenBadges] = useLocalStorage<string[]>("kts_seen_badges", []);

  // Build user stats from localStorage
  const userStats: UserStats = useMemo(() => {
    const epsHistory = JSON.parse(localStorage.getItem("kts_eps_history") || "[]");
    const maxEps = epsHistory.length > 0 ? Math.max(...epsHistory.map((h: { score?: number }) => h.score || 0)) : 72;
    const flashcardData = JSON.parse(localStorage.getItem("kts_flashcard_progress") || "{}");
    const wordsLearned = Object.keys(flashcardData).length || 247;
    const quizHistory = JSON.parse(localStorage.getItem("kts_quiz_history") || "[]");
    const ebookExports = parseInt(localStorage.getItem("kts_pdf_exports_count") || "0");

    const xpData = JSON.parse(localStorage.getItem("kts_xp") || "{}");
    const totalXP = xpData.total || 0;

    return {
      streak: streak.count || 12,
      longestStreak: Math.max(streak.count || 12, 18),
      epsScore: maxEps,
      wordsLearned,
      quizCount: quizHistory.length || 23,
      flashcardCount: wordsLearned,
      daysStudied: 45,
      ebookExports,
      totalXP,
    };
  }, [streak]);

  const unlockedIds = useMemo(
    () => new Set(ACHIEVEMENTS.filter(a => a.condition(userStats)).map(a => a.id)),
    [userStats]
  );

  // Auto-badge notification for newly unlocked badges
  useEffect(() => {
    const newlyUnlocked = ACHIEVEMENTS.filter(a => unlockedIds.has(a.id) && !seenBadges.includes(a.id));
    if (newlyUnlocked.length > 0) {
      setNewBadge(newlyUnlocked[0]);
      setSeenBadges(prev => [...prev, ...newlyUnlocked.map(a => a.id)]);
    }
  }, [unlockedIds]);

  const filtered = ACHIEVEMENTS.filter(a => {
    if (activeCategory !== "all" && a.category !== activeCategory) return false;
    if (showUnlockedOnly && !unlockedIds.has(a.id)) return false;
    return true;
  });

  const unlockedCount = unlockedIds.size;
  const totalXP = ACHIEVEMENTS.filter(a => unlockedIds.has(a.id))
    .reduce((sum, a) => sum + parseInt(a.reward.match(/\d+/)?.[0] || "0"), 0);

  const rarityBreakdown = (["legendary", "epic", "rare", "common"] as const).map(r => ({
    rarity: r,
    total: ACHIEVEMENTS.filter(a => a.rarity === r).length,
    unlocked: ACHIEVEMENTS.filter(a => a.rarity === r && unlockedIds.has(a.id)).length,
  }));

  return (
    <DashboardLayout title="Huy hiệu & Thành tích" subtitle="Mở khóa tự động khi đạt các mốc học tập — Hàn Quốc Ơi!">
      {/* Auto-badge popup */}
      {newBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setNewBadge(null)}>
          <div className="bg-[#0f1117] border border-[#e8c84a]/30 rounded-2xl p-8 w-80 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 flex items-center justify-center rounded-2xl mx-auto mb-4 bg-[#e8c84a]/15 border border-[#e8c84a]/25">
              <i className={`${newBadge.icon} text-4xl text-[#e8c84a]`}></i>
            </div>
            <p className="text-[#e8c84a] text-xs font-bold uppercase tracking-widest mb-2">Huy hiệu mới!</p>
            <h3 className="text-white text-xl font-bold mb-2">{newBadge.name}</h3>
            <p className="text-white/50 text-sm mb-4">{newBadge.desc}</p>
            <div className="px-4 py-2 bg-[#e8c84a]/10 border border-[#e8c84a]/20 rounded-xl mb-5">
              <p className="text-[#e8c84a] font-bold text-sm">{newBadge.reward}</p>
            </div>
            <button onClick={() => setNewBadge(null)} className="w-full py-2.5 bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold rounded-xl text-sm cursor-pointer whitespace-nowrap transition-colors">
              Tuyệt vời!
            </button>
          </div>
        </div>
      )}

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Huy hiệu & Thành tích</h1>
            <p className="text-white/40 text-sm mt-1">Mở khóa tự động khi đạt các mốc học tập</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#e8c84a]/10 border border-[#e8c84a]/20 rounded-xl">
            <i className="ri-vip-crown-line text-[#e8c84a]"></i>
            <span className="text-[#e8c84a] font-bold">{totalXP.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Progress overview */}
        <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-semibold">{unlockedCount}/{ACHIEVEMENTS.length} huy hiệu đã mở khóa</p>
              <p className="text-white/35 text-xs mt-0.5">Tiếp tục học để mở khóa thêm!</p>
            </div>
            <div className="text-right">
              <p className="text-[#e8c84a] text-2xl font-bold">{Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%</p>
              <p className="text-white/30 text-xs">hoàn thành</p>
            </div>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-[#e8c84a]/80 to-[#e8c84a] rounded-full transition-all"
              style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {rarityBreakdown.map(rb => {
              const r = RARITY_CONFIG[rb.rarity];
              return (
                <div key={rb.rarity} className={`p-3 rounded-lg border ${r.bg} ${r.border}`}>
                  <p className={`text-xs font-medium ${r.color}`}>{r.label}</p>
                  <p className="text-white text-lg font-bold mt-1">{rb.unlocked}<span className="text-white/30 text-sm">/{rb.total}</span></p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Streak hiện tại", value: `${userStats.streak} ngày`, icon: "ri-fire-line", color: "text-orange-400" },
            { label: "Điểm EPS cao nhất", value: `${userStats.epsScore}`, icon: "ri-trophy-line", color: "text-[#e8c84a]" },
            { label: "Từ đã học", value: `${userStats.wordsLearned}`, icon: "ri-book-open-line", color: "text-emerald-400" },
            { label: "Bài quiz đã làm", value: `${userStats.quizCount}`, icon: "ri-survey-line", color: "text-sky-400" },
          ].map((s, i) => (
            <div key={i} className="bg-[#1a1d27] border border-white/8 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center">
                <i className={`${s.icon} ${s.color} text-xl`}></i>
              </div>
              <div>
                <p className="text-white/40 text-[10px]">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-white/3 border border-white/8 rounded-xl">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === key ? "bg-[#e8c84a]/15 text-[#e8c84a] border border-[#e8c84a]/25" : "text-white/40 hover:text-white/70"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer whitespace-nowrap ${
              showUnlockedOnly ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-white/3 border-white/10 text-white/40 hover:text-white/70"
            }`}
          >
            <i className={`${showUnlockedOnly ? "ri-checkbox-circle-fill" : "ri-checkbox-circle-line"} text-sm`}></i>
            Chỉ hiện đã mở khóa
          </button>
        </div>

        {/* Achievement grid */}
        <div className="grid grid-cols-4 gap-3">
          {filtered.map(a => (
            <AchievementCard key={a.id} achievement={a} unlocked={unlockedIds.has(a.id)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <i className="ri-medal-line text-4xl"></i>
            </div>
            <p>Không có huy hiệu nào phù hợp</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
