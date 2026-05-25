import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface DictationItem {
  id: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  levelColor: string;
  topic: string;
  korean: string;
  vietnamese: string;
  hint?: string;
}

const dictationItems: DictationItem[] = [
  { id: "d1", level: "A1", levelColor: "#34d399", topic: "Chào hỏi", korean: "안녕하세요. 만나서 반갑습니다.", vietnamese: "Xin chào. Rất vui được gặp bạn.", hint: "Câu chào hỏi cơ bản" },
  { id: "d2", level: "A1", levelColor: "#34d399", topic: "Giới thiệu", korean: "저는 베트남 사람입니다.", vietnamese: "Tôi là người Việt Nam.", hint: "Giới thiệu quốc tịch" },
  { id: "d3", level: "A1", levelColor: "#34d399", topic: "Số đếm", korean: "사과가 세 개 있어요.", vietnamese: "Có ba quả táo.", hint: "Đếm đồ vật" },
  { id: "d4", level: "A2", levelColor: "#6ee7b7", topic: "Thời tiết", korean: "오늘 날씨가 맑고 따뜻해요.", vietnamese: "Hôm nay thời tiết trong sáng và ấm áp.", hint: "Mô tả thời tiết" },
  { id: "d5", level: "A2", levelColor: "#6ee7b7", topic: "Mua sắm", korean: "이 옷이 얼마예요? 좀 비싸네요.", vietnamese: "Bộ quần áo này bao nhiêu tiền? Hơi đắt nhỉ.", hint: "Hỏi giá" },
  { id: "d6", level: "A2", levelColor: "#6ee7b7", topic: "Kế hoạch", korean: "내일 친구와 같이 영화를 볼 거예요.", vietnamese: "Ngày mai tôi sẽ xem phim cùng bạn.", hint: "Kế hoạch tương lai" },
  { id: "d7", level: "B1", levelColor: "#fbbf24", topic: "Sức khỏe", korean: "요즘 스트레스를 많이 받아서 잠을 잘 못 자요.", vietnamese: "Dạo này tôi bị nhiều stress nên ngủ không ngon.", hint: "Vấn đề sức khỏe" },
  { id: "d8", level: "B1", levelColor: "#fbbf24", topic: "Du lịch", korean: "한국에 처음 왔는데 볼거리가 정말 많네요.", vietnamese: "Đây là lần đầu tôi đến Hàn Quốc và có rất nhiều thứ để xem.", hint: "Trải nghiệm du lịch" },
  { id: "d9", level: "B1", levelColor: "#fbbf24", topic: "Công việc", korean: "이번 프로젝트를 성공적으로 마무리했어요.", vietnamese: "Tôi đã hoàn thành dự án lần này một cách thành công.", hint: "Kết quả công việc" },
  { id: "d10", level: "B2", levelColor: "#f59e0b", topic: "Xã hội", korean: "현대 사회에서 소통 능력은 매우 중요한 역할을 합니다.", vietnamese: "Trong xã hội hiện đại, kỹ năng giao tiếp đóng vai trò rất quan trọng.", hint: "Câu văn phức tạp" },
  { id: "d11", level: "B2", levelColor: "#f59e0b", topic: "Giáo dục", korean: "교육의 목적은 단순히 지식을 전달하는 것이 아니라 사고력을 키우는 것입니다.", vietnamese: "Mục đích của giáo dục không chỉ là truyền đạt kiến thức mà còn là phát triển tư duy.", hint: "Câu phức với cấu trúc nâng cao" },
  { id: "d12", level: "C1", levelColor: "#f87171", topic: "Triết học", korean: "인간은 사회적 동물로서 타인과의 관계 속에서 자아를 형성해 나갑니다.", vietnamese: "Con người là động vật xã hội, hình thành bản ngã trong mối quan hệ với người khác.", hint: "Câu học thuật phức tạp" },
];

// ─── Compare function ─────────────────────────────────────────────────────────
function compareTexts(input: string, answer: string): { correct: boolean; similarity: number; diff: { char: string; correct: boolean }[] } {
  const normalize = (s: string) => s.trim().replace(/\s+/g, " ");
  const inp = normalize(input);
  const ans = normalize(answer);

  if (inp === ans) return { correct: true, similarity: 100, diff: ans.split("").map(c => ({ char: c, correct: true })) };

  // Simple character-level comparison
  const diff: { char: string; correct: boolean }[] = [];
  let correctCount = 0;
  const maxLen = Math.max(inp.length, ans.length);

  for (let i = 0; i < ans.length; i++) {
    const isCorrect = inp[i] === ans[i];
    if (isCorrect) correctCount++;
    diff.push({ char: ans[i], correct: isCorrect });
  }

  const similarity = Math.round((correctCount / ans.length) * 100);
  return { correct: similarity >= 95, similarity, diff };
}

