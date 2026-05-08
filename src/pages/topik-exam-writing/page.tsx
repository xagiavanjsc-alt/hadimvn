import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

type QType = 51 | 52 | 53 | 54;

interface TopikWritingQ {
  id: string;
  year: number;
  session: number;
  qNum: QType;
  title: string;
  passage?: string;
  question: string;
  charLimit?: { min: number; max: number };
  sampleAnswer: string;
  scoringPoints?: string[];
}

const QUESTIONS: TopikWritingQ[] = [
  // ─── Q51 ─────────────────────────────────────────────────────────────────
  {
    id: "q51-2023-1",
    year: 2023, session: 1, qNum: 51,
    title: "빈칸 채우기 ㉠",
    passage: `사람들은 보통 스트레스를 나쁜 것으로 생각한다. 하지만 적당한 스트레스는 오히려 도움이 된다. 예를 들어 시험 전날 약간의 긴장감은 집중력을 높여 준다. ( ㉠ ). 따라서 스트레스를 무조건 피하려고 하기보다는 스트레스를 잘 관리하는 방법을 익히는 것이 중요하다.`,
    question: "㉠에 들어갈 알맞은 문장을 한 문장으로 쓰시오.",
    sampleAnswer: "그러므로 스트레스가 항상 나쁜 것만은 아니다.",
    scoringPoints: ["내용의 흐름에 맞는 연결 문장", "앞 내용을 정리하거나 결론을 이끄는 표현 사용"],
  },
  {
    id: "q51-2022-1",
    year: 2022, session: 1, qNum: 51,
    title: "빈칸 채우기 ㉠",
    passage: `현대인들은 바쁜 일상 속에서 운동을 하지 못하는 경우가 많다. 그런데 ( ㉠ ). 예를 들어 엘리베이터 대신 계단을 이용하거나 가까운 거리는 걸어 다니는 것도 좋은 방법이다. 이처럼 생활 속 작은 움직임들이 모여 건강한 몸을 만들 수 있다.`,
    question: "㉠에 들어갈 알맞은 문장을 한 문장으로 쓰시오.",
    sampleAnswer: "일상 속에서도 조금만 신경 쓰면 충분히 운동 효과를 얻을 수 있다.",
    scoringPoints: ["뒤에 이어지는 예시를 자연스럽게 이끄는 문장", "생활 속 운동 가능성을 제시하는 내용"],
  },
  {
    id: "q51-2021-2",
    year: 2021, session: 2, qNum: 51,
    title: "빈칸 채우기 ㉠",
    passage: `독서는 지식을 쌓는 데 도움이 될 뿐만 아니라 상상력과 창의력을 키워 준다. ( ㉠ ). 실제로 다양한 연구에서 독서를 즐기는 아이들이 그렇지 않은 아이들보다 어휘력과 문장 이해 능력이 훨씬 뛰어난 것으로 나타났다. 따라서 어릴 때부터 독서 습관을 들이는 것이 매우 중요하다.`,
    question: "㉠에 들어갈 알맞은 문장을 한 문장으로 쓰시오.",
    sampleAnswer: "특히 어린 시절에 독서를 많이 하면 언어 능력 발달에 큰 도움이 된다.",
    scoringPoints: ["앞 문장과 연결되는 추가 설명", "뒤의 연구 결과를 자연스럽게 이끄는 문장"],
  },
  // ─── Q52 ─────────────────────────────────────────────────────────────────
  {
    id: "q52-2023-1",
    year: 2023, session: 1, qNum: 52,
    title: "빈칸 채우기 ㉡",
    passage: `사람들은 보통 스트레스를 나쁜 것으로 생각한다. 하지만 적당한 스트레스는 오히려 도움이 된다. 예를 들어 시험 전날 약간의 긴장감은 집중력을 높여 준다. 그러므로 스트레스가 항상 나쁜 것만은 아니다. 따라서 스트레스를 무조건 피하려고 하기보다는 ( ㉡ ).`,
    question: "㉡에 들어갈 알맞은 문장을 한 문장으로 쓰시오.",
    sampleAnswer: "스트레스를 효과적으로 관리하는 방법을 배우는 것이 더 현명하다.",
    scoringPoints: ["결론 문장으로 앞 내용을 마무리하는 표현", "'피하기보다는' 뒤에 이어지는 대안 제시"],
  },
  {
    id: "q52-2022-1",
    year: 2022, session: 1, qNum: 52,
    title: "빈칸 채우기 ㉡",
    passage: `현대인들은 바쁜 일상 속에서 운동을 하지 못하는 경우가 많다. 그런데 일상 속에서도 조금만 신경 쓰면 충분히 운동 효과를 얻을 수 있다. 예를 들어 엘리베이터 대신 계단을 이용하거나 가까운 거리는 걸어 다니는 것도 좋은 방법이다. ( ㉡ ).`,
    question: "㉡에 들어갈 알맞은 문장을 한 문장으로 쓰시오.",
    sampleAnswer: "이처럼 생활 속 작은 습관 변화가 건강을 지키는 첫걸음이 될 수 있다.",
    scoringPoints: ["앞의 예시들을 종합하는 결론 문장", "생활 습관과 건강의 연결을 마무리하는 표현"],
  },
  {
    id: "q52-2021-2",
    year: 2021, session: 2, qNum: 52,
    title: "빈칸 채우기 ㉡",
    passage: `독서는 지식을 쌓는 데 도움이 될 뿐만 아니라 상상력과 창의력을 키워 준다. 특히 어린 시절에 독서를 많이 하면 언어 능력 발달에 큰 도움이 된다. 실제로 다양한 연구에서 독서를 즐기는 아이들이 그렇지 않은 아이들보다 어휘력과 문장 이해 능력이 훨씬 뛰어난 것으로 나타났다. ( ㉡ ).`,
    question: "㉡에 들어갈 알맞은 문장을 한 문장으로 쓰시오.",
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
    charLimit: { min: 200, max: 300 },
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
    charLimit: { min: 200, max: 300 },
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
    charLimit: { min: 200, max: 300 },
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
    charLimit: { min: 600, max: 700 },
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
    charLimit: { min: 600, max: 700 },
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
    charLimit: { min: 600, max: 700 },
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

export default function TopikExamWritingPage() {
  const [filterType, setFilterType] = useState<"all" | 51 | 52 | 53 | 54>("all");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [selectedQ, setSelectedQ] = useState<TopikWritingQ>(QUESTIONS[0]);
  const [text, setText] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const filtered = QUESTIONS.filter(q => {
    const typeOk = filterType === "all" || q.qNum === filterType;
    const yearOk = filterYear === "all" || q.year === filterYear;
    return typeOk && yearOk;
  });

  const handleSelect = (q: TopikWritingQ) => {
    setSelectedQ(q);
    setText("");
    setShowAnswer(false);
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

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="ri-draft-line text-app-accent-primary"></i>
            Luyện Viết TOPIK II
          </h1>
          <p className="text-white/45 text-sm mt-1">Đề thi thật — Câu 51, 52, 53, 54 qua các năm · Có đáp án tham khảo</p>
        </div>

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
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded font-bold border ${Q_COLORS[selectedQ.qNum]}`}>
                  Câu {selectedQ.qNum}
                </span>
                <span className="text-white/40 text-xs">{selectedQ.year} · Lần {selectedQ.session}</span>
                <span className="text-white/30 text-xs ml-auto">{Q_LABELS[selectedQ.qNum]}</span>
              </div>

              {selectedQ.passage && (
                <div className="bg-app-card/50 rounded-lg p-3 text-sm text-white/70 leading-relaxed whitespace-pre-line border-l-2 border-app-accent-primary/30">
                  {selectedQ.passage}
                </div>
              )}

              <p className="text-white text-sm font-medium">{selectedQ.question}</p>
            </div>

            {/* Writing area */}
            <div className="bg-[#1a1f2e] rounded-xl border border-app-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-app-border">
                <span className="text-white/40 text-xs">Bài viết của bạn</span>
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

            {/* Show answer toggle */}
            <button
              onClick={() => setShowAnswer(v => !v)}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all border whitespace-nowrap ${showAnswer ? "bg-app-card/50 border-app-border text-white/50" : "bg-app-accent-primary/10 border-app-accent-primary/25 text-app-accent-primary hover:bg-app-accent-primary/15"}`}
            >
              <i className={`${showAnswer ? "ri-eye-off-line" : "ri-eye-line"} mr-1.5`}></i>
              {showAnswer ? "Ẩn đáp án" : "Xem đáp án tham khảo"}
            </button>

            {showAnswer && (
              <div className="bg-[#1a1f2e] rounded-xl border border-green-500/20 p-4 space-y-3">
                <h3 className="text-green-400 text-sm font-semibold flex items-center gap-1.5">
                  <i className="ri-check-double-line"></i>
                  Đáp án tham khảo
                </h3>
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{selectedQ.sampleAnswer}</p>
                {selectedQ.scoringPoints && selectedQ.scoringPoints.length > 0 && (
                  <div className="pt-2 border-t border-app-border">
                    <p className="text-white/35 text-xs font-semibold mb-2">Tiêu chí chấm điểm:</p>
                    <ul className="space-y-1">
                      {selectedQ.scoringPoints.map((p, i) => (
                        <li key={i} className="text-xs text-white/45 flex items-start gap-1.5">
                          <span className="text-app-accent-primary mt-0.5 flex-shrink-0">•</span>
                          {p}
                        </li>
                      ))}
                    </ul>
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
