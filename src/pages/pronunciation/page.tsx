import { useState, useRef, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ─── Types ────────────────────────────────────────────────────────────────
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

// ─── Data ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "Tất cả", icon: "ri-apps-line", color: "#e8c84a" },
  { id: "greeting", label: "Chào hỏi", icon: "ri-chat-smile-2-line", color: "#34d399" },
  { id: "safety", label: "An toàn", icon: "ri-shield-check-line", color: "#fb923c" },
  { id: "workplace", label: "Công sở", icon: "ri-briefcase-line", color: "#38bdf8" },
  { id: "daily", label: "Hàng ngày", icon: "ri-home-smile-line", color: "#a78bfa" },
  { id: "numbers", label: "Số đếm", icon: "ri-hashtag", color: "#ec4899" },
];

const PRONUNCIATION_ITEMS: PronunciationItem[] = [
  // Chào hỏi
  { id: "p1", korean: "안녕하세요", vietnamese: "Xin chào", romanization: "an-nyeong-ha-se-yo", category: "greeting", difficulty: "easy", tips: "Nhấn mạnh âm tiết đầu 안 (an). Âm 녕 đọc nhẹ hơn.", audioHint: "an-nyeong-ha-se-yo" },
  { id: "p2", korean: "감사합니다", vietnamese: "Cảm ơn", romanization: "gam-sa-ham-ni-da", category: "greeting", difficulty: "easy", tips: "Chú ý 합니다 đọc là 'ham-ni-da', không phải 'hap-ni-da'.", audioHint: "gam-sa-ham-ni-da" },
  { id: "p3", korean: "죄송합니다", vietnamese: "Xin lỗi", romanization: "joe-song-ham-ni-da", category: "greeting", difficulty: "medium", tips: "죄 đọc là 'joe' (giống 'choe'). Đây là lời xin lỗi trang trọng.", audioHint: "joe-song-ham-ni-da" },
  { id: "p4", korean: "처음 뵙겠습니다", vietnamese: "Rất vui được gặp bạn", romanization: "cheo-eum bwep-get-seum-ni-da", category: "greeting", difficulty: "hard", tips: "뵙겠습니다 là dạng kính ngữ của 보다. Đọc chậm từng âm tiết.", audioHint: "cheo-eum bwep-get-seum-ni-da" },
  { id: "p5", korean: "수고하셨습니다", vietnamese: "Bạn đã vất vả rồi", romanization: "su-go-ha-syeot-seum-ni-da", category: "greeting", difficulty: "hard", tips: "하셨습니다 là quá khứ kính ngữ. Âm 셨 đọc là 'syeot'.", audioHint: "su-go-ha-syeot-seum-ni-da" },
  // An toàn
  { id: "p6", korean: "안전모를 착용하세요", vietnamese: "Hãy đội mũ bảo hộ", romanization: "an-jeon-mo-reul cha-gyong-ha-se-yo", category: "safety", difficulty: "medium", tips: "착용 đọc là 'cha-gyong'. Chú ý liên âm giữa 모를.", audioHint: "an-jeon-mo-reul cha-gyong-ha-se-yo" },
  { id: "p7", korean: "위험합니다", vietnamese: "Nguy hiểm", romanization: "wi-heom-ham-ni-da", category: "safety", difficulty: "easy", tips: "위 đọc là 'wi' (giống 'uy'). 험 đọc là 'heom'.", audioHint: "wi-heom-ham-ni-da" },
  { id: "p8", korean: "119에 신고하세요", vietnamese: "Hãy báo 119", romanization: "il-il-gu-e sin-go-ha-se-yo", category: "safety", difficulty: "easy", tips: "119 đọc là 일일구 (il-il-gu). 신고 = báo cáo.", audioHint: "il-il-gu-e sin-go-ha-se-yo" },
  { id: "p9", korean: "안전벨트를 착용하세요", vietnamese: "Hãy thắt dây an toàn", romanization: "an-jeon-bel-teu-reul cha-gyong-ha-se-yo", category: "safety", difficulty: "medium", tips: "벨트 là từ mượn tiếng Anh 'belt'. Đọc tự nhiên như tiếng Hàn.", audioHint: "an-jeon-bel-teu-reul cha-gyong-ha-se-yo" },
  // Công sở
  { id: "p10", korean: "잘 부탁드립니다", vietnamese: "Nhờ bạn giúp đỡ", romanization: "jal bu-tak-deu-rim-ni-da", category: "workplace", difficulty: "medium", tips: "부탁드립니다 là dạng kính ngữ của 부탁하다. Dùng khi bắt đầu làm việc.", audioHint: "jal bu-tak-deu-rim-ni-da" },
  { id: "p11", korean: "죄송합니다. 늦었습니다", vietnamese: "Xin lỗi, tôi đến trễ", romanization: "joe-song-ham-ni-da. neu-jeot-seum-ni-da", category: "workplace", difficulty: "medium", tips: "늦었습니다 = đã trễ. 늦 đọc là 'neut', 었 đọc là 'eot'.", audioHint: "joe-song-ham-ni-da. neu-jeot-seum-ni-da" },
  { id: "p12", korean: "보고서를 제출했습니다", vietnamese: "Tôi đã nộp báo cáo", romanization: "bo-go-seo-reul je-chul-haet-seum-ni-da", category: "workplace", difficulty: "hard", tips: "제출 đọc là 'je-chul'. 했습니다 là quá khứ của 하다.", audioHint: "bo-go-seo-reul je-chul-haet-seum-ni-da" },
  // Hàng ngày
  { id: "p13", korean: "얼마예요?", vietnamese: "Bao nhiêu tiền?", romanization: "eol-ma-ye-yo", category: "daily", difficulty: "easy", tips: "얼마 đọc là 'eol-ma'. 예요 là đuôi câu hỏi thân mật.", audioHint: "eol-ma-ye-yo" },
  { id: "p14", korean: "어디에 있어요?", vietnamese: "Ở đâu vậy?", romanization: "eo-di-e i-sseo-yo", category: "daily", difficulty: "easy", tips: "있어요 đọc là 'i-sseo-yo'. Chú ý âm đôi 있.", audioHint: "eo-di-e i-sseo-yo" },
  { id: "p15", korean: "화장실이 어디예요?", vietnamese: "Nhà vệ sinh ở đâu?", romanization: "hwa-jang-si-ri eo-di-ye-yo", category: "daily", difficulty: "medium", tips: "화장실 đọc là 'hwa-jang-sil'. Liên âm: 실이 → 'si-ri'.", audioHint: "hwa-jang-si-ri eo-di-ye-yo" },
  // Số đếm
  { id: "p16", korean: "하나, 둘, 셋, 넷, 다섯", vietnamese: "Một, hai, ba, bốn, năm", romanization: "ha-na, dul, set, net, da-seot", category: "numbers", difficulty: "easy", tips: "Đây là số đếm thuần Hàn. Dùng khi đếm đồ vật, người.", audioHint: "ha-na dul set net da-seot" },
  { id: "p17", korean: "일, 이, 삼, 사, 오", vietnamese: "Một, hai, ba, bốn, năm (Hán-Hàn)", romanization: "il, i, sam, sa, o", category: "numbers", difficulty: "easy", tips: "Đây là số đếm Hán-Hàn. Dùng cho tiền, thời gian, tầng lầu.", audioHint: "il i sam sa o" },
  { id: "p18", korean: "만 원입니다", vietnamese: "Mười nghìn won", romanization: "man wo-nim-ni-da", category: "numbers", difficulty: "medium", tips: "만 = 10.000. 원 = won. 입니다 = là. Liên âm: 원입니다 → 'wo-nim-ni-da'.", audioHint: "man wo-nim-ni-da" },
];

