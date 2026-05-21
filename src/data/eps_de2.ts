// ─── Đề số 02 — EPS-TOPIK ────────────────────────────────────────────────────

export interface De2Question {
  id: number;
  section: "reading" | "listening";
  optionType: "text" | "image";
  prompt: string;
  content?: string;
  contentImage?: string;
  optionImages?: string[];
  audioScript?: string;
  audioHint?: string;
  options: string[];
  correct: number;
}

export const DE2_INFO = {
  id: "de2",
  title: "Đề số 02",
  totalQuestions: 40,
  readingQuestions: 20,
  listeningQuestions: 20,
  timeMinutes: 50,
  level: "EPS-TOPIK",
};

export const DE2_QUESTIONS: De2Question[] = [
  // ═══════════════════════════════════════
  //  읽기 (ĐỌC HIỂU) — Câu 1-20
  // ═══════════════════════════════════════

  // ── Q1-Q2: Nhìn ảnh → chọn hình đúng ───────────────────────
  {
    id: 1,
    section: "reading",
    optionType: "image",
    prompt: "다음 내용과 관계있는 그림을 고르십시오.",
    content: "미용실입니다.",
    optionImages: [
      "/de2/p10_img2.webp",
      "/de2/p10_img3.webp",
      "/de2/p10_img4.webp",
      "/de2/p10_img5.webp",
    ],
    options: ["병원", "회사", "이용실/미용실", "약국"],
    correct: 2,
  },
  {
    id: 2,
    section: "reading",
    optionType: "image",
    prompt: "다음 내용과 관계있는 그림을 고르십시오.",
    content: "(그물을) 수선하다",
    optionImages: [
      "/de2/p10_img6_1.webp",
      "/de2/p10_img6_2.webp",
      "/de2/p10_img6_3.webp",
      "/de2/p10_img6_4.webp",
    ],
    options: ["어망 걷기", "어망 세척", "어망 건조", "어망 수선"],
    correct: 3,
  },

  // ── Q3-Q6: Từ vựng / Ngữ pháp cơ bản ───────────────────────
  {
    id: 3,
    section: "reading",
    optionType: "text",
    prompt: "다음 단어의 비슷한 말을 고르십시오.",
    content: "채소",
    options: ["야채", "고기", "과일", "음료"],
    correct: 0,
  },
  {
    id: 4,
    section: "reading",
    optionType: "text",
    prompt: "다음 단어와 관계있는 것은 무엇입니까?",
    content: "상 / 연극 / 시험 / 면접",
    options: ["쓰다", "보다", "만들다", "주다"],
    correct: 1,
  },
  {
    id: 5,
    section: "reading",
    optionType: "text",
    prompt: "다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.",
    options: [
      "책이 읽어요.",
      "물을 마셔요.",
      "전화에 해요.",
      "신문는 봐요.",
    ],
    correct: 1,
  },
  {
    id: 6,
    section: "reading",
    optionType: "text",
    prompt: "다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.",
    options: [
      "실내에서 담배를 피우면 안 돼요.",
      "한국에서는 밥을 먹을 때 코를 풀으면 안 돼요.",
      "운전 중에 전화면 안 돼요.",
      "수업 시간에는 영어로 말으면 안 돼요.",
    ],
    correct: 0,
  },

  // ── Q7-Q12: Điền vào chỗ trống ─────────────────────────────
  {
    id: 7,
    section: "reading",
    optionType: "text",
    prompt: "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    content:
      "직장 상사나 나이가 많은 동료에게 _____ 어깨에 손을 올리면 예의가 아닙니다.",
    options: ["포옹하는지", "악수하는지", "악수하거나", "포옹하거나"],
    correct: 3,
  },
  {
    id: 8,
    section: "reading",
    optionType: "text",
    prompt: "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    content:
      "이번 주말에 제가 좋아하는 가수의 공연이 있습니다. 저는 두 달 전에 표를 미리 샀습니다. 공연을 빨리 _______.",
    options: [
      "보고 싶습니다.",
      "본 적이 있어요.",
      "보고 있어요.",
      "본 것 같아요.",
    ],
    correct: 0,
  },
  {
    id: 9,
    section: "reading",
    optionType: "text",
    prompt: "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    content: "학생들이 너무 ________저는 교수님의 말을 못 들었어요.",
    options: ["미끄러져서", "미끄러지고", "시끄러워서", "시끄럽고"],
    correct: 2,
  },
  {
    id: 10,
    section: "reading",
    optionType: "text",
    prompt: "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    content:
      "많은 사람들이 이용하는 공공장소에서는 예의를 지켜야 합니다. 함부로 쓰레기를 ______ 소리로 떠들면 안 됩니다.",
    options: ["떨거나", "쓸거나", "버리거나", "정리하거나"],
    correct: 2,
  },
  {
    id: 11,
    section: "reading",
    optionType: "text",
    prompt: "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    content:
      "가: 밖에 유리창이 너무 더러워______ 싶은데 걸레가 어디에 있어요?\n나: 나도 모르는데 한번 화장실 문 뒤에 보세요.",
    options: ["정리하고", "닦고", "뿌리고", "버리고"],
    correct: 1,
  },
  {
    id: 12,
    section: "reading",
    optionType: "text",
    prompt: "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    content: "주말에 친구하고 _______ 운동장에 갈 거예요.",
    options: ["운동한", "운동하러", "운동하니까", "운동해서"],
    correct: 1,
  },

  // ── Q13: Đọc biểu đồ ────────────────────────────────────────
  {
    id: 13,
    section: "reading",
    optionType: "text",
    prompt: "다음 그래프에 대한 설명으로 맞는 것을 고르십시오.",
    contentImage: "/de2/p11_img3.webp",
    options: [
      "4개국 중에 영국이 코로나 영향을 제일 많이 받았다.",
      "미국보다 이탈리아의 영향을 더 심하게 보인다.",
      "4개국 중에 스페인이 두 번째로 영향을 받는 나라로 보인다.",
      "스페인보다 미국이 영향을 덜 받는 나라로 보인다.",
    ],
    correct: 2,
  },

  // ── Q14: Biển báo ────────────────────────────────────────────
  {
    id: 14,
    section: "reading",
    optionType: "text",
    prompt: "표지는 무슨 뜻입니까?",
    contentImage: "/de2/p12_img2.webp",
    options: [
      "기대면 안 됩니다.",
      "물로 불을 끄면 안 됩니다.",
      "스위치를 만지면 안 됩니다.",
      "이 장소를 지나가면 안 됩니다.",
    ],
    correct: 2,
  },

  // ── Q15-Q16: Đọc đoạn văn → xác định chủ đề ─────────────────
  {
    id: 15,
    section: "reading",
    optionType: "text",
    prompt: "다음은 무엇에 대한 설명입니까?",
    content:
      "한국의 은행은 평일 오전 9시 반에 문을 열고 오후 4시 반에 문을 닫습니다. 토요일과 일요일에는 문을 열지 않습니다. 그런데 저는 오전 9시부터 오후 7시까지 회사에서 일해야 하기 때문에 은행에 가기 어렵습니다. 그래서 점심시간에 빨리 갔다 옵니다.",
    options: ["이용 시간", "이용 안내", "이용 방법", "이용 사람"],
    correct: 0,
  },
  {
    id: 16,
    section: "reading",
    optionType: "text",
    prompt: "다음은 무엇에 대한 설명입니까?",
    content:
      "한국 생활에서 화재나 응급 환자가 생겼을 때는 119번에 전화를 하면 됩니다. 그 외에도 범죄를 신고할 때는 112번, 전화번호를 알고 싶을 때는 114번, 일기예보가 궁금할 때는 131번을 이용하면 됩니다. 도움이 필요할 때 언제든지 이런 전화번호들을 이용할 수 있습니다.",
    options: [
      "전화의 장점과 거는 방법",
      "외국인들을 위한 상담 안내",
      "알고 있으면 유용한 전화번호",
      "환자가 생겼을 때 대처 방법",
    ],
    correct: 2,
  },

  // ── Q17-Q18: Đọc hiểu dài → chọn câu đúng ──────────────────
  {
    id: 17,
    section: "reading",
    optionType: "text",
    prompt: "다음 글을 읽고 내용과 같은 것을 고르십시오.",
    content:
      "스마트팜은 생산성을 향상시키기 위하여 정보통신기술을 활용하는 농업 방식입니다. 빅데이터와 인공지능 기술을 활용하여 농작물의 성장 조건을 최적화하기 때문에 노동력을 줄이는 데도 도움을 줍니다. 한국에서는 스마트팜을 활용하여 과일, 쌈채소뿐만 아니라 허브류 재배도 하고 있습니다. 그리고 정부에서는 스마트팜 보급과 발전을 위해 다양한 정책으로 지원하고 있습니다.",
    options: [
      "스마트팜은 정부의 지원 없이 운영되고 있습니다.",
      "스마트팜 방식을 이용하면 사람이 해야 할 일이 많아집니다.",
      "한국에서는 스마트팜 방식으로 쌈채소를 재배하지 않습니다.",
      "스마트팜은 농작물의 성장을 위해 인공지능 기술을 활용합니다.",
    ],
    correct: 3,
  },
  {
    id: 18,
    section: "reading",
    optionType: "text",
    prompt: "다음 글을 읽고 내용과 같은 것을 고르십시오.",
    content:
      "고용허가제는 고용노동부가 한국 내의 인력 부족 문제를 해결하고 외국인 노동자를 합법적으로 고용하기 위해 마련한 제도입니다. 자국에서 선발 시험을 통과한 지원자들은 사업주와 계약 후 한국 비자를 받을 수 있습니다. 한국에 온 후에는 한국인 노동자들과 동등하게 노동법이 정한 기본적인 권리를 보장 받으며 일할 수 있습니다.",
    options: [
      "지원자들은 한국에 입국한 후 사업주와 고용 계약을 합니다.",
      "고용허가제는 한국에 살고 있는 외국인을 위한 취업 제도입니다.",
      "지원자들은 시험에 통과해야 한국에서 일할 기회를 얻을 수 있습니다.",
      "고용허가제로 한국에 온 외국인은 한국인들과 다른 노동법의 보호를 받습니다.",
    ],
    correct: 2,
  },

  // ── Q19-Q20: Từ vựng công việc / Bảo hiểm ─────────────────
  {
    id: 19,
    section: "reading",
    optionType: "text",
    prompt: "다음 설명에 알맞은 어휘를 고르십시오.",
    content:
      "에어리스 스프레이 건으로 페인트를 분사한 후 붓으로 페인트칠을 마무리합니다.",
    options: ["포장 작업", "도장 작업", "연마 작업", "재단 작업"],
    correct: 1,
  },
  {
    id: 20,
    section: "reading",
    optionType: "text",
    prompt: "다음은 무엇에 대한 설명입니까?",
    content:
      "이 보험에는 귀국 시 필요한 비용을 준비하기 위해서 근로자가 자기쪽으로 80일 이내에 일시금을 내고 가입해야 합니다.",
    options: ["국민연금보험", "산재보험", "출국만기보험", "귀국비용보험"],
    correct: 2,
  },

  // ═══════════════════════════════════════
  //  듣기 (NGHE HIỂU) — Câu 21-40
  // ═══════════════════════════════════════

  // ── Q21-22: Nghe từ/câu → chọn đúng ────────────────────────
  {
    id: 21,
    section: "listening",
    optionType: "text",
    prompt: "들은 것을 고르십시오.",
    content: "_____지",
    audioScript: "번지",
    audioHint: "Nghe kỹ phụ âm đầu: 봉/반/번/방",
    options: ["봉지", "반지", "번지", "방지"],
    correct: 2,
  },
  {
    id: 22,
    section: "listening",
    optionType: "text",
    prompt: "들은 것을 고르십시오.",
    content: "제 어머니는 _________.",
    audioScript: "주무세요",
    audioHint: "Nghe động từ honorific: 주무세요 = đang ngủ (lịch sự)",
    options: ["주무세요", "주모세요", "주부세요", "주마세요"],
    correct: 0,
  },

  // ── Q23-24: Nghe → chọn hình đúng ────────────────────────────
  {
    id: 23,
    section: "listening",
    optionType: "image",
    prompt: "들은 것을 고르십시오.",
    audioScript: "여자아이가 바닥에 앉아서 책을 읽고 있습니다.",
    audioHint: "Nghe hành động của trẻ em → chọn hình đúng",
    optionImages: [
      "/de2/p13_img1.webp",
      "/de2/p13_img2.webp",
      "/de2/p13_img3.webp",
      "/de2/p13_img4.webp",
    ],
    options: ["독서하기", "신발 끈 묶기", "분리수거", "축구하기"],
    correct: 0,
  },
  {
    id: 24,
    section: "listening",
    optionType: "image",
    prompt: "들은 것을 고르십시오.",
    audioScript: "이 동물은 흑백 줄무늬가 있고 말과 비슷하게 생겼습니다.",
    audioHint: "Nghe mô tả đặc điểm động vật → chọn hình đúng",
    optionImages: [
      "/de2/p13_img5.webp",
      "/de2/p13_img6.webp",
      "/de2/p13_img7.webp",
      "/de2/p13_img8.webp",
    ],
    options: ["사자", "코끼리", "얼룩말", "곰"],
    correct: 2,
  },

  // ── Q25-29: Nhìn ảnh + nghe → chọn text ─────────────────────
  {
    id: 25,
    section: "listening",
    optionType: "text",
    prompt: "이것은 무엇입니까?",
    contentImage: "/de2/p14_img1.webp",
    audioScript: "이것으로 상점에서 물건을 살 수 있습니다. 현금이 없을 때 편리합니다.",
    audioHint: "Nghe mô tả đồ vật → xem ảnh thẻ",
    options: ["현금", "카드", "통장", "영수증"],
    correct: 1,
  },
  {
    id: 26,
    section: "listening",
    optionType: "text",
    prompt: "여기는 어디입니까?",
    contentImage: "/de2/p14_img2.webp",
    audioScript: "여기는 샤워기가 있고 몸을 씻을 수 있는 곳입니다.",
    audioHint: "Nhìn ảnh phòng tắm → nghe mô tả",
    options: ["욕실", "부엌", "거실", "창고"],
    correct: 0,
  },
  {
    id: 27,
    section: "listening",
    optionType: "text",
    prompt: "이 사람은 무엇을 하고 있습니까?",
    contentImage: "/de2/p14_img3.webp",
    audioScript: "이 사람은 마스크를 쓰고 털이개로 먼지를 털고 있습니다.",
    audioHint: "Nhìn ảnh người đang làm vệ sinh → nghe mô tả",
    options: ["청소하고 있습니다", "요리하고 있습니다", "세탁하고 있습니다", "운동하고 있습니다"],
    correct: 0,
  },
  {
    id: 28,
    section: "listening",
    optionType: "text",
    prompt: "연필이 얼마나 있습니까?",
    contentImage: "/de2/p14_img4.webp",
    audioScript: "연필이 여섯 자루 있습니다.",
    audioHint: "Nhìn hình đếm bút chì → nghe đáp án",
    options: ["세 자루", "네 자루", "다섯 자루", "여섯 자루"],
    correct: 3,
  },
  {
    id: 29,
    section: "listening",
    optionType: "text",
    prompt: "은행은 어디에 있습니까?",
    contentImage: "/de2/p15_img1.webp",
    audioScript: "은행은 편의점 위에 있습니다.",
    audioHint: "Nhìn sơ đồ vị trí → nghe mô tả vị trí ngân hàng",
    options: ["서점 옆에 있습니다", "병원 옆에 있습니다", "편의점 위에 있습니다", "우체국 왼쪽에 있습니다"],
    correct: 2,
  },

  // ── Q30-33: Nghe câu hỏi → chọn đáp án ──────────────────────
  {
    id: 30,
    section: "listening",
    optionType: "text",
    prompt: "다음을 듣고 질문에 알맞은 대답을 고르십시오.",
    audioScript: "이거 만 원인데요, 천 원짜리로 좀 바꿔 주시겠어요?",
    audioHint: "Đổi tiền: 10.000 won → tiền lẻ 1.000 won",
    options: [
      "네, 만 원짜리를 주시면 돼요.",
      "네, 만 원짜리로 두 장 주시면 돼요.",
      "네, 그럼 제가 사만 원을 거슬러 드릴게요.",
      "네, 천 원짜리로 열 장 드릴게요.",
    ],
    correct: 3,
  },
  {
    id: 31,
    section: "listening",
    optionType: "text",
    prompt: "다음을 듣고 질문에 알맞은 대답을 고르십시오.",
    audioScript: "제가 보낸 택배가 아직 안 왔어요. 언제쯤 받을 수 있을까요?",
    audioHint: "Câu hỏi về thời gian nhận hàng",
    options: [
      "내일 도착해도 괜찮아요.",
      "영수증만 있으면 조회할 수 있어요.",
      "늦어도 내일 오후에는 도착할 거예요.",
      "지금 출발하니까 조금만 기다려 주세요.",
    ],
    correct: 2,
  },
  {
    id: 32,
    section: "listening",
    optionType: "text",
    prompt: "다음을 듣고 질문에 알맞은 대답을 고르십시오.",
    audioScript: "어제 넘어져서 발목이 너무 아파요.",
    audioHint: "Thông báo bị ngã, đau mắt cá",
    options: [
      "건강보험증을 꼭 만들어야 해요.",
      "약은 꾸준히 잘 챙겨 먹으려고 해요.",
      "병원에 자주 다녀도 안 나아서 걱정이네요.",
      "뼈를 다쳤을지도 모르니까 병원에 가 보세요.",
    ],
    correct: 3,
  },
  {
    id: 33,
    section: "listening",
    optionType: "text",
    prompt: "다음을 듣고 질문에 알맞은 대답을 고르십시오.",
    audioScript: "이번 회식 장소가 고깃집인데 저는 고기를 못 먹어요.",
    audioHint: "Thông báo không ăn được thịt tại buổi tiệc công ty",
    options: [
      "그 식당은 음식이 별로 맛이 없어요.",
      "그럼 회식 끝나고 직원들하고 이야기해 봐요.",
      "고기를 먹고 싶으면 다른 곳으로 바꿔도 돼요.",
      "그 식당에는 다른 메뉴도 많으니까 괜찮을 거예요.",
    ],
    correct: 3,
  },

  // ── Q34-35: Nghe → chọn câu tiếp theo ───────────────────────
  {
    id: 34,
    section: "listening",
    optionType: "text",
    prompt: "다음을 듣고 이어지는 말을 고르십시오.",
    audioScript: "생일이 언제예요?",
    audioHint: "Câu hỏi về ngày sinh nhật",
    options: [
      "서른 살이에요.",
      "시월 일일이에요.",
      "저는 이영수입니다.",
      "다음 주에 갈 거예요.",
    ],
    correct: 1,
  },
  {
    id: 35,
    section: "listening",
    optionType: "text",
    prompt: "다음을 듣고 이어지는 말을 고르십시오.",
    audioScript: "드라이버 좀 빌릴 수 있어요?",
    audioHint: "Xin mượn tua vít → cách trả lời tự nhiên",
    options: [
      "드라이버 하는 게 좋아요.",
      "네, 제가 가져다 줄게요.",
      "네, 여기 있어요.",
      "네, 집에 없어요.",
    ],
    correct: 2,
  },

  // ── Q36-37: Nghe hội thoại → chọn hình đúng ─────────────────
  {
    id: 36,
    section: "listening",
    optionType: "image",
    prompt: "잘 듣고 들은 내용과 관계 있는 그림을 고르십시오.",
    audioScript: "남자가 여자에게 큰 상자를 건네주고 있습니다.",
    audioHint: "Hội thoại về việc giao nhận hộp → chọn hình phù hợp",
    optionImages: [
      "/de2/p16_img1.webp",
      "/de2/p16_img2.webp",
      "/de2/p16_img3.webp",
      "/de2/p16_img4.webp",
    ],
    options: ["남자→여자 상자 건네기", "여자 상자 들고 이동", "여자 방에 들어오기", "남녀 서류 교환"],
    correct: 0,
  },
  {
    id: 37,
    section: "listening",
    optionType: "image",
    prompt: "잘 듣고 들은 내용과 관계 있는 그림을 고르십시오.",
    audioScript: "여자가 은행 창구에서 남자 직원에게 무언가를 건네주고 있습니다.",
    audioHint: "Cảnh ở ngân hàng → chọn hình đúng",
    optionImages: [
      "/de2/p16_img5.webp",
      "/de2/p16_img6.webp",
      "/de2/p16_img7.webp",
      "/de2/p16_img8.webp",
    ],
    options: ["웨이터 서빙", "물건 보여주기", "은행 창구 거래", "교실에서 전달"],
    correct: 2,
  },

  // ── Q38-40: Nghe đoạn dài → chọn nội dung đúng ──────────────
  {
    id: 38,
    section: "listening",
    optionType: "text",
    prompt: "대화 후 여자는 가장 먼저 무엇을 하겠습니까?",
    audioScript:
      "남자: 오늘 페인트 칠이 다 끝났어요? 여자: 네, 방금 끝났어요. 남자: 그럼 붓부터 씻고 나서 바닥 닦고, 마지막으로 페인트 통 정리해 주세요. 여자: 네, 알겠어요.",
    audioHint: "Thứ tự công việc sau khi sơn xong: nghe kỹ thứ tự",
    options: [
      "페인트 통을 정리한다.",
      "바닥을 닦는다.",
      "페인트 칠을 한다.",
      "붓을 씻으러 간다.",
    ],
    correct: 3,
  },
  {
    id: 39,
    section: "listening",
    optionType: "text",
    prompt: "다음 중 들은 내용과 같은 것은 무엇입니까?",
    audioScript:
      "남자: 계약 기간이 다음 달에 끝나는데 연장할 생각이 있어요? 여자: 네, 저는 여기서 계속 일하고 싶어요. 그런데 기숙사가 많이 낡아서 좀 고쳐 주셨으면 해요. 남자: 그렇군요, 알겠어요.",
    audioHint: "Hội thoại gia hạn hợp đồng và điều kiện ký túc xá",
    options: [
      "여자는 계약 기간 연장을 원하지 않는다.",
      "여자는 가구 공장으로 옮길 예정이다.",
      "여자는 현재 기숙사 생활을 하고 있다.",
      "여자는 작업 환경 개선을 요청하고 있다.",
    ],
    correct: 2,
  },
  {
    id: 40,
    section: "listening",
    optionType: "text",
    prompt: "다음 중 들은 내용과 같은 것은 무엇입니까?",
    audioScript:
      "여자: 다음 주에 부모님이랑 음악회에 가는데 같이 갈래요? 남자: 저도 음악회에 가고 싶어요. 그런데 표를 구할 수 있을까요? 여자: 지금 인터넷으로 찾아보고 있어요.",
    audioHint: "Hội thoại về buổi hòa nhạc và mua vé",
    options: [
      "여자는 다음 주에 음악회에 갑니다.",
      "남자는 아버지의 선물을 준비했습니다.",
      "남자는 부모님과 음악회에 가고 싶어합니다.",
      "여자는 인터넷으로 공연을 찾아보려고 합니다.",
    ],
    correct: 0,
  },
];

