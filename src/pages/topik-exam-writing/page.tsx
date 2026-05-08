import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

type QType = 51 | 52 | 53 | 54;

interface TopikWritingQ {
  id: string;
  year: number;
  session: number;
  qNum: QType;
  title: string;
  passage?: string;
  passageSummaryVi?: string;
  question: string;
  analysisVi: string;
  outline?: string[];
  usefulPhrases?: { kr: string; vi: string }[];
  charLimit?: { min: number; max: number };
  sampleAnswer: string;
  scoringPoints?: string[];
  timerMinutes?: number;
}

const USEFUL_PHRASES_51_52 = [
  { kr: "그러므로 / 따라서", vi: "Do đó / Vì vậy (kết luận)" },
  { kr: "그러나 / 하지만", vi: "Tuy nhiên / Nhưng (đối lập)" },
  { kr: "이처럼 / 이와 같이", vi: "Như vậy / Tương tự (tóm lược)" },
  { kr: "뿐만 아니라 / 또한", vi: "Không chỉ... mà còn / Ngoài ra" },
  { kr: "반면에 / 반면", vi: "Ngược lại / Trái lại" },
  { kr: "예를 들어 / 예컨대", vi: "Ví dụ / Chẳng hạn" },
];

const USEFUL_PHRASES_53 = [
  { kr: "~이/가 ~%에서 ~%로 증가/감소하였다", vi: "... tăng/giảm từ ...% lên/xuống ...%" },
  { kr: "이러한 변화의 원인으로는 ~을/를 들 수 있다", vi: "Nguyên nhân của sự thay đổi này là..." },
  { kr: "~의 비율이 가장 높은/낮은 것으로 나타났다", vi: "Tỷ lệ ... được ghi nhận là cao/thấp nhất" },
  { kr: "이처럼 ~하는 추세가 계속되고 있다", vi: "Xu hướng ... như vậy vẫn đang tiếp tục" },
  { kr: "앞으로 ~에 대한 관심이 더욱 높아질 것으로 보인다", vi: "Có vẻ sự quan tâm về... sẽ ngày càng tăng" },
];

const USEFUL_PHRASES_54 = [
  { kr: "현대 사회에서 ~은/는 중요한 문제이다", vi: "Trong xã hội hiện đại, ... là vấn đề quan trọng" },
  { kr: "이러한 문제를 해결하기 위해서는 ~해야 한다", vi: "Để giải quyết vấn đề này, cần phải..." },
  { kr: "개인적 차원에서 / 사회적 차원에서", vi: "Ở cấp độ cá nhân / Ở cấp độ xã hội" },
  { kr: "~의 장점은 ~이고, 단점은 ~이다", vi: "Ưu điểm của... là..., nhược điểm là..." },
  { kr: "결론적으로 / 이를 종합하면", vi: "Kết luận lại / Tổng hợp lại" },
  { kr: "정부는 ~하는 정책을 마련해야 한다", vi: "Chính phủ cần xây dựng chính sách..." },
];

