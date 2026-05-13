"""
Script to fetch Melon Chart data weekly with deduplication
- Loads existing data from JSON
- Fetches new data
- Deduplicates based on song ID (rank+title+artist)
- Keeps only 100 newest items
- Saves to JSON for offline loading

Usage:
  export APIFY_API_KEY=your-key
  python scripts/fetch_melon_weekly.py
"""

import os
import json
import time
from apify_client import ApifyClient
from datetime import datetime
from typing import List, Dict, Set

# Configuration
ACTOR_ID = "oxygenated_quagmire/melon-chart-scraper"
APIFY_API_KEY = os.getenv("APIFY_API_KEY")
# Get absolute paths (script is in scripts/, data is in src/mocks/)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(SCRIPT_DIR)  # Go up to project root
OUTPUT_MD = os.path.join(BASE_DIR, "src/mocks/melonSongs.md")
OUTPUT_JSON = os.path.join(BASE_DIR, "src/mocks/melonSongs_real.json")
MAX_ITEMS = 100

def load_existing_data() -> List[Dict]:
    """Load existing Melon data from JSON"""
    try:
        if os.path.exists(OUTPUT_JSON):
            with open(OUTPUT_JSON, "r", encoding="utf-8") as f:
                data = json.load(f)
                print(f"📂 Loaded {len(data)} existing items from {OUTPUT_JSON}")
                return data
    except Exception as e:
        print(f"⚠️  Warning: Could not load existing data: {e}")
    return []

def generate_song_key(song: Dict) -> str:
    """Generate unique key for deduplication based on title+artist (rank can change over time)"""
    return f"{song.get('title', '')}|{song.get('artist', '')}"

def deduplicate(existing: List[Dict], new: List[Dict]) -> List[Dict]:
    """Deduplicate new items against existing data"""
    existing_keys = {generate_song_key(item) for item in existing}
    
    deduplicated = []
    skipped = 0
    
    for item in new:
        key = generate_song_key(item)
        if key not in existing_keys:
            deduplicated.append(item)
        else:
            skipped += 1
    
    print(f"🔍 Deduplication: {len(new)} new items → {len(deduplicated)} unique (skipped {skipped} duplicates)")
    return deduplicated

def fetch_melon_data(mode="top100", fetch_details=True, max_results=200):
    """Fetch Melon chart data using Apify"""
    
    if APIFY_API_KEY == "your-apify-api-key":
        print("❌ Error: Please set APIFY_API_KEY environment variable")
        print("   export APIFY_API_KEY=your-actual-api-key")
        return None
    
    print(f"🚀 Fetching Melon data (mode: {mode}, maxResults: {max_results})...")
    
    client = ApifyClient(APIFY_API_KEY)
    
    run_input = {
        "mode": mode,
        "fetchDetails": fetch_details,
        "maxResults": max_results,
    }
    
    try:
        # Start the actor
        print("📡 Starting Apify actor...")
        run = client.actor(ACTOR_ID).call(run_input=run_input)
        run_id = run["defaultDatasetId"]
        
        # Poll for results
        print("⏳ Waiting for results...")
        items = []
        max_wait = 60  # 60 seconds max
        elapsed = 0
        
        while elapsed < max_wait:
            time.sleep(2)
            elapsed += 2
            
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

def transform_to_melon_songs(api_data):
    """Transform API data to MelonSong format"""
    
    transformed = []
    
    for item in api_data:
        song = {
            "rank": item.get("rank", 0),
            "title": item.get("title", ""),
            "artist": item.get("artist", ""),
            "genre": item.get("genre", "K-pop"),
            "lyrics": item.get("lyrics", ""),
            "albumArt": item.get("albumArt", "/images/melon/album-placeholder.svg"),
            "processed": False,
            "releaseDate": item.get("releaseDate"),
            "album": item.get("album"),
        }
        transformed.append(song)
    
    return transformed

def merge_and_limit(existing: List[Dict], new: List[Dict], limit: int = MAX_ITEMS) -> List[Dict]:
    """Merge existing and new data, then limit to specified count"""
    merged = existing + new
    
    # Sort by rank (lower rank = higher on chart)
    merged.sort(key=lambda x: x.get("rank", 999))
    
    # Keep only top N items
    limited = merged[:limit]
    
    print(f"📊 Merged {len(existing)} + {len(new)} = {len(merged)} items → limited to {len(limited)} items")
    return limited

def save_to_markdown(data, filename):
    """Save data to Markdown file for manual editing"""
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write("# Melon Chart Data\n\n")
        f.write(f"Total: {len(data)} songs\n")
        f.write(f"Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("---\n\n")
        
        for item in data:
            f.write(f"## Song {item.get('rank', 'N/A')}\n\n")
            f.write(f"- **Rank**: {item.get('rank', 'N/A')}\n")
            f.write(f"- **Title**: {item.get('title', 'N/A')}\n")
            f.write(f"- **Artist**: {item.get('artist', 'N/A')}\n")
            f.write(f"- **Genre**: {item.get('genre', 'N/A')}\n")
            f.write(f"- **Album**: {item.get('album', 'N/A')}\n")
            f.write(f"- **Release Date**: {item.get('releaseDate', 'N/A')}\n")
            f.write(f"- **Album Art**: {item.get('albumArt', 'N/A')}\n")
            f.write(f"- **Processed**: {item.get('processed', False)}\n")
            f.write(f"- **Lyrics**: {item.get('lyrics', 'N/A')}\n")
            f.write("\n---\n\n")
    
    print(f"💾 Saved {len(data)} songs to {filename} (Markdown)")

def save_to_json(data, filename):
    """Save data to JSON file for web app"""
    
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Saved {len(data)} songs to {filename} (JSON)")

def main():
    """Main function"""
    
    print("=" * 60)
    print("🎵 Melon Chart Weekly Fetcher (with deduplication)")
    print("=" * 60)
    print(f"📅 Run date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🎯 Target: {MAX_ITEMS} unique items")
    print("=" * 60)
    
    # Load existing data
    existing_data = load_existing_data()
    existing_transformed = transform_to_melon_songs(existing_data) if existing_data else []
    
    # Fetch new data (fetch more than needed to account for duplicates)
    api_data = fetch_melon_data(mode="top100", fetch_details=True, max_results=200)
    
    if not api_data:
        print("⚠️  No new data fetched, keeping existing data")
        save_to_json(existing_transformed, OUTPUT_FILE)
        return
    
    # Transform new data
    print("🔄 Transforming new data...")
    new_transformed = transform_to_melon_songs(api_data)
    
    # Deduplicate
    unique_new = deduplicate(existing_transformed, new_transformed)
    
    # Merge and limit
    final_data = merge_and_limit(existing_transformed, unique_new, MAX_ITEMS)
    
    # Save to both Markdown (for editing) and JSON (for web app)
    save_to_markdown(final_data, OUTPUT_MD)
    save_to_json(final_data, OUTPUT_JSON)
    
    print("=" * 60)
    print("✅ Done! Data updated successfully")
    print(f"📝 Edit: {OUTPUT_MD} (Markdown - for manual editing)")
    print(f"🌐 Deploy: {OUTPUT_JSON} (JSON - for web app)")
    print("💡 After editing Markdown, run: python scripts/convert_data.py --to-json --type melon --input src/mocks/melonSongs.md --output src/mocks/melonSongs_real.json")
    print("=" * 60)

if __name__ == "__main__":
    main()
