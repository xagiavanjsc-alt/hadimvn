"""
Script to fetch Naver KiN Q&A data weekly with deduplication
- Loads existing data from JSON/localStorage format
- Fetches new data via Apify
- Deduplicates based on question title
- Keeps only 100 newest/most relevant items
- Saves to JSON for offline loading

Usage:
  export APIFY_API_KEY=your-key
  python scripts/fetch_naver_kin_weekly.py
"""

import os
import json
import time
from apify_client import ApifyClient
from datetime import datetime
from typing import List, Dict, Set

# Configuration
ACTOR_ID = "oxygenated_quagmire/naver-kin-scraper"
APIFY_API_KEY = os.getenv("APIFY_API_KEY")
# Get absolute paths (script is in scripts/, data is in src/mocks/)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(SCRIPT_DIR)  # Go up to project root
OUTPUT_MD = os.path.join(BASE_DIR, "src/mocks/naver_kin.md")
OUTPUT_JSON = os.path.join(BASE_DIR, "src/mocks/naver_kin_real.json")
MAX_ITEMS = 100

# Korean learning-related keywords for fetching relevant Q&A
SEARCH_KEYWORDS = [
    "한국어 공부",  # Korean language study
    "한국어 학습",  # Korean learning
    "TOPIK 시험",   # TOPIK exam
    "EPS-TOPIK",   # EPS-TOPIK
    "한국어 발음",   # Korean pronunciation
    "한국어 문법",   # Korean grammar
    "한국어 어휘",   # Korean vocabulary
    "한국어 독학",   # Korean self-study
]

def load_existing_data() -> List[Dict]:
    """Load existing Naver KiN data from JSON"""
    try:
        if os.path.exists(OUTPUT_JSON):
            with open(OUTPUT_JSON, "r", encoding="utf-8") as f:
                data = json.load(f)
                print(f"📂 Loaded {len(data)} existing items from {OUTPUT_JSON}")
                return data
    except Exception as e:
        print(f"⚠️  Warning: Could not load existing data: {e}")
    return []

def generate_qa_key(item: Dict) -> str:
    """Generate unique key for deduplication based on question title"""
    title = item.get("title", "").strip()
    # Normalize: lowercase, remove whitespace
    return title.lower().replace(" ", "")

def deduplicate(existing: List[Dict], new: List[Dict]) -> List[Dict]:
    """Deduplicate new items against existing data"""
    existing_keys = {generate_qa_key(item) for item in existing}
    
    deduplicated = []
    skipped = 0
    
    for item in new:
        key = generate_qa_key(item)
        if key not in existing_keys:
            deduplicated.append(item)
        else:
            skipped += 1
    
    print(f"🔍 Deduplication: {len(new)} new items → {len(deduplicated)} unique (skipped {skipped} duplicates)")
    return deduplicated

def fetch_naver_kin_data(query: str, max_items: int = 50, sort_by: str = "accuracy"):
    """Fetch Naver KiN data using Apify"""
    
    if APIFY_API_KEY == "your-apify-api-key":
        print("❌ Error: Please set APIFY_API_KEY environment variable")
        print("   export APIFY_API_KEY=your-actual-api-key")
        return None
    
    print(f"🚀 Fetching Naver KiN data (query: {query}, maxItems: {max_items}, sortBy: {sort_by})...")
    
    client = ApifyClient(APIFY_API_KEY)
    
    run_input = {
        "query": query,
        "maxItems": max_items,
        "sortBy": sort_by  # "accuracy" or "date"
    }
    
    try:
        # Start the actor
        print("📡 Starting Apify actor...")
        run = client.actor(ACTOR_ID).call(run_input=run_input)
        run_id = run["defaultDatasetId"]
        
        # Poll for results
        print("⏳ Waiting for results...")
        items = []
        max_wait = 90  # 90 seconds max (Naver might be slower)
        elapsed = 0
        
        while elapsed < max_wait:
            time.sleep(3)
            elapsed += 3
            
            try:
                items = list(client.dataset(run_id).iterate_items())
                if items:
                    print(f"✅ Fetched {len(items)} items in {elapsed}s")
                    break
            except:
                continue
        
        if not items:
            print("❌ No items fetched")
            return None
        
        return items
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def transform_to_naver_qa(api_data):
    """Transform API data to NaverQA format (matching web app structure)"""
    
    transformed = []
    next_id = 1  # Will be reassigned after merging
    
    for item in api_data:
        qa = {
            "id": next_id,  # Temporary ID, will be reassigned
            "question": item.get("title", ""),
            "answer": item.get("bestAnswer", ""),
            "category": extract_category(item.get("category", "학습법")),
            "likes": item.get("likeCount", 0),
            "views": item.get("viewCount", 0),
            "url": item.get("url", ""),
        }
        transformed.append(qa)
        next_id += 1
    
    return transformed

