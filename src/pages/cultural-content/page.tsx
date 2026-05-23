import { useState, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useXPSystem } from "@/hooks/useXPSystem";

interface CulturalLesson {
  id: string;
  title: string;
  category: "festivals" | "etiquette" | "slang" | "scenarios" | "customs";
  korean: string;
  vietnamese: string;
  description: string;
  examples: { korean: string; vietnamese: string; context: string }[];
  tips: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  imageUrl?: string;
}

const CULTURAL_LESSONS: CulturalLesson[] = [
  {
    id: "c1",
    title: "Seollal (Tết Nguyên Đán)",
    category: "festivals",
    korean: "설날",
    vietnamese: "Tết Nguyên Đán",
    description: "Seollal là lễ tết quan trọng nhất của Hàn Quốc, diễn ra vào ngày đầu tiên của âm lịch. Gia đình tụ họp, ăn tteokguk (bánh gạo) và mặc hanbok.",
    examples: [
      { korean: "새해 복 많이 받으세요", vietnamese: "Chúc năm mới nhiều phúc", context: "Lời chúc năm mới" },
      { korean: "떡국을 먹어야 한 살을 먹는다", vietnamese: "Phải ăn bánh gạo mới được tính thêm một tuổi", context: "Tục lệ ăn tteokguk" }
    ],
    tips: [
      "Trẻ em cúi chào người lớn để nhận tiền lì xì (saebae don)",
      "Mặc hanbok truyền thống",
      "Chơi yut nori (trò chơi ném gỗ)"
    ],
    difficulty: "beginner"
  },
  {
    id: "c2",
    title: "Chuseok (Tết Trung Thu)",
    category: "festivals",
    korean: "추석",
    vietnamese: "Tết Trung Thu",
    description: "Chuseok là lễ tết thu hoạch, diễn ra vào ngày 15 tháng 8 âm lịch. Gia đình về quê, làm songpyeon (bánh giày) và cúng tổ tiên.",
    examples: [
      { korean: "가족들과 함께 성묘를 간다", vietnamese: "Đi viếng mộ cùng gia đình", context: "Tục lệ Chuseok" },
      { korean: "송편을 만들어 먹는다", vietnamese: "Làm và ăn bánh giày", context: "Món ăn truyền thống" }
    ],
    tips: [
      "Tổ chức lễ hội Ganggangsullae (nhảy vòng tròn)",
      "Xem trăng tròn",
      "Chia sẻ songpyeon với hàng xóm"
    ],
    difficulty: "beginner"
  },
  {
    id: "c3",
    title: "Chào hỏi (Jeol)",
    category: "etiquette",
    korean: "절",
    vietnamese: "Chào hỏi",
    description: "Trong văn hóa Hàn Quốc, chào hỏi rất quan trọng. Có hai loại: jeol (cúi chào truyền thống) và bow (cúi nhẹ).",
    examples: [
      { korean: "안녕하세요 (annyeonghaseyo)", vietnamese: "Xin chào", context: "Chào hỏi thông thường" },
      { korean: "반갑습니다 (bangapseumnida)", vietnamese: "Rất vui được gặp bạn", context: "Chào hỏi trang trọng" }
    ],
    tips: [
      "Cúi chào người lớn tuổi sâu hơn",
      "Đứng thẳng khi chào",
      "Mắt nhìn xuống đất khi cúi chào"
    ],
    difficulty: "beginner"
  },
  {
    id: "c4",
    title: "Tặng quà (Gift Giving)",
    category: "etiquette",
    korean: "선물",
    vietnamese: "Tặng quà",
    description: "Tặng quà là một phần quan trọng của văn hóa Hàn. Quà thường được bọc đẹp và tặng bằng hai tay.",
    examples: [
      { korean: "이거 받아주세요 (igeo badajuseyo)", vietnamese: "Xin hãy nhận món này", context: "Khi tặng quà" },
      { korean: "감사합니다 (gamsahamnida)", vietnamese: "Cảm ơn", context: "Khi nhận quà" }
    ],
    tips: [
      "Tặng quà bằng hai tay",
      "Không mở quà ngay khi nhận",
      "Tránh tặng số 4 (bất lợi)"
    ],
    difficulty: "beginner"
  },
  {
    id: "c5",
    title: "Ăn uống (Dining Etiquette)",
    category: "etiquette",
    korean: "식사 예절",
    vietnamese: "Lễ nghi ăn uống",
    description: "Lễ nghi ăn uống rất quan trọng. Người lớn tuổi ăn trước, không dùng đũa cắm thẳng vào cơm.",
    examples: [
      { korean: "잘 먹겠습니다 (jal meokgesseumnida)", vietnamese: "Tôi sẽ ăn ngon miệng", context: "Trước khi ăn" },
      { korean: "잘 먹었습니다 (jal meogeotseumnida)", vietnamese: "Tôi đã ăn ngon miệng", context: "Sau khi ăn" }
    ],
    tips: [
      "Đợi người lớn tuổi ăn trước",
      "Không cắm đũa thẳng vào cơm",
      "Đừng dùng đũa chỉ người"
    ],
    difficulty: "intermediate"
  },
  {
    id: "c6",
    title: "Tiếng lóng teen (Slang)",
    category: "slang",
    korean: "쩐다",
    vietnamese: "Đỉnh cao",
    description: "Jjeonda có nghĩa là rất tuyệt vời, đỉnh cao. Được dùng bởi giới trẻ để khen ngợi.",
    examples: [
      { korean: "이거 진짜 쩐다", vietnamese: "Cái này đỉnh cao thật", context: "Khen ngợi" },
      { korean: "너 오늘 쩐다", vietnamese: "Hôm nay cậu đỉnh cao", context: "Khen ngợi bạn bè" }
    ],
    tips: [
      "Chỉ dùng với bạn bè thân thiết",
      "Không dùng trong môi trường trang trọng",
      "Có thể viết là 쩔다"
    ],
    difficulty: "intermediate"
  },
  {
    id: "c7",
    title: "Tiếng lóng: Daebak",
    category: "slang",
    korean: "대박",
    vietnamese: "Tuyệt vời",
    description: "Daebak có nghĩa là tuyệt vời, kinh ngạc. Dùng khi có tin tức tốt hoặc sự kiện bất ngờ.",
    examples: [
      { korean: "대박이다", vietnamese: "Tuyệt vời quá", context: "Khi có tin tốt" },
      { korean: "이거 대박", vietnamese: "Cái này tuyệt", context: "Khen ngợi" }
    ],
    tips: [
      "Dùng trong cả trang trọng và thân mật",
      "Có thể dùng cho cả tin tốt và xấu",
      "Phổ biến trong K-drama"
    ],
    difficulty: "beginner"
  },
  {
    id: "c8",
    title: "Tiếng lóng: Aigoo",
    category: "slang",
    korean: "아이구",
    vietnamese: "Ôi thôi",
    description: "Aigoo là tiếng thở dài, dùng để thể hiện sự thất vọng, mệt mỏi hoặc đồng cảm.",
    examples: [
      { korean: "아이구, 힘들다", vietnamese: "Ôi thôi, mệt quá", context: "Thất vọng" },
      { korean: "아이구, 정말 안타깝네", vietnamese: "Ôi, thật đáng tiếc", context: "Đồng cảm" }
    ],
    tips: [
      "Dùng khi mệt mỏi hoặc thất vọng",
      "Thường dùng bởi người lớn tuổi",
      "Có thể dùng với cả người lạ"
    ],
    difficulty: "beginner"
  },
  {
    id: "c9",
    title: "Gọi đồ ăn (Ordering Food)",
    category: "scenarios",
    korean: "주문하기",
    vietnamese: "Đặt món",
    description: "Khi gọi đồ ăn trong nhà hàng Hàn, cần biết các câu cơ bản và cách chờ đợi.",
    examples: [
      { korean: "주문할게요 (ju mun hal ge yo)", vietnamese: "Tôi sẽ gọi món", context: "Khi gọi món" },
      { korean: "이거 주세요 (i geo ju se yo)", vietnamese: "Cho tôi cái này", context: "Chỉ định món" }
    ],
    tips: [
      "Chờ nhân viên phục vụ đến",
      "Gọi món bằng giọng nhẹ nhàng",
      "Không gọi món khi nhân viên đang bận"
    ],
    difficulty: "beginner"
  },
  {
    id: "c10",
    title: "Hỏi đường (Asking Directions)",
    category: "scenarios",
    korean: "길 묻기",
    vietnamese: "Hỏi đường",
    description: "Khi bị lạc, cần biết cách hỏi đường một cách lịch sự và hiểu các chỉ dẫn.",
    examples: [
      { korean: "실례지만, 지하철역이 어디예요?", vietnamese: "Xin lỗi, ga tàu điện ngầm ở đâu?", context: "Hỏi đường" },
      { korean: "이쪽으로 가세요", vietnamese: "Đi về phía này", context: "Chỉ dẫn" }
    ],
    tips: [
      "Bắt đầu bằng '실례지만' (xin lỗi)",
      "Cảm ơn sau khi được chỉ dẫn",
      "Yêu cầu người địa phương nói chậm nếu cần"
    ],
    difficulty: "intermediate"
  },
  {
    id: "c11",
    title: "Mua sắm (Shopping)",
    category: "scenarios",
    korean: "쇼핑",
    vietnamese: "Mua sắm",
    description: "Khi mua sắm tại Hàn, cần biết cách hỏi giá, mặc cả và thanh toán.",
    examples: [
      { korean: "이거 얼마예요?", vietnamese: "Cái này bao nhiêu?", context: "Hỏi giá" },
      { korean: "할인해 주실 수 있나요?", vietnamese: "Có thể giảm giá không?", context: "Mặc cả" }
    ],
    tips: [
      "Mặc cả ở chợ truyền thống",
      "Không mặc cả ở cửa hàng lớn",
      "Thanh toán bằng thẻ hoặc tiền mặt"
    ],
    difficulty: "intermediate"
  },
  {
    id: "c12",
    title: "Bỏ giày trong nhà",
    category: "customs",
    korean: "신발 벗기",
    vietnamese: "Bỏ giày",
    description: "Trong văn hóa Hàn, phải bỏ giày trước khi vào nhà. Giày được để ở cửa.",
    examples: [
      { korean: "신발을 벗어주세요", vietnamese: "Xin hãy bỏ giày", context: "Nhắc khách bỏ giày" },
      { korean: "현관에 신발을 둡니다", vietnamese: "Để giày ở cửa", context: "Quy tắc chung" }
    ],
    tips: [
      "Bỏ giày ngay tại cửa (hyeon-gwan)",
      "Không đi giày vào nhà",
      "Khách cũng phải tuân thủ quy tắc này"
    ],
    difficulty: "beginner"
  },
  {
    id: "c13",
    title: "Uống rượu (Drinking Etiquette)",
    category: "customs",
    korean: "술 예절",
    vietnamese: "Lễ nghi uống rượu",
    description: "Khi uống rượu với người lớn tuổi, phải rót rượu bằng hai tay và nhận ly bằng hai tay.",
    examples: [
      { korean: "잘 마시겠습니다", vietnamese: "Tôi sẽ uống ngon miệng", context: "Khi nhận rượu" },
      { korean: "한 잔만 주세요", vietnamese: "Chỉ cho tôi một ly thôi", context: "Khi từ chối" }
    ],
    tips: [
      "Rót rượu cho người lớn tuổi trước",
      "Nhận ly bằng hai tay",
      "Không tự rót rượu cho mình"
    ],
    difficulty: "intermediate"
  },
  {
    id: "c14",
    title: "Tuổi Hàn (Korean Age)",
    category: "customs",
    korean: "한국 나이",
    vietnamese: "Tuổi Hàn",
    description: "Hàn Quốc tính tuổi khác quốc tế. Khi sinh ra, bạn đã 1 tuổi. Tăng tuổi vào ngày 1/1.",
    examples: [
      { korean: "한국 나이로 스물셋이에요", vietnamese: "Tôi 23 tuổi theo tuổi Hàn", context: "Giới thiệu tuổi" },
      { korean: "올해 한 살 더 먹었어요", vietnamese: "Năm nay tôi thêm một tuổi", context: "Khi tăng tuổi" }
    ],
    tips: [
      "Khi sinh ra = 1 tuổi",
      "Tăng tuổi vào ngày 1/1 (không phải sinh nhật)",
      "Quan trọng để xác định cấp bậc xã hội"
    ],
    difficulty: "advanced"
  },
  {
    id: "c15",
    title: "Chủ nghĩa Confucius (Confucianism)",
    category: "customs",
    korean: "유교",
    vietnamese: "Nho giáo",
    description: "Nho giáo ảnh hưởng sâu sắc đến văn hóa Hàn: tôn trọng người lớn tuổi, gia đình, và giáo dục.",
    examples: [
      { korean: "효도", vietnamese: "Hiếu thảo", context: "Giá trị quan trọng" },
      { korean: "존경", vietnamese: "Tôn trọng", context: "Giá trị quan trọng" }
    ],
    tips: [
      "Tôn trọng người lớn tuổi",
      "Gia đình là quan trọng nhất",
      "Giáo dục được ưu tiên"
    ],
    difficulty: "advanced"
  }
];

