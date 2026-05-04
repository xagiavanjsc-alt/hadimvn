# Hướng dẫn PWA - Cài app lên điện thoại

## PWA là gì?

App web có thể cài đặt như app thường, dùng được khi offline.

## Cách cài đặt

**iPhone/iPad:**
1. Mở Safari vào hadim.vn
2. Nhấn Share (mũi tên lên)
3. Chọn "Add to Home Screen"
4. Nhấn Add
5. App xuất hiện trên màn hình

**Android:**
1. Mở Chrome vào hadim.vn
2. Nhấn menu (3 chấm)
3. Chọn "Install App" hoặc "Add to Home Screen"
4. Nhấn Install/Add
5. App xuất hiện trên màn hình

**Máy tính:**
1. Mở Chrome/Edge vào hadim.vn
2. Nhấn icon Install ở thanh địa chỉ (hình dấu cộng)
3. Nhấn Install

## Tính năng

- **Offline:** Vẫn xem được khi mất mạng
- **Nhanh hơn:** Fonts, hình ảnh được cache
- **Như app thường:** Có icon trên màn hình, mở nhanh

## Lưu ý

- iOS phải dùng Safari (không dùng Chrome/Facebook)
- Android phải dùng Chrome
- Khi cập nhật code mới, app sẽ tự cập nhật sau khi reload

App có thể gửi thông báo nhắc nhở:
- Nhắc học hàng ngày
- Thông báo streak sắp hết hạn
- Thông báo VIP sắp hết hạn

## Cách sử dụng trong code

### Service Worker đã được cấu hình sẵn

File `public/sw.js` đã được cấu hình với:
- Cache fonts, images, CDN assets
- Cache JS/CSS chunks (Stale While Revalidate)
- Offline fallback page
- Background sync cho dữ liệu học tập offline

### PWA Manifest

File `public/manifest.json` đã được cấu hình với:
- App name, short name
- Icons (192x192, 512x512)
- Theme color
- Shortcuts cho các tính năng chính

### Cập nhật cache

Khi deploy code mới:
- Service worker tự động cập nhật (cache version v9)
- User cần reload app để nhận bản mới
- Boot watchdog tự động xóa cache nếu React không mount trong 6s

## Lưu ý quan trọng

### 1. Cache Version

Khi thay đổi code quan trọng:
- Bump `CACHE_VERSION` trong `public/sw.js` (hiện tại là v9)
- Điều này sẽ xóa cache cũ và tải cache mới

### 2. Icons

Cần tạo icon files:
- `public/icon-192.png` (192x192px)
- `public/icon-512.png` (512x512px)
- `public/icon-72.png` (72x72px) cho iOS badge

### 3. Testing

Test PWA trên:
- Chrome DevTools > Application > Service Workers
- Chrome DevTools > Application > Manifest
- Lighthouse > PWA audit

### 4. iOS Safari

iOS có một số hạn chế:
- Không hỗ trợ install prompt (cài thủ công qua Add to Home Screen)
- Service worker chỉ hoạt động khi app đang mở
- Push notifications cần cấu hình thêm

### 5. Android Chrome

Chrome Android hỗ trợ đầy đủ:
- Install prompt tự động
- Service worker hoạt động background
- Push notifications sẵn sàng

## Troubleshooting

### App không cài được

**iOS:**
- Đảm bảo đang dùng Safari (không phải Chrome/Facebook browser)
- Kiểm tra có đủ dung lượng không
- Thử reload trang trước khi cài

**Android:**
- Đảm bảo đang dùng Chrome
- Kiểm tra permission cài đặt app
- Xóa cache Chrome và thử lại

### Cache cũ gây lỗi

Nếu app hiển thị màn hình đen hoặc lỗi:
1. Mổ app
2. Mở Chrome DevTools > Application > Storage > Clear site data
3. Hoặc chờ boot watchdog tự động xóa cache (6s)

### Service worker không hoạt động

Kiểm tra:
- Service worker đã đăng ký chưa (DevTools > Application > Service Workers)
- Cache version đã bump chưa
- Có lỗi trong console không

## Deploy Checklist

Khi deploy PWA:

- [ ] Bump cache version trong `public/sw.js`
- [ ] Cập nhật `public/manifest.json` nếu cần
- [ ] Thêm icon files nếu chưa có
- [ ] Test trên iOS Safari
- [ ] Test trên Android Chrome
- [ ] Test trên Desktop Chrome/Edge
- [ ] Chạy Lighthouse PWA audit
- [ ] Kiểm tra offline functionality
