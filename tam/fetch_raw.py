"""
fetch_raw.py
============
Phase 1: Fetch songs from Melon via Apify → save raw JSON (Korean only, no translation)

Usage:
  python fetch_raw.py --token YOUR_APIFY_TOKEN
  python fetch_raw.py --token YOUR_TOKEN --limit 100
  python fetch_raw.py --token YOUR_TOKEN --limit 1000 --output melon_1000_raw.json

Output: melon_raw.json
  - 100-1000 bài hát tiếng Hàn đầy đủ
  - Có lyrics Korean gốc
  - CHƯA có vocabulary/grammar/translation
  - Dùng làm input cho enrich_batch.py
"""

import argparse, json, time, sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("❌ pip install requests")
    sys.exit(1)

# ─── API Keys ────────────────────────────────────────────────────────────────
APIFY_TOKEN = "YOUR_APIFY_TOKEN_HERE"  # thay token của bạn vào đây
APIFY_ACTOR = "oxygenated_quagmire~melon-chart-scraper"
APIFY_BASE  = "https://api.apify.com/v2"


def fetch(limit: int) -> list[dict]:
    print(f"\n🎵 Fetching {limit} songs from Melon (fetchDetails=true for full lyrics)...")

    resp = requests.post(
        f"{APIFY_BASE}/acts/{APIFY_ACTOR}/runs",
        headers={"Authorization": f"Bearer {APIFY_TOKEN}"},
        json={"chartType": "top100", "fetchDetails": True, "limit": limit},
        timeout=30,
    )
    if resp.status_code not in (200, 201):
        print(f"❌ {resp.status_code}: {resp.text}")
        sys.exit(1)

    run_id = resp.json()["data"]["id"]
    print(f"   Run ID: {run_id} — polling...")

    for i in range(90):
        time.sleep(5)
        r = requests.get(
            f"{APIFY_BASE}/actor-runs/{run_id}",
            headers={"Authorization": f"Bearer {APIFY_TOKEN}"},
            timeout=15,
        )
        status = r.json()["data"]["status"]
        print(f"   [{i*5}s] {status}", end="\r")
        if status == "SUCCEEDED":
            print()
            break
        if status in ("FAILED", "ABORTED", "TIMED-OUT"):
            print(f"\n❌ Run {status}")
            sys.exit(1)
    else:
        print("\n❌ Timeout (7.5 min)")
        sys.exit(1)

    dataset_id = r.json()["data"]["defaultDatasetId"]
    items = requests.get(
        f"{APIFY_BASE}/datasets/{dataset_id}/items?limit={limit}",
        headers={"Authorization": f"Bearer {APIFY_TOKEN}"},
        timeout=30,
    ).json()
    print(f"✅ Got {len(items)} songs from Apify")
    return items


def map_song(item: dict, idx: int) -> dict:
    """Map Apify fields → MelonSong format (raw, no enrichment)."""
    rank = item.get("rank") or idx
    lyrics = item.get("lyrics") or ""
    return {
        "rank": rank,
        "title": item.get("title") or f"Song #{rank}",
        "artist": item.get("artist") or "Unknown",
        "genre": item.get("genre") or "K-pop",
        "lyrics": lyrics,
        "albumArt": item.get("albumImageUrl") or "",
        "album": item.get("albumTitle") or "",
        "releaseDate": item.get("releaseDate") or "",
        "songId": item.get("songId") or "",
        "songUrl": item.get("songUrl") or "",
        "processed": False,
        "translation": None,
        "vocabulary": None,
        "grammar": None,
        "difficulty": None,
    }


def quality_report(songs: list[dict]) -> None:
    no_lyrics  = [s for s in songs if not s["lyrics"]]
    no_art     = [s for s in songs if not s["albumArt"]]
    print(f"\n📊 Quality Report:")
    print(f"   Total        : {len(songs)}")
    print(f"   Has lyrics   : {len(songs) - len(no_lyrics)} / {len(songs)}")
    print(f"   Missing art  : {len(no_art)}")
    if no_lyrics:
        print(f"\n   ⚠️  {len(no_lyrics)} songs missing lyrics:")
        for s in no_lyrics[:10]:
            print(f"      #{s['rank']} {s['title']} — {s['artist']}")
    print()


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--limit", type=int, default=100, help="Number of songs (default: 100)")
    p.add_argument("--output", default="melon_raw.json", help="Output file (default: melon_raw.json)")
    args = p.parse_args()

    items = fetch(args.limit)
    songs = [map_song(item, i + 1) for i, item in enumerate(items)]
    quality_report(songs)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)

    size_kb = Path(args.output).stat().st_size // 1024
    print(f"💾 Saved: {args.output} ({size_kb} KB, {len(songs)} songs)")
    print(f"\n▶ Next step (enrich in small batches):")
    print(f"   python enrich_batch.py --input {args.output} --batch 10")


if __name__ == "__main__":
    main()
