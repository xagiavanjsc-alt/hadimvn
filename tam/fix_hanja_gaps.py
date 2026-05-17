"""
fix_hanja_gaps.py
Fix missing fields in hanja_tree_nodes:
1. hanja_chars: split hanja string into individual CJK chars (no AI needed)
2. pronunciation: AI romanize Korean
3. category + level: AI classify
4. related_words: normalize to [{word, meaning}] format
Resume-safe: only fetches rows with gaps.
"""
import requests, openai, json, re, time, unicodedata
from itertools import cycle

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

API_KEYS = ["fw_TGsAPiEnXTbKZAgW8BeHkQ"]
BATCH_AI = 8
TIMEOUT = 90

key_cycle = cycle(API_KEYS)

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }

def is_cjk(ch):
    """Check if character is a CJK ideograph."""
    cp = ord(ch)
    return (0x4E00 <= cp <= 0x9FFF) or (0x3400 <= cp <= 0x4DBF) or (0xF900 <= cp <= 0xFAFF)

def split_hanja_chars(hanja_str):
    """Extract individual CJK characters from hanja string."""
    return [ch for ch in hanja_str if is_cjk(ch)]

# ─── Fetch all nodes ─────────────────────────────────────────────────────────
def fetch_all_nodes():
    all_rows = []
    offset = 0
    while True:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes"
            f"?select=id,korean,hanja,vietnamese,pronunciation,hanja_chars,category,level,related_words"
            f"&limit=1000&offset={offset}&order=id.asc",
            headers=get_headers(), timeout=30
        )
        data = r.json()
        if not isinstance(data, list) or len(data) == 0:
            break
        all_rows.extend(data)
        if len(data) < 1000:
            break
        offset += 1000
    return all_rows

# ─── STEP 1: Fix hanja_chars (pure Python) ──────────────────────────────────
def fix_hanja_chars(rows):
    print("\n=== STEP 1: Fix hanja_chars ===", flush=True)
    needs_fix = [r for r in rows if not r.get("hanja_chars") or len(r["hanja_chars"]) == 0]
    print(f"  {len(needs_fix)} nodes missing hanja_chars", flush=True)

    fixed = 0
    for r in needs_fix:
        chars = split_hanja_chars(r["hanja"])
        if not chars:
            print(f"  ⚠ Cannot split: {r['korean']} ({r['hanja']})", flush=True)
            continue
        resp = requests.patch(
            f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?id=eq.{r['id']}",
            headers={**get_headers(), "Prefer": "return=minimal"},
            json={"hanja_chars": chars}, timeout=15
        )
        if resp.status_code in (200, 204):
            fixed += 1
        else:
            print(f"  ❌ Update fail: {r['korean']} → {resp.status_code}", flush=True)

    print(f"  ✅ Fixed hanja_chars: {fixed}/{len(needs_fix)}", flush=True)
    return fixed

# ─── STEP 2: Fix pronunciation + category + level via AI ────────────────────
def fix_pronunciation_category(rows):
    needs_pron = [r for r in rows if not r.get("pronunciation")]
    needs_cat = [r for r in rows if not r.get("category") or r["category"] == "Khác"]
    needs_level = [r for r in rows if not r.get("level") or r["level"] == 0]

    # Combine: nodes needing any of these fixes
    need_ids = set()
    for r in needs_pron + needs_cat + needs_level:
        need_ids.add(r["id"])
    needs_fix = [r for r in rows if r["id"] in need_ids]

    print(f"\n=== STEP 2: Fix pronunciation + category + level ===", flush=True)
    print(f"  {len(needs_pron)} missing pronunciation", flush=True)
    print(f"  {len(needs_cat)} missing/default category", flush=True)
    print(f"  {len(needs_level)} missing/zero level", flush=True)
    print(f"  {len(needs_fix)} total nodes to process", flush=True)

    if not needs_fix:
        return 0

    fixed = 0
    for i in range(0, len(needs_fix), BATCH_AI):
        batch = needs_fix[i:i+BATCH_AI]
        items = []
        for j, w in enumerate(batch):
            items.append(f"{j+1}. {w['korean']} ({w['hanja']}) = {w['vietnamese']}")

        prompt = f"""Cho {len(batch)} tu Han-Han sau, tra ve JSON array:

{chr(10).join(items)}

Moi phan tu:
{{"pronunciation":"phien am Latin (vd: gong-gae)","category":"phan loai","level":so_cap_do}}

- pronunciation: phien am Latin cua tu tieng Han, dung dau gach noi (vd: hak-saeng, gong-won, in-gan)
- category: CHINH XAC 1 trong cac loai: Giáo dục | Xã hội | Kinh tế | Chính trị | Văn hóa | Khoa học | Y tế | Pháp luật | Tự nhiên | Đời sống | Tâm lý | Lịch sử | Tôn giáo | Giao tiếp | Khác
- level: cap TOPIK tu 1 den 6 (1=co ban, 6=nang cao)

Chi tra JSON array. KHONG giai thich."""

        result = ai_call(prompt)
        if not result or len(result) < len(batch):
            print(f"  ⚠ AI fail for batch {i//BATCH_AI+1}", flush=True)
            continue

        for j, res in enumerate(result):
            if j >= len(batch):
                break
            w = batch[j]
            patch = {}
            if not w.get("pronunciation") and res.get("pronunciation"):
                patch["pronunciation"] = res["pronunciation"]
            if (not w.get("category") or w["category"] == "Khác") and res.get("category"):
                patch["category"] = res["category"]
            if (not w.get("level") or w["level"] == 0) and res.get("level"):
                patch["level"] = int(res["level"]) if isinstance(res["level"], (int, str)) else 2

            if patch:
                resp = requests.patch(
                    f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?id=eq.{w['id']}",
                    headers={**get_headers(), "Prefer": "return=minimal"},
                    json=patch, timeout=15
                )
                if resp.status_code in (200, 204):
                    fixed += 1

        done = min(i + BATCH_AI, len(needs_fix))
        print(f"  [{done}/{len(needs_fix)}] fixed={fixed}", flush=True)
        time.sleep(8)

    print(f"  ✅ Fixed pronunciation/category/level: {fixed}/{len(needs_fix)}", flush=True)
    return fixed

