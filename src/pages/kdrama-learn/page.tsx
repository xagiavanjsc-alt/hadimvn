import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface SceneVocab {
  korean: string;
  romanization: string;
  vietnamese: string;
  partOfSpeech: string;
  level: string;
}

interface SceneGrammar {
  pattern: string;
  explanation: string;
  example: string;
  translation: string;
}

interface DramaScene {
  id: string;
  drama: string;
  year: number;
  genre: string;
  episode: string;
  title: string;
  description: string;
  thumbnail: string;
  youtubeId: string;
  level: string;
  dialogue: { speaker: string; korean: string; vietnamese: string; timestamp: string }[];
  vocab: SceneVocab[];
  grammar: SceneGrammar[];
  culturalNote: string;
  tags: string[];
}

const DRAMA_SCENES: DramaScene[] = [
  {
    id: "s1",
    drama: "Crash Landing on You",
    year: 2019,
    genre: "Lãng mạn",
    episode: "Tập 1",
    title: "Cảnh gặp gỡ đầu tiên",
    description: "Cảnh Yoon Se-ri hạ cánh khẩn cấp xuống Bắc Triều Tiên và gặp Ri Jeong-hyeok lần đầu tiên.",
    thumbnail: "https://readdy.ai/api/search-image?query=Korean%20drama%20romantic%20scene%20couple%20meeting%20in%20forest%20military%20uniform%20elegant%20woman%20surprised%20expression%20cinematic&width=480&height=270&seq=kdrama1&orientation=landscape",
    youtubeId: "dQw4w9WgXcQ",
    level: "B1",
    dialogue: [
      { speaker: "세리", korean: "여기가 어디예요?", vietnamese: "Đây là đâu vậy?", timestamp: "0:12" },
      { speaker: "정혁", korean: "당신은 누구입니까?", vietnamese: "Bạn là ai?", timestamp: "0:18" },
      { speaker: "세리", korean: "저는 한국 사람이에요. 도와주세요!", vietnamese: "Tôi là người Hàn Quốc. Hãy giúp tôi!", timestamp: "0:25" },
      { speaker: "정혁", korean: "여기는 조선민주주의인민공화국입니다.", vietnamese: "Đây là Cộng hòa Dân chủ Nhân dân Triều Tiên.", timestamp: "0:35" },
      { speaker: "세리", korean: "네?! 말도 안 돼요!", vietnamese: "Cái gì?! Không thể nào!", timestamp: "0:42" },
    ],
    vocab: [
      { korean: "여기", romanization: "yeo-gi", vietnamese: "Đây / Ở đây", partOfSpeech: "Đại từ", level: "A1" },
      { korean: "어디", romanization: "eo-di", vietnamese: "Ở đâu", partOfSpeech: "Đại từ", level: "A1" },
      { korean: "누구", romanization: "nu-gu", vietnamese: "Ai", partOfSpeech: "Đại từ", level: "A1" },
      { korean: "도와주다", romanization: "do-wa-ju-da", vietnamese: "Giúp đỡ", partOfSpeech: "Động từ", level: "A2" },
      { korean: "말도 안 되다", romanization: "mal-do an doe-da", vietnamese: "Không thể nào / Vô lý", partOfSpeech: "Thành ngữ", level: "B1" },
    ],
    grammar: [
      { pattern: "여기가 어디예요?", explanation: "Câu hỏi địa điểm: 여기(đây) + 가(trợ từ chủ ngữ) + 어디(ở đâu) + 예요(là)", example: "저기가 어디예요?", translation: "Đó là đâu vậy?" },
      { pattern: "저는 [국적] 사람이에요", explanation: "Giới thiệu quốc tịch: 저는(tôi) + [quốc tịch] + 사람(người) + 이에요(là)", example: "저는 베트남 사람이에요", translation: "Tôi là người Việt Nam" },
    ],
    culturalNote: "Phim 'Crash Landing on You' (사랑의 불시착) là bộ phim lãng mạn nổi tiếng nhất Hàn Quốc năm 2019, đạt rating cao nhất lịch sử tvN. Phim giúp người xem hiểu thêm về văn hóa và ngôn ngữ Bắc Triều Tiên.",
    tags: ["사랑의 불시착", "lãng mạn", "B1", "gặp gỡ"],
  },
  {
    id: "s2",
    drama: "Goblin",
    year: 2016,
    genre: "Huyền bí",
    episode: "Tập 3",
    title: "Cảnh ở tiệm bánh",
    description: "Ji Eun-tak và Kim Shin gặp nhau tại tiệm bánh, cuộc trò chuyện hài hước về bánh mì.",
    thumbnail: "https://readdy.ai/api/search-image?query=Korean%20drama%20fantasy%20scene%20bakery%20shop%20cozy%20warm%20lighting%20couple%20talking%20bread%20pastry%20cinematic&width=480&height=270&seq=kdrama2&orientation=landscape",
    youtubeId: "dQw4w9WgXcQ",
    level: "A2",
    dialogue: [
      { speaker: "은탁", korean: "이 빵 얼마예요?", vietnamese: "Bánh này bao nhiêu tiền?", timestamp: "1:05" },
      { speaker: "직원", korean: "삼천 원이에요.", vietnamese: "Ba nghìn won.", timestamp: "1:08" },
      { speaker: "은탁", korean: "맛있어 보여요!", vietnamese: "Trông ngon quá!", timestamp: "1:12" },
      { speaker: "신", korean: "뭘 그렇게 열심히 봐요?", vietnamese: "Nhìn gì mà chăm chú vậy?", timestamp: "1:20" },
      { speaker: "은탁", korean: "배고파요. 같이 먹을래요?", vietnamese: "Tôi đói. Ăn cùng không?", timestamp: "1:28" },
    ],
    vocab: [
      { korean: "얼마", romanization: "eol-ma", vietnamese: "Bao nhiêu (tiền)", partOfSpeech: "Đại từ", level: "A1" },
      { korean: "원", romanization: "won", vietnamese: "Won (tiền Hàn)", partOfSpeech: "Danh từ", level: "A1" },
      { korean: "맛있어 보이다", romanization: "ma-si-sseo bo-i-da", vietnamese: "Trông ngon", partOfSpeech: "Cụm động từ", level: "A2" },
      { korean: "배고프다", romanization: "bae-go-peu-da", vietnamese: "Đói", partOfSpeech: "Tính từ", level: "A1" },
      { korean: "-을래요?", romanization: "-eul-lae-yo", vietnamese: "...không? (đề nghị)", partOfSpeech: "Ngữ pháp", level: "A2" },
    ],
    grammar: [
      { pattern: "얼마예요?", explanation: "Hỏi giá: 얼마(bao nhiêu) + 예요(là) — dùng khi hỏi giá tiền", example: "이 책 얼마예요?", translation: "Quyển sách này bao nhiêu tiền?" },
      { pattern: "V-아/어 보이다", explanation: "Trông có vẻ...: động từ/tính từ + 아/어 보이다 = trông có vẻ như...", example: "피곤해 보여요", translation: "Trông có vẻ mệt" },
    ],
    culturalNote: "Phim 'Goblin' (도깨비) của biên kịch Kim Eun-sook là một trong những phim Hàn được yêu thích nhất mọi thời đại. Cảnh quay tại Quebec, Canada trở thành điểm du lịch nổi tiếng.",
    tags: ["도깨비", "huyền bí", "A2", "mua sắm"],
  },
  {
    id: "s3",
    drama: "My Love from the Star",
    year: 2013,
    genre: "Lãng mạn",
    episode: "Tập 7",
    title: "Cảnh tranh cãi hài hước",
    description: "Cheon Song-yi và Do Min-joon tranh cãi về việc sử dụng ngôn ngữ lịch sự.",
    thumbnail: "https://readdy.ai/api/search-image?query=Korean%20drama%20romantic%20comedy%20scene%20apartment%20living%20room%20couple%20arguing%20funny%20expression%20modern%20interior&width=480&height=270&seq=kdrama3&orientation=landscape",
    youtubeId: "dQw4w9WgXcQ",
    level: "B1",
    dialogue: [
      { speaker: "송이", korean: "왜 저한테 반말해요?", vietnamese: "Sao anh nói trống không với tôi vậy?", timestamp: "2:15" },
      { speaker: "민준", korean: "나이가 어리잖아요.", vietnamese: "Vì em nhỏ tuổi hơn mà.", timestamp: "2:20" },
      { speaker: "송이", korean: "그래도 존댓말 써야죠!", vietnamese: "Dù sao cũng phải nói lịch sự chứ!", timestamp: "2:25" },
      { speaker: "민준", korean: "알겠어요. 앞으로 조심할게요.", vietnamese: "Được rồi. Từ nay tôi sẽ cẩn thận.", timestamp: "2:32" },
    ],
    vocab: [
      { korean: "반말", romanization: "ban-mal", vietnamese: "Nói trống không (không lịch sự)", partOfSpeech: "Danh từ", level: "B1" },
      { korean: "존댓말", romanization: "jon-daet-mal", vietnamese: "Nói lịch sự (kính ngữ)", partOfSpeech: "Danh từ", level: "B1" },
      { korean: "나이", romanization: "na-i", vietnamese: "Tuổi", partOfSpeech: "Danh từ", level: "A1" },
      { korean: "앞으로", romanization: "ap-eu-ro", vietnamese: "Từ nay / Về sau", partOfSpeech: "Trạng từ", level: "A2" },
      { korean: "조심하다", romanization: "jo-sim-ha-da", vietnamese: "Cẩn thận", partOfSpeech: "Động từ", level: "A2" },
    ],
    grammar: [
      { pattern: "V-잖아요", explanation: "Nhắc nhở điều hiển nhiên: V + 잖아요 = ...mà / ...chứ (điều ai cũng biết)", example: "비가 오잖아요", translation: "Trời đang mưa mà" },
      { pattern: "V-아/어야죠", explanation: "Phải làm gì đó: V + 아/어야죠 = phải... chứ (nhấn mạnh nghĩa vụ)", example: "공부해야죠", translation: "Phải học chứ" },
    ],
    culturalNote: "Văn hóa kính ngữ (존댓말) rất quan trọng trong tiếng Hàn. Người Hàn thường dùng kính ngữ với người lớn tuổi hơn, người có địa vị cao hơn, hoặc người chưa thân thiết.",
    tags: ["별에서 온 그대", "lãng mạn", "B1", "kính ngữ"],
  },
  {
    id: "s4",
    drama: "Itaewon Class",
    year: 2020,
    genre: "Hành động",
    episode: "Tập 5",
    title: "Cảnh tại quán ăn",
    description: "Park Saeroyi và nhân viên phục vụ khách hàng tại quán DanBam, học từ vựng về nhà hàng.",
    thumbnail: "https://readdy.ai/api/search-image?query=Korean%20drama%20restaurant%20scene%20small%20bar%20pub%20night%20Itaewon%20Seoul%20street%20food%20cooking%20team%20work&width=480&height=270&seq=kdrama4&orientation=landscape",
    youtubeId: "dQw4w9WgXcQ",
    level: "A2",
    dialogue: [
      { speaker: "직원", korean: "어서 오세요! 몇 분이세요?", vietnamese: "Xin chào! Bao nhiêu người ạ?", timestamp: "0:05" },
      { speaker: "손님", korean: "두 명이요.", vietnamese: "Hai người.", timestamp: "0:08" },
      { speaker: "직원", korean: "이쪽으로 오세요. 메뉴판 드릴게요.", vietnamese: "Mời đi lối này. Tôi sẽ đưa thực đơn.", timestamp: "0:12" },
      { speaker: "손님", korean: "추천 메뉴가 뭐예요?", vietnamese: "Món được đề xuất là gì?", timestamp: "0:20" },
      { speaker: "새로이", korean: "오늘의 특선은 닭볶음탕이에요.", vietnamese: "Món đặc biệt hôm nay là gà kho cay.", timestamp: "0:28" },
    ],
    vocab: [
      { korean: "어서 오세요", romanization: "eo-seo o-se-yo", vietnamese: "Xin chào (chào khách vào)", partOfSpeech: "Thành ngữ", level: "A1" },
      { korean: "몇 분", romanization: "myeot bun", vietnamese: "Bao nhiêu người (lịch sự)", partOfSpeech: "Cụm từ", level: "A2" },
      { korean: "메뉴판", romanization: "me-nyu-pan", vietnamese: "Thực đơn", partOfSpeech: "Danh từ", level: "A1" },
      { korean: "추천", romanization: "chu-cheon", vietnamese: "Đề xuất / Gợi ý", partOfSpeech: "Danh từ", level: "A2" },
      { korean: "특선", romanization: "teuk-seon", vietnamese: "Món đặc biệt", partOfSpeech: "Danh từ", level: "B1" },
    ],
    grammar: [
      { pattern: "몇 분이세요?", explanation: "Hỏi số người (lịch sự): 몇(bao nhiêu) + 분(người - kính ngữ) + 이세요(là)", example: "몇 명이에요?", translation: "Bao nhiêu người? (thông thường)" },
      { pattern: "V-ㄹ/을게요", explanation: "Hứa hẹn/thông báo: V + ㄹ/을게요 = tôi sẽ... (thể hiện ý định)", example: "제가 할게요", translation: "Tôi sẽ làm" },
    ],
    culturalNote: "Itaewon là khu phố quốc tế nổi tiếng ở Seoul, nơi tập trung nhiều nhà hàng, quán bar và cửa hàng đa văn hóa. Phim 'Itaewon Class' (이태원 클라쓰) đã làm tăng lượng khách du lịch đến khu vực này.",
    tags: ["이태원 클라쓰", "hành động", "A2", "nhà hàng"],
  },
  {
    id: "s5",
    drama: "Reply 1988",
    year: 2015,
    genre: "Gia đình",
    episode: "Tập 2",
    title: "Cảnh bữa cơm gia đình",
    description: "Gia đình Deok-sun quây quần bên bữa cơm tối, học từ vựng về gia đình và bữa ăn.",
    thumbnail: "https://readdy.ai/api/search-image?query=Korean%20drama%20family%20dinner%20scene%201988%20retro%20vintage%20home%20warm%20cozy%20traditional%20Korean%20food%20table&width=480&height=270&seq=kdrama5&orientation=landscape",
    youtubeId: "dQw4w9WgXcQ",
    level: "A1",
    dialogue: [
      { speaker: "엄마", korean: "밥 먹어라! 다 식겠다.", vietnamese: "Ăn cơm đi! Nguội hết rồi.", timestamp: "0:30" },
      { speaker: "덕선", korean: "엄마, 오늘 뭐 먹어요?", vietnamese: "Mẹ ơi, hôm nay ăn gì vậy?", timestamp: "0:35" },
      { speaker: "엄마", korean: "된장찌개랑 불고기야.", vietnamese: "Canh tương đậu và thịt nướng.", timestamp: "0:40" },
      { speaker: "아빠", korean: "잘 먹겠습니다!", vietnamese: "Con xin phép ăn!", timestamp: "0:45" },
      { speaker: "모두", korean: "잘 먹겠습니다!", vietnamese: "Xin phép ăn!", timestamp: "0:46" },
    ],
    vocab: [
      { korean: "밥", romanization: "bap", vietnamese: "Cơm / Bữa ăn", partOfSpeech: "Danh từ", level: "A1" },
      { korean: "식다", romanization: "sik-da", vietnamese: "Nguội", partOfSpeech: "Động từ", level: "A2" },
      { korean: "된장찌개", romanization: "doen-jang-jji-gae", vietnamese: "Canh tương đậu", partOfSpeech: "Danh từ", level: "A2" },
      { korean: "불고기", romanization: "bul-go-gi", vietnamese: "Thịt nướng Hàn Quốc", partOfSpeech: "Danh từ", level: "A1" },
      { korean: "잘 먹겠습니다", romanization: "jal meok-get-seum-ni-da", vietnamese: "Xin phép ăn (trước bữa ăn)", partOfSpeech: "Thành ngữ", level: "A1" },
    ],
    grammar: [
      { pattern: "V-아/어라", explanation: "Mệnh lệnh thức (thân mật): V + 아/어라 = hãy... (dùng với người thân/nhỏ tuổi hơn)", example: "빨리 와라", translation: "Đến nhanh lên" },
      { pattern: "잘 먹겠습니다 / 잘 먹었습니다", explanation: "Câu nói trước/sau bữa ăn: 잘 먹겠습니다 (trước ăn) / 잘 먹었습니다 (sau ăn)", example: "잘 먹었습니다!", translation: "Cảm ơn bữa ăn ngon!" },
    ],
    culturalNote: "Phim 'Reply 1988' (응답하라 1988) tái hiện cuộc sống ở Seoul năm 1988. Văn hóa 'bàn ăn gia đình' rất quan trọng trong văn hóa Hàn Quốc — mọi người thường nói '잘 먹겠습니다' trước khi ăn và '잘 먹었습니다' sau khi ăn.",
    tags: ["응답하라 1988", "gia đình", "A1", "bữa ăn"],
  },
  {
    id: "s6",
    drama: "Vincenzo",
    year: 2021,
    genre: "Hành động",
    episode: "Tập 10",
    title: "Cảnh tại văn phòng luật",
    description: "Vincenzo và Hong Cha-young thảo luận về vụ kiện, học từ vựng pháp lý và công sở.",
    thumbnail: "https://readdy.ai/api/search-image?query=Korean%20drama%20office%20scene%20lawyer%20meeting%20room%20professional%20suit%20documents%20serious%20discussion%20modern%20Seoul&width=480&height=270&seq=kdrama6&orientation=landscape",
    youtubeId: "dQw4w9WgXcQ",
    level: "B2",
    dialogue: [
      { speaker: "차영", korean: "이 서류 검토해 주세요.", vietnamese: "Hãy xem xét tài liệu này giúp tôi.", timestamp: "1:10" },
      { speaker: "빈센조", korean: "언제까지 필요해요?", vietnamese: "Cần đến khi nào?", timestamp: "1:15" },
      { speaker: "차영", korean: "내일 오전까지요. 급해요.", vietnamese: "Đến sáng mai. Gấp lắm.", timestamp: "1:20" },
      { speaker: "빈센조", korean: "알겠습니다. 최선을 다하겠습니다.", vietnamese: "Được rồi. Tôi sẽ cố gắng hết sức.", timestamp: "1:28" },
    ],
    vocab: [
      { korean: "서류", romanization: "seo-ryu", vietnamese: "Tài liệu / Giấy tờ", partOfSpeech: "Danh từ", level: "B1" },
      { korean: "검토하다", romanization: "geom-to-ha-da", vietnamese: "Xem xét / Kiểm tra", partOfSpeech: "Động từ", level: "B2" },
      { korean: "언제까지", romanization: "eon-je-kka-ji", vietnamese: "Đến khi nào", partOfSpeech: "Cụm từ", level: "B1" },
      { korean: "급하다", romanization: "geu-pa-da", vietnamese: "Gấp / Khẩn cấp", partOfSpeech: "Tính từ", level: "A2" },
      { korean: "최선을 다하다", romanization: "choe-seon-eul da-ha-da", vietnamese: "Cố gắng hết sức", partOfSpeech: "Thành ngữ", level: "B2" },
    ],
    grammar: [
      { pattern: "V-아/어 주세요", explanation: "Yêu cầu lịch sự: V + 아/어 주세요 = hãy... giúp tôi (yêu cầu người khác làm gì)", example: "도와주세요", translation: "Hãy giúp tôi" },
      { pattern: "언제까지 + N이에요?", explanation: "Hỏi thời hạn: 언제까지(đến khi nào) + N + 이에요 = thời hạn là khi nào?", example: "언제까지 제출해야 해요?", translation: "Phải nộp đến khi nào?" },
    ],
    culturalNote: "Phim 'Vincenzo' (빈센조) nổi tiếng với cách sử dụng tiếng Ý và tiếng Hàn xen kẽ. Văn hóa công sở Hàn Quốc rất coi trọng thứ bậc và sự tôn trọng — luôn dùng kính ngữ với cấp trên.",
    tags: ["빈센조", "hành động", "B2", "công sở"],
  },
];

