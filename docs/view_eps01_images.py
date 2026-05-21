"""Generate HTML to visually inspect all images for Đề 1"""
import json, os

with open(r"C:\Users\hi\Desktop\code\han\docs\image_map.json", encoding='utf-8') as f:
    mappings = json.load(f)

de01 = [m for m in mappings if m['exam'] == 'ĐỀ SỐ 01']

html = """<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>ĐỀ SỐ 01 - Images</title>
<style>
body { font-family: sans-serif; background:#1a1a2e; color:#eee; padding:20px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.card { background:#16213e; border-radius:12px; padding:12px; text-align:center; }
.card img { max-width:100%; max-height:180px; border-radius:8px; }
.card .num { font-size:18px; font-weight:bold; color:#4fc3f7; margin-bottom:6px; }
.card .ctx { font-size:11px; color:#aaa; margin-top:6px; word-break:break-all; }
h2 { color:#4fc3f7; margin-top:30px; }
</style>
</head><body>
<h1>ĐỀ SỐ 01 - Tất cả ảnh (theo thứ tự)</h1>
<div class="grid">
"""

for m in de01:
    img_path = f"../public/images/eps/image_{m['image_index']}.webp"
    ctx = (m['question_text'] or 'N/A')[:60]
    html += f"""
  <div class="card">
    <div class="num">image_{m['image_index']}</div>
    <img src="{img_path}" alt="image_{m['image_index']}" onerror="this.style.opacity=0.3">
    <div class="ctx">{ctx}</div>
  </div>
"""

html += "</div></body></html>"

out = r"C:\Users\hi\Desktop\code\han\docs\de01_images.html"
with open(out, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Generated: {out}")
print(f"Open this file in browser to see all {len(de01)} images for Đề 1")
