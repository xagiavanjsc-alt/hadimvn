# Setup Email System — Hàn Quốc Ơi!

Hướng dẫn setup hoàn chỉnh hệ thống email tự động. Làm theo thứ tự từ trên xuống.

## Tổng quan

```
App/DB events  →  Postgres trigger/cron  →  Edge Function send-email  →  Resend API  →  Inbox user
```

---

## Bước 1: Deploy Edge Function `send-email`

### 1.1. Cài Supabase CLI
```powershell
npm install -g supabase
supabase login
```

### 1.2. Link project (chỉ làm 1 lần)
```powershell
supabase link --project-ref <your-project-ref>
```
Lấy `project-ref` từ URL Supabase Dashboard: `https://supabase.com/dashboard/project/<ref>/...`

### 1.3. Build templates (làm mỗi khi sửa template HTML)
```powershell
node scripts/build-edge-function.mjs
```

### 1.4. Tạo `INTERNAL_API_SECRET`
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy chuỗi hex → lưu lại (dùng ở Bước 2 và 3).

### 1.5. Set environment variables

Vào **Supabase Dashboard → Edge Functions → Settings (Secrets)** → thêm:

| Key | Value |
|-----|-------|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxx` (từ Resend → API Keys) |
| `SENDER_EMAIL` | `noreply@hanquocoi.vn` |
| `SENDER_NAME` | `Hàn Quốc Ơi!` |
| `SITE_URL` | `https://hanquocoi.vn` |
| `INTERNAL_API_SECRET` | chuỗi hex bạn tạo ở 1.4 |

### 1.6. Deploy
```powershell
supabase functions deploy send-email --no-verify-jwt
```

### 1.7. Test function bằng curl (optional)
```powershell
curl -X POST "https://<your-ref>.supabase.co/functions/v1/send-email" `
  -H "Content-Type: application/json" `
  -H "x-internal-secret: <INTERNAL_API_SECRET>" `
  -d '{ "template": "welcome", "to": "ban@gmail.com", "variables": { "USER_NAME": "Trang" } }'
```

Nếu nhận email → function OK. Chuyển Bước 2.

---

## Bước 2: Cấu hình Database Config

Mở **Supabase Dashboard → SQL Editor → New query**, chạy:

### Option A: Dùng Vault (khuyến nghị — bảo mật cao)
```sql
SELECT vault.create_secret('https://<your-ref>.supabase.co', 'supabase_url');
SELECT vault.create_secret('<INTERNAL_API_SECRET>', 'internal_secret');
```

### Option B: Dùng GUC (đơn giản hơn)
```sql
ALTER DATABASE postgres SET app.supabase_url = 'https://<your-ref>.supabase.co';
ALTER DATABASE postgres SET app.internal_secret = '<INTERNAL_API_SECRET>';
```
Sau đó **restart** connection (disconnect/reconnect SQL Editor).

> Thay `<your-ref>` và `<INTERNAL_API_SECRET>` bằng giá trị thật.

---

## Bước 3: Chạy SQL Migration (tạo triggers + cron)

1. Mở file `supabase/migrations/001_email_triggers.sql`
2. Copy toàn bộ nội dung
3. Vào **Supabase Dashboard → SQL Editor → New query**
4. Paste → **Run**

SQL này sẽ:
- Bật extensions `pg_net`, `pg_cron`
- Tạo helper function `send_email(template, to, variables)`
- Tạo 5 triggers (welcome, vip-success, coupon, feedback-reply, streak-milestone)
- Schedule 3 cron jobs (vip-expiring, streak-warning, weekly-summary)

---

## Bước 4: Test toàn bộ flow

### Test 1: Gửi welcome trực tiếp từ SQL
```sql
SELECT public.send_email(
  'welcome',
  'email-cua-ban@gmail.com',
  jsonb_build_object('USER_NAME', 'Test User')
);
```
→ Check email trong vài giây.

### Test 2: Kiểm tra cron đã schedule
```sql
SELECT jobname, schedule, active FROM cron.job;
```
Phải thấy 3 job: `email-vip-expiring-daily`, `email-streak-warning-daily`, `email-weekly-summary`.

### Test 3: Xem log request gần đây
```sql
SELECT * FROM net._http_response ORDER BY created DESC LIMIT 10;
```

### Test 4: Xem cron run history
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

## Disable / Uninstall

### Tắt 1 trigger:
```sql
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_welcome;
ALTER TABLE public.vip_revenue_log DISABLE TRIGGER on_vip_revenue_insert;
-- ...
```

### Xoá 1 cron job:
```sql
SELECT cron.unschedule('email-vip-expiring-daily');
```

### Xoá tất cả:
```sql
DROP TRIGGER IF EXISTS on_auth_user_welcome ON auth.users;
DROP TRIGGER IF EXISTS on_vip_revenue_insert ON public.vip_revenue_log;
DROP TRIGGER IF EXISTS on_user_coupon_insert ON public.user_coupons;
DROP TRIGGER IF EXISTS on_feedback_reply ON public.app_feedback;
DROP TRIGGER IF EXISTS on_streak_milestone ON public.study_progress;
SELECT cron.unschedule('email-vip-expiring-daily');
SELECT cron.unschedule('email-streak-warning-daily');
SELECT cron.unschedule('email-weekly-summary');
DROP FUNCTION IF EXISTS public.send_email CASCADE;
```

---

## Troubleshooting

### Email không gửi được
1. Check log Edge Function: Supabase Dashboard → Edge Functions → `send-email` → Logs
2. Check pg_net response: `SELECT * FROM net._http_response ORDER BY created DESC LIMIT 5;`
3. Verify env vars đúng (đặc biệt `RESEND_API_KEY`)
4. Verify Resend dashboard không bị rate limit: https://resend.com/emails

### Trigger không fire
- Verify trigger enabled: `SELECT * FROM pg_trigger WHERE tgname LIKE 'on_%';`
- Check log: `SELECT * FROM net._http_response ORDER BY created DESC;`

### Cron job không chạy
- Check `SELECT * FROM cron.job;` xem `active = true`
- Check run history: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;`
- Verify pg_cron đã enable (cần Supabase Pro plan)

### Email vào Spam
- Verify domain SPF/DKIM trong Resend → Domains
- Test điểm spam: https://mail-tester.com/

---

## Sửa template email

1. Sửa file trong `docs/email-templates/<template>.html`
2. Rebuild: `node scripts/build-edge-function.mjs`
3. Redeploy: `supabase functions deploy send-email --no-verify-jwt`
4. Không cần chạy lại SQL.
