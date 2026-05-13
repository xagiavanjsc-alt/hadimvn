import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useXPSystem } from "@/hooks/useXPSystem";

interface ShadowingLesson {
  id: string;
  title: string;
  korean: string;
  vietnamese: string;
  romanization: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  audioUrl?: string;
  tips: string[];
  breakdown: { word: string; meaning: string; pronunciation: string }[];
}

const SHADOWING_LESSONS: ShadowingLesson[] = [
  {
    id: "s1",
    title: "Giao tiếp cơ bản",
    korean: "안녕하세요, 만나서 반가워요.",
    vietnamese: "Xin chào, rất vui được gặp bạn.",
    romanization: "an-nyeong-ha-se-yo, man-na-seo ban-ga-wo-yo",
    difficulty: "beginner",
    category: "Giao tiếp",
    tips: [
      "Phát âm nhẹ nhàng, không nhấn mạnh âm tiết nào",
      "Chú ý liên âm: 만나서 → 만나서 (n nhẹ)",
      "반가워요: '가' phát âm như 'ga' trong 'game'"
    ],
    breakdown: [
      { word: "안녕하세요", meaning: "Xin chào", pronunciation: "an-nyeong-ha-se-yo" },
      { word: "만나서", meaning: "gặp nhau", pronunciation: "man-na-seo" },
      { word: "반가워요", meaning: "vui được gặp", pronunciation: "ban-ga-wo-yo" }
    ]
  },
  {
    id: "s2",
    title: "Hỏi đường",
    korean: "실례지만, 지하철역이 어디예요?",
    vietnamese: "Xin lỗi, ga tàu điện ngầm ở đâu?",
    romanization: "sil-lye-ji-man, ji-ha-cheol-yeo-gi eo-di-ye-yo",
    difficulty: "beginner",
    category: "Du lịch",
    tips: [
      "실례지만: phát âm nhanh, '실' ngắn",
      "지하철역: chú ý âm 'ㄹ' trong '지' và '철'",
      "어디예요: '어' phát âm như 'uh' ngắn"
    ],
    breakdown: [
      { word: "실례지만", meaning: "Xin lỗi nhưng", pronunciation: "sil-lye-ji-man" },
      { word: "지하철역", meaning: "ga tàu điện ngầm", pronunciation: "ji-ha-cheol-yeok" },
      { word: "어디예요", meaning: "ở đâu", pronunciation: "eo-di-ye-yo" }
    ]
  },
  {
    id: "s3",
    title: "Cảm ơn",
    korean: "도와주셔서 정말 감사합니다.",
    vietnamese: "Cảm ơn bạn đã giúp đỡ tôi rất nhiều.",
    romanization: "do-wa-ju-syeo-seo jeong-mal gam-sa-ham-ni-da",
    difficulty: "beginner",
    category: "Giao tiếp",
    tips: [
      "도와주셔서: chú ý liên âm '와' và '셔'",
      "정말: phát âm nhẹ nhàng",
      "감사합니다: '감' phát âm nhẹ, '사' nhấn nhẹ"
    ],
    breakdown: [
      { word: "도와주셔서", meaning: "đã giúp đỡ", pronunciation: "do-wa-ju-syeo-seo" },
      { word: "정말", meaning: "thực sự", pronunciation: "jeong-mal" },
      { word: "감사합니다", meaning: "cảm ơn", pronunciation: "gam-sa-ham-ni-da" }
    ]
  },
  {
    id: "s4",
    title: "Giới thiệu bản thân",
    korean: "저는 학생이고, 한국에서 왔어요.",
    vietnamese: "Tôi là sinh viên, đến từ Hàn Quốc.",
    romanization: "jeo-neun hak-saeng-i-go, han-gu-ge-seo wa-sseo-yo",
    difficulty: "beginner",
    category: "Giới thiệu",
    tips: [
      "저는: '저' phát âm nhẹ",
      "학생이고: '생' phát âm nhẹ",
      "한국에서: '한' phát âm mạnh hơn '국'"
    ],
    breakdown: [
      { word: "저는", meaning: "tôi", pronunciation: "jeo-neun" },
      { word: "학생이고", meaning: "là sinh viên", pronunciation: "hak-saeng-i-go" },
      { word: "한국에서", meaning: "từ Hàn Quốc", pronunciation: "han-gu-ge-seo" },
      { word: "왔어요", meaning: "đến", pronunciation: "wa-sseo-yo" }
    ]
  },
  {
    id: "s5",
    title: "Hẹn gặp lại",
    korean: "내일 뵙겠습니다. 안녕히 가세요.",
    vietnamese: "Hẹn gặp lại ngày mai. Tạm biệt.",
    romanization: "nae-il boep-get-seum-ni-da. an-nyeong-hi ga-se-yo",
    difficulty: "beginner",
    category: "Giao tiếp",
    tips: [
      "내일: '내' phát âm như 'nae'",
      "뵙겠습니다: '뵙' phát âm mạnh",
      "안녕히 가세요: phát âm nhẹ nhàng"
    ],
    breakdown: [
      { word: "내일", meaning: "ngày mai", pronunciation: "nae-il" },
      { word: "뵙겠습니다", meaning: "sẽ gặp", pronunciation: "boep-get-seum-ni-da" },
      { word: "안녕히 가세요", meaning: "tạm biệt", pronunciation: "an-nyeong-hi ga-se-yo" }
    ]
  },
  {
    id: "s6",
    title: "Đặt món ăn",
    korean: "이거 주문할게요. 매운 안 주세요.",
    vietnamese: "Tôi muốn đặt món này. Không cay nhé.",
    romanization: "i-geo ju-mun-hal-ge-yo. mae-un an ju-se-yo",
    difficulty: "intermediate",
    category: "Ẩm thực",
    tips: [
      "이거: phát âm nhanh như 'i-guh'",
      "주문할게요: chú ý âm 'ㅁ' cuối '문'",
      "매운 안: '안' phát âm nhẹ, không nhấn"
    ],
    breakdown: [
      { word: "이거", meaning: "cái này", pronunciation: "i-geo" },
      { word: "주문할게요", meaning: "sẽ đặt món", pronunciation: "ju-mun-hal-ge-yo" },
      { word: "매운 안", meaning: "không cay", pronunciation: "mae-un an" }
    ]
  },
  {
    id: "s7",
    title: "Kể về sở thích",
    korean: "저는 주말에 영화 보는 걸 좋아해요.",
    vietnamese: "Tôi thích xem phim vào cuối tuần.",
    romanization: "jeo-neun ju-mal-e yeong-hwa bo-neun geol jo-a-hae-yo",
    difficulty: "intermediate",
    category: "Sở thích",
    tips: [
      "주말에: '말' phát âm nhẹ",
      "영화: '영' phát âm nhẹ, '화' mạnh hơn",
      "좋아해요: '좋' phát âm mạnh"
    ],
    breakdown: [
      { word: "저는", meaning: "tôi", pronunciation: "jeo-neun" },
      { word: "주말에", meaning: "vào cuối tuần", pronunciation: "ju-mal-e" },
      { word: "영화 보는", meaning: "xem phim", pronunciation: "yeong-hwa bo-neun" },
      { word: "걸 좋아해요", meaning: "thích", pronunciation: "geol jo-a-hae-yo" }
    ]
  },
  {
    id: "s8",
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
    breakdown: [
      { word: "저녁에", meaning: "tối nay", pronunciation: "jeo-nyeok-e" },
      { word: "같이", meaning: "cùng nhau", pronunciation: "ga-chi" },
      { word: "저녁", meaning: "bữa tối", pronunciation: "jeo-nyeok" },
      { word: "먹을래요", meaning: "ăn nhé", pronunciation: "meo-geul-rae-yo" }
    ]
  },
  {
    id: "s9",
    title: "Đồng ý",
    korean: "그래요, 좋은 생각이에요.",
    vietnamese: "Được rồi, đó là ý tưởng hay.",
    romanization: "geu-rae-yo, jo-eun saeng-gak-i-e-yo",
    difficulty: "intermediate",
    category: "Giao tiếp",
    tips: [
      "그래요: phát âm tự nhiên",
      "좋은: '좋' phát âm mạnh",
      "생각이에요: '각' phát âm nhẹ"
    ],
    breakdown: [
      { word: "그래요", meaning: "được rồi", pronunciation: "geu-rae-yo" },
      { word: "좋은", meaning: "tốt", pronunciation: "jo-eun" },
      { word: "생각이에요", meaning: "ý tưởng", pronunciation: "saeng-gak-i-e-yo" }
    ]
  },
  {
    id: "s10",
    title: "Kể về bản thân",
    korean: "저는 한국어를 배운 지 6개월 됐어요.",
    vietnamese: "Tôi đã học tiếng Hàn được 6 tháng rồi.",
    romanization: "jeo-neun han-gu-geo-reul bae-un ji 6-gae-wal dwa-sseo-yo",
    difficulty: "intermediate",
    category: "Giới thiệu",
    tips: [
      "저는: '저' phát âm nhẹ, '는' trợ từ chủ ngữ",
      "한국어를: '를' sau nguyên âm, phát âm nhẹ",
      "6개월: '개월' phát âm như 'gae-wol'"
    ],
    breakdown: [
      { word: "저는", meaning: "tôi", pronunciation: "jeo-neun" },
      { word: "한국어를", meaning: "tiếng Hàn", pronunciation: "han-gu-geo-reul" },
      { word: "배운 지", meaning: "đã học", pronunciation: "bae-un ji" },
      { word: "6개월 됐어요", meaning: "6 tháng rồi", pronunciation: "yeoseot-gae-wal dwa-sseo-yo" }
    ]
  },
  {
    id: "s11",
    title: "Thảo luận công việc",
    korean: "프로젝트 기한이 내일까지라서 야근해야 할 것 같아요.",
    vietnamese: "Vì deadline dự án là ngày mai nên có lẽ phải làm thêm giờ.",
    romanization: "peu-ro-jeek-teu gi-han-i nae-il-kka-ji-ra-seo ya-geun-hae-ya hal geot ga-ta-yo",
    difficulty: "advanced",
    category: "Công việc",
    tips: [
      "프로젝트: chú ý âm '프' và '젝'",
      "기한: '한' phát âm như 'han'",
      "야근해야: '야' phát âm mạnh, '근' nhẹ"
    ],
    breakdown: [
      { word: "프로젝트", meaning: "dự án", pronunciation: "peu-ro-jeek-teu" },
      { word: "기한", meaning: "deadline", pronunciation: "gi-han" },
      { word: "내일까지", meaning: "đến ngày mai", pronunciation: "nae-il-kka-ji" },
      { word: "야근해야", meaning: "phải làm thêm giờ", pronunciation: "ya-geun-hae-ya" }
    ]
  },
  {
    id: "s12",
    title: "Đưa ra ý kiến",
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
    breakdown: [
      { word: "제 생각에는", meaning: "theo tôi nghĩ", pronunciation: "je saeng-gak-e-neun" },
      { word: "이 방법", meaning: "cách này", pronunciation: "i bang-beop" },
      { word: "더 효율적일", meaning: "hiệu quả hơn", pronunciation: "deo hyo-yul-jeok-il" },
      { word: "것 같아요", meaning: "có vẻ", pronunciation: "geot ga-ta-yo" }
    ]
  },
  {
    id: "s13",
    title: "Thảo luận kế hoạch",
    korean: "다음 주 회의 때 이 문제를 논의하도록 하죠.",
    vietnamese: "Hãy thảo luận vấn đề này trong cuộc họp tuần sau.",
    romanization: "da-eum ju hoe-ui ttae i mun-je-reul non-ui-ha-do-rok ha-jo",
    difficulty: "advanced",
    category: "Công việc",
    tips: [
      "다음 주: '음' phát âm nhẹ",
      "회의 때: '의' phát âm nhẹ",
      "논의하도록: '의' phát âm nhẹ"
    ],
    breakdown: [
      { word: "다음 주", meaning: "tuần sau", pronunciation: "da-eum ju" },
      { word: "회의 때", meaning: "trong cuộc họp", pronunciation: "hoe-ui ttae" },
      { word: "이 문제를", meaning: "vấn đề này", pronunciation: "i mun-je-reul" },
      { word: "논의하도록", meaning: "thảo luận", pronunciation: "non-ui-ha-do-rok" }
    ]
  },
  {
    id: "s14",
    title: "Báo cáo tiến độ",
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
    breakdown: [
      { word: "현재까지", meaning: "đến nay", pronunciation: "hyeon-jae-kka-ji" },
      { word: "80%", meaning: "tám mươi phần trăm", pronunciation: "pal-sib-peo-senteu" },
      { word: "정도", meaning: "khoảng", pronunciation: "jeong-do" },
      { word: "완료되었습니다", meaning: "đã hoàn thành", pronunciation: "wan-ryo-doe-eot-seum-ni-da" }
    ]
  },
  {
    id: "s15",
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
    breakdown: [
      { word: "축하드립니다", meaning: "chúc mừng", pronunciation: "chuk-ha-deu-rip-ni-da" },
      { word: "프로젝트", meaning: "dự án", pronunciation: "peu-ro-jeek-teu" },
      { word: "성공했어요", meaning: "thành công", pronunciation: "seong-gong-ha-sseo-yo" }
    ]
  }
];

