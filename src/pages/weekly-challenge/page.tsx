import { useState, useMemo, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  target: number;
  unit: string;
  xpReward: number;
  bonusXP?: number;
  bonusLabel?: string;
  category: "flashcard" | "exam" | "streak" | "community" | "vocab";
}

interface WeekProgress {
  weekKey: string;
  completed: string[];
  progress: Record<string, number>;
  claimedBonus: boolean;
}

function getWeekKey() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

function getDaysLeftInWeek() {
  const now = new Date();
  const day = now.getDay();
  return day === 0 ? 0 : 7 - day;
}

const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: "flash_50",
    title: "Flashcard Marathon",
    description: "Học 50 từ vựng qua flashcard trong tuần này",
    icon: "ri-stack-line",
    color: "app-accent-primary",
    target: 50,
    unit: "từ",
    xpReward: 100,
    bonusXP: 50,
    bonusLabel: "Hoàn thành trước thứ 5",
    category: "flashcard",
  },
  {
    id: "exam_3",
    title: "Chiến binh EPS",
    description: "Hoàn thành 3 bài thi thử EPS đầy đủ (40 câu)",
    icon: "ri-timer-line",
    color: "#34d399",
    target: 3,
    unit: "bài thi",
    xpReward: 150,
    bonusXP: 75,
    bonusLabel: "Đạt 80%+ cả 3 bài",
    category: "exam",
  },
  {
    id: "streak_7",
    title: "Không bỏ ngày nào",
    description: "Duy trì streak học tập 7 ngày liên tiếp trong tuần",
    icon: "ri-fire-line",
    color: "#fb923c",
    target: 7,
    unit: "ngày",
    xpReward: 200,
    bonusXP: 100,
    bonusLabel: "Streak không bị gián đoạn",
    category: "streak",
  },
  {
    id: "drill_5",
    title: "Luyện chủ đề EPS",
    description: "Hoàn thành 5 buổi luyện thi theo chủ đề",
    icon: "ri-focus-3-line",
    color: "#06b6d4",
    target: 5,
    unit: "buổi",
    xpReward: 120,
    category: "exam",
  },
  {
    id: "community_3",
    title: "Chia sẻ kiến thức",
    description: "Đăng 3 bài chia sẻ kinh nghiệm trong cộng đồng",
    icon: "ri-group-line",
    color: "#f472b6",
    target: 3,
    unit: "bài đăng",
    xpReward: 90,
    bonusXP: 30,
    bonusLabel: "Nhận 10+ lượt thích",
    category: "community",
  },
  {
    id: "vocab_topic",
    title: "Từ vựng theo chủ đề",
    description: "Hoàn thành 2 chủ đề flashcard EPS (y tế, giao thông...)",
    icon: "ri-translate-2",
    color: "#a78bfa",
    target: 2,
    unit: "chủ đề",
    xpReward: 80,
    category: "vocab",
  },
  {
    id: "quiz_10",
    title: "Quiz Master",
    description: "Hoàn thành 10 câu quiz hàng ngày trong tuần",
    icon: "ri-survey-line",
    color: "#84cc16",
    target: 10,
    unit: "câu quiz",
    xpReward: 70,
    category: "flashcard",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  all: "Tất cả",
  flashcard: "Flashcard",
  exam: "Thi EPS",
  streak: "Streak",
  community: "Cộng đồng",
  vocab: "Từ vựng",
};

function ChallengeCard({
  challenge,
  progress,
  completed,
  onAddProgress,
  onClaim,
}: {
  challenge: Challenge;
  progress: number;
  completed: boolean;
  onAddProgress: (id: string, amount: number) => void;
  onClaim: (id: string) => void;
}) {
  const pct = Math.min(100, Math.round((progress / challenge.target) * 100));
  const [inputVal, setInputVal] = useState("");

  return (
    <div className={`bg-app-bg border rounded-2xl p-5 transition-all ${completed ? "border-emerald-500/25" : "border-app-border hover:border-app-border"}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${challenge.color}15` }}>
          <i className={`${challenge.icon} text-xl`} style={{ color: challenge.color }}></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-semibold text-sm">{challenge.title}</p>
            {completed && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-app-accent-success/15 text-app-accent-success">
                <i className="ri-checkbox-circle-fill"></i>Hoàn thành
              </span>
            )}
          </div>
          <p className="text-app-text-secondary text-xs mt-0.5 leading-relaxed">{challenge.description}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-app-text-secondary text-xs">{progress}/{challenge.target} {challenge.unit}</span>
          <span className="text-xs font-bold" style={{ color: completed ? "#34d399" : challenge.color }}>{pct}%</span>
        </div>
        <div className="h-2 bg-app-card/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: completed ? "#34d399" : challenge.color }}
          ></div>
        </div>
      </div>

      {/* Rewards */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: `${challenge.color}10`, color: challenge.color }}>
          <i className="ri-star-line"></i>+{challenge.xpReward} XP
        </span>
        {challenge.bonusXP && (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-app-card/50 text-app-text-secondary">
            <i className="ri-gift-line"></i>Bonus +{challenge.bonusXP} XP: {challenge.bonusLabel}
          </span>
        )}
      </div>

      {/* Action */}
      {completed ? (
        <button
          onClick={() => onClaim(challenge.id)}
          disabled
          title="Tính năng đang được nâng cấp - XP sẽ được cộng tự động từ hoạt động học thực tế"
          className="w-full py-2.5 rounded-xl bg-app-accent-success/15 border border-emerald-500/25 text-app-accent-success text-sm font-semibold cursor-not-allowed opacity-70 whitespace-nowrap transition-colors flex items-center justify-center gap-2"
        >
          <i className="ri-gift-2-line"></i>Nhận thưởng {challenge.xpReward} XP
        </button>
      ) : (
        <div className="bg-app-card/30 border border-app-border rounded-xl px-3 py-2.5 text-center">
          <p className="text-app-text-muted text-[11px]">
            <i className="ri-information-line mr-1"></i>
            Tiến độ tự động cập nhật khi bạn hoàn thành hoạt động học thực tế
          </p>
        </div>
      )}
    </div>
  );
}

export default function WeeklyChallengePage() {
  const weekKey = getWeekKey();
  const [weekProgress, setWeekProgress] = useLocalStorage<WeekProgress>("kts_weekly_challenge", {
    weekKey: "",
    completed: [],
    progress: {},
    claimedBonus: false,
  });
  const { awardXP } = useXPSystem();
  const [filter, setFilter] = useState("all");
  const [claimedIds, setClaimedIds] = useLocalStorage<string[]>("kts_weekly_claimed", []);
  const [showCelebration, setShowCelebration] = useState<{ title: string; xp: number } | null>(null);

  // Reset if new week
  const currentProgress = weekProgress.weekKey === weekKey ? weekProgress : {
    weekKey,
    completed: [],
    progress: {},
    claimedBonus: false,
  };

  const handleAddProgress = useCallback((id: string, amount: number) => {
    const challenge = WEEKLY_CHALLENGES.find(c => c.id === id);
    if (!challenge) return;
    setWeekProgress(prev => {
      const p = prev.weekKey === weekKey ? prev : { weekKey, completed: [], progress: {}, claimedBonus: false };
      const newProgress = Math.min(challenge.target, (p.progress[id] || 0) + amount);
      const isNowComplete = newProgress >= challenge.target;
      return {
        ...p,
        progress: { ...p.progress, [id]: newProgress },
        completed: isNowComplete && !p.completed.includes(id) ? [...p.completed, id] : p.completed,
      };
    });
  }, [weekKey, setWeekProgress]);

  const handleClaim = useCallback((id: string) => {
    if (claimedIds.includes(id)) return;
    const challenge = WEEKLY_CHALLENGES.find(c => c.id === id);
    if (!challenge) return;
    setClaimedIds(prev => [...prev, id]);
    awardXP({ type: "quiz_completed", amount: challenge.xpReward });
    setShowCelebration({ title: challenge.title, xp: challenge.xpReward });
    setTimeout(() => setShowCelebration(null), 3000);
  }, [claimedIds, setClaimedIds, awardXP]);

  const filteredChallenges = useMemo(() =>
    filter === "all" ? WEEKLY_CHALLENGES : WEEKLY_CHALLENGES.filter(c => c.category === filter),
    [filter]
  );

  const completedCount = currentProgress.completed.length;
  const totalXPAvailable = WEEKLY_CHALLENGES.reduce((s, c) => s + c.xpReward, 0);
  const earnedXP = WEEKLY_CHALLENGES.filter(c => claimedIds.includes(c.id)).reduce((s, c) => s + c.xpReward, 0);
  const allDone = completedCount === WEEKLY_CHALLENGES.length;
  const daysLeft = getDaysLeftInWeek();

  return (
    <DashboardLayout
      title="Thử thách hàng tuần"
      subtitle={`Tuần ${getWeekDates()} · Còn ${daysLeft} ngày`}
    >
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-app-bg border border-emerald-500/30 rounded-2xl px-8 py-6 text-center animate-bounce shadow-2xl">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-app-accent-success/15 mx-auto mb-3">
              <i className="ri-trophy-fill text-app-accent-success text-3xl"></i>
            </div>
            <p className="text-white font-bold text-lg">Thử thách hoàn thành!</p>
            <p className="text-white/50 text-sm mt-1">{showCelebration.title}</p>
            <p className="text-app-accent-success font-bold text-2xl mt-2">+{showCelebration.xp} XP</p>
          </div>
        </div>
      )}

      {/* Weekly summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Thử thách hoàn thành", value: `${completedCount}/${WEEKLY_CHALLENGES.length}`, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "XP đã nhận tuần này", value: `${earnedXP}`, icon: "ri-star-line", color: "app-accent-primary" },
          { label: "XP có thể nhận", value: `${totalXPAvailable}`, icon: "ri-gift-line", color: "#a78bfa" },
          { label: "Ngày còn lại", value: daysLeft, icon: "ri-time-line", color: "#fb923c" },
        ].map(s => (
          <div key={s.label} className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
              </div>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
            </div>
            <p className="text-white font-bold text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      {/* All-complete bonus */}
      {allDone && !currentProgress.claimedBonus && (
        <div className="mb-6 p-5 bg-gradient-to-r from-[app-accent-primary]/10 to-[#fb923c]/10 border border-app-accent-primary/25 rounded-2xl flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-app-accent-primary/15 flex-shrink-0">
            <i className="ri-vip-crown-fill text-app-accent-primary text-3xl"></i>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-base">Hoàn thành tất cả thử thách!</p>
            <p className="text-white/50 text-sm mt-0.5">Bạn đã chinh phục toàn bộ thử thách tuần này. Nhận thưởng đặc biệt!</p>
          </div>
          <button
            onClick={() => {
              awardXP({ type: "streak_bonus_7", amount: 300 });
              setWeekProgress(prev => ({ ...prev, claimedBonus: true }));
              setShowCelebration({ title: "Hoàn thành tất cả thử thách!", xp: 300 });
              setTimeout(() => setShowCelebration(null), 3000);
            }}
            className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-5 py-3 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-gift-2-line"></i>Nhận +300 XP
          </button>
        </div>
      )}

      {/* Progress bar overall */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">Tiến độ tổng thể tuần này</h3>
          <span className="text-app-accent-primary font-bold text-sm">{Math.round((completedCount / WEEKLY_CHALLENGES.length) * 100)}%</span>
        </div>
        <div className="h-3 bg-app-card/50 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[app-accent-primary] to-[#fb923c]"
            style={{ width: `${(completedCount / WEEKLY_CHALLENGES.length) * 100}%` }}
          ></div>
        </div>
        <div className="flex items-center gap-4 mt-3">
          {WEEKLY_CHALLENGES.map(c => {
            const done = currentProgress.completed.includes(c.id);
            return (
              <div key={c.id} className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${done ? "" : "opacity-30"}`} style={{ backgroundColor: `${c.color}15` }}>
                  <i className={`${done ? "ri-checkbox-circle-fill" : c.icon} text-xs`} style={{ color: c.color }}></i>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${filter === key ? "bg-app-accent-primary/15 text-app-accent-primary border border-app-accent-primary/25" : "bg-app-surface/50 text-app-text-secondary border border-app-border hover:text-white/60"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Challenge grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredChallenges.map(challenge => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            progress={currentProgress.progress[challenge.id] || 0}
            completed={currentProgress.completed.includes(challenge.id)}
            onAddProgress={handleAddProgress}
            onClaim={handleClaim}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}

