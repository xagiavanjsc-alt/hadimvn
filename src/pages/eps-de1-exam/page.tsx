import { useState, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { DE1_QUESTIONS, DE1_INFO, DE1_EXPLANATIONS, type De1Question } from "@/data/eps_de1";
import { useXPSystem } from "@/hooks/useXPSystem";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

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
  const [playingOptIdx, setPlayingOptIdx] = useState<number | null>(null);

  const handleSpeak = () => {
    if (!q.audioScript) return;
    tts.speak(q.audioScript, () => setPlayed(true));
  };

  const handleSpeakOption = (i: number) => {
    if (!q.audioOptions?.[i]) return;
    setPlayingOptIdx(i);
    tts.speak(q.audioOptions[i], () => setPlayingOptIdx(null));
  };

  const isListening = q.section === "listening";
  const isImageOpts = q.optionType === "image";
  const isAudioOpts = !!q.audioOptions?.length;

  return (
    <div className="space-y-4">
      {/* Section badge */}
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isListening ? "bg-sky-500/15 text-sky-400" : "bg-violet-500/15 text-violet-400"
        }`}>
          {isListening ? "듣기 NGHE" : "읽기 ĐỌC"}
        </span>
        <span className="text-gray-400 text-xs">Câu {q.id} / {DE1_INFO.totalQuestions}</span>
      </div>

      {/* Prompt */}
      <p className="text-white/90 font-semibold text-sm leading-relaxed">{q.prompt}</p>

      {/* Content / passage */}
      {q.content && (
        <div className={`rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap border ${
          isListening ? "bg-sky-500/10 border-sky-500/20 text-sky-200" : "bg-app-card/60 border-app-border text-white/75"
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

      {/* Explanation (review mode only) */}
      {showResult && DE1_EXPLANATIONS[q.id] && (
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 text-xs text-violet-300 leading-relaxed">
          <span className="font-bold text-violet-400 mr-1"><i className="ri-lightbulb-flash-line"></i> Giải thích:</span>
          {DE1_EXPLANATIONS[q.id]}
        </div>
      )}

      {/* Audio hint */}
      {showHint && q.audioHint && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 text-xs text-amber-300">
          <i className="ri-lightbulb-line mr-1"></i>{q.audioHint}
        </div>
      )}

      {/* Script reveal after play (exam mode: hidden until played) */}
      {showResult && q.audioScript && (
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-2.5 text-xs text-sky-300">
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
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                  : showResult && answer === i && i !== q.correct
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/20"
                  : answer === i
                  ? "bg-app-accent-primary/10 text-app-accent-primary border-app-accent-primary/20"
                  : "bg-app-card/60 text-app-text-muted border-app-border"
              }`}>
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-bold ${
                  answer === i ? "bg-app-accent-primary text-app-bg" : "bg-app-card text-app-text-muted"
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
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : isWrong
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    : answer === i
                    ? "bg-app-accent-primary/10 border-app-accent-primary/40 text-white"
                    : "bg-app-card/50 border-app-border text-white/75 hover:border-app-accent-primary/30 hover:bg-app-accent-primary/5"
                }`}
              >
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0 ${
                  isCorrect ? "bg-emerald-500 text-white" :
                  isWrong ? "bg-rose-400 text-white" :
                  answer === i ? "bg-app-accent-primary text-app-bg" : "bg-app-card text-app-text-muted"
                }`}>
                  {isCorrect ? <i className="ri-check-line" /> : isWrong ? <i className="ri-close-line" /> : i + 1}
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
const FEEDBACK_BANDS = [
  { min: 90, label: "Xuất sắc! 🏆", comment: "Bạn nắm vững hầu hết từ vựng và ngữ pháp EPS. Tiếp tục duy trì!", color: "emerald" },
  { min: 70, label: "Giỏi! 👍", comment: "Kết quả tốt. Ôn lại các câu sai để cải thiện thêm.", color: "sky" },
  { min: 40, label: "Đạt 👌", comment: "Bạn đã vượt ngưỡng đậu EPS. Luyện tập thêm phần nghe để nâng điểm.", color: "amber" },
  { min: 0,  label: "Cố lên! 💪", comment: "Hãy ôn lại từ vựng và ngữ pháp cơ bản, rồi thi lại nhé.", color: "rose" },
];

function ResultScreen({
  answers,
  xpEarned,
  onRetry,
  onReview,
}: {
  answers: (number | null)[];
  xpEarned: number;
  onRetry: () => void;
  onReview: () => void;
}) {
  const total = DE1_QUESTIONS.length;
  const correct = DE1_QUESTIONS.filter((q, i) => answers[i] === q.correct).length;
  const readingCorrect = DE1_QUESTIONS.filter((q, i) => q.section === "reading" && answers[i] === q.correct).length;
  const listeningCorrect = DE1_QUESTIONS.filter((q, i) => q.section === "listening" && answers[i] === q.correct).length;
  const pct = Math.round((correct / total) * 100);
  const passed = pct >= 40;
  const band = FEEDBACK_BANDS.find(b => pct >= b.min) || FEEDBACK_BANDS[FEEDBACK_BANDS.length - 1];
  const bandColors: Record<string, { bg: string; border: string; text: string; ring: string }> = {
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", ring: "border-emerald-400" },
    sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     ring: "border-sky-400" },
    amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   ring: "border-amber-400" },
    rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-600",    ring: "border-rose-300" },
  };
  const c = bandColors[band.color];

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {/* Score card */}
      <div className={`rounded-2xl p-6 text-center mb-4 ${c.bg} border ${c.border}`}>
        <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center mx-auto mb-3 border-4 ${c.ring} ${c.bg}`}>
          <span className={`text-3xl font-extrabold leading-none ${c.text}`}>{pct}%</span>
          <span className="text-[10px] text-gray-500 mt-0.5">{correct}/{total}</span>
        </div>
        <h2 className={`text-xl font-bold mb-1 ${c.text}`}>{band.label}</h2>
        <p className="text-gray-500 text-sm leading-relaxed">{band.comment}</p>
      </div>

      {/* XP earned */}
      {xpEarned > 0 && (
        <div className="flex items-center justify-center gap-2 mb-4 bg-amber-50 border border-amber-200 rounded-xl py-2.5">
          <i className="ri-sparkling-2-fill text-amber-500 text-lg"></i>
          <span className="text-amber-700 font-bold text-sm">+{xpEarned} XP nhận được!</span>
        </div>
      )}

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

