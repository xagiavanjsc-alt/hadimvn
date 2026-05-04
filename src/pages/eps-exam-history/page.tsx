import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";

// --- Types ----------------------------------------------------------------
interface ExamRecord {
  id: string;
  date: string;
  score: number;
  total: number;
  correct: number;
  duration: number; // seconds
  mode: "full" | "topic" | "quick";
  topic?: string;
}

// --- Mock data ------------------------------------------------------------
const MOCK_HISTORY: ExamRecord[] = [
  { id: "e1", date: "2026-04-15", score: 165, total: 40, correct: 33, duration: 2580, mode: "full" },
  { id: "e2", date: "2026-04-13", score: 150, total: 40, correct: 30, duration: 2820, mode: "full" },
  { id: "e3", date: "2026-04-11", score: 140, total: 40, correct: 28, duration: 3100, mode: "full" },
  { id: "e4", date: "2026-04-10", score: 125, total: 40, correct: 25, duration: 3300, mode: "full" },
  { id: "e5", date: "2026-04-08", score: 130, total: 40, correct: 26, duration: 3200, mode: "full" },
  { id: "e6", date: "2026-04-06", score: 110, total: 40, correct: 22, duration: 3600, mode: "full" },
  { id: "e7", date: "2026-04-04", score: 100, total: 40, correct: 20, duration: 3900, mode: "full" },
  { id: "e8", date: "2026-04-02", score: 90, total: 40, correct: 18, duration: 4100, mode: "full" },
  { id: "e9", date: "2026-03-30", score: 85, total: 40, correct: 17, duration: 4200, mode: "full" },
  { id: "e10", date: "2026-03-28", score: 75, total: 40, correct: 15, duration: 4500, mode: "full" },
  { id: "e11", date: "2026-04-14", score: 80, total: 20, correct: 16, duration: 1200, mode: "topic", topic: "Lao d?ng" },
  { id: "e12", date: "2026-04-12", score: 70, total: 20, correct: 14, duration: 1400, mode: "topic", topic: "An toàn lao d?ng" },
  { id: "e13", date: "2026-04-09", score: 90, total: 20, correct: 18, duration: 1100, mode: "topic", topic: "B?o hi?m" },
];

// --- Helpers --------------------------------------------------------------
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getScoreColor(score: number, total: number): string {
  const pct = (score / (total * 5)) * 100;
  if (pct >= 80) return "#34d399";
  if (pct >= 60) return "app-accent-primary";
  if (pct >= 40) return "#fb923c";
  return "#f87171";
}

function getScoreLabel(score: number, total: number): string {
  const pct = (score / (total * 5)) * 100;
  if (pct >= 80) return "Xu?t s?c";
  if (pct >= 60) return "Ð?t";
  if (pct >= 40) return "C?n c? g?ng";
  return "Chua d?t";
}

