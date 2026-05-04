import { useState, useRef } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

// --- Types --------------------------------------------------------------------
interface WritingPrompt {
  id: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  topic: string;
  title: string;
  titleVi: string;
  instruction: string;
  minWords: number;
  maxWords: number;
  hints: string[];
  keyVocab: { word: string; meaning: string }[];
  grammarPoints: string[];
  sampleAnswer: string;
  sampleAnswerVi: string;
  scoringCriteria: { name: string; desc: string; maxScore: number }[];
}

// --- Data ---------------------------------------------------------------------
const prompts: WritingPrompt[] = [
  {
    id: "a1-1",
    level: "A1",
    topic: "Gi?i thi?u b?n thân",
    title: "????",
    titleVi: "T? gi?i thi?u b?n thân",
    instruction: "Hãy vi?t m?t do?n t? gi?i thi?u b?n thân b?ng ti?ng Hàn. Bao g?m: tên, tu?i, qu?c t?ch, ngh? nghi?p/h?c sinh, s? thích.",
    minWords: 30,
    maxWords: 60,
    hints: [
      "?? [tên]???. — Tôi là [tên].",
      "?? [tu?i]????. — Tôi [tu?i] tu?i.",
      "?? ??? ?????. — Tôi là ngu?i Vi?t Nam.",
      "?? [ngh? nghi?p]???. — Tôi là [ngh? nghi?p].",
      "?? [s? thích]?/? ?????. — Tôi thích [s? thích].",
    ],
    keyVocab: [
      { word: "??", meaning: "Tên" },
      { word: "??", meaning: "Tu?i" },
      { word: "??", meaning: "Ngh? nghi?p" },
      { word: "??", meaning: "S? thích" },
      { word: "????", meaning: "Thích" },
    ],
    grammarPoints: ["N?/? N???", "N?/? ?????", "??..."],
    sampleAnswer: `?????! ?? ??? ? ????. ?? ???? ????. ?? ??? ?????. ?? ??????. ?? ??? ??? ?????. ??? ?? ??? ?????. ??? ?????!`,
    sampleAnswerVi: `Xin chào! Tôi là Nguy?n Van An. Tôi 25 tu?i. Tôi là ngu?i Vi?t Nam. Tôi là nhân viên công ty. Tôi thích h?c ti?ng Hàn. Và tôi cung thích nghe nh?c. R?t vui du?c g?p b?n!`,
    scoringCriteria: [
      { name: "N?i dung", desc: "Ð? thông tin yêu c?u", maxScore: 40 },
      { name: "Ng? pháp", desc: "Dùng dúng c?u trúc A1", maxScore: 30 },
      { name: "T? v?ng", desc: "Dùng t? phù h?p", maxScore: 20 },
      { name: "Ð? dài", desc: "Ð? 30-60 t?", maxScore: 10 },
    ],
  },
  {
    id: "a2-1",
    level: "A2",
    topic: "K? ho?ch cu?i tu?n",
    title: "?? ??",
    titleVi: "K? ho?ch cu?i tu?n",
    instruction: "Vi?t v? k? ho?ch cu?i tu?n c?a b?n. Bao g?m: s? làm gì, di dâu, v?i ai, t?i sao thích.",
    minWords: 60,
    maxWords: 100,
    hints: [
      "?? ??? ??... — Cu?i tu?n này tôi...",
      "...? ? ???. — Tôi s? d?n...",
      "...?/? ?? — Cùng v?i...",
      "????... — Vì...",
      "...?/? ? ???. — Tôi s? làm...",
    ],
    keyVocab: [
      { word: "??", meaning: "Cu?i tu?n" },
      { word: "??", meaning: "K? ho?ch" },
      { word: "??", meaning: "B?n bè" },
      { word: "??", meaning: "Du l?ch" },
      { word: "??", meaning: "Mua s?m" },
    ],
    grammarPoints: ["-(?)? ??? (tuong lai)", "-? ?? (mu?n)", "????...? ?????"],
    sampleAnswer: `?? ??? ?? ???? ?? ?? ??? ? ???. ?? ???? ???? ? ???. ??? ??? ??? ?? ???. ?? ?? ??? ????. ???? ??? ???? ?????. ???? ??? ? ???. ?? ??? ?? ????!`,
    sampleAnswerVi: `Cu?i tu?n này tôi s? d?n công viên Hangang cùng v?i b?n bè. ? công viên Hangang tôi s? d?p xe. Và cung s? an d? an ngon. Tôi thích công viên Hangang. Vì phong c?nh d?p. Bu?i t?i s? xem phim. Tôi th?c s? mong ch? cu?i tu?n này!`,
    scoringCriteria: [
      { name: "N?i dung", desc: "Ð? thông tin k? ho?ch", maxScore: 35 },
      { name: "Ng? pháp", desc: "Dùng dúng thì tuong lai", maxScore: 30 },
      { name: "T? v?ng", desc: "Ða d?ng t? v?ng", maxScore: 25 },
      { name: "M?ch l?c", desc: "Câu van liên k?t t?t", maxScore: 10 },
    ],
  },
  {
    id: "b1-1",
    level: "B1",
    topic: "Uu và nhu?c di?m c?a m?ng xã h?i",
    title: "SNS? ???",
    titleVi: "Uu và nhu?c di?m c?a m?ng xã h?i",
    instruction: "Vi?t m?t do?n van v? uu và nhu?c di?m c?a m?ng xã h?i. Ðua ra ít nh?t 2 uu di?m và 2 nhu?c di?m, kèm ví d? c? th?.",
    minWords: 100,
    maxWords: 180,
    hints: [
      "SNS? ???... — Uu di?m c?a MXH là...",
      "??? ??? ????. — M?t khác cung có nhu?c di?m.",
      "?? ??... — Ví d? nhu...",
      "???... — Do dó...",
      "?????... — K?t lu?n là...",
    ],
    keyVocab: [
      { word: "??", meaning: "Uu di?m" },
      { word: "??", meaning: "Nhu?c di?m" },
      { word: "??", meaning: "Giao ti?p" },
      { word: "??", meaning: "Nghi?n" },
      { word: "??", meaning: "Thông tin" },
    ],
    grammarPoints: ["-? ??? (trong khi dó)", "-(?)? ? ??", "-? ???", "???/????"],
    sampleAnswer: `SNS? ?? ???? ?? ??? ??? ???. ?? SNS? ??? ???????. ??, SNS? ?? ?? ?? ??? ??? ?? ??? ? ????. ??, ??? ??? ??? ?? ? ????. ?? ?? ??? ?? ???? ????? ??? ? ????.

??? ??? ????. ??, SNS? ?? ?? ???? ??? ? ????. ??, ?? ??? ??? ??? ??? ?? ? ????. ??? SNS? ??? ?? ??? ??? ???? ??? ?????.`,
    sampleAnswerVi: `MXH dóng vai trò r?t quan tr?ng trong xã h?i hi?n d?i. Tru?c tiên hãy xem xét uu di?m c?a MXH. Th? nh?t, qua MXH có th? d? dàng liên l?c v?i b?n bè ho?c gia dình ? xa. Th? hai, có th? nhanh chóng nh?n du?c nhi?u thông tin da d?ng.

M?t khác cung có nhu?c di?m. Th? nh?t, n?u dùng MXH quá nhi?u có th? b? nghi?n. Th? hai, tin gi? ho?c thông tin sai có th? lan truy?n nhanh. Do dó khi dùng MXH c?n có kh? nang phân bi?t thông tin dúng.`,
    scoringCriteria: [
      { name: "N?i dung", desc: "Ð? 2 uu + 2 nhu?c di?m", maxScore: 35 },
      { name: "C?u trúc", desc: "Có m?-thân-k?t rõ ràng", maxScore: 25 },
      { name: "Ng? pháp", desc: "Dùng dúng c?u trúc B1", maxScore: 25 },
      { name: "T? v?ng", desc: "T? v?ng phong phú, chính xác", maxScore: 15 },
    ],
  },
  {
    id: "b2-1",
    level: "B2",
    topic: "Bi?n d?i khí h?u và trách nhi?m cá nhân",
    title: "?? ??? ??? ??",
    titleVi: "Bi?n d?i khí h?u và trách nhi?m cá nhân",
    instruction: "Vi?t bài lu?n v? bi?n d?i khí h?u và trách nhi?m c?a m?i cá nhân. Ðua ra quan di?m cá nhân và các gi?i pháp c? th?.",
    minWords: 180,
    maxWords: 280,
    hints: [
      "?? ??? ??? ?????. — Bi?n d?i khí h?u là v?n d? nghiêm tr?ng.",
      "??? ? ? ?? ??... — Ði?u cá nhân có th? làm là...",
      "?? ???...?? ????... — N?u chúng ta không...",
      "?? ????... — Ð? làm di?u này...",
      "?? ??? ??... — Cu?i cùng di?u quan tr?ng là...",
    ],
    keyVocab: [
      { word: "?? ??", meaning: "Bi?n d?i khí h?u" },
      { word: "?? ??", meaning: "Phát th?i carbon" },
      { word: "???", meaning: "Tái ch?" },
      { word: "??? ??", meaning: "Ti?t ki?m nang lu?ng" },
      { word: "?? ??", meaning: "B?o v? môi tru?ng" },
    ],
    grammarPoints: ["-(?)? ?? (d? doán lo ng?i)", "-?/?? ?? (ph?i)", "??...-(?)? (n?u)", "-(?)? ?? ??? (không ch?...mà còn)"],
    sampleAnswer: `?? ??? ?? ??? ??? ?? ??? ?? ? ?????. ?? ??? ?? ????? ???? ?? ??? ???? ????. ? ??? ???? ???? ??? ??? ???? ??? ??? ?? ?? ??? ?? ?????.

??? ? ? ?? ?? ???? ????. ??, ?????? ???? ??? ? ????. ?? ?? ???? ?? ????? ??? ??? ????? ???? ????. ??, ???? ??? ?? ???? ??? ??? ???.

?? ??? ?? ???? ???? ?? ??? ? ??? ?? ??? ?? ? ????. ?? ?? ?? ??? ??? ?? ?????. ?? ??? ?? ? ??? ?? ? ??? ?????.`,
    sampleAnswerVi: `Bi?n d?i khí h?u là m?t trong nh?ng v?n d? nghiêm tr?ng nh?t mà nhân lo?i dang d?i m?t hi?n nay. Khi nhi?t d? trái d?t ti?p t?c tang, các hi?n tu?ng th?i ti?t c?c doan ngày càng gia tang. Ð? gi?i quy?t v?n d? này, không ch? c?n n? l?c c?a chính ph? và doanh nghi?p mà hành d?ng có trách nhi?m c?a cá nhân cung r?t quan tr?ng.`,
    scoringCriteria: [
      { name: "N?i dung", desc: "Quan di?m rõ ràng, có d?n ch?ng", maxScore: 30 },
      { name: "C?u trúc", desc: "B? c?c bài lu?n hoàn ch?nh", maxScore: 25 },
      { name: "Ng? pháp", desc: "Ða d?ng c?u trúc B2", maxScore: 25 },
      { name: "T? v?ng", desc: "T? h?c thu?t, chính xác", maxScore: 20 },
    ],
  },
  {
    id: "c1-1",
    level: "C1",
    topic: "Toàn c?u hóa và b?n s?c van hóa",
    title: "???? ?? ???",
    titleVi: "Toàn c?u hóa và b?n s?c van hóa",
    instruction: "Vi?t bài lu?n phân tích tác d?ng c?a toàn c?u hóa d?n b?n s?c van hóa dân t?c. Ðua ra l?p lu?n có chi?u sâu v?i d?n ch?ng c? th?.",
    minWords: 250,
    maxWords: 400,
    hints: [
      "???? ??? ?? ????. — Toàn c?u hóa nhu con dao hai lu?i.",
      "?????...??, ?? ?????... — M?t m?t...nhung m?t khác...",
      "??? ???...?? ?????. — Hi?n tu?ng này xu?t phát t?...",
      "??? ???...?? ? ????. — Do dó chúng ta c?n ph?i...",
    ],
    keyVocab: [
      { word: "???", meaning: "Toàn c?u hóa" },
      { word: "?? ???", meaning: "B?n s?c van hóa" },
      { word: "???", meaning: "Ð?ng nh?t hóa" },
      { word: "???", meaning: "Ða d?ng" },
      { word: "?? ??", meaning: "Van hóa truy?n th?ng" },
    ],
    grammarPoints: ["-(?)??? (càng...càng)", "-? ?? (trong khi dó)", "-(?)? ?? ???", "? ???? (ch? là)"],
    sampleAnswer: `???? ?????? ?? ???? ?? ??? ?? ????? ????. ???? ??? ??? ?? ??? ???? ???? ??? ?? ??, ??? ???? ??? ? ??? ??? ????.

??? ??? ????, K-?? ?? ???? ??? ??? ?? ??? ??? ??????. ??? ??? ?? ??? ???? ???? ???? ?? ??? ???? ????. ?? ??? ???? ??? ??? ? ???? ?????.

?? ???? ???? ???? ?? ??? ????? ????? ??? ?????. ??? ??? ??? ??? ?? ?? ???, ?? ????? ?? ?? ???? ???? ????? ???. ?? ??? ??? ?? ???? ???? ?? ?? ??? ??? ????? ?? ??????.`,
    sampleAnswerVi: `Khi toàn c?u hóa ngày càng tang t?c, cu?c th?o lu?n v? b?n s?c van hóa ngày càng tr? nên quan tr?ng hon. Toàn c?u hóa có m?t tích c?c là thúc d?y phát tri?n kinh t? và giao luu van hóa, nhung cung có lo ng?i r?ng nó có th? d?n d?n d?ng nh?t hóa van hóa.`,
    scoringCriteria: [
      { name: "L?p lu?n", desc: "Sâu s?c, có chi?u sâu phân tích", maxScore: 35 },
      { name: "C?u trúc", desc: "Bài lu?n h?c thu?t hoàn ch?nh", maxScore: 25 },
      { name: "Ng? pháp", desc: "C?u trúc ph?c t?p, da d?ng", maxScore: 25 },
      { name: "T? v?ng", desc: "T? h?c thu?t, chuyên ngành", maxScore: 15 },
    ],
  },
  {
    id: "c2-1",
    level: "C2",
    topic: "Tri?t h?c v? h?nh phúc",
    title: "??? ??? ??",
    titleVi: "Ý nghia tri?t h?c c?a h?nh phúc",
    instruction: "Vi?t bài lu?n tri?t h?c v? ý nghia c?a h?nh phúc. Tham chi?u ít nh?t m?t tru?ng phái tri?t h?c và dua ra quan di?m cá nhân có l?p lu?n ch?t ch?.",
    minWords: 350,
    maxWords: 500,
    hints: [
      "???? ????? — H?nh phúc là gì?",
      "???????? ???... — Theo Aristotle...",
      "??? ???? ? ?... — Nhìn t? quan di?m này...",
      "??? ?? ?????... — Tuy nhiên trong xã h?i hi?n d?i...",
      "????? ???... — Cu?i cùng h?nh phúc là...",
    ],
    keyVocab: [
      { word: "??", meaning: "H?nh phúc" },
      { word: "??", meaning: "Khoái l?c" },
      { word: "?", meaning: "Ð?c h?nh" },
      { word: "????", meaning: "T? th?c hi?n b?n thân" },
      { word: "???", meaning: "Ch? quan" },
    ],
    grammarPoints: ["-(?)? ??? (van vi?t)", "-?? ? ? ?? (có th? nói r?ng)", "-(?)?/? ???", "? ??? ?? (không gì hon là)"],
    sampleAnswer: `???? ????? ? ??? ??? ???? ??? ? ??? ?????. ???????? ??? ??? ??? ?? '???????', ? ?? ?? ???? ??????. ?? ??? ??? ??? ??? ???? ??? ???? ???? ?? ?? ??? ?????.

?? ????? ????? ??? ?? ??? ?? ???? ?????. ? ???? ??? ???? ?? ??? ??? ???? ????? ???.

?? ???? ??? ??? ????? ???? ???. ??? ??? ??? ??? ??? ??? ??? ??? ?????? ??? ????.

?? ??? ??? ??? ??? ???? ????? ?????. ?? ?? ??? ??, ??? ??? ?? ??, ??? ???? ?—??? ??? ??? ??? ????? ????? ??? ?? ??? ?? ??? ???? ????? ? ? ????.`,
    sampleAnswerVi: `H?nh phúc là gì? Câu h?i này là bài toán tri?t h?c mà nhân lo?i dã khám phá t? lâu. Aristotle d?nh nghia h?nh phúc không ph?i là khoái l?c don thu?n mà là 'eudaimonia', t?c là ho?t d?ng theo d?c h?nh.`,
    scoringCriteria: [
      { name: "Chi?u sâu tri?t h?c", desc: "Tham chi?u tru?ng phái, l?p lu?n sâu", maxScore: 35 },
      { name: "C?u trúc h?c thu?t", desc: "Bài lu?n hoàn ch?nh, m?ch l?c", maxScore: 25 },
      { name: "Ng? pháp nâng cao", desc: "C?u trúc ph?c t?p, van phong h?c thu?t", maxScore: 25 },
      { name: "T? v?ng h?c thu?t", desc: "Thu?t ng? tri?t h?c, chính xác", maxScore: 15 },
    ],
  },
];

