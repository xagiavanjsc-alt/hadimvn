import { useState, useMemo } from "react";
import { seoulBooks, SeoulVocabItem } from "@/mocks/seoulTextbook";
import DashboardLayout from "@/components/feature/DashboardLayout";

// ─── Word pair types ──────────────────────────────────────────────────────────
type PairType = "synonym" | "antonym" | "related";

interface WordPair {
  id: string;
  word1: SeoulVocabItem & { bookId: string; lessonNumber: number };
  word2: SeoulVocabItem & { bookId: string; lessonNumber: number };
  type: PairType;
  note: string;
}

// ─── Predefined pairs ─────────────────────────────────────────────────────────
const PAIR_DEFINITIONS: Array<{
  korean1: string;
  korean2: string;
  type: PairType;
  note: string;
}> = [
  // Antonyms — emotions
  { korean1: "기쁘다", korean2: "슬프다", type: "antonym", note: "Vui ↔ Buồn" },
  { korean1: "즐겁다", korean2: "외롭다", type: "antonym", note: "Vui vẻ ↔ Cô đơn" },
  { korean1: "만족하다", korean2: "속상하다", type: "antonym", note: "Hài lòng ↔ Buồn phiền" },
  { korean1: "운이 좋다", korean2: "운이 없다", type: "antonym", note: "May mắn ↔ Không may" },
  { korean1: "자랑스럽다", korean2: "창피하다", type: "antonym", note: "Tự hào ↔ Xấu hổ" },
  // Antonyms — appearance
  { korean1: "키가 크다", korean2: "키가 작다", type: "antonym", note: "Cao ↔ Thấp" },
  { korean1: "날씬하다", korean2: "뚱뚱하다", type: "antonym", note: "Thon thả ↔ Béo" },
  { korean1: "눈이 크다", korean2: "눈이 작다", type: "antonym", note: "Mắt to ↔ Mắt nhỏ" },
  { korean1: "코가 높다", korean2: "코가 낮다", type: "antonym", note: "Mũi cao ↔ Mũi thấp" },
  { korean1: "어리다", korean2: "늙다", type: "antonym", note: "Nhỏ tuổi ↔ Già" },
  // Antonyms — taste
  { korean1: "달다", korean2: "쓰다", type: "antonym", note: "Ngọt ↔ Đắng" },
  { korean1: "짜다", korean2: "싱겁다", type: "antonym", note: "Mặn ↔ Nhạt" },
  // Antonyms — directions
  { korean1: "왼쪽으로 돌아가다", korean2: "오른쪽으로 돌아가다", type: "antonym", note: "Rẽ trái ↔ Rẽ phải" },
  { korean1: "좌회전하다", korean2: "우회전하다", type: "antonym", note: "Rẽ trái ↔ Rẽ phải (trang trọng)" },
  // Antonyms — finance
  { korean1: "입금하다", korean2: "출금하다", type: "antonym", note: "Nộp tiền ↔ Rút tiền" },
  { korean1: "왕복", korean2: "편도", type: "antonym", note: "Vé khứ hồi ↔ Vé một chiều" },
  // Antonyms — life events
  { korean1: "태어나다", korean2: "죽다", type: "antonym", note: "Sinh ra ↔ Chết" },
  { korean1: "취직하다", korean2: "은퇴하다", type: "antonym", note: "Tìm được việc ↔ Về hưu" },
  { korean1: "오르다", korean2: "내리다", type: "antonym", note: "Tăng lên ↔ Giảm xuống" },
  { korean1: "줄다", korean2: "늘다", type: "antonym", note: "Giảm đi ↔ Tiến bộ/Tăng" },
  // Synonyms
  { korean1: "매일", korean2: "날마다", type: "synonym", note: "Mỗi ngày (2 cách nói)" },
  { korean1: "매달", korean2: "달마다", type: "synonym", note: "Mỗi tháng (2 cách nói)" },
  { korean1: "매년", korean2: "해마다", type: "synonym", note: "Hàng năm (2 cách nói)" },
  { korean1: "장소", korean2: "곳", type: "synonym", note: "Nơi/Địa điểm (2 cách nói)" },
  { korean1: "죽다", korean2: "돌아가시다", type: "synonym", note: "Chết (thường ↔ kính ngữ)" },
  { korean1: "먹다", korean2: "드시다", type: "synonym", note: "Ăn (thường ↔ kính ngữ)" },
  { korean1: "있다", korean2: "계시다", type: "synonym", note: "Có/Ở (thường ↔ kính ngữ)" },
  { korean1: "자다", korean2: "주무시다", type: "synonym", note: "Ngủ (thường ↔ kính ngữ)" },
  { korean1: "환전하다", korean2: "돈을 바꾸다", type: "synonym", note: "Đổi tiền (2 cách nói)" },
  { korean1: "송금하다", korean2: "돈을 보내다", type: "synonym", note: "Chuyển tiền (2 cách nói)" },
  { korean1: "출금하다", korean2: "돈을 찾다", type: "synonym", note: "Rút tiền (2 cách nói)" },
  { korean1: "추수하다", korean2: "수확하다", type: "synonym", note: "Thu hoạch (2 cách nói)" },
  { korean1: "외출하다", korean2: "나가다", type: "synonym", note: "Ra ngoài (2 cách nói)" },
  // Related pairs
  { korean1: "선배", korean2: "후배", type: "related", note: "Tiền bối & Hậu bối" },
  { korean1: "형제", korean2: "자매", type: "related", note: "Anh em trai & Chị em gái" },
  { korean1: "동창", korean2: "동료", type: "related", note: "Bạn cùng trường & Đồng nghiệp" },
  { korean1: "동호회", korean2: "동호인", type: "related", note: "Hội sở thích & Người cùng sở thích" },
  { korean1: "콘서트", korean2: "음악회", type: "related", note: "Hòa nhạc (ca sĩ) & Hòa nhạc (nhạc cụ)" },
  { korean1: "아파트", korean2: "원룸", type: "related", note: "Chung cư & Phòng đơn" },
  { korean1: "월세", korean2: "보증금", type: "related", note: "Tiền thuê tháng & Tiền đặt cọc" },
  { korean1: "내과", korean2: "치과", type: "related", note: "Khoa nội & Khoa răng" },
  { korean1: "안과", korean2: "피부과", type: "related", note: "Khoa mắt & Khoa da liễu" },
  { korean1: "설날", korean2: "추석", type: "related", note: "Tết Nguyên Đán & Tết Trung Thu" },
  { korean1: "줄무늬", korean2: "꽃무늬", type: "related", note: "Kẻ sọc & Họa tiết hoa" },
  { korean1: "체크무늬", korean2: "물방울무늬", type: "related", note: "Kẻ ca rô & Chấm bi" },
  { korean1: "하얀색", korean2: "까만색", type: "related", note: "Trắng & Đen" },
  { korean1: "빨간색", korean2: "파란색", type: "related", note: "Đỏ & Xanh nước biển" },
  { korean1: "노란색", korean2: "녹색", type: "related", note: "Vàng & Xanh lục" },
];