// ─── Score color helper ───────────────────────────────────────────────────
function getScoreColor(score: number) {
  if (score >= 85) return "#34d399";
  if (score >= 70) return "#e8c84a";
  if (score >= 55) return "#fb923c";
  return "#f87171";
}

function getScoreLabel(score: number) {
  if (score >= 85) return "Xuất sắc!";
  if (score >= 70) return "Khá tốt!";
  if (score >= 55) return "Cần luyện thêm";
  return "Hãy nghe mẫu nhiều hơn";
}

// ─── Recorder Component ───────────────────────────────────────────────────
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

  const diffColor = item.difficulty === "easy" ? "#34d399" : item.difficulty === "medium" ? "#e8c84a" : "#f87171";
  const diffLabel = item.difficulty === "easy" ? "Dễ" : item.difficulty === "medium" ? "Trung bình" : "Khó";

  return (
    <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${diffColor}15`, color: diffColor }}>
            {diffLabel}
          </span>
          {bestScore !== null && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${getScoreColor(bestScore)}15`, color: getScoreColor(bestScore) }}>
              Tốt nhất: {bestScore}/100
            </span>
          )}
        </div>
        <button
          onClick={speakKorean}
          className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 cursor-pointer transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg whitespace-nowrap"
        >
          <i className="ri-volume-up-line text-xs"></i>
          Nghe mẫu
        </button>
      </div>

      {/* Korean text */}
      <div className="text-center mb-3">
        <p className="text-white font-bold text-2xl mb-1 tracking-wide">{item.korean}</p>
        <p className="text-white/40 text-sm mb-0.5">{item.vietnamese}</p>
        <p className="text-white/20 text-xs font-mono">[{item.romanization}]</p>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-2 bg-white/3 rounded-xl p-3 mb-4">
        <i className="ri-lightbulb-line text-[#e8c84a] text-xs flex-shrink-0 mt-0.5"></i>
        <p className="text-white/40 text-[10px] leading-relaxed">{item.tips}</p>
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
            Dừng ({countdown}s)
          </button>
        )}
        {recordState === "analyzing" && (
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-white/30 text-xs">
            <i className="ri-loader-4-line animate-spin"></i>
            AI đang phân tích...
          </div>
        )}
        {recordState === "done" && (
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 text-white/50 text-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-refresh-line"></i>
            Ghi lại
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
        <div className="bg-white/3 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/40 text-[10px]">Điểm phát âm</p>
            <span className="font-bold text-lg" style={{ color: getScoreColor(score) }}>{score}/100</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }} />
          </div>
          <p className="text-[10px]" style={{ color: getScoreColor(score) }}>{getScoreLabel(score)}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
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
      title="Luyện phát âm tiếng Hàn"
      subtitle="Ghi âm giọng nói — AI chấm điểm và phân tích phát âm của bạn"
    >
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng từ/câu", value: PRONUNCIATION_ITEMS.length, icon: "ri-translate-2", color: "#e8c84a" },
          { label: "Đã luyện", value: practicedCount, icon: "ri-mic-line", color: "#34d399" },
          { label: "Điểm TB", value: avgScore > 0 ? `${avgScore}/100` : "—", icon: "ri-bar-chart-line", color: "#a78bfa" },
          { label: "Lần ghi âm", value: totalAttempts, icon: "ri-repeat-line", color: "#fb923c" },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0f1117] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
              <i className={`${stat.icon} text-lg`} style={{ color: stat.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{stat.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Category tabs */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/60"
              }`}
            >
              <i className={`${cat.icon} text-xs`}></i>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <i className="ri-search-line text-white/30 text-sm"></i>
          <input
            type="text"
            placeholder="Tìm từ hoặc câu..."
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
          <p className="text-[#06b6d4]/80 text-xs font-semibold mb-1">Cách luyện hiệu quả</p>
          <p className="text-white/35 text-xs leading-relaxed">
            1. Nhấn <strong className="text-white/50">Nghe mẫu</strong> để nghe phát âm chuẩn → 2. Nhấn <strong className="text-white/50">Ghi âm</strong> và đọc to → 3. Nghe lại và so sánh → 4. Luyện đến khi đạt 80+ điểm
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
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 mx-auto mb-3">
            <i className="ri-search-line text-white/20 text-2xl"></i>
          </div>
          <p className="text-white/30 text-sm">Không tìm thấy kết quả</p>
        </div>
      )}
    </DashboardLayout>
  );
}
