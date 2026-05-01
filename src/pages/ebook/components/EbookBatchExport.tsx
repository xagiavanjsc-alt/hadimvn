import { useState, useMemo } from "react";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";
import type { EbookMeta } from "@/pages/ebook/page";
import type { EbookTemplate } from "./EbookTemplates";

interface Props {
  lessons: ApprovedLesson[];
  meta: EbookMeta;
  template: EbookTemplate;
  onExportGroup: (groupLessons: ApprovedLesson[], groupName: string) => void;
}

type GroupBy = "artist" | "genre" | "stars";

export default function EbookBatchExport({ lessons, meta, template, onExportGroup }: Props) {
  const [open, setOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>("artist");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map: Record<string, ApprovedLesson[]> = {};
    lessons.forEach((l) => {
      let key = "";
      if (groupBy === "artist") key = l.song.artist || "Không rõ";
      else if (groupBy === "genre") key = l.song.genre || "Khác";
      else if (groupBy === "stars") {
        const s = l.stars ?? 0;
        key = s >= 5 ? "⭐⭐⭐⭐⭐ 5 sao" : s === 4 ? "⭐⭐⭐⭐ 4 sao" : s === 3 ? "⭐⭐⭐ 3 sao" : "Chưa đánh giá";
      }
      if (!map[key]) map[key] = [];
      map[key].push(l);
    });
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [lessons, groupBy]);

  const toggleGroup = (key: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(groups.map(([k]) => k)));
  const clearAll = () => setSelected(new Set());

  const handleExportSelected = async () => {
    const toExport = groups.filter(([k]) => selected.has(k));
    for (const [groupName, groupLessons] of toExport) {
      setExporting(groupName);
      await new Promise(r => setTimeout(r, 300));
      onExportGroup(groupLessons, groupName);
    }
    setExporting(null);
  };

  if (lessons.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer border border-white/8"
      >
        <i className="ri-stack-line"></i>
        Batch xuất
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-[#e8c84a]/10 rounded-lg">
                  <i className="ri-stack-line text-[#e8c84a] text-base"></i>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Batch xuất PDF</h3>
                  <p className="text-white/40 text-xs">Xuất nhiều ebook theo nhóm cùng lúc</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white/60 cursor-pointer">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            {/* Group by selector */}
            <div className="px-6 py-4 border-b border-white/5 flex-shrink-0">
              <p className="text-white/40 text-xs tracking-wider mb-3">Nhóm theo</p>
              <div className="flex gap-2">
                {([
                  { value: "artist", label: "Nghệ sĩ", icon: "ri-user-voice-line" },
                  { value: "genre", label: "Thể loại", icon: "ri-music-2-line" },
                  { value: "stars", label: "Đánh sao", icon: "ri-star-line" },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setGroupBy(opt.value); setSelected(new Set()); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                      groupBy === opt.value
                        ? "bg-[#e8c84a] text-[#0f1117]"
                        : "bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/8"
                    }`}
                  >
                    <i className={opt.icon}></i>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Groups list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/30 text-xs">{groups.length} nhóm · {lessons.length} bài tổng</p>
                <div className="flex items-center gap-2">
                  <button onClick={selectAll} className="text-[#e8c84a]/70 hover:text-[#e8c84a] text-xs cursor-pointer whitespace-nowrap">Chọn tất cả</button>
                  <span className="text-white/20 text-xs">·</span>
                  <button onClick={clearAll} className="text-white/30 hover:text-white/60 text-xs cursor-pointer whitespace-nowrap">Bỏ chọn</button>
                </div>
              </div>

              {groups.map(([groupName, groupLessons]) => {
                const isSelected = selected.has(groupName);
                const isExporting = exporting === groupName;
                return (
                  <div
                    key={groupName}
                    onClick={() => toggleGroup(groupName)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#e8c84a]/8 border-[#e8c84a]/30"
                        : "bg-white/3 border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className={`w-5 h-5 flex items-center justify-center rounded border-2 transition-colors flex-shrink-0 ${
                      isSelected ? "bg-[#e8c84a] border-[#e8c84a]" : "border-white/20"
                    }`}>
                      {isSelected && <i className="ri-check-line text-[#0f1117] text-[10px]"></i>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-white/70"}`}>{groupName}</p>
                      <p className="text-white/30 text-xs mt-0.5">{groupLessons.length} bài học</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Stars preview */}
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => {
                          const avgStars = groupLessons.reduce((sum, l) => sum + (l.stars ?? 0), 0) / groupLessons.length;
                          return <i key={s} className={`text-[9px] ${s <= Math.round(avgStars) ? "ri-star-fill text-[#e8c84a]" : "ri-star-line text-white/15"}`}></i>;
                        })}
                      </div>
                      {isExporting && <i className="ri-loader-4-line animate-spin text-[#e8c84a] text-sm"></i>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5 flex-shrink-0 flex items-center justify-between">
              <div className="text-white/30 text-xs">
                {selected.size > 0 ? (
                  <span className="text-[#e8c84a]">{selected.size} nhóm đã chọn · {groups.filter(([k]) => selected.has(k)).reduce((sum, [, l]) => sum + l.length, 0)} bài</span>
                ) : "Chọn nhóm để xuất"}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setOpen(false)} className="px-4 py-2 text-white/40 hover:text-white/70 text-sm cursor-pointer whitespace-nowrap">Hủy</button>
                <button
                  onClick={handleExportSelected}
                  disabled={selected.size === 0 || !!exporting}
                  className="flex items-center gap-2 bg-[#e8c84a] hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-[#0f1117] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                >
                  {exporting ? (
                    <><i className="ri-loader-4-line animate-spin"></i>Đang xuất...</>
                  ) : (
                    <><i className="ri-file-pdf-2-line"></i>Xuất {selected.size} ebook</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
