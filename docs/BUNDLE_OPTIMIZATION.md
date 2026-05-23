# Tối ưu Bundle — đo trước/sau & roadmap

## Baseline (đo 2026-05-23 trước tối ưu)

| Loại chunk | Size | gzip | Ghi chú |
|------------|------|------|---------|
| `index.js` (app shell) | 469 KB | 127 KB | Load mỗi lần user vào site |
| `react-vendor` | 232 KB | 74 KB | React + ReactDOM + Router |
| `supabase` | 117 KB | 32 KB | Supabase JS client |
| `data-seoul` | 915 KB | 220 KB | Lazy — chỉ load khi user vào Seoul pages |
| `data-hanja` | 471 KB | 87 KB | Lazy — chỉ load Hanja pages |
| `data-eps` | 432 KB | 103 KB | Lazy — chỉ load EPS pages |
| `data-vocab` | 219 KB | 47 KB | Lazy — chỉ load Vocab pages |
| `xlsx` | 425 KB | 142 KB | **Trước**: load cùng dictionary page · **Sau tối ưu**: chỉ load khi user nhấn "Export Excel" |
| `html2canvas` | 200 KB | 47 KB | Lazy — đã dynamic import sẵn |
| `page-DR5JzO4m` (grammar-by-level) | **805 KB** | 210 KB | Lazy nhưng 1 page riêng = bom |

**Total initial download** (user vào `/home`): ≈ `index + react-vendor + supabase + page-home` ≈ **900-950 KB / 240 KB gzip**.

## Tối ưu đã làm

### ✅ xlsx → dynamic import trong `/dictionary`
- `pages/dictionary/page.tsx` đổi `import * as XLSX from "xlsx"` → `const XLSX = await import("xlsx")` ngay khi user nhấn Export Excel.
- **Win**: User vào `/dictionary` chỉ tải code dictionary, không tải 425 KB xlsx. Chỉ khi click "Export" mới tải. ~99% user không bao giờ click → 425 KB tiết kiệm cho phần lớn user.

### ✅ Xoá dead imports
- `components/feature/ShareResultModal.tsx` imports `html2canvas` và `useLocalStorage` nhưng không dùng → xoá hẳn. Không thay đổi bundle size (Vite tree-shake), nhưng dọn code.

### ✅ Verify html2canvas đã được dynamic import
- `share-progress/page.tsx` và `study-journal/page.tsx` đã dùng `await import("html2canvas")`. ShareResultModal có dead import (đã xoá).

## Việc còn lại (deferred)

### 🟡 grammar-by-level/page.tsx (805 KB chunk)
File 10286 dòng — dòng 21-10282 là `const GRAMMAR_PATTERNS: GrammarPattern[]` chứa toàn bộ pattern TOPIK 1-5 inline.

**Đề xuất refactor**:
1. Tách `GRAMMAR_PATTERNS` ra `src/mocks/data/grammar-by-level-data.ts`
2. Page `import GRAMMAR_PATTERNS from "@/mocks/data/grammar-by-level-data"`
3. Thêm vào `vite.config.ts` manualChunks:
   ```ts
   if (id.includes('src/mocks/data/grammar-by-level-data')) return 'data-grammar';
   ```
4. Vite sẽ tách thành `data-grammar.js` ~795 KB + page chunk ~10 KB
5. **Lợi ích**: Data chunk cacheable riêng — update component không invalidate cache data. Code chunk update nhỏ.

**Lý do delay**: 10260 dòng Korean text + special chars + JSON-trong-TS → split phải làm cực kỳ cẩn thận để không lỗi escape. Cần dedicated session 30-45 phút + test thật trong browser.

### 🟡 Dead dependencies trong package.json
Các deps sau **không có file nào import** nhưng vẫn cài (~50-80 MB node_modules dư):

- `firebase` (12.0.0) — chưa thấy dùng
- `@stripe/react-stripe-js` (4.0.2) — chưa thấy dùng  
- `recharts` (3.2.0) — chưa thấy dùng

**Action**: Nếu chắc chắn không dùng nữa, chạy:
```bash
npm uninstall firebase @stripe/react-stripe-js recharts
```
Tiết kiệm install time + node_modules disk. Không ảnh hưởng bundle (Vite tree-shake rồi).

**Đề nghị**: Hỏi lại bản thân — có plan dùng Firebase/Stripe không? Nếu defer thì giữ lại, otherwise xoá.

### 🟡 `index.js` 469 KB — slim app shell
Đây là chunk load TRƯỚC TIÊN cho mọi user. Cần đào sâu xem cái gì trong đó:

```bash
npm run build -- --analyze   # nếu có plugin analyze
# hoặc dùng rollup-plugin-visualizer
```

Có thể chứa:
- Eager imports trong `App.tsx`, `RootPage`, `Home`, `LandingPage`
- Tất cả hooks shared
- Tất cả contexts
- Router config (vốn ~50 KB do liệt kê 260+ lazy routes)

Tách nhỏ thêm sẽ phức tạp — chỉ làm khi đo bằng visualizer thấy có win.

### 🟡 `data-seoul` 915 KB
Quá lớn cho 1 chunk. Có thể tách theo level (4A, 4B) hoặc theo lesson group. Defer cho tới khi user complain về tốc độ load Seoul pages.

## Cách đo lại sau

```bash
npm run build
# Xem dòng vite log có "Some chunks are larger than 500 kB"
# Top 10 chunks lớn nhất hiện ở cuối log
```

Visual analyzer (chỉ cài khi cần):
```bash
npm i -D rollup-plugin-visualizer
# Thêm vào vite.config.ts plugins:
import { visualizer } from "rollup-plugin-visualizer";
// ... plugins: [..., visualizer({ open: true })]
```
