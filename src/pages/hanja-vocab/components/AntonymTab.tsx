import { useState, useMemo, useCallback } from "react";
import { HanjaEntry } from "@/mocks/hanjaData";
import { useHanjaData } from "@/contexts/HanjaDataContext";

const SR_KEY = "hanja_sr_data";
const CUSTOM_PAIRS_KEY = "hanja_custom_antonym_pairs";

interface SRCard {
  korean: string;
  interval: number;
  easeFactor: number;
  dueDate: number;
  totalReviews: number;
  correctStreak: number;
}

interface AntonymPair {
  a: string;
  b: string;
  category: string;
  custom?: boolean;
}

function getMastery(korean: string, srData: Record<string, SRCard>): "new" | "learning" | "mastered" {
  const card = srData[korean];
  if (!card) return "new";
  if (card.interval >= 21) return "mastered";
  return "learning";
}

function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ko-KR";
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}

// ─── Built-in antonym pairs ───────────────────────────────────────────────────
const BUILTIN_PAIRS: AntonymPair[] = [
  // Trạng thái xã hội
  { a: "평화", b: "전쟁", category: "Trạng thái xã hội" },
  { a: "안전", b: "위험", category: "Trạng thái xã hội" },
  { a: "질서", b: "혼란", category: "Trạng thái xã hội" },
  { a: "번영", b: "쇠퇴", category: "Trạng thái xã hội" },
  // Kết quả
  { a: "성공", b: "실패", category: "Kết quả" },
  { a: "승리", b: "패배", category: "Kết quả" },
  { a: "대승", b: "대패", category: "Kết quả" },
  // Cảm xúc
  { a: "행복", b: "불행", category: "Cảm xúc" },
  { a: "희망", b: "절망", category: "Cảm xúc" },
  { a: "기쁨", b: "슬픔", category: "Cảm xúc" },
  { a: "용기", b: "공포", category: "Cảm xúc" },
  { a: "낙관", b: "비관", category: "Cảm xúc" },
  // Đạo đức / tính cách
  { a: "선", b: "악", category: "Đạo đức" },
  { a: "정직", b: "거짓", category: "Đạo đức" },
  { a: "겸손", b: "교만", category: "Tính cách" },
  { a: "성실", b: "태만", category: "Tính cách" },
  { a: "친절", b: "냉담", category: "Tính cách" },
  { a: "덕", b: "악", category: "Đạo đức" },
  // Chính trị / xã hội
  { a: "독립", b: "종속", category: "Chính trị" },
  { a: "자유", b: "구속", category: "Chính trị" },
  { a: "평등", b: "차별", category: "Xã hội" },
  { a: "통일", b: "분열", category: "Chính trị" },
  { a: "공개", b: "비밀", category: "Xã hội" },
  { a: "민주", b: "독재", category: "Chính trị" },
  { a: "정의", b: "불의", category: "Chính trị" },
  { a: "합법", b: "불법", category: "Pháp luật" },
  { a: "무죄", b: "유죄", category: "Pháp luật" },
  { a: "적법", b: "범법", category: "Pháp luật" },
  // Kinh tế
  { a: "부유", b: "빈곤", category: "Kinh tế" },
  { a: "수출", b: "수입", category: "Kinh tế" },
  { a: "공급", b: "수요", category: "Kinh tế" },
  { a: "절약", b: "낭비", category: "Kinh tế" },
  { a: "이익", b: "손실", category: "Kinh tế" },
  // Y tế / sinh học
  { a: "생명", b: "죽음", category: "Sinh học" },
  { a: "건강", b: "질병", category: "Y tế" },
  { a: "급성", b: "만성", category: "Y tế" },
  { a: "면역", b: "감염", category: "Y tế" },
  // Tự nhiên / thời gian
  { a: "낮", b: "밤", category: "Thời gian" },
  { a: "봄", b: "가을", category: "Mùa" },
  { a: "동", b: "서", category: "Phương hướng" },
  { a: "남", b: "북", category: "Phương hướng" },
  { a: "남극", b: "북극", category: "Phương hướng" },
  // Học thuật / tư duy
  { a: "이론", b: "실천", category: "Học thuật" },
  { a: "원인", b: "결과", category: "Học thuật" },
  { a: "주관", b: "객관", category: "Học thuật" },
  { a: "긍정", b: "부정", category: "Học thuật" },
  { a: "능동", b: "수동", category: "Học thuật" },
  { a: "단순", b: "복잡", category: "Học thuật" },
  { a: "유한", b: "무한", category: "Học thuật" },
  // Quân sự
  { a: "공격", b: "방어", category: "Quân sự" },
  { a: "전진", b: "후퇴", category: "Quân sự" },
  { a: "전쟁", b: "평화", category: "Quân sự" },
  { a: "전략", b: "전술", category: "Quân sự" },
  // Ngôn ngữ
  { a: "자음", b: "모음", category: "Ngôn ngữ" },
  { a: "단수", b: "복수", category: "Ngôn ngữ" },
  // Xã hội / con người
  { a: "남성", b: "여성", category: "Xã hội" },
  { a: "노인", b: "청년", category: "Xã hội" },
  { a: "도시", b: "농촌", category: "Xã hội" },
  { a: "공립", b: "사립", category: "Xã hội" },
  { a: "내부", b: "외부", category: "Xã hội" },
  { a: "국내", b: "국외", category: "Xã hội" },
  // Vật lý / khoa học
  { a: "음극", b: "양극", category: "Khoa học" },
  { a: "음성", b: "양성", category: "Khoa học" },
  { a: "유선", b: "무선", category: "Khoa học" },
];