const QUESTIONS: TopikWritingQ[] = [
  // ─── Q51 ─────────────────────────────────────────────────────────────────
  {
    id: "q51-2023-1",
    year: 2023, session: 1, qNum: 51,
    title: "빈칸 채우기 ㉠",
    passage: `사람들은 보통 스트레스를 나쁜 것으로 생각한다. 하지만 적당한 스트레스는 오히려 도움이 된다. 예를 들어 시험 전날 약간의 긴장감은 집중력을 높여 준다. ( ㉠ ). 따라서 스트레스를 무조건 피하려고 하기보다는 스트레스를 잘 관리하는 방법을 익히는 것이 중요하다.`,
    passageSummaryVi: "Đoạn văn nói về việc stress không hẳn là xấu. Câu trước ㉠ đưa ra ví dụ: căng thẳng trước thi giúp tập trung. Câu sau ㉠ kết luận: nên học cách quản lý stress thay vì tránh né.",
    question: "㉠에 들어갈 알맞은 문장을 한 문장으로 쓰시오.",
    analysisVi: "㉠ nằm giữa ví dụ cụ thể (căng thẳng → tập trung) và kết luận tổng quát. Cần viết 1 câu **tóm lược / rút ra nhận xét** từ ví dụ trên → dẫn đến kết luận bên dưới. Dùng: 그러므로 / 이처럼 / 즉.",
    usefulPhrases: USEFUL_PHRASES_51_52,
    sampleAnswer: "그러므로 스트레스가 항상 나쁜 것만은 아니다.",
    scoringPoints: ["내용의 흐름에 맞는 연결 문장", "앞 내용을 정리하거나 결론을 이끄는 표현 사용"],
  },
  {
    id: "q51-2022-1",
    year: 2022, session: 1, qNum: 51,
    title: "빈칸 채우기 ㉠",
    passage: `현대인들은 바쁜 일상 속에서 운동을 하지 못하는 경우가 많다. 그런데 ( ㉠ ). 예를 들어 엘리베이터 대신 계단을 이용하거나 가까운 거리는 걸어 다니는 것도 좋은 방법이다. 이처럼 생활 속 작은 움직임들이 모여 건강한 몸을 만들 수 있다.`,
    passageSummaryVi: "Người hiện đại bận rộn nên không tập thể dục được. ㉠ đứng giữa câu mở đầu vấn đề và các ví dụ cụ thể (dùng cầu thang, đi bộ gần). Câu kết: những vận động nhỏ góp lại tạo nên sức khỏe.",
    question: "㉠에 들어갈 알맞은 문장을 한 문장으로 쓰시오.",
    analysisVi: "㉠ phải là câu **dẫn vào ví dụ** bên dưới. Câu trước: người bận không vận động được. ㉠: gợi ý rằng vẫn có cách → ví dụ sẽ cụ thể hóa. Dùng: 그런데 đã có rồi, nên câu ㉠ nên nói 'vẫn có thể tập ngay trong sinh hoạt hàng ngày'.",
    usefulPhrases: USEFUL_PHRASES_51_52,
    sampleAnswer: "일상 속에서도 조금만 신경 쓰면 충분히 운동 효과를 얻을 수 있다.",
    scoringPoints: ["뒤에 이어지는 예시를 자연스럽게 이끄는 문장", "생활 속 운동 가능성을 제시하는 내용"],
  },
  {
    id: "q51-2021-2",
    year: 2021, session: 2, qNum: 51,
    title: "빈칸 채우기 ㉠",
    passage: `독서는 지식을 쌓는 데 도움이 될 뿐만 아니라 상상력과 창의력을 키워 준다. ( ㉠ ). 실제로 다양한 연구에서 독서를 즐기는 아이들이 그렇지 않은 아이들보다 어휘력과 문장 이해 능력이 훨씬 뛰어난 것으로 나타났다. 따라서 어릴 때부터 독서 습관을 들이는 것이 매우 중요하다.`,
    passageSummaryVi: "Đọc sách giúp tích lũy kiến thức, tưởng tượng và sáng tạo. ㉠ đứng trước nghiên cứu thực tế về trẻ em. Câu kết: cần tạo thói quen đọc sách từ nhỏ.",
    question: "㉠에 들어갈 알맞은 문장을 한 문장으로 쓰시오.",
    analysisVi: "㉠ cần nối câu tổng quát (đọc sách tốt cho trẻ em) → nghiên cứu cụ thể. Hướng: viết câu nhấn mạnh **lợi ích đặc biệt với trẻ nhỏ** để câu nghiên cứu bên dưới có cơ sở. Dùng: 특히 / 더욱이.",
    usefulPhrases: USEFUL_PHRASES_51_52,
    sampleAnswer: "특히 어린 시절에 독서를 많이 하면 언어 능력 발달에 큰 도움이 된다.",
    scoringPoints: ["앞 문장과 연결되는 추가 설명", "뒤의 연구 결과를 자연스럽게 이끄는 문장"],
  },
  // ─── Q52 ─────────────────────────────────────────────────────────────────
  {
    id: "q52-2023-1",
    year: 2023, session: 1, qNum: 52,
    title: "빈칸 채우기 ㉡",
    passage: `사람들은 보통 스트레스를 나쁜 것으로 생각한다. 하지만 적당한 스트레스는 오히려 도움이 된다. 예를 들어 시험 전날 약간의 긴장감은 집중력을 높여 준다. 그러므로 스트레스가 항상 나쁜 것만은 아니다. 따라서 스트레스를 무조건 피하려고 하기보다는 ( ㉡ ).`,
    passageSummaryVi: "Cùng đoạn văn về stress với Q51. Câu trước ㉡: 'không nên chỉ tránh né stress mà nên...' → ㉡ là phần kết hoàn chỉnh câu đó.",
    question: "㉡에 들어갈 알맞은 문장을 한 문장으로 쓰시오.",
    analysisVi: "㉡ là **mệnh đề bổ sung** cho '피하려고 하기보다는' (thay vì tránh né). Cần viết câu nêu **giải pháp thay thế**: học cách quản lý / đối phó với stress. Câu phải là vế sau của cấu trúc 'A하기보다는 B하는 것이 중요하다'.",
    usefulPhrases: USEFUL_PHRASES_51_52,
    sampleAnswer: "스트레스를 효과적으로 관리하는 방법을 배우는 것이 더 현명하다.",
    scoringPoints: ["결론 문장으로 앞 내용을 마무리하는 표현", "'피하기보다는' 뒤에 이어지는 대안 제시"],
  },
  {
    id: "q52-2022-1",
    year: 2022, session: 1, qNum: 52,
    title: "빈칸 채우기 ㉡",
    passage: `현대인들은 바쁜 일상 속에서 운동을 하지 못하는 경우가 많다. 그런데 일상 속에서도 조금만 신경 쓰면 충분히 운동 효과를 얻을 수 있다. 예를 들어 엘리베이터 대신 계단을 이용하거나 가까운 거리는 걸어 다니는 것도 좋은 방법이다. ( ㉡ ).`,
    passageSummaryVi: "Cùng chủ đề với Q51-2022. ㉡ đứng ở cuối đoạn văn, sau các ví dụ cụ thể (cầu thang, đi bộ). Đây là câu **kết luận** toàn bộ đoạn.",
    question: "㉡에 들어갈 알맞은 문장을 한 문장으로 쓰시오.",
    analysisVi: "㉡ là câu **kết luận cuối đoạn** → tổng kết các ví dụ bên trên. Dùng: 이처럼 / 이와 같이 để tham chiếu lại ví dụ → rút ra bài học về thói quen nhỏ = sức khỏe.",
    usefulPhrases: USEFUL_PHRASES_51_52,
    sampleAnswer: "이처럼 생활 속 작은 습관 변화가 건강을 지키는 첫걸음이 될 수 있다.",
    scoringPoints: ["앞의 예시들을 종합하는 결론 문장", "생활 습관과 건강의 연결을 마무리하는 표현"],
  },
  {
    id: "q52-2021-2",
    year: 2021, session: 2, qNum: 52,
    title: "빈칸 채우기 ㉡",
    passage: `독서는 지식을 쌓는 데 도움이 될 뿐만 아니라 상상력과 창의력을 키워 준다. 특히 어린 시절에 독서를 많이 하면 언어 능력 발달에 큰 도움이 된다. 실제로 다양한 연구에서 독서를 즐기는 아이들이 그렇지 않은 아이들보다 어휘력과 문장 이해 능력이 훨씬 뛰어난 것으로 나타났다. ( ㉡ ).`,
    passageSummaryVi: "Cùng chủ đề đọc sách với Q51-2021. ㉡ ở cuối đoạn, sau bằng chứng nghiên cứu về trẻ em. Cần câu **đề nghị/kết luận thực tế** cho phụ huynh/xã hội.",
    question: "㉡에 들어갈 알맞은 문장을 한 문장으로 쓰시오.",
    analysisVi: "㉡ cần là câu **kết luận + đề xuất hành động** dựa trên nghiên cứu vừa nêu. Hướng: 'vì vậy cần tạo môi trường cho trẻ tiếp xúc sách từ sớm'. Dùng: 그러므로 / 따라서.",
    usefulPhrases: USEFUL_PHRASES_51_52,
    sampleAnswer: "그러므로 자녀가 어릴 때부터 책과 친해질 수 있는 환경을 만들어 주는 것이 필요하다.",
    scoringPoints: ["앞 내용을 바탕으로 한 결론 또는 제언", "'그러므로/따라서' 등 결론 접속어 사용"],
  },
  // ─── Q53 ─────────────────────────────────────────────────────────────────
  {
    id: "q53-2023-1",
    year: 2023, session: 1, qNum: 53,
    title: "단락 쓰기 (200~300자)",
    passage: `다음은 '한국 직장인의 여가 활동 변화'에 관한 자료입니다. 이 자료를 참고하여 여가 활동의 변화와 그 이유를 서술하시오.

[자료]
• 2013년: 주로 TV 시청(62%), 게임(18%)
• 2023년: TV 시청(28%), 운동·야외활동(41%), 문화생활(22%)
• 주 52시간 근무제 도입(2018년) 이후 여가 시간 증가`,
    question: "위 자료를 바탕으로 200~300자로 쓰시오.",
    analysisVi: "Đề bài yêu cầu mô tả **sự thay đổi** (con số cụ thể 2013→2023) và **lý do** (chế độ làm việc 52h). Không cần nêu ý kiến cá nhân. Viết theo trình tự: ① Giới thiệu chủ đề → ② Số liệu thay đổi → ③ Nguyên nhân → ④ Câu kết.",
    outline: [
      "① Dạo đầu: Hoạt động giải trí của người lao động Hàn Quốc đã thay đổi lớn.",
      "② Thay đổi: 2013 xem TV 62% → 2023 giảm còn 28%; vận động ngoài trời tăng lên 41%.",
      "③ Nguyên nhân: Chế độ 52h/tuần (2018) → thời gian rảnh tăng → tìm hoạt động tích cực hơn.",
      "④ Kết: Xu hướng này phản ánh người lao động ngày càng coi trọng sức khỏe và chất lượng sống.",
    ],
    usefulPhrases: USEFUL_PHRASES_53,
    charLimit: { min: 200, max: 300 },
    timerMinutes: 15,
    sampleAnswer: `한국 직장인들의 여가 활동은 지난 10년간 크게 변화하였다. 2013년에는 TV 시청이 62%로 가장 많았으나, 2023년에는 운동 및 야외활동이 41%로 1위를 차지하였다. 반면 TV 시청은 28%로 크게 감소하였다. 이러한 변화의 주요 원인으로는 2018년 주 52시간 근무제 도입으로 여가 시간이 늘어난 것을 들 수 있다. 여가 시간이 늘면서 사람들은 단순히 쉬는 것에서 벗어나 더 적극적이고 건강한 활동을 추구하게 된 것으로 보인다.`,
    scoringPoints: [
      "자료의 수치를 정확히 제시하는가",
      "변화 이유를 자료에 근거하여 설명하는가",
      "200~300자 분량을 지키는가",
      "문어체(격식체) 사용 여부",
    ],
  },
  {
    id: "q53-2022-1",
    year: 2022, session: 1, qNum: 53,
    title: "단락 쓰기 (200~300자)",
    passage: `다음은 '대학생의 스마트폰 사용 시간'에 관한 자료입니다. 이 자료를 참고하여 스마트폰 사용 시간의 변화와 그 영향에 대해 서술하시오.

[자료]
• 2018년 하루 평균 사용 시간: 3.2시간
• 2022년 하루 평균 사용 시간: 6.1시간 (약 2배 증가)
• 주요 용도: SNS(35%), 동영상 시청(30%), 게임(15%)
• 부작용: 수면 부족, 집중력 저하 호소 비율 증가`,
    question: "위 자료를 바탕으로 200~300자로 쓰시오.",
    analysisVi: "Đề bài yêu cầu: **thay đổi** (số liệu) + **ảnh hưởng** (tác dụng phụ). Lưu ý: câu hỏi dùng '영향' không phải '원인' nên tập trung vào hậu quả. Kết thúc bằng nhận xét/đề xuất ngắn.",
    outline: [
      "① Dẫn vào: Thời gian dùng smartphone của sinh viên tăng mạnh.",
      "② Số liệu: 3.2h (2018) → 6.1h (2022), gần gấp đôi. Chủ yếu dùng SNS (35%) và xem video (30%).",
      "③ Ảnh hưởng tiêu cực: thiếu ngủ, giảm khả năng tập trung ngày càng phổ biến.",
      "④ Kết + đề xuất: Smartphone hữu ích nhưng cần xây dựng thói quen sử dụng hợp lý.",
    ],
    usefulPhrases: USEFUL_PHRASES_53,
    charLimit: { min: 200, max: 300 },
    timerMinutes: 15,
    sampleAnswer: `대학생들의 스마트폰 사용 시간이 2018년 3.2시간에서 2022년 6.1시간으로 약 2배 가까이 증가하였다. 주된 용도는 SNS와 동영상 시청으로, 전체의 65%를 차지하고 있다. 이처럼 스마트폰 사용 시간이 늘어나면서 수면 부족과 집중력 저하를 호소하는 학생들도 많아졌다. 스마트폰은 편리한 도구이지만 지나친 사용은 학업과 건강에 부정적인 영향을 미칠 수 있으므로, 적절한 사용 습관을 기르는 것이 필요하다.`,
    scoringPoints: [
      "변화 수치를 정확히 언급하는가",
      "영향(부작용)을 자료와 연결하여 설명하는가",
      "자신의 의견 또는 제언으로 마무리하는가",
      "200~300자 분량 준수",
    ],
  },
  {
    id: "q53-2021-2",
    year: 2021, session: 2, qNum: 53,
    title: "단락 쓰기 (200~300자)",
    passage: `다음은 '한국의 1인 가구 증가'에 관한 자료입니다. 이 자료를 참고하여 1인 가구 증가의 현황과 원인에 대해 서술하시오.

[자료]
• 2000년: 전체 가구의 15.5%
• 2020년: 전체 가구의 31.7% (2배 이상 증가)
• 증가 원인: 만혼·비혼 증가, 고령 인구 증가, 취업·학업 목적의 독립
• 관련 산업: 소형 주택, 1인 식품, 간편식 시장 급성장`,
    question: "위 자료를 바탕으로 200~300자로 쓰시오.",
    analysisVi: "Đề bài yêu cầu: **hiện trạng** (con số) + **nguyên nhân** (3 nguyên nhân trong tài liệu). Có thể thêm tác động (ngành công nghiệp liên quan) như câu kết mở rộng.",
    outline: [
      "① Dẫn vào: Hộ gia đình 1 người ở Hàn Quốc tăng đáng kể.",
      "② Hiện trạng: Từ 15.5% (2000) lên 31.7% (2020), tăng hơn gấp đôi.",
      "③ Nguyên nhân: kết hôn muộn/không kết hôn tăng, dân số già, giới trẻ độc lập vì học/việc làm.",
      "④ Kết: Xu hướng này kéo theo sự phát triển nhanh của nhà nhỏ, thực phẩm 1 người, đồ ăn tiện lợi.",
    ],
    usefulPhrases: USEFUL_PHRASES_53,
    charLimit: { min: 200, max: 300 },
    timerMinutes: 15,
    sampleAnswer: `한국의 1인 가구 비율은 2000년 15.5%에서 2020년 31.7%로 2배 이상 증가하였다. 이러한 증가의 주요 원인으로는 결혼을 늦추거나 하지 않는 경향이 확산된 것과 고령 인구의 증가, 그리고 취업이나 학업을 위해 독립하는 청년층이 늘어난 것을 들 수 있다. 1인 가구가 늘어나면서 소형 주택이나 간편식, 1인 식품 등 관련 산업도 빠르게 성장하고 있다. 앞으로도 이 추세는 계속될 것으로 보여 사회 전반적인 인프라 변화가 필요하다.`,
    scoringPoints: [
      "수치를 정확히 인용하는가",
      "복수의 원인을 언급하는가",
      "관련 사회 변화까지 연결하는가",
      "200~300자 분량 준수",
    ],
  },
  // ─── Q54 ─────────────────────────────────────────────────────────────────
  {
    id: "q54-2023-1",
    year: 2023, session: 1, qNum: 54,
    title: "논설문 쓰기 (600~700자)",
    question: `현대 사회에서 인공지능(AI)의 사용이 점점 늘어나고 있다. 인공지능의 발전이 인간의 삶에 미치는 영향에 대해 아래 내용을 중심으로 자신의 의견을 쓰시오.

• 인공지능이 가져오는 긍정적인 변화
• 인공지능으로 인해 발생할 수 있는 문제점
• 인공지능과 공존하기 위한 방안`,
    analysisVi: "Đề bài cho sẵn 3 luận điểm bắt buộc. Bài luận Q54 phải có **서론 (mở) → 본론 (thân - 3 ý) → 결론 (kết)**. Dùng văn viết trang trọng (격식체 -이다/하다/이며/하여). Mỗi ý trong thân bài nên 1-2 câu ví dụ cụ thể.",
    outline: [
      "[서론] AI ngày càng phát triển và ảnh hưởng sâu rộng đến cuộc sống con người.",
      "[본론 1 - Tích cực] AI nâng cao hiệu quả: y tế (chẩn đoán nhanh), giáo dục (học cá nhân hóa), sản xuất.",
      "[본론 2 - Vấn đề] Nguy cơ mất việc làm (tự động hóa), rò rỉ dữ liệu cá nhân, phụ thuộc công nghệ.",
      "[본론 3 - Giải pháp] Chính phủ: luật AI; Doanh nghiệp: tái đào tạo nhân lực; Cá nhân: nâng cao kỹ năng số.",
      "[결론] AI chỉ là công cụ; cách sử dụng phụ thuộc vào con người.",
    ],
    usefulPhrases: USEFUL_PHRASES_54,
    charLimit: { min: 600, max: 700 },
    timerMinutes: 50,
    sampleAnswer: `최근 인공지능 기술이 급속도로 발전하면서 우리 생활 전반에 걸쳐 큰 변화가 일어나고 있다. 인공지능은 의료, 교육, 제조업 등 다양한 분야에서 인간의 업무를 보조하거나 대신함으로써 효율성을 크게 높이고 있다. 예를 들어 AI 진단 시스템은 의사들이 질병을 더 빠르고 정확하게 진단할 수 있도록 돕고 있으며, 교육 분야에서는 학생 개인의 수준에 맞는 맞춤형 학습을 가능하게 하고 있다.

그러나 인공지능의 발전이 긍정적인 면만 있는 것은 아니다. 가장 큰 우려는 일자리 감소 문제이다. 자동화로 인해 단순 반복 업무를 담당하던 노동자들이 일자리를 잃을 수 있다. 또한 인공지능이 수집하는 방대한 개인 데이터로 인한 프라이버시 침해 문제도 심각하게 고려해야 할 사안이다.

이러한 문제들을 해결하기 위해서는 정부, 기업, 시민 모두가 함께 노력해야 한다. 우선 정부는 인공지능 윤리 기준을 마련하고 관련 법규를 정비해야 한다. 기업은 인공지능 도입으로 인해 발생하는 일자리 손실에 대한 대안을 모색해야 하며, 개인은 디지털 역량을 키워 변화에 적응해 나가야 한다. 인공지능은 도구일 뿐이며, 그것을 어떻게 활용하느냐는 결국 인간의 선택에 달려 있다.`,
    scoringPoints: [
      "서론·본론·결론 구조가 명확한가",
      "긍정적 변화, 문제점, 방안 세 가지를 모두 다루는가",
      "구체적 예시를 들고 있는가",
      "논설문에 맞는 격식체 사용 여부",
      "600~700자 분량 준수",
    ],
  },
  {
    id: "q54-2022-1",
    year: 2022, session: 1, qNum: 54,
    title: "논설문 쓰기 (600~700자)",
    question: `현대 사회에서 환경 문제가 심각해지고 있다. 환경 보호를 위한 개인과 사회의 역할에 대해 아래 내용을 중심으로 자신의 의견을 쓰시오.

• 환경 문제가 심각해지는 원인
• 개인이 할 수 있는 환경 보호 방법
• 환경 보호를 위해 사회(기업, 정부)가 해야 할 역할`,
    analysisVi: "Đề bài 3 ý: nguyên nhân → cá nhân → xã hội. Câu Q54 môi trường rất phổ biến trong TOPIK. Lưu ý: ý 'nguyên nhân' thường ngắn (2-3 câu), hai ý sau dài hơn. Kết bằng câu kêu gọi hành động.",
    outline: [
      "[서론] Ô nhiễm môi trường ngày càng nghiêm trọng trên toàn cầu.",
      "[본론 1 - Nguyên nhân] Công nghiệp hóa → dùng nhiên liệu hóa thạch; văn hóa tiêu dùng lãng phí.",
      "[본론 2 - Cá nhân] Dùng túi vải/bình nước; đi phương tiện công cộng; phân loại rác.",
      "[본론 3 - Xã hội] Doanh nghiệp: sản xuất xanh; Chính phủ: thuế carbon, luật bảo vệ môi trường.",
      "[결론] Cá nhân + xã hội cùng hành động ngay, nếu không thế hệ sau gánh chịu hậu quả.",
    ],
    usefulPhrases: USEFUL_PHRASES_54,
    charLimit: { min: 600, max: 700 },
    timerMinutes: 50,
    sampleAnswer: `오늘날 지구 온난화, 미세먼지, 플라스틱 쓰레기 문제 등 환경 오염이 갈수록 심각해지고 있다. 이러한 환경 문제의 근본적인 원인은 산업화와 도시화로 인한 화석 연료의 과도한 사용, 그리고 무분별한 소비 문화에서 찾을 수 있다. 특히 일회용품 사용 증가와 과도한 포장 문화는 쓰레기 매립지를 늘리고 바다 오염을 심화시키는 주요 요인이 되고 있다.

개인 차원에서는 일상 속 작은 실천으로도 환경 보호에 기여할 수 있다. 장바구니와 텀블러를 사용하고, 대중교통을 이용하며, 분리배출을 철저히 하는 것이 대표적인 예이다. 이러한 작은 습관 변화들이 모이면 사회 전체에 큰 변화를 가져올 수 있다.

그러나 개인의 노력만으로는 한계가 있다. 기업은 친환경 생산 방식을 도입하고, 과도한 포장재 사용을 줄여야 한다. 정부는 탄소세 도입, 재생 에너지 지원 확대, 환경 오염 기업에 대한 강력한 규제 등 제도적 장치를 마련해야 한다. 환경 문제는 개인과 사회가 함께 책임감을 갖고 대처해야 할 과제이며, 지금 당장 행동에 나서지 않으면 다음 세대에게 심각한 피해를 물려주게 될 것이다.`,
    scoringPoints: [
      "원인·개인 역할·사회 역할 세 가지를 균형 있게 다루는가",
      "서론·본론·결론 구조",
      "구체적 예시 및 수치 활용 여부",
      "600~700자 분량 준수",
    ],
  },
  {
    id: "q54-2021-2",
    year: 2021, session: 2, qNum: 54,
    title: "논설문 쓰기 (600~700자)",
    question: `현대 사회에서 '삶의 질'에 대한 관심이 높아지고 있다. 삶의 질을 높이기 위한 방법에 대해 아래 내용을 중심으로 자신의 의견을 쓰시오.

• 삶의 질이란 무엇이며 왜 중요한가
• 삶의 질을 높이기 위해 개인이 할 수 있는 것
• 삶의 질 향상을 위한 사회적 환경 조성`,
    analysisVi: "Ý đầu tiên hỏi '삶의 질이란' → cần **định nghĩa** ngắn gọn (không chỉ là tiền bạc, mà gồm sức khỏe, quan hệ, tự thực hiện...). Ý 2+3 thực hành: cá nhân và xã hội. Đây là dạng đề mở nhất của Q54.",
    outline: [
      "[서론 + 정의] Chất lượng sống = sức khỏe + quan hệ + tinh thần + tự thực hiện bản thân; quan trọng hơn thu nhập.",
      "[본론 1 - Cá nhân] Vận động thường xuyên, ăn uống lành mạnh; sở thích, du lịch; trân trọng quan hệ gia đình.",
      "[본론 2 - Xã hội] Chế độ lao động đảm bảo thời gian nghỉ; cơ sở hạ tầng văn hóa, công viên; phúc lợi xã hội.",
      "[결론] Khi cá nhân nỗ lực + xã hội hỗ trợ, tất cả mọi người đều được hưởng chất lượng sống cao.",
    ],
    usefulPhrases: USEFUL_PHRASES_54,
    charLimit: { min: 600, max: 700 },
    timerMinutes: 50,
    sampleAnswer: `삶의 질이란 단순히 경제적 풍요로움을 넘어서 건강, 여가, 인간관계, 자아 실현 등 다양한 요소를 포함하는 개념이다. 소득 수준이 높아지더라도 행복감이 높아지지 않는 경우가 많은데, 이는 물질적인 부만으로는 진정한 삶의 만족을 얻기 어렵기 때문이다. 따라서 삶의 질은 현대 사회에서 개인과 사회 모두가 추구해야 할 핵심 가치이다.

개인 차원에서 삶의 질을 높이기 위해서는 규칙적인 운동과 균형 잡힌 식습관으로 신체적 건강을 유지하는 것이 기본이다. 또한 취미 활동과 여행 등을 통해 정서적 만족을 채우고, 가족 및 친구와의 관계를 소중히 여기는 것도 중요하다. 무엇보다 자신이 하고 싶은 일을 찾아 꾸준히 발전시켜 나가는 자아 실현의 과정이 삶의 질을 크게 높여 준다.

사회적으로는 이러한 개인의 노력을 뒷받침할 수 있는 환경이 필요하다. 충분한 여가 시간을 보장하는 노동 제도, 다양한 문화 시설과 공원 등 공공 인프라의 확충, 그리고 사회적 약자를 위한 복지 제도 강화 등이 그 예이다. 개인의 노력과 사회적 지원이 함께 이루어질 때 비로소 모든 구성원이 높은 삶의 질을 누릴 수 있는 사회가 실현될 것이다.`,
    scoringPoints: [
      "삶의 질의 정의와 중요성을 서론에 제시하는가",
      "개인·사회 두 측면을 균형 있게 서술하는가",
      "구체적 방법이나 예시를 포함하는가",
      "600~700자 분량 준수",
    ],
  },
];

