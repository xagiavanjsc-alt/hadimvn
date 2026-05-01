import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { EbookSeries } from "@/pages/series/page";

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

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const prefix = channel.replace(/\s+/g, "").toUpperCase().slice(0, 4);
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
      seriesId,
      usageCount: initial?.usageCount ?? 0,
      maxUsage: maxUsage ? parseInt(maxUsage) : null,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      note: note.trim() || undefined,
      active: initial?.active ?? true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <i className="ri-coupon-3-line text-[#e8c84a] text-sm"></i>
            <p className="text-white font-semibold text-sm">{initial ? "Chỉnh sửa coupon" : "Tạo coupon mới"}</p>
          </div>
          <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white/70 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Code */}
          <div>
            <label className="text-white/40 text-xs font-medium block mb-1.5">Mã coupon *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="VD: ZALO20"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/40 transition-colors font-mono tracking-widest"
              />
              <button
                onClick={generateCode}
                className="px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/50 text-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-refresh-line"></i>
              </button>
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="text-white/40 text-xs font-medium block mb-1.5">Giảm giá *</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                placeholder="20"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/40 transition-colors"
              />
              <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setDiscountType("percent")}
                  className={`px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${discountType === "percent" ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/70"}`}
                >
                  %
                </button>
                <button
                  onClick={() => setDiscountType("fixed")}
                  className={`px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${discountType === "fixed" ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/70"}`}
                >
                  VNĐ
                </button>
              </div>
            </div>
          </div>

          {/* Channel */}
          <div>
            <label className="text-white/40 text-xs font-medium block mb-1.5">Kênh bán hàng</label>
            <select
              value={channel}
              onChange={e => setChannel(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#e8c84a]/40 transition-colors cursor-pointer"
            >
              {CHANNEL_OPTIONS.map(c => (
                <option key={c} value={c} className="bg-[#0f1117]">{c}</option>
              ))}
            </select>
          </div>

          {/* Series */}
          <div>
            <label className="text-white/40 text-xs font-medium block mb-1.5">Áp dụng cho</label>
            <select
              value={seriesId}
              onChange={e => setSeriesId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#e8c84a]/40 transition-colors cursor-pointer"
            >
              <option value="all" className="bg-[#0f1117]">Tất cả series</option>
              {series.map(s => (
                <option key={s.id} value={s.id} className="bg-[#0f1117]">{s.name}</option>
              ))}
            </select>
          </div>

          {/* Max usage + note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs font-medium block mb-1.5">Giới hạn dùng (để trống = không giới hạn)</label>
              <input
                type="number"
                value={maxUsage}
                onChange={e => setMaxUsage(e.target.value)}
                placeholder="Không giới hạn"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/40 transition-colors"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs font-medium block mb-1.5">Ghi chú</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Chiến dịch tháng 4..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/40 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-white/5">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap">Hủy</button>
          <button
            onClick={handleSave}
            disabled={!code.trim() || !discount}
            className="flex-1 py-2.5 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-[#0f1117] text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
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
      <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <p className="text-white font-semibold text-sm">Ghi nhận sử dụng</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white/70 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="p-5">
          <p className="text-white/50 text-xs mb-4">
            Mã: <span className="text-[#e8c84a] font-mono font-bold">{coupon.code}</span> · Đã dùng: {coupon.usageCount} lần
          </p>
          <div>
            <label className="text-white/40 text-xs font-medium block mb-1.5">Số lần sử dụng thêm</label>
            <input
              type="number"
              min={1}
              value={times}
              onChange={e => setTimes(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#e8c84a]/40 transition-colors"
            />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-white/5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap">Hủy</button>
          <button
            onClick={() => { onRecord(coupon.id, times); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            Ghi nhận
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CouponPage() {
  const [seriesList] = useLocalStorage<EbookSeries[]>("kts_series_list", []);
  const [coupons, setCoupons] = useLocalStorage<Coupon[]>("kts_coupons", []);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [recordingCoupon, setRecordingCoupon] = useState<Coupon | null>(null);
  const [filterChannel, setFilterChannel] = useState("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = (coupon: Coupon) => {
    setCoupons(prev => {
      const exists = prev.find(c => c.id === coupon.id);
      if (exists) return prev.map(c => c.id === coupon.id ? coupon : c);
      return [...prev, coupon];
    });
    setShowForm(false);
    setEditingCoupon(null);
    showToast(editingCoupon ? "Đã cập nhật coupon!" : "Đã tạo coupon mới!");
  };

  const handleToggle = (id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleDelete = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
    showToast("Đã xóa coupon");
  };

  const handleRecordUsage = (id: string, times: number) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, usageCount: c.usageCount + times } : c));
    showToast(`Đã ghi nhận +${times} lần sử dụng`);
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
    if (filterChannel === "all") return coupons;
    return coupons.filter(c => c.channel === filterChannel);
  }, [coupons, filterChannel]);

  // Channel analytics
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

  return (
    <DashboardLayout
      title="Coupon & Mã giảm giá"
      subtitle="Theo dõi kênh bán hàng hiệu quả nhất qua mã coupon"
      actions={
        <button
          onClick={() => { setEditingCoupon(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line"></i>
          Tạo coupon mới
        </button>
      }
    >
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-500 text-white">
          <i className="ri-checkbox-circle-line"></i>
          {toast}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng coupon", value: coupons.length, icon: "ri-coupon-3-line", color: "#e8c84a" },
          { label: "Đang hoạt động", value: coupons.filter(c => c.active).length, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Tổng lượt dùng", value: totalUsage, icon: "ri-user-received-line", color: "#fb923c" },
          { label: "Kênh đang dùng", value: channelStats.length, icon: "ri-broadcast-line", color: "#a78bfa" },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0f1117] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
              <i className={`${stat.icon} text-lg`} style={{ color: stat.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{stat.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
        {/* Channel ranking */}
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1">Kênh hiệu quả nhất</h3>
          <p className="text-white/30 text-xs mb-4">Theo số lần dùng coupon</p>
          {channelStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <i className="ri-bar-chart-line text-white/10 text-3xl mb-2"></i>
              <p className="text-white/20 text-xs">Chưa có dữ liệu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {channelStats.map(([ch, data], i) => {
                const pct = totalUsage > 0 ? Math.round((data.usage / totalUsage) * 100) : 0;
                const colors = ["#e8c84a", "#34d399", "#fb923c", "#a78bfa", "#38bdf8"];
                const color = colors[i % colors.length];
                return (
                  <div key={ch}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold w-4 text-center" style={{ color }}>{i + 1}</span>
                        <span className="text-white/60 text-xs font-medium">{ch}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/30 text-[10px]">{data.usage} lần</span>
                        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coupon list */}
        <div className="col-span-2 bg-[#0f1117] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Danh sách coupon</h3>
              <p className="text-white/30 text-xs mt-0.5">{filtered.length} coupon</p>
            </div>
            <select
              value={filterChannel}
              onChange={e => setFilterChannel(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/60 text-xs focus:outline-none cursor-pointer"
            >
              {channels.map(c => (
                <option key={c} value={c} className="bg-[#0f1117]">{c === "all" ? "Tất cả kênh" : c}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <i className="ri-coupon-3-line text-white/10 text-3xl mb-3"></i>
              <p className="text-white/25 text-sm mb-1">Chưa có coupon nào</p>
              <button
                onClick={() => { setEditingCoupon(null); setShowForm(true); }}
                className="mt-3 flex items-center gap-2 bg-[#e8c84a]/10 hover:bg-[#e8c84a]/20 text-[#e8c84a] text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line"></i>
                Tạo coupon đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filtered.map(coupon => {
                const s = seriesList.find(s => s.id === coupon.seriesId);
                const usagePct = coupon.maxUsage ? Math.round((coupon.usageCount / coupon.maxUsage) * 100) : null;
                return (
                  <div
                    key={coupon.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors group ${
                      coupon.active ? "bg-white/3 border-white/5 hover:border-white/8" : "bg-white/1 border-white/3 opacity-50"
                    }`}
                  >
                    {/* Code */}
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className="flex items-center gap-1.5 cursor-pointer"
                      title="Click để copy"
                    >
                      <span className="font-mono font-bold text-sm text-[#e8c84a] tracking-widest">
                        {coupon.code}
                      </span>
                      <i className={`text-[10px] ${copiedCode === coupon.code ? "ri-check-line text-emerald-400" : "ri-clipboard-line text-white/20"}`}></i>
                    </button>

                    {/* Discount badge */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e8c84a]/10 text-[#e8c84a] whitespace-nowrap">
                      -{coupon.discount}{coupon.discountType === "percent" ? "%" : "k"}
                    </span>

                    {/* Channel */}
                    <span className="text-white/40 text-[10px] flex-1 truncate">{coupon.channel}</span>

                    {/* Series */}
                    <span className="text-white/25 text-[10px] truncate max-w-[80px]">
                      {coupon.seriesId === "all" ? "Tất cả" : (s?.name ?? "?")}
                    </span>

                    {/* Usage */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-white/60 text-xs font-semibold">
                        {coupon.usageCount}{coupon.maxUsage ? `/${coupon.maxUsage}` : ""} lần
                      </p>
                      {usagePct !== null && (
                        <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                          <div className="h-full rounded-full bg-[#e8c84a]" style={{ width: `${Math.min(usagePct, 100)}%` }} />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setRecordingCoupon(coupon)}
                        className="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        title="Ghi nhận sử dụng"
                      >
                        <i className="ri-add-line text-white/40 text-[10px]"></i>
                      </button>
                      <button
                        onClick={() => handleToggle(coupon.id)}
                        className="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        title={coupon.active ? "Tắt coupon" : "Bật coupon"}
                      >
                        <i className={`text-[10px] ${coupon.active ? "ri-pause-line text-white/40" : "ri-play-line text-emerald-400"}`}></i>
                      </button>
                      <button
                        onClick={() => { setEditingCoupon(coupon); setShowForm(true); }}
                        className="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <i className="ri-edit-line text-white/40 text-[10px]"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="w-6 h-6 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                      >
                        <i className="ri-delete-bin-line text-red-400 text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-4 flex items-start gap-3">
        <i className="ri-lightbulb-line text-[#e8c84a] text-sm mt-0.5 flex-shrink-0"></i>
        <div>
          <p className="text-[#e8c84a]/80 text-xs font-semibold mb-1">Cách dùng coupon để theo dõi kênh</p>
          <p className="text-white/40 text-xs leading-relaxed">
            Tạo mã riêng cho từng kênh: <strong className="text-white/60">ZALO20</strong> cho Zalo, <strong className="text-white/60">FB15</strong> cho Facebook, <strong className="text-white/60">TT10</strong> cho TikTok.
            Khi khách dùng mã → ghi nhận thủ công → biểu đồ tự cập nhật → biết ngay kênh nào hiệu quả nhất!
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
    </DashboardLayout>
  );
}


