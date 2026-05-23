import { useState, useMemo } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import type { EbookSeries } from "@/pages/series/page";
import VirtualList from "@/components/base/VirtualList";
import { exportCouponsCSV } from "@/utils/exportUtils";
import { useCoupons } from "@/hooks/useCoupons";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  discountType: "percent" | "fixed";
  channel: string;
  seriesId: string | "all";
  usageCount: number;
  maxUsage: number | null;
  createdAt: string;
  note?: string;
  active: boolean;
  couponType: "ebook" | "vip";
  vipPlan?: "month" | "year";
}

const CHANNEL_OPTIONS = [
  "Zalo OA", "Facebook Group", "TikTok", "Instagram", "YouTube", "Gumroad", "Bạn bè giới thiệu", "Khác"
];

function CouponForm({ initial, series, onSave, onCancel }: {
  initial?: Coupon | null;
  series: EbookSeries[];
  onSave: (c: Coupon) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [discount, setDiscount] = useState(String(initial?.discount ?? "20"));
  const [discountType, setDiscountType] = useState<"percent" | "fixed">(initial?.discountType ?? "percent");
  const [channel, setChannel] = useState(initial?.channel ?? "Zalo OA");
  const [seriesId, setSeriesId] = useState(initial?.seriesId ?? "all");
  const [maxUsage, setMaxUsage] = useState(String(initial?.maxUsage ?? ""));
  const [note, setNote] = useState(initial?.note ?? "");
  const [couponType, setCouponType] = useState<"ebook" | "vip">(initial?.couponType ?? "ebook");
  const [vipPlan, setVipPlan] = useState<"month" | "year">(initial?.vipPlan ?? "month");

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const prefix = couponType === "vip" ? "VIP" : channel.replace(/\s+/g, "").toUpperCase().slice(0, 4);
    const rand = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setCode(`${prefix}${rand}`);
  };

  const handleSave = () => {
    if (!code.trim() || !discount) return;
    onSave({
      id: initial?.id ?? `cpn-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discount: parseFloat(discount),
      discountType,
      channel,
      seriesId: couponType === "ebook" ? seriesId : "all",
      usageCount: initial?.usageCount ?? 0,
      maxUsage: maxUsage ? parseInt(maxUsage) : null,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      note: note.trim() || undefined,
      active: initial?.active ?? true,
      couponType,
      vipPlan: couponType === "vip" ? vipPlan : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-app-border">
          <div className="flex items-center gap-2">
            <i className="ri-coupon-3-line text-rose-400 text-sm"></i>
            <p className="text-white font-semibold text-sm">{initial ? "Chỉnh sửa coupon" : "Tạo coupon mới"}</p>
          </div>
          <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center text-app-text-muted hover:text-white/70 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Coupon type */}
          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Loại coupon *</label>
            <div className="flex bg-app-card/50 border border-app-border rounded-lg overflow-hidden">
              <button
                onClick={() => setCouponType("ebook")}
                className={`flex-1 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${couponType === "ebook" ? "bg-rose-500 text-white" : "text-app-text-secondary hover:text-white/70"}`}
              >
                <i className="ri-book-line mr-1" />Ebook
              </button>
              <button
                onClick={() => setCouponType("vip")}
                className={`flex-1 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${couponType === "vip" ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/70"}`}
              >
                <i className="ri-vip-crown-line mr-1" />VIP
              </button>
            </div>
          </div>

          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Mã coupon *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder={couponType === "vip" ? "VD: VIP20" : "VD: ZALO20"}
                className="flex-1 bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 transition-colors font-mono tracking-widest"
              />
              <button
                onClick={generateCode}
                className="px-3 py-2.5 bg-app-card/50 hover:bg-app-card/70 border border-app-border rounded-lg text-white/50 text-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-refresh-line"></i>
              </button>
            </div>
          </div>

          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Giảm giá *</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                placeholder="20"
                className="flex-1 bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 transition-colors"
              />
              <div className="flex bg-app-card/50 border border-app-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setDiscountType("percent")}
                  className={`px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${discountType === "percent" ? "bg-rose-500 text-white" : "text-app-text-secondary hover:text-white/70"}`}
                >
                  %
                </button>
                <button
                  onClick={() => setDiscountType("fixed")}
                  className={`px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${discountType === "fixed" ? "bg-rose-500 text-white" : "text-app-text-secondary hover:text-white/70"}`}
                >
                  VNĐ
                </button>
              </div>
            </div>
          </div>

          {couponType === "vip" && (
            <div>
              <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Áp dụng cho gói VIP</label>
              <div className="flex bg-app-card/50 border border-app-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setVipPlan("month")}
                  className={`flex-1 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${vipPlan === "month" ? "bg-app-accent-primary/20 text-app-accent-primary" : "text-app-text-secondary hover:text-white/70"}`}
                >
                  Tháng
                </button>
                <button
                  onClick={() => setVipPlan("year")}
                  className={`flex-1 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${vipPlan === "year" ? "bg-app-accent-primary/20 text-app-accent-primary" : "text-app-text-secondary hover:text-white/70"}`}
                >
                  Năm
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Kênh bán hàng</label>
            <select
              value={channel}
              onChange={e => setChannel(e.target.value)}
              className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500/40 transition-colors cursor-pointer"
            >
              {CHANNEL_OPTIONS.map(c => (
                <option key={c} value={c} className="bg-app-bg">{c}</option>
              ))}
            </select>
          </div>

          {couponType === "ebook" && (
            <div>
              <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Áp dụng cho</label>
              <select
                value={seriesId}
                onChange={e => setSeriesId(e.target.value)}
                className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500/40 transition-colors cursor-pointer"
              >
                <option value="all" className="bg-app-bg">Tất cả series</option>
                {series.map(s => (
                  <option key={s.id} value={s.id} className="bg-app-bg">{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Giới hạn dùng</label>
              <input
                type="number"
                value={maxUsage}
                onChange={e => setMaxUsage(e.target.value)}
                placeholder="Không giới hạn"
                className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 transition-colors"
              />
            </div>
            <div>
              <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Ghi chú</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Chiến dịch tháng 4..."
                className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-app-border">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-app-border text-white/50 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap">Hủy</button>
          <button
            onClick={handleSave}
            disabled={!code.trim() || !discount}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            {initial ? "Lưu thay đổi" : "Tạo coupon"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecordUsageModal({ coupon, onClose, onRecord }: {
  coupon: Coupon;
  onClose: () => void;
  onRecord: (id: string, times: number) => void;
}) {
  const [times, setTimes] = useState(1);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-app-border">
          <p className="text-white font-semibold text-sm">Ghi nhận sử dụng</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-app-text-muted hover:text-white/70 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="p-5">
          <p className="text-white/50 text-xs mb-4">
            Mã: <span className="text-rose-400 font-mono font-bold">{coupon.code}</span> · Đã dùng: {coupon.usageCount} lần
          </p>
          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Số lần sử dụng thêm</label>
            <input
              type="number"
              min={1}
              value={times}
              onChange={e => setTimes(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500/40 transition-colors"
            />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-app-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-app-border text-white/50 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap">Hủy</button>
          <button
            onClick={() => { onRecord(coupon.id, times); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            Ghi nhận
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCouponPage() {
  const { coupons, loading, saveCoupon, deleteCoupon, toggleCoupon, recordUsage } = useCoupons();
  const [seriesList] = useLocalStorage<EbookSeries[]>("kts_series_list", []);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [recordingCoupon, setRecordingCoupon] = useState<Coupon | null>(null);
  const [filterChannel, setFilterChannel] = useState("all");
  const [filterType, setFilterType] = useState<"all" | "ebook" | "vip">("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async (coupon: Coupon) => {
    const ok = await saveCoupon(coupon);
    setShowForm(false);
    setEditingCoupon(null);
    showToast(ok ? (editingCoupon ? "Đã cập nhật coupon!" : "Đã tạo coupon mới!") : "Lỗi lưu coupon");
  };

  const handleToggle = async (id: string) => {
    const ok = await toggleCoupon(id);
    if (!ok) showToast("Lỗi cập nhật trạng thái coupon");
  };

  const handleDelete = async (id: string) => {
    await deleteCoupon(id);
    showToast("Đã xóa coupon");
  };

  const handleRecordUsage = async (id: string, times: number) => {
    const ok = await recordUsage(id, times);
    showToast(ok ? `Đã ghi nhận +${times} lần sử dụng` : "Lỗi ghi nhận lượt dùng — vui lòng thử lại");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const channels = useMemo(() => {
    const all = coupons.map(c => c.channel);
    return ["all", ...Array.from(new Set(all))];
  }, [coupons]);

  const filtered = useMemo(() => {
    let list = [...coupons];
    if (filterChannel !== "all") list = list.filter(c => c.channel === filterChannel);
    if (filterType !== "all") list = list.filter(c => c.couponType === filterType);
    return list;
  }, [coupons, filterChannel, filterType]);

  const channelStats = useMemo(() => {
    const map: Record<string, { count: number; usage: number }> = {};
    coupons.forEach(c => {
      if (!map[c.channel]) map[c.channel] = { count: 0, usage: 0 };
      map[c.channel].count += 1;
      map[c.channel].usage += c.usageCount;
    });
    return Object.entries(map).sort((a, b) => b[1].usage - a[1].usage);
  }, [coupons]);

  const totalUsage = coupons.reduce((s, c) => s + c.usageCount, 0);
  const vipCoupons = coupons.filter(c => c.couponType === "vip");

  return (
    <AdminLayout
      title="Coupon & Mã giảm giá"
      subtitle="Tạo và quản lý mã giảm giá Ebook & VIP — lưu trên Supabase"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCouponsCSV(coupons)}
            className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap bg-emerald-500/10 text-app-accent-success border border-emerald-500/20 hover:bg-emerald-500/20"
          >
            <i className="ri-download-2-line"></i>
            Export CSV
          </button>
          <button
            onClick={() => { setEditingCoupon(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            Tạo coupon
          </button>
        </div>
      }
    >
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-500 text-white">
          <i className="ri-checkbox-circle-line"></i>
          {toast}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Tổng coupon", value: coupons.length, icon: "ri-coupon-3-line", color: "#f87171" },
          { label: "Đang hoạt động", value: coupons.filter(c => c.active).length, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Coupon VIP", value: vipCoupons.length, icon: "ri-vip-crown-line", color: "app-accent-primary" },
          { label: "Tổng lượt dùng", value: totalUsage, icon: "ri-user-received-line", color: "#fb923c" },
          { label: "Kênh đang dùng", value: channelStats.length, icon: "ri-broadcast-line", color: "#a78bfa" },
        ].map(stat => (
          <div key={stat.label} className="bg-[#111318] border border-app-border rounded-xl p-4 flex items-center gap-3">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Channel ranking */}
        <div className="bg-[#111318] border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1">Kênh hiệu quả nhất</h3>
          <p className="text-app-text-muted text-xs mb-4">Theo số lần dùng coupon</p>
          {channelStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <i className="ri-bar-chart-line text-white/10 text-3xl mb-2"></i>
              <p className="text-app-text-muted text-xs">Chưa có dữ liệu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {channelStats.map(([ch, data], i) => {
                const pct = totalUsage > 0 ? Math.round((data.usage / totalUsage) * 100) : 0;
                const colors = ["#f87171", "#34d399", "#fb923c", "#a78bfa", "#38bdf8"];
                const color = colors[i % colors.length];
                return (
                  <div key={ch}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold w-4 text-center" style={{ color }}>{i + 1}</span>
                        <span className="text-white/60 text-xs font-medium">{ch}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-app-text-muted text-[10px]">{data.usage} lần</span>
                        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coupon list */}
        <div className="col-span-2 bg-[#111318] border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-white font-semibold text-sm">Danh sách coupon</h3>
              <p className="text-app-text-muted text-xs mt-0.5">{filtered.length} coupon · Supabase</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as "all" | "ebook" | "vip")}
                className="bg-app-card/50 border border-app-border rounded-lg px-3 py-1.5 text-white/60 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#111318]">Tất cả loại</option>
                <option value="ebook" className="bg-[#111318]">Ebook</option>
                <option value="vip" className="bg-[#111318]">VIP</option>
              </select>
              <select
                value={filterChannel}
                onChange={e => setFilterChannel(e.target.value)}
                className="bg-app-card/50 border border-app-border rounded-lg px-3 py-1.5 text-white/60 text-xs focus:outline-none cursor-pointer"
              >
                {channels.map(c => (
                  <option key={c} value={c} className="bg-[#111318]">{c === "all" ? "Tất cả kênh" : c}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <i className="ri-coupon-3-line text-white/10 text-3xl mb-3"></i>
              <p className="text-app-text-muted text-sm mb-1">Chưa có coupon nào</p>
              <button
                onClick={() => { setEditingCoupon(null); setShowForm(true); }}
                className="mt-3 flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line"></i>
                Tạo coupon đầu tiên
              </button>
            </div>
          ) : (
            <VirtualList
              items={filtered}
              itemHeight={64}
              containerHeight={320}
              overscan={6}
              renderItem={(coupon: unknown) => {
                const c = coupon as Coupon;
                const s = seriesList.find(sv => sv.id === c.seriesId);
                const usagePct = c.maxUsage ? Math.round((c.usageCount / c.maxUsage) * 100) : null;
                return (
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors group h-full ${
                      c.active ? "bg-app-surface/50 border-app-border hover:border-app-border" : "bg-white/1 border-white/3 opacity-50"
                    }`}
                  >
                    <button
                      onClick={() => handleCopyCode(c.code)}
                      className="flex items-center gap-1.5 cursor-pointer"
                      title="Click để copy"
                    >
                      <span className="font-mono font-bold text-sm text-rose-400 tracking-widest">{c.code}</span>
                      <i className={`text-[10px] ${copiedCode === c.code ? "ri-check-line text-app-accent-success" : "ri-clipboard-line text-app-text-muted"}`}></i>
                    </button>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      c.couponType === "vip" ? "bg-app-accent-primary/10 text-app-accent-primary" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {c.couponType === "vip" ? "VIP" : "Ebook"}
                    </span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 whitespace-nowrap">
                      -{c.discount}{c.discountType === "percent" ? "%" : "k"}
                    </span>

                    <span className="text-app-text-secondary text-[10px] flex-1 truncate">{c.channel}</span>

                    <span className="text-app-text-muted text-[10px] truncate max-w-[80px]">
                      {c.couponType === "vip" ? (c.vipPlan === "year" ? "VIP Năm" : "VIP Tháng") : (c.seriesId === "all" ? "Tất cả" : (s?.name ?? "?"))}
                    </span>

                    <div className="text-right flex-shrink-0">
                      <p className="text-white/60 text-xs font-semibold">
                        {c.usageCount}{c.maxUsage ? `/${c.maxUsage}` : ""} lần
                      </p>
                      {usagePct !== null && (
                        <div className="w-16 h-1 bg-app-card/50 rounded-full overflow-hidden mt-1">
                          <div className="h-full rounded-full bg-rose-500" style={{ width: `${Math.min(usagePct, 100)}%` }} />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setRecordingCoupon(c)}
                        className="w-6 h-6 flex items-center justify-center bg-app-card/50 hover:bg-app-card/70 rounded-lg transition-colors cursor-pointer"
                        title="Ghi nhận sử dụng"
                      >
                        <i className="ri-add-line text-app-text-secondary text-[10px]"></i>
                      </button>
                      <button
                        onClick={() => handleToggle(c.id)}
                        className="w-6 h-6 flex items-center justify-center bg-app-card/50 hover:bg-app-card/70 rounded-lg transition-colors cursor-pointer"
                      >
                        <i className={`text-[10px] ${c.active ? "ri-pause-line text-app-text-secondary" : "ri-play-line text-app-accent-success"}`}></i>
                      </button>
                      <button
                        onClick={() => { setEditingCoupon(c); setShowForm(true); }}
                        className="w-6 h-6 flex items-center justify-center bg-app-card/50 hover:bg-app-card/70 rounded-lg transition-colors cursor-pointer"
                      >
                        <i className="ri-edit-line text-app-text-secondary text-[10px]"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="w-6 h-6 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                      >
                        <i className="ri-delete-bin-line text-red-400 text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                );
              }}
            />
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-4 flex items-start gap-3">
        <i className="ri-lightbulb-line text-rose-400 text-sm mt-0.5 flex-shrink-0"></i>
        <div>
          <p className="text-rose-400/80 text-xs font-semibold mb-1">Cách dùng coupon để theo dõi kênh</p>
          <p className="text-app-text-secondary text-xs leading-relaxed">
            Tạo mã riêng cho từng kênh: <strong className="text-white/60">ZALO20</strong> cho Zalo, <strong className="text-white/60">FB15</strong> cho Facebook, <strong className="text-white/60">VIP30</strong> cho giảm giá VIP.
            Dữ liệu được lưu trực tiếp trên Supabase — không mất khi xóa cache.
          </p>
        </div>
      </div>

      {showForm && (
        <CouponForm
          initial={editingCoupon}
          series={seriesList}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingCoupon(null); }}
        />
      )}

      {recordingCoupon && (
        <RecordUsageModal
          coupon={recordingCoupon}
          onClose={() => setRecordingCoupon(null)}
          onRecord={handleRecordUsage}
        />
      )}
    </AdminLayout>
  );
}
