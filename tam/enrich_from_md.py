"""
enrich_from_md.py
=================
Đọc file .md từ fetch_raw_md.py → gọi Fireworks AI → xuất JSON upload lên web

Flow:
  melon_raw.md  (lyrics tiếng Hàn gốc)
    → Parse từng bài (rank, title, artist, genre, lyrics, albumArt...)
    → Gọi Fireworks AI (DeepSeek v3p2) → sinh vocabulary + grammar + translation + difficulty
    → Lưu melon_enriched.json → upload qua Admin Panel

Chạy:
  python enrich_from_md.py --input melon_raw.md
  python enrich_from_md.py --input melon_raw.md --batch 10 --auto
  python enrich_from_md.py --input melon_raw.md --report-only

Requirements:
  pip install requests
"""

import argparse, json, re, time, sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("❌ pip install requests")
    sys.exit(1)

# ─── API Keys ─────────────────────────────────────────────────────────────────
FIREWORKS_KEYS = [
    "fw_TGsAPiEnXTbKZAgW8BeHkQ",
    # Thêm key khác: "fw_xxxxxxxxxx",
]
FIREWORKS_BASE   = "https://api.fireworks.ai/inference/v1"
FIREWORKS_MODELS = [
    "accounts/fireworks/models/deepseek-v3p2",           # DeepSeek V3p2 (primary)
    "accounts/fireworks/models/deepseek-v3",             # fallback
    "accounts/fireworks/models/llama-v3p3-70b-instruct", # fallback 2
]
_model_idx = 0


def next_model() -> str:
    global _model_idx
    model = FIREWORKS_MODELS[_model_idx % len(FIREWORKS_MODELS)]
    return model


def rotate_model():
    global _model_idx
    _model_idx += 1
    print(f"      🔄 Đổi sang model: {FIREWORKS_MODELS[_model_idx % len(FIREWORKS_MODELS)]}")

_key_idx = 0

DELAY = 1.5  # giây giữa các bài


def next_key() -> str:
    global _key_idx
    key = FIREWORKS_KEYS[_key_idx % len(FIREWORKS_KEYS)]
    _key_idx += 1
    return key


# ─── Parse .md ────────────────────────────────────────────────────────────────
def parse_md(path: str) -> list[dict]:
    """Parse melon_raw.md → list of song dicts."""
    text = Path(path).read_text(encoding="utf-8")
    songs = []

    # Split by song sections (## #N. Title — Artist)
    # Pattern: ## #1. 소문의 낙원 — AKMU (악뮤)  ✅
    sections = re.split(r"\n(?=## #\d+\.)", text)

    for section in sections:
        header = re.match(r"## #(\d+)\.\s+(.+?)\s+—\s+(.+?)(?:\s+[✅⚠️].+)?$", section, re.MULTILINE)
        if not header:
            continue

        rank   = int(header.group(1))
        title  = header.group(2).strip()
        artist = header.group(3).strip()

        # Extract metadata from table
        genre      = _extract_table(section, "Thể loại") or ""
        album      = _extract_table(section, "Album") or ""
        released   = _extract_table(section, "Phát hành") or ""
        album_art  = "/images/melon/album-placeholder.svg"  # dùng placeholder local thay CDN Melon
        song_url   = _extract_link(section, title)

        # Extract lyrics (inside ``` block)
        lyrics_match = re.search(r"```\n([\s\S]+?)\n```", section)
        lyrics = lyrics_match.group(1).strip() if lyrics_match else ""

        songs.append({
            "rank":        rank,
            "title":       title,
            "artist":      artist,
            "genre":       genre,
            "lyrics":      lyrics,
            "albumArt":    album_art,
            "album":       album,
            "releaseDate": released,
            "songUrl":     song_url,
            "processed":   False,
            "translation": None,
            "vocabulary":  None,
            "grammar":     None,
            "difficulty":  None,
        })

    songs.sort(key=lambda s: s["rank"])
    return songs


