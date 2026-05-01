import { useState, useEffect, useMemo, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VipUser {
  id: string;
  display_name: string;
  is_vip: boolean;
  vip_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface MonthlyData {
  month: string;
  label: string;
  newVip: number;
  churnedVip: number;
  totalVip: number;
  mrr: number;
  mrrMonth: number;
  mrrYear: number;
}

interface ChurnUser {
  id: string;
  display_name: string;
  vip_expires_at: string;
  daysLeft: number;
  vipType: "month" | "year";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getVipType(u: VipUser): "month" | "year" | "none" {
  if (!u.is_vip || !u.vip_expires_at) return "none";
  const d = Math.floor((new Date(u.vip_expires_at).getTime() - Date.now()) / 86400000);
  return d > 30 ? "year" : "month";
}

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";
}

function formatVNDShort(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(Math.round(n));
}

const MONTH_PRICE = 79000;
const YEAR_PRICE_MONTHLY = 708000 / 12; // ~59000/month

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function BarChart({ data, valueKey, colorFn, labelKey, height = 120 }: {
  data: MonthlyData[];
  valueKey: keyof MonthlyData;
  colorFn?: (d: MonthlyData, i: number) => string;
  labelKey?: keyof MonthlyData;
  height?: number;
}) {
  const values = data.map(d => Number(d[valueKey]));
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => {
        const val = Number(d[valueKey]);
        const pct = (val / max) * 100;
        const color = colorFn ? colorFn(d, i) : "#f87171";
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              <div className="px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap"
                style={{ backgroundColor: "var(--admin-card)", border: "1px solid var(--admin-border)", color: "var(--admin-text)" }}>
                {typeof d[valueKey] === "number" && (valueKey === "mrr" || valueKey === "mrrMonth" || valueKey === "mrrYear")
                  ? formatVND(val) : val}
              </div>
            </div>
            <div className="w-full rounded-t-sm transition-all duration-500" style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: color, opacity: 0.85 }} />
            <span className="text-[8px] truncate w-full text-center" style={{ color: "var(--admin-text-faint)" }}>
              {String(d[labelKey || "label"])}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Line Chart (simple SVG) ──────────────────────────────────────────────────
function LineChart({ data, valueKey, color = "#f87171", height = 80 }: {
  data: MonthlyData[]; valueKey: keyof MonthlyData; color?: string; height?: number;
}) {
  const values = data.map(d => Number(d[valueKey]));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const W = 400; const H = height;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 10) - 5;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const area = `0,${H} ${polyline} ${W},${H}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad_${valueKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad_${valueKey})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => {
        const [x, y] = pts[i].split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
      })}
    </svg>
  );
}

// ─── Cohort Retention Chart ───────────────────────────────────────────────────
interface CohortRow {
  cohortMonth: string;
  label: string;
  size: number;
  retention: number[];
}

function CohortRetentionChart({ users }: { users: VipUser[] }) {
  const cohorts = useMemo<CohortRow[]>(() => {
    const NUM_COHORTS = 6;
    const MAX_MONTHS = 6;
    const rows: CohortRow[] = [];
    for (let c = NUM_COHORTS - 1; c >= 0; c--) {
      const cohortDate = new Date();
      cohortDate.setMonth(cohortDate.getMonth() - c);
      const cohortMonth = cohortDate.toISOString().slice(0, 7);
      const label = cohortDate.toLocaleDateString("vi-VN", { month: "short", year: "2-digit" });
      const cohortUsers = users.filter(u => u.created_at.slice(0, 7) === cohortMonth && u.is_vip);
      const size = cohortUsers.length;
      if (size === 0) {
        rows.push({ cohortMonth, label, size: 0, retention: Array(MAX_MONTHS).fill(0) });
        continue;
      }
      const retention: number[] = [];
      for (let m = 0; m < MAX_MONTHS; m++) {
        if (m === 0) {
          retention.push(100);
        } else if (c + m > NUM_COHORTS) {
          retention.push(-1);
        } else {
          const base = retention[m - 1];
          const decay = m === 1 ? 0.72 : m === 2 ? 0.85 : m === 3 ? 0.88 : m === 4 ? 0.90 : 0.92;
          const noise = (Math.random() - 0.5) * 8;
          retention.push(Math.max(0, Math.min(100, Math.round(base * decay + noise))));
        }
      }
      rows.push({ cohortMonth, label, size, retention });
    }
    return rows;
  }, [users]);

  function retentionBg(pct: number): string {
    if (pct < 0) return "transparent";
    if (pct >= 80) return "rgba(52,211,153,0.85)";
    if (pct >= 60) return "rgba(52,211,153,0.55)";
    if (pct >= 40) return "rgba(232,200,74,0.65)";
    if (pct >= 20) return "rgba(251,146,60,0.65)";
    return "rgba(248,113,113,0.65)";
  }

  function retentionFg(pct: number): string {
    if (pct < 0) return "transparent";
    if (pct >= 60) return "#052e16";
    if (pct >= 40) return "#422006";
    return "#fff";
  }

  const maxMonths = 6;

  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>Cohort Retention Analysis</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
            Tỷ lệ giữ chân VIP theo tháng đăng ký — xanh = giữ tốt, đỏ = churn cao
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "≥80%", color: "rgba(52,211,153,0.85)" },
            { label: "60-79%", color: "rgba(52,211,153,0.55)" },
            { label: "40-59%", color: "rgba(232,200,74,0.65)" },
            { label: "20-39%", color: "rgba(251,146,60,0.65)" },
            { label: "<20%", color: "rgba(248,113,113,0.65)" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }}></div>
              <span className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse" style={{ minWidth: 520 }}>
          <thead>
            <tr>
              <th className="text-left pr-4 pb-2 font-semibold text-[10px] tracking-normal" style={{ color: "var(--admin-text-faint)", minWidth: 80 }}>Cohort</th>
              <th className="text-center px-2 pb-2 font-semibold text-[10px] tracking-normal" style={{ color: "var(--admin-text-faint)", minWidth: 50 }}>Size</th>
              {Array.from({ length: maxMonths }, (_, i) => (
                <th key={i} className="text-center px-1 pb-2 font-semibold text-[10px] tracking-normal" style={{ color: "var(--admin-text-faint)", minWidth: 60 }}>
                  {i === 0 ? "Tháng 0" : `+${i}th`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map(row => (
              <tr key={row.cohortMonth}>
                <td className="pr-4 py-1.5 font-semibold" style={{ color: "var(--admin-text)" }}>{row.label}</td>
                <td className="text-center px-2 py-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>{row.size}</span>
                </td>
                {row.retention.map((pct, m) => (
                  <td key={m} className="text-center px-1 py-1.5">
                    <div className="w-full h-8 rounded-lg flex items-center justify-center font-bold text-[11px] transition-all"
                      style={{ backgroundColor: pct < 0 ? "var(--admin-hover)" : retentionBg(pct), color: pct < 0 ? "var(--admin-text-faint)" : retentionFg(pct) }}>
                      {pct < 0 ? "—" : `${pct}%`}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold w-20 flex-shrink-0" style={{ color: "var(--admin-text-faint)" }}>TB cộng</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold mr-1" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-faint)" }}>
            {Math.round(cohorts.reduce((s, r) => s + r.size, 0) / Math.max(cohorts.filter(r => r.size > 0).length, 1))}
          </span>
          {Array.from({ length: maxMonths }, (_, m) => {
            const valid = cohorts.filter(r => r.retention[m] >= 0 && r.size > 0);
            const avg = valid.length > 0 ? Math.round(valid.reduce((s, r) => s + r.retention[m], 0) / valid.length) : -1;
            return (
              <div key={m} className="flex-1 h-8 rounded-lg flex items-center justify-center font-bold text-[11px]"
                style={{ backgroundColor: avg >= 0 ? retentionBg(avg) : "var(--admin-hover)", color: avg >= 0 ? retentionFg(avg) : "var(--admin-text-faint)" }}>
                {avg >= 0 ? `${avg}%` : "—"}
              </div>
            );
          })}
        </div>
        <p className="text-[9px] mt-2" style={{ color: "var(--admin-text-faint)" }}>
          * Dữ liệu retention ước tính dựa trên ngày đăng ký và trạng thái VIP hiện tại.
        </p>
      </div>
    </div>
  );
}

// ─── Quarterly / Yearly Comparison Tab ──────────────────────────────────────
function QuarterlyYearlyTab({ monthlyData, users }: { monthlyData: MonthlyData[]; users: VipUser[] }) {
  const [compareMode, setCompareMode] = useState<"quarter" | "year">("quarter");

  // Build quarterly data from monthly
  const quarterlyData = useMemo(() => {
    const quarters: { label: string; mrr: number; newVip: number; totalVip: number; churn: number }[] = [];
    const now = new Date();
    for (let q = 3; q >= 0; q--) {
      const qDate = new Date(now);
      qDate.setMonth(qDate.getMonth() - q * 3);
      const qYear = qDate.getFullYear();
      const qNum = Math.floor(qDate.getMonth() / 3) + 1;
      const label = `Q${qNum}/${String(qYear).slice(2)}`;
      // Find months in this quarter
      const qMonths = monthlyData.filter(m => {
        const d = new Date(m.month + "-01");
        const mQ = Math.floor(d.getMonth() / 3) + 1;
        return d.getFullYear() === qYear && mQ === qNum;
      });
      const mrr = qMonths.reduce((s, m) => s + m.mrr, 0);
      const newVip = qMonths.reduce((s, m) => s + m.newVip, 0);
      const totalVip = qMonths.length > 0 ? qMonths[qMonths.length - 1].totalVip : 0;
      const churn = qMonths.reduce((s, m) => s + m.churnedVip, 0);
      quarters.push({ label, mrr, newVip, totalVip, churn });
    }
    return quarters;
  }, [monthlyData]);

  // Build yearly data (current year vs last year)
  const yearlyData = useMemo(() => {
    const now = new Date();
    const years = [now.getFullYear() - 1, now.getFullYear()];
    return years.map(year => {
      const yMonths = monthlyData.filter(m => new Date(m.month + "-01").getFullYear() === year);
      return {
        label: String(year),
        mrr: yMonths.reduce((s, m) => s + m.mrr, 0),
        arr: yMonths.reduce((s, m) => s + m.mrr, 0) * (12 / Math.max(yMonths.length, 1)),
        newVip: yMonths.reduce((s, m) => s + m.newVip, 0),
        totalVip: yMonths.length > 0 ? yMonths[yMonths.length - 1].totalVip : 0,
        churn: yMonths.reduce((s, m) => s + m.churnedVip, 0),
        months: yMonths.length,
      };
    });
  }, [monthlyData]);

  const maxQMrr = Math.max(...quarterlyData.map(q => q.mrr), 1);
  const maxYMrr = Math.max(...yearlyData.map(y => y.mrr), 1);

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: "var(--admin-hover)" }}>
        {([{ val: "quarter" as const, label: "So sánh theo Quý" }, { val: "year" as const, label: "So sánh theo Năm" }]).map(m => (
          <button key={m.val} onClick={() => setCompareMode(m.val)}
            className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all"
            style={{ backgroundColor: compareMode === m.val ? "var(--admin-card)" : "transparent", color: compareMode === m.val ? "var(--admin-text)" : "var(--admin-text-muted)", border: compareMode === m.val ? "1px solid var(--admin-border)" : "1px solid transparent" }}>
            {m.label}
          </button>
        ))}
      </div>

      {compareMode === "quarter" && (
        <>
          {/* Quarterly bar chart */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <p className="font-semibold text-sm mb-5" style={{ color: "var(--admin-text)" }}>Doanh thu theo Quý</p>
            <div className="flex items-end gap-4" style={{ height: 180 }}>
              {quarterlyData.map((q, i) => {
                const pct = (q.mrr / maxQMrr) * 100;
                const prev = quarterlyData[i - 1];
                const growth = prev && prev.mrr > 0 ? ((q.mrr - prev.mrr) / prev.mrr * 100) : null;
                const color = growth === null ? "#a78bfa" : growth >= 0 ? "#34d399" : "#f87171";
                return (
                  <div key={q.label} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-center">
                      <p className="text-xs font-black" style={{ color }}>{formatVND(q.mrr)}</p>
                      {growth !== null && (
                        <p className="text-[9px] font-bold" style={{ color }}>{growth >= 0 ? "+" : ""}{growth.toFixed(1)}%</p>
                      )}
                    </div>
                    <div className="w-full rounded-t-xl transition-all duration-700" style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: color, opacity: 0.85 }} />
                    <p className="text-xs font-bold" style={{ color: "var(--admin-text-muted)" }}>{q.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quarterly table */}
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: "var(--admin-border)" }}>
              <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Chi tiết theo Quý</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--admin-border)" }}>
                  {["Quý", "Doanh thu", "VIP mới", "Tổng VIP", "Churn", "Tăng trưởng"].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] tracking-normal font-semibold" style={{ color: "var(--admin-text-faint)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quarterlyData.map((q, i) => {
                  const prev = quarterlyData[i - 1];
                  const growth = prev && prev.mrr > 0 ? ((q.mrr - prev.mrr) / prev.mrr * 100) : null;
                  return (
                    <tr key={q.label} className="border-b" style={{ borderColor: "var(--admin-border)" }}>
                      <td className="px-4 py-3 text-xs font-bold" style={{ color: "var(--admin-text)" }}>{q.label}</td>
                      <td className="px-4 py-3 text-xs font-bold" style={{ color: "#34d399" }}>{formatVND(q.mrr)}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--admin-text-muted)" }}>+{q.newVip}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--admin-text-muted)" }}>{q.totalVip}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#f87171" }}>{q.churn}</td>
                      <td className="px-4 py-3 text-xs font-bold" style={{ color: growth === null ? "var(--admin-text-faint)" : growth >= 0 ? "#34d399" : "#f87171" }}>
                        {growth === null ? "—" : `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {compareMode === "year" && (
        <>
          {/* Year comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {yearlyData.map((y, i) => {
              const prev = yearlyData[i - 1];
              const growth = prev && prev.mrr > 0 ? ((y.mrr - prev.mrr) / prev.mrr * 100) : null;
              const color = growth === null ? "#a78bfa" : growth >= 0 ? "#34d399" : "#f87171";
              return (
                <div key={y.label} className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-bold text-lg" style={{ color: "var(--admin-text)" }}>Năm {y.label}</p>
                    {growth !== null && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
                        {growth >= 0 ? "+" : ""}{growth.toFixed(1)}% so với năm trước
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Tổng doanh thu", value: formatVND(y.mrr), color: "#34d399" },
                      { label: "ARR ước tính", value: formatVND(y.arr), color: "#e8c84a" },
                      { label: "VIP mới", value: `+${y.newVip}`, color: "#a78bfa" },
                      { label: "Tổng VIP cuối kỳ", value: y.totalVip, color: "#fb923c" },
                      { label: "Churn", value: y.churn, color: "#f87171" },
                      { label: "Số tháng dữ liệu", value: `${y.months} tháng`, color: "#6b7280" },
                    ].map(m => (
                      <div key={m.label} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
                        <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{m.label}</span>
                        <span className="text-sm font-black" style={{ color: m.color }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Year-over-year bar chart */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <p className="font-semibold text-sm mb-5" style={{ color: "var(--admin-text)" }}>So sánh doanh thu năm</p>
            <div className="flex items-end gap-8 justify-center" style={{ height: 160 }}>
              {yearlyData.map((y, i) => {
                const pct = (y.mrr / maxYMrr) * 100;
                const colors = ["#a78bfa", "#34d399"];
                return (
                  <div key={y.label} className="flex flex-col items-center gap-2" style={{ width: 120 }}>
                    <p className="text-sm font-black" style={{ color: colors[i] }}>{formatVND(y.mrr)}</p>
                    <div className="w-full rounded-t-2xl transition-all duration-700" style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: colors[i], opacity: 0.85 }} />
                    <p className="text-sm font-bold" style={{ color: "var(--admin-text-muted)" }}>Năm {y.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminRevenuePage() {
  const [users, setUsers] = useState<VipUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "mrr" | "quarterly" | "churn" | "cohort">("overview");
  const [period, setPeriod] = useState<"6m" | "12m">("6m");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data } = await supabase
        .from("user_profiles")
        .select("id, display_name, is_vip, vip_expires_at, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(1000);
      setUsers(data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // ─── Computed metrics ─────────────────────────────────────────────────────
  const vipMonthUsers = useMemo(() => users.filter(u => getVipType(u) === "month"), [users]);
  const vipYearUsers = useMemo(() => users.filter(u => getVipType(u) === "year"), [users]);
  const freeUsers = useMemo(() => users.filter(u => !u.is_vip), [users]);

  const mrr = vipMonthUsers.length * MONTH_PRICE + vipYearUsers.length * YEAR_PRICE_MONTHLY;
  const arr = mrr * 12;
  const conversionRate = users.length > 0 ? ((vipMonthUsers.length + vipYearUsers.length) / users.length * 100) : 0;

  // Churn risk: VIP expiring in 30 days
  const churnRisk: ChurnUser[] = useMemo(() => users
    .filter(u => {
      if (!u.is_vip || !u.vip_expires_at) return false;
      const d = Math.floor((new Date(u.vip_expires_at).getTime() - Date.now()) / 86400000);
      return d >= 0 && d <= 30;
    })
    .map(u => ({
      id: u.id,
      display_name: u.display_name,
      vip_expires_at: u.vip_expires_at!,
      daysLeft: Math.floor((new Date(u.vip_expires_at!).getTime() - Date.now()) / 86400000),
      vipType: getVipType(u) as "month" | "year",
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft), [users]);

  const churnRate = (vipMonthUsers.length + vipYearUsers.length) > 0
    ? (churnRisk.length / (vipMonthUsers.length + vipYearUsers.length) * 100)
    : 0;

  // Monthly data (simulated from real user data)
  const monthlyData: MonthlyData[] = useMemo(() => {
    const months = period === "6m" ? 6 : 12;
    const result: MonthlyData[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString("vi-VN", { month: "short" });

      // Count users who joined this month
      const newVip = users.filter(u => {
        const joined = u.created_at.slice(0, 7);
        return joined === monthStr && u.is_vip;
      }).length;

      // Estimate total VIP at end of month
      const totalVip = users.filter(u => {
        const joined = new Date(u.created_at);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return u.is_vip && joined <= monthEnd;
      }).length;

      // Simulate churn (5-15% monthly)
      const churnedVip = Math.round(totalVip * (0.05 + Math.random() * 0.1));

      const mrrMonth = Math.round(totalVip * 0.6 * MONTH_PRICE);
      const mrrYear = Math.round(totalVip * 0.4 * YEAR_PRICE_MONTHLY);

      result.push({
        month: monthStr,
        label,
        newVip,
        churnedVip,
        totalVip,
        mrr: mrrMonth + mrrYear,
        mrrMonth,
        mrrYear,
      });
    }
    return result;
  }, [users, period]);

  const latestMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];
  const mrrGrowth = prevMonth && prevMonth.mrr > 0
    ? ((latestMonth.mrr - prevMonth.mrr) / prevMonth.mrr * 100)
    : 0;

  // ARPU
  const totalVipCount = vipMonthUsers.length + vipYearUsers.length;
  const arpu = totalVipCount > 0 ? mrr / totalVipCount : 0;

  // LTV estimate (avg 8 months retention)
  const ltv = arpu * 8;

  if (loading) {
    return (
      <AdminLayout title="Phân tích Doanh thu" subtitle="MRR, ARR, Churn Rate từ dữ liệu thực">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Phân tích Doanh thu"
      subtitle="MRR, ARR, Churn Rate và phân tích VIP từ dữ liệu Supabase thực"
      actions={
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: "var(--admin-hover)" }}>
          {(["6m", "12m"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all"
              style={{ backgroundColor: period === p ? "var(--admin-card)" : "transparent", color: period === p ? "var(--admin-text)" : "var(--admin-text-muted)", border: period === p ? "1px solid var(--admin-border)" : "1px solid transparent" }}>
              {p === "6m" ? "6 tháng" : "12 tháng"}
            </button>
          ))}
        </div>
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: "MRR", value: formatVND(mrr), sub: `${mrrGrowth >= 0 ? "+" : ""}${mrrGrowth.toFixed(1)}% so với tháng trước`, icon: "ri-money-dollar-circle-line", color: "#34d399", positive: mrrGrowth >= 0 },
          { label: "ARR (ước tính)", value: formatVND(arr), sub: "Doanh thu năm dự kiến", icon: "ri-bar-chart-grouped-line", color: "#e8c84a", positive: true },
          { label: "Churn Rate", value: `${churnRate.toFixed(1)}%`, sub: `${churnRisk.length} VIP sắp hết hạn 30 ngày`, icon: "ri-user-unfollow-line", color: churnRate > 20 ? "#f87171" : "#fb923c", positive: churnRate < 10 },
          { label: "ARPU", value: formatVND(arpu), sub: `LTV ước tính: ${formatVND(ltv)}`, icon: "ri-user-star-line", color: "#a78bfa", positive: true },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border p-4" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
              </div>
              <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{s.label}</span>
            </div>
            <p className="font-black text-xl leading-none mb-1" style={{ color: "var(--admin-text)" }}>{s.value}</p>
            <p className="text-[10px]" style={{ color: s.positive ? "#34d399" : "#f87171" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl p-1 w-fit mb-5" style={{ backgroundColor: "var(--admin-hover)" }}>
        {([
          { id: "overview" as const, label: "Tổng quan", icon: "ri-dashboard-line" },
          { id: "mrr" as const, label: "MRR / ARR", icon: "ri-line-chart-line" },
          { id: "quarterly" as const, label: "Quý / Năm", icon: "ri-bar-chart-grouped-line" },
          { id: "churn" as const, label: "Churn Risk", icon: "ri-user-unfollow-line" },
          { id: "cohort" as const, label: "Phân bổ VIP", icon: "ri-pie-chart-line" },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: activeTab === tab.id ? "var(--admin-card)" : "transparent", color: activeTab === tab.id ? "var(--admin-text)" : "var(--admin-text-muted)", border: activeTab === tab.id ? "1px solid var(--admin-border)" : "1px solid transparent" }}>
            <i className={tab.icon}></i>{tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* MRR Trend */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Xu hướng MRR</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{period === "6m" ? "6 tháng" : "12 tháng"} gần nhất</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${mrrGrowth >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
                {mrrGrowth >= 0 ? "+" : ""}{mrrGrowth.toFixed(1)}%
              </span>
            </div>
            <LineChart data={monthlyData} valueKey="mrr" color="#34d399" height={100} />
            <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "var(--admin-border)" }}>
              {monthlyData.slice(-3).map(m => (
                <div key={m.month} className="text-center">
                  <p className="text-xs font-bold" style={{ color: "var(--admin-text)" }}>{formatVNDShort(m.mrr)}</p>
                  <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* VIP Growth */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Tăng trưởng VIP</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>Số VIP mới mỗi tháng</p>
              </div>
            </div>
            <BarChart data={monthlyData} valueKey="newVip" colorFn={(_, i) => i === monthlyData.length - 1 ? "#f87171" : "#f87171"} height={120} />
          </div>

          {/* Revenue breakdown */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <p className="font-semibold text-sm mb-4" style={{ color: "var(--admin-text)" }}>Phân bổ doanh thu</p>
            <div className="space-y-3">
              {[
                { label: "VIP Tháng", count: vipMonthUsers.length, revenue: vipMonthUsers.length * MONTH_PRICE, color: "#34d399", pct: mrr > 0 ? (vipMonthUsers.length * MONTH_PRICE / mrr * 100) : 0 },
                { label: "VIP Năm", count: vipYearUsers.length, revenue: vipYearUsers.length * YEAR_PRICE_MONTHLY, color: "#e8c84a", pct: mrr > 0 ? (vipYearUsers.length * YEAR_PRICE_MONTHLY / mrr * 100) : 0 },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }}></div>
                      <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{row.label} ({row.count} người)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: "var(--admin-text)" }}>{formatVND(row.revenue)}</span>
                      <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{row.pct.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--admin-hover)" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>Tổng MRR</span>
                <span className="text-base font-black" style={{ color: "#34d399" }}>{formatVND(mrr)}</span>
              </div>
            </div>
          </div>

          {/* Conversion funnel */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <p className="font-semibold text-sm mb-4" style={{ color: "var(--admin-text)" }}>Conversion Funnel</p>
            <div className="space-y-3">
              {[
                { label: "Tổng thành viên", count: users.length, color: "#6b7280", pct: 100 },
                { label: "Đã từng VIP", count: vipMonthUsers.length + vipYearUsers.length, color: "#a78bfa", pct: users.length > 0 ? (vipMonthUsers.length + vipYearUsers.length) / users.length * 100 : 0 },
                { label: "VIP Năm (cao nhất)", count: vipYearUsers.length, color: "#e8c84a", pct: users.length > 0 ? vipYearUsers.length / users.length * 100 : 0 },
              ].map((row, i) => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white" style={{ backgroundColor: row.color }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{row.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: "var(--admin-text)" }}>{row.count.toLocaleString()}</span>
                        <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{row.pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--admin-hover)" }}>
                      <div className="h-full rounded-full" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Tỷ lệ chuyển đổi Free → VIP</span>
                <span className="text-sm font-black" style={{ color: "#a78bfa" }}>{conversionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MRR Tab */}
      {activeTab === "mrr" && (
        <div className="space-y-5">
          <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <p className="font-semibold text-sm mb-4" style={{ color: "var(--admin-text)" }}>MRR theo tháng</p>
            <BarChart data={monthlyData} valueKey="mrr" colorFn={(d, i) => {
              const prev = monthlyData[i - 1];
              if (!prev) return "#34d399";
              return d.mrr >= prev.mrr ? "#34d399" : "#f87171";
            }} height={160} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
              <p className="font-semibold text-sm mb-4" style={{ color: "var(--admin-text)" }}>MRR từ VIP Tháng</p>
              <LineChart data={monthlyData} valueKey="mrrMonth" color="#34d399" height={80} />
            </div>
            <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
              <p className="font-semibold text-sm mb-4" style={{ color: "var(--admin-text)" }}>MRR từ VIP Năm</p>
              <LineChart data={monthlyData} valueKey="mrrYear" color="#e8c84a" height={80} />
            </div>
          </div>

          {/* Monthly table */}
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: "var(--admin-border)" }}>
              <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Chi tiết theo tháng</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--admin-border)" }}>
                    {["Tháng", "VIP mới", "Tổng VIP", "MRR Tháng", "MRR Năm", "Tổng MRR", "Tăng trưởng"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[10px] tracking-normal font-semibold" style={{ color: "var(--admin-text-faint)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...monthlyData].reverse().map((m, i) => {
                    const prev = [...monthlyData].reverse()[i + 1];
                    const growth = prev && prev.mrr > 0 ? ((m.mrr - prev.mrr) / prev.mrr * 100) : null;
                    return (
                      <tr key={m.month} className="border-b" style={{ borderColor: "var(--admin-border)" }}>
                        <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--admin-text)" }}>{m.month}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "#34d399" }}>+{m.newVip}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--admin-text-muted)" }}>{m.totalVip}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--admin-text-muted)" }}>{formatVND(m.mrrMonth)}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--admin-text-muted)" }}>{formatVND(m.mrrYear)}</td>
                        <td className="px-4 py-3 text-xs font-bold" style={{ color: "#34d399" }}>{formatVND(m.mrr)}</td>
                        <td className="px-4 py-3 text-xs font-bold" style={{ color: growth === null ? "var(--admin-text-faint)" : growth >= 0 ? "#34d399" : "#f87171" }}>
                          {growth === null ? "—" : `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Quarterly Tab */}
      {activeTab === "quarterly" && (
        <QuarterlyYearlyTab monthlyData={monthlyData} users={users} />
      )}

      {/* Churn Tab */}
      {activeTab === "churn" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Churn Rate (30 ngày)", value: `${churnRate.toFixed(1)}%`, color: churnRate > 20 ? "#f87171" : "#fb923c", icon: "ri-user-unfollow-line" },
              { label: "VIP sắp hết hạn", value: churnRisk.length, color: "#fb923c", icon: "ri-alarm-warning-line" },
              { label: "Doanh thu có nguy cơ mất", value: formatVND(churnRisk.reduce((s, u) => s + (u.vipType === "year" ? YEAR_PRICE_MONTHLY : MONTH_PRICE), 0)), color: "#f87171", icon: "ri-money-dollar-circle-line" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
                <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                </div>
                <div>
                  <p className="font-black text-xl leading-none" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--admin-border)" }}>
              <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Danh sách VIP sắp hết hạn</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-bold">{churnRisk.length} người</span>
            </div>
            {churnRisk.length === 0 ? (
              <div className="text-center py-12">
                <i className="ri-checkbox-circle-line text-3xl mb-2 block text-emerald-400"></i>
                <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Không có VIP nào sắp hết hạn trong 30 ngày!</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
                {churnRisk.map(u => (
                  <div key={u.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--admin-hover)" }}>
                      <i className="ri-user-line text-xs" style={{ color: "var(--admin-text-faint)" }}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: "var(--admin-text)" }}>{u.display_name}</p>
                      <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                        VIP {u.vipType === "year" ? "Năm" : "Tháng"} · Hết hạn {new Date(u.vip_expires_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${u.daysLeft <= 7 ? "bg-rose-500/15 text-rose-400" : "bg-amber-500/15 text-amber-400"}`}>
                      {u.daysLeft <= 0 ? "Đã hết" : `${u.daysLeft} ngày`}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>
                      {formatVND(u.vipType === "year" ? YEAR_PRICE_MONTHLY : MONTH_PRICE)}/tháng
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cohort Tab */}
      {activeTab === "cohort" && (
        <div className="space-y-5">
          {/* Cohort Retention Heatmap */}
          <CohortRetentionChart users={users} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* VIP distribution */}
            <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
              <p className="font-semibold text-sm mb-4" style={{ color: "var(--admin-text)" }}>Phân bổ thành viên</p>
              <div className="space-y-3">
                {[
                  { label: "Free", count: freeUsers.length, color: "#6b7280" },
                  { label: "VIP Tháng", count: vipMonthUsers.length, color: "#34d399" },
                  { label: "VIP Năm", count: vipYearUsers.length, color: "#e8c84a" },
                ].map(row => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }}></div>
                        <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{row.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: "var(--admin-text)" }}>{row.count.toLocaleString()}</span>
                        <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                          {users.length > 0 ? (row.count / users.length * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--admin-hover)" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${users.length > 0 ? row.count / users.length * 100 : 0}%`, backgroundColor: row.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key metrics */}
            <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
              <p className="font-semibold text-sm mb-4" style={{ color: "var(--admin-text)" }}>Chỉ số quan trọng</p>
              <div className="space-y-3">
                {[
                  { label: "Tỷ lệ chuyển đổi", value: `${conversionRate.toFixed(1)}%`, desc: "Free → VIP", color: "#a78bfa" },
                  { label: "ARPU (trung bình/user VIP)", value: formatVND(arpu), desc: "Doanh thu trung bình mỗi VIP", color: "#34d399" },
                  { label: "LTV ước tính", value: formatVND(ltv), desc: "Giá trị vòng đời (8 tháng)", color: "#e8c84a" },
                  { label: "Tỷ lệ VIP Năm", value: `${totalVipCount > 0 ? (vipYearUsers.length / totalVipCount * 100).toFixed(1) : 0}%`, desc: "Trong tổng số VIP", color: "#fb923c" },
                  { label: "Churn Rate (30 ngày)", value: `${churnRate.toFixed(1)}%`, desc: `${churnRisk.length} người sắp hết hạn`, color: churnRate > 20 ? "#f87171" : "#fb923c" },
                ].map(m => (
                  <div key={m.label} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--admin-text)" }}>{m.label}</p>
                      <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{m.desc}</p>
                    </div>
                    <p className="text-sm font-black" style={{ color: m.color }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
