import { useState, useEffect } from "react";

interface ShareFlashcardModalProps {
  cards: { word: string; meaning: string; example: string; songTitle: string }[];
  onClose: () => void;
}

const SHARE_KEY_PREFIX = "kts_shared_fc_";

export default function ShareFlashcardModal({ cards, onClose }: ShareFlashcardModalProps) {
  const [shareId, setShareId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareTitle, setShareTitle] = useState("Bộ flashcard K-pop của tôi");

  useEffect(() => {
    // Generate a unique share ID
    const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    setShareId(id);
  }, []);

  const shareUrl = shareId
    ? `${window.location.origin}/melon-flashcard/shared/${shareId}`
    : "";

  const handleCreateLink = () => {
    if (!shareId) return;
    const payload = {
      id: shareId,
      title: shareTitle,
      cards: cards.slice(0, 100), // max 100 cards
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(`${SHARE_KEY_PREFIX}${shareId}`, JSON.stringify(payload));
    handleCopy();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1a1d27] border border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-[#e8c84a]/12 rounded-xl">
              <i className="ri-share-line text-[#e8c84a] text-sm" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Chia sẻ Flashcard</p>
              <p className="text-white/35 text-xs">{cards.length} từ vựng</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white cursor-pointer rounded-lg hover:bg-white/5 transition-colors">
            <i className="ri-close-line" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title input */}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Tên bộ flashcard</label>
            <input
              type="text"
              value={shareTitle}
              onChange={e => setShareTitle(e.target.value)}
              maxLength={60}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#e8c84a]/40 transition-colors"
              placeholder="VD: Từ vựng BTS - Butter"
            />
          </div>

          {/* Preview */}
          <div className="bg-white/3 border border-white/5 rounded-xl p-3">
            <p className="text-white/30 text-[10px] tracking-wider mb-2">Xem trước ({Math.min(cards.length, 3)} từ đầu)</p>
            <div className="space-y-1.5">
              {cards.slice(0, 3).map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[#e8c84a] text-xs font-bold w-16 truncate">{c.word}</span>
                  <span className="text-white/40 text-xs">—</span>
                  <span className="text-white/55 text-xs truncate flex-1">{c.meaning}</span>
                </div>
              ))}
              {cards.length > 3 && (
                <p className="text-white/20 text-[10px]">+{cards.length - 3} từ khác...</p>
              )}
            </div>
          </div>

          {/* Share link */}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Link chia sẻ</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white/40 text-xs truncate">
                {shareUrl}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 px-3 py-2.5 bg-[#e8c84a]/5 border border-[#e8c84a]/10 rounded-xl">
            <i className="ri-information-line text-[#e8c84a]/60 text-sm flex-shrink-0 mt-0.5" />
            <p className="text-white/40 text-xs leading-relaxed">
              Link chia sẻ cho phép bạn bè xem và học bộ flashcard này. Tối đa 100 từ được chia sẻ.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm cursor-pointer whitespace-nowrap hover:bg-white/5 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleCreateLink}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-all ${
                copied
                  ? "bg-emerald-500 text-white"
                  : "bg-[#e8c84a] hover:bg-[#e8c84a]/80 text-[#0f1117]"
              }`}
            >
              {copied ? (
                <><i className="ri-checkbox-circle-line mr-1.5" />Đã sao chép!</>
              ) : (
                <><i className="ri-link mr-1.5" />Tạo & Sao chép link</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Flashcard Viewer (public page) ────────────────────────────────────
export function SharedFlashcardViewer({ shareId }: { shareId: string }) {
  const [data, setData] = useState<{
    title: string;
    cards: { word: string; meaning: string; example: string; songTitle: string }[];
    createdAt: string;
  } | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(`${SHARE_KEY_PREFIX}${shareId}`);
    if (!raw) { setNotFound(true); return; }
    try {
      setData(JSON.parse(raw));
    } catch {
      setNotFound(true);
    }
  }, [shareId]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-2xl mb-4">
          <i className="ri-link-unlink text-white/20 text-2xl" />
        </div>
        <p className="text-white/50 text-sm font-medium mb-1">Link không tồn tại</p>
        <p className="text-white/25 text-xs">Link này đã hết hạn hoặc không hợp lệ</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#e8c84a]/30 border-t-[#e8c84a] rounded-full animate-spin" />
      </div>
    );
  }

  const card = data.cards[currentIdx];
  const progress = Math.round((currentIdx / data.cards.length) * 100);

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      {/* Header */}
      <header className="h-14 flex items-center px-4 gap-3 border-b border-white/8">
        <div className="w-7 h-7 flex items-center justify-center bg-[#e8c84a]/12 rounded-lg">
          <i className="ri-share-line text-[#e8c84a] text-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{data.title}</p>
          <p className="text-white/30 text-xs">{data.cards.length} từ · Được chia sẻ từ KTS</p>
        </div>
        <a
          href="/melon-flashcard"
          className="text-xs text-[#e8c84a]/70 hover:text-[#e8c84a] bg-[#e8c84a]/8 px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
        >
          Tạo bộ của tôi
        </a>
      </header>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-4">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-[#e8c84a] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-white/30 text-xs whitespace-nowrap">{currentIdx + 1}/{data.cards.length}</span>
        </div>

        <p className="text-white/25 text-xs text-center mb-3 truncate">
          <i className="ri-music-2-line mr-1" />{card.songTitle}
        </p>

        {/* Card */}
        <div
          className="flex-1 flex items-center justify-center cursor-pointer mb-5"
          onClick={() => setFlipped(!flipped)}
        >
          <div
            className="w-full rounded-3xl border p-8 text-center min-h-64 flex flex-col items-center justify-center transition-all duration-300"
            style={{
              background: flipped
                ? "linear-gradient(135deg, rgba(232,200,74,0.08), rgba(232,200,74,0.03))"
                : "rgba(255,255,255,0.03)",
              borderColor: flipped ? "rgba(232,200,74,0.2)" : "rgba(255,255,255,0.06)",
            }}
          >
            {!flipped ? (
              <>
                <p className="text-[#e8c84a] text-3xl font-bold mb-3">{card.word}</p>
                <p className="text-white/20 text-xs">Nhấn để xem nghĩa</p>
              </>
            ) : (
              <>
                <p className="text-[#e8c84a] text-xl font-bold mb-2">{card.word}</p>
                <p className="text-white/85 text-lg font-medium mb-3">{card.meaning}</p>
                <div className="w-8 h-px bg-white/15 mb-3" />
                <p className="text-white/40 text-sm italic leading-relaxed">{card.example}</p>
              </>
            )}
          </div>
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => { setCurrentIdx(i => Math.max(0, i - 1)); setFlipped(false); }}
            disabled={currentIdx === 0}
            className="flex-1 py-3 bg-white/5 border border-white/8 text-white/40 text-sm rounded-2xl cursor-pointer disabled:opacity-30 whitespace-nowrap"
          >
            <i className="ri-arrow-left-line mr-1.5" />Trước
          </button>
          <button
            onClick={() => { setCurrentIdx(i => Math.min(data.cards.length - 1, i + 1)); setFlipped(false); }}
            disabled={currentIdx === data.cards.length - 1}
            className="flex-1 py-3 bg-[#e8c84a] hover:bg-[#e8c84a]/80 text-[#0f1117] text-sm font-bold rounded-2xl cursor-pointer disabled:opacity-30 whitespace-nowrap"
          >
            Tiếp <i className="ri-arrow-right-line ml-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
