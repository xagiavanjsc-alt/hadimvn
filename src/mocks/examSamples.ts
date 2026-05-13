interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export const EPS_EXAMPLES: ExamQuestion[] = [
  {
    id: "eps_1",
    question: "다음 중 알맞은 단어를 고르십시오.\n\n저는 매일 아침 _____을/를 먹습니다.",
    options: ["빵", "학교", "책", "친구"],
    correctIndex: 0,
    explanation: "빵 (bánh) là từ phù hợp nhất vì người ta thường ăn bánh vào buổi sáng."
  },
  {
    id: "eps_2",
    question: "다음 중 알맞은 단어를 고르십시오.\n\n오늘 _____에/에 갑니다.",
    options: ["먹다", "학교", "좋다", "크다"],
    correctIndex: 1,
    explanation: "학교 (trường) là địa điểm, phù hợp với đi đến."
  },
  {
    id: "eps_3",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n저는 친구와 _____을/를 합니다.",
    options: ["공부", "친구", "선생님", "교실"],
    correctIndex: 0,
    explanation: "공부 (học) là hoạt động mà người ta thường làm với bạn bè."
  },
  {
    id: "eps_4",
    question: "다음 중 틀린 문장을 고르십시오.",
    options: [
      "저는 학생입니다.",
      "저는 빵을 먹습니다.",
      "저는 학교에 갑니다.",
      "저는 빵입니다."
    ],
    correctIndex: 3,
    explanation: "저는 빵입니다 (tôi là bánh) là sai vì con người không thể là bánh."
  },
  {
    id: "eps_5",
    question: "다음 중 '가다'의 과거형을 고르십시오.",
    options: ["가다", "갔다", "가요", "갈 거예요"],
    correctIndex: 1,
    explanation: "갔다 là quá khứ của 가다 (đi)."
  },
  {
    id: "eps_6",
    question: "다음 중 '먹다'의 미래형을 고르십시오.",
    options: ["먹다", "먹었다", "먹어요", "먹을 거예요"],
    correctIndex: 3,
    explanation: "먹을 거예요 là tương lai của 먹다 (ăn)."
  },
  {
    id: "eps_7",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n저는 한국어를 _____요.",
    options: ["배우다", "배워", "배운다", "배우"],
    correctIndex: 1,
    explanation: "배워 (học) là dạng kết thúc -요 phù hợp cho câu hiện tại lịch sự."
  },
  {
    id: "eps_8",
    question: "다음 중 '좋다'의 부정형을 고르십시오.",
    options: ["좋다", "좋아요", "좋지 않다", "좋아하다"],
    correctIndex: 2,
    explanation: "좋지 않다 là dạng phủ định của 좋다 (tốt)."
  },
  {
    id: "eps_9",
    question: "다음 중 '크다'의 의미를 고르십시오.",
    options: ["nhỏ", "lớn", "ngắn", "dài"],
    correctIndex: 1,
    explanation: "크다 có nghĩa là lớn."
  },
  {
    id: "eps_10",
    question: "다음 문장을 한국어로 번역하십시오.\n\nTôi đi học.",
    options: [
      "저는 학교에 갑니다.",
      "저는 학교에 왔습니다.",
      "저는 학교에 갈 거예요.",
      "저는 학교입니다."
    ],
    correctIndex: 0,
    explanation: "저는 학교에 갑니다 là câu hiện tại lịch sự đúng nhất."
  },
  {
    id: "eps_11",
    question: "다음 중 '작다'의 의미를 고르십시오.",
    options: ["lớn", "nhỏ", "dài", "cao"],
    correctIndex: 1,
    explanation: "작다 có nghĩa là nhỏ."
  },
  {
    id: "eps_12",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n친구가 _____을/를 좋아합니다.",
    options: ["음악", "음악을", "음악에", "음악이"],
    correctIndex: 1,
    explanation: "음악을 (nhạc) với object marker -을/를 là đúng."
  },
  {
    id: "eps_13",
    question: "다음 중 '오다'의 의미를 고르십시오.",
    options: ["đi", "đến", "rời", "trở về"],
    correctIndex: 1,
    explanation: "오다 có nghĩa là đến."
  },
  {
    id: "eps_14",
    question: "다음 문장을 한국어로 번역하십시오.\n\nBạn có khỏe không?",
    options: [
      "당신은 건강합니까?",
      "건강하십니까?",
      "안녕하십니까?",
      "어떻습니까?"
    ],
    correctIndex: 1,
    explanation: "건강하십니까 là câu hỏi đúng nhất."
  },
  {
    id: "eps_15",
    question: "다음 중 '많다'의 의미를 고르십시오.",
    options: ["ít", "nhiều", "lớn", "nhỏ"],
    correctIndex: 1,
    explanation: "많다 có nghĩa là nhiều."
  },
  {
    id: "eps_16",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n교실에 학생이 _____.",
    options: ["많다", "많습니다", "많아요", "많이"],
    correctIndex: 1,
    explanation: "많습니다 là dạng lịch sự hiện tại."
  },
  {
    id: "eps_17",
    question: "다음 중 '적다'의 의미를 고르십시오.",
    options: ["nhiều", "ít", "lớn", "nhỏ"],
    correctIndex: 1,
    explanation: "적다 có nghĩa là ít."
  },
  {
    id: "eps_18",
    question: "다음 문장을 한국어로 번역하십시오.\n\nTôi uống nước.",
    options: [
      "저는 물을 마십니다.",
      "저는 물을 마십니다.",
      "저는 물을 마십니다.",
      "저는 물을 마십니다."
    ],
    correctIndex: 0,
    explanation: "저는 물을 마십니다 là câu đúng."
  },
  {
    id: "eps_19",
    question: "다음 중 '마시다'의 의미를 고르십시오.",
    options: ["ăn", "uống", "ngủ", "đi"],
    correctIndex: 1,
    explanation: "마시다 có nghĩa là uống."
  },
  {
    id: "eps_20",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n저는 커피를 _____.",
    options: ["마시다", "마십니다", "마셔요", "마신다"],
    correctIndex: 1,
    explanation: "마십니다 là dạng lịch sự hiện tại."
  },
  {
    id: "eps_21",
    question: "다음 중 '자다'의 의미를 고르십시오.",
    options: ["đi", "ngủ", "đến", "rời"],
    correctIndex: 1,
    explanation: "자다 có nghĩa là ngủ."
  },
  {
    id: "eps_22",
    question: "다음 문장을 한국어로 번역하십시오.\n\nTôi ngủ 8 tiếng.",
    options: [
      "저는 여덟 시간을 잡니다.",
      "저는 여덟 시간을 잡니다.",
      "저는 여덟 시간을 잡니다.",
      "저는 여덟 시간을 잡니다."
    ],
    correctIndex: 0,
    explanation: "저는 여덟 시간을 잡니다 là câu đúng."
  },
  {
    id: "eps_23",
    question: "다음 중 '일어나다'의 의미를 고르십시오.",
    options: ["ngủ", "dậy", "đi", "đến"],
    correctIndex: 1,
    explanation: "일어나다 có nghĩa là dậy."
  },
  {
    id: "eps_24",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n저는 아침 _____에 일어납니다.",
    options: ["6시", "6시에", "6시를", "6시가"],
    correctIndex: 1,
    explanation: "6시 với time marker -에 là đúng."
  },
  {
    id: "eps_25",
    question: "다음 중 '씻다'의 의미를 고르십시오.",
    options: ["ăn", "uống", "tắm", "ngủ"],
    correctIndex: 2,
    explanation: "씻다 có nghĩa là tắm."
  },
  {
    id: "eps_26",
    question: "다음 문장을 한국어로 번역하십시오.\n\nTôi tắm rửa.",
    options: [
      "저는 씻습니다.",
      "저는 씻습니다.",
      "저는 씻습니다.",
      "저는 씻습니다."
    ],
    correctIndex: 0,
    explanation: "저는 씻습니다 là câu đúng."
  },
  {
    id: "eps_27",
    question: "다음 중 '입다'의 의미를 고르십시오.",
    options: ["cởi", "mặc", "đi", "đến"],
    correctIndex: 1,
    explanation: "입다 có nghĩa là mặc."
  },
  {
    id: "eps_28",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n저는 옷을 _____.",
    options: ["입다", "입습니다", "입어요", "입은"],
    correctIndex: 1,
    explanation: "입습니다 là dạng lịch sự hiện tại."
  },
  {
    id: "eps_29",
    question: "다음 중 '벗다'의 의미를 고르십시오.",
    options: ["mặc", "cởi", "đi", "đến"],
    correctIndex: 1,
    explanation: "벗다 có nghĩa là cởi."
  },
  {
    id: "eps_30",
    question: "다음 문장을 한국어로 번역하십시오.\n\nTôi cởi quần áo.",
    options: [
      "저는 옷을 벗습니다.",
      "저는 옷을 벗습니다.",
      "저는 옷을 벗습니다.",
      "저는 옷을 벗습니다."
    ],
    correctIndex: 0,
    explanation: "저는 옷을 벗습니다 là câu đúng."
  },
  {
    id: "eps_31",
    question: "다음 중 '신다'의 의미를 고르십시오.",
    options: ["cởi", "đi", "mặc", "ngủ"],
    correctIndex: 1,
    explanation: "신다 có nghĩa là đi (giày)."
  },
  {
    id: "eps_32",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n저는 신발을 _____.",
    options: ["신다", "신습니다", "신어요", "신는"],
    correctIndex: 1,
    explanation: "신습니다 là dạng lịch sự hiện tại."
  },
  {
    id: "eps_33",
    question: "다음 중 '끓다'의 의미를 고르십시오.",
    options: ["lạnh", "nóng", "sôi", "đóng băng"],
    correctIndex: 2,
    explanation: "끓다 có nghĩa là sôi."
  },
  {
    id: "eps_34",
    question: "다음 문장을 한국어로 번역하십시오.\n\nNước đang sôi.",
    options: [
      "물이 끓습니다.",
      "물이 끓습니다.",
      "물이 끓습니다.",
      "물이 끓습니다."
    ],
    correctIndex: 0,
    explanation: "물이 끓습니다 là câu đúng."
  },
  {
    id: "eps_35",
    question: "다음 중 '싸다'의 의미를 고르십시오.",
    options: ["đắt", "rẻ", "lớn", "nhỏ"],
    correctIndex: 1,
    explanation: "싸다 có nghĩa là rẻ."
  },
  {
    id: "eps_36",
    question: "다음 중 '비싸다'의 의미를 고르십시오.",
    options: ["rẻ", "đắt", "tốt", "xấu"],
    correctIndex: 1,
    explanation: "비싸다 có nghĩa là đắt."
  },
  {
    id: "eps_37",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n이것은 아주 _____.",
    options: ["싸다", "싸요", "싸", "비싸요"],
    correctIndex: 3,
    explanation: "비싸요 (đắt) thường dùng với 아주 (rất)."
  },
  {
    id: "eps_38",
    question: "다음 중 '맛있다'의 의미를 고르십시오.",
    options: ["không ngon", "ngon", "đắng", "chua"],
    correctIndex: 1,
    explanation: "맛있다 có nghĩa là ngon."
  },
  {
    id: "eps_39",
    question: "다음 문장을 한국어로 번역하십시오.\n\nMón này rất ngon.",
    options: [
      "이것은 맛있습니다.",
      "이것은 맛있습니다.",
      "이것은 맛있습니다.",
      "이것은 맛있습니다."
    ],
    correctIndex: 0,
    explanation: "이것은 맛있습니다 là câu đúng."
  },
  {
    id: "eps_40",
    question: "다음 중 '맛없다'의 의미를 고르십시오.",
    options: ["ngon", "không ngon", "ngọt", "mặn"],
    correctIndex: 1,
    explanation: "맛없다 có nghĩa là không ngon."
  },
  {
    id: "eps_41",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n음식이 _____.",
    options: ["맛있다", "맛있어요", "맛있는", "맛"],
    correctIndex: 1,
    explanation: "맛있어요 là dạng lịch sự hiện tại."
  },
  {
    id: "eps_42",
    question: "다음 중 '덥다'의 의미를 고르십시오.",
    options: ["lạnh", "nóng", "ấm", "mát"],
    correctIndex: 1,
    explanation: "덥다 có nghĩa là nóng."
  },
  {
    id: "eps_43",
    question: "다음 중 '춥다'의 의미를 고르십시오.",
    options: ["nóng", "lạnh", "ấm", "mát"],
    correctIndex: 1,
    explanation: "춥다 có nghĩa là lạnh."
  },
  {
    id: "eps_44",
    question: "다음 문장을 한국어로 번역하십시오.\n\nHôm nay trời nóng.",
    options: [
      "오늘은 덥습니다.",
      "오늘은 춥습니다.",
      "오늘은 따뜻합니다.",
      "오늘은 시원합니다."
    ],
    correctIndex: 0,
    explanation: "오늘은 덥습니다 (nóng) là câu đúng."
  },
  {
    id: "eps_45",
    question: "다음 문장을 한국어로 번역하십시오.\n\nHôm nay trời lạnh.",
    options: [
      "오늘은 덥습니다.",
      "오늘은 춥습니다.",
      "오늘은 따뜻합니다.",
      "오늘은 시원합니다."
    ],
    correctIndex: 1,
    explanation: "오늘은 춥습니다 (lạnh) là câu đúng."
  },
  {
    id: "eps_46",
    question: "다음 중 '좋아하다'의 의미를 고르십시오.",
    options: ["ghét", "thích", "yêu", "ghen tị"],
    correctIndex: 1,
    explanation: "좋아하다 có nghĩa là thích."
  },
  {
    id: "eps_47",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n저는 한국을 _____.",
    options: ["좋아하다", "좋아해요", "좋아합니다", "좋아"],
    correctIndex: 2,
    explanation: "좋아합니다 là dạng lịch sự hiện tại."
  },
  {
    id: "eps_48",
    question: "다음 중 '싫어하다'의 의미를 고르십시오.",
    options: ["thích", "ghét", "yêu", "ghen tị"],
    correctIndex: 1,
    explanation: "싫어하다 có nghĩa là ghét."
  },
  {
    id: "eps_49",
    question: "다음 문장을 한국어로 번역하십시오.\n\nTôi không thích cái này.",
    options: [
      "저는 이것을 싫어합니다.",
      "저는 이것을 좋아합니다.",
      "저는 이것을 사랑합니다.",
      "저는 이것을 원합니다."
    ],
    correctIndex: 0,
    explanation: "저는 이것을 싫어합니다 là câu đúng."
  },
  {
    id: "eps_50",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n저는 아침을 _____.",
    options: ["먹다", "먹습니다", "먹어요", "먹는"],
    correctIndex: 1,
    explanation: "먹습니다 là dạng lịch sự hiện tại."
  }
];

