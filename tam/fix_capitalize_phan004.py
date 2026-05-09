#!/usr/bin/env python3
import re

filepath = r'C:\Users\hi\Desktop\code\han\tam\Phan_004.md'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix: Nghĩa tiếng Việt là "nghĩa..." -> "Nghĩa..."
def fix1(m):
    meaning = m.group(1)
    if meaning and meaning[0].islower():
        meaning = meaning[0].upper() + meaning[1:]
    return f'Nghĩa tiếng Việt là "{meaning}"'

content = re.sub(r'Nghĩa tiếng Việt là "([^"]+)"', fix1, content)

# 2. Fix: - word (hanja): nghĩa -> Nghĩa
def fix2(m):
    prefix = m.group(1)
    meaning = m.group(2).strip()
    if meaning and meaning[0].islower():
        meaning = meaning[0].upper() + meaning[1:]
    return prefix + meaning

content = re.sub(r'(\s+- \S+ \([^)]+\): )(.+)', fix2, content)

# 3. Fix: trong giải thích gốc Hán, các cụm sau "chỉ" hoặc "là" ở cuối câu
# Ví dụ: Hợp lại chỉ việc không chấp nhận... -> không cần sửa (đây là chữ giữa câu)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Fixed: {filepath}')

# Verify
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines, 1):
    # Check GIẢI NGHĨA
    if 'Nghĩa tiếng Việt là "' in line:
        m = re.search(r'Nghĩa tiếng Việt là "([^"]+)"', line)
        if m:
            meaning = m.group(1)
            if meaning[0].islower():
                print(f'  ❌ Line {i}: {meaning}')
            else:
                print(f'  ✅ Line {i}: {meaning}')
    # Check related
    if re.match(r'\s+- \S+ \([^)]+\):', line):
        m = re.match(r'\s+- \S+ \([^)]+\): (.+)', line)
        if m:
            meaning = m.group(1).strip()
            if meaning and meaning[0].islower():
                print(f'  ❌ Line {i}: {meaning}')
            else:
                print(f'  ✅ Line {i}: {meaning}')

print('Done!')