def _extract_table(section: str, key: str) -> str:
    """Extract value from markdown table row: | key | value |"""
    m = re.search(rf"\|\s*{re.escape(key)}\s*\|\s*(.+?)\s*\|", section)
    if not m:
        return ""
    val = m.group(1).strip()
    # Remove ❌ markers
    if val.startswith("❌"):
        return ""
    return val


def _extract_img(section: str) -> str:
    """Extract image URL from ![](url)"""
    m = re.search(r"!\[\]\((.+?)\)", section)
    return m.group(1).strip() if m else ""


def _extract_link(section: str, title: str) -> str:
    """Extract song URL from [title](url)"""
    escaped = re.escape(title)
    m = re.search(rf"\[{escaped}\]\((.+?)\)", section)
    return m.group(1).strip() if m else ""


# ─── Fireworks AI ─────────────────────────────────────────────────────────────
PROMPT = """Bạn là giáo viên tiếng Hàn. Phân tích bài hát K-pop sau cho người Việt học tiếng Hàn.

Bài hát: {title} - {artist}
Lời bài hát:
{lyrics}

Trả về đúng cấu trúc Markdown này (giữ đúng các tiêu đề ##):

## DICH
[bản dịch tiếng Việt tự nhiên của toàn bộ lời]

## TU_VUNG
[tối đa 10 từ. Mỗi dòng]: 한국어 | Nghĩa viết hoa chữ đầu | phiên âm | TOPIK(số)
(ví dụ): 나그네 | Lữ khách | na-geu-ne | TOPIK1
(Ẩu: Luôn viết hoa chữ cái đầu tiên của phần nghĩa tiếng Việt)

## NGU_PHAP
[2-3 mẫu]. Mỗi mẫu:
### mẫu-ngữ-pháp
Giải thích ngắn bằng tiếng Việt
> câu ví dụ tiếng Hàn | dịch tiếng Việt

## DO_KHO
easy | Dễ | lý do ngắn
(hoặc medium | Trung bình | lý do)
(hoặc hard | Khó | lý do)
Điều quan trọng: chỉ viết tiếng Việt, không giải thích thêm."""


def call_ai(prompt: str, retries: int = 3) -> str:
    for attempt in range(retries + 1):
        key   = next_key()
        model = next_model()
        try:
            resp = requests.post(
                f"{FIREWORKS_BASE}/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={
                    "model":       model,
                    "messages":    [{"role": "user", "content": prompt}],
                    "max_tokens":  2048,
                    "temperature": 0.3,
                },
                timeout=60,
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
            elif resp.status_code == 429:
                wait = 30 * (attempt + 1)
                print(f"      ⏳ Rate limit — chờ {wait}s...")
                time.sleep(wait)
            elif resp.status_code == 503:
                print(f"      ⚠️  503 upstream — đổi model, chờ 5s...")
                rotate_model()
                time.sleep(5)
            elif resp.status_code == 401:
                print(f"      ❌ Key không hợp lệ: {key[:20]}...")
                time.sleep(1)
            else:
                print(f"      ❌ HTTP {resp.status_code}: {resp.text[:120]}")
                if attempt < retries:
                    time.sleep(3)
        except requests.Timeout:
            print(f"      ⏱  Timeout lần {attempt+1}")
            if attempt < retries:
                time.sleep(5)
        except Exception as e:
            print(f"      ❌ {e}")
            if attempt < retries:
                time.sleep(3)
    return ""


