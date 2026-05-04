# Ý tưởng phát triển EPS-TOPIK & Hán Hàn chuyên sâu

## Features Hanja hiện có

Từ code analysis, hệ thống đã có:
- ✅ Hanja Dashboard với learning tree
- ✅ Hanja Vocab với nhiều tabs:
  - Pronunciation Tab (phát âm)
  - Homophone Tab (đồng âm)
  - Synonym Group Tab (đồng nghĩa)
  - Antonym Tab (trái nghĩa)
  - HanViet Compare Tab (so sánh Hán Việt)
  - Smart Search Tab (tìm kiếm thông minh)
  - Study Diary Tab (nhật ký học)
  - Topik Mock Exam Tab (đề thi thử)
  - Weekly Leaderboard Tab (bảng xếp hạng tuần)
  - Word Match Tab (ghép từ)
  - Weekly Challenge Tab (thử thách tuần)
  - Topic Study Tab (học theo chủ đề)
  - Stats Tab (thống kê)
  - Smart Review Tab (ôn tập thông minh)
  - Quick Review Tab (ôn nhanh)
  - Personal Ranking Tab (xếp hạng cá nhân)
  - Flashcard Export Tab (xuất flashcard)
  - Advanced Topic Tab (chủ đề nâng cao)
- ✅ Hanja Tree (cây học Hanja)
- ✅ Hanja Pro (Hanja nâng cao)
- ✅ Hanja Analytics (phân tích Hanja)

**Đánh giá:** Hệ thống đã có nền tảng Hanja rất mạnh, đa dạng features.

---

## Ý tưởng phát triển thêm cho EPS-TOPIK & Hán Hàn chuyên sâu

### 1. Hán Hàn cho EPS-TOPIK (Priority: Cao)

**Vấn đề:** EPS-TOPIK yêu cầu hiểu Hán Hàn để đoán nghĩa từ mới, nhưng chưa có feature kết nối trực tiếp.

**Giải pháp:**

#### a. Hán Hàn trong đề EPS-TOPIK
- Khi làm đề EPS, highlight các từ có Hán Hàn
- Click vào từ → hiện Hán Hàn + nghĩa Hán Việt
- Quiz: "Đây là từ Hán Hàn với nghĩa X, chọn nghĩa tiếng Hàn"
- Practice: Đoán nghĩa từ mới dựa trên Hán Hàn

#### b. Từ vựng EPS theo bộ thủ Hán Hàn
- Group từ vựng EPS theo bộ thủ (radical)
- Ví dụ: Nhóm 人 (người): 人間, 人口, 大人, 女人
- Quiz: "Từ nào có bộ thủ X?"
- Flashcard theo bộ thủ

#### c. Hán Việt ↔ EPS-TOPIK
- Quiz: "Từ Hán Việt X tương đương với từ Hàn Quốc nào?"
- Ví dụ: "Học sinh" ↔ "학생"
- "Công nhân" ↔ "공인"
- Practice 200 từ Hán Việt phổ biến trong EPS

#### d. Đoán nghĩa từ mới với Hán Hàn
- Quiz cho từ mới chưa học
- Hiện Hán Hàn của từng chữ
- User đoán nghĩa từ
- Giải thích: "A + B = AB"
- Ví dụ: "學 (học) + 校 (trường) = 學校 (trường học)"

---

### 2. Hán Hàn nâng cao (Priority: Trung bình)

#### a. Cây gia đình chữ Hán (Character Family Tree)
- Hiển thị quan hệ giữa các chữ Hán
- Ví dụ: 人 → 仁, 仇, 仙, 仮
- Quiz: "Chữ nào có bộ thủ X?"
- Learn path: Học bộ thủ → học chữ có bộ thủ đó

#### b. Hán Hàn theo chủ đề EPS-TOPIK
- Chủ đề: Công việc (工作, 事業, 職業)
- Chủ đề: Gia đình (家族, 父母, 子女)
- Chủ đề: Thời gian (時間, 週間, 年間)
- Quiz theo chủ đề

#### c. Hán Hàn trong ngữ cảnh
- Hiện câu ví dụ từ đề EPS-TOPIK thật
- Highlight Hán Hàn trong câu
- Quiz: "Đoán nghĩa câu dựa trên Hán Hàn"

#### d. Hán Hàn + Grammar
- Grammar pattern với Hán Hàn
- Ví dụ: "-(으)ㄹ 수 있다" (có thể làm)
- Giải thích: 수 (số/khả năng) + 있다 (có)
- Quiz: "Pattern này dùng Hán Hàn nào?"

---

### 3. EPS-TOPIK Mock Exam với Hán Hàn (Priority: Cao)

#### a. Đề thi thử chuyên Hán Hàn
- Đề EPS với focus vào từ có Hán Hàn
- Sau khi làm, hiện phân tích Hán Hàn
- Statistics: Bạn đã biết bao nhiêu % Hán Hàn trong đề

#### b. Weakness Analysis cho Hán Hàn
- Phân tích bạn yếu ở bộ thủ nào
- Weakness: Bạn thường sai từ có bộ thủ X
- Recommend: Học thêm các từ có bộ thủ X

#### c. Smart Review cho Hán Hàn
- SR system ưu tiên từ có Hán Hàn
- Quiz Hán Hàn trước từ thường
- Spaced repetition cho Hán Hàn

---

### 4. Gamification cho Hán Hàn (Priority: Trung bình)

#### a. Hanja Streak
- Streak riêng cho Hanja
- "Học 10 Hanja mỗi ngày"
- Bonus XP cho Hanja

