import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface TranscriptLine {
  time: number;
  speaker?: string;
  korean: string;
  vietnamese: string;
  highlight?: string[];
}

interface ListeningTrack {
  id: number;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  title: string;
  titleVi: string;
  topic: string;
  duration: string;
  durationSec: number;
  description: string;
  transcript: TranscriptLine[];
  vocab: { word: string; meaning: string; note?: string }[];
}

const TRACKS: ListeningTrack[] = [
  {
    id: 1, level: "A1", title: "자기소개", titleVi: "Tự giới thiệu", topic: "Giao tiếp cơ bản",
    duration: "1:20", durationSec: 80,
    description: "Hai người gặp nhau lần đầu và tự giới thiệu bản thân.",
    transcript: [
      { time: 0, speaker: "민준", korean: "안녕하세요! 저는 민준이에요.", vietnamese: "Xin chào! Tôi là Minjun.", highlight: ["안녕하세요", "저는"] },
      { time: 6, speaker: "수아", korean: "안녕하세요! 저는 수아예요. 만나서 반가워요.", vietnamese: "Xin chào! Tôi là Sua. Rất vui được gặp bạn.", highlight: ["만나서 반가워요"] },
      { time: 13, speaker: "민준", korean: "수아 씨는 어디에서 왔어요?", vietnamese: "Bạn Sua đến từ đâu vậy?", highlight: ["어디에서"] },
      { time: 18, speaker: "수아", korean: "저는 서울에서 왔어요. 민준 씨는요?", vietnamese: "Tôi đến từ Seoul. Còn bạn Minjun?", highlight: ["서울"] },
      { time: 24, speaker: "민준", korean: "저는 부산에서 왔어요. 지금은 서울에 살아요.", vietnamese: "Tôi đến từ Busan. Bây giờ sống ở Seoul.", highlight: ["부산", "살아요"] },
      { time: 32, speaker: "수아", korean: "아, 그래요? 저도 서울에 살아요!", vietnamese: "Ồ, vậy à? Tôi cũng sống ở Seoul!", highlight: ["저도"] },
      { time: 38, speaker: "민준", korean: "수아 씨는 학생이에요?", vietnamese: "Bạn Sua là học sinh à?", highlight: ["학생"] },
      { time: 43, speaker: "수아", korean: "네, 대학교 2학년이에요. 민준 씨는요?", vietnamese: "Vâng, tôi là sinh viên năm 2. Còn bạn?", highlight: ["대학교"] },
      { time: 50, speaker: "민준", korean: "저는 회사원이에요. IT 회사에서 일해요.", vietnamese: "Tôi là nhân viên công ty. Làm việc ở công ty IT.", highlight: ["회사원", "일해요"] },
    ],
    vocab: [
      { word: "자기소개", meaning: "Tự giới thiệu" },
      { word: "만나서 반가워요", meaning: "Rất vui được gặp bạn" },
      { word: "어디에서 왔어요", meaning: "Đến từ đâu?" },
      { word: "살아요", meaning: "Sống (ở đâu đó)" },
      { word: "회사원", meaning: "Nhân viên công ty" },
    ],
  },
  {
    id: 2, level: "A2", title: "카페에서 주문하기", titleVi: "Gọi đồ ở quán cà phê", topic: "Mua sắm & Ăn uống",
    duration: "1:45", durationSec: 105,
    description: "Khách hàng gọi đồ uống tại quán cà phê.",
    transcript: [
      { time: 0, speaker: "직원", korean: "어서 오세요! 주문하시겠어요?", vietnamese: "Chào mừng! Bạn muốn gọi gì ạ?", highlight: ["주문하시겠어요"] },
      { time: 6, speaker: "손님", korean: "아메리카노 한 잔이랑 카페라떼 한 잔 주세요.", vietnamese: "Cho tôi một ly Americano và một ly Cafe Latte.", highlight: ["한 잔", "주세요"] },
      { time: 14, speaker: "직원", korean: "아이스로 드릴까요, 따뜻하게 드릴까요?", vietnamese: "Bạn muốn uống lạnh hay nóng ạ?", highlight: ["아이스", "따뜻하게"] },
      { time: 20, speaker: "손님", korean: "아메리카노는 아이스로, 카페라떼는 따뜻하게 주세요.", vietnamese: "Americano thì lạnh, Cafe Latte thì nóng ạ.", highlight: [] },
      { time: 28, speaker: "직원", korean: "사이즈는 어떻게 해드릴까요? 스몰, 미디엄, 라지 있어요.", vietnamese: "Size thế nào ạ? Có small, medium, large.", highlight: ["사이즈"] },
      { time: 36, speaker: "손님", korean: "둘 다 미디엄으로 주세요.", vietnamese: "Cả hai medium nhé.", highlight: ["둘 다"] },
      { time: 41, speaker: "직원", korean: "총 9,500원입니다. 카드 되세요?", vietnamese: "Tổng cộng 9,500 won. Bạn trả thẻ được không?", highlight: ["총", "카드"] },
      { time: 48, speaker: "손님", korean: "네, 카드로 할게요.", vietnamese: "Vâng, tôi trả thẻ.", highlight: [] },
      { time: 53, speaker: "직원", korean: "잠시만 기다려 주세요. 5분 정도 걸려요.", vietnamese: "Vui lòng đợi một chút. Khoảng 5 phút.", highlight: ["잠시만", "기다려"] },
    ],
    vocab: [
      { word: "주문하다", meaning: "Gọi món/Đặt hàng" },
      { word: "아이스", meaning: "Đá lạnh (ice)" },
      { word: "따뜻하게", meaning: "Nóng/Ấm" },
      { word: "사이즈", meaning: "Kích cỡ (size)" },
      { word: "총", meaning: "Tổng cộng" },
      { word: "잠시만 기다려 주세요", meaning: "Vui lòng đợi một chút" },
    ],
  },
  {
    id: 3, level: "B1", title: "여행 계획 세우기", titleVi: "Lên kế hoạch du lịch", topic: "Du lịch",
    duration: "2:30", durationSec: 150,
    description: "Hai người bạn thảo luận về kế hoạch du lịch Jeju.",
    transcript: [
      { time: 0, speaker: "지호", korean: "이번 여름 방학에 제주도 여행 어때? 같이 가자!", vietnamese: "Kỳ nghỉ hè này đi du lịch Jeju thế nào? Cùng đi nhé!", highlight: ["여름 방학", "제주도"] },
      { time: 8, speaker: "나연", korean: "좋아! 언제 가면 좋을까? 7월이 어때?", vietnamese: "Hay đấy! Đi khi nào thì tốt nhỉ? Tháng 7 thế nào?", highlight: ["언제"] },
      { time: 15, speaker: "지호", korean: "7월은 성수기라서 숙박비가 비쌀 것 같아. 8월 초는 어때?", vietnamese: "Tháng 7 là mùa cao điểm nên tiền phòng có vẻ đắt. Đầu tháng 8 thế nào?", highlight: ["성수기", "숙박비"] },
      { time: 25, speaker: "나연", korean: "그래, 8월 초가 낫겠다. 며칠 동안 갈 거야?", vietnamese: "Ừ, đầu tháng 8 thì tốt hơn. Đi mấy ngày?", highlight: ["며칠 동안"] },
      { time: 33, speaker: "지호", korean: "3박 4일 정도면 충분할 것 같아. 주요 관광지는 다 볼 수 있어.", vietnamese: "3 đêm 4 ngày là đủ rồi. Có thể xem hết các điểm du lịch chính.", highlight: ["3박 4일", "관광지"] },
      { time: 43, speaker: "나연", korean: "숙소는 어디로 할까? 호텔이 좋을까, 게스트하우스가 좋을까?", vietnamese: "Chỗ ở thì chọn đâu? Khách sạn hay nhà khách?", highlight: ["숙소", "게스트하우스"] },
      { time: 52, speaker: "지호", korean: "게스트하우스가 더 저렴하고 현지 분위기도 느낄 수 있어서 좋을 것 같아.", vietnamese: "Nhà khách rẻ hơn và có thể cảm nhận không khí địa phương nên có vẻ tốt hơn.", highlight: ["저렴하다", "현지 분위기"] },
      { time: 63, speaker: "나연", korean: "맞아. 그리고 렌터카도 빌려야 할 것 같아. 제주도는 대중교통이 불편하거든.", vietnamese: "Đúng rồi. Và có lẽ cần thuê xe nữa. Jeju giao thông công cộng bất tiện lắm.", highlight: ["렌터카", "대중교통"] },
    ],
    vocab: [
      { word: "성수기", meaning: "Mùa cao điểm" },
      { word: "숙박비", meaning: "Tiền phòng/Tiền lưu trú" },
      { word: "3박 4일", meaning: "3 đêm 4 ngày" },
      { word: "관광지", meaning: "Điểm du lịch" },
      { word: "게스트하우스", meaning: "Nhà khách (guesthouse)" },
      { word: "렌터카", meaning: "Xe thuê (rental car)" },
      { word: "대중교통", meaning: "Giao thông công cộng" },
    ],
  },
  {
    id: 4, level: "B2", title: "취업 면접", titleVi: "Phỏng vấn xin việc", topic: "Công việc",
    duration: "3:00", durationSec: 180,
    description: "Buổi phỏng vấn xin việc tại một công ty Hàn Quốc.",
    transcript: [
      { time: 0, speaker: "면접관", korean: "안녕하세요. 자기소개를 간단히 해주시겠어요?", vietnamese: "Xin chào. Bạn có thể tự giới thiệu ngắn gọn không?", highlight: ["자기소개", "간단히"] },
      { time: 8, speaker: "지원자", korean: "안녕하세요. 저는 김민수라고 합니다. 한국대학교에서 컴퓨터공학을 전공했습니다.", vietnamese: "Xin chào. Tôi tên là Kim Minsu. Tôi đã học chuyên ngành Khoa học máy tính tại Đại học Hàn Quốc.", highlight: ["전공했습니다"] },
      { time: 18, speaker: "면접관", korean: "지원 동기가 무엇인가요?", vietnamese: "Động lực ứng tuyển của bạn là gì?", highlight: ["지원 동기"] },
      { time: 23, speaker: "지원자", korean: "귀사의 혁신적인 기술 개발 방향에 깊이 공감하며, 제 역량을 발휘할 수 있는 최적의 환경이라고 생각했습니다.", vietnamese: "Tôi đồng cảm sâu sắc với định hướng phát triển công nghệ đổi mới của quý công ty và nghĩ đây là môi trường tốt nhất để phát huy năng lực của mình.", highlight: ["혁신적", "역량", "발휘"] },
      { time: 36, speaker: "면접관", korean: "본인의 강점과 약점을 말씀해 주세요.", vietnamese: "Hãy nói về điểm mạnh và điểm yếu của bạn.", highlight: ["강점", "약점"] },
      { time: 43, speaker: "지원자", korean: "저의 강점은 문제 해결 능력입니다. 복잡한 문제를 체계적으로 분석하고 해결책을 찾는 것을 즐깁니다.", vietnamese: "Điểm mạnh của tôi là khả năng giải quyết vấn đề. Tôi thích phân tích có hệ thống các vấn đề phức tạp và tìm ra giải pháp.", highlight: ["문제 해결 능력", "체계적"] },
      { time: 56, speaker: "면접관", korean: "5년 후 본인의 모습은 어떻게 생각하시나요?", vietnamese: "Bạn nghĩ bản thân sẽ như thế nào sau 5 năm?", highlight: ["5년 후"] },
    ],
    vocab: [
      { word: "지원 동기", meaning: "Động lực ứng tuyển" },
      { word: "혁신적", meaning: "Đổi mới/Cách mạng" },
      { word: "역량을 발휘하다", meaning: "Phát huy năng lực" },
      { word: "강점/약점", meaning: "Điểm mạnh/Điểm yếu" },
      { word: "문제 해결 능력", meaning: "Khả năng giải quyết vấn đề" },
      { word: "체계적", meaning: "Có hệ thống/Có tổ chức" },
    ],
  },
  {
    id: 5, level: "C1", title: "환경 문제 토론", titleVi: "Thảo luận về vấn đề môi trường", topic: "Xã hội & Môi trường",
    duration: "3:30", durationSec: 210,
    description: "Chương trình thảo luận về biến đổi khí hậu và giải pháp.",
    transcript: [
      { time: 0, speaker: "진행자", korean: "오늘은 기후 변화와 탄소 중립에 대해 이야기해 보겠습니다.", vietnamese: "Hôm nay chúng ta sẽ nói về biến đổi khí hậu và trung hòa carbon.", highlight: ["기후 변화", "탄소 중립"] },
      { time: 10, speaker: "전문가A", korean: "현재 지구 온난화 속도는 산업화 이전 대비 1.1도 상승했으며, 이 추세가 지속된다면 2050년까지 심각한 결과를 초래할 것입니다.", vietnamese: "Tốc độ nóng lên toàn cầu hiện tại đã tăng 1,1 độ so với thời kỳ tiền công nghiệp, và nếu xu hướng này tiếp tục, sẽ gây ra hậu quả nghiêm trọng đến năm 2050.", highlight: ["지구 온난화", "산업화", "추세"] },
      { time: 28, speaker: "전문가B", korean: "재생 에너지로의 전환이 시급합니다. 태양광과 풍력 발전의 비용이 급격히 낮아지고 있어 경제적으로도 실현 가능합니다.", vietnamese: "Việc chuyển đổi sang năng lượng tái tạo là cấp bách. Chi phí điện mặt trời và điện gió đang giảm mạnh nên cũng khả thi về mặt kinh tế.", highlight: ["재생 에너지", "태양광", "풍력"] },
      { time: 45, speaker: "진행자", korean: "개인 차원에서 할 수 있는 실천 방안은 무엇이 있을까요?", vietnamese: "Ở cấp độ cá nhân, có những biện pháp thực tiễn nào có thể làm?", highlight: ["실천 방안"] },
      { time: 54, speaker: "전문가A", korean: "탄소 발자국을 줄이는 것이 중요합니다. 대중교통 이용, 채식 위주의 식단, 에너지 절약 등이 효과적입니다.", vietnamese: "Giảm dấu chân carbon là quan trọng. Sử dụng giao thông công cộng, chế độ ăn chủ yếu rau củ, tiết kiệm năng lượng đều hiệu quả.", highlight: ["탄소 발자국", "채식"] },
    ],
    vocab: [
      { word: "기후 변화", meaning: "Biến đổi khí hậu" },
      { word: "탄소 중립", meaning: "Trung hòa carbon" },
      { word: "지구 온난화", meaning: "Nóng lên toàn cầu" },
      { word: "재생 에너지", meaning: "Năng lượng tái tạo" },
      { word: "탄소 발자국", meaning: "Dấu chân carbon" },
      { word: "실천 방안", meaning: "Biện pháp thực tiễn" },
    ],
  },
  {
    id: 6, level: "C2", title: "철학적 토론: 자유의지", titleVi: "Thảo luận triết học: Ý chí tự do", topic: "Triết học & Học thuật",
    duration: "4:00", durationSec: 240,
    description: "Cuộc tranh luận học thuật về ý chí tự do và thuyết tất định.",
    transcript: [
      { time: 0, speaker: "교수A", korean: "자유의지와 결정론의 양립 가능성에 대한 논쟁은 철학사에서 오랫동안 지속되어 왔습니다.", vietnamese: "Cuộc tranh luận về khả năng tương thích của ý chí tự do và thuyết tất định đã kéo dài trong lịch sử triết học.", highlight: ["자유의지", "결정론", "양립"] },
      { time: 14, speaker: "교수B", korean: "양립론자들은 자유의지가 인과적 결정론과 모순되지 않는다고 주장합니다. 행위자가 자신의 욕구에 따라 행동할 수 있다면 그것으로 충분하다는 것이죠.", vietnamese: "Những người theo thuyết tương thích cho rằng ý chí tự do không mâu thuẫn với thuyết nhân quả tất định. Nếu chủ thể có thể hành động theo mong muốn của mình thì đã đủ.", highlight: ["양립론자", "인과적", "욕구"] },
      { time: 32, speaker: "교수A", korean: "그러나 강경한 결정론자들은 모든 사건이 선행 원인에 의해 필연적으로 결정된다면, 진정한 의미의 자유는 환상에 불과하다고 반박합니다.", vietnamese: "Tuy nhiên, những người theo thuyết tất định cứng nhắc phản bác rằng nếu mọi sự kiện đều được quyết định tất yếu bởi nguyên nhân tiền đề, thì tự do theo nghĩa thực sự chỉ là ảo tưởng.", highlight: ["결정론자", "필연적", "환상"] },
      { time: 50, speaker: "교수B", korean: "신경과학의 발전은 이 논쟁에 새로운 차원을 더했습니다. 리벳의 실험은 의식적 결정 이전에 뇌 활동이 선행한다는 것을 보여주었죠.", vietnamese: "Sự phát triển của khoa học thần kinh đã thêm chiều kích mới vào cuộc tranh luận này. Thí nghiệm của Libet cho thấy hoạt động não xảy ra trước quyết định có ý thức.", highlight: ["신경과학", "의식적 결정"] },
    ],
    vocab: [
      { word: "자유의지", meaning: "Ý chí tự do" },
      { word: "결정론", meaning: "Thuyết tất định" },
      { word: "양립 가능성", meaning: "Khả năng tương thích" },
      { word: "인과적", meaning: "Nhân quả" },
      { word: "신경과학", meaning: "Khoa học thần kinh" },
      { word: "의식적 결정", meaning: "Quyết định có ý thức" },
    ],
  },
];

