import { useState, useRef, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface ListenTrack {
  id: string;
  level: string;
  levelColor: string;
  title: string;
  text: string;
  translation: string;
  topic: string;
  duration: number; // seconds at 1x
}

const tracks: ListenTrack[] = [
  { id: "s1", level: "A1", levelColor: "#34d399", title: "Chào hỏi cơ bản", topic: "Giao tiếp", duration: 8,
    text: "안녕하세요. 저는 학생이에요. 이름이 뭐예요? 만나서 반가워요.",
    translation: "Xin chào. Tôi là học sinh. Tên bạn là gì? Rất vui được gặp bạn." },
  { id: "s2", level: "A1", levelColor: "#34d399", title: "Số đếm và ngày tháng", topic: "Số học", duration: 10,
    text: "오늘은 월요일이에요. 날짜는 오월 십오일이에요. 지금 몇 시예요? 세 시 삼십 분이에요.",
    translation: "Hôm nay là thứ Hai. Ngày là 15 tháng 5. Bây giờ là mấy giờ? Là 3 giờ 30 phút." },
  { id: "s3", level: "A2", levelColor: "#6ee7b7", title: "Đặt đồ ăn tại nhà hàng", topic: "Ẩm thực", duration: 12,
    text: "여기요! 비빔밥 하나하고 된장찌개 하나 주세요. 물도 주세요. 얼마예요? 만 오천 원이에요.",
    translation: "Xin lỗi! Cho tôi một bibimbap và một canh tương. Cho thêm nước. Bao nhiêu tiền? 15.000 won." },
  { id: "s4", level: "A2", levelColor: "#6ee7b7", title: "Hỏi đường", topic: "Di chuyển", duration: 14,
    text: "지하철역이 어디에 있어요? 저기 편의점 옆에 있어요. 걸어서 얼마나 걸려요? 오 분쯤 걸려요.",
    translation: "Ga tàu điện ngầm ở đâu? Ở cạnh cửa hàng tiện lợi kia. Đi bộ mất bao lâu? Khoảng 5 phút." },
  { id: "s5", level: "B1", levelColor: "#fbbf24", title: "Phỏng vấn xin việc", topic: "Công việc", duration: 18,
    text: "자기소개를 해 주세요. 저는 베트남에서 온 응우옌이라고 합니다. 한국어를 공부한 지 삼 년이 됐어요. 성실하게 일하겠습니다.",
    translation: "Hãy tự giới thiệu bản thân. Tôi là Nguyễn đến từ Việt Nam. Tôi đã học tiếng Hàn được 3 năm. Tôi sẽ làm việc chăm chỉ." },
  { id: "s6", level: "B1", levelColor: "#fbbf24", title: "Thảo luận về kế hoạch", topic: "Kế hoạch", duration: 16,
    text: "이번 주말에 뭐 할 거예요? 친구들이랑 한강에 가려고 해요. 날씨가 좋으면 자전거도 탈 거예요. 같이 갈래요?",
    translation: "Cuối tuần này bạn sẽ làm gì? Tôi định đi Hàn Giang với bạn bè. Nếu thời tiết đẹp sẽ đạp xe. Bạn đi cùng không?" },
  { id: "s7", level: "B2", levelColor: "#f59e0b", title: "Tin tức kinh tế", topic: "Kinh tế", duration: 22,
    text: "오늘 주식 시장은 전날보다 이 퍼센트 상승했습니다. 전문가들은 이번 분기 경제 성장률이 삼 퍼센트를 넘을 것으로 전망하고 있습니다.",
    translation: "Thị trường chứng khoán hôm nay tăng 2% so với hôm qua. Các chuyên gia dự báo tốc độ tăng trưởng kinh tế quý này sẽ vượt 3%." },
  { id: "s8", level: "C1", levelColor: "#f87171", title: "Bài phát biểu học thuật", topic: "Học thuật", duration: 28,
    text: "현대 사회에서 인공지능 기술의 발전은 우리의 일상생활뿐만 아니라 경제, 교육, 의료 등 다양한 분야에 혁신적인 변화를 가져오고 있습니다.",
    translation: "Trong xã hội hiện đại, sự phát triển của công nghệ AI không chỉ mang lại thay đổi cách mạng trong cuộc sống hàng ngày mà còn trong các lĩnh vực kinh tế, giáo dục, y tế." },
];

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export default function SpeedListeningPage() {
  const [selectedTrack, setSelectedTrack] = useState<ListenTrack>(tracks[0]);
  const [speed, setSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [levelFilter, setLevelFilter] = useState("all");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const stopPlayback = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
    setProgress(0);
  }, []);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  const handlePlay = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    if (isPlaying) { stopPlayback(); return; }

    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(selectedTrack.text);
    utt.lang = "ko-KR";
    utt.rate = speed;
    utterRef.current = utt;

    const estimatedDuration = (selectedTrack.duration / speed) * 1000;
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / estimatedDuration) * 100, 100);
      setProgress(pct);
      if (pct >= 100 && intervalRef.current) clearInterval(intervalRef.current);
    }, 100);

    utt.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      setCompletedIds(prev => new Set([...prev, selectedTrack.id]));
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    window.speechSynthesis.speak(utt);
    setIsPlaying(true);
    setProgress(0);
  }, [isPlaying, selectedTrack, speed, stopPlayback]);

  const handleSelectTrack = (track: ListenTrack) => {
    stopPlayback();
    setSelectedTrack(track);
    setShowTranslation(false);
    setProgress(0);
  };

  const filteredTracks = levelFilter === "all" ? tracks : tracks.filter(t => t.level === levelFilter);

  const speedColor = speed < 1 ? "#34d399" : speed === 1 ? "#e8c84a" : speed <= 1.5 ? "#fb923c" : "#f87171";

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white font-bold text-2xl mb-1">Luyện nghe theo tốc độ</h1>
          <p className="text-white/50 text-sm">Điều chỉnh tốc độ 0.5x → 2x — luyện tai nghe từ chậm đến nhanh</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Tổng bài", value: tracks.length, color: "#e8c84a" },
            { label: "Đã nghe", value: completedIds.size, color: "#34d399" },
            { label: "Tốc độ hiện tại", value: `${speed}x`, color: speedColor },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-app-border bg-app-surface/50 p-4 text-center">
              <p className="font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Track list */}
          <div className="lg:col-span-1">
            <div className="flex gap-1 flex-wrap mb-3">
              {["all", "A1", "A2", "B1", "B2", "C1"].map(l => (
                <button key={l} onClick={() => setLevelFilter(l)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all"
                  style={levelFilter === l ? { backgroundColor: "rgba(255,255,255,0.15)", color: "white" } : { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                  {l === "all" ? "Tất cả" : l}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {filteredTracks.map(t => (
                <button key={t.id} onClick={() => handleSelectTrack(t)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left cursor-pointer transition-all ${selectedTrack.id === t.id ? "border-app-accent-primary/30 bg-app-accent-primary/5" : "border-app-border bg-app-surface/50 hover:bg-app-card/50"}`}>
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${t.levelColor}20` }}>
                    {completedIds.has(t.id)
                      ? <i className="ri-checkbox-circle-fill text-app-accent-success text-sm"></i>
                      : <i className="ri-headphone-line text-sm" style={{ color: t.levelColor }}></i>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{t.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${t.levelColor}20`, color: t.levelColor }}>{t.level}</span>
                      <span className="text-app-text-muted text-[9px]">{t.topic}</span>
                      <span className="text-app-text-muted text-[9px]">{t.duration}s</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Player */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-app-border bg-app-surface/50 p-6">
              {/* Track info */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${selectedTrack.levelColor}20`, color: selectedTrack.levelColor }}>{selectedTrack.level}</span>
                    <span className="text-app-text-secondary text-xs">{selectedTrack.topic}</span>
                  </div>
                  <h2 className="text-white font-bold text-lg">{selectedTrack.title}</h2>
                </div>
                <div className="text-right">
                  <p className="font-bold text-2xl" style={{ color: speedColor }}>{speed}x</p>
                  <p className="text-app-text-muted text-xs">tốc độ</p>
                </div>
              </div>

              {/* Speed selector */}
              <div className="mb-5">
                <p className="text-app-text-secondary text-xs mb-2">Chọn tốc độ phát:</p>
                <div className="flex gap-2 flex-wrap">
                  {SPEEDS.map(s => (
                    <button key={s} onClick={() => { setSpeed(s); if (isPlaying) stopPlayback(); }}
                      className="px-3 py-2 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-all"
                      style={speed === s
                        ? { backgroundColor: speedColor, color: "#141720" }
                        : { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
                      {s}x
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-app-text-muted text-xs">Chậm</span>
                  <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${((speed - 0.5) / 1.5) * 100}%`, backgroundColor: speedColor }} />
                  </div>
                  <span className="text-app-text-muted text-xs">Nhanh</span>
                </div>
              </div>

              {/* Text display */}
              <div className="p-4 rounded-xl bg-app-card/50 border border-app-border mb-5">
                <p className="text-white font-medium text-lg leading-9 tracking-wide">{selectedTrack.text}</p>
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-100" style={{ width: `${progress}%`, backgroundColor: speedColor }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-app-text-muted text-xs">0:00</span>
                  <span className="text-app-text-muted text-xs">{Math.round(selectedTrack.duration / speed)}s</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 mb-4">
                <button onClick={handlePlay}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm cursor-pointer whitespace-nowrap transition-all"
                  style={{ backgroundColor: isPlaying ? "rgba(248,113,113,0.15)" : speedColor, color: isPlaying ? "#f87171" : "#141720" }}>
                  <i className={isPlaying ? "ri-stop-fill text-lg" : "ri-play-fill text-lg"}></i>
                  {isPlaying ? "Dừng" : "Phát"}
                </button>
                <button onClick={() => setShowTranslation(v => !v)}
                  className="px-4 py-3 rounded-xl text-sm cursor-pointer whitespace-nowrap transition-all"
                  style={{ backgroundColor: showTranslation ? "rgba(232,200,74,0.15)" : "rgba(255,255,255,0.05)", color: showTranslation ? "#e8c84a" : "rgba(255,255,255,0.5)" }}>
                  <i className="ri-translate-2 mr-1"></i>Dịch
                </button>
              </div>

              {/* Translation */}
              {showTranslation && (
                <div className="p-4 rounded-xl bg-app-accent-primary/5 border border-app-accent-primary/15">
                  <p className="text-app-text-secondary text-xs mb-1">Bản dịch:</p>
                  <p className="text-white/70 text-sm leading-7">{selectedTrack.translation}</p>
                </div>
              )}

              {/* Speed tips */}
              <div className="mt-4 p-3 rounded-xl bg-app-surface/50 border border-app-border">
                <p className="text-app-text-secondary text-xs font-semibold mb-1">Gợi ý luyện tập:</p>
                <p className="text-app-text-muted text-xs">
                  {speed <= 0.75 ? "Tốc độ chậm — tập nghe từng âm tiết, chú ý phát âm chuẩn"
                    : speed === 1.0 ? "Tốc độ bình thường — nghe như người bản ngữ nói chuyện thực tế"
                    : speed <= 1.5 ? "Tốc độ nhanh — luyện phản xạ nghe, tập trung vào từ khóa"
                    : "Tốc độ rất nhanh — thử thách cao, luyện nghe trong điều kiện khó"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

