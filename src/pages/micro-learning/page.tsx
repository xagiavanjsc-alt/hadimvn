import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useMicroLearning } from "@/hooks/useMicroLearning";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

export default function MicroLearningPage() {
  const { user } = useAuth();
  const {
    session,
    timeLeft,
    isPaused,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    answerQuestion,
    skipQuestion,
    formatTime,
    getProgress,
  } = useMicroLearning();
  const [selectedType, setSelectedType] = useState<"vocabulary" | "grammar" | "listening" | "reading" | null>(null);

  usePageSEO({
    title: "Micro-learning | Hàn Quốc Ơi!",
    description: "Học nhanh 5 phút với micro-learning. Ôn tập từ vựng, ngữ pháp, nghe, đọc trong thời gian ngắn.",
    keywords: "micro-learning, học nhanh, 5 phút, quick review",
    path: "/micro-learning",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Micro-learning",
      description: "Quick 5-minute learning sessions",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const handleStart = (type: "vocabulary" | "grammar" | "listening" | "reading") => {
    setSelectedType(type);
    startSession(type, 300); // 5 minutes
  };

  const handleAnswer = (correct: boolean) => {
    answerQuestion(correct);
  };

  const handleSkip = () => {
    skipQuestion();
  };

  const handleEnd = () => {
    endSession();
    setSelectedType(null);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "vocabulary": return "Từ vựng";
      case "grammar": return "Ngữ pháp";
      case "listening": return "Nghe";
      case "reading": return "Đọc";
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "vocabulary": return "ri-translate-2";
      case "grammar": return "ri-book-2-line";
      case "listening": return "ri-headphone-line";
      case "reading": return "ri-book-open-line";
      default: return "ri-question-line";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "vocabulary": return "#fbbf24";
      case "grammar": return "#f87171";
      case "listening": return "#60a5fa";
      case "reading": return "#4ade80";
      default: return "#94a3b8";
    }
  };

  return (
    <DashboardLayout title="Micro-learning" subtitle="Học nhanh 5 phút">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Session Selection */}
        {!session && (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">Chọn loại bài tập</h2>
            <div className="grid grid-cols-2 gap-4">
              {(["vocabulary", "grammar", "listening", "reading"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleStart(type)}
                  className="p-6 rounded-xl border-2 border-app-border hover:border-app-accent-primary/50 cursor-pointer transition-colors bg-app-surface/30"
                >
                  <div className="text-4xl mb-3">
                    <i className={`${getTypeIcon(type)}`} style={{ color: getTypeColor(type) }} />
                  </div>
                  <h3 className="text-white font-semibold mb-1">{getTypeLabel(type)}</h3>
                  <p className="text-app-text-muted text-xs">10 câu • 5 phút</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Session */}
        {session && (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${getTypeColor(session.type)}15` }}
                >
                  <i
                    className={`${getTypeIcon(session.type)} text-xl`}
                    style={{ color: getTypeColor(session.type) }}
                  />
                </div>
                <div>
                  <h2 className="text-white font-semibold">{getTypeLabel(session.type)}</h2>
                  <p className="text-app-text-muted text-xs">
                    Câu {session.currentIndex + 1}/{session.items.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-white font-bold text-lg">{formatTime(timeLeft)}</p>
                  <p className="text-app-text-muted text-xs">Thời gian</p>
                </div>
                {isPaused ? (
                  <button
                    onClick={resumeSession}
                    className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center cursor-pointer"
                  >
                    <i className="ri-play-line" />
                  </button>
                ) : (
                  <button
                    onClick={pauseSession}
                    className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center cursor-pointer"
                  >
                    <i className="ri-pause-line" />
                  </button>
                )}
                <button
                  onClick={handleEnd}
                  className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center cursor-pointer"
                >
                  <i className="ri-close-line" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-app-surface/50 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-app-accent-primary transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              />
            </div>

            {/* Question */}
            {!session.completed ? (
              <div className="space-y-4">
                <div className="bg-app-surface/30 rounded-xl p-6">
                  <p className="text-white text-lg mb-4">
                    {session.items[session.currentIndex]?.question}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="flex-1 py-3 rounded-xl bg-rose-500/20 text-rose-400 font-bold cursor-pointer hover:bg-rose-500/30 transition-colors"
                    >
                      Sai
                    </button>
                    <button
                      onClick={() => handleAnswer(true)}
                      className="flex-1 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold cursor-pointer hover:bg-emerald-500/30 transition-colors"
                    >
                      Đúng
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSkip}
                  className="w-full py-3 rounded-xl border border-app-border text-app-text-muted font-bold text-sm cursor-pointer hover:bg-app-surface/50 transition-colors"
                >
                  Bỏ qua
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-white text-xl font-bold mb-2">Hoàn thành!</h3>
                <p className="text-app-text-muted mb-4">
                  Bạn đã trả lời đúng {session.score}/{session.items.length} câu
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleStart(session.type)}
                    className="px-6 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold cursor-pointer transition-colors"
                  >
                    Làm lại
                  </button>
                  <button
                    onClick={handleEnd}
                    className="px-6 py-3 rounded-xl border border-app-border text-white font-bold cursor-pointer hover:bg-app-surface/50 transition-colors"
                  >
                    Kết thúc
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <i className="ri-information-line text-app-accent-primary" />
            Thông tin
          </h3>
          <ul className="text-app-text-muted text-sm space-y-1">
            <li>• Mỗi session kéo dài 5 phút với 10 câu hỏi</li>
            <li>• Học nhanh khi rảnh, không cần thời gian dài</li>
            <li>• Có thể tạm dừng và tiếp tục sau</li>
            <li>• Phù hợp để ôn tập nhanh giữa các buổi học</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
