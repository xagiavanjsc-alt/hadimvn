import { useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { seoulBooks } from "@/mocks/seoulTextbook";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { recordActivity } from "@/utils/streak";

// ─── Wrong word type (same as seoul-wrong-review) ────────────────────────────
interface WrongWord {
  korean: string;
  vietnamese: string;
  pronunciation: string;
  example: string;
  exampleVi: string;
  lessonId: string;
  lessonTitle: string;
  bookId: string;
  bookColor: string;
  wrongCount: number;
  lastWrong: string;
}

// ─── Save wrong word to localStorage ─────────────────────────────────────────
function saveWrongWord(
  korean: string,
  bookId: string,
  lessonId: string,
  lessonTitle: string
) {
  const book = seoulBooks.find(b => b.id === bookId);
  if (!book) return;
  const lesson = book.lessons.find(l => l.id === lessonId);
  if (!lesson) return;
  const vocab = lesson.vocabulary.find(v => v.korean === korean);
  if (!vocab) return;

  const key = "kts_seoul_wrong_words";
  const stored = localStorage.getItem(key);
  const words: WrongWord[] = stored ? JSON.parse(stored) : [];
  const existing = words.find(w => w.korean === korean);
  if (existing) {
    existing.wrongCount += 1;
    existing.lastWrong = new Date().toISOString();
  } else {
    words.push({
      korean: vocab.korean,
      vietnamese: vocab.vietnamese,
      pronunciation: vocab.pronunciation,
      example: vocab.example,
      exampleVi: vocab.exampleVi,
      lessonId,
      lessonTitle,
      bookId,
      bookColor: book.color,
      wrongCount: 1,
      lastWrong: new Date().toISOString(),
    });
  }
  localStorage.setItem(key, JSON.stringify(words));
}

// ─── Save quiz score to progress ──────────────────────────────────────────────
function saveQuizScore(lessonId: string, score: number, total: number) {
  const key = "kts_seoul_progress";
  const stored = localStorage.getItem(key);
  const progress: Record<string, boolean> = stored ? JSON.parse(stored) : {};
  if (score / total >= 0.6) {
    progress[lessonId] = true;
  }
  localStorage.setItem(key, JSON.stringify(progress));

  // Save quiz history for stats charts
  const historyKey = "kts_seoul_quiz_history";
  const historyStored = localStorage.getItem(historyKey);
  const history: Array<{ bookId: string; lessonId: string; date: string; score: number; total: number }> =
    historyStored ? JSON.parse(historyStored) : [];
  // Extract bookId from lessonId (e.g. "3B-L13" → "3B")
  const bookId = lessonId.split("-L")[0] || lessonId;
  history.push({ bookId, lessonId, date: new Date().toISOString(), score, total });
  // Keep last 500 entries
  if (history.length > 500) history.splice(0, history.length - 500);
  localStorage.setItem(historyKey, JSON.stringify(history));

  // Update unified streak
  const streak = recordActivity(1);
  // Award XP bonus for streak
  if (streak.currentStreak > 1) {
    const xpKey = "kts_xp_total";
    const xpStored = localStorage.getItem(xpKey);
    const xpData = xpStored ? JSON.parse(xpStored) : { total: 0 };
    const bonus = Math.min(streak.currentStreak * 5, 50); // max 50 XP bonus
    xpData.total = (xpData.total || 0) + bonus;
    localStorage.setItem(xpKey, JSON.stringify(xpData));
  }
}

// ─── Grammar questions per lesson ───────────────────────────────────────────
interface GrammarQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  pattern: string;
  koreanWord?: string; // for wrong word tracking
}

