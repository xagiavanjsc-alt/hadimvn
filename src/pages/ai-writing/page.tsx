import { useState, useRef } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface GrammarError {
  original: string;
  corrected: string;
  explanation: string;
  type: "grammar" | "spelling" | "style" | "vocab";
  position: number;
}

interface WritingResult {
  overallScore: number;
  grammarScore: number;
  vocabScore: number;
  coherenceScore: number;
  feedback: string;
  errors: GrammarError[];
  correctedText: string;
  suggestions: string[];
  wordCount: number;
  sentenceCount: number;
}

const WRITING_PROMPTS = [
  { id: "p1", level: "A1", topic: "T? gi?i thi?u", prompt: "????? ? ???. (Hãy vi?t bài t? gi?i thi?u v? b?n thân)", example: "?????. ?? [??]???. ?? [??]?? ???." },
  { id: "p2", level: "A2", topic: "Gia dình", prompt: "??? ?? ? ???. (Hãy vi?t v? gia dình b?n)", example: "?? ??? [??]????. ???, ???, ??? ???." },
  { id: "p3", level: "A2", topic: "S? thích", prompt: "??? ?? ? ???. (Hãy vi?t v? s? thích c?a b?n)", example: "?? [??]?/? ????. ??? ?? ??." },
  { id: "p4", level: "B1", topic: "Ngày cu?i tu?n", prompt: "?? ??? ??? ??? ? ???. (Hãy vi?t v? nh?ng gì b?n dã làm cu?i tu?n qua)", example: "?? ??? ?? ??? ?? ??? ???." },
  { id: "p5", level: "B1", topic: "K? ho?ch tuong lai", prompt: "?? ??? ?? ? ???. (Hãy vi?t v? k? ho?ch tuong lai c?a b?n)", example: "?? ??? ???? ? ??? ??? ???." },
  { id: "p6", level: "B2", topic: "Uu nhu?c di?m", prompt: "????? ???? ?? ? ???. (Hãy vi?t v? uu và nhu?c di?m c?a di?n tho?i thông minh)", example: "????? ????? ??? ? ???." },
  { id: "p7", level: "B2", topic: "Môi tru?ng", prompt: "?? ??? ?? ??? ? ???. (Hãy vi?t ý ki?n v? b?o v? môi tru?ng)", example: "?? ??? ?? ??? ????? ????." },
  { id: "p8", level: "C1", topic: "Xã h?i", prompt: "?? ??? ???? ?? ?????. (Hãy lu?n v? các v?n d? c?a xã h?i hi?n d?i)", example: "?? ????? ??? ???? ???? ????." },
];

const SAMPLE_ERRORS: GrammarError[] = [
  { original: "?? ?????", corrected: "?? ?????", explanation: "Câu dúng! C?u trúc ??? dùng sau ph? âm cu?i.", type: "grammar", position: 0 },
  { original: "??? ???", corrected: "???? ???", explanation: "Thi?u tr? t? ? sau ??? (k?t thúc b?ng nguyên âm).", type: "grammar", position: 1 },
  { original: "?? ?? ???", corrected: "?? ??? ???", explanation: "Thi?u tr? t? ? ch? d?a di?m sau ??.", type: "grammar", position: 2 },
  { original: "???? ?? ?????", corrected: "???? ?? ?????", explanation: "Câu dúng! ?? dùng d? n?i danh t?.", type: "grammar", position: 3 },
];

