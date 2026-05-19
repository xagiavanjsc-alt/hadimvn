import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HANJA_DATA, HanjaEntry } from "@/mocks/hanjaData";
import { supabase } from "@/lib/supabase";

const DB_CACHE_KEY = "hanja_db_cache_v2";
function readDbCache(): HanjaEntry[] {
  try {
    const raw = localStorage.getItem(DB_CACHE_KEY);
    if (!raw) return HANJA_DATA;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.data) && parsed.data.length > 0 ? parsed.data : HANJA_DATA;
  } catch { return HANJA_DATA; }
}

interface SRCard {
  korean: string;
  interval: number;
  easeFactor: number;
  dueDate: number;
  totalReviews: number;
  correctStreak: number;
}

// Deterministic shuffle dựa trên seed (ngày hôm nay) → mỗi ngày ra set từ khác
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getDailyDueWords(): { entry: HanjaEntry; card: SRCard | null; isNew: boolean }[] {
  try {
    const allData = readDbCache();
    const srData: Record<string, SRCard> = JSON.parse(localStorage.getItem("hanja_sr_data") || "{}");
    const now = Date.now();
    const today = new Date();
    const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    const due = allData.filter(e => {
      const card = srData[e.korean];
      return !card || card.dueDate <= now;
    });

    const shuffled = seededShuffle(due, daySeed);
    return shuffled.slice(0, 5).map(e => ({
      entry: e,
      card: srData[e.korean] || null,
      isNew: !srData[e.korean],
    }));
  } catch {
    return HANJA_DATA.slice(0, 5).map(e => ({ entry: e, card: null, isNew: true }));
  }
}

function getTotalDueLocal(): number {
  try {
    const allData = readDbCache();
    const srData: Record<string, SRCard> = JSON.parse(localStorage.getItem("hanja_sr_data") || "{}");
    const now = Date.now();
    return allData.filter(e => {
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
  const [dbTotal, setDbTotal] = useState<number | null>(null);

  // Lấy tổng số từ thực tế từ Supabase
  useEffect(() => {
    supabase
      .from("hanja_pro")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => { if (count !== null) setDbTotal(count); });
  }, []);

  const dueWords = useMemo(() => getDailyDueWords(), []);
  const totalDue = useMemo(() => getTotalDueLocal(), []);
  const displayTotal = dbTotal !== null ? dbTotal : totalDue;

  const toggleReveal = (i: number) => {
    setRevealed(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  if (dueWords.length === 0) {
    return (
      <div className="bg-app-bg border border-app-border rounded-2xl p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 flex items-center justify-center bg-emerald-500/10 rounded-lg">
            <i className="ri-brain-line text-app-accent-success text-sm"></i>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Ôn tập hôm nay</h3>
            <p className="text-app-text-muted text-[10px]">Spaced Repetition</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 rounded-full mb-2">
            <i className="ri-check-double-line text-app-accent-success text-lg"></i>
          </div>
          <p className="text-app-accent-success text-sm font-semibold">Tuyệt vời!</p>
          <p className="text-app-text-muted text-xs mt-1">Không có từ cần ôn hôm nay</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center bg-rose-500/10 rounded-lg">
            <i className="ri-brain-line text-rose-400 text-sm"></i>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Gợi ý ôn hôm nay</h3>
            <p className="text-app-text-muted text-[10px]">Spaced Repetition · {displayTotal} từ cần ôn</p>
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
                  : "bg-app-surface/50 border-app-border hover:border-app-border"
              }`}
            >
              <div className="flex-1 min-w-0">
                {isRev ? (
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-rose-400 font-bold text-sm">{item.entry.korean}</span>
                      <span className="text-app-text-muted text-xs ml-1.5">{item.entry.hanja}</span>
                    </div>
                    <i className="ri-arrow-right-line text-app-text-muted text-xs"></i>
                    <span className="text-white/70 text-xs">{item.entry.vietnamese}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-app-text-muted text-[10px] font-bold w-4">{i + 1}</span>
                    <span className="text-white/80 text-sm font-bold">{item.entry.korean}</span>
                    <span className="text-app-text-muted text-xs">{item.entry.hanja}</span>
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

      <div className="mt-3 pt-3 border-t border-app-border flex items-center justify-between">
        <p className="text-app-text-muted text-[10px]">Nhấn để xem nghĩa · Dựa trên SM-2</p>
        <button
          onClick={() => navigate("/hanja-vocab")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors"
        >
          <i className="ri-play-circle-line text-xs"></i>
          Bắt đầu ôn ({displayTotal})
        </button>
      </div>
    </div>
  );
}
