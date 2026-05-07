import { useState, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { seoulBooks } from "@/mocks/data/seoul-books-data";

interface VocabWord {
  id: number;
  word: string;
  meaning: string;
  level?: string;
  category?: string;
  example?: string;
}

interface LevelInfo {
  level: number;
  label: string;
  color: string;
  bg: string;
  border: string;
  badge: string;
  description: string;
  wordCount: number;
  topics: string[];
}

const LEVEL_INFO: LevelInfo[] = [
  {
    level: 1,
    label: "TOPIK I - Cấp 1",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-500",
    description: "Từ vựng cơ bản nhất — chào hỏi, số đếm, màu sắc, gia đình",
    wordCount: 0,
    topics: ["Chào hỏi", "Số đếm", "Màu sắc", "Gia đình", "Đồ vật"],
  },
  {
    level: 2,
    label: "TOPIK I - Cấp 2",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    badge: "bg-teal-500",
    description: "Từ vựng sinh hoạt hàng ngày — mua sắm, ăn uống, giao thông",
    wordCount: 0,
    topics: ["Mua sắm", "Ăn uống", "Giao thông", "Thời tiết", "Sức khỏe"],
  },
  {
    level: 3,
    label: "TOPIK II - Cấp 3",
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    badge: "bg-sky-500",
    description: "Từ vựng trung cấp — công việc, xã hội, cảm xúc",
    wordCount: 0,
    topics: ["Công việc", "Xã hội", "Cảm xúc", "Giáo dục", "Văn hóa"],
  },
  {
    level: 4,
    label: "TOPIK II - Cấp 4",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    badge: "bg-violet-500",
    description: "Từ vựng trung cao — kinh tế, chính trị, khoa học",
    wordCount: 0,
    topics: ["Kinh tế", "Chính trị", "Khoa học", "Môi trường", "Truyền thông"],
  },
  {
    level: 5,
    label: "TOPIK II - Cấp 5",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-500",
    description: "Từ vựng cao cấp — học thuật, văn học, triết học",
    wordCount: 0,
    topics: ["Học thuật", "Văn học", "Triết học", "Pháp luật", "Y tế"],
  },
  {
    level: 6,
    label: "TOPIK II - Cấp 6",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-500",
    description: "Từ vựng thành thạo — chuyên ngành, thành ngữ, tục ngữ",
    wordCount: 0,
    topics: ["Chuyên ngành", "Thành ngữ", "Tục ngữ", "Báo chí", "Nghiên cứu"],
  },
];

// Seoul Textbook book → TOPIK level mapping
const BOOK_TOPIK_LEVEL: Record<string, number> = {
  "1A": 1, "1B": 2, "2A": 2, "2B": 3, "3A": 3, "3B": 4, "4A": 5, "4B": 6,
};

function getSeoulVocabByTopikLevel(level: number): VocabWord[] {
  const result: VocabWord[] = [];
  const seen = new Set<string>();
  let counter = level * 10000;
  for (const book of seoulBooks) {
    if (BOOK_TOPIK_LEVEL[book.id] !== level) continue;
    for (const lesson of book.lessons) {
      const catLabel = lesson.titleVi || lesson.title;
      for (const v of lesson.vocabulary) {
        if (seen.has(v.korean)) continue;
        seen.add(v.korean);
        result.push({
          id: counter++,
          word: v.korean,
          meaning: v.vietnamese,
          level: level.toString(),
          category: catLabel,
          example: v.example,
        });
      }
    }
  }
  return result;
}

function getSeoulLevelCounts(): Record<number, number> {
  const counts: Record<number, number> = {};
  const seen: Record<number, Set<string>> = {};
  for (const book of seoulBooks) {
    const lvl = BOOK_TOPIK_LEVEL[book.id];
    if (!lvl) continue;
    if (!seen[lvl]) seen[lvl] = new Set();
    for (const lesson of book.lessons) {
      for (const v of lesson.vocabulary) {
        if (!seen[lvl].has(v.korean)) {
          seen[lvl].add(v.korean);
          counts[lvl] = (counts[lvl] || 0) + 1;
        }
      }
    }
  }
  return counts;
}

// Fallback mock vocab data per level (used only if Seoul data also empty)
const MOCK_VOCAB: Record<number, VocabWord[]> = {
  1: [
    { id: 1, word: "안녕하세요", meaning: "Xin chào", level: "1", category: "Chào hỏi", example: "안녕하세요! 저는 민준이에요." },
    { id: 2, word: "감사합니다", meaning: "Cảm ơn", level: "1", category: "Chào hỏi", example: "도와주셔서 감사합니다." },
    { id: 3, word: "이름", meaning: "Tên", level: "1", category: "Cơ bản", example: "이름이 뭐예요?" },
    { id: 4, word: "학생", meaning: "Học sinh", level: "1", category: "Người", example: "저는 학생이에요." },
    { id: 5, word: "선생님", meaning: "Giáo viên", level: "1", category: "Người", example: "선생님은 친절해요." },
    { id: 6, word: "하나", meaning: "Một (thuần Hàn)", level: "1", category: "Số đếm", example: "사과 하나 주세요." },
    { id: 7, word: "둘", meaning: "Hai (thuần Hàn)", level: "1", category: "Số đếm", example: "둘이서 같이 가요." },
    { id: 8, word: "빨간색", meaning: "Màu đỏ", level: "1", category: "Màu sắc", example: "빨간색 사과예요." },
    { id: 9, word: "파란색", meaning: "Màu xanh dương", level: "1", category: "Màu sắc", example: "하늘은 파란색이에요." },
    { id: 10, word: "어머니", meaning: "Mẹ", level: "1", category: "Gia đình", example: "어머니는 요리를 잘해요." },
    { id: 11, word: "아버지", meaning: "Bố", level: "1", category: "Gia đình", example: "아버지는 회사에 가요." },
    { id: 12, word: "물", meaning: "Nước", level: "1", category: "Đồ vật", example: "물 한 잔 주세요." },
    { id: 13, word: "밥", meaning: "Cơm", level: "1", category: "Ăn uống", example: "밥 먹었어요?" },
    { id: 14, word: "집", meaning: "Nhà", level: "1", category: "Nơi chốn", example: "집에 가요." },
    { id: 15, word: "학교", meaning: "Trường học", level: "1", category: "Nơi chốn", example: "학교에서 공부해요." },
    { id: 16, word: "오늘", meaning: "Hôm nay", level: "1", category: "Thời gian", example: "오늘 날씨가 좋아요." },
    { id: 17, word: "내일", meaning: "Ngày mai", level: "1", category: "Thời gian", example: "내일 만나요." },
    { id: 18, word: "어제", meaning: "Hôm qua", level: "1", category: "Thời gian", example: "어제 뭐 했어요?" },
  ],
  2: [
    { id: 101, word: "시장", meaning: "Chợ/Thị trường", level: "2", category: "Mua sắm", example: "시장에서 채소를 사요." },
    { id: 102, word: "가격", meaning: "Giá cả", level: "2", category: "Mua sắm", example: "이 가격이 맞아요?" },
    { id: 103, word: "할인", meaning: "Giảm giá", level: "2", category: "Mua sắm", example: "50% 할인이에요." },
    { id: 104, word: "식당", meaning: "Nhà hàng", level: "2", category: "Ăn uống", example: "식당에서 밥을 먹어요." },
    { id: 105, word: "메뉴", meaning: "Thực đơn", level: "2", category: "Ăn uống", example: "메뉴 좀 보여주세요." },
    { id: 106, word: "지하철", meaning: "Tàu điện ngầm", level: "2", category: "Giao thông", example: "지하철로 가요." },
    { id: 107, word: "버스", meaning: "Xe buýt", level: "2", category: "Giao thông", example: "버스 정류장이 어디예요?" },
    { id: 108, word: "날씨", meaning: "Thời tiết", level: "2", category: "Thời tiết", example: "오늘 날씨가 어때요?" },
    { id: 109, word: "비", meaning: "Mưa", level: "2", category: "Thời tiết", example: "비가 와요." },
    { id: 110, word: "병원", meaning: "Bệnh viện", level: "2", category: "Sức khỏe", example: "병원에 가야 해요." },
    { id: 111, word: "약", meaning: "Thuốc", level: "2", category: "Sức khỏe", example: "약을 먹어요." },
    { id: 112, word: "운동", meaning: "Thể dục", level: "2", category: "Hoạt động", example: "매일 운동해요." },
    { id: 113, word: "여행", meaning: "Du lịch", level: "2", category: "Hoạt động", example: "한국 여행을 가요." },
    { id: 114, word: "친구", meaning: "Bạn bè", level: "2", category: "Người", example: "친구와 같이 가요." },
    { id: 115, word: "회사", meaning: "Công ty", level: "2", category: "Công việc", example: "회사에 다녀요." },
    { id: 116, word: "전화", meaning: "Điện thoại", level: "2", category: "Liên lạc", example: "전화해 주세요." },
  ],
  3: [
    { id: 201, word: "경험", meaning: "Kinh nghiệm", level: "3", category: "Công việc", example: "경험이 많아요." },
    { id: 202, word: "능력", meaning: "Năng lực", level: "3", category: "Công việc", example: "능력을 키워야 해요." },
    { id: 203, word: "사회", meaning: "Xã hội", level: "3", category: "Xã hội", example: "사회에 기여해요." },
    { id: 204, word: "문화", meaning: "Văn hóa", level: "3", category: "Văn hóa", example: "한국 문화를 배워요." },
    { id: 205, word: "감정", meaning: "Cảm xúc", level: "3", category: "Cảm xúc", example: "감정을 표현해요." },
    { id: 206, word: "관계", meaning: "Mối quan hệ", level: "3", category: "Xã hội", example: "좋은 관계를 유지해요." },
    { id: 207, word: "교육", meaning: "Giáo dục", level: "3", category: "Giáo dục", example: "교육이 중요해요." },
    { id: 208, word: "환경", meaning: "Môi trường", level: "3", category: "Môi trường", example: "환경을 보호해요." },
    { id: 209, word: "발전", meaning: "Phát triển", level: "3", category: "Xã hội", example: "기술이 발전해요." },
    { id: 210, word: "변화", meaning: "Sự thay đổi", level: "3", category: "Xã hội", example: "큰 변화가 있어요." },
    { id: 211, word: "노력", meaning: "Nỗ lực", level: "3", category: "Cá nhân", example: "노력하면 돼요." },
    { id: 212, word: "성공", meaning: "Thành công", level: "3", category: "Cá nhân", example: "성공을 위해 노력해요." },
    { id: 213, word: "실패", meaning: "Thất bại", level: "3", category: "Cá nhân", example: "실패에서 배워요." },
    { id: 214, word: "목표", meaning: "Mục tiêu", level: "3", category: "Cá nhân", example: "목표를 세워요." },
    { id: 215, word: "계획", meaning: "Kế hoạch", level: "3", category: "Cá nhân", example: "계획을 세워요." },
  ],
  4: [
    { id: 301, word: "경제", meaning: "Kinh tế", level: "4", category: "Kinh tế", example: "경제가 성장해요." },
    { id: 302, word: "투자", meaning: "Đầu tư", level: "4", category: "Kinh tế", example: "주식에 투자해요." },
    { id: 303, word: "정치", meaning: "Chính trị", level: "4", category: "Chính trị", example: "정치에 관심이 있어요." },
    { id: 304, word: "민주주의", meaning: "Dân chủ", level: "4", category: "Chính trị", example: "민주주의를 지켜요." },
    { id: 305, word: "과학기술", meaning: "Khoa học kỹ thuật", level: "4", category: "Khoa học", example: "과학기술이 발전해요." },
    { id: 306, word: "인공지능", meaning: "Trí tuệ nhân tạo", level: "4", category: "Khoa học", example: "인공지능 시대예요." },
    { id: 307, word: "기후변화", meaning: "Biến đổi khí hậu", level: "4", category: "Môi trường", example: "기후변화가 심각해요." },
    { id: 308, word: "미디어", meaning: "Truyền thông", level: "4", category: "Truyền thông", example: "미디어의 영향이 커요." },
    { id: 309, word: "소비자", meaning: "Người tiêu dùng", level: "4", category: "Kinh tế", example: "소비자 권리를 보호해요." },
    { id: 310, word: "글로벌", meaning: "Toàn cầu", level: "4", category: "Xã hội", example: "글로벌 시대예요." },
    { id: 311, word: "지속가능", meaning: "Bền vững", level: "4", category: "Môi trường", example: "지속가능한 발전이 필요해요." },
    { id: 312, word: "혁신", meaning: "Đổi mới/Cách mạng", level: "4", category: "Kinh tế", example: "혁신이 필요해요." },
  ],
  5: [
    { id: 401, word: "철학", meaning: "Triết học", level: "5", category: "Học thuật", example: "철학을 공부해요." },
    { id: 402, word: "문학", meaning: "Văn học", level: "5", category: "Văn học", example: "한국 문학을 읽어요." },
    { id: 403, word: "심리학", meaning: "Tâm lý học", level: "5", category: "Học thuật", example: "심리학을 전공해요." },
    { id: 404, word: "사회학", meaning: "Xã hội học", level: "5", category: "Học thuật", example: "사회학적 관점이에요." },
    { id: 405, word: "법률", meaning: "Pháp luật", level: "5", category: "Pháp luật", example: "법률을 공부해요." },
    { id: 406, word: "의학", meaning: "Y học", level: "5", category: "Y tế", example: "의학이 발전해요." },
    { id: 407, word: "논문", meaning: "Luận văn/Bài báo khoa học", level: "5", category: "Học thuật", example: "논문을 써요." },
    { id: 408, word: "연구", meaning: "Nghiên cứu", level: "5", category: "Học thuật", example: "연구를 진행해요." },
    { id: 409, word: "이론", meaning: "Lý thuyết", level: "5", category: "Học thuật", example: "이론을 적용해요." },
    { id: 410, word: "분석", meaning: "Phân tích", level: "5", category: "Học thuật", example: "데이터를 분석해요." },
    { id: 411, word: "비판", meaning: "Phê bình/Chỉ trích", level: "5", category: "Học thuật", example: "비판적으로 생각해요." },
  ],
  6: [
    { id: 501, word: "가는 날이 장날", meaning: "Đúng ngày đi thì gặp chợ (tình cờ gặp đúng lúc)", level: "6", category: "Tục ngữ", example: "가는 날이 장날이라고 딱 맞게 왔네요." },
    { id: 502, word: "고진감래", meaning: "Khổ tận cam lai (sau khổ là ngọt)", level: "6", category: "Thành ngữ", example: "고진감래라고 노력하면 좋은 결과가 와요." },
    { id: 503, word: "일석이조", meaning: "Nhất cử lưỡng tiện (một mũi tên trúng hai đích)", level: "6", category: "Thành ngữ", example: "일석이조의 효과가 있어요." },
    { id: 504, word: "백지장도 맞들면 낫다", meaning: "Tờ giấy trắng cũng nhẹ hơn khi hai người cùng nâng", level: "6", category: "Tục ngữ", example: "백지장도 맞들면 낫다고 같이 해요." },
    { id: 505, word: "전문용어", meaning: "Thuật ngữ chuyên ngành", level: "6", category: "Chuyên ngành", example: "전문용어를 이해해야 해요." },
    { id: 506, word: "함축적", meaning: "Hàm súc/Ẩn ý", level: "6", category: "Văn học", example: "함축적인 표현이에요." },
    { id: 507, word: "역설적", meaning: "Nghịch lý", level: "6", category: "Học thuật", example: "역설적인 상황이에요." },
    { id: 508, word: "패러독스", meaning: "Nghịch lý (paradox)", level: "6", category: "Học thuật", example: "패러독스를 설명해요." },
    { id: 509, word: "은유", meaning: "Ẩn dụ", level: "6", category: "Văn học", example: "은유적 표현을 써요." },
    { id: 510, word: "직유", meaning: "So sánh trực tiếp", level: "6", category: "Văn học", example: "직유법을 사용해요." },
  ],
};

export default function TopikVocabLevelPage() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [learnedWords, setLearnedWords] = useState<Set<number>>(new Set());
  const [showExample, setShowExample] = useState<number | null>(null);
  const [levelStats, setLevelStats] = useState<Record<number, number>>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    // Load learned words from localStorage
    const saved = localStorage.getItem("topik_learned_words");
    if (saved) {
      try { setLearnedWords(new Set(JSON.parse(saved))); } catch { /* ignore */ }
    }
    // Load level stats from Supabase
    loadLevelStats();
  }, []);

  const loadLevelStats = async () => {
    // Use Seoul textbook counts as base
    const seoulCounts = getSeoulLevelCounts();
    setLevelStats(seoulCounts);
    // Then try to merge in any Supabase topik_vocabulary counts
    try {
      const { data } = await supabase
        .from("topik_vocabulary")
        .select("level");
      if (data && data.length > 0) {
        const merged = { ...seoulCounts };
        data.forEach((row: { level?: string }) => {
          const lvl = parseInt(row.level || "1");
          if (!isNaN(lvl)) merged[lvl] = (merged[lvl] || 0) + 1;
        });
        setLevelStats(merged);
      }
    } catch { /* ignore */ }
  };

  const loadWords = async (level: number) => {
    setLoading(true);
    setSelectedLevel(level);
    setSearchQuery("");
    setSelectedCategory("all");
    // Always load Seoul textbook vocab as the base
    const seoulVocab = getSeoulVocabByTopikLevel(level);
    try {
      const { data } = await supabase
        .from("topik_vocabulary")
        .select("*")
        .eq("level", level.toString())
        .limit(200);
      if (data && data.length > 0) {
        // Merge Supabase words on top of Seoul vocab (Supabase takes priority)
        const supabaseKorean = new Set(data.map((d: { word?: string; korean?: string }) => d.word || d.korean || ""));
        const merged = [...data, ...seoulVocab.filter(w => !supabaseKorean.has(w.word))];
        setWords(merged);
      } else {
        setWords(seoulVocab.length > 0 ? seoulVocab : (MOCK_VOCAB[level] || []));
      }
    } catch {
      setWords(seoulVocab.length > 0 ? seoulVocab : (MOCK_VOCAB[level] || []));
    }
    setLoading(false);
  };

  const toggleLearned = (id: number) => {
    setLearnedWords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("topik_learned_words", JSON.stringify([...next]));
      return next;
    });
  };

  const speak = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ko-KR";
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  };

  const categories = ["all", ...Array.from(new Set(words.map(w => w.category || "Khác")))];

  const filteredWords = words.filter(w => {
    const matchSearch = !searchQuery || w.word.includes(searchQuery) || w.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "all" || w.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const learnedCount = filteredWords.filter(w => learnedWords.has(w.id)).length;
  const progress = filteredWords.length > 0 ? Math.round((learnedCount / filteredWords.length) * 100) : 0;

  const currentLevelInfo = selectedLevel ? LEVEL_INFO[selectedLevel - 1] : null;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8f7f4] p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 flex items-center justify-center bg-violet-500/10 rounded-xl">
              <i className="ri-bar-chart-grouped-line text-violet-500 text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Từ vựng theo cấp độ TOPIK
              </h1>
              <p className="text-gray-500 text-sm">Phân loại từ vựng chuẩn theo 6 cấp độ TOPIK I &amp; II</p>
            </div>
          </div>
        </div>

        {!selectedLevel ? (
          /* Level selection */
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {LEVEL_INFO.map(info => {
                const dbCount = levelStats[info.level] || 0;
                const mockCount = (MOCK_VOCAB[info.level] || []).length;
                const totalCount = dbCount + mockCount;
                return (
                  <button
                    key={info.level}
                    onClick={() => loadWords(info.level)}
                    className={`text-left p-5 rounded-2xl border-2 ${info.bg} ${info.border} hover:shadow-md transition-all cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${info.badge} text-white font-black text-lg`}>
                        {info.level}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${info.bg} ${info.color} border ${info.border}`}>
                        {info.level <= 2 ? "TOPIK I" : "TOPIK II"}
                      </span>
                    </div>
                    <h3 className={`font-bold text-base ${info.color} mb-1`}>{info.label}</h3>
                    <p className="text-gray-500 text-xs mb-3 leading-relaxed">{info.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {info.topics.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 bg-white/70 rounded-full text-gray-500">{t}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{totalCount}+ từ vựng</span>
                      <i className={`ri-arrow-right-line ${info.color} group-hover:translate-x-1 transition-transform`}></i>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Overview stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Tổng quan hệ thống TOPIK</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Tổng từ vựng", value: "1,095+", icon: "ri-translate-2", color: "text-violet-500" },
                  { label: "Cấp độ", value: "6 cấp", icon: "ri-bar-chart-line", color: "text-sky-500" },
                  { label: "Chủ đề", value: "30+", icon: "ri-apps-line", color: "text-emerald-500" },
                  { label: "Đã học", value: `${learnedWords.size}`, icon: "ri-checkbox-circle-line", color: "text-amber-500" },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className={`w-8 h-8 flex items-center justify-center mx-auto mb-2 ${s.color}`}>
                      <i className={`${s.icon} text-xl`}></i>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Word list */
          <div>
            {/* Back + header */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setSelectedLevel(null)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 cursor-pointer whitespace-nowrap text-sm"
              >
                <i className="ri-arrow-left-line"></i>
                Quay lại
              </button>
              {currentLevelInfo && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${currentLevelInfo.bg} border ${currentLevelInfo.border}`}>
                  <span className={`text-sm font-bold ${currentLevelInfo.color}`}>{currentLevelInfo.label}</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">Tiến độ học</p>
                <span className="text-sm font-bold text-gray-700">{learnedCount}/{filteredWords.length} từ ({progress}%)</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${currentLevelInfo?.badge || "bg-violet-500"}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                  <input
                    type="text"
                    placeholder="Tìm từ vựng..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm border border-gray-100 focus:outline-none focus:border-violet-300"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c === "all" ? "Tất cả chủ đề" : c}</option>
                    ))}
                  </select>
                  <div className="flex bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2 cursor-pointer ${viewMode === "grid" ? "bg-violet-500 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                      <i className="ri-grid-line text-sm"></i>
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-2 cursor-pointer ${viewMode === "list" ? "bg-violet-500 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                      <i className="ri-list-check text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <i className="ri-loader-4-line animate-spin text-3xl text-violet-400"></i>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" : "space-y-2"}>
                {filteredWords.map(word => {
                  const isLearned = learnedWords.has(word.id);
                  const isExpanded = showExample === word.id;
                  return (
                    <div
                      key={word.id}
                      className={`bg-white rounded-xl border transition-all ${
                        isLearned ? "border-emerald-200 bg-emerald-50/30" : "border-gray-100 hover:border-gray-200"
                      } ${viewMode === "list" ? "p-3" : "p-4"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-gray-900">{word.word}</span>
                            <button
                              onClick={() => speak(word.word)}
                              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-violet-500 cursor-pointer"
                            >
                              <i className="ri-volume-up-line text-sm"></i>
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">{word.meaning}</p>
                          {word.category && (
                            <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${currentLevelInfo?.bg} ${currentLevelInfo?.color} border ${currentLevelInfo?.border}`}>
                              {word.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {word.example && (
                            <button
                              onClick={() => setShowExample(isExpanded ? null : word.id)}
                              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-sky-500 cursor-pointer"
                            >
                              <i className={`${isExpanded ? "ri-chat-1-fill text-sky-500" : "ri-chat-1-line"} text-sm`}></i>
                            </button>
                          )}
                          <button
                            onClick={() => toggleLearned(word.id)}
                            className={`w-7 h-7 flex items-center justify-center cursor-pointer rounded-lg transition-all ${
                              isLearned ? "bg-emerald-100 text-emerald-500" : "text-gray-300 hover:text-app-accent-success"
                            }`}
                          >
                            <i className={`${isLearned ? "ri-checkbox-circle-fill" : "ri-checkbox-blank-circle-line"} text-base`}></i>
                          </button>
                        </div>
                      </div>
                      {isExpanded && word.example && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-sky-600 bg-sky-50 rounded-lg px-3 py-2">{word.example}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {filteredWords.length === 0 && !loading && (
              <div className="text-center py-16 text-gray-400">
                <i className="ri-search-line text-4xl mb-2 block"></i>
                <p>Không tìm thấy từ vựng phù hợp</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
