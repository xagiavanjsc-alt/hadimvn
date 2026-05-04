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
    id: 1, level: "A1", title: "????", titleVi: "T? gi?i thi?u", topic: "Giao ti?p co b?n",
    duration: "1:20", durationSec: 80,
    description: "Hai ngu?i g?p nhau l?n d?u và t? gi?i thi?u b?n thân.",
    transcript: [
      { time: 0, speaker: "??", korean: "?????! ?? ?????.", vietnamese: "Xin chào! Tôi là Minjun.", highlight: ["?????", "??"] },
      { time: 6, speaker: "??", korean: "?????! ?? ????. ??? ????.", vietnamese: "Xin chào! Tôi là Sua. R?t vui du?c g?p b?n.", highlight: ["??? ????"] },
      { time: 13, speaker: "??", korean: "?? ?? ???? ????", vietnamese: "B?n Sua d?n t? dâu v?y?", highlight: ["????"] },
      { time: 18, speaker: "??", korean: "?? ???? ???. ?? ????", vietnamese: "Tôi d?n t? Seoul. Còn b?n Minjun?", highlight: ["??"] },
      { time: 24, speaker: "??", korean: "?? ???? ???. ??? ??? ???.", vietnamese: "Tôi d?n t? Busan. Bây gi? s?ng ? Seoul.", highlight: ["??", "???"] },
      { time: 32, speaker: "??", korean: "?, ???? ?? ??? ???!", vietnamese: "?, v?y à? Tôi cung s?ng ? Seoul!", highlight: ["??"] },
      { time: 38, speaker: "??", korean: "?? ?? ??????", vietnamese: "B?n Sua là h?c sinh à?", highlight: ["??"] },
      { time: 43, speaker: "??", korean: "?, ??? 2?????. ?? ????", vietnamese: "Vâng, tôi là sinh viên nam 2. Còn b?n?", highlight: ["???"] },
      { time: 50, speaker: "??", korean: "?? ??????. IT ???? ???.", vietnamese: "Tôi là nhân viên công ty. Làm vi?c ? công ty IT.", highlight: ["???", "???"] },
    ],
    vocab: [
      { word: "????", meaning: "T? gi?i thi?u" },
      { word: "??? ????", meaning: "R?t vui du?c g?p b?n" },
      { word: "???? ???", meaning: "Ð?n t? dâu?" },
      { word: "???", meaning: "S?ng (? dâu dó)" },
      { word: "???", meaning: "Nhân viên công ty" },
    ],
  },
  {
    id: 2, level: "A2", title: "???? ????", titleVi: "G?i d? ? quán cà phê", topic: "Mua s?m & An u?ng",
    duration: "1:45", durationSec: 105,
    description: "Khách hàng g?i d? u?ng t?i quán cà phê.",
    transcript: [
      { time: 0, speaker: "??", korean: "?? ???! ????????", vietnamese: "Chào m?ng! B?n mu?n g?i gì ??", highlight: ["???????"] },
      { time: 6, speaker: "??", korean: "????? ? ??? ???? ? ? ???.", vietnamese: "Cho tôi m?t ly Americano và m?t ly Cafe Latte.", highlight: ["? ?", "???"] },
      { time: 14, speaker: "??", korean: "???? ????, ???? ?????", vietnamese: "B?n mu?n u?ng l?nh hay nóng ??", highlight: ["???", "????"] },
      { time: 20, speaker: "??", korean: "?????? ????, ????? ???? ???.", vietnamese: "Americano thì l?nh, Cafe Latte thì nóng ?.", highlight: [] },
      { time: 28, speaker: "??", korean: "???? ??? ?????? ??, ???, ?? ???.", vietnamese: "Size th? nào ?? Có small, medium, large.", highlight: ["???"] },
      { time: 36, speaker: "??", korean: "? ? ????? ???.", vietnamese: "C? hai medium nhé.", highlight: ["? ?"] },
      { time: 41, speaker: "??", korean: "? 9,500????. ?? ????", vietnamese: "T?ng c?ng 9,500 won. B?n tr? th? du?c không?", highlight: ["?", "??"] },
      { time: 48, speaker: "??", korean: "?, ??? ???.", vietnamese: "Vâng, tôi tr? th?.", highlight: [] },
      { time: 53, speaker: "??", korean: "??? ??? ???. 5? ?? ???.", vietnamese: "Vui lòng d?i m?t chút. Kho?ng 5 phút.", highlight: ["???", "???"] },
    ],
    vocab: [
      { word: "????", meaning: "G?i món/Ð?t hàng" },
      { word: "???", meaning: "Ðá l?nh (ice)" },
      { word: "????", meaning: "Nóng/?m" },
      { word: "???", meaning: "Kích c? (size)" },
      { word: "?", meaning: "T?ng c?ng" },
      { word: "??? ??? ???", meaning: "Vui lòng d?i m?t chút" },
    ],
  },
  {
    id: 3, level: "B1", title: "?? ?? ???", titleVi: "Lên k? ho?ch du l?ch", topic: "Du l?ch",
    duration: "2:30", durationSec: 150,
    description: "Hai ngu?i b?n th?o lu?n v? k? ho?ch du l?ch Jeju.",
    transcript: [
      { time: 0, speaker: "??", korean: "?? ?? ??? ??? ?? ??? ?? ??!", vietnamese: "K? ngh? hè này di du l?ch Jeju th? nào? Cùng di nhé!", highlight: ["?? ??", "???"] },
      { time: 8, speaker: "??", korean: "??! ?? ?? ???? 7?? ???", vietnamese: "Hay d?y! Ði khi nào thì t?t nh?? Tháng 7 th? nào?", highlight: ["??"] },
      { time: 15, speaker: "??", korean: "7?? ????? ???? ?? ? ??. 8? ?? ???", vietnamese: "Tháng 7 là mùa cao di?m nên ti?n phòng có v? d?t. Ð?u tháng 8 th? nào?", highlight: ["???", "???"] },
      { time: 25, speaker: "??", korean: "??, 8? ?? ???. ?? ?? ? ???", vietnamese: "?, d?u tháng 8 thì t?t hon. Ði m?y ngày?", highlight: ["?? ??"] },
      { time: 33, speaker: "??", korean: "3? 4? ??? ??? ? ??. ?? ???? ? ? ? ??.", vietnamese: "3 dêm 4 ngày là d? r?i. Có th? xem h?t các di?m du l?ch chính.", highlight: ["3? 4?", "???"] },
      { time: 43, speaker: "??", korean: "??? ??? ??? ??? ???, ??????? ????", vietnamese: "Ch? ? thì ch?n dâu? Khách s?n hay nhà khách?", highlight: ["??", "??????"] },
      { time: 52, speaker: "??", korean: "??????? ? ???? ?? ???? ?? ? ??? ?? ? ??.", vietnamese: "Nhà khách r? hon và có th? c?m nh?n không khí d?a phuong nên có v? t?t hon.", highlight: ["????", "?? ???"] },
      { time: 63, speaker: "??", korean: "??. ??? ???? ??? ? ? ??. ???? ????? ?????.", vietnamese: "Ðúng r?i. Và có l? c?n thuê xe n?a. Jeju giao thông công c?ng b?t ti?n l?m.", highlight: ["???", "????"] },
    ],
    vocab: [
      { word: "???", meaning: "Mùa cao di?m" },
      { word: "???", meaning: "Ti?n phòng/Ti?n luu trú" },
      { word: "3? 4?", meaning: "3 dêm 4 ngày" },
      { word: "???", meaning: "Ði?m du l?ch" },
      { word: "??????", meaning: "Nhà khách (guesthouse)" },
      { word: "???", meaning: "Xe thuê (rental car)" },
      { word: "????", meaning: "Giao thông công c?ng" },
    ],
  },
  {
    id: 4, level: "B2", title: "?? ??", titleVi: "Ph?ng v?n xin vi?c", topic: "Công vi?c",
    duration: "3:00", durationSec: 180,
    description: "Bu?i ph?ng v?n xin vi?c t?i m?t công ty Hàn Qu?c.",
    transcript: [
      { time: 0, speaker: "???", korean: "?????. ????? ??? ???????", vietnamese: "Xin chào. B?n có th? t? gi?i thi?u ng?n g?n không?", highlight: ["????", "???"] },
      { time: 8, speaker: "???", korean: "?????. ?? ????? ???. ??????? ?????? ??????.", vietnamese: "Xin chào. Tôi tên là Kim Minsu. Tôi dã h?c chuyên ngành Khoa h?c máy tính t?i Ð?i h?c Hàn Qu?c.", highlight: ["??????"] },
      { time: 18, speaker: "???", korean: "?? ??? ??????", vietnamese: "Ð?ng l?c ?ng tuy?n c?a b?n là gì?", highlight: ["?? ??"] },
      { time: 23, speaker: "???", korean: "??? ???? ?? ?? ??? ?? ????, ? ??? ??? ? ?? ??? ????? ??????.", vietnamese: "Tôi d?ng c?m sâu s?c v?i d?nh hu?ng phát tri?n công ngh? d?i m?i c?a quý công ty và nghi dây là môi tru?ng t?t nh?t d? phát huy nang l?c c?a mình.", highlight: ["???", "??", "??"] },
      { time: 36, speaker: "???", korean: "??? ??? ??? ??? ???.", vietnamese: "Hãy nói v? di?m m?nh và di?m y?u c?a b?n.", highlight: ["??", "??"] },
      { time: 43, speaker: "???", korean: "?? ??? ?? ?? ?????. ??? ??? ????? ???? ???? ?? ?? ????.", vietnamese: "Ði?m m?nh c?a tôi là kh? nang gi?i quy?t v?n d?. Tôi thích phân tích có h? th?ng các v?n d? ph?c t?p và tìm ra gi?i pháp.", highlight: ["?? ?? ??", "???"] },
      { time: 56, speaker: "???", korean: "5? ? ??? ??? ??? ???????", vietnamese: "B?n nghi b?n thân s? nhu th? nào sau 5 nam?", highlight: ["5? ?"] },
    ],
    vocab: [
      { word: "?? ??", meaning: "Ð?ng l?c ?ng tuy?n" },
      { word: "???", meaning: "Ð?i m?i/Cách m?ng" },
      { word: "??? ????", meaning: "Phát huy nang l?c" },
      { word: "??/??", meaning: "Ði?m m?nh/Ði?m y?u" },
      { word: "?? ?? ??", meaning: "Kh? nang gi?i quy?t v?n d?" },
      { word: "???", meaning: "Có h? th?ng/Có t? ch?c" },
    ],
  },
  {
    id: 5, level: "C1", title: "?? ?? ??", titleVi: "Th?o lu?n v? v?n d? môi tru?ng", topic: "Xã h?i & Môi tru?ng",
    duration: "3:30", durationSec: 210,
    description: "Chuong trình th?o lu?n v? bi?n d?i khí h?u và gi?i pháp.",
    transcript: [
      { time: 0, speaker: "???", korean: "??? ?? ??? ?? ??? ?? ???? ?????.", vietnamese: "Hôm nay chúng ta s? nói v? bi?n d?i khí h?u và trung hòa carbon.", highlight: ["?? ??", "?? ??"] },
      { time: 10, speaker: "???A", korean: "?? ?? ??? ??? ??? ?? ?? 1.1? ?????, ? ??? ????? 2050??? ??? ??? ??? ????.", vietnamese: "T?c d? nóng lên toàn c?u hi?n t?i dã tang 1,1 d? so v?i th?i k? ti?n công nghi?p, và n?u xu hu?ng này ti?p t?c, s? gây ra h?u qu? nghiêm tr?ng d?n nam 2050.", highlight: ["?? ???", "???", "??"] },
      { time: 28, speaker: "???B", korean: "?? ????? ??? ?????. ???? ?? ??? ??? ??? ???? ?? ?????? ?? ?????.", vietnamese: "Vi?c chuy?n d?i sang nang lu?ng tái t?o là c?p bách. Chi phí di?n m?t tr?i và di?n gió dang gi?m m?nh nên cung kh? thi v? m?t kinh t?.", highlight: ["?? ???", "???", "??"] },
      { time: 45, speaker: "???", korean: "?? ???? ? ? ?? ?? ??? ??? ?????", vietnamese: "? c?p d? cá nhân, có nh?ng bi?n pháp th?c ti?n nào có th? làm?", highlight: ["?? ??"] },
      { time: 54, speaker: "???A", korean: "?? ???? ??? ?? ?????. ???? ??, ?? ??? ??, ??? ?? ?? ??????.", vietnamese: "Gi?m d?u chân carbon là quan tr?ng. S? d?ng giao thông công c?ng, ch? d? an ch? y?u rau c?, ti?t ki?m nang lu?ng d?u hi?u qu?.", highlight: ["?? ???", "??"] },
    ],
    vocab: [
      { word: "?? ??", meaning: "Bi?n d?i khí h?u" },
      { word: "?? ??", meaning: "Trung hòa carbon" },
      { word: "?? ???", meaning: "Nóng lên toàn c?u" },
      { word: "?? ???", meaning: "Nang lu?ng tái t?o" },
      { word: "?? ???", meaning: "D?u chân carbon" },
      { word: "?? ??", meaning: "Bi?n pháp th?c ti?n" },
    ],
  },
  {
    id: 6, level: "C2", title: "??? ??: ????", titleVi: "Th?o lu?n tri?t h?c: Ý chí t? do", topic: "Tri?t h?c & H?c thu?t",
    duration: "4:00", durationSec: 240,
    description: "Cu?c tranh lu?n h?c thu?t v? ý chí t? do và thuy?t t?t d?nh.",
    transcript: [
      { time: 0, speaker: "??A", korean: "????? ???? ?? ???? ?? ??? ????? ???? ???? ????.", vietnamese: "Cu?c tranh lu?n v? kh? nang tuong thích c?a ý chí t? do và thuy?t t?t d?nh dã kéo dài trong l?ch s? tri?t h?c.", highlight: ["????", "???", "??"] },
      { time: 14, speaker: "??B", korean: "?????? ????? ??? ???? ???? ???? ?????. ???? ??? ??? ?? ??? ? ??? ???? ????? ???.", vietnamese: "Nh?ng ngu?i theo thuy?t tuong thích cho r?ng ý chí t? do không mâu thu?n v?i thuy?t nhân qu? t?t d?nh. N?u ch? th? có th? hành d?ng theo mong mu?n c?a mình thì dã d?.", highlight: ["????", "???", "??"] },
      { time: 32, speaker: "??A", korean: "??? ??? ?????? ?? ??? ?? ??? ?? ????? ?????, ??? ??? ??? ??? ????? ?????.", vietnamese: "Tuy nhiên, nh?ng ngu?i theo thuy?t t?t d?nh c?ng nh?c ph?n bác r?ng n?u m?i s? ki?n d?u du?c quy?t d?nh t?t y?u b?i nguyên nhân ti?n d?, thì t? do theo nghia th?c s? ch? là ?o tu?ng.", highlight: ["????", "???", "??"] },
      { time: 50, speaker: "??B", korean: "????? ??? ? ??? ??? ??? ?????. ??? ??? ??? ?? ??? ? ??? ????? ?? ?????.", vietnamese: "S? phát tri?n c?a khoa h?c th?n kinh dã thêm chi?u kích m?i vào cu?c tranh lu?n này. Thí nghi?m c?a Libet cho th?y ho?t d?ng não x?y ra tru?c quy?t d?nh có ý th?c.", highlight: ["????", "??? ??"] },
    ],
    vocab: [
      { word: "????", meaning: "Ý chí t? do" },
      { word: "???", meaning: "Thuy?t t?t d?nh" },
      { word: "?? ???", meaning: "Kh? nang tuong thích" },
      { word: "???", meaning: "Nhân qu?" },
      { word: "????", meaning: "Khoa h?c th?n kinh" },
      { word: "??? ??", meaning: "Quy?t d?nh có ý th?c" },
    ],
  },
];

