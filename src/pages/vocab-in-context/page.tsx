import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface ContextWord {
  word: string;
  meaning: string;
  pronunciation: string;
  partOfSpeech: string;
}

interface ContextPassage {
  id: string;
  topic: string;
  level: string;
  levelColor: string;
  title: string;
  titleVi: string;
  sentences: {
    korean: string;
    vietnamese: string;
    highlights: string[]; // words to highlight
  }[];
  targetWords: ContextWord[];
  quiz: { word: string; question: string; options: string[]; correct: number }[];
}

const passages: ContextPassage[] = [
  {
    id: "p1",
    topic: "Cảm xúc",
    level: "A2",
    levelColor: "#34d399",
    title: "감정 표현",
    titleVi: "Biểu đạt cảm xúc",
    sentences: [
      { korean: "오늘 정말 행복해요. 친구들과 맛있는 음식을 먹었어요.", vietnamese: "Hôm nay thực sự hạnh phúc. Tôi đã ăn đồ ăn ngon với bạn bè.", highlights: ["행복해요"] },
      { korean: "시험에 합격해서 너무 기뻐요. 열심히 공부한 보람이 있어요.", vietnamese: "Tôi rất vui vì đã đậu kỳ thi. Việc học chăm chỉ thật xứng đáng.", highlights: ["기뻐요", "보람"] },
      { korean: "실수를 해서 부끄러워요. 다음에는 더 조심할게요.", vietnamese: "Tôi xấu hổ vì đã mắc lỗi. Lần sau tôi sẽ cẩn thận hơn.", highlights: ["부끄러워요"] },
      { korean: "오랫동안 기다렸는데 지루해요. 빨리 끝났으면 좋겠어요.", vietnamese: "Tôi đã chờ lâu nên chán rồi. Ước gì kết thúc sớm.", highlights: ["지루해요"] },
      { korean: "갑자기 무서운 소리가 나서 깜짝 놀랐어요.", vietnamese: "Tôi giật mình vì đột nhiên có tiếng động đáng sợ.", highlights: ["무서운", "놀랐어요"] },
    ],
    targetWords: [
      { word: "행복하다", meaning: "Hạnh phúc", pronunciation: "haeng-bok-ha-da", partOfSpeech: "Tính từ" },
      { word: "기쁘다", meaning: "Vui mừng", pronunciation: "gi-ppeu-da", partOfSpeech: "Tính từ" },
      { word: "보람", meaning: "Sự xứng đáng/Ý nghĩa", pronunciation: "bo-ram", partOfSpeech: "Danh từ" },
      { word: "부끄럽다", meaning: "Xấu hổ", pronunciation: "bu-kkeu-reop-da", partOfSpeech: "Tính từ" },
      { word: "지루하다", meaning: "Chán", pronunciation: "ji-ru-ha-da", partOfSpeech: "Tính từ" },
      { word: "놀라다", meaning: "Giật mình/Ngạc nhiên", pronunciation: "nol-la-da", partOfSpeech: "Động từ" },
    ],
    quiz: [
      { word: "행복하다", question: "시험에 합격했을 때 어떤 감정인가요?", options: ["슬프다", "기쁘다", "지루하다", "무섭다"], correct: 1 },
      { word: "보람", question: "열심히 일한 후 느끼는 감정은?", options: ["보람", "부끄러움", "지루함", "무서움"], correct: 0 },
    ],
  },
  {
    id: "p2",
    topic: "Công việc",
    level: "B1",
    levelColor: "#fbbf24",
    title: "직장 생활",
    titleVi: "Cuộc sống công sở",
    sentences: [
      { korean: "저는 매일 아침 9시에 출근해요. 회사까지 지하철로 30분 걸려요.", vietnamese: "Tôi đi làm lúc 9 giờ sáng mỗi ngày. Mất 30 phút đến công ty bằng tàu điện ngầm.", highlights: ["출근해요"] },
      { korean: "오늘 중요한 회의가 있어서 긴장돼요. 발표 준비를 열심히 했어요.", vietnamese: "Hôm nay có cuộc họp quan trọng nên tôi hồi hộp. Tôi đã chuẩn bị bài thuyết trình chăm chỉ.", highlights: ["회의", "긴장돼요", "발표"] },
      { korean: "이번 프로젝트 마감일이 다가와서 야근을 해야 해요.", vietnamese: "Deadline dự án lần này đang đến gần nên phải làm thêm giờ.", highlights: ["마감일", "야근"] },
      { korean: "동료들과 협력해서 어려운 문제를 해결했어요. 팀워크가 중요해요.", vietnamese: "Tôi đã hợp tác với đồng nghiệp để giải quyết vấn đề khó. Teamwork rất quan trọng.", highlights: ["협력해서", "팀워크"] },
      { korean: "상사에게 칭찬을 받아서 자신감이 생겼어요.", vietnamese: "Tôi được sếp khen nên có thêm tự tin.", highlights: ["칭찬", "자신감"] },
    ],
    targetWords: [
      { word: "출근하다", meaning: "Đi làm", pronunciation: "chul-geun-ha-da", partOfSpeech: "Động từ" },
      { word: "회의", meaning: "Cuộc họp", pronunciation: "hoe-ui", partOfSpeech: "Danh từ" },
      { word: "발표", meaning: "Thuyết trình/Công bố", pronunciation: "bal-pyo", partOfSpeech: "Danh từ" },
      { word: "마감일", meaning: "Deadline/Hạn chót", pronunciation: "ma-gam-il", partOfSpeech: "Danh từ" },
      { word: "야근", meaning: "Làm thêm giờ", pronunciation: "ya-geun", partOfSpeech: "Danh từ" },
      { word: "협력하다", meaning: "Hợp tác", pronunciation: "hyeom-nyeok-ha-da", partOfSpeech: "Động từ" },
      { word: "칭찬", meaning: "Lời khen", pronunciation: "ching-chan", partOfSpeech: "Danh từ" },
      { word: "자신감", meaning: "Sự tự tin", pronunciation: "ja-sin-gam", partOfSpeech: "Danh từ" },
    ],
    quiz: [
      { word: "야근", question: "마감일이 다가올 때 보통 무엇을 해야 하나요?", options: ["휴가", "야근", "출근", "퇴근"], correct: 1 },
      { word: "협력하다", question: "팀워크를 위해 필요한 것은?", options: ["경쟁", "협력", "야근", "발표"], correct: 1 },
    ],
  },
  {
    id: "p3",
    topic: "Môi trường",
    level: "B2",
    levelColor: "#f87171",
    title: "환경 보호",
    titleVi: "Bảo vệ môi trường",
    sentences: [
      { korean: "지구 온난화로 인해 기후 변화가 심각해지고 있습니다.", vietnamese: "Biến đổi khí hậu đang trở nên nghiêm trọng do sự nóng lên toàn cầu.", highlights: ["지구 온난화", "기후 변화"] },
      { korean: "탄소 배출을 줄이기 위해 재생 에너지 사용을 늘려야 합니다.", vietnamese: "Cần tăng cường sử dụng năng lượng tái tạo để giảm phát thải carbon.", highlights: ["탄소 배출", "재생 에너지"] },
      { korean: "일회용 플라스틱 사용을 자제하고 재활용을 생활화해야 합니다.", vietnamese: "Cần hạn chế sử dụng nhựa dùng một lần và thực hành tái chế trong cuộc sống.", highlights: ["일회용", "재활용"] },
      { korean: "생물 다양성을 보전하기 위한 국제적 협력이 필요합니다.", vietnamese: "Cần có sự hợp tác quốc tế để bảo tồn đa dạng sinh học.", highlights: ["생물 다양성", "보전"] },
      { korean: "지속 가능한 발전을 위해 환경과 경제의 균형을 맞춰야 합니다.", vietnamese: "Cần cân bằng giữa môi trường và kinh tế để phát triển bền vững.", highlights: ["지속 가능한", "균형"] },
    ],
    targetWords: [
      { word: "지구 온난화", meaning: "Sự nóng lên toàn cầu", pronunciation: "ji-gu on-na-hwa", partOfSpeech: "Danh từ" },
      { word: "탄소 배출", meaning: "Phát thải carbon", pronunciation: "tan-so bae-chul", partOfSpeech: "Danh từ" },
      { word: "재생 에너지", meaning: "Năng lượng tái tạo", pronunciation: "jae-saeng e-neo-ji", partOfSpeech: "Danh từ" },
      { word: "재활용", meaning: "Tái chế", pronunciation: "jae-hwal-lyong", partOfSpeech: "Danh từ" },
      { word: "생물 다양성", meaning: "Đa dạng sinh học", pronunciation: "saeng-mul da-yang-seong", partOfSpeech: "Danh từ" },
      { word: "지속 가능하다", meaning: "Bền vững", pronunciation: "ji-sok ga-neung-ha-da", partOfSpeech: "Tính từ" },
    ],
    quiz: [
      { word: "재활용", question: "환경 보호를 위해 일상에서 할 수 있는 것은?", options: ["탄소 배출", "재활용", "지구 온난화", "일회용 사용"], correct: 1 },
      { word: "지속 가능하다", question: "환경과 경제의 균형을 맞추는 발전 방식은?", options: ["급격한 발전", "지속 가능한 발전", "무분별한 개발", "탄소 배출 증가"], correct: 1 },
    ],
  },
  {
    id: "p4",
    topic: "Công nghệ",
    level: "C1",
    levelColor: "#a78bfa",
    title: "인공지능의 영향",
    titleVi: "Tác động của trí tuệ nhân tạo",
    sentences: [
      { korean: "인공지능 기술의 급격한 발전은 노동 시장에 근본적인 변화를 초래하고 있습니다.", vietnamese: "Sự phát triển nhanh chóng của công nghệ AI đang gây ra những thay đổi cơ bản trong thị trường lao động.", highlights: ["인공지능", "노동 시장", "초래하고"] },
      { korean: "자동화로 인해 일부 직종은 소멸될 위기에 처해 있는 반면, 새로운 직업군이 창출되고 있습니다.", vietnamese: "Trong khi một số ngành nghề đang đứng trước nguy cơ biến mất do tự động hóa, các nhóm nghề mới đang được tạo ra.", highlights: ["자동화", "소멸", "창출"] },
      { korean: "알고리즘 편향성 문제는 인공지능 윤리의 핵심 쟁점으로 부각되고 있습니다.", vietnamese: "Vấn đề thiên kiến thuật toán đang nổi lên như một vấn đề cốt lõi trong đạo đức AI.", highlights: ["알고리즘", "편향성", "윤리"] },
      { korean: "인간과 인공지능의 협업을 통해 생산성을 극대화할 수 있다는 견해도 있습니다.", vietnamese: "Cũng có quan điểm rằng có thể tối đa hóa năng suất thông qua sự hợp tác giữa con người và AI.", highlights: ["협업", "생산성", "극대화"] },
    ],
    targetWords: [
      { word: "초래하다", meaning: "Gây ra/Dẫn đến", pronunciation: "cho-rae-ha-da", partOfSpeech: "Động từ" },
      { word: "자동화", meaning: "Tự động hóa", pronunciation: "ja-dong-hwa", partOfSpeech: "Danh từ" },
      { word: "소멸하다", meaning: "Biến mất/Tiêu vong", pronunciation: "so-myeol-ha-da", partOfSpeech: "Động từ" },
      { word: "창출하다", meaning: "Tạo ra/Sáng tạo", pronunciation: "chang-chul-ha-da", partOfSpeech: "Động từ" },
      { word: "편향성", meaning: "Thiên kiến/Sự thiên lệch", pronunciation: "pyeon-hyang-seong", partOfSpeech: "Danh từ" },
      { word: "극대화하다", meaning: "Tối đa hóa", pronunciation: "geuk-dae-hwa-ha-da", partOfSpeech: "Động từ" },
    ],
    quiz: [
      { word: "자동화", question: "인공지능으로 인해 일부 직종이 사라지는 이유는?", options: ["인구 감소", "자동화", "교육 부족", "경제 위기"], correct: 1 },
      { word: "편향성", question: "인공지능 윤리의 핵심 쟁점은?", options: ["생산성", "협업", "알고리즘 편향성", "자동화"], correct: 2 },
    ],
  },
];

