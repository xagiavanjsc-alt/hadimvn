import { useState, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface HangulChar {
  char: string;
  romanization: string;
  type: "vowel" | "consonant" | "syllable";
  strokes: number;
  tips: string;
  category: string;
}

const HANGUL_CHARS: HangulChar[] = [
  // Phụ âm cơ bản
  { char: "ㄱ", romanization: "g/k", type: "consonant", strokes: 2, tips: "Viết nét ngang trước, rồi nét dọc xuống", category: "Phụ âm" },
  { char: "ㄴ", romanization: "n", type: "consonant", strokes: 2, tips: "Viết nét dọc xuống, rồi nét ngang sang phải", category: "Phụ âm" },
  { char: "ㄷ", romanization: "d/t", type: "consonant", strokes: 3, tips: "Hai nét ngang, một nét dọc nối", category: "Phụ âm" },
  { char: "ㄹ", romanization: "r/l", type: "consonant", strokes: 5, tips: "Phức tạp nhất — luyện từng nét", category: "Phụ âm" },
  { char: "ㅁ", romanization: "m", type: "consonant", strokes: 4, tips: "Vẽ hình vuông — 4 nét", category: "Phụ âm" },
  { char: "ㅂ", romanization: "b/p", type: "consonant", strokes: 4, tips: "Hai nét dọc, hai nét ngang", category: "Phụ âm" },
  { char: "ㅅ", romanization: "s", type: "consonant", strokes: 2, tips: "Hai nét chéo gặp nhau ở đỉnh", category: "Phụ âm" },
  { char: "ㅇ", romanization: "ng/silent", type: "consonant", strokes: 1, tips: "Vẽ vòng tròn theo chiều kim đồng hồ", category: "Phụ âm" },
  { char: "ㅈ", romanization: "j", type: "consonant", strokes: 3, tips: "Nét ngang trên, hai nét chéo xuống", category: "Phụ âm" },
  { char: "ㅊ", romanization: "ch", type: "consonant", strokes: 4, tips: "Giống ㅈ nhưng thêm nét ngang nhỏ trên đỉnh", category: "Phụ âm" },
  { char: "ㅋ", romanization: "k", type: "consonant", strokes: 3, tips: "Giống ㄱ nhưng thêm nét ngang giữa", category: "Phụ âm" },
  { char: "ㅌ", romanization: "t", type: "consonant", strokes: 4, tips: "Giống ㄷ nhưng thêm nét ngang giữa", category: "Phụ âm" },
  { char: "ㅍ", romanization: "p", type: "consonant", strokes: 4, tips: "Hai nét dọc, hai nét ngang song song", category: "Phụ âm" },
  { char: "ㅎ", romanization: "h", type: "consonant", strokes: 3, tips: "Vòng tròn nhỏ trên, nét ngang, nét dọc", category: "Phụ âm" },
  // Nguyên âm cơ bản
  { char: "ㅏ", romanization: "a", type: "vowel", strokes: 2, tips: "Nét dọc dài, nét ngang ngắn sang phải", category: "Nguyên âm" },
  { char: "ㅑ", romanization: "ya", type: "vowel", strokes: 3, tips: "Nét dọc dài, hai nét ngang ngắn sang phải", category: "Nguyên âm" },
  { char: "ㅓ", romanization: "eo", type: "vowel", strokes: 2, tips: "Nét dọc dài, nét ngang ngắn sang trái", category: "Nguyên âm" },
  { char: "ㅕ", romanization: "yeo", type: "vowel", strokes: 3, tips: "Nét dọc dài, hai nét ngang ngắn sang trái", category: "Nguyên âm" },
  { char: "ㅗ", romanization: "o", type: "vowel", strokes: 2, tips: "Nét ngang dài, nét dọc ngắn lên trên", category: "Nguyên âm" },
  { char: "ㅛ", romanization: "yo", type: "vowel", strokes: 3, tips: "Nét ngang dài, hai nét dọc ngắn lên trên", category: "Nguyên âm" },
  { char: "ㅜ", romanization: "u", type: "vowel", strokes: 2, tips: "Nét ngang dài, nét dọc ngắn xuống dưới", category: "Nguyên âm" },
  { char: "ㅠ", romanization: "yu", type: "vowel", strokes: 3, tips: "Nét ngang dài, hai nét dọc ngắn xuống dưới", category: "Nguyên âm" },
  { char: "ㅡ", romanization: "eu", type: "vowel", strokes: 1, tips: "Chỉ một nét ngang dài", category: "Nguyên âm" },
  { char: "ㅣ", romanization: "i", type: "vowel", strokes: 1, tips: "Chỉ một nét dọc dài", category: "Nguyên âm" },
  // Âm tiết cơ bản
  { char: "가", romanization: "ga", type: "syllable", strokes: 4, tips: "ㄱ + ㅏ — phụ âm bên trái, nguyên âm bên phải", category: "Âm tiết" },
  { char: "나", romanization: "na", type: "syllable", strokes: 4, tips: "ㄴ + ㅏ — phụ âm bên trái, nguyên âm bên phải", category: "Âm tiết" },
  { char: "다", romanization: "da", type: "syllable", strokes: 5, tips: "ㄷ + ㅏ — phụ âm bên trái, nguyên âm bên phải", category: "Âm tiết" },
  { char: "마", romanization: "ma", type: "syllable", strokes: 6, tips: "ㅁ + ㅏ — phụ âm bên trái, nguyên âm bên phải", category: "Âm tiết" },
  { char: "바", romanization: "ba", type: "syllable", strokes: 6, tips: "ㅂ + ㅏ — phụ âm bên trái, nguyên âm bên phải", category: "Âm tiết" },
  { char: "사", romanization: "sa", type: "syllable", strokes: 4, tips: "ㅅ + ㅏ — phụ âm bên trái, nguyên âm bên phải", category: "Âm tiết" },
  { char: "아", romanization: "a", type: "syllable", strokes: 3, tips: "ㅇ (câm) + ㅏ — vòng tròn bên trái, nguyên âm bên phải", category: "Âm tiết" },
  { char: "자", romanization: "ja", type: "syllable", strokes: 5, tips: "ㅈ + ㅏ — phụ âm bên trái, nguyên âm bên phải", category: "Âm tiết" },
  { char: "하", romanization: "ha", type: "syllable", strokes: 5, tips: "ㅎ + ㅏ — phụ âm bên trái, nguyên âm bên phải", category: "Âm tiết" },
  { char: "한", romanization: "han", type: "syllable", strokes: 7, tips: "ㅎ + ㅏ + ㄴ — có phụ âm cuối (받침)", category: "Âm tiết" },
  { char: "국", romanization: "guk", type: "syllable", strokes: 6, tips: "ㄱ + ㅜ + ㄱ — có phụ âm cuối (받침)", category: "Âm tiết" },
  { char: "어", romanization: "eo", type: "syllable", strokes: 3, tips: "ㅇ (câm) + ㅓ — vòng tròn bên trái, nguyên âm bên phải", category: "Âm tiết" },
  { char: "요", romanization: "yo", type: "syllable", strokes: 4, tips: "ㅇ (câm) + ㅛ — vòng tròn trên, nguyên âm dưới", category: "Âm tiết" },
];

const CATEGORIES = ["Tất cả", "Phụ âm", "Nguyên âm", "Âm tiết"];

interface DrawPoint { x: number; y: number; }
interface Stroke { points: DrawPoint[]; }

interface ScoreRecord {
  char: string;
  score: number;
  date: string;
}

interface SpeechRecord {
  char: string;
  recognized: string;
  correct: boolean;
  date: string;
}

export default function HangulCanvasPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [selfScore, setSelfScore] = useState<number | null>(null);
  const [scores, setScores] = useLocalStorage<ScoreRecord[]>("hangul_canvas_scores", []);
  const [mode, setMode] = useState<"practice" | "quiz">("practice");
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [xpData, setXpData] = useLocalStorage<{ total: number }>("kts_xp_total", { total: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const [speechRecords, setSpeechRecords] = useLocalStorage<SpeechRecord[]>("hangul_speech_records", []);
  const [isListening, setIsListening] = useState(false);
  const [speechResult, setSpeechResult] = useState<{ recognized: string; correct: boolean; xp: number } | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showSpeechPanel, setShowSpeechPanel] = useState(false);

  const filtered = CATEGORIES[0] === selectedCategory || selectedCategory === "Tất cả"
    ? HANGUL_CHARS
    : HANGUL_CHARS.filter(c => c.category === selectedCategory);

  const currentChar = mode === "quiz"
    ? filtered[quizIdx % filtered.length]
    : filtered[currentIdx] || HANGUL_CHARS[0];

  const speakKorean = (text: string) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ko-KR";
    utt.rate = 0.7;
    synth.speak(utt);
  };

  // Draw guide character on guide canvas
  useEffect(() => {
    const canvas = guideCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Guide character
    if (showGuide) {
      ctx.font = `${canvas.width * 0.55}px 'Noto Sans KR', sans-serif`;
      ctx.fillStyle = "rgba(232,200,74,0.12)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(currentChar.char, canvas.width / 2, canvas.height / 2);
    }
  }, [currentChar, showGuide]);

  // Redraw user strokes
  const redrawStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "app-accent-primary";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });

    if (currentStroke.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      currentStroke.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  }, [strokes, currentStroke]);

  useEffect(() => { redrawStrokes(); }, [redrawStrokes]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement): DrawPoint => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (submitted) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    setCurrentStroke([getPos(e, canvas)]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || submitted) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setCurrentStroke(prev => [...prev, getPos(e, canvas)]);
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 1) {
      setStrokes(prev => [...prev, { points: currentStroke }]);
    }
    setCurrentStroke([]);
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setSubmitted(false);
    setSelfScore(null);
  };

  const handleSelfScore = (score: number) => {
    setSelfScore(score);
    setSubmitted(true);
    const xp = score >= 80 ? 15 : score >= 60 ? 10 : 5;
    setXpData(prev => ({ total: (prev.total || 0) + xp }));
    setScores(prev => [
      { char: currentChar.char, score, date: new Date().toISOString() },
      ...prev.slice(0, 99),
    ]);
    if (mode === "quiz") {
      if (score >= 70) setQuizStreak(s => s + 1);
      else setQuizStreak(0);
    }
  };

  const nextChar = () => {
    clearCanvas();
    if (mode === "quiz") {
      setQuizIdx(prev => (prev + 1) % filtered.length);
    } else {
      setCurrentIdx(prev => (prev + 1) % filtered.length);
    }
  };

  const prevChar = () => {
    clearCanvas();
    setCurrentIdx(prev => (prev - 1 + filtered.length) % filtered.length);
  };

  const avgScore = scores.length > 0
    ? Math.round(scores.slice(0, 20).reduce((s, r) => s + r.score, 0) / Math.min(scores.length, 20))
    : 0;

  const scoreColor = (s: number) =>
    s >= 80 ? "text-app-accent-success" : s >= 60 ? "text-amber-400" : "text-red-400";

  const speechAccuracy = speechRecords.length > 0
    ? Math.round((speechRecords.filter(r => r.correct).length / speechRecords.length) * 100)
    : 0;

  const startSpeechRecognition = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechError("Trình duyệt không hỗ trợ nhận dạng giọng nói. Hãy dùng Chrome.");
      return;
    }

    setSpeechResult(null);
    setSpeechError(null);
    setIsListening(true);

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onresult = (event: any) => {
      setIsListening(false);
      const results = Array.from(event.results[0]).map((r: { transcript: string }) => r.transcript.trim());
      const recognized = results[0] || "";

      // Check if any alternative matches the target character
      const isCorrect = results.some(r => {
        const normalized = r.replace(/\s/g, "");
        return normalized === currentChar.char ||
          normalized.includes(currentChar.char) ||
          currentChar.char.includes(normalized);
      });

      const xp = isCorrect ? 20 : 5;
      setSpeechResult({ recognized, correct: isCorrect, xp });

      if (isCorrect) {
        setXpData(prev => ({ total: (prev.total || 0) + xp }));
      }

      setSpeechRecords(prev => [
        { char: currentChar.char, recognized, correct: isCorrect, date: new Date().toISOString() },
        ...prev.slice(0, 99),
      ]);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      if (event.error === "no-speech") {
        setSpeechError("Không nghe thấy giọng nói. Hãy thử lại.");
      } else if (event.error === "not-allowed") {
        setSpeechError("Cần cấp quyền microphone.");
      } else {
        setSpeechError(`Lỗi: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Luyện viết Hangul
            </h1>
            <p className="text-app-text-secondary text-sm mt-0.5">Luyện viết tay + kiểm tra phát âm bằng AI nhận dạng giọng nói</p>
          </div>
          <div className="flex gap-3">
            {speechRecords.length > 0 && (
              <div className="bg-app-card/50 border border-app-border rounded-xl px-4 py-2 text-center">
                <p className={`font-bold text-xl ${speechAccuracy >= 70 ? "text-app-accent-success" : speechAccuracy >= 50 ? "text-amber-400" : "text-red-400"}`}>{speechAccuracy}%</p>
                <p className="text-app-text-secondary text-xs">Phát âm đúng</p>
              </div>
            )}
            {scores.length > 0 && (
              <div className="bg-app-card/50 border border-app-border rounded-xl px-4 py-2 text-center">
                <p className={`font-bold text-xl ${scoreColor(avgScore)}`}>{avgScore}%</p>
                <p className="text-app-text-secondary text-xs">Điểm viết TB</p>
              </div>
            )}
            <div className="bg-app-card/50 border border-app-border rounded-xl px-4 py-2 text-center">
              <p className="text-white font-bold text-xl">{scores.length}</p>
              <p className="text-app-text-secondary text-xs">Lần luyện</p>
            </div>
          </div>
        </div>

        {/* Mode + Category */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-1 bg-app-card/50 border border-app-border rounded-xl p-1">
            <button
              onClick={() => { setMode("practice"); clearCanvas(); setCurrentIdx(0); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${mode === "practice" ? "bg-white/15 text-white" : "text-app-text-secondary hover:text-white/70"}`}
            >
              Luyện tập
            </button>
            <button
              onClick={() => { setMode("quiz"); clearCanvas(); setQuizIdx(0); setQuizStreak(0); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${mode === "quiz" ? "bg-app-accent-primary/15 text-app-accent-primary" : "text-app-text-secondary hover:text-white/70"}`}
            >
              Kiểm tra
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); clearCanvas(); setCurrentIdx(0); setQuizIdx(0); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                  selectedCategory === cat
                    ? "bg-app-accent-primary/15 border-app-accent-primary/30 text-app-accent-primary"
                    : "bg-app-card/50 border-app-border text-app-text-secondary hover:text-white/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Character info */}
          <div className="space-y-4">
            {/* Character display */}
            <div className="bg-app-card/50 border border-app-border rounded-2xl p-6 text-center space-y-3">
              {mode === "quiz" && (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-fire-line text-app-accent-primary text-sm"></i>
                  </div>
                  <span className="text-app-accent-primary text-sm font-medium">Streak: {quizStreak}</span>
                </div>
              )}

              <div
                className="text-8xl font-bold text-white mx-auto leading-none"
                style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
              >
                {currentChar.char}
              </div>

              <div className="flex items-center justify-center gap-3">
                <span className="text-app-text-secondary text-sm font-mono">[{currentChar.romanization}]</span>
                <button
                  onClick={() => speakKorean(currentChar.char)}
                  className="w-8 h-8 flex items-center justify-center bg-white/8 hover:bg-white/15 rounded-full transition-all cursor-pointer"
                  title="Nghe phát âm"
                >
                  <i className="ri-volume-up-line text-white/50 text-sm"></i>
                </button>
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
                  currentChar.type === "vowel" ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
                  currentChar.type === "consonant" ? "bg-emerald-500/10 text-app-accent-success border-emerald-500/20" :
                  "bg-violet-500/10 text-violet-400 border-violet-500/20"
                }`}>
                  {currentChar.category}
                </span>
              </div>

              <div className="bg-app-card/50 rounded-xl p-3 text-left space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-pencil-line text-app-text-muted text-xs"></i>
                  </div>
                  <span className="text-app-text-secondary text-xs">Số nét: <span className="text-white/70">{currentChar.strokes}</span></span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-lightbulb-line text-amber-400/60 text-xs"></i>
                  </div>
                  <span className="text-white/50 text-xs leading-relaxed">{currentChar.tips}</span>
                </div>
              </div>

              {/* Navigation */}
              {mode === "practice" && (
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={prevChar}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary hover:text-white/60 text-xs transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line text-xs"></i>
                    Trước
                  </button>
                  <span className="text-app-text-muted text-xs">{currentIdx + 1} / {filtered.length}</span>
                  <button
                    onClick={nextChar}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary hover:text-white/60 text-xs transition-all cursor-pointer whitespace-nowrap"
                  >
                    Tiếp
                    <i className="ri-arrow-right-line text-xs"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Speech Recognition Panel */}
            <div className="bg-app-card/50 border border-app-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-mic-line text-rose-400 text-sm"></i>
                  </div>
                  <p className="text-white/70 text-sm font-medium">Kiểm tra phát âm</p>
                </div>
                <button
                  onClick={() => setShowSpeechPanel(!showSpeechPanel)}
                  className="text-app-text-muted hover:text-white/60 text-xs cursor-pointer whitespace-nowrap"
                >
                  {showSpeechPanel ? "Thu gọn" : "Mở rộng"}
                </button>
              </div>

              <p className="text-app-text-secondary text-xs">Viết xong rồi đọc to chữ <span className="text-white font-bold" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{currentChar.char}</span> để AI chấm phát âm</p>

              {/* Mic button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={isListening ? stopListening : startSpeechRecognition}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap border ${
                    isListening
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${isListening ? "ri-stop-circle-line" : "ri-mic-line"} text-sm`}></i>
                  </div>
                  {isListening ? "Đang nghe..." : "Đọc to"}
                </button>

                {speechRecords.length > 0 && (
                  <div className="text-xs text-app-text-muted">
                    {speechRecords.filter(r => r.char === currentChar.char && r.correct).length}/{speechRecords.filter(r => r.char === currentChar.char).length} đúng
                  </div>
                )}
              </div>

              {/* Speech result */}
              {speechResult && (
                <div className={`rounded-xl p-3 border ${speechResult.correct ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className={`text-sm ${speechResult.correct ? "ri-checkbox-circle-fill text-app-accent-success" : "ri-close-circle-fill text-red-400"}`}></i>
                    </div>
                    <span className={`text-sm font-bold ${speechResult.correct ? "text-app-accent-success" : "text-red-400"}`}>
                      {speechResult.correct ? `Chính xác! +${speechResult.xp} XP` : "Chưa đúng"}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs">
                    AI nghe được: <span className="text-white font-medium" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{speechResult.recognized || "(không rõ)"}</span>
                  </p>
                  {!speechResult.correct && (
                    <p className="text-app-text-muted text-xs mt-1">Hãy nghe mẫu rồi thử lại nhé!</p>
                  )}
                </div>
              )}

              {/* Speech error */}
              {speechError && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <p className="text-amber-400 text-xs">{speechError}</p>
                </div>
              )}

              {/* Speech history (expanded) */}
              {showSpeechPanel && speechRecords.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-app-border">
                  <p className="text-app-text-muted text-xs font-medium">Lịch sử phát âm gần đây</p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {speechRecords.slice(0, 10).map((r, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{r.char}</span>
                          <span className="text-app-text-muted text-xs">→ {r.recognized || "?"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 flex items-center justify-center">
                            <i className={`text-xs ${r.correct ? "ri-checkbox-circle-fill text-app-accent-success" : "ri-close-circle-fill text-red-400"}`}></i>
                          </div>
                          <span className="text-app-text-muted text-[10px]">{new Date(r.date).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent scores */}
            {scores.length > 0 && (
              <div className="bg-app-card/50 border border-app-border rounded-2xl p-4 space-y-2">
                <p className="text-app-text-secondary text-xs font-medium">Lịch sử viết gần đây</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {scores.slice(0, 8).map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{s.char}</span>
                        <span className="text-app-text-muted text-xs">{new Date(s.date).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <span className={`text-sm font-bold ${scoreColor(s.score)}`}>{s.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Canvas */}
          <div className="space-y-4">
            {/* Canvas controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                  showGuide
                    ? "bg-app-accent-primary/10 border-app-accent-primary/20 text-app-accent-primary"
                    : "bg-app-card/50 border-app-border text-app-text-secondary hover:text-white/60"
                }`}
              >
                <div className="w-3 h-3 flex items-center justify-center">
                  <i className="ri-eye-line text-xs"></i>
                </div>
                {showGuide ? "Ẩn mẫu" : "Hiện mẫu"}
              </button>
              <button
                onClick={clearCanvas}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-card/50 hover:bg-app-card/70 border border-app-border text-app-text-secondary hover:text-white/60 text-xs transition-all cursor-pointer whitespace-nowrap"
              >
                <div className="w-3 h-3 flex items-center justify-center">
                  <i className="ri-delete-bin-line text-xs"></i>
                </div>
                Xóa
              </button>
            </div>

            {/* Canvas area */}
            <div className="relative rounded-2xl overflow-hidden border border-app-border bg-[#0d0f18]" style={{ aspectRatio: "1" }}>
              {/* Guide canvas (background) */}
              <canvas
                ref={guideCanvasRef}
                width={400}
                height={400}
                className="absolute inset-0 w-full h-full"
              />
              {/* Drawing canvas (foreground) */}
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
              {strokes.length === 0 && !isDrawing && (
                <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
                  <p className="text-white/15 text-xs">Vẽ chữ vào đây</p>
                </div>
              )}
              {/* Listening overlay */}
              {isListening && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-rose-500/20 border-2 border-rose-500/50 animate-pulse mb-3">
                    <i className="ri-mic-fill text-rose-400 text-2xl"></i>
                  </div>
                  <p className="text-white text-sm font-medium">Đang nghe...</p>
                  <p className="text-white/50 text-xs mt-1">Đọc to: <span style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{currentChar.char}</span></p>
                  <button
                    onClick={stopListening}
                    className="mt-3 px-4 py-1.5 rounded-lg bg-app-card/70 text-white/60 text-xs cursor-pointer whitespace-nowrap"
                  >
                    Dừng
                  </button>
                </div>
              )}
            </div>

            {/* Self-scoring */}
            {strokes.length > 0 && !submitted && (
              <div className="bg-app-card/50 border border-app-border rounded-2xl p-4 space-y-3">
                <p className="text-white/60 text-sm font-medium text-center">Tự đánh giá bài viết của bạn</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { score: 90, label: "Xuất sắc", color: "bg-app-accent-success/15 border-emerald-500/30 text-app-accent-success" },
                    { score: 75, label: "Tốt", color: "bg-sky-500/15 border-sky-500/30 text-sky-400" },
                    { score: 55, label: "Được", color: "bg-amber-500/15 border-amber-500/30 text-amber-400" },
                    { score: 30, label: "Cần cải thiện", color: "bg-red-500/15 border-red-500/30 text-red-400" },
                  ].map(opt => (
                    <button
                      key={opt.score}
                      onClick={() => handleSelfScore(opt.score)}
                      className={`py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${opt.color}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {/* Quick speech check after writing */}
                <div className="flex items-center gap-2 pt-1 border-t border-app-border">
                  <button
                    onClick={isListening ? stopListening : startSpeechRecognition}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border flex-1 justify-center ${
                      isListening
                        ? "bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                    }`}
                  >
                    <div className="w-3 h-3 flex items-center justify-center">
                      <i className={`${isListening ? "ri-stop-circle-line" : "ri-mic-line"} text-xs`}></i>
                    </div>
                    {isListening ? "Đang nghe phát âm..." : "Đọc to để AI chấm phát âm"}
                  </button>
                </div>
              </div>
            )}

            {/* Result */}
            {submitted && selfScore !== null && (
              <div className={`border rounded-2xl p-4 space-y-3 ${
                selfScore >= 80 ? "bg-emerald-500/10 border-emerald-500/30" :
                selfScore >= 60 ? "bg-amber-500/10 border-amber-500/30" :
                "bg-red-500/10 border-red-500/30"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className={`text-lg ${selfScore >= 80 ? "ri-checkbox-circle-fill text-app-accent-success" : selfScore >= 60 ? "ri-error-warning-fill text-amber-400" : "ri-close-circle-fill text-red-400"}`}></i>
                    </div>
                    <span className={`font-bold text-sm ${selfScore >= 80 ? "text-app-accent-success" : selfScore >= 60 ? "text-amber-400" : "text-red-400"}`}>
                      {selfScore}% — {selfScore >= 80 ? "+15 XP" : selfScore >= 60 ? "+10 XP" : "+5 XP"}
                    </span>
                  </div>
                  <button
                    onClick={nextChar}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-card/70 hover:bg-white/15 text-white/60 text-xs transition-all cursor-pointer whitespace-nowrap"
                  >
                    Chữ tiếp
                    <i className="ri-arrow-right-line text-xs"></i>
                  </button>
                </div>
                <p className="text-white/50 text-xs">
                  {selfScore >= 80 ? "Tuyệt vời! Nét chữ rất đẹp và chính xác." :
                   selfScore >= 60 ? "Khá tốt! Tiếp tục luyện tập để hoàn thiện hơn." :
                   "Cần luyện thêm. Hãy xem lại mẫu và thử lại."}
                </p>
                {/* Speech check after scoring */}
                {!speechResult && (
                  <button
                    onClick={isListening ? stopListening : startSpeechRecognition}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                      isListening
                        ? "bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className={`${isListening ? "ri-stop-circle-line" : "ri-mic-line"} text-sm`}></i>
                    </div>
                    {isListening ? "Đang nghe phát âm..." : "Đọc to để AI chấm phát âm"}
                  </button>
                )}
                {speechResult && (
                  <div className={`rounded-xl p-2.5 border ${speechResult.correct ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                    <div className="flex items-center gap-1.5">
                      <i className={`text-sm ${speechResult.correct ? "ri-checkbox-circle-fill text-app-accent-success" : "ri-close-circle-fill text-red-400"}`}></i>
                      <span className={`text-xs font-bold ${speechResult.correct ? "text-app-accent-success" : "text-red-400"}`}>
                        Phát âm: {speechResult.correct ? `Đúng! +${speechResult.xp} XP` : "Chưa đúng"}
                      </span>
                      <span className="text-app-text-muted text-xs ml-auto">AI nghe: {speechResult.recognized || "?"}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Character grid */}
        <div className="bg-app-card/50 border border-app-border rounded-2xl p-5 space-y-3">
          <h2 className="text-white font-semibold text-sm">Danh sách ký tự ({filtered.length})</h2>
          <div className="flex flex-wrap gap-2">
            {filtered.map((c, i) => {
              const charScores = scores.filter(s => s.char === c.char);
              const best = charScores.length > 0 ? Math.max(...charScores.map(s => s.score)) : null;
              const charSpeech = speechRecords.filter(r => r.char === c.char);
              const speechOk = charSpeech.some(r => r.correct);
              const isActive = mode === "practice" ? i === currentIdx : i === quizIdx % filtered.length;
              return (
                <button
                  key={i}
                  onClick={() => { clearCanvas(); setSpeechResult(null); setSpeechError(null); if (mode === "practice") setCurrentIdx(i); else setQuizIdx(i); }}
                  className={`relative w-12 h-12 flex flex-col items-center justify-center rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-app-accent-primary/15 border-app-accent-primary/40 text-app-accent-primary"
                      : best !== null
                      ? best >= 80 ? "bg-emerald-500/10 border-emerald-500/20 text-white"
                        : best >= 60 ? "bg-amber-500/10 border-amber-500/20 text-white"
                        : "bg-red-500/10 border-red-500/20 text-white"
                      : "bg-app-card/50 border-app-border text-white/60 hover:text-white hover:border-white/20"
                  }`}
                  title={`${c.char} [${c.romanization}]`}
                >
                  <span className="text-lg leading-none" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{c.char}</span>
                  {best !== null && (
                    <span className={`text-[8px] font-bold ${best >= 80 ? "text-app-accent-success" : best >= 60 ? "text-amber-400" : "text-red-400"}`}>
                      {best}%
                    </span>
                  )}
                  {speechOk && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 flex items-center justify-center bg-rose-500 rounded-full">
                      <i className="ri-mic-fill text-white text-[6px]"></i>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-app-text-muted text-xs">Chấm đỏ = đã luyện phát âm đúng</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

