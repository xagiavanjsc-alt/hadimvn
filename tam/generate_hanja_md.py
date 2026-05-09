"""
Script độc lập để tạo nội dung Hanja vocabulary từ Markdown
Dùng OpenAI API để sinh nội dung, xuất ra file .md
Cách chạy: python generate_hanja_md.py
"""

import os
import json
import re
from openai import OpenAI

# ================== CẤU HÌNH ==================
# Điền API key của bạn vào đây
OPENAI_API_KEY = ""  # Nhập OpenAI API key của bạn
OUTPUT_FILE = "Phan_001.md"  # Tên file output

# ================== PROMPT TEMPLATE ==================
SYSTEM_PROMPT = """Bạn là chuyên gia dạy tiếng Hàn cho người Việt, chuyên về từ vựng Hán tự (Hanja).
Nhiệm vụ: Tạo nội dung học từ vựng Hanja chi tiết cho người Việt.

CẤU TRÚC OUTPUT CHO MỖI TỪ:
## [Tiếng Hàn] (Hán tự)

1. GIẢI NGHĨA: Nghĩa tiếng Việt là "...". Phân tích gốc Hán: "[Hán tự 1] ([Hàn], [Hán Việt]) nghĩa là "..."; "[Hán tự 2] ([Hàn], [Hán Việt]) nghĩa là "...". Hợp lại chỉ ...

2. 5 VÍ DỤ THỰC CHIẾN:
+ Hàn: [Câu tiếng Hàn với từ cần học in đậm bằng **...**]
+ Bồi: [Phiên âm Romaji]
   + Việt: [Dịch nghĩa tiếng Việt]

[Lặp lại cho 5 ví dụ]

3. 3 TỪ LIÊN QUAN GỐC HÁN:
   - [Từ] (Hán tự - phiên âm): Nghĩa tiếng Việt.
   - [Từ] (Hán tự - phiên âm): Nghĩa tiếng Việt.
   - [Từ] (Hán tự - phiên âm): Nghĩa tiếng Việt.

4. MẸO NHỚ: [Mẹo nhớ sáng tạo, dễ hiểu]

QUAN TRỌNG:
- Tiếng Việt phải tự nhiên, không dịch máy
- Phiên âm Romaji chuẩn (dùng hệ thống phổ biến cho người Việt)
- Ví dụ thực tế,贴近 cuộc sống
- Mẹo nhớ creative, dễ liên tưởng
- Mỗi từ cách nhau bằng "---"

"""

USER_PROMPT_TEMPLATE = """Tạo nội dung chi tiết cho các từ Hanja sau:

{words}

Yêu cầu:
- Số lượng từ: {count}
- Mỗi từ theo cấu trúc đã định nghĩa
- Tiếng Việt tự nhiên, dễ hiểu
- Ví dụ thực tế
- Mẹo nhớ creative

Output chỉ nội dung Markdown, không có text thừa.
"""

# ================== FUNCTIONS ==================
def generate_content(words, client):
    """Gọi OpenAI API để sinh nội dung"""
    prompt = USER_PROMPT_TEMPLATE.format(
        words="\n".join([f"- {w}" for w in words]),
        count=len(words)
    )
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=4000
    )
    
    return response.choices[0].message.content

def save_to_md(content, filename):
    """Lưu nội dung vào file Markdown"""
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Đã lưu vào {filename}")

def load_words_from_file(filename):
    """Đọc danh sách từ từ file text (mỗi dòng 1 từ)"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            words = [line.strip() for line in f if line.strip()]
        return words
    except FileNotFoundError:
        print(f"❌ Không tìm thấy file {filename}")
        return []

def input_words_interactive():
    """Nhập từ từ bàn phím"""
    print("Nhập danh sách từ cần sinh nội dung (mỗi dòng 1 từ, Enter để kết thúc):")
    words = []
    while True:
        word = input(f"Từ {len(words)+1}: ").strip()
        if not word:
            break
        words.append(word)
    return words

# ================== MAIN ==================
def main():
    # Kiểm tra API key
    if not OPENAI_API_KEY:
        print("❌ LỖI: Chưa nhập OPENAI_API_KEY trong code")
        print("   Hãy mở file này và điền API key của bạn vào biến OPENAI_API_KEY")
        return
    
    # Khởi tạo OpenAI client
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    # Lựa chọn input
    print("\n=== GENERATE HANJA CONTENT ===")
    print("1. Nhập từ từ bàn phím")
    print("2. Đọc từ file text (words.txt)")
    
    choice = input("Chọn (1/2): ").strip()
    
    if choice == "2":
        words = load_words_from_file("words.txt")
        if not words:
            print("❌ File words.txt trống hoặc không tồn tại")
            return
    else:
        words = input_words_interactive()
    
    if not words:
        print("❌ Không có từ nào để sinh nội dung")
        return
    
    print(f"\n📝 Đang sinh nội dung cho {len(words)} từ...")
    
    # Sinh nội dung
    try:
        content = generate_content(words, client)
        save_to_md(content, OUTPUT_FILE)
        print(f"🎉 Hoàn thành! Đã sinh nội dung cho {len(words)} từ")
    except Exception as e:
        print(f"❌ Lỗi khi gọi API: {e}")

if __name__ == "__main__":
    main()
