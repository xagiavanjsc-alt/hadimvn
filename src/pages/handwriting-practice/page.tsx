import { useState, useRef, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useXPSystem } from "@/hooks/useXPSystem";

interface StrokePoint {
  x: number;
  y: number;
}

interface Stroke {
  points: StrokePoint[];
}

interface HandwritingLesson {
  id: string;
  character: string;
  vietnamese: string;
  pronunciation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "hangul" | "hanja";
  strokeOrder: string[]; // Stroke order description
  tips: string[];
  gridSize?: "small" | "medium" | "large";
}

const HANDWRITING_LESSONS: HandwritingLesson[] = [
  {
    id: "h1",
    character: "가",
    vietnamese: "Đi",
    pronunciation: "ga",
    difficulty: "beginner",
    category: "hangul",
    strokeOrder: ["1. Nét ngang từ trái sang phải", "2. Nét dọc từ trên xuống dưới", "3. Nét ngang bên phải"],
    tips: [
      "Bắt đầu nét từ trên xuống dưới",
      "Nét dọc phải thẳng",
      "Khoảng cách giữa các nét đều"
    ],
    gridSize: "medium"
  },
  {
    id: "h2",
    character: "나",
    vietnamese: "Tôi",
    pronunciation: "na",
    difficulty: "beginner",
    category: "hangul",
    strokeOrder: ["1. Nét ngang từ trái sang phải", "2. Nét dọc từ trên xuống dưới", "3. Nét cong bên phải"],
    tips: [
      "Nét cong phải mềm mại",
      "Kết thúc nét cong hơi lên",
      "Nét dọc ở giữa"
    ],
    gridSize: "medium"
  },
  {
    id: "h3",
    character: "다",
    vietnamese: "Tất cả",
    pronunciation: "da",
    difficulty: "beginner",
    category: "hangul",
    strokeOrder: ["1. Nét ngang từ trái sang phải", "2. Nét dọc từ trên xuống dưới", "3. Nét cong bên phải", "4. Nét ngang dưới cùng"],
    tips: [
      "Nét ngang dưới cùng dài hơn",
      "Nét cong phải mở rộng",
      "Cân đối giữa các phần"
    ],
    gridSize: "medium"
  },
  {
    id: "h4",
    character: "라",
    vietnamese: "Xanh",
    pronunciation: "ra",
    difficulty: "intermediate",
    category: "hangul",
    strokeOrder: ["1. Nét ngang từ trái sang phải", "2. Nét dọc từ trên xuống dưới", "3. Nét cong bên phải", "4. Nét ngang dưới cùng", "5. Nét dọc bên trái"],
    tips: [
      "Nét dọc bên trái ngắn",
      "Nét cong phải phải mở rộng",
      "Cân đối tổng thể"
    ],
    gridSize: "medium"
  },
  {
    id: "h5",
    character: "마",
    vietnamese: "Mã",
    pronunciation: "ma",
    difficulty: "intermediate",
    category: "hangul",
    strokeOrder: ["1. Nét ngang từ trái sang phải", "2. Nét dọc từ trên xuống dưới", "3. Nét cong bên phải", "4. Nét ngang dưới cùng", "5. Nét cong bên trái"],
    tips: [
      "Nét cong bên trái phải mềm mại",
      "Nét cong bên phải mở rộng",
      "Cân đối hai bên"
    ],
    gridSize: "medium"
  },
  {
    id: "h6",
    character: "바",
    vietnamese: "Quần",
    pronunciation: "ba",
    difficulty: "intermediate",
    category: "hangul",
    strokeOrder: ["1. Nét ngang từ trái sang phải", "2. Nét dọc từ trên xuống dưới", "3. Nét cong bên phải", "4. Nét ngang dưới cùng", "5. Nét dọc bên phải"],
    tips: [
      "Nét dọc bên phải thẳng",
      "Nét cong bên phải mở rộng",
      "Cân đối tổng thể"
    ],
    gridSize: "medium"
  },
  {
    id: "h7",
    character: "사",
    vietnamese: "Số",
    pronunciation: "sa",
    difficulty: "intermediate",
    category: "hangul",
    strokeOrder: ["1. Nét ngang từ trái sang phải", "2. Nét dọc từ trên xuống dưới", "3. Nét cong bên phải", "4. Nét ngang dưới cùng", "5. Nét dọc bên phải", "6. Nét ngang ngắn"],
    tips: [
      "Nét ngang ngắn ở dưới",
      "Nét cong bên phải mở rộng",
      "Cân đối tổng thể"
    ],
    gridSize: "medium"
  },
  {
    id: "h8",
    character: "아",
    vietnamese: "Trẻ em",
    pronunciation: "a",
    difficulty: "beginner",
    category: "hangul",
    strokeOrder: ["1. Nét ngang từ trái sang phải", "2. Nét dọc từ trên xuống dưới", "3. Nét cong bên phải"],
    tips: [
      "Nét cong bên phải mở rộng",
      "Nét dọc ở giữa",
      "Cân đối tổng thể"
    ],
    gridSize: "medium"
  },
  {
    id: "h9",
    character: "자",
    vietnamese: "Chữ",
    pronunciation: "ja",
    difficulty: "intermediate",
    category: "hangul",
    strokeOrder: ["1. Nét ngang từ trái sang phải", "2. Nét dọc từ trên xuống dưới", "3. Nét cong bên phải", "4. Nét ngang dưới cùng", "5. Nét dọc bên phải"],
    tips: [
      "Nét dọc bên phải thẳng",
      "Nét cong bên phải mở rộng",
      "Cân đối tổng thể"
    ],
    gridSize: "medium"
  },
  {
    id: "h10",
    character: "차",
    vietnamese: "Xe",
    pronunciation: "cha",
    difficulty: "intermediate",
    category: "hangul",
    strokeOrder: ["1. Nét ngang từ trái sang phải", "2. Nét dọc từ trên xuống dưới", "3. Nét cong bên phải", "4. Nét ngang dưới cùng", "5. Nét dọc bên phải", "6. Nét ngang ngắn"],
    tips: [
      "Nét ngang ngắn ở dưới",
      "Nét cong bên phải mở rộng",
      "Cân đối tổng thể"
    ],
    gridSize: "medium"
  },
  {
    id: "h11",
    character: "하",
    vietnamese: "Một",
    pronunciation: "ha",
    difficulty: "beginner",
    category: "hangul",
    strokeOrder: ["1. Nét ngang từ trái sang phải", "2. Nét dọc từ trên xuống dưới", "3. Nét cong bên phải", "4. Nét ngang dưới cùng"],
    tips: [
      "Nét ngang dưới cùng dài",
      "Nét cong bên phải mở rộng",
      "Cân đối tổng thể"
    ],
    gridSize: "medium"
  },
  {
    id: "h12",
    character: "한",
    vietnamese: "Hàn Quốc",
    pronunciation: "han",
    difficulty: "advanced",
    category: "hangul",
    strokeOrder: ["1. Nét dọc từ trên xuống dưới", "2. Nét ngang từ trái sang phải", "3. Nét cong bên phải", "4. Nét ngang dưới cùng"],
    tips: [
      "Nét dọc bên trái dài",
      "Nét cong bên phải mở rộng",
      "Cân đối tổng thể"
    ],
    gridSize: "medium"
  },
  {
    id: "hj1",
    character: "公",
    vietnamese: "Công",
    pronunciation: "công",
    difficulty: "intermediate",
    category: "hanja",
    strokeOrder: ["1. Nét cong bên trái", "2. Nét cong bên phải", "3. Nét dọc từ trên xuống dưới", "4. Nét cong bên dưới"],
    tips: [
      "Nét cong bên trái mở rộng",
      "Nét cong bên phải cân đối",
      "Nét dọc ở giữa thẳng"
    ],
    gridSize: "large"
  },
  {
    id: "hj2",
    character: "私",
    vietnamese: "Tư",
    pronunciation: "tư",
    difficulty: "advanced",
    category: "hanja",
    strokeOrder: ["1. Nét cong bên trái", "2. Nét dọc từ trên xuống dưới", "3. Nét cong bên phải", "4. Nét ngang dưới cùng"],
    tips: [
      "Nét cong bên trái mở rộng",
      "Nét dọc phải thẳng",
      "Cân đối tổng thể"
    ],
    gridSize: "large"
  },
  {
    id: "hj3",
    character: "学",
    vietnamese: "Học",
    pronunciation: "học",
    difficulty: "advanced",
    category: "hanja",
    strokeOrder: ["1. Nét ngang trên cùng", "2. Nét dọc bên trái", "3. Nét cong bên phải", "4. Nét dọc giữa", "5. Nét cong bên trái dưới", "6. Nét cong bên phải dưới"],
    tips: [
      "Nét ngang trên cùng dài",
      "Phần dưới cân đối",
      "Nét dọc ở giữa thẳng"
    ],
    gridSize: "large"
  }
];

