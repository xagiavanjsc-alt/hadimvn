"""
from_dataset.py
===============
Đọc file dataset Apify có sẵn → map đúng format MelonSong → xuất Markdown + JSON

Dùng khi đã có file dataset từ Apify (có hoặc không có fetchDetails).

Chạy:
  python from_dataset.py
  python from_dataset.py --input docs/dataset_melon-chart-scraper_2026-05-13_20-01-27-400.json
  python from_dataset.py --input myfile.json --output melon_ready.md
"""

import argparse, json, sys
from pathlib import Path

# ─── MelonSong fields (khớp với website) ──────────────────────────────────────
# Website cần:
#   rank, title, artist, genre, lyrics, albumArt, album, releaseDate,
#   processed, translation, vocabulary, grammar, difficulty
#
# Apify dataset (không có fetchDetails) có:
#   rank, songId, title, artist, albumTitle, albumId, chartType, scrapedAt
#
# Apify dataset (có fetchDetails) thêm:
#   albumImageUrl, genre, releaseDate, lyrics, songUrl, flacInfo
# ─────────────────────────────────────────────────────────────────────────────


def build_album_art(album_id: str) -> str:
    """
    Tạo URL ảnh album từ albumId theo pattern CDN của Melon.
    albumId "13312398" → images/133/12/398/13312398_500.jpg
    """
    if not album_id:
        return ""
    aid = str(album_id)
    if len(aid) >= 8:
        a, b, c = aid[:3], aid[3:5], aid[5:]
    elif len(aid) >= 6:
        a, b, c = aid[:3], aid[3:5], aid[5:]
    else:
        a, b, c = aid[:2], aid[2:4], aid[4:]
    return (
        f"https://cdnimg.melon.co.kr/cm2/album/images"
        f"/{a}/{b}/{c}/{aid}_500.jpg"
        f"/melon/resize/120/quality/80/optimize"
    )


def map_item(item: dict, idx: int) -> dict:
    """Map 1 Apify item → MelonSong format khớp với website."""
    rank     = item.get("rank") or idx
    album_id = str(item.get("albumId") or "")

    # fetchDetails fields (có thể trống nếu chạy không có fetchDetails)
    lyrics    = (item.get("lyrics") or "").strip()
    genre     = item.get("genre") or ""
    released  = item.get("releaseDate") or ""
    album_art = item.get("albumImageUrl") or build_album_art(album_id)
    song_url  = item.get("songUrl") or f"https://www.melon.com/song/detail.htm?songId={item.get('songId', '')}"

    return {
        # ── Required fields ──────────────────────────────────────────────────
        "rank":        rank,
        "title":       item.get("title") or f"Song #{rank}",
        "artist":      item.get("artist") or "Unknown",
        "genre":       genre,          # ← trống nếu không có fetchDetails
        "lyrics":      lyrics,         # ← trống nếu không có fetchDetails
        "albumArt":    album_art,      # ← build từ albumId nếu không có field
        "album":       item.get("albumTitle") or "",
        "releaseDate": released,       # ← trống nếu không có fetchDetails
        "processed":   False,

        # ── Melon metadata (extra, giữ để tiện) ─────────────────────────────
        "songId":      str(item.get("songId") or ""),
        "songUrl":     song_url,

        # ── Enrichment fields (điền sau bằng enrich_batch.py) ────────────────
        "translation": None,
        "vocabulary":  None,
        "grammar":     None,
        "difficulty":  None,
    }


def analyze_dataset(songs: list[dict]) -> dict:
    """Thống kê xem dataset có đầy đủ không."""
    return {
        "total":          len(songs),
        "has_lyrics":     sum(1 for s in songs if s["lyrics"]),
        "has_albumart":   sum(1 for s in songs if s["albumArt"]),
        "has_genre":      sum(1 for s in songs if s["genre"]),
        "has_releasedate":sum(1 for s in songs if s["releaseDate"]),
    }


