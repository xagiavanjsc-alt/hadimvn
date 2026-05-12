"""
CMD 2 - Key moi: fw_38Pdt3WR3ecpwcGPMcujsr
1. Upload toan bo file xlsx trong folder
2. Fill pronunciation cho tu moi
3. Fill examples + root_meaning + memory_tip cho tu moi
"""
import os, re, json, time, requests, openpyxl, openai
from itertools import cycle

FOLDER       = r"C:\Users\hi\Desktop\Ebook\excel_output\1"
SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"
API_KEY      = "fw_38Pdt3WR3ecpwcGPMcujsr"
TIMEOUT      = 90

key_cycle = cycle([API_KEY])

def hdrs():
    return {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"}

def get_root_char(hanja):
    for ch in hanja:
        if '\u4e00' <= ch <= '\u9fff': return ch
    return hanja[0] if hanja else ""

def clean_korean(t):
    return re.sub(r'\d+$', '', str(t).strip())

# ─── BUOC 1: UPLOAD EXCEL ──────────────────────────────────────────────────────
def fetch_existing_korean():
    """Lay tat ca tu da co trong DB de filter duplicate"""
    existing = set()
    offset = 0
    print("  Dang lay danh sach tu da co trong DB...", flush=True)
    while True:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?select=korean&limit=1000&offset={offset}",
            headers=hdrs(), timeout=30)
        data = r.json()
        if not isinstance(data, list) or not data: break
        for row in data: existing.add(row["korean"])
        if len(data) < 1000: break
        offset += 1000
    print(f"  DB hien co {len(existing)} tu", flush=True)
    return existing

def upload_excel():
    print("\n=== BUOC 1: Upload Excel ===", flush=True)
    files = sorted([f for f in os.listdir(FOLDER) if f.endswith(".xlsx")])
    print(f"Tim thay {len(files)} file", flush=True)

    existing = fetch_existing_korean()
    total_new = 0

    for fname in files:
        rows = []
        try:
            wb = openpyxl.load_workbook(os.path.join(FOLDER, fname))
            ws = wb.active
            headers = [str(c.value or "").strip() for c in ws[1]]
            for row in ws.iter_rows(min_row=2, values_only=True):
                if not any(row): continue
                obj = {headers[i]: str(v or "").strip() for i, v in enumerate(row)}
                korean = clean_korean(obj.get("Tiếng Hàn", "") or obj.get("tiếng hàn", ""))
                hanja  = obj.get("Hán tự", "") or obj.get("hán tự", "")
                viet   = obj.get("Nghĩa tiếng Việt", "") or obj.get("nghĩa tiếng việt", "")
                if not korean or not viet: continue
                if korean in existing: continue  # bo qua tu da co
                rows.append({"korean": korean, "hanja": hanja, "vietnamese": viet,
                             "root_char": get_root_char(hanja) if hanja else korean[0],
                             "difficulty": 2, "category": "Khác"})
                existing.add(korean)  # tranh trung trong cung 1 lan chay
        except Exception as e:
            print(f"  Loi doc {fname}: {e}", flush=True)
            continue
        if not rows:
            print(f"  {fname}: bo qua (toan tu cu)", flush=True)
            continue
        inserted = 0
        for i in range(0, len(rows), 50):
            r = requests.post(f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes",
                headers={**hdrs(), "Prefer": "return=minimal"},
                json=rows[i:i+50], timeout=30)
            if r.status_code in (200, 201): inserted += len(rows[i:i+50])
            else: print(f"    Insert loi {r.status_code}: {r.text[:80]}", flush=True)
        total_new += inserted
        print(f"  {fname}: {len(rows)} tu moi -> insert {inserted}", flush=True)
    print(f"Upload xong! Tong them: {total_new} tu moi", flush=True)
    return total_new

