import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  type: "confirm_signup" | "reset_password" | "welcome" | "weekly_report" | "vip_expiry_reminder" | "vip_granted" | "bulk_notification";
  to: string;
  displayName?: string;
  confirmUrl?: string;
  resetUrl?: string;
  subject?: string;
  body?: string;
  vipExpiresAt?: string;
  daysLeft?: number;
  vipType?: "month" | "year";
  renewUrl?: string;
  bulkTitle?: string;
  bulkBody?: string;
  reportData?: {
    weekLabel: string;
    xpEarned: number;
    wordsLearned: number;
    streakDays: number;
    accuracy: number;
    studyDays: number;
    srCardsReviewed: number;
    srMastered: number;
    quizScores: { date: string; score: number; total: number; lesson: string }[];
  };
}

function getSiteUrl(): string {
  return "https://hanquocoi.vn";
}

function getCurrentYear(): number {
  return new Date().getFullYear();
}

function getFromAddress(): string {
  // Priority 1: RESEND_FROM_EMAIL (full email address like "Hàn Quốc Ơi! <noreply@yourdomain.com>")
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
  if (fromEmail) return fromEmail;

  // Priority 2: RESEND_FROM_DOMAIN (just the domain, e.g. "hanquocoi.vn")
  const fromDomain = Deno.env.get("RESEND_FROM_DOMAIN");
  if (fromDomain) return `Hàn Quốc Ơi! <noreply@${fromDomain}>`;

  // Fallback: onboarding@resend.dev (only works for testing, not production)
  // To fix this: Go to Supabase Dashboard → Edge Functions → Secrets
  // Add: RESEND_FROM_DOMAIN = hanquocoi.vn (after verifying domain in Resend)
  // OR: RESEND_FROM_EMAIL = Hàn Quốc Ơi! <noreply@hanquocoi.vn>
  return "Hàn Quốc Ơi! <onboarding@resend.dev>";
}

function getFooterHtml(siteUrl: string): string {
  const year = getCurrentYear();
  return `<div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
    <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0 0 6px;">© ${year} Hàn Quốc Ơi! — Học tiếng Hàn EPS-TOPIK</p>
    <a href="${siteUrl}" style="color:rgba(232,200,74,0.5);font-size:11px;text-decoration:none;">${siteUrl}</a>
  </div>`;
}

