import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UnifiedExam } from "@/components/feature/UnifiedExam";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { EPS_EXAMPLES, SEOUL_EXAMPLES, TOPIK_EXAMPLES } from "@/mocks/examSamples";
import { indexedDB } from "@/lib/indexedDB";

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
    totalQuestions: 30,
    timeLimit: 1800,
    description: "Đề thi EPS-TOPIK với 30 câu hỏi mẫu. Luyện thi chứng chỉ lao động Hàn Quốc.",
  },
  {
    id: "seoul",
    title: "Seoul",
    subtitle: "Giáo trình du học",
    icon: "ri-book-3-line",
    color: "#60a5fa",
    bgColor: "rgba(96,165,250,0.08)",
    totalQuestions: 10,
    timeLimit: 1500,
    description: "Đề thi dựa trên giáo trình Seoul 1A-4B với 10 câu hỏi mẫu. Phù hợp cho học sinh du học.",
  },
  {
    id: "topik",
    title: "TOPIK I",
    subtitle: "Chứng chỉ tiếng Hàn",
    icon: "ri-survey-line",
    color: "#f472b6",
    bgColor: "rgba(244,114,182,0.08)",
    totalQuestions: 40,
    timeLimit: 3000,
    description: "Đề thi TOPIK I: 20 câu nghe + 20 câu đọc. Thời gian 50 phút.",
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
          <p className="text-app-text-secondary text-xs">{exam.subtitle}</p>
        </div>
        <div className="w-5 h-5 flex items-center justify-center">
          <i className="ri-arrow-right-line text-sm" style={{ color: exam.color }}></i>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-app-text-secondary">
        <span>{exam.totalQuestions} câu hỏi</span>
        <span>·</span>
        <span>{Math.floor(exam.timeLimit / 60)} phút</span>
      </div>
    </button>
  );
}

export default function ExamHubPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeExam, setActiveExam] = useState<ExamOption | null>(null);
  const [examResult, setExamResult] = useState<{ score: number; total: number; timeUsed: number } | null>(null);
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadExamHistory();
  }, []);

  const loadExamHistory = async () => {
    try {
      const history = await indexedDB.getAllExams();
      setExamHistory(history.sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime()));
    } catch (error) {
      console.error("Failed to load exam history:", error);
    }
  };

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

  // Get real exam questions from samples
  const getExamQuestions = useCallback((examType: string) => {
    switch (examType) {
      case "eps":
        return EPS_EXAMPLES;
      case "seoul":
        return SEOUL_EXAMPLES;
      case "topik":
        return TOPIK_EXAMPLES;
      default:
        return [];
    }
  }, []);

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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: activeExam.bgColor }}>
                    <i className={`${activeExam.icon} text-lg`} style={{ color: activeExam.color }}></i>
                  </div>
                  <div>
                    <h1 className="text-white font-semibold">{activeExam.title}</h1>
                    <p className="text-white/60 text-sm">{activeExam.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/learning-hub")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-app-surface/50 text-app-text-secondary border border-app-border hover:text-white/60 transition-all"
                >
                  <i className="ri-dashboard-line"></i>
                  Learning Hub
                </button>
              </div>
            </div>

            {examResult ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-green-500/10 rounded-full mb-4">
                  <i className="ri-check-line text-green-400 text-3xl"></i>
                </div>
                <h2 className="text-white text-xl font-semibold mb-2">Hoàn thành!</h2>
                <p className="text-white/60 text-sm mb-6">
                  Bạn đã hoàn thành {examResult.total} câu hỏi trong {Math.floor(examResult.timeUsed / 60)} phút
                </p>
                
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div>
                    <p className="text-3xl font-bold text-green-400">
                      {Math.round((examResult.score / examResult.total) * 100)}%
                    </p>
                    <p className="text-app-text-secondary text-xs">Điểm số</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{examResult.score}/{examResult.total}</p>
                    <p className="text-app-text-secondary text-xs">Đúng</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {Math.floor(examResult.timeUsed / 60)}:{(examResult.timeUsed % 60).toString().padStart(2, '0')}
                    </p>
                    <p className="text-app-text-secondary text-xs">Thời gian</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleBack} className="px-6 py-2.5 rounded-xl bg-app-card/50 hover:bg-app-card/70 text-white text-sm font-medium transition-colors">
                    Quay lại hub
                  </button>
                  <button 
                    onClick={() => {
                      setExamResult(null);
                    }}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ backgroundColor: activeExam.color, color: "#0f1117" }}
                  >
                    Làm lại
                  </button>
                </div>
              </div>
            ) : (
              <UnifiedExam
                examType={activeExam.id}
                userId={user?.id || ""}
                questions={getExamQuestions(activeExam.id)}
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

            <p className="text-app-text-secondary text-xs mb-3">Tất cả đề thi</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXAM_OPTIONS.map(exam => (
                <ExamCard key={exam.id} exam={exam} onSelect={() => handleExamSelect(exam)} />
              ))}
            </div>

            {/* Exam History Section */}
            {examHistory.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-app-text-secondary text-xs mb-0">Lịch sử thi</p>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-app-text-secondary text-xs hover:text-white transition-colors"
                  >
                    {showHistory ? "Ẩn" : "Hiện"}
                  </button>
                </div>

                {showHistory && (
                  <>
                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-app-card border border-app-border rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">{examHistory.length}</p>
                        <p className="text-app-text-secondary text-xs">Tổng số lần thi</p>
                      </div>
                      <div className="bg-app-card border border-app-border rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-400">
                          {Math.round(examHistory.reduce((sum, h) => sum + (h.score / h.total) * 100, 0) / examHistory.length)}%
                        </p>
                        <p className="text-app-text-secondary text-xs">Điểm trung bình</p>
                      </div>
                      <div className="bg-app-card border border-app-border rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">
                          {Math.max(...examHistory.map(h => Math.round((h.score / h.total) * 100)))}%
                        </p>
                        <p className="text-app-text-secondary text-xs">Điểm cao nhất</p>
                      </div>
                    </div>

                    {/* History List */}
                    <div className="space-y-3">
                      {examHistory.slice(0, 10).map((history, index) => {
                        const examConfig = EXAM_OPTIONS.find(e => e.id === history.exam_type);
                        const percentage = Math.round((history.score / history.total) * 100);
                        const date = new Date(history.taken_at);
                        const formattedDate = date.toLocaleDateString('vi-VN', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <div
                            key={history.id || index}
                            className="bg-app-card border border-app-border rounded-xl p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-10 h-10 flex items-center justify-center rounded-lg"
                                  style={{ backgroundColor: examConfig?.bgColor || "#4ade8015" }}
                                >
                                  <i 
                                    className={`${examConfig?.icon || "ri-file-list-3-line"} text-lg`}
                                    style={{ color: examConfig?.color || "#4ade80" }}
                                  />
                                </div>
                                <div>
                                  <p className="text-white font-medium text-sm">{examConfig?.title || history.exam_type}</p>
                                  <p className="text-app-text-faint text-xs">{formattedDate}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-bold ${percentage >= 80 ? "text-green-400" : percentage >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                                  {percentage}%
                                </p>
                                <p className="text-app-text-faint text-xs">{history.score}/{history.total}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {examHistory.length > 10 && (
                      <p className="text-app-text-faint text-xs text-center mt-4">
                        Hiển thị 10 lần thi gần nhất (tổng {examHistory.length} lần)
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
