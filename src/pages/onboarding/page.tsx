import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RoadmapItem {
  week: string;
  title: string;
  tasks: string[];
  path: string;
  icon: string;
  color: string;
}

interface RoadmapResult {
  title: string;
  description: string;
  dailyTime: string;
  estimatedWeeks: number;
  items: RoadmapItem[];
  primaryPath: string;
}

// ─── AI Roadmap Generator ─────────────────────────────────────────────────────
function generateRoadmap(level: string, goal: string, dailyTime: string): RoadmapResult {
  const timeMap: Record<string, string> = {
    "5 phút / ngày": "5 phút",
    "10 phút / ngày": "10 phút",
    "20 phút / ngày": "20 phút",
    "30 phút / ngày": "30 phút",
  };

  if (goal === "Đi làm tại Hàn (EPS)") {
    return {
      title: "Lộ trình chinh phục EPS-TOPIK",
      description: "Được tối ưu hóa để vượt qua kỳ thi EPS-TOPIK với điểm số cao nhất trong thời gian ngắn nhất.",
      dailyTime: timeMap[dailyTime] || "20 phút",
      estimatedWeeks: dailyTime.includes("30") ? 8 : dailyTime.includes("20") ? 12 : 16,
      primaryPath: "/eps-lessons",
      items: [
        { week: "Tuần 1–2", title: "Nền tảng Hangul & Từ vựng cơ bản", tasks: ["Học bảng chữ Hangul", "100 từ vựng EPS cơ bản", "Luyện phát âm chuẩn"], path: "/hangul", icon: "ri-font-size", color: "#34d399" },
        { week: "Tuần 3–5", title: "60 Bài học EPS chính thức", tasks: ["Học 60 bài EPS theo thứ tự", "Flashcard từ vựng mỗi bài", "Luyện nghe theo bài"], path: "/eps-lessons", icon: "ri-book-open-line", color: "#fb923c" },
        { week: "Tuần 6–8", title: "Luyện thi & Ôn tập chuyên sâu", tasks: ["Thi thử 40 câu hàng ngày", "Ôn tập câu sai", "Spaced Repetition"], path: "/eps-exam", icon: "ri-timer-line", color: "#60a5fa" },
        { week: "Tuần 9+", title: "Thi mô phỏng & Hoàn thiện", tasks: ["Thi mô phỏng thật (200 câu)", "Phân tích điểm yếu", "Luyện nghe chuyên sâu"], path: "/eps-mock-exam", icon: "ri-trophy-line", color: "#e8c84a" },
      ],
    };
  }

  if (goal === "Thi TOPIK I/II") {
    return {
      title: "Lộ trình chinh phục TOPIK",
      description: "Lộ trình bài bản từ TOPIK I đến TOPIK II, tập trung vào từ vựng học thuật và kỹ năng đọc hiểu.",
      dailyTime: timeMap[dailyTime] || "20 phút",
      estimatedWeeks: dailyTime.includes("30") ? 10 : 16,
      primaryPath: "/topik-test",
      items: [
        { week: "Tuần 1–3", title: "Từ vựng TOPIK & Ngữ pháp cơ bản", tasks: ["Từ điển TOPIK 2000 từ", "Ngữ pháp A1–B1", "Flashcard Spaced Repetition"], path: "/topik-dictionary", icon: "ri-search-2-line", color: "#34d399" },
        { week: "Tuần 4–6", title: "Luyện nghe & Đọc hiểu", tasks: ["Luyện nghe TOPIK I", "Luyện đọc TOPIK I", "Quiz theo chủ đề"], path: "/topik-listening", icon: "ri-headphone-line", color: "#60a5fa" },
        { week: "Tuần 7–9", title: "Thi thử TOPIK I & II", tasks: ["Thi thử TOPIK I đầy đủ", "Phân tích kết quả", "Ôn tập điểm yếu"], path: "/topik-test", icon: "ri-file-list-2-line", color: "#fb923c" },
        { week: "Tuần 10+", title: "TOPIK II & Hoàn thiện", tasks: ["Thi thử TOPIK II", "Luyện viết luận", "Mô phỏng thi thật"], path: "/topik2-test", icon: "ri-trophy-line", color: "#e8c84a" },
      ],
    };
  }

  if (goal === "K-Pop & K-Drama") {
    // HIDDEN 2026-05-25 (focus EPS+du học): K-pop goal off-focus, /melon hidden.
    // Fall through to default (Công việc & Kinh doanh).
    return generateRoadmap(level, "Công việc & Kinh doanh", dailyTime);
  }

  if (goal === "Du lịch Hàn Quốc") {
    // HIDDEN 2026-05-25 (focus EPS+du học): tourism goal off-focus.
    // Fall through to default (Công việc & Kinh doanh).
    return generateRoadmap(level, "Công việc & Kinh doanh", dailyTime);
  }

  // Default: Công việc & Kinh doanh
  return {
    title: "Lộ trình tiếng Hàn thương mại",
    description: "Tiếng Hàn chuyên nghiệp cho môi trường công sở và kinh doanh quốc tế.",
    dailyTime: timeMap[dailyTime] || "20 phút",
    estimatedWeeks: 14,
    primaryPath: "/vocabulary",
    items: [
      { week: "Tuần 1–3", title: "Nền tảng & Từ vựng kinh doanh", tasks: ["Hangul & Phát âm", "Từ vựng văn phòng", "Kính ngữ tiếng Hàn"], path: "/vocabulary", icon: "ri-translate-2", color: "#34d399" },
      { week: "Tuần 4–6", title: "Giao tiếp công sở", tasks: ["Hội thoại AI công sở", "Email & Văn bản", "Ngữ pháp trung cấp"], path: "/conversation", icon: "ri-chat-voice-line", color: "#60a5fa" },
      { week: "Tuần 7–10", title: "Giáo trình Seoul (B1–B2)", tasks: ["Giáo trình Seoul 2A–3B", "Luyện đọc hiểu", "Từ điển Seoul"], path: "/seoul-textbook", icon: "ri-book-3-line", color: "#a78bfa" },
      { week: "Tuần 11+", title: "TOPIK & Chứng chỉ", tasks: ["Thi thử TOPIK II", "Luyện viết luận", "Chứng chỉ học tập"], path: "/topik2-test", icon: "ri-trophy-line", color: "#e8c84a" },
    ],
  };
}

