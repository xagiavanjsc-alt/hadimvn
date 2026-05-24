# MIGRATION PLAN — Cleanup & Focus on EPS-XKLĐ

> **Ngày bắt đầu:** 2026-05-25
> **Mục tiêu:** Giảm từ 263 page → ~35 page hoạt động. Focus EPS-XKLĐ (chính) + du học cơ bản (phụ).
> **Quy tắc:** KHÔNG xóa file, chỉ comment route + gỡ menu link.

---

## 🚨 BƯỚC 0: BACKUP TRƯỚC (làm HÔM NAY)

### 0.1. Tạo nhánh git riêng
```bash
cd "C:\Users\hi\Desktop\code\han"
git checkout main
git status                              # đảm bảo clean
git tag backup-before-cleanup-2026-05-25
git push --tags
git checkout -b cleanup-eps-focus
git push -u origin cleanup-eps-focus
```

### 0.2. Backup Supabase orphan data
Xem file `scripts/01-backup-supabase-orphan-data.sql` — chạy theo hướng dẫn trong đó.

---

## 📋 PHÂN LOẠI 263 PAGE

### ✅ GIỮ (hiển thị trong nav) — 35 page

#### EPS Core (tâm điểm — 17 page)
| Route | Lý do giữ |
|---|---|
| `/` | Home |
| `/landing` | Landing cho user mới |
| `/eps` | Hub EPS |
| `/eps-lessons` | 60 bài học EPS |
| `/eps-lesson/:id` | Detail bài học |
| `/eps-lesson-quiz` | Quiz theo bài |
| `/eps-vocabulary` | Từ vựng EPS |
| `/eps-grammar` | Ngữ pháp EPS |
| `/eps-flashcard` | Flashcard EPS (gộp các loại) |
| `/eps-exam` | Hub đề thi |
| `/eps-de1` | **Đề thật 2025 #1 (SEO gold)** |
| `/eps-de2` | **Đề thật 2025 #2 (SEO gold)** |
| `/eps-mock-exam` | Đề thi thử |
| `/eps-official-exam` | Đề thi chính thức |
| `/eps-listening` | Luyện nghe EPS |
| `/eps-topics` | Chủ đề từ vựng |
| `/eps-exam-schedule` | Lịch thi EPS (lead capture) |

#### TOPIK / Du học cơ bản (5 page)
| Route | Lý do |
|---|---|
| `/topik-test` | TOPIK 1 |
| `/topik2-test` | TOPIK 2 |
| `/topik-dictionary` | Từ điển TOPIK |
| `/topik-listening` | Nghe TOPIK |
| `/topik-reading` | Đọc TOPIK |

#### Basics — Hangul + chung (4 page)
| Route | Lý do |
|---|---|
| `/hangul` | Bảng chữ cái |
| `/dictionary` | Từ điển chung |
| `/grammar` | Ngữ pháp tổng quan |
| `/vocabulary` | Từ vựng tổng quan |

#### Engagement (3 page)
| Route | Lý do |
|---|---|
| `/melon` | K-pop hook traffic |
| `/daily-words` | Daily quiz cho FB group |
| `/quick-quiz` | Quick quiz |

#### User account (5 page)
| Route | Lý do |
|---|---|
| `/onboarding` | Onboard user mới |
| `/placement-test` | Kiểm tra trình độ |
| `/profile` | Hồ sơ |
| `/settings` | Cài đặt (gộp account/notification) |
| `/feedback` | Báo lỗi |

#### Admin gọn (5 page)
| Route | Lý do |
|---|---|
| `/admin` | Dashboard |
| `/admin/users` | Quản lý user |
| `/admin/eps` | Quản lý content EPS |
| `/admin/broadcast` | Gửi thông báo |
| `/admin/feedback` | Xem feedback user |

---

### ⛔ HIDE — comment route, gỡ menu link, GIỮ code

