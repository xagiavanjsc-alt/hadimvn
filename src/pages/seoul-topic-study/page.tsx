import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { seoulBooks, type SeoulVocabItem } from "@/mocks/seoulTextbook";

// --- Topic definitions -----------------------------------------------------
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
    label: "Gia dình",
    icon: "ri-home-heart-line",
    color: "#fb923c",
    keywords: ["gia dình", "b?", "m?", "anh", "ch?", "em", "ông", "bà", "con", "ch?ng", "v?", "anh trai", "ch? gái", "em gái", "em trai", "cha", "m?", "v?", "ngài", "quý danh", "tu?i", "nhà"],
  },
  {
    id: "food",
    label: "?m th?c",
    icon: "ri-restaurant-line",
    color: "app-accent-primary",
    keywords: ["an", "u?ng", "canh", "com", "m?", "th?t", "cá", "rau", "ng?t", "m?n", "cay", "chua", "d?ng", "nh?t", "món", "b?a", "nhà hàng", "g?i", "d?t", "v?", "huong v?", "n?u", "nu?ng", "h?m", "kho", "tr?n", "mi?n", "bánh", "su?n", "gà", "bò", "l?n", "d?u", "kim chi"],
  },
  {
    id: "transport",
    label: "Giao thông",
    icon: "ri-bus-line",
    color: "#34d399",
    keywords: ["xe", "tàu", "bus", "taxi", "máy bay", "di", "lái", "d?i", "xu?ng", "lên", "b?n", "ga", "tr?m", "du?ng", "t?c", "giao thông", "phuong ti?n", "d?p", "ng?m", "di?n ng?m", "xe d?p", "xe máy", "ô tô", "tàu h?a", "thuy?n"],
  },
  {
    id: "health",
    label: "S?c kh?e",
    icon: "ri-heart-pulse-line",
    color: "#f87171",
    keywords: ["dau", "b?nh", "thu?c", "b?nh vi?n", "khoa", "tri?u ch?ng", "s?t", "ho", "mui", "c?m", "gãy", "thuong", "chóng m?t", "nôn", "ói", "sung", "kh?i", "tiêu hóa", "h? s?t", "gi?m dau", "say xe", "bôi", "dán", "nh? m?t", "khu?y", "b?c thu?c"],
  },
  {
    id: "body",
    label: "Co th?",
    icon: "ri-body-scan-line",
    color: "#a78bfa",
    keywords: ["d?u", "m?t", "m?t", "mui", "mi?ng", "tai", "c?", "vai", "tay", "ng?c", "b?ng", "lung", "eo", "chân", "g?i", "bàn tay", "bàn chân", "co th?", "thân th?", "khuôn m?t", "lông mày", "môi", "trán", "m?t 2 mí"],
  },
  {
    id: "clothing",
    label: "Trang ph?c",
    icon: "ri-t-shirt-line",
    color: "#06b6d4",
    keywords: ["m?c", "c?i", "d?i", "di giày", "deo", "váy", "qu?n", "áo", "t?t", "giày", "dép", "mu", "kính", "khan", "gang tay", "cà v?t", "vest", "com-lê", "jeans", "phông", "so mi", "khoác", "len", "dài", "ng?n", "r?ng", "ch?t", "dày", "m?ng"],
  },
  {
    id: "emotion",
    label: "C?m xúc",
    icon: "ri-emotion-line",
    color: "#fb923c",
    keywords: ["vui", "bu?n", "t?c", "s?", "lo", "h?nh phúc", "cô don", "x?u h?", "cang th?ng", "b?c", "m?t", "dau lòng", "t? hào", "nh?", "b?i r?i", "ti?c", "hài lòng", "stress", "áp l?c", "tâm tr?ng", "c?m xúc", "phân vân", "may m?n"],
  },
  {
    id: "travel",
    label: "Du l?ch",
    icon: "ri-plane-line",
    color: "#34d399",
    keywords: ["du l?ch", "vé", "máy bay", "khách s?n", "d?t phòng", "h? chi?u", "xu?t phát", "d?n noi", "tr? v?", "phong c?nh", "bình minh", "hoàng hôn", "c?nh dêm", "h?i s?n", "quê", "l?ch trình", "b?o hi?m", "h?ng", "gh?", "kh? h?i", "m?t chi?u"],
  },
  {
    id: "phone",
    label: "Ði?n tho?i",
    icon: "ri-phone-line",
    color: "app-accent-primary",
    keywords: ["di?n tho?i", "g?i", "nh?n", "ng?t", "chuy?n", "tin nh?n", "g?i", "nh?n", "s? di?n tho?i", "máy b?n", "qu?c t?", "trong nu?c", "phí", "a lô", "xóa", "tr? l?i", "thông tin", "tu v?n", "h?i"],
  },
  {
    id: "housing",
    label: "Nhà ?",
    icon: "ri-building-line",
    color: "#a78bfa",
    keywords: ["nhà", "phòng", "thuê", "d?t c?c", "chung cu", "ký túc xá", "nhà tr?", "ban công", "l?i vào", "ti?n di?n", "ti?n nu?c", "ti?n ga", "phí qu?n lý", "h?p d?ng", "b?t d?ng s?n", "tìm phòng", "yên tinh", "?n ào", "thoáng khí", "view"],
  },
  {
    id: "hobby",
    label: "S? thích",
    icon: "ri-gamepad-line",
    color: "#06b6d4",
    keywords: ["s? thích", "ch?p ?nh", "nghe nh?c", "nh?y", "v?", "suu t?p", "leo núi", "d?c sách", "boi", "bóng dá", "bóng r?", "tennis", "golf", "câu l?c b?", "h?i phí", "luy?n t?p", "blog", "internet", "game"],
  },
  {
    id: "appearance",
    label: "Ngo?i hình",
    icon: "ri-user-smile-line",
    color: "#fb923c",
    keywords: ["ngo?i hình", "cao", "th?p", "g?y", "béo", "thon th?", "m?t to", "m?t nh?", "mui cao", "mui th?p", "mi?ng to", "trán r?ng", "vai r?ng", "tóc", "c?t tóc", "nhu?m", "u?n", "ki?u tóc", "gi?ng nhau", "trông", "nam tính", "n? tính"],
  },
  {
    id: "time",
    label: "Th?i gian",
    icon: "ri-time-line",
    color: "#34d399",
    keywords: ["sáng", "trua", "chi?u", "t?i", "dêm", "sáng s?m", "bu?i", "th?c d?y", "ng?", "gi?", "phút", "hàng ngày", "m?i tu?n", "m?i tháng", "hàng nam", "thu?ng xuyên", "th?nh tho?ng", "luôn luôn", "d?t nhiên", "lúc nãy", "lát n?a"],
  },
  {
    id: "finance",
    label: "Tài chính",
    icon: "ri-money-dollar-circle-line",
    color: "app-accent-primary",
    keywords: ["ti?n", "d?i ti?n", "rút ti?n", "n?p ti?n", "chuy?n ti?n", "g?i ti?n", "tài kho?n", "ngân hàng", "th?", "tín d?ng", "d?t c?c", "phí", "giá", "d?t", "r?", "ti?t ki?m", "t? giá", "ATM", "chuy?n kho?n", "s? tài kho?n"],
  },
  {
    id: "direction",
    label: "Ch? du?ng",
    icon: "ri-map-pin-line",
    color: "#f87171",
    keywords: ["ngã tu", "ngã ba", "dèn giao thông", "r? trái", "r? ph?i", "di th?ng", "qua du?ng", "v?ch sang du?ng", "c?u vu?t", "du?ng h?m", "tr?m", "ga", "b?n", "d?i chuy?n", "ti?n l?i", "b?t taxi", "l? xe", "dông ngh?t"],
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
      title="H?c theo ch? d?"
      subtitle="Gom t? v?ng xuyên su?t các bài h?c theo ch? d?: gia dình, ?m th?c, giao thông..."
      actions={
        <button onClick={() => navigate("/seoul-practice")} className="flex items-center gap-2 bg-app-card/50 hover:bg-app-card/70 text-white/60 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-gamepad-line"></i>Luy?n t?p
        </button>
      }
    >
      <div className="space-y-6">
        {/* Topic grid */}
        <div>
          <p className="text-white/50 text-xs font-semibold tracking-normal mb-3">Ch?n ch? d?</p>
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
            {/* All topics */}
            <button
              onClick={() => setSelectedTopic(null)}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${!selectedTopic ? "border-white/25 bg-app-card/50" : "border-app-border bg-white/2 hover:border-white/15"}`}
            >
              <div className="w-9 h-9 flex items-center justify-center rounded-xl mx-auto mb-2" style={{ backgroundColor: !selectedTopic ? "app-accent-primary20" : "rgba(255,255,255,0.05)" }}>
                <i className="ri-apps-line text-lg" style={{ color: !selectedTopic ? "app-accent-primary" : "rgba(255,255,255,0.3)" }}></i>
              </div>
              <p className={`text-xs font-semibold ${!selectedTopic ? "text-white" : "text-app-text-secondary"}`}>T?t c?</p>
              <p className="text-app-text-muted text-[10px] mt-0.5">{allVocab.length} t?</p>
            </button>

            {TOPICS.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${selectedTopic?.id === topic.id ? "border-white/25 bg-app-card/50" : "border-app-border bg-white/2 hover:border-white/15"}`}
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-xl mx-auto mb-2" style={{ backgroundColor: selectedTopic?.id === topic.id ? `${topic.color}20` : "rgba(255,255,255,0.05)" }}>
                  <i className={`${topic.icon} text-lg`} style={{ color: selectedTopic?.id === topic.id ? topic.color : "rgba(255,255,255,0.3)" }}></i>
                </div>
                <p className={`text-xs font-semibold ${selectedTopic?.id === topic.id ? "text-white" : "text-app-text-secondary"}`}>{topic.label}</p>
                <p className="text-app-text-muted text-[10px] mt-0.5">{topicCounts[topic.id]} t?</p>
              </button>
            ))}
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm t? v?ng..."
              className="w-full pl-9 pr-4 py-2.5 bg-app-surface/50 border border-app-border rounded-xl text-sm text-white placeholder-white/20 outline-none focus:border-white/25 transition-colors"
            />
          </div>

          {/* Book filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedBook("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${selectedBook === "all" ? "bg-app-accent-primary/15 text-app-accent-primary" : "bg-app-card/50 text-app-text-secondary hover:bg-white/8"}`}
            >
              T?t c? sách
            </button>
            {availableBooks.map(book => (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${selectedBook === book.id ? "text-app-bg" : "bg-app-card/50 text-app-text-secondary hover:bg-white/8"}`}
                style={selectedBook === book.id ? { backgroundColor: book.color } : {}}
              >
                {book.level}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-app-card/50 rounded-lg p-1 ml-auto">
            <button onClick={() => setViewMode("grid")} className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${viewMode === "grid" ? "bg-app-card/70 text-white" : "text-app-text-muted hover:text-white/60"}`}>
              <i className="ri-grid-line text-sm"></i>
            </button>
            <button onClick={() => setViewMode("list")} className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${viewMode === "list" ? "bg-app-card/70 text-white" : "text-app-text-muted hover:text-white/60"}`}>
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
          <p className="text-app-text-muted text-xs">{filteredVocab.length} t? v?ng</p>
        </div>

        {/* Vocab display */}
        {filteredVocab.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-app-surface/50 mx-auto mb-4">
              <i className="ri-search-line text-3xl text-app-text-muted"></i>
            </div>
            <p className="text-app-text-muted text-sm">Không tìm th?y t? v?ng nào</p>
            <p className="text-white/15 text-xs mt-1">Th? ch?n ch? d? khác ho?c xóa b? l?c</p>
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
                      className="absolute inset-0 flex flex-col items-center justify-center p-4 rounded-xl border border-app-border bg-app-bg"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold mb-2" style={{ backgroundColor: `${word.bookColor}15`, color: word.bookColor }}>{word.lessonTitle}</span>
                      <p className="text-white text-2xl font-bold text-center mb-1">{word.korean}</p>
                      <p className="text-app-text-muted text-xs">[{word.pronunciation}]</p>
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
                      <p className="text-app-text-secondary text-xs text-center italic">{word.example}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredVocab.map((word, i) => (
              <div key={`${word.lessonId}-${word.korean}-${i}`} className="flex items-center gap-4 p-4 rounded-xl border border-app-border bg-white/2 hover:bg-white/4 transition-colors">
                <div className="flex-shrink-0">
                  <button onClick={() => speakKorean(word.korean)} className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer transition-colors" style={{ backgroundColor: `${word.bookColor}15` }}>
                    <i className="ri-volume-up-line text-sm" style={{ color: word.bookColor }}></i>
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white font-bold text-base">{word.korean}</p>
                    <p className="text-app-text-muted text-xs">[{word.pronunciation}]</p>
                  </div>
                  <p className="font-semibold text-sm" style={{ color: word.bookColor }}>{word.vietnamese}</p>
                  <p className="text-app-text-muted text-xs italic mt-0.5 truncate">{word.example}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${word.bookColor}15`, color: word.bookColor }}>{word.lessonTitle}</span>
                  <p className="text-app-text-muted text-[10px] mt-1">{word.partOfSpeech}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
