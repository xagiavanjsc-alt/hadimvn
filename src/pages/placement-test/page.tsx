import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// --- Test Questions -------------------------------------------------------
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
    id: "q1", level: "A1", category: "Giao ti?p",
    question: "?????. ?? ___???.",
    questionVi: "Xin chào. Tôi là ___.",
    options: ["??", "??", "??", "???"],
    optionsVi: ["h?c sinh", "an", "to", "nhanh"],
    correctIndex: 0,
  },
  {
    id: "q2", level: "A1", category: "S? d?m",
    question: "??? ? ? ???? (?? 3?)",
    questionVi: "Có bao nhiêu qu? táo? (3 qu? táo)",
    options: ["??", "?", "?", "?"],
    optionsVi: ["m?t", "hai", "ba", "b?n"],
    correctIndex: 2,
  },
  {
    id: "q3", level: "A1", category: "Th?i gian",
    question: "?? ? ???? (?? 2?)",
    questionVi: "Bây gi? là m?y gi?? (2 gi? chi?u)",
    options: ["?? ? ?", "?? ? ?", "?? ? ?", "?? ? ?"],
    optionsVi: ["2 gi? sáng", "2 gi? chi?u", "3 gi? sáng", "3 gi? chi?u"],
    correctIndex: 1,
  },
  {
    id: "q4", level: "A2", category: "Giao ti?p công s?",
    question: "??? ? ???? ?? ????",
    questionVi: "Câu chào khi tan ca v?i c?p trên là gì?",
    options: ["??? ???", "??? ???", "? ??", "?????"],
    optionsVi: ["Ði du?ng m?nh kh?e", "? l?i m?nh kh?e", "Ng? ngon", "R?t vui du?c g?p"],
    correctIndex: 1,
  },
  {
    id: "q5", level: "A2", category: "An toàn",
    question: "?? ?? ? ?? ????",
    questionVi: "S? di?n tho?i báo cháy là gì?",
    options: ["112", "119", "114", "110"],
    optionsVi: ["C?nh sát", "C?u h?a/C?p c?u", "T?ng dài", "Khi?u n?i"],
    correctIndex: 1,
  },
  {
    id: "q6", level: "A2", category: "T? v?ng",
    question: "?? ? '???'? ???",
    questionVi: "Nghia c?a '???' là gì?",
    options: ["Giày b?o h?", "Mu b?o h?", "Gang tay b?o h?", "Kính b?o h?"],
    optionsVi: ["Giày b?o h?", "Mu b?o h?", "Gang tay b?o h?", "Kính b?o h?"],
    correctIndex: 1,
  },
  {
    id: "q7", level: "B1", category: "Pháp lu?t",
    question: "??? ?? ????? ? ? ??????",
    questionVi: "Gi? làm vi?c theo lu?t d?nh ? Hàn Qu?c là bao nhiêu gi?/tu?n?",
    options: ["35??", "40??", "45??", "50??"],
    optionsVi: ["35 gi?", "40 gi?", "45 gi?", "50 gi?"],
    correctIndex: 1,
  },
  {
    id: "q8", level: "B1", category: "Nghe hi?u",
    question: "?? ? '?? ??'? ???",
    questionVi: "Nghia c?a '?? ??' là gì?",
    options: ["Tang luong", "N? luong/không tr? luong dúng h?n", "Tr? thu?ng", "Luong t?i thi?u"],
    optionsVi: ["Tang luong", "N? luong/không tr? luong dúng h?n", "Tr? thu?ng", "Luong t?i thi?u"],
    correctIndex: 1,
  },
  {
    id: "q9", level: "B2", category: "Ð?c hi?u",
    question: "???? ???? ?? ? ?? ???? ????",
    questionVi: "Ph?i làm vi?c t?i thi?u bao nhiêu nam d? nh?n tr? c?p thôi vi?c?",
    options: ["6??", "1?", "2?", "3?"],
    optionsVi: ["6 tháng", "1 nam", "2 nam", "3 nam"],
    correctIndex: 1,
  },
  {
    id: "q10", level: "B2", category: "Pháp lu?t nâng cao",
    question: "?????? ?? ??????",
    questionVi: "Ai dóng phí b?o hi?m tai n?n lao d?ng?",
    options: ["??? ??", "??? ??", "???", "?? ??"],
    optionsVi: ["Ngu?i lao d?ng toàn b?", "Ch? s? d?ng lao d?ng toàn b?", "Chia dôi", "Chính ph? toàn b?"],
    correctIndex: 1,
  },
];

