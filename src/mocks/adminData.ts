export interface AdminUser {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  is_vip: boolean;
  vip_expires_at?: string;
  is_admin: boolean;
  created_at: string;
  last_active?: string;
  xp_total?: number;
  streak_count?: number;
}

export const mockAdminUsers: AdminUser[] = [
  {
    id: "usr-001",
    display_name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    is_vip: true,
    vip_expires_at: "2026-12-31T00:00:00Z",
    is_admin: false,
    created_at: "2026-01-15T08:30:00Z",
    last_active: "2026-04-23T10:00:00Z",
    xp_total: 12500,
    streak_count: 45,
  },
  {
    id: "usr-002",
    display_name: "Trần Thị B",
    email: "tranthib@gmail.com",
    is_vip: false,
    is_admin: false,
    created_at: "2026-02-20T14:15:00Z",
    last_active: "2026-04-22T18:30:00Z",
    xp_total: 3200,
    streak_count: 12,
  },
  {
    id: "usr-003",
    display_name: "Lê Văn C",
    email: "levanc@gmail.com",
    is_vip: true,
    vip_expires_at: "2026-06-15T00:00:00Z",
    is_admin: true,
    created_at: "2025-11-10T09:00:00Z",
    last_active: "2026-04-23T09:45:00Z",
    xp_total: 28000,
    streak_count: 120,
  },
  {
    id: "usr-004",
    display_name: "Phạm Thị D",
    email: "phamthid@gmail.com",
    is_vip: false,
    is_admin: false,
    created_at: "2026-03-05T11:20:00Z",
    last_active: "2026-04-20T16:00:00Z",
    xp_total: 1500,
    streak_count: 5,
  },
  {
    id: "usr-005",
    display_name: "Hoàng Văn E",
    email: "hoangvane@gmail.com",
    is_vip: true,
    vip_expires_at: "2026-08-20T00:00:00Z",
    is_admin: false,
    created_at: "2026-01-28T07:45:00Z",
    last_active: "2026-04-23T08:15:00Z",
    xp_total: 8900,
    streak_count: 30,
  },
  {
    id: "usr-006",
    display_name: "Vũ Thị F",
    email: "vuthif@gmail.com",
    is_vip: false,
    is_admin: false,
    created_at: "2026-04-01T10:00:00Z",
    last_active: "2026-04-23T11:30:00Z",
    xp_total: 800,
    streak_count: 8,
  },
  {
    id: "usr-007",
    display_name: "Đặng Văn G",
    email: "dangvang@gmail.com",
    is_vip: true,
    vip_expires_at: "2026-10-10T00:00:00Z",
    is_admin: false,
    created_at: "2025-12-15T13:30:00Z",
    last_active: "2026-04-21T20:00:00Z",
    xp_total: 15600,
    streak_count: 67,
  },
  {
    id: "usr-008",
    display_name: "Bùi Thị H",
    email: "buithih@gmail.com",
    is_vip: false,
    is_admin: false,
    created_at: "2026-03-18T15:00:00Z",
    last_active: "2026-04-19T14:20:00Z",
    xp_total: 2100,
    streak_count: 15,
  },
];

export function getAdminStats(users: AdminUser[]) {
  const total = users.length;
  const vipCount = users.filter(u => u.is_vip).length;
  const adminCount = users.filter(u => u.is_admin).length;
  const today = new Date().toISOString().split("T")[0];
  const newToday = users.filter(u => u.created_at.startsWith(today)).length;
  const thisWeek = users.filter(u => {
    const d = new Date(u.created_at);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;
  const totalXP = users.reduce((s, u) => s + (u.xp_total || 0), 0);
  const avgStreak = total > 0 ? Math.round(users.reduce((s, u) => s + (u.streak_count || 0), 0) / total) : 0;

  return { total, vipCount, adminCount, newToday, thisWeek, totalXP, avgStreak };
}