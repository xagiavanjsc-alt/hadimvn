"""
Bo sung examples + root_meaning + memory_tip cho hanja_tree_nodes
Batch 5 tu / 1 AI call -> chat luong cao, toc do on
"""
import requests
import openai
import json
import re
import time
from itertools import cycle

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"
API_KEYS = ["fw_MsmG1Cr6pkjgzyC9z5AMQv"]
BATCH_AI  = 10
TIMEOUT   = 90

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
        f"?select=id,korean,hanja,vietnamese,root_char,pronunciation"
        f"&or=(root_meaning.is.null,root_meaning.eq.,memory_tip.is.null,memory_tip.eq.)"
        f"&limit={limit}&offset={offset}&order=id.asc",
        headers=get_headers(), timeout=30
    )
    data = r.json()
    return data if isinstance(data, list) else []

def fetch_all_missing():
    all_rows = []
    offset = 0
    while True:
        batch = fetch_missing(offset, 1000)
        if not batch:
            break
        all_rows.extend(batch)
        if len(batch) < 1000:
            break
        offset += 1000
    return all_rows

def ai_enrich_batch(words):
    """words: list of dict {id, korean, hanja, vietnamese, root_char, pronunciation}"""
    items = []
    for i, w in enumerate(words):
        items.append(f"{i+1}. {w['korean']} ({w['hanja']}) = {w['vietnamese']} | goc: {w['root_char']} | phat am: {w.get('pronunciation','')}")

    prompt = f"""Lam phong phu du lieu hoc tu Han-Quoc. Voi moi tu, tra ve JSON array:

{chr(10).join(items)}

Tra ve JSON array voi {len(words)} phan tu, moi phan tu:
{{
  "root_meaning": "Nghia chu Han goc bang tieng Viet (1-3 tu, VD: Nguoi, Nuoc, Hoc)",
  "examples": [
    {{"korean": "cau vi du tieng Han", "vietnamese": "nghia tieng Viet", "pronunciation": "phien am"}}
  ],
  "memory_tip": "Meo nho bang tieng Viet, ngan gon, sang tao, lien quan den hinh anh chu Han (1-2 cau)"
}}

Quy tac:
- root_meaning: 1-3 tu tieng Viet ngan gon
- examples: 1 cau vi du thuc te, don gian (TOPIK 2-4)
- memory_tip: goi y nho bang hinh anh chu Han hoac am doc
- Chi tra JSON array, khong giai thich them"""

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
                temperature=0.3, timeout=TIMEOUT
            )
            text = resp.choices[0].message.content.strip()
            match = re.search(r'\[.*\]', text, re.DOTALL)
            if match:
                result = json.loads(match.group())
                if isinstance(result, list) and len(result) >= len(words):
                    return result[:len(words)]
        except Exception as e:
            print(f"  AI loi lan {attempt+1}: {str(e)[:80]}", flush=True)
            time.sleep(4 * (attempt + 1))
    return []

def update_word(uid, root_meaning, examples, memory_tip):
    payload = {}
    if root_meaning:
        payload["root_meaning"] = root_meaning
    if examples:
        payload["examples"] = examples
    if memory_tip:
        payload["memory_tip"] = memory_tip
    if not payload:
        return True
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?id=eq.{uid}",
        headers={**get_headers(), "Prefer": "return=minimal"},
        json=payload, timeout=15
    )
    return r.status_code in (200, 204)

def main():
    print("=== Bo sung examples + root_meaning + memory_tip ===", flush=True)
    rows = fetch_all_missing()
    print(f"So tu can bo sung: {len(rows)}", flush=True)

    if not rows:
        print("Tat ca tu da day du du lieu!")
        return

    total = len(rows)
    done = 0
    ok_count = 0

    for i in range(0, total, BATCH_AI):
        batch = rows[i:i+BATCH_AI]
        results = ai_enrich_batch(batch)

        for j, res in enumerate(results):
            if j >= len(batch):
                break
            uid = batch[j]["id"]
            korean = batch[j]["korean"]
            root_meaning = res.get("root_meaning", "")
            examples = res.get("examples", [])
            memory_tip = res.get("memory_tip", "")
            if update_word(uid, root_meaning, examples, memory_tip):
                ok_count += 1

        done += len(batch)
        print(f"  [{done}/{total}] OK={ok_count} | {batch[0]['korean']}...{batch[-1]['korean']}", flush=True)
        time.sleep(0.5)

    print(f"\nHOAN THANH! {ok_count}/{total} tu da duoc bo sung", flush=True)

if __name__ == "__main__":
    main()
