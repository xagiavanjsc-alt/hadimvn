import { useState, useMemo, useEffect, useCallback } from "react";
import { HANJA_DATA, HanjaEntry } from "@/mocks/hanjaData";

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

function MasteryBadge({ level }: { level: "new" | "learning" | "mastered" }) {
  if (level === "new") return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
      <i className="ri-seedling-line text-xs"></i>M?i
    </span>
  );
  if (level === "learning") return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-amber-50 text-amber-600">
      <i className="ri-book-open-line text-xs"></i>Ðang h?c
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-green-50 text-green-600">
      <i className="ri-check-double-line text-xs"></i>Ðã thu?c
    </span>
  );
}

// Build homophone groups: same Korean pronunciation, different hanja/meaning
function buildHomophoneGroups(): { korean: string; words: HanjaEntry[] }[] {
  const map = new Map<string, HanjaEntry[]>();
  HANJA_DATA.forEach(entry => {
    if (!map.has(entry.korean)) map.set(entry.korean, []);
    map.get(entry.korean)!.push(entry);
  });
  return Array.from(map.entries())
    .filter(([, words]) => words.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([korean, words]) => ({ korean, words }));
}

// Famous homophone examples to highlight
const FAMOUS_HOMOPHONES = ["??", "??", "??", "??", "??", "??", "??", "??", "??", "??", "??", "??", "??", "??", "??"];

type QuizState = "idle" | "playing" | "done";

interface QuizQuestion {
  word: HanjaEntry;
  group: HanjaEntry[];
  choices: HanjaEntry[];
  answered: boolean;
  selected: string | null;
}

