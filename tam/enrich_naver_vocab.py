"""
enrich_naver_vocab.py
Đọc các row naver_qa có vocabulary=[] từ Supabase,
gọi Fireworks AI để extract vocabulary + grammar từ answer_vn,
rồi UPDATE lại Supabase.

Dùng:
  set PYTHONUTF8=1
  python -X utf8 enrich_naver_vocab.py
"""

import json, re, time, requests, openai
from itertools import cycle

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

API_KEYS = [
    "fw_JrLZrwC8w7UhA91X5zmU4x",  # ← thay/thêm key tại đây
]

BATCH_SIZE = 5
TIMEOUT    = 90
MODEL      = "accounts/fireworks/models/llama-v3p3-70b-instruct"

key_cycle = cycle(API_KEYS)

HEADERS = {
    "apikey":        SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type":  "application/json",
}

# ─── Fetch rows cần enrich ────────────────────────────────────────────────────
def fetch_missing(offset=0, limit=100):
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/naver_qa"
        f"?select=id,answer_vn,answer_kr,question_vn,question_kr"
        f"&limit={limit}&offset={offset}&order=id.asc",
        headers=HEADERS, timeout=30
    )
    data = r.json()
    return data if isinstance(data, list) else []

# ─── AI extract vocab + grammar ──────────────────────────────────────────────
def ai_extract_batch(items: list) -> list:
    lines = []
    for i, row in enumerate(items):
        lines.append(f"[{i}] KR: {row.get('answer_kr','')[:400]} | VN: {row.get('answer_vn','')[:300]}")

    prompt = f"""Trich xuat tu vung va ngu phap tu {len(items)} cap cau tra loi (tieng Han + tieng Viet):

{chr(10).join(lines)}

Tra ve JSON array {len(items)} phan tu, moi phan tu:
{{"vocabulary":[{{"korean":"tu Han","vn":"nghia tieng Viet","level":"1"}}],"grammar":[{{"pattern":"-mau ngu phap","meaning":"nghia tieng Viet","example":"cau vi du tieng Han = nghia tieng Viet","level":"1"}}]}}

- vocabulary: 2-3 tu tieng Han kho, level TOPIK "1" hoac "2"
- grammar: 0-2 mau ngu phap THUC SU co trong cau tra loi tieng Han, kem cau vi du thuc te
- example: lay tu cau tra loi goc hoac tao cau ngan, format: "cau Han = nghia Viet"
- De grammar=[] neu khong co mau ngu phap ro rang
- Chi tra JSON, khong giai thich"""

    for attempt in range(len(API_KEYS) * 2):
        key = next(key_cycle)
        try:
            client = openai.OpenAI(
                api_key=key,
                base_url="https://api.fireworks.ai/inference/v1"
            )
            resp = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=2000,
                timeout=TIMEOUT
            )
            text = resp.choices[0].message.content.strip()
            raw  = re.sub(r'```(?:json)?', '', text).strip('`').strip()
            match = re.search(r'\[.*\]', raw, re.DOTALL)
            if match:
                result = json.loads(match.group())
                if isinstance(result, list) and len(result) >= len(items):
                    return result[:len(items)]
            # fallback: parse objects
            parsed, depth, start = [], 0, -1
            for ci, ch in enumerate(raw):
                if ch == '{' and depth == 0:   start = ci; depth = 1
                elif ch == '{':                depth += 1
                elif ch == '}' and depth == 1:
                    depth = 0
                    try: parsed.append(json.loads(raw[start:ci+1]))
                    except: pass
                elif ch == '}':                depth -= 1
            if len(parsed) >= len(items):
                return parsed[:len(items)]
            print(f"  parse fail: {raw[:150]}", flush=True)
        except Exception as e:
            print(f"  key error: {str(e)[:80]}", flush=True)
            time.sleep(3)
    return []

# ─── Update Supabase ──────────────────────────────────────────────────────────
def update_row(row_id: int, vocabulary: list, grammar: list) -> bool:
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/naver_qa?id=eq.{row_id}",
        headers={**HEADERS, "Prefer": "return=minimal"},
        json={"vocabulary": vocabulary, "grammar": grammar},
        timeout=15
    )
    return r.status_code in (200, 204)

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    offset = 0
    total_done = 0

    while True:
        rows = fetch_missing(offset=offset, limit=100)
        if not rows:
            print(f"\nXong! Tong {total_done} rows da duoc enrich.", flush=True)
            break

        print(f"\nBatch offset={offset}: {len(rows)} rows can enrich", flush=True)

        for i in range(0, len(rows), BATCH_SIZE):
            batch = rows[i:i+BATCH_SIZE]
            print(f"  [{total_done+i+1}-{total_done+i+len(batch)}] AI extracting...", flush=True)

            results = ai_extract_batch(batch)
            if not results:
                print("  AI fail, skip batch", flush=True)
                time.sleep(5)
                continue

            for j, res in enumerate(results):
                if j >= len(batch): break
                row = batch[j]
                vocab   = res.get("vocabulary", [])
                grammar = res.get("grammar", [])
                ok = update_row(row["id"], vocab, grammar)
                status = "OK" if ok else "FAIL"
                print(f"    id={row['id']} vocab={len(vocab)} grammar={len(grammar)} [{status}]", flush=True)

            time.sleep(1)

        total_done += len(rows)
        offset += len(rows)

if __name__ == "__main__":
    main()
