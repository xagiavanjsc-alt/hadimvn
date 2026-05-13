"""
download_images.py
==================
Tải ảnh album từ Melon CDN → lưu vào public/images/melon/ → cập nhật .md dùng local path

Sau bước này, albumArt trong melon_enriched.json sẽ là /images/melon/12345678.jpg
thay vì URL Melon CDN → không bị mất ảnh khi lên VPS.

Chạy:
  python download_images.py                          ← đọc melon_raw.md
  python download_images.py --input melon_raw.md     ← chỉ định file
  python download_images.py --input melon_raw.md --public-dir ../public

Output:
  - Ảnh lưu tại: public/images/melon/{albumId}.jpg
  - Cập nhật file .md: ![](https://cdn...) → ![](/images/melon/12345678.jpg)
"""

import argparse, re, sys, time
from pathlib import Path

try:
    import requests
except ImportError:
    print("❌ pip install requests")
    sys.exit(1)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer":    "https://www.melon.com/",
}


def extract_album_id(url: str) -> str:
    """Lấy albumId từ Melon CDN URL."""
    # Pattern: /images/133/12/398/13312398_xxx_500.jpg
    m = re.search(r"/(\d{6,12})_\d+_500\.jpg", url)
    if m:
        return m.group(1)
    # Fallback: số cuối trong path
    m = re.search(r"/(\d{6,12})[/_]", url)
    return m.group(1) if m else ""


def download_one(url: str, dest: Path) -> bool:
    """Download 1 ảnh về dest. Return True nếu thành công."""
    if dest.exists() and dest.stat().st_size > 5000:
        return True  # đã có, bỏ qua
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code == 200 and len(r.content) > 1000:
            dest.write_bytes(r.content)
            return True
        print(f"    ⚠️  HTTP {r.status_code}: {url[:60]}")
        return False
    except Exception as e:
        print(f"    ❌ {e}: {url[:60]}")
        return False


def process_md(md_path: Path, public_dir: Path) -> None:
    images_dir = public_dir / "images" / "melon"
    images_dir.mkdir(parents=True, exist_ok=True)

    content = md_path.read_text(encoding="utf-8")

    # Tìm tất cả CDN URLs trong MD: ![](https://cdnimg.melon.co.kr/...)
    cdn_urls = re.findall(r"!\[\]\((https://cdnimg\.melon\.co\.kr/[^\)]+)\)", content)
    cdn_urls = list(dict.fromkeys(cdn_urls))  # deduplicate

    if not cdn_urls:
        print("ℹ️  Không tìm thấy Melon CDN URL nào trong file.")
        return

    print(f"📥 Tải {len(cdn_urls)} ảnh về {images_dir}")
    ok = 0
    replacements = {}

    for url in cdn_urls:
        album_id = extract_album_id(url)
        if not album_id:
            print(f"  ⚠️  Không lấy được albumId từ: {url[:60]}")
            continue

        dest = images_dir / f"{album_id}.jpg"
        local_url = f"/images/melon/{album_id}.jpg"
        print(f"  #{album_id}  ", end="", flush=True)

        if download_one(url, dest):
            size_kb = dest.stat().st_size // 1024
            print(f"✅ {size_kb}KB → {local_url}")
            replacements[url] = local_url
            ok += 1
        else:
            print(f"❌ giữ nguyên URL gốc")

        time.sleep(0.3)

    # Cập nhật MD file
    if replacements:
        new_content = content
        for cdn_url, local_url in replacements.items():
            new_content = new_content.replace(f"![]({cdn_url})", f"![]({local_url})")
        md_path.write_text(new_content, encoding="utf-8")
        print(f"\n✏️  Đã cập nhật {md_path.name}: {len(replacements)} URL → local path")

    print(f"\n📊 Tổng: {ok}/{len(cdn_urls)} ảnh thành công")
    if ok < len(cdn_urls):
        print(f"   ⚠️  {len(cdn_urls)-ok} ảnh thất bại — URL CDN gốc được giữ nguyên")

    print(f"\n▶ Tiếp theo:")
    print(f"   python enrich_from_md.py --input {md_path.name}")
    print(f"   → albumArt trong JSON sẽ là /images/melon/XXXXX.jpg (local, vĩnh viễn)")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input",      default="melon_raw.md",    help="File .md từ fetch_raw_md.py")
    p.add_argument("--public-dir", default="../public",        help="Thư mục public của project (default: ../public)")
    args = p.parse_args()

    md_path = Path(args.input)
    if not md_path.exists():
        print(f"❌ Không tìm thấy: {args.input}")
        sys.exit(1)

    public_dir = Path(args.public_dir)
    if not public_dir.exists():
        print(f"❌ Không tìm thấy public dir: {public_dir.resolve()}")
        print(f"   Chỉ định đúng: --public-dir PATH")
        sys.exit(1)

    print(f"📂 Input : {md_path.resolve()}")
    print(f"📁 Public: {public_dir.resolve()}")
    process_md(md_path, public_dir)


if __name__ == "__main__":
    main()
