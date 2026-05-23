import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface TranscriptLine {
  time: number;
  korean: string;
  vietnamese: string;
  vocab?: { word: string; meaning: string }[];
}

interface Podcast {
  id: string;
  title: string;
  host: string;
  description: string;
  duration: string;
  durationSec: number;
  level: string;
  topic: string;
  thumbnail: string;
  audioUrl: string;
  transcript: TranscriptLine[];
  tags: string[];
  plays: number;
  isPremium: boolean;
}

const PODCASTS: Podcast[] = [
  {
    id: "p1",
    title: "Chào hỏi và giới thiệu bản thân",
    host: "Kim Minji",
    description: "Học cách chào hỏi và giới thiệu bản thân trong tiếng Hàn một cách tự nhiên nhất.",
    duration: "8:32",
    durationSec: 512,
    level: "A1",
    topic: "Giao tiếp",
    thumbnail: "/images/brand/logo.svg",
    audioUrl: "",
    plays: 45200,
    isPremium: false,
    tags: ["chào hỏi", "giới thiệu", "A1"],
    transcript: [
      { time: 0, korean: "안녕하세요! 오늘도 한국어 팟캐스트에 오신 것을 환영합니다.", vietnamese: "Xin chào! Chào mừng bạn đến với podcast tiếng Hàn hôm nay.", vocab: [{ word: "환영합니다", meaning: "Chào mừng" }] },
      { time: 8, korean: "오늘은 자기소개에 대해 배워볼게요.", vietnamese: "Hôm nay chúng ta sẽ học về cách tự giới thiệu.", vocab: [{ word: "자기소개", meaning: "Tự giới thiệu" }] },
      { time: 16, korean: "먼저, 이름을 말하는 방법이에요.", vietnamese: "Đầu tiên, đây là cách nói tên của bạn.", vocab: [{ word: "이름", meaning: "Tên" }] },
      { time: 24, korean: "저는 [이름]이에요. 또는 제 이름은 [이름]이에요.", vietnamese: "Tôi là [tên]. Hoặc tên tôi là [tên].", vocab: [{ word: "저는", meaning: "Tôi là" }] },
      { time: 35, korean: "다음은 나라를 말하는 방법이에요.", vietnamese: "Tiếp theo là cách nói quốc gia của bạn.", vocab: [{ word: "나라", meaning: "Quốc gia" }] },
      { time: 44, korean: "저는 베트남에서 왔어요. 저는 베트남 사람이에요.", vietnamese: "Tôi đến từ Việt Nam. Tôi là người Việt Nam.", vocab: [{ word: "베트남", meaning: "Việt Nam" }] },
      { time: 55, korean: "나이를 말할 때는 이렇게 해요.", vietnamese: "Khi nói tuổi, bạn nói như thế này.", vocab: [{ word: "나이", meaning: "Tuổi" }] },
      { time: 63, korean: "저는 [나이]살이에요. 또는 저는 [나이]세예요.", vietnamese: "Tôi [tuổi] tuổi. Hoặc tôi [tuổi] tuổi (lịch sự).", vocab: [{ word: "살", meaning: "Tuổi (thông thường)" }] },
      { time: 75, korean: "직업을 말할 때는 저는 [직업]이에요/예요.", vietnamese: "Khi nói nghề nghiệp: Tôi là [nghề nghiệp].", vocab: [{ word: "직업", meaning: "Nghề nghiệp" }] },
      { time: 88, korean: "오늘 배운 내용을 복습해 봐요!", vietnamese: "Hãy ôn lại những gì đã học hôm nay!", vocab: [{ word: "복습", meaning: "Ôn tập" }] },
    ],
  },
  {
    id: "p2",
    title: "Đặt hàng tại nhà hàng Hàn Quốc",
    host: "Park Junho",
    description: "Học cách gọi món, hỏi về thực đơn và thanh toán tại nhà hàng Hàn Quốc.",
    duration: "12:15",
    durationSec: 735,
    level: "A2",
    topic: "Ẩm thực",
    thumbnail: "/images/brand/logo.svg",
    audioUrl: "",
    plays: 38700,
    isPremium: false,
    tags: ["nhà hàng", "ẩm thực", "A2"],
    transcript: [
      { time: 0, korean: "안녕하세요! 오늘은 한국 식당에서 주문하는 방법을 배워볼게요.", vietnamese: "Xin chào! Hôm nay chúng ta học cách gọi món tại nhà hàng Hàn Quốc.", vocab: [{ word: "식당", meaning: "Nhà hàng" }] },
      { time: 10, korean: "식당에 들어가면 직원이 이렇게 말해요.", vietnamese: "Khi vào nhà hàng, nhân viên sẽ nói như thế này.", vocab: [{ word: "직원", meaning: "Nhân viên" }] },
      { time: 18, korean: "어서 오세요! 몇 분이세요?", vietnamese: "Xin chào! Bao nhiêu người ạ?", vocab: [{ word: "어서 오세요", meaning: "Xin chào (chào khách)" }] },
      { time: 26, korean: "두 명이요. 또는 세 명이요.", vietnamese: "Hai người. Hoặc ba người.", vocab: [{ word: "명", meaning: "Người (đếm)" }] },
      { time: 35, korean: "메뉴판을 받으면 이렇게 주문해요.", vietnamese: "Khi nhận thực đơn, bạn gọi món như thế này.", vocab: [{ word: "메뉴판", meaning: "Thực đơn" }] },
      { time: 44, korean: "이거 주세요. 또는 삼겹살 2인분 주세요.", vietnamese: "Cho tôi cái này. Hoặc cho tôi thịt ba chỉ 2 phần.", vocab: [{ word: "인분", meaning: "Phần (ăn)" }] },
      { time: 55, korean: "음식이 나오면 잘 먹겠습니다! 라고 해요.", vietnamese: "Khi thức ăn ra, nói 잘 먹겠습니다!", vocab: [{ word: "잘 먹겠습니다", meaning: "Xin phép ăn" }] },
      { time: 65, korean: "계산할 때는 계산해 주세요. 또는 얼마예요?", vietnamese: "Khi tính tiền: Tính tiền cho tôi. Hoặc bao nhiêu tiền?", vocab: [{ word: "계산", meaning: "Tính tiền" }] },
    ],
  },
  {
    id: "p3",
    title: "Hỏi đường và di chuyển ở Seoul",
    host: "Lee Soyeon",
    description: "Học cách hỏi đường, sử dụng tàu điện ngầm và xe buýt ở Seoul.",
    duration: "15:40",
    durationSec: 940,
    level: "B1",
    topic: "Giao thông",
    thumbnail: "/images/brand/logo.svg",
    audioUrl: "",
    plays: 29400,
    isPremium: false,
    tags: ["giao thông", "Seoul", "B1"],
    transcript: [
      { time: 0, korean: "안녕하세요! 오늘은 서울에서 길을 찾는 방법을 배워볼게요.", vietnamese: "Xin chào! Hôm nay học cách tìm đường ở Seoul.", vocab: [{ word: "서울", meaning: "Seoul" }] },
      { time: 10, korean: "먼저 지하철 이용 방법이에요.", vietnamese: "Đầu tiên là cách sử dụng tàu điện ngầm.", vocab: [{ word: "지하철", meaning: "Tàu điện ngầm" }] },
      { time: 20, korean: "지하철역이 어디예요? 라고 물어봐요.", vietnamese: "Hỏi: Ga tàu điện ngầm ở đâu?", vocab: [{ word: "역", meaning: "Nhà ga" }] },
      { time: 30, korean: "몇 호선을 타야 해요? 2호선을 타세요.", vietnamese: "Phải đi tuyến mấy? Đi tuyến số 2.", vocab: [{ word: "호선", meaning: "Tuyến (tàu)" }] },
      { time: 42, korean: "몇 정거장이에요? 세 정거장이에요.", vietnamese: "Mấy trạm? Ba trạm.", vocab: [{ word: "정거장", meaning: "Trạm dừng" }] },
      { time: 52, korean: "갈아타야 해요? 2호선에서 4호선으로 갈아타세요.", vietnamese: "Phải chuyển tuyến không? Chuyển từ tuyến 2 sang tuyến 4.", vocab: [{ word: "갈아타다", meaning: "Chuyển tuyến" }] },
      { time: 65, korean: "버스를 탈 때는 교통카드를 사용해요.", vietnamese: "Khi đi xe buýt, dùng thẻ giao thông.", vocab: [{ word: "교통카드", meaning: "Thẻ giao thông" }] },
    ],
  },
  {
    id: "p4",
    title: "Văn hóa Hàn Quốc - Chuseok và Seollal",
    host: "Choi Minjun",
    description: "Tìm hiểu về hai lễ hội lớn nhất Hàn Quốc: Chuseok (Tết Trung Thu) và Seollal (Tết Nguyên Đán).",
    duration: "18:20",
    durationSec: 1100,
    level: "B2",
    topic: "Văn hóa",
    thumbnail: "/images/brand/logo.svg",
    audioUrl: "",
    plays: 22100,
    isPremium: true,
    tags: ["văn hóa", "lễ hội", "B2"],
    transcript: [
      { time: 0, korean: "안녕하세요! 오늘은 한국의 대표적인 명절에 대해 이야기해 볼게요.", vietnamese: "Xin chào! Hôm nay nói về các lễ hội truyền thống tiêu biểu của Hàn Quốc.", vocab: [{ word: "명절", meaning: "Lễ hội truyền thống" }] },
      { time: 12, korean: "한국에는 두 가지 큰 명절이 있어요. 설날과 추석이에요.", vietnamese: "Hàn Quốc có hai lễ hội lớn: Seollal và Chuseok.", vocab: [{ word: "설날", meaning: "Tết Nguyên Đán Hàn Quốc" }] },
      { time: 25, korean: "설날은 음력 1월 1일이에요. 새해 첫날이에요.", vietnamese: "Seollal là ngày 1 tháng 1 âm lịch. Là ngày đầu năm mới.", vocab: [{ word: "음력", meaning: "Âm lịch" }] },
      { time: 38, korean: "설날에는 가족이 모여서 차례를 지내요.", vietnamese: "Vào Seollal, gia đình tụ họp và làm lễ cúng tổ tiên.", vocab: [{ word: "차례", meaning: "Lễ cúng tổ tiên" }] },
      { time: 50, korean: "추석은 음력 8월 15일이에요. 한국의 추수감사절이에요.", vietnamese: "Chuseok là ngày 15 tháng 8 âm lịch. Là lễ tạ ơn của Hàn Quốc.", vocab: [{ word: "추석", meaning: "Tết Trung Thu Hàn Quốc" }] },
    ],
  },
  {
    id: "p5",
    title: "Tiếng Hàn trong công sở",
    host: "Jung Hyewon",
    description: "Học từ vựng và cách giao tiếp chuyên nghiệp trong môi trường công sở Hàn Quốc.",
    duration: "22:05",
    durationSec: 1325,
    level: "B2",
    topic: "Công việc",
    thumbnail: "/images/brand/logo.svg",
    audioUrl: "",
    plays: 18900,
    isPremium: true,
    tags: ["công sở", "kinh doanh", "B2"],
    transcript: [
      { time: 0, korean: "안녕하세요! 오늘은 직장에서 쓰는 한국어를 배워볼게요.", vietnamese: "Xin chào! Hôm nay học tiếng Hàn dùng trong công sở.", vocab: [{ word: "직장", meaning: "Nơi làm việc" }] },
      { time: 12, korean: "한국 직장 문화에서 중요한 것은 존댓말이에요.", vietnamese: "Điều quan trọng trong văn hóa công sở Hàn Quốc là kính ngữ.", vocab: [{ word: "존댓말", meaning: "Kính ngữ" }] },
      { time: 25, korean: "상사에게는 항상 존댓말을 써야 해요.", vietnamese: "Phải luôn dùng kính ngữ với cấp trên.", vocab: [{ word: "상사", meaning: "Cấp trên" }] },
    ],
  },
  {
    id: "p6",
    title: "K-pop và tiếng Hàn - Học qua âm nhạc",
    host: "Kim Taehee",
    description: "Học tiếng Hàn qua các bài hát K-pop nổi tiếng, phân tích từ vựng và ngữ pháp.",
    duration: "25:30",
    durationSec: 1530,
    level: "A2",
    topic: "K-pop",
    thumbnail: "/images/brand/logo.svg",
    audioUrl: "",
    plays: 67800,
    isPremium: false,
    tags: ["K-pop", "âm nhạc", "A2"],
    transcript: [
      { time: 0, korean: "안녕하세요! 오늘은 K-pop으로 한국어를 배워볼게요!", vietnamese: "Xin chào! Hôm nay học tiếng Hàn qua K-pop!", vocab: [{ word: "K-pop", meaning: "Nhạc pop Hàn Quốc" }] },
      { time: 10, korean: "K-pop 가사에는 일상적인 한국어가 많이 나와요.", vietnamese: "Lời bài hát K-pop có nhiều tiếng Hàn thường ngày.", vocab: [{ word: "가사", meaning: "Lời bài hát" }] },
      { time: 22, korean: "예를 들어, '사랑해'는 'I love you'예요.", vietnamese: "Ví dụ, '사랑해' nghĩa là 'I love you'.", vocab: [{ word: "사랑해", meaning: "Tôi yêu bạn" }] },
      { time: 33, korean: "'보고 싶어'는 'I miss you'예요.", vietnamese: "'보고 싶어' nghĩa là 'I miss you'.", vocab: [{ word: "보고 싶어", meaning: "Tôi nhớ bạn" }] },
    ],
  },
];

