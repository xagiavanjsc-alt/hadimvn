"""
pipeline_melon.py
=================
Full pipeline:
  1. Fetch top 100 songs from Melon via Apify
  2. For each song, call Gemini API to generate vocabulary + grammar + translation
  3. Save enriched JSON → upload via admin panel at /admin/melon

Requirements:
  pip install requests google-generativeai

2-phase pipeline:
  Phase 1 (fetch raw):
    python pipeline_melon.py --apify-token YOUR_TOKEN --phase fetch
    → Output: melon_raw.json  (100 bài tiếng Hàn đầy đủ lyrics, chưa dịch)
    → Kiểm tra thủ công trước khi enrich

  Phase 2 (enrich):
    python pipeline_melon.py --gemini-key YOUR_KEY --input melon_raw.json --phase enrich
    → Output: melon_enriched.json (thêm vocabulary, grammar, translation, difficulty)

  Full pipeline (fetch + enrich liên tiếp):
    python pipeline_melon.py --apify-token YOUR_TOKEN --gemini-key YOUR_KEY --phase all

Optional:
  --limit 10          Only process first N songs (for testing)
  --output melon.json Output filename
"""

import argparse
import json
import time
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("❌ Missing: pip install requests")
    sys.exit(1)

# ─── Config ──────────────────────────────────────────────────────────────────
APIFY_ACTOR = "oxygenated_quagmire~melon-chart-scraper"
APIFY_BASE  = "https://api.apify.com/v2"
GEMINI_MODEL = "gemini-1.5-flash"

DIFFICULTY_MAP = {
    1: {"level": "easy",   "label": "Dễ",     "color": "green"},
    2: {"level": "medium", "label": "Trung bình", "color": "yellow"},
    3: {"level": "hard",   "label": "Khó",    "color": "red"},
}

# ─── Step 1: Fetch from Apify ─────────────────────────────────────────────────
def fetch_melon_songs(apify_token: str, limit: int = 100) -> list[dict]:
    print(f"\n🎵 Fetching top {limit} songs from Melon via Apify (fetchDetails=true)...")
    print("   fetchDetails=true → full Korean lyrics + genre + releaseDate\n")

    # Start actor run — fetchDetails:true is REQUIRED for full lyrics
    run_url = f"{APIFY_BASE}/acts/{APIFY_ACTOR}/runs"
    resp = requests.post(
        run_url,
        headers={"Authorization": f"Bearer {apify_token}"},
        json={
            "chartType": "top100",
            "fetchDetails": True,   # ← Required for lyrics, genre, releaseDate
            "limit": limit,
        },
        timeout=30
    )
    if resp.status_code not in (200, 201):
        print(f"❌ Failed to start Apify run: {resp.status_code} {resp.text}")
        sys.exit(1)

    run_id = resp.json()["data"]["id"]
    print(f"   Run started: {run_id}")

    # Poll until done
    for attempt in range(60):
        time.sleep(5)
        status_resp = requests.get(
            f"{APIFY_BASE}/actor-runs/{run_id}",
            headers={"Authorization": f"Bearer {apify_token}"},
            timeout=15
        )
        status = status_resp.json()["data"]["status"]
        print(f"   [{attempt+1}/60] Status: {status}")
        if status == "SUCCEEDED":
            break
        if status in ("FAILED", "ABORTED", "TIMED-OUT"):
            print(f"❌ Run failed with status: {status}")
            sys.exit(1)
    else:
        print("❌ Timeout waiting for Apify run")
        sys.exit(1)

    # Fetch dataset
    dataset_id = status_resp.json()["data"]["defaultDatasetId"]
    items_resp = requests.get(
        f"{APIFY_BASE}/datasets/{dataset_id}/items?limit={limit}",
        headers={"Authorization": f"Bearer {apify_token}"},
        timeout=30
    )
    items = items_resp.json()
    print(f"✅ Fetched {len(items)} songs from Melon")
    return items


def map_apify_to_song(item: dict, rank: int) -> dict:
    """
    Convert raw Apify item to MelonSong format.
    Field names from real Apify response (fetchDetails=true):
      rank, songId, title, artist, albumTitle, albumImageUrl,
      songUrl, genre, releaseDate, lyrics, flacInfo, chartType, scrapedAt
    """
    # Use rank from Apify if available, otherwise use index
    actual_rank = item.get("rank") or rank

    lyrics = item.get("lyrics") or ""
    if not lyrics:
        print(f"     ⚠️  No lyrics for: {item.get('title')} — fetchDetails may not be enabled")

    return {
        "rank": actual_rank,
        "title": item.get("title") or f"Song #{actual_rank}",
        "artist": item.get("artist") or "Unknown",
        "genre": item.get("genre") or "K-pop",
        "lyrics": lyrics,
        "albumArt": item.get("albumImageUrl") or "",   # real field name from Apify
        "processed": False,
        "releaseDate": item.get("releaseDate") or "",
        "album": item.get("albumTitle") or "",           # real field name from Apify
        "songId": item.get("songId") or "",              # keep original Melon song ID
        "songUrl": item.get("songUrl") or "",
        "translation": None,
        "vocabulary": None,
        "grammar": None,
        "difficulty": None,
    }


