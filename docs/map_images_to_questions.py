from docx import Document
from docx.oxml.ns import qn
from lxml import etree
import json, os

def map_images_to_questions(docx_path):
    doc = Document(docx_path)
    
    # Build a map: image_index -> context (surrounding text)
    results = []
    
    image_counter = 0
    current_exam = None
    current_q_num = None
    current_q_text = None
    
    # Iterate ALL body elements in order
    body = doc.element.body
    for element in body.iter():
        tag = element.tag.split('}')[-1] if '}' in element.tag else element.tag
        
        # Paragraph text
        if tag == 'p':
            from docx.text.paragraph import Paragraph
            para = Paragraph(element, doc)
            text = para.text.strip()
            
            if text.startswith('ĐỀ SỐ'):
                current_exam = text
                current_q_num = None
                current_q_text = None
            
            elif text and len(text) > 1 and text[0].isdigit() and text[1] == '.':
                q_num = int(text.split('.')[0])
                if 1 <= q_num <= 40:
                    current_q_num = q_num
                    current_q_text = text
        
        # Inline image
        elif tag == 'blip':
            image_counter += 1
            results.append({
                'image_index': image_counter,
                'image_file': f'image_{image_counter}.webp',
                'exam': current_exam,
                'question_num': current_q_num,
                'question_text': current_q_text[:80] if current_q_text else None
            })
    
    return results

if __name__ == '__main__':
    docx_path = r"C:\Users\hi\Desktop\code\han\docs\ĐỀ 1 - 6_30 ĐỀ EPS SÁCH MỚI_KTS.docx"
    mappings = map_images_to_questions(docx_path)
    
    # Save full mapping
    with open(r"C:\Users\hi\Desktop\code\han\docs\image_map.json", 'w', encoding='utf-8') as f:
        json.dump(mappings, f, ensure_ascii=False, indent=2)
    
    # Print first 60 (exam 1 + exam 2 start)
    print(f"Total images mapped: {len(mappings)}\n")
    print(f"{'IMG':>5} | {'EXAM':^12} | {'Q#':>3} | QUESTION TEXT")
    print('-' * 80)
    for m in mappings[:60]:
        print(f"{m['image_index']:>5} | {str(m['exam']):^12} | {str(m['question_num'] or ''):>3} | {str(m['question_text'] or '')[:50]}")