// --- Mini bar chart -------------------------------------------------------
function ProgressChart({ records }: { records: ExamRecord[] }) {
  const fullExams = records.filter(r => r.mode === "full").slice(0, 10).reverse();
  if (fullExams.length < 2) return null;

  const maxScore = 200;
  const passLine = 80; // 80/200

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white font-semibold text-sm">Bi?u d? ti?n b?</p>
          <p className="text-white/35 text-xs mt-0.5">{fullExams.length} l?n thi th? g?n nh?t</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-app-accent-primary/50 border-dashed border-t border-app-accent-primary/50"></div>
            <span className="text-app-text-muted">Ði?m d?u (80)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-sm bg-app-accent-primary/60"></div>
            <span className="text-app-text-muted">Ði?m thi</span>
          </div>
        </div>
      </div>

      <div className="relative h-40">
        {/* Pass line */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-app-accent-primary/25 z-10"
          style={{ bottom: `${(passLine / maxScore) * 100}%` }}
        >
          <span className="absolute right-0 -top-3 text-app-accent-primary/40 text-[9px]">80</span>
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end gap-1.5">
          {fullExams.map((exam, i) => {
            const heightPct = (exam.score / maxScore) * 100;
            const color = getScoreColor(exam.score, exam.total);
            const isLatest = i === fullExams.length - 1;
            return (
              <div key={exam.id} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full rounded-t-md transition-all duration-500 relative"
                  style={{ height: `${heightPct}%`, backgroundColor: isLatest ? color : `${color}60` }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1d27] border border-app-border rounded-lg px-2 py-1 text-[10px] text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                    {exam.score}/200 · {formatDate(exam.date)}
                  </div>
                </div>
                <span className="text-app-text-muted text-[8px]">{formatDate(exam.date).slice(0, 5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trend */}
      {fullExams.length >= 2 && (() => {
        const first = fullExams[0].score;
        const last = fullExams[fullExams.length - 1].score;
        const diff = last - first;
        return (
          <div className="mt-3 pt-3 border-t border-app-border flex items-center gap-2">
            <div className={`w-5 h-5 flex items-center justify-center rounded-lg ${diff >= 0 ? "bg-[#34d399]/10" : "bg-[#f87171]/10"}`}>
              <i className={`${diff >= 0 ? "ri-arrow-up-line text-[#34d399]" : "ri-arrow-down-line text-[#f87171]"} text-xs`}></i>
            </div>
            <p className="text-app-text-secondary text-xs">
              T? l?n d?u d?n nay:{" "}
              <span className={`font-bold ${diff >= 0 ? "text-[#34d399]" : "text-[#f87171]"}`}>
                {diff >= 0 ? "+" : ""}{diff} di?m
              </span>
              {" "}({first} ? {last})
            </p>
          </div>
        );
      })()}
    </div>
  );
}

// --- Stat Card ------------------------------------------------------------
function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5 flex items-center gap-4">
      <div className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
        <i className={`${icon} text-lg`} style={{ color }}></i>
      </div>
      <div>
        <p className="text-white font-bold text-xl leading-none">{value}</p>
        <p className="text-white/45 text-xs mt-1">{label}</p>
        {sub && <p className="text-app-text-muted text-[10px] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// --- Exam Row -------------------------------------------------------------
function ExamRow({ exam, index, isSelected, onClick }: {
  exam: ExamRecord; index: number; isSelected: boolean; onClick: () => void;
}) {
  const color = getScoreColor(exam.score, exam.total);
  const label = getScoreLabel(exam.score, exam.total);
  const accuracy = Math.round((exam.correct / exam.total) * 100);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected ? "border-white/20 bg-app-card/50" : "border-app-border bg-app-bg hover:bg-app-surface/50"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Index */}
        <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
          <span className="text-xs font-bold" style={{ color }}>#{index + 1}</span>
        </div>

        {/* Date + mode */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-white/75 text-sm font-medium">{formatDate(exam.date)}</p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
              exam.mode === "full" ? "bg-app-accent-primary/10 text-app-accent-primary" :
              exam.mode === "topic" ? "bg-[#a78bfa]/10 text-[#a78bfa]" :
              "bg-[#38bdf8]/10 text-[#38bdf8]"
            }`}>
              {exam.mode === "full" ? "Thi th? 40 câu" : exam.mode === "topic" ? `Ch? d?: ${exam.topic}` : "Ôn nhanh"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-app-text-muted">
            <span><i className="ri-checkbox-circle-line mr-1"></i>{exam.correct}/{exam.total} câu dúng</span>
            <span><i className="ri-time-line mr-1"></i>{formatDuration(exam.duration)}</span>
          </div>
        </div>

        {/* Score */}
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-xl leading-none" style={{ color }}>{exam.score}</p>
          <p className="text-app-text-muted text-[10px] mt-0.5">/200 di?m</p>
        </div>

        {/* Accuracy bar */}
        <div className="w-20 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px]" style={{ color }}>{label}</span>
            <span className="text-app-text-muted text-[9px]">{accuracy}%</span>
          </div>
          <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${accuracy}%`, backgroundColor: color }}></div>
          </div>
        </div>
      </div>
    </button>
  );
}

// --- Detail Panel ---------------------------------------------------------
function ExamDetail({ exam, allExams }: { exam: ExamRecord; allExams: ExamRecord[] }) {
  const color = getScoreColor(exam.score, exam.total);
  const accuracy = Math.round((exam.correct / exam.total) * 100);
  const wrong = exam.total - exam.correct;

  // Compare with previous exam of same mode
  const sameMode = allExams.filter(e => e.mode === exam.mode && e.id !== exam.id);
  const prevExam = sameMode.find(e => e.date < exam.date);
  const scoreDiff = prevExam ? exam.score - prevExam.score : null;

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white font-bold text-base">{formatDate(exam.date)}</p>
          <p className="text-white/35 text-xs mt-0.5">
            {exam.mode === "full" ? "Thi th? 40 câu" : exam.mode === "topic" ? `Ch? d?: ${exam.topic}` : "Ôn nhanh"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-3xl" style={{ color }}>{exam.score}</p>
          <p className="text-app-text-muted text-xs">/200 di?m</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: "ri-checkbox-circle-line", label: "Câu dúng", value: exam.correct, color: "#34d399" },
          { icon: "ri-close-circle-line", label: "Câu sai", value: wrong, color: "#f87171" },
          { icon: "ri-percent-line", label: "Ð? chính xác", value: `${accuracy}%`, color },
          { icon: "ri-time-line", label: "Th?i gian", value: formatDuration(exam.duration), color: "#38bdf8" },
        ].map(s => (
          <div key={s.label} className="bg-app-surface/50 rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
              <p className="text-app-text-muted text-[10px]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Compare with previous */}
      {prevExam && scoreDiff !== null && (
        <div className={`rounded-xl p-3 border ${scoreDiff >= 0 ? "bg-[#34d399]/5 border-[#34d399]/15" : "bg-[#f87171]/5 border-[#f87171]/15"}`}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className={`${scoreDiff >= 0 ? "ri-arrow-up-line text-[#34d399]" : "ri-arrow-down-line text-[#f87171]"} text-sm`}></i>
            </div>
            <p className="text-white/50 text-xs">
              So v?i l?n tru?c ({formatDate(prevExam.date)}):
              <span className={`font-bold ml-1 ${scoreDiff >= 0 ? "text-[#34d399]" : "text-[#f87171]"}`}>
                {scoreDiff >= 0 ? "+" : ""}{scoreDiff} di?m
              </span>
              <span className="text-app-text-muted ml-1">({prevExam.score} ? {exam.score})</span>
            </p>
          </div>
        </div>
      )}

      {/* Pass/fail */}
      <div className={`rounded-xl p-3 flex items-center gap-3 ${exam.score >= 80 ? "bg-[#34d399]/8 border border-[#34d399]/15" : "bg-[#f87171]/8 border border-[#f87171]/15"}`}>
        <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: exam.score >= 80 ? "#34d39920" : "#f8717120" }}>
          <i className={`${exam.score >= 80 ? "ri-checkbox-circle-fill text-[#34d399]" : "ri-close-circle-fill text-[#f87171]"} text-base`}></i>
        </div>
        <div>
          <p className={`font-bold text-sm ${exam.score >= 80 ? "text-[#34d399]" : "text-[#f87171]"}`}>
            {exam.score >= 80 ? "Ð?T — Ð? di?m thi EPS-TOPIK" : "CHUA Ð?T — C?n ít nh?t 80 di?m"}
          </p>
          <p className="text-app-text-muted text-xs mt-0.5">
            {exam.score >= 80
              ? `Vu?t ngu?ng d?u ${exam.score - 80} di?m`
              : `Còn thi?u ${80 - exam.score} di?m d? d?t ngu?ng d?u`}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ------------------------------------------------------------
export default function EpsExamHistoryPage() {
  const navigate = useNavigate();
  const [savedHistory] = useLocalStorage<ExamRecord[]>("kts_eps_exam_history", []);
  const [filterMode, setFilterMode] = useState<"all" | "full" | "topic" | "quick">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  // Merge saved + mock
  const allHistory = useMemo(() => {
    const merged = [...savedHistory, ...MOCK_HISTORY];
    const seen = new Set<string>();
    return merged.filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }, [savedHistory]);

  const filtered = useMemo(() => {
    let list = filterMode === "all" ? allHistory : allHistory.filter(e => e.mode === filterMode);
    switch (sortOrder) {
      case "newest": return [...list].sort((a, b) => b.date.localeCompare(a.date));
      case "oldest": return [...list].sort((a, b) => a.date.localeCompare(b.date));
      case "highest": return [...list].sort((a, b) => b.score - a.score);
      case "lowest": return [...list].sort((a, b) => a.score - b.score);
      default: return list;
    }
  }, [allHistory, filterMode, sortOrder]);

  const selectedExam = allHistory.find(e => e.id === selectedId);

  // Stats
  const fullExams = allHistory.filter(e => e.mode === "full");
  const bestScore = fullExams.length > 0 ? Math.max(...fullExams.map(e => e.score)) : 0;
  const avgScore = fullExams.length > 0 ? Math.round(fullExams.reduce((s, e) => s + e.score, 0) / fullExams.length) : 0;
  const passCount = fullExams.filter(e => e.score >= 80).length;
  const latestScore = fullExams.sort((a, b) => b.date.localeCompare(a.date))[0]?.score || 0;

  return (
    <DashboardLayout
      title="L?ch s? thi th? EPS"
      subtitle="Xem l?i t?ng l?n thi, so sánh di?m qua các l?n và theo dõi ti?n b?"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon="ri-file-list-3-line" label="T?ng l?n thi" value={allHistory.length} sub={`${fullExams.length} l?n thi th? 40 câu`} color="app-accent-primary" />
        <StatCard icon="ri-trophy-line" label="Ði?m cao nh?t" value={bestScore} sub="trên 200 di?m" color="#34d399" />
        <StatCard icon="ri-bar-chart-line" label="Ði?m trung bình" value={avgScore} sub="thi th? 40 câu" color="#38bdf8" />
        <StatCard icon="ri-checkbox-circle-line" label="L?n d?t di?m d?u" value={passCount} sub={`/ ${fullExams.length} l?n thi`} color="#a78bfa" />
      </div>

      {/* Progress chart */}
      <div className="mb-6">
        <ProgressChart records={allHistory} />
      </div>

      {/* Filters + sort */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center bg-app-card/50 rounded-xl p-1">
          {(["all", "full", "topic", "quick"] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterMode === mode ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/70"
              }`}
            >
              {mode === "all" ? "T?t c?" : mode === "full" ? "Thi th? 40 câu" : mode === "topic" ? "Theo ch? d?" : "Ôn nhanh"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-app-text-muted text-xs">S?p x?p:</span>
          {(["newest", "oldest", "highest", "lowest"] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortOrder(s)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                sortOrder === s ? "bg-app-accent-primary/15 text-app-accent-primary" : "text-app-text-muted hover:text-white/60"
              }`}
            >
              {s === "newest" ? "M?i nh?t" : s === "oldest" ? "Cu nh?t" : s === "highest" ? "Ði?m cao" : "Ði?m th?p"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={`grid gap-6 ${selectedExam ? "grid-cols-[1fr_320px]" : "grid-cols-1"}`}>
        {/* List */}
        <div>
          {filtered.length === 0 ? (
            <div className="bg-app-bg border border-app-border rounded-2xl p-12 text-center">
              <i className="ri-file-list-3-line text-white/10 text-5xl mb-4 block"></i>
              <p className="text-app-text-secondary text-base font-medium mb-2">Chua có l?ch s? thi</p>
              <p className="text-app-text-muted text-sm mb-6">Hãy làm bài thi th? EPS d? luu l?ch s?</p>
              <button
                onClick={() => navigate("/eps-exam")}
                className="px-6 py-3 bg-app-accent-primary text-app-bg font-bold text-sm rounded-xl cursor-pointer whitespace-nowrap"
              >
                <i className="ri-timer-line mr-2"></i>Thi th? EPS ngay
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((exam, i) => (
                <ExamRow
                  key={exam.id}
                  exam={exam}
                  index={i}
                  isSelected={selectedId === exam.id}
                  onClick={() => setSelectedId(selectedId === exam.id ? null : exam.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedExam && (
          <div className="sticky top-4 h-fit">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/50 text-xs font-semibold tracking-normal">Chi ti?t l?n thi</p>
              <button
                onClick={() => setSelectedId(null)}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-app-card/70 text-app-text-muted hover:text-white/60 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-sm"></i>
              </button>
            </div>
            <ExamDetail exam={selectedExam} allExams={allHistory} />

            {/* Actions */}
            <div className="mt-3 space-y-2">
              <button
                onClick={() => navigate("/eps-exam")}
                className="w-full py-3 bg-app-accent-primary text-app-bg font-bold text-sm rounded-xl cursor-pointer whitespace-nowrap"
              >
                <i className="ri-refresh-line mr-2"></i>Thi l?i ngay
              </button>
              <button
                onClick={() => navigate("/eps-weakness-analysis")}
                className="w-full py-3 bg-app-card/50 hover:bg-white/8 text-white/60 text-sm rounded-xl cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-bar-chart-2-line mr-2"></i>Phân tích di?m y?u
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Latest score highlight */}
      {latestScore > 0 && (
        <div className="mt-6 bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-app-accent-primary/10">
                <i className="ri-star-line text-app-accent-primary text-lg"></i>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Ði?m thi g?n nh?t</p>
                <p className="text-white/35 text-xs mt-0.5">
                  {latestScore >= 80 ? "B?n dã d?t di?m d?u EPS-TOPIK!" : `Còn thi?u ${80 - latestScore} di?m d? d?t ngu?ng d?u`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-3xl" style={{ color: getScoreColor(latestScore, 40) }}>{latestScore}</p>
              <p className="text-app-text-muted text-xs">/200 di?m</p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

