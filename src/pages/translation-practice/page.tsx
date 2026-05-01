import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface TranslationItem {
  id: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  levelColor: string;
  topic: string;
  type: "kr-vi" | "vi-kr";
  source: string;
  answer: string;
  hints: string[];
  notes?: string;
}

const items: TranslationItem[] = [
  // A1 KR→VI
  { id: "t1", level: "A1", levelColor: "#34d399", topic: "Chào hỏi", type: "kr-vi", source: "안녕하세요. 저는 학생입니다.", answer: "Xin chào. Tôi là học sinh.", hints: ["안녕하세요 = Xin chào", "저는 = Tôi là", "학생 = học sinh"] },
  { id: "t2", level: "A1", levelColor: "#34d399", topic: "Gia đình", type: "kr-vi", source: "우리 가족은 네 명이에요.", answer: "Gia đình tôi có bốn người.", hints: ["우리 = của tôi/chúng tôi", "가족 = gia đình", "네 명 = bốn người"] },
  { id: "t3", level: "A1", levelColor: "#34d399", topic: "Sở thích", type: "vi-kr", source: "Tôi thích ăn cơm Hàn Quốc.", answer: "저는 한국 밥을 좋아해요.", hints: ["좋아해요 = thích", "한국 = Hàn Quốc", "밥 = cơm"] },
  // A2
  { id: "t4", level: "A2", levelColor: "#6ee7b7", topic: "Thời tiết", type: "kr-vi", source: "오늘 날씨가 흐리고 비가 올 것 같아요.", answer: "Hôm nay trời âm u và có vẻ sẽ mưa.", hints: ["흐리다 = âm u", "비가 오다 = trời mưa", "-(으)ㄹ 것 같다 = có vẻ sẽ"] },
  { id: "t5", level: "A2", levelColor: "#6ee7b7", topic: "Mua sắm", type: "vi-kr", source: "Cái áo này bao nhiêu tiền? Có màu khác không?", answer: "이 옷이 얼마예요? 다른 색깔이 있어요?", hints: ["얼마예요 = bao nhiêu tiền", "다른 = khác", "색깔 = màu sắc"] },
  { id: "t6", level: "A2", levelColor: "#6ee7b7", topic: "Kế hoạch", type: "kr-vi", source: "주말에 친구와 같이 영화를 보러 갈 거예요.", answer: "Cuối tuần tôi sẽ đi xem phim cùng bạn.", hints: ["-러 가다 = đi để làm gì", "같이 = cùng nhau", "-(으)ㄹ 거예요 = sẽ"] },
  // B1
  { id: "t7", level: "B1", levelColor: "#fbbf24", topic: "Công việc", type: "kr-vi", source: "이번 프로젝트 마감일이 다가와서 야근을 해야 할 것 같아요.", answer: "Deadline dự án lần này đang đến gần nên có vẻ phải làm thêm giờ.", hints: ["마감일 = deadline", "다가오다 = đến gần", "야근 = làm thêm giờ"] },
  { id: "t8", level: "B1", levelColor: "#fbbf24", topic: "Sức khỏe", type: "vi-kr", source: "Dạo này tôi bị stress nhiều nên ngủ không ngon và hay mệt mỏi.", answer: "요즘 스트레스를 많이 받아서 잠을 잘 못 자고 자주 피곤해요.", hints: ["요즘 = dạo này", "스트레스를 받다 = bị stress", "-아/어서 = vì nên"] },
  { id: "t9", level: "B1", levelColor: "#fbbf24", topic: "Du lịch", type: "kr-vi", source: "한국에 처음 왔는데 볼거리도 많고 먹을거리도 풍부해서 정말 좋아요.", answer: "Đây là lần đầu tôi đến Hàn Quốc, có nhiều thứ để xem và ẩm thực phong phú nên thực sự tuyệt.", hints: ["처음 = lần đầu", "볼거리 = thứ để xem", "풍부하다 = phong phú"] },
  // B2
  { id: "t10", level: "B2", levelColor: "#f59e0b", topic: "Xã hội", type: "kr-vi", source: "현대 사회에서 소통 능력은 성공적인 직장 생활을 위해 필수적인 요소입니다.", answer: "Trong xã hội hiện đại, kỹ năng giao tiếp là yếu tố thiết yếu để có cuộc sống công sở thành công.", hints: ["소통 능력 = kỹ năng giao tiếp", "필수적 = thiết yếu", "요소 = yếu tố"] },
  { id: "t11", level: "B2", levelColor: "#f59e0b", topic: "Môi trường", type: "vi-kr", source: "Biến đổi khí hậu là vấn đề toàn cầu đòi hỏi sự hợp tác quốc tế để giải quyết.", answer: "기후 변화는 해결하기 위해 국제적 협력이 필요한 전 세계적인 문제입니다.", hints: ["기후 변화 = biến đổi khí hậu", "국제적 협력 = hợp tác quốc tế", "전 세계적 = toàn cầu"] },
  // C1
  { id: "t12", level: "C1", levelColor: "#f87171", topic: "Triết học", type: "kr-vi", source: "인간은 사회적 동물로서 타인과의 관계 속에서 자아를 형성하고 의미를 찾아나갑니다.", answer: "Con người là động vật xã hội, hình thành bản ngã và tìm kiếm ý nghĩa trong mối quan hệ với người khác.", hints: ["사회적 동물 = động vật xã hội", "자아를 형성하다 = hình thành bản ngã", "의미를 찾다 = tìm kiếm ý nghĩa"] },
  { id: "t13", level: "C1", levelColor: "#f87171", topic: "Kinh tế", type: "vi-kr", source: "Toàn cầu hóa mang lại cả cơ hội lẫn thách thức cho các nền kinh tế đang phát triển.", answer: "세계화는 개발도상국 경제에 기회와 도전을 동시에 가져다줍니다.", hints: ["세계화 = toàn cầu hóa", "개발도상국 = nước đang phát triển", "동시에 = đồng thời"] },
];

