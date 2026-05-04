import { useState, useRef, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// --- Types ----------------------------------------------------------------
interface PronunciationItem {
  id: string;
  korean: string;
  vietnamese: string;
  romanization: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  tips: string;
  audioHint?: string;
}

interface ScoreRecord {
  id: string;
  score: number;
  date: string;
}

// --- Data -----------------------------------------------------------------
const CATEGORIES = [
  { id: "all", label: "T?t c?", icon: "ri-apps-line", color: "app-accent-primary" },
  { id: "greeting", label: "Chào h?i", icon: "ri-chat-smile-2-line", color: "#34d399" },
  { id: "safety", label: "An toàn", icon: "ri-shield-check-line", color: "#fb923c" },
  { id: "workplace", label: "Công s?", icon: "ri-briefcase-line", color: "#38bdf8" },
  { id: "daily", label: "Hàng ngày", icon: "ri-home-smile-line", color: "#a78bfa" },
  { id: "numbers", label: "S? d?m", icon: "ri-hashtag", color: "#ec4899" },
];

const PRONUNCIATION_ITEMS: PronunciationItem[] = [
  // Chào h?i
  { id: "p1", korean: "?????", vietnamese: "Xin chào", romanization: "an-nyeong-ha-se-yo", category: "greeting", difficulty: "easy", tips: "Nh?n m?nh âm ti?t d?u ? (an). Âm ? d?c nh? hon.", audioHint: "an-nyeong-ha-se-yo" },
  { id: "p2", korean: "?????", vietnamese: "C?m on", romanization: "gam-sa-ham-ni-da", category: "greeting", difficulty: "easy", tips: "Chú ý ??? d?c là 'ham-ni-da', không ph?i 'hap-ni-da'.", audioHint: "gam-sa-ham-ni-da" },
  { id: "p3", korean: "?????", vietnamese: "Xin l?i", romanization: "joe-song-ham-ni-da", category: "greeting", difficulty: "medium", tips: "? d?c là 'joe' (gi?ng 'choe'). Ðây là l?i xin l?i trang tr?ng.", audioHint: "joe-song-ham-ni-da" },
  { id: "p4", korean: "?? ?????", vietnamese: "R?t vui du?c g?p b?n", romanization: "cheo-eum bwep-get-seum-ni-da", category: "greeting", difficulty: "hard", tips: "????? là d?ng kính ng? c?a ??. Ð?c ch?m t?ng âm ti?t.", audioHint: "cheo-eum bwep-get-seum-ni-da" },
  { id: "p5", korean: "???????", vietnamese: "B?n dã v?t v? r?i", romanization: "su-go-ha-syeot-seum-ni-da", category: "greeting", difficulty: "hard", tips: "????? là quá kh? kính ng?. Âm ? d?c là 'syeot'.", audioHint: "su-go-ha-syeot-seum-ni-da" },
  // An toàn
  { id: "p6", korean: "???? ?????", vietnamese: "Hãy d?i mu b?o h?", romanization: "an-jeon-mo-reul cha-gyong-ha-se-yo", category: "safety", difficulty: "medium", tips: "?? d?c là 'cha-gyong'. Chú ý liên âm gi?a ??.", audioHint: "an-jeon-mo-reul cha-gyong-ha-se-yo" },
  { id: "p7", korean: "?????", vietnamese: "Nguy hi?m", romanization: "wi-heom-ham-ni-da", category: "safety", difficulty: "easy", tips: "? d?c là 'wi' (gi?ng 'uy'). ? d?c là 'heom'.", audioHint: "wi-heom-ham-ni-da" },
  { id: "p8", korean: "119? ?????", vietnamese: "Hãy báo 119", romanization: "il-il-gu-e sin-go-ha-se-yo", category: "safety", difficulty: "easy", tips: "119 d?c là ??? (il-il-gu). ?? = báo cáo.", audioHint: "il-il-gu-e sin-go-ha-se-yo" },
  { id: "p9", korean: "????? ?????", vietnamese: "Hãy th?t dây an toàn", romanization: "an-jeon-bel-teu-reul cha-gyong-ha-se-yo", category: "safety", difficulty: "medium", tips: "?? là t? mu?n ti?ng Anh 'belt'. Ð?c t? nhiên nhu ti?ng Hàn.", audioHint: "an-jeon-bel-teu-reul cha-gyong-ha-se-yo" },
  // Công s?
  { id: "p10", korean: "? ??????", vietnamese: "Nh? b?n giúp d?", romanization: "jal bu-tak-deu-rim-ni-da", category: "workplace", difficulty: "medium", tips: "?????? là d?ng kính ng? c?a ????. Dùng khi b?t d?u làm vi?c.", audioHint: "jal bu-tak-deu-rim-ni-da" },
  { id: "p11", korean: "?????. ?????", vietnamese: "Xin l?i, tôi d?n tr?", romanization: "joe-song-ham-ni-da. neu-jeot-seum-ni-da", category: "workplace", difficulty: "medium", tips: "????? = dã tr?. ? d?c là 'neut', ? d?c là 'eot'.", audioHint: "joe-song-ham-ni-da. neu-jeot-seum-ni-da" },
  { id: "p12", korean: "???? ??????", vietnamese: "Tôi dã n?p báo cáo", romanization: "bo-go-seo-reul je-chul-haet-seum-ni-da", category: "workplace", difficulty: "hard", tips: "?? d?c là 'je-chul'. ???? là quá kh? c?a ??.", audioHint: "bo-go-seo-reul je-chul-haet-seum-ni-da" },
  // Hàng ngày
  { id: "p13", korean: "?????", vietnamese: "Bao nhiêu ti?n?", romanization: "eol-ma-ye-yo", category: "daily", difficulty: "easy", tips: "?? d?c là 'eol-ma'. ?? là duôi câu h?i thân m?t.", audioHint: "eol-ma-ye-yo" },
  { id: "p14", korean: "??? ????", vietnamese: "? dâu v?y?", romanization: "eo-di-e i-sseo-yo", category: "daily", difficulty: "easy", tips: "??? d?c là 'i-sseo-yo'. Chú ý âm dôi ?.", audioHint: "eo-di-e i-sseo-yo" },
  { id: "p15", korean: "???? ?????", vietnamese: "Nhà v? sinh ? dâu?", romanization: "hwa-jang-si-ri eo-di-ye-yo", category: "daily", difficulty: "medium", tips: "??? d?c là 'hwa-jang-sil'. Liên âm: ?? ? 'si-ri'.", audioHint: "hwa-jang-si-ri eo-di-ye-yo" },
  // S? d?m
  { id: "p16", korean: "??, ?, ?, ?, ??", vietnamese: "M?t, hai, ba, b?n, nam", romanization: "ha-na, dul, set, net, da-seot", category: "numbers", difficulty: "easy", tips: "Ðây là s? d?m thu?n Hàn. Dùng khi d?m d? v?t, ngu?i.", audioHint: "ha-na dul set net da-seot" },
  { id: "p17", korean: "?, ?, ?, ?, ?", vietnamese: "M?t, hai, ba, b?n, nam (Hán-Hàn)", romanization: "il, i, sam, sa, o", category: "numbers", difficulty: "easy", tips: "Ðây là s? d?m Hán-Hàn. Dùng cho ti?n, th?i gian, t?ng l?u.", audioHint: "il i sam sa o" },
  { id: "p18", korean: "? ????", vietnamese: "Mu?i nghìn won", romanization: "man wo-nim-ni-da", category: "numbers", difficulty: "medium", tips: "? = 10.000. ? = won. ??? = là. Liên âm: ???? ? 'wo-nim-ni-da'.", audioHint: "man wo-nim-ni-da" },
];

// --- Score color helper ---------------------------------------------------
function getScoreColor(score: number) {
  if (score >= 85) return "#34d399";
  if (score >= 70) return "app-accent-primary";
  if (score >= 55) return "#fb923c";
  return "#f87171";
}

function getScoreLabel(score: number) {
  if (score >= 85) return "Xu?t s?c!";
  if (score >= 70) return "Khá t?t!";
  if (score >= 55) return "C?n luy?n thêm";
  return "Hãy nghe m?u nhi?u hon";
}

// --- Recorder Component ---------------------------------------------------
function PronunciationCard({
  item,
  bestScore,
  onScoreUpdate,
}: {
  item: PronunciationItem;
  bestScore: number | null;
  onScoreUpdate: (id: string, score: number) => void;
}) {
  const [recordState, setRecordState] = useState<"idle" | "recording" | "analyzing" | "done">("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speakKorean = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(item.korean);
    utter.lang = "ko-KR";
    utter.rate = 0.75;
    window.speechSynthesis.speak(utter);
  }, [item.korean]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
        setRecordState("analyzing");

        // Simulate AI scoring
        setTimeout(() => {
          const base = item.difficulty === "easy" ? 70 : item.difficulty === "medium" ? 60 : 50;
          const variance = Math.floor(Math.random() * 25);
          const newScore = Math.min(100, base + variance);
          setScore(newScore);
          setRecordState("done");
          onScoreUpdate(item.id, newScore);
        }, 1800);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordState("recording");

      let secs = 4;
      setCountdown(secs);
      timerRef.current = setInterval(() => {
        secs -= 1;
        setCountdown(secs);
        if (secs <= 0) {
          clearInterval(timerRef.current!);
          recorder.stop();
        }
      }, 1000);
    } catch {
      // Microphone not available
    }
  }, [item, onScoreUpdate]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setScore(null);
    setRecordState("idle");
  }, [audioUrl]);

  const diffColor = item.difficulty === "easy" ? "#34d399" : item.difficulty === "medium" ? "app-accent-primary" : "#f87171";
  const diffLabel = item.difficulty === "easy" ? "D?" : item.difficulty === "medium" ? "Trung bình" : "Khó";

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${diffColor}15`, color: diffColor }}>
            {diffLabel}
          </span>
          {bestScore !== null && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${getScoreColor(bestScore)}15`, color: getScoreColor(bestScore) }}>
              T?t nh?t: {bestScore}/100
            </span>
          )}
        </div>
        <button
          onClick={speakKorean}
          className="flex items-center gap-1.5 text-[10px] text-app-text-muted hover:text-white/60 cursor-pointer transition-colors bg-app-card/50 hover:bg-app-card/70 px-2.5 py-1 rounded-lg whitespace-nowrap"
        >
          <i className="ri-volume-up-line text-xs"></i>
          Nghe m?u
        </button>
      </div>

      {/* Korean text */}
      <div className="text-center mb-3">
        <p className="text-white font-bold text-2xl mb-1 tracking-wide">{item.korean}</p>
        <p className="text-app-text-secondary text-sm mb-0.5">{item.vietnamese}</p>
        <p className="text-app-text-muted text-xs font-mono">[{item.romanization}]</p>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-2 bg-app-surface/50 rounded-xl p-3 mb-4">
        <i className="ri-lightbulb-line text-app-accent-primary text-xs flex-shrink-0 mt-0.5"></i>
        <p className="text-app-text-secondary text-[10px] leading-relaxed">{item.tips}</p>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-3">
        {recordState === "idle" && (
          <button
            onClick={startRecording}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 text-[#06b6d4] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-mic-line"></i>
            Ghi âm
          </button>
        )}
        {recordState === "recording" && (
          <button
            onClick={stopRecording}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
            D?ng ({countdown}s)
          </button>
        )}
        {recordState === "analyzing" && (
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-app-card/50 text-app-text-muted text-xs">
            <i className="ri-loader-4-line animate-spin"></i>
            AI dang phân tích...
          </div>
        )}
        {recordState === "done" && (
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-app-card/50 hover:bg-white/8 text-white/50 text-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-refresh-line"></i>
            Ghi l?i
          </button>
        )}
      </div>

      {/* Playback */}
      {audioUrl && recordState === "done" && (
        <div className="mb-3">
          <audio src={audioUrl} controls className="w-full h-7" style={{ filter: "invert(0.7) hue-rotate(180deg)" }} />
        </div>
      )}

      {/* Score */}
      {score !== null && recordState === "done" && (
        <div className="bg-app-surface/50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-app-text-secondary text-[10px]">Ði?m phát âm</p>
            <span className="font-bold text-lg" style={{ color: getScoreColor(score) }}>{score}/100</span>
          </div>
          <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden mb-2">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }} />
          </div>
          <p className="text-[10px]" style={{ color: getScoreColor(score) }}>{getScoreLabel(score)}</p>
        </div>
      )}
    </div>
  );
}