// ─── Build pairs from vocab data ──────────────────────────────────────────────
function buildPairs(): WordPair[] {
  // Flatten all vocab
  const allVocab: Array<SeoulVocabItem & { bookId: string; lessonNumber: number }> = [];
  seoulBooks.forEach(book => {
    book.lessons.forEach(lesson => {
      lesson.vocabulary.forEach(v => {
        allVocab.push({ ...v, bookId: book.id, lessonNumber: lesson.lessonNumber });
      });
    });
  });

  const pairs: WordPair[] = [];
  PAIR_DEFINITIONS.forEach((def, idx) => {
    const v1 = allVocab.find(v => v.korean === def.korean1);
    const v2 = allVocab.find(v => v.korean === def.korean2);
    if (v1 && v2) {
      pairs.push({
        id: `pair-${idx}`,
        word1: v1,
        word2: v2,
        type: def.type,
        note: def.note,
      });
    }
  });
  return pairs;
}

// ─── Pair card ────────────────────────────────────────────────────────────────
function PairCard({ pair, expanded, onToggle }: { pair: WordPair; expanded: boolean; onToggle: () => void }) {
  const typeConfig = {
    synonym: { label: "Đồng nghĩa", color: "#34d399", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    antonym: { label: "Trái nghĩa", color: "#f87171", bg: "bg-red-500/10", border: "border-red-500/20" },
    related: { label: "Liên quan", color: "#e8c84a", bg: "bg-[#e8c84a]/10", border: "border-[#e8c84a]/20" },
  }[pair.type];

  const connector = pair.type === "synonym" ? "≈" : pair.type === "antonym" ? "↔" : "~";

  return (
    <div
      className={`rounded-xl border transition-all cursor-pointer ${typeConfig.bg} ${typeConfig.border} hover:opacity-90`}
      onClick={onToggle}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: typeConfig.color, backgroundColor: `${typeConfig.color}20` }}
          >
            {typeConfig.label}
          </span>
          <div className="flex items-center gap-1 text-white/30 text-xs">
            <span>Seoul {pair.word1.bookId}</span>
            <div className="w-3 h-3 flex items-center justify-center">
              <i className={`text-xs transition-transform ${expanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 text-center">
            <p className="text-white font-bold text-lg">{pair.word1.korean}</p>
            <p className="text-white/40 text-xs">{pair.word1.pronunciation}</p>
            <p className="text-white/60 text-sm mt-1">{pair.word1.vietnamese}</p>
          </div>
          <div className="text-2xl font-bold flex-shrink-0" style={{ color: typeConfig.color }}>
            {connector}
          </div>
          <div className="flex-1 text-center">
            <p className="text-white font-bold text-lg">{pair.word2.korean}</p>
            <p className="text-white/40 text-xs">{pair.word2.pronunciation}</p>
            <p className="text-white/60 text-sm mt-1">{pair.word2.vietnamese}</p>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-2">{pair.note}</p>
      </div>

      {expanded && (
        <div className="border-t border-white/8 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/30 text-[10px] mb-1">Ví dụ 1</p>
              <p className="text-white/80 text-sm">{pair.word1.example}</p>
              <p className="text-white/40 text-xs mt-1">{pair.word1.exampleVi}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/30 text-[10px] mb-1">Ví dụ 2</p>
              <p className="text-white/80 text-sm">{pair.word2.example}</p>
              <p className="text-white/40 text-xs mt-1">{pair.word2.exampleVi}</p>
            </div>
          </div>
          <div className="flex gap-2 text-xs text-white/30">
            <span>Bài {pair.word1.lessonNumber} ({pair.word1.bookId})</span>
            <span>·</span>
            <span>Bài {pair.word2.lessonNumber} ({pair.word2.bookId})</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Quiz mode ────────────────────────────────────────────────────────────────
function PairQuiz({ pairs, onBack }: { pairs: WordPair[]; onBack: () => void }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const shuffled = useMemo(() => {
    const arr = [...pairs].sort(() => Math.random() - 0.5).slice(0, 10);
    return arr;
  }, [pairs]);

  // Generate options: correct word2 + 3 wrong word2s
  const options = useMemo(() => {
    if (!shuffled[current]) return [];
    const correct = shuffled[current].word2.korean;
    const wrongs = shuffled
      .filter((_, i) => i !== current)
      .map(p => p.word2.korean)
      .slice(0, 3);
    return [correct, ...wrongs].sort(() => Math.random() - 0.5);
  }, [current, shuffled]);

  const q = shuffled[current];
  if (!q) return null;

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.word2.korean) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= shuffled.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  };

  if (finished) {
    const pct = Math.round((score / shuffled.length) * 100);
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold ${pct >= 80 ? "bg-emerald-500/20 text-emerald-400" : "bg-[#e8c84a]/20 text-[#e8c84a]"}`}>
          {pct}%
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{pct >= 80 ? "Xuất sắc!" : "Cần ôn thêm!"}</h2>
        <p className="text-white/50 text-sm mb-6">Đúng {score}/{shuffled.length} câu</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setCurrent(0); setSelected(null); setScore(0); setFinished(false); }} className="px-6 py-2.5 bg-[#e8c84a]/10 border border-[#e8c84a]/20 rounded-xl text-[#e8c84a] text-sm cursor-pointer">Làm lại</button>
          <button onClick={onBack} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm cursor-pointer">Quay lại</button>
        </div>
      </div>
    );
  }

  const typeConfig = {
    synonym: { label: "Đồng nghĩa", color: "#34d399" },
    antonym: { label: "Trái nghĩa", color: "#f87171" },
    related: { label: "Liên quan", color: "#e8c84a" },
  }[q.type];

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-white/40 hover:text-white/70 text-sm cursor-pointer flex items-center gap-1">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
          Quay lại
        </button>
        <p className="text-white/40 text-sm">{current + 1}/{shuffled.length}</p>
        <p className="text-emerald-400 text-sm font-bold">{score} đúng</p>
      </div>

      <div className="h-1.5 bg-white/8 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-[#e8c84a] rounded-full transition-all" style={{ width: `${(current / shuffled.length) * 100}%` }} />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 text-center">
        <span className="text-[10px] px-2 py-0.5 rounded-full mb-3 inline-block" style={{ color: typeConfig.color, backgroundColor: `${typeConfig.color}20` }}>
          {typeConfig.label} với từ nào?
        </span>
        <p className="text-white text-2xl font-bold mt-2">{q.word1.korean}</p>
        <p className="text-white/40 text-sm">{q.word1.pronunciation}</p>
        <p className="text-white/60 text-sm mt-1">{q.word1.vietnamese}</p>
      </div>

      <div className="space-y-2 mb-4">
        {options.map((opt, idx) => {
          const isCorrect = opt === q.word2.korean;
          const isSelected = selected === opt;
          let cls = "bg-white/5 border-white/10 text-white/70 hover:bg-white/8 cursor-pointer";
          if (selected) {
            if (isCorrect) cls = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300";
            else if (isSelected) cls = "bg-red-500/15 border-red-500/40 text-red-300";
            else cls = "bg-white/3 border-white/5 text-white/30";
          }
          return (
            <button key={idx} onClick={() => handleSelect(opt)} className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${cls}`}>
              {opt}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="bg-white/3 border border-white/8 rounded-xl p-3 mb-4">
          <p className="text-white/50 text-xs">{q.note}</p>
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={!selected}
        className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${selected ? "bg-[#e8c84a] text-black cursor-pointer" : "bg-white/5 text-white/20 cursor-not-allowed"}`}
      >
        {current + 1 >= shuffled.length ? "Xem kết quả" : "Tiếp theo"}
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SeoulWordPairsPage() {
  const [filterType, setFilterType] = useState<PairType | "all">("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);

  const allPairs = useMemo(() => buildPairs(), []);

  const filtered = useMemo(() => {
    return allPairs.filter(p => {
      if (filterType !== "all" && p.type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.word1.korean.includes(q) ||
          p.word2.korean.includes(q) ||
          p.word1.vietnamese.toLowerCase().includes(q) ||
          p.word2.vietnamese.toLowerCase().includes(q) ||
          p.note.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allPairs, filterType, search]);

  const counts = useMemo(() => ({
    all: allPairs.length,
    synonym: allPairs.filter(p => p.type === "synonym").length,
    antonym: allPairs.filter(p => p.type === "antonym").length,
    related: allPairs.filter(p => p.type === "related").length,
  }), [allPairs]);

  if (quizMode) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#0f1117] px-4 py-8">
          <PairQuiz pairs={filtered.length > 0 ? filtered : allPairs} onBack={() => setQuizMode(false)} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1117] px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Học theo cặp</h1>
              <p className="text-white/40 text-sm">Đồng nghĩa · Trái nghĩa · Từ liên quan trong Seoul</p>
            </div>
            <button
              onClick={() => setQuizMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#e8c84a]/10 hover:bg-[#e8c84a]/20 border border-[#e8c84a]/20 rounded-xl text-[#e8c84a] text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-gamepad-line"></i>
              </div>
              Luyện tập
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { type: "synonym" as PairType, label: "Đồng nghĩa", color: "#34d399", count: counts.synonym },
              { type: "antonym" as PairType, label: "Trái nghĩa", color: "#f87171", count: counts.antonym },
              { type: "related" as PairType, label: "Liên quan", color: "#e8c84a", count: counts.related },
            ].map(s => (
              <button
                key={s.type}
                onClick={() => setFilterType(filterType === s.type ? "all" : s.type)}
                className={`rounded-xl p-3 text-center border transition-all cursor-pointer ${
                  filterType === s.type ? "border-opacity-50" : "bg-white/3 border-white/8 hover:bg-white/5"
                }`}
                style={filterType === s.type ? { backgroundColor: `${s.color}15`, borderColor: `${s.color}40` } : {}}
              >
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.count}</p>
                <p className="text-white/50 text-xs">{s.label}</p>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-white/30">
              <i className="ri-search-line text-sm"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm từ vựng..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white/80 text-sm placeholder-white/25 focus:outline-none focus:border-white/20"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { value: "all" as const, label: `Tất cả (${counts.all})` },
              { value: "synonym" as PairType, label: `Đồng nghĩa (${counts.synonym})` },
              { value: "antonym" as PairType, label: `Trái nghĩa (${counts.antonym})` },
              { value: "related" as PairType, label: `Liên quan (${counts.related})` },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilterType(tab.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  filterType === tab.value
                    ? "bg-white/15 text-white"
                    : "bg-white/5 text-white/40 hover:bg-white/8 hover:text-white/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Pairs grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-white/5 rounded-full">
                <i className="ri-search-line text-xl"></i>
              </div>
              <p>Không tìm thấy cặp từ nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(pair => (
                <PairCard
                  key={pair.id}
                  pair={pair}
                  expanded={expandedId === pair.id}
                  onToggle={() => setExpandedId(expandedId === pair.id ? null : pair.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
