# CLAUDE.md — Project Rules for AI Assistants

> **Đọc file này TRƯỚC khi sửa bất kỳ thứ gì trong project. Áp dụng cho mọi AI: Claude, Cursor, Copilot, GPT, v.v.**

## 🎯 Mục tiêu sản phẩm (KHÔNG được đổi nếu chưa hỏi chủ)

**Tên:** Hàn Quốc Ơi! (hanquocoi.vn)

**Audience chính:** Người Việt thi **EPS-TOPIK để đi XKLĐ Hàn Quốc**
- 18-35 tuổi, lao động phổ thông
- Cần học cơ bản → đậu kỳ thi EPS 40 câu
- Tìm site qua Facebook group XKLĐ, Google search "đề thi EPS"

**Audience phụ:** Du học sinh thi TOPIK (không ưu tiên, nhưng giữ content cơ bản)

**KHÔNG phải audience:**
- ❌ Du học sinh advanced (TOPIK 4-6)
- ❌ Người học vì sở thích K-pop
- ❌ Học giả nghiên cứu tiếng Hàn

**Hệ quả:**
- Mọi feature mới phải trả lời câu: "Người thi EPS có dùng không?"
- Nếu câu trả lời là "không" → **KHÔNG thêm**
- UI/UX phải đơn giản, dễ hiểu cho người lao động phổ thông

## 🛑 RULES — Áp dụng nghiêm

### Rule 1: KHÔNG tự thêm page mới

Trước khi tạo bất kỳ folder mới nào trong `src/pages/`:

1. **Kiểm tra**: Có page nào hiện tại làm được việc đó không?
2. **Hỏi chủ project**: "Việc X này thêm vào page hiện tại Y hay tạo page mới?"
3. **Default**: Thêm vào page hiện tại, dùng tab/section, KHÔNG tạo route mới

❌ KHÔNG được tạo: `/eps-vocab-advanced`, `/eps-quick-flashcard`, etc.
✅ Thay vào: Thêm filter/tab vào `/eps-vocabulary` hoặc `/eps-flashcard`

### Rule 2: KHÔNG đổi DB trực tiếp qua Supabase Dashboard

**LUÔN tạo migration file** trong `supabase/migrations/`:
- Naming: `{number}_{description}.sql` (vd: `120_add_eps_de3_2025.sql`)
- Mọi seed data PHẢI có trong migration
- Trước khi chạy SQL trong Supabase Studio → viết vào migration trước

**Lý do:** Data không có migration = data có thể mất bất kỳ lúc nào (Supabase pause/delete project).

### Rule 3: KHÔNG thêm dependency mới nếu không hỏi

Hiện tại đã có:
- React 19 + Vite + TypeScript
- Supabase
- Zustand (state)
- i18next (i18n)
- React Router 7
- Tailwind 3 + remixicon
- DOMPurify, html2canvas, xlsx

**Đừng thêm**: redux, formik, axios, lodash, moment, MUI, AntD, v.v. (đã có thay thế)

### Rule 4: KHÔNG xóa page — chỉ HIDE

Khi cần loại bỏ feature:
- ❌ KHÔNG xóa folder `src/pages/X/`
- ❌ KHÔNG xóa migration
- ✅ Comment route trong `src/router/config.tsx`
- ✅ Gỡ menu link
- ✅ Add 1 comment ghi chú lý do và ngày

```tsx
// HIDDEN 2026-05-25: not relevant to EPS-XKLĐ audience, code preserved
// { path: "/seoul-textbook", element: <SeoulTextbookPage /> },
```

### Rule 5: KHÔNG dùng AI để sinh content giả

Cho EPS content (đề thi, từ vựng, ngữ pháp):
- ✅ Đề thi 2025 đề 1, đề 2 là **đề thật**
- ✅ Vocab phải đối chiếu với sách EPS chính thức
- ❌ KHÔNG cho AI sinh đề thi "tự chế" rồi gán nhãn "đề chính thức"
- ❌ KHÔNG để meta tag "10,000+ học viên" khi chỉ có 20 user

### Rule 6: SEO is law

Mỗi page có content phải có:
- `<title>` riêng (50-60 ký tự)
- `<meta name="description">` riêng (150-160 ký tự)
- H1 đúng cấu trúc
- Schema.org markup khi phù hợp (Quiz, Article, EducationalOrganization)

Dùng hook `usePageSEO` đã có sẵn — KHÔNG tự viết logic SEO mới.

### Rule 7: Khi không chắc — HỎI, đừng làm

Nếu prompt user mơ hồ (vd: "thêm tính năng A"), hỏi lại:
1. Tính năng này EPS user dùng để làm gì?
2. Có page hiện tại nào làm được không?
3. Khi nào ra mắt? (nếu chưa rõ → đừng làm)

## 📂 Cấu trúc project

```
src/
├── pages/        — 1 folder = 1 route (đừng tạo bừa)
├── components/
│   ├── base/     — Skeleton, primitives
│   ├── common/   — ErrorBoundary, Toast
│   └── feature/  — Components có business logic
├── hooks/        — Custom hooks (đã có 37 cái, đừng thêm trừ khi cần)
├── services/     — API calls (apiService, aiService)
├── store/        — Zustand stores (useAppStore, useStudyStore)
├── router/       — config.tsx (DO NOT TOUCH without permission)
├── data/         — Static data (.ts files)
└── i18n/         — Translation files

supabase/
└── migrations/   — LUÔN qua đây cho mọi DB change
```

## 🚀 Khi nào MỚI được mở thêm feature

Default: KHÔNG mở thêm. Trừ khi đạt mốc:

| Mốc | Mở được |
|---|---|
| < 100 user | KHÔNG mở gì mới, chỉ content + SEO |
| 100-500 user | Mở 1 feature/tháng, có metric đo |
| 500-1000 user | Mở community features (đã ẩn) |
| 1000+ user paying | Mở monetization (VIP, payment) |
| 5000+ user | Mở advanced content (Hanja, du học) |

Hiện tại: **20 user** → tuyệt đối không mở feature mới.

## 📝 Commit conventions

```
feat: thêm tính năng mới
fix: sửa bug
refactor: refactor code, không đổi behavior
content: thêm/sửa content (vocab, đề thi, blog)
seo: thay đổi SEO/meta
chore: cài đặt, config, build
docs: tài liệu
hide: ẩn feature (không xóa code)
db: migration DB
```

Ví dụ:
- `content: add EPS de 3 2025 with audio`
- `hide: disable seoul-textbook routes (focus on EPS)`
- `seo: add schema markup to /eps-de1 page`

## ⚠️ Red flags — Nếu AI làm những việc sau, REVERT ngay

1. Tạo > 1 folder mới trong `src/pages/` cho 1 task
2. Thêm > 1 dependency mới
3. Thay đổi `package.json` không có lý do rõ
4. Xóa file `.sql` trong `supabase/migrations/`
5. Thêm "AI feature" mới (chatbot, AI writer, AI X)
6. Đổi audience focus khỏi EPS-XKLĐ
7. Tạo route mới `/X` khi `/X-feature` đã có
8. Sinh content "đề thi mới" mà không nguồn

## 🎯 Câu thần chú trước mỗi task

> "Việc này có giúp 1 người thi EPS đậu kỳ thi không?"
> Nếu KHÔNG → đừng làm.
> Nếu CÓ → làm theo cách đơn giản nhất.
