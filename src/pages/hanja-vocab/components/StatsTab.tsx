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
    <div className="max-w-3xl mx-auto">
      {/* Overall summary */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">Tổng quan tiến độ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="text-center bg-gray-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-500">{overall.new}</p>
            <p className="text-xs text-gray-400 mt-1">Chưa học</p>
          </div>
          <div className="text-center bg-amber-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-amber-600">{overall.learning}</p>
            <p className="text-xs text-gray-400 mt-1">Đang học</p>
          </div>
          <div className="text-center bg-green-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-600">{overall.mastered}</p>
            <p className="text-xs text-gray-400 mt-1">Đã thuộc</p>
          </div>
        </div>
        <div className="mb-2 flex justify-between text-xs text-gray-500">
          <span>Tiến độ tổng thể</span>
          <span className="font-semibold text-green-600">{overallPct}% đã thuộc ({overall.mastered}/{overall.total})</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div className="h-3 rounded-full flex">
            <div className="bg-green-400 h-full transition-all" style={{ width: `${overallPct}%` }}></div>
            <div className="bg-amber-300 h-full transition-all" style={{ width: `${overall.total > 0 ? Math.round((overall.learning / overall.total) * 100) : 0}%` }}></div>
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>Đã thuộc</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-300 inline-block"></span>Đang học</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200 inline-block"></span>Chưa học</span>
        </div>
      </div>

      {/* Per-group breakdown */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Tiến độ theo nhóm chữ cái</h2>
          <p className="text-xs text-gray-400 mt-0.5">Nhấn vào nhóm để xem chi tiết</p>
        </div>
        <div className="divide-y divide-gray-50">
          {groupStats.map(g => (
            <div key={g.group} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                {/* Group letter */}
                <div className="w-10 h-10 flex items-center justify-center bg-rose-50 rounded-xl flex-shrink-0">
                  <span className="text-lg font-bold text-rose-600">{g.group}</span>
                </div>

                {/* Stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-700">{g.total} từ</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-400">{g.new} mới</span>
                      <span className="text-amber-500">{g.learning} học</span>
                      <span className="text-green-600 font-semibold">{g.mastered} thuộc</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full flex">
                      <div className="bg-green-400 h-full transition-all" style={{ width: `${g.masteredPct}%` }}></div>
                      <div className="bg-amber-300 h-full transition-all" style={{ width: `${g.learningPct}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Percentage */}
                <div className="flex-shrink-0 text-right w-14">
                  <span className={`text-sm font-bold ${g.masteredPct >= 80 ? "text-green-600" : g.masteredPct >= 40 ? "text-amber-500" : "text-gray-400"}`}>
                    {g.masteredPct}%
                  </span>
                  <p className="text-xs text-gray-400">thuộc</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="mt-4 bg-rose-50 rounded-xl p-4 text-xs text-rose-600">
        <i className="ri-lightbulb-line mr-1"></i>
        Mẹo: Dùng tab <strong>Quick Review</strong> để ôn nhanh từng nhóm, hoặc <strong>Spaced Rep</strong> để ôn thông minh theo thuật toán SM-2.
      </div>
    </div>
  );
}

