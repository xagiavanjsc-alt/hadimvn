import { useState, useRef, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface PracticeItem {
  id: string;
  korean: string;
  vietnamese: string;
  romanization: string;
  level: "A1" | "A2" | "B1" | "B2";
  category: string;
  tips: string;
}

const PRACTICE_ITEMS: PracticeItem[] = [
  // A1
  { id: "p1", korean: "안녕하세요", vietnamese: "Xin chào", romanization: "an-nyeong-ha-se-yo", level: "A1", category: "Chào hỏi", tips: "Nhấn mạnh âm tiết 'nyeong', giọng xuống ở cuối" },
  { id: "p2", korean: "감사합니다", vietnamese: "Cảm ơn", romanization: "gam-sa-ham-ni-da", level: "A1", category: "Chào hỏi", tips: "Phát âm 'gam' ngắn, 'ni-da' nhẹ ở cuối" },
  { id: "p3", korean: "괜찮아요", vietnamese: "Không sao / Ổn", romanization: "gwaen-cha-na-yo", level: "A1", category: "Hàng ngày", tips: "'gwaen' là âm đôi, phát âm nhanh" },
  { id: "p4", korean: "사랑해요", vietnamese: "Tôi yêu bạn", romanization: "sa-rang-hae-yo", level: "A1", category: "Cảm xúc", tips: "Âm 'rang' rung nhẹ, 'hae-yo' lên giọng" },
  { id: "p5", korean: "맛있어요", vietnamese: "Ngon", romanization: "ma-si-sseo-yo", level: "A1", category: "Ẩm thực", tips: "'맛' đọc là 'mat', kết hợp với '있어요' thành 'ma-si-sseo-yo'" },
  { id: "p6", korean: "어디에 가요?", vietnamese: "Bạn đi đâu?", romanization: "eo-di-e ga-yo", level: "A1", category: "Hỏi đường", tips: "Câu hỏi — lên giọng ở cuối" },
  { id: "p7", korean: "얼마예요?", vietnamese: "Bao nhiêu tiền?", romanization: "eol-ma-ye-yo", level: "A1", category: "Mua sắm", tips: "Lên giọng ở 'ye-yo' vì là câu hỏi" },
  { id: "p8", korean: "도와주세요", vietnamese: "Hãy giúp tôi", romanization: "do-wa-ju-se-yo", level: "A1", category: "Khẩn cấp", tips: "Giọng khẩn thiết, nhấn 'do-wa'" },
  // A2
  { id: "p9", korean: "한국어를 공부해요", vietnamese: "Tôi học tiếng Hàn", romanization: "han-gu-geo-reul gong-bu-hae-yo", level: "A2", category: "Học tập", tips: "Chú ý liên âm: 'geo-reul' đọc liền" },
  { id: "p10", korean: "날씨가 좋아요", vietnamese: "Thời tiết đẹp", romanization: "nal-ssi-ga jo-a-yo", level: "A2", category: "Thời tiết", tips: "'날씨' đọc là 'nal-ssi', âm đôi ss" },
  { id: "p11", korean: "지하철을 타요", vietnamese: "Tôi đi tàu điện ngầm", romanization: "ji-ha-cheo-reul ta-yo", level: "A2", category: "Giao thông", tips: "Liên âm 'cheo-reul' đọc liền mạch" },
  { id: "p12", korean: "배가 고파요", vietnamese: "Tôi đói bụng", romanization: "bae-ga go-pa-yo", level: "A2", category: "Cảm giác", tips: "'고파요' từ '고프다' — biến đổi bất quy tắc" },
  { id: "p13", korean: "조금만 기다려 주세요", vietnamese: "Hãy đợi một chút", romanization: "jo-geum-man gi-da-ryeo ju-se-yo", level: "A2", category: "Hàng ngày", tips: "Câu dài — chia thành 2 nhịp: 조금만 / 기다려 주세요" },
  // B1
  { id: "p14", korean: "열심히 공부하면 합격할 거예요", vietnamese: "Nếu học chăm chỉ sẽ đậu", romanization: "yeol-sim-hi gong-bu-ha-myeon hap-gyeo-kal geo-ye-yo", level: "B1", category: "Động viên", tips: "Câu điều kiện — nhấn 'ha-myeon' và 'geo-ye-yo'" },
  { id: "p15", korean: "한국 문화에 관심이 많아요", vietnamese: "Tôi rất quan tâm đến văn hóa Hàn", romanization: "han-guk mun-hwa-e gwan-si-mi ma-na-yo", level: "B1", category: "Văn hóa", tips: "Liên âm 'gwan-si-mi' — 관심이 đọc liền" },
  { id: "p16", korean: "안전모를 반드시 착용하세요", vietnamese: "Nhất định phải đội mũ bảo hộ", romanization: "an-jeon-mo-reul ban-deu-si cha-gyong-ha-se-yo", level: "B1", category: "An toàn", tips: "Từ EPS quan trọng — phát âm rõ từng âm tiết" },
  // B2
  { id: "p17", korean: "환경 보호는 우리 모두의 책임입니다", vietnamese: "Bảo vệ môi trường là trách nhiệm của tất cả chúng ta", romanization: "hwan-gyeong bo-ho-neun u-ri mo-du-ui chae-gi-mim-ni-da", level: "B2", category: "Xã hội", tips: "Câu trang trọng — giọng đều, rõ ràng" },
  { id: "p18", korean: "인공지능 기술이 빠르게 발전하고 있습니다", vietnamese: "Công nghệ AI đang phát triển nhanh chóng", romanization: "in-gong-ji-neung gi-su-ri ppa-reu-ge bal-jeon-ha-go it-seum-ni-da", level: "B2", category: "Công nghệ", tips: "Câu dài — chia nhịp: 인공지능 기술이 / 빠르게 / 발전하고 있습니다" },
];

const LEVEL_COLORS: Record<string, string> = { A1: "#34d399", A2: "#e8c84a", B1: "#fb923c", B2: "#f87171" };

// ─── Speech Recognition Hook ──────────────────────────────────────────────
function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError("Trình duyệt không hỗ trợ nhận diện giọng nói. Hãy dùng Chrome.");
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => { setIsListening(true); setTranscript(""); setError(null); };
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const result = Array.from(e.results).map(r => r[0].transcript).join("");
      setTranscript(result);
    };
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setError(`Lỗi: ${e.error === "no-speech" ? "Không nghe thấy giọng nói" : e.error}`);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, transcript, error, startListening, stopListening };
}

