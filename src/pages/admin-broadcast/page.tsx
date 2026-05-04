import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

// --- Types --------------------------------------------------------------------
interface BroadcastRecord {
  id: string;
  title: string;
  body: string;
  target: string;
  targetLabel: string;
  sentCount: number;
  successCount: number;
  failCount: number;
  emailType: string;
  sentAt: string;
  status: "sending" | "done" | "failed";
}

interface TargetOption {
  value: string;
  label: string;
  count: number;
  icon: string;
  color: string;
}

const EMAIL_TYPES = [
  { value: "bulk_notification", label: "Thông báo chung", icon: "ri-notification-3-line", color: "#a78bfa" },
  { value: "vip_expiry_reminder", label: "Nh?c gia h?n VIP", icon: "ri-alarm-warning-line", color: "#fb923c" },
  { value: "welcome", label: "Chào m?ng", icon: "ri-hand-heart-line", color: "#34d399" },
];

// --- Progress Modal -----------------------------------------------------------
function SendProgressModal({ total, sent, success, fail, done, onClose }: {
  total: number; sent: number; success: number; fail: number; done: boolean; onClose: () => void;
}) {
  const pct = total > 0 ? Math.round((sent / total) * 100) : 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border p-6"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${done ? "bg-app-accent-success/15" : "bg-rose-500/15"}`}>
            <i className={`text-lg ${done ? "ri-checkbox-circle-line text-app-accent-success" : "ri-send-plane-line text-rose-400 animate-pulse"}`}></i>
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>{done ? "G?i hoàn t?t!" : "Ðang g?i email..."}</p>
            <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{sent}/{total} email dã x? lý</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Ti?n d?</span>
            <span className="text-sm font-bold" style={{ color: done ? "#34d399" : "#f87171" }}>{pct}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--admin-hover)" }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, backgroundColor: done ? "#34d399" : "#f87171" }} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {[
            { label: "T?ng", value: total, color: "var(--admin-text)" },
            { label: "Thành công", value: success, color: "#34d399" },
            { label: "Th?t b?i", value: fail, color: "#f87171" },
          ].map(s => (
            <div key={s.label} className="text-center px-3 py-2.5 rounded-xl"
              style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {done && (
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
            Ðóng
          </button>
        )}
      </div>
    </div>
  );
}

