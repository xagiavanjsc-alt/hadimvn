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
  { id: "p1", level: "A1", topic: "Tự giới thiệu", prompt: "자기소개를 써 보세요. (Hãy viết bài tự giới thiệu về bản thân)", example: "안녕하세요. 저는 [이름]이에요. 저는 [나라]에서 왔어요." },
  { id: "p2", level: "A2", topic: "Gia đình", prompt: "가족에 대해 써 보세요. (Hãy viết về gia đình bạn)", example: "우리 가족은 [숫자]명이에요. 아버지, 어머니, 그리고 저예요." },
  { id: "p3", level: "A2", topic: "Sở thích", prompt: "취미에 대해 써 보세요. (Hãy viết về sở thích của bạn)", example: "저는 [취미]을/를 좋아해요. 주말에 자주 해요." },
  { id: "p4", level: "B1", topic: "Ngày cuối tuần", prompt: "지난 주말에 무엇을 했는지 써 보세요. (Hãy viết về những gì bạn đã làm cuối tuần qua)", example: "지난 주말에 저는 친구와 함께 영화를 봤어요." },
  { id: "p5", level: "B1", topic: "Kế hoạch tương lai", prompt: "미래 계획에 대해 써 보세요. (Hãy viết về kế hoạch tương lai của bạn)", example: "저는 앞으로 한국어를 더 열심히 공부할 거예요." },
  { id: "p6", level: "B2", topic: "Ưu nhược điểm", prompt: "스마트폰의 장단점에 대해 써 보세요. (Hãy viết về ưu và nhược điểm của điện thoại thông minh)", example: "스마트폰은 편리하지만 중독될 수 있어요." },
  { id: "p7", level: "B2", topic: "Môi trường", prompt: "환경 보호에 대한 의견을 써 보세요. (Hãy viết ý kiến về bảo vệ môi trường)", example: "환경 보호는 우리 모두의 책임이라고 생각해요." },
  { id: "p8", level: "C1", topic: "Xã hội", prompt: "현대 사회의 문제점에 대해 논술하세요. (Hãy luận về các vấn đề của xã hội hiện đại)", example: "현대 사회에서는 다양한 문제들이 발생하고 있습니다." },
];

const SAMPLE_ERRORS: GrammarError[] = [
  { original: "저는 학생이에요", corrected: "저는 학생이에요", explanation: "Câu đúng! Cấu trúc 이에요 dùng sau phụ âm cuối.", type: "grammar", position: 0 },
  { original: "한국어 배워요", corrected: "한국어를 배워요", explanation: "Thiếu trợ từ 를 sau 한국어 (kết thúc bằng nguyên âm).", type: "grammar", position: 1 },
  { original: "어제 학교 갔어요", corrected: "어제 학교에 갔어요", explanation: "Thiếu trợ từ 에 chỉ địa điểm sau 학교.", type: "grammar", position: 2 },
  { original: "친구하고 같이 공부했어요", corrected: "친구하고 같이 공부했어요", explanation: "Câu đúng! 하고 dùng để nối danh từ.", type: "grammar", position: 3 },
];

function simulateAIGrading(text: string): WritingResult {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
  const wordCount = words.length;
  const sentenceCount = sentences.length;

  // Simulate scoring based on length and content
  const lengthBonus = Math.min(20, wordCount * 2);
  const grammarScore = Math.min(100, 55 + lengthBonus + Math.floor(Math.random() * 20));
  const vocabScore = Math.min(100, 50 + lengthBonus + Math.floor(Math.random() * 25));
  const coherenceScore = Math.min(100, 60 + Math.floor(Math.random() * 30));
  const overallScore = Math.round((grammarScore * 0.4 + vocabScore * 0.3 + coherenceScore * 0.3));

  const hasKorean = /[가-힣]/.test(text);
  const errors: GrammarError[] = hasKorean ? SAMPLE_ERRORS.slice(0, Math.floor(Math.random() * 3) + 1) : [];

  let feedback = "";
  if (overallScore >= 85) feedback = "Xuất sắc! Bài viết rất tốt, ngữ pháp chuẩn và từ vựng phong phú.";
  else if (overallScore >= 70) feedback = "Tốt! Bài viết khá tốt. Cần chú ý thêm một số điểm ngữ pháp nhỏ.";
  else if (overallScore >= 55) feedback = "Khá! Bài viết có nội dung nhưng cần cải thiện ngữ pháp và từ vựng.";
  else feedback = "Cần cố gắng thêm. Hãy chú ý đến cấu trúc câu và trợ từ tiếng Hàn.";

  const suggestions = [
    "Sử dụng đa dạng cấu trúc câu hơn (không chỉ dùng 이에요/아요/어요)",
    "Thêm các liên từ như 그리고, 그래서, 하지만 để bài viết mạch lạc hơn",
    "Dùng thêm tính từ và trạng từ để bài viết sinh động hơn",
    wordCount < 30 ? "Viết dài hơn — ít nhất 50 từ để luyện tập hiệu quả" : "Độ dài bài viết tốt!",
  ].filter(Boolean);

  const correctedText = text; // In real app, AI would correct this

  return { overallScore, grammarScore, vocabScore, coherenceScore, feedback, errors, correctedText, suggestions, wordCount, sentenceCount };
}

const levelColor: Record<string, string> = {
  A1: "bg-emerald-500/20 text-emerald-400",
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
  grammar: "Ngữ pháp",
  spelling: "Chính tả",
  style: "Văn phong",
  vocab: "Từ vựng",
};

export default function AIWritingPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<WritingResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<typeof WRITING_PROMPTS[0] | null>(null);
  const [filterLevel, setFilterLevel] = useState("Tất cả");
  const [history, setHistory] = useState<{ text: string; score: number; date: string }[]>([]);
  const [activeTab, setActiveTab] = useState<"write" | "result">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredPrompts = filterLevel === "Tất cả"
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
    if (s >= 85) return "text-emerald-400";
    if (s >= 70) return "text-[#e8c84a]";
    if (s >= 55) return "text-orange-400";
    return "text-rose-400";
  };

  const scoreBg = (s: number) => {
    if (s >= 85) return "bg-emerald-500";
    if (s >= 70) return "bg-[#e8c84a]";
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
            <h1 className="text-2xl font-bold text-white">AI Chấm Viết</h1>
            <p className="text-white/50 text-sm mt-1">Viết tiếng Hàn và nhận đánh giá chi tiết từ AI</p>
          </div>
          {history.length > 0 && (
            <div className="text-right">
              <p className={`text-2xl font-bold ${scoreColor(avgScore)}`}>{avgScore}</p>
              <p className="text-white/30 text-xs">Điểm TB</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Writing area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Prompt selector */}
            {selectedPrompt && (
              <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/20 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${levelColor[selectedPrompt.level]}`}>{selectedPrompt.level}</span>
                      <span className="text-white/40 text-xs">{selectedPrompt.topic}</span>
                    </div>
                    <p className="text-white/80 text-sm font-medium">{selectedPrompt.prompt}</p>
                    <p className="text-white/40 text-xs mt-1">Ví dụ: {selectedPrompt.example}</p>
                  </div>
                  <button onClick={() => setSelectedPrompt(null)} className="text-white/30 hover:text-white/60 cursor-pointer">
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
              {(["write", "result"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab ? "bg-[#e8c84a]/20 text-[#e8c84a] font-semibold" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {tab === "write" ? "Viết bài" : "Kết quả"}
                  {tab === "result" && result && (
                    <span className={`ml-1.5 text-xs font-bold ${scoreColor(result.overallScore)}`}>{result.overallScore}</span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === "write" && (
              <div className="bg-[#1a1f2e] rounded-xl border border-white/8 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                  <span className="text-white/40 text-xs">Viết tiếng Hàn bên dưới</span>
                  <span className="text-white/30 text-xs">{text.trim().split(/\s+/).filter(w => w).length} từ</span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="안녕하세요. 저는... (Bắt đầu viết tiếng Hàn tại đây)"
                  className="w-full bg-transparent text-white/80 text-sm p-4 resize-none focus:outline-none placeholder-white/20 leading-relaxed"
                  rows={10}
                  maxLength={2000}
                />
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                  <span className="text-white/20 text-xs">{text.length}/2000 ký tự</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setText(""); setResult(null); }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-white/40 text-sm hover:bg-white/10 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={handleAnalyze}
                      disabled={!text.trim() || text.trim().length < 5 || isAnalyzing}
                      className="px-5 py-1.5 rounded-lg bg-[#e8c84a] text-black text-sm font-bold hover:bg-[#e8c84a]/90 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                          Đang chấm...
                        </>
                      ) : (
                        <>
                          <i className="ri-robot-line"></i>
                          AI Chấm bài
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
                <div className="bg-[#1a1f2e] rounded-xl p-5 border border-white/8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold">Kết quả đánh giá</h3>
                    <div className={`text-4xl font-bold ${scoreColor(result.overallScore)}`}>{result.overallScore}<span className="text-lg text-white/30">/100</span></div>
                  </div>
                  <div className="h-2 bg-white/8 rounded-full overflow-hidden mb-4">
                    <div className={`h-full rounded-full transition-all duration-1000 ${scoreBg(result.overallScore)}`} style={{ width: `${result.overallScore}%` }}></div>
                  </div>
                  <p className="text-white/70 text-sm mb-4">{result.feedback}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Ngữ pháp", score: result.grammarScore, icon: "ri-book-2-line" },
                      { label: "Từ vựng", score: result.vocabScore, icon: "ri-translate-2" },
                      { label: "Mạch lạc", score: result.coherenceScore, icon: "ri-flow-chart" },
                    ].map(item => (
                      <div key={item.label} className="bg-white/5 rounded-lg p-3 text-center">
                        <i className={`${item.icon} text-white/30 text-lg mb-1 block`}></i>
                        <p className={`text-xl font-bold ${scoreColor(item.score)}`}>{item.score}</p>
                        <p className="text-white/40 text-xs">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-white/30 text-xs">
                    <span><i className="ri-text mr-1"></i>{result.wordCount} từ</span>
                    <span><i className="ri-list-check mr-1"></i>{result.sentenceCount} câu</span>
                  </div>
                </div>

                {/* Errors */}
                {result.errors.length > 0 && (
                  <div className="bg-[#1a1f2e] rounded-xl p-5 border border-white/8">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <i className="ri-error-warning-line text-amber-400"></i>
                      Lỗi cần sửa ({result.errors.length})
                    </h3>
                    <div className="space-y-3">
                      {result.errors.map((err, i) => (
                        <div key={i} className={`rounded-lg p-3 border ${errorTypeColor[err.type]}`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-white/10">{errorTypeLabel[err.type]}</span>
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
                <div className="bg-[#1a1f2e] rounded-xl p-5 border border-white/8">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <i className="ri-lightbulb-line text-[#e8c84a]"></i>
                    Gợi ý cải thiện
                  </h3>
                  <ul className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <span className="text-[#e8c84a] mt-0.5 flex-shrink-0">•</span>
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
                  Viết lại
                </button>
              </div>
            )}

            {activeTab === "result" && !result && (
              <div className="bg-[#1a1f2e] rounded-xl p-12 border border-white/8 text-center text-white/30">
                <i className="ri-robot-line text-4xl mb-3 block"></i>
                <p>Chưa có kết quả. Hãy viết bài và nhấn "AI Chấm bài"</p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            {history.length > 0 && (
              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-white/8">
                <h3 className="text-white/70 text-sm font-semibold mb-3">Lịch sử gần đây</h3>
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
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-white/8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white/70 text-sm font-semibold">Đề bài gợi ý</h3>
              </div>
              <div className="flex gap-1 mb-3 flex-wrap">
                {["Tất cả", "A1", "A2", "B1", "B2", "C1"].map(l => (
                  <button
                    key={l}
                    onClick={() => setFilterLevel(l)}
                    className={`px-2 py-0.5 rounded text-xs transition-all cursor-pointer whitespace-nowrap ${
                      filterLevel === l ? "bg-[#e8c84a]/20 text-[#e8c84a]" : "bg-white/5 text-white/40 hover:bg-white/10"
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
                        ? "bg-[#e8c84a]/10 border-[#e8c84a]/20"
                        : "bg-white/3 border-white/5 hover:bg-white/6 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${levelColor[p.level]}`}>{p.level}</span>
                      <span className="text-white/40 text-[10px]">{p.topic}</span>
                    </div>
                    <p className="text-white/60 text-xs leading-snug">{p.prompt}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Grammar tips */}
            <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-4">
              <h3 className="text-[#e8c84a] text-sm font-semibold mb-2">
                <i className="ri-lightbulb-line mr-1.5"></i>
                Mẹo viết tốt hơn
              </h3>
              <ul className="space-y-1.5 text-white/50 text-xs">
                <li>• Chú ý trợ từ 은/는, 이/가, 을/를</li>
                <li>• Dùng liên từ để câu mạch lạc hơn</li>
                <li>• Chia động từ đúng thì (quá khứ/hiện tại)</li>
                <li>• Viết ít nhất 3-5 câu mỗi lần</li>
                <li>• Đọc lại trước khi nộp</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
