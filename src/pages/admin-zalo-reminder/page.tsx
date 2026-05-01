import { useState, useMemo, useEffect, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { useAdminUsers, type AdminUser } from "@/hooks/useAdminUsers";
import { supabase } from "@/lib/supabase";

interface ReminderLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  message: string;
  status: "sent" | "failed" | "pending";
  error_message: string | null;
  sent_at: string;
}

interface ScheduleConfig {
  enabled: boolean;
  hour: number;
  inactiveDays: number;
  message: string;
}

const DEFAULT_MESSAGES = [
  "🇰🇷 Chào bạn! Hôm nay bạn chưa học tiếng Hàn đúng không? Chỉ 10 phút thôi là đủ để giữ streak rồi! Vào hanquocoi.vn học ngay nhé! 🔥",
  "📚 Nhắc nhở học tập: Bạn đang có streak tốt đấy! Đừng để gián đoạn nhé. Vào học 1 bài EPS hoặc 10 từ vựng ngay nào! hanquocoi.vn",
  "⚡ Hôm nay bạn chưa học tiếng Hàn! Chỉ cần 5 phút luyện phát âm hoặc 10 flashcard thôi. Giữ vững thói quen mỗi ngày nhé! 💪",
];

function MemberRow({ user, selected, onToggle, lastStudy }: {
  user: AdminUser;
  selected: boolean;
  onToggle: () => void;
  lastStudy: string;
}) {
  const daysSince = lastStudy
    ? Math.floor((Date.now() - new Date(lastStudy).getTime()) / 86400000)
    : 999;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors cursor-pointer ${
        selected ? "bg-[#e8c84a]/8 border-[#e8c84a]/25" : "bg-white/3 border-white/5 hover:border-white/10"
      }`}
      onClick={onToggle}
    >
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
        <div
          className="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
          style={{
            borderColor: selected ? "#e8c84a" : "rgba(255,255,255,0.2)",
            backgroundColor: selected ? "#e8c84a" : "transparent",
          }}
        >
          {selected && <i className="ri-check-line text-[#0f1117] text-[10px]" />}
        </div>
      </div>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-white/5">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
        ) : (
          <i className="ri-user-line text-white/30 text-sm" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-xs font-medium truncate">{user.display_name}</p>
        <p className="text-white/30 text-[10px] truncate">{user.email}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-xs font-bold ${daysSince >= 3 ? "text-rose-400" : daysSince >= 1 ? "text-[#e8c84a]" : "text-emerald-400"}`}>
          {daysSince >= 999 ? "Chưa từng học" : `${daysSince} ngày`}
        </p>
        <p className="text-white/20 text-[9px]">chưa học</p>
      </div>
    </div>
  );
}

