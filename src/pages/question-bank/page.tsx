import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

export default function QuestionBankPage() {
  const { user } = useAuth();
  const {
    questions,
    tags,
    loading,
    filters,
    toggleFilter,
    clearFilters,
    getTagsByCategory,
    getFilteredCount,
  } = useQuestionBank();
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  usePageSEO({
    title: "Ngân hàng câu hỏi | Hàn Quốc Ơi!",
    description: "Ngân hàng câu hỏi EPS/TOPIK với tags theo chủ đề, độ khó, ngữ pháp. Filter nâng cao để luyện tập theo nhu cầu.",
    keywords: "ngân hàng câu hỏi, question bank, tags, filter, EPS, TOPIK",
    path: "/question-bank",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Ngân hàng câu hỏi EPS/TOPIK",
      description: "Question bank with tags for EPS/TOPIK exam",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const topicTags = getTagsByCategory("topic");
  const difficultyTags = getTagsByCategory("difficulty");
  const skillTags = getTagsByCategory("skill");
  const grammarTags = getTagsByCategory("grammar");

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return "Dễ";
      case 2: return "Khá dễ";
      case 3: return "Trung bình";
      case 4: return "Khá khó";
      case 5: return "Khó";
      default: return `${level}`;
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return "#4ade80";
      case 2: return "#60a5fa";
      case 3: return "#fbbf24";
      case 4: return "#f97316";
      case 5: return "#ef4444";
      default: return "#94a3b8";
    }
  };

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

  return (
    <DashboardLayout title="Ngân hàng câu hỏi" subtitle="Filter theo tags và luyện tập">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{questions.length}</p>
            <p className="text-app-text-muted text-xs">Câu hỏi</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-app-accent-primary">{tags.length}</p>
            <p className="text-app-text-muted text-xs">Tags</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{getFilteredCount()}</p>
            <p className="text-app-text-muted text-xs">Filter đang chọn</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Bộ lọc</h2>
            {getFilteredCount() > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Topic Tags */}
          {topicTags.length > 0 && (
            <div className="mb-4">
              <p className="text-app-text-muted text-xs mb-2">Chủ đề</p>
              <div className="flex flex-wrap gap-2">
                {topicTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleFilter("topics", tag.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      filters.topics.includes(tag.name)
                        ? "text-white font-semibold"
                        : "bg-app-surface/30 text-app-text-muted"
                    }`}
                    style={
                      filters.topics.includes(tag.name)
                        ? { backgroundColor: tag.color }
                        : {}
                    }
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty Tags */}
          {difficultyTags.length > 0 && (
            <div className="mb-4">
              <p className="text-app-text-muted text-xs mb-2">Độ khó</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => toggleFilter("difficulties", level)}
                    className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      filters.difficulties.includes(level)
                        ? "text-white font-semibold"
                        : "bg-app-surface/30 text-app-text-muted"
                    }`}
                    style={
                      filters.difficulties.includes(level)
                        ? { backgroundColor: getDifficultyColor(level) }
                        : {}
                    }
                  >
                    {getDifficultyLabel(level)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Skill Tags */}
          {skillTags.length > 0 && (
            <div className="mb-4">
              <p className="text-app-text-muted text-xs mb-2">Kỹ năng</p>
              <div className="flex flex-wrap gap-2">
                {skillTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleFilter("skills", tag.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      filters.skills.includes(tag.name)
                        ? "text-white font-semibold"
                        : "bg-app-surface/30 text-app-text-muted"
                    }`}
                    style={
                      filters.skills.includes(tag.name)
                        ? { backgroundColor: tag.color }
                        : {}
                    }
                  >
                    <i className={`${getSkillIcon(tag.name)} mr-1`} />
                    {getSkillLabel(tag.name)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grammar Tags */}
          {grammarTags.length > 0 && (
            <div>
              <p className="text-app-text-muted text-xs mb-2">Ngữ pháp</p>
              <div className="flex flex-wrap gap-2">
                {grammarTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleFilter("grammarPoints", tag.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      filters.grammarPoints.includes(tag.name)
                        ? "text-white font-semibold"
                        : "bg-app-surface/30 text-app-text-muted"
                    }`}
                    style={
                      filters.grammarPoints.includes(tag.name)
                        ? { backgroundColor: tag.color }
                        : {}
                    }
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <i className="ri-question-line text-4xl text-app-text-muted mb-3" />
            <p className="text-white font-semibold mb-2">Không tìm thấy câu hỏi</p>
            <p className="text-app-text-muted text-sm mb-4">
              Thử thay đổi bộ lọc hoặc xóa bộ lọc hiện tại
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="bg-app-bg border border-app-border rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-app-text-muted text-xs">#{index + 1}</span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${getDifficultyColor(question.difficulty)}15`,
                        color: getDifficultyColor(question.difficulty),
                      }}
                    >
                      {getDifficultyLabel(question.difficulty)}
                    </span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "#60a5fa15",
                        color: "#60a5fa",
                      }}
                    >
                      <i className={`${getSkillIcon(question.skill)} mr-1`} />
                      {getSkillLabel(question.skill)}
                    </span>
                  </div>
                </div>

                <p className="text-white text-sm mb-3">{question.question}</p>

                {question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {question.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs px-2 py-0.5 rounded-full bg-app-surface/30 text-app-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {question.explanation && (
                  <div className="bg-app-surface/30 rounded-lg p-3">
                    <p className="text-app-accent-primary text-xs font-semibold mb-1">
                      <i className="ri-lightbulb-line mr-1"></i>Giải thích
                    </p>
                    <p className="text-app-text-muted text-xs">{question.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <i className="ri-information-line text-app-accent-primary" />
            Thông tin
          </h3>
          <ul className="text-app-text-muted text-sm space-y-1">
            <li>• Filter câu hỏi theo chủ đề, độ khó, kỹ năng, ngữ pháp</li>
            <li>• Tags giúp bạn tìm câu hỏi phù hợp với nhu cầu</li>
            <li>• Luyện tập theo kỹ năng yếu để cải thiện nhanh nhất</li>
            <li>• Xem giải thích chi tiết cho mỗi câu hỏi</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
