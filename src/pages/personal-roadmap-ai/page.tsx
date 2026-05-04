import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/feature/DashboardLayout";

type Level = "A1" | "A2" | "B1" | "B2" | "C1";
type Goal = "eps" | "topik1" | "topik2" | "conversation" | "business" | "travel";
type TimeFrame = "1month" | "3months" | "6months" | "1year";

interface RoadmapStep {
  week: number;
  title: string;
  description: string;
  tasks: string[];
  resources: { label: string; path: string; icon: string }[];
  milestone?: string;
  estimatedHours: number;
}

interface RoadmapData {
  level: Level;
  goal: Goal;
  timeFrame: TimeFrame;
  totalWeeks: number;
  steps: RoadmapStep[];
  dailyGoal: string;
  weeklyGoal: string;
  successRate: number;
  vocabTarget: number;
  grammarTarget: number;
}

const LEVEL_LABELS: Record<Level, string> = {
  A1: "A1 - So c?p 1 (M?i b?t d?u)",
  A2: "A2 - So c?p 2 (Co b?n)",
  B1: "B1 - Trung c?p 1 (Giao ti?p du?c)",
  B2: "B2 - Trung c?p 2 (Khá thành th?o)",
  C1: "C1 - Cao c?p (G?n nhu b?n ng?)",
};

const GOAL_LABELS: Record<Goal, { label: string; icon: string; desc: string }> = {
  eps: { label: "Thi EPS-TOPIK", icon: "ri-file-list-3-line", desc: "Ð?u k? thi EPS d? di làm t?i Hàn Qu?c" },
  topik1: { label: "TOPIK I (Level 1-2)", icon: "ri-medal-line", desc: "Ð?t ch?ng ch? TOPIK I" },
  topik2: { label: "TOPIK II (Level 3-6)", icon: "ri-trophy-line", desc: "Ð?t ch?ng ch? TOPIK II" },
  conversation: { label: "Giao ti?p hàng ngày", icon: "ri-chat-voice-line", desc: "Nói chuy?n t? nhiên v?i ngu?i Hàn" },
  business: { label: "Ti?ng Hàn công vi?c", icon: "ri-briefcase-line", desc: "Làm vi?c trong môi tru?ng Hàn Qu?c" },
  travel: { label: "Du l?ch Hàn Qu?c", icon: "ri-plane-line", desc: "Giao ti?p khi du l?ch Hàn Qu?c" },
};

const TIMEFRAME_LABELS: Record<TimeFrame, string> = {
  "1month": "1 tháng (C?p t?c)",
  "3months": "3 tháng (Tiêu chu?n)",
  "6months": "6 tháng (V?ng ch?c)",
  "1year": "1 nam (Toàn di?n)",
};

