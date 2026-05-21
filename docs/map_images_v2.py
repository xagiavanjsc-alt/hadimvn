from docx import Document
from docx.oxml.ns import qn
from lxml import etree
import json, os
from PIL import Image

def map_images_v2(docx_path):
    doc = Document(docx_path)
    results = []
    image_counter = 0
    
    # Get all image parts in order they appear in document rels
    image_parts = {}
    for rel in doc.part.rels.values():
        if "image" in rel.target_ref:
            image_parts[rel.rId] = rel.target_ref
    
    # Get images in order from document body
    body = doc.element.body
    
    current_exam = None
    current_q_num = None
    last_known_q_text = None
    
    def process_element(elem, depth=0):
        nonlocal image_counter, current_exam, current_q_num, last_known_q_text
        
        tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
        
        # Check for paragraph text
        if tag == 'p':
            from docx.text.paragraph import Paragraph
            para = Paragraph(elem, doc)
            text = para.text.strip()
            
            if text.startswith('ĐỀ SỐ'):
                current_exam = text
                current_q_num = None
                last_known_q_text = None
            elif text and len(text) > 1 and text[0].isdigit() and '.' in text:
                try:
                    q_num = int(text.split('.')[0])
                    if 1 <= q_num <= 40:
                        current_q_num = q_num
                        last_known_q_text = text
                except:
                    pass
        
        # Check for inline images (blip element contains the image rId)
        elif tag == 'blip':
            rId = elem.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
            image_counter += 1
            results.append({
                'image_index': image_counter,
                'rId': rId,
                'exam': current_exam,
                'question_num': current_q_num,
                'question_text': last_known_q_text[:80] if last_known_q_text else None
            })
        
        for child in elem:
            process_element(child, depth + 1)
    
    process_element(body)
    return results

def analyze_images(mappings, image_dir):
    """Add image dimensions to help identify image type"""
    for m in mappings:
        if m['exam'] is None:
            continue
        img_path = os.path.join(image_dir, m['image_index'].__str__())
        # Find the actual file
        for ext in ['.webp', '.png', '.jpg', '.jpeg']:
            path = os.path.join(image_dir, f"image_{m['image_index']}{ext}")
            if os.path.exists(path):
                try:
                    with Image.open(path) as img:
                        m['width'], m['height'] = img.size
                except:
                    pass
                break

if __name__ == '__main__':
    docx_path = r"C:\Users\hi\Desktop\code\han\docs\ĐỀ 1 - 6_30 ĐỀ EPS SÁCH MỚI_KTS.docx"
    image_dir = r"C:\Users\hi\Desktop\code\han\docs\eps_images_original"
    
    mappings = map_images_v2(docx_path)
    analyze_images(mappings, image_dir)
    
    # Print ĐỀ SỐ 01 only
    print(f"Total images: {len(mappings)}")
    print(f"\n=== ĐỀ SỐ 01 IMAGES ===")
    print(f"{'IMG':>5} | {'Q#':>4} | {'W':>5} | {'H':>5} | QUESTION TEXT")
    print('-' * 90)
    
    de01 = [m for m in mappings if m['exam'] == 'ĐỀ SỐ 01']
    for m in de01:
        w = m.get('width', '?')
        h = m.get('height', '?')
        print(f"{m['image_index']:>5} | {str(m['question_num'] or ''):>4} | {str(w):>5} | {str(h):>5} | {str(m['question_text'] or '')[:55]}")
    
    print(f"\nTotal images for ĐỀ SỐ 01: {len(de01)}")
    
    # Save
    with open(r"C:\Users\hi\Desktop\code\han\docs\image_map.json", 'w', encoding='utf-8') as f:
        json.dump(mappings, f, ensure_ascii=False, indent=2)
