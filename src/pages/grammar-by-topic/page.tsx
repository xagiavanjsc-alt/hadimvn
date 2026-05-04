import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

// --- Types --------------------------------------------------------------------
interface GrammarExample {
  korean: string;
  vietnamese: string;
  note?: string;
}

interface GrammarPoint {
  id: string;
  pattern: string;
  meaning: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  usage: string;
  structure: string;
  examples: GrammarExample[];
  tips: string[];
  commonMistakes?: string[];
}

interface GrammarTopic {
  id: string;
  name: string;
  nameVi: string;
  icon: string;
  color: string;
  description: string;
  points: GrammarPoint[];
}

// --- Data ---------------------------------------------------------------------
const grammarTopics: GrammarTopic[] = [
  {
    id: "daily-life",
    name: "????",
    nameVi: "Cu?c s?ng hàng ngày",
    icon: "ri-home-heart-line",
    color: "#34d399",
    description: "Ng? pháp dùng trong các tình hu?ng hàng ngày",
    points: [
      {
        id: "g1",
        pattern: "-(?)? ???",
        meaning: "S?... / D? d?nh...",
        level: "A2",
        usage: "Di?n d?t k? ho?ch ho?c d? doán trong tuong lai",
        structure: "Ð?ng t? + -(?)? ???",
        examples: [
          { korean: "?? ??? ?? ???.", vietnamese: "Ngày mai tôi s? g?p b?n.", note: "??? ? ??" },
          { korean: "??? ??? ? ???.", vietnamese: "Cu?i tu?n tôi s? ngh? ? nhà.", note: "?? ? ?" },
          { korean: "?? ? ???.", vietnamese: "Tr?i s? mua.", note: "?? ? ?" },
        ],
        tips: ["Ph? âm cu?i: -(?)? ???", "Không có ph? âm cu?i ho?c ?: -? ???"],
        commonMistakes: ["? ?? ??? ?? ??? (dúng) vs ? ?? ??? (sai)"],
      },
      {
        id: "g2",
        pattern: "-? ??",
        meaning: "Mu?n...",
        level: "A1",
        usage: "Di?n d?t mong mu?n c?a b?n thân",
        structure: "Ð?ng t? + -? ??",
        examples: [
          { korean: "??? ?? ???.", vietnamese: "Tôi mu?n di Hàn Qu?c." },
          { korean: "??? ??? ?? ???.", vietnamese: "Tôi mu?n an d? an ngon." },
          { korean: "???? ? ?? ???.", vietnamese: "Tôi mu?n nói ti?ng Hàn gi?i." },
        ],
        tips: ["Ch? dùng cho ngôi th? nh?t (tôi)", "Ngôi th? ba dùng -? ????"],
        commonMistakes: ["? ??? ?? ??? (sai) ? ? ??? ?? ????"],
      },
      {
        id: "g3",
        pattern: "-(?)? ??",
        meaning: "Ch? c?n... là du?c",
        level: "B1",
        usage: "Di?n d?t di?u ki?n d? d? d?t du?c k?t qu?",
        structure: "Ð?ng t?/Tính t? + -(?)? ??",
        examples: [
          { korean: "??? ??? ?? ??.", vietnamese: "Ch? c?n vi?t tên vào dây là du?c." },
          { korean: "??? ?? ??.", vietnamese: "Ch? c?n di xe buýt là du?c." },
          { korean: "??? ???? ??.", vietnamese: "Ch? c?n d?i m?t chút là du?c." },
        ],
        tips: ["Nh?n m?nh r?ng ch? c?n làm di?u dó là d?", "Thu?ng dùng d? hu?ng d?n ho?c tr? l?i câu h?i"],
      },
    ],
  },
  {
    id: "time-tense",
    name: "??? ??",
    nameVi: "Thì & Th?i gian",
    icon: "ri-time-line",
    color: "#fbbf24",
    description: "Ng? pháp di?n d?t th?i gian và các thì",
    points: [
      {
        id: "g4",
        pattern: "-?/???",
        meaning: "Ðã... (quá kh?)",
        level: "A1",
        usage: "Di?n d?t hành d?ng dã x?y ra trong quá kh?",
        structure: "Ð?ng t? + -?/??? (nguyên âm ?/? ? -?, còn l?i ? -?)",
        examples: [
          { korean: "?? ??? ???.", vietnamese: "Hôm qua tôi dã di h?c.", note: "?? ? ???" },
          { korean: "?? ????.", vietnamese: "Tôi dã an com.", note: "?? ? ????" },
          { korean: "??? ????.", vietnamese: "Tôi dã g?p b?n.", note: "??? ? ????" },
        ],
        tips: ["?? ? ???", "?? ? ???", "?? ? ????/???"],
      },
      {
        id: "g5",
        pattern: "-(?)? ??",
        meaning: "Sau khi...",
        level: "A2",
        usage: "Di?n d?t hành d?ng x?y ra sau m?t hành d?ng khác",
        structure: "Ð?ng t? + -(?)? ?? + m?nh d? chính",
        examples: [
          { korean: "?? ?? ?? ?????.", vietnamese: "Sau khi an com, tôi dã di d?o." },
          { korean: "??? ? ?? ??? ??.", vietnamese: "Sau khi làm bài t?p, tôi choi game." },
          { korean: "??? ?? ??? ???.", vietnamese: "Sau khi t?t nghi?p, tôi s? di làm." },
        ],
        tips: ["Tuong t?: -? ?? (sau khi, nh?n m?nh th? t?)", "Phân bi?t v?i -? ?? (tru?c khi)"],
      },
      {
        id: "g6",
        pattern: "-? ??",
        meaning: "Trong khi... / Su?t th?i gian...",
        level: "B1",
        usage: "Di?n d?t hai hành d?ng x?y ra d?ng th?i trong m?t kho?ng th?i gian",
        structure: "Ð?ng t? + -? ?? + m?nh d? chính",
        examples: [
          { korean: "??? ?? ?? ????.", vietnamese: "Tôi h?c trong khi nghe nh?c." },
          { korean: "??? ?? ?? ?? ????.", vietnamese: "Trong th?i gian ? Hàn Qu?c, tôi dã h?c du?c nhi?u." },
          { korean: "???? ?? ?? ????.", vietnamese: "Trong khi ch?, tôi dã d?c sách." },
        ],
        tips: ["Ch? ng? hai m?nh d? có th? khác nhau", "Danh t? + ??: ?? ?? (trong k? ngh?)"],
      },
    ],
  },
  {
    id: "reason-cause",
    name: "??? ??",
    nameVi: "Lý do & Nguyên nhân",
    icon: "ri-question-answer-line",
    color: "#f87171",
    description: "Ng? pháp di?n d?t lý do và nguyên nhân",
    points: [
      {
        id: "g7",
        pattern: "-(?)??",
        meaning: "Vì... / B?i vì...",
        level: "A2",
        usage: "Di?n d?t lý do ho?c nguyên nhân, thu?ng dùng khi dua ra l?i khuyên ho?c m?nh l?nh",
        structure: "Ð?ng t?/Tính t? + -(?)?? + k?t qu?/l?i khuyên",
        examples: [
          { korean: "?? ???? ?? ???.", vietnamese: "Vì dói nên an com di." },
          { korean: "??? ???? ?? ????.", vietnamese: "Vì tr?i l?nh nên hãy m?c áo vào." },
          { korean: "??? ???? ?? ??.", vietnamese: "Vì không có th?i gian nên di nhanh thôi." },
        ],
        tips: ["Khác v?i -?/??: -(?)?? có th? dùng v?i m?nh l?nh/d? ngh?", "?/?? không dùng du?c v?i m?nh l?nh"],
        commonMistakes: ["? ?? ??? ?? ??? (không t? nhiên v?i m?nh l?nh)"],
      },
      {
        id: "g8",
        pattern: "-?/??",
        meaning: "Vì... nên... (nguyên nhân-k?t qu?)",
        level: "A1",
        usage: "Di?n d?t nguyên nhân d?n d?n k?t qu? t? nhiên",
        structure: "Ð?ng t?/Tính t? + -?/?? + k?t qu?",
        examples: [
          { korean: "???? ?? ???.", vietnamese: "Vì m?t nên tôi dã ng? s?m." },
          { korean: "?? ?? ?? ????.", vietnamese: "Vì tr?i mua nên tôi ? nhà." },
          { korean: "???? ?? ????.", vietnamese: "Vì ngon nên tôi dã an nhi?u." },
        ],
        tips: ["Thì c?a m?nh d? chính quy?t d?nh thì c?a toàn câu", "Không dùng v?i m?nh l?nh/d? ngh?"],
      },
      {
        id: "g9",
        pattern: "-(?)? ???",
        meaning: "Vì lý do... (nh?n m?nh)",
        level: "B1",
        usage: "Nh?n m?nh nguyên nhân, thu?ng dùng trong van vi?t ho?c tình hu?ng trang tr?ng",
        structure: "Ð?ng t?/Tính t? + -(?)? ??? / Danh t? + ???",
        examples: [
          { korean: "?? ??? ????.", vietnamese: "Vì giao thông nên tôi d?n mu?n." },
          { korean: "?? ??? ??? ?????.", vietnamese: "Vì s?c kh?e nên tôi b?t d?u t?p th? d?c." },
          { korean: "?? ?? ??? ?? ???.", vietnamese: "Vì có nhi?u vi?c nên không th? ngh?." },
        ],
        tips: ["Danh t? + ??? (không c?n ?/?)", "Ð?ng t? + -? ???"],
      },
    ],
  },
  {
    id: "condition",
    name: "??? ??",
    nameVi: "Ði?u ki?n & Gi? d?nh",
    icon: "ri-git-branch-line",
    color: "#a78bfa",
    description: "Ng? pháp di?n d?t di?u ki?n và gi? d?nh",
    points: [
      {
        id: "g10",
        pattern: "-(?)?",
        meaning: "N?u... thì...",
        level: "A2",
        usage: "Di?n d?t di?u ki?n",
        structure: "Ð?ng t?/Tính t? + -(?)? + k?t qu?",
        examples: [
          { korean: "??? ??? ?? ??.", vietnamese: "N?u có th?i gian thì cùng di nhé." },
          { korean: "??? ???? ??? ???.", vietnamese: "N?u h?c cham ch? thì s? d?u." },
          { korean: "?? ?? ?? ?? ???.", vietnamese: "N?u tr?i mua thì tôi s? ? nhà." },
        ],
        tips: ["Ph? âm cu?i: -(?)?", "Không có ph? âm cu?i ho?c ?: -?"],
      },
      {
        id: "g11",
        pattern: "-?/??? ???",
        meaning: "U?c gì... / Giá mà...",
        level: "B1",
        usage: "Di?n d?t mong mu?n v? di?u không th?c t? ho?c khó x?y ra",
        structure: "Ð?ng t?/Tính t? + -?/??? ???",
        examples: [
          { korean: "???? ? ??? ????.", vietnamese: "U?c gì tôi nói ti?ng Hàn gi?i." },
          { korean: "??? ???? ????.", vietnamese: "U?c gì th?i ti?t d?p." },
          { korean: "?? ???? ????.", vietnamese: "U?c gì tôi có nhi?u ti?n." },
        ],
        tips: ["Di?n d?t u?c mu?n không ch?c th?c hi?n du?c", "Khác v?i -? ?? (mu?n, có th? th?c hi?n)"],
      },
      {
        id: "g12",
        pattern: "-(?)? ? ??/??",
        meaning: "Có th? / Không th?",
        level: "A2",
        usage: "Di?n d?t kh? nang ho?c không có kh? nang làm gì",
        structure: "Ð?ng t? + -(?)? ? ??/??",
        examples: [
          { korean: "?? ??? ? ? ???.", vietnamese: "Tôi có th? boi." },
          { korean: "??? ? ? ???.", vietnamese: "Bây gi? tôi không th? di." },
          { korean: "???? ?? ? ????", vietnamese: "B?n có th? nói ti?ng Hàn không?" },
        ],
        tips: ["Phân bi?t v?i -?/?? ?? (du?c phép)", "Phân bi?t v?i -(?)? ? ?? (bi?t cách làm)"],
      },
    ],
  },
  {
    id: "contrast",
    name: "??? ??",
    nameVi: "Tuong ph?n & Nhu?ng b?",
    icon: "ri-arrow-left-right-line",
    color: "#fb923c",
    description: "Ng? pháp di?n d?t s? tuong ph?n và nhu?ng b?",
    points: [
      {
        id: "g13",
        pattern: "-??",
        meaning: "Nhung... / Tuy nhiên...",
        level: "A2",
        usage: "N?i hai m?nh d? có ý nghia tuong ph?n",
        structure: "M?nh d? 1 + -?? + M?nh d? 2",
        examples: [
          { korean: "???? ???? ?????.", vietnamese: "Ti?ng Hàn khó nhung thú v?." },
          { korean: "?? ??? ??? ???.", vietnamese: "Tr?i mua nhung tôi mu?n ra ngoài." },
          { korean: "????? ???? ??.", vietnamese: "M?t nhung ph?i h?c." },
        ],
        tips: ["Ch? ng? hai m?nh d? thu?ng gi?ng nhau", "Khác v?i -?? (b?i c?nh/tuong ph?n nh? hon)"],
      },
      {
        id: "g14",
        pattern: "-(?)? ??",
        meaning: "Ch?c là... nhung... / Dù... nhung...",
        level: "B2",
        usage: "Di?n d?t suy doán k?t h?p v?i s? tuong ph?n ho?c lo l?ng",
        structure: "Ð?ng t?/Tính t? + -(?)? ??",
        examples: [
          { korean: "?? ?? ? ?? ???.", vietnamese: "Ch?c là v?t v? nhung b?n dang làm t?t d?y." },
          { korean: "?? ?? ?? ? ?????", vietnamese: "Ch?c là dói r?i, an gì nh??" },
          { korean: "?? ? ?? ??? ?????.", vietnamese: "Ch?c là tr?i s? mua, hãy mang ô di." },
        ],
        tips: ["Th? hi?n s? quan tâm ho?c lo l?ng cho ngu?i khác", "Thu?ng dùng trong h?i tho?i t? nhiên"],
      },
      {
        id: "g15",
        pattern: "-?/??",
        meaning: "Dù... cung... / M?c dù...",
        level: "B1",
        usage: "Di?n d?t nhu?ng b? — dù di?u ki?n có nhu th? nào, k?t qu? v?n v?y",
        structure: "Ð?ng t?/Tính t? + -?/?? + k?t qu?",
        examples: [
          { korean: "??? ??? ??.", vietnamese: "Dù b?n cung t?p th? d?c." },
          { korean: "?? ?? ???.", vietnamese: "Dù tr?i mua cung ra ngoài." },
          { korean: "???? ???? ???.", vietnamese: "Dù khó cung không b? cu?c." },
        ],
        tips: ["Khác v?i -?? (tuong ph?n don gi?n)", "-?/?? nh?n m?nh k?t qu? không thay d?i"],
      },
    ],
  },
  {
    id: "politeness",
    name: "???? ??",
    nameVi: "Kính ng? & L?ch s?",
    icon: "ri-user-star-line",
    color: "app-accent-primary",
    description: "Ng? pháp kính ng? và cách nói l?ch s?",
    points: [
      {
        id: "g16",
        pattern: "-(?)??",
        meaning: "Hãy... (l?ch s?) / Xin hãy...",
        level: "A1",
        usage: "M?nh l?nh ho?c d? ngh? l?ch s?",
        structure: "Ð?ng t? + -(?)??",
        examples: [
          { korean: "?? ????.", vietnamese: "Xin hãy ng?i dây." },
          { korean: "??? ??? ???.", vietnamese: "Xin hãy nói ch?m thôi." },
          { korean: "??? ?????.", vietnamese: "Xin hãy d?i m?t chút." },
        ],
        tips: ["L?ch s? hon -?/?? khi ra l?nh", "Thêm ??? d? nh? v?: -?/? ???"],
      },
      {
        id: "g17",
        pattern: "-(?)??",
        meaning: "Kính ng? cho ch? ng?",
        level: "A2",
        usage: "Tôn tr?ng ch? ng? (ngu?i l?n tu?i, c?p trên)",
        structure: "Ð?ng t? + -(?)? + duôi câu",
        examples: [
          { korean: "???? ????.", vietnamese: "Th?y/Cô dã d?n r?i." },
          { korean: "????? ????.", vietnamese: "Bà dang ng?." },
          { korean: "???? ??? ???.", vietnamese: "B? di làm." },
        ],
        tips: ["Dùng ?? thay ?/? khi ch? ng? du?c tôn tr?ng", "M?t s? t? d?c bi?t: ???(an), ????(ng?), ???(?)"],
      },
      {
        id: "g18",
        pattern: "-????",
        meaning: "Tôi s?... (trang tr?ng)",
        level: "B1",
        usage: "Di?n d?t ý d?nh ho?c d? doán trong van phong trang tr?ng",
        structure: "Ð?ng t? + -????",
        examples: [
          { korean: "?? ?? ???????.", vietnamese: "Tôi s? ki?m tra ngay bây gi?." },
          { korean: "??? ??????.", vietnamese: "Tôi s? c? g?ng h?t s?c." },
          { korean: "? ????????.", vietnamese: "Xin nh? s? giúp d? c?a b?n." },
        ],
        tips: ["Dùng trong môi tru?ng công s?, d?ch v? khách hàng", "L?ch s? hon -(?)? ???"],
      },
    ],
  },
];

