"""Extract actual Q1 and Q2 reading section question texts from Word doc"""
from docx import Document
import sys
sys.stdout.reconfigure(encoding='utf-8')

DOCX_PATH = r"C:\Users\hi\Desktop\code\han\docs\ĐỀ 1 - 6_30 ĐỀ EPS SÁCH MỚI_KTS.docx"
doc = Document(DOCX_PATH)
body = doc.element.body

def get_para_text(elem):
    texts = []
    for t in elem.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
        if t.text:
            texts.append(t.text)
    return ''.join(texts).strip()

# Collect paragraphs around ĐỀ SỐ 01 and reading section
found_de01 = False
para_list = []

for elem in body.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
    text = get_para_text(elem)
    if text:
        if 'ĐỀ SỐ 01' in text:
            found_de01 = True
        if found_de01:
            para_list.append(text)
            if len(para_list) > 80:
                break

out = r"C:\Users\hi\Desktop\code\han\docs\de01_paragraphs.txt"
with open(out, 'w', encoding='utf-8') as f:
    for i, p in enumerate(para_list[:80]):
        f.write(f"{i:3}. {p[:100]}\n")
print(f"Saved to {out}")