// ─── Similarity check ─────────────────────────────────────────────────────────
function checkSimilarity(input: string, answer: string): number {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ");
  const a = normalize(input);
  const b = normalize(answer);
  if (a === b) return 100;
  const aWords = new Set(a.split(" "));
  const bWords = b.split(" ");
  const matches = bWords.filter(w => aWords.has(w)).length;
  return Math.round((matches / bWords.length) * 100);
}

const levelConfig: Record<string, { color: string; label: string }> = {
  A1: { color: "#34d399", label: "A1" },
  A2: { color: "#6ee7b7", label: "A2" },
  B1: { color: "#fbbf24", label: "B1" },
  B2: { color: "#f59e0b", label: "B2" },
  C1: { color: "#f87171", label: "C1" },
};

export default function TranslationPracticePage() {
  const [levelFilter, setLevelFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "kr-vi" | "vi-kr">("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});

  const filtered = useMemo(() => items.filter(it => {
    const matchLevel = levelFilter === "all" || it.level === levelFilter;
    const matchType = typeFilter === "all" || it.type === typeFilter;
    return matchLevel && matchType;
  }), [levelFilter, typeFilter]);

  const current = filtered[currentIdx];
  const avgScore = Object.values(scores).length > 0
    ? Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / Object.values(scores).length)
    : 0;

  const handleCheck = () => {
    if (!current || !input.trim()) return;
    const sim = checkSimilarity(input, current.answer);
    setScores(prev => ({ ...prev, [current.id]: sim }));
    setSubmitted(true);
  };

  const handleNext = () => {
    setInput("");
    setSubmitted(false);
    setShowHints(false);
    setCurrentIdx(i => Math.min(filtered.length - 1, i + 1));
  };

  const handleTTS = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = lang;
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  const similarity = submitted && current ? checkSimilarity(input, current.answer) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white font-bold text-2xl mb-1">Luyện dịch Hàn-Việt</h1>
          <p className="text-white/50 text-sm">Dịch câu và đoạn văn theo cấp độ — cả Hàn→Việt và Việt→Hàn</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Đã dịch", value: Object.keys(scores).length, icon: "ri-translate-2", color: "#e8c84a" },
            { label: "Điểm TB", value: `${avgScore}%`, icon: "ri-percent-line", color: "#34d399" },
            { label: "Tổng câu", value: items.length, icon: "ri-list-check", color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${s.color}20` }}>
                <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
              </div>
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
            {(["all", "kr-vi", "vi-kr"] as const).map(t => (
              <button key={t} onClick={() => { setTypeFilter(t); setCurrentIdx(0); setInput(""); setSubmitted(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${typeFilter === t ? "bg-[#e8c84a] text-[#141720]" : "text-white/50 hover:text-white/80"}`}>
                {t === "all" ? "Tất cả" : t === "kr-vi" ? "Hàn → Việt" : "Việt → Hàn"}
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            {["all", "A1", "A2", "B1", "B2", "C1"].map(lvl => (
              <button key={lvl} onClick={() => { setLevelFilter(lvl); setCurrentIdx(0); setInput(""); setSubmitted(false); }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
                style={levelFilter === lvl
                  ? (lvl === "all" ? { backgroundColor: "rgba(255,255,255,0.15)", color: "white" } : { backgroundColor: levelConfig[lvl]?.color, color: "#141720" })
                  : { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
                {lvl === "all" ? "Tất cả" : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => { setCurrentIdx(i => Math.max(0, i - 1)); setInput(""); setSubmitted(false); setShowHints(false); }}
              disabled={currentIdx === 0}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/50 disabled:opacity-30 cursor-pointer">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <span className="text-white/50 text-sm">{currentIdx + 1} / {filtered.length}</span>
            <button onClick={() => { setCurrentIdx(i => Math.min(filtered.length - 1, i + 1)); setInput(""); setSubmitted(false); setShowHints(false); }}
              disabled={currentIdx >= filtered.length - 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/50 disabled:opacity-30 cursor-pointer">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
          <div className="flex gap-1">
            {filtered.slice(0, 13).map((it, i) => (
              <button key={it.id} onClick={() => { setCurrentIdx(i); setInput(""); setSubmitted(false); setShowHints(false); }}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === currentIdx ? "bg-[#e8c84a] w-4" : scores[it.id] ? "bg-emerald-400" : "bg-white/15"}`} />
            ))}
          </div>
        </div>

        {current && (
          <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
            {/* Level + type badge */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${current.levelColor}20`, color: current.levelColor }}>{current.level}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${current.type === "kr-vi" ? "bg-amber-500/15 text-amber-400" : "bg-sky-500/15 text-sky-400"}`}>
                {current.type === "kr-vi" ? "Hàn → Việt" : "Việt → Hàn"}
              </span>
              <span className="text-white/30 text-xs">{current.topic}</span>
            </div>

            {/* Source text */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/8 mb-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white/40 text-xs mb-2">{current.type === "kr-vi" ? "Tiếng Hàn" : "Tiếng Việt"}</p>
                  <p className="text-white font-medium text-lg leading-8">{current.source}</p>
                </div>
                {current.type === "kr-vi" && (
                  <button onClick={() => handleTTS(current.source, "ko-KR")}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/8 hover:bg-white/15 text-white/40 hover:text-white/70 cursor-pointer flex-shrink-0">
                    <i className="ri-volume-up-line"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Input */}
            {!submitted ? (
              <>
                <p className="text-white/50 text-xs mb-2">Dịch sang {current.type === "kr-vi" ? "tiếng Việt" : "tiếng Hàn"}:</p>
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  placeholder={current.type === "kr-vi" ? "Nhập bản dịch tiếng Việt..." : "Nhập bản dịch tiếng Hàn..."}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none placeholder-white/20 focus:border-white/20 mb-4" />

                {/* Hints */}
                <button onClick={() => setShowHints(v => !v)}
                  className="flex items-center gap-2 text-white/40 hover:text-white/60 text-xs mb-4 cursor-pointer transition-colors">
                  <i className="ri-lightbulb-line text-[#e8c84a]"></i>
                  {showHints ? "Ẩn gợi ý" : "Xem gợi ý"}
                </button>
                {showHints && (
                  <div className="grid grid-cols-1 gap-1.5 mb-4">
                    {current.hints.map((h, i) => (
                      <div key={i} className="px-3 py-2 rounded-lg bg-[#e8c84a]/5 border border-[#e8c84a]/15">
                        <p className="text-white/60 text-xs">{h}</p>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={handleCheck} disabled={!input.trim()}
                  className="w-full py-3 rounded-xl bg-[#e8c84a] text-[#141720] font-bold text-sm disabled:opacity-30 cursor-pointer whitespace-nowrap">
                  Kiểm tra bản dịch
                </button>
              </>
            ) : (
              <>
                {/* Result */}
                <div className={`p-4 rounded-xl border mb-4 ${similarity >= 80 ? "border-emerald-500/30 bg-emerald-500/5" : similarity >= 50 ? "border-amber-500/30 bg-amber-500/5" : "border-rose-500/30 bg-rose-500/5"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-bold text-sm ${similarity >= 80 ? "text-emerald-400" : similarity >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                      {similarity >= 80 ? "Rất tốt!" : similarity >= 50 ? "Khá ổn!" : "Cần cải thiện"} — {similarity}% khớp
                    </span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`text-sm ${i < Math.round(similarity / 20) ? "ri-star-fill text-[#e8c84a]" : "ri-star-line text-white/15"}`}></i>
                      ))}
                    </div>
                  </div>
                  <p className="text-white/50 text-xs mb-1">Bản dịch của bạn:</p>
                  <p className="text-white/70 text-sm mb-3">{input}</p>
                </div>

                {/* Correct answer */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/8 mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white/40 text-xs mb-1">Đáp án tham khảo:</p>
                      <p className="text-white font-medium text-base leading-7">{current.answer}</p>
                      {current.notes && <p className="text-white/40 text-xs mt-2 italic">{current.notes}</p>}
                    </div>
                    {current.type === "vi-kr" && (
                      <button onClick={() => handleTTS(current.answer, "ko-KR")}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/8 hover:bg-white/15 text-white/40 hover:text-white/70 cursor-pointer flex-shrink-0">
                        <i className="ri-volume-up-line"></i>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => { setInput(""); setSubmitted(false); setShowHints(false); }}
                    className="flex-1 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-white/60 text-sm cursor-pointer whitespace-nowrap">
                    Thử lại
                  </button>
                  <button onClick={handleNext} disabled={currentIdx >= filtered.length - 1}
                    className="flex-1 py-2.5 rounded-xl bg-[#e8c84a] text-[#141720] font-bold text-sm disabled:opacity-30 cursor-pointer whitespace-nowrap">
                    Câu tiếp <i className="ri-arrow-right-line ml-1"></i>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* All items list */}
        <div className="mt-6">
          <p className="text-white/40 text-xs font-semibold tracking-normal mb-3">Tất cả câu ({filtered.length})</p>
          <div className="space-y-2">
            {filtered.map((it, i) => (
              <button key={it.id} onClick={() => { setCurrentIdx(i); setInput(""); setSubmitted(false); setShowHints(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left cursor-pointer transition-all ${i === currentIdx ? "border-[#e8c84a]/30 bg-[#e8c84a]/5" : "border-white/8 bg-white/3 hover:bg-white/5"}`}>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${it.levelColor}20`, color: it.levelColor }}>{it.level}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${it.type === "kr-vi" ? "bg-amber-500/15 text-amber-400" : "bg-sky-500/15 text-sky-400"}`}>
                  {it.type === "kr-vi" ? "KR→VI" : "VI→KR"}
                </span>
                <span className="text-white/60 text-sm flex-1 truncate">{it.source}</span>
                {scores[it.id] !== undefined && (
                  <span className={`text-xs font-bold flex-shrink-0 ${scores[it.id] >= 80 ? "text-emerald-400" : scores[it.id] >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                    {scores[it.id]}%
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

