"""
fetch_naver_kin.py
Pipeline: Apify scrape Naver KiN → AI dịch Korean→Vietnamese → Supabase + JSON

Cách dùng:
  set APIFY_API_KEY=your_apify_key
  set PYTHONUTF8=1
  python -X utf8 fetch_naver_kin.py

Yêu cầu:
  pip install apify-client openai requests
"""

import os, json, re, time, requests, openai
from itertools import cycle
from datetime import datetime
from apify_client import ApifyClient

# ─── Cấu hình ────────────────────────────────────────────────────────────────
APIFY_API_KEY   = os.getenv("APIFY_API_KEY", "")
ACTOR_ID        = "oxygenated_quagmire/naver-kin-scraper"

SUPABASE_URL    = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

API_KEYS = [
    "fw_JrLZrwC8w7UhA91X5zmU4x",   # ← thêm key mới vào đây
]

OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "..", "src", "mocks", "naver_kin_real.json")
MAX_ITEMS   = 100
BATCH_AI    = 5      # số Q&A dịch mỗi lần gọi AI
TIMEOUT     = 90

# Từ khóa tìm kiếm Naver KiN – học tiếng Hàn
KEYWORDS = [
    "한국어 공부",   # học tiếng Hàn
    "한국어 학습",   # học tiếng Hàn
    "TOPIK 시험",    # thi TOPIK
    "한국어 발음",   # phát âm tiếng Hàn
    "한국어 문법",   # ngữ pháp tiếng Hàn
    "한국어 어휘",   # từ vựng tiếng Hàn
    "EPS-TOPIK",     # thi EPS
    "한국어 독학",   # tự học tiếng Hàn
]

# Map category Naver → Việt
CAT_MAP = {
    "학습법": "Phương pháp học",
    "TOPIK":  "Thi TOPIK",
    "문화":   "Văn hóa Hàn",
    "어휘":   "Từ vựng",
    "문법":   "Ngữ pháp",
    "발음":   "Phát âm",
    "EPS":    "EPS-TOPIK",
    "생활":   "Đời sống",
}

key_cycle = cycle(API_KEYS)

def get_headers():
    return {
        "apikey":        SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type":  "application/json",
    }

# ─── Bước 1: Apify scrape ─────────────────────────────────────────────────────
def fetch_apify(keyword: str, max_items: int = 20) -> list:
    if not APIFY_API_KEY:
        print("  ❌ Chưa set APIFY_API_KEY", flush=True)
        return []
    try:
        client = ApifyClient(APIFY_API_KEY)
        run = client.actor(ACTOR_ID).call(run_input={
            "query":    keyword,
            "maxItems": max_items,
            "sortBy":   "accuracy",
        })
        items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
        print(f"  Apify [{keyword}]: {len(items)} items", flush=True)
        return items
    except Exception as e:
        print(f"  Apify lỗi [{keyword}]: {str(e)[:80]}", flush=True)
        return []

# ─── Bước 2: Deduplicate ─────────────────────────────────────────────────────
def deduplicate(raw_items: list, existing_urls: set) -> list:
    seen_titles = set()
    result = []
    for item in raw_items:
        title = item.get("title", "").strip()
        url   = item.get("url", "")
        key   = title.lower().replace(" ", "")
        if key and key not in seen_titles and url not in existing_urls:
            seen_titles.add(key)
            result.append(item)
    return result

# ─── Bước 3: AI dịch batch ───────────────────────────────────────────────────
def ai_translate_batch(items: list) -> list:
    """Dịch batch Q&A Korean → Vietnamese, trả về list tương ứng"""
    system = "Tra ve JSON array thuan. KHONG them text. Chi JSON."

    lines = []
    for i, it in enumerate(items):
        q = it.get("title", "")[:300]
        a = it.get("bestAnswer", "")[:500]
        lines.append(f"{i+1}. Q: {q}\n   A: {a}")

    prompt = f"""Dich {len(items)} cap Q&A tieng Han sau sang tieng Viet (ngan gon, ro rang):

{chr(10).join(lines)}

Tra ve JSON array {len(items)} phan tu:
{{"question_vn":"Cau hoi tieng Viet","answer_vn":"Cau tra loi tieng Viet","category_vn":"Danh muc"}}

category_vn phai la 1 trong: Phương pháp học, Thi TOPIK, Từ vựng, Ngữ pháp, Phát âm, Văn hóa Hàn, EPS-TOPIK, Đời sống"""

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
                    {"role": "user",   "content": prompt},
                ],
                temperature=0.2,
                max_tokens=3000,
                timeout=TIMEOUT,
            )
            text = resp.choices[0].message.content.strip()
            raw  = re.sub(r'```(?:json)?', '', text).strip('`').strip()

            # Parse JSON array
            match = re.search(r'\[.*\]', raw, re.DOTALL)
            if match:
                try:
                    result = json.loads(match.group())
                    if isinstance(result, list) and len(result) >= len(items):
                        return result[:len(items)]
                except json.JSONDecodeError:
                    pass

            # Fallback: depth tracking
            parsed, depth, start = [], 0, -1
            for ci, ch in enumerate(raw):
                if ch == '{' and depth == 0:
                    start = ci; depth = 1
                elif ch == '{' and depth > 0:
                    depth += 1
                elif ch == '}' and depth == 1:
                    depth = 0
                    try: parsed.append(json.loads(raw[start:ci+1]))
                    except: pass
                elif ch == '}' and depth > 1:
                    depth -= 1
            if len(parsed) >= len(items):
                return parsed[:len(items)]

            print(f"  [parse fail] raw[:150]: {raw[:150]}", flush=True)

        except Exception as e:
            err = str(e)[:100]
            if "suspended" in err or "412" in err:
                print(f"  Key suspended, thu key khac...", flush=True)
            else:
                print(f"  AI loi: {err}", flush=True)
                time.sleep(3)
    return []

