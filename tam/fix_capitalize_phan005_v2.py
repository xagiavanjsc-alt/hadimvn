"""Fix vietnamese capitalization - chi viet hoa chu cai dau cau"""
import re

def fix_text(text):
    fixed = ''
    first_alpha = False
    for ch in text:
        if ch.isalpha() and not first_alpha:
            fixed += ch.upper()
            first_alpha = True
        elif ch.isalpha():
            fixed += ch.lower()
        else:
            fixed += ch
    return fixed

with open('tam/Phan_005.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    line = line.rstrip('\n')
    
    # Pattern 1: "1. GIẢI NGHĨA: ..." or "4. MẸO NHỚ: ..."
    m = re.match(r'^(\s*\d+\.\s+[^:]+:\s*)(.+)$', line)
    if m:
        prefix, text = m.group(1), m.group(2)
        new_lines.append(prefix + fix_text(text))
        continue
    
    # Pattern 2: "    + Việt: ..."
    m = re.match(r'^(\s+\+\s*Việt:\s*)(.+)$', line)
    if m:
        prefix, text = m.group(1), m.group(2)
        new_lines.append(prefix + fix_text(text))
        continue
    
    # Pattern 3: "   - từ (hán): nghĩa."
    m = re.match(r'^(\s+-\s+[가-힣]+\s*\([^)]+\):\s*)(.+)$', line)
    if m:
        prefix, text = m.group(1), m.group(2)
        new_lines.append(prefix + fix_text(text))
        continue
    
    new_lines.append(line)

with open('tam/Phan_005.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines) + '\n')
print("Fixed capitalization")