const Q_LABELS: Record<number, string> = {
  51: "Q51 빈칸",
  52: "Q52 빈칸",
  53: "Q53 단문 (200~300자)",
  54: "Q54 논설문 (600~700자)",
};

const Q_COLORS: Record<number, string> = {
  51: "text-sky-400 bg-sky-500/15 border-sky-500/25",
  52: "text-indigo-400 bg-indigo-500/15 border-indigo-500/25",
  53: "text-amber-400 bg-amber-500/15 border-amber-500/25",
  54: "text-rose-400 bg-rose-500/15 border-rose-500/25",
};

const YEARS = [2023, 2022, 2021];

const DRAFT_KEY = (id: string) => `topik_draft_${id}`;

export default function TopikExamWritingPage() {
  const [filterType, setFilterType] = useState<"all" | 51 | 52 | 53 | 54>("all");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [selectedQ, setSelectedQ] = useState<TopikWritingQ>(QUESTIONS[0]);
  const [text, setText] = useState(() => localStorage.getItem(DRAFT_KEY(QUESTIONS[0].id)) || "");
  const [showAnswer, setShowAnswer] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showPhrases, setShowPhrases] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [examMode, setExamMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selfChecked, setSelfChecked] = useState<boolean[]>([]);
  const [draftSaved, setDraftSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSec(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  // Auto-save draft with debounce
  useEffect(() => {
    if (!text) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY(selectedQ.id), text);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 1500);
    }, 800);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [text, selectedQ.id]);

  const filtered = QUESTIONS.filter(q => {
    const typeOk = filterType === "all" || q.qNum === filterType;
    const yearOk = filterYear === "all" || q.year === filterYear;
    return typeOk && yearOk;
  });

  const handleSelect = (q: TopikWritingQ) => {
    setSelectedQ(q);
    setText(localStorage.getItem(DRAFT_KEY(q.id)) || "");
    setShowAnswer(false);
    setShowAnalysis(true);
    setShowPhrases(false);
    setTimerSec(0);
    setTimerRunning(false);
    setSubmitted(false);
    setSelfChecked([]);
  };

  const handleExamModeToggle = () => {
    const next = !examMode;
    setExamMode(next);
    setShowAnswer(false);
    setSubmitted(false);
    setSelfChecked([]);
    if (next) {
      setShowAnalysis(false);
      setShowPhrases(false);
      setTimerSec(0);
      setTimerRunning(true);
    } else {
      setTimerRunning(false);
      setShowAnalysis(true);
    }
  };

  const handleSubmit = () => {
    setTimerRunning(false);
    setSubmitted(true);
    setShowAnswer(true);
    setSelfChecked(new Array(selectedQ.scoringPoints?.length ?? 0).fill(false));
  };

  const toggleSelfCheck = (i: number) => {
    setSelfChecked(prev => prev.map((v, idx) => idx === i ? !v : v));
  };

  const fmtTimer = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const charCount = text.length;
  const charOk = selectedQ.charLimit
    ? charCount >= selectedQ.charLimit.min && charCount <= selectedQ.charLimit.max
    : charCount > 0;
  const charColor = selectedQ.charLimit
    ? charCount < selectedQ.charLimit.min
      ? "text-white/40"
      : charCount > selectedQ.charLimit.max
        ? "text-rose-400"
        : "text-green-400"
    : "text-white/40";

  const hasDraft = !!localStorage.getItem(DRAFT_KEY(selectedQ.id));

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <i className="ri-draft-line text-app-accent-primary"></i>
              Luyện Viết TOPIK II
            </h1>
            <p className="text-white/45 text-sm mt-1">Đề thi thật — Câu 51, 52, 53, 54 qua các năm · Có đáp án tham khảo</p>
          </div>
          <button
            onClick={handleExamModeToggle}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap flex-shrink-0 border ${examMode ? "bg-rose-500/15 border-rose-500/30 text-rose-400" : "bg-app-card/50 border-app-border text-white/50 hover:text-white/70"}`}
          >
            <i className={`${examMode ? "ri-stop-circle-line" : "ri-timer-flash-line"} text-sm`}></i>
            {examMode ? "Thoát thi" : "Chế độ thi"}
          </button>
        </div>
        {examMode && (
          <div className="mb-4 px-3 py-2 bg-rose-500/8 border border-rose-500/20 rounded-xl flex items-center gap-2">
            <i className="ri-error-warning-line text-rose-400 text-sm"></i>
            <p className="text-rose-300/70 text-xs">Đang thi — gợi ý đã ẩn. Viết xong nhấn <strong>Nộp bài</strong> để xem đáp án.</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex gap-1 flex-wrap">
            {(["all", 51, 52, 53, 54] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${filterType === t ? "bg-app-accent-primary/20 text-app-accent-primary border border-app-accent-primary/30" : "bg-app-card/50 text-white/50 border border-transparent hover:text-white/70"}`}
              >
                {t === "all" ? "Tất cả" : `Câu ${t}`}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["all", ...YEARS] as const).map(y => (
              <button
                key={y}
                onClick={() => setFilterYear(y as number | "all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${filterYear === y ? "bg-white/10 text-white border border-white/15" : "bg-app-card/50 text-white/40 border border-transparent hover:text-white/60"}`}
              >
                {y === "all" ? "Mọi năm" : y}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: question list */}
          <div className="space-y-2">
            <p className="text-white/30 text-xs px-1 mb-1">{filtered.length} câu hỏi</p>
            {filtered.length === 0 && (
              <p className="text-white/30 text-sm text-center py-8">Không có câu hỏi phù hợp</p>
            )}
            {filtered.map(q => (
              <button
                key={q.id}
                onClick={() => handleSelect(q)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${selectedQ.id === q.id ? "bg-app-accent-primary/10 border-app-accent-primary/25" : "bg-app-card/40 border-app-border hover:bg-app-card/60"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${Q_COLORS[q.qNum]}`}>
                    Câu {q.qNum}
                  </span>
                  <span className="text-white/35 text-[10px]">{q.year} · Lần {q.session}</span>
                </div>
                <p className="text-white/65 text-xs leading-snug line-clamp-2">{q.title}</p>
              </button>
            ))}
          </div>

          {/* Right: detail + writing */}
          <div className="lg:col-span-2 space-y-4">
            {/* Question header */}
            <div className="bg-[#1a1f2e] rounded-xl border border-app-border p-4 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded font-bold border ${Q_COLORS[selectedQ.qNum]}`}>
                  Câu {selectedQ.qNum}
                </span>
                <span className="text-white/40 text-xs">{selectedQ.year} · Lần {selectedQ.session}</span>
                <span className="text-white/30 text-xs">{Q_LABELS[selectedQ.qNum]}</span>
                {/* Timer */}
                <div className="ml-auto flex items-center gap-1.5">
                  {selectedQ.timerMinutes && (
                    <span className="text-white/25 text-[10px]">Chuẩn: ~{selectedQ.timerMinutes} phút</span>
                  )}
                  <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded-lg ${timerRunning ? "text-app-accent-primary bg-app-accent-primary/10" : "text-white/35 bg-white/5"}`}>
                    {fmtTimer(timerSec)}
                  </span>
                  <button
                    onClick={() => setTimerRunning(r => !r)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-all cursor-pointer"
                  >
                    <i className={`${timerRunning ? "ri-pause-line" : "ri-play-line"} text-xs`}></i>
                  </button>
                  <button
                    onClick={() => { setTimerSec(0); setTimerRunning(false); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-all cursor-pointer"
                    title="Reset"
                  >
                    <i className="ri-restart-line text-xs"></i>
                  </button>
                </div>
              </div>

              {selectedQ.passage && (
                <div className="bg-app-card/50 rounded-lg p-3 text-sm text-white/70 leading-relaxed whitespace-pre-line border-l-2 border-app-accent-primary/30">
                  {selectedQ.passage}
                </div>
              )}

              {selectedQ.passageSummaryVi && !examMode && (
                <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg px-3 py-2 flex gap-2">
                  <i className="ri-translate-2 text-blue-400 text-xs mt-0.5 flex-shrink-0"></i>
                  <p className="text-blue-300/70 text-xs leading-relaxed">{selectedQ.passageSummaryVi}</p>
                </div>
              )}

              <p className="text-white text-sm font-medium">{selectedQ.question}</p>
            </div>

            {/* Vietnamese Analysis Panel — hidden in exam mode */}
            {!examMode && <div className="bg-[#1a1f2e] rounded-xl border border-app-border overflow-hidden">
              <button
                onClick={() => setShowAnalysis(v => !v)}
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-white/3 transition-colors cursor-pointer"
              >
                <i className="ri-lightbulb-line text-amber-400 text-sm"></i>
                <span className="text-amber-300/80 text-xs font-semibold flex-1 text-left">Phân tích đề (Tiếng Việt)</span>
                <i className={`ri-arrow-${showAnalysis ? "up" : "down"}-s-line text-white/25 text-xs`}></i>
              </button>
              {showAnalysis && (
                <div className="px-4 pb-3 space-y-3 border-t border-app-border">
                  <p className="text-white/65 text-sm leading-relaxed pt-3">{selectedQ.analysisVi}</p>
                  {selectedQ.outline && selectedQ.outline.length > 0 && (
                    <div className="bg-app-card/40 rounded-lg p-3 space-y-2">
                      <p className="text-amber-400/50 text-[10px] font-semibold uppercase tracking-wide mb-2.5">Dàn ý gợi ý</p>
                      {selectedQ.outline.map((step, i) => {
                        const bracketMatch = step.match(/^\[([^\]]+)\]/);
                        const label = bracketMatch ? bracketMatch[1] : null;
                        const text = step.replace(/^[\u2460\u2461\u2462\u2463\u2464]\s*/, '').replace(/^\[[^\]]+\]\s*/, '');
                        return (
                          <div key={i} className="flex items-start gap-2.5">
                            <span className="flex-shrink-0 w-5 h-5 rounded-md bg-amber-500/25 text-amber-400 text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                            <p className="text-white/65 text-xs leading-relaxed">
                              {label && <span className="text-amber-400 font-semibold mr-1">[{label}]</span>}
                              {text}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>}

            {/* Useful Phrases — hidden in exam mode */}
            {!examMode && selectedQ.usefulPhrases && (
              <div className="bg-[#1a1f2e] rounded-xl border border-app-border overflow-hidden">
                <button
                  onClick={() => setShowPhrases(v => !v)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-white/3 transition-colors cursor-pointer"
                >
                  <i className="ri-chat-quote-line text-violet-400 text-sm"></i>
                  <span className="text-violet-300/80 text-xs font-semibold flex-1 text-left">Cụm từ hay dùng</span>
                  <i className={`ri-arrow-${showPhrases ? "up" : "down"}-s-line text-white/25 text-xs`}></i>
                </button>
                {showPhrases && (
                  <div className="px-4 pb-3 border-t border-app-border pt-3 grid grid-cols-1 gap-1.5">
                    {selectedQ.usefulPhrases.map((p, i) => (
                      <div key={i} className="flex items-start gap-3 bg-app-card/30 rounded-lg px-3 py-2">
                        <span className="text-white/80 text-xs font-medium font-mono min-w-0 flex-1">{p.kr}</span>
                        <span className="text-white/35 text-xs text-right flex-shrink-0">{p.vi}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Writing area */}
            <div className="bg-[#1a1f2e] rounded-xl border border-app-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-app-border">
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-xs">Bài viết của bạn</span>
                  {draftSaved && <span className="text-green-400/60 text-[10px] flex items-center gap-1"><i className="ri-save-line text-[10px]"></i>Đã lưu</span>}
                  {!draftSaved && hasDraft && charCount === 0 && <span className="text-white/25 text-[10px]">Có nháp cũ</span>}
                </div>
                <span className={`text-xs font-mono ${charColor}`}>
                  {charCount}
                  {selectedQ.charLimit && ` / ${selectedQ.charLimit.min}~${selectedQ.charLimit.max}`}
                  {" "}ký tự
                </span>
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={selectedQ.qNum <= 52 ? "Viết câu điền vào chỗ trống..." : selectedQ.qNum === 53 ? "Viết đoạn văn 200~300 ký tự..." : "Viết bài luận 600~700 ký tự..."}
                rows={selectedQ.qNum >= 53 ? 10 : 5}
                className="w-full bg-transparent text-white/80 text-sm p-4 resize-none focus:outline-none placeholder-white/20 leading-relaxed"
              />
              {selectedQ.charLimit && charCount > 0 && (
                <div className="px-4 pb-3">
                  <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${charOk ? "bg-green-500" : charCount > selectedQ.charLimit.max ? "bg-rose-500" : "bg-white/20"}`}
                      style={{ width: `${Math.min(100, (charCount / selectedQ.charLimit.max) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {examMode ? (
              !submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={charCount === 0}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all border whitespace-nowrap ${charCount > 0 ? "bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/20" : "bg-app-card/30 border-app-border text-white/20 cursor-not-allowed"}`}
                >
                  <i className="ri-send-plane-line mr-1.5"></i>
                  Nộp bài — Xem kết quả
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-500/8 border border-green-500/20 rounded-xl">
                  <i className="ri-checkbox-circle-line text-green-400"></i>
                  <span className="text-green-300/70 text-xs font-medium">Đã nộp bài · {fmtTimer(timerSec)} · Tự chấm bên dưới</span>
                </div>
              )
            ) : (
              <button
                onClick={() => setShowAnswer(v => !v)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all border whitespace-nowrap ${showAnswer ? "bg-app-card/50 border-app-border text-white/50" : "bg-app-accent-primary/10 border-app-accent-primary/25 text-app-accent-primary hover:bg-app-accent-primary/15"}`}
              >
                <i className={`${showAnswer ? "ri-eye-off-line" : "ri-eye-line"} mr-1.5`}></i>
                {showAnswer ? "Ẩn đáp án" : "Xem đáp án tham khảo"}
              </button>
            )}

            {showAnswer && (
              <div className="bg-[#1a1f2e] rounded-xl border border-green-500/20 p-4 space-y-3">
                <h3 className="text-green-400 text-sm font-semibold flex items-center gap-1.5">
                  <i className="ri-check-double-line"></i>
                  Đáp án tham khảo
                </h3>
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{selectedQ.sampleAnswer}</p>
                {selectedQ.scoringPoints && selectedQ.scoringPoints.length > 0 && (
                  <div className="pt-3 border-t border-app-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/50 text-xs font-semibold">Tự chấm — Tích những ý bạn đã thực hiện:</p>
                      {selfChecked.length > 0 && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${selfChecked.filter(Boolean).length === selfChecked.length ? "text-green-400 bg-green-500/15" : "text-white/40 bg-white/5"}`}>
                          {selfChecked.filter(Boolean).length}/{selfChecked.length}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1.5">
                      {selectedQ.scoringPoints.map((p, i) => (
                        <li
                          key={i}
                          onClick={() => toggleSelfCheck(i)}
                          className={`flex items-start gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all select-none ${
                            selfChecked[i] ? "bg-green-500/10 border border-green-500/20" : "bg-app-card/30 border border-transparent hover:bg-app-card/50"
                          }`}
                        >
                          <span className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center mt-0.5 transition-all ${
                            selfChecked[i] ? "bg-green-500 border-green-500" : "border-white/20"
                          }`}>
                            {selfChecked[i] && <i className="ri-check-line text-white text-[10px]"></i>}
                          </span>
                          <span className={`text-xs leading-relaxed ${selfChecked[i] ? "text-green-300/80" : "text-white/50"}`}>{p}</span>
                        </li>
                      ))}
                    </ul>
                    {selfChecked.length > 0 && selfChecked.every(Boolean) && (
                      <p className="text-center text-green-400 text-xs font-semibold mt-3">🎉 Hoàn hảo! Bạn đã thực hiện đủ các tiêu chí!</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