// ─── Intro Screen ─────────────────────────────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <DashboardLayout title="Đề số 01 — EPS-TOPIK" subtitle="40 câu · 50 phút · Audio TTS">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-app-accent-primary/10 mx-auto mb-4">
            <i className="ri-headphone-line text-app-accent-primary text-3xl"></i>
          </div>
          <h2 className="text-white text-xl font-bold mb-1">ĐỀ SỐ 01</h2>
          <p className="text-app-text-secondary text-sm">EPS-TOPIK — 한국어능력시험 (Lao động)</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "ri-time-line",       label: "Thời gian",  value: "50 phút",   color: "#eab308" },
            { icon: "ri-question-line",   label: "Số câu",     value: "40 câu",    color: "#4ade80" },
            { icon: "ri-book-open-line",  label: "Phần Đọc",   value: "20 câu",    color: "#a78bfa" },
            { icon: "ri-headphone-line",  label: "Phần Nghe",  value: "20 câu",    color: "#38bdf8" },
          ].map(info => (
            <div key={info.label} className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${info.color}15` }}>
                <i className={`${info.icon} text-base`} style={{ color: info.color }}></i>
              </div>
              <div>
                <p className="text-app-text-secondary text-[10px]">{info.label}</p>
                <p className="text-white font-bold text-sm">{info.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <p className="text-white/50 text-sm font-semibold mb-3">Lưu ý trước khi thi</p>
          <ul className="space-y-2">
            {[
              "Mỗi câu có 4 lựa chọn, chỉ 1 đáp án đúng",
              "Phần Đọc (câu 1-20): đọc đoạn văn và chọn đáp án",
              "Phần Nghe (câu 21-40): bấm nút Nghe để phát âm thanh TTS",
              "Có thể chuyển qua lại bất kỳ câu bằng thanh số bên dưới",
              "Kết quả phân tích chi tiết sau khi nộp bài",
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-app-text-secondary text-xs">
                <i className="ri-checkbox-blank-circle-fill text-app-accent-primary/40 text-[6px] mt-1.5 flex-shrink-0"></i>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-black text-lg transition-colors cursor-pointer"
        >
          <i className="ri-play-fill mr-2"></i>Bắt đầu thi
        </button>
      </div>
    </DashboardLayout>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Phase = "intro" | "exam" | "result" | "review";

export default function EpsDe1ExamPage() {
  usePageSEO({
    title: "Đề thi EPS-TOPIK 2025 Đề 1 [Có Đáp Án + Audio] | Hàn Quốc Ơi!",
    description: "Đề thi EPS-TOPIK 2025 chính thức Đề 1. Đầy đủ 40 câu nghe + đọc, có audio luyện nghe, đáp án và giải thích chi tiết. Miễn phí 100%.",
    keywords: "đề thi EPS 2025 đề 1, đề EPS có đáp án, đề EPS audio, luyện thi EPS-TOPIK, đề thi XKLĐ Hàn Quốc",
    ogType: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: "Đề thi EPS-TOPIK 2025 - Đề 1",
      description: "Đề thi EPS-TOPIK 2025 chính thức có đáp án và audio luyện nghe.",
      educationalLevel: "EPS-TOPIK",
      learningResourceType: "Practice Exam",
      inLanguage: ["ko", "vi"],
      timeRequired: `PT${DE1_INFO.timeMinutes}M`,
      numberOfQuestions: DE1_QUESTIONS.length,
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(DE1_QUESTIONS.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(DE1_INFO.timeMinutes * 60);
  const [xpEarned, setXpEarned] = useState(0);
  const tts = useTTS();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { awardXP } = useXPSystem();

  const TOTAL = DE1_INFO.timeMinutes * 60;
  const readingQs  = DE1_QUESTIONS.filter(q => q.section === "reading");
  const listeningQs = DE1_QUESTIONS.filter(q => q.section === "listening");
  const currentSection = currentIdx < 20 ? "reading" : "listening";

  // Timer
  useEffect(() => {
    if (phase !== "exam") { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); setPhase("result"); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const timePct = (timeLeft / TOTAL) * 100;
  const isDanger = timeLeft < 180;
  const isWarning = timeLeft < 600;

  const answered = answers.filter(a => a !== null).length;
  const readingAnswered  = answers.slice(0, 20).filter(a => a !== null).length;
  const listeningAnswered = answers.slice(20).filter(a => a !== null).length;

  const selectAnswer = (idx: number) => {
    setAnswers(prev => { const next = [...prev]; next[currentIdx] = idx; return next; });
  };

  const submit = () => {
    tts.stop();
    const correctCount = DE1_QUESTIONS.filter((q, i) => answers[i] === q.correct).length;
    const xp = 20 + correctCount * 5;
    setXpEarned(xp);
    awardXP({ type: "eps_exam_completed" });
    DE1_QUESTIONS.forEach((q, i) => { if (answers[i] === q.correct) awardXP({ type: "eps_question_correct" }); });
    setPhase("result");
  };

  const handleRetry = () => {
    setAnswers(new Array(DE1_QUESTIONS.length).fill(null));
    setCurrentIdx(0);
    setTimeLeft(TOTAL);
    setPhase("intro");
  };

  // ── Intro ──
  if (phase === "intro") return <IntroScreen onStart={() => setPhase("exam")} />;

  // ── Result ──
  if (phase === "result") {
    return (
      <DashboardLayout title="Kết quả — Đề số 01">
        <ResultScreen answers={answers} xpEarned={xpEarned} onRetry={handleRetry} onReview={() => { setCurrentIdx(0); setPhase("review"); }} />
      </DashboardLayout>
    );
  }

  const isReview = phase === "review";
  const q = DE1_QUESTIONS[currentIdx];

  return (
    <DashboardLayout
      title="ĐỀ SỐ 01 — EPS-TOPIK"
      subtitle={isReview ? "Xem lại đáp án" : `${answered}/${DE1_QUESTIONS.length} câu đã trả lời`}
      actions={!isReview ? (
        <button onClick={submit} className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-send-plane-fill"></i>Nộp bài ({answered}/{DE1_QUESTIONS.length})
        </button>
      ) : (
        <button onClick={() => setPhase("result")} className="flex items-center gap-2 bg-app-card text-white text-sm px-4 py-2 rounded-xl border border-app-border cursor-pointer">
          <i className="ri-bar-chart-2-line"></i>Kết quả
        </button>
      )}
    >
      {/* ── Sticky timer bar ── */}
      {!isReview && (
        <div className={`sticky top-0 z-10 bg-[#0a0c10]/95 backdrop-blur-sm border-b mb-5 py-3 px-1 -mx-1 ${isDanger ? "border-red-500/30" : isWarning ? "border-app-accent-primary/20" : "border-app-border"}`}>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg whitespace-nowrap ${isDanger ? "border-red-500/30 bg-red-500/8 text-red-400" : isWarning ? "border-app-accent-primary/25 bg-app-accent-primary/8 text-app-accent-primary" : "border-app-border bg-app-surface/50 text-white/70"}`}>
              <i className={`ri-time-line text-base ${isDanger ? "animate-pulse" : ""}`}></i>
              {fmt(timeLeft)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-app-text-muted text-[10px]">Thời gian còn lại</span>
                <span className="text-app-text-muted text-[10px]">{Math.round(timePct)}%</span>
              </div>
              <div className="bg-app-card/50 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${timePct}%`, backgroundColor: isDanger ? "#f87171" : isWarning ? "#eab308" : "#4ade80" }}></div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs whitespace-nowrap">
              <span className="text-[#a78bfa]/80">Đọc: {readingAnswered}/{readingQs.length}</span>
              <span className="text-[#38bdf8]/80">Nghe: {listeningAnswered}/{listeningQs.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Section tabs ── */}
      <div className="flex items-center bg-app-card/50 rounded-xl p-1 mb-5 w-fit">
        {([["reading", "ri-book-open-line", "#a78bfa", 0, "Đọc"], ["listening", "ri-headphone-line", "#38bdf8", 20, "Nghe"]] as const).map(([sec, icon, color, start, label]) => (
          <button
            key={sec}
            onClick={() => setCurrentIdx(start)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${currentSection === sec ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}
          >
            <i className={icon} style={currentSection !== sec ? { color } : {}}></i>
            {label} ({sec === "reading" ? readingAnswered : listeningAnswered}/{sec === "reading" ? readingQs.length : listeningQs.length})
          </button>
        ))}
      </div>

      {/* ── Question number grid ── */}
      <div className="flex flex-wrap gap-1.5 mb-5 bg-app-bg border border-app-border rounded-xl p-3">
        {DE1_QUESTIONS.filter(dq => dq.section === currentSection).map((dq, sIdx) => {
          const gIdx = currentSection === "reading" ? sIdx : sIdx + 20;
          const isAnswered = answers[gIdx] !== null;
          const isCurrent = gIdx === currentIdx;
          const isWrong = isReview && answers[gIdx] !== dq.correct;
          const isRight = isReview && answers[gIdx] === dq.correct;
          return (
            <button
              key={dq.id}
              onClick={() => { setCurrentIdx(gIdx); document.getElementById("question-card")?.scrollIntoView({ behavior: "smooth" }); }}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isCurrent ? "bg-app-accent-primary text-app-bg" :
                isRight   ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                isWrong   ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                isAnswered ? "bg-app-card text-white border border-app-border" :
                "bg-app-card/50 text-app-text-muted"
              }`}
            >
              {dq.id}
            </button>
          );
        })}
      </div>

      {/* ── Question card ── */}
      <div id="question-card" className="bg-app-bg border border-app-border rounded-2xl p-5 mb-4 scroll-mt-4">
        <QuestionCard q={q} answer={answers[currentIdx]} onAnswer={selectAnswer} showResult={isReview} tts={tts} />
      </div>

      {/* ── Prev / Next ── */}
      <div className="flex gap-3 justify-between">
        <button
          onClick={() => setCurrentIdx(p => Math.max(0, p - 1))}
          disabled={currentIdx === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-app-card border border-app-border text-white text-sm font-medium disabled:opacity-40 cursor-pointer"
        >
          <i className="ri-arrow-left-line"></i>Trước
        </button>
        {currentIdx === DE1_QUESTIONS.length - 1 && !isReview ? (
          <button onClick={submit} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-app-accent-primary text-app-bg font-bold text-sm cursor-pointer">
            <i className="ri-send-plane-fill"></i>Nộp bài
          </button>
        ) : (
          <button
            onClick={() => setCurrentIdx(p => Math.min(DE1_QUESTIONS.length - 1, p + 1))}
            disabled={currentIdx === DE1_QUESTIONS.length - 1}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-app-accent-primary text-app-bg text-sm font-bold disabled:opacity-40 cursor-pointer"
          >
            Tiếp<i className="ri-arrow-right-line"></i>
          </button>
        )}
      </div>
    </DashboardLayout>
  );
}