# ─── BUOC 2: FILL PRONUNCIATION ───────────────────────────────────────────────
def fetch_missing_pron():
    all_rows, offset = [], 0
    while True:
        r = requests.get(f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?select=id,korean&pronunciation=eq.&limit=1000&offset={offset}&order=id.asc", headers=hdrs(), timeout=30)
        data = r.json()
        if not isinstance(data, list) or not data: break
        all_rows.extend(data)
        if len(data) < 1000: break
        offset += 1000
    return all_rows

def ai_pronunciation(words):
    lines = "\n".join(f"{i+1}. {w[1]}" for i, w in enumerate(words))
    prompt = f"Cho cac tu Han-Quoc, tra ve phien am La-tinh theo RR, moi dong: so. phien am\n{lines}"
    client = openai.OpenAI(base_url="https://api.fireworks.ai/inference/v1", api_key=API_KEY, timeout=TIMEOUT)
    for attempt in range(3):
        try:
            resp = client.chat.completions.create(model="accounts/fireworks/models/deepseek-v3p2",
                messages=[{"role": "user", "content": prompt}], temperature=0.1, timeout=TIMEOUT)
            text = resp.choices[0].message.content.strip()
            result = {}
            for line in text.split("\n"):
                m = re.match(r'^(\d+)[.\)]\s*(.+)$', line.strip())
                if m:
                    idx = int(m.group(1)) - 1
                    if 0 <= idx < len(words): result[words[idx][0]] = m.group(2).strip()
            return result
        except Exception as e:
            print(f"  AI pron loi {attempt+1}: {str(e)[:60]}", flush=True)
            time.sleep(3*(attempt+1))
    return {}

def fill_pronunciation():
    print("\n=== BUOC 2: Fill Pronunciation ===", flush=True)
    rows = fetch_missing_pron()
    print(f"So tu chua co phien am: {len(rows)}", flush=True)
    if not rows: return
    done, ok = 0, 0
    for i in range(0, len(rows), 15):
        batch = [(r["id"], r["korean"]) for r in rows[i:i+15]]
        result = ai_pronunciation(batch)
        for uid, pron in result.items():
            r = requests.patch(f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?id=eq.{uid}",
                headers={**hdrs(), "Prefer": "return=minimal"}, json={"pronunciation": pron}, timeout=15)
            if r.status_code in (200, 204): ok += 1
        done += len(batch)
        print(f"  [{done}/{len(rows)}] pron ok={ok}", flush=True)
        time.sleep(0.3)
    print(f"Pronunciation xong: {ok}/{len(rows)}", flush=True)

# ─── BUOC 3: FILL EXAMPLES ────────────────────────────────────────────────────
def fetch_missing_examples():
    all_rows, offset = [], 0
    while True:
        r = requests.get(f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?select=id,korean,hanja,vietnamese,root_char,pronunciation&root_meaning=eq.&limit=1000&offset={offset}&order=id.asc", headers=hdrs(), timeout=30)
        data = r.json()
        if not isinstance(data, list) or not data: break
        all_rows.extend(data)
        if len(data) < 1000: break
        offset += 1000
    return all_rows

def ai_enrich(words):
    items = [f"{i+1}. {w['korean']} ({w['hanja']}) = {w['vietnamese']} | goc: {w['root_char']}" for i, w in enumerate(words)]
    prompt = f"""Lam phong phu du lieu hoc tieng Han. Tra ve JSON array {len(words)} phan tu:
{chr(10).join(items)}
Moi phan tu: {{"root_meaning":"nghia chu Han goc (1-3 tu VN)","examples":[{{"korean":"vi du","vietnamese":"nghia","pronunciation":"phien am"}}],"memory_tip":"meo nho ngan (1-2 cau VN)"}}
Chi tra JSON array."""
    client = openai.OpenAI(base_url="https://api.fireworks.ai/inference/v1", api_key=API_KEY, timeout=TIMEOUT)
    for attempt in range(3):
        try:
            resp = client.chat.completions.create(model="accounts/fireworks/models/deepseek-v3p2",
                messages=[{"role": "user", "content": prompt}], temperature=0.3, timeout=TIMEOUT)
            text = resp.choices[0].message.content.strip()
            m = re.search(r'\[.*\]', text, re.DOTALL)
            if m:
                result = json.loads(m.group())
                if isinstance(result, list) and len(result) >= len(words): return result[:len(words)]
        except Exception as e:
            print(f"  AI ex loi {attempt+1}: {str(e)[:60]}", flush=True)
            time.sleep(4*(attempt+1))
    return []

def fill_examples():
    print("\n=== BUOC 3: Fill Examples + root_meaning + memory_tip ===", flush=True)
    rows = fetch_missing_examples()
    print(f"So tu can bo sung: {len(rows)}", flush=True)
    if not rows: return
    done, ok = 0, 0
    for i in range(0, len(rows), 10):
        batch = rows[i:i+10]
        results = ai_enrich(batch)
        for j, res in enumerate(results):
            if j >= len(batch): break
            uid = batch[j]["id"]
            payload = {}
            if res.get("root_meaning"): payload["root_meaning"] = res["root_meaning"]
            if res.get("examples"): payload["examples"] = res["examples"]
            if res.get("memory_tip"): payload["memory_tip"] = res["memory_tip"]
            if payload:
                r = requests.patch(f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?id=eq.{uid}",
                    headers={**hdrs(), "Prefer": "return=minimal"}, json=payload, timeout=15)
                if r.status_code in (200, 204): ok += 1
        done += len(batch)
        print(f"  [{done}/{len(rows)}] OK={ok} | {batch[0]['korean']}...{batch[-1]['korean']}", flush=True)
        time.sleep(0.5)
    print(f"Examples xong: {ok}/{len(rows)}", flush=True)

# ─── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    upload_excel()
    fill_pronunciation()
    fill_examples()
    print("\n=== TAT CA HOAN THANH ===", flush=True)
