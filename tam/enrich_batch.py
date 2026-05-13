"""
enrich_batch.py
===============
Phase 2: Enrich raw songs with Gemini AI → upload each batch to Supabase

Flow:
  melon_raw.json (100-1000 bài)
    → Lấy batch N bài chưa processed
    → Gọi Fireworks AI (DeepSeek v3p2) → sinh vocabulary + grammar + translation + difficulty
    → Lưu progress vào melon_enriched.json (resume được nếu bị ngắt)
    → Upload batch lên Supabase (optional)
    → Lặp đến hết

Usage:
  # Enrich 10 bài một lần, xem kết quả rồi quyết định tiếp (manual mode)
  python enrich_batch.py --input melon_raw.json --batch 10

  # Enrich tất cả tự động (không dừng)
  python enrich_batch.py --input melon_raw.json --batch 10 --auto

  # Enrich + upload thẳng lên Supabase sau mỗi batch
  python enrich_batch.py --input melon_raw.json --batch 10 --auto --supabase-url URL --supabase-key KEY

  # Chỉ xem report (không enrich)
  python enrich_batch.py --input melon_enriched.json --report-only

Requirements:
  pip install requests supabase
"""

import argparse, json, time, sys, os
from pathlib import Path

try:
    import requests
except ImportError:
    print("❌ pip install requests")
    sys.exit(1)

# ─── API Keys (hardcoded) ───────────────────────────────────────────────────
FIREWORKS_KEYS = [
    "fw_TGsAPiEnXTbKZAgW8BeHkQ",
    # Thêm key khác vào đây nếu có: "fw_xxxxxxxxxx",
]

FIREWORKS_BASE  = "https://api.fireworks.ai/inference/v1"
FIREWORKS_MODEL = "accounts/fireworks/models/deepseek-v3p2"

_key_index = 0  # xoay vòng keys

DELAY_BETWEEN_SONGS   = 1.0   # seconds
DELAY_BETWEEN_BATCHES = 3     # seconds pause between batches


def get_next_key() -> str:
    """Round-robin through available Fireworks keys."""
    global _key_index
    key = FIREWORKS_KEYS[_key_index % len(FIREWORKS_KEYS)]
    _key_index += 1
    return key


# ─── Prompt ────────────────────────────────────────────────────────────────────────────
PROMPT_TEMPLATE = """Bạn là giáo viên tiếng Hàn chuyên nghiệp. Phân tích bài hát K-pop sau cho người Việt học tiếng Hàn.

Bài hát: {title} - {artist}
Lời bài hát:
{lyrics}

Trả về JSON CHÍNH XÁC theo cấu trúc sau (không thêm bất kỳ text nào ngoài JSON):
{{
  "translation": {{
    "full": "Bản dịch tiếng Việt tự nhiên của toàn bộ lời bài hát"
  }},
  "vocabulary": [
    {{
      "korean": "단어",
      "vietnamese": "nghĩa tiếng Việt",
      "romaji": "dan-eo",
      "partOfSpeech": "noun",
      "topikLevel": 2,
      "frequency": "high",
      "context": "câu trong bài hát có chứa từ này"
    }}
  ],
  "grammar": [
    {{
      "pattern": "-는",
      "meaning": "Giải thích ngữ pháp bằng tiếng Việt",
      "level": "TOPIK 1",
      "examples": [
        {{
          "sentence": "Câu tiếng Hàn từ bài hát",
          "translation": "Dịch tiếng Việt"
        }}
      ]
    }}
  ],
  "difficulty": {{
    "level": "easy",
    "score": 1,
    "label": "Dễ",
    "color": "green",
    "reason": "Lý do ngắn gọn tại sao dễ/trung bình/khó"
  }}
}}

Quy tắc:
- vocabulary: 8-12 từ quan trọng nhất (ưu tiên từ lặp nhiều, từ TOPIK thông dụng)
- grammar: 2-4 mẫu ngữ pháp đặc trưng
- difficulty: "easy" (TOPIK 1-2) | "medium" (TOPIK 3-4) | "hard" (TOPIK 5-6)
- difficulty.score: 1=easy, 2=medium, 3=hard
- Tất cả nghĩa phải là tiếng Việt tự nhiên"""


