import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UnifiedExam } from "@/components/feature/UnifiedExam";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { EPS_EXAMPLES, SEOUL_EXAMPLES, TOPIK_EXAMPLES } from "@/mocks/examSamples";
import { indexedDB } from "@/lib/indexedDB";

interface ExamItem {
  id: string;
  title: string;
  questions: number;
  minutes: number;
  path?: string;        // navigate directly (real exams)
  examType?: string;    // use UnifiedExam (mock exams)
  badge?: string;
}

interface ExamSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bg: string;
  items: ExamItem[];
}

const EXAM_SECTIONS: ExamSection[] = [
  {
    id: "eps",
    title: "EPS-TOPIK",
    subtitle: "Lao động Hàn Quốc",
    icon: "ri-headphone-line",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.06)",
    items: [
      { id: "eps_01", title: "Đề Số 01", questions: 40, minutes: 50, path: "/eps-de1", badge: "Audio TTS" },
      { id: "eps_02", title: "Đề Số 02", questions: 40, minutes: 50, path: "/eps-de2", badge: "Audio TTS" },
    ],
  },
  {
    id: "topik",
    title: "TOPIK I",
    subtitle: "Chứng chỉ tiếng Hàn",
    icon: "ri-survey-line",
    color: "#f472b6",
    bg: "rgba(244,114,182,0.06)",
    items: [
      { id: "topik_mock", title: "Thử nghiệm", questions: 40, minutes: 50, examType: "topik", badge: "Mẫu" },
    ],
  },
];

// Keep for UnifiedExam lookup
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

const EXAM_OPTIONS_COMPAT: ExamOption[] = [
  { id: "eps",   title: "EPS-TOPIK", subtitle: "Lao động",            icon: "ri-file-list-3-line", color: "#4ade80", bgColor: "rgba(74,222,128,0.08)",   totalQuestions: 50, timeLimit: 1800, description: "" },
  { id: "topik", title: "TOPIK I",   subtitle: "Chứng chỉ tiếng Hàn",icon: "ri-survey-line",      color: "#f472b6", bgColor: "rgba(244,114,182,0.08)", totalQuestions: 40, timeLimit: 3000, description: "" },
];

// Shape of an exam-history row returned from indexedDB.examHistory.
interface ExamQuestion {
  id: string;
  question?: string;
  options?: string[];
  correctIndex: number;
  explanation?: string;
}
interface ExamHistoryRow {
  id: string | number;
  exam_type: string;
  score: number;
  total: number;
  taken_at: string;
  time_used?: number;
  questions?: ExamQuestion[];
  user_answers?: Record<string, number>;
}

