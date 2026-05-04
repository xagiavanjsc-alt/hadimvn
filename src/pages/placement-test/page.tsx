import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ─── Test Questions ───────────────────────────────────────────────────────
interface TestQuestion {
  id: string;
  level: "A1" | "A2" | "B1" | "B2";
  category: string;
  question: string;
  questionVi: string;
  options: string[];
  optionsVi: string[];
  correctIndex: number;
}

const TEST_QUESTIONS: TestQuestion[] = [
  {
    id: "q1", level: "A1", category: "Giao tiếp",
    question: "안녕하세요. 저는 ___입니다.",
    questionVi: "Xin chào. Tôi là ___.",
    options: ["학생", "먹다", "크다", "빠르다"],
    optionsVi: ["học sinh", "ăn", "to", "nhanh"],
    correctIndex: 0,
  },
  {
    id: "q2", level: "A1", category: "Số đếm",
    question: "사과가 몇 개 있어요? (사과 3개)",
    questionVi: "Có bao nhiêu quả táo? (3 quả táo)",
    options: ["하나", "둘", "셋", "넷"],
    optionsVi: ["một", "hai", "ba", "bốn"],
    correctIndex: 2,
  },
  {
    id: "q3", level: "A1", category: "Thời gian",
    question: "지금 몇 시예요? (오후 2시)",
    questionVi: "Bây giờ là mấy giờ? (2 giờ chiều)",
    options: ["오전 두 시", "오후 두 시", "오전 세 시", "오후 세 시"],
    optionsVi: ["2 giờ sáng", "2 giờ chiều", "3 giờ sáng", "3 giờ chiều"],
    correctIndex: 1,
  },
  {
    id: "q4", level: "A2", category: "Giao tiếp công sở",
    question: "퇴근할 때 상사에게 하는 인사는?",
    questionVi: "Câu chào khi tan ca với cấp trên là gì?",
    options: ["안녕히 가세요", "안녕히 계세요", "잘 자요", "반갑습니다"],
    optionsVi: ["Đi đường mạnh khỏe", "Ở lại mạnh khỏe", "Ngủ ngon", "Rất vui được gặp"],
    correctIndex: 1,
  },
  {
    id: "q5", level: "A2", category: "An toàn",
    question: "화재 발생 시 신고 번호는?",
    questionVi: "Số điện thoại báo cháy là gì?",
    options: ["112", "119", "114", "110"],
    optionsVi: ["Cảnh sát", "Cứu hỏa/Cấp cứu", "Tổng đài", "Khiếu nại"],
    correctIndex: 1,
  },
  {
    id: "q6", level: "A2", category: "Từ vựng",
    question: "다음 중 '안전모'의 뜻은?",
    questionVi: "Nghĩa của '안전모' là gì?",
    options: ["Giày bảo hộ", "Mũ bảo hộ", "Găng tay bảo hộ", "Kính bảo hộ"],
    optionsVi: ["Giày bảo hộ", "Mũ bảo hộ", "Găng tay bảo hộ", "Kính bảo hộ"],
    correctIndex: 1,
  },
  {
    id: "q7", level: "B1", category: "Pháp luật",
    question: "한국의 법정 근로시간은 주 몇 시간입니까?",
    questionVi: "Giờ làm việc theo luật định ở Hàn Quốc là bao nhiêu giờ/tuần?",
    options: ["35시간", "40시간", "45시간", "50시간"],
    optionsVi: ["35 giờ", "40 giờ", "45 giờ", "50 giờ"],
    correctIndex: 1,
  },
  {
    id: "q8", level: "B1", category: "Nghe hiểu",
    question: "다음 중 '임금 체불'의 뜻은?",
    questionVi: "Nghĩa của '임금 체불' là gì?",
    options: ["Tăng lương", "Nợ lương/không trả lương đúng hạn", "Trả thưởng", "Lương tối thiểu"],
    optionsVi: ["Tăng lương", "Nợ lương/không trả lương đúng hạn", "Trả thưởng", "Lương tối thiểu"],
    correctIndex: 1,
  },
  {
    id: "q9", level: "B2", category: "Đọc hiểu",
    question: "퇴직금을 받으려면 최소 몇 년을 근무해야 합니까?",
    questionVi: "Phải làm việc tối thiểu bao nhiêu năm để nhận trợ cấp thôi việc?",
    options: ["6개월", "1년", "2년", "3년"],
    optionsVi: ["6 tháng", "1 năm", "2 năm", "3 năm"],
    correctIndex: 1,
  },
  {
    id: "q10", level: "B2", category: "Pháp luật nâng cao",
    question: "산재보험료는 누가 납부합니까?",
    questionVi: "Ai đóng phí bảo hiểm tai nạn lao động?",
    options: ["근로자 전액", "사업주 전액", "반반씩", "정부 전액"],
    optionsVi: ["Người lao động toàn bộ", "Chủ sử dụng lao động toàn bộ", "Chia đôi", "Chính phủ toàn bộ"],
    correctIndex: 1,
  },
];