# ─── Fireworks AI Call ───────────────────────────────────────────────────────────
def call_fireworks(prompt: str, retries: int = 2) -> str:
    """Call Fireworks AI API (OpenAI-compatible), returns response text."""
    for attempt in range(retries + 1):
        api_key = get_next_key()
        try:
            resp = requests.post(
                f"{FIREWORKS_BASE}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": FIREWORKS_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 2048,
                    "temperature": 0.3,
                },
                timeout=60,
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
            elif resp.status_code == 429:
                wait = 30 * (attempt + 1)
                print(f"      ⏳ Rate limit (key {_key_index % len(FIREWORKS_KEYS)}) — wait {wait}s...")
                time.sleep(wait)
            elif resp.status_code == 401:
                print(f"      ❌ Invalid key: {api_key[:12]}... — trying next")
                time.sleep(1)
            else:
                print(f"      ❌ HTTP {resp.status_code}: {resp.text[:100]}")
                if attempt < retries:
                    time.sleep(3)
        except requests.Timeout:
            print(f"      ⏱  Timeout attempt {attempt+1}")
            if attempt < retries:
                time.sleep(5)
        except Exception as e:
            print(f"      ❌ {e}")
            if attempt < retries:
                time.sleep(3)
    return ""


def enrich_one(song: dict, retries: int = 2) -> dict:
    """Enrich one song using Fireworks AI (DeepSeek v3p2)."""
    lyrics_cut = song["lyrics"][:1500]
    prompt = PROMPT_TEMPLATE.format(
        title=song["title"], artist=song["artist"], lyrics=lyrics_cut
    )

    for attempt in range(retries + 1):
        raw = call_fireworks(prompt)
        if not raw:
            continue

        try:
            # Strip markdown fences if present
            if "```" in raw:
                parts = raw.split("```")
                raw = parts[1] if len(parts) > 1 else raw
                if raw.lstrip().startswith("json"):
                    raw = raw.lstrip()[4:].strip()

            data = json.loads(raw)
            song["translation"] = data.get("translation")
            song["vocabulary"]  = data.get("vocabulary", [])
            song["grammar"]     = data.get("grammar", [])
            song["difficulty"]  = data.get("difficulty")
            song["processed"]   = True
            return song

        except json.JSONDecodeError as e:
            print(f"      ⚠️  JSON parse error attempt {attempt+1}: {e}")
            if attempt < retries:
                time.sleep(2)

    return song  # return unprocessed


# ─── Supabase Upload ──────────────────────────────────────────────────────────
def upload_to_supabase(songs: list[dict], url: str, key: str) -> bool:
    """Upsert songs to Supabase melon_songs table."""
    try:
        from supabase import create_client
    except ImportError:
        print("      ❌ pip install supabase")
        return False

    try:
        client = create_client(url, key)
        rows = [{
            "rank": s["rank"],
            "title": s["title"],
            "artist": s["artist"],
            "genre": s["genre"],
            "lyrics": s["lyrics"],
            "album_art": s.get("albumArt", ""),
            "album": s.get("album", ""),
            "release_date": s.get("releaseDate", ""),
            "processed": s.get("processed", False),
            "translation": s.get("translation"),
            "vocabulary": s.get("vocabulary"),
            "grammar": s.get("grammar"),
            "difficulty": s.get("difficulty"),
        } for s in songs]

        # Upsert by rank
        result = client.table("melon_songs").upsert(rows, on_conflict="rank").execute()
        return True
    except Exception as e:
        print(f"      ❌ Supabase error: {e}")
        return False


