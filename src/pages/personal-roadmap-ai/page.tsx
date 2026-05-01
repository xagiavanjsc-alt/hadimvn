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
  A1: "A1 - Sơ cấp 1 (Mới bắt đầu)",
  A2: "A2 - Sơ cấp 2 (Cơ bản)",
  B1: "B1 - Trung cấp 1 (Giao tiếp được)",
  B2: "B2 - Trung cấp 2 (Khá thành thạo)",
  C1: "C1 - Cao cấp (Gần như bản ngữ)",
};

const GOAL_LABELS: Record<Goal, { label: string; icon: string; desc: string }> = {
  eps: { label: "Thi EPS-TOPIK", icon: "ri-file-list-3-line", desc: "Đậu kỳ thi EPS để đi làm tại Hàn Quốc" },
  topik1: { label: "TOPIK I (Level 1-2)", icon: "ri-medal-line", desc: "Đạt chứng chỉ TOPIK I" },
  topik2: { label: "TOPIK II (Level 3-6)", icon: "ri-trophy-line", desc: "Đạt chứng chỉ TOPIK II" },
  conversation: { label: "Giao tiếp hàng ngày", icon: "ri-chat-voice-line", desc: "Nói chuyện tự nhiên với người Hàn" },
  business: { label: "Tiếng Hàn công việc", icon: "ri-briefcase-line", desc: "Làm việc trong môi trường Hàn Quốc" },
  travel: { label: "Du lịch Hàn Quốc", icon: "ri-plane-line", desc: "Giao tiếp khi du lịch Hàn Quốc" },
};

