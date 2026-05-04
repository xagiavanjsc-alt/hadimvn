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
  { id: "s1", level: "A1", levelColor: "#34d399", title: "Chào h?i co b?n", topic: "Giao ti?p", duration: 8,
    text: "?????. ?? ?????. ??? ???? ??? ????.",
    translation: "Xin chào. Tôi là h?c sinh. Tên b?n là gì? R?t vui du?c g?p b?n." },
  { id: "s2", level: "A1", levelColor: "#34d399", title: "S? d?m và ngày tháng", topic: "S? h?c", duration: 10,
    text: "??? ??????. ??? ?? ??????. ?? ? ???? ? ? ?? ????.",
    translation: "Hôm nay là th? Hai. Ngày là 15 tháng 5. Bây gi? là m?y gi?? Là 3 gi? 30 phút." },
  { id: "s3", level: "A2", levelColor: "#6ee7b7", title: "Ð?t d? an t?i nhà hàng", topic: "?m th?c", duration: 12,
    text: "???! ??? ???? ???? ?? ???. ?? ???. ????? ? ?? ????.",
    translation: "Xin l?i! Cho tôi m?t bibimbap và m?t canh tuong. Cho thêm nu?c. Bao nhiêu ti?n? 15.000 won." },
  { id: "s4", level: "A2", levelColor: "#6ee7b7", title: "H?i du?ng", topic: "Di chuy?n", duration: 14,
    text: "????? ??? ???? ?? ??? ?? ???. ??? ??? ???? ? ?? ???.",
    translation: "Ga tàu di?n ng?m ? dâu? ? c?nh c?a hàng ti?n l?i kia. Ði b? m?t bao lâu? Kho?ng 5 phút." },
  { id: "s5", level: "B1", levelColor: "#fbbf24", title: "Ph?ng v?n xin vi?c", topic: "Công vi?c", duration: 18,
    text: "????? ? ???. ?? ????? ? ?????? ???. ???? ??? ? ? ?? ???. ???? ??????.",
    translation: "Hãy t? gi?i thi?u b?n thân. Tôi là Nguy?n d?n t? Vi?t Nam. Tôi dã h?c ti?ng Hàn du?c 3 nam. Tôi s? làm vi?c cham ch?." },
  { id: "s6", level: "B1", levelColor: "#fbbf24", title: "Th?o lu?n v? k? ho?ch", topic: "K? ho?ch", duration: 16,
    text: "?? ??? ? ? ???? ????? ??? ??? ??. ??? ??? ???? ? ???. ?? ????",
    translation: "Cu?i tu?n này b?n s? làm gì? Tôi d?nh di Hàn Giang v?i b?n bè. N?u th?i ti?t d?p s? d?p xe. B?n di cùng không?" },
  { id: "s7", level: "B2", levelColor: "#f59e0b", title: "Tin t?c kinh t?", topic: "Kinh t?", duration: 22,
    text: "?? ?? ??? ???? ? ??? ??????. ????? ?? ?? ?? ???? ? ???? ?? ??? ???? ????.",
    translation: "Th? tru?ng ch?ng khoán hôm nay tang 2% so v?i hôm qua. Các chuyên gia d? báo t?c d? tang tru?ng kinh t? quý này s? vu?t 3%." },
  { id: "s8", level: "C1", levelColor: "#f87171", title: "Bài phát bi?u h?c thu?t", topic: "H?c thu?t", duration: 28,
    text: "?? ???? ???? ??? ??? ??? ?????? ??? ??, ??, ?? ? ??? ??? ???? ??? ???? ????.",
    translation: "Trong xã h?i hi?n d?i, s? phát tri?n c?a công ngh? AI không ch? mang l?i thay d?i cách m?ng trong cu?c s?ng hàng ngày mà còn trong các linh v?c kinh t?, giáo d?c, y t?." },
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

  const speedColor = speed < 1 ? "#34d399" : speed === 1 ? "app-accent-primary" : speed <= 1.5 ? "#fb923c" : "#f87171";

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white font-bold text-2xl mb-1">Luy?n nghe theo t?c d?</h1>
          <p className="text-white/50 text-sm">Ði?u ch?nh t?c d? 0.5x ? 2x — luy?n tai nghe t? ch?m d?n nhanh</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "T?ng bài", value: tracks.length, color: "app-accent-primary" },
            { label: "Ðã nghe", value: completedIds.size, color: "#34d399" },
            { label: "T?c d? hi?n t?i", value: `${speed}x`, color: speedColor },
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
                  {l === "all" ? "T?t c?" : l}
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
                  <p className="text-app-text-muted text-xs">t?c d?</p>
                </div>
              </div>

              {/* Speed selector */}
              <div className="mb-5">
                <p className="text-app-text-secondary text-xs mb-2">Ch?n t?c d? phát:</p>
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
                  <span className="text-app-text-muted text-xs">Ch?m</span>
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
                  {isPlaying ? "D?ng" : "Phát"}
                </button>
                <button onClick={() => setShowTranslation(v => !v)}
                  className="px-4 py-3 rounded-xl text-sm cursor-pointer whitespace-nowrap transition-all"
                  style={{ backgroundColor: showTranslation ? "rgba(232,200,74,0.15)" : "rgba(255,255,255,0.05)", color: showTranslation ? "app-accent-primary" : "rgba(255,255,255,0.5)" }}>
                  <i className="ri-translate-2 mr-1"></i>D?ch
                </button>
              </div>

              {/* Translation */}
              {showTranslation && (
                <div className="p-4 rounded-xl bg-app-accent-primary/5 border border-app-accent-primary/15">
                  <p className="text-app-text-secondary text-xs mb-1">B?n d?ch:</p>
                  <p className="text-white/70 text-sm leading-7">{selectedTrack.translation}</p>
                </div>
              )}

              {/* Speed tips */}
              <div className="mt-4 p-3 rounded-xl bg-app-surface/50 border border-app-border">
                <p className="text-app-text-secondary text-xs font-semibold mb-1">G?i ý luy?n t?p:</p>
                <p className="text-app-text-muted text-xs">
                  {speed <= 0.75 ? "T?c d? ch?m — t?p nghe t?ng âm ti?t, chú ý phát âm chu?n"
                    : speed === 1.0 ? "T?c d? bình thu?ng — nghe nhu ngu?i b?n ng? nói chuy?n th?c t?"
                    : speed <= 1.5 ? "T?c d? nhanh — luy?n ph?n x? nghe, t?p trung vào t? khóa"
                    : "T?c d? r?t nhanh — th? thách cao, luy?n nghe trong di?u ki?n khó"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

