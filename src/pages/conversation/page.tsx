import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ─── Data ─────────────────────────────────────────────────────────────────
interface Phrase {
  id: string;
  korean: string;
  romanization: string;
  vietnamese: string;
  example?: string;
  exampleVi?: string;
  level: "cơ bản" | "trung cấp" | "nâng cao";
}

interface Topic {
  id: string;
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  phrases: Phrase[];
}

const TOPICS: Topic[] = [
  {
    id: "greetings",
    icon: "ri-hand-heart-line",
    color: "app-accent-primary",
    title: "Chào hỏi & Giới thiệu",
    subtitle: "Những câu đầu tiên cần biết",
    phrases: [
      { id: "g1", korean: "안녕하세요", romanization: "Annyeonghaseyo", vietnamese: "Xin chào (lịch sự)", level: "cơ bản" },
      { id: "g2", korean: "안녕!", romanization: "Annyeong!", vietnamese: "Chào! (thân mật)", level: "cơ bản" },
      { id: "g3", korean: "처음 뵙겠습니다", romanization: "Cheoeum boepgesseumnida", vietnamese: "Rất vui được gặp bạn (lần đầu)", level: "cơ bản" },
      { id: "g4", korean: "제 이름은 ___입니다", romanization: "Je ireumeun ___ imnida", vietnamese: "Tên tôi là ___", level: "cơ bản" },
      { id: "g5", korean: "저는 베트남 사람이에요", romanization: "Jeoneun beteunam saramieyo", vietnamese: "Tôi là người Việt Nam", level: "cơ bản" },
      { id: "g6", korean: "잘 부탁드립니다", romanization: "Jal butakdeurimnida", vietnamese: "Mong bạn giúp đỡ / Rất vui được làm quen", level: "cơ bản" },
      { id: "g7", korean: "오랜만이에요", romanization: "Oraenmanieyo", vietnamese: "Lâu rồi không gặp", level: "trung cấp" },
      { id: "g8", korean: "잘 지냈어요?", romanization: "Jal jinaesseoyo?", vietnamese: "Bạn có khỏe không?", level: "cơ bản" },
      { id: "g9", korean: "덕분에 잘 지냈어요", romanization: "Deokbune jal jinaesseoyo", vietnamese: "Nhờ bạn, tôi vẫn khỏe", level: "trung cấp" },
      { id: "g10", korean: "몇 살이에요?", romanization: "Myeot sarieyo?", vietnamese: "Bạn bao nhiêu tuổi?", level: "cơ bản" },
    ],
  },
  {
    id: "daily",
    icon: "ri-sun-line",
    color: "#fb923c",
    title: "Sinh hoạt hàng ngày",
    subtitle: "Câu dùng mỗi ngày",
    phrases: [
      { id: "d1", korean: "밥 먹었어요?", romanization: "Bap meogeosseoyo?", vietnamese: "Bạn ăn cơm chưa?", level: "cơ bản", example: "A: 밥 먹었어요? B: 네, 먹었어요", exampleVi: "A: Bạn ăn cơm chưa? B: Rồi, tôi ăn rồi" },
      { id: "d2", korean: "잘 자요", romanization: "Jal jayo", vietnamese: "Ngủ ngon", level: "cơ bản" },
      { id: "d3", korean: "일어났어요", romanization: "Ireonasseoyo", vietnamese: "Tôi đã thức dậy", level: "cơ bản" },
      { id: "d4", korean: "피곤해요", romanization: "Pigonhaeyo", vietnamese: "Tôi mệt", level: "cơ bản" },
      { id: "d5", korean: "배고파요", romanization: "Baegopayo", vietnamese: "Tôi đói", level: "cơ bản" },
      { id: "d6", korean: "목말라요", romanization: "Mongmallayo", vietnamese: "Tôi khát", level: "cơ bản" },
      { id: "d7", korean: "화장실이 어디예요?", romanization: "Hwajangsiri eodiyeyo?", vietnamese: "Nhà vệ sinh ở đâu?", level: "cơ bản" },
      { id: "d8", korean: "지금 몇 시예요?", romanization: "Jigeum myeot siyeyo?", vietnamese: "Bây giờ là mấy giờ?", level: "cơ bản" },
      { id: "d9", korean: "오늘 날씨가 좋네요", romanization: "Oneul nalssiga jonnaeyo", vietnamese: "Hôm nay thời tiết đẹp nhỉ", level: "cơ bản" },
      { id: "d10", korean: "조심하세요", romanization: "Josimhaseyo", vietnamese: "Hãy cẩn thận", level: "cơ bản" },
    ],
  },
  {
    id: "shopping",
    icon: "ri-shopping-bag-line",
    color: "#34d399",
    title: "Mua sắm & Ăn uống",
    subtitle: "Tại cửa hàng, nhà hàng",
    phrases: [
      { id: "s1", korean: "얼마예요?", romanization: "Eolmayeyo?", vietnamese: "Bao nhiêu tiền?", level: "cơ bản" },
      { id: "s2", korean: "이거 주세요", romanization: "Igeo juseyo", vietnamese: "Cho tôi cái này", level: "cơ bản" },
      { id: "s3", korean: "메뉴 주세요", romanization: "Menyu juseyo", vietnamese: "Cho tôi xem thực đơn", level: "cơ bản" },
      { id: "s4", korean: "맛있어요!", romanization: "Massisseoyo!", vietnamese: "Ngon quá!", level: "cơ bản" },
      { id: "s5", korean: "계산해 주세요", romanization: "Gyesan hae juseyo", vietnamese: "Cho tôi tính tiền", level: "cơ bản" },
      { id: "s6", korean: "카드 돼요?", romanization: "Kadeu dwaeyo?", vietnamese: "Thanh toán thẻ được không?", level: "cơ bản" },
      { id: "s7", korean: "봉투 주세요", romanization: "Bongtu juseyo", vietnamese: "Cho tôi túi đựng", level: "cơ bản" },
      { id: "s8", korean: "할인 돼요?", romanization: "Halin dwaeyo?", vietnamese: "Có giảm giá không?", level: "trung cấp" },
      { id: "s9", korean: "포장해 주세요", romanization: "Pojang hae juseyo", vietnamese: "Cho tôi đóng gói mang về", level: "trung cấp" },
      { id: "s10", korean: "영수증 주세요", romanization: "Yeongsujeung juseyo", vietnamese: "Cho tôi hóa đơn", level: "trung cấp" },
    ],
  },
  {
    id: "transport",
    icon: "ri-bus-line",
    color: "#38bdf8",
    title: "Di chuyển & Giao thông",
    subtitle: "Hỏi đường, đi xe",
    phrases: [
      { id: "t1", korean: "___에 어떻게 가요?", romanization: "___ e eotteoke gayo?", vietnamese: "Đi đến ___ như thế nào?", level: "cơ bản" },
      { id: "t2", korean: "지하철역이 어디예요?", romanization: "Jihacheollyeogi eodiyeyo?", vietnamese: "Ga tàu điện ngầm ở đâu?", level: "cơ bản" },
      { id: "t3", korean: "버스 몇 번이에요?", romanization: "Beoseu myeot beonieyo?", vietnamese: "Xe buýt số mấy?", level: "cơ bản" },
      { id: "t4", korean: "여기서 내려 주세요", romanization: "Yeogiseo naeryeo juseyo", vietnamese: "Cho tôi xuống ở đây", level: "cơ bản" },
      { id: "t5", korean: "택시 불러 주세요", romanization: "Taeksi bulleo juseyo", vietnamese: "Gọi taxi cho tôi", level: "cơ bản" },
      { id: "t6", korean: "얼마나 걸려요?", romanization: "Eolmana geollyeoyo?", vietnamese: "Mất bao lâu?", level: "cơ bản" },
      { id: "t7", korean: "길을 잃었어요", romanization: "Gireul ireoesseoyo", vietnamese: "Tôi bị lạc đường", level: "trung cấp" },
      { id: "t8", korean: "직진하세요", romanization: "Jikjinhaseyo", vietnamese: "Đi thẳng", level: "cơ bản" },
      { id: "t9", korean: "왼쪽으로 가세요", romanization: "Oenjjogeuro gaseyo", vietnamese: "Rẽ trái", level: "cơ bản" },
      { id: "t10", korean: "오른쪽으로 가세요", romanization: "Oreunjjogeuro gaseyo", vietnamese: "Rẽ phải", level: "cơ bản" },
    ],
  },
  {
    id: "work",
    icon: "ri-briefcase-line",
    color: "#a78bfa",
    title: "Công việc & Văn phòng",
    subtitle: "Giao tiếp nơi làm việc",
    phrases: [
      { id: "w1", korean: "수고하셨습니다", romanization: "Sugohasyeosseumnida", vietnamese: "Cảm ơn vì đã vất vả / Tạm biệt (khi tan ca)", level: "cơ bản" },
      { id: "w2", korean: "잠깐만요", romanization: "Jamkkanmanyo", vietnamese: "Chờ một chút", level: "cơ bản" },
      { id: "w3", korean: "이해했어요", romanization: "Ihaehasseoyo", vietnamese: "Tôi hiểu rồi", level: "cơ bản" },
      { id: "w4", korean: "다시 한번 말씀해 주세요", romanization: "Dasi hanbeon malsseum hae juseyo", vietnamese: "Xin nói lại một lần nữa", level: "cơ bản" },
      { id: "w5", korean: "천천히 말씀해 주세요", romanization: "Cheoncheonhi malsseum hae juseyo", vietnamese: "Xin nói chậm thôi", level: "cơ bản" },
      { id: "w6", korean: "도와주세요", romanization: "Dowajuseyo", vietnamese: "Giúp tôi với", level: "cơ bản" },
      { id: "w7", korean: "회의가 있어요", romanization: "Hoeuiga isseoyo", vietnamese: "Tôi có cuộc họp", level: "trung cấp" },
      { id: "w8", korean: "보고서를 제출했어요", romanization: "Bogoseoreul jechulhaesseoyo", vietnamese: "Tôi đã nộp báo cáo", level: "trung cấp" },
      { id: "w9", korean: "야근해야 해요", romanization: "Yageunhaeya haeyo", vietnamese: "Tôi phải làm thêm giờ", level: "trung cấp" },
      { id: "w10", korean: "월급날이 언제예요?", romanization: "Wolgeumnari eonjeyeyo?", vietnamese: "Ngày lương là khi nào?", level: "cơ bản" },
    ],
  },
  {
    id: "emergency",
    icon: "ri-alarm-warning-line",
    color: "#f87171",
    title: "Khẩn cấp & Y tế",
    subtitle: "Khi cần giúp đỡ gấp",
    phrases: [
      { id: "e1", korean: "도와주세요!", romanization: "Dowajuseyo!", vietnamese: "Cứu tôi với! / Giúp tôi với!", level: "cơ bản" },
      { id: "e2", korean: "119에 전화해 주세요", romanization: "119e jeonhwa hae juseyo", vietnamese: "Gọi 119 cho tôi (cấp cứu)", level: "cơ bản" },
      { id: "e3", korean: "병원이 어디예요?", romanization: "Byeongwoni eodiyeyo?", vietnamese: "Bệnh viện ở đâu?", level: "cơ bản" },
      { id: "e4", korean: "아파요", romanization: "Apayo", vietnamese: "Tôi đau / Tôi bị ốm", level: "cơ bản" },
      { id: "e5", korean: "머리가 아파요", romanization: "Meoriga apayo", vietnamese: "Tôi đau đầu", level: "cơ bản" },
      { id: "e6", korean: "배가 아파요", romanization: "Baega apayo", vietnamese: "Tôi đau bụng", level: "cơ bản" },
      { id: "e7", korean: "약이 필요해요", romanization: "Yagi piryohaeyo", vietnamese: "Tôi cần thuốc", level: "cơ bản" },
      { id: "e8", korean: "경찰을 불러 주세요", romanization: "Gyeongchareul bulleo juseyo", vietnamese: "Gọi cảnh sát cho tôi", level: "cơ bản" },
      { id: "e9", korean: "지갑을 잃어버렸어요", romanization: "Jigabeul ireobeoryeosseoyo", vietnamese: "Tôi bị mất ví", level: "trung cấp" },
      { id: "e10", korean: "한국어를 잘 못해요", romanization: "Hangugeoreul jal motaeyo", vietnamese: "Tôi không giỏi tiếng Hàn", level: "cơ bản" },
    ],
  },
  {
    id: "feelings",
    icon: "ri-emotion-line",
    color: "#f472b6",
    title: "Cảm xúc & Ý kiến",
    subtitle: "Diễn đạt cảm xúc",
    phrases: [
      { id: "f1", korean: "좋아요!", romanization: "Joayo!", vietnamese: "Tốt! / Tôi thích!", level: "cơ bản" },
      { id: "f2", korean: "싫어요", romanization: "Sireoyo", vietnamese: "Tôi không thích", level: "cơ bản" },
      { id: "f3", korean: "행복해요", romanization: "Haengbokhaeyo", vietnamese: "Tôi hạnh phúc", level: "cơ bản" },
      { id: "f4", korean: "슬퍼요", romanization: "Seulpeoyo", vietnamese: "Tôi buồn", level: "cơ bản" },
      { id: "f5", korean: "화가 났어요", romanization: "Hwaga nasseoyo", vietnamese: "Tôi tức giận", level: "trung cấp" },
      { id: "f6", korean: "걱정돼요", romanization: "Geokjeongdwaeyo", vietnamese: "Tôi lo lắng", level: "trung cấp" },
      { id: "f7", korean: "정말요?", romanization: "Jeongmallyo?", vietnamese: "Thật không?", level: "cơ bản" },
      { id: "f8", korean: "물론이죠!", romanization: "Mullonikyo!", vietnamese: "Tất nhiên rồi!", level: "cơ bản" },
      { id: "f9", korean: "괜찮아요", romanization: "Gwaenchanayo", vietnamese: "Không sao / Ổn thôi", level: "cơ bản" },
      { id: "f10", korean: "대박이에요!", romanization: "Daebagieyo!", vietnamese: "Tuyệt vời! / Đỉnh quá!", level: "cơ bản" },
    ],
  },
  {
    id: "phone",
    icon: "ri-phone-line",
    color: "#06b6d4",
    title: "Điện thoại & Nhắn tin",
    subtitle: "Giao tiếp qua điện thoại",
    phrases: [
      { id: "p1", korean: "여보세요?", romanization: "Yeoboseyo?", vietnamese: "A lô?", level: "cơ bản" },
      { id: "p2", korean: "잠깐만 기다려 주세요", romanization: "Jamkkanman gidaryeo juseyo", vietnamese: "Xin chờ một chút", level: "cơ bản" },
      { id: "p3", korean: "전화 잘못 걸었어요", romanization: "Jeonhwa jalmot georeosseoyo", vietnamese: "Tôi gọi nhầm số", level: "trung cấp" },
      { id: "p4", korean: "문자 보낼게요", romanization: "Munja bonaelgeyo", vietnamese: "Tôi sẽ nhắn tin cho bạn", level: "trung cấp" },
      { id: "p5", korean: "카카오톡 있어요?", romanization: "Kakaotok isseoyo?", vietnamese: "Bạn có KakaoTalk không?", level: "cơ bản" },
      { id: "p6", korean: "전화번호가 뭐예요?", romanization: "Jeonhwabeonhoga mwoyeyo?", vietnamese: "Số điện thoại của bạn là gì?", level: "cơ bản" },
      { id: "p7", korean: "배터리가 없어요", romanization: "Baeteorига eopseoyo", vietnamese: "Hết pin rồi", level: "cơ bản" },
      { id: "p8", korean: "와이파이 비밀번호가 뭐예요?", romanization: "Waipai bimilbeonhoga mwoyeyo?", vietnamese: "Mật khẩu wifi là gì?", level: "cơ bản" },
    ],
  },
  {
    id: "workplace",
    icon: "ri-building-2-line",
    color: "#f59e0b",
    title: "Tiếng Hàn tại nơi làm việc",
    subtitle: "Giao tiếp cho công nhân xuất khẩu lao động",
    phrases: [
      { id: "wk1", korean: "안전모를 착용하세요", romanization: "Anjeonmoreul chagyonghaseyo", vietnamese: "Hãy đội mũ bảo hộ", level: "cơ bản", example: "작업 전에 안전모를 착용하세요", exampleVi: "Hãy đội mũ bảo hộ trước khi làm việc" },
      { id: "wk2", korean: "작업 지시서를 확인하세요", romanization: "Jageop jisisireul hwagin haseyo", vietnamese: "Hãy kiểm tra phiếu chỉ thị công việc", level: "trung cấp" },
      { id: "wk3", korean: "불량품이 나왔어요", romanization: "Bullyangpumi nawasseoyo", vietnamese: "Có sản phẩm lỗi xuất hiện", level: "trung cấp" },
      { id: "wk4", korean: "기계가 고장났어요", romanization: "Gigyega gojangnaesseoyo", vietnamese: "Máy móc bị hỏng rồi", level: "cơ bản" },
      { id: "wk5", korean: "라인을 멈춰 주세요", romanization: "Raineul meomchwo juseyo", vietnamese: "Dừng dây chuyền lại", level: "trung cấp" },
      { id: "wk6", korean: "몇 시에 퇴근해요?", romanization: "Myeot sie toegeunhaeyo?", vietnamese: "Mấy giờ tan ca?", level: "cơ bản" },
      { id: "wk7", korean: "잔업이 있어요?", romanization: "Janeopi isseoyo?", vietnamese: "Có làm thêm giờ không?", level: "cơ bản" },
      { id: "wk8", korean: "화장실 다녀와도 돼요?", romanization: "Hwajangsil danyeowado dwaeyo?", vietnamese: "Tôi có thể đi vệ sinh không?", level: "cơ bản" },
      { id: "wk9", korean: "이 부품은 어디에 넣어요?", romanization: "I bupumeun eodie neoeoyo?", vietnamese: "Linh kiện này để vào đâu?", level: "trung cấp" },
      { id: "wk10", korean: "수량이 맞지 않아요", romanization: "Suryangi matji anayo", vietnamese: "Số lượng không khớp", level: "trung cấp" },
      { id: "wk11", korean: "포장 방법을 알려 주세요", romanization: "Pojang bangbeoreul allyeo juseyo", vietnamese: "Hãy chỉ cho tôi cách đóng gói", level: "trung cấp" },
      { id: "wk12", korean: "납기일이 언제예요?", romanization: "Napgiiri eonjeyeyo?", vietnamese: "Ngày giao hàng là khi nào?", level: "nâng cao" },
      { id: "wk13", korean: "품질 검사를 해야 해요", romanization: "Pumjil gemsareul haeya haeyo", vietnamese: "Phải kiểm tra chất lượng", level: "trung cấp" },
      { id: "wk14", korean: "안전 교육을 받았어요?", romanization: "Anjeon gyoyugeul badasseoyo?", vietnamese: "Bạn đã được đào tạo an toàn chưa?", level: "trung cấp" },
      { id: "wk15", korean: "작업복을 입어야 해요", romanization: "Jageokbogeul ibeoya haeyo", vietnamese: "Phải mặc đồng phục làm việc", level: "cơ bản" },
      { id: "wk16", korean: "이 기계 사용법을 모르겠어요", romanization: "I gigye sayongbeobeul moreugeseoyo", vietnamese: "Tôi không biết cách dùng máy này", level: "trung cấp" },
      { id: "wk17", korean: "다시 한번 보여 주세요", romanization: "Dasi hanbeon boyeo juseyo", vietnamese: "Hãy chỉ lại cho tôi một lần nữa", level: "cơ bản" },
      { id: "wk18", korean: "재료가 부족해요", romanization: "Jaeryoga bujokaeyo", vietnamese: "Nguyên liệu không đủ", level: "trung cấp" },
      { id: "wk19", korean: "이 작업은 위험해요", romanization: "I jageoneun wiheomhaeyo", vietnamese: "Công việc này nguy hiểm", level: "cơ bản" },
      { id: "wk20", korean: "보호 장갑을 끼세요", romanization: "Boho janggabeul kkiseyo", vietnamese: "Hãy đeo găng tay bảo hộ", level: "cơ bản" },
      { id: "wk21", korean: "오늘 목표 수량이 얼마예요?", romanization: "Oneul mokpyo suryangi eolmayeyo?", vietnamese: "Hôm nay chỉ tiêu số lượng là bao nhiêu?", level: "trung cấp" },
      { id: "wk22", korean: "불량률이 높아요", romanization: "Bullyangnyuri nopayo", vietnamese: "Tỷ lệ lỗi cao", level: "nâng cao" },
      { id: "wk23", korean: "교대 시간이 됐어요", romanization: "Gyodae sigani dwaesseoyo", vietnamese: "Đến giờ giao ca rồi", level: "cơ bản" },
      { id: "wk24", korean: "점심 시간이에요", romanization: "Jeomsim siganieyo", vietnamese: "Đến giờ ăn trưa rồi", level: "cơ bản" },
      { id: "wk25", korean: "이 작업 순서가 맞아요?", romanization: "I jageop sunseoга majayo?", vietnamese: "Thứ tự công việc này có đúng không?", level: "trung cấp" },
      { id: "wk26", korean: "산업재해 보험이 있어요?", romanization: "Saneop jaehae boheomi isseoyo?", vietnamese: "Có bảo hiểm tai nạn lao động không?", level: "nâng cao" },
      { id: "wk27", korean: "근로계약서를 보여 주세요", romanization: "Geullonyegyakseoreul boyeo juseyo", vietnamese: "Hãy cho tôi xem hợp đồng lao động", level: "nâng cao" },
      { id: "wk28", korean: "초과 근무 수당이 있어요?", romanization: "Chogwa geunmu sudangi isseoyo?", vietnamese: "Có phụ cấp làm thêm giờ không?", level: "nâng cao" },
      { id: "wk29", korean: "이번 달 급여가 얼마예요?", romanization: "Ibeon dal geubyeoga eolmayeyo?", vietnamese: "Tháng này lương bao nhiêu?", level: "trung cấp" },
      { id: "wk30", korean: "4대 보험에 가입했어요?", romanization: "Sadae boheome gaiphaesseoyo?", vietnamese: "Đã tham gia 4 loại bảo hiểm chưa?", level: "nâng cao" },
      { id: "wk31", korean: "연차 휴가를 쓰고 싶어요", romanization: "Yeoncha hyugareul sseugo sipeoyo", vietnamese: "Tôi muốn dùng ngày phép năm", level: "nâng cao" },
      { id: "wk32", korean: "병가를 내고 싶어요", romanization: "Byeonggareul naego sipeoyo", vietnamese: "Tôi muốn xin nghỉ ốm", level: "trung cấp" },
      { id: "wk33", korean: "작업 중에 다쳤어요", romanization: "Jageop junge dachyeosseoyo", vietnamese: "Tôi bị thương trong khi làm việc", level: "cơ bản" },
      { id: "wk34", korean: "응급처치가 필요해요", romanization: "Eungeupcheochiга piryohaeyo", vietnamese: "Cần sơ cứu khẩn cấp", level: "cơ bản" },
      { id: "wk35", korean: "관리자를 불러 주세요", romanization: "Gwallija reul bulleo juseyo", vietnamese: "Gọi quản lý cho tôi", level: "cơ bản" },
      { id: "wk36", korean: "통역사가 필요해요", romanization: "Tongyeoksaga piryohaeyo", vietnamese: "Tôi cần phiên dịch viên", level: "trung cấp" },
      { id: "wk37", korean: "한국어를 잘 못해요", romanization: "Hangugeoreul jal motaeyo", vietnamese: "Tôi không giỏi tiếng Hàn", level: "cơ bản" },
      { id: "wk38", korean: "베트남어로 써 주세요", romanization: "Beteunamoreo sseo juseyo", vietnamese: "Hãy viết bằng tiếng Việt cho tôi", level: "trung cấp" },
      { id: "wk39", korean: "기숙사가 어디예요?", romanization: "Gisuksaga eodiyeyo?", vietnamese: "Ký túc xá ở đâu?", level: "cơ bản" },
      { id: "wk40", korean: "식당이 어디예요?", romanization: "Sikdangi eodiyeyo?", vietnamese: "Nhà ăn ở đâu?", level: "cơ bản" },
      { id: "wk41", korean: "버스 시간표가 있어요?", romanization: "Beoseu siganpyoga isseoyo?", vietnamese: "Có lịch xe buýt không?", level: "cơ bản" },
      { id: "wk42", korean: "공장 규칙을 알려 주세요", romanization: "Gongjang gyucheugeul allyeo juseyo", vietnamese: "Hãy cho tôi biết nội quy nhà máy", level: "trung cấp" },
      { id: "wk43", korean: "이 기계를 어떻게 청소해요?", romanization: "I gigyereul eotteoke cheongsohaeyo?", vietnamese: "Vệ sinh máy này như thế nào?", level: "trung cấp" },
      { id: "wk44", korean: "작업 속도를 높여야 해요", romanization: "Jageop sokdoreul nopyeoya haeyo", vietnamese: "Phải tăng tốc độ làm việc", level: "trung cấp" },
      { id: "wk45", korean: "오늘 야근 있어요?", romanization: "Oneul yageun isseoyo?", vietnamese: "Hôm nay có tăng ca không?", level: "cơ bản" },
      { id: "wk46", korean: "주말에 출근해야 해요?", romanization: "Jumare chulgeunhaeya haeyo?", vietnamese: "Cuối tuần có phải đi làm không?", level: "trung cấp" },
      { id: "wk47", korean: "이 서류에 서명해 주세요", romanization: "I seoryue seomyeonghae juseyo", vietnamese: "Hãy ký vào giấy tờ này", level: "trung cấp" },
      { id: "wk48", korean: "비자 연장을 해야 해요", romanization: "Bija yeonjang eul haeya haeyo", vietnamese: "Phải gia hạn visa", level: "nâng cao" },
      { id: "wk49", korean: "외국인 등록증을 만들었어요?", romanization: "Oegugin deungnokjeungeul mandeureosseoyo?", vietnamese: "Đã làm thẻ đăng ký người nước ngoài chưa?", level: "nâng cao" },
      { id: "wk50", korean: "1345에 전화하면 도움을 받을 수 있어요", romanization: "1345e jeonhwahameyon doumeul badeul su isseoyo", vietnamese: "Gọi 1345 có thể nhận được sự giúp đỡ (hỗ trợ tiếng Việt)", level: "cơ bản" },
    ],
  },
  {
    id: "provinces",
    icon: "ri-map-pin-line",
    color: "#10b981",
    title: "34 Tỉnh thành Việt Nam",
    subtitle: "Tên tỉnh thành bằng tiếng Hàn",
    phrases: [
      { id: "pv1", korean: "선광", romanization: "Seon-gwang", vietnamese: "Tuyên Quang", level: "cơ bản" },
      { id: "pv2", korean: "고평", romanization: "Go-pyeong", vietnamese: "Cao Bằng", level: "cơ bản" },
      { id: "pv3", korean: "래주", romanization: "Rae-ju", vietnamese: "Lai Châu", level: "cơ bản" },
      { id: "pv4", korean: "노가", romanization: "No-ga", vietnamese: "Lào Cai", level: "cơ bản" },
      { id: "pv5", korean: "태원", romanization: "Tae-won", vietnamese: "Thái Nguyên", level: "cơ bản" },
      { id: "pv6", korean: "전변", romanization: "Jeon-byeon", vietnamese: "Điện Biên", level: "cơ bản" },
      { id: "pv7", korean: "량산", romanization: "Ryang-san", vietnamese: "Lạng Sơn", level: "cơ bản" },
      { id: "pv8", korean: "산라", romanization: "San-ra", vietnamese: "Sơn La", level: "cơ bản" },
      { id: "pv9", korean: "부수", romanization: "Bu-su", vietnamese: "Phú Thọ", level: "cơ bản" },
      { id: "pv10", korean: "북녕", romanization: "Buk-nyeong", vietnamese: "Bắc Ninh", level: "cơ bản" },
      { id: "pv11", korean: "광녕", romanization: "Gwang-nyeong", vietnamese: "Quảng Ninh", level: "cơ bản" },
      { id: "pv12", korean: "하내", romanization: "Ha-nae", vietnamese: "Hà Nội", level: "cơ bản" },
      { id: "pv13", korean: "해방", romanization: "Hae-bang", vietnamese: "Hải Phòng", level: "cơ bản" },
      { id: "pv14", korean: "흥안", romanization: "Heung-an", vietnamese: "Hưng Yên", level: "cơ bản" },
      { id: "pv15", korean: "녕평", romanization: "Nyeong-pyeong", vietnamese: "Ninh Bình", level: "cơ bản" },
      { id: "pv16", korean: "청화", romanization: "Cheong-hwa", vietnamese: "Thanh Hóa", level: "cơ bản" },
      { id: "pv17", korean: "예안", romanization: "Ye-an", vietnamese: "Nghệ An", level: "cơ bản" },
      { id: "pv18", korean: "하정", romanization: "Ha-jeong", vietnamese: "Hà Tĩnh", level: "cơ bản" },
      { id: "pv19", korean: "광치", romanization: "Gwang-chi", vietnamese: "Quảng Trị", level: "cơ bản" },
      { id: "pv20", korean: "순화", romanization: "Sun-hwa", vietnamese: "Huế", level: "cơ bản" },
      { id: "pv21", korean: "현항", romanization: "Hyeon-hang", vietnamese: "Đà Nẵng", level: "cơ bản" },
      { id: "pv22", korean: "광의", romanization: "Gwang-ui", vietnamese: "Quảng Ngãi", level: "cơ bản" },
      { id: "pv23", korean: "가래", romanization: "Ga-rae", vietnamese: "Gia Lai", level: "cơ bản" },
      { id: "pv24", korean: "득락", romanization: "Deuk-rak", vietnamese: "Đắk Lắk", level: "cơ bản" },
      { id: "pv25", korean: "경화", romanization: "Gyeong-hwa", vietnamese: "Khánh Hòa", level: "cơ bản" },
      { id: "pv26", korean: "림동", romanization: "Rim-dong", vietnamese: "Lâm Đồng", level: "cơ bản" },
      { id: "pv27", korean: "동내", romanization: "Dong-nae", vietnamese: "Đồng Nai", level: "cơ bản" },
      { id: "pv28", korean: "서녕", romanization: "Seo-nyeong", vietnamese: "Tây Ninh", level: "cơ bản" },
      { id: "pv29", korean: "호찌민", romanization: "Ho-chi-min", vietnamese: "Hồ Chí Minh", level: "cơ bản" },
      { id: "pv30", korean: "동탑", romanization: "Dong-tap", vietnamese: "Đồng Tháp", level: "cơ bản" },
      { id: "pv31", korean: "안강", romanization: "An-gang", vietnamese: "An Giang", level: "cơ bản" },
      { id: "pv32", korean: "영롱", romanization: "Yeong-rong", vietnamese: "Vĩnh Long", level: "cơ bản" },
      { id: "pv33", korean: "근저", romanization: "Geun-jeo", vietnamese: "Cần Thơ", level: "cơ bản" },
      { id: "pv34", korean: "금구", romanization: "Geum-gu", vietnamese: "Cà Mau", level: "cơ bản" },
    ],
  },
];

