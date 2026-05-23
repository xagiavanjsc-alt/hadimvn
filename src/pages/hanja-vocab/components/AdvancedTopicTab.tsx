import { useState } from "react";
import { STORAGE_KEYS } from "@/lib/storageKeys";

interface TopicWord {
  korean: string;
  hanja: string;
  vietnamese: string;
  example?: string;
  exampleVi?: string;
}

interface AdvancedTopic {
  id: string;
  name: string;
  nameKo: string;
  icon: string;
  color: string;
  bg: string;
  description: string;
  words: TopicWord[];
}

const ADVANCED_TOPICS: AdvancedTopic[] = [
  {
    id: "economy",
    name: "Kinh tế",
    nameKo: "경제",
    icon: "ri-line-chart-line",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    description: "Từ vựng chuyên ngành kinh tế, tài chính, thương mại",
    words: [
      { korean: "경제성장", hanja: "經濟成長", vietnamese: "tăng trưởng kinh tế", example: "경제성장률이 높아졌다.", exampleVi: "Tỷ lệ tăng trưởng kinh tế đã tăng lên." },
      { korean: "물가상승", hanja: "物價上昇", vietnamese: "lạm phát giá cả", example: "물가상승으로 생활이 어려워졌다.", exampleVi: "Cuộc sống trở nên khó khăn do lạm phát." },
      { korean: "무역수지", hanja: "貿易收支", vietnamese: "cán cân thương mại", example: "무역수지 흑자를 기록했다.", exampleVi: "Ghi nhận thặng dư cán cân thương mại." },
      { korean: "재정적자", hanja: "財政赤字", vietnamese: "thâm hụt ngân sách", example: "재정적자가 심각한 수준이다.", exampleVi: "Thâm hụt ngân sách ở mức nghiêm trọng." },
      { korean: "금융위기", hanja: "金融危機", vietnamese: "khủng hoảng tài chính", example: "금융위기로 많은 기업이 도산했다.", exampleVi: "Nhiều doanh nghiệp phá sản do khủng hoảng tài chính." },
      { korean: "투자유치", hanja: "投資誘致", vietnamese: "thu hút đầu tư", example: "외국인 투자유치에 힘쓰고 있다.", exampleVi: "Đang nỗ lực thu hút đầu tư nước ngoài." },
      { korean: "수출입", hanja: "輸出入", vietnamese: "xuất nhập khẩu", example: "수출입 규모가 증가했다.", exampleVi: "Quy mô xuất nhập khẩu đã tăng lên." },
      { korean: "소비자물가", hanja: "消費者物價", vietnamese: "giá tiêu dùng", example: "소비자물가지수가 올랐다.", exampleVi: "Chỉ số giá tiêu dùng đã tăng." },
      { korean: "국내총생산", hanja: "國內總生産", vietnamese: "tổng sản phẩm quốc nội (GDP)", example: "국내총생산이 증가했다.", exampleVi: "GDP đã tăng lên." },
      { korean: "실업률", hanja: "失業率", vietnamese: "tỷ lệ thất nghiệp", example: "실업률이 낮아지고 있다.", exampleVi: "Tỷ lệ thất nghiệp đang giảm xuống." },
      { korean: "경기침체", hanja: "景氣沈滯", vietnamese: "suy thoái kinh tế", example: "경기침체로 소비가 줄었다.", exampleVi: "Tiêu dùng giảm do suy thoái kinh tế." },
      { korean: "부동산시장", hanja: "不動産市場", vietnamese: "thị trường bất động sản", example: "부동산시장이 과열되었다.", exampleVi: "Thị trường bất động sản đã quá nóng." },
      { korean: "주식시장", hanja: "株式市場", vietnamese: "thị trường chứng khoán", example: "주식시장이 급락했다.", exampleVi: "Thị trường chứng khoán đã giảm mạnh." },
      { korean: "환율변동", hanja: "換率變動", vietnamese: "biến động tỷ giá", example: "환율변동이 심하다.", exampleVi: "Biến động tỷ giá rất mạnh." },
      { korean: "세금감면", hanja: "稅金減免", vietnamese: "giảm miễn thuế", example: "중소기업에 세금감면 혜택을 준다.", exampleVi: "Cho doanh nghiệp vừa và nhỏ hưởng ưu đãi giảm thuế." },
    ],
  },
  {
    id: "health",
    name: "Y tế",
    nameKo: "의료",
    icon: "ri-heart-pulse-line",
    color: "text-app-accent-primary",
    bg: "bg-app-accent-primary/10",
    description: "Từ vựng y tế, sức khỏe, bệnh viện, điều trị",
    words: [
      { korean: "의료보험", hanja: "醫療保險", vietnamese: "bảo hiểm y tế", example: "의료보험에 가입했다.", exampleVi: "Đã tham gia bảo hiểm y tế." },
      { korean: "응급처치", hanja: "應急處置", vietnamese: "sơ cứu khẩn cấp", example: "응급처치를 받았다.", exampleVi: "Đã được sơ cứu khẩn cấp." },
      { korean: "전염병", hanja: "傳染病", vietnamese: "bệnh truyền nhiễm", example: "전염병 예방이 중요하다.", exampleVi: "Phòng ngừa bệnh truyền nhiễm rất quan trọng." },
      { korean: "수술실", hanja: "手術室", vietnamese: "phòng phẫu thuật", example: "수술실에서 수술을 받았다.", exampleVi: "Đã được phẫu thuật trong phòng mổ." },
      { korean: "진단서", hanja: "診斷書", vietnamese: "giấy chứng nhận y tế", example: "진단서를 발급받았다.", exampleVi: "Đã được cấp giấy chứng nhận y tế." },
      { korean: "처방전", hanja: "處方箋", vietnamese: "đơn thuốc", example: "처방전을 받아 약을 샀다.", exampleVi: "Nhận đơn thuốc và mua thuốc." },
      { korean: "입원치료", hanja: "入院治療", vietnamese: "điều trị nội trú", example: "입원치료가 필요하다.", exampleVi: "Cần điều trị nội trú." },
      { korean: "예방접종", hanja: "豫防接種", vietnamese: "tiêm phòng", example: "독감 예방접종을 맞았다.", exampleVi: "Đã tiêm phòng cúm." },
      { korean: "건강검진", hanja: "健康檢診", vietnamese: "khám sức khỏe định kỳ", example: "매년 건강검진을 받는다.", exampleVi: "Mỗi năm đi khám sức khỏe định kỳ." },
      { korean: "만성질환", hanja: "慢性疾患", vietnamese: "bệnh mãn tính", example: "만성질환 관리가 중요하다.", exampleVi: "Quản lý bệnh mãn tính rất quan trọng." },
      { korean: "정신건강", hanja: "精神健康", vietnamese: "sức khỏe tâm thần", example: "정신건강을 돌봐야 한다.", exampleVi: "Cần chăm sóc sức khỏe tâm thần." },
      { korean: "의약품", hanja: "醫藥品", vietnamese: "dược phẩm", example: "의약품 부작용에 주의해야 한다.", exampleVi: "Cần chú ý tác dụng phụ của dược phẩm." },
      { korean: "혈압측정", hanja: "血壓測定", vietnamese: "đo huyết áp", example: "혈압측정을 정기적으로 한다.", exampleVi: "Đo huyết áp định kỳ." },
      { korean: "수혈", hanja: "輸血", vietnamese: "truyền máu", example: "수술 중 수혈이 필요했다.", exampleVi: "Cần truyền máu trong khi phẫu thuật." },
      { korean: "재활치료", hanja: "再活治療", vietnamese: "phục hồi chức năng", example: "사고 후 재활치료를 받았다.", exampleVi: "Được phục hồi chức năng sau tai nạn." },
    ],
  },
  {
    id: "politics",
    name: "Chính trị",
    nameKo: "정치",
    icon: "ri-government-line",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    description: "Từ vựng chính trị, ngoại giao, quản trị nhà nước",
    words: [
      { korean: "민주주의", hanja: "民主主義", vietnamese: "chủ nghĩa dân chủ", example: "민주주의 사회에서 살고 있다.", exampleVi: "Đang sống trong xã hội dân chủ." },
      { korean: "국회의원", hanja: "國會議員", vietnamese: "nghị sĩ quốc hội", example: "국회의원 선거가 있다.", exampleVi: "Có cuộc bầu cử nghị sĩ quốc hội." },
      { korean: "외교정책", hanja: "外交政策", vietnamese: "chính sách ngoại giao", example: "외교정책을 강화했다.", exampleVi: "Đã tăng cường chính sách ngoại giao." },
      { korean: "헌법개정", hanja: "憲法改正", vietnamese: "sửa đổi hiến pháp", example: "헌법개정 논의가 활발하다.", exampleVi: "Thảo luận về sửa đổi hiến pháp rất sôi nổi." },
      { korean: "지방자치", hanja: "地方自治", vietnamese: "tự quản địa phương", example: "지방자치제도가 발전했다.", exampleVi: "Chế độ tự quản địa phương đã phát triển." },
      { korean: "정권교체", hanja: "政權交替", vietnamese: "thay đổi chính quyền", example: "정권교체가 이루어졌다.", exampleVi: "Đã diễn ra sự thay đổi chính quyền." },
      { korean: "국가안보", hanja: "國家安保", vietnamese: "an ninh quốc gia", example: "국가안보를 강화해야 한다.", exampleVi: "Cần tăng cường an ninh quốc gia." },
      { korean: "여론조사", hanja: "輿論調査", vietnamese: "thăm dò dư luận", example: "여론조사 결과가 발표됐다.", exampleVi: "Kết quả thăm dò dư luận đã được công bố." },
      { korean: "정치개혁", hanja: "政治改革", vietnamese: "cải cách chính trị", example: "정치개혁이 필요하다.", exampleVi: "Cần cải cách chính trị." },
      { korean: "국제관계", hanja: "國際關係", vietnamese: "quan hệ quốc tế", example: "국제관계가 복잡해졌다.", exampleVi: "Quan hệ quốc tế đã trở nên phức tạp." },
      { korean: "선거제도", hanja: "選擧制度", vietnamese: "chế độ bầu cử", example: "선거제도 개혁을 논의한다.", exampleVi: "Thảo luận về cải cách chế độ bầu cử." },
      { korean: "권력분립", hanja: "權力分立", vietnamese: "phân chia quyền lực", example: "권력분립이 민주주의의 기본이다.", exampleVi: "Phân chia quyền lực là nền tảng của dân chủ." },
      { korean: "시민사회", hanja: "市民社會", vietnamese: "xã hội dân sự", example: "시민사회의 역할이 중요하다.", exampleVi: "Vai trò của xã hội dân sự rất quan trọng." },
      { korean: "법치주의", hanja: "法治主義", vietnamese: "pháp quyền", example: "법치주의를 확립해야 한다.", exampleVi: "Cần thiết lập pháp quyền." },
      { korean: "통일정책", hanja: "統一政策", vietnamese: "chính sách thống nhất", example: "통일정책에 대한 논의가 있다.", exampleVi: "Có cuộc thảo luận về chính sách thống nhất." },
    ],
  },
  {
    id: "environment",
    name: "Môi trường",
    nameKo: "환경",
    icon: "ri-leaf-line",
    color: "text-green-400",
    bg: "bg-green-500/10",
    description: "Từ vựng môi trường, biến đổi khí hậu, năng lượng xanh",
    words: [
      { korean: "기후변화", hanja: "氣候變化", vietnamese: "biến đổi khí hậu", example: "기후변화 대응이 시급하다.", exampleVi: "Ứng phó biến đổi khí hậu là cấp bách." },
      { korean: "탄소배출", hanja: "炭素排出", vietnamese: "phát thải carbon", example: "탄소배출을 줄여야 한다.", exampleVi: "Cần giảm phát thải carbon." },
      { korean: "재생에너지", hanja: "再生energy", vietnamese: "năng lượng tái tạo", example: "재생에너지 사용이 늘고 있다.", exampleVi: "Việc sử dụng năng lượng tái tạo đang tăng lên." },
      { korean: "환경오염", hanja: "環境汚染", vietnamese: "ô nhiễm môi trường", example: "환경오염이 심각하다.", exampleVi: "Ô nhiễm môi trường rất nghiêm trọng." },
      { korean: "생태계", hanja: "生態系", vietnamese: "hệ sinh thái", example: "생태계 보호가 중요하다.", exampleVi: "Bảo vệ hệ sinh thái rất quan trọng." },
      { korean: "온실가스", hanja: "溫室gas", vietnamese: "khí nhà kính", example: "온실가스 감축 목표를 세웠다.", exampleVi: "Đã đặt mục tiêu giảm khí nhà kính." },
      { korean: "자연재해", hanja: "自然災害", vietnamese: "thiên tai", example: "자연재해 피해가 컸다.", exampleVi: "Thiệt hại do thiên tai rất lớn." },
      { korean: "수질오염", hanja: "水質汚染", vietnamese: "ô nhiễm nguồn nước", example: "수질오염 문제가 심각하다.", exampleVi: "Vấn đề ô nhiễm nguồn nước rất nghiêm trọng." },
      { korean: "대기오염", hanja: "大氣汚染", vietnamese: "ô nhiễm không khí", example: "대기오염으로 건강이 나빠졌다.", exampleVi: "Sức khỏe xấu đi do ô nhiễm không khí." },
      { korean: "친환경", hanja: "親環境", vietnamese: "thân thiện môi trường", example: "친환경 제품을 사용한다.", exampleVi: "Sử dụng sản phẩm thân thiện môi trường." },
    ],
  },
  {
    id: "technology",
    name: "Công nghệ",
    nameKo: "기술",
    icon: "ri-cpu-line",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    description: "Từ vựng công nghệ, AI, kỹ thuật số, đổi mới sáng tạo",
    words: [
      { korean: "인공지능", hanja: "人工知能", vietnamese: "trí tuệ nhân tạo (AI)", example: "인공지능 기술이 발전했다.", exampleVi: "Công nghệ trí tuệ nhân tạo đã phát triển." },
      { korean: "디지털전환", hanja: "digital轉換", vietnamese: "chuyển đổi số", example: "디지털전환이 가속화되고 있다.", exampleVi: "Chuyển đổi số đang được đẩy nhanh." },
      { korean: "반도체", hanja: "半導體", vietnamese: "chất bán dẫn", example: "반도체 산업이 중요하다.", exampleVi: "Ngành công nghiệp bán dẫn rất quan trọng." },
      { korean: "사이버보안", hanja: "cyber保安", vietnamese: "an ninh mạng", example: "사이버보안 강화가 필요하다.", exampleVi: "Cần tăng cường an ninh mạng." },
      { korean: "빅데이터", hanja: "big data", vietnamese: "dữ liệu lớn", example: "빅데이터 분석을 활용한다.", exampleVi: "Ứng dụng phân tích dữ liệu lớn." },
      { korean: "자율주행", hanja: "自律走行", vietnamese: "lái xe tự động", example: "자율주행 기술이 상용화됐다.", exampleVi: "Công nghệ lái xe tự động đã được thương mại hóa." },
      { korean: "블록체인", hanja: "blockchain", vietnamese: "chuỗi khối", example: "블록체인 기술을 도입했다.", exampleVi: "Đã áp dụng công nghệ blockchain." },
      { korean: "메타버스", hanja: "metaverse", vietnamese: "vũ trụ ảo", example: "메타버스 시장이 성장하고 있다.", exampleVi: "Thị trường vũ trụ ảo đang tăng trưởng." },
      { korean: "클라우드", hanja: "cloud", vietnamese: "điện toán đám mây", example: "클라우드 서비스를 이용한다.", exampleVi: "Sử dụng dịch vụ điện toán đám mây." },
      { korean: "스마트팩토리", hanja: "smart factory", vietnamese: "nhà máy thông minh", example: "스마트팩토리를 구축했다.", exampleVi: "Đã xây dựng nhà máy thông minh." },
    ],
  },
  {
    id: "law",
    name: "Pháp luật",
    nameKo: "법률",
    icon: "ri-scales-3-line",
    color: "text-slate-600",
    bg: "bg-slate-50",
    description: "Từ vựng pháp luật, tư pháp, quyền công dân",
    words: [
      { korean: "법률위반", hanja: "法律違反", vietnamese: "vi phạm pháp luật", example: "법률위반으로 처벌받았다.", exampleVi: "Bị xử phạt vì vi phạm pháp luật." },
      { korean: "재판절차", hanja: "裁判節次", vietnamese: "thủ tục xét xử", example: "재판절차가 복잡하다.", exampleVi: "Thủ tục xét xử rất phức tạp." },
      { korean: "기본권", hanja: "基本權", vietnamese: "quyền cơ bản", example: "기본권을 보장해야 한다.", exampleVi: "Cần đảm bảo quyền cơ bản." },
      { korean: "계약서", hanja: "契約書", vietnamese: "hợp đồng", example: "계약서에 서명했다.", exampleVi: "Đã ký hợp đồng." },
      { korean: "손해배상", hanja: "損害賠償", vietnamese: "bồi thường thiệt hại", example: "손해배상을 청구했다.", exampleVi: "Đã yêu cầu bồi thường thiệt hại." },
      { korean: "형사처벌", hanja: "刑事處罰", vietnamese: "xử phạt hình sự", example: "형사처벌을 받았다.", exampleVi: "Đã bị xử phạt hình sự." },
      { korean: "민사소송", hanja: "民事訴訟", vietnamese: "kiện dân sự", example: "민사소송을 제기했다.", exampleVi: "Đã đệ đơn kiện dân sự." },
      { korean: "지식재산권", hanja: "知識財産權", vietnamese: "quyền sở hữu trí tuệ", example: "지식재산권을 보호해야 한다.", exampleVi: "Cần bảo vệ quyền sở hữu trí tuệ." },
    ],
  },
];

