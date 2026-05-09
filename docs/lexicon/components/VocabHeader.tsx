import AudioButton from "./AudioButton";

interface VocabHeaderProps {
  korean: string;
  hanja: string;
  sinoVietnamese: string;
  meaningVi: string;
  pronunciation: string;
}

export default function VocabHeader({
  korean,
  hanja,
  sinoVietnamese,
  meaningVi,
  pronunciation,
}: VocabHeaderProps) {
  return (
    <div className="bg-[#1A1E23] rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
      {/* Background Hanja decoration */}
      <div
        className="absolute right-6 top-1/2 -translate-y-1/2 text-[140px] font-bold opacity-5 select-none pointer-events-none"
        style={{ fontFamily: "'Noto Serif', serif" }}
      >
        {hanja[0]}
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">Từ vựng</span>
            <span className="h-px flex-1 bg-white/10 max-w-16"></span>
          </div>
          <h1
            className="text-6xl md:text-8xl font-bold text-white leading-none mb-2"
            style={{ fontFamily: "'Noto Serif', serif" }}
          >
            {korean}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span
              className="text-3xl md:text-4xl text-[#D4AF37] font-bold"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              {hanja}
            </span>
            <span className="h-8 w-px bg-white/15"></span>
            <div>
              <div className="text-lg font-bold text-white/90">{sinoVietnamese}</div>
              <div className="text-sm text-white/50">[{pronunciation}]</div>
            </div>
          </div>
        </div>

        <div className="md:ml-auto flex flex-col items-start md:items-end gap-3">
          <div className="bg-[#4A5D23]/30 border border-[#4A5D23]/40 text-white text-base font-bold px-5 py-2.5 rounded-xl">
            {meaningVi}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <AudioButton text={korean} size="md" variant="outline" label="Nghe chuẩn Seoul" />
            <AudioButton text={korean} size="md" variant="ghost" label="Phát âm chậm" slowMode />
            <button className="w-9 h-9 flex items-center justify-center bg-white/8 hover:bg-white/15 border border-white/12 text-white/40 hover:text-white/70 rounded-lg transition-colors cursor-pointer">
              <i className="ri-bookmark-line"></i>
            </button>
            <button className="w-9 h-9 flex items-center justify-center bg-white/8 hover:bg-white/15 border border-white/12 text-white/40 hover:text-white/70 rounded-lg transition-colors cursor-pointer">
              <i className="ri-share-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
