import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { DE1_QUESTIONS, DE1_INFO, type De1Question } from "@/data/eps_de1";

// ─── TTS Hook ────────────────────────────────────────────────────────────────
function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ko-KR";
    utter.rate = 0.88;
    utter.pitch = 1;
    // prefer a Korean voice if available
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find((v) => v.lang.startsWith("ko"));
    if (koVoice) utter.voice = koVoice;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => { setSpeaking(false); onEnd?.(); };
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, [supported]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, supported };
}

// ─── Audio Button ─────────────────────────────────────────────────────────────
function AudioBtn({ script, onSpeak }: { script: string; onSpeak: (s: string) => void }) {
  return (
    <button
      onClick={() => onSpeak(script)}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors cursor-pointer"
    >
      <i className="ri-volume-up-line text-base"></i>
      Nghe
    </button>
  );
}

// ─── Image Placeholder ────────────────────────────────────────────────────────
const IMG_COLORS = [
  "bg-rose-50 border-rose-200 text-rose-600",
  "bg-sky-50 border-sky-200 text-sky-600",
  "bg-emerald-50 border-emerald-200 text-emerald-600",
  "bg-amber-50 border-amber-200 text-amber-600",
];

function ImgPlaceholder({ label, index, selected }: { label: string; index: number; selected: boolean }) {
  const color = IMG_COLORS[index % 4];
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 h-20 gap-1 transition-all ${
        selected ? "ring-2 ring-offset-1 ring-app-accent-primary border-app-accent-primary bg-app-accent-primary/10" : `${color}`
      }`}
    >
      <i className="ri-image-line text-xl opacity-50"></i>
      <span className="text-[11px] font-medium text-center px-1 leading-tight">{label}</span>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────
interface QuestionCardProps {
  q: De1Question;
  answer: number | null;
  onAnswer: (idx: number) => void;
  showResult?: boolean;
  tts: ReturnType<typeof useTTS>;
}

function QuestionCard({ q, answer, onAnswer, showResult, tts }: QuestionCardProps) {
  const [played, setPlayed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSpeak = () => {
    if (!q.audioScript) return;
    tts.speak(q.audioScript, () => setPlayed(true));
  };

  const isListening = q.section === "listening";
  const isImageOpts = q.optionType === "image";

  return (
    <div className="space-y-4">
      {/* Section badge */}
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isListening ? "bg-sky-100 text-sky-600" : "bg-violet-100 text-violet-600"
        }`}>
          {isListening ? "듣기 NGHE" : "읽기 ĐỌC"}
        </span>
        <span className="text-gray-400 text-xs">Câu {q.id} / {DE1_INFO.totalQuestions}</span>
      </div>

      {/* Prompt */}
      <p className="text-gray-700 font-semibold text-sm leading-relaxed">{q.prompt}</p>

      {/* Content / passage */}
      {q.content && (
        <div className={`rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap border ${
          isListening ? "bg-sky-50 border-sky-200 text-sky-800" : "bg-gray-50 border-gray-200 text-gray-700"
        }`}>
          {q.content}
        </div>
      )}

      {/* Content image (sign, chart, ticket, scene...) */}
      {q.contentImage && (
        <div className="flex justify-center">
          <img
            src={q.contentImage}
            alt=""
            className="max-h-52 rounded-xl border border-gray-200 object-contain shadow-sm"
          />
        </div>
      )}

      {/* Audio controls (listening only) */}
      {isListening && q.audioScript && (
        <div className="flex items-center gap-3 flex-wrap">
          <AudioBtn script={q.audioScript} onSpeak={handleSpeak} />
          {tts.speaking && (
            <button onClick={tts.stop} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer flex items-center gap-1">
              <i className="ri-stop-circle-line"></i> Dừng
            </button>
          )}
          {played && (
            <span className="text-xs text-emerald-600 flex items-center gap-1">
              <i className="ri-checkbox-circle-line"></i> Đã nghe
            </span>
          )}
          <button
            onClick={() => setShowHint(!showHint)}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 cursor-pointer flex items-center gap-1"
          >
            <i className="ri-question-line"></i>
            {showHint ? "Ẩn gợi ý" : "Gợi ý"}
          </button>
        </div>
      )}

      {/* Audio hint */}
      {showHint && q.audioHint && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700">
          <i className="ri-lightbulb-line mr-1"></i>{q.audioHint}
        </div>
      )}

      {/* Script reveal after play (exam mode: hidden until played) */}
      {showResult && q.audioScript && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 text-xs text-sky-700">
          <span className="font-semibold">Script nghe:</span> {q.audioScript}
        </div>
      )}

      {/* Options */}
      {isImageOpts ? (
        <div className="grid grid-cols-2 gap-2.5">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => !showResult && onAnswer(i)}
              className={`relative cursor-pointer rounded-xl border-2 transition-all overflow-hidden ${
                showResult
                  ? i === q.correct
                    ? "border-emerald-400 ring-2 ring-emerald-300"
                    : answer === i && i !== q.correct
                    ? "border-rose-400 ring-2 ring-rose-300"
                    : "border-gray-200"
                  : answer === i
                  ? "border-app-accent-primary ring-2 ring-app-accent-primary/30"
                  : "border-gray-200 hover:border-app-accent-primary/40"
              }`}
            >
              {/* Number header */}
              <div className={`px-3 py-1 text-xs font-bold border-b flex items-center gap-1.5 ${
                showResult && i === q.correct
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : showResult && answer === i && i !== q.correct
                  ? "bg-rose-100 text-rose-600 border-rose-200"
                  : answer === i
                  ? "bg-app-accent-primary/10 text-app-accent-primary border-app-accent-primary/20"
                  : "bg-gray-50 text-gray-500 border-gray-100"
              }`}>
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-bold ${
                  answer === i ? "bg-app-accent-primary text-white" : "bg-gray-200 text-gray-600"
                }`}>{i + 1}</span>
                <span className="truncate">{opt}</span>
              </div>
              {q.optionImages?.[i] ? (
                <img
                  src={q.optionImages[i]}
                  alt={opt}
                  className="w-full h-28 object-contain bg-white p-2"
                />
              ) : (
                <ImgPlaceholder label="" index={i} selected={answer === i} />
              )}
              {showResult && i === q.correct && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <i className="ri-check-line text-white text-[9px]"></i>
                </div>
              )}
              {showResult && answer === i && i !== q.correct && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
                  <i className="ri-close-line text-white text-[9px]"></i>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const isCorrect = showResult && i === q.correct;
            const isWrong = showResult && answer === i && i !== q.correct;
            return (
              <button
                key={i}
                onClick={() => !showResult && onAnswer(i)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all cursor-pointer text-sm ${
                  isCorrect
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : isWrong
                    ? "bg-rose-50 border-rose-300 text-rose-700"
                    : answer === i
                    ? "bg-app-accent-primary/10 border-app-accent-primary/40 text-gray-800"
                    : "bg-white border-gray-200 text-gray-600 hover:border-app-accent-primary/30 hover:bg-app-accent-primary/5"
                }`}
              >
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                  isCorrect ? "bg-emerald-500 text-white" :
                  isWrong ? "bg-rose-400 text-white" :
                  answer === i ? "bg-app-accent-primary text-app-bg" : "bg-gray-100 text-gray-500"
                }`}>
                  {isCorrect ? <i className="ri-check-line" /> : isWrong ? <i className="ri-close-line" /> : ["①","②","③","④"][i]}
                </span>
                <span className="leading-relaxed">{opt}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({
  answers,
  onRetry,
  onReview,
}: {
  answers: (number | null)[];
  onRetry: () => void;
  onReview: () => void;
}) {
  const total = DE1_QUESTIONS.length;
  const correct = DE1_QUESTIONS.filter((q, i) => answers[i] === q.correct).length;
  const readingCorrect = DE1_QUESTIONS.filter((q, i) => q.section === "reading" && answers[i] === q.correct).length;
  const listeningCorrect = DE1_QUESTIONS.filter((q, i) => q.section === "listening" && answers[i] === q.correct).length;
  const score = Math.round((correct / total) * 200); // EPS scale 0-200
  const passed = score >= 80;
  const pct = Math.round((correct / total) * 100);

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {/* Score card */}
      <div className={`rounded-2xl p-6 text-center mb-6 ${passed ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"}`}>
        <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center mx-auto mb-3 border-4 ${passed ? "border-emerald-400 bg-emerald-100" : "border-rose-300 bg-rose-100"}`}>
          <span className={`text-3xl font-extrabold leading-none ${passed ? "text-emerald-600" : "text-rose-500"}`}>{pct}%</span>
          <span className="text-[10px] text-gray-500 mt-0.5">điểm</span>
        </div>
        <h2 className={`text-xl font-bold mb-1 ${passed ? "text-emerald-700" : "text-rose-600"}`}>
          {passed ? "ĐẬU! Xuất sắc 🎉" : "Chưa đạt — Cố lên!"}
        </h2>
        <p className="text-gray-500 text-sm">{correct}/{total} câu đúng</p>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Đọc hiểu", value: `${readingCorrect}/20`, color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
          { label: "Nghe hiểu", value: `${listeningCorrect}/20`, color: "text-sky-600", bg: "bg-sky-50 border-sky-200" },
          { label: "Tổng đúng", value: `${correct}/40`, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} border rounded-xl p-3 text-center`}>
            <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Wrong questions list */}
      {(() => {
        const wrong = DE1_QUESTIONS.filter((q, i) => answers[i] !== q.correct);
        if (!wrong.length) return null;
        return (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6">
            <p className="text-rose-700 font-semibold text-sm mb-2">
              <i className="ri-error-warning-line mr-1"></i>Câu làm sai ({wrong.length} câu)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {wrong.map((q) => (
                <span key={q.id} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border ${
                  q.section === "listening" ? "bg-sky-50 border-sky-200 text-sky-600" : "bg-violet-50 border-violet-200 text-violet-600"
                }`}>
                  {q.id}
                </span>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="flex gap-3">
        <button onClick={onReview} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold cursor-pointer">
          <i className="ri-eye-line mr-1.5"></i>Xem lại
        </button>
        <button onClick={onRetry} className="flex-1 py-3 bg-app-accent-primary text-app-bg rounded-xl text-sm font-bold cursor-pointer">
          <i className="ri-restart-line mr-1.5"></i>Thi lại
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Phase = "exam" | "result" | "review";

export default function EpsDe1ExamPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("exam");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(DE1_QUESTIONS.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(DE1_INFO.timeMinutes * 60);
  const tts = useTTS();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (phase !== "exam") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setPhase("result");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const timerColor = timeLeft < 300 ? "text-rose-500" : timeLeft < 600 ? "text-amber-500" : "text-emerald-600";

  const q = DE1_QUESTIONS[currentIdx];
  const answered = answers.filter((a) => a !== null).length;

  const selectAnswer = (idx: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIdx] = idx;
      return next;
    });
  };

  const submit = () => {
    tts.stop();
    setPhase("result");
  };

  // Section dividers for nav
  const navSections = [
    { label: "ĐỌC 1-20", start: 0, end: 19, color: "text-violet-600" },
    { label: "NGHE 21-40", start: 20, end: 39, color: "text-sky-600" },
  ];

  if (phase === "result") {
    return (
      <DashboardLayout title="Kết quả — Đề số 01">
        <ResultScreen
          answers={answers}
          onRetry={() => {
            setAnswers(new Array(DE1_QUESTIONS.length).fill(null));
            setCurrentIdx(0);
            setTimeLeft(DE1_INFO.timeMinutes * 60);
            setPhase("exam");
          }}
          onReview={() => { setCurrentIdx(0); setPhase("review"); }}
        />
      </DashboardLayout>
    );
  }

  const isReview = phase === "review";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f4f6fb]">
      {/* ── Top bar ── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => { tts.stop(); navigate(-1); }}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm cursor-pointer whitespace-nowrap"
        >
          <i className="ri-arrow-left-line"></i>
          Thoát
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-gray-700 font-bold text-sm truncate">ĐỀ SỐ 01 — EPS-TOPIK</p>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-app-accent-primary rounded-full transition-all"
              style={{ width: `${((currentIdx + 1) / DE1_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {!isReview && (
          <div className={`flex items-center gap-1 font-mono font-bold text-sm ${timerColor} whitespace-nowrap`}>
            <i className="ri-timer-line"></i>
            {formatTime(timeLeft)}
          </div>
        )}

        <span className="text-gray-400 text-xs whitespace-nowrap">
          {isReview ? `Xem lại` : `${answered}/${DE1_QUESTIONS.length}`}
        </span>

        {!isReview && (
          <button
            onClick={submit}
            className="px-3 py-1.5 bg-app-accent-primary text-app-bg rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap"
          >
            Nộp bài
          </button>
        )}
        {isReview && (
          <button
            onClick={() => setPhase("result")}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            Kết quả
          </button>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <QuestionCard
            q={q}
            answer={answers[currentIdx]}
            onAnswer={selectAnswer}
            showResult={isReview}
            tts={tts}
          />
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3 space-y-2">
        {/* Section quick-jump */}
        <div className="flex gap-2">
          {navSections.map((s) => (
            <button
              key={s.label}
              onClick={() => setCurrentIdx(s.start)}
              className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                currentIdx >= s.start && currentIdx <= s.end
                  ? "bg-app-accent-primary/15 border-app-accent-primary/30 text-app-accent-primary"
                  : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Question number dots */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-xl text-gray-600 text-sm disabled:opacity-40 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-line"></i>
          </button>

          <div className="flex-1 flex gap-1 overflow-x-auto py-0.5 scrollbar-hide">
            {DE1_QUESTIONS.map((dq, i) => {
              const isAnswered = answers[i] !== null;
              const isCurrent = i === currentIdx;
              const isWrong = isReview && answers[i] !== dq.correct;
              const isRight = isReview && answers[i] === dq.correct;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-6 h-6 flex-shrink-0 rounded text-[9px] font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-app-accent-primary text-app-bg"
                      : isRight
                      ? "bg-emerald-400 text-white"
                      : isWrong
                      ? "bg-rose-400 text-white"
                      : isAnswered
                      ? dq.section === "listening"
                        ? "bg-sky-100 text-sky-600"
                        : "bg-violet-100 text-violet-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              currentIdx === DE1_QUESTIONS.length - 1 && !isReview
                ? submit()
                : setCurrentIdx((p) => Math.min(DE1_QUESTIONS.length - 1, p + 1))
            }
            className="flex items-center gap-1 px-3 py-2 bg-app-accent-primary text-app-bg rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap"
          >
            {currentIdx === DE1_QUESTIONS.length - 1 && !isReview ? (
              "Nộp"
            ) : (
              <i className="ri-arrow-right-line"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