// ─── Step components ──────────────────────────────────────────────────────────
const LEVEL_OPTIONS = [
  { label: "Mới bắt đầu hoàn toàn", icon: "ri-seedling-line", desc: "Chưa biết gì về tiếng Hàn", color: "#34d399" },
  { label: "Sơ cấp (A1–A2)", icon: "ri-plant-line", desc: "Biết Hangul, vài từ cơ bản", color: "#60a5fa" },
  { label: "Trung cấp (B1–B2)", icon: "ri-tree-line", desc: "Giao tiếp được những câu đơn giản", color: "#fb923c" },
  { label: "Nâng cao (C1–C2)", icon: "ri-award-line", desc: "Đọc hiểu tốt, muốn hoàn thiện", color: "#e8c84a" },
];

const GOAL_OPTIONS = [
  { label: "Đi làm tại Hàn (EPS)", icon: "ri-briefcase-line", desc: "Vượt qua kỳ thi EPS-TOPIK", color: "#fb923c" },
  { label: "Thi TOPIK I/II", icon: "ri-file-text-line", desc: "Lấy chứng chỉ TOPIK quốc tế", color: "#60a5fa" },
  { label: "Công việc & Kinh doanh", icon: "ri-building-line", desc: "Tiếng Hàn thương mại chuyên nghiệp", color: "#a78bfa" },
  // HIDDEN 2026-05-25 (focus EPS+du học): off-focus goals fall back to default in generateRoadmap
  // { label: "Du lịch Hàn Quốc", icon: "ri-plane-line", desc: "Tự tin giao tiếp khi đi du lịch", color: "#34d399" },
  // { label: "K-Pop & K-Drama", icon: "ri-music-2-line", desc: "Hiểu lời bài hát, phim Hàn", color: "#f472b6" },
];

const TIME_OPTIONS = [
  { label: "5 phút / ngày", icon: "ri-time-line", desc: "Nhẹ nhàng, duy trì thói quen", color: "#34d399" },
  { label: "10 phút / ngày", icon: "ri-timer-line", desc: "Cân bằng, phù hợp người bận", color: "#60a5fa" },
  { label: "20 phút / ngày", icon: "ri-timer-2-line", desc: "Tiến bộ nhanh, được khuyến nghị", color: "#fb923c", recommended: true },
  { label: "30 phút / ngày", icon: "ri-fire-line", desc: "Học nghiêm túc, kết quả vượt trội", color: "#e8c84a" },
];

function OptionCard({
  label, icon, desc, color, selected, onClick, recommended,
}: {
  label: string; icon: string; desc: string; color: string;
  selected: boolean; onClick: () => void; recommended?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 px-4 rounded-2xl text-left transition-all border-2 flex items-center gap-3 cursor-pointer relative"
      style={{
        borderColor: selected ? color : "rgba(255,255,255,0.08)",
        backgroundColor: selected ? `${color}12` : "rgba(255,255,255,0.03)",
      }}
    >
      {recommended && (
        <span className="absolute -top-2 right-3 text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: color, color: "#0f1117" }}>
          Khuyến nghị
        </span>
      )}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: selected ? `${color}25` : "rgba(255,255,255,0.06)" }}>
        <i className={`${icon} text-base`} style={{ color: selected ? color : "rgba(255,255,255,0.4)" }}></i>
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-semibold" style={{ color: selected ? color : "rgba(255,255,255,0.75)" }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</p>
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
          <i className="ri-check-line text-app-bg text-xs"></i>
        </div>
      )}
    </button>
  );
}