// ─── Mini Quiz ────────────────────────────────────────────────────────────────
function AntonymQuiz({ pairs, onClose }: { pairs: AntonymPair[]; onClose: () => void }) {
  const HANJA_DATA = useHanjaData();
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(() => {
    return pairs.map(pair => {
      const allWords = HANJA_DATA.filter(d => d.korean !== pair.a && d.korean !== pair.b);
      const distractors = allWords.sort(() => Math.random() - 0.5).slice(0, 3).map(d => d.korean);
      const choices = [...distractors, pair.b].sort(() => Math.random() - 0.5);
      return { pair, choices };
    });
  }, [pairs]);

  const current = questions[idx];
  const getEntry = (korean: string): HanjaEntry | undefined => HANJA_DATA.find(d => d.korean === korean);

  const handleAnswer = (choice: string) => {
    if (answered) return;
    setSelected(choice);
    setAnswered(true);
    if (choice === current.pair.b) setScore(s => s + 1);
  };

  const next = () => {
    if (idx + 1 >= questions.length) { setFinished(true); return; }
    setIdx(i => i + 1);
    setAnswered(false);
    setSelected(null);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="text-center py-8">
        <div className={`w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4 ${pct >= 80 ? "bg-green-100" : pct >= 50 ? "bg-amber-100" : "bg-red-100"}`}>
          <i className={`text-2xl ${pct >= 80 ? "ri-trophy-line text-green-600" : pct >= 50 ? "ri-emotion-normal-line text-amber-600" : "ri-emotion-sad-line text-red-500"}`}></i>
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{pct}%</p>
        <p className="text-gray-500 mb-6">Đúng {score} / {questions.length} cặp</p>
        <button onClick={onClose} className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium cursor-pointer hover:bg-gray-50 transition-colors">
          Quay lại
        </button>
      </div>
    );
  }

  const entryA = getEntry(current.pair.a);
  const entryB = getEntry(current.pair.b);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onClose} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
          <i className="ri-arrow-left-line"></i> Dừng
        </button>
        <span className="text-sm text-gray-500">{idx + 1} / {questions.length}</span>
        <span className="text-sm font-semibold text-rose-600">✓ {score}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
        <div className="bg-rose-400 h-1.5 rounded-full transition-all" style={{ width: `${(idx / questions.length) * 100}%` }}></div>
      </div>
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center mb-5">
        <p className="text-xs text-rose-400 tracking-normal mb-2">Từ đối nghĩa của từ này là gì?</p>
        <p className="text-4xl font-bold text-gray-900 mb-1">{current.pair.a}</p>
        {entryA && <p className="text-lg text-rose-400 font-bold mb-1">{entryA.hanja}</p>}
        {entryA && <p className="text-sm text-gray-500">{entryA.vietnamese}</p>}
        <button onClick={() => speakKorean(current.pair.a)}
          className="mt-2 flex items-center gap-1 px-3 py-1 bg-white rounded-full text-xs text-rose-500 cursor-pointer hover:bg-rose-100 transition-colors mx-auto">
          <i className="ri-volume-up-line"></i>Nghe
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {current.choices.map((choice, i) => {
          const entry = getEntry(choice);
          let cls = "border-2 border-gray-200 bg-white hover:border-rose-300";
          if (answered) {
            if (choice === current.pair.b) cls = "border-2 border-green-400 bg-green-50";
            else if (choice === selected) cls = "border-2 border-red-400 bg-red-50";
            else cls = "border-2 border-gray-100 bg-gray-50 opacity-60";
          }
          return (
            <button key={i} onClick={() => handleAnswer(choice)} disabled={answered}
              className={`p-4 rounded-xl text-center cursor-pointer transition-all disabled:cursor-default ${cls}`}>
              <p className="text-xl font-bold text-gray-900">{choice}</p>
              {entry && <p className="text-sm text-rose-400">{entry.hanja}</p>}
              {entry && <p className="text-xs text-gray-500 mt-1">{entry.vietnamese}</p>}
              {answered && choice === current.pair.b && <i className="ri-check-line text-green-600 text-lg mt-1 block"></i>}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mb-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{current.pair.a}</p>
              {entryA && <p className="text-xs text-gray-500">{entryA.vietnamese}</p>}
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <i className="ri-arrow-left-right-line text-xl"></i>
              <span className="text-xs font-medium text-rose-500">Đối nghĩa</span>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{current.pair.b}</p>
              {entryB && <p className="text-xs text-gray-500">{entryB.vietnamese}</p>}
            </div>
          </div>
          <button onClick={next} className="w-full mt-3 py-3 bg-rose-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-rose-600 transition-colors">
            {idx + 1 >= questions.length ? "Xem kết quả" : "Tiếp theo →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Add Custom Pair Modal ────────────────────────────────────────────────────
function AddPairModal({ onAdd, onClose }: { onAdd: (pair: AntonymPair) => void; onClose: () => void }) {
  const HANJA_DATA = useHanjaData();
  const [wordA, setWordA] = useState("");
  const [wordB, setWordB] = useState("");
  const [category, setCategory] = useState("");
  const [customCat, setCustomCat] = useState("");
  const [error, setError] = useState("");

  const PRESET_CATS = ["Cảm xúc", "Đạo đức", "Chính trị", "Kinh tế", "Y tế", "Học thuật", "Quân sự", "Xã hội", "Khoa học", "Ngôn ngữ", "Tùy chỉnh"];

  const handleSubmit = () => {
    const a = wordA.trim();
    const b = wordB.trim();
    const cat = category === "Tùy chỉnh" ? customCat.trim() : category;
    if (!a || !b) { setError("Vui lòng nhập cả 2 từ"); return; }
    if (!cat) { setError("Vui lòng chọn chủ đề"); return; }
    onAdd({ a, b, category: cat, custom: true });
    onClose();
  };

  const getEntry = (k: string) => HANJA_DATA.find(d => d.korean === k.trim());
  const previewA = getEntry(wordA);
  const previewB = getEntry(wordB);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Thêm cặp đối nghĩa</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Từ A</label>
            <input value={wordA} onChange={e => setWordA(e.target.value)} placeholder="예: 성공"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            {previewA && (
              <div className="mt-1 p-2 bg-rose-50 rounded-lg text-center">
                <p className="text-sm font-bold text-rose-500">{previewA.hanja}</p>
                <p className="text-xs text-gray-500">{previewA.vietnamese}</p>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Từ B (đối nghĩa)</label>
            <input value={wordB} onChange={e => setWordB(e.target.value)} placeholder="예: 실패"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            {previewB && (
              <div className="mt-1 p-2 bg-gray-50 rounded-lg text-center">
                <p className="text-sm font-bold text-rose-500">{previewB.hanja}</p>
                <p className="text-xs text-gray-500">{previewB.vietnamese}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 mb-2 block">Chủ đề</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_CATS.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${category === cat ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {cat}
              </button>
            ))}
          </div>
          {category === "Tùy chỉnh" && (
            <input value={customCat} onChange={e => setCustomCat(e.target.value)} placeholder="Nhập tên chủ đề..."
              className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          )}
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors">
            Hủy
          </button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-rose-600 transition-colors">
            Thêm cặp
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pair Card ────────────────────────────────────────────────────────────────
function PairCard({ pair, srData, onDelete }: { pair: AntonymPair; srData: Record<string, SRCard>; onDelete?: () => void }) {
  const HANJA_DATA = useHanjaData();
  const entryA = HANJA_DATA.find(d => d.korean === pair.a);
  const entryB = HANJA_DATA.find(d => d.korean === pair.b);
  const masteryA = getMastery(pair.a, srData);
  const masteryB = getMastery(pair.b, srData);

  const masteryColor = (m: string) =>
    m === "mastered" ? "text-green-600 bg-green-50" : m === "learning" ? "text-amber-600 bg-amber-50" : "text-gray-500 bg-gray-100";
  const masteryLabel = (m: string) =>
    m === "mastered" ? "Đã thuộc" : m === "learning" ? "Đang học" : "Mới";

  return (
    <div className={`bg-white border rounded-2xl p-4 hover:border-rose-200 transition-all ${pair.custom ? "border-rose-200" : "border-gray-100"}`}>
      {pair.custom && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-rose-500 font-medium flex items-center gap-1">
            <i className="ri-user-line"></i>Cặp của tôi
          </span>
          {onDelete && (
            <button onClick={onDelete} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 cursor-pointer text-gray-400 hover:text-red-500 transition-colors">
              <i className="ri-delete-bin-line text-xs"></i>
            </button>
          )}
        </div>
      )}
      <div className="flex items-stretch gap-3">
        <div className="flex-1 bg-rose-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{pair.a}</p>
          {entryA ? (
            <>
              <p className="text-base font-bold text-rose-400">{entryA.hanja}</p>
              <p className="text-xs text-gray-500 mt-1">{entryA.vietnamese}</p>
            </>
          ) : (
            <p className="text-xs text-gray-400 mt-1 italic">Không có trong từ điển</p>
          )}
          <button onClick={() => speakKorean(pair.a)}
            className="mt-2 w-6 h-6 flex items-center justify-center bg-white rounded-full text-rose-400 cursor-pointer hover:bg-rose-100 transition-colors mx-auto">
            <i className="ri-volume-up-line text-xs"></i>
          </button>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${masteryColor(masteryA)}`}>
            {masteryLabel(masteryA)}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
          <i className="ri-arrow-left-right-line text-gray-300 text-xl"></i>
          <span className="text-xs text-rose-400 font-medium whitespace-nowrap">Đối nghĩa</span>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{pair.b}</p>
          {entryB ? (
            <>
              <p className="text-base font-bold text-rose-400">{entryB.hanja}</p>
              <p className="text-xs text-gray-500 mt-1">{entryB.vietnamese}</p>
            </>
          ) : (
            <p className="text-xs text-gray-400 mt-1 italic">Không có trong từ điển</p>
          )}
          <button onClick={() => speakKorean(pair.b)}
            className="mt-2 w-6 h-6 flex items-center justify-center bg-white rounded-full text-rose-400 cursor-pointer hover:bg-rose-100 transition-colors mx-auto">
            <i className="ri-volume-up-line text-xs"></i>
          </button>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${masteryColor(masteryB)}`}>
            {masteryLabel(masteryB)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main AntonymTab ──────────────────────────────────────────────────────────
export default function AntonymTab() {
  const HANJA_DATA = useHanjaData();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "builtin" | "custom">("all");
  const [onlyUnlearned, setOnlyUnlearned] = useState(false);

  const [customPairs, setCustomPairs] = useState<AntonymPair[]>(() => {
    try { return JSON.parse(localStorage.getItem(CUSTOM_PAIRS_KEY) || "[]"); } catch { return []; }
  });

  const srData = useMemo<Record<string, SRCard>>(() => {
    try { return JSON.parse(localStorage.getItem(SR_KEY) || "{}"); } catch { return {}; }
  }, []);

  const saveCustomPairs = useCallback((pairs: AntonymPair[]) => {
    setCustomPairs(pairs);
    localStorage.setItem(CUSTOM_PAIRS_KEY, JSON.stringify(pairs));
  }, []);

  const handleAddPair = useCallback((pair: AntonymPair) => {
    const updated = [...customPairs, pair];
    saveCustomPairs(updated);
  }, [customPairs, saveCustomPairs]);

  const handleDeletePair = useCallback((idx: number) => {
    const updated = customPairs.filter((_, i) => i !== idx);
    saveCustomPairs(updated);
  }, [customPairs, saveCustomPairs]);

  const ALL_PAIRS = useMemo(() => {
    if (activeTab === "builtin") return BUILTIN_PAIRS;
    if (activeTab === "custom") return customPairs;
    return [...BUILTIN_PAIRS, ...customPairs];
  }, [activeTab, customPairs]);

  const CATEGORIES = useMemo(() => Array.from(new Set(ALL_PAIRS.map(p => p.category))), [ALL_PAIRS]);

  const filteredPairs = useMemo(() => {
    let pairs = ALL_PAIRS;
    if (selectedCategory) pairs = pairs.filter(p => p.category === selectedCategory);
    if (onlyUnlearned) {
      pairs = pairs.filter(p => {
        const mA = getMastery(p.a, srData);
        const mB = getMastery(p.b, srData);
        return mA !== "mastered" || mB !== "mastered";
      });
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      pairs = pairs.filter(p => {
        const eA = HANJA_DATA.find(d => d.korean === p.a);
        const eB = HANJA_DATA.find(d => d.korean === p.b);
        return p.a.includes(q) || p.b.includes(q) ||
          eA?.vietnamese.toLowerCase().includes(q) ||
          eB?.vietnamese.toLowerCase().includes(q);
      });
    }
    return pairs;
  }, [ALL_PAIRS, selectedCategory, search, onlyUnlearned, srData]);

  const stats = useMemo(() => {
    let bothMastered = 0, oneMastered = 0, neitherMastered = 0;
    BUILTIN_PAIRS.forEach(p => {
      const mA = getMastery(p.a, srData);
      const mB = getMastery(p.b, srData);
      if (mA === "mastered" && mB === "mastered") bothMastered++;
      else if (mA === "mastered" || mB === "mastered") oneMastered++;
      else neitherMastered++;
    });
    return { bothMastered, oneMastered, neitherMastered };
  }, [srData]);

  if (quizMode) {
    return (
      <div className="max-w-lg mx-auto">
        <AntonymQuiz pairs={filteredPairs.slice(0, 15)} onClose={() => setQuizMode(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {showAddModal && <AddPairModal onAdd={handleAddPair} onClose={() => setShowAddModal(false)} />}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.bothMastered}</p>
          <p className="text-xs text-gray-500 mt-1">Cặp đã thuộc cả 2</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.oneMastered}</p>
          <p className="text-xs text-gray-500 mt-1">Cặp thuộc 1 từ</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.neitherMastered}</p>
          <p className="text-xs text-gray-500 mt-1">Cặp chưa học</p>
        </div>
      </div>

      {/* Tab switcher: All / Built-in / Custom */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-4 w-fit">
        {([["all", "Tất cả"], ["builtin", "Có sẵn"], ["custom", `Của tôi (${customPairs.length})`]] as [string, string][]).map(([val, label]) => (
          <button key={val} onClick={() => { setActiveTab(val as "all" | "builtin" | "custom"); setSelectedCategory(null); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${activeTab === val ? "bg-white text-rose-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input type="text" placeholder="Tìm từ đối nghĩa..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
        </div>
        <button onClick={() => setOnlyUnlearned(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${onlyUnlearned ? "bg-amber-500 text-white" : "border border-amber-300 text-amber-600 hover:bg-amber-50"}`}>
          <i className="ri-focus-3-line"></i>{onlyUnlearned ? "Đang lọc: Chưa thuộc" : "Chỉ hiện chưa thuộc"}
        </button>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 border border-rose-300 text-rose-600 rounded-lg text-sm font-medium cursor-pointer hover:bg-rose-50 transition-colors whitespace-nowrap">
          <i className="ri-add-line"></i>Thêm cặp mới
        </button>
        <button onClick={() => setQuizMode(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-rose-600 transition-colors whitespace-nowrap">
          <i className="ri-gamepad-line"></i>Quiz ({Math.min(15, filteredPairs.length)} cặp)
        </button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${!selectedCategory ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          Tất cả ({ALL_PAIRS.length} cặp)
        </button>
        {CATEGORIES.map(cat => {
          const cnt = ALL_PAIRS.filter(p => p.category === cat).length;
          return (
            <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${selectedCategory === cat ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {cat} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Custom tab empty state */}
      {activeTab === "custom" && customPairs.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="w-12 h-12 flex items-center justify-center bg-rose-50 rounded-full mx-auto mb-3">
            <i className="ri-add-circle-line text-2xl text-rose-400"></i>
          </div>
          <p className="text-gray-700 font-medium mb-1">Chưa có cặp đối nghĩa nào</p>
          <p className="text-sm text-gray-400 mb-4">Thêm cặp đối nghĩa của riêng bạn để luyện tập</p>
          <button onClick={() => setShowAddModal(true)}
            className="px-5 py-2 bg-rose-500 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-rose-600 transition-colors">
            Thêm cặp đầu tiên
          </button>
        </div>
      )}

      {/* Pairs grid */}
      {filteredPairs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPairs.map((pair, i) => {
            const customIdx = customPairs.findIndex(cp => cp.a === pair.a && cp.b === pair.b);
            return (
              <PairCard key={i} pair={pair} srData={srData}
                onDelete={pair.custom && customIdx >= 0 ? () => handleDeletePair(customIdx) : undefined} />
            );
          })}
        </div>
      )}

      {filteredPairs.length === 0 && (activeTab !== "custom" || customPairs.length > 0) && (
        <div className="text-center py-16 text-gray-400">
          <i className="ri-search-line text-4xl"></i>
          <p className="mt-2 text-sm">Không tìm thấy cặp đối nghĩa nào</p>
        </div>
      )}

      <div className="mt-6 bg-rose-50 rounded-xl p-4">
        <p className="text-xs font-semibold text-rose-600 mb-1">Mẹo học đối nghĩa</p>
        <p className="text-xs text-gray-500">Học từng cặp cùng lúc giúp não ghi nhớ qua sự tương phản. Khi nhớ một từ, bạn sẽ tự động nhớ từ đối nghĩa của nó! Bạn cũng có thể tự thêm cặp đối nghĩa của riêng mình.</p>
      </div>
    </div>
  );
}

