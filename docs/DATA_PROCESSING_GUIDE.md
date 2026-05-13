# Hướng dẫn Xử lý Dữ liệu Melon & Naver KiN

## Tổng quan

Hướng dẫn này mô tả quy trình xử lý dữ liệu từ Melon Chart và Naver KiN Q&A để tối ưu cho người Việt Nam.

## Workflow

### 1. Fetch dữ liệu (từ máy local)

```bash
# Fetch Melon data
python scripts/fetch_melon_weekly.py

# Fetch Naver KiN data
python scripts/fetch_naver_kin_weekly.py
```

**Kết quả:**
- `src/mocks/melonSongs.md` - Markdown để edit
- `src/mocks/melonSongs_real.json` - JSON cho web app
- `src/mocks/naver_kin.md` - Markdown để edit
- `src/mocks/naver_kin_real.json` - JSON cho web app

### 2. Edit Markdown (nếu cần)

Mở file Markdown và review:
- Kiểm tra nội dung có phù hợp không
- Fix lỗi chính tả
- Loại bỏ nội dung không phù hợp

### 3. Upload lên VPS qua Admin Panel

**Cách 1: Upload file JSON/CSV trực tiếp**

1. Đăng nhập vào admin panel
2. Vào trang `/admin-melon` (cho Melon) hoặc `/admin-naver-kin` (cho Naver)
3. Click "Upload dữ liệu"
4. Drag & drop file JSON hoặc CSV
5. Click "Upload & Cập nhật"

**Cách 2: Edit trực tiếp trên web**

1. Vào admin panel tương ứng
2. Click vào item để xem chi tiết
3. Click "Chỉnh sửa" để sửa
4. Thêm bản dịch tiếng Việt
5. Đánh dấu "Đã dịch" khi hoàn thành

### 4. Tối ưu nội dung cho người Việt

## Melon Chart Data

### Cải thiện lyrics cho người học tiếng Hàn:

**1. Thêm từ vựng quan trọng**
- Trích xuất từ vựng TOPIK/EPS từ lyrics
- Thêm nghĩa tiếng Việt
- Thêm phiên âm romaji (nếu cần)

**2. Thêm ngữ pháp**
- Trích xuất mẫu câu ngữ pháp
- Giải thích cách dùng
- Thêm ví dụ

**3. Thêm bản dịch**
- Dịch nghĩa chính của bài hát
- Dịch từng đoạn
- Giải thích ý nghĩa văn hóa

**Ví dụ format:**
```json
{
  "rank": 1,
  "title": "Supernova",
  "artist": "aespa",
  "genre": "K-pop",
  "lyrics": "...",
  "lyrics_vi": "Bản dịch tiếng Việt...",
  "vocabulary": [
    {"korean": "중력", "vietnamese": "trọng lực", "romaji": "jung-ryeok"},
    {"korean": "우주", "vietnamese": "vũ trụ", "romaji": "u-ju"}
  ],
  "grammar": [
    {"pattern": "-아/어 보다", "meaning": "thử làm gì đó", "examples": ["봐", "돌아가 보자"]}
  ],
  "cultural_notes": "Bài hát nói về sự bùng nổ như siêu tân tinh..."
}
```

## Naver KiN Q&A Data

### Cải thiện Q&A cho người học tiếng Hàn:

**1. Thêm bản dịch tiếng Việt**
- Dịch câu hỏi
- Dịch câu trả lời
- Giải thích từ khó

**2. Phân loại theo chủ đề**
- TOPIK
- EPS-TOPIK
- Ngữ pháp
- Từ vựng
- Văn hóa

**3. Thêm cấp độ khó**
- Cấp độ 1: Dễ (TOPIK I)
- Cấp độ 2: Trung bình (TOPIK II)
- Cấp độ 3: Khó

**Ví dụ format:**
```json
{
  "id": 1,
  "question": "한국어 공부 어떻게 시작해요?",
  "question_vi": "Làm thế nào để bắt đầu học tiếng Hàn?",
  "answer": "...",
  "answer_vi": "Bản dịch tiếng Việt...",
  "category": "TOPIK",
  "difficulty": "1",
  "vocabulary": [
    {"korean": "공부", "vietnamese": "học tập"},
    {"korean": "시작하다", "vietnamese": "bắt đầu"}
  ],
  "grammar_notes": "Dùng pattern -어/아요 để hỏi cách thức"
}
```

## Demo trên Web

### 1. Trang Melon Chart (/melon)

**Features hiện tại:**
- Hiển thị danh sách bài hát
- Play nhạc (nếu có)
- Hiển thị lyrics

**Cải tiến đề xuất:**
- Thêm tab "Vocabulary" - hiển thị từ vựng từ lyrics
- Thêm tab "Grammar" - hiển thị ngữ pháp
- Thêm tab "Translation" - hiển thị bản dịch
- Thêm quiz - trắc nghiệm từ vựng/ ngữ pháp từ bài hát

### 2. Trang Naver Q&A (/naver)

**Features hiện tại:**
- Hiển thị danh sách Q&A
- Filter theo danh mục
- Search

**Cải tiến đề xuất:**
- Thêm tab "Translation" - hiển thị bản dịch tiếng Việt
- Thêm tab "Vocabulary" - trích xuất từ vựng từ Q&A
- Thêm quiz - trắc nghiệm dựa trên Q&A
- Thêm "Related" - gợi ý Q&A liên quan

## Automation

### Weekly Fetch (GitHub Actions)

Tạo file `.github/workflows/weekly-fetch.yml`:

```yaml
name: Weekly Data Fetch
on:
  schedule:
    - cron: "0 9 * * 1"  # Every Monday 9AM
  workflow_dispatch:

jobs:
  fetch-melon:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      - name: Install dependencies
        run: pip install apify-client
      - name: Fetch Melon data
        env:
          APIFY_API_KEY: ${{ secrets.APIFY_API_KEY }}
        run: python scripts/fetch_melon_weekly.py
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add src/mocks/melonSongs.md src/mocks/melonSongs_real.json
          git commit -m "chore: update weekly melon data" || exit 0
          git push
```

## Checklist trước khi deploy

- [ ] Fetch data thành công
- [ ] Review Markdown file
- [ ] Convert Markdown → JSON (nếu edit)
- [ ] Upload lên admin panel
- [ ] Kiểm tra dữ liệu hiển thị đúng
- [ ] Thêm bản dịch tiếng Việt
- [ ] Thêm từ vựng/ngữ pháp (nếu cần)
- [ ] Test quiz/features
- [ ] Deploy lên production

## Troubleshooting

**Lỗi: Không upload được file**
- Kiểm tra định dạng file (.json hoặc .csv)
- Kiểm tra kích thước file (< 10MB)
- Kiểm tra quyền admin

**Lỗi: Dữ liệu không hiển thị**
- Kiểm tra localStorage
- Kiểm tra format JSON
- Reload trang

**Lỗi: Deduplication không hoạt động**
- Kiểm tra key deduplication
- Xóa cache localStorage
- Fetch lại dữ liệu
