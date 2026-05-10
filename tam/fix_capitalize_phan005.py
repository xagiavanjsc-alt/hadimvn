"""Fix vietnamese capitalization in Phan_005.md - chi viet hoa chu cai dau cau"""
import re

def fix_vietnamese_text(text):
    """Only first letter uppercase, rest lowercase"""
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

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    for line in lines:
        line = line.rstrip('\n')
        
        # Fix lines with Vietnamese content after prefix
        # Patterns: "1. GIẢI NGHĨA: ...", "    + Việt: ...", "4. MẸO NHỚ: ..."
        m = re.match(r'^(\s*\d+\.\s*[A-ZẢẠẤẦẨẪẬẮẰẲẴẶĐ]+\s*:\s*|\s+\+\s*Vi[eệ]t:\s*|\s+-\s+[가-힣]+\s*\([^)]+\)\s*:\s*)(.+)$', line)
        if m:
            prefix = m.group(1)
            text = m.group(2)
            new_lines.append(prefix + fix_vietnamese_text(text))
        else:
            new_lines.append(line)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines) + '\n')
    print(f"Fixed: {filepath}")

if __name__ == "__main__":
    fix_file('tam/Phan_005.md')