function getVipExpiryReminderHtml(name: string, daysLeft: number, expiresAt: string, vipType: string, renewUrl: string): string {
  const siteUrl = getSiteUrl();
  const isUrgent = daysLeft <= 3;
  const accentColor = isUrgent ? "#f87171" : "#e8c84a";
  const bgColor = isUrgent ? "rgba(248,113,113,0.08)" : "rgba(232,200,74,0.08)";
  const borderColor = isUrgent ? "rgba(248,113,113,0.20)" : "rgba(232,200,74,0.20)";
  const emoji = isUrgent ? "⚠️" : "⏰";
  const urgencyText = isUrgent
    ? `Chỉ còn <strong style="color:${accentColor};">${daysLeft} ngày</strong> — hãy gia hạn ngay!`
    : `Còn <strong style="color:${accentColor};">${daysLeft} ngày</strong> trước khi hết hạn.`;

  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Nhắc gia hạn VIP</title></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px;">
    <div style="background:#1a1d27;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
      <div style="background:linear-gradient(135deg,${bgColor},rgba(251,146,60,0.05));padding:40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="font-size:40px;margin-bottom:16px;">${emoji}</div>
        <h1 style="color:#ffffff;font-size:22px;margin:0 0 8px;font-weight:700;">VIP của bạn sắp hết hạn</h1>
        <p style="color:rgba(255,255,255,0.45);font-size:14px;margin:0;">Hàn Quốc Ơi! — Thông báo gia hạn</p>
      </div>
      <div style="padding:36px 32px;">
        <p style="color:rgba(255,255,255,0.85);font-size:16px;margin:0 0 8px;font-weight:600;">Xin chào <span style="color:${accentColor};">${name}</span>!</p>
        <p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.7;margin:0 0 20px;">
          Gói <strong style="color:rgba(255,255,255,0.8);">VIP ${vipType === "year" ? "Năm" : "Tháng"}</strong> của bạn sẽ hết hạn vào ngày <strong style="color:${accentColor};">${expiresAt}</strong>. ${urgencyText}
        </p>
        <div style="background:${bgColor};border:1px solid ${borderColor};border-radius:14px;padding:20px;margin-bottom:24px;">
          <p style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 14px;">Sau khi hết hạn, bạn sẽ mất:</p>
          ${["Xuất CSV/Anki/PDF từ vựng", "Học qua tin tức Naver thật", "Ghi âm & so sánh phát âm AI", "Toàn bộ kho K-pop Lesson", "Lộ trình TOPIK cá nhân hóa"].map(f =>
            `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span style="color:#f87171;font-size:14px;">✗</span><span style="color:rgba(255,255,255,0.55);font-size:13px;">${f}</span></div>`
          ).join("")}
        </div>
        <div style="text-align:center;margin:28px 0;">
          <a href="${renewUrl || siteUrl + '/pricing'}" style="display:inline-block;background:${accentColor};color:#0f1117;font-weight:700;font-size:16px;padding:16px 44px;border-radius:14px;text-decoration:none;">🔄 Gia hạn VIP ngay</a>
          <p style="color:rgba(255,255,255,0.25);font-size:12px;margin:12px 0 0;">Gia hạn VIP Năm để tiết kiệm hơn 30%</p>
        </div>
      </div>
      ${getFooterHtml(siteUrl)}
    </div>
  </div>
</body></html>`;
}

function getVipGrantedHtml(name: string, vipType: string, expiresAt: string): string {
  const siteUrl = getSiteUrl();
  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Chúc mừng VIP</title></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px;">
    <div style="background:#1a1d27;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
      <div style="background:linear-gradient(135deg,rgba(232,200,74,0.15),rgba(251,146,60,0.08));padding:40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="font-size:48px;margin-bottom:16px;">👑</div>
        <h1 style="color:#e8c84a;font-size:24px;margin:0 0 8px;font-weight:700;">Chúc mừng! Bạn đã là VIP!</h1>
        <p style="color:rgba(255,255,255,0.45);font-size:14px;margin:0;">Hàn Quốc Ơi! — Kích hoạt thành công</p>
      </div>
      <div style="padding:36px 32px;">
        <p style="color:rgba(255,255,255,0.85);font-size:16px;margin:0 0 8px;font-weight:600;">Xin chào <span style="color:#e8c84a;">${name}</span>! 🎉</p>
        <p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.7;margin:0 0 20px;">
          Tài khoản của bạn đã được nâng cấp lên <strong style="color:#e8c84a;">VIP ${vipType === "year" ? "Năm" : "Tháng"}</strong> thành công! Gói VIP có hiệu lực đến <strong style="color:#e8c84a;">${expiresAt}</strong>.
        </p>
        <div style="background:rgba(232,200,74,0.06);border:1px solid rgba(232,200,74,0.15);border-radius:14px;padding:20px;margin-bottom:24px;">
          <p style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 14px;">Bạn đã mở khóa:</p>
          ${["Xuất CSV/Anki/PDF không giới hạn", "Học qua tin tức Naver thật", "Ghi âm & AI chấm phát âm", "Toàn bộ kho K-pop Lesson (1000+ bài)", "Lộ trình TOPIK cá nhân hóa AI", "Ebook Builder không giới hạn", "Hỗ trợ ưu tiên qua Zalo"].map(f =>
            `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span style="color:#e8c84a;font-size:14px;">✓</span><span style="color:rgba(255,255,255,0.65);font-size:13px;">${f}</span></div>`
          ).join("")}
        </div>
        <div style="text-align:center;margin:28px 0;">
          <a href="${siteUrl}" style="display:inline-block;background:#e8c84a;color:#0f1117;font-weight:700;font-size:16px;padding:16px 44px;border-radius:14px;text-decoration:none;">🚀 Khám phá tính năng VIP ngay</a>
        </div>
      </div>
      ${getFooterHtml(siteUrl)}
    </div>
  </div>
</body></html>`;
}

