// ĐỀ SỐ 01 — EPS-TOPIK
// Nội dung trích từ docs/de1/page_2.pdf … page_9.pdf
// audioScript: văn bản tiếng Hàn được đọc bằng Web Speech API (TTS giả lập)

export interface De1Question {
  id: number;
  section: "reading" | "listening";
  /** 'image' = đáp án là hình ảnh thực, 'text' = text thường */
  optionType: "text" | "image";
  prompt: string;
  content?: string;
  /** Ảnh nội dung câu hỏi (ký hiệu, biểu đồ, vé...) */
  contentImage?: string;
  /** 4 đường dẫn ảnh dùng làm đáp án (thay thế text options) */
  optionImages?: string[];
  /** Chỉ câu nghe: script tiếng Hàn sẽ được TTS đọc */
  audioScript?: string;
  /** Gợi ý nội dung âm thanh (hiển thị cho học viên sau khi nghe) */
  audioHint?: string;
  options: string[];
  /** 0-based index */
  correct: number;
}

export const DE1_QUESTIONS: De1Question[] = [
  // ═══════════════════════════════════════
  //  읽기 (ĐỌC HIỂU) — Câu 1-20
  // ═══════════════════════════════════════
  {
    id: 1,
    section: "reading",
    optionType: "image",
    prompt: "다음 내용과 관계있는 그림을 고르십시오.",
    content: "냉장고입니다.",
    optionImages: ["/de1/p2_img3.jpeg", "/de1/p2_img4.jpeg", "/de1/p2_img5.jpeg", "/de1/p2_img6.jpeg"],
    options: ["에어컨", "세탁기", "식기세척기", "냉장고"],
    correct: 3,
  },
  {
    id: 2,
    section: "reading",
    optionType: "image",
    prompt: "다음 내용과 관계있는 그림을 고르십시오.",
    content: "빵을 자르고 있습니다.",
    optionImages: ["/de1/p2_img8.jpeg", "/de1/p2_img7.jpeg", "/de1/p2_img10.jpeg", "/de1/p2_img9.jpeg"],
    options: ["빵 자르기", "감자 깎기", "반죽하기", "채칼 사용"],
    correct: 0,
  },
  {
    id: 3,
    section: "reading",
    optionType: "text",
    prompt: "다음 내용과 관계있는 것을 고르십시오.",
    content: "독서",
    options: ["위치", "국적", "취미", "가족"],
    correct: 2,
  },
  {
    id: 4,
    section: "reading",
    optionType: "text",
    prompt: "다음 내용과 관계있는 것을 고르십시오.",
    content: "건강, 경치, 사이, 분위기",
    options: ["위치", "국적", "하다", "가족"],
    correct: 2,
  },
  {
    id: 5,
    section: "reading",
    optionType: "text",
    prompt: "다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.",
    options: [
      "밥을 먹으면서 TV를 봅니다.",
      "우리 언니는 피아노를 치하면서 노래를 해요.",
      "운전으면서 전화하지 마세요.",
      "학교에 다니하면서 아르바이트를 해요.",
    ],
    correct: 0,
  },
  {
    id: 6,
    section: "reading",
    optionType: "text",
    prompt: "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    content:
      "리한 씨와 저는 5월 12일에 태어났습니다. 우리는 태어난 해는 다르지만 ______이/가 같아서 함께 파티를 했습니다.",
    options: ["나이", "생일", "성격", "외모"],
    correct: 1,
  },
  {
    id: 7,
    section: "reading",
    optionType: "text",
    prompt: "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    content:
      "다음 주에 동료들과 여행을 가려고 합니다. 그래서 오늘 우리가 머물 숙소를 ______.",
    options: ["받았습니다.", "주었습니다.", "정리했습니다.", "예약했습니다."],
    correct: 3,
  },
  {
    id: 8,
    section: "reading",
    optionType: "text",
    prompt: "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    content:
      "요즘은 일이 많아서 스트레스가 많습니다. 하지만 ______ 친구들을 만나서 이야기를 하면 스트레스가 풀립니다.",
    options: ["너무", "가끔", "벌써", "제일"],
    correct: 1,
  },
  {
    id: 9,
    section: "reading",
    optionType: "text",
    prompt: "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    content:
      "지난주에 시장에 가서 두꺼운 외투를 한 벌 샀습니다. 그 옷을 입으면 이번 겨울은 _____않을 것 같습니다.",
    options: ["춥지", "덥지", "바쁘지", "기쁘지"],
    correct: 0,
  },
  {
    id: 10,
    section: "reading",
    optionType: "text",
    prompt: "이 표지는 무슨 뜻입니까?",
    contentImage: "/de1/p3_img3.jpeg",
    options: [
      "직진 및 좌회전 할 수 있습니다.",
      "직진 및 우회전 할 수 있습니다.",
      "직진만 할 수 있습니다.",
      "좌우회전 할 수 있습니다.",
    ],
    correct: 1,
  },
  {
    id: 11,
    section: "reading",
    optionType: "text",
    prompt: "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    content: "제가 세탁기를 ______.",
    options: ["쓸게요", "돌릴게요", "닦을게요", "할게요"],
    correct: 1,
  },
  {
    id: 12,
    section: "reading",
    optionType: "text",
    prompt: "빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    content:
      "가: 손을 씻고 싶은데요. ____가/이 있으면 좀 주시겠어요?\n나: 네, 여기 있어요.",
    options: ["장갑", "거울", "비누", "치약"],
    correct: 2,
  },
  {
    id: 13,
    section: "reading",
    optionType: "text",
    prompt: "이 것을 사용하는 곳은 어디입니까?",
    contentImage: "/de1/p3_img4.jpeg",
    options: [
      "청소년입니다.",
      "수영장입니다.",
      "오천 원입니다.",
      "이월 이십일입니다.",
    ],
    correct: 1,
  },
  {
    id: 14,
    section: "reading",
    optionType: "text",
    prompt: "직장인이 한국어를 배우는 이유에 대한 설명으로 맞는 것은 무엇입니까?",
    contentImage: "/de1/p4_img1.jpeg",
    options: [
      "한국 회사에서 일하려고 배운다는 응답이 제일 적습니다.",
      "드라마 이해를 위해 배운다는 응답이 두 번째로 많습니다.",
      "학교를 다니기 위해 배운다는 응답이 절반에 가깝습니다.",
      "한국인 친구를 사귀려고 배운다는 응답이 가장 많습니다.",
    ],
    correct: 2,
  },
  {
    id: 15,
    section: "reading",
    optionType: "text",
    prompt: "다음은 무엇에 대한 설명입니까?",
    content:
      "초콜릿은 달아서 사람의 기분을 좋게 합니다. 그래서 사람들이 초콜릿을 자주 먹습니다. 그런데 말을 많이 할 때나 발표를 해야 할 때는 초콜릿을 먹지 않는 것이 좋습니다. 초콜릿을 먹으면 목이 마르게 되어서 목소리가 잘 안 나오기 때문입니다. 그래서 가수들도 공연 전에는 초콜릿을 먹지 않습니다.",
    options: [
      "초콜릿의 단점과 장점.",
      "초콜릿의 가격",
      "초콜릿을 먹는 이유.",
      "초콜릿을 좋아하는 이유.",
    ],
    correct: 0,
  },
  {
    id: 16,
    section: "reading",
    optionType: "text",
    prompt: "다음은 무엇에 대한 설명입니까?",
    content:
      "작업장의 공구들은 여러 사람이 사용합니다. 사용한 다음에는 원래 있던 그대로 놓아두는 것이 가장 좋습니다. 제자리에 갖다 놓지 않거나 섞어 놓으면 다음에 사용하는 사람이 불편할 수 있습니다.",
    options: ["공구 절약", "공구 정리", "공구 종류", "공구 수리"],
    correct: 1,
  },
  {
    id: 17,
    section: "reading",
    optionType: "text",
    prompt: "다음 글을 읽고 내용과 같은 것을 고르십시오.",
    content:
      "한복은 한국의 전통 의상으로 색상이 화려하고 디자인이 아름답습니다. 한국 사람들은 설날이나 결혼식과 같이 특별하고 중요한 날에 한복을 입습니다. 최근에는 전통 한복을 개량하여 만든 생활한복이 인기를 끌고 있습니다. 생활한복은 디자인이 단순하고 실용적이어서 일상생활에서도 편하게 입을 수 있습니다.",
    options: [
      "생활한복은 화려하고 디자인이 아름답습니다.",
      "최근에 한국 사람들이 전통 한복을 많이 입습니다.",
      "생활한복은 일상생활에서 편하게 입을 수 있습니다.",
      "한국의 전통 의상은 색상이 단순하여 인기가 많습니다.",
    ],
    correct: 2,
  },
  {
    id: 18,
    section: "reading",
    optionType: "text",
    prompt: "다음 글을 읽고 내용과 같은 것을 고르십시오.",
    content:
      "양궁은 쉬워 보이지만 판단력과 인내심이 필요한 운동이다. 양궁에서는 활을 쏘는 순간이 제일 중요하다. 특히 언제 활을 쏘아야 할지 판단하는 것이 핵심이다. 또한 활을 쏘는 그 순간까지 숨을 멈추고 기다리는 인내심이 요구된다. 그렇기 때문에 판단력이 부족한 사람이나 인내심이 필요한 사람에게 매우 좋은 운동이라고 할 수 있다.",
    options: [
      "양궁으로 판단력을 높일 수 있다.",
      "양궁의 핵심은 숨을 참는 것이다.",
      "양궁으로 참을성을 기르기가 어렵다.",
      "양궁은 단순한 운동이라 주목을 받았다.",
    ],
    correct: 0,
  },
  {
    id: 19,
    section: "reading",
    optionType: "text",
    prompt: "다음 설명에 알맞은 어휘를 고르십시오.",
    content:
      "도로에서 색이 있는 불빛으로 통행 차량이나 사람의 통행을 지시하는 장치입니다.",
    options: ["노선도", "육교", "신호등", "화물선"],
    correct: 2,
  },
  {
    id: 20,
    section: "reading",
    optionType: "text",
    prompt: "다음 설명에 알맞은 어휘를 고르십시오.",
    content: "매일(날마다) 세수할 때 필요한 용품입니다.",
    options: ["면도기", "화장품", "세면도구", "비누"],
    correct: 2,
  },

  // ═══════════════════════════════════════
  //  듣기 (NGHE HIỂU) — Câu 21-40
  // ═══════════════════════════════════════

  // ── Q21-22: Nghe và chọn âm / câu đúng ────────────────
  {
    id: 21,
    section: "listening",
    optionType: "text",
    prompt: "들은 것을 고르십시오.",
    content: "구 _________",
    audioScript: "구경",
    audioHint: "Nghe: 1 từ ghép bắt đầu bằng '구'",
    options: ["구함", "구입", "구경", "구청"],
    correct: 2,
  },
  {
    id: 22,
    section: "listening",
    optionType: "text",
    prompt: "들은 것을 고르십시오.",
    audioScript: "청소하지 않습니다",
    audioHint: "Nghe: 1 câu phủ định",
    options: [
      "좋지 않았습니다.",
      "가까워지 않습니다.",
      "청소하지 않습니다.",
      "좋아하지 않습니다.",
    ],
    correct: 2,
  },

  // ── Q23-29: Nghe → chọn hình (ảnh thực từ PDF) ────────
  {
    id: 23,
    section: "listening",
    optionType: "image",
    prompt: "들은 것을 고르십시오.",
    audioScript: "저는 매일 지하철을 타고 회사에 갑니다.",
    audioHint: "Nghe cách di chuyển → chọn hình phương tiện đúng",
    optionImages: ["/de1/p5_img1.jpeg", "/de1/p5_img2.jpeg", "/de1/p5_img3.jpeg", "/de1/p5_img4.jpeg"],
    options: ["비행기", "지하철", "배", "버스"],
    correct: 1,
  },
  {
    id: 24,
    section: "listening",
    optionType: "image",
    prompt: "들은 것을 고르십시오.",
    audioScript: "여자가 요리를 하고 있습니다.",
    audioHint: "Nghe mô tả hành động của người phụ nữ → chọn hình đúng",
    optionImages: ["/de1/p6_img2.jpeg", "/de1/p6_img3.jpeg", "/de1/p6_img4.jpeg", "/de1/p6_img5.jpeg"],
    options: ["요리하기", "청소기 사용", "컴퓨터 작업", "물고기 보기"],
    correct: 0,
  },
  {
    id: 25,
    section: "listening",
    optionType: "text",
    prompt: "이것은 무엇입니까?",
    audioScript: "이것은 매일 아침 세수할 때 사용합니다. 손이나 얼굴을 깨끗이 씻을 수 있습니다.",
    audioHint: "Nghe mô tả đồ vật dùng khi rửa mặt",
    options: ["세면도구", "청소도구", "주방용품", "사무용품"],
    correct: 0,
  },
  {
    id: 26,
    section: "listening",
    optionType: "text",
    prompt: "여기는 어디입니까?",
    contentImage: "/de1/p6_img7.jpeg",
    audioScript: "두 사람이 앉아서 음료를 마시며 이야기하고 있습니다. 자판기도 있습니다.",
    audioHint: "Nghe mô tả nơi có máy bán hàng tự động, nghỉ ngơi",
    options: ["공장 식당", "휴게실", "회의실", "사무실"],
    correct: 1,
  },
  {
    id: 27,
    section: "listening",
    optionType: "text",
    prompt: "이 사람은 무엇을 하고 있습니까?",
    contentImage: "/de1/p6_img8.jpeg",
    audioScript: "이 사람은 용접 작업을 하고 있습니다.",
    audioHint: "Nghe mô tả công việc → chọn đáp án đúng",
    options: ["청소하고 있습니다", "용접하고 있습니다", "운전하고 있습니다", "요리하고 있습니다"],
    correct: 1,
  },
  {
    id: 28,
    section: "listening",
    optionType: "text",
    prompt: "그릇이 몇 개 있습니까?",
    contentImage: "/de1/p6_img1.jpeg",
    audioScript: "그릇이 네 개 있습니다.",
    audioHint: "Nhìn hình → Nghe số lượng → chọn đúng",
    options: ["한 개", "두 개", "세 개", "네 개"],
    correct: 3,
  },
  {
    id: 29,
    section: "listening",
    optionType: "text",
    prompt: "수건은 어디에 있습니까?",
    contentImage: "/de1/p7_img1.jpeg",
    audioScript: "수건이 선반 왼쪽 위에 있습니다.",
    audioHint: "Nhìn hình kệ phòng tắm → Nghe vị trí khăn",
    options: ["선반 왼쪽 위", "선반 오른쪽", "세면대 위", "욕조 안"],
    correct: 0,
  },

  // ── Q30-33: Nghe câu hỏi → chọn câu trả lời đúng ──────
  {
    id: 30,
    section: "listening",
    optionType: "text",
    prompt: "다음을 듣고 질문에 알맞은 대답을 고르십시오.",
    audioScript: "한국 생활이 어때요?",
    audioHint: "Câu hỏi: Cuộc sống ở Hàn Quốc thế nào?",
    options: [
      "서울에 살아요.",
      "힘들지만 재미있어요.",
      "저년에 한국에 왔어요.",
      "비행기로 다섯 시간 걸려요.",
    ],
    correct: 1,
  },
  {
    id: 31,
    section: "listening",
    optionType: "text",
    prompt: "다음을 듣고 질문에 알맞은 대답을 고르십시오.",
    audioScript: "영수 씨 아직 안 왔어요?",
    audioHint: "Câu hỏi: Anh Yeongsu chưa về à?",
    options: [
      "저는 벌써 먹었는데요.",
      "아직 안 들어왔는데요.",
      "저는 영수 친구가 아닌데요.",
      "오늘은 바빠서 못 가는데요.",
    ],
    correct: 1,
  },
  {
    id: 32,
    section: "listening",
    optionType: "text",
    prompt: "다음을 듣고 질문에 알맞은 대답을 고르십시오.",
    audioScript: "이 씨 아버지가 어제 돌아가셨대요.",
    audioHint: "Thông báo: Bố anh ấy mất rồi",
    options: [
      "아버지 마음이 아프시겠어요.",
      "축의금을 많이 보내 드려야겠어요.",
      "퇴근 후에 장례식장에 가야겠네요.",
      "많이 다치지 않았으면 좋겠어요.",
    ],
    correct: 2,
  },
  {
    id: 33,
    section: "listening",
    optionType: "text",
    prompt: "다음을 듣고 질문에 알맞은 대답을 고르십시오.",
    audioScript: "왜 인터넷으로 쇼핑을 해요?",
    audioHint: "Câu hỏi: Tại sao mua hàng qua mạng?",
    options: [
      "값이 싸고 쇼핑이 편리해서요.",
      "인터넷 쇼핑을 하기 쉽지 않아요.",
      "인터넷으로 쇼핑을 해 본 적이 없어요.",
      "회원가입을 하려면 신분증이 필요해요.",
    ],
    correct: 0,
  },

  // ── Q34-35: Nghe → chọn câu tiếp theo ──────────────────
  {
    id: 34,
    section: "listening",
    optionType: "text",
    prompt: "다음을 듣고 이어지는 말을 고르십시오.",
    audioScript: "이 바지 길이를 좀 줄여 주실 수 있어요?",
    audioHint: "Yêu cầu sửa quần → phản hồi tiếp theo là gì?",
    options: [
      "여기 표시한 데까지 해 주시면 돼요.",
      "한 번도 옷을 고쳐 본 적이 없어요.",
      "바지 길이가 조금 줄어들었나 봐요.",
      "급하지 않으니까 천천히 해 주세요.",
    ],
    correct: 0,
  },
  {
    id: 35,
    section: "listening",
    optionType: "text",
    prompt: "다음을 듣고 이어지는 말을 고르십시오.",
    audioScript: "드디어 마음에 드는 집을 구했어요!",
    audioHint: "Thông báo tìm được nhà → phản hồi tiếp theo là gì?",
    options: [
      "그러니까 조금 기다렸다가 가세요.",
      "그러니까 집을 빨리 알아보면 돼요.",
      "그래서 집을 못 구할까 봐 걱정이에요.",
      "그래서 이제 마음 편하게 잘 수 있겠네요.",
    ],
    correct: 3,
  },

  // ── Q36-37: Nghe đoạn hội thoại ngắn → chọn hình (ảnh thực) ───
  {
    id: 36,
    section: "listening",
    optionType: "image",
    prompt: "잘 듣고 들은 내용과 관계 있는 그림을 고르십시오.",
    audioScript:
      "남자: 오늘 수영장에 누가 왔어요? 여자: 남자와 여자 두 명이 수영장 안에서 공을 가지고 놀고 있었어요.",
    audioHint: "Hội thoại về cảnh bể bơi → chọn đúng hình mô tả",
    optionImages: ["/de1/p8_img1.jpeg", "/de1/p8_img2.jpeg", "/de1/p8_img3.jpeg", "/de1/p8_img4.jpeg"],
    options: ["두 명 수영 중", "한 명 물화사하기", "중간에서 체조", "수영장 나가는 중"],
    correct: 0,
  },
  {
    id: 37,
    section: "listening",
    optionType: "image",
    prompt: "잘 듣고 들은 내용과 관계 있는 그림을 고르십시오.",
    audioScript:
      "여자 직원이 남자 손님에게 카메라를 건네주고 있습니다.",
    audioHint: "Mô tả cảnh cửa hàng máy ảnh → chọn đúng hình",
    optionImages: ["/de1/p8_img5.jpeg", "/de1/p8_img6.jpeg", "/de1/p8_img7.jpeg", "/de1/p8_img8.jpeg"],
    options: ["직원이 어린이에게 보여주기", "남자가 진열대 구경", "여직원이 남성에게 건네주기", "직원이 구매 거절"],
    correct: 2,
  },

  // ── Q38-40: Nghe đoạn dài → chọn nội dung đúng ─────────
  {
    id: 38,
    section: "listening",
    optionType: "text",
    prompt: "다음 중 들은 내용과 같은 것은 무엇입니까?",
    audioScript:
      "한국에서는 쓰레기를 버릴 때 종량제 봉투를 사용해야 합니다. 종량제 봉투는 크기에 따라 가격이 다릅니다. 이 제도는 쓰레기의 양을 줄여서 환경을 보호하기 위해 만들어졌습니다. 쓰레기는 반드시 정해진 장소에 버려야 합니다.",
    audioHint: "Đoạn thông báo về hệ thống túi rác tính theo khối lượng ở Hàn Quốc",
    options: [
      "쓰레기봉투는 한 종류밖에 없다.",
      "쓰레기양을 줄여서 환경을 보호한다.",
      "정해진 장소에 쓰레기를 버리지 않아도 됩니다.",
      "쓰레기 버릴 때는 돈이 들지 않습니다.",
    ],
    correct: 1,
  },
  {
    id: 39,
    section: "listening",
    optionType: "text",
    prompt: "들은 내용과 같은 것을 고르십시오.",
    audioScript:
      "남자: 안녕하세요. 오늘 건강 검진을 받으러 왔는데요. 여자: 네, 어서 오세요. 검진 결과가 나왔는데요, 혈압이 조금 높게 나왔어요. 음식에 신경 쓰시는 게 좋을 것 같아요. 남자: 아, 그렇군요. 어떤 음식을 조심해야 할까요? 여자: 짠 음식을 줄이시고 채소를 많이 드세요.",
    audioHint: "Hội thoại tại phòng khám: bệnh nhân và bác sĩ",
    options: [
      "남자는 검진 결과를 보러 왔다.",
      "여자는 검진을 받으려고 기다리고 있다.",
      "여자는 남자와 이곳에서 만나기로 약속했다.",
      "여자는 건강을 위해 음식에 신경 써야 합니다.",
    ],
    correct: 3,
  },
  {
    id: 40,
    section: "listening",
    optionType: "text",
    prompt: "들은 내용과 같은 것을 고르십시오.",
    audioScript:
      "남자: 어제 결혼식에 갔어요? 여자: 네, 정말 예쁜 결혼식이었어요. 남자: 맞아요. 저도 거기서 여러 사람을 만났어요. 여자: 그래요? 누구 만났어요? 남자: 오랜만에 여자 씨를 거기서 만났잖아요. 여자: 맞다, 그렇군요.",
    audioHint: "Hội thoại về đám cưới hôm qua",
    options: [
      "여자는 어제 일이 많았습니다.",
      "여자는 어제 결혼을 했습니다.",
      "남자는 어제 회사에서 일했습니다.",
      "남자는 결혼식에서 여자를 만났습니다.",
    ],
    correct: 3,
  },
];

export const DE1_INFO = {
  id: "de1",
  title: "ĐỀ SỐ 01",
  totalQuestions: 40,
  readingCount: 20,
  listeningCount: 20,
  timeMinutes: 70,
  passScore: 80,
};
