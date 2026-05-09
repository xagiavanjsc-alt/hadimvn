import { useState } from "react";

interface Example {
  korean: string;
  romanization: string;
  phonetic: string;
  meaning: string;
}

interface ExampleTableProps {
  examples: Example[];
}

export default function ExampleTable({ examples }: ExampleTableProps) {
  const [showPhonetic, setShowPhonetic] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);

  return (
    <div className="bg-[#13171A] rounded-2xl p-6 md:p-8 border border-white/8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center bg-[#4A5D23]/10 rounded-lg">
            <i className="ri-list-check text-[#4A5D23] text-base"></i>
          </div>
          <h2 className="text-base font-bold text-white">Ví dụ Thực Chiến</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPhonetic(!showPhonetic)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              showPhonetic
                ? "bg-[#4A5D23] text-white"
                : "bg-white/8 text-white/50 hover:bg-white/15"
            }`}
          >
            <i className={showPhonetic ? "ri-eye-off-line" : "ri-eye-line"}></i>
            {showPhonetic ? "Ẩn phiên âm bồi" : "Hiện phiên âm bồi"}
          </button>
          <button
            onClick={() => setShowMeaning(!showMeaning)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              showMeaning
                ? "bg-[#4A5D23] text-white"
                : "bg-white/8 text-white/50 hover:bg-white/15"
            }`}
          >
            <i className={showMeaning ? "ri-eye-off-line" : "ri-eye-line"}></i>
            {showMeaning ? "Ẩn dịch nghĩa" : "Hiện dịch nghĩa"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {examples.map((ex, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-white/4 border border-white/5"
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#1A1E23]/8 text-[#1A1E23]/60 text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1">
                <p
                  className="text-base font-bold text-white leading-snug mb-1"
                  style={{ fontFamily: "'Noto Serif', serif" }}
                >
                  {ex.korean}
                </p>
                <p className="text-xs text-white/35 italic mb-1">{ex.romanization}</p>

                {/* Phonetic toggle */}
                {showPhonetic ? (
                  <p className="text-xs font-semibold text-[#4A5D23] bg-[#4A5D23]/8 px-2.5 py-1 rounded-lg inline-block mb-1">
                    🔊 {ex.phonetic}
                  </p>
                ) : (
                  <div
                    className="inline-block text-xs font-semibold text-white/25 border border-dashed border-white/12 px-2.5 py-1 rounded-lg mb-1 cursor-pointer hover:border-[#4A5D23]/50 transition-colors"
                    onClick={() => setShowPhonetic(true)}
                  >
                    Nhấn để xem phiên âm bồi
                  </div>
                )}

                {/* Meaning toggle */}
                {showMeaning ? (
                  <p className="text-sm text-[#1A1E23]/80 font-medium">
                    🇻🇳 {ex.meaning}
                  </p>
                ) : (
                  <div
                    className="text-xs font-semibold text-white/25 border border-dashed border-white/12 px-2.5 py-1 rounded-lg inline-block cursor-pointer hover:border-[#D4AF37]/40 transition-colors"
                    onClick={() => setShowMeaning(true)}
                  >
                    Nhấn để xem dịch nghĩa
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
