import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface StreakData {
  count: number;
  lastDate: string;
  history: string[];
}

export default function StreakWidget() {
  const navigate = useNavigate();
  const [streak, setStreak] = useLocalStorage<StreakData>("kts_streak", {
    count: 0,
    lastDate: "",
    history: [],
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (streak.lastDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1;
    const newHistory = [...(streak.history || []).slice(-29), today];
    setStreak({ count: newCount, lastDate: today, history: newHistory });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const last7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("vi-VN", { weekday: "short" });
      const active = (streak.history || []).includes(dateStr);
      days.push({ dateStr, label, active });
    }
    return days;
  }, [streak.history]);

  const milestones = [3, 7, 14, 30, 60, 100];
  const nextMilestone = milestones.find((m) => m > streak.count) || 100;
  const prevMilestone = milestones.filter((m) => m <= streak.count).pop() || 0;
  const milestoneProgress =
    nextMilestone > prevMilestone
      ? Math.min(100, ((streak.count - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
      : 100;

  const streakColor =
    streak.count >= 30
      ? "#f87171"
      : streak.count >= 14
      ? "#fb923c"
      : streak.count >= 7
      ? "app-accent-primary"
      : "#fb923c";

  return (
    <div className="bg-gradient-to-br from-[#1a1200] to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 flex items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${streakColor}20` }}
          >
            <i className="ri-fire-fill text-2xl" style={{ color: streakColor }} />
          </div>
          <div>
            <p className="text-app-text-secondary text-xs font-medium tracking-normal">
              Streak h?c t?p
            </p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-4xl font-bold" style={{ color: streakColor }}>
                {streak.count}
              </p>
              <p className="text-app-text-secondary text-sm">ngày liên ti?p</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate("/study-calendar")}
          className="text-app-text-muted hover:text-white/50 text-xs cursor-pointer whitespace-nowrap transition-colors"
        >
          Xem l?ch <i className="ri-arrow-right-line" />
        </button>
      </div>

      {/* 7-day grid */}
      <div className="flex items-center gap-1.5 mb-4">
        {last7.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full h-8 rounded-lg flex items-center justify-center transition-all"
              style={{
                backgroundColor: d.active ? `${streakColor}25` : "rgba(255,255,255,0.04)",
                border: `1px solid ${d.active ? `${streakColor}40` : "rgba(255,255,255,0.06)"}`,
              }}
            >
              {d.active && (
                <i className="ri-fire-fill text-xs" style={{ color: streakColor }} />
              )}
            </div>
            <p className="text-app-text-muted text-[9px]">{d.label}</p>
          </div>
        ))}
      </div>

      {/* Milestone progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-app-text-muted text-[10px]">
            M?c tiêu ti?p theo:{" "}
            <span className="text-app-accent-primary">{nextMilestone} ngày</span>
          </p>
          <p className="text-app-text-muted text-[10px]">
            {streak.count}/{nextMilestone}
          </p>
        </div>
        <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${milestoneProgress}%`, backgroundColor: streakColor }}
          />
        </div>
      </div>

      {streak.count === 0 && (
        <p className="text-app-text-muted text-xs mt-3 text-center">
          H?c bài hôm nay d? b?t d?u streak!
        </p>
      )}
    </div>
  );
}
