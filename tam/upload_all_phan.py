#!/usr/bin/env python3
import sys
sys.path.insert(0, r'C:\Users\hi\Desktop\code\han\tam')
from upload_from_md import parse_md_file, extract_slug, extract_meaning_vn, extract_examples, extract_related, extract_mnemonic, extract_breakdown, upload_to_supabase

FILES = [
    (r'C:\Users\hi\Desktop\code\han\tam\Phan_001.md', 100),
    (r'C:\Users\hi\Desktop\code\han\tam\Phan_002.md', 121),
    (r'C:\Users\hi\Desktop\code\han\tam\Phan_003.md', 142),
]

total = 0
success = 0
for filepath, start_id in FILES:
    entries = parse_md_file(filepath)
    print(f"\n📄 {filepath}: {len(entries)} từ (ID {start_id}-{start_id + len(entries) - 1})")
    for idx, entry in enumerate(entries):
        id = start_id + idx
        raw = entry['raw']
        data = {
            'id': id,
            'hangul': entry['hangul'],
            'hanja': entry['hanja'],
            'slug': extract_slug(raw) or entry['hangul'],
            'meaning_vn': extract_meaning_vn(raw),
            'hanja_breakdown': extract_breakdown(raw),
            'examples': extract_examples(raw),
            'related_words': extract_related(raw),
            'mnemonic': extract_mnemonic(raw),
            'raw': raw
        }
        if upload_to_supabase(data):
            success += 1
            print(f"  ✅ {entry['hangul']} ({id})")
        else:
            print(f"  ❌ {entry['hangul']}")
        total += 1

print(f"\n🎉 Hoàn thành! Đã upload {success}/{total} từ")