#### Seoul textbook 4A-4B (22 page) — sai audience
```
/seoul-textbook, /seoul-dictionary, /seoul-exam, /seoul-flashcard,
/seoul-hanja, /seoul-learning-path, /seoul-lesson-quiz, /seoul-listening-quiz,
/seoul-phrases, /seoul-placement, /seoul-practice, /seoul-progress,
/seoul-stats, /seoul-streak, /seoul-topic-review, /seoul-topic-study,
/seoul-vocab-export, /seoul-word-pairs, /seoul-writing, /seoul-wrong-review,
/seoul-vocab-practice, /seoul-grammar
```
→ Note: Seoul 1A-1B content **GIỮ trong DB**, sau này có thể nhét vào `/hangul` hoặc `/vocabulary` làm beginner content.

#### Hanja Pro (10 page) — chuyển sang blog
```
/hanja-vocab, /hanja-flashcard, /hanja-detail, /hanja-dashboard,
/hanja-pro, /hanja-pro/:slug, /hanja-analytics, /hanja-stories,
/admin/hanja, /admin/hanja-audio, /admin/hanja-excel, /admin/hanja-pro-seo
```
→ Tương lai: làm bài blog `/blog/hoc-han-han-co-ban` lấy SEO traffic.

#### VIP / Payment / Monetization (10 page) — chưa có doanh thu
```
/coupon, /referral, /ctv, /ctv-info, /vip-history, /pricing (giữ ẩn),
/admin/coupon, /admin/payment, /admin/pricing, /admin/vip-transactions,
/admin/revenue, /admin/ads, /admin/ctv
```

#### Battle / Friend / Social (7 page) — thiếu critical mass
```
/battle-1v1, /friend-challenge, /friend-streak, /weekly-challenge,
/study-partner, /study-room, /compare-friends
```

#### Community (3 page) → trỏ về FB group
```
/community, /community/:id, /community-ranks
```
→ Thay bằng external link `https://facebook.com/groups/...` trong sidebar.

#### AI features (4 page) — tốn cost cho 20 user
```
/ai-pronunciation, /ai-writing, /ai-chatbot, /ai-smart-flashcard, /personal-roadmap-ai
```

#### Duplicate Stats (12 page → giữ 1)
**GIỮ:** `/stats`
**HIDE:**
```
/overall-stats, /personal-stats, /learn-stats, /study-analytics,
/study-stats-detail, /xp-stats, /vocab-stats, /eps-stats,
/eps-topic-stats, /challenge-stats, /melon-stats, /topik-stats,
/study-stats, /hanja-analytics, /share-progress, /weekly-report
```

#### Duplicate Flashcards (12 page → giữ 1 EPS)
**GIỮ:** `/eps-flashcard`
**HIDE:**
```
/flashcard, /flashcard-hub, /flashcard-level,
/eps-smart-flashcard, /eps-spaced-review, /eps-vocab-flashcard,
/topik-flashcard, /hanja-flashcard,
/melon-flashcard, /melon-flashcard/shared/:shareId, /kpop-flashcard,
/ai-smart-flashcard
```

#### Duplicate Leaderboards (5 page → giữ 1)
**GIỮ:** `/leaderboard` (tạm thời cũng nên hide vì 20 user)
**HIDE:**
```
/global-leaderboard, /eps-leaderboard, /eps-global-leaderboard,
/challenge-leaderboard, /community-ranks
```

#### Duplicate Roadmaps (10 page → giữ 1)
**GIỮ:** `/roadmap` hoặc `/learning-path` (chọn 1)
**HIDE:**
```
/learning-roadmap, /personalized-roadmap, /personal-roadmap-ai,
/eps-personalized-roadmap, /eps-progress-roadmap,
/daily-plan, /eps-30day-plan, /scheduler, /study-calendar,
/seoul-learning-path
```

#### Practice duplicates (10 page → giữ 3)
**GIỮ:**
- `/eps-listening` (nghe EPS)
- `/pronunciation` (phát âm cơ bản)
- `/dictation-practice` (chính tả - hữu ích cho EPS)