const TIMEFRAME_LABELS: Record<TimeFrame, string> = {
  "1month": "1 tháng (Cấp tốc)",
  "3months": "3 tháng (Tiêu chuẩn)",
  "6months": "6 tháng (Vững chắc)",
  "1year": "1 năm (Toàn diện)",
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
        title: "Nền tảng EPS - Từ vựng cơ bản",
        description: "Học 60 bài EPS cơ bản, nắm vững từ vựng chủ đề lao động",
        tasks: ["Học 30 từ vựng EPS/ngày", "Làm 10 câu quiz EPS", "Nghe audio bài 1-5"],
        resources: [
          { label: "60 Bài học EPS", path: "/eps-lessons", icon: "ri-book-open-line" },
          { label: "Từ vựng EPS", path: "/eps-vocabulary", icon: "ri-translate-2" },
        ],
        milestone: "Thuộc 200 từ EPS cơ bản",
        estimatedHours: 14,
      },
      {
        week: Math.ceil(totalWeeks * 0.3),
        title: "Luyện thi EPS - Nghe & Đọc",
        description: "Tập trung luyện kỹ năng nghe và đọc hiểu theo format EPS",
        tasks: ["Luyện nghe 2 bài/ngày", "Làm đề thi thử 40 câu", "Ôn tập từ sai"],
        resources: [
          { label: "Luyện nghe EPS", path: "/eps-listening", icon: "ri-headphone-line" },
          { label: "Thi thử EPS", path: "/eps-exam", icon: "ri-timer-line" },
        ],
        milestone: "Đạt 70% đề thi thử",
        estimatedHours: 21,
      },
      {
        week: Math.ceil(totalWeeks * 0.7),
        title: "Thi mô phỏng thật",
        description: "Luyện đề thi EPS trong điều kiện thật, phân tích điểm yếu",
        tasks: ["Thi mô phỏng 3 lần/tuần", "Phân tích câu sai", "Ôn tập chủ đề yếu"],
        resources: [
          { label: "Thi mô phỏng thật", path: "/eps-mock-exam", icon: "ri-file-list-3-line" },
          { label: "Phân tích điểm yếu", path: "/eps-weakness-analysis", icon: "ri-bar-chart-line" },
        ],
        milestone: "Đạt 80%+ đề thi mô phỏng",
        estimatedHours: 28,
      },
      {
        week: totalWeeks,
        title: "Hoàn thiện & Sẵn sàng thi",
        description: "Ôn tập toàn diện, tập trung vào điểm yếu cuối cùng",
        tasks: ["Ôn tập toàn bộ từ vựng", "Làm đề thi chính thức", "Luyện nghe tốc độ cao"],
        resources: [
          { label: "Đề thi chính thức", path: "/eps-official-exam", icon: "ri-file-list-2-line" },
          { label: "Spaced Repetition", path: "/eps-spaced-review", icon: "ri-brain-line" },
        ],
        milestone: "Sẵn sàng thi EPS thật",
        estimatedHours: 35,
      }
    );
  } else if (goal === "topik1" || goal === "topik2") {
    steps.push(
      {
        week: 1,
        title: "Nền tảng TOPIK - Hangul & Từ vựng",
        description: "Nắm vững bảng chữ Hangul, học từ vựng TOPIK cơ bản",
        tasks: ["Học Hangul hoàn chỉnh", "Học 20 từ TOPIK/ngày", "Luyện đọc câu đơn giản"],
        resources: [
          { label: "Bảng chữ Hangul", path: "/hangul", icon: "ri-font-size" },
          { label: "Từ điển TOPIK", path: "/topik-dictionary", icon: "ri-search-2-line" },
        ],
        milestone: "Đọc được Hangul thành thạo",
        estimatedHours: 14,
      },
      {
        week: Math.ceil(totalWeeks * 0.4),
        title: "Luyện kỹ năng TOPIK",
        description: "Luyện nghe, đọc hiểu theo format TOPIK I/II",
        tasks: ["Luyện nghe TOPIK 30 phút/ngày", "Đọc hiểu 2 bài/ngày", "Làm quiz theo chủ đề"],
        resources: [
          { label: "Luyện nghe TOPIK", path: "/topik-listening", icon: "ri-headphone-line" },
          { label: "Luyện đọc TOPIK", path: "/topik-reading", icon: "ri-book-read-line" },
        ],
        milestone: "Hoàn thành 1 đề thi thử",
        estimatedHours: 21,
      },
      {
        week: totalWeeks,
        title: "Thi thử & Hoàn thiện",
        description: "Thi thử TOPIK đầy đủ, phân tích và cải thiện",
        tasks: ["Thi thử TOPIK 2 lần/tuần", "Ôn tập ngữ pháp nâng cao", "Flashcard từ vựng TOPIK"],
        resources: [
          { label: goal === "topik1" ? "Thi thử TOPIK I" : "Thi thử TOPIK II", path: goal === "topik1" ? "/topik-test" : "/topik2-test", icon: "ri-file-list-2-line" },
          { label: "Flashcard TOPIK", path: "/topik-flashcard", icon: "ri-stack-line" },
        ],
        milestone: `Đạt điểm TOPIK ${goal === "topik1" ? "Level 2" : "Level 4"}`,
        estimatedHours: 35,
      }
    );
  } else {
    steps.push(
      {
        week: 1,
        title: "Nền tảng giao tiếp",
        description: "Học từ vựng và ngữ pháp cơ bản cho giao tiếp hàng ngày",
        tasks: ["Học 20 từ vựng/ngày", "Luyện phát âm 15 phút", "Học 1 mẫu câu mới/ngày"],
        resources: [
          { label: "Tiếng Hàn Giao Tiếp", path: "/conversation", icon: "ri-chat-voice-line" },
          { label: "Từ vựng tổng hợp", path: "/vocabulary", icon: "ri-translate-2" },
        ],
        milestone: "Giao tiếp được câu đơn giản",
        estimatedHours: 14,
      },
      {
        week: Math.ceil(totalWeeks * 0.5),
        title: "Luyện nói & Nghe",
        description: "Tập trung vào kỹ năng nghe và nói trong tình huống thực tế",
        tasks: ["Luyện nghe K-pop 20 phút/ngày", "Luyện phát âm AI", "Học qua tin tức Hàn"],
        resources: [
          { label: "K-pop Lesson", path: "/melon", icon: "ri-music-2-line" },
          { label: "Luyện phát âm AI", path: "/listen-practice", icon: "ri-mic-2-line" },
        ],
        milestone: "Nghe hiểu 60% hội thoại thường ngày",
        estimatedHours: 21,
      },
      {
        week: totalWeeks,
        title: "Giao tiếp tự nhiên",
        description: "Luyện tập với đối tác, tham gia cộng đồng học tiếng Hàn",
        tasks: ["Luyện với đối tác học tập", "Tham gia cộng đồng", "Xem phim Hàn không phụ đề"],
        resources: [
          { label: "Đối tác học tập", path: "/study-partner", icon: "ri-user-heart-line" },
          { label: "Cộng đồng", path: "/community", icon: "ri-group-line" },
        ],
        milestone: "Giao tiếp tự nhiên với người Hàn",
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
    dailyGoal: timeFrame === "1month" ? "3-4 giờ/ngày" : timeFrame === "3months" ? "1.5-2 giờ/ngày" : "1 giờ/ngày",
    weeklyGoal: timeFrame === "1month" ? "20-25 giờ/tuần" : timeFrame === "3months" ? "10-14 giờ/tuần" : "7-10 giờ/tuần",
    successRate: timeFrame === "1month" ? 72 : timeFrame === "3months" ? 85 : 93,
    vocabTarget: vocabTargetMap[timeFrame],
    grammarTarget: timeFrame === "1month" ? 30 : timeFrame === "3months" ? 80 : 150,
  };
}

const LEVEL_COLORS: Record<Level, string> = {
  A1: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
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
      <div className="min-h-screen bg-[#0f1117] p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 flex items-center justify-center bg-[#e8c84a]/10 rounded-xl border border-[#e8c84a]/20">
                <i className="ri-route-line text-[#e8c84a] text-xl"></i>
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold">Lộ trình học cá nhân AI</h1>
                <p className="text-white/40 text-sm">AI tạo roadmap tối ưu dựa trên trình độ và mục tiêu của bạn</p>
              </div>
            </div>
          </div>

          {/* Setup Step */}
          {step === "setup" && (
            <div className="space-y-8">
              {/* Stats bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: "ri-user-line", label: "Học viên đã dùng", value: "12,847" },
                  { icon: "ri-translate-2", label: "Từ vựng trong kho", value: vocabCount.toLocaleString() },
                  { icon: "ri-trophy-line", label: "Tỷ lệ đạt mục tiêu", value: "87%" },
                ].map((s, i) => (
                  <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center bg-[#e8c84a]/10 rounded-lg">
                      <i className={`${s.icon} text-[#e8c84a]`}></i>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{s.value}</p>
                      <p className="text-white/40 text-xs">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Step 1: Level */}
              <div>
                <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#e8c84a]/20 text-[#e8c84a] text-xs flex items-center justify-center font-bold">1</span>
                  Trình độ hiện tại của bạn
                </h2>
                <p className="text-white/40 text-sm mb-4 ml-8">Chọn cấp độ phù hợp nhất với bạn hiện tại</p>
                <div className="grid grid-cols-5 gap-3">
                  {(Object.keys(LEVEL_LABELS) as Level[]).map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedLevel === level
                          ? "border-[#e8c84a]/50 bg-[#e8c84a]/10"
                          : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className={`text-xs font-bold px-2 py-0.5 rounded-full border inline-block mb-2 ${LEVEL_COLORS[level]}`}>
                        {level}
                      </div>
                      <p className="text-white/60 text-xs leading-tight">
                        {LEVEL_LABELS[level].split(" - ")[1]}
                      </p>
                      {selectedLevel === level && (
                        <div className="mt-2 w-4 h-4 rounded-full bg-[#e8c84a] flex items-center justify-center mx-auto">
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
                  <span className="w-6 h-6 rounded-full bg-[#e8c84a]/20 text-[#e8c84a] text-xs flex items-center justify-center font-bold">2</span>
                  Mục tiêu học tập
                </h2>
                <p className="text-white/40 text-sm mb-4 ml-8">Bạn muốn đạt được điều gì?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(GOAL_LABELS) as Goal[]).map(goal => {
                    const g = GOAL_LABELS[goal];
                    return (
                      <button
                        key={goal}
                        onClick={() => setSelectedGoal(goal)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedGoal === goal
                            ? "border-[#e8c84a]/50 bg-[#e8c84a]/10"
                            : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg">
                            <i className={`${g.icon} text-white/60`}></i>
                          </div>
                          <span className="text-white text-sm font-medium">{g.label}</span>
                        </div>
                        <p className="text-white/40 text-xs">{g.desc}</p>
                        {selectedGoal === goal && (
                          <div className="mt-2 flex items-center gap-1 text-[#e8c84a] text-xs">
                            <i className="ri-check-line"></i>
                            <span>Đã chọn</span>
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
                  <span className="w-6 h-6 rounded-full bg-[#e8c84a]/20 text-[#e8c84a] text-xs flex items-center justify-center font-bold">3</span>
                  Thời gian học
                </h2>
                <p className="text-white/40 text-sm mb-4 ml-8">Bạn có bao nhiêu thời gian để đạt mục tiêu?</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(TIMEFRAME_LABELS) as TimeFrame[]).map(tf => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeFrame(tf)}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedTimeFrame === tf
                          ? "border-[#e8c84a]/50 bg-[#e8c84a]/10"
                          : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <p className="text-white text-sm font-medium">{TIMEFRAME_LABELS[tf].split(" (")[0]}</p>
                      <p className="text-white/40 text-xs mt-1">{TIMEFRAME_LABELS[tf].split(" (")[1]?.replace(")", "")}</p>
                      {selectedTimeFrame === tf && (
                        <div className="mt-2 w-4 h-4 rounded-full bg-[#e8c84a] flex items-center justify-center mx-auto">
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
                    ? "bg-[#e8c84a] text-black hover:bg-[#f0d060]"
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
              >
                <i className="ri-robot-line mr-2"></i>
                {canGenerate ? "Tạo lộ trình học cá nhân" : "Vui lòng chọn đủ 3 thông tin trên"}
              </button>
            </div>
          )}

          {/* Generating */}
          {step === "generating" && (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
              <div className="w-20 h-20 rounded-full bg-[#e8c84a]/10 border border-[#e8c84a]/20 flex items-center justify-center">
                <i className="ri-robot-line text-[#e8c84a] text-4xl animate-pulse"></i>
              </div>
              <div className="text-center">
                <h2 className="text-white text-xl font-bold mb-2">AI đang phân tích...</h2>
                <p className="text-white/40 text-sm">Đang tạo lộ trình học tối ưu cho bạn</p>
              </div>
              <div className="w-80">
                <div className="flex justify-between text-xs text-white/40 mb-2">
                  <span>Đang xử lý</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#e8c84a] rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2 text-center">
                {[
                  { threshold: 20, text: "Phân tích trình độ hiện tại..." },
                  { threshold: 50, text: "Tối ưu hóa lộ trình theo mục tiêu..." },
                  { threshold: 80, text: "Tạo kế hoạch học tập chi tiết..." },
                  { threshold: 95, text: "Hoàn thiện lộ trình cá nhân..." },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-sm transition-all ${
                      progress >= item.threshold ? "text-white/60" : "text-white/20"
                    }`}
                  >
                    <i className={`${progress >= item.threshold ? "ri-check-line text-emerald-400" : "ri-time-line"} text-xs`}></i>
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
              <div className="bg-gradient-to-r from-[#e8c84a]/10 to-[#e8c84a]/5 border border-[#e8c84a]/20 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-white text-xl font-bold mb-1">
                      Lộ trình: {GOAL_LABELS[roadmap.goal].label}
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
                    <div className="text-[#e8c84a] text-3xl font-bold">{roadmap.successRate}%</div>
                    <div className="text-white/40 text-xs">Tỷ lệ thành công</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: "ri-calendar-2-line", label: "Tổng tuần", value: `${roadmap.totalWeeks} tuần` },
                    { icon: "ri-translate-2", label: "Mục tiêu từ vựng", value: `${roadmap.vocabTarget} từ` },
                    { icon: "ri-book-2-line", label: "Ngữ pháp", value: `${roadmap.grammarTarget} mẫu` },
                    { icon: "ri-time-line", label: "Mỗi tuần", value: roadmap.weeklyGoal },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 text-center">
                      <div className="w-8 h-8 flex items-center justify-center bg-[#e8c84a]/10 rounded-lg mx-auto mb-2">
                        <i className={`${s.icon} text-[#e8c84a] text-sm`}></i>
                      </div>
                      <p className="text-white font-bold text-sm">{s.value}</p>
                      <p className="text-white/40 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roadmap Steps */}
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <i className="ri-map-pin-line text-[#e8c84a]"></i>
                  Các giai đoạn học tập
                </h3>
                <div className="space-y-4">
                  {roadmap.steps.map((s, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-xl overflow-hidden transition-all cursor-pointer ${
                        activeStep === idx
                          ? "border-[#e8c84a]/30 bg-[#e8c84a]/5"
                          : "border-white/8 bg-white/2 hover:border-white/15"
                      }`}
                      onClick={() => setActiveStep(activeStep === idx ? -1 : idx)}
                    >
                      <div className="p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                          activeStep === idx ? "bg-[#e8c84a] text-black" : "bg-white/8 text-white/50"
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-white font-medium text-sm">{s.title}</h4>
                            <span className="text-white/30 text-xs">Tuần {s.week}</span>
                          </div>
                          <p className="text-white/50 text-xs truncate">{s.description}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-white/60 text-xs">{s.estimatedHours}h/tuần</p>
                            {s.milestone && (
                              <p className="text-[#e8c84a] text-[10px]">
                                <i className="ri-flag-line mr-0.5"></i>
                                Milestone
                              </p>
                            )}
                          </div>
                          <i className={activeStep === idx ? "ri-arrow-up-s-line text-white/30" : "ri-arrow-down-s-line text-white/30"}></i>
                        </div>
                      </div>

                      {activeStep === idx && (
                        <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-4">
                          {s.milestone && (
                            <div className="flex items-center gap-2 bg-[#e8c84a]/10 border border-[#e8c84a]/20 rounded-lg px-3 py-2">
                              <i className="ri-flag-fill text-[#e8c84a] text-sm"></i>
                              <span className="text-[#e8c84a] text-sm font-medium">Milestone: {s.milestone}</span>
                            </div>
                          )}
                          <div>
                            <p className="text-white/50 text-xs font-semibold tracking-normal mb-2">Nhiệm vụ hàng ngày</p>
                            <div className="space-y-1.5">
                              {s.tasks.map((task, ti) => (
                                <div key={ti} className="flex items-center gap-2 text-white/60 text-sm">
                                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                                    <i className="ri-checkbox-circle-line text-emerald-400 text-sm"></i>
                                  </div>
                                  {task}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-white/50 text-xs font-semibold tracking-normal mb-2">Tài nguyên học tập</p>
                            <div className="flex flex-wrap gap-2">
                              {s.resources.map((r, ri) => (
                                <button
                                  key={ri}
                                  onClick={(e) => { e.stopPropagation(); navigate(r.path); }}
                                  className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-white/70 text-xs transition-all cursor-pointer whitespace-nowrap"
                                >
                                  <i className={`${r.icon} text-[#e8c84a]`}></i>
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
                  Tạo lại lộ trình
                </button>
                <button
                  onClick={() => navigate(roadmap.goal === "eps" ? "/eps" : roadmap.goal.startsWith("topik") ? "/topik-test" : "/conversation")}
                  className="flex-2 flex-1 py-3 rounded-xl bg-[#e8c84a] text-black font-semibold hover:bg-[#f0d060] transition-all cursor-pointer whitespace-nowrap text-sm"
                >
                  <i className="ri-play-circle-line mr-2"></i>
                  Bắt đầu học ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}


