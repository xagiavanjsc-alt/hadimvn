import { useState, useMemo, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/lib/supabase";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAuth } from "@/hooks/useAuth";

// --- Audit Logger -------------------------------------------------------------
async function logPricingAction(
  actionType: string,
  actionLabel: string,
  actorName: string,
  targetName: string,
  detail: string,
  metadata: Record<string, unknown>
) {
  await supabase.from("admin_audit_logs").insert({
    action_type: actionType,
    action_label: actionLabel,
    actor_name: actorName,
    target_name: targetName,
    detail,
    metadata,
    ip_address: "admin_panel",
  }).maybeSingle();
}

// --- Types --------------------------------------------------------------------
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  isPopular: boolean;
  active: boolean;
  color: string;
  trialDays: number;
  badge?: string;
}

const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Mi?n phí",
    price: 0,
    yearlyPrice: 0,
    description: "H?c co b?n, không gi?i h?n th?i gian",
    features: ["Hangul co b?n", "20 flashcard/ngày", "3 câu EPS/ngày", "5 câu quiz/l?n", "Streak hàng ngày"],
    isPopular: false,
    active: true,
    color: "#6b7280",
    trialDays: 0,
  },
  {
    id: "vip_month",
    name: "VIP Tháng",
    price: 79000,
    yearlyPrice: 0,
    description: "M? khóa toàn b? tính nang, thanh toán hàng tháng",
    features: ["T?t c? tính nang Free", "50+ câu EPS không gi?i h?n", "H?c qua tin t?c Naver th?t", "Ghi âm & so sánh phát âm", "L? trình TOPIK cá nhân hóa", "Toàn b? kho K-pop Lesson", "Xu?t CSV/Anki (50 t?/l?n)", "Không qu?ng cáo"],
    isPopular: false,
    active: true,
    color: "#34d399",
    trialDays: 7,
  },
  {
    id: "vip_year",
    name: "VIP Nam",
    price: 59000,
    yearlyPrice: 708000,
    description: "Ti?t ki?m 25% so v?i gói tháng, xu?t không gi?i h?n",
    features: ["T?t c? tính nang VIP Tháng", "Xu?t CSV/Anki/PDF không gi?i h?n", "Ebook Builder không gi?i h?n", "H? tr? uu tiên qua Zalo", "L?ch s? h?c t?p d?y d?", "Backup d? li?u h?c t?p"],
    isPopular: true,
    active: true,
    color: "app-accent-primary",
    trialDays: 0,
    badge: "Ti?t ki?m 25%",
  },
];

