import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UnifiedExam } from "@/components/feature/UnifiedExam";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface ExamOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
  totalQuestions: number;
  timeLimit: number;
  description: string;
}

const EXAM_OPTIONS: ExamOption[] = [
  {
    id: "eps",
    title: "EPS-TOPIK",
    subtitle: "Lao động",
    icon: "ri-file-list-3-line",
    color: "#4ade80",
    bgColor: "rgba(74,222,128,0.08)",
    totalQuestions: 60,
    timeLimit: 1800,
    description: "Đề thi EPS-TOPIK với 60 câu hỏi. Luyện thi chứng chỉ lao động Hàn Quốc.",
  },
  {
    id: "seoul",
    title: "Seoul",
    subtitle: "Giáo trình du học",
    icon: "ri-book-3-line",
    color: "#60a5fa",
    bgColor: "rgba(96,165,250,0.08)",
    totalQuestions: 50,
    timeLimit: 1500,
    description: "Đề thi dựa trên giáo trình Seoul 1A-4B. Phù hợp cho học sinh du học.",
  },
  {
    id: "topik",
    title: "TOPIK",
    subtitle: "Chứng chỉ tiếng Hàn",
    icon: "ri-survey-line",
    color: "#f472b6",
    bgColor: "rgba(244,114,182,0.08)",
    totalQuestions: 70,
    timeLimit: 2100,
    description: "Đề thi TOPIK I và II. Tần suất câu hỏi cao trong kỳ thi thật.",
  },
];

function ExamCard({ exam, onSelect }: { exam: ExamOption; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="w-full p-5 rounded-2xl border text-left transition-all hover:scale-[1.01] cursor-pointer"
      style={{ backgroundColor: exam.bgColor, borderColor: exam.color + "30" }}
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: exam.color + "20" }}>
          <i className={`${exam.icon} text-2xl`} style={{ color: exam.color }}></i>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold">{exam.title}</h3>
          <p className="text-white/40 text-xs">{exam.subtitle}</p>
        </div>
        <div className="w-5 h-5 flex items-center justify-center">
          <i className="ri-arrow-right-line text-sm" style={{ color: exam.color }}></i>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-white/40">
        <span>{exam.totalQuestions} câu hỏi</span>
        <span>·</span>
        <span>{Math.floor(exam.timeLimit / 60)} phút</span>
      </div>
    </button>
  );
}

export default function ExamHubPage() {
  const { user } = useAuth();
  const [activeExam, setActiveExam] = useState<ExamOption | null>(null);
  const [examResult, setExamResult] = useState<{ score: number; total: number; timeUsed: number } | null>(null);

  const handleExamSelect = (exam: ExamOption) => {
    setActiveExam(exam);
    setExamResult(null);
  };

  const handleComplete = (result: { score: number; total: number; timeUsed: number }) => {
    setExamResult(result);
  };

  const handleBack = () => {
    setActiveExam(null);
    setExamResult(null);
  };

  // Mock questions for demo - will be replaced with real data fetch
  const getMockQuestions = (examType: string) => {
    const questions: Array<{
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    }> = [];
    const count = EXAM_OPTIONS.find(e => e.id === examType)?.totalQuestions || 10;

    for (let i = 1; i <= Math.min(count, 10); i++) {
      questions.push({
        id: `${examType}_q_${i}`,
        question: `Câu hỏi ${i} cho ${examType.toUpperCase()}`,
        options: [
          `Đáp án A cho câu ${i}`,
          `Đáp án B cho câu ${i}`,
          `Đáp án C cho câu ${i}`,
          `Đáp án D cho câu ${i}`,
        ],
        correctIndex: Math.floor(Math.random() * 4),
        explanation: `Giải thích cho câu ${i}`,
      });
    }
    return questions;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {activeExam ? (
          <>
            <div className="mb-6">
              <button onClick={handleBack} className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4">
                <i className="ri-arrow-left-line"></i>
                Quay lại
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: activeExam.bgColor }}>
                  <i className={`${activeExam.icon} text-lg`} style={{ color: activeExam.color }}></i>
                </div>
                <div>
                  <h1 className="text-white font-semibold">{activeExam.title}</h1>
                  <p className="text-white/60 text-sm">{activeExam.subtitle}</p>
                </div>
              </div>
            </div>

            {examResult ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-green-500/10 rounded-full mb-4">
                  <i className="ri-check-line text-green-400 text-3xl"></i>
                </div>
                <h2 className="text-white text-xl font-semibold mb-2">Hoàn thành!</h2>
                <p className="text-white/60 text-sm mb-4">
                  Bạn đã hoàn thành {examResult.total} câu hỏi
                </p>
                <div className="flex gap-4 text-sm">
                  <div className="text-green-400">{examResult.score} đúng</div>
                  <div className="text-white/30">{examResult.total - examResult.score} sai</div>
                </div>
                <button onClick={handleBack} className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors">
                  Quay lại hub
                </button>
              </div>
            ) : (
              <UnifiedExam
                examType={activeExam.id}
                userId={user?.id || ""}
                questions={getMockQuestions(activeExam.id)}
                timeLimit={activeExam.timeLimit}
                onComplete={handleComplete}
              />
            )}
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Exam Hub</h1>
              <p className="text-white/60 text-sm">Hệ thống thi thử thống nhất với timer và lịch sử thi</p>
            </div>

            <p className="text-white/40 text-xs mb-3">Tất cả đề thi</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXAM_OPTIONS.map(exam => (
                <ExamCard key={exam.id} exam={exam} onSelect={() => handleExamSelect(exam)} />
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
