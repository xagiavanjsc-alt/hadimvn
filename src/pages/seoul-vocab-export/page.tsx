import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { seoulBooks } from "@/mocks/seoulTextbook";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useVipYearGuard, getExportBtnLabel, getExportBtnIcon } from "@/hooks/useVipYearGuard";

// ─── Topic keywords mapping ───────────────────────────────────────────────────
const TOPICS: { id: string; label: string; keywords: string[] }[] = [
  { id: "all", label: "Tất cả", keywords: [] },
  { id: "greeting", label: "Chào hỏi", keywords: ["안녕", "반갑", "처음", "인사", "만나"] },
  { id: "family", label: "Gia đình", keywords: ["가족", "어머니", "아버지", "형", "누나", "오빠", "언니", "동생", "할아버지", "할머니", "남편", "아내", "아들", "딸"] },
  { id: "food", label: "Ẩm thực", keywords: ["음식", "먹다", "마시다", "밥", "김치", "불고기", "비빔밥", "냉면", "라면", "맛", "요리", "식당", "메뉴"] },
  { id: "shopping", label: "Mua sắm", keywords: ["사다", "팔다", "가격", "얼마", "쇼핑", "백화점", "옷", "신발", "가방", "할인", "교환", "반품"] },
  { id: "transport", label: "Giao thông", keywords: ["지하철", "버스", "택시", "기차", "비행기", "자동차", "오토바이", "자전거", "교통", "타다", "내리다"] },
  { id: "health", label: "Sức khỏe", keywords: ["아프다", "병원", "의사", "약", "감기", "열", "기침", "머리", "배", "목", "건강", "운동"] },
  { id: "work", label: "Công việc", keywords: ["회사", "일하다", "직업", "월급", "취직", "면접", "업무", "동료", "상사", "부장", "과장"] },
  { id: "nature", label: "Thiên nhiên", keywords: ["날씨", "비", "눈", "바람", "봄", "여름", "가을", "겨울", "산", "강", "바다", "꽃", "나무"] },
  { id: "emotion", label: "Cảm xúc", keywords: ["기쁘다", "슬프다", "화", "걱정", "행복", "외롭다", "무섭다", "즐겁다", "속상", "기분"] },
  { id: "education", label: "Giáo dục", keywords: ["학교", "공부", "배우다", "선생님", "학생", "시험", "성적", "대학", "수업", "과목"] },
  { id: "housing", label: "Nhà ở", keywords: ["집", "방", "아파트", "월세", "보증금", "이사", "계약", "주거", "난방", "전기"] },
];

