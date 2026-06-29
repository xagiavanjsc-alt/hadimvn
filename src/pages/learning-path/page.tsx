import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useLearningPath } from "@/hooks/useLearningPath";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

export default function LearningPathPage() {
  const { user } = useAuth();
  const { performance, path, completeLesson, resetPath, analyzeWeaknesses } = useLearningPath();
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  usePageSEO({
    title: "Lộ trình học tập cá nhân | Hàn Quốc Ơi!",
    description: "Lộ trình học tập cá nhân hóa dựa trên điểm mạnh và điểm yếu của bạn. Đề xuất bài học thông minh để tối ưu hóa kết quả thi EPS/TOPIK.",
    keywords: "lộ trình học tập, cá nhân hóa, adaptive learning, EPS, TOPIK",
    path: "/learning-path",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Lộ trình học tập cá nhân",
      description: "Personalized learning path based on performance",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const { weakSkills, strongSkills } = analyzeWeaknesses();

  const getSkillLabel = (skill: string) => {
    switch (skill) {
      case "listening": return "Nghe";
      case "reading": return "Đọc";
      case "grammar": return "Ngữ pháp";
      case "vocabulary": return "Từ vựng";
      default: return skill;
    }
  };

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case "listening": return "ri-headphone-line";
      case "reading": return "ri-book-open-line";
      case "grammar": return "ri-book-2-line";
      case "vocabulary": return "ri-translate-2";
      default: return "ri-question-line";
    }
  };

  const getSkillColor = (skill: string) => {
    switch (skill) {
      case "listening": return "#60a5fa";
      case "reading": return "#4ade80";
      case "grammar": return "#f87171";
      case "vocabulary": return "#fbbf24";
      default: return "#94a3b8";
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "#4ade80";
    if (score >= 60) return "#fbbf24";
    return "#f87171";
  };

  const handleCompleteLesson = (lessonId: number) => {
    completeLesson(lessonId);
  };

  return (
    <DashboardLayout title="Lộ trình học tập cá nhân" subtitle="Cá nhân hóa dựa trên điểm mạnh/yếu">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Current Progress */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-bold">Tiến độ hiện tại</h2>
            <button
              onClick={resetPath}
              className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
            >
              Đặt lại lộ trình
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-app-text-muted text-sm">Bài học hiện tại</span>
                <span className="text-white font-bold">Bài {path.currentLevel}/60</span>
              </div>
              <div className="h-2 bg-app-surface/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-app-accent-primary transition-all duration-500"
                  style={{ width: `${(path.currentLevel / 60) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {(["listening", "reading", "grammar", "vocabulary"] as const).map(skill => (
              <div key={skill} className="bg-app-surface/30 rounded-lg p-3 text-center">
                <i
                  className={`text-2xl mb-1 ${getSkillIcon(skill)}`}
                  style={{ color: getSkillColor(skill) }}
                />
                <p className="text-xs text-app-text-muted mb-1">{getSkillLabel(skill)}</p>
                <p
                  className="text-lg font-bold"
                  style={{ color: getPerformanceColor(performance[skill]) }}
                >
                  {performance[skill]}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Skills */}
        {weakSkills.length > 0 && (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <i className="ri-alert-line text-rose-400" />
              Cần cải thiện
            </h3>
            <div className="flex flex-wrap gap-2">
              {weakSkills.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: `${getSkillColor(skill)}20`, color: getSkillColor(skill) }}
                >
                  <i className={`${getSkillIcon(skill)} mr-1`} />
                  {getSkillLabel(skill)} ({performance[skill as keyof typeof performance]}%)
                </span>
              ))}
            </div>
            <p className="text-app-text-muted text-xs mt-3">
              Hãy tập trung vào các kỹ năng này để cải thiện kết quả thi.
            </p>
          </div>
        )}

        {/* Strong Skills */}
        {strongSkills.length > 0 && (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <i className="ri-star-line text-emerald-400" />
              Điểm mạnh
            </h3>
            <div className="flex flex-wrap gap-2">
              {strongSkills.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: `${getSkillColor(skill)}20`, color: getSkillColor(skill) }}
                >
                  <i className={`${getSkillIcon(skill)} mr-1`} />
                  {getSkillLabel(skill)} ({performance[skill as keyof typeof performance]}%)
                </span>
              ))}
            </div>
            <p className="text-app-text-muted text-xs mt-3">
              Tiếp tục phát huy các kỹ năng này!
            </p>
          </div>
        )}

        {/* Recommended Lessons */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <i className="ri-lightbulb-line text-app-accent-primary" />
            Bài học đề xuất
          </h3>
          <div className="space-y-2">
            {path.recommendedLessons.map((lessonId, index) => (
              <div
                key={lessonId}
                className="flex items-center justify-between bg-app-surface/30 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: getSkillColor(index < 2 ? "listening" : index < 4 ? "reading" : "grammar") }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Bài {lessonId}</p>
                    <p className="text-app-text-muted text-xs">
                      {index === 0 && "Ưu tiên cao - Cải thiện kỹ năng yếu"}
                      {index === 1 && "Ưu tiên cao - Cải thiện kỹ năng yếu"}
                      {index === 2 && "Ưu tiên trung bình"}
                      {index === 3 && "Ưu tiên trung bình"}
                      {index === 4 && "Tiếp theo trong lộ trình"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCompleteLesson(lessonId)}
                  className="px-3 py-1.5 rounded-lg bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-xs cursor-pointer transition-colors"
                >
                  Hoàn thành
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Tips */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <i className="ri-information-line text-app-accent-primary" />
            Mẹo học tập hiệu quả
          </h3>
          <ul className="text-app-text-muted text-sm space-y-2">
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-emerald-400 mt-0.5" />
              <span>Học tập trung trung vào các kỹ năng yếu để cải thiện nhanh nhất</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-emerald-400 mt-0.5" />
              <span>Làm đề thi thường xuyên để theo dõi tiến độ</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-emerald-400 mt-0.5" />
              <span>Ôn tập từ vựng theo Spaced Repetition để nhớ lâu hơn</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-emerald-400 mt-0.5" />
              <span>Luyện nghe hàng ngày để cải thiện kỹ năng nghe</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
