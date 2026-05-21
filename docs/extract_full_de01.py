"""Extract all paragraphs for ĐỀ SỐ 01 reading AND listening section"""
from docx import Document

DOCX_PATH = r"C:\Users\hi\Desktop\code\han\docs\ĐỀ 1 - 6_30 ĐỀ EPS SÁCH MỚI_KTS.docx"
doc = Document(DOCX_PATH)
body = doc.element.body

def get_para_text(elem):
    texts = []
    for t in elem.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
        if t.text:
            texts.append(t.text)
    return ''.join(texts).strip()

found_de01 = False
found_de02 = False
para_list = []

for elem in body.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
    text = get_para_text(elem)
    if text:
        if 'ĐỀ SỐ 01' in text:
            found_de01 = True
        if found_de01 and 'ĐỀ SỐ 02' in text:
            found_de02 = True
            break
        if found_de01:
            para_list.append(text)

out = r"C:\Users\hi\Desktop\code\han\docs\de01_all_paragraphs.txt"
with open(out, 'w', encoding='utf-8') as f:
    for i, p in enumerate(para_list):
        f.write(f"{i:4}. {p[:120]}\n")

print(f"Total paragraphs: {len(para_list)}")
print(f"Saved to {out}")
