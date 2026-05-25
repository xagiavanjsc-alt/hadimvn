import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";

interface RoadmapLevel {
  id: string;
  level: "beginner" | "elementary" | "intermediate" | "upper-intermediate" | "advanced";
  topik: string;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  skills: string[];
  vocabTarget: number;
  grammarPoints: string[];
  recommendedLessons: string[];
  badge: string;
}

const ROADMAP_LEVELS: RoadmapLevel[] = [
  {
    id: "beginner",
    level: "beginner",
    topik: "Nhập môn",
    title: "Hangul & Phát âm",
    subtitle: "Làm quen bảng chữ cái, phát âm cơ bản",
    color: "#34d399",
    icon: "ri-seedling-line",
    badge: "Bắt đầu tại đây",
    skills: ["Đọc được Hangul", "Phát âm 40 âm cơ bản", "Chào hỏi đơn giản", "Số đếm 1-100"],
    vocabTarget: 100,
    grammarPoints: ["이다/아니다 (là/không là)", "은/는 (chủ ngữ)", "이/가 (chủ thể)", "을/를 (tân ngữ)"],
    recommendedLessons: ["Bài hát có giai điệu chậm, từ vựng đơn giản"],
  },
  {
    id: "elementary",
    level: "elementary",
    topik: "TOPIK I — Cấp 1",
    title: "Giao tiếp cơ bản",
    subtitle: "Câu đơn giản, từ vựng hàng ngày",
    color: "app-accent-primary",
    icon: "ri-plant-line",
    badge: "TOPIK 1",
    skills: ["Giới thiệu bản thân", "Mua sắm, ăn uống", "Hỏi đường", "Nói về sở thích"],
    vocabTarget: 800,
    grammarPoints: ["아/어요 (kính ngữ)", "고 싶다 (muốn)", "에 가다 (đi đến)", "-(으)ㄹ 수 있다 (có thể)"],
    recommendedLessons: ["K-pop ballad chậm", "OST phim Hàn"],
  },
  {
    id: "intermediate",
    level: "intermediate",
    topik: "TOPIK I — Cấp 2",
    title: "Diễn đạt ý kiến",
    subtitle: "Câu phức tạp, ngữ pháp trung cấp",
    color: "#fb923c",
    icon: "ri-tree-line",
    badge: "TOPIK 2",
    skills: ["Kể chuyện quá khứ", "Diễn đạt cảm xúc", "Đọc hiểu đoạn ngắn", "Viết email đơn giản"],
    vocabTarget: 1500,
    grammarPoints: ["-(으)면 (nếu)", "-기 때문에 (vì)", "-(으)ㄴ/는데 (nhưng/mà)", "-아/어서 (vì/nên)"],
    recommendedLessons: ["K-pop idol group", "Nhạc có lyric kể chuyện"],
  },
  {
    id: "upper-intermediate",
    level: "upper-intermediate",
    topik: "TOPIK II — Cấp 3",
    title: "Tiếng Hàn tự nhiên",
    subtitle: "Ngữ pháp nâng cao, đọc báo đơn giản",
    color: "#a78bfa",
    icon: "ri-leaf-line",
    badge: "TOPIK 3",
    skills: ["Đọc tin tức đơn giản", "Thảo luận chủ đề xã hội", "Viết đoạn văn", "Nghe hiểu 70%"],
    vocabTarget: 3000,
    grammarPoints: ["-(으)ㄹ 뿐만 아니라 (không chỉ...mà còn)", "-에 따르면 (theo)", "-(으)ㄹ수록 (càng...càng)", "-도록 (để/cho đến khi)"],
    recommendedLessons: ["Nhạc Hàn có lyric sâu sắc", "Tin tức Naver đơn giản"],
  },
  {
    id: "advanced",
    level: "advanced",
    topik: "TOPIK II — Cấp 4-6",
    title: "Thành thạo tiếng Hàn",
    subtitle: "Đọc báo, xem phim không phụ đề",
    color: "#f472b6",
    icon: "ri-award-line",
    badge: "TOPIK 4-6",
    skills: ["Đọc báo Hàn tự nhiên", "Xem phim không phụ đề", "Viết luận văn", "Phỏng vấn xin việc"],
    vocabTarget: 6000,
    grammarPoints: ["Văn phong trang trọng", "Thành ngữ & tục ngữ", "Từ Hán-Hàn nâng cao", "Ngữ pháp học thuật"],
    recommendedLessons: ["Nhạc rap Hàn", "Tin tức Naver đầy đủ", "Podcast tiếng Hàn"],
  },
];

