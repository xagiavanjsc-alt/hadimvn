import { useState, useMemo } from "react";
import { HANJA_DATA } from "@/mocks/hanjaData";

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
    name: "Kinh t?",
    nameKo: "??",
    icon: "ri-line-chart-line",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    description: "T? v?ng chuyên ngành kinh t?, tài chính, thuong m?i",
    words: [
      { korean: "????", hanja: "????", vietnamese: "tang tru?ng kinh t?", example: "?????? ????.", exampleVi: "T? l? tang tru?ng kinh t? dã tang lên." },
      { korean: "????", hanja: "????", vietnamese: "l?m phát giá c?", example: "?????? ??? ?????.", exampleVi: "Cu?c s?ng tr? nên khó khan do l?m phát." },
      { korean: "????", hanja: "????", vietnamese: "cán cân thuong m?i", example: "???? ??? ????.", exampleVi: "Ghi nh?n th?ng du cán cân thuong m?i." },
      { korean: "????", hanja: "????", vietnamese: "thâm h?t ngân sách", example: "????? ??? ????.", exampleVi: "Thâm h?t ngân sách ? m?c nghiêm tr?ng." },
      { korean: "????", hanja: "????", vietnamese: "kh?ng ho?ng tài chính", example: "????? ?? ??? ????.", exampleVi: "Nhi?u doanh nghi?p phá s?n do kh?ng ho?ng tài chính." },
      { korean: "????", hanja: "????", vietnamese: "thu hút d?u tu", example: "??? ????? ??? ??.", exampleVi: "Ðang n? l?c thu hút d?u tu nu?c ngoài." },
      { korean: "???", hanja: "???", vietnamese: "xu?t nh?p kh?u", example: "??? ??? ????.", exampleVi: "Quy mô xu?t nh?p kh?u dã tang lên." },
      { korean: "?????", hanja: "?????", vietnamese: "giá tiêu dùng", example: "???????? ???.", exampleVi: "Ch? s? giá tiêu dùng dã tang." },
      { korean: "?????", hanja: "?????", vietnamese: "t?ng s?n ph?m qu?c n?i (GDP)", example: "?????? ????.", exampleVi: "GDP dã tang lên." },
      { korean: "???", hanja: "???", vietnamese: "t? l? th?t nghi?p", example: "???? ???? ??.", exampleVi: "T? l? th?t nghi?p dang gi?m xu?ng." },
      { korean: "????", hanja: "????", vietnamese: "suy thoái kinh t?", example: "????? ??? ???.", exampleVi: "Tiêu dùng gi?m do suy thoái kinh t?." },
      { korean: "?????", hanja: "?????", vietnamese: "th? tru?ng b?t d?ng s?n", example: "?????? ?????.", exampleVi: "Th? tru?ng b?t d?ng s?n dã quá nóng." },
      { korean: "????", hanja: "????", vietnamese: "th? tru?ng ch?ng khoán", example: "????? ????.", exampleVi: "Th? tru?ng ch?ng khoán dã gi?m m?nh." },
      { korean: "????", hanja: "????", vietnamese: "bi?n d?ng t? giá", example: "????? ???.", exampleVi: "Bi?n d?ng t? giá r?t m?nh." },
      { korean: "????", hanja: "????", vietnamese: "gi?m mi?n thu?", example: "????? ???? ??? ??.", exampleVi: "Cho doanh nghi?p v?a và nh? hu?ng uu dãi gi?m thu?." },
    ],
  },
  {
    id: "health",
    name: "Y t?",
    nameKo: "??",
    icon: "ri-heart-pulse-line",
    color: "text-rose-600",
    bg: "bg-rose-50",
    description: "T? v?ng y t?, s?c kh?e, b?nh vi?n, di?u tr?",
    words: [
      { korean: "????", hanja: "????", vietnamese: "b?o hi?m y t?", example: "????? ????.", exampleVi: "Ðã tham gia b?o hi?m y t?." },
      { korean: "????", hanja: "????", vietnamese: "so c?u kh?n c?p", example: "????? ???.", exampleVi: "Ðã du?c so c?u kh?n c?p." },
      { korean: "???", hanja: "???", vietnamese: "b?nh truy?n nhi?m", example: "??? ??? ????.", exampleVi: "Phòng ng?a b?nh truy?n nhi?m r?t quan tr?ng." },
      { korean: "???", hanja: "???", vietnamese: "phòng ph?u thu?t", example: "????? ??? ???.", exampleVi: "Ðã du?c ph?u thu?t trong phòng m?." },
      { korean: "???", hanja: "???", vietnamese: "gi?y ch?ng nh?n y t?", example: "???? ?????.", exampleVi: "Ðã du?c c?p gi?y ch?ng nh?n y t?." },
      { korean: "???", hanja: "???", vietnamese: "don thu?c", example: "???? ?? ?? ??.", exampleVi: "Nh?n don thu?c và mua thu?c." },
      { korean: "????", hanja: "????", vietnamese: "di?u tr? n?i trú", example: "????? ????.", exampleVi: "C?n di?u tr? n?i trú." },
      { korean: "????", hanja: "????", vietnamese: "tiêm phòng", example: "?? ????? ???.", exampleVi: "Ðã tiêm phòng cúm." },
      { korean: "????", hanja: "????", vietnamese: "khám s?c kh?e d?nh k?", example: "?? ????? ???.", exampleVi: "M?i nam di khám s?c kh?e d?nh k?." },
      { korean: "????", hanja: "????", vietnamese: "b?nh mãn tính", example: "???? ??? ????.", exampleVi: "Qu?n lý b?nh mãn tính r?t quan tr?ng." },
      { korean: "????", hanja: "????", vietnamese: "s?c kh?e tâm th?n", example: "????? ??? ??.", exampleVi: "C?n cham sóc s?c kh?e tâm th?n." },
      { korean: "???", hanja: "???", vietnamese: "du?c ph?m", example: "??? ???? ???? ??.", exampleVi: "C?n chú ý tác d?ng ph? c?a du?c ph?m." },
      { korean: "????", hanja: "????", vietnamese: "do huy?t áp", example: "????? ????? ??.", exampleVi: "Ðo huy?t áp d?nh k?." },
      { korean: "??", hanja: "??", vietnamese: "truy?n máu", example: "?? ? ??? ????.", exampleVi: "C?n truy?n máu trong khi ph?u thu?t." },
      { korean: "????", hanja: "????", vietnamese: "ph?c h?i ch?c nang", example: "?? ? ????? ???.", exampleVi: "Ðu?c ph?c h?i ch?c nang sau tai n?n." },
    ],
  },
  {
    id: "politics",
    name: "Chính tr?",
    nameKo: "??",
    icon: "ri-government-line",
    color: "text-amber-600",
    bg: "bg-amber-50",
    description: "T? v?ng chính tr?, ngo?i giao, qu?n tr? nhà nu?c",
    words: [
      { korean: "????", hanja: "????", vietnamese: "ch? nghia dân ch?", example: "???? ???? ?? ??.", exampleVi: "Ðang s?ng trong xã h?i dân ch?." },
      { korean: "????", hanja: "????", vietnamese: "ngh? si qu?c h?i", example: "???? ??? ??.", exampleVi: "Có cu?c b?u c? ngh? si qu?c h?i." },
      { korean: "????", hanja: "????", vietnamese: "chính sách ngo?i giao", example: "????? ????.", exampleVi: "Ðã tang cu?ng chính sách ngo?i giao." },
      { korean: "????", hanja: "????", vietnamese: "s?a d?i hi?n pháp", example: "???? ??? ????.", exampleVi: "Th?o lu?n v? s?a d?i hi?n pháp r?t sôi n?i." },
      { korean: "????", hanja: "????", vietnamese: "t? qu?n d?a phuong", example: "??????? ????.", exampleVi: "Ch? d? t? qu?n d?a phuong dã phát tri?n." },
      { korean: "????", hanja: "????", vietnamese: "thay d?i chính quy?n", example: "????? ?????.", exampleVi: "Ðã di?n ra s? thay d?i chính quy?n." },
      { korean: "????", hanja: "????", vietnamese: "an ninh qu?c gia", example: "????? ???? ??.", exampleVi: "C?n tang cu?ng an ninh qu?c gia." },
      { korean: "????", hanja: "????", vietnamese: "tham dò du lu?n", example: "???? ??? ????.", exampleVi: "K?t qu? tham dò du lu?n dã du?c công b?." },
      { korean: "????", hanja: "????", vietnamese: "c?i cách chính tr?", example: "????? ????.", exampleVi: "C?n c?i cách chính tr?." },
      { korean: "????", hanja: "????", vietnamese: "quan h? qu?c t?", example: "????? ?????.", exampleVi: "Quan h? qu?c t? dã tr? nên ph?c t?p." },
      { korean: "????", hanja: "????", vietnamese: "ch? d? b?u c?", example: "???? ??? ????.", exampleVi: "Th?o lu?n v? c?i cách ch? d? b?u c?." },
      { korean: "????", hanja: "????", vietnamese: "phân chia quy?n l?c", example: "????? ????? ????.", exampleVi: "Phân chia quy?n l?c là n?n t?ng c?a dân ch?." },
      { korean: "????", hanja: "????", vietnamese: "xã h?i dân s?", example: "????? ??? ????.", exampleVi: "Vai trò c?a xã h?i dân s? r?t quan tr?ng." },
      { korean: "????", hanja: "????", vietnamese: "pháp quy?n", example: "????? ???? ??.", exampleVi: "C?n thi?t l?p pháp quy?n." },
      { korean: "????", hanja: "????", vietnamese: "chính sách th?ng nh?t", example: "????? ?? ??? ??.", exampleVi: "Có cu?c th?o lu?n v? chính sách th?ng nh?t." },
    ],
  },
  {
    id: "environment",
    name: "Môi tru?ng",
    nameKo: "??",
    icon: "ri-leaf-line",
    color: "text-green-600",
    bg: "bg-green-50",
    description: "T? v?ng môi tru?ng, bi?n d?i khí h?u, nang lu?ng xanh",
    words: [
      { korean: "????", hanja: "????", vietnamese: "bi?n d?i khí h?u", example: "???? ??? ????.", exampleVi: "?ng phó bi?n d?i khí h?u là c?p bách." },
      { korean: "????", hanja: "????", vietnamese: "phát th?i carbon", example: "????? ??? ??.", exampleVi: "C?n gi?m phát th?i carbon." },
      { korean: "?????", hanja: "??energy", vietnamese: "nang lu?ng tái t?o", example: "????? ??? ?? ??.", exampleVi: "Vi?c s? d?ng nang lu?ng tái t?o dang tang lên." },
      { korean: "????", hanja: "????", vietnamese: "ô nhi?m môi tru?ng", example: "????? ????.", exampleVi: "Ô nhi?m môi tru?ng r?t nghiêm tr?ng." },
      { korean: "???", hanja: "???", vietnamese: "h? sinh thái", example: "??? ??? ????.", exampleVi: "B?o v? h? sinh thái r?t quan tr?ng." },
      { korean: "????", hanja: "??gas", vietnamese: "khí nhà kính", example: "???? ?? ??? ???.", exampleVi: "Ðã d?t m?c tiêu gi?m khí nhà kính." },
      { korean: "????", hanja: "????", vietnamese: "thiên tai", example: "???? ??? ??.", exampleVi: "Thi?t h?i do thiên tai r?t l?n." },
      { korean: "????", hanja: "????", vietnamese: "ô nhi?m ngu?n nu?c", example: "???? ??? ????.", exampleVi: "V?n d? ô nhi?m ngu?n nu?c r?t nghiêm tr?ng." },
      { korean: "????", hanja: "????", vietnamese: "ô nhi?m không khí", example: "?????? ??? ????.", exampleVi: "S?c kh?e x?u di do ô nhi?m không khí." },
      { korean: "???", hanja: "???", vietnamese: "thân thi?n môi tru?ng", example: "??? ??? ????.", exampleVi: "S? d?ng s?n ph?m thân thi?n môi tru?ng." },
    ],
  },
  {
    id: "technology",
    name: "Công ngh?",
    nameKo: "??",
    icon: "ri-cpu-line",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    description: "T? v?ng công ngh?, AI, k? thu?t s?, d?i m?i sáng t?o",
    words: [
      { korean: "????", hanja: "????", vietnamese: "trí tu? nhân t?o (AI)", example: "???? ??? ????.", exampleVi: "Công ngh? trí tu? nhân t?o dã phát tri?n." },
      { korean: "?????", hanja: "digital??", vietnamese: "chuy?n d?i s?", example: "?????? ????? ??.", exampleVi: "Chuy?n d?i s? dang du?c d?y nhanh." },
      { korean: "???", hanja: "???", vietnamese: "ch?t bán d?n", example: "??? ??? ????.", exampleVi: "Ngành công nghi?p bán d?n r?t quan tr?ng." },
      { korean: "?????", hanja: "cyber??", vietnamese: "an ninh m?ng", example: "????? ??? ????.", exampleVi: "C?n tang cu?ng an ninh m?ng." },
      { korean: "????", hanja: "big data", vietnamese: "d? li?u l?n", example: "???? ??? ????.", exampleVi: "?ng d?ng phân tích d? li?u l?n." },
      { korean: "????", hanja: "????", vietnamese: "lái xe t? d?ng", example: "???? ??? ?????.", exampleVi: "Công ngh? lái xe t? d?ng dã du?c thuong m?i hóa." },
      { korean: "????", hanja: "blockchain", vietnamese: "chu?i kh?i", example: "???? ??? ????.", exampleVi: "Ðã áp d?ng công ngh? blockchain." },
      { korean: "????", hanja: "metaverse", vietnamese: "vu tr? ?o", example: "???? ??? ???? ??.", exampleVi: "Th? tru?ng vu tr? ?o dang tang tru?ng." },
      { korean: "????", hanja: "cloud", vietnamese: "di?n toán dám mây", example: "???? ???? ????.", exampleVi: "S? d?ng d?ch v? di?n toán dám mây." },
      { korean: "??????", hanja: "smart factory", vietnamese: "nhà máy thông minh", example: "??????? ????.", exampleVi: "Ðã xây d?ng nhà máy thông minh." },
    ],
  },
  {
    id: "law",
    name: "Pháp lu?t",
    nameKo: "??",
    icon: "ri-scales-3-line",
    color: "text-slate-600",
    bg: "bg-slate-50",
    description: "T? v?ng pháp lu?t, tu pháp, quy?n công dân",
    words: [
      { korean: "????", hanja: "????", vietnamese: "vi ph?m pháp lu?t", example: "?????? ?????.", exampleVi: "B? x? ph?t vì vi ph?m pháp lu?t." },
      { korean: "????", hanja: "????", vietnamese: "th? t?c xét x?", example: "????? ????.", exampleVi: "Th? t?c xét x? r?t ph?c t?p." },
      { korean: "???", hanja: "???", vietnamese: "quy?n co b?n", example: "???? ???? ??.", exampleVi: "C?n d?m b?o quy?n co b?n." },
      { korean: "???", hanja: "???", vietnamese: "h?p d?ng", example: "???? ????.", exampleVi: "Ðã ký h?p d?ng." },
      { korean: "????", hanja: "????", vietnamese: "b?i thu?ng thi?t h?i", example: "????? ????.", exampleVi: "Ðã yêu c?u b?i thu?ng thi?t h?i." },
      { korean: "????", hanja: "????", vietnamese: "x? ph?t hình s?", example: "????? ???.", exampleVi: "Ðã b? x? ph?t hình s?." },
      { korean: "????", hanja: "????", vietnamese: "ki?n dân s?", example: "????? ????.", exampleVi: "Ðã d? don ki?n dân s?." },
      { korean: "?????", hanja: "?????", vietnamese: "quy?n s? h?u trí tu?", example: "?????? ???? ??.", exampleVi: "C?n b?o v? quy?n s? h?u trí tu?." },
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
    try { return new Set(JSON.parse(localStorage.getItem("hanja_adv_learned") || "[]")); }
    catch { return new Set(); }
  });
  const [expandedWord, setExpandedWord] = useState<string | null>(null);

  const toggleLearned = (korean: string) => {
    setLearnedWords(prev => {
      const next = new Set(prev);
      next.has(korean) ? next.delete(korean) : next.add(korean);
      localStorage.setItem("hanja_adv_learned", JSON.stringify(Array.from(next)));
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
          <h2 className="text-lg font-bold text-gray-900 mb-1">H?c theo ch? d? nâng cao</h2>
          <p className="text-sm text-gray-500">T? v?ng chuyên ngành v?i câu ví d? th?c t? t? báo chí và TOPIK</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ADVANCED_TOPICS.map(topic => {
            const learnedCount = topic.words.filter(w => learnedWords.has(w.korean)).length;
            const pct = Math.round((learnedCount / topic.words.length) * 100);
            return (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className="bg-white border border-gray-100 rounded-2xl p-5 cursor-pointer hover:border-rose-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 flex items-center justify-center ${topic.bg} rounded-xl`}>
                    <i className={`${topic.icon} ${topic.color} text-xl`}></i>
                  </div>
                  <span className="text-xs text-gray-400">{topic.words.length} t?</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-0.5">{topic.name}</h3>
                <p className="text-sm text-gray-400 mb-1">{topic.nameKo}</p>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{topic.description}</p>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Ðã h?c</span>
                    <span>{learnedCount}/{topic.words.length}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-rose-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${pct === 100 ? "text-green-600" : pct > 0 ? "text-amber-600" : "text-gray-400"}`}>
                    {pct === 100 ? "Hoàn thành!" : pct > 0 ? `${pct}% hoàn thành` : "Chua b?t d?u"}
                  </span>
                  <i className="ri-arrow-right-line text-gray-300 group-hover:text-rose-400 transition-colors"></i>
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
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
            <div className={`w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4 ${pct >= 80 ? "bg-green-100" : pct >= 50 ? "bg-amber-100" : "bg-red-100"}`}>
              <i className={`text-3xl ${pct >= 80 ? "ri-trophy-line text-green-600" : pct >= 50 ? "ri-emotion-normal-line text-amber-600" : "ri-emotion-sad-line text-red-500"}`}></i>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{pct}%</p>
            <p className="text-gray-500 mb-6">Ðúng {quiz.score}/{quiz.words.length} câu — {selectedTopic.name}</p>
            <div className="flex gap-3">
              <button onClick={() => startQuiz(selectedTopic)} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-rose-600 transition-colors">Làm l?i</button>
              <button onClick={() => { setMode("browse"); setQuiz(null); }} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer hover:bg-gray-50 transition-colors">Xem t? v?ng</button>
            </div>
          </div>
        </div>
      );
    }

    const current = quiz.words[quiz.idx];
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { setMode("browse"); setQuiz(null); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
            <i className="ri-arrow-left-line"></i> D?ng quiz
          </button>
          <span className="text-sm text-gray-500">{quiz.idx + 1}/{quiz.words.length}</span>
          <span className="text-sm font-semibold text-rose-600">? {quiz.score}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
          <div className="bg-rose-400 h-1.5 rounded-full transition-all" style={{ width: `${(quiz.idx / quiz.words.length) * 100}%` }}></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center mb-4">
          <p className="text-xs text-gray-400 mb-2 tracking-wide">T? ti?ng Hàn này có nghia là gì?</p>
          <p className="text-4xl font-bold text-gray-900 mb-2">{current.korean}</p>
          <p className="text-xl text-rose-400 font-bold">{current.hanja}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quiz.choices.map((choice, i) => {
            let cls = "border-2 border-gray-200 bg-white text-gray-700 hover:border-rose-300";
            if (quiz.answered) {
              if (choice.korean === current.korean) cls = "border-2 border-green-400 bg-green-50 text-green-700";
              else if (choice.korean === quiz.selected) cls = "border-2 border-red-400 bg-red-50 text-red-700";
              else cls = "border-2 border-gray-100 bg-gray-50 text-gray-400";
            }
            return (
              <button key={i} onClick={() => handleAnswer(choice)} disabled={quiz.answered}
                className={`p-4 rounded-xl text-sm font-medium cursor-pointer transition-all text-left ${cls} disabled:cursor-default`}>
                {quiz.answered && choice.korean === current.korean && <i className="ri-check-line text-green-600 mr-1"></i>}
                {quiz.answered && choice.korean === quiz.selected && choice.korean !== current.korean && <i className="ri-close-line text-red-500 mr-1"></i>}
                {choice.vietnamese}
              </button>
            );
          })}
        </div>
        {quiz.answered && (
          <div className="mt-4">
            <div className="bg-gray-50 rounded-xl p-3 mb-3 text-xs text-gray-600">
              <p className="font-semibold mb-1">{current.korean} — {current.vietnamese}</p>
              {current.example && <p className="text-gray-500 italic">{current.example}</p>}
              {current.exampleVi && <p className="text-gray-400">{current.exampleVi}</p>}
            </div>
            <button onClick={nextQuestion} className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-rose-600 transition-colors">
              {quiz.idx + 1 >= quiz.words.length ? "Xem k?t qu?" : "Câu ti?p ?"}
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
        <button onClick={() => setSelectedTopic(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
          <i className="ri-arrow-left-line"></i> T?t c? ch? d?
        </button>
        <div className={`w-8 h-8 flex items-center justify-center ${selectedTopic.bg} rounded-lg`}>
          <i className={`${selectedTopic.icon} ${selectedTopic.color} text-sm`}></i>
        </div>
        <div>
          <h2 className="font-bold text-gray-900">{selectedTopic.name} <span className="text-gray-400 font-normal text-sm">({selectedTopic.nameKo})</span></h2>
          <p className="text-xs text-gray-500">{learnedCount}/{selectedTopic.words.length} t? dã h?c</p>
        </div>
        <button onClick={() => startQuiz(selectedTopic)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-rose-600 transition-colors whitespace-nowrap">
          <i className="ri-gamepad-line"></i>Quiz ch? d? này
        </button>
      </div>

      {/* Progress */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Ti?n d? h?c</span>
          <span>{learnedCount}/{selectedTopic.words.length} t? ({Math.round((learnedCount / selectedTopic.words.length) * 100)}%)</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-rose-400 h-2 rounded-full transition-all" style={{ width: `${(learnedCount / selectedTopic.words.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="space-y-3">
        {selectedTopic.words.map((word, i) => {
          const isLearned = learnedWords.has(word.korean);
          const isExpanded = expandedWord === word.korean;
          return (
            <div key={i} className={`bg-white border rounded-xl overflow-hidden transition-all ${isLearned ? "border-green-200" : "border-gray-100"}`}>
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedWord(isExpanded ? null : word.korean)}
              >
                <div className="flex-1 flex items-center gap-3">
                  <div>
                    <span className="text-base font-bold text-gray-900">{word.korean}</span>
                    <span className="text-rose-400 font-bold ml-2">{word.hanja}</span>
                  </div>
                  <span className="text-sm text-gray-600">{word.vietnamese}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); speakKorean(word.korean); }}
                    className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                  >
                    <i className="ri-volume-up-line text-gray-500 text-xs"></i>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); toggleLearned(word.korean); }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${isLearned ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600"}`}
                  >
                    <i className={isLearned ? "ri-check-double-line" : "ri-check-line"}></i>
                    {isLearned ? "Ðã h?c" : "Ðánh d?u"}
                  </button>
                  <i className={`text-gray-400 text-sm transition-transform ${isExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
                </div>
              </div>
              {isExpanded && word.example && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                  <div className="bg-rose-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-rose-700 mb-1">{word.example}</p>
                    <p className="text-xs text-rose-500">{word.exampleVi}</p>
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