function HomophoneQuiz({ group, onClose }: { group: { korean: string; words: HanjaEntry[] }; onClose: () => void }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [state, setState] = useState<QuizState>("idle");

  const buildQuestions = useCallback(() => {
    // For each word in group, ask: "Hán t? này có nghia gì?"
    const qs: QuizQuestion[] = group.words.map(word => {
      // Wrong choices: other words from same group + random from other groups
      const others = group.words.filter(w => w.korean !== word.korean || w.hanja !== word.hanja);
      const random = HANJA_DATA
        .filter(d => d.korean !== group.korean)
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.max(0, 3 - others.length));
      const choices = [...others, ...random].sort(() => Math.random() - 0.5).slice(0, 3);
      choices.push(word);
      return {
        word,
        group: group.words,
        choices: choices.sort(() => Math.random() - 0.5),
        answered: false,
        selected: null,
      };
    });
    setQuestions(qs);
    setIdx(0);
    setScore(0);
    setState("playing");
  }, [group]);

  const handleAnswer = (choice: HanjaEntry) => {
    if (questions[idx]?.answered) return;
    const correct = choice.hanja === questions[idx].word.hanja;
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, answered: true, selected: choice.hanja } : q));
    if (correct) setScore(s => s + 1);
  };

  const next = () => {
    if (idx + 1 >= questions.length) setState("done");
    else setIdx(i => i + 1);
  };

  if (state === "idle") {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center max-w-md mx-auto">
        <div className="w-14 h-14 flex items-center justify-center bg-rose-100 rounded-2xl mx-auto mb-3">
          <span className="text-2xl font-bold text-rose-600">{group.korean}</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Quiz d?ng âm: {group.korean}</h3>
        <p className="text-sm text-gray-500 mb-4">{group.words.length} nghia khác nhau — phân bi?t qua Hán t?</p>
        <div className="space-y-2 mb-5 text-left">
          {group.words.map((w, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 bg-rose-50 rounded-lg">
              <span className="text-rose-500 font-bold text-lg w-16">{w.hanja}</span>
              <span className="text-sm text-gray-700">{w.vietnamese}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition-colors">Quay l?i</button>
          <button onClick={buildQuestions} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-rose-600 transition-colors">B?t d?u Quiz</button>
        </div>
      </div>
    );
  }

  if (state === "done") {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center max-w-md mx-auto">
        <div className={`w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4 ${pct >= 80 ? "bg-green-100" : "bg-amber-100"}`}>
          <i className={`text-2xl ${pct >= 80 ? "ri-trophy-line text-green-600" : "ri-emotion-normal-line text-amber-600"}`}></i>
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{pct}%</p>
        <p className="text-gray-500 mb-6">Ðúng {score} / {questions.length} câu</p>
        <div className="flex gap-3">
          <button onClick={buildQuestions} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-rose-600 transition-colors">Làm l?i</button>
          <button onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer hover:bg-gray-50 transition-colors">Quay l?i</button>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  if (!q) return null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onClose} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
          <i className="ri-arrow-left-line"></i> D?ng
        </button>
        <span className="text-sm text-gray-500">Câu {idx + 1} / {questions.length}</span>
        <span className="text-sm font-semibold text-rose-600">? {score}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
        <div className="bg-rose-400 h-1.5 rounded-full transition-all" style={{ width: `${(idx / questions.length) * 100}%` }}></div>
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 text-center mb-4">
        <p className="text-xs text-gray-400 tracking-wide mb-3">Hán t? này thu?c t? nào?</p>
        <p className="text-5xl font-bold text-rose-500 mb-2">{q.word.hanja}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{q.word.korean}</p>
        <p className="text-sm text-gray-400">Ch?n nghia ti?ng Vi?t dúng</p>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-4">
        {q.choices.map((choice, i) => {
          let cls = "border-2 border-gray-200 bg-white text-gray-700 hover:border-rose-300";
          if (q.answered) {
            if (choice.hanja === q.word.hanja) cls = "border-2 border-green-400 bg-green-50 text-green-700";
            else if (choice.hanja === q.selected) cls = "border-2 border-red-400 bg-red-50 text-red-700";
            else cls = "border-2 border-gray-100 bg-gray-50 text-gray-400";
          }
          return (
            <button key={i} onClick={() => handleAnswer(choice)} disabled={q.answered}
              className={`p-4 rounded-xl text-sm font-medium cursor-pointer transition-all text-left flex items-center gap-3 ${cls} disabled:cursor-default`}>
              <span className="text-rose-400 font-bold text-lg w-12 flex-shrink-0">{choice.hanja}</span>
              <span>{choice.vietnamese}</span>
              {q.answered && choice.hanja === q.word.hanja && <i className="ri-check-line text-green-600 ml-auto"></i>}
              {q.answered && choice.hanja === q.selected && choice.hanja !== q.word.hanja && <i className="ri-close-line text-red-500 ml-auto"></i>}
            </button>
          );
        })}
      </div>

      {q.answered && (
        <button onClick={next} className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-rose-600 transition-colors">
          {idx + 1 >= questions.length ? "Xem k?t qu?" : "Câu ti?p theo ?"}
        </button>
      )}
    </div>
  );
}

export default function HomophoneTab() {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<{ korean: string; words: HanjaEntry[] } | null>(null);
  const [quizGroup, setQuizGroup] = useState<{ korean: string; words: HanjaEntry[] } | null>(null);
  const [filterFamous, setFilterFamous] = useState(false);

  const srData = useMemo<Record<string, SRCard>>(() => {
    try { return JSON.parse(localStorage.getItem(SR_KEY) || "{}"); } catch { return {}; }
  }, []);

  const allGroups = useMemo(() => buildHomophoneGroups(), []);

  const filteredGroups = useMemo(() => {
    let groups = allGroups;
    if (filterFamous) groups = groups.filter(g => FAMOUS_HOMOPHONES.includes(g.korean));
    if (search.trim()) {
      const q = search.toLowerCase();
      groups = groups.filter(g =>
        g.korean.includes(q) ||
        g.words.some(w => w.hanja.includes(q) || w.vietnamese.toLowerCase().includes(q))
      );
    }
    return groups;
  }, [allGroups, search, filterFamous]);

  if (quizGroup) {
    return <HomophoneQuiz group={quizGroup} onClose={() => setQuizGroup(null)} />;
  }

  if (selectedGroup) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setSelectedGroup(null)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
            <i className="ri-arrow-left-line"></i> Quay l?i
          </button>
          <span className="text-sm font-semibold text-gray-700">Ð?ng âm: {selectedGroup.korean}</span>
          <span className="text-xs text-gray-400">({selectedGroup.words.length} nghia)</span>
        </div>

        {/* Hero comparison */}
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 rounded-2xl p-6 mb-5">
          <div className="text-center mb-5">
            <p className="text-5xl font-bold text-gray-900 mb-1">{selectedGroup.korean}</p>
            <p className="text-sm text-gray-500">{selectedGroup.words.length} nghia khác nhau — phân bi?t qua Hán t?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedGroup.words.map((word, i) => {
              const mastery = getMasteryLevel(word.korean, srData);
              return (
                <div key={i} className="bg-white rounded-xl p-4 border border-rose-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-3xl font-bold text-rose-500 block">{word.hanja}</span>
                      <span className="text-lg font-bold text-gray-900">{word.korean}</span>
                    </div>
                    <MasteryBadge level={mastery} />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{word.vietnamese}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Memory tips */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-lightbulb-line text-amber-500"></i>
            <span className="text-sm font-semibold text-amber-700">Cách phân bi?t d?ng âm</span>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-700">
            <li className="flex items-start gap-2"><i className="ri-arrow-right-s-line mt-0.5 flex-shrink-0"></i>Chú ý Hán t? — m?i ch? Hán mang nghia g?c riêng bi?t</li>
            <li className="flex items-start gap-2"><i className="ri-arrow-right-s-line mt-0.5 flex-shrink-0"></i>H?c trong ng? c?nh câu — nghia s? rõ hon khi có context</li>
            <li className="flex items-start gap-2"><i className="ri-arrow-right-s-line mt-0.5 flex-shrink-0"></i>Liên k?t v?i ti?ng Hán/Nh?t n?u b?n bi?t — g?c ch? gi?ng nhau</li>
          </ul>
        </div>

        <button onClick={() => setQuizGroup(selectedGroup)}
          className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-rose-600 transition-colors flex items-center justify-center gap-2">
          <i className="ri-gamepad-line"></i>Quiz phân bi?t nhóm này
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900 mb-1">H?c theo c?p t? d?ng âm khác nghia</h2>
        <p className="text-sm text-gray-500">
          Ví d?: <span className="font-bold text-rose-600">??</span> (?? bác si / ?? ý d?nh),{" "}
          <span className="font-bold text-rose-600">??</span> (?? b?n d? / ?? hu?ng d?n) — tránh nh?m l?n!
        </p>
      </div>

      {/* Stats banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Nhóm d?ng âm", value: allGroups.length, icon: "ri-sound-module-line", color: "#f43f5e" },
          { label: "T? n?i ti?ng", value: allGroups.filter(g => FAMOUS_HOMOPHONES.includes(g.korean)).length, icon: "ri-star-line", color: "#fb923c" },
          { label: "T?ng t?", value: allGroups.reduce((s, g) => s + g.words.length, 0), icon: "ri-translate-2", color: "#34d399" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input type="text" placeholder="Tìm t? Hàn, Hán t?, nghia..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
        </div>
        <button onClick={() => setFilterFamous(f => !f)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap transition-all ${filterFamous ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          <i className="ri-star-line"></i>T? n?i ti?ng
        </button>
      </div>

      {/* Famous homophones highlight */}
      {!search && !filterFamous && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 tracking-wide mb-3">T? d?ng âm n?i ti?ng — d? nh?m nh?t</p>
          <div className="flex flex-wrap gap-2">
            {FAMOUS_HOMOPHONES.map(korean => {
              const group = allGroups.find(g => g.korean === korean);
              if (!group) return null;
              return (
                <button key={korean} onClick={() => setSelectedGroup(group)}
                  className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-sm font-bold text-rose-700 cursor-pointer hover:bg-rose-100 transition-colors whitespace-nowrap">
                  {korean}
                  <span className="text-xs font-normal text-rose-400">{group.words.length} nghia</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Group list */}
      <p className="text-xs text-gray-400 mb-3">Hi?n th? {filteredGroups.length} nhóm d?ng âm</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredGroups.map(group => {
          const masteredCount = group.words.filter(w => getMasteryLevel(w.korean, srData) === "mastered").length;
          const isFamous = FAMOUS_HOMOPHONES.includes(group.korean);
          return (
            <div key={group.korean}
              className={`bg-white border rounded-xl p-4 hover:border-rose-200 transition-all cursor-pointer relative ${isFamous ? "border-rose-200" : "border-gray-100"}`}
              onClick={() => setSelectedGroup(group)}>
              {isFamous && (
                <div className="absolute -top-2 -right-2">
                  <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">Hot</span>
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{group.korean}</p>
                  <p className="text-xs text-gray-400">{group.words.length} nghia khác nhau</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  masteredCount === group.words.length ? "bg-green-100 text-green-600" :
                  masteredCount > 0 ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"
                }`}>
                  {masteredCount}/{group.words.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {group.words.slice(0, 3).map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-rose-500 font-bold text-sm w-14 flex-shrink-0">{w.hanja}</span>
                    <span className="text-xs text-gray-500 truncate">{w.vietnamese}</span>
                  </div>
                ))}
                {group.words.length > 3 && (
                  <p className="text-xs text-gray-400">+{group.words.length - 3} nghia khác...</p>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex-1 bg-gray-100 rounded-full h-1 mr-3">
                  <div className="bg-green-400 h-1 rounded-full transition-all"
                    style={{ width: `${group.words.length > 0 ? (masteredCount / group.words.length) * 100 : 0}%` }}></div>
                </div>
                <button onClick={e => { e.stopPropagation(); setQuizGroup(group); }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-medium cursor-pointer hover:bg-rose-100 transition-colors whitespace-nowrap">
                  <i className="ri-gamepad-line"></i>Quiz
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <i className="ri-search-line text-4xl"></i>
          <p className="mt-2 text-sm">Không tìm th?y nhóm d?ng âm nào</p>
        </div>
      )}
    </div>
  );
}