// ─── Score Calculator ─────────────────────────────────────────────────────
function calcScore(target: string, spoken: string): number {
  if (!spoken) return 0;
  const t = target.replace(/\s+/g, "").toLowerCase();
  const s = spoken.replace(/\s+/g, "").toLowerCase();
  if (t === s) return 100;
  // Character-level similarity
  let matches = 0;
  const minLen = Math.min(t.length, s.length);
  for (let i = 0; i < minLen; i++) {
    if (t[i] === s[i]) matches++;
  }
  const similarity = (matches / Math.max(t.length, s.length)) * 100;
  // Word-level bonus
  const targetWords = target.split(" ");
  const spokenWords = spoken.split(" ");
  const wordMatches = targetWords.filter(w => spokenWords.includes(w)).length;
  const wordBonus = (wordMatches / targetWords.length) * 30;
  return Math.min(100, Math.round(similarity * 0.7 + wordBonus));
}

// ─── Practice Card ────────────────────────────────────────────────────────
function PracticeCard({
  item,
  bestScore,
  onScore,
}: {
  item: PracticeItem;
  bestScore: number;
  onScore: (score: number) => void;
}) {
  const { isListening, transcript, error, startListening, stopListening } = useSpeechRecognition();
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  const speakExample = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(item.korean);
    utter.lang = "ko-KR";
    utter.rate = 0.75;
    window.speechSynthesis.speak(utter);
  };

  const handleStop = () => {
    stopListening();
    if (transcript) {
      const score = calcScore(item.korean, transcript);
      setLastScore(score);
      setAttempts(a => a + 1);
      onScore(score);
    }
  };

  const getScoreColor = (s: number) => s >= 80 ? "#34d399" : s >= 55 ? "#e8c84a" : "#f87171";
  const getScoreLabel = (s: number) => s >= 80 ? "Xuất sắc!" : s >= 55 ? "Khá tốt!" : "Thử lại nhé!";

  return (
    <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${LEVEL_COLORS[item.level]}15`, color: LEVEL_COLORS[item.level] }}>{item.level}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30">{item.category}</span>
        </div>
        {bestScore > 0 && (
          <span className="text-[10px] font-bold" style={{ color: getScoreColor(bestScore) }}>Tốt nhất: {bestScore}</span>
        )}
      </div>

      {/* Korean text */}
      <div className="flex items-center gap-3 mb-1">
        <p className="text-white text-2xl font-bold flex-1">{item.korean}</p>
        <button onClick={speakExample} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors flex-shrink-0">
          <i className="ri-volume-up-line text-white/50 text-base"></i>
        </button>
      </div>
      <p className="text-white/25 text-xs font-mono mb-1">[{item.romanization}]</p>
      <p className="text-white/40 text-sm mb-3">{item.vietnamese}</p>

      {/* Tips */}
      <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/10 rounded-xl px-3 py-2 mb-4">
        <p className="text-[#e8c84a]/60 text-[10px] tracking-normal mb-0.5">Mẹo phát âm</p>
        <p className="text-white/40 text-xs">{item.tips}</p>
      </div>

      {/* Recording area */}
      <div className="space-y-3">
        {/* Transcript display */}
        <div className={`min-h-[44px] flex items-center px-3 py-2.5 rounded-xl border transition-all ${isListening ? "border-red-500/30 bg-red-500/5" : transcript ? "border-white/10 bg-white/3" : "border-white/5 bg-white/2"}`}>
          {isListening ? (
            <div className="flex items-center gap-2 w-full">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-1 bg-red-400 rounded-full animate-pulse" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
              <p className="text-red-400/70 text-xs flex-1">{transcript || "Đang nghe..."}</p>
            </div>
          ) : transcript ? (
            <p className="text-white/60 text-sm">{transcript}</p>
          ) : (
            <p className="text-white/20 text-xs">Nhấn mic để bắt đầu nói...</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!isListening ? (
            <button onClick={startListening}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 text-red-400 text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-mic-line"></i>Bắt đầu nói
            </button>
          ) : (
            <button onClick={handleStop}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-semibold cursor-pointer whitespace-nowrap animate-pulse">
              <i className="ri-stop-circle-line"></i>Dừng lại
            </button>
          )}
          {attempts > 0 && (
            <button onClick={() => { setLastScore(null); }} className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white/30 text-xs hover:bg-white/8 cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-refresh-line"></i>
            </button>
          )}
        </div>

        {/* Error */}
        {error && <p className="text-red-400/70 text-xs">{error}</p>}

        {/* Score */}
        {lastScore !== null && !isListening && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${lastScore >= 80 ? "border-emerald-500/25 bg-emerald-500/5" : lastScore >= 55 ? "border-[#e8c84a]/20 bg-[#e8c84a]/5" : "border-red-500/20 bg-red-500/5"}`}>
            <div className="text-2xl font-bold" style={{ color: getScoreColor(lastScore) }}>{lastScore}</div>
            <div>
              <p className="text-sm font-bold" style={{ color: getScoreColor(lastScore) }}>{getScoreLabel(lastScore)}</p>
              <p className="text-white/25 text-[10px]">Lần thử #{attempts}</p>
            </div>
            {lastScore >= 80 && <i className="ri-checkbox-circle-fill text-emerald-400 text-xl ml-auto"></i>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function ListenPracticePage() {
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bestScores, setBestScores] = useLocalStorage<Record<string, number>>("kts_listen_scores", {});

  const categories = [...new Set(PRACTICE_ITEMS.map(p => p.category))];

  const filtered = PRACTICE_ITEMS.filter(p => {
    const matchLevel = selectedLevel === "all" || p.level === selectedLevel;
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    const matchSearch = !searchQuery || p.korean.includes(searchQuery) || p.vietnamese.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLevel && matchCat && matchSearch;
  });

  const handleScore = (id: string, score: number) => {
    setBestScores(prev => ({ ...prev, [id]: Math.max(prev[id] || 0, score) }));
  };

  const totalPracticed = Object.keys(bestScores).length;
  const avgScore = totalPracticed > 0
    ? Math.round(Object.values(bestScores).reduce((a, b) => a + b, 0) / totalPracticed)
    : 0;
  const mastered = Object.values(bestScores).filter(s => s >= 80).length;

  const isSpeechSupported = !!(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );

  return (
    <DashboardLayout
      title="Luyện phát âm & Nghe"
      subtitle="Nói tiếng Hàn — AI nhận diện giọng nói và chấm điểm phát âm"
    >
      {/* Browser warning */}
      {!isSpeechSupported && (
        <div className="bg-[#e8c84a]/8 border border-[#e8c84a]/20 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
          <i className="ri-information-line text-[#e8c84a] text-lg flex-shrink-0"></i>
          <p className="text-white/50 text-sm">Tính năng nhận diện giọng nói yêu cầu <strong className="text-white/70">Google Chrome</strong>. Hãy mở trang này bằng Chrome để sử dụng.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng câu", value: PRACTICE_ITEMS.length, icon: "ri-mic-2-line", color: "#e8c84a" },
          { label: "Đã luyện", value: totalPracticed, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Điểm TB", value: avgScore > 0 ? `${avgScore}` : "—", icon: "ri-bar-chart-line", color: "#38bdf8" },
          { label: "Thành thạo", value: mastered, icon: "ri-trophy-line", color: "#fb923c" },
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

      {/* How it works */}
      <div className="bg-white/3 border border-white/5 rounded-xl px-4 py-3 mb-5 flex items-center gap-4 flex-wrap">
        {[
          { icon: "ri-volume-up-line", text: "Nghe mẫu phát âm" },
          { icon: "ri-mic-line", text: "Nhấn mic và nói" },
          { icon: "ri-brain-line", text: "AI nhận diện giọng nói" },
          { icon: "ri-bar-chart-line", text: "Nhận điểm & phản hồi" },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#e8c84a]/10">
              <i className={`${step.icon} text-[#e8c84a] text-sm`}></i>
            </div>
            <p className="text-white/40 text-xs">{step.text}</p>
            {i < 3 && <i className="ri-arrow-right-line text-white/15 text-xs"></i>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center bg-white/5 rounded-xl p-1">
          <button onClick={() => setSelectedLevel("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedLevel === "all" ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/60"}`}>Tất cả</button>
          {["A1","A2","B1","B2"].map(lv => (
            <button key={lv} onClick={() => setSelectedLevel(lv)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedLevel === lv ? "text-[#0f1117] font-bold" : "text-white/40 hover:text-white/60"}`} style={selectedLevel === lv ? { backgroundColor: LEVEL_COLORS[lv] } : {}}>{lv}</button>
          ))}
        </div>
        <div className="flex items-center bg-white/5 rounded-xl p-1 flex-wrap gap-0.5">
          <button onClick={() => setSelectedCategory("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedCategory === "all" ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/60"}`}>Tất cả</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedCategory === cat ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/60"}`}>{cat}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2 flex-1 min-w-[160px]">
          <i className="ri-search-line text-white/30 text-sm"></i>
          <input type="text" placeholder="Tìm câu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-white/70 text-sm outline-none placeholder-white/20" />
        </div>
        <p className="text-white/30 text-xs whitespace-nowrap">{filtered.length} câu</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(item => (
          <PracticeCard
            key={item.id}
            item={item}
            bestScore={bestScores[item.id] || 0}
            onScore={score => handleScore(item.id, score)}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}


