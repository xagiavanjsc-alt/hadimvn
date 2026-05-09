#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Template để tạo Phan_004.md, Phan_005.md...
Copy file này, đổi tên, thay WORDS = [] bằng 21 từ mới.
Sau đó chạy: python template_generator.py
"""

WORDS = [
    # ("hangul", "hanja", "nghĩa ngắn",
    #  "giải thích gốc Hán",
    #  [("Hàn", "Bồi", "Việt"), ... đúng 6 ví dụ],
    #  [("word", "hanja", "Nghĩa viết hoa đầu câu"), ... đúng 4 từ],
    #  "mẹo nhớ viết hoa đầu câu"),
]

def make_word(w):
    hangul, hanja, short_meaning, meaning, examples, related, mnemonic = w
    lines = []
    lines.append(f"## {hangul} ({hanja})")
    lines.append("")
    lines.append(f"1. GIẢI NGHĨA: Nghĩa tiếng Việt là \"{short_meaning}\". {meaning}")
    lines.append("")
    lines.append("2. 6 VÍ DỤ THỰC CHIẾN:")
    for ko, boi, vi in examples:
        lines.append(f"+ Hàn: {ko}")
        lines.append(f"+ Bồi: {boi}")
        lines.append(f"   + Việt: {vi}")
        lines.append("")
    lines.append("3. 4 TỪ LIÊN QUAN GỐC HÁN:")
    for rw, rh, rm in related:
        lines.append(f"   - {rw} ({rh}): {rm}")
    lines.append("")
    lines.append(f"4. MẸO NHỚ: {mnemonic}")
    lines.append("")
    return "\n".join(lines)

def main():
    phan_num = 4  # ĐỔI SỐ NÀY: 4, 5, 6...
    start_id = 100 + (phan_num - 1) * 21  # Phan 4 = 163, Phan 5 = 184
    
    if not WORDS:
        print("❌ Chưa có từ nào. Hãy điền WORDS = [...]")
        return
    
    out = [f"# Phan {phan_num:03d} Hanja Vocabulary\n"]
    for w in WORDS:
        out.append(make_word(w))
    
    filepath = fr"C:\Users\hi\Desktop\code\han\tam\Phan_{phan_num:03d}.md"
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write("\n".join(out))
    
    print(f"✅ Đã tạo: {filepath}")
    print(f"   Tổng số từ: {len(WORDS)}")
    print(f"   ID trên DB: {start_id} – {start_id + len(WORDS) - 1}")
    print(f"   Số thứ tự web: #{start_id - 99} – #{start_id + len(WORDS) - 100}")

if __name__ == "__main__":
    main()
