import re
import os

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Xóa dòng --- (separator giữa các từ)
    content = re.sub(r'\n+---\n+', '\n\n', content)
    
    # 2. Trong phần "4. MẸO NHỚ:", bỏ ** quanh từ tiếng Việt nhưng giữ lại nếu là từ Hàn
    # Pattern: **"WORD" (한)** hoặc **WORD (한)** -> "WORD" (한)
    # Chỉ áp dụng trong dòng bắt đầu bằng "4. MẸO NHỚ"
    lines = content.split('\n')
    cleaned = []
    for line in lines:
        if line.strip().startswith('4. MẸO NHỚ:'):
            # Bỏ ** xung quanh cụm "Từ (Hán)" nhưng giữ nội dung
            line = re.sub(r'\*\*"([^"]+)"\s*\(([^)]+)\)\*\*', r'"\1" (\2)', line)
            line = re.sub(r'\*\*([^*]+)\s*\(([^)]+)\)\*\*', r'\1 (\2)', line)
            # Bỏ ** quanh từ đơn lẻ nếu có
            line = re.sub(r'\*\*([^*]+)\*\*', r'\1', line)
        cleaned.append(line)
    content = '\n'.join(cleaned)
    
    # 3. Xóa trailing whitespace
    content = content.rstrip() + '\n'
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Đã clean: {filepath}")

# Clean cả 2 file
for fname in ['Phan_001.md', 'Phan_002.md']:
    fpath = os.path.join(os.path.dirname(__file__), fname)
    clean_file(fpath)
