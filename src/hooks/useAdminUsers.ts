/**
 * useAdminUsers — fetch real user data from Supabase for admin panel.
 * Uses security definer RPC to bypass RLS recursion issue.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface AdminUser {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  is_vip: boolean;
  vip_type: "none" | "month" | "year";
  vip_expires_at?: string;
  is_admin: boolean;
  user_role?: "super_admin" | "smod" | "moderator" | "member" | string;
  created_at: string;
  updated_at: string;
  // From leaderboard
  xp_total?: number;
  streak_count?: number;
  words_learned?: number;
  level?: string;
  last_active?: string;
}

export interface LoginSession {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  device_type: string;
  location: string;
  created_at: string;
  is_suspicious: boolean;
  suspicious_reason?: string;
}

interface UseAdminUsersReturn {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateVip: (userId: string, isVip: boolean, vipType?: "month" | "year", expiresAt?: string) => Promise<void>;
  updateAdmin: (userId: string, isAdmin: boolean) => Promise<void>;
}

export function useAdminUsers(): UseAdminUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use RPC security definer function to avoid RLS recursion
      const { data: profiles, error: profileErr } = await supabase
        .rpc("admin_get_users");

      if (profileErr) {
        console.warn("[useAdminUsers] RPC failed, trying fallback:", profileErr.message);
        // Fallback: try direct query with RLS
        const { data: fallback, error: fallbackErr } = await supabase
          .from("user_profiles")
          .select("id, display_name, email, avatar_url, is_vip, vip_type, vip_expires_at, is_admin, user_role, created_at, updated_at")
          .order("created_at", { ascending: false })
          .limit(500);
        if (fallbackErr) {
          console.error("[useAdminUsers] Fallback also failed:", fallbackErr.message);
          throw fallbackErr;
        }
        if (!fallback || fallback.length === 0) {
          console.warn("[useAdminUsers] No users returned from fallback (RLS may be blocking)");
          setUsers([]);
          return;
        }
        await mergeWithLeaderboard(fallback);
        return;
      }

      if (!profiles || profiles.length === 0) {
        console.warn("[useAdminUsers] RPC returned empty");
        setUsers([]);
        return;
      }
      await mergeWithLeaderboard(profiles);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi tải dữ liệu";
      console.error("[useAdminUsers] Error:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const mergeWithLeaderboard = async (profiles: AdminUser[]) => {
    const { data: leaderboard } = await supabase
      .from("leaderboard")
      .select("user_id, xp, streak, words_learned, level, updated_at")
      .in("user_id", profiles.map((p: AdminUser) => p.id));

    const lbMap = new Map((leaderboard ?? []).map(l => [l.user_id, l]));

    const merged: AdminUser[] = profiles.map((p: AdminUser) => {
      const lb = lbMap.get(p.id);
      const vipType = computeVipType(p.is_vip, p.vip_expires_at);
      return {
        id: p.id,
        display_name: p.display_name || "Người dùng",
        email: p.email ?? "",
        avatar_url: p.avatar_url ?? undefined,
        is_vip: p.is_vip ?? false,
        vip_type: vipType,
        vip_expires_at: p.vip_expires_at ?? undefined,
        is_admin: p.is_admin ?? false,
        user_role: p.user_role,
        created_at: p.created_at,
        updated_at: p.updated_at,
        xp_total: lb?.xp ?? 0,
        streak_count: lb?.streak ?? 0,
        words_learned: lb?.words_learned ?? 0,
        level: lb?.level ?? "A1",
        last_active: lb?.updated_at ?? p.updated_at,
      };
    });

    setUsers(merged);
  };

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateVip = useCallback(async (userId: string, isVip: boolean, vipType?: "month" | "year", expiresAt?: string) => {
    const updateData: Record<string, unknown> = {
      is_vip: isVip,
      updated_at: new Date().toISOString(),
    };
    if (!isVip) {
      updateData.vip_expires_at = null;
      updateData.vip_type = "none";
    } else if (expiresAt) {
      updateData.vip_expires_at = expiresAt;
      updateData.vip_type = vipType ?? "month";
    }
    const { error: err } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", userId);
    if (err) throw err;
    setUsers(prev => prev.map(u => u.id === userId ? {
      ...u,
      is_vip: isVip,
      vip_type: isVip ? (vipType ?? "month") : "none",
      vip_expires_at: isVip ? expiresAt : undefined,
    } : u));
  }, []);

  const updateAdmin = useCallback(async (userId: string, isAdmin: boolean) => {
    const { error: err } = await supabase
      .from("user_profiles")
      .update({ is_admin: isAdmin, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (err) throw err;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: isAdmin } : u));
  }, []);

  return { users, loading, error, refetch: fetchUsers, updateVip, updateAdmin };
}

function computeVipType(isVip: boolean, expiresAt?: string): "none" | "month" | "year" {
  if (!isVip || !expiresAt) return "none";
  const daysLeft = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 86400000);
  return daysLeft > 30 ? "year" : "month";
}

export function getAdminStats(users: AdminUser[]) {
  const total = users.length;
  const vipCount = users.filter(u => u.is_vip).length;
  const vipYearCount = users.filter(u => u.vip_type === "year").length;
  const vipMonthCount = users.filter(u => u.vip_type === "month").length;
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
  const activeToday = users.filter(u => {
    if (!u.last_active) return false;
    return Math.floor((Date.now() - new Date(u.last_active).getTime()) / 86400000) <= 1;
  }).length;

  return { total, vipCount, vipYearCount, vipMonthCount, adminCount, newToday, thisWeek, totalXP, avgStreak, activeToday };
}

// Hook to fetch login sessions for admin
export function useLoginSessions(userId?: string) {
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("login_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (userId) query = query.eq("user_id", userId);
      const { data } = await query;
      setSessions(data ?? []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  return { sessions, loading, refetch: fetchSessions };
}

// Track login session when user logs in
export async function trackLoginSession(userId: string) {
  try {
    const ua = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(ua);
    const isTablet = /iPad|Tablet/.test(ua);
    const deviceType = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

    // Check for suspicious: multiple sessions in short time
    const { data: recentSessions } = await supabase
      .from("login_sessions")
      .select("id, created_at, device_type")
      .eq("user_id", userId)
      .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .limit(5);

    const isSuspicious = (recentSessions?.length ?? 0) >= 3;
    const suspiciousReason = isSuspicious ? "Nhiều lần đăng nhập trong 5 phút" : null;

    await supabase.from("login_sessions").insert({
      user_id: userId,
      user_agent: ua.slice(0, 200),
      device_type: deviceType,
      is_suspicious: isSuspicious,
      suspicious_reason: suspiciousReason,
    });

    // If suspicious, send alert email to admin
    if (isSuspicious) {
      // Get user info for the alert
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("display_name, email")
        .eq("id", userId)
        .maybeSingle();

      // Get admin emails
      const { data: admins } = await supabase
        .from("user_profiles")
        .select("email, display_name")
        .eq("is_admin", true)
        .not("email", "is", null);

      if (admins && admins.length > 0) {
        const suspectName = userProfile?.display_name || "Người dùng"
        const suspectEmail = userProfile?.email || "(không rõ)"
        const loginCount = (recentSessions?.length ?? 0) + 1;
        const deviceLabel = deviceType === "mobile" ? "Điện thoại" : deviceType === "tablet" ? "Máy tính bảng" : "Máy tính";
        const timeStr = new Date().toLocaleString("vi-VN");

        for (const admin of admins) {
          if (!admin.email || !admin.email.includes("@")) continue;
          await supabase.functions.invoke("send-email-resend", {
            body: {
              type: "bulk_notification",
              to: admin.email,
              displayName: admin.display_name || "Admin",
              bulkTitle: "⚠️ Cảnh báo: Đăng nhập bất thường",
              bulkBody: `Phát hiện đăng nhập bất thường trên hệ thống:\n\n• Tài khoản: ${suspectName} (${suspectEmail})\n• Số lần đăng nhập trong 5 phút: ${loginCount} lần\n• Thiết bị: ${deviceLabel}\n• Thời gian: ${timeStr}\n\nCó thể tài khoản đang bị chia sẻ hoặc đăng nhập từ nhiều nơi cùng lúc. Hãy kiểm tra trong Admin Panel → Đăng nhập & Bảo mật.`,
            },
          }).catch(() => { /* silent fail */ });
        }
      }
    }
  } catch {
    // Silent fail - don't block login
  }
}
