import { useAchievements, Achievement } from "@/hooks/useAchievements";

interface AchievementsProps {
  showAll?: boolean;
  limit?: number;
}

export function Achievements({ showAll = false, limit = 6 }: AchievementsProps) {
  const {
    achievements,
    userAchievements,
    loading,
    getUnlockedAchievements,
    getLockedAchievements,
    getUnlockedCount,
    getTotalCount,
    getProgress,
  } = useAchievements();

  const unlocked = getUnlockedAchievements();
  const locked = getLockedAchievements();
  const displayAchievements = showAll ? [...unlocked, ...locked] : unlocked.slice(0, limit);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="p-4 rounded-2xl border border-app-border bg-app-card/30 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-app-card/50 mx-auto mb-2" />
            <div className="h-3 rounded bg-app-card/50 w-3/4 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/60">Tiến độ</span>
          <span className="text-app-accent-primary font-semibold">
            {getUnlockedCount()}/{getTotalCount()} ({Math.round(getProgress())}%)
          </span>
        </div>
        <div className="h-2 bg-app-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-app-accent-primary to-[#d4b43a] rounded-full transition-all duration-500"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {displayAchievements.map((achievement: Achievement) => {
          const isUnlocked = unlocked.some((ua) => ua.id === achievement.id);
          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-2xl border text-center transition-all ${
                isUnlocked
                  ? "border-app-accent-primary/30 bg-app-accent-primary/5"
                  : "border-app-border bg-app-card/30 opacity-50"
              }`}
              title={achievement.description}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                  isUnlocked ? "" : "grayscale"
                }`}
                style={{ backgroundColor: `${achievement.color}20` }}
              >
                <i className={`${achievement.icon} text-2xl`} style={{ color: achievement.color }} />
              </div>
              <p className="text-xs font-semibold text-white line-clamp-1">{achievement.name}</p>
              {achievement.xp_reward > 0 && (
                <p className="text-[10px] text-app-text-muted mt-0.5">+{achievement.xp_reward} XP</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Show More Button */}
      {!showAll && locked.length > 0 && (
        <button className="mt-4 text-app-accent-primary text-sm hover:text-[#d4b43a] transition-colors">
          Xem tất cả ({getTotalCount()} achievements)
        </button>
      )}
    </div>
  );
}

export function AchievementBadge({ achievement, size = "md" }: { achievement: Achievement; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-2xl",
    lg: "w-16 h-16 text-3xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl flex items-center justify-center`}
      style={{ backgroundColor: `${achievement.color}20` }}
      title={achievement.name}
    >
      <i className={achievement.icon} style={{ color: achievement.color }} />
    </div>
  );
}
