#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix all 3 Phan files: remove quotes, capitalize first letter of meanings"""
import re
import os

FILES = ['tam/Phan_001.md', 'tam/Phan_002.md', 'tam/Phan_003.md']

def fix_line(line):
    # Match related word lines: - word (hanja): "meaning"... or - word (hanja): meaning...
    m = re.match(r'(\s+-\s+\S+\s+\([^)]+\)\s*:\s*)"([^"]+)"(.*)', line)
    if not m:
        # Try without quotes
        m = re.match(r'(\s+-\s+\S+\s+\([^)]+\)\s*:\s*)(.+)', line)
        if m:
            prefix = m.group(1)
            meaning = m.group(2).strip()
            if meaning and meaning[0].islower():
                meaning = meaning[0].upper() + meaning[1:]
            return prefix + meaning + '\n'
        return line
    
    prefix = m.group(1)
    meaning = m.group(2).strip()
    suffix = m.group(3)
    
    # Capitalize first letter of meaning
    if meaning and meaning[0].islower():
        meaning = meaning[0].upper() + meaning[1:]
    
    return prefix + meaning + suffix + '\n'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    in_related_section = False
    
    for line in lines:
        # Detect start of related words section
        if re.match(r'3\.\s*\d+\s*TỪ LIÊN QUAN', line):
            in_related_section = True
            new_lines.append(line)
            continue
        
        # Detect end of related section (start of section 4)
        if re.match(r'4\.\s*M[EẸ]O', line):
            in_related_section = False
            new_lines.append(line)
            continue
        
        if in_related_section and line.strip().startswith('-'):
            new_lines.append(fix_line(line))
        else:
            new_lines.append(line)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print(f'Fixed: {filepath}')

if __name__ == '__main__':
    for f in FILES:
        process_file(f)
    print('Done!')
