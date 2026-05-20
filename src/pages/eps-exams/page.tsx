import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { EPS_EXAMS, EPSExam, EPSQuestion } from "@/data/epsExams";
import { useXPSystem } from "@/hooks/useXPSystem";

interface UserAnswer {
  questionId: string;
  selectedOption: number | null;
}

interface ExamResult {
  examId: string;
  score: number;
  total: number;
  answers: UserAnswer[];
  timeSpent: number; // in seconds
  completedAt: string;
}

export default function EPSExamsPage() {
  const navigate = useNavigate();
  const { awardXP } = useXPSystem();
  const [selectedExam, setSelectedExam] = useState<EPSExam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = (exam: EPSExam) => {
    setSelectedExam(exam);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeRemaining(exam.duration * 60);
    setIsTimerRunning(true);
    setShowResult(false);
    setExamResult(null);
    setReviewMode(false);
  };

  const handleAnswer = (questionId: string, selectedOption: number) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { ...a, selectedOption } : a);
      }
      return [...prev, { questionId, selectedOption }];
    });
  };

  const handleNextQuestion = () => {
    if (selectedExam && currentQuestionIndex < selectedExam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitExam = () => {
    if (!selectedExam) return;

    setIsTimerRunning(false);
    
    let correctCount = 0;
    const processedAnswers = selectedExam.questions.map(q => {
      const userAnswer = answers.find(a => a.questionId === q.id);
      if (userAnswer && userAnswer.selectedOption === q.correctAnswer) {
        correctCount++;
      }
      return {
        questionId: q.id,
        selectedOption: userAnswer?.selectedOption || null
      };
    });

    const result: ExamResult = {
      examId: selectedExam.id,
      score: correctCount,
      total: selectedExam.questions.length,
      answers: processedAnswers,
      timeSpent: selectedExam.duration * 60 - timeRemaining,
      completedAt: new Date().toISOString()
    };

    setExamResult(result);
    setShowResult(true);

    // Award XP
    const percentage = (correctCount / selectedExam.questions.length) * 100;
    let xpAmount = 0;
    if (percentage >= 80) xpAmount = 50;
    else if (percentage >= 60) xpAmount = 30;
    else if (percentage >= 40) xpAmount = 15;
    else xpAmount = 5;

    awardXP({
      type: "manual_bonus",
      amount: xpAmount,
      meta: { reason: `EPS Exam: ${selectedExam.title} (${percentage.toFixed(0)}%)` }
    });

    // Save to localStorage
    const history = JSON.parse(localStorage.getItem("eps_exam_history") || "[]");
    history.push(result);
    localStorage.setItem("eps_exam_history", JSON.stringify(history));
  };

  const handleBackToSelection = () => {
    setSelectedExam(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeRemaining(0);
    setShowResult(false);
    setExamResult(null);
    setReviewMode(false);
  };

  const currentQuestion = selectedExam?.questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers.find(a => a.questionId === currentQuestion.id) : null;

  if (!selectedExam) {
    return (
      <DashboardLayout title="Bộ đề EPS" subtitle="Luyện thi EPS - 6 đề thi chuẩn">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EPS_EXAMS.map(exam => (
            <div
              key={exam.id}
              className="bg-app-card border border-app-border rounded-2xl p-6 hover:border-app-accent-primary/50 transition-all cursor-pointer"
              onClick={() => handleStartExam(exam)}
            >
              <h3 className="text-xl font-bold text-white mb-2">{exam.title}</h3>
              <div className="flex items-center gap-4 text-app-text-secondary text-sm mb-4">
                <span className="flex items-center gap-1">
                  <i className="ri-time-line" />
                  {exam.duration} phút
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-question-line" />
                  {exam.questions.length} câu
                </span>
              </div>
              <button className="w-full py-3 rounded-xl bg-app-accent-primary text-white font-bold hover:bg-app-accent-primary/80 transition-all">
                Bắt đầu làm
              </button>
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (showResult && examResult) {
    const percentage = (examResult.score / examResult.total) * 100;
    
    return (
      <DashboardLayout title={`Kết quả ${selectedExam.title}`} subtitle="Xem kết quả thi">
        <div className="max-w-2xl mx-auto">
          <div className="bg-app-card border border-app-border rounded-2xl p-8 mb-6">
            <div className="text-center mb-8">
              <div className={`text-6xl font-bold mb-4 ${percentage >= 80 ? "text-emerald-400" : percentage >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                {percentage.toFixed(0)}%
              </div>
              <p className="text-app-text-secondary text-lg">
                Bạn làm đúng {examResult.score}/{examResult.total} câu
              </p>
              <p className="text-app-text-faint text-sm mt-2">
                Thời gian: {formatTime(examResult.timeSpent)}
              </p>
            </div>

            <div className="flex gap-4 justify-center mb-8">
              <button
                onClick={() => setReviewMode(true)}
                className="px-6 py-3 rounded-xl bg-app-card text-white font-bold hover:bg-app-card2 transition-all"
              >
                Xem lại đáp án
              </button>
              <button
                onClick={handleBackToSelection}
                className="px-6 py-3 rounded-xl bg-app-accent-primary text-white font-bold hover:bg-app-accent-primary/80 transition-all"
              >
                Làm đề khác
              </button>
            </div>
          </div>

          {reviewMode && (
            <div className="space-y-4">
              {selectedExam.questions.map((q, idx) => {
                const userAnswer = examResult.answers.find(a => a.questionId === q.id);
                const isCorrect = userAnswer?.selectedOption === q.correctAnswer;
                
                return (
                  <div
                    key={q.id}
                    className={`bg-app-card border rounded-xl p-4 ${
                      isCorrect ? "border-emerald-500/20" : "border-rose-500/20"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className={`text-2xl font-bold ${isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                        {isCorrect ? "✓" : "✗"}
                      </span>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-3">
                          Câu {q.number}: {q.question}
                        </p>
                        {q.image && (
                          <img src={q.image} alt="" className="max-w-xs rounded-lg mb-3" />
                        )}
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-lg ${
                                optIdx === q.correctAnswer
                                  ? "bg-emerald-500/10 border border-emerald-500/20"
                                  : optIdx === userAnswer?.selectedOption
                                  ? "bg-rose-500/10 border border-rose-500/20"
                                  : "bg-app-card2"
                              }`}
                            >
                              <span className="text-app-text-secondary mr-2">{optIdx + 1}.</span>
                              <span className={optIdx === q.correctAnswer ? "text-emerald-400" : "text-white"}>
                                {opt}
                              </span>
                              {optIdx === q.correctAnswer && (
                                <span className="text-emerald-400 ml-2">(Đáp án đúng)</span>
                              )}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className="text-app-text-faint text-sm mt-3">
                            Giải thích: {q.explanation}
                          </p>
                        )}
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

  return (
    <DashboardLayout title={selectedExam.title} subtitle={`Câu ${currentQuestionIndex + 1}/${selectedExam.questions.length}`}>
      {/* Timer and Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg font-bold ${timeRemaining < 300 ? "bg-rose-500/10 text-rose-400" : "bg-app-card text-white"}`}>
            <i className="ri-time-line mr-2" />
            {formatTime(timeRemaining)}
          </div>
          <div className="bg-app-card px-4 py-2 rounded-lg text-white">
            {currentQuestionIndex + 1} / {selectedExam.questions.length}
          </div>
        </div>
        <button
          onClick={handleSubmitExam}
          className="px-4 py-2 rounded-lg bg-app-accent-primary text-white font-bold hover:bg-app-accent-primary/80 transition-all"
        >
          Nộp bài
        </button>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="bg-app-card border border-app-border rounded-2xl p-6 mb-6">
          {currentQuestion.image && (
            <img src={currentQuestion.image} alt="" className="max-w-md rounded-lg mb-4 mx-auto" />
          )}
          <p className="text-white text-lg font-medium mb-6">
            {currentQuestion.question}
          </p>
          
          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(currentQuestion.id, idx)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  currentAnswer?.selectedOption === idx
                    ? "bg-app-accent-primary text-white border-2 border-app-accent-primary"
                    : "bg-app-card2 text-app-text-secondary hover:bg-app-card hover:text-white border-2 border-transparent"
                }`}
              >
                <span className="font-bold mr-3">{idx + 1}.</span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 rounded-xl bg-app-card text-white font-bold hover:bg-app-card2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <i className="ri-arrow-left-line" />
          Câu trước
        </button>
        
        {currentQuestionIndex === selectedExam.questions.length - 1 ? (
          <button
            onClick={handleSubmitExam}
            className="px-6 py-3 rounded-xl bg-app-accent-primary text-white font-bold hover:bg-app-accent-primary/80 transition-all flex items-center gap-2"
          >
            Nộp bài
            <i className="ri-check-line" />
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="px-6 py-3 rounded-xl bg-app-accent-primary text-white font-bold hover:bg-app-accent-primary/80 transition-all flex items-center gap-2"
          >
            Câu tiếp
            <i className="ri-arrow-right-line" />
          </button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="mt-6 bg-app-card border border-app-border rounded-2xl p-4">
        <div className="flex flex-wrap gap-2">
          {selectedExam.questions.map((q, idx) => {
            const answered = answers.find(a => a.questionId === q.id);
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                  idx === currentQuestionIndex
                    ? "bg-app-accent-primary text-white"
                    : answered
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                    : "bg-app-card2 text-app-text-secondary hover:bg-app-card"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
