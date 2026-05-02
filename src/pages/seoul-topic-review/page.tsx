import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { seoulBooks } from "@/mocks/seoulTextbook";

// ─── Topic definitions ───────────────────────────────────────────────────────
const TOPICS = [
  { id: "all", label: "Tất cả", icon: "ri-apps-line", color: "app-accent-primary" },
  { id: "love", label: "Tình yêu & Hôn nhân", icon: "ri-heart-line", color: "#f87171" },
  { id: "work", label: "Công việc & Nghề nghiệp", icon: "ri-briefcase-line", color: "#60a5fa" },
  { id: "health", label: "Sức khỏe & Thể dục", icon: "ri-heart-pulse-line", color: "#34d399" },
  { id: "fashion", label: "Thời trang & Trang phục", icon: "ri-t-shirt-line", color: "#a78bfa" },
  { id: "nature", label: "Thiên nhiên & Nông thôn", icon: "ri-plant-line", color: "#86efac" },
  { id: "city", label: "Thành phố & Đô thị", icon: "ri-building-line", color: "#fbbf24" },
  { id: "food", label: "Ẩm thực & Nấu ăn", icon: "ri-restaurant-line", color: "#fb923c" },
  { id: "travel", label: "Du lịch & Giao thông", icon: "ri-plane-line", color: "#38bdf8" },
  { id: "culture", label: "Văn hóa & Xã hội", icon: "ri-global-line", color: "#c084fc" },
  { id: "education", label: "Giáo dục & Học tập", icon: "ri-graduation-cap-line", color: "#f472b6" },
  { id: "emotion", label: "Cảm xúc & Tâm lý", icon: "ri-emotion-line", color: "#fb7185" },
  { id: "body", label: "Cơ thể & Ngoại hình", icon: "ri-body-scan-line", color: "#4ade80" },
  { id: "home", label: "Nhà cửa & Gia đình", icon: "ri-home-line", color: "#fcd34d" },
  { id: "economy", label: "Kinh tế & Tài chính", icon: "ri-money-dollar-circle-line", color: "#6ee7b7" },
  { id: "grammar", label: "Ngữ pháp (사동형)", icon: "ri-book-2-line", color: "#93c5fd" },
];

// ─── Keyword → topic mapping ──────────────────────────────────────────────────
function classifyWord(korean: string, vietnamese: string, lessonTitle: string): string[] {
  const k = korean.toLowerCase();
  const v = vietnamese.toLowerCase();
  const t = lessonTitle.toLowerCase();
  const topics: string[] = [];

  // Love & Marriage
  if (/사랑|결혼|연애|소개팅|고백|청혼|청첩장|헤어지다|짝사랑|신혼|연상|연하|데이트|배우자|천생연분/.test(k)) topics.push("love");
  // Work
  if (/업무|연봉|월급|근무|승진|직장|사원|부장|과장|대리|동료|취업|야근|번역|통역|홍보|인터뷰|지원자|회식/.test(k)) topics.push("work");
  // Grammar 사동형
  if (/이다$|히다$|리다$|기다$|우다$|추다$/.test(k) && /사동|사역|시키/.test(v + t)) topics.push("grammar");
  if (/먹이다|죽이다|보이다|속이다|녹이다|끓이다|붙이다|읽히다|앉히다|눕히다|익히다|맞히다|넓히다|알리다|살리다|울리다|놀리다|돌리다|웃기다|맡기다|벗기다|씻기다|굶기다|감기다|남기다|깨우다|재우다|태우다|세우다|씌우다|늦추다|낮추다/.test(k)) topics.push("grammar");
  // Health & Exercise
  if (/운동|건강|근육|스트레칭|줄넘기|덤벨|허벅지|숨|땀|쥐가|거북목|날씬|몸|살이|힘이|자세|윗몸|발뒤꿈치/.test(k)) topics.push("health");
  // Fashion & Clothing
  if (/옷|양복|넥타이|반지|귀걸이|시계|가방|배낭|모피|가죽|뷔페|차려입|어울리|옷차림/.test(k)) topics.push("fashion");
  // Nature & Rural
  if (/시골|농장|논|밭|벼|채소|과수원|나무|잔디|정원|동굴|물고기|팥죽|썰매|추수|심다|키우다|가꾸다|이웃|동네|고향/.test(k)) topics.push("nature");
  // City & Urban
  if (/도시|편의|활기|공해|생활비|교통|문화 생활|불편|평화/.test(k)) topics.push("city");
  // Food
  if (/음식|요리|먹다|식사|밥|국|찌개|팥죽|채식|뷔페/.test(k)) topics.push("food");
  // Travel & Transport
  if (/여행|교통|버스|지하철|비행기|기차|횡단보도|교차로/.test(k)) topics.push("travel");
  // Culture & Society
  if (/문화|사회|행사|집들이|돌잔치|송년회|송별회|동창회|바자회|절|단체|기우제/.test(k)) topics.push("culture");
  // Education
  if (/공부|학교|교육|선생|학생|시험|수업|강습|교정/.test(k)) topics.push("education");
  // Emotion & Psychology
  if (/기분|감정|슬프|기쁘|화가|후회|그리워|따분|평화|안심|지치|상쾌/.test(k)) topics.push("emotion");
  // Body & Appearance
  if (/몸|얼굴|눈|코|입|귀|손|발|허리|가슴|다리|허벅지|목|어깨|등|배|근육|날씬|통통/.test(k)) topics.push("body");
  // Home & Family
  if (/집|가족|부모|자식|신혼집|방|정원|이웃|동네/.test(k)) topics.push("home");
  // Economy & Finance
  if (/돈|경제|월급|연봉|시급|생활비|투자|수익|계약/.test(k)) topics.push("economy");

  return topics.length > 0 ? topics : ["culture"];
}