interface ShadowingResult {
  score: number;
  transcript: string;
  feedback: {
    accuracy: number;
    rhythm: number;
    intonation: number;
  };
  suggestions: string[];
}

export default function ShadowingPracticePage() {
  const navigate = useNavigate();
  const { awardXP } = useXPSystem();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [result, setResult] = useState<ShadowingResult | null>(null);
  const [history, setHistory] = useState<{ lessonId: string; score: number; date: string }[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<Set<string>>(new Set());

  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<any>(null);

  const currentLesson = SHADOWING_LESSONS[currentIndex];
  const filteredLessons = selectedDifficulty === "all" 
    ? SHADOWING_LESSONS 
    : SHADOWING_LESSONS.filter(l => l.difficulty === selectedDifficulty);

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

  // Recording with Web Speech API
  const startRecording = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "ko-KR";
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      setResult(null);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsAnalyzing(true);
      
      // Simulate analysis (replace with actual AI analysis)
      setTimeout(() => {
        const accuracy = calculateAccuracy(currentLesson.korean, transcript);
        setResult({
          score: accuracy,
          transcript,
          feedback: {
            accuracy: accuracy,
            rhythm: Math.min(100, accuracy + Math.random() * 10),
            intonation: Math.min(100, accuracy + Math.random() * 5)
          },
          suggestions: generateSuggestions(currentLesson, transcript)
        });
        setIsAnalyzing(false);
        setIsRecording(false);
        
        // Save to history
        setHistory(prev => [...prev, { lessonId: currentLesson.id, score: accuracy, date: new Date().toISOString() }]);
        
        // Award XP based on score (only once per lesson per session)
        const xpKey = `${currentLesson.id}-${new Date().toISOString().split("T")[0]}`;
        if (!xpAwarded.has(xpKey) && accuracy >= 50) {
          const baseXP = currentLesson.difficulty === "beginner" ? 10 : currentLesson.difficulty === "intermediate" ? 20 : 30;
          const bonusXP = accuracy >= 80 ? Math.round(baseXP * 0.5) : 0;
          const totalXP = baseXP + bonusXP;
          
          awardXP({
            type: "manual_bonus",
            amount: totalXP,
            meta: { reason: `Shadowing: ${currentLesson.title} (Score: ${accuracy}%)` }
          });
          
          setXpAwarded(prev => new Set([...prev, xpKey]));
        }
      }, 1500);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      setIsAnalyzing(false);
    };

    recognitionRef.current.onend = () => {
      if (isRecording) {
        setIsRecording(false);
      }
    };

    recognitionRef.current.start();
  }, [currentLesson, isRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const calculateAccuracy = (target: string, spoken: string): number => {
    const targetWords = target.split(" ").filter(w => w.length > 0);
    const spokenWords = spoken.split(" ").filter(w => w.length > 0);
    
    if (spokenWords.length === 0) return 0;
    
    let matches = 0;
    spokenWords.forEach(spokenWord => {
      if (targetWords.some(targetWord => targetWord.includes(spokenWord) || spokenWord.includes(targetWord))) {
        matches++;
      }
    });
    
    return Math.round((matches / Math.max(targetWords.length, spokenWords.length)) * 100);
  };

  const generateSuggestions = (lesson: ShadowingLesson, transcript: string): string[] => {
    const suggestions: string[] = [];
    
    if (transcript.length < lesson.korean.length * 0.5) {
      suggestions.push("Bạn nói quá ngắn, hãy nói đầy đủ câu");
    }
    
    lesson.tips.forEach(tip => {
      suggestions.push(`Tip: ${tip}`);
    });
    
    return suggestions;
  };

  const handleNext = useCallback(() => {
    if (currentIndex < filteredLessons.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setResult(null);
      setShowBreakdown(false);
    }
  }, [currentIndex, filteredLessons.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setResult(null);
      setShowBreakdown(false);
    }
  }, [currentIndex]);

  const difficultyColors = {
    beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20"
  };

  return (
    <DashboardLayout title="Shadowing Practice" subtitle="Luyện phát âm qua nhại lại giọng nói">
      {/* Difficulty Filter */}
      <div className="flex items-center gap-2 mb-6">
        {(["all", "beginner", "intermediate", "advanced"] as const).map(diff => (
          <button
            key={diff}
            onClick={() => {
              setSelectedDifficulty(diff);
              setCurrentIndex(0);
              setResult(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              selectedDifficulty === diff
                ? "bg-app-accent-primary text-white"
                : "bg-app-card text-app-text-secondary hover:text-white"
            }`}
          >
            {diff === "all" ? "Tất cả" : diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
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

        {/* Korean Text */}
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-white mb-2">{currentLesson.korean}</h2>
          <p className="text-app-text-secondary text-lg">{currentLesson.vietnamese}</p>
          <p className="text-app-text-faint text-sm mt-1">{currentLesson.romanization}</p>
        </div>

        {/* Audio Player */}
        <div className="bg-app-card2 rounded-xl p-4 mb-4">
          <audio ref={audioRef} src={currentLesson.audioUrl} />
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-app-accent-primary text-white cursor-pointer hover:bg-app-accent-primary/80 transition-all"
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
                      ? "bg-app-accent-primary text-white"
                      : "bg-app-card text-app-text-secondary hover:text-white"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recording Section */}
        <div className="flex items-center gap-4">
          {!isRecording && !isAnalyzing && (
            <button
              onClick={startRecording}
              className="flex-1 py-3 rounded-xl bg-app-accent-primary text-white font-bold cursor-pointer hover:bg-app-accent-primary/80 transition-all flex items-center justify-center gap-2"
            >
              <i className="ri-mic-line" />
              Bắt đầu ghi âm
            </button>
          )}
          
          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold cursor-pointer hover:bg-rose-400 transition-all flex items-center justify-center gap-2 animate-pulse"
            >
              <i className="ri-stop-circle-line" />
              Đang ghi âm... (Nhấn để dừng)
            </button>
          )}
          
          {isAnalyzing && (
            <div className="flex-1 py-3 rounded-xl bg-app-card2 text-app-text-secondary flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-app-accent-primary/30 border-t-app-accent-primary rounded-full animate-spin" />
              Đang phân tích...
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-emerald-400">Kết quả phân tích</h3>
              <span className="text-2xl font-bold text-emerald-400">{result.score}%</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center">
                <p className="text-app-text-faint text-xs">Độ chính xác</p>
                <p className="font-bold text-white">{Math.round(result.feedback.accuracy)}%</p>
              </div>
              <div className="text-center">
                <p className="text-app-text-faint text-xs">Nhịp điệu</p>
                <p className="font-bold text-white">{Math.round(result.feedback.rhythm)}%</p>
              </div>
              <div className="text-center">
                <p className="text-app-text-faint text-xs">Ngữ điệu</p>
                <p className="font-bold text-white">{Math.round(result.feedback.intonation)}%</p>
              </div>
            </div>

            <div className="bg-app-card rounded-lg p-3 mb-3">
              <p className="text-app-text-faint text-xs mb-1">Bạn nói:</p>
              <p className="text-white">{result.transcript}</p>
            </div>

            {result.suggestions.length > 0 && (
              <div className="space-y-1">
                <p className="text-app-text-faint text-xs">Gợi ý cải thiện:</p>
                {result.suggestions.map((suggestion, idx) => (
                  <p key={idx} className="text-app-text-secondary text-sm">• {suggestion}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tips Toggle */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="mt-4 text-app-text-faint text-sm hover:text-white transition-colors cursor-pointer flex items-center gap-2"
        >
          <i className={`ri-arrow-${showBreakdown ? "up" : "down"}-s-line`} />
          {showBreakdown ? "Ẩn phân tích từ" : "Xem phân tích từ"}
        </button>

        {showBreakdown && (
          <div className="mt-3 bg-app-card2 rounded-xl p-4">
            {currentLesson.breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 py-2 border-b border-app-border last:border-0">
                <div className="flex-1">
                  <p className="font-bold text-white">{item.word}</p>
                  <p className="text-app-text-secondary text-sm">{item.meaning}</p>
                </div>
                <p className="text-app-text-faint text-sm">{item.pronunciation}</p>
              </div>
            ))}
          </div>
        )}
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
          className="px-6 py-3 rounded-xl bg-app-accent-primary text-white font-bold cursor-pointer hover:bg-app-accent-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                  {SHADOWING_LESSONS.find(l => l.id === item.lessonId)?.title}
                </span>
                <span className={`font-bold ${item.score >= 80 ? "text-emerald-400" : item.score >= 60 ? "text-amber-400" : "text-rose-400"}`}>
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
