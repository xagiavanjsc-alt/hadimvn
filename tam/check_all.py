"""Kiem tra meaning_vn va trung lap slug"""
from supabase_client import fetch_all_data, find_duplicates, check_missing_fields

data = fetch_all_data('hanja_pro', select_fields='id,slug,meaning_vn,hangul')

# 1. Tim cac tu thieu meaning_vn
empty = [d for d in data if not d.get('meaning_vn')]
print(f"=== TONG: {len(data)} tu ===")
print(f"\n--- THIEU meaning_vn: {len(empty)} tu ---")
for d in empty:
    print(f"  ID {d['id']}: {d['hangul']} ({d['slug']})")

# 2. Tim trung lap slug
slug_dupes = find_duplicates(data, 'slug')
print(f"\n--- TRUNG LAP slug: {len(slug_dupes)} ---")
for slug, count in slug_dupes.items():
    items = [(d['id'], d['hangul']) for d in data if d['slug'] == slug]
    print(f"  '{slug}' x{count}: {items}")

# 3. Tim trung lap hangul
hangul_dupes = find_duplicates(data, 'hangul')
print(f"\n--- TRUNG LAP hangul: {len(hangul_dupes)} ---")
for h, count in hangul_dupes.items():
    items = [(d['id'], d['slug']) for d in data if d['hangul'] == h]
    print(f"  '{h}' x{count}: {items}")
