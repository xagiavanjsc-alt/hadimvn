import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { seoulBooks, type SeoulVocabItem } from "@/mocks/seoulTextbook";

// ─── Topic definitions ─────────────────────────────────────────────────────
interface TopicDef {
  id: string;
  label: string;
  icon: string;
  color: string;
  keywords: string[];
}

const TOPICS: TopicDef[] = [
  {
    id: "family",
    label: "Gia đình",
    icon: "ri-home-heart-line",
    color: "#fb923c",
    keywords: ["gia đình", "bố", "mẹ", "anh", "chị", "em", "ông", "bà", "con", "chồng", "vợ", "anh trai", "chị gái", "em gái", "em trai", "cha", "mẹ", "vị", "ngài", "quý danh", "tuổi", "nhà"],
  },
  {
    id: "food",
    label: "Ẩm thực",
    icon: "ri-restaurant-line",
    color: "#e8c84a",
    keywords: ["ăn", "uống", "canh", "cơm", "mỳ", "thịt", "cá", "rau", "ngọt", "mặn", "cay", "chua", "đắng", "nhạt", "món", "bữa", "nhà hàng", "gọi", "đặt", "vị", "hương vị", "nấu", "nướng", "hầm", "kho", "trộn", "miến", "bánh", "sườn", "gà", "bò", "lợn", "đậu", "kim chi"],
  },
  {
    id: "transport",
    label: "Giao thông",
    icon: "ri-bus-line",
    color: "#34d399",
    keywords: ["xe", "tàu", "bus", "taxi", "máy bay", "đi", "lái", "đổi", "xuống", "lên", "bến", "ga", "trạm", "đường", "tắc", "giao thông", "phương tiện", "đạp", "ngầm", "điện ngầm", "xe đạp", "xe máy", "ô tô", "tàu hỏa", "thuyền"],
  },
  {
    id: "health",
    label: "Sức khỏe",
    icon: "ri-heart-pulse-line",
    color: "#f87171",
    keywords: ["đau", "bệnh", "thuốc", "bệnh viện", "khoa", "triệu chứng", "sốt", "ho", "mũi", "cảm", "gãy", "thương", "chóng mặt", "nôn", "ói", "sưng", "khỏi", "tiêu hóa", "hạ sốt", "giảm đau", "say xe", "bôi", "dán", "nhỏ mắt", "khuấy", "bốc thuốc"],
  },
  {
    id: "body",
    label: "Cơ thể",
    icon: "ri-body-scan-line",
    color: "#a78bfa",
    keywords: ["đầu", "mặt", "mắt", "mũi", "miệng", "tai", "cổ", "vai", "tay", "ngực", "bụng", "lưng", "eo", "chân", "gối", "bàn tay", "bàn chân", "cơ thể", "thân thể", "khuôn mặt", "lông mày", "môi", "trán", "mắt 2 mí"],
  },
  {
    id: "clothing",
    label: "Trang phục",
    icon: "ri-t-shirt-line",
    color: "#06b6d4",
    keywords: ["mặc", "cởi", "đội", "đi giày", "đeo", "váy", "quần", "áo", "tất", "giày", "dép", "mũ", "kính", "khăn", "găng tay", "cà vạt", "vest", "com-lê", "jeans", "phông", "sơ mi", "khoác", "len", "dài", "ngắn", "rộng", "chật", "dày", "mỏng"],
  },
  {
    id: "emotion",
    label: "Cảm xúc",
    icon: "ri-emotion-line",
    color: "#fb923c",
    keywords: ["vui", "buồn", "tức", "sợ", "lo", "hạnh phúc", "cô đơn", "xấu hổ", "căng thẳng", "bực", "mệt", "đau lòng", "tự hào", "nhớ", "bối rối", "tiếc", "hài lòng", "stress", "áp lực", "tâm trạng", "cảm xúc", "phân vân", "may mắn"],
  },
  {
    id: "travel",
    label: "Du lịch",
    icon: "ri-plane-line",
    color: "#34d399",
    keywords: ["du lịch", "vé", "máy bay", "khách sạn", "đặt phòng", "hộ chiếu", "xuất phát", "đến nơi", "trở về", "phong cảnh", "bình minh", "hoàng hôn", "cảnh đêm", "hải sản", "quê", "lịch trình", "bảo hiểm", "hạng", "ghế", "khứ hồi", "một chiều"],
  },
  {
    id: "phone",
    label: "Điện thoại",
    icon: "ri-phone-line",
    color: "#e8c84a",
    keywords: ["điện thoại", "gọi", "nhận", "ngắt", "chuyển", "tin nhắn", "gửi", "nhắn", "số điện thoại", "máy bận", "quốc tế", "trong nước", "phí", "a lô", "xóa", "trả lời", "thông tin", "tư vấn", "hỏi"],
  },
  {
    id: "housing",
    label: "Nhà ở",
    icon: "ri-building-line",
    color: "#a78bfa",
    keywords: ["nhà", "phòng", "thuê", "đặt cọc", "chung cư", "ký túc xá", "nhà trọ", "ban công", "lối vào", "tiền điện", "tiền nước", "tiền ga", "phí quản lý", "hợp đồng", "bất động sản", "tìm phòng", "yên tĩnh", "ồn ào", "thoáng khí", "view"],
  },
  {
    id: "hobby",
    label: "Sở thích",
    icon: "ri-gamepad-line",
    color: "#06b6d4",
    keywords: ["sở thích", "chụp ảnh", "nghe nhạc", "nhảy", "vẽ", "sưu tập", "leo núi", "đọc sách", "bơi", "bóng đá", "bóng rổ", "tennis", "golf", "câu lạc bộ", "hội phí", "luyện tập", "blog", "internet", "game"],
  },
  {
    id: "appearance",
    label: "Ngoại hình",
    icon: "ri-user-smile-line",
    color: "#fb923c",
    keywords: ["ngoại hình", "cao", "thấp", "gầy", "béo", "thon thả", "mắt to", "mắt nhỏ", "mũi cao", "mũi thấp", "miệng to", "trán rộng", "vai rộng", "tóc", "cắt tóc", "nhuộm", "uốn", "kiểu tóc", "giống nhau", "trông", "nam tính", "nữ tính"],
  },
  {
    id: "time",
    label: "Thời gian",
    icon: "ri-time-line",
    color: "#34d399",
    keywords: ["sáng", "trưa", "chiều", "tối", "đêm", "sáng sớm", "buổi", "thức dậy", "ngủ", "giờ", "phút", "hàng ngày", "mỗi tuần", "mỗi tháng", "hàng năm", "thường xuyên", "thỉnh thoảng", "luôn luôn", "đột nhiên", "lúc nãy", "lát nữa"],
  },
  {
    id: "finance",
    label: "Tài chính",
    icon: "ri-money-dollar-circle-line",
    color: "#e8c84a",
    keywords: ["tiền", "đổi tiền", "rút tiền", "nộp tiền", "chuyển tiền", "gửi tiền", "tài khoản", "ngân hàng", "thẻ", "tín dụng", "đặt cọc", "phí", "giá", "đắt", "rẻ", "tiết kiệm", "tỉ giá", "ATM", "chuyển khoản", "số tài khoản"],
  },
  {
    id: "direction",
    label: "Chỉ đường",
    icon: "ri-map-pin-line",
    color: "#f87171",
    keywords: ["ngã tư", "ngã ba", "đèn giao thông", "rẽ trái", "rẽ phải", "đi thẳng", "qua đường", "vạch sang đường", "cầu vượt", "đường hầm", "trạm", "ga", "bến", "đổi chuyến", "tiện lợi", "bắt taxi", "lỡ xe", "đông nghịt"],
  },
];

