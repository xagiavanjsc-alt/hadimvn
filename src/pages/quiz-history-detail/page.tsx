import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuizAttempt {
  id: string;
  date: string;
  mode: string;
  modeLabel: string;
  score: number;
  total: number;
  timeSec: number;
  questions: QuizQuestionRecord[];
}

interface QuizQuestionRecord {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  korean?: string;
  category?: string;
}

// ─── Mock history generator ───────────────────────────────────────────────────
function generateMockHistory(): QuizAttempt[] {
  const modes = [
    { mode: "eps_vocab", label: "Từ vựng EPS" },
    { mode: "topik1", label: "TOPIK I" },
    { mode: "mixed", label: "Tổng hợp" },
    { mode: "daily_challenge", label: "Thử thách hàng ngày" },
  ];

  const sampleQuestions: QuizQuestionRecord[] = [
    { question: "\"행복하다\" có nghĩa là gì?", userAnswer: "Vui vẻ", correctAnswer: "Hạnh phúc", isCorrect: false, explanation: "행복하다 = Hạnh phúc. Vui vẻ là 기쁘다.", korean: "행복하다", category: "Tính cách & Cảm xúc" },
    { question: "\"출근하다\" có nghĩa là gì?", userAnswer: "Đi làm", correctAnswer: "Đi làm", isCorrect: true, explanation: "출근하다 = Đi làm (đến nơi làm việc).", korean: "출근하다", category: "Gia đình & Sinh hoạt" },
    { question: "\"냉장고\" là gì?", userAnswer: "Máy giặt", correctAnswer: "Tủ lạnh", isCorrect: false, explanation: "냉장고 = Tủ lạnh. Máy giặt là 세탁기.", korean: "냉장고", category: "Gia đình & Sinh hoạt" },
    { question: "\"친절하다\" có nghĩa là gì?", userAnswer: "Thân thiện/Tử tế", correctAnswer: "Thân thiện/Tử tế", isCorrect: true, explanation: "친절하다 = Thân thiện, tử tế.", korean: "친절하다", category: "Tính cách & Cảm xúc" },
    { question: "\"횡단보도\" là gì?", userAnswer: "Đèn giao thông", correctAnswer: "Vạch kẻ đường cho người đi bộ", isCorrect: false, explanation: "횡단보도 = Vạch kẻ đường. Đèn giao thông là 신호등.", korean: "횡단보도", category: "Giao thông" },
    { question: "\"성실하다\" có nghĩa là gì?", userAnswer: "Chăm chỉ/Cần cù", correctAnswer: "Chăm chỉ/Cần cù", isCorrect: true, explanation: "성실하다 = Chăm chỉ, cần cù, siêng năng.", korean: "성실하다", category: "Tính cách & Cảm xúc" },
    { question: "\"갈아타다\" có nghĩa là gì?", userAnswer: "Xuống xe", correctAnswer: "Chuyển tuyến/Đổi xe", isCorrect: false, explanation: "갈아타다 = Chuyển tuyến. Xuống xe là 내리다.", korean: "갈아타다", category: "Giao thông" },
    { question: "\"일교차\" là gì?", userAnswer: "Chênh lệch nhiệt độ trong ngày", correctAnswer: "Chênh lệch nhiệt độ trong ngày", isCorrect: true, explanation: "일교차 = Sự chênh lệch nhiệt độ giữa ngày và đêm.", korean: "일교차", category: "Thời tiết" },
    { question: "\"꼼꼼하다\" có nghĩa là gì?", userAnswer: "Vội vàng", correctAnswer: "Cẩn thận/Tỉ mỉ", isCorrect: false, explanation: "꼼꼼하다 = Cẩn thận, tỉ mỉ. Vội vàng là 급하다.", korean: "꼼꼼하다", category: "Tính cách & Cảm xúc" },
    { question: "\"설거지하다\" có nghĩa là gì?", userAnswer: "Rửa bát", correctAnswer: "Rửa bát", isCorrect: true, explanation: "설거지하다 = Rửa bát đĩa sau bữa ăn.", korean: "설거지하다", category: "Gia đình & Sinh hoạt" },
  ];

  const attempts: QuizAttempt[] = [];
  const now = new Date();

  for (let i = 0; i < 15; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const modeInfo = modes[i % modes.length];
    const shuffled = [...sampleQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
    const score = shuffled.filter(q => q.isCorrect).length;

    attempts.push({
      id: `attempt-${i}`,
      date: d.toISOString(),
      mode: modeInfo.mode,
      modeLabel: modeInfo.label,
      score,
      total: shuffled.length,
      timeSec: Math.floor(Math.random() * 90) + 30,
      questions: shuffled,
    });
  }
  return attempts;
}

// ─── Attempt Card ─────────────────────────────────────────────────────────────
function AttemptCard({ attempt, isSelected, onClick }: {
  attempt: QuizAttempt;
  isSelected: boolean;
  onClick: () => void;
}) {
  const pct = Math.round((attempt.score / attempt.total) * 100);
  const color = pct >= 80 ? "#34d399" : pct >= 60 ? "#e8c84a" : pct >= 40 ? "#fb923c" : "#f87171";
  const label = pct >= 80 ? "Xuất sắc" : pct >= 60 ? "Tốt" : pct >= 40 ? "Trung bình" : "Cần cố gắng";
  const date = new Date(attempt.date);
  const dateStr = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
        isSelected ? "border-white/20 bg-white/5" : "border-white/5 bg-[#0f1117] hover:border-white/10"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white/60 text-xs font-medium">{attempt.modeLabel}</span>
            <span className="text-white/20 text-[10px]">·</span>
            <span className="text-white/30 text-[10px]">{dateStr} {timeStr}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">{attempt.score}/{attempt.total}</span>
            <span className="text-xs font-semibold" style={{ color }}>{label}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-white/25 text-[10px]">
            <span><i className="ri-time-line mr-0.5"></i>{attempt.timeSec}s</span>
            <span><i className="ri-close-circle-line mr-0.5 text-red-400/50"></i>{attempt.total - attempt.score} sai</span>
          </div>
        </div>
        <div className="w-12 h-12 relative flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3"
              strokeDasharray={`${pct * 0.942} 94.2`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color }}>{pct}%</span>
        </div>
      </div>
    </button>
  );
}

