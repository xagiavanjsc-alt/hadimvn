import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ExamQuestion {
  id: string;
  type: "vocabulary" | "grammar" | "reading";
  question: string;
  questionVi: string;
  passage?: string;
  passageVi?: string;
  options: string[];
  optionsVi: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

interface SeoulBook {
  id: string;
  name: string;
  level: string;
  cefr: string;
  color: string;
  bgColor: string;
  questions: ExamQuestion[];
}

const seoulExams: SeoulBook[] = [
  {
    id: "1a",
    name: "Seoul 1A",
    level: "Sơ cấp",
    cefr: "A1",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    questions: [
      { id: "1a-v1", type: "vocabulary", question: "다음 중 '학교'의 뜻은?", questionVi: "Nghĩa của '학교' là gì?", options: ["병원", "학교", "은행", "시장"], optionsVi: ["Bệnh viện", "Trường học", "Ngân hàng", "Chợ"], correctIndex: 1, explanation: "학교 = trường học. 병원 = bệnh viện, 은행 = ngân hàng, 시장 = chợ.", points: 2 },
      { id: "1a-v2", type: "vocabulary", question: "빈칸에 알맞은 것은? 저는 ___ 사람이에요.", questionVi: "Điền từ phù hợp: Tôi là người ___.", options: ["한국", "학교", "음식", "날씨"], optionsVi: ["Hàn Quốc", "Trường học", "Đồ ăn", "Thời tiết"], correctIndex: 0, explanation: "한국 사람 = người Hàn Quốc. Cấu trúc: N 사람 = người N.", points: 2 },
      { id: "1a-v3", type: "vocabulary", question: "다음 중 인사말이 아닌 것은?", questionVi: "Câu nào KHÔNG phải lời chào?", options: ["안녕하세요", "감사합니다", "사과", "잘 지내요?"], optionsVi: ["Xin chào", "Cảm ơn", "Táo", "Bạn có khỏe không?"], correctIndex: 2, explanation: "사과 = táo (quả táo), không phải lời chào. Các câu còn lại đều là lời chào/xã giao.", points: 2 },
      { id: "1a-g1", type: "grammar", question: "빈칸에 알맞은 것은? 저___ 학생이에요.", questionVi: "Điền trợ từ phù hợp: Tôi ___ học sinh.", options: ["은", "는", "이", "가"], optionsVi: ["eun (chủ ngữ sau phụ âm)", "neun (chủ ngữ sau nguyên âm)", "i (chủ ngữ nhấn mạnh)", "ga (chủ ngữ nhấn mạnh)"], correctIndex: 1, explanation: "저 kết thúc bằng nguyên âm → dùng 는. 저는 = tôi (chủ ngữ).", points: 3 },
      { id: "1a-g2", type: "grammar", question: "다음 중 올바른 문장은?", questionVi: "Câu nào đúng ngữ pháp?", options: ["저는 학생이에요", "저가 학생이에요", "저을 학생이에요", "저의 학생이에요"], optionsVi: ["Tôi là học sinh", "Tôi là học sinh (sai)", "Tôi là học sinh (sai)", "Tôi là học sinh (sai)"], correctIndex: 0, explanation: "저는 학생이에요 = Tôi là học sinh. 저는 (chủ ngữ) + 학생 (danh từ) + 이에요 (là).", points: 3 },
      { id: "1a-r1", type: "reading", passage: "저는 이민수예요. 한국 사람이에요. 서울에 살아요. 학생이에요.", passageVi: "Tôi là Lee Minsu. Tôi là người Hàn Quốc. Tôi sống ở Seoul. Tôi là học sinh.", question: "이민수는 어디에 살아요?", questionVi: "Lee Minsu sống ở đâu?", options: ["부산", "서울", "제주도", "인천"], optionsVi: ["Busan", "Seoul", "Jeju", "Incheon"], correctIndex: 1, explanation: "서울에 살아요 = sống ở Seoul.", points: 3 },
    ],
  },
  {
    id: "1b",
    name: "Seoul 1B",
    level: "Sơ cấp",
    cefr: "A1+",
    color: "text-teal-400",
    bgColor: "bg-teal-500/10 border-teal-500/20",
    questions: [
      { id: "1b-v1", type: "vocabulary", question: "다음 중 음식이 아닌 것은?", questionVi: "Cái nào KHÔNG phải đồ ăn?", options: ["비빔밥", "김치", "지하철", "삼겹살"], optionsVi: ["Cơm trộn", "Kim chi", "Tàu điện ngầm", "Thịt ba chỉ"], correctIndex: 2, explanation: "지하철 = tàu điện ngầm, không phải đồ ăn. Các từ còn lại đều là đồ ăn Hàn Quốc.", points: 2 },
      { id: "1b-v2", type: "vocabulary", question: "빈칸에 알맞은 것은? 오늘 날씨가 ___.", questionVi: "Điền từ phù hợp: Hôm nay thời tiết ___.", options: ["맛있어요", "좋아요", "먹어요", "가요"], optionsVi: ["ngon", "tốt/đẹp", "ăn", "đi"], correctIndex: 1, explanation: "날씨가 좋아요 = thời tiết đẹp. 좋다 = tốt/đẹp dùng cho thời tiết.", points: 2 },
      { id: "1b-g1", type: "grammar", question: "빈칸에 알맞은 것은? 학교___ 가요.", questionVi: "Điền trợ từ phù hợp: Đi ___ trường.", options: ["에", "을", "이", "는"], optionsVi: ["đến (địa điểm)", "tân ngữ", "chủ ngữ", "chủ ngữ"], correctIndex: 0, explanation: "에 가다 = đi đến (địa điểm). 학교에 가요 = đi đến trường.", points: 3 },
      { id: "1b-g2", type: "grammar", question: "다음 중 올바른 문장은?", questionVi: "Câu nào đúng ngữ pháp?", options: ["저는 밥을 먹어요", "저는 밥이 먹어요", "저는 밥에 먹어요", "저는 밥가 먹어요"], optionsVi: ["Tôi ăn cơm (đúng)", "Tôi ăn cơm (sai)", "Tôi ăn cơm (sai)", "Tôi ăn cơm (sai)"], correctIndex: 0, explanation: "밥을 먹어요 = ăn cơm. 을/를 là trợ từ tân ngữ dùng sau danh từ.", points: 3 },
      { id: "1b-r1", type: "reading", passage: "저는 매일 아침 7시에 일어나요. 그리고 밥을 먹어요. 8시에 학교에 가요. 학교에서 한국어를 공부해요.", passageVi: "Tôi dậy lúc 7 giờ sáng mỗi ngày. Rồi ăn cơm. Lúc 8 giờ đi đến trường. Ở trường học tiếng Hàn.", question: "이 사람은 학교에서 무엇을 해요?", questionVi: "Người này làm gì ở trường?", options: ["밥을 먹어요", "한국어를 공부해요", "잠을 자요", "운동을 해요"], optionsVi: ["Ăn cơm", "Học tiếng Hàn", "Ngủ", "Tập thể dục"], correctIndex: 1, explanation: "학교에서 한국어를 공부해요 = ở trường học tiếng Hàn.", points: 3 },
      { id: "1b-r2", type: "reading", passage: "저는 친구가 있어요. 친구 이름은 지수예요. 지수는 부산 사람이에요. 우리는 같이 공부해요.", passageVi: "Tôi có bạn. Tên bạn là Jisu. Jisu là người Busan. Chúng tôi học cùng nhau.", question: "지수는 어디 사람이에요?", questionVi: "Jisu là người ở đâu?", options: ["서울", "인천", "부산", "대구"], optionsVi: ["Seoul", "Incheon", "Busan", "Daegu"], correctIndex: 2, explanation: "지수는 부산 사람이에요 = Jisu là người Busan.", points: 3 },
    ],
  },
  {
    id: "2a",
    name: "Seoul 2A",
    level: "Sơ-Trung",
    cefr: "A2",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    questions: [
      { id: "2a-v1", type: "vocabulary", question: "다음 중 '여행'과 관련 없는 것은?", questionVi: "Từ nào KHÔNG liên quan đến 'du lịch'?", options: ["비행기", "호텔", "여권", "계약서"], optionsVi: ["Máy bay", "Khách sạn", "Hộ chiếu", "Hợp đồng"], correctIndex: 3, explanation: "계약서 = hợp đồng, không liên quan đến du lịch. Các từ còn lại đều liên quan đến du lịch.", points: 2 },
      { id: "2a-g1", type: "grammar", question: "빈칸에 알맞은 것은? 비가 ___ 우산을 가져왔어요.", questionVi: "Điền từ phù hợp: Vì trời mưa ___ tôi mang ô.", options: ["오면", "와서", "오지만", "오거나"], optionsVi: ["nếu mưa", "vì mưa nên", "mưa nhưng", "mưa hoặc"], correctIndex: 1, explanation: "-아/어서 = vì... nên... (nguyên nhân-kết quả). 비가 와서 = vì trời mưa nên.", points: 3 },
      { id: "2a-g2", type: "grammar", question: "다음 중 올바른 문장은?", questionVi: "Câu nào đúng ngữ pháp?", options: ["저는 한국어를 배우고 싶어요", "저는 한국어가 배우고 싶어요", "저는 한국어에 배우고 싶어요", "저는 한국어로 배우고 싶어요"], optionsVi: ["Tôi muốn học tiếng Hàn (đúng)", "Tôi muốn học tiếng Hàn (sai)", "Tôi muốn học tiếng Hàn (sai)", "Tôi muốn học tiếng Hàn (sai)"], correctIndex: 0, explanation: "N을/를 배우다 = học N. -고 싶다 = muốn làm gì. 한국어를 배우고 싶어요 = muốn học tiếng Hàn.", points: 3 },
      { id: "2a-g3", type: "grammar", question: "빈칸에 알맞은 것은? 한국에 온 ___ 3년이 됐어요.", questionVi: "Điền từ phù hợp: Đến Hàn Quốc ___ được 3 năm rồi.", options: ["지", "때", "후에", "전에"], optionsVi: ["kể từ khi", "lúc", "sau khi", "trước khi"], correctIndex: 0, explanation: "-ㄴ/은 지 N이 됐다 = đã được N thời gian kể từ khi... Cấu trúc diễn tả thời gian đã trôi qua.", points: 3 },
      { id: "2a-r1", type: "reading", passage: "저는 지난 주말에 친구들과 한강에 갔어요. 날씨가 맑아서 기분이 좋았어요. 우리는 자전거를 타고 치킨을 먹었어요. 정말 즐거운 하루였어요.", passageVi: "Cuối tuần trước tôi đã đến Sông Hàn với bạn bè. Vì thời tiết đẹp nên tâm trạng tốt. Chúng tôi đạp xe và ăn gà rán. Thật là một ngày vui.", question: "이 사람들은 한강에서 무엇을 했어요? (2가지)", questionVi: "Những người này đã làm gì ở Sông Hàn? (2 việc)", options: ["수영하고 밥을 먹었어요", "자전거를 타고 치킨을 먹었어요", "운동하고 영화를 봤어요", "쇼핑하고 커피를 마셨어요"], optionsVi: ["Bơi và ăn cơm", "Đạp xe và ăn gà rán", "Tập thể dục và xem phim", "Mua sắm và uống cà phê"], correctIndex: 1, explanation: "자전거를 타고 치킨을 먹었어요 = đạp xe và ăn gà rán.", points: 3 },
    ],
  },
  {
    id: "2b",
    name: "Seoul 2B",
    level: "Sơ-Trung",
    cefr: "A2+",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 border-orange-500/20",
    questions: [
      { id: "2b-v1", type: "vocabulary", question: "다음 중 '감정'을 나타내는 단어가 아닌 것은?", questionVi: "Từ nào KHÔNG diễn tả 'cảm xúc'?", options: ["기쁘다", "슬프다", "화나다", "빠르다"], optionsVi: ["Vui mừng", "Buồn", "Tức giận", "Nhanh"], correctIndex: 3, explanation: "빠르다 = nhanh (tính từ chỉ tốc độ), không phải cảm xúc. Các từ còn lại đều là cảm xúc.", points: 2 },
      { id: "2b-g1", type: "grammar", question: "빈칸에 알맞은 것은? 시간이 있___ 같이 가요.", questionVi: "Điền từ phù hợp: Nếu có thời gian ___ cùng đi nhé.", options: ["으면", "어서", "지만", "거나"], optionsVi: ["nếu thì", "vì nên", "nhưng", "hoặc"], correctIndex: 0, explanation: "-(으)면 = nếu... thì... (điều kiện). 시간이 있으면 = nếu có thời gian thì.", points: 3 },
      { id: "2b-g2", type: "grammar", question: "다음 중 올바른 문장은?", questionVi: "Câu nào đúng ngữ pháp?", options: ["저는 한국어를 공부한 지 1년이 됐어요", "저는 한국어를 공부하는 지 1년이 됐어요", "저는 한국어를 공부할 지 1년이 됐어요", "저는 한국어를 공부하고 지 1년이 됐어요"], optionsVi: ["Tôi học tiếng Hàn được 1 năm (đúng)", "Sai", "Sai", "Sai"], correctIndex: 0, explanation: "동사 + ㄴ/은 지 N이 됐다 = đã được N thời gian kể từ khi làm gì. 공부한 지 1년 = học được 1 năm.", points: 3 },
      { id: "2b-r1", type: "reading", passage: "요즘 건강에 관심이 많아졌어요. 그래서 매일 아침 30분씩 달리기를 해요. 처음에는 힘들었지만 지금은 익숙해졌어요. 덕분에 몸이 가벼워지고 기분도 좋아졌어요.", passageVi: "Gần đây tôi quan tâm nhiều đến sức khỏe. Vì vậy tôi chạy bộ 30 phút mỗi buổi sáng. Lúc đầu khó nhưng bây giờ đã quen rồi. Nhờ đó cơ thể nhẹ nhàng hơn và tâm trạng cũng tốt hơn.", question: "이 사람이 달리기를 시작한 이유는?", questionVi: "Lý do người này bắt đầu chạy bộ là gì?", options: ["친구가 권해서", "건강에 관심이 생겨서", "의사가 권해서", "살을 빼려고"], optionsVi: ["Vì bạn bè khuyên", "Vì quan tâm đến sức khỏe", "Vì bác sĩ khuyên", "Để giảm cân"], correctIndex: 1, explanation: "건강에 관심이 많아졌어요. 그래서 달리기를 해요 = quan tâm đến sức khỏe nên chạy bộ.", points: 3 },
      { id: "2b-r2", type: "reading", passage: "한국에는 다양한 전통 음식이 있어요. 김치는 발효 음식으로 건강에 좋아요. 비빔밥은 여러 가지 채소와 밥을 섞어서 먹어요. 삼겹살은 돼지고기를 구워서 먹는 음식이에요.", passageVi: "Hàn Quốc có nhiều đồ ăn truyền thống. Kim chi là đồ ăn lên men tốt cho sức khỏe. Cơm trộn là ăn trộn nhiều loại rau và cơm. Thịt ba chỉ là đồ ăn nướng thịt lợn.", question: "김치에 대한 설명으로 맞는 것은?", questionVi: "Mô tả nào đúng về kim chi?", options: ["돼지고기로 만들어요", "발효 음식이에요", "밥과 섞어서 먹어요", "구워서 먹어요"], optionsVi: ["Làm từ thịt lợn", "Là đồ ăn lên men", "Ăn trộn với cơm", "Ăn nướng"], correctIndex: 1, explanation: "김치는 발효 음식으로 건강에 좋아요 = kim chi là đồ ăn lên men tốt cho sức khỏe.", points: 3 },
    ],
  },
  {
    id: "3a",
    name: "Seoul 3A",
    level: "Trung cấp",
    cefr: "B1",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10 border-violet-500/20",
    questions: [
      { id: "3a-v1", type: "vocabulary", question: "다음 중 '경제'와 관련된 단어는?", questionVi: "Từ nào liên quan đến 'kinh tế'?", options: ["소비", "날씨", "음악", "운동"], optionsVi: ["Tiêu dùng", "Thời tiết", "Âm nhạc", "Thể thao"], correctIndex: 0, explanation: "소비 = tiêu dùng, liên quan đến kinh tế. 소비자 = người tiêu dùng.", points: 2 },
      { id: "3a-g1", type: "grammar", question: "빈칸에 알맞은 것은? 그 영화는 ___ 만한 가치가 있어요.", questionVi: "Điền từ phù hợp: Bộ phim đó ___ xem.", options: ["볼", "보는", "봤을", "보았던"], optionsVi: ["đáng xem", "đang xem", "đã xem", "đã từng xem"], correctIndex: 0, explanation: "V-(으)ㄹ 만하다 = đáng làm gì. 볼 만하다 = đáng xem.", points: 3 },
      { id: "3a-g2", type: "grammar", question: "다음 중 올바른 문장은?", questionVi: "Câu nào đúng ngữ pháp?", options: ["비가 올 것 같아요", "비가 오는 것 같아요", "비가 온 것 같아요", "모두 맞아요"], optionsVi: ["Có vẻ sắp mưa", "Có vẻ đang mưa", "Có vẻ đã mưa", "Tất cả đều đúng"], correctIndex: 3, explanation: "-(으)ㄹ 것 같다 = có vẻ sắp, -는 것 같다 = có vẻ đang, -ㄴ/은 것 같다 = có vẻ đã. Tất cả đều đúng ngữ pháp.", points: 3 },
      { id: "3a-r1", type: "reading", passage: "현대 사회에서 스마트폰은 없어서는 안 될 필수품이 되었습니다. 사람들은 스마트폰으로 정보를 검색하고, 친구들과 소통하며, 쇼핑도 합니다. 그러나 스마트폰 과의존은 집중력 저하와 수면 장애를 일으킬 수 있습니다.", passageVi: "Trong xã hội hiện đại, điện thoại thông minh đã trở thành vật dụng thiết yếu không thể thiếu. Người ta dùng điện thoại để tìm kiếm thông tin, giao tiếp với bạn bè và mua sắm. Tuy nhiên, phụ thuộc quá nhiều vào điện thoại có thể gây giảm tập trung và rối loạn giấc ngủ.", question: "이 글의 중심 내용은?", questionVi: "Nội dung chính của đoạn văn là gì?", options: ["스마트폰의 역사", "스마트폰의 장단점", "스마트폰 구매 방법", "스마트폰 수리 방법"], optionsVi: ["Lịch sử điện thoại thông minh", "Ưu và nhược điểm của điện thoại thông minh", "Cách mua điện thoại thông minh", "Cách sửa điện thoại thông minh"], correctIndex: 1, explanation: "Đoạn văn nói về cả lợi ích (tìm kiếm, giao tiếp, mua sắm) và hại (giảm tập trung, rối loạn giấc ngủ) → ưu và nhược điểm.", points: 3 },
      { id: "3a-r2", type: "reading", passage: "환경 문제는 전 세계가 함께 해결해야 할 과제입니다. 기후 변화로 인해 극단적인 날씨 현상이 증가하고 있습니다. 개인도 일상에서 에너지를 절약하고 재활용을 실천함으로써 환경 보호에 기여할 수 있습니다.", passageVi: "Vấn đề môi trường là thách thức mà cả thế giới phải cùng nhau giải quyết. Do biến đổi khí hậu, các hiện tượng thời tiết cực đoan đang gia tăng. Cá nhân cũng có thể đóng góp bảo vệ môi trường bằng cách tiết kiệm năng lượng và thực hành tái chế trong cuộc sống hàng ngày.", question: "개인이 환경 보호를 위해 할 수 있는 것은?", questionVi: "Cá nhân có thể làm gì để bảo vệ môi trường?", options: ["정부 정책 만들기", "에너지 절약과 재활용", "새로운 기술 개발", "환경 단체 설립"], optionsVi: ["Tạo chính sách chính phủ", "Tiết kiệm năng lượng và tái chế", "Phát triển công nghệ mới", "Thành lập tổ chức môi trường"], correctIndex: 1, explanation: "에너지를 절약하고 재활용을 실천함으로써 = bằng cách tiết kiệm năng lượng và thực hành tái chế.", points: 3 },
    ],
  },
  {
    id: "4a",
    name: "Seoul 4A",
    level: "Cao cấp",
    cefr: "B2",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10 border-rose-500/20",
    questions: [
      { id: "4a-v1", type: "vocabulary", question: "다음 중 '논리적'의 반의어는?", questionVi: "Từ trái nghĩa của '논리적' (logic) là gì?", options: ["합리적", "비논리적", "체계적", "분석적"], optionsVi: ["Hợp lý", "Phi logic", "Có hệ thống", "Phân tích"], correctIndex: 1, explanation: "비논리적 = phi logic (tiền tố 비- = phi/không). 논리적 ↔ 비논리적.", points: 2 },
      { id: "4a-g1", type: "grammar", question: "빈칸에 알맞은 것은? 그 문제는 쉽게 해결___ 않는다.", questionVi: "Điền từ phù hợp: Vấn đề đó không dễ dàng ___ giải quyết.", options: ["되지", "하지", "이지", "가지"], optionsVi: ["được giải quyết (bị động)", "làm (chủ động)", "là", "đi"], correctIndex: 0, explanation: "되다 = được (bị động). 해결되다 = được giải quyết. 해결되지 않는다 = không được giải quyết.", points: 3 },
      { id: "4a-g2", type: "grammar", question: "다음 중 올바른 문장은?", questionVi: "Câu nào đúng ngữ pháp?", options: ["그는 성공하기 위해 열심히 노력했다", "그는 성공하려고 위해 열심히 노력했다", "그는 성공하기 때문에 열심히 노력했다", "그는 성공하면서 열심히 노력했다"], optionsVi: ["Anh ấy cố gắng chăm chỉ để thành công (đúng)", "Sai (dùng 2 cấu trúc mục đích)", "Anh ấy cố gắng vì đã thành công (sai)", "Sai"], correctIndex: 0, explanation: "-기 위해(서) = để làm gì (mục đích). 성공하기 위해 = để thành công.", points: 3 },
      { id: "4a-r1", type: "reading", passage: "인공지능 기술의 발전은 우리 사회에 큰 변화를 가져오고 있습니다. 의료, 교육, 제조업 등 다양한 분야에서 AI가 활용되고 있으며, 이는 생산성 향상과 비용 절감에 기여하고 있습니다. 그러나 일자리 감소와 개인정보 보호 문제 등 해결해야 할 과제도 남아 있습니다.", passageVi: "Sự phát triển của công nghệ trí tuệ nhân tạo đang mang lại những thay đổi lớn cho xã hội chúng ta. AI đang được ứng dụng trong nhiều lĩnh vực như y tế, giáo dục, sản xuất, đóng góp vào việc nâng cao năng suất và giảm chi phí. Tuy nhiên, vẫn còn những thách thức cần giải quyết như giảm việc làm và bảo vệ thông tin cá nhân.", question: "AI 기술의 문제점으로 언급된 것은?", questionVi: "Vấn đề của công nghệ AI được đề cập là gì?", options: ["생산성 향상", "비용 절감", "일자리 감소", "의료 발전"], optionsVi: ["Nâng cao năng suất", "Giảm chi phí", "Giảm việc làm", "Phát triển y tế"], correctIndex: 2, explanation: "일자리 감소와 개인정보 보호 문제 = giảm việc làm và vấn đề bảo vệ thông tin cá nhân là những thách thức.", points: 3 },
      { id: "4a-r2", type: "reading", passage: "지속 가능한 발전이란 현재 세대의 필요를 충족시키면서도 미래 세대가 그들의 필요를 충족시킬 수 있는 능력을 저해하지 않는 발전을 의미합니다. 이를 위해서는 경제 성장, 사회적 형평성, 환경 보전이 균형 있게 이루어져야 합니다.", passageVi: "Phát triển bền vững có nghĩa là sự phát triển đáp ứng nhu cầu của thế hệ hiện tại mà không làm tổn hại đến khả năng đáp ứng nhu cầu của các thế hệ tương lai. Để đạt được điều này, cần có sự cân bằng giữa tăng trưởng kinh tế, công bằng xã hội và bảo tồn môi trường.", question: "지속 가능한 발전을 위해 필요한 것은?", questionVi: "Điều gì cần thiết cho phát triển bền vững?", options: ["경제 성장만 중요하다", "환경 보전만 중요하다", "경제, 사회, 환경의 균형", "기술 발전만 중요하다"], optionsVi: ["Chỉ tăng trưởng kinh tế quan trọng", "Chỉ bảo tồn môi trường quan trọng", "Cân bằng kinh tế, xã hội, môi trường", "Chỉ phát triển công nghệ quan trọng"], correctIndex: 2, explanation: "경제 성장, 사회적 형평성, 환경 보전이 균형 있게 이루어져야 합니다 = cần cân bằng kinh tế, xã hội, môi trường.", points: 3 },
    ],
  },
];

type ExamState = "select" | "exam" | "result";

export default function SeoulExamPage() {
  const [examState, setExamState] = useState<ExamState>("select");
  const [selectedBook, setSelectedBook] = useState<SeoulBook | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [xpData, setXpData] = useLocalStorage<{ total: number }>("kts_xp_total", { total: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startExam = (book: SeoulBook) => {
    setSelectedBook(book);
    setCurrentQ(0);
    setAnswers(new Array(book.questions.length).fill(null));
    setShowExplanation(false);
    setTimeLeft(book.questions.length * 90);
    setTimerActive(true);
    setExamState("exam");
  };

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            setExamState("result");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timeLeft]);

  const handleAnswer = (idx: number) => {
    if (!selectedBook) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (!selectedBook) return;
    setShowExplanation(false);
    if (currentQ >= selectedBook.questions.length - 1) {
      setTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setExamState("result");
    } else {
      setCurrentQ(prev => prev + 1);
    }
  };

  const calcScore = () => {
    if (!selectedBook) return { score: 0, total: 0, correct: 0, xp: 0 };
    let correct = 0;
    let score = 0;
    let total = 0;
    selectedBook.questions.forEach((q, i) => {
      total += q.points;
      if (answers[i] === q.correctIndex) {
        correct++;
        score += q.points;
      }
    });
    const xp = score * 5 + (correct === selectedBook.questions.length ? 50 : 0);
    return { score, total, correct, xp };
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const typeLabel: Record<string, string> = { vocabulary: "Từ vựng", grammar: "Ngữ pháp", reading: "Đọc hiểu" };
  const typeColor: Record<string, string> = {
    vocabulary: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    grammar: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    reading: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Bài thi thử Seoul
          </h1>
          <p className="text-white/40 text-sm mt-0.5">Đề thi tổng hợp theo từng cuốn — ngữ pháp + từ vựng + đọc hiểu</p>
        </div>

        {examState === "select" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seoulExams.map(book => (
              <div key={book.id} className={`bg-white/5 border rounded-2xl p-6 hover:bg-white/8 transition-all cursor-pointer group ${book.bgColor}`} onClick={() => startExam(book)}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-bold ${book.color}`}>{book.name}</h3>
                    <p className="text-white/50 text-sm">{book.level} · CEFR {book.cefr}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/30 text-xs">{book.questions.length} câu hỏi</p>
                    <p className="text-white/30 text-xs">{book.questions.length * 90 / 60} phút</p>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  {["vocabulary", "grammar", "reading"].map(type => {
                    const count = book.questions.filter(q => q.type === type).length;
                    if (count === 0) return null;
                    return (
                      <span key={type} className={`px-2 py-0.5 rounded-full text-xs border ${typeColor[type]}`}>
                        {typeLabel[type]}: {count}
                      </span>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-white/30 text-xs">
                    Tổng điểm: {book.questions.reduce((s, q) => s + q.points, 0)} điểm
                  </p>
                  <div className={`flex items-center gap-1 text-sm font-medium ${book.color} group-hover:gap-2 transition-all`}>
                    Bắt đầu thi
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-arrow-right-line text-sm"></i>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {examState === "exam" && selectedBook && (
          <>
            {/* Exam header */}
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-5 py-3">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${selectedBook.bgColor} ${selectedBook.color}`}>
                  {selectedBook.name}
                </span>
                <span className="text-white/40 text-sm">{currentQ + 1} / {selectedBook.questions.length}</span>
              </div>
              <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 60 ? "text-red-400" : "text-white/70"}`}>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-time-line text-base"></i>
                </div>
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Progress */}
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${((currentQ) / selectedBook.questions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            {(() => {
              const q = selectedBook.questions[currentQ];
              const userAnswer = answers[currentQ];
              return (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${typeColor[q.type]}`}>
                      {typeLabel[q.type]}
                    </span>
                    <span className="text-white/30 text-xs">{q.points} điểm</span>
                  </div>

                  {q.passage && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-white/80 text-sm leading-relaxed" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{q.passage}</p>
                      <p className="text-white/40 text-xs mt-2 italic">{q.passageVi}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-white font-semibold text-lg mb-1" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{q.question}</p>
                    <p className="text-white/40 text-sm">{q.questionVi}</p>
                  </div>

                  <div className="space-y-2.5">
                    {q.options.map((opt, i) => {
                      let btnClass = "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20";
                      if (userAnswer !== null) {
                        if (i === q.correctIndex) btnClass = "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";
                        else if (i === userAnswer && userAnswer !== q.correctIndex) btnClass = "bg-red-500/15 border-red-500/30 text-red-400";
                        else btnClass = "bg-white/3 border-white/5 text-white/30";
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => userAnswer === null && handleAnswer(i)}
                          disabled={userAnswer !== null}
                          className={`w-full flex items-center gap-3 border rounded-xl px-4 py-3 text-left transition-all ${userAnswer === null ? "cursor-pointer" : "cursor-default"} ${btnClass}`}
                        >
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-xs font-bold flex-shrink-0">
                            {["①", "②", "③", "④"][i]}
                          </span>
                          <div>
                            <p className="text-sm" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{opt}</p>
                            <p className="text-xs opacity-60">{q.optionsVi[i]}</p>
                          </div>
                          {userAnswer !== null && i === q.correctIndex && (
                            <div className="ml-auto w-5 h-5 flex items-center justify-center">
                              <i className="ri-checkbox-circle-fill text-emerald-400 text-lg"></i>
                            </div>
                          )}
                          {userAnswer !== null && i === userAnswer && userAnswer !== q.correctIndex && (
                            <div className="ml-auto w-5 h-5 flex items-center justify-center">
                              <i className="ri-close-circle-fill text-red-400 text-lg"></i>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {showExplanation && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <i className="ri-lightbulb-flash-line text-amber-400 text-sm"></i>
                        </div>
                        <p className="text-amber-300 text-sm">{q.explanation}</p>
                      </div>
                    </div>
                  )}

                  {userAnswer !== null && (
                    <button
                      onClick={nextQuestion}
                      className="w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 rounded-xl py-3 text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
                    >
                      {currentQ >= selectedBook.questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}
                    </button>
                  )}
                </div>
              );
            })()}
          </>
        )}

        {examState === "result" && selectedBook && (() => {
          const { score, total, correct, xp } = calcScore();
          const pct = Math.round((score / total) * 100);
          const passed = pct >= 60;

          // Award XP
          setTimeout(() => {
            setXpData(prev => ({ total: (prev.total || 0) + xp }));
          }, 100);

          return (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
                <div className={`w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4 ${passed ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                  <i className={`text-4xl ${passed ? "ri-trophy-line text-emerald-400" : "ri-emotion-sad-line text-red-400"}`}></i>
                </div>
                <h3 className="text-white font-bold text-2xl mb-1">{passed ? "Xuất sắc! Đạt yêu cầu!" : "Cần ôn tập thêm!"}</h3>
                <p className="text-white/40 text-sm mb-6">{selectedBook.name} · {selectedBook.level}</p>

                <div className="flex justify-center gap-8 mb-6">
                  <div>
                    <p className={`text-4xl font-bold ${passed ? "text-emerald-400" : "text-red-400"}`}>{pct}%</p>
                    <p className="text-white/40 text-xs mt-1">Tỷ lệ đúng</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-white">{score}/{total}</p>
                    <p className="text-white/40 text-xs mt-1">Điểm số</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-amber-400">+{xp}</p>
                    <p className="text-white/40 text-xs mt-1">XP nhận được</p>
                  </div>
                </div>

                <div className="h-3 bg-white/8 rounded-full overflow-hidden mb-6 max-w-xs mx-auto">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${passed ? "bg-emerald-500" : "bg-red-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => startExam(selectedBook)}
                    className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 rounded-xl px-6 py-2.5 text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
                  >
                    Thi lại
                  </button>
                  <button
                    onClick={() => setExamState("select")}
                    className="bg-white/8 hover:bg-white/12 border border-white/10 text-white/60 rounded-xl px-6 py-2.5 text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
                  >
                    Chọn đề khác
                  </button>
                </div>
              </div>

              {/* Review answers */}
              <div className="bg-white/5 border border-white/8 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">Xem lại đáp án</h3>
                <div className="space-y-3">
                  {selectedBook.questions.map((q, i) => {
                    const isCorrect = answers[i] === q.correctIndex;
                    return (
                      <div key={q.id} className={`flex items-start gap-3 p-3 rounded-xl border ${isCorrect ? "bg-emerald-500/5 border-emerald-500/15" : "bg-red-500/5 border-red-500/15"}`}>
                        <div className={`w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5 ${isCorrect ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                          <i className={`text-sm ${isCorrect ? "ri-check-line text-emerald-400" : "ri-close-line text-red-400"}`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/70 text-sm" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{q.question}</p>
                          <p className="text-white/40 text-xs mt-0.5">{q.questionVi}</p>
                          {!isCorrect && (
                            <p className="text-emerald-400 text-xs mt-1">
                              Đáp án đúng: {q.options[q.correctIndex]} ({q.optionsVi[q.correctIndex]})
                            </p>
                          )}
                        </div>
                        <span className={`text-xs font-medium flex-shrink-0 ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                          {isCorrect ? `+${q.points}đ` : "0đ"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </DashboardLayout>
  );
}
