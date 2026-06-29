import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useWritingPractice } from "@/hooks/useWritingPractice";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

export default function WritingPracticePage() {
  const { user } = useAuth();
  const {
    exercises,
    submissions,
    loading,
    fetchSubmissions,
    submitWriting,
    getExerciseTypeLabel,
    getDifficultyLabel,
  } = useWritingPractice();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [writingContent, setWritingContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  usePageSEO({
    title: "Luyện viết tiếng Hàn | Hàn Quốc Ơi!",
    description: "Bài tập viết tiếng Hàn với AI correction và community feedback. Luyện viết email, bài viết, hội thoại.",
    keywords: "luyện viết, writing practice, AI correction, tiếng Hàn viết",
    path: "/writing-practice",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Luyện viết tiếng Hàn",
      description: "Writing practice with AI correction",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  useState(() => {
    if (user) {
      fetchSubmissions(user.id);
    }
  });

  const handleSubmit = async () => {
    if (!user || !selectedExercise || !writingContent.trim()) return;

    setIsSubmitting(true);
    const success = await submitWriting(selectedExercise, writingContent, user.id);
    if (success) {
      setWritingContent("");
      setSelectedExercise(null);
      fetchSubmissions(user.id);
    }
    setIsSubmitting(false);
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

  return (
    <DashboardLayout title="Luyện viết tiếng Hàn" subtitle="Bài tập viết với AI correction">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{exercises.length}</p>
            <p className="text-app-text-muted text-xs">Bài tập</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-app-accent-primary">{submissions.length}</p>
            <p className="text-app-text-muted text-xs">Đã nộp</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {submissions.filter(s => s.status === "reviewed").length}
            </p>
            <p className="text-app-text-muted text-xs">Đã chấm</p>
          </div>
        </div>

        {/* Writing Area */}
        {selectedExercise ? (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Viết bài</h2>
              <button
                onClick={() => setSelectedExercise(null)}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Hủy
              </button>
            </div>

            <div className="mb-4">
              <p className="text-app-text-muted text-xs mb-1">Đề bài</p>
              <p className="text-white text-sm mb-2">
                {exercises.find(e => e.id === selectedExercise)?.prompt}
              </p>
              <div className="flex gap-2 mb-4">
                <span
                  className="text-xs px-2 py-0.5 rounded-full bg-app-surface/30 text-app-text-muted"
                >
                  {getExerciseTypeLabel(exercises.find(e => e.id === selectedExercise)?.type || "essay")}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${getDifficultyColor(exercises.find(e => e.id === selectedExercise)?.difficulty || 3)}15`,
                    color: getDifficultyColor(exercises.find(e => e.id === selectedExercise)?.difficulty || 3),
                  }}
                >
                  {getDifficultyLabel(exercises.find(e => e.id === selectedExercise)?.difficulty || 3)}
                </span>
              </div>
            </div>

            <textarea
              value={writingContent}
              onChange={e => setWritingContent(e.target.value)}
              placeholder="Viết bài của bạn ở đây..."
              rows={8}
              className="w-full px-4 py-3 rounded-xl bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50 resize-none"
            />

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !writingContent.trim()}
              className="w-full mt-4 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold cursor-pointer transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Đang nộp..." : "Nộp bài"}
            </button>
          </div>
        ) : (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">Chọn bài tập</h2>
            <div className="space-y-3">
              {exercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => setSelectedExercise(exercise.id)}
                  className="w-full text-left bg-app-surface/30 rounded-xl p-4 cursor-pointer hover:bg-app-surface/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white text-sm font-medium">{exercise.title}</h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${getDifficultyColor(exercise.difficulty)}15`,
                        color: getDifficultyColor(exercise.difficulty),
                      }}
                    >
                      {getDifficultyLabel(exercise.difficulty)}
                    </span>
                  </div>
                  <p className="text-app-text-muted text-xs mb-2 line-clamp-2">{exercise.prompt}</p>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-app-surface/50 text-app-text-muted">
                      {getExerciseTypeLabel(exercise.type)}
                    </span>
                    {exercise.word_limit && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-app-surface/50 text-app-text-muted">
                        {exercise.word_limit} từ
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submissions History */}
        {submissions.length > 0 && (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">Lịch sử bài viết</h2>
            <div className="space-y-3">
              {submissions.map((submission) => {
                const exercise = exercises.find(e => e.id === submission.exercise_id);
                return (
                  <div
                    key={submission.id}
                    className="bg-app-surface/30 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white text-sm font-medium">
                          {exercise?.title || "Bài tập"}
                        </h3>
                        <p className="text-app-text-faint text-xs">
                          {new Date(submission.submitted_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          submission.status === "reviewed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {submission.status === "reviewed" ? "Đã chấm" : "Đang chờ"}
                      </span>
                    </div>
                    <p className="text-app-text-muted text-xs line-clamp-2 mb-2">
                      {submission.content}
                    </p>
                    {submission.corrections && submission.corrections.length > 0 && (
                      <div className="bg-app-surface/50 rounded-lg p-3">
                        <p className="text-app-accent-primary text-xs font-semibold mb-2">
                          <i className="ri-edit-line mr-1"></i>Sửa lỗi
                        </p>
                        {submission.corrections.map((correction, idx) => (
                          <div key={idx} className="mb-2 last:mb-0">
                            <p className="text-rose-400 text-xs line-through">{correction.original}</p>
                            <p className="text-emerald-400 text-xs">{correction.corrected}</p>
                            <p className="text-app-text-muted text-xs">{correction.explanation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <i className="ri-information-line text-app-accent-primary" />
            Thông tin
          </h3>
          <ul className="text-app-text-muted text-sm space-y-1">
            <li>• Viết bài theo đề bài và nộp để được AI chấm điểm</li>
            <li>• Nhận sửa lỗi chi tiết cho ngữ pháp, từ vựng, chính tả</li>
            <li>• Xem lại lịch sử bài viết và các sửa lỗi</li>
            <li>• Cải thiện kỹ năng viết tiếng Hàn qua thực hành</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
