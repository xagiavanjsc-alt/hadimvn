"""
1. Convert tất cả ảnh de1/*.jpeg → de1/*.webp (xoá jpeg cũ)
2. Extract ảnh từ de2 PDF → public/de2/*.webp  (naming: p10_img1, p11_img1 …)
3. In ra danh sách ảnh đã tạo để build data file
"""
import os, sys
from pathlib import Path
from PIL import Image
import fitz  # PyMuPDF

BASE    = Path(__file__).parent.parent
DE1_DIR = BASE / "public" / "de1"
DE2_PDF = BASE / "docs" / "de2"
DE2_OUT = BASE / "public" / "de2"

DE2_OUT.mkdir(parents=True, exist_ok=True)

# ─── 1. Convert de1 jpeg → webp ──────────────────────────────────────────────
print("=== Chuyển Đề 1 JPEG → WebP ===")
converted = []
for jpeg in sorted(DE1_DIR.glob("*.jpeg")):
    webp = jpeg.with_suffix(".webp")
    with Image.open(jpeg) as img:
        img.save(webp, "webp", quality=85)
    jpeg.unlink()
    converted.append(webp.name)
    print(f"  ✓ {jpeg.name} → {webp.name}")

print(f"  Tổng: {len(converted)} file\n")

# ─── 2. Extract ảnh từ de2 PDFs ───────────────────────────────────────────────
print("=== Extract ảnh Đề 2 ===")
de2_images = {}  # page_num → [img_names]

for pdf_path in sorted(DE2_PDF.glob("page_*.pdf")):
    page_num = int(pdf_path.stem.split("_")[1])
    prefix   = f"p{page_num}"
    doc      = fitz.open(str(pdf_path))

    page_imgs = []
    img_idx = 1
    for page_i in range(len(doc)):
        page = doc[page_i]
        for img in page.get_images(full=True):
            xref = img[0]
            base_image = doc.extract_image(xref)
            raw        = base_image["image"]
            w, h       = base_image["width"], base_image["height"]

            # Bỏ qua icon quá nhỏ (< 30px)
            if w < 30 or h < 30:
                continue

            img_name = f"{prefix}_img{img_idx}.webp"
            out_path = DE2_OUT / img_name

            # Convert sang webp
            from io import BytesIO
            pil_img = Image.open(BytesIO(raw))
            if pil_img.mode in ("RGBA", "P"):
                pil_img = pil_img.convert("RGB")
            pil_img.save(out_path, "webp", quality=85)
            page_imgs.append(img_name)
            img_idx += 1
            print(f"  ✓ {pdf_path.name} → {img_name}  ({w}×{h})")

    de2_images[page_num] = page_imgs
    doc.close()

# ─── 3. In danh sách để copy vào data file ───────────────────────────────────
print("\n=== Danh sách ảnh Đề 2 (dùng để build eps_de2.ts) ===")
for pn in sorted(de2_images):
    imgs = de2_images[pn]
    print(f"  page_{pn}.pdf → {len(imgs)} ảnh: {imgs}")

print("\nDone!")
