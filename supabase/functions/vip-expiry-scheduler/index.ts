import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://hanquocoi.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function buildVipExpiryEmail(displayName: string, daysLeft: number, expiresAtStr: string, vipType: string, renewUrl: string) {
  const urgencyColor = daysLeft <= 3 ? "#ef4444" : daysLeft <= 7 ? "#f97316" : "#e8c84a";
  const urgencyText = daysLeft <= 3 ? "⚠️ Khẩn cấp" : daysLeft <= 7 ? "🔔 Sắp hết hạn" : "📅 Nhắc nhở";
  const vipLabel = vipType === "year" ? "VIP Năm" : "VIP Tháng";

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gia hạn VIP - Hàn Quốc Ơi!</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#f43f5e,#fb923c);border-radius:16px;padding:12px 24px;">
        <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">🇰🇷 Hàn Quốc Ơi!</span>
      </div>
    </div>
    <div style="background:#1a1a1a;border-radius:20px;padding:32px;border:1px solid #2a2a2a;margin-bottom:20px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="background:${urgencyColor}20;color:${urgencyColor};border:1px solid ${urgencyColor}40;border-radius:100px;padding:6px 16px;font-size:13px;font-weight:700;">${urgencyText}</span>
      </div>
      <h1 style="color:#fff;font-size:22px;font-weight:800;text-align:center;margin:0 0 8px;">Gói ${vipLabel} của bạn sắp hết hạn!</h1>
      <p style="color:#9ca3af;font-size:14px;text-align:center;margin:0 0 28px;">Xin chào <strong style="color:#f9fafb;">${displayName}</strong>, đừng để gián đoạn hành trình học tiếng Hàn nhé!</p>
      <div style="background:#0f0f0f;border-radius:16px;padding:20px;text-align:center;margin-bottom:24px;border:1px solid ${urgencyColor}30;">
        <p style="color:#6b7280;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Còn lại</p>
        <p style="color:${urgencyColor};font-size:48px;font-weight:900;margin:0;line-height:1;">${daysLeft}</p>
        <p style="color:#9ca3af;font-size:14px;margin:4px 0 0;">ngày · Hết hạn ${expiresAtStr}</p>
      </div>
      <div style="margin-bottom:24px;">
        <p style="color:#9ca3af;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Bạn sẽ mất quyền truy cập:</p>
        ${["Toàn bộ kho từ vựng EPS không giới hạn","Học qua tin tức Naver thật","Ghi âm & so sánh phát âm AI","Xuất CSV/Anki/PDF không giới hạn","Lộ trình TOPIK cá nhân hóa"].map(f => `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #2a2a2a;"><span style="color:#ef4444;font-size:16px;">✗</span><span style="color:#d1d5db;font-size:13px;">${f}</span></div>`).join("")}
      </div>
      <a href="${renewUrl}" style="display:block;background:linear-gradient(135deg,#f43f5e,#fb923c);color:#fff;text-decoration:none;text-align:center;padding:16px 24px;border-radius:14px;font-size:16px;font-weight:800;">🔄 Gia hạn ngay — Giữ streak học tập!</a>
      <p style="color:#6b7280;font-size:12px;text-align:center;margin:16px 0 0;">Gia hạn trước ${expiresAtStr} để không mất dữ liệu học tập</p>
    </div>
    <div style="text-align:center;padding:16px;">
      <p style="color:#4b5563;font-size:11px;margin:0;">Hàn Quốc Ơi! · Nền tảng học tiếng Hàn hàng đầu Việt Nam<br><a href="${SITE_URL}/settings" style="color:#6b7280;text-decoration:underline;">Hủy đăng ký email</a></p>
    </div>
  </div>
</body>
</html>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Hàn Quốc Ơi! <noreply@hanquocoi.com>", to: [to], subject, html }),
    });
    return res.ok;
  } catch { return false; }
}

async function logAudit(action: string, detail: string, metadata: Record<string, unknown>) {
  try {
    await supabase.from("admin_audit_logs").insert({
      action_type: action,
      action_label: "Email Scheduler (Auto)",
      actor_name: "System Cron",
      detail,
      metadata,
      ip_address: "scheduler",
    });
  } catch { /* ignore */ }
}

serve(async (req) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("x-scheduler-secret");
  const schedulerSecret = Deno.env.get("SCHEDULER_SECRET");
  if (schedulerSecret && authHeader !== schedulerSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const results = { checked: 0, sent: 0, failed: 0, skipped: 0, details: [] as string[] };

  try {
    const NOTIFY_DAYS = [7, 3, 1];

    for (const days of NOTIFY_DAYS) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);

      const windowStart = new Date(targetDate);
      windowStart.setHours(0, 0, 0, 0);
      const windowEnd = new Date(targetDate);
      windowEnd.setHours(23, 59, 59, 999);

      const { data: expiringUsers, error } = await supabase
        .from("user_profiles")
        .select("id, display_name, is_vip, vip_expires_at, vip_type")
        .eq("is_vip", true)
        .gte("vip_expires_at", windowStart.toISOString())
        .lte("vip_expires_at", windowEnd.toISOString());

      if (error) {
        results.details.push(`Error fetching ${days}d users: ${error.message}`);
        continue;
      }

      results.checked += (expiringUsers || []).length;

      for (const user of expiringUsers || []) {
        const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
        const email = authUser?.user?.email;

        if (!email) {
          results.skipped++;
          continue;
        }

        // Check if already sent in last 24h
        const { data: recentLog } = await supabase
          .from("admin_audit_logs")
          .select("id")
          .eq("action_type", "auto_vip_reminder")
          .gte("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (recentLog) {
          results.skipped++;
          results.details.push(`Already sent ${days}d reminder to ${email}`);
          continue;
        }

        const expiresAt = new Date(user.vip_expires_at);
        const daysLeft = Math.max(1, Math.floor((expiresAt.getTime() - now.getTime()) / 86400000));
        const vipType = user.vip_type || (daysLeft > 30 ? "year" : "month");
        const expiresAtStr = expiresAt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
        const renewUrl = `${SITE_URL}/pricing`;

        const html = buildVipExpiryEmail(user.display_name || "Học viên", daysLeft, expiresAtStr, vipType, renewUrl);
        const subject = daysLeft <= 3
          ? `⚠️ Khẩn: VIP của bạn hết hạn sau ${daysLeft} ngày!`
          : `🔔 VIP của bạn sắp hết hạn (còn ${daysLeft} ngày)`;

        const ok = await sendEmail(email, subject, html);

        if (ok) {
          results.sent++;
          results.details.push(`✓ Sent ${days}d reminder to ${email}`);
          await logAudit(
            "auto_vip_reminder",
            `Tự động gửi email nhắc gia hạn VIP đến ${user.display_name || email} (còn ${daysLeft} ngày)`,
            { user_id: user.id, email, days_left: days, vip_type: vipType, expires_at: user.vip_expires_at },
          );
        } else {
          results.failed++;
          results.details.push(`✗ Failed to send to ${email}`);
        }

        await new Promise(r => setTimeout(r, 100));
      }
    }

    await logAudit(
      "scheduler_run",
      `Email Scheduler: ${results.checked} kiểm tra, ${results.sent} gửi, ${results.failed} lỗi`,
      { ...results, run_at: now.toISOString() },
    );

    return new Response(JSON.stringify({ success: true, timestamp: now.toISOString(), ...results }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ success: false, error: errMsg, timestamp: now.toISOString() }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