// --- Broadcast History Row ----------------------------------------------------
function HistoryRow({ record }: { record: BroadcastRecord }) {
  const emailType = EMAIL_TYPES.find(t => t.value === record.emailType) || EMAIL_TYPES[0];
  const successRate = record.sentCount > 0 ? Math.round((record.successCount / record.sentCount) * 100) : 0;

  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b last:border-b-0"
      style={{ borderColor: "var(--admin-border)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${emailType.color}15` }}>
        <i className={`${emailType.icon} text-base`} style={{ color: emailType.color }}></i>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>{record.title}</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
            style={{ backgroundColor: `${emailType.color}15`, color: emailType.color }}>{emailType.label}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${record.status === "done" ? "bg-app-accent-success/15 text-app-accent-success" : record.status === "sending" ? "bg-amber-500/15 text-amber-400" : "bg-rose-500/15 text-rose-400"}`}>
            {record.status === "done" ? "Ðã g?i" : record.status === "sending" ? "Ðang g?i" : "L?i"}
          </span>
        </div>
        <p className="text-xs mb-2 line-clamp-1" style={{ color: "var(--admin-text-muted)" }}>{record.body}</p>
        <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: "var(--admin-text-faint)" }}>
          <span><i className="ri-group-line mr-1"></i>{record.targetLabel}</span>
          <span><i className="ri-send-plane-line mr-1"></i>{record.sentCount.toLocaleString()} g?i</span>
          <span className="text-app-accent-success"><i className="ri-checkbox-circle-line mr-1"></i>{record.successCount} thành công</span>
          {record.failCount > 0 && <span className="text-rose-400"><i className="ri-close-circle-line mr-1"></i>{record.failCount} th?t b?i</span>}
          <span>{new Date(record.sentAt).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-lg font-black" style={{ color: successRate >= 90 ? "#34d399" : successRate >= 70 ? "app-accent-primary" : "#f87171" }}>{successRate}%</p>
        <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>Thành công</p>
      </div>
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------
export default function AdminBroadcastPage() {
  const [tab, setTab] = useState<"compose" | "history">("compose");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all");
  const [emailType, setEmailType] = useState("bulk_notification");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [targetOptions, setTargetOptions] = useState<TargetOption[]>([]);
  const [history, setHistory] = useState<BroadcastRecord[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Progress modal state
  const [showProgress, setShowProgress] = useState(false);
  const [progressTotal, setProgressTotal] = useState(0);
  const [progressSent, setProgressSent] = useState(0);
  const [progressSuccess, setProgressSuccess] = useState(0);
  const [progressFail, setProgressFail] = useState(0);
  const [progressDone, setProgressDone] = useState(false);
  const abortRef = useRef(false);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch real user counts
  useEffect(() => {
    async function fetchCounts() {
      const [allRes, vipRes, lbRes] = await Promise.all([
        supabase.from("user_profiles").select("id, is_vip, created_at", { count: "exact" }),
        supabase.from("user_profiles").select("id", { count: "exact", head: true }).eq("is_vip", true),
        supabase.from("leaderboard").select("user_id, streak, updated_at"),
      ]);
      const allUsers = allRes.data || [];
      const total = allRes.count || 0;
      const vipCount = vipRes.count || 0;
      const lb = lbRes.data || [];
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const streak7 = lb.filter(u => (u.streak || 0) >= 7).length;
      const streak30 = lb.filter(u => (u.streak || 0) >= 30).length;
      const newUsers = allUsers.filter(u => u.created_at >= sevenDaysAgo).length;
      const activeIds = new Set(lb.filter(u => u.updated_at >= sevenDaysAgo).map(u => u.user_id));
      const inactive = Math.max(0, total - activeIds.size);

      // VIP expiring soon
      const { data: vipExpiring } = await supabase
        .from("user_profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_vip", true)
        .lte("vip_expires_at", new Date(Date.now() + 7 * 86400000).toISOString())
        .gte("vip_expires_at", new Date().toISOString());

      setTargetOptions([
        { value: "all", label: "T?t c? h?c viên", count: total, icon: "ri-group-line", color: "#f87171" },
        { value: "free", label: "H?c viên Free", count: total - vipCount, icon: "ri-seedling-line", color: "#34d399" },
        { value: "vip", label: "H?c viên VIP", count: vipCount, icon: "ri-vip-crown-line", color: "app-accent-primary" },
        { value: "vip_expiring", label: "VIP s?p h?t h?n (7 ngày)", count: 0, icon: "ri-alarm-warning-line", color: "#fb923c" },
        { value: "streak7", label: "Streak = 7 ngày", count: streak7, icon: "ri-fire-line", color: "#fb923c" },
        { value: "streak30", label: "Streak = 30 ngày", count: streak30, icon: "ri-fire-fill", color: "#f87171" },
        { value: "inactive", label: "Không ho?t d?ng 7 ngày", count: inactive, icon: "ri-moon-line", color: "#6b7280" },
        { value: "new", label: "M?i dang ký (7 ngày)", count: newUsers, icon: "ri-user-add-line", color: "#a78bfa" },
      ]);
    }
    fetchCounts();
  }, []);

  const selectedTarget = targetOptions.find(t => t.value === target) || targetOptions[0];
  const selectedEmailType = EMAIL_TYPES.find(t => t.value === emailType) || EMAIL_TYPES[0];

  // Fetch users for a given target segment
  async function fetchTargetUsers(targetVal: string) {
    let query = supabase.from("user_profiles").select("id, display_name, is_vip, vip_expires_at, created_at");
    if (targetVal === "free") query = query.eq("is_vip", false);
    else if (targetVal === "vip") query = query.eq("is_vip", true);
    else if (targetVal === "vip_expiring") {
      query = query.eq("is_vip", true)
        .lte("vip_expires_at", new Date(Date.now() + 7 * 86400000).toISOString())
        .gte("vip_expires_at", new Date().toISOString());
    } else if (targetVal === "new") {
      query = query.gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString());
    }
    const { data } = await query.limit(500);
    return data || [];
  }

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      showToast("Vui lòng nh?p tiêu d? và n?i dung!", "err");
      return;
    }

    const users = await fetchTargetUsers(target);
    if (users.length === 0) {
      showToast("Không có ngu?i dùng nào trong nhóm này!", "err");
      return;
    }

    abortRef.current = false;
    setProgressTotal(users.length);
    setProgressSent(0);
    setProgressSuccess(0);
    setProgressFail(0);
    setProgressDone(false);
    setShowProgress(true);

    let successCount = 0;
    let failCount = 0;

    // Send in batches of 5 to avoid rate limiting
    const BATCH = 5;
    for (let i = 0; i < users.length; i += BATCH) {
      if (abortRef.current) break;
      const batch = users.slice(i, i + BATCH);
      await Promise.all(batch.map(async (u) => {
        try {
          const daysLeft = u.vip_expires_at
            ? Math.floor((new Date(u.vip_expires_at).getTime() - Date.now()) / 86400000)
            : null;
          const vipType = u.is_vip && u.vip_expires_at
            ? (daysLeft !== null && daysLeft > 30 ? "year" : "month")
            : "month";

          await supabase.functions.invoke("send-email-resend", {
            body: {
              type: emailType,
              to: `user-${u.id}@placeholder.com`, // email not stored in user_profiles
              displayName: u.display_name || "H?c viên",
              bulkTitle: title,
              bulkBody: body,
              daysLeft: daysLeft || 7,
              vipExpiresAt: u.vip_expires_at ? new Date(u.vip_expires_at).toLocaleDateString("vi-VN") : "",
              vipType,
              renewUrl: `${window.location.origin}/pricing`,
            },
          });
          successCount++;
        } catch {
          failCount++;
        }
        setProgressSent(prev => prev + 1);
        setProgressSuccess(successCount);
        setProgressFail(failCount);
      }));
      // Small delay between batches
      await new Promise(r => setTimeout(r, 200));
    }

    setProgressDone(true);

    // Save to history
    const record: BroadcastRecord = {
      id: `bc_${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      target,
      targetLabel: selectedTarget?.label || target,
      sentCount: users.length,
      successCount,
      failCount,
      emailType,
      sentAt: new Date().toISOString(),
      status: failCount === users.length ? "failed" : "done",
    };
    setHistory(prev => [record, ...prev]);

    // Log to audit
    await supabase.from("admin_audit_logs").insert({
      action_type: "broadcast_sent",
      action_label: "Broadcast email",
      actor_name: "Admin",
      target_name: selectedTarget?.label || target,
      detail: `G?i broadcast "${title}" d?n ${users.length} ngu?i (${successCount} thành công, ${failCount} th?t b?i)`,
      metadata: { target, count: users.length, success: successCount, fail: failCount, email_type: emailType },
      ip_address: "admin_panel",
    }).maybeSingle();

    setTitle("");
    setBody("");
  };

  const totalSent = history.reduce((s, h) => s + h.sentCount, 0);
  const totalSuccess = history.reduce((s, h) => s + h.successCount, 0);
  const avgSuccessRate = history.length > 0 ? Math.round((totalSuccess / Math.max(totalSent, 1)) * 100) : 0;

  return (
    <AdminLayout
      title="Broadcast Email"
      subtitle="G?i email hàng lo?t d?n toàn b? ho?c nhóm h?c viên c? th?"
    >
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium text-white ${toast.type === "ok" ? "bg-emerald-600" : "bg-rose-600"}`}>
          <i className={`${toast.type === "ok" ? "ri-checkbox-circle-line" : "ri-error-warning-line"} mr-2`}></i>{toast.msg}
        </div>
      )}

      {showProgress && (
        <SendProgressModal
          total={progressTotal} sent={progressSent}
          success={progressSuccess} fail={progressFail}
          done={progressDone}
          onClose={() => { setShowProgress(false); setTab("history"); }}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "T?ng l?n broadcast", value: history.length, icon: "ri-send-plane-line", color: "#34d399" },
          { label: "T?ng email dã g?i", value: totalSent.toLocaleString(), icon: "ri-mail-send-line", color: "app-accent-primary" },
          { label: "T? l? thành công TB", value: `${avgSuccessRate}%`, icon: "ri-checkbox-circle-line", color: "#a78bfa" },
          { label: "T?ng h?c viên", value: (targetOptions[0]?.count || 0).toLocaleString(), icon: "ri-group-line", color: "#fb923c" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="font-bold text-xl leading-none" style={{ color: "var(--admin-text)" }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit" style={{ backgroundColor: "var(--admin-hover)" }}>
        {[
          { key: "compose", label: "So?n & G?i", icon: "ri-edit-line" },
          { key: "history", label: `L?ch s? (${history.length})`, icon: "ri-history-line" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as "compose" | "history")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: tab === t.key ? "var(--admin-card)" : "transparent", color: tab === t.key ? "var(--admin-text)" : "var(--admin-text-muted)", border: tab === t.key ? "1px solid var(--admin-border)" : "1px solid transparent" }}>
            <i className={t.icon}></i>{t.label}
          </button>
        ))}
      </div>

      {tab === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {/* Email type */}
            <div className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
              <p className="text-xs font-semibold mb-3" style={{ color: "var(--admin-text-muted)" }}>Lo?i email</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {EMAIL_TYPES.map(t => (
                  <button key={t.value} onClick={() => setEmailType(t.value)}
                    className="flex flex-col items-center gap-2 py-3 rounded-xl border transition-all cursor-pointer"
                    style={{ backgroundColor: emailType === t.value ? `${t.color}10` : "var(--admin-card2)", borderColor: emailType === t.value ? `${t.color}35` : "var(--admin-border)" }}>
                    <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${t.color}15` }}>
                      <i className={`${t.icon} text-sm`} style={{ color: t.color }}></i>
                    </div>
                    <span className="text-[10px] font-semibold text-center" style={{ color: emailType === t.value ? t.color : "var(--admin-text-muted)" }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="rounded-2xl p-5 border space-y-4" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: "var(--admin-text-muted)" }}>Tiêu d? email *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value.slice(0, 100))}
                  placeholder="Ví d?: Tính nang m?i tháng 4 dã ra m?t!"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                  style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
                <p className="text-[10px] mt-1 text-right" style={{ color: "var(--admin-text-faint)" }}>{title.length}/100</p>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: "var(--admin-text-muted)" }}>N?i dung *</label>
                <textarea value={body} onChange={e => setBody(e.target.value.slice(0, 500))}
                  placeholder="Nh?p n?i dung email chi ti?t..."
                  rows={5} className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none"
                  style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
                <p className="text-[10px] mt-1 text-right" style={{ color: "var(--admin-text-faint)" }}>{body.length}/500</p>
              </div>
            </div>

            {/* Target */}
            <div className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
              <p className="text-xs font-semibold mb-3" style={{ color: "var(--admin-text-muted)" }}>Ð?i tu?ng nh?n</p>
              <div className="grid grid-cols-2 gap-2">
                {targetOptions.map(t => (
                  <button key={t.value} onClick={() => setTarget(t.value)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all cursor-pointer text-left"
                    style={{ backgroundColor: target === t.value ? `${t.color}08` : "var(--admin-card2)", borderColor: target === t.value ? `${t.color}30` : "var(--admin-border)" }}>
                    <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${t.color}15` }}>
                      <i className={`${t.icon} text-xs`} style={{ color: t.color }}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: target === t.value ? t.color : "var(--admin-text-muted)" }}>{t.label}</p>
                      <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{t.count.toLocaleString()} ngu?i</p>
                    </div>
                    {target === t.value && <i className="ri-check-line text-xs flex-shrink-0" style={{ color: t.color }}></i>}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule toggle */}
            <div className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>Lên l?ch g?i</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-faint)" }}>Ð? tr?ng d? g?i ngay</p>
                </div>
                <button onClick={() => setScheduleEnabled(v => !v)}
                  className="relative w-10 h-5 rounded-full cursor-pointer flex-shrink-0"
                  style={{ backgroundColor: scheduleEnabled ? "#f43f5e" : "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${scheduleEnabled ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
              {scheduleEnabled && (
                <input type="datetime-local" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                  style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
              )}
            </div>

            {/* Send button */}
            <button onClick={handleSend} disabled={!title.trim() || !body.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap disabled:opacity-40 text-white"
              style={{ backgroundColor: "#f43f5e" }}>
              <i className={scheduleEnabled ? "ri-calendar-schedule-line" : "ri-send-plane-fill"}></i>
              {scheduleEnabled ? "Lên l?ch g?i" : `G?i ngay d?n ${(selectedTarget?.count || 0).toLocaleString()} ngu?i`}
            </button>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
              <p className="text-xs font-semibold mb-4" style={{ color: "var(--admin-text-muted)" }}>Xem tru?c email</p>
              <div className="rounded-xl p-4 border" style={{ backgroundColor: "var(--admin-card2)", borderColor: "var(--admin-border)" }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${selectedEmailType.color}15` }}>
                    <i className={`${selectedEmailType.icon} text-base`} style={{ color: selectedEmailType.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "var(--admin-text)" }}>{title || "Tiêu d? email"}</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--admin-text-muted)" }}>{body || "N?i dung email s? hi?n th? ? dây..."}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${selectedEmailType.color}15`, color: selectedEmailType.color }}>{selectedEmailType.label}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 space-y-2 border-t" style={{ borderColor: "var(--admin-border)" }}>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--admin-text-muted)" }}>Ð?i tu?ng:</span>
                  <span className="font-semibold" style={{ color: "var(--admin-text)" }}>{selectedTarget?.label || "—"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--admin-text-muted)" }}>S? ngu?i nh?n:</span>
                  <span className="font-bold text-rose-400">{(selectedTarget?.count || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--admin-text-muted)" }}>Lo?i email:</span>
                  <span className="font-semibold" style={{ color: selectedEmailType.color }}>{selectedEmailType.label}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-4 border" style={{ backgroundColor: "rgba(251,146,60,0.06)", borderColor: "rgba(251,146,60,0.20)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "#fb923c" }}>Luu ý quan tr?ng</p>
              <ul className="space-y-1.5 text-xs" style={{ color: "var(--admin-text-muted)" }}>
                <li className="flex items-start gap-1.5"><i className="ri-information-line text-amber-400 flex-shrink-0 mt-0.5"></i>Email du?c g?i qua Resend API — c?n c?u hình RESEND_API_KEY</li>
                <li className="flex items-start gap-1.5"><i className="ri-information-line text-amber-400 flex-shrink-0 mt-0.5"></i>Email không luu trong user_profiles — dùng email placeholder</li>
                <li className="flex items-start gap-1.5"><i className="ri-information-line text-amber-400 flex-shrink-0 mt-0.5"></i>G?i theo batch 5 email/l?n d? tránh rate limit</li>
                <li className="flex items-start gap-1.5"><i className="ri-check-line text-app-accent-success flex-shrink-0 mt-0.5"></i>M?i l?n g?i d?u du?c ghi vào Audit Log</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          {history.length === 0 ? (
            <div className="text-center py-16">
              <i className="ri-mail-send-line text-4xl mb-3 block" style={{ color: "var(--admin-text-faint)" }}></i>
              <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Chua có l?n broadcast nào</p>
              <button onClick={() => setTab("compose")} className="mt-3 text-xs cursor-pointer" style={{ color: "#f87171" }}>
                So?n broadcast d?u tiên ?
              </button>
            </div>
          ) : (
            history.map(record => <HistoryRow key={record.id} record={record} />)
          )}
        </div>
      )}
    </AdminLayout>
  );
}

