# Lộ trình bật strict TypeScript

Project hiện đang chạy với `strict: false` cho cả 4 flag con. Bật full strict 1 lần sẽ sinh ~100 error → migration phải làm theo flag, không làm cùng lúc.

## Số liệu (đo 2026-05-23)

| Flag bật | Errors | Files affected |
|----------|--------|---------------|
| `noImplicitAny: true` | **26** | 18 |
| `useUnknownInCatchVariables: true` | (gộp trong noImplicitAny) | |
| `strictNullChecks: true` | **68** | 18 |
| `strict: true` (tất cả) | **~100+** | ~30+ |

## Thứ tự đề xuất bật flag

### Phase 1 — `noImplicitAny: true` (26 errors, ~45 phút)

Lỗi chia 3 nhóm:

**TS7010** (~7 errors): React component thiếu return type annotation, bị TS từ chối inference do recursive reference.
```tsx
// Trước
function MyComponent() { return <div /> }
// Sau
function MyComponent(): JSX.Element { return <div /> }
```

**TS7018** (~13 errors): Object literal property bị inferred là `any` do gốc đến từ `any` (thường là `data` từ Supabase query).
```ts
// Trước
const item = { userAnswer: data.answer };  // data là any
// Sau
const item: { userAnswer: string | null } = { userAnswer: data.answer };
```

**TS7006/7053/7024** (vài cái): Parameter / index thiếu type.

Files:
- `src/App.tsx`
- `src/components/feature/NotificationBell.tsx`
- `src/hooks/useDailyLoginBonus.ts`
- `src/pages/admin-security/page.tsx`
- `src/pages/ai-pronunciation/page.tsx`
- `src/pages/community/page.tsx` + `community/PostDetail.tsx`
- `src/pages/eps-official-exam/page.tsx`
- `src/pages/hanja-detail/page.tsx`
- `src/pages/hanja-vocab/components/HomophoneTab.tsx`
- `src/pages/hanja-vocab/components/TopikMockExamTab.tsx`
- `src/pages/hanja-vocab/page.tsx`
- `src/pages/home/components/SRReviewWidget.tsx`
- `src/pages/listen-practice/page.tsx`
- `src/pages/melon-history/page.tsx`
- `src/pages/rewards/page.tsx`
- `src/pages/seoul-textbook/page.tsx`
- `src/pages/seoul-vocab-practice/page.tsx`
- `src/router/config.tsx`
- `src/store/useStudyStore.ts`

### Phase 2 — `useUnknownInCatchVariables: true` (gộp trong Phase 1)

`catch (err)` mặc định `err: any` — bật flag này thì `err: unknown`. Phải narrow trước khi dùng:
```ts
catch (err) {
  console.log(err.message); // ❌
  console.log(err instanceof Error ? err.message : String(err)); // ✅
}
```

### Phase 3 — `strictNullChecks: true` (68 errors, ~2 giờ)

Đây là flag có giá trị NHẤT (chống `Cannot read property of undefined` crash) nhưng cũng nặng nhất. Top files:
- `pages/hanja-vocab/components/StudyDiaryTab.tsx` (12 errors)
- `pages/eps-review-history/page.tsx` (12 errors)
- `pages/home/page.tsx` (11 errors)
- `pages/eps-30day-plan/page.tsx` (9 errors)

Pattern thường gặp:
```ts
const [data] = useLocalStorage<Item[]>("k", []);
data.find(x => x.id === id).name  // ❌ find có thể trả undefined
data.find(x => x.id === id)?.name ?? "Chưa có"  // ✅
```

### Phase 4 — Còn lại

`strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `alwaysStrict` thường < 10 errors mỗi cái. Bật cuối cùng.

## Cách approach an toàn

1. Bật 1 flag → `npx tsc --noEmit -p tsconfig.app.json 2>&1 | grep "error TS"` xem số
2. Fix theo file. Mỗi file fix xong, chạy `npm test` để không regression
3. Khi 0 error → commit, tiếp flag kế
4. Đừng cố bật 2 flag cùng lúc — khó debug khi conflict

## Lý do delay

68 errors strictNullChecks tản mác — fix vội dễ làm sai semantic (vd `??` vs `||` vs `!` — 3 cái khác nhau hoàn toàn về behavior). Cần focus time, không gộp với feature work.
