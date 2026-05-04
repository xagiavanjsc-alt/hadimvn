import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface GrammarPattern {
  id: string;
  level: string;
  levelColor: string;
  pattern: string;
  meaning: string;
  explanation: string;
  formation: string;
  examples: { korean: string; vietnamese: string }[];
  exercises: { question: string; options: string[]; answer: number; explanation: string }[];
  commonMistakes: string[];
  tags: string[];
}

const GRAMMAR_PATTERNS: GrammarPattern[] = [
  {
    id: "a1-1",
    level: "A1",
    levelColor: "#22c55e",
    pattern: "N?/?",
    meaning: "Tr? t? ch? d?",
    explanation: "?/? là tr? t? ch? d?, dùng d? dánh d?u ch? d? c?a câu. Dùng ? sau ph? âm, ? sau nguyên âm.",
    formation: "N(ph? âm) + ? / N(nguyên âm) + ?",
    examples: [
      { korean: "?? ?????.", vietnamese: "Tôi là h?c sinh." },
      { korean: "??? ?????.", vietnamese: "Hàn Qu?c th?t d?p." },
      { korean: "??? ??? ???.", vietnamese: "Hôm nay th?i ti?t d?p." },
    ],
    exercises: [
      { question: "? ___ ??? ?????.", options: ["?", "?", "?", "?"], answer: 1, explanation: "? k?t thúc b?ng nguyên âm eo, nên dùng ?" },
      { question: "??? ___ ?????.", options: ["?", "?", "?", "?"], answer: 0, explanation: "??? k?t thúc b?ng ph? âm eo, nên dùng ?" },
    ],
    commonMistakes: ["Nh?m l?n ?/? v?i ?/?", "Dùng ?/? khi c?n nh?n m?nh ch? ng?"],
    tags: ["Tr? t?", "Co b?n", "Ch? d?"],
  },
  {
    id: "a1-2",
    level: "A1",
    levelColor: "#22c55e",
    pattern: "N?/?",
    meaning: "Tr? t? ch? ng?",
    explanation: "?/? là tr? t? ch? ng?, dùng d? dánh d?u ch? ng? th?c s? c?a câu. Dùng ? sau ph? âm, ? sau nguyên âm.",
    formation: "N(ph? âm) + ? / N(nguyên âm) + ?",
    examples: [
      { korean: "?? ???.", vietnamese: "Hoa d?p." },
      { korean: "?? ????", vietnamese: "Ai d?n v?y?" },
      { korean: "?? ??.", vietnamese: "Tr?i mua." },
    ],
    exercises: [
      { question: "? ___ ???.", options: ["?", "?", "?", "?"], answer: 2, explanation: "? k?t thúc b?ng ph? âm, nên dùng ?" },
      { question: "?? ___ ????", options: ["?", "?", "?", "?"], answer: 3, explanation: "?? k?t thúc b?ng nguyên âm, nên dùng ?" },
    ],
    commonMistakes: ["Nh?m ?/? v?i ?/?", "?/? dùng khi gi?i thi?u thông tin m?i"],
    tags: ["Tr? t?", "Co b?n", "Ch? ng?"],
  },
  {
    id: "a2-1",
    level: "A2",
    levelColor: "#84cc16",
    pattern: "V-? ??",
    meaning: "Mu?n làm gì",
    explanation: "? ?? di?n t? mong mu?n c?a ngu?i nói. Ch? dùng cho ngôi th? nh?t (tôi). V?i ngôi th? ba dùng ? ????.",
    formation: "V + ? ??",
    examples: [
      { korean: "??? ?? ???.", vietnamese: "Tôi mu?n di Hàn Qu?c." },
      { korean: "? ?? ????", vietnamese: "B?n mu?n an gì?" },
      { korean: "?? ???.", vietnamese: "Tôi mu?n ngh? ngoi." },
    ],
    exercises: [
      { question: "?? ???? ?? ___ ???.", options: ["?", "?", "?", "?"], answer: 0, explanation: "? ?? là c?u trúc c? d?nh, luôn dùng ?" },
      { question: "?? ??? ? ___ ????.", options: ["?", "?", "?", "?"], answer: 0, explanation: "Ngôi th? ba dùng ? ????" },
    ],
    commonMistakes: ["Dùng ? ?? cho ngôi th? ba (ph?i dùng ? ????)", "Nh?m v?i ? ?? ?? (không mu?n)"],
    tags: ["Nguy?n v?ng", "Ð?ng t?", "A2"],
  },
  {
    id: "a2-2",
    level: "A2",
    levelColor: "#84cc16",
    pattern: "V-?/??",
    meaning: "Vì... nên... / Và r?i...",
    explanation: "?/?? có 2 nghia: (1) Nguyên nhân - k?t qu? (vì... nên...), (2) Trình t? hành d?ng (và r?i...). Không dùng du?c v?i -?/? ? v? tru?c.",
    formation: "V(?/?) + ?? / V(khác) + ??",
    examples: [
      { korean: "?? ??? ?? ????.", vietnamese: "Vì dói b?ng nên tôi dã an com." },
      { korean: "???? ?? ?????.", vietnamese: "Tôi d?n thu vi?n r?i h?c bài." },
      { korean: "???? ?? ???.", vietnamese: "Vì m?t nên tôi ng? s?m." },
    ],
    exercises: [
      { question: "?? ?? ___ ?? ????.", options: ["??", "??", "??", "?"], answer: 0, explanation: "??? ? ??? (? b? lu?c b?, thêm ??)" },
      { question: "??? ? ___ ??? ????.", options: ["??", "??", "??", "?"], answer: 0, explanation: "?? ? ?? (nguyên âm ?, thêm ?? ? ??)" },
    ],
    commonMistakes: ["Dùng ?/??? (sai)", "Nh?m v?i ? ??? (trang tr?ng hon)"],
    tags: ["Nguyên nhân", "Trình t?", "Liên k?t câu"],
  },
  {
    id: "b1-1",
    level: "B1",
    levelColor: "#f59e0b",
    pattern: "V-?/? ?? ??/??",
    meaning: "Ðã t?ng / Chua t?ng",
    explanation: "Di?n t? kinh nghi?m dã có ho?c chua có trong quá kh?. Tuong duong v?i 'have/haven't done' trong ti?ng Anh.",
    formation: "V(nguyên âm/?) + ? ?? ?? / V(ph? âm) + ? ?? ??",
    examples: [
      { korean: "??? ? ? ?? ???.", vietnamese: "Tôi dã t?ng d?n Hàn Qu?c." },
      { korean: "??? ?? ?? ???.", vietnamese: "Tôi chua t?ng an kimchi." },
      { korean: "??? ? ?? ????", vietnamese: "B?n dã t?ng tru?t tuy?t chua?" },
    ],
    exercises: [
      { question: "?? ??? ? ___ ?? ???.", options: ["?", "?", "?", "?"], answer: 0, explanation: "?? k?t thúc b?ng ph? âm ?, nên dùng ?" },
      { question: "??? ? ___ ?? ???.", options: ["?", "?", "?", "?"], answer: 1, explanation: "?? k?t thúc b?ng nguyên âm, nên dùng ? ? ? ??" },
    ],
    commonMistakes: ["Nh?m v?i ?/??? (quá kh? don)", "Quên ? trong ? ? ??"],
    tags: ["Kinh nghi?m", "Quá kh?", "B1"],
  },
  {
    id: "b1-2",
    level: "B1",
    levelColor: "#f59e0b",
    pattern: "V-? ? ??",
    meaning: "Có v? nhu, Du?ng nhu",
    explanation: "Di?n t? suy doán, ph?ng doán d?a trên quan sát. Thì hi?n t?i dùng -? ? ??, quá kh? dùng -?/? ? ??, tuong lai dùng -?/? ? ??.",
    formation: "V + ? ? ?? (hi?n t?i) / V + ?/? ? ?? (quá kh?) / V + ?/? ? ?? (tuong lai)",
    examples: [
      { korean: "?? ?? ? ???.", vietnamese: "Có v? nhu tr?i dang mua." },
      { korean: "? ??? ?? ? ? ???.", vietnamese: "Có v? nhu ngu?i dó dang t?c gi?n." },
      { korean: "?? ?? ? ? ???.", vietnamese: "Có v? nhu ngày mai s? có tuy?t." },
    ],
    exercises: [
      { question: "? ??? ??? ___ ? ???.", options: ["?", "?", "?", "?"], answer: 0, explanation: "Tr?ng thái hi?n t?i dùng -? ? ??" },
      { question: "?? ?? ?? ? ___ ? ???.", options: ["?", "?", "?", "?"], answer: 1, explanation: "Quá kh? dùng -?/? ? ??" },
    ],
    commonMistakes: ["Nh?m thì c?a ? ??", "Dùng ? ?? khi ch?c ch?n (nên dùng ??)"],
    tags: ["Suy doán", "Ph?ng doán", "B1"],
  },
  {
    id: "b2-1",
    level: "B2",
    levelColor: "#f97316",
    pattern: "V-?/???",
    meaning: "Càng... càng...",
    explanation: "Di?n t? m?i quan h? t? l? thu?n: khi A tang thì B cung tang. Thu?ng di kèm v?i ? (hon) ho?c ?? (càng hon).",
    formation: "V/A + ?/??? + (?) V/A",
    examples: [
      { korean: "????? ? ?????.", vietnamese: "Càng h?c càng th?y thú v?." },
      { korean: "?? ??? ????.", vietnamese: "Càng bi?t càng th?y khó." },
      { korean: "??? ???? ?????.", vietnamese: "Th?i gian càng trôi qua càng nh?." },
    ],
    exercises: [
      { question: "??? ___ ??? ???.", options: ["???", "???", "?", "??"], answer: 0, explanation: "???? k?t thúc b?ng nguyên âm, dùng ???" },
      { question: "? ___ ? ?? ???.", options: ["???", "???", "?", "??"], answer: 1, explanation: "?? k?t thúc b?ng ph? âm ?, dùng ???" },
    ],
    commonMistakes: ["Nh?m v?i -? -??? (dùng c? hai)", "Quên ? ? v? sau"],
    tags: ["T? l? thu?n", "So sánh", "B2"],
  },
  {
    id: "c1-1",
    level: "C1",
    levelColor: "#ef4444",
    pattern: "V-? ?",
    meaning: "Ch?ng nào còn..., Mi?n là...",
    explanation: "Di?n t? di?u ki?n duy trì: ch?ng nào di?u ki?n A còn t?n t?i thì k?t qu? B v?n dúng. Mang tính trang tr?ng, thu?ng dùng trong van vi?t.",
    formation: "V + ? ? / A + ?/? ? / N? ?",
    examples: [
      { korean: "?? ???? ? ?? ???.", vietnamese: "Ch?ng nào tôi còn s?ng, tôi s? b?o v? em." },
      { korean: "???? ? ??? ??? ? ??.", vietnamese: "Ch?ng nào còn n? l?c, nh?t d?nh s? thành công." },
      { korean: "?? ??? ?? ? ???? ??? ? ??.", vietnamese: "Mi?n là không vi ph?m pháp lu?t, b?n có th? hành d?ng t? do." },
    ],
    exercises: [
      { question: "???? ? ___ ? ??? ???.", options: ["?", "?", "?", "?"], answer: 0, explanation: "???? ?? là d?ng t? ph? d?nh, dùng -? ?" },
      { question: "?? ___ ? ?? ?? ????.", options: ["?", "?", "?", "?"], answer: 0, explanation: "?? là danh t?, dùng ? ?" },
    ],
    commonMistakes: ["Nh?m v?i -? ?? (tuong t? nhung nh?n m?nh hon)", "Dùng sai thì c?a v? tru?c"],
    tags: ["Ði?u ki?n", "Trang tr?ng", "C1"],
  },
];