function getBulkNotificationHtml(name: string, title: string, body: string): string {
  const siteUrl = getSiteUrl();
  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px;">
    <div style="background:#1a1d27;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
      <div style="background:linear-gradient(135deg,rgba(167,139,250,0.12),rgba(244,63,94,0.06));padding:40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="font-size:40px;margin-bottom:16px;">📢</div>
        <h1 style="color:#ffffff;font-size:22px;margin:0 0 8px;font-weight:700;">${title}</h1>
        <p style="color:rgba(255,255,255,0.45);font-size:14px;margin:0;">Hàn Quốc Ơi! — Thông báo</p>
      </div>
      <div style="padding:36px 32px;">
        <p style="color:rgba(255,255,255,0.85);font-size:16px;margin:0 0 16px;font-weight:600;">Xin chào <span style="color:#a78bfa;">${name}</span>!</p>
        <div style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.8;margin:0 0 28px;white-space:pre-line;">${body}</div>
        <div style="text-align:center;">
          <a href="${siteUrl}" style="display:inline-block;background:#a78bfa;color:#ffffff;font-weight:700;font-size:15px;padding:14px 40px;border-radius:12px;text-decoration:none;">Vào học ngay</a>
        </div>
      </div>
      ${getFooterHtml(siteUrl)}
    </div>
  </div>
</body></html>`;
}

function getConfirmSignupHtml(name: string, confirmUrl: string): string {
  const siteUrl = getSiteUrl();
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>Xác nhận tài khoản</title></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',sans-serif;">
<div style="max-width:560px;margin:40px auto;padding:0 16px;">
<div style="background:#1a1d27;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">
<div style="background:linear-gradient(135deg,rgba(232,200,74,0.15),rgba(251,146,60,0.08));padding:40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
<div style="font-size:48px;margin-bottom:16px;">🇰🇷</div>
<h1 style="color:#fff;font-size:22px;margin:0 0 8px;font-weight:700;">Hàn Quốc Ơi!</h1>
<p style="color:rgba(255,255,255,0.45);font-size:14px;margin:0;">Xác nhận địa chỉ email</p>
</div>
<div style="padding:36px 32px;">
<p style="color:rgba(255,255,255,0.85);font-size:15px;margin:0 0 16px;">Xin chào <strong style="color:#e8c84a;">${name}</strong>!</p>
<p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.7;margin:0 0 28px;">Nhấn nút bên dưới để xác nhận tài khoản và bắt đầu học tiếng Hàn:</p>
<div style="text-align:center;margin:32px 0;">
<a href="${confirmUrl}" style="display:inline-block;background:#e8c84a;color:#0f1117;font-weight:700;font-size:16px;padding:16px 44px;border-radius:14px;text-decoration:none;">✅ Xác nhận tài khoản</a>
</div>
<div style="background:rgba(251,146,60,0.06);border:1px solid rgba(251,146,60,0.15);border-radius:10px;padding:14px 16px;">
<p style="color:rgba(251,146,60,0.8);font-size:12px;margin:0;">⏰ Link có hiệu lực trong 24 giờ.</p>
</div>
</div>
${getFooterHtml(siteUrl)}
</div></div></body></html>`;
}

