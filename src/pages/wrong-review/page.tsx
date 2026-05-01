import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import { epsLessons } from "@/mocks/epsLessons";

interface WrongItem {
  id: string;
  lessonId: number;
  lessonTitle: string;
  question: string;
  questionVi: string;
  yourAnswer: string;
  correctAnswer: string;
  type: "multiple_choice" | "fill_blank" | "translate";
  addedAt: string;
  reviewCount: number;
  mastered: boolean;
}

function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

// Default empty - câu sai thật được các trang quiz push vào localStorage khi user trả lời sai
// (xem ep-lesson-quiz, eps-exam, topik-* pages)
const EMPTY_WRONG_ITEMS: WrongItem[] = [];

// ─── Review Card ──────────────────────────────────────────────────────────
function ReviewCard({
  item,
  onMastered,
  onRetry,
}: {
  item: WrongItem;
  onMastered: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleCheck = () => {
    const correct = userInput.trim().toLowerCase() === item.correctAnswer.toLowerCase();
    setIsCorrect(correct);
    setChecked(true);
    if (correct) {
      setTimeout(() => onMastered(item.id), 1000);
    }
  };

  const daysSince = Math.floor((Date.now() - new Date(item.addedAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${item.mastered ? "border-emerald-500/20 bg-emerald-500/3 opacity-60" : "border-white/8 bg-white/2"}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start gap-3 p-4 hover:bg-white/3 transition-colors cursor-pointer text-left"
      >
        <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${item.mastered ? "bg-emerald-500/15" : "bg-red-500/10"}`}>
          <i className={`text-sm ${item.mastered ? "ri-checkbox-circle-fill text-emerald-400" : "ri-close-circle-line text-red-400"}`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/40">
              Bài {item.lessonId}
            </span>
            <span className="text-[10px] text-white/30">{item.lessonTitle}</span>
            <span className="text-[10px] text-white/20">{daysSince === 0 ? "Hôm nay" : `${daysSince} ngày trước`}</span>
          </div>
          <p className="text-white/70 text-sm font-medium truncate">{item.question}</p>
          <p className="text-white/30 text-xs mt-0.5 truncate italic">{item.questionVi}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.reviewCount > 0 && (
            <span className="text-[10px] text-[#e8c84a]/60 font-bold">×{item.reviewCount}</span>
          )}
          <i className={`text-white/20 text-sm ${expanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && !item.mastered && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          {/* Wrong answer */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/15">
            <i className="ri-close-circle-line text-red-400 text-sm flex-shrink-0 mt-0.5"></i>
            <div>
              <p className="text-red-400/60 text-[10px] font-semibold mb-0.5">Câu trả lời sai của bạn</p>
              <p className="text-red-400 text-sm">{item.yourAnswer}</p>
            </div>
          </div>

          {/* Correct answer */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
            <i className="ri-checkbox-circle-line text-emerald-400 text-sm flex-shrink-0 mt-0.5"></i>
            <div className="flex-1">
              <p className="text-emerald-400/60 text-[10px] font-semibold mb-0.5">Đáp án đúng</p>
              <div className="flex items-center gap-2">
                <p className="text-emerald-400 text-sm font-bold">{item.correctAnswer}</p>
                {item.correctAnswer.match(/[\u3131-\uD79D]/) && (
                  <button
                    onClick={() => speakKorean(item.correctAnswer)}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  >
                    <i className="ri-volume-up-line text-emerald-400 text-xs"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Practice input */}
          {!checked && (
            <div className="space-y-2">
              <p className="text-white/40 text-xs font-medium">Thử lại — nhập đáp án đúng:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCheck()}
                  placeholder="Nhập đáp án..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/40"
                />
                <button
                  onClick={handleCheck}
                  disabled={!userInput.trim()}
                  className="px-4 py-2 rounded-lg bg-[#e8c84a]/15 hover:bg-[#e8c84a]/25 text-[#e8c84a] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40"
                >
                  Kiểm tra
                </button>
              </div>
            </div>
          )}

          {checked && (
            <div className={`p-3 rounded-lg border text-center ${isCorrect ? "border-emerald-500/30 bg-emerald-500/8" : "border-red-500/20 bg-red-500/5"}`}>
              <p className={`text-sm font-bold ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                {isCorrect ? "Chính xác! Đã đánh dấu thành thạo!" : "Chưa đúng. Hãy thử lại!"}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onMastered(item.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-checkbox-circle-line text-sm"></i>
              Đã thành thạo
            </button>
            <button
              onClick={() => onRetry(item.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/8 bg-white/2 hover:bg-white/5 text-white/40 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-refresh-line text-sm"></i>
              Ôn lại sau
            </button>
          </div>
        </div>
      )}

      {expanded && item.mastered && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <i className="ri-checkbox-circle-fill"></i>
            <span>Đã thành thạo — không cần ôn thêm</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function WrongReviewPage() {
  const navigate = useNavigate();
  const { addXP } = useXPSystem();
  const [wrongItems, setWrongItems] = useLocalStorage<WrongItem[]>(
    "kts_wrong_review_items",
    EMPTY_WRONG_ITEMS
  );
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "mastered">("pending");
  const [filterLesson, setFilterLesson] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "lesson" | "review">("date");

  const pendingCount = wrongItems.filter(i => !i.mastered).length;
  const masteredCount = wrongItems.filter(i => i.mastered).length;
  const totalReviews = wrongItems.reduce((s, i) => s + i.reviewCount, 0);

  const uniqueLessons = useMemo(() => {
    const ids = [...new Set(wrongItems.map(i => i.lessonId))];
    return ids.map(id => ({ id, title: wrongItems.find(i => i.lessonId === id)?.lessonTitle ?? "" }));
  }, [wrongItems]);

  const filtered = useMemo(() => {
    let items = [...wrongItems];
    if (filterStatus === "pending") items = items.filter(i => !i.mastered);
    if (filterStatus === "mastered") items = items.filter(i => i.mastered);
    if (filterLesson !== "all") items = items.filter(i => i.lessonId === Number(filterLesson));
    if (search) items = items.filter(i =>
      i.question.toLowerCase().includes(search.toLowerCase()) ||
      i.correctAnswer.toLowerCase().includes(search.toLowerCase()) ||
      i.lessonTitle.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === "date") items.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    if (sortBy === "lesson") items.sort((a, b) => a.lessonId - b.lessonId);
    if (sortBy === "review") items.sort((a, b) => b.reviewCount - a.reviewCount);
    return items;
  }, [wrongItems, filterStatus, filterLesson, search, sortBy]);

  const handleMastered = (id: string) => {
    setWrongItems(prev => prev.map(i => i.id === id ? { ...i, mastered: true } : i));
    addXP(5, "Thành thạo câu ôn tập sai");
  };

  const handleRetry = (id: string) => {
    setWrongItems(prev => prev.map(i => i.id === id ? { ...i, reviewCount: i.reviewCount + 1 } : i));
  };

  const handleClearMastered = () => {
    setWrongItems(prev => prev.filter(i => !i.mastered));
  };

  const handleMasterAll = () => {
    setWrongItems(prev => prev.map(i => ({ ...i, mastered: true })));
    addXP(pendingCount * 5, "Hoàn thành ôn tập sai");
  };

  return (
    <DashboardLayout
      title="Ôn tập sai"
      subtitle="Tổng hợp tất cả câu trả lời sai từ các lần thi thử — ôn lại để thành thạo"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Cần ôn tập", value: pendingCount, icon: "ri-error-warning-line", color: "#f87171" },
          { label: "Đã thành thạo", value: masteredCount, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Tổng câu sai", value: wrongItems.length, icon: "ri-file-list-3-line", color: "#e8c84a" },
          { label: "Lần ôn tập", value: totalReviews, icon: "ri-refresh-line", color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} className="bg-[#0f1117] border border-white/5 rounded-xl p-3 md:p-4 flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-base`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{s.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {wrongItems.length > 0 && (
        <div className="bg-[#0f1117] border border-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm font-medium">Tiến độ thành thạo</p>
            <p className="text-emerald-400 text-sm font-bold">{masteredCount}/{wrongItems.length}</p>
          </div>
          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-700"
              style={{ width: `${wrongItems.length > 0 ? (masteredCount / wrongItems.length) * 100 : 0}%` }}
            />
          </div>
          {masteredCount === wrongItems.length && wrongItems.length > 0 && (
            <p className="text-emerald-400 text-xs font-semibold mt-2 text-center">
              Xuất sắc! Bạn đã thành thạo tất cả câu ôn tập!
            </p>
          )}
        </div>
      )}

      {/* Filters & actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-0">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm"></i>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm câu hỏi..."
            className="w-full bg-white/5 border border-white/8 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterLesson}
            onChange={e => setFilterLesson(e.target.value)}
            className="flex-1 sm:flex-none bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả bài</option>
            {uniqueLessons.map(l => (
              <option key={l.id} value={l.id}>Bài {l.id}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as "date" | "lesson" | "review")}
            className="flex-1 sm:flex-none bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none cursor-pointer"
          >
            <option value="date">Mới nhất</option>
            <option value="lesson">Theo bài</option>
            <option value="review">Ôn nhiều nhất</option>
          </select>
        </div>
        <div className="flex rounded-lg border border-white/8 overflow-hidden">
          {(["all", "pending", "mastered"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-1 sm:flex-none px-3 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${filterStatus === s ? "bg-[#e8c84a]/15 text-[#e8c84a]" : "text-white/40 hover:text-white/60"}`}
            >
              {s === "all" ? "Tất cả" : s === "pending" ? `Cần ôn (${pendingCount})` : `Thành thạo (${masteredCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      {pendingCount > 0 && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleMasterAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-checkbox-circle-line"></i>
            Đánh dấu tất cả thành thạo
          </button>
          {masteredCount > 0 && (
            <button
              onClick={handleClearMastered}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/8 bg-white/2 hover:bg-white/5 text-white/40 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-delete-bin-line"></i>
              Xóa đã thành thạo
            </button>
          )}
        </div>
      )}

      <p className="text-white/30 text-xs mb-3">{filtered.length} câu</p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-emerald-500/10 mx-auto mb-4">
            <i className="ri-checkbox-circle-line text-emerald-400 text-2xl"></i>
          </div>
          <p className="text-white/60 font-semibold text-base mb-1">
            {filterStatus === "pending" ? "Không có câu nào cần ôn tập!" : "Không tìm thấy câu nào"}
          </p>
          <p className="text-white/30 text-sm mb-4">
            {filterStatus === "pending"
              ? "Bạn đã thành thạo tất cả rồi. Tiếp tục làm bài thi thử để thêm câu mới!"
              : "Thử thay đổi bộ lọc"}
          </p>
          {filterStatus === "pending" && (
            <button
              onClick={() => navigate("/eps-lesson-quiz")}
              className="px-5 py-2.5 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              Đi thi thử theo bài
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <ReviewCard
              key={item.id}
              item={item}
              onMastered={handleMastered}
              onRetry={handleRetry}
            />
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-4">
        <p className="text-[#e8c84a] text-xs font-semibold mb-2">Mẹo ôn tập hiệu quả</p>
        <ul className="space-y-1.5">
          {[
            "Ôn lại câu sai ngay trong ngày hôm đó",
            "Nhập lại đáp án đúng để ghi nhớ sâu hơn",
            "Nghe phát âm tiếng Hàn khi ôn từ vựng",
            "Câu sai nhiều lần = cần học lại từ đầu bài đó",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-white/40 text-xs">
              <i className="ri-check-line text-[#e8c84a] flex-shrink-0 mt-0.5"></i>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </DashboardLayout>
  );
}
