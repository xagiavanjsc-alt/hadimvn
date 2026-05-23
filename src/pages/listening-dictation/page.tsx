import { useState, useRef, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useXPSystem } from "@/hooks/useXPSystem";

interface DictationLesson {
  id: string;
  title: string;
  korean: string;
  vietnamese: string;
  romanization: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  audioUrl?: string;
  tips: string[];
  gapFill?: {
    sentence: string;
    blanks: number[];
    options: string[][];
  };
}

const DICTATION_LESSONS: DictationLesson[] = [
  {
    id: "d1",
    title: "Chào hỏi cơ bản",
    korean: "안녕하세요, 만나서 반가워요.",
    vietnamese: "Xin chào, rất vui được gặp bạn.",
    romanization: "an-nyeong-ha-se-yo, man-na-seo ban-ga-wo-yo",
    difficulty: "beginner",
    category: "Giao tiếp",
    tips: [
      "Nghe từng âm tiết một cách chậm rãi",
      "Chú ý liên âm: 만나서 → 만나서",
      "반가워요: '가' phát âm như 'ga'"
    ],
    gapFill: {
      sentence: "안녕하세요, 만나서 ____.",
      blanks: [0],
      options: [["반가워요", "감사합니다", "죄송합니다"]]
    }
  },
  {
    id: "d2",
    title: "Cảm ơn",
    korean: "도와주셔서 정말 감사합니다.",
    vietnamese: "Cảm ơn bạn đã giúp đỡ tôi rất nhiều.",
    romanization: "do-wa-ju-syeo-seo jeong-mal gam-sa-ham-ni-da",
    difficulty: "beginner",
    category: "Giao tiếp",
    tips: [
      "도와주셔서: chú ý âm '와' và '셔'",
      "정말: phát âm nhẹ nhàng",
      "감사합니다: '감' phát âm nhẹ"
    ],
    gapFill: {
      sentence: "도와주셔서 ____ 감사합니다.",
      blanks: [0],
      options: [["정말", "아주", "매우"]]
    }
  },
  {
    id: "d3",
    title: "Hỏi đường",
    korean: "실례지만, 지하철역이 어디예요?",
    vietnamese: "Xin lỗi, ga tàu điện ngầm ở đâu?",
    romanization: "sil-lye-ji-man, ji-ha-cheol-yeo-gi eo-di-ye-yo",
    difficulty: "beginner",
    category: "Du lịch",
    tips: [
      "실례지만: phát âm nhanh",
      "지하철역: chú ý âm 'ㄹ'",
      "어디예요: '어' phát âm như 'uh'"
    ],
    gapFill: {
      sentence: "실례지만, ____ 어디예요?",
      blanks: [0],
      options: [["지하철역", "버스정류장", "공항"]]
    }
  },
  {
    id: "d4",
    title: "Giới thiệu",
    korean: "저는 학생이고, 한국에서 왔어요.",
    vietnamese: "Tôi là sinh viên, đến từ Hàn Quốc.",
    romanization: "jeo-neun hak-saeng-i-go, han-gu-ge-seo wa-sseo-yo",
    difficulty: "intermediate",
    category: "Giới thiệu",
    tips: [
      "저는: '저' phát âm nhẹ",
      "학생이고: '생' phát âm nhẹ",
      "한국에서: '한' phát âm mạnh hơn"
    ],
    gapFill: {
      sentence: "저는 ____이고, 한국에서 왔어요.",
      blanks: [0],
      options: [["학생", "선생님", "의사"]]
    }
  },
  {
    id: "d5",
    title: "Sở thích",
    korean: "저는 주말에 영화 보는 걸 좋아해요.",
    vietnamese: "Tôi thích xem phim vào cuối tuần.",
    romanization: "jeo-neun ju-mal-e yeong-hwa bo-neun geol jo-a-hae-yo",
    difficulty: "intermediate",
    category: "Sở thích",
    tips: [
      "주말에: '말' phát âm nhẹ",
      "영화: '영' phát âm nhẹ",
      "좋아해요: '좋' phát âm mạnh"
    ],
    gapFill: {
      sentence: "저는 주말에 ____ 보는 걸 좋아해요.",
      blanks: [0],
      options: [["영화", "음악", "책"]]
    }
  },
  {
    id: "d6",
    title: "Mời đi ăn",
    korean: "저녁에 같이 저녁 먹을래요?",
    vietnamese: "Tối nay cùng ăn tối nhé?",
    romanization: "jeo-nyeok-e ga-chi jeo-nyeok meo-geul-rae-yo",
    difficulty: "intermediate",
    category: "Mời mọc",
    tips: [
      "저녁에: '녁' phát âm nhẹ",
      "같이: '같' phát âm mạnh",
      "먹을래요: '먹' phát âm mạnh"
    ],
    gapFill: {
      sentence: "저녁에 ____ 저녁 먹을래요?",
      blanks: [0],
      options: [["같이", "혼자", "함께"]]
    }
  },
  {
    id: "d7",
    title: "Công việc",
    korean: "프로젝트 기한이 내일까지라서 야근해야 할 것 같아요.",
    vietnamese: "Vì deadline dự án là ngày mai nên có lẽ phải làm thêm giờ.",
    romanization: "peu-ro-jeek-teu gi-han-i nae-il-kka-ji-ra-seo ya-geun-hae-ya hal geot ga-ta-yo",
    difficulty: "advanced",
    category: "Công việc",
    tips: [
      "프로젝트: chú ý âm '프' và '젝'",
      "기한: '한' phát âm như 'han'",
      "야근해야: '야' phát âm mạnh"
    ],
    gapFill: {
      sentence: "프로젝트 ____이 내일까지라서 야근해야 할 것 같아요.",
      blanks: [0],
      options: [["기한", "내용", "목표"]]
    }
  },
  {
    id: "d8",
    title: "Ý kiến",
    korean: "제 생각에는 이 방법이 더 효율적일 것 같아요.",
    vietnamese: "Theo tôi nghĩ, cách này có vẻ hiệu quả hơn.",
    romanization: "je saeng-gak-e-neun i bang-beop-i deo hyo-yul-jeok-il geot ga-ta-yo",
    difficulty: "advanced",
    category: "Công việc",
    tips: [
      "제 생각에는: phát âm tự nhiên",
      "이 방법: '법' phát âm nhẹ",
      "효율적일: '율' phát âm nhẹ"
    ],
    gapFill: {
      sentence: "제 생각에는 이 ____이 더 효율적일 것 같아요.",
      blanks: [0],
      options: [["방법", "계획", "아이디어"]]
    }
  },
  {
    id: "d9",
    title: "Báo cáo",
    korean: "현재까지 80% 정도 완료되었습니다.",
    vietnamese: "Đến nay đã hoàn thành khoảng 80%.",
    romanization: "hyeon-jae-kka-ji 80% jeong-do wan-ryo-doe-eot-seum-ni-da",
    difficulty: "advanced",
    category: "Công việc",
    tips: [
      "현재까지: '재' phát âm nhẹ",
      "완료되었습니다: '료' phát âm nhẹ",
      "정도: phát âm nhẹ nhàng"
    ],
    gapFill: {
      sentence: "현재까지 80% 정도 ____되었습니다.",
      blanks: [0],
      options: [["완료", "시작", "진행"]]
    }
  },
  {
    id: "d10",
    title: "Chúc mừng",
    korean: "축하드립니다! 프로젝트 성공했어요.",
    vietnamese: "Chúc mừng! Dự án đã thành công.",
    romanization: "chuk-ha-deu-rip-ni-da! peu-ro-jeek-teu seong-gong-ha-sseo-yo",
    difficulty: "advanced",
    category: "Công việc",
    tips: [
      "축하드립니다: '축' phát âm mạnh",
      "성공했어요: '공' phát âm mạnh",
      "프로젝트: chú ý âm '프'"
    ],
    gapFill: {
      sentence: "축하드립니다! 프로젝트 ____했어요.",
      blanks: [0],
      options: [["성공", "실패", "완료"]]
    }
  }
];

