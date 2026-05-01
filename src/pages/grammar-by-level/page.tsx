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
    pattern: "N은/는",
    meaning: "Trợ từ chủ đề",
    explanation: "은/는 là trợ từ chủ đề, dùng để đánh dấu chủ đề của câu. Dùng 은 sau phụ âm, 는 sau nguyên âm.",
    formation: "N(phụ âm) + 은 / N(nguyên âm) + 는",
    examples: [
      { korean: "저는 학생이에요.", vietnamese: "Tôi là học sinh." },
      { korean: "한국은 아름다워요.", vietnamese: "Hàn Quốc thật đẹp." },
      { korean: "오늘은 날씨가 좋아요.", vietnamese: "Hôm nay thời tiết đẹp." },
    ],
    exercises: [
      { question: "저 ___ 베트남 사람이에요.", options: ["은", "는", "이", "가"], answer: 1, explanation: "저 kết thúc bằng nguyên âm eo, nên dùng 는" },
      { question: "한국어 ___ 재미있어요.", options: ["은", "는", "이", "가"], answer: 0, explanation: "한국어 kết thúc bằng phụ âm eo, nên dùng 은" },
    ],
    commonMistakes: ["Nhầm lẫn 은/는 với 이/가", "Dùng 은/는 khi cần nhấn mạnh chủ ngữ"],
    tags: ["Trợ từ", "Cơ bản", "Chủ đề"],
  },
  {
    id: "a1-2",
    level: "A1",
    levelColor: "#22c55e",
    pattern: "N이/가",
    meaning: "Trợ từ chủ ngữ",
    explanation: "이/가 là trợ từ chủ ngữ, dùng để đánh dấu chủ ngữ thực sự của câu. Dùng 이 sau phụ âm, 가 sau nguyên âm.",
    formation: "N(phụ âm) + 이 / N(nguyên âm) + 가",
    examples: [
      { korean: "꽃이 예뻐요.", vietnamese: "Hoa đẹp." },
      { korean: "누가 왔어요?", vietnamese: "Ai đến vậy?" },
      { korean: "비가 와요.", vietnamese: "Trời mưa." },
    ],
    exercises: [
      { question: "꽃 ___ 예뻐요.", options: ["은", "는", "이", "가"], answer: 2, explanation: "꽃 kết thúc bằng phụ âm, nên dùng 이" },
      { question: "누구 ___ 왔어요?", options: ["은", "는", "이", "가"], answer: 3, explanation: "누구 kết thúc bằng nguyên âm, nên dùng 가" },
    ],
    commonMistakes: ["Nhầm 이/가 với 은/는", "이/가 dùng khi giới thiệu thông tin mới"],
    tags: ["Trợ từ", "Cơ bản", "Chủ ngữ"],
  },
  {
    id: "a2-1",
    level: "A2",
    levelColor: "#84cc16",
    pattern: "V-고 싶다",
    meaning: "Muốn làm gì",
    explanation: "고 싶다 diễn tả mong muốn của người nói. Chỉ dùng cho ngôi thứ nhất (tôi). Với ngôi thứ ba dùng 고 싶어하다.",
    formation: "V + 고 싶다",
    examples: [
      { korean: "한국에 가고 싶어요.", vietnamese: "Tôi muốn đi Hàn Quốc." },
      { korean: "뭘 먹고 싶어요?", vietnamese: "Bạn muốn ăn gì?" },
      { korean: "쉬고 싶어요.", vietnamese: "Tôi muốn nghỉ ngơi." },
    ],
    exercises: [
      { question: "저는 한국어를 배우 ___ 싶어요.", options: ["고", "아", "어", "서"], answer: 0, explanation: "고 싶다 là cấu trúc cố định, luôn dùng 고" },
      { question: "그는 의사가 되 ___ 싶어해요.", options: ["고", "아", "어", "서"], answer: 0, explanation: "Ngôi thứ ba dùng 고 싶어하다" },
    ],
    commonMistakes: ["Dùng 고 싶다 cho ngôi thứ ba (phải dùng 고 싶어하다)", "Nhầm với 고 싶지 않다 (không muốn)"],
    tags: ["Nguyện vọng", "Động từ", "A2"],
  },
  {
    id: "a2-2",
    level: "A2",
    levelColor: "#84cc16",
    pattern: "V-아/어서",
    meaning: "Vì... nên... / Và rồi...",
    explanation: "아/어서 có 2 nghĩa: (1) Nguyên nhân - kết quả (vì... nên...), (2) Trình tự hành động (và rồi...). Không dùng được với -았/었 ở vế trước.",
    formation: "V(ㅏ/ㅗ) + 아서 / V(khác) + 어서",
    examples: [
      { korean: "배가 고파서 밥을 먹었어요.", vietnamese: "Vì đói bụng nên tôi đã ăn cơm." },
      { korean: "도서관에 가서 공부했어요.", vietnamese: "Tôi đến thư viện rồi học bài." },
      { korean: "피곤해서 일찍 잤어요.", vietnamese: "Vì mệt nên tôi ngủ sớm." },
    ],
    exercises: [
      { question: "배가 고프 ___ 밥을 먹었어요.", options: ["아서", "어서", "고서", "서"], answer: 0, explanation: "고프다 → 고파서 (ㅡ bị lược bỏ, thêm 아서)" },
      { question: "학교에 가 ___ 친구를 만났어요.", options: ["아서", "어서", "고서", "서"], answer: 0, explanation: "가다 → 가서 (nguyên âm ㅏ, thêm 아서 → 가서)" },
    ],
    commonMistakes: ["Dùng 았/었어서 (sai)", "Nhầm với 기 때문에 (trang trọng hơn)"],
    tags: ["Nguyên nhân", "Trình tự", "Liên kết câu"],
  },
  {
    id: "b1-1",
    level: "B1",
    levelColor: "#f59e0b",
    pattern: "V-ㄴ/은 적이 있다/없다",
    meaning: "Đã từng / Chưa từng",
    explanation: "Diễn tả kinh nghiệm đã có hoặc chưa có trong quá khứ. Tương đương với 'have/haven't done' trong tiếng Anh.",
    formation: "V(nguyên âm/ㄹ) + ㄴ 적이 있다 / V(phụ âm) + 은 적이 있다",
    examples: [
      { korean: "한국에 가 본 적이 있어요.", vietnamese: "Tôi đã từng đến Hàn Quốc." },
      { korean: "김치를 먹은 적이 없어요.", vietnamese: "Tôi chưa từng ăn kimchi." },
      { korean: "스키를 탄 적이 있어요?", vietnamese: "Bạn đã từng trượt tuyết chưa?" },
    ],
    exercises: [
      { question: "한국 음식을 먹 ___ 적이 있어요.", options: ["은", "ㄴ", "는", "던"], answer: 0, explanation: "먹다 kết thúc bằng phụ âm ㄱ, nên dùng 은" },
      { question: "서울에 가 ___ 적이 없어요.", options: ["은", "ㄴ", "는", "던"], answer: 1, explanation: "가다 kết thúc bằng nguyên âm, nên dùng ㄴ → 간 적이" },
    ],
    commonMistakes: ["Nhầm với 았/었어요 (quá khứ đơn)", "Quên 본 trong 가 본 적이"],
    tags: ["Kinh nghiệm", "Quá khứ", "B1"],
  },
  {
    id: "b1-2",
    level: "B1",
    levelColor: "#f59e0b",
    pattern: "V-는 것 같다",
    meaning: "Có vẻ như, Dường như",
    explanation: "Diễn tả suy đoán, phỏng đoán dựa trên quan sát. Thì hiện tại dùng -는 것 같다, quá khứ dùng -ㄴ/은 것 같다, tương lai dùng -ㄹ/을 것 같다.",
    formation: "V + 는 것 같다 (hiện tại) / V + ㄴ/은 것 같다 (quá khứ) / V + ㄹ/을 것 같다 (tương lai)",
    examples: [
      { korean: "비가 오는 것 같아요.", vietnamese: "Có vẻ như trời đang mưa." },
      { korean: "그 사람이 화가 난 것 같아요.", vietnamese: "Có vẻ như người đó đang tức giận." },
      { korean: "내일 눈이 올 것 같아요.", vietnamese: "Có vẻ như ngày mai sẽ có tuyết." },
    ],
    exercises: [
      { question: "그 사람이 피곤하 ___ 것 같아요.", options: ["는", "ㄴ", "ㄹ", "던"], answer: 0, explanation: "Trạng thái hiện tại dùng -는 것 같다" },
      { question: "어제 비가 많이 왔 ___ 것 같아요.", options: ["는", "ㄴ", "ㄹ", "던"], answer: 1, explanation: "Quá khứ dùng -ㄴ/은 것 같다" },
    ],
    commonMistakes: ["Nhầm thì của 것 같다", "Dùng 것 같다 khi chắc chắn (nên dùng 겠다)"],
    tags: ["Suy đoán", "Phỏng đoán", "B1"],
  },
  {
    id: "b2-1",
    level: "B2",
    levelColor: "#f97316",
    pattern: "V-ㄹ/을수록",
    meaning: "Càng... càng...",
    explanation: "Diễn tả mối quan hệ tỷ lệ thuận: khi A tăng thì B cũng tăng. Thường đi kèm với 더 (hơn) hoặc 더욱 (càng hơn).",
    formation: "V/A + ㄹ/을수록 + (더) V/A",
    examples: [
      { korean: "공부할수록 더 재미있어요.", vietnamese: "Càng học càng thấy thú vị." },
      { korean: "알면 알수록 어려워요.", vietnamese: "Càng biết càng thấy khó." },
      { korean: "시간이 지날수록 그리워져요.", vietnamese: "Thời gian càng trôi qua càng nhớ." },
    ],
    exercises: [
      { question: "연습하 ___ 실력이 늘어요.", options: ["ㄹ수록", "을수록", "면", "아서"], answer: 0, explanation: "연습하다 kết thúc bằng nguyên âm, dùng ㄹ수록" },
      { question: "먹 ___ 더 먹고 싶어요.", options: ["ㄹ수록", "을수록", "면", "아서"], answer: 1, explanation: "먹다 kết thúc bằng phụ âm ㄱ, dùng 을수록" },
    ],
    commonMistakes: ["Nhầm với -면 -ㄹ수록 (dùng cả hai)", "Quên 더 ở vế sau"],
    tags: ["Tỷ lệ thuận", "So sánh", "B2"],
  },
  {
    id: "c1-1",
    level: "C1",
    levelColor: "#ef4444",
    pattern: "V-는 한",
    meaning: "Chừng nào còn..., Miễn là...",
    explanation: "Diễn tả điều kiện duy trì: chừng nào điều kiện A còn tồn tại thì kết quả B vẫn đúng. Mang tính trang trọng, thường dùng trong văn viết.",
    formation: "V + 는 한 / A + ㄴ/은 한 / N인 한",
    examples: [
      { korean: "내가 살아있는 한 너를 지킬게.", vietnamese: "Chừng nào tôi còn sống, tôi sẽ bảo vệ em." },
      { korean: "노력하는 한 반드시 성공할 수 있다.", vietnamese: "Chừng nào còn nỗ lực, nhất định sẽ thành công." },
      { korean: "법을 어기지 않는 한 자유롭게 행동할 수 있다.", vietnamese: "Miễn là không vi phạm pháp luật, bạn có thể hành động tự do." },
    ],
    exercises: [
      { question: "포기하지 않 ___ 한 희망이 있어요.", options: ["는", "은", "ㄴ", "던"], answer: 0, explanation: "포기하지 않다 là động từ phủ định, dùng -는 한" },
      { question: "건강 ___ 한 모든 것이 가능해요.", options: ["인", "는", "은", "이"], answer: 0, explanation: "건강 là danh từ, dùng 인 한" },
    ],
    commonMistakes: ["Nhầm với -는 이상 (tương tự nhưng nhấn mạnh hơn)", "Dùng sai thì của vế trước"],
    tags: ["Điều kiện", "Trang trọng", "C1"],
  },
];

