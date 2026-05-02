import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";

interface HanjaWord {
  id: number;
  korean: string;
  pronunciation: string;
  vietnamese: string;
  hanja: string;
  hanja_meaning: string;
  part_of_speech: string;
  example: string;
  example_vi: string;
  lesson_id: string;
  book_id: string;
}

const HANJA_RADICALS = [
  { char: "學", meaning: "Học", examples: ["학생(學生)", "학교(學校)", "학습(學習)"] },
  { char: "人", meaning: "Người", examples: ["인간(人間)", "인기(人氣)", "외국인(外國人)"] },
  { char: "國", meaning: "Nước/Quốc gia", examples: ["한국(韓國)", "미국(美國)", "국어(國語)"] },
  { char: "語", meaning: "Ngôn ngữ", examples: ["한국어(韓國語)", "영어(英語)", "국어(國語)"] },
  { char: "家", meaning: "Nhà/Gia đình", examples: ["가족(家族)", "가정(家庭)", "국가(國家)"] },
  { char: "電", meaning: "Điện", examples: ["전화(電話)", "전기(電氣)", "전자(電子)"] },
  { char: "音", meaning: "Âm thanh", examples: ["음악(音樂)", "발음(發音)", "음식(飮食)"] },
  { char: "行", meaning: "Đi/Hành", examples: ["여행(旅行)", "은행(銀行)", "행복(幸福)"] },
];

