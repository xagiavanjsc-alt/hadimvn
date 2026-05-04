import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { grammarPatterns } from "@/mocks/grammarData";
import { vocabularyData } from "@/mocks/vocabularyData";
import { topikQuestions } from "@/mocks/topikQuestions";
import { topik2Questions } from "@/mocks/topik2Questions";

// --- Mini Bar Chart -------------------------------------------------------
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-app-card/50 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }}></div>
      </div>
      <span className="text-[10px] text-app-text-muted w-8 text-right">{Math.round(pct)}%</span>
    </div>
  );
}

// --- Radial Progress ------------------------------------------------------
function RadialProgress({ value, max, color, size = 80 }: { value: number; max: number; color: string; size?: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.7s ease" }} />
    </svg>
  );
}

// --- Module Card ----------------------------------------------------------
function ModuleCard({
  icon, title, subtitle, color, stats, path, onNavigate,
}: {
  icon: string; title: string; subtitle: string; color: string;
  stats: { label: string; done: number; total: number }[];
  path: string; onNavigate: (p: string) => void;
}) {
  const mainStat = stats[0];
  const pct = mainStat.total > 0 ? Math.round((mainStat.done / mainStat.total) * 100) : 0;

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5 hover:border-app-border transition-all cursor-pointer group" onClick={() => onNavigate(path)}>
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <RadialProgress value={mainStat.done} max={mainStat.total} color={color} size={72} />
          <div className="absolute inset-0 flex items-center justify-center">
            <i className={`${icon} text-xl`} style={{ color }}></i>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm mb-0.5">{title}</p>
          <p className="text-app-text-muted text-xs mb-2">{subtitle}</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color }}>{pct}%</span>
            <span className="text-app-text-muted text-xs">{mainStat.done}/{mainStat.total} {mainStat.label}</span>
          </div>
        </div>
        <i className="ri-arrow-right-line text-app-text-muted group-hover:text-app-text-secondary transition-colors flex-shrink-0 mt-1"></i>
      </div>
      <div className="space-y-2">
        {stats.map(s => (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-app-text-muted text-[10px]">{s.label}</span>
              <span className="text-app-text-muted text-[10px]">{s.done}/{s.total}</span>
            </div>
            <MiniBar value={s.done} max={s.total} color={color} />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Activity Heatmap (7 ngày g?n nh?t) ----------------------------------
function ActivityStreak({ activityDays }: { activityDays: string[] }) {
  const today = new Date();
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (27 - i));
    return d.toISOString().split("T")[0];
  });
  const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {days.map(day => {
          const isActive = activityDays.includes(day);
          const isToday = day === today.toISOString().split("T")[0];
          return (
            <div key={day} title={day}
              className={`w-6 h-6 rounded-md transition-all ${isToday ? "ring-1 ring-[app-accent-primary]/40" : ""} ${isActive ? "bg-app-accent-primary/70" : "bg-app-card/50"}`}>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-app-card/50"></div>
          <span className="text-app-text-muted text-[10px]">Không h?c</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-app-accent-primary/70"></div>
          <span className="text-app-text-muted text-[10px]">Ðã h?c</span>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ------------------------------------------------------------
export default function LearnOverviewPage() {
  const navigate = useNavigate();

  // Load all progress data from localStorage
  const [grammarAnswers] = useLocalStorage<Record<string, boolean>>("kts_grammar_answers", {});
  const [vocabMastered] = useLocalStorage<string[]>("kts_vocab_mastered", []);
  const [hangulMastered] = useLocalStorage<string[]>("kts_hangul_mastered", []);
  const [hangulScores] = useLocalStorage<Record<string, number[]>>("kts_hangul_scores", {});
  const [listenScores] = useLocalStorage<Record<string, number>>("kts_listen_scores", {});
  const [topik1Best] = useLocalStorage<number>("kts_topik1_best", 0);
  const [topik1Attempts] = useLocalStorage<number>("kts_topik1_attempts", 0);
  const [topik2Best] = useLocalStorage<number>("kts_topik2_best", 0);
  const [topik2Attempts] = useLocalStorage<number>("kts_topik2_attempts", 0);
  const [streak] = useLocalStorage<{ count: number; lastDate: string }>("kts_streak", { count: 0, lastDate: "" });

  // Grammar stats
  const grammarTotal = grammarPatterns.reduce((s, p) => s + p.exercises.length, 0);
  const grammarDone = Object.keys(grammarAnswers).length;
  const grammarCorrect = Object.values(grammarAnswers).filter(Boolean).length;
  const grammarPatternsDone = grammarPatterns.filter(p => p.exercises.every(ex => grammarAnswers[ex.id] !== undefined)).length;

  // Vocab stats
  const vocabTotal = vocabularyData.length;
  const vocabDone = vocabMastered.filter(id => vocabularyData.some(v => v.id === id)).length;

  // Hangul stats
  const hangulTotal = 28;
  const hangulDone = hangulMastered.length;
  const hangulAvgScore = Object.values(hangulScores).length > 0
    ? Math.round(Object.values(hangulScores).flatMap(a => a).reduce((a, b) => a + b, 0) / Object.values(hangulScores).flatMap(a => a).length)
    : 0;

  // Listen stats
  const listenTotal = 18;
  const listenDone = Object.keys(listenScores).length;
  const listenMastered = Object.values(listenScores).filter(s => s >= 80).length;

  // TOPIK stats
  const topik1MaxScore = topikQuestions.reduce((s, q) => s + q.points, 0);
  const topik2MaxScore = topik2Questions.reduce((s, q) => s + q.points, 0);

  // Overall score
  const modules = [
    { done: grammarDone, total: grammarTotal },
    { done: vocabDone, total: vocabTotal },
    { done: hangulDone, total: hangulTotal },
    { done: listenDone, total: listenTotal },
  ];
  const overallPct = Math.round(
    modules.reduce((s, m) => s + (m.total > 0 ? (m.done / m.total) * 100 : 0), 0) / modules.length
  );

  // Activity days (simulate from streak)
  const activityDays = useMemo(() => {
    const days: string[] = [];
    if (streak.lastDate) {
      for (let i = 0; i < Math.min(streak.count, 28); i++) {
        const d = new Date(streak.lastDate);
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split("T")[0]);
      }
    }
    return days;
  }, [streak]);

  const moduleCards = [
    {
      icon: "ri-book-2-line", title: "Ng? pháp", subtitle: "M?u câu & Bài t?p", color: "app-accent-primary", path: "/grammar",
      stats: [
        { label: "Bài t?p hoàn thành", done: grammarDone, total: grammarTotal },
        { label: "M?u câu dã h?c", done: grammarPatternsDone, total: grammarPatterns.length },
        { label: "Tr? l?i dúng", done: grammarCorrect, total: grammarTotal },
      ],
    },
    {
      icon: "ri-translate-2", title: "T? v?ng", subtitle: "Phân lo?i theo ch? d?", color: "#34d399", path: "/vocabulary",
      stats: [
        { label: "T? dã thu?c", done: vocabDone, total: vocabTotal },
        { label: "C?p A1-A2", done: vocabMastered.filter(id => vocabularyData.find(v => v.id === id && (v.topikLevel === "A1" || v.topikLevel === "A2"))).length, total: vocabularyData.filter(v => v.topikLevel === "A1" || v.topikLevel === "A2").length },
        { label: "C?p B1-B2", done: vocabMastered.filter(id => vocabularyData.find(v => v.id === id && (v.topikLevel === "B1" || v.topikLevel === "B2"))).length, total: vocabularyData.filter(v => v.topikLevel === "B1" || v.topikLevel === "B2").length },
      ],
    },
    {
      icon: "ri-edit-2-line", title: "Luy?n vi?t Hangul", subtitle: "Nh?n di?n nét vi?t", color: "#a78bfa", path: "/hangul-write",
      stats: [
        { label: "Ký t? thành th?o", done: hangulDone, total: hangulTotal },
        { label: "Ði?m TB", done: hangulAvgScore, total: 100 },
      ],
    },
    {
      icon: "ri-mic-2-line", title: "Luy?n phát âm", subtitle: "Nh?n di?n gi?ng nói AI", color: "#38bdf8", path: "/listen-practice",
      stats: [
        { label: "Câu dã luy?n", done: listenDone, total: listenTotal },
        { label: "Thành th?o (=80d)", done: listenMastered, total: listenTotal },
      ],
    },
  ];

  return (
    <DashboardLayout
      title="T?ng quan h?c t?p"
      subtitle="Theo dõi ti?n d? toàn b? hành trình h?c ti?ng Hàn c?a b?n"
    >
      {/* Overall hero */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-6">
          {/* Big radial */}
          <div className="relative flex-shrink-0">
            <RadialProgress value={overallPct} max={100} color="app-accent-primary" size={120} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-app-accent-primary">{overallPct}%</span>
              <span className="text-app-text-muted text-[10px]">T?ng th?</span>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-white text-xl font-bold mb-1">Hành trình h?c ti?ng Hàn</h2>
            <p className="text-app-text-secondary text-sm mb-4">
              {overallPct < 20 ? "B?n m?i b?t d?u — hãy kiên trì m?i ngày!" :
               overallPct < 50 ? "Ðang ti?n b? t?t — ti?p t?c nhé!" :
               overallPct < 80 ? "G?n d?n dích r?i — c? lên!" :
               "Xu?t s?c! B?n dã h?c r?t nhi?u!"}
            </p>
            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Streak", value: `${streak.count} ngày`, icon: "ri-fire-line", color: "#fb923c" },
                { label: "TOPIK I", value: topik1Attempts > 0 ? `${topik1Best}d` : "Chua thi", icon: "ri-file-list-2-line", color: "#38bdf8" },
                { label: "TOPIK II", value: topik2Attempts > 0 ? `${topik2Best}d` : "Chua thi", icon: "ri-file-list-3-line", color: "#a78bfa" },
                { label: "T? thu?c", value: vocabDone, icon: "ri-translate-2", color: "#34d399" },
              ].map(s => (
                <div key={s.label} className="bg-app-surface/50 rounded-xl p-3 text-center">
                  <i className={`${s.icon} text-lg mb-1 block`} style={{ color: s.color }}></i>
                  <p className="text-white font-bold text-sm">{s.value}</p>
                  <p className="text-app-text-muted text-[10px]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {moduleCards.map(m => (
          <ModuleCard key={m.title} {...m} onNavigate={navigate} />
        ))}
      </div>

      {/* TOPIK results */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { title: "TOPIK I", icon: "ri-file-list-2-line", color: "#38bdf8", best: topik1Best, max: topik1MaxScore, attempts: topik1Attempts, path: "/topik-test", passScore: 80 },
          { title: "TOPIK II", icon: "ri-file-list-3-line", color: "#a78bfa", best: topik2Best, max: topik2MaxScore, attempts: topik2Attempts, path: "/topik2-test", passScore: 120 },
        ].map(t => (
          <div key={t.title} className="bg-app-bg border border-app-border rounded-2xl p-5 cursor-pointer hover:border-app-border transition-all" onClick={() => navigate(t.path)}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${t.color}15` }}>
                <i className={`${t.icon} text-lg`} style={{ color: t.color }}></i>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{t.title}</p>
                <p className="text-app-text-muted text-xs">{t.attempts} l?n thi</p>
              </div>
              <i className="ri-arrow-right-line text-app-text-muted ml-auto"></i>
            </div>
            {t.attempts > 0 ? (
              <>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-4xl font-black" style={{ color: t.color }}>{t.best}</span>
                  <span className="text-app-text-muted text-sm mb-1">/ {t.max} di?m</span>
                  {t.best >= t.passScore && (
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-app-accent-success">Ð?T</span>
                  )}
                </div>
                <MiniBar value={t.best} max={t.max} color={t.color} />
                <p className="text-app-text-muted text-[10px] mt-1.5">Ði?m d?t: ={t.passScore}</p>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-app-text-muted text-sm mb-2">Chua thi l?n nào</p>
                <button className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors" style={{ backgroundColor: `${t.color}15`, color: t.color }}>
                  Thi th? ngay
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Activity heatmap */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-semibold text-sm">L?ch h?c t?p (28 ngày)</p>
            <p className="text-app-text-muted text-xs">Streak hi?n t?i: {streak.count} ngày liên ti?p</p>
          </div>
          <div className="flex items-center gap-1.5 bg-app-accent-primary/8 border border-app-accent-primary/15 rounded-xl px-3 py-1.5">
            <i className="ri-fire-line text-app-accent-primary text-sm"></i>
            <span className="text-app-accent-primary text-xs font-bold">{streak.count} ngày</span>
          </div>
        </div>
        <ActivityStreak activityDays={activityDays} />
      </div>

      {/* Suggestions */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <p className="text-white/50 text-sm font-semibold mb-4">G?i ý h?c hôm nay</p>
        <div className="space-y-2">
          {[
            grammarDone < grammarTotal && { icon: "ri-book-2-line", color: "app-accent-primary", text: `Còn ${grammarTotal - grammarDone} bài t?p ng? pháp chua làm`, path: "/grammar" },
            vocabDone < vocabTotal && { icon: "ri-translate-2", color: "#34d399", text: `Còn ${vocabTotal - vocabDone} t? v?ng chua thu?c`, path: "/vocabulary" },
            hangulDone < hangulTotal && { icon: "ri-edit-2-line", color: "#a78bfa", text: `Còn ${hangulTotal - hangulDone} ký t? Hangul chua thành th?o`, path: "/hangul-write" },
            topik1Attempts === 0 && { icon: "ri-file-list-2-line", color: "#38bdf8", text: "Th? s?c v?i d? thi TOPIK I l?n d?u!", path: "/topik-test" },
            topik2Attempts === 0 && { icon: "ri-file-list-3-line", color: "#a78bfa", text: "Th? s?c v?i d? thi TOPIK II!", path: "/topik2-test" },
          ].filter(Boolean).slice(0, 4).map((s, i) => s && (
            <button key={i} onClick={() => navigate(s.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-app-surface/50 border border-app-border hover:border-app-border cursor-pointer transition-all text-left">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
              </div>
              <p className="text-white/50 text-sm flex-1">{s.text}</p>
              <i className="ri-arrow-right-line text-app-text-muted flex-shrink-0"></i>
            </button>
          ))}
          {grammarDone >= grammarTotal && vocabDone >= vocabTotal && hangulDone >= hangulTotal && (
            <div className="text-center py-6 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
              <i className="ri-trophy-fill text-app-accent-success text-2xl mb-2 block"></i>
              <p className="text-app-accent-success font-semibold">B?n dã hoàn thành t?t c? n?i dung hi?n có!</p>
              <p className="text-app-text-muted text-xs mt-1">Ti?p t?c ôn luy?n và thi th? TOPIK nhé</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}



