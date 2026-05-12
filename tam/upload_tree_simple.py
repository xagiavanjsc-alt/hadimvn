"""
Upload hanja_tree_nodes - SIMPLE VERSION
Khong dung AI, dung heuristic cho root_char
Upsert (bo qua duplicate), batch 100 tu
"""
import pandas as pd
import requests
import time

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"
INPUT_FILE  = "fix/hanja_tat_ca.csv"
BATCH_SIZE  = 100

def get_headers(upsert=False):
    h = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    if upsert:
        h["Prefer"] = "resolution=ignore-duplicates,return=minimal"
    else:
        h["Prefer"] = "return=minimal"
    return h

def get_existing_korean():
    print("Kiem tra tu da co...", flush=True)
    existing = set()
    offset, limit = 0, 1000
    while True:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?select=korean&limit={limit}&offset={offset}",
            headers=get_headers(), timeout=30
        )
        data = r.json()
        if not data or not isinstance(data, list):
            break
        for row in data:
            existing.add(row["korean"])
        if len(data) < limit:
            break
        offset += limit
    print(f"  Da co {len(existing)} tu", flush=True)
    return existing

def build_record(hangul, hanja, meaning_vn):
    hanja_str = str(hanja) if hanja and str(hanja) != "nan" else ""
    root_char = hanja_str[0] if hanja_str else hangul[0] if hangul else "?"
    return {
        "korean":        hangul,
        "hanja":         hanja_str,
        "vietnamese":    str(meaning_vn) if meaning_vn and str(meaning_vn) != "nan" else "",
        "root_char":     root_char,
        "root_meaning":  "",
        "pronunciation": "",
        "difficulty":    2,
        "meaning_detail": "",
        "memory_tip":    "",
        "examples":      [],
        "related_words": [],
        "hanja_chars":   list(hanja_str) if hanja_str else [],
        "level":         1,
        "category":      "",
    }

def insert_batch(records, batch_num):
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes",
        headers=get_headers(upsert=True),
        json=records,
        timeout=30
    )
    if r.status_code in (200, 201):
        return True
    else:
        print(f"  [Batch {batch_num}] FAILED {r.status_code}: {r.text[:200]}", flush=True)
        # Thu insert tung cai mot
        ok = 0
        for rec in records:
            r2 = requests.post(
                f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes",
                headers=get_headers(upsert=True),
                json=[rec],
                timeout=15
            )
            if r2.status_code in (200, 201):
                ok += 1
            else:
                print(f"    Skip {rec['korean']}: {r2.text[:100]}", flush=True)
        print(f"  [Batch {batch_num}] Recovered {ok}/{len(records)}", flush=True)
        return ok > 0

def main():
    print("=== Upload hanja_tree_nodes (SIMPLE) ===", flush=True)

    df = pd.read_csv(INPUT_FILE, encoding="utf-8")
    print(f"Doc duoc {len(df)} tu", flush=True)

    existing = get_existing_korean()
    to_upload = df[~df["Tiếng Hàn"].isin(existing)].reset_index(drop=True)
    print(f"Can upload: {len(to_upload)} tu", flush=True)

    if len(to_upload) == 0:
        print("Tat ca da co trong DB!")
        return

    total = len(to_upload)
    success = 0
    batch = []
    batch_num = 0

    for i, row in to_upload.iterrows():
        rec = build_record(row["Tiếng Hàn"], row["Hán tự"], row["Nghĩa tiếng Việt"])
        batch.append(rec)

        if len(batch) >= BATCH_SIZE:
            batch_num += 1
            if insert_batch(batch, batch_num):
                success += len(batch)
            print(f"  Batch {batch_num}: {success}/{total} done", flush=True)
            batch = []
            time.sleep(0.2)

    if batch:
        batch_num += 1
        if insert_batch(batch, batch_num):
            success += len(batch)

    print(f"\nHOAN THANH! {success}/{total} tu da upload", flush=True)

if __name__ == "__main__":
    main()
