import { useState, useMemo } from "react";
import { HanjaEntry } from "@/mocks/hanjaData";
import { useHanjaData } from "@/contexts/HanjaDataContext";

const SR_KEY = "hanja_sr_data";

interface SRCard {
  korean: string;
  interval: number;
  easeFactor: number;
  dueDate: number;
  totalReviews: number;
  correctStreak: number;
}

function getMasteryLevel(korean: string, srData: Record<string, SRCard>): "new" | "learning" | "mastered" {
  const card = srData[korean];
  if (!card) return "new";
  if (card.interval >= 21) return "mastered";
  return "learning";
}

// ─── Topic definitions ────────────────────────────────────────────────────────
interface Topic {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  keywords: string[];
}

const TOPICS: Topic[] = [
  {
    id: "military",
    label: "Quân sự",
    icon: "ri-sword-line",
    color: "text-red-400",
    bg: "bg-red-500/10",
    keywords: ["군", "병", "전", "무", "사관", "사단", "사령", "사병", "군인", "군사", "공군", "해군", "육군", "포병", "공병", "항공", "항전", "항해", "전쟁", "전투", "진군", "행군", "대군", "반군", "파병", "포격", "폭동", "폭력", "폭행", "무력", "무기", "흉기", "훈련", "훈장", "휴전", "항거", "항고", "항생", "항의", "해군", "해병", "해적", "중위", "중장", "하사관", "대장", "대대", "중대", "소대", "벌형", "처형", "처벌", "사형", "탄압", "투쟁", "투항", "파견", "파병", "반란", "반격", "반공", "독립", "독재", "혁명", "전략", "전술"],
  },
  {
    id: "medical",
    label: "Y tế",
    icon: "ri-heart-pulse-line",
    color: "text-app-accent-primary",
    bg: "bg-app-accent-primary/10",
    keywords: ["병", "의", "약", "치", "건강", "간호", "간염", "감기", "감염", "내과", "외과", "산부인과", "해부", "해독", "해방", "혈관", "혈구", "혈맥", "혈압", "혈육", "혈통", "생리", "생명", "생물", "생존", "생태", "세균", "살균", "살충", "독", "독성", "독소", "중독", "해독", "면역", "면역", "태아", "산모", "산부", "산아", "환자", "환기", "침수", "침입", "침착", "침해", "폐", "폐병", "폐인", "흡수", "뇌", "뇌신경", "당뇨병", "백혈구", "백혈병", "급성", "만성", "발열", "발진", "미열", "구급", "구조", "구호", "응급", "수술", "처방", "처리", "진단", "검사", "검진"],
  },
  {
    id: "education",
    label: "Giáo dục",
    icon: "ri-graduation-cap-line",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    keywords: ["학", "교", "사범", "교육", "교수", "교사", "학교", "학생", "학습", "학문", "학력", "학년", "학기", "학비", "학위", "학자", "학점", "학제", "학칙", "학원", "학식", "학설", "학술", "대학", "대학원", "석사", "박사", "졸업", "입학", "수업", "강의", "강사", "교재", "교과", "교실", "도서관", "연구", "논문", "논리", "지식", "지능", "지도", "지시", "지식", "지역", "지원", "직무", "직원", "직책", "직분", "직속", "직접", "직계", "직권", "설계", "설립", "설교", "성적", "성공", "성과", "성실", "성심", "성의", "성년", "성인"],
  },
  {
    id: "politics",
    label: "Chính trị",
    icon: "ri-government-line",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    keywords: ["정", "국", "민", "권", "법", "정치", "정부", "정책", "정당", "정권", "국가", "국민", "국회", "국방", "국제", "국내", "국립", "국무", "국어", "국적", "민주", "민족", "민중", "민간", "민심", "민의", "권력", "권리", "권한", "법률", "법원", "헌법", "헌병", "헌장", "선거", "선언", "선고", "투표", "투쟁", "외교", "외무", "대사", "대사관", "대표", "대통령", "총리", "장관", "의원", "의회", "상원", "하원", "행정", "행정부", "사법", "사법부", "입법", "통치", "통일", "통제", "독립", "독재", "혁명", "반란", "반정부", "반체제", "항거", "항의", "항전"],
  },
  {
    id: "economy",
    label: "Kinh tế",
    icon: "ri-money-dollar-circle-line",
    color: "text-green-400",
    bg: "bg-green-500/10",
    keywords: ["경제", "경영", "경쟁", "상업", "상인", "상무", "상품", "무역", "무역", "산업", "산출", "생산", "수출", "수입", "투자", "투자", "금융", "금지", "세금", "세관", "세계", "화폐", "통화", "통상", "통계", "판매", "판단", "판결", "파산", "파괴", "포함", "포기", "평가", "평균", "비용", "비율", "비중", "비준", "특산", "특혜", "특권", "특별", "특성", "특수", "특유", "특정", "특종", "특파", "특급", "특명", "할당", "합작", "합법", "합리", "합력", "합당", "합창", "회사", "회계", "회비", "회원", "회의", "회장", "황금", "황실", "황족"],
  },
  {
    id: "society",
    label: "Xã hội",
    icon: "ri-team-line",
    color: "text-teal-600",
    bg: "bg-teal-50",
    keywords: ["사회", "사람", "사건", "사고", "사실", "사용", "사원", "사유", "사임", "사장", "사정", "사직", "사치", "사태", "사망", "사면", "사명", "사범", "사법", "사병", "사본", "사부", "사상", "사수", "사신", "사교", "사관", "사단", "사령", "사례", "사립", "사막", "사망률", "가족", "가정", "결혼", "이혼", "혼인", "혼례", "혼약", "처녀", "처리", "처지", "처형", "처벌", "노동", "노력", "노예", "노인", "노화", "농민", "농업", "농촌", "농장", "공동", "공민", "공중", "공평", "공화", "공정", "공개", "공고", "공인", "공립", "공원", "공연", "공업", "공급", "공간", "공감"],
  },
  {
    id: "culture",
    label: "Văn hóa",
    icon: "ri-palette-line",
    color: "text-violet-600",
    bg: "bg-violet-50",
    keywords: ["문화", "문학", "문명", "문서", "문장", "문인", "문헌", "예술", "예능", "음악", "음악", "성악", "성가", "성경", "종교", "종교", "불교", "기독교", "천당", "천명", "천문", "천벌", "천부", "선교", "선교사", "선녀", "선인", "설교", "성당", "성모", "성인", "성혼", "성행", "성패", "성의", "성심", "성실", "성사", "성분", "성문", "성능", "성년", "성과", "성공", "성격", "성가", "전통", "전설", "전래", "민요", "민담", "민간", "민족", "민중", "민주", "민심", "민의", "민증", "민지", "민립", "민단", "민망"],
  },
  {
    id: "nature",
    label: "Thiên nhiên",
    icon: "ri-leaf-line",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    keywords: ["자연", "산", "강", "바다", "하늘", "땅", "물", "불", "바람", "태양", "태양계", "태평양", "지구", "지형", "지진", "지중해", "지리", "지역", "지방", "해양", "해류", "해리", "해마", "해삼", "해적", "해방", "해부", "해산", "해답", "해독", "해로", "해군", "해병", "해체", "해학", "풍경", "풍부", "풍상", "풍속", "풍토", "생태", "생물", "생존", "생산", "생식", "생리", "생명", "생사", "생", "토양", "토인", "토론", "석탄", "석사", "산호", "산하", "산신", "산아", "산업", "산출", "산란", "산모", "산물", "산발", "산부"],
  },
  {
    id: "emotion",
    label: "Cảm xúc",
    icon: "ri-emotion-line",
    color: "text-pink-600",
    bg: "bg-pink-50",
    keywords: ["감정", "감동", "감격", "감각", "감기", "감면", "감속", "기분", "기대", "기억", "기회", "기쁨", "슬픔", "분노", "공포", "희망", "희생", "흥미", "흥분", "흥망", "행복", "행복", "혜택", "호감", "호기심", "호의", "혼돈", "혼란", "혼미", "혼비백산", "혼수", "혼약", "혼인", "혼잡", "혼전", "혼합", "상상", "상사", "상사병", "상실", "상쾌", "상태", "상황", "상호", "추억", "추상", "추진", "추천", "추가", "추세", "추수", "추석", "쾌락", "타당", "타도", "타의", "타향", "타협", "탄복", "탄생", "탄압", "탐험", "태도", "태만", "태연", "태평", "편견", "편안", "편집"],
  },
];