// ─── Level config ─────────────────────────────────────────────────────────
const LEVEL_CONFIG = {
  A1: { label: "Sơ cấp", color: "#34d399", desc: "Mới bắt đầu học tiếng Hàn", icon: "ri-seedling-line" },
  A2: { label: "Cơ bản", color: "app-accent-primary", desc: "Biết giao tiếp cơ bản", icon: "ri-plant-line" },
  B1: { label: "Trung cấp", color: "#fb923c", desc: "Có thể làm việc tại Hàn Quốc", icon: "ri-fire-line" },
  B2: { label: "Khá", color: "#a78bfa", desc: "Hiểu pháp luật và văn hóa sâu", icon: "ri-star-line" },
};

// ─── Roadmap Generator ────────────────────────────────────────────────────
function generateRoadmap(level: string, score: number) {
  const roadmaps: Record<string, { weeks: { week: number; title: string; topics: string[]; goal: string }[] }> = {
    A1: {
      weeks: [
        { week: 1, title: "Bảng chữ Hangul & Phát âm", topics: ["Hangul cơ bản", "Nguyên âm & phụ âm", "Phát âm chuẩn"], goal: "Đọc được Hangul" },
        { week: 2, title: "Giao tiếp cơ bản", topics: ["Chào hỏi", "Giới thiệu bản thân", "Số đếm"], goal: "Giao tiếp đơn giản" },
        { week: 3, title: "Từ vựng công sở", topics: ["Nơi làm việc", "Đồng nghiệp", "Thời gian"], goal: "Hiểu môi trường làm việc" },
        { week: 4, title: "An toàn lao động cơ bản", topics: ["Biển báo an toàn", "Số khẩn cấp", "Thiết bị bảo hộ"], goal: "Nhận biết nguy hiểm" },
        { week: 5, title: "Sinh hoạt hàng ngày", topics: ["Mua sắm", "Giao thông", "Bệnh viện"], goal: "Tự lo sinh hoạt" },
        { week: 6, title: "Ôn tập & Thi thử", topics: ["Ôn tất cả chủ đề", "Làm đề thi thử", "Phân tích điểm yếu"], goal: "Sẵn sàng thi EPS" },
      ],
    },
    A2: {
      weeks: [
        { week: 1, title: "Củng cố giao tiếp", topics: ["Giao tiếp nâng cao", "Văn hóa Hàn", "Lịch sự trong công sở"], goal: "Giao tiếp tự tin hơn" },
        { week: 2, title: "An toàn lao động chuyên sâu", topics: ["Quy trình an toàn", "Xử lý tai nạn", "Báo cáo sự cố"], goal: "Xử lý tình huống an toàn" },
        { week: 3, title: "Pháp luật lao động cơ bản", topics: ["Hợp đồng lao động", "Giờ làm việc", "Lương tối thiểu"], goal: "Hiểu quyền lợi cơ bản" },
        { week: 4, title: "Nghe hiểu", topics: ["Nghe thông báo", "Nghe hội thoại", "Nghe hướng dẫn"], goal: "Nghe hiểu 70%" },
        { week: 5, title: "Đọc hiểu", topics: ["Đọc biển báo", "Đọc hợp đồng", "Đọc thông báo"], goal: "Đọc hiểu văn bản thực tế" },
        { week: 6, title: "Thi thử toàn diện", topics: ["Đề thi 40 câu", "Phân tích kết quả", "Ôn điểm yếu"], goal: "Đạt 80+ điểm thi thử" },
      ],
    },
    B1: {
      weeks: [
        { week: 1, title: "Pháp luật lao động nâng cao", topics: ["Bảo hiểm lao động", "Tai nạn lao động", "Đổi nơi làm việc"], goal: "Hiểu đầy đủ quyền lợi" },
        { week: 2, title: "Nghe hiểu nâng cao", topics: ["Nghe tin tức", "Nghe hội thoại phức tạp", "Nghe thông báo dài"], goal: "Nghe hiểu 85%" },
        { week: 3, title: "Đọc hiểu nâng cao", topics: ["Đọc văn bản pháp lý", "Đọc hợp đồng chi tiết", "Đọc báo cáo"], goal: "Đọc hiểu văn bản phức tạp" },
        { week: 4, title: "Thi thử & Phân tích", topics: ["3 đề thi thử", "Phân tích lỗi sai", "Chiến lược làm bài"], goal: "Đạt 90+ điểm thi thử" },
      ],
    },
    B2: {
      weeks: [
        { week: 1, title: "Ôn tập toàn diện", topics: ["Tất cả 9 chủ đề", "Câu hỏi khó", "Bẫy trong đề thi"], goal: "Nắm vững toàn bộ kiến thức" },
        { week: 2, title: "Luyện đề thi thật", topics: ["5 đề thi thử", "Phân tích từng câu", "Tối ưu thời gian"], goal: "Đạt 95+ điểm thi thử" },
      ],
    },
  };

  return roadmaps[level] || roadmaps.A1;
}