# ─── Step 2: Enrich with Gemini ───────────────────────────────────────────────
def build_prompt(title: str, artist: str, lyrics: str) -> str:
    lyrics_preview = lyrics[:1500] if lyrics else "(no lyrics available)"
    return f"""Bạn là giáo viên tiếng Hàn chuyên nghiệp. Hãy phân tích bài hát K-pop sau để tạo tài liệu học tiếng Hàn cho người Việt.

Bài hát: {title} - {artist}
Lời bài hát:
{lyrics_preview}

Hãy trả về JSON với cấu trúc CHÍNH XÁC sau (không thêm text ngoài JSON):
{{
  "translation": {{
    "full": "Bản dịch tiếng Việt đầy đủ của lời bài hát",
    "lines": []
  }},
  "vocabulary": [
    {{
      "korean": "từ tiếng Hàn",
      "vietnamese": "nghĩa tiếng Việt",
      "romaji": "phiên âm romanization",
      "partOfSpeech": "noun/verb/adjective/adverb",
      "topikLevel": 1,
      "frequency": "high/medium/low",
      "context": "câu ví dụ trong bài hát"
    }}
  ],
  "grammar": [
    {{
      "pattern": "-아/어서",
      "meaning": "giải thích ngữ pháp bằng tiếng Việt",
      "level": "TOPIK 1",
      "examples": [
        {{
          "sentence": "câu ví dụ tiếng Hàn",
          "translation": "dịch tiếng Việt"
        }}
      ]
    }}
  ],
  "difficulty": {{
    "level": "easy",
    "score": 1,
    "label": "Dễ",
    "color": "green",
    "reason": "giải thích tại sao dễ/trung bình/khó"
  }}
}}

Yêu cầu:
- vocabulary: 8-12 từ quan trọng nhất, ưu tiên từ xuất hiện nhiều
- grammar: 2-4 mẫu ngữ pháp đặc trưng trong bài
- difficulty.level: "easy" (TOPIK 1-2) / "medium" (TOPIK 3-4) / "hard" (TOPIK 5-6)
- difficulty.score: 1 (easy), 2 (medium), 3 (hard)
- Tất cả nghĩa phải bằng tiếng Việt tự nhiên"""