function LevelCard({ level, lessons, isActive, isCompleted, onSelect }: {
  level: RoadmapLevel;
  lessons: ApprovedLesson[];
  isActive: boolean;
  isCompleted: boolean;
  onSelect: () => void;
}) {
  const matchedLessons = lessons.filter(l => (l.stars ?? 0) >= 3).slice(0, 3);

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer ${
        isActive
          ? "border-white/20 bg-app-card/50"
          : isCompleted
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-app-border bg-app-bg hover:border-app-border"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ backgroundColor: `${level.color}20` }}
        >
          {isCompleted ? (
            <i className="ri-checkbox-circle-fill text-app-accent-success text-xl"></i>
          ) : (
            <i className={`${level.icon} text-xl`} style={{ color: level.color }}></i>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${level.color}15`, color: level.color }}
            >
              {level.badge}
            </span>
            <span className="text-app-text-muted text-[10px]">{level.topik}</span>
          </div>
          <h3 className="text-white font-bold text-sm mb-0.5">{level.title}</h3>
          <p className="text-app-text-secondary text-xs">{level.subtitle}</p>

          {/* Vocab target */}
          <div className="flex items-center gap-2 mt-2">
            <i className="ri-translate-2 text-app-text-muted text-xs"></i>
            <span className="text-app-text-muted text-[10px]">Mục tiêu: {level.vocabTarget.toLocaleString()} từ vựng</span>
          </div>
        </div>

        <i className={`ri-arrow-right-s-line text-app-text-muted text-lg flex-shrink-0 transition-transform ${isActive ? "rotate-90" : ""}`}></i>
      </div>

      {/* Expanded content */}
      {isActive && (
        <div className="mt-5 pt-5 border-t border-app-border space-y-4">
          {/* Skills */}
          <div>
            <p className="text-app-text-muted text-[10px] tracking-normal font-semibold mb-2">Kỹ năng cần đạt</p>
            <div className="grid grid-cols-2 gap-2">
              {level.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: level.color }}></div>
                  <span className="text-white/60 text-xs">{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grammar */}
          <div>
            <p className="text-app-text-muted text-[10px] tracking-normal font-semibold mb-2">Ngữ pháp trọng tâm</p>
            <div className="flex flex-wrap gap-1.5">
              {level.grammarPoints.map((g, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: `${level.color}10`, color: level.color }}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended lessons */}
          {matchedLessons.length > 0 && (
            <div>
              <p className="text-app-text-muted text-[10px] tracking-normal font-semibold mb-2">Bài học gợi ý từ kho của bạn</p>
              <div className="space-y-1.5">
                {matchedLessons.map(l => (
                  <div key={l.song.rank} className="flex items-center gap-2 bg-app-surface/50 rounded-lg px-3 py-2">
                    <i className="ri-music-2-line text-app-text-muted text-xs"></i>
                    <span className="text-white/60 text-xs truncate">{l.song.title}</span>
                    <span className="text-app-text-muted text-[10px] ml-auto flex-shrink-0">{l.song.artist}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </button>
  );
}

export default function RoadmapPage() {
  const navigate = useNavigate();
  const [approvedLessons] = useLocalStorage<ApprovedLesson[]>("kts_melon_lessons", []);
  const [currentLevel, setCurrentLevel] = useLocalStorage<string>("kts_current_level", "beginner");
  const [completedLevels, setCompletedLevels] = useLocalStorage<string[]>("kts_completed_levels", []);
  const [activeCard, setActiveCard] = useState<string | null>(currentLevel);

  const currentLevelData = ROADMAP_LEVELS.find(l => l.id === currentLevel);

  const handleSetLevel = (levelId: string) => {
    setCurrentLevel(levelId);
    setActiveCard(levelId);
  };

  const handleMarkComplete = (levelId: string) => {
    setCompletedLevels(prev => prev.includes(levelId) ? prev : [...prev, levelId]);
    const idx = ROADMAP_LEVELS.findIndex(l => l.id === levelId);
    if (idx < ROADMAP_LEVELS.length - 1) {
      setCurrentLevel(ROADMAP_LEVELS[idx + 1].id);
      setActiveCard(ROADMAP_LEVELS[idx + 1].id);
    }
  };

  const totalVocab = useMemo(() => {
    return approvedLessons.reduce((s, l) => s + (l.vocab?.length ?? 0), 0);
  }, [approvedLessons]);

  return (
    <DashboardLayout
      title="Lộ trình học tiếng Hàn"
      subtitle="Từ Hangul đến TOPIK — theo từng bước rõ ràng"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Roadmap */}
        <div className="space-y-3">
          {/* Current level banner */}
          {currentLevelData && (
            <div
              className="rounded-2xl p-5 mb-2 relative overflow-hidden"
              style={{ backgroundColor: `${currentLevelData.color}10`, border: `1px solid ${currentLevelData.color}25` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${currentLevelData.color}20` }}>
                    <i className={`${currentLevelData.icon} text-lg`} style={{ color: currentLevelData.color }}></i>
                  </div>
                  <div>
                    <p className="text-app-text-secondary text-[10px] tracking-normal font-semibold">Cấp độ hiện tại</p>
                    <p className="text-white font-bold text-sm">{currentLevelData.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMarkComplete(currentLevel)}
                    disabled={completedLevels.includes(currentLevel)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: completedLevels.includes(currentLevel) ? "#34d39920" : `${currentLevelData.color}20`,
                      color: completedLevels.includes(currentLevel) ? "#34d399" : currentLevelData.color,
                    }}
                  >
                    <i className={completedLevels.includes(currentLevel) ? "ri-checkbox-circle-fill" : "ri-checkbox-circle-line"}></i>
                    {completedLevels.includes(currentLevel) ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Level cards */}
          {ROADMAP_LEVELS.map((level, idx) => (
            <div key={level.id} className="relative">
              {/* Connector line */}
              {idx < ROADMAP_LEVELS.length - 1 && (
                <div className="absolute left-[34px] top-full w-0.5 h-3 z-10" style={{ backgroundColor: completedLevels.includes(level.id) ? "#34d399" : "rgba(255,255,255,0.05)" }}></div>
              )}
              <LevelCard
                level={level}
                lessons={approvedLessons}
                isActive={activeCard === level.id}
                isCompleted={completedLevels.includes(level.id)}
                onSelect={() => setActiveCard(activeCard === level.id ? null : level.id)}
              />
            </div>
          ))}
        </div>

        {/* Right: Stats & Tips */}
        <div className="space-y-4">
          {/* My stats */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Thống kê của bạn</h3>
            <div className="space-y-3">
              {[
                { label: "Bài học đã tạo", value: approvedLessons.length, icon: "ri-book-2-line", color: "app-accent-primary" },
                { label: "Từ vựng tích lũy", value: totalVocab, icon: "ri-translate-2", color: "#34d399" },
                { label: "Cấp độ hoàn thành", value: `${completedLevels.length}/${ROADMAP_LEVELS.length}`, icon: "ri-award-line", color: "#a78bfa" },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
                    <i className={`${stat.icon} text-sm`} style={{ color: stat.color }}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-app-text-secondary text-[10px]">{stat.label}</p>
                    <p className="text-white font-bold text-sm">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Set current level */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Chọn cấp độ của bạn</h3>
            <div className="space-y-2">
              {ROADMAP_LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => handleSetLevel(level.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                    currentLevel === level.id
                      ? "border-white/20 bg-app-card/50"
                      : "border-transparent hover:bg-app-surface/50"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: level.color }}></div>
                  <span className={`text-xs font-medium flex-1 ${currentLevel === level.id ? "text-white" : "text-white/50"}`}>
                    {level.title}
                  </span>
                  {currentLevel === level.id && (
                    <i className="ri-map-pin-2-fill text-xs" style={{ color: level.color }}></i>
                  )}
                  {completedLevels.includes(level.id) && currentLevel !== level.id && (
                    <i className="ri-checkbox-circle-fill text-app-accent-success text-xs"></i>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Học ngay</h3>
            <div className="space-y-2">
              {[
                { icon: "ri-stack-line", label: "Ôn flashcard EPS", sub: "Luyện từ vựng EPS", path: "/eps-flashcard", color: "app-accent-primary" },
                { icon: "ri-timer-line", label: "Thi thử EPS", sub: "40 câu mô phỏng", path: "/eps-exam", color: "#34d399" },
                { icon: "ri-book-2-line", label: "Ebook Builder", sub: "Xuất bản ebook", path: "/ebook", color: "#fb923c" },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-app-surface/50 hover:bg-app-card/50 border border-app-border hover:border-app-border transition-all cursor-pointer text-left"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                    <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium">{item.label}</p>
                    <p className="text-app-text-muted text-[10px]">{item.sub}</p>
                  </div>
                  <i className="ri-arrow-right-s-line text-app-text-muted text-sm ml-auto"></i>
                </button>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4">
            <p className="text-app-accent-primary/80 text-xs font-semibold mb-1">Mẹo học hiệu quả</p>
            <p className="text-app-text-secondary text-xs leading-relaxed">
              Học 15-20 phút/ngày đều đặn hiệu quả hơn học 2 tiếng/tuần. Kết hợp K-pop + flashcard + đọc tin tức để tiến bộ nhanh nhất!
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

