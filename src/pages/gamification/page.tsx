import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useGamification } from "@/hooks/useGamification";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

export default function GamificationPage() {
  const {
    xp,
    streak,
    achievements,
    leaderboard,
    addXP,
    getLevel,
    getXPForNextLevel,
    getXPProgress,
    updateLeaderboard,
    resetGamification,
  } = useGamification();

  const [userName, setUserName] = useState("Người dùng");

  const level = getLevel();
  const xpProgress = getXPProgress();
  const xpForNextLevel = getXPForNextLevel();

  usePageSEO({
    title: "Huy hiệu & Thành tích | Hàn Quốc Ơi!",
    description: "Theo dõi tiến độ học tập với hệ thống XP, streak, và thành tích. Cạnh tranh với người học khác trên bảng xếp hạng.",
    keywords: "huy hiệu, thành tích, XP, streak, bảng xếp hạng, gamification",
    path: "/gamification",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Game",
      name: "Hệ thống thành tích học tập tiếng Hàn",
      description: "Gamification system for Korean learning",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const handleAddXP = (amount: number) => {
    addXP(amount);
    updateLeaderboard(userName);
  };

  const unlockedAchievements = Object.values(achievements).filter(a => a.unlocked);
  const lockedAchievements = Object.values(achievements).filter(a => !a.unlocked);

  return (
    <DashboardLayout title="Huy hiệu & Thành tích" subtitle="Theo dõi tiến độ học tập của bạn">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Level & XP Card */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-app-accent-primary/10">
                <i className="ri-medal-line text-app-accent-primary text-3xl" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">Level {level}</p>
                <p className="text-app-text-muted text-sm">{xp} XP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-app-text-muted text-xs">Streak hiện tại</p>
              <p className="text-app-accent-primary text-2xl font-bold">{streak} ngày 🔥</p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-app-text-muted text-xs">Tiến độ Level {level}</span>
              <span className="text-app-text-muted text-xs">{Math.round(xpProgress)}%</span>
            </div>
            <div className="bg-app-card/50 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${xpProgress}%`, backgroundColor: "#e8c84a" }}
              />
            </div>
            <p className="text-app-text-muted text-xs mt-2">
              Cần {xpForNextLevel - xp} XP để lên Level {level + 1}
            </p>
          </div>

          {/* Test XP Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleAddXP(10)}
              className="px-4 py-2 rounded-xl bg-app-surface/50 border border-app-border text-xs cursor-pointer hover:bg-app-card/70 transition-colors"
            >
              +10 XP
            </button>
            <button
              onClick={() => handleAddXP(50)}
              className="px-4 py-2 rounded-xl bg-app-surface/50 border border-app-border text-xs cursor-pointer hover:bg-app-card/70 transition-colors"
            >
              +50 XP
            </button>
            <button
              onClick={() => handleAddXP(100)}
              className="px-4 py-2 rounded-xl bg-app-surface/50 border border-app-border text-xs cursor-pointer hover:bg-app-card/70 transition-colors"
            >
              +100 XP
            </button>
            <button
              onClick={resetGamification}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs cursor-pointer hover:bg-red-500/20 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-6">
          <h3 className="text-white text-lg font-bold mb-4">Thành tích</h3>
          
          {unlockedAchievements.length === 0 && lockedAchievements.length === 0 ? (
            <p className="text-app-text-muted text-sm text-center py-8">
              Chưa có thành tích nào. Học thêm để mở khóa!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlockedAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className="bg-app-accent-primary/5 border border-app-accent-primary/20 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-app-accent-primary/10">
                      <i className={`${achievement.icon} text-app-accent-primary text-xl`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{achievement.title}</p>
                      <p className="text-app-text-muted text-xs">{achievement.description}</p>
                      {achievement.unlockedAt && (
                        <p className="text-app-text-faint text-[10px] mt-1">
                          Mở khóa {new Date(achievement.unlockedAt).toLocaleDateString("vi-VN")}
                        </p>
                      )}
                    </div>
                    <i className="ri-checkbox-circle-fill text-app-accent-primary text-xl" />
                  </div>
                </div>
              ))}

              {lockedAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className="bg-app-surface/30 border border-app-border rounded-xl p-4 opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-app-card/50">
                      <i className={`${achievement.icon} text-app-text-muted text-xl`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-app-text-muted font-semibold text-sm">{achievement.title}</p>
                      <p className="text-app-text-faint text-xs">{achievement.description}</p>
                    </div>
                    <i className="ri-lock-line text-app-text-muted text-xl" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-6">
          <h3 className="text-white text-lg font-bold mb-4">Bảng xếp hạng</h3>
          
          {leaderboard.length === 0 ? (
            <p className="text-app-text-muted text-sm text-center py-8">
              Chưa có dữ liệu bảng xếp hạng.
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl ${
                    index === 0 ? "bg-app-accent-primary/10 border border-app-accent-primary/20" : "bg-app-surface/30 border border-app-border"
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm">
                    {index === 0 ? (
                      <span className="text-app-accent-primary">🥇</span>
                    ) : index === 1 ? (
                      <span className="text-gray-300">🥈</span>
                    ) : index === 2 ? (
                      <span className="text-orange-400">🥉</span>
                    ) : (
                      <span className="text-app-text-muted">#{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{entry.name}</p>
                    <p className="text-app-text-muted text-xs">{entry.streak} ngày streak</p>
                  </div>
                  <div className="text-right">
                    <p className="text-app-accent-primary font-bold">{entry.xp} XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Update Name Input */}
          <div className="mt-4 pt-4 border-t border-app-border">
            <label className="text-app-text-muted text-xs mb-2 block">Cập nhật tên của bạn</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="Nhập tên của bạn"
                className="flex-1 px-4 py-2 rounded-xl bg-app-surface/50 border border-app-border text-sm outline-none focus:border-app-accent-primary/50"
              />
              <button
                onClick={() => updateLeaderboard(userName)}
                className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
