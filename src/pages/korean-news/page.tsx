import { useState, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface VocabHighlight {
  word: string;
  meaning: string;
  level: string;
  pronunciation: string;
}

interface NewsArticle {
  id: string;
  title: string;
  titleVi: string;
  category: string;
  level: string;
  date: string;
  source: string;
  readTime: string;
  thumbnail: string;
  content: string;
  contentVi: string;
  vocab: VocabHighlight[];
  tags: string[];
  views: number;
}

const ARTICLES: NewsArticle[] = [
  {
    id: "n1",
    title: "한국 경제, 올해 3% 성장 전망",
    titleVi: "Kinh tế Hàn Quốc dự báo tăng trưởng 3% năm nay",
    category: "경제",
    level: "B1",
    date: "2025-01-15",
    source: "한국경제",
    readTime: "3분",
    thumbnail: "/images/brand/logo.svg",
    views: 12400,
    tags: ["경제", "성장", "전망"],
    vocab: [
      { word: "경제", meaning: "Kinh tế", level: "B1", pronunciation: "gyeong-je" },
      { word: "성장", meaning: "Tăng trưởng", level: "B1", pronunciation: "seong-jang" },
      { word: "전망", meaning: "Dự báo / Triển vọng", level: "B2", pronunciation: "jeon-mang" },
      { word: "발표", meaning: "Công bố / Phát biểu", level: "B1", pronunciation: "bal-pyo" },
      { word: "수출", meaning: "Xuất khẩu", level: "B2", pronunciation: "su-chul" },
      { word: "투자", meaning: "Đầu tư", level: "B2", pronunciation: "tu-ja" },
    ],
    content: `한국 경제가 올해 약 3% 성장할 것으로 전망된다고 정부가 발표했습니다.

기획재정부는 15일 "올해 한국 경제 성장률이 3%를 달성할 것으로 예상된다"고 밝혔습니다. 이는 지난해보다 0.5%포인트 높은 수치입니다.

성장의 주요 원인으로는 수출 증가와 내수 회복이 꼽혔습니다. 특히 반도체와 자동차 분야에서 수출이 크게 늘었습니다.

전문가들은 "글로벌 경기 회복과 함께 한국 경제도 안정적인 성장세를 보일 것"이라고 분석했습니다.

다만 고물가와 고금리 상황이 지속되면서 소비 심리가 위축될 수 있다는 우려도 있습니다. 정부는 이를 해결하기 위해 다양한 경제 정책을 추진할 계획입니다.

투자 환경 개선과 일자리 창출을 위한 정책도 함께 발표될 예정입니다.`,
    contentVi: `Chính phủ Hàn Quốc công bố kinh tế nước này dự kiến tăng trưởng khoảng 3% trong năm nay.

Bộ Kế hoạch và Tài chính ngày 15 cho biết "Tốc độ tăng trưởng kinh tế Hàn Quốc năm nay dự kiến đạt 3%". Con số này cao hơn 0,5 điểm phần trăm so với năm ngoái.

Nguyên nhân chính của tăng trưởng được cho là tăng xuất khẩu và phục hồi tiêu dùng nội địa. Đặc biệt, xuất khẩu trong lĩnh vực bán dẫn và ô tô tăng mạnh.

Các chuyên gia phân tích rằng "Cùng với sự phục hồi kinh tế toàn cầu, kinh tế Hàn Quốc cũng sẽ cho thấy đà tăng trưởng ổn định".

Tuy nhiên, cũng có lo ngại rằng tâm lý tiêu dùng có thể bị thu hẹp do lạm phát cao và lãi suất cao tiếp tục kéo dài. Chính phủ có kế hoạch thúc đẩy nhiều chính sách kinh tế để giải quyết vấn đề này.

Các chính sách cải thiện môi trường đầu tư và tạo việc làm cũng sẽ được công bố cùng lúc.`,
  },
  {
    id: "n2",
    title: "서울 지하철, 새로운 노선 개통 예정",
    titleVi: "Tàu điện ngầm Seoul dự kiến khai thông tuyến mới",
    category: "사회",
    level: "A2",
    date: "2025-01-14",
    source: "서울신문",
    readTime: "2분",
    thumbnail: "/images/brand/logo.svg",
    views: 8900,
    tags: ["서울", "지하철", "교통"],
    vocab: [
      { word: "지하철", meaning: "Tàu điện ngầm", level: "A1", pronunciation: "ji-ha-cheol" },
      { word: "노선", meaning: "Tuyến đường", level: "A2", pronunciation: "no-seon" },
      { word: "개통", meaning: "Khai thông / Mở tuyến", level: "B1", pronunciation: "gae-tong" },
      { word: "편리하다", meaning: "Tiện lợi", level: "A2", pronunciation: "pyeol-li-ha-da" },
      { word: "이용하다", meaning: "Sử dụng", level: "A2", pronunciation: "i-yong-ha-da" },
      { word: "승객", meaning: "Hành khách", level: "B1", pronunciation: "seung-gaek" },
    ],
    content: `서울시는 오는 3월에 새로운 지하철 노선을 개통할 예정이라고 발표했습니다.

새로운 노선은 강남에서 강북을 연결하는 9호선 연장선으로, 총 8개 역이 새로 생깁니다. 이 노선이 개통되면 출퇴근 시간이 약 20분 단축될 것으로 예상됩니다.

서울시 관계자는 "새 노선 개통으로 시민들의 교통 편의가 크게 향상될 것"이라고 말했습니다.

현재 공사는 95% 완료된 상태이며, 안전 점검을 마친 후 정식 개통할 예정입니다. 개통 후에는 하루 약 15만 명의 승객이 이용할 것으로 예상됩니다.

요금은 기존 지하철과 동일하게 적용되며, 환승도 자유롭게 가능합니다.`,
    contentVi: `Thành phố Seoul thông báo dự kiến khai thông tuyến tàu điện ngầm mới vào tháng 3 tới.

Tuyến mới là tuyến mở rộng số 9 kết nối Gangnam với Gangbuk, với tổng cộng 8 ga mới được xây dựng. Khi tuyến này khai thông, thời gian đi làm dự kiến sẽ rút ngắn khoảng 20 phút.

Đại diện thành phố Seoul cho biết "Việc khai thông tuyến mới sẽ cải thiện đáng kể sự tiện lợi giao thông cho người dân".

Hiện tại công trình đã hoàn thành 95%, và dự kiến sẽ chính thức khai thông sau khi hoàn tất kiểm tra an toàn. Sau khi khai thông, dự kiến khoảng 150.000 hành khách sẽ sử dụng mỗi ngày.

Giá vé sẽ được áp dụng giống như tàu điện ngầm hiện tại, và việc chuyển tuyến cũng hoàn toàn tự do.`,
  },
  {
    id: "n3",
    title: "K-팝 한류, 전 세계로 확산 중",
    titleVi: "Làn sóng Hallyu K-pop đang lan rộng ra toàn thế giới",
    category: "문화",
    level: "B1",
    date: "2025-01-13",
    source: "문화일보",
    readTime: "4분",
    thumbnail: "/images/brand/logo.svg",
    views: 24600,
    tags: ["K-팝", "한류", "문화"],
    vocab: [
      { word: "한류", meaning: "Làn sóng Hàn Quốc (Hallyu)", level: "B1", pronunciation: "hal-lyu" },
      { word: "확산", meaning: "Lan rộng / Phổ biến", level: "B2", pronunciation: "hwak-san" },
      { word: "인기", meaning: "Sự nổi tiếng", level: "A2", pronunciation: "in-gi" },
      { word: "공연", meaning: "Công diễn / Biểu diễn", level: "B1", pronunciation: "gong-yeon" },
      { word: "팬", meaning: "Fan / Người hâm mộ", level: "A1", pronunciation: "paen" },
      { word: "영향", meaning: "Ảnh hưởng", level: "B2", pronunciation: "yeong-hyang" },
    ],
    content: `한국의 K-팝과 드라마를 중심으로 한 한류가 전 세계로 빠르게 확산되고 있습니다.

최근 조사에 따르면, 전 세계 한류 팬 수가 2억 명을 넘어섰습니다. 특히 동남아시아와 남미 지역에서 한류의 인기가 급격히 높아지고 있습니다.

K-팝 그룹들의 해외 공연도 크게 늘었습니다. 지난해에는 주요 K-팝 그룹들이 미국, 유럽, 남미 등 50개국 이상에서 공연을 진행했습니다.

한국 문화체육관광부는 "한류가 한국 경제에 미치는 영향이 매우 크다"며 "앞으로도 한류 확산을 적극 지원할 것"이라고 밝혔습니다.

한국어 학습자 수도 크게 늘어, 전 세계적으로 한국어를 배우는 사람이 1,000만 명을 넘어섰다는 통계도 나왔습니다.`,
    contentVi: `Làn sóng Hallyu tập trung vào K-pop và phim truyền hình Hàn Quốc đang lan rộng nhanh chóng ra toàn thế giới.

Theo khảo sát gần đây, số lượng fan Hallyu trên toàn thế giới đã vượt 200 triệu người. Đặc biệt, sự nổi tiếng của Hallyu đang tăng mạnh ở khu vực Đông Nam Á và Nam Mỹ.

Các buổi biểu diễn nước ngoài của các nhóm K-pop cũng tăng đáng kể. Năm ngoái, các nhóm K-pop hàng đầu đã biểu diễn tại hơn 50 quốc gia bao gồm Mỹ, châu Âu, Nam Mỹ.

Bộ Văn hóa, Thể thao và Du lịch Hàn Quốc cho biết "Ảnh hưởng của Hallyu đối với kinh tế Hàn Quốc rất lớn" và "Sẽ tiếp tục tích cực hỗ trợ sự lan rộng của Hallyu".

Số người học tiếng Hàn cũng tăng mạnh, với thống kê cho thấy số người học tiếng Hàn trên toàn thế giới đã vượt 10 triệu người.`,
  },
  {
    id: "n4",
    title: "한국 날씨, 이번 주 전국 눈 예보",
    titleVi: "Thời tiết Hàn Quốc, dự báo tuyết rơi toàn quốc tuần này",
    category: "날씨",
    level: "A1",
    date: "2025-01-12",
    source: "기상청",
    readTime: "1분",
    thumbnail: "/images/brand/logo.svg",
    views: 31200,
    tags: ["날씨", "눈", "겨울"],
    vocab: [
      { word: "날씨", meaning: "Thời tiết", level: "A1", pronunciation: "nal-ssi" },
      { word: "눈", meaning: "Tuyết", level: "A1", pronunciation: "nun" },
      { word: "예보", meaning: "Dự báo", level: "A2", pronunciation: "ye-bo" },
      { word: "기온", meaning: "Nhiệt độ", level: "A2", pronunciation: "gi-on" },
      { word: "영하", meaning: "Dưới 0 độ", level: "B1", pronunciation: "yeong-ha" },
      { word: "조심하다", meaning: "Cẩn thận", level: "A2", pronunciation: "jo-sim-ha-da" },
    ],
    content: `기상청은 이번 주 전국에 눈이 내릴 것으로 예보했습니다.

수요일부터 목요일까지 서울과 수도권 지역에 5~10cm의 눈이 내릴 것으로 예상됩니다. 강원도 산간 지역에는 최대 30cm의 폭설이 예상됩니다.

기온도 크게 떨어져 서울의 최저 기온이 영하 15도까지 내려갈 것으로 보입니다.

기상청은 "빙판길 사고에 주의하고, 외출 시 따뜻하게 입으세요"라고 당부했습니다.

대중교통 이용을 권장하며, 자가용 운전 시에는 안전 운전에 각별히 조심해야 합니다.`,
    contentVi: `Cơ quan Khí tượng Hàn Quốc dự báo tuyết sẽ rơi trên toàn quốc trong tuần này.

Từ thứ Tư đến thứ Năm, dự kiến tuyết rơi 5-10cm ở Seoul và khu vực thủ đô. Ở vùng núi Gangwon, dự kiến có tuyết dày tới 30cm.

Nhiệt độ cũng sẽ giảm mạnh, nhiệt độ thấp nhất ở Seoul dự kiến xuống tới âm 15 độ.

Cơ quan Khí tượng khuyến cáo "Hãy cẩn thận với tai nạn trên đường băng, và mặc ấm khi ra ngoài".

Khuyến khích sử dụng phương tiện công cộng, và khi lái xe riêng cần đặc biệt chú ý lái xe an toàn.`,
  },
  {
    id: "n5",
    title: "한국 음식, 세계 건강식으로 주목받아",
    titleVi: "Ẩm thực Hàn Quốc được chú ý là thực phẩm lành mạnh thế giới",
    category: "음식",
    level: "A2",
    date: "2025-01-11",
    source: "조선일보",
    readTime: "3분",
    thumbnail: "/images/brand/logo.svg",
    views: 18700,
    tags: ["음식", "건강", "김치"],
    vocab: [
      { word: "음식", meaning: "Thức ăn / Ẩm thực", level: "A1", pronunciation: "eum-sik" },
      { word: "건강", meaning: "Sức khỏe", level: "A1", pronunciation: "geon-gang" },
      { word: "발효", meaning: "Lên men", level: "B2", pronunciation: "bal-hyo" },
      { word: "영양", meaning: "Dinh dưỡng", level: "B1", pronunciation: "yeong-yang" },
      { word: "세계적", meaning: "Mang tầm thế giới", level: "B1", pronunciation: "se-gye-jeok" },
      { word: "인정받다", meaning: "Được công nhận", level: "B2", pronunciation: "in-jeong-bat-da" },
    ],
    content: `한국의 전통 음식이 세계적으로 건강식으로 주목받고 있습니다.

특히 김치, 된장, 간장 등 발효 식품이 건강에 좋다는 연구 결과가 잇따라 발표되면서 세계인들의 관심이 높아지고 있습니다.

미국의 한 건강 전문지는 "김치는 세계 최고의 건강식 중 하나"라고 선정했습니다. 김치에는 유산균이 풍부하게 들어 있어 장 건강에 매우 좋습니다.

비빔밥도 세계적으로 인기를 끌고 있습니다. 다양한 채소와 단백질이 균형 있게 들어 있어 영양 면에서도 우수하다는 평가를 받고 있습니다.

한국 정부는 한식의 세계화를 위해 다양한 지원 정책을 추진하고 있습니다.`,
    contentVi: `Ẩm thực truyền thống Hàn Quốc đang được chú ý trên toàn thế giới như thực phẩm lành mạnh.

Đặc biệt, khi các kết quả nghiên cứu về lợi ích sức khỏe của thực phẩm lên men như kimchi, doenjang, ganjang liên tục được công bố, sự quan tâm của người dân thế giới ngày càng tăng.

Một tạp chí sức khỏe của Mỹ đã bình chọn "Kimchi là một trong những thực phẩm lành mạnh nhất thế giới". Kimchi chứa nhiều vi khuẩn lactic acid, rất tốt cho sức khỏe đường ruột.

Bibimbap cũng đang được ưa chuộng trên toàn thế giới. Nó được đánh giá cao về mặt dinh dưỡng vì chứa cân bằng nhiều loại rau và protein.

Chính phủ Hàn Quốc đang thúc đẩy nhiều chính sách hỗ trợ để toàn cầu hóa ẩm thực Hàn Quốc.`,
  },
  {
    id: "n6",
    title: "한국 교육, AI 활용 수업 확대",
    titleVi: "Giáo dục Hàn Quốc mở rộng bài học ứng dụng AI",
    category: "교육",
    level: "B2",
    date: "2025-01-10",
    source: "교육신문",
    readTime: "4분",
    thumbnail: "/images/brand/logo.svg",
    views: 9800,
    tags: ["교육", "AI", "기술"],
    vocab: [
      { word: "교육", meaning: "Giáo dục", level: "A2", pronunciation: "gyo-yuk" },
      { word: "인공지능", meaning: "Trí tuệ nhân tạo (AI)", level: "B2", pronunciation: "in-gong-ji-neung" },
      { word: "활용", meaning: "Ứng dụng / Tận dụng", level: "B2", pronunciation: "hwal-lyong" },
      { word: "도입", meaning: "Đưa vào / Áp dụng", level: "B2", pronunciation: "do-ip" },
      { word: "효과적", meaning: "Hiệu quả", level: "B1", pronunciation: "hyo-gwa-jeok" },
      { word: "미래", meaning: "Tương lai", level: "A2", pronunciation: "mi-rae" },
    ],
    content: `한국 교육부는 내년부터 전국 초중고등학교에 AI를 활용한 수업을 확대 도입한다고 발표했습니다.

AI 기반 학습 시스템은 학생 개개인의 학습 수준과 속도에 맞춰 맞춤형 교육을 제공합니다. 이를 통해 학습 효율을 높이고 교사의 업무 부담도 줄일 수 있을 것으로 기대됩니다.

교육부 관계자는 "AI 교육 도입으로 학생들이 미래 사회에 필요한 역량을 키울 수 있을 것"이라고 말했습니다.

일부 학교에서는 이미 AI 튜터 시스템을 시범 운영 중이며, 학생들의 반응이 매우 긍정적인 것으로 나타났습니다.

다만 AI 교육의 부작용에 대한 우려도 있어, 교사 연수와 함께 단계적으로 도입할 계획입니다.`,
    contentVi: `Bộ Giáo dục Hàn Quốc thông báo sẽ mở rộng áp dụng bài học ứng dụng AI tại các trường tiểu học, trung học cơ sở và trung học phổ thông trên toàn quốc từ năm tới.

Hệ thống học tập dựa trên AI cung cấp giáo dục cá nhân hóa phù hợp với trình độ và tốc độ học tập của từng học sinh. Qua đó, kỳ vọng sẽ nâng cao hiệu quả học tập và giảm gánh nặng công việc cho giáo viên.

Đại diện Bộ Giáo dục cho biết "Việc áp dụng giáo dục AI sẽ giúp học sinh phát triển năng lực cần thiết cho xã hội tương lai".

Một số trường học đã đang vận hành thử nghiệm hệ thống gia sư AI, và phản ứng của học sinh được cho là rất tích cực.

Tuy nhiên, cũng có lo ngại về tác dụng phụ của giáo dục AI, nên có kế hoạch áp dụng từng bước cùng với đào tạo giáo viên.`,
  },
];

const CATEGORIES = ["Tất cả", "경제", "사회", "문화", "날씨", "음식", "교육"];
const LEVELS = ["Tất cả", "A1", "A2", "B1", "B2"];

const levelColor: Record<string, string> = {
  A1: "bg-emerald-500/20 text-app-accent-success",
  A2: "bg-teal-500/20 text-teal-400",
  B1: "bg-amber-500/20 text-amber-400",
  B2: "bg-orange-500/20 text-orange-400",
};

const categoryColor: Record<string, string> = {
  경제: "bg-blue-500/15 text-blue-300",
  사회: "bg-purple-500/15 text-purple-300",
  문화: "bg-pink-500/15 text-pink-300",
  날씨: "bg-sky-500/15 text-sky-300",
  음식: "bg-orange-500/15 text-orange-300",
  교육: "bg-app-accent-success/15 text-emerald-300",
};

export default function KoreanNewsPage() {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [filterCat, setFilterCat] = useState("Tất cả");
  const [filterLevel, setFilterLevel] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [hoveredWord, setHoveredWord] = useState<VocabHighlight | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");

  const filtered = ARTICLES.filter(a => {
    if (filterCat !== "Tất cả" && a.category !== filterCat) return false;
    if (filterLevel !== "Tất cả" && a.level !== filterLevel) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.titleVi.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const playTTS = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR"; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const highlightContent = useCallback((text: string, vocab: VocabHighlight[]) => {
    const parts: { text: string; vocab?: VocabHighlight }[] = [];
    let remaining = text;
    const sortedVocab = [...vocab].sort((a, b) => b.word.length - a.word.length);

    while (remaining.length > 0) {
      let found = false;
      for (const v of sortedVocab) {
        const idx = remaining.indexOf(v.word);
        if (idx === 0) {
          parts.push({ text: v.word, vocab: v });
          remaining = remaining.slice(v.word.length);
          found = true;
          break;
        } else if (idx > 0) {
          parts.push({ text: remaining.slice(0, idx) });
          parts.push({ text: v.word, vocab: v });
          remaining = remaining.slice(idx + v.word.length);
          found = true;
          break;
        }
      }
      if (!found) {
        parts.push({ text: remaining });
        remaining = "";
      }
    }
    return parts;
  }, []);

  const fontSizeClass = { sm: "text-sm", base: "text-base", lg: "text-lg" }[fontSize];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Luyện Nghe Qua Tin Tức Hàn Quốc</h1>
            <p className="text-white/50 text-sm mt-1">Đọc báo Hàn với từ vựng được highlight và dịch song ngữ</p>
          </div>
          <div className="text-app-text-muted text-sm"><i className="ri-newspaper-line mr-1"></i>{ARTICLES.length} bài báo</div>
        </div>

        {selectedArticle ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors cursor-pointer text-sm">
                <i className="ri-arrow-left-line"></i>Quay lại
              </button>
              <div className="flex items-center gap-2">
                <span className="text-app-text-muted text-xs">Cỡ chữ:</span>
                {(["sm", "base", "lg"] as const).map(s => (
                  <button key={s} onClick={() => setFontSize(s)} className={`w-7 h-7 rounded-lg text-xs transition-all cursor-pointer ${fontSize === s ? "bg-app-accent-primary/20 text-app-accent-primary" : "bg-app-card/50 text-app-text-secondary"}`}>
                    {s === "sm" ? "A" : s === "base" ? "A" : "A"}
                  </button>
                ))}
                <button onClick={() => setShowTranslation(!showTranslation)} className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${showTranslation ? "bg-app-accent-primary/15 text-app-accent-primary" : "bg-app-card/50 text-app-text-secondary"}`}>
                  <i className="ri-translate-2 mr-1"></i>{showTranslation ? "Ẩn dịch" : "Hiện dịch"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Article */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-[#1a1f2e] rounded-2xl overflow-hidden border border-app-border">
                  <img loading="lazy" decoding="async" src={selectedArticle.thumbnail} alt={selectedArticle.title} className="w-full h-52 object-cover object-top" />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${levelColor[selectedArticle.level]}`}>{selectedArticle.level}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor[selectedArticle.category] || "bg-app-card/70 text-white/50"}`}>{selectedArticle.category}</span>
                      <span className="text-app-text-muted text-xs">{selectedArticle.source} · {selectedArticle.date}</span>
                    </div>
                    <div className="flex items-start gap-2 mb-1">
                      <h2 className={`text-white font-bold leading-snug flex-1 ${fontSizeClass}`}>{selectedArticle.title}</h2>
                      <button onClick={() => playTTS(selectedArticle.title)} className="text-app-text-muted hover:text-white/60 cursor-pointer flex-shrink-0 mt-0.5">
                        <i className="ri-volume-up-line"></i>
                      </button>
                    </div>
                    {showTranslation && <p className="text-app-text-secondary text-sm italic mb-4">{selectedArticle.titleVi}</p>}

                    <div className="border-t border-app-border pt-4 mt-4">
                      {/* Highlighted content */}
                      <div className={`${fontSizeClass} leading-relaxed text-white/80 whitespace-pre-line relative`}>
                        {highlightContent(selectedArticle.content, selectedArticle.vocab).map((part, i) =>
                          part.vocab ? (
                            <span
                              key={i}
                              className="relative inline cursor-pointer"
                              onMouseEnter={() => setHoveredWord(part.vocab!)}
                              onMouseLeave={() => setHoveredWord(null)}
                            >
                              <span className={`border-b-2 border-dashed transition-colors ${savedWords.has(part.vocab.word) ? "border-emerald-400 text-emerald-300" : "border-app-accent-primary/60 text-app-accent-primary"}`}>
                                {part.text}
                              </span>
                            </span>
                          ) : (
                            <span key={i}>{part.text}</span>
                          )
                        )}
                      </div>
                      {showTranslation && (
                        <div className={`mt-4 pt-4 border-t border-app-border ${fontSizeClass} leading-relaxed text-app-text-secondary italic whitespace-pre-line`}>
                          {selectedArticle.contentVi}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Hovered word tooltip */}
                {hoveredWord && (
                  <div className="bg-app-accent-primary/10 border border-app-accent-primary/25 rounded-xl p-4 animate-pulse-once">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-app-accent-primary font-bold text-lg">{hoveredWord.word}</p>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => playTTS(hoveredWord.word)} className="text-app-text-secondary hover:text-white/70 cursor-pointer">
                          <i className="ri-volume-up-line text-sm"></i>
                        </button>
                        <button onClick={() => setSavedWords(prev => { const n = new Set(prev); n.has(hoveredWord.word) ? n.delete(hoveredWord.word) : n.add(hoveredWord.word); return n; })} className={`cursor-pointer ${savedWords.has(hoveredWord.word) ? "text-app-accent-success" : "text-app-text-muted hover:text-white/60"}`}>
                          <i className={`${savedWords.has(hoveredWord.word) ? "ri-bookmark-fill" : "ri-bookmark-line"} text-sm`}></i>
                        </button>
                      </div>
                    </div>
                    <p className="text-white/50 text-xs mb-1">{hoveredWord.pronunciation}</p>
                    <p className="text-white/80 text-sm">{hoveredWord.meaning}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full mt-1 inline-block ${levelColor[hoveredWord.level]}`}>{hoveredWord.level}</span>
                  </div>
                )}

                {/* Vocab list */}
                <div className="bg-[#1a1f2e] rounded-xl border border-app-border overflow-hidden">
                  <div className="px-4 py-3 border-b border-app-border flex items-center justify-between">
                    <h3 className="text-white/70 text-sm font-semibold">Từ vựng trong bài</h3>
                    <span className="text-app-text-muted text-xs">{savedWords.size} đã lưu</span>
                  </div>
                  <div className="p-3 space-y-1.5">
                    {selectedArticle.vocab.map(v => (
                      <div key={v.word} className="flex items-center gap-3 p-2 rounded-lg hover:bg-app-card/50 transition-all group">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-app-accent-primary font-semibold text-sm">{v.word}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${levelColor[v.level]}`}>{v.level}</span>
                          </div>
                          <p className="text-app-text-secondary text-xs">{v.pronunciation} · {v.meaning}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => playTTS(v.word)} className="text-app-text-muted hover:text-white/60 cursor-pointer">
                            <i className="ri-volume-up-line text-xs"></i>
                          </button>
                          <button onClick={() => setSavedWords(prev => { const n = new Set(prev); n.has(v.word) ? n.delete(v.word) : n.add(v.word); return n; })} className={`cursor-pointer ${savedWords.has(v.word) ? "text-app-accent-success" : "text-app-text-muted hover:text-white/60"}`}>
                            <i className={`${savedWords.has(v.word) ? "ri-bookmark-fill" : "ri-bookmark-line"} text-xs`}></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1a1f2e] rounded-xl p-4 border border-app-border">
                  <h3 className="text-white/70 text-sm font-semibold mb-2">Hướng dẫn đọc</h3>
                  <ul className="space-y-1.5 text-app-text-secondary text-xs">
                    <li className="flex items-start gap-1.5"><i className="ri-checkbox-circle-line text-app-accent-primary mt-0.5 flex-shrink-0"></i>Di chuột vào từ màu vàng để xem nghĩa</li>
                    <li className="flex items-start gap-1.5"><i className="ri-checkbox-circle-line text-app-accent-primary mt-0.5 flex-shrink-0"></i>Nhấn 🔖 để lưu từ vựng</li>
                    <li className="flex items-start gap-1.5"><i className="ri-checkbox-circle-line text-app-accent-primary mt-0.5 flex-shrink-0"></i>Nhấn 🔊 để nghe phát âm</li>
                    <li className="flex items-start gap-1.5"><i className="ri-checkbox-circle-line text-app-accent-primary mt-0.5 flex-shrink-0"></i>Bật "Hiện dịch" để xem bản dịch tiếng Việt</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-app-border space-y-3">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
                <input type="text" placeholder="Tìm kiếm bài báo..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-app-card/50 border border-app-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-app-accent-primary/40" />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-app-text-muted text-xs">Chủ đề:</span>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setFilterCat(c)} className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${filterCat === c ? "bg-app-accent-primary/20 text-app-accent-primary font-semibold" : "bg-app-card/50 text-app-text-secondary hover:bg-app-card/70"}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-app-text-muted text-xs">Cấp độ:</span>
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => setFilterLevel(l)} className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${filterLevel === l ? "bg-app-accent-primary/20 text-app-accent-primary font-semibold" : "bg-app-card/50 text-app-text-secondary hover:bg-app-card/70"}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(article => (
                <div key={article.id} onClick={() => setSelectedArticle(article)} className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-app-border hover:border-white/20 transition-all cursor-pointer group">
                  <div className="relative">
                    <img loading="lazy" decoding="async" src={article.thumbnail} alt={article.title} className="w-full h-44 object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${levelColor[article.level]}`}>{article.level}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor[article.category] || "bg-app-border/200 text-white/70"}`}>{article.category}</span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white/70 text-xs px-2 py-0.5 rounded"><i className="ri-time-line mr-0.5"></i>{article.readTime}</div>
                  </div>
                  <div className="p-4">
                    <p className="text-app-accent-primary text-xs font-semibold mb-0.5">{article.source} · {article.date}</p>
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{article.title}</h3>
                    <p className="text-app-text-secondary text-xs line-clamp-1 mb-3 italic">{article.titleVi}</p>
                    <div className="flex items-center justify-between text-app-text-muted text-xs">
                      <span><i className="ri-eye-line mr-1"></i>{(article.views / 1000).toFixed(0)}K lượt xem</span>
                      <span><i className="ri-translate-2 mr-1"></i>{article.vocab.length} từ vựng</span>
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
