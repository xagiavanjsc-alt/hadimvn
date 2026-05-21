"""Phân tích toàn bộ ảnh: kích thước, nhóm theo aspect ratio"""
from PIL import Image
import os, json

image_dir = r"C:\Users\hi\Desktop\code\han\docs\eps_images_original"
files = sorted(
    [f for f in os.listdir(image_dir) if not f.startswith('.')],
    key=lambda x: int(''.join(filter(str.isdigit, x.split('.')[0])) or 0)
)

results = []
for f in files:
    path = os.path.join(image_dir, f)
    try:
        with Image.open(path) as img:
            w, h = img.size
            ar = round(w/h, 2)
            results.append({'file': f, 'w': w, 'h': h, 'ar': ar})
    except:
        pass

# Print all, flag potential composite images (wide and containing 4 panels)
print(f"{'FILE':>20} | {'W':>6} | {'H':>6} | {'RATIO':>6} | NOTE")
print('-'*70)
for r in results:
    note = ''
    # Wide composite images (likely 4-panel): ratio > 2.5 and not very thin
    if r['ar'] > 2.5 and r['h'] > 80:
        note = '← POSSIBLE 4-PANEL COMPOSITE'
    # Square-ish small options
    elif 0.8 <= r['ar'] <= 1.25 and r['w'] < 250:
        note = '← SMALL SQUARE (option?)'
    # Very thin lines
    elif r['h'] < 30:
        note = '← SEPARATOR LINE'
    print(f"{r['file']:>20} | {r['w']:>6} | {r['h']:>6} | {r['ar']:>6} | {note}")

# Show files with ratio > 2.5 and h > 80 separately
print("\n\n=== WIDE COMPOSITE CANDIDATES ===")
composites = [r for r in results if r['ar'] > 2.5 and r['h'] > 80]
for r in composites:
    print(f"  {r['file']} → {r['w']}x{r['h']} (ratio {r['ar']})")
