import { useState, useRef } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WritingPrompt {
  id: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  topic: string;
  title: string;
  titleVi: string;
  instruction: string;
  minWords: number;
  maxWords: number;
  hints: string[];
  keyVocab: { word: string; meaning: string }[];
  grammarPoints: string[];
  sampleAnswer: string;
  sampleAnswerVi: string;
  scoringCriteria: { name: string; desc: string; maxScore: number }[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const prompts: WritingPrompt[] = [
  {
    id: "a1-1",
    level: "A1",
    topic: "Giới thiệu bản thân",
    title: "자기소개",
    titleVi: "Tự giới thiệu bản thân",
    instruction: "Hãy viết một đoạn tự giới thiệu bản thân bằng tiếng Hàn. Bao gồm: tên, tuổi, quốc tịch, nghề nghiệp/học sinh, sở thích.",
    minWords: 30,
    maxWords: 60,
    hints: [
      "저는 [tên]입니다. — Tôi là [tên].",
      "저는 [tuổi]살입니다. — Tôi [tuổi] tuổi.",
      "저는 베트남 사람입니다. — Tôi là người Việt Nam.",
      "저는 [nghề nghiệp]입니다. — Tôi là [nghề nghiệp].",
      "저는 [sở thích]을/를 좋아합니다. — Tôi thích [sở thích].",
    ],
    keyVocab: [
      { word: "이름", meaning: "Tên" },
      { word: "나이", meaning: "Tuổi" },
      { word: "직업", meaning: "Nghề nghiệp" },
      { word: "취미", meaning: "Sở thích" },
      { word: "좋아하다", meaning: "Thích" },
    ],
    grammarPoints: ["N은/는 N입니다", "N을/를 좋아합니다", "저는..."],
    sampleAnswer: `안녕하세요! 저는 응우옌 반 안입니다. 저는 스물다섯 살입니다. 저는 베트남 사람입니다. 저는 회사원입니다. 저는 한국어 공부를 좋아합니다. 그리고 음악 듣기도 좋아합니다. 만나서 반갑습니다!`,
    sampleAnswerVi: `Xin chào! Tôi là Nguyễn Văn An. Tôi 25 tuổi. Tôi là người Việt Nam. Tôi là nhân viên công ty. Tôi thích học tiếng Hàn. Và tôi cũng thích nghe nhạc. Rất vui được gặp bạn!`,
    scoringCriteria: [
      { name: "Nội dung", desc: "Đủ thông tin yêu cầu", maxScore: 40 },
      { name: "Ngữ pháp", desc: "Dùng đúng cấu trúc A1", maxScore: 30 },
      { name: "Từ vựng", desc: "Dùng từ phù hợp", maxScore: 20 },
      { name: "Độ dài", desc: "Đủ 30-60 từ", maxScore: 10 },
    ],
  },
  {
    id: "a2-1",
    level: "A2",
    topic: "Kế hoạch cuối tuần",
    title: "주말 계획",
    titleVi: "Kế hoạch cuối tuần",
    instruction: "Viết về kế hoạch cuối tuần của bạn. Bao gồm: sẽ làm gì, đi đâu, với ai, tại sao thích.",
    minWords: 60,
    maxWords: 100,
    hints: [
      "이번 주말에 저는... — Cuối tuần này tôi...",
      "...에 갈 거예요. — Tôi sẽ đến...",
      "...와/과 같이 — Cùng với...",
      "왜냐하면... — Vì...",
      "...을/를 할 거예요. — Tôi sẽ làm...",
    ],
    keyVocab: [
      { word: "주말", meaning: "Cuối tuần" },
      { word: "계획", meaning: "Kế hoạch" },
      { word: "친구", meaning: "Bạn bè" },
      { word: "여행", meaning: "Du lịch" },
      { word: "쇼핑", meaning: "Mua sắm" },
    ],
    grammarPoints: ["-(으)ㄹ 거예요 (tương lai)", "-고 싶다 (muốn)", "왜냐하면...기 때문이에요"],
    sampleAnswer: `이번 주말에 저는 친구들과 같이 한강 공원에 갈 거예요. 한강 공원에서 자전거를 탈 거예요. 그리고 맛있는 음식도 먹을 거예요. 저는 한강 공원을 좋아해요. 왜냐하면 경치가 아름답기 때문이에요. 저녁에는 영화를 볼 거예요. 이번 주말이 정말 기대돼요!`,
    sampleAnswerVi: `Cuối tuần này tôi sẽ đến công viên Hangang cùng với bạn bè. Ở công viên Hangang tôi sẽ đạp xe. Và cũng sẽ ăn đồ ăn ngon. Tôi thích công viên Hangang. Vì phong cảnh đẹp. Buổi tối sẽ xem phim. Tôi thực sự mong chờ cuối tuần này!`,
    scoringCriteria: [
      { name: "Nội dung", desc: "Đủ thông tin kế hoạch", maxScore: 35 },
      { name: "Ngữ pháp", desc: "Dùng đúng thì tương lai", maxScore: 30 },
      { name: "Từ vựng", desc: "Đa dạng từ vựng", maxScore: 25 },
      { name: "Mạch lạc", desc: "Câu văn liên kết tốt", maxScore: 10 },
    ],
  },
  {
    id: "b1-1",
    level: "B1",
    topic: "Ưu và nhược điểm của mạng xã hội",
    title: "SNS의 장단점",
    titleVi: "Ưu và nhược điểm của mạng xã hội",
    instruction: "Viết một đoạn văn về ưu và nhược điểm của mạng xã hội. Đưa ra ít nhất 2 ưu điểm và 2 nhược điểm, kèm ví dụ cụ thể.",
    minWords: 100,
    maxWords: 180,
    hints: [
      "SNS의 장점은... — Ưu điểm của MXH là...",
      "반면에 단점도 있습니다. — Mặt khác cũng có nhược điểm.",
      "예를 들어... — Ví dụ như...",
      "따라서... — Do đó...",
      "결론적으로... — Kết luận là...",
    ],
    keyVocab: [
      { word: "장점", meaning: "Ưu điểm" },
      { word: "단점", meaning: "Nhược điểm" },
      { word: "소통", meaning: "Giao tiếp" },
      { word: "중독", meaning: "Nghiện" },
      { word: "정보", meaning: "Thông tin" },
    ],
    grammarPoints: ["-는 반면에 (trong khi đó)", "-(으)ㄹ 수 있다", "-기 때문에", "따라서/그러므로"],
    sampleAnswer: `SNS는 현대 사회에서 매우 중요한 역할을 합니다. 먼저 SNS의 장점을 살펴보겠습니다. 첫째, SNS를 통해 멀리 있는 친구나 가족과 쉽게 연락할 수 있습니다. 둘째, 다양한 정보를 빠르게 얻을 수 있습니다. 예를 들어 뉴스나 최신 트렌드를 실시간으로 확인할 수 있습니다.

반면에 단점도 있습니다. 첫째, SNS를 너무 많이 사용하면 중독될 수 있습니다. 둘째, 가짜 뉴스나 잘못된 정보가 빠르게 퍼질 수 있습니다. 따라서 SNS를 사용할 때는 올바른 정보를 구별하는 능력이 필요합니다.`,
    sampleAnswerVi: `MXH đóng vai trò rất quan trọng trong xã hội hiện đại. Trước tiên hãy xem xét ưu điểm của MXH. Thứ nhất, qua MXH có thể dễ dàng liên lạc với bạn bè hoặc gia đình ở xa. Thứ hai, có thể nhanh chóng nhận được nhiều thông tin đa dạng.

Mặt khác cũng có nhược điểm. Thứ nhất, nếu dùng MXH quá nhiều có thể bị nghiện. Thứ hai, tin giả hoặc thông tin sai có thể lan truyền nhanh. Do đó khi dùng MXH cần có khả năng phân biệt thông tin đúng.`,
    scoringCriteria: [
      { name: "Nội dung", desc: "Đủ 2 ưu + 2 nhược điểm", maxScore: 35 },
      { name: "Cấu trúc", desc: "Có mở-thân-kết rõ ràng", maxScore: 25 },
      { name: "Ngữ pháp", desc: "Dùng đúng cấu trúc B1", maxScore: 25 },
      { name: "Từ vựng", desc: "Từ vựng phong phú, chính xác", maxScore: 15 },
    ],
  },
  {
    id: "b2-1",
    level: "B2",
    topic: "Biến đổi khí hậu và trách nhiệm cá nhân",
    title: "기후 변화와 개인의 책임",
    titleVi: "Biến đổi khí hậu và trách nhiệm cá nhân",
    instruction: "Viết bài luận về biến đổi khí hậu và trách nhiệm của mỗi cá nhân. Đưa ra quan điểm cá nhân và các giải pháp cụ thể.",
    minWords: 180,
    maxWords: 280,
    hints: [
      "기후 변화는 심각한 문제입니다. — Biến đổi khí hậu là vấn đề nghiêm trọng.",
      "개인이 할 수 있는 일은... — Điều cá nhân có thể làm là...",
      "만약 우리가...하지 않는다면... — Nếu chúng ta không...",
      "이를 위해서는... — Để làm điều này...",
      "결국 중요한 것은... — Cuối cùng điều quan trọng là...",
    ],
    keyVocab: [
      { word: "기후 변화", meaning: "Biến đổi khí hậu" },
      { word: "탄소 배출", meaning: "Phát thải carbon" },
      { word: "재활용", meaning: "Tái chế" },
      { word: "에너지 절약", meaning: "Tiết kiệm năng lượng" },
      { word: "환경 보호", meaning: "Bảo vệ môi trường" },
    ],
    grammarPoints: ["-(으)ㄹ 텐데 (dự đoán lo ngại)", "-아/어야 하다 (phải)", "만약...-(으)면 (nếu)", "-(으)ㄹ 뿐만 아니라 (không chỉ...mà còn)"],
    sampleAnswer: `기후 변화는 현재 인류가 직면한 가장 심각한 문제 중 하나입니다. 지구 온도가 계속 상승하면서 극단적인 기상 현상이 증가하고 있습니다. 이 문제를 해결하기 위해서는 정부와 기업의 노력뿐만 아니라 개인의 책임 있는 행동도 매우 중요합니다.

개인이 할 수 있는 일은 생각보다 많습니다. 첫째, 일상생활에서 에너지를 절약할 수 있습니다. 예를 들어 사용하지 않는 전자기기의 전원을 끄거나 대중교통을 이용하는 것입니다. 둘째, 재활용을 철저히 하고 일회용품 사용을 줄여야 합니다.

만약 우리가 지금 행동하지 않는다면 미래 세대는 더 심각한 환경 문제를 겪게 될 것입니다. 결국 기후 변화 대응은 선택이 아닌 의무입니다. 작은 실천이 모여 큰 변화를 만들 수 있다고 생각합니다.`,
    sampleAnswerVi: `Biến đổi khí hậu là một trong những vấn đề nghiêm trọng nhất mà nhân loại đang đối mặt hiện nay. Khi nhiệt độ trái đất tiếp tục tăng, các hiện tượng thời tiết cực đoan ngày càng gia tăng. Để giải quyết vấn đề này, không chỉ cần nỗ lực của chính phủ và doanh nghiệp mà hành động có trách nhiệm của cá nhân cũng rất quan trọng.`,
    scoringCriteria: [
      { name: "Nội dung", desc: "Quan điểm rõ ràng, có dẫn chứng", maxScore: 30 },
      { name: "Cấu trúc", desc: "Bố cục bài luận hoàn chỉnh", maxScore: 25 },
      { name: "Ngữ pháp", desc: "Đa dạng cấu trúc B2", maxScore: 25 },
      { name: "Từ vựng", desc: "Từ học thuật, chính xác", maxScore: 20 },
    ],
  },
  {
    id: "c1-1",
    level: "C1",
    topic: "Toàn cầu hóa và bản sắc văn hóa",
    title: "세계화와 문화 정체성",
    titleVi: "Toàn cầu hóa và bản sắc văn hóa",
    instruction: "Viết bài luận phân tích tác động của toàn cầu hóa đến bản sắc văn hóa dân tộc. Đưa ra lập luận có chiều sâu với dẫn chứng cụ thể.",
    minWords: 250,
    maxWords: 400,
    hints: [
      "세계화는 양날의 검과 같습니다. — Toàn cầu hóa như con dao hai lưỡi.",
      "한편으로는...지만, 다른 한편으로는... — Một mặt...nhưng mặt khác...",
      "이러한 현상은...에서 비롯됩니다. — Hiện tượng này xuất phát từ...",
      "따라서 우리는...해야 할 것입니다. — Do đó chúng ta cần phải...",
    ],
    keyVocab: [
      { word: "세계화", meaning: "Toàn cầu hóa" },
      { word: "문화 정체성", meaning: "Bản sắc văn hóa" },
      { word: "동질화", meaning: "Đồng nhất hóa" },
      { word: "다양성", meaning: "Đa dạng" },
      { word: "전통 문화", meaning: "Văn hóa truyền thống" },
    ],
    grammarPoints: ["-(으)ㄹ수록 (càng...càng)", "-는 반면 (trong khi đó)", "-(으)ㄹ 뿐만 아니라", "에 불과하다 (chỉ là)"],
    sampleAnswer: `세계화가 가속화될수록 문화 정체성에 대한 논의는 더욱 중요해지고 있습니다. 세계화는 경제적 발전과 문화 교류를 촉진하는 긍정적인 측면이 있는 반면, 문화의 동질화를 초래할 수 있다는 우려도 있습니다.

한국의 경우를 살펴보면, K-팝과 한국 드라마의 세계적 인기는 한국 문화의 확산에 기여했습니다. 그러나 동시에 서구 문화의 영향으로 전통적인 가치관과 생활 방식이 변화하고 있습니다. 이는 단순히 한국만의 문제가 아니라 전 세계적인 현상입니다.

문화 정체성을 보존하기 위해서는 전통 문화를 현대적으로 재해석하는 노력이 필요합니다. 전통을 단순히 과거의 유물로 보는 것이 아니라, 현대 사회에서도 의미 있는 방식으로 계승하고 발전시켜야 합니다. 결국 세계화 시대에 문화 다양성을 유지하는 것은 인류 전체의 문화적 풍요로움을 위해 필수적입니다.`,
    sampleAnswerVi: `Khi toàn cầu hóa ngày càng tăng tốc, cuộc thảo luận về bản sắc văn hóa ngày càng trở nên quan trọng hơn. Toàn cầu hóa có mặt tích cực là thúc đẩy phát triển kinh tế và giao lưu văn hóa, nhưng cũng có lo ngại rằng nó có thể dẫn đến đồng nhất hóa văn hóa.`,
    scoringCriteria: [
      { name: "Lập luận", desc: "Sâu sắc, có chiều sâu phân tích", maxScore: 35 },
      { name: "Cấu trúc", desc: "Bài luận học thuật hoàn chỉnh", maxScore: 25 },
      { name: "Ngữ pháp", desc: "Cấu trúc phức tạp, đa dạng", maxScore: 25 },
      { name: "Từ vựng", desc: "Từ học thuật, chuyên ngành", maxScore: 15 },
    ],
  },
  {
    id: "c2-1",
    level: "C2",
    topic: "Triết học về hạnh phúc",
    title: "행복의 철학적 의미",
    titleVi: "Ý nghĩa triết học của hạnh phúc",
    instruction: "Viết bài luận triết học về ý nghĩa của hạnh phúc. Tham chiếu ít nhất một trường phái triết học và đưa ra quan điểm cá nhân có lập luận chặt chẽ.",
    minWords: 350,
    maxWords: 500,
    hints: [
      "행복이란 무엇인가? — Hạnh phúc là gì?",
      "아리스토텔레스에 따르면... — Theo Aristotle...",
      "이러한 관점에서 볼 때... — Nhìn từ quan điểm này...",
      "그러나 현대 사회에서는... — Tuy nhiên trong xã hội hiện đại...",
      "궁극적으로 행복은... — Cuối cùng hạnh phúc là...",
    ],
    keyVocab: [
      { word: "행복", meaning: "Hạnh phúc" },
      { word: "쾌락", meaning: "Khoái lạc" },
      { word: "덕", meaning: "Đức hạnh" },
      { word: "자아실현", meaning: "Tự thực hiện bản thân" },
      { word: "주관적", meaning: "Chủ quan" },
    ],
    grammarPoints: ["-(으)ㄹ 것이다 (văn viết)", "-다고 할 수 있다 (có thể nói rằng)", "-(으)ㄴ/는 반면에", "에 지나지 않다 (không gì hơn là)"],
    sampleAnswer: `행복이란 무엇인가? 이 질문은 인류가 오랫동안 탐구해 온 철학적 난제입니다. 아리스토텔레스는 행복을 단순한 쾌락이 아닌 '에우다이모니아', 즉 덕에 따른 활동으로 정의했습니다. 그에 따르면 진정한 행복은 자신의 잠재력을 최대한 발휘하며 덕스러운 삶을 사는 것에서 비롯됩니다.

반면 공리주의적 관점에서는 행복을 최대 다수의 최대 행복으로 정의합니다. 이 관점에서 행복은 개인적인 것이 아니라 사회적 맥락에서 이해되어야 합니다.

현대 심리학은 행복을 주관적 안녕감으로 측정하려 합니다. 그러나 이러한 접근은 행복을 단순히 긍정적 감정의 합으로 환원시킨다는 비판을 받습니다.

저는 행복이 단일한 상태가 아니라 지속적인 과정이라고 생각합니다. 의미 있는 관계를 맺고, 자신의 가치에 따라 살며, 성장을 추구하는 것—이것이 진정한 행복의 본질이 아닐까요? 궁극적으로 행복은 외부 조건이 아닌 내면의 태도에서 비롯된다고 할 수 있습니다.`,
    sampleAnswerVi: `Hạnh phúc là gì? Câu hỏi này là bài toán triết học mà nhân loại đã khám phá từ lâu. Aristotle định nghĩa hạnh phúc không phải là khoái lạc đơn thuần mà là 'eudaimonia', tức là hoạt động theo đức hạnh.`,
    scoringCriteria: [
      { name: "Chiều sâu triết học", desc: "Tham chiếu trường phái, lập luận sâu", maxScore: 35 },
      { name: "Cấu trúc học thuật", desc: "Bài luận hoàn chỉnh, mạch lạc", maxScore: 25 },
      { name: "Ngữ pháp nâng cao", desc: "Cấu trúc phức tạp, văn phong học thuật", maxScore: 25 },
      { name: "Từ vựng học thuật", desc: "Thuật ngữ triết học, chính xác", maxScore: 15 },
    ],
  },
];

const levelConfig: Record<string, { color: string; label: string }> = {
  A1: { color: "#34d399", label: "A1 - Sơ cấp" },
  A2: { color: "#6ee7b7", label: "A2 - Sơ cấp+" },
  B1: { color: "#fbbf24", label: "B1 - Trung cấp" },
  B2: { color: "#f59e0b", label: "B2 - Trung cấp+" },
  C1: { color: "#f87171", label: "C1 - Cao cấp" },
  C2: { color: "#e879f9", label: "C2 - Thành thạo" },
};

// ─── Score Calculator ─────────────────────────────────────────────────────────
function calculateScore(text: string, prompt: WritingPrompt): { total: number; breakdown: { name: string; score: number; max: number; feedback: string }[] } {
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const hasKorean = /[\uAC00-\uD7AF]/.test(text);

  const breakdown = prompt.scoringCriteria.map(c => {
    let score = 0;
    let feedback = "";

    if (c.name === "Độ dài" || c.name === "Nội dung") {
      if (wordCount >= prompt.minWords && wordCount <= prompt.maxWords) {
        score = c.maxScore;
        feedback = `Đủ độ dài (${wordCount} từ)`;
      } else if (wordCount < prompt.minWords) {
        score = Math.round(c.maxScore * 0.5);
        feedback = `Còn thiếu ${prompt.minWords - wordCount} từ`;
      } else {
        score = Math.round(c.maxScore * 0.8);
        feedback = `Hơi dài, nên rút gọn`;
      }
    } else if (c.name === "Ngữ pháp") {
      if (hasKorean && wordCount >= prompt.minWords * 0.7) {
        score = Math.round(c.maxScore * 0.8);
        feedback = "Cần kiểm tra lại cấu trúc câu";
      } else {
        score = Math.round(c.maxScore * 0.4);
        feedback = "Cần viết nhiều hơn bằng tiếng Hàn";
      }
    } else {
      score = hasKorean ? Math.round(c.maxScore * 0.75) : Math.round(c.maxScore * 0.3);
      feedback = hasKorean ? "Khá tốt, tiếp tục cải thiện" : "Hãy viết bằng tiếng Hàn";
    }

    return { name: c.name, score, max: c.maxScore, feedback };
  });

  const total = breakdown.reduce((s, b) => s + b.score, 0);
  return { total, breakdown };
}

// ─── Writing Editor ───────────────────────────────────────────────────────────
interface WritingEditorProps {
  prompt: WritingPrompt;
  onBack: () => void;
}

function WritingEditor({ prompt, onBack }: WritingEditorProps) {
  const [text, setText] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculateScore> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
  const cfg = levelConfig[prompt.level];
  const isEnough = wordCount >= prompt.minWords;

  const handleSubmit = () => {
    const r = calculateScore(text, prompt);
    setResult(r);
    setSubmitted(true);
  };

  const handleTTS = (t: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(t);
      utt.lang = "ko-KR";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm mb-5 cursor-pointer transition-colors">
        <i className="ri-arrow-left-line"></i> Quay lại
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-app-border bg-app-surface/50 p-5 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>{cfg.label}</span>
              <span className="text-app-text-muted text-xs">{prompt.topic}</span>
            </div>
            <h2 className="text-white font-bold text-xl">{prompt.title}</h2>
            <p className="text-white/50 text-sm">{prompt.titleVi}</p>
          </div>
          <div className="text-right text-xs text-app-text-secondary">
            <p>{prompt.minWords}–{prompt.maxWords} từ</p>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-app-card/50 border border-app-border">
          <p className="text-white/70 text-sm leading-relaxed">{prompt.instruction}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Editor */}
        <div className="lg:col-span-2">
          {!submitted ? (
            <div className="rounded-2xl border border-app-border bg-app-surface/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/60 text-sm font-medium">Bài viết của bạn</p>
                <span className={`text-xs font-bold ${isEnough ? "text-app-accent-success" : "text-app-text-secondary"}`}>
                  {wordCount} / {prompt.minWords}–{prompt.maxWords} từ
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Viết bài của bạn ở đây bằng tiếng Hàn..."
                rows={12}
                className="w-full bg-transparent text-white text-sm leading-8 outline-none resize-none placeholder-white/20"
              />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-app-border">
                <div className="h-1.5 flex-1 mr-4 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (wordCount / prompt.minWords) * 100)}%`, backgroundColor: isEnough ? "#34d399" : cfg.color }} />
                </div>
                <button onClick={handleSubmit} disabled={wordCount < 5}
                  className="px-6 py-2.5 rounded-xl bg-app-accent-primary text-[#141720] font-bold text-sm disabled:opacity-30 cursor-pointer whitespace-nowrap">
                  Nộp bài
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-app-border bg-app-surface/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white font-bold text-base">Kết quả chấm điểm</p>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${result && result.total >= 80 ? "bg-app-accent-success/15" : result && result.total >= 60 ? "bg-amber-500/15" : "bg-rose-500/15"}`}>
                  <span className={`text-xl font-bold ${result && result.total >= 80 ? "text-app-accent-success" : result && result.total >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                    {result?.total}
                  </span>
                </div>
              </div>
              {result && (
                <div className="space-y-3 mb-5">
                  {result.breakdown.map(b => (
                    <div key={b.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/70 text-xs font-medium">{b.name}</span>
                        <span className="text-white/60 text-xs">{b.score}/{b.max}</span>
                      </div>
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-1">
                        <div className="h-full rounded-full bg-app-accent-primary" style={{ width: `${(b.score / b.max) * 100}%` }} />
                      </div>
                      <p className="text-white/35 text-xs">{b.feedback}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="p-3 rounded-xl bg-app-card/50 border border-app-border mb-4">
                <p className="text-white/50 text-xs mb-2">Bài viết của bạn:</p>
                <p className="text-white/70 text-sm leading-7 whitespace-pre-wrap">{text}</p>
              </div>
              <button onClick={() => { setSubmitted(false); setResult(null); }}
                className="w-full py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-white/60 text-sm cursor-pointer whitespace-nowrap">
                Viết lại
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Key vocab */}
          <div className="rounded-xl border border-app-border bg-app-surface/50 p-4">
            <p className="text-white/60 text-xs font-semibold mb-3">Từ vựng gợi ý</p>
            <div className="space-y-2">
              {prompt.keyVocab.map((v, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleTTS(v.word)} className="w-5 h-5 flex items-center justify-center text-app-text-muted hover:text-white/60 cursor-pointer">
                      <i className="ri-volume-up-line text-xs"></i>
                    </button>
                    <span className="text-white/80 text-sm font-medium">{v.word}</span>
                  </div>
                  <span className="text-app-text-secondary text-xs">{v.meaning}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grammar points */}
          <div className="rounded-xl border border-app-border bg-app-surface/50 p-4">
            <p className="text-white/60 text-xs font-semibold mb-3">Ngữ pháp cần dùng</p>
            <div className="space-y-1.5">
              {prompt.grammarPoints.map((g, i) => (
                <div key={i} className="flex items-start gap-2">
                  <i className="ri-checkbox-circle-line text-app-accent-primary text-xs mt-0.5 flex-shrink-0"></i>
                  <span className="text-white/60 text-xs font-mono">{g}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hints toggle */}
          <button onClick={() => setShowHints(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-app-card/50 hover:bg-white/8 text-white/60 text-sm cursor-pointer transition-colors">
            <span><i className="ri-lightbulb-line mr-2 text-app-accent-primary"></i>Gợi ý câu mẫu</span>
            <i className={showHints ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
          </button>
          {showHints && (
            <div className="space-y-2">
              {prompt.hints.map((h, i) => (
                <div key={i} className="p-3 rounded-xl bg-app-surface/50 border border-app-border">
                  <p className="text-white/70 text-xs">{h}</p>
                </div>
              ))}
            </div>
          )}

          {/* Sample answer toggle */}
          <button onClick={() => setShowSample(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-app-accent-primary/5 hover:bg-app-accent-primary/10 border border-app-accent-primary/15 text-app-accent-primary text-sm cursor-pointer transition-colors">
            <span><i className="ri-file-text-line mr-2"></i>Bài mẫu tham khảo</span>
            <i className={showSample ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
          </button>
          {showSample && (
            <div className="p-4 rounded-xl bg-app-surface/50 border border-app-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/50 text-xs font-semibold">Bài mẫu</p>
                <button onClick={() => handleTTS(prompt.sampleAnswer)} className="text-app-text-muted hover:text-white/60 cursor-pointer">
                  <i className="ri-volume-up-line text-sm"></i>
                </button>
              </div>
              <p className="text-white/70 text-sm leading-7 mb-3">{prompt.sampleAnswer}</p>
              <p className="text-white/35 text-xs italic leading-6">{prompt.sampleAnswerVi}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WritingByLevelPage() {
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null);
  const [completedIds] = useState<Set<string>>(new Set());

  const filtered = selectedLevel === "all" ? prompts : prompts.filter(p => p.level === selectedLevel);

  if (selectedPrompt) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <WritingEditor prompt={selectedPrompt} onBack={() => setSelectedPrompt(null)} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-white font-bold text-2xl mb-1">Luyện viết theo cấp độ</h1>
          <p className="text-white/50 text-sm">Bài viết từ A1 đến C2 với gợi ý, từ vựng và chấm điểm tự động</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Bài viết", value: prompts.length, icon: "ri-quill-pen-line", color: "app-accent-primary" },
            { label: "Đã hoàn thành", value: completedIds.size, icon: "ri-checkbox-circle-line", color: "#34d399" },
            { label: "Cấp độ", value: "A1–C2", icon: "ri-bar-chart-line", color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-app-border bg-app-surface/50 p-4 text-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${s.color}20` }}>
                <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
              </div>
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setSelectedLevel("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${selectedLevel === "all" ? "bg-white/15 text-white" : "bg-app-card/50 text-white/50 hover:bg-white/8"}`}>
            Tất cả
          </button>
          {Object.entries(levelConfig).map(([lvl, cfg]) => (
            <button key={lvl} onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap`}
              style={selectedLevel === lvl ? { backgroundColor: cfg.color, color: "#141720" } : { backgroundColor: `${cfg.color}15`, color: cfg.color }}>
              {lvl}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => {
            const cfg = levelConfig[p.level];
            return (
              <button key={p.id} onClick={() => setSelectedPrompt(p)}
                className="text-left p-5 rounded-2xl border border-app-border bg-app-surface/50 hover:bg-app-card/50 hover:border-white/15 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>{cfg.label}</span>
                  <span className="text-app-text-muted text-xs">{p.minWords}–{p.maxWords} từ</span>
                </div>
                <h3 className="text-white font-bold text-base mb-1 group-hover:text-app-accent-primary transition-colors">{p.title}</h3>
                <p className="text-white/50 text-sm mb-3">{p.titleVi}</p>
                <p className="text-white/35 text-xs line-clamp-2 mb-3">{p.instruction}</p>
                <div className="flex items-center gap-3 text-app-text-muted text-xs">
                  <span><i className="ri-price-tag-3-line mr-1"></i>{p.topic}</span>
                  <span><i className="ri-lightbulb-line mr-1"></i>{p.hints.length} gợi ý</span>
                  <span><i className="ri-book-2-line mr-1"></i>{p.grammarPoints.length} ngữ pháp</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