// --- Level config ---------------------------------------------------------
const LEVEL_CONFIG = {
  A1: { label: "So c?p", color: "#34d399", desc: "M?i b?t d?u h?c ti?ng Hàn", icon: "ri-seedling-line" },
  A2: { label: "Co b?n", color: "app-accent-primary", desc: "Bi?t giao ti?p co b?n", icon: "ri-plant-line" },
  B1: { label: "Trung c?p", color: "#fb923c", desc: "Có th? làm vi?c t?i Hàn Qu?c", icon: "ri-fire-line" },
  B2: { label: "Khá", color: "#a78bfa", desc: "Hi?u pháp lu?t và van hóa sâu", icon: "ri-star-line" },
};

// --- Roadmap Generator ----------------------------------------------------
function generateRoadmap(level: string, score: number) {
  const roadmaps: Record<string, { weeks: { week: number; title: string; topics: string[]; goal: string }[] }> = {
    A1: {
      weeks: [
        { week: 1, title: "B?ng ch? Hangul & Phát âm", topics: ["Hangul co b?n", "Nguyên âm & ph? âm", "Phát âm chu?n"], goal: "Ð?c du?c Hangul" },
        { week: 2, title: "Giao ti?p co b?n", topics: ["Chào h?i", "Gi?i thi?u b?n thân", "S? d?m"], goal: "Giao ti?p don gi?n" },
        { week: 3, title: "T? v?ng công s?", topics: ["Noi làm vi?c", "Ð?ng nghi?p", "Th?i gian"], goal: "Hi?u môi tru?ng làm vi?c" },
        { week: 4, title: "An toàn lao d?ng co b?n", topics: ["Bi?n báo an toàn", "S? kh?n c?p", "Thi?t b? b?o h?"], goal: "Nh?n bi?t nguy hi?m" },
        { week: 5, title: "Sinh ho?t hàng ngày", topics: ["Mua s?m", "Giao thông", "B?nh vi?n"], goal: "T? lo sinh ho?t" },
        { week: 6, title: "Ôn t?p & Thi th?", topics: ["Ôn t?t c? ch? d?", "Làm d? thi th?", "Phân tích di?m y?u"], goal: "S?n sàng thi EPS" },
      ],
    },
    A2: {
      weeks: [
        { week: 1, title: "C?ng c? giao ti?p", topics: ["Giao ti?p nâng cao", "Van hóa Hàn", "L?ch s? trong công s?"], goal: "Giao ti?p t? tin hon" },
        { week: 2, title: "An toàn lao d?ng chuyên sâu", topics: ["Quy trình an toàn", "X? lý tai n?n", "Báo cáo s? c?"], goal: "X? lý tình hu?ng an toàn" },
        { week: 3, title: "Pháp lu?t lao d?ng co b?n", topics: ["H?p d?ng lao d?ng", "Gi? làm vi?c", "Luong t?i thi?u"], goal: "Hi?u quy?n l?i co b?n" },
        { week: 4, title: "Nghe hi?u", topics: ["Nghe thông báo", "Nghe h?i tho?i", "Nghe hu?ng d?n"], goal: "Nghe hi?u 70%" },
        { week: 5, title: "Ð?c hi?u", topics: ["Ð?c bi?n báo", "Ð?c h?p d?ng", "Ð?c thông báo"], goal: "Ð?c hi?u van b?n th?c t?" },
        { week: 6, title: "Thi th? toàn di?n", topics: ["Ð? thi 40 câu", "Phân tích k?t qu?", "Ôn di?m y?u"], goal: "Ð?t 80+ di?m thi th?" },
      ],
    },
    B1: {
      weeks: [
        { week: 1, title: "Pháp lu?t lao d?ng nâng cao", topics: ["B?o hi?m lao d?ng", "Tai n?n lao d?ng", "Ð?i noi làm vi?c"], goal: "Hi?u d?y d? quy?n l?i" },
        { week: 2, title: "Nghe hi?u nâng cao", topics: ["Nghe tin t?c", "Nghe h?i tho?i ph?c t?p", "Nghe thông báo dài"], goal: "Nghe hi?u 85%" },
        { week: 3, title: "Ð?c hi?u nâng cao", topics: ["Ð?c van b?n pháp lý", "Ð?c h?p d?ng chi ti?t", "Ð?c báo cáo"], goal: "Ð?c hi?u van b?n ph?c t?p" },
        { week: 4, title: "Thi th? & Phân tích", topics: ["3 d? thi th?", "Phân tích l?i sai", "Chi?n lu?c làm bài"], goal: "Ð?t 90+ di?m thi th?" },
      ],
    },
    B2: {
      weeks: [
        { week: 1, title: "Ôn t?p toàn di?n", topics: ["T?t c? 9 ch? d?", "Câu h?i khó", "B?y trong d? thi"], goal: "N?m v?ng toàn b? ki?n th?c" },
        { week: 2, title: "Luy?n d? thi th?t", topics: ["5 d? thi th?", "Phân tích t?ng câu", "T?i uu th?i gian"], goal: "Ð?t 95+ di?m thi th?" },
      ],
    },
  };

  return roadmaps[level] || roadmaps.A1;
}

