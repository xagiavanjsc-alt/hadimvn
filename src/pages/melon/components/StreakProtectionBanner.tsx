import { MelonStreak, getHoursUntilMidnight } from "@/hooks/useMelonStreak";

interface StreakProtectionBannerProps {
  streak: MelonStreak;
  learnedToday: boolean;
  onDismiss: () => void;
}

export default function StreakProtectionBanner({
  streak,
  learnedToday,
  onDismiss,
}: StreakProtectionBannerProps) {
  const hoursLeft = getHoursUntilMidnight();
  const shouldShow = streak.count > 0 && !learnedToday && hoursLeft < 13;

  if (!shouldShow) return null;

  const urgent = hoursLeft < 3;
  const mins = Math.floor((hoursLeft % 1) * 60);
  const hrs = Math.floor(hoursLeft);
  const timeLabel = hrs > 0 ? `${hrs}g ${mins}p` : `${mins} phút`;

  return (
    <div
      className={`mb-4 rounded-2xl border px-4 py-3 flex items-start gap-3 relative ${
        urgent
          ? "bg-gradient-to-r from-red-500/15 to-red-500/5 border-red-500/30 animate-pulse"
          : "bg-gradient-to-r from-orange-500/12 to-[#e8c84a]/8 border-orange-500/25"
      }`}
    >
      <div
        className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl ${
          urgent ? "bg-red-500/20" : "bg-orange-500/15"
        }`}
      >
        <i
          className={`ri-shield-flash-line text-lg ${
            urgent ? "text-red-400" : "text-orange-400"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm ${urgent ? "text-red-300" : "text-orange-300"}`}>
          {urgent
            ? `Còn ${timeLabel} — Streak sắp mất!`
            : `Streak ${streak.count} ngày đang bị đe dọa!`}
        </p>
        <p className="text-white/50 text-xs mt-0.5 leading-relaxed">
          {urgent
            ? `Chỉ còn ${timeLabel} trước nửa đêm. Học ít nhất 1 bài ngay để bảo vệ streak ${streak.count} ngày của bạn!`
            : `Bạn chưa học bài Melon nào hôm nay. Còn ${timeLabel} — hãy học ít nhất 1 bài để duy trì streak!`}
        </p>
        <p className="text-white/25 text-[10px] mt-1">
          Nhấn AI ✨ vào bất kỳ bài hát nào để tính là đã học
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-white/25 hover:text-white/60 cursor-pointer transition-colors"
      >
        <i className="ri-close-line text-sm" />
      </button>
    </div>
  );
}
