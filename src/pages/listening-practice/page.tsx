import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5] as const;

interface ListeningItem {
  id: string;
  korean: string;
  vietnamese: string;
  audioUrl: string;
  difficulty: "easy" | "medium" | "hard";
}

const MOCK_LISTENING_ITEMS: ListeningItem[] = [
  {
    id: "1",
    korean: "안녕하세요, 만나서 반갑습니다.",
    vietnamese: "Xin chào, rất vui được gặp bạn.",
    audioUrl: "https://example.com/audio1.mp3",
    difficulty: "easy",
  },
  {
    id: "2",
    korean: "오늘 날씨가 정말 좋네요.",
    vietnamese: "Hôm nay thời tiết thật đẹp.",
    audioUrl: "https://example.com/audio2.mp3",
    difficulty: "easy",
  },
  {
    id: "3",
    korean: "한국어를 공부하기 시작한 지 얼마나 되셨나요?",
    vietnamese: "Bạn đã học tiếng Hàn được bao lâu rồi?",
    audioUrl: "https://example.com/audio3.mp3",
    difficulty: "medium",
  },
];

export default function ListeningPracticePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEED_OPTIONS)[number]>(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentItem = MOCK_LISTENING_ITEMS[currentIndex];

  usePageSEO({
    title: "Luyện nghe tiếng Hàn với tốc độ điều chỉnh | Hàn Quốc Ơi!",
    description: "Luyện nghe tiếng Hàn với khả năng điều chỉnh tốc độ phát âm. Tăng cường kỹ năng nghe hiểu với các bài tập từ dễ đến khó.",
    keywords: "luyện nghe tiếng Hàn, listening practice, tốc độ âm thanh, Korean listening",
    path: "/listening-practice",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: "Luyện nghe tiếng Hàn với tốc độ điều chỉnh",
      description: "Korean listening practice with speed control",
      educationalLevel: "All Levels",
      learningResourceType: "Audio Exercise",
      inLanguage: ["vi", "ko"],
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    if (currentIndex < MOCK_LISTENING_ITEMS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowTranslation(false);
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowTranslation(false);
      setIsPlaying(false);
    }
  };

  const handleSpeedChange = (newSpeed: (typeof SPEED_OPTIONS)[number]) => {
    setSpeed(newSpeed);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "#34d399";
      case "medium": return "#e8c84a";
      case "hard": return "#f87171";
      default: return "#94a3b8";
    }
  };

  return (
    <DashboardLayout title="Luyện nghe" subtitle={`${currentIndex + 1}/${MOCK_LISTENING_ITEMS.length} bài tập`}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Speed Control */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <p className="text-white/50 text-sm font-semibold mb-3">Tốc độ phát âm</p>
          <div className="flex gap-2">
            {SPEED_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
                  speed === s
                    ? "bg-app-accent-primary text-app-bg"
                    : "bg-app-surface/50 text-app-text-muted hover:bg-app-card/70"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Audio Player */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                backgroundColor: `${getDifficultyColor(currentItem.difficulty)}15`,
                color: getDifficultyColor(currentItem.difficulty),
              }}
            >
              {currentItem.difficulty.toUpperCase()}
            </span>
            <span className="text-app-text-muted text-xs">Bài {currentIndex + 1}</span>
          </div>

          {/* Korean Text */}
          <div className="mb-6">
            <p className="text-white text-2xl font-bold mb-2">{currentItem.korean}</p>
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="text-app-accent-primary text-sm hover:text-[#d4b43a] cursor-pointer"
            >
              {showTranslation ? "Ẩn dịch" : "Hiện dịch"}
            </button>
          </div>

          {/* Translation */}
          {showTranslation && (
            <div className="mb-6 p-4 rounded-xl bg-app-surface/50 border border-app-border">
              <p className="text-app-text-muted">{currentItem.vietnamese}</p>
            </div>
          )}

          {/* Audio Element */}
          <audio
            ref={audioRef}
            src={currentItem.audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-app-surface/50 border border-app-border text-app-text-muted cursor-pointer hover:bg-app-card/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <i className="ri-skip-back-fill text-xl" />
            </button>

            <button
              onClick={handlePlayPause}
              className="w-16 h-16 flex items-center justify-center rounded-2xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg cursor-pointer transition-colors"
            >
              <i className={`${isPlaying ? "ri-pause-fill" : "ri-play-fill"} text-2xl`} />
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === MOCK_LISTENING_ITEMS.length - 1}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-app-surface/50 border border-app-border text-app-text-muted cursor-pointer hover:bg-app-card/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <i className="ri-skip-forward-fill text-xl" />
            </button>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-app-text-muted text-xs">Tiến độ</span>
              <span className="text-app-text-muted text-xs">{Math.round(((currentIndex + 1) / MOCK_LISTENING_ITEMS.length) * 100)}%</span>
            </div>
            <div className="bg-app-card/50 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${((currentIndex + 1) / MOCK_LISTENING_ITEMS.length) * 100}%`,
                  backgroundColor: "#38bdf8",
                }}
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <p className="text-white/50 text-sm font-semibold mb-3">Hướng dẫn</p>
          <ul className="space-y-2 text-app-text-muted text-xs">
            <li className="flex items-start gap-2">
              <i className="ri-checkbox-circle-fill text-app-accent-primary mt-0.5" />
              <span>Chọn tốc độ phát âm phù hợp với trình độ của bạn</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="ri-checkbox-circle-fill text-app-accent-primary mt-0.5" />
              <span>Nghe câu tiếng Hàn và thử hiểu nghĩa</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="ri-checkbox-circle-fill text-app-accent-primary mt-0.5" />
              <span>Click "Hiện dịch" để kiểm tra kết quả</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="ri-checkbox-circle-fill text-app-accent-primary mt-0.5" />
              <span>Tăng tốc độ dần dần để cải thiện kỹ năng nghe</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
