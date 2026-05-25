import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface LevelPath {
  level: string;
  label: string;
  color: string;
  desc: string;
  steps: { icon: string; label: string; path: string; desc: string; badge?: string }[];
}

const levelPaths: LevelPath[] = [
  {
    level: "beginner",
    label: "Mới bắt đầu",
    color: "#34d399",
    desc: "Chưa biết gì về tiếng Hàn",
    steps: [
      { icon: "ri-font-size", label: "Học bảng chữ Hangul", path: "/hangul", desc: "Bước đầu tiên bắt buộc", badge: "Bắt đầu" },
      { icon: "ri-translate-2", label: "Từ vựng A1 cơ bản", path: "/topik-vocab-level", desc: "200 từ thiết yếu nhất" },
      { icon: "ri-book-read-line", label: "Đọc bài A1", path: "/reading-by-level", desc: "Bài đọc đơn giản" },
      { icon: "ri-stack-line", label: "EPS Flashcard thông minh", path: "/eps-smart-flashcard", desc: "Ôn tập từ vựng EPS" },
    ],
  },
  {
    level: "elementary",
    label: "Sơ cấp (A2)",
    color: "#fbbf24",
    desc: "Biết Hangul, muốn giao tiếp cơ bản",
    steps: [
      { icon: "ri-chat-voice-line", label: "Tiếng Hàn giao tiếp", path: "/conversation", desc: "Hội thoại hàng ngày", badge: "Hot" },
      { icon: "ri-book-2-line", label: "Ngữ pháp theo chủ đề", path: "/grammar-by-topic", desc: "Cấu trúc A1-A2" },
      { icon: "ri-headphone-line", label: "Luyện nghe A2", path: "/listening-by-level", desc: "Nghe và hiểu" },
      { icon: "ri-mic-2-line", label: "Luyện nói A2", path: "/speaking-level", desc: "Phát âm chuẩn" },
    ],
  },
  {
    level: "intermediate",
    label: "Trung cấp (B1-B2)",
    color: "#f87171",
    desc: "Giao tiếp được, muốn lên TOPIK",
    steps: [
      { icon: "ri-survey-line", label: "Thi thử TOPIK I", path: "/topik-test", desc: "Kiểm tra trình độ", badge: "TOPIK" },
      { icon: "ri-newspaper-line", label: "Từ vựng EPS theo chủ đề", path: "/eps-vocabulary", desc: "Từ vựng EPS thực tế" },
      { icon: "ri-character-recognition-line", label: "Hán Hàn chi tiết", path: "/hanja-detail", desc: "Mở rộng từ vựng" },
      { icon: "ri-book-read-line", label: "Đọc bài B1-B2", path: "/reading-by-level", desc: "Nâng cao đọc hiểu" },
    ],
  },
  {
    level: "advanced",
    label: "Cao cấp (C1+)",
    color: "#a78bfa",
    desc: "Muốn TOPIK II hoặc làm việc",
    steps: [
      { icon: "ri-file-list-3-line", label: "Thi thử TOPIK II", path: "/topik2-test", desc: "Luyện đề thật", badge: "TOPIK II" },
      { icon: "ri-quill-pen-line", label: "Luyện viết C1", path: "/writing-by-level", desc: "Viết luận tiếng Hàn" },
      { icon: "ri-mic-line", label: "Luyện nói EPS", path: "/eps-speaking", desc: "Phỏng vấn EPS" },
      { icon: "ri-book-read-line", label: "Đọc bài C1-C2", path: "/reading-by-level", desc: "Văn bản phức tạp" },
    ],
  },
];

export default function QuickStartGuide() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useLocalStorage("kts_quickstart_dismissed", false);
  const [selectedLevel, setSelectedLevel] = useLocalStorage("kts_user_level", "beginner");

  if (dismissed) return null;

  const currentPath = levelPaths.find((p) => p.level === selectedLevel) || levelPaths[0];

  return (
    <div
      className="rounded-2xl border overflow-hidden h-full"
      style={{ backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-app-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-accent-primary/12">
            <i className="ri-compass-3-line text-app-accent-primary text-sm" />
          </div>
          <p className="text-white/80 font-semibold text-sm">Bắt đầu từ đâu?</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="w-6 h-6 flex items-center justify-center rounded-md bg-app-card/50 hover:bg-app-card/70 text-app-text-muted hover:text-white/50 cursor-pointer transition-colors"
        >
          <i className="ri-close-line text-xs" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Level selector — compact pills */}
        <div className="flex flex-wrap gap-1.5">
          {levelPaths.map((lp) => (
            <button
              key={lp.level}
              onClick={() => setSelectedLevel(lp.level)}
              className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all whitespace-nowrap"
              style={
                selectedLevel === lp.level
                  ? { backgroundColor: `${lp.color}20`, color: lp.color, border: `1px solid ${lp.color}40` }
                  : { backgroundColor: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {lp.label}
            </button>
          ))}
        </div>

        {/* Steps — compact list */}
        <div className="space-y-1.5">
          {currentPath.steps.map((step, i) => (
            <button
              key={step.path}
              onClick={() => navigate(step.path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-left group"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
                style={{ backgroundColor: `${currentPath.color}18` }}
              >
                <i className={`${step.icon} text-sm`} style={{ color: currentPath.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-app-text-muted text-[9px] font-bold">#{i + 1}</span>
                  <p className="text-white/75 text-xs font-medium group-hover:text-white transition-colors truncate">
                    {step.label}
                  </p>
                  {step.badge && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                      style={{ backgroundColor: `${currentPath.color}20`, color: currentPath.color }}
                    >
                      {step.badge}
                    </span>
                  )}
                </div>
                <p className="text-app-text-muted text-[10px] truncate">{step.desc}</p>
              </div>
              <i
                className="ri-arrow-right-line text-xs flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
                style={{ color: `${currentPath.color}50` }}
              />
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/onboarding")}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
          style={{ backgroundColor: "rgba(232,200,74,0.08)", color: "app-accent-primary", border: "1px solid rgba(232,200,74,0.15)" }}
        >
          <i className="ri-route-line" />
          Tạo lộ trình cá nhân
        </button>
      </div>
    </div>
  );
}