const levelConfig: Record<string, { color: string; label: string }> = {
  A1: { color: "#34d399", label: "A1 - So c?p" },
  A2: { color: "#6ee7b7", label: "A2 - So c?p+" },
  B1: { color: "#fbbf24", label: "B1 - Trung c?p" },
  B2: { color: "#f59e0b", label: "B2 - Trung c?p+" },
  C1: { color: "#f87171", label: "C1 - Cao c?p" },
  C2: { color: "#e879f9", label: "C2 - Thành th?o" },
};

// --- Score Calculator ---------------------------------------------------------
function calculateScore(text: string, prompt: WritingPrompt): { total: number; breakdown: { name: string; score: number; max: number; feedback: string }[] } {
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const hasKorean = /[\uAC00-\uD7AF]/.test(text);

  const breakdown = prompt.scoringCriteria.map(c => {
    let score = 0;
    let feedback = "";

    if (c.name === "Ð? dài" || c.name === "N?i dung") {
      if (wordCount >= prompt.minWords && wordCount <= prompt.maxWords) {
        score = c.maxScore;
        feedback = `Ð? d? dài (${wordCount} t?)`;
      } else if (wordCount < prompt.minWords) {
        score = Math.round(c.maxScore * 0.5);
        feedback = `Còn thi?u ${prompt.minWords - wordCount} t?`;
      } else {
        score = Math.round(c.maxScore * 0.8);
        feedback = `Hoi dài, nên rút g?n`;
      }
    } else if (c.name === "Ng? pháp") {
      if (hasKorean && wordCount >= prompt.minWords * 0.7) {
        score = Math.round(c.maxScore * 0.8);
        feedback = "C?n ki?m tra l?i c?u trúc câu";
      } else {
        score = Math.round(c.maxScore * 0.4);
        feedback = "C?n vi?t nhi?u hon b?ng ti?ng Hàn";
      }
    } else {
      score = hasKorean ? Math.round(c.maxScore * 0.75) : Math.round(c.maxScore * 0.3);
      feedback = hasKorean ? "Khá t?t, ti?p t?c c?i thi?n" : "Hãy vi?t b?ng ti?ng Hàn";
    }

    return { name: c.name, score, max: c.maxScore, feedback };
  });

  const total = breakdown.reduce((s, b) => s + b.score, 0);
  return { total, breakdown };
}

