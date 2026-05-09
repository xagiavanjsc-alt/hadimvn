import re
import shutil

def clean_file(src, dst):
    with open(src, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    skip_next_boi = False
    
    for line in lines:
        original = line.rstrip('\n')
        
        # Remove ** from Hàn lines
        if original.startswith('+ Hàn:'):
            original = re.sub(r'\*\*([^*]+)\*\*', r'\1', original)
            new_lines.append(original)
            skip_next_boi = False
            continue
        
        # First Bồi line - keep, remove **
        if original.startswith('+ Bồi:') and not skip_next_boi:
            original = re.sub(r'\*\*([^*]+)\*\*', r'\1', original)
            new_lines.append(original)
            skip_next_boi = True
            continue
        
        # Second Bồi line (indented) - skip
        if original.startswith('   + Bồi:') and skip_next_boi:
            skip_next_boi = False
            continue
        
        # Reset on Việt line
        if original.startswith('   + Việt:'):
            skip_next_boi = False
        
        # Remove --- separators
        if original.strip() == '---':
            continue
        
        # Remove ** from mnemonic (MẸO NHỚ)
        if '**' in original:
            original = original.replace('**', '')
        
        new_lines.append(original)
    
    with open(dst, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines) + '\n')
    
    print(f'Cleaned: {src} -> {dst}')

# Clean all 3 files
files = [
    (r'C:\Users\hi\Desktop\code\han\tam\fix\Phan_004.md', r'C:\Users\hi\Desktop\code\han\tam\Phan_004.md'),
    (r'C:\Users\hi\Desktop\code\han\tam\fix\Phan_005.md', r'C:\Users\hi\Desktop\code\han\tam\Phan_005.md'),
    (r'C:\Users\hi\Desktop\code\han\tam\fix\Phan_006.md', r'C:\Users\hi\Desktop\code\han\tam\Phan_006.md'),
]

for src, dst in files:
    clean_file(src, dst)

print('Done cleaning all files')