// --- Level colors -------------------------------------------------------------
const levelColors: Record<string, string> = {
  A1: "#34d399", A2: "#6ee7b7", B1: "#fbbf24", B2: "#f59e0b", C1: "#f87171",
};

// --- Grammar Card -------------------------------------------------------------
function GrammarCard({ point, onSelect }: { point: GrammarPoint; onSelect: () => void }) {
  return (
    <button onClick={onSelect}
      className="text-left p-4 rounded-xl border border-app-border bg-app-surface/50 hover:bg-app-card/50 hover:border-white/15 transition-all cursor-pointer group w-full">
      <div className="flex items-start justify-between mb-2">
        <span className="text-app-accent-primary font-bold text-base font-mono">{point.pattern}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${levelColors[point.level]}20`, color: levelColors[point.level] }}>
          {point.level}
        </span>
      </div>
      <p className="text-white/80 text-sm font-medium mb-1">{point.meaning}</p>
      <p className="text-app-text-secondary text-xs line-clamp-2">{point.usage}</p>
      <div className="mt-3 pt-3 border-t border-app-border">
        <p className="text-white/50 text-xs italic">{point.examples[0].korean}</p>
        <p className="text-app-text-muted text-xs">{point.examples[0].vietnamese}</p>
      </div>
    </button>
  );
}

// --- Grammar Detail Modal -----------------------------------------------------
function GrammarDetail({ point, onClose }: { point: GrammarPoint; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"examples" | "tips" | "practice">("examples");
  const [practiceInput, setPracticeInput] = useState("");
  const [practiceResult, setPracticeResult] = useState<string | null>(null);

  const handleTTS = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "ko-KR";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  const handlePracticeCheck = () => {
    if (practiceInput.trim()) {
      setPracticeResult("Câu c?a b?n trông ?n! Hãy so sánh v?i các ví d? d? t? dánh giá.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-app-border bg-[#1a1f2e]"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1f2e] border-b border-app-border px-6 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-app-accent-primary font-bold text-xl font-mono">{point.pattern}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${levelColors[point.level]}20`, color: levelColors[point.level] }}>
                {point.level}
              </span>
            </div>
            <p className="text-white/70 text-sm">{point.meaning}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 text-white/50 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="p-6">
          {/* Structure */}
          <div className="p-4 rounded-xl bg-app-accent-primary/5 border border-app-accent-primary/15 mb-5">
            <p className="text-app-accent-primary text-xs font-semibold mb-1">C?u trúc</p>
            <p className="text-white font-mono text-sm">{point.structure}</p>
          </div>

          {/* Usage */}
          <p className="text-white/60 text-sm mb-5">{point.usage}</p>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-app-card/50 rounded-xl mb-5 w-fit">
            {(["examples", "tips", "practice"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${activeTab === tab ? "bg-app-accent-primary text-[#141720]" : "text-white/50 hover:text-white/80"}`}>
                {tab === "examples" ? "Ví d?" : tab === "tips" ? "M?o" : "Luy?n t?p"}
              </button>
            ))}
          </div>

          {activeTab === "examples" && (
            <div className="space-y-3">
              {point.examples.map((ex, i) => (
                <div key={i} className="p-4 rounded-xl border border-app-border bg-app-surface/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-white font-medium text-base mb-1">{ex.korean}</p>
                      <p className="text-white/50 text-sm">{ex.vietnamese}</p>
                      {ex.note && <p className="text-app-accent-primary/70 text-xs mt-1 font-mono">{ex.note}</p>}
                    </div>
                    <button onClick={() => handleTTS(ex.korean)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary hover:text-white/70 cursor-pointer flex-shrink-0">
                      <i className="ri-volume-up-line text-sm"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "tips" && (
            <div className="space-y-3">
              <div className="space-y-2">
                {point.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-app-surface/50 border border-app-border">
                    <i className="ri-lightbulb-line text-app-accent-primary text-sm mt-0.5 flex-shrink-0"></i>
                    <p className="text-white/70 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
              {point.commonMistakes && (
                <div>
                  <p className="text-rose-400 text-xs font-semibold mb-2">L?i thu?ng g?p</p>
                  {point.commonMistakes.map((m, i) => (
                    <div key={i} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15">
                      <p className="text-white/60 text-sm">{m}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "practice" && (
            <div>
              <p className="text-white/60 text-sm mb-4">Hãy t?o m?t câu s? d?ng c?u trúc <span className="text-app-accent-primary font-mono">{point.pattern}</span>:</p>
              <textarea value={practiceInput} onChange={e => setPracticeInput(e.target.value)}
                placeholder="Vi?t câu c?a b?n ? dây..."
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm bg-app-card/50 border border-app-border text-white placeholder-white/25 outline-none resize-none focus:border-app-accent-primary/30 mb-3" />
              <button onClick={handlePracticeCheck} disabled={!practiceInput.trim()}
                className="w-full py-2.5 rounded-xl bg-app-accent-primary text-[#141720] font-bold text-sm disabled:opacity-30 cursor-pointer whitespace-nowrap">
                Ki?m tra
              </button>
              {practiceResult && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-app-accent-success text-sm">{practiceResult}</p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-app-border">
                <p className="text-app-text-secondary text-xs mb-2">Ví d? tham kh?o:</p>
                {point.examples.slice(0, 2).map((ex, i) => (
                  <p key={i} className="text-white/50 text-xs mb-1 font-mono">{ex.korean}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------
export default function GrammarByTopicPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<GrammarPoint | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const currentTopic = grammarTopics.find(t => t.id === selectedTopic);

  const filteredPoints = useMemo(() => {
    if (!currentTopic) return [];
    return currentTopic.points.filter(p => {
      const matchLevel = levelFilter === "all" || p.level === levelFilter;
      const matchSearch = !searchQuery || p.pattern.includes(searchQuery) || p.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLevel && matchSearch;
    });
  }, [currentTopic, levelFilter, searchQuery]);

  const allPoints = useMemo(() => {
    if (searchQuery) {
      return grammarTopics.flatMap(t => t.points).filter(p =>
        p.pattern.includes(searchQuery) || p.meaning.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  }, [searchQuery]);

  const totalPoints = grammarTopics.reduce((s, t) => s + t.points.length, 0);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white font-bold text-2xl mb-1">Luy?n ng? pháp theo ch? d?</h1>
          <p className="text-white/50 text-sm">Ng? pháp phân lo?i theo tình hu?ng th?c t? — h?c có h? th?ng và hi?u qu?</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm c?u trúc ng? pháp... (VD: -??, mu?n, di?u ki?n)"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-app-card/50 border border-app-border text-white text-sm placeholder-white/25 outline-none focus:border-white/20" />
        </div>

        {/* Search results */}
        {searchQuery && allPoints.length > 0 && (
          <div className="mb-6">
            <p className="text-white/50 text-xs mb-3">K?t qu? tìm ki?m ({allPoints.length})</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allPoints.map(p => (
                <GrammarCard key={p.id} point={p} onSelect={() => setSelectedPoint(p)} />
              ))}
            </div>
          </div>
        )}

        {!searchQuery && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Ch? d?", value: grammarTopics.length, icon: "ri-apps-line", color: "app-accent-primary" },
                { label: "C?u trúc", value: totalPoints, icon: "ri-book-2-line", color: "#34d399" },
                { label: "C?p d?", value: "A1–C1", icon: "ri-bar-chart-line", color: "#a78bfa" },
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

            {!selectedTopic ? (
              /* Topic grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grammarTopics.map(topic => (
                  <button key={topic.id} onClick={() => setSelectedTopic(topic.id)}
                    className="text-left p-5 rounded-2xl border border-app-border bg-app-surface/50 hover:bg-app-card/50 hover:border-white/15 transition-all cursor-pointer group">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl mb-3" style={{ backgroundColor: `${topic.color}20` }}>
                      <i className={`${topic.icon} text-lg`} style={{ color: topic.color }}></i>
                    </div>
                    <h3 className="text-white font-bold text-base mb-0.5 group-hover:text-app-accent-primary transition-colors">{topic.name}</h3>
                    <p className="text-white/50 text-sm mb-2">{topic.nameVi}</p>
                    <p className="text-white/35 text-xs mb-3">{topic.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-app-text-muted text-xs">{topic.points.length} c?u trúc</span>
                      <div className="flex gap-1">
                        {[...new Set(topic.points.map(p => p.level))].map(lvl => (
                          <span key={lvl} className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{ backgroundColor: `${levelColors[lvl]}20`, color: levelColors[lvl] }}>{lvl}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* Topic detail */
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <button onClick={() => setSelectedTopic(null)}
                    className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm cursor-pointer transition-colors">
                    <i className="ri-arrow-left-line"></i> T?t c? ch? d?
                  </button>
                  <span className="text-app-text-muted">/</span>
                  <span className="text-white/70 text-sm font-medium">{currentTopic?.name}</span>
                </div>

                {/* Level filter */}
                <div className="flex gap-2 flex-wrap mb-5">
                  {["all", "A1", "A2", "B1", "B2", "C1"].map(lvl => (
                    <button key={lvl} onClick={() => setLevelFilter(lvl)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${levelFilter === lvl ? (lvl === "all" ? "bg-white/15 text-white" : "") : "bg-app-card/50 text-white/50 hover:bg-white/8"}`}
                      style={levelFilter === lvl && lvl !== "all" ? { backgroundColor: `${levelColors[lvl]}25`, color: levelColors[lvl] } : {}}>
                      {lvl === "all" ? "T?t c?" : lvl}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPoints.map(p => (
                    <GrammarCard key={p.id} point={p} onSelect={() => setSelectedPoint(p)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedPoint && (
        <GrammarDetail point={selectedPoint} onClose={() => setSelectedPoint(null)} />
      )}
    </DashboardLayout>
  );
}

