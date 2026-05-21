# -*- coding: utf-8 -*-
"""
Extract EPS exam questions AND their associated images from a 2-column Word table.
Output: JSON mapping question number -> image file(s) + full question data
Images saved as: de01_q01_opt1.png, de01_q01_opt2.png, etc.
"""
import json, re, os, zipfile, shutil
from docx import Document
from docx.oxml.ns import qn
from lxml import etree

DOCX_PATH = r"C:\Users\hi\Desktop\code\han\docs\ĐỀ 1 - 6_30 ĐỀ EPS SÁCH MỚI_KTS.docx"
OUT_DIR   = r"C:\Users\hi\Desktop\code\han\docs\eps_q_images"
OUT_JSON  = r"C:\Users\hi\Desktop\code\han\docs\eps_q_mapping.json"
PUBLIC_DIR = r"C:\Users\hi\Desktop\code\han\public\images\eps"

os.makedirs(OUT_DIR, exist_ok=True)

doc = Document(DOCX_PATH)

# ── 1. Extract all images from the zip (original media) ──────────────────────
with zipfile.ZipFile(DOCX_PATH) as z:
    media_files = [n for n in z.namelist() if n.startswith("word/media/")]
    media_map = {}  # rId -> bytes
    rels_xml = z.read("word/_rels/document.xml.rels")
    rels_root = etree.fromstring(rels_xml)
    for rel in rels_root:
        rid  = rel.get("Id")
        tgt  = rel.get("Target")
        if tgt and tgt.startswith("media/"):
            fname = tgt.split("/")[-1]
            full  = "word/" + tgt
            if full in z.namelist():
                media_map[rid] = (fname, z.read(full))

print(f"Total media files: {len(media_map)}")

# ── 2. Find ĐỀ SỐ 01 section ─────────────────────────────────────────────────
def get_text(elem):
    return "".join(t.text or "" for t in elem.iter(qn("w:t")))

def get_rids_in_elem(elem):
    """Return list of rId for all inline images in an XML element."""
    rids = []
    for blip in elem.iter(qn("a:blip")):
        r = blip.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed")
        if r:
            rids.append(r)
    return rids

# ── 3. Parse tables to map LEFT col (questions) ↔ RIGHT col (images) ─────────
Q_RE = re.compile(r"^\s*(\d{1,2})\s*[\.\。]")
EXAM_START_RE = re.compile(r"ĐỀ SỐ 0*1")

in_exam = False
questions = {}   # num -> {text, options, image_rids}
current_q = None

def save_image(rid, q_num, opt_idx, exam="de01"):
    """Save image to OUT_DIR and return public path."""
    if rid not in media_map:
        return None
    fname, data = media_map[rid]
    ext = os.path.splitext(fname)[1].lower()
    out_name = f"{exam}_q{q_num:02d}_opt{opt_idx}{ext}"
    out_path = os.path.join(OUT_DIR, out_name)
    with open(out_path, "wb") as f:
        f.write(data)
    return out_name

# Walk all body-level paragraphs AND table cells
body = doc.element.body

def walk_paragraphs_and_tables(container):
    """Yield (type, element) for paragraphs and tables in order."""
    for child in container:
        tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
        if tag == "p":
            yield ("para", child)
        elif tag == "tbl":
            yield ("table", child)
        elif tag == "sdt":
            # structured document tag - recurse
            for sub in walk_paragraphs_and_tables(child):
                yield sub

print("Scanning document structure...")

# Track which exam section we're in
in_de01 = False
de01_tables = []
de01_paras  = []

for typ, elem in walk_paragraphs_and_tables(body):
    txt = get_text(elem).strip() if typ == "para" else ""
    if EXAM_START_RE.search(txt):
        in_de01 = True
    elif re.search(r"ĐỀ SỐ 0*[2-6]", txt):
        in_de01 = False

    if in_de01:
        if typ == "table":
            de01_tables.append(elem)
        else:
            de01_paras.append((txt, elem))

print(f"ĐỀ SỐ 01: {len(de01_tables)} tables, {len(de01_paras)} paragraphs")

# ── 4. For each table, extract rows and identify left/right columns ───────────
def extract_cell_content(cell_elem):
    """Return (texts, image_rids) from a table cell."""
    texts = []
    rids  = []
    for p in cell_elem.iter(qn("w:p")):
        t = get_text(p).strip()
        if t:
            texts.append(t)
        rids.extend(get_rids_in_elem(p))
    return texts, rids

all_q_data = {}  # question_num (int) -> {q_text, options, image_rids, source}

for tbl_idx, tbl in enumerate(de01_tables):
    rows = tbl.findall(".//" + qn("w:tr"))
    for row in rows:
        cells = row.findall(".//" + qn("w:tc"))
        if len(cells) < 2:
            continue
        left_texts,  left_rids  = extract_cell_content(cells[0])
        right_texts, right_rids = extract_cell_content(cells[1] if len(cells) > 1 else cells[0])

        # Check if left cell has a question number
        for txt in left_texts:
            m = Q_RE.match(txt)
            if m:
                qnum = int(m.group(1))
                if qnum not in all_q_data:
                    all_q_data[qnum] = {
                        "q_text": txt,
                        "all_texts": left_texts,
                        "image_rids": right_rids + left_rids,
                        "table_idx": tbl_idx
                    }
                else:
                    # Add more image rids if found
                    all_q_data[qnum]["image_rids"].extend(right_rids + left_rids)
                break

        # Also check right cell for question numbers
        for txt in right_texts:
            m = Q_RE.match(txt)
            if m:
                qnum = int(m.group(1))
                if qnum not in all_q_data:
                    all_q_data[qnum] = {
                        "q_text": txt,
                        "all_texts": right_texts,
                        "image_rids": left_rids + right_rids,
                        "table_idx": tbl_idx
                    }
                break

print(f"\nFound {len(all_q_data)} questions with table context")

# ── 5. Also scan all paragraphs for image inline with question ────────────────
current_qnum = None
for txt, p_elem in de01_paras:
    m = Q_RE.match(txt)
    if m:
        current_qnum = int(m.group(1))
    if current_qnum:
        rids = get_rids_in_elem(p_elem)
        if rids:
            if current_qnum not in all_q_data:
                all_q_data[current_qnum] = {"q_text": txt, "all_texts": [], "image_rids": [], "table_idx": -1}
            all_q_data[current_qnum]["image_rids"].extend(rids)

# ── 6. Save images and build output JSON ─────────────────────────────────────
output = {}
for qnum in sorted(all_q_data.keys()):
    if qnum < 1 or qnum > 40:
        continue
    data = all_q_data[qnum]
    saved = []
    seen_rids = set()
    opt_idx = 1
    for rid in data["image_rids"]:
        if rid in seen_rids:
            continue
        seen_rids.add(rid)
        fname = save_image(rid, qnum, opt_idx)
        if fname:
            saved.append(fname)
            opt_idx += 1

    output[str(qnum)] = {
        "q_text": data.get("q_text", ""),
        "all_texts": data.get("all_texts", []),
        "images": saved,
        "table_idx": data.get("table_idx", -1)
    }
    img_str = ", ".join(saved) if saved else "(no images)"
    print(f"  Q{qnum:2d}: {img_str}")

with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n✅ Saved {len(output)} questions to {OUT_JSON}")
print(f"✅ Images saved to {OUT_DIR}")
