import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAdminToast } from "@/contexts/AdminToastContext";
import { invalidateCommunitySettingsCache } from "@/hooks/useCommunitySettings";

type AccessMode = "normal" | "holiday" | "maintenance";

const MODE_CONFIG: Record<AccessMode, { label: string; color: string; icon: string; desc: string }> = {
  normal: { label: "Bình thường", color: "#34d399", icon: "ri-shield-check-line", desc: "Áp dụng giới hạn theo cấu hình" },
  holiday: { label: "Lễ/Sự kiện", color: "app-accent-primary", icon: "ri-gift-line", desc: "Mở full — không giới hạn đăng bài và xem" },
  maintenance: { label: "Bảo trì", color: "#f87171", icon: "ri-tools-line", desc: "Không ai đăng được bài mới" },
};

export default function AdminCommunitySettingsPage() {
  const { showToast } = useAdminToast();
  const [saving, setSaving] = useState(false);
  const [accessControlEnabled, setAccessControlEnabled] = useState(true);
  const [guestViewLimit, setGuestViewLimit] = useState(15);
  const [memberDailyPostLimit, setMemberDailyPostLimit] = useState(5);
  const [vipDailyPostLimit, setVipDailyPostLimit] = useState(0);
  const [accessMode, setAccessMode] = useState<AccessMode>("normal");
  const [modeNote, setModeNote] = useState("");

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase.from("community_settings").select("*").eq("id", "global").maybeSingle();
    if (data) {
      setAccessControlEnabled(data.access_control_enabled);
      setGuestViewLimit(data.guest_view_limit);
      setMemberDailyPostLimit(data.member_daily_post_limit);
      setVipDailyPostLimit(data.vip_daily_post_limit);
      setAccessMode(data.access_mode);
      setModeNote(data.mode_note || "");
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("community_settings").update({
      access_control_enabled: accessControlEnabled,
      guest_view_limit: guestViewLimit,
      member_daily_post_limit: memberDailyPostLimit,
      vip_daily_post_limit: vipDailyPostLimit,
      access_mode: accessMode,
      mode_note: modeNote || null,
    }).eq("id", "global");
    setSaving(false);
    if (error) {
      showToast({ type: "error", title: "Lỗi lưu cấu hình", message: error.message });
      return;
    }
    invalidateCommunitySettingsCache();
    showToast({ type: "success", title: "Đã lưu cấu hình cộng đồng" });
  };

  const currentMode = MODE_CONFIG[accessMode];

  return (
    <div className="max-w-2xl space-y-6">

        {/* Access Mode — Quick Toggle */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${currentMode.color}15` }}>
              <i className={`${currentMode.icon} text-sm`} style={{ color: currentMode.color }}></i>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>Chế độ truy cập</p>
              <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Bật/tắt nhanh cho dịp lễ hoặc bảo trì</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {(["normal", "holiday", "maintenance"] as AccessMode[]).map(mode => {
              const cfg = MODE_CONFIG[mode];
              const active = accessMode === mode;
              return (
                <button key={mode} onClick={() => setAccessMode(mode)}
                  className="p-3 rounded-xl border text-center transition-all cursor-pointer"
                  style={{
                    backgroundColor: active ? `${cfg.color}12` : "var(--admin-card2)",
                    borderColor: active ? cfg.color : "var(--admin-border2)",
                  }}>
                  <i className={`${cfg.icon} text-lg block mb-1`} style={{ color: active ? cfg.color : "var(--admin-text-faint)" }}></i>
                  <p className="text-xs font-bold" style={{ color: active ? cfg.color : "var(--admin-text-muted)" }}>{cfg.label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-faint)" }}>{cfg.desc}</p>
                </button>
              );
            })}
          </div>
          {accessMode === "holiday" && (
            <input value={modeNote} onChange={e => setModeNote(e.target.value)} placeholder="Ghi chú sự kiện (ví dụ: Mở full dịp Tết 2026)"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none border"
              style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
          )}
        </div>

        {/* Access Control Toggle */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>Kiểm soát truy cập</p>
              <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Bật để áp dụng giới hạn, tắt để mở full</p>
            </div>
            <button onClick={() => setAccessControlEnabled(!accessControlEnabled)}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${accessControlEnabled ? "bg-emerald-500" : "bg-app-card/70"}`}>
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${accessControlEnabled ? "left-6" : "left-0.5"}`}></div>
            </button>
          </div>

          {accessControlEnabled && (
            <div className="space-y-4">
              {/* Guest view limit */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>
                    <i className="ri-user-line mr-1"></i>Khách xem được mấy bài
                  </p>
                  <span className="text-xs font-bold" style={{ color: "var(--admin-text)" }}>{guestViewLimit} bài</span>
                </div>
                <input type="range" min={0} max={20} value={guestViewLimit} onChange={e => setGuestViewLimit(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ backgroundColor: "var(--admin-card2)" }} />
                <div className="flex justify-between text-[10px] mt-1" style={{ color: "var(--admin-text-faint)" }}>
                  <span>0 (không cho xem)</span>
                  <span>20 (rộng mở)</span>
                </div>
              </div>

              {/* Member daily post limit */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>
                    <i className="ri-user-line mr-1"></i>Thành viên đăng tối đa/ngày
                  </p>
                  <span className="text-xs font-bold" style={{ color: "var(--admin-text)" }}>
                    {memberDailyPostLimit === 0 ? "Không giới hạn" : `${memberDailyPostLimit} bài/ngày`}
                  </span>
                </div>
                <input type="range" min={0} max={20} value={memberDailyPostLimit} onChange={e => setMemberDailyPostLimit(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ backgroundColor: "var(--admin-card2)" }} />
                <div className="flex justify-between text-[10px] mt-1" style={{ color: "var(--admin-text-faint)" }}>
                  <span>0 (không giới hạn)</span>
                  <span>20</span>
                </div>
              </div>

              {/* VIP daily post limit */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>
                    <i className="ri-vip-crown-line mr-1"></i>VIP đăng tối đa/ngày
                  </p>
                  <span className="text-xs font-bold" style={{ color: "var(--admin-text)" }}>
                    {vipDailyPostLimit === 0 ? "Không giới hạn" : `${vipDailyPostLimit} bài/ngày`}
                  </span>
                </div>
                <input type="range" min={0} max={20} value={vipDailyPostLimit} onChange={e => setVipDailyPostLimit(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ backgroundColor: "var(--admin-card2)" }} />
                <div className="flex justify-between text-[10px] mt-1" style={{ color: "var(--admin-text-faint)" }}>
                  <span>0 (không giới hạn)</span>
                  <span>20</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          <p className="font-bold text-sm mb-3" style={{ color: "var(--admin-text)" }}>
            <i className="ri-eye-line mr-1"></i>Xem trước hiệu lực
          </p>
          <div className="space-y-2 text-xs" style={{ color: "var(--admin-text-muted)" }}>
            <p>
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${accessMode === "normal" ? "bg-emerald-400" : accessMode === "holiday" ? "bg-app-accent-primary" : "bg-rose-400"}`}></span>
              Chế độ: <strong style={{ color: "var(--admin-text)" }}>{currentMode.label}</strong>
              {modeNote && <span className="ml-1" style={{ color: currentMode.color }}>({modeNote})</span>}
            </p>
            {!accessControlEnabled && (
              <p style={{ color: "app-accent-primary" }}>⚠️ Kiểm soát truy cập đang TẮT — tất cả đều truy cập tự do</p>
            )}
            {accessControlEnabled && accessMode === "normal" && (
              <>
                <p>• Khách: xem <strong style={{ color: "var(--admin-text)" }}>{guestViewLimit}</strong> bài rồi phải đăng ký</p>
                <p>• Thành viên: <strong style={{ color: "#34d399" }}>xem full</strong>, đăng tối đa <strong style={{ color: "var(--admin-text)" }}>{memberDailyPostLimit === 0 ? "∞" : memberDailyPostLimit}</strong> bài/ngày</p>
                <p>• VIP: <strong style={{ color: "#34d399" }}>xem full</strong>, đăng tối đa <strong style={{ color: "var(--admin-text)" }}>{vipDailyPostLimit === 0 ? "∞" : vipDailyPostLimit}</strong> bài/ngày</p>
              </>
            )}
            {accessMode === "holiday" && (
              <p style={{ color: "#34d399" }}>🎉 Mở full — tất cả đều xem và đăng bài không giới hạn</p>
            )}
            {accessMode === "maintenance" && (
              <p style={{ color: "#f87171" }}>🔧 Không ai đăng được bài mới</p>
            )}
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-sm font-bold cursor-pointer whitespace-nowrap transition-colors disabled:opacity-50">
          {saving ? <i className="ri-loader-4-line animate-spin mr-1"></i> : <i className="ri-save-line mr-1"></i>}
          Lưu cấu hình
        </button>
      </div>
    </div>
  );
}