export default function SeoulVocabExportPage() {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const { isVipYear, isVip, isLoggedIn, checkAndRun } = useVipYearGuard();
  const canExport = isAdmin || isVipYear;
  const [selectedBook, setSelectedBook] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [format, setFormat] = useState<"csv" | "txt">("csv");
  const [exported, setExported] = useState(false);

  // ── All vocab from selected book ──────────────────────────────────────────
  const allVocab = useMemo(() => {
    const books = selectedBook === "all" ? seoulBooks : seoulBooks.filter(b => b.id === selectedBook);
    const result: Array<{
      book: string; bookId: string; lesson: string; korean: string;
      pronunciation: string; vietnamese: string; partOfSpeech: string;
      example: string; exampleVi: string;
    }> = [];
    books.forEach(book => {
      book.lessons
        .filter(l => !l.id.includes("-REMOVED") && !l.id.includes("-placeholder"))
        .sort((a, b) => a.lessonNumber - b.lessonNumber)
        .forEach(lesson => {
          lesson.vocabulary.forEach(v => {
            result.push({
              book: book.name, bookId: book.id,
              lesson: lesson.titleVi,
              korean: v.korean, pronunciation: v.pronunciation,
              vietnamese: v.vietnamese, partOfSpeech: v.partOfSpeech,
              example: v.example, exampleVi: v.exampleVi,
            });
          });
        });
    });
    return result;
  }, [selectedBook]);

  // ── Filtered vocab ────────────────────────────────────────────────────────
  const filteredVocab = useMemo(() => {
    let result = allVocab;

    // Filter by topic
    if (selectedTopic !== "all") {
      const topic = TOPICS.find(t => t.id === selectedTopic);
      if (topic && topic.keywords.length > 0) {
        result = result.filter(v =>
          topic.keywords.some(kw =>
            v.korean.includes(kw) || v.vietnamese.toLowerCase().includes(kw) ||
            v.example.includes(kw) || v.partOfSpeech.includes(kw)
          )
        );
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(v =>
        v.korean.includes(q) ||
        v.vietnamese.toLowerCase().includes(q) ||
        v.pronunciation.toLowerCase().includes(q) ||
        v.example.includes(q) ||
        v.partOfSpeech.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allVocab, selectedTopic, searchQuery]);

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (filteredVocab.length === 0) return;
    const bookLabel = selectedBook === "all" ? "all" : selectedBook;
    const topicLabel = selectedTopic === "all" ? "" : `-${selectedTopic}`;
    const filename = `seoul-vocab-${bookLabel}${topicLabel}-${new Date().toISOString().split("T")[0]}`;

    if (format === "csv") {
      const header = "Cuốn sách,Bài học,Tiếng Hàn,Phiên âm,Tiếng Việt,Từ loại,Ví dụ,Dịch ví dụ\n";
      const rows = filteredVocab.map(v =>
        [v.book, v.lesson, v.korean, v.pronunciation, v.vietnamese, v.partOfSpeech, v.example, v.exampleVi]
          .map(s => `"${s.replace(/"/g, '""')}"`)
          .join(",")
      ).join("\n");
      const content = "\uFEFF" + header + rows;
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename + ".csv"; a.click();
      URL.revokeObjectURL(url);
    } else {
      const content = filteredVocab.map(v =>
        `[${v.book}] ${v.lesson}\n${v.korean} [${v.pronunciation}] — ${v.vietnamese} (${v.partOfSpeech})\nVD: ${v.example}\n→ ${v.exampleVi}\n`
      ).join("\n");
      const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename + ".txt"; a.click();
      URL.revokeObjectURL(url);
    }
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
          <div className="text-center max-w-sm px-6">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: "rgba(248,113,113,0.12)" }}>
              <i className="ri-lock-line text-3xl" style={{ color: "#f87171" }}></i>
            </div>
            <h2 className="text-white font-bold text-lg mb-2">Chỉ dành cho Admin</h2>
            <p className="text-white/40 text-sm mb-6">Tính năng xuất từ vựng chỉ dành cho quản trị viên.</p>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl mx-auto cursor-pointer whitespace-nowrap" style={{ backgroundColor: "rgba(232,200,74,0.12)", color: "#e8c84a", border: "1px solid rgba(232,200,74,0.25)" }}>
              <i className="ri-arrow-left-line"></i>Quay lại
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer">
            <i className="ri-arrow-left-line"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Xuất từ vựng Seoul</h1>
            <p className="text-white/40 text-sm">Tải từ vựng ra file CSV hoặc TXT để học offline</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Book selector */}
          <div className="bg-[#1a1d27] border border-white/8 rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-3">
              <i className="ri-book-3-line mr-2 text-[#e8c84a]"></i>Chọn cuốn sách
            </p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedBook("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${selectedBook === "all" ? "bg-[#e8c84a] text-black" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                Tất cả
              </button>
              {seoulBooks.map(b => (
                <button key={b.id} onClick={() => setSelectedBook(b.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${selectedBook === b.id ? "text-black" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
                  style={selectedBook === b.id ? { backgroundColor: b.color } : {}}>
                  {b.level}
                </button>
              ))}
            </div>
          </div>

          {/* Topic filter */}
          <div className="bg-[#1a1d27] border border-white/8 rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-3">
              <i className="ri-apps-line mr-2 text-[#e8c84a]"></i>Lọc theo chủ đề
            </p>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map(t => (
                <button key={t.id} onClick={() => setSelectedTopic(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedTopic === t.id
                      ? "bg-[#e8c84a]/20 text-[#e8c84a] border border-[#e8c84a]/30"
                      : "bg-white/5 text-white/50 hover:bg-white/10 border border-transparent"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="bg-[#1a1d27] border border-white/8 rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-3">
              <i className="ri-search-line mr-2 text-[#e8c84a]"></i>Tìm kiếm từ khóa
            </p>
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Nhập tiếng Hàn, tiếng Việt hoặc phiên âm..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#e8c84a]/40 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer">
                  <i className="ri-close-line text-sm"></i>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-white/30 text-xs mt-2">
                Tìm thấy <span className="text-[#e8c84a] font-semibold">{filteredVocab.length}</span> từ khớp với "{searchQuery}"
              </p>
            )}
          </div>

          {/* Format selector */}
          <div className="bg-[#1a1d27] border border-white/8 rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-3">
              <i className="ri-file-line mr-2 text-[#e8c84a]"></i>Định dạng xuất
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(["csv", "txt"] as const).map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${format === f ? "border-[#e8c84a]/40 bg-[#e8c84a]/8" : "border-white/8 bg-white/2 hover:border-white/15"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <i className={`${f === "csv" ? "ri-table-line" : "ri-file-text-line"} text-lg ${format === f ? "text-[#e8c84a]" : "text-white/40"}`}></i>
                    <span className={`font-bold text-sm uppercase ${format === f ? "text-[#e8c84a]" : "text-white/60"}`}>{f}</span>
                  </div>
                  <p className="text-white/40 text-xs">{f === "csv" ? "Mở bằng Excel, Google Sheets" : "File văn bản thuần"}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-[#1a1d27] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-semibold text-sm">
                <i className="ri-eye-line mr-2 text-[#e8c84a]"></i>Xem trước
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[#e8c84a] text-sm font-bold">{filteredVocab.length.toLocaleString()} từ</span>
                {filteredVocab.length !== allVocab.length && (
                  <span className="text-white/30 text-xs">/ {allVocab.length.toLocaleString()} tổng</span>
                )}
              </div>
            </div>

            {filteredVocab.length === 0 ? (
              <div className="text-center py-8 text-white/30">
                <i className="ri-search-line text-3xl mb-2 block"></i>
                <p className="text-sm">Không tìm thấy từ nào</p>
                <p className="text-xs mt-1">Thử thay đổi bộ lọc hoặc từ khóa</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {filteredVocab.slice(0, 10).map((v, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-white/3 rounded-lg">
                    <span className="text-white font-semibold text-sm w-24 flex-shrink-0">{v.korean}</span>
                    <span className="text-white/35 text-xs w-20 flex-shrink-0 hidden sm:block">[{v.pronunciation}]</span>
                    <span className="text-[#e8c84a] text-xs flex-1 truncate">{v.vietnamese}</span>
                    <span className="text-white/20 text-[10px] flex-shrink-0 hidden sm:block">{v.bookId}</span>
                  </div>
                ))}
                {filteredVocab.length > 10 && (
                  <p className="text-white/25 text-xs text-center py-1">... và {filteredVocab.length - 10} từ nữa</p>
                )}
              </div>
            )}
          </div>

          {/* Export button */}
          <button onClick={handleExport} disabled={filteredVocab.length === 0}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all cursor-pointer flex items-center justify-center gap-2 ${
              exported ? "bg-emerald-500 text-white"
              : !canExport ? "bg-white/8 border border-white/10 text-white/40"
              : "bg-[#e8c84a] text-black hover:bg-[#e8c84a]/90"
            } disabled:opacity-40 disabled:cursor-not-allowed`}>
            <i className={exported ? "ri-checkbox-circle-line" : getExportBtnIcon(isLoggedIn, isVip, isVipYear)}></i>
            {exported
              ? "Đã xuất thành công!"
              : !canExport
              ? getExportBtnLabel(isLoggedIn, isVip, isVipYear, "")
              : `Xuất ${filteredVocab.length.toLocaleString()} từ (.${format.toUpperCase()})`}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
