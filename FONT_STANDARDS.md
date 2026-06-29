# QUY CHUẨN FONT CHỮ VÀ KÍCH THƯỚC - HÀN QUỐC ƠI!

## 📝 Tổng quan
File này quy chuẩn font chữ và kích thước để đảm bảo đồng bộ toàn bộ UI/UX của trang web.

## 🔤 Font Family

### Font chính
- **Font**: Be Vietnam Pro
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Fallback**: sans-serif
- **Import**: `https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap`

### Tailwind config
```typescript
fontFamily: {
  'app': ['"Be Vietnam Pro"', 'sans-serif'],
}
```

### Sử dụng trong code
```tsx
// Class Tailwind
className="font-app"

// Inline style
style={{ fontFamily: '"Be Vietnam Pro", sans-serif' }}
```

## 📏 Font Size Standards

### Heading Sizes (đồng bộ trong index.css)
```css
h1 { @apply text-3xl md:text-4xl; }      /* 30px -> 36px (mobile -> desktop) */
h2 { @apply text-2xl md:text-3xl; }      /* 24px -> 30px */
h3 { @apply text-xl md:text-2xl; }       /* 20px -> 24px */
h4 { @apply text-lg md:text-xl; }       /* 18px -> 20px */
```

### Body Text Sizes
```tsx
// Large body text
className="text-base"                    // 16px

// Normal body text
className="text-sm"                      // 14px

// Small body text
className="text-xs"                      // 12px

// Extra small
className="text-[10px]"                  // 10px (chỉ dùng cho metadata)
```

### Component-specific Sizes

#### Dashboard Layout
```tsx
// Page title
className="text-2xl font-bold text-white"     // 24px

// Page subtitle
className="text-sm text-app-text-muted"       // 14px
```

#### Cards
```tsx
// Card title
className="text-white font-semibold"          // 16px (default)

// Card description
className="text-app-text-muted text-sm"       // 14px

// Card metadata
className="text-app-text-muted text-xs"       // 12px
```

#### Buttons
```tsx
// Primary button
className="text-sm font-bold"                  // 14px

// Secondary button
className="text-xs font-medium"                // 12px
```

#### Forms
```tsx
// Input label
className="text-sm font-medium text-white"     // 14px

// Input placeholder
className="text-sm placeholder-white/30"       // 14px

// Helper text
className="text-xs text-app-text-muted"        // 12px
```

### Table/Grid Data
```tsx
// Table header
className="text-xs font-semibold text-white"   // 12px

// Table cell
className="text-sm text-app-text-secondary"    // 14px

// Table metadata
className="text-xs text-app-text-muted"        // 12px
```

## 📐 Line-height Standards

```tsx
// Tight (headings)
className="leading-tight"                      // 1.25

// Normal (body text)
className="leading-normal"                     // 1.5

// Relaxed (long text)
className="leading-relaxed"                    // 1.625

// Snug (compact)
className="leading-snug"                       // 1.375
```

## 🔤 Letter-spacing Standards

```tsx
// Tight (headings)
className="tracking-tight"                     // -0.025em

// Normal (body text)
className="tracking-normal"                    // 0em

// Wide (uppercase text)
className="tracking-wide"                      // 0.025em
```

## 🎨 Font Weight Standards

```tsx
// Light
className="font-light"                         // 300

// Regular
className="font-normal"                        // 400

// Medium
className="font-medium"                        // 500

// SemiBold
className="font-semibold"                      // 600

// Bold
className="font-bold"                          // 700
```

## 📊 Text Color Standards

```tsx
// Primary text
className="text-white"                         // #ffffff

// Secondary text
className="text-app-text-secondary"            // rgba(255,255,255,0.7)

// Muted text
className="text-app-text-muted"                // rgba(255,255,255,0.5)

// Accent text
className="text-app-accent-primary"            // #e8c84a

// Success text
className="text-emerald-400"                   // #34d399

// Error text
className="text-rose-400"                      // #fb7185
```

## 🚫 Common Mistakes to Avoid

### ❌ KHÔNG nên:
```tsx
// Hardcode font family
style={{ fontFamily: 'Arial' }}

// Sử dụng font size không chuẩn
className="text-[17px]"                       // Không có trong Tailwind

// Mix font weights không nhất quán
className="font-normal font-bold"              // Conflict

// Sử dụng line-height quá rộng
className="leading-loose"                      // 2.0 (quá rộng)
```

### ✅ NÊN:
```tsx
// Sử dụng font-app class
className="font-app"

// Sử dụng Tailwind font sizes chuẩn
className="text-base text-sm text-xs"

// Sử dụng line-height phù hợp
className="leading-tight leading-normal leading-snug"

// Sử dụng text color từ theme
className="text-white text-app-text-secondary text-app-text-muted"
```

## 🧪 Testing Checklist

Khi tạo component mới, kiểm tra:
- [ ] Font family là Be Vietnam Pro
- [ ] Font size phù hợp với context (heading, body, small)
- [ ] Line-height phù hợp (tight cho heading, normal cho body)
- [ ] Letter-spacing phù hợp (tight cho heading, normal cho body)
- [ ] Font weight phù hợp (bold cho heading, normal/medium cho body)
- [ ] Text color từ theme (white, secondary, muted)
- [ ] Responsive (mobile < desktop)

## 📱 Responsive Font Sizes

```tsx
// Mobile first, scale up on desktop
className="text-base md:text-lg"               // 16px -> 18px
className="text-sm md:text-base"                // 14px -> 16px
className="text-xs md:text-sm"                  // 12px -> 14px

// Large headings
className="text-2xl md:text-3xl lg:text-4xl"    // 24px -> 30px -> 36px
```

## 🔧 Utility Classes (index.css)

```css
/* Text utility classes */
.app-text-primary {
  @apply text-app-text-primary;
}

.app-text-secondary {
  @apply text-app-text-secondary;
}

.app-text-muted {
  @apply text-app-text-muted;
}
```

## 📚 References

- Tailwind config: `tailwind.config.ts`
- Global styles: `src/index.css`
- Font import: `src/index.css` (line 1)
- Google Fonts: https://fonts.google.com/specimen/Be+Vietnam+Pro

## 🔄 Update History

- 2026-06-30: Tạo file quy chuẩn font chữ và kích thước
- Dựa trên index.css và tailwind.config.ts hiện tại