interface DictationResult {
  accuracy: number;
  correctWords: number;
  totalWords: number;
  mistakes: { word: string; userWord: string; correctWord: string }[];
  gapFillCorrect: boolean;
}

export default function ListeningDictationPage() {
  const { awardXP } = useXPSystem();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState<DictationResult | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [exerciseMode, setExerciseMode] = useState<"dictation" | "gapFill">("dictation");
  const [gapFillAnswers, setGapFillAnswers] = useState<string[]>([]);
  const [history, setHistory] = useState<{ lessonId: string; score: number; mode: string; date: string }[]>([]);
  const [xpAwarded, setXpAwarded] = useState<Set<string>>(new Set());

  const audioRef = useRef<HTMLAudioElement>(null);

  const currentLesson = DICTATION_LESSONS[currentIndex];
  const filteredLessons = selectedDifficulty === "all" 
    ? DICTATION_LESSONS 
    : DICTATION_LESSONS.filter(l => l.difficulty === selectedDifficulty);

  // Audio playback with speed control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handlePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);

  const checkDictation = useCallback(() => {
    if (!userInput.trim()) return;

    const targetWords = currentLesson.korean.split(" ").filter(w => w.length > 0);
    const userWords = userInput.split(" ").filter(w => w.length > 0);
    
    let correctCount = 0;
    const mistakes: { word: string; userWord: string; correctWord: string }[] = [];

    userWords.forEach((userWord, idx) => {
      const targetWord = targetWords[idx];
      if (targetWord && targetWord === userWord) {
        correctCount++;
      } else if (targetWord) {
        mistakes.push({
          word: targetWord,
          userWord,
          correctWord: targetWord
        });
      }
    });

    // Add missing words as mistakes
    if (userWords.length < targetWords.length) {
      for (let i = userWords.length; i < targetWords.length; i++) {
        mistakes.push({
          word: targetWords[i],
          userWord: "(missing)",
          correctWord: targetWords[i]
        });
      }
    }

    const accuracy = Math.round((correctCount / targetWords.length) * 100);

    setResult({
      accuracy,
      correctWords: correctCount,
      totalWords: targetWords.length,
      mistakes,
      gapFillCorrect: false
    });

    // Award XP
    const xpKey = `${currentLesson.id}-dictation-${new Date().toISOString().split("T")[0]}`;
    if (!xpAwarded.has(xpKey) && accuracy >= 50) {
      const baseXP = currentLesson.difficulty === "beginner" ? 10 : currentLesson.difficulty === "intermediate" ? 20 : 30;
      const bonusXP = accuracy >= 80 ? Math.round(baseXP * 0.5) : 0;
      const totalXP = baseXP + bonusXP;

      awardXP({
        type: "manual_bonus",
        amount: totalXP,
        meta: { reason: `Dictation: ${currentLesson.title} (Accuracy: ${accuracy}%)` }
      });

      setXpAwarded(prev => new Set([...prev, xpKey]));
    }

    // Save to history
    setHistory(prev => [...prev, { lessonId: currentLesson.id, score: accuracy, mode: "dictation", date: new Date().toISOString() }]);
  }, [userInput, currentLesson, awardXP, xpAwarded]);

  const checkGapFill = useCallback(() => {
    if (!currentLesson.gapFill) return;

    const correct = gapFillAnswers.every((answer, idx) => 
      answer === currentLesson.gapFill!.options[idx][0]
    );

    const accuracy = correct ? 100 : 0;

    setResult({
      accuracy,
      correctWords: correct ? currentLesson.gapFill.blanks.length : 0,
      totalWords: currentLesson.gapFill.blanks.length,
      mistakes: [],
      gapFillCorrect: correct
    });

    // Award XP
    const xpKey = `${currentLesson.id}-gapfill-${new Date().toISOString().split("T")[0]}`;
    if (!xpAwarded.has(xpKey) && correct) {
      const baseXP = currentLesson.difficulty === "beginner" ? 5 : currentLesson.difficulty === "intermediate" ? 10 : 15;

      awardXP({
        type: "manual_bonus",
        amount: baseXP,
        meta: { reason: `Gap-fill: ${currentLesson.title}` }
      });

      setXpAwarded(prev => new Set([...prev, xpKey]));
    }

    // Save to history
    setHistory(prev => [...prev, { lessonId: currentLesson.id, score: accuracy, mode: "gap-fill", date: new Date().toISOString() }]);
  }, [gapFillAnswers, currentLesson, awardXP, xpAwarded]);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredLessons.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput("");
      setResult(null);
      setShowAnswer(false);
      setGapFillAnswers(new Array(currentLesson.gapFill?.blanks.length || 0).fill(""));
    }
  }, [currentIndex, filteredLessons.length, currentLesson]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setUserInput("");
      setResult(null);
      setShowAnswer(false);
      setGapFillAnswers(new Array(currentLesson.gapFill?.blanks.length || 0).fill(""));
    }
  }, [currentIndex, currentLesson]);

  const handleReset = useCallback(() => {
    setUserInput("");
    setResult(null);
    setShowAnswer(false);
    setGapFillAnswers(new Array(currentLesson.gapFill?.blanks.length || 0).fill(""));
  }, [currentLesson]);

  const difficultyColors = {
    beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20"
  };

  return (
    <DashboardLayout title="Listening Dictation" subtitle="Luyện nghe chép chính tả">
      {/* Difficulty Filter */}
      <div className="flex items-center gap-2 mb-6">
        {(["all", "beginner", "intermediate", "advanced"] as const).map(diff => (
          <button
            key={diff}
            onClick={() => {
              setSelectedDifficulty(diff);
              setCurrentIndex(0);
              setUserInput("");
              setResult(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              selectedDifficulty === diff
                ? "bg-app-accent-primary text-app-bg"
                : "bg-app-card text-app-text-secondary hover:text-white"
            }`}
          >
            {diff === "all" ? "Tất cả" : diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>

      {/* Exercise Mode Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => {
            setExerciseMode("dictation");
            handleReset();
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            exerciseMode === "dictation"
              ? "bg-app-accent-primary text-app-bg"
              : "bg-app-card text-app-text-secondary hover:text-white"
          }`}
        >
          Chép chính tả
        </button>
        <button
          onClick={() => {
            setExerciseMode("gapFill");
            handleReset();
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            exerciseMode === "gapFill"
              ? "bg-app-accent-primary text-app-bg"
              : "bg-app-card text-app-text-secondary hover:text-white"
          }`}
        >
          Điền từ còn thiếu
        </button>
      </div>

      {/* Lesson Card */}
      <div className="bg-app-card border border-app-border rounded-2xl p-6 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${difficultyColors[currentLesson.difficulty]}`}>
              {currentLesson.difficulty.toUpperCase()}
            </span>
            <span className="text-app-text-secondary text-sm">{currentLesson.category}</span>
          </div>
          <span className="text-app-text-secondary text-sm">
            {currentIndex + 1} / {filteredLessons.length}
          </span>
        </div>

        {/* Vietnamese Translation */}
        <div className="mb-4">
          <p className="text-app-text-secondary text-lg">{currentLesson.vietnamese}</p>
        </div>

        {/* Audio Player */}
        <div className="bg-app-card2 rounded-xl p-4 mb-4">
          <audio ref={audioRef} src={currentLesson.audioUrl} />
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-app-accent-primary text-app-bg cursor-pointer hover:bg-app-accent-primary/80 transition-all"
            >
              {isPlaying ? <i className="ri-pause-line text-xl" /> : <i className="ri-play-line text-xl" />}
            </button>
            
            {/* Speed Control */}
            <div className="flex items-center gap-2">
              <span className="text-app-text-faint text-xs">Tốc độ:</span>
              {[0.5, 0.75, 1.0, 1.25, 1.5].map(speed => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-2 py-1 rounded text-xs cursor-pointer transition-all ${
                    playbackSpeed === speed
                      ? "bg-app-accent-primary text-app-bg"
                      : "bg-app-card text-app-text-secondary hover:text-white"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Exercise Area */}
        {exerciseMode === "dictation" ? (
          <div className="space-y-4">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Nghe và chép câu tiếng Hàn vào đây..."
              className="w-full h-32 bg-app-card2 border border-app-border rounded-xl p-4 text-white placeholder:text-app-text-faint focus:outline-none focus:border-app-accent-primary resize-none"
            />
            <div className="flex items-center gap-2">
              {!result ? (
                <button
                  onClick={checkDictation}
                  disabled={!userInput.trim()}
                  className="flex-1 py-3 rounded-xl bg-app-accent-primary text-app-bg font-bold cursor-pointer hover:bg-app-accent-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Kiểm tra
                </button>
              ) : (
                <>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 rounded-xl bg-app-card text-white font-bold cursor-pointer hover:bg-app-card2 transition-all"
                  >
                    Làm lại
                  </button>
                  <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="px-6 py-3 rounded-xl bg-app-card2 text-white font-bold cursor-pointer hover:bg-app-card transition-all"
                  >
                    {showAnswer ? "Ẩn đáp án" : "Xem đáp án"}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {currentLesson.gapFill && (
              <div className="bg-app-card2 rounded-xl p-4">
                <p className="text-white text-lg mb-4">
                  {currentLesson.gapFill.sentence.split(" ").map((word, idx) => {
                    if (currentLesson.gapFill!.blanks.includes(idx)) {
                      const blankIdx = currentLesson.gapFill!.blanks.indexOf(idx);
                      return (
                        <select
                          key={idx}
                          value={gapFillAnswers[blankIdx] || ""}
                          onChange={(e) => {
                            const newAnswers = [...gapFillAnswers];
                            newAnswers[blankIdx] = e.target.value;
                            setGapFillAnswers(newAnswers);
                          }}
                          className="mx-1 px-3 py-1 bg-app-card border border-app-border rounded text-white focus:outline-none focus:border-app-accent-primary"
                        >
                          <option value="">---</option>
                          {currentLesson.gapFill!.options[blankIdx].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      );
                    }
                    return <span key={idx} className="mx-1">{word}</span>;
                  })}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              {!result ? (
                <button
                  onClick={checkGapFill}
                  disabled={gapFillAnswers.some(a => !a)}
                  className="flex-1 py-3 rounded-xl bg-app-accent-primary text-app-bg font-bold cursor-pointer hover:bg-app-accent-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Kiểm tra
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-xl bg-app-card text-white font-bold cursor-pointer hover:bg-app-card2 transition-all"
                >
                  Làm lại
                </button>
              )}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`mt-4 rounded-xl p-4 ${result.accuracy >= 80 ? "bg-emerald-500/10 border border-emerald-500/20" : result.accuracy >= 50 ? "bg-amber-500/10 border border-amber-500/20" : "bg-rose-500/10 border border-rose-500/20"}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">Kết quả</h3>
              <span className={`text-2xl font-bold ${result.accuracy >= 80 ? "text-emerald-400" : result.accuracy >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                {result.accuracy}%
              </span>
            </div>
            
            <p className="text-app-text-secondary mb-3">
              {result.correctWords} / {result.totalWords} từ đúng
            </p>

            {exerciseMode === "dictation" && result.mistakes.length > 0 && (
              <div className="space-y-2">
                <p className="text-app-text-faint text-xs">Các từ sai:</p>
                {result.mistakes.map((mistake, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-app-card rounded-lg p-2">
                    <span className="text-rose-400">{mistake.userWord}</span>
                    <i className="ri-arrow-right-line text-app-text-faint" />
                    <span className="text-emerald-400">{mistake.correctWord}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Show Answer */}
        {showAnswer && (
          <div className="mt-4 bg-app-card2 rounded-xl p-4">
            <p className="text-app-text-faint text-xs mb-2">Đáp án đúng:</p>
            <p className="text-white text-lg font-bold">{currentLesson.korean}</p>
            <p className="text-app-text-secondary text-sm mt-1">{currentLesson.romanization}</p>
          </div>
        )}

        {/* Tips */}
        <div className="mt-4 bg-app-card2 rounded-xl p-4">
          <p className="text-app-text-faint text-xs mb-2">Tips:</p>
          {currentLesson.tips.map((tip, idx) => (
            <p key={idx} className="text-app-text-secondary text-sm">• {tip}</p>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-6 py-3 rounded-xl bg-app-card text-white font-bold cursor-pointer hover:bg-app-card2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <i className="ri-arrow-left-line" />
          Bài trước
        </button>
        
        <button
          onClick={handleNext}
          disabled={currentIndex === filteredLessons.length - 1}
          className="px-6 py-3 rounded-xl bg-app-accent-primary text-app-bg font-bold cursor-pointer hover:bg-app-accent-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Bài tiếp
          <i className="ri-arrow-right-line" />
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6 bg-app-card border border-app-border rounded-2xl p-4">
          <h3 className="font-bold text-white mb-3">Lịch sử luyện tập</h3>
          <div className="space-y-2">
            {history.slice(-5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-app-border last:border-0">
                <span className="text-app-text-secondary text-sm">
                  {DICTATION_LESSONS.find(l => l.id === item.lessonId)?.title} ({item.mode})
                </span>
                <span className={`font-bold ${item.score >= 80 ? "text-emerald-400" : item.score >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                  {item.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