// ─── Phrase Card ──────────────────────────────────────────────────────────
function PhraseCard({ phrase, onSpeak, isFavorite, onToggleFavorite }: {
  phrase: Phrase;
  onSpeak: (text: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const [showExample, setShowExample] = useState(false);
  const [showRoman, setShowRoman] = useState(false);
  const levelColor = phrase.level === "cơ bản" ? "#34d399" : phrase.level === "trung cấp" ? "app-accent-primary" : "#f87171";

  return (
    <div className="bg-app-bg border border-app-border rounded-xl p-4 hover:border-app-border transition-all group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${levelColor}15`, color: levelColor }}>
              {phrase.level}
            </span>
          </div>
          <p className="text-white font-bold text-lg leading-tight">{phrase.korean}</p>
          {showRoman && (
            <p className="text-app-text-secondary text-xs italic mt-0.5">{phrase.romanization}</p>
          )}
          <p className="text-white/60 text-sm mt-1">{phrase.vietnamese}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => onToggleFavorite(phrase.id)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${isFavorite ? "text-app-accent-primary bg-app-accent-primary/10" : "text-app-text-muted hover:text-white/50 hover:bg-app-card/50"}`}>
            <i className={isFavorite ? "ri-star-fill text-sm" : "ri-star-line text-sm"}></i>
          </button>
          <button onClick={() => onSpeak(phrase.korean)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary hover:text-white/70 transition-colors cursor-pointer">
            <i className="ri-volume-up-line text-sm"></i>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <button onClick={() => setShowRoman(v => !v)}
          className="text-[10px] text-app-text-muted hover:text-white/50 cursor-pointer whitespace-nowrap transition-colors">
          {showRoman ? "Ẩn phiên âm" : "Xem phiên âm"}
        </button>
        {phrase.example && (
          <button onClick={() => setShowExample(v => !v)}
            className="text-[10px] text-app-text-muted hover:text-app-accent-primary/60 cursor-pointer whitespace-nowrap transition-colors">
            {showExample ? "Ẩn ví dụ" : "Xem ví dụ"}
          </button>
        )}
      </div>

      {showExample && phrase.example && (
        <div className="mt-3 p-3 bg-app-surface/50 rounded-lg border border-app-border">
          <p className="text-white/70 text-xs font-medium">{phrase.example}</p>
          <p className="text-white/35 text-[10px] italic mt-1">{phrase.exampleVi}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function ConversationPage() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | "cơ bản" | "trung cấp" | "nâng cao">("all");
  const [favorites, setFavorites] = useLocalStorage<string[]>("kts_conversation_favorites", []);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const currentTopic = TOPICS.find(t => t.id === selectedTopic);

  const filteredPhrases = useMemo(() => {
    let phrases: (Phrase & { topicTitle: string; topicColor: string })[] = [];
    const topics = selectedTopic ? TOPICS.filter(t => t.id === selectedTopic) : TOPICS;
    topics.forEach(t => {
      t.phrases.forEach(p => phrases.push({ ...p, topicTitle: t.title, topicColor: t.color }));
    });
    if (levelFilter !== "all") phrases = phrases.filter(p => p.level === levelFilter);
    if (showFavoritesOnly) phrases = phrases.filter(p => favorites.includes(p.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      phrases = phrases.filter(p =>
        p.korean.includes(q) || p.vietnamese.toLowerCase().includes(q) || p.romanization.toLowerCase().includes(q)
      );
    }
    return phrases;
  }, [selectedTopic, levelFilter, showFavoritesOnly, search, favorites]);

  const practiceList = useMemo(() => filteredPhrases.filter(p => favorites.includes(p.id)), [filteredPhrases, favorites]);

  if (practiceMode && practiceList.length > 0) {
    const current = practiceList[practiceIdx % practiceList.length];
    return (
      <DashboardLayout title="Luyện tập giao tiếp" subtitle="Flashcard câu giao tiếp yêu thích">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { setPracticeMode(false); setShowAnswer(false); setPracticeIdx(0); }}
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm cursor-pointer whitespace-nowrap">
              <i className="ri-arrow-left-line"></i>Quay lại
            </button>
            <span className="text-app-text-muted text-sm">{(practiceIdx % practiceList.length) + 1} / {practiceList.length}</span>
          </div>

          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center mb-4 min-h-[240px] flex flex-col items-center justify-center">
            <p className="text-app-text-muted text-xs mb-4 tracking-normal">Tiếng Hàn</p>
            <p className="text-white font-black text-4xl mb-3">{current.korean}</p>
            {showAnswer ? (
              <div className="mt-4 space-y-2">
                <p className="text-white/50 text-sm italic">{current.romanization}</p>
                <p className="text-app-accent-primary font-semibold text-lg">{current.vietnamese}</p>
              </div>
            ) : (
              <button onClick={() => setShowAnswer(true)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-app-card/50 hover:bg-app-card/70 text-white/50 text-sm cursor-pointer whitespace-nowrap transition-colors">
                Xem nghĩa
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => speak(current.korean)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-app-border text-white/50 hover:bg-app-card/50 text-sm cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-volume-up-line"></i>Nghe
            </button>
            <button onClick={() => { setPracticeIdx(i => i + 1); setShowAnswer(false); }}
              className="flex-1 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
              Tiếp theo <i className="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Tiếng Hàn Giao Tiếp"
      subtitle="Câu giao tiếp đời sống hàng ngày — từ cơ bản đến nâng cao"
      actions={
        favorites.length > 0 ? (
          <button onClick={() => { setPracticeMode(true); setPracticeIdx(0); setShowAnswer(false); }}
            className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-play-line"></i>Luyện tập ({favorites.length} câu)
          </button>
        ) : undefined
      }
    >
      <div className="grid grid-cols-[240px_1fr] gap-6">
        {/* Sidebar topics */}
        <div className="space-y-2">
          <button
            onClick={() => setSelectedTopic(null)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer text-left ${!selectedTopic ? "bg-app-accent-primary/10 border border-app-accent-primary/20 text-app-accent-primary" : "bg-app-surface/50 border border-app-border text-white/50 hover:text-white/70 hover:bg-app-card/50"}`}
          >
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 flex-shrink-0">
              <i className="ri-apps-line text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs">Tất cả chủ đề</p>
              <p className="text-[10px] opacity-60">{TOPICS.reduce((s, t) => s + t.phrases.length, 0)} câu</p>
            </div>
          </button>

          {TOPICS.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer text-left ${selectedTopic === t.id ? "border" : "bg-app-surface/50 border border-app-border text-white/50 hover:text-white/70 hover:bg-app-card/50"}`}
              style={selectedTopic === t.id ? { backgroundColor: `${t.color}10`, borderColor: `${t.color}25`, color: t.color } : {}}
            >
              <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${t.color}15` }}>
                <i className={`${t.icon} text-sm`} style={{ color: t.color }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs truncate">{t.title}</p>
                <p className="text-[10px] opacity-60">{t.phrases.length} câu</p>
              </div>
            </button>
          ))}

          {/* Favorites shortcut */}
          {favorites.length > 0 && (
            <button
              onClick={() => setShowFavoritesOnly(v => !v)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer text-left mt-2 ${showFavoritesOnly ? "bg-app-accent-primary/10 border border-app-accent-primary/20 text-app-accent-primary" : "bg-app-surface/50 border border-app-border text-white/50 hover:text-white/70"}`}
            >
              <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-accent-primary/10 flex-shrink-0">
                <i className="ri-star-fill text-app-accent-primary text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs">Yêu thích</p>
                <p className="text-[10px] opacity-60">{favorites.length} câu đã lưu</p>
              </div>
            </button>
          )}
        </div>

        {/* Main content */}
        <div>
          {/* Header */}
          {currentTopic && (
            <div className="flex items-center gap-3 mb-5 p-4 rounded-xl border" style={{ backgroundColor: `${currentTopic.color}08`, borderColor: `${currentTopic.color}20` }}>
              <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${currentTopic.color}15` }}>
                <i className={`${currentTopic.icon} text-lg`} style={{ color: currentTopic.color }}></i>
              </div>
              <div>
                <h2 className="text-white font-bold text-base">{currentTopic.title}</h2>
                <p className="text-app-text-secondary text-xs">{currentTopic.subtitle} · {currentTopic.phrases.length} câu</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm câu tiếng Hàn hoặc tiếng Việt..."
                className="w-full bg-app-bg border border-app-border rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary/30 placeholder-white/20" />
            </div>
            <div className="flex items-center gap-1 bg-app-surface/50 p-1 rounded-lg">
              {(["all", "cơ bản", "trung cấp"] as const).map(l => (
                <button key={l} onClick={() => setLevelFilter(l)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${levelFilter === l ? "bg-app-card/70 text-white" : "text-app-text-secondary hover:text-white/60"}`}>
                  {l === "all" ? "Tất cả" : l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-app-text-muted text-xs">{filteredPhrases.length} câu</p>
            <button onClick={() => { filteredPhrases.forEach(p => toggleFavorite(p.id)); }}
              className="text-app-text-muted hover:text-app-accent-primary/60 text-xs cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-star-line mr-1"></i>Lưu tất cả
            </button>
          </div>

          {/* Phrases grid */}
          {filteredPhrases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <i className="ri-chat-3-line text-white/10 text-4xl mb-3"></i>
              <p className="text-app-text-muted text-sm">Không tìm thấy câu nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredPhrases.map(p => (
                <PhraseCard key={p.id} phrase={p} onSpeak={speak}
                  isFavorite={favorites.includes(p.id)} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
