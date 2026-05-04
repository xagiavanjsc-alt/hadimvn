import { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";

interface VocabWord {
  id: number;
  word: string;
  meaning: string;
  romanization?: string;
}

type GameType = "menu" | "guess" | "match" | "fill";

// ─── Fallback vocab ───────────────────────────────────────────────────────────
const FALLBACK_VOCAB: VocabWord[] = [
  { id: 1, word: "사랑", meaning: "Tình yêu", romanization: "sa-rang" },
  { id: 2, word: "행복", meaning: "Hạnh phúc", romanization: "haeng-bok" },
  { id: 3, word: "친구", meaning: "Bạn bè", romanization: "chin-gu" },
  { id: 4, word: "학교", meaning: "Trường học", romanization: "hak-gyo" },
  { id: 5, word: "음식", meaning: "Thức ăn", romanization: "eum-sik" },
  { id: 6, word: "여행", meaning: "Du lịch", romanization: "yeo-haeng" },
  { id: 7, word: "음악", meaning: "Âm nhạc", romanization: "eum-ak" },
  { id: 8, word: "영화", meaning: "Phim ảnh", romanization: "yeong-hwa" },
  { id: 9, word: "가족", meaning: "Gia đình", romanization: "ga-jok" },
  { id: 10, word: "시간", meaning: "Thời gian", romanization: "si-gan" },
  { id: 11, word: "공부", meaning: "Học tập", romanization: "gong-bu" },
  { id: 12, word: "날씨", meaning: "Thời tiết", romanization: "nal-ssi" },
  { id: 13, word: "바다", meaning: "Biển", romanization: "ba-da" },
  { id: 14, word: "꽃", meaning: "Hoa", romanization: "kkot" },
  { id: 15, word: "하늘", meaning: "Bầu trời", romanization: "ha-neul" },
  { id: 16, word: "물", meaning: "Nước", romanization: "mul" },
  { id: 17, word: "불", meaning: "Lửa", romanization: "bul" },
  { id: 18, word: "산", meaning: "Núi", romanization: "san" },
  { id: 19, word: "강", meaning: "Sông", romanization: "gang" },
  { id: 20, word: "나무", meaning: "Cây", romanization: "na-mu" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── Game 1: Đoán từ (Multiple choice) ───────────────────────────────────────
interface GuessGameProps {
  vocab: VocabWord[];
  onBack: () => void;
}

function GuessGame({ vocab, onBack }: GuessGameProps) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [choices, setChoices] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const questions = vocab.slice(0, 15);
  const current = questions[index];

  const generateChoices = useCallback((word: VocabWord) => {
    const wrong = shuffle(vocab.filter(v => v.id !== word.id)).slice(0, 3).map(v => v.meaning);
    return shuffle([word.meaning, ...wrong]);
  }, [vocab]);

  useEffect(() => {
    if (current) setChoices(generateChoices(current));
  }, [index, current, generateChoices]);

  useEffect(() => {
    if (showResult || gameOver) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [index, showResult, gameOver]);

  const handleAnswer = (ans: string | null) => {
    clearInterval(timerRef.current!);
    setSelected(ans);
    setShowResult(true);
    const correct = ans === current.meaning;
    if (correct) {
      setScore(s => s + (timeLeft > 10 ? 15 : timeLeft > 5 ? 10 : 5));
      setStreak(s => {
        const ns = s + 1;
        setMaxStreak(m => Math.max(m, ns));
        return ns;
      });
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setGameOver(true);
    } else {
      setIndex(i => i + 1);
      setSelected(null);
      setShowResult(false);
      setTimeLeft(15);
    }
  };

  if (gameOver) {
    const pct = Math.round((score / (questions.length * 15)) * 100);
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <div className="text-6xl mb-4">{pct >= 80 ? "🏆" : pct >= 60 ? "🎉" : "💪"}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Kết quả</h2>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 space-y-3">
          <div className="flex justify-between"><span className="text-gray-500">Điểm số</span><span className="font-bold text-amber-500 text-xl">{score}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Streak cao nhất</span><span className="font-bold text-rose-500">{maxStreak} 🔥</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Tỷ lệ đúng</span><span className="font-bold text-emerald-500">{pct}%</span></div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={onBack} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap">Về menu</button>
          <button onClick={() => { setIndex(0); setScore(0); setStreak(0); setMaxStreak(0); setSelected(null); setShowResult(false); setGameOver(false); setTimeLeft(15); }} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap">Chơi lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">{index + 1}/{questions.length}</span>
        <div className="flex items-center gap-3">
          {streak >= 2 && <span className="text-sm font-bold text-rose-500">{streak} 🔥</span>}
          <span className="text-sm font-bold text-amber-500">{score} điểm</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${((index) / questions.length) * 100}%` }}></div>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center mb-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black border-4 transition-colors ${
          timeLeft > 8 ? "border-emerald-400 text-emerald-500" : timeLeft > 4 ? "border-amber-400 text-amber-500" : "border-rose-400 text-rose-500 animate-pulse"
        }`}>
          {timeLeft}
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-4">
        <p className="text-xs text-gray-400 mb-2">Từ này có nghĩa là gì?</p>
        <p className="text-5xl font-black text-gray-900 mb-2">{current?.word}</p>
        {current?.romanization && <p className="text-sm text-gray-400">{current.romanization}</p>}
      </div>

      {/* Choices */}
      <div className="grid grid-cols-2 gap-3">
        {choices.map((c, i) => {
          let cls = "bg-white border-gray-100 text-gray-700 hover:border-amber-300 hover:bg-amber-50";
          if (showResult) {
            if (c === current.meaning) cls = "bg-emerald-50 border-emerald-400 text-emerald-700";
            else if (c === selected) cls = "bg-rose-50 border-rose-400 text-rose-700";
            else cls = "bg-gray-50 border-gray-100 text-gray-400";
          }
          return (
            <button
              key={i}
              onClick={() => !showResult && handleAnswer(c)}
              disabled={showResult}
              className={`p-4 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer text-left ${cls}`}
            >
              <span className="text-xs text-gray-400 mr-2">{["A", "B", "C", "D"][i]}.</span>
              {c}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className="mt-4 text-center">
          <p className={`text-sm font-semibold mb-3 ${selected === current.meaning ? "text-emerald-600" : "text-rose-600"}`}>
            {selected === current.meaning ? "✓ Chính xác!" : `✗ Đáp án đúng: ${current.meaning}`}
          </p>
          <button onClick={next} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap">
            {index + 1 >= questions.length ? "Xem kết quả" : "Tiếp theo →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Game 2: Nối từ (Matching) ────────────────────────────────────────────────
interface MatchGameProps {
  vocab: VocabWord[];
  onBack: () => void;
}

function MatchGame({ vocab, onBack }: MatchGameProps) {
  const pairs = shuffle(vocab).slice(0, 8);
  const [leftItems] = useState(shuffle(pairs));
  const [rightItems] = useState(shuffle(pairs));
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<{ left: number; right: number } | null>(null);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (gameOver) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [gameOver, startTime]);

  useEffect(() => {
    if (selectedLeft !== null && selectedRight !== null) {
      setMoves(m => m + 1);
      const leftWord = leftItems[selectedLeft];
      const rightWord = rightItems[selectedRight];
      if (leftWord.id === rightWord.id) {
        const newMatched = new Set(matched);
        newMatched.add(leftWord.id);
        setMatched(newMatched);
        setSelectedLeft(null);
        setSelectedRight(null);
        if (newMatched.size === pairs.length) setGameOver(true);
      } else {
        setWrong({ left: selectedLeft, right: selectedRight });
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setWrong(null);
        }, 800);
      }
    }
  }, [selectedLeft, selectedRight]);

  const score = Math.max(0, 1000 - moves * 20 - elapsed * 2);

  if (gameOver) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Hoàn thành!</h2>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 space-y-3">
          <div className="flex justify-between"><span className="text-gray-500">Điểm số</span><span className="font-bold text-amber-500 text-xl">{score}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Số lần thử</span><span className="font-bold text-gray-700">{moves}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Thời gian</span><span className="font-bold text-sky-500">{elapsed}s</span></div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={onBack} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap">Về menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">Đã nối: {matched.size}/{pairs.length}</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500"><i className="ri-time-line mr-1"></i>{elapsed}s</span>
          <span className="text-sm text-gray-500">Lần thử: {moves}</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-sky-400 rounded-full transition-all" style={{ width: `${(matched.size / pairs.length) * 100}%` }}></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Left: Korean */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 tracking-normal text-center mb-3">Tiếng Hàn</p>
          {leftItems.map((item, i) => {
            const isMatched = matched.has(item.id);
            const isSelected = selectedLeft === i;
            const isWrong = wrong?.left === i;
            return (
              <button
                key={item.id}
                onClick={() => !isMatched && setSelectedLeft(i)}
                disabled={isMatched}
                className={`w-full p-3 rounded-xl border-2 text-center font-bold text-lg transition-all cursor-pointer ${
                  isMatched ? "bg-emerald-50 border-emerald-300 text-emerald-600 opacity-60" :
                  isWrong ? "bg-rose-50 border-rose-400 text-rose-600 animate-pulse" :
                  isSelected ? "bg-sky-50 border-sky-400 text-sky-700 scale-105" :
                  "bg-white border-gray-100 text-gray-800 hover:border-sky-300 hover:bg-sky-50"
                }`}
              >
                {item.word}
              </button>
            );
          })}
        </div>
        {/* Right: Vietnamese */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 tracking-normal text-center mb-3">Tiếng Việt</p>
          {rightItems.map((item, i) => {
            const isMatched = matched.has(item.id);
            const isSelected = selectedRight === i;
            const isWrong = wrong?.right === i;
            return (
              <button
                key={item.id}
                onClick={() => !isMatched && setSelectedRight(i)}
                disabled={isMatched}
                className={`w-full p-3 rounded-xl border-2 text-center text-sm font-medium transition-all cursor-pointer ${
                  isMatched ? "bg-emerald-50 border-emerald-300 text-emerald-600 opacity-60" :
                  isWrong ? "bg-rose-50 border-rose-400 text-rose-600 animate-pulse" :
                  isSelected ? "bg-amber-50 border-amber-400 text-amber-700 scale-105" :
                  "bg-white border-gray-100 text-gray-700 hover:border-amber-300 hover:bg-amber-50"
                }`}
              >
                {item.meaning}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Game 3: Điền chữ trống ───────────────────────────────────────────────────
interface FillGameProps {
  vocab: VocabWord[];
  onBack: () => void;
}

function FillGame({ vocab, onBack }: FillGameProps) {
  const questions = shuffle(vocab).slice(0, 12);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = questions[index];

  // Create fill-in sentence: replace one character with blank
  const getBlankWord = (word: string) => {
    if (word.length <= 1) return { display: "_", blankIndex: 0 };
    const blankIndex = Math.floor(word.length / 2);
    const display = word.split("").map((c, i) => i === blankIndex ? "_" : c).join("");
    return { display, blankIndex };
  };

  const { display, blankIndex } = getBlankWord(current?.word || "");
  const expectedChar = current?.word[blankIndex] || "";

  useEffect(() => {
    if (!submitted) inputRef.current?.focus();
  }, [index, submitted]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setSubmitted(true);
    const isCorrect = input.trim() === expectedChar;
    if (isCorrect) {
      setScore(s => s + 10);
      setCorrect(c => c + 1);
    }
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setGameOver(true);
    } else {
      setIndex(i => i + 1);
      setInput("");
      setSubmitted(false);
    }
  };

  if (gameOver) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <div className="text-6xl mb-4">{pct >= 80 ? "✍️" : "📝"}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Kết quả</h2>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 space-y-3">
          <div className="flex justify-between"><span className="text-gray-500">Điểm số</span><span className="font-bold text-amber-500 text-xl">{score}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Đúng</span><span className="font-bold text-emerald-500">{correct}/{questions.length}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Tỷ lệ</span><span className="font-bold text-sky-500">{pct}%</span></div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={onBack} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap">Về menu</button>
          <button onClick={() => { setIndex(0); setInput(""); setSubmitted(false); setScore(0); setCorrect(0); setGameOver(false); }} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap">Chơi lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">{index + 1}/{questions.length}</span>
        <span className="text-sm font-bold text-amber-500">{score} điểm</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${(index / questions.length) * 100}%` }}></div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-6">
        <p className="text-xs text-gray-400 mb-3">Điền ký tự còn thiếu</p>
        <p className="text-sm text-gray-500 mb-4">Nghĩa: <span className="font-semibold text-gray-700">{current?.meaning}</span></p>
        <div className="flex items-center justify-center gap-2 mb-2">
          {current?.word.split("").map((char, i) => (
            <div
              key={i}
              className={`w-14 h-14 flex items-center justify-center rounded-xl text-xl font-bold border-2 ${
                i === blankIndex
                  ? submitted
                    ? input === expectedChar
                      ? "bg-emerald-50 border-emerald-400 text-emerald-600"
                      : "bg-rose-50 border-rose-400 text-rose-600"
                    : "bg-amber-50 border-amber-300 border-dashed text-amber-400"
                  : "bg-gray-50 border-gray-100 text-gray-800"
              }`}
            >
              {i === blankIndex ? (submitted ? (input === expectedChar ? input : <span className="text-rose-500">{input || "?"}</span>) : "?") : char}
            </div>
          ))}
        </div>
        {submitted && input !== expectedChar && (
          <p className="text-sm text-emerald-600 mt-2">Đáp án đúng: <span className="font-bold">{expectedChar}</span></p>
        )}
      </div>

      {!submitted ? (
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="Nhập ký tự còn thiếu..."
            maxLength={2}
            className="flex-1 bg-white border-2 border-gray-200 focus:border-emerald-400 rounded-xl px-4 py-3 text-center text-xl font-bold focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-semibold cursor-pointer whitespace-nowrap transition-colors"
          >
            Kiểm tra
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className={`text-sm font-semibold mb-3 ${input === expectedChar ? "text-emerald-600" : "text-rose-600"}`}>
            {input === expectedChar ? "✓ Chính xác!" : "✗ Sai rồi!"}
          </p>
          <button onClick={next} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap">
            {index + 1 >= questions.length ? "Xem kết quả" : "Tiếp theo →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function VocabGamesPage() {
  const [game, setGame] = useState<GameType>("menu");
  const [vocab, setVocab] = useState<VocabWord[]>(FALLBACK_VOCAB);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from("topik_vocabulary")
          .select("id, word, meaning, romanization")
          .limit(100);
        if (data && data.length >= 10) {
          setVocab(shuffle(data));
        }
      } catch { /* use fallback */ }
      setLoading(false);
    };
    load();
  }, []);

  const GAMES = [
    {
      id: "guess" as GameType,
      title: "Đoán từ",
      icon: "ri-question-line",
      color: "text-amber-500",
      bg: "bg-amber-50",
      border: "border-amber-200",
      badge: "bg-amber-500",
      desc: "Chọn nghĩa đúng của từ tiếng Hàn trong 15 giây",
      features: ["15 câu hỏi", "Đếm ngược thời gian", "Streak bonus", "4 lựa chọn"],
    },
    {
      id: "match" as GameType,
      title: "Nối từ",
      icon: "ri-links-line",
      color: "text-sky-500",
      bg: "bg-sky-50",
      border: "border-sky-200",
      badge: "bg-sky-500",
      desc: "Nối từ tiếng Hàn với nghĩa tiếng Việt tương ứng",
      features: ["8 cặp từ", "Tính thời gian", "Đếm số lần thử", "Điểm cao nhất"],
    },
    {
      id: "fill" as GameType,
      title: "Điền chữ trống",
      icon: "ri-edit-box-line",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      badge: "bg-emerald-500",
      desc: "Điền ký tự còn thiếu vào từ tiếng Hàn dựa trên gợi ý nghĩa",
      features: ["12 câu hỏi", "Gợi ý nghĩa", "Luyện viết", "Nhận biết ký tự"],
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <i className="ri-loader-4-line animate-spin text-3xl text-amber-400"></i>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8f7f4] p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 flex items-center justify-center bg-amber-500/10 rounded-xl">
              <i className="ri-gamepad-line text-amber-500 text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Trò chơi từ vựng
              </h1>
              <p className="text-gray-500 text-sm">Học từ vựng qua game — vui vẻ và hiệu quả</p>
            </div>
          </div>
        </div>

        {game === "menu" ? (
          <div>
            {/* Game cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
              {GAMES.map(g => (
                <button
                  key={g.id}
                  onClick={() => setGame(g.id)}
                  className={`text-left p-6 rounded-2xl border-2 ${g.bg} ${g.border} hover:shadow-md transition-all cursor-pointer group`}
                >
                  <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${g.badge} text-white mb-4`}>
                    <i className={`${g.icon} text-2xl`}></i>
                  </div>
                  <h3 className={`text-lg font-bold ${g.color} mb-2`}>{g.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">{g.desc}</p>
                  <div className="space-y-1">
                    {g.features.map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <i className={`ri-check-line text-xs ${g.color}`}></i>
                        <span className="text-xs text-gray-500">{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-4 flex items-center gap-1 ${g.color} text-sm font-semibold group-hover:gap-2 transition-all`}>
                    Chơi ngay <i className="ri-arrow-right-line"></i>
                  </div>
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Từ vựng trong game</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Tổng từ vựng", value: vocab.length + "+", icon: "ri-translate-2", color: "text-amber-500" },
                  { label: "Từ ngẫu nhiên", value: "Mỗi lần", icon: "ri-shuffle-line", color: "text-sky-500" },
                  { label: "Chế độ chơi", value: "3 game", icon: "ri-gamepad-line", color: "text-emerald-500" },
                  { label: "Không cần mạng", value: "Offline", icon: "ri-wifi-off-line", color: "text-violet-500" },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className={`w-8 h-8 flex items-center justify-center mx-auto mb-2 ${s.color}`}>
                      <i className={`${s.icon} text-xl`}></i>
                    </div>
                    <p className="text-lg font-bold text-gray-800">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Back button */}
            <button
              onClick={() => setGame("menu")}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 cursor-pointer whitespace-nowrap text-sm mb-6"
            >
              <i className="ri-arrow-left-line"></i>
              Về menu game
            </button>

            {/* Game title */}
            <div className="text-center mb-6">
              {GAMES.filter(g => g.id === game).map(g => (
                <div key={g.id}>
                  <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${g.badge} text-white mx-auto mb-3`}>
                    <i className={`${g.icon} text-2xl`}></i>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{g.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{g.desc}</p>
                </div>
              ))}
            </div>

            {game === "guess" && <GuessGame vocab={vocab} onBack={() => setGame("menu")} />}
            {game === "match" && <MatchGame vocab={vocab} onBack={() => setGame("menu")} />}
            {game === "fill" && <FillGame vocab={vocab} onBack={() => setGame("menu")} />}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

