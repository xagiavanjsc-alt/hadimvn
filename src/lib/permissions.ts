// Permission system mirroring ROLE_PRESETS in admin-roles page.
// Keep in sync with admin-roles/page.tsx.

export type Role = "super_admin" | "smod" | "moderator" | "member";

export const ALL_PERMISSIONS = [
  "content.view",       // Xem nội dung
  "content.approve",    // Duyệt bài
  "content.delete",     // Xóa bài
  "reports.view",       // Xem báo cáo
  "reports.resolve",    // Xử lý báo cáo
  "users.view",         // Xem thành viên
  "users.vip",          // Cấp/Hủy VIP
  "users.ban",          // Khóa tài khoản
  "stats.view",         // Xem thống kê
  "system.broadcast",   // Gửi broadcast
  "system.roles",       // Quản lý phân quyền
  "system.settings",    // Cài đặt hệ thống
  "eps.edit",           // Chỉnh sửa EPS
  "eps.upload",         // Upload EPS
] as const;

export type Permission = typeof ALL_PERMISSIONS[number];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [...ALL_PERMISSIONS],
  smod: [
    "content.view", "content.approve", "content.delete",
    "reports.view", "reports.resolve",
    "users.view", "users.ban",
    "stats.view",
    "eps.edit",
  ],
  moderator: [
    "content.view", "content.approve",
    "reports.view", "reports.resolve",
    "users.view",
    "stats.view",
    "eps.edit",
  ],
  member: [],
};

export function hasPermission(role: Role | null | undefined, perm: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(perm) ?? false;
}

export function getRole(profile: { user_role?: string | null; is_admin?: boolean | null } | null | undefined): Role {
  if (!profile) return "member";
  const r = profile.user_role;
  if (r === "super_admin" || r === "smod" || r === "moderator" || r === "member") return r;
  // Legacy: is_admin without user_role → treat as super_admin
  if (profile.is_admin) return "super_admin";
  return "member";
}
