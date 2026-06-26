import { useState, useRef, useCallback, useEffect, memo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { copyTextToClipboard, openExternalUrl } from "@/utils/browser";

interface ShareHistoryItem {
  id: string;
  type: string;
  title: string;
  text: string;
  sharedAt: string;
}

interface ShareResultCardProps {
  type: "quiz" | "streak" | "sr" | "topik";
  score?: number;
  total?: number;
  streakCount?: number;
  level?: string;
  quizType?: string;
  srCount?: number;
  displayName?: string;
  onClose: () => void;
}

function ShareResultCard({
  type,
  score = 0,
  total = 0,
  streakCount = 0,
  level = "1",
  quizType = "quiz",
  srCount = 0,
  displayName = "Học viên",
  onClose,
}: ShareResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [activeShare, setActiveShare] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [shareHistory, setShareHistory] = useLocalStorage<ShareHistoryItem[]>("kts_share_history", []);

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  // Generate share content based on type
  const getShareContent = useCallback(() => {
    const today = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    switch (type) {
      case "quiz":
        return {
          emoji: pct >= 90 ? "🏆" : pct >= 70 ? "⭐" : "💪",
          title: `${pct}% — ${score}/${total} câu đúng`,
          subtitle: `${quizType === "topik" ? "TOPIK" : quizType === "hanja" ? "Hán Hàn" : "Quiz từ vựng"} · Cấp ${level}`,
          text: `${pct >= 90 ? "🏆" : pct >= 70 ? "⭐" : "💪"} Mình vừa đạt ${pct}% (${score}/${total} câu) trong bài ${quizType === "topik" ? "TOPIK" : "Quiz Hán Hàn"} trên Hàn Quốc Ơi!\n\n📅 ${today}\n\nLuyện tiếng Hàn miễn phí: hanquocoi.app\n#HànQuốcƠi #HọcTiếngHàn #TOPIK`,
          color: pct >= 90 ? "#34d399" : pct >= 70 ? "#e8c84a" : "#fb923c",
          bg: pct >= 90 ? "from-emerald-900/40 to-[#0f1117]" : pct >= 70 ? "from-app-surface to-[#0f1117]" : "from-[#1a0a00] to-[#0f1117]",
        };
      case "streak":
        return {
          emoji: streakCount >= 30 ? "🔥🔥🔥" : streakCount >= 14 ? "🔥🔥" : "🔥",
          title: `${streakCount} ngày liên tiếp`,
          subtitle: "Streak học tiếng Hàn",
          text: `🔥 Mình đã học tiếng Hàn ${streakCount} ngày liên tiếp trên Hàn Quốc Ơi!\n\n📅 ${today}\n\nCùng học tiếng Hàn miễn phí: hanquocoi.app\n#HànQuốcƠi #HọcTiếngHàn #Streak${streakCount}Ngày`,
          color: streakCount >= 30 ? "#f87171" : streakCount >= 14 ? "#fb923c" : "#e8c84a",
          bg: "from-[#1a0800] to-[#0f1117]",
        };
      case "sr":
        return {
          emoji: "🧠",
          title: `Ôn ${srCount} từ Hán Hàn`,
          subtitle: "Spaced Repetition · Hôm nay",
          text: `🧠 Mình vừa ôn ${srCount} từ Hán Hàn bằng Spaced Repetition trên Hàn Quốc Ơi!\n\n📅 ${today}\n\nHọc Hán Hàn miễn phí: hanquocoi.app\n#HànQuốcƠi #HánHàn #SpacedRepetition`,
          color: "#a78bfa",
          bg: "from-[#0f0a1a] to-[#0f1117]",
        };
      default:
        return {
          emoji: "📚",
          title: "Học tiếng Hàn",
          subtitle: "Hàn Quốc Ơi!",
          text: `📚 Mình đang học tiếng Hàn trên Hàn Quốc Ơi!\n\nhanquocoi.app\n#HànQuốcƠi #HọcTiếngHàn`,
          color: "#e8c84a",
          bg: "from-app-surface to-[#0f1117]",
        };
    }
  }, [type, pct, score, total, quizType, level, streakCount, srCount]);

  const content = getShareContent();

  // Save to share history when component mounts
  useEffect(() => {
    const item: ShareHistoryItem = {
      id: Date.now().toString(),
      type,
      title: content.title,
      text: content.text,
      sharedAt: new Date().toISOString(),
    };
    setShareHistory(prev => [item, ...prev.slice(0, 19)]);
  }, []);

  const handleCopy = useCallback(async () => {
    const ok = await copyTextToClipboard(content.text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [content.text]);

  const handleShare = useCallback((platform: string) => {
    setActiveShare(platform);
    const url = "https://hanquocoi.app";
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(content.text)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.text)}`;
        break;
      case "zalo":
        shareUrl = `https://zalo.me/share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(content.text)}`;
        break;
    }
    if (shareUrl) openExternalUrl(shareUrl);
    setTimeout(() => setActiveShare(null), 1000);
  }, [content.text]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Kết quả học tiếng Hàn",
          text: content.text,
          url: "https://hanquocoi.app",
        });
      } catch {
        // user cancelled
      }
    }
  }, [content.text]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
        {/* Result Card Preview */}
        <div
          ref={cardRef}
          className={`bg-gradient-to-br ${content.bg} border rounded-2xl p-6 mb-4 relative overflow-hidden`}
          style={{ borderColor: `${content.color}25` }}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5" style={{ background: content.color, transform: "translate(30%, -30%)" }}></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5" style={{ background: content.color, transform: "translate(-30%, 30%)" }}></div>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
              <img loading="lazy" decoding="async" src="/images/brand/logo.svg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-white/60 text-xs font-semibold">Hàn Quốc Ơi!</span>
            <span className="ml-auto text-app-text-muted text-[10px]">{new Date().toLocaleDateString("vi-VN")}</span>
          </div>

          {/* Main content */}
          <div className="text-center mb-5">
            <div className="text-5xl mb-3">{content.emoji}</div>
            <h2 className="text-white font-black text-3xl mb-1" style={{ color: content.color }}>{content.title}</h2>
            <p className="text-white/50 text-sm">{content.subtitle}</p>
            {displayName && displayName !== "Học viên" && (
              <p className="text-app-text-muted text-xs mt-1">— {displayName}</p>
            )}
          </div>

          {/* Stats row */}
          {type === "quiz" && (
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-white font-bold text-xl">{score}</p>
                <p className="text-app-text-muted text-[10px]">Câu đúng</p>
              </div>
              <div className="w-px h-8 bg-app-card/70"></div>
              <div className="text-center">
                <p className="text-white font-bold text-xl">{total - score}</p>
                <p className="text-app-text-muted text-[10px]">Câu sai</p>
              </div>
              <div className="w-px h-8 bg-app-card/70"></div>
              <div className="text-center">
                <p className="font-bold text-xl" style={{ color: content.color }}>{pct}%</p>
                <p className="text-app-text-muted text-[10px]">Chính xác</p>
              </div>
            </div>
          )}
          {type === "streak" && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: Math.min(streakCount, 7) }, (_, i) => (
                <div key={i} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${content.color}20`, border: `1px solid ${content.color}30` }}>
                  <i className="ri-fire-fill text-sm" style={{ color: content.color }}></i>
                </div>
              ))}
              {streakCount > 7 && <span className="text-app-text-secondary text-xs">+{streakCount - 7}</span>}
            </div>
          )}
          {type === "sr" && (
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="font-bold text-2xl" style={{ color: content.color }}>{srCount}</p>
                <p className="text-app-text-muted text-[10px]">Từ đã ôn</p>
              </div>
              <div className="w-px h-8 bg-app-card/70"></div>
              <div className="text-center">
                <p className="text-white font-bold text-2xl">SR</p>
                <p className="text-app-text-muted text-[10px]">Spaced Rep.</p>
              </div>
            </div>
          )}

          {/* Bottom tag */}
          <div className="mt-4 pt-4 border-t border-app-border flex items-center justify-center gap-2">
            <span className="text-app-text-muted text-[10px]">hanquocoi.app</span>
            <span className="text-white/10">·</span>
            <span className="text-app-text-muted text-[10px]">#HànQuốcƠi</span>
          </div>
        </div>

        {/* Share buttons */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-sm">Chia sẻ kết quả</h3>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary hover:text-white/70 cursor-pointer">
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>

          {/* Share text preview */}
          <div className="bg-app-surface/50 border border-app-border rounded-xl p-3 mb-4 max-h-20 overflow-y-auto">
            <p className="text-app-text-secondary text-xs leading-relaxed whitespace-pre-line">{content.text}</p>
          </div>

          {/* Platform buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => handleShare("facebook")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${activeShare === "facebook" ? "bg-[#1877f2]/30 border-[#1877f2]/50" : "bg-[#1877f2]/10 border-[#1877f2]/25 hover:bg-[#1877f2]/20"} text-[#1877f2]`}
            >
              <i className="ri-facebook-fill text-base"></i>
              Facebook
            </button>
            <button
              onClick={() => handleShare("zalo")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${activeShare === "zalo" ? "bg-[#0068ff]/30 border-[#0068ff]/50" : "bg-[#0068ff]/10 border-[#0068ff]/25 hover:bg-[#0068ff]/20"} text-[#0068ff]`}
            >
              <i className="ri-message-2-fill text-base"></i>
              Zalo
            </button>
            <button
              onClick={() => handleShare("twitter")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${activeShare === "twitter" ? "bg-white/15 border-white/25" : "bg-app-card/50 border-app-border hover:bg-app-card/70"} text-white/60`}
            >
              <i className="ri-twitter-x-fill text-base"></i>
              Twitter/X
            </button>
            {"share" in navigator ? (
              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#34d399]/10 border border-[#34d399]/20 text-[#34d399] text-sm font-medium cursor-pointer hover:bg-[#34d399]/20 transition-all whitespace-nowrap"
              >
                <i className="ri-share-line text-base"></i>
                Chia sẻ
              </button>
            ) : (
              <button
                onClick={handleCopy}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${copied ? "bg-[#34d399]/15 border-[#34d399]/30 text-[#34d399]" : "bg-app-card/50 border-app-border text-white/60 hover:bg-app-card/70"}`}
              >
                <i className={`${copied ? "ri-check-line" : "ri-clipboard-line"} text-base`}></i>
                {copied ? "Đã sao chép!" : "Sao chép"}
              </button>
            )}
          </div>

          <button
            onClick={handleCopy}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${copied ? "bg-[#34d399]/10 border-[#34d399]/20 text-[#34d399]" : "bg-app-surface/50 border-app-border text-app-text-secondary hover:text-white/70"}`}
          >
            <i className={`${copied ? "ri-check-line" : "ri-file-copy-line"} text-sm`}></i>
            {copied ? "Đã sao chép nội dung!" : "Sao chép nội dung chia sẻ"}
          </button>

          {/* Share history toggle */}
          {shareHistory.length > 1 && (
            <button onClick={() => setShowHistory(v => !v)}
              className="w-full flex items-center justify-center gap-2 py-2 text-app-text-muted hover:text-white/50 text-xs cursor-pointer transition-colors whitespace-nowrap mt-1">
              <i className="ri-history-line text-xs"></i>
              {showHistory ? "Ẩn lịch sử" : `Lịch sử chia sẻ (${shareHistory.length - 1})`}
            </button>
          )}

          {showHistory && shareHistory.length > 1 && (
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {shareHistory.slice(1, 6).map(item => (
                <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-app-surface/50 rounded-lg border border-app-border">
                  <div className="w-6 h-6 flex items-center justify-center rounded-md bg-app-card/50 flex-shrink-0">
                    <i className={`text-[10px] ${item.type === "streak" ? "ri-fire-line text-[#fb923c]" : item.type === "sr" ? "ri-brain-line text-[#a78bfa]" : "ri-trophy-line text-app-accent-primary"}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-[10px] truncate">{item.title}</p>
                    <p className="text-app-text-muted text-[9px]">{new Date(item.sharedAt).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <button onClick={async () => { await copyTextToClipboard(item.text); }}
                    className="text-app-text-muted hover:text-white/60 cursor-pointer transition-colors flex-shrink-0">
                    <i className="ri-file-copy-line text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MemoizedShareResultCard = memo(ShareResultCard);
export default MemoizedShareResultCard;