**HIDE:**
```
/listen-practice, /listening-by-level, /listening-dictation,
/speed-listening, /shadowing-practice, /listening-level,
/handwriting-practice, /hangul-canvas, /hangul-write, /hangul-writing,
/syllable-pronunciation, /speaking-level, /writing-by-level,
/reading-by-level, /translation-practice
```
→ Nhét chức năng vào `/eps-listening` hoặc `/pronunciation` nếu cần.

#### Naver / News / Podcast / KDrama (premature)
```
/naver, /news, /korean-news, /podcast-learn, /kdrama-learn,
/cultural-content, /video-lessons, /admin-naver-kin
```

#### Misc dư thừa
```
/all-features          — UX kém, dump features
/learning-hub          — gộp vào /eps
/exam-hub              — gộp vào /eps-exam
/learn-overview        — gộp vào /onboarding
/learning-certificate  — premature
/study-journal, /study-history, /study-history-detail, /study-feed — overlap profile
/notification-settings, /account-settings — gộp vào /settings
/public-profile/:userId, /member/:userId — không cần khi 20 user
/preview/:seriesId, /series, /ebook, /guide — chưa có content
/conversation          — premature
/scheduler, /study-calendar, /study-reminder — overlap nhau
/offline-manager, /offline-vocab — PWA tự lo
/data-upload           — admin task
/vocab-favorites, /vocab-suggestion, /vocab-by-topic, /vocab-in-context, /vocab-games — gộp vào /eps-vocabulary
/quiz, /quiz-history-detail — gộp vào /eps-lesson-quiz
/wrong-review, /smart-review, /daily-review, /review-schedule, /eps-quick-review,
  /eps-review-history, /eps-smart-wrong, /eps-wrong-topic — overlap với SR system
/eps-weakness-analysis, /eps-weekly-progress, /eps-topic-drill,
  /eps-topic-exam, /eps-topic-study, /eps-topic-dictionary, /eps-vocab-export — quá granular
/eps-study-group, /eps-melon — duplicate
/topik-stats, /topik-frequency-vocab, /topik-vocab-level, /topik-topic-quiz, /topik-exam-writing — gộp vào /topik-test
/grammar-by-topic, /grammar-by-level, /sentence-pattern-vocab — gộp vào /grammar
/phrase-dictionary, /advanced-dictionary — gộp vào /dictionary
/achievements, /rewards — chưa cần khi 20 user
/challenge, /challenge-history, /daily-challenge — premature
/admin-melon, /admin-content-learn — admin dư
```

#### Admin dư (60+ page → ẩn)
Giữ 5: `/admin`, `/admin/users`, `/admin/eps`, `/admin/broadcast`, `/admin/feedback`

Hide tất cả còn lại:
```
/admin/coupon, /admin/xp-config, /admin/weekly-rewards, /admin/grammar,
/admin/pricing, /admin/series, /admin/stats, /admin/settings, /admin/seo,
/admin/category-seo, /admin/payment, /admin/learn-stats, /admin/eps-new,
/admin/upload, /admin/content, /admin/backup, /admin/roles, /admin/audit,
/admin/security, /admin/revenue, /admin/ads, /admin/hanja, /admin/hanja-audio,
/admin/audio, /admin/hanja-excel, /admin/eps-vocab-excel, /admin/hanja-pro-seo,
/admin/ctv, /admin/control, /admin/bugs, /admin/vip-transactions,
/admin/zalo-reminder, /admin/error-logs, /admin/community-settings,
/admin-eps, /admin-eps-upload, /admin-melon, /admin-naver-kin
```

---

## 🛠️ CÁCH IMPLEMENT (làm theo thứ tự)

