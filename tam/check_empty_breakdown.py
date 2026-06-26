"""Kiem tra tat ca tu co hanja_breakdown meaning rong"""
from supabase_client import fetch_all_data

data = fetch_all_data('hanja_pro', select_fields='id,hangul,slug,hanja_breakdown')

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
