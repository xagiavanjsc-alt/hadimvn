# Edge Function: send-email

Gửi email transactional qua Resend API với các template tiếng Việt.

## Cấu trúc

```
supabase/functions/send-email/
├── index.ts          # HTTP handler
├── templates.ts      # Auto-generated từ docs/email-templates/*.html
├── deno.json         # Deno config
└── README.md
```

## Các template hỗ trợ

| Template | Dùng cho | Biến cần truyền |
|----------|----------|-----------------|
| `welcome` | Sau khi confirm signup | `USER_NAME` |
| `vip-success` | Thanh toán VIP xong | `USER_NAME`, `PLAN_NAME`, `AMOUNT`, `PAYMENT_DATE`, `EXPIRES_AT` |
| `vip-expiring` | VIP sắp hết hạn (3 ngày trước) | `USER_NAME`, `DAYS_LEFT`, `EXPIRES_AT` |
| `streak-warning` | Streak sắp mất (20h còn chưa học) | `USER_NAME`, `STREAK_COUNT`, `HOURS_LEFT` |
| `streak-milestone` | Đạt 7/30/100/365 ngày | `USER_NAME`, `MILESTONE`, `MILESTONE_MESSAGE`, `XP_REWARD`, `BADGE_NAME` |
| `weekly-summary` | Chủ nhật 9h sáng | `USER_NAME`, `WEEK_RANGE`, `WORDS_LEARNED`, `LESSONS_DONE`, `STREAK_COUNT`, `XP_EARNED`, `RANK`, `STUDY_TIME`, `MOTIVATION_MESSAGE` |
| `leaderboard-up` | Lên hạng tuần | `USER_NAME`, `OLD_RANK`, `NEW_RANK`, `RANK_JUMP`, `XP_EARNED` |
| `daily-reminder` | Sau 20h chưa học | `USER_NAME`, `STREAK_COUNT`, `KOREAN_WORD`, `PRONUNCIATION`, `MEANING_VI`, `EXAMPLE_SENTENCE` |
| `coupon-received` | Nhận coupon mới | `USER_NAME`, `COUPON_CODE`, `COUPON_DESCRIPTION`, `DISCOUNT_VALUE`, `EXPIRES_AT`, `APPLICABLE_PLANS` |
| `feedback-reply` | Admin reply feedback | `USER_NAME`, `FEEDBACK_DATE`, `ORIGINAL_FEEDBACK`, `ADMIN_REPLY` |

> Biến `SITE_URL` tự động set từ env, không cần truyền.

## Deploy

### 1. Cài Supabase CLI (nếu chưa có)

```powershell
npm install -g supabase
supabase login
```

### 2. Link project

```powershell
supabase link --project-ref <your-project-ref>
```
(Lấy project-ref từ URL Supabase Dashboard: `https://supabase.com/dashboard/project/<ref>/...`)

### 3. Build templates (trước mỗi lần deploy)

```powershell
node scripts/build-edge-function.mjs
```

### 4. Set environment variables

Supabase Dashboard → **Edge Functions** → **Settings** → thêm:

| Key | Value |
|-----|-------|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxx` (từ Resend) |
| `SENDER_EMAIL` | `noreply@hadim.vn` |
| `SENDER_NAME` | `Hàn Quốc Ơi!` |
| `SITE_URL` | `https://hadim.vn` |
| `INTERNAL_API_SECRET` | (tự tạo 32 ký tự ngẫu nhiên, dùng để bảo vệ function) |

Tạo secret random:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Deploy

```powershell
supabase functions deploy send-email --no-verify-jwt
```

`--no-verify-jwt` vì function tự xác thực qua `INTERNAL_API_SECRET`, không dùng JWT của user.

## Test function

```powershell
# Thay <ref>, <secret>, <email> theo project của bạn
curl -X POST "https://<ref>.supabase.co/functions/v1/send-email" `
  -H "Content-Type: application/json" `
  -H "x-internal-secret: <INTERNAL_API_SECRET>" `
  -d '{
    "template": "welcome",
    "to": "email-cua-ban@gmail.com",
    "variables": { "USER_NAME": "Trang" }
  }'
```

Response thành công:
```json
{ "success": true, "id": "abc123..." }
```

## Update template

1. Sửa HTML trong `docs/email-templates/<template>.html`
2. Chạy `node scripts/build-edge-function.mjs` để regenerate `templates.ts`
3. `supabase functions deploy send-email --no-verify-jwt`

## Triggers (gọi function tự động)

Xem `supabase/migrations/` cho các SQL trigger và cron job.