// --- Writing Editor -----------------------------------------------------------
interface WritingEditorProps {
  prompt: WritingPrompt;
  onBack: () => void;
}

function WritingEditor({ prompt, onBack }: WritingEditorProps) {
  const [text, setText] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculateScore> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
  const cfg = levelConfig[prompt.level];
  const isEnough = wordCount >= prompt.minWords;

  const handleSubmit = () => {
    const r = calculateScore(text, prompt);
    setResult(r);
    setSubmitted(true);
  };

  const handleTTS = (t: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(t);
      utt.lang = "ko-KR";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm mb-5 cursor-pointer transition-colors">
        <i className="ri-arrow-left-line"></i> Quay l?i
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-app-border bg-app-surface/50 p-5 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>{cfg.label}</span>
              <span className="text-app-text-muted text-xs">{prompt.topic}</span>
            </div>
            <h2 className="text-white font-bold text-xl">{prompt.title}</h2>
            <p className="text-white/50 text-sm">{prompt.titleVi}</p>
          </div>
          <div className="text-right text-xs text-app-text-secondary">
            <p>{prompt.minWords}–{prompt.maxWords} t?</p>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-app-card/50 border border-app-border">
          <p className="text-white/70 text-sm leading-relaxed">{prompt.instruction}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Editor */}
        <div className="lg:col-span-2">
          {!submitted ? (
            <div className="rounded-2xl border border-app-border bg-app-surface/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/60 text-sm font-medium">Bài vi?t c?a b?n</p>
                <span className={`text-xs font-bold ${isEnough ? "text-app-accent-success" : "text-app-text-secondary"}`}>
                  {wordCount} / {prompt.minWords}–{prompt.maxWords} t?
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Vi?t bài c?a b?n ? dây b?ng ti?ng Hàn..."
                rows={12}
                className="w-full bg-transparent text-white text-sm leading-8 outline-none resize-none placeholder-white/20"
              />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-app-border">
                <div className="h-1.5 flex-1 mr-4 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (wordCount / prompt.minWords) * 100)}%`, backgroundColor: isEnough ? "#34d399" : cfg.color }} />
                </div>
                <button onClick={handleSubmit} disabled={wordCount < 5}
                  className="px-6 py-2.5 rounded-xl bg-app-accent-primary text-[#141720] font-bold text-sm disabled:opacity-30 cursor-pointer whitespace-nowrap">
                  N?p bài
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-app-border bg-app-surface/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white font-bold text-base">K?t qu? ch?m di?m</p>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${result && result.total >= 80 ? "bg-app-accent-success/15" : result && result.total >= 60 ? "bg-amber-500/15" : "bg-rose-500/15"}`}>
                  <span className={`text-xl font-bold ${result && result.total >= 80 ? "text-app-accent-success" : result && result.total >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                    {result?.total}
                  </span>
                </div>
              </div>
              {result && (
                <div className="space-y-3 mb-5">
                  {result.breakdown.map(b => (
                    <div key={b.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/70 text-xs font-medium">{b.name}</span>
                        <span className="text-white/60 text-xs">{b.score}/{b.max}</span>
                      </div>
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-1">
                        <div className="h-full rounded-full bg-app-accent-primary" style={{ width: `${(b.score / b.max) * 100}%` }} />
                      </div>
                      <p className="text-white/35 text-xs">{b.feedback}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="p-3 rounded-xl bg-app-card/50 border border-app-border mb-4">
                <p className="text-white/50 text-xs mb-2">Bài vi?t c?a b?n:</p>
                <p className="text-white/70 text-sm leading-7 whitespace-pre-wrap">{text}</p>
              </div>
              <button onClick={() => { setSubmitted(false); setResult(null); }}
                className="w-full py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-white/60 text-sm cursor-pointer whitespace-nowrap">
                Vi?t l?i
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Key vocab */}
          <div className="rounded-xl border border-app-border bg-app-surface/50 p-4">
            <p className="text-white/60 text-xs font-semibold mb-3">T? v?ng g?i ý</p>
            <div className="space-y-2">
              {prompt.keyVocab.map((v, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleTTS(v.word)} className="w-5 h-5 flex items-center justify-center text-app-text-muted hover:text-white/60 cursor-pointer">
                      <i className="ri-volume-up-line text-xs"></i>
                    </button>
                    <span className="text-white/80 text-sm font-medium">{v.word}</span>
                  </div>
                  <span className="text-app-text-secondary text-xs">{v.meaning}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grammar points */}
          <div className="rounded-xl border border-app-border bg-app-surface/50 p-4">
            <p className="text-white/60 text-xs font-semibold mb-3">Ng? pháp c?n dùng</p>
            <div className="space-y-1.5">
              {prompt.grammarPoints.map((g, i) => (
                <div key={i} className="flex items-start gap-2">
                  <i className="ri-checkbox-circle-line text-app-accent-primary text-xs mt-0.5 flex-shrink-0"></i>
                  <span className="text-white/60 text-xs font-mono">{g}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hints toggle */}
          <button onClick={() => setShowHints(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-app-card/50 hover:bg-white/8 text-white/60 text-sm cursor-pointer transition-colors">
            <span><i className="ri-lightbulb-line mr-2 text-app-accent-primary"></i>G?i ý câu m?u</span>
            <i className={showHints ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
          </button>
          {showHints && (
            <div className="space-y-2">
              {prompt.hints.map((h, i) => (
                <div key={i} className="p-3 rounded-xl bg-app-surface/50 border border-app-border">
                  <p className="text-white/70 text-xs">{h}</p>
                </div>
              ))}
            </div>
          )}

          {/* Sample answer toggle */}
          <button onClick={() => setShowSample(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-app-accent-primary/5 hover:bg-app-accent-primary/10 border border-app-accent-primary/15 text-app-accent-primary text-sm cursor-pointer transition-colors">
            <span><i className="ri-file-text-line mr-2"></i>Bài m?u tham kh?o</span>
            <i className={showSample ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
          </button>
          {showSample && (
            <div className="p-4 rounded-xl bg-app-surface/50 border border-app-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/50 text-xs font-semibold">Bài m?u</p>
                <button onClick={() => handleTTS(prompt.sampleAnswer)} className="text-app-text-muted hover:text-white/60 cursor-pointer">
                  <i className="ri-volume-up-line text-sm"></i>
                </button>
              </div>
              <p className="text-white/70 text-sm leading-7 mb-3">{prompt.sampleAnswer}</p>
              <p className="text-white/35 text-xs italic leading-6">{prompt.sampleAnswerVi}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------
export default function WritingByLevelPage() {
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null);
  const [completedIds] = useState<Set<string>>(new Set());

  const filtered = selectedLevel === "all" ? prompts : prompts.filter(p => p.level === selectedLevel);

  if (selectedPrompt) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <WritingEditor prompt={selectedPrompt} onBack={() => setSelectedPrompt(null)} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-white font-bold text-2xl mb-1">Luy?n vi?t theo c?p d?</h1>
          <p className="text-white/50 text-sm">Bài vi?t t? A1 d?n C2 v?i g?i ý, t? v?ng và ch?m di?m t? d?ng</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Bài vi?t", value: prompts.length, icon: "ri-quill-pen-line", color: "app-accent-primary" },
            { label: "Ðã hoàn thành", value: completedIds.size, icon: "ri-checkbox-circle-line", color: "#34d399" },
            { label: "C?p d?", value: "A1–C2", icon: "ri-bar-chart-line", color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-app-border bg-app-surface/50 p-4 text-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${s.color}20` }}>
                <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
              </div>
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setSelectedLevel("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${selectedLevel === "all" ? "bg-white/15 text-white" : "bg-app-card/50 text-white/50 hover:bg-white/8"}`}>
            T?t c?
          </button>
          {Object.entries(levelConfig).map(([lvl, cfg]) => (
            <button key={lvl} onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap`}
              style={selectedLevel === lvl ? { backgroundColor: cfg.color, color: "#141720" } : { backgroundColor: `${cfg.color}15`, color: cfg.color }}>
              {lvl}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => {
            const cfg = levelConfig[p.level];
            return (
              <button key={p.id} onClick={() => setSelectedPrompt(p)}
                className="text-left p-5 rounded-2xl border border-app-border bg-app-surface/50 hover:bg-app-card/50 hover:border-white/15 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>{cfg.label}</span>
                  <span className="text-app-text-muted text-xs">{p.minWords}–{p.maxWords} t?</span>
                </div>
                <h3 className="text-white font-bold text-base mb-1 group-hover:text-app-accent-primary transition-colors">{p.title}</h3>
                <p className="text-white/50 text-sm mb-3">{p.titleVi}</p>
                <p className="text-white/35 text-xs line-clamp-2 mb-3">{p.instruction}</p>
                <div className="flex items-center gap-3 text-app-text-muted text-xs">
                  <span><i className="ri-price-tag-3-line mr-1"></i>{p.topic}</span>
                  <span><i className="ri-lightbulb-line mr-1"></i>{p.hints.length} g?i ý</span>
                  <span><i className="ri-book-2-line mr-1"></i>{p.grammarPoints.length} ng? pháp</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

