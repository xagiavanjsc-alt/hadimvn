import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";
import type { EbookSeries } from "@/pages/series/page";

interface RevenueEntry {
  id: string;
  seriesId: string;
  buyerName: string;
  amount: number;
  date: string;
  note?: string;
}

function StatCard({ icon, label, value, sub, color, onClick }: {
  icon: string; label: string; value: string | number; sub?: string; color: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-app-bg border border-app-border rounded-2xl p-5 ${onClick ? "cursor-pointer hover:border-app-border transition-all" : ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <i className={`${icon} text-base`} style={{ color }}></i>
        </div>
      </div>
      <p className="text-white text-2xl font-bold">{value}</p>
      <p className="text-app-text-secondary text-xs mt-1">{label}</p>
      {sub && <p className="text-app-text-muted text-[10px] mt-1">{sub}</p>}
    </div>
  );
}

function AddRevenueModal({ series, onClose, onAdd }: {
  series: EbookSeries[];
  onClose: () => void;
  onAdd: (entry: RevenueEntry) => void;
}) {
  const [seriesId, setSeriesId] = useState(series[0]?.id ?? "");
  const [buyerName, setBuyerName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleAdd = () => {
    if (!buyerName.trim() || !amount) return;
    onAdd({
      id: `rev-${Date.now()}`,
      seriesId,
      buyerName: buyerName.trim(),
      amount: parseFloat(amount),
      date,
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-app-border">
          <div className="flex items-center gap-2">
            <i className="ri-money-dollar-circle-line text-app-accent-success text-sm"></i>
            <p className="text-white font-semibold text-sm">Ghi nhận doanh thu</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-app-text-muted hover:text-white/70 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Series ebook</label>
            <select
              value={seriesId}
              onChange={e => setSeriesId(e.target.value)}
              className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400/40 transition-colors cursor-pointer"
            >
              {series.map(s => (
                <option key={s.id} value={s.id} className="bg-app-bg">{s.name}</option>
              ))}
              <option value="" className="bg-app-bg">Khác (không thuộc series)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Tên người mua *</label>
              <input
                type="text"
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-400/40 transition-colors"
              />
            </div>
            <div>
              <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Số tiền (VNĐ) *</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="49000"
                className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-400/40 transition-colors"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Ngày bán</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400/40 transition-colors"
              />
            </div>
            <div>
              <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Ghi chú</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Zalo, chuyển khoản..."
                className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-400/40 transition-colors"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-app-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-app-border text-white/50 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap">Hủy</button>
          <button
            onClick={handleAdd}
            disabled={!buyerName.trim() || !amount}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            Ghi nhận
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StatsPage() {
  const navigate = useNavigate();
  const [approvedLessons] = useLocalStorage<ApprovedLesson[]>("kts_melon_lessons", []);
  const [seriesList] = useLocalStorage<EbookSeries[]>("kts_series_list", []);
  const [revenues, setRevenues] = useLocalStorage<RevenueEntry[]>("kts_revenues", []);
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [filterSeries, setFilterSeries] = useState("all");

  const stats = useMemo(() => {
    const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0);
    const thisMonth = new Date();
    const monthRevenue = revenues.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear();
    }).reduce((s, r) => s + r.amount, 0);

    const bySeriesMap: Record<string, { name: string; count: number; revenue: number }> = {};
    revenues.forEach(r => {
      const s = seriesList.find(s => s.id === r.seriesId);
      const name = s?.name ?? "Khác";
      if (!bySeriesMap[r.seriesId]) bySeriesMap[r.seriesId] = { name, count: 0, revenue: 0 };
      bySeriesMap[r.seriesId].count += 1;
      bySeriesMap[r.seriesId].revenue += r.amount;
    });

    // Monthly chart — last 6 months
    const monthlyChart: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString("vi-VN", { month: "short" });
      const value = revenues.filter(r => {
        const rd = new Date(r.date);
        return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
      }).reduce((s, r) => s + r.amount, 0);
      monthlyChart.push({ label, value });
    }

    const avgPerSale = revenues.length > 0 ? Math.round(totalRevenue / revenues.length) : 0;
    const projectedMonthly = revenues.length > 0 ? Math.round(monthRevenue * (30 / new Date().getDate())) : 0;

    return { totalRevenue, monthRevenue, bySeriesMap, monthlyChart, avgPerSale, projectedMonthly };
  }, [revenues, seriesList]);

  const filteredRevenues = useMemo(() => {
    const sorted = [...revenues].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (filterSeries === "all") return sorted;
    return sorted.filter(r => r.seriesId === filterSeries);
  }, [revenues, filterSeries]);

  const formatVND = (n: number) => n.toLocaleString("vi-VN") + "đ";
  const maxChart = Math.max(...stats.monthlyChart.map(m => m.value), 1);

  return (
    <DashboardLayout
      title="Thống kê & Doanh thu"
      subtitle="Theo dõi hiệu quả kinh doanh ebook"
      actions={
        <button
          onClick={() => setShowAddRevenue(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line"></i>
          Ghi nhận doanh thu
        </button>
      }
    >
      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon="ri-money-dollar-circle-line" label="Tổng doanh thu" value={formatVND(stats.totalRevenue)} sub={`${revenues.length} đơn hàng`} color="#34d399" />
        <StatCard icon="ri-calendar-line" label="Tháng này" value={formatVND(stats.monthRevenue)} sub={`Dự kiến: ${formatVND(stats.projectedMonthly)}`} color="app-accent-primary" />
        <StatCard icon="ri-stack-line" label="Tổng series" value={seriesList.length} sub="ebook đang bán" color="#fb923c" onClick={() => navigate("/series")} />
        <StatCard icon="ri-book-open-line" label="Bài học sẵn sàng" value={approvedLessons.filter(l => (l.stars ?? 0) >= 4).length} sub="4-5 sao" color="#a78bfa" onClick={() => navigate("/ebook")} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
        {/* Revenue chart */}
        <div className="col-span-2 bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold text-sm">Doanh thu 6 tháng</h3>
              <p className="text-app-text-muted text-xs mt-0.5">Theo tháng (VNĐ)</p>
            </div>
            <span className="text-app-accent-success text-xs font-bold bg-emerald-500/10 px-3 py-1 rounded-full">
              TB/đơn: {formatVND(stats.avgPerSale)}
            </span>
          </div>
          {revenues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <i className="ri-bar-chart-2-line text-white/10 text-4xl mb-3"></i>
              <p className="text-app-text-muted text-sm mb-1">Chưa có doanh thu nào</p>
              <p className="text-white/15 text-xs">Nhấn "Ghi nhận doanh thu" để bắt đầu theo dõi</p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-3 h-32 mb-3">
                {stats.monthlyChart.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                    <div
                      className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${Math.max((m.value / maxChart) * 112, m.value > 0 ? 6 : 2)}px`,
                        backgroundColor: m.value > 0 ? "#34d399" : "rgba(255,255,255,0.05)",
                      }}
                    />
                    {m.value > 0 && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#1a1d27] border border-app-border text-white/70 text-[9px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {formatVND(m.value)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                {stats.monthlyChart.map((m, i) => (
                  <div key={i} className="flex-1 text-center">
                    <span className="text-app-text-muted text-[10px]">{m.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* By series */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1">Theo series</h3>
          <p className="text-app-text-muted text-xs mb-4">Doanh thu từng ebook</p>
          {Object.keys(stats.bySeriesMap).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <i className="ri-pie-chart-line text-white/10 text-3xl mb-2"></i>
              <p className="text-app-text-muted text-xs">Chưa có dữ liệu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.bySeriesMap)
                .sort((a, b) => b[1].revenue - a[1].revenue)
                .map(([id, data]) => {
                  const pct = stats.totalRevenue > 0 ? Math.round((data.revenue / stats.totalRevenue) * 100) : 0;
                  const s = seriesList.find(s => s.id === id);
                  return (
                    <div key={id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/60 text-xs font-medium truncate max-w-[120px]">{data.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-app-text-muted text-[10px]">{data.count} đơn</span>
                          <span className="text-app-accent-success text-xs font-bold">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: s?.coverAccent ?? "#34d399" }} />
                      </div>
                      <p className="text-app-text-muted text-[10px] mt-0.5">{formatVND(data.revenue)}</p>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-sm">Lịch sử giao dịch</h3>
            <p className="text-app-text-muted text-xs mt-0.5">{revenues.length} đơn hàng</p>
          </div>
          <select
            value={filterSeries}
            onChange={e => setFilterSeries(e.target.value)}
            className="bg-app-card/50 border border-app-border rounded-lg px-3 py-1.5 text-white/60 text-xs focus:outline-none focus:border-white/20 cursor-pointer"
          >
            <option value="all" className="bg-app-bg">Tất cả series</option>
            {seriesList.map(s => (
              <option key={s.id} value={s.id} className="bg-app-bg">{s.name}</option>
            ))}
          </select>
        </div>

        {filteredRevenues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <i className="ri-receipt-line text-white/10 text-3xl mb-3"></i>
            <p className="text-app-text-muted text-sm">Chưa có giao dịch nào</p>
            <button
              onClick={() => setShowAddRevenue(true)}
              className="mt-4 flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-app-accent-success text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line"></i>
              Ghi nhận đơn đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRevenues.map(r => {
              const s = seriesList.find(s => s.id === r.seriesId);
              return (
                <div key={r.id} className="flex items-center gap-4 px-4 py-3 bg-app-surface/50 rounded-xl border border-app-border hover:border-app-border transition-colors group">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s?.coverAccent ?? "#34d399"}15` }}>
                    <i className="ri-book-2-line text-sm" style={{ color: s?.coverAccent ?? "#34d399" }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-xs font-semibold">{r.buyerName}</p>
                    <p className="text-app-text-muted text-[10px]">{s?.name ?? "Khác"}{r.note ? ` · ${r.note}` : ""}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-app-accent-success text-sm font-bold">{formatVND(r.amount)}</p>
                    <p className="text-app-text-muted text-[10px]">{new Date(r.date).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <button
                    onClick={() => setRevenues(prev => prev.filter(x => x.id !== r.id))}
                    className="w-6 h-6 flex items-center justify-center text-white/15 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <i className="ri-delete-bin-line text-xs"></i>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-5 bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4 flex items-start gap-3">
        <i className="ri-lightbulb-line text-app-accent-primary text-sm mt-0.5 flex-shrink-0"></i>
        <div>
          <p className="text-app-accent-primary/80 text-xs font-semibold mb-1">Chiến lược bán ebook hiệu quả</p>
          <p className="text-app-text-secondary text-xs leading-relaxed">
            Bán qua <strong className="text-white/60">Zalo OA</strong> (miễn phí, tiếp cận học viên cũ) · 
            <strong className="text-white/60"> Gumroad</strong> (thanh toán quốc tế, tự động giao file) · 
            <strong className="text-white/60"> Facebook Group</strong> (viral trong cộng đồng K-pop). 
            Giá lý tưởng: 29.000đ–79.000đ/ebook, bundle 3 ebook giảm 20%.
          </p>
        </div>
      </div>

      {showAddRevenue && (
        <AddRevenueModal
          series={seriesList}
          onClose={() => setShowAddRevenue(false)}
          onAdd={entry => {
            setRevenues(prev => [...prev, entry]);
            setShowAddRevenue(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}


