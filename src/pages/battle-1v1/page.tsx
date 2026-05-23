import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface VocabEntry {
  id: string;
  korean: string;
  vietnamese: string;
  category: string;
  difficulty: number;
}

interface Question {
  id: string;
  korean: string;
  correct: string;
  options: string[];
}

interface Player {
  name: string;
  avatar: string;
  level: string;
  score: number;
  streak: number;
  isBot: boolean;
}

type GameState = "lobby" | "matching" | "countdown" | "playing" | "result";

const BOT_NAMES = ["김민준", "이서연", "박지호", "최수아", "정도윤", "강하은", "윤태양", "임나연"];
const BOT_LEVELS = ["A1", "A2", "B1", "B2", "C1"];
const BOT_AVATARS = [
  "/images/brand/logo.svg",
  "/images/brand/logo.svg",
  "/images/brand/logo.svg"
];

const TOTAL_QUESTIONS = 10;
const QUESTION_TIME = 15;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Battle1v1Page() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("lobby");
  const [vocab, setVocab] = useState<VocabEntry[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [countdown, setCountdown] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [player, setPlayer] = useState<Player>({ name: "Bạn", avatar: "", level: "B1", score: 0, streak: 0, isBot: false });
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [playerAnswers, setPlayerAnswers] = useState<boolean[]>([]);
  const [opponentAnswers, setOpponentAnswers] = useState<boolean[]>([]);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [opponentCorrect, setOpponentCorrect] = useState<boolean | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    supabase
      .from("hanja_vocab_entries")
      .select("id, korean, vietnamese, category, difficulty")
      .limit(200)
      .then(({ data }) => {
        if (data) setVocab(data as VocabEntry[]);
      });
  }, []);

  const buildQuestions = useCallback((pool: VocabEntry[]): Question[] => {
    const diffMap = { easy: 1, medium: 2, hard: 3 };
    const filtered = pool.filter(v => v.difficulty <= diffMap[difficulty]);
    const selected = shuffleArray(filtered).slice(0, TOTAL_QUESTIONS);
    return selected.map(v => {
      const wrongs = shuffleArray(pool.filter(w => w.id !== v.id)).slice(0, 3).map(w => w.vietnamese);
      return {
        id: v.id,
        korean: v.korean,
        correct: v.vietnamese,
        options: shuffleArray([v.vietnamese, ...wrongs]),
      };
    });
  }, [difficulty]);

  const startMatching = () => {
    setGameState("matching");
    setMatchingProgress(0);
    const interval = setInterval(() => {
      setMatchingProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
          const botLevel = BOT_LEVELS[Math.floor(Math.random() * BOT_LEVELS.length)];
          const botAvatar = BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)];
          setOpponent({ name: botName, avatar: botAvatar, level: botLevel, score: 0, streak: 0, isBot: true });
          setGameState("countdown");
          startCountdown();
          return 100;
        }
        return p + 5;
      });
    }, 100);
  };

  const startCountdown = () => {
    let c = 3;
    setCountdown(c);
    const interval = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(interval);
        const qs = buildQuestions(vocab);
        setQuestions(qs);
        setCurrentQ(0);
        setPlayerAnswers([]);
        setOpponentAnswers([]);
        setPlayer(p => ({ ...p, score: 0, streak: 0 }));
        setOpponent(op => op ? { ...op, score: 0, streak: 0 } : op);
        setGameState("playing");
        startTimer();
      }
    }, 1000);
  };

  const startTimer = () => {
    setTimeLeft(QUESTION_TIME);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    setSelectedAnswer("__timeout__");
    setIsCorrect(false);
    setPlayerAnswers(prev => [...prev, false]);
    simulateOpponent(false);
    setTimeout(() => nextQuestion(), 1500);
  };

  const simulateOpponent = (playerCorrect: boolean) => {
    const botDelay = Math.random() * 4000 + 1000;
    const botCorrectChance = difficulty === "easy" ? 0.6 : difficulty === "medium" ? 0.75 : 0.85;
    const botCorrect = Math.random() < botCorrectChance;
    setTimeout(() => {
      setOpponentAnswered(true);
      setOpponentCorrect(botCorrect);
      setOpponentAnswers(prev => [...prev, botCorrect]);
      setOpponent(op => {
        if (!op) return op;
        const newStreak = botCorrect ? op.streak + 1 : 0;
        const bonus = newStreak >= 3 ? 20 : 0;
        return { ...op, score: op.score + (botCorrect ? 100 + bonus : 0), streak: newStreak };
      });
    }, botDelay);
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const correct = answer === questions[currentQ]?.correct;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setPlayerAnswers(prev => [...prev, correct]);
    setPlayer(p => {
      const newStreak = correct ? p.streak + 1 : 0;
      const bonus = newStreak >= 3 ? 20 : 0;
      const timeBonus = Math.floor(timeLeft * 5);
      return { ...p, score: p.score + (correct ? 100 + bonus + timeBonus : 0), streak: newStreak };
    });
    simulateOpponent(correct);
    setTimeout(() => nextQuestion(), 1500);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setOpponentAnswered(false);
    setOpponentCorrect(null);
    setCurrentQ(prev => {
      const next = prev + 1;
      if (next >= TOTAL_QUESTIONS) {
        setGameState("result");
        return prev;
      }
      startTimer();
      return next;
    });
  };

  const resetGame = () => {
    setGameState("lobby");
    setCurrentQ(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setOpponent(null);
    setPlayerAnswers([]);
    setOpponentAnswers([]);
    setOpponentAnswered(false);
    setOpponentCorrect(null);
    setPlayer(p => ({ ...p, score: 0, streak: 0 }));
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const playerWon = player.score > (opponent?.score ?? 0);
  const isDraw = player.score === (opponent?.score ?? 0);

  const timerPercent = (timeLeft / QUESTION_TIME) * 100;
  const timerColor = timeLeft > 8 ? "bg-emerald-400" : timeLeft > 4 ? "bg-amber-400" : "bg-rose-400";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-app-bg p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-rose-500/10 rounded-xl border border-rose-500/20">
              <i className="ri-sword-line text-rose-400 text-xl"></i>
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">Thi đấu 1v1</h1>
              <p className="text-app-text-secondary text-sm">Đấu quiz realtime với đối thủ ngẫu nhiên</p>
            </div>
          </div>

          {/* Lobby */}
          {gameState === "lobby" && (
            <div className="space-y-6">
              {/* Player card */}
              <div className="bg-app-surface/50 border border-app-border rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <i className="ri-user-line text-app-accent-primary"></i>
                  Thông tin của bạn
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-app-accent-primary/20 border-2 border-app-accent-primary/30 flex items-center justify-center">
                    <i className="ri-user-3-line text-app-accent-primary text-2xl"></i>
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{player.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">{player.level}</span>
                      <span className="text-app-text-secondary text-xs">
                        <i className="ri-fire-line text-orange-400 mr-1"></i>
                        Sẵn sàng chiến đấu
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div className="bg-app-surface/50 border border-app-border rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <i className="ri-settings-3-line text-white/50"></i>
                  Độ khó
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    { key: "easy", label: "Dễ", desc: "Từ A1-A2", color: "emerald" },
                    { key: "medium", label: "Trung bình", desc: "Từ A1-B1", color: "amber" },
                    { key: "hard", label: "Khó", desc: "Từ A1-C1", color: "rose" },
                  ] as const).map(d => (
                    <button
                      key={d.key}
                      onClick={() => setDifficulty(d.key)}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        difficulty === d.key
                          ? `border-${d.color}-500/50 bg-${d.color}-500/10`
                          : "border-app-border bg-white/2 hover:border-white/20"
                      }`}
                    >
                      <p className={`font-semibold text-sm ${difficulty === d.key ? `text-${d.color}-400` : "text-white/60"}`}>{d.label}</p>
                      <p className="text-app-text-muted text-xs mt-1">{d.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: "ri-question-line", label: "Số câu hỏi", value: `${TOTAL_QUESTIONS} câu` },
                  { icon: "ri-timer-line", label: "Thời gian/câu", value: `${QUESTION_TIME}s` },
                  { icon: "ri-trophy-line", label: "Điểm tối đa", value: "1,500+" },
                ].map((s, i) => (
                  <div key={i} className="bg-app-surface/50 border border-app-border rounded-xl p-4 text-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-app-card/50 rounded-lg mx-auto mb-2">
                      <i className={`${s.icon} text-white/50`}></i>
                    </div>
                    <p className="text-white font-bold">{s.value}</p>
                    <p className="text-app-text-secondary text-xs">{s.label}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={startMatching}
                disabled={vocab.length === 0}
                className="w-full py-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-lg transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-3"
              >
                <i className="ri-sword-line text-xl"></i>
                Tìm đối thủ ngay
              </button>
            </div>
          )}

          {/* Matching */}
          {gameState === "matching" && (
            <div className="flex flex-col items-center justify-center py-20 space-y-8">
              <div className="flex items-center gap-12">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-app-accent-primary/20 border-2 border-app-accent-primary/40 flex items-center justify-center mx-auto mb-3">
                    <i className="ri-user-3-line text-app-accent-primary text-3xl"></i>
                  </div>
                  <p className="text-white font-bold">{player.name}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{player.level}</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                    <i className="ri-sword-line text-rose-400 text-xl animate-pulse"></i>
                  </div>
                  <p className="text-app-text-secondary text-xs mt-2">VS</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-app-card/50 border-2 border-app-border flex items-center justify-center mx-auto mb-3 animate-pulse">
                    <i className="ri-question-mark text-app-text-muted text-3xl"></i>
                  </div>
                  <p className="text-app-text-secondary font-bold">Đang tìm...</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-app-card/50 text-app-text-muted">???</span>
                </div>
              </div>
              <div className="w-80">
                <div className="flex justify-between text-xs text-app-text-secondary mb-2">
                  <span>Đang ghép cặp</span>
                  <span>{matchingProgress}%</span>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-100"
                    style={{ width: `${matchingProgress}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-app-text-secondary text-sm animate-pulse">Đang tìm đối thủ phù hợp...</p>
            </div>
          )}

          {/* Countdown */}
          {gameState === "countdown" && opponent && (
            <div className="flex flex-col items-center justify-center py-16 space-y-8">
              <div className="flex items-center gap-12">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-app-accent-primary/20 border-2 border-app-accent-primary/40 flex items-center justify-center mx-auto mb-3">
                    <i className="ri-user-3-line text-app-accent-primary text-3xl"></i>
                  </div>
                  <p className="text-white font-bold">{player.name}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{player.level}</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center">
                    <span className="text-rose-400 text-2xl font-bold">{countdown}</span>
                  </div>
                  <p className="text-app-text-secondary text-xs mt-2">VS</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-app-card/50 border-2 border-white/15 overflow-hidden mx-auto mb-3">
                    <img loading="lazy" decoding="async" src={opponent.avatar} alt={opponent.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-white font-bold">{opponent.name}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-app-card/70 text-white/50">{opponent.level}</span>
                </div>
              </div>
              <p className="text-white/60 text-lg font-semibold">Trận đấu bắt đầu sau {countdown}...</p>
            </div>
          )}

          {/* Playing */}
          {gameState === "playing" && questions[currentQ] && opponent && (
            <div className="space-y-4">
              {/* Scoreboard */}
              <div className="bg-app-surface/50 border border-app-border rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-app-accent-primary/20 border border-app-accent-primary/30 flex items-center justify-center">
                      <i className="ri-user-3-line text-app-accent-primary"></i>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{player.name}</p>
                      <p className="text-app-accent-primary font-black text-xl">{player.score}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-lg ${
                      timeLeft > 8 ? "border-emerald-400 text-app-accent-success" : timeLeft > 4 ? "border-amber-400 text-amber-400" : "border-rose-400 text-rose-400 animate-pulse"
                    }`}>
                      {timeLeft}
                    </div>
                    <p className="text-app-text-muted text-xs mt-1">{currentQ + 1}/{TOTAL_QUESTIONS}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-app-card/50 border border-white/15 overflow-hidden">
                      <img loading="lazy" decoding="async" src={opponent.avatar} alt={opponent.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">{opponent.name}</p>
                      <p className="text-rose-400 font-black text-xl">{opponent.score}</p>
                    </div>
                  </div>
                </div>
                {/* Timer bar */}
                <div className="mt-3 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
                    style={{ width: `${timerPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Answer indicators */}
              <div className="flex gap-1.5 justify-center">
                {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      i < playerAnswers.length
                        ? playerAnswers[i] ? "bg-emerald-400" : "bg-rose-400"
                        : i === currentQ ? "bg-app-accent-primary animate-pulse" : "bg-app-card/70"
                    }`}
                  ></div>
                ))}
              </div>

              {/* Question */}
              <div className="bg-app-surface/50 border border-app-border rounded-2xl p-8 text-center">
                <p className="text-app-text-secondary text-sm mb-3">Từ này có nghĩa là gì?</p>
                <p className="text-white text-5xl font-black mb-2">{questions[currentQ].korean}</p>
                {player.streak >= 3 && (
                  <div className="inline-flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1 text-orange-400 text-xs mt-2">
                    <i className="ri-fire-line"></i>
                    Chuỗi {player.streak} câu đúng! +20 điểm bonus
                  </div>
                )}
              </div>

              {/* Opponent status */}
              {opponentAnswered && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${
                  opponentCorrect ? "bg-emerald-500/10 border border-emerald-500/20 text-app-accent-success" : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                }`}>
                  <i className={opponentCorrect ? "ri-check-line" : "ri-close-line"}></i>
                  <span>{opponent.name} đã trả lời {opponentCorrect ? "đúng" : "sai"}!</span>
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {questions[currentQ].options.map((opt, i) => {
                  const isSelected = selectedAnswer === opt;
                  const isCorrectOpt = opt === questions[currentQ].correct;
                  let cls = "border-app-border bg-app-surface/50 hover:border-white/25 hover:bg-white/6 text-white/70";
                  if (selectedAnswer !== null) {
                    if (isCorrectOpt) cls = "border-emerald-500/50 bg-emerald-500/10 text-app-accent-success";
                    else if (isSelected && !isCorrectOpt) cls = "border-rose-500/50 bg-rose-500/10 text-rose-400";
                    else cls = "border-app-border bg-white/2 text-app-text-muted";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt)}
                      disabled={selectedAnswer !== null}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${cls} ${selectedAnswer === null ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {["A", "B", "C", "D"][i]}
                        </span>
                        <span className="text-sm font-medium">{opt}</span>
                        {selectedAnswer !== null && isCorrectOpt && (
                          <i className="ri-check-line text-app-accent-success ml-auto"></i>
                        )}
                        {isSelected && !isCorrectOpt && (
                          <i className="ri-close-line text-rose-400 ml-auto"></i>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Result */}
          {gameState === "result" && opponent && (
            <div className="space-y-6">
              {/* Winner banner */}
              <div className={`rounded-2xl p-8 text-center border ${
                isDraw
                  ? "bg-amber-500/10 border-amber-500/30"
                  : playerWon
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-rose-500/10 border-rose-500/30"
              }`}>
                <div className="text-6xl mb-4">
                  {isDraw ? "🤝" : playerWon ? "🏆" : "😔"}
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${
                  isDraw ? "text-amber-400" : playerWon ? "text-app-accent-success" : "text-rose-400"
                }`}>
                  {isDraw ? "Hòa!" : playerWon ? "Chiến thắng!" : "Thua rồi!"}
                </h2>
                <p className="text-white/50 text-sm">
                  {isDraw ? "Hai bên ngang tài ngang sức!" : playerWon ? "Xuất sắc! Bạn đã đánh bại đối thủ!" : "Cố gắng hơn lần sau nhé!"}
                </p>
              </div>

              {/* Score comparison */}
              <div className="bg-app-surface/50 border border-app-border rounded-2xl p-6">
                <div className="flex items-center justify-around">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-app-accent-primary/20 border-2 border-app-accent-primary/40 flex items-center justify-center mx-auto mb-3">
                      <i className="ri-user-3-line text-app-accent-primary text-2xl"></i>
                    </div>
                    <p className="text-white font-bold">{player.name}</p>
                    <p className="text-app-accent-primary text-2xl font-bold">{player.score}</p>
                    <p className="text-app-text-secondary text-xs">{playerAnswers.filter(Boolean).length}/{TOTAL_QUESTIONS} đúng</p>
                  </div>
                  <div className="text-center">
                    <p className="text-app-text-muted text-xl font-bold">VS</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-app-card/50 border-2 border-white/15 overflow-hidden mx-auto mb-3">
                      <img loading="lazy" decoding="async" src={opponent.avatar} alt={opponent.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-white font-bold">{opponent.name}</p>
                    <p className="text-rose-400 text-2xl font-bold">{opponent.score}</p>
                    <p className="text-app-text-secondary text-xs">{opponentAnswers.filter(Boolean).length}/{TOTAL_QUESTIONS} đúng</p>
                  </div>
                </div>
              </div>

              {/* Answer breakdown */}
              <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-4 text-sm">Chi tiết từng câu</h3>
                <div className="space-y-2">
                  {questions.map((q, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-app-text-muted text-xs w-5">{i + 1}.</span>
                      <span className="text-white/70 text-sm font-medium w-20">{q.korean}</span>
                      <span className="text-app-text-secondary text-xs flex-1 truncate">{q.correct}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          playerAnswers[i] ? "bg-emerald-500/20" : "bg-rose-500/20"
                        }`}>
                          <i className={`text-xs ${playerAnswers[i] ? "ri-check-line text-app-accent-success" : "ri-close-line text-rose-400"}`}></i>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          opponentAnswers[i] ? "bg-emerald-500/20" : "bg-rose-500/20"
                        }`}>
                          <i className={`text-xs ${opponentAnswers[i] ? "ri-check-line text-app-accent-success" : "ri-close-line text-rose-400"}`}></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-app-border text-xs text-app-text-muted">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-app-accent-primary/20 flex items-center justify-center">
                      <i className="ri-user-3-line text-app-accent-primary text-[8px]"></i>
                    </div>
                    Bạn
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-app-card/70 overflow-hidden">
                      <img loading="lazy" decoding="async" src={opponent.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    {opponent.name}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={resetGame}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-all cursor-pointer whitespace-nowrap text-sm"
                >
                  <i className="ri-refresh-line mr-2"></i>
                  Chơi lại
                </button>
                <button
                  onClick={() => navigate("/vocab-suggestion")}
                  className="flex-1 py-3 rounded-xl bg-app-accent-primary text-black font-semibold hover:bg-[#f0d060] transition-all cursor-pointer whitespace-nowrap text-sm"
                >
                  <i className="ri-robot-line mr-2"></i>
                  Ôn từ hay sai
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}



