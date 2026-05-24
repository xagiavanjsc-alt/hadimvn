# 🛡️ HƯỚNG DẪN BACKUP HÀNG TUẦN

> **Đọc 1 lần. Làm theo. Đừng skip.**
>
> **Tần suất:** Mỗi Chủ Nhật, 5 phút.
> **Mục đích:** Cứu data nếu Supabase chết/bị xóa.

---

## ⚠️ QUAN TRỌNG: 2 LOẠI BACKUP — ĐỪNG NHẦM

### Backup loại 1: localStorage (admin page có sẵn)
**Đường dẫn:** hanquocoi.vn/admin/backup

- Backup gì: Cache trên browser của 1 user (XP local, streak, settings UI)
- Khi nào cần: Reset máy tính, user đổi browser
- **KHÔNG cứu được:** Data trong DB Supabase

### Backup loại 2: Database Supabase ⭐ (script tôi viết)
**Lệnh:** `npm run backup`

- Backup gì: **TẤT CẢ data** trong Supabase
  - 60 bài học EPS
  - Hàng nghìn từ vựng
  - User accounts + tiến độ học
  - Đề thi, ngữ pháp, Hanja, Seoul, TOPIK
  - Community posts, leaderboard
- Khi nào cần: **Mọi lúc.** Supabase chết = mất hết nếu không có cái này.

→ **Hướng dẫn dưới đây là backup loại 2.** Loại quan trọng nhất.

---

## 📋 QUY TRÌNH BACKUP HÀNG TUẦN — 5 PHÚT

### Bước 1: Mở terminal (30 giây)

**Windows — 3 cách:**

**Cách A:** Mở **File Explorer** → vào thư mục `C:\Users\hi\Desktop\code\han` → click chuột phải vào chỗ trống → chọn **"Open in Terminal"** hoặc **"Open Git Bash here"**

**Cách B:** Mở **Git Bash** → gõ:
```bash
cd "C:/Users/hi/Desktop/code/han"
```

**Cách C:** Mở **PowerShell** → gõ:
```powershell
cd "C:\Users\hi\Desktop\code\han"
```

### Bước 2: Chạy backup (2-3 phút)

Copy paste lệnh này, bấm Enter:

```bash
npm run backup
```

Bạn sẽ thấy output kiểu:
```
📦 Backup Supabase → backup\2026-06-01/

  eps_grammar                    ... ✅ 100 rows
  eps_vocab_entries              ... ✅ 1,247 rows (paginated)
  seoul_lessons                  ... ✅ 69 rows
  ...
  hanja_pro                      ... ✅ 2,591 rows (paginated)

✅ Backup hoàn tất!
📁 Folder: backup\2026-06-01/
📊 Total: 21,000+ rows, 79 tables
```

⚠️ **Nếu thấy lỗi:**
- `"Thiếu env var"` → file `.env` thiếu `SUPABASE_SERVICE_ROLE_KEY` (đã setup từ trước, không nên gặp lại)
- `"Table không tồn tại"` cho 1 vài table → bình thường, bỏ qua
- Lỗi khác → chụp ảnh báo Claude

### Bước 3: Đưa backup lên GitHub (1 phút)

Copy paste 3 lệnh sau (lần lượt hoặc cùng lúc), bấm Enter sau mỗi lệnh:

```bash
git add backup/
git commit -m "backup: weekly snapshot"
git push
```

Output cuối phải có dòng kiểu:
```
To https://github.com/xagiavanjsc-alt/hadimvn.git
   abc1234..def5678  main -> main
```

**→ Xong. Data tuần này đã safe trên GitHub.**

---

## 🚀 SHORTCUT — Backup + push trong 1 lệnh

Để nhanh hơn nữa, paste cả khối này (1 dòng dài):

```bash
cd "C:/Users/hi/Desktop/code/han" && npm run backup && git add backup/ && git commit -m "backup: weekly snapshot $(date +%Y-%m-%d)" && git push
```

→ Đợi 3-5 phút, xong tất cả.

---

## 📅 LỊCH NHẮC HÀNG TUẦN

**Đặt báo thức trên điện thoại:**

- Tên: "Backup Hàn Quốc Ơi!"
- Lặp lại: **Chủ Nhật, 21:00**
- Ghi chú: `cd "C:/Users/hi/Desktop/code/han" && npm run backup && git add backup/ && git commit -m "weekly backup" && git push`

**Hoặc đặt trên Google Calendar:**
- Tạo event "Backup hanquocoi.vn"
- Lặp: hàng tuần, mỗi Chủ Nhật 21:00
- Notification: 30 phút trước