### Phase 1 (Tuần 1) — Backup + setup
- [ ] Tag git `backup-before-cleanup-2026-05-25`
- [ ] Tạo branch `cleanup-eps-focus`
- [ ] Chạy script backup Supabase
- [ ] Tạo migration files cho 1A, 1B từ data backup
- [ ] Push lên GitHub

### Phase 2 (Tuần 2) — Comment routes
- [ ] Mở `src/router/config.tsx`
- [ ] Comment các route trong section HIDE (xem danh sách trên)
- [ ] Format: `// HIDDEN 2026-05-25: <reason>`
- [ ] Test local: `npm run dev`
- [ ] Vercel sẽ tự tạo preview URL khi push

### Phase 3 (Tuần 2) — Gỡ menu link
- [ ] Tìm file Sidebar / MobileNav / Header
- [ ] Gỡ các link trỏ tới route bị hide
- [ ] Đảm bảo menu chỉ còn ≤7 item chính
- [ ] Cấu trúc menu đề xuất:
  ```
  🏠 Trang chủ
  🎯 Luyện thi EPS-TOPIK (dropdown: bài học, từ vựng, đề thi)
  📝 Đề thi 2025
  🅰️ Tiếng Hàn nhập môn (Hangul + cơ bản)
  🎵 Học qua K-pop
  💬 Cộng đồng (link FB group)
  👤 Hồ sơ
  ```

### Phase 4 (Tuần 3) — SEO + meta tags
- [ ] Sửa `index.html`: bỏ "10,000+ học viên"
- [ ] Title chính: "Học EPS-TOPIK Online - Đề Thi EPS 2025 Có Đáp Án | Hàn Quốc Ơi!"
- [ ] Description: "Luyện thi EPS-TOPIK 2026 đi XKLĐ Hàn Quốc. Đề thi thật 2025 có đáp án. 60 bài học từ vựng, ngữ pháp. Miễn phí."
- [ ] Sitemap.xml: chỉ list route giữ, không list route hide
- [ ] robots.txt: disallow route hide

### Phase 5 (Tuần 3) — Test preview
- [ ] Vào URL Vercel preview của branch `cleanup-eps-focus`
- [ ] Click qua tất cả menu — đảm bảo không lỗi 404
- [ ] Mobile test
- [ ] Lighthouse score
- [ ] Notify 5 user thân thiết test giúp

### Phase 6 (Tuần 4) — Merge
- [ ] Confirm preview ổn
- [ ] `git checkout main && git merge cleanup-eps-focus`
- [ ] `git push`
- [ ] Vercel auto-deploy production
- [ ] Monitor: lỗi 404, error logs, Search Console crawl errors

### Phase 7 (Tháng 2+) — Marketing
- [ ] Viết 10 bài blog SEO (xem danh sách trong message trước)
- [ ] Lead capture form trên đề thi pages
- [ ] Liên hệ 3-5 công ty XKLĐ → lead gen deal
- [ ] FB group push: chia sẻ đề thi thật

---

## 🔙 ROLLBACK PLAN

Nếu sau merge có lỗi nghiêm trọng:

```bash
# Cách 1: revert merge commit
git revert -m 1 HEAD
git push

# Cách 2: hard reset về backup tag (chỉ khi commit đã push)
git reset --hard backup-before-cleanup-2026-05-25
git push --force        # ⚠️ chỉ làm nếu chắc chắn
```

---

## ❓ Quyết định cần chủ project confirm trước khi merge

- [ ] OK ẩn 22 page Seoul textbook?
- [ ] OK ẩn 10 page Hanja Pro (giữ data, sau làm blog)?
- [ ] OK ẩn VIP/payment/coupon system?
- [ ] OK ẩn 4 AI features?
- [ ] OK gộp 12 flashcard về 1?
- [ ] OK gỡ "10,000+ học viên" khỏi meta?
- [ ] OK trỏ /community sang FB group external?

---

**Sau khi merge → 263 page hoạt động giảm còn ~35. Site nhẹ hơn, focus rõ, user mới hiểu trong 3 giây.**
