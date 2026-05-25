import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePageSEO } from "@/hooks/usePageSEO";
import { SITE_URL } from "@/lib/siteConfig";

function speakKorean(text: string, rate = 0.7) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ko-KR";
  utter.rate = rate;
  window.speechSynthesis.speak(utter);
}

// ─── Data ─────────────────────────────────────────────────────────────────
const CONSONANTS = [
  { char: "ㄱ", roman: "g/k", example: "가방", exampleMean: "túi xách", sound: "가" },
  { char: "ㄴ", roman: "n", example: "나무", exampleMean: "cây", sound: "나" },
  { char: "ㄷ", roman: "d/t", example: "다리", exampleMean: "cầu/chân", sound: "다" },
  { char: "ㄹ", roman: "r/l", example: "라면", exampleMean: "mì ramen", sound: "라" },
  { char: "ㅁ", roman: "m", example: "마음", exampleMean: "tâm hồn", sound: "마" },
  { char: "ㅂ", roman: "b/p", example: "바다", exampleMean: "biển", sound: "바" },
  { char: "ㅅ", roman: "s", example: "사랑", exampleMean: "tình yêu", sound: "사" },
  { char: "ㅇ", roman: "ng/-", example: "아이", exampleMean: "đứa trẻ", sound: "아" },
  { char: "ㅈ", roman: "j", example: "자다", exampleMean: "ngủ", sound: "자" },
  { char: "ㅊ", roman: "ch", example: "차", exampleMean: "xe/trà", sound: "차" },
  { char: "ㅋ", roman: "k", example: "카페", exampleMean: "quán cà phê", sound: "카" },
  { char: "ㅌ", roman: "t", example: "타다", exampleMean: "đi (xe)", sound: "타" },
  { char: "ㅍ", roman: "p", example: "파란", exampleMean: "màu xanh", sound: "파" },
  { char: "ㅎ", roman: "h", example: "하늘", exampleMean: "bầu trời", sound: "하" },
];

const DOUBLE_CONSONANTS = [
  { char: "ㄲ", roman: "kk", example: "꽃", exampleMean: "hoa", sound: "까" },
  { char: "ㄸ", roman: "tt", example: "딸기", exampleMean: "dâu tây", sound: "따" },
  { char: "ㅃ", roman: "pp", example: "빵", exampleMean: "bánh mì", sound: "빠" },
  { char: "ㅆ", roman: "ss", example: "씨", exampleMean: "hạt giống", sound: "싸" },
  { char: "ㅉ", roman: "jj", example: "짜다", exampleMean: "mặn", sound: "짜" },
];

const VOWELS = [
  { char: "ㅏ", roman: "a", example: "아버지", exampleMean: "bố", sound: "아" },
  { char: "ㅑ", roman: "ya", example: "야구", exampleMean: "bóng chày", sound: "야" },
  { char: "ㅓ", roman: "eo", example: "어머니", exampleMean: "mẹ", sound: "어" },
  { char: "ㅕ", roman: "yeo", example: "여자", exampleMean: "phụ nữ", sound: "여" },
  { char: "ㅗ", roman: "o", example: "오빠", exampleMean: "anh trai", sound: "오" },
  { char: "ㅛ", roman: "yo", example: "요리", exampleMean: "nấu ăn", sound: "요" },
  { char: "ㅜ", roman: "u", example: "우유", exampleMean: "sữa", sound: "우" },
  { char: "ㅠ", roman: "yu", example: "유리", exampleMean: "kính", sound: "유" },
  { char: "ㅡ", roman: "eu", example: "으뜸", exampleMean: "số một", sound: "으" },
  { char: "ㅣ", roman: "i", example: "이름", exampleMean: "tên", sound: "이" },
];

