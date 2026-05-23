import { useMemo } from "react";
import { useHanjaData } from "@/contexts/HanjaDataContext";

const ALPHABET_GROUPS = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const SR_KEY = "hanja_sr_data";

interface SRCard {
  korean: string;
  interval: number;
  easeFactor: number;
  dueDate: number;
  totalReviews: number;
  correctStreak: number;
}

function getInitial(char: string): string {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return char[0];
  const idx = Math.floor(code / 588);
  const initials = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  return initials[idx] || char[0];
}

function getMasteryLevel(korean: string, srData: Record<string, SRCard>): "new" | "learning" | "mastered" {
  const card = srData[korean];
  if (!card) return "new";
  if (card.interval >= 21) return "mastered";
  return "learning";
}

export default function StatsTab() {
  const HANJA_DATA = useHanjaData();
  const srData = useMemo<Record<string, SRCard>>(() => {
    try { return JSON.parse(localStorage.getItem(SR_KEY) || "{}"); } catch { return {}; }
  }, []);

  const groupStats = useMemo(() => {
    return ALPHABET_GROUPS.map(g => {
      const words = HANJA_DATA.filter(d => getInitial(d.korean[0]) === g);
      let newCount = 0, learningCount = 0, masteredCount = 0;
      words.forEach(d => {
        const lvl = getMasteryLevel(d.korean, srData);
        if (lvl === "new") newCount++;
        else if (lvl === "learning") learningCount++;
        else masteredCount++;
      });
      const total = words.length;
      const masteredPct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
      const learningPct = total > 0 ? Math.round((learningCount / total) * 100) : 0;
      return { group: g, total, new: newCount, learning: learningCount, mastered: masteredCount, masteredPct, learningPct };
    }).filter(g => g.total > 0);
  }, [srData]);

  const overall = useMemo(() => {
    let newCount = 0, learningCount = 0, masteredCount = 0;
    HANJA_DATA.forEach(d => {
      const lvl = getMasteryLevel(d.korean, srData);
      if (lvl === "new") newCount++;
      else if (lvl === "learning") learningCount++;
      else masteredCount++;
    });
    const total = HANJA_DATA.length;
    return { total, new: newCount, learning: learningCount, mastered: masteredCount };
  }, [srData]);

  const overallPct = overall.total > 0 ? Math.round((overall.mastered / overall.total) * 100) : 0;

  return (
    <div>
      {/* Overall summary */}
      <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-accent-primary/10">
            <i className="ri-bar-chart-line text-app-accent-primary text-sm"></i>
          </div>
          <h2 className="text-base font-bold text-white">Tổng quan tiến độ</h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Chưa học", value: overall.new, icon: "ri-seedling-line", border: "border-slate-500/20", bg: "bg-slate-500/10", iconBg: "bg-slate-500/20", iconColor: "text-slate-300", textColor: "text-slate-300" },
            { label: "Đang học", value: overall.learning, icon: "ri-book-open-line", border: "border-amber-500/20", bg: "bg-amber-500/10", iconBg: "bg-amber-500/20", iconColor: "text-amber-400", textColor: "text-amber-400" },
            { label: "Đã thuộc", value: overall.mastered, icon: "ri-check-double-line", border: "border-green-500/20", bg: "bg-green-500/10", iconBg: "bg-green-500/20", iconColor: "text-green-400", textColor: "text-green-400" },
          ].map(c => (
            <div key={c.label} className={`relative flex flex-col items-center justify-center text-center rounded-2xl border ${c.border} ${c.bg} p-4 sm:p-5 transition-colors`}>
              <div className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl ${c.iconBg} mb-2`}>
                <i className={`${c.icon} ${c.iconColor} text-base sm:text-lg`}></i>
              </div>
              <p className={`text-2xl sm:text-3xl font-bold ${c.textColor} leading-none`}>{c.value.toLocaleString()}</p>
              <p className="text-xs text-white/50 mt-1.5">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-2 flex justify-between items-baseline text-xs text-white/50">
          <span>Tiến độ tổng thể</span>
          <span><span className="font-bold text-green-400">{overallPct}%</span> đã thuộc · <span className="text-white/70">{overall.mastered.toLocaleString()}/{overall.total.toLocaleString()}</span></span>
        </div>
        <div className="w-full bg-app-surface/70 rounded-full h-3 overflow-hidden flex">
          <div className="bg-green-400 h-full transition-all" style={{ width: `${overallPct}%` }}></div>
          <div className="bg-amber-300 h-full transition-all" style={{ width: `${overall.total > 0 ? Math.round((overall.learning / overall.total) * 100) : 0}%` }}></div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs text-white/50">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>Đã thuộc</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-300 inline-block"></span>Đang học</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500/40 inline-block"></span>Chưa học</span>
        </div>
      </div>

      {/* Per-group breakdown */}
      <div className="bg-app-surface/50 border border-app-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-app-border">
          <h2 className="text-base font-bold text-white/90">Tiến độ theo nhóm chữ cái</h2>
          <p className="text-xs text-white/40 mt-0.5">Nhấn vào nhóm để xem chi tiết</p>
        </div>
        <div className="divide-y divide-app-border">
          {groupStats.map(g => (
            <div key={g.group} className="px-5 py-4 hover:bg-app-surface/30 transition-colors">
              <div className="flex items-center gap-4">
                {/* Group letter */}
                <div className="w-10 h-10 flex items-center justify-center bg-app-accent-primary/10 rounded-xl flex-shrink-0">
                  <span className="text-lg font-bold text-app-accent-primary">{g.group}</span>
                </div>

                {/* Stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-white/80">{g.total} từ</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-white/40">{g.new} mới</span>
                      <span className="text-amber-400">{g.learning} học</span>
                      <span className="text-green-400 font-semibold">{g.mastered} thuộc</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-app-surface/50 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full flex">
                      <div className="bg-green-400 h-full transition-all" style={{ width: `${g.masteredPct}%` }}></div>
                      <div className="bg-amber-300 h-full transition-all" style={{ width: `${g.learningPct}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Percentage */}
                <div className="flex-shrink-0 text-right w-14">
                  <span className={`text-sm font-bold ${g.masteredPct >= 80 ? "text-green-400" : g.masteredPct >= 40 ? "text-amber-400" : "text-white/40"}`}>
                    {g.masteredPct}%
                  </span>
                  <p className="text-xs text-white/40">thuộc</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="mt-4 bg-app-accent-primary/10 rounded-xl p-4 text-xs text-app-accent-primary">
        <i className="ri-lightbulb-line mr-1"></i>
        Mẹo: Dùng tab <strong>Quick Review</strong> để ôn nhanh từng nhóm, hoặc <strong>Spaced Rep</strong> để ôn thông minh theo thuật toán SM-2.
      </div>
    </div>
  );
}