const LEVEL_CONFIG: Record<string, { color: string; bg: string; border: string; badge: string; label: string }> = {
  A1: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-500", label: "Sơ cấp 1" },
  A2: { color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", badge: "bg-teal-500", label: "Sơ cấp 2" },
  B1: { color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200", badge: "bg-sky-500", label: "Trung cấp 1" },
  B2: { color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-500", label: "Trung cấp 2" },
  C1: { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-500", label: "Cao cấp 1" },
  C2: { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-500", label: "Cao cấp 2" },
};

export default function ListeningByLevelPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedTrack, setSelectedTrack] = useState<ListeningTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showVietnamese, setShowVietnamese] = useState(true);
  const [activeTab, setActiveTab] = useState<"transcript" | "vocab">("transcript");
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [completedTracks, setCompletedTracks] = useState<Set<number>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredTracks = selectedLevel === "all"
    ? TRACKS
    : TRACKS.filter(t => t.level === selectedLevel);

  const currentLine = selectedTrack?.transcript.findLast(l => l.time <= currentTime);

  const togglePlay = () => {
    if (!selectedTrack) return;
    if (isPlaying) {
      clearInterval(intervalRef.current!);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        setCurrentTime(t => {
          const next = t + 1;
          if (next >= selectedTrack.durationSec) {
            clearInterval(intervalRef.current!);
            setIsPlaying(false);
            setCompletedTracks(prev => new Set([...prev, selectedTrack.id]));
            return selectedTrack.durationSec;
          }
          return next;
        });
      }, 1000);
    }
  };

  const seek = (sec: number) => {
    setCurrentTime(Math.max(0, Math.min(sec, selectedTrack?.durationSec || 0)));
  };

  const rewind = () => seek(currentTime - 10);
  const forward = () => seek(currentTime + 10);

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR"; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const toggleSave = (word: string) => {
    setSavedWords(prev => {
      const n = new Set(prev);
      n.has(word) ? n.delete(word) : n.add(word);
      return n;
    });
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current!);
  }, []);

  useEffect(() => {
    clearInterval(intervalRef.current!);
    setIsPlaying(false);
    setCurrentTime(0);
  }, [selectedTrack]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const progress = selectedTrack ? (currentTime / selectedTrack.durationSec) * 100 : 0;

  const cfg = selectedTrack ? LEVEL_CONFIG[selectedTrack.level] : null;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8f7f4] p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-sky-500/10 rounded-xl">
            <i className="ri-headphone-line text-sky-500 text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Luyện nghe theo cấp độ
            </h1>
            <p className="text-gray-500 text-sm">Bài nghe từ A1 đến C2 với transcript song ngữ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Track list */}
          <div className="lg:col-span-1 space-y-4">
            {/* Level filter */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Cấp độ</p>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => setSelectedLevel("all")}
                  className={`py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${selectedLevel === "all" ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                >
                  Tất cả
                </button>
                {Object.entries(LEVEL_CONFIG).map(([lvl, c]) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-all ${selectedLevel === lvl ? `${c.badge} text-white` : `${c.bg} ${c.color}`}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Track list */}
            <div className="space-y-2">
              {filteredTracks.map(track => {
                const c = LEVEL_CONFIG[track.level];
                const isSelected = selectedTrack?.id === track.id;
                const isDone = completedTracks.has(track.id);
                return (
                  <button
                    key={track.id}
                    onClick={() => setSelectedTrack(track)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected ? `${c.bg} ${c.border}` : "bg-white border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${c.badge} text-white text-xs font-bold`}>
                        {track.level}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800 truncate">{track.titleVi}</p>
                          {isDone && <i className="ri-checkbox-circle-fill text-emerald-500 text-sm flex-shrink-0"></i>}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{track.topic}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <i className="ri-time-line text-gray-300 text-xs"></i>
                          <span className="text-xs text-gray-400">{track.duration}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tiến độ</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-800">{completedTracks.size}/{TRACKS.length}</p>
                  <p className="text-xs text-gray-500">Đã hoàn thành</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-sky-500">{savedWords.size}</p>
                  <p className="text-xs text-gray-500">Từ đã lưu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Player + Transcript */}
          <div className="lg:col-span-2">
            {!selectedTrack ? (
              <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center h-80">
                <div className="text-center text-gray-400">
                  <i className="ri-headphone-line text-5xl mb-3 block"></i>
                  <p className="font-medium">Chọn bài nghe để bắt đầu</p>
                  <p className="text-sm mt-1">6 bài từ A1 đến C2</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Player card */}
                <div className={`rounded-2xl border-2 p-5 ${cfg?.bg} ${cfg?.border}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg?.badge} text-white`}>{selectedTrack.level}</span>
                        <span className={`text-xs ${cfg?.color}`}>{LEVEL_CONFIG[selectedTrack.level].label}</span>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">{selectedTrack.titleVi}</h2>
                      <p className="text-sm text-gray-500">{selectedTrack.title} · {selectedTrack.topic}</p>
                    </div>
                    <button
                      onClick={() => setShowVietnamese(v => !v)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${showVietnamese ? `${cfg?.badge} text-white` : "bg-white/70 text-gray-500"}`}
                    >
                      <i className="ri-translate-2"></i>
                      Dịch
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="h-2 bg-white/50 rounded-full mb-3 cursor-pointer"
                    onClick={e => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = (e.clientX - rect.left) / rect.width;
                      seek(Math.floor(pct * selectedTrack.durationSec));
                    }}
                  >
                    <div className={`h-full rounded-full transition-all ${cfg?.badge}`} style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{formatTime(currentTime)}</span>
                    <span>{selectedTrack.duration}</span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={rewind} className="w-10 h-10 flex items-center justify-center bg-white/70 hover:bg-white rounded-full cursor-pointer transition-all">
                      <i className="ri-replay-10-line text-gray-600"></i>
                    </button>
                    <button
                      onClick={togglePlay}
                      className={`w-14 h-14 flex items-center justify-center rounded-full cursor-pointer transition-all shadow-sm ${cfg?.badge} text-white hover:opacity-90`}
                    >
                      <i className={`${isPlaying ? "ri-pause-fill" : "ri-play-fill"} text-2xl`}></i>
                    </button>
                    <button onClick={forward} className="w-10 h-10 flex items-center justify-center bg-white/70 hover:bg-white rounded-full cursor-pointer transition-all">
                      <i className="ri-forward-10-line text-gray-600"></i>
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="flex border-b border-gray-100">
                    {(["transcript", "vocab"] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors ${activeTab === tab ? `${cfg?.color} border-b-2 ${cfg?.border.replace("border-", "border-b-")}` : "text-gray-400 hover:text-gray-600"}`}
                      >
                        {tab === "transcript" ? "Transcript" : `Từ vựng (${selectedTrack.vocab.length})`}
                      </button>
                    ))}
                  </div>

                  {activeTab === "transcript" ? (
                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                      {selectedTrack.transcript.map((line, i) => {
                        const isActive = currentLine === line;
                        return (
                          <div
                            key={i}
                            onClick={() => seek(line.time)}
                            className={`p-3 rounded-xl cursor-pointer transition-all ${isActive ? `${cfg?.bg} ${cfg?.border} border` : "hover:bg-gray-50"}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 text-right">
                                <span className="text-[10px] text-gray-400">{formatTime(line.time)}</span>
                                {line.speaker && <p className={`text-[10px] font-bold mt-0.5 ${isActive ? cfg?.color : "text-gray-400"}`}>{line.speaker}</p>}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start gap-2">
                                  <p className={`text-sm font-medium leading-relaxed flex-1 ${isActive ? "text-gray-900" : "text-gray-700"}`}>
                                    {line.korean}
                                  </p>
                                  <button
                                    onClick={e => { e.stopPropagation(); speak(line.korean); }}
                                    className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-sky-500 cursor-pointer flex-shrink-0"
                                  >
                                    <i className="ri-volume-up-line text-sm"></i>
                                  </button>
                                </div>
                                {showVietnamese && (
                                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{line.vietnamese}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 space-y-2">
                      {selectedTrack.vocab.map((v, i) => {
                        const isSaved = savedWords.has(v.word);
                        return (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <button onClick={() => speak(v.word)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-sky-500 cursor-pointer">
                                <i className="ri-volume-up-line text-sm"></i>
                              </button>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{v.word}</p>
                                <p className="text-xs text-gray-500">{v.meaning}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleSave(v.word)}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-all ${isSaved ? `${cfg?.bg} ${cfg?.color}` : "text-gray-300 hover:text-gray-500"}`}
                            >
                              <i className={`${isSaved ? "ri-bookmark-fill" : "ri-bookmark-line"} text-sm`}></i>
                            </button>
                          </div>
                        );
                      })}
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
