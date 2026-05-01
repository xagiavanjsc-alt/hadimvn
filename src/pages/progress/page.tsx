import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsQuestions, EPS_TOPICS } from "@/mocks/epsQuestions";

interface ExamResult {
  id: string;
  date: string;
  score: number;
  total: number;
  timeUsed: number;
  correctIds: string[];
}

// Simple SVG Radar Chart — no external lib needed
function RadarChart({ data, size = 280 }: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const n = data.length;
  const levels = [0.25, 0.5, 0.75, 1.0];

  const angleOf = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const pointAt = (i: number, ratio: number) => {
    const a = angleOf(i);
    return { x: cx + r * ratio * Math.cos(a), y: cy + r * ratio * Math.sin(a) };
  };

  const gridPoints = (ratio: number) =>
    Array.from({ length: n }, (_, i) => pointAt(i, ratio))
      .map(p => `${p.x},${p.y}`)
      .join(" ");

  const dataPoints = data
    .map((d, i) => pointAt(i, d.value / 100))
    .map(p => `${p.x},${p.y}`)
    .join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid circles */}
      {levels.map(l => (
        <polygon
          key={l}
          points={gridPoints(l)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}
      {/* Axis lines */}
      {data.map((_, i) => {
        const p = pointAt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}
      {/* Data polygon */}
      <polygon
        points={dataPoints}
        fill="rgba(232,200,74,0.12)"
        stroke="#e8c84a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Data points */}
      {data.map((d, i) => {
        const p = pointAt(i, d.value / 100);
        return (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#e8c84a" stroke="#0f1117" strokeWidth="2" />
        );
      })}
      {/* Labels */}
      {data.map((d, i) => {
        const p = pointAt(i, 1.22);
        const anchor = p.x < cx - 5 ? "end" : p.x > cx + 5 ? "start" : "middle";
        return (
          <text key={i} x={p.x} y={p.y} textAnchor={anchor} dominantBaseline="middle"
            fontSize="9" fill="rgba(255,255,255,0.45)" fontFamily="Be Vietnam Pro, sans-serif">
            {d.label}
          </text>
        );
      })}
      {/* Level labels */}
      {levels.map(l => {
        const p = pointAt(0, l);
        return (
          <text key={l} x={p.x + 3} y={p.y} fontSize="7" fill="rgba(255,255,255,0.2)" fontFamily="Be Vietnam Pro, sans-serif">
            {Math.round(l * 100)}%
          </text>
        );
      })}
    </svg>
  );
}

export default function ProgressPage() {
  const navigate = useNavigate();
  const [examResults] = useLocalStorage<ExamResult[]>("kts_eps_exam_results", []);
  const [answeredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [selectedExam, setSelectedExam] = useState<number>(0); // index into examResults

  // Build per-topic accuracy from practice
  const practiceByTopic = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    EPS_TOPICS.forEach(t => { map[t.id] = { correct: 0, total: 0 }; });
    epsQuestions.forEach(q => {
      if (!map[q.topic]) map[q.topic] = { correct: 0, total: 0 };
      if (answeredMap[q.id] !== undefined) {
        map[q.topic].total += 1;
        if (answeredMap[q.id] === q.correctIndex) map[q.topic].correct += 1;
      }
    });
    return map;
  }, [answeredMap]);

  // Build per-topic accuracy from a specific exam
  const examByTopic = useMemo(() => {
    if (examResults.length === 0) return null;
    const r = examResults[examResults.length - 1 - selectedExam];
    if (!r) return null;
    const map: Record<string, { correct: number; total: number }> = {};
    EPS_TOPICS.forEach(t => { map[t.id] = { correct: 0, total: 0 }; });
    epsQuestions.forEach(q => {
      if (!map[q.topic]) map[q.topic] = { correct: 0, total: 0 };
      // Only count questions that appeared in this exam (approximation: use correctIds)
      const wasCorrect = r.correctIds.includes(q.id);
      // We don't know which questions were in the exam exactly, so use practice data as fallback
      if (answeredMap[q.id] !== undefined) {
        map[q.topic].total += 1;
        if (wasCorrect) map[q.topic].correct += 1;
      }
    });
    return { result: r, map };
  }, [examResults, selectedExam, answeredMap]);

  // Radar data from practice
  const radarData = useMemo(() => {
    return EPS_TOPICS.map(t => {
      const d = practiceByTopic[t.id] ?? { correct: 0, total: 0 };
      const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
      return { label: t.label.split(" ")[0], value: pct, color: t.color };
    });
  }, [practiceByTopic]);

  // Trend: last 5 exams
  const trend = useMemo(() => {
    return examResults.slice(-5).map(r => ({
      date: new Date(r.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      pct: Math.round((r.score / r.total) * 100),
      score: r.score,
      total: r.total,
    }));
  }, [examResults]);

  const maxTrend = Math.max(...trend.map(t => t.pct), 1);

  // Weakest topics
  const weakTopics = useMemo(() => {
    return EPS_TOPICS.map(t => {
      const d = practiceByTopic[t.id] ?? { correct: 0, total: 0 };
      const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
      return { ...t, pct, done: d.total };
    }).filter(t => t.done > 0).sort((a, b) => a.pct - b.pct);
  }, [practiceByTopic]);

  const totalDone = Object.keys(answeredMap).length;
  const totalCorrect = epsQuestions.filter(q => answeredMap[q.id] === q.correctIndex).length;
  const overallPct = totalDone > 0 ? Math.round((totalCorrect / totalDone) * 100) : 0;
  const bestExam = examResults.length > 0 ? Math.max(...examResults.map(r => Math.round((r.score / r.total) * 100))) : 0;

  return (
    <DashboardLayout
      title="So sánh tiến độ"
      subtitle="Biểu đồ radar phân tích điểm mạnh/yếu theo chủ đề EPS"
      actions={
        <button
          onClick={() => navigate("/eps-exam")}
          className="flex items-center gap-2 bg-[#e8c84a]/10 hover:bg-[#e8c84a]/20 text-[#e8c84a] text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap border border-[#e8c84a]/20"
        >
          <i className="ri-timer-line"></i>
          Thi thử ngay
        </button>
      }
    >
      {/* Overall stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Câu đã làm", value: totalDone, sub: `/ ${epsQuestions.length} tổng`, color: "#e8c84a", icon: "ri-survey-line" },
          { label: "Tỷ lệ đúng", value: `${overallPct}%`, sub: `${totalCorrect} câu đúng`, color: "#34d399", icon: "ri-checkbox-circle-line" },
          { label: "Lần thi thử", value: examResults.length, sub: "bài thi đã làm", color: "#06b6d4", icon: "ri-timer-line" },
          { label: "Điểm cao nhất", value: bestExam > 0 ? `${bestExam}%` : "—", sub: "trong thi thử", color: "#a78bfa", icon: "ri-trophy-line" },
        ].map(s => (
          <div key={s.label} className="bg-[#0f1117] border border-white/5 rounded-2xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{s.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              <p className="text-white/20 text-[10px]">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-6 mb-6">
        {/* Radar chart */}
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-6 flex flex-col items-center">
          <h3 className="text-white font-semibold text-sm mb-1 self-start">Biểu đồ radar theo chủ đề</h3>
          <p className="text-white/30 text-xs mb-4 self-start">Dựa trên kết quả luyện tập thực tế</p>
          {totalDone === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center w-72">
              <i className="ri-radar-line text-white/10 text-4xl mb-3"></i>
              <p className="text-white/25 text-sm">Chưa có dữ liệu</p>
              <p className="text-white/15 text-xs mt-1">Làm câu hỏi EPS để xem biểu đồ</p>
              <button onClick={() => navigate("/eps")} className="mt-4 text-[#e8c84a] text-xs cursor-pointer whitespace-nowrap">
                Luyện tập ngay →
              </button>
            </div>
          ) : (
            <RadarChart data={radarData} size={300} />
          )}
        </div>

        {/* Topic breakdown */}
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Chi tiết từng chủ đề</h3>
          <div className="space-y-3">
            {EPS_TOPICS.map(t => {
              const d = practiceByTopic[t.id] ?? { correct: 0, total: 0 };
              const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
              const color = pct >= 80 ? "#34d399" : pct >= 60 ? "#e8c84a" : pct > 0 ? "#f87171" : "rgba(255,255,255,0.1)";
              const totalQ = epsQuestions.filter(q => q.topic === t.id).length;
              return (
                <div key={t.id}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${t.color}15` }}>
                      <i className={`${t.icon} text-xs`} style={{ color: t.color }}></i>
                    </div>
                    <span className="text-white/60 text-xs flex-1">{t.label}</span>
                    <span className="text-white/30 text-[10px]">{d.correct}/{d.total} đúng</span>
                    <span className="text-xs font-bold w-10 text-right" style={{ color }}>{d.total > 0 ? `${pct}%` : "—"}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden ml-9">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  <p className="text-white/15 text-[10px] ml-9 mt-0.5">{totalQ} câu trong ngân hàng đề</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Exam trend */}
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Xu hướng điểm thi</h3>
              <p className="text-white/30 text-xs">5 lần thi gần nhất</p>
            </div>
            {examResults.length > 1 && (
              <div className="flex items-center gap-1">
                {trend[trend.length - 1]?.pct > trend[0]?.pct ? (
                  <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <i className="ri-arrow-up-line"></i>Đang tiến bộ
                  </span>
                ) : (
                  <span className="text-[#fb923c] text-xs font-semibold flex items-center gap-1">
                    <i className="ri-arrow-down-line"></i>Cần cố gắng
                  </span>
                )}
              </div>
            )}
          </div>

          {trend.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <i className="ri-line-chart-line text-white/10 text-3xl mb-2"></i>
              <p className="text-white/25 text-sm">Chưa có lần thi nào</p>
              <button onClick={() => navigate("/eps-exam")} className="mt-3 text-[#e8c84a] text-xs cursor-pointer whitespace-nowrap">
                Thi thử ngay →
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-3 h-28 mb-3">
                {trend.map((t, i) => {
                  const barH = Math.max((t.pct / maxTrend) * 96, 4);
                  const color = t.pct >= 80 ? "#34d399" : t.pct >= 60 ? "#e8c84a" : "#f87171";
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#1a1d27] border border-white/10 text-white/70 text-[9px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {t.score}/{t.total} câu · {t.pct}%
                      </div>
                      <div className="w-full rounded-t-lg transition-all" style={{ height: `${barH}px`, backgroundColor: color }} />
                      <span className="text-white/25 text-[9px]">{t.date}</span>
                    </div>
                  );
                })}
              </div>
              {/* 80% threshold line indicator */}
              <div className="flex items-center gap-2 text-[10px] text-white/25">
                <div className="w-4 h-px border-t border-dashed border-[#e8c84a]/40"></div>
                <span className="text-[#e8c84a]/50">Ngưỡng đậu 80%</span>
              </div>
            </>
          )}
        </div>

        {/* Weak topics + recommendations */}
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1">Chủ đề cần ôn thêm</h3>
          <p className="text-white/30 text-xs mb-4">Tập trung vào những chủ đề yếu nhất</p>

          {weakTopics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <i className="ri-checkbox-circle-line text-white/10 text-3xl mb-2"></i>
              <p className="text-white/25 text-sm">Chưa có dữ liệu luyện tập</p>
            </div>
          ) : (
            <div className="space-y-2">
              {weakTopics.slice(0, 5).map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => navigate("/eps")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <span className="text-white/20 text-xs font-bold w-4 flex-shrink-0">{i + 1}</span>
                  <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${t.color}15` }}>
                    <i className={`${t.icon} text-xs`} style={{ color: t.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-xs font-medium truncate">{t.label}</p>
                    <p className="text-white/25 text-[10px]">{t.done} câu đã làm</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold" style={{ color: t.pct >= 60 ? "#e8c84a" : "#f87171" }}>{t.pct}%</span>
                    <i className="ri-arrow-right-line text-white/20 text-xs"></i>
                  </div>
                </button>
              ))}
            </div>
          )}

          {weakTopics.length > 0 && (
            <button
              onClick={() => navigate("/eps")}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#e8c84a]/10 hover:bg-[#e8c84a]/20 text-[#e8c84a] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-book-open-line"></i>
              Ôn luyện chủ đề yếu ngay
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