function simulateAIGrading(text: string): WritingResult {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!??!?]+/).filter(s => s.trim().length > 0);
  const wordCount = words.length;
  const sentenceCount = sentences.length;

  // Simulate scoring based on length and content
  const lengthBonus = Math.min(20, wordCount * 2);
  const grammarScore = Math.min(100, 55 + lengthBonus + Math.floor(Math.random() * 20));
  const vocabScore = Math.min(100, 50 + lengthBonus + Math.floor(Math.random() * 25));
  const coherenceScore = Math.min(100, 60 + Math.floor(Math.random() * 30));
  const overallScore = Math.round((grammarScore * 0.4 + vocabScore * 0.3 + coherenceScore * 0.3));

  const hasKorean = /[?-?]/.test(text);
  const errors: GrammarError[] = hasKorean ? SAMPLE_ERRORS.slice(0, Math.floor(Math.random() * 3) + 1) : [];

  let feedback = "";
  if (overallScore >= 85) feedback = "Xu?t s?c! Bài vi?t r?t t?t, ng? pháp chu?n và t? v?ng phong phú.";
  else if (overallScore >= 70) feedback = "T?t! Bài vi?t khá t?t. C?n chú ý thêm m?t s? di?m ng? pháp nh?.";
  else if (overallScore >= 55) feedback = "Khá! Bài vi?t có n?i dung nhung c?n c?i thi?n ng? pháp và t? v?ng.";
  else feedback = "C?n c? g?ng thêm. Hãy chú ý d?n c?u trúc câu và tr? t? ti?ng Hàn.";

  const suggestions = [
    "S? d?ng da d?ng c?u trúc câu hon (không ch? dùng ???/??/??)",
    "Thêm các liên t? nhu ???, ???, ??? d? bài vi?t m?ch l?c hon",
    "Dùng thêm tính t? và tr?ng t? d? bài vi?t sinh d?ng hon",
    wordCount < 30 ? "Vi?t dài hon — ít nh?t 50 t? d? luy?n t?p hi?u qu?" : "Ð? dài bài vi?t t?t!",
  ].filter(Boolean);

  const correctedText = text; // In real app, AI would correct this

  return { overallScore, grammarScore, vocabScore, coherenceScore, feedback, errors, correctedText, suggestions, wordCount, sentenceCount };
}

const levelColor: Record<string, string> = {
  A1: "bg-emerald-500/20 text-app-accent-success",
  A2: "bg-teal-500/20 text-teal-400",
  B1: "bg-amber-500/20 text-amber-400",
  B2: "bg-orange-500/20 text-orange-400",
  C1: "bg-rose-500/20 text-rose-400",
};

const errorTypeColor: Record<string, string> = {
  grammar: "bg-rose-500/15 border-rose-500/30 text-rose-300",
  spelling: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  style: "bg-blue-500/15 border-blue-500/30 text-blue-300",
  vocab: "bg-purple-500/15 border-purple-500/30 text-purple-300",
};

const errorTypeLabel: Record<string, string> = {
  grammar: "Ng? pháp",
  spelling: "Chính t?",
  style: "Van phong",
  vocab: "T? v?ng",
};