// ─── Highlighted Sentence ─────────────────────────────────────────────────────
function HighlightedSentence({ sentence, highlights, onWordClick }: {
  sentence: string;
  highlights: string[];
  onWordClick: (word: string) => void;
}) {
  const parts: { text: string; isHighlight: boolean }[] = [];
  let remaining = sentence;

  while (remaining.length > 0) {
    let found = false;
    for (const h of highlights) {
      const idx = remaining.indexOf(h);
      if (idx === 0) {
        parts.push({ text: h, isHighlight: true });
        remaining = remaining.slice(h.length);
        found = true;
        break;
      } else if (idx > 0) {
        parts.push({ text: remaining.slice(0, idx), isHighlight: false });
        parts.push({ text: h, isHighlight: true });
        remaining = remaining.slice(idx + h.length);
        found = true;
        break;
      }
    }
    if (!found) {
      parts.push({ text: remaining, isHighlight: false });
      remaining = "";
    }
  }

  return (
    <span>
      {parts.map((p, i) =>
        p.isHighlight ? (
          <button key={i} onClick={() => onWordClick(p.text)}
            className="text-[#e8c84a] font-bold underline decoration-dotted cursor-pointer hover:text-[#d4b43a] transition-colors">
            {p.text}
          </button>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </span>
  );
}

// ─── Word Popup ───────────────────────────────────────────────────────────────
function WordPopup({ word, targetWords, onClose }: {
  word: string;
  targetWords: ContextWord[];
  onClose: () => void;
}) {
  const info = targetWords.find(w => w.word === word || word.includes(w.word.replace("하다", "")) || w.word.includes(word));

  const handleTTS = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(word);
      utt.lang = "ko-KR";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-72 rounded-2xl border border-white/10 bg-[#1a1f2e] p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-white font-bold text-2xl">{word}</p>
            {info && <p className="text-white/40 text-xs">{info.partOfSpeech}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={handleTTS} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/15 text-white/50 cursor-pointer">
              <i className="ri-volume-up-line text-sm"></i>
            </button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/15 text-white/50 cursor-pointer">
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>
        </div>
        {info ? (
          <>
            <p className="text-[#e8c84a] font-semibold text-base mb-1">{info.meaning}</p>
            <p className="text-white/40 text-sm">[{info.pronunciation}]</p>
          </>
        ) : (
          <p className="text-white/50 text-sm">Nhấn vào từ được gạch chân để xem nghĩa</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VocabInContextPage() {
  const [selectedPassage, setSelectedPassage] = useState<ContextPassage | null>(null);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [clickedWord, setClickedWord] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const topics = useMemo(() => ["all", ...new Set(passages.map(p => p.topic))], []);
  const filtered = selectedTopic === "all" ? passages : passages.filter(p => p.topic === selectedTopic);

  const handleQuizAnswer = (idx: number) => {
    if (quizSelected !== null || !selectedPassage) return;
    setQuizSelected(idx);
    if (idx === selectedPassage.quiz[quizIdx].correct) setQuizScore(s => s + 1);
    setTimeout(() => {
      if (quizIdx + 1 >= selectedPassage.quiz.length) {
        setQuizDone(true);
      } else {
        setQuizIdx(i => i + 1);
        setQuizSelected(null);
      }
    }, 1000);
  };

  if (selectedPassage) {
    const q = selectedPassage.quiz[quizIdx];
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button onClick={() => { setSelectedPassage(null); setQuizMode(false); setQuizIdx(0); setQuizSelected(null); setQuizScore(0); setQuizDone(false); }}
            className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm mb-5 cursor-pointer transition-colors">
            <i className="ri-arrow-left-line"></i> Quay lại
          </button>

          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${selectedPassage.levelColor}20`, color: selectedPassage.levelColor }}>
              {selectedPassage.level}
            </span>
            <span className="text-white/40 text-xs">{selectedPassage.topic}</span>
            <div className="flex gap-1 ml-auto">
              <button onClick={() => setQuizMode(false)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${!quizMode ? "bg-[#e8c84a] text-[#141720]" : "bg-white/5 text-white/50 hover:bg-white/8"}`}>
                Đọc
              </button>
              <button onClick={() => setQuizMode(true)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${quizMode ? "bg-[#e8c84a] text-[#141720]" : "bg-white/5 text-white/50 hover:bg-white/8"}`}>
                Quiz
              </button>
            </div>
          </div>

          {!quizMode ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Sentences */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                  <h2 className="text-white font-bold text-lg mb-1">{selectedPassage.title}</h2>
                  <p className="text-white/40 text-sm mb-5">{selectedPassage.titleVi}</p>
                  <div className="space-y-5">
                    {selectedPassage.sentences.map((s, i) => (
                      <div key={i} className="border-l-2 border-white/10 pl-4">
                        <p className="text-white/85 text-base leading-8 mb-1">
                          <HighlightedSentence sentence={s.korean} highlights={s.highlights} onWordClick={setClickedWord} />
                        </p>
                        <p className="text-white/40 text-sm italic">{s.vietnamese}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/25 text-xs mt-5">
                    <i className="ri-information-line mr-1"></i>
                    Nhấn vào từ màu vàng để xem nghĩa
                  </p>
                </div>
              </div>

              {/* Word list */}
              <div>
                <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                  <p className="text-white/60 text-xs font-semibold mb-3">Từ vựng trong bài ({selectedPassage.targetWords.length})</p>
                  <div className="space-y-3">
                    {selectedPassage.targetWords.map((w, i) => (
                      <div key={i} className="pb-3 border-b border-white/5 last:border-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-white font-bold text-sm">{w.word}</span>
                          <span className="text-white/25 text-[10px]">{w.partOfSpeech}</span>
                        </div>
                        <p className="text-[#e8c84a] text-xs">{w.meaning}</p>
                        <p className="text-white/30 text-xs">[{w.pronunciation}]</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-lg mx-auto">
              {!quizDone ? (
                <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                  <p className="text-white/40 text-xs mb-4">Câu {quizIdx + 1}/{selectedPassage.quiz.length}</p>
                  <p className="text-white font-bold text-base mb-5">{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, idx) => {
                      let cls = "border-white/10 bg-white/3 text-white/70 hover:border-white/25";
                      if (quizSelected !== null) {
                        if (idx === q.correct) cls = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                        else if (idx === quizSelected) cls = "border-rose-500/50 bg-rose-500/10 text-rose-300";
                        else cls = "border-white/5 bg-white/2 text-white/30";
                      }
                      return (
                        <button key={idx} onClick={() => handleQuizAnswer(idx)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${cls}`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/8 bg-white/3 p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                    <span className="text-emerald-400 font-bold text-2xl">{quizScore}/{selectedPassage.quiz.length}</span>
                  </div>
                  <p className="text-white font-bold text-lg mb-2">Quiz hoàn thành!</p>
                  <p className="text-white/50 text-sm mb-5">
                    {quizScore === selectedPassage.quiz.length ? "Xuất sắc! Bạn hiểu từ vựng rất tốt!" : "Hãy đọc lại bài và thử lại!"}
                  </p>
                  <button onClick={() => { setQuizIdx(0); setQuizSelected(null); setQuizScore(0); setQuizDone(false); }}
                    className="px-6 py-2.5 rounded-xl bg-[#e8c84a] text-[#141720] font-bold text-sm cursor-pointer whitespace-nowrap">
                    Làm lại
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {clickedWord && (
          <WordPopup word={clickedWord} targetWords={selectedPassage.targetWords} onClose={() => setClickedWord(null)} />
        )}
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-white font-bold text-2xl mb-1">Từ vựng theo ngữ cảnh</h1>
          <p className="text-white/50 text-sm">Học từ qua câu và đoạn văn thực tế — nhấn vào từ được gạch chân để xem nghĩa</p>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {topics.map(t => (
            <button key={t} onClick={() => setSelectedTopic(t)}
              className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${selectedTopic === t ? "bg-[#e8c84a] text-[#141720]" : "bg-white/5 text-white/50 hover:bg-white/8"}`}>
              {t === "all" ? "Tất cả" : t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => (
            <button key={p.id} onClick={() => setSelectedPassage(p)}
              className="text-left p-5 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/15 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${p.levelColor}20`, color: p.levelColor }}>{p.level}</span>
                <span className="text-white/30 text-xs">{p.topic}</span>
              </div>
              <h3 className="text-white font-bold text-base mb-1 group-hover:text-[#e8c84a] transition-colors">{p.title}</h3>
              <p className="text-white/50 text-sm mb-3">{p.titleVi}</p>
              <div className="flex items-center gap-3 text-white/30 text-xs">
                <span><i className="ri-text-snippet mr-1"></i>{p.sentences.length} câu</span>
                <span><i className="ri-translate-2 mr-1"></i>{p.targetWords.length} từ vựng</span>
                <span><i className="ri-question-line mr-1"></i>{p.quiz.length} quiz</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