// ─── Result Screen ────────────────────────────────────────────────────────
function ResultScreen({
  answers,
  onRetake,
}: {
  answers: Record<string, number>;
  onRetake: () => void;
}) {
  const navigate = useNavigate();
  const [, setStoredResult] = useLocalStorage<{ level: string; score: number; date: string } | null>("kts_placement_result", null);

  const correct = TEST_QUESTIONS.filter(q => answers[q.id] === q.correctIndex).length;
  const total = TEST_QUESTIONS.length;
  const pct = Math.round((correct / total) * 100);

  // Determine level
  let level: "A1" | "A2" | "B1" | "B2" = "A1";
  if (pct >= 90) level = "B2";
  else if (pct >= 70) level = "B1";
  else if (pct >= 50) level = "A2";
  else level = "A1";

  const levelCfg = LEVEL_CONFIG[level];
  const roadmap = generateRoadmap(level, pct);

  // Category breakdown
  const categories = [...new Set(TEST_QUESTIONS.map(q => q.category))];
  const catStats = categories.map(cat => {
    const qs = TEST_QUESTIONS.filter(q => q.category === cat);
    const catCorrect = qs.filter(q => answers[q.id] === q.correctIndex).length;
    return { cat, correct: catCorrect, total: qs.length };
  });

  useEffect(() => {
    setStoredResult({ level, score: pct, date: new Date().toISOString() });
  }, [level, pct]);

  return (
    <div className="space-y-6">
      {/* Level result */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
        <div className="w-20 h-20 flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: `${levelCfg.color}15` }}>
          <i className={`${levelCfg.icon} text-4xl`} style={{ color: levelCfg.color }}></i>
        </div>
        <p className="text-app-text-secondary text-sm mb-1">Trình độ của bạn</p>
        <h2 className="text-white font-bold text-3xl mb-1" style={{ color: levelCfg.color }}>{level} — {levelCfg.label}</h2>
        <p className="text-app-text-secondary text-sm mb-4">{levelCfg.desc}</p>
        <div className="flex items-center justify-center gap-6 mb-5">
          <div className="text-center">
            <p className="text-white font-bold text-2xl">{correct}/{total}</p>
            <p className="text-app-text-muted text-xs">Câu đúng</p>
          </div>
          <div className="w-px h-10 bg-app-card/70"></div>
          <div className="text-center">
            <p className="font-bold text-2xl" style={{ color: levelCfg.color }}>{pct}%</p>
            <p className="text-app-text-muted text-xs">Điểm số</p>
          </div>
        </div>
        <div className="h-2 bg-app-card/50 rounded-full overflow-hidden max-w-xs mx-auto">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: levelCfg.color }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Roadmap */}
        <div>
          <h3 className="text-white font-semibold text-sm mb-4">Lộ trình học cá nhân của bạn</h3>
          <div className="space-y-3">
            {roadmap.weeks.map((week, i) => (
              <div key={week.week} className="flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0" style={{ backgroundColor: `${levelCfg.color}20`, color: levelCfg.color }}>
                    {week.week}
                  </div>
                  {i < roadmap.weeks.length - 1 && (
                    <div className="w-px flex-1 mt-1" style={{ backgroundColor: `${levelCfg.color}20` }}></div>
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="bg-app-bg border border-app-border rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-white font-semibold text-sm">{week.title}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full ml-2 flex-shrink-0" style={{ backgroundColor: `${levelCfg.color}15`, color: levelCfg.color }}>
                        Tuần {week.week}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {week.topics.map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-app-card/50 text-app-text-secondary">{t}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ri-flag-line text-[10px]" style={{ color: levelCfg.color }}></i>
                      <p className="text-[10px]" style={{ color: levelCfg.color }}>Mục tiêu: {week.goal}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Category breakdown + actions */}
        <div className="space-y-4">
          {/* Category breakdown */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Phân tích theo chủ đề</h3>
            <div className="space-y-3">
              {catStats.map(({ cat, correct: c, total: t }) => {
                const p = t > 0 ? Math.round((c / t) * 100) : 0;
                const color = p >= 80 ? "#34d399" : p >= 60 ? "app-accent-primary" : "#f87171";
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white/60 text-xs">{cat}</p>
                      <span className="text-xs font-bold" style={{ color }}>{c}/{t}</span>
                    </div>
                    <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Bắt đầu ngay</h3>
            <div className="space-y-2">
              {[
                { icon: "ri-book-open-line", label: "Học EPS theo chủ đề", path: "/eps-topics", color: "app-accent-primary" },
                { icon: "ri-stack-line", label: "Flashcard từ vựng", path: "/flashcard", color: "#34d399" },
                { icon: "ri-mic-line", label: "Luyện phát âm", path: "/pronunciation", color: "#06b6d4" },
                { icon: "ri-timer-line", label: "Thi thử EPS 40 câu", path: "/eps-exam", color: "#f87171" },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-app-border hover:border-app-border hover:bg-app-surface/50 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                    <i className={`${item.icon} text-xs`} style={{ color: item.color }}></i>
                  </div>
                  <p className="text-white/60 text-xs">{item.label}</p>
                  <i className="ri-arrow-right-line text-app-text-muted ml-auto text-xs"></i>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onRetake}
            className="w-full py-3 rounded-xl border border-app-border text-white/50 text-sm hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap"
          >
            Làm lại bài kiểm tra
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function PlacementTestPage() {
  const [phase, setPhase] = useState<"intro" | "test" | "result">("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [storedResult] = useLocalStorage<{ level: string; score: number; date: string } | null>("kts_placement_result", null);

  const currentQ = TEST_QUESTIONS[currentIdx];
  const progress = ((currentIdx) / TEST_QUESTIONS.length) * 100;

  // Timer
  useEffect(() => {
    if (phase !== "test") return;
    if (timeLeft <= 0) {
      setPhase("result");
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  const handleAnswer = useCallback((optIdx: number) => {
    setSelectedOption(optIdx);
  }, []);

  const handleNext = useCallback(() => {
    if (selectedOption === null) return;
    const newAnswers = { ...answers, [currentQ.id]: selectedOption };
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentIdx + 1 >= TEST_QUESTIONS.length) {
      setPhase("result");
    } else {
      setCurrentIdx(i => i + 1);
    }
  }, [selectedOption, answers, currentQ, currentIdx]);

  const handleRetake = () => {
    setPhase("intro");
    setCurrentIdx(0);
    setAnswers({});
    setSelectedOption(null);
    setTimeLeft(300);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const timeColor = timeLeft < 60 ? "#f87171" : timeLeft < 120 ? "#fb923c" : "#34d399";

  return (
    <DashboardLayout
      title="Kiểm tra đầu vào"
      subtitle="10 câu hỏi — 5 phút — AI phân tích trình độ và tạo lộ trình cá nhân"
    >
      {/* Intro */}
      {phase === "intro" && (
        <div className="max-w-2xl mx-auto">
          {/* Previous result */}
          {storedResult && (
            <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-app-accent-primary/10 flex-shrink-0">
                <i className="ri-history-line text-app-accent-primary"></i>
              </div>
              <div className="flex-1">
                <p className="text-app-accent-primary/80 text-xs font-semibold">Kết quả lần trước</p>
                <p className="text-white/50 text-xs">
                  Trình độ <strong className="text-white/70">{storedResult.level}</strong> — {storedResult.score}% —{" "}
                  {new Date(storedResult.date).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          )}

          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center mb-6">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-[#a78bfa]/10 mx-auto mb-4">
              <i className="ri-brain-line text-[#a78bfa] text-3xl"></i>
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Kiểm tra trình độ tiếng Hàn</h2>
            <p className="text-app-text-secondary text-sm leading-relaxed mb-6">
              Làm 10 câu hỏi trong 5 phút. AI sẽ phân tích trình độ của bạn và tạo lộ trình học cá nhân phù hợp nhất.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: "ri-survey-line", label: "10 câu hỏi", desc: "Từ A1 đến B2", color: "app-accent-primary" },
                { icon: "ri-timer-line", label: "5 phút", desc: "Không cần vội", color: "#34d399" },
                { icon: "ri-route-line", label: "Lộ trình AI", desc: "Cá nhân hóa", color: "#a78bfa" },
              ].map(item => (
                <div key={item.label} className="bg-app-surface/50 rounded-xl p-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto mb-2" style={{ backgroundColor: `${item.color}15` }}>
                    <i className={`${item.icon} text-lg`} style={{ color: item.color }}></i>
                  </div>
                  <p className="text-white font-semibold text-sm">{item.label}</p>
                  <p className="text-app-text-muted text-xs">{item.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPhase("test")}
              className="px-8 py-3.5 rounded-xl bg-[#a78bfa] hover:bg-[#9370e8] text-white font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              Bắt đầu kiểm tra
            </button>
          </div>

          {/* Level descriptions */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(LEVEL_CONFIG).map(([key, cfg]) => (
              <div key={key} className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${cfg.color}15` }}>
                  <i className={`${cfg.icon} text-base`} style={{ color: cfg.color }}></i>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{key} — {cfg.label}</p>
                  <p className="text-app-text-muted text-xs">{cfg.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test */}
      {phase === "test" && currentQ && (
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-app-text-secondary text-xs">Câu {currentIdx + 1} / {TEST_QUESTIONS.length}</p>
                <div className="flex items-center gap-1.5">
                  <i className="ri-timer-line text-xs" style={{ color: timeColor }}></i>
                  <span className="text-sm font-bold font-mono" style={{ color: timeColor }}>{formatTime(timeLeft)}</span>
                </div>
              </div>
              <div className="h-2 bg-app-card/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#a78bfa] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question card */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-6 mb-4">
            {/* Level badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{
                backgroundColor: `${LEVEL_CONFIG[currentQ.level].color}15`,
                color: LEVEL_CONFIG[currentQ.level].color,
              }}>
                {currentQ.level} — {LEVEL_CONFIG[currentQ.level].label}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-card/50 text-app-text-muted">{currentQ.category}</span>
            </div>

            {/* Question */}
            <p className="text-white font-semibold text-base leading-relaxed mb-1">{currentQ.question}</p>
            <p className="text-app-text-secondary text-sm italic mb-5">{currentQ.questionVi}</p>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                    selectedOption === i
                      ? "border-[#a78bfa]/50 bg-[#a78bfa]/10"
                      : "border-app-border bg-app-surface/50 hover:border-white/15 hover:bg-app-card/50"
                  }`}
                >
                  <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold flex-shrink-0 ${
                    selectedOption === i ? "bg-[#a78bfa]/20 text-[#a78bfa]" : "bg-app-card/50 text-app-text-muted"
                  }`}>
                    {["A", "B", "C", "D"][i]}
                  </span>
                  <div>
                    <p className={`text-sm font-medium ${selectedOption === i ? "text-[#a78bfa]" : "text-white/70"}`}>{opt}</p>
                    <p className="text-app-text-muted text-xs">{currentQ.optionsVi[i]}</p>
                  </div>
                  {selectedOption === i && (
                    <i className="ri-checkbox-circle-fill text-[#a78bfa] ml-auto"></i>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ${
              selectedOption !== null
                ? "bg-[#a78bfa] hover:bg-[#9370e8] text-white"
                : "bg-app-card/50 text-app-text-muted cursor-not-allowed"
            }`}
          >
            {currentIdx + 1 >= TEST_QUESTIONS.length ? "Xem kết quả" : "Câu tiếp theo"}
            <i className="ri-arrow-right-line ml-2"></i>
          </button>
        </div>
      )}

      {/* Result */}
      {phase === "result" && (
        <ResultScreen answers={answers} onRetake={handleRetake} />
      )}
    </DashboardLayout>
  );
}


