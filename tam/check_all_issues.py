import sys
sys.path.insert(0, r'C:\Users\hi\Desktop\code\han\tam')
from upload_from_md import parse_md_file, extract_related, extract_examples

files = [
    (r'C:\Users\hi\Desktop\code\han\tam\Phan_004.md', 'Phan_004'),
    (r'C:\Users\hi\Desktop\code\han\tam\Phan_005.md', 'Phan_005'),
    (r'C:\Users\hi\Desktop\code\han\tam\Phan_006.md', 'Phan_006'),
]

for f, name in files:
    entries = parse_md_file(f)
    print(f'\n=== {name}: {len(entries)} tu ===')
    
    for i, entry in enumerate(entries):
        rel = extract_related(entry['raw'])
        ex = extract_examples(entry['raw'])
        issues = []
        if len(rel) < 4:
            issues.append(f'tu lien quan: {len(rel)}/4')
        if len(ex) < 6:
            issues.append(f'vi du: {len(ex)}/6')
        
        if issues:
            print(f'\n  Entry {i+1} - {entry["hangul"]} ({entry["hanja"]}):')
            for issue in issues:
                print(f'    - {issue}')
            if len(rel) > 0:
                print(f'    Hien co {len(rel)} tu lien quan:')
                for r in rel:
                    print(f'      - {r["word"]} ({r["hanja"]}): {r["meaning"][:50]}')
