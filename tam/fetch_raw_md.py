"""
fetch_raw_md.py
===============
Fetch 100 bài từ Melon → lưu dạng Markdown để review lyrics trước khi làm nội dung

Chạy:
  python fetch_raw_md.py              ← test 3 bài (mặc định)
  python fetch_raw_md.py --limit 100  ← lấy 100 bài
  python fetch_raw_md.py --output my_songs

Sau khi có .md, chạy:
  python enrich_from_md.py --input melon_raw.md
"""

import argparse, json, time, sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("❌ pip install requests")
    sys.exit(1)

# ─── Config ───────────────────────────────────────────────────────────────────
APIFY_TOKEN = "YOUR_APIFY_TOKEN_HERE"  # thay token của bạn vào đây
APIFY_ACTOR = "oxygenated_quagmire~melon-chart-scraper"
APIFY_BASE  = "https://api.apify.com/v2"


# ─── Fetch ────────────────────────────────────────────────────────────────────
def fetch(limit: int) -> list[dict]:
    print(f"🎵 Fetching top {limit} songs from Melon...")

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
    print(f"   Run ID: {run_id}")

    for i in range(90):
        time.sleep(5)
        r = requests.get(
            f"{APIFY_BASE}/actor-runs/{run_id}",
            headers={"Authorization": f"Bearer {APIFY_TOKEN}"},
            timeout=15,
        )
        status = r.json()["data"]["status"]
        print(f"   [{i*5}s] {status}    ", end="\r")
        if status == "SUCCEEDED":
            print()
            break
        if status in ("FAILED", "ABORTED", "TIMED-OUT"):
            print(f"\n❌ {status}")
            sys.exit(1)
    else:
        print("\n❌ Timeout")
        sys.exit(1)

    dataset_id = r.json()["data"]["defaultDatasetId"]
    items = requests.get(
        f"{APIFY_BASE}/datasets/{dataset_id}/items?limit={limit}",
        headers={"Authorization": f"Bearer {APIFY_TOKEN}"},
        timeout=30,
    ).json()
    print(f"✅ Got {len(items)} songs")
    return items


# ─── Save Markdown ─────────────────────────────────────────────────────────────
def save_markdown(items: list[dict], path: str) -> None:
    has_lyrics = sum(1 for s in items if s.get("lyrics"))

    lines = [
        f"# Melon Top {len(items)} — Raw Lyrics (Tiếng Hàn gốc)",
        f"",
        f"> **Tổng:** {len(items)} bài | **Có lyrics:** {has_lyrics} bài | **Thiếu lyrics:** {len(items)-has_lyrics} bài",
        f"> Review xong → chạy `enrich_batch.py` để làm nội dung học",
        f"",
        f"---",
        f"",
    ]

    for i, s in enumerate(items):
        rank      = s.get("rank") or i + 1
        title     = s.get("title") or f"Song #{rank}"
        artist    = s.get("artist") or "Unknown"
        genre     = s.get("genre") or ""                    # dạng: "대스", "발라드"
        album     = s.get("albumTitle") or ""
        album_id  = str(s.get("albumId") or "")
        released  = s.get("releaseDate") or ""              # dạng: "2026.02.09"
        lyrics    = (s.get("lyrics") or "").strip()
        song_url  = s.get("songUrl") or ""
        # albumImageUrl có sẵn nếu fetchDetails=true
        album_art = s.get("albumImageUrl") or ""

        status_icon = "✅" if lyrics else "⚠️ KHÔNG CÓ LYRICS"

        lines += [
            f"## #{rank}. {title} — {artist}  {status_icon}",
            f"",
            f"| | |",
            f"|---|---|",
            f"| Thể loại | {genre or '❌ (chạy lại với fetchDetails=true)'} |",
            f"| Album | {album} |",
            f"| Phát hành | {released or '❌'} |",
            f"| Ảnh | ![]({album_art}) |",
            f"| Link | [{title}]({song_url}) |",
            f"",
        ]

        # Lyrics
        if lyrics:
            lines += [
                "### Lời bài hát (tiếng Hàn gốc)",
                "",
                "```",
                lyrics,
                "```",
                "",
            ]
        else:
            lines += [
                "**⚠️ Không có lyrics — chạy lại với `fetchDetails: true`**",
                "",
            ]

        lines += ["---", ""]

    content = "\n".join(lines)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

    size_kb = Path(path).stat().st_size // 1024
    print(f"📝 Saved: {path} ({size_kb} KB)")


# ─── Main ────────────────────────────────────────────────────────────────
def main():
    p = argparse.ArgumentParser()
    p.add_argument("--limit",  type=int, default=3,           help="Số bài (default: 3 — test trước)")
    p.add_argument("--output", default="melon_raw.md",        help="Output .md file (default: melon_raw.md)")
    args = p.parse_args()

    items = fetch(args.limit)
    save_markdown(items, args.output)

    has_lyrics = sum(1 for s in items if s.get("lyrics"))
    print(f"\n📊 {len(items)} bài | ✅ {has_lyrics} có lyrics | ⚠️ {len(items)-has_lyrics} thiếu lyrics")
    print(f"\n▶ Review: mở {args.output}")
    print(f"▶ Enrich: python enrich_from_md.py --input {args.output}")


if __name__ == "__main__":
    main()
