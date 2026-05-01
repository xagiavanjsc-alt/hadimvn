import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface ReadingPassage {
  id: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  title: string;
  titleVi: string;
  topic: string;
  readingTime: number; // minutes
  wordCount: number;
  text: string;
  textVi: string;
  vocabulary: { word: string; meaning: string; pronunciation: string }[];
  questions: Question[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const passages: ReadingPassage[] = [
  {
    id: "a1-1",
    level: "A1",
    title: "나의 가족",
    titleVi: "Gia đình của tôi",
    topic: "Gia đình",
    readingTime: 2,
    wordCount: 80,
    text: `저는 김민준입니다. 저는 서울에 삽니다. 우리 가족은 다섯 명입니다. 아버지, 어머니, 형, 누나, 그리고 저입니다.

아버지는 회사원입니다. 어머니는 선생님입니다. 형은 대학생입니다. 누나는 고등학생입니다. 저는 중학생입니다.

우리 가족은 주말에 같이 밥을 먹습니다. 우리는 행복한 가족입니다.`,
    textVi: `Tôi là Kim Minjun. Tôi sống ở Seoul. Gia đình tôi có năm người. Bố, mẹ, anh trai, chị gái và tôi.

Bố là nhân viên công ty. Mẹ là giáo viên. Anh trai là sinh viên đại học. Chị gái là học sinh trung học phổ thông. Tôi là học sinh trung học cơ sở.

Gia đình tôi cùng nhau ăn cơm vào cuối tuần. Chúng tôi là một gia đình hạnh phúc.`,
    vocabulary: [
      { word: "가족", meaning: "Gia đình", pronunciation: "ga-jok" },
      { word: "회사원", meaning: "Nhân viên công ty", pronunciation: "hoe-sa-won" },
      { word: "선생님", meaning: "Giáo viên", pronunciation: "seon-saeng-nim" },
      { word: "대학생", meaning: "Sinh viên đại học", pronunciation: "dae-hak-saeng" },
      { word: "행복하다", meaning: "Hạnh phúc", pronunciation: "haeng-bok-ha-da" },
    ],
    questions: [
      { id: 1, question: "김민준의 가족은 몇 명입니까?", options: ["세 명", "네 명", "다섯 명", "여섯 명"], correct: 2, explanation: "본문에서 '우리 가족은 다섯 명입니다'라고 했습니다." },
      { id: 2, question: "어머니의 직업은 무엇입니까?", options: ["회사원", "선생님", "의사", "간호사"], correct: 1, explanation: "'어머니는 선생님입니다'라고 했습니다." },
      { id: 3, question: "가족이 언제 같이 밥을 먹습니까?", options: ["평일에", "주말에", "매일", "가끔"], correct: 1, explanation: "'주말에 같이 밥을 먹습니다'라고 했습니다." },
    ],
  },
  {
    id: "a2-1",
    level: "A2",
    title: "한국의 음식 문화",
    titleVi: "Văn hóa ẩm thực Hàn Quốc",
    topic: "Ẩm thực",
    readingTime: 3,
    wordCount: 150,
    text: `한국 음식은 세계적으로 유명합니다. 특히 김치, 불고기, 비빔밥이 인기가 많습니다.

김치는 배추나 무로 만든 발효 음식입니다. 한국 사람들은 거의 모든 식사에 김치를 먹습니다. 김치는 건강에도 좋습니다.

불고기는 양념한 소고기를 구운 음식입니다. 달콤하고 짭짤한 맛이 납니다. 외국인들도 불고기를 매우 좋아합니다.

비빔밥은 밥 위에 여러 가지 채소와 고기를 올리고 고추장을 넣어 비벼 먹는 음식입니다. 영양이 풍부하고 맛있습니다.

한국에서는 식사할 때 숟가락과 젓가락을 함께 사용합니다. 이것은 다른 나라와 다른 점입니다.`,
    textVi: `Ẩm thực Hàn Quốc nổi tiếng trên toàn thế giới. Đặc biệt kimchi, bulgogi, bibimbap rất được yêu thích.

Kimchi là món ăn lên men làm từ cải thảo hoặc củ cải. Người Hàn Quốc ăn kimchi trong hầu hết các bữa ăn. Kimchi cũng tốt cho sức khỏe.

Bulgogi là thịt bò ướp gia vị rồi nướng. Có vị ngọt và mặn. Người nước ngoài cũng rất thích bulgogi.

Bibimbap là món cơm trộn với nhiều loại rau và thịt, thêm tương ớt rồi trộn đều. Giàu dinh dưỡng và ngon miệng.

Ở Hàn Quốc, khi ăn người ta dùng cả thìa và đũa. Đây là điểm khác biệt so với các nước khác.`,
    vocabulary: [
      { word: "발효", meaning: "Lên men", pronunciation: "bal-hyo" },
      { word: "양념", meaning: "Gia vị/Ướp", pronunciation: "yang-nyeom" },
      { word: "달콤하다", meaning: "Ngọt ngào", pronunciation: "dal-kom-ha-da" },
      { word: "영양", meaning: "Dinh dưỡng", pronunciation: "yeong-yang" },
      { word: "젓가락", meaning: "Đũa", pronunciation: "jeot-ga-rak" },
    ],
    questions: [
      { id: 1, question: "김치는 무엇으로 만듭니까?", options: ["소고기와 돼지고기", "배추나 무", "쌀과 채소", "생선과 해산물"], correct: 1, explanation: "'배추나 무로 만든 발효 음식입니다'라고 했습니다." },
      { id: 2, question: "불고기의 맛은 어떻습니까?", options: ["맵고 쓴 맛", "달콤하고 짭짤한 맛", "시고 쓴 맛", "담백하고 싱거운 맛"], correct: 1, explanation: "'달콤하고 짭짤한 맛이 납니다'라고 했습니다." },
      { id: 3, question: "한국에서 식사할 때 무엇을 사용합니까?", options: ["포크와 나이프", "숟가락만", "젓가락만", "숟가락과 젓가락"], correct: 3, explanation: "'숟가락과 젓가락을 함께 사용합니다'라고 했습니다." },
      { id: 4, question: "비빔밥에 들어가는 것이 아닌 것은?", options: ["채소", "고기", "고추장", "김치찌개"], correct: 3, explanation: "비빔밥에는 채소, 고기, 고추장이 들어갑니다." },
    ],
  },
  {
    id: "b1-1",
    level: "B1",
    title: "한국의 교육 시스템",
    titleVi: "Hệ thống giáo dục Hàn Quốc",
    topic: "Giáo dục",
    readingTime: 5,
    wordCount: 250,
    text: `한국의 교육 시스템은 매우 경쟁적인 것으로 알려져 있습니다. 한국 학생들은 어릴 때부터 열심히 공부하며, 대학 입시를 위해 많은 시간을 투자합니다.

한국의 학교 교육은 초등학교 6년, 중학교 3년, 고등학교 3년으로 구성됩니다. 의무 교육은 초등학교와 중학교 9년입니다.

고등학교 3학년이 되면 학생들은 수능(대학수학능력시험)을 준비합니다. 수능은 매년 11월에 실시되며, 이 시험 결과가 대학 입학에 큰 영향을 미칩니다.

많은 학생들이 학교 수업 외에도 학원에 다닙니다. 학원은 수학, 영어, 과학 등 다양한 과목을 가르치는 사설 교육 기관입니다. 일부 학생들은 밤 늦게까지 학원에서 공부합니다.

최근에는 이러한 과도한 교육 경쟁에 대한 우려의 목소리도 높아지고 있습니다. 정부는 학생들의 학업 부담을 줄이기 위한 다양한 정책을 시행하고 있습니다.`,
    textVi: `Hệ thống giáo dục Hàn Quốc được biết đến là rất cạnh tranh. Học sinh Hàn Quốc học chăm chỉ từ nhỏ và đầu tư nhiều thời gian cho kỳ thi đại học.

Giáo dục trường học ở Hàn Quốc gồm 6 năm tiểu học, 3 năm trung học cơ sở, 3 năm trung học phổ thông. Giáo dục bắt buộc là 9 năm tiểu học và trung học cơ sở.

Khi lên lớp 12, học sinh chuẩn bị cho kỳ thi Suneung (Kỳ thi năng lực học đại học). Suneung được tổ chức vào tháng 11 hàng năm và kết quả thi này ảnh hưởng lớn đến việc nhập học đại học.

Nhiều học sinh ngoài giờ học ở trường còn đi học thêm ở hagwon. Hagwon là cơ sở giáo dục tư nhân dạy các môn như toán, tiếng Anh, khoa học. Một số học sinh học ở hagwon đến tận khuya.

Gần đây, lo ngại về sự cạnh tranh giáo dục quá mức này ngày càng tăng. Chính phủ đang thực hiện nhiều chính sách để giảm gánh nặng học tập cho học sinh.`,
    vocabulary: [
      { word: "경쟁적", meaning: "Cạnh tranh", pronunciation: "gyeong-jaeng-jeok" },
      { word: "의무 교육", meaning: "Giáo dục bắt buộc", pronunciation: "ui-mu gyo-yuk" },
      { word: "수능", meaning: "Kỳ thi đại học (Suneung)", pronunciation: "su-neung" },
      { word: "학원", meaning: "Trung tâm học thêm", pronunciation: "ha-gwon" },
      { word: "과도하다", meaning: "Quá mức", pronunciation: "gwa-do-ha-da" },
    ],
    questions: [
      { id: 1, question: "한국의 의무 교육 기간은 몇 년입니까?", options: ["6년", "9년", "12년", "3년"], correct: 1, explanation: "'의무 교육은 초등학교와 중학교 9년입니다'라고 했습니다." },
      { id: 2, question: "수능은 언제 실시됩니까?", options: ["3월", "6월", "9월", "11월"], correct: 3, explanation: "'매년 11월에 실시됩니다'라고 했습니다." },
      { id: 3, question: "학원은 무엇입니까?", options: ["공립 학교", "사설 교육 기관", "대학교", "도서관"], correct: 1, explanation: "'사설 교육 기관입니다'라고 했습니다." },
      { id: 4, question: "최근 한국 교육에 대한 우려는 무엇입니까?", options: ["교사 부족", "학교 시설 부족", "과도한 교육 경쟁", "교육비 부족"], correct: 2, explanation: "'과도한 교육 경쟁에 대한 우려의 목소리도 높아지고 있습니다'라고 했습니다." },
    ],
  },
  {
    id: "b2-1",
    level: "B2",
    title: "한국의 저출산 문제",
    titleVi: "Vấn đề tỷ lệ sinh thấp ở Hàn Quốc",
    topic: "Xã hội",
    readingTime: 7,
    wordCount: 320,
    text: `한국은 현재 세계에서 가장 낮은 출산율을 기록하고 있습니다. 2023년 합계출산율은 0.72명으로, 인구 유지에 필요한 2.1명에 훨씬 못 미치는 수준입니다.

저출산의 원인은 복합적입니다. 첫째, 높은 주거비와 교육비로 인해 젊은 세대가 결혼과 출산을 미루거나 포기하는 경우가 늘고 있습니다. 서울의 아파트 가격은 평균 연봉의 수십 배에 달하며, 자녀 한 명을 대학까지 교육시키는 데 드는 비용도 상당합니다.

둘째, 여성의 사회 진출이 활발해지면서 일과 육아를 병행하는 것이 어려워졌습니다. 직장 내 육아 지원 시스템이 부족하고, 육아 휴직을 사용하면 경력에 불이익을 받는 경우도 있습니다.

셋째, 청년 실업과 불안정한 고용 환경도 저출산에 영향을 미칩니다. 안정적인 직장을 갖지 못한 상태에서 가정을 꾸리기가 어렵기 때문입니다.

정부는 저출산 문제를 해결하기 위해 막대한 예산을 투입하고 있습니다. 출산 장려금 지급, 보육 시설 확충, 육아 휴직 제도 개선 등 다양한 정책을 시행하고 있지만, 아직까지 뚜렷한 효과를 거두지 못하고 있습니다.`,
    textVi: `Hàn Quốc hiện đang ghi nhận tỷ lệ sinh thấp nhất thế giới. Tổng tỷ suất sinh năm 2023 là 0,72 con, thấp hơn nhiều so với mức 2,1 cần thiết để duy trì dân số.

Nguyên nhân của tỷ lệ sinh thấp rất phức tạp. Thứ nhất, do chi phí nhà ở và giáo dục cao, thế hệ trẻ ngày càng trì hoãn hoặc từ bỏ kết hôn và sinh con. Giá căn hộ ở Seoul gấp hàng chục lần thu nhập bình quân năm, và chi phí nuôi dưỡng một đứa trẻ đến đại học cũng rất đáng kể.

Thứ hai, khi phụ nữ tham gia xã hội ngày càng nhiều, việc cân bằng công việc và nuôi con trở nên khó khăn hơn. Hệ thống hỗ trợ nuôi con tại nơi làm việc còn thiếu, và đôi khi nghỉ phép nuôi con ảnh hưởng đến sự nghiệp.

Thứ ba, thất nghiệp ở thanh niên và môi trường việc làm bất ổn cũng ảnh hưởng đến tỷ lệ sinh. Khó có thể lập gia đình khi chưa có việc làm ổn định.

Chính phủ đang đầu tư ngân sách lớn để giải quyết vấn đề tỷ lệ sinh thấp. Các chính sách như trợ cấp sinh con, mở rộng cơ sở chăm sóc trẻ em, cải thiện chế độ nghỉ phép nuôi con đang được thực hiện, nhưng vẫn chưa đạt được hiệu quả rõ ràng.`,
    vocabulary: [
      { word: "출산율", meaning: "Tỷ lệ sinh", pronunciation: "chul-san-yul" },
      { word: "복합적", meaning: "Phức tạp/Đa chiều", pronunciation: "bok-hap-jeok" },
      { word: "주거비", meaning: "Chi phí nhà ở", pronunciation: "ju-geo-bi" },
      { word: "육아 휴직", meaning: "Nghỉ phép nuôi con", pronunciation: "yug-a hyu-jik" },
      { word: "장려금", meaning: "Tiền khuyến khích", pronunciation: "jang-nyeo-geum" },
    ],
    questions: [
      { id: 1, question: "2023년 한국의 합계출산율은 얼마입니까?", options: ["1.2명", "0.72명", "1.5명", "0.5명"], correct: 1, explanation: "'2023년 합계출산율은 0.72명'이라고 했습니다." },
      { id: 2, question: "저출산의 원인이 아닌 것은?", options: ["높은 주거비", "여성의 사회 진출", "청년 실업", "낮은 교육 수준"], correct: 3, explanation: "본문에서 언급된 원인은 높은 주거비, 여성 사회 진출, 청년 실업입니다." },
      { id: 3, question: "정부의 저출산 대책이 아닌 것은?", options: ["출산 장려금 지급", "보육 시설 확충", "육아 휴직 제도 개선", "이민 정책 확대"], correct: 3, explanation: "본문에서 이민 정책은 언급되지 않았습니다." },
      { id: 4, question: "인구 유지에 필요한 출산율은?", options: ["1.0명", "1.5명", "2.1명", "2.5명"], correct: 2, explanation: "'인구 유지에 필요한 2.1명'이라고 했습니다." },
    ],
  },
  {
    id: "c1-1",
    level: "C1",
    title: "한국 현대 문학의 특징",
    titleVi: "Đặc điểm văn học hiện đại Hàn Quốc",
    topic: "Văn học",
    readingTime: 10,
    wordCount: 400,
    text: `한국 현대 문학은 20세기 초 일제 강점기를 거치면서 독특한 발전 과정을 걸어왔습니다. 식민지 경험과 분단의 아픔, 급격한 산업화와 민주화 운동 등 역사적 격변이 문학 작품에 깊이 반영되어 있습니다.

1970~80년대 한국 문학은 산업화 과정에서 소외된 노동자와 농민의 삶을 조명하는 민중 문학이 주류를 이루었습니다. 조세희의 『난장이가 쏘아올린 작은 공』은 이 시기를 대표하는 작품으로, 도시 빈민의 비극적 현실을 날카롭게 묘사했습니다.

1990년대 이후에는 개인의 내면 세계와 일상적 삶에 주목하는 경향이 강해졌습니다. 신경숙의 『엄마를 부탁해』는 어머니에 대한 그리움과 죄책감을 섬세하게 표현하여 국내외에서 큰 반향을 일으켰습니다.

2000년대 들어서는 한강의 『채식주의자』와 같이 인간의 폭력성과 존재의 의미를 탐구하는 실험적 작품들이 주목받기 시작했습니다. 한강은 2024년 노벨 문학상을 수상하며 한국 문학의 세계적 위상을 높였습니다.

현대 한국 문학의 또 다른 특징은 여성 작가들의 약진입니다. 가부장적 사회 구조에 대한 비판과 여성의 주체적 목소리를 담은 작품들이 독자들의 큰 공감을 얻고 있습니다.`,
    textVi: `Văn học hiện đại Hàn Quốc đã trải qua quá trình phát triển độc đáo qua thời kỳ Nhật Bản chiếm đóng đầu thế kỷ 20. Kinh nghiệm thuộc địa, nỗi đau chia cắt, công nghiệp hóa nhanh chóng và phong trào dân chủ hóa đều được phản ánh sâu sắc trong các tác phẩm văn học.

Văn học Hàn Quốc thập niên 1970-80 chủ yếu là văn học dân chúng chiếu sáng cuộc sống của công nhân và nông dân bị gạt ra ngoài lề trong quá trình công nghiệp hóa. "Quả bóng nhỏ mà người lùn bắn lên" của Cho Se-hee là tác phẩm tiêu biểu thời kỳ này, mô tả sắc nét thực tế bi thảm của người nghèo đô thị.

Từ thập niên 1990, xu hướng chú ý đến thế giới nội tâm cá nhân và cuộc sống hàng ngày ngày càng mạnh. "Hãy chăm sóc mẹ" của Shin Kyung-sook diễn đạt tinh tế nỗi nhớ và cảm giác tội lỗi về người mẹ, gây tiếng vang lớn trong và ngoài nước.

Từ những năm 2000, các tác phẩm thực nghiệm khám phá bạo lực của con người và ý nghĩa tồn tại như "Người ăn chay" của Han Kang bắt đầu được chú ý. Han Kang đã giành giải Nobel Văn học năm 2024, nâng cao vị thế toàn cầu của văn học Hàn Quốc.

Một đặc điểm khác của văn học Hàn Quốc hiện đại là sự vươn lên của các nhà văn nữ. Các tác phẩm phê phán cấu trúc xã hội gia trưởng và mang tiếng nói chủ thể của phụ nữ đang nhận được sự đồng cảm lớn từ độc giả.`,
    vocabulary: [
      { word: "일제 강점기", meaning: "Thời kỳ Nhật chiếm đóng", pronunciation: "il-je gang-jeom-gi" },
      { word: "민중 문학", meaning: "Văn học dân chúng", pronunciation: "min-jung mun-hak" },
      { word: "소외", meaning: "Bị gạt ra ngoài lề", pronunciation: "so-oe" },
      { word: "반향", meaning: "Tiếng vang/Phản hồi", pronunciation: "ban-hyang" },
      { word: "가부장적", meaning: "Gia trưởng", pronunciation: "ga-bu-jang-jeok" },
    ],
    questions: [
      { id: 1, question: "1970~80년대 한국 문학의 주류는?", options: ["순수 문학", "민중 문학", "실험 문학", "여성 문학"], correct: 1, explanation: "'민중 문학이 주류를 이루었습니다'라고 했습니다." },
      { id: 2, question: "한강이 노벨 문학상을 받은 해는?", options: ["2020년", "2022년", "2023년", "2024년"], correct: 3, explanation: "'2024년 노벨 문학상을 수상'했다고 했습니다." },
      { id: 3, question: "『난장이가 쏘아올린 작은 공』의 작가는?", options: ["신경숙", "한강", "조세희", "박경리"], correct: 2, explanation: "'조세희의 『난장이가 쏘아올린 작은 공』'이라고 했습니다." },
      { id: 4, question: "현대 한국 문학의 특징이 아닌 것은?", options: ["여성 작가들의 약진", "개인 내면 세계 탐구", "역사적 격변 반영", "외국 문학 번역 증가"], correct: 3, explanation: "외국 문학 번역은 본문에서 언급되지 않았습니다." },
    ],
  },
  {
    id: "c2-1",
    level: "C2",
    title: "인공지능과 인간 정체성의 철학적 고찰",
    titleVi: "Suy ngẫm triết học về AI và bản sắc con người",
    topic: "Triết học & Công nghệ",
    readingTime: 15,
    wordCount: 500,
    text: `인공지능 기술의 급격한 발전은 인간의 정체성과 존재 의미에 대한 근본적인 철학적 질문을 제기하고 있습니다. 특히 대규모 언어 모델의 등장으로 인해 '지능'과 '의식'의 경계가 모호해지면서, 인간만이 가진 고유한 특성이 무엇인지에 대한 논의가 활발해지고 있습니다.

데카르트의 "나는 생각한다, 고로 나는 존재한다"는 명제는 사유 능력을 인간 존재의 핵심으로 보았습니다. 그러나 인공지능이 인간과 구별하기 어려운 수준의 언어 생성과 추론 능력을 보여주는 현재, 이 명제는 새로운 도전에 직면해 있습니다. 만약 기계도 '생각'할 수 있다면, 사유 능력만으로는 인간의 고유성을 정의하기 어렵습니다.

한편, 현상학적 관점에서는 인간의 신체적 경험과 감각적 지각이 의식의 근본을 이룬다고 봅니다. 메를로-퐁티는 인간의 의식이 세계와의 신체적 상호작용을 통해 형성된다고 주장했습니다. 이 관점에서 보면, 물리적 신체를 갖지 않는 인공지능은 진정한 의미의 '경험'을 할 수 없으며, 따라서 인간과 본질적으로 다른 존재입니다.

그러나 트랜스휴머니즘 철학자들은 다른 시각을 제시합니다. 그들은 인간의 생물학적 한계를 기술로 극복하는 것이 인류 진화의 자연스러운 연장선이라고 주장합니다. 이 관점에서 인간과 기계의 경계는 점차 흐려질 것이며, 이는 위협이 아닌 새로운 가능성으로 받아들여야 합니다.

결국 인공지능 시대의 인간 정체성 문제는 단순히 기술적 문제가 아니라, 우리가 무엇을 '인간다움'의 본질로 볼 것인가에 대한 가치론적 선택의 문제입니다. 공감 능력, 도덕적 책임감, 창의적 상상력, 그리고 유한한 존재로서의 자각—이러한 요소들이 인공지능 시대에도 인간을 인간답게 만드는 핵심이 될 것입니다.`,
    textVi: `Sự phát triển nhanh chóng của công nghệ trí tuệ nhân tạo đang đặt ra những câu hỏi triết học cơ bản về bản sắc và ý nghĩa tồn tại của con người. Đặc biệt với sự xuất hiện của các mô hình ngôn ngữ lớn, ranh giới giữa 'trí tuệ' và 'ý thức' trở nên mờ nhạt, và cuộc thảo luận về đặc tính riêng biệt của con người ngày càng sôi nổi.

Mệnh đề của Descartes "Tôi suy nghĩ, vậy tôi tồn tại" coi khả năng tư duy là cốt lõi của sự tồn tại con người. Tuy nhiên, khi AI hiện nay thể hiện khả năng tạo ngôn ngữ và suy luận khó phân biệt với con người, mệnh đề này đang đối mặt với thách thức mới. Nếu máy móc cũng có thể 'suy nghĩ', thì khả năng tư duy một mình không đủ để định nghĩa tính độc đáo của con người.

Mặt khác, từ quan điểm hiện tượng học, trải nghiệm thể xác và nhận thức cảm giác của con người tạo nên nền tảng của ý thức. Merleau-Ponty lập luận rằng ý thức con người được hình thành qua tương tác thể xác với thế giới. Từ quan điểm này, AI không có thân xác vật lý không thể có 'trải nghiệm' theo nghĩa thực sự, và do đó về bản chất khác với con người.

Tuy nhiên, các triết gia chủ nghĩa siêu nhân học đưa ra quan điểm khác. Họ lập luận rằng việc vượt qua giới hạn sinh học của con người bằng công nghệ là sự kéo dài tự nhiên của tiến hóa nhân loại. Từ quan điểm này, ranh giới giữa người và máy sẽ dần mờ đi, và điều này nên được đón nhận như một khả năng mới chứ không phải mối đe dọa.

Cuối cùng, vấn đề bản sắc con người trong thời đại AI không chỉ là vấn đề kỹ thuật, mà là vấn đề lựa chọn giá trị về điều gì là bản chất của 'tính người'. Khả năng đồng cảm, trách nhiệm đạo đức, trí tưởng tượng sáng tạo, và ý thức về sự hữu hạn—những yếu tố này sẽ là cốt lõi làm cho con người vẫn là con người trong thời đại AI.`,
    vocabulary: [
      { word: "정체성", meaning: "Bản sắc/Danh tính", pronunciation: "jeong-che-seong" },
      { word: "현상학", meaning: "Hiện tượng học", pronunciation: "hyeon-sang-hak" },
      { word: "트랜스휴머니즘", meaning: "Chủ nghĩa siêu nhân học", pronunciation: "teu-raen-seu-hyu-meo-ni-jeum" },
      { word: "가치론", meaning: "Giá trị học", pronunciation: "ga-chi-ron" },
      { word: "유한하다", meaning: "Hữu hạn", pronunciation: "yu-han-ha-da" },
    ],
    questions: [
      { id: 1, question: "데카르트의 명제에서 인간 존재의 핵심은?", options: ["감정 능력", "사유 능력", "신체적 경험", "도덕적 책임"], correct: 1, explanation: "'사유 능력을 인간 존재의 핵심으로 보았습니다'라고 했습니다." },
      { id: 2, question: "메를로-퐁티의 관점에서 의식은 어떻게 형성됩니까?", options: ["순수한 이성적 사유", "세계와의 신체적 상호작용", "언어 능력", "사회적 관계"], correct: 1, explanation: "'세계와의 신체적 상호작용을 통해 형성된다'고 했습니다." },
      { id: 3, question: "트랜스휴머니즘 철학자들의 주장은?", options: ["AI는 위험하다", "인간과 기계의 경계는 유지되어야 한다", "기술로 생물학적 한계를 극복하는 것은 자연스럽다", "AI 개발을 중단해야 한다"], correct: 2, explanation: "'인간의 생물학적 한계를 기술로 극복하는 것이 인류 진화의 자연스러운 연장선'이라고 했습니다." },
      { id: 4, question: "필자가 인공지능 시대에도 인간다움의 핵심으로 보는 것이 아닌 것은?", options: ["공감 능력", "도덕적 책임감", "언어 생성 능력", "창의적 상상력"], correct: 2, explanation: "언어 생성 능력은 AI도 가질 수 있는 것으로, 인간다움의 핵심으로 언급되지 않았습니다." },
    ],
  },
];

// ─── Level Config ─────────────────────────────────────────────────────────────
const levelConfig: Record<string, { color: string; bg: string; label: string; desc: string }> = {
  A1: { color: "#34d399", bg: "bg-emerald-500/10", label: "A1 - Sơ cấp", desc: "Người mới bắt đầu" },
  A2: { color: "#6ee7b7", bg: "bg-emerald-400/10", label: "A2 - Sơ cấp+", desc: "Cơ bản" },
  B1: { color: "#fbbf24", bg: "bg-amber-500/10", label: "B1 - Trung cấp", desc: "Giao tiếp được" },
  B2: { color: "#f59e0b", bg: "bg-amber-400/10", label: "B2 - Trung cấp+", desc: "Khá thành thạo" },
  C1: { color: "#f87171", bg: "bg-rose-500/10", label: "C1 - Cao cấp", desc: "Thành thạo" },
  C2: { color: "#e879f9", bg: "bg-fuchsia-500/10", label: "C2 - Thành thạo", desc: "Gần như bản ngữ" },
};

// ─── Quiz Component ───────────────────────────────────────────────────────────
function QuizSection({ questions, onComplete }: { questions: Question[]; onComplete: (score: number) => void }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);

  const q = questions[current];
  const isAnswered = selected !== null;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelected(idx);
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(answers[current + 1]);
    } else {
      const score = answers.filter((a, i) => a === questions[i].correct).length;
      setShowResult(true);
      onComplete(score);
    }
  };

  if (showResult) {
    const score = answers.filter((a, i) => a === questions[i].correct).length;
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="text-center py-8">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${pct >= 75 ? "bg-emerald-500/15" : pct >= 50 ? "bg-amber-500/15" : "bg-rose-500/15"}`}>
          <span className={`text-2xl font-bold ${pct >= 75 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-rose-400"}`}>{pct}%</span>
        </div>
        <p className="text-white font-bold text-lg mb-1">{score}/{questions.length} câu đúng</p>
        <p className="text-white/50 text-sm mb-6">
          {pct >= 75 ? "Xuất sắc! Bạn hiểu bài rất tốt!" : pct >= 50 ? "Khá tốt! Hãy đọc lại những phần chưa hiểu." : "Hãy đọc lại bài và thử lại nhé!"}
        </p>
        <div className="space-y-3 text-left">
          {questions.map((q, i) => (
            <div key={q.id} className={`p-3 rounded-xl border ${answers[i] === q.correct ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"}`}>
              <p className="text-white/80 text-sm font-medium mb-1">{i + 1}. {q.question}</p>
              <p className={`text-xs ${answers[i] === q.correct ? "text-emerald-400" : "text-rose-400"}`}>
                {answers[i] === q.correct ? "✓ Đúng" : `✗ Sai — Đáp án: ${q.options[q.correct]}`}
              </p>
              <p className="text-white/40 text-xs mt-1">{q.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/50 text-sm">Câu {current + 1}/{questions.length}</span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-[#e8c84a]" : answers[i] !== null ? (answers[i] === questions[i].correct ? "bg-emerald-400" : "bg-rose-400") : "bg-white/15"}`} />
          ))}
        </div>
      </div>
      <p className="text-white font-semibold text-base mb-5">{q.question}</p>
      <div className="space-y-2 mb-6">
        {q.options.map((opt, idx) => {
          let cls = "border-white/10 bg-white/3 text-white/70 hover:border-white/25 hover:bg-white/6";
          if (isAnswered) {
            if (idx === q.correct) cls = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
            else if (idx === selected) cls = "border-rose-500/50 bg-rose-500/10 text-rose-300";
            else cls = "border-white/5 bg-white/2 text-white/30";
          } else if (selected === idx) {
            cls = "border-[#e8c84a]/50 bg-[#e8c84a]/10 text-[#e8c84a]";
          }
          return (
            <button key={idx} onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${cls}`}>
              <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>{opt}
            </button>
          );
        })}
      </div>
      {isAnswered && (
        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-xs"><i className="ri-information-line mr-1"></i>{q.explanation}</p>
        </div>
      )}
      <button onClick={handleNext} disabled={!isAnswered}
        className="w-full py-3 rounded-xl bg-[#e8c84a] text-[#141720] font-bold text-sm disabled:opacity-30 cursor-pointer whitespace-nowrap transition-opacity">
        {current < questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReadingByLevelPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedPassage, setSelectedPassage] = useState<ReadingPassage | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showVocab, setShowVocab] = useState(false);
  const [activeTab, setActiveTab] = useState<"read" | "quiz">("read");
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [speak, setSpeak] = useState(false);

  const filtered = useMemo(() =>
    selectedLevel === "all" ? passages : passages.filter(p => p.level === selectedLevel),
    [selectedLevel]
  );

  const handleTTS = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "ko-KR";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  const handleQuizComplete = (score: number) => {
    setQuizScore(score);
    if (selectedPassage) {
      setCompletedIds(prev => new Set([...prev, selectedPassage.id]));
    }
  };

  if (selectedPassage) {
    const cfg = levelConfig[selectedPassage.level];
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Back */}
          <button onClick={() => { setSelectedPassage(null); setActiveTab("read"); setQuizScore(null); setShowTranslation(false); setShowVocab(false); }}
            className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm mb-5 cursor-pointer transition-colors">
            <i className="ri-arrow-left-line"></i> Quay lại danh sách
          </button>

          {/* Header */}
          <div className="rounded-2xl border border-white/8 bg-white/3 p-5 mb-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>{cfg.label}</span>
                  <span className="text-white/30 text-xs">{selectedPassage.topic}</span>
                  <span className="text-white/30 text-xs">· {selectedPassage.wordCount} từ · {selectedPassage.readingTime} phút</span>
                </div>
                <h1 className="text-white font-bold text-xl">{selectedPassage.title}</h1>
                <p className="text-white/50 text-sm">{selectedPassage.titleVi}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleTTS(selectedPassage.text)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs cursor-pointer transition-colors whitespace-nowrap">
                  <i className="ri-volume-up-line"></i> Nghe
                </button>
                <button onClick={() => setShowTranslation(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors whitespace-nowrap ${showTranslation ? "bg-[#e8c84a]/15 text-[#e8c84a]" : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"}`}>
                  <i className="ri-translate-2"></i> Dịch
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-5 w-fit">
            {(["read", "quiz"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${activeTab === tab ? "bg-[#e8c84a] text-[#141720]" : "text-white/50 hover:text-white/80"}`}>
                {tab === "read" ? "Đọc bài" : `Câu hỏi (${selectedPassage.questions.length})`}
              </button>
            ))}
          </div>

          {activeTab === "read" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Text */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                  <div className="prose prose-invert max-w-none">
                    {selectedPassage.text.split("\n\n").map((para, i) => (
                      <p key={i} className="text-white/85 leading-8 text-base mb-4 last:mb-0">{para}</p>
                    ))}
                  </div>
                  {showTranslation && (
                    <div className="mt-5 pt-5 border-t border-white/8">
                      <p className="text-[#e8c84a] text-xs font-semibold mb-3 flex items-center gap-1.5">
                        <i className="ri-translate-2"></i> Bản dịch tiếng Việt
                      </p>
                      {selectedPassage.textVi.split("\n\n").map((para, i) => (
                        <p key={i} className="text-white/50 leading-7 text-sm mb-3 last:mb-0 italic">{para}</p>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setActiveTab("quiz")}
                  className="w-full py-3 rounded-xl bg-[#e8c84a] text-[#141720] font-bold text-sm cursor-pointer whitespace-nowrap">
                  Làm bài kiểm tra comprehension <i className="ri-arrow-right-line ml-1"></i>
                </button>
              </div>

              {/* Vocab sidebar */}
              <div>
                <button onClick={() => setShowVocab(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/8 text-white/70 text-sm font-medium cursor-pointer transition-colors mb-3">
                  <span><i className="ri-book-open-line mr-2"></i>Từ vựng ({selectedPassage.vocabulary.length})</span>
                  <i className={showVocab ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
                </button>
                {showVocab && (
                  <div className="space-y-2">
                    {selectedPassage.vocabulary.map((v, i) => (
                      <div key={i} className="p-3 rounded-xl border border-white/8 bg-white/3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-bold text-sm">{v.word}</span>
                          <button onClick={() => handleTTS(v.word)} className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/60 cursor-pointer">
                            <i className="ri-volume-up-line text-xs"></i>
                          </button>
                        </div>
                        <p className="text-[#e8c84a] text-xs">{v.meaning}</p>
                        <p className="text-white/30 text-xs">[{v.pronunciation}]</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl">
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                <h3 className="text-white font-bold text-base mb-5">
                  <i className="ri-question-line mr-2 text-[#e8c84a]"></i>
                  Câu hỏi comprehension
                </h3>
                <QuizSection questions={selectedPassage.questions} onComplete={handleQuizComplete} />
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white font-bold text-2xl mb-1">Luyện đọc theo cấp độ</h1>
          <p className="text-white/50 text-sm">Bài đọc từ A1 đến C2 với câu hỏi comprehension — nâng cao kỹ năng đọc hiểu</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Bài đọc", value: passages.length, icon: "ri-article-line", color: "#e8c84a" },
            { label: "Đã hoàn thành", value: completedIds.size, icon: "ri-checkbox-circle-line", color: "#34d399" },
            { label: "Cấp độ", value: "A1–C2", icon: "ri-bar-chart-grouped-line", color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${s.color}20` }}>
                <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
              </div>
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Level filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setSelectedLevel("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${selectedLevel === "all" ? "bg-white/15 text-white" : "bg-white/5 text-white/50 hover:bg-white/8"}`}>
            Tất cả
          </button>
          {Object.entries(levelConfig).map(([lvl, cfg]) => (
            <button key={lvl} onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${selectedLevel === lvl ? "text-[#141720]" : "text-white/50 hover:text-white/80"}`}
              style={selectedLevel === lvl ? { backgroundColor: cfg.color } : { backgroundColor: `${cfg.color}15`, color: cfg.color }}>
              {lvl}
            </button>
          ))}
        </div>

        {/* Passage cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => {
            const cfg = levelConfig[p.level];
            const isDone = completedIds.has(p.id);
            return (
              <button key={p.id} onClick={() => { setSelectedPassage(p); setActiveTab("read"); setQuizScore(null); setShowTranslation(false); setShowVocab(false); }}
                className="text-left p-5 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/15 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>{p.level}</span>
                    {isDone && <span className="text-xs text-emerald-400 flex items-center gap-1"><i className="ri-checkbox-circle-fill"></i>Hoàn thành</span>}
                  </div>
                  <span className="text-white/30 text-xs">{p.readingTime} phút</span>
                </div>
                <h3 className="text-white font-bold text-base mb-1 group-hover:text-[#e8c84a] transition-colors">{p.title}</h3>
                <p className="text-white/50 text-sm mb-3">{p.titleVi}</p>
                <div className="flex items-center gap-3 text-white/30 text-xs">
                  <span><i className="ri-book-open-line mr-1"></i>{p.wordCount} từ</span>
                  <span><i className="ri-question-line mr-1"></i>{p.questions.length} câu hỏi</span>
                  <span><i className="ri-price-tag-3-line mr-1"></i>{p.topic}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
