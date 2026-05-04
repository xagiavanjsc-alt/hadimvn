# Hướng dẫn sử dụng PWA - Hàn Quốc Ơi!

## PWA là gì?

PWA (Progressive Web App) là ứng dụng web có thể cài đặt trên điện thoại như một app native, có thể hoạt động offline, và có trải nghiệm người dùng tốt hơn.

## Tính năng PWA của Hàn Quốc Ơi!

### 1. Cài đặt trên điện thoại

**iOS (iPhone/iPad):**
1. Mở Safari trên iPhone/iPad
2. Truy cập https://hadim.vn
3. Nhấn nút "Share" (biểu tượng mũi tên lên) ở thanh dưới
4. Chọn "Add to Home Screen" (Thêm vào màn hình chính)
5. Nhấn "Add" (Thêm)
6. App sẽ xuất hiện trên màn hình chính với icon

**Android:**
1. Mở Chrome trên điện thoại Android
2. Truy cập https://hadim.vn
3. Nhấn menu (3 chấm) ở góc trên bên phải
4. Chọn "Add to Home Screen" (Thêm vào màn hình chính) hoặc "Install App" (Cài đặt ứng dụng)
5. Nhấn "Add" hoặc "Install"
6. App sẽ xuất hiện trên màn hình chính

**Desktop (Chrome/Edge):**
1. Mở Chrome/Edge trên desktop
2. Truy cập https://hadim.vn
3. Nhấn icon "Install" (biểu tượng dấu cộng trong hình vuông) ở thanh địa chỉ
4. Nhấn "Install"
5. App sẽ được cài đặt và mở như một app độc lập

### 2. Tính năng Offline

- **Offline page:** Khi mất kết nối, app sẽ hiển thị trang offline thông báo
- **Cache:** Fonts, icons, images được cache để load nhanh hơn
- **Service Worker:** Tự động cache các tài nguyên tĩnh

### 3. Shortcuts (Phím tắt)

Sau khi cài đặt, bạn có thể:
- Truy cập nhanh các tính năng từ menu phím tắt (Android)
- Nhấn icon trên màn hình chính để mở app ngay lập tức

### 4. Push Notifications (Tương lai)

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
