import { useState, useMemo } from "react";

interface ExampleWord {
  korean: string;
  hanja: string;
  vietnamese: string;
  level: "TOPIK1" | "TOPIK2" | "TOPIK3" | "TOPIK4" | "TOPIK5" | "TOPIK6";
  sentences: {
    korean: string;
    vietnamese: string;
    source: string; // "TOPIK", "Báo chí", "Hội thoại", "Văn học"
    highlight: string; // từ cần highlight trong câu
  }[];
  tip?: string;
}

const EXAMPLE_WORDS: ExampleWord[] = [
  {
    korean: "경제", hanja: "經濟", vietnamese: "Kinh tế", level: "TOPIK3",
    sentences: [
      { korean: "한국 경제는 빠르게 성장하고 있습니다.", vietnamese: "Kinh tế Hàn Quốc đang tăng trưởng nhanh chóng.", source: "Báo chí", highlight: "경제" },
      { korean: "세계 경제가 불안정한 상황입니다.", vietnamese: "Kinh tế thế giới đang trong tình trạng bất ổn.", source: "TOPIK", highlight: "경제" },
    ],
    tip: "경제(經濟) = kinh tế — giống hệt tiếng Việt!"
  },
  {
    korean: "사회", hanja: "社會", vietnamese: "Xã hội", level: "TOPIK3",
    sentences: [
      { korean: "현대 사회에서 스마트폰은 필수품이 되었습니다.", vietnamese: "Trong xã hội hiện đại, điện thoại thông minh đã trở thành vật dụng thiết yếu.", source: "Báo chí", highlight: "사회" },
      { korean: "사회 문제를 해결하기 위해 노력해야 합니다.", vietnamese: "Chúng ta phải nỗ lực để giải quyết các vấn đề xã hội.", source: "TOPIK", highlight: "사회" },
    ],
    tip: "사회(社會) = xã hội — đọc gần giống nhau!"
  },
  {
    korean: "문화", hanja: "文化", vietnamese: "Văn hóa", level: "TOPIK2",
    sentences: [
      { korean: "한국 문화는 전 세계적으로 인기를 끌고 있습니다.", vietnamese: "Văn hóa Hàn Quốc đang thu hút sự quan tâm trên toàn thế giới.", source: "Báo chí", highlight: "문화" },
      { korean: "다양한 문화를 이해하는 것이 중요합니다.", vietnamese: "Việc hiểu các nền văn hóa đa dạng là điều quan trọng.", source: "TOPIK", highlight: "문화" },
    ],
    tip: "문화(文化) = văn hóa — 문(文)=văn, 화(化)=hóa"
  },
  {
    korean: "교육", hanja: "敎育", vietnamese: "Giáo dục", level: "TOPIK3",
    sentences: [
      { korean: "교육은 미래를 위한 가장 중요한 투자입니다.", vietnamese: "Giáo dục là khoản đầu tư quan trọng nhất cho tương lai.", source: "TOPIK", highlight: "교육" },
      { korean: "한국의 교육열은 세계적으로 유명합니다.", vietnamese: "Nhiệt huyết giáo dục của Hàn Quốc nổi tiếng trên thế giới.", source: "Báo chí", highlight: "교육" },
    ],
    tip: "교육(敎育) = giáo dục — 교(敎)=giáo, 육(育)=dục"
  },
  {
    korean: "정치", hanja: "政治", vietnamese: "Chính trị", level: "TOPIK4",
    sentences: [
      { korean: "정치에 관심을 갖는 젊은이들이 늘고 있습니다.", vietnamese: "Ngày càng có nhiều người trẻ quan tâm đến chính trị.", source: "Báo chí", highlight: "정치" },
      { korean: "민주주의 정치 체제를 유지하는 것이 중요합니다.", vietnamese: "Việc duy trì thể chế chính trị dân chủ là điều quan trọng.", source: "TOPIK", highlight: "정치" },
    ],
    tip: "정치(政治) = chính trị — 정(政)=chính, 치(治)=trị"
  },
  {
    korean: "환경", hanja: "環境", vietnamese: "Môi trường", level: "TOPIK3",
    sentences: [
      { korean: "환경 보호는 우리 모두의 책임입니다.", vietnamese: "Bảo vệ môi trường là trách nhiệm của tất cả chúng ta.", source: "TOPIK", highlight: "환경" },
      { korean: "기후 변화로 인해 환경이 파괴되고 있습니다.", vietnamese: "Môi trường đang bị phá hủy do biến đổi khí hậu.", source: "Báo chí", highlight: "환경" },
    ],
    tip: "환경(環境) = hoàn cảnh/môi trường — 환(環)=hoàn, 경(境)=cảnh"
  },
  {
    korean: "발전", hanja: "發展", vietnamese: "Phát triển", level: "TOPIK3",
    sentences: [
      { korean: "기술의 발전으로 생활이 편리해졌습니다.", vietnamese: "Cuộc sống trở nên tiện lợi hơn nhờ sự phát triển của công nghệ.", source: "TOPIK", highlight: "발전" },
      { korean: "경제 발전을 위해 다양한 정책이 필요합니다.", vietnamese: "Cần có nhiều chính sách khác nhau để phát triển kinh tế.", source: "Báo chí", highlight: "발전" },
    ],
    tip: "발전(發展) = phát triển — 발(發)=phát, 전(展)=triển"
  },
  {
    korean: "국제", hanja: "國際", vietnamese: "Quốc tế", level: "TOPIK3",
    sentences: [
      { korean: "국제 사회에서 한국의 위상이 높아지고 있습니다.", vietnamese: "Vị thế của Hàn Quốc trong cộng đồng quốc tế ngày càng được nâng cao.", source: "Báo chí", highlight: "국제" },
      { korean: "국제 협력이 중요한 시대입니다.", vietnamese: "Đây là thời đại mà hợp tác quốc tế rất quan trọng.", source: "TOPIK", highlight: "국제" },
    ],
    tip: "국제(國際) = quốc tế — 국(國)=quốc, 제(際)=tế"
  },
  {
    korean: "민주주의", hanja: "民主主義", vietnamese: "Dân chủ chủ nghĩa", level: "TOPIK5",
    sentences: [
      { korean: "민주주의는 국민이 주인인 정치 체제입니다.", vietnamese: "Dân chủ là thể chế chính trị mà người dân là chủ nhân.", source: "TOPIK", highlight: "민주주의" },
      { korean: "민주주의를 지키기 위해 많은 사람들이 희생했습니다.", vietnamese: "Nhiều người đã hy sinh để bảo vệ nền dân chủ.", source: "Văn học", highlight: "민주주의" },
    ],
    tip: "민주주의(民主主義) = dân chủ chủ nghĩa — 4 chữ Hán đều giống tiếng Việt!"
  },
  {
    korean: "자유", hanja: "自由", vietnamese: "Tự do", level: "TOPIK2",
    sentences: [
      { korean: "자유는 인간의 기본적인 권리입니다.", vietnamese: "Tự do là quyền cơ bản của con người.", source: "TOPIK", highlight: "자유" },
      { korean: "언론의 자유를 보장해야 합니다.", vietnamese: "Phải đảm bảo tự do báo chí.", source: "Báo chí", highlight: "자유" },
    ],
    tip: "자유(自由) = tự do — 자(自)=tự, 유(由)=do"
  },
  {
    korean: "평화", hanja: "平和", vietnamese: "Hòa bình", level: "TOPIK3",
    sentences: [
      { korean: "세계 평화를 위해 모두가 노력해야 합니다.", vietnamese: "Tất cả mọi người phải nỗ lực vì hòa bình thế giới.", source: "TOPIK", highlight: "평화" },
      { korean: "한반도의 평화는 우리 모두의 소원입니다.", vietnamese: "Hòa bình trên bán đảo Triều Tiên là mong ước của tất cả chúng ta.", source: "Báo chí", highlight: "평화" },
    ],
    tip: "평화(平和) = bình hòa/hòa bình — đảo thứ tự so với tiếng Việt!"
  },
  {
    korean: "인권", hanja: "人權", vietnamese: "Nhân quyền", level: "TOPIK4",
    sentences: [
      { korean: "인권은 모든 사람이 태어날 때부터 갖는 권리입니다.", vietnamese: "Nhân quyền là quyền mà mọi người có từ khi sinh ra.", source: "TOPIK", highlight: "인권" },
      { korean: "인권 침해 문제가 심각합니다.", vietnamese: "Vấn đề vi phạm nhân quyền rất nghiêm trọng.", source: "Báo chí", highlight: "인권" },
    ],
    tip: "인권(人權) = nhân quyền — 인(人)=nhân, 권(權)=quyền"
  },
  {
    korean: "역사", hanja: "歷史", vietnamese: "Lịch sử", level: "TOPIK2",
    sentences: [
      { korean: "역사를 잊은 민족에게는 미래가 없습니다.", vietnamese: "Dân tộc nào quên lịch sử thì không có tương lai.", source: "Văn học", highlight: "역사" },
      { korean: "한국 역사는 5000년이 넘습니다.", vietnamese: "Lịch sử Hàn Quốc kéo dài hơn 5000 năm.", source: "Báo chí", highlight: "역사" },
    ],
    tip: "역사(歷史) = lịch sử — 역(歷)=lịch, 사(史)=sử"
  },
  {
    korean: "과학", hanja: "科學", vietnamese: "Khoa học", level: "TOPIK2",
    sentences: [
      { korean: "과학 기술의 발전이 우리 생활을 바꾸고 있습니다.", vietnamese: "Sự phát triển của khoa học kỹ thuật đang thay đổi cuộc sống của chúng ta.", source: "TOPIK", highlight: "과학" },
      { korean: "과학적 사고방식이 중요합니다.", vietnamese: "Cách tư duy khoa học rất quan trọng.", source: "Báo chí", highlight: "과학" },
    ],
    tip: "과학(科學) = khoa học — 과(科)=khoa, 학(學)=học"
  },
  {
    korean: "의료", hanja: "醫療", vietnamese: "Y tế", level: "TOPIK4",
    sentences: [
      { korean: "한국의 의료 수준은 세계 최고 수준입니다.", vietnamese: "Trình độ y tế của Hàn Quốc thuộc hàng đầu thế giới.", source: "Báo chí", highlight: "의료" },
      { korean: "의료 보험 제도가 잘 갖춰져 있습니다.", vietnamese: "Hệ thống bảo hiểm y tế được xây dựng tốt.", source: "TOPIK", highlight: "의료" },
    ],
    tip: "의료(醫療) = y liệu/y tế — 의(醫)=y, 료(療)=liệu"
  },
  {
    korean: "전통", hanja: "傳統", vietnamese: "Truyền thống", level: "TOPIK3",
    sentences: [
      { korean: "한국의 전통 문화를 보존해야 합니다.", vietnamese: "Cần bảo tồn văn hóa truyền thống của Hàn Quốc.", source: "TOPIK", highlight: "전통" },
      { korean: "전통과 현대가 조화를 이루고 있습니다.", vietnamese: "Truyền thống và hiện đại đang hòa hợp với nhau.", source: "Báo chí", highlight: "전통" },
    ],
    tip: "전통(傳統) = truyền thống — 전(傳)=truyền, 통(統)=thống"
  },
  {
    korean: "사건", hanja: "事件", vietnamese: "Sự kiện", level: "TOPIK3",
    sentences: [
      { korean: "어제 큰 사건이 발생했습니다.", vietnamese: "Hôm qua đã xảy ra một sự kiện lớn.", source: "Báo chí", highlight: "사건" },
      { korean: "이 사건은 역사적으로 중요한 의미를 가집니다.", vietnamese: "Sự kiện này có ý nghĩa quan trọng về mặt lịch sử.", source: "TOPIK", highlight: "사건" },
    ],
    tip: "사건(事件) = sự kiện — 사(事)=sự, 건(件)=kiện"
  },
  {
    korean: "감사", hanja: "感謝", vietnamese: "Cảm ơn", level: "TOPIK1",
    sentences: [
      { korean: "도와주셔서 감사합니다.", vietnamese: "Cảm ơn bạn đã giúp đỡ.", source: "Hội thoại", highlight: "감사" },
      { korean: "감사한 마음을 전하고 싶습니다.", vietnamese: "Tôi muốn truyền đạt lòng biết ơn.", source: "Hội thoại", highlight: "감사" },
    ],
    tip: "감사(感謝) = cảm tạ/cảm ơn — 감(感)=cảm, 사(謝)=tạ"
  },
  {
    korean: "행복", hanja: "幸福", vietnamese: "Hạnh phúc", level: "TOPIK2",
    sentences: [
      { korean: "행복은 작은 것에서 찾을 수 있습니다.", vietnamese: "Hạnh phúc có thể tìm thấy trong những điều nhỏ bé.", source: "Văn học", highlight: "행복" },
      { korean: "가족과 함께하는 시간이 가장 행복합니다.", vietnamese: "Thời gian bên gia đình là hạnh phúc nhất.", source: "Hội thoại", highlight: "행복" },
    ],
    tip: "행복(幸福) = hạnh phúc — 행(幸)=hạnh, 복(福)=phúc"
  },
  {
    korean: "희망", hanja: "希望", vietnamese: "Hy vọng", level: "TOPIK2",
    sentences: [
      { korean: "희망을 잃지 마세요.", vietnamese: "Đừng đánh mất hy vọng.", source: "Hội thoại", highlight: "희망" },
      { korean: "미래에 대한 희망을 가지고 살아가야 합니다.", vietnamese: "Chúng ta phải sống với hy vọng về tương lai.", source: "Văn học", highlight: "희망" },
    ],
    tip: "희망(希望) = hy vọng — 희(希)=hy, 망(望)=vọng"
  },
];

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  TOPIK1: { bg: "bg-emerald-500/10", text: "text-app-accent-success", border: "border-emerald-500/20" },
  TOPIK2: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20" },
  TOPIK3: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  TOPIK4: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  TOPIK5: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
  TOPIK6: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
};

