import sys
sys.path.insert(0, r'C:\Users\hi\Desktop\code\han\tam')
from upload_from_md import parse_md_file, extract_related

entries = parse_md_file(r'C:\Users\hi\Desktop\code\han\tam\Phan_006.md')
print('Total entries:', len(entries))

for i, entry in enumerate(entries):
    related = extract_related(entry['raw'])
    if len(related) != 4:
        print(f'Entry {i+1} {entry["hangul"]}: ONLY {len(related)} related words!')
        for r in related:
            print(f'   - {r["word"]} ({r["hanja"]}): {r["meaning"][:40]}')

print('Done')