const LEVELS = ["T?t c?", "A1", "A2", "B1", "B2", "C1"];

export default function GrammarByLevelPage() {
  const [selectedLevel, setSelectedLevel] = useState("T?t c?");
  const [selectedPattern, setSelectedPattern] = useState<GrammarPattern | null>(null);
  const [activeTab, setActiveTab] = useState<"explain" | "examples" | "exercise">("explain");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = selectedLevel === "T?t c?" ? GRAMMAR_PATTERNS : GRAMMAR_PATTERNS.filter(p => p.level === selectedLevel);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.pattern.toLowerCase().includes(q) ||
        p.meaning.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedLevel, search]);

  const handleAnswer = (qIdx: number, optIdx: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => setShowResults(true);
  const handleReset = () => { setAnswers({}); setShowResults(false); };

  const correctCount = selectedPattern
    ? selectedPattern.exercises.filter((ex, i) => answers[i] === ex.answer).length
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bài t?p ng? pháp theo c?p d?</h1>
          <p className="text-gray-500 text-sm mt-1">Luy?n ng? pháp t? A1 d?n C1 v?i gi?i thích chi ti?t</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Pattern list */}
          <div className="lg:col-span-1">
            {/* Filters */}
            <div className="mb-3">
              <div className="relative mb-3">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Tìm c?u trúc..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {LEVELS.map(lv => (
                  <button
                    key={lv}
                    onClick={() => setSelectedLevel(lv)}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${selectedLevel === lv ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {lv}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern list */}
            <div className="space-y-2">
              {filtered.map(pattern => (
                <button
                  key={pattern.id}
                  onClick={() => { setSelectedPattern(pattern); setActiveTab("explain"); handleReset(); }}
                  className={`w-full text-left p-3 rounded-xl border cursor-pointer transition-all ${selectedPattern?.id === pattern.id ? "border-rose-300 bg-rose-50" : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: pattern.levelColor }}>
                      {pattern.level}
                    </span>
                    <span className="font-bold text-sm text-gray-900">{pattern.pattern}</span>
                  </div>
                  <p className="text-xs text-gray-500">{pattern.meaning}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {pattern.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded">{tag}</span>
                    ))}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">Không tìm th?y c?u trúc nào</div>
              )}
            </div>
          </div>

          {/* Right: Detail */}
          <div className="lg:col-span-2">
            {!selectedPattern ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <i className="ri-book-open-line text-5xl mb-3"></i>
                <p className="text-sm">Ch?n m?t c?u trúc ng? pháp d? xem chi ti?t</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Pattern header */}
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: selectedPattern.levelColor }}>
                      {selectedPattern.level}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900">{selectedPattern.pattern}</h2>
                  </div>
                  <p className="text-gray-600 font-medium">{selectedPattern.meaning}</p>
                  <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 font-semibold">C?u trúc: </span>
                    <span className="text-xs text-gray-700 font-mono">{selectedPattern.formation}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                  {([
                    { id: "explain", label: "Gi?i thích", icon: "ri-book-2-line" },
                    { id: "examples", label: "Ví d?", icon: "ri-chat-quote-line" },
                    { id: "exercise", label: "Bài t?p", icon: "ri-pencil-line" },
                  ] as const).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${activeTab === tab.id ? "text-rose-600 border-b-2 border-rose-500" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <i className={tab.icon}></i>{tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="p-6">
                  {activeTab === "explain" && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Gi?i thích</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{selectedPattern.explanation}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">L?i thu?ng g?p</h3>
                        <div className="space-y-2">
                          {selectedPattern.commonMistakes.map((m, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <i className="ri-error-warning-line text-amber-500 flex-shrink-0 mt-0.5"></i>
                              <span className="text-gray-600">{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPattern.tags.map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-rose-50 text-rose-600 text-xs rounded-full font-medium">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "examples" && (
                    <div className="space-y-4">
                      {selectedPattern.examples.map((ex, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-base font-bold text-gray-900 mb-1">{ex.korean}</p>
                          <p className="text-sm text-gray-500">{ex.vietnamese}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "exercise" && (
                    <div className="space-y-6">
                      {selectedPattern.exercises.map((ex, qIdx) => (
                        <div key={qIdx} className="space-y-3">
                          <p className="text-sm font-semibold text-gray-800">
                            {qIdx + 1}. {ex.question}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {ex.options.map((opt, optIdx) => {
                              const isSelected = answers[qIdx] === optIdx;
                              const isCorrect = ex.answer === optIdx;
                              let btnClass = "px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all border text-left whitespace-nowrap ";
                              if (!showResults) {
                                btnClass += isSelected
                                  ? "bg-rose-50 border-rose-300 text-rose-700"
                                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300";
                              } else {
                                if (isCorrect) btnClass += "bg-green-50 border-green-400 text-green-700";
                                else if (isSelected && !isCorrect) btnClass += "bg-red-50 border-red-400 text-red-700";
                                else btnClass += "bg-white border-gray-200 text-gray-400";
                              }
                              return (
                                <button key={optIdx} onClick={() => handleAnswer(qIdx, optIdx)} className={btnClass}>
                                  {showResults && isCorrect && <i className="ri-check-line mr-1 text-green-600"></i>}
                                  {showResults && isSelected && !isCorrect && <i className="ri-close-line mr-1 text-red-600"></i>}
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {showResults && (
                            <div className={`p-3 rounded-lg text-xs ${answers[qIdx] === ex.answer ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                              <i className={`${answers[qIdx] === ex.answer ? "ri-check-line" : "ri-close-line"} mr-1`}></i>
                              {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}

                      {!showResults ? (
                        <button
                          onClick={handleSubmit}
                          disabled={Object.keys(answers).length < selectedPattern.exercises.length}
                          className={`w-full py-3 rounded-xl font-semibold text-sm cursor-pointer transition-colors whitespace-nowrap ${Object.keys(answers).length < selectedPattern.exercises.length ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-rose-500 hover:bg-rose-600 text-white"}`}
                        >
                          Ki?m tra dáp án
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className={`p-4 rounded-xl text-center ${correctCount === selectedPattern.exercises.length ? "bg-green-50" : "bg-amber-50"}`}>
                            <p className="text-xl font-bold mb-1" style={{ color: correctCount === selectedPattern.exercises.length ? "#22c55e" : "#f59e0b" }}>
                              {correctCount}/{selectedPattern.exercises.length}
                            </p>
                            <p className="text-sm font-medium text-gray-600">
                              {correctCount === selectedPattern.exercises.length ? "Hoàn h?o! B?n dã n?m v?ng c?u trúc này." : "Hãy xem l?i ph?n gi?i thích và th? l?i!"}
                            </p>
                          </div>
                          <button onClick={handleReset} className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
                            <i className="ri-refresh-line mr-2"></i>Làm l?i
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

