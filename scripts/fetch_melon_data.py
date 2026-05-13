"""
Script to fetch Melon Chart data via Apify
Run this locally to update melon data, then commit the JSON file
"""

import os
import json
import time
from apify_client import ApifyClient

# Configuration
ACTOR_ID = "oxygenated_quagmire/melon-chart-scraper"
APIFY_API_KEY = os.getenv("APIFY_API_KEY") or "your-apify-api-key"
OUTPUT_FILE = "src/mocks/melonSongs_real.json"

def fetch_melon_data(mode="top100", fetch_details=True, max_results=100, keyword=None):
    """Fetch Melon chart data using Apify"""
    
    if APIFY_API_KEY == "your-apify-api-key":
        print("❌ Error: Please set APIFY_API_KEY environment variable")
        print("   export APIFY_API_KEY=your-actual-api-key")
        return None
    
    print(f"🚀 Fetching Melon data (mode: {mode}, maxResults: {maxResults})...")
    
    client = ApifyClient(APIFY_API_KEY)
    
    run_input = {
        "mode": mode,
        "fetchDetails": fetch_details,
        "maxResults": max_results,
    }
    
    if keyword:
        run_input["keyword"] = keyword
    
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

def save_to_json(data, filename):
    """Save data to JSON file"""
    
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Saved {len(data)} songs to {filename}")

def main():
    """Main function"""
    
    print("=" * 60)
    print("🎵 Melon Chart Data Fetcher")
    print("=" * 60)
    
    # Fetch TOP 100 with details
    api_data = fetch_melon_data(mode="top100", fetch_details=True, max_results=100)
    
    if not api_data:
        return
    
    # Transform data
    print("🔄 Transforming data...")
    melon_songs = transform_to_melon_songs(api_data)
    
    # Save to JSON
    save_to_json(melon_songs, OUTPUT_FILE)
    
    print("=" * 60)
    print("✅ Done! Now update src/mocks/melonSongs.ts to use this data")
    print("=" * 60)

if __name__ == "__main__":
    main()
