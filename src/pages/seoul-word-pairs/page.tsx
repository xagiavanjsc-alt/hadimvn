import { useState, useMemo } from "react";
import { seoulBooks, SeoulVocabItem } from "@/mocks/seoulTextbook";
import DashboardLayout from "@/components/feature/DashboardLayout";

// --- Word pair types ----------------------------------------------------------
type PairType = "synonym" | "antonym" | "related";

interface WordPair {
  id: string;
  word1: SeoulVocabItem & { bookId: string; lessonNumber: number };
  word2: SeoulVocabItem & { bookId: string; lessonNumber: number };
  type: PairType;
  note: string;
}

// --- Predefined pairs ---------------------------------------------------------
const PAIR_DEFINITIONS: Array<{
  korean1: string;
  korean2: string;
  type: PairType;
  note: string;
}> = [
  // Antonyms — emotions
  { korean1: "???", korean2: "???", type: "antonym", note: "Vui ? Bu?n" },
  { korean1: "???", korean2: "???", type: "antonym", note: "Vui v? ? Cô don" },
  { korean1: "????", korean2: "????", type: "antonym", note: "Hài lòng ? Bu?n phi?n" },
  { korean1: "?? ??", korean2: "?? ??", type: "antonym", note: "May m?n ? Không may" },
  { korean1: "?????", korean2: "????", type: "antonym", note: "T? hào ? X?u h?" },
  // Antonyms — appearance
  { korean1: "?? ??", korean2: "?? ??", type: "antonym", note: "Cao ? Th?p" },
  { korean1: "????", korean2: "????", type: "antonym", note: "Thon th? ? Béo" },
  { korean1: "?? ??", korean2: "?? ??", type: "antonym", note: "M?t to ? M?t nh?" },
  { korean1: "?? ??", korean2: "?? ??", type: "antonym", note: "Mui cao ? Mui th?p" },
  { korean1: "???", korean2: "??", type: "antonym", note: "Nh? tu?i ? Già" },
  // Antonyms — taste
  { korean1: "??", korean2: "??", type: "antonym", note: "Ng?t ? Ð?ng" },
  { korean1: "??", korean2: "???", type: "antonym", note: "M?n ? Nh?t" },
  // Antonyms — directions
  { korean1: "???? ????", korean2: "????? ????", type: "antonym", note: "R? trái ? R? ph?i" },
  { korean1: "?????", korean2: "?????", type: "antonym", note: "R? trái ? R? ph?i (trang tr?ng)" },
  // Antonyms — finance
  { korean1: "????", korean2: "????", type: "antonym", note: "N?p ti?n ? Rút ti?n" },
  { korean1: "??", korean2: "??", type: "antonym", note: "Vé kh? h?i ? Vé m?t chi?u" },
  // Antonyms — life events
  { korean1: "????", korean2: "??", type: "antonym", note: "Sinh ra ? Ch?t" },
  { korean1: "????", korean2: "????", type: "antonym", note: "Tìm du?c vi?c ? V? huu" },
  { korean1: "???", korean2: "???", type: "antonym", note: "Tang lên ? Gi?m xu?ng" },
  { korean1: "??", korean2: "??", type: "antonym", note: "Gi?m di ? Ti?n b?/Tang" },
  // Synonyms
  { korean1: "??", korean2: "???", type: "synonym", note: "M?i ngày (2 cách nói)" },
  { korean1: "??", korean2: "???", type: "synonym", note: "M?i tháng (2 cách nói)" },
  { korean1: "??", korean2: "???", type: "synonym", note: "Hàng nam (2 cách nói)" },
  { korean1: "??", korean2: "?", type: "synonym", note: "Noi/Ð?a di?m (2 cách nói)" },
  { korean1: "??", korean2: "?????", type: "synonym", note: "Ch?t (thu?ng ? kính ng?)" },
  { korean1: "??", korean2: "???", type: "synonym", note: "An (thu?ng ? kính ng?)" },
  { korean1: "??", korean2: "???", type: "synonym", note: "Có/? (thu?ng ? kính ng?)" },
  { korean1: "??", korean2: "????", type: "synonym", note: "Ng? (thu?ng ? kính ng?)" },
  { korean1: "????", korean2: "?? ???", type: "synonym", note: "Ð?i ti?n (2 cách nói)" },
  { korean1: "????", korean2: "?? ???", type: "synonym", note: "Chuy?n ti?n (2 cách nói)" },
  { korean1: "????", korean2: "?? ??", type: "synonym", note: "Rút ti?n (2 cách nói)" },
  { korean1: "????", korean2: "????", type: "synonym", note: "Thu ho?ch (2 cách nói)" },
  { korean1: "????", korean2: "???", type: "synonym", note: "Ra ngoài (2 cách nói)" },
  // Related pairs
  { korean1: "??", korean2: "??", type: "related", note: "Ti?n b?i & H?u b?i" },
  { korean1: "??", korean2: "??", type: "related", note: "Anh em trai & Ch? em gái" },
  { korean1: "??", korean2: "??", type: "related", note: "B?n cùng tru?ng & Ð?ng nghi?p" },
  { korean1: "???", korean2: "???", type: "related", note: "H?i s? thích & Ngu?i cùng s? thích" },
  { korean1: "???", korean2: "???", type: "related", note: "Hòa nh?c (ca si) & Hòa nh?c (nh?c c?)" },
  { korean1: "???", korean2: "??", type: "related", note: "Chung cu & Phòng don" },
  { korean1: "??", korean2: "???", type: "related", note: "Ti?n thuê tháng & Ti?n d?t c?c" },
  { korean1: "??", korean2: "??", type: "related", note: "Khoa n?i & Khoa rang" },
  { korean1: "??", korean2: "???", type: "related", note: "Khoa m?t & Khoa da li?u" },
  { korean1: "??", korean2: "??", type: "related", note: "T?t Nguyên Ðán & T?t Trung Thu" },
  { korean1: "???", korean2: "???", type: "related", note: "K? s?c & H?a ti?t hoa" },
  { korean1: "????", korean2: "?????", type: "related", note: "K? ca rô & Ch?m bi" },
  { korean1: "???", korean2: "???", type: "related", note: "Tr?ng & Ðen" },
  { korean1: "???", korean2: "???", type: "related", note: "Ð? & Xanh nu?c bi?n" },
  { korean1: "???", korean2: "??", type: "related", note: "Vàng & Xanh l?c" },
];