const CATEGORY_INFO = {
  festivals: { label: "Lễ hội", icon: "ri-calendar-line", color: "#f59e0b" },
  etiquette: { label: "Lễ nghi", icon: "ri-user-star-line", color: "#8b5cf6" },
  slang: { label: "Tiếng lóng", icon: "ri-chat-smile-3-line", color: "#ec4899" },
  scenarios: { label: "Tình huống", icon: "ri-map-pin-line", color: "#10b981" },
  customs: { label: "Tập quán", icon: "ri-home-heart-line", color: "#3b82f6" }
};

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export default function CulturalContentPage() {
  const { awardXP } = useXPSystem();
  const [selectedCategory, setSelectedCategory] = useState<"all" | keyof typeof CATEGORY_INFO>("all");
  const [selectedLesson, setSelectedLesson] = useState<CulturalLesson | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{ score: number; total: number } | null>(null);
  const [history, setHistory] = useState<{ lessonId: string; score: number; date: string }[]>([]);
  const [xpAwarded, setXpAwarded] = useState<Set<string>>(new Set());

  const filteredLessons = selectedCategory === "all"
    ? CULTURAL_LESSONS
    : CULTURAL_LESSONS.filter(l => l.category === selectedCategory);

  const generateQuiz = useCallback((lesson: CulturalLesson): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    
    // Question 1: Meaning
    questions.push({
      question: `"${lesson.korean}" có nghĩa là gì?`,
      options: [lesson.vietnamese, "Không có đáp án đúng", "Không rõ", "Tùy ngữ cảnh"],
      correctIndex: 0
    });

    // Question 2: Context
    if (lesson.examples.length > 0) {
      const example = lesson.examples[0];
      questions.push({
        question: `"${example.korean}" dùng trong ngữ cảnh nào?`,
        options: [example.context, "Không có đáp án đúng", "Không rõ", "Tùy ngữ cảnh"],
        correctIndex: 0
      });
    }

    // Question 3: True/False based on tips
    if (lesson.tips.length > 0) {
      questions.push({
        question: `Điều sau đây đúng về "${lesson.title}"?`,
        options: [lesson.tips[0], "Không có đáp án đúng", "Không rõ", "Tùy ngữ cảnh"],
        correctIndex: 0
      });
    }

    return questions;
  }, []);

  const startQuiz = useCallback((lesson: CulturalLesson) => {
    setSelectedLesson(lesson);
    setQuizMode(true);
    setCurrentQuizIndex(0);
    setQuizAnswers([]);
    setQuizResult(null);
  }, []);

  const handleQuizAnswer = useCallback((answerIndex: number) => {
    const newAnswers = [...quizAnswers, answerIndex];
    setQuizAnswers(newAnswers);

    if (currentQuizIndex < generateQuiz(selectedLesson!).length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Calculate score
      const questions = generateQuiz(selectedLesson!);
      const correctCount = newAnswers.filter((ans, idx) => ans === questions[idx].correctIndex).length;
      const score = Math.round((correctCount / questions.length) * 100);

      setQuizResult({ score, total: questions.length });

      // Award XP
      const xpKey = `${selectedLesson!.id}-quiz-${new Date().toISOString().split("T")[0]}`;
      if (!xpAwarded.has(xpKey) && score >= 60) {
        const baseXP = selectedLesson!.difficulty === "beginner" ? 10 : selectedLesson!.difficulty === "intermediate" ? 20 : 30;
        const bonusXP = score >= 80 ? Math.round(baseXP * 0.5) : 0;
        const totalXP = baseXP + bonusXP;

        awardXP({
          type: "manual_bonus",
          amount: totalXP,
          meta: { reason: `Cultural: ${selectedLesson!.title} (Score: ${score}%)` }
        });

        setXpAwarded(prev => new Set([...prev, xpKey]));
      }

      // Save to history
      setHistory(prev => [...prev, { lessonId: selectedLesson!.id, score, date: new Date().toISOString() }]);
    }
  }, [quizAnswers, currentQuizIndex, selectedLesson, generateQuiz, awardXP, xpAwarded]);

  const closeQuiz = useCallback(() => {
    setQuizMode(false);
    setSelectedLesson(null);
    setCurrentQuizIndex(0);
    setQuizAnswers([]);
    setQuizResult(null);
  }, []);

  const difficultyColors = {
    beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20"
  };

  return (
    <DashboardLayout title="Cultural Content" subtitle="Văn hóa Hàn Quốc">
      {!quizMode ? (
        <>
          {/* Category Filter */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-app-accent-primary text-app-bg"
                  : "bg-app-card text-app-text-secondary hover:text-white"
              }`}
            >
              Tất cả
            </button>
            {(Object.keys(CATEGORY_INFO) as (keyof typeof CATEGORY_INFO)[]).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-app-accent-primary text-app-bg"
                    : "bg-app-card text-app-text-secondary hover:text-white"
                }`}
              >
                <i className={`${CATEGORY_INFO[cat].icon} mr-1`} />
                {CATEGORY_INFO[cat].label}
              </button>
            ))}
          </div>

          {/* Lessons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-app-card border border-app-border rounded-xl p-4 cursor-pointer hover:border-app-accent-primary transition-all"
                onClick={() => setSelectedLesson(lesson)}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${difficultyColors[lesson.difficulty]}`}>
                      {lesson.difficulty.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border`} style={{ 
                      backgroundColor: `${CATEGORY_INFO[lesson.category].color}20`,
                      color: CATEGORY_INFO[lesson.category].color,
                      borderColor: `${CATEGORY_INFO[lesson.category].color}40`
                    }}>
                      {CATEGORY_INFO[lesson.category].label}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-white font-bold text-lg mb-1">{lesson.title}</h3>
                <p className="text-app-text-secondary text-sm mb-2">{lesson.korean}</p>

                {/* Description */}
                <p className="text-app-text-faint text-xs line-clamp-2 mb-3">{lesson.description}</p>

                {/* Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startQuiz(lesson);
                  }}
                  className="w-full py-2 rounded-lg bg-app-accent-primary text-app-bg text-sm font-bold cursor-pointer hover:bg-app-accent-primary/80 transition-all"
                >
                  Làm quiz
                </button>
              </div>
            ))}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 bg-app-card border border-app-border rounded-2xl p-4">
              <h3 className="font-bold text-white mb-3">Lịch sử luyện tập</h3>
              <div className="space-y-2">
                {history.slice(-5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-app-border last:border-0">
                    <span className="text-app-text-secondary text-sm">
                      {CULTURAL_LESSONS.find(l => l.id === item.lessonId)?.title}
                    </span>
                    <span className={`font-bold ${item.score >= 80 ? "text-emerald-400" : item.score >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                      {item.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : selectedLesson && (
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={closeQuiz}
              className="px-4 py-2 rounded-lg bg-app-card text-white cursor-pointer hover:bg-app-card2 transition-all flex items-center gap-2"
            >
              <i className="ri-arrow-left-line" />
              Quay lại
            </button>
            <span className="text-app-text-secondary text-sm">
              {currentQuizIndex + 1} / {generateQuiz(selectedLesson).length}
            </span>
          </div>

          {!quizResult ? (
            <>
              {/* Lesson Info */}
              <div className="bg-app-card border border-app-border rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${difficultyColors[selectedLesson.difficulty]}`}>
                    {selectedLesson.difficulty.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border`} style={{ 
                    backgroundColor: `${CATEGORY_INFO[selectedLesson.category].color}20`,
                    color: CATEGORY_INFO[selectedLesson.category].color,
                    borderColor: `${CATEGORY_INFO[selectedLesson.category].color}40`
                  }}>
                    {CATEGORY_INFO[selectedLesson.category].label}
                  </span>
                </div>

                <h2 className="text-white font-bold text-2xl mb-2">{selectedLesson.title}</h2>
                <p className="text-app-text-secondary text-lg mb-1">{selectedLesson.korean}</p>
                <p className="text-app-text-faint mb-4">{selectedLesson.vietnamese}</p>

                <p className="text-app-text-secondary mb-4">{selectedLesson.description}</p>

                {/* Examples */}
                <div className="space-y-3 mb-4">
                  <p className="text-app-text-faint text-xs font-bold">Ví dụ:</p>
                  {selectedLesson.examples.map((example, idx) => (
                    <div key={idx} className="bg-app-card2 rounded-lg p-3">
                      <p className="text-white font-medium">{example.korean}</p>
                      <p className="text-app-text-secondary text-sm">{example.vietnamese}</p>
                      <p className="text-app-text-faint text-xs">{example.context}</p>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                <div className="space-y-2">
                  <p className="text-app-text-faint text-xs font-bold">Tips:</p>
                  {selectedLesson.tips.map((tip, idx) => (
                    <p key={idx} className="text-app-text-secondary text-sm">• {tip}</p>
                  ))}
                </div>
              </div>

              {/* Quiz Question */}
              <div className="bg-app-card border border-app-border rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">
                  Câu hỏi {currentQuizIndex + 1}
                </h3>
                <p className="text-app-text-secondary text-lg mb-6">
                  {generateQuiz(selectedLesson)[currentQuizIndex].question}
                </p>

                <div className="space-y-3">
                  {generateQuiz(selectedLesson)[currentQuizIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      className="w-full py-3 rounded-lg bg-app-card2 text-white text-left px-4 cursor-pointer hover:bg-app-accent-primary hover:text-white transition-all"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-app-card border border-app-border rounded-2xl p-6">
              <h3 className="text-white font-bold text-2xl mb-4">Kết quả quiz</h3>
              
              <div className={`mb-6 rounded-xl p-6 ${quizResult.score >= 80 ? "bg-emerald-500/10 border border-emerald-500/20" : quizResult.score >= 60 ? "bg-amber-500/10 border border-amber-500/20" : "bg-rose-500/10 border border-rose-500/20"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-app-text-secondary">Điểm số</span>
                  <span className={`text-4xl font-bold ${quizResult.score >= 80 ? "text-emerald-400" : quizResult.score >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                    {quizResult.score}%
                  </span>
                </div>
                <p className="text-app-text-faint">
                  {quizResult.score}/{quizResult.total} câu đúng
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeQuiz}
                  className="flex-1 py-3 rounded-lg bg-app-card text-white font-bold cursor-pointer hover:bg-app-card2 transition-all"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => startQuiz(selectedLesson)}
                  className="flex-1 py-3 rounded-lg bg-app-accent-primary text-app-bg font-bold cursor-pointer hover:bg-app-accent-primary/80 transition-all"
                >
                  Làm lại
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
