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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EPS_EXAMS.map(exam => (
            <div
              key={exam.id}
              className="bg-gradient-to-br from-app-card to-app-card2 border border-app-border rounded-2xl p-6 hover:border-app-accent-primary/50 hover:shadow-lg hover:shadow-app-accent-primary/10 transition-all cursor-pointer group"
              onClick={() => handleStartExam(exam)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white group-hover:text-app-accent-primary transition-colors">
                  {exam.title}
                </h3>
                <div className="w-12 h-12 rounded-full bg-app-accent-primary/10 flex items-center justify-center group-hover:bg-app-accent-primary group-hover:text-white transition-all">
                  <i className="ri-file-list-3-line text-xl text-app-accent-primary group-hover:text-white" />
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-app-text-secondary">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <i className="ri-time-line text-blue-400" />
                  </div>
                  <span className="font-medium">{exam.duration} phút</span>
                </div>
                <div className="flex items-center gap-3 text-app-text-secondary">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <i className="ri-question-line text-emerald-400" />
                  </div>
                  <span className="font-medium">{exam.questions.length} câu hỏi</span>
                </div>
              </div>

              <button className="w-full py-4 rounded-xl bg-gradient-to-r from-app-accent-primary to-app-accent-primary/80 text-white font-bold hover:from-app-accent-primary/90 hover:to-app-accent-primary/70 transition-all shadow-lg shadow-app-accent-primary/25 group-hover:shadow-app-accent-primary/40">
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
          <div className={`px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 ${
            timeRemaining < 300 
              ? "bg-rose-500/10 text-rose-400 border-2 border-rose-500/20 animate-pulse" 
              : "bg-gradient-to-r from-app-card to-app-card2 text-white border border-app-border"
          }`}>
            <i className="ri-time-line" />
            {formatTime(timeRemaining)}
          </div>
          <div className="bg-gradient-to-r from-app-card to-app-card2 px-6 py-3 rounded-xl text-white font-bold border border-app-border">
            Câu {currentQuestionIndex + 1} / {selectedExam.questions.length}
          </div>
        </div>
        <button
          onClick={handleSubmitExam}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-app-accent-primary to-app-accent-primary/80 text-white font-bold hover:from-app-accent-primary/90 hover:to-app-accent-primary/70 transition-all shadow-lg shadow-app-accent-primary/25"
        >
          Nộp bài
        </button>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="bg-gradient-to-br from-app-card to-app-card2 border border-app-border rounded-3xl p-8 mb-6 shadow-xl">
          {currentQuestion.image && (
            <div className="mb-6">
              <img 
                src={currentQuestion.image} 
                alt="" 
                className="max-w-2xl rounded-2xl mx-auto shadow-2xl"
              />
            </div>
          )}
          <p className="text-white text-xl font-medium mb-8 leading-relaxed">
            {currentQuestion.question}
          </p>
          
          <div className="space-y-4">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(currentQuestion.id, idx)}
                className={`w-full p-5 rounded-2xl text-left transition-all font-medium text-lg ${
                  currentAnswer?.selectedOption === idx
                    ? "bg-gradient-to-r from-app-accent-primary to-app-accent-primary/80 text-white border-2 border-app-accent-primary shadow-lg shadow-app-accent-primary/25"
                    : "bg-app-card text-app-text-secondary hover:bg-app-card2 hover:text-white border-2 border-transparent"
                }`}
              >
                <span className="font-bold mr-4 text-xl">{idx + 1}.</span>
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
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-app-card to-app-card2 text-white font-bold hover:from-app-card2 hover:to-app-card transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg"
        >
          <i className="ri-arrow-left-line text-xl" />
          Câu trước
        </button>
        
        {currentQuestionIndex === selectedExam.questions.length - 1 ? (
          <button
            onClick={handleSubmitExam}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-app-accent-primary to-app-accent-primary/80 text-white font-bold hover:from-app-accent-primary/90 hover:to-app-accent-primary/70 transition-all shadow-lg shadow-app-accent-primary/25 flex items-center gap-3"
          >
            Nộp bài
            <i className="ri-check-line text-xl" />
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-app-accent-primary to-app-accent-primary/80 text-white font-bold hover:from-app-accent-primary/90 hover:to-app-accent-primary/70 transition-all shadow-lg shadow-app-accent-primary/25 flex items-center gap-3"
          >
            Câu tiếp
            <i className="ri-arrow-right-line text-xl" />
          </button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="mt-8 bg-gradient-to-br from-app-card to-app-card2 border border-app-border rounded-3xl p-6 shadow-xl">
        <p className="text-app-text-secondary text-sm font-medium mb-4">Danh sách câu hỏi</p>
        <div className="flex flex-wrap gap-3">
          {selectedExam.questions.map((q, idx) => {
            const answered = answers.find(a => a.questionId === q.id);
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-12 h-12 rounded-xl font-bold transition-all text-lg ${
                  idx === currentQuestionIndex
                    ? "bg-gradient-to-r from-app-accent-primary to-app-accent-primary/80 text-white shadow-lg shadow-app-accent-primary/25"
                    : answered
                    ? "bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/20"
                    : "bg-app-card text-app-text-secondary hover:bg-app-card2 border-2 border-transparent"
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