---

## ❓ TROUBLESHOOTING

### Lỗi: "npm: command not found"
→ Bạn đang ở terminal sai. Mở **Git Bash** hoặc **PowerShell**, KHÔNG dùng Command Prompt cũ.

### Lỗi: "Cannot find module..."
→ Chạy `npm install` trước, rồi `npm run backup`.

### Lỗi: "fatal: not a git repository"
→ Bạn đang sai thư mục. Phải vào thư mục `han` trước:
```bash
cd "C:/Users/hi/Desktop/code/han"
pwd  # check thư mục hiện tại
```

### Lỗi: "Authentication failed" khi git push
→ Token GitHub hết hạn. Vào https://github.com/settings/tokens → tạo Personal Access Token mới → dùng làm password.

### Backup folder quá lớn
→ Bình thường 20-50 MB. Nếu >100 MB, có thể bạn đã thêm rất nhiều data. Vẫn push được lên GitHub (giới hạn 100MB/file, 5GB/repo).

### Quên backup 1-2 tuần
→ Không sao, làm ngay khi nhớ. Backup tuần trước vẫn còn. Nhưng đừng quên quá 1 tháng.

---

## 🔍 KIỂM TRA BACKUP CÓ THẬT SỰ TỒN TẠI

Sau khi push, vào https://github.com/xagiavanjsc-alt/hadimvn/tree/main/backup

Bạn sẽ thấy danh sách folder:
```
backup/
├── 2026-05-24/
├── 2026-06-01/
├── 2026-06-08/
└── ...
```

Click vào folder mới nhất → thấy `summary.txt` → mở xem có bao nhiêu data.

---

## 🆘 KHI CẦN RESTORE (giả sử Supabase chết)

**Đừng panic.** Data của bạn còn nguyên trên GitHub.

### Bước 1: Tạo Supabase project mới
- Vào https://supabase.com/dashboard
- New project → đặt tên, password
- Đợi 2-3 phút để project khởi tạo

### Bước 2: Apply migrations
```bash
cd "C:/Users/hi/Desktop/code/han"
# Update .env với URL + service_role key của project MỚI
# Sau đó push schema từ migrations:
# (Cần Supabase CLI cài sẵn, hoặc copy-paste SQL vào Dashboard SQL Editor)
```

### Bước 3: Restore data từ backup
→ Phần này phức tạp, **báo Claude khi cần** — tôi viết script restore cho bạn.

Hoặc fallback: dùng folder `backup/YYYY-MM-DD/` mới nhất, mỗi file JSON là 1 table → import từng cái qua Supabase Dashboard hoặc dùng `supabase-js insert()`.

---

## 💎 BACKUP RULES (in dán trên màn hình)

1. ✅ **Chủ Nhật = ngày backup.** Đừng dời.
2. ✅ **Backup TRƯỚC khi:** thêm content lớn, sửa schema DB, làm gì sợ vỡ.
3. ✅ **Verify push:** mở GitHub xem folder backup mới đã lên chưa.
4. ❌ **KHÔNG XÓA** folder `backup/` cũ (mỗi tuần thêm folder mới, không đè).
5. ❌ **KHÔNG SHARE** file `.env` (có service_role key — mất key = chết).

---

## 🤖 TƯƠNG LAI — Tự động hóa hoàn toàn

Sau này có thời gian, có thể setup auto-backup:

**Option A:** GitHub Actions chạy backup mỗi tuần
- Add workflow `.github/workflows/weekly-backup.yml`
- Schedule cron "0 14 * * 0" (Chủ Nhật 14:00 UTC = 21:00 VN)
- Tự dump DB → commit → push
- **Bạn không phải làm gì cả**

**Option B:** Windows Task Scheduler
- Tạo task chạy `npm run backup` mỗi Chủ Nhật
- Local backup, vẫn cần `git push` thủ công

**Khi nào muốn setup auto, báo Claude.** Hiện tại làm thủ công là đủ.

---

## ✅ CHECKLIST 5 PHÚT MỖI CHỦ NHẬT

- [ ] Mở terminal trong thư mục `han`
- [ ] Chạy `npm run backup`
- [ ] Verify output có "✅ Backup hoàn tất"
- [ ] `git add backup/`
- [ ] `git commit -m "weekly backup"`
- [ ] `git push`
- [ ] Mở GitHub verify folder backup mới đã lên
- [ ] Xong. Tự thưởng cho mình 1 cốc trà sữa 🧋

---

**Ngày tạo:** 2026-05-25
**Backup gần nhất:** xem folder `backup/` mới nhất