function SectionGroup({ section, onSelectItem }: { section: ExamSection; onSelectItem: (item: ExamItem) => void }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: section.color + "25", backgroundColor: section.bg }}>
      {/* Section header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: section.color + "20" }}>
        <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: section.color + "20" }}>
          <i className={`${section.icon} text-base`} style={{ color: section.color }} />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">{section.title}</p>
          <p className="text-app-text-secondary text-[11px] mt-0.5">{section.subtitle}</p>
        </div>
      </div>
      {/* Items */}
      <div className="divide-y" style={{ borderColor: section.color + "15" }}>
        {section.items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/3 transition-all cursor-pointer"
          >
            <i className="ri-file-list-line text-sm flex-shrink-0" style={{ color: section.color + "99" }} />
            <span className="flex-1 text-white text-sm font-medium">{item.title}</span>
            {item.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: section.color + "20", color: section.color }}>
                {item.badge}
              </span>
            )}
            <span className="text-app-text-secondary text-xs whitespace-nowrap">{item.questions} câu · {item.minutes} phút</span>
            <i className="ri-arrow-right-s-line text-sm" style={{ color: section.color + "80" }} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ExamHubPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeExam, setActiveExam] = useState<ExamOption | null>(null);
  const [examResult, setExamResult] = useState<{ score: number; total: number; timeUsed: number } | null>(null);
  const [examHistory, setExamHistory] = useState<ExamHistoryRow[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedHistory, setSelectedHistory] = useState<ExamHistoryRow | null>(null);

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

  const handleSelectItem = (item: ExamItem) => {
    if (item.path) {
      navigate(item.path);
      return;
    }
    if (item.examType) {
      const compat = EXAM_OPTIONS_COMPAT.find(e => e.id === item.examType);
      if (compat) { setActiveExam(compat); setExamResult(null); }
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">Exam Hub</h1>
              <p className="text-white/60 text-sm">Luyện thi EPS-TOPIK & TOPIK chất lượng cao</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* LEFT — Exam sections */}
              <div className="lg:col-span-3">
                <p className="text-app-text-secondary text-xs mb-3">Đề thi</p>
                <div className="flex flex-col gap-3">
                  {EXAM_SECTIONS.map(section => (
                    <SectionGroup key={section.id} section={section} onSelectItem={handleSelectItem} />
                  ))}
                </div>
              </div>

              {/* RIGHT — Stats + recent results */}
              <div className="lg:col-span-2">
                {examHistory.length > 0 ? (
                  <>
                    {/* Quick stats */}
                    <p className="text-app-text-secondary text-xs mb-3">Thống kê</p>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: "Lần thi", value: examHistory.length },
                        { label: "Điểm TB", value: `${Math.round(examHistory.reduce((s,h) => s + (h.score/h.total)*100, 0) / examHistory.length)}%` },
                        { label: "Cao nhất", value: `${Math.max(...examHistory.map(h => Math.round((h.score/h.total)*100)))}%` },
                      ].map(stat => (
                        <div key={stat.label} className="bg-app-card border border-app-border rounded-xl p-3 text-center">
                          <p className="text-white font-bold text-lg leading-none">{stat.value}</p>
                          <p className="text-app-text-secondary text-[10px] mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    {/* Recent results */}
                    <p className="text-app-text-secondary text-xs mb-3">Gần đây</p>
                    <div className="flex flex-col gap-2">
                      {examHistory.slice(0, 5).map((h: ExamHistoryRow, i: number) => {
                        const cfg = EXAM_OPTIONS_COMPAT.find(e => e.id === h.exam_type);
                        const pct = Math.round((h.score / h.total) * 100);
                        return (
                          <button
                            key={h.id || i}
                            onClick={() => setSelectedHistory(h)}
                            className="flex items-center gap-3 px-3 py-2.5 bg-app-card border border-app-border rounded-xl hover:border-app-border/50 transition-all cursor-pointer text-left"
                          >
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: cfg?.bgColor || '#4ade8015' }}>
                              <i className={`${cfg?.icon || 'ri-file-list-3-line'} text-sm`} style={{ color: cfg?.color || '#4ade80' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs font-medium truncate">{cfg?.title || h.exam_type}</p>
                              <p className="text-app-text-faint text-[10px]">{new Date(h.taken_at).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <span className={`text-xs font-bold ${pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>{pct}%</span>
                          </button>
                        );
                      })}
                    </div>
                    {examHistory.length > 5 && (
                      <button
                        onClick={() => setShowHistory(true)}
                        className="mt-3 w-full text-center text-app-text-secondary text-xs hover:text-white transition-colors py-2"
                      >
                        Xem thêm {examHistory.length - 5} lần khác...
                      </button>
                    )}
                  </>
                ) : (
                  <div className="rounded-2xl border border-app-border bg-app-card/30 p-6 text-center">
                    <i className="ri-bar-chart-2-line text-2xl text-app-text-secondary mb-2 block" />
                    <p className="text-app-text-secondary text-sm">Chưa có lịch sử thi</p>
                    <p className="text-app-text-faint text-xs mt-1">Hoàn thành 1 bài thi để xem thống kê</p>
                  </div>
                )}
              </div>
            </div>

            {/* Full history collapsible (below, only if showHistory) */}
            {showHistory && examHistory.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-app-text-secondary text-xs">Toàn bộ lịch sử</p>
                  <button onClick={() => setShowHistory(false)} className="text-app-text-secondary text-xs hover:text-white transition-colors">Ẩn</button>
                </div>

                  <>
                    {/* Filter Buttons */}
                    <div className="flex gap-2 mb-4">
                      {["all","eps","topik"].map(f => (
                        <button key={f} onClick={() => setFilterType(f)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            filterType === f ? "bg-white text-black" : "bg-app-card/50 text-app-text-secondary hover:text-white"
                          }`}>
                          {f === "all" ? "Tất cả" : f === "eps" ? "EPS-TOPIK" : "TOPIK I"}
                        </button>
                      ))}
                    </div>

                    {/* Filtered History */}
                    {(() => {
                      const filteredHistory = filterType === "all"
                        ? examHistory
                        : examHistory.filter((h: ExamHistoryRow) => h.exam_type === filterType);

                      if (filteredHistory.length === 0) {
                        return (
                          <div className="bg-app-card border border-app-border rounded-xl p-8 text-center">
                            <p className="text-app-text-secondary text-sm">Không có lịch sử thi cho loại đề này</p>
                          </div>
                        );
                      }

                      return (
                        <>
                          {/* Statistics */}
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-app-card border border-app-border rounded-xl p-4 text-center">
                              <p className="text-2xl font-bold text-white">{filteredHistory.length}</p>
                              <p className="text-app-text-secondary text-xs">Tổng số lần thi</p>
                            </div>
                            <div className="bg-app-card border border-app-border rounded-xl p-4 text-center">
                              <p className="text-2xl font-bold text-green-400">
                                {Math.round(filteredHistory.reduce((sum, h) => sum + (h.score / h.total) * 100, 0) / filteredHistory.length)}%
                              </p>
                              <p className="text-app-text-secondary text-xs">Điểm trung bình</p>
                            </div>
                            <div className="bg-app-card border border-app-border rounded-xl p-4 text-center">
                              <p className="text-2xl font-bold text-white">
                                {Math.max(...filteredHistory.map(h => Math.round((h.score / h.total) * 100)))}%
                              </p>
                              <p className="text-app-text-secondary text-xs">Điểm cao nhất</p>
                            </div>
                          </div>

                          {/* History List */}
                          <div className="space-y-3">
                            {filteredHistory.slice(0, 10).map((history, index) => {
                              const examConfig = EXAM_OPTIONS_COMPAT.find(e => e.id === history.exam_type);
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
                                <button
                                  key={history.id || index}
                                  onClick={() => setSelectedHistory(history)}
                                  className="bg-app-card border border-app-border rounded-xl p-4 w-full text-left hover:border-app-border/50 transition-all"
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
                                </button>
                              );
                            })}
                          </div>

                          {filteredHistory.length > 10 && (
                            <p className="text-app-text-faint text-xs text-center mt-4">
                              Hiển thị 10 lần thi gần nhất (tổng {filteredHistory.length} lần)
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </>
              </div>
            )}

            {/* Detailed Result Modal */}
            {selectedHistory && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-app-bg border border-app-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="p-6 border-b border-app-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 flex items-center justify-center rounded-xl"
                          style={{ backgroundColor: EXAM_OPTIONS_COMPAT.find(e => e.id === selectedHistory.exam_type)?.bgColor || "#4ade8015" }}
                        >
                          <i
                            className={`${EXAM_OPTIONS_COMPAT.find(e => e.id === selectedHistory.exam_type)?.icon || "ri-file-list-3-line"} text-2xl`}
                            style={{ color: EXAM_OPTIONS_COMPAT.find(e => e.id === selectedHistory.exam_type)?.color || "#4ade80" }}
                          />
                        </div>
                        <div>
                          <h2 className="text-white font-semibold">{EXAM_OPTIONS_COMPAT.find(e => e.id === selectedHistory.exam_type)?.title || selectedHistory.exam_type}</h2>
                          <p className="text-app-text-faint text-xs">
                            {new Date(selectedHistory.taken_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedHistory(null)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-white/60 hover:text-white transition-colors"
                      >
                        <i className="ri-close-line text-lg"></i>
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {selectedHistory.questions && selectedHistory.user_answers ? (
                      <div className="space-y-4">
                        {selectedHistory.questions.map((question: ExamQuestion, index: number) => {
                          const userAnswer = selectedHistory.user_answers[question.id];
                          const isCorrect = userAnswer === question.correctIndex;
                          const isAnswered = userAnswer !== undefined;

                          return (
                            <div
                              key={question.id}
                              className={`bg-app-card border rounded-xl p-4 ${isCorrect ? "border-green-500/30" : isAnswered ? "border-red-500/30" : "border-app-border"}`}
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <div
                                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                    isCorrect ? "bg-green-500/20 text-green-400" : isAnswered ? "bg-red-500/20 text-red-400" : "bg-app-card/50 text-app-text-secondary"
                                  }`}
                                >
                                  {isCorrect ? "✓" : isAnswered ? "✗" : index + 1}
                                </div>
                                <p className="text-white text-sm flex-1">{question.question}</p>
                              </div>

                              <div className="space-y-2 ml-9">
                                {question.options.map((option: string, optIndex: number) => {
                                  let bgColor = "bg-app-surface/50";
                                  let borderColor = "border-app-border";
                                  let textColor = "text-white";

                                  if (optIndex === question.correctIndex) {
                                    bgColor = "bg-green-500/10";
                                    borderColor = "border-green-500/30";
                                    textColor = "text-green-400";
                                  } else if (userAnswer === optIndex && optIndex !== question.correctIndex) {
                                    bgColor = "bg-red-500/10";
                                    borderColor = "border-red-500/30";
                                    textColor = "text-red-400";
                                  }

                                  return (
                                    <div
                                      key={optIndex}
                                      className={`p-3 rounded-lg border text-sm ${bgColor} ${borderColor} ${textColor}`}
                                    >
                                      <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                                      {option}
                                    </div>
                                  );
                                })}
                              </div>

                              {question.explanation && (
                                <div className="mt-3 ml-9 p-3 rounded-lg bg-app-surface/50 border border-app-border">
                                  <p className="text-white/60 text-xs">
                                    <strong className="text-white/80">Giải thích:</strong> {question.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-app-text-secondary">Chi tiết câu hỏi không khả dụng cho kỳ thi này.</p>
                        <p className="text-app-text-faint text-xs mt-2">Chỉ các kỳ thi mới sẽ lưu chi tiết.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
