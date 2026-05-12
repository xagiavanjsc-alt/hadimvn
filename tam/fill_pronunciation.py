"""
Sinh phien am cho cac tu chua co pronunciation trong hanja_tree_nodes
AI xu ly 10 tu / 1 request -> nhanh ~15 phut cho 2600 tu
"""
import requests
import openai
import json
import re
import time
from itertools import cycle

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

API_KEYS = [
    "fw_38Pdt3WR3ecpwcGPMcujsr",
]
BATCH_AI   = 15   # So tu / 1 AI call
BATCH_DB   = 100  # So tu / 1 Supabase update
TIMEOUT    = 60

key_cycle = cycle(API_KEYS)

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }

def fetch_missing(offset=0, limit=1000):
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes"
        f"?select=id,korean&pronunciation=eq.&limit={limit}&offset={offset}&order=id.asc",
        headers=get_headers(), timeout=30
    )
    return r.json() if r.status_code == 200 else []

def fetch_all_missing():
    all_rows = []
    offset = 0
    while True:
        batch = fetch_missing(offset, 1000)
        if not batch or not isinstance(batch, list):
            break
        all_rows.extend(batch)
        if len(batch) < 1000:
            break
        offset += 1000
    return all_rows

def ai_batch_pronunciation(words):
    """words: list of (id, korean) - tra ve dict {id: pronunciation}"""
    lines = "\n".join(f"{i+1}. {w[1]}" for i, w in enumerate(words))
    prompt = f"""Cho cac tu tieng Han-Quoc sau, tra ve phien am La-tinh theo chuan Revised Romanization (RR).
Format: so thu tu. phien am (dung dau "-" ngan each am tiet)

{lines}

Chi tra ve danh sach phien am, moi dong 1 tu. Vi du:
1. in-gan
2. hak-gyo
3. ga-jok"""

    key = next(key_cycle)
    client = openai.OpenAI(
        base_url="https://api.fireworks.ai/inference/v1",
        api_key=key, timeout=TIMEOUT
    )
    for attempt in range(3):
        try:
            resp = client.chat.completions.create(
                model="accounts/fireworks/models/deepseek-v3p2",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1, timeout=TIMEOUT
            )
            text = resp.choices[0].message.content.strip()
            result = {}
            for line in text.split("\n"):
                line = line.strip()
                m = re.match(r"^(\d+)[.\)]\s*(.+)$", line)
                if m:
                    idx = int(m.group(1)) - 1
                    pron = m.group(2).strip()
                    if 0 <= idx < len(words):
                        result[words[idx][0]] = pron
            return result
        except Exception as e:
            print(f"  AI loi lan {attempt+1}: {e}", flush=True)
            time.sleep(3 * (attempt + 1))
            key = next(key_cycle)
            client = openai.OpenAI(
                base_url="https://api.fireworks.ai/inference/v1",
                api_key=key, timeout=TIMEOUT
            )
    return {}

def update_batch(updates):
    """updates: list of (id, pronunciation)"""
    ok = 0
    for uid, pron in updates:
        r = requests.patch(
            f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?id=eq.{uid}",
            headers={**get_headers(), "Prefer": "return=minimal"},
            json={"pronunciation": pron},
            timeout=15
        )
        if r.status_code in (200, 204):
            ok += 1
    return ok

def main():
    print("=== Sinh phien am cho hanja_tree_nodes ===", flush=True)
    rows = fetch_all_missing()
    print(f"So tu chua co phien am: {len(rows)}", flush=True)

    if not rows:
        print("Tat ca tu da co phien am!")
        return

    total = len(rows)
    done = 0
    db_updates = []

    for i in range(0, total, BATCH_AI):
        batch = [(r["id"], r["korean"]) for r in rows[i:i+BATCH_AI]]
        result = ai_batch_pronunciation(batch)
        for uid, pron in result.items():
            db_updates.append((uid, pron))

        done += len(batch)
        print(f"  [{done}/{total}] AI xong, co {len(result)} phien am", flush=True)

        # Update DB khi du batch
        if len(db_updates) >= BATCH_DB:
            ok = update_batch(db_updates)
            print(f"  >>> DB updated {ok}/{len(db_updates)}", flush=True)
            db_updates = []

        time.sleep(0.3)

    # Update phan con lai
    if db_updates:
        ok = update_batch(db_updates)
        print(f"  >>> DB updated {ok}/{len(db_updates)} (cuoi)", flush=True)

    print(f"\nHOAN THANH! Da xu ly {total} tu", flush=True)

if __name__ == "__main__":
    main()