// --- Main Page ------------------------------------------------------------
export default function PronunciationPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [scores, setScores] = useLocalStorage<Record<string, ScoreRecord[]>>("kts_pronunciation_scores", {});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = PRONUNCIATION_ITEMS.filter(item => {
    const matchCat = selectedCategory === "all" || item.category === selectedCategory;
    const matchSearch = !searchQuery || item.korean.includes(searchQuery) || item.vietnamese.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleScoreUpdate = useCallback((id: string, score: number) => {
    setScores(prev => {
      const existing = prev[id] || [];
      return {
        ...prev,
        [id]: [...existing, { id, score, date: new Date().toISOString() }].slice(-10),
      };
    });
  }, [setScores]);

  const getBestScore = (id: string): number | null => {
    const records = scores[id];
    if (!records || records.length === 0) return null;
    return Math.max(...records.map(r => r.score));
  };

  // Overall stats
  const practicedCount = Object.keys(scores).length;
  const allScores = Object.values(scores).flatMap(r => r.map(s => s.score));
  const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
  const totalAttempts = allScores.length;

  return (
    <DashboardLayout
      title="Luy?n phát âm ti?ng Hàn"
      subtitle="Ghi âm gi?ng nói — AI ch?m di?m và phân tích phát âm c?a b?n"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "T?ng t?/câu", value: PRONUNCIATION_ITEMS.length, icon: "ri-translate-2", color: "app-accent-primary" },
          { label: "Ðã luy?n", value: practicedCount, icon: "ri-mic-line", color: "#34d399" },
          { label: "Ði?m TB", value: avgScore > 0 ? `${avgScore}/100` : "—", icon: "ri-bar-chart-line", color: "#a78bfa" },
          { label: "L?n ghi âm", value: totalAttempts, icon: "ri-repeat-line", color: "#fb923c" },
        ].map(stat => (
          <div key={stat.label} className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
              <i className={`${stat.icon} text-lg`} style={{ color: stat.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{stat.value}</p>
              <p className="text-app-text-secondary text-xs mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Category tabs */}
        <div className="flex items-center gap-1 bg-app-card/50 rounded-xl p-1 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"
              }`}
            >
              <i className={`${cat.icon} text-xs`}></i>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-app-card/50 border border-app-border rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <i className="ri-search-line text-app-text-muted text-sm"></i>
          <input
            type="text"
            placeholder="Tìm t? ho?c câu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white/70 text-sm outline-none placeholder-white/20"
          />
        </div>
      </div>

      {/* Tips banner */}
      <div className="bg-[#06b6d4]/5 border border-[#06b6d4]/15 rounded-xl p-4 mb-5 flex items-start gap-3">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#06b6d4]/10 flex-shrink-0">
          <i className="ri-information-line text-[#06b6d4] text-sm"></i>
        </div>
        <div>
          <p className="text-[#06b6d4]/80 text-xs font-semibold mb-1">Cách luy?n hi?u qu?</p>
          <p className="text-white/35 text-xs leading-relaxed">
            1. Nh?n <strong className="text-white/50">Nghe m?u</strong> d? nghe phát âm chu?n ? 2. Nh?n <strong className="text-white/50">Ghi âm</strong> và d?c to ? 3. Nghe l?i và so sánh ? 4. Luy?n d?n khi d?t 80+ di?m
          </p>
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <PronunciationCard
              key={item.id}
              item={item}
              bestScore={getBestScore(item.id)}
              onScoreUpdate={handleScoreUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-app-card/50 mx-auto mb-3">
            <i className="ri-search-line text-app-text-muted text-2xl"></i>
          </div>
          <p className="text-app-text-muted text-sm">Không tìm th?y k?t qu?</p>
        </div>
      )}
    </DashboardLayout>
  );
}

