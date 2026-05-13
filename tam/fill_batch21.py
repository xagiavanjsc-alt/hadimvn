"""
Fill/refresh du lieu cho hanja_tree_nodes:
  - Tu THIEU root_meaning -> fill tat ca (root_meaning, meaning_detail, 3 examples, related_words, memory_tip)
  - Tu DA CO root_meaning nhung examples < 3 -> chi lam lai examples (3 moi), giu nguyen phan con lai
Chay lap lai: python fill_batch21.py
"""
import re, json, time, requests, openai

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"
API_KEY      = "fw_XhuWCWaJX6btEdmGmhi4pM"  # <-- THAY KEY MOI O DAY

BATCH_SIZE   = 5   # so tu moi lan chay
MIN_EXAMPLES = 3   # so vi du toi thieu moi tu

def hdrs():
    return {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"}

def fetch_missing_all():
    """Uu tien 1: tu chua co root_meaning (can fill tat ca)"""
    rows = []
    for filt in ["root_meaning=is.null", "root_meaning=eq."]:
        if len(rows) >= BATCH_SIZE: break
        need = BATCH_SIZE - len(rows)
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes"
            f"?select=id,korean,hanja,vietnamese,root_char,pronunciation,root_meaning,examples"
            f"&{filt}&limit={need}&order=id.asc",
            headers=hdrs(), timeout=30)
        data = r.json()
        if isinstance(data, list):
            seen = {x["id"] for x in rows}
            for x in data:
                if x["id"] not in seen:
                    x["_mode"] = "full"
                    rows.append(x)
    return rows

def is_complete(row):
    """True neu tu da co du root_meaning + examples >= MIN_EXAMPLES"""
    has_meaning = bool(row.get("root_meaning"))
    exs = row.get("examples") or []
    has_examples = isinstance(exs, list) and len(exs) >= MIN_EXAMPLES
    return has_meaning and has_examples

def fetch_few_examples(exclude_ids):
    """Uu tien 2: tu da co root_meaning nhung examples < MIN_EXAMPLES (ke ca 1-2 vi du)"""
    need = BATCH_SIZE - len(exclude_ids)
    if need <= 0: return []
    # Lay rong hon (x3) de loc trong Python, vi PostgREST khong filter array length
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes"
        f"?select=id,korean,hanja,vietnamese,root_char,pronunciation,root_meaning,examples"
        f"&root_meaning=not.is.null&root_meaning=not.eq.&limit={need * 5}&order=id.asc",
        headers=hdrs(), timeout=30)
    data = r.json()
    rows = []
    if isinstance(data, list):
        for x in data:
            if x["id"] in exclude_ids: continue
            if is_complete(x): continue  # da du roi, bo qua
            exs = x.get("examples") or []
            if isinstance(exs, list) and len(exs) < MIN_EXAMPLES:
                x["_mode"] = "examples_only"
                rows.append(x)
                if len(rows) >= need: break
    return rows

def fetch_batch():
    """Lay batch tu can xu ly: thieu data truoc, it vi du sau"""
    full_rows = fetch_missing_all()
    seen = {x["id"] for x in full_rows}
    ex_rows = fetch_few_examples(seen)
    combined = full_rows + ex_rows
    return combined[:BATCH_SIZE]

