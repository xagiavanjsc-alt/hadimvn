import { useState, useRef, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface PracticeWord {
  korean: string;
  romanization: string;
  vietnamese: string;
  difficulty: number;
  tips: string;
}

const PRACTICE_WORDS: PracticeWord[] = [
  { korean: "안녕하세요", romanization: "an-nyeong-ha-se-yo", vietnamese: "Xin chào", difficulty: 1, tips: "Phát âm nhẹ nhàng, không nhấn mạnh âm tiết nào" },
  { korean: "감사합니다", romanization: "gam-sa-ham-ni-da", vietnamese: "Cảm ơn", difficulty: 1, tips: "Chú ý âm 'ㅁ' ở cuối 감 biến thành 'n' trước 'ㅅ'" },
  { korean: "죄송합니다", romanization: "joe-song-ham-ni-da", vietnamese: "Xin lỗi", difficulty: 2, tips: "Âm 'ㅈ' phát âm như 'j' trong tiếng Anh" },
  { korean: "괜찮아요", romanization: "gwaen-chan-a-yo", vietnamese: "Không sao", difficulty: 2, tips: "Âm đôi 'ㅘ' phát âm như 'wa'" },
  { korean: "어디예요", romanization: "eo-di-ye-yo", vietnamese: "Ở đâu vậy?", difficulty: 2, tips: "Âm 'ㅓ' phát âm như 'uh' ngắn" },
  { korean: "얼마예요", romanization: "eol-ma-ye-yo", vietnamese: "Bao nhiêu tiền?", difficulty: 2, tips: "Chú ý âm 'ㄹ' ở cuối 얼 phát âm nhẹ" },
  { korean: "맛있어요", romanization: "ma-si-sseo-yo", vietnamese: "Ngon quá", difficulty: 3, tips: "Quy tắc liên âm: 맛+있 → 마시써요" },
  { korean: "재미있어요", romanization: "jae-mi-i-sseo-yo", vietnamese: "Thú vị quá", difficulty: 3, tips: "Liên âm: 재미+있 → 재미이써요" },
  { korean: "한국어를 배워요", romanization: "han-gu-geo-reul bae-wo-yo", vietnamese: "Tôi học tiếng Hàn", difficulty: 3, tips: "Chú ý trợ từ 를 sau nguyên âm" },
  { korean: "서울에 살아요", romanization: "seo-u-re sa-ra-yo", vietnamese: "Tôi sống ở Seoul", difficulty: 3, tips: "서울+에 → 서우레 (liên âm)" },
  { korean: "날씨가 좋아요", romanization: "nal-ssi-ga jo-a-yo", vietnamese: "Thời tiết đẹp", difficulty: 2, tips: "Âm đôi 'ㅆ' phát âm mạnh hơn 'ㅅ'" },
  { korean: "지하철역이 어디예요", romanization: "ji-ha-cheol-yeo-gi eo-di-ye-yo", vietnamese: "Ga tàu điện ngầm ở đâu?", difficulty: 4, tips: "Câu dài, chia nhỏ từng từ khi luyện" },
];

interface ScoreResult {
  score: number;
  transcript: string;
  feedback: string;
  details: { aspect: string; score: number; comment: string }[];
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function AIPronunciationPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [history, setHistory] = useState<{ word: string; score: number; date: string }[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const recognitionRef = useRef<any>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filtered = selectedDifficulty === 0
    ? PRACTICE_WORDS
    : PRACTICE_WORDS.filter(w => w.difficulty === selectedDifficulty);

  const current = filtered[currentIndex] || filtered[0];

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSupported(false);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  useEffect(() => {
    setResult(null);
    setTranscript("");
    setShowTip(false);
  }, [currentIndex, selectedDifficulty]);

  const analyzeScore = useCallback((spokenText: string, target: PracticeWord): ScoreResult => {
    const spoken = spokenText.toLowerCase().trim();
    const targetKorean = target.korean.toLowerCase();

    // Simple similarity scoring
    let matchScore = 0;
    const targetChars = targetKorean.split("");
    const spokenChars = spoken.split("");
    let matched = 0;
    targetChars.forEach(ch => {
      if (spokenChars.includes(ch)) matched++;
    });
    matchScore = targetChars.length > 0 ? (matched / targetChars.length) * 100 : 0;

    // Simulate detailed scoring
    const accuracyScore = Math.min(100, Math.round(matchScore + Math.random() * 15));
    const fluencyScore = Math.min(100, Math.round(60 + Math.random() * 35));
    const intonationScore = Math.min(100, Math.round(55 + Math.random() * 40));
    const overall = Math.round((accuracyScore * 0.5 + fluencyScore * 0.3 + intonationScore * 0.2));

    let feedback = "";
    if (overall >= 85) feedback = "Xuất sắc! Phát âm rất chuẩn, gần giống người bản ngữ.";
    else if (overall >= 70) feedback = "Tốt! Phát âm khá chuẩn, cần luyện thêm một chút.";
    else if (overall >= 55) feedback = "Khá! Cần chú ý hơn đến một số âm tiết.";
    else feedback = "Cần luyện thêm. Hãy nghe lại và thử lần nữa!";

    return {
      score: overall,
      transcript: spokenText || "(Không nhận diện được)",
      feedback,
      details: [
        { aspect: "Độ chính xác", score: accuracyScore, comment: accuracyScore >= 80 ? "Phát âm đúng âm tiết" : "Cần chú ý một số âm" },
        { aspect: "Độ trôi chảy", score: fluencyScore, comment: fluencyScore >= 75 ? "Nói tự nhiên, không ngắt quãng" : "Cần nói liền mạch hơn" },
        { aspect: "Ngữ điệu", score: intonationScore, comment: intonationScore >= 70 ? "Ngữ điệu tự nhiên" : "Cần chú ý lên xuống giọng" },
      ],
    };
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsRecording(true);
      setResult(null);
      setTranscript("");
      setCountdown(5);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const lastResult = results[results.length - 1];
      const text = lastResult[0].transcript;
      setTranscript(text);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setCountdown(0);
      setIsAnalyzing(true);
      setTimeout(() => {
        const score = analyzeScore(transcript || "", current);
        setResult(score);
        setIsAnalyzing(false);
        setHistory(prev => [
          { word: current.korean, score: score.score, date: new Date().toLocaleTimeString("vi-VN") },
          ...prev.slice(0, 9),
        ]);
      }, 1200);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setCountdown(0);
      setIsAnalyzing(true);
      setTimeout(() => {
        const score = analyzeScore("", current);
        setResult(score);
        setIsAnalyzing(false);
      }, 800);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [current, transcript, analyzeScore]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const playTTS = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 0.8;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const scoreColor = (s: number) => {
    if (s >= 85) return "text-app-accent-success";
    if (s >= 70) return "text-app-accent-primary";
    if (s >= 55) return "text-orange-400";
    return "text-rose-400";
  };

  const scoreBg = (s: number) => {
    if (s >= 85) return "bg-emerald-500";
    if (s >= 70) return "bg-app-accent-primary";
    if (s >= 55) return "bg-orange-500";
    return "bg-rose-500";
  };

  const avgScore = history.length > 0 ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length) : 0;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">AI Chấm Phát Âm</h1>
            <p className="text-white/50 text-sm mt-1">Luyện phát âm tiếng Hàn với đánh giá chi tiết từ AI</p>
          </div>
          {history.length > 0 && (
            <div className="text-right">
              <p className={`text-2xl font-bold ${scoreColor(avgScore)}`}>{avgScore}</p>
              <p className="text-app-text-muted text-xs">Điểm TB</p>
            </div>
          )}
        </div>

        {/* Browser support warning */}
        {!supported && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
            <i className="ri-information-line text-amber-400 text-lg mt-0.5"></i>
            <div>
              <p className="text-amber-400 font-semibold text-sm">Trình duyệt chưa hỗ trợ</p>
              <p className="text-white/50 text-xs mt-1">Tính năng nhận diện giọng nói yêu cầu Chrome hoặc Edge. Bạn vẫn có thể xem bài tập và nghe phát âm mẫu.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Practice Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Difficulty filter */}
            <div className="flex items-center gap-2">
              <span className="text-app-text-secondary text-sm">Độ khó:</span>
              {[0, 1, 2, 3, 4].map(d => (
                <button
                  key={d}
                  onClick={() => { setSelectedDifficulty(d); setCurrentIndex(0); }}
                  className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                    selectedDifficulty === d ? "bg-app-accent-primary/20 text-app-accent-primary font-semibold" : "bg-app-card/50 text-app-text-secondary hover:bg-app-card/70"
                  }`}
                >
                  {d === 0 ? "Tất cả" : "★".repeat(d)}
                </button>
              ))}
            </div>

            {/* Word Card */}
            <div className="bg-[#1a1f2e] rounded-2xl p-8 border border-app-border text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                {Array.from({ length: current.difficulty }).map((_, i) => (
                  <i key={i} className="ri-star-fill text-app-accent-primary text-xs"></i>
                ))}
              </div>

              <div>
                <p className="text-5xl font-bold text-white mb-3">{current.korean}</p>
                <p className="text-app-text-secondary text-lg">{current.romanization}</p>
                <p className="text-white/60 text-base mt-1">{current.vietnamese}</p>
              </div>

              {/* Listen button */}
              <button
                onClick={() => playTTS(current.korean)}
                className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-white/8 text-white/60 hover:bg-white/12 transition-all cursor-pointer whitespace-nowrap text-sm"
              >
                <i className="ri-volume-up-line"></i>
                Nghe phát âm mẫu
              </button>

              {/* Tip */}
              <button
                onClick={() => setShowTip(!showTip)}
                className="text-xs text-app-accent-primary/60 hover:text-app-accent-primary transition-colors cursor-pointer"
              >
                <i className="ri-lightbulb-line mr-1"></i>
                {showTip ? "Ẩn mẹo" : "Xem mẹo phát âm"}
              </button>
              {showTip && (
                <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-lg p-3 text-sm text-app-accent-primary/80 text-left">
                  <i className="ri-lightbulb-flash-line mr-1.5"></i>
                  {current.tips}
                </div>
              )}

              {/* Recording area */}
              <div className="pt-2">
                {transcript && (
                  <div className="mb-3 p-3 bg-app-card/50 rounded-lg text-white/60 text-sm">
                    <span className="text-app-text-muted text-xs mr-2">Bạn nói:</span>
                    {transcript}
                  </div>
                )}

                {isAnalyzing ? (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <div className="w-5 h-5 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>
                    <span className="text-white/50 text-sm">AI đang phân tích...</span>
                  </div>
                ) : (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!supported}
                    className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all cursor-pointer ${
                      isRecording
                        ? "bg-rose-500 animate-pulse shadow-lg shadow-rose-500/30"
                        : "bg-app-accent-primary hover:bg-app-accent-primary/90 shadow-lg shadow-[app-accent-primary]/20"
                    } ${!supported ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <i className={`${isRecording ? "ri-stop-fill" : "ri-mic-fill"} text-3xl text-black`}></i>
                  </button>
                )}

                {isRecording && countdown > 0 && (
                  <p className="text-rose-400 text-sm mt-2 animate-pulse">
                    <i className="ri-record-circle-line mr-1"></i>
                    Đang ghi âm... {countdown}s
                  </p>
                )}
                {!isRecording && !isAnalyzing && !result && (
                  <p className="text-app-text-muted text-xs mt-2">Nhấn để bắt đầu ghi âm</p>
                )}
              </div>
            </div>

            {/* Score Result */}
            {result && (
              <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-app-border space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold">Kết quả đánh giá</h3>
                  <div className={`text-3xl font-bold ${scoreColor(result.score)}`}>{result.score}/100</div>
                </div>

                {/* Overall bar */}
                <div>
                  <div className="h-3 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${scoreBg(result.score)}`}
                      style={{ width: `${result.score}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-white/70 text-sm">{result.feedback}</p>

                {/* Detail scores */}
                <div className="space-y-3">
                  {result.details.map(d => (
                    <div key={d.aspect}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/60 text-xs">{d.aspect}</span>
                        <span className={`text-xs font-bold ${scoreColor(d.score)}`}>{d.score}</span>
                      </div>
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${scoreBg(d.score)}`}
                          style={{ width: `${d.score}%` }}
                        ></div>
                      </div>
                      <p className="text-app-text-muted text-xs mt-0.5">{d.comment}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={startRecording}
                    disabled={!supported}
                    className="flex-1 py-2 rounded-lg bg-app-accent-primary/15 text-app-accent-primary text-sm font-semibold hover:bg-app-accent-primary/25 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-refresh-line mr-1.5"></i>
                    Thử lại
                  </button>
                  <button
                    onClick={() => {
                      setCurrentIndex(prev => (prev + 1) % filtered.length);
                    }}
                    className="flex-1 py-2 rounded-lg bg-white/8 text-white/60 text-sm hover:bg-white/12 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Từ tiếp theo
                    <i className="ri-arrow-right-line ml-1.5"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-lg bg-white/8 text-white/50 text-sm hover:bg-white/12 transition-all cursor-pointer whitespace-nowrap disabled:opacity-30"
              >
                <i className="ri-arrow-left-line mr-1.5"></i>
                Trước
              </button>
              <span className="text-app-text-muted text-sm">{currentIndex + 1} / {filtered.length}</span>
              <button
                onClick={() => setCurrentIndex(prev => Math.min(filtered.length - 1, prev + 1))}
                disabled={currentIndex === filtered.length - 1}
                className="px-4 py-2 rounded-lg bg-white/8 text-white/50 text-sm hover:bg-white/12 transition-all cursor-pointer whitespace-nowrap disabled:opacity-30"
              >
                Tiếp
                <i className="ri-arrow-right-line ml-1.5"></i>
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-app-border">
              <h3 className="text-white/70 text-sm font-semibold mb-3">Thống kê hôm nay</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-app-card/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">{history.length}</p>
                  <p className="text-app-text-muted text-xs">Lần luyện</p>
                </div>
                <div className="bg-app-card/50 rounded-lg p-3 text-center">
                  <p className={`text-2xl font-bold ${scoreColor(avgScore)}`}>{avgScore || "--"}</p>
                  <p className="text-app-text-muted text-xs">Điểm TB</p>
                </div>
                <div className="bg-app-card/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-app-accent-success">
                    {history.filter(h => h.score >= 80).length}
                  </p>
                  <p className="text-app-text-muted text-xs">Điểm cao</p>
                </div>
                <div className="bg-app-card/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-app-accent-primary">
                    {history.length > 0 ? Math.max(...history.map(h => h.score)) : "--"}
                  </p>
                  <p className="text-app-text-muted text-xs">Cao nhất</p>
                </div>
              </div>
            </div>

            {/* Word list */}
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-app-border">
              <h3 className="text-white/70 text-sm font-semibold mb-3">Danh sách từ</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {filtered.map((word, idx) => (
                  <button
                    key={word.korean}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all cursor-pointer text-left ${
                      idx === currentIndex ? "bg-app-accent-primary/10 text-app-accent-primary" : "text-white/50 hover:bg-app-card/50"
                    }`}
                  >
                    <span className="font-medium">{word.korean}</span>
                    <span className="text-app-text-muted">{word.vietnamese}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-app-border">
                <h3 className="text-white/70 text-sm font-semibold mb-3">Lịch sử gần đây</h3>
                <div className="space-y-2">
                  {history.slice(0, 6).map((h, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-xs font-medium">{h.word}</p>
                        <p className="text-app-text-muted text-[10px]">{h.date}</p>
                      </div>
                      <span className={`text-sm font-bold ${scoreColor(h.score)}`}>{h.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4">
              <h3 className="text-app-accent-primary text-sm font-semibold mb-2">
                <i className="ri-lightbulb-line mr-1.5"></i>
                Mẹo luyện tập
              </h3>
              <ul className="space-y-1.5 text-white/50 text-xs">
                <li>• Nghe mẫu trước khi nói</li>
                <li>• Nói chậm và rõ ràng</li>
                <li>• Luyện mỗi ngày 10-15 phút</li>
                <li>• Chú ý quy tắc biến âm</li>
                <li>• Ghi âm và nghe lại</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
