#!/usr/bin/env python3
import re

for fname in ['tam/Phan_001.md', 'tam/Phan_002.md', 'tam/Phan_003.md']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    
    def fix_meaning(m):
        meaning = m.group(1)
        if meaning and meaning[0].islower():
            meaning = meaning[0].upper() + meaning[1:]
        return f': "{meaning}"'
    
    new = re.sub(r': "([^"]+)"', fix_meaning, content)
    
    with open(fname, 'w', encoding='utf-8') as f:
        f.write(new)
    print(f'Fixed: {fname}')
