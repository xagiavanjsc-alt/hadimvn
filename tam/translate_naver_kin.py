"""
translate_naver_kin.py  —  Bước 2/2
Đọc naver_kin.md → AI dịch Korean→Vietnamese → naver_kin_real.json + Supabase

Cách dùng:
  set PYTHONUTF8=1
  python -X utf8 translate_naver_kin.py

Yêu cầu:
  pip install openai requests
"""

import os, json, re, time, requests, openai
from itertools import cycle
from datetime import datetime

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

API_KEYS = [
    "fw_JrLZrwC8w7UhA91X5zmU4x",  # ← thay/thêm key vào đây
]

INPUT_MD    = os.path.join(os.path.dirname(__file__), "naver_kin.md")
OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "..", "src", "mocks", "naver_kin_real.json")
BATCH_SIZE  = 5
TIMEOUT     = 90

key_cycle = cycle(API_KEYS)

def get_sb_headers():
    return {
        "apikey":        SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type":  "application/json",
    }

# ─── Parse .md → list of dicts ───────────────────────────────────────────────
def parse_md(filepath: str) -> list:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    items = []
    current = {}
    for line in content.splitlines():
        line = line.strip()
        if line.startswith("## QA"):
            if current.get("question_kr"):
                items.append(current)
            current = {}
        elif line.startswith("- **") and "**:" in line:
            # Extract field name and value
            # Format: - **field_name**: value
            m = re.match(r'-\s+\*\*(.+?)\*\*:\s*(.*)', line)
            if m:
                key = m.group(1).strip()
                val = m.group(2).strip()
                current[key] = val

    if current.get("question_kr"):
        items.append(current)

    print(f"📄 Đọc {filepath}: {len(items)} Q&A", flush=True)
    return items

# ─── AI dịch batch ───────────────────────────────────────────────────────────
def ai_translate_batch(items: list) -> list:
    system = "Tra ve JSON array thuan. KHONG them text. Chi JSON."
    lines = []
    for i, it in enumerate(items):
        q = (it.get("question_kr") or "")[:300]
        a = (it.get("answer_kr")   or "")[:500]
        lines.append(f"{i+1}. Q: {q}\n   A: {a}")

    prompt = f"""Dich {len(items)} cap Q&A tieng Han sau sang tieng Viet ngan gon, ro rang:

{chr(10).join(lines)}

Tra ve JSON array {len(items)} phan tu, moi phan tu co 3 truong:
{{"question_vn":"cau hoi tieng Viet","answer_vn":"cau tra loi tieng Viet","category_vn":"danh muc"}}

category_vn phai la 1 trong: Phương pháp học, Thi TOPIK, Từ vựng, Ngữ pháp, Phát âm, Văn hóa Hàn, EPS-TOPIK, Đời sống"""

    for _ in range(len(API_KEYS) * 2):
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
                    {"role": "user",   "content": prompt},
                ],
                temperature=0.2,
                max_tokens=3000,
            )
            text = resp.choices[0].message.content.strip()
            raw  = re.sub(r'```(?:json)?', '', text).strip('`').strip()

            # Try full array
            match = re.search(r'\[.*\]', raw, re.DOTALL)
            if match:
                try:
                    result = json.loads(match.group())
                    if isinstance(result, list) and len(result) >= len(items):
                        return result[:len(items)]
                except json.JSONDecodeError:
                    pass

            # Fallback: parse từng object {}
            parsed, depth, start = [], 0, -1
            for ci, ch in enumerate(raw):
                if ch == '{' and depth == 0:
                    start = ci; depth = 1
                elif ch == '{':
                    depth += 1
                elif ch == '}' and depth == 1:
                    depth = 0
                    try: parsed.append(json.loads(raw[start:ci+1]))
                    except: pass
                elif ch == '}':
                    depth -= 1
            if len(parsed) >= len(items):
                return parsed[:len(items)]

            print(f"  [parse fail] raw[:100]: {raw[:100]}", flush=True)

        except Exception as e:
            err = str(e)[:100]
            if "suspended" in err or "412" in err:
                print("  Key suspended, thử key khác...", flush=True)
            else:
                print(f"  AI lỗi: {err}", flush=True)
                time.sleep(3)
    return []