function generateGrammarQuestions(bookId: string, lessonNumber: number): GrammarQuestion[] {
  const book = seoulBooks.find(b => b.id === bookId);
  if (!book) return [];
  const lesson = book.lessons.find(l => l.lessonNumber === lessonNumber);
  if (!lesson) return [];

  const questions: GrammarQuestion[] = [];

  // Generate questions from grammar points
  lesson.grammarPoints.forEach((gp, gpIdx) => {
    gp.examples.forEach((ex, exIdx) => {
      if (questions.length >= 10) return;
      questions.push({
        id: `gp-${gpIdx}-${exIdx}-trans`,
        question: `Câu "${ex.korean}" có nghĩa là gì?`,
        options: shuffleWithCorrect(ex.vietnamese, [
          "Tôi không biết điều đó.",
          "Hãy thử làm một lần xem.",
          "Bạn có thể giúp tôi không?",
          "Thời tiết hôm nay đẹp.",
        ]),
        answer: 0,
        explanation: `"${ex.korean}" = "${ex.vietnamese}". Mẫu ngữ pháp: ${gp.pattern}`,
        pattern: gp.pattern,
      });
    });

    if (questions.length < 10 && gp.examples.length > 0) {
      const wrongOptions = generateWrongPatternOptions(gp.pattern);
      questions.push({
        id: `gp-${gpIdx}-usage`,
        question: `Mẫu ngữ pháp "${gp.pattern}" được dùng để diễn đạt điều gì?`,
        options: shuffleWithCorrect(gp.explanation.split(".")[0], wrongOptions),
        answer: 0,
        explanation: gp.explanation,
        pattern: gp.pattern,
      });
    }
  });

  // Generate questions from vocabulary
  const vocab = lesson.vocabulary.slice(0, 20);
  vocab.forEach((v, idx) => {
    if (questions.length >= 15) return;
    const wrongVocab = vocab.filter((_, i) => i !== idx).slice(0, 3).map(w => w.vietnamese);
    if (wrongVocab.length < 3) return;
    questions.push({
      id: `vocab-${idx}`,
      question: `"${v.korean}" (${v.pronunciation}) có nghĩa là gì?`,
      options: shuffleWithCorrect(v.vietnamese, wrongVocab),
      answer: 0,
      explanation: `"${v.korean}" = "${v.vietnamese}". Ví dụ: ${v.example} — ${v.exampleVi}`,
      pattern: "Từ vựng",
      koreanWord: v.korean,
    });
  });

  return shuffleArray(questions).slice(0, 10);
}

