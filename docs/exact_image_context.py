"""
Trích xuất ảnh với context text TRƯỚC và SAU mỗi ảnh.
Đây là cách duy nhất để xác định chính xác ảnh nào thuộc câu hỏi nào.
"""
from docx import Document
from docx.oxml.ns import qn
from lxml import etree
import json, os

DOCX_PATH = r"C:\Users\hi\Desktop\code\han\docs\ĐỀ 1 - 6_30 ĐỀ EPS SÁCH MỚI_KTS.docx"

def get_all_text_in_element(elem):
    texts = []
    for t in elem.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
        if t.text:
            texts.append(t.text)
    return ''.join(texts).strip()

def process_document():
    doc = Document(DOCX_PATH)
    body = doc.element.body
    
    # Collect all "events" (text paragraphs and images) in document order
    events = []
    img_counter = [0]
    
    def process_element(elem, depth=0):
        tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
        
        if tag == 'p':
            # Check for blip (image) in this paragraph first
            blips_in_para = list(elem.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}blip'))
            para_text = get_all_text_in_element(elem)
            
            if blips_in_para and para_text:
                # Has both text and image
                events.append({'type': 'text', 'content': para_text, 'depth': depth})
                for b in blips_in_para:
                    img_counter[0] += 1
                    rId = b.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed', '')
                    events.append({'type': 'image', 'index': img_counter[0], 'rId': rId[:20], 'depth': depth})
            elif blips_in_para:
                for b in blips_in_para:
                    img_counter[0] += 1
                    rId = b.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed', '')
                    events.append({'type': 'image', 'index': img_counter[0], 'rId': rId[:20], 'depth': depth})
            elif para_text:
                events.append({'type': 'text', 'content': para_text, 'depth': depth})
        
        elif tag == 'tbl':
            # Process table cells individually
            for row in elem.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tr'):
                events.append({'type': 'row_start', 'depth': depth})
                for cell in row.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tc'):
                    events.append({'type': 'cell_start', 'depth': depth})
                    for child in cell:
                        process_element(child, depth+1)
                    events.append({'type': 'cell_end', 'depth': depth})
                events.append({'type': 'row_end', 'depth': depth})
        else:
            for child in elem:
                process_element(child, depth)
    
    for child in body:
        process_element(child, 0)
    
    return events

def format_output(events):
    """Show each image with 3 items before and 3 items after"""
    image_events = [(i, e) for i, e in enumerate(events) if e['type'] == 'image']
    
    results = []
    for pos, (i, ev) in enumerate(image_events):
        # Get context: 3 text events before this image
        before_texts = []
        for j in range(i-1, max(0, i-15), -1):
            if events[j]['type'] == 'text':
                before_texts.insert(0, events[j]['content'][:50])
                if len(before_texts) >= 3:
                    break
        
        # Get context: 3 text events after this image
        after_texts = []
        for j in range(i+1, min(len(events), i+15)):
            if events[j]['type'] == 'text':
                after_texts.append(events[j]['content'][:50])
                if len(after_texts) >= 3:
                    break
        
        results.append({
            'image_index': ev['index'],
            'before': before_texts,
            'after': after_texts
        })
    
    return results

if __name__ == '__main__':
    import sys
    sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None
    
    print("Processing document...")
    events = process_document()
    results = format_output(events)
    
    # Write text report
    out_txt = r"C:\Users\hi\Desktop\code\han\docs\image_exact_context.txt"
    with open(out_txt, 'w', encoding='utf-8') as f:
        f.write(f"Total images: {len(results)}\n")
        f.write("=" * 70 + "\n")
        for r in results:
            idx = r['image_index']
            f.write(f"\n[IMAGE {idx}]\n")
            for t in r['before']:
                f.write(f"  BEFORE: {t}\n")
            f.write(f"  >>> image_{idx} <<<\n")
            for t in r['after']:
                f.write(f"  AFTER:  {t}\n")
    
    # Save to JSON
    out_path = r"C:\Users\hi\Desktop\code\han\docs\image_exact_context.json"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"Done! {len(results)} images. Saved to:")
    print(f"  {out_txt}")
    print(f"  {out_path}")
