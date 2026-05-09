interface RootChar {
  hanja: string;
  sinoViet: string;
  meaning: string;
}

interface RootAnalysisProps {
  korean: string;
  char1: RootChar;
  char2: RootChar;
  explanation: string;
}

export default function RootAnalysis({ korean, char1, char2, explanation }: RootAnalysisProps) {
  return (
    <div className="bg-[#13171A] rounded-2xl p-6 md:p-8 border border-white/8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 flex items-center justify-center bg-[#4A5D23]/10 rounded-lg">
          <i className="ri-microscope-line text-[#4A5D23] text-base"></i>
        </div>
        <h2 className="text-base font-bold text-white">Phân tích Gốc (Root Analysis)</h2>
      </div>

      {/* Breakdown */}
      <div className="flex items-stretch gap-3 mb-6">
        {/* Korean */}
        <div className="flex-1 bg-white/6 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1"
            style={{ fontFamily: "'Noto Serif', serif" }}>
            {korean}
          </div>
          <div className="text-xs text-white/40 font-medium">Hàn ngữ</div>
        </div>

        <div className="flex items-center text-[#1A1E23]/30 text-lg font-bold">=</div>

        {/* Char 1 */}
        <div className="flex-1 bg-[#4A5D23]/5 border border-[#4A5D23]/15 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[#4A5D23] mb-1"
            style={{ fontFamily: "'Noto Serif', serif" }}>
            {char1.hanja}
          </div>
          <div className="text-xs font-bold text-[#4A5D23] mb-0.5">{char1.sinoViet}</div>
          <div className="text-xs text-white/40">{char1.meaning}</div>
        </div>

        <div className="flex items-center text-[#1A1E23]/30 text-lg font-bold">+</div>

        {/* Char 2 */}
        <div className="flex-1 bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[#D4AF37] mb-1"
            style={{ fontFamily: "'Noto Serif', serif" }}>
            {char2.hanja}
          </div>
          <div className="text-xs font-bold text-[#D4AF37]/80 mb-0.5">{char2.sinoViet}</div>
          <div className="text-xs text-white/40">{char2.meaning}</div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-white/4 rounded-xl p-4" style={{ borderLeftWidth: "3px", borderLeftColor: "#4A5D23", borderLeftStyle: "solid" }}>
        <p className="text-sm text-white/65 leading-relaxed">{explanation}</p>
      </div>
    </div>
  );
}