# ─── Lưu Supabase ────────────────────────────────────────────────────────────
def insert_supabase(records: list) -> int:
    if not records:
        return 0
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/naver_qa",
        headers={**get_sb_headers(), "Prefer": "return=minimal"},
        json=records, timeout=20
    )
    if r.status_code in (200, 201):
        return len(records)
    print(f"  Supabase lỗi: {r.status_code} {r.text[:150]}", flush=True)
    return 0

# ─── Lưu JSON cho trang web ──────────────────────────────────────────────────
def save_json(records: list):
    # Format đúng cho page.tsx
    page_records = [
        {
            "id":       i + 1,
            "question": r.get("question_vn") or r.get("question_kr", ""),
            "answer":   r.get("answer_vn")   or r.get("answer_kr",   ""),
            "category": r.get("category_vn", "Học tiếng Hàn"),
            "likes":    int(r.get("likes", 0) or 0),
        }
        for i, r in enumerate(records)
    ]
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(page_records, f, ensure_ascii=False, indent=2)
    print(f"💾 Lưu JSON: {OUTPUT_JSON} ({len(page_records)} items)", flush=True)

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    print("=" * 55, flush=True)
    print("🤖 translate_naver_kin: .md → dịch AI → JSON + Supabase", flush=True)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", flush=True)
    print("=" * 55, flush=True)

    if not os.path.exists(INPUT_MD):
        print(f"❌ Không tìm thấy: {INPUT_MD}", flush=True)
        print("   Chạy scrape_naver_kin.py trước!", flush=True)
        return

    # Parse .md
    raw_items = parse_md(INPUT_MD)
    if not raw_items:
        print("❌ File .md rỗng hoặc sai format", flush=True)
        return

    # Dịch theo batch
    print(f"\n🤖 Đang dịch {len(raw_items)} Q&A (batch {BATCH_SIZE})...", flush=True)
    all_translated = []
    for i in range(0, len(raw_items), BATCH_SIZE):
        batch = raw_items[i:i + BATCH_SIZE]
        translated = ai_translate_batch(batch)
        if not translated:
            print(f"  [{i+BATCH_SIZE}/{len(raw_items)}] ⚠️  Bỏ qua batch này", flush=True)
            # Giữ nguyên tiếng Hàn làm fallback
            for item in batch:
                item["question_vn"] = item.get("question_kr", "")
                item["answer_vn"]   = item.get("answer_kr", "")
                item["category_vn"] = "Học tiếng Hàn"
                all_translated.append(item)
            continue

        for raw, tr in zip(batch, translated):
            merged = {**raw, **tr}
            all_translated.append(merged)

        done = min(i + BATCH_SIZE, len(raw_items))
        print(f"  [{done}/{len(raw_items)}] ✅", flush=True)
        time.sleep(0.5)

    # Build Supabase records
    sb_records = [
        {
            "question_kr": r.get("question_kr", "")[:1000],
            "answer_kr":   r.get("answer_kr",   "")[:2000],
            "question_vn": r.get("question_vn", "")[:1000],
            "answer_vn":   r.get("answer_vn",   "")[:2000],
            "category":    r.get("category",    "학습법")[:100],
            "category_vn": r.get("category_vn", "Học tiếng Hàn")[:100],
            "likes":       int(r.get("likes", 0) or 0),
            "views":       int(r.get("views", 0) or 0),
            "url":         r.get("url", "")[:500],
            "answered_at": r.get("answered_at", "")[:50],
        }
        for r in all_translated
    ]

    # Lưu Supabase
    print(f"\n📤 Insert {len(sb_records)} records vào Supabase...", flush=True)
    inserted = insert_supabase(sb_records)
    print(f"   ✅ Inserted: {inserted}", flush=True)

    # Lưu JSON
    save_json(all_translated)

    print("\n" + "=" * 55, flush=True)
    print(f"🎉 XONG! {len(all_translated)} Q&A đã dịch và lưu.", flush=True)
    print("=" * 55, flush=True)

if __name__ == "__main__":
    main()