function getTopicWords(data: HanjaEntry[], topic: Topic): HanjaEntry[] {
  return data.filter(entry =>
    topic.keywords.some(kw =>
      entry.korean.includes(kw) ||
      entry.vietnamese.toLowerCase().includes(kw.toLowerCase())
    )
  );
}

function MasteryBadge({ level }: { level: "new" | "learning" | "mastered" }) {
  if (level === "new") return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-app-surface/50 text-white/50">
      <i className="ri-seedling-line text-xs"></i>Mới
    </span>
  );
  if (level === "learning") return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400">
      <i className="ri-book-open-line text-xs"></i>Đang học
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">
      <i className="ri-check-double-line text-xs"></i>Đã thuộc
    </span>
  );
}

export default function TopicStudyTab() {
  const HANJA_DATA = useHanjaData();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [search, setSearch] = useState("");
  const [quizMode, setQuizMode] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [quizResults, setQuizResults] = useState<{ known: number; unknown: number }>({ known: 0, unknown: 0 });
  const [quizDone, setQuizDone] = useState(false);

  const [srData] = useState<Record<string, SRCard>>(() => {
    try { return JSON.parse(localStorage.getItem(SR_KEY) || "{}"); } catch { return {}; }
  });

  const topicWords = useMemo(() => {
    if (!selectedTopic) return [];
    return getTopicWords(HANJA_DATA, selectedTopic);
  }, [selectedTopic, HANJA_DATA]);

  const filteredWords = useMemo(() => {
    if (!search.trim()) return topicWords;
    const q = search.toLowerCase();
    return topicWords.filter(w =>
      w.korean.includes(q) || w.hanja.includes(q) || w.vietnamese.toLowerCase().includes(q)
    );
  }, [topicWords, search]);

  const topicStats = useMemo(() => {
    return TOPICS.map(t => {
      const words = getTopicWords(HANJA_DATA, t);
      const mastered = words.filter(w => getMasteryLevel(w.korean, srData) === "mastered").length;
      return { ...t, total: words.length, mastered, pct: words.length > 0 ? Math.round((mastered / words.length) * 100) : 0 };
    });
  }, [srData, HANJA_DATA]);

  const startQuiz = () => {
    setQuizIdx(0);
    setRevealed(false);
    setQuizResults({ known: 0, unknown: 0 });
    setQuizDone(false);
    setQuizMode(true);
  };

  const handleQuizAnswer = (known: boolean) => {
    setQuizResults(prev => ({
      known: prev.known + (known ? 1 : 0),
      unknown: prev.unknown + (known ? 0 : 1),
    }));
    const next = quizIdx + 1;
    if (next >= filteredWords.length) {
      setQuizDone(true);
    } else {
      setQuizIdx(next);
      setRevealed(false);
    }
  };

  // Quiz mode
  if (quizMode && selectedTopic) {
    if (quizDone) {
      const pct = filteredWords.length > 0 ? Math.round((quizResults.known / filteredWords.length) * 100) : 0;
      return (
        <div className="max-w-lg mx-auto">
          <div className="bg-app-surface/50 border border-app-border rounded-2xl p-8 text-center">
            <div className={`w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4 ${pct >= 80 ? "bg-green-500/20" : pct >= 50 ? "bg-amber-500/20" : "bg-red-500/20"}`}>
              <i className={`text-3xl ${pct >= 80 ? "ri-trophy-line text-green-400" : pct >= 50 ? "ri-emotion-normal-line text-amber-400" : "ri-emotion-sad-line text-red-400"}`}></i>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{pct}%</h3>
            <p className="text-white/50 mb-2">Biết {quizResults.known} / {filteredWords.length} từ chủ đề <strong>{selectedTopic.label}</strong></p>
            <p className="text-sm text-white/40 mb-8">
              {pct >= 80 ? "Xuất sắc! Bạn nắm rất tốt chủ đề này!" : pct >= 50 ? "Khá tốt! Tiếp tục luyện tập nhé!" : "Cần ôn thêm! Đừng nản lòng!"}
            </p>
            <div className="flex gap-3">
              <button onClick={startQuiz} className="flex-1 py-3 bg-app-accent-primary text-white rounded-xl font-semibold cursor-pointer hover:bg-app-accent-primary/90 transition-colors">Ôn lại</button>
              <button onClick={() => setQuizMode(false)} className="flex-1 py-3 border border-app-border text-white/80 rounded-xl font-semibold cursor-pointer hover:bg-app-surface/50 transition-colors">Xem từ vựng</button>
            </div>
          </div>
        </div>
      );
    }

    const card = filteredWords[quizIdx];
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setQuizMode(false)} className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 cursor-pointer">
            <i className="ri-arrow-left-line"></i> Dừng
          </button>
          <span className="text-sm text-white/50">{quizIdx + 1} / {filteredWords.length}</span>
          <span className="text-xs text-green-400 font-medium">✓ {quizResults.known} &nbsp; ✗ {quizResults.unknown}</span>
        </div>
        <div className="w-full bg-app-surface/50 rounded-full h-1.5 mb-6">
          <div className="bg-app-accent-primary h-1.5 rounded-full transition-all" style={{ width: `${(quizIdx / filteredWords.length) * 100}%` }}></div>
        </div>
        <div className="bg-app-surface/50 border-2 border-app-border rounded-2xl p-8 text-center mb-4">
          <p className="text-4xl font-bold text-white mb-2">{card.korean}</p>
          <p className="text-xl text-app-accent-primary font-bold mb-4">{card.hanja}</p>
          {!revealed ? (
            <button onClick={() => setRevealed(true)}
              className="px-6 py-2 bg-app-surface/50 text-white/70 rounded-lg text-sm cursor-pointer hover:bg-app-surface/80 transition-colors">
              Hiện nghĩa
            </button>
          ) : (
            <div className="border-t border-app-border pt-4">
              <p className="text-xl font-semibold text-white/80">{card.vietnamese}</p>
            </div>
          )}
        </div>
        {revealed && (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleQuizAnswer(false)}
              className="py-4 rounded-xl border-2 border-red-500/40 bg-red-500/10 text-red-400 font-bold cursor-pointer hover:bg-red-500/100/20 transition-colors">
              <i className="ri-close-line mr-1"></i>Chưa biết
            </button>
            <button onClick={() => handleQuizAnswer(true)}
              className="py-4 rounded-xl border-2 border-green-500/40 bg-green-500/10 text-green-400 font-bold cursor-pointer hover:bg-green-500/100/20 transition-colors">
              <i className="ri-check-line mr-1"></i>Đã biết
            </button>
          </div>
        )}
      </div>
    );
  }

  // Topic detail view
  if (selectedTopic) {
    const stats = topicStats.find(t => t.id === selectedTopic.id)!;
    return (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => { setSelectedTopic(null); setSearch(""); }}
            className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 cursor-pointer">
            <i className="ri-arrow-left-line"></i> Tất cả chủ đề
          </button>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${selectedTopic.bg}`}>
            <i className={`${selectedTopic.icon} ${selectedTopic.color}`}></i>
            <span className={`text-sm font-semibold ${selectedTopic.color}`}>{selectedTopic.label}</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white/80">{stats.total} từ trong chủ đề</span>
            <span className="text-sm text-green-400 font-medium">{stats.mastered} đã thuộc ({stats.pct}%)</span>
          </div>
          <div className="w-full bg-app-surface/50 rounded-full h-2.5">
            <div className="bg-green-400 h-2.5 rounded-full transition-all" style={{ width: `${stats.pct}%` }}></div>
          </div>
          <div className="flex gap-3 mt-3">
            <span className="text-xs text-white/40">Mới: {stats.total - stats.mastered - topicWords.filter(w => getMasteryLevel(w.korean, srData) === "learning").length}</span>
            <span className="text-xs text-amber-400">Đang học: {topicWords.filter(w => getMasteryLevel(w.korean, srData) === "learning").length}</span>
            <span className="text-xs text-green-400">Đã thuộc: {stats.mastered}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm"></i>
            <input type="text" placeholder="Tìm trong chủ đề..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-app-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>
          <button onClick={startQuiz} disabled={filteredWords.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-app-accent-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-app-accent-primary/90 transition-colors whitespace-nowrap disabled:opacity-50">
            <i className="ri-flashlight-line"></i>Ôn tập nhanh ({filteredWords.length} từ)
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredWords.map((item, i) => {
            const mastery = getMasteryLevel(item.korean, srData);
            return (
              <div key={i} className="bg-app-surface/50 border border-app-border rounded-xl p-4 hover:border-app-accent-primary transition-all">
                <div className="mb-2">
                  <span className="text-base font-bold text-white block">{item.korean}</span>
                  <span className="text-xl font-bold text-app-accent-primary">{item.hanja}</span>
                </div>
                <p className="text-xs text-white/50 mb-2">{item.vietnamese}</p>
                <MasteryBadge level={mastery} />
              </div>
            );
          })}
        </div>

        {filteredWords.length === 0 && (
          <div className="text-center py-16 text-white/40">
            <i className="ri-search-line text-4xl"></i>
            <p className="mt-2 text-sm">Không tìm thấy từ nào</p>
          </div>
        )}
      </div>
    );
  }

  // Topic list view
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white mb-1">Ôn tập theo chủ đề</h2>
        <p className="text-sm text-white/50">Chọn chủ đề để học từ vựng theo nhóm ngữ nghĩa</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {topicStats.map(topic => (
          <button key={topic.id} onClick={() => setSelectedTopic(topic)}
            className="bg-app-surface/50 border border-app-border rounded-2xl p-5 text-left hover:border-app-accent-primary hover:shadow-sm transition-all cursor-pointer group">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${topic.bg} flex-shrink-0`}>
                <i className={`${topic.icon} ${topic.color} text-xl`}></i>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{topic.label}</h3>
                <p className="text-xs text-white/40">{topic.total} từ</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-white/40 mb-1">
                <span>Tiến độ</span>
                <span className={topic.pct >= 80 ? "text-green-400 font-medium" : topic.pct >= 40 ? "text-amber-400 font-medium" : "text-white/40"}>
                  {topic.pct}%
                </span>
              </div>
              <div className="w-full bg-app-surface/50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${topic.pct >= 80 ? "bg-green-400" : topic.pct >= 40 ? "bg-amber-400" : "bg-app-surface/80"}`}
                  style={{ width: `${topic.pct}%` }}
                ></div>
              </div>
            </div>

            <div className="flex gap-2 text-xs">
              <span className="text-white/40">{topic.total - topic.mastered - HANJA_DATA.filter(w => {
                const inTopic = getTopicWords(HANJA_DATA, topic).some(tw => tw.korean === w.korean);
                return inTopic && getMasteryLevel(w.korean, srData) === "learning";
              }).length} mới</span>
              <span className="text-green-400">{topic.mastered} thuộc</span>
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs text-app-accent-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Học ngay</span>
              <i className="ri-arrow-right-line"></i>
            </div>
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center bg-app-surface/50 rounded-xl">
            <i className="ri-bar-chart-line text-app-accent-primary"></i>
          </div>
          <div>
            <p className="font-semibold text-white/90 text-sm">Tổng quan theo chủ đề</p>
            <p className="text-xs text-white/50">{TOPICS.length} chủ đề · {HANJA_DATA.length} từ tổng cộng</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Chủ đề tốt nhất", value: topicStats.sort((a, b) => b.pct - a.pct)[0]?.label ?? "-", icon: "ri-trophy-line", color: "text-amber-400" },
            { label: "Cần ôn nhất", value: topicStats.sort((a, b) => a.pct - b.pct)[0]?.label ?? "-", icon: "ri-alarm-warning-line", color: "text-red-400" },
            { label: "Tổng đã thuộc", value: `${topicStats.reduce((s, t) => s + t.mastered, 0)}`, icon: "ri-check-double-line", color: "text-green-400" },
            { label: "Trung bình", value: `${Math.round(topicStats.reduce((s, t) => s + t.pct, 0) / TOPICS.length)}%`, icon: "ri-percent-line", color: "text-app-accent-primary" },
          ].map((s, i) => (
            <div key={i} className="bg-app-surface/50 rounded-xl p-3 text-center">
              <i className={`${s.icon} ${s.color} text-lg`}></i>
              <p className="text-xs font-bold text-white/90 mt-1 truncate">{s.value}</p>
              <p className="text-xs text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