// ─── Roadmap Result Screen ────────────────────────────────────────────────────
function RoadmapScreen({ roadmap, onStart, onRedo }: { roadmap: RoadmapResult; onStart: () => Promise<boolean>; onRedo: () => void }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "rgba(232,200,74,0.12)" }}>
          <i className="ri-robot-2-line text-2xl" style={{ color: "#e8c84a" }}></i>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">AI đã tạo lộ trình cho bạn!</h2>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Được cá nhân hóa dựa trên mục tiêu và trình độ của bạn</p>
      </div>

      {/* Roadmap card */}
      <div className="rounded-2xl p-5 mb-4" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-white font-bold text-base">{roadmap.title}</h3>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{roadmap.description}</p>
          </div>
        </div>
        <div className="flex gap-3 mb-4">
          <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: "rgba(232,200,74,0.08)", border: "1px solid rgba(232,200,74,0.15)" }}>
            <p className="text-app-accent-primary font-bold text-lg">{roadmap.dailyTime}</p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Mỗi ngày</p>
          </div>
          <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}>
            <p className="text-[#34d399] font-bold text-lg">{roadmap.estimatedWeeks} tuần</p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Ước tính</p>
          </div>
          <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.15)" }}>
            <p className="text-[#60a5fa] font-bold text-lg">{roadmap.items.length}</p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Giai đoạn</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {roadmap.items.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}20` }}>
                  <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
                </div>
                {i < roadmap.items.length - 1 && (
                  <div className="w-px flex-1 mt-1" style={{ backgroundColor: "rgba(255,255,255,0.06)", minHeight: "16px" }}></div>
                )}
              </div>
              <div className="flex-1 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${item.color}15`, color: item.color }}>{item.week}</span>
                  <span className="text-sm font-semibold text-white">{item.title}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.tasks.map((task, j) => (
                    <span key={j} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)" }}>
                      {task}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={async () => { const ok = await onStart(); if (ok) navigate(roadmap.primaryPath); }}
        className="w-full py-4 rounded-2xl font-bold text-base transition-all cursor-pointer whitespace-nowrap mb-2"
        style={{ backgroundColor: "#e8c84a", color: "#0f1117" }}
      >
        <span className="flex items-center justify-center gap-2">
          <i className="ri-rocket-line"></i>
          Bắt đầu lộ trình ngay!
        </span>
      </button>
      <button
        onClick={onRedo}
        className="w-full py-2.5 rounded-2xl text-sm cursor-pointer whitespace-nowrap transition-colors"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        Làm lại quiz
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(0); // 0=welcome, 1=level, 2=goal, 3=time, 4=result
  const [level, setLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [dailyTime, setDailyTime] = useState("");
  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapResult | null>(null);
  const [, setSavedRoadmap] = useLocalStorage<RoadmapResult | null>("kts_ai_roadmap", null);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const result = generateRoadmap(level, goal, dailyTime);
      setRoadmap(result);
      setSavedRoadmap(result);
      setGenerating(false);
      setStep(4);
    }, 1800);
  };

  const handleStart = async (): Promise<boolean> => {
    // Local marker (kept for legacy code that may still check it).
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, "1");
    // Authoritative: mark the user's profile as onboarded so OnboardingGate
    // doesn't redirect them on the next login from any device.
    if (user) {
      const { error } = await supabase
        .from("user_profiles")
        .update({ onboarded_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) {
        console.warn("[onboarding] failed to persist onboarded_at:", error.message);
        alert("Không lưu được tiến độ. Vui lòng kiểm tra mạng và thử lại.");
        return false;
      }
      await refreshProfile();
    }
    return true;
  };

  const canProceed = (s: number) => {
    if (s === 1) return !!level;
    if (s === 2) return !!goal;
    if (s === 3) return !!dailyTime;
    return true;
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-5 py-8"
      style={{ backgroundColor: "#0a0c12", fontFamily: "'Outfit', sans-serif" }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Back */}
      <div className="w-full max-w-sm flex items-center justify-between mb-2">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-xs transition-colors cursor-pointer" style={{ color: "rgba(255,255,255,0.3)" }}>
          <i className="ri-arrow-left-line text-sm"></i>
          Về trang chủ
        </Link>
        {step > 0 && step < 4 && (
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Bước {step}/3</span>
        )}
      </div>

      {/* Progress */}
      {step > 0 && step < 4 && (
        <div className="w-full max-w-sm mb-4">
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all duration-400"
                style={{ backgroundColor: i <= step ? "#e8c84a" : "rgba(255,255,255,0.08)" }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "rgba(232,200,74,0.12)", border: "1px solid rgba(232,200,74,0.2)" }}>
              <i className="ri-robot-2-line text-4xl" style={{ color: "#e8c84a" }}></i>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">AI tạo lộ trình học</h1>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
              Trả lời 3 câu hỏi ngắn — AI sẽ tạo lộ trình học tiếng Hàn được cá nhân hóa hoàn toàn cho bạn.
            </p>
            <div className="space-y-2.5 mb-6 text-left">
              {[
                { icon: "ri-user-line", text: "Phân tích trình độ hiện tại của bạn" },
                { icon: "ri-focus-3-line", text: "Xác định mục tiêu học tập rõ ràng" },
                { icon: "ri-route-line", text: "Tạo lộ trình học theo từng tuần" },
                { icon: "ri-time-line", text: "Phù hợp với thời gian bạn có" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: "rgba(232,200,74,0.12)" }}>
                    <i className={`${item.icon} text-sm`} style={{ color: "#e8c84a" }}></i>
                  </div>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Level */}
        {step === 1 && (
          <div className="w-full">
            <h2 className="text-xl font-bold text-white mb-1 text-center">Trình độ hiện tại?</h2>
            <p className="text-sm text-center mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>Cho AI biết để tạo lộ trình phù hợp nhất</p>
            <div className="space-y-2.5">
              {LEVEL_OPTIONS.map(opt => (
                <OptionCard key={opt.label} {...opt} selected={level === opt.label} onClick={() => setLevel(opt.label)} />
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div className="w-full">
            <h2 className="text-xl font-bold text-white mb-1 text-center">Mục tiêu học?</h2>
            <p className="text-sm text-center mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>AI sẽ tối ưu lộ trình theo mục tiêu này</p>
            <div className="space-y-2.5">
              {GOAL_OPTIONS.map(opt => (
                <OptionCard key={opt.label} {...opt} selected={goal === opt.label} onClick={() => setGoal(opt.label)} />
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Daily time */}
        {step === 3 && (
          <div className="w-full">
            <h2 className="text-xl font-bold text-white mb-1 text-center">Thời gian học mỗi ngày?</h2>
            <p className="text-sm text-center mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>Học đều đặn mỗi ngày hiệu quả hơn học nhiều một lúc</p>
            <div className="space-y-2.5">
              {TIME_OPTIONS.map(opt => (
                <OptionCard key={opt.label} {...opt} selected={dailyTime === opt.label} onClick={() => setDailyTime(opt.label)} recommended={opt.recommended} />
              ))}
            </div>
          </div>
        )}

        {/* Generating */}
        {generating && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(232,200,74,0.12)" }}>
              <i className="ri-robot-2-line text-3xl animate-pulse" style={{ color: "#e8c84a" }}></i>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">AI đang phân tích...</h3>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Đang tạo lộ trình cá nhân hóa cho bạn</p>
            <div className="flex justify-center gap-1.5 mt-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#e8c84a", animationDelay: `${i * 0.15}s` }}></div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && roadmap && !generating && (
          <div className="w-full overflow-y-auto max-h-[70vh] pr-1">
            <RoadmapScreen roadmap={roadmap} onStart={handleStart} onRedo={() => { setStep(0); setLevel(""); setGoal(""); setDailyTime(""); setRoadmap(null); }} />
          </div>
        )}
      </div>

      {/* CTA */}
      {step < 4 && !generating && (
        <div className="w-full max-w-sm mt-6">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="w-full py-3 rounded-2xl text-sm font-medium mb-2 cursor-pointer whitespace-nowrap transition-colors"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Quay lại
            </button>
          )}
          <button
            onClick={() => {
              if (step === 3) {
                handleGenerate();
              } else {
                setStep(s => s + 1);
              }
            }}
            disabled={!canProceed(step)}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all cursor-pointer whitespace-nowrap"
            style={{
              backgroundColor: canProceed(step) ? "#e8c84a" : "rgba(255,255,255,0.06)",
              color: canProceed(step) ? "#0f1117" : "rgba(255,255,255,0.2)",
              cursor: canProceed(step) ? "pointer" : "not-allowed",
            }}
          >
            <span className="flex items-center justify-center gap-2">
              {step === 0 ? (
                <><i className="ri-robot-2-line"></i>Bắt đầu quiz AI</>
              ) : step === 3 ? (
                <><i className="ri-magic-line"></i>Tạo lộ trình AI</>
              ) : (
                <>Tiếp theo<i className="ri-arrow-right-line"></i></>
              )}
            </span>
          </button>
          {step === 0 && (
            <p className="text-center text-xs mt-3" style={{ color: "rgba(255,255,255,0.2)" }}>Miễn phí · Không cần thẻ tín dụng</p>
          )}
        </div>
      )}
    </div>
  );
}
