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
        key = s >= 5 ? "????? 5 sao" : s === 4 ? "???? 4 sao" : s === 3 ? "??? 3 sao" : "Chua dánh giá";
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
        className="flex items-center gap-2 bg-app-card/50 hover:bg-app-card/70 text-white/60 hover:text-white/90 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer border border-app-border"
      >
        <i className="ri-stack-line"></i>
        Batch xu?t
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-app-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-app-accent-primary/10 rounded-lg">
                  <i className="ri-stack-line text-app-accent-primary text-base"></i>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Batch xu?t PDF</h3>
                  <p className="text-app-text-secondary text-xs">Xu?t nhi?u ebook theo nhóm cùng lúc</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center text-app-text-muted hover:text-white/60 cursor-pointer">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            {/* Group by selector */}
            <div className="px-6 py-4 border-b border-app-border flex-shrink-0">
              <p className="text-app-text-secondary text-xs tracking-normal mb-3">Nhóm theo</p>
              <div className="flex gap-2">
                {([
                  { value: "artist", label: "Ngh? si", icon: "ri-user-voice-line" },
                  { value: "genre", label: "Th? lo?i", icon: "ri-music-2-line" },
                  { value: "stars", label: "Ðánh sao", icon: "ri-star-line" },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setGroupBy(opt.value); setSelected(new Set()); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                      groupBy === opt.value
                        ? "bg-app-accent-primary text-app-bg"
                        : "bg-app-card/50 text-white/50 hover:text-white/80 hover:bg-white/8"
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
                <p className="text-app-text-muted text-xs">{groups.length} nhóm · {lessons.length} bài t?ng</p>
                <div className="flex items-center gap-2">
                  <button onClick={selectAll} className="text-app-accent-primary/70 hover:text-app-accent-primary text-xs cursor-pointer whitespace-nowrap">Ch?n t?t c?</button>
                  <span className="text-app-text-muted text-xs">·</span>
                  <button onClick={clearAll} className="text-app-text-muted hover:text-white/60 text-xs cursor-pointer whitespace-nowrap">B? ch?n</button>
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
                        ? "bg-app-accent-primary/8 border-app-accent-primary/30"
                        : "bg-app-surface/50 border-app-border hover:border-white/15"
                    }`}
                  >
                    <div className={`w-5 h-5 flex items-center justify-center rounded border-2 transition-colors flex-shrink-0 ${
                      isSelected ? "bg-app-accent-primary border-app-accent-primary" : "border-white/20"
                    }`}>
                      {isSelected && <i className="ri-check-line text-app-bg text-[10px]"></i>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-white/70"}`}>{groupName}</p>
                      <p className="text-app-text-muted text-xs mt-0.5">{groupLessons.length} bài h?c</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Stars preview */}
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => {
                          const avgStars = groupLessons.reduce((sum, l) => sum + (l.stars ?? 0), 0) / groupLessons.length;
                          return <i key={s} className={`text-[9px] ${s <= Math.round(avgStars) ? "ri-star-fill text-app-accent-primary" : "ri-star-line text-white/15"}`}></i>;
                        })}
                      </div>
                      {isExporting && <i className="ri-loader-4-line animate-spin text-app-accent-primary text-sm"></i>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-app-border flex-shrink-0 flex items-center justify-between">
              <div className="text-app-text-muted text-xs">
                {selected.size > 0 ? (
                  <span className="text-app-accent-primary">{selected.size} nhóm dã ch?n · {groups.filter(([k]) => selected.has(k)).reduce((sum, [, l]) => sum + l.length, 0)} bài</span>
                ) : "Ch?n nhóm d? xu?t"}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setOpen(false)} className="px-4 py-2 text-app-text-secondary hover:text-white/70 text-sm cursor-pointer whitespace-nowrap">H?y</button>
                <button
                  onClick={handleExportSelected}
                  disabled={selected.size === 0 || !!exporting}
                  className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-app-bg font-bold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                >
                  {exporting ? (
                    <><i className="ri-loader-4-line animate-spin"></i>Ðang xu?t...</>
                  ) : (
                    <><i className="ri-file-pdf-2-line"></i>Xu?t {selected.size} ebook</>
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
