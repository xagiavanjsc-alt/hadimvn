import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HANJA_DATA } from "@/mocks/hanjaData";

interface SRCard {
  korean: string;
  interval: number;
  easeFactor: number;
  dueDate: number;
  totalReviews: number;
  correctStreak: number;
}

function getDueWords(): { entry: typeof HANJA_DATA[0]; card: SRCard | null; isNew: boolean }[] {
  try {
    const srData: Record<string, SRCard> = JSON.parse(localStorage.getItem("hanja_sr_data") || "{}");
    const now = Date.now();
    const due = HANJA_DATA.filter(e => {
      const card = srData[e.korean];
      return !card || card.dueDate <= now;
    }).slice(0, 5).map(e => ({
      entry: e,
      card: srData[e.korean] || null,
      isNew: !srData[e.korean],
    }));
    return due;
  } catch {
    return HANJA_DATA.slice(0, 5).map(e => ({ entry: e, card: null, isNew: true }));
  }
}

function getTotalDue(): number {
  try {
    const srData: Record<string, SRCard> = JSON.parse(localStorage.getItem("hanja_sr_data") || "{}");
    const now = Date.now();
    return HANJA_DATA.filter(e => {
      const card = srData[e.korean];
      return !card || card.dueDate <= now;
    }).length;
  } catch {
    return 0;
  }
}

export default function SRReviewWidget() {
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const dueWords = useMemo(() => getDueWords(), []);
  const totalDue = useMemo(() => getTotalDue(), []);

  const toggleReveal = (i: number) => {
    setRevealed(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  if (dueWords.length === 0) {
    return (
      <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 flex items-center justify-center bg-emerald-500/10 rounded-lg">
            <i className="ri-brain-line text-emerald-400 text-sm"></i>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Ôn tập hôm nay</h3>
            <p className="text-white/25 text-[10px]">Spaced Repetition</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 rounded-full mb-2">
            <i className="ri-check-double-line text-emerald-400 text-lg"></i>
          </div>
          <p className="text-emerald-400 text-sm font-semibold">Tuyệt vời!</p>
          <p className="text-white/30 text-xs mt-1">Không có từ cần ôn hôm nay</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center bg-rose-500/10 rounded-lg">
            <i className="ri-brain-line text-rose-400 text-sm"></i>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Gợi ý ôn hôm nay</h3>
            <p className="text-white/25 text-[10px]">Spaced Repetition · {totalDue} từ cần ôn</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/hanja-vocab")}
          className="text-rose-400 text-xs hover:text-rose-300 cursor-pointer whitespace-nowrap transition-colors"
        >
          Ôn ngay <i className="ri-arrow-right-line"></i>
        </button>
      </div>

      <div className="space-y-2">
        {dueWords.map((item, i) => {
          const isRev = revealed.has(i);
          return (
            <button
              key={i}
              onClick={() => toggleReveal(i)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all cursor-pointer text-left border ${
                isRev
                  ? "bg-rose-500/5 border-rose-500/20"
                  : "bg-white/3 border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex-1 min-w-0">
                {isRev ? (
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-rose-400 font-bold text-sm">{item.entry.korean}</span>
                      <span className="text-white/30 text-xs ml-1.5">{item.entry.hanja}</span>
                    </div>
                    <i className="ri-arrow-right-line text-white/20 text-xs"></i>
                    <span className="text-white/70 text-xs">{item.entry.vietnamese}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-white/20 text-[10px] font-bold w-4">{i + 1}</span>
                    <span className="text-white/80 text-sm font-bold">{item.entry.korean}</span>
                    <span className="text-white/30 text-xs">{item.entry.hanja}</span>
                    {item.isNew && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">Mới</span>
                    )}
                    {!item.isNew && item.card && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400">Cần ôn</span>
                    )}
                  </div>
                )}
              </div>
              <i className={`text-xs flex-shrink-0 ${isRev ? "ri-eye-off-line text-rose-400/40" : "ri-eye-line text-white/15"}`}></i>
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <p className="text-white/20 text-[10px]">Nhấn để xem nghĩa · Dựa trên SM-2</p>
        <button
          onClick={() => navigate("/hanja-vocab")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors"
        >
          <i className="ri-play-circle-line text-xs"></i>
          Bắt đầu ôn ({totalDue})
        </button>
      </div>
    </div>
  );
}
