import { useState } from "react";

interface ShareResultModalProps {
  score: number;
  total: number;
  level: string;
  quizType: string;
  onClose: () => void;
}

export default function ShareResultModal({ score, total, level, quizType, onClose }: ShareResultModalProps) {
  const [copied, setCopied] = useState(false);
  const pct = Math.round((score / total) * 100);
  const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "⭐" : "💪";
  const typeLabel = quizType === "reading" ? "Luyện đọc" : quizType === "listening" ? "Luyện nghe" : "Quiz từ vựng";

  const shareText = `${emoji} Mình vừa đạt ${pct}% (${score}/${total} câu) trong bài ${typeLabel} TOPIK ${level} trên Hàn Quốc Ơi!\n\nLuyện tiếng Hàn miễn phí tại: hanquocoi.app\n#HànQuốcƠi #HọcTiếngHàn #TOPIK${level}`;

  const shareUrl = "https://hanquocoi.app";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleZalo = () => {
    const url = `https://zalo.me/share?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Kết quả TOPIK", text: shareText, url: shareUrl });
      } catch {
        // user cancelled
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#13151c] border border-white/10 rounded-2xl w-full max-w-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-base">Chia sẻ kết quả</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-white/50 cursor-pointer">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>

        {/* Score preview card */}
        <div className="bg-gradient-to-br from-[#e8c84a]/10 to-[#e8c84a]/3 border border-[#e8c84a]/20 rounded-xl p-5 mb-5 text-center">
          <p className="text-4xl mb-2">{emoji}</p>
          <p className="text-[#e8c84a] font-black text-3xl mb-1">{pct}%</p>
          <p className="text-white/60 text-sm">{score}/{total} câu đúng</p>
          <p className="text-white/40 text-xs mt-1">{typeLabel} TOPIK {level} · Hàn Quốc Ơi!</p>
        </div>

        {/* Share text preview */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-3 mb-4">
          <p className="text-white/50 text-xs leading-relaxed whitespace-pre-line">{shareText}</p>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={handleFacebook}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1877f2]/15 border border-[#1877f2]/30 text-[#1877f2] text-sm font-medium cursor-pointer hover:bg-[#1877f2]/25 transition-all whitespace-nowrap"
          >
            <i className="ri-facebook-fill text-base"></i>
            Facebook
          </button>
          <button
            onClick={handleZalo}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0068ff]/15 border border-[#0068ff]/30 text-[#0068ff] text-sm font-medium cursor-pointer hover:bg-[#0068ff]/25 transition-all whitespace-nowrap"
          >
            <i className="ri-message-2-fill text-base"></i>
            Zalo
          </button>
          <button
            onClick={handleTwitter}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-medium cursor-pointer hover:bg-white/10 transition-all whitespace-nowrap"
          >
            <i className="ri-twitter-x-fill text-base"></i>
            Twitter/X
          </button>
          {typeof navigator !== "undefined" && "share" in navigator ? (
            <button
              onClick={handleNative}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#34d399]/10 border border-[#34d399]/20 text-[#34d399] text-sm font-medium cursor-pointer hover:bg-[#34d399]/20 transition-all whitespace-nowrap"
            >
              <i className="ri-share-line text-base"></i>
              Chia sẻ
            </button>
          ) : (
            <button
              onClick={handleCopy}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${
                copied
                  ? "bg-[#34d399]/15 border-[#34d399]/30 text-[#34d399]"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
              }`}
            >
              <i className={`${copied ? "ri-check-line" : "ri-clipboard-line"} text-base`}></i>
              {copied ? "Đã sao chép!" : "Sao chép"}
            </button>
          )}
        </div>

        <button
          onClick={handleCopy}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
            copied
              ? "bg-[#34d399]/10 border-[#34d399]/20 text-[#34d399]"
              : "bg-white/3 border-white/8 text-white/40 hover:text-white/70"
          }`}
        >
          <i className={`${copied ? "ri-check-line" : "ri-file-copy-line"} text-sm`}></i>
          {copied ? "Đã sao chép nội dung!" : "Sao chép nội dung chia sẻ"}
        </button>
      </div>
    </div>
  );
}
