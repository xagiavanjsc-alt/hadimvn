"""Kiem tra tat ca tu co hanja_breakdown meaning rong"""
import requests, json

headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE'
}

all_data = []
offset = 0
limit = 1000
while True:
    r = requests.get(f'https://dcjofhkdrgbrowabudyt.supabase.co/rest/v1/hanja_pro?select=id,hangul,slug,hanja_breakdown&order=id&limit={limit}&offset={offset}', headers=headers)
    batch = r.json()
    if not batch:
        break
    all_data.extend(batch)
    if len(batch) < limit:
        break
    offset += limit
data = all_data

print(f"=== TONG: {len(data)} tu ===\n")
empty_count = 0
for d in data:
    bd = d.get('hanja_breakdown', [])
    empty_chars = [item for item in bd if not item.get('meaning')]
    if empty_chars:
        empty_count += 1
        chars_str = ', '.join([f"{item['char']}=?" for item in empty_chars])
        print(f"  ID {d['id']}: {d['hangul']} ({d['slug']}) - thieu: {chars_str}")

print(f"\n--- KET QUA: {empty_count} tu co breakdown rong ---")