def extract_category(category_str: str) -> str:
    """Extract simple category from Naver category string"""
    if not category_str:
        return "학습법"
    
    # Map Naver categories to simplified ones
    category_map = {
        "컴퓨터/통신": "컴퓨터",
        "교육/학교": "학습법",
        "어학": "어휘",
        "비즈니스": "비즈니스",
        "취미/여가": "취미",
        "생활": "생활",
    }
    
    for key, value in category_map.items():
        if key in category_str:
            return value
    
    return "학습법"  # Default

def merge_and_limit(existing: List[Dict], new: List[Dict], limit: int = MAX_ITEMS) -> List[Dict]:
    """Merge existing and new data, then limit to specified count"""
    merged = existing + new
    
    # Sort by likes (more likes = more popular/useful)
    merged.sort(key=lambda x: x.get("likes", 0), reverse=True)
    
    # Keep only top N items
    limited = merged[:limit]
    
    # Reassign IDs sequentially
    for idx, item in enumerate(limited):
        item["id"] = idx + 1
    
    print(f"📊 Merged {len(existing)} + {len(new)} = {len(merged)} items → limited to {len(limited)} items")
    return limited

def save_to_markdown(data, filename):
    """Save data to Markdown file for manual editing"""
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write("# Naver KiN Q&A Data\n\n")
        f.write(f"Total: {len(data)} Q&A items\n")
        f.write(f"Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("---\n\n")
        
        for item in data:
            f.write(f"## Q&A {item.get('id', 'N/A')}\n\n")
            f.write(f"- **ID**: {item.get('id', 'N/A')}\n")
            f.write(f"- **Question**: {item.get('question', 'N/A')}\n")
            f.write(f"- **Answer**: {item.get('answer', 'N/A')}\n")
            f.write(f"- **Category**: {item.get('category', 'N/A')}\n")
            f.write(f"- **Likes**: {item.get('likes', 0)}\n")
            f.write(f"- **Views**: {item.get('views', 0)}\n")
            f.write(f"- **URL**: {item.get('url', 'N/A')}\n")
            f.write("\n---\n\n")
    
    print(f"💾 Saved {len(data)} Q&A items to {filename} (Markdown)")

def save_to_json(data, filename):
    """Save data to JSON file for web app"""
    
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Saved {len(data)} Q&A items to {filename} (JSON)")

def main():
    """Main function"""
    
    print("=" * 60)
    print("❓ Naver KiN Weekly Fetcher (with deduplication)")
    print("=" * 60)
    print(f"📅 Run date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🎯 Target: {MAX_ITEMS} unique items")
    print("=" * 60)
    
    # Load existing data
    existing_data = load_existing_data()
    existing_transformed = transform_to_naver_qa(existing_data) if existing_data else []
    
    # Fetch new data for each keyword
    all_new_items = []
    items_per_keyword = 20  # Fetch ~20 per keyword to get ~140 total (after dedup → 100)
    
    for keyword in SEARCH_KEYWORDS:
        print(f"\n🔍 Fetching for keyword: {keyword}")
        api_data = fetch_naver_kin_data(
            query=keyword,
            max_items=items_per_keyword,
            sort_by="accuracy"  # Use accuracy to get best answers
        )
        
        if api_data:
            all_new_items.extend(api_data)
            print(f"   → Fetched {len(api_data)} items")
    
    if not all_new_items:
        print("⚠️  No new data fetched, keeping existing data")
        save_to_json(existing_transformed, OUTPUT_FILE)
        return
    
    # Transform new data
    print(f"\n🔄 Transforming {len(all_new_items)} new items...")
    new_transformed = transform_to_naver_qa(all_new_items)
    
    # Deduplicate
    unique_new = deduplicate(existing_transformed, new_transformed)
    
    # Merge and limit
    final_data = merge_and_limit(existing_transformed, unique_new, MAX_ITEMS)
    
    # Save to both Markdown (for editing) and JSON (for web app)
    save_to_markdown(final_data, OUTPUT_MD)
    save_to_json(final_data, OUTPUT_JSON)
    
    print("=" * 60)
    print("✅ Done! Data updated successfully")
    print(f"� Edit: {OUTPUT_MD} (Markdown - for manual editing)")
    print(f"🌐 Deploy: {OUTPUT_JSON} (JSON - for web app)")
    print("💡 After editing Markdown, run: python scripts/convert_data.py --to-json --type naver --input src/mocks/naver_kin.md --output src/mocks/naver_kin_real.json")
    print("=" * 60)

if __name__ == "__main__":
    main()
