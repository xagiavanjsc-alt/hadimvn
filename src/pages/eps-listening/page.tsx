import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import { EPS_LESSON_TOPICS } from "@/mocks/epsLessons";
import { usePageSEO } from "@/hooks/usePageSEO";
import { SITE_URL } from "@/lib/siteConfig";

// ─── Types ────────────────────────────────────────────────────────────────
interface ListeningQuestion {
  id: string;
  topic: string;
  level: "easy" | "medium" | "hard";
  audioText: string;
  audioTextVi: string;
  question: string;
  questionVi: string;
  options: string[];
  optionsVi: string[];
  correctIndex: number;
  explanation: string;
  context?: string;
  contextVi?: string;
}

// ─── Mock listening questions (dùng Web Speech API để đọc) ───────────────
const LISTENING_QUESTIONS: ListeningQuestion[] = [
  {
    id: "lq1",
    topic: "greeting",
    level: "easy",
    audioText: "안녕하세요. 저는 김민준이에요. 베트남에서 왔어요. 만나서 반가워요.",
    audioTextVi: "Xin chào. Tôi là Kim Minjun. Tôi đến từ Việt Nam. Rất vui được gặp bạn.",
    question: "이 사람은 어느 나라에서 왔어요?",
    questionVi: "Người này đến từ nước nào?",
    options: ["한국", "베트남", "중국", "일본"],
    optionsVi: ["Hàn Quốc", "Việt Nam", "Trung Quốc", "Nhật Bản"],
    correctIndex: 1,
    explanation: "\"베트남에서 왔어요\" = đến từ Việt Nam.",
  },
  {
    id: "lq2",
    topic: "workplace",
    level: "easy",
    audioText: "오늘 오전 아홉 시에 회의가 있어요. 회의실은 삼 층에 있어요. 늦지 마세요.",
    audioTextVi: "Hôm nay lúc 9 giờ sáng có cuộc họp. Phòng họp ở tầng 3. Đừng đến muộn.",
    question: "회의는 몇 시에 있어요?",
    questionVi: "Cuộc họp lúc mấy giờ?",
    options: ["오전 여덟 시", "오전 아홉 시", "오전 열 시", "오후 두 시"],
    optionsVi: ["8 giờ sáng", "9 giờ sáng", "10 giờ sáng", "2 giờ chiều"],
    correctIndex: 1,
    explanation: "\"오전 아홉 시에 회의가 있어요\" = có cuộc họp lúc 9 giờ sáng.",
  },
  {
    id: "lq3",
    topic: "safety",
    level: "easy",
    audioText: "작업장에 들어가기 전에 안전모와 안전화를 반드시 착용하세요. 안전이 제일 중요합니다.",
    audioTextVi: "Trước khi vào khu làm việc, bắt buộc phải đội mũ bảo hộ và đi giày bảo hộ. An toàn là quan trọng nhất.",
    question: "작업장에 들어가기 전에 무엇을 해야 해요?",
    questionVi: "Trước khi vào khu làm việc phải làm gì?",
    options: ["손을 씻어요", "안전 장비를 착용해요", "밥을 먹어요", "전화를 해요"],
    optionsVi: ["Rửa tay", "Mặc trang bị bảo hộ", "Ăn cơm", "Gọi điện"],
    correctIndex: 1,
    explanation: "\"안전모와 안전화를 반드시 착용하세요\" = bắt buộc phải đội mũ và đi giày bảo hộ.",
  },
  {
    id: "lq4",
    topic: "workplace",
    level: "medium",
    audioText: "이번 달 월급은 이백오십만 원이에요. 야근 수당 삼십만 원이 포함되어 있어요. 세금을 공제하면 이백이십만 원을 받아요.",
    audioTextVi: "Lương tháng này là 2.500.000 won. Bao gồm phụ cấp tăng ca 300.000 won. Sau khi trừ thuế nhận được 2.200.000 won.",
    question: "세금을 공제하고 실제로 받는 금액은 얼마예요?",
    questionVi: "Số tiền thực nhận sau khi trừ thuế là bao nhiêu?",
    options: ["이백만 원", "이백이십만 원", "이백오십만 원", "삼백만 원"],
    optionsVi: ["2.000.000 won", "2.200.000 won", "2.500.000 won", "3.000.000 won"],
    correctIndex: 1,
    explanation: "\"세금을 공제하면 이백이십만 원을 받아요\" = sau khi trừ thuế nhận 2.200.000 won.",
  },
  {
    id: "lq5",
    topic: "daily",
    level: "easy",
    audioText: "저는 회사 기숙사에 살아요. 방이 두 개 있어요. 세탁기와 냉장고가 있어요. 아주 편해요.",
    audioTextVi: "Tôi sống ở ký túc xá công ty. Có 2 phòng. Có máy giặt và tủ lạnh. Rất tiện.",
    question: "이 사람은 어디에 살아요?",
    questionVi: "Người này sống ở đâu?",
    options: ["자기 집", "회사 기숙사", "친구 집", "호텔"],
    optionsVi: ["Nhà riêng", "Ký túc xá công ty", "Nhà bạn", "Khách sạn"],
    correctIndex: 1,
    explanation: "\"회사 기숙사에 살아요\" = sống ở ký túc xá công ty.",
  },
  {
    id: "lq6",
    topic: "health",
    level: "medium",
    audioText: "어제부터 머리가 아프고 열이 나요. 기침도 해요. 병원에 가서 의사 선생님께 진찰을 받았어요. 약을 처방받았어요.",
    audioTextVi: "Từ hôm qua đau đầu và bị sốt. Cũng bị ho. Đã đi bệnh viện và được bác sĩ khám. Đã được kê đơn thuốc.",
    question: "이 사람의 증상이 아닌 것은 무엇이에요?",
    questionVi: "Điều nào KHÔNG phải là triệu chứng của người này?",
    options: ["머리가 아파요", "열이 나요", "기침을 해요", "배가 아파요"],
    optionsVi: ["Đau đầu", "Bị sốt", "Bị ho", "Đau bụng"],
    correctIndex: 3,
    explanation: "Đoạn hội thoại đề cập đau đầu, sốt, ho — không đề cập đau bụng.",
  },
  {
    id: "lq7",
    topic: "transport",
    level: "easy",
    audioText: "지하철 이 호선을 타고 강남역에서 내리세요. 거기서 버스로 갈아타면 돼요. 약 삼십 분 걸려요.",
    audioTextVi: "Đi tàu điện ngầm tuyến 2 và xuống ở ga Gangnam. Từ đó chuyển sang xe buýt là được. Mất khoảng 30 phút.",
    question: "강남역에서 어떻게 해야 해요?",
    questionVi: "Ở ga Gangnam phải làm gì?",
    options: ["택시를 타요", "버스로 갈아타요", "걸어가요", "지하철을 계속 타요"],
    optionsVi: ["Đi taxi", "Chuyển sang xe buýt", "Đi bộ", "Tiếp tục đi tàu điện ngầm"],
    correctIndex: 1,
    explanation: "\"버스로 갈아타면 돼요\" = chuyển sang xe buýt là được.",
  },
  {
    id: "lq8",
    topic: "law",
    level: "hard",
    audioText: "근로계약서에 따르면 계약 기간은 일 년이에요. 월급은 이백만 원이고 4대 보험에 가입해야 해요. 연차는 십오 일이에요. 계약서를 꼼꼼히 읽고 서명하세요.",
    audioTextVi: "Theo hợp đồng lao động, thời hạn hợp đồng là 1 năm. Lương tháng là 2.000.000 won và phải tham gia 4 loại bảo hiểm. Ngày phép năm là 15 ngày. Hãy đọc kỹ hợp đồng trước khi ký.",
    question: "이 근로계약서에서 연차는 며칠이에요?",
    questionVi: "Theo hợp đồng này, ngày phép năm là bao nhiêu ngày?",
    options: ["십 일", "십이 일", "십오 일", "이십 일"],
    optionsVi: ["10 ngày", "12 ngày", "15 ngày", "20 ngày"],
    correctIndex: 2,
    explanation: "\"연차는 십오 일이에요\" = ngày phép năm là 15 ngày.",
  },
  {
    id: "lq9",
    topic: "safety",
    level: "medium",
    audioText: "화재가 발생했어요! 당황하지 마세요. 비상구로 빨리 대피하세요. 엘리베이터는 사용하지 마세요. 계단을 이용하세요. 119에 신고하세요.",
    audioTextVi: "Có hỏa hoạn! Đừng hoảng loạn. Hãy sơ tán nhanh qua lối thoát hiểm. Không dùng thang máy. Dùng cầu thang bộ. Báo cáo cho 119.",
    question: "화재 시 엘리베이터를 사용하면 안 되는 이유는 무엇이에요?",
    questionVi: "Tại sao không được dùng thang máy khi có hỏa hoạn?",
    options: ["느려서", "위험해서", "고장나서", "사람이 많아서"],
    optionsVi: ["Vì chậm", "Vì nguy hiểm", "Vì hỏng", "Vì đông người"],
    correctIndex: 1,
    explanation: "Khi có hỏa hoạn, thang máy rất nguy hiểm vì có thể mất điện hoặc khói xâm nhập. Phải dùng cầu thang bộ.",
  },
  {
    id: "lq10",
    topic: "workplace",
    level: "medium",
    audioText: "내일 오전에 신입사원 교육이 있어요. 교육 장소는 이 층 대회의실이에요. 교육 시간은 오전 아홉 시부터 오후 다섯 시까지예요. 점심은 회사에서 제공해요.",
    audioTextVi: "Ngày mai buổi sáng có đào tạo nhân viên mới. Địa điểm đào tạo là phòng họp lớn tầng 2. Thời gian đào tạo từ 9 giờ sáng đến 5 giờ chiều. Bữa trưa do công ty cung cấp.",
    question: "신입사원 교육은 어디에서 해요?",
    questionVi: "Đào tạo nhân viên mới ở đâu?",
    options: ["일 층 소회의실", "이 층 대회의실", "삼 층 강당", "사 층 교육실"],
    optionsVi: ["Phòng họp nhỏ tầng 1", "Phòng họp lớn tầng 2", "Hội trường tầng 3", "Phòng đào tạo tầng 4"],
    correctIndex: 1,
    explanation: "\"이 층 대회의실\" = phòng họp lớn tầng 2.",
  },
  {
    id: "lq11",
    topic: "daily",
    level: "medium",
    audioText: "마트에서 장을 봤어요. 라면 다섯 개, 계란 한 판, 우유 두 개를 샀어요. 모두 이만 삼천 원이었어요. 카드로 계산했어요.",
    audioTextVi: "Đã đi mua sắm ở siêu thị. Mua 5 gói mì, 1 vỉ trứng, 2 hộp sữa. Tổng cộng 23.000 won. Đã thanh toán bằng thẻ.",
    question: "이 사람은 어떻게 계산했어요?",
    questionVi: "Người này thanh toán bằng cách nào?",
    options: ["현금으로", "카드로", "핸드폰으로", "상품권으로"],
    optionsVi: ["Bằng tiền mặt", "Bằng thẻ", "Bằng điện thoại", "Bằng phiếu quà tặng"],
    correctIndex: 1,
    explanation: "\"카드로 계산했어요\" = đã thanh toán bằng thẻ.",
  },
  {
    id: "lq12",
    topic: "culture",
    level: "easy",
    audioText: "추석은 한국의 큰 명절이에요. 가족들이 모여서 송편을 만들어요. 조상에게 차례를 지내요. 고향에 가는 사람들이 많아요.",
    audioTextVi: "Chuseok là ngày lễ lớn của Hàn Quốc. Gia đình tụ họp làm bánh songpyeon. Cúng tổ tiên. Nhiều người về quê.",
    question: "추석에 가족들이 함께 만드는 음식은 무엇이에요?",
    questionVi: "Vào Chuseok, gia đình cùng nhau làm món ăn gì?",
    options: ["김치", "불고기", "송편", "비빔밥"],
    optionsVi: ["Kim chi", "Bulgogi", "Bánh songpyeon", "Cơm trộn"],
    correctIndex: 2,
    explanation: "\"가족들이 모여서 송편을 만들어요\" = gia đình tụ họp làm bánh songpyeon.",
  },
  {
    id: "lq13",
    topic: "health",
    level: "hard",
    audioText: "건강보험에 가입하면 병원비의 일부를 지원받을 수 있어요. 외국인 근로자도 건강보험에 가입할 수 있어요. 매달 월급에서 보험료가 공제돼요. 아프면 꼭 병원에 가세요.",
    audioTextVi: "Khi tham gia bảo hiểm y tế, có thể được hỗ trợ một phần chi phí bệnh viện. Người lao động nước ngoài cũng có thể tham gia bảo hiểm y tế. Phí bảo hiểm được trừ từ lương hàng tháng. Khi ốm nhất định phải đi bệnh viện.",
    question: "건강보험에 대한 설명으로 맞는 것은 무엇이에요?",
    questionVi: "Điều nào đúng về bảo hiểm y tế?",
    options: ["한국 사람만 가입할 수 있어요", "병원비 전액을 지원해요", "외국인도 가입할 수 있어요", "무료로 가입할 수 있어요"],
    optionsVi: ["Chỉ người Hàn mới được tham gia", "Hỗ trợ toàn bộ chi phí bệnh viện", "Người nước ngoài cũng được tham gia", "Tham gia miễn phí"],
    correctIndex: 2,
    explanation: "\"외국인 근로자도 건강보험에 가입할 수 있어요\" = người lao động nước ngoài cũng có thể tham gia.",
  },
  {
    id: "lq14",
    topic: "greeting",
    level: "medium",
    audioText: "처음 뵙겠습니다. 저는 응우옌 반 안이라고 해요. 베트남 하노이에서 왔어요. 이번에 새로 입사했어요. 앞으로 잘 부탁드립니다.",
    audioTextVi: "Rất vui được gặp lần đầu. Tôi tên là Nguyễn Văn An. Đến từ Hà Nội, Việt Nam. Vừa mới vào công ty. Mong được nhờ cậy.",
    question: "이 사람에 대한 설명으로 맞는 것은?",
    questionVi: "Điều nào đúng về người này?",
    options: ["한국 사람이에요", "서울에서 왔어요", "새로 입사했어요", "오래 일했어요"],
    optionsVi: ["Là người Hàn Quốc", "Đến từ Seoul", "Vừa mới vào công ty", "Đã làm lâu rồi"],
    correctIndex: 2,
    explanation: "\"이번에 새로 입사했어요\" = vừa mới vào công ty.",
  },
  {
    id: "lq15",
    topic: "transport",
    level: "hard",
    audioText: "지하철 막차 시간은 자정이에요. 버스는 밤 열한 시까지 운행해요. 그 이후에는 택시를 이용해야 해요. 심야 택시는 요금이 더 비싸요.",
    audioTextVi: "Chuyến tàu điện ngầm cuối là lúc nửa đêm. Xe buýt chạy đến 11 giờ đêm. Sau đó phải dùng taxi. Taxi đêm khuya đắt hơn.",
    question: "밤 열두 시에 이동하려면 어떻게 해야 해요?",
    questionVi: "Muốn di chuyển lúc 12 giờ đêm phải làm gì?",
    options: ["지하철을 타요", "버스를 타요", "택시를 타요", "걸어가요"],
    optionsVi: ["Đi tàu điện ngầm", "Đi xe buýt", "Đi taxi", "Đi bộ"],
    correctIndex: 2,
    explanation: "Tàu điện ngầm cuối lúc nửa đêm (12h), xe buýt đến 11h. Lúc 12h đêm chỉ còn taxi.",
  },
  {
    id: "lq16",
    topic: "workplace",
    level: "hard",
    audioText: "이번 달에 야근을 열 시간 했어요. 야근 수당은 시급의 일점오 배예요. 제 시급은 만 원이에요. 야근 수당을 계산해 보세요.",
    audioTextVi: "Tháng này tăng ca 10 tiếng. Phụ cấp tăng ca là 1,5 lần lương giờ. Lương giờ của tôi là 10.000 won. Hãy tính phụ cấp tăng ca.",
    question: "이번 달 야근 수당은 얼마예요?",
    questionVi: "Phụ cấp tăng ca tháng này là bao nhiêu?",
    options: ["십만 원", "십오만 원", "이십만 원", "이십오만 원"],
    optionsVi: ["100.000 won", "150.000 won", "200.000 won", "250.000 won"],
    correctIndex: 1,
    explanation: "10.000 won × 1.5 × 10 giờ = 150.000 won = 십오만 원.",
  },
  {
    id: "lq17",
    topic: "safety",
    level: "easy",
    audioText: "작업 중에 다쳤어요. 손가락을 베었어요. 먼저 응급처치를 받으세요. 그리고 산재보험으로 치료받을 수 있어요.",
    audioTextVi: "Bị thương khi làm việc. Bị đứt ngón tay. Trước tiên hãy được sơ cứu. Và có thể điều trị bằng bảo hiểm tai nạn lao động.",
    question: "작업 중 다쳤을 때 먼저 해야 할 일은 무엇이에요?",
    questionVi: "Khi bị thương khi làm việc, việc đầu tiên cần làm là gì?",
    options: ["집에 가요", "응급처치를 받아요", "계속 일해요", "상사에게 화내요"],
    optionsVi: ["Về nhà", "Được sơ cứu", "Tiếp tục làm việc", "Tức giận với cấp trên"],
    correctIndex: 1,
    explanation: "\"먼저 응급처치를 받으세요\" = trước tiên hãy được sơ cứu.",
  },
  {
    id: "lq18",
    topic: "daily",
    level: "hard",
    audioText: "베트남으로 송금하려고 해요. 은행에 가서 외환 송금 신청서를 작성했어요. 수수료는 오천 원이에요. 환율은 오늘 기준으로 백 원에 천칠백 원이에요.",
    audioTextVi: "Muốn chuyển tiền về Việt Nam. Đã đến ngân hàng điền đơn chuyển tiền ngoại tệ. Phí là 5.000 won. Tỷ giá hôm nay là 100 won = 1.700 đồng.",
    question: "이 사람이 은행에서 한 일은 무엇이에요?",
    questionVi: "Người này đã làm gì ở ngân hàng?",
    options: ["통장을 만들었어요", "외환 송금 신청서를 작성했어요", "대출을 신청했어요", "카드를 만들었어요"],
    optionsVi: ["Mở tài khoản", "Điền đơn chuyển tiền ngoại tệ", "Xin vay tiền", "Làm thẻ"],
    correctIndex: 1,
    explanation: "\"외환 송금 신청서를 작성했어요\" = đã điền đơn chuyển tiền ngoại tệ.",
  },
  {
    id: "lq19",
    topic: "culture",
    level: "medium",
    audioText: "한국에서는 식사할 때 어른이 먼저 수저를 들어야 해요. 두 손으로 음식을 받는 것이 예의예요. 식사 중에 큰 소리로 말하는 것은 실례예요.",
    audioTextVi: "Ở Hàn Quốc, khi ăn cơm phải đợi người lớn tuổi cầm đũa trước. Nhận đồ ăn bằng hai tay là lịch sự. Nói to trong khi ăn là bất lịch sự.",
    question: "한국 식사 예절로 맞는 것은 무엇이에요?",
    questionVi: "Điều nào đúng về phép tắc ăn uống Hàn Quốc?",
    options: ["어른보다 먼저 먹어요", "한 손으로 음식을 받아요", "어른이 먼저 수저를 들어요", "식사 중에 크게 말해요"],
    optionsVi: ["Ăn trước người lớn", "Nhận đồ ăn bằng một tay", "Đợi người lớn cầm đũa trước", "Nói to trong khi ăn"],
    correctIndex: 2,
    explanation: "\"어른이 먼저 수저를 들어야 해요\" = phải đợi người lớn cầm đũa trước.",
  },
  {
    id: "lq20",
    topic: "law",
    level: "medium",
    audioText: "부당해고를 당했어요. 이럴 때는 노동청에 신고할 수 있어요. 또는 노동위원회에 구제 신청을 할 수 있어요. 혼자 해결하기 어려우면 노무사의 도움을 받으세요.",
    audioTextVi: "Bị sa thải bất công. Trong trường hợp này có thể tố cáo lên Sở Lao động. Hoặc có thể nộp đơn xin cứu trợ lên Ủy ban Lao động. Nếu khó giải quyết một mình, hãy nhờ sự giúp đỡ của chuyên gia lao động.",
    question: "부당해고를 당했을 때 할 수 있는 일이 아닌 것은?",
    questionVi: "Điều nào KHÔNG thể làm khi bị sa thải bất công?",
    options: ["노동청에 신고해요", "노동위원회에 신청해요", "노무사의 도움을 받아요", "아무것도 안 해요"],
    optionsVi: ["Tố cáo lên Sở Lao động", "Nộp đơn lên Ủy ban Lao động", "Nhờ chuyên gia lao động", "Không làm gì cả"],
    correctIndex: 3,
    explanation: "Khi bị sa thải bất công, có nhiều cách để bảo vệ quyền lợi. Không nên bỏ qua.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────
function speakKorean(text: string, rate = 0.75) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

const LEVEL_COLORS = { easy: "#34d399", medium: "#e8c84a", hard: "#f87171" };
const LEVEL_LABELS = { easy: "Dễ", medium: "Trung bình", hard: "Khó" };

// ─── Question Card ────────────────────────────────────────────────────────
function ListeningCard({
  q,
  answered,
  onAnswer,
  showScript,
  onToggleScript,
}: {
  q: ListeningQuestion;
  answered: number | null;
  onAnswer: (i: number) => void;
  showScript: boolean;
  onToggleScript: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const topicInfo = EPS_LESSON_TOPICS.find(t => t.id === q.topic);

  const handlePlay = useCallback((rate: number) => {
    setIsPlaying(true);
    setPlayCount(c => c + 1);
    speakKorean(q.audioText, rate);
    const duration = (q.audioText.length / 5) * (1 / rate) * 1000 + 500;
    setTimeout(() => setIsPlaying(false), duration);
  }, [q.audioText]);

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
      {/* Topic + level badges */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-app-border">
        {topicInfo && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${topicInfo.color}15`, color: topicInfo.color }}>
            <i className={`${topicInfo.icon} mr-1`}></i>{topicInfo.label}
          </span>
        )}
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${LEVEL_COLORS[q.level]}15`, color: LEVEL_COLORS[q.level] }}>
          {LEVEL_LABELS[q.level]}
        </span>
        {playCount > 0 && (
          <span className="text-[10px] text-app-text-muted ml-auto">Đã nghe {playCount} lần</span>
        )}
      </div>

      {/* Audio player */}
      <div className="px-5 py-4 bg-white/2 border-b border-app-border">
        <p className="text-app-text-secondary text-xs mb-3">Nghe đoạn hội thoại và trả lời câu hỏi:</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handlePlay(0.75)}
            disabled={isPlaying}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${isPlaying ? "bg-app-accent-primary/20 text-app-accent-primary" : "bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg"}`}
          >
            <i className={isPlaying ? "ri-pause-fill" : "ri-play-fill"}></i>
            {isPlaying ? "Đang phát..." : "Nghe (bình thường)"}
          </button>
          <button
            onClick={() => handlePlay(0.5)}
            disabled={isPlaying}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-app-border text-white/50 hover:text-white/70 hover:bg-app-card/50 text-sm transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
          >
            <i className="ri-speed-line"></i>
            Chậm hơn
          </button>
          <button
            onClick={onToggleScript}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer whitespace-nowrap ml-auto ${showScript ? "border-[#06b6d4]/30 bg-[#06b6d4]/10 text-[#06b6d4]" : "border-app-border text-app-text-secondary hover:text-white/60"}`}
          >
            <i className={showScript ? "ri-eye-off-line" : "ri-eye-line"}></i>
            {showScript ? "Ẩn script" : "Xem script"}
          </button>
        </div>

        {/* Script */}
        {showScript && (
          <div className="mt-3 p-3 rounded-xl bg-[#06b6d4]/5 border border-[#06b6d4]/15">
            <p className="text-[#06b6d4] text-sm font-medium leading-relaxed">{q.audioText}</p>
            <p className="text-app-text-secondary text-xs mt-1.5 italic leading-relaxed">{q.audioTextVi}</p>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="px-5 py-4">
        <p className="text-white font-semibold text-sm mb-1">{q.question}</p>
        <p className="text-app-text-secondary text-xs italic mb-4">{q.questionVi}</p>

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let cls = "border-app-border bg-app-surface/50 hover:border-white/15 hover:bg-app-card/50 cursor-pointer";
            if (answered !== null) {
              if (i === q.correctIndex) cls = "border-emerald-500/40 bg-emerald-500/8 cursor-default";
              else if (i === answered) cls = "border-red-500/40 bg-red-500/8 cursor-default";
              else cls = "border-app-border opacity-40 cursor-default";
            }
            return (
              <button
                key={i}
                onClick={() => answered === null && onAnswer(i)}
                disabled={answered !== null}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${cls}`}
              >
                <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold flex-shrink-0 ${answered !== null && i === q.correctIndex ? "bg-emerald-500/20 text-app-accent-success" : answered !== null && i === answered ? "bg-red-500/20 text-red-400" : "bg-app-card/50 text-app-text-muted"}`}>
                  {["A","B","C","D"][i]}
                </span>
                <div>
                  <p className={`text-sm font-medium ${answered !== null && i === q.correctIndex ? "text-app-accent-success" : answered !== null && i === answered ? "text-red-400" : "text-white/70"}`}>{opt}</p>
                  <p className="text-app-text-muted text-xs">{q.optionsVi[i]}</p>
                </div>
                {answered !== null && i === q.correctIndex && <i className="ri-checkbox-circle-fill text-app-accent-success ml-auto"></i>}
                {answered !== null && i === answered && i !== q.correctIndex && <i className="ri-close-circle-fill text-red-400 ml-auto"></i>}
              </button>
            );
          })}
        </div>

        {answered !== null && (
          <div className={`mt-4 p-3 rounded-xl border text-xs leading-relaxed ${answered === q.correctIndex ? "border-emerald-500/20 bg-emerald-500/5 text-app-accent-success/80" : "border-orange-500/20 bg-orange-500/5 text-orange-400/80"}`}>
            <div className="flex items-start gap-2">
              <i className="ri-lightbulb-line text-sm flex-shrink-0 mt-0.5"></i>
              <p>{q.explanation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function EpsListeningPage() {
  const { addXP } = useXPSystem();
  const [answeredMap, setAnsweredMap] = useLocalStorage<Record<string, number>>("kts_eps_listening_answers", {});
  const [filterTopic, setFilterTopic] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [showScripts, setShowScripts] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<"browse" | "exam">("browse");
  const [examIdx, setExamIdx] = useState(0);

  usePageSEO({
    title: "Luyện nghe EPS-TOPIK — Audio + Script Hàn-Việt | Hàn Quốc Ơi!",
    description: "Luyện kỹ năng nghe EPS-TOPIK theo chủ đề. Audio gốc tốc độ chuẩn + bản dịch Việt + câu hỏi trắc nghiệm. Cải thiện điểm nghe trong kỳ thi EPS XKLĐ.",
    keywords: "luyện nghe EPS, nghe tiếng Hàn EPS-TOPIK, audio EPS, listening EPS, đề nghe EPS XKLĐ",
    path: "/eps-listening",
    ogType: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: "Luyện nghe EPS-TOPIK",
      description: "Bài luyện nghe EPS-TOPIK theo chủ đề có audio + script.",
      learningResourceType: "Audio",
      educationalLevel: "EPS-TOPIK",
      inLanguage: ["ko", "vi"],
      isAccessibleForFree: true,
      provider: {
        "@type": "EducationalOrganization",
        name: "Hàn Quốc Ơi!",
        url: SITE_URL,
      },
    },
  });
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examDone, setExamDone] = useState(false);

  const filteredQuestions = useMemo(() => {
    return LISTENING_QUESTIONS.filter(q => {
      if (filterTopic !== "all" && q.topic !== filterTopic) return false;
      if (filterLevel !== "all" && q.level !== filterLevel) return false;
      return true;
    });
  }, [filterTopic, filterLevel]);

  const totalAnswered = Object.keys(answeredMap).length;
  const totalCorrect = LISTENING_QUESTIONS.filter(q => answeredMap[q.id] === q.correctIndex).length;
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const handleAnswer = useCallback((qId: string, idx: number) => {
    if (answeredMap[qId] !== undefined) return;
    setAnsweredMap(prev => ({ ...prev, [qId]: idx }));
    const q = LISTENING_QUESTIONS.find(x => x.id === qId);
    if (q && idx === q.correctIndex) {
      addXP(15, "Trả lời đúng câu nghe EPS");
    }
  }, [answeredMap, setAnsweredMap, addXP]);

  // Exam mode
  const examQuestions = useMemo(() => {
    const shuffled = [...LISTENING_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, []);

  const handleExamAnswer = (idx: number) => {
    const q = examQuestions[examIdx];
    setExamAnswers(prev => ({ ...prev, [q.id]: idx }));
  };

  const handleExamNext = () => {
    if (examIdx + 1 >= examQuestions.length) {
      setExamDone(true);
      const correct = examQuestions.filter(q => examAnswers[q.id] === q.correctIndex).length;
      addXP(correct * 20, `Hoàn thành bài thi nghe EPS (${correct}/10 đúng)`);
    } else {
      setExamIdx(i => i + 1);
    }
  };

  const examScore = examQuestions.filter(q => examAnswers[q.id] === q.correctIndex).length;

  return (
    <DashboardLayout
      title="Luyện nghe EPS"
      subtitle="Nghe audio câu hỏi EPS thật — luyện kỹ năng nghe hiểu cho kỳ thi lao động Hàn Quốc"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng câu nghe", value: LISTENING_QUESTIONS.length, icon: "ri-headphone-line", color: "#e8c84a" },
          { label: "Đã luyện", value: totalAnswered, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Trả lời đúng", value: totalCorrect, icon: "ri-trophy-line", color: "#a78bfa" },
          { label: "Độ chính xác", value: `${accuracy}%`, icon: "ri-bar-chart-line", color: "#fb923c" },
        ].map(s => (
          <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{s.value}</p>
              <p className="text-app-text-secondary text-xs mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mode tabs */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex rounded-xl border border-app-border overflow-hidden">
          {(["browse", "exam"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setExamIdx(0); setExamAnswers({}); setExamDone(false); }}
              className={`px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${mode === m ? "bg-app-accent-primary/15 text-app-accent-primary" : "text-app-text-secondary hover:text-white/60"}`}
            >
              {m === "browse" ? "Luyện tập tự do" : "Thi thử (10 câu)"}
            </button>
          ))}
        </div>

        {mode === "browse" && (
          <>
            <select
              value={filterTopic}
              onChange={e => setFilterTopic(e.target.value)}
              className="bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả chủ đề</option>
              {EPS_LESSON_TOPICS.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <select
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value)}
              className="bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả cấp độ</option>
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </>
        )}
      </div>

      {/* Browse mode */}
      {mode === "browse" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          <div className="space-y-4">
            <p className="text-app-text-muted text-xs">{filteredQuestions.length} câu hỏi</p>
            {filteredQuestions.map(q => (
              <ListeningCard
                key={q.id}
                q={q}
                answered={answeredMap[q.id] ?? null}
                onAnswer={idx => handleAnswer(q.id, idx)}
                showScript={!!showScripts[q.id]}
                onToggleScript={() => setShowScripts(p => ({ ...p, [q.id]: !p[q.id] }))}
              />
            ))}
          </div>

          {/* Tips sidebar */}
          <div className="space-y-4">
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">Mẹo luyện nghe EPS</h3>
              <div className="space-y-3">
                {[
                  { icon: "ri-headphone-line", tip: "Nghe ít nhất 2 lần trước khi trả lời" },
                  { icon: "ri-speed-line", tip: "Dùng chế độ \"Chậm hơn\" nếu không nghe rõ" },
                  { icon: "ri-eye-off-line", tip: "Không xem script khi lần đầu nghe" },
                  { icon: "ri-repeat-line", tip: "Ôn lại câu sai nhiều lần" },
                  { icon: "ri-focus-3-line", tip: "Chú ý từ khóa: số, địa điểm, thời gian" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-6 h-6 flex items-center justify-center rounded-md bg-app-accent-primary/10 flex-shrink-0">
                      <i className={`${item.icon} text-app-accent-primary text-xs`}></i>
                    </div>
                    <p className="text-app-text-secondary text-xs leading-relaxed">{item.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4">
              <p className="text-app-accent-primary text-xs font-semibold mb-2">Phần thưởng XP</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-app-text-secondary">Trả lời đúng</span>
                  <span className="text-app-accent-primary font-bold">+15 XP</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-app-text-secondary">Hoàn thành thi thử</span>
                  <span className="text-app-accent-primary font-bold">+20 XP/câu đúng</span>
                </div>
              </div>
            </div>

            {/* Progress by topic */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-4">
              <p className="text-app-text-secondary text-xs font-medium mb-3">Tiến độ theo chủ đề</p>
              {EPS_LESSON_TOPICS.map(t => {
                const topicQs = LISTENING_QUESTIONS.filter(q => q.topic === t.id);
                const done = topicQs.filter(q => answeredMap[q.id] !== undefined).length;
                const pct = topicQs.length > 0 ? Math.round((done / topicQs.length) * 100) : 0;
                return (
                  <div key={t.id} className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-app-text-secondary text-[10px]">{t.label}</span>
                      <span className="text-[10px] font-bold" style={{ color: t.color }}>{done}/{topicQs.length}</span>
                    </div>
                    <div className="h-1 bg-app-card/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: t.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Exam mode */}
      {mode === "exam" && !examDone && (
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-5">
            <p className="text-app-text-secondary text-xs whitespace-nowrap">{examIdx + 1} / {examQuestions.length}</p>
            <div className="flex-1 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-app-accent-primary transition-all" style={{ width: `${(examIdx / examQuestions.length) * 100}%` }} />
            </div>
            <p className="text-app-accent-success text-xs font-bold whitespace-nowrap">
              {Object.values(examAnswers).filter((v, i) => v === examQuestions[i]?.correctIndex).length} đúng
            </p>
          </div>

          <ListeningCard
            q={examQuestions[examIdx]}
            answered={examAnswers[examQuestions[examIdx].id] ?? null}
            onAnswer={handleExamAnswer}
            showScript={false}
            onToggleScript={() => {}}
          />

          {examAnswers[examQuestions[examIdx].id] !== undefined && (
            <button
              onClick={handleExamNext}
              className="w-full mt-4 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              {examIdx + 1 >= examQuestions.length ? "Xem kết quả" : "Câu tiếp theo"}
              <i className="ri-arrow-right-line ml-2"></i>
            </button>
          )}
        </div>
      )}

      {/* Exam result */}
      {mode === "exam" && examDone && (
        <div className="max-w-md mx-auto bg-app-bg border border-app-border rounded-2xl p-8 text-center">
          {(() => {
            const pct = Math.round((examScore / examQuestions.length) * 100);
            const grade = pct >= 80 ? { label: "Xuất sắc!", color: "#34d399", icon: "ri-trophy-line" }
              : pct >= 60 ? { label: "Khá tốt!", color: "#e8c84a", icon: "ri-medal-line" }
              : { label: "Cần luyện thêm!", color: "#fb923c", icon: "ri-refresh-line" };
            return (
              <>
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: `${grade.color}15` }}>
                  <i className={`${grade.icon} text-3xl`} style={{ color: grade.color }}></i>
                </div>
                <h2 className="text-white font-bold text-xl mb-2">{grade.label}</h2>
                <p className="text-app-text-secondary text-sm mb-5">
                  Đúng <span className="font-bold" style={{ color: grade.color }}>{examScore}/{examQuestions.length}</span> câu ({pct}%)
                </p>
                <div className="w-full h-2 bg-app-card/50 rounded-full overflow-hidden mb-6">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: grade.color }} />
                </div>
                <p className="text-app-accent-primary text-sm font-bold mb-5">+{examScore * 20} XP đã nhận!</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setExamIdx(0); setExamAnswers({}); setExamDone(false); }}
                    className="flex-1 py-3 rounded-xl border border-app-border text-white/60 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Thi lại
                  </button>
                  <button
                    onClick={() => setMode("browse")}
                    className="flex-1 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Luyện tập
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </DashboardLayout>
  );
}