# ─── Bước 4: Build record Supabase ───────────────────────────────────────────
def build_record(raw: dict, translated: dict, idx: int) -> dict:
    cat_kr  = raw.get("category", "학습법") or "학습법"
    cat_vn  = translated.get("category_vn") or CAT_MAP.get(cat_kr, "Học tiếng Hàn")
    return {
        "question_kr": raw.get("title", "")[:1000],
        "answer_kr":   raw.get("bestAnswer", "")[:2000],
        "question_vn": translated.get("question_vn", "")[:1000],
        "answer_vn":   translated.get("answer_vn",   "")[:2000],
        "category":    cat_kr[:100],
        "category_vn": cat_vn[:100],
        "likes":       int(raw.get("likeCount",  0) or 0),
        "views":       int(raw.get("viewCount",  0) or 0),
        "url":         raw.get("url",  "")[:500],
        "answered_at": raw.get("answeredAt", "")[:50],
    }

# ─── Bước 5: Lưu Supabase ────────────────────────────────────────────────────
def insert_supabase(records: list) -> int:
    if not records:
        return 0
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/naver_qa",
        headers={**get_headers(), "Prefer": "return=minimal"},
        json=records, timeout=20
    )
    if r.status_code in (200, 201):
        return len(records)
    print(f"  Supabase insert lỗi: {r.status_code} {r.text[:200]}", flush=True)
    return 0

# ─── Bước 6: Lưu JSON (để page load offline) ─────────────────────────────────
def save_json(records: list):
    # Đọc JSON cũ
    existing = []
    try:
        with open(OUTPUT_JSON, "r", encoding="utf-8") as f:
            existing = json.load(f)
            if not isinstance(existing, list):
                existing = []
    except Exception:
        pass

    # Merge + limit 200
    merged = existing + records
    merged = merged[-200:]

    # Format cho page (id từ 1)
    for i, r in enumerate(merged):
        r["id"] = i + 1

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    print(f"  💾 Saved {len(merged)} items → {OUTPUT_JSON}", flush=True)

# ─── Lấy existing URLs từ Supabase để dedup ──────────────────────────────────
def fetch_existing_urls() -> set:
    try:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/naver_qa?select=url&limit=5000",
            headers=get_headers(), timeout=20
        )
        return {row["url"] for row in r.json() if row.get("url")}
    except Exception:
        return set()

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    print("=" * 60, flush=True)
    print("🔍 fetch_naver_kin: Scrape → Dịch → Supabase", flush=True)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", flush=True)
    print("=" * 60, flush=True)

    if not APIFY_API_KEY:
        print("❌ Chưa set APIFY_API_KEY. Chạy: set APIFY_API_KEY=your_key", flush=True)
        return

    # Lấy URL đã có để dedup
    print("📦 Đang lấy dữ liệu cũ từ Supabase...", flush=True)
    existing_urls = fetch_existing_urls()
    print(f"   {len(existing_urls)} bản ghi đã có", flush=True)

    # Scrape Apify
    print("\n🕷️  Scraping Naver KiN...", flush=True)
    raw_items = []
    per_kw = max(20, MAX_ITEMS // len(KEYWORDS) + 5)
    for kw in KEYWORDS:
        items = fetch_apify(kw, per_kw)
        raw_items.extend(items)
        time.sleep(1)

    print(f"\n✅ Tổng scrape: {len(raw_items)} items", flush=True)

    # Dedup
    unique = deduplicate(raw_items, existing_urls)
    unique = unique[:MAX_ITEMS]
    print(f"🔍 Sau dedup: {len(unique)} items mới", flush=True)

    if not unique:
        print("⚠️  Không có Q&A mới, kết thúc.", flush=True)
        return

    # Dịch theo batch
    print(f"\n🤖 Đang dịch {len(unique)} Q&A (batch {BATCH_AI})...", flush=True)
    all_records = []
    for i in range(0, len(unique), BATCH_AI):
        batch = unique[i:i+BATCH_AI]
        translated = ai_translate_batch(batch)
        if not translated:
            print(f"  [{i+BATCH_AI}/{len(unique)}] ⚠️  AI fail, skip batch", flush=True)
            continue
        for j, (raw, tr) in enumerate(zip(batch, translated)):
            rec = build_record(raw, tr, i + j)
            all_records.append(rec)
        print(f"  [{min(i+BATCH_AI, len(unique))}/{len(unique)}] ✅ {len(all_records)} records", flush=True)
        time.sleep(0.5)

    # Lưu Supabase
    print(f"\n📤 Inserting {len(all_records)} records vào Supabase...", flush=True)
    inserted = insert_supabase(all_records)
    print(f"   ✅ Inserted: {inserted}", flush=True)

    # Lưu JSON
    print("\n💾 Cập nhật JSON file...", flush=True)
    # Build page-format records
    page_records = [
        {
            "id":       i + 1,
            "question": r["question_vn"] or r["question_kr"],
            "answer":   r["answer_vn"]   or r["answer_kr"],
            "category": r["category_vn"],
            "likes":    r["likes"],
            "views":    r["views"],
            "url":      r["url"],
        }
        for i, r in enumerate(all_records)
    ]
    save_json(page_records)

    print("\n" + "=" * 60, flush=True)
    print(f"🎉 XONG! {inserted} Q&A mới trên Supabase, JSON đã cập nhật.", flush=True)
    print("=" * 60, flush=True)

if __name__ == "__main__":
    main()
