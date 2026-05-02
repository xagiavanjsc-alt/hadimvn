import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsQuestions } from "@/mocks/epsQuestions";

interface ExamResult { id: string; date: string; score: number; total: number; timeUsed: number; correctIds: string[] }

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex-1 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function LearnStatsPage() {
  const navigate = useNavigate();
  const [streak] = useLocalStorage<{ count: number; lastDate: string }>("kts_streak", { count: 0, lastDate: "" });
  const [answeredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [flashcardKnown] = useLocalStorage<Record<string, boolean>>("kts_flashcard_known", {});
  const [hangulKnown] = useLocalStorage<Record<string, boolean>>("kts_hangul_known", {});
  const [examResults] = useLocalStorage<ExamResult[]>("kts_eps_exam_results", []);
  const [quizHistory] = useLocalStorage<{ date: string; score: number; total: number; lesson: string }[]>("kts_quiz_history", []);
  const [newsLessons] = useLocalStorage<{ id: string; title: string; date: string }[]>("kts_news_lessons", []);

  // EPS stats
  const epsDone = Object.keys(answeredMap).length;
  const epsCorrect = epsQuestions.filter(q => answeredMap[q.id] === q.correctIndex).length;
  const epsAccuracy = epsDone > 0 ? Math.round((epsCorrect / epsDone) * 100) : 0;

  // Flashcard
  const knownCount = Object.values(flashcardKnown).filter(Boolean).length;
  const hangulCount = Object.values(hangulKnown).filter(Boolean).length;

  // Exam
  const bestExam = examResults.length > 0 ? Math.max(...examResults.map(r => Math.round((r.score / r.total) * 100))) : 0;
  const avgExam = examResults.length > 0 ? Math.round(examResults.reduce((s, r) => s + Math.round((r.score / r.total) * 100), 0) / examResults.length) : 0;

  // Quiz
  const avgQuiz = quizHistory.length > 0 ? Math.round(quizHistory.reduce((s, h) => s + Math.round((h.score / h.total) * 100), 0) / quizHistory.length) : 0;

  // Weekly activity (last 8 weeks)
  const weeklyData = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 7);
      const label = `T${8 - i}`;

      const epsCount = epsQuestions.filter(q => {
        const ans = answeredMap[q.id];
        return ans !== undefined;
      }).length; // simplified

      const quizCount = quizHistory.filter(h => {
        const d = new Date(h.date);
        return d >= weekStart && d < weekEnd;
      }).length;

      const examCount = examResults.filter(r => {
        const d = new Date(r.date);
        return d >= weekStart && d < weekEnd;
      }).length;

      const newsCount = newsLessons.filter(n => {
        const d = new Date(n.date);
        return d >= weekStart && d < weekEnd;
      }).length;

      return { label, quiz: quizCount, exam: examCount, news: newsCount };
    }).reverse();
  }, [quizHistory, examResults, newsLessons, answeredMap]);

  const maxWeekly = Math.max(...weeklyData.map(w => w.quiz + w.exam + w.news), 1);

  // Monthly exam trend
  const monthlyExam = useMemo(() => {
    const months: Record<string, number[]> = {};
    examResults.forEach(r => {
      const m = r.date.slice(0, 7);
      if (!months[m]) months[m] = [];
      months[m].push(Math.round((r.score / r.total) * 100));
    });
    return Object.entries(months).slice(-6).map(([m, scores]) => ({
      label: m.slice(5) + "/" + m.slice(2, 4),
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));
  }, [examResults]);

  const maxMonthly = Math.max(...monthlyExam.map(m => m.avg), 100);

  // Overall score (gamified)
  const overallScore = useMemo(() => {
    let score = 0;
    score += Math.min(epsDone * 2, 200);
    score += Math.min(epsCorrect * 3, 300);
    score += Math.min(knownCount * 5, 250);
    score += Math.min(hangulCount * 3, 120);
    score += Math.min(examResults.length * 20, 200);
    score += Math.min(quizHistory.length * 10, 100);
    score += Math.min(streak.count * 15, 150);
    score += Math.min(newsLessons.length * 10, 100);
    return score;
  }, [epsDone, epsCorrect, knownCount, hangulCount, examResults, quizHistory, streak, newsLessons]);

  const scoreLevel = overallScore >= 1000 ? { label: "Bậc thầy", color: "app-accent-primary", icon: "ri-vip-crown-line" }
    : overallScore >= 500 ? { label: "Nâng cao", color: "#a78bfa", icon: "ri-star-fill" }
    : overallScore >= 200 ? { label: "Trung cấp", color: "#34d399", icon: "ri-star-half-line" }
    : { label: "Mới bắt đầu", color: "#06b6d4", icon: "ri-seedling-line" };

  const activities = [
    { label: "Câu EPS đã làm", value: epsDone, max: epsQuestions.length, color: "app-accent-primary", icon: "ri-file-list-3-line", path: "/eps" },
    { label: "Từ vựng đã thuộc", value: knownCount, max: 200, color: "#a78bfa", icon: "ri-stack-line", path: "/flashcard" },
    { label: "Hangul đã học", value: hangulCount, max: 40, color: "#34d399", icon: "ri-font-size", path: "/hangul" },
    { label: "Lần thi thử EPS", value: examResults.length, max: 20, color: "#06b6d4", icon: "ri-timer-line", path: "/eps-exam" },
    { label: "Bài quiz hoàn thành", value: quizHistory.length, max: 50, color: "#fb923c", icon: "ri-survey-line", path: "/quiz" },
    { label: "Bài tin tức đã học", value: newsLessons.length, max: 20, color: "#ec4899", icon: "ri-newspaper-line", path: "/news" },
  ];

  return (
    <DashboardLayout
      title="Thống kê học tập"
      subtitle="Theo dõi tiến bộ toàn diện — mọi hoạt động học tiếng Hàn"
    >
      {/* Overall score hero */}
      <div className="bg-gradient-to-r from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="text-center flex-shrink-0">
            <div className="w-20 h-20 flex items-center justify-center rounded-2xl mx-auto mb-2" style={{ backgroundColor: `${scoreLevel.color}15`, border: `2px solid ${scoreLevel.color}30` }}>
              <i className={`${scoreLevel.icon} text-3xl`} style={{ color: scoreLevel.color }}></i>
            </div>
            <p className="text-xs font-bold" style={{ color: scoreLevel.color }}>{scoreLevel.label}</p>
          </div>
          <div className="flex-1">
            <div className="flex items-end gap-3 mb-2">
              <p className="text-white font-bold text-5xl leading-none">{overallScore.toLocaleString()}</p>
              <p className="text-app-text-muted text-sm mb-1">điểm học tập</p>
            </div>
            <div className="h-3 bg-app-card/50 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((overallScore / 1000) * 100, 100)}%`, backgroundColor: scoreLevel.color }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-app-text-muted">
              <span>0</span>
              <span style={{ color: scoreLevel.color }}>Cấp tiếp theo: {overallScore >= 1000 ? "Tối đa!" : overallScore >= 500 ? "1000 — Bậc thầy" : overallScore >= 200 ? "500 — Nâng cao" : "200 — Trung cấp"}</span>
              <span>1000</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            {[
              { label: "Streak", value: `${streak.count}d`, color: "#fb923c" },
              { label: "EPS đúng", value: `${epsAccuracy}%`, color: "#34d399" },
              { label: "Thi cao nhất", value: bestExam > 0 ? `${bestExam}%` : "—", color: "app-accent-primary" },
              { label: "TB Quiz", value: avgQuiz > 0 ? `${avgQuiz}%` : "—", color: "#a78bfa" },
            ].map(s => (
              <div key={s.label} className="bg-app-surface/50 rounded-xl p-3 text-center min-w-[80px]">
                <p className="font-bold text-lg" style={{ color: s.color }}>{s.value}</p>
                <p className="text-app-text-muted text-[10px]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Weekly activity chart */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1">Hoạt động 8 tuần qua</h3>
          <p className="text-app-text-muted text-xs mb-4">Quiz + Thi thử + Tin tức</p>
          <div className="flex items-end gap-2 h-28 mb-2">
            {weeklyData.map((w, i) => {
              const total = w.quiz + w.exam + w.news;
              const barH = total > 0 ? Math.max((total / maxWeekly) * 96, 4) : 2;
              const quizH = total > 0 ? (w.quiz / total) * barH : 0;
              const examH = total > 0 ? (w.exam / total) * barH : 0;
              const newsH = total > 0 ? (w.news / total) * barH : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {total > 0 && (
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#1a1d27] border border-app-border text-white/70 text-[9px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {w.quiz > 0 && `Quiz: ${w.quiz} `}{w.exam > 0 && `Thi: ${w.exam} `}{w.news > 0 && `Tin: ${w.news}`}
                    </div>
                  )}
                  <div className="w-full flex flex-col-reverse" style={{ height: "96px" }}>
                    <div style={{ height: `${quizH}px`, backgroundColor: "#fb923c" }} className="w-full rounded-b-sm" />
                    <div style={{ height: `${examH}px`, backgroundColor: "#06b6d4" }} className="w-full" />
                    <div style={{ height: `${newsH}px`, backgroundColor: "#ec4899" }} className="w-full rounded-t-sm" />
                    {total === 0 && <div className="w-full" style={{ height: "2px", backgroundColor: "rgba(255,255,255,0.05)" }} />}
                  </div>
                  <span className="text-app-text-muted text-[9px]">{w.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-[10px] text-app-text-muted">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#fb923c]"></div>Quiz</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#06b6d4]"></div>Thi thử</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#ec4899]"></div>Tin tức</div>
          </div>
        </div>

        {/* Monthly exam trend */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1">Điểm thi EPS theo tháng</h3>
          <p className="text-app-text-muted text-xs mb-4">Điểm trung bình mỗi tháng</p>
          {monthlyExam.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <i className="ri-line-chart-line text-white/10 text-3xl mb-2"></i>
              <p className="text-app-text-muted text-sm">Chưa có dữ liệu thi</p>
              <button onClick={() => navigate("/eps-exam")} className="mt-3 text-app-accent-primary text-xs cursor-pointer whitespace-nowrap">Thi thử ngay →</button>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-3 h-28 mb-2">
                {monthlyExam.map((m, i) => {
                  const barH = Math.max((m.avg / maxMonthly) * 96, 4);
                  const color = m.avg >= 80 ? "#34d399" : m.avg >= 60 ? "app-accent-primary" : "#f87171";
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#1a1d27] border border-app-border text-white/70 text-[9px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {m.avg}% TB
                      </div>
                      <div className="w-full rounded-t-lg" style={{ height: `${barH}px`, backgroundColor: color }} />
                      <span className="text-app-text-muted text-[9px]">{m.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-app-text-muted">
                <div className="w-4 h-px border-t border-dashed border-app-accent-primary/40"></div>
                <span className="text-app-accent-primary/50">Ngưỡng đậu 80%</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Activity breakdown */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5 mb-6">
        <h3 className="text-white font-semibold text-sm mb-4">Chi tiết từng hoạt động</h3>
        <div className="grid grid-cols-2 gap-4">
          {activities.map(a => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className="flex items-center gap-3 px-4 py-3 bg-app-surface/50 hover:bg-app-card/50 rounded-xl transition-colors cursor-pointer text-left">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${a.color}15` }}>
                <i className={`${a.icon} text-base`} style={{ color: a.color }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/60 text-xs font-medium">{a.label}</span>
                  <span className="text-xs font-bold" style={{ color: a.color }}>{a.value}{a.max < 999 ? `/${a.max}` : ""}</span>
                </div>
                <MiniBar value={a.value} max={a.max} color={a.color} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Exam history table */}
      {examResults.length > 0 && (
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Lịch sử thi thử EPS ({examResults.length} lần)</h3>
            <div className="flex items-center gap-4 text-xs text-app-text-muted">
              <span>TB: <span className="text-app-accent-primary font-bold">{avgExam}%</span></span>
              <span>Cao nhất: <span className="text-app-accent-success font-bold">{bestExam}%</span></span>
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {examResults.slice().reverse().map((r, i) => {
              const pct = Math.round((r.score / r.total) * 100);
              const color = pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171";
              return (
                <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 bg-app-surface/50 rounded-xl">
                  <span className="text-app-text-muted text-xs w-5 flex-shrink-0">#{examResults.length - i}</span>
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                    <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60 text-xs font-medium">{r.score}/{r.total} câu đúng</p>
                    <p className="text-app-text-muted text-[10px]">{new Date(r.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })} · {Math.floor(r.timeUsed / 60)}:{String(r.timeUsed % 60).padStart(2, "0")} phút</p>
                  </div>
                  <div className="w-24 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
