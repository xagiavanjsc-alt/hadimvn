"""
Trích xuất ảnh theo cấu trúc bảng trong Word document.
Ảnh trong cùng 1 bảng → cùng 1 nhóm câu hỏi.
"""
from docx import Document
from docx.oxml.ns import qn
from lxml import etree
import json, os
from PIL import Image

def get_image_index_in_doc(doc):
    """Lấy danh sách tất cả blip elements theo thứ tự trong document"""
    body = doc.element.body
    blips = []
    for elem in body.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}blip'):
        rId = elem.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
        blips.append(rId)
    return blips

def process_table_images(doc, blip_order):
    """Map each blip to its table context"""
    blip_to_table = {}
    blip_counter = [0]
    table_counter = [0]
    current_exam = [None]
    
    body = doc.element.body
    
    def find_blips_in_element(elem):
        """Recursively find all blips in an element"""
        found = []
        for e in elem.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}blip'):
            rId = e.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
            found.append(rId)
        return found
    
    def get_para_text(elem):
        texts = []
        for t in elem.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
            if t.text:
                texts.append(t.text)
        return ''.join(texts).strip()
    
    results = []
    
    for child in body:
        tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
        
        if tag == 'p':
            text = get_para_text(child)
            if text.startswith('ĐỀ SỐ'):
                current_exam[0] = text
            
            # Check for images in paragraph (inline images)
            para_blips = find_blips_in_element(child)
            if para_blips:
                blip_counter[0] += 1
                blip_counter[0] = blip_order.index(para_blips[0]) + 1 if para_blips[0] in blip_order else blip_counter[0]
                for b in para_blips:
                    idx = blip_order.index(b) + 1 if b in blip_order else -1
                    results.append({
                        'image_index': idx,
                        'location': 'paragraph',
                        'table_id': None,
                        'exam': current_exam[0],
                        'para_text': text[:60] if text else None
                    })
        
        elif tag == 'tbl':
            table_counter[0] += 1
            tbl_id = table_counter[0]
            
            # Get all blips in this table
            tbl_blips = find_blips_in_element(child)
            
            # Get all text in cells
            all_cell_texts = []
            for cell in child.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tc'):
                cell_text = get_para_text(cell)
                if cell_text:
                    all_cell_texts.append(cell_text)
            
            context = ' | '.join(all_cell_texts[:4])[:80] if all_cell_texts else ''
            
            for b in tbl_blips:
                idx = blip_order.index(b) + 1 if b in blip_order else -1
                results.append({
                    'image_index': idx,
                    'location': f'table_{tbl_id}',
                    'table_id': tbl_id,
                    'exam': current_exam[0],
                    'para_text': context
                })
    
    return results

if __name__ == '__main__':
    docx_path = r"C:\Users\hi\Desktop\code\han\docs\ĐỀ 1 - 6_30 ĐỀ EPS SÁCH MỚI_KTS.docx"
    
    doc = Document(docx_path)
    blip_order = get_image_index_in_doc(doc)
    results = process_table_images(doc, blip_order)
    
    # Filter ĐỀ SỐ 01
    de01 = [r for r in results if r['exam'] == 'ĐỀ SỐ 01']
    
    print(f"ĐỀ SỐ 01 images: {len(de01)}\n")
    print(f"{'IMG':>5} | {'TABLE':>12} | CONTEXT")
    print('-'*80)
    
    # Group by table
    by_table = {}
    for r in de01:
        loc = r['location']
        if loc not in by_table:
            by_table[loc] = []
        by_table[loc].append(r)
    
    for loc, imgs in by_table.items():
        idx_list = [str(i['image_index']) for i in imgs]
        ctx = imgs[0]['para_text'] or ''
        print(f"[{loc}] images: {', '.join(idx_list)}")
        print(f"         context: {ctx[:70]}")
        print()
    
    # Save
    with open(r"C:\Users\hi\Desktop\code\han\docs\image_map_by_table.json", 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