export const SEOUL_EXAMPLES: ExamQuestion[] = [
  {
    id: "seoul_1",
    question: "다음 중 알맞은 단어를 고르십시오.\n\n안녕하세요. 저는 _____입니다.",
    options: ["학생", "학교", "책", "친구"],
    correctIndex: 0,
    explanation: "학생 (sinh viên) là danh từ phù hợp để giới thiệu bản thân."
  },
  {
    id: "seoul_2",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n저는 한국어를 _____.",
    options: ["공부합니다", "학교입니다", "책입니다", "친구입니다"],
    correctIndex: 0,
    explanation: "공부합니다 (học) là động từ phù hợp nhất."
  },
  {
    id: "seoul_3",
    question: "다음 중 '있다'의 의미를 고르십시오.",
    options: ["không có", "có", "đi", "đến"],
    correctIndex: 1,
    explanation: "있다 có nghĩa là có (tồn tại)."
  },
  {
    id: "seoul_4",
    question: "다음 중 '없다'의 의미를 고르십시오.",
    options: ["có", "không có", "đi", "đến"],
    correctIndex: 1,
    explanation: "없다 có nghĩa là không có."
  },
  {
    id: "seoul_5",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n교실에 학생이 _____.",
    options: ["있다", "없다", "가다", "오다"],
    correctIndex: 0,
    explanation: "있다 (có) phù hợp vì trong lớp thường có học sinh."
  },
  {
    id: "seoul_6",
    question: "다음 중 '오다'의 과거형을 고르십시오.",
    options: ["오다", "왔다", "옵니다", "올 거예요"],
    correctIndex: 1,
    explanation: "왔다 là quá khứ của 오다 (đến)."
  },
  {
    id: "seoul_7",
    question: "다음 중 '읽다'의 현재형을 고르십시오.",
    options: ["읽다", "읽었다", "읽어요", "읽을 거예요"],
    correctIndex: 2,
    explanation: "읽어요 là dạng lịch sự hiện tại của 읽다 (đọc)."
  },
  {
    id: "seoul_8",
    question: "다음 문장을 한국어로 번역하십시오.\n\nCô giáo đang dạy.",
    options: [
      "선생님이 가르칩니다.",
      "선생님이 가르쳤습니다.",
      "선생님이 가르칠 거예요.",
      "선생님이 선생님입니다."
    ],
    correctIndex: 0,
    explanation: "선생님이 가르칩니다 là câu hiện tại đúng nhất."
  },
  {
    id: "seoul_9",
    question: "다음 중 '쓰다'의 의미를 고르십시오.",
    options: ["đọc", "viết", "nghe", "nói"],
    correctIndex: 1,
    explanation: "쓰다 có nghĩa là viết."
  },
  {
    id: "seoul_10",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n저는 책을 _____요.",
    options: ["읽다", "읽어", "읽는다", "읽는"],
    correctIndex: 1,
    explanation: "읽어 (đọc) là dạng kết thúc -요 phù hợp."
  },
  {
    id: "seoul_11",
    question: "다음 중 '듣다'의 의미를 고르십시오.",
    options: ["nói", "nghe", "đọc", "viết"],
    correctIndex: 1,
    explanation: "듣다 có nghĩa là nghe."
  },
  {
    id: "seoul_12",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n저는 음악을 _____.",
    options: ["듣다", "듣습니다", "들어요", "듣는"],
    correctIndex: 1,
    explanation: "듣습니다 là dạng lịch sự hiện tại."
  },
  {
    id: "seoul_13",
    question: "다음 중 '말하다'의 의미를 고르십시오.",
    options: ["nghe", "nói", "đọc", "viết"],
    correctIndex: 1,
    explanation: "말하다 có nghĩa là nói."
  },
  {
    id: "seoul_14",
    question: "다음 문장을 한국어로 번역하십시오.\n\nTôi nói tiếng Hàn.",
    options: [
      "저는 한국어를 말합니다.",
      "저는 한국어를 듣습니다.",
      "저는 한국어를 읽습니다.",
      "저는 한국어를 씁니다."
    ],
    correctIndex: 0,
    explanation: "저는 한국어를 말합니다 là câu đúng."
  },
  {
    id: "seoul_15",
    question: "다음 중 '보다'의 의미를 고르십시오.",
    options: ["nghe", "nói", "xem", "đọc"],
    correctIndex: 2,
    explanation: "보다 có nghĩa là xem."
  },
  {
    id: "seoul_16",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n저는 TV를 _____.",
    options: ["보다", "봅니다", "봐요", "보는"],
    correctIndex: 1,
    explanation: "봅니다 là dạng lịch sự hiện tại."
  },
  {
    id: "seoul_17",
    question: "다음 중 '하다'의 의미를 고르십시오.",
    options: ["không", "làm", "đi", "đến"],
    correctIndex: 1,
    explanation: "하다 có nghĩa là làm."
  },
  {
    id: "seoul_18",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n저는 숙제를 _____.",
    options: ["하다", "합니다", "해요", "하는"],
    correctIndex: 1,
    explanation: "합니다 là dạng lịch sự hiện tại."
  },
  {
    id: "seoul_19",
    question: "다음 중 '가다'의 현재형을 고르십시오.",
    options: ["가다", "갑니다", "가요", "갈 거예요"],
    correctIndex: 1,
    explanation: "갑니다 là dạng lịch sự hiện tại."
  },
  {
    id: "seoul_20",
    question: "다음 문장을 한국어로 번역하십시오.\n\nTôi đi học.",
    options: [
      "저는 학교에 갑니다.",
      "저는 학교에 왔습니다.",
      "저는 학교에 갈 거예요.",
      "저는 학교입니다."
    ],
    correctIndex: 0,
    explanation: "저는 학교에 갑니다 là câu hiện tại đúng nhất."
  },
  {
    id: "seoul_21",
    question: "다음 중 '오다'의 현재형을 고르십시오.",
    options: ["오다", "옵니다", "와요", "올 거예요"],
    correctIndex: 1,
    explanation: "옵니다 là dạng lịch sự hiện tại."
  },
  {
    id: "seoul_22",
    question: "다음 문장을 한국어로 번역하십시오.\n\nBạn đến trường.",
    options: [
      "당신은 학교에 갑니다.",
      "당신은 학교에 옵니다.",
      "당신은 학교에 왔습니다.",
      "당신은 학교입니다."
    ],
    correctIndex: 1,
    explanation: "당신은 학교에 옵니다 (đến) là câu đúng."
  },
  {
    id: "seoul_23",
    question: "다음 중 '앉다'의 의미를 고르십시오.",
    options: ["đứng", "ngồi", "nằm", "đi"],
    correctIndex: 1,
    explanation: "앉다 có nghĩa là ngồi."
  },
  {
    id: "seoul_24",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n의자에 _____.",
    options: ["앉다", "앉습니다", "앉아요", "앉는"],
    correctIndex: 1,
    explanation: "앉습니다 là dạng lịch sự hiện tại."
  },
  {
    id: "seoul_25",
    question: "다음 중 '서다'의 의미를 고르십시오.",
    options: ["ngồi", "đứng", "nằm", "đi"],
    correctIndex: 1,
    explanation: "서다 có nghĩa là đứng."
  },
  {
    id: "seoul_26",
    question: "다음 문장을 한국어로 번역하십시오.\n\nTôi đứng.",
    options: [
      "저는 서 있습니다.",
      "저는 앉습니다.",
      "저는 눕습니다.",
      "저는 갑니다."
    ],
    correctIndex: 0,
    explanation: "저는 서 있습니다 là câu đúng."
  },
  {
    id: "seoul_27",
    question: "다음 중 '눕다'의 의미를 고르십시오.",
    options: ["đứng", "ngồi", "nằm", "ngủ"],
    correctIndex: 2,
    explanation: "눕다 có nghĩa là nằm."
  },
  {
    id: "seoul_28",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n침대에 _____.",
    options: ["눕다", "눕습니다", "누워요", "눕는"],
    correctIndex: 1,
    explanation: "눕습니다 là dạng lịch sự hiện tại."
  },
  {
    id: "seoul_29",
    question: "다음 중 '걷다'의 의미를 고르십시오.",
    options: ["chạy", "đi bộ", "bơi", "nhảy"],
    correctIndex: 1,
    explanation: "걷다 có nghĩa là đi bộ."
  },
  {
    id: "seoul_30",
    question: "다음 문장을 한국어로 번역하십시오.\n\nTôi đi bộ.",
    options: [
      "저는 걷습니다.",
      "저는 뜁니다.",
      "저는 수영합니다.",
      "저는 뜁니다."
    ],
    correctIndex: 0,
    explanation: "저는 걷습니다 là câu đúng."
  }
];

