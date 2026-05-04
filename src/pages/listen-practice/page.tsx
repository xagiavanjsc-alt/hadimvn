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
  { id: "p1", korean: "?????", vietnamese: "Xin chào", romanization: "an-nyeong-ha-se-yo", level: "A1", category: "Chào h?i", tips: "Nh?n m?nh âm ti?t 'nyeong', gi?ng xu?ng ? cu?i" },
  { id: "p2", korean: "?????", vietnamese: "C?m on", romanization: "gam-sa-ham-ni-da", level: "A1", category: "Chào h?i", tips: "Phát âm 'gam' ng?n, 'ni-da' nh? ? cu?i" },
  { id: "p3", korean: "????", vietnamese: "Không sao / ?n", romanization: "gwaen-cha-na-yo", level: "A1", category: "Hàng ngày", tips: "'gwaen' là âm dôi, phát âm nhanh" },
  { id: "p4", korean: "????", vietnamese: "Tôi yêu b?n", romanization: "sa-rang-hae-yo", level: "A1", category: "C?m xúc", tips: "Âm 'rang' rung nh?, 'hae-yo' lên gi?ng" },
  { id: "p5", korean: "????", vietnamese: "Ngon", romanization: "ma-si-sseo-yo", level: "A1", category: "?m th?c", tips: "'?' d?c là 'mat', k?t h?p v?i '???' thành 'ma-si-sseo-yo'" },
  { id: "p6", korean: "??? ???", vietnamese: "B?n di dâu?", romanization: "eo-di-e ga-yo", level: "A1", category: "H?i du?ng", tips: "Câu h?i — lên gi?ng ? cu?i" },
  { id: "p7", korean: "?????", vietnamese: "Bao nhiêu ti?n?", romanization: "eol-ma-ye-yo", level: "A1", category: "Mua s?m", tips: "Lên gi?ng ? 'ye-yo' vì là câu h?i" },
  { id: "p8", korean: "?????", vietnamese: "Hãy giúp tôi", romanization: "do-wa-ju-se-yo", level: "A1", category: "Kh?n c?p", tips: "Gi?ng kh?n thi?t, nh?n 'do-wa'" },
  // A2
  { id: "p9", korean: "???? ????", vietnamese: "Tôi h?c ti?ng Hàn", romanization: "han-gu-geo-reul gong-bu-hae-yo", level: "A2", category: "H?c t?p", tips: "Chú ý liên âm: 'geo-reul' d?c li?n" },
  { id: "p10", korean: "??? ???", vietnamese: "Th?i ti?t d?p", romanization: "nal-ssi-ga jo-a-yo", level: "A2", category: "Th?i ti?t", tips: "'??' d?c là 'nal-ssi', âm dôi ss" },
  { id: "p11", korean: "???? ??", vietnamese: "Tôi di tàu di?n ng?m", romanization: "ji-ha-cheo-reul ta-yo", level: "A2", category: "Giao thông", tips: "Liên âm 'cheo-reul' d?c li?n m?ch" },
  { id: "p12", korean: "?? ???", vietnamese: "Tôi dói b?ng", romanization: "bae-ga go-pa-yo", level: "A2", category: "C?m giác", tips: "'???' t? '???' — bi?n d?i b?t quy t?c" },
  { id: "p13", korean: "??? ??? ???", vietnamese: "Hãy d?i m?t chút", romanization: "jo-geum-man gi-da-ryeo ju-se-yo", level: "A2", category: "Hàng ngày", tips: "Câu dài — chia thành 2 nh?p: ??? / ??? ???" },
  // B1
  { id: "p14", korean: "??? ???? ??? ???", vietnamese: "N?u h?c cham ch? s? d?u", romanization: "yeol-sim-hi gong-bu-ha-myeon hap-gyeo-kal geo-ye-yo", level: "B1", category: "Ð?ng viên", tips: "Câu di?u ki?n — nh?n 'ha-myeon' và 'geo-ye-yo'" },
  { id: "p15", korean: "?? ??? ??? ???", vietnamese: "Tôi r?t quan tâm d?n van hóa Hàn", romanization: "han-guk mun-hwa-e gwan-si-mi ma-na-yo", level: "B1", category: "Van hóa", tips: "Liên âm 'gwan-si-mi' — ??? d?c li?n" },
  { id: "p16", korean: "???? ??? ?????", vietnamese: "Nh?t d?nh ph?i d?i mu b?o h?", romanization: "an-jeon-mo-reul ban-deu-si cha-gyong-ha-se-yo", level: "B1", category: "An toàn", tips: "T? EPS quan tr?ng — phát âm rõ t?ng âm ti?t" },
  // B2
  { id: "p17", korean: "?? ??? ?? ??? ?????", vietnamese: "B?o v? môi tru?ng là trách nhi?m c?a t?t c? chúng ta", romanization: "hwan-gyeong bo-ho-neun u-ri mo-du-ui chae-gi-mim-ni-da", level: "B2", category: "Xã h?i", tips: "Câu trang tr?ng — gi?ng d?u, rõ ràng" },
  { id: "p18", korean: "???? ??? ??? ???? ????", vietnamese: "Công ngh? AI dang phát tri?n nhanh chóng", romanization: "in-gong-ji-neung gi-su-ri ppa-reu-ge bal-jeon-ha-go it-seum-ni-da", level: "B2", category: "Công ngh?", tips: "Câu dài — chia nh?p: ???? ??? / ??? / ???? ????" },
];

