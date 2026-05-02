import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface SentencePattern {
  id: string;
  pattern: string;
  patternVi: string;
  level: string;
  levelColor: string;
  category: string;
  explanation: string;
  examples: { korean: string; vietnamese: string; highlight: string[] }[];
  keyVocab: { word: string; meaning: string; pos: string }[];
}

const patterns: SentencePattern[] = [
  {
    id: "p1", pattern: "N은/는 N이에요/예요", patternVi: "N là N", level: "A1", levelColor: "#34d399",
    category: "Định nghĩa",
    explanation: "Câu định nghĩa cơ bản. 은/는 là trợ từ chủ đề, 이에요/예요 là 'là' (lịch sự).",
    examples: [
      { korean: "저는 학생이에요.", vietnamese: "Tôi là học sinh.", highlight: ["저는", "학생이에요"] },
      { korean: "이것은 책이에요.", vietnamese: "Đây là sách.", highlight: ["이것은", "책이에요"] },
      { korean: "한국어는 재미있어요.", vietnamese: "Tiếng Hàn thú vị.", highlight: ["한국어는", "재미있어요"] },
    ],
    keyVocab: [
      { word: "저", meaning: "tôi (khiêm tốn)", pos: "Đại từ" },
      { word: "학생", meaning: "học sinh", pos: "Danh từ" },
      { word: "이것", meaning: "cái này", pos: "Đại từ" },
      { word: "책", meaning: "sách", pos: "Danh từ" },
    ],
  },
  {
    id: "p2", pattern: "V-고 싶다", patternVi: "Muốn làm gì", level: "A2", levelColor: "#6ee7b7",
    category: "Mong muốn",
    explanation: "Diễn đạt mong muốn, ước muốn. Gắn -고 싶다 vào sau gốc động từ.",
    examples: [
      { korean: "한국에 가고 싶어요.", vietnamese: "Tôi muốn đi Hàn Quốc.", highlight: ["가고 싶어요"] },
      { korean: "한국어를 잘 하고 싶어요.", vietnamese: "Tôi muốn nói tiếng Hàn giỏi.", highlight: ["하고 싶어요"] },
      { korean: "맛있는 음식을 먹고 싶어요.", vietnamese: "Tôi muốn ăn đồ ăn ngon.", highlight: ["먹고 싶어요"] },
    ],
    keyVocab: [
      { word: "가다", meaning: "đi", pos: "Động từ" },
      { word: "잘 하다", meaning: "làm giỏi", pos: "Động từ" },
      { word: "맛있다", meaning: "ngon", pos: "Tính từ" },
      { word: "음식", meaning: "đồ ăn", pos: "Danh từ" },
    ],
  },
  {
    id: "p3", pattern: "V-(으)ㄹ 수 있다/없다", patternVi: "Có thể / Không thể làm gì", level: "A2", levelColor: "#6ee7b7",
    category: "Khả năng",
    explanation: "Diễn đạt khả năng. Dùng -ㄹ 수 있다 (có thể) hoặc -ㄹ 수 없다 (không thể).",
    examples: [
      { korean: "한국어를 말할 수 있어요.", vietnamese: "Tôi có thể nói tiếng Hàn.", highlight: ["말할 수 있어요"] },
      { korean: "지금 갈 수 없어요.", vietnamese: "Bây giờ tôi không thể đi.", highlight: ["갈 수 없어요"] },
      { korean: "수영을 할 수 있어요?", vietnamese: "Bạn có thể bơi không?", highlight: ["할 수 있어요"] },
    ],
    keyVocab: [
      { word: "말하다", meaning: "nói", pos: "Động từ" },
      { word: "수영", meaning: "bơi lội", pos: "Danh từ" },
      { word: "지금", meaning: "bây giờ", pos: "Trạng từ" },
    ],
  },
  {
    id: "p4", pattern: "A/V-아/어서", patternVi: "Vì... nên... / Và rồi...", level: "B1", levelColor: "#fbbf24",
    category: "Nguyên nhân",
    explanation: "Diễn đạt nguyên nhân-kết quả hoặc chuỗi hành động. Không dùng với mệnh lệnh/đề nghị.",
    examples: [
      { korean: "배가 고파서 밥을 먹었어요.", vietnamese: "Vì đói nên tôi đã ăn cơm.", highlight: ["고파서"] },
      { korean: "비가 와서 집에 있었어요.", vietnamese: "Vì trời mưa nên tôi ở nhà.", highlight: ["와서"] },
      { korean: "도서관에 가서 공부했어요.", vietnamese: "Tôi đến thư viện rồi học bài.", highlight: ["가서"] },
    ],
    keyVocab: [
      { word: "배가 고프다", meaning: "đói bụng", pos: "Tính từ" },
      { word: "비가 오다", meaning: "trời mưa", pos: "Động từ" },
      { word: "도서관", meaning: "thư viện", pos: "Danh từ" },
    ],
  },
  {
    id: "p5", pattern: "V-(으)면", patternVi: "Nếu... thì...", level: "B1", levelColor: "#fbbf24",
    category: "Điều kiện",
    explanation: "Diễn đạt điều kiện giả định. Gắn -으면 (sau phụ âm) hoặc -면 (sau nguyên âm).",
    examples: [
      { korean: "시간이 있으면 같이 가요.", vietnamese: "Nếu có thời gian thì đi cùng nhé.", highlight: ["있으면"] },
      { korean: "열심히 공부하면 합격할 수 있어요.", vietnamese: "Nếu học chăm chỉ thì có thể đậu.", highlight: ["공부하면"] },
      { korean: "날씨가 좋으면 소풍을 가요.", vietnamese: "Nếu thời tiết đẹp thì đi dã ngoại.", highlight: ["좋으면"] },
    ],
    keyVocab: [
      { word: "시간", meaning: "thời gian", pos: "Danh từ" },
      { word: "열심히", meaning: "chăm chỉ", pos: "Trạng từ" },
      { word: "합격하다", meaning: "đậu/vượt qua", pos: "Động từ" },
      { word: "소풍", meaning: "dã ngoại", pos: "Danh từ" },
    ],
  },
  {
    id: "p6", pattern: "V-는 것 같다", patternVi: "Có vẻ như / Dường như", level: "B2", levelColor: "#f59e0b",
    category: "Phỏng đoán",
    explanation: "Diễn đạt phỏng đoán, suy luận dựa trên quan sát. Hiện tại: -는 것 같다, Quá khứ: -(으)ㄴ 것 같다.",
    examples: [
      { korean: "그 사람이 화가 난 것 같아요.", vietnamese: "Có vẻ người đó đang tức giận.", highlight: ["난 것 같아요"] },
      { korean: "오늘 비가 올 것 같아요.", vietnamese: "Hôm nay có vẻ sẽ mưa.", highlight: ["올 것 같아요"] },
      { korean: "그 영화가 재미있는 것 같아요.", vietnamese: "Có vẻ bộ phim đó thú vị.", highlight: ["재미있는 것 같아요"] },
    ],
    keyVocab: [
      { word: "화가 나다", meaning: "tức giận", pos: "Động từ" },
      { word: "비가 오다", meaning: "trời mưa", pos: "Động từ" },
      { word: "재미있다", meaning: "thú vị", pos: "Tính từ" },
    ],
  },
  {
    id: "p7", pattern: "V-도록 하다", patternVi: "Làm sao để / Cố gắng làm", level: "C1", levelColor: "#f87171",
    category: "Mục đích",
    explanation: "Diễn đạt mục đích hoặc chỉ thị gián tiếp. Thường dùng trong văn viết và lời nói trang trọng.",
    examples: [
      { korean: "건강을 유지하도록 운동하세요.", vietnamese: "Hãy tập thể dục để duy trì sức khỏe.", highlight: ["유지하도록"] },
      { korean: "실수하지 않도록 주의하세요.", vietnamese: "Hãy cẩn thận để không mắc lỗi.", highlight: ["않도록"] },
      { korean: "모두가 이해하도록 설명해 주세요.", vietnamese: "Hãy giải thích để mọi người hiểu.", highlight: ["이해하도록"] },
    ],
    keyVocab: [
      { word: "유지하다", meaning: "duy trì", pos: "Động từ" },
      { word: "실수하다", meaning: "mắc lỗi", pos: "Động từ" },
      { word: "주의하다", meaning: "cẩn thận", pos: "Động từ" },
      { word: "설명하다", meaning: "giải thích", pos: "Động từ" },
    ],
  },
];

