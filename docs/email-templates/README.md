# Email Templates — Hàn Quốc Ơi!

Templates HTML tiếng Việt cho Supabase Auth, đồng bộ với brand app (nền tối, accent vàng `#e8c84a`).

## Danh sách templates

| File | Dùng cho | Subject gợi ý |
|------|----------|---------------|
| `confirm-signup.html` | Xác nhận đăng ký | `Xác nhận tài khoản Hàn Quốc Ơi!` |
| `reset-password.html` | Quên mật khẩu | `Đặt lại mật khẩu — Hàn Quốc Ơi!` |
| `magic-link.html` | Đăng nhập magic link | `Liên kết đăng nhập — Hàn Quốc Ơi!` |
| `change-email.html` | Đổi địa chỉ email | `Xác nhận thay đổi email — Hàn Quốc Ơi!` |
| `invite-user.html` | Mời user tham gia | `Bạn được mời tham gia Hàn Quốc Ơi!` |

## Cách cấu hình trong Supabase

1. Mở **Supabase Dashboard → Authentication → Email Templates**
2. Chọn từng template tương ứng:
   - `Confirm signup` → dán `confirm-signup.html`
   - `Reset password` → dán `reset-password.html`
   - `Magic Link` → dán `magic-link.html`
   - `Change Email Address` → dán `change-email.html`
   - `Invite user` → dán `invite-user.html`
3. Copy toàn bộ nội dung file HTML → paste vào ô **Message (HTML)**
4. Cập nhật **Subject** theo gợi ý trên
5. Nhấn **Save**

## Biến template (Supabase)

Các biến `{{ .X }}` được Supabase thay thế tự động:
- `{{ .ConfirmationURL }}` — link xác nhận / đăng nhập / reset
- `{{ .Email }}` — email hiện tại của user
- `{{ .NewEmail }}` — email mới (chỉ có trong change-email)
- `{{ .SiteURL }}` — URL gốc của app (nếu cần)
- `{{ .Token }}` — OTP 6 số (nếu bạn dùng OTP flow)

**Đừng xoá** các placeholder này khi chỉnh sửa.

## Test trước khi dùng production

1. **Preview**: Supabase Dashboard có nút "Send test email" — gửi thử đến email admin trước khi enable.
2. **Spam check**: Dùng https://mail-tester.com/ — gửi email từ Resend + template mới → xem điểm. Mục tiêu ≥ 8/10.
3. **Dark mode**: Mở trong Gmail mobile + Outlook — kiểm tra màu sắc không bị đảo ngược sai.

## Tuỳ biến thêm

Nếu muốn đổi màu brand, sửa các giá trị này trong mọi file:
- `#0f1117` → màu nền page
- `#141720` → màu nền card
- `#e8c84a` → màu accent (nút + link)
- `한` → chữ trong logo (có thể đổi thành `H`, `HQ`, hoặc emoji)