const LEVEL_COLORS: Record<string, string> = { A1: "#34d399", A2: "app-accent-primary", B1: "#fb923c", B2: "#f87171" };

// --- Speech Recognition Hook ----------------------------------------------
function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError("Trình duy?t không h? tr? nh?n di?n gi?ng nói. Hãy dùng Chrome.");
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => { setIsListening(true); setTranscript(""); setError(null); };
    recognition.onresult = (e: any) => {
      const result = Array.from(e.results).map(r => r[0].transcript).join("");
      setTranscript(result);
    };
    recognition.onerror = (e: any) => {
      setError(`L?i: ${e.error === "no-speech" ? "Không nghe th?y gi?ng nói" : e.error}`);
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

// --- Score Calculator -----------------------------------------------------
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

// --- Practice Card --------------------------------------------------------
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

  const getScoreColor = (s: number) => s >= 80 ? "#34d399" : s >= 55 ? "app-accent-primary" : "#f87171";
  const getScoreLabel = (s: number) => s >= 80 ? "Xu?t s?c!" : s >= 55 ? "Khá t?t!" : "Th? l?i nhé!";

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5 hover:border-app-border transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${LEVEL_COLORS[item.level]}15`, color: LEVEL_COLORS[item.level] }}>{item.level}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-card/50 text-app-text-muted">{item.category}</span>
        </div>
        {bestScore > 0 && (
          <span className="text-[10px] font-bold" style={{ color: getScoreColor(bestScore) }}>T?t nh?t: {bestScore}</span>
        )}
      </div>

      {/* Korean text */}
      <div className="flex items-center gap-3 mb-1">
        <p className="text-white text-2xl font-bold flex-1">{item.korean}</p>
        <button onClick={speakExample} className="w-9 h-9 flex items-center justify-center rounded-xl bg-app-card/50 hover:bg-app-card/70 cursor-pointer transition-colors flex-shrink-0">
          <i className="ri-volume-up-line text-white/50 text-base"></i>
        </button>
      </div>
      <p className="text-app-text-muted text-xs font-mono mb-1">[{item.romanization}]</p>
      <p className="text-app-text-secondary text-sm mb-3">{item.vietnamese}</p>

      {/* Tips */}
      <div className="bg-app-accent-primary/5 border border-app-accent-primary/10 rounded-xl px-3 py-2 mb-4">
        <p className="text-app-accent-primary/60 text-[10px] tracking-normal mb-0.5">M?o phát âm</p>
        <p className="text-app-text-secondary text-xs">{item.tips}</p>
      </div>

      {/* Recording area */}
      <div className="space-y-3">
        {/* Transcript display */}
        <div className={`min-h-[44px] flex items-center px-3 py-2.5 rounded-xl border transition-all ${isListening ? "border-red-500/30 bg-red-500/5" : transcript ? "border-app-border bg-app-surface/50" : "border-app-border bg-white/2"}`}>
          {isListening ? (
            <div className="flex items-center gap-2 w-full">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-1 bg-red-400 rounded-full animate-pulse" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
              <p className="text-red-400/70 text-xs flex-1">{transcript || "Ðang nghe..."}</p>
            </div>
          ) : transcript ? (
            <p className="text-white/60 text-sm">{transcript}</p>
          ) : (
            <p className="text-app-text-muted text-xs">Nh?n mic d? b?t d?u nói...</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!isListening ? (
            <button onClick={startListening}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 text-red-400 text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-mic-line"></i>B?t d?u nói
            </button>
          ) : (
            <button onClick={handleStop}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-semibold cursor-pointer whitespace-nowrap animate-pulse">
              <i className="ri-stop-circle-line"></i>D?ng l?i
            </button>
          )}
          {attempts > 0 && (
            <button onClick={() => { setLastScore(null); }} className="px-3 py-2.5 rounded-xl bg-app-card/50 border border-app-border text-app-text-muted text-xs hover:bg-white/8 cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-refresh-line"></i>
            </button>
          )}
        </div>

        {/* Error */}
        {error && <p className="text-red-400/70 text-xs">{error}</p>}

        {/* Score */}
        {lastScore !== null && !isListening && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${lastScore >= 80 ? "border-emerald-500/25 bg-emerald-500/5" : lastScore >= 55 ? "border-app-accent-primary/20 bg-app-accent-primary/5" : "border-red-500/20 bg-red-500/5"}`}>
            <div className="text-2xl font-bold" style={{ color: getScoreColor(lastScore) }}>{lastScore}</div>
            <div>
              <p className="text-sm font-bold" style={{ color: getScoreColor(lastScore) }}>{getScoreLabel(lastScore)}</p>
              <p className="text-app-text-muted text-[10px]">L?n th? #{attempts}</p>
            </div>
            {lastScore >= 80 && <i className="ri-checkbox-circle-fill text-app-accent-success text-xl ml-auto"></i>}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Page ------------------------------------------------------------
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
      title="Luy?n phát âm & Nghe"
      subtitle="Nói ti?ng Hàn — AI nh?n di?n gi?ng nói và ch?m di?m phát âm"
    >
      {/* Browser warning */}
      {!isSpeechSupported && (
        <div className="bg-app-accent-primary/8 border border-app-accent-primary/20 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
          <i className="ri-information-line text-app-accent-primary text-lg flex-shrink-0"></i>
          <p className="text-white/50 text-sm">Tính nang nh?n di?n gi?ng nói yêu c?u <strong className="text-white/70">Google Chrome</strong>. Hãy m? trang này b?ng Chrome d? s? d?ng.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "T?ng câu", value: PRACTICE_ITEMS.length, icon: "ri-mic-2-line", color: "app-accent-primary" },
          { label: "Ðã luy?n", value: totalPracticed, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Ði?m TB", value: avgScore > 0 ? `${avgScore}` : "—", icon: "ri-bar-chart-line", color: "#38bdf8" },
          { label: "Thành th?o", value: mastered, icon: "ri-trophy-line", color: "#fb923c" },
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

      {/* How it works */}
      <div className="bg-app-surface/50 border border-app-border rounded-xl px-4 py-3 mb-5 flex items-center gap-4 flex-wrap">
        {[
          { icon: "ri-volume-up-line", text: "Nghe m?u phát âm" },
          { icon: "ri-mic-line", text: "Nh?n mic và nói" },
          { icon: "ri-brain-line", text: "AI nh?n di?n gi?ng nói" },
          { icon: "ri-bar-chart-line", text: "Nh?n di?m & ph?n h?i" },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-accent-primary/10">
              <i className={`${step.icon} text-app-accent-primary text-sm`}></i>
            </div>
            <p className="text-app-text-secondary text-xs">{step.text}</p>
            {i < 3 && <i className="ri-arrow-right-line text-white/15 text-xs"></i>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center bg-app-card/50 rounded-xl p-1">
          <button onClick={() => setSelectedLevel("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedLevel === "all" ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}>T?t c?</button>
          {["A1","A2","B1","B2"].map(lv => (
            <button key={lv} onClick={() => setSelectedLevel(lv)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedLevel === lv ? "text-app-bg font-bold" : "text-app-text-secondary hover:text-white/60"}`} style={selectedLevel === lv ? { backgroundColor: LEVEL_COLORS[lv] } : {}}>{lv}</button>
          ))}
        </div>
        <div className="flex items-center bg-app-card/50 rounded-xl p-1 flex-wrap gap-0.5">
          <button onClick={() => setSelectedCategory("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedCategory === "all" ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}>T?t c?</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedCategory === cat ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}>{cat}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-app-card/50 border border-app-border rounded-xl px-3 py-2 flex-1 min-w-[160px]">
          <i className="ri-search-line text-app-text-muted text-sm"></i>
          <input type="text" placeholder="Tìm câu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-white/70 text-sm outline-none placeholder-white/20" />
        </div>
        <p className="text-app-text-muted text-xs whitespace-nowrap">{filtered.length} câu</p>
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