export default function SentencePatternVocabPage() {
  const [selectedPattern, setSelectedPattern] = useState<SentencePattern>(patterns[0]);
  const [levelFilter, setLevelFilter] = useState("all");
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());
  const [quizMode, setQuizMode] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const filtered = useMemo(() => levelFilter === "all" ? patterns : patterns.filter(p => p.level === levelFilter), [levelFilter]);

  const handleTTS = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "ko-KR"; utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  const quizPattern = patterns[quizIdx % patterns.length];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-white font-bold text-2xl mb-1">Từ vựng theo cấu trúc câu</h1>
            <p className="text-white/50 text-sm">Học từ vựng qua các mẫu câu thông dụng TOPIK — hiểu ngữ cảnh thực tế</p>
          </div>
          <button onClick={() => { setQuizMode(v => !v); setQuizIdx(0); setShowAnswer(false); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap ${quizMode ? "bg-app-card/70 text-white/60" : "bg-app-accent-primary text-[#141720]"}`}>
            {quizMode ? "Thoát Quiz" : "Chế độ Quiz"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Mẫu câu", value: patterns.length, color: "app-accent-primary" },
            { label: "Đã học", value: learnedIds.size, color: "#34d399" },
            { label: "Từ vựng", value: patterns.reduce((s, p) => s + p.keyVocab.length, 0), color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-app-border bg-app-surface/50 p-4 text-center">
              <p className="font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {quizMode ? (
          /* ── Quiz Mode ── */
          <div className="rounded-2xl border border-app-border bg-app-surface/50 p-8 text-center">
            <p className="text-app-text-secondary text-sm mb-6">{quizIdx + 1} / {patterns.length}</p>
            <div className="mb-6">
              <p className="text-app-text-secondary text-sm mb-3">Mẫu câu này có nghĩa gì?</p>
              <p className="text-white font-bold text-4xl mb-2">{quizPattern.pattern}</p>
              <p className="text-app-text-muted text-sm">{quizPattern.category} · {quizPattern.level}</p>
            </div>
            {!showAnswer ? (
              <button onClick={() => setShowAnswer(true)}
                className="px-8 py-3 rounded-xl bg-app-accent-primary text-[#141720] font-bold cursor-pointer whitespace-nowrap mb-6">
                Xem đáp án
              </button>
            ) : (
              <div className="mb-6">
                <div className="p-4 rounded-xl bg-app-accent-primary/5 border border-app-accent-primary/15 mb-4">
                  <p className="text-app-accent-primary font-bold text-xl">{quizPattern.patternVi}</p>
                  <p className="text-white/50 text-sm mt-1">{quizPattern.explanation}</p>
                </div>
                <div className="space-y-2">
                  {quizPattern.examples.slice(0, 2).map((ex, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-app-card/50 border border-app-border">
                      <p className="text-white text-sm flex-1 text-left">{ex.korean}</p>
                      <button onClick={() => handleTTS(ex.korean)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/8 text-app-text-secondary cursor-pointer flex-shrink-0">
                        <i className="ri-volume-up-line text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setQuizIdx(i => Math.max(0, i - 1)); setShowAnswer(false); }}
                disabled={quizIdx === 0}
                className="flex-1 py-2.5 rounded-xl bg-white/8 text-white/60 text-sm cursor-pointer disabled:opacity-30 whitespace-nowrap">
                Trước
              </button>
              <button onClick={() => { setQuizIdx(i => i + 1); setShowAnswer(false); }}
                className="flex-1 py-2.5 rounded-xl bg-app-accent-primary text-[#141720] font-bold text-sm cursor-pointer whitespace-nowrap">
                Tiếp theo
              </button>
            </div>
          </div>
        ) : (
          /* ── Browse Mode ── */
          <div className="flex gap-5">
            {/* Pattern list */}
            <div className="w-56 flex-shrink-0">
              <div className="flex gap-1 flex-wrap mb-3">
                {["all", "A1", "A2", "B1", "B2", "C1"].map(l => (
                  <button key={l} onClick={() => setLevelFilter(l)}
                    className="px-2 py-1 rounded-full text-[10px] font-medium cursor-pointer whitespace-nowrap"
                    style={levelFilter === l ? { backgroundColor: "rgba(255,255,255,0.15)", color: "white" } : { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                    {l === "all" ? "Tất cả" : l}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {filtered.map(p => (
                  <button key={p.id} onClick={() => setSelectedPattern(p)}
                    className={`w-full flex items-start gap-2 px-3 py-3 rounded-xl border text-left cursor-pointer transition-all ${selectedPattern.id === p.id ? "border-app-accent-primary/30 bg-app-accent-primary/5" : "border-app-border bg-app-surface/50 hover:bg-app-card/50"}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate">{p.pattern}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${p.levelColor}20`, color: p.levelColor }}>{p.level}</span>
                        <span className="text-app-text-muted text-[9px]">{p.category}</span>
                      </div>
                    </div>
                    {learnedIds.has(p.id) && <i className="ri-checkbox-circle-fill text-app-accent-success text-sm flex-shrink-0 mt-0.5"></i>}
                  </button>
                ))}
              </div>
            </div>

            {/* Detail */}
            <div className="flex-1 min-w-0">
              <div className="rounded-2xl border border-app-border bg-app-surface/50 p-6">
                {/* Pattern header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${selectedPattern.levelColor}20`, color: selectedPattern.levelColor }}>{selectedPattern.level}</span>
                      <span className="text-app-text-secondary text-xs">{selectedPattern.category}</span>
                    </div>
                    <p className="text-white font-bold text-2xl mb-1">{selectedPattern.pattern}</p>
                    <p className="text-app-accent-primary font-semibold">{selectedPattern.patternVi}</p>
                  </div>
                  <button onClick={() => setLearnedIds(prev => { const n = new Set(prev); n.has(selectedPattern.id) ? n.delete(selectedPattern.id) : n.add(selectedPattern.id); return n; })}
                    className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${learnedIds.has(selectedPattern.id) ? "bg-emerald-500/20 text-app-accent-success" : "bg-white/8 text-white/50"}`}>
                    {learnedIds.has(selectedPattern.id) ? "Đã học" : "Đánh dấu"}
                  </button>
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-xl bg-app-card/50 border border-app-border mb-5">
                  <p className="text-app-text-secondary text-xs mb-1">Giải thích:</p>
                  <p className="text-white/80 text-sm leading-relaxed">{selectedPattern.explanation}</p>
                </div>

                {/* Examples */}
                <div className="mb-5">
                  <p className="text-app-text-secondary text-xs font-semibold mb-3">Ví dụ ({selectedPattern.examples.length}):</p>
                  <div className="space-y-3">
                    {selectedPattern.examples.map((ex, i) => (
                      <div key={i} className="p-4 rounded-xl bg-app-card/50 border border-app-border">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-white font-medium text-base mb-1">
                              {ex.korean.split(" ").map((word, wi) => (
                                <span key={wi} className={ex.highlight.some(h => ex.korean.includes(h) && h.includes(word)) ? "text-app-accent-primary" : ""}>{word} </span>
                              ))}
                            </p>
                            <p className="text-white/50 text-sm">{ex.vietnamese}</p>
                          </div>
                          <button onClick={() => handleTTS(ex.korean)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/15 text-app-text-secondary cursor-pointer flex-shrink-0">
                            <i className="ri-volume-up-line text-sm"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key vocab */}
                <div>
                  <p className="text-app-text-secondary text-xs font-semibold mb-3">Từ vựng chính ({selectedPattern.keyVocab.length}):</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPattern.keyVocab.map((v, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-app-card/50 border border-app-border">
                        <button onClick={() => handleTTS(v.word)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/8 text-app-text-secondary cursor-pointer flex-shrink-0">
                          <i className="ri-volume-up-line text-xs"></i>
                        </button>
                        <div className="min-w-0">
                          <p className="text-white font-bold text-sm">{v.word}</p>
                          <p className="text-app-accent-primary text-xs">{v.meaning}</p>
                          <p className="text-app-text-muted text-[10px]">{v.pos}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

