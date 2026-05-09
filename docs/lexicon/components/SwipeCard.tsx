import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface VocabItem {
  id: string;
  korean: string;
  hanja: string;
  sinoViet: string;
  meaning: string;
  level: string;
}

interface SwipeCardProps {
  words: VocabItem[];
  currentIndex: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function SwipeCard({ words, currentIndex, onSwipeLeft, onSwipeRight }: SwipeCardProps) {
  const navigate = useNavigate();
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const startX = useRef(0);
  const threshold = 80;

  const current = words[currentIndex];
  const next = words[currentIndex + 1];

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - startX.current;
    setDragX(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragX > threshold) {
      onSwipeRight();
    } else if (dragX < -threshold) {
      onSwipeLeft();
    }
    setDragX(0);
  };

  const rotation = isDragging ? (dragX / 20) : 0;
  const opacity = isDragging ? Math.max(0.3, 1 - Math.abs(dragX) / 300) : 1;

  const isSwipingLeft = dragX < -30;
  const isSwipingRight = dragX > 30;

  if (!current) return null;

  return (
    <div className="md:hidden fixed inset-0 z-40 bg-[#0D0F12] flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-4 z-10">
        <button
          onClick={() => navigate("/lexicon")}
          className="w-10 h-10 flex items-center justify-center text-white/60 cursor-pointer"
        >
          <i className="ri-close-line text-xl"></i>
        </button>
        <div className="text-xs text-white/40 font-medium">
          {currentIndex + 1} / {words.length}
        </div>
        <button
          onClick={() => setShowHint(!showHint)}
          className="w-10 h-10 flex items-center justify-center text-white/40 cursor-pointer"
        >
          <i className="ri-question-line text-xl"></i>
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute top-16 left-4 right-4 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#D4AF37] rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        ></div>
      </div>

      {/* Swipe direction indicators */}
      <div className={`absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-opacity duration-150 ${isSwipingRight ? "opacity-100" : "opacity-0"}`}>
        <div className="w-14 h-14 flex items-center justify-center bg-[#4A5D23]/20 border-2 border-[#4A5D23] rounded-full">
          <i className="ri-check-line text-[#4A5D23] text-2xl"></i>
        </div>
        <span className="text-xs text-[#4A5D23] font-bold">Đã biết</span>
      </div>
      <div className={`absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-opacity duration-150 ${isSwipingLeft ? "opacity-100" : "opacity-0"}`}>
        <div className="w-14 h-14 flex items-center justify-center bg-rose-500/20 border-2 border-rose-500 rounded-full">
          <i className="ri-bookmark-line text-rose-400 text-2xl"></i>
        </div>
        <span className="text-xs text-rose-400 font-bold">Ôn lại</span>
      </div>

      {/* Background card (next) */}
      {next && (
        <div className="absolute w-[85vw] max-w-sm bg-[#1A1E23] rounded-3xl border border-white/8 p-8 scale-95 opacity-50"
          style={{ transform: "scale(0.93) translateY(16px)" }}>
          <div className="text-5xl font-bold text-white/40 text-center" style={{ fontFamily: "'Noto Serif', serif" }}>
            {next.korean}
          </div>
        </div>
      )}

      {/* Main card */}
      <div
        className="relative w-[85vw] max-w-sm cursor-grab active:cursor-grabbing select-none"
        style={{
          transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
          opacity,
          transition: isDragging ? "none" : "transform 0.3s ease, opacity 0.3s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-[#1A1E23] border border-white/12 rounded-3xl p-8 shadow-2xl">
          {/* Level badge */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs bg-[#D4AF37]/15 text-[#D4AF37] px-2.5 py-1 rounded-full font-bold">
              {current.level}
            </span>
            <div className="flex items-center gap-1 text-xs text-white/30">
              <i className="ri-drag-move-line text-sm"></i>
              Vuốt để chuyển
            </div>
          </div>

          {/* Korean word */}
          <div className="text-center mb-6">
            <div className="text-7xl font-bold text-white mb-3" style={{ fontFamily: "'Noto Serif', serif" }}>
              {current.korean}
            </div>
            <div className="text-2xl text-[#D4AF37] font-bold" style={{ fontFamily: "'Noto Serif', serif" }}>
              {current.hanja}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-white/8"></div>
            <i className="ri-quill-pen-line text-white/20 text-xs"></i>
            <div className="h-px flex-1 bg-white/8"></div>
          </div>

          {/* Meaning */}
          <div className="text-center mb-6">
            <div className="text-lg font-bold text-white/90 mb-1">{current.sinoViet}</div>
            <div className="text-sm text-white/55">{current.meaning}</div>
          </div>

          {/* Action button */}
          <button
            onClick={() => navigate(`/lexicon?q=${current.korean}`)}
            className="w-full flex items-center justify-center gap-2 bg-white/6 hover:bg-white/10 border border-white/10 text-white/70 text-sm py-3 rounded-2xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-eye-line"></i>
            Xem phân tích chi tiết
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-6">
        <button
          onClick={onSwipeLeft}
          className="w-14 h-14 flex items-center justify-center bg-rose-500/15 border border-rose-500/30 rounded-full text-rose-400 cursor-pointer active:scale-90 transition-transform"
        >
          <i className="ri-bookmark-line text-xl"></i>
        </button>
        <button
          onClick={() => navigate(`/lexicon?q=${current.korean}`)}
          className="w-12 h-12 flex items-center justify-center bg-white/8 border border-white/15 rounded-full text-white/60 cursor-pointer active:scale-90 transition-transform"
        >
          <i className="ri-eye-line text-lg"></i>
        </button>
        <button
          onClick={onSwipeRight}
          className="w-14 h-14 flex items-center justify-center bg-[#4A5D23]/20 border border-[#4A5D23]/40 rounded-full text-[#7AB648] cursor-pointer active:scale-90 transition-transform"
        >
          <i className="ri-check-line text-xl"></i>
        </button>
      </div>

      {/* Hint overlay */}
      {showHint && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 px-8"
          onClick={() => setShowHint(false)}>
          <div className="bg-[#1A1E23] rounded-2xl p-6 max-w-xs w-full border border-white/10">
            <h3 className="text-white font-bold text-base mb-4 text-center">Cách sử dụng</h3>
            <div className="space-y-3">
              {[
                { icon: "ri-arrow-left-line", color: "text-rose-400", text: "Vuốt trái → Đánh dấu ôn lại" },
                { icon: "ri-arrow-right-line", color: "text-[#4A5D23]", text: "Vuốt phải → Đã biết từ này" },
                { icon: "ri-eye-line", color: "text-[#D4AF37]", text: "Nhấn nút mắt → Xem chi tiết" },
              ].map((hint, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center ${hint.color}`}>
                    <i className={`${hint.icon} text-lg`}></i>
                  </div>
                  <span className="text-xs text-white/70">{hint.text}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-5 bg-[#D4AF37] text-[#1A1E23] font-bold text-sm py-2.5 rounded-xl cursor-pointer whitespace-nowrap">
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
