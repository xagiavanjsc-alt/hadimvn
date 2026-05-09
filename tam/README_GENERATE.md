# Hanja Content Generator

Script độc lập để sinh nội dung Hanja vocabulary từ OpenAI API, xuất ra file Markdown (.md) thay vì Excel để tránh lỗi.

## Cài đặt

```bash
pip install openai
```

## Cách dùng

### 1. Điền API Key
Mở file `generate_hanja_md.py`, điền API key của bạn vào biến `OPENAI_API_KEY`:

```python
OPENAI_API_KEY = "sk-your-api-key-here"
```

### 2. Chuẩn bị danh sách từ
**Cách 1: Tạo file words.txt**
```
가결
가격
가관
...
```

**Cách 2: Nhập từ bàn phím khi chạy script**

### 3. Chạy script
```bash
python generate_hanja_md.py
```

### 4. Chọn input
- Nhập `1`: Nhập từ từ bàn phím
- Nhập `2`: Đọc từ file `words.txt`

### 5. Kết quả
File `Phan_001.md` sẽ được tạo với nội dung đầy đủ.

## Cấu trúc Output

Mỗi từ sẽ có:
- GIẢI NGHĨA: Nghĩa tiếng Việt + phân tích gốc Hán
- 5 VÍ DỤ THỰC CHIẾN: Hàn + Bồi + Việt
- 3 TỪ LIÊN QUAN GỐC HÁN: Từ liên quan
- MẸO NHỚ: Mẹo nhớ creative

## Upload lên Supabase

Sau khi có file Markdown, dùng script `upload_from_md.py` để upload:

```bash
python upload_from_md.py
```

## Ưu điểm

- ✅ Không phụ thuộc Excel (tránh lỗi đọc file)
- ✅ Format Markdown đơn giản, dễ edit
- ✅ Có thể chạy ở bất kỳ đâu (chỉ cần Python + API key)
- ✅ Content tối ưu bằng OpenAI
- ✅ Dễ dàng review và chỉnh sửa trước khi upload