def save_markdown(songs: list[dict], stats: dict, path: str) -> None:
    """Xuất Markdown để review trước khi làm nội dung."""
    missing_lyrics = stats["total"] - stats["has_lyrics"]
    completeness = int(stats["has_lyrics"] / stats["total"] * 100) if stats["total"] else 0

    lines = [
        f"# Melon Top {stats['total']} — Review Lyrics",
        f"",
        f"| Trường | Có dữ liệu | Thiếu |",
        f"|---|---|---|",
        f"| Lyrics | {stats['has_lyrics']} | {stats['total']-stats['has_lyrics']} |",
        f"| Album Art | {stats['has_albumart']} | {stats['total']-stats['has_albumart']} |",
        f"| Genre | {stats['has_genre']} | {stats['total']-stats['has_genre']} |",
        f"| Ngày phát hành | {stats['has_releasedate']} | {stats['total']-stats['has_releasedate']} |",
        f"",
    ]

    if missing_lyrics > 0:
        lines += [
            f"> ⚠️ **{missing_lyrics} bài thiếu lyrics** — chạy lại Apify với `fetchDetails: true` để lấy đủ",
            f"> Hoặc điền thủ công vào file `.json` trước khi enrich.",
            f"",
        ]
    else:
        lines += [
            f"> ✅ **Đủ lyrics** — sẵn sàng chạy `enrich_batch.py`",
            f"",
        ]

    lines += ["---", ""]

    for s in songs:
        has_l  = "✅" if s["lyrics"] else "⚠️ THIẾU LYRICS"
        has_g  = f" | Genre: `{s['genre']}`" if s["genre"] else " | Genre: ❌"
        has_r  = f" | {s['releaseDate']}" if s["releaseDate"] else ""

        lines += [
            f"## #{s['rank']}. {s['title']} — {s['artist']}  {has_l}",
            f"",
            f"**Album:** {s['album']}{has_g}{has_r}",
            f"**Ảnh:** ![]({s['albumArt']})" if s["albumArt"] else "**Ảnh:** ❌",
            f"**Link:** [{s['title']}]({s['songUrl']})",
            f"",
        ]

        if s["lyrics"]:
            lines += [
                "### Lời bài hát",
                "",
                "```",
                s["lyrics"],
                "```",
                "",
            ]
        else:
            lines += [
                "_Chưa có lyrics — cần fetch lại với fetchDetails: true_",
                "",
            ]

        lines += ["---", ""]

    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    size_kb = Path(path).stat().st_size // 1024
    print(f"📝 Markdown: {path} ({size_kb} KB)")


def save_json(songs: list[dict], path: str) -> None:
    """Lưu JSON sẵn sàng upload lên website qua Admin Panel."""
    # Chỉ lưu fields mà website cần (bỏ songId, songUrl extra)
    clean = []
    for s in songs:
        clean.append({
            "rank":        s["rank"],
            "title":       s["title"],
            "artist":      s["artist"],
            "genre":       s["genre"],
            "lyrics":      s["lyrics"],
            "albumArt":    s["albumArt"],
            "album":       s["album"],
            "releaseDate": s["releaseDate"],
            "processed":   s["processed"],
            "translation": s["translation"],
            "vocabulary":  s["vocabulary"],
            "grammar":     s["grammar"],
            "difficulty":  s["difficulty"],
        })
    with open(path, "w", encoding="utf-8") as f:
        json.dump(clean, f, ensure_ascii=False, indent=2)
    size_kb = Path(path).stat().st_size // 1024
    print(f"💾 JSON (upload-ready): {path} ({size_kb} KB)")


def main():
    p = argparse.ArgumentParser(description="Convert Apify dataset → MelonSong format")
    p.add_argument(
        "--input",
        default=r"../docs/dataset_melon-chart-scraper_2026-05-13_20-01-27-400.json",
        help="Path to Apify dataset JSON",
    )
    p.add_argument("--output-md",   default="melon_review.md",   help="Markdown output")
    p.add_argument("--output-json", default="melon_upload.json", help="JSON output (upload-ready)")
    p.add_argument("--no-json", action="store_true",             help="Skip JSON output")
    args = p.parse_args()

    # Load
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"❌ File not found: {input_path}")
        sys.exit(1)

    with open(input_path, encoding="utf-8") as f:
        raw = json.load(f)
    print(f"📂 Loaded {len(raw)} items from {input_path.name}")

    # Map
    songs = [map_item(item, i + 1) for i, item in enumerate(raw)]

    # Stats
    stats = analyze_dataset(songs)
    print(f"\n📊 Dataset Analysis:")
    print(f"   Total         : {stats['total']}")
    print(f"   Has lyrics    : {stats['has_lyrics']}  {'✅' if stats['has_lyrics']==stats['total'] else '⚠️ PARTIAL'}")
    print(f"   Has album art : {stats['has_albumart']} {'✅' if stats['has_albumart']==stats['total'] else '(built from albumId)'}")
    print(f"   Has genre     : {stats['has_genre']}  {'✅' if stats['has_genre']==stats['total'] else '⚠️ MISSING'}")
    print(f"   Has releaseDate: {stats['has_releasedate']} {'✅' if stats['has_releasedate']==stats['total'] else '⚠️ MISSING'}")

    if stats["has_lyrics"] == 0:
        print(f"\n⚠️  Không có lyrics — dataset này chạy thiếu fetchDetails: true")
        print(f"   → Chạy lại Apify với fetchDetails=true, hoặc dùng fetch_raw_md.py")

    # Save
    print()
    save_markdown(songs, stats, args.output_md)
    if not args.no_json:
        save_json(songs, args.output_json)

    print(f"\n▶ Các bước tiếp theo:")
    if stats["has_lyrics"] < stats["total"]:
        print(f"   1. Fetch lại lyrics: python fetch_raw_md.py  (dùng fetchDetails=true)")
        print(f"   2. Hoặc điền lyrics thủ công vào {args.output_json}")
    print(f"   3. Enrich nội dung: python enrich_batch.py --input {args.output_json} --batch 10")
    print(f"   4. Upload lên web: Admin Panel → Quản lý Melon Chart")


if __name__ == "__main__":
    main()
