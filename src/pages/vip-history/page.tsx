import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface VipTransaction {
  id: string;
  vip_type: "month" | "year";
  amount: number;
  granted_at: string;
  expires_at: string;
  note: string;
  granted_by: string | null;
}

function StatusBadge({ expiresAt }: { expiresAt: string }) {
  const now = new Date();
  const exp = new Date(expiresAt);
  const daysLeft = Math.floor((exp.getTime() - now.getTime()) / 86400000);

  if (daysLeft < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/30">
        <i className="ri-time-line" />
        Đã hết hạn
      </span>
    );
  }
  if (daysLeft <= 7) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400">
        <i className="ri-alarm-warning-line" />
        Còn {daysLeft} ngày
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
      <i className="ri-checkbox-circle-line" />
      Đang hoạt động
    </span>
  );
}

function EmptyState({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-[#e8c84a]/8 border border-[#e8c84a]/15 mb-5">
        <i className="ri-vip-crown-line text-[#e8c84a] text-4xl" />
      </div>
      <p className="text-white font-bold text-base mb-2">Chưa có giao dịch VIP nào</p>
      <p className="text-white/35 text-sm mb-6 max-w-xs leading-relaxed">
        Nâng cấp lên VIP để mở khóa toàn bộ tính năng học tiếng Hàn cao cấp
      </p>
      <button
        onClick={onUpgrade}
        className="flex items-center gap-2 bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm px-6 py-3 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
      >
        <i className="ri-vip-crown-line" />
        Nâng cấp VIP ngay
      </button>
    </div>
  );
}

export default function VipHistoryPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<VipTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<VipTransaction | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("vip_revenue_log")
          .select("*")
          .eq("user_id", user.id)
          .order("granted_at", { ascending: false });
        if (data) setTransactions(data as VipTransaction[]);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const formatDateShort = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const formatVND = (n: number) =>
    new Intl.NumberFormat("vi-VN").format(n) + "đ";

  const totalSpent = transactions.reduce((s, t) => s + (t.amount || 0), 0);
  const activeCount = transactions.filter(t => new Date(t.expires_at) > new Date()).length;

  if (!user) {
    return (
      <DashboardLayout title="Lịch sử VIP" subtitle="Xem lại các lần nâng cấp VIP của bạn">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/5 mb-4">
            <i className="ri-lock-line text-white/20 text-3xl" />
          </div>
          <p className="text-white/40 text-base font-medium mb-2">Cần đăng nhập</p>
          <button onClick={() => navigate("/profile")} className="flex items-center gap-2 bg-[#e8c84a] text-[#0f1117] font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap">
            <i className="ri-user-line" />Đến trang hồ sơ
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Lịch sử giao dịch VIP"
      subtitle="Xem lại toàn bộ các lần nâng cấp và gia hạn VIP của bạn"
      actions={
        <button
          onClick={() => navigate("/pricing")}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] cursor-pointer whitespace-nowrap transition-colors"
        >
          <i className="ri-vip-crown-line" />
          Gia hạn VIP
        </button>
      }
    >
      {/* VIP Status Banner */}
      {profile?.is_vip && profile.vip_expires_at && (
        <div className="relative overflow-hidden rounded-2xl mb-6 p-5"
          style={{ background: "linear-gradient(135deg, #1a1600 0%, #2a2000 100%)" }}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #e8c84a 0%, transparent 60%)" }} />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#e8c84a]/15 flex-shrink-0">
              <i className="ri-vip-crown-fill text-[#e8c84a] text-2xl" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-bold text-base">Tài khoản VIP đang hoạt động</p>
                <StatusBadge expiresAt={profile.vip_expires_at} />
              </div>
              <p className="text-white/45 text-sm">
                Hết hạn: <span className="text-[#e8c84a] font-semibold">{formatDateShort(profile.vip_expires_at)}</span>
                {" · "}
                Còn {Math.max(0, Math.floor((new Date(profile.vip_expires_at).getTime() - Date.now()) / 86400000))} ngày
              </p>
            </div>
            <button
              onClick={() => navigate("/pricing")}
              className="flex items-center gap-2 bg-[#e8c84a]/15 hover:bg-[#e8c84a]/25 border border-[#e8c84a]/25 text-[#e8c84a] text-xs font-bold px-4 py-2 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
            >
              <i className="ri-refresh-line" />
              Gia hạn sớm
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: "Tổng giao dịch", value: String(transactions.length), icon: "ri-exchange-line", color: "#e8c84a" },
            { label: "Đang hoạt động", value: String(activeCount), icon: "ri-checkbox-circle-line", color: "#34d399" },
            { label: "Tổng chi tiêu", value: formatVND(totalSpent), icon: "ri-money-dollar-circle-line", color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} className="bg-[#0f1117] border border-white/5 rounded-xl p-4">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg mb-2.5" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-sm`} style={{ color: s.color }} />
              </div>
              <p className="font-bold text-base" style={{ color: s.color }}>{s.value}</p>
              <p className="text-white/35 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Transaction List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#e8c84a]/30 border-t-[#e8c84a] rounded-full animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState onUpgrade={() => navigate("/pricing")} />
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, idx) => {
            const isActive = new Date(tx.expires_at) > new Date();
            const isLatest = idx === 0;
            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="bg-[#0f1117] border rounded-2xl p-4 sm:p-5 cursor-pointer hover:border-[#e8c84a]/20 transition-all group"
                style={{ borderColor: isLatest && isActive ? "rgba(232,200,74,0.2)" : "rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl flex-shrink-0 ${tx.vip_type === "year" ? "bg-[#e8c84a]/12" : "bg-emerald-500/12"}`}>
                    <i className={`${isActive ? "ri-vip-crown-fill" : "ri-vip-crown-line"} text-lg sm:text-xl ${tx.vip_type === "year" ? "text-[#e8c84a]" : "text-emerald-400"}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-white font-semibold text-sm">
                        VIP {tx.vip_type === "year" ? "Năm" : "Tháng"}
                      </p>
                      {isLatest && isActive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#e8c84a]/15 text-[#e8c84a]">
                          HIỆN TẠI
                        </span>
                      )}
                      <StatusBadge expiresAt={tx.expires_at} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                      <p className="text-white/35 text-xs">
                        <i className="ri-calendar-check-line mr-1" />
                        Kích hoạt: {formatDateShort(tx.granted_at)}
                      </p>
                      <p className="text-white/35 text-xs">
                        <i className="ri-calendar-close-line mr-1" />
                        Hết hạn: {formatDateShort(tx.expires_at)}
                      </p>
                    </div>
                    {tx.note && (
                      <p className="text-white/25 text-xs mt-1 truncate">
                        <i className="ri-sticky-note-line mr-1" />
                        {tx.note}
                      </p>
                    )}
                  </div>

                  {/* Amount + arrow */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {tx.amount > 0 && (
                      <span className={`text-sm font-bold ${tx.vip_type === "year" ? "text-[#e8c84a]" : "text-emerald-400"}`}>
                        {formatVND(tx.amount)}
                      </span>
                    )}
                    <i className="ri-arrow-right-s-line text-white/20 group-hover:text-white/40 transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${selectedTx.vip_type === "year" ? "bg-[#e8c84a]/12" : "bg-emerald-500/12"}`}>
                  <i className={`ri-vip-crown-fill text-base ${selectedTx.vip_type === "year" ? "text-[#e8c84a]" : "text-emerald-400"}`} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Chi tiết giao dịch VIP</p>
                  <p className="text-white/35 text-[10px]">ID: {selectedTx.id.slice(0, 8)}...</p>
                </div>
              </div>
              <button onClick={() => setSelectedTx(null)} className="text-white/30 hover:text-white/60 cursor-pointer">
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
              {[
                { label: "Loại gói", value: `VIP ${selectedTx.vip_type === "year" ? "Năm" : "Tháng"}`, icon: "ri-vip-crown-line", color: selectedTx.vip_type === "year" ? "#e8c84a" : "#34d399" },
                { label: "Ngày kích hoạt", value: formatDate(selectedTx.granted_at), icon: "ri-calendar-check-line", color: "#a78bfa" },
                { label: "Ngày hết hạn", value: formatDate(selectedTx.expires_at), icon: "ri-calendar-close-line", color: "#fb923c" },
                { label: "Số tiền", value: selectedTx.amount > 0 ? formatVND(selectedTx.amount) : "Miễn phí / Admin cấp", icon: "ri-money-dollar-circle-line", color: "#34d399" },
                ...(selectedTx.note ? [{ label: "Ghi chú", value: selectedTx.note, icon: "ri-sticky-note-line", color: "#e8c84a" }] : []),
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 px-4 py-3 bg-white/3 rounded-xl">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                    <i className={`${item.icon} text-sm`} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/30 text-[10px]">{item.label}</p>
                    <p className="text-white/80 text-sm font-medium truncate">{item.value}</p>
                  </div>
                </div>
              ))}

              {/* Status */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/3 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5">
                    <i className="ri-shield-check-line text-sm text-white/40" />
                  </div>
                  <div>
                    <p className="text-white/30 text-[10px]">Trạng thái</p>
                    <p className="text-white/80 text-sm font-medium">Trạng thái hiện tại</p>
                  </div>
                </div>
                <StatusBadge expiresAt={selectedTx.expires_at} />
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm cursor-pointer whitespace-nowrap transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
