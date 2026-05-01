import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { epsLessons, EpsVocabItem } from "@/mocks/epsLessons";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ReviewCard {
  vocab: EpsVocabItem;
  lessonId: number;
  lessonTitle: string;
}

interface LessonProgress {
  completed: boolean;
  score: number;
  lastStudied: string;
}

type CardState = "question" | "answer" | "correct" | "wrong";
type ReviewMode = "random" | "wrong_only";

function getRandomVocab(count: number, studiedLessonIds: number[]): ReviewCard[] {
  const sourceLessons = studiedLessonIds.length > 0
    ? epsLessons.filter(l => studiedLessonIds.includes(l.id) && l.vocabulary.length > 0)
    : epsLessons.filter(l => l.vocabulary.length > 0 && l.id <= 10);

  const allCards: ReviewCard[] = [];
  sourceLessons.forEach(lesson => {
    lesson.vocabulary.forEach(vocab => {
      allCards.push({ vocab, lessonId: lesson.id, lessonTitle: lesson.titleVi });
    });
  });

  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getWrongVocab(
  vocabHistory: Record<string, { correct: number; wrong: number }>,
  count: number
): ReviewCard[] {
  const wrongCards: ReviewCard[] = [];

  epsLessons.forEach(lesson => {
    lesson.vocabulary.forEach(vocab => {
      const key = `${lesson.id}_${vocab.korean}`;
      const hist = vocabHistory[key];
      if (hist && hist.wrong > 0) {
        wrongCards.push({ vocab, lessonId: lesson.id, lessonTitle: lesson.titleVi });
      }
    });
  });

  // Sort by most wrong first
  wrongCards.sort((a, b) => {
    const keyA = `${a.lessonId}_${a.vocab.korean}`;
    const keyB = `${b.lessonId}_${b.vocab.korean}`;
    return (vocabHistory[keyB]?.wrong || 0) - (vocabHistory[keyA]?.wrong || 0);
  });

  const shuffled = [...wrongCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default function EpsQuickReviewPage() {
  const navigate = useNavigate();
  const [lessonProgress] = useLocalStorage<Record<number, LessonProgress>>("eps_lesson_progress", {});
  const [vocabHistory, setVocabHistory] = useLocalStorage<Record<string, { correct: number; wrong: number }>>("eps_vocab_review_history", {});

  const studiedLessonIds = Object.entries(lessonProgress)
    .filter(([, p]) => p.completed || p.score > 0)
    .map(([id]) => parseInt(id));

  const wrongCount = Object.values(vocabHistory).filter(h => h.wrong > 0).length;

  const [mode, setMode] = useState<ReviewMode>("random");
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardState, setCardState] = useState<CardState>("question");
  const [results, setResults] = useState<{ correct: number; wrong: number; wrongCards: ReviewCard[] }>({ correct: 0, wrong: 0, wrongCards: [] });
  const [finished, setFinished] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showModeSelect, setShowModeSelect] = useState(true);

  const initCards = useCallback((selectedMode: ReviewMode) => {
    let newCards: ReviewCard[];
    if (selectedMode === "wrong_only") {
      newCards = getWrongVocab(vocabHistory, 10);
    } else {
      newCards = getRandomVocab(10, studiedLessonIds);
    }
    setCards(newCards);
    setCurrentIndex(0);
    setCardState("question");
    setResults({ correct: 0, wrong: 0, wrongCards: [] });
    setFinished(false);
    setShowExample(false);
    setStreak(0);
    setShowModeSelect(false);
  }, [vocabHistory, studiedLessonIds.join(",")]);

  useEffect(() => {
    // Don't auto-init, show mode select first
  }, []);

  const currentCard = cards[currentIndex];

  const handleReveal = () => {
    setCardState("answer");
  };

  const handleResult = (isCorrect: boolean) => {
    if (!currentCard) return;

    const key = `${currentCard.lessonId}_${currentCard.vocab.korean}`;
    setVocabHistory(prev => ({
      ...prev,
      [key]: {
        correct: (prev[key]?.correct || 0) + (isCorrect ? 1 : 0),
        wrong: (prev[key]?.wrong || 0) + (isCorrect ? 0 : 1),
      },
    }));

    setResults(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      wrongCards: isCorrect ? prev.wrongCards : [...prev.wrongCards, currentCard],
    }));

    if (isCorrect) {
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }

    setCardState(isCorrect ? "correct" : "wrong");

    setTimeout(() => {
      if (currentIndex + 1 >= cards.length) {
        setFinished(true);
      } else {
        setCurrentIndex(i => i + 1);
        setCardState("question");
        setShowExample(false);
      }
    }, 800);
  };

  const accuracy = currentIndex > 0 ? Math.round((results.correct / currentIndex) * 100) : 0;

  // Mode selection screen
  if (showModeSelect) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#0f1117] text-white">
          <div className="bg-[#1a1d2e] border-b border-white/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <i className="ri-arrow-left-line text-white/60"></i>
              </button>
              <div>
                <h1 className="text-lg font-bold text-white">Ôn tập nhanh</h1>
                <p className="text-white/40 text-xs">Chọn chế độ ôn tập</p>
              </div>
            </div>
          </div>

          <div className="max-w-lg mx-auto px-4 py-10 space-y-4">
            {/* Stats summary */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#e8c84a]">{studiedLessonIds.length}</p>
                <p className="text-white/40 text-xs mt-1">Bài đã học</p>
              </div>
              <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-400">{wrongCount}</p>
                <p className="text-white/40 text-xs mt-1">Từ cần ôn lại</p>
              </div>
            </div>

            <h2 className="text-white/70 text-sm font-medium mb-3">Chọn chế độ ôn tập:</h2>

            {/* Mode: Random */}
            <button
              onClick={() => { setMode("random"); initCards("random"); }}
              className="w-full bg-white/3 hover:bg-[#e8c84a]/10 border border-white/8 hover:border-[#e8c84a]/30 rounded-2xl p-5 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#e8c84a]/10 border border-[#e8c84a]/20 flex-shrink-0">
                  <i className="ri-shuffle-line text-[#e8c84a] text-xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Ôn tập ngẫu nhiên</h3>
                  <p className="text-white/40 text-sm leading-relaxed">10 từ ngẫu nhiên từ các bài đã học. Luyện tập đa dạng để ghi nhớ lâu hơn.</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[#e8c84a] text-xs font-medium bg-[#e8c84a]/10 px-2 py-0.5 rounded-full">10 từ</span>
                    <span className="text-white/30 text-xs">Từ {studiedLessonIds.length > 0 ? studiedLessonIds.length : "tất cả"} bài</span>
                  </div>
                </div>
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-arrow-right-line text-white/20 group-hover:text-[#e8c84a] transition-colors"></i>
                </div>
              </div>
            </button>

            {/* Mode: Wrong only */}
            <button
              onClick={() => {
                if (wrongCount === 0) return;
                setMode("wrong_only");
                initCards("wrong_only");
              }}
              disabled={wrongCount === 0}
              className={`w-full border rounded-2xl p-5 text-left transition-all group ${
                wrongCount > 0
                  ? "bg-white/3 hover:bg-red-500/10 border-white/8 hover:border-red-500/30 cursor-pointer"
                  : "bg-white/2 border-white/5 cursor-not-allowed opacity-50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 flex-shrink-0">
                  <i className="ri-error-warning-line text-red-400 text-xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Ôn từ sai</h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {wrongCount > 0
                      ? `Ôn lại ${wrongCount} từ bạn đã trả lời sai trước đó. Tập trung vào điểm yếu.`
                      : "Chưa có từ nào bị sai. Hãy ôn tập ngẫu nhiên trước!"}
                  </p>
                  {wrongCount > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-red-400 text-xs font-medium bg-red-500/10 px-2 py-0.5 rounded-full">{Math.min(wrongCount, 10)} từ</span>
                      <span className="text-white/30 text-xs">Ưu tiên từ sai nhiều nhất</span>
                    </div>
                  )}
                </div>
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className={`ri-arrow-right-line text-white/20 ${wrongCount > 0 ? "group-hover:text-red-400" : ""} transition-colors`}></i>
                </div>
              </div>
            </button>

            {wrongCount === 0 && (
              <p className="text-center text-white/30 text-xs">
                Ôn tập ngẫu nhiên trước để tích lũy từ sai, sau đó dùng chế độ "Ôn từ sai"
              </p>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (cards.length === 0 && !showModeSelect) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-2xl bg-[#e8c84a]/10">
              <i className="ri-loader-4-line text-[#e8c84a] text-2xl animate-spin"></i>
            </div>
            <p className="text-white/50">Đang tải từ vựng...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1117] text-white">
        {/* Header */}
        <div className="bg-[#1a1d2e] border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowModeSelect(true)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <i className="ri-arrow-left-line text-white/60"></i>
              </button>
              <div>
                <h1 className="text-lg font-bold text-white">
                  {mode === "wrong_only" ? "Ôn từ sai" : "Ôn tập nhanh"}
                </h1>
                <p className="text-white/40 text-xs">
                  {mode === "wrong_only" ? "Tập trung vào từ đã sai" : "10 từ ngẫu nhiên từ các bài đã học"}
                </p>
              </div>
            </div>
            {!finished && (
              <div className="flex items-center gap-4">
                {streak >= 3 && (
                  <div className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 rounded-full px-2.5 py-1">
                    <i className="ri-fire-line text-orange-400 text-xs"></i>
                    <span className="text-orange-400 text-xs font-bold">{streak} liên tiếp!</span>
                  </div>
                )}
                {mode === "wrong_only" && (
                  <div className="flex items-center gap-1 bg-red-500/15 border border-red-500/20 rounded-full px-2.5 py-1">
                    <i className="ri-error-warning-line text-red-400 text-xs"></i>
                    <span className="text-red-400 text-xs font-medium">Từ sai</span>
                  </div>
                )}
                <div className="text-white/40 text-sm">
                  {currentIndex + 1} / {cards.length}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-8">
          {!finished ? (
            <>
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                      <span className="text-emerald-400 text-sm font-medium">{results.correct}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <span className="text-red-400 text-sm font-medium">{results.wrong}</span>
                    </div>
                  </div>
                  <span className="text-white/30 text-xs">{accuracy}% chính xác</span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentIndex) / cards.length) * 100}%`,
                      background: mode === "wrong_only"
                        ? "linear-gradient(90deg, #ef4444, #f59e0b)"
                        : "linear-gradient(90deg, #e8c84a, #34d399)",
                    }}
                  ></div>
                </div>
              </div>

              {/* Card */}
              {currentCard && (
                <div
                  className={`rounded-2xl border p-8 text-center transition-all duration-300 ${
                    cardState === "correct"
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : cardState === "wrong"
                      ? "border-red-500/50 bg-red-500/10"
                      : "border-white/10 bg-white/3"
                  }`}
                >
                  {/* Lesson badge */}
                  <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-6">
                    <i className="ri-book-open-line text-[#e8c84a] text-xs"></i>
                    <span className="text-white/50 text-xs">{currentCard.lessonTitle}</span>
                    {mode === "wrong_only" && (() => {
                      const key = `${currentCard.lessonId}_${currentCard.vocab.korean}`;
                      const hist = vocabHistory[key];
                      return hist?.wrong > 0 ? (
                        <span className="text-red-400 text-xs ml-1">• Sai {hist.wrong}x</span>
                      ) : null;
                    })()}
                  </div>

                  {/* Korean word */}
                  <div className="mb-2">
                    <p className="text-4xl font-bold text-white mb-1">{currentCard.vocab.korean}</p>
                    <p className="text-white/30 text-sm">[{currentCard.vocab.pronunciation}]</p>
                  </div>

                  {/* Answer reveal */}
                  {cardState === "question" ? (
                    <div className="mt-8 space-y-3">
                      <button
                        onClick={handleReveal}
                        className={`w-full py-3.5 border rounded-xl font-semibold transition-all cursor-pointer ${
                          mode === "wrong_only"
                            ? "bg-red-500/15 hover:bg-red-500/25 border-red-500/30 text-red-300"
                            : "bg-[#e8c84a]/15 hover:bg-[#e8c84a]/25 border-[#e8c84a]/30 text-[#e8c84a]"
                        }`}
                      >
                        Xem nghĩa
                      </button>
                      <button
                        onClick={() => setShowExample(!showExample)}
                        className="w-full py-2.5 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl text-white/40 text-sm transition-all cursor-pointer"
                      >
                        {showExample ? "Ẩn ví dụ" : "Xem ví dụ"}
                      </button>
                      {showExample && (
                        <div className="bg-white/5 rounded-xl p-3 text-left">
                          <p className="text-white/70 text-sm">{currentCard.vocab.example}</p>
                          <p className="text-white/40 text-xs mt-1">{currentCard.vocab.exampleVi}</p>
                        </div>
                      )}
                    </div>
                  ) : cardState === "answer" ? (
                    <div className="mt-6 space-y-4">
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-2xl font-bold text-[#e8c84a] mb-1">{currentCard.vocab.vietnamese}</p>
                        <p className="text-white/40 text-sm">{currentCard.vocab.example}</p>
                        <p className="text-white/30 text-xs mt-0.5">{currentCard.vocab.exampleVi}</p>
                      </div>
                      <p className="text-white/40 text-sm">Bạn có nhớ không?</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleResult(false)}
                          className="py-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 rounded-xl text-red-400 font-semibold transition-all cursor-pointer"
                        >
                          <i className="ri-close-line mr-1"></i>
                          Chưa nhớ
                        </button>
                        <button
                          onClick={() => handleResult(true)}
                          className="py-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl text-emerald-400 font-semibold transition-all cursor-pointer"
                        >
                          <i className="ri-check-line mr-1"></i>
                          Đã nhớ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8">
                      {cardState === "correct" ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-400">
                          <i className="ri-checkbox-circle-fill text-2xl"></i>
                          <span className="text-lg font-bold">Chính xác!</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-red-400">
                          <i className="ri-close-circle-fill text-2xl"></i>
                          <span className="text-lg font-bold">Cần ôn thêm</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Mini word list */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {cards.map((card, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i < currentIndex
                        ? results.wrongCards.some(w => w.vocab.korean === cards[i]?.vocab.korean)
                          ? "bg-red-500/30 text-red-400 border border-red-500/40"
                          : "bg-emerald-500/30 text-emerald-400 border border-emerald-500/40"
                        : i === currentIndex
                        ? "bg-[#e8c84a]/20 text-[#e8c84a] border border-[#e8c84a]/40"
                        : "bg-white/5 text-white/20 border border-white/10"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Results screen */
            <div className="text-center space-y-6">
              <div className={`w-20 h-20 flex items-center justify-center mx-auto rounded-2xl border ${
                mode === "wrong_only"
                  ? "bg-red-500/10 border-red-500/20"
                  : "bg-[#e8c84a]/10 border-[#e8c84a]/20"
              }`}>
                <i className={`text-3xl ${mode === "wrong_only" ? "ri-shield-check-line text-red-400" : "ri-trophy-line text-[#e8c84a]"}`}></i>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Hoàn thành!</h2>
                <p className="text-white/40">
                  {mode === "wrong_only" ? "Bạn đã ôn lại các từ sai" : `Bạn đã ôn tập ${cards.length} từ vựng`}
                </p>
              </div>

              {/* Score */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                  <p className="text-3xl font-bold text-emerald-400">{results.correct}</p>
                  <p className="text-emerald-400/60 text-xs mt-1">Đúng</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-3xl font-bold text-red-400">{results.wrong}</p>
                  <p className="text-red-400/60 text-xs mt-1">Sai</p>
                </div>
                <div className={`border rounded-xl p-4 ${mode === "wrong_only" ? "bg-red-500/10 border-red-500/20" : "bg-[#e8c84a]/10 border-[#e8c84a]/20"}`}>
                  <p className={`text-3xl font-bold ${mode === "wrong_only" ? "text-red-400" : "text-[#e8c84a]"}`}>
                    {Math.round((results.correct / cards.length) * 100)}%
                  </p>
                  <p className={`text-xs mt-1 ${mode === "wrong_only" ? "text-red-400/60" : "text-[#e8c84a]/60"}`}>Chính xác</p>
                </div>
              </div>

              {/* Wrong words list */}
              {results.wrongCards.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 text-left">
                  <h3 className="text-red-400 text-sm font-semibold mb-3 flex items-center gap-2">
                    <i className="ri-error-warning-line"></i>
                    Từ cần ôn thêm ({results.wrongCards.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {results.wrongCards.map((card, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-white font-medium text-sm">{card.vocab.korean}</span>
                        <span className="text-white/50 text-xs">{card.vocab.vietnamese}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                <p className="text-white/70 text-sm">
                  {results.correct === cards.length
                    ? mode === "wrong_only" ? "Tuyệt vời! Bạn đã nhớ lại tất cả các từ sai!" : "Xuất sắc! Bạn nhớ tất cả các từ!"
                    : results.correct >= cards.length * 0.8
                    ? "Rất tốt! Tiếp tục ôn tập để ghi nhớ lâu hơn."
                    : results.correct >= cards.length * 0.5
                    ? "Khá tốt! Hãy ôn lại những từ chưa nhớ."
                    : "Cần ôn tập thêm. Đừng nản lòng, hãy thử lại!"}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {results.wrongCards.length > 0 && (
                  <button
                    onClick={() => { setMode("wrong_only"); initCards("wrong_only"); }}
                    className="w-full py-3.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 rounded-xl text-red-400 font-semibold transition-all cursor-pointer"
                  >
                    <i className="ri-error-warning-line mr-2"></i>
                    Ôn lại từ sai ({results.wrongCards.length} từ)
                  </button>
                )}
                <button
                  onClick={() => setShowModeSelect(true)}
                  className="w-full py-3.5 bg-[#e8c84a]/15 hover:bg-[#e8c84a]/25 border border-[#e8c84a]/30 rounded-xl text-[#e8c84a] font-semibold transition-all cursor-pointer"
                >
                  <i className="ri-refresh-line mr-2"></i>
                  Ôn tập lại
                </button>
                <button
                  onClick={() => navigate("/eps-lessons")}
                  className="w-full py-3 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl text-white/60 transition-all cursor-pointer"
                >
                  Đến trang bài học
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