export default function AIWritingPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<WritingResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<typeof WRITING_PROMPTS[0] | null>(null);
  const [filterLevel, setFilterLevel] = useState("T?t c?");
  const [history, setHistory] = useState<{ text: string; score: number; date: string }[]>([]);
  const [activeTab, setActiveTab] = useState<"write" | "result">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredPrompts = filterLevel === "T?t c?"
    ? WRITING_PROMPTS
    : WRITING_PROMPTS.filter(p => p.level === filterLevel);

  const handleAnalyze = () => {
    if (!text.trim() || text.trim().length < 5) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = simulateAIGrading(text);
      setResult(res);
      setIsAnalyzing(false);
      setActiveTab("result");
      setHistory(prev => [{ text: text.slice(0, 60) + "...", score: res.overallScore, date: new Date().toLocaleTimeString("vi-VN") }, ...prev.slice(0, 4)]);
    }, 1800);
  };

  const handleUsePrompt = (prompt: typeof WRITING_PROMPTS[0]) => {
    setSelectedPrompt(prompt);
    setResult(null);
    setActiveTab("write");
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const scoreColor = (s: number) => {
    if (s >= 85) return "text-app-accent-success";
    if (s >= 70) return "text-app-accent-primary";
    if (s >= 55) return "text-orange-400";
    return "text-rose-400";
  };

  const scoreBg = (s: number) => {
    if (s >= 85) return "bg-emerald-500";
    if (s >= 70) return "bg-app-accent-primary";
    if (s >= 55) return "bg-orange-500";
    return "bg-rose-500";
  };

  const avgScore = history.length > 0 ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length) : 0;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">AI Ch?m Vi?t</h1>
            <p className="text-white/50 text-sm mt-1">Vi?t ti?ng Hàn và nh?n dánh giá chi ti?t t? AI</p>
          </div>
          {history.length > 0 && (
            <div className="text-right">
              <p className={`text-2xl font-bold ${scoreColor(avgScore)}`}>{avgScore}</p>
              <p className="text-app-text-muted text-xs">Ði?m TB</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Writing area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Prompt selector */}
            {selectedPrompt && (
              <div className="bg-app-accent-primary/5 border border-app-accent-primary/20 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${levelColor[selectedPrompt.level]}`}>{selectedPrompt.level}</span>
                      <span className="text-app-text-secondary text-xs">{selectedPrompt.topic}</span>
                    </div>
                    <p className="text-white/80 text-sm font-medium">{selectedPrompt.prompt}</p>
                    <p className="text-app-text-secondary text-xs mt-1">Ví d?: {selectedPrompt.example}</p>
                  </div>
                  <button onClick={() => setSelectedPrompt(null)} className="text-app-text-muted hover:text-white/60 cursor-pointer">
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-app-card/50 rounded-lg p-1 w-fit">
              {(["write", "result"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab ? "bg-app-accent-primary/20 text-app-accent-primary font-semibold" : "text-app-text-secondary hover:text-white/60"
                  }`}
                >
                  {tab === "write" ? "Vi?t bài" : "K?t qu?"}
                  {tab === "result" && result && (
                    <span className={`ml-1.5 text-xs font-bold ${scoreColor(result.overallScore)}`}>{result.overallScore}</span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === "write" && (
              <div className="bg-[#1a1f2e] rounded-xl border border-app-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-app-border">
                  <span className="text-app-text-secondary text-xs">Vi?t ti?ng Hàn bên du?i</span>
                  <span className="text-app-text-muted text-xs">{text.trim().split(/\s+/).filter(w => w).length} t?</span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="?????. ??... (B?t d?u vi?t ti?ng Hàn t?i dây)"
                  className="w-full bg-transparent text-white/80 text-sm p-4 resize-none focus:outline-none placeholder-white/20 leading-relaxed"
                  rows={10}
                  maxLength={2000}
                />
                <div className="flex items-center justify-between px-4 py-3 border-t border-app-border">
                  <span className="text-app-text-muted text-xs">{text.length}/2000 ký t?</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setText(""); setResult(null); }}
                      className="px-3 py-1.5 rounded-lg bg-app-card/50 text-app-text-secondary text-sm hover:bg-app-card/70 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={handleAnalyze}
                      disabled={!text.trim() || text.trim().length < 5 || isAnalyzing}
                      className="px-5 py-1.5 rounded-lg bg-app-accent-primary text-black text-sm font-bold hover:bg-app-accent-primary/90 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                          Ðang ch?m...
                        </>
                      ) : (
                        <>
                          <i className="ri-robot-line"></i>
                          AI Ch?m bài
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "result" && result && (
              <div className="space-y-4 animate-fade-in">
                {/* Score overview */}
                <div className="bg-[#1a1f2e] rounded-xl p-5 border border-app-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold">K?t qu? dánh giá</h3>
                    <div className={`text-4xl font-bold ${scoreColor(result.overallScore)}`}>{result.overallScore}<span className="text-lg text-app-text-muted">/100</span></div>
                  </div>
                  <div className="h-2 bg-white/8 rounded-full overflow-hidden mb-4">
                    <div className={`h-full rounded-full transition-all duration-1000 ${scoreBg(result.overallScore)}`} style={{ width: `${result.overallScore}%` }}></div>
                  </div>
                  <p className="text-white/70 text-sm mb-4">{result.feedback}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Ng? pháp", score: result.grammarScore, icon: "ri-book-2-line" },
                      { label: "T? v?ng", score: result.vocabScore, icon: "ri-translate-2" },
                      { label: "M?ch l?c", score: result.coherenceScore, icon: "ri-flow-chart" },
                    ].map(item => (
                      <div key={item.label} className="bg-app-card/50 rounded-lg p-3 text-center">
                        <i className={`${item.icon} text-app-text-muted text-lg mb-1 block`}></i>
                        <p className={`text-xl font-bold ${scoreColor(item.score)}`}>{item.score}</p>
                        <p className="text-app-text-secondary text-xs">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-app-text-muted text-xs">
                    <span><i className="ri-text mr-1"></i>{result.wordCount} t?</span>
                    <span><i className="ri-list-check mr-1"></i>{result.sentenceCount} câu</span>
                  </div>
                </div>

                {/* Errors */}
                {result.errors.length > 0 && (
                  <div className="bg-[#1a1f2e] rounded-xl p-5 border border-app-border">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <i className="ri-error-warning-line text-amber-400"></i>
                      L?i c?n s?a ({result.errors.length})
                    </h3>
                    <div className="space-y-3">
                      {result.errors.map((err, i) => (
                        <div key={i} className={`rounded-lg p-3 border ${errorTypeColor[err.type]}`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-app-card/70">{errorTypeLabel[err.type]}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mb-1">
                            <span className="line-through opacity-60">{err.original}</span>
                            <i className="ri-arrow-right-line opacity-50"></i>
                            <span className="font-semibold">{err.corrected}</span>
                          </div>
                          <p className="text-xs opacity-70">{err.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                <div className="bg-[#1a1f2e] rounded-xl p-5 border border-app-border">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <i className="ri-lightbulb-line text-app-accent-primary"></i>
                    G?i ý c?i thi?n
                  </h3>
                  <ul className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <span className="text-app-accent-primary mt-0.5 flex-shrink-0">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setActiveTab("write")}
                  className="w-full py-2.5 rounded-xl bg-white/8 text-white/60 text-sm hover:bg-white/12 transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-edit-line mr-1.5"></i>
                  Vi?t l?i
                </button>
              </div>
            )}

            {activeTab === "result" && !result && (
              <div className="bg-[#1a1f2e] rounded-xl p-12 border border-app-border text-center text-app-text-muted">
                <i className="ri-robot-line text-4xl mb-3 block"></i>
                <p>Chua có k?t qu?. Hãy vi?t bài và nh?n "AI Ch?m bài"</p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            {history.length > 0 && (
              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-app-border">
                <h3 className="text-white/70 text-sm font-semibold mb-3">L?ch s? g?n dây</h3>
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <p className="text-white/50 text-xs truncate flex-1">{h.text}</p>
                      <span className={`text-sm font-bold flex-shrink-0 ${scoreColor(h.score)}`}>{h.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt list */}
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-app-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white/70 text-sm font-semibold">Ð? bài g?i ý</h3>
              </div>
              <div className="flex gap-1 mb-3 flex-wrap">
                {["T?t c?", "A1", "A2", "B1", "B2", "C1"].map(l => (
                  <button
                    key={l}
                    onClick={() => setFilterLevel(l)}
                    className={`px-2 py-0.5 rounded text-xs transition-all cursor-pointer whitespace-nowrap ${
                      filterLevel === l ? "bg-app-accent-primary/20 text-app-accent-primary" : "bg-app-card/50 text-app-text-secondary hover:bg-app-card/70"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredPrompts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleUsePrompt(p)}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedPrompt?.id === p.id
                        ? "bg-app-accent-primary/10 border-app-accent-primary/20"
                        : "bg-app-surface/50 border-app-border hover:bg-white/6 hover:border-app-border"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${levelColor[p.level]}`}>{p.level}</span>
                      <span className="text-app-text-secondary text-[10px]">{p.topic}</span>
                    </div>
                    <p className="text-white/60 text-xs leading-snug">{p.prompt}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Grammar tips */}
            <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4">
              <h3 className="text-app-accent-primary text-sm font-semibold mb-2">
                <i className="ri-lightbulb-line mr-1.5"></i>
                M?o vi?t t?t hon
              </h3>
              <ul className="space-y-1.5 text-white/50 text-xs">
                <li>• Chú ý tr? t? ?/?, ?/?, ?/?</li>
                <li>• Dùng liên t? d? câu m?ch l?c hon</li>
                <li>• Chia d?ng t? dúng thì (quá kh?/hi?n t?i)</li>
                <li>• Vi?t ít nh?t 3-5 câu m?i l?n</li>
                <li>• Ð?c l?i tru?c khi n?p</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

