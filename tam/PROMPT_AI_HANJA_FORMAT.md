# PROMPT CHUẨN CHO AI - TẠO NỘI DUNG HANJA

## YÊU CẦU TUYỆT ĐỐI (VI PHẠM = BỎ)

```
Tạo nội dung cho từ Hàn: {tu} (Hán tự: {han}, Nghĩa: {nghia})

=== CẤU TRÚC BẮT BUỘC - 4 PHẦN ===

PHẦN 1 - GIẢI NGHĨA (đúng 1 đoạn):
Nghĩa tiếng Việt là "...". Gốc Hán: "..." nghĩa là ...; "..." nghĩa là ...
→ CHỈ viết hoa chữ cái đầu câu, còn lại viết thường
→ KHÔNG dùng ** trong phần này

PHẦN 2 - 6 VÍ DỤ THỰC CHIẾN (đúng 6 ví dụ, không hơn không kém):
Mỗi ví dụ PHẢI theo format sau (copy y nguyên không sửa):

+ Hàn: [câu tiếng Hàn đầy đủ]
+ Bồi: [phiên âm tiếng Hàn]
   + Việt: [dịch tiếng Việt chỉ viết hoa chữ đầu câu]

+ Hàn: [câu 2]
+ Bồi: [phiên âm 2]
   + Việt: [dịch 2]

... (lặp lại đủ 6 lần)

QUY TẮC VÍ DỤ:
- Dòng + Hàn: bắt đầu bằng "+ Hàn: " (dấu + và khoảng trắng)
- Dòng + Bồi: bắt đầu bằng "+ Bồi: " (dấu + và khoảng trắng)
- Dòng + Việt: bắt đầu bằng "   + Việt: " (3 khoảng trắng, dấu +, khoảng trắng)
- KHÔNG được thêm dòng Bồi thứ 2
- KHÔNG được thêm ** trong câu tiếng Việt
- KHÔNG được thêm --- giữa các ví dụ

PHẦN 3 - 4 TỪ LIÊN QUAN GỐC HÁN (đúng 4 từ, không hơn không kém):
   - [Từ tiếng Hàn] ([Hán tự]): [Nghĩa tiếng Việt - chỉ viết hoa chữ đầu].
   - [Từ 2] ([Hán tự 2]): [Nghĩa 2].
   - [Từ 3] ([Hán tự 3]): [Nghĩa 3].
   - [Từ 4] ([Hán tự 4]): [Nghĩa 4].

QUY TẮC TỪ LIÊN QUAN:
- ĐÚNG 4 dòng, mỗi dòng bắt đầu bằng "   - " (3 khoảng trắng, dấu -, khoảng trắng)
- Mỗi từ: Hangul (Hán tự): Nghĩa tiếng Việt.
- KHÔNG được thêm phiên âm bồi (ví dụ: KHÔNG viết " - Bun'gye")
- KHÔNG được dùng số thứ tự (1. 2. 3. 4.)
- KHÔNG được dùng ** trong phần nghĩa

PHẦN 4 - MẸO NHỚ (đúng 1 đoạn):
[Mẹo ghi nhớ thú vị, liên tưởng âm Hán Việt]
→ CHỈ viết hoa chữ cái đầu câu
→ KHÔNG dùng ** trong phần này

=== TUYỆT ĐỐI CẤM ===
- KHÔNG thêm dòng "DONE" hay bất kỳ bình luận thừa
- KHÔNG thêm --- separator ở cuối
- KHÔNG viết hoa giữa câu tiếng Việt
- KHÔNG thêm dấu " trong phần nghĩa
- KHÔNG dùng format số thứ tự (1. 2. 3.) ở từ liên quan
- KHÔNG viết thiếu hoặc thừa số ví dụ (đúng 6)
- KHÔNG viết thiếu hoặc thừa từ liên quan (đúng 4)
```

## KIỂM TRA SAU KHI SINH

Script sẽ kiểm tra:
1. Đủ 4 phần (GIẢI NGHĨA, 6 VÍ DỤ, 4 TỪ LIÊN QUAN, MẸO NHỚ)
2. Đúng 6 ví dụ, mỗi ví dụ có + Hàn, + Bồi,    + Việt
3. Đúng 4 từ liên quan, format `   - word (hanja): meaning.`
4. Không có ** trong nghĩa tiếng Việt
5. Không có phiên âm bồi trong từ liên quan
6. Không có dòng thừa (DONE, ---, v.v.)
