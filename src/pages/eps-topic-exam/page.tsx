import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import { useToast } from "@/components/base/Toast";
import { epsQuestions, EPS_TOPICS } from "@/mocks/epsQuestions";
import { isExamTooFast, isInCooldown } from "@/lib/xp";
import { STORAGE_KEYS } from "@/lib/storageKeys";

const TOPIC_EXAM_COUNT = 20;
const TOPIC_EXAM_DURATION = 25 * 60; // 25 minutes

function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ko-KR";
  utter.rate = 0.8;
  window.speechSynthesis.speak(utter);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface TopicExamResult {
  id: string;
  date: string;
  topicId: string;
  topicLabel: string;
  score: number;
  total: number;
  timeUsed: number;
}

export default function EpsTopicExamPage() {
  const navigate = useNavigate();
  const { awardXP } = useXPSystem();
  const { showToast, ToastComponent } = useToast();
  const [history, setHistory] = useLocalStorage<TopicExamResult[]>("kts_eps_topic_exam_history", []);

  const [mode, setMode] = useState<"select" | "exam" | "result">("select");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [examQuestions, setExamQuestions] = useState(epsQuestions.slice(0, TOPIC_EXAM_COUNT));
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOPIC_EXAM_DURATION);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [showReview, setShowReview] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Topics with question counts
  const topicsWithCount = useMemo(() => {
    return EPS_TOPICS.map(t => ({
      ...t,
      count: epsQuestions.filter(q => q.topic === t.id).length,
    })).filter(t => t.count >= 5);
  }, []);

  const startExam = useCallback((topicId: string) => {
    // Anti-cheat: cooldown chống spam
    const lastAt = parseInt(localStorage.getItem(STORAGE_KEYS.EPS_TOPIC_EXAM_LAST_AT) || "0", 10) || null;
    const { inCooldown, remainingSec } = isInCooldown(lastAt);
    if (inCooldown) {
      showToast(`Vui lòng chờ ${remainingSec}s trước khi làm bài mới`, "warning", 3000);
      return;
    }
    const topicQs = epsQuestions.filter(q => q.topic === topicId);
    const shuffled = seededShuffle(topicQs, Date.now());
    const picked = shuffled.slice(0, Math.min(TOPIC_EXAM_COUNT, shuffled.length));
    setExamQuestions(picked);
    setSelectedTopic(topicId);
    setAnswers({});
    setCurrentIdx(0);
    setTimeLeft(TOPIC_EXAM_DURATION);
    setFlagged(new Set());
    setShowReview(false);
    startTimeRef.current = Date.now();
    setMode("exam");
  }, []);

  useEffect(() => {
    if (mode !== "exam") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          submitExam();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode]);

  const submitExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const timeUsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    const correct = examQuestions.filter(q => answers[q.id] === q.correctIndex).length;
    const topicInfo = EPS_TOPICS.find(t => t.id === selectedTopic);

    // Anti-cheat: submit quá nhanh → lưu kết quả nhưng KHÔNG cộng XP
    const tooFast = isExamTooFast(timeUsed, examQuestions.length);

    const result: TopicExamResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      topicId: selectedTopic!,
      topicLabel: topicInfo?.label || selectedTopic!,
      score: correct,
      total: examQuestions.length,
      timeUsed,
    };
    setHistory(prev => [...prev, result]);

    if (tooFast) {
      setMode("result");
      return;
    }

    localStorage.setItem(STORAGE_KEYS.EPS_TOPIC_EXAM_LAST_AT, String(Date.now()));
    awardXP({ type: "eps_exam_completed", amount: 15 + Math.round((correct / examQuestions.length) * 20) });
    setMode("result");
  }, [examQuestions, answers, selectedTopic, setHistory, awardXP]);

  const currentQ = examQuestions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const timeColor = timeLeft < 180 ? "#f87171" : timeLeft < 360 ? "#fb923c" : "#34d399";
  const timeStr = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;

  const resultStats = useMemo(() => {
    if (mode !== "result") return null;
    const correct = examQuestions.filter(q => answers[q.id] === q.correctIndex).length;
    const pct = Math.round((correct / examQuestions.length) * 100);
    return { correct, pct };
  }, [mode, examQuestions, answers]);

  // ── SELECT TOPIC ──────────────────────────────────────────────────────────
  if (mode === "select") {
    return (
      <DashboardLayout title="Thi thử EPS theo chủ đề" subtitle="Chọn 1 chủ đề và thi 20 câu tập trung">
        <ToastComponent />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {topicsWithCount.map(topic => {
                const topicHistory = history.filter(h => h.topicId === topic.id);
                const bestScore = topicHistory.length > 0
                  ? Math.max(...topicHistory.map(h => Math.round((h.score / h.total) * 100)))
                  : null;
                const avgScore = topicHistory.length > 0
                  ? Math.round(topicHistory.reduce((s, h) => s + Math.round((h.score / h.total) * 100), 0) / topicHistory.length)
                  : null;

                return (
                  <div
                    key={topic.id}
                    className="bg-app-bg border border-app-border rounded-2xl p-5 hover:border-app-border transition-all cursor-pointer group"
                    onClick={() => startExam(topic.id)}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${topic.color}15` }}>
                        <i className={`${topic.icon} text-xl`} style={{ color: topic.color }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm leading-tight">{topic.label}</p>
                        <p className="text-app-text-muted text-[10px] mt-0.5">{topic.count} câu hỏi</p>
                      </div>
                    </div>

                    {bestScore !== null ? (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-app-text-muted">Điểm cao nhất</span>
                          <span className="font-bold" style={{ color: bestScore >= 80 ? "#34d399" : bestScore >= 60 ? "app-accent-primary" : "#f87171" }}>{bestScore}%</span>
                        </div>
                        <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${bestScore}%`, backgroundColor: bestScore >= 80 ? "#34d399" : bestScore >= 60 ? "app-accent-primary" : "#f87171" }} />
                        </div>
                        <p className="text-app-text-muted text-[10px]">{topicHistory.length} lần thi · TB {avgScore}%</p>
                      </div>
                    ) : (
                      <div className="mb-4 py-2 px-3 bg-app-surface/50 rounded-lg">
                        <p className="text-app-text-muted text-[10px]">Chưa thi chủ đề này</p>
                      </div>
                    )}

                    <button
                      className="w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                      style={{ backgroundColor: `${topic.color}15`, color: topic.color, border: `1px solid ${topic.color}25` }}
                    >
                      <i className="ri-play-circle-line mr-1.5"></i>
                      Thi {Math.min(TOPIC_EXAM_COUNT, topic.count)} câu
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4"><i className="ri-information-line text-app-accent-primary mr-2"></i>Thông tin đề thi</h3>
              <div className="space-y-3">
                {[
                  { icon: "ri-survey-line", color: "app-accent-primary", label: "Số câu hỏi", value: "20 câu" },
                  { icon: "ri-timer-line", color: "#34d399", label: "Thời gian", value: "25 phút" },
                  { icon: "ri-focus-3-line", color: "#a78bfa", label: "Phạm vi", value: "1 chủ đề" },
                  { icon: "ri-trophy-line", color: "#fb923c", label: "Điểm đậu", value: "≥ 80%" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                      <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-app-text-secondary text-xs">{item.label}</span>
                      <span className="text-white text-xs font-semibold">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent history */}
            {history.length > 0 && (
              <div className="bg-app-bg border border-app-border rounded-2xl p-5">
                <h3 className="text-white font-semibold text-sm mb-3"><i className="ri-history-line text-app-accent-primary mr-2"></i>Lịch sử gần đây</h3>
                <div className="space-y-2">
                  {history.slice(-5).reverse().map((h, i) => {
                    const pct = Math.round((h.score / h.total) * 100);
                    const color = pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171";
                    const topic = EPS_TOPICS.find(t => t.id === h.topicId);
                    return (
                      <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-app-surface/50 rounded-xl">
                        <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${topic?.color || color}15` }}>
                          <i className={`${topic?.icon || "ri-survey-line"} text-xs`} style={{ color: topic?.color || color }}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/60 text-[10px] font-medium truncate">{h.topicLabel}</p>
                          <p className="text-app-text-muted text-[9px]">{new Date(h.date).toLocaleDateString("vi-VN")}</p>
                        </div>
                        <span className="text-xs font-bold flex-shrink-0" style={{ color }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-lightbulb-line text-app-accent-primary"></i>
                <p className="text-white font-semibold text-sm">Mẹo ôn tập</p>
              </div>
              <p className="text-app-text-secondary text-xs leading-relaxed">
                Thi theo chủ đề giúp bạn tập trung vào điểm yếu. Sau khi thi, xem lại câu sai để cải thiện từng chủ đề trước khi thi đầy đủ 40 câu.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── EXAM ──────────────────────────────────────────────────────────────────
  if (mode === "exam" && currentQ) {
    const topicInfo = EPS_TOPICS.find(t => t.id === selectedTopic);
    const progressPct = (answeredCount / examQuestions.length) * 100;

    return (
      <DashboardLayout
        title={`Thi thử: ${topicInfo?.label || ""}`}
        subtitle={`Câu ${currentIdx + 1}/${examQuestions.length} · 20 câu · 25 phút`}
      >
        <ToastComponent />
        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 py-3 bg-app-bg border-b border-app-border mb-4 -mx-6 -mt-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm" style={{ borderColor: `${timeColor}30`, backgroundColor: `${timeColor}10`, color: timeColor }}>
            <i className="ri-timer-line"></i>{timeStr}
          </div>
          <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-app-accent-primary transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-app-text-secondary text-sm">{answeredCount}/{examQuestions.length}</span>
          <button onClick={() => setShowReview(!showReview)} className="flex items-center gap-2 bg-app-card/50 hover:bg-white/8 text-white/60 text-sm px-3 py-1.5 rounded-xl cursor-pointer whitespace-nowrap">
            <i className="ri-list-check-2"></i>Xem lại
          </button>
          <button onClick={submitExam} className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-4 py-1.5 rounded-xl cursor-pointer whitespace-nowrap">
            <i className="ri-send-plane-line"></i>Nộp bài
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-5 max-w-5xl mx-auto">
          {/* Question */}
          <div className="space-y-4">
            <div className="bg-app-bg border border-app-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-app-text-muted text-xs font-mono">Câu {currentIdx + 1}</span>
                <div className="flex items-center gap-1.5 ml-auto">
                  {currentQ.audioText && (
                    <button onClick={() => speakKorean(currentQ.audioText!)} className="flex items-center gap-1.5 text-xs bg-app-card/50 hover:bg-white/8 text-app-text-secondary px-2.5 py-1 rounded-lg cursor-pointer whitespace-nowrap">
                      <i className="ri-volume-up-line"></i>Nghe
                    </button>
                  )}
                  <button
                    onClick={() => setFlagged(prev => { const n = new Set(prev); n.has(currentQ.id) ? n.delete(currentQ.id) : n.add(currentQ.id); return n; })}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg cursor-pointer whitespace-nowrap ${flagged.has(currentQ.id) ? "bg-[#fb923c]/15 text-[#fb923c]" : "bg-app-card/50 text-app-text-muted"}`}
                  >
                    <i className={flagged.has(currentQ.id) ? "ri-flag-fill" : "ri-flag-line"}></i>
                    {flagged.has(currentQ.id) ? "Đã đánh dấu" : "Đánh dấu"}
                  </button>
                </div>
              </div>

              {currentQ.imageUrl && (
                <div className="mb-4 rounded-xl overflow-hidden">
                  <img loading="lazy" decoding="async" src={currentQ.imageUrl} alt={currentQ.imageAlt || ""} className="w-full h-48 object-cover object-top" />
                  {currentQ.imageCaption && <p className="text-app-text-muted text-[10px] text-center py-1.5 bg-app-surface/50">{currentQ.imageCaption}</p>}
                </div>
              )}

              <p className="text-white font-semibold text-sm leading-relaxed mb-1">{currentQ.question}</p>
              <p className="text-app-text-secondary text-xs leading-relaxed italic mb-5">{currentQ.questionVi}</p>

              <div className="space-y-2">
                {currentQ.options.map((opt, i) => {
                  const isSelected = answers[currentQ.id] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: i }))}
                      className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border transition-all text-left cursor-pointer ${isSelected ? "border-app-accent-primary/40 bg-app-accent-primary/8" : "border-app-border bg-app-surface/50 hover:border-white/15"}`}
                    >
                      <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold flex-shrink-0 mt-0.5 ${isSelected ? "bg-app-accent-primary/20 text-app-accent-primary" : "bg-app-card/50 text-app-text-muted"}`}>
                        {["A", "B", "C", "D"][i]}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isSelected ? "text-app-accent-primary" : "text-white/70"}`}>{opt}</p>
                        <p className="text-app-text-muted text-[10px] mt-0.5">{currentQ.optionsVi[i]}</p>
                      </div>
                      {isSelected && <i className="ri-checkbox-circle-fill text-app-accent-primary flex-shrink-0 mt-0.5"></i>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-app-border text-white/50 text-sm hover:bg-app-card/50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap">
                <i className="ri-arrow-left-line"></i>Câu trước
              </button>
              <div className="flex-1 text-center text-app-text-muted text-xs">
                {answers[currentQ.id] !== undefined ? <span className="text-app-accent-primary/60">Đã trả lời</span> : "Chưa trả lời"}
              </div>
              <button onClick={() => setCurrentIdx(i => Math.min(examQuestions.length - 1, i + 1))} disabled={currentIdx === examQuestions.length - 1}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-app-accent-primary/10 hover:bg-app-accent-primary/20 text-app-accent-primary text-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap">
                Câu tiếp<i className="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {showReview && (
              <div className="bg-app-bg border border-app-border rounded-2xl p-4">
                <p className="text-app-text-secondary text-xs font-medium mb-3">Danh sách câu</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {examQuestions.map((q, i) => (
                    <button key={q.id} onClick={() => setCurrentIdx(i)}
                      className={`h-8 rounded-lg text-[10px] font-bold transition-all cursor-pointer relative ${i === currentIdx ? "bg-app-accent-primary text-app-bg" : answers[q.id] !== undefined ? "bg-emerald-500/20 text-app-accent-success" : "bg-app-card/50 text-app-text-muted"}`}>
                      {i + 1}
                      {flagged.has(q.id) && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#fb923c]"></span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
              <p className="text-app-text-muted text-xs mb-1">Thời gian còn lại</p>
              <p className="font-mono font-bold text-3xl" style={{ color: timeColor }}>{timeStr}</p>
            </div>

            <div className="bg-app-bg border border-app-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${topicInfo?.color}15` }}>
                  <i className={`${topicInfo?.icon} text-sm`} style={{ color: topicInfo?.color }}></i>
                </div>
                <p className="text-white/60 text-xs font-medium">{topicInfo?.label}</p>
              </div>
              <div className="space-y-1.5 text-[10px] text-app-text-muted">
                <div className="flex justify-between"><span>Đã trả lời</span><span className="text-app-accent-success">{answeredCount}</span></div>
                <div className="flex justify-between"><span>Chưa trả lời</span><span className="text-app-text-secondary">{examQuestions.length - answeredCount}</span></div>
                <div className="flex justify-between"><span>Đánh dấu</span><span className="text-[#fb923c]">{flagged.size}</span></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (mode === "result" && resultStats) {
    const { correct, pct } = resultStats;
    const topicInfo = EPS_TOPICS.find(t => t.id === selectedTopic);
    const grade = pct >= 80
      ? { label: "Xuất sắc!", color: "#34d399", icon: "ri-trophy-line", desc: "Bạn đã nắm vững chủ đề này!" }
      : pct >= 60
      ? { label: "Khá tốt", color: "app-accent-primary", icon: "ri-medal-line", desc: "Cần ôn thêm một chút nữa." }
      : { label: "Cần ôn thêm", color: "#f87171", icon: "ri-refresh-line", desc: "Hãy ôn luyện thêm chủ đề này." };

    const lastResult = history[history.length - 1];
    const timeUsed = lastResult?.timeUsed ?? 0;

    return (
      <DashboardLayout title="Kết quả thi theo chủ đề" subtitle={topicInfo?.label || ""}>
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Score */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: `${grade.color}15` }}>
              <i className={`${grade.icon} text-3xl`} style={{ color: grade.color }}></i>
            </div>
            <h2 className="text-white font-bold text-2xl mb-1">{grade.label}</h2>
            <p className="text-app-text-secondary text-sm mb-5">{grade.desc}</p>

            <div className="flex items-center justify-center gap-8 mb-5">
              <div>
                <p className="font-bold text-4xl" style={{ color: grade.color }}>{pct}%</p>
                <p className="text-app-text-muted text-xs mt-1">Tỷ lệ đúng</p>
              </div>
              <div className="w-px h-12 bg-app-card/70"></div>
              <div>
                <p className="text-white font-bold text-4xl">{correct}<span className="text-app-text-muted text-xl">/{examQuestions.length}</span></p>
                <p className="text-app-text-muted text-xs mt-1">Câu đúng</p>
              </div>
              <div className="w-px h-12 bg-app-card/70"></div>
              <div>
                <p className="text-white font-bold text-2xl">{Math.floor(timeUsed / 60)}:{String(timeUsed % 60).padStart(2, "0")}</p>
                <p className="text-app-text-muted text-xs mt-1">Thời gian</p>
              </div>
            </div>

            <div className="w-full h-3 bg-app-card/50 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: grade.color }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-app-text-muted">
              <span>0%</span>
              <span className="text-app-accent-primary">Ngưỡng đậu: 80%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Wrong answers */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">
              Câu sai ({examQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.correctIndex).length} câu)
            </h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {examQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.correctIndex).map((q, i) => (
                <div key={q.id} className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                  <p className="text-white/70 text-xs font-medium mb-1">{i + 1}. {q.questionVi}</p>
                  <div className="flex items-center gap-2 text-[10px] mt-2">
                    <span className="text-red-400/70">Bạn chọn: {q.optionsVi[answers[q.id]]}</span>
                    <span className="text-app-text-muted">·</span>
                    <span className="text-app-accent-success/70">Đáp án: {q.optionsVi[q.correctIndex]}</span>
                  </div>
                  {q.explanation && <p className="text-app-text-muted text-[10px] mt-2 leading-relaxed">{q.explanation}</p>}
                </div>
              ))}
              {examQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.correctIndex).length === 0 && (
                <p className="text-app-text-muted text-sm text-center py-4">Không có câu sai nào! Tuyệt vời!</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setMode("select")} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-app-border text-white/60 text-sm hover:bg-app-card/50 cursor-pointer whitespace-nowrap">
              <i className="ri-arrow-left-line"></i>Chọn chủ đề khác
            </button>
            <button onClick={() => navigate("/eps-exam")} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-app-border text-white/60 text-sm hover:bg-app-card/50 cursor-pointer whitespace-nowrap">
              <i className="ri-file-list-3-line"></i>Thi đầy đủ 40 câu
            </button>
            <button onClick={() => selectedTopic && startExam(selectedTopic)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap">
              <i className="ri-refresh-line"></i>Thi lại
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return null;
}

