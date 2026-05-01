import { useState, useMemo } from "react";
import { MelonLessonResult } from "@/services/aiService";
import { MelonSong } from "@/mocks/melonSongs";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMelonSync } from "@/hooks/useMelonSync";
import { isSupabaseConfigured } from "@/lib/supabase";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function buildQuestions(result: MelonLessonResult): QuizQuestion[] {
  const qs: QuizQuestion[] = [];
  const vocab = result.vocabulary.slice(0, 8);

  // Q1–Q4: vocab meaning
  vocab.slice(0, 4).forEach((v, i) => {
    const wrongPool = vocab.filter((_, j) => j !== i).map((x) => x.meaning);
    const wrongs = wrongPool.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...wrongs, v.meaning].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(v.meaning);
    qs.push({
      question: `"${v.word}" có nghĩa là gì?`,
      options,
      correctIndex,
      explanation: `"${v.word}" = ${v.meaning}. ${v.example}`,
    });
  });

  // Q5: grammar fill-in — pick a sentence from explanation
  const lines = result.explanation
    .split("\n")
    .filter((l) => l.includes("예:") || l.includes("예 :"));
  if (lines.length > 0 && vocab.length >= 4) {
    const line = lines[0].replace(/^예\s*:\s*/, "").trim();
    const parts = line.split("—");
    const korean = parts[0]?.trim() || line;
    const meaning = parts[1]?.trim() || "Xem phân tích ngữ pháp";
    const correct = korean;
    const wrongs = vocab.slice(1, 4).map((v) => v.word);
    const options = [...wrongs, correct].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correct);
    qs.push({
      question: `Ví dụ ngữ pháp từ bài hát: "${meaning}" — câu tiếng Hàn nào đúng?`,
      options,
      correctIndex,
      explanation: `Đáp án: "${correct}" — ${meaning}`,
    });
  } else if (vocab.length >= 5) {
    // fallback Q5: usage example
    const v = vocab[4];
    const wrong = vocab.slice(0, 4).map((x) => x.word);
    const options = [...wrong.slice(0, 3), v.word].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(v.word);
    qs.push({
      question: `"${v.meaning}" — từ tiếng Hàn nào đúng?`,
      options,
      correctIndex,
      explanation: `"${v.word}" = ${v.meaning}`,
    });
  }

  return qs.slice(0, 5);
}

interface LyricsQuizModalProps {
  song: MelonSong;
  result: MelonLessonResult;
  onClose: () => void;
}

