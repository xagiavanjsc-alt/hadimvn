#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix Phan_005.md: remove ** from mnemonic, remove boi from related words"""
import re

filepath = r'C:\Users\hi\Desktop\code\han\tam\Phan_005.md'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    original = line.rstrip('\n')
    
    # 1. Fix related words: remove boi after hanja
    # Pattern: word (hanja - boi): meaning → word (hanja): meaning
    # Pattern: word (hanja, boi): meaning → word (hanja): meaning
    m = re.match(r'(\s+-\s+\S+\s+\()([^)]+)(\):\s*.+)', original)
    if m:
        prefix = m.group(1)
        hanja_part = m.group(2)
        suffix = m.group(3)
        # Remove boi after - or ,
        hanja_clean = re.sub(r'\s*[-,]\s*[A-Za-z-]+$', '', hanja_part)
        hanja_clean = re.sub(r'\s*,\s*[ㄱ-ㅎㅏ-ㅣ가-힣]+$', '', hanja_clean)
        new_lines.append(prefix + hanja_clean + suffix)
        continue
    
    # 2. Remove ** from all lines (mnemonic and anywhere else)
    # But keep ** if it's around Korean word in examples (already cleaned)
    if '**' in original:
        original = original.replace('**', '')
    
    new_lines.append(original)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines) + '\n')

print(f'✅ Fixed: {filepath}')

# Verify
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

issues = []
if '**' in content:
    issues.append('  ⚠️ Còn dấu **')

# Check related words still have boi
for i, line in enumerate(content.split('\n'), 1):
    if re.match(r'\s+-\s+\S+\s+\([^)]+\):', line):
        m = re.match(r'\s+-\s+\S+\s+\(([^)]+)\):', line)
        if m:
            hanja = m.group(1)
            if ' - ' in hanja or re.search(r',\s*[A-Za-z-]+$', hanja) or re.search(r',\s*[ㄱ-ㅎㅏ-ㅣ가-힣]+$', hanja):
                issues.append(f'  ⚠️ Line {i}: vẫn còn phiên âm: {line.strip()[:60]}')

if issues:
    for i in issues:
        print(i)
else:
    print('  ✅ Không có lỗi')
