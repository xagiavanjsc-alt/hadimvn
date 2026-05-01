import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { seoulBooks, SeoulVocabItem } from "@/mocks/seoulTextbook";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface QuizQuestion {
  word: SeoulVocabItem;
  options: SeoulVocabItem[];
  correctIndex: number;
}

type QuizMode = "select-book" | "select-lesson" | "playing" | "result";

const LEVELS = ["1A","1B","2A","2B","3A","3B","4A","4B"] as const;

function generateQuestions(vocab: SeoulVocabItem[], count = 10): QuizQuestion[] {
  if (vocab.length < 4) return [];
  const shuffled = [...vocab].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  return selected.map(word => {
    const others = vocab.filter(v => v.korean !== word.korean).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...others, word].sort(() => Math.random() - 0.5);
    return { word, options, correctIndex: options.indexOf(word) };
  });
}

export default function SeoulListeningQuizPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<QuizMode>("select-book");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; chosen: number }[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [questionCount, setQuestionCount] = useState(10);
  const [wrongWords, setWrongWords] = useLocalStorage<string[]>("kts_seoul_wrong_words", []);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => { synthRef.current?.cancel(); };
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ko-KR";
    utter.rate = 0.85;
    utter.pitch = 1;
    setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synthRef.current.speak(utter);
  }, []);

  // Auto-play when question changes
  useEffect(() => {
    if (mode === "playing" && questions[currentIdx] && autoPlay) {
      const timer = setTimeout(() => speak(questions[currentIdx].word.korean), 500);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, mode, questions, autoPlay, speak]);

  const book = seoulBooks.find(b => b.id === selectedBook);
  const lesson = book?.lessons.find(l => l.id === selectedLesson);

  const startQuiz = () => {
    const vocab = lesson?.vocabulary || [];
    if (vocab.length < 4) return;
    const qs = generateQuestions(vocab, questionCount);
    setQuestions(qs);
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setAnswers([]);
    setMode("playing");
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === questions[currentIdx].correctIndex;
    if (correct) setScore(s => s + 1);
    else {
      const word = questions[currentIdx].word.korean;
      setWrongWords(prev => prev.includes(word) ? prev : [...prev, word]);
    }
    setAnswers(prev => [...prev, { correct, chosen: idx }]);
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) {
      setMode("result");
    } else {
      setCurrentIdx(i => i + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setMode("select-lesson");
    setSelectedLesson("");
    setQuestions([]);
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setAnswers([]);
  };

  const q = questions[currentIdx];
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 cursor-pointer">
            <i className="ri-arrow-left-line text-lg"></i>
          </button>
          <div>
            <h1 className="text-white font-bold text-xl">Nghe và nhận biết</h1>
            <p className="text-white/40 text-sm">Nghe phát âm từ vựng Seoul rồi chọn đúng từ</p>
          </div>
        </div>

        {/* Select Book */}
        {mode === "select-book" && (
          <div className="space-y-4">
            <div className="bg-white/3 border border-white/8 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">Chọn cuốn sách</h2>
              <div className="grid grid-cols-4 gap-3">
                {LEVELS.map(level => {
                  const b = seoulBooks.find(bk => bk.id === level);
                  if (!b) return null;
                  const hasVocab = b.lessons.some(l => l.vocabulary.length >= 4);
                  return (
                    <button
                      key={level}
                      onClick={() => { if (hasVocab) { setSelectedBook(level); setMode("select-lesson"); } }}
                      disabled={!hasVocab}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        hasVocab
                          ? "border-white/10 hover:border-white/20 hover:bg-white/5"
                          : "border-white/5 opacity-30 cursor-not-allowed"
                      }`}
                      style={{ borderColor: hasVocab ? b.color + "40" : undefined }}
                    >
                      <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: b.color + "20" }}>
                        <i className="ri-book-3-line text-sm" style={{ color: b.color }}></i>
                      </div>
                      <p className="text-white font-bold text-sm">{level}</p>
                      <p className="text-white/30 text-xs mt-0.5">{b.lessons.filter(l => l.vocabulary.length >= 4).length} bài</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <i className="ri-lightbulb-line text-[#e8c84a]"></i>
                </div>
                <div>
                  <p className="text-[#e8c84a] font-semibold text-sm mb-1">Cách luyện tập</p>
                  <ul className="text-white/50 text-xs space-y-1">
                    <li>• Nghe phát âm tiếng Hàn rồi chọn nghĩa tiếng Việt đúng</li>
                    <li>• Luyện tai nghe phân biệt âm thanh tiếng Hàn</li>
                    <li>• Từ sai sẽ được lưu vào danh sách ôn tập</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Select Lesson */}
        {mode === "select-lesson" && book && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => { setMode("select-book"); setSelectedBook(""); }} className="text-white/40 hover:text-white/70 cursor-pointer text-sm flex items-center gap-1">
                <i className="ri-arrow-left-s-line"></i> Chọn lại cuốn
              </button>
              <span className="text-white/20">/</span>
              <span className="font-bold text-sm" style={{ color: book.color }}>{book.name}</span>
            </div>

            {/* Settings */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center gap-6">
              <div>
                <p className="text-white/50 text-xs mb-1">Số câu hỏi</p>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map(n => (
                    <button key={n} onClick={() => setQuestionCount(n)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${questionCount === n ? "text-white" : "bg-white/5 text-white/40 hover:bg-white/8"}`}
                      style={questionCount === n ? { backgroundColor: book.color + "30", color: book.color } : {}}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">Tự động phát âm</p>
                <button onClick={() => setAutoPlay(a => !a)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${autoPlay ? "text-white" : "bg-white/5 text-white/40"}`}
                  style={autoPlay ? { backgroundColor: book.color + "20", color: book.color } : {}}>
                  <i className={autoPlay ? "ri-volume-up-line" : "ri-volume-mute-line"}></i>
                  {autoPlay ? "Bật" : "Tắt"}
                </button>
              </div>
            </div>

            <div className="bg-white/3 border border-white/8 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">Chọn bài học — {book.name}</h2>
              <div className="space-y-2">
                {book.lessons.filter(l => l.vocabulary.length >= 4).map(l => (
                  <button
                    key={l.id}
                    onClick={() => { setSelectedLesson(l.id); }}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      selectedLesson === l.id
                        ? "border-opacity-60"
                        : "border-white/8 hover:border-white/15 hover:bg-white/3"
                    }`}
                    style={selectedLesson === l.id ? { borderColor: book.color, backgroundColor: book.color + "10" } : {}}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: book.color + "20" }}>
                      <span className="text-xs font-bold" style={{ color: book.color }}>{l.lessonNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{l.title}</p>
                      <p className="text-white/40 text-xs truncate">{l.titleVi}</p>
                    </div>
                    <span className="text-white/30 text-xs flex-shrink-0">{l.vocabulary.length} từ</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedLesson && (
              <button
                onClick={startQuiz}
                className="w-full py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:opacity-90"
                style={{ backgroundColor: book.color, color: "#000" }}
              >
                <i className="ri-headphone-line mr-2"></i>
                Bắt đầu luyện nghe ({questionCount} câu)
              </button>
            )}
          </div>
        )}

        {/* Playing */}
        {mode === "playing" && q && book && (
          <div className="space-y-5">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((currentIdx) / questions.length) * 100}%`, backgroundColor: book.color }}></div>
              </div>
              <span className="text-white/40 text-xs whitespace-nowrap">{currentIdx + 1}/{questions.length}</span>
              <span className="text-xs font-bold" style={{ color: book.color }}>{score} đúng</span>
            </div>

            {/* Audio Card */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
              <p className="text-white/30 text-xs mb-4 uppercase tracking-widest">Nghe và chọn nghĩa đúng</p>

              {/* Big play button */}
              <button
                onClick={() => speak(q.word.korean)}
                disabled={speaking}
                className="w-24 h-24 rounded-full mx-auto flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 mb-4"
                style={{ backgroundColor: book.color + "20", border: `2px solid ${book.color}40` }}
              >
                {speaking ? (
                  <div className="flex gap-1 items-end h-8">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-1.5 rounded-full animate-bounce" style={{ backgroundColor: book.color, height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                  </div>
                ) : (
                  <i className="ri-volume-up-line text-4xl" style={{ color: book.color }}></i>
                )}
              </button>

              <p className="text-white/30 text-sm">Nhấn để nghe lại</p>

              {/* Show Korean after answering */}
              {selected !== null && (
                <div className="mt-4 p-3 rounded-xl bg-white/5">
                  <p className="text-white text-2xl font-bold">{q.word.korean}</p>
                  <p className="text-white/40 text-sm mt-1">{q.word.pronunciation}</p>
                  {q.word.example && (
                    <p className="text-white/30 text-xs mt-2 italic">{q.word.example}</p>
                  )}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt, idx) => {
                let cls = "border-white/10 hover:border-white/20 hover:bg-white/5 text-white/70";
                if (selected !== null) {
                  if (idx === q.correctIndex) cls = "border-emerald-500/60 bg-emerald-500/10 text-emerald-400";
                  else if (idx === selected && selected !== q.correctIndex) cls = "border-red-500/60 bg-red-500/10 text-red-400";
                  else cls = "border-white/5 text-white/30";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selected !== null}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${cls}`}
                  >
                    <p className="font-medium text-sm">{opt.vietnamese}</p>
                    {selected !== null && idx === q.correctIndex && (
                      <p className="text-emerald-400/60 text-xs mt-1">{opt.korean}</p>
                    )}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <button
                onClick={nextQuestion}
                className="w-full py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:opacity-90"
                style={{ backgroundColor: book.color, color: "#000" }}
              >
                {currentIdx + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp theo"}
                <i className="ri-arrow-right-line ml-2"></i>
              </button>
            )}
          </div>
        )}

        {/* Result */}
        {mode === "result" && book && (
          <div className="space-y-5">
            <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: book.color + "20" }}>
                <span className="text-3xl font-black" style={{ color: book.color }}>{pct}%</span>
              </div>
              <h2 className="text-white text-xl font-bold mb-1">
                {pct >= 80 ? "Xuất sắc!" : pct >= 60 ? "Tốt lắm!" : "Cần luyện thêm!"}
              </h2>
              <p className="text-white/40 text-sm">{score}/{questions.length} câu đúng</p>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-emerald-500/10 rounded-xl p-3">
                  <p className="text-emerald-400 text-xl font-bold">{score}</p>
                  <p className="text-white/40 text-xs">Đúng</p>
                </div>
                <div className="bg-red-500/10 rounded-xl p-3">
                  <p className="text-red-400 text-xl font-bold">{questions.length - score}</p>
                  <p className="text-white/40 text-xs">Sai</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white text-xl font-bold">{questions.length}</p>
                  <p className="text-white/40 text-xs">Tổng</p>
                </div>
              </div>
            </div>

            {/* Review wrong answers */}
            {answers.some(a => !a.correct) && (
              <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                <h3 className="text-white font-semibold text-sm mb-3">Từ cần ôn lại</h3>
                <div className="space-y-2">
                  {questions.map((q, i) => answers[i] && !answers[i].correct && (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-red-500/5">
                      <button onClick={() => speak(q.word.korean)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 cursor-pointer flex-shrink-0">
                        <i className="ri-volume-up-line text-red-400 text-sm"></i>
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{q.word.korean}</p>
                        <p className="text-white/40 text-xs">{q.word.vietnamese}</p>
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-red-400">Chọn: {q.options[answers[i].chosen]?.vietnamese}</p>
                        <p className="text-emerald-400">Đúng: {q.word.vietnamese}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={restart} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 text-sm cursor-pointer transition-all">
                <i className="ri-refresh-line mr-2"></i>Chọn bài khác
              </button>
              <button onClick={startQuiz} className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:opacity-90" style={{ backgroundColor: book.color, color: "#000" }}>
                <i className="ri-repeat-line mr-2"></i>Làm lại
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
