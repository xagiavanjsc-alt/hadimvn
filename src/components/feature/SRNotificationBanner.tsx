import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface SRCard {
  id: string;
  word: string;
  meaning: string;
  nextReview: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

interface BannerDismiss {
  date: string;
  count: number;
}

export default function SRNotificationBanner() {
  const navigate = useNavigate();
  const [srCards] = useLocalStorage<SRCard[]>("kts_sr_cards", []);
  const [dismissed, setDismissed] = useLocalStorage<BannerDismiss>("kts_sr_banner_dismissed", { date: "", count: 0 });
  const [visible, setVisible] = useState(false);
  const [dueCards, setDueCards] = useState<SRCard[]>([]);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    // Don't show if dismissed today
    if (dismissed.date === today) return;

    const now = new Date();
    const due = srCards.filter(card => {
      if (!card.nextReview) return false;
      return new Date(card.nextReview) <= now;
    });

    if (due.length > 0) {
      setDueCards(due);
      // Show after 2s delay
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [srCards, dismissed.date]);

  const handleDismiss = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    setDismissed({ date: today, count: dueCards.length });
    setVisible(false);
  }, [dueCards.length, setDismissed]);

  const handleStudyNow = useCallback(() => {
    handleDismiss();
    navigate("/hanja-vocab");
  }, [handleDismiss, navigate]);

  if (!visible || dueCards.length === 0) return null;

  const urgencyColor = dueCards.length >= 20 ? "#f87171" : dueCards.length >= 10 ? "#fb923c" : "app-accent-primary";
  const urgencyLabel = dueCards.length >= 20 ? "Nhiều từ cần ôn!" : dueCards.length >= 10 ? "Cần ôn tập ngay" : "Có từ cần ôn";

  // Show minimized pill
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg cursor-pointer transition-all hover:scale-105 whitespace-nowrap"
        style={{ backgroundColor: urgencyColor, color: "#0f1117" }}
      >
        <i className="ri-brain-line text-sm font-bold"></i>
        <span className="text-xs font-bold">{dueCards.length} từ cần ôn</span>
        <div className="w-1.5 h-1.5 rounded-full bg-app-bg/40 animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-app-bg border rounded-2xl overflow-hidden shadow-2xl" style={{ borderColor: `${urgencyColor}30` }}>
        {/* Top accent */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${urgencyColor}, ${urgencyColor}40)` }} />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: `${urgencyColor}08` }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${urgencyColor}20` }}>
              <i className="ri-brain-line text-xs" style={{ color: urgencyColor }}></i>
            </div>
            <span className="text-sm font-bold" style={{ color: urgencyColor }}>{urgencyLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(true)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-app-text-muted hover:text-white/60 hover:bg-app-card/50 transition-colors cursor-pointer"
            >
              <i className="ri-subtract-line text-xs"></i>
            </button>
            <button
              onClick={handleDismiss}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-app-text-muted hover:text-white/60 hover:bg-app-card/50 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-xs"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Count display */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl flex-shrink-0" style={{ backgroundColor: `${urgencyColor}15`, border: `1px solid ${urgencyColor}25` }}>
              <span className="text-2xl font-black" style={{ color: urgencyColor }}>{dueCards.length}</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">từ Hán Hàn đến hạn ôn</p>
              <p className="text-app-text-secondary text-xs mt-0.5">Spaced Repetition nhắc bạn ôn hôm nay</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: urgencyColor }}></div>
                <span className="text-[10px] font-medium" style={{ color: urgencyColor }}>
                  {dueCards.length >= 20 ? "Ôn ngay để không quên!" : dueCards.length >= 10 ? "Nên ôn trong hôm nay" : "Ôn nhanh 5-10 phút"}
                </span>
              </div>
            </div>
          </div>

          {/* Preview words */}
          <div className="space-y-1.5 mb-4">
            {dueCards.slice(0, 3).map((card, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-app-surface/50 rounded-lg">
                <span className="text-white/70 text-sm font-bold">{card.word}</span>
                <span className="text-app-text-muted text-xs">—</span>
                <span className="text-white/50 text-xs truncate flex-1">{card.meaning}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-app-card/50 text-app-text-muted flex-shrink-0">
                  {card.repetitions === 0 ? "Mới" : `×${card.repetitions}`}
                </span>
              </div>
            ))}
            {dueCards.length > 3 && (
              <p className="text-app-text-muted text-[10px] text-center">+{dueCards.length - 3} từ khác...</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleStudyNow}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap text-app-bg hover:opacity-90"
              style={{ backgroundColor: urgencyColor }}
            >
              <i className="ri-play-fill"></i>
              Ôn ngay
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 rounded-xl bg-app-card/50 border border-app-border text-app-text-secondary text-sm hover:bg-white/8 transition-colors cursor-pointer whitespace-nowrap"
            >
              Để sau
            </button>
          </div>

          <p className="text-app-text-muted text-[10px] text-center mt-2">Sẽ không nhắc lại hôm nay sau khi đóng</p>
        </div>
      </div>
    </div>
  );
}