const LEVELS = ["Tất cả", "A1", "A2", "B1", "B2", "C1"];

export default function GrammarByLevelPage() {
  const [selectedLevel, setSelectedLevel] = useState("Tất cả");
  const [selectedPattern, setSelectedPattern] = useState<GrammarPattern | null>(null);
  const [activeTab, setActiveTab] = useState<"explain" | "examples" | "exercise">("explain");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = selectedLevel === "Tất cả" ? GRAMMAR_PATTERNS : GRAMMAR_PATTERNS.filter(p => p.level === selectedLevel);
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
          <h1 className="text-2xl font-bold text-gray-900">Bài tập ngữ pháp theo cấp độ</h1>
          <p className="text-gray-500 text-sm mt-1">Luyện ngữ pháp từ A1 đến C1 với giải thích chi tiết</p>
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
                  placeholder="Tìm cấu trúc..."
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
                <div className="text-center py-8 text-gray-400 text-sm">Không tìm thấy cấu trúc nào</div>
              )}
            </div>
          </div>

          {/* Right: Detail */}
          <div className="lg:col-span-2">
            {!selectedPattern ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <i className="ri-book-open-line text-5xl mb-3"></i>
                <p className="text-sm">Chọn một cấu trúc ngữ pháp để xem chi tiết</p>
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
                    <span className="text-xs text-gray-500 font-semibold">Cấu trúc: </span>
                    <span className="text-xs text-gray-700 font-mono">{selectedPattern.formation}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                  {([
                    { id: "explain", label: "Giải thích", icon: "ri-book-2-line" },
                    { id: "examples", label: "Ví dụ", icon: "ri-chat-quote-line" },
                    { id: "exercise", label: "Bài tập", icon: "ri-pencil-line" },
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
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Giải thích</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{selectedPattern.explanation}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Lỗi thường gặp</h3>
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
                          Kiểm tra đáp án
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className={`p-4 rounded-xl text-center ${correctCount === selectedPattern.exercises.length ? "bg-green-50" : "bg-amber-50"}`}>
                            <p className="text-2xl font-black mb-1" style={{ color: correctCount === selectedPattern.exercises.length ? "#22c55e" : "#f59e0b" }}>
                              {correctCount}/{selectedPattern.exercises.length}
                            </p>
                            <p className="text-sm font-medium text-gray-600">
                              {correctCount === selectedPattern.exercises.length ? "Hoàn hảo! Bạn đã nắm vững cấu trúc này." : "Hãy xem lại phần giải thích và thử lại!"}
                            </p>
                          </div>
                          <button onClick={handleReset} className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
                            <i className="ri-refresh-line mr-2"></i>Làm lại
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