# ─── Report ───────────────────────────────────────────────────────────────────
def print_report(songs: list[dict]) -> None:
    total     = len(songs)
    done      = [s for s in songs if s.get("processed")]
    pending   = [s for s in songs if not s.get("processed") and s.get("lyrics")]
    no_lyrics = [s for s in songs if not s.get("lyrics")]

    easy   = sum(1 for s in done if (s.get("difficulty") or {}).get("level") == "easy")
    medium = sum(1 for s in done if (s.get("difficulty") or {}).get("level") == "medium")
    hard   = sum(1 for s in done if (s.get("difficulty") or {}).get("level") == "hard")

    print(f"\n📊 Progress Report:")
    print(f"   Total      : {total}")
    print(f"   ✅ Enriched : {len(done)} ({len(done)*100//total}%)")
    print(f"   ⏳ Pending  : {len(pending)}")
    print(f"   ⚠️  No lyrics: {len(no_lyrics)}")
    print(f"\n   Difficulty breakdown (enriched only):")
    print(f"   🟢 Easy   : {easy}")
    print(f"   🟡 Medium : {medium}")
    print(f"   🔴 Hard   : {hard}")
    print()


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    p = argparse.ArgumentParser(description="Enrich Melon songs in small batches")
    p.add_argument("--input",  default="melon_raw.json", help="Input JSON file")
    p.add_argument("--output", default=None,             help="Output JSON (default: <input>_enriched.json)")
    p.add_argument("--batch",  type=int, default=10,     help="Songs per batch (default: 10)")
    p.add_argument("--auto",   action="store_true",      help="Run all batches without pausing")
    p.add_argument("--report-only", action="store_true", help="Only show progress report, no enriching")
    p.add_argument("--supabase-url", default=None,       help="Supabase project URL (for direct upload)")
    p.add_argument("--supabase-key", default=None,       help="Supabase service_role key")
    args = p.parse_args()

    # ── Load ──────────────────────────────────────────────────────────────────
    if not Path(args.input).exists():
        print(f"❌ File not found: {args.input}")
        sys.exit(1)

    with open(args.input, encoding="utf-8") as f:
        songs = json.load(f)
    print(f"📂 Loaded {len(songs)} songs from {args.input}")

    output = args.output or args.input.replace(".json", "_enriched.json").replace("_raw", "")
    if output == args.input:
        output = args.input.replace(".json", "_enriched.json")

    # Load existing enriched output if exists (resume support)
    if Path(output).exists():
        with open(output, encoding="utf-8") as f:
            existing = {s["rank"]: s for s in json.load(f)}
        # Merge: keep enriched data from existing output
        songs = [existing.get(s["rank"], s) for s in songs]
        print(f"   ↩️  Resumed from {output}")

    print_report(songs)

    if args.report_only:
        return


    # ── Batch loop ────────────────────────────────────────────────────────────
    pending = [s for s in songs if not s.get("processed") and s.get("lyrics")]
    total_batches = (len(pending) + args.batch - 1) // args.batch

    if not pending:
        print("✅ All songs already enriched!")
        return

    print(f"\n🤖 Enriching {len(pending)} songs with Fireworks ({FIREWORKS_MODEL})...")
    print(f"   Total batches: {total_batches}")
    if not args.auto:
        print(f"   Mode: Manual (press Enter to continue each batch, Ctrl+C to stop)\n")
    else:
        print(f"   Mode: Auto (runs all batches continuously)\n")

    batch_num = 0
    for batch_start in range(0, len(pending), args.batch):
        batch = pending[batch_start : batch_start + args.batch]
        batch_num += 1

        print(f"─── Batch {batch_num}/{total_batches} ({len(batch)} songs) ───")

        for song in batch:
            idx = next((i for i, s in enumerate(songs) if s["rank"] == song["rank"]), None)
            if idx is None:
                continue

            print(f"   #{song['rank']:>3} {song['title'][:35]:<35} {song['artist'][:20]}")
            songs[idx] = enrich_one(song)

            if songs[idx].get("processed"):
                vocab = len(songs[idx].get("vocabulary") or [])
                diff  = (songs[idx].get("difficulty") or {}).get("label", "?")
                print(f"        ✅ {vocab} từ | {diff}")
            else:
                print(f"        ⚠️  Failed to enrich")

            # Save after every song (resume-safe)
            with open(output, "w", encoding="utf-8") as f:
                json.dump(songs, f, ensure_ascii=False, indent=2)

            time.sleep(DELAY_BETWEEN_SONGS)

        # End of batch
        done_count = sum(1 for s in songs if s.get("processed"))
        print(f"\n   Batch {batch_num} done. Total enriched: {done_count}/{len(songs)}")

        # Upload this batch to Supabase if configured
        if args.supabase_url and args.supabase_key:
            print(f"   ☁️  Uploading batch to Supabase...")
            ok = upload_to_supabase(batch, args.supabase_url, args.supabase_key)
            print(f"   {'✅ Uploaded' if ok else '❌ Upload failed'}")

        # Pause between batches (manual mode)
        remaining_batches = total_batches - batch_num
        if remaining_batches > 0:
            if args.auto:
                print(f"   ⏸  Pausing {DELAY_BETWEEN_BATCHES}s before next batch...")
                time.sleep(DELAY_BETWEEN_BATCHES)
            else:
                print(f"\n   {remaining_batches} batches remaining.")
                try:
                    ans = input("   Press Enter to continue next batch (or 'q' to quit): ").strip().lower()
                    if ans == "q":
                        print("   Stopped. Resume later with same command.")
                        break
                except KeyboardInterrupt:
                    print("\n   Stopped. Resume later with same command.")
                    break
        print()

    # ── Final save + report ───────────────────────────────────────────────────
    with open(output, "w", encoding="utf-8") as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)

    size_kb = Path(output).stat().st_size // 1024
    print(f"\n💾 Saved: {output} ({size_kb} KB)")
    print_report(songs)

    remaining = sum(1 for s in songs if not s.get("processed") and s.get("lyrics"))
    if remaining:
        print(f"▶ Resume: python enrich_batch.py --input {args.input} --output {output} --gemini-key YOUR_KEY --batch {args.batch}")
    else:
        print(f"✅ All done! Upload {output} via Admin Panel → Quản lý Melon Chart")
        if args.supabase_url:
            print(f"   (Already uploaded to Supabase per batch)")


if __name__ == "__main__":
    main()
