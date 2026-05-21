// EPS Exam Data Structure
// Format: 6 separate exams, each with 20 questions, timer, and images

export interface EPSQuestion {
  id: string;
  number: number;
  question: string;
  questionType: "image" | "text" | "grammar" | "fill-blank";
  options: string[];
  correctAnswer: number; // 0-3 for options index
  image?: string; // Single content image (for sign/chart questions)
  optionImages?: string[]; // 4 image paths used as selectable answer options
  explanation?: string;
}

export interface EPSExam {
  id: string;
  title: string;
  duration: number; // in minutes
  questions: EPSQuestion[];
  questionCount?: number; // override display count when questions array is empty
}

export const EPS_EXAMS: EPSExam[] = [
  {
    id: "eps_01",
    title: "ĐỀ SỐ 01",
    duration: 50,
    questions: [
      {
        id: "q1",
        number: 1,
        question: "다음 내용과 관계있는 그림을 고르십시오. 냉장고입니다.",
        questionType: "image",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        optionImages: [
          "/images/eps/image_38.webp",
          "/images/eps/image_39.webp",
          "/images/eps/image_40.webp",
          "/images/eps/image_41.webp"
        ]
      },
      {
        id: "q2",
        number: 2,
        question: "다음 내용과 관계있는 그림을 고르십시오. 빵을 자르고 있습니다.",
        questionType: "image",
        options: ["1", "2", "3", "4"],
        correctAnswer: 2,
        optionImages: [
          "/images/eps/image_34.webp",
          "/images/eps/image_35.webp",
          "/images/eps/image_36.webp",
          "/images/eps/image_37.webp"
        ]
      },
      {
        id: "q3",
        number: 3,
        question: "다음 내용과 관계있는 것을 고르십시오. 독서",
        questionType: "text",
        options: ["낫다", "예쁘다", "취미", "나쁘다"],
        correctAnswer: 2
      },
      {
        id: "q4",
        number: 4,
        question: "다음 내용과 관계있는 것을 고르십시오. 건강, 경치, 사이, 분위기",
        questionType: "text",
        options: ["위치", "국적", "하다", "가족"],
        correctAnswer: 2
      },
      {
        id: "q5",
        number: 5,
        question: "다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.",
        questionType: "grammar",
        options: [
          "밥을 먹으면서 TV 를 봅니다.",
          "우리 언니는 피아노를 치하면서 노래를 해요.",
          "운전으면서 전화하지 마세요.",
          "학교에 다니하면서 아르바이트를 해요."
        ],
        correctAnswer: 0,
        explanation: "먹으면서 is correct grammar pattern"
      },
      {
        id: "q6",
        number: 6,
        question: "빈칸에 들어갈 가장 알맞은 것을 고르십시오. 리한 씨와 저는 5 월 12 일에 태어났습니다. 우리는 태어난 해는 다르지만 ______이/가 같아서 함께 파티를 했습니다.",
        questionType: "fill-blank",
        options: ["나이", "생일", "성격", "외모"],
        correctAnswer: 1
      },
      {
        id: "q7",
        number: 7,
        question: "빈칸에 들어갈 가장 알맞은 것을 고르십시오. 다음 주에 동료들과 여행을 가려고 합니다. 그래서 오늘 우리가 머물 숙소를 ______.",
        questionType: "fill-blank",
        options: ["받았습니다", "주었습니다", "정리했습니다", "예약했습니다"],
        correctAnswer: 3
      },
      {
        id: "q8",
        number: 8,
        question: "빈칸에 들어갈 가장 알맞은 것을 고르십시오. 요즘은 일이 많아서 스트레스가 많습니다. 하지만 ______ 친구들을 만나서 이야기를 하면 스트레스가 풀립니다.",
        questionType: "fill-blank",
        options: ["너무", "가끔", "벌써", "제일"],
        correctAnswer: 1
      },
      {
        id: "q9",
        number: 9,
        question: "빈칸에 들어갈 가장알맞은 것을고르십시오. 지난주에 시장에 가서 두꺼운 외투를 한 벌 샀습니다. 그 옷을 입으면 이번 겨울은 _____않을 것 같습니다.",
        questionType: "fill-blank",
        options: ["춥지", "덥지", "바쁘지", "기쁘지"],
        correctAnswer: 0
      },
      {
        id: "q10",
        number: 10,
        question: "이 표지는 무슨 뜻입니까?",
        questionType: "image",
        options: ["직진및 좌회전 할 수 있습니다.", "직진및 우회전 할 수 있습니다.", "직진만 할 수 있습니다.", "좌우회전 할 수 있습니다."],
        correctAnswer: 1,
        image: "/images/eps/image_56.webp"
      },
      {
        id: "q11",
        number: 11,
        question: "빈칸에 들어갈 가장알맞은 것을고르십시오. 제가 세탁기를 ______.",
        questionType: "fill-blank",
        options: ["쓸게요", "돌릴게요", "닦을게요", "할게요"],
        correctAnswer: 1
      },
      {
        id: "q12",
        number: 12,
        question: "빈칸에 들어갈 가장알맞은 것을고르십시오. 가: 손을 씻고 싶은데요. ____가/이 있으면 좀 주시겠어요? 나: 네, 여기 있어요.",
        questionType: "fill-blank",
        options: ["장갑", "거울", "비누", "치약"],
        correctAnswer: 2
      },
      {
        id: "q13",
        number: 13,
        question: "이 것을 사용하는 곳은 어디입니까? [수영장 청소년 입장권 | 이용일: 이월 이십일 | 가격: 오천 원]",
        questionType: "text",
        options: ["청소년입니다.", "수영장 입니다.", "오천 원 입니다.", "이월 이십일입니다."],
        correctAnswer: 1
      },
      {
        id: "q14",
        number: 14,
        question: "직장인이 한국어를 배우는 이유에 대한 설명으로 맞는 것은 무엇입니까?",
        questionType: "image",
        options: [
          "한국 회사에서 일하려고 배운다는 응답이 제일 적습니다.",
          "드라마 이해를 위해 배운다는 응답이 두 번째로 많습니다.",
          "학교를 다니기 위해 배운다는 응답이 절반에 가깝습니다.",
          "한국인 친구를 사귀려고 배운다는 응답이 가장 많습니다."
        ],
        correctAnswer: 3,
        image: "/images/eps/image_48.webp"
      },
      {
        id: "q15",
        number: 15,
        question: "다음은 무엇에 대한 설명입니까? 초콜릿은 달아서 사람의 기분을 좋게 합니다. 그래서 사람들이 초콜릿을 자주 먹습니다. 그런데 말을 많이 할 때나 발표를 해야 할 때는 초콜릿을 먹지 않는 것이 좋습니다. 초콜릿을 먹으면 목이 마르게 되어서 목소리가 잘 안 나오기 때문입니다. 그래서 가수들도 공연 전에는 초콜릿을 먹지 않습니다.",
        questionType: "text",
        options: ["초콜릿의 단점과 장점", "초콜릿의 가격", "초콜릿을 먹는 이유", "초콜릿을 좋아하는 이유"],
        correctAnswer: 0
      },
      {
        id: "q16",
        number: 16,
        question: "다음은 무엇에 대한 설명입니까? 작업장의 공구들은 여러 사람이 사용합니다. 사용한 다음에는 원래 있던 그대로 놓아두는 것이 가장 좋습니다. 제자리에 갖다 놓지 않거나 섞어 놓으면 다음에 사용하는 사람이 불편할 수 있습니다.",
        questionType: "text",
        options: ["공구 절약", "공구 정리", "공구 종류", "공구 수리"],
        correctAnswer: 1
      },
      {
        id: "q17",
        number: 17,
        question: "다음 글을 읽고 내용과 같은 것을 고르십시오. 한복은 한국의 전통 의상으로 색상이 화려하고 디자인이 아름답습니다. 한국 사람들은 설날이나 결혼식과 같이 특별하고 중요한 날에 한복을 입습니다. 최근에는 전통 한복을 개량하여 만든 생활한복이 인기를 끌고 있습니다. 생활한복은 디자인이 단순하고 실용적이어서 일상생활에서도 편하게 입을 수 있습니다.",
        questionType: "text",
        options: [
          "생활한복은 화려하고 디자인이 아름답습니다.",
          "최근에 한국 사람들이 전통 한복을 많이 입습니다.",
          "생활한복은 일상생활에서 편하게 입을 수 있습니다.",
          "한국의 전통 의상은 색상이 단순하여 인기가 많습니다."
        ],
        correctAnswer: 2
      },
      {
        id: "q18",
        number: 18,
        question: "다음 글을 읽고 내용과 같은 것을 고르십시오. 양궁은 쉬워 보이지만 판단력과 인내심이 필요한 운동이다. 양궁에서는 활을 쏘는 순간이 제일 중요하다. 특히 언제 활을 쏘아야 할지 판단하는 것이 핵심이다. 또한 활을 쏘는 그 순간까지 숨을 멈추고 기다리는 인내심이 요구된다. 그렇기 때문에 판단력이 부족한 사람이나 인내심이 필요한 사람에게 매우 좋은 운동이라고 할 수 있다.",
        questionType: "text",
        options: [
          "양궁으로 판단력을 높일 수 있다.",
          "양궁의 핵심은 숨을 참는 것이다.",
          "양궁으로 참을성을 기르기가 어렵다.",
          "양궁은 단순한 운동이라 주목을 받았다."
        ],
        correctAnswer: 0
      },
      {
        id: "q19",
        number: 19,
        question: "다음 설명에 알맞은 어휘를 고르십시오. 도로에서 색이 있는 불빛으로 통행 차량이나 사람의 통행을 지시하는 장치입니다.",
        questionType: "text",
        options: ["노선도", "육교", "신호등", "화물선"],
        correctAnswer: 2
      },
      {
        id: "q20",
        number: 20,
        question: "다음 설명에 알맞은 어휘를 고르십시오. 매일 세수할때 필요한 용품입니다.",
        questionType: "text",
        options: ["면도기", "화장품", "세면도구", "비누"],
        correctAnswer: 2
      },
      // 듣기 (Listening) Q21-Q40
      {
        id: "q21",
        number: 21,
        question: "들은 것을 고르십시오.",
        questionType: "text",
        options: ["구경", "경함", "함구", "청입"],
        correctAnswer: 0
      },
      {
        id: "q22",
        number: 22,
        question: "들은 것을 고르십시오.",
        questionType: "text",
        options: ["좋지 않았습니다.", "가까워지지 않습니다.", "청소하지 않습니다.", "좋아하지 않습니다."],
        correctAnswer: 2
      },
      {
        id: "q23",
        number: 23,
        question: "들은 것을 고르십시오.",
        questionType: "image",
        options: ["1", "2", "3", "4"],
        correctAnswer: 3,
        optionImages: [
          "/images/eps/image_34.webp",
          "/images/eps/image_35.webp",
          "/images/eps/image_36.webp",
          "/images/eps/image_37.webp"
        ]
      },
      {
        id: "q24",
        number: 24,
        question: "들은 것을 고르십시오.",
        questionType: "image",
        options: ["1", "2", "3", "4"],
        correctAnswer: 0,
        optionImages: [
          "/images/eps/image_52.webp",
          "/images/eps/image_53.webp",
          "/images/eps/image_54.webp",
          "/images/eps/image_55.webp"
        ]
      },
      {
        id: "q25",
        number: 25,
        question: "이것은 무엇입니까?",
        questionType: "image",
        options: ["1", "2", "3", "4"],
        correctAnswer: 0,
        optionImages: [
          "/images/eps/image_57.webp",
          "/images/eps/image_58.webp",
          "/images/eps/image_59.webp",
          "/images/eps/image_60.webp"
        ]
      },
      {
        id: "q26",
        number: 26,
        question: "여기는 어디입니까?",
        questionType: "image",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        optionImages: [
          "/images/eps/image_61.webp",
          "/images/eps/image_62.webp",
          "/images/eps/image_63.webp",
          "/images/eps/image_64.webp"
        ]
      },
      {
        id: "q27",
        number: 27,
        question: "이 사람은 무엇을 하고 있습니까?",
        questionType: "image",
        options: ["1", "2", "3", "4"],
        correctAnswer: 2,
        image: "/images/eps/image_65.webp"
      },
      {
        id: "q28",
        number: 28,
        question: "그릇이 몇 개 있습니까?",
        questionType: "image",
        options: ["1", "2", "3", "4"],
        correctAnswer: 3,
        image: "/images/eps/image_20.webp"
      },
      {
        id: "q29",
        number: 29,
        question: "수건은 어디에 있습니까?",
        questionType: "image",
        options: ["1", "2", "3", "4"],
        correctAnswer: 0,
        image: "/images/eps/image_65.webp"
      },
      {
        id: "q30",
        number: 30,
        question: "다음을 듣고 질문에 알맞은 대답을 고르십시오.",
        questionType: "text",
        options: ["서울에 살아요.", "힘들지만 재미있어요.", "저년에 한국에 왔어요.", "비행기로 다섯 시간 걸려요."],
        correctAnswer: 1
      },
      {
        id: "q31",
        number: 31,
        question: "다음을 듣고 질문에 알맞은 대답을 고르십시오.",
        questionType: "text",
        options: ["저는 벌써 먹었는데요.", "아직 안 들어왔는데요.", "저는 영수 친구가 아닌데요.", "오늘은 바빠서 못 가는데요."],
        correctAnswer: 3
      },
      {
        id: "q32",
        number: 32,
        question: "다음을 듣고 질문에 알맞은 대답을 고르십시오.",
        questionType: "text",
        options: ["아버지 마음이 아프시겠어요.", "축의금을 많이 보내 드려야겠어요.", "퇴근 후에 장례식장에 가야겠네요.", "많이 다치지 않았으면 좋겠어요."],
        correctAnswer: 2
      },
      {
        id: "q33",
        number: 33,
        question: "다음을 듣고 질문에 알맞은 대답을 고르십시오.",
        questionType: "text",
        options: ["값이 싸고 쇼핑이 편리해서요.", "인터넷 쇼핑을 하기 쉽지 않아요.", "인터넷으로 쇼핑을 해 본 적이 없어요.", "회원가입을 하려면 신분증이 필요해요."],
        correctAnswer: 0
      },
      {
        id: "q34",
        number: 34,
        question: "다음을 듣고 이어지는 말을 고르십시오.",
        questionType: "text",
        options: ["여기 표시한 데까지 해 주시면 돼요.", "한 번도 옷을 고쳐 본 적이 없어요.", "바지 길이가 조금 줄어들었나 봐요.", "급하지 않으니까 천천히 해 주세요."],
        correctAnswer: 3
      },
      {
        id: "q35",
        number: 35,
        question: "다음을 듣고 이어지는 말을 고르십시오.",
        questionType: "text",
        options: ["그러니까 조금 기다렸다가 가세요.", "그러니까 집을 빨리 알아보면 돼요.", "그래서 집을 못 구할까 봐 걱정이에요.", "그래서 이제 마음 편하게 잘 수 있겠네요."],
        correctAnswer: 3
      },
      {
        id: "q36",
        number: 36,
        question: "잘 듣고 들은 내용과 관계 있는 그림을 고르십시오.",
        questionType: "image",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        optionImages: [
          "/images/eps/image_66.webp",
          "/images/eps/image_67.webp",
          "/images/eps/image_68.webp",
          "/images/eps/image_70.webp"
        ]
      },
      {
        id: "q37",
        number: 37,
        question: "잘 듣고 들은 내용과 관계 있는 그림을 고르십시오.",
        questionType: "image",
        options: ["1", "2", "3", "4"],
        correctAnswer: 2,
        optionImages: [
          "/images/eps/image_71.webp",
          "/images/eps/image_72.webp",
          "/images/eps/image_73.webp",
          "/images/eps/image_74.webp"
        ]
      },
      {
        id: "q38",
        number: 38,
        question: "다음 중 들은 내용과 같은 것은 무엇입니까?",
        questionType: "text",
        options: [
          "쓰레기봉투는 한 종류 밖에 없다.",
          "쓰레기양을 줄여서 환경을 보호한다.",
          "정해진 장소에 쓰레기를 버리지 않아도 됩니다.",
          "쓰레기 버릴 때는 돈이 들지 않습니다."
        ],
        correctAnswer: 1
      },
      {
        id: "q39",
        number: 39,
        question: "들은 내용과 같은 것을 고르십시오.",
        questionType: "text",
        options: [
          "남자는 검진 결과를 보러 왔다.",
          "여자는 검진을 받으려고 기다리고 있다.",
          "여자는 남자와 이곳에서 만나기로 약속했다.",
          "여자는 건강을 위해 음식에 신경 써야 합니다."
        ],
        correctAnswer: 3
      },
      {
        id: "q40",
        number: 40,
        question: "들은 내용과 같은 것을 고르십시오.",
        questionType: "text",
        options: [
          "여자는 어제 일이 많았습니다.",
          "여자는 어제 결혼을 했습니다.",
          "남자는 어제 회사에서 일했습니다.",
          "남자는 결혼식에서 여자를 만났습니다."
        ],
        correctAnswer: 3
      }
    ]
  },
  {
    id: "eps_02",
    title: "ĐỀ Số 02",
    duration: 50,
    questionCount: 40,
    questions: [],
  },
  // Add eps_03, eps_04, eps_05, eps_06
];
