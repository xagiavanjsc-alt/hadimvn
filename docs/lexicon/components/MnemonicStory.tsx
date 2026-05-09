interface MnemonicStoryProps {
  story: string;
  word: string;
}

export default function MnemonicStory({ story, word }: MnemonicStoryProps) {
  return (
    <div className="bg-[#1A1E23] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center bg-[#D4AF37]/15 rounded-lg">
            <i className="ri-quill-pen-line text-[#D4AF37] text-sm"></i>
          </div>
          <h2 className="text-sm font-bold text-white">Truyện Chêm (Mnemonic Story)</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-0.5 rounded font-bold">VIP</span>
          <button className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-play-circle-line"></i>
            Nghe truyện
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Story text */}
        <div className="p-6 md:p-8">
          <div className="text-4xl text-[#D4AF37]/20 mb-3" style={{ fontFamily: "'Noto Serif', serif" }}>"</div>
          <p className="text-sm text-white/80 leading-loose italic">{story}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-xs text-white/30 font-medium">AI Generated Story</span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
        </div>

        {/* Illustration */}
        <div className="relative min-h-48 md:min-h-0">
          <img
            src="https://readdy.ai/api/search-image?query=traditional%20Korean%20painting%20style%20minimalist%20illustration%20ancient%20scholars%20studying%20calligraphy%20silk%20fabric%20weaving%20elegant%20storytelling%20cultural%20artistic%20watercolor%20ink%20warm%20tones&width=400&height=350&seq=mnemonic-story-001&orientation=landscape"
            alt="Minh họa truyện chêm"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#1A1E23]/40"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <span className="text-xs text-white/50 bg-[#1A1E23]/60 px-3 py-1.5 rounded-lg">
              Hình ảnh minh họa AI cho từ "{word}"
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
