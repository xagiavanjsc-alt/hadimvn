# -*- coding: utf-8 -*-
"""
Generates a self-contained HTML page showing all EPS images
grouped by their context from image_exact_context.txt.
Open the HTML in browser to visually verify which image belongs to which question.
"""
import re, base64, os

CONTEXT_FILE = r"C:\Users\hi\Desktop\code\han\docs\image_exact_context.txt"
IMAGES_DIR   = r"C:\Users\hi\Desktop\code\han\public\images\eps"
OUT_HTML     = r"C:\Users\hi\Desktop\code\han\docs\image_review.html"

# ── Parse context file ────────────────────────────────────────────────────────
with open(CONTEXT_FILE, encoding="utf-8") as f:
    content = f.read()

blocks = re.split(r'\[IMAGE (\d+)\]', content)[1:]
images = []
for i in range(0, len(blocks), 2):
    num   = int(blocks[i])
    body  = blocks[i+1]
    befores = re.findall(r'BEFORE:\s*(.+)', body)
    afters  = re.findall(r'AFTER:\s*(.+)',  body)
    images.append({"num": num, "before": befores, "after": afters})

# ── Figure out which exam each image belongs to ───────────────────────────────
# images 1-19: cover/intro
# image 20+: ĐỀ SỐ 01 start (AFTER contains "ĐỀ SỐ 01")
# Find where each exam starts by looking for ĐỀ SỐ XX in AFTER context
exam_of = {}
current_exam = "INTRO"
for img in images:
    all_text = " ".join(img["before"] + img["after"])
    m = re.search(r'ĐỀ SỐ 0?(\d)', all_text)
    if m:
        current_exam = f"ĐỀ {m.group(1).zfill(2)}"
    exam_of[img["num"]] = current_exam

# ── Group images by exam ──────────────────────────────────────────────────────
from collections import defaultdict
by_exam = defaultdict(list)
for img in images:
    by_exam[exam_of[img["num"]]].append(img)

# ── Load images as base64 ────────────────────────────────────────────────────
def img_b64(n):
    path = os.path.join(IMAGES_DIR, f"image_{n}.webp")
    if not os.path.exists(path):
        return None
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

# ── Build HTML ─────────────────────────────────────────────────────────────────
html_parts = ["""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>EPS Image Review</title>
<style>
body { font-family: sans-serif; background: #1a1a2e; color: #eee; margin: 0; padding: 16px; }
h1 { color: #00d4ff; }
h2 { color: #f7c948; border-bottom: 2px solid #f7c948; padding-bottom: 4px; }
.grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 32px; }
.card { background: #16213e; border: 2px solid #0f3460; border-radius: 10px; padding: 10px; width: 200px; font-size: 12px; }
.card img { width: 180px; height: 140px; object-fit: contain; background: white; border-radius: 6px; display: block; }
.card.blank img { background: #333; }
.num  { font-size: 18px; font-weight: bold; color: #00d4ff; margin-bottom: 4px; }
.ctx  { color: #aaa; font-size: 11px; margin-top: 6px; line-height: 1.4; max-height: 80px; overflow: hidden; }
.before { color: #f7c948; }
.after  { color: #7fff7f; }
</style>
</head>
<body>
<h1>EPS Image Review — Visual Mapping Tool</h1>
<p style="color:#aaa">Màu vàng = text TRƯỚC ảnh trong XML | Màu xanh lá = text SAU ảnh trong XML</p>
"""]

EXAM_ORDER = sorted(by_exam.keys())

for exam in EXAM_ORDER:
    imgs = by_exam[exam]
    html_parts.append(f'<h2>{exam} — {len(imgs)} ảnh (image_{imgs[0]["num"]} → image_{imgs[-1]["num"]})</h2>')
    html_parts.append('<div class="grid">')
    for img in imgs:
        b64 = img_b64(img["num"])
        before_html = "<br>".join(img["before"][-3:]) if img["before"] else ""
        after_html  = "<br>".join(img["after"][:3])   if img["after"]  else ""
        if b64:
            img_tag = f'<img src="data:image/webp;base64,{b64}" />'
            card_cls = "card"
        else:
            img_tag = '<img />'
            card_cls = "card blank"
        html_parts.append(f'''<div class="{card_cls}">
  <div class="num">#{img["num"]}</div>
  {img_tag}
  <div class="ctx">
    <span class="before">{before_html}</span>
    {'<hr style="border-color:#333;margin:3px 0">' if before_html and after_html else ''}
    <span class="after">{after_html}</span>
  </div>
</div>''')
    html_parts.append('</div>')

html_parts.append('</body></html>')

with open(OUT_HTML, "w", encoding="utf-8") as f:
    f.write("\n".join(html_parts))

print(f"✅ Generated: {OUT_HTML}")
print(f"   Open in browser to visually verify all {len(images)} images")
