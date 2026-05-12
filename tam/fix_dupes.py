"""
Xoa duplicate trong hanja_tree_nodes, giu lai ban co id nho nhat
"""
import requests

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }

def fetch_all():
    all_rows = []
    offset, limit = 0, 1000
    while True:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?select=id,korean&limit={limit}&offset={offset}&order=id.asc",
            headers=get_headers(), timeout=30
        )
        data = r.json()
        if not data or not isinstance(data, list):
            break
        all_rows.extend(data)
        if len(data) < limit:
            break
        offset += limit
    return all_rows

def main():
    print("Dang lay toan bo du lieu...", flush=True)
    rows = fetch_all()
    print(f"Tong so ban ghi: {len(rows)}", flush=True)

    # Tim duplicate: giu id nho nhat, xoa cac id con lai
    seen = {}  # korean -> min_id
    dupes = []  # id can xoa

    for row in rows:
        korean = row["korean"]
        rid = row["id"]
        if korean in seen:
            dupes.append(rid)  # xoa cai nay (id lon hon)
        else:
            seen[korean] = rid

    print(f"So tu duy nhat: {len(seen)}", flush=True)
    print(f"So duplicate can xoa: {len(dupes)}", flush=True)

    if not dupes:
        print("Khong co duplicate!")
        return

    # Xoa tung cai (batch 50)
    deleted = 0
    batch_size = 50
    for i in range(0, len(dupes), batch_size):
        batch = dupes[i:i+batch_size]
        ids_str = ",".join(batch)
        r = requests.delete(
            f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?id=in.({ids_str})",
            headers=get_headers(), timeout=30
        )
        if r.status_code in (200, 204):
            deleted += len(batch)
            print(f"  Xoa {deleted}/{len(dupes)}...", flush=True)
        else:
            print(f"  Loi xoa: {r.status_code} {r.text[:100]}", flush=True)

    print(f"\nHOAN THANH! Da xoa {deleted} duplicate. Con lai: {len(seen)} tu", flush=True)

if __name__ == "__main__":
    main()
