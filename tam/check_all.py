"""Kiem tra meaning_vn va trung lap slug"""
import requests, json

headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE'
}

all_data = []
offset = 0
limit = 1000
while True:
    r = requests.get(f'https://dcjofhkdrgbrowabudyt.supabase.co/rest/v1/hanja_pro?select=id,slug,meaning_vn,hangul&order=id&limit={limit}&offset={offset}', headers=headers)
    batch = r.json()
    if not batch:
        break
    all_data.extend(batch)
    if len(batch) < limit:
        break
    offset += limit
data = all_data

# 1. Tim cac tu thieu meaning_vn
empty = [d for d in data if not d.get('meaning_vn')]
print(f"=== TONG: {len(data)} tu ===")
print(f"\n--- THIEU meaning_vn: {len(empty)} tu ---")
for d in empty:
    print(f"  ID {d['id']}: {d['hangul']} ({d['slug']})")

# 2. Tim trung lap slug
from collections import Counter
slug_count = Counter(d['slug'] for d in data)
dupes = {k: v for k, v in slug_count.items() if v > 1}
print(f"\n--- TRUNG LAP slug: {len(dupes)} ---")
for slug, count in dupes.items():
    items = [(d['id'], d['hangul']) for d in data if d['slug'] == slug]
    print(f"  '{slug}' x{count}: {items}")

# 3. Tim trung lap hangul
hangul_count = Counter(d['hangul'] for d in data)
hangul_dupes = {k: v for k, v in hangul_count.items() if v > 1}
print(f"\n--- TRUNG LAP hangul: {len(hangul_dupes)} ---")
for h, count in hangul_dupes.items():
    items = [(d['id'], d['slug']) for d in data if d['hangul'] == h]
    print(f"  '{h}' x{count}: {items}")
