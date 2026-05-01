import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TranscriptLine {
  line: string;
  translation: string;
}

interface VocabItem {
  korean: string;
  vietnamese: string;
  pronunciation: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface ListeningTrack {
  id: string;
  title: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  topic: string;
  duration_sec: number;
  description: string;
  audio_url: string | null;
  transcript: TranscriptLine[];
  vocabulary: VocabItem[];
  questions: QuizQuestion[];
  tags: string[];
  is_premium: boolean;
  play_count: number;
}

const LEVEL_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; desc: string }> = {
  A1: { color: "#34d399", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Sơ cấp 1", desc: "Người mới bắt đầu" },
  A2: { color: "#84cc16", bg: "bg-lime-500/10", border: "border-lime-500/20", label: "Sơ cấp 2", desc: "Cơ bản" },
  B1: { color: "#e8c84a", bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Trung cấp 1", desc: "Trung bình" },
  B2: { color: "#fb923c", bg: "bg-orange-500/10", border: "border-orange-500/20", label: "Trung cấp 2", desc: "Trên trung bình" },
  C1: { color: "#f87171", bg: "bg-red-500/10", border: "border-red-500/20", label: "Cao cấp", desc: "Nâng cao" },
};

// ─── Audio Player Modal ───────────────────────────────────────────────────────
function AudioPlayer({ track, onClose }: { track: ListeningTrack; onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<"transcript" | "vocab" | "quiz">("transcript");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [highlightLine, setHighlightLine] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cfg = LEVEL_CONFIG[track.level] || LEVEL_CONFIG.A1;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= track.duration_sec) {
            setIsPlaying(false);
            return track.duration_sec;
          }
          const lineIdx = Math.floor((prev / track.duration_sec) * track.transcript.length);
          setHighlightLine(Math.min(lineIdx, track.transcript.length - 1));
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, track]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const progress = track.duration_sec > 0 ? (currentTime / track.duration_sec) * 100 : 0;
  const score = submitted ? track.questions.filter((q, i) => answers[i] === q.answer).length : 0;

  const speak = (text: string) => {
    if (window.speechSynthesis) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "ko-KR";
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#0f1117] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} border ${cfg.border}`} style={{ color: cfg.color }}>
                  {track.level} · {cfg.label}
                </span>
                <span className="text-white/30 text-xs">{track.topic}</span>
                {track.is_premium && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#e8c84a]/15 text-[#e8c84a] border border-[#e8c84a]/25">VIP</span>
                )}
              </div>
              <h2 className="text-white font-bold text-xl">{track.title}</h2>
              <p className="text-white/40 text-sm mt-1">{track.description}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 cursor-pointer flex-shrink-0">
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Audio note */}
          {!track.audio_url && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#e8c84a]/8 border border-[#e8c84a]/15 mb-4">
              <i className="ri-information-line text-[#e8c84a] text-sm flex-shrink-0"></i>
              <p className="text-[#e8c84a]/80 text-xs">Audio thật sẽ được tích hợp cho thành viên VIP. Hiện tại bạn có thể đọc transcript và dùng TTS.</p>
            </div>
          )}

          {/* Progress bar */}
          <div className="mb-4">
            <div
              className="h-2 bg-white/8 rounded-full overflow-hidden cursor-pointer"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                setCurrentTime(Math.floor(pct * track.duration_sec));
              }}
            >
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: cfg.color }}></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-white/30 text-xs">{formatTime(currentTime)}</span>
              <span className="text-white/30 text-xs">{formatTime(track.duration_sec)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button onClick={() => setCurrentTime(Math.max(0, currentTime - 10))} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 cursor-pointer">
              <i className="ri-replay-10-line text-lg"></i>
            </button>
            <button
              onClick={() => setIsPlaying(v => !v)}
              className="w-14 h-14 flex items-center justify-center rounded-full text-[#141720] cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: cfg.color }}
            >
              <i className={`${isPlaying ? "ri-pause-fill" : "ri-play-fill"} text-2xl`}></i>
            </button>
            <button onClick={() => setCurrentTime(Math.min(track.duration_sec, currentTime + 10))} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 cursor-pointer">
              <i className="ri-forward-10-line text-lg"></i>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {(["transcript", "vocab", "quiz"] as const).map(tab => {
              const labels = { transcript: "Transcript", vocab: "Từ vựng", quiz: "Kiểm tra" };
              const icons = { transcript: "ri-file-text-line", vocab: "ri-translate-2", quiz: "ri-survey-line" };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab ? "text-[#141720]" : "bg-white/5 text-white/40 hover:text-white/60"
                  }`}
                  style={activeTab === tab ? { backgroundColor: cfg.color } : {}}
                >
                  <i className={icons[tab]}></i>
                  {labels[tab]}
                </button>
              );
            })}
            {activeTab === "transcript" && (
              <button
                onClick={() => setShowTranslation(v => !v)}
                className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${showTranslation ? "bg-white/10 text-white/60" : "text-white/25 hover:text-white/40"}`}
              >
                <i className="ri-translate-2 text-xs"></i>
                {showTranslation ? "Ẩn dịch" : "Hiện dịch"}
              </button>
            )}
          </div>

          {/* Transcript */}
          {activeTab === "transcript" && (
            <div className="bg-white/3 rounded-2xl p-4 space-y-3 max-h-72 overflow-y-auto">
              {track.transcript.map((item, i) => (
                <div key={i} className={`transition-all ${i === highlightLine && isPlaying ? "opacity-100" : "opacity-60"}`}>
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => speak(item.line)}
                      className="w-5 h-5 flex items-center justify-center rounded flex-shrink-0 mt-0.5 hover:bg-white/10 text-white/30 cursor-pointer"
                    >
                      <i className="ri-volume-up-line text-xs"></i>
                    </button>
                    <div>
                      <p className={`text-sm leading-relaxed ${i === highlightLine && isPlaying ? "text-white font-medium" : "text-white/70"}`}>{item.line}</p>
                      {showTranslation && <p className="text-white/35 text-xs mt-0.5 italic">{item.translation}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vocabulary */}
          {activeTab === "vocab" && (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {track.vocabulary.map((v, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${cfg.color}15` }}>
                    <span className="text-xs font-bold" style={{ color: cfg.color }}>{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">{v.korean}</span>
                      <span className="text-white/30 text-xs">[{v.pronunciation}]</span>
                    </div>
                    <p className="text-white/50 text-xs">{v.vietnamese}</p>
                  </div>
                  <button onClick={() => speak(v.korean)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 cursor-pointer">
                    <i className="ri-volume-up-line text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quiz */}
          {activeTab === "quiz" && (
            <div className="space-y-4 max-h-72 overflow-y-auto">
              {track.questions.map((q, qi) => (
                <div key={qi} className="bg-white/3 rounded-2xl p-4">
                  <p className="text-white font-medium text-sm mb-3">{qi + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = answers[qi] === oi;
                      const isCorrect = submitted && oi === q.answer;
                      const isWrong = submitted && isSelected && oi !== q.answer;
                      return (
                        <button
                          key={oi}
                          onClick={() => !submitted && setAnswers(prev => ({ ...prev, [qi]: oi }))}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer border ${
                            isCorrect ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : isWrong ? "bg-red-500/15 border-red-500/30 text-red-400"
                            : isSelected ? "border-white/20 text-white"
                            : "bg-white/3 text-white/50 hover:bg-white/6 border-transparent"
                          }`}
                          style={isSelected && !submitted ? { borderColor: cfg.color, color: cfg.color, backgroundColor: `${cfg.color}10` } : {}}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {!submitted ? (
                <button
                  onClick={() => setSubmitted(true)}
                  disabled={Object.keys(answers).length < track.questions.length}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-[#141720] cursor-pointer disabled:opacity-40 transition-opacity"
                  style={{ backgroundColor: cfg.color }}
                >
                  Nộp bài
                </button>
              ) : (
                <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: `${cfg.color}10`, border: `1px solid ${cfg.color}25` }}>
                  <p className="text-white font-bold text-2xl mb-1">{score}/{track.questions.length}</p>
                  <p className="text-sm" style={{ color: cfg.color }}>
                    {score === track.questions.length ? "Xuất sắc! Bạn hiểu bài rất tốt!" : "Hãy nghe lại và thử lần nữa!"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Track Card ───────────────────────────────────────────────────────────────
function TrackCard({ track, onPlay }: { track: ListeningTrack; onPlay: () => void }) {
  const cfg = LEVEL_CONFIG[track.level] || LEVEL_CONFIG.A1;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} border ${cfg.border}`} style={{ color: cfg.color }}>
              {track.level}
            </span>
            <span className="text-white/25 text-[10px]">{track.topic}</span>
            {track.is_premium && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#e8c84a]/15 text-[#e8c84a]">VIP</span>
            )}
          </div>
          <h3 className="text-white font-semibold text-sm">{track.title}</h3>
          <p className="text-white/35 text-xs mt-1 line-clamp-2">{track.description}</p>
        </div>
        <div className="flex items-center gap-1 text-white/30 text-xs flex-shrink-0">
          <i className="ri-time-line text-xs"></i>
          {formatTime(track.duration_sec)}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {track.tags.map(tag => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30">#{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-white/25 text-xs">
          <span className="flex items-center gap-1"><i className="ri-file-text-line"></i>{track.transcript.length} dòng</span>
          <span className="flex items-center gap-1"><i className="ri-translate-2"></i>{track.vocabulary.length} từ</span>
          <span className="flex items-center gap-1"><i className="ri-survey-line"></i>{track.questions.length} câu</span>
          {track.play_count > 0 && <span className="flex items-center gap-1"><i className="ri-play-line"></i>{track.play_count}</span>}
        </div>
        {track.is_premium ? (
          <button
            onClick={onPlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-transform hover:scale-105 bg-[#e8c84a]/15 border border-[#e8c84a]/25 text-[#e8c84a]"
          >
            <i className="ri-vip-crown-fill"></i>
            VIP
          </button>
        ) : (
          <button
            onClick={onPlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#141720] cursor-pointer transition-transform hover:scale-105"
            style={{ backgroundColor: cfg.color }}
          >
            <i className="ri-play-fill"></i>
            Nghe ngay
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ListeningLevelPage() {
  const [tracks, setTracks] = useState<ListeningTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedTrack, setSelectedTrack] = useState<ListeningTrack | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("listening_tracks")
        .select("*")
        .order("level", { ascending: true });
      if (data && !error) setTracks(data as ListeningTrack[]);
      setLoading(false);
    };
    load();
  }, []);

  const levels = ["all", "A1", "A2", "B1", "B2", "C1"];
  const countByLevel = (level: string) => level === "all" ? tracks.length : tracks.filter(t => t.level === level).length;

  const filtered = tracks.filter(t => {
    const matchLevel = selectedLevel === "all" || t.level === selectedLevel;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || t.title.toLowerCase().includes(q) || t.topic.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q));
    return matchLevel && matchSearch;
  });

  const handlePlay = async (track: ListeningTrack) => {
    setSelectedTrack(track);
    // Increment play count
    await supabase.from("listening_tracks").update({ play_count: track.play_count + 1 }).eq("id", track.id);
  };

  return (
    <DashboardLayout
      title="Luyện nghe theo cấp độ"
      subtitle="Bài nghe từ A1 đến C1 với transcript, từ vựng và bài kiểm tra — dữ liệu từ Supabase"
    >
      {/* Level cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {(["A1", "A2", "B1", "B2", "C1"] as const).map(level => {
          const cfg = LEVEL_CONFIG[level];
          const count = countByLevel(level);
          return (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                selectedLevel === level ? `${cfg.bg} ${cfg.border}` : "bg-[#0f1117] border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold" style={{ color: selectedLevel === level ? cfg.color : "rgba(255,255,255,0.3)" }}>{level}</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-white/30">{count}</span>
              </div>
              <p className="text-xs font-semibold" style={{ color: selectedLevel === level ? cfg.color : "rgba(255,255,255,0.4)" }}>{cfg.label}</p>
              <p className="text-[10px] text-white/25 mt-0.5">{cfg.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm"></i>
          <input
            type="text"
            placeholder="Tìm bài nghe theo tên, chủ đề, tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f1117] border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20"
          />
        </div>
        <div className="flex gap-1.5">
          {levels.map(level => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedLevel === level ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"
              }`}
            >
              {level === "all" ? "Tất cả" : level}
              <span className="ml-1 text-[9px] opacity-60">({countByLevel(level)})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Track grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#0f1117] border border-white/5 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-white/5 rounded mb-3 w-1/3"></div>
              <div className="h-5 bg-white/5 rounded mb-2 w-2/3"></div>
              <div className="h-3 bg-white/5 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-16 text-center">
          <i className="ri-headphone-line text-white/10 text-5xl mb-4"></i>
          <p className="text-white/30 text-sm">Không tìm thấy bài nghe phù hợp</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(track => (
            <TrackCard key={track.id} track={track} onPlay={() => handlePlay(track)} />
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 bg-[#0f1117] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <i className="ri-lightbulb-line text-[#e8c84a] text-sm"></i>
          <h3 className="text-white font-semibold text-sm">Mẹo luyện nghe hiệu quả</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-white/40 leading-relaxed">
          <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Nghe lần đầu không xem transcript để kiểm tra khả năng nghe hiểu</p>
          <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Nghe lần 2 với transcript để hiểu rõ từng câu và từ vựng mới</p>
          <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Làm bài kiểm tra sau khi nghe để củng cố kiến thức</p>
        </div>
      </div>

      {selectedTrack && <AudioPlayer track={selectedTrack} onClose={() => setSelectedTrack(null)} />}
    </DashboardLayout>
  );
}