const LEVEL_CONFIG: Record<string, { color: string; bg: string; border: string; badge: string; label: string }> = {
  A1: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-500", label: "So c?p 1" },
  A2: { color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", badge: "bg-teal-500", label: "So c?p 2" },
  B1: { color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200", badge: "bg-sky-500", label: "Trung c?p 1" },
  B2: { color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-500", label: "Trung c?p 2" },
  C1: { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-500", label: "Cao c?p 1" },
  C2: { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-500", label: "Cao c?p 2" },
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

  const currentLine = selectedTrack?.transcript.slice().reverse().find(l => l.time <= currentTime);

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
              Luy?n nghe theo c?p d?
            </h1>
            <p className="text-gray-500 text-sm">Bài nghe t? A1 d?n C2 v?i transcript song ng?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Track list */}
          <div className="lg:col-span-1 space-y-4">
            {/* Level filter */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 tracking-normal mb-3">C?p d?</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  onClick={() => setSelectedLevel("all")}
                  className={`py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${selectedLevel === "all" ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                >
                  T?t c?
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
              <p className="text-xs font-semibold text-gray-400 tracking-normal mb-3">Ti?n d?</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-800">{completedTracks.size}/{TRACKS.length}</p>
                  <p className="text-xs text-gray-500">Ðã hoàn thành</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-sky-500">{savedWords.size}</p>
                  <p className="text-xs text-gray-500">T? dã luu</p>
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
                  <p className="font-medium">Ch?n bài nghe d? b?t d?u</p>
                  <p className="text-sm mt-1">6 bài t? A1 d?n C2</p>
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
                      D?ch
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="h-2 bg-app-card/500 rounded-full mb-3 cursor-pointer"
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
                        {tab === "transcript" ? "Transcript" : `T? v?ng (${selectedTrack.vocab.length})`}
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

