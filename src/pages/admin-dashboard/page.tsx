import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/feature/AdminLayout";
import { useAdminUsers, getAdminStats } from "@/hooks/useAdminUsers";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { markAdminVerified } from "@/hooks/useIsAdmin";
import { supabase } from "@/lib/supabase";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";
import type { EbookSeries } from "@/pages/series/page";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RevenueEntry { id: string; seriesId: string; buyerName: string; amount: number; date: string }
interface BroadcastMsg { id: string; title: string; body: string; target: "all" | "vip" | "free"; sentAt: string; recipientCount: number }
interface VipRevenueLog { id: string; user_name: string; user_email: string; vip_type: string; amount: number; granted_at: string; expires_at: string; note: string }

// ─── Broadcast Modal ──────────────────────────────────────────────────────────
function BroadcastModal({ onClose, totalUsers, vipCount }: {
  onClose: () => void; totalUsers: number; vipCount: number;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<"all" | "vip" | "free">("all");
  const [step, setStep] = useState<"compose" | "preview" | "sent">("compose");
  const [broadcasts, setBroadcasts] = useLocalStorage<BroadcastMsg[]>("kts_broadcasts", []);
  const { addNotification } = useAdminNotifications();

  const recipientCount = target === "all" ? totalUsers : target === "vip" ? vipCount : totalUsers - vipCount;

  const targetLabels = { all: "Tất cả thành viên", vip: "Chỉ thành viên VIP", free: "Chỉ thành viên Free" };
  const targetColors = { all: "#f87171", vip: "app-accent-primary", free: "#34d399" };

  const handleSend = () => {
    const msg: BroadcastMsg = {
      id: `bc-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      target,
      sentAt: new Date().toISOString(),
      recipientCount,
    };
    setBroadcasts(prev => [msg, ...prev]);
    addNotification({
      type: "system",
      title: "Broadcast đã gửi",
      message: `"${title}" → ${recipientCount} thành viên (${targetLabels[target]})`,
      icon: "ri-broadcast-line",
      color: "#a78bfa",
    });
    setStep("sent");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--admin-border)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-500/12">
              <i className="ri-broadcast-line text-rose-400 text-sm"></i>
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>
                {step === "sent" ? "Đã gửi thành công!" : "Gửi thông báo broadcast"}
              </p>
              <p className="text-[10px]" style={{ color: "var(--admin-text-muted)" }}>
                {step === "compose" ? "Soạn nội dung" : step === "preview" ? "Xem trước trước khi gửi" : "Thông báo đã được gửi"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
            style={{ color: "var(--admin-text-muted)" }}>
            <i className="ri-close-line"></i>
          </button>
        </div>

        {step === "sent" ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-emerald-500/12 mx-auto mb-4">
              <i className="ri-checkbox-circle-line text-app-accent-success text-3xl"></i>
            </div>
            <p className="font-bold text-base mb-1" style={{ color: "var(--admin-text)" }}>Broadcast đã gửi!</p>
            <p className="text-sm mb-1" style={{ color: "var(--admin-text-muted)" }}>
              <span className="font-semibold" style={{ color: targetColors[target] }}>{recipientCount} thành viên</span> sẽ nhận được thông báo
            </p>
            <p className="text-xs mb-6" style={{ color: "var(--admin-text-faint)" }}>
              {targetLabels[target]}
            </p>
            <div className="rounded-xl p-4 mb-6 text-left" style={{ backgroundColor: "var(--admin-card2)", border: `1px solid var(--admin-border)` }}>
              <p className="font-semibold text-sm mb-1" style={{ color: "var(--admin-text)" }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--admin-text-muted)" }}>{body}</p>
            </div>
            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
              Đóng
            </button>
          </div>
        ) : step === "preview" ? (
          <div className="p-5 space-y-4">
            {/* Phone mockup preview */}
            <div className="flex justify-center">
              <div className="w-64 rounded-2xl border-2 overflow-hidden"
                style={{ borderColor: "var(--admin-border2)", backgroundColor: "var(--admin-card2)" }}>
                <div className="px-3 py-2 flex items-center gap-2 border-b" style={{ borderColor: "var(--admin-border)" }}>
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center">
                    <i className="ri-notification-3-line text-rose-400 text-xs"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold truncate" style={{ color: "var(--admin-text)" }}>Hàn Quốc Ơi!</p>
                    <p className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>Vừa xong</p>
                  </div>
                </div>
                <div className="px-3 py-3">
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--admin-text)" }}>{title || "Tiêu đề thông báo"}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--admin-text-muted)" }}>
                    {body || "Nội dung thông báo sẽ hiển thị ở đây..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Target summary */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "var(--admin-card2)", border: `1px solid var(--admin-border)` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="ri-user-received-line text-sm" style={{ color: targetColors[target] }}></i>
                  <span className="text-xs font-medium" style={{ color: "var(--admin-text)" }}>{targetLabels[target]}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: targetColors[target] }}>
                  {recipientCount} người nhận
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("compose")}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium cursor-pointer whitespace-nowrap transition-colors"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>
                Chỉnh sửa
              </button>
              <button onClick={handleSend}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
                <i className="ri-send-plane-line mr-2"></i>Gửi ngay
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Target selector */}
            <div>
              <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--admin-text-muted)" }}>
                Đối tượng nhận
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(["all", "vip", "free"] as const).map(t => (
                  <button key={t} onClick={() => setTarget(t)}
                    className="flex flex-col items-center py-3 rounded-xl border transition-all cursor-pointer"
                    style={{
                      backgroundColor: target === t ? `${targetColors[t]}12` : "var(--admin-card2)",
                      borderColor: target === t ? `${targetColors[t]}40` : "var(--admin-border)",
                    }}>
                    <i className={`${t === "all" ? "ri-team-line" : t === "vip" ? "ri-vip-crown-line" : "ri-user-line"} text-base mb-1`}
                      style={{ color: target === t ? targetColors[t] : "var(--admin-text-faint)" }}></i>
                    <span className="text-[10px] font-semibold" style={{ color: target === t ? targetColors[t] : "var(--admin-text-muted)" }}>
                      {t === "all" ? "Tất cả" : t === "vip" ? "VIP" : "Free"}
                    </span>
                    <span className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>
                      {t === "all" ? totalUsers : t === "vip" ? vipCount : totalUsers - vipCount} người
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>
                Tiêu đề <span className="text-rose-400">*</span>
              </label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value.slice(0, 80))}
                placeholder="VD: Tính năng mới đã ra mắt!"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
              <p className="text-[10px] mt-1 text-right" style={{ color: "var(--admin-text-faint)" }}>{title.length}/80</p>
            </div>

            {/* Body */}
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>
                Nội dung <span className="text-rose-400">*</span>
              </label>
              <textarea value={body} onChange={e => setBody(e.target.value.slice(0, 300))}
                placeholder="Nội dung thông báo chi tiết..."
                rows={4} maxLength={300}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border resize-none"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
              <p className="text-[10px] mt-1 text-right" style={{ color: "var(--admin-text-faint)" }}>{body.length}/300</p>
            </div>

            {/* Quick templates */}
            <div>
              <p className="text-[10px] mb-2" style={{ color: "var(--admin-text-faint)" }}>Mẫu nhanh:</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: "Tính năng mới", t: "Tính năng mới đã ra mắt!", b: "Chúng tôi vừa cập nhật tính năng mới. Hãy khám phá ngay!" },
                  { label: "Khuyến mãi VIP", t: "Ưu đãi VIP đặc biệt!", b: "Nâng cấp VIP hôm nay để nhận ưu đãi độc quyền. Chỉ còn 48 giờ!" },
                  { label: "Nhắc học", t: "Đừng quên học hôm nay!", b: "Streak của bạn đang chờ! Chỉ cần 10 phút để duy trì thói quen học tiếng Hàn." },
                ].map(tpl => (
                  <button key={tpl.label} onClick={() => { setTitle(tpl.t); setBody(tpl.b); }}
                    className="text-[10px] px-2.5 py-1 rounded-full cursor-pointer whitespace-nowrap transition-colors"
                    style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium cursor-pointer whitespace-nowrap transition-colors"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>
                Hủy
              </button>
              <button onClick={() => setStep("preview")} disabled={!title.trim() || !body.trim()}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
                <i className="ri-eye-line mr-2"></i>Xem trước
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Revenue Chart (30 days real-time) ───────────────────────────────────────
function RevenueChart({ revenues }: { revenues: RevenueEntry[] }) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [liveRevenue, setLiveRevenue] = useState(revenues.reduce((s, r) => s + r.amount, 0));

  // liveRevenue = tổng thật từ prop revenues (không giả lập)

  const days30 = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const dayRevenue = revenues
        .filter(r => r.date.slice(0, 10) === dateStr)
        .reduce((s, r) => s + r.amount, 0);
      return {
        date: dateStr,
        label: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
        value: dayRevenue,
        isToday: i === 29,
      };
    });
  }, [revenues]);

  const maxVal = Math.max(...days30.map(d => d.value), 1);
  const totalMonth = days30.reduce((s, d) => s + d.value, 0);
  const avgDay = Math.round(totalMonth / 30);
  const todayVal = days30[29]?.value ?? 0;
  const yesterdayVal = days30[28]?.value ?? 0;
  const growthPct = yesterdayVal > 0 ? Math.round(((todayVal - yesterdayVal) / yesterdayVal) * 100) : 0;

  const formatVND = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
    return String(n);
  };

  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Doanh thu 30 ngày</h3>
            <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/12 text-app-accent-success font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "var(--admin-text)" }}>
            {liveRevenue.toLocaleString("vi-VN")}đ
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>
              TB/ngày: <span className="font-semibold">{formatVND(avgDay)}đ</span>
            </span>
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${growthPct >= 0 ? "text-app-accent-success" : "text-rose-400"}`}>
              <i className={growthPct >= 0 ? "ri-arrow-up-line" : "ri-arrow-down-line"}></i>
              {Math.abs(growthPct)}% hôm nay
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "var(--admin-text-faint)" }}>Hôm nay</p>
          <p className="text-lg font-bold text-app-accent-success">{formatVND(todayVal)}đ</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="relative">
        <div className="flex items-end gap-0.5 h-28 mb-1">
          {days30.map((d, i) => {
            const barH = Math.max((d.value / maxVal) * 100, 2);
            const isHovered = hoveredDay === i;
            const isToday = d.isToday;
            return (
              <div key={i} className="flex-1 flex flex-col items-center relative group"
                onMouseEnter={() => setHoveredDay(i)}
                onMouseLeave={() => setHoveredDay(null)}>
                {isHovered && (
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
                    style={{ minWidth: "80px" }}>
                    <div className="rounded-lg px-2.5 py-1.5 text-center"
                      style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border2)" }}>
                      <p className="text-[10px] font-bold text-app-accent-success">{formatVND(d.value)}đ</p>
                      <p className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>{d.label}</p>
                    </div>
                  </div>
                )}
                <div
                  className="w-full rounded-t-sm transition-all duration-200"
                  style={{
                    height: `${barH}%`,
                    backgroundColor: isToday ? "#34d399" : isHovered ? "#34d39980" : "rgba(52,211,153,0.25)",
                    minHeight: "2px",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels — show every 5 days */}
        <div className="flex items-center gap-0.5">
          {days30.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              {(i === 0 || i === 9 || i === 19 || i === 29) && (
                <span className="text-[8px]" style={{ color: "var(--admin-text-faint)" }}>{d.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mini stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
        {[
          { label: "Tổng tháng", value: formatVND(totalMonth) + "đ", color: "#34d399" },
          { label: "Cao nhất/ngày", value: formatVND(maxVal) + "đ", color: "app-accent-primary" },
          { label: "Số đơn hàng", value: String(revenues.length || Math.floor(totalMonth / 200000)), color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VIP Revenue Stats ────────────────────────────────────────────────────────
function VipRevenueStats({ totalUsers, vipCount }: { totalUsers: number; vipCount: number }) {
  const [logs, setLogs] = useState<VipRevenueLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await supabase.functions.invoke("admin-grant-vip", {
          body: { action: "get_revenue" },
        });
        if (res.data?.data) setLogs(res.data.data);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const monthlyData = useMemo(() => {
    const months: { label: string; month: string; vipMonth: number; vipYear: number; total: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString("vi-VN", { month: "short", year: "2-digit" });
      const monthLogs = logs.filter(l => l.granted_at.startsWith(monthKey));
      const vipMonthAmt = monthLogs.filter(l => l.vip_type === "month").reduce((s, l) => s + l.amount, 0);
      const vipYearAmt = monthLogs.filter(l => l.vip_type === "year").reduce((s, l) => s + l.amount, 0);
      months.push({ label, month: monthKey, vipMonth: vipMonthAmt, vipYear: vipYearAmt, total: vipMonthAmt + vipYearAmt, count: monthLogs.length });
    }
    return months;
  }, [logs]);

  const totalRevenue = logs.reduce((s, l) => s + l.amount, 0);
  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const thisMonthRevenue = logs.filter(l => l.granted_at.startsWith(thisMonthKey)).reduce((s, l) => s + l.amount, 0);
  const thisMonthCount = logs.filter(l => l.granted_at.startsWith(thisMonthKey)).length;
  const conversionRate = totalUsers > 0 ? ((vipCount / totalUsers) * 100).toFixed(1) : "0";
  const maxMonthly = Math.max(...monthlyData.map(m => m.total), 1);

  const formatVND = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}Mđ`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}kđ`;
    return `${n}đ`;
  };

  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Doanh thu VIP theo tháng</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>6 tháng gần nhất · Tổng tích lũy: <span className="font-bold text-app-accent-success">{formatVND(totalRevenue)}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ backgroundColor: "rgba(232,200,74,0.12)", color: "app-accent-primary" }}>
            {conversionRate}% chuyển đổi
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Tháng này", value: formatVND(thisMonthRevenue), icon: "ri-calendar-line", color: "#34d399" },
          { label: "Giao dịch", value: String(thisMonthCount), icon: "ri-exchange-line", color: "app-accent-primary" },
          { label: "Tỷ lệ VIP", value: `${conversionRate}%`, icon: "ri-percent-line", color: "#a78bfa" },
          { label: "Tổng VIP", value: String(vipCount), icon: "ri-vip-crown-line", color: "#fb923c" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
            <div className="w-7 h-7 flex items-center justify-center rounded-lg mx-auto mb-1.5" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-xs`} style={{ color: s.color }} />
            </div>
            <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-faint)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div>
          <div className="flex items-end gap-2 mb-2" style={{ height: "96px" }}>
            {monthlyData.map((m, i) => {
              const barH = Math.max((m.total / maxMonthly) * 100, 2);
              const isThisMonth = m.month === thisMonthKey;
              return (
                <div key={i} className="flex-1 flex flex-col items-end group relative" style={{ height: "96px" }}>
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="rounded-lg px-2 py-1.5 text-center whitespace-nowrap" style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border2)" }}>
                      <p className="text-[10px] font-bold text-app-accent-success">{formatVND(m.total)}</p>
                      <p className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>{m.count} giao dịch</p>
                    </div>
                  </div>
                  <div className="w-full mt-auto rounded-t-sm transition-all duration-300"
                    style={{ height: `${barH}%`, backgroundColor: isThisMonth ? "#34d399" : "rgba(52,211,153,0.3)", minHeight: "2px" }} />
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            {monthlyData.map((m, i) => (
              <div key={i} className="flex-1 text-center">
                <p className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
        <p className="text-xs font-semibold mb-3" style={{ color: "var(--admin-text-muted)" }}>Tỷ lệ chuyển đổi Free → VIP</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] w-20 text-right" style={{ color: "var(--admin-text-faint)" }}>Tổng user</span>
            <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: "var(--admin-hover)" }}>
              <div className="h-full rounded-full" style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.08)" }} />
            </div>
            <span className="text-[10px] w-12 font-bold" style={{ color: "var(--admin-text)" }}>{totalUsers}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] w-20 text-right" style={{ color: "var(--admin-text-faint)" }}>VIP</span>
            <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: "var(--admin-hover)" }}>
              <div className="h-full rounded-full bg-app-accent-primary" style={{ width: `${conversionRate}%` }} />
            </div>
            <span className="text-[10px] w-12 font-bold text-app-accent-primary">{vipCount} ({conversionRate}%)</span>
          </div>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--admin-text-muted)" }}>Cấp VIP gần đây</p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {logs.slice(0, 5).map(l => (
              <div key={l.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
                <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: l.vip_type === "year" ? "rgba(232,200,74,0.15)" : "rgba(52,211,153,0.15)" }}>
                  <i className="ri-vip-crown-line text-[10px]" style={{ color: l.vip_type === "year" ? "app-accent-primary" : "#34d399" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--admin-text)" }}>{l.user_name}</p>
                  <p className="text-[9px] truncate" style={{ color: "var(--admin-text-faint)" }}>VIP {l.vip_type === "year" ? "Năm" : "Tháng"} · {new Date(l.granted_at).toLocaleDateString("vi-VN")}</p>
                </div>
                <span className="text-[10px] font-bold" style={{ color: l.vip_type === "year" ? "app-accent-primary" : "#34d399" }}>{formatVND(l.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Broadcast History ────────────────────────────────────────────────────────
function BroadcastHistory() {
  const [broadcasts] = useLocalStorage<BroadcastMsg[]>("kts_broadcasts", []);
  if (broadcasts.length === 0) return null;
  const targetColors: Record<string, string> = { all: "#f87171", vip: "app-accent-primary", free: "#34d399" };
  const targetLabels: Record<string, string> = { all: "Tất cả", vip: "VIP", free: "Free" };
  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
      <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--admin-text)" }}>
        <i className="ri-history-line mr-2" style={{ color: "var(--admin-text-muted)" }}></i>
        Lịch sử broadcast ({broadcasts.length})
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {broadcasts.map(b => (
          <div key={b.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
            style={{ backgroundColor: "var(--admin-card2)", border: `1px solid var(--admin-border)` }}>
            <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${targetColors[b.target]}15` }}>
              <i className="ri-broadcast-line text-xs" style={{ color: targetColors[b.target] }}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "var(--admin-text)" }}>{b.title}</p>
              <p className="text-[10px] truncate" style={{ color: "var(--admin-text-muted)" }}>{b.body}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${targetColors[b.target]}15`, color: targetColors[b.target] }}>
                {targetLabels[b.target]} · {b.recipientCount}
              </span>
              <p className="text-[9px] mt-0.5" style={{ color: "var(--admin-text-faint)" }}>
                {new Date(b.sentAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, onClick }: {
  icon: string; label: string; value: string | number; sub?: string; color: string; onClick?: () => void;
}) {
  return (
    <div onClick={onClick}
      className="rounded-xl p-4 sm:p-5 border transition-all"
      style={{
        backgroundColor: "var(--admin-card)",
        borderColor: "var(--admin-border)",
        cursor: onClick ? "pointer" : "default",
      }}>
      <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg mb-2 sm:mb-3" style={{ backgroundColor: `${color}15` }}>
        <i className={`${icon} text-sm sm:text-base`} style={{ color }}></i>
      </div>
      <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--admin-text)" }}>{value}</p>
      <p className="text-[11px] sm:text-xs mt-1" style={{ color: "var(--admin-text-muted)" }}>{label}</p>
      {sub && <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-faint)" }}>{sub}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const navigate = useNavigate();
  // Mark admin session as verified when admin panel is accessed
  useEffect(() => { markAdminVerified(); }, []);
  const { users, loading: usersLoading } = useAdminUsers();
  const stats = getAdminStats(users);
  const [approvedLessons] = useLocalStorage<ApprovedLesson[]>("kts_melon_lessons", []);
  const [seriesList] = useLocalStorage<EbookSeries[]>("kts_series_list", []);
  const [revenues] = useLocalStorage<RevenueEntry[]>("kts_revenues", []);
  const [showBroadcast, setShowBroadcast] = useState(false);

  const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0);
  const vipPct = stats.total > 0 ? Math.round((stats.vipCount / stats.total) * 100) : 0;

  const topUsers = useMemo(() => [...users].sort((a, b) => (b.xp_total || 0) - (a.xp_total || 0)).slice(0, 5), [users]);
  const recentUsers = useMemo(() => [...users].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5), [users]);

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Tổng quan hệ thống Hàn Quốc Ơi!"
      actions={
        <button
          onClick={() => setShowBroadcast(true)}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap bg-rose-500 hover:bg-rose-400 text-white"
        >
          <i className="ri-broadcast-line"></i>
          Gửi thông báo
        </button>
      }
    >
      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard icon="ri-user-line" label="Tổng người dùng" value={usersLoading ? "..." : stats.total.toLocaleString()} sub={usersLoading ? "Đang tải..." : `+${stats.thisWeek} tuần này`} color="#f87171" onClick={() => navigate("/admin/users")} />
        <StatCard icon="ri-vip-crown-line" label="VIP" value={usersLoading ? "..." : stats.vipCount} sub={usersLoading ? "" : `${vipPct}% tổng`} color="app-accent-primary" onClick={() => navigate("/admin/users")} />
        <StatCard icon="ri-money-dollar-circle-line" label="Doanh thu" value={`${(totalRevenue / 1000).toFixed(0)}k`} sub={`${revenues.length} đơn`} color="#34d399" onClick={() => navigate("/admin/stats")} />
        <StatCard icon="ri-book-open-line" label="Bài học đã duyệt" value={approvedLessons.length} sub={`${seriesList.length} series`} color="#a78bfa" onClick={() => navigate("/admin/series")} />
      </div>

      {/* Revenue chart — full width */}
      <div className="mb-6">
        <RevenueChart revenues={revenues} />
      </div>

      {/* VIP Revenue Stats */}
      <div className="mb-6">
        <VipRevenueStats totalUsers={stats.total} vipCount={stats.vipCount} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
        {/* VIP Distribution */}
        <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--admin-text)" }}>Phân bố VIP</h3>
          <p className="text-xs mb-4" style={{ color: "var(--admin-text-muted)" }}>Tỷ lệ người dùng VIP</p>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="app-accent-primary" strokeWidth="3" strokeDasharray={`${vipPct}, 100`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-bold text-lg" style={{ color: "var(--admin-text)" }}>{vipPct}%</span>
                <span className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>VIP</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[{ label: "VIP", val: stats.vipCount, color: "app-accent-primary" }, { label: "Free", val: stats.total - stats.vipCount, color: "var(--admin-text-muted)" }].map(s => (
              <div key={s.label} className="flex items-center justify-between text-xs">
                <span style={{ color: "var(--admin-text-muted)" }}>{s.label}</span>
                <span className="font-bold" style={{ color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top users */}
        <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--admin-text)" }}>Top học viên</h3>
          <p className="text-xs mb-4" style={{ color: "var(--admin-text-muted)" }}>Theo XP tích lũy</p>
          <div className="space-y-3">
            {topUsers.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3">
                <span className="text-[10px] font-bold w-4 text-center"
                  style={{ color: i === 0 ? "app-accent-primary" : i === 1 ? "#a78bfa" : i === 2 ? "#fb923c" : "var(--admin-text-faint)" }}>
                  {i + 1}
                </span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--admin-hover)" }}>
                  <i className="ri-user-line text-xs" style={{ color: "var(--admin-text-faint)" }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--admin-text)" }}>{u.display_name}</p>
                  <p className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>{u.streak_count} ngày streak</p>
                </div>
                <span className="text-app-accent-primary text-xs font-bold">{(u.xp_total || 0).toLocaleString()} XP</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent signups */}
        <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--admin-text)" }}>Đăng ký gần đây</h3>
          <p className="text-xs mb-4" style={{ color: "var(--admin-text-muted)" }}>Người dùng mới nhất</p>
          <div className="space-y-3">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--admin-hover)" }}>
                  <i className="ri-user-line text-xs" style={{ color: "var(--admin-text-faint)" }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--admin-text)" }}>{u.display_name}</p>
                  <p className="text-[9px] truncate" style={{ color: "var(--admin-text-faint)" }}>{u.email}</p>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${u.is_vip ? "bg-app-accent-primary/15 text-app-accent-primary" : "bg-app-card/50 text-app-text-muted"}`}>
                  {u.is_vip ? "VIP" : "Free"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Broadcast history */}
      <div className="mb-6">
        <BroadcastHistory />
      </div>

      {/* Quick actions — full grid */}
      <div className="rounded-xl border p-4 sm:p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Truy cập nhanh</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-faint)" }}>20 tác vụ</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">
          {[
            { path: "/admin/users", icon: "ri-user-settings-line", label: "Thành viên", color: "#f87171" },
            { path: "/admin/pricing", icon: "ri-vip-crown-line", label: "Gói VIP", color: "app-accent-primary" },
            { path: "/admin/coupon", icon: "ri-coupon-3-line", label: "Coupon", color: "#fb923c" },
            { path: "/admin/roles", icon: "ri-shield-user-line", label: "Phân quyền", color: "#a78bfa" },
            { path: "/admin/content", icon: "ri-article-line", label: "Duyệt nội dung", color: "#34d399" },
            { path: "/admin/content-learn", icon: "ri-book-open-line", label: "Nội dung học", color: "#34d399" },
            { path: "/admin/series", icon: "ri-stack-line", label: "Series & Ebook", color: "#a78bfa" },
            { path: "/admin/eps", icon: "ri-image-edit-line", label: "Quản lý EPS", color: "app-accent-primary" },
            { path: "/admin/eps-new", icon: "ri-add-circle-line", label: "Thêm bài EPS", color: "#34d399" },
            { path: "/admin/eps-upload", icon: "ri-upload-cloud-2-line", label: "Upload ảnh EPS", color: "#fb923c" },
            { path: "/admin/upload", icon: "ri-upload-cloud-2-line", label: "Upload & AI", color: "#34d399" },
            { path: "/admin/broadcast", icon: "ri-broadcast-line", label: "Broadcast", color: "#e879f9" },
            { path: "/admin/stats", icon: "ri-pie-chart-line", label: "Thống kê hệ thống", color: "#a78bfa" },
            { path: "/admin/learn-stats", icon: "ri-bar-chart-grouped-line", label: "Thống kê học", color: "#34d399" },
            { path: "/admin/backup", icon: "ri-save-line", label: "Backup", color: "#34d399" },
            { path: "/admin/settings", icon: "ri-settings-3-line", label: "Cài đặt API", color: "app-accent-primary" },
            { path: "/admin/audit", icon: "ri-file-list-3-line", label: "Audit Log", color: "#fbbf24" },
            { path: "/admin/ads", icon: "ri-advertisement-line", label: "Quảng cáo", color: "#fb923c" },
            { path: "/admin/hanja", icon: "ri-character-recognition-line", label: "Hán Hàn", color: "app-accent-primary" },
            { path: "/admin/control", icon: "ri-settings-4-line", label: "Cài đặt admin", color: "#38bdf8" },
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border transition-all cursor-pointer text-center hover:scale-[1.02]"
              style={{ backgroundColor: "var(--admin-card2)", borderColor: "var(--admin-border)" }}>
              <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                <i className={`${item.icon} text-base`} style={{ color: item.color }}></i>
              </div>
              <span className="text-[10px] font-medium leading-tight" style={{ color: "var(--admin-text-muted)" }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {showBroadcast && (
        <BroadcastModal
          onClose={() => setShowBroadcast(false)}
          totalUsers={stats.total}
          vipCount={stats.vipCount}
        />
      )}
    </AdminLayout>
  );
}

