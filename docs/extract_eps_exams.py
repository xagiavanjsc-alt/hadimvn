from docx import Document
import json

def extract_eps_exams(docx_path, num_exams=6):
    doc = Document(docx_path)
    paragraphs = [p.text for p in doc.paragraphs]
    
    exams = []
    current_exam = None
    current_question = None
    in_exam = False
    expecting_options = False
    
    i = 0
    while i < len(paragraphs):
        para = paragraphs[i].strip()
        
        # Detect exam header
        if para.startswith("ĐỀ SỐ"):
            if current_exam and len(current_exam["questions"]) > 0:
                exams.append(current_exam)
                if len(exams) >= num_exams:
                    break
            exam_num = para.split()[-1]
            current_exam = {
                "id": f"eps_{exam_num.zfill(2)}",
                "title": f"ĐỀ SỐ {exam_num}",
                "questions": []
            }
            in_exam = True
            expecting_options = False
            i += 1
            continue
        
        # Skip table of contents and non-exam content
        if not in_exam or not para or para in ["MỤC LỤC", "Mục lục", "Chúc các bạn thành công!"]:
            i += 1
            continue
        
        # Stop if we hit listening section
        if "Kịch bản" in para or "nghe" in para.lower():
            if current_exam and len(current_exam["questions"]) > 0:
                exams.append(current_exam)
            break
        
        # Detect question number (1., 2., 3., etc.) - only if not currently in options
        if para and len(para) > 1 and para[0].isdigit() and para[1] == '.' and not expecting_options:
            if current_question and current_question["question"] and current_question["question"] != para:
                current_exam["questions"].append(current_question)
            q_num = para.split('.')[0]
            current_question = {
                "id": f"q{q_num}",
                "number": int(q_num),
                "question": para,
                "options": [],
                "correct_answer": None,
                "image": None
            }
            # Check if this is a picture question
            if "그림" in para or "picture" in para.lower():
                current_question["image"] = f"/images/eps/{current_exam['id']}/q{q_num}.jpg"
            expecting_options = True
            i += 1
            continue
        
        # Collect options (1., 2., 3., 4.)
        if current_question and expecting_options and para in ["1.", "2.", "3.", "4."]:
            # Next line is the option text
            if i + 1 < len(paragraphs):
                option_text = paragraphs[i + 1].strip()
                if option_text and option_text not in ["1.", "2.", "3.", "4."]:
                    current_question["options"].append(option_text)
            i += 1
            continue
        
        # Stop expecting options after 4 options or when we hit next question
        if expecting_options and current_question and len(current_question["options"]) >= 4:
            expecting_options = False
        
        # Add context to question if it's not an option and we're not expecting options
        if current_question and para and not expecting_options and para[0].isdigit() == False:
            current_question["question"] += " " + para
        
        i += 1
    
    # Add the last exam
    if current_exam and len(current_exam["questions"]) > 0:
        exams.append(current_exam)
    
    return exams[:num_exams]

if __name__ == "__main__":
    docx_path = r"C:\Users\hi\Desktop\code\han\docs\ĐỀ 1 - 6_30 ĐỀ EPS SÁCH MỚI_KTS.docx"
    exams = extract_eps_exams(docx_path, num_exams=6)
    
    # Save to JSON
    output_path = r"C:\Users\hi\Desktop\code\han\docs\eps_exams_6.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(exams, f, ensure_ascii=False, indent=2)
    
    print(f"Extracted {len(exams)} exams to {output_path}")
    for exam in exams:
        print(f"{exam['title']}: {len(exam['questions'])} questions")


