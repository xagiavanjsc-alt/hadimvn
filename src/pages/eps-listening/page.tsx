import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import { EPS_LESSON_TOPICS } from "@/mocks/epsLessons";

// --- Types ----------------------------------------------------------------
interface ListeningQuestion {
  id: string;
  topic: string;
  level: "easy" | "medium" | "hard";
  audioText: string;
  audioTextVi: string;
  question: string;
  questionVi: string;
  options: string[];
  optionsVi: string[];
  correctIndex: number;
  explanation: string;
  context?: string;
  contextVi?: string;
}

// --- Mock listening questions (dùng Web Speech API d? d?c) ---------------
const LISTENING_QUESTIONS: ListeningQuestion[] = [
  {
    id: "lq1",
    topic: "greeting",
    level: "easy",
    audioText: "?????. ?? ??????. ????? ???. ??? ????.",
    audioTextVi: "Xin chào. Tôi là Kim Minjun. Tôi d?n t? Vi?t Nam. R?t vui du?c g?p b?n.",
    question: "? ??? ?? ???? ????",
    questionVi: "Ngu?i này d?n t? nu?c nào?",
    options: ["??", "???", "??", "??"],
    optionsVi: ["Hàn Qu?c", "Vi?t Nam", "Trung Qu?c", "Nh?t B?n"],
    correctIndex: 1,
    explanation: "\"????? ???\" = d?n t? Vi?t Nam.",
  },
  {
    id: "lq2",
    topic: "workplace",
    level: "easy",
    audioText: "?? ?? ?? ?? ??? ???. ???? ? ?? ???. ?? ???.",
    audioTextVi: "Hôm nay lúc 9 gi? sáng có cu?c h?p. Phòng h?p ? t?ng 3. Ð?ng d?n mu?n.",
    question: "??? ? ?? ????",
    questionVi: "Cu?c h?p lúc m?y gi??",
    options: ["?? ?? ?", "?? ?? ?", "?? ? ?", "?? ? ?"],
    optionsVi: ["8 gi? sáng", "9 gi? sáng", "10 gi? sáng", "2 gi? chi?u"],
    correctIndex: 1,
    explanation: "\"?? ?? ?? ??? ???\" = có cu?c h?p lúc 9 gi? sáng.",
  },
  {
    id: "lq3",
    topic: "safety",
    level: "easy",
    audioText: "???? ???? ?? ???? ???? ??? ?????. ??? ?? ?????.",
    audioTextVi: "Tru?c khi vào khu làm vi?c, b?t bu?c ph?i d?i mu b?o h? và di giày b?o h?. An toàn là quan tr?ng nh?t.",
    question: "???? ???? ?? ??? ?? ???",
    questionVi: "Tru?c khi vào khu làm vi?c ph?i làm gì?",
    options: ["?? ???", "?? ??? ????", "?? ???", "??? ??"],
    optionsVi: ["R?a tay", "M?c trang b? b?o h?", "An com", "G?i di?n"],
    correctIndex: 1,
    explanation: "\"???? ???? ??? ?????\" = b?t bu?c ph?i d?i mu và di giày b?o h?.",
  },
  {
    id: "lq4",
    topic: "workplace",
    level: "medium",
    audioText: "?? ? ??? ????? ????. ?? ?? ??? ?? ???? ???. ??? ???? ????? ?? ???.",
    audioTextVi: "Luong tháng này là 2.500.000 won. Bao g?m ph? c?p tang ca 300.000 won. Sau khi tr? thu? nh?n du?c 2.200.000 won.",
    question: "??? ???? ??? ?? ??? ?????",
    questionVi: "S? ti?n th?c nh?n sau khi tr? thu? là bao nhiêu?",
    options: ["??? ?", "????? ?", "????? ?", "??? ?"],
    optionsVi: ["2.000.000 won", "2.200.000 won", "2.500.000 won", "3.000.000 won"],
    correctIndex: 1,
    explanation: "\"??? ???? ????? ?? ???\" = sau khi tr? thu? nh?n 2.200.000 won.",
  },
  {
    id: "lq5",
    topic: "daily",
    level: "easy",
    audioText: "?? ?? ???? ???. ?? ? ? ???. ???? ???? ???. ?? ???.",
    audioTextVi: "Tôi s?ng ? ký túc xá công ty. Có 2 phòng. Có máy gi?t và t? l?nh. R?t ti?n.",
    question: "? ??? ??? ????",
    questionVi: "Ngu?i này s?ng ? dâu?",
    options: ["?? ?", "?? ???", "?? ?", "??"],
    optionsVi: ["Nhà riêng", "Ký túc xá công ty", "Nhà b?n", "Khách s?n"],
    correctIndex: 1,
    explanation: "\"?? ???? ???\" = s?ng ? ký túc xá công ty.",
  },
  {
    id: "lq6",
    topic: "health",
    level: "medium",
    audioText: "???? ??? ??? ?? ??. ??? ??. ??? ?? ?? ???? ??? ????. ?? ??????.",
    audioTextVi: "T? hôm qua dau d?u và b? s?t. Cung b? ho. Ðã di b?nh vi?n và du?c bác si khám. Ðã du?c kê don thu?c.",
    question: "? ??? ??? ?? ?? ??????",
    questionVi: "Ði?u nào KHÔNG ph?i là tri?u ch?ng c?a ngu?i này?",
    options: ["??? ???", "?? ??", "??? ??", "?? ???"],
    optionsVi: ["Ðau d?u", "B? s?t", "B? ho", "Ðau b?ng"],
    correctIndex: 3,
    explanation: "Ðo?n h?i tho?i d? c?p dau d?u, s?t, ho — không d? c?p dau b?ng.",
  },
  {
    id: "lq7",
    topic: "transport",
    level: "easy",
    audioText: "??? ? ??? ?? ????? ????. ??? ??? ???? ??. ? ?? ? ???.",
    audioTextVi: "Ði tàu di?n ng?m tuy?n 2 và xu?ng ? ga Gangnam. T? dó chuy?n sang xe buýt là du?c. M?t kho?ng 30 phút.",
    question: "????? ??? ?? ???",
    questionVi: "? ga Gangnam ph?i làm gì?",
    options: ["??? ??", "??? ????", "????", "???? ?? ??"],
    optionsVi: ["Ði taxi", "Chuy?n sang xe buýt", "Ði b?", "Ti?p t?c di tàu di?n ng?m"],
    correctIndex: 1,
    explanation: "\"??? ???? ??\" = chuy?n sang xe buýt là du?c.",
  },
  {
    id: "lq8",
    topic: "law",
    level: "hard",
    audioText: "?????? ??? ?? ??? ? ????. ??? ??? ??? 4? ??? ???? ??. ??? ?? ????. ???? ??? ?? ?????.",
    audioTextVi: "Theo h?p d?ng lao d?ng, th?i h?n h?p d?ng là 1 nam. Luong tháng là 2.000.000 won và ph?i tham gia 4 lo?i b?o hi?m. Ngày phép nam là 15 ngày. Hãy d?c k? h?p d?ng tru?c khi ký.",
    question: "? ??????? ??? ??????",
    questionVi: "Theo h?p d?ng này, ngày phép nam là bao nhiêu ngày?",
    options: ["? ?", "?? ?", "?? ?", "?? ?"],
    optionsVi: ["10 ngày", "12 ngày", "15 ngày", "20 ngày"],
    correctIndex: 2,
    explanation: "\"??? ?? ????\" = ngày phép nam là 15 ngày.",
  },
  {
    id: "lq9",
    topic: "safety",
    level: "medium",
    audioText: "??? ?????! ???? ???. ???? ?? ?????. ?????? ???? ???. ??? ?????. 119? ?????.",
    audioTextVi: "Có h?a ho?n! Ð?ng ho?ng lo?n. Hãy so tán nhanh qua l?i thoát hi?m. Không dùng thang máy. Dùng c?u thang b?. Báo cáo cho 119.",
    question: "?? ? ?????? ???? ? ?? ??? ??????",
    questionVi: "T?i sao không du?c dùng thang máy khi có h?a ho?n?",
    options: ["???", "????", "????", "??? ???"],
    optionsVi: ["Vì ch?m", "Vì nguy hi?m", "Vì h?ng", "Vì dông ngu?i"],
    correctIndex: 1,
    explanation: "Khi có h?a ho?n, thang máy r?t nguy hi?m vì có th? m?t di?n ho?c khói xâm nh?p. Ph?i dùng c?u thang b?.",
  },
  {
    id: "lq10",
    topic: "workplace",
    level: "medium",
    audioText: "?? ??? ???? ??? ???. ?? ??? ? ? ???????. ?? ??? ?? ?? ??? ?? ?? ?????. ??? ???? ????.",
    audioTextVi: "Ngày mai bu?i sáng có dào t?o nhân viên m?i. Ð?a di?m dào t?o là phòng h?p l?n t?ng 2. Th?i gian dào t?o t? 9 gi? sáng d?n 5 gi? chi?u. B?a trua do công ty cung c?p.",
    question: "???? ??? ???? ???",
    questionVi: "Ðào t?o nhân viên m?i ? dâu?",
    options: ["? ? ????", "? ? ????", "? ? ??", "? ? ???"],
    optionsVi: ["Phòng h?p nh? t?ng 1", "Phòng h?p l?n t?ng 2", "H?i tru?ng t?ng 3", "Phòng dào t?o t?ng 4"],
    correctIndex: 1,
    explanation: "\"? ? ????\" = phòng h?p l?n t?ng 2.",
  },
  {
    id: "lq11",
    topic: "daily",
    level: "medium",
    audioText: "???? ?? ???. ?? ?? ?, ?? ? ?, ?? ? ?? ???. ?? ?? ?? ?????. ??? ?????.",
    audioTextVi: "Ðã di mua s?m ? siêu th?. Mua 5 gói mì, 1 v? tr?ng, 2 h?p s?a. T?ng c?ng 23.000 won. Ðã thanh toán b?ng th?.",
    question: "? ??? ??? ??????",
    questionVi: "Ngu?i này thanh toán b?ng cách nào?",
    options: ["????", "???", "?????", "?????"],
    optionsVi: ["B?ng ti?n m?t", "B?ng th?", "B?ng di?n tho?i", "B?ng phi?u quà t?ng"],
    correctIndex: 1,
    explanation: "\"??? ?????\" = dã thanh toán b?ng th?.",
  },
  {
    id: "lq12",
    topic: "culture",
    level: "easy",
    audioText: "??? ??? ? ?????. ???? ??? ??? ????. ???? ??? ???. ??? ?? ???? ???.",
    audioTextVi: "Chuseok là ngày l? l?n c?a Hàn Qu?c. Gia dình t? h?p làm bánh songpyeon. Cúng t? tiên. Nhi?u ngu?i v? quê.",
    question: "??? ???? ?? ??? ??? ??????",
    questionVi: "Vào Chuseok, gia dình cùng nhau làm món an gì?",
    options: ["??", "???", "??", "???"],
    optionsVi: ["Kim chi", "Bulgogi", "Bánh songpyeon", "Com tr?n"],
    correctIndex: 2,
    explanation: "\"???? ??? ??? ????\" = gia dình t? h?p làm bánh songpyeon.",
  },
  {
    id: "lq13",
    topic: "health",
    level: "hard",
    audioText: "????? ???? ???? ??? ???? ? ???. ??? ???? ????? ??? ? ???. ?? ???? ???? ????. ??? ? ??? ???.",
    audioTextVi: "Khi tham gia b?o hi?m y t?, có th? du?c h? tr? m?t ph?n chi phí b?nh vi?n. Ngu?i lao d?ng nu?c ngoài cung có th? tham gia b?o hi?m y t?. Phí b?o hi?m du?c tr? t? luong hàng tháng. Khi ?m nh?t d?nh ph?i di b?nh vi?n.",
    question: "????? ?? ???? ?? ?? ??????",
    questionVi: "Ði?u nào dúng v? b?o hi?m y t??",
    options: ["?? ??? ??? ? ???", "??? ??? ????", "???? ??? ? ???", "??? ??? ? ???"],
    optionsVi: ["Ch? ngu?i Hàn m?i du?c tham gia", "H? tr? toàn b? chi phí b?nh vi?n", "Ngu?i nu?c ngoài cung du?c tham gia", "Tham gia mi?n phí"],
    correctIndex: 2,
    explanation: "\"??? ???? ????? ??? ? ???\" = ngu?i lao d?ng nu?c ngoài cung có th? tham gia.",
  },
  {
    id: "lq14",
    topic: "greeting",
    level: "medium",
    audioText: "?? ?????. ?? ??? ? ???? ??. ??? ????? ???. ??? ?? ?????. ??? ? ??????.",
    audioTextVi: "R?t vui du?c g?p l?n d?u. Tôi tên là Nguy?n Van An. Ð?n t? Hà N?i, Vi?t Nam. V?a m?i vào công ty. Mong du?c nh? c?y.",
    question: "? ??? ?? ???? ?? ???",
    questionVi: "Ði?u nào dúng v? ngu?i này?",
    options: ["?? ?????", "???? ???", "?? ?????", "?? ????"],
    optionsVi: ["Là ngu?i Hàn Qu?c", "Ð?n t? Seoul", "V?a m?i vào công ty", "Ðã làm lâu r?i"],
    correctIndex: 2,
    explanation: "\"??? ?? ?????\" = v?a m?i vào công ty.",
  },
  {
    id: "lq15",
    topic: "transport",
    level: "hard",
    audioText: "??? ?? ??? ?????. ??? ? ?? ??? ????. ? ???? ??? ???? ??. ?? ??? ??? ? ???.",
    audioTextVi: "Chuy?n tàu di?n ng?m cu?i là lúc n?a dêm. Xe buýt ch?y d?n 11 gi? dêm. Sau dó ph?i dùng taxi. Taxi dêm khuya d?t hon.",
    question: "? ?? ?? ????? ??? ?? ???",
    questionVi: "Mu?n di chuy?n lúc 12 gi? dêm ph?i làm gì?",
    options: ["???? ??", "??? ??", "??? ??", "????"],
    optionsVi: ["Ði tàu di?n ng?m", "Ði xe buýt", "Ði taxi", "Ði b?"],
    correctIndex: 2,
    explanation: "Tàu di?n ng?m cu?i lúc n?a dêm (12h), xe buýt d?n 11h. Lúc 12h dêm ch? còn taxi.",
  },
  {
    id: "lq16",
    topic: "workplace",
    level: "hard",
    audioText: "?? ?? ??? ? ?? ???. ?? ??? ??? ??? ???. ? ??? ? ????. ?? ??? ??? ???.",
    audioTextVi: "Tháng này tang ca 10 ti?ng. Ph? c?p tang ca là 1,5 l?n luong gi?. Luong gi? c?a tôi là 10.000 won. Hãy tính ph? c?p tang ca.",
    question: "?? ? ?? ??? ?????",
    questionVi: "Ph? c?p tang ca tháng này là bao nhiêu?",
    options: ["?? ?", "??? ?", "??? ?", "???? ?"],
    optionsVi: ["100.000 won", "150.000 won", "200.000 won", "250.000 won"],
    correctIndex: 1,
    explanation: "10.000 won × 1.5 × 10 gi? = 150.000 won = ??? ?.",
  },
  {
    id: "lq17",
    topic: "safety",
    level: "easy",
    audioText: "?? ?? ????. ???? ????. ?? ????? ????. ??? ?????? ???? ? ???.",
    audioTextVi: "B? thuong khi làm vi?c. B? d?t ngón tay. Tru?c tiên hãy du?c so c?u. Và có th? di?u tr? b?ng b?o hi?m tai n?n lao d?ng.",
    question: "?? ? ??? ? ?? ?? ? ?? ??????",
    questionVi: "Khi b? thuong khi làm vi?c, vi?c d?u tiên c?n làm là gì?",
    options: ["?? ??", "????? ???", "?? ???", "???? ???"],
    optionsVi: ["V? nhà", "Ðu?c so c?u", "Ti?p t?c làm vi?c", "T?c gi?n v?i c?p trên"],
    correctIndex: 1,
    explanation: "\"?? ????? ????\" = tru?c tiên hãy du?c so c?u.",
  },
  {
    id: "lq18",
    topic: "daily",
    level: "hard",
    audioText: "????? ????? ??. ??? ?? ?? ?? ???? ?????. ???? ?? ????. ??? ?? ???? ? ?? ??? ????.",
    audioTextVi: "Mu?n chuy?n ti?n v? Vi?t Nam. Ðã d?n ngân hàng di?n don chuy?n ti?n ngo?i t?. Phí là 5.000 won. T? giá hôm nay là 100 won = 1.700 d?ng.",
    question: "? ??? ???? ? ?? ??????",
    questionVi: "Ngu?i này dã làm gì ? ngân hàng?",
    options: ["??? ?????", "?? ?? ???? ?????", "??? ?????", "??? ?????"],
    optionsVi: ["M? tài kho?n", "Ði?n don chuy?n ti?n ngo?i t?", "Xin vay ti?n", "Làm th?"],
    correctIndex: 1,
    explanation: "\"?? ?? ???? ?????\" = dã di?n don chuy?n ti?n ngo?i t?.",
  },
  {
    id: "lq19",
    topic: "culture",
    level: "medium",
    audioText: "????? ??? ? ??? ?? ??? ??? ??. ? ??? ??? ?? ?? ????. ?? ?? ? ??? ??? ?? ????.",
    audioTextVi: "? Hàn Qu?c, khi an com ph?i d?i ngu?i l?n tu?i c?m dua tru?c. Nh?n d? an b?ng hai tay là l?ch s?. Nói to trong khi an là b?t l?ch s?.",
    question: "?? ?? ??? ?? ?? ??????",
    questionVi: "Ði?u nào dúng v? phép t?c an u?ng Hàn Qu?c?",
    options: ["???? ?? ???", "? ??? ??? ???", "??? ?? ??? ???", "?? ?? ?? ???"],
    optionsVi: ["An tru?c ngu?i l?n", "Nh?n d? an b?ng m?t tay", "Ð?i ngu?i l?n c?m dua tru?c", "Nói to trong khi an"],
    correctIndex: 2,
    explanation: "\"??? ?? ??? ??? ??\" = ph?i d?i ngu?i l?n c?m dua tru?c.",
  },
  {
    id: "lq20",
    topic: "law",
    level: "medium",
    audioText: "????? ????. ?? ?? ???? ??? ? ???. ?? ?????? ?? ??? ? ? ???. ?? ???? ???? ???? ??? ????.",
    audioTextVi: "B? sa th?i b?t công. Trong tru?ng h?p này có th? t? cáo lên S? Lao d?ng. Ho?c có th? n?p don xin c?u tr? lên ?y ban Lao d?ng. N?u khó gi?i quy?t m?t mình, hãy nh? s? giúp d? c?a chuyên gia lao d?ng.",
    question: "????? ??? ? ? ? ?? ?? ?? ???",
    questionVi: "Ði?u nào KHÔNG th? làm khi b? sa th?i b?t công?",
    options: ["???? ????", "?????? ????", "???? ??? ???", "???? ? ??"],
    optionsVi: ["T? cáo lên S? Lao d?ng", "N?p don lên ?y ban Lao d?ng", "Nh? chuyên gia lao d?ng", "Không làm gì c?"],
    correctIndex: 3,
    explanation: "Khi b? sa th?i b?t công, có nhi?u cách d? b?o v? quy?n l?i. Không nên b? qua.",
  },
];

