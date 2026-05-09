import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface RelatedWord {
  korean: string;
  hanja: string;
  meaning: string;
}

interface HanjaTreeProps {
  root: string;
  rootHanja: string;
  rootMeaning: string;
  relatedWords: RelatedWord[];
}

export default function HanjaTree({ root, rootHanja, rootMeaning, relatedWords }: HanjaTreeProps) {
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Arrange words in a radial layout concept (2 rows)
  const topWords = relatedWords.slice(0, Math.ceil(relatedWords.length / 2));
  const bottomWords = relatedWords.slice(Math.ceil(relatedWords.length / 2));

  return (
    <div className="bg-[#13171A] rounded-2xl p-6 md:p-8 border border-white/8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 flex items-center justify-center bg-[#4A5D23]/20 rounded-lg">
          <i className="ri-node-tree text-[#4A5D23] text-base"></i>
        </div>
        <h2 className="text-base font-bold text-white">Sơ đồ Cây Phả Hệ Hanja</h2>
        <span className="ml-auto text-xs text-white/35 bg-white/5 px-2 py-1 rounded-full">
          {relatedWords.length} từ phái sinh
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 text-xs text-white/40">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#D4AF37]"></div>
          <span>Từ gốc</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#4A5D23]"></div>
          <span>Từ phái sinh</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <i className="ri-cursor-line text-xs"></i>
          <span>Nhấn để tra cứu</span>
        </div>
      </div>

      {/* Tree visualization */}
      <div className="relative">
        {/* Top row words */}
        {topWords.length > 0 && (
          <div className="flex items-end justify-center gap-3 md:gap-5 mb-1 flex-wrap">
            {topWords.map((word, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => navigate(`/lexicon?q=${word.korean}`)}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`bg-[#1A1E23] border rounded-xl px-4 py-3 text-center cursor-pointer transition-all group min-w-[72px] ${
                    hoveredIdx === idx
                      ? "border-[#4A5D23] bg-[#4A5D23]/10 scale-105"
                      : "border-white/10 hover:border-[#4A5D23]/50"
                  }`}
                >
                  <div className="text-lg font-bold text-white group-hover:text-[#4A5D23] transition-colors"
                    style={{ fontFamily: "'Noto Serif', serif" }}>
                    {word.korean}
                  </div>
                  <div className="text-[11px] text-[#D4AF37] font-medium mt-0.5">{word.hanja}</div>
                  <div className="text-[10px] text-white/45 mt-0.5 whitespace-nowrap">{word.meaning}</div>
                </button>
                {/* Connector down to branch line */}
                <div className="w-px h-5 bg-gradient-to-b from-[#4A5D23]/50 to-[#4A5D23]/20"></div>
              </div>
            ))}
          </div>
        )}

        {/* Horizontal branch top */}
        {topWords.length > 0 && (
          <div className="flex justify-center mb-0">
            <div className="h-px bg-gradient-to-r from-transparent via-[#4A5D23]/40 to-transparent w-4/5"></div>
          </div>
        )}

        {/* Central connector to root */}
        <div className="flex flex-col items-center">
          <div className="w-px h-6 bg-gradient-to-b from-[#4A5D23]/40 to-[#D4AF37]/60"></div>

          {/* Root node - the star */}
          <div className="relative z-10 bg-gradient-to-br from-[#D4AF37]/20 to-[#C9A42E]/10 border-2 border-[#D4AF37]/50 text-white rounded-2xl px-8 py-5 text-center min-w-36 shadow-lg shadow-[#D4AF37]/5">
            {/* Crown icon */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center bg-[#D4AF37] rounded-full">
              <i className="ri-vip-crown-fill text-[#1A1E23] text-xs"></i>
            </div>
            <div className="text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Noto Serif', serif" }}>
              {root}
            </div>
            <div className="text-sm text-[#D4AF37] font-bold mt-1" style={{ fontFamily: "'Noto Serif', serif" }}>
              {rootHanja}
            </div>
            <div className="text-xs text-white/60 mt-1.5 bg-white/5 px-2 py-0.5 rounded-full inline-block">
              {rootMeaning}
            </div>
          </div>

          <div className="w-px h-6 bg-gradient-to-b from-[#D4AF37]/60 to-[#4A5D23]/40"></div>
        </div>

        {/* Horizontal branch bottom */}
        {bottomWords.length > 0 && (
          <div className="flex justify-center mt-0">
            <div className="h-px bg-gradient-to-r from-transparent via-[#4A5D23]/40 to-transparent w-4/5"></div>
          </div>
        )}

        {/* Bottom row words */}
        {bottomWords.length > 0 && (
          <div className="flex items-start justify-center gap-3 md:gap-5 mt-1 flex-wrap">
            {bottomWords.map((word, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                {/* Connector up to branch line */}
                <div className="w-px h-5 bg-gradient-to-b from-[#4A5D23]/20 to-[#4A5D23]/50"></div>
                <button
                  onClick={() => navigate(`/lexicon?q=${word.korean}`)}
                  onMouseEnter={() => setHoveredIdx(topWords.length + idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`bg-[#1A1E23] border rounded-xl px-4 py-3 text-center cursor-pointer transition-all group min-w-[72px] ${
                    hoveredIdx === topWords.length + idx
                      ? "border-[#4A5D23] bg-[#4A5D23]/10 scale-105"
                      : "border-white/10 hover:border-[#4A5D23]/50"
                  }`}
                >
                  <div className="text-lg font-bold text-white group-hover:text-[#4A5D23] transition-colors"
                    style={{ fontFamily: "'Noto Serif', serif" }}>
                    {word.korean}
                  </div>
                  <div className="text-[11px] text-[#D4AF37] font-medium mt-0.5">{word.hanja}</div>
                  <div className="text-[10px] text-white/45 mt-0.5 whitespace-nowrap">{word.meaning}</div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="mt-6 flex items-center gap-2 pt-4 border-t border-white/6">
        <i className="ri-information-line text-white/20 text-sm"></i>
        <p className="text-xs text-white/30">
          Tất cả từ phái sinh đều thuộc kho từ vựng Hadim.vn. Nhấn vào từng nút để xem phân tích chuyên sâu.
        </p>
      </div>
    </div>
  );
}
