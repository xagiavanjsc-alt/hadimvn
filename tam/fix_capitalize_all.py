#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix capitalization for all 4 Phan files + Phan_005 + Phan_006"""
import re

FILES = [
    r'C:\Users\hi\Desktop\code\han\tam\Phan_001.md',
    r'C:\Users\hi\Desktop\code\han\tam\Phan_002.md',
    r'C:\Users\hi\Desktop\code\han\tam\Phan_003.md',
    r'C:\Users\hi\Desktop\code\han\tam\Phan_004.md',
    r'C:\Users\hi\Desktop\code\han\tam\Phan_005.md',
    r'C:\Users\hi\Desktop\code\han\tam\Phan_006.md',
]

def cap_first(s):
    """Capitalize first letter only, keep rest lowercase."""
    if not s or not s.strip():
        return s
    s = s.strip()
    return s[0].upper() + s[1:]

def fix_line(line, in_related=False, in_example_vi=False):
    """Fix capitalization for a single line."""
    line = line.rstrip('\n')
    
    # 1. Fix GIẢI NGHĨA: Nghĩa tiếng Việt là "meaning"
    m = re.match(r'(1\. GIẢI NGHĨA: Nghĩa tiếng Việt là ")([^"]+)(".*)', line)
    if m:
        prefix = m.group(1)
        meaning = m.group(2).strip()
        suffix = m.group(3)
        return prefix + cap_first(meaning) + suffix
    
    # 2. Fix related word lines: - word (hanja): meaning
    if in_related:
        m = re.match(r'(\s+-\s+\S+\s+\([^)]+\):\s*)(.+)', line)
        if m:
            prefix = m.group(1)
            meaning = m.group(2).strip()
            return prefix + cap_first(meaning)
    
    # 3. Fix example Vietnamese lines:    + Việt: meaning
    if in_example_vi:
        m = re.match(r'(\s+\+\s+Việt:\s*)(.+)', line)
        if m:
            prefix = m.group(1)
            meaning = m.group(2).strip()
            return prefix + cap_first(meaning)
    
    return line

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    in_related = False
    in_example_vi = False
    
    for line in lines:
        # Detect sections
        if re.match(r'3\.\s*\d+\s*TỪ LIÊN QUAN', line):
            in_related = True
            in_example_vi = False
            new_lines.append(line.rstrip('\n'))
            continue
        
        if re.match(r'4\.\s*M[ẸE]O', line):
            in_related = False
            in_example_vi = False
            new_lines.append(line.rstrip('\n'))
            continue
        
        if re.match(r'2\.\s*\d+\s*VÍ DỤ', line):
            in_related = False
            in_example_vi = False
            new_lines.append(line.rstrip('\n'))
            continue
        
        # Detect Việt example line
        if re.match(r'\s+\+\s+Việt:', line):
            in_example_vi = True
            new_lines.append(fix_line(line, in_example_vi=True))
            continue
        else:
            in_example_vi = False
        
        # Fix other lines
        fixed = fix_line(line, in_related=in_related)
        new_lines.append(fixed)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines) + '\n')
    
    print(f'✅ Fixed: {filepath}')

if __name__ == '__main__':
    for f in FILES:
        process_file(f)
    print('\n🎉 Done! All files fixed.')
