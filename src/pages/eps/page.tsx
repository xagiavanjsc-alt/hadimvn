import { useState, useMemo, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { useStudySync } from "@/hooks/useStudySync";
import { epsQuestions, EPS_TOPICS, type EpsQuestion } from "@/mocks/epsQuestions";
import PronunciationRecorder from "@/components/feature/PronunciationRecorder";
import ImageWithFallback from "@/components/base/ImageWithFallback";

function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ko-KR";
  utter.rate = 0.8;
  window.speechSynthesis.speak(utter);
}

// --- Question Card --------------------------------------------------------
function EpsQuestionCard({ q, answered, onAnswer }: {
  q: EpsQuestion;
  answered: number | null;
  onAnswer: (i: number) => void;
}) {
  const topic = EPS_TOPICS.find(t => t.id === q.topic);
  const diffColor = q.difficulty === "easy" ? "#34d399" : q.difficulty === "medium" ? "app-accent-primary" : "#f87171";
  const diffLabel = q.difficulty === "easy" ? "D?" : q.difficulty === "medium" ? "Trung bình" : "Khó";

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        {topic && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${topic.color}15`, color: topic.color }}>
            <i className={`${topic.icon} mr-1`}></i>{topic.label}
          </span>
        )}
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${diffColor}15`, color: diffColor }}>
          {diffLabel}
        </span>
        {q.audioText && (
          <button
            onClick={() => speakKorean(q.audioText!)}
            className="ml-auto flex items-center gap-1.5 text-[10px] text-app-text-muted hover:text-white/60 cursor-pointer transition-colors bg-app-card/50 hover:bg-app-card/70 px-2.5 py-1 rounded-lg"
          >
            <i className="ri-volume-up-line text-xs"></i>
            Nghe
          </button>
        )}
      </div>

      {/* Image illustration — dùng ImageWithFallback d? t? fallback n?u VPS l?i */}
      {q.imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden border border-app-border">
          <ImageWithFallback
            src={q.imageUrl}
            alt={q.imageAlt || q.questionVi}
            className="w-full object-cover object-top"
            style={{ maxHeight: "220px" }}
            caption={q.imageCaption}
            placeholderText="?nh minh h?a dang du?c c?p nh?t"
          />
        </div>
      )}

      {/* Question */}
      <div className="mb-2">
        <p className="text-white font-semibold text-sm leading-relaxed mb-1">{q.question}</p>
        <p className="text-app-text-secondary text-xs leading-relaxed italic">{q.questionVi}</p>
      </div>

      {/* Options */}
      <div className="space-y-2 mt-4">
        {q.options.map((opt, i) => {
          let cls = "border-app-border bg-app-surface/50 hover:border-white/15 hover:bg-app-card/50 cursor-pointer";
          if (answered !== null) {
            if (i === q.correctIndex) cls = "border-emerald-500/40 bg-emerald-500/10 cursor-default";
            else if (i === answered) cls = "border-red-500/40 bg-red-500/10 cursor-default";
            else cls = "border-app-border bg-white/2 opacity-50 cursor-default";
          }
          return (
            <button
              key={i}
              onClick={() => answered === null && onAnswer(i)}
              disabled={answered !== null}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border transition-all text-left ${cls}`}
            >
              <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                answered !== null && i === q.correctIndex ? "bg-emerald-500/20 text-app-accent-success"
                : answered !== null && i === answered ? "bg-red-500/20 text-red-400"
                : "bg-app-card/50 text-app-text-muted"
              }`}>
                {["A", "B", "C", "D"][i]}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${answered !== null && i === q.correctIndex ? "text-app-accent-success" : answered !== null && i === answered ? "text-red-400" : "text-white/70"}`}>
                  {opt}
                </p>
                <p className="text-app-text-muted text-[10px] mt-0.5">{q.optionsVi[i]}</p>
              </div>
              {answered !== null && i === q.correctIndex && <i className="ri-checkbox-circle-fill text-app-accent-success flex-shrink-0 mt-0.5"></i>}
              {answered !== null && i === answered && i !== q.correctIndex && <i className="ri-close-circle-fill text-red-400 flex-shrink-0 mt-0.5"></i>}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered !== null && (
        <div className={`mt-4 p-4 rounded-xl border text-xs leading-relaxed ${answered === q.correctIndex ? "border-emerald-500/20 bg-emerald-500/5 text-app-accent-success/80" : "border-orange-500/20 bg-orange-500/5 text-orange-400/80"}`}>
          <div className="flex items-start gap-2">
            <i className="ri-lightbulb-line text-sm flex-shrink-0 mt-0.5"></i>
            <p>{q.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Topic Selector -------------------------------------------------------
function TopicCard({ topic, count, done, isSelected, onClick }: {
  topic: typeof EPS_TOPICS[0];
  count: number;
  done: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const pct = count > 0 ? Math.round((done / count) * 100) : 0;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? "border-white/20 bg-app-card/50" : "border-app-border bg-app-bg hover:border-app-border"}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${topic.color}15` }}>
          <i className={`${topic.icon} text-lg`} style={{ color: topic.color }}></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${isSelected ? "text-white" : "text-white/70"}`}>{topic.label}</p>
          <p className="text-app-text-muted text-[10px]">{count} câu h?i</p>
        </div>
        <span className="text-xs font-bold" style={{ color: topic.color }}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: topic.color }} />
      </div>
    </button>
  );
}

// --- Main Page ------------------------------------------------------------
export default function EpsPage() {
  const { user, profile } = useAuth();
  const { syncToCloud, updateLeaderboard } = useStudySync();
  const [selectedTopic, setSelectedTopic] = useState<string>("greeting");
  const [answeredMap, setAnsweredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mode, setMode] = useState<"topics" | "practice" | "result">("topics");
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, number>>({});
  const [showRecorder, setShowRecorder] = useState(false);
  const [syncedMsg, setSyncedMsg] = useState(false);

  const topicQuestions = useMemo(() =>
    epsQuestions.filter(q => q.topic === selectedTopic),
    [selectedTopic]
  );

  const currentQ = topicQuestions[currentIdx];

  const topicStats = useMemo(() => {
    const stats: Record<string, { count: number; done: number }> = {};
    EPS_TOPICS.forEach(t => {
      const qs = epsQuestions.filter(q => q.topic === t.id);
      const done = qs.filter(q => answeredMap[q.id] !== undefined).length;
      stats[t.id] = { count: qs.length, done };
    });
    return stats;
  }, [answeredMap]);

  const handleAnswer = useCallback((optIdx: number) => {
    if (!currentQ) return;
    setAnsweredMap(prev => ({ ...prev, [currentQ.id]: optIdx }));
    setSessionAnswers(prev => ({ ...prev, [currentQ.id]: optIdx }));
  }, [currentQ, setAnsweredMap]);

  const handleSessionComplete = useCallback(() => {
    if (user) {
      const displayName = profile?.display_name || user.email?.split("@")[0] || "H?c viên";
      Promise.all([syncToCloud(user.id), updateLeaderboard(user.id, displayName)])
        .then(() => { setSyncedMsg(true); setTimeout(() => setSyncedMsg(false), 3000); });
    }
  }, [user, profile, syncToCloud, updateLeaderboard]);

  const handleNext = useCallback(() => {
    if (currentIdx + 1 >= topicQuestions.length) {
      setMode("result");
      handleSessionComplete();
    } else {
      setCurrentIdx(i => i + 1);
    }
  }, [currentIdx, topicQuestions.length, handleSessionComplete]);

  const handleStartTopic = (topicId: string) => {
    setSelectedTopic(topicId);
    setCurrentIdx(0);
    setSessionAnswers({});
    setMode("practice");
  };

  const sessionScore = useMemo(() => {
    return topicQuestions.filter(q => sessionAnswers[q.id] === q.correctIndex).length;
  }, [topicQuestions, sessionAnswers]);

  const totalDone = Object.keys(answeredMap).length;
  const totalCorrect = epsQuestions.filter(q => answeredMap[q.id] === q.correctIndex).length;
  const overallPct = epsQuestions.length > 0 ? Math.round((totalCorrect / epsQuestions.length) * 100) : 0;

  return (
    <DashboardLayout
      title="Luy?n thi EPS-TOPIK"
      subtitle="B? d? tr?c nghi?m theo ch? d? — chu?n b? cho k? thi lao d?ng Hàn Qu?c"
      actions={
        mode !== "topics" ? (
          <button
            onClick={() => { setMode("topics"); setCurrentIdx(0); }}
            className="flex items-center gap-2 bg-app-card/50 hover:bg-app-card/70 text-white/60 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-line"></i>
            V? danh sách ch? d?
          </button>
        ) : undefined
      }
    >
      {/* Overall stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "T?ng câu h?i", value: epsQuestions.length, icon: "ri-survey-line", color: "app-accent-primary" },
          { label: "Ðã làm", value: totalDone, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Tr? l?i dúng", value: totalCorrect, icon: "ri-trophy-line", color: "#a78bfa" },
          { label: "T? l? dúng", value: `${overallPct}%`, icon: "ri-bar-chart-line", color: "#fb923c" },
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

      {/* Topics view */}
      {mode === "topics" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Ch?n ch? d? luy?n t?p</h3>
            <div className="grid grid-cols-2 gap-3">
              {EPS_TOPICS.map(topic => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  count={topicStats[topic.id]?.count ?? 0}
                  done={topicStats[topic.id]?.done ?? 0}
                  isSelected={selectedTopic === topic.id}
                  onClick={() => handleStartTopic(topic.id)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* EPS info */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">V? k? thi EPS-TOPIK</h3>
              <div className="space-y-3">
                {[
                  { icon: "ri-file-text-line", title: "Hình th?c thi", desc: "Tr?c nghi?m 4 l?a ch?n, 40 câu trong 50 phút" },
                  { icon: "ri-translate-2", title: "N?i dung", desc: "Ti?ng Hàn co b?n, van hóa, an toàn lao d?ng, quy d?nh pháp lu?t" },
                  { icon: "ri-award-line", title: "Ði?m d?u", desc: "T? 80/200 di?m tr? lên (tùy ngành ngh?)" },
                  { icon: "ri-calendar-line", title: "T?n su?t", desc: "T? ch?c 2-3 l?n/nam t?i Vi?t Nam" },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-accent-primary/10 flex-shrink-0">
                      <i className={`${item.icon} text-app-accent-primary text-xs`}></i>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs font-semibold">{item.title}</p>
                      <p className="text-app-text-muted text-[10px] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4">
              <p className="text-app-accent-primary/80 text-xs font-semibold mb-1">M?o luy?n thi EPS</p>
              <p className="text-app-text-secondary text-xs leading-relaxed">
                Làm h?t t?t c? ch? d? ít nh?t 3 l?n. Chú ý các câu v? an toàn lao d?ng và quy d?nh pháp lu?t — thu?ng chi?m 30% d? thi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Practice view */}
      {mode === "practice" && currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-4">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <p className="text-app-text-secondary text-xs whitespace-nowrap">
                {currentIdx + 1} / {topicQuestions.length}
              </p>
              <div className="flex-1 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-app-accent-primary transition-all"
                  style={{ width: `${((currentIdx) / topicQuestions.length) * 100}%` }}
                />
              </div>
              <p className="text-app-accent-success text-xs font-bold whitespace-nowrap">
                {Object.values(sessionAnswers).filter((v, i) => v === topicQuestions[i]?.correctIndex).length} dúng
              </p>
            </div>

            <EpsQuestionCard
              q={currentQ}
              answered={answeredMap[currentQ.id] ?? null}
              onAnswer={handleAnswer}
            />

            {answeredMap[currentQ.id] !== undefined && (
              <div className="space-y-3">
                {/* Pronunciation recorder */}
                {currentQ.audioText && (
                  <div>
                    {!showRecorder ? (
                      <button
                        onClick={() => setShowRecorder(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#06b6d4]/20 bg-[#06b6d4]/5 hover:bg-[#06b6d4]/10 text-[#06b6d4] text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-mic-line"></i>
                        Luy?n phát âm câu này
                      </button>
                    ) : (
                      <PronunciationRecorder
                        targetText={currentQ.audioText}
                        targetTextVi={currentQ.questionVi}
                        onClose={() => setShowRecorder(false)}
                      />
                    )}
                  </div>
                )}
                <button
                  onClick={() => { setShowRecorder(false); handleNext(); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  {currentIdx + 1 >= topicQuestions.length ? "Xem k?t qu?" : "Câu ti?p theo"}
                  <i className="ri-arrow-right-line"></i>
                </button>
              </div>
            )}
          </div>

          {/* Side: topic progress */}
          <div className="space-y-3">
            <div className="bg-app-bg border border-app-border rounded-2xl p-4">
              <p className="text-app-text-secondary text-xs font-medium mb-3">Ti?n d? ch? d? này</p>
              <div className="space-y-2">
                {topicQuestions.map((q, i) => {
                  const ans = answeredMap[q.id];
                  const isCorrect = ans === q.correctIndex;
                  const isDone = ans !== undefined;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(i)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer text-left ${i === currentIdx ? "bg-white/8" : "hover:bg-app-surface/50"}`}
                    >
                      <div className={`w-5 h-5 flex items-center justify-center rounded-md text-[9px] font-bold flex-shrink-0 ${
                        isDone && isCorrect ? "bg-emerald-500/20 text-app-accent-success"
                        : isDone ? "bg-red-500/20 text-red-400"
                        : i === currentIdx ? "bg-app-accent-primary/20 text-app-accent-primary"
                        : "bg-app-card/50 text-app-text-muted"
                      }`}>
                        {isDone ? (isCorrect ? "?" : "?") : i + 1}
                      </div>
                      <p className="text-white/50 text-[10px] truncate flex-1">{q.questionVi.slice(0, 35)}...</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result view */}
      {mode === "result" && (
        <div className="bg-app-bg border border-app-border rounded-2xl p-8 max-w-lg mx-auto text-center">
          {(() => {
            const pct = topicQuestions.length > 0 ? Math.round((sessionScore / topicQuestions.length) * 100) : 0;
            const grade = pct >= 80 ? { label: "Xu?t s?c!", color: "#34d399", icon: "ri-trophy-line" }
              : pct >= 60 ? { label: "Khá t?t!", color: "app-accent-primary", icon: "ri-medal-line" }
              : { label: "C?n ôn thêm!", color: "#fb923c", icon: "ri-refresh-line" };
            return (
              <>
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: `${grade.color}15` }}>
                  <i className={`${grade.icon} text-3xl`} style={{ color: grade.color }}></i>
                </div>
                <h2 className="text-white font-bold text-xl mb-2">{grade.label}</h2>
                <p className="text-app-text-secondary text-sm mb-5">
                  Ðúng <span className="font-bold" style={{ color: grade.color }}>{sessionScore}/{topicQuestions.length}</span> câu ({pct}%)
                </p>
                <div className="w-full h-2 bg-app-card/50 rounded-full overflow-hidden mb-6">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: grade.color }} />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setCurrentIdx(0); setSessionAnswers({}); setMode("practice"); }}
                    className="flex-1 py-3 rounded-xl border border-app-border text-white/60 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Làm l?i
                  </button>
                  <button
                    onClick={() => setMode("topics")}
                    className="flex-1 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Ch? d? khác
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </DashboardLayout>
  );
}


