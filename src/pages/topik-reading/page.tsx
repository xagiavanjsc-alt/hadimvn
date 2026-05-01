import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import ShareResultModal from "@/components/feature/ShareResultModal";

interface ReadingQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface ReadingPassage {
  id: string;
  title: string;
  korean: string;
  vietnamese: string;
  level: "A1" | "A2" | "B1" | "B2";
  topic: string;
  questions: ReadingQuestion[];
  wordCount: number;
}

const LEVELS = [
  { id: "A1", label: "A1 - Sơ cấp 1", color: "#34d399", desc: "Văn bản đơn giản, câu ngắn" },
  { id: "A2", label: "A2 - Sơ cấp 2", color: "#38bdf8", desc: "Thông báo, tin nhắn ngắn" },
  { id: "B1", label: "B1 - Trung cấp 1", color: "#fb923c", desc: "Bài viết về chủ đề quen thuộc" },
  { id: "B2", label: "B2 - Trung cấp 2", color: "#f87171", desc: "Văn bản phức tạp, trừu tượng" },
];

const TOPICS = [
  "Tất cả", "Gia đình", "Công việc", "Du lịch", "Ẩm thực", "Sức khỏe",
  "Giáo dục", "Xã hội", "Văn hóa", "Môi trường", "Công nghệ",
];

