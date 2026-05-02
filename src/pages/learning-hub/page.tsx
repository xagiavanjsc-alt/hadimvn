import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface ModuleProgress {
  module_id: string;
  lessons_completed: number;
  total_lessons: number;
  progress_percent: number;
  last_studied_at: string | null;
}

interface UserProgress {
  xp: number;
  level: string;
  streak_count: number;
  streak_last_date: string | null;
  total_study_time_seconds: number;
}

const MODULE_CONFIG = {
  eps: { name: "EPS-TOPIK", icon: "ri-file-list-3-line", color: "#4ade80", totalLessons: 60 },
  seoul: { name: "Seoul", icon: "ri-book-3-line", color: "#60a5fa", totalLessons: 40 },
  hanja: { name: "Hán Hàn", icon: "ri-character-recognition-line", color: "#e8c84a", totalLessons: 100 },
  melon: { name: "K-pop", icon: "ri-music-2-line", color: "#fb923c", totalLessons: 20 },
  topik: { name: "TOPIK", icon: "ri-survey-line", color: "#f472b6", totalLessons: 30 },
};

export default function LearningHubPage() {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);

      // Fetch user_progress
      const { data: userProg } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userProg) setUserProgress(userProg);

      // Fetch module_progress
      const { data: modProg } = await supabase
        .from("module_progress")
        .select("*")
        .eq("user_id", user.id);

      if (modProg) setModuleProgress(modProg);

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const getModuleProgress = (moduleId: string) => {
    return moduleProgress.find(m => m.module_id === moduleId) || {
      module_id: moduleId,
      lessons_completed: 0,
      total_lessons: MODULE_CONFIG[moduleId as keyof typeof MODULE_CONFIG]?.totalLessons || 0,
      progress_percent: 0,
      last_studied_at: null,
    };
  };

  const totalXP = userProgress?.xp || 0;
  const totalStreak = userProgress?.streak_count || 0;
  const overallProgress = moduleProgress.length > 0
    ? Math.round(moduleProgress.reduce((sum, m) => sum + m.progress_percent, 0) / moduleProgress.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Learning Hub</h1>
          <p className="text-white/60 text-sm">Tổng quan tiến độ học tập của bạn</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0f1117] border border-white/5 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#e8c84a]/10 rounded-xl">
                    <i className="ri-star-line text-[#e8c84a] text-lg"></i>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Tổng XP</p>
                    <p className="text-white font-bold text-xl">{totalXP.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#0f1117] border border-white/5 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-rose-500/10 rounded-xl">
                    <i className="ri-fire-line text-rose-400 text-lg"></i>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Streak</p>
                    <p className="text-white font-bold text-xl">{totalStreak} ngày</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#0f1117] border border-white/5 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-sky-500/10 rounded-xl">
                    <i className="ri-trophy-line text-sky-400 text-lg"></i>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Level</p>
                    <p className="text-white font-bold text-xl">{userProgress?.level || "beginner"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="bg-[#0f1117] border border-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Tiến độ tổng quát</h2>
                <span className="text-white/60 text-sm">{overallProgress}% hoàn thành</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%`, backgroundColor: "#e8c84a" }}
                ></div>
              </div>
            </div>

            {/* Module Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(MODULE_CONFIG).map(([moduleId, config]) => {
                const progress = getModuleProgress(moduleId);
                return (
                  <div key={moduleId} className="bg-[#0f1117] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.color}15` }}>
                        <i className={`${config.icon} text-xl`} style={{ color: config.color }}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm">{config.name}</h3>
                        <p className="text-white/40 text-xs">{progress.lessons_completed}/{config.totalLessons} bài</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/40 text-xs">Tiến độ</span>
                        <span className="text-white/60 text-xs">{progress.progress_percent}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress.progress_percent}%`, backgroundColor: config.color }}
                        ></div>
                      </div>
                    </div>

                    {progress.last_studied_at && (
                      <p className="text-white/30 text-[10px]">
                        Học gần nhất: {new Date(progress.last_studied_at).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Recommendations */}
            <div className="bg-[#0f1117] border border-white/5 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">Gợi ý học tiếp</h2>
              <div className="space-y-3">
                {moduleProgress
                  .filter(m => m.progress_percent < 100)
                  .sort((a, b) => (a.last_studied_at || "").localeCompare(b.last_studied_at || ""))
                  .slice(0, 3)
                  .map((mod) => {
                    const config = MODULE_CONFIG[mod.module_id as keyof typeof MODULE_CONFIG];
                    return (
                      <div key={mod.module_id} className="flex items-center gap-3 p-3 bg-white/3 rounded-lg">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${config.color}15` }}>
                          <i className={`${config.icon} text-sm`} style={{ color: config.color }}></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{config.name}</p>
                          <p className="text-white/40 text-xs">Hoàn thành {mod.progress_percent}%</p>
                        </div>
                        <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white text-xs transition-colors">
                          Tiếp tục
                        </button>
                      </div>
                    );
                  })}
                {moduleProgress.filter(m => m.progress_percent < 100).length === 0 && (
                  <p className="text-white/30 text-sm text-center py-4">Bạn đã hoàn thành tất cả modules! 🎉</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
