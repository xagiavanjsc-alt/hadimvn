"""
scrape_naver_kin.py  —  Bước 1/2
Scrape 100 Q&A tiếng Hàn từ Naver KiN → lưu ra naver_kin.md (để review/edit trước)

Cách dùng:
  set APIFY_API_KEY=your_apify_key
  set PYTHONUTF8=1
  python -X utf8 scrape_naver_kin.py

Yêu cầu:
  pip install apify-client
"""

import os, time
from apify_client import ApifyClient
from datetime import datetime

APIFY_API_KEY = os.getenv("APIFY_API_KEY", "")
ACTOR_ID      = "oxygenated_quagmire/naver-kin-scraper"
MAX_ITEMS     = 100
OUTPUT_MD     = os.path.join(os.path.dirname(__file__), "naver_kin.md")

KEYWORDS = [
    "한국어 공부",
    "한국어 학습",
    "TOPIK 시험",
    "한국어 발음",
    "한국어 문법",
    "한국어 어휘",
    "EPS-TOPIK",
    "한국어 독학",
]

def fetch_apify(keyword: str, max_items: int = 20) -> list:
    client = ApifyClient(APIFY_API_KEY)
    run = client.actor(ACTOR_ID).call(run_input={
        "query":    keyword,
        "maxItems": max_items,
        "sortBy":   "accuracy",
    })
    items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
    print(f"  [{keyword}]: {len(items)} items", flush=True)
    return items

def deduplicate(items: list) -> list:
    seen, result = set(), []
    for item in items:
        key = item.get("title", "").strip().lower().replace(" ", "")
        if key and key not in seen:
            seen.add(key)
            result.append(item)
    return result

def save_to_md(items: list, filepath: str):
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("# Naver KiN Q&A\n\n")
        f.write(f"Total: {len(items)} items\n")
        f.write(f"Scraped: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("---\n\n")
        for i, item in enumerate(items, 1):
            f.write(f"## QA {i}\n\n")
            f.write(f"- **question_kr**: {item.get('title', '')}\n")
            f.write(f"- **answer_kr**: {(item.get('bestAnswer') or '')[:800]}\n")
            f.write(f"- **category**: {item.get('category', '학습법')}\n")
            f.write(f"- **likes**: {item.get('likeCount', 0)}\n")
            f.write(f"- **views**: {item.get('viewCount', 0)}\n")
            f.write(f"- **url**: {item.get('url', '')}\n")
            f.write(f"- **answered_at**: {item.get('answeredAt', '')}\n")
            f.write("\n---\n\n")
    print(f"💾 Đã lưu: {filepath} ({len(items)} Q&A)", flush=True)

def main():
    print("=" * 55, flush=True)
    print("🕷️  scrape_naver_kin: Lấy Q&A từ Naver KiN → .md", flush=True)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", flush=True)
    print("=" * 55, flush=True)

    if not APIFY_API_KEY:
        print("❌ Chưa set APIFY_API_KEY!", flush=True)
        print("   Chạy: set APIFY_API_KEY=your_key", flush=True)
        return

    per_kw = max(20, MAX_ITEMS // len(KEYWORDS) + 5)
    all_items = []
    for i, kw in enumerate(KEYWORDS):
        print(f"[{i+1}/{len(KEYWORDS)}] {kw} ...", flush=True)
        try:
            items = fetch_apify(kw, per_kw)
            all_items.extend(items)
        except Exception as e:
            print(f"  ⚠️  Lỗi: {str(e)[:80]}", flush=True)
        time.sleep(1)

    unique = deduplicate(all_items)[:MAX_ITEMS]
    print(f"\n✅ {len(all_items)} → dedup: {len(unique)} Q&A", flush=True)

    save_to_md(unique, OUTPUT_MD)
    print(f"\n� Xem/sửa file: {OUTPUT_MD}", flush=True)
    print("👉 Sau đó chạy:  python -X utf8 translate_naver_kin.py", flush=True)

if __name__ == "__main__":
    main()
