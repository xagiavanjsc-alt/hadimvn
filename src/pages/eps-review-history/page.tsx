import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { epsLessons } from "@/mocks/epsLessons";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ReviewSession {
  id: string;
  date: string;
  mode: "random" | "wrong_only";
  total: number;
  correct: number;
  wrong: number;
  duration: number; // seconds
  wrongWords: { korean: string; vietnamese: string; lessonId: number }[];
}

interface VocabHistory {
  correct: number;
  wrong: number;
}

// Generate mock history sessions for demo
function generateMockSessions(): ReviewSession[] {
  const now = new Date();
  const sessions: ReviewSession[] = [];
  const modes: ("random" | "wrong_only")[] = ["random", "random", "wrong_only", "random", "wrong_only", "random", "random", "wrong_only"];
  const scores = [8, 10, 6, 9, 7, 10, 8, 5];
  const durations = [180, 210, 150, 195, 165, 220, 175, 140];

  for (let i = 0; i < 8; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const correct = scores[i];
    const total = 10;
    const wrong = total - correct;

    const wrongWords: ReviewSession["wrongWords"] = [];
    if (wrong > 0) {
      const lesson = epsLessons[i % epsLessons.length];
      lesson.vocabulary.slice(0, wrong).forEach(v => {
        wrongWords.push({ korean: v.korean, vietnamese: v.vietnamese, lessonId: lesson.id });
      });
    }

    sessions.push({
      id: `session_${i}`,
      date: date.toISOString(),
      mode: modes[i],
      total,
      correct,
      wrong,
      duration: durations[i],
      wrongWords,
    });
  }
  return sessions;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hôm nay";
  if (diff === 1) return "Hôm qua";
  return `${diff} ngày trước`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function EpsReviewHistoryPage() {
  const navigate = useNavigate();
  const [vocabHistory] = useLocalStorage<Record<string, VocabHistory>>("eps_vocab_review_history", {});
  const [filterMode, setFilterMode] = useState<"all" | "random" | "wrong_only">("all");
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Use mock sessions for demo (in real app, would load from localStorage)
  const allSessions = useMemo(() => generateMockSessions(), []);

  const filteredSessions = useMemo(() => {
    if (filterMode === "all") return allSessions;
    return allSessions.filter(s => s.mode === filterMode);
  }, [allSessions, filterMode]);

  // Overall stats
  const overallStats = useMemo(() => {
    const totalSessions = allSessions.length;
    const totalWords = allSessions.reduce((sum, s) => sum + s.total, 0);
    const totalCorrect = allSessions.reduce((sum, s) => sum + s.correct, 0);
    const avgAccuracy = totalWords > 0 ? Math.round((totalCorrect / totalWords) * 100) : 0;
    const totalTime = allSessions.reduce((sum, s) => sum + s.duration, 0);

    // Most wrong words from vocabHistory
    const wrongEntries = Object.entries(vocabHistory)
      .filter(([, h]) => h.wrong > 0)
      .sort(([, a], [, b]) => b.wrong - a.wrong)
      .slice(0, 5);

    return { totalSessions, totalWords, avgAccuracy, totalTime, wrongEntries };
  }, [allSessions, vocabHistory]);

  // Weekly chart data (last 7 days)
  const weeklyData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const daySessions = allSessions.filter(s => new Date(s.date).toDateString() === dayStr);
      const correct = daySessions.reduce((sum, s) => sum + s.correct, 0);
      const total = daySessions.reduce((sum, s) => sum + s.total, 0);
      days.push({
        label: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()],
        correct,
        total,
        sessions: daySessions.length,
      });
    }
    return days;
  }, [allSessions]);

  const maxTotal = Math.max(...weeklyData.map(d => d.total), 1);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-app-bg text-white">
        {/* Header */}
        <div className="bg-[#1a1d2e] border-b border-app-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-app-card/70 transition-colors cursor-pointer">
                <i className="ri-arrow-left-line text-white/60"></i>
              </button>
              <div>
                <h1 className="text-lg font-bold text-white">Lịch sử ôn tập</h1>
                <p className="text-app-text-secondary text-xs">Xem lại các phiên ôn tập trước</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/eps-quick-review")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-app-accent-primary/15 hover:bg-app-accent-primary/25 border border-app-accent-primary/30 rounded-lg text-app-accent-primary text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-flashlight-line text-xs"></i>
              Ôn tập ngay
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Phiên ôn tập", value: overallStats.totalSessions, icon: "ri-history-line", color: "app-accent-primary" },
              { label: "Từ đã ôn", value: overallStats.totalWords, icon: "ri-translate-2", color: "#34d399" },
              { label: "Độ chính xác", value: `${overallStats.avgAccuracy}%`, icon: "ri-bar-chart-line", color: "#60a5fa" },
              { label: "Tổng thời gian", value: formatDuration(overallStats.totalTime), icon: "ri-time-line", color: "#f59e0b" },
            ].map((s, i) => (
              <div key={i} className="bg-app-surface/50 border border-app-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}20` }}>
                    <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                  </div>
                  <span className="text-app-text-secondary text-xs">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Weekly Chart */}
          <div className="bg-app-surface/50 border border-app-border rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <i className="ri-bar-chart-2-line text-app-accent-primary"></i>
              Hoạt động 7 ngày qua
            </h3>
            <div className="flex items-end gap-2 h-28">
              {weeklyData.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center justify-end" style={{ height: "80px" }}>
                    {day.total > 0 ? (
                      <div className="w-full rounded-t-md overflow-hidden" style={{ height: `${(day.total / maxTotal) * 80}px`, minHeight: "8px" }}>
                        <div
                          className="w-full rounded-t-md"
                          style={{
                            height: `${(day.correct / day.total) * 100}%`,
                            minHeight: "4px",
                            backgroundColor: "#34d399",
                          }}
                        ></div>
                        <div
                          className="w-full"
                          style={{
                            height: `${((day.total - day.correct) / day.total) * 100}%`,
                            backgroundColor: "#ef4444",
                            opacity: 0.6,
                          }}
                        ></div>
                      </div>
                    ) : (
                      <div className="w-full h-1 bg-app-card/50 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-app-text-muted text-[10px]">{day.label}</span>
                  {day.sessions > 0 && (
                    <span className="text-app-accent-primary text-[9px] font-bold">{day.total}t</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-app-border">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></div>
                <span className="text-app-text-secondary text-xs">Đúng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-red-400 opacity-60"></div>
                <span className="text-app-text-secondary text-xs">Sai</span>
              </div>
            </div>
          </div>

          {/* Most Wrong Words */}
          {overallStats.wrongEntries.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-5">
              <h3 className="text-red-400 font-semibold text-sm mb-3 flex items-center gap-2">
                <i className="ri-error-warning-line"></i>
                Từ hay sai nhất
              </h3>
              <div className="space-y-2">
                {overallStats.wrongEntries.map(([key, hist]) => {
                  const [lessonIdStr, ...koreanParts] = key.split("_");
                  const korean = koreanParts.join("_");
                  const lessonId = parseInt(lessonIdStr);
                  const lesson = epsLessons.find(l => l.id === lessonId);
                  const vocab = lesson?.vocabulary.find(v => v.korean === korean);
                  if (!vocab) return null;
                  return (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-app-border last:border-0">
                      <div>
                        <span className="text-white font-medium text-sm">{vocab.korean}</span>
                        <span className="text-app-text-secondary text-xs ml-2">{vocab.vietnamese}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 text-xs font-bold bg-red-500/10 px-2 py-0.5 rounded-full">
                          Sai {hist.wrong}x
                        </span>
                        <span className="text-app-accent-success text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Đúng {hist.correct}x
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => navigate("/eps-quick-review")}
                className="mt-3 w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium transition-all cursor-pointer"
              >
                <i className="ri-refresh-line mr-1"></i>
                Ôn lại từ sai ngay
              </button>
            </div>
          )}

          {/* Session History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">Lịch sử phiên ôn tập</h3>
              <div className="flex items-center gap-1 bg-app-card/50 rounded-lg p-1">
                {(["all", "random", "wrong_only"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setFilterMode(m)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      filterMode === m ? "bg-app-card/70 text-white" : "text-app-text-secondary hover:text-white/70"
                    }`}
                  >
                    {m === "all" ? "Tất cả" : m === "random" ? "Ngẫu nhiên" : "Từ sai"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-10 text-app-text-muted">
                  <i className="ri-history-line text-3xl mb-2 block"></i>
                  <p className="text-sm">Chưa có phiên ôn tập nào</p>
                </div>
              ) : (
                filteredSessions.map(session => {
                  const accuracy = Math.round((session.correct / session.total) * 100);
                  const isExpanded = expandedSession === session.id;
                  const accuracyColor = accuracy >= 80 ? "#34d399" : accuracy >= 60 ? "#f59e0b" : "#ef4444";

                  return (
                    <div key={session.id} className="bg-app-surface/50 border border-app-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                        className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-app-surface/50 transition-colors cursor-pointer"
                      >
                        {/* Mode icon */}
                        <div className={`w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 ${
                          session.mode === "wrong_only" ? "bg-red-500/15" : "bg-app-accent-primary/10"
                        }`}>
                          <i className={`${session.mode === "wrong_only" ? "ri-error-warning-line text-red-400" : "ri-shuffle-line text-app-accent-primary"} text-base`}></i>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-white text-sm font-medium">
                              {session.mode === "wrong_only" ? "Ôn từ sai" : "Ôn ngẫu nhiên"}
                            </span>
                            <span className="text-app-text-muted text-xs">•</span>
                            <span className="text-app-text-secondary text-xs">{formatDate(session.date)} {formatTime(session.date)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-app-text-secondary text-xs">{session.total} từ</span>
                            <span className="text-app-text-secondary text-xs">{formatDuration(session.duration)}</span>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-lg font-bold" style={{ color: accuracyColor }}>{accuracy}%</p>
                            <p className="text-app-text-muted text-[10px]">{session.correct}/{session.total} đúng</p>
                          </div>
                          <div className="w-5 h-5 flex items-center justify-center">
                            <i className={isExpanded ? "ri-arrow-up-s-line text-app-text-muted" : "ri-arrow-down-s-line text-app-text-muted"}></i>
                          </div>
                        </div>
                      </button>

                      {/* Expanded: wrong words */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-app-border">
                          {/* Mini bar chart */}
                          <div className="flex items-center gap-2 mt-3 mb-3">
                            <div className="flex-1 h-2 bg-app-card/50 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${accuracy}%`, backgroundColor: accuracyColor }}
                              ></div>
                            </div>
                            <div className="flex items-center gap-2 text-xs flex-shrink-0">
                              <span className="text-app-accent-success font-medium">{session.correct} đúng</span>
                              <span className="text-red-400 font-medium">{session.wrong} sai</span>
                            </div>
                          </div>

                          {session.wrongWords.length > 0 ? (
                            <div>
                              <p className="text-app-text-secondary text-xs mb-2 flex items-center gap-1">
                                <i className="ri-close-circle-line text-red-400"></i>
                                Từ sai trong phiên này:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {session.wrongWords.map((w, i) => (
                                  <div key={i} className="bg-red-500/8 border border-red-500/15 rounded-lg px-2.5 py-1.5">
                                    <p className="text-white text-xs font-medium">{w.korean}</p>
                                    <p className="text-app-text-secondary text-[10px]">{w.vietnamese}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-app-accent-success text-xs">
                              <i className="ri-checkbox-circle-fill"></i>
                              <span>Hoàn hảo! Không có từ nào sai trong phiên này.</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
