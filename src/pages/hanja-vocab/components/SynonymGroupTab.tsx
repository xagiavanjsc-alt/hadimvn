import { useState, useMemo, useEffect } from "react";
import { HanjaEntry } from "@/mocks/hanjaData";
import { useHanjaData } from "@/contexts/HanjaDataContext";

const SR_KEY = "hanja_sr_data";

interface SRCard {
  korean: string;
  interval: number;
  easeFactor: number;
  dueDate: number;
  totalReviews: number;
  correctStreak: number;
}

function getMasteryLevel(korean: string, srData: Record<string, SRCard>): "new" | "learning" | "mastered" {
  const card = srData[korean];
  if (!card) return "new";
  if (card.interval >= 21) return "mastered";
  return "learning";
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

// Extract root Vietnamese words from meaning
function extractRoots(viet: string): string[] {
  return viet
    .split(/[,\/\(\)\-\s]+/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length >= 3);
}

interface SynonymGroup {
  key: string;          // normalized key
  label: string;        // display label (original)
  words: HanjaEntry[];
}

// Build synonym groups: group words that share the same Vietnamese root word
function buildSynonymGroups(data: HanjaEntry[], minSize: number = 2): SynonymGroup[] {
  const map = new Map<string, { label: string; words: HanjaEntry[] }>();

  data.forEach(entry => {
    const roots = extractRoots(entry.vietnamese);
    roots.forEach(root => {
      const key = normalize(root);
      if (key.length < 3) return;
      if (!map.has(key)) {
        map.set(key, { label: root, words: [] });
      }
      const group = map.get(key)!;
      // Avoid duplicates
      if (!group.words.some(w => w.korean === entry.korean)) {
        group.words.push(entry);
      }
    });
  });

  return Array.from(map.entries())
    .filter(([, g]) => g.words.length >= minSize)
    .sort((a, b) => b[1].words.length - a[1].words.length)
    .map(([key, g]) => ({ key, label: g.label, words: g.words }));
}

// Homophones: same Korean pronunciation (same korean string, different hanja/meaning)
function buildHomophoneGroups(data: HanjaEntry[]): { korean: string; words: HanjaEntry[] }[] {
  const map = new Map<string, HanjaEntry[]>();
  data.forEach(entry => {
    if (!map.has(entry.korean)) map.set(entry.korean, []);
    map.get(entry.korean)!.push(entry);
  });
  return Array.from(map.entries())
    .filter(([, words]) => words.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([korean, words]) => ({ korean, words }));
}

function MasteryBadge({ level }: { level: "new" | "learning" | "mastered" }) {
  if (level === "new") return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-app-surface/50 text-white/50">
      <i className="ri-seedling-line text-xs"></i>Mới
    </span>
  );
  if (level === "learning") return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400">
      <i className="ri-book-open-line text-xs"></i>Đang học
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">
      <i className="ri-check-double-line text-xs"></i>Đã thuộc
    </span>
  );
}

type Mode = "synonym" | "homophone" | "match";

