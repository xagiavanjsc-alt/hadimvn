import { useState, useMemo, useEffect, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { useAdminUsers, type AdminUser } from "@/hooks/useAdminUsers";
import { supabase } from "@/lib/supabase";

type Role = "super_admin" | "smod" | "moderator" | "member";

interface RoleUser extends AdminUser {
  role: Role;
  permissions: string[];
}

const ALL_PERMISSIONS = [
  { id: "content.view", label: "Xem nội dung", group: "Nội dung", icon: "ri-eye-line", color: "#60a5fa" },
  { id: "content.approve", label: "Duyệt bài viết", group: "Nội dung", icon: "ri-checkbox-circle-line", color: "#34d399" },
  { id: "content.delete", label: "Xóa bài viết", group: "Nội dung", icon: "ri-delete-bin-line", color: "#f87171" },
  { id: "reports.view", label: "Xem báo cáo", group: "Báo cáo", icon: "ri-flag-line", color: "#fb923c" },
  { id: "reports.resolve", label: "Xử lý báo cáo", group: "Báo cáo", icon: "ri-shield-check-line", color: "#34d399" },
  { id: "users.view", label: "Xem thành viên", group: "Thành viên", icon: "ri-user-line", color: "#a78bfa" },
  { id: "users.vip", label: "Cấp/Hủy VIP", group: "Thành viên", icon: "ri-vip-crown-line", color: "app-accent-primary" },
  { id: "users.ban", label: "Khóa tài khoản", group: "Thành viên", icon: "ri-user-forbid-line", color: "#f87171" },
  { id: "stats.view", label: "Xem thống kê", group: "Thống kê", icon: "ri-bar-chart-line", color: "#34d399" },
  { id: "system.broadcast", label: "Gửi broadcast", group: "Hệ thống", icon: "ri-broadcast-line", color: "#f87171" },
  { id: "system.roles", label: "Quản lý phân quyền", group: "Hệ thống", icon: "ri-shield-keyhole-line", color: "#f87171" },
  { id: "system.settings", label: "Cài đặt hệ thống", group: "Hệ thống", icon: "ri-settings-3-line", color: "#f87171" },
  { id: "eps.edit", label: "Chỉnh sửa EPS", group: "Nội dung học", icon: "ri-edit-line", color: "app-accent-primary" },
  { id: "eps.upload", label: "Upload EPS", group: "Nội dung học", icon: "ri-upload-cloud-2-line", color: "app-accent-primary" },
];

const ROLE_PRESETS: Record<Role, { label: string; color: string; bg: string; icon: string; desc: string; permissions: string[] }> = {
  super_admin: {
    label: "Super Admin", color: "#f87171", bg: "rgba(248,113,113,0.12)",
    icon: "ri-shield-star-line", desc: "Toàn quyền truy cập và quản lý hệ thống",
    permissions: ALL_PERMISSIONS.map(p => p.id),
  },
  smod: {
    label: "SMod", color: "#a78bfa", bg: "rgba(167,139,250,0.12)",
    icon: "ri-shield-keyhole-line", desc: "Quản lý cộng đồng, duyệt nội dung, xử lý báo cáo, quản lý thành viên",
    permissions: ["content.view", "content.approve", "reports.view", "reports.resolve", "users.view", "users.ban", "stats.view", "eps.edit", "community.settings"],
  },
  moderator: {
    label: "Moderator", color: "app-accent-primary", bg: "rgba(232,200,74,0.12)",
    icon: "ri-shield-check-line", desc: "Duyệt nội dung, xử lý báo cáo, quản lý thành viên cơ bản",
    permissions: ["content.view", "content.approve", "reports.view", "reports.resolve", "users.view", "stats.view", "eps.edit"],
  },
  member: {
    label: "Thành viên", color: "#6b7280", bg: "rgba(107,114,128,0.12)",
    icon: "ri-user-line", desc: "Không có quyền admin",
    permissions: [],
  },
};

export default function AdminRolesPage() {
  const { users, loading } = useAdminUsers();
  const [roleUsers, setRoleUsers] = useState<RoleUser[]>([]);
  const [editUser, setEditUser] = useState<RoleUser | null>(null);
  const [filterRole, setFilterRole] = useState<Role | "all">("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadRoles = useCallback(async () => {
    if (users.length === 0) return;
    try {
      // Use RPC to bypass RLS and get user_role for all users
      const { data: profiles, error } = await supabase
        .rpc("admin_get_users");
      if (error) {
        console.error("[loadRoles] RPC error:", error);
        // Fallback: try direct SELECT (may be limited by RLS)
        const { data: fallback } = await supabase
          .from("user_profiles")
          .select("id, user_role, is_admin")
          .in("id", users.map(u => u.id));
        const roleMap = new Map((fallback ?? []).map(p => [p.id, (p.user_role || (p.is_admin ? "super_admin" : "member")) as Role]));
        setRoleUsers(users.map(u => {
          const role: Role = roleMap.get(u.id) || (u.is_admin ? "super_admin" : "member");
          return { ...u, role, permissions: ROLE_PRESETS[role]?.permissions ?? [] };
        }));
        return;
      }
      // Build role map from RPC data (includes user_role)
      const roleMap = new Map(
        (profiles ?? []).map((p: { id: string; user_role?: string; is_admin: boolean }) => [
          p.id,
          (p.user_role || (p.is_admin ? "super_admin" : "member")) as Role
        ])
      );
      setRoleUsers(users.map(u => {
        const rawRole: string = (roleMap.get(u.id) as string) || (u.is_admin ? "super_admin" : "member");
        const role: Role = (["super_admin", "smod", "moderator", "member"] as string[]).includes(rawRole) ? rawRole as Role : (u.is_admin ? "super_admin" : "member");
        return { ...u, role, permissions: ROLE_PRESETS[role]?.permissions ?? [] };
      }));
    } catch (err) {
      console.error("[loadRoles] Exception:", err);
      // Final fallback
      setRoleUsers(users.map(u => {
        const role: Role = u.is_admin ? "super_admin" : "member";
        return { ...u, role, permissions: ROLE_PRESETS[role]?.permissions ?? [] };
      }));
    }
  }, [users]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const handleSave = async (userId: string, role: Role, permissions: string[]) => {
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc("update_user_role", {
        p_user_id: userId,
        p_role: role,
        p_permissions: permissions,
      });

      if (error) {
        showToast(`Lỗi: ${error.message}`);
        return;
      }
      if (data?.error) {
        showToast(`❌ ${data.error}`);
        return;
      }

      // Refresh full list
      await loadRoles();
      setEditUser(null);
      showToast(`✅ Đã cập nhật quyền → ${ROLE_PRESETS[role].label}`);
    } catch (err) {
      console.error("[handleSave] Exception:", err);
      const msg = err instanceof Error ? err.message : "Lỗi cập nhật quyền";
      showToast(`Lỗi: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...roleUsers];
    if (filterRole !== "all") list = list.filter(u => u.role === filterRole);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => u.display_name.toLowerCase().includes(q));
    }
    return list;
  }, [roleUsers, filterRole, search]);

  const stats = {
    superAdmin: roleUsers.filter(u => u.role === "super_admin").length,
    smod: roleUsers.filter(u => u.role === "smod").length,
    moderator: roleUsers.filter(u => u.role === "moderator").length,
    member: roleUsers.filter(u => u.role === "member").length,
  };

  return (
    <AdminLayout title="Phân quyền Admin" subtitle={`Quản lý vai trò — dữ liệu thực từ Supabase (${roleUsers.length} thành viên)`}>
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500 text-white text-sm font-medium">
          <i className="ri-checkbox-circle-line"></i>{toast}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {([
          { key: "superAdmin", role: "super_admin" as Role },
          { key: "smod", role: "smod" as Role },
          { key: "moderator", role: "moderator" as Role },
          { key: "member", role: "member" as Role },
        ] as const).map(({ key, role }) => {
          const cfg = ROLE_PRESETS[role];
          return (
            <div key={key} className="rounded-xl p-5 border" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: cfg.bg }}>
                  <i className={`${cfg.icon} text-base`} style={{ color: cfg.color }}></i>
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>{cfg.label}</p>
                  <p className="text-[10px]" style={{ color: "var(--admin-text-muted)" }}>{cfg.desc}</p>
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: cfg.color }}>{stats[key]}</p>
            </div>
          );
        })}
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5 text-xs"
        style={{ backgroundColor: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", color: "rgba(52,211,153,0.80)" }}>
        <i className="ri-database-2-line flex-shrink-0"></i>
        Dữ liệu thực từ Supabase. Thay đổi vai trò sẽ cập nhật trực tiếp vào DB (is_admin field).
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--admin-text-faint)" }}></i>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm thành viên..."
            className="w-full rounded-xl pl-8 pr-4 py-2 text-xs outline-none border"
            style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--admin-card2)" }}>
          {(["all", "super_admin", "smod", "moderator", "member"] as const).map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: filterRole === r ? "var(--admin-hover)" : "transparent",
                color: filterRole === r ? (r === "all" ? "var(--admin-text)" : ROLE_PRESETS[r]?.color) : "var(--admin-text-faint)",
              }}>
              {r === "all" ? "Tất cả" : ROLE_PRESETS[r].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(user => {
            const cfg = ROLE_PRESETS[user.role];
            return (
              <div key={user.id} className="flex items-center gap-4 px-5 py-4 rounded-xl border"
                style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: cfg.bg }}>
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover rounded-xl" />
                    : <i className={`${cfg.icon} text-base`} style={{ color: cfg.color }}></i>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>{user.display_name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                      <i className={`${cfg.icon} mr-1`}></i>{cfg.label}
                    </span>
                    {user.is_vip && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-app-accent-primary/12 text-app-accent-primary">VIP</span>}
                  </div>
                  <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                    ID: {user.id.slice(0, 12)}... · Đăng ký {new Date(user.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="text-center flex-shrink-0 hidden lg:block">
                  <p className="text-lg font-bold" style={{ color: cfg.color }}>{user.permissions.length}</p>
                  <p className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>quyền</p>
                </div>
                <button onClick={() => setEditUser(user)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap"
                  style={{ backgroundColor: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                  <i className="ri-edit-line"></i>Phân quyền
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
              <div>
                <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>Phân quyền: {editUser.display_name}</p>
                <p className="text-[10px]" style={{ color: "var(--admin-text-muted)" }}>Chọn vai trò và lưu vào Supabase</p>
              </div>
              <button onClick={() => setEditUser(null)} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "var(--admin-text-muted)" }}>
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="p-5 space-y-3">
              {(Object.entries(ROLE_PRESETS) as [Role, typeof ROLE_PRESETS[Role]][]).map(([r, cfg]) => (
                <div key={r}
                  className="flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all"
                  style={{
                    backgroundColor: editUser.role === r ? cfg.bg : "var(--admin-card2)",
                    borderColor: editUser.role === r ? `${cfg.color}40` : "var(--admin-border)",
                  }}
                  onClick={() => setEditUser({ ...editUser, role: r, permissions: [...ROLE_PRESETS[r].permissions] })}>
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${cfg.color}15` }}>
                    <i className={`${cfg.icon} text-base`} style={{ color: cfg.color }}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>{cfg.label}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        {cfg.permissions.length} quyền
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{cfg.desc}</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ borderColor: editUser.role === r ? cfg.color : "var(--admin-border2)", backgroundColor: editUser.role === r ? cfg.color : "transparent" }}>
                    {editUser.role === r && <i className="ri-check-line text-white text-[10px]"></i>}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t flex gap-3" style={{ borderColor: "var(--admin-border)" }}>
              <button onClick={() => setEditUser(null)}
                className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>
                Hủy
              </button>
              <button onClick={() => handleSave(editUser.id, editUser.role, editUser.permissions)}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
                {saving ? "Đang lưu..." : "Lưu vào Supabase"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}