// ─── Collect all vocabulary ───────────────────────────────────────────────────
interface VocabItem {
  korean: string;
  pronunciation: string;
  vietnamese: string;
  partOfSpeech: string;
  example: string;
  exampleVi: string;
  bookId: string;
  bookName: string;
  lessonNumber: number;
  lessonTitle: string;
  topics: string[];
}

function getAllVocab(): VocabItem[] {
  const result: VocabItem[] = [];
  const seen = new Set<string>();
  for (const book of seoulBooks) {
    for (const lesson of book.lessons) {
      for (const v of lesson.vocabulary) {
        const key = v.korean;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({
          ...v,
          bookId: book.id,
          bookName: book.name,
          lessonNumber: lesson.lessonNumber,
          lessonTitle: lesson.title,
          topics: classifyWord(v.korean, v.vietnamese, lesson.title),
        });
      }
    }
  }
  return result;
}

// ─── Flashcard component ──────────────────────────────────────────────────────
function FlashCard({ word, onNext, onPrev, index, total }: {
  word: VocabItem;
  onNext: () => void;
  onPrev: () => void;
  index: number;
  total: number;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-sm text-app-text-secondary">{index + 1} / {total}</div>
      <div
        className="w-full max-w-lg cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped(f => !f)}
      >
        <div
          className="relative w-full h-56 transition-transform duration-500"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-[#1a1d27] border border-app-border rounded-2xl flex flex-col items-center justify-center gap-3 p-6"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-4xl font-bold text-white">{word.korean}</p>
            <p className="text-app-text-secondary text-sm">{word.pronunciation}</p>
            <p className="text-app-text-muted text-xs mt-2">{word.partOfSpeech}</p>
            <p className="text-app-text-muted text-xs mt-1">Nhấn để xem nghĩa</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 bg-[#1a1d27] border border-app-accent-primary/20 rounded-2xl flex flex-col items-center justify-center gap-3 p-6"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-2xl font-bold text-app-accent-primary">{word.vietnamese}</p>
            <p className="text-white/50 text-sm italic mt-2">{word.example}</p>
            <p className="text-white/35 text-xs">{word.exampleVi}</p>
            <div className="mt-2 px-2 py-1 bg-app-card/50 rounded-full text-app-text-muted text-xs">
              {word.bookName} — Bài {word.lessonNumber}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => { setFlipped(false); onPrev(); }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-app-card/50 hover:bg-app-card/70 text-white/50 hover:text-white transition-all cursor-pointer"
        >
          <i className="ri-arrow-left-line"></i>
        </button>
        <button
          onClick={() => { setFlipped(false); onNext(); }}
          className="px-6 py-2 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 border border-app-accent-primary/20 rounded-full text-app-accent-primary text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
        >
          Tiếp theo
        </button>
      </div>
    </div>
  );
}

// ─── Quiz component ───────────────────────────────────────────────────────────
function QuizMode({ words }: { words: VocabItem[] }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const shuffled = useMemo(() => [...words].sort(() => Math.random() - 0.5).slice(0, Math.min(20, words.length)), [words]);

  const word = shuffled[current];
  const options = useMemo(() => {
    if (!word) return [];
    const wrong = words.filter(w => w.korean !== word.korean).sort(() => Math.random() - 0.5).slice(0, 3);
    return [...wrong, word].sort(() => Math.random() - 0.5);
  }, [current, word]);

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === word.vietnamese) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= shuffled.length) { setDone(true); return; }
    setCurrent(c => c + 1);
    setSelected(null);
  };

  if (done) return (
    <div className="flex flex-col items-center gap-6 py-10">
      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-app-accent-primary/10 border border-app-accent-primary/20">
        <i className="ri-trophy-line text-app-accent-primary text-3xl"></i>
      </div>
      <p className="text-2xl font-bold text-white">Hoàn thành!</p>
      <p className="text-white/50">Đúng {score}/{shuffled.length} câu ({Math.round(score / shuffled.length * 100)}%)</p>
      <button onClick={() => { setCurrent(0); setSelected(null); setScore(0); setDone(false); }}
        className="px-6 py-2.5 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 border border-app-accent-primary/20 rounded-full text-app-accent-primary font-medium cursor-pointer whitespace-nowrap">
        Làm lại
      </button>
    </div>
  );

  if (!word) return null;

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between text-sm text-app-text-secondary">
        <span>Câu {current + 1}/{shuffled.length}</span>
        <span className="text-app-accent-primary">Đúng: {score}</span>
      </div>
      <div className="bg-[#1a1d27] border border-app-border rounded-2xl p-8 text-center">
        <p className="text-3xl font-bold text-white mb-2">{word.korean}</p>
        <p className="text-app-text-secondary text-sm">{word.pronunciation}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map(opt => {
          const isCorrect = opt.vietnamese === word.vietnamese;
          const isSelected = selected === opt.vietnamese;
          let cls = "p-4 rounded-xl border text-sm text-left transition-all cursor-pointer ";
          if (!selected) cls += "bg-app-surface/50 border-app-border hover:bg-white/8 hover:border-white/20 text-white/70";
          else if (isCorrect) cls += "bg-emerald-500/10 border-emerald-500/30 text-app-accent-success";
          else if (isSelected) cls += "bg-red-500/10 border-red-500/30 text-red-400";
          else cls += "bg-app-surface/50 border-app-border text-app-text-muted";
          return (
            <button key={opt.vietnamese} className={cls} onClick={() => handleSelect(opt.vietnamese)}>
              {opt.vietnamese}
            </button>
          );
        })}
      </div>
      {selected && (
        <button onClick={handleNext}
          className="w-full py-3 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 border border-app-accent-primary/20 rounded-xl text-app-accent-primary font-medium cursor-pointer whitespace-nowrap">
          {current + 1 >= shuffled.length ? "Xem kết quả" : "Câu tiếp theo"}
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SeoulTopicReviewPage() {
  const navigate = useNavigate();
  const allVocab = useMemo(() => getAllVocab(), []);

  const [selectedTopic, setSelectedTopic] = useState("all");
  const [mode, setMode] = useState<"list" | "flashcard" | "quiz">("list");
  const [search, setSearch] = useState("");
  const [flashIndex, setFlashIndex] = useState(0);
  const [selectedBook, setSelectedBook] = useState("all");

  const books = useMemo(() => {
    const ids = [...new Set(allVocab.map(v => v.bookId))];
    return ids.map(id => ({ id, name: allVocab.find(v => v.bookId === id)?.bookName || id }));
  }, [allVocab]);

  const filtered = useMemo(() => {
    let list = allVocab;
    if (selectedTopic !== "all") list = list.filter(v => v.topics.includes(selectedTopic));
    if (selectedBook !== "all") list = list.filter(v => v.bookId === selectedBook);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v => v.korean.toLowerCase().includes(q) || v.vietnamese.toLowerCase().includes(q));
    }
    return list;
  }, [allVocab, selectedTopic, selectedBook, search]);

  const topicInfo = TOPICS.find(t => t.id === selectedTopic) || TOPICS[0];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-app-card/50 hover:bg-app-card/70 text-white/50 hover:text-white transition-all cursor-pointer">
            <i className="ri-arrow-left-line"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Ôn tập theo chủ đề</h1>
            <p className="text-app-text-secondary text-sm">Lọc và ôn từ vựng Seoul theo chủ đề</p>
          </div>
        </div>

        {/* Topic grid */}
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
          {TOPICS.map(topic => (
            <button
              key={topic.id}
              onClick={() => { setSelectedTopic(topic.id); setFlashIndex(0); }}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                selectedTopic === topic.id
                  ? "border-opacity-40 bg-opacity-10"
                  : "border-app-border bg-app-surface/50 hover:bg-white/6"
              }`}
              style={selectedTopic === topic.id ? { borderColor: topic.color + "66", backgroundColor: topic.color + "18" } : {}}
            >
              <div className="w-7 h-7 flex items-center justify-center">
                <i className={`${topic.icon} text-base`} style={{ color: selectedTopic === topic.id ? topic.color : "rgba(255,255,255,0.35)" }}></i>
              </div>
              <span className="text-[9px] text-center leading-tight" style={{ color: selectedTopic === topic.id ? topic.color : "rgba(255,255,255,0.4)" }}>
                {topic.label}
              </span>
            </button>
          ))}
        </div>

        {/* Filters + Mode */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm từ vựng..."
              className="w-full bg-app-card/50 border border-app-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-app-accent-primary/30"
            />
          </div>
          <select
            value={selectedBook}
            onChange={e => setSelectedBook(e.target.value)}
            className="bg-app-card/50 border border-app-border rounded-xl px-3 py-2.5 text-sm text-white/70 focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả cuốn</option>
            {books.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="flex items-center gap-1 bg-app-card/50 border border-app-border rounded-xl p-1">
            {(["list", "flashcard", "quiz"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setFlashIndex(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  mode === m ? "bg-app-accent-primary/15 text-app-accent-primary" : "text-app-text-secondary hover:text-white/60"
                }`}
              >
                {m === "list" ? "Danh sách" : m === "flashcard" ? "Flashcard" : "Quiz"}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-app-surface/50 border border-app-border rounded-xl">
          <div className="w-7 h-7 flex items-center justify-center">
            <i className={`${topicInfo.icon} text-base`} style={{ color: topicInfo.color }}></i>
          </div>
          <div>
            <p className="text-white font-medium text-sm">{topicInfo.label}</p>
            <p className="text-app-text-secondary text-xs">{filtered.length} từ vựng</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-app-text-muted text-xs">Tổng: {allVocab.length} từ</span>
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-app-text-muted">
            <i className="ri-search-line text-4xl mb-3 block"></i>
            <p>Không tìm thấy từ vựng nào</p>
          </div>
        ) : mode === "flashcard" ? (
          <FlashCard
            word={filtered[flashIndex]}
            index={flashIndex}
            total={filtered.length}
            onNext={() => setFlashIndex(i => Math.min(i + 1, filtered.length - 1))}
            onPrev={() => setFlashIndex(i => Math.max(i - 1, 0))}
          />
        ) : mode === "quiz" ? (
          <QuizMode words={filtered} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((word, idx) => (
              <div key={idx} className="bg-[#1a1d27] border border-app-border rounded-xl p-4 hover:border-white/15 transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-white font-semibold text-base">{word.korean}</p>
                    <p className="text-white/35 text-xs">{word.pronunciation}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-app-card/50 rounded-full text-app-text-muted whitespace-nowrap flex-shrink-0">{word.partOfSpeech}</span>
                </div>
                <p className="text-app-accent-primary text-sm font-medium mb-2">{word.vietnamese}</p>
                <p className="text-app-text-secondary text-xs italic mb-1">{word.example}</p>
                <p className="text-app-text-muted text-xs">{word.exampleVi}</p>
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 bg-app-card/50 rounded-full text-app-text-muted">{word.bookName}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-app-card/50 rounded-full text-app-text-muted">Bài {word.lessonNumber}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