#### b. Hanja Leaderboard
- Leaderboard riêng cho Hanja
- Weekly challenge: "Ai học nhiều Hanja nhất?"
- Rank dựa trên số Hanja đã học

#### c. Hanja Achievements
- "Học 100 Hanja" → Badge
- "Học 500 Hanja" → Badge
- "Master 10 bộ thủ" → Badge
- "Đoán đúng 100 từ mới dựa trên Hán Hàn" → Badge

#### d. Hanja Battle
- 1v1 battle với Hanja quiz
- "Ai đoán nghĩa từ mới nhanh hơn?"
- "Ai biết nhiều Hán Việt hơn?"

---

### 5. AI-powered Hanja Learning (Priority: Cao)

#### a. AI giải thích Hán Hàn
- User nhập từ → AI giải thích Hán Hàn
- "Từ này có cấu trúc: A + B = AB"
- "Từ này tương đương Hán Việt: X"

#### b. AI tạo quiz Hán Hàn
- Tự động tạo quiz dựa trên level
- Quiz đoán nghĩa từ mới
- Quiz ghép từ Hán Hàn

#### c. AI recommendation
- "Bạn nên học Hanja này vì nó xuất hiện trong EPS-TOPIK"
- "Bạn yếu bộ thủ X, hãy học thêm các từ có bộ thủ này"

---

### 6. Hán Hàn Offline (Priority: Trung bình)

#### a. Hanja Offline Pack
- Download pack Hanja để học offline
- 500 Hanja phổ biến nhất trong EPS
- Flashcard offline cho Hanja

#### b. Hanja Dictionary Offline
- Dictionary Hanja offline
- Tìm kiếm Hanja không cần mạng

---

### 7. Hán Hàn cho người mới (Priority: Trung bình)

#### a. Hanja Basics Course
- Course cho người chưa biết Hanja
- Học 50 bộ thủ cơ bản
- Học 100 Hanja phổ biến nhất
- Quiz cơ bản

#### b. Hanja Visual Learning
- Hiển thị hình ảnh cho Hanja
- Ví dụ: 人 → hình người
- 川 → hình con sông
- Mountain → 山 → hình núi

---

## So sánh tên miền

### hadim.vn

**Ưu điểm:**
- ✅ Ngắn hơn (5 chữ cái vs 11 chữ cái)
- ✅ Dễ nhớ, dễ gõ
- ✅ Unique, ít trùng lặp
- ✅ Ngắn gọn, phù hợp mobile

**Nhược điểm:**
- ❌ Không rõ nghĩa (không biết là gì)
- ❌ Không liên quan đến "Hàn Quốc" hay "Hán Hàn"
- ❌ Khó marketing (không biết bán cái gì)
- ❌ Không professional

### hanquocoi.vn

**Ưu điểm:**
- ✅ Rõ nghĩa: "Hàn Quốc Ơi"
- ✅ Phù hợp với brand name
- ✅ Dễ marketing (biết là app học tiếng Hàn)
- ✅ Professional, trust
- ✅ Liên quan trực tiếp đến mục tiêu (học tiếng Hàn)
- ✅ Dễ SEO (từ khóa "Hàn Quốc")

**Nhược điểm:**
- ❌ Dài hơn (11 chữ cái)
- ❌ Khó gõ hơn một chút
- ❌ Có thể bị trùng với các domain khác

---

## Khuyến nghị

### Về tên miền: **hanquocoi.vn** phù hợp hơn

**Lý do:**
1. **Rõ nghĩa:** User nhìn tên là biết là app học tiếng Hàn
2. **Marketing:** Dễ quảng cáo, dễ SEO
3. **Trust:** Professional hơn, user tin tưởng hơn
4. **Brand:** Phù hợp với brand name "Hàn Quốc Ơi!"
5. **SEO:** Từ khóa "Hàn Quốc" trong domain giúp SEO
6. **Target audience:** Người muốn học tiếng Hàn sẽ search "Hàn Quốc"

**hadim.vn chỉ phù hợp nếu:**
- Bạn muốn brand ngắn gọn như "Google", "Yahoo"
- Bạn có ngân sách marketing lớn để xây dựng brand từ zero
- Bạn không quan tâm SEO

---

### Về phát triển Hán Hàn & EPS-TOPIK

**Priority 1 (Ngay lập tức):**
1. Hán Hàn trong đề EPS-TOPIK (highlight, quiz)
2. Từ vựng EPS theo bộ thủ
3. Hán Việt ↔ EPS-TOPIK quiz
4. Đoán nghĩa từ mới với Hán Hàn

**Priority 2 (1-2 tháng):**
1. Đề thi thử chuyên Hán Hàn
2. Weakness Analysis cho Hán Hàn
3. Hanja Achievements
4. AI giải thích Hán Hàn

**Priority 3 (3-6 tháng):**
1. Cây gia đình chữ Hán
2. Hán Hàn theo chủ đề EPS
3. Hanja Battle
4. Hanja Offline Pack

---

## Kết luận

**Tên miền:** Dùng **hanquocoi.vn** vì rõ nghĩa, dễ marketing, phù hợp với brand.

**Phát triển Hán Hàn:** Hệ thống đã có nền tảng rất tốt. Nên tập trung vào:
1. Kết nối Hán Hàn với EPS-TOPIK (priority cao nhất)
2. Gamification cho Hán Hàn
3. AI-powered learning
4. Offline support

**Lợi thế cạnh tranh:** Hán Hàn + EPS-TOPIK là combo độc nhất không đối thủ nào có. Đây là "moat" (lợi thế bảo vệ) cho Hàn Quốc Ơi!
