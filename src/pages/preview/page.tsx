import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { EbookSeries } from "@/pages/series/page";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";

// ─── Preview Page ─────────────────────────────────────────────────────────
export default function PreviewPage() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const [seriesList] = useLocalStorage<EbookSeries[]>("kts_series_list", []);
  const [approvedLessons] = useLocalStorage<ApprovedLesson[]>("kts_melon_lessons", []);
  const [activeLesson, setActiveLesson] = useState(0);
  const [copied, setCopied] = useState(false);

  const series = useMemo(
    () => seriesList.find((s) => s.id === seriesId),
    [seriesList, seriesId]
  );

  const lessons = useMemo(() => {
    if (!series) return [];
    return series.lessonRanks
      .map((r) => approvedLessons.find((l) => l.song.rank === r))
      .filter(Boolean) as ApprovedLesson[];
  }, [series, approvedLessons]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!series) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-2xl mb-5">
          <i className="ri-book-open-line text-white/20 text-3xl"></i>
        </div>
        <h1 className="text-white font-bold text-xl mb-2">Không tìm thấy ebook</h1>
        <p className="text-white/40 text-sm mb-6">Link này không còn hợp lệ hoặc ebook đã bị xóa.</p>
        <Link
          to="/"
          className="flex items-center gap-2 bg-[#e8c84a] text-[#0f1117] font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap"
        >
          <i className="ri-home-line"></i>
          Về trang chủ
        </Link>
      </div>
    );
  }

  const accent = series.coverAccent;
  const bg = series.coverColor;
  const currentLesson = lessons[activeLesson];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0d0f14" }}>
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-white/5" style={{ backgroundColor: "#0d0f14" }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ backgroundColor: `${accent}20` }}
            >
              <i className="ri-book-2-line text-sm" style={{ color: accent }}></i>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{series.name}</p>
              <p className="text-white/30 text-[10px]">{lessons.length} bài học · Xem thử miễn phí</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/50 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className={copied ? "ri-check-line text-emerald-400" : "ri-link-m text-xs"}></i>
              {copied ? "Đã copy!" : "Copy link"}
            </button>
            {series.price && (
              <div
                className="flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-xl cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: accent, color: bg }}
              >
                <i className="ri-shopping-cart-line text-xs"></i>
                Mua — {series.price}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-[280px_1fr] gap-6">
          {/* Left: Table of contents */}
          <div className="space-y-4">
            {/* Series info card */}
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{ backgroundColor: bg }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: accent }}
              />
              <div
                className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-normal px-2.5 py-1 rounded-full mb-3"
                style={{ backgroundColor: `${accent}20`, color: accent }}
              >
                <i className="ri-eye-line text-[10px]"></i>
                Xem thử
              </div>
              <h2 className="font-bold text-base leading-tight mb-2" style={{ color: accent }}>
                {series.name}
              </h2>
              {series.description && (
                <p className="text-white/40 text-xs leading-relaxed mb-3">{series.description}</p>
              )}
              {series.tags && series.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {series.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${accent}15`, color: accent }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {series.price && (
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-white/40 text-xs">Giá ebook</span>
                  <span className="font-bold text-sm" style={{ color: accent }}>{series.price}</span>
                </div>
              )}
            </div>

            {/* Lesson list */}
            <div className="bg-[#0f1117] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-white/60 text-xs font-semibold">Danh sách bài học</p>
              </div>
              <div className="divide-y divide-white/5">
                {lessons.map((lesson, i) => {
                  const isActive = i === activeLesson;
                  const isLocked = i >= 2; // First 2 lessons free
                  return (
                    <button
                      key={lesson.song.rank}
                      onClick={() => !isLocked && setActiveLesson(i)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isActive
                          ? "bg-white/5"
                          : isLocked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-white/3 cursor-pointer"
                      }`}
                    >
                      <div
                        className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 text-[10px] font-bold"
                        style={{
                          backgroundColor: isActive ? `${accent}20` : "rgba(255,255,255,0.05)",
                          color: isActive ? accent : "rgba(255,255,255,0.3)",
                        }}
                      >
                        {isLocked ? <i className="ri-lock-line text-[10px]"></i> : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-medium truncate ${
                            isActive ? "text-white" : "text-white/50"
                          }`}
                        >
                          {lesson.song.title}
                        </p>
                        <p className="text-white/25 text-[10px] truncate">{lesson.song.artist}</p>
                      </div>
                      {isActive && (
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: accent }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Locked notice */}
            {lessons.length > 2 && (
              <div
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: `${accent}08`, border: `1px solid ${accent}20` }}
              >
                <i className="ri-lock-line text-lg mb-2 block" style={{ color: accent }}></i>
                <p className="text-xs font-semibold mb-1" style={{ color: accent }}>
                  {lessons.length - 2} bài học bị khóa
                </p>
                <p className="text-white/30 text-[10px] leading-relaxed mb-3">
                  Mua ebook để mở khóa toàn bộ {lessons.length} bài học
                </p>
                {series.price && (
                  <div
                    className="w-full py-2 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap"
                    style={{ backgroundColor: accent, color: bg }}
                  >
                    Mua ngay — {series.price}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Lesson content */}
          <div className="space-y-4">
            {currentLesson ? (
              <>
                {/* Lesson header */}
                <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-normal px-2.5 py-1 rounded-full mb-3"
                        style={{ backgroundColor: `${accent}15`, color: accent }}
                      >
                        Bài {activeLesson + 1} / {lessons.length}
                      </div>
                      <h2 className="text-white font-bold text-xl leading-tight">
                        {currentLesson.song.title}
                      </h2>
                      <p className="text-white/40 text-sm mt-1">{currentLesson.song.artist}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <i
                          key={s}
                          className={s <= (currentLesson.stars ?? 0) ? "ri-star-fill text-sm" : "ri-star-line text-sm"}
                          style={{ color: s <= (currentLesson.stars ?? 0) ? accent : "rgba(255,255,255,0.15)" }}
                        ></i>
                      ))}
                    </div>
                  </div>

                  {/* Story preview */}
                  {currentLesson.story && (
                    <div>
                      <p className="text-white/30 text-[10px] tracking-normal font-semibold mb-3">
                        Truyện chêm
                      </p>
                      <div className="bg-white/3 rounded-xl p-4 border border-white/5">
                        <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">
                          {currentLesson.story}
                        </p>
                        {currentLesson.story.length > 300 && (
                          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                            <p className="text-white/25 text-xs">Xem đầy đủ trong ebook</p>
                            <i className="ri-lock-line text-white/20 text-xs"></i>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Vocabulary preview */}
                {currentLesson.vocab && currentLesson.vocab.length > 0 && (
                  <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-6">
                    <p className="text-white/30 text-[10px] tracking-normal font-semibold mb-4">
                      Từ vựng cốt lõi ({currentLesson.vocab.length} từ)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {currentLesson.vocab.slice(0, 4).map((v, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl border border-white/5 bg-white/3"
                        >
                          <p className="font-bold text-sm mb-0.5" style={{ color: accent }}>
                            {v.word}
                          </p>
                          {v.reading && (
                            <p className="text-white/40 text-[10px] mb-1">{v.reading}</p>
                          )}
                          <p className="text-white/60 text-xs">{v.meaning}</p>
                        </div>
                      ))}
                      {currentLesson.vocab.length > 4 && (
                        <div className="p-3 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                          <i className="ri-lock-line text-white/20 text-lg mb-1"></i>
                          <p className="text-white/25 text-[10px]">+{currentLesson.vocab.length - 4} từ nữa</p>
                          <p className="text-white/15 text-[9px]">Trong ebook đầy đủ</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Grammar preview */}
                {currentLesson.grammar && currentLesson.grammar.length > 0 && (
                  <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-6">
                    <p className="text-white/30 text-[10px] tracking-normal font-semibold mb-4">
                      Ngữ pháp ({currentLesson.grammar.length} điểm)
                    </p>
                    <div className="space-y-3">
                      {currentLesson.grammar.slice(0, 2).map((g, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-white/5 bg-white/3"
                        >
                          <p className="font-bold text-sm mb-1" style={{ color: accent }}>
                            {g.pattern}
                          </p>
                          <p className="text-white/50 text-xs leading-relaxed">{g.explanation}</p>
                          {g.example && (
                            <p className="text-white/30 text-xs mt-2 italic">{g.example}</p>
                          )}
                        </div>
                      ))}
                      {currentLesson.grammar.length > 2 && (
                        <div className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-white/10">
                          <i className="ri-lock-line text-white/20 text-sm"></i>
                          <p className="text-white/25 text-xs">
                            +{currentLesson.grammar.length - 2} điểm ngữ pháp nữa trong ebook đầy đủ
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div
                  className="rounded-2xl p-6 text-center"
                  style={{ backgroundColor: bg, border: `1px solid ${accent}20` }}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-2xl mx-auto mb-4"
                    style={{ backgroundColor: `${accent}20` }}
                  >
                    <i className="ri-book-2-line text-xl" style={{ color: accent }}></i>
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: accent }}>
                    Thích nội dung này?
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-5 max-w-md mx-auto">
                    Mua ebook đầy đủ để nhận toàn bộ {lessons.length} bài học, bao gồm truyện chêm hoàn chỉnh, từ vựng và ngữ pháp chi tiết.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    {series.price && (
                      <div
                        className="flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl cursor-pointer whitespace-nowrap"
                        style={{ backgroundColor: accent, color: bg }}
                      >
                        <i className="ri-shopping-cart-line"></i>
                        Mua ngay — {series.price}
                      </div>
                    )}
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 font-medium text-sm px-5 py-3 rounded-xl border cursor-pointer whitespace-nowrap transition-colors hover:bg-white/5"
                      style={{ borderColor: `${accent}30`, color: accent }}
                    >
                      <i className="ri-share-line"></i>
                      Chia sẻ
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-[#0f1117] border border-white/5 rounded-2xl flex flex-col items-center justify-center py-24 text-center">
                <i className="ri-book-open-line text-white/10 text-4xl mb-3"></i>
                <p className="text-white/30 text-sm">Series này chưa có bài học nào</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <p className="text-white/20 text-xs">© 2026 · Hàn Việt KTS · Tạo bởi KTS Ebook Builder</p>
          <div className="flex items-center gap-4">
            <span className="text-white/20 text-xs">Xem thử miễn phí — 2 bài đầu</span>
          </div>
        </div>
      </div>
    </div>
  );
}