const COMPOUND_VOWELS = [
  { char: "ㅐ", roman: "ae", example: "개", exampleMean: "con chó", sound: "애" },
  { char: "ㅒ", roman: "yae", example: "얘기", exampleMean: "câu chuyện", sound: "얘" },
  { char: "ㅔ", roman: "e", example: "세계", exampleMean: "thế giới", sound: "에" },
  { char: "ㅖ", roman: "ye", example: "예쁘다", exampleMean: "đẹp", sound: "예" },
  { char: "ㅘ", roman: "wa", example: "과자", exampleMean: "bánh kẹo", sound: "와" },
  { char: "ㅙ", roman: "wae", example: "왜", exampleMean: "tại sao", sound: "왜" },
  { char: "ㅚ", roman: "oe", example: "외국", exampleMean: "nước ngoài", sound: "외" },
  { char: "ㅝ", roman: "wo", example: "원", exampleMean: "won (tiền)", sound: "워" },
  { char: "ㅞ", roman: "we", example: "웨이터", exampleMean: "bồi bàn", sound: "웨" },
  { char: "ㅟ", roman: "wi", example: "위", exampleMean: "trên/dạ dày", sound: "위" },
  { char: "ㅢ", roman: "ui", example: "의사", exampleMean: "bác sĩ", sound: "의" },
];

type CharItem = { char: string; roman: string; example: string; exampleMean: string; sound: string };