const PASSAGES: ReadingPassage[] = [
  {
    id: "p1",
    title: "Giới thiệu bản thân",
    korean: `안녕하세요. 저는 민준이에요. 저는 학생이에요. 저는 서울에 살아요. 저는 한국어를 공부해요. 한국어는 재미있어요. 저는 매일 한국어를 공부해요. 저는 한국 음식을 좋아해요. 특히 김치찌개를 좋아해요. 저는 K-pop도 좋아해요.`,
    vietnamese: `Xin chào. Tôi là Minjun. Tôi là học sinh. Tôi sống ở Seoul. Tôi học tiếng Hàn. Tiếng Hàn rất thú vị. Tôi học tiếng Hàn mỗi ngày. Tôi thích đồ ăn Hàn Quốc. Đặc biệt tôi thích kimchi jjigae. Tôi cũng thích K-pop.`,
    level: "A1",
    topic: "Gia đình",
    wordCount: 52,
    questions: [
      {
        id: "q1",
        question: "민준이는 어디에 살아요? (Minjun sống ở đâu?)",
        options: ["부산", "서울", "인천", "대구"],
        answer: 1,
        explanation: "본문에서 '저는 서울에 살아요' — Tôi sống ở Seoul.",
      },
      {
        id: "q2",
        question: "민준이가 특히 좋아하는 음식은 무엇이에요? (Món ăn Minjun đặc biệt thích là gì?)",
        options: ["비빔밥", "불고기", "김치찌개", "삼겹살"],
        answer: 2,
        explanation: "'특히 김치찌개를 좋아해요' — Đặc biệt thích kimchi jjigae.",
      },
      {
        id: "q3",
        question: "민준이는 무엇을 공부해요? (Minjun học gì?)",
        options: ["영어", "중국어", "일본어", "한국어"],
        answer: 3,
        explanation: "'저는 한국어를 공부해요' — Tôi học tiếng Hàn.",
      },
    ],
  },
  {
    id: "p2",
    title: "주말 계획 (Kế hoạch cuối tuần)",
    korean: `이번 주말에 친구들과 함께 한강 공원에 갈 거예요. 우리는 자전거를 탈 거예요. 그리고 치킨과 맥주를 먹을 거예요. 날씨가 좋으면 좋겠어요. 비가 오면 영화관에 갈 거예요. 요즘 재미있는 영화가 많아요. 주말이 빨리 왔으면 좋겠어요.`,
    vietnamese: `Cuối tuần này tôi sẽ đi công viên Hangang cùng bạn bè. Chúng tôi sẽ đạp xe. Và sẽ ăn gà và uống bia. Mong trời đẹp. Nếu trời mưa sẽ đi rạp chiếu phim. Dạo này có nhiều phim hay. Mong cuối tuần đến nhanh.`,
    level: "A2",
    topic: "Du lịch",
    wordCount: 68,
    questions: [
      {
        id: "q1",
        question: "이번 주말에 어디에 갈 거예요? (Cuối tuần này sẽ đi đâu?)",
        options: ["산", "바다", "한강 공원", "놀이공원"],
        answer: 2,
        explanation: "'한강 공원에 갈 거예요' — Sẽ đi công viên Hangang.",
      },
      {
        id: "q2",
        question: "비가 오면 어디에 갈 거예요? (Nếu trời mưa sẽ đi đâu?)",
        options: ["카페", "영화관", "도서관", "집"],
        answer: 1,
        explanation: "'비가 오면 영화관에 갈 거예요' — Nếu mưa sẽ đi rạp chiếu phim.",
      },
      {
        id: "q3",
        question: "한강 공원에서 무엇을 할 거예요? (Sẽ làm gì ở công viên Hangang?)",
        options: ["수영", "자전거 타기", "낚시", "등산"],
        answer: 1,
        explanation: "'자전거를 탈 거예요' — Sẽ đạp xe.",
      },
    ],
  },
  {
    id: "p3",
    title: "한국의 음식 문화 (Văn hóa ẩm thực Hàn Quốc)",
    korean: `한국 음식은 세계적으로 유명해졌습니다. 특히 김치, 불고기, 비빔밥은 외국인들에게도 인기가 많습니다. 한국 음식의 특징은 발효 식품이 많다는 것입니다. 김치는 배추를 소금에 절여서 만드는 발효 식품입니다. 한국 사람들은 식사할 때 여러 가지 반찬을 함께 먹습니다. 이것을 '한상차림'이라고 합니다. 최근에는 한국 음식이 건강에 좋다는 연구 결과가 많이 나오고 있습니다.`,
    vietnamese: `Ẩm thực Hàn Quốc đã nổi tiếng trên toàn thế giới. Đặc biệt kimchi, bulgogi, bibimbap rất được người nước ngoài yêu thích. Đặc điểm của ẩm thực Hàn Quốc là có nhiều thực phẩm lên men. Kimchi là thực phẩm lên men được làm từ cải thảo ướp muối. Người Hàn Quốc ăn cùng nhiều món phụ khi dùng bữa. Điều này được gọi là 'hansang charim'. Gần đây có nhiều kết quả nghiên cứu cho thấy ẩm thực Hàn Quốc tốt cho sức khỏe.`,
    level: "B1",
    topic: "Văn hóa",
    wordCount: 95,
    questions: [
      {
        id: "q1",
        question: "한국 음식의 특징은 무엇입니까? (Đặc điểm của ẩm thực Hàn Quốc là gì?)",
        options: ["매운 음식이 많다", "발효 식품이 많다", "달콤한 음식이 많다", "기름진 음식이 많다"],
        answer: 1,
        explanation: "'한국 음식의 특징은 발효 식품이 많다는 것입니다' — Đặc điểm là có nhiều thực phẩm lên men.",
      },
      {
        id: "q2",
        question: "'한상차림'이란 무엇입니까? (Hansang charim là gì?)",
        options: ["한국 전통 의상", "여러 반찬을 함께 먹는 것", "한국 전통 음악", "발효 식품"],
        answer: 1,
        explanation: "'여러 가지 반찬을 함께 먹습니다. 이것을 한상차림이라고 합니다' — Ăn cùng nhiều món phụ.",
      },
      {
        id: "q3",
        question: "김치는 어떻게 만듭니까? (Kimchi được làm như thế nào?)",
        options: ["고기를 구워서", "배추를 소금에 절여서", "채소를 볶아서", "생선을 말려서"],
        answer: 1,
        explanation: "'배추를 소금에 절여서 만드는 발효 식품' — Làm từ cải thảo ướp muối.",
      },
      {
        id: "q4",
        question: "외국인들에게 인기 있는 한국 음식이 아닌 것은? (Món không phổ biến với người nước ngoài?)",
        options: ["김치", "불고기", "비빔밥", "순대국밥"],
        answer: 3,
        explanation: "본문에서 언급된 인기 음식은 김치, 불고기, 비빔밥입니다.",
      },
    ],
  },
  {
    id: "p4",
    title: "환경 문제와 해결책 (Vấn đề môi trường và giải pháp)",
    korean: `현대 사회에서 환경 문제는 매우 심각한 수준에 이르렀습니다. 기후 변화, 미세먼지, 플라스틱 오염 등 다양한 환경 문제가 우리의 일상생활에 영향을 미치고 있습니다. 특히 플라스틱 쓰레기 문제는 해양 생태계를 위협하고 있습니다. 이러한 문제를 해결하기 위해 개인과 기업, 정부가 함께 노력해야 합니다. 개인은 일회용품 사용을 줄이고 재활용을 생활화해야 합니다. 기업은 친환경 제품을 개발하고 탄소 배출을 줄여야 합니다. 정부는 강력한 환경 정책을 시행하고 국제 협력을 강화해야 합니다.`,
    vietnamese: `Trong xã hội hiện đại, vấn đề môi trường đã đạt đến mức độ rất nghiêm trọng. Các vấn đề môi trường đa dạng như biến đổi khí hậu, bụi mịn, ô nhiễm nhựa đang ảnh hưởng đến cuộc sống hàng ngày của chúng ta. Đặc biệt vấn đề rác thải nhựa đang đe dọa hệ sinh thái biển. Để giải quyết những vấn đề này, cá nhân, doanh nghiệp và chính phủ cần cùng nhau nỗ lực. Cá nhân cần giảm sử dụng đồ dùng một lần và thực hành tái chế. Doanh nghiệp cần phát triển sản phẩm thân thiện môi trường và giảm phát thải carbon. Chính phủ cần thực thi chính sách môi trường mạnh mẽ và tăng cường hợp tác quốc tế.`,
    level: "B2",
    topic: "Môi trường",
    wordCount: 120,
    questions: [
      {
        id: "q1",
        question: "플라스틱 쓰레기 문제가 위협하는 것은? (Vấn đề rác thải nhựa đe dọa điều gì?)",
        options: ["대기 환경", "해양 생태계", "토양 오염", "수질 오염"],
        answer: 1,
        explanation: "'플라스틱 쓰레기 문제는 해양 생태계를 위협하고 있습니다' — Đe dọa hệ sinh thái biển.",
      },
      {
        id: "q2",
        question: "개인이 해야 할 일이 아닌 것은? (Điều cá nhân không cần làm?)",
        options: ["일회용품 사용 줄이기", "재활용 생활화", "친환경 제품 개발", "환경 문제 인식"],
        answer: 2,
        explanation: "친환경 제품 개발은 기업이 해야 할 일입니다.",
      },
      {
        id: "q3",
        question: "정부의 역할로 언급된 것은? (Vai trò của chính phủ được đề cập?)",
        options: ["재활용 생활화", "탄소 배출 줄이기", "강력한 환경 정책 시행", "일회용품 사용 줄이기"],
        answer: 2,
        explanation: "'정부는 강력한 환경 정책을 시행하고 국제 협력을 강화해야 합니다'",
      },
      {
        id: "q4",
        question: "이 글의 주제는 무엇입니까? (Chủ đề của bài viết này là gì?)",
        options: ["기후 변화의 원인", "환경 문제와 해결책", "플라스틱의 역사", "재활용 방법"],
        answer: 1,
        explanation: "본문은 환경 문제의 심각성과 개인/기업/정부의 해결책을 다루고 있습니다.",
      },
    ],
  },
  {
    id: "p5",
    title: "직장 생활 (Cuộc sống công sở)",
    korean: `저는 서울에 있는 IT 회사에 다니고 있습니다. 매일 아침 9시에 출근해서 저녁 6시에 퇴근합니다. 점심시간은 12시부터 1시까지입니다. 우리 회사는 분위기가 좋아서 동료들과 사이가 좋습니다. 매주 금요일에는 팀 회의가 있습니다. 회의에서 이번 주 업무를 보고하고 다음 주 계획을 세웁니다. 가끔 야근을 해야 할 때도 있지만 회사에서 야근 수당을 줍니다.`,
    vietnamese: `Tôi đang làm việc tại một công ty IT ở Seoul. Mỗi ngày tôi đi làm lúc 9 giờ sáng và tan làm lúc 6 giờ tối. Giờ nghỉ trưa từ 12 giờ đến 1 giờ. Công ty tôi có không khí tốt nên quan hệ với đồng nghiệp rất tốt. Mỗi tuần thứ Sáu có họp nhóm. Trong cuộc họp báo cáo công việc tuần này và lên kế hoạch tuần sau. Đôi khi phải làm thêm giờ nhưng công ty trả phụ cấp làm thêm giờ.`,
    level: "B1",
    topic: "Công việc",
    wordCount: 88,
    questions: [
      {
        id: "q1",
        question: "이 사람은 몇 시에 출근합니까? (Người này đi làm lúc mấy giờ?)",
        options: ["8시", "9시", "10시", "11시"],
        answer: 1,
        explanation: "'매일 아침 9시에 출근해서' — Mỗi ngày đi làm lúc 9 giờ.",
      },
      {
        id: "q2",
        question: "팀 회의는 언제 있습니까? (Họp nhóm vào khi nào?)",
        options: ["매일", "매주 월요일", "매주 금요일", "매달"],
        answer: 2,
        explanation: "'매주 금요일에는 팀 회의가 있습니다' — Mỗi tuần thứ Sáu.",
      },
      {
        id: "q3",
        question: "야근을 하면 회사에서 무엇을 줍니까? (Làm thêm giờ công ty cho gì?)",
        options: ["휴가", "야근 수당", "선물", "승진"],
        answer: 1,
        explanation: "'회사에서 야근 수당을 줍니다' — Công ty trả phụ cấp làm thêm giờ.",
      },
    ],
  },
  {
    id: "p6",
    title: "건강한 생활 습관 (Thói quen sống lành mạnh)",
    korean: `건강한 생활을 위해서는 규칙적인 운동과 균형 잡힌 식사가 중요합니다. 전문가들은 하루에 30분 이상 운동할 것을 권장합니다. 걷기, 수영, 자전거 타기 등 유산소 운동이 심장 건강에 좋습니다. 또한 충분한 수면도 건강에 매우 중요합니다. 성인은 하루에 7~8시간 자는 것이 좋습니다. 스트레스 관리도 건강의 중요한 부분입니다. 명상이나 취미 활동을 통해 스트레스를 해소하는 것이 좋습니다.`,
    vietnamese: `Để có cuộc sống lành mạnh, tập thể dục đều đặn và ăn uống cân bằng rất quan trọng. Các chuyên gia khuyến nghị tập thể dục ít nhất 30 phút mỗi ngày. Các bài tập aerobic như đi bộ, bơi lội, đạp xe tốt cho sức khỏe tim mạch. Ngoài ra ngủ đủ giấc cũng rất quan trọng cho sức khỏe. Người lớn nên ngủ 7-8 tiếng mỗi ngày. Quản lý stress cũng là phần quan trọng của sức khỏe. Nên giải tỏa stress qua thiền định hoặc hoạt động sở thích.`,
    level: "B1",
    topic: "Sức khỏe",
    wordCount: 92,
    questions: [
      {
        id: "q1",
        question: "전문가들이 권장하는 하루 운동 시간은? (Thời gian tập thể dục chuyên gia khuyến nghị?)",
        options: ["10분 이상", "20분 이상", "30분 이상", "1시간 이상"],
        answer: 2,
        explanation: "'하루에 30분 이상 운동할 것을 권장합니다' — Khuyến nghị tập ít nhất 30 phút.",
      },
      {
        id: "q2",
        question: "성인의 권장 수면 시간은? (Thời gian ngủ khuyến nghị cho người lớn?)",
        options: ["5~6시간", "6~7시간", "7~8시간", "8~9시간"],
        answer: 2,
        explanation: "'성인은 하루에 7~8시간 자는 것이 좋습니다'",
      },
      {
        id: "q3",
        question: "스트레스 해소 방법으로 언급된 것은? (Phương pháp giải tỏa stress được đề cập?)",
        options: ["운동", "명상이나 취미 활동", "충분한 수면", "균형 잡힌 식사"],
        answer: 1,
        explanation: "'명상이나 취미 활동을 통해 스트레스를 해소하는 것이 좋습니다'",
      },
    ],
  },
  {
    id: "p7",
    title: "한국의 교육 제도 (Hệ thống giáo dục Hàn Quốc)",
    korean: `한국의 교육 제도는 초등학교 6년, 중학교 3년, 고등학교 3년으로 구성되어 있습니다. 대학교 입학을 위해서는 수능 시험을 봐야 합니다. 수능은 매년 11월에 실시되며 한국에서 가장 중요한 시험 중 하나입니다. 한국 학생들은 학업에 대한 압박이 매우 큽니다. 많은 학생들이 학교 수업 외에도 학원에 다닙니다. 최근에는 교육의 다양성을 위해 다양한 교육 정책이 시행되고 있습니다.`,
    vietnamese: `Hệ thống giáo dục Hàn Quốc gồm 6 năm tiểu học, 3 năm trung học cơ sở, 3 năm trung học phổ thông. Để vào đại học phải thi kỳ thi Suneung. Suneung được tổ chức vào tháng 11 hàng năm và là một trong những kỳ thi quan trọng nhất ở Hàn Quốc. Học sinh Hàn Quốc chịu áp lực học tập rất lớn. Nhiều học sinh ngoài giờ học ở trường còn đi học thêm ở hagwon. Gần đây nhiều chính sách giáo dục đa dạng đang được thực thi để đa dạng hóa giáo dục.`,
    level: "B2",
    topic: "Giáo dục",
    wordCount: 98,
    questions: [
      {
        id: "q1",
        question: "한국 중학교는 몇 년입니까? (Trung học cơ sở Hàn Quốc mấy năm?)",
        options: ["2년", "3년", "4년", "6년"],
        answer: 1,
        explanation: "'중학교 3년' — Trung học cơ sở 3 năm.",
      },
      {
        id: "q2",
        question: "수능 시험은 언제 실시됩니까? (Kỳ thi Suneung được tổ chức khi nào?)",
        options: ["3월", "6월", "9월", "11월"],
        answer: 3,
        explanation: "'수능은 매년 11월에 실시됩니다' — Tổ chức vào tháng 11 hàng năm.",
      },
      {
        id: "q3",
        question: "학원이란 무엇입니까? (Hagwon là gì?)",
        options: ["학교 도서관", "학교 외 사교육 기관", "대학교", "유치원"],
        answer: 1,
        explanation: "학원은 학교 수업 외에 다니는 사교육 기관입니다.",
      },
      {
        id: "q4",
        question: "이 글의 내용과 맞지 않는 것은? (Điều không đúng với nội dung bài?)",
        options: [
          "초등학교는 6년이다",
          "수능은 매년 11월에 있다",
          "한국 학생들은 학업 압박이 크다",
          "한국에는 학원이 없다",
        ],
        answer: 3,
        explanation: "본문에서 '많은 학생들이 학원에 다닙니다'라고 했으므로 학원이 없다는 것은 틀립니다.",
      },
    ],
  },
  {
    id: "p8",
    title: "한국의 명절 (Ngày lễ Hàn Quốc)",
    korean: `한국에는 설날과 추석이라는 두 가지 큰 명절이 있습니다. 설날은 음력 1월 1일로 새해를 맞이하는 날입니다. 이날 가족들이 모여 차례를 지내고 어른들께 세배를 드립니다. 세배를 하면 어른들이 세뱃돈을 줍니다. 추석은 음력 8월 15일로 한국의 추수감사절입니다. 추석에는 송편을 만들어 먹고 성묘를 갑니다. 두 명절 모두 가족이 함께 모이는 중요한 날입니다.`,
    vietnamese: `Hàn Quốc có hai ngày lễ lớn là Tết Seollal và Chuseok. Seollal là ngày 1 tháng 1 âm lịch, ngày đón năm mới. Ngày này gia đình tụ họp làm lễ charye và cúi chào người lớn tuổi (sebae). Khi làm sebae người lớn sẽ cho tiền mừng tuổi (sebaedon). Chuseok là ngày 15 tháng 8 âm lịch, là lễ tạ ơn mùa màng của Hàn Quốc. Vào Chuseok làm và ăn songpyeon, đi tảo mộ. Cả hai ngày lễ đều là ngày quan trọng để gia đình sum họp.`,
    level: "A2",
    topic: "Văn hóa",
    wordCount: 85,
    questions: [
      {
        id: "q1",
        question: "설날은 언제입니까? (Seollal là ngày nào?)",
        options: ["양력 1월 1일", "음력 1월 1일", "음력 8월 15일", "양력 8월 15일"],
        answer: 1,
        explanation: "'설날은 음력 1월 1일' — Seollal là ngày 1 tháng 1 âm lịch.",
      },
      {
        id: "q2",
        question: "세배를 하면 무엇을 받습니까? (Làm sebae nhận được gì?)",
        options: ["선물", "음식", "세뱃돈", "옷"],
        answer: 2,
        explanation: "'세배를 하면 어른들이 세뱃돈을 줍니다' — Nhận tiền mừng tuổi.",
      },
      {
        id: "q3",
        question: "추석에 먹는 음식은 무엇입니까? (Món ăn trong Chuseok là gì?)",
        options: ["떡국", "송편", "만두", "잡채"],
        answer: 1,
        explanation: "'추석에는 송편을 만들어 먹고' — Ăn songpyeon.",
      },
    ],
  },
];