const LEVELS = ["Tất cả", "A1", "A2", "B1", "B2"];
const GENRES = ["Tất cả", "Lãng mạn", "Huyền bí", "Hành động", "Gia đình"];

const levelColor: Record<string, string> = {
  A1: "bg-emerald-500/20 text-emerald-400",
  A2: "bg-teal-500/20 text-teal-400",
  B1: "bg-amber-500/20 text-amber-400",
  B2: "bg-orange-500/20 text-orange-400",
  C1: "bg-rose-500/20 text-rose-400",
};

export default function KDramaLearnPage() {
  const [selectedScene, setSelectedScene] = useState<DramaScene | null>(null);
  const [activeTab, setActiveTab] = useState<"dialogue" | "vocab" | "grammar" | "culture">("dialogue");
  const [filterLevel, setFilterLevel] = useState("Tất cả");
  const [filterGenre, setFilterGenre] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [learnedVocab, setLearnedVocab] = useState<Set<string>>(new Set());
  const [showTranslation, setShowTranslation] = useState<Set<number>>(new Set());

  const filtered = DRAMA_SCENES.filter(s => {
    if (filterLevel !== "Tất cả" && s.level !== filterLevel) return false;
    if (filterGenre !== "Tất cả" && s.genre !== filterGenre) return false;
    if (search && !s.drama.toLowerCase().includes(search.toLowerCase()) && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleTranslation = (idx: number) => {
    setShowTranslation(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const toggleLearnedVocab = (word: string) => {
    setLearnedVocab(prev => {
      const next = new Set(prev);
      next.has(word) ? next.delete(word) : next.add(word);
      return next;
    });
  };

  const playTTS = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Học Qua Phim Hàn</h1>
            <p className="text-white/50 text-sm mt-1">Học từ vựng và ngữ pháp qua các cảnh phim nổi tiếng</p>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <i className="ri-film-line"></i>
            <span>{DRAMA_SCENES.length} cảnh phim</span>
          </div>
        </div>

        {selectedScene ? (
          /* Scene Detail View */
          <div className="space-y-4">
            <button
              onClick={() => setSelectedScene(null)}
              className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors cursor-pointer text-sm"
            >
              <i className="ri-arrow-left-line"></i>
              Quay lại danh sách
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Video + Info */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-white/8">
                  <img src={selectedScene.thumbnail} alt={selectedScene.title} className="w-full h-48 object-cover object-top" />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${levelColor[selectedScene.level]}`}>{selectedScene.level}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-white/50">{selectedScene.genre}</span>
                    </div>
                    <h2 className="text-white font-bold">{selectedScene.drama}</h2>
                    <p className="text-white/50 text-sm">{selectedScene.episode} · {selectedScene.title}</p>
                    <p className="text-white/40 text-xs mt-2">{selectedScene.description}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {selectedScene.tags.map(tag => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-white/30">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="bg-[#1a1f2e] rounded-xl p-4 border border-white/8">
                  <p className="text-white/50 text-xs mb-2">Từ vựng đã học</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${(learnedVocab.size / selectedScene.vocab.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white/50 text-xs">{learnedVocab.size}/{selectedScene.vocab.length}</span>
                  </div>
                </div>
              </div>

              {/* Right: Tabs */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                  {(["dialogue", "vocab", "grammar", "culture"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-1.5 rounded-md text-xs transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === tab ? "bg-[#e8c84a]/20 text-[#e8c84a] font-semibold" : "text-white/40 hover:text-white/60"
                      }`}
                    >
                      {tab === "dialogue" ? "Hội thoại" : tab === "vocab" ? "Từ vựng" : tab === "grammar" ? "Ngữ pháp" : "Văn hóa"}
                    </button>
                  ))}
                </div>

                {activeTab === "dialogue" && (
                  <div className="bg-[#1a1f2e] rounded-xl p-5 border border-white/8 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold">Hội thoại</h3>
                      <button
                        onClick={() => setShowTranslation(prev => prev.size === selectedScene.dialogue.length ? new Set() : new Set(selectedScene.dialogue.map((_, i) => i)))}
                        className="text-xs text-white/40 hover:text-white/70 cursor-pointer"
                      >
                        {showTranslation.size === selectedScene.dialogue.length ? "Ẩn dịch" : "Hiện dịch"}
                      </button>
                    </div>
                    {selectedScene.dialogue.map((line, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex-shrink-0 w-16 text-right">
                          <span className="text-[#e8c84a] text-xs font-semibold">{line.speaker}</span>
                          <p className="text-white/20 text-[10px]">{line.timestamp}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <p className="text-white/80 text-sm leading-relaxed flex-1">{line.korean}</p>
                            <button onClick={() => playTTS(line.korean)} className="text-white/20 hover:text-white/50 cursor-pointer flex-shrink-0 mt-0.5">
                              <i className="ri-volume-up-line text-sm"></i>
                            </button>
                            <button onClick={() => toggleTranslation(idx)} className="text-white/20 hover:text-white/50 cursor-pointer flex-shrink-0 mt-0.5">
                              <i className="ri-translate-2 text-sm"></i>
                            </button>
                          </div>
                          {showTranslation.has(idx) && (
                            <p className="text-white/40 text-xs mt-1 italic">{line.vietnamese}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "vocab" && (
                  <div className="bg-[#1a1f2e] rounded-xl p-5 border border-white/8 space-y-3">
                    <h3 className="text-white font-semibold mb-1">Từ vựng trong cảnh ({selectedScene.vocab.length} từ)</h3>
                    {selectedScene.vocab.map((v, idx) => (
                      <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        learnedVocab.has(v.korean) ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/3 border-white/5"
                      }`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-white font-bold text-base">{v.korean}</span>
                            <button onClick={() => playTTS(v.korean)} className="text-white/20 hover:text-white/50 cursor-pointer">
                              <i className="ri-volume-up-line text-sm"></i>
                            </button>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${levelColor[v.level]}`}>{v.level}</span>
                          </div>
                          <p className="text-white/40 text-xs">{v.romanization}</p>
                          <p className="text-white/70 text-sm">{v.vietnamese}</p>
                          <p className="text-white/30 text-xs">{v.partOfSpeech}</p>
                        </div>
                        <button
                          onClick={() => toggleLearnedVocab(v.korean)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            learnedVocab.has(v.korean) ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30 hover:bg-white/10"
                          }`}
                        >
                          <i className={learnedVocab.has(v.korean) ? "ri-check-line" : "ri-add-line"}></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "grammar" && (
                  <div className="bg-[#1a1f2e] rounded-xl p-5 border border-white/8 space-y-4">
                    <h3 className="text-white font-semibold">Ngữ pháp trong cảnh</h3>
                    {selectedScene.grammar.map((g, idx) => (
                      <div key={idx} className="bg-white/3 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[#e8c84a] font-bold text-base">{g.pattern}</span>
                          <button onClick={() => playTTS(g.pattern)} className="text-white/20 hover:text-white/50 cursor-pointer">
                            <i className="ri-volume-up-line text-sm"></i>
                          </button>
                        </div>
                        <p className="text-white/60 text-sm mb-3">{g.explanation}</p>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-white/70 text-sm font-medium">{g.example}</p>
                          <p className="text-white/40 text-xs mt-0.5 italic">{g.translation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "culture" && (
                  <div className="bg-[#1a1f2e] rounded-xl p-5 border border-white/8">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <i className="ri-global-line text-[#e8c84a]"></i>
                      Ghi chú văn hóa
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">{selectedScene.culturalNote}</p>
                    <div className="mt-4 p-3 bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-lg">
                      <p className="text-[#e8c84a] text-xs font-semibold mb-1">
                        <i className="ri-lightbulb-line mr-1"></i>
                        Mẹo học
                      </p>
                      <p className="text-white/50 text-xs">Xem phim với phụ đề tiếng Hàn để luyện đọc và nghe cùng lúc. Dừng lại ở những câu hay và lặp lại nhiều lần.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Scene List View */
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-white/8 space-y-3">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm"></i>
                <input
                  type="text"
                  placeholder="Tìm kiếm phim..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#e8c84a]/40"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-white/30 text-xs">Cấp độ:</span>
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => setFilterLevel(l)} className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${filterLevel === l ? "bg-[#e8c84a]/20 text-[#e8c84a] font-semibold" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>{l}</button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white/30 text-xs">Thể loại:</span>
                  {GENRES.map(g => (
                    <button key={g} onClick={() => setFilterGenre(g)} className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${filterGenre === g ? "bg-[#e8c84a]/20 text-[#e8c84a] font-semibold" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>{g}</button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-white/30 text-sm">{filtered.length} cảnh phim</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(scene => (
                <div
                  key={scene.id}
                  onClick={() => { setSelectedScene(scene); setActiveTab("dialogue"); setLearnedVocab(new Set()); setShowTranslation(new Set()); }}
                  className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-white/8 hover:border-white/20 transition-all cursor-pointer group"
                >
                  <div className="relative">
                    <img src={scene.thumbnail} alt={scene.title} className="w-full h-44 object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${levelColor[scene.level]}`}>{scene.level}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-black/50 text-white/70">{scene.genre}</span>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/60 text-white/70 text-xs px-2 py-0.5 rounded">
                      {scene.year}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[#e8c84a] text-xs font-semibold mb-0.5">{scene.drama}</p>
                    <h3 className="text-white font-semibold text-sm mb-1">{scene.title}</h3>
                    <p className="text-white/40 text-xs line-clamp-2 mb-3">{scene.description}</p>
                    <div className="flex items-center justify-between text-white/30 text-xs">
                      <span><i className="ri-translate-2 mr-1"></i>{scene.vocab.length} từ vựng</span>
                      <span><i className="ri-book-2-line mr-1"></i>{scene.grammar.length} ngữ pháp</span>
                      <span><i className="ri-chat-3-line mr-1"></i>{scene.dialogue.length} câu</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
