import { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useStreakGuard } from "@/hooks/useStreakGuard";

// This component doesn't take props, but wrap with memo for performance
const StreakGuardBanner = memo(function StreakGuardBanner() {
  const navigate = useNavigate();
  const { status } = useStreakGuard();
  const [dismissed, setDismissed] = useState(false);

  // Show reset notification
  if (status.wasReset && !dismissed) {
    return (
      <div className="fixed top-4 right-4 z-50 w-80 bg-[#1a0a00] border border-[#fb923c]/30 rounded-2xl p-4 animate-in slide-in-from-right">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#fb923c]/15 flex-shrink-0">
            <i className="ri-fire-line text-[#fb923c] text-lg"></i>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm mb-0.5">Streak đã bị reset!</p>
            <p className="text-white/50 text-xs leading-relaxed">
              Bạn đã bỏ lỡ ngày hôm qua. Streak về 0 rồi — bắt đầu lại từ hôm nay nhé!
            </p>
            <button
              onClick={() => { navigate("/daily-plan"); setDismissed(true); }}
              className="mt-2 flex items-center gap-1.5 text-[#fb923c] text-xs font-semibold cursor-pointer whitespace-nowrap hover:text-[#fb923c]/80"
            >
              <i className="ri-route-line"></i>
              Học ngay để bắt đầu streak mới
            </button>
          </div>
          <button onClick={() => setDismissed(true)} className="text-app-text-muted hover:text-white/50 cursor-pointer flex-shrink-0">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      </div>
    );
  }

  // Show at-risk warning (less than 3 hours left, has streak, not studied today)
  if (status.isAtRisk && !dismissed && status.count > 0) {
    return (
      <div className="fixed top-4 right-4 z-50 w-80 bg-[#1a0800] border border-red-500/30 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/15 flex-shrink-0 animate-pulse">
            <i className="ri-fire-line text-red-400 text-lg"></i>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm mb-0.5">
              Streak {status.count} ngày sắp mất!
            </p>
            <p className="text-white/50 text-xs leading-relaxed">
              Còn <span className="text-red-400 font-bold">{status.hoursLeft}h {status.minutesLeft}p</span> trước nửa đêm. Học ngay để giữ streak!
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => { navigate("/daily-plan"); setDismissed(true); }}
                className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-play-line"></i>
                Học ngay
              </button>
              <button
                onClick={() => { navigate("/eps"); setDismissed(true); }}
                className="flex items-center gap-1.5 bg-app-card/50 hover:bg-app-card/70 text-white/50 text-xs px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-file-list-3-line"></i>
                Luyện EPS
              </button>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="text-app-text-muted hover:text-white/50 cursor-pointer flex-shrink-0">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      </div>
    );
  }

  return null;
});

export default StreakGuardBanner;