export default function LyricsQuizModal({ song, result, onClose }: LyricsQuizModalProps) {
  const { user } = useAuthContext();
  const { updateQuizScore } = useMelonSync();
  const questions = useMemo(() => buildQuestions(result), [result]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);

  const q = questions[current];
  const isAnswered = selected !== null;
  const score = answers.filter(Boolean).length;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelected(idx);
  };

  const handleNext = () => {
    if (selected === null) return;
    const correct = selected === q.correctIndex;
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);

    if (current + 1 >= questions.length) {
      setShowResult(true);
      // Save quiz score to localStorage
      const finalScore = newAnswers.filter(Boolean).length;
      try {
        const QUIZ_KEY = "melon_quiz_scores";
        const raw = localStorage.getItem(QUIZ_KEY);
        const scores = raw ? JSON.parse(raw) : [];
        const filtered = scores.filter((s: { rank: number }) => s.rank !== song.rank);
        filtered.push({ rank: song.rank, score: finalScore, total: questions.length, date: new Date().toISOString() });
        localStorage.setItem(QUIZ_KEY, JSON.stringify(filtered));
      } catch { /* ignore */ }
      // Sync to Supabase
      if (user && isSupabaseConfigured) {
        updateQuizScore(user.id, `melon-${song.rank}`, finalScore, questions.length);
      }
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setShowResult(false);
  };

  const getGrade = () => {
    if (score === 5) return { label: "Xuất sắc! 🏆", color: "text-[#e8c84a]" };
    if (score >= 4) return { label: "Rất tốt! 🎉", color: "text-green-400" };
    if (score >= 3) return { label: "Khá tốt 👍", color: "text-blue-400" };
    return { label: "Cần ôn thêm 📚", color: "text-orange-400" };
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-[#0f1117] sm:rounded-2xl rounded-t-2xl border border-white/8 flex flex-col max-h-[92vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/8 flex-shrink-0">
          <div className="w-9 h-9 flex items-center justify-center bg-[#e8c84a]/10 rounded-xl flex-shrink-0">
            <i className="ri-lightbulb-flash-line text-[#e8c84a] text-base" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Quiz — {song.title}</p>
            <p className="text-white/35 text-xs">{song.artist}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/40 hover:text-white cursor-pointer flex-shrink-0"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Result screen */}
          {showResult ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-[#e8c84a]/10 rounded-3xl mb-5">
                <span className="text-4xl">{score === 5 ? "🏆" : score >= 3 ? "🎉" : "📚"}</span>
              </div>
              <p className={`text-2xl font-bold mb-1 ${getGrade().color}`}>{getGrade().label}</p>
              <p className="text-white/50 text-sm mb-6">
                Bạn đúng <span className="text-white font-bold">{score}/{questions.length}</span> câu
              </p>

              {/* Answer review */}
              <div className="w-full space-y-2 mb-6">
                {questions.map((qq, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left ${
                      answers[i]
                        ? "border-green-500/20 bg-green-500/5"
                        : "border-red-500/20 bg-red-500/5"
                    }`}
                  >
                    <div className={`w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ${answers[i] ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      <i className={answers[i] ? "ri-check-line text-xs" : "ri-close-line text-xs"} />
                    </div>
                    <p className="text-white/60 text-xs truncate flex-1">{qq.question}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium cursor-pointer transition-colors whitespace-nowrap"
                >
                  <i className="ri-restart-line mr-1.5" />
                  Làm lại
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-[#e8c84a] hover:bg-[#e8c84a]/80 text-[#0f1117] text-sm font-bold cursor-pointer transition-colors whitespace-nowrap"
                >
                  Hoàn thành
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5">
              {/* Progress */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#e8c84a] rounded-full transition-all duration-500"
                    style={{ width: `${((current) / questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-white/30 text-xs whitespace-nowrap">
                  {current + 1}/{questions.length}
                </span>
              </div>

              {/* Question */}
              <div className="bg-white/3 rounded-2xl p-4 border border-white/5 mb-4">
                <p className="text-white/80 text-sm font-medium leading-relaxed">{q.question}</p>
              </div>

              {/* Options */}
              <div className="space-y-2.5 mb-5">
                {q.options.map((opt, idx) => {
                  let style = "border-white/8 bg-white/3 text-white/70 hover:border-white/20 hover:bg-white/5";
                  if (isAnswered) {
                    if (idx === q.correctIndex) {
                      style = "border-green-500/50 bg-green-500/10 text-green-300";
                    } else if (idx === selected && selected !== q.correctIndex) {
                      style = "border-red-500/40 bg-red-500/8 text-red-300";
                    } else {
                      style = "border-white/5 bg-white/2 text-white/30";
                    }
                  } else if (selected === idx) {
                    style = "border-[#e8c84a]/50 bg-[#e8c84a]/10 text-[#e8c84a]";
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer ${style}`}
                    >
                      <span className="w-5 h-5 flex items-center justify-center rounded-full border border-current text-xs flex-shrink-0 font-bold">
                        {["A", "B", "C", "D"][idx]}
                      </span>
                      <span className="text-sm leading-relaxed">{opt}</span>
                      {isAnswered && idx === q.correctIndex && (
                        <i className="ri-check-line ml-auto text-green-400" />
                      )}
                      {isAnswered && idx === selected && selected !== q.correctIndex && (
                        <i className="ri-close-line ml-auto text-red-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after answer */}
              {isAnswered && (
                <div className={`rounded-xl px-4 py-3 mb-4 border ${selected === q.correctIndex ? "bg-green-500/8 border-green-500/20" : "bg-orange-500/8 border-orange-500/20"}`}>
                  <p className="text-xs leading-relaxed text-white/60">{q.explanation}</p>
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isAnswered
                    ? "bg-[#e8c84a] hover:bg-[#e8c84a]/80 text-[#0f1117]"
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
              >
                {current + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp theo"}
                <i className="ri-arrow-right-line ml-1.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
