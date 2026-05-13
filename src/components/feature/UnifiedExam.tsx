import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { indexedDB, ExamHistoryData } from "@/lib/indexedDB";
import { computeXP, deriveLevel } from "@/lib/xp";

interface UnifiedExamProps {
  examType: string; // 'eps', 'seoul', 'topik'
  userId: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }>;
  timeLimit?: number; // in seconds
  onComplete?: (result: { score: number; total: number; timeUsed: number }) => void;
}

const EXAM_CONFIG = {
  eps: { name: "EPS-TOPIK", color: "#4ade80", icon: "ri-file-list-3-line" },
  seoul: { name: "Seoul", color: "#60a5fa", icon: "ri-book-3-line" },
  topik: { name: "TOPIK", color: "#f472b6", icon: "ri-survey-line" },
};

export function UnifiedExam({ examType, userId, questions, timeLimit = 1800, onComplete }: UnifiedExamProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeUsed, setTimeUsed] = useState(0);

  const config = EXAM_CONFIG[examType as keyof typeof EXAM_CONFIG] || EXAM_CONFIG.eps;

  // Timer
  useEffect(() => {
    if (isCompleted || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCompleted, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);

    const isCorrect = index === questions[currentIndex].correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: index }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsCompleted(true);
    const finalTimeUsed = timeLimit - timeRemaining;
    setTimeUsed(finalTimeUsed);

    // Save to IndexedDB
    const examId = `${examType}_${Date.now()}`;
    const examData: ExamHistoryData = {
      id: examId,
      exam_type: examType,
      score: score,
      total: questions.length,
      time_used: finalTimeUsed,
      correct_ids: Object.keys(answers).filter(id => answers[id] === questions.find(q => q.id === id)?.correctIndex),
      taken_at: new Date().toISOString(),
      questions: questions,
      user_answers: answers,
    };

    try {
      await indexedDB.putExam(examData);

      // Sync to Supabase
      await supabase.from("exam_results").insert({
        user_id: userId,
        exam_type: examType,
        score: examData.score,
        total: examData.total,
        time_used: examData.time_used,
        correct_ids: examData.correct_ids,
        taken_at: examData.taken_at,
      });

      // Update local storage with latest exam result (so other pages see it)
      const localKey = "kts_eps_exam_results";
      const existingResults = JSON.parse(localStorage.getItem(localKey) || "[]");
      existingResults.push({
        date: examData.taken_at,
        score: examData.score,
        total: examData.total,
        correctIds: examData.correct_ids,
      });
      localStorage.setItem(localKey, JSON.stringify(existingResults));

      // Trigger leaderboard sync by upserting to user_progress
      // Recompute stats from all exam results + flashcard data
      const allResults = existingResults as Array<{ score: number; total: number; correctIds?: string[] }>;
      const flashcardKnown = JSON.parse(localStorage.getItem("kts_flashcard_known") || "{}");
      const streak = JSON.parse(localStorage.getItem("kts_streak") || '{"count":0}');
      
      const wordsLearned = Object.values(flashcardKnown).filter(Boolean).length;
      const bestScore = allResults.length > 0
        ? Math.max(...allResults.map(r => Math.round((r.score / r.total) * 100)))
        : 0;
      const avgScore = allResults.length > 0
        ? Math.round(allResults.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / allResults.length)
        : 0;
      const totalCorrect = allResults.reduce((sum, r) => sum + (r.correctIds?.length ?? r.score ?? 0), 0);

      const xp = computeXP({
        streakDays: streak.count || 0,
        bestScorePct: bestScore,
        averageScorePct: avgScore,
        wordsLearned,
        totalCorrectAnswers: totalCorrect,
        validExamsCount: allResults.length,
      });
      const level = deriveLevel(bestScore);

      await supabase.from("user_progress").upsert({
        user_id: userId,
        xp,
        level,
        streak_count: streak.count || 0,
        streak_last_date: streak.lastDate || null,
        best_score: bestScore,
        words_learned: wordsLearned,
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    } catch (err) {
      console.error("Failed to save exam result:", err);
    }

    onComplete?.({ score, total: questions.length, timeUsed: finalTimeUsed });
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnswers({});
    setTimeRemaining(timeLimit);
    setIsCompleted(false);
    setTimeUsed(0);
  };

  if (isCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 flex items-center justify-center rounded-full mb-6" style={{ backgroundColor: `${config.color}15` }}>
          <i className={`${config.icon} text-4xl`} style={{ color: config.color }}></i>
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">Hoàn thành!</h2>
        <p className="text-white/60 text-sm mb-6">{config.name}</p>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-3xl font-bold" style={{ color: config.color }}>{percentage}%</p>
            <p className="text-app-text-secondary text-xs">Điểm</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{score}/{questions.length}</p>
            <p className="text-app-text-secondary text-xs">Đúng</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{formatTime(timeUsed)}</p>
            <p className="text-app-text-secondary text-xs">Thời gian</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleRestart} className="px-6 py-2.5 rounded-xl bg-app-card/50 hover:bg-app-card/70 text-white text-sm font-medium transition-colors">
            Làm lại
          </button>
          <button onClick={() => window.location.href = "/learning-hub"} className="px-6 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ backgroundColor: config.color, color: "#0f1117" }}>
            Về Learning Hub
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${config.color}15` }}>
            <i className={`${config.icon} text-sm`} style={{ color: config.color }}></i>
          </div>
          <span className="text-white/60 text-sm">{config.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-app-text-secondary text-xs">
            Câu {currentIndex + 1} / {questions.length}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-card/50">
            <i className="ri-timer-line text-app-text-secondary text-sm"></i>
            <span className={`text-sm font-medium ${timeRemaining < 60 ? "text-red-400" : "text-white"}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-2 bg-app-card/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, backgroundColor: config.color }}
        ></div>
      </div>

      {/* Question card */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-6 mb-6">
        <h3 className="text-white text-lg font-medium mb-6">{currentQuestion.question}</h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            let bgColor = "bg-app-surface/50";
            let borderColor = "border-app-border";
            let textColor = "text-white";

            if (showExplanation) {
              if (index === currentQuestion.correctIndex) {
                bgColor = "bg-green-500/10";
                borderColor = "border-green-500/30";
                textColor = "text-green-400";
              } else if (selectedAnswer === index && index !== currentQuestion.correctIndex) {
                bgColor = "bg-red-500/10";
                borderColor = "border-red-500/30";
                textColor = "text-red-400";
              }
            } else if (selectedAnswer === index) {
              bgColor = "bg-app-card/70";
              borderColor = "border-white/20";
            }

            return (
              <button
                key={index}
                onClick={() => !showExplanation && handleAnswer(index)}
                disabled={showExplanation}
                className={`w-full p-4 rounded-xl border text-left transition-all ${bgColor} ${borderColor} ${textColor} ${
                  !showExplanation ? "hover:border-app-border hover:bg-app-card/50 cursor-pointer" : "cursor-default"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full border border-white/20 text-xs">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-sm">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {showExplanation && currentQuestion.explanation && (
          <div className="mt-4 p-4 rounded-lg bg-app-surface/50 border border-app-border">
            <p className="text-white/60 text-xs">
              <strong className="text-white/80">Giải thích:</strong> {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Next button */}
      {showExplanation && (
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl font-medium transition-colors"
          style={{ backgroundColor: config.color, color: "#0f1117" }}
        >
          {currentIndex < questions.length - 1 ? "Câu tiếp theo" : "Hoàn thành"}
        </button>
      )}
    </div>
  );
}