def count_remaining():
    h = {**hdrs(), "Prefer": "count=exact"}
    r1 = requests.get(f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?select=id&root_meaning=is.null&limit=1", headers=h, timeout=15)
    r2 = requests.get(f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?select=id&root_meaning=eq.&limit=1", headers=h, timeout=15)
    r3 = requests.get(f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?select=id&root_meaning=not.is.null&root_meaning=not.eq.&examples=eq.[]&limit=1", headers=h, timeout=15)
    def pc(hdr):
        try: return int(hdr.get("content-range","0/0").split("/")[1])
        except: return 0
    return pc(r1.headers) + pc(r2.headers) + pc(r3.headers)

def _call_ai(prompt):
    client = openai.OpenAI(base_url="https://api.fireworks.ai/inference/v1", api_key=API_KEY, timeout=90)
    for attempt in range(3):
        try:
            resp = client.chat.completions.create(
                model="accounts/fireworks/models/deepseek-v3p2",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3, max_tokens=4096)
            text = resp.choices[0].message.content.strip()
            m = re.search(r'\[.*\]', text, re.DOTALL)
            if m:
                result = json.loads(m.group())
                if isinstance(result, list): return result
            print(f"  Parse that bai, thu lai ({attempt+1}/3)...", flush=True)
        except Exception as e:
            err = str(e)[:80]
            print(f"  AI loi {attempt+1}: {err}", flush=True)
            if "429" in err:
                print("  >>> KEY HET QUOTA! Thay API_KEY moi trong file nay.", flush=True)
                return []
            time.sleep(5 * (attempt + 1))
    return []

def ai_enrich_full(words):
    """Fill toan bo: root_meaning, meaning_detail, 3 examples, related_words, memory_tip"""
    items = [f"{i+1}. {w['korean']} ({w['hanja']}) = {w['vietnamese']} | goc: {w['root_char']}"
             for i, w in enumerate(words)]
    prompt = f"""Ban la giao vien tieng Han chuyen sau. Tra ve JSON array chinh xac {len(words)} phan tu:
{chr(10).join(items)}

Moi phan tu PHAI co:
{{
  "root_meaning": "nghia tung chu Han rieng le, vd: '求 = cau xin, 婚 = hon nhan'",
  "meaning_detail": "giai nghia chi tiet tung chu Han, vd: '求 (cau): bo thu dang xin xo; 婚 (hon): bo nu chi hon nhan'",
  "examples": [
    {{"korean":"vi du 1 co tu nay","vietnamese":"dich","pronunciation":"phien am RR"}},
    {{"korean":"vi du 2 ngon canh khac","vietnamese":"dich","pronunciation":"phien am RR"}},
    {{"korean":"vi du 3 ngon canh khac nua","vietnamese":"dich","pronunciation":"phien am RR"}}
  ],
  "related_words": ["tu lien quan 1","tu 2","tu 3"],
  "memory_tip": "meo nho an tuong (1-2 cau tieng Viet)"
}}
Chi tra JSON array thuan tuy."""
    return _call_ai(prompt)

def ai_enrich_examples_only(words):
    """Chi lam lai 3 vi du moi, khong thay doi fields khac"""
    items = [f"{i+1}. {w['korean']} ({w['hanja']}) = {w['vietnamese']}"
             for i, w in enumerate(words)]
    prompt = f"""Tao 3 cau vi du thuc te cho moi tu Han-Quoc. Tra ve JSON array chinh xac {len(words)} phan tu:
{chr(10).join(items)}

Moi phan tu:
{{
  "examples": [
    {{"korean":"cau vi du 1 tu nhien","vietnamese":"dich nghia","pronunciation":"phien am RR"}},
    {{"korean":"cau vi du 2 ngon canh khac","vietnamese":"dich nghia","pronunciation":"phien am RR"}},
    {{"korean":"cau vi du 3 ngon canh khac nua","vietnamese":"dich nghia","pronunciation":"phien am RR"}}
  ]
}}
Chi tra JSON array thuan tuy."""
    return _call_ai(prompt)

def patch_row(uid, payload):
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?id=eq.{uid}",
        headers={**hdrs(), "Prefer": "return=minimal"},
        json=payload, timeout=15)
    return r.status_code in (200, 204)

def process_batch(batch):
    """Xu ly 1 batch, tu dong chon mode theo _mode flag. Bo qua neu da day du."""    
    # Loc lan cuoi: loai bo tu da hoan chinh (tranh xu ly trung khi chay lai)
    skip = [w for w in batch if is_complete(w)]
    batch = [w for w in batch if not is_complete(w)]
    if skip:
        print(f"  [SKIP] {len(skip)} tu da day du: {', '.join(w['korean'] for w in skip)}", flush=True)
    if not batch:
        print("  Tat ca tu trong lo nay da day du!", flush=True)
        return 0

    full_words  = [w for w in batch if w.get("_mode") == "full"]
    ex_words    = [w for w in batch if w.get("_mode") == "examples_only"]

    results_map = {}  # id -> payload

    # --- Full fill ---
    if full_words:
        print(f"  [FULL] {len(full_words)} tu: {full_words[0]['korean']}...{full_words[-1]['korean']}", flush=True)
        results = ai_enrich_full(full_words)
        for i, res in enumerate(results):
            if i >= len(full_words): break
            uid = full_words[i]["id"]
            p = {}
            if res.get("root_meaning"):   p["root_meaning"]   = res["root_meaning"]
            if res.get("meaning_detail"): p["meaning_detail"] = res["meaning_detail"]
            if res.get("examples"):       p["examples"]       = res["examples"]
            if res.get("related_words"):  p["related_words"]  = res["related_words"]
            if res.get("memory_tip"):     p["memory_tip"]     = res["memory_tip"]
            if p: results_map[uid] = p

    # --- Examples only ---
    if ex_words:
        print(f"  [EX]   {len(ex_words)} tu: {ex_words[0]['korean']}...{ex_words[-1]['korean']}", flush=True)
        results = ai_enrich_examples_only(ex_words)
        for i, res in enumerate(results):
            if i >= len(ex_words): break
            uid = ex_words[i]["id"]
            if res.get("examples"):
                results_map[uid] = {"examples": res["examples"]}

    # --- Patch DB ---
    ok = 0
    for uid, payload in results_map.items():
        if patch_row(uid, payload): ok += 1
    return ok

def main():
    remaining_before = count_remaining()
    print(f"Con lai: {remaining_before} tu (thieu root_meaning hoac examples < {MIN_EXAMPLES})", flush=True)

    if remaining_before == 0:
        print("=== DA HOAN THANH TAT CA ===", flush=True)
        return

    batch = fetch_batch()
    if not batch:
        print("Khong lay duoc tu nao. Co the tat ca da xong.", flush=True)
        return

    print(f"Lo nay: {len(batch)} tu", flush=True)
    ok = process_batch(batch)

    remaining_after = count_remaining()
    print(f"Xong: {ok}/{len(batch)} tu | Con lai: {remaining_after}", flush=True)
    if remaining_after == 0:
        print("=== DA HOAN THANH TAT CA ===", flush=True)

if __name__ == "__main__":
    round_num = 0
    while True:
        round_num += 1
        print(f"\n{'='*40}", flush=True)
        print(f"Lo thu {round_num}", flush=True)
        remaining = count_remaining()
        if remaining == 0:
            print("=== DA HOAN THANH TAT CA ===", flush=True)
            break
        print(f"Con lai: {remaining} tu", flush=True)
        batch = fetch_batch()
        if not batch:
            print("Khong con tu nao can xu ly.", flush=True)
            break
        ok = process_batch(batch)
        print(f"Xong lo {round_num}: {ok}/{len(batch)} tu", flush=True)
        print("Nghi 4 giay...", flush=True)
        time.sleep(4)
