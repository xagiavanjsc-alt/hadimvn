import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { seoulBooks } from "@/mocks/seoulTextbook";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface PhraseEntry {
  id: string;
  korean: string;
  vietnamese: string;
  bookId: string;
  bookName: string;
  lessonNumber: number;
  lessonTitle: string;
  speaker: string;
  type: "dialogue" | "grammar" | "example";
  grammarPattern?: string;
}

function buildPhrases(): PhraseEntry[] {
  const phrases: PhraseEntry[] = [];
  seoulBooks.forEach(book => {
    book.lessons.forEach(lesson => {
      // From dialogues
      lesson.dialogue.forEach((line, di) => {
        phrases.push({
          id: `${book.id}-${lesson.lessonNumber}-dlg-${di}`,
          korean: line.text,
          vietnamese: line.translation,
          bookId: book.id,
          bookName: book.name,
          lessonNumber: lesson.lessonNumber,
          lessonTitle: lesson.titleVi,
          speaker: line.speaker,
          type: "dialogue",
        });
      });
      // From grammar examples
      lesson.grammarPoints.forEach((gp, gi) => {
        gp.examples.forEach((ex, ei) => {
          phrases.push({
            id: `${book.id}-${lesson.lessonNumber}-gp-${gi}-${ei}`,
            korean: ex.korean,
            vietnamese: ex.vietnamese,
            bookId: book.id,
            bookName: book.name,
            lessonNumber: lesson.lessonNumber,
            lessonTitle: lesson.titleVi,
            speaker: "Ví dụ",
            type: "grammar",
            grammarPattern: gp.pattern,
          });
        });
      });
    });
  });
  return phrases;
}

const ALL_PHRASES = buildPhrases();

const bookColors: Record<string, string> = {
  "1A": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "1B": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "2A": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "2B": "text-teal-400 bg-teal-500/10 border-teal-500/20",
  "3A": "text-violet-400 bg-violet-500/10 border-violet-500/20",
  "3B": "text-pink-400 bg-pink-500/10 border-pink-500/20",
  "4A": "text-lime-400 bg-lime-500/10 border-lime-500/20",
  "4B": "text-red-400 bg-red-500/10 border-red-500/20",
};

type QuizState = "idle" | "question" | "result";

interface QuizSession {
  phrases: PhraseEntry[];
  currentIdx: number;
  userInput: string;
  score: number;
  results: { phrase: PhraseEntry; correct: boolean; userAnswer: string }[];
}