function shuffleWithCorrect(correct: string, wrongs: string[]): string[] {
  const options = [correct, ...wrongs.slice(0, 3)];
  return shuffleArray(options);
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateWrongPatternOptions(pattern: string): string[] {
  const pool = [
    "Diễn đạt sự so sánh giữa hai đối tượng",
    "Hỏi về thời gian và địa điểm",
    "Diễn đạt hành động đang xảy ra",
    "Diễn đạt điều kiện và kết quả",
    "Diễn đạt sự cho phép hoặc cấm đoán",
    "Diễn đạt mong muốn và hy vọng",
    "Diễn đạt nguyên nhân và lý do",
    "Diễn đạt thứ tự hành động",
  ];
  return shuffleArray(pool).slice(0, 3);
}

// ─── Lesson selector ─────────────────────────────────────────────────────────
function LessonSelector({
  onStart,
}: {
  onStart: (bookId: string, lessonNumber: number, lessonTitle: string, lessonId: string) => void;
}) {
  const [selectedBook, setSelectedBook] = useState("2B");

  const book = seoulBooks.find(b => b.id === selectedBook);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Thi thử theo bài</h1>
        <p className="text-white/50 text-sm">Kiểm tra từ vựng và ngữ pháp từng bài học Seoul</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {seoulBooks.map(b => (
          <button
            key={b.id}
            onClick={() => setSelectedBook(b.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              selectedBook === b.id ? "text-white" : "bg-app-card/50 text-white/50 hover:bg-app-card/70 hover:text-white/70"
            }`}
            style={selectedBook === b.id ? { backgroundColor: b.color, color: "#000" } : {}}
          >
            {b.name}
          </button>
        ))}
      </div>

      {book && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {book.lessons.map(lesson => {
            const hasGrammar = lesson.grammarPoints.length > 0;
            const vocabCount = lesson.vocabulary.length;
            return (
              <button
                key={lesson.id}
                onClick={() => onStart(book.id, lesson.lessonNumber, lesson.titleVi, lesson.id)}
                className="bg-app-card/50 hover:bg-white/8 border border-app-border hover:border-white/15 rounded-xl p-4 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: `${book.color}20`, color: book.color }}
                  >
                    {lesson.lessonNumber}
                  </div>
                  <div className="flex items-center gap-1">
                    {hasGrammar && (
                      <span className="text-[10px] bg-app-accent-success/15 text-app-accent-success px-2 py-0.5 rounded-full">Ngữ pháp</span>
                    )}
                    <span className="text-[10px] bg-white/8 text-app-text-secondary px-2 py-0.5 rounded-full">{vocabCount} từ</span>
                  </div>
                </div>
                <p className="text-white/80 text-sm font-medium group-hover:text-white transition-colors leading-snug">{lesson.titleVi}</p>
                <p className="text-white/35 text-xs mt-1">{lesson.title}</p>
                <div className="mt-3 flex items-center gap-1 text-app-text-muted text-xs">
                  <div className="w-3 h-3 flex items-center justify-center"><i className="ri-question-line text-xs"></i></div>
                  <span>~10 câu hỏi</span>
                  <span className="mx-1">·</span>
                  <div className="w-3 h-3 flex items-center justify-center"><i className="ri-time-line text-xs"></i></div>
                  <span>~5 phút</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Quiz session ─────────────────────────────────────────────────────────────
interface QuizState {
  questions: GrammarQuestion[];
  current: number;
  selected: number | null;
  answers: (number | null)[];
  finished: boolean;
  startTime: number;
  wrongWordsSaved: string[];
}

function QuizSession({
  bookId,
  lessonNumber,
  lessonTitle,
  lessonId,
  onBack,
}: {
  bookId: string;
  lessonNumber: number;
  lessonTitle: string;
  lessonId: string;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const [state, setState] = useState<QuizState>(() => ({
    questions: generateGrammarQuestions(bookId, lessonNumber),
    current: 0,
    selected: null,
    answers: [],
    finished: false,
    startTime: Date.now(),
    wrongWordsSaved: [],
  }));

  const correctTexts = useMemo(
    () => state.questions.map(q => q.options[q.answer]),
    [state.questions]
  );

  const handleSelect = (idx: number) => {
    if (state.selected !== null) return;
    setState(prev => ({ ...prev, selected: idx }));
  };

  const handleNext = () => {
    const current = state.questions[state.current];
    const isCorrect = state.selected !== null && current.options[state.selected] === correctTexts[state.current];

    // Save wrong word if vocab question and answered incorrectly
    if (!isCorrect && current.koreanWord && state.selected !== null) {
      saveWrongWord(current.koreanWord, bookId, lessonId, lessonTitle);
    }

    const newAnswers = [...state.answers, state.selected];
    const isLast = state.current === state.questions.length - 1;

    if (isLast) {
      const score = newAnswers.filter((ans, i) => {
        const q = state.questions[i];
        return ans !== null && q.options[ans] === correctTexts[i];
      }).length;
      saveQuizScore(lessonId, score, state.questions.length);
      setState(prev => ({ ...prev, answers: newAnswers, finished: true }));
    } else {
      setState(prev => ({
        ...prev,
        answers: newAnswers,
        current: prev.current + 1,
        selected: null,
      }));
    }
  };

  if (state.questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-app-card/50 rounded-full">
          <i className="ri-information-line text-2xl text-app-text-secondary"></i>
        </div>
        <p className="text-white/60 mb-4">Bài học này chưa có câu hỏi.</p>
        <button onClick={onBack} className="px-4 py-2 bg-app-card/70 rounded-lg text-white/70 text-sm cursor-pointer">Quay lại</button>
      </div>
    );
  }

  if (state.finished) {
    const score = state.answers.filter((ans, i) => {
      const q = state.questions[i];
      return ans !== null && q.options[ans] === correctTexts[i];
    }).length;
    const total = state.questions.length;
    const pct = Math.round((score / total) * 100);
    const elapsed = Math.round((Date.now() - state.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const wrongCount = total - score;

    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-app-card/50 border border-app-border rounded-2xl p-8 text-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold ${
            pct >= 80 ? "bg-emerald-500/20 text-app-accent-success" : pct >= 60 ? "bg-app-accent-primary/20 text-app-accent-primary" : "bg-red-500/20 text-red-400"
          }`}>
            {pct}%
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            {pct >= 80 ? "Xuất sắc!" : pct >= 60 ? "Khá tốt!" : "Cần ôn thêm!"}
          </h2>
          <p className="text-white/50 text-sm mb-4">{lessonTitle}</p>
          <div className="flex justify-center gap-6 text-sm">
            <div>
              <p className="text-app-text-muted text-xs">Đúng</p>
              <p className="text-app-accent-success font-bold text-lg">{score}/{total}</p>
            </div>
            <div>
              <p className="text-app-text-muted text-xs">Thời gian</p>
              <p className="text-white/70 font-bold text-lg">{mins}:{secs.toString().padStart(2, "0")}</p>
            </div>
            {wrongCount > 0 && (
              <div>
                <p className="text-app-text-muted text-xs">Từ sai</p>
                <p className="text-red-400 font-bold text-lg">{wrongCount}</p>
              </div>
            )}
          </div>
          {pct >= 60 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-app-accent-success text-xs">
              <i className="ri-checkbox-circle-line"></i>
              <span>Bài học đã được đánh dấu hoàn thành!</span>
            </div>
          )}
        </div>

        {wrongCount > 0 && (
          <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="ri-error-warning-line text-red-400 text-sm"></i>
              <p className="text-red-300 text-sm font-semibold">Đã lưu {wrongCount} từ sai vào danh sách ôn tập</p>
            </div>
            <p className="text-app-text-secondary text-xs">Vào "Ôn tập từ sai Seoul" để ôn lại những từ này.</p>
            <button
              onClick={() => navigate("/seoul-wrong-review")}
              className="mt-3 flex items-center gap-2 text-red-400 text-xs hover:text-red-300 cursor-pointer transition-colors"
            >
              <i className="ri-arrow-right-line"></i>Đến trang ôn tập từ sai
            </button>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {state.questions.map((q, i) => {
            const userAns = state.answers[i];
            const isCorrect = userAns !== null && q.options[userAns] === correctTexts[i];
            return (
              <div key={q.id} className={`rounded-xl p-4 border ${isCorrect ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                <div className="flex items-start gap-2 mb-2">
                  <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 ${isCorrect ? "text-app-accent-success" : "text-red-400"}`}>
                    <i className={isCorrect ? "ri-checkbox-circle-line" : "ri-close-circle-line"}></i>
                  </div>
                  <p className="text-white/80 text-sm">{q.question}</p>
                </div>
                {!isCorrect && (
                  <div className="ml-7 space-y-1">
                    <p className="text-red-400/70 text-xs">Bạn chọn: {userAns !== null ? q.options[userAns] : "Không trả lời"}</p>
                    <p className="text-app-accent-success/70 text-xs">Đáp án đúng: {correctTexts[i]}</p>
                  </div>
                )}
                <p className="ml-7 text-app-text-muted text-xs mt-1">{q.explanation}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setState({
              questions: generateGrammarQuestions(bookId, lessonNumber),
              current: 0, selected: null, answers: [], finished: false,
              startTime: Date.now(), wrongWordsSaved: [],
            })}
            className="flex-1 py-3 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 border border-app-accent-primary/20 rounded-xl text-app-accent-primary text-sm font-medium transition-all cursor-pointer"
          >
            Làm lại
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-3 bg-app-card/50 hover:bg-app-card/70 border border-app-border rounded-xl text-white/70 text-sm font-medium transition-all cursor-pointer"
          >
            Chọn bài khác
          </button>
        </div>
      </div>
    );
  }

  const current = state.questions[state.current];
  const correctText = correctTexts[state.current];
  const isLast = state.current === state.questions.length - 1;

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1 text-app-text-secondary hover:text-white/70 text-sm cursor-pointer">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
          Quay lại
        </button>
        <div className="text-center">
          <p className="text-white/60 text-xs">{lessonTitle}</p>
          <p className="text-app-text-muted text-[10px]">Câu {state.current + 1}/{state.questions.length}</p>
        </div>
        <div className="text-right">
          <p className="text-app-accent-primary text-sm font-bold">
            {state.answers.filter((a, i) => a !== null && state.questions[i].options[a] === correctTexts[i]).length}
            <span className="text-app-text-muted">/{state.current}</span>
          </p>
        </div>
      </div>

      <div className="h-1.5 bg-white/8 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-app-accent-primary rounded-full transition-all duration-300" style={{ width: `${(state.current / state.questions.length) * 100}%` }} />
      </div>

      <div className="mb-4">
        <span className="text-[10px] bg-white/8 text-app-text-secondary px-2 py-1 rounded-full">{current.pattern}</span>
      </div>

      <div className="bg-app-card/50 border border-app-border rounded-2xl p-6 mb-4">
        <p className="text-white text-base leading-relaxed">{current.question}</p>
      </div>

      <div className="space-y-2 mb-6">
        {current.options.map((opt, idx) => {
          const isSelected = state.selected === idx;
          const isCorrectOpt = opt === correctText;
          let cls = "bg-app-card/50 border-app-border text-white/70 hover:bg-white/8 hover:border-white/20 cursor-pointer";
          if (state.selected !== null) {
            if (isCorrectOpt) cls = "bg-app-accent-success/15 border-emerald-500/40 text-emerald-300";
            else if (isSelected) cls = "bg-red-500/15 border-red-500/40 text-red-300";
            else cls = "bg-app-surface/50 border-app-border text-app-text-muted";
          }
          return (
            <button key={idx} onClick={() => handleSelect(idx)} className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${cls}`}>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white/8 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
                {state.selected !== null && isCorrectOpt && (
                  <div className="ml-auto w-4 h-4 flex items-center justify-center"><i className="ri-checkbox-circle-fill text-app-accent-success"></i></div>
                )}
                {state.selected !== null && isSelected && !isCorrectOpt && (
                  <div className="ml-auto w-4 h-4 flex items-center justify-center"><i className="ri-close-circle-fill text-red-400"></i></div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {state.selected !== null && (
        <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 mb-4">
          <p className="text-white/50 text-xs leading-relaxed">{current.explanation}</p>
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={state.selected === null}
        className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
          state.selected !== null ? "bg-app-accent-primary text-black hover:bg-app-accent-primary/90 cursor-pointer" : "bg-app-card/50 text-app-text-muted cursor-not-allowed"
        }`}
      >
        {isLast ? "Xem kết quả" : "Câu tiếp theo"}
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SeoulLessonQuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<{
    bookId: string;
    lessonNumber: number;
    lessonTitle: string;
    lessonId: string;
  } | null>(() => {
    const s = location.state as { bookId?: string; lessonNumber?: number; lessonTitle?: string; lessonId?: string } | null;
    if (s?.bookId && s?.lessonId && s?.lessonNumber != null && s?.lessonTitle) {
      return { bookId: s.bookId, lessonNumber: s.lessonNumber, lessonTitle: s.lessonTitle, lessonId: s.lessonId };
    }
    return null;
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-app-bg px-4 py-8">
        {session ? (
          <QuizSession
            bookId={session.bookId}
            lessonNumber={session.lessonNumber}
            lessonTitle={session.lessonTitle}
            lessonId={session.lessonId}
            onBack={() => setSession(null)}
          />
        ) : (
          <LessonSelector
            onStart={(bookId, lessonNumber, lessonTitle, lessonId) =>
              setSession({ bookId, lessonNumber, lessonTitle, lessonId })
            }
          />
        )}
      </div>
    </DashboardLayout>
  );
}
