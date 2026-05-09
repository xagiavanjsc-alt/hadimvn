import sys
sys.path.insert(0, r'C:\Users\hi\Desktop\code\han\tam')
from upload_from_md import parse_md_file, extract_related, extract_examples

files = [
    (r'C:\Users\hi\Desktop\code\han\tam\Phan_004.md', 'Phan_004'),
]

for f, name in files:
    entries = parse_md_file(f)
    issues = []
    for i, entry in enumerate(entries):
        rel = extract_related(entry['raw'])
        ex = extract_examples(entry['raw'])
        if len(rel) != 4:
            issues.append(f'  Entry {i+1} {entry["hangul"]}: {len(rel)} related (expected 4)')
        if len(ex) != 6:
            issues.append(f'  Entry {i+1} {entry["hangul"]}: {len(ex)} examples (expected 6)')
    
    print(f'{name}: {len(entries)} tu, {len(issues)} loi')
    for issue in issues[:10]:
        print(issue)
    if len(issues) > 10:
        print(f'  ... va {len(issues)-10} loi khac')