def enrich_song(song: dict, gemini_key: str, retry: int = 2) -> dict:
    """Call Gemini to add vocabulary, grammar, translation to a song."""
    try:
        import google.generativeai as genai
    except ImportError:
        print("❌ Missing: pip install google-generativeai")
        sys.exit(1)

    genai.configure(api_key=gemini_key)
    model = genai.GenerativeModel(GEMINI_MODEL)

    prompt = build_prompt(song["title"], song["artist"], song["lyrics"])

    for attempt in range(retry + 1):
        try:
            resp = model.generate_content(prompt)
            raw = resp.text.strip()

            # Strip markdown code fences if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
                raw = raw.strip()
                if raw.endswith("```"):
                    raw = raw[:-3].strip()

            data = json.loads(raw)

            song["translation"] = data.get("translation")
            song["vocabulary"] = data.get("vocabulary", [])
            song["grammar"] = data.get("grammar", [])
            song["difficulty"] = data.get("difficulty")
            song["processed"] = True
            return song

        except json.JSONDecodeError as e:
            print(f"     ⚠️  JSON parse error (attempt {attempt+1}): {e}")
            if attempt < retry:
                time.sleep(2)
        except Exception as e:
            err = str(e)
            if "429" in err or "quota" in err.lower():
                wait = 30 * (attempt + 1)
                print(f"     ⏳ Rate limited, waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"     ❌ Gemini error: {err}")
                if attempt < retry:
                    time.sleep(3)

    print(f"     ⚠️  Skipping enrichment for: {song['title']}")
    return song


# ─── Main ─────────────────────────────────────────────────────────────────────
def check_raw_quality(songs: list[dict]) -> None:
    """Print quality report for raw fetched songs."""
    no_lyrics = [s for s in songs if not s.get("lyrics")]
    has_lyrics = [s for s in songs if s.get("lyrics")]
    no_art = [s for s in songs if not s.get("albumArt")]

    print(f"\n📊 Raw Data Quality Report:")
    print(f"   Total songs  : {len(songs)}")
    print(f"   Has lyrics   : {len(has_lyrics)} ✅")
    print(f"   Missing lyrics: {len(no_lyrics)} {'⚠️' if no_lyrics else '✅'}")
    print(f"   Missing art  : {len(no_art)} {'⚠️' if no_art else '✅'}")
    if no_lyrics:
        print(f"\n   Songs missing lyrics:")
        for s in no_lyrics[:10]:
            print(f"     #{s['rank']} {s['title']} - {s['artist']}")
    print("")


def main():
    parser = argparse.ArgumentParser(description="Melon songs 2-phase pipeline")
    parser.add_argument("--apify-token", required=False, help="Apify API token")
    parser.add_argument("--gemini-key", required=False, help="Google Gemini API key")
    parser.add_argument("--limit", type=int, default=100, help="Number of songs (default: 100)")
    parser.add_argument("--output", default=None, help="Output JSON filename (auto-named if not set)")
    parser.add_argument("--input", help="Input JSON for phase enrich (skip fetch)")
    parser.add_argument("--phase", choices=["fetch", "enrich", "all"], default="all",
                        help="fetch=only fetch raw | enrich=only enrich from --input | all=both")
    args = parser.parse_args()

    songs = []

    # ── PHASE 1: Fetch ────────────────────────────────────────────────────────
    if args.phase in ("fetch", "all"):
        if not args.apify_token:
            print("❌ --apify-token required for fetch phase")
            sys.exit(1)
        items = fetch_melon_songs(args.apify_token, args.limit)
        songs = [map_apify_to_song(item, i+1) for i, item in enumerate(items)]

        # Quality check
        check_raw_quality(songs)

        raw_output = args.output or "melon_raw.json"
        _save(songs, raw_output)
        print(f"📁 Phase 1 done → {raw_output}")
        print(f"   Review file before running Phase 2 (enrich)")

        if args.phase == "fetch":
            print(f"\n▶ Next step:")
            print(f"   python pipeline_melon.py --input {raw_output} --gemini-key YOUR_KEY --phase enrich")
            return

    # ── Load from file (for enrich-only mode) ────────────────────────────────
    if args.phase == "enrich":
        if not args.input:
            print("❌ --input required for enrich phase")
            sys.exit(1)
        print(f"\n📂 Loading raw songs from: {args.input}")
        with open(args.input, encoding="utf-8") as f:
            songs = json.load(f)
        print(f"   Loaded {len(songs)} songs")
        check_raw_quality(songs)

    # ── PHASE 2: Enrich ───────────────────────────────────────────────────────
    if args.phase in ("enrich", "all"):
        if not args.gemini_key:
            print("❌ --gemini-key required for enrich phase")
            sys.exit(1)

        to_enrich = [s for s in songs if not s.get("processed") and s.get("lyrics")]
        skipped = [s for s in songs if not s.get("lyrics")]

        print(f"\n🤖 Enriching {len(to_enrich)} songs with Gemini ({GEMINI_MODEL})...")
        if skipped:
            print(f"   ⚠️  Skipping {len(skipped)} songs with no lyrics")
        print("   Auto-saves after each song (safe to interrupt + resume)\n")

        enriched_output = args.output or "melon_enriched.json"

        for i, song in enumerate(songs):
            if not song.get("lyrics"):
                print(f"   [{song['rank']:>3}] ⏭️  No lyrics — skip: {song['title']}")
                continue
            if song.get("processed"):
                print(f"   [{song['rank']:>3}] ✅ Already done: {song['title']}")
                continue

            print(f"   [{song['rank']:>3}/{len(songs)}] {song['title']} - {song['artist']}")
            idx = next((j for j, s in enumerate(songs) if s["rank"] == song["rank"]), None)
            if idx is not None:
                songs[idx] = enrich_song(song, args.gemini_key)
                vocab_count = len(songs[idx].get("vocabulary") or [])
                diff = (songs[idx].get("difficulty") or {}).get("level", "?")
                print(f"         ✅ {vocab_count} vocab | {diff}")

            _save(songs, enriched_output, quiet=True)
            time.sleep(1.5)  # Gemini free tier: ~15 req/min

        _save(songs, enriched_output)

    # ── Summary ───────────────────────────────────────────────────────────────
    processed = sum(1 for s in songs if s.get("processed"))
    no_lyrics = sum(1 for s in songs if not s.get("lyrics"))
    print(f"\n📊 Final Summary:")
    print(f"   Total    : {len(songs)} songs")
    print(f"   Enriched : {processed} ✅")
    print(f"   No lyrics: {no_lyrics} ⚠️")
    print(f"\n✅ Done! Upload via Admin Panel → Quản lý Melon Chart")


def _save(songs: list, path: str, quiet: bool = False):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)
    if not quiet:
        print(f"\n💾 Saved: {path} ({Path(path).stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
