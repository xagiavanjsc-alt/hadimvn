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
  }
];

export const TOPIK_EXAMPLES: ExamQuestion[] = [
  {
    id: "topik_1",
    question: "다음을 읽고 물음에 답하십시오.\n\n가: 안녕하세요? 무엇을 도와드릴까요?\n나: 이 책을 주세요.\n\n나는 무엇을 원하는가?",
    options: ["bánh", "nước", "sách", "bút"],
    correctIndex: 2,
    explanation: "책 (sách) là từ được nhắc trong câu '이 책을 주세요'."
  },
  {
    id: "topik_2",
    question: "다음을 읽고 물음에 답하십시오.\n\n가: 식당이 어디에 있습니까?\n나: 2층에 있습니다.\n\n식당은 어디에 있는가?",
    options: ["tầng 1", "tầng 2", "tầng 3", "tầng 4"],
    correctIndex: 1,
    explanation: "2층 (tầng 2) là địa điểm được nhắc trong câu."
  },
  {
    id: "topik_3",
    question: "다음 중 알맞은 표현을 고르십시오.\n\n친구가 아파서 병원에 갔습니다. 무엇이라고 말합니까?",
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
    id: "topik_4",
    question: "다음을 읽고 물음에 답하십시오.\n\n어제 친구와 영화를 봤습니다. 영화는 재미있었습니다.\n\n무엇을 했는가?",
    options: ["đi học", "xem phim", "đi làm", "ngủ"],
    correctIndex: 1,
    explanation: "영화를 봤습니다 (đã xem phim) là hoạt động được nhắc."
  },
  {
    id: "topik_5",
    question: "다음 중 '만나다'의 의미를 고르십시오.",
    options: ["đi", "gặp", "đến", "rời"],
    correctIndex: 1,
    explanation: "만나다 có nghĩa là gặp."
  },
  {
    id: "topik_6",
    question: "다음 문장의 빈칸에 알맞은 단어를 고르십시오.\n\n내일 친구를 _____.",
    options: ["만나다", "만나", "만난다", "만나는"],
    correctIndex: 1,
    explanation: "만나 (gặp) là dạng cơ bản phù hợp cho câu tương lai."
  },
  {
    id: "topik_7",
    question: "다음을 읽고 물음에 답하십시오.\n\n가: 시간이 있습니까?\n나: 네, 있습니다.\n\n나는 시간이 있는가?",
    options: ["có", "không có", "không biết", "có thể"],
    correctIndex: 0,
    explanation: "네, 있습니다 (vâng, có) xác nhận có thời gian."
  },
  {
    id: "topik_8",
    question: "다음 중 '시간'의 의미를 고르십시오.",
    options: ["tiền", "thời gian", "nơi chốn", "người"],
    correctIndex: 1,
    explanation: "시간 có nghĩa là thời gian."
  },
  {
    id: "topik_9",
    question: "다음 문장을 한국어로 번역하십시오.\n\nTôi sẽ đi gặp bạn.",
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
    id: "topik_10",
    question: "다음을 읽고 물음에 답하십시오.\n\n가: 날씨가 어떻습니까?\n나: 맑습니다.\n\n날씨는 어떤가?",
    options: ["mưa", "nắng đẹp", "gió", "tuyết"],
    correctIndex: 1,
    explanation: "맑습니다 (trời nắng đẹp) mô tả thời tiết."
  }
];
