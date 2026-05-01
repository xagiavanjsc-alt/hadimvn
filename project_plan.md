# KTS Hàn Việt - Internal Admin Tool

## 1. Mô tả dự án
Công cụ quản trị nội bộ dành cho trung tâm Hàn Việt KTS, giúp admin tạo nội dung học tiếng Hàn qua K-pop và quản lý cộng đồng Q&A. Dữ liệu được lấy từ Apify Melon Scraper và Naver KiN Scraper, xử lý bằng AI và xuất ra file Excel để upload lên website chính.

## 2. Cấu trúc trang
- `/` - Dashboard Home (tổng quan)
- `/melon` - Tool Chế biến bài học K-pop (Melon)
- `/naver` - Tool Quản lý Cộng đồng & Naver KiN

## 3. Tính năng cốt lõi
- [ ] Dashboard tổng quan
- [ ] Kết nối Apify API (Melon Scraper)
- [ ] Bảng dữ liệu bài hát Top 100 Melon
- [ ] AI Editor: Tạo Truyện Chêm + Từ vựng + Giải thích
- [ ] Xuất Excel bài học K-pop
- [ ] Tìm kiếm Naver KiN theo từ khóa
- [ ] Inbox duyệt câu hỏi Naver
- [ ] AI Processing: Dịch + Viết lại + Hashtag
- [ ] Xuất Excel Q&A cộng đồng

## 4. Tích hợp bên thứ ba
- Apify API: Melon Chart Scraper + Naver KiN Scraper
- AI API: Xử lý nội dung (mock trong giai đoạn đầu)
- SheetJS (xlsx): Xuất file Excel

## 5. Kế hoạch phát triển

### Phase 1: Layout + Tool Melon
- Mục tiêu: Sidebar layout + toàn bộ Tool Melon
- Deliverable: Dashboard shell + API Connection + Data Grid + AI Editor + Export Excel

### Phase 2: Tool Naver KiN
- Mục tiêu: Toàn bộ Tool Naver
- Deliverable: Search + Inbox + AI Processing + Export Excel
