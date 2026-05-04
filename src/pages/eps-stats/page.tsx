import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsQuestions, EPS_TOPICS } from "@/mocks/epsQuestions";
import { epsVocabulary, EPS_VOCAB_TOPICS } from "@/mocks/epsVocabulary";

interface ExamResult {
  id: string;
  date: string;
  score: number;
  total: number;
  timeUsed: number;
  correctIds: string[];
}

function deduplicateVocab(items: typeof epsVocabulary) {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = item.korean.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const DEDUPED_VOCAB = deduplicateVocab(epsVocabulary);

// --- Mini bar chart -----------------------------------------------------------
function BarChart({ data, maxVal }: { data: { label: string; value: number; color: string }[]; maxVal: number }) {
  return (
    <div className="space-y-2">
      {data.map(item => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-app-text-secondary text-[10px] w-28 flex-shrink-0 truncate">{item.label}</span>
          <div className="flex-1 h-2 bg-app-card/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${maxVal > 0 ? (item.value / maxVal) * 100 : 0}%`, backgroundColor: item.color }}
            />
          </div>
          <span className="text-white/60 text-[10px] w-8 text-right flex-shrink-0">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// --- Donut chart --------------------------------------------------------------
function DonutChart({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fill={color} fontSize={size * 0.18} fontWeight="bold">
        {pct}%
      </text>
    </svg>
  );
}

export default function EpsStatsPage() {
  const navigate = useNavigate();
  const [examResults] = useLocalStorage<ExamResult[]>("kts_eps_exam_results", []);
  const [masteredVocabIds] = useLocalStorage<string[]>("kts_eps_vocab_mastered", []);
  const [activeTab, setActiveTab] = useState<"overview" | "exam" | "vocab" | "topic">("overview");

  // -- Exam stats --------------------------------------------------------------
  const examStats = useMemo(() => {
    if (examResults.length === 0) return null;
    const scores = examResults.map(r => Math.round((r.score / r.total) * 100));
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);
    const latest = scores[scores.length - 1];
    const passed = examResults.filter(r => Math.round((r.score / r.total) * 100) >= 80).length;
    const avgTime = Math.round(examResults.reduce((a, r) => a + r.timeUsed, 0) / examResults.length);
    return { avg, best, latest, passed, total: examResults.length, avgTime };
  }, [examResults]);

  // -- Vocab stats -------------------------------------------------------------
  const vocabStats = useMemo(() => {
    const mastered = masteredVocabIds.filter(id => DEDUPED_VOCAB.some(v => v.id === id)).length;
    const pct = DEDUPED_VOCAB.length > 0 ? Math.round((mastered / DEDUPED_VOCAB.length) * 100) : 0;
    const byTopic = EPS_VOCAB_TOPICS.map(t => {
      const items = DEDUPED_VOCAB.filter(v => v.topicId === t.id);
      const m = items.filter(v => masteredVocabIds.includes(v.id)).length;
      return { ...t, total: items.length, mastered: m, pct: items.length > 0 ? Math.round((m / items.length) * 100) : 0 };
    });
    return { mastered, total: DEDUPED_VOCAB.length, pct, byTopic };
  }, [masteredVocabIds]);

  // -- Question stats by topic -------------------------------------------------
  const questionTopicStats = useMemo(() => {
    return EPS_TOPICS.map(topic => {
      const qs = epsQuestions.filter(q => q.topic === topic.id);
      // Tính t? t?t c? k?t qu? thi
      let correct = 0;
      let attempted = 0;
      examResults.forEach(r => {
        qs.forEach(q => {
          if (r.correctIds.includes(q.id)) { correct++; attempted++; }
          // Không có cách bi?t câu nào dã làm t? correctIds, dùng u?c tính
        });
      });
      const pct = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
      return { ...topic, total: qs.length, correct, attempted, pct };
    });
  }, [examResults]);

  // -- Score trend (last 10 exams) ---------------------------------------------
  const scoreTrend = useMemo(() => {
    return examResults.slice(-10).map((r, i) => ({
      label: `L?n ${examResults.length - examResults.slice(-10).length + i + 1}`,
      score: Math.round((r.score / r.total) * 100),
      date: new Date(r.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    }));
  }, [examResults]);

  const tabs = [
    { id: "overview", label: "T?ng quan", icon: "ri-dashboard-line" },
    { id: "exam", label: "K?t qu? thi", icon: "ri-file-list-3-line" },
    { id: "vocab", label: "T? v?ng", icon: "ri-translate-2" },
    { id: "topic", label: "Theo ch? d?", icon: "ri-pie-chart-line" },
  ] as const;

  return (
    <DashboardLayout
      title="Th?ng kê h?c t?p EPS"
      subtitle="Phân tích ti?n d? toàn di?n — t? v?ng, câu h?i, k?t qu? thi"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/eps-vocabulary")}
            className="flex items-center gap-2 bg-app-card/50 hover:bg-white/8 text-white/60 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-translate-2"></i>T? v?ng EPS
          </button>
          <button
            onClick={() => navigate("/eps-exam")}
            className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-timer-line"></i>Thi th? ngay
          </button>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-app-surface/50 border border-app-border rounded-xl p-1 mb-6 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/70"}`}
          >
            <i className={tab.icon}></i>{tab.label}
          </button>
        ))}
      </div>

      {/* -- OVERVIEW -- */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "T? v?ng dã thu?c",
                value: `${vocabStats.mastered}/${vocabStats.total}`,
                sub: `${vocabStats.pct}% hoàn thành`,
                icon: "ri-checkbox-circle-line",
                color: "#34d399",
              },
              {
                label: "L?n thi th?",
                value: examResults.length.toString(),
                sub: examStats ? `Ði?m TB: ${examStats.avg}%` : "Chua thi l?n nào",
                icon: "ri-file-list-3-line",
                color: "app-accent-primary",
              },
              {
                label: "Ði?m cao nh?t",
                value: examStats ? `${examStats.best}%` : "—",
                sub: examStats ? (examStats.best >= 80 ? "Ð?t ngu?ng d?u!" : "C?n c? thêm") : "Chua có d? li?u",
                icon: "ri-trophy-line",
                color: "#fb923c",
              },
              {
                label: "T? l? d?u",
                value: examStats ? `${examStats.passed}/${examStats.total}` : "—",
                sub: examStats ? `${Math.round((examStats.passed / examStats.total) * 100)}% l?n thi d?u` : "Chua có d? li?u",
                icon: "ri-medal-line",
                color: "#a78bfa",
              },
            ].map(kpi => (
              <div key={kpi.label} className="bg-app-bg border border-app-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${kpi.color}15` }}>
                    <i className={`${kpi.icon} text-lg`} style={{ color: kpi.color }}></i>
                  </div>
                  <div>
                    <p className="text-white font-bold text-xl leading-none">{kpi.value}</p>
                    <p className="text-app-text-muted text-[10px] mt-0.5">{kpi.label}</p>
                  </div>
                </div>
                <p className="text-app-text-secondary text-[10px]">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Vocab progress + Exam trend */}
          <div className="grid grid-cols-2 gap-5">
            {/* Vocab donut */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Ti?n d? t? v?ng EPS</h3>
              <div className="flex items-center gap-6">
                <DonutChart pct={vocabStats.pct} color="#34d399" size={100} />
                <div className="flex-1 space-y-2">
                  {[
                    { label: "Ðã thu?c", value: vocabStats.mastered, color: "#34d399" },
                    { label: "Chua thu?c", value: vocabStats.total - vocabStats.mastered, color: "#f87171" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                      <span className="text-white/50 text-xs flex-1">{item.label}</span>
                      <span className="text-white font-bold text-sm">{item.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-app-border">
                    <p className="text-app-text-muted text-[10px]">T?ng: {vocabStats.total} t? EPS chu?n</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Score trend */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Xu hu?ng di?m thi ({scoreTrend.length} l?n g?n nh?t)</h3>
              {scoreTrend.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 text-center">
                  <i className="ri-bar-chart-line text-white/10 text-2xl mb-2"></i>
                  <p className="text-app-text-muted text-xs">Chua có d? li?u thi</p>
                  <button onClick={() => navigate("/eps-exam")} className="mt-2 text-app-accent-primary text-xs cursor-pointer whitespace-nowrap">Thi th? ngay ?</button>
                </div>
              ) : (
                <div className="flex items-end gap-1.5 h-24">
                  {scoreTrend.map((item, i) => {
                    const color = item.score >= 80 ? "#34d399" : item.score >= 60 ? "app-accent-primary" : "#f87171";
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[8px] font-bold" style={{ color }}>{item.score}%</span>
                        <div className="w-full rounded-t-sm" style={{ height: `${(item.score / 100) * 72}px`, backgroundColor: `${color}40`, border: `1px solid ${color}30` }}></div>
                        <span className="text-[8px] text-app-text-muted whitespace-nowrap">{item.date}</span>
                      </div>
                    );
                  })}
                  {/* Ngu?ng d?u line */}
                  <div className="absolute" style={{ display: "none" }}></div>
                </div>
              )}
              {examStats && (
                <div className="mt-3 pt-3 border-t border-app-border flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">{examStats.avg}%</p>
                    <p className="text-app-text-muted text-[10px]">Trung bình</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">{examStats.best}%</p>
                    <p className="text-app-text-muted text-[10px]">Cao nh?t</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">{Math.floor(examStats.avgTime / 60)}:{String(examStats.avgTime % 60).padStart(2, "0")}</p>
                    <p className="text-app-text-muted text-[10px]">Th?i gian TB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "ri-timer-line", label: "Thi th? EPS 40 câu", sub: "Ng?u nhiên toàn ch? d?", color: "app-accent-primary", path: "/eps-exam" },
              { icon: "ri-translate-2", label: "Ôn t? v?ng EPS", sub: `${vocabStats.total - vocabStats.mastered} t? chua thu?c`, color: "#34d399", path: "/eps-vocabulary" },
              { icon: "ri-file-list-3-line", label: "Luy?n câu h?i EPS", sub: `${epsQuestions.length} câu theo ch? d?`, color: "#fb923c", path: "/eps" },
            ].map(action => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="bg-app-bg border border-app-border hover:border-app-border rounded-xl p-4 text-left transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl mb-3" style={{ backgroundColor: `${action.color}15` }}>
                  <i className={`${action.icon} text-lg`} style={{ color: action.color }}></i>
                </div>
                <p className="text-white font-semibold text-sm group-hover:text-app-accent-primary/90 transition-colors">{action.label}</p>
                <p className="text-app-text-muted text-[10px] mt-0.5">{action.sub}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* -- EXAM HISTORY -- */}
      {activeTab === "exam" && (
        <div className="space-y-5">
          {examResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-app-bg border border-app-border rounded-2xl text-center">
              <i className="ri-file-list-3-line text-white/10 text-4xl mb-3"></i>
              <p className="text-app-text-muted text-sm">Chua có k?t qu? thi nào</p>
              <button onClick={() => navigate("/eps-exam")} className="mt-3 flex items-center gap-2 bg-app-accent-primary text-app-bg font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap">
                <i className="ri-play-circle-line"></i>Thi th? ngay
              </button>
            </div>
          ) : (
            <>
              {/* Summary */}
              {examStats && (
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: "T?ng l?n thi", value: examStats.total, color: "app-accent-primary" },
                    { label: "Ði?m TB", value: `${examStats.avg}%`, color: examStats.avg >= 80 ? "#34d399" : "app-accent-primary" },
                    { label: "Ði?m cao nh?t", value: `${examStats.best}%`, color: "#34d399" },
                    { label: "Ði?m g?n nh?t", value: `${examStats.latest}%`, color: examStats.latest >= 80 ? "#34d399" : "#f87171" },
                    { label: "S? l?n d?u", value: `${examStats.passed}/${examStats.total}`, color: "#a78bfa" },
                  ].map(s => (
                    <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4 text-center">
                      <p className="font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-app-text-muted text-[10px] mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* History list */}
              <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-app-border">
                  <h3 className="text-white font-semibold text-sm">L?ch s? thi ({examResults.length} l?n)</h3>
                </div>
                <div className="divide-y divide-white/3 max-h-[500px] overflow-y-auto">
                  {[...examResults].reverse().map((r, i) => {
                    const pct = Math.round((r.score / r.total) * 100);
                    const color = pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171";
                    const passed = pct >= 80;
                    return (
                      <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                          <span className="text-xs font-bold" style={{ color }}>#{examResults.length - i}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white/70 text-sm font-medium">{r.score}/{r.total} câu dúng</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${passed ? "bg-emerald-500/10 text-app-accent-success" : "bg-red-500/10 text-red-400"}`}>
                              {passed ? "Ð?U" : "Chua d?u"}
                            </span>
                          </div>
                          <p className="text-app-text-muted text-[10px]">
                            {new Date(r.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            {" · "}
                            {Math.floor(r.timeUsed / 60)} phút {r.timeUsed % 60} giây
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg" style={{ color }}>{pct}%</p>
                          <div className="w-20 h-1.5 bg-app-card/50 rounded-full overflow-hidden mt-1">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* -- VOCAB STATS -- */}
      {activeTab === "vocab" && (
        <div className="space-y-5">
          {/* Overall */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-6">
            <div className="flex items-center gap-6">
              <DonutChart pct={vocabStats.pct} color="#34d399" size={120} />
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">Ti?n d? t? v?ng EPS</h3>
                <p className="text-app-text-secondary text-sm mb-4">{vocabStats.mastered} / {vocabStats.total} t? dã thu?c</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Ðã thu?c", value: vocabStats.mastered, color: "#34d399" },
                    { label: "Chua thu?c", value: vocabStats.total - vocabStats.mastered, color: "#f87171" },
                    { label: "T?ng t? EPS", value: vocabStats.total, color: "app-accent-primary" },
                  ].map(s => (
                    <div key={s.label} className="bg-app-surface/50 rounded-xl p-3 text-center">
                      <p className="font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-app-text-muted text-[10px] mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* By topic */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Ti?n d? theo ch? d?</h3>
            <div className="grid grid-cols-2 gap-3">
              {vocabStats.byTopic.filter(t => t.total > 0).map(topic => (
                <div key={topic.id} className="bg-app-surface/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${topic.color}15` }}>
                      <i className={`${topic.icon} text-xs`} style={{ color: topic.color }}></i>
                    </div>
                    <span className="text-white/60 text-xs font-medium flex-1 truncate">{topic.label}</span>
                    <span className="text-xs font-bold" style={{ color: topic.pct >= 80 ? "#34d399" : topic.pct >= 50 ? "app-accent-primary" : "#f87171" }}>{topic.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden mb-1">
                    <div className="h-full rounded-full transition-all" style={{ width: `${topic.pct}%`, backgroundColor: topic.color }} />
                  </div>
                  <p className="text-app-text-muted text-[10px]">{topic.mastered}/{topic.total} t?</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => navigate("/eps-vocabulary")}
              className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-6 py-3 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
            >
              <i className="ri-play-line"></i>Ti?p t?c ôn t? v?ng
            </button>
          </div>
        </div>
      )}

      {/* -- TOPIC STATS -- */}
      {activeTab === "topic" && (
        <div className="space-y-5">
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Câu h?i EPS theo ch? d?</h3>
            <BarChart
              data={EPS_TOPICS.map(t => ({
                label: t.label,
                value: epsQuestions.filter(q => q.topic === t.id).length,
                color: t.color,
              }))}
              maxVal={Math.max(...EPS_TOPICS.map(t => epsQuestions.filter(q => q.topic === t.id).length))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {EPS_TOPICS.map(topic => {
              const qs = epsQuestions.filter(q => q.topic === topic.id);
              const easy = qs.filter(q => q.difficulty === "easy").length;
              const medium = qs.filter(q => q.difficulty === "medium").length;
              const hard = qs.filter(q => q.difficulty === "hard").length;
              return (
                <div key={topic.id} className="bg-app-bg border border-app-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${topic.color}15` }}>
                      <i className={`${topic.icon} text-sm`} style={{ color: topic.color }}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-xs font-semibold truncate">{topic.label}</p>
                      <p className="text-app-text-muted text-[10px]">{qs.length} câu h?i</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      { label: "D?", value: easy, color: "#34d399" },
                      { label: "TB", value: medium, color: "app-accent-primary" },
                      { label: "Khó", value: hard, color: "#f87171" },
                    ].map(d => (
                      <div key={d.label} className="flex-1 text-center bg-app-surface/50 rounded-lg py-1.5">
                        <p className="text-xs font-bold" style={{ color: d.color }}>{d.value}</p>
                        <p className="text-[9px] text-app-text-muted">{d.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">G?i ý ôn t?p</h3>
            <div className="space-y-3">
              {[
                { icon: "ri-alert-line", color: "#f87171", title: "Ch? d? c?n ôn thêm", desc: "Pháp lu?t lao d?ng & Tình hu?ng kh?n c?p — nhi?u câu khó, ít câu d?", action: "Ôn ngay", path: "/eps" },
                { icon: "ri-star-line", color: "app-accent-primary", title: "Ch? d? dang t?t", desc: "Giao ti?p co b?n & Nghe hi?u — nhi?u câu d?, phù h?p ôn nhanh", action: "Ti?p t?c", path: "/eps" },
                { icon: "ri-lightbulb-line", color: "#34d399", title: "M?o thi EPS", desc: "Ð?c k? câu h?i ti?ng Vi?t tru?c, lo?i tr? dáp án sai, chú ý t? ph? d?nh", action: "Xem m?o", path: "/eps-topics" },
              ].map(tip => (
                <div key={tip.title} className="flex items-start gap-3 p-4 bg-app-surface/50 rounded-xl">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${tip.color}15` }}>
                    <i className={`${tip.icon} text-sm`} style={{ color: tip.color }}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-xs font-semibold mb-0.5">{tip.title}</p>
                    <p className="text-white/35 text-[10px] leading-relaxed">{tip.desc}</p>
                  </div>
                  <button onClick={() => navigate(tip.path)} className="text-[10px] text-app-accent-primary/70 hover:text-app-accent-primary cursor-pointer whitespace-nowrap transition-colors">{tip.action} ?</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