def parse_ai_md(raw: str) -> dict:
    """Parse Markdown trả về từ AI thành structured data."""
    result = {"translation": None, "vocabulary": [], "grammar": [], "difficulty": None}

    # ── DICH ────────────────────────────────────────────────────────────────
    m = re.search(r"## DICH\s*\n([\s\S]+?)(?=\n## |$)", raw)
    if m:
        result["translation"] = {"full": m.group(1).strip()}

    # ── TU_VUNG ─────────────────────────────────────────────────────────────
    m = re.search(r"## TU_VUNG\s*\n([\s\S]+?)(?=\n## |$)", raw)
    if m:
        vocab = []
        for line in m.group(1).strip().splitlines():
            line = line.strip().lstrip("-").strip()
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 2 and parts[0]:
                topik = ""
                if len(parts) >= 4:
                    topik_raw = parts[3].upper().replace("TOPIK", "").strip()
                    topik = topik_raw if topik_raw.isdigit() else ""
                viet = parts[1] if len(parts) > 1 else ""
                viet = viet[:1].upper() + viet[1:] if viet else ""
                vocab.append({
                    "korean":     parts[0],
                    "vietnamese": viet,
                    "romaji":     parts[2] if len(parts) > 2 else "",
                    "topikLevel": topik or None,
                })
        result["vocabulary"] = vocab

    # ── NGU_PHAP ────────────────────────────────────────────────────────────
    m = re.search(r"## NGU_PHAP\s*\n([\s\S]+?)(?=\n## |$)", raw)
    if m:
        grammar = []
        for block in re.split(r"\n### ", m.group(1)):
            block = block.strip()
            if not block:
                continue
            lines = block.splitlines()
            pattern = lines[0].strip().lstrip("#").strip() if lines else ""
            meaning = ""
            examples = []
            for line in lines[1:]:
                line = line.strip()
                if line.startswith(">"):
                    ex_parts = line.lstrip(">").split("|")
                    examples.append({
                        "sentence":    ex_parts[0].strip(),
                        "translation": ex_parts[1].strip() if len(ex_parts) > 1 else "",
                    })
                elif line and not meaning:
                    meaning = line
            if pattern:
                grammar.append({"pattern": pattern, "meaning": meaning, "examples": examples})
        result["grammar"] = grammar

    # ── DO_KHO ──────────────────────────────────────────────────────────────
    m = re.search(r"## DO_KHO\s*\n([\s\S]+?)(?=\n## |$)", raw)
    if m:
        first_line = m.group(1).strip().splitlines()[0]
        parts = [p.strip() for p in first_line.split("|")]
        level  = parts[0].lower() if parts else "medium"
        label  = parts[1] if len(parts) > 1 else level
        reason = parts[2] if len(parts) > 2 else ""
        score_map = {"easy": 1, "medium": 2, "hard": 3}
        color_map = {"easy": "green", "medium": "yellow", "hard": "red"}
        result["difficulty"] = {
            "level":  level,
            "score":  score_map.get(level, 2),
            "label":  label,
            "color":  color_map.get(level, "yellow"),
            "reason": reason,
        }

    return result


def enrich_song(song: dict) -> dict:
    prompt = PROMPT.format(
        title=song["title"],
        artist=song["artist"],
        lyrics=song["lyrics"][:2000],
    )
    for attempt in range(3):
        raw = call_ai(prompt)
        if not raw:
            continue
        data = parse_ai_md(raw)
        if data["translation"] or data["vocabulary"]:
            song["translation"] = data["translation"]
            song["vocabulary"]  = data["vocabulary"]
            song["grammar"]     = data["grammar"]
            song["difficulty"]  = data["difficulty"]
            song["processed"]   = True
            return song
        print(f"      ⚠️  Parse thất bại lần {attempt+1} — thử lại...")
        time.sleep(2)
    return song