// ─── Match Quiz (ghép cặp đồng nghĩa) ────────────────────────────────────────
function MatchQuiz({ groups, onClose }: { groups: SynonymGroup[]; onClose: () => void }) {
  // Pick 4 random groups with ≥2 words, pick 1 word from each
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selected, setSelected] = useState<{ korean: string; groupKey: string } | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);

  const ROUNDS = 8;

  const roundData = useMemo(() => {
    const eligible = groups.filter(g => g.words.length >= 2);
    const shuffled = [...eligible].sort(() => Math.random() - 0.5).slice(0, ROUNDS);
    return shuffled.map(g => {
      const words = [...g.words].sort(() => Math.random() - 0.5).slice(0, 2);
      return { group: g, words };
    });
  }, [groups]);

  const current = roundData[round];

  const leftWords = useMemo(() => current?.words.map(w => w.korean) ?? [], [current]);
  const rightWords = useMemo(() => {
    if (!current) return [];
    return [...current.words].sort(() => Math.random() - 0.5).map(w => w.vietnamese);
  }, [current]);

  const [leftSel, setLeftSel] = useState<string | null>(null);
  const [rightSel, setRightSel] = useState<string | null>(null);
  const [pairMatched, setPairMatched] = useState<Set<string>>(new Set());
  const [pairWrong, setPairWrong] = useState<string | null>(null);
  const [roundDone, setRoundDone] = useState(false);

  useEffect(() => {
    setLeftSel(null);
    setRightSel(null);
    setPairMatched(new Set());
    setPairWrong(null);
    setRoundDone(false);
  }, [round]);

  useEffect(() => {
    if (!leftSel || !rightSel || !current) return;
    const wordEntry = current.words.find(w => w.korean === leftSel);
    if (wordEntry && wordEntry.vietnamese === rightSel) {
      const next = new Set(pairMatched);
      next.add(leftSel);
      setPairMatched(next);
      setLeftSel(null);
      setRightSel(null);
      if (next.size === current.words.length) {
        setScore(s => s + 1);
        setTimeout(() => {
          if (round + 1 >= ROUNDS) setFinished(true);
          else setRound(r => r + 1);
        }, 600);
      }
    } else {
      setPairWrong(leftSel);
      setTimeout(() => {
        setPairWrong(null);
        setLeftSel(null);
        setRightSel(null);
      }, 700);
    }
  }, [leftSel, rightSel]);

  if (finished) {
    const pct = Math.round((score / ROUNDS) * 100);
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className={`w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4 ${pct >= 75 ? "bg-green-500/20" : "bg-amber-500/20"}`}>
          <i className={`text-2xl ${pct >= 75 ? "ri-trophy-line text-green-400" : "ri-emotion-normal-line text-amber-400"}`}></i>
        </div>
        <p className="text-2xl font-bold text-white mb-1">{pct}%</p>
        <p className="text-white/50 mb-6">Ghép đúng {score} / {ROUNDS} nhóm</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-6 py-2.5 border border-app-border text-white/80 rounded-xl font-medium cursor-pointer hover:bg-app-surface/50 transition-colors">Quay lại</button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onClose} className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 cursor-pointer">
          <i className="ri-arrow-left-line"></i> Dừng
        </button>
        <span className="text-sm text-white/50">Nhóm {round + 1} / {ROUNDS}</span>
        <span className="text-sm font-semibold text-app-accent-primary">✓ {score}</span>
      </div>
      <div className="w-full bg-app-surface/50 rounded-full h-1.5 mb-5">
        <div className="bg-app-accent-primary h-1.5 rounded-full transition-all" style={{ width: `${(round / ROUNDS) * 100}%` }}></div>
      </div>
      <div className="bg-app-accent-primary/10 border border-app-accent-primary/30 rounded-xl p-3 text-center mb-5">
        <p className="text-xs text-app-accent-primary font-semibold tracking-wide mb-1">Chủ đề nhóm</p>
        <p className="text-lg font-bold text-white capitalize">{current.group.label}</p>
        <p className="text-xs text-white/50">Ghép từ Hàn với nghĩa tiếng Việt tương ứng</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-white/50 text-center tracking-wide">Tiếng Hàn</p>
          {leftWords.map(korean => {
            const isMatched = pairMatched.has(korean);
            const isSelected = leftSel === korean;
            const isWrong = pairWrong === korean;
            return (
              <button key={korean} onClick={() => !isMatched && setLeftSel(korean)}
                disabled={isMatched}
                className={`w-full py-2.5 rounded-xl border-2 text-center font-bold text-lg cursor-pointer transition-all disabled:cursor-default ${
                  isMatched ? "border-green-400 bg-green-500/10 text-green-400" :
                  isWrong ? "border-red-400 bg-red-500/10 text-red-400" :
                  isSelected ? "border-app-accent-primary bg-app-accent-primary/10 text-app-accent-primary" :
                  "border-app-border bg-app-surface/50 text-white hover:border-app-accent-primary"
                }`}>
                {korean}
                {isMatched && <i className="ri-check-line ml-2 text-green-400"></i>}
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold text-white/50 text-center tracking-wide">Tiếng Việt</p>
          {rightWords.map(viet => {
            const matchedKorean = current.words.find(w => w.vietnamese === viet && pairMatched.has(w.korean));
            const isMatched = !!matchedKorean;
            const isSelected = rightSel === viet;
            return (
              <button key={viet} onClick={() => !isMatched && setRightSel(viet)}
                disabled={isMatched}
                className={`w-full py-2.5 rounded-xl border-2 text-center text-sm font-medium cursor-pointer transition-all disabled:cursor-default ${
                  isMatched ? "border-green-400 bg-green-500/10 text-green-400" :
                  isSelected ? "border-app-accent-primary bg-app-accent-primary/10 text-app-accent-primary" :
                  "border-app-border bg-app-surface/50 text-white/80 hover:border-app-accent-primary"
                }`}>
                {viet}
                {isMatched && <i className="ri-check-line ml-2 text-green-400"></i>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function SynonymGroupTab() {
  const HANJA_DATA = useHanjaData();
  const [mode, setMode] = useState<Mode>("synonym");
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [matchQuizMode, setMatchQuizMode] = useState(false);
  const [quizGroup, setQuizGroup] = useState<HanjaEntry[] | null>(null);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [quizResults, setQuizResults] = useState<{ known: number; unknown: number }>({ known: 0, unknown: 0 });
  const [quizDone, setQuizDone] = useState(false);

  const srData = useMemo<Record<string, SRCard>>(() => {
    try { return JSON.parse(localStorage.getItem(SR_KEY) || "{}"); } catch { return {}; }
  }, []);

  const synonymGroups = useMemo(() => buildSynonymGroups(HANJA_DATA, 2), [HANJA_DATA]);
  const homophoneGroups = useMemo(() => buildHomophoneGroups(HANJA_DATA), [HANJA_DATA]);

  const filteredSynonymGroups = useMemo(() => {
    if (!search.trim()) return synonymGroups.slice(0, 60);
    const q = search.toLowerCase();
    return synonymGroups.filter(g =>
      g.label.includes(q) ||
      normalize(g.label).includes(normalize(q)) ||
      g.words.some(w => w.korean.includes(q) || w.vietnamese.toLowerCase().includes(q))
    ).slice(0, 60);
  }, [synonymGroups, search]);

  const filteredHomophoneGroups = useMemo(() => {
    if (!search.trim()) return homophoneGroups.slice(0, 60);
    const q = search.toLowerCase();
    return homophoneGroups.filter(g =>
      g.korean.includes(q) ||
      g.words.some(w => w.vietnamese.toLowerCase().includes(q) || w.hanja.includes(q))
    ).slice(0, 60);
  }, [homophoneGroups, search]);

  const selectedSynonymGroup = useMemo(() => {
    if (!selectedGroup || mode !== "synonym") return null;
    return synonymGroups.find(g => g.key === selectedGroup) ?? null;
  }, [selectedGroup, synonymGroups, mode]);

  const selectedHomophoneGroup = useMemo(() => {
    if (!selectedGroup || mode !== "homophone") return null;
    return homophoneGroups.find(g => g.korean === selectedGroup) ?? null;
  }, [selectedGroup, homophoneGroups, mode]);

  const currentGroupWords = selectedSynonymGroup?.words ?? selectedHomophoneGroup?.words ?? [];

  // Quiz
  const startQuiz = (words: HanjaEntry[]) => {
    setQuizGroup(words);
    setQuizIdx(0);
    setQuizRevealed(false);
    setQuizResults({ known: 0, unknown: 0 });
    setQuizDone(false);
  };

  const handleQuizAnswer = (known: boolean) => {
    setQuizResults(prev => ({
      known: prev.known + (known ? 1 : 0),
      unknown: prev.unknown + (known ? 0 : 1),
    }));
    const next = quizIdx + 1;
    if (next >= (quizGroup?.length ?? 0)) {
      setQuizDone(true);
    } else {
      setQuizIdx(next);
      setQuizRevealed(false);
    }
  };

  // Match quiz mode
  if (matchQuizMode) {
    return <MatchQuiz groups={synonymGroups} onClose={() => setMatchQuizMode(false)} />;
  }

  // Quiz view
  if (quizGroup && !quizDone) {
    const card = quizGroup[quizIdx];
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setQuizGroup(null)} className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 cursor-pointer">
            <i className="ri-arrow-left-line"></i> Dừng
          </button>
          <span className="text-sm text-white/50">{quizIdx + 1} / {quizGroup.length}</span>
          <span className="text-xs text-green-400 font-medium">✓ {quizResults.known} &nbsp; ✗ {quizResults.unknown}</span>
        </div>
        <div className="w-full bg-app-surface/50 rounded-full h-1.5 mb-6">
          <div className="bg-app-accent-primary h-1.5 rounded-full transition-all" style={{ width: `${(quizIdx / quizGroup.length) * 100}%` }}></div>
        </div>
        <div className="bg-app-surface/50 border-2 border-app-border rounded-2xl p-8 text-center mb-4">
          <p className="text-4xl font-bold text-white mb-2">{card.korean}</p>
          <p className="text-xl text-app-accent-primary font-bold mb-4">{card.hanja}</p>
          {!quizRevealed ? (
            <button onClick={() => setQuizRevealed(true)}
              className="px-6 py-2 bg-app-surface/50 text-white/70 rounded-lg text-sm cursor-pointer hover:bg-app-surface/80 transition-colors">
              Hiện nghĩa
            </button>
          ) : (
            <div className="border-t border-app-border pt-4">
              <p className="text-xl font-semibold text-white/80">{card.vietnamese}</p>
            </div>
          )}
        </div>
        {quizRevealed && (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleQuizAnswer(false)}
              className="py-4 rounded-xl border-2 border-red-500/40 bg-red-500/10 text-red-400 font-bold cursor-pointer hover:bg-red-500/20 transition-colors">
              <i className="ri-close-line mr-1"></i>Chưa biết
            </button>
            <button onClick={() => handleQuizAnswer(true)}
              className="py-4 rounded-xl border-2 border-green-500/40 bg-green-500/10 text-green-400 font-bold cursor-pointer hover:bg-green-500/20 transition-colors">
              <i className="ri-check-line mr-1"></i>Đã biết
            </button>
          </div>
        )}
      </div>
    );
  }

  if (quizGroup && quizDone) {
    const pct = Math.round((quizResults.known / quizGroup.length) * 100);
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-app-surface/50 border border-app-border rounded-2xl p-8 text-center">
          <div className={`w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4 ${pct >= 80 ? "bg-green-500/20" : pct >= 50 ? "bg-amber-500/20" : "bg-red-500/20"}`}>
            <i className={`text-3xl ${pct >= 80 ? "ri-trophy-line text-green-400" : pct >= 50 ? "ri-emotion-normal-line text-amber-400" : "ri-emotion-sad-line text-red-400"}`}></i>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{pct}%</h3>
          <p className="text-white/50 mb-8">Biết {quizResults.known} / {quizGroup.length} từ</p>
          <div className="flex gap-3">
            <button onClick={() => startQuiz(quizGroup)} className="flex-1 py-3 bg-app-accent-primary text-app-bg rounded-xl font-semibold cursor-pointer hover:bg-app-accent-primary/90 transition-colors">Ôn lại</button>
            <button onClick={() => setQuizGroup(null)} className="flex-1 py-2 border border-app-border text-white/80 rounded-lg text-sm font-medium cursor-pointer hover:bg-app-surface/50 transition-colors">Quay lại</button>
          </div>
        </div>
      </div>
    );
  }

  // Group detail view
  if (selectedGroup && currentGroupWords.length > 0) {
    const groupLabel = mode === "synonym"
      ? `Nhóm nghĩa "${selectedSynonymGroup?.label}"`
      : `Đồng âm "${selectedHomophoneGroup?.korean}"`;

    return (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setSelectedGroup(null)}
            className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 cursor-pointer">
            <i className="ri-arrow-left-line"></i> Quay lại
          </button>
          <span className="text-sm font-semibold text-white/80">{groupLabel}</span>
          <span className="text-xs text-white/40">({currentGroupWords.length} từ)</span>
        </div>

        {/* Comparison table */}
        <div className="bg-app-surface/50 border border-app-border rounded-2xl overflow-hidden mb-4">
          <div className="p-4 border-b border-app-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white/80">So sánh các từ trong nhóm</p>
              <p className="text-xs text-white/40 mt-0.5">
                {mode === "synonym" ? "Các từ có cùng nghĩa tiếng Việt — học phân biệt" : "Các từ đọc giống nhau nhưng nghĩa khác nhau"}
              </p>
            </div>
            <button onClick={() => startQuiz(currentGroupWords)}
              className="flex items-center gap-2 px-4 py-2 bg-app-accent-primary text-app-bg rounded-lg text-sm font-medium cursor-pointer hover:bg-app-accent-primary/90 transition-colors whitespace-nowrap">
              <i className="ri-flashlight-line"></i>Ôn nhóm này
            </button>
          </div>

          {/* Highlight differences */}
          <div className="divide-y divide-app-border">
            {currentGroupWords.map((word, i) => {
              const mastery = getMasteryLevel(word.korean, srData);
              return (
                <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-app-accent-primary/5 transition-colors">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-app-accent-primary/20 text-app-accent-primary text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="w-28 flex-shrink-0">
                    <span className="text-lg font-bold text-white block">{word.korean}</span>
                    <span className="text-sm font-bold text-app-accent-primary">{word.hanja}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/80 font-medium">{word.vietnamese}</p>
                  </div>
                  <MasteryBadge level={mastery} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Memory tip */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-lightbulb-line text-amber-400"></i>
            <span className="text-sm font-semibold text-amber-400">Mẹo ghi nhớ</span>
          </div>
          <p className="text-xs text-amber-400">
            {mode === "synonym"
              ? "Chú ý sự khác biệt về Hán tự — mỗi chữ Hán mang sắc thái nghĩa riêng dù phiên âm tiếng Việt giống nhau."
              : "Các từ đồng âm rất dễ nhầm lẫn! Hãy chú ý Hán tự và ngữ cảnh sử dụng để phân biệt."}
          </p>
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white mb-1">Học theo cặp từ</h2>
        <p className="text-sm text-white/50">Nhóm các từ đồng nghĩa hoặc đồng âm để học phân biệt hiệu quả hơn</p>
      </div>

      {/* Mode toggle */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="flex gap-1 bg-app-surface/50 rounded-xl p-1">
          <button onClick={() => { setMode("synonym"); setSelectedGroup(null); setSearch(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap transition-all ${mode === "synonym" ? "bg-app-surface/50 text-app-accent-primary" : "text-white/50 hover:text-white/80"}`}>
            <i className="ri-links-line"></i>Đồng nghĩa
            <span className="text-xs opacity-60">({synonymGroups.length})</span>
          </button>
          <button onClick={() => { setMode("homophone"); setSelectedGroup(null); setSearch(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap transition-all ${mode === "homophone" ? "bg-app-surface/50 text-app-accent-primary" : "text-white/50 hover:text-white/80"}`}>
            <i className="ri-sound-module-line"></i>Đồng âm
            <span className="text-xs opacity-60">({homophoneGroups.length})</span>
          </button>
        </div>
        <button onClick={() => setMatchQuizMode(true)}
          className="flex items-center gap-2 px-4 py-2 bg-app-accent-primary text-app-bg rounded-xl text-sm font-semibold cursor-pointer hover:bg-app-accent-primary/90 transition-colors whitespace-nowrap">
          <i className="ri-drag-drop-line"></i>Quiz ghép cặp đồng nghĩa
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm"></i>
        <input type="text" placeholder={mode === "synonym" ? "Tìm theo nghĩa tiếng Việt..." : "Tìm theo từ Hàn..."}
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-app-surface/50 border border-app-border rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-app-accent-primary" />
      </div>

      {/* Synonym groups */}
      {mode === "synonym" && (
        <div>
          <p className="text-xs text-white/40 mb-3">
            Hiển thị {filteredSynonymGroups.length} nhóm · Tổng {synonymGroups.length} nhóm đồng nghĩa
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSynonymGroups.map(group => {
              const masteredCount = group.words.filter(w => getMasteryLevel(w.korean, srData) === "mastered").length;
              return (
                <button key={group.key} onClick={() => setSelectedGroup(group.key)}
                  className="bg-app-surface/50 border border-app-border rounded-xl p-4 text-left hover:border-app-accent-primary transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-white text-sm capitalize">{group.label}</p>
                      <p className="text-xs text-white/40 mt-0.5">{group.words.length} từ cùng nghĩa</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      masteredCount === group.words.length ? "bg-green-500/20 text-green-400" :
                      masteredCount > 0 ? "bg-amber-500/20 text-amber-400" : "bg-app-surface/50 text-white/50"
                    }`}>
                      {masteredCount}/{group.words.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.words.slice(0, 5).map((w, i) => (
                      <span key={i} className="px-2 py-0.5 bg-app-accent-primary/10 text-app-accent-primary rounded-md text-xs font-medium">
                        {w.korean}
                      </span>
                    ))}
                    {group.words.length > 5 && (
                      <span className="px-2 py-0.5 bg-app-surface/50 text-white/40 rounded-md text-xs">
                        +{group.words.length - 5}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 w-full bg-app-surface/50 rounded-full h-1">
                    <div className="bg-green-400 h-1 rounded-full transition-all"
                      style={{ width: `${group.words.length > 0 ? (masteredCount / group.words.length) * 100 : 0}%` }}></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Homophone groups */}
      {mode === "homophone" && (
        <div>
          <p className="text-xs text-white/40 mb-3">
            Hiển thị {filteredHomophoneGroups.length} nhóm · Tổng {homophoneGroups.length} nhóm đồng âm
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredHomophoneGroups.map(group => {
              const masteredCount = group.words.filter(w => getMasteryLevel(w.korean, srData) === "mastered").length;
              return (
                <button key={group.korean} onClick={() => setSelectedGroup(group.korean)}
                  className="bg-app-surface/50 border border-app-border rounded-xl p-4 text-left hover:border-app-accent-primary transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-white text-xl">{group.korean}</p>
                      <p className="text-xs text-white/40 mt-0.5">{group.words.length} nghĩa khác nhau</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      masteredCount === group.words.length ? "bg-green-500/20 text-green-400" :
                      masteredCount > 0 ? "bg-amber-500/20 text-amber-400" : "bg-app-surface/50 text-white/50"
                    }`}>
                      {masteredCount}/{group.words.length}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {group.words.slice(0, 3).map((w, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-sm font-bold text-app-accent-primary w-16 flex-shrink-0">{w.hanja}</span>
                        <span className="text-xs text-white/50 truncate">{w.vietnamese}</span>
                      </div>
                    ))}
                    {group.words.length > 3 && (
                      <p className="text-xs text-white/40">+{group.words.length - 3} nghĩa khác...</p>
                    )}
                  </div>
                  <div className="mt-2 w-full bg-app-surface/50 rounded-full h-1">
                    <div className="bg-green-400 h-1 rounded-full transition-all"
                      style={{ width: `${group.words.length > 0 ? (masteredCount / group.words.length) * 100 : 0}%` }}></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
