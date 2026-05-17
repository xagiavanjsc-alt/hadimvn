"""
fill_tree_complete.py
Bo sung day du: examples, memory_tip, related_words, meaning_detail
cho cac tu trong hanja_tree_nodes con thieu
Batch 8 tu / 1 AI call | resume-safe (chi lay tu thieu)
"""
import requests, openai, json, re, time
from itertools import cycle

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

API_KEYS = [
    "fw_TGsAPiEnXTbKZAgW8BeHkQ",
]
BATCH_AI = 4
TIMEOUT  = 90

key_cycle = cycle(API_KEYS)

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }

# ─── Fetch tu con thieu related_words HOAC meaning_detail ───────────────────
def fetch_missing(offset=0, limit=500):
    # Filter: related_words = '[]' (empty JSONB array)
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes"
        f"?select=id,korean,hanja,vietnamese,root_char,pronunciation,hanja_chars,memory_tip,related_words,meaning_detail,examples"
        f"&related_words=eq.[]"
        f"&limit={limit}&offset={offset}&order=id.asc",
        headers=get_headers(), timeout=30
    )
    data = r.json()
    return data if isinstance(data, list) else []

def fetch_all_missing():
    all_rows = []
    offset = 0
    while True:
        batch = fetch_missing(offset)
        if not batch:
            break
        all_rows.extend(batch)
        if len(batch) < 500:
            break
        offset += 500
    return all_rows

# ─── AI sinh noi dung ─────────────────────────────────────────────────────────
def ai_enrich_batch(words):
    items = []
    for i, w in enumerate(words):
        hchars = ", ".join(w.get("hanja_chars") or []) or w.get("hanja", "")
        items.append(
            f"{i+1}. {w['korean']} ({w['hanja']}) = {w['vietnamese']}"
            f" | goc: {w['root_char']} | phat am: {w.get('pronunciation','')}"
            f" | chu Han: {hchars}"
        )

    system = """Tra ve JSON array thuan tuy. KHONG giai thich. KHONG them text. Chi JSON."""

    prompt = f"""Bo sung thong tin tieng Viet cho {len(words)} tu tieng Han sau:

{chr(10).join(items)}

Tra ve JSON array [{len(words)} phan tu], moi phan tu:
{{"examples":[{{"korean":"...","vietnamese":"...","pronunciation":"..."}}],"memory_tip":"...","related_words":[{{"word":"...","meaning":"..."}}],"meaning_detail":"..."}}

- examples: 2 cau TOPIK 2-3
- memory_tip: 1 cau meo nho
- related_words: 2 tu cung goc
- meaning_detail: phan tich am Han-Viet + nghia tung chu Han"""

    for attempt in range(len(API_KEYS)):
        key = next(key_cycle)
        client = openai.OpenAI(
            base_url="https://api.fireworks.ai/inference/v1",
            api_key=key, timeout=TIMEOUT
        )
        try:
            resp = client.chat.completions.create(
                model="accounts/fireworks/models/deepseek-v3p2",
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user",   "content": prompt}
                ],
                temperature=0.3,
                max_tokens=3000,
                timeout=TIMEOUT
            )
            text = resp.choices[0].message.content.strip()
            # Strip code block if present
            raw = re.sub(r'```(?:json)?', '', text).strip('`').strip()
            # Try full JSON array
            match = re.search(r'\[.*\]', raw, re.DOTALL)
            if match:
                try:
                    result = json.loads(match.group())
                    if isinstance(result, list) and len(result) >= len(words):
                        return result[:len(words)]
                except json.JSONDecodeError:
                    pass
            # Fallback: depth-tracking to extract top-level objects
            parsed = []
            depth = 0
            start = -1
            for ci, ch in enumerate(raw):
                if ch == '{' and depth == 0:
                    start = ci
                    depth = 1
                elif ch == '{' and depth > 0:
                    depth += 1
                elif ch == '}' and depth == 1:
                    depth = 0
                    try:
                        parsed.append(json.loads(raw[start:ci+1]))
                    except Exception:
                        pass
                elif ch == '}' and depth > 1:
                    depth -= 1
            if len(parsed) >= len(words):
                return parsed[:len(words)]
            print(f"  [debug] parse fail, raw[:200]: {raw[:200]}", flush=True)
        except Exception as e:
            err = str(e)[:120]
            suspended = "suspended" in err or "412" in err
            print(f"  Key {attempt+1}/{len(API_KEYS)} {'[suspended]' if suspended else '[error]'}: {err[:80]}", flush=True)
            if not suspended:
                time.sleep(3)
    return []

# ─── Update Supabase ──────────────────────────────────────────────────────────
def update_word(uid, data: dict):
    payload = {k: v for k, v in data.items() if v}
    if not payload:
        return True
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?id=eq.{uid}",
        headers={**get_headers(), "Prefer": "return=minimal"},
        json=payload, timeout=15
    )
    return r.status_code in (200, 204)

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    print("=== fill_tree_complete: Bo sung examples + memory_tip + related_words + meaning_detail ===", flush=True)
    rows = fetch_all_missing()
    print(f"So tu can bo sung: {len(rows)}", flush=True)

    if not rows:
        print("✅ Tat ca tu da day du du lieu!")
        return

    total = len(rows)
    done = 0
    ok_count = 0
    fail_count = 0

    for i in range(0, total, BATCH_AI):
        batch = rows[i:i+BATCH_AI]
        results = ai_enrich_batch(batch)

        if not results:
            fail_count += len(batch)
            done += len(batch)
            print(f"  [{done}/{total}] ⚠️  AI tra ve rong cho batch nay", flush=True)
            continue

        for j, res in enumerate(results):
            if j >= len(batch):
                break
            uid  = batch[j]["id"]
            word = batch[j]
            patch = {}
            if not word.get("related_words"):  patch["related_words"]  = res.get("related_words", [])
            if not word.get("meaning_detail"): patch["meaning_detail"] = res.get("meaning_detail", "")
            if not word.get("examples"):       patch["examples"]       = res.get("examples", [])
            if not word.get("memory_tip"):     patch["memory_tip"]     = res.get("memory_tip", "")
            ok = update_word(uid, patch)
            if ok:
                ok_count += 1
            else:
                fail_count += 1

        done += len(batch)
        pct = round(done / total * 100)
        print(f"  [{done}/{total} {pct}%] ✅={ok_count} ❌={fail_count} | {batch[0]['korean']}...", flush=True)
        time.sleep(0.3)

    print(f"\n✅ HOAN THANH! {ok_count}/{total} tu da duoc bo sung. That bai: {fail_count}", flush=True)

if __name__ == "__main__":
    main()
