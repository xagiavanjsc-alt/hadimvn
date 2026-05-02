import { useEffect, useState } from "react";
import { useXPSystem, XPNotification } from "@/hooks/useXPSystem";
import { RANKS, BADGES } from "@/data/ranks";

function getRankById(id: string) {
  return RANKS.find((r) => r.id === id) || RANKS[0];
}

function getBadgeById(id: string) {
  return BADGES.find((b) => b.id === id);
}

// ─── Single Toast ─────────────────────────────────────────────────────────────
function Toast({
  notif,
  onDismiss,
}: {
  notif: XPNotification;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => handleDismiss(), 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(onDismiss, 400);
  };

  const isLevelUp = notif.type === "level_up";
  const isBadge = notif.type === "badge_earned";

  const rank = isLevelUp && notif.rankId ? getRankById(notif.rankId) : null;
  const badge = isBadge && notif.badgeId ? getBadgeById(notif.badgeId) : null;

  const accentColor = rank?.color || badge?.color || "app-accent-primary";
  const bgColor = rank?.bgColor || (badge ? `${badge.color}10` : "app-accent-primary10");
  const borderColor =
    rank?.borderColor || (badge ? `${badge.color}25` : "app-accent-primary25");
  const icon = rank?.icon || badge?.icon || "ri-star-fill";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border cursor-pointer select-none"
      style={{
        backgroundColor: "#0f1117",
        borderColor,
        boxShadow: `0 0 24px ${accentColor}20`,
        transform: visible && !leaving ? "translateX(0)" : "translateX(120%)",
        opacity: visible && !leaving ? 1 : 0,
        transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease",
        minWidth: 280,
        maxWidth: 340,
      }}
      onClick={handleDismiss}
    >
      {/* Glow bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />

      {/* Shimmer animation for level up */}
      {isLevelUp && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(105deg, transparent 40%, ${accentColor}08 50%, transparent 60%)`,
            animation: "shimmer 2s infinite",
          }}
        />
      )}

      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative"
          style={{ backgroundColor: bgColor, border: `1.5px solid ${borderColor}` }}
        >
          <i className={`${icon} text-xl`} style={{ color: accentColor }} />
          {isLevelUp && (
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accentColor }}
            >
              <i className="ri-arrow-up-line text-app-bg text-[9px] font-bold" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-white font-bold text-sm leading-tight">
              {notif.title}
            </span>
            {isLevelUp && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                Lên cấp!
              </span>
            )}
            {isBadge && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                Huy hiệu
              </span>
            )}
          </div>
          <p className="text-white/50 text-xs leading-relaxed">{notif.message}</p>
          {notif.xpAmount && (
            <div className="flex items-center gap-1 mt-1.5">
              <i className="ri-star-fill text-app-accent-primary text-[10px]" />
              <span className="text-app-accent-primary text-[10px] font-bold">
                +{notif.xpAmount} XP
              </span>
            </div>
          )}
        </div>

        {/* Close */}
        <button
          className="w-5 h-5 flex items-center justify-center rounded-md text-app-text-muted hover:text-white/50 flex-shrink-0 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
        >
          <i className="ri-close-line text-xs" />
        </button>
      </div>

      {/* Progress bar (auto-dismiss timer) */}
      <div className="h-0.5 bg-app-card/50">
        <div
          className="h-full"
          style={{
            backgroundColor: accentColor,
            animation: "shrink 5s linear forwards",
          }}
        />
      </div>
    </div>
  );
}

// ─── Toast Container ──────────────────────────────────────────────────────────
export default function XPNotificationToast() {
  const { notifications, dismissNotification } = useXPSystem();

  // Only show the 3 most recent
  const visible = notifications.slice(0, 3);

  if (visible.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
        style={{ pointerEvents: "none" }}
      >
        {visible.map((notif) => (
          <div key={notif.id} style={{ pointerEvents: "auto" }}>
            <Toast
              notif={notif}
              onDismiss={() => dismissNotification(notif.id)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