interface VocabWithMeta extends SeoulVocabItem {
  bookId: string;
  bookLevel: string;
  bookColor: string;
  lessonId: string;
  lessonTitle: string;
}

function matchesTopic(word: VocabWithMeta, topic: TopicDef): boolean {
  const vi = word.vietnamese.toLowerCase();
  const ex = word.exampleVi.toLowerCase();
  return topic.keywords.some(kw => vi.includes(kw) || ex.includes(kw));
}

function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

export default function SeoulTopicStudyPage() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<TopicDef | null>(null);
  const [selectedBook, setSelectedBook] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  // Collect all vocab with metadata
  const allVocab = useMemo<VocabWithMeta[]>(() => {
    const result: VocabWithMeta[] = [];
    seoulBooks.forEach(book => {
      book.lessons.forEach(lesson => {
        lesson.vocabulary.forEach(v => {
          result.push({
            ...v,
            bookId: book.id,
            bookLevel: book.level,
            bookColor: book.color,
            lessonId: lesson.id,
            lessonTitle: `${book.level} - Bài ${lesson.lessonNumber}`,
          });
        });
      });
    });
    return result;
  }, []);

  // Filter by topic + book + search
  const filteredVocab = useMemo(() => {
    let list = allVocab;
    if (selectedTopic) list = list.filter(w => matchesTopic(w, selectedTopic));
    if (selectedBook !== "all") list = list.filter(w => w.bookId === selectedBook);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(w => w.korean.includes(q) || w.vietnamese.toLowerCase().includes(q) || w.pronunciation.toLowerCase().includes(q));
    }
    return list;
  }, [allVocab, selectedTopic, selectedBook, search]);

  // Topic word counts
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TOPICS.forEach(t => {
      counts[t.id] = allVocab.filter(w => matchesTopic(w, t)).length;
    });
    return counts;
  }, [allVocab]);

  const toggleFlip = (key: string) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const availableBooks = useMemo(() => seoulBooks.filter(b => b.lessons.length > 0), []);

  return (
    <DashboardLayout
      title="Học theo chủ đề"
      subtitle="Gom từ vựng xuyên suốt các bài học theo chủ đề: gia đình, ẩm thực, giao thông..."
      actions={
        <button onClick={() => navigate("/seoul-practice")} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-gamepad-line"></i>Luyện tập
        </button>
      }
    >
      <div className="space-y-6">
        {/* Topic grid */}
        <div>
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Chọn chủ đề</p>
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
            {/* All topics */}
            <button
              onClick={() => setSelectedTopic(null)}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${!selectedTopic ? "border-white/25 bg-white/5" : "border-white/8 bg-white/2 hover:border-white/15"}`}
            >
              <div className="w-9 h-9 flex items-center justify-center rounded-xl mx-auto mb-2" style={{ backgroundColor: !selectedTopic ? "#e8c84a20" : "rgba(255,255,255,0.05)" }}>
                <i className="ri-apps-line text-lg" style={{ color: !selectedTopic ? "#e8c84a" : "rgba(255,255,255,0.3)" }}></i>
              </div>
              <p className={`text-xs font-semibold ${!selectedTopic ? "text-white" : "text-white/40"}`}>Tất cả</p>
              <p className="text-white/25 text-[10px] mt-0.5">{allVocab.length} từ</p>
            </button>

            {TOPICS.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${selectedTopic?.id === topic.id ? "border-white/25 bg-white/5" : "border-white/8 bg-white/2 hover:border-white/15"}`}
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-xl mx-auto mb-2" style={{ backgroundColor: selectedTopic?.id === topic.id ? `${topic.color}20` : "rgba(255,255,255,0.05)" }}>
                  <i className={`${topic.icon} text-lg`} style={{ color: selectedTopic?.id === topic.id ? topic.color : "rgba(255,255,255,0.3)" }}></i>
                </div>
                <p className={`text-xs font-semibold ${selectedTopic?.id === topic.id ? "text-white" : "text-white/40"}`}>{topic.label}</p>
                <p className="text-white/25 text-[10px] mt-0.5">{topicCounts[topic.id]} từ</p>
              </button>
            ))}
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm"></i>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm từ vựng..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/3 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:border-white/25 transition-colors"
            />
          </div>

          {/* Book filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedBook("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${selectedBook === "all" ? "bg-[#e8c84a]/15 text-[#e8c84a]" : "bg-white/5 text-white/40 hover:bg-white/8"}`}
            >
              Tất cả sách
            </button>
            {availableBooks.map(book => (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${selectedBook === book.id ? "text-[#0f1117]" : "bg-white/5 text-white/40 hover:bg-white/8"}`}
                style={selectedBook === book.id ? { backgroundColor: book.color } : {}}
              >
                {book.level}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 ml-auto">
            <button onClick={() => setViewMode("grid")} className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}>
              <i className="ri-grid-line text-sm"></i>
            </button>
            <button onClick={() => setViewMode("list")} className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}>
              <i className="ri-list-check text-sm"></i>
            </button>
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center gap-3">
          {selectedTopic && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${selectedTopic.color}15`, color: selectedTopic.color }}>
              <i className={selectedTopic.icon}></i>
              {selectedTopic.label}
            </div>
          )}
          <p className="text-white/30 text-xs">{filteredVocab.length} từ vựng</p>
        </div>

        {/* Vocab display */}
        {filteredVocab.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/3 mx-auto mb-4">
              <i className="ri-search-line text-3xl text-white/20"></i>
            </div>
            <p className="text-white/30 text-sm">Không tìm thấy từ vựng nào</p>
            <p className="text-white/15 text-xs mt-1">Thử chọn chủ đề khác hoặc xóa bộ lọc</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVocab.map((word, i) => {
              const cardKey = `${word.lessonId}-${word.korean}-${i}`;
              const isFlipped = flippedCards.has(cardKey);
              return (
                <div
                  key={cardKey}
                  className="cursor-pointer"
                  style={{ perspective: "800px" }}
                  onClick={() => toggleFlip(cardKey)}
                >
                  <div
                    className="relative transition-transform duration-400"
                    style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: "140px" }}
                  >
                    {/* Front */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center p-4 rounded-xl border border-white/8 bg-[#0f1117]"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold mb-2" style={{ backgroundColor: `${word.bookColor}15`, color: word.bookColor }}>{word.lessonTitle}</span>
                      <p className="text-white text-2xl font-bold text-center mb-1">{word.korean}</p>
                      <p className="text-white/30 text-xs">[{word.pronunciation}]</p>
                      <button
                        onClick={e => { e.stopPropagation(); speakKorean(word.korean); }}
                        className="mt-2 w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
                        style={{ backgroundColor: `${word.bookColor}15` }}
                      >
                        <i className="ri-volume-up-line text-xs" style={{ color: word.bookColor }}></i>
                      </button>
                    </div>
                    {/* Back */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center p-4 rounded-xl border"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", backgroundColor: `${word.bookColor}08`, borderColor: `${word.bookColor}25` }}
                    >
                      <p className="text-lg font-bold text-center mb-1" style={{ color: word.bookColor }}>{word.vietnamese}</p>
                      <p className="text-white/40 text-xs text-center italic">{word.example}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredVocab.map((word, i) => (
              <div key={`${word.lessonId}-${word.korean}-${i}`} className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 transition-colors">
                <div className="flex-shrink-0">
                  <button onClick={() => speakKorean(word.korean)} className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer transition-colors" style={{ backgroundColor: `${word.bookColor}15` }}>
                    <i className="ri-volume-up-line text-sm" style={{ color: word.bookColor }}></i>
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white font-bold text-base">{word.korean}</p>
                    <p className="text-white/30 text-xs">[{word.pronunciation}]</p>
                  </div>
                  <p className="font-semibold text-sm" style={{ color: word.bookColor }}>{word.vietnamese}</p>
                  <p className="text-white/30 text-xs italic mt-0.5 truncate">{word.example}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${word.bookColor}15`, color: word.bookColor }}>{word.lessonTitle}</span>
                  <p className="text-white/20 text-[10px] mt-1">{word.partOfSpeech}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