# ─── Report ───────────────────────────────────────────────────────────────────
def report(songs: list[dict]) -> None:
    done      = sum(1 for s in songs if s.get("processed"))
    no_lyrics = sum(1 for s in songs if not s.get("lyrics"))
    pending   = sum(1 for s in songs if not s.get("processed") and s.get("lyrics"))
    print(f"\n📊 Trạng thái:")
    print(f"   Tổng      : {len(songs)}")
    print(f"   ✅ Xong    : {done}")
    print(f"   ⏳ Còn lại : {pending}")
    print(f"   ⚠️  Thiếu lyrics: {no_lyrics}")


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    p = argparse.ArgumentParser(description="Enrich melon_raw.md → JSON upload lên web")
    p.add_argument("--input",       default="melon_raw.md",      help="File .md từ fetch_raw_md.py")
    p.add_argument("--output",      default="melon_enriched.json", help="Output JSON (upload lên web)")
    p.add_argument("--batch",       type=int, default=10,        help="Bài/batch (default: 10)")
    p.add_argument("--auto",        action="store_true",         help="Chạy hết không dừng")
    p.add_argument("--report-only", action="store_true",         help="Chỉ xem trạng thái")
    args = p.parse_args()

    # Parse .md
    if not Path(args.input).exists():
        print(f"❌ Không tìm thấy: {args.input}")
        sys.exit(1)

    songs = parse_md(args.input)
    print(f"📂 Đọc {len(songs)} bài từ {args.input}")

    # Resume từ output cũ nếu có
    if Path(args.output).exists():
        with open(args.output, encoding="utf-8") as f:
            existing = {s["rank"]: s for s in json.load(f)}
        for s in songs:
            if s["rank"] in existing and existing[s["rank"]].get("processed"):
                s.update(existing[s["rank"]])
        done = sum(1 for s in songs if s.get("processed"))
        print(f"   ↩️  Resume: {done} bài đã xong")

    report(songs)

    if args.report_only:
        return

    # Batch loop
    pending = [s for s in songs if not s.get("processed") and s.get("lyrics")]
    if not pending:
        print("✅ Tất cả đã xong!")
        _save(songs, args.output)
        return

    total_batches = (len(pending) + args.batch - 1) // args.batch
    print(f"\n🤖 Enrich {len(pending)} bài | {total_batches} batch | model: DeepSeek v3p2")
    if not args.auto:
        print("   Mode: Manual — Enter để tiếp batch tiếp theo\n")
    else:
        print("   Mode: Auto\n")

    for b_num, b_start in enumerate(range(0, len(pending), args.batch), 1):
        batch = pending[b_start : b_start + args.batch]
        print(f"─── Batch {b_num}/{total_batches} ({len(batch)} bài) ───")

        for song in batch:
            idx = next((i for i, s in enumerate(songs) if s["rank"] == song["rank"]), None)
            if idx is None:
                continue
            print(f"   #{song['rank']:>3}  {song['title'][:38]:<38} {song['artist'][:20]}")
            songs[idx] = enrich_song(song)
            if songs[idx].get("processed"):
                v = len(songs[idx].get("vocabulary") or [])
                d = (songs[idx].get("difficulty") or {}).get("label", "?")
                print(f"        ✅ {v} từ vựng | Độ khó: {d}")
            else:
                print(f"        ⚠️  Thất bại")
            _save(songs, args.output, quiet=True)
            time.sleep(DELAY)

        done_now = sum(1 for s in songs if s.get("processed"))
        print(f"\n   Đã xong: {done_now}/{len(songs)} bài\n")

        remaining = total_batches - b_num
        if remaining > 0:
            if args.auto:
                time.sleep(3)
            else:
                try:
                    ans = input(f"   Còn {remaining} batch. Enter tiếp / q thoát: ").strip().lower()
                    if ans == "q":
                        print("   Dừng. Chạy lại để tiếp tục từ chỗ này.")
                        break
                except KeyboardInterrupt:
                    print("\n   Dừng. Chạy lại để tiếp tục.")
                    break

    _save(songs, args.output)
    report(songs)
    print(f"\n✅ Xong! Upload {args.output} qua Admin Panel → Quản lý Melon Chart")


def _save(songs: list, path: str, quiet: bool = False) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)
    if not quiet:
        kb = Path(path).stat().st_size // 1024
        print(f"\n💾 Saved: {path} ({kb} KB)")


if __name__ == "__main__":
    main()