const SOURCE_COLORS: Record<string, string> = {
  "TOPIK": "#a78bfa",
  "Báo chí": "#06b6d4",
  "Hội thoại": "#34d399",
  "Văn học": "#fb923c",
};

function highlightWord(sentence: string, word: string): React.ReactNode {
  const parts = sentence.split(word);
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && (
        <span className="text-amber-400 font-bold bg-amber-400/10 px-0.5 rounded">{word}</span>
      )}
    </span>
  ));
}

export default function ExampleSentenceTab() {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedWord, setExpandedWord] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [studyIdx, setStudyIdx] = useState(0);
  const [studyRevealed, setStudyRevealed] = useState(false);

  const levels = ["all", "TOPIK1", "TOPIK2", "TOPIK3", "TOPIK4", "TOPIK5", "TOPIK6"];
  const sources = ["all", "TOPIK", "Báo chí", "Hội thoại", "Văn học"];

  const filtered = useMemo(() => {
    let data = EXAMPLE_WORDS;
    if (selectedLevel !== "all") data = data.filter(w => w.level === selectedLevel);
    if (selectedSource !== "all") data = data.filter(w => w.sentences.some(s => s.source === selectedSource));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(w =>
        w.korean.includes(q) ||
        w.hanja.includes(q) ||
        w.vietnamese.toLowerCase().includes(q) ||
        w.sentences.some(s => s.korean.includes(q) || s.vietnamese.toLowerCase().includes(q))
      );
    }
    return data;
  }, [selectedLevel, selectedSource, search]);

  const studyPool = useMemo(() => [...EXAMPLE_WORDS].sort(() => Math.random() - 0.5), []);
  const currentStudy = studyPool[studyIdx % studyPool.length];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500/10 to-[#0f1117] border border-amber-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-amber-500/15 rounded-xl flex-shrink-0">
            <i className="ri-newspaper-line text-amber-400 text-xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-base mb-1">Học từ Hán-Hàn qua câu ví dụ thực tế</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Mỗi từ có <span className="text-amber-400 font-bold">1-2 câu ví dụ</span> từ đề thi TOPIK, báo chí Hàn Quốc và hội thoại thực tế. 
              Học trong ngữ cảnh giúp nhớ lâu hơn <span className="text-amber-400 font-bold">3-5 lần</span> so với học thuộc lòng!
            </p>
          </div>
          <button
            onClick={() => { setStudyMode(m => !m); setStudyIdx(0); setStudyRevealed(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap transition-all flex-shrink-0 ${studyMode ? "bg-amber-500 text-white" : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"}`}
          >
            <i className={studyMode ? "ri-close-line" : "ri-play-circle-line"}></i>
            {studyMode ? "Thoát học" : "Chế độ học"}
          </button>
        </div>
      </div>

      {/* Study mode */}
      {studyMode && (
        <div className="bg-app-bg border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <i className="ri-book-open-line text-amber-400"></i>Chế độ học theo câu ví dụ
            </h3>
            <span className="text-app-text-muted text-xs">{(studyIdx % studyPool.length) + 1}/{studyPool.length}</span>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Word card */}
            <div className="bg-app-surface/50 rounded-2xl p-5 mb-4 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-3xl font-bold text-white">{currentStudy.korean}</span>
                <span className="text-2xl font-bold text-rose-400">{currentStudy.hanja}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${LEVEL_COLORS[currentStudy.level].bg} ${LEVEL_COLORS[currentStudy.level].text}`}>
                  {currentStudy.level}
                </span>
              </div>
              {!studyRevealed ? (
                <button
                  onClick={() => setStudyRevealed(true)}
                  className="px-6 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 rounded-xl text-sm font-semibold cursor-pointer transition-all"
                >
                  Xem nghĩa & câu ví dụ
                </button>
              ) : (
                <div>
                  <p className="text-amber-400 font-bold text-lg mb-1">{currentStudy.vietnamese}</p>
                  {currentStudy.tip && (
                    <p className="text-app-text-secondary text-xs italic mb-3">{currentStudy.tip}</p>
                  )}
                </div>
              )}
            </div>

            {/* Sentences */}
            {studyRevealed && (
              <div className="space-y-3 mb-4">
                {currentStudy.sentences.map((s, i) => (
                  <div key={i} className="bg-app-surface/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${SOURCE_COLORS[s.source]}15`, color: SOURCE_COLORS[s.source] }}>
                        {s.source}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm font-medium mb-1.5 leading-relaxed">
                      {highlightWord(s.korean, s.highlight)}
                    </p>
                    <p className="text-app-text-secondary text-xs leading-relaxed">{s.vietnamese}</p>
                  </div>
                ))}
              </div>
            )}

            {studyRevealed && (
              <div className="flex gap-3">
                <button
                  onClick={() => { setStudyIdx(i => i + 1); setStudyRevealed(false); }}
                  className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-amber-600 transition-colors"
                >
                  Từ tiếp theo →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      {!studyMode && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
              <input
                type="text"
                placeholder="Tìm từ hoặc câu ví dụ..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-app-card/50 border border-app-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 placeholder-white/20"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1 bg-app-surface/50 p-1 rounded-xl">
              {levels.map(l => (
                <button
                  key={l}
                  onClick={() => setSelectedLevel(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${selectedLevel === l ? (l === "all" ? "bg-app-card/70 text-white" : `${LEVEL_COLORS[l]?.bg} ${LEVEL_COLORS[l]?.text}`) : "text-app-text-muted hover:text-white/50"}`}
                >
                  {l === "all" ? "Tất cả" : l}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-app-surface/50 p-1 rounded-xl">
              {sources.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSource(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${selectedSource === s ? "bg-app-card/70 text-white" : "text-app-text-muted hover:text-white/50"}`}
                >
                  {s === "all" ? "Tất cả nguồn" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Word list */}
          <div className="space-y-3">
            {filtered.map((word, i) => {
              const isExpanded = expandedWord === word.korean;
              const lvlCfg = LEVEL_COLORS[word.level];
              return (
                <div key={i} className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedWord(isExpanded ? null : word.korean)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white font-bold text-lg">{word.korean}</span>
                        <span className="text-rose-400 font-bold text-base">{word.hanja}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${lvlCfg.bg} ${lvlCfg.text} ${lvlCfg.border}`}>
                          {word.level}
                        </span>
                        <span className="text-app-text-secondary text-sm">{word.vietnamese}</span>
                      </div>
                      {word.tip && (
                        <p className="text-amber-400/60 text-xs mt-1 italic">{word.tip}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-app-text-muted text-xs">{word.sentences.length} câu</span>
                      <i className={`text-app-text-muted text-sm transition-transform ${isExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-app-border pt-4 space-y-3">
                      {word.sentences.map((s, j) => (
                        <div key={j} className="bg-app-surface/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                              style={{ backgroundColor: `${SOURCE_COLORS[s.source]}15`, color: SOURCE_COLORS[s.source] }}
                            >
                              {s.source}
                            </span>
                          </div>
                          <p className="text-white/80 text-sm font-medium mb-2 leading-relaxed">
                            {highlightWord(s.korean, s.highlight)}
                          </p>
                          <p className="text-app-text-secondary text-xs leading-relaxed border-t border-app-border pt-2">{s.vietnamese}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-app-text-muted">
              <i className="ri-search-line text-3xl mb-2 block"></i>
              <p className="text-sm">Không tìm thấy kết quả</p>
            </div>
          )}
        </>
      )}

      {/* Tip */}
      <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
        <p className="text-app-text-secondary text-xs font-semibold mb-1 flex items-center gap-1.5">
          <i className="ri-information-line text-app-text-muted"></i>Về nguồn câu ví dụ
        </p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(SOURCE_COLORS).map(([src, color]) => (
            <div key={src} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-app-text-muted text-xs">{src}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