const LEVELS = ["Tất cả", "A1", "A2", "B1", "B2"];
const TOPICS = ["Tất cả", "Giao tiếp", "Ẩm thực", "Giao thông", "Văn hóa", "Công việc", "K-pop"];

const levelColor: Record<string, string> = {
  A1: "bg-emerald-500/20 text-app-accent-success",
  A2: "bg-teal-500/20 text-teal-400",
  B1: "bg-amber-500/20 text-amber-400",
  B2: "bg-orange-500/20 text-orange-400",
};

export default function PodcastLearnPage() {
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeLineIdx, setActiveLineIdx] = useState(0);
  const [showTranslation, setShowTranslation] = useState(true);
  const [filterLevel, setFilterLevel] = useState("Tất cả");
  const [filterTopic, setFilterTopic] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [savedVocab, setSavedVocab] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const filtered = PODCASTS.filter(p => {
    if (filterLevel !== "Tất cả" && p.level !== filterLevel) return false;
    if (filterTopic !== "Tất cả" && p.topic !== filterTopic) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!selectedPodcast) return;
    const lines = selectedPodcast.transcript;
    const idx = lines.findIndex((l, i) => {
      const next = lines[i + 1];
      return currentTime >= l.time && (!next || currentTime < next.time);
    });
    if (idx !== -1 && idx !== activeLineIdx) {
      setActiveLineIdx(idx);
    }
  }, [currentTime, selectedPodcast, activeLineIdx]);

  const togglePlay = () => {
    if (!selectedPodcast) return;
    if (isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= selectedPodcast.durationSec) {
            clearInterval(timerRef.current!);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedPodcast) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setCurrentTime(Math.round(ratio * selectedPodcast.durationSec));
  };

  const jumpToLine = (time: number) => {
    setCurrentTime(time);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const playTTS = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR"; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Luyện Nghe Qua Podcast</h1>
            <p className="text-white/50 text-sm mt-1">Học tiếng Hàn qua podcast với transcript song ngữ</p>
          </div>
          <div className="text-app-text-muted text-sm"><i className="ri-headphone-line mr-1"></i>{PODCASTS.length} podcast</div>
        </div>

        {selectedPodcast ? (
          <div className="space-y-4">
            <button onClick={() => { setSelectedPodcast(null); setIsPlaying(false); setCurrentTime(0); if (timerRef.current) clearInterval(timerRef.current); }} className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors cursor-pointer text-sm">
              <i className="ri-arrow-left-line"></i>Quay lại
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Player */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-[#1a1f2e] rounded-2xl overflow-hidden border border-app-border">
                  <img loading="lazy" decoding="async" src={selectedPodcast.thumbnail} alt={selectedPodcast.title} className="w-full h-56 object-cover object-top" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${levelColor[selectedPodcast.level]}`}>{selectedPodcast.level}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-white/50">{selectedPodcast.topic}</span>
                      {selectedPodcast.isPremium && <span className="text-xs px-2 py-0.5 rounded-full bg-app-accent-primary/20 text-app-accent-primary font-semibold">VIP</span>}
                    </div>
                    <h2 className="text-white font-bold text-base mb-1">{selectedPodcast.title}</h2>
                    <p className="text-app-text-secondary text-xs mb-4">{selectedPodcast.host} · {selectedPodcast.plays.toLocaleString()} lượt nghe</p>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="h-2 bg-white/8 rounded-full overflow-hidden cursor-pointer" onClick={seek}>
                        <div className="h-full bg-app-accent-primary rounded-full transition-all" style={{ width: `${(currentTime / selectedPodcast.durationSec) * 100}%` }}></div>
                      </div>
                      <div className="flex justify-between text-app-text-muted text-xs mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{selectedPodcast.duration}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => setCurrentTime(Math.max(0, currentTime - 10))} className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-white/60 hover:bg-white/12 cursor-pointer transition-all">
                        <i className="ri-replay-10-line text-lg"></i>
                      </button>
                      <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-app-accent-primary flex items-center justify-center text-black hover:bg-app-accent-primary/90 cursor-pointer transition-all shadow-lg shadow-[app-accent-primary]/20">
                        <i className={`${isPlaying ? "ri-pause-fill" : "ri-play-fill"} text-2xl ml-0.5`}></i>
                      </button>
                      <button onClick={() => setCurrentTime(Math.min(selectedPodcast.durationSec, currentTime + 10))} className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-white/60 hover:bg-white/12 cursor-pointer transition-all">
                        <i className="ri-forward-10-line text-lg"></i>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <button onClick={() => setShowTranslation(!showTranslation)} className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${showTranslation ? "bg-app-accent-primary/15 text-app-accent-primary" : "bg-app-card/50 text-app-text-secondary"}`}>
                        <i className="ri-translate-2 mr-1"></i>
                        {showTranslation ? "Ẩn dịch" : "Hiện dịch"}
                      </button>
                      <span className="text-app-text-muted text-xs">{savedVocab.size} từ đã lưu</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transcript */}
              <div className="lg:col-span-2">
                <div ref={transcriptRef} className="bg-[#1a1f2e] rounded-xl border border-app-border overflow-hidden">
                  <div className="px-4 py-3 border-b border-app-border flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm">Transcript</h3>
                    <span className="text-app-text-muted text-xs">{selectedPodcast.transcript.length} đoạn</span>
                  </div>
                  <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                    {selectedPodcast.transcript.map((line, idx) => (
                      <div
                        key={idx}
                        onClick={() => jumpToLine(line.time)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border ${
                          idx === activeLineIdx
                            ? "bg-app-accent-primary/10 border-app-accent-primary/20"
                            : "bg-app-surface/50 border-transparent hover:bg-app-card/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-app-text-muted text-xs mt-0.5 flex-shrink-0 w-8">{formatTime(line.time)}</span>
                          <div className="flex-1">
                            <div className="flex items-start gap-2">
                              <p className={`text-sm leading-relaxed flex-1 ${idx === activeLineIdx ? "text-white font-medium" : "text-white/70"}`}>
                                {line.korean}
                              </p>
                              <button onClick={e => { e.stopPropagation(); playTTS(line.korean); }} className="text-app-text-muted hover:text-white/50 cursor-pointer flex-shrink-0 mt-0.5">
                                <i className="ri-volume-up-line text-sm"></i>
                              </button>
                            </div>
                            {showTranslation && (
                              <p className="text-app-text-secondary text-xs mt-1 italic">{line.vietnamese}</p>
                            )}
                            {line.vocab && line.vocab.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {line.vocab.map(v => (
                                  <button
                                    key={v.word}
                                    onClick={e => { e.stopPropagation(); setSavedVocab(prev => { const next = new Set(prev); next.has(v.word) ? next.delete(v.word) : next.add(v.word); return next; }); }}
                                    className={`text-xs px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                                      savedVocab.has(v.word) ? "bg-emerald-500/20 text-app-accent-success" : "bg-white/8 text-white/50 hover:bg-white/12"
                                    }`}
                                  >
                                    {v.word}: {v.meaning}
                                    {savedVocab.has(v.word) && <i className="ri-check-line ml-1"></i>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                <input type="text" placeholder="Tìm kiếm podcast..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-app-card/50 border border-app-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-app-accent-primary/40" />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-app-text-muted text-xs">Cấp độ:</span>
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => setFilterLevel(l)} className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${filterLevel === l ? "bg-app-accent-primary/20 text-app-accent-primary font-semibold" : "bg-app-card/50 text-app-text-secondary hover:bg-app-card/70"}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-app-text-muted text-xs">Chủ đề:</span>
                  {TOPICS.map(t => (
                    <button key={t} onClick={() => setFilterTopic(t)} className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${filterTopic === t ? "bg-app-accent-primary/20 text-app-accent-primary font-semibold" : "bg-app-card/50 text-app-text-secondary hover:bg-app-card/70"}`}>{t}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(podcast => (
                <div key={podcast.id} onClick={() => { setSelectedPodcast(podcast); setCurrentTime(0); setIsPlaying(false); setActiveLineIdx(0); }} className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-app-border hover:border-white/20 transition-all cursor-pointer group">
                  <div className="relative">
                    <img loading="lazy" decoding="async" src={podcast.thumbnail} alt={podcast.title} className="w-full h-44 object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${levelColor[podcast.level]}`}>{podcast.level}</span>
                      {podcast.isPremium && <span className="text-xs px-2 py-0.5 rounded-full bg-app-accent-primary/80 text-black font-bold">VIP</span>}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white/70 text-xs px-2 py-0.5 rounded">{podcast.duration}</div>
                  </div>
                  <div className="p-4">
                    <p className="text-app-accent-primary text-xs font-semibold mb-0.5">{podcast.host}</p>
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{podcast.title}</h3>
                    <p className="text-app-text-secondary text-xs line-clamp-2 mb-3">{podcast.description}</p>
                    <div className="flex items-center justify-between text-app-text-muted text-xs">
                      <span><i className="ri-headphone-line mr-1"></i>{(podcast.plays / 1000).toFixed(0)}K lượt nghe</span>
                      <span><i className="ri-file-text-line mr-1"></i>{podcast.transcript.length} đoạn</span>
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