// ─── Giải thích tiếng Việt cho từng câu ──────────────────────────────────────
export const DE2_EXPLANATIONS: Record<number, string> = {
  1: "미용실 = tiệm cắt tóc/làm đẹp. Hình ③ có biển △△이용실 và cái kéo. Phân biệt: 병원(bệnh viện), 회사(công ty), 약국(nhà thuốc).",
  2: "수선하다 = sửa chữa, vá víu. Hình ④ thể hiện người ngồi tay vá lưới. Phân biệt: ①kéo lưới từ thuyền, ②rửa lưới bằng vòi, ③phơi lưới.",
  3: "채소 = rau củ → từ đồng nghĩa: 야채(rau). Phân biệt: 고기(thịt), 과일(trái cây), 음료(đồ uống).",
  4: "상/연극/시험/면접 đều dùng với động từ 보다: 상을 보다(xem giải), 연극을 보다(xem kịch), 시험을 보다(thi), 면접을 보다(phỏng vấn).",
  5: "Tiếng Hàn dùng trợ từ đối tượng 을/를: 물을 마셔요 (O). 책이→책을, 전화를 하다, 신문을 봐요.",
  6: "Cấu trúc đúng: V+(으)면 안 돼요. '실내에서 담배를 피우면 안 돼요' → 피우다+면 = 피우면 ✓. Các câu còn lại lỗi chia động từ.",
  7: "포옹하거나 어깨에 손을 올리면 = 'ôm hoặc đặt tay lên vai' đều vô lễ với cấp trên. -거나 = hoặc (lựa chọn).",
  8: "보고 싶다 = muốn xem. Ngữ cảnh: đã mua vé từ 2 tháng trước, nóng lòng muốn xem biểu diễn sớm.",
  9: "시끄러워서 = vì ồn ào. -아/어서 chỉ nguyên nhân. 미끄럽다=trơn, 시끄럽다=ồn ào.",
  10: "버리거나 소리로 떠들면 = vứt rác hoặc gây ồn → 버리다+거나 = 버리거나.",
  11: "닦고 싶다 = muốn lau. 유리창을 닦다 = lau kính cửa sổ. 정리하다=dọn dẹp, 뿌리다=phun, 버리다=vứt.",
  12: "-러 가다 = đi để làm gì. 운동하러 운동장에 가다 = đi sân để tập thể dục.",
  13: "Biểu đồ: 미국(40)>스페인(30)>이탈리아(20)>영국(10). Đáp án ③ đúng: Tây Ban Nha đứng thứ 2.",
  14: "Biển báo cấm bật/tắt công tắc điện. Hình ảnh: công tắc có dấu X = 스위치를 만지면 안 됩니다.",
  15: "Đoạn văn mô tả giờ làm việc của ngân hàng (9:30-16:30) → chủ đề: 이용 시간 (giờ phục vụ).",
  16: "Đoạn văn liệt kê số điện thoại hữu ích (119/112/114/131) → chủ đề: 알고 있으면 유용한 전화번호.",
  17: "Đáp án ④ đúng: 'Nông nghiệp thông minh sử dụng AI để tối ưu điều kiện sinh trưởng'. ①②③ đều sai theo nội dung.",
  18: "Đáp án ③: Ứng viên phải qua kỳ thi tuyển chọn ở nước mình mới được cơ hội làm việc tại Hàn. ①②④ đều mâu thuẫn với nội dung.",
  19: "도장 작업 = công việc sơn phủ bề mặt (painting/coating). Phân biệt: 포장(đóng gói), 연마(đánh bóng), 재단(cắt vải/vật liệu).",
  20: "출국만기보험 = bảo hiểm hết hạn xuất cảnh. Mục đích: chuẩn bị chi phí về nước. Đóng trong 80 ngày trước khi xuất cảnh.",
  21: "번지 = số nhà/địa chỉ (số + 번지). Phân biệt nghe: 봉(bông), 반(nửa/nhóm), 번(số/lần), 방(phòng).",
  22: "주무세요 = kính ngữ của 자다 (ngủ). Dùng cho người lớn tuổi hơn. Phân biệt: 주무세요 ≠ 주모세요/주부세요.",
  23: "여자아이가 바닥에 앉아서 책을 읽고 있습니다 = cô bé đang ngồi đọc sách. → Chọn hình ① (bé gái đọc sách).",
  24: "흑백 줄무늬 + 말과 비슷 = sọc đen trắng + giống ngựa → 얼룩말 (ngựa vằn). Phân biệt: 사자(sư tử), 코끼리(voi), 곰(gấu).",
  25: "Thẻ ngân hàng dùng mua hàng thay tiền mặt → 카드. 현금(tiền mặt), 통장(sổ ngân hàng), 영수증(hóa đơn).",
  26: "Nơi có vòi hoa sen, dùng để tắm → 욕실 (phòng tắm). Phân biệt: 부엌(bếp), 거실(phòng khách), 창고(nhà kho).",
  27: "Người đeo khẩu trang, dùng cây phủi bụi → 청소하고 있습니다 (đang lau dọn).",
  28: "Nhìn hình: 6 cây bút chì → 여섯 자루. Đếm: 세(3), 네(4), 다섯(5), 여섯(6).",
  29: "Bản đồ: hàng 1=병원/약국, hàng 2=은행/서점, hàng 3=편의점/우체국. Ngân hàng nằm phía trên cửa hàng tiện lợi → 편의점 위.",
  30: "10.000 won → tiền lẻ 1.000 won: 10 tờ 1.000 won = 만 원. Đáp án: 천 원짜리로 열 장.",
  31: "Chưa nhận được bưu kiện → hỏi khi nào đến. Đáp án hợp lý: 늦어도 내일 오후에는 도착할 거예요.",
  32: "Bị ngã đau mắt cá → có thể bị gãy xương. Khuyên: 뼈를 다쳤을지도 모르니까 병원에 가 보세요.",
  33: "Tiệc công ty ở nhà hàng thịt nhưng không ăn thịt được → 그 식당에는 다른 메뉴도 많으니까 괜찮을 거예요.",
  34: "생일이 언제예요? (Sinh nhật khi nào?) → Trả lời ngày tháng: 시월 일일이에요 (1 tháng 10). 서른 살=30 tuổi (không phải câu trả lời ngày sinh).",
  35: "드라이버 빌릴 수 있어요? (Cho mượn tua vít không?) → Có sẵn thì nói: 네, 여기 있어요.",
  36: "남자가 여자에게 상자를 건네주고 있습니다 = nam đưa hộp cho nữ → hình ① (hai người đứng/ngồi đối diện, nam đưa hộp qua bàn).",
  37: "여자가 은행 창구에서 남자 직원에게 건네주고 있습니다 → hình ③ (nữ tại quầy ngân hàng, nam phía sau quầy).",
  38: "Thứ tự: 붓 씻기 → 바닥 닦기 → 페인트 통 정리. Việc ĐẦU TIÊN = 붓을 씻으러 간다.",
  39: "Nữ muốn gia hạn hợp đồng (계속 일하고 싶어요) và than ký túc xá cũ → Đang sống ở ký túc xá: 현재 기숙사 생활을 하고 있다.",
  40: "Nữ nói 'dạo tới (다음 주에) đi xem hòa nhạc' → Đáp án ①: 여자는 다음 주에 음악회에 갑니다. ③ sai vì nam muốn đi cùng nữ (không phải cùng bố mẹ nam).",
};
