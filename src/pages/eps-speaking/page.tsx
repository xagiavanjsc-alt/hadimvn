import { useState, useRef, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface SpeakingQuestion {
  id: string;
  korean: string;
  vietnamese: string;
  romanization: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  tips: string;
}

const speakingQuestions: SpeakingQuestion[] = [
  { id: "s1", korean: "?????", vietnamese: "Xin chào", romanization: "An-nyeong-ha-se-yo", topic: "Chào h?i", difficulty: "easy", tips: "Nh?n m?nh âm 'nyeong', gi?ng lên ? cu?i" },
  { id: "s2", korean: "?????", vietnamese: "C?m on", romanization: "Gam-sa-ham-ni-da", topic: "Chào h?i", difficulty: "easy", tips: "Âm 'sa' ng?n, 'ham-ni-da' d?c li?n m?ch" },
  { id: "s3", korean: "?????", vietnamese: "Xin l?i", romanization: "Joe-song-ham-ni-da", topic: "Chào h?i", difficulty: "medium", tips: "Âm 'joe' d?c nhu 'choe', không ph?i 'joe' ti?ng Anh" },
  { id: "s4", korean: "?? ??? ?????", vietnamese: "Tôi là ngu?i Vi?t Nam", romanization: "Jeo-neun be-teu-nam sa-ram-im-ni-da", topic: "Gi?i thi?u", difficulty: "medium", tips: "??? d?c rõ t?ng âm ti?t" },
  { id: "s5", korean: "????? ??? ??? ???", vietnamese: "Ph?i tuân th? an toàn t?i noi làm vi?c", romanization: "Ja-geop-jang-e-seo an-jeo-neul ji-kyeo-ya ham-ni-da", topic: "An toàn lao d?ng", difficulty: "hard", tips: "Câu dài, chia nh?: ????? / ??? / ??? ???" },
  { id: "s6", korean: "???? ??? ????", vietnamese: "Nhà v? sinh ? dâu?", romanization: "Hwa-jang-si-ri eo-di-e i-sseo-yo?", topic: "Sinh ho?t", difficulty: "easy", tips: "Gi?ng lên ? cu?i vì là câu h?i" },
  { id: "s7", korean: "??? ?? ???", vietnamese: "Tôi mu?n d?n b?nh vi?n", romanization: "Byeong-wo-ne ga-go si-peo-yo", topic: "S?c kh?e", difficulty: "medium", tips: "?? = byeong-won, không ph?i byeong-weon" },
  { id: "s8", korean: "??? ?????", vietnamese: "Luong tháng là bao nhiêu?", romanization: "Wol-geu-bi eol-ma-ye-yo?", topic: "Công vi?c", difficulty: "medium", tips: "?? d?c li?n: wol-geup, không tách r?i" },
  { id: "s9", korean: "???? ??? ???", vietnamese: "Vui lòng ký vào h?p d?ng", romanization: "Gye-yak-seo-e seo-myeong-hae ju-se-yo", topic: "Pháp lu?t", difficulty: "hard", tips: "??? = gye-yak-seo, chú ý âm 'yak'" },
  { id: "s10", korean: "?? ???? ?????", vietnamese: "Tr?m xe buýt ? dâu?", romanization: "Beo-seu jeong-nyu-jang-i eo-di-ye-yo?", topic: "Giao thông", difficulty: "easy", tips: "??? d?c: jeong-nyu-jang, âm 'nyu' nh?" },
  { id: "s11", korean: "?? ? ?? ?????", vietnamese: "Hôm nay m?y gi? tan ca?", romanization: "O-neul myeot si-e toe-geun-hae-yo?", topic: "Công vi?c", difficulty: "medium", tips: "?? = toe-geun, âm 'oe' nhu 'oe' trong ti?ng Vi?t" },
  { id: "s12", korean: "???? ? ?? ???", vietnamese: "Ph?i d?i mu b?o h?", romanization: "An-jeon-mo-reul kkok sseo-ya ham-ni-da", topic: "An toàn lao d?ng", difficulty: "hard", tips: "? nh?n m?nh, ?? d?c: sseo-ya" },
  { id: "s13", korean: "?? ??? ????", vietnamese: "Ð? an Hàn Qu?c ngon", romanization: "Han-guk eum-si-gi ma-si-sseo-yo", topic: "Van hóa", difficulty: "easy", tips: "???? d?c: ma-si-sseo-yo, không ph?i mat-it" },
  { id: "s14", korean: "????? ??? ????", vietnamese: "Ga tàu di?n ng?m ? dâu?", romanization: "Ji-ha-cheol-lyeo-gi eo-di-e i-sseo-yo?", topic: "Giao thông", difficulty: "medium", tips: "???? d?c li?n: ji-ha-cheol-lyeok" },
  { id: "s15", korean: "??? ????", vietnamese: "Tôi c?n giúp d?", romanization: "Do-u-mi pi-ryo-hae-yo", topic: "Sinh ho?t", difficulty: "easy", tips: "?? = pi-ryo, âm 'ryo' nh? và nhanh" },
];

const topicColors: Record<string, string> = {
  "Chào h?i": "bg-emerald-500/10 text-app-accent-success border-emerald-500/20",
  "Gi?i thi?u": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "An toàn lao d?ng": "bg-red-500/10 text-red-400 border-red-500/20",
  "Sinh ho?t": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "S?c kh?e": "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "Công vi?c": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Pháp lu?t": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Giao thông": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Van hóa": "bg-lime-500/10 text-lime-400 border-lime-500/20",
};

const difficultyLabel: Record<string, string> = {
  easy: "D?",
  medium: "Trung bình",
  hard: "Khó",
};

const difficultyColor: Record<string, string> = {
  easy: "text-app-accent-success",
  medium: "text-amber-400",
  hard: "text-red-400",
};

type RecognitionState = "idle" | "listening" | "processing" | "done";

interface ScoreResult {
  score: number;
  feedback: string;
  matchedWords: string[];
  missedWords: string[];
}

interface PronunciationRecord {
  date: string;
  questionId: string;
  korean: string;
  score: number;
  topic: string;
}

function scoreTranscript(original: string, transcript: string): ScoreResult {
  const origWords = original.replace(/[?!.,]/g, "").split(" ").filter(Boolean);
  const transWords = transcript.replace(/[?!.,]/g, "").toLowerCase().split(" ").filter(Boolean);

  const matched: string[] = [];
  const missed: string[] = [];

  origWords.forEach(word => {
    const wordLower = word.toLowerCase();
    if (transWords.some(t => t.includes(wordLower) || wordLower.includes(t))) {
      matched.push(word);
    } else {
      missed.push(word);
    }
  });

  const score = origWords.length > 0 ? Math.round((matched.length / origWords.length) * 100) : 0;

  let feedback = "";
  if (score >= 90) feedback = "Xu?t s?c! Phát âm r?t chu?n!";
  else if (score >= 70) feedback = "T?t! C?n luy?n thêm m?t chút.";
  else if (score >= 50) feedback = "Khá ?n! Hãy nghe l?i và th? l?n n?a.";
  else feedback = "C?n luy?n t?p thêm. Ð?ng n?n lòng!";

  return { score, feedback, matchedWords: matched, missedWords: missed };
}

export default function EpsSpeakingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterTopic, setFilterTopic] = useState("T?t c?");
  const [filterDiff, setFilterDiff] = useState("all");
  const [recognitionState, setRecognitionState] = useState<RecognitionState>("idle");
  const [transcript, setTranscript] = useState("");
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [showRomanization, setShowRomanization] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [xpData, setXpData] = useLocalStorage<{ total: number }>("kts_xp_total", { total: 0 });
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, xpEarned: 0 });
  const [pronHistory, setPronHistory] = useLocalStorage<PronunciationRecord[]>("kts_pron_history", []);
  const [showStats, setShowStats] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const topics = ["T?t c?", ...Array.from(new Set(speakingQuestions.map(q => q.topic)))];

  const filtered = speakingQuestions.filter(q => {
    const topicOk = filterTopic === "T?t c?" || q.topic === filterTopic;
    const diffOk = filterDiff === "all" || q.difficulty === filterDiff;
    return topicOk && diffOk;
  });

  const current = filtered[currentIndex] || filtered[0];

  useEffect(() => {
    setCurrentIndex(0);
    setScoreResult(null);
    setTranscript("");
    setRecognitionState("idle");
  }, [filterTopic, filterDiff]);

  const speakKorean = useCallback(() => {
    if (!current) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(current.korean);
    utt.lang = "ko-KR";
    utt.rate = 0.85;
    utt.pitch = 1;
    synth.speak(utt);
  }, [current]);

  const speakSlow = useCallback(() => {
    if (!current) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(current.korean);
    utt.lang = "ko-KR";
    utt.rate = 0.55;
    utt.pitch = 1;
    synth.speak(utt);
  }, [current]);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duy?t c?a b?n không h? tr? nh?n d?ng gi?ng nói. Hãy dùng Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    setRecognitionState("listening");
    setTranscript("");
    setScoreResult(null);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setRecognitionState("processing");

      setTimeout(() => {
        const score = scoreTranscript(current.korean, result);
        setScoreResult(score);
        setRecognitionState("done");
        setAttempts(prev => prev + 1);
        setSessionStats(prev => ({
          correct: prev.correct + (score.score >= 70 ? 1 : 0),
          total: prev.total + 1,
          xpEarned: prev.xpEarned + (score.score >= 70 ? 20 : 5),
        }));
        setPronHistory(prev => [{
          date: new Date().toISOString(),
          questionId: current.id,
          korean: current.korean,
          score: score.score,
          topic: current.topic,
        }, ...prev].slice(0, 100));
        if (score.score >= 70) {
          setXpData(prev => ({ total: (prev.total || 0) + 20 }));
        } else {
          setXpData(prev => ({ total: (prev.total || 0) + 5 }));
        }
      }, 500);
    };

    recognition.onerror = () => {
      setRecognitionState("idle");
    };

    recognition.onend = () => {
      if (recognitionState === "listening") {
        setRecognitionState("idle");
      }
    };

    recognition.start();
  }, [current, recognitionState, setXpData]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setRecognitionState("idle");
  }, []);

  const nextQuestion = () => {
    setCurrentIndex(prev => (prev + 1) % filtered.length);
    setScoreResult(null);
    setTranscript("");
    setRecognitionState("idle");
    setAttempts(0);
    setShowRomanization(false);
    setShowTips(false);
  };

  const prevQuestion = () => {
    setCurrentIndex(prev => (prev - 1 + filtered.length) % filtered.length);
    setScoreResult(null);
    setTranscript("");
    setRecognitionState("idle");
    setAttempts(0);
    setShowRomanization(false);
    setShowTips(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-app-accent-success";
    if (score >= 70) return "text-amber-400";
    if (score >= 50) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-emerald-500/10 border-emerald-500/20";
    if (score >= 70) return "bg-amber-500/10 border-amber-500/20";
    if (score >= 50) return "bg-orange-500/10 border-orange-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  if (!current) return null;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Luy?n nói EPS
            </h1>
            <p className="text-app-text-secondary text-sm mt-0.5">Ghi âm gi?ng nói và so sánh v?i phát âm chu?n ti?ng Hàn</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-app-card/50 rounded-xl px-4 py-2 text-center">
              <p className="text-app-text-secondary text-xs">Ðúng</p>
              <p className="text-app-accent-success font-bold text-lg">{sessionStats.correct}/{sessionStats.total}</p>
            </div>
            <div className="bg-app-card/50 rounded-xl px-4 py-2 text-center">
              <p className="text-app-text-secondary text-xs">XP ki?m du?c</p>
              <p className="text-amber-400 font-bold text-lg">+{sessionStats.xpEarned}</p>
            </div>
            <button
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center gap-2 border rounded-xl px-4 py-2 text-sm transition-all cursor-pointer whitespace-nowrap ${showStats ? "bg-violet-500/15 border-violet-500/30 text-violet-400" : "bg-app-card/50 border-app-border text-white/50 hover:text-white/80"}`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-bar-chart-line text-sm"></i>
              </div>
              Th?ng kê
            </button>
          </div>
        </div>

        {/* Stats Panel */}
        {showStats && (() => {
          const last30 = pronHistory.slice(0, 30);
          const avgScore = last30.length > 0 ? Math.round(last30.reduce((s, r) => s + r.score, 0) / last30.length) : 0;
          const best = last30.length > 0 ? Math.max(...last30.map(r => r.score)) : 0;
          const topicStats = last30.reduce<Record<string, { total: number; sum: number }>>((acc, r) => {
            if (!acc[r.topic]) acc[r.topic] = { total: 0, sum: 0 };
            acc[r.topic].total++;
            acc[r.topic].sum += r.score;
            return acc;
          }, {});

          return (
            <div className="bg-app-card/50 border border-app-border rounded-2xl p-6 space-y-5">
              <h3 className="text-white font-semibold">Th?ng kê phát âm</h3>

              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Ði?m TB (30 l?n g?n nh?t)", value: `${avgScore}%`, color: avgScore >= 70 ? "text-app-accent-success" : "text-amber-400" },
                  { label: "Ði?m cao nh?t", value: `${best}%`, color: "text-amber-400" },
                  { label: "T?ng l?n luy?n", value: pronHistory.length.toString(), color: "text-sky-400" },
                ].map(stat => (
                  <div key={stat.label} className="bg-app-card/50 rounded-xl p-3 text-center">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-app-text-muted text-xs mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Score chart (last 10) */}
              {last30.length > 0 && (
                <div>
                  <p className="text-app-text-secondary text-xs mb-3">Ði?m 10 l?n g?n nh?t</p>
                  <div className="flex items-end gap-1.5 h-16">
                    {last30.slice(0, 10).reverse().map((r, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={`w-full rounded-sm transition-all ${r.score >= 90 ? "bg-emerald-500" : r.score >= 70 ? "bg-amber-500" : r.score >= 50 ? "bg-orange-500" : "bg-red-500"}`}
                          style={{ height: `${Math.max(4, r.score * 0.6)}px` }}
                        />
                        <span className="text-app-text-muted text-[9px]">{r.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topic breakdown */}
              {Object.keys(topicStats).length > 0 && (
                <div>
                  <p className="text-app-text-secondary text-xs mb-3">Ði?m theo ch? d?</p>
                  <div className="space-y-2">
                    {Object.entries(topicStats).map(([topic, stat]) => {
                      const avg = Math.round(stat.sum / stat.total);
                      return (
                        <div key={topic} className="flex items-center gap-3">
                          <span className="text-white/50 text-xs w-28 flex-shrink-0">{topic}</span>
                          <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${avg >= 70 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${avg}%` }} />
                          </div>
                          <span className={`text-xs font-medium w-10 text-right ${avg >= 70 ? "text-app-accent-success" : "text-amber-400"}`}>{avg}%</span>
                          <span className="text-app-text-muted text-xs w-12 text-right">{stat.total} l?n</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent history */}
              {pronHistory.length > 0 && (
                <div>
                  <p className="text-app-text-secondary text-xs mb-3">L?ch s? g?n dây</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {pronHistory.slice(0, 15).map((r, i) => (
                      <div key={i} className="flex items-center gap-3 py-1.5 border-b border-app-border last:border-0">
                        <span className="text-white/60 text-xs font-medium flex-1" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{r.korean}</span>
                        <span className="text-app-text-muted text-xs">{r.topic}</span>
                        <span className={`text-xs font-bold w-10 text-right ${r.score >= 90 ? "text-app-accent-success" : r.score >= 70 ? "text-amber-400" : "text-red-400"}`}>{r.score}%</span>
                        <span className="text-app-text-muted text-[10px] w-16 text-right">{new Date(r.date).toLocaleDateString("vi-VN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pronHistory.length === 0 && (
                <p className="text-app-text-muted text-sm text-center py-4">Chua có l?ch s? luy?n nói. Hãy b?t d?u luy?n t?p!</p>
              )}
            </div>
          );
        })()}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 flex-wrap">
            {topics.map(t => (
              <button
                key={t}
                onClick={() => setFilterTopic(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  filterTopic === t ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-app-card/50 text-app-text-secondary hover:text-white/70 border border-transparent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-1 ml-auto">
            {[["all", "T?t c?"], ["easy", "D?"], ["medium", "TB"], ["hard", "Khó"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilterDiff(val)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  filterDiff === val ? "bg-white/15 text-white border border-white/20" : "bg-app-card/50 text-app-text-secondary hover:text-white/70 border border-transparent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-app-card/50 border border-app-border rounded-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-app-card/50">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / filtered.length) * 100}%` }}
            />
          </div>

          <div className="p-8">
            {/* Meta */}
            <div className="flex items-center gap-2 mb-6">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${topicColors[current.topic] || "bg-app-card/70 text-white/60 border-app-border"}`}>
                {current.topic}
              </span>
              <span className={`text-xs font-medium ${difficultyColor[current.difficulty]}`}>
                {difficultyLabel[current.difficulty]}
              </span>
              <span className="text-app-text-muted text-xs ml-auto">{currentIndex + 1} / {filtered.length}</span>
            </div>

            {/* Korean text */}
            <div className="text-center mb-8">
              <p className="text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                {current.korean}
              </p>
              <p className="text-white/50 text-lg">{current.vietnamese}</p>

              {showRomanization && (
                <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 inline-block">
                  <p className="text-amber-400 text-sm font-mono">{current.romanization}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                onClick={speakKorean}
                className="flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-app-border rounded-xl px-4 py-2.5 text-white/70 text-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-volume-up-line text-sm"></i>
                </div>
                Nghe chu?n
              </button>
              <button
                onClick={speakSlow}
                className="flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-app-border rounded-xl px-4 py-2.5 text-white/70 text-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-speed-line text-sm"></i>
                </div>
                Nghe ch?m
              </button>
              <button
                onClick={() => setShowRomanization(!showRomanization)}
                className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-sm transition-all cursor-pointer whitespace-nowrap ${
                  showRomanization ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : "bg-white/8 hover:bg-white/12 border-app-border text-white/70"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-text-spacing text-sm"></i>
                </div>
                Phiên âm
              </button>
              <button
                onClick={() => setShowTips(!showTips)}
                className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-sm transition-all cursor-pointer whitespace-nowrap ${
                  showTips ? "bg-sky-500/15 border-sky-500/30 text-sky-400" : "bg-white/8 hover:bg-white/12 border-app-border text-white/70"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-lightbulb-line text-sm"></i>
                </div>
                M?o
              </button>
            </div>

            {/* Tips */}
            {showTips && (
              <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-3 mb-6">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <i className="ri-lightbulb-flash-line text-sky-400 text-sm"></i>
                  </div>
                  <p className="text-sky-300 text-sm">{current.tips}</p>
                </div>
              </div>
            )}

            {/* Record button */}
            <div className="flex flex-col items-center gap-4">
              {recognitionState === "idle" || recognitionState === "done" ? (
                <button
                  onClick={startRecording}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <i className="ri-mic-line text-white text-2xl"></i>
                  </div>
                </button>
              ) : recognitionState === "listening" ? (
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center cursor-pointer animate-pulse shadow-lg shadow-red-500/30"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <i className="ri-stop-circle-line text-white text-2xl"></i>
                  </div>
                </button>
              ) : (
                <div className="w-20 h-20 rounded-full bg-app-card/70 flex items-center justify-center">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-loader-4-line text-white/50 text-xl animate-spin"></i>
                  </div>
                </div>
              )}

              <p className="text-app-text-secondary text-sm">
                {recognitionState === "idle" && "Nh?n d? b?t d?u ghi âm"}
                {recognitionState === "listening" && "Ðang nghe... Nói ti?ng Hàn"}
                {recognitionState === "processing" && "Ðang phân tích..."}
                {recognitionState === "done" && "Hoàn thành! Nh?n d? th? l?i"}
              </p>
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="mt-6 bg-app-card/50 border border-app-border rounded-xl p-4">
                <p className="text-app-text-secondary text-xs mb-1">B?n dã nói:</p>
                <p className="text-white text-lg font-medium" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{transcript}</p>
              </div>
            )}

            {/* Score result */}
            {scoreResult && (
              <div className={`mt-4 border rounded-xl p-5 ${getScoreBg(scoreResult.score)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Ði?m phát âm</p>
                    <p className={`text-4xl font-bold ${getScoreColor(scoreResult.score)}`}>{scoreResult.score}%</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getScoreColor(scoreResult.score)}`}>{scoreResult.feedback}</p>
                    <p className="text-app-text-secondary text-xs mt-1">+{scoreResult.score >= 70 ? 20 : 5} XP</p>
                  </div>
                </div>

                {/* Score bar */}
                <div className="h-2 bg-app-card/70 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      scoreResult.score >= 90 ? "bg-emerald-500" : scoreResult.score >= 70 ? "bg-amber-500" : scoreResult.score >= 50 ? "bg-orange-500" : "bg-red-500"
                    }`}
                    style={{ width: `${scoreResult.score}%` }}
                  />
                </div>

                {scoreResult.missedWords.length > 0 && (
                  <div>
                    <p className="text-app-text-secondary text-xs mb-2">T? c?n luy?n thêm:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {scoreResult.missedWords.map((w, i) => (
                        <span key={i} className="bg-red-500/15 border border-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevQuestion}
            className="flex items-center gap-2 bg-app-card/50 hover:bg-app-card/70 border border-app-border rounded-xl px-4 py-2.5 text-white/60 text-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-left-line text-sm"></i>
            </div>
            Câu tru?c
          </button>

          <div className="flex gap-1">
            {filtered.slice(Math.max(0, currentIndex - 2), Math.min(filtered.length, currentIndex + 3)).map((_, i) => {
              const idx = Math.max(0, currentIndex - 2) + i;
              return (
                <button
                  key={idx}
                  onClick={() => { setCurrentIndex(idx); setScoreResult(null); setTranscript(""); setRecognitionState("idle"); }}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${idx === currentIndex ? "bg-amber-400 w-6" : "bg-app-border/200 hover:bg-white/40"}`}
                />
              );
            })}
          </div>

          <button
            onClick={nextQuestion}
            className="flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl px-4 py-2.5 text-amber-400 text-sm transition-all cursor-pointer whitespace-nowrap"
          >
            Câu ti?p
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-right-line text-sm"></i>
            </div>
          </button>
        </div>

        {/* Tips box */}
        <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 rounded-lg flex-shrink-0">
              <i className="ri-information-line text-amber-400 text-sm"></i>
            </div>
            <div>
              <p className="text-white/60 text-sm font-medium mb-1">Hu?ng d?n s? d?ng</p>
              <p className="text-white/35 text-xs leading-relaxed">
                1. Nh?n "Nghe chu?n" d? nghe phát âm m?u. 2. Nh?n nút d? d? ghi âm gi?ng nói c?a b?n. 3. H? th?ng s? so sánh và cho di?m phát âm. 4. Dùng Chrome d? có k?t qu? t?t nh?t.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

