import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { seoulBooks } from "@/mocks/seoulTextbook";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface LessonProgress {
  [lessonId: string]: {
    studied: boolean;
    quizScore?: number;
    flashcardDone?: boolean;
    lastStudied?: string;
  };
}

const LEVEL_GROUPS = [
  { group: 1, label: "Sơ cấp", color: "#e8c84a", books: ["1A", "1B"] },
  { group: 2, label: "Sơ-Trung cấp", color: "#34d399", books: ["2A", "2B"] },
  { group: 3, label: "Trung cấp", color: "#a78bfa", books: ["3A", "3B"] },
  { group: 4, label: "Cao cấp", color: "#f87171", books: ["4A", "4B"] },
];

export default function SeoulProgressPage() {
  const navigate = useNavigate();
  // Đồng bộ với key của trang giáo trình (kts_seoul_progress)
  const [completedMap] = useLocalStorage<Record<string, boolean>>("kts_seoul_progress", {});
  // Chuyển đổi sang format LessonProgress để tương thích
  const lessonProgress: LessonProgress = Object.fromEntries(
    Object.entries(completedMap).map(([id, done]) => [id, { studied: done }])
  );
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const getBookProgress = (bookId: string) => {
    const book = seoulBooks.find(b => b.id === bookId);
    if (!book) return { done: 0, total: 0, pct: 0 };
    const total = book.lessons.length;
    const done = book.lessons.filter(l => lessonProgress[l.id]?.studied).length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  const getLessonProgress = (lessonId: string) => {
    return lessonProgress[lessonId] || { studied: false };
  };

  const getTotalProgress = () => {
    const allLessons = seoulBooks.flatMap(b => b.lessons);
    const total = allLessons.length;
    const done = allLessons.filter(l => lessonProgress[l.id]?.studied).length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  const totalProg = getTotalProgress();
  const activeBook = selectedBook ? seoulBooks.find(b => b.id === selectedBook) : null;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 cursor-pointer">
            <i className="ri-arrow-left-line text-lg"></i>
          </button>
          <div>
            <h1 className="text-white font-bold text-xl">Bảng tiến độ Seoul</h1>
            <p className="text-white/40 text-sm">Theo dõi % hoàn thành từng bài học theo từng cuốn sách</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-bold text-lg">Tổng tiến độ</h2>
              <p className="text-white/40 text-sm">Toàn bộ giáo trình Seoul 1A–4B</p>
            </div>
            <div className="text-right">
              <p className="text-white text-3xl font-black">{totalProg.pct}%</p>
              <p className="text-white/40 text-sm">{totalProg.done}/{totalProg.total} bài</p>
            </div>
          </div>
          <div className="h-3 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#e8c84a] to-[#34d399]" style={{ width: `${totalProg.pct}%` }}></div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {LEVEL_GROUPS.map(g => {
              const groupBooks = seoulBooks.filter(b => g.books.includes(b.id));
              const groupLessons = groupBooks.flatMap(b => b.lessons);
              const groupDone = groupLessons.filter(l => lessonProgress[l.id]?.studied).length;
              const groupPct = groupLessons.length > 0 ? Math.round((groupDone / groupLessons.length) * 100) : 0;
              return (
                <div key={g.group} className="bg-white/3 rounded-xl p-3 text-center">
                  <p className="text-xs font-bold mb-1" style={{ color: g.color }}>{g.label}</p>
                  <p className="text-white text-xl font-black">{groupPct}%</p>
                  <p className="text-white/30 text-xs">{groupDone}/{groupLessons.length}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Book Detail View */}
        {activeBook ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedBook(null)} className="text-white/40 hover:text-white/70 cursor-pointer text-sm flex items-center gap-1">
                <i className="ri-arrow-left-s-line"></i> Quay lại
              </button>
              <span className="text-white/20">/</span>
              <span className="font-bold text-sm" style={{ color: activeBook.color }}>{activeBook.name}</span>
            </div>

            <div className="bg-white/3 border border-white/8 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold">{activeBook.name}</h3>
                  <p className="text-white/40 text-xs">{activeBook.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black" style={{ color: activeBook.color }}>{getBookProgress(activeBook.id).pct}%</p>
                  <p className="text-white/30 text-xs">{getBookProgress(activeBook.id).done}/{getBookProgress(activeBook.id).total} bài</p>
                </div>
              </div>
              <div className="h-2 bg-white/8 rounded-full overflow-hidden mb-5">
                <div className="h-full rounded-full transition-all" style={{ width: `${getBookProgress(activeBook.id).pct}%`, backgroundColor: activeBook.color }}></div>
              </div>

              <div className="space-y-2">
                {activeBook.lessons.map(lesson => {
                  const prog = getLessonProgress(lesson.id);
                  return (
                    <div key={lesson.id} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${prog.studied ? "border-opacity-30" : "border-white/8"}`}
                      style={prog.studied ? { borderColor: activeBook.color + "50", backgroundColor: activeBook.color + "08" } : {}}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${prog.studied ? "" : "bg-white/5"}`}
                        style={prog.studied ? { backgroundColor: activeBook.color + "20" } : {}}>
                        {prog.studied
                          ? <i className="ri-check-line text-sm" style={{ color: activeBook.color }}></i>
                          : <span className="text-white/30 text-xs font-bold">{lesson.lessonNumber}</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${prog.studied ? "text-white" : "text-white/50"}`}>{lesson.title}</p>
                        <p className="text-white/30 text-xs truncate">{lesson.titleVi}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-white/20 text-xs">{lesson.vocabulary.length} từ</span>
                        {prog.quizScore !== undefined && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: activeBook.color + "20", color: activeBook.color }}>
                            {prog.quizScore}%
                          </span>
                        )}
                        {prog.studied && (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeBook.color }}></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate("/seoul-textbook")} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 text-sm cursor-pointer transition-all">
                <i className="ri-book-3-line mr-2"></i>Mở giáo trình
              </button>
              <button onClick={() => navigate("/seoul-lesson-quiz")} className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:opacity-90" style={{ backgroundColor: activeBook.color, color: "#000" }}>
                <i className="ri-file-list-3-line mr-2"></i>Thi thử theo bài
              </button>
            </div>
          </div>
        ) : (
          /* Level Groups */
          <div className="space-y-6">
            {LEVEL_GROUPS.map(g => (
              <div key={g.group}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full" style={{ backgroundColor: g.color }}></div>
                  <h2 className="text-white font-bold">{g.label}</h2>
                  <span className="text-white/30 text-xs">CEFR {g.group === 1 ? "A1" : g.group === 2 ? "A2" : g.group === 3 ? "B1" : "B2"}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {g.books.map(bookId => {
                    const book = seoulBooks.find(b => b.id === bookId);
                    if (!book) return null;
                    const prog = getBookProgress(bookId);
                    return (
                      <button
                        key={bookId}
                        onClick={() => setSelectedBook(bookId)}
                        className="bg-white/3 border border-white/8 rounded-xl p-5 text-left hover:border-white/15 hover:bg-white/5 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: book.color + "20" }}>
                            <i className="ri-book-3-line" style={{ color: book.color }}></i>
                          </div>
                          <span className="text-2xl font-black" style={{ color: book.color }}>{prog.pct}%</span>
                        </div>
                        <h3 className="text-white font-bold mb-0.5">{book.name}</h3>
                        <p className="text-white/30 text-xs mb-3 line-clamp-2">{book.description}</p>

                        {/* Progress bar */}
                        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-2">
                          <div className="h-full rounded-full transition-all" style={{ width: `${prog.pct}%`, backgroundColor: book.color }}></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/30 text-xs">{prog.done}/{prog.total} bài hoàn thành</span>
                          <i className="ri-arrow-right-s-line text-white/20 group-hover:text-white/50 transition-colors"></i>
                        </div>

                        {/* Lesson mini dots */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {book.lessons.slice(0, 15).map(l => (
                            <div key={l.id} className="w-2 h-2 rounded-full transition-all"
                              style={{ backgroundColor: lessonProgress[l.id]?.studied ? book.color : "rgba(255,255,255,0.1)" }}></div>
                          ))}
                          {book.lessons.length > 15 && <span className="text-white/20 text-xs">+{book.lessons.length - 15}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quick Actions */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-4">
              <h3 className="text-white font-semibold text-sm mb-3">Hành động nhanh</h3>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => navigate("/seoul-textbook")} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/3 hover:bg-white/6 cursor-pointer transition-all">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <i className="ri-book-3-line text-[#e8c84a]"></i>
                  </div>
                  <span className="text-white/50 text-xs text-center">Giáo trình</span>
                </button>
                <button onClick={() => navigate("/seoul-lesson-quiz")} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/3 hover:bg-white/6 cursor-pointer transition-all">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <i className="ri-file-list-3-line text-[#34d399]"></i>
                  </div>
                  <span className="text-white/50 text-xs text-center">Thi thử bài</span>
                </button>
                <button onClick={() => navigate("/seoul-listening-quiz")} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/3 hover:bg-white/6 cursor-pointer transition-all">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <i className="ri-headphone-line text-[#a78bfa]"></i>
                  </div>
                  <span className="text-white/50 text-xs text-center">Luyện nghe</span>
                </button>
              </div>
            </div>

            {/* Note about tracking */}
            <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <i className="ri-information-line text-[#e8c84a] text-sm"></i>
                </div>
                <p className="text-white/40 text-xs">
                  Tiến độ được tự động cập nhật khi bạn học flashcard, làm bài thi thử hoặc luyện tập từng bài. Hãy học đều đặn để hoàn thành toàn bộ giáo trình!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