interface HandwritingResult {
  accuracy: number;
  strokeCount: number;
  expectedStrokes: number;
  feedback: string[];
}

export default function HandwritingPracticePage() {
  const { awardXP } = useXPSystem();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[]>([]);
  const [result, setResult] = useState<HandwritingResult | null>(null);
  const [showStrokeOrder, setShowStrokeOrder] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "hangul" | "hanja">("all");
  const [history, setHistory] = useState<{ lessonId: string; score: number; date: string }[]>([]);
  const [xpAwarded, setXpAwarded] = useState<Set<string>>(new Set());

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const currentLesson = HANDWRITING_LESSONS[currentIndex];
  const filteredLessons = HANDWRITING_LESSONS.filter(l => {
    if (selectedDifficulty !== "all" && l.difficulty !== selectedDifficulty) return false;
    if (selectedCategory !== "all" && l.category !== selectedCategory) return false;
    return true;
  });

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctxRef.current = ctx;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    drawGrid();
  }, [currentLesson]);

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    // Outer border
    ctx.strokeRect(0, 0, size, size);

    // Diagonal lines
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, size);
    ctx.moveTo(size, 0);
    ctx.lineTo(0, size);
    ctx.stroke();

    // Center lines
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.stroke();
  }, []);

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    setCurrentStroke([coords]);
  }, [getCanvasCoordinates]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const coords = getCanvasCoordinates(e);
    setCurrentStroke(prev => [...prev, coords]);

    const ctx = ctxRef.current;
    if (!ctx) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (currentStroke.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentStroke[currentStroke.length - 2].x, currentStroke[currentStroke.length - 2].y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  }, [isDrawing, currentStroke, getCanvasCoordinates]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 0) {
      setStrokes(prev => [...prev, { points: currentStroke }]);
    }
    setCurrentStroke([]);
  }, [isDrawing, currentStroke]);

  const clearCanvas = useCallback(() => {
    setStrokes([]);
    setCurrentStroke([]);
    setResult(null);
    drawGrid();
  }, [drawGrid]);

  const checkHandwriting = useCallback(() => {
    if (strokes.length === 0) return;

    // Simplified recognition: check stroke count and basic structure
    const expectedStrokes = currentLesson.character.length; // Approximate
    const strokeCount = strokes.length;

    // Calculate accuracy based on stroke count and complexity
    let accuracy = 100;
    const feedback: string[] = [];

    if (strokeCount < expectedStrokes - 1) {
      accuracy -= 30;
      feedback.push("Bạn viết thiếu nét");
    } else if (strokeCount > expectedStrokes + 2) {
      accuracy -= 20;
      feedback.push("Bạn viết quá nhiều nét");
    }

    // Check if strokes are reasonable (not too short)
    const shortStrokes = strokes.filter(s => s.points.length < 5).length;
    if (shortStrokes > 0) {
      accuracy -= 10 * shortStrokes;
      feedback.push("Một số nét quá ngắn");
    }

    // Ensure accuracy is within bounds
    accuracy = Math.max(0, Math.min(100, accuracy));

    if (feedback.length === 0) {
      feedback.push("Nét viết tốt! Cố gắng giữ độ đều.");
    }

    setResult({
      accuracy,
      strokeCount,
      expectedStrokes,
      feedback
    });

    // Award XP
    const xpKey = `${currentLesson.id}-${new Date().toISOString().split("T")[0]}`;
    if (!xpAwarded.has(xpKey) && accuracy >= 60) {
      const baseXP = currentLesson.difficulty === "beginner" ? 10 : currentLesson.difficulty === "intermediate" ? 20 : 30;
      const bonusXP = accuracy >= 80 ? Math.round(baseXP * 0.5) : 0;
      const totalXP = baseXP + bonusXP;

      awardXP({
        type: "manual_bonus",
        amount: totalXP,
        meta: { reason: `Handwriting: ${currentLesson.character} (${currentLesson.vietnamese}) (Accuracy: ${accuracy}%)` }
      });

      setXpAwarded(prev => new Set([...prev, xpKey]));
    }

    // Save to history
    setHistory(prev => [...prev, { lessonId: currentLesson.id, score: accuracy, date: new Date().toISOString() }]);
  }, [strokes, currentLesson, awardXP, xpAwarded]);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredLessons.length - 1) {
      setCurrentIndex(prev => prev + 1);
      clearCanvas();
    }
  }, [currentIndex, filteredLessons.length, clearCanvas]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      clearCanvas();
    }
  }, [currentIndex, clearCanvas]);

  const difficultyColors = {
    beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20"
  };

  const categoryColors = {
    hangul: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    hanja: "bg-purple-500/10 text-purple-500 border-purple-500/20"
  };

  return (
    <DashboardLayout title="Handwriting Practice" subtitle="Luyện viết chữ Hán và Hangul">
      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          {(["all", "beginner", "intermediate", "advanced"] as const).map(diff => (
            <button
              key={diff}
              onClick={() => {
                setSelectedDifficulty(diff);
                setCurrentIndex(0);
                clearCanvas();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                selectedDifficulty === diff
                  ? "bg-app-accent-primary text-app-bg"
                  : "bg-app-card text-app-text-secondary hover:text-white"
              }`}
            >
              {diff === "all" ? "Tất cả" : diff === "beginner" ? "Cơ bản" : diff === "intermediate" ? "Trung cấp" : "Nâng cao"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {(["all", "hangul", "hanja"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentIndex(0);
                clearCanvas();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-app-accent-primary text-app-bg"
                  : "bg-app-card text-app-text-secondary hover:text-white"
              }`}
            >
              {cat === "all" ? "Tất cả" : cat === "hangul" ? "Hangul" : "Hán tự"}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson Card */}
      <div className="bg-app-card border border-app-border rounded-2xl p-6 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${difficultyColors[currentLesson.difficulty]}`}>
              {currentLesson.difficulty === "beginner" ? "CƠ BẢN" : currentLesson.difficulty === "intermediate" ? "TRUNG CẤP" : "NÂNG CAO"}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${categoryColors[currentLesson.category]}`}>
              {currentLesson.category === "hangul" ? "HANGUL" : "HÁN TỰ"}
            </span>
          </div>
          <span className="text-app-text-secondary text-sm">
            {currentIndex + 1} / {filteredLessons.length}
          </span>
        </div>

        {/* Character Display */}
        <div className="flex items-center gap-8 mb-6">
          {/* Character Info */}
          <div className="flex-1">
            <div className="text-6xl font-bold text-white mb-2">{currentLesson.character}</div>
            <p className="text-app-text-secondary text-xl mb-1">{currentLesson.vietnamese}</p>
            <p className="text-app-text-faint text-sm">{currentLesson.pronunciation}</p>
          </div>

          {/* Canvas */}
          <div className="flex-shrink-0">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="bg-app-card2 border-2 border-app-border rounded-xl cursor-crosshair touch-none"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={clearCanvas}
                className="flex-1 py-2 rounded-lg bg-app-card text-white text-sm font-medium cursor-pointer hover:bg-app-card2 transition-all"
              >
                Xóa
              </button>
              {!result ? (
                <button
                  onClick={checkHandwriting}
                  disabled={strokes.length === 0}
                  className="flex-1 py-2 rounded-lg bg-app-accent-primary text-app-bg text-sm font-bold cursor-pointer hover:bg-app-accent-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Kiểm tra
                </button>
              ) : (
                <button
                  onClick={clearCanvas}
                  className="flex-1 py-2 rounded-lg bg-app-card text-white text-sm font-bold cursor-pointer hover:bg-app-card2 transition-all"
                >
                  Làm lại
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`mt-4 rounded-xl p-4 ${result.accuracy >= 80 ? "bg-emerald-500/10 border border-emerald-500/20" : result.accuracy >= 60 ? "bg-amber-500/10 border border-amber-500/20" : "bg-rose-500/10 border border-rose-500/20"}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">Kết quả</h3>
              <span className={`text-2xl font-bold ${result.accuracy >= 80 ? "text-emerald-400" : result.accuracy >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                {result.accuracy}%
              </span>
            </div>
            
            <p className="text-app-text-secondary mb-3">
              {result.strokeCount} nét / Khoảng {result.expectedStrokes} nét
            </p>

            {result.feedback.length > 0 && (
              <div className="space-y-1">
                {result.feedback.map((fb, idx) => (
                  <p key={idx} className="text-app-text-secondary text-sm">• {fb}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stroke Order */}
        <div className="mt-4">
          <button
            onClick={() => setShowStrokeOrder(!showStrokeOrder)}
            className="text-app-text-faint text-sm hover:text-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <i className={`ri-arrow-${showStrokeOrder ? "up" : "down"}-s-line`} />
            {showStrokeOrder ? "Ẩn thứ tự nét" : "Xem thứ tự nét"}
          </button>

          {showStrokeOrder && (
            <div className="mt-3 bg-app-card2 rounded-xl p-4">
              <p className="text-app-text-faint text-xs mb-2">Thứ tự nét:</p>
              {currentLesson.strokeOrder.map((step, idx) => (
                <p key={idx} className="text-app-text-secondary text-sm">• {step}</p>
              ))}
            </div>
          )}
        </div>

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
          Chữ trước
        </button>
        
        <button
          onClick={handleNext}
          disabled={currentIndex === filteredLessons.length - 1}
          className="px-6 py-3 rounded-xl bg-app-accent-primary text-app-bg font-bold cursor-pointer hover:bg-app-accent-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Chữ tiếp
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
                  {HANDWRITING_LESSONS.find(l => l.id === item.lessonId)?.character} ({HANDWRITING_LESSONS.find(l => l.id === item.lessonId)?.vietnamese})
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