function getResetPasswordHtml(name: string, resetUrl: string): string {
  const siteUrl = getSiteUrl();
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>Đặt lại mật khẩu</title></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',sans-serif;">
<div style="max-width:560px;margin:40px auto;padding:0 16px;">
<div style="background:#1a1d27;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">
<div style="background:linear-gradient(135deg,rgba(248,113,113,0.12),rgba(251,146,60,0.08));padding:40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
<div style="font-size:48px;margin-bottom:16px;">🔐</div>
<h1 style="color:#fff;font-size:22px;margin:0 0 8px;font-weight:700;">Đặt lại mật khẩu</h1>
</div>
<div style="padding:36px 32px;">
<p style="color:rgba(255,255,255,0.85);font-size:15px;margin:0 0 16px;">Xin chào <strong style="color:#f87171;">${name}</strong>!</p>
<p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.7;margin:0 0 28px;">Nhấn nút bên dưới để đặt lại mật khẩu:</p>
<div style="text-align:center;margin:32px 0;">
<a href="${resetUrl}" style="display:inline-block;background:#f87171;color:#fff;font-weight:700;font-size:16px;padding:16px 44px;border-radius:14px;text-decoration:none;">🔑 Đặt lại mật khẩu</a>
</div>
<div style="background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.15);border-radius:10px;padding:14px 16px;">
<p style="color:rgba(248,113,113,0.8);font-size:12px;margin:0;">🛡️ Link có hiệu lực trong 1 giờ. Không chia sẻ link này.</p>
</div>
</div>
${getFooterHtml(siteUrl)}
</div></div></body></html>`;
}

function getWelcomeHtml(name: string): string {
  const siteUrl = getSiteUrl();
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>Chào mừng</title></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',sans-serif;">
<div style="max-width:560px;margin:40px auto;padding:0 16px;">
<div style="background:#1a1d27;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">
<div style="background:linear-gradient(135deg,rgba(52,211,153,0.12),rgba(232,200,74,0.08));padding:40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
<div style="font-size:48px;margin-bottom:16px;">🎉</div>
<h1 style="color:#fff;font-size:22px;margin:0 0 8px;font-weight:700;">Chào mừng đến Hàn Quốc Ơi!</h1>
</div>
<div style="padding:36px 32px;">
<p style="color:rgba(255,255,255,0.85);font-size:15px;margin:0 0 16px;">Xin chào <strong style="color:#34d399;">${name}</strong>! 🎊</p>
<p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.7;margin:0 0 28px;">Tài khoản đã được xác nhận thành công! Bắt đầu hành trình học tiếng Hàn ngay nào!</p>
<div style="text-align:center;margin:28px 0;">
<a href="${siteUrl}" style="display:inline-block;background:#e8c84a;color:#0f1117;font-weight:700;font-size:16px;padding:16px 44px;border-radius:14px;text-decoration:none;">🚀 Bắt đầu học ngay</a>
</div>
</div>
${getFooterHtml(siteUrl)}
</div></div></body></html>`;
}

