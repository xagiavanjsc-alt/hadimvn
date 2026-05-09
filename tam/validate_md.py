"""
Kiểm tra file Markdown Hanja có đúng format không.
Chạy: python validate_md.py Phan_XXX.md
"""

import sys
import re

def check_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Tách từng entry (tìm ## từ tiếng Hàn)
    entries = re.split(r'\n## ', content)
    if len(entries) <= 1:
        print("❌ Không tìm thấy entry nào")
        return
    
    # Bỏ phần header trước entry đầu
    entries = entries[1:]
    
    total_errors = 0
    
    for i, entry in enumerate(entries, 1):
        errors = []
        lines = entry.split('\n')
        entry_title = lines[0][:30] if lines else f"Entry {i}"
        
        # 1. Kiểm tra header
        header = lines[0] if lines else ""
        if not re.match(r'^[가-힣]+\s+\([^)]+\)', header):
            errors.append("Header sai format (cần: Từ (Hán tự))")
        
        # 2. Kiểm tra đủ 4 phần
        raw = '\n'.join(lines)
        if "GIẢI NGHĨA" not in raw:
            errors.append("Thiếu GIẢI NGHĨA")
        if "VÍ DỤ" not in raw:
            errors.append("Thiếu VÍ DỤ")
        if "TỪ LIÊN QUAN" not in raw:
            errors.append("Thiếu TỪ LIÊN QUAN")
        if "MẸO NHỚ" not in raw:
            errors.append("Thiếu MẸO NHỚ")
        
        # 3. Kiểm tra số ví dụ
        han_count = len(re.findall(r'^\+ Hàn:', raw, re.MULTILINE))
        boi_count = len(re.findall(r'^\+ Bồi:', raw, re.MULTILINE))
        viet_count = len(re.findall(r'^\s+\+ Việt:', raw, re.MULTILINE))
        
        if han_count != 6:
            errors.append(f"Ví dụ Hàn: {han_count}/6")
        if boi_count != 6:
            errors.append(f"Ví dụ Bồi: {boi_count}/6")
        if viet_count != 6:
            errors.append(f"Ví dụ Việt: {viet_count}/6")
        
        # 4. Kiểm tra dòng Bồi thừa
        extra_boi = len(re.findall(r'^\s+\+ Bồi:', raw, re.MULTILINE))
        if extra_boi > 0:
            errors.append(f"Có {extra_boi} dòng Bồi thừa")
        
        # 5. Kiểm tra 4 từ liên quan
        related = re.findall(r'^\s+-\s+[가-힣]+\s+\([^)]+\):', raw, re.MULTILINE)
        if len(related) != 4:
            errors.append(f"Từ liên quan: {len(related)}/4")
        
        # 6. Kiểm tra phiên âm bồi trong từ liên quan
        for r_line in related:
            m = re.match(r'\s+-\s+[가-힣]+\s+\(([^)]+)\):', r_line)
            if m:
                hanja = m.group(1)
                if re.search(r'[-,]\s*[A-Za-z]', hanja):
                    errors.append(f"Có phiên âm trong: {hanja}")
                    break
        
        # 7. Kiểm tra ** trong nghĩa Việt
        viet_lines = re.findall(r'^\s+\+ Việt:\s*(.+)', raw, re.MULTILINE)
        for vl in viet_lines:
            if '**' in vl:
                errors.append("Có ** trong dòng Việt")
                break
        
        # 8. Kiểm tra --- separator
        if '---' in raw:
            errors.append("Có dòng --- trong entry")
        
        # 9. Kiểm tra viết hoa tiếng Việt
        for vl in viet_lines:
            # Bỏ qua chữ cái đầu
            rest = vl.lstrip()
            if len(rest) > 1:
                for j, ch in enumerate(rest[1:], 1):
                    if ch.isupper() and ch.isalpha():
                        errors.append(f"Viết hoa giữa câu: ...{rest[max(0,j-5):j+5]}")
                        break
        
        if errors:
            print(f"\n❌ Entry {i}: {entry_title}")
            for err in errors:
                print(f"   - {err}")
            total_errors += len(errors)
    
    print(f"\n{'='*50}")
    print(f"Tổng: {len(entries)} entry")
    if total_errors == 0:
        print("✅ KHÔNG CÓ LỖI!")
    else:
        print(f"❌ Tổng lỗi: {total_errors}")
    print(f"{'='*50}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_md.py Phan_XXX.md")
        sys.exit(1)
    check_file(sys.argv[1])