// --- Plan Editor Modal --------------------------------------------------------
function PlanEditorModal({ plan, isNew, onSave, onClose }: {
  plan: PricingPlan; isNew: boolean;
  onSave: (p: PricingPlan) => void;
  onClose: () => void;
}) {
  const [edited, setEdited] = useState<PricingPlan>({ ...plan });
  const [newFeature, setNewFeature] = useState("");

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setEdited(p => ({ ...p, features: [...p.features, newFeature.trim()] }));
    setNewFeature("");
  };
  const removeFeature = (i: number) => setEdited(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }));
  const moveFeature = (i: number, dir: -1 | 1) => {
    const arr = [...edited.features];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setEdited(p => ({ ...p, features: arr }));
  };

  const COLORS = ["#6b7280", "#34d399", "app-accent-primary", "#f87171", "#fb923c", "#a78bfa", "#38bdf8"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10"
          style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${edited.color}20` }}>
              <i className="ri-price-tag-3-line text-sm" style={{ color: edited.color }}></i>
            </div>
            <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>{isNew ? "Thêm gói m?i" : `Ch?nh s?a: ${plan.name}`}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "var(--admin-text-muted)" }}>
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold tracking-normal mb-1.5 block" style={{ color: "var(--admin-text-faint)" }}>Tên gói *</label>
              <input type="text" value={edited.name} onChange={e => setEdited(p => ({ ...p, name: e.target.value }))}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-normal mb-1.5 block" style={{ color: "var(--admin-text-faint)" }}>Badge (tùy ch?n)</label>
              <input type="text" value={edited.badge || ""} onChange={e => setEdited(p => ({ ...p, badge: e.target.value }))}
                placeholder="VD: Ti?t ki?m 25%"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold tracking-normal mb-1.5 block" style={{ color: "var(--admin-text-faint)" }}>Mô t?</label>
            <input type="text" value={edited.description} onChange={e => setEdited(p => ({ ...p, description: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
              style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold tracking-normal mb-1.5 block" style={{ color: "var(--admin-text-faint)" }}>Giá/tháng (VNÐ)</label>
              <input type="number" min={0} value={edited.price} onChange={e => setEdited(p => ({ ...p, price: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-normal mb-1.5 block" style={{ color: "var(--admin-text-faint)" }}>Giá nam (VNÐ)</label>
              <input type="number" min={0} value={edited.yearlyPrice} onChange={e => setEdited(p => ({ ...p, yearlyPrice: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-normal mb-1.5 block" style={{ color: "var(--admin-text-faint)" }}>Ngày dùng th?</label>
              <input type="number" min={0} value={edited.trialDays} onChange={e => setEdited(p => ({ ...p, trialDays: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-[10px] font-semibold tracking-normal mb-2 block" style={{ color: "var(--admin-text-faint)" }}>Màu s?c</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => setEdited(p => ({ ...p, color: c }))}
                  className="w-7 h-7 rounded-full cursor-pointer transition-all"
                  style={{ backgroundColor: c, outline: edited.color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }} />
              ))}
              <input type="color" value={edited.color} onChange={e => setEdited(p => ({ ...p, color: e.target.value }))}
                className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent" title="Màu tùy ch?nh" />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="text-[10px] font-semibold tracking-normal mb-2 block" style={{ color: "var(--admin-text-faint)" }}>Tính nang ({edited.features.length})</label>
            <div className="space-y-1.5 mb-2 max-h-48 overflow-y-auto">
              {edited.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
                  <i className="ri-check-line text-xs flex-shrink-0" style={{ color: edited.color }}></i>
                  <span className="text-xs flex-1" style={{ color: "var(--admin-text-muted)" }}>{f}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveFeature(i, -1)} disabled={i === 0} className="w-5 h-5 flex items-center justify-center cursor-pointer disabled:opacity-30" style={{ color: "var(--admin-text-faint)" }}>
                      <i className="ri-arrow-up-s-line text-xs"></i>
                    </button>
                    <button onClick={() => moveFeature(i, 1)} disabled={i === edited.features.length - 1} className="w-5 h-5 flex items-center justify-center cursor-pointer disabled:opacity-30" style={{ color: "var(--admin-text-faint)" }}>
                      <i className="ri-arrow-down-s-line text-xs"></i>
                    </button>
                    <button onClick={() => removeFeature(i)} className="w-5 h-5 flex items-center justify-center cursor-pointer" style={{ color: "var(--admin-text-faint)" }}>
                      <i className="ri-close-line text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newFeature} onChange={e => setNewFeature(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addFeature()}
                placeholder="Thêm tính nang m?i... (Enter)"
                className="flex-1 rounded-xl px-3 py-2 text-xs outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
              <button onClick={addFeature} className="px-3 py-2 rounded-xl text-xs cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: `${edited.color}15`, color: edited.color, border: `1px solid ${edited.color}30` }}>
                <i className="ri-add-line"></i>
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={edited.isPopular} onChange={e => setEdited(p => ({ ...p, isPopular: e.target.checked }))} className="w-4 h-4 rounded accent-rose-500" />
              <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Ðánh d?u "Ph? bi?n nh?t"</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={edited.active} onChange={e => setEdited(p => ({ ...p, active: e.target.checked }))} className="w-4 h-4 rounded accent-rose-500" />
              <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Hi?n th? gói này</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t sticky bottom-0"
          style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap"
            style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>H?y</button>
          <button onClick={() => onSave(edited)} disabled={!edited.name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap disabled:opacity-40 text-black"
            style={{ backgroundColor: edited.color }}>
            {isNew ? "Thêm gói" : "Luu thay d?i"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Plan Card ----------------------------------------------------------------
function PlanCard({ plan, onEdit, onDelete, onToggle, userCount }: {
  plan: PricingPlan; userCount: number;
  onEdit: () => void; onDelete: () => void; onToggle: () => void;
}) {
  const savings = plan.yearlyPrice > 0 && plan.price > 0
    ? Math.round((1 - plan.yearlyPrice / (plan.price * 12)) * 100)
    : 0;

  return (
    <div className={`relative rounded-2xl border overflow-hidden transition-all ${!plan.active ? "opacity-50" : ""}`}
      style={{ backgroundColor: "var(--admin-card)", borderColor: plan.isPopular ? `${plan.color}40` : "var(--admin-border)" }}>
      {plan.isPopular && (
        <div className="absolute top-0 right-0 text-[10px] font-bold px-3 py-1 rounded-bl-xl text-black" style={{ backgroundColor: plan.color }}>
          PH? BI?N NH?T
        </div>
      )}
      {plan.badge && !plan.isPopular && (
        <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${plan.color}20`, color: plan.color, border: `1px solid ${plan.color}30` }}>
          {plan.badge}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${plan.color}20` }}>
                <i className="ri-vip-crown-line text-xs" style={{ color: plan.color }}></i>
              </div>
              <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>{plan.name}</p>
            </div>
            <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{plan.description}</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-end gap-3 mb-4">
          <div>
            <p className="text-[10px] tracking-normal mb-0.5" style={{ color: "var(--admin-text-faint)" }}>Hàng tháng</p>
            <p className="font-bold text-2xl" style={{ color: "var(--admin-text)" }}>
              {plan.price === 0 ? "Mi?n phí" : `${new Intl.NumberFormat("vi-VN").format(plan.price)}d`}
            </p>
          </div>
          {plan.yearlyPrice > 0 && (
            <div className="mb-0.5">
              <p className="text-[10px] tracking-normal mb-0.5" style={{ color: "var(--admin-text-faint)" }}>Hàng nam</p>
              <p className="font-semibold text-base" style={{ color: "var(--admin-text-muted)" }}>
                {new Intl.NumberFormat("vi-VN").format(plan.yearlyPrice)}d/nam
              </p>
            </div>
          )}
          {savings > 0 && (
            <span className="mb-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${plan.color}15`, color: plan.color }}>
              -{savings}%
            </span>
          )}
          {plan.trialDays > 0 && (
            <span className="mb-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
              {plan.trialDays}d th?
            </span>
          )}
        </div>

        {/* Features preview */}
        <div className="space-y-1 mb-4">
          {plan.features.slice(0, 4).map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <i className="ri-check-line text-xs flex-shrink-0" style={{ color: plan.color }}></i>
              <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{f}</span>
            </div>
          ))}
          {plan.features.length > 4 && (
            <p className="text-xs pl-5" style={{ color: "var(--admin-text-faint)" }}>+{plan.features.length - 4} tính nang khác</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 py-3 border-t mb-3" style={{ borderColor: "var(--admin-border)" }}>
          <div className="flex items-center gap-1.5">
            <i className="ri-user-line text-xs" style={{ color: "var(--admin-text-faint)" }}></i>
            <span className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>{userCount} thành viên</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <div className={`w-2 h-2 rounded-full ${plan.active ? "bg-emerald-400" : "bg-gray-500"}`}></div>
            <span className="text-xs" style={{ color: "var(--admin-text-faint)" }}>{plan.active ? "Ðang hi?n th?" : "Ðã ?n"}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
            <i className="ri-edit-line"></i>Ch?nh s?a
          </button>
          <button onClick={onToggle} className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: plan.active ? "rgba(251,146,60,0.10)" : "rgba(52,211,153,0.10)", color: plan.active ? "#fb923c" : "#34d399", border: `1px solid ${plan.active ? "rgba(251,146,60,0.20)" : "rgba(52,211,153,0.20)"}` }}>
            <i className={plan.active ? "ri-eye-off-line" : "ri-eye-line"}></i>
          </button>
          {plan.id !== "free" && (
            <button onClick={onDelete} className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: "rgba(244,63,94,0.08)", color: "#f87171", border: "1px solid rgba(244,63,94,0.15)" }}>
              <i className="ri-delete-bin-line"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Revenue Analytics --------------------------------------------------------