function getWeeklyReportHtml(name: string, data: NonNullable<EmailPayload["reportData"]>): string {
  const siteUrl = getSiteUrl();
  const motivMsg = data.studyDays >= 5 ? "🌟 Xuất sắc! Bạn học rất chăm chỉ tuần này!" : data.studyDays >= 3 ? "👍 Tốt lắm! Tiếp tục duy trì nhé!" : "💪 Hãy cố gắng hơn tuần tới!";
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo học tập tuần</title></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',sans-serif;">
<div style="max-width:580px;margin:40px auto;padding:0 16px;">
<div style="background:#1a1d27;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">
<div style="background:linear-gradient(135deg,rgba(232,200,74,0.15),rgba(251,146,60,0.08));padding:36px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
<div style="font-size:48px;margin-bottom:16px;">📊</div>
<h1 style="color:#fff;font-size:22px;margin:0 0 6px;font-weight:700;">Báo cáo học tập tuần</h1>
<p style="color:#e8c84a;font-size:14px;margin:0;font-weight:600;">${data.weekLabel}</p>
</div>
<div style="padding:32px;">
<p style="color:rgba(255,255,255,0.8);font-size:15px;margin:0 0 24px;">Xin chào <strong style="color:#e8c84a;">${name}</strong>! Đây là tổng kết học tập tuần này:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
<tr>
<td width="33%" style="padding:0 4px 0 0;">
<div style="background:rgba(232,200,74,0.08);border:1px solid rgba(232,200,74,0.15);border-radius:12px;padding:16px;text-align:center;">
<p style="color:#e8c84a;font-size:24px;font-weight:700;margin:0 0 4px;">+${data.xpEarned}</p>
<p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;">⚡ XP</p>
</div>
</td>
<td width="33%" style="padding:0 2px;">
<div style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.15);border-radius:12px;padding:16px;text-align:center;">
<p style="color:#34d399;font-size:24px;font-weight:700;margin:0 0 4px;">${data.wordsLearned}</p>
<p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;">📚 Từ học</p>
</div>
</td>
<td width="33%" style="padding:0 0 0 4px;">
<div style="background:rgba(251,146,60,0.08);border:1px solid rgba(251,146,60,0.15);border-radius:12px;padding:16px;text-align:center;">
<p style="color:#fb923c;font-size:24px;font-weight:700;margin:0 0 4px;">${data.streakDays}</p>
<p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;">🔥 Streak</p>
</div>
</td>
</tr>
</table>
<div style="background:rgba(232,200,74,0.06);border:1px solid rgba(232,200,74,0.15);border-radius:12px;padding:18px;text-align:center;margin-bottom:24px;">
<p style="color:#e8c84a;font-size:15px;font-weight:600;margin:0;">${motivMsg}</p>
</div>
<div style="text-align:center;">
<a href="${siteUrl}" style="display:inline-block;background:#e8c84a;color:#0f1117;font-weight:700;font-size:15px;padding:14px 40px;border-radius:12px;text-decoration:none;">📖 Tiếp tục học ngay</a>
</div>
</div>
${getFooterHtml(siteUrl)}
</div></div></body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "RESEND_API_KEY chưa được cấu hình.", 
          hint: "Vào Supabase Dashboard → Edge Functions → Secrets → thêm RESEND_API_KEY" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: EmailPayload = await req.json();
    const { type, to, displayName = "Học viên", confirmUrl, resetUrl, reportData } = payload;

    let subject = "";
    let html = "";

    switch (type) {
      case "confirm_signup":
        subject = "✅ Xác nhận tài khoản — Hàn Quốc Ơi!";
        html = getConfirmSignupHtml(displayName, confirmUrl || "#");
        break;
      case "reset_password":
        subject = "🔑 Đặt lại mật khẩu — Hàn Quốc Ơi!";
        html = getResetPasswordHtml(displayName, resetUrl || "#");
        break;
      case "welcome":
        subject = "🎉 Chào mừng đến Hàn Quốc Ơi!";
        html = getWelcomeHtml(displayName);
        break;
      case "weekly_report":
        subject = payload.subject || `📊 Báo cáo học tập tuần — ${reportData?.weekLabel || ""} | Hàn Quốc Ơi!`;
        html = getWeeklyReportHtml(displayName, reportData!);
        break;
      case "vip_expiry_reminder":
        subject = `⏰ VIP của bạn sắp hết hạn (còn ${payload.daysLeft} ngày) — Hàn Quốc Ơi!`;
        html = getVipExpiryReminderHtml(
          displayName,
          payload.daysLeft || 7,
          payload.vipExpiresAt || "",
          payload.vipType || "month",
          payload.renewUrl || getSiteUrl() + "/pricing"
        );
        break;
      case "vip_granted":
        subject = "👑 Chúc mừng! Tài khoản VIP đã được kích hoạt — Hàn Quốc Ơi!";
        html = getVipGrantedHtml(displayName, payload.vipType || "month", payload.vipExpiresAt || "");
        break;
      case "bulk_notification":
        subject = payload.bulkTitle || "Thông báo từ Hàn Quốc Ơi!";
        html = getBulkNotificationHtml(displayName, payload.bulkTitle || "Thông báo", payload.bulkBody || "");
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Loại email không hợp lệ" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const fromAddress = getFromAddress();
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: fromAddress, to: [to], subject, html }),
    });

    const data = await res.json();
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: data.message || "Gửi email thất bại", details: data, from: fromAddress }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id, from: fromAddress }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Lỗi không xác định" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