// ─── Character Card ───────────────────────────────────────────────────────
function HangulCard({ item, isSelected, isMastered, onClick, onMaster }: {
  item: CharItem;
  isSelected: boolean;
  isMastered: boolean;
  onClick: () => void;
  onMaster: () => void;
}) {
  const [speaking, setSpeaking] = useState(false);
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeaking(true);
    speakKorean(item.sound);
    setTimeout(() => setSpeaking(false), 1000);
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-3 rounded-xl border transition-all cursor-pointer ${
        isSelected ? "border-app-accent-primary/40 bg-app-accent-primary/5 scale-105"
        : isMastered ? "border-emerald-500/20 bg-emerald-500/5"
        : "border-app-border bg-app-bg hover:border-white/15 hover:bg-app-surface/50"
      }`}
    >
      {isMastered && (
        <div className="absolute top-1.5 right-1.5 w-3 h-3 flex items-center justify-center">
          <i className="ri-checkbox-circle-fill text-app-accent-success text-[10px]"></i>
        </div>
      )}
      <p className={`text-2xl font-bold text-center mb-1 ${isSelected ? "text-app-accent-primary" : "text-white"}`}>
        {item.char}
      </p>
      <p className="text-app-text-secondary text-[10px] text-center font-mono">{item.roman}</p>

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-app-border space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">{item.example}</p>
              <p className="text-app-text-secondary text-[10px]">{item.exampleMean}</p>
            </div>
            <button
              onClick={handleSpeak}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${speaking ? "bg-app-accent-primary/20" : "bg-app-card/50 hover:bg-app-card/70"}`}
            >
              <i className={`text-sm ${speaking ? "ri-volume-up-line text-app-accent-primary" : "ri-volume-up-line text-app-text-secondary"}`}></i>
            </button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onMaster(); }}
            className={`w-full py-1.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              isMastered ? "bg-emerald-500/10 text-app-accent-success border border-emerald-500/20" : "bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary"
            }`}
          >
            {isMastered ? "Đã thuộc ✓" : "Đánh dấu thuộc"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Practice Mode ────────────────────────────────────────────────────────
function PracticeMode({ chars, onBack }: { chars: CharItem[]; onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ know: 0, dontknow: 0 });
  const [done, setDone] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const shuffled = chars.sort(() => Math.random() - 0.5);
  const current = shuffled[idx];

  const handleSpeak = () => {
    setSpeaking(true);
    speakKorean(current.sound, 0.6);
    setTimeout(() => setSpeaking(false), 1200);
  };

  const handleAnswer = (know: boolean) => {
    setScore(s => ({ ...s, know: know ? s.know + 1 : s.know, dontknow: !know ? s.dontknow + 1 : s.dontknow }));
    if (idx + 1 >= shuffled.length) setDone(true);
    else { setIdx(i => i + 1); setShowAnswer(false); }
  };

  if (done) {
    const pct = Math.round((score.know / shuffled.length) * 100);
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-4 bg-app-accent-primary/10">
          <i className="ri-trophy-line text-app-accent-primary text-3xl"></i>
        </div>
        <p className="text-white font-bold text-xl mb-2">Hoàn thành!</p>
        <p className="text-app-text-secondary text-sm mb-6">Thuộc {score.know}/{shuffled.length} ký tự ({pct}%)</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onBack} className="px-6 py-2.5 rounded-xl border border-app-border text-white/60 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap">
            Về bảng chữ
          </button>
          <button onClick={() => { setIdx(0); setShowAnswer(false); setScore({ know: 0, dontknow: 0 }); setDone(false); }} className="px-6 py-2.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap">
            Luyện lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto text-center py-8">
      <p className="text-app-text-muted text-xs mb-6">{idx + 1} / {shuffled.length}</p>
      <div className="bg-app-bg border border-app-border rounded-2xl p-10 mb-6">
        <p className="text-6xl font-bold text-white mb-4">{current.char}</p>
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="text-app-text-muted text-sm hover:text-white/60 cursor-pointer transition-colors"
          >
            Nhấn để xem đáp án
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-app-accent-primary font-bold text-xl">{current.roman}</p>
            <p className="text-white/60 text-sm">{current.example} — {current.exampleMean}</p>
            <button
              onClick={handleSpeak}
              className={`flex items-center gap-1.5 mx-auto text-xs cursor-pointer transition-colors px-3 py-1.5 rounded-lg ${speaking ? "bg-app-accent-primary/20 text-app-accent-primary" : "bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary"}`}
            >
              <i className="ri-volume-up-line text-xs"></i>
              Nghe phát âm
            </button>
          </div>
        )}
      </div>
      {showAnswer && (
        <div className="flex gap-3">
          <button onClick={() => handleAnswer(false)} className="flex-1 py-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap">
            Chưa thuộc
          </button>
          <button onClick={() => handleAnswer(true)} className="flex-1 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-app-accent-success font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap">
            Đã thuộc
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function HangulPage() {
  const [tab, setTab] = useState<"consonant" | "vowel" | "compound" | "double">("consonant");
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [masteredChars, setMasteredChars] = useLocalStorage<string[]>("kts_hangul_mastered", []);
  const [practiceMode, setPracticeMode] = useState(false);

  usePageSEO({
    title: "Học bảng chữ cái Hàn Quốc Hangul [Có Audio] | Hàn Quốc Ơi!",
    description: "Học bảng chữ cái Hangul từ A đến Z: phụ âm, nguyên âm, phụ âm kép. Audio phát âm chuẩn, ghi nhớ bằng flashcard, luyện viết. Miễn phí 100% cho người Việt.",
    keywords: "học hangul, bảng chữ cái Hàn Quốc, học tiếng Hàn cơ bản, hangul audio, phát âm tiếng Hàn",
    path: "/hangul",
    ogType: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: "Học bảng chữ cái Hangul",
      description: "Trọn bộ phụ âm, nguyên âm, phụ âm kép Hangul kèm audio phát âm.",
      learningResourceType: "Lesson",
      educationalLevel: "Beginner",
      inLanguage: ["vi", "ko"],
      isAccessibleForFree: true,
      provider: {
        "@type": "EducationalOrganization",
        name: "Hàn Quốc Ơi!",
        url: SITE_URL,
      },
    },
  });

  const currentChars = tab === "consonant" ? CONSONANTS
    : tab === "double" ? DOUBLE_CONSONANTS
    : tab === "vowel" ? VOWELS
    : COMPOUND_VOWELS;

  const masteredCount = currentChars.filter(c => masteredChars.includes(c.char)).length;

  const handleMaster = (char: string) => {
    setMasteredChars(prev =>
      prev.includes(char) ? prev.filter(c => c !== char) : [...prev, char]
    );
  };

  const handleSpeakAll = () => {
    const text = currentChars.map(c => c.sound).join(" ");
    speakKorean(text, 0.6);
  };

  const tabs = [
    { id: "consonant", label: "Phụ âm cơ bản", count: CONSONANTS.length },
    { id: "double", label: "Phụ âm đôi", count: DOUBLE_CONSONANTS.length },
    { id: "vowel", label: "Nguyên âm cơ bản", count: VOWELS.length },
    { id: "compound", label: "Nguyên âm ghép", count: COMPOUND_VOWELS.length },
  ] as const;

  const totalMastered = [...CONSONANTS, ...DOUBLE_CONSONANTS, ...VOWELS, ...COMPOUND_VOWELS]
    .filter(c => masteredChars.includes(c.char)).length;
  const totalChars = CONSONANTS.length + DOUBLE_CONSONANTS.length + VOWELS.length + COMPOUND_VOWELS.length;

  return (
    <DashboardLayout
      title="Bảng chữ cái Hangul"
      subtitle="Học phát âm tương tác — nhấn để nghe giọng Hàn chuẩn"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeakAll}
            className="flex items-center gap-2 bg-app-card/50 hover:bg-app-card/70 text-white/60 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-volume-up-line"></i>
            Nghe tất cả
          </button>
          <button
            onClick={() => setPracticeMode(true)}
            className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-play-line"></i>
            Luyện tập
          </button>
        </div>
      }
    >
      {/* Overall progress */}
      <div className="bg-app-bg border border-app-border rounded-xl p-4 mb-5 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-white/60 text-xs font-medium">Tiến độ tổng thể</p>
            <p className="text-app-accent-primary text-xs font-bold">{totalMastered}/{totalChars} ký tự</p>
          </div>
          <div className="h-2 bg-app-card/50 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-app-accent-primary transition-all" style={{ width: `${(totalMastered / totalChars) * 100}%` }} />
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-white font-bold text-xl">{Math.round((totalMastered / totalChars) * 100)}%</p>
          <p className="text-app-text-muted text-[10px]">hoàn thành</p>
        </div>
      </div>

      {practiceMode ? (
        <div className="bg-app-bg border border-app-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Luyện tập — {tabs.find(t => t.id === tab)?.label}</h3>
            <button onClick={() => setPracticeMode(false)} className="text-app-text-muted hover:text-white/60 cursor-pointer text-xs transition-colors whitespace-nowrap">
              Thoát
            </button>
          </div>
          <PracticeMode chars={[...currentChars]} onBack={() => setPracticeMode(false)} />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSelectedChar(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  tab === t.id ? "border-app-accent-primary/40 bg-app-accent-primary/10 text-app-accent-primary" : "border-app-border bg-app-surface/50 text-app-text-secondary hover:border-white/15"
                }`}
              >
                {t.label}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-app-accent-primary/20" : "bg-app-card/50"}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Progress for current tab */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-app-text-muted text-xs">Đã thuộc: <span className="text-white/60 font-semibold">{masteredCount}/{currentChars.length}</span></p>
            <button
              onClick={() => setMasteredChars(prev => {
                const allMastered = currentChars.every(c => prev.includes(c.char));
                if (allMastered) return prev.filter(c => !currentChars.find(ch => ch.char === c));
                return [...new Set([...prev, ...currentChars.map(c => c.char)])];
              })}
              className="text-[10px] text-app-text-muted hover:text-white/50 cursor-pointer transition-colors whitespace-nowrap"
            >
              {currentChars.every(c => masteredChars.includes(c.char)) ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          </div>

          {/* Grid */}
          <div className={`grid gap-2 ${tab === "consonant" ? "grid-cols-7" : tab === "double" ? "grid-cols-5" : tab === "vowel" ? "grid-cols-5" : "grid-cols-6"}`}>
            {currentChars.map(item => (
              <HangulCard
                key={item.char}
                item={item}
                isSelected={selectedChar === item.char}
                isMastered={masteredChars.includes(item.char)}
                onClick={() => setSelectedChar(selectedChar === item.char ? null : item.char)}
                onMaster={() => handleMaster(item.char)}
              />
            ))}
          </div>

          {/* Tips */}
          <div className="mt-5 bg-app-surface/50 border border-app-border rounded-xl p-4 flex items-start gap-3">
            <i className="ri-lightbulb-line text-app-accent-primary text-sm mt-0.5 flex-shrink-0"></i>
            <p className="text-app-text-secondary text-xs leading-relaxed">
              Nhấn vào ký tự để xem ví dụ và nghe phát âm. Nhấn <strong className="text-white/60">Luyện tập</strong> để ôn theo kiểu lật thẻ. Mục tiêu: thuộc hết 40 ký tự cơ bản trong 1 tuần!
            </p>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
