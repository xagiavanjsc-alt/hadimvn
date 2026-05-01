export interface NaverQuestion {
  id: string;
  question: string;
  questionKr: string;
  category: string;
  views: number;
  answers: number;
  date: string;
  selected: boolean;
  processed?: boolean;
  translatedQuestion?: string;
  rewrittenAnswer?: string;
  hashtags?: string[];
  originalAnswer?: string;
}

export const mockNaverQuestions: NaverQuestion[] = [
  {
    id: "nq-001",
    question: "BTS 노래에서 자주 나오는 '보라해'가 무슨 뜻인가요?",
    questionKr: "BTS 노래에서 자주 나오는 '보라해'가 무슨 뜻인가요?",
    category: "K-pop / Từ vựng",
    views: 15420,
    answers: 23,
    date: "2024-03-15",
    selected: false,
    processed: false,
    originalAnswer: "보라해는 BTS 멤버 뷔가 만든 말로, '보라색처럼 서로를 믿고 사랑하자'는 의미입니다. 무지개의 마지막 색인 보라색은 오랫동안 함께한다는 의미도 있어요.",
  },
  {
    id: "nq-002",
    question: "K-pop 가사에서 '설레다'와 '두근거리다'의 차이가 뭔가요?",
    questionKr: "K-pop 가사에서 '설레다'와 '두근거리다'의 차이가 뭔가요?",
    category: "Ngữ pháp / Từ vựng",
    views: 8930,
    answers: 15,
    date: "2024-03-18",
    selected: false,
    processed: false,
    originalAnswer: "설레다는 기대감이나 흥분으로 마음이 들뜨는 느낌이고, 두근거리다는 심장이 빠르게 뛰는 신체적 반응을 표현합니다. 둘 다 설렘을 표현하지만 뉘앙스가 달라요.",
  },
  {
    id: "nq-003",
    question: "아이돌 노래에서 '오빠'를 자주 쓰는데, 실제로도 이렇게 부르나요?",
    questionKr: "아이돌 노래에서 '오빠'를 자주 쓰는데, 실제로도 이렇게 부르나요?",
    category: "Văn hóa / Xưng hô",
    views: 22100,
    answers: 41,
    date: "2024-03-20",
    selected: false,
    processed: false,
    originalAnswer: "네, 실제로도 사용합니다. 오빠는 여성이 나이 많은 남성을 부를 때 쓰는 호칭인데, K-pop에서는 팬들이 남자 아이돌을 친근하게 부를 때도 사용해요.",
  },
  {
    id: "nq-004",
    question: "BLACKPINK 노래 'How You Like That'에서 문법적으로 맞는 표현인가요?",
    questionKr: "BLACKPINK 노래 'How You Like That'에서 문법적으로 맞는 표현인가요?",
    category: "Ngữ pháp",
    views: 6750,
    answers: 8,
    date: "2024-03-22",
    selected: false,
    processed: false,
    originalAnswer: "이 표현은 영어 구어체 표현으로, 정식 문법으로는 'How do you like that?'이 맞습니다. K-pop에서는 리듬감을 위해 이런 구어체 표현을 자주 사용해요.",
  },
  {
    id: "nq-005",
    question: "한국 노래에서 '그리워'와 '보고 싶어'는 같은 뜻인가요?",
    questionKr: "한국 노래에서 '그리워'와 '보고 싶어'는 같은 뜻인가요?",
    category: "Từ vựng / Cảm xúc",
    views: 11200,
    answers: 19,
    date: "2024-03-25",
    selected: false,
    processed: false,
    originalAnswer: "비슷하지만 다릅니다. 그리워는 오랫동안 보지 못해 그리운 감정이고, 보고 싶어는 지금 당장 만나고 싶다는 즉각적인 감정입니다. 그리워가 더 깊고 오래된 그리움을 표현해요.",
  },
  {
    id: "nq-006",
    question: "EXO 노래에서 '별이 빛나는 밤'이라는 표현, 어떻게 활용할 수 있나요?",
    questionKr: "EXO 노래에서 '별이 빛나는 밤'이라는 표현, 어떻게 활용할 수 있나요?",
    category: "Ngữ pháp / Ứng dụng",
    views: 4320,
    answers: 6,
    date: "2024-03-28",
    selected: false,
    processed: false,
    originalAnswer: "별이 빛나는 밤은 '별이 빛나다(sao sáng) + 는(mệnh đề quan hệ) + 밤(đêm)' cấu trúc. Bạn có thể áp dụng: 꽃이 피는 봄(mùa xuân hoa nở), 눈이 오는 겨울(mùa đông tuyết rơi).",
  },
  {
    id: "nq-007",
    question: "Stray Kids 노래에서 '버텨'라는 단어가 자주 나오는데 무슨 뜻인가요?",
    questionKr: "Stray Kids 노래에서 '버텨'라는 단어가 자주 나오는데 무슨 뜻인가요?",
    category: "Từ vựng / Động lực",
    views: 9870,
    answers: 12,
    date: "2024-04-01",
    selected: false,
    processed: false,
    originalAnswer: "버텨 là dạng mệnh lệnh của 버티다, có nghĩa là 'cố lên, chịu đựng, kiên trì'. Stray Kids thường dùng từ này để truyền cảm hứng cho fan vượt qua khó khăn.",
  },
];

export const mockProcessedQA = {
  translatedQuestion: "Từ '보라해' thường xuất hiện trong bài hát BTS có nghĩa là gì?",
  rewrittenAnswer: `Đây là một câu hỏi rất thú vị mà nhiều bạn học tiếng Hàn qua K-pop thắc mắc! 

**보라해 (Borahae)** là từ do thành viên V (Kim Taehyung) của BTS sáng tạo ra, kết hợp từ **보라색 (borasaek - màu tím)** và **사랑해 (saranghae - anh/em yêu em/anh)**.

Ý nghĩa sâu xa: Màu tím là màu cuối cùng của cầu vồng, tượng trưng cho sự tin tưởng và tình yêu lâu dài. Khi BTS nói "보라해", họ muốn nói với ARMY rằng: *"Chúng ta hãy tin tưởng và yêu thương nhau đến tận cùng"*.

Trong tiếng Hàn, đây là ví dụ điển hình của **신조어 (sinjoeo - từ mới/từ lóng)** - loại từ được giới trẻ Hàn Quốc sáng tạo và phổ biến qua mạng xã hội.`,
  hashtags: ["#Hỏi_đáp_Kpop", "#Từ_vựng_BTS", "#Ngữ_pháp_thực_tế", "#보라해", "#Tiếng_Hàn_qua_Kpop"],
};
