import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";

interface VocabItem {
  word: string;
  meaning: string;
  example: string;
}

function VocabTag({ v, highlight }: { v: VocabItem; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg px-2.5 py-1.5 border transition-all ${
        highlight
          ? "bg-app-accent-primary/10 border-app-accent-primary/30"
          : "bg-app-card/50 border-app-border"
      }`}
    >
      <span className={`text-[11px] font-bold ${highlight ? "text-app-accent-primary" : "text-white/70"}`}>
        {v.word}
      </span>
      <span className="text-white/35 text-[10px] ml-1.5">{v.meaning}</span>
    </div>
  );
}

function StarBadge({ stars }: { stars?: number }) {
  const s = stars ?? 0;
  if (s === 0) return <span className="text-app-text-muted text-xs">Chưa đánh giá</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          className={`text-xs ${i <= s ? "ri-star-fill text-app-accent-primary" : "ri-star-line text-white/15"}`}
        ></i>
      ))}
      <span className="text-app-text-secondary text-[10px] ml-1">
        {s === 5 ? "Xuất sắc" : s === 4 ? "Rất tốt" : s === 3 ? "Khá" : s === 2 ? "Trung bình" : "Yếu"}
      </span>
    </div>
  );
}

function LessonSelector({
  label,
  lessons,
  selected,
  onSelect,
  excludeRank,
}: {
  label: string;
  lessons: ApprovedLesson[];
  selected: ApprovedLesson | null;
  onSelect: (l: ApprovedLesson | null) => void;
  excludeRank?: number;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = lessons.filter((l) => l.song.rank !== excludeRank);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (l) =>
        l.song.title.toLowerCase().includes(q) ||
        l.song.artist.toLowerCase().includes(q)
    );
  }, [lessons, excludeRank, search]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 bg-app-bg border border-app-border hover:border-white/15 rounded-xl px-4 py-3 transition-colors cursor-pointer text-left"
      >
        {selected ? (
          <>
            <div className="w-8 h-8 flex items-center justify-center bg-app-accent-primary/10 rounded-lg flex-shrink-0">
              <i className="ri-music-2-line text-app-accent-primary text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm font-medium truncate">{selected.song.title}</p>
              <p className="text-white/35 text-xs">{selected.song.artist}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(null); }}
              className="text-app-text-muted hover:text-white/60 cursor-pointer"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          </>
        ) : (
          <>
            <div className="w-8 h-8 flex items-center justify-center bg-app-card/50 rounded-lg flex-shrink-0">
              <i className="ri-add-line text-app-text-muted text-sm"></i>
            </div>
            <span className="text-app-text-muted text-sm flex-1">{label}</span>
            <i className="ri-arrow-down-s-line text-app-text-muted"></i>
          </>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#1a1d27] border border-app-border rounded-xl overflow-hidden max-h-72 flex flex-col">
            <div className="p-2 border-b border-app-border">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm bài hát..."
                className="w-full bg-app-card/50 rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 ? (
                <div className="text-center py-6 text-app-text-muted text-xs">Không tìm thấy</div>
              ) : (
                filtered.map((l) => (
                  <button
                    key={l.song.rank}
                    onClick={() => { onSelect(l); setOpen(false); setSearch(""); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-app-card/50 transition-colors cursor-pointer text-left"
                  >
                    <span className="text-app-accent-primary/50 text-[10px] font-bold w-5">#{l.song.rank}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-xs font-medium truncate">{l.song.title}</p>
                      <p className="text-app-text-muted text-[10px]">{l.song.artist}</p>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <i
                          key={i}
                          className={`text-[9px] ${i <= (l.stars ?? 0) ? "ri-star-fill text-app-accent-primary" : "ri-star-line text-white/10"}`}
                        ></i>
                      ))}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  const [approvedLessons] = useLocalStorage<ApprovedLesson[]>("kts_melon_lessons", []);
  const [lessonA, setLessonA] = useState<ApprovedLesson | null>(null);
  const [lessonB, setLessonB] = useState<ApprovedLesson | null>(null);
  const [activeTab, setActiveTab] = useState<"vocab" | "story" | "overview">("overview");

  // Find shared and unique vocab
  const comparison = useMemo(() => {
    if (!lessonA || !lessonB) return null;
    const wordsA = new Set(lessonA.vocabulary.map((v) => v.word));
    const wordsB = new Set(lessonB.vocabulary.map((v) => v.word));
    const shared = lessonA.vocabulary.filter((v) => wordsB.has(v.word));
    const onlyA = lessonA.vocabulary.filter((v) => !wordsB.has(v.word));
    const onlyB = lessonB.vocabulary.filter((v) => !wordsA.has(v.word));
    const overlapPct = Math.round(
      (shared.length / Math.max(wordsA.size, wordsB.size, 1)) * 100
    );

    // Score: stars * 2 + vocab count * 0.5 + story length * 0.01
    const scoreA =
      (lessonA.stars ?? 0) * 2 +
      lessonA.vocabulary.length * 0.5 +
      lessonA.story.length * 0.01;
    const scoreB =
      (lessonB.stars ?? 0) * 2 +
      lessonB.vocabulary.length * 0.5 +
      lessonB.story.length * 0.01;

    const winner: "A" | "B" | "tie" =
      scoreA > scoreB + 0.5 ? "A" : scoreB > scoreA + 0.5 ? "B" : "tie";

    return { shared, onlyA, onlyB, overlapPct, scoreA, scoreB, winner };
  }, [lessonA, lessonB]);

  const canCompare = lessonA && lessonB;

  return (
    <DashboardLayout
      title="So sánh bài học"
      subtitle="Đặt 2 bài cạnh nhau — xem từ vựng trùng và chọn bài tốt hơn cho ebook"
    >
      {approvedLessons.length < 2 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-app-card/50 rounded-2xl mb-5">
            <i className="ri-layout-column-line text-app-text-muted text-3xl"></i>
          </div>
          <p className="text-app-text-secondary text-sm font-medium">Cần ít nhất 2 bài học đã duyệt</p>
          <p className="text-app-text-muted text-xs mt-1 mb-5">Hiện có {approvedLessons.length} bài — học thêm bài EPS để so sánh</p>
          <a
            href="/eps-lessons"
            className="flex items-center gap-2 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 text-app-accent-primary text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-book-open-line"></i>
            Đến bài học EPS
          </a>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-app-text-muted text-[10px] tracking-normal mb-2 flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-app-accent-primary/15 rounded text-app-accent-primary text-[10px] font-bold">A</span>
                Bài học thứ nhất
              </p>
              <LessonSelector
                label="Chọn bài học A..."
                lessons={approvedLessons}
                selected={lessonA}
                onSelect={setLessonA}
                excludeRank={lessonB?.song.rank}
              />
            </div>
            <div>
              <p className="text-app-text-muted text-[10px] tracking-normal mb-2 flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-sky-500/15 rounded text-sky-400 text-[10px] font-bold">B</span>
                Bài học thứ hai
              </p>
              <LessonSelector
                label="Chọn bài học B..."
                lessons={approvedLessons}
                selected={lessonB}
                onSelect={setLessonB}
                excludeRank={lessonA?.song.rank}
              />
            </div>
          </div>

          {!canCompare && (
            <div className="flex flex-col items-center justify-center py-16 bg-app-bg border border-app-border rounded-2xl text-center">
              <i className="ri-layout-column-line text-white/10 text-4xl mb-3"></i>
              <p className="text-app-text-muted text-sm">Chọn 2 bài học để bắt đầu so sánh</p>
              <p className="text-white/15 text-xs mt-1">Xem từ vựng trùng nhau, chất lượng và gợi ý bài tốt hơn</p>
            </div>
          )}

          {canCompare && comparison && (
            <>
              {/* Winner banner */}
              {comparison.winner !== "tie" ? (
                <div className={`flex items-center gap-4 rounded-2xl px-6 py-4 border ${
                  comparison.winner === "A"
                    ? "bg-app-accent-primary/5 border-app-accent-primary/20"
                    : "bg-sky-500/5 border-sky-500/20"
                }`}>
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${
                    comparison.winner === "A" ? "bg-app-accent-primary/15" : "bg-sky-500/15"
                  }`}>
                    <i className={`ri-trophy-fill text-lg ${comparison.winner === "A" ? "text-app-accent-primary" : "text-sky-400"}`}></i>
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${comparison.winner === "A" ? "text-app-accent-primary" : "text-sky-400"}`}>
                      Bài {comparison.winner} được gợi ý cho ebook
                    </p>
                    <p className="text-app-text-secondary text-xs mt-0.5">
                      {comparison.winner === "A"
                        ? `"${lessonA.song.title}" — điểm tổng hợp cao hơn (sao, từ vựng, độ dài truyện)`
                        : `"${lessonB.song.title}" — điểm tổng hợp cao hơn (sao, từ vựng, độ dài truyện)`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-app-text-muted">
                    <span className={`font-bold ${comparison.winner === "A" ? "text-app-accent-primary" : "text-app-text-secondary"}`}>
                      A: {comparison.scoreA.toFixed(1)}đ
                    </span>
                    <span>vs</span>
                    <span className={`font-bold ${comparison.winner === "B" ? "text-sky-400" : "text-app-text-secondary"}`}>
                      B: {comparison.scoreB.toFixed(1)}đ
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-app-surface/50 border border-app-border rounded-2xl px-6 py-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-app-card/50 rounded-xl flex-shrink-0">
                    <i className="ri-scales-3-line text-app-text-secondary text-lg"></i>
                  </div>
                  <div>
                    <p className="text-white/60 font-semibold text-sm">Hai bài tương đương nhau</p>
                    <p className="text-app-text-muted text-xs mt-0.5">Điểm chênh lệch không đáng kể — chọn theo cảm nhận cá nhân</p>
                  </div>
                </div>
              )}

              {/* Overlap stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Từ vựng trùng", value: comparison.shared.length, color: "text-app-accent-primary", icon: "ri-links-line" },
                  { label: "Chỉ có ở A", value: comparison.onlyA.length, color: "text-app-accent-primary", icon: "ri-subtract-line" },
                  { label: "Chỉ có ở B", value: comparison.onlyB.length, color: "text-sky-400", icon: "ri-subtract-line" },
                  { label: "Tỷ lệ trùng", value: `${comparison.overlapPct}%`, color: comparison.overlapPct > 50 ? "text-amber-400" : "text-app-accent-success", icon: "ri-percent-line" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-app-bg border border-app-border rounded-xl p-4 text-center">
                    <div className="w-7 h-7 flex items-center justify-center bg-app-card/50 rounded-lg mx-auto mb-2">
                      <i className={`${stat.icon} ${stat.color} text-sm`}></i>
                    </div>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-app-text-muted text-[10px] mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-app-bg border border-app-border rounded-xl p-1 w-fit">
                {([
                  ["overview", "Tổng quan", "ri-layout-grid-line"],
                  ["vocab", "Từ vựng", "ri-translate-2"],
                  ["story", "Truyện Chêm", "ri-book-open-line"],
                ] as const).map(([tab, label, icon]) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab
                        ? "bg-app-card/70 text-white"
                        : "text-white/35 hover:text-white/60"
                    }`}
                  >
                    <i className={`${icon} text-[11px]`}></i>
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-2 gap-4">
                  {([["A", lessonA, "text-app-accent-primary", "border-app-accent-primary/15", "bg-app-accent-primary/5"], ["B", lessonB, "text-sky-400", "border-sky-500/15", "bg-sky-500/5"]] as const).map(
                    ([label, lesson, color, border, bg]) => (
                      <div key={label} className={`${bg} border ${border} rounded-2xl p-5 space-y-4`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold ${color} bg-app-card/50`}>
                            {label}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/80 font-semibold text-sm truncate">{lesson.song.title}</p>
                            <p className="text-white/35 text-xs">{lesson.song.artist}</p>
                          </div>
                          {comparison.winner === label && (
                            <i className="ri-trophy-fill text-app-accent-primary text-base"></i>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-app-text-secondary text-xs">Đánh giá</span>
                            <StarBadge stars={lesson.stars} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-app-text-secondary text-xs">Từ vựng</span>
                            <span className={`text-xs font-bold ${color}`}>{lesson.vocabulary.length} từ</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-app-text-secondary text-xs">Độ dài truyện</span>
                            <span className="text-white/60 text-xs">{lesson.story.length} ký tự</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-app-text-secondary text-xs">Thể loại</span>
                            <span className="text-white/50 text-xs">{lesson.song.genre || "—"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-app-text-secondary text-xs">Đã đăng</span>
                            <span className={`text-xs ${lesson.publishedAt ? "text-app-accent-success" : "text-app-text-muted"}`}>
                              {lesson.publishedAt ? "Đã đăng" : "Chưa đăng"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-app-text-secondary text-xs">Điểm tổng hợp</span>
                            <span className={`text-sm font-bold ${color}`}>
                              {label === "A" ? comparison.scoreA.toFixed(1) : comparison.scoreB.toFixed(1)}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {activeTab === "vocab" && (
                <div className="space-y-4">
                  {/* Shared vocab */}
                  {comparison.shared.length > 0 && (
                    <div className="bg-app-bg border border-app-border rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 flex items-center justify-center bg-app-accent-primary/10 rounded-lg">
                          <i className="ri-links-line text-app-accent-primary text-xs"></i>
                        </div>
                        <p className="text-white/60 text-xs font-semibold">
                          Từ vựng trùng nhau ({comparison.shared.length} từ)
                        </p>
                        <span className="text-[10px] bg-app-accent-primary/10 text-app-accent-primary px-2 py-0.5 rounded-full">
                          Xuất hiện ở cả 2 bài
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {comparison.shared.map((v) => (
                          <VocabTag key={v.word} v={v} highlight />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Side by side unique vocab */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-app-bg border border-app-accent-primary/10 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-5 h-5 flex items-center justify-center bg-app-accent-primary/15 rounded text-app-accent-primary text-[10px] font-bold">A</span>
                        <p className="text-white/50 text-xs">Chỉ có ở bài A ({comparison.onlyA.length} từ)</p>
                      </div>
                      {comparison.onlyA.length === 0 ? (
                        <p className="text-app-text-muted text-xs">Không có từ riêng</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {comparison.onlyA.map((v) => (
                            <VocabTag key={v.word} v={v} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="bg-app-bg border border-sky-500/10 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-5 h-5 flex items-center justify-center bg-sky-500/15 rounded text-sky-400 text-[10px] font-bold">B</span>
                        <p className="text-white/50 text-xs">Chỉ có ở bài B ({comparison.onlyB.length} từ)</p>
                      </div>
                      {comparison.onlyB.length === 0 ? (
                        <p className="text-app-text-muted text-xs">Không có từ riêng</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {comparison.onlyB.map((v) => (
                            <VocabTag key={v.word} v={v} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "story" && (
                <div className="grid grid-cols-2 gap-4">
                  {([["A", lessonA, "border-app-accent-primary/10", "text-app-accent-primary"] , ["B", lessonB, "border-sky-500/10", "text-sky-400"]] as const).map(
                    ([label, lesson, border, color]) => (
                      <div key={label} className={`bg-app-bg border ${border} rounded-2xl p-5`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`w-5 h-5 flex items-center justify-center bg-app-card/50 rounded text-[10px] font-bold ${color}`}>
                            {label}
                          </span>
                          <p className="text-white/50 text-xs font-medium truncate">{lesson.song.title}</p>
                          <span className="text-app-text-muted text-[10px] ml-auto flex-shrink-0">{lesson.story.length} ký tự</span>
                        </div>
                        <p className="text-white/60 text-xs leading-6 whitespace-pre-wrap max-h-80 overflow-y-auto">
                          {lesson.story}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