// --- Build pairs from vocab data ----------------------------------------------
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

// --- Pair card ----------------------------------------------------------------
function PairCard({ pair, expanded, onToggle }: { pair: WordPair; expanded: boolean; onToggle: () => void }) {
  const typeConfig = {
    synonym: { label: "Ð?ng nghia", color: "#34d399", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    antonym: { label: "Trái nghia", color: "#f87171", bg: "bg-red-500/10", border: "border-red-500/20" },
    related: { label: "Liên quan", color: "app-accent-primary", bg: "bg-app-accent-primary/10", border: "border-app-accent-primary/20" },
  }[pair.type];

  const connector = pair.type === "synonym" ? "˜" : pair.type === "antonym" ? "?" : "~";

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
          <div className="flex items-center gap-1 text-app-text-muted text-xs">
            <span>Seoul {pair.word1.bookId}</span>
            <div className="w-3 h-3 flex items-center justify-center">
              <i className={`text-xs transition-transform ${expanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 text-center">
            <p className="text-white font-bold text-lg">{pair.word1.korean}</p>
            <p className="text-app-text-secondary text-xs">{pair.word1.pronunciation}</p>
            <p className="text-white/60 text-sm mt-1">{pair.word1.vietnamese}</p>
          </div>
          <div className="text-2xl font-bold flex-shrink-0" style={{ color: typeConfig.color }}>
            {connector}
          </div>
          <div className="flex-1 text-center">
            <p className="text-white font-bold text-lg">{pair.word2.korean}</p>
            <p className="text-app-text-secondary text-xs">{pair.word2.pronunciation}</p>
            <p className="text-white/60 text-sm mt-1">{pair.word2.vietnamese}</p>
          </div>
        </div>

        <p className="text-center text-app-text-muted text-xs mt-2">{pair.note}</p>
      </div>

      {expanded && (
        <div className="border-t border-app-border p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-app-card/50 rounded-lg p-3">
              <p className="text-app-text-muted text-[10px] mb-1">Ví d? 1</p>
              <p className="text-white/80 text-sm">{pair.word1.example}</p>
              <p className="text-app-text-secondary text-xs mt-1">{pair.word1.exampleVi}</p>
            </div>
            <div className="bg-app-card/50 rounded-lg p-3">
              <p className="text-app-text-muted text-[10px] mb-1">Ví d? 2</p>
              <p className="text-white/80 text-sm">{pair.word2.example}</p>
              <p className="text-app-text-secondary text-xs mt-1">{pair.word2.exampleVi}</p>
            </div>
          </div>
          <div className="flex gap-2 text-xs text-app-text-muted">
            <span>Bài {pair.word1.lessonNumber} ({pair.word1.bookId})</span>
            <span>·</span>
            <span>Bài {pair.word2.lessonNumber} ({pair.word2.bookId})</span>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Quiz mode ----------------------------------------------------------------
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
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold ${pct >= 80 ? "bg-emerald-500/20 text-app-accent-success" : "bg-app-accent-primary/20 text-app-accent-primary"}`}>
          {pct}%
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{pct >= 80 ? "Xu?t s?c!" : "C?n ôn thêm!"}</h2>
        <p className="text-white/50 text-sm mb-6">Ðúng {score}/{shuffled.length} câu</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setCurrent(0); setSelected(null); setScore(0); setFinished(false); }} className="px-6 py-2.5 bg-app-accent-primary/10 border border-app-accent-primary/20 rounded-xl text-app-accent-primary text-sm cursor-pointer">Làm l?i</button>
          <button onClick={onBack} className="px-6 py-2.5 bg-app-card/50 border border-app-border rounded-xl text-white/60 text-sm cursor-pointer">Quay l?i</button>
        </div>
      </div>
    );
  }

  const typeConfig = {
    synonym: { label: "Ð?ng nghia", color: "#34d399" },
    antonym: { label: "Trái nghia", color: "#f87171" },
    related: { label: "Liên quan", color: "app-accent-primary" },
  }[q.type];

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-app-text-secondary hover:text-white/70 text-sm cursor-pointer flex items-center gap-1">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
          Quay l?i
        </button>
        <p className="text-app-text-secondary text-sm">{current + 1}/{shuffled.length}</p>
        <p className="text-app-accent-success text-sm font-bold">{score} dúng</p>
      </div>

      <div className="h-1.5 bg-white/8 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-app-accent-primary rounded-full transition-all" style={{ width: `${(current / shuffled.length) * 100}%` }} />
      </div>

      <div className="bg-app-card/50 border border-app-border rounded-2xl p-6 mb-4 text-center">
        <span className="text-[10px] px-2 py-0.5 rounded-full mb-3 inline-block" style={{ color: typeConfig.color, backgroundColor: `${typeConfig.color}20` }}>
          {typeConfig.label} v?i t? nào?
        </span>
        <p className="text-white text-2xl font-bold mt-2">{q.word1.korean}</p>
        <p className="text-app-text-secondary text-sm">{q.word1.pronunciation}</p>
        <p className="text-white/60 text-sm mt-1">{q.word1.vietnamese}</p>
      </div>

      <div className="space-y-2 mb-4">
        {options.map((opt, idx) => {
          const isCorrect = opt === q.word2.korean;
          const isSelected = selected === opt;
          let cls = "bg-app-card/50 border-app-border text-white/70 hover:bg-white/8 cursor-pointer";
          if (selected) {
            if (isCorrect) cls = "bg-app-accent-success/15 border-emerald-500/40 text-emerald-300";
            else if (isSelected) cls = "bg-red-500/15 border-red-500/40 text-red-300";
            else cls = "bg-app-surface/50 border-app-border text-app-text-muted";
          }
          return (
            <button key={idx} onClick={() => handleSelect(opt)} className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${cls}`}>
              {opt}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="bg-app-surface/50 border border-app-border rounded-xl p-3 mb-4">
          <p className="text-white/50 text-xs">{q.note}</p>
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={!selected}
        className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${selected ? "bg-app-accent-primary text-black cursor-pointer" : "bg-app-card/50 text-app-text-muted cursor-not-allowed"}`}
      >
        {current + 1 >= shuffled.length ? "Xem k?t qu?" : "Ti?p theo"}
      </button>
    </div>
  );
}

// --- Main page ----------------------------------------------------------------
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
        <div className="min-h-screen bg-app-bg px-4 py-8">
          <PairQuiz pairs={filtered.length > 0 ? filtered : allPairs} onBack={() => setQuizMode(false)} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-app-bg px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">H?c theo c?p</h1>
              <p className="text-app-text-secondary text-sm">Ð?ng nghia · Trái nghia · T? liên quan trong Seoul</p>
            </div>
            <button
              onClick={() => setQuizMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 border border-app-accent-primary/20 rounded-xl text-app-accent-primary text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-gamepad-line"></i>
              </div>
              Luy?n t?p
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {[
              { type: "synonym" as PairType, label: "Ð?ng nghia", color: "#34d399", count: counts.synonym },
              { type: "antonym" as PairType, label: "Trái nghia", color: "#f87171", count: counts.antonym },
              { type: "related" as PairType, label: "Liên quan", color: "app-accent-primary", count: counts.related },
            ].map(s => (
              <button
                key={s.type}
                onClick={() => setFilterType(filterType === s.type ? "all" : s.type)}
                className={`rounded-xl p-3 text-center border transition-all cursor-pointer ${
                  filterType === s.type ? "border-opacity-50" : "bg-app-surface/50 border-app-border hover:bg-app-card/50"
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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-app-text-muted">
              <i className="ri-search-line text-sm"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm t? v?ng..."
              className="w-full bg-app-card/50 border border-app-border rounded-xl pl-9 pr-4 py-2.5 text-white/80 text-sm placeholder-white/25 focus:outline-none focus:border-white/20"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { value: "all" as const, label: `T?t c? (${counts.all})` },
              { value: "synonym" as PairType, label: `Ð?ng nghia (${counts.synonym})` },
              { value: "antonym" as PairType, label: `Trái nghia (${counts.antonym})` },
              { value: "related" as PairType, label: `Liên quan (${counts.related})` },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilterType(tab.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  filterType === tab.value
                    ? "bg-white/15 text-white"
                    : "bg-app-card/50 text-app-text-secondary hover:bg-white/8 hover:text-white/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Pairs grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-app-text-muted">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-app-card/50 rounded-full">
                <i className="ri-search-line text-xl"></i>
              </div>
              <p>Không tìm th?y c?p t? nào</p>
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

