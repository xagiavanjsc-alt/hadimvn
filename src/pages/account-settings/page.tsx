import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

type Tab = "security" | "notifications" | "data" | "vip";

const LOCAL_STORAGE_KEYS = [
  { key: "kts_streak", label: "Streak học tập" },
  { key: "kts_eps_answers", label: "Câu trả lời EPS" },
  { key: "kts_flashcard_known", label: "Flashcard đã thuộc" },
  { key: "kts_hangul_known", label: "Hangul đã học" },
  { key: "kts_quiz_history", label: "Lịch sử Quiz" },
  { key: "kts_eps_exam_results", label: "Kết quả thi thử EPS" },
  { key: "kts_flashcard_mastered", label: "Flashcard mastered" },
  { key: "kts_flashcard_sessions", label: "Phiên học Flashcard" },
  { key: "kts_news_lessons", label: "Bài học qua Tin tức" },
  { key: "kts_melon_lessons", label: "Bài học K-pop" },
];

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#e8c84a]/10">
          <i className={`${icon} text-[#e8c84a] text-sm`}></i>
        </div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("security");
  const [autoRenew, setAutoRenew] = useState(false);
  const [autoRenewSaving, setAutoRenewSaving] = useState(false);
  const [autoRenewToast, setAutoRenewToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(`auto_renew_${user.id}`);
    setAutoRenew(stored === "true");
  }, [user]);

  const handleAutoRenewToggle = useCallback(async () => {
    if (!user) return;
    setAutoRenewSaving(true);
    const newVal = !autoRenew;
    setAutoRenew(newVal);
    localStorage.setItem(`auto_renew_${user.id}`, String(newVal));
    await supabase.from("user_profiles").update({ updated_at: new Date().toISOString() }).eq("id", user.id);
    setAutoRenewSaving(false);
    setAutoRenewToast(newVal ? "Đã bật tự động gia hạn VIP!" : "Đã tắt tự động gia hạn VIP.");
    setTimeout(() => setAutoRenewToast(null), 3000);
  }, [user, autoRenew]);

  // Password change
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Notifications
  const [notifSettings, setNotifSettings] = useState({
    dailyReminder: true,
    streakAlert: true,
    leaderboardUpdate: false,
    weeklyReport: true,
    newContent: false,
  });

  // Data deletion
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletingData, setDeletingData] = useState<string | null>(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  const handleChangePassword = useCallback(async () => {
    if (!newPw || newPw.length < 6) {
      setPwMsg({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự" });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: "error", text: "Mật khẩu xác nhận không khớp" });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) {
      setPwMsg({ type: "error", text: error.message });
    } else {
      setPwMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    }
  }, [newPw, confirmPw]);

  const handleDeleteKey = useCallback((key: string, label: string) => {
    setDeletingData(key);
    setTimeout(() => {
      localStorage.removeItem(key);
      setDeletingData(null);
      setDeleteMsg(`Đã xóa: ${label}`);
      setTimeout(() => setDeleteMsg(null), 2500);
    }, 600);
  }, []);

  const handleDeleteAll = useCallback(() => {
    LOCAL_STORAGE_KEYS.forEach(({ key }) => localStorage.removeItem(key));
    setDeleteAllConfirm(false);
    setDeleteMsg("Đã xóa toàn bộ dữ liệu học tập trên thiết bị này!");
    setTimeout(() => setDeleteMsg(null), 3000);
  }, []);

  const getDataSize = (key: string) => {
    const val = localStorage.getItem(key);
    if (!val) return null;
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return `${parsed.length} mục`;
      if (typeof parsed === "object") return `${Object.keys(parsed).length} mục`;
      return "Có dữ liệu";
    } catch {
      return "Có dữ liệu";
    }
  };

  if (!user) {
    return (
      <DashboardLayout title="Cài đặt tài khoản" subtitle="Quản lý bảo mật và dữ liệu của bạn">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/5 mb-4">
            <i className="ri-lock-line text-white/20 text-3xl"></i>
          </div>
          <p className="text-white/40 text-base font-medium mb-2">Cần đăng nhập</p>
          <p className="text-white/25 text-sm mb-5">Đăng nhập để quản lý cài đặt tài khoản</p>
          <button onClick={() => navigate("/profile")} className="flex items-center gap-2 bg-[#e8c84a] text-[#0f1117] font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap">
            <i className="ri-user-line"></i>
            Đến trang hồ sơ
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Cài đặt tài khoản"
      subtitle="Quản lý bảo mật, thông báo và dữ liệu học tập"
      actions={
        deleteMsg ? (
          <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <i className="ri-checkbox-circle-fill"></i>
            {deleteMsg}
          </span>
        ) : undefined
      }
    >
      {/* User info banner */}
      <div className="bg-gradient-to-r from-[#1a1600] to-[#0f1117] border border-[#e8c84a]/15 rounded-2xl p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#e8c84a]/15 flex items-center justify-center flex-shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <i className="ri-user-3-line text-[#e8c84a] text-xl"></i>
          )}
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-base">{profile?.display_name || "Học viên KTS"}</p>
          <p className="text-white/40 text-sm">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {profile?.is_vip ? (
            <span className="flex items-center gap-1.5 bg-[#e8c84a]/15 text-[#e8c84a] text-xs font-bold px-3 py-1.5 rounded-full border border-[#e8c84a]/25">
              <i className="ri-vip-crown-fill"></i>
              VIP
            </span>
          ) : (
            <button onClick={() => navigate("/pricing")} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/50 text-xs px-3 py-1.5 rounded-full border border-white/10 cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-vip-crown-line"></i>
              Nâng cấp VIP
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/3 p-1 rounded-xl mb-6 w-fit">
        {([
          ["security", "ri-shield-keyhole-line", "Bảo mật"],
          ["notifications", "ri-notification-3-line", "Thông báo"],
          ["vip", "ri-vip-crown-line", "VIP"],
          ["data", "ri-database-2-line", "Dữ liệu"],
        ] as const).map(([tab, icon, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/60"}`}
          >
            <i className={icon}></i>
            {label}
          </button>
        ))}
      </div>

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-5 max-w-xl">
          <SectionCard title="Đổi mật khẩu" icon="ri-lock-password-line">
            {pwMsg && (
              <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-xl border text-xs ${pwMsg.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                <i className={pwMsg.type === "success" ? "ri-checkbox-circle-line" : "ri-error-warning-line"}></i>
                {pwMsg.text}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-xs font-medium block mb-1.5">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#e8c84a]/40 pr-10"
                  />
                  <button onClick={() => setShowCurrentPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer">
                    <i className={showCurrentPw ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs font-medium block mb-1.5">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#e8c84a]/40 pr-10"
                  />
                  <button onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer">
                    <i className={showNewPw ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  </button>
                </div>
                {newPw.length > 0 && (
                  <div className="mt-1.5 flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-all ${newPw.length >= i * 3 ? (newPw.length >= 10 ? "bg-emerald-400" : newPw.length >= 7 ? "bg-[#e8c84a]" : "bg-[#fb923c]") : "bg-white/10"}`}></div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-white/40 text-xs font-medium block mb-1.5">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors ${confirmPw && confirmPw !== newPw ? "border-red-500/40" : "border-white/10 focus:border-[#e8c84a]/40"}`}
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={pwLoading || !newPw || !confirmPw}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-[#0f1117] font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                {pwLoading ? <><i className="ri-loader-4-line animate-spin"></i> Đang cập nhật...</> : <><i className="ri-save-line"></i> Đổi mật khẩu</>}
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Thông tin tài khoản" icon="ri-user-settings-line">
            <div className="space-y-3">
              {[
                { label: "Email", value: user.email || "—", icon: "ri-mail-line" },
                { label: "Ngày tạo tài khoản", value: new Date(user.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }), icon: "ri-calendar-line" },
                { label: "Trạng thái", value: user.email_confirmed_at ? "Đã xác minh email" : "Chưa xác minh", icon: "ri-shield-check-line" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 px-4 py-3 bg-white/3 rounded-xl">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 flex-shrink-0">
                    <i className={`${item.icon} text-white/40 text-sm`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/30 text-[10px]">{item.label}</p>
                    <p className="text-white/70 text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-5 max-w-xl">
          <SectionCard title="Cài đặt thông báo" icon="ri-notification-3-line">
            <div className="space-y-1">
              {([
                { key: "dailyReminder", label: "Nhắc nhở học hàng ngày", desc: "Thông báo khi chưa học trong ngày", icon: "ri-time-line", color: "#e8c84a" },
                { key: "streakAlert", label: "Cảnh báo streak sắp mất", desc: "Nhắc khi streak có nguy cơ bị reset", icon: "ri-fire-line", color: "#fb923c" },
                { key: "leaderboardUpdate", label: "Cập nhật bảng xếp hạng", desc: "Thông báo khi bị vượt hạng", icon: "ri-trophy-line", color: "#FFD700" },
                { key: "weeklyReport", label: "Báo cáo học tập hàng tuần", desc: "Tổng kết tiến độ mỗi Chủ nhật", icon: "ri-bar-chart-line", color: "#34d399" },
                { key: "newContent", label: "Nội dung mới", desc: "Khi có bài học hoặc đề thi mới", icon: "ri-newspaper-line", color: "#a78bfa" },
              ] as const).map(item => (
                <div key={item.key} className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/2 transition-colors">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                    <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/80 text-sm font-medium">{item.label}</p>
                    <p className="text-white/30 text-xs">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifSettings(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 ${notifSettings[item.key] ? "bg-[#e8c84a]" : "bg-white/10"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${notifSettings[item.key] ? "left-5" : "left-0.5"}`}></div>
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-white/20 text-xs leading-relaxed">
                Lưu ý: Thông báo in-app hoạt động ngay. Thông báo email cần cấu hình thêm trong phần email reminder.
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Giờ nhắc nhở" icon="ri-alarm-line">
            <div className="space-y-3">
              <div>
                <label className="text-white/40 text-xs font-medium block mb-2">Giờ nhắc học hàng ngày</label>
                <div className="flex gap-2 flex-wrap">
                  {["07:00", "08:00", "12:00", "18:00", "20:00", "21:00"].map(t => (
                    <button key={t} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:border-[#e8c84a]/30 hover:text-[#e8c84a] transition-colors cursor-pointer whitespace-nowrap">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-white/20 text-xs">Tính năng đặt lịch nhắc qua email sẽ sớm ra mắt.</p>
            </div>
          </SectionCard>
        </div>
      )}

      {/* VIP Tab */}
      {activeTab === "vip" && (
        <div className="space-y-5 max-w-xl">
          {autoRenewToast && (
            <div className="fixed top-6 right-6 z-50 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <i className="ri-checkbox-circle-fill" />{autoRenewToast}
            </div>
          )}

          {/* VIP Status */}
          <SectionCard title="Trạng thái VIP" icon="ri-vip-crown-line">
            {profile?.is_vip ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-4 py-4 bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#e8c84a]/15 flex-shrink-0">
                    <i className="ri-vip-crown-fill text-[#e8c84a] text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">Tài khoản VIP đang hoạt động</p>
                    {profile.vip_expires_at && (
                      <p className="text-white/40 text-xs mt-0.5">
                        Hết hạn: <span className="text-[#e8c84a] font-semibold">
                          {new Date(profile.vip_expires_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </span>
                        {" · "}
                        Còn {Math.max(0, Math.floor((new Date(profile.vip_expires_at).getTime() - Date.now()) / 86400000))} ngày
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                    ACTIVE
                  </span>
                </div>
                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#e8c84a]/10 hover:bg-[#e8c84a]/20 border border-[#e8c84a]/20 text-[#e8c84a] text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors"
                >
                  <i className="ri-refresh-line" />
                  Gia hạn VIP sớm
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-4 py-4 bg-white/3 rounded-xl">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 flex-shrink-0">
                    <i className="ri-vip-crown-line text-white/30 text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60 font-semibold text-sm">Tài khoản Free</p>
                    <p className="text-white/30 text-xs mt-0.5">Nâng cấp để mở khóa toàn bộ tính năng</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] text-sm font-bold cursor-pointer whitespace-nowrap transition-colors"
                >
                  <i className="ri-vip-crown-line" />
                  Nâng cấp VIP ngay
                </button>
              </div>
            )}
          </SectionCard>

          {/* Auto-Renew */}
          {profile?.is_vip && (
            <SectionCard title="Tự động gia hạn VIP" icon="ri-refresh-line">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-white/70 text-sm leading-relaxed">
                    {autoRenew
                      ? "Hệ thống sẽ tự động nhắc gia hạn trước khi hết hạn. Bạn sẽ nhận email nhắc trước 7 ngày, 3 ngày và 1 ngày."
                      : "Bật để nhận email nhắc gia hạn tự động. Không bị gián đoạn quá trình học."
                    }
                  </p>
                  {autoRenew && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 text-[10px] font-semibold">Đang hoạt động</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAutoRenewToggle}
                  disabled={autoRenewSaving}
                  className="relative w-12 h-6 rounded-full cursor-pointer flex-shrink-0 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: autoRenew ? "#e8c84a" : "rgba(255,255,255,0.1)" }}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autoRenew ? "left-7" : "left-1"}`} />
                </button>
              </div>
              {autoRenew && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-4 border-t border-white/5">
                  {[
                    { icon: "ri-mail-check-line", text: "Email nhắc trước 7 ngày", color: "#a78bfa" },
                    { icon: "ri-shield-check-line", text: "Không bị gián đoạn học", color: "#34d399" },
                    { icon: "ri-close-circle-line", text: "Hủy bất cứ lúc nào", color: "#fb923c" },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/3">
                      <i className={`${item.icon} text-sm flex-shrink-0`} style={{ color: item.color }} />
                      <span className="text-xs text-white/50">{item.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {/* VIP History Link */}
          <SectionCard title="Lịch sử giao dịch VIP" icon="ri-history-line">
            <p className="text-white/35 text-xs mb-4 leading-relaxed">
              Xem lại toàn bộ các lần nâng cấp và gia hạn VIP của bạn, bao gồm ngày kích hoạt, ngày hết hạn và số tiền.
            </p>
            <button
              onClick={() => navigate("/vip-history")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e8c84a]/10 hover:bg-[#e8c84a]/20 border border-[#e8c84a]/20 text-[#e8c84a] text-sm font-medium cursor-pointer whitespace-nowrap transition-colors"
            >
              <i className="ri-history-line" />
              Xem lịch sử giao dịch
            </button>
          </SectionCard>
        </div>
      )}

      {/* Data Tab */}
      {activeTab === "data" && (
        <div className="space-y-5 max-w-2xl">
          <SectionCard title="Dữ liệu học tập trên thiết bị" icon="ri-hard-drive-2-line">
            <p className="text-white/30 text-xs mb-4 leading-relaxed">
              Dữ liệu được lưu trong localStorage của trình duyệt. Xóa từng mục hoặc xóa tất cả nếu muốn bắt đầu lại.
              <span className="text-[#e8c84a]/70"> Dữ liệu đã sync lên cloud sẽ không bị ảnh hưởng.</span>
            </p>
            <div className="space-y-2">
              {LOCAL_STORAGE_KEYS.map(({ key, label }) => {
                const size = getDataSize(key);
                return (
                  <div key={key} className="flex items-center gap-3 px-4 py-3 bg-white/3 rounded-xl">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 flex-shrink-0">
                      <i className="ri-database-line text-white/30 text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/70 text-sm font-medium">{label}</p>
                      <p className="text-white/25 text-[10px]">{size ? size : "Trống"}</p>
                    </div>
                    {size && (
                      <button
                        onClick={() => handleDeleteKey(key, label)}
                        disabled={deletingData === key}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                      >
                        {deletingData === key ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-delete-bin-line"></i>}
                        Xóa
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Xóa toàn bộ dữ liệu" icon="ri-delete-bin-2-line">
            <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <i className="ri-error-warning-line text-red-400 text-lg flex-shrink-0 mt-0.5"></i>
                <div>
                  <p className="text-red-400 font-semibold text-sm mb-1">Cảnh báo: Không thể hoàn tác</p>
                  <p className="text-white/40 text-xs leading-relaxed">
                    Thao tác này sẽ xóa toàn bộ dữ liệu học tập trên thiết bị này (streak, EPS, flashcard, quiz...).
                    Dữ liệu đã đồng bộ lên Supabase cloud sẽ không bị xóa.
                  </p>
                </div>
              </div>
            </div>

            {!deleteAllConfirm ? (
              <button
                onClick={() => setDeleteAllConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap border border-red-500/20"
              >
                <i className="ri-delete-bin-line"></i>
                Xóa toàn bộ dữ liệu học tập
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-white/50 text-sm">Nhập <span className="text-red-400 font-bold">XOA</span> để xác nhận:</p>
                <input
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="Nhập XOA"
                  className="w-full bg-white/5 border border-red-500/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                />
                <div className="flex gap-3">
                  <button onClick={() => { setDeleteAllConfirm(false); setDeleteConfirm(""); }} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm cursor-pointer whitespace-nowrap hover:bg-white/5">
                    Hủy
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    disabled={deleteConfirm !== "XOA"}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold cursor-pointer whitespace-nowrap transition-colors"
                  >
                    Xác nhận xóa
                  </button>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Xuất dữ liệu" icon="ri-download-cloud-line">
            <p className="text-white/30 text-xs mb-4">Tải xuống toàn bộ dữ liệu học tập của bạn dưới dạng JSON.</p>
            <button
              onClick={() => {
                const data: Record<string, unknown> = {};
                LOCAL_STORAGE_KEYS.forEach(({ key }) => {
                  const val = localStorage.getItem(key);
                  if (val) { try { data[key] = JSON.parse(val); } catch { data[key] = val; } }
                });
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = `kts-data-${new Date().toISOString().split("T")[0]}.json`;
                a.click(); URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e8c84a]/10 hover:bg-[#e8c84a]/20 text-[#e8c84a] text-sm font-medium transition-colors cursor-pointer whitespace-nowrap border border-[#e8c84a]/20"
            >
              <i className="ri-download-line"></i>
              Tải xuống dữ liệu (JSON)
            </button>
          </SectionCard>
        </div>
      )}
    </DashboardLayout>
  );
}