function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

type QuizState = {
  words: TopicWord[];
  idx: number;
  choices: TopicWord[];
  answered: boolean;
  selected: string | null;
  score: number;
  done: boolean;
};

export default function AdvancedTopicTab() {
  const [selectedTopic, setSelectedTopic] = useState<AdvancedTopic | null>(null);
  const [mode, setMode] = useState<"browse" | "quiz">("browse");
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.HANJA_ADV_LEARNED) || "[]")); }
    catch { return new Set(); }
  });
  const [expandedWord, setExpandedWord] = useState<string | null>(null);

  const toggleLearned = (korean: string) => {
    setLearnedWords(prev => {
      const next = new Set(prev);
      next.has(korean) ? next.delete(korean) : next.add(korean);
      localStorage.setItem(STORAGE_KEYS.HANJA_ADV_LEARNED, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const startQuiz = (topic: AdvancedTopic) => {
    const shuffled = [...topic.words].sort(() => Math.random() - 0.5).slice(0, 10);
    const buildChoices = (entry: TopicWord) => {
      const others = topic.words.filter(w => w.korean !== entry.korean);
      return [...others.sort(() => Math.random() - 0.5).slice(0, 3), entry].sort(() => Math.random() - 0.5);
    };
    setQuiz({
      words: shuffled,
      idx: 0,
      choices: buildChoices(shuffled[0]),
      answered: false,
      selected: null,
      score: 0,
      done: false,
    });
    setMode("quiz");
  };

  const handleAnswer = (choice: TopicWord) => {
    if (!quiz || quiz.answered) return;
    const correct = choice.korean === quiz.words[quiz.idx].korean;
    setQuiz(prev => prev ? { ...prev, answered: true, selected: choice.korean, score: prev.score + (correct ? 1 : 0) } : null);
  };

  const nextQuestion = () => {
    if (!quiz) return;
    const nextIdx = quiz.idx + 1;
    if (nextIdx >= quiz.words.length) {
      setQuiz(prev => prev ? { ...prev, done: true } : null);
      return;
    }
    const buildChoices = (entry: TopicWord) => {
      const others = selectedTopic!.words.filter(w => w.korean !== entry.korean);
      return [...others.sort(() => Math.random() - 0.5).slice(0, 3), entry].sort(() => Math.random() - 0.5);
    };
    setQuiz(prev => prev ? { ...prev, idx: nextIdx, choices: buildChoices(quiz.words[nextIdx]), answered: false, selected: null } : null);
  };

  // Topic list view
  if (!selectedTopic) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-1">Học theo chủ đề nâng cao</h2>
          <p className="text-sm text-white/50">Từ vựng chuyên ngành với câu ví dụ thực tế từ báo chí và TOPIK</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ADVANCED_TOPICS.map(topic => {
            const learnedCount = topic.words.filter(w => learnedWords.has(w.korean)).length;
            const pct = Math.round((learnedCount / topic.words.length) * 100);
            return (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className="bg-app-surface/50 border border-app-border rounded-2xl p-5 cursor-pointer hover:border-app-accent-primary hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 flex items-center justify-center ${topic.bg} rounded-xl`}>
                    <i className={`${topic.icon} ${topic.color} text-xl`}></i>
                  </div>
                  <span className="text-xs text-white/40">{topic.words.length} từ</span>
                </div>
                <h3 className="font-bold text-white mb-0.5">{topic.name}</h3>
                <p className="text-sm text-white/40 mb-1">{topic.nameKo}</p>
                <p className="text-xs text-white/50 mb-3 line-clamp-2">{topic.description}</p>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>Đã học</span>
                    <span>{learnedCount}/{topic.words.length}</span>
                  </div>
                  <div className="w-full bg-app-surface/50 rounded-full h-1.5">
                    <div className="bg-app-accent-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${pct === 100 ? "text-green-400" : pct > 0 ? "text-amber-400" : "text-white/40"}`}>
                    {pct === 100 ? "Hoàn thành!" : pct > 0 ? `${pct}% hoàn thành` : "Chưa bắt đầu"}
                  </span>
                  <i className="ri-arrow-right-line text-white/30 group-hover:text-app-accent-primary transition-colors"></i>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Quiz mode
  if (mode === "quiz" && quiz) {
    if (quiz.done) {
      const pct = Math.round((quiz.score / quiz.words.length) * 100);
      return (
        <div className="max-w-lg mx-auto">
          <div className="bg-app-surface/50 border border-app-border rounded-2xl p-8 text-center">
            <div className={`w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4 ${pct >= 80 ? "bg-green-500/20" : pct >= 50 ? "bg-amber-500/20" : "bg-red-500/20"}`}>
              <i className={`text-3xl ${pct >= 80 ? "ri-trophy-line text-green-400" : pct >= 50 ? "ri-emotion-normal-line text-amber-400" : "ri-emotion-sad-line text-red-400"}`}></i>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{pct}%</p>
            <p className="text-white/50 mb-6">Đúng {quiz.score}/{quiz.words.length} câu — {selectedTopic.name}</p>
            <div className="flex gap-3">
              <button onClick={() => startQuiz(selectedTopic)} className="flex-1 py-3 bg-app-accent-primary text-white rounded-xl font-semibold cursor-pointer hover:bg-app-accent-primary/90 transition-colors">Làm lại</button>
              <button onClick={() => { setMode("browse"); setQuiz(null); }} className="flex-1 py-3 border border-app-border text-white/80 rounded-xl font-semibold cursor-pointer hover:bg-app-surface/50 transition-colors">Xem từ vựng</button>
            </div>
          </div>
        </div>
      );
    }

    const current = quiz.words[quiz.idx];
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { setMode("browse"); setQuiz(null); }} className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 cursor-pointer">
            <i className="ri-arrow-left-line"></i> Dừng quiz
          </button>
          <span className="text-sm text-white/50">{quiz.idx + 1}/{quiz.words.length}</span>
          <span className="text-sm font-semibold text-app-accent-primary">✓ {quiz.score}</span>
        </div>
        <div className="w-full bg-app-surface/50 rounded-full h-1.5 mb-6">
          <div className="bg-app-accent-primary h-1.5 rounded-full transition-all" style={{ width: `${(quiz.idx / quiz.words.length) * 100}%` }}></div>
        </div>
        <div className="bg-app-surface/50 border border-app-border rounded-2xl p-8 text-center mb-4">
          <p className="text-xs text-white/40 mb-2 tracking-wide">Từ tiếng Hàn này có nghĩa là gì?</p>
          <p className="text-4xl font-bold text-white mb-2">{current.korean}</p>
          <p className="text-xl text-app-accent-primary font-bold">{current.hanja}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quiz.choices.map((choice, i) => {
            let cls = "border-2 border-app-border bg-app-surface/50 text-white/80 hover:border-app-accent-primary";
            if (quiz.answered) {
              if (choice.korean === current.korean) cls = "border-2 border-green-400 bg-green-500/10 text-green-400";
              else if (choice.korean === quiz.selected) cls = "border-2 border-red-400 bg-red-500/10 text-red-400";
              else cls = "border-2 border-app-border bg-app-surface/30 text-white/40";
            }
            return (
              <button key={i} onClick={() => handleAnswer(choice)} disabled={quiz.answered}
                className={`p-4 rounded-xl text-sm font-medium cursor-pointer transition-all text-left ${cls} disabled:cursor-default`}>
                {quiz.answered && choice.korean === current.korean && <i className="ri-check-line text-green-400 mr-1"></i>}
                {quiz.answered && choice.korean === quiz.selected && choice.korean !== current.korean && <i className="ri-close-line text-red-400 mr-1"></i>}
                {choice.vietnamese}
              </button>
            );
          })}
        </div>
        {quiz.answered && (
          <div className="mt-4">
            <div className="bg-app-surface/30 rounded-xl p-3 mb-3 text-xs text-white/70">
              <p className="font-semibold mb-1">{current.korean} — {current.vietnamese}</p>
              {current.example && <p className="text-white/50 italic">{current.example}</p>}
              {current.exampleVi && <p className="text-white/40">{current.exampleVi}</p>}
            </div>
            <button onClick={nextQuestion} className="w-full py-3 bg-app-accent-primary text-white rounded-xl font-semibold cursor-pointer hover:bg-app-accent-primary/90 transition-colors">
              {quiz.idx + 1 >= quiz.words.length ? "Xem kết quả" : "Câu tiếp →"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Browse mode — word list
  const learnedCount = selectedTopic.words.filter(w => learnedWords.has(w.korean)).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => setSelectedTopic(null)} className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 cursor-pointer">
          <i className="ri-arrow-left-line"></i> Tất cả chủ đề
        </button>
        <div className={`w-8 h-8 flex items-center justify-center ${selectedTopic.bg} rounded-lg`}>
          <i className={`${selectedTopic.icon} ${selectedTopic.color} text-sm`}></i>
        </div>
        <div>
          <h2 className="font-bold text-white">{selectedTopic.name} <span className="text-white/40 font-normal text-sm">({selectedTopic.nameKo})</span></h2>
          <p className="text-xs text-white/50">{learnedCount}/{selectedTopic.words.length} từ đã học</p>
        </div>
        <button onClick={() => startQuiz(selectedTopic)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-app-accent-primary text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-app-accent-primary/90 transition-colors whitespace-nowrap">
          <i className="ri-gamepad-line"></i>Quiz chủ đề này
        </button>
      </div>

      {/* Progress */}
      <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 mb-5">
        <div className="flex justify-between text-xs text-white/50 mb-2">
          <span>Tiến độ học</span>
          <span>{learnedCount}/{selectedTopic.words.length} từ ({Math.round((learnedCount / selectedTopic.words.length) * 100)}%)</span>
        </div>
        <div className="w-full bg-app-surface/50 rounded-full h-2">
          <div className="bg-app-accent-primary h-2 rounded-full transition-all" style={{ width: `${(learnedCount / selectedTopic.words.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="space-y-3">
        {selectedTopic.words.map((word, i) => {
          const isLearned = learnedWords.has(word.korean);
          const isExpanded = expandedWord === word.korean;
          return (
            <div key={i} className={`bg-app-surface/50 border rounded-xl overflow-hidden transition-all ${isLearned ? "border-green-500/30" : "border-app-border"}`}>
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-app-surface/50 transition-colors"
                onClick={() => setExpandedWord(isExpanded ? null : word.korean)}
              >
                <div className="flex-1 flex items-center gap-3">
                  <div>
                    <span className="text-base font-bold text-white">{word.korean}</span>
                    <span className="text-app-accent-primary font-bold ml-2">{word.hanja}</span>
                  </div>
                  <span className="text-sm text-white/70">{word.vietnamese}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); speakKorean(word.korean); }}
                    className="w-7 h-7 flex items-center justify-center bg-app-surface/50 hover:bg-app-accent-primary/20 rounded-lg cursor-pointer transition-colors"
                  >
                    <i className="ri-volume-up-line text-white/50 text-xs"></i>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); toggleLearned(word.korean); }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${isLearned ? "bg-green-500/20 text-green-400" : "bg-app-surface/50 text-white/50 hover:bg-green-500/10 hover:text-green-400"}`}
                  >
                    <i className={isLearned ? "ri-check-double-line" : "ri-check-line"}></i>
                    {isLearned ? "Đã học" : "Đánh dấu"}
                  </button>
                  <i className={`text-white/40 text-sm transition-transform ${isExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
                </div>
              </div>
              {isExpanded && word.example && (
                <div className="px-4 pb-4 border-t border-app-border pt-3">
                  <div className="bg-app-accent-primary/10 rounded-lg p-3">
                    <p className="text-sm font-medium text-app-accent-primary mb-1">{word.example}</p>
                    <p className="text-xs text-app-accent-primary">{word.exampleVi}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
