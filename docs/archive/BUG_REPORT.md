# Bug Report — Hàn Quốc Ơi!

Scan ngày: 2026-05-02. Liệt kê theo mức độ nghiêm trọng.

---

## 🔴 CRITICAL — Data fake hiển thị sai lệch cho user

### BUG-C1: `/study-stats-detail` — Biểu đồ tuần/tháng toàn random
`@/src/pages/study-stats-detail/page.tsx:8-23`

```ts
function generateWeeklyData() {
  return Array.from({ length: 7 }, (_, i) => ({
    minutes: Math.floor(Math.random() * 60) + 5,   // ← fake
    words: Math.floor(Math.random() * 30) + 2,     // ← fake
  }));
}
```
User xem biểu đồ thống kê 7 ngày → số liệu đổi mỗi lần F5.

### BUG-C2: `/study-history` — Lịch sử học 30 ngày toàn fake
`@/src/pages/study-history/page.tsx:54-66`

Mỗi ngày random sessions/words/xp/quizzes → không phản ánh học thật.

### BUG-C3: `/study-history-detail` — Chi tiết ngày học giả 100%
`@/src/pages/study-history-detail/page.tsx:38-106`

Records, từ vựng đã học, số phút, điểm — **toàn bộ Math.random**.

### BUG-C4: `/vocab-stats` — Heatmap hoạt động fake
`@/src/pages/vocab-stats/page.tsx:61`

Nếu không có data thật (`activityMap[key]`), dùng random 40% ngày có học.

### BUG-C5: `/wrong-review` — Danh sách câu sai fake
`@/src/pages/wrong-review/page.tsx:37-52`

Lấy ngẫu nhiên 60% câu từ lesson làm "câu trả lời sai". User thấy câu mình chưa bao giờ làm xuất hiện trong "danh sách sai".

### BUG-C6: `/member/:userId` — Hồ sơ thành viên hardcode hoàn toàn
`@/src/pages/member/page.tsx:8-17`

```ts
const member = {
  name: "Kim Minji",     // ← CỨNG
  streak: 42,            // ← CỨNG
  xp: 8_420,             // ← CỨNG
  stats: { words: 1240, quizzes: 87, reviews: 320 }, // ← CỨNG
  avatar: "https://readdy.ai/...",   // ← CDN ngoài bị blocked sau khi deploy
};
```
Ai vào `/member/abc123` hay `/member/xyz` cũng thấy "Kim Minji". Route này nên **xoá** hoặc redirect sang `/public-profile/:userId`.

---

## 🟠 HIGH — Leaderboard / Social fake

### BUG-H1: `/compare-friends` — Data bạn bè
`@/src/pages/compare-friends/page.tsx` (8 matches mock)
Cần check: danh sách bạn có phải từ DB không, hay hardcode.

### BUG-H2: `/eps-leaderboard`, `/eps-global-leaderboard`
File có 9-5 matches mock/random. Khả năng bảng xếp hạng là fake.

### BUG-H3: `/study-room`, `/eps-study-group`
7-6 matches mock. Nhiều phòng học giả.

### BUG-H4: `OnlineUsersWidget` (community page)
`@/src/pages/community/components/OnlineUsersWidget.tsx` — 6 matches mock.
Danh sách user online có thể fake.

### BUG-H5: `/friend-challenge`, `/friend-streak`
Data bạn bè giả.

### BUG-H6: `/referral`
Danh sách người được mời / thưởng có thể fake.

---

## 🟡 MEDIUM — Stats/Analytics hỗn hợp

Các page này có thể có data thật + lấp fake khi thiếu:
- `/study-analytics` (3 matches mock)
- `/weekly-report` (3 matches)
- `/quiz-history-detail` (3 matches)
- `/melon-history`, `/melon-stats` (4 matches mỗi cái)
- `/learn-overview` (4 matches)
- `/challenge-history`, `/challenge-stats` (4 matches)

---

## 🟢 LOW — Math.random hợp lệ (không phải bug)

Các file dưới dùng `Math.random` để **shuffle/game** — đây là intentional:
- `/vocab-games`, `/vocab-favorites`, `/vocab-suggestion`
- `/topik-flashcard`, `/topik-topic-quiz`, `/topik-listening`
- `/study-partner` (simulate bot reply — có thể cân nhắc thay AI thật sau)

---

## 🔒 Security / Access control

### SEC-1: Nhiều route không có RequireAuth
Đã fix 8 route critical (profile/settings/vip-history/stats/history/journal/weekly-report/share-progress). **Cân nhắc thêm**:
- `/xp-stats`, `/personal-stats`, `/learn-stats`, `/study-analytics`
- `/data-upload` (upload bulk data — nguy hiểm nếu guest vào được)
- `/notification-settings`, `/scheduler`

### SEC-2: RLS policies Supabase
Mình **không** check được database từ code. Bạn nên vào Supabase Dashboard → Authentication → Policies, verify các bảng:
- `user_profiles`: cho phép SELECT public chỉ `display_name, avatar_url, is_vip, created_at` (không leak email)
- `leaderboard`: public SELECT OK (để hiển thị bảng xếp hạng)
- `vip_revenue_log`, `admin_audit_logs`, `admin_settings`: **CHỈ admin** SELECT/ALL
- `user_coupons`, `login_sessions`, `exam_results`: user chỉ xem được của chính mình
- `feedback`, `app_feedback`, `bug_reports`: user chỉ xem của chính mình + admin xem tất

### SEC-3: Image avatars load từ CDN ngoài
`/member/:userId` dùng `readdy.ai/api/...` — dịch vụ ngoài có thể sập/block.
Nên dùng `user_profiles.avatar_url` từ Supabase Storage.

---

## 🐛 TypeScript errors cũ (scan qua)

Chạy `npx tsc --noEmit -p tsconfig.app.json` thấy ~100 errors, ví dụ:
- `src/mocks/topikQuestions.ts` — `QuestionType` sai tên (`listen_choose_detail` vs `listen_choose_topic`)
- `src/pages/admin-audit/page.tsx:198,214` — Type mismatch
- `src/pages/admin-backup/page.tsx:522` — Sai arguments
- `src/pages/admin-content-learn/page.tsx` — Type conversion không hợp lệ
- `src/router/config.tsx:97` — `Timeout` vs `number`

Build vẫn pass vì `strict: false`, nhưng có thể gây bug runtime.

---

## 📋 Đề xuất thứ tự fix

1. **Tuần 1** (Critical UX): Fix C1, C2, C3, C4, C5 (5 stats page dùng Math.random) — viết lại load từ `study_history`, `topik_quiz_history`, `exam_results` theo user_id
2. **Tuần 1** (Security): Xoá hoặc fix `/member/:userId` (BUG-C6) — redirect sang `/public-profile`
3. **Tuần 2**: H1-H4 (leaderboard/social)
4. **Tuần 2**: Verify RLS policies trên Supabase Dashboard
5. **Tuần 3**: Fix TypeScript errors (dọn strict mode dần)