// ─── Dictation Card ───────────────────────────────────────────────────────────
function DictationCard({ item, onComplete }: { item: DictationItem; onComplete: (score: number) => void }) {
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof compareTexts> | null>(null);
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handlePlay = (slow = false) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(item.korean);
      utt.lang = "ko-KR";
      utt.rate = slow ? 0.6 : 0.85;
      setIsPlaying(true);
      utt.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utt);
      setPlayCount(c => c + 1);
    }
  };

  const handleCheck = () => {
    const r = compareTexts(input, item.korean);
    setResult(r);
    setRevealed(true);
    onComplete(r.similarity);
  };

  return (
    <div className="rounded-2xl border border-app-border bg-app-surface/50 p-6">
      {/* Level + topic */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${item.levelColor}20`, color: item.levelColor }}>{item.level}</span>
        <span className="text-app-text-secondary text-xs">{item.topic}</span>
        {item.hint && <span className="text-app-text-muted text-xs">· {item.hint}</span>}
      </div>

      {/* Play buttons */}
      <div className="flex gap-3 mb-5">
        <button onClick={() => handlePlay(false)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all whitespace-nowrap ${isPlaying ? "bg-app-accent-primary/30 text-app-accent-primary" : "bg-app-accent-primary text-[#141720] hover:opacity-90"}`}>
          <i className={isPlaying ? "ri-pause-circle-line" : "ri-play-circle-line"}></i>
          {isPlaying ? "Đang phát..." : "Nghe"}
        </button>
        <button onClick={() => handlePlay(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/8 hover:bg-white/12 text-white/60 hover:text-white text-sm cursor-pointer transition-all whitespace-nowrap">
          <i className="ri-speed-line"></i>
          Chậm
        </button>
        {playCount > 0 && (
          <span className="flex items-center text-app-text-muted text-xs ml-auto">
            <i className="ri-repeat-line mr-1"></i>{playCount} lần
          </span>
        )}
      </div>

      {/* Input */}
      {!revealed ? (
        <div>
          <p className="text-white/50 text-xs mb-2">Viết lại những gì bạn nghe được:</p>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Gõ tiếng Hàn ở đây..."
            rows={3}
            className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white text-sm outline-none resize-none placeholder-white/20 focus:border-white/20 mb-4"
          />
          <div className="flex gap-3">
            <button onClick={handleCheck} disabled={!input.trim()}
              className="flex-1 py-3 rounded-xl bg-app-accent-primary text-[#141720] font-bold text-sm disabled:opacity-30 cursor-pointer whitespace-nowrap">
              Kiểm tra
            </button>
            <button onClick={() => { setRevealed(true); setResult(null); }}
              className="px-4 py-3 rounded-xl bg-white/8 hover:bg-white/12 text-white/50 text-sm cursor-pointer whitespace-nowrap">
              Xem đáp án
            </button>
          </div>
        </div>
      ) : (
        <div>
          {result && (
            <div className={`p-4 rounded-xl border mb-4 ${result.correct ? "border-emerald-500/30 bg-emerald-500/5" : result.similarity >= 70 ? "border-amber-500/30 bg-amber-500/5" : "border-rose-500/30 bg-rose-500/5"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-bold ${result.correct ? "text-app-accent-success" : result.similarity >= 70 ? "text-amber-400" : "text-rose-400"}`}>
                  {result.correct ? "Chính xác!" : `${result.similarity}% đúng`}
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`text-sm ${i < Math.round(result.similarity / 20) ? "ri-star-fill text-app-accent-primary" : "ri-star-line text-white/15"}`}></i>
                  ))}
                </div>
              </div>
              {!result.correct && (
                <div className="text-sm">
                  <p className="text-app-text-secondary text-xs mb-1">Bạn viết:</p>
                  <p className="text-white/60 mb-2">{input}</p>
                </div>
              )}
            </div>
          )}

          {/* Answer */}
          <div className="p-4 rounded-xl bg-app-card/50 border border-app-border mb-4">
            <p className="text-app-text-secondary text-xs mb-2">Đáp án đúng:</p>
            <p className="text-white font-medium text-base leading-8">{item.korean}</p>
            <p className="text-app-text-secondary text-sm mt-1 italic">{item.vietnamese}</p>
          </div>

          <button onClick={() => { setInput(""); setRevealed(false); setResult(null); setPlayCount(0); }}
            className="w-full py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-white/60 text-sm cursor-pointer whitespace-nowrap">
            <i className="ri-refresh-line mr-2"></i>Thử lại
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DictationPracticePage() {
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [mode, setMode] = useState<"browse" | "practice">("browse");

  const levelConfig: Record<string, { color: string; label: string }> = {
    A1: { color: "#34d399", label: "A1" },
    A2: { color: "#6ee7b7", label: "A2" },
    B1: { color: "#fbbf24", label: "B1" },
    B2: { color: "#f59e0b", label: "B2" },
    C1: { color: "#f87171", label: "C1" },
  };

  const filtered = selectedLevel === "all" ? dictationItems : dictationItems.filter(d => d.level === selectedLevel);
  const current = filtered[currentIdx];
  const avgScore = Object.values(scores).length > 0
    ? Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / Object.values(scores).length)
    : 0;

  const handleComplete = (score: number) => {
    if (current) setScores(prev => ({ ...prev, [current.id]: score }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white font-bold text-2xl mb-1">Luyện nghe chép chính tả</h1>
          <p className="text-white/50 text-sm">Nghe và viết lại tiếng Hàn — so sánh với đáp án để cải thiện chính tả</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Đã luyện", value: Object.keys(scores).length, icon: "ri-checkbox-circle-line", color: "#34d399" },
            { label: "Điểm TB", value: `${avgScore}%`, icon: "ri-percent-line", color: "#e8c84a" },
            { label: "Tổng câu", value: dictationItems.length, icon: "ri-list-check", color: "#a78bfa" },
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

        {/* Level filter */}
        <div className="flex gap-2 flex-wrap mb-5">
          <button onClick={() => { setSelectedLevel("all"); setCurrentIdx(0); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${selectedLevel === "all" ? "bg-white/15 text-white" : "bg-app-card/50 text-white/50 hover:bg-white/8"}`}>
            Tất cả ({dictationItems.length})
          </button>
          {Object.entries(levelConfig).map(([lvl, cfg]) => {
            const count = dictationItems.filter(d => d.level === lvl).length;
            return (
              <button key={lvl} onClick={() => { setSelectedLevel(lvl); setCurrentIdx(0); }}
                className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap`}
                style={selectedLevel === lvl ? { backgroundColor: cfg.color, color: "#141720" } : { backgroundColor: `${cfg.color}15`, color: cfg.color }}>
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-app-card/50 hover:bg-app-card/70 text-white/50 disabled:opacity-30 cursor-pointer transition-colors">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <span className="text-white/50 text-sm">{currentIdx + 1} / {filtered.length}</span>
            <button onClick={() => setCurrentIdx(i => Math.min(filtered.length - 1, i + 1))} disabled={currentIdx >= filtered.length - 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-app-card/50 hover:bg-app-card/70 text-white/50 disabled:opacity-30 cursor-pointer transition-colors">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1 flex-wrap max-w-xs justify-end">
            {filtered.slice(0, 12).map((item, i) => (
              <button key={item.id} onClick={() => setCurrentIdx(i)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === currentIdx ? "bg-app-accent-primary w-4" : scores[item.id] ? "bg-emerald-400" : "bg-white/15"}`} />
            ))}
          </div>
        </div>

        {/* Current card */}
        {current && (
          <DictationCard key={current.id} item={current} onComplete={handleComplete} />
        )}

        {/* All items list */}
        <div className="mt-6">
          <p className="text-app-text-secondary text-xs font-semibold tracking-normal mb-3">Tất cả câu luyện tập</p>
          <div className="space-y-2">
            {filtered.map((item, i) => (
              <button key={item.id} onClick={() => setCurrentIdx(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left cursor-pointer transition-all ${i === currentIdx ? "border-app-accent-primary/30 bg-app-accent-primary/5" : "border-app-border bg-app-surface/50 hover:bg-app-card/50"}`}>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${item.levelColor}20`, color: item.levelColor }}>{item.level}</span>
                <span className="text-white/70 text-sm flex-1 truncate">{item.korean}</span>
                {scores[item.id] !== undefined && (
                  <span className={`text-xs font-bold flex-shrink-0 ${scores[item.id] >= 95 ? "text-app-accent-success" : scores[item.id] >= 70 ? "text-amber-400" : "text-rose-400"}`}>
                    {scores[item.id]}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