export default function AdminZaloReminderPage() {
  const { users, loading } = useAdminUsers();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState(DEFAULT_MESSAGES[0]);
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [zaloOaId, setZaloOaId] = useState("");
  const [zaloToken, setZaloToken] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [filterDays, setFilterDays] = useState<number>(1);
  const [savingSettings, setSavingSettings] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    enabled: false,
    hour: 20,
    inactiveDays: 1,
    message: DEFAULT_MESSAGES[0],
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load logs from Supabase
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    const { data } = await supabase
      .from("zalo_reminder_logs")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(50);
    setLogs((data ?? []) as ReminderLog[]);
    setLogsLoading(false);
  }, []);

  // Load settings from Supabase
  const loadSettings = useCallback(async () => {
    const { data } = await supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", ["zalo_oa_id", "zalo_reminder_message", "zalo_schedule_enabled", "zalo_schedule_hour", "zalo_inactive_days"]);

    if (data) {
      const map = Object.fromEntries(data.map(d => [d.key, d.value]));
      if (map.zalo_oa_id) setZaloOaId(map.zalo_oa_id);
      if (map.zalo_reminder_message) setMessage(map.zalo_reminder_message);
      setSchedule(prev => ({
        ...prev,
        enabled: map.zalo_schedule_enabled === "true",
        hour: map.zalo_schedule_hour ? parseInt(map.zalo_schedule_hour) : 20,
        inactiveDays: map.zalo_inactive_days ? parseInt(map.zalo_inactive_days) : 1,
        message: map.zalo_reminder_message || DEFAULT_MESSAGES[0],
      }));
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    loadSettings();
  }, [fetchLogs, loadSettings]);

  const saveSettings = async () => {
    setSavingSettings(true);
    const settings = [
      { key: "zalo_oa_id", value: zaloOaId },
      { key: "zalo_reminder_message", value: message },
      { key: "zalo_schedule_enabled", value: String(schedule.enabled) },
      { key: "zalo_schedule_hour", value: String(schedule.hour) },
      { key: "zalo_inactive_days", value: String(schedule.inactiveDays) },
    ];
    for (const s of settings) {
      await supabase.from("admin_settings").upsert(
        { key: s.key, value: s.value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
    }
    setSavingSettings(false);
    showToast("Đã lưu cài đặt Zalo OA!");
    setShowSettings(false);
  };

  // Members who haven't studied in filterDays days
  const inactiveMembers = useMemo(() => {
    const cutoff = Date.now() - filterDays * 86400000;
    return users.filter(u => {
      const last = u.last_active ? new Date(u.last_active).getTime() : 0;
      return last < cutoff;
    }).sort((a, b) => {
      const aLast = a.last_active ? new Date(a.last_active).getTime() : 0;
      const bLast = b.last_active ? new Date(b.last_active).getTime() : 0;
      return aLast - bLast;
    });
  }, [users, filterDays]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === inactiveMembers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(inactiveMembers.map(u => u.id)));
    }
  };

  const handleSend = async () => {
    if (selectedIds.size === 0) { showToast("Vui lòng chọn ít nhất 1 thành viên"); return; }
    if (!message.trim()) { showToast("Vui lòng nhập nội dung tin nhắn"); return; }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("zalo-reminder-scheduler", {
        body: {
          mode: "manual",
          userIds: Array.from(selectedIds),
          message: message.trim(),
        },
      });

      if (error) throw error;

      showToast(`Đã gửi ${data?.sent ?? 0}/${selectedIds.size} tin nhắn Zalo OA`);
      setSelectedIds(new Set());
      await fetchLogs();
    } catch (err) {
      showToast(`Lỗi: ${err instanceof Error ? err.message : "Không thể gửi"}`);
    } finally {
      setSending(false);
    }
  };

  const handleTestCron = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("zalo-reminder-scheduler", {
        body: {
          mode: "cron",
          inactiveDays: schedule.inactiveDays,
          message: schedule.message,
        },
      });
      if (error) throw error;
      showToast(`Cron test: Đã gửi ${data?.sent ?? 0} tin nhắn`);
      await fetchLogs();
    } catch (err) {
      showToast(`Lỗi: ${err instanceof Error ? err.message : "Không thể chạy cron"}`);
    } finally {
      setSending(false);
    }
  };

  const sentCount = logs.filter(l => l.status === "sent").length;
  const failedCount = logs.filter(l => l.status === "failed").length;

  return (
    <AdminLayout
      title="Nhắc nhở học tập Zalo OA"
      subtitle="Gửi tin nhắn tự động qua Zalo OA cho thành viên chưa học trong ngày"
      actions={
        <button
          onClick={() => setShowSettings(v => !v)}
          className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
        >
          <i className="ri-settings-3-line" />
          Cài đặt Zalo OA
        </button>
      }
    >
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-500 text-white">
          <i className="ri-checkbox-circle-line"></i>
          {toast}
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-[#111318] border border-white/5 rounded-2xl p-5 mb-5">
          <h3 className="text-white font-semibold text-sm mb-4">Cài đặt Zalo Official Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-white/40 text-xs font-medium block mb-1.5">Zalo OA ID</label>
              <input type="text" value={zaloOaId} onChange={e => setZaloOaId(e.target.value)}
                placeholder="VD: 123456789"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 transition-colors" />
            </div>
            <div>
              <label className="text-white/40 text-xs font-medium block mb-1.5">Access Token (lưu vào Supabase Secrets)</label>
              <input type="password" value={zaloToken} onChange={e => setZaloToken(e.target.value)}
                placeholder="Nhập Zalo OA Access Token"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 transition-colors" />
            </div>
          </div>

          {/* Schedule config */}
          <div className="border-t border-white/5 pt-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/70 text-sm font-semibold">Lịch gửi tự động (Cron)</p>
                <p className="text-white/30 text-xs">Tự động gửi nhắc nhở mỗi ngày theo giờ đặt</p>
              </div>
              <button
                onClick={() => setSchedule(prev => ({ ...prev, enabled: !prev.enabled }))}
                className="relative w-12 h-6 rounded-full cursor-pointer flex-shrink-0 transition-colors"
                style={{ backgroundColor: schedule.enabled ? "#e8c84a" : "rgba(255,255,255,0.1)" }}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${schedule.enabled ? "left-7" : "left-1"}`} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs font-medium block mb-1.5">Giờ gửi (0-23)</label>
                <input type="number" min={0} max={23} value={schedule.hour}
                  onChange={e => setSchedule(prev => ({ ...prev, hour: parseInt(e.target.value) || 20 }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500/40 transition-colors" />
              </div>
              <div>
                <label className="text-white/40 text-xs font-medium block mb-1.5">Không học bao nhiêu ngày</label>
                <select value={schedule.inactiveDays}
                  onChange={e => setSchedule(prev => ({ ...prev, inactiveDays: parseInt(e.target.value) }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500/40 transition-colors cursor-pointer">
                  <option value={1} className="bg-[#111318]">1 ngày</option>
                  <option value={2} className="bg-[#111318]">2 ngày</option>
                  <option value={3} className="bg-[#111318]">3 ngày</option>
                  <option value={7} className="bg-[#111318]">7 ngày</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#e8c84a]/5 border border-[#e8c84a]/15 mb-4">
            <p className="text-[#e8c84a]/80 text-xs leading-relaxed">
              <i className="ri-information-line mr-1" />
              Để lấy Access Token: <strong className="text-[#e8c84a]">Zalo OA Admin</strong> → Quản lý → Công cụ phát triển → Token.
              Cần quyền <strong className="text-[#e8c84a]">oa_send_message</strong>. Token được lưu vào Supabase Secrets (ZALO_OA_ACCESS_TOKEN).
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={handleTestCron} disabled={sending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm cursor-pointer whitespace-nowrap hover:bg-white/10 transition-colors disabled:opacity-40">
              <i className="ri-play-circle-line" />Test Cron ngay
            </button>
            <button onClick={saveSettings} disabled={savingSettings}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] disabled:opacity-50 text-[#0f1117] font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
              {savingSettings ? <><i className="ri-loader-4-line animate-spin" />Đang lưu...</> : <><i className="ri-save-line" />Lưu cài đặt</>}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Member list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Chưa học", value: inactiveMembers.length, color: "#f87171", icon: "ri-user-forbid-line" },
              { label: "Đã chọn", value: selectedIds.size, color: "#e8c84a", icon: "ri-user-add-line" },
              { label: "Đã gửi (DB)", value: sentCount, color: "#34d399", icon: "ri-send-plane-line" },
            ].map(s => (
              <div key={s.label} className="bg-[#111318] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-sm`} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-white font-bold text-lg leading-none">{s.value}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-xs">Lọc:</span>
              {[1, 3, 7].map(days => (
                <button key={days} onClick={() => setFilterDays(days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${
                    filterDays === days
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/25"
                      : "bg-white/5 text-white/40 border border-white/8 hover:bg-white/8"
                  }`}>
                  {days === 1 ? "Hôm nay" : `${days} ngày`}
                </button>
              ))}
            </div>
            <button onClick={selectAll}
              className="text-xs text-[#e8c84a] hover:text-[#d4b43a] cursor-pointer whitespace-nowrap transition-colors">
              {selectedIds.size === inactiveMembers.length && inactiveMembers.length > 0 ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          </div>

          {/* Member list */}
          <div className="bg-[#111318] border border-white/5 rounded-2xl p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
              </div>
            ) : inactiveMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-emerald-500/10 mb-3">
                  <i className="ri-check-double-line text-emerald-400 text-2xl" />
                </div>
                <p className="text-white/60 text-sm font-medium mb-1">Tuyệt vời!</p>
                <p className="text-white/30 text-xs">Tất cả thành viên đều đã học trong {filterDays} ngày qua</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
                {inactiveMembers.map(user => (
                  <MemberRow key={user.id} user={user} selected={selectedIds.has(user.id)}
                    onToggle={() => toggleSelect(user.id)} lastStudy={user.last_active || ""} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Compose + Logs */}
        <div className="space-y-4">
          <div className="bg-[#111318] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-1">Soạn tin nhắn</h3>
            <p className="text-white/30 text-xs mb-4">{selectedIds.size} thành viên được chọn</p>

            {/* Quick templates */}
            <div className="space-y-1.5 mb-4">
              <p className="text-white/30 text-[10px] tracking-normal font-semibold mb-1">Mẫu tin nhắn</p>
              {DEFAULT_MESSAGES.map((msg, i) => (
                <button key={i} onClick={() => setMessage(msg)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs leading-relaxed transition-colors cursor-pointer ${
                    message === msg
                      ? "bg-[#e8c84a]/10 text-[#e8c84a] border border-[#e8c84a]/20"
                      : "bg-white/3 text-white/40 hover:bg-white/6 border border-transparent"
                  }`}>
                  {msg.slice(0, 60)}...
                </button>
              ))}
            </div>

            <div>
              <label className="text-white/30 text-[10px] tracking-normal font-semibold block mb-1.5">Nội dung tùy chỉnh</label>
              <textarea value={message} onChange={e => setMessage(e.target.value.slice(0, 500))}
                rows={5} maxLength={500}
                placeholder="Nhập nội dung tin nhắn Zalo OA..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 transition-colors resize-none leading-relaxed" />
              <p className="text-white/20 text-[10px] text-right mt-1">{message.length}/500</p>
            </div>

            <button onClick={handleSend} disabled={sending || selectedIds.size === 0}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-[#0f1117] font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
              {sending ? (
                <><i className="ri-loader-4-line animate-spin" />Đang gửi...</>
              ) : (
                <><i className="ri-send-plane-fill" />Gửi {selectedIds.size} tin nhắn</>
              )}
            </button>
            <p className="text-white/20 text-[10px] text-center mt-2">
              Gọi Edge Function → Zalo OA API. Logs lưu vào Supabase.
            </p>
          </div>

          {/* Logs from Supabase */}
          <div className="bg-[#111318] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold text-sm">Lịch sử gửi</h3>
                <p className="text-white/30 text-[10px]">Từ Supabase DB</p>
              </div>
              <button onClick={() => setShowLogs(v => !v)}
                className="text-[10px] text-white/30 hover:text-white/50 cursor-pointer whitespace-nowrap transition-colors">
                {showLogs ? "Thu gọn" : "Xem tất cả"}
              </button>
            </div>
            {logsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-white/20 text-xs text-center py-4">Chưa có lịch sử gửi</p>
            ) : (
              <div className={`space-y-2 ${showLogs ? "" : "max-h-32 overflow-hidden"}`}>
                {logs.slice(0, showLogs ? undefined : 3).map(log => (
                  <div key={log.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${log.status === "sent" ? "bg-emerald-400" : "bg-rose-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white/60 text-xs truncate">{log.user_name || "Ẩn danh"}</p>
                      <p className="text-white/20 text-[9px]">{new Date(log.sent_at).toLocaleString("vi-VN")}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      log.status === "sent" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {log.status === "sent" ? "Đã gửi" : "Lỗi"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {logs.length > 0 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <span className="text-emerald-400 text-[10px] font-bold">{sentCount} thành công</span>
                <span className="text-rose-400 text-[10px] font-bold">{failedCount} thất bại</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

