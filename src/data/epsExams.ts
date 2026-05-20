// EPS Exam Data Structure
// Format: 6 separate exams, each with 20 questions, timer, and images

export interface EPSQuestion {
  id: string;
  number: number;
  question: string;
  questionType: "image" | "text" | "grammar" | "fill-blank";
  options: string[];
  correctAnswer: number; // 0-3 for options index
  image?: string; // Image path for image questions
  explanation?: string;
}

export interface EPSExam {
  id: string;
  title: string;
  duration: number; // in minutes
  questions: EPSQuestion[];
}

export const EPS_EXAMS: EPSExam[] = [
  {
    id: "eps_01",
    title: "ĐỀ SỐ 01",
    duration: 40, // 40 minutes
    questions: [
      {
        id: "q1",
        number: 1,
        question: "다음 내용과 관계있는 그림을 고르십시오. 냉장고입니다.",
        questionType: "image",
        options: ["냉장고", "세탁기", "전자레인지", "청소기"],
        correctAnswer: 0,
        image: "/images/eps/eps_01/q1.jpg"
      },
      {
        id: "q2",
        number: 2,
        question: "다음 내용과 관계있는 그림을 고르십시오. 빵을 자르고 있습니다.",
        questionType: "image",
        options: ["요리하고 있습니다", "빵을 자르고 있습니다", "설거지하고 있습니다", "청소하고 있습니다"],
        correctAnswer: 1,
        image: "/images/eps/eps_01/q2.jpg"
      },
      {
        id: "q3",
        number: 3,
        question: "다음 내용과 관계있는 것을 고르십시오. 독서",
        questionType: "text",
        options: ["위치", "국적", "취미", "가족"],
        correctAnswer: 2
      },
      {
        id: "q4",
        number: 4,
        question: "다음 내용과 관계있는 것을 고르십시오. 건강, 경치, 사이, 분위기",
        questionType: "text",
        options: ["위치", "국적", "취미", "하다"],
        correctAnswer: 3
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
        question: "다음 중 밑줄 친 부분이 틀린 것을 고르십시오.",
        questionType: "grammar",
        options: [
          "저는 매일 아침 운동을 해요.",
          "동생은 학교에 가고 있어요.",
          "친구가 집에 왔어요.",
          "어제 영화를 봤어요."
        ],
        correctAnswer: 1,
        explanation: "가고 있어요 is incorrect - should be 가요"
      },
      {
        id: "q10",
        number: 10,
        question: "빈칸에 들어갈 가장 알맞은 것을 고르십시오. 한국에 온 지 ______이 되었습니다.",
        questionType: "fill-blank",
        options: ["일 년", "하나", "첫째", "일곱"],
        correctAnswer: 0
      },
      {
        id: "q11",
        number: 11,
        question: "다음 내용과 같은 것을 고르십시오. 저는 한국어를 공부합니다.",
        questionType: "text",
        options: ["저는 한국어를 가르칩니다.", "저는 한국어를 배웁니다.", "저는 한국어를 씁니다.", "저는 한국어를 듣습니다."],
        correctAnswer: 1
      },
      {
        id: "q12",
        number: 12,
        question: "다음 중 의미가 다른 것을 고르십시오.",
        questionType: "text",
        options: ["아주", "매우", "많이", "조금"],
        correctAnswer: 3
      },
      {
        id: "q13",
        number: 13,
        question: "빈칸에 들어갈 가장 알맞은 것을 고르십시오. 비가 오니까 우산을 ______.",
        questionType: "fill-blank",
        options: ["가져가세요", "가져오세요", "가지지 마세요", "가지고 있어요"],
        correctAnswer: 0
      },
      {
        id: "q14",
        number: 14,
        question: "다음 내용과 관계있는 그림을 고르십시오. 버스를 타고 있습니다.",
        questionType: "image",
        options: ["기차를 타고 있습니다", "버스를 타고 있습니다", "자동차를 타고 있습니다", "자전거를 타고 있습니다"],
        correctAnswer: 1,
        image: "/images/eps/eps_01/q14.jpg"
      },
      {
        id: "q15",
        number: 15,
        question: "빈칸에 들어갈 가장 알맞은 것을 고르십시오. 오늘 날씨가 ______ 좋습니다.",
        questionType: "fill-blank",
        options: ["아주", "조금", "안", "못"],
        correctAnswer: 0
      },
      {
        id: "q16",
        number: 16,
        question: "다음 중 맞은 문장을 고르십시오.",
        questionType: "grammar",
        options: [
          "저는 한국 음식을 좋아해요.",
          "저는 한국 음식을 좋아합니다.",
          "저는 한국 음식을 좋아했어요.",
          "저는 한국 음식을 좋아할 거예요."
        ],
        correctAnswer: 0
      },
      {
        id: "q17",
        number: 17,
        question: "빈칸에 들어갈 가장 알맞은 것을 고르십시오. 친구가 ______ 전화를 받았습니다.",
        questionType: "fill-blank",
        options: ["했으니까", "하려고", "해서", "하면서"],
        correctAnswer: 0
      },
      {
        id: "q18",
        number: 18,
        question: "다음 내용과 관계있는 것을 고르십시오. 학교",
        questionType: "text",
        options: ["장소", "시간", "사람", "음식"],
        correctAnswer: 0
      },
      {
        id: "q19",
        number: 19,
        question: "빈칸에 들어갈 가장 알맞은 것을 고르십시오. ______ 친구를 만납니다.",
        questionType: "fill-blank",
        options: ["내일", "어제", "작년", "지난주"],
        correctAnswer: 0
      },
      {
        id: "q20",
        number: 20,
        question: "다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.",
        questionType: "grammar",
        options: [
          "책을 읽고 있어요.",
          "책을 읽고 있었어요.",
          "책을 읽고 있을 거예요.",
          "책을 읽고 있었어요."
        ],
        correctAnswer: 0,
        explanation: "읽고 있어요 is present continuous form"
      }
    ]
  },
  // Add eps_02, eps_03, eps_04, eps_05, eps_06
];
