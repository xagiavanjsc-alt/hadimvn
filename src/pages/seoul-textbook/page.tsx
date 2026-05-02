import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import { supabase } from "@/lib/supabase";
import {
  seoulBooks,
  type SeoulBook,
  type SeoulLesson,
} from "@/mocks/seoulTextbook";

// ─── Helpers ──────────────────────────────────────────────────────────────
function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

const LEVEL_GROUP_LABELS: Record<number, string> = {
  1: "Sơ cấp",
  2: "Sơ-Trung cấp",
  3: "Trung cấp",
  4: "Cao cấp",
};

// ─── Book Card ────────────────────────────────────────────────────────────
function BookCard({
  book,
  completedCount,
  isSelected,
  onClick,
}: {
  book: SeoulBook;
  completedCount: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const progress = Math.round((completedCount / book.totalLessons) * 100);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 md:p-5 rounded-2xl border transition-all cursor-pointer group ${isSelected ? "border-white/25 bg-white/5" : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4"}`}
    >
      <div className="h-1.5 rounded-full mb-3 md:mb-4" style={{ background: `linear-gradient(to right, ${book.color}60, ${book.color}20)` }} />

      <div className="flex items-start justify-between mb-2 md:mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: `${book.color}20`, color: book.color }}>
              {book.level}
            </span>
            <span className="text-[10px] text-white/30">{book.cefrLevel}</span>
          </div>
          <p className="text-white font-bold text-sm md:text-base truncate">{book.name}</p>
          <p className="text-white/30 text-[10px] md:text-xs mt-0.5">{LEVEL_GROUP_LABELS[book.levelGroup]}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-base md:text-lg font-bold" style={{ color: book.color }}>{progress}%</p>
          <p className="text-white/30 text-[10px]">{completedCount}/{book.totalLessons}</p>
        </div>
      </div>

      <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2 hidden md:block">{book.description}</p>

      <div className="flex items-center justify-between gap-2 mb-3 bg-white/3 rounded-lg p-2 md:hidden">
        {[
          { label: "Bài", value: book.totalLessons },
          { label: "Từ", value: book.totalVocab },
          { label: "NP", value: book.totalGrammar },
        ].map(s => (
          <div key={s.label} className="text-center flex-1">
            <p className="text-white font-bold text-xs">{s.value}</p>
            <p className="text-white/30 text-[9px]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 md:gap-2 mb-3 hidden sm:grid">
        {[
          { label: "Bài", value: book.totalLessons },
          { label: "Từ", value: book.totalVocab },
          { label: "NP", value: book.totalGrammar },
        ].map(s => (
          <div key={s.label} className="bg-white/3 rounded-lg p-1.5 md:p-2 text-center">
            <p className="text-white font-bold text-xs md:text-sm">{s.value}</p>
            <p className="text-white/30 text-[9px]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: book.color }} />
      </div>
    </button>
  );
}

// ─── Lesson Row ───────────────────────────────────────────────────────────
function LessonRow({
  lesson,
  bookColor,
  isCompleted,
  onClick,
}: {
  lesson: SeoulLesson;
  bookColor: string;
  isCompleted: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border transition-all cursor-pointer group ${isCompleted ? "border-emerald-500/20 bg-emerald-500/3 hover:border-emerald-500/30" : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4"}`}
    >
      <div className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl flex-shrink-0 text-sm font-bold ${isCompleted ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/30"}`}>
        {isCompleted ? <i className="ri-checkbox-circle-fill text-base md:text-lg"></i> : lesson.lessonNumber}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs md:text-sm font-semibold truncate ${isCompleted ? "text-white/80" : "text-white/70"} group-hover:text-white transition-colors`}>
          {lesson.titleVi}
        </p>
        <p className="text-white/30 text-[10px] md:text-xs truncate mt-0.5">{lesson.title}</p>
        <div className="flex items-center gap-2 md:gap-3 mt-1">
          <span className="text-[9px] text-white/25 flex items-center gap-0.5">
            <i className="ri-translate-2 text-xs"></i>{lesson.vocabulary.length} từ
          </span>
          <span className="text-[9px] text-white/25 flex items-center gap-0.5">
            <i className="ri-book-2-line text-xs"></i>{lesson.grammarPoints.length} NP
          </span>
        </div>
      </div>
      <i className="ri-arrow-right-s-line text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0"></i>
    </button>
  );
}

// ─── Lesson Detail Modal ──────────────────────────────────────────────────
function LessonModal({
  lesson,
  book,
  onClose,
  onComplete,
  isCompleted,
}: {
  lesson: SeoulLesson;
  book: SeoulBook;
  onClose: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}) {
  const [tab, setTab] = useState<"vocab" | "grammar" | "dialogue">("vocab");
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [grammarOpen, setGrammarOpen] = useState<Record<number, boolean>>({ 0: true });
  const { dbVocab, loading: vocabLoading } = useSupabaseVocab(lesson.id);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f1117] border border-white/10 rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl max-h-[92vh] md:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-4 md:p-6 border-b border-white/8 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${book.color}20`, color: book.color }}>
                {book.level}
              </span>
              <span className="text-[10px] text-white/30">Bài {lesson.lessonNumber}</span>
              {isCompleted && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                  <i className="ri-checkbox-circle-fill mr-1"></i>Đã học
                </span>
              )}
            </div>
            <p className="text-white font-bold text-sm md:text-base">{lesson.titleVi}</p>
            <p className="text-white/40 text-xs md:text-sm mt-0.5">{lesson.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-white/40 hover:text-white/70 transition-colors cursor-pointer flex-shrink-0">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Objectives */}
        <div className="px-4 md:px-6 py-2.5 bg-white/2 border-b border-white/5 flex-shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {lesson.objectives.map((obj, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">{obj}</span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/8 flex-shrink-0">
          {(["vocab", "grammar", "dialogue"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 md:py-3 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${tab === t ? "border-b-2" : "text-white/40 hover:text-white/60"}`}
              style={tab === t ? { color: book.color, borderColor: book.color } : {}}
            >
              {t === "vocab" ? `Từ vựng (${lesson.vocabulary.length})` : t === "grammar" ? `Ngữ pháp (${lesson.grammarPoints.length})` : "Hội thoại"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* VOCAB TAB */}
          {tab === "vocab" && (
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-white/40 text-xs">Nhấn vào thẻ để xem ví dụ</p>
                {dbVocab.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                    <i className="ri-database-2-line mr-1"></i>{dbVocab.length} từ từ Supabase
                  </span>
                )}
              </div>
              {vocabLoading && (
                <div className="text-center py-4 text-white/30 text-xs">
                  <i className="ri-loader-4-line animate-spin mr-1"></i>Đang tải từ vựng...
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {(dbVocab.length > 0
                  ? dbVocab.map(v => ({
                      korean: v.korean,
                      pronunciation: v.pronunciation,
                      vietnamese: v.vietnamese,
                      partOfSpeech: v.part_of_speech,
                      example: v.example,
                      exampleVi: v.example_vi,
                      hanja: v.hanja,
                    }))
                  : lesson.vocabulary.map(v => ({ ...v, hanja: undefined }))
                ).map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setFlipped(p => ({ ...p, [i]: !p[i] }))}
                    className="text-left p-3 md:p-4 rounded-xl border border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4 transition-all cursor-pointer min-h-[90px] md:min-h-[100px]"
                  >
                    {!flipped[i] ? (
                      <>
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-base md:text-lg leading-tight">{v.korean}</p>
                            {v.hanja && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block" style={{ backgroundColor: "#f43f5e15", color: "#f43f5e" }}>
                                {v.hanja}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); speakKorean(v.korean); }}
                            className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-lg flex-shrink-0 cursor-pointer transition-colors ml-1"
                            style={{ backgroundColor: `${book.color}20` }}
                          >
                            <i className="ri-volume-up-line text-xs" style={{ color: book.color }}></i>
                          </button>
                        </div>
                        <p className="text-white/35 text-[10px] md:text-xs mb-1">[{v.pronunciation}]</p>
                        <p className="text-xs font-medium" style={{ color: book.color }}>{v.vietnamese}</p>
                        <p className="text-white/25 text-[9px] md:text-[10px] mt-1">{v.partOfSpeech}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-white/40 text-[10px] font-medium mb-1.5">Ví dụ:</p>
                        <p className="text-white text-xs md:text-sm font-medium mb-1">{v.example}</p>
                        <p className="text-white/40 text-[10px] md:text-xs italic">{v.exampleVi}</p>
                      </>
                    )}
                  </button>
                ))}
              </div>

              {lesson.culturalTip && (
                <div className="mt-3 p-3 md:p-4 rounded-xl border border-[#84cc16]/20 bg-[#84cc16]/5">
                  <div className="flex items-start gap-2">
                    <i className="ri-global-line text-[#84cc16] text-sm flex-shrink-0 mt-0.5"></i>
                    <div>
                      <p className="text-[#84cc16] text-xs font-semibold mb-1">Ghi chú văn hóa</p>
                      <p className="text-white/50 text-xs leading-relaxed">{lesson.culturalTip}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GRAMMAR TAB */}
          {tab === "grammar" && (
            <div className="space-y-3">
              {lesson.grammarPoints.map((g, i) => (
                <div key={i} className="border border-white/8 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setGrammarOpen(p => ({ ...p, [i]: !p[i] }))}
                    className="w-full flex items-center justify-between px-4 md:px-5 py-3 md:py-4 hover:bg-white/3 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${book.color}15` }}>
                        <i className="ri-book-2-line text-xs md:text-sm" style={{ color: book.color }}></i>
                      </div>
                      <div className="text-left">
                        <p className="text-white font-semibold text-xs md:text-sm">{g.pattern}</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${book.color}15`, color: book.color }}>{g.level}</span>
                      </div>
                    </div>
                    <i className={grammarOpen[i] ? "ri-arrow-up-s-line text-white/30" : "ri-arrow-down-s-line text-white/30"}></i>
                  </button>
                  {grammarOpen[i] && (
                    <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-3 md:space-y-4">
                      <p className="text-white/60 text-xs md:text-sm leading-relaxed bg-white/3 rounded-lg p-3">{g.explanation}</p>
                      {g.notes && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-[#e8c84a]/5 border border-[#e8c84a]/10">
                          <i className="ri-lightbulb-line text-[#e8c84a] text-sm flex-shrink-0 mt-0.5"></i>
                          <p className="text-white/50 text-xs leading-relaxed">{g.notes}</p>
                        </div>
                      )}
                      <div className="space-y-2">
                        {g.examples.map((ex, j) => (
                          <div key={j} className="flex items-start gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg bg-white/3 border border-white/5">
                            <button
                              onClick={() => speakKorean(ex.korean)}
                              className="w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0 mt-0.5 cursor-pointer transition-colors"
                              style={{ backgroundColor: `${book.color}15` }}
                            >
                              <i className="ri-volume-up-line text-xs" style={{ color: book.color }}></i>
                            </button>
                            <div>
                              <p className="text-white text-xs md:text-sm font-medium">{ex.korean}</p>
                              <p className="text-white/40 text-[10px] md:text-xs mt-0.5">{ex.vietnamese}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* DIALOGUE TAB */}
          {tab === "dialogue" && (
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-semibold text-xs md:text-sm">{lesson.dialogueTitle}</p>
                <button
                  onClick={() => speakKorean(lesson.dialogue.map(d => d.text).join(" "))}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                  style={{ backgroundColor: `${book.color}15`, color: book.color }}
                >
                  <i className="ri-volume-up-line"></i>Nghe
                </button>
              </div>
              <div className="space-y-2.5 md:space-y-3">
                {lesson.dialogue.map((line, i) => (
                  <div key={i} className={`flex gap-2 md:gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
                    <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full flex-shrink-0 text-[9px] md:text-[10px] font-bold" style={{ backgroundColor: `${book.color}20`, color: book.color }}>
                      {line.speaker.slice(0, 2)}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${i % 2 === 0 ? "" : "text-right"}`}>
                      <p className="text-white/30 text-[9px] md:text-[10px] mb-1">{line.speaker}</p>
                      <div className={`inline-block p-2.5 md:p-3 rounded-xl text-left ${i % 2 === 0 ? "bg-white/5 border border-white/8" : "border"}`} style={i % 2 !== 0 ? { backgroundColor: `${book.color}10`, borderColor: `${book.color}25` } : {}}>
                        <div className="flex items-start gap-1.5 md:gap-2">
                          <div className="flex-1">
                            <p className="text-white text-xs md:text-sm font-medium">{line.text}</p>
                            <p className="text-white/40 text-[10px] md:text-xs mt-1 italic">{line.translation}</p>
                          </div>
                          <button
                            onClick={() => speakKorean(line.text)}
                            className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-md flex-shrink-0 cursor-pointer hover:bg-white/10 transition-colors"
                          >
                            <i className="ri-volume-up-line text-white/30 text-xs"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — Mark as studied */}
        <div className="p-3 md:p-4 border-t border-white/8 flex-shrink-0">
          {isCompleted ? (
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <i className="ri-checkbox-circle-fill text-emerald-400"></i>
              <span className="text-emerald-400 text-sm font-semibold">Đã đánh dấu hoàn thành</span>
            </div>
          ) : (
            <button
              onClick={() => { onComplete(); onClose(); }}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap text-[#0f1117] hover:opacity-90 active:scale-95"
              style={{ backgroundColor: book.color }}
            >
              <i className="ri-checkbox-circle-line mr-2"></i>
              Đánh dấu đã học (+50 XP)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Book Detail View ─────────────────────────────────────────────────────
function BookDetailView({
  book,
  completedLessons,
  onLessonClick,
  onBack,
}: {
  book: SeoulBook;
  completedLessons: Record<string, boolean>;
  onLessonClick: (lesson: SeoulLesson) => void;
  onBack: () => void;
}) {
  // Filter out removed/placeholder lessons and sort by lessonNumber
  // Also collect lessons from other books that belong to this book (by id prefix)
  const validLessons = useMemo(() => {
    const bookPrefix = book.id + "-L";
    // Gather all lessons across all books that have this book's prefix
    const allMatchingLessons: typeof book.lessons = [];
    seoulBooks.forEach(b => {
      b.lessons.forEach(l => {
        if (l.id.startsWith(bookPrefix) && !l.id.includes("-REMOVED") && !l.id.includes("-placeholder")) {
          allMatchingLessons.push(l);
        }
      });
    });
    // Deduplicate by id
    const seen = new Set<string>();
    return allMatchingLessons
      .filter(l => { if (seen.has(l.id)) return false; seen.add(l.id); return true; })
      .sort((a, b) => a.lessonNumber - b.lessonNumber);
  }, [book.id, book.lessons]);
  const completedCount = validLessons.filter(l => completedLessons[l.id]).length;
  const progress = book.totalLessons > 0 ? Math.round((completedCount / book.totalLessons) * 100) : 0;
  const remainingCount = book.totalLessons - validLessons.length;

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-4 md:mb-5 cursor-pointer transition-colors"
      >
        <i className="ri-arrow-left-line"></i>
        Quay lại danh sách
      </button>

      {/* Book header */}
      <div className="rounded-2xl p-4 md:p-6 mb-5 md:mb-6 border border-white/8" style={{ background: `linear-gradient(135deg, ${book.color}15, ${book.color}05)` }}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${book.color}25`, color: book.color }}>
                {book.level}
              </span>
              <span className="text-xs text-white/40">{book.cefrLevel}</span>
            </div>
            <h2 className="text-white font-bold text-lg md:text-2xl mb-1">{book.name}</h2>
            <p className="text-white/50 text-xs md:text-sm leading-relaxed">{book.description}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-3xl md:text-4xl font-bold" style={{ color: book.color }}>{progress}%</p>
            <p className="text-white/40 text-xs md:text-sm">{completedCount}/{book.totalLessons} bài</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 mt-4 md:mt-5">
          {[
            { label: "Tổng bài", value: book.totalLessons, icon: "ri-book-open-line" },
            { label: "Từ vựng", value: `~${book.totalVocab}`, icon: "ri-translate-2" },
            { label: "Ngữ pháp", value: book.totalGrammar, icon: "ri-book-2-line" },
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-xl p-2.5 md:p-3 flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${book.color}15` }}>
                <i className={`${s.icon} text-xs md:text-sm`} style={{ color: book.color }}></i>
              </div>
              <div>
                <p className="text-white font-bold text-sm md:text-base leading-none">{s.value}</p>
                <p className="text-white/35 text-[9px] md:text-[10px] mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 md:mt-4">
          <div className="h-2 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: book.color }} />
          </div>
        </div>
      </div>

      {/* Lessons list */}
      <h3 className="text-white font-semibold text-sm mb-3">
        Danh sách bài học ({validLessons.length} bài chi tiết)
      </h3>
      <div className="space-y-2">
        {validLessons.map(lesson => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            bookColor={book.color}
            isCompleted={!!completedLessons[lesson.id]}
            onClick={() => onLessonClick(lesson)}
          />
        ))}

        {remainingCount > 0 && (
          <div className="p-4 rounded-xl border border-white/5 bg-white/1 text-center">
            <i className="ri-lock-line text-white/20 text-2xl mb-2 block"></i>
            <p className="text-white/30 text-sm font-medium">+{remainingCount} bài học tiếp theo</p>
            <p className="text-white/20 text-xs mt-1">Đang được cập nhật thêm nội dung chi tiết</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Progress Chart ───────────────────────────────────────────────────────
function ProgressChart({ completedLessons }: { completedLessons: Record<string, boolean> }) {
  const navigate = useNavigate();

  const bookStats = useMemo(() => seoulBooks.map(book => {
    const completed = book.lessons.filter(l => completedLessons[l.id]).length;
    const pct = book.totalLessons > 0 ? Math.round((completed / book.totalLessons) * 100) : 0;
    return { book, completed, pct };
  }), [completedLessons]);

  const totalCompleted = Object.keys(completedLessons).length;
  const totalLessons = seoulBooks.reduce((s, b) => s + b.totalLessons, 0);
  const overallPct = Math.round((totalCompleted / totalLessons) * 100);

  return (
    <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-4 md:p-5 mb-5 md:mb-6">
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <div>
          <p className="text-white font-semibold text-sm">Tiến độ học Seoul</p>
          <p className="text-white/30 text-xs mt-0.5">% hoàn thành từng cuốn sách</p>
        </div>
        <button
          onClick={() => navigate("/seoul-progress")}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
          style={{ backgroundColor: "#e8c84a15", color: "#e8c84a" }}
        >
          <i className="ri-bar-chart-line"></i>Chi tiết
        </button>
      </div>

      <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Ring chart */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke="#e8c84a" strokeWidth="12"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallPct / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-white font-bold text-base md:text-lg leading-none">{overallPct}%</p>
            <p className="text-white/30 text-[9px]">Tổng thể</p>
          </div>
        </div>

        {/* Per-book bars */}
        <div className="flex-1 space-y-1.5 md:space-y-2">
          {bookStats.map(({ book, completed, pct }) => (
            <div key={book.id} className="flex items-center gap-2 md:gap-3">
              <span className="text-[10px] font-bold w-5 md:w-6 flex-shrink-0" style={{ color: book.color }}>{book.level}</span>
              <div className="flex-1 h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: book.color }}
                />
              </div>
              <span className="text-white/30 text-[9px] md:text-[10px] w-10 md:w-12 text-right flex-shrink-0">{completed}/{book.totalLessons}</span>
              <span className="text-[9px] md:text-[10px] font-bold w-7 md:w-8 text-right flex-shrink-0" style={{ color: pct > 0 ? book.color : "rgba(255,255,255,0.2)" }}>{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Supabase vocab loader (enriches lessons with DB vocab) ──────────────
function useSupabaseVocab(lessonId: string | null) {
  const [dbVocab, setDbVocab] = useState<Array<{
    korean: string; pronunciation: string; vietnamese: string;
    part_of_speech: string; example: string; example_vi: string; hanja?: string;
  }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    supabase
      .from("seoul_vocabulary")
      .select("korean, pronunciation, vietnamese, part_of_speech, example, example_vi, hanja")
      .eq("lesson_id", lessonId)
      .then(({ data }) => {
        if (data && data.length > 0) setDbVocab(data);
        setLoading(false);
      });
  }, [lessonId]);

  return { dbVocab, loading };
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function SeoulTextbookPage() {
  const { addXP } = useXPSystem();
  const navigatePage = useNavigate();
  const [completedLessons, setCompletedLessons] = useLocalStorage<Record<string, boolean>>("kts_seoul_progress", {});
  const [selectedBook, setSelectedBook] = useState<SeoulBook | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<SeoulLesson | null>(null);
  const [filterGroup, setFilterGroup] = useState<number | "all">("all");

  const filteredBooks = useMemo(() => {
    if (filterGroup === "all") return seoulBooks;
    return seoulBooks.filter(b => b.levelGroup === filterGroup);
  }, [filterGroup]);

  const totalCompleted = Object.keys(completedLessons).length;
  const totalLessons = seoulBooks.reduce((sum, b) => sum + b.totalLessons, 0);
  const totalVocab = seoulBooks.reduce((sum, b) => sum + b.totalVocab, 0);
  const totalGrammar = seoulBooks.reduce((sum, b) => sum + b.totalGrammar, 0);

  const getBookCompletedCount = (book: SeoulBook) => {
    return book.lessons.filter(l => completedLessons[l.id]).length;
  };

  const handleCompleteLesson = (lessonId: string) => {
    if (completedLessons[lessonId]) return;
    setCompletedLessons(prev => ({ ...prev, [lessonId]: true }));
    addXP(50, `Hoàn thành bài Seoul: ${lessonId}`);
  };

  const levelGroups = [
    { id: 1, label: "Sơ cấp", books: "1A, 1B", color: "#e8c84a" },
    { id: 2, label: "Sơ-Trung", books: "2A, 2B", color: "#fb923c" },
    { id: 3, label: "Trung cấp", books: "3A, 3B", color: "#a78bfa" },
    { id: 4, label: "Cao cấp", books: "4A, 4B", color: "#f87171" },
  ];

  return (
    <DashboardLayout
      title="Giáo Trình Seoul 1A–4B"
      subtitle="Học tiếng Hàn bài bản theo giáo trình chuẩn quốc tế"
    >
      {!selectedBook ? (
        <>
          {/* Quick links to Hanja pages */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => navigatePage("/hanja-vocab")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap transition-all hover:opacity-80"
              style={{ backgroundColor: "#f43f5e15", color: "#f43f5e", border: "1px solid #f43f5e30" }}
            >
              <i className="ri-translate-2"></i>Từ vựng Hán-Hàn
            </button>
            <button
              onClick={() => navigatePage("/seoul-hanja")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap transition-all hover:opacity-80"
              style={{ backgroundColor: "#f59e0b15", color: "#f59e0b", border: "1px solid #f59e0b30" }}
            >
              <i className="ri-font-size"></i>Học Hán tự Seoul
            </button>
          </div>

          {/* Overall stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5 md:mb-6">
            {[
              { label: "Tổng bài học", value: totalLessons, icon: "ri-book-open-line", color: "#e8c84a" },
              { label: "Đã hoàn thành", value: totalCompleted, icon: "ri-checkbox-circle-line", color: "#34d399" },
              { label: "Tổng từ vựng", value: `~${totalVocab}`, icon: "ri-translate-2", color: "#a78bfa" },
              { label: "Điểm ngữ pháp", value: totalGrammar, icon: "ri-book-2-line", color: "#fb923c" },
            ].map(s => (
              <div key={s.label} className="bg-[#0f1117] border border-white/5 rounded-xl p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-base md:text-lg`} style={{ color: s.color }}></i>
                </div>
                <div>
                  <p className="text-white font-bold text-lg md:text-xl leading-none">{s.value}</p>
                  <p className="text-white/40 text-[10px] md:text-xs mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Chart */}
          <ProgressChart completedLessons={completedLessons} />

          {/* Level group filter */}
          <div className="flex items-center gap-1.5 md:gap-2 mb-4 md:mb-5 flex-wrap">
            <button
              onClick={() => setFilterGroup("all")}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${filterGroup === "all" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60 hover:bg-white/5"}`}
            >
              Tất cả
            </button>
            {levelGroups.map(g => (
              <button
                key={g.id}
                onClick={() => setFilterGroup(g.id)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${filterGroup === g.id ? "text-[#0f1117]" : "text-white/40 hover:text-white/60 hover:bg-white/5"}`}
                style={filterGroup === g.id ? { backgroundColor: g.color } : {}}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Books grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mb-5 md:mb-6" style={{ contentVisibility: "auto", containIntrinsicSize: "0 800px" }}>
            {filteredBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                completedCount={getBookCompletedCount(book)}
                isSelected={false}
                onClick={() => setSelectedBook(book)}
              />
            ))}
          </div>

          {/* Learning path */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-4 md:p-5">
            <h3 className="text-white font-semibold text-sm mb-3 md:mb-4">Lộ trình học tập</h3>
            <div className="flex items-center gap-0 overflow-x-auto pb-2">
              {seoulBooks.map((book, i) => (
                <div key={book.id} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="flex flex-col items-center gap-1 md:gap-1.5 cursor-pointer group"
                  >
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl font-bold text-xs md:text-sm transition-all group-hover:scale-110"
                      style={{
                        backgroundColor: getBookCompletedCount(book) === book.totalLessons ? `${book.color}30` : `${book.color}15`,
                        color: book.color,
                        border: `2px solid ${book.color}${getBookCompletedCount(book) > 0 ? "60" : "25"}`,
                      }}
                    >
                      {book.level}
                    </div>
                    <p className="text-white/30 text-[9px] text-center whitespace-nowrap">{book.cefrLevel}</p>
                  </button>
                  {i < seoulBooks.length - 1 && (
                    <div className="w-5 md:w-8 h-0.5 bg-white/10 mx-0.5 md:mx-1 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <BookDetailView
          book={selectedBook}
          completedLessons={completedLessons}
          onLessonClick={setSelectedLesson}
          onBack={() => setSelectedBook(null)}
        />
      )}

      {/* Lesson Modal */}
      {selectedLesson && selectedBook && (
        <LessonModal
          lesson={selectedLesson}
          book={selectedBook}
          onClose={() => setSelectedLesson(null)}
          onComplete={() => handleCompleteLesson(selectedLesson.id)}
          isCompleted={!!completedLessons[selectedLesson.id]}
        />
      )}
    </DashboardLayout>
  );
}