# ─── STEP 3: Normalize related_words format ─────────────────────────────────
def fix_related_words(rows):
    print(f"\n=== STEP 3: Normalize related_words format ===", flush=True)
    needs_fix = []
    for r in rows:
        rw = r.get("related_words") or []
        if not rw:
            continue
        # Check if any item is a plain string instead of {word, meaning}
        has_strings = any(isinstance(w, str) for w in rw)
        if has_strings:
            needs_fix.append(r)

    print(f"  {len(needs_fix)} nodes with string-format related_words", flush=True)

    if not needs_fix:
        return 0

    fixed = 0
    for i in range(0, len(needs_fix), BATCH_AI):
        batch = needs_fix[i:i+BATCH_AI]
        items = []
        for j, w in enumerate(batch):
            rw_str = json.dumps(w["related_words"], ensure_ascii=False)
            items.append(f"{j+1}. {w['korean']} ({w['hanja']}) = {w['vietnamese']} | related: {rw_str}")

        prompt = f"""Chuyen doi related_words sang format chuan cho {len(batch)} tu:

{chr(10).join(items)}

Tra ve JSON array, moi phan tu:
{{"related_words":[{{"word":"tu_han","meaning":"nghia_tieng_viet"}}]}}

- Giu nguyen cac tu da co, chi them nghia tieng Viet
- Moi tu co word (tieng Han) va meaning (tieng Viet)
Chi tra JSON. KHONG giai thich."""

        result = ai_call(prompt)
        if not result or len(result) < len(batch):
            print(f"  ⚠ AI fail for batch {i//BATCH_AI+1}", flush=True)
            continue

        for j, res in enumerate(result):
            if j >= len(batch):
                break
            w = batch[j]
            new_rw = res.get("related_words", [])
            if new_rw and all(isinstance(x, dict) for x in new_rw):
                resp = requests.patch(
                    f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?id=eq.{w['id']}",
                    headers={**get_headers(), "Prefer": "return=minimal"},
                    json={"related_words": new_rw}, timeout=15
                )
                if resp.status_code in (200, 204):
                    fixed += 1

        done = min(i + BATCH_AI, len(needs_fix))
        print(f"  [{done}/{len(needs_fix)}] fixed={fixed}", flush=True)
        time.sleep(8)

    print(f"  ✅ Normalized related_words: {fixed}/{len(needs_fix)}", flush=True)
    return fixed

# ─── AI helper ───────────────────────────────────────────────────────────────
def ai_call(prompt, max_retries=5):
    system = "Tra ve JSON array thuan tuy. KHONG giai thich. KHONG them text. Chi JSON."
    for attempt in range(max_retries):
        key = next(key_cycle)
        client = openai.OpenAI(
            base_url="https://api.fireworks.ai/inference/v1",
            api_key=key, timeout=TIMEOUT
        )
        try:
            resp = client.chat.completions.create(
                model="accounts/fireworks/models/deepseek-v4-pro",
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=4000,
                timeout=TIMEOUT
            )
            text = resp.choices[0].message.content.strip()
            raw = re.sub(r'```(?:json)?', '', text).strip('`').strip()
            match = re.search(r'\[.*\]', raw, re.DOTALL)
            if match:
                try:
                    result = json.loads(match.group())
                    if isinstance(result, list):
                        return result
                except json.JSONDecodeError:
                    pass
            # Fallback: extract objects
            parsed = []
            depth = 0
            start = -1
            for ci, ch in enumerate(raw):
                if ch == '{' and depth == 0:
                    start = ci; depth = 1
                elif ch == '{': depth += 1
                elif ch == '}' and depth == 1:
                    depth = 0
                    try: parsed.append(json.loads(raw[start:ci+1]))
                    except: pass
                elif ch == '}': depth -= 1
            if parsed:
                return parsed
            print(f"  [debug] parse fail: {raw[:150]}", flush=True)
        except Exception as e:
            err = str(e)
            if '429' in err:
                wait = min(15 * (attempt + 1), 90)
                print(f"  ⏳ Rate limit, waiting {wait}s (attempt {attempt+1}/{max_retries})...", flush=True)
                time.sleep(wait)
                continue
            print(f"  AI error: {err[:100]}", flush=True)
            time.sleep(3)
    return []

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    print("=== fix_hanja_gaps: Fix missing fields in hanja_tree_nodes ===\n", flush=True)

    print("Fetching all nodes...", flush=True)
    rows = fetch_all_nodes()
    print(f"Total nodes: {len(rows)}\n", flush=True)

    # Step 1: hanja_chars (no AI, fast)
    f1 = fix_hanja_chars(rows)

    # Step 2: pronunciation + category + level (AI)
    f2 = fix_pronunciation_category(rows)

    # Step 3: normalize related_words (AI)
    f3 = fix_related_words(rows)

    print(f"\n{'='*50}")
    print(f"DONE! hanja_chars={f1} | pron/cat/level={f2} | related_words={f3}")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