// --- Result Screen --------------------------------------------------------
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
        <p className="text-app-text-secondary text-sm mb-1">Trình d? c?a b?n</p>
        <h2 className="text-white font-bold text-3xl mb-1" style={{ color: levelCfg.color }}>{level} — {levelCfg.label}</h2>
        <p className="text-app-text-secondary text-sm mb-4">{levelCfg.desc}</p>
        <div className="flex items-center justify-center gap-6 mb-5">
          <div className="text-center">
            <p className="text-white font-bold text-2xl">{correct}/{total}</p>
            <p className="text-app-text-muted text-xs">Câu dúng</p>
          </div>
          <div className="w-px h-10 bg-app-card/70"></div>
          <div className="text-center">
            <p className="font-bold text-2xl" style={{ color: levelCfg.color }}>{pct}%</p>
            <p className="text-app-text-muted text-xs">Ði?m s?</p>
          </div>
        </div>
        <div className="h-2 bg-app-card/50 rounded-full overflow-hidden max-w-xs mx-auto">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: levelCfg.color }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Roadmap */}
        <div>
          <h3 className="text-white font-semibold text-sm mb-4">L? trình h?c cá nhân c?a b?n</h3>
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
                        Tu?n {week.week}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {week.topics.map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-app-card/50 text-app-text-secondary">{t}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ri-flag-line text-[10px]" style={{ color: levelCfg.color }}></i>
                      <p className="text-[10px]" style={{ color: levelCfg.color }}>M?c tiêu: {week.goal}</p>
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
            <h3 className="text-white font-semibold text-sm mb-4">Phân tích theo ch? d?</h3>
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
            <h3 className="text-white font-semibold text-sm mb-3">B?t d?u ngay</h3>
            <div className="space-y-2">
              {[
                { icon: "ri-book-open-line", label: "H?c EPS theo ch? d?", path: "/eps-topics", color: "app-accent-primary" },
                { icon: "ri-stack-line", label: "Flashcard t? v?ng", path: "/flashcard", color: "#34d399" },
                { icon: "ri-mic-line", label: "Luy?n phát âm", path: "/pronunciation", color: "#06b6d4" },
                { icon: "ri-timer-line", label: "Thi th? EPS 40 câu", path: "/eps-exam", color: "#f87171" },
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
            Làm l?i bài ki?m tra
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ------------------------------------------------------------
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
      title="Ki?m tra d?u vào"
      subtitle="10 câu h?i — 5 phút — AI phân tích trình d? và t?o l? trình cá nhân"
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
                <p className="text-app-accent-primary/80 text-xs font-semibold">K?t qu? l?n tru?c</p>
                <p className="text-white/50 text-xs">
                  Trình d? <strong className="text-white/70">{storedResult.level}</strong> — {storedResult.score}% —{" "}
                  {new Date(storedResult.date).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          )}

          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center mb-6">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-[#a78bfa]/10 mx-auto mb-4">
              <i className="ri-brain-line text-[#a78bfa] text-3xl"></i>
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Ki?m tra trình d? ti?ng Hàn</h2>
            <p className="text-app-text-secondary text-sm leading-relaxed mb-6">
              Làm 10 câu h?i trong 5 phút. AI s? phân tích trình d? c?a b?n và t?o l? trình h?c cá nhân phù h?p nh?t.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: "ri-survey-line", label: "10 câu h?i", desc: "T? A1 d?n B2", color: "app-accent-primary" },
                { icon: "ri-timer-line", label: "5 phút", desc: "Không c?n v?i", color: "#34d399" },
                { icon: "ri-route-line", label: "L? trình AI", desc: "Cá nhân hóa", color: "#a78bfa" },
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
              B?t d?u ki?m tra
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
            {currentIdx + 1 >= TEST_QUESTIONS.length ? "Xem k?t qu?" : "Câu ti?p theo"}
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