export default function SeoulHanjaPage() {
  const navigate = useNavigate();
  const [words, setWords] = useState<HanjaWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"words" | "radicals" | "quiz">("words");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState("all");
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizResult, setQuizResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchHanjaWords();
  }, []);

  const fetchHanjaWords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("seoul_vocabulary")
      .select("*")
      .not("hanja", "is", null)
      .neq("hanja", "")
      .order("book_id", { ascending: true });
    if (!error && data) setWords(data as HanjaWord[]);
    setLoading(false);
  };

  const filtered = words.filter(w => {
    const matchBook = selectedBook === "all" || w.book_id === selectedBook;
    const matchSearch = !searchTerm ||
      w.korean.includes(searchTerm) ||
      w.hanja?.includes(searchTerm) ||
      w.vietnamese.toLowerCase().includes(searchTerm.toLowerCase());
    return matchBook && matchSearch;
  });

  const quizWords = words.filter(w => w.hanja);
  const currentQuiz = quizWords[quizIndex % quizWords.length];

  const handleQuizSubmit = () => {
    if (!currentQuiz) return;
    const correct = quizAnswer.trim() === currentQuiz.hanja;
    setQuizResult(correct ? "correct" : "wrong");
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      setQuizResult(null);
      setQuizAnswer("");
      setQuizIndex(i => i + 1);
    }, 1500);
  };

  const toggleCard = (id: number) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const books = ["all", "1A", "1B", "2A", "2B", "3A", "3B"];

  return (
    <DashboardLayout
      title="Từ vựng Hán-Hàn"
      subtitle={`Học chữ Hán qua tiếng Hàn — ${words.length} từ có Hanja`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-1 bg-app-card/50 rounded-xl p-1 mb-6 w-fit">
          {[
            { key: "words", label: "Từ vựng", icon: "ri-book-2-line" },
            { key: "radicals", label: "Bộ thủ", icon: "ri-font-size" },
            { key: "quiz", label: "Luyện tập", icon: "ri-question-line" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-app-accent-primary text-app-bg font-semibold"
                  : "text-app-text-secondary hover:text-white/60"
              }`}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Words Tab */}
        {activeTab === "words" && (
          <div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
                <input
                  type="text"
                  placeholder="Tìm từ Hàn, Hán tự, nghĩa..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-app-card/50 border border-app-border rounded-xl text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {books.map(b => (
                  <button
                    key={b}
                    onClick={() => setSelectedBook(b)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${
                      selectedBook === b
                        ? "bg-app-accent-primary text-app-bg font-semibold"
                        : "bg-app-card/50 text-app-text-secondary hover:text-white/60 border border-app-border"
                    }`}
                  >
                    {b === "all" ? "Tất cả" : b}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <i className="ri-loader-4-line text-3xl text-app-text-muted animate-spin block mb-3"></i>
                <p className="text-app-text-muted text-sm">Đang tải dữ liệu...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white/2 border border-app-border rounded-2xl">
                <i className="ri-search-line text-3xl text-white/15 block mb-3"></i>
                <p className="text-app-text-muted text-sm">Không tìm thấy từ nào</p>
              </div>
            ) : (
              <>
                <p className="text-app-text-muted text-xs mb-4">{filtered.length} từ có Hán tự</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered.map(word => (
                    <div
                      key={word.id}
                      onClick={() => toggleCard(word.id)}
                      className={`bg-app-bg border rounded-xl p-4 cursor-pointer transition-all hover:border-app-accent-primary/25 ${
                        flippedCards.has(word.id) ? "border-app-accent-primary/20" : "border-white/6"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-xl font-bold text-white">{word.korean}</span>
                          <span className="text-xs text-app-text-muted ml-2">{word.pronunciation}</span>
                        </div>
                        <span className="text-2xl font-bold text-app-accent-primary">{word.hanja}</span>
                      </div>
                      <p className="text-sm text-white/55 mb-2">{word.vietnamese}</p>
                      {flippedCards.has(word.id) && (
                        <div className="mt-3 pt-3 border-t border-white/6">
                          <p className="text-xs text-app-accent-primary/70 font-medium mb-1.5 flex items-center gap-1">
                            <i className="ri-information-line"></i>
                            {word.hanja_meaning}
                          </p>
                          <p className="text-xs text-app-text-secondary italic leading-relaxed">{word.example}</p>
                          <p className="text-xs text-app-text-muted mt-0.5">{word.example_vi}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] bg-app-accent-primary/10 text-app-accent-primary/70 px-2 py-0.5 rounded-full font-medium">{word.book_id}</span>
                        <span className="text-[10px] text-app-text-muted">{flippedCards.has(word.id) ? "Thu gọn ▲" : "Chi tiết ▼"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Radicals Tab */}
        {activeTab === "radicals" && (
          <div>
            <p className="text-sm text-app-text-secondary mb-5">Học các bộ thủ Hán tự phổ biến trong tiếng Hàn. Hiểu bộ thủ giúp đoán nghĩa từ mới dễ dàng hơn.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {HANJA_RADICALS.map((r, i) => (
                <div key={i} className="bg-app-bg border border-white/6 rounded-xl p-5 hover:border-app-accent-primary/20 transition-all">
                  <div className="text-5xl font-bold text-app-accent-primary mb-2 text-center">{r.char}</div>
                  <p className="text-center text-sm font-semibold text-white/70 mb-3">{r.meaning}</p>
                  <div className="space-y-1.5">
                    {r.examples.map((ex, j) => (
                      <p key={j} className="text-xs text-app-text-secondary bg-app-surface/50 rounded-lg px-2.5 py-1.5">{ex}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-2xl p-5">
              <h3 className="font-semibold text-white/80 mb-4 flex items-center gap-2">
                <i className="ri-lightbulb-line text-app-accent-primary"></i>
                Tại sao nên học Hán-Hàn?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: "ri-percent-line", title: "60-70% từ vựng", desc: "Tiếng Hàn có gốc Hán (한자어)" },
                  { icon: "ri-brain-line", title: "Học nhanh hơn", desc: "Người biết Hán tự học từ mới dễ hơn 3x" },
                  { icon: "ri-link-m", title: "Liên kết từ đồng gốc", desc: "학교, 학생, 학습 cùng gốc 學" },
                ].map((item, i) => (
                  <div key={i} className="bg-app-surface/50 border border-app-border rounded-xl p-4">
                    <div className="w-8 h-8 flex items-center justify-center bg-app-accent-primary/10 rounded-lg mb-2">
                      <i className={`${item.icon} text-app-accent-primary`}></i>
                    </div>
                    <p className="text-sm font-semibold text-white/70">{item.title}</p>
                    <p className="text-xs text-white/35 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === "quiz" && (
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-app-text-secondary">Nhìn từ Hàn, nhập Hán tự tương ứng</p>
              <div className="flex items-center gap-2 bg-app-accent-primary/10 border border-app-accent-primary/20 px-3 py-1.5 rounded-xl">
                <i className="ri-trophy-line text-app-accent-primary text-sm"></i>
                <span className="text-sm font-semibold text-app-accent-primary">{score} điểm</span>
              </div>
            </div>

            {quizWords.length === 0 ? (
              <div className="text-center py-16 bg-white/2 border border-app-border rounded-2xl">
                <i className="ri-question-line text-4xl text-white/15 block mb-3"></i>
                <p className="text-app-text-muted text-sm">Chưa có từ Hanja để luyện tập</p>
              </div>
            ) : currentQuiz ? (
              <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">{currentQuiz.korean}</div>
                <p className="text-app-text-muted text-sm mb-1">{currentQuiz.pronunciation}</p>
                <p className="text-white/55 mb-6">{currentQuiz.vietnamese}</p>

                <div className="mb-4">
                  <label className="text-sm text-white/35 mb-2 block">Nhập Hán tự:</label>
                  <input
                    type="text"
                    value={quizAnswer}
                    onChange={e => setQuizAnswer(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleQuizSubmit()}
                    placeholder="Ví dụ: 學生"
                    className={`w-full text-center text-2xl py-3 bg-app-card/50 border-2 rounded-xl focus:outline-none transition-all text-white ${
                      quizResult === "correct" ? "border-emerald-500/50 bg-emerald-500/8" :
                      quizResult === "wrong" ? "border-red-500/50 bg-red-500/8" :
                      "border-app-border focus:border-app-accent-primary/40"
                    }`}
                  />
                </div>

                {quizResult && (
                  <div className={`text-sm font-medium mb-4 ${quizResult === "correct" ? "text-app-accent-success" : "text-red-400"}`}>
                    {quizResult === "correct" ? "✓ Chính xác!" : `✗ Đáp án đúng: ${currentQuiz.hanja} (${currentQuiz.hanja_meaning})`}
                  </div>
                )}

                <button
                  onClick={handleQuizSubmit}
                  disabled={!quizAnswer.trim() || !!quizResult}
                  className="w-full py-3 bg-app-accent-primary text-app-bg rounded-xl font-semibold hover:bg-app-accent-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap"
                >
                  Kiểm tra
                </button>

                <button
                  onClick={() => { setQuizIndex(i => i + 1); setQuizAnswer(""); setQuizResult(null); }}
                  className="w-full mt-2 py-2 text-app-text-muted text-sm hover:text-white/50 cursor-pointer"
                >
                  Bỏ qua →
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