function RevenueAnalytics({ users }: { users: ReturnType<typeof useAdminUsers>["users"] }) {
  const vipMonthUsers = users.filter(u => {
    if (!u.is_vip || !u.vip_expires_at) return false;
    const d = Math.floor((new Date(u.vip_expires_at).getTime() - Date.now()) / 86400000);
    return d <= 30;
  });
  const vipYearUsers = users.filter(u => {
    if (!u.is_vip || !u.vip_expires_at) return false;
    const d = Math.floor((new Date(u.vip_expires_at).getTime() - Date.now()) / 86400000);
    return d > 30;
  });
  const freeUsers = users.filter(u => !u.is_vip);

  const mrrMonth = vipMonthUsers.length * 79000;
  const mrrYear = vipYearUsers.length * (708000 / 12);
  const mrr = mrrMonth + mrrYear;
  const arr = mrr * 12;

  const expiringSoon = users.filter(u => {
    if (!u.is_vip || !u.vip_expires_at) return false;
    const d = Math.floor((new Date(u.vip_expires_at).getTime() - Date.now()) / 86400000);
    return d >= 0 && d <= 30;
  });

  const churnRisk = expiringSoon.length;
  const conversionRate = users.length > 0 ? ((vipMonthUsers.length + vipYearUsers.length) / users.length * 100).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      {/* MRR/ARR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "MRR (u?c tính)", value: `${new Intl.NumberFormat("vi-VN").format(Math.round(mrr))}d`, icon: "ri-money-dollar-circle-line", color: "#34d399", sub: "Doanh thu tháng" },
          { label: "ARR (u?c tính)", value: `${new Intl.NumberFormat("vi-VN").format(Math.round(arr))}d`, icon: "ri-bar-chart-grouped-line", color: "app-accent-primary", sub: "Doanh thu nam" },
          { label: "T? l? chuy?n d?i", value: `${conversionRate}%`, icon: "ri-percent-line", color: "#a78bfa", sub: "Free ? VIP" },
          { label: "Nguy co churn", value: churnRisk, icon: "ri-alarm-warning-line", color: "#f87171", sub: "H?t h?n trong 30 ngày" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-base leading-none" style={{ color: "var(--admin-text)" }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
              <p className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Distribution */}
      <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        <p className="text-sm font-semibold mb-4" style={{ color: "var(--admin-text)" }}>Phân b? thành viên</p>
        <div className="space-y-3">
          {[
            { label: "Free", count: freeUsers.length, color: "#6b7280", pct: users.length > 0 ? freeUsers.length / users.length * 100 : 0 },
            { label: "VIP Tháng", count: vipMonthUsers.length, color: "#34d399", pct: users.length > 0 ? vipMonthUsers.length / users.length * 100 : 0 },
            { label: "VIP Nam", count: vipYearUsers.length, color: "app-accent-primary", pct: users.length > 0 ? vipYearUsers.length / users.length * 100 : 0 },
          ].map(row => (
            <div key={row.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }}></div>
                  <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{row.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: "var(--admin-text)" }}>{row.count}</span>
                  <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{row.pct.toFixed(1)}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--admin-hover)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expiring soon table */}
      {expiringSoon.length > 0 && (
        <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>VIP s?p h?t h?n (30 ngày)</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-bold">{expiringSoon.length} ngu?i</span>
          </div>
          <div className="space-y-2">
            {expiringSoon.slice(0, 8).map(u => {
              const d = Math.floor((new Date(u.vip_expires_at!).getTime() - Date.now()) / 86400000);
              return (
                <div key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0" style={{ backgroundColor: "var(--admin-hover)" }}>
                    {u.avatar_url ? <img src={u.avatar_url} alt={u.display_name} className="w-full h-full object-cover" /> : <i className="ri-user-line text-xs" style={{ color: "var(--admin-text-faint)" }}></i>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "var(--admin-text)" }}>{u.display_name}</p>
                    <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>H?t h?n: {new Date(u.vip_expires_at!).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${d <= 7 ? "bg-rose-500/15 text-rose-400" : "bg-amber-500/15 text-amber-400"}`}>
                    {d <= 0 ? "Ðã h?t" : `${d}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------
export default function AdminPricingPage() {
  const [plans, setPlans] = useLocalStorage<PricingPlan[]>("kts_pricing_plans_v2", DEFAULT_PLANS);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [isNewPlan, setIsNewPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<"plans" | "analytics" | "scheduler">("plans");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [schedulerRunning, setSchedulerRunning] = useState(false);
  const [schedulerResult, setSchedulerResult] = useState<Record<string, unknown> | null>(null);
  const { users } = useAdminUsers();
  const { profile } = useAuth();

  const actorName = profile?.display_name || "Admin";

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSavePlan = useCallback(async (plan: PricingPlan) => {
    if (isNewPlan) {
      const newPlan = { ...plan, id: `plan_${Date.now()}` };
      setPlans(prev => [...prev, newPlan]);
      showToast("Ðã thêm gói m?i!");
      await logPricingAction(
        "plan_created", "Thêm gói VIP m?i", actorName, plan.name,
        `Thêm gói "${plan.name}" — ${plan.price.toLocaleString()}d/tháng`,
        { plan_id: newPlan.id, price: plan.price, yearly_price: plan.yearlyPrice, color: plan.color }
      );
    } else {
      const oldPlan = plans.find(p => p.id === plan.id);
      setPlans(prev => prev.map(p => p.id === plan.id ? plan : p));
      showToast("Ðã c?p nh?t gói!");
      await logPricingAction(
        "plan_updated", "C?p nh?t gói VIP", actorName, plan.name,
        `C?p nh?t gói "${plan.name}" — giá: ${oldPlan?.price?.toLocaleString()}d ? ${plan.price.toLocaleString()}d`,
        { plan_id: plan.id, old_price: oldPlan?.price, new_price: plan.price, changes: { name: plan.name, color: plan.color } }
      );
    }
    setEditingPlan(null);
    setIsNewPlan(false);
  }, [isNewPlan, plans, actorName]);

  const handleDeletePlan = useCallback(async (id: string) => {
    const plan = plans.find(p => p.id === id);
    setPlans(prev => prev.filter(p => p.id !== id));
    showToast("Ðã xóa gói!");
    if (plan) {
      await logPricingAction(
        "plan_deleted", "Xóa gói VIP", actorName, plan.name,
        `Xóa gói "${plan.name}" (${plan.price.toLocaleString()}d/tháng)`,
        { plan_id: id, plan_name: plan.name, price: plan.price }
      );
    }
  }, [plans, actorName]);

  const handleTogglePlan = useCallback(async (id: string) => {
    const plan = plans.find(p => p.id === id);
    setPlans(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    showToast(plan?.active ? "Ðã ?n gói!" : "Ðã hi?n gói!");
    if (plan) {
      await logPricingAction(
        plan.active ? "plan_hidden" : "plan_shown",
        plan.active ? "?n gói VIP" : "Hi?n gói VIP",
        actorName, plan.name,
        `${plan.active ? "?n" : "Hi?n"} gói "${plan.name}" trên trang pricing`,
        { plan_id: id, plan_name: plan.name, new_status: !plan.active }
      );
    }
  }, [plans, actorName]);

  const handleRunScheduler = async () => {
    setSchedulerRunning(true);
    setSchedulerResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("vip-expiry-scheduler", { body: {} });
      if (error) throw error;
      setSchedulerResult(data as Record<string, unknown>);
      showToast(`Scheduler ch?y xong: ${(data as Record<string, unknown>)?.sent || 0} email dã g?i`);
    } catch (err) {
      showToast("L?i khi ch?y scheduler!", "err");
      setSchedulerResult({ error: String(err) });
    } finally {
      setSchedulerRunning(false);
    }
  };

  const getUserCountForPlan = (planId: string) => {
    if (planId === "free") return users.filter(u => !u.is_vip).length;
    if (planId === "vip_month") return users.filter(u => {
      if (!u.is_vip || !u.vip_expires_at) return false;
      return Math.floor((new Date(u.vip_expires_at).getTime() - Date.now()) / 86400000) <= 30;
    }).length;
    if (planId === "vip_year") return users.filter(u => {
      if (!u.is_vip || !u.vip_expires_at) return false;
      return Math.floor((new Date(u.vip_expires_at).getTime() - Date.now()) / 86400000) > 30;
    }).length;
    return 0;
  };

  return (
    <AdminLayout
      title="Qu?n lý Gói VIP & Pricing"
      subtitle="C?u hình gói, phân tích doanh thu và theo dõi subscriber"
      actions={
        <div className="flex items-center gap-2">
          <button onClick={() => { setIsNewPlan(true); setEditingPlan({ id: "", name: "", price: 0, yearlyPrice: 0, description: "", features: [], isPopular: false, active: true, color: "#34d399", trialDays: 0 }); }}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap bg-rose-500 hover:bg-rose-400 text-white">
            <i className="ri-add-line"></i>Thêm gói m?i
          </button>
        </div>
      }
    >
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium text-white ${toast.type === "err" ? "bg-rose-600" : "bg-emerald-600"}`}>
          <i className={`${toast.type === "err" ? "ri-error-warning-line" : "ri-checkbox-circle-line"} mr-2`}></i>{toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl p-1 w-fit mb-5" style={{ backgroundColor: "var(--admin-hover)" }}>
        {([
          { id: "plans" as const, label: "C?u hình gói", icon: "ri-price-tag-3-line" },
          { id: "analytics" as const, label: "Phân tích doanh thu", icon: "ri-bar-chart-line" },
          { id: "scheduler" as const, label: "Email Scheduler", icon: "ri-timer-line" },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: activeTab === tab.id ? "var(--admin-card)" : "transparent", color: activeTab === tab.id ? "var(--admin-text)" : "var(--admin-text-muted)", border: activeTab === tab.id ? "1px solid var(--admin-border)" : "1px solid transparent" }}>
            <i className={tab.icon}></i>{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "plans" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan}
              userCount={getUserCountForPlan(plan.id)}
              onEdit={() => { setIsNewPlan(false); setEditingPlan(plan); }}
              onDelete={() => handleDeletePlan(plan.id)}
              onToggle={() => handleTogglePlan(plan.id)}
            />
          ))}
        </div>
      )}

      {activeTab === "analytics" && <RevenueAnalytics users={users} />}

      {activeTab === "scheduler" && (
        <div className="space-y-5">
          {/* Info card */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(168,139,250,0.15)" }}>
                <i className="ri-timer-line text-xl" style={{ color: "#a78bfa" }}></i>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1" style={{ color: "var(--admin-text)" }}>VIP Expiry Email Scheduler</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--admin-text-muted)" }}>
                  Edge Function t? d?ng g?i email nh?c gia h?n VIP d?n các thành viên s?p h?t h?n.
                  G?i vào các m?c: <strong>7 ngày</strong>, <strong>3 ngày</strong>, và <strong>1 ngày</strong> tru?c khi h?t h?n.
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-[10px] px-2 py-1 rounded-full font-semibold bg-app-accent-success/15 text-app-accent-success">? Ðã deploy</span>
                  <span className="text-[10px] px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: "rgba(168,139,250,0.15)", color: "#a78bfa" }}>Resend API</span>
                  <span className="text-[10px] px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: "rgba(52,211,153,0.15)", color: "#34d399" }}>Audit Log t? d?ng</span>
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <p className="font-semibold text-sm mb-4" style={{ color: "var(--admin-text)" }}>Cách ho?t d?ng</p>
            <div className="space-y-3">
              {[
                { step: "1", title: "Cron Job kích ho?t", desc: "Supabase cron job g?i edge function m?i ngày lúc 8:00 sáng", color: "#a78bfa" },
                { step: "2", title: "Quét VIP s?p h?t h?n", desc: "Tìm t?t c? VIP h?t h?n trong 1, 3, 7 ngày t?i", color: "#34d399" },
                { step: "3", title: "G?i email cá nhân hóa", desc: "Email có tên, s? ngày còn l?i, màu s?c theo m?c d? kh?n c?p", color: "app-accent-primary" },
                { step: "4", title: "Ghi Audit Log", desc: "M?i email g?i du?c ghi vào admin_audit_logs d? theo dõi", color: "#fb923c" },
                { step: "5", title: "Tránh g?i trùng", desc: "Ki?m tra audit log d? không g?i 2 l?n trong 24 gi?", color: "#f87171" },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ backgroundColor: s.color }}>{s.step}</div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--admin-text)" }}>{s.title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Setup cron */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <p className="font-semibold text-sm mb-3" style={{ color: "var(--admin-text)" }}>Cài d?t Cron Job (Supabase Dashboard)</p>
            <p className="text-xs mb-3" style={{ color: "var(--admin-text-muted)" }}>Vào Supabase Dashboard ? Database ? Extensions ? pg_cron, sau dó ch?y SQL:</p>
            <div className="rounded-xl p-4 font-mono text-xs overflow-x-auto" style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)", color: "#34d399" }}>
              <pre>{`SELECT cron.schedule(
  'vip-expiry-daily',
  '0 1 * * *',  -- 8:00 AM Vietnam (UTC+7 = 01:00 UTC)
  $$
  SELECT net.http_post(
    url := 'https://dcjofhkdrgbrowabudyt.supabase.co/functions/v1/vip-expiry-scheduler',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);`}</pre>
            </div>
          </div>

          {/* Manual trigger */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <p className="font-semibold text-sm mb-2" style={{ color: "var(--admin-text)" }}>Ch?y th? công ngay bây gi?</p>
            <p className="text-xs mb-4" style={{ color: "var(--admin-text-muted)" }}>Kích ho?t scheduler ngay d? ki?m tra ho?c g?i email kh?n c?p.</p>
            <button onClick={handleRunScheduler} disabled={schedulerRunning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap disabled:opacity-50 text-white"
              style={{ backgroundColor: "#a78bfa" }}>
              {schedulerRunning ? (
                <><i className="ri-loader-4-line animate-spin"></i>Ðang ch?y...</>
              ) : (
                <><i className="ri-play-circle-line"></i>Ch?y Scheduler ngay</>
              )}
            </button>

            {schedulerResult && (
              <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--admin-text)" }}>K?t qu?:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {[
                    { label: "Ki?m tra", key: "checked", color: "#a78bfa" },
                    { label: "Ðã g?i", key: "sent", color: "#34d399" },
                    { label: "L?i", key: "failed", color: "#f87171" },
                    { label: "B? qua", key: "skipped", color: "#6b7280" },
                  ].map(s => (
                    <div key={s.key} className="text-center">
                      <p className="text-xl font-black" style={{ color: s.color }}>{String(schedulerResult[s.key] ?? 0)}</p>
                      <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                {Array.isArray(schedulerResult.details) && schedulerResult.details.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {(schedulerResult.details as string[]).map((d, i) => (
                      <p key={i} className="text-[10px]" style={{ color: d.startsWith("?") ? "#34d399" : d.startsWith("?") ? "#f87171" : "var(--admin-text-faint)" }}>{d}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {editingPlan && (
        <PlanEditorModal plan={editingPlan} isNew={isNewPlan}
          onSave={handleSavePlan}
          onClose={() => { setEditingPlan(null); setIsNewPlan(false); }} />
      )}
    </AdminLayout>
  );
}