// ─── Question Detail ──────────────────────────────────────────────────────────
function QuestionDetail({ q, index }: { q: QuizQuestionRecord; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${q.isCorrect ? "border-emerald-500/15" : "border-red-500/15"}`}>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left cursor-pointer hover:bg-white/2 transition-colors"
      >
        <div className={`w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 ${q.isCorrect ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
          <i className={`${q.isCorrect ? "ri-check-line text-emerald-400" : "ri-close-line text-red-400"} text-sm`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/70 text-sm">{index + 1}. {q.question}</p>
          {q.korean && <p className="text-white/30 text-xs mt-0.5">{q.korean} · {q.category}</p>}
        </div>
        <i className={`${expanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-white/25 text-lg flex-shrink-0`}></i>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-white/30 text-xs w-20 flex-shrink-0">Bạn chọn:</span>
            <span className={`text-xs font-medium ${q.isCorrect ? "text-emerald-400" : "text-red-400"}`}>{q.userAnswer}</span>
          </div>
          {!q.isCorrect && (
            <div className="flex items-start gap-2">
              <span className="text-white/30 text-xs w-20 flex-shrink-0">Đáp án đúng:</span>
              <span className="text-emerald-400 text-xs font-medium">{q.correctAnswer}</span>
            </div>
          )}
          <div className="flex items-start gap-2">
            <span className="text-white/30 text-xs w-20 flex-shrink-0">Giải thích:</span>
            <span className="text-white/50 text-xs leading-relaxed">{q.explanation}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QuizHistoryDetailPage() {
  const history = useMemo(() => generateMockHistory(), []);
  const [selectedId, setSelectedId] = useState<string>(history[0]?.id || "");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [showOnlyWrong, setShowOnlyWrong] = useState(false);

  const selectedAttempt = history.find(a => a.id === selectedId) || null;

  const modes = ["all", ...Array.from(new Set(history.map(a => a.mode)))];
  const modeLabels: Record<string, string> = { all: "Tất cả", eps_vocab: "EPS", topik1: "TOPIK I", mixed: "Tổng hợp", daily_challenge: "Thử thách" };

  const filteredHistory = filterMode === "all" ? history : history.filter(a => a.mode === filterMode);

  const displayedQuestions = selectedAttempt
    ? (showOnlyWrong ? selectedAttempt.questions.filter(q => !q.isCorrect) : selectedAttempt.questions)
    : [];

  // Stats
  const totalAttempts = history.length;
  const avgScore = history.length > 0 ? Math.round(history.reduce((s, a) => s + (a.score / a.total) * 100, 0) / history.length) : 0;
  const bestScore = history.length > 0 ? Math.max(...history.map(a => Math.round((a.score / a.total) * 100))) : 0;
  const totalWrong = history.reduce((s, a) => s + (a.total - a.score), 0);

  // Most wrong words
  const wrongWordCount: Record<string, number> = {};
  history.forEach(a => a.questions.filter(q => !q.isCorrect).forEach(q => {
    if (q.korean) wrongWordCount[q.korean] = (wrongWordCount[q.korean] || 0) + 1;
  }));
  const topWrong = Object.entries(wrongWordCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <DashboardLayout
      title="Lịch sử quiz chi tiết"
      subtitle="Xem lại từng câu đã làm, đáp án đúng/sai và giải thích"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng lần làm", value: totalAttempts, icon: "ri-history-line", color: "#e8c84a" },
          { label: "Điểm trung bình", value: `${avgScore}%`, icon: "ri-bar-chart-line", color: "#34d399" },
          { label: "Điểm cao nhất", value: `${bestScore}%`, icon: "ri-trophy-line", color: "#fb923c" },
          { label: "Tổng câu sai", value: totalWrong, icon: "ri-close-circle-line", color: "#f87171" },
        ].map(s => (
          <div key={s.label} className="bg-[#0f1117] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
              </div>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
            <p className="text-white font-bold text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-6">
        {/* Left: attempt list */}
        <div>
          {/* Mode filter */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {modes.map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition-all whitespace-nowrap ${
                  filterMode === mode ? "bg-[#e8c84a]/15 text-[#e8c84a] border border-[#e8c84a]/25" : "bg-white/3 text-white/35 border border-white/8 hover:text-white/55"
                }`}
              >
                {modeLabels[mode] || mode}
              </button>
            ))}
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredHistory.map(attempt => (
              <AttemptCard
                key={attempt.id}
                attempt={attempt}
                isSelected={selectedId === attempt.id}
                onClick={() => setSelectedId(attempt.id)}
              />
            ))}
          </div>
        </div>

        {/* Right: detail */}
        <div>
          {selectedAttempt ? (
            <>
              {/* Attempt header */}
              <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{selectedAttempt.modeLabel}</h3>
                    <p className="text-white/30 text-xs mt-0.5">
                      {new Date(selectedAttempt.date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
                      {" · "}{selectedAttempt.timeSec}s
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-3xl">{selectedAttempt.score}/{selectedAttempt.total}</p>
                    <p className="text-white/40 text-xs">{Math.round((selectedAttempt.score / selectedAttempt.total) * 100)}% chính xác</p>
                  </div>
                </div>
                {/* Mini bar */}
                <div className="mt-3 flex gap-0.5">
                  {selectedAttempt.questions.map((q, i) => (
                    <div
                      key={i}
                      className="flex-1 h-2 rounded-full"
                      style={{ backgroundColor: q.isCorrect ? "#34d399" : "#f87171" }}
                      title={q.isCorrect ? "Đúng" : "Sai"}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Filter toggle */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/40 text-xs">{displayedQuestions.length} câu hỏi</p>
                <button
                  onClick={() => setShowOnlyWrong(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    showOnlyWrong ? "bg-red-500/15 text-red-400 border border-red-500/25" : "bg-white/5 text-white/40 border border-white/8 hover:text-white/60"
                  }`}
                >
                  <i className="ri-filter-line text-xs"></i>
                  {showOnlyWrong ? "Đang lọc câu sai" : "Chỉ xem câu sai"}
                  {showOnlyWrong && <span className="ml-1 px-1.5 py-0.5 bg-red-500/20 rounded-full text-[9px] font-bold">{selectedAttempt.questions.filter(q => !q.isCorrect).length}</span>}
                </button>
              </div>

              {/* Questions */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {displayedQuestions.length === 0 ? (
                  <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-10 text-center">
                    <i className="ri-check-double-line text-emerald-400/30 text-4xl mb-3"></i>
                    <p className="text-white/30 text-sm">Không có câu sai nào!</p>
                  </div>
                ) : (
                  displayedQuestions.map((q, i) => (
                    <QuestionDetail key={i} q={q} index={i} />
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-white/30 text-sm">Chọn một lần làm quiz để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Most wrong words */}
      {topWrong.length > 0 && (
        <div className="mt-6 bg-[#0f1117] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <i className="ri-error-warning-line text-red-400 text-sm"></i>
            <h3 className="text-white font-semibold text-sm">Từ hay sai nhất</h3>
            <span className="text-white/25 text-xs">— Cần ôn tập ưu tiên</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {topWrong.map(([word, count]) => (
              <div key={word} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/8 border border-red-500/15">
                <span className="text-white/70 text-sm font-semibold">{word}</span>
                <span className="text-red-400 text-xs font-bold">{count}x sai</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

