import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface StreakData {
  count: number;
  lastDate: string;
}

interface LastStudyData {
  timestamp: number;
}

const STREAK_KEY = "kts_streak";
const LAST_STUDY_KEY = "kts_last_study_time";
const REMINDER_DISMISSED_KEY = "kts_reminder_dismissed_at";
const HOURS_THRESHOLD = 20;

function getHoursSinceLastStudy(lastStudyTs: number): number {
  return (Date.now() - lastStudyTs) / (1000 * 60 * 60);
}

function getHoursSinceDismissed(dismissedAt: number): number {
  return (Date.now() - dismissedAt) / (1000 * 60 * 60);
}

export function useStudyTimeTracker() {
  useEffect(() => {
    // Update last study time whenever user visits a study page
    const studyPaths = ["/seoul-practice", "/eps-lessons", "/eps-wrong-topic", "/eps-topic-stats"];
    const currentPath = window.location.pathname;
    const isStudyPage = studyPaths.some(p => currentPath.startsWith(p));
    if (isStudyPage) {
      const data: LastStudyData = { timestamp: Date.now() };
      localStorage.setItem(LAST_STUDY_KEY, JSON.stringify(data));
    }
  }, []);
}

export default function StreakReminderModal() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [hoursSince, setHoursSince] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkShouldShow();
    }, 3000); // Show after 3s delay
    return () => clearTimeout(timer);
  }, []);

  const checkShouldShow = () => {
    // Check if dismissed recently (within 6 hours)
    const dismissedRaw = localStorage.getItem(REMINDER_DISMISSED_KEY);
    if (dismissedRaw) {
      const dismissedAt = JSON.parse(dismissedRaw) as number;
      if (getHoursSinceDismissed(dismissedAt) < 6) return;
    }

    // Check last study time
    const lastStudyRaw = localStorage.getItem(LAST_STUDY_KEY);
    if (!lastStudyRaw) {
      // Never studied — don't show reminder yet
      return;
    }

    const lastStudy = JSON.parse(lastStudyRaw) as LastStudyData;
    const hours = getHoursSinceLastStudy(lastStudy.timestamp);

    if (hours >= HOURS_THRESHOLD) {
      // Get streak count
      const streakRaw = localStorage.getItem(STREAK_KEY);
      const streak: StreakData = streakRaw ? JSON.parse(streakRaw) : { count: 0, lastDate: "" };
      setStreakCount(streak.count);
      setHoursSince(Math.floor(hours));
      setVisible(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(REMINDER_DISMISSED_KEY, JSON.stringify(Date.now()));
    setVisible(false);
  };

  const handleStudyNow = () => {
    localStorage.setItem(REMINDER_DISMISSED_KEY, JSON.stringify(Date.now()));
    setVisible(false);
    navigate("/seoul-practice");
  };

  if (!visible) return null;

  const streakColor = streakCount >= 30 ? "#ef4444" : streakCount >= 7 ? "#fb923c" : "#e8c84a";
  const urgencyMsg = hoursSince >= 48
    ? "Bạn đã không học hơn 2 ngày rồi!"
    : hoursSince >= 24
    ? "Bạn đã không học hơn 1 ngày rồi!"
    : `Bạn chưa học trong ${hoursSince} giờ qua`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="relative w-full max-w-sm bg-[#0f1117] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${streakColor}, ${streakColor}80)` }} />

        {/* Close button */}
        <button onClick={handleDismiss} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors cursor-pointer">
          <i className="ri-close-line text-lg"></i>
        </button>

        <div className="p-6">
          {/* Fire icon + streak */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-3">
              <div className="w-20 h-20 flex items-center justify-center rounded-full" style={{ backgroundColor: `${streakColor}15`, border: `2px solid ${streakColor}30` }}>
                <span className="text-4xl">🔥</span>
              </div>
              {streakCount > 0 && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold text-[#0f1117]" style={{ backgroundColor: streakColor }}>
                  {streakCount}
                </div>
              )}
            </div>
            <h2 className="text-white text-xl font-bold text-center">Đừng để streak tắt!</h2>
            {streakCount > 0 && (
              <p className="text-sm mt-1 font-semibold" style={{ color: streakColor }}>
                Streak hiện tại: {streakCount} ngày liên tiếp
              </p>
            )}
          </div>

          {/* Message */}
          <div className="bg-white/3 border border-white/8 rounded-xl p-4 mb-5 text-center">
            <p className="text-white/70 text-sm mb-1">{urgencyMsg}</p>
            {streakCount > 0 ? (
              <p className="text-white/50 text-xs">
                Học ít nhất <span className="text-white font-semibold">1 bài</span> hôm nay để giữ streak {streakCount} ngày của bạn!
              </p>
            ) : (
              <p className="text-white/50 text-xs">
                Hãy bắt đầu học ngay để xây dựng streak của bạn!
              </p>
            )}
          </div>

          {/* Motivational tip */}
          <div className="flex items-start gap-3 mb-5 p-3 rounded-xl" style={{ backgroundColor: `${streakColor}08`, border: `1px solid ${streakColor}20` }}>
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-lightbulb-line text-sm" style={{ color: streakColor }}></i>
            </div>
            <p className="text-white/50 text-xs leading-relaxed">
              Chỉ cần <strong className="text-white/70">5-10 phút</strong> mỗi ngày là đủ để duy trì thói quen học tiếng Hàn. Nhất quán quan trọng hơn học nhiều một lúc!
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={handleDismiss} className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap">
              Để sau
            </button>
            <button onClick={handleStudyNow} className="flex-1 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap text-[#0f1117] hover:opacity-90" style={{ backgroundColor: streakColor }}>
              <i className="ri-play-fill mr-1"></i>Học ngay!
            </button>
          </div>

          <p className="text-white/20 text-[10px] text-center mt-3">Thông báo sẽ không hiện lại trong 6 giờ</p>
        </div>
      </div>
    </div>
  );
}
