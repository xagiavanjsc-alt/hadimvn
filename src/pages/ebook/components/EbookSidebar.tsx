import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";

interface Props {
  lessons: ApprovedLesson[];
  selectedRanks: number[];
  onToggle: (rank: number) => void;
  onSelectAll: () => void;
  onSelectHighQuality: () => void;
  onClearAll: () => void;
  onMoveUp: (rank: number) => void;
  onMoveDown: (rank: number) => void;
}

function StarBadge({ stars }: { stars: number }) {
  if (!stars) return null;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-medium ${stars >= 4 ? "text-[#e8c84a]" : "text-white/30"}`}>
      <i className="ri-star-fill text-[9px]"></i>
      {stars}
    </span>
  );
}

export default function EbookSidebar({
  lessons,
  selectedRanks,
  onToggle,
  onSelectAll,
  onSelectHighQuality,
  onClearAll,
  onMoveUp,
  onMoveDown,
}: Props) {
  const highQualityCount = lessons.filter((l) => (l.stars ?? 0) >= 4).length;

  // Ordered selected lessons
  const orderedSelected = selectedRanks
    .map((r) => lessons.find((l) => l.song.rank === r))
    .filter(Boolean) as ApprovedLesson[];

  const unselected = lessons.filter((l) => !selectedRanks.includes(l.song.rank));

  return (
    <div className="space-y-4">
      {/* Quick actions */}
      <div className="bg-[#0f1117] border border-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/50 text-xs font-medium tracking-normal">Chọn nhanh</p>
          <span className="text-white/25 text-xs">{selectedRanks.length}/{lessons.length} đã chọn</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onSelectAll}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-checkbox-multiple-line"></i>
            Chọn tất cả ({lessons.length})
          </button>
          {highQualityCount > 0 && (
            <button
              onClick={onSelectHighQuality}
              className="flex items-center gap-1.5 bg-[#e8c84a]/10 hover:bg-[#e8c84a]/20 text-[#e8c84a] text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-star-fill text-[10px]"></i>
              Chỉ 4-5 sao ({highQualityCount})
            </button>
          )}
          {selectedRanks.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-close-line"></i>
              Bỏ chọn tất cả
            </button>
          )}
        </div>
      </div>

      {/* Selected lessons — ordered */}
      {orderedSelected.length > 0 && (
        <div className="bg-[#0f1117] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 flex items-center justify-center bg-[#e8c84a]/10 rounded">
              <i className="ri-sort-asc text-[#e8c84a] text-xs"></i>
            </div>
            <p className="text-white/70 text-xs font-semibold">Thứ tự trong ebook</p>
            <span className="text-white/25 text-[10px] ml-auto">Kéo để sắp xếp</span>
          </div>
          <div className="space-y-1.5">
            {orderedSelected.map((lesson, idx) => (
              <div
                key={lesson.song.rank}
                className="flex items-center gap-2 bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-lg px-3 py-2.5 group"
              >
                <span className="text-[#e8c84a]/60 text-[10px] font-bold w-5 text-center">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-xs font-medium truncate">{lesson.song.title}</p>
                  <p className="text-white/30 text-[10px]">{lesson.song.artist}</p>
                </div>
                <StarBadge stars={lesson.stars ?? 0} />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onMoveUp(lesson.song.rank)}
                    disabled={idx === 0}
                    className="w-5 h-5 flex items-center justify-center text-white/30 hover:text-white/70 disabled:opacity-20 cursor-pointer transition-colors"
                  >
                    <i className="ri-arrow-up-s-line text-xs"></i>
                  </button>
                  <button
                    onClick={() => onMoveDown(lesson.song.rank)}
                    disabled={idx === orderedSelected.length - 1}
                    className="w-5 h-5 flex items-center justify-center text-white/30 hover:text-white/70 disabled:opacity-20 cursor-pointer transition-colors"
                  >
                    <i className="ri-arrow-down-s-line text-xs"></i>
                  </button>
                  <button
                    onClick={() => onToggle(lesson.song.rank)}
                    className="w-5 h-5 flex items-center justify-center text-white/20 hover:text-red-400 cursor-pointer transition-colors"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All lessons to pick from */}
      <div className="bg-[#0f1117] border border-white/5 rounded-xl p-4">
        <p className="text-white/50 text-xs font-medium tracking-normal mb-3">
          Tất cả bài học ({lessons.length})
        </p>
        <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
          {lessons.map((lesson) => {
            const isSelected = selectedRanks.includes(lesson.song.rank);
            const stars = lesson.stars ?? 0;
            return (
              <button
                key={lesson.song.rank}
                onClick={() => onToggle(lesson.song.rank)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer text-left ${
                  isSelected
                    ? "bg-[#e8c84a]/8 border-[#e8c84a]/20"
                    : "bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10"
                }`}
              >
                <div className={`w-4 h-4 flex items-center justify-center rounded border flex-shrink-0 transition-all ${
                  isSelected ? "bg-[#e8c84a] border-[#e8c84a]" : "border-white/20"
                }`}>
                  {isSelected && <i className="ri-check-line text-[#0f1117] text-[10px]"></i>}
                </div>
                <span className="text-white/30 text-[10px] w-5">#{lesson.song.rank}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${isSelected ? "text-white/90" : "text-white/60"}`}>
                    {lesson.song.title}
                  </p>
                  <p className="text-white/25 text-[10px]">{lesson.song.artist}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {stars > 0 && <StarBadge stars={stars} />}
                  {lesson.publishedAt && (
                    <span className="text-emerald-400/50 text-[9px]">
                      <i className="ri-checkbox-circle-fill"></i>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
