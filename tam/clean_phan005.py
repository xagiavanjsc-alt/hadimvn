#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Clean Phan_005.md: remove duplicate Bồi, bold markers, fix format"""
import re

filepath = r'C:\Users\hi\Desktop\code\han\tam\Phan_005.md'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_next_boi = False
in_example = False

for line in lines:
    original = line.rstrip('\n')
    
    # Remove **bold** markers from Korean lines
    if original.startswith('+ Hàn:'):
        in_example = True
        original = re.sub(r'\*\*([^*]+)\*\*', r'\1', original)
        new_lines.append(original)
        skip_next_boi = False
        continue
    
    # First Bồi line (lowercase, raw) - keep
    if original.startswith('+ Bồi:') and not skip_next_boi:
        # Remove **bold** markers
        original = re.sub(r'\*\*([^*]+)\*\*', r'\1', original)
        new_lines.append(original)
        skip_next_boi = True  # Skip the second Bồi line
        continue
    
    # Second Bồi line (uppercase, formatted) - skip
    if original.startswith('   + Bồi:') and skip_next_boi:
        skip_next_boi = False
        continue
    
    # Reset skip flag if we see a Việt line
    if original.startswith('   + Việt:'):
        skip_next_boi = False
        in_example = False
    
    # Remove --- separators
    if original.strip() == '---':
        continue
    
    new_lines.append(original)

# Write back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines) + '\n')

print(f'✅ Cleaned: {filepath}')

# Verify
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Check for issues
issues = []
if '---' in content:
    issues.append('  ⚠️ Còn dấu ---')
if '**' in content:
    issues.append('  ⚠️ Còn dấu **')
if '   + Bồi:' in content:
    issues.append('  ⚠️ Còn dòng Bồi thứ 2')

if issues:
    for i in issues:
        print(i)
else:
    print('  ✅ Không có lỗi format')

# Count words again
import sys
sys.path.insert(0, r'C:\Users\hi\Desktop\code\han\tam')
from upload_from_md import parse_md_file
entries = parse_md_file(filepath)
print(f'  ✅ Số từ: {len(entries)}')