export const TOPIK_EXAMPLES: ExamQuestion[] = [
  // Listening Questions (1-20)
  {
    id: "topik_1",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(남자: 여기가 학교입니다.)\n\n어디입니까?",
    options: ["bệnh viện", "trường học", "cửa hàng", "nhà ga"],
    correctIndex: 1,
    explanation: "학교 (trường học) được nhắc trong câu nói."
  },
  {
    id: "topik_2",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(여자: 사과를 먹습니다.)\n\n무엇을 먹습니까?",
    options: ["táo", "cam", "chuối", "nho"],
    correctIndex: 0,
    explanation: "사과 (táo) được nhắc trong câu nói."
  },
  {
    id: "topik_3",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(남자: 책을 읽습니다.)\n\n무엇을 합니까?",
    options: ["viết", "đọc", "nghe", "nói"],
    correctIndex: 1,
    explanation: "책을 읽습니다 (đọc sách) được nhắc."
  },
  {
    id: "topik_4",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(여자: 물을 마십니다.)\n\n무엇을 마십니까?",
    options: ["cà phê", "trà", "nước", "sữa"],
    correctIndex: 2,
    explanation: "물 (nước) được nhắc trong câu nói."
  },
  {
    id: "topik_5",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(남자: 버스를 탑니다.)\n\n무엇을 탑니까?",
    options: ["tàu", "xe buýt", "xe taxi", "máy bay"],
    correctIndex: 1,
    explanation: "버스 (xe buýt) được nhắc trong câu nói."
  },
  {
    id: "topik_6",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(여자: 우산을 씁니다.)\n\n날씨가 어떻습니까?",
    options: ["nắng", "mưa", "gió", "tuyết"],
    correctIndex: 1,
    explanation: "우산 (ô) được dùng khi mưa."
  },
  {
    id: "topik_7",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(남자: 커피를 마십니다.)\n\n무엇을 마십니까?",
    options: ["nước", "trà", "cà phê", "sữa"],
    correctIndex: 2,
    explanation: "커피 (cà phê) được nhắc trong câu nói."
  },
  {
    id: "topik_8",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(여자: 친구를 만납니다.)\n\n누구를 만납니까?",
    options: ["thầy giáo", "bạn", "cha mẹ", "anh chị"],
    correctIndex: 1,
    explanation: "친구 (bạn) được nhắc trong câu nói."
  },
  {
    id: "topik_9",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(남자: 빵을 삽니다.)\n\n무엇을 삽니까?",
    options: ["quần áo", "sách", "bánh", "nước"],
    correctIndex: 2,
    explanation: "빵 (bánh) được nhắc trong câu nói."
  },
  {
    id: "topik_10",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(여자: 잡니다.)\n\n무엇을 합니까?",
    options: ["đi", "ngủ", "uống", "ngủ"],
    correctIndex: 3,
    explanation: "잡니다 (ngủ) được nhắc trong câu nói."
  },
  {
    id: "topik_11",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(남자: 전화를 받습니다.)\n\n무엇을 합니까?",
    options: ["gửi email", "nhận điện thoại", "gửi tin nhắn", "gọi điện thoại"],
    correctIndex: 1,
    explanation: "전화를 받습니다 (nhận điện thoại) được nhắc."
  },
  {
    id: "topik_12",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(여자: 운동을 합니다.)\n\n무엇을 합니까?",
    options: ["ngủ", "ăn", "tập thể dục", "đi làm"],
    correctIndex: 2,
    explanation: "운동을 합니다 (tập thể dục) được nhắc."
  },
  {
    id: "topik_13",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(남자: 병원에 갑니다.)\n\n어디에 갑니까?",
    options: ["trường học", "bệnh viện", "cửa hàng", "nhà hàng"],
    correctIndex: 1,
    explanation: "병원 (bệnh viện) được nhắc trong câu nói."
  },
  {
    id: "topik_14",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(여자: 쇼핑을 합니다.)\n\n무엇을 합니까?",
    options: ["đi làm", "mua sắm", "đi học", "ngủ"],
    correctIndex: 1,
    explanation: "쇼핑을 합니다 (mua sắm) được nhắc."
  },
  {
    id: "topik_15",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(남자: 택시를 탑니다.)\n\n무엇을 탑니까?",
    options: ["xe buýt", "tàu", "xe taxi", "máy bay"],
    correctIndex: 2,
    explanation: "택시 (xe taxi) được nhắc trong câu nói."
  },
  {
    id: "topik_16",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(여자: 노래를 부릅니다.)\n\n무엇을 합니까?",
    options: ["nghe nhạc", "hát", "nhảy", "vẽ"],
    correctIndex: 1,
    explanation: "노래를 부릅니다 (hát) được nhắc."
  },
  {
    id: "topik_17",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(남자: 요리를 합니다.)\n\n무엇을 합니까?",
    options: ["ăn", "nấu ăn", "uống", "mua"],
    correctIndex: 1,
    explanation: "요리를 합니다 (nấu ăn) được nhắc."
  },
  {
    id: "topik_18",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(여자: 사진을 찍습니다.)\n\n무엇을 합니까?",
    options: ["vẽ", "chụp ảnh", "viết", "đọc"],
    correctIndex: 1,
    explanation: "사진을 찍습니다 (chụp ảnh) được nhắc."
  },
  {
    id: "topik_19",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(남자: 이메일을 씁니다.)\n\n무엇을 합니까?",
    options: ["gửi tin nhắn", "gọi điện thoại", "viết email", "đọc email"],
    correctIndex: 2,
    explanation: "이메일을 씁니다 (viết email) được nhắc."
  },
  {
    id: "topik_20",
    question: "[듣기] 다음을 듣고 알맞은 그림을 고르십시오.\n\n(여자: 영화를 봅니다.)\n\n무엇을 봅니까?",
    options: ["TV", "sách", "truyện", "báo"],
    correctIndex: 0,
    explanation: "영화를 봅니다 (xem phim) thường xem trên TV."
  },
  // Reading Questions (21-40)
  {
    id: "topik_21",
    question: "[읽기] 다음을 읽고 물음에 답하십시오.\n\n가: 안녕하세요? 무엇을 도와드릴까요?\n나: 이 책을 주세요.\n\n나는 무엇을 원하는가?",
    options: ["bánh", "nước", "sách", "bút"],
    correctIndex: 2,
    explanation: "책 (sách) là từ được nhắc trong câu '이 책을 주세요'."
  },
  {
    id: "topik_22",
    question: "[읽기] 다음을 읽고 물음에 답하십시오.\n\n가: 식당이 어디에 있습니까?\n나: 2층에 있습니다.\n\n식당은 어디에 있는가?",
    options: ["tầng 1", "tầng 2", "tầng 3", "tầng 4"],
    correctIndex: 1,
    explanation: "2층 (tầng 2) là địa điểm được nhắc trong câu."
  },
  {
    id: "topik_23",
    question: "[읽기] 다음 중 알맞은 표현을 고르십시오.\n\n친구가 아파서 병원에 갔습니다. 무엇이라고 말합니까?",
    options: [
      "안녕하세요?",
      "맛있게 드세요.",
      "빨리 나으세요.",
      "안녕히 가세요."
    ],
    correctIndex: 2,
    explanation: "빨리 나으세요 (hãy mau khỏe) là lời chúc phù hợp khi ai đó bị ốm."
  },
  {
    id: "topik_24",
    question: "[읽기] 다음을 읽고 물음에 답하십시오.\n\n어제 친구와 영화를 봤습니다. 영화는 재미있었습니다.\n\n무엇을 했는가?",
    options: ["đi học", "xem phim", "đi làm", "ngủ"],
    correctIndex: 1,
    explanation: "영화를 봤습니다 (đã xem phim) là hoạt động được nhắc."
  },
  {
    id: "topik_25",
    question: "[읽기] 다음 중 '만나다'의 의미를 고르십시오.",
    options: ["đi", "gặp", "đến", "rời"],
    correctIndex: 1,
    explanation: "만나다 có nghĩa là gặp."
  },
  {
    id: "topik_26",
    question: "[읽기] 다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n내일 친구를 _____.",
    options: ["만나다", "만나", "만난다", "만나는"],
    correctIndex: 1,
    explanation: "만나 (gặp) là dạng cơ bản phù hợp cho câu tương lai."
  },
  {
    id: "topik_27",
    question: "[읽기] 다음을 읽고 물음에 답하십시오.\n\n가: 시간이 있습니까?\n나: 네, 있습니다.\n\n나는 시간이 있는가?",
    options: ["có", "không có", "không biết", "có thể"],
    correctIndex: 0,
    explanation: "네, 있습니다 (vâng, có) xác nhận có thời gian."
  },
  {
    id: "topik_28",
    question: "[읽기] 다음 중 '시간'의 의미를 고르십시오.",
    options: ["tiền", "thời gian", "nơi chốn", "người"],
    correctIndex: 1,
    explanation: "시간 có nghĩa là thời gian."
  },
  {
    id: "topik_29",
    question: "[읽기] 다음 문장을 한국어로 번역하십시오.\n\nTôi sẽ đi gặp bạn.",
    options: [
      "저는 친구를 만납니다.",
      "저는 친구를 만났습니다.",
      "저는 친구를 만날 거예요.",
      "저는 친구를 만나고 싶습니다."
    ],
    correctIndex: 2,
    explanation: "저는 친구를 만날 거예요 là câu tương lai đúng nhất."
  },
  {
    id: "topik_30",
    question: "[읽기] 다음을 읽고 물음에 답하십시오.\n\n가: 날씨가 어떻습니까?\n나: 맑습니다.\n\n날씨는 어떤가?",
    options: ["mưa", "nắng đẹp", "gió", "tuyết"],
    correctIndex: 1,
    explanation: "맑습니다 (trời nắng đẹp) mô tả thời tiết."
  },
  {
    id: "topik_31",
    question: "[읽기] 다음을 읽고 물음에 답하십시오.\n\n저는 매일 학교에 갑니다. 학교는 집에서 가깝습니다.\n\n학교는 어떤 곳인가?",
    options: ["xa", "gần", "lớn", "nhỏ"],
    correctIndex: 1,
    explanation: "가깝습니다 (gần) mô tả vị trí trường học."
  },
  {
    id: "topik_32",
    question: "[읽기] 다음을 읽고 물음에 답하십시오.\n\n오늘은 날씨가 좋습니다. 친구와 공원에 갑니다.\n\n어디에 갑니까?",
    options: ["bệnh viện", "công viên", "trường học", "cửa hàng"],
    correctIndex: 1,
    explanation: "공원 (công viên) là địa điểm được nhắc."
  },
  {
    id: "topik_33",
    question: "[읽기] 다음을 읽고 물음에 답하십시오.\n\n저는 한국 음식을 좋아합니다. 김치와 불고기를 자주 먹습니다.\n\n무엇을 좋아합니까?",
    options: ["món Nhật", "món Trung", "món Hàn", "món Việt"],
    correctIndex: 2,
    explanation: "한국 음식 (món Hàn) được nhắc trong câu."
  },
  {
    id: "topik_34",
    question: "[읽기] 다음을 읽고 물음에 답하십시오.\n\n가: 취미가 무엇입니까?\n나: 독서입니다.\n\n취미는 무엇인가?",
    options: ["nghe nhạc", "đọc sách", "xem phim", "chơi game"],
    correctIndex: 1,
    explanation: "독서 (đọc sách) là sở thích được nhắc."
  },
  {
    id: "topik_35",
    question: "[읽기] 다음을 읽고 물음에 답하십시오.\n\n우리 가족은 4명입니다. 아버지, 어머니, 저, 그리고 동생입니다.\n\n가족은 몇 명인가?",
    options: ["2명", "3명", "4명", "5명"],
    correctIndex: 2,
    explanation: "가족은 4명 (gia đình có 4 người) được nhắc."
  },
  {
    id: "topik_36",
    question: "[읽기] 다음을 읽고 물음에 답하십시오.\n\n가: 직업이 무엇입니까?\n나: 선생님입니다.\n\n직업은 무엇인가?",
    options: ["bác sĩ", "giáo viên", "kỹ sư", "luật sư"],
    correctIndex: 1,
    explanation: "선생님 (giáo viên) là nghề nghiệp được nhắc."
  },
  {
    id: "topik_37",
    question: "[읽기] 다음을 읽고 물음에 답하십시오.\n\n저는 서울에 삽니다. 서울은 한국의 수도입니다.\n\n어디에 삽니까?",
    options: ["Busan", "Daegu", "Seoul", "Incheon"],
    correctIndex: 2,
    explanation: "서울 (Seoul) là nơi được nhắc."
  },
  {
    id: "topik_38",
    question: "[읽기] 다음을 읽고 물음에 답하십시오.\n\n가: 언제 한국에 왔습니까?\n나: 작년에 왔습니다.\n\n언제 왔습니까?",
    options: ["năm nay", "năm ngoái", "năm sau", "2 năm trước"],
    correctIndex: 1,
    explanation: "작년 (năm ngoái) là thời điểm được nhắc."
  },
  {
    id: "topik_39",
    question: "[읽기] 다음을 읽고 물음에 답하십시오.\n\n저는 한국어를 공부합니다. 한국어는 재미있습니다.\n\n무엇을 공부합니까?",
    options: ["tiếng Anh", "tiếng Nhật", "tiếng Trung", "tiếng Hàn"],
    correctIndex: 3,
    explanation: "한국어 (tiếng Hàn) được nhắc trong câu."
  },
  {
    id: "topik_40",
    question: "[읽기] 다음을 읽고 물음에 답하십시오.\n\n가: 왜 한국어를 배웁니까?\n나: 한국에 가고 싶어서입니다.\n\n왜 배웁니까?",
    options: ["đi làm", "đi du lịch", "muốn đi Hàn Quốc", "học vì thích"],
    correctIndex: 2,
    explanation: "한국에 가고 싶어서 (muốn đi Hàn Quốc) là lý do được nhắc."
  }
];