// --- Helpers --------------------------------------------------------------
function speakKorean(text: string, rate = 0.75) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

const LEVEL_COLORS = { easy: "#34d399", medium: "app-accent-primary", hard: "#f87171" };
const LEVEL_LABELS = { easy: "D?", medium: "Trung bình", hard: "Khó" };

// --- Question Card --------------------------------------------------------
function ListeningCard({
  q,
  answered,
  onAnswer,
  showScript,
  onToggleScript,
}: {
  q: ListeningQuestion;
  answered: number | null;
  onAnswer: (i: number) => void;
  showScript: boolean;
  onToggleScript: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const topicInfo = EPS_LESSON_TOPICS.find(t => t.id === q.topic);

  const handlePlay = useCallback((rate: number) => {
    setIsPlaying(true);
    setPlayCount(c => c + 1);
    speakKorean(q.audioText, rate);
    const duration = (q.audioText.length / 5) * (1 / rate) * 1000 + 500;
    setTimeout(() => setIsPlaying(false), duration);
  }, [q.audioText]);

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
      {/* Topic + level badges */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-app-border">
        {topicInfo && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${topicInfo.color}15`, color: topicInfo.color }}>
            <i className={`${topicInfo.icon} mr-1`}></i>{topicInfo.label}
          </span>
        )}
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${LEVEL_COLORS[q.level]}15`, color: LEVEL_COLORS[q.level] }}>
          {LEVEL_LABELS[q.level]}
        </span>
        {playCount > 0 && (
          <span className="text-[10px] text-app-text-muted ml-auto">Ðã nghe {playCount} l?n</span>
        )}
      </div>

      {/* Audio player */}
      <div className="px-5 py-4 bg-white/2 border-b border-app-border">
        <p className="text-app-text-secondary text-xs mb-3">Nghe do?n h?i tho?i và tr? l?i câu h?i:</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handlePlay(0.75)}
            disabled={isPlaying}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${isPlaying ? "bg-app-accent-primary/20 text-app-accent-primary" : "bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg"}`}
          >
            <i className={isPlaying ? "ri-pause-fill" : "ri-play-fill"}></i>
            {isPlaying ? "Ðang phát..." : "Nghe (bình thu?ng)"}
          </button>
          <button
            onClick={() => handlePlay(0.5)}
            disabled={isPlaying}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-app-border text-white/50 hover:text-white/70 hover:bg-app-card/50 text-sm transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
          >
            <i className="ri-speed-line"></i>
            Ch?m hon
          </button>
          <button
            onClick={onToggleScript}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer whitespace-nowrap ml-auto ${showScript ? "border-[#06b6d4]/30 bg-[#06b6d4]/10 text-[#06b6d4]" : "border-app-border text-app-text-secondary hover:text-white/60"}`}
          >
            <i className={showScript ? "ri-eye-off-line" : "ri-eye-line"}></i>
            {showScript ? "?n script" : "Xem script"}
          </button>
        </div>

        {/* Script */}
        {showScript && (
          <div className="mt-3 p-3 rounded-xl bg-[#06b6d4]/5 border border-[#06b6d4]/15">
            <p className="text-[#06b6d4] text-sm font-medium leading-relaxed">{q.audioText}</p>
            <p className="text-app-text-secondary text-xs mt-1.5 italic leading-relaxed">{q.audioTextVi}</p>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="px-5 py-4">
        <p className="text-white font-semibold text-sm mb-1">{q.question}</p>
        <p className="text-app-text-secondary text-xs italic mb-4">{q.questionVi}</p>

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let cls = "border-app-border bg-app-surface/50 hover:border-white/15 hover:bg-app-card/50 cursor-pointer";
            if (answered !== null) {
              if (i === q.correctIndex) cls = "border-emerald-500/40 bg-emerald-500/8 cursor-default";
              else if (i === answered) cls = "border-red-500/40 bg-red-500/8 cursor-default";
              else cls = "border-app-border opacity-40 cursor-default";
            }
            return (
              <button
                key={i}
                onClick={() => answered === null && onAnswer(i)}
                disabled={answered !== null}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${cls}`}
              >
                <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold flex-shrink-0 ${answered !== null && i === q.correctIndex ? "bg-emerald-500/20 text-app-accent-success" : answered !== null && i === answered ? "bg-red-500/20 text-red-400" : "bg-app-card/50 text-app-text-muted"}`}>
                  {["A","B","C","D"][i]}
                </span>
                <div>
                  <p className={`text-sm font-medium ${answered !== null && i === q.correctIndex ? "text-app-accent-success" : answered !== null && i === answered ? "text-red-400" : "text-white/70"}`}>{opt}</p>
                  <p className="text-app-text-muted text-xs">{q.optionsVi[i]}</p>
                </div>
                {answered !== null && i === q.correctIndex && <i className="ri-checkbox-circle-fill text-app-accent-success ml-auto"></i>}
                {answered !== null && i === answered && i !== q.correctIndex && <i className="ri-close-circle-fill text-red-400 ml-auto"></i>}
              </button>
            );
          })}
        </div>

        {answered !== null && (
          <div className={`mt-4 p-3 rounded-xl border text-xs leading-relaxed ${answered === q.correctIndex ? "border-emerald-500/20 bg-emerald-500/5 text-app-accent-success/80" : "border-orange-500/20 bg-orange-500/5 text-orange-400/80"}`}>
            <div className="flex items-start gap-2">
              <i className="ri-lightbulb-line text-sm flex-shrink-0 mt-0.5"></i>
              <p>{q.explanation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Page ------------------------------------------------------------
export default function EpsListeningPage() {
  const { addXP } = useXPSystem();
  const [answeredMap, setAnsweredMap] = useLocalStorage<Record<string, number>>("kts_eps_listening_answers", {});
  const [filterTopic, setFilterTopic] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [showScripts, setShowScripts] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<"browse" | "exam">("browse");
  const [examIdx, setExamIdx] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examDone, setExamDone] = useState(false);

  const filteredQuestions = useMemo(() => {
    return LISTENING_QUESTIONS.filter(q => {
      if (filterTopic !== "all" && q.topic !== filterTopic) return false;
      if (filterLevel !== "all" && q.level !== filterLevel) return false;
      return true;
    });
  }, [filterTopic, filterLevel]);

  const totalAnswered = Object.keys(answeredMap).length;
  const totalCorrect = LISTENING_QUESTIONS.filter(q => answeredMap[q.id] === q.correctIndex).length;
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const handleAnswer = useCallback((qId: string, idx: number) => {
    if (answeredMap[qId] !== undefined) return;
    setAnsweredMap(prev => ({ ...prev, [qId]: idx }));
    const q = LISTENING_QUESTIONS.find(x => x.id === qId);
    if (q && idx === q.correctIndex) {
      addXP(15, "Tr? l?i dúng câu nghe EPS");
    }
  }, [answeredMap, setAnsweredMap, addXP]);

  // Exam mode
  const examQuestions = useMemo(() => {
    const shuffled = [...LISTENING_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, []);

  const handleExamAnswer = (idx: number) => {
    const q = examQuestions[examIdx];
    setExamAnswers(prev => ({ ...prev, [q.id]: idx }));
  };

  const handleExamNext = () => {
    if (examIdx + 1 >= examQuestions.length) {
      setExamDone(true);
      const correct = examQuestions.filter(q => examAnswers[q.id] === q.correctIndex).length;
      addXP(correct * 20, `Hoàn thành bài thi nghe EPS (${correct}/10 dúng)`);
    } else {
      setExamIdx(i => i + 1);
    }
  };

  const examScore = examQuestions.filter(q => examAnswers[q.id] === q.correctIndex).length;

  return (
    <DashboardLayout
      title="Luy?n nghe EPS"
      subtitle="Nghe audio câu h?i EPS th?t — luy?n k? nang nghe hi?u cho k? thi lao d?ng Hàn Qu?c"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "T?ng câu nghe", value: LISTENING_QUESTIONS.length, icon: "ri-headphone-line", color: "app-accent-primary" },
          { label: "Ðã luy?n", value: totalAnswered, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Tr? l?i dúng", value: totalCorrect, icon: "ri-trophy-line", color: "#a78bfa" },
          { label: "Ð? chính xác", value: `${accuracy}%`, icon: "ri-bar-chart-line", color: "#fb923c" },
        ].map(s => (
          <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{s.value}</p>
              <p className="text-app-text-secondary text-xs mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mode tabs */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex rounded-xl border border-app-border overflow-hidden">
          {(["browse", "exam"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setExamIdx(0); setExamAnswers({}); setExamDone(false); }}
              className={`px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${mode === m ? "bg-app-accent-primary/15 text-app-accent-primary" : "text-app-text-secondary hover:text-white/60"}`}
            >
              {m === "browse" ? "Luy?n t?p t? do" : "Thi th? (10 câu)"}
            </button>
          ))}
        </div>

        {mode === "browse" && (
          <>
            <select
              value={filterTopic}
              onChange={e => setFilterTopic(e.target.value)}
              className="bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">T?t c? ch? d?</option>
              {EPS_LESSON_TOPICS.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <select
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value)}
              className="bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">T?t c? c?p d?</option>
              <option value="easy">D?</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </>
        )}
      </div>

      {/* Browse mode */}
      {mode === "browse" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          <div className="space-y-4">
            <p className="text-app-text-muted text-xs">{filteredQuestions.length} câu h?i</p>
            {filteredQuestions.map(q => (
              <ListeningCard
                key={q.id}
                q={q}
                answered={answeredMap[q.id] ?? null}
                onAnswer={idx => handleAnswer(q.id, idx)}
                showScript={!!showScripts[q.id]}
                onToggleScript={() => setShowScripts(p => ({ ...p, [q.id]: !p[q.id] }))}
              />
            ))}
          </div>

          {/* Tips sidebar */}
          <div className="space-y-4">
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">M?o luy?n nghe EPS</h3>
              <div className="space-y-3">
                {[
                  { icon: "ri-headphone-line", tip: "Nghe ít nh?t 2 l?n tru?c khi tr? l?i" },
                  { icon: "ri-speed-line", tip: "Dùng ch? d? \"Ch?m hon\" n?u không nghe rõ" },
                  { icon: "ri-eye-off-line", tip: "Không xem script khi l?n d?u nghe" },
                  { icon: "ri-repeat-line", tip: "Ôn l?i câu sai nhi?u l?n" },
                  { icon: "ri-focus-3-line", tip: "Chú ý t? khóa: s?, d?a di?m, th?i gian" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-6 h-6 flex items-center justify-center rounded-md bg-app-accent-primary/10 flex-shrink-0">
                      <i className={`${item.icon} text-app-accent-primary text-xs`}></i>
                    </div>
                    <p className="text-app-text-secondary text-xs leading-relaxed">{item.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4">
              <p className="text-app-accent-primary text-xs font-semibold mb-2">Ph?n thu?ng XP</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-app-text-secondary">Tr? l?i dúng</span>
                  <span className="text-app-accent-primary font-bold">+15 XP</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-app-text-secondary">Hoàn thành thi th?</span>
                  <span className="text-app-accent-primary font-bold">+20 XP/câu dúng</span>
                </div>
              </div>
            </div>

            {/* Progress by topic */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-4">
              <p className="text-app-text-secondary text-xs font-medium mb-3">Ti?n d? theo ch? d?</p>
              {EPS_LESSON_TOPICS.map(t => {
                const topicQs = LISTENING_QUESTIONS.filter(q => q.topic === t.id);
                const done = topicQs.filter(q => answeredMap[q.id] !== undefined).length;
                const pct = topicQs.length > 0 ? Math.round((done / topicQs.length) * 100) : 0;
                return (
                  <div key={t.id} className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-app-text-secondary text-[10px]">{t.label}</span>
                      <span className="text-[10px] font-bold" style={{ color: t.color }}>{done}/{topicQs.length}</span>
                    </div>
                    <div className="h-1 bg-app-card/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: t.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Exam mode */}
      {mode === "exam" && !examDone && (
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-5">
            <p className="text-app-text-secondary text-xs whitespace-nowrap">{examIdx + 1} / {examQuestions.length}</p>
            <div className="flex-1 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-app-accent-primary transition-all" style={{ width: `${(examIdx / examQuestions.length) * 100}%` }} />
            </div>
            <p className="text-app-accent-success text-xs font-bold whitespace-nowrap">
              {Object.values(examAnswers).filter((v, i) => v === examQuestions[i]?.correctIndex).length} dúng
            </p>
          </div>

          <ListeningCard
            q={examQuestions[examIdx]}
            answered={examAnswers[examQuestions[examIdx].id] ?? null}
            onAnswer={handleExamAnswer}
            showScript={false}
            onToggleScript={() => {}}
          />

          {examAnswers[examQuestions[examIdx].id] !== undefined && (
            <button
              onClick={handleExamNext}
              className="w-full mt-4 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              {examIdx + 1 >= examQuestions.length ? "Xem k?t qu?" : "Câu ti?p theo"}
              <i className="ri-arrow-right-line ml-2"></i>
            </button>
          )}
        </div>
      )}

      {/* Exam result */}
      {mode === "exam" && examDone && (
        <div className="max-w-md mx-auto bg-app-bg border border-app-border rounded-2xl p-8 text-center">
          {(() => {
            const pct = Math.round((examScore / examQuestions.length) * 100);
            const grade = pct >= 80 ? { label: "Xu?t s?c!", color: "#34d399", icon: "ri-trophy-line" }
              : pct >= 60 ? { label: "Khá t?t!", color: "app-accent-primary", icon: "ri-medal-line" }
              : { label: "C?n luy?n thêm!", color: "#fb923c", icon: "ri-refresh-line" };
            return (
              <>
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: `${grade.color}15` }}>
                  <i className={`${grade.icon} text-3xl`} style={{ color: grade.color }}></i>
                </div>
                <h2 className="text-white font-bold text-xl mb-2">{grade.label}</h2>
                <p className="text-app-text-secondary text-sm mb-5">
                  Ðúng <span className="font-bold" style={{ color: grade.color }}>{examScore}/{examQuestions.length}</span> câu ({pct}%)
                </p>
                <div className="w-full h-2 bg-app-card/50 rounded-full overflow-hidden mb-6">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: grade.color }} />
                </div>
                <p className="text-app-accent-primary text-sm font-bold mb-5">+{examScore * 20} XP dã nh?n!</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setExamIdx(0); setExamAnswers({}); setExamDone(false); }}
                    className="flex-1 py-3 rounded-xl border border-app-border text-white/60 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Thi l?i
                  </button>
                  <button
                    onClick={() => setMode("browse")}
                    className="flex-1 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Luy?n t?p
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </DashboardLayout>
  );
}