export default function SeoulPhrasesPage() {
  const [selectedBook, setSelectedBook] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "dialogue" | "grammar">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useLocalStorage<string[]>("seoul_saved_phrases", []);
  const [filterSaved, setFilterSaved] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [quiz, setQuiz] = useState<QuizSession | null>(null);
  const [showVietnamese, setShowVietnamese] = useState<Record<string, boolean>>({});
  const [xpData, setXpData] = useLocalStorage<{ total: number }>("kts_xp_total", { total: 0 });

  const filtered = useMemo(() => {
    let result = ALL_PHRASES;
    if (selectedBook !== "all") result = result.filter(p => p.bookId === selectedBook);
    if (selectedType !== "all") result = result.filter(p => p.type === selectedType);
    if (filterSaved) result = result.filter(p => savedIds.includes(p.id));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.korean.toLowerCase().includes(q) ||
        p.vietnamese.toLowerCase().includes(q) ||
        p.grammarPattern?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedBook, selectedType, filterSaved, searchQuery, savedIds]);

  const speakKorean = (text: string, slow = false) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ko-KR";
    utt.rate = slow ? 0.6 : 0.85;
    synth.speak(utt);
  };

  const toggleSave = (id: string) => {
    setSavedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleVietnamese = (id: string) => {
    setShowVietnamese(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const startQuiz = () => {
    const pool = filtered.length >= 10 ? filtered : ALL_PHRASES;
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuiz({
      phrases: shuffled,
      currentIdx: 0,
      userInput: "",
      score: 0,
      results: [],
    });
    setQuizState("question");
  };

  const submitQuizAnswer = () => {
    if (!quiz) return;
    const current = quiz.phrases[quiz.currentIdx];
    const u = quiz.userInput.trim().toLowerCase().replace(/[.,!?]/g, "");
    const c = current.korean.trim().toLowerCase().replace(/[.,!?]/g, "");
    const correct = u === c || c.includes(u) && u.length > 3;
    const newResults = [...quiz.results, { phrase: current, correct, userAnswer: quiz.userInput }];
    const newScore = quiz.score + (correct ? 1 : 0);

    if (quiz.currentIdx + 1 >= quiz.phrases.length) {
      setQuiz({ ...quiz, results: newResults, score: newScore, userInput: "" });
      setQuizState("result");
      const xp = newScore * 15;
      setXpData(prev => ({ total: (prev.total || 0) + xp }));
    } else {
      setQuiz({ ...quiz, currentIdx: quiz.currentIdx + 1, userInput: "", score: newScore, results: newResults });
    }
  };

  const totalByBook = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_PHRASES.forEach(p => { counts[p.bookId] = (counts[p.bookId] || 0) + 1; });
    return counts;
  }, []);

  // Quiz screen
  if (quizState === "question" && quiz) {
    const current = quiz.phrases[quiz.currentIdx];
    const progress = (quiz.currentIdx / quiz.phrases.length) * 100;
    return (
      <DashboardLayout>
        <div className="p-6 max-w-2xl mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <button onClick={() => setQuizState("idle")} className="flex items-center gap-1.5 text-white/40 hover:text-white/60 text-sm cursor-pointer whitespace-nowrap">
              <i className="ri-arrow-left-line text-sm"></i> Thoát
            </button>
            <span className="text-white/40 text-sm">{quiz.currentIdx + 1}/{quiz.phrases.length}</span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-[#e8c84a] rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-full text-xs border ${bookColors[current.bookId]}`}>{current.bookName} · Bài {current.lessonNumber}</span>
              {current.type === "grammar" && current.grammarPattern && (
                <span className="text-white/30 text-xs truncate max-w-[200px]">{current.grammarPattern}</span>
              )}
            </div>
            <div>
              <p className="text-white/40 text-xs mb-2">Dịch sang tiếng Hàn:</p>
              <p className="text-white font-semibold text-xl leading-relaxed">{current.vietnamese}</p>
            </div>
            <button onClick={() => speakKorean(current.korean)} className="flex items-center gap-1.5 text-white/30 hover:text-white/50 text-xs cursor-pointer whitespace-nowrap">
              <i className="ri-volume-up-line text-xs"></i> Nghe gợi ý
            </button>
            <textarea
              value={quiz.userInput}
              onChange={e => setQuiz({ ...quiz, userInput: e.target.value })}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitQuizAnswer(); } }}
              placeholder="Nhập câu tiếng Hàn..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base placeholder-white/20 focus:outline-none focus:border-white/25 resize-none"
              style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
              autoFocus
            />
            <button
              onClick={submitQuizAnswer}
              disabled={!quiz.userInput.trim()}
              className="w-full py-3 rounded-xl bg-[#e8c84a]/15 border border-[#e8c84a]/30 text-[#e8c84a] font-medium text-sm hover:bg-[#e8c84a]/25 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
            >
              Nộp bài (Enter)
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Quiz result screen
  if (quizState === "result" && quiz) {
    const accuracy = Math.round((quiz.score / quiz.phrases.length) * 100);
    return (
      <DashboardLayout>
        <div className="p-6 max-w-2xl mx-auto space-y-5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 flex items-center justify-center bg-[#e8c84a]/10 rounded-full mx-auto">
              <i className="ri-trophy-line text-[#e8c84a] text-3xl"></i>
            </div>
            <h2 className="text-white font-bold text-2xl">Kết quả kiểm tra</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <p className="text-emerald-400 font-bold text-xl">{quiz.score}</p>
                <p className="text-emerald-400/60 text-xs">Đúng</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                <p className="text-red-400 font-bold text-xl">{quiz.phrases.length - quiz.score}</p>
                <p className="text-red-400/60 text-xs">Sai</p>
              </div>
              <div className="bg-[#e8c84a]/10 border border-[#e8c84a]/20 rounded-xl p-3 text-center">
                <p className="text-[#e8c84a] font-bold text-xl">{quiz.score * 15}</p>
                <p className="text-[#e8c84a]/60 text-xs">XP</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/40 text-xs">Độ chính xác</span>
                <span className="text-white font-bold text-sm">{accuracy}%</span>
              </div>
              <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${accuracy}%`, backgroundColor: accuracy >= 80 ? "#34d399" : accuracy >= 60 ? "#e8c84a" : "#f87171" }}></div>
              </div>
            </div>
          </div>

          {/* Review wrong answers */}
          <div className="space-y-2">
            <p className="text-white/40 text-sm font-medium">Xem lại đáp án</p>
            {quiz.results.map((r, i) => (
              <div key={i} className={`border rounded-xl p-4 space-y-2 ${r.correct ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`text-sm ${r.correct ? "ri-checkbox-circle-fill text-emerald-400" : "ri-close-circle-fill text-red-400"}`}></i>
                  </div>
                  <p className="text-white/60 text-sm">{r.phrase.vietnamese}</p>
                </div>
                <p className="text-white font-medium text-sm pl-6" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                  {r.phrase.korean}
                </p>
                {!r.correct && r.userAnswer && (
                  <p className="text-red-400/60 text-xs pl-6">Bạn viết: {r.userAnswer}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setQuizState("idle")} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm cursor-pointer whitespace-nowrap">Về danh sách</button>
            <button onClick={startQuiz} className="flex-1 py-3 rounded-xl bg-[#e8c84a]/15 border border-[#e8c84a]/30 text-[#e8c84a] text-sm font-medium cursor-pointer whitespace-nowrap">Kiểm tra lại</button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Main list screen
  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Bộ sưu tập câu mẫu Seoul
            </h1>
            <p className="text-white/40 text-sm mt-0.5">Tổng hợp câu mẫu từ hội thoại và ngữ pháp theo từng bài học</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-white font-bold text-xl">{ALL_PHRASES.length}</p>
              <p className="text-white/40 text-xs">Tổng câu mẫu</p>
            </div>
            <button
              onClick={startQuiz}
              className="flex items-center gap-2 px-4 py-2 bg-[#e8c84a]/15 border border-[#e8c84a]/30 text-[#e8c84a] rounded-xl text-sm font-medium hover:bg-[#e8c84a]/25 transition-all cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-survey-line text-sm"></i>
              </div>
              Kiểm tra
            </button>
          </div>
        </div>

        {/* Book filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedBook("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${selectedBook === "all" ? "bg-white/15 text-white border-white/20" : "bg-white/5 text-white/40 hover:text-white/70 border-transparent"}`}
          >
            Tất cả ({ALL_PHRASES.length})
          </button>
          {seoulBooks.map(book => (
            <button
              key={book.id}
              onClick={() => setSelectedBook(book.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${selectedBook === book.id ? bookColors[book.id] : "bg-white/5 text-white/40 hover:text-white/70 border-transparent"}`}
            >
              {book.name} ({totalByBook[book.id] || 0})
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            {[
              { id: "all", label: "Tất cả" },
              { id: "dialogue", label: "Hội thoại" },
              { id: "grammar", label: "Ngữ pháp" },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id as "all" | "dialogue" | "grammar")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedType === t.id ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setFilterSaved(!filterSaved)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${filterSaved ? "bg-[#e8c84a]/15 border-[#e8c84a]/30 text-[#e8c84a]" : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"}`}
          >
            <div className="w-3 h-3 flex items-center justify-center">
              <i className="ri-bookmark-fill text-xs"></i>
            </div>
            Đã lưu ({savedIds.length})
          </button>

          <div className="flex-1 relative min-w-[200px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-white/30 text-sm"></i>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm câu mẫu..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/25"
            />
          </div>
        </div>

        <p className="text-white/30 text-sm">{filtered.length} câu mẫu</p>

        {/* Phrase list */}
        {filtered.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <p className="text-white/40 text-sm">Không tìm thấy câu mẫu phù hợp</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(phrase => {
              const isSaved = savedIds.includes(phrase.id);
              const showVi = showVietnamese[phrase.id];
              return (
                <div key={phrase.id} className="bg-white/5 border border-white/8 hover:border-white/15 rounded-xl p-4 transition-all">
                  <div className="flex items-start gap-3">
                    {/* Type indicator */}
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${phrase.type === "dialogue" ? "bg-sky-400" : "bg-violet-400"}`}></div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Grammar pattern label */}
                      {phrase.type === "grammar" && phrase.grammarPattern && (
                        <p className="text-violet-400/60 text-[10px] font-medium truncate">{phrase.grammarPattern}</p>
                      )}
                      {phrase.type === "dialogue" && (
                        <p className="text-sky-400/60 text-[10px] font-medium">{phrase.speaker}</p>
                      )}

                      {/* Korean */}
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-base leading-relaxed" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                          {phrase.korean}
                        </p>
                        <button
                          onClick={() => speakKorean(phrase.korean)}
                          className="w-6 h-6 flex items-center justify-center bg-white/8 hover:bg-white/15 rounded-full transition-all cursor-pointer flex-shrink-0"
                        >
                          <i className="ri-volume-up-line text-white/40 text-xs"></i>
                        </button>
                        <button
                          onClick={() => speakKorean(phrase.korean, true)}
                          className="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all cursor-pointer flex-shrink-0"
                          title="Nghe chậm"
                        >
                          <i className="ri-speed-line text-white/25 text-xs"></i>
                        </button>
                      </div>

                      {/* Vietnamese (toggle) */}
                      <button
                        onClick={() => toggleVietnamese(phrase.id)}
                        className="text-left cursor-pointer"
                      >
                        {showVi ? (
                          <p className="text-white/60 text-sm italic">{phrase.vietnamese}</p>
                        ) : (
                          <p className="text-white/20 text-xs">Nhấn để xem nghĩa</p>
                        )}
                      </button>
                    </div>

                    {/* Right actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleSave(phrase.id)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${isSaved ? "bg-[#e8c84a]/15 text-[#e8c84a]" : "bg-white/5 text-white/25 hover:text-white/50"}`}
                      >
                        <i className={`${isSaved ? "ri-bookmark-fill" : "ri-bookmark-line"} text-xs`}></i>
                      </button>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${bookColors[phrase.bookId]}`}>
                        {phrase.bookName}
                      </span>
                      <span className="text-white/20 text-[10px]">Bài {phrase.lessonNumber}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