type Phase = "setup" | "reading" | "result";

export default function TopikReadingPage() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedLevel, setSelectedLevel] = useState<string>("B1");
  const [selectedTopic, setSelectedTopic] = useState<string>("Tất cả");
  const [showVietnamese, setShowVietnamese] = useState(false);
  const [currentPassageIdx, setCurrentPassageIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [score, setScore] = useState(0);
  const [wrongItems, setWrongItems] = useState<{ passage: string; question: string; correct: string }[]>([]);
  const [resultFilter, setResultFilter] = useState<"all" | "correct" | "wrong">("all");
  const [saving, setSaving] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const filteredPassages = PASSAGES.filter((p) => {
    const levelMatch = p.level === selectedLevel;
    const topicMatch = selectedTopic === "Tất cả" || p.topic === selectedTopic;
    return levelMatch && topicMatch;
  });

  const currentPassage = passages[currentPassageIdx];
  const currentQuestion = currentPassage?.questions[currentQuestionIdx];
  const totalQuestions = passages.reduce((s, p) => s + p.questions.length, 0);
  const answeredCount = answers.filter((a) => a !== null).length;

  // Timer
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [timerActive, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && timerActive && phase === "reading") {
      handleNextQuestion();
    }
  }, [timeLeft]);

  const startQuiz = () => {
    const selected = filteredPassages.length > 0 ? filteredPassages : PASSAGES.filter((p) => p.level === selectedLevel);
    setPassages(selected);
    setCurrentPassageIdx(0);
    setCurrentQuestionIdx(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowVietnamese(false);
    setScore(0);
    setWrongItems([]);
    setTimeLeft(45);
    setTimerActive(true);
    setPhase("reading");
  };

  const handleSelectAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    setTimerActive(false);
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (idx === currentQuestion.answer) {
      setScore((s) => s + 1);
    } else {
      setWrongItems((prev) => [
        ...prev,
        {
          passage: currentPassage.title,
          question: currentQuestion.question,
          correct: currentQuestion.options[currentQuestion.answer],
        },
      ]);
    }
  };

  const handleNextQuestion = useCallback(() => {
    if (!currentPassage) return;
    const nextQIdx = currentQuestionIdx + 1;
    if (nextQIdx < currentPassage.questions.length) {
      setCurrentQuestionIdx(nextQIdx);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(45);
      setTimerActive(true);
    } else {
      const nextPIdx = currentPassageIdx + 1;
      if (nextPIdx < passages.length) {
        setCurrentPassageIdx(nextPIdx);
        setCurrentQuestionIdx(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setShowVietnamese(false);
        setTimeLeft(45);
        setTimerActive(true);
      } else {
        setTimerActive(false);
        setPhase("result");
        saveResult();
      }
    }
  }, [currentPassageIdx, currentQuestionIdx, currentPassage, passages]);

  const saveResult = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from("topik_quiz_history").insert({
        user_id: user.id,
        quiz_type: "reading",
        level: selectedLevel,
        topic: selectedTopic,
        score,
        total: totalQuestions,
        wrong_words: wrongItems,
      });
    } catch (err) {
      console.error("Save error:", err);
    }
    setSaving(false);
  };

  const levelInfo = LEVELS.find((l) => l.id === selectedLevel);
  const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const timerPct = (timeLeft / 45) * 100;
  const timerColor = timeLeft > 20 ? "#34d399" : timeLeft > 10 ? "#e8c84a" : "#f87171";

  // Global question index
  let globalQIdx = 0;
  for (let i = 0; i < currentPassageIdx; i++) globalQIdx += passages[i]?.questions.length || 0;
  globalQIdx += currentQuestionIdx;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Luyện đọc TOPIK</h1>
          <p className="text-white/40 text-sm">Đọc đoạn văn tiếng Hàn và trả lời câu hỏi trắc nghiệm</p>
        </div>

        {/* SETUP PHASE */}
        {phase === "setup" && (
          <div className="space-y-6">
            {/* Level select */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <p className="text-white/60 text-sm font-medium mb-4">Chọn cấp độ</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {LEVELS.map((lv) => (
                  <button
                    key={lv.id}
                    onClick={() => setSelectedLevel(lv.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedLevel === lv.id
                        ? "border-opacity-60 bg-opacity-10"
                        : "border-white/8 bg-white/2 hover:bg-white/5"
                    }`}
                    style={
                      selectedLevel === lv.id
                        ? { borderColor: lv.color, backgroundColor: `${lv.color}12` }
                        : {}
                    }
                  >
                    <span
                      className="text-lg font-bold block mb-1"
                      style={{ color: selectedLevel === lv.id ? lv.color : "rgba(255,255,255,0.6)" }}
                    >
                      {lv.id}
                    </span>
                    <p className="text-white/40 text-xs leading-tight">{lv.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic select */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <p className="text-white/60 text-sm font-medium mb-4">Chọn chủ đề</p>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTopic(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      selectedTopic === t
                        ? "bg-[#e8c84a]/15 text-[#e8c84a] border border-[#e8c84a]/30"
                        : "bg-white/5 text-white/40 border border-white/8 hover:text-white/70"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <p className="text-white/60 text-sm font-medium mb-3">Đoạn văn có sẵn</p>
              <div className="space-y-2">
                {filteredPassages.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-4">Không có đoạn văn phù hợp. Thử chọn chủ đề khác.</p>
                ) : (
                  filteredPassages.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor: `${LEVELS.find((l) => l.id === p.level)?.color}20`,
                          color: LEVELS.find((l) => l.id === p.level)?.color,
                        }}
                      >
                        {p.level}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-sm font-medium truncate">{p.title}</p>
                        <p className="text-white/30 text-xs">{p.topic} · {p.wordCount} từ · {p.questions.length} câu hỏi</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={startQuiz}
              disabled={filteredPassages.length === 0}
              className="w-full py-4 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: levelInfo?.color, color: "#0f1117" }}
            >
              <i className="ri-book-open-line mr-2"></i>
              Bắt đầu luyện đọc ({filteredPassages.length} đoạn văn · {filteredPassages.reduce((s, p) => s + p.questions.length, 0)} câu hỏi)
            </button>
          </div>
        )}

        {/* READING PHASE */}
        {phase === "reading" && currentPassage && currentQuestion && (
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/6 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#e8c84a] rounded-full transition-all duration-300"
                  style={{ width: `${((globalQIdx) / totalQuestions) * 100}%` }}
                ></div>
              </div>
              <span className="text-white/40 text-xs whitespace-nowrap">{globalQIdx + 1}/{totalQuestions}</span>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
                ></div>
              </div>
              <span className="text-xs font-mono font-bold" style={{ color: timerColor }}>{timeLeft}s</span>
            </div>

            {/* Passage card */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{
                      backgroundColor: `${levelInfo?.color}20`,
                      color: levelInfo?.color,
                    }}
                  >
                    {currentPassage.level}
                  </span>
                  <span className="text-white/50 text-sm font-medium">{currentPassage.title}</span>
                  <span className="text-white/25 text-xs">{currentPassage.topic}</span>
                </div>
                <button
                  onClick={() => setShowVietnamese((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className={`${showVietnamese ? "ri-eye-off-line" : "ri-eye-line"} text-xs`}></i>
                  {showVietnamese ? "Ẩn dịch" : "Xem dịch"}
                </button>
              </div>

              {/* Korean text */}
              <div className="bg-white/3 rounded-xl p-4 mb-3">
                <p className="text-white/85 text-base leading-relaxed font-medium" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                  {currentPassage.korean}
                </p>
              </div>

              {/* Vietnamese translation */}
              {showVietnamese && (
                <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/10 rounded-xl p-4">
                  <p className="text-[#e8c84a]/70 text-xs mb-1 font-medium">Bản dịch tiếng Việt</p>
                  <p className="text-white/60 text-sm leading-relaxed">{currentPassage.vietnamese}</p>
                </div>
              )}
            </div>

            {/* Question */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <p className="text-white/40 text-xs mb-2">Câu hỏi {currentQuestionIdx + 1}/{currentPassage.questions.length}</p>
              <p className="text-white/90 text-base font-medium mb-4 leading-relaxed">{currentQuestion.question}</p>

              <div className="space-y-2">
                {currentQuestion.options.map((opt, idx) => {
                  let cls = "border-white/8 bg-white/3 text-white/70 hover:bg-white/8 hover:border-white/20";
                  if (selectedAnswer !== null) {
                    if (idx === currentQuestion.answer) cls = "border-[#34d399]/50 bg-[#34d399]/10 text-[#34d399]";
                    else if (idx === selectedAnswer) cls = "border-[#f87171]/50 bg-[#f87171]/10 text-[#f87171]";
                    else cls = "border-white/5 bg-white/2 text-white/30";
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      disabled={selectedAnswer !== null}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${cls}`}
                    >
                      <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm">{opt}</span>
                      {selectedAnswer !== null && idx === currentQuestion.answer && (
                        <i className="ri-check-line ml-auto text-[#34d399]"></i>
                      )}
                      {selectedAnswer === idx && idx !== currentQuestion.answer && (
                        <i className="ri-close-line ml-auto text-[#f87171]"></i>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div className="mt-4 p-4 bg-white/3 rounded-xl border border-white/8">
                  <p className="text-white/40 text-xs mb-1 font-medium">Giải thích</p>
                  <p className="text-white/70 text-sm leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              )}

              {selectedAnswer !== null && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full mt-4 py-3 rounded-xl font-semibold text-sm bg-[#e8c84a]/15 text-[#e8c84a] hover:bg-[#e8c84a]/25 transition-all cursor-pointer whitespace-nowrap"
                >
                  {globalQIdx + 1 >= totalQuestions ? "Xem kết quả" : "Câu tiếp theo"}
                  <i className="ri-arrow-right-line ml-2"></i>
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULT PHASE */}
        {phase === "result" && (
          <div className="space-y-5">
            {/* Score card */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${pct >= 80 ? "#34d399" : pct >= 60 ? "#e8c84a" : "#f87171"}20` }}
              >
                <p className="text-3xl font-bold" style={{ color: pct >= 80 ? "#34d399" : pct >= 60 ? "#e8c84a" : "#f87171" }}>
                  {pct}%
                </p>
              </div>
              <p className="text-white/80 text-xl font-bold mb-1">
                {pct >= 80 ? "Xuất sắc!" : pct >= 60 ? "Khá tốt!" : "Cần cố gắng thêm!"}
              </p>
              <p className="text-white/40 text-sm mb-4">
                {score}/{totalQuestions} câu đúng · Cấp độ {selectedLevel}
              </p>
              {saving && <p className="text-white/30 text-xs">Đang lưu kết quả...</p>}
              {!user && <p className="text-white/25 text-xs">Đăng nhập để lưu kết quả lên cloud</p>}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Đúng", value: score, color: "#34d399" },
                { label: "Sai", value: totalQuestions - score, color: "#f87171" },
                { label: "Đoạn văn", value: passages.length, color: "#e8c84a" },
              ].map((s) => (
                <div key={s.label} className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-white/30 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              {(["all", "correct", "wrong"] as const).map((f) => {
                const labels = { all: "Tất cả", correct: "Đúng", wrong: "Sai" };
                return (
                  <button
                    key={f}
                    onClick={() => setResultFilter(f)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      resultFilter === f ? "bg-[#e8c84a]/15 text-[#e8c84a]" : "bg-white/5 text-white/40 hover:text-white/70"
                    }`}
                  >
                    {labels[f]}
                  </button>
                );
              })}
            </div>

            {/* Review list */}
            <div className="space-y-3">
              {passages.map((passage, pIdx) =>
                passage.questions.map((q, qIdx) => {
                  let globalIdx = 0;
                  for (let i = 0; i < pIdx; i++) globalIdx += passages[i].questions.length;
                  globalIdx += qIdx;
                  const userAns = answers[globalIdx];
                  const isCorrect = userAns === q.answer;
                  if (resultFilter === "correct" && !isCorrect) return null;
                  if (resultFilter === "wrong" && isCorrect) return null;
                  return (
                    <div
                      key={`${pIdx}-${qIdx}`}
                      className="bg-white/3 border rounded-xl p-4"
                      style={{ borderColor: isCorrect ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)" }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: isCorrect ? "#34d39920" : "#f8717120" }}
                        >
                          <i
                            className={`${isCorrect ? "ri-check-line text-[#34d399]" : "ri-close-line text-[#f87171]"} text-xs`}
                          ></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/30 text-xs mb-1">{passage.title}</p>
                          <p className="text-white/70 text-sm mb-2">{q.question}</p>
                          {!isCorrect && (
                            <div className="space-y-1">
                              <p className="text-[#f87171] text-xs">
                                Bạn chọn: {userAns !== null && userAns !== undefined ? q.options[userAns] : "Không trả lời"}
                              </p>
                              <p className="text-[#34d399] text-xs">Đáp án đúng: {q.options[q.answer]}</p>
                            </div>
                          )}
                          <p className="text-white/30 text-xs mt-2 italic">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setPhase("setup")}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-white/5 text-white/60 hover:bg-white/10 transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-refresh-line mr-2"></i>
                Làm lại
              </button>
              <button
                onClick={() => setShowShare(true)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-white/5 text-white/60 hover:bg-white/10 transition-all cursor-pointer whitespace-nowrap border border-white/8"
              >
                <i className="ri-share-line mr-2"></i>Chia sẻ
              </button>
            <button
                onClick={() => {
                  const content = wrongItems
                    .map((w) => `Đoạn: ${w.passage}\nCâu hỏi: ${w.question}\nĐáp án đúng: ${w.correct}`)
                    .join("\n\n---\n\n");
                  const win = window.open("", "_blank");
                  if (!win) return;
                  win.document.write(`<html><head><title>Từ sai - Luyện đọc TOPIK</title><style>body{font-family:sans-serif;padding:24px;max-width:700px;margin:auto}h2{color:#333}p{line-height:1.6;color:#555}hr{border:1px solid #eee;margin:16px 0}</style></head><body><h2>Câu sai - Luyện đọc TOPIK ${selectedLevel}</h2>${content.split("\n").map((l) => `<p>${l}</p>`).join("")}</body></html>`);
                  win.print();
                }}
                disabled={wrongItems.length === 0}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-[#e8c84a]/10 text-[#e8c84a] hover:bg-[#e8c84a]/20 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
              >
                <i className="ri-file-pdf-line mr-2"></i>
                Xuất câu sai PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