function generateRoadmap(level: Level, goal: Goal, timeFrame: TimeFrame): RoadmapData {
  const weekMap: Record<TimeFrame, number> = {
    "1month": 4,
    "3months": 12,
    "6months": 24,
    "1year": 52,
  };
  const totalWeeks = weekMap[timeFrame];

  const vocabTargetMap: Record<TimeFrame, number> = {
    "1month": 200,
    "3months": 600,
    "6months": 1200,
    "1year": 3000,
  };

  const steps: RoadmapStep[] = [];

  if (goal === "eps") {
    steps.push(
      {
        week: 1,
        title: "N?n t?ng EPS - T? v?ng co b?n",
        description: "H?c 60 bài EPS co b?n, n?m v?ng t? v?ng ch? d? lao d?ng",
        tasks: ["H?c 30 t? v?ng EPS/ngày", "Làm 10 câu quiz EPS", "Nghe audio bài 1-5"],
        resources: [
          { label: "60 Bài h?c EPS", path: "/eps-lessons", icon: "ri-book-open-line" },
          { label: "T? v?ng EPS", path: "/eps-vocabulary", icon: "ri-translate-2" },
        ],
        milestone: "Thu?c 200 t? EPS co b?n",
        estimatedHours: 14,
      },
      {
        week: Math.ceil(totalWeeks * 0.3),
        title: "Luy?n thi EPS - Nghe & Ð?c",
        description: "T?p trung luy?n k? nang nghe và d?c hi?u theo format EPS",
        tasks: ["Luy?n nghe 2 bài/ngày", "Làm d? thi th? 40 câu", "Ôn t?p t? sai"],
        resources: [
          { label: "Luy?n nghe EPS", path: "/eps-listening", icon: "ri-headphone-line" },
          { label: "Thi th? EPS", path: "/eps-exam", icon: "ri-timer-line" },
        ],
        milestone: "Ð?t 70% d? thi th?",
        estimatedHours: 21,
      },
      {
        week: Math.ceil(totalWeeks * 0.7),
        title: "Thi mô ph?ng th?t",
        description: "Luy?n d? thi EPS trong di?u ki?n th?t, phân tích di?m y?u",
        tasks: ["Thi mô ph?ng 3 l?n/tu?n", "Phân tích câu sai", "Ôn t?p ch? d? y?u"],
        resources: [
          { label: "Thi mô ph?ng th?t", path: "/eps-mock-exam", icon: "ri-file-list-3-line" },
          { label: "Phân tích di?m y?u", path: "/eps-weakness-analysis", icon: "ri-bar-chart-line" },
        ],
        milestone: "Ð?t 80%+ d? thi mô ph?ng",
        estimatedHours: 28,
      },
      {
        week: totalWeeks,
        title: "Hoàn thi?n & S?n sàng thi",
        description: "Ôn t?p toàn di?n, t?p trung vào di?m y?u cu?i cùng",
        tasks: ["Ôn t?p toàn b? t? v?ng", "Làm d? thi chính th?c", "Luy?n nghe t?c d? cao"],
        resources: [
          { label: "Ð? thi chính th?c", path: "/eps-official-exam", icon: "ri-file-list-2-line" },
          { label: "Spaced Repetition", path: "/eps-spaced-review", icon: "ri-brain-line" },
        ],
        milestone: "S?n sàng thi EPS th?t",
        estimatedHours: 35,
      }
    );
  } else if (goal === "topik1" || goal === "topik2") {
    steps.push(
      {
        week: 1,
        title: "N?n t?ng TOPIK - Hangul & T? v?ng",
        description: "N?m v?ng b?ng ch? Hangul, h?c t? v?ng TOPIK co b?n",
        tasks: ["H?c Hangul hoàn ch?nh", "H?c 20 t? TOPIK/ngày", "Luy?n d?c câu don gi?n"],
        resources: [
          { label: "B?ng ch? Hangul", path: "/hangul", icon: "ri-font-size" },
          { label: "T? di?n TOPIK", path: "/topik-dictionary", icon: "ri-search-2-line" },
        ],
        milestone: "Ð?c du?c Hangul thành th?o",
        estimatedHours: 14,
      },
      {
        week: Math.ceil(totalWeeks * 0.4),
        title: "Luy?n k? nang TOPIK",
        description: "Luy?n nghe, d?c hi?u theo format TOPIK I/II",
        tasks: ["Luy?n nghe TOPIK 30 phút/ngày", "Ð?c hi?u 2 bài/ngày", "Làm quiz theo ch? d?"],
        resources: [
          { label: "Luy?n nghe TOPIK", path: "/topik-listening", icon: "ri-headphone-line" },
          { label: "Luy?n d?c TOPIK", path: "/topik-reading", icon: "ri-book-read-line" },
        ],
        milestone: "Hoàn thành 1 d? thi th?",
        estimatedHours: 21,
      },
      {
        week: totalWeeks,
        title: "Thi th? & Hoàn thi?n",
        description: "Thi th? TOPIK d?y d?, phân tích và c?i thi?n",
        tasks: ["Thi th? TOPIK 2 l?n/tu?n", "Ôn t?p ng? pháp nâng cao", "Flashcard t? v?ng TOPIK"],
        resources: [
          { label: goal === "topik1" ? "Thi th? TOPIK I" : "Thi th? TOPIK II", path: goal === "topik1" ? "/topik-test" : "/topik2-test", icon: "ri-file-list-2-line" },
          { label: "Flashcard TOPIK", path: "/topik-flashcard", icon: "ri-stack-line" },
        ],
        milestone: `Ð?t di?m TOPIK ${goal === "topik1" ? "Level 2" : "Level 4"}`,
        estimatedHours: 35,
      }
    );
  } else {
    steps.push(
      {
        week: 1,
        title: "N?n t?ng giao ti?p",
        description: "H?c t? v?ng và ng? pháp co b?n cho giao ti?p hàng ngày",
        tasks: ["H?c 20 t? v?ng/ngày", "Luy?n phát âm 15 phút", "H?c 1 m?u câu m?i/ngày"],
        resources: [
          { label: "Ti?ng Hàn Giao Ti?p", path: "/conversation", icon: "ri-chat-voice-line" },
          { label: "T? v?ng t?ng h?p", path: "/vocabulary", icon: "ri-translate-2" },
        ],
        milestone: "Giao ti?p du?c câu don gi?n",
        estimatedHours: 14,
      },
      {
        week: Math.ceil(totalWeeks * 0.5),
        title: "Luy?n nói & Nghe",
        description: "T?p trung vào k? nang nghe và nói trong tình hu?ng th?c t?",
        tasks: ["Luy?n nghe K-pop 20 phút/ngày", "Luy?n phát âm AI", "H?c qua tin t?c Hàn"],
        resources: [
          { label: "K-pop Lesson", path: "/melon", icon: "ri-music-2-line" },
          { label: "Luy?n phát âm AI", path: "/listen-practice", icon: "ri-mic-2-line" },
        ],
        milestone: "Nghe hi?u 60% h?i tho?i thu?ng ngày",
        estimatedHours: 21,
      },
      {
        week: totalWeeks,
        title: "Giao ti?p t? nhiên",
        description: "Luy?n t?p v?i d?i tác, tham gia c?ng d?ng h?c ti?ng Hàn",
        tasks: ["Luy?n v?i d?i tác h?c t?p", "Tham gia c?ng d?ng", "Xem phim Hàn không ph? d?"],
        resources: [
          { label: "Ð?i tác h?c t?p", path: "/study-partner", icon: "ri-user-heart-line" },
          { label: "C?ng d?ng", path: "/community", icon: "ri-group-line" },
        ],
        milestone: "Giao ti?p t? nhiên v?i ngu?i Hàn",
        estimatedHours: 28,
      }
    );
  }

  return {
    level,
    goal,
    timeFrame,
    totalWeeks,
    steps,
    dailyGoal: timeFrame === "1month" ? "3-4 gi?/ngày" : timeFrame === "3months" ? "1.5-2 gi?/ngày" : "1 gi?/ngày",
    weeklyGoal: timeFrame === "1month" ? "20-25 gi?/tu?n" : timeFrame === "3months" ? "10-14 gi?/tu?n" : "7-10 gi?/tu?n",
    successRate: timeFrame === "1month" ? 72 : timeFrame === "3months" ? 85 : 93,
    vocabTarget: vocabTargetMap[timeFrame],
    grammarTarget: timeFrame === "1month" ? 30 : timeFrame === "3months" ? 80 : 150,
  };
}

const LEVEL_COLORS: Record<Level, string> = {
  A1: "bg-emerald-500/20 text-app-accent-success border-emerald-500/30",
  A2: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  B1: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  B2: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  C1: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export default function PersonalRoadmapAIPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"setup" | "generating" | "result">("setup");
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [vocabCount, setVocabCount] = useState(0);

  useEffect(() => {
    supabase.from("hanja_vocab_entries").select("id", { count: "exact", head: true }).then(({ count }) => {
      if (count) setVocabCount(count);
    });
  }, []);

  const handleGenerate = () => {
    if (!selectedLevel || !selectedGoal || !selectedTimeFrame) return;
    setStep("generating");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          const data = generateRoadmap(selectedLevel, selectedGoal, selectedTimeFrame);
          setRoadmap(data);
          setStep("result");
          return 100;
        }
        return p + 4;
      });
    }, 60);
  };

  const canGenerate = selectedLevel && selectedGoal && selectedTimeFrame;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-app-bg p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 flex items-center justify-center bg-app-accent-primary/10 rounded-xl border border-app-accent-primary/20">
                <i className="ri-route-line text-app-accent-primary text-xl"></i>
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold">L? trình h?c cá nhân AI</h1>
                <p className="text-app-text-secondary text-sm">AI t?o roadmap t?i uu d?a trên trình d? và m?c tiêu c?a b?n</p>
              </div>
            </div>
          </div>

          {/* Setup Step */}
          {step === "setup" && (
            <div className="space-y-8">
              {/* Stats bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: "ri-user-line", label: "H?c viên dã dùng", value: "12,847" },
                  { icon: "ri-translate-2", label: "T? v?ng trong kho", value: vocabCount.toLocaleString() },
                  { icon: "ri-trophy-line", label: "T? l? d?t m?c tiêu", value: "87%" },
                ].map((s, i) => (
                  <div key={i} className="bg-app-surface/50 border border-app-border rounded-xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center bg-app-accent-primary/10 rounded-lg">
                      <i className={`${s.icon} text-app-accent-primary`}></i>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{s.value}</p>
                      <p className="text-app-text-secondary text-xs">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Step 1: Level */}
              <div>
                <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-app-accent-primary/20 text-app-accent-primary text-xs flex items-center justify-center font-bold">1</span>
                  Trình d? hi?n t?i c?a b?n
                </h2>
                <p className="text-app-text-secondary text-sm mb-4 ml-8">Ch?n c?p d? phù h?p nh?t v?i b?n hi?n t?i</p>
                <div className="grid grid-cols-5 gap-3">
                  {(Object.keys(LEVEL_LABELS) as Level[]).map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedLevel === level
                          ? "border-app-accent-primary/50 bg-app-accent-primary/10"
                          : "border-app-border bg-app-surface/50 hover:border-white/20 hover:bg-app-card/50"
                      }`}
                    >
                      <div className={`text-xs font-bold px-2 py-0.5 rounded-full border inline-block mb-2 ${LEVEL_COLORS[level]}`}>
                        {level}
                      </div>
                      <p className="text-white/60 text-xs leading-tight">
                        {LEVEL_LABELS[level].split(" - ")[1]}
                      </p>
                      {selectedLevel === level && (
                        <div className="mt-2 w-4 h-4 rounded-full bg-app-accent-primary flex items-center justify-center mx-auto">
                          <i className="ri-check-line text-black text-[10px]"></i>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Goal */}
              <div>
                <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-app-accent-primary/20 text-app-accent-primary text-xs flex items-center justify-center font-bold">2</span>
                  M?c tiêu h?c t?p
                </h2>
                <p className="text-app-text-secondary text-sm mb-4 ml-8">B?n mu?n d?t du?c di?u gì?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(GOAL_LABELS) as Goal[]).map(goal => {
                    const g = GOAL_LABELS[goal];
                    return (
                      <button
                        key={goal}
                        onClick={() => setSelectedGoal(goal)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedGoal === goal
                            ? "border-app-accent-primary/50 bg-app-accent-primary/10"
                            : "border-app-border bg-app-surface/50 hover:border-white/20 hover:bg-app-card/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 flex items-center justify-center bg-app-card/50 rounded-lg">
                            <i className={`${g.icon} text-white/60`}></i>
                          </div>
                          <span className="text-white text-sm font-medium">{g.label}</span>
                        </div>
                        <p className="text-app-text-secondary text-xs">{g.desc}</p>
                        {selectedGoal === goal && (
                          <div className="mt-2 flex items-center gap-1 text-app-accent-primary text-xs">
                            <i className="ri-check-line"></i>
                            <span>Ðã ch?n</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Time Frame */}
              <div>
                <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-app-accent-primary/20 text-app-accent-primary text-xs flex items-center justify-center font-bold">3</span>
                  Th?i gian h?c
                </h2>
                <p className="text-app-text-secondary text-sm mb-4 ml-8">B?n có bao nhiêu th?i gian d? d?t m?c tiêu?</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(TIMEFRAME_LABELS) as TimeFrame[]).map(tf => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeFrame(tf)}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedTimeFrame === tf
                          ? "border-app-accent-primary/50 bg-app-accent-primary/10"
                          : "border-app-border bg-app-surface/50 hover:border-white/20 hover:bg-app-card/50"
                      }`}
                    >
                      <p className="text-white text-sm font-medium">{TIMEFRAME_LABELS[tf].split(" (")[0]}</p>
                      <p className="text-app-text-secondary text-xs mt-1">{TIMEFRAME_LABELS[tf].split(" (")[1]?.replace(")", "")}</p>
                      {selectedTimeFrame === tf && (
                        <div className="mt-2 w-4 h-4 rounded-full bg-app-accent-primary flex items-center justify-center mx-auto">
                          <i className="ri-check-line text-black text-[10px]"></i>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={`w-full py-4 rounded-xl font-semibold text-base transition-all cursor-pointer whitespace-nowrap ${
                  canGenerate
                    ? "bg-app-accent-primary text-black hover:bg-[#f0d060]"
                    : "bg-app-card/50 text-app-text-muted cursor-not-allowed"
                }`}
              >
                <i className="ri-robot-line mr-2"></i>
                {canGenerate ? "T?o l? trình h?c cá nhân" : "Vui lòng ch?n d? 3 thông tin trên"}
              </button>
            </div>
          )}

          {/* Generating */}
          {step === "generating" && (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
              <div className="w-20 h-20 rounded-full bg-app-accent-primary/10 border border-app-accent-primary/20 flex items-center justify-center">
                <i className="ri-robot-line text-app-accent-primary text-4xl animate-pulse"></i>
              </div>
              <div className="text-center">
                <h2 className="text-white text-xl font-bold mb-2">AI dang phân tích...</h2>
                <p className="text-app-text-secondary text-sm">Ðang t?o l? trình h?c t?i uu cho b?n</p>
              </div>
              <div className="w-80">
                <div className="flex justify-between text-xs text-app-text-secondary mb-2">
                  <span>Ðang x? lý</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-app-accent-primary rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2 text-center">
                {[
                  { threshold: 20, text: "Phân tích trình d? hi?n t?i..." },
                  { threshold: 50, text: "T?i uu hóa l? trình theo m?c tiêu..." },
                  { threshold: 80, text: "T?o k? ho?ch h?c t?p chi ti?t..." },
                  { threshold: 95, text: "Hoàn thi?n l? trình cá nhân..." },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-sm transition-all ${
                      progress >= item.threshold ? "text-white/60" : "text-app-text-muted"
                    }`}
                  >
                    <i className={`${progress >= item.threshold ? "ri-check-line text-app-accent-success" : "ri-time-line"} text-xs`}></i>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {step === "result" && roadmap && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-[app-accent-primary]/10 to-[app-accent-primary]/5 border border-app-accent-primary/20 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-white text-xl font-bold mb-1">
                      L? trình: {GOAL_LABELS[roadmap.goal].label}
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${LEVEL_COLORS[roadmap.level]}`}>
                        {roadmap.level}
                      </span>
                      <span className="text-white/50 text-xs">
                        <i className="ri-calendar-line mr-1"></i>
                        {TIMEFRAME_LABELS[roadmap.timeFrame]}
                      </span>
                      <span className="text-white/50 text-xs">
                        <i className="ri-time-line mr-1"></i>
                        {roadmap.dailyGoal}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-app-accent-primary text-3xl font-bold">{roadmap.successRate}%</div>
                    <div className="text-app-text-secondary text-xs">T? l? thành công</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: "ri-calendar-2-line", label: "T?ng tu?n", value: `${roadmap.totalWeeks} tu?n` },
                    { icon: "ri-translate-2", label: "M?c tiêu t? v?ng", value: `${roadmap.vocabTarget} t?` },
                    { icon: "ri-book-2-line", label: "Ng? pháp", value: `${roadmap.grammarTarget} m?u` },
                    { icon: "ri-time-line", label: "M?i tu?n", value: roadmap.weeklyGoal },
                  ].map((s, i) => (
                    <div key={i} className="bg-app-card/50 rounded-xl p-3 text-center">
                      <div className="w-8 h-8 flex items-center justify-center bg-app-accent-primary/10 rounded-lg mx-auto mb-2">
                        <i className={`${s.icon} text-app-accent-primary text-sm`}></i>
                      </div>
                      <p className="text-white font-bold text-sm">{s.value}</p>
                      <p className="text-app-text-secondary text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roadmap Steps */}
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <i className="ri-map-pin-line text-app-accent-primary"></i>
                  Các giai do?n h?c t?p
                </h3>
                <div className="space-y-4">
                  {roadmap.steps.map((s, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-xl overflow-hidden transition-all cursor-pointer ${
                        activeStep === idx
                          ? "border-app-accent-primary/30 bg-app-accent-primary/5"
                          : "border-app-border bg-white/2 hover:border-white/15"
                      }`}
                      onClick={() => setActiveStep(activeStep === idx ? -1 : idx)}
                    >
                      <div className="p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                          activeStep === idx ? "bg-app-accent-primary text-black" : "bg-white/8 text-white/50"
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-white font-medium text-sm">{s.title}</h4>
                            <span className="text-app-text-muted text-xs">Tu?n {s.week}</span>
                          </div>
                          <p className="text-white/50 text-xs truncate">{s.description}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-white/60 text-xs">{s.estimatedHours}h/tu?n</p>
                            {s.milestone && (
                              <p className="text-app-accent-primary text-[10px]">
                                <i className="ri-flag-line mr-0.5"></i>
                                Milestone
                              </p>
                            )}
                          </div>
                          <i className={activeStep === idx ? "ri-arrow-up-s-line text-app-text-muted" : "ri-arrow-down-s-line text-app-text-muted"}></i>
                        </div>
                      </div>

                      {activeStep === idx && (
                        <div className="px-4 pb-4 border-t border-app-border pt-4 space-y-4">
                          {s.milestone && (
                            <div className="flex items-center gap-2 bg-app-accent-primary/10 border border-app-accent-primary/20 rounded-lg px-3 py-2">
                              <i className="ri-flag-fill text-app-accent-primary text-sm"></i>
                              <span className="text-app-accent-primary text-sm font-medium">Milestone: {s.milestone}</span>
                            </div>
                          )}
                          <div>
                            <p className="text-white/50 text-xs font-semibold tracking-normal mb-2">Nhi?m v? hàng ngày</p>
                            <div className="space-y-1.5">
                              {s.tasks.map((task, ti) => (
                                <div key={ti} className="flex items-center gap-2 text-white/60 text-sm">
                                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                                    <i className="ri-checkbox-circle-line text-app-accent-success text-sm"></i>
                                  </div>
                                  {task}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-white/50 text-xs font-semibold tracking-normal mb-2">Tài nguyên h?c t?p</p>
                            <div className="flex flex-wrap gap-2">
                              {s.resources.map((r, ri) => (
                                <button
                                  key={ri}
                                  onClick={(e) => { e.stopPropagation(); navigate(r.path); }}
                                  className="flex items-center gap-1.5 bg-app-card/50 hover:bg-app-card/70 border border-app-border rounded-lg px-3 py-1.5 text-white/70 text-xs transition-all cursor-pointer whitespace-nowrap"
                                >
                                  <i className={`${r.icon} text-app-accent-primary`}></i>
                                  {r.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep("setup"); setRoadmap(null); setActiveStep(0); }}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-all cursor-pointer whitespace-nowrap text-sm"
                >
                  <i className="ri-refresh-line mr-2"></i>
                  T?o l?i l? trình
                </button>
                <button
                  onClick={() => navigate(roadmap.goal === "eps" ? "/eps" : roadmap.goal.startsWith("topik") ? "/topik-test" : "/conversation")}
                  className="flex-2 flex-1 py-3 rounded-xl bg-app-accent-primary text-black font-semibold hover:bg-[#f0d060] transition-all cursor-pointer whitespace-nowrap text-sm"
                >
                  <i className="ri-play-circle-line mr-2"></i>
                  B?t d?u h?c ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}


