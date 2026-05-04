import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface Section {
  id: string;
  title: string;
  icon: string;
  color: string;
  bg: string;
  content: React.ReactNode;
}

const GUIDE_SECTIONS: Omit<Section, "content">[] = [
  { id: "intro", title: "Hàn Qu?c Oi! là gì?", icon: "ri-information-line", color: "text-rose-600", bg: "bg-rose-50" },
  { id: "features", title: "Tính nang n?i b?t", icon: "ri-star-line", color: "text-amber-600", bg: "bg-amber-50" },
  { id: "hanja", title: "H?c Hán-Hàn hi?u qu?", icon: "ri-translate-2", color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "topik", title: "Luy?n thi TOPIK", icon: "ri-file-paper-2-line", color: "text-green-600", bg: "bg-green-50" },
  { id: "kpop", title: "H?c qua K-pop", icon: "ri-music-2-line", color: "text-pink-600", bg: "bg-pink-50" },
  { id: "tips", title: "M?o h?c ti?ng Hàn", icon: "ri-lightbulb-line", color: "text-orange-600", bg: "bg-orange-50" },
  { id: "roadmap", title: "L? trình h?c", icon: "ri-route-line", color: "text-teal-600", bg: "bg-teal-50" },
  { id: "community", title: "C?ng d?ng & Chia s?", icon: "ri-team-line", color: "text-violet-600", bg: "bg-violet-50" },
];

function IntroSection() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">Chào m?ng d?n v?i Hàn Qu?c Oi!</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          <strong>Hàn Qu?c Oi!</strong> là n?n t?ng h?c ti?ng Hàn toàn di?n dành riêng cho ngu?i Vi?t Nam — k?t h?p phuong pháp h?c khoa h?c v?i van hóa K-pop, giúp b?n h?c ti?ng Hàn m?t cách t? nhiên, hi?u qu? và thú v?.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "ri-book-open-line", label: "2,400+ t? Hán-Hàn", color: "text-rose-600" },
            { icon: "ri-brain-line", label: "Spaced Repetition", color: "text-indigo-600" },
            { icon: "ri-music-2-line", label: "H?c qua K-pop", color: "text-pink-600" },
            { icon: "ri-trophy-line", label: "Thi th? TOPIK", color: "text-amber-600" },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <i className={`${item.icon} ${item.color} text-2xl block mb-1`}></i>
              <p className="text-xs text-gray-600 font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 mb-3">T?i sao ch?n Hàn Qu?c Oi!?</h4>
        <div className="space-y-3">
          {[
            {
              icon: "ri-flag-line",
              title: "Thi?t k? cho ngu?i Vi?t",
              desc: "Giao di?n ti?ng Vi?t hoàn toàn, gi?i thích ng? pháp b?ng ti?ng Vi?t, so sánh Hán-Vi?t d? h?c nhanh hon. Ngu?i Vi?t có l?i th? d?c bi?t khi h?c ti?ng Hàn nh? g?c ch? Hán chung!",
            },
            {
              icon: "ri-brain-line",
              title: "Phuong pháp khoa h?c SM-2",
              desc: "Thu?t toán Spaced Repetition (SM-2) t? d?ng tính toán th?i di?m ôn t?p t?i uu cho t?ng t?, giúp b?n nh? lâu hon v?i ít th?i gian hon.",
            },
            {
              icon: "ri-music-2-line",
              title: "H?c qua K-pop th?c t?",
              desc: "T? v?ng và ng? pháp du?c h?c qua l?i bài hát K-pop th?c t?, giúp b?n nh? t? trong ng? c?nh t? nhiên và c?m nh?n du?c âm nh?c Hàn Qu?c.",
            },
            {
              icon: "ri-route-line",
              title: "L? trình cá nhân hóa",
              desc: "H? th?ng t? d?ng d? xu?t t? c?n ôn, ch? d? c?n h?c d?a trên ti?n d? th?c t? c?a b?n. Không h?c theo ki?u 'm?t size cho t?t c?'.",
            },
          ].map(item => (
            <div key={item.title} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl">
              <div className="w-10 h-10 flex items-center justify-center bg-rose-50 rounded-xl flex-shrink-0">
                <i className={`${item.icon} text-rose-600 text-lg`}></i>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{item.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const features = [
    {
      category: "T? v?ng Hán-Hàn",
      color: "bg-rose-50 border-rose-200",
      titleColor: "text-rose-700",
      items: [
        "2,400+ t? Hán-Hàn phân lo?i theo ch? cái d?u",
        "Flashcard l?t th? v?i TTS phát âm chu?n",
        "Spaced Repetition (SM-2) — ôn dúng lúc, nh? lâu",
        "So sánh Hán-Vi?t — ngu?i Vi?t h?c nhanh hon 3x",
        "H?c theo c?p t? d?ng âm khác nghia (??, ??...)",
        "H?c theo ch? d? nâng cao: Kinh t?, Y t?, Chính tr?",
        "Ghép c?p drag & drop — h?c vui, nh? lâu",
        "Nh?t ký h?c t?p — theo dõi ti?n d? m?i ngày",
      ],
    },
    {
      category: "Luy?n thi TOPIK",
      color: "bg-green-50 border-green-200",
      titleColor: "text-green-700",
      items: [
        "Thi th? TOPIK Hán-Hàn — 30 câu + timer 30 phút",
        "3 d?ng câu: Hàn?Vi?t, Vi?t?Hàn, Hán t??Hàn",
        "Review câu sai sau khi thi",
        "L?ch s? 10 l?n thi — theo dõi ti?n b?",
        "L?c theo nhóm ch? cái d? thi chuyên d?",
        "Câu ví d? th?c t? t? d? thi TOPIK",
      ],
    },
    {
      category: "K-pop & Van hóa",
      color: "bg-pink-50 border-pink-200",
      titleColor: "text-pink-700",
      items: [
        "H?c t? v?ng qua l?i bài hát K-pop (Melon Top 100)",
        "AI t?o truy?n chêm t? bài hát yêu thích",
        "H?c qua tin t?c Hàn Qu?c th?c t?",
        "T? di?n hàng ngày — 5 t? m?i m?i ngày",
        "Luy?n phát âm v?i ghi âm + so sánh TTS",
      ],
    },
    {
      category: "Gamification",
      color: "bg-amber-50 border-amber-200",
      titleColor: "text-amber-700",
      items: [
        "H? th?ng XP + ph?n thu?ng hàng ngày",
        "Streak h?c t?p — duy trì thói quen",
        "B?ng x?p h?ng tu?n — c?nh tranh v?i b?n bè",
        "Thách th?c tu?n — m?c tiêu h?c t?p",
        "Huy hi?u thành tích — ghi nh?n n? l?c",
        "Ph?t XP khi b? h?c — t?o d?ng l?c",
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {features.map(f => (
        <div key={f.category} className={`border rounded-2xl p-5 ${f.color}`}>
          <h4 className={`font-bold mb-3 ${f.titleColor}`}>{f.category}</h4>
          <ul className="space-y-1.5">
            {f.items.map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <i className="ri-check-line text-green-500 mt-0.5 flex-shrink-0"></i>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function HanjaSection() {
  return (
    <div className="space-y-5">
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
        <h4 className="font-bold text-indigo-800 mb-2">T?i sao ngu?i Vi?t h?c Hán-Hàn d? hon?</h4>
        <p className="text-sm text-indigo-700 leading-relaxed">
          Ti?ng Vi?t và ti?ng Hàn d?u có ngu?n g?c t? ch? Hán. Kho?ng <strong>60-70% t? v?ng ti?ng Hàn</strong> có g?c Hán, và nhi?u t? phát âm r?t gi?ng ti?ng Vi?t. Ví d?: ?? (qu?c gia), ?? (kinh t?), ?? (xã h?i)...
        </p>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 mb-3">Cách h?c Hán-Hàn hi?u qu?</h4>
        <div className="space-y-3">
          {[
            {
              step: "1",
              title: "B?t d?u v?i nhóm ?-?",
              desc: "H?c theo th? t? ch? cái Hangul. M?i ngày h?c 10-15 t?, không c? h?c quá nhi?u m?t lúc.",
              tip: "Dùng tab 'T? v?ng' ? l?c theo ch? cái d?u",
            },
            {
              step: "2",
              title: "Kích ho?t Spaced Repetition",
              desc: "Sau khi h?c t? m?i, chuy?n sang tab 'Spaced Rep' d? ôn t?p. H? th?ng s? t? d?ng nh?c b?n ôn dúng lúc.",
              tip: "M?i ngày dành 10-15 phút ôn SR",
            },
            {
              step: "3",
              title: "So sánh v?i Hán-Vi?t",
              desc: "Dùng tab 'So sánh Hán Vi?t' d? tìm nh?ng t? gi?ng ti?ng Vi?t. Nh?ng t? này b?n s? nh? ngay l?p t?c!",
              tip: "??=qu?c gia, ??=kinh t?, ??=xã h?i",
            },
            {
              step: "4",
              title: "H?c theo ch? d? nâng cao",
              desc: "Khi dã có n?n t?ng, h?c t? v?ng chuyên ngành theo ch? d?: Kinh t?, Y t?, Chính tr?, Công ngh?...",
              tip: "Tab 'Ch? d? nâng cao' — có câu ví d? th?c t?",
            },
            {
              step: "5",
              title: "Thi th? TOPIK d?nh k?",
              desc: "M?i tu?n làm 1 bài thi th? TOPIK d? ki?m tra ti?n d?. Review câu sai d? bi?t di?m y?u c?n c?i thi?n.",
              tip: "Tab 'Thi th? TOPIK' — 30 câu, 30 phút",
            },
          ].map(item => (
            <div key={item.step} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl">
              <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 rounded-full flex-shrink-0 font-bold text-indigo-700 text-sm">
                {item.step}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">{item.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-2">{item.desc}</p>
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full w-fit">
                  <i className="ri-lightbulb-line"></i>
                  {item.tip}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-800 mb-2">
          <i className="ri-fire-line mr-1"></i>M?o nhanh: Nhóm t? d? nh? nh?t
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ["?? (??)", "qu?c gia"],
            ["?? (??)", "kinh t?"],
            ["?? (??)", "xã h?i"],
            ["?? (??)", "van hóa"],
            ["?? (??)", "giáo d?c"],
            ["?? (??)", "chính tr?"],
          ].map(([ko, vi]) => (
            <div key={ko} className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-1.5 border border-amber-100">
              <span className="font-bold text-amber-700">{ko}</span>
              <span className="text-gray-500">= {vi}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TopikSection() {
  return (
    <div className="space-y-5">
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
        <h4 className="font-bold text-green-800 mb-2">TOPIK là gì?</h4>
        <p className="text-sm text-green-700 leading-relaxed">
          <strong>TOPIK (Test of Proficiency in Korean)</strong> là k? thi nang l?c ti?ng Hàn qu?c t? do B? Giáo d?c Hàn Qu?c t? ch?c. Có 6 c?p d? (TOPIK I: 1-2, TOPIK II: 3-6). Ch?ng ch? TOPIK du?c công nh?n toàn c?u, c?n thi?t cho du h?c, làm vi?c t?i Hàn Qu?c.
        </p>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 mb-3">C?u trúc d? thi TOPIK</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">C?p d?</th>
                <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">K? nang</th>
                <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">S? câu</th>
                <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">Th?i gian</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["TOPIK I (1-2)", "Nghe + Ð?c", "70 câu", "100 phút"],
                ["TOPIK II (3-4)", "Nghe + Ð?c + Vi?t", "104 câu", "180 phút"],
                ["TOPIK II (5-6)", "Nghe + Ð?c + Vi?t", "104 câu", "180 phút"],
              ].map(row => (
                <tr key={row[0]} className="hover:bg-gray-50">
                  {row.map((cell, i) => (
                    <td key={i} className="p-3 border border-gray-200 text-gray-600">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 mb-3">L? trình luy?n thi TOPIK v?i Hàn Qu?c Oi!</h4>
        <div className="space-y-3">
          {[
            { level: "TOPIK 1-2", time: "3-6 tháng", desc: "H?c 500-800 t? Hán-Hàn co b?n, ng? pháp co b?n, luy?n nghe qua K-pop", color: "bg-green-100 text-green-700" },
            { level: "TOPIK 3-4", time: "6-12 tháng", desc: "M? r?ng 1500+ t?, h?c t? v?ng chuyên ngành, luy?n d?c báo Hàn", color: "bg-amber-100 text-amber-700" },
            { level: "TOPIK 5-6", time: "12-24 tháng", desc: "N?m v?ng 2400+ t? Hán-Hàn, t? v?ng h?c thu?t, vi?t lu?n", color: "bg-rose-100 text-rose-700" },
          ].map(item => (
            <div key={item.level} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl">
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 h-fit ${item.color}`}>{item.level}</span>
              <div>
                <p className="text-xs text-gray-400 mb-1">{item.time}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpopSection() {
  return (
    <div className="space-y-5">
      <div className="bg-pink-50 border border-pink-200 rounded-2xl p-5">
        <h4 className="font-bold text-pink-800 mb-2">T?i sao h?c qua K-pop hi?u qu??</h4>
        <p className="text-sm text-pink-700 leading-relaxed">
          Nghiên c?u ngôn ng? h?c cho th?y h?c qua âm nh?c giúp nh? t? v?ng lâu hon 40% so v?i h?c thu?n túy. L?i bài hát K-pop ch?a nhi?u t? v?ng th?c t?, c?m xúc t? nhiên, và du?c l?p di l?p l?i — di?u ki?n lý tu?ng d? ghi nh?.
        </p>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 mb-3">Cách h?c qua K-pop trên Hàn Qu?c Oi!</h4>
        <div className="space-y-3">
          {[
            {
              icon: "ri-music-2-line",
              title: "Melon K-pop Lesson",
              desc: "AI phân tích bài hát t? Melon Top 100, t?o bài h?c v?i t? v?ng, ng? pháp và truy?n chêm thú v?. H?c t? bài hát b?n yêu thích!",
              path: "/melon",
            },
            {
              icon: "ri-newspaper-line",
              title: "H?c qua Tin t?c",
              desc: "Ð?c báo Hàn th?c t?, AI highlight t? v?ng quan tr?ng và gi?i thích ng? pháp theo trình d? c?a b?n.",
              path: "/news",
            },
            {
              icon: "ri-volume-up-line",
              title: "Luy?n phát âm",
              desc: "Ghi âm gi?ng nói, so sánh v?i phát âm chu?n TTS. Nh?n di?m s? và g?i ý c?i thi?n.",
              path: "/hanja-vocab",
            },
          ].map(item => (
            <div key={item.title} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl">
              <div className="w-10 h-10 flex items-center justify-center bg-pink-50 rounded-xl flex-shrink-0">
                <i className={`${item.icon} text-pink-600 text-lg`}></i>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">{item.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Ngh? si ph? bi?n trong bài h?c</p>
        <div className="flex flex-wrap gap-2">
          {["BTS", "BLACKPINK", "aespa", "NewJeans", "IVE", "Stray Kids", "TWICE", "EXO", "SEVENTEEN", "NCT"].map(artist => (
            <span key={artist} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 font-medium">{artist}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TipsSection() {
  const tips = [
    {
      category: "H?c t? v?ng",
      icon: "ri-book-open-line",
      color: "text-rose-600",
      bg: "bg-rose-50",
      items: [
        "H?c 10-15 t? m?i m?i ngày, không c? h?c quá nhi?u",
        "Luôn h?c t? trong ng? c?nh câu ví d?, không h?c t? don l?",
        "Dùng Spaced Repetition — d?ng b? qua phiên ôn t?p",
        "Nhóm t? theo ch? d? d? nh? d? hon (kinh t?, y t?...)",
        "Ngu?i Vi?t: t?n d?ng g?c Hán-Vi?t d? doán nghia t? Hàn",
      ],
    },
    {
      category: "Luy?n nghe & nói",
      icon: "ri-volume-up-line",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      items: [
        "Nghe TTS m?i t? khi h?c — t?p phát âm ngay t? d?u",
        "Dùng tính nang ghi âm d? so sánh phát âm c?a b?n",
        "Xem phim/drama Hàn có ph? d? ti?ng Hàn",
        "Nghe nh?c K-pop và c? g?ng nh?n ra t? dã h?c",
        "Luy?n d?c to — không ch? d?c th?m trong d?u",
      ],
    },
    {
      category: "Duy trì d?ng l?c",
      icon: "ri-fire-line",
      color: "text-orange-600",
      bg: "bg-orange-50",
      items: [
        "Ð?t m?c tiêu nh? hàng ngày (10 t?/ngày) thay vì m?c tiêu l?n",
        "Duy trì streak h?c t?p — d?ng d? chu?i b? d?t",
        "Tham gia thách th?c tu?n d? có m?c tiêu c? th?",
        "Ghi nh?t ký h?c t?p d? th?y ti?n b? c?a mình",
        "K?t n?i v?i c?ng d?ng h?c ti?ng Hàn d? có d?ng l?c",
      ],
    },
    {
      category: "Chu?n b? thi TOPIK",
      icon: "ri-file-paper-2-line",
      color: "text-green-600",
      bg: "bg-green-50",
      items: [
        "Làm bài thi th? ít nh?t 1 l?n/tu?n",
        "Review k? câu sai — dây là di?m y?u c?n c?i thi?n",
        "H?c t? v?ng theo ch? d? TOPIK: xã h?i, kinh t?, van hóa",
        "Luy?n d?c báo Hàn d? quen v?i van phong h?c thu?t",
        "Ðang ký thi th?t d? có deadline c? th?",
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {tips.map(tip => (
        <div key={tip.category} className={`border rounded-2xl p-5 ${tip.bg} border-current/20`}>
          <div className="flex items-center gap-2 mb-3">
            <i className={`${tip.icon} ${tip.color} text-lg`}></i>
            <h4 className={`font-bold ${tip.color}`}>{tip.category}</h4>
          </div>
          <ul className="space-y-2">
            {tip.items.map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <i className="ri-arrow-right-s-line text-gray-400 mt-0.5 flex-shrink-0"></i>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function RoadmapSection() {
  const stages = [
    {
      level: "So c?p",
      topik: "TOPIK 1-2",
      duration: "3-6 tháng",
      color: "border-green-400 bg-green-50",
      badge: "bg-green-100 text-green-700",
      goals: [
        "Thu?c b?ng ch? cái Hangul",
        "H?c 500-800 t? Hán-Hàn co b?n (nhóm ?-?)",
        "Ng? pháp co b?n: -???/??, -?/??, -? ??",
        "Giao ti?p don gi?n: chào h?i, mua s?m, an u?ng",
        "Nghe hi?u h?i tho?i don gi?n",
      ],
      tools: ["Flashcard", "Spaced Rep", "Quiz co b?n", "Luy?n phát âm"],
    },
    {
      level: "Trung c?p",
      topik: "TOPIK 3-4",
      duration: "6-12 tháng",
      color: "border-amber-400 bg-amber-50",
      badge: "bg-amber-100 text-amber-700",
      goals: [
        "M? r?ng 1500+ t? Hán-Hàn (nhóm ?-?)",
        "Ng? pháp trung c?p: -(?)?, -? ???, -(?)? ? ??",
        "Ð?c hi?u bài báo don gi?n",
        "H?c t? v?ng chuyên ngành (kinh t?, xã h?i)",
        "Vi?t do?n van ng?n",
      ],
      tools: ["H?c theo ch? d?", "Ð?c tin t?c", "Thi th? TOPIK", "Ð?ng âm khác nghia"],
    },
    {
      level: "Cao c?p",
      topik: "TOPIK 5-6",
      duration: "12-24 tháng",
      color: "border-rose-400 bg-rose-50",
      badge: "bg-rose-100 text-rose-700",
      goals: [
        "N?m v?ng 2400+ t? Hán-Hàn (t?t c? nhóm)",
        "Ng? pháp nâng cao: -(?)???, -? ???",
        "Ð?c hi?u van b?n h?c thu?t, báo chí",
        "Vi?t lu?n, báo cáo b?ng ti?ng Hàn",
        "Giao ti?p t? nhiên trong m?i tình hu?ng",
      ],
      tools: ["T?t c? tính nang", "Thi th? TOPIK II", "H?c theo câu ví d?", "B?ng x?p h?ng"],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4 mb-2">
        <p className="text-sm text-gray-600 leading-relaxed">
          <strong>Luu ý:</strong> Th?i gian h?c ph? thu?c vào cu?ng d? h?c t?p. H?c 1-2 gi?/ngày có th? d?t TOPIK 2 trong 6 tháng. Ngu?i Vi?t có l?i th? nh? g?c Hán chung — thu?ng h?c nhanh hon 20-30% so v?i ngu?i không bi?t ch? Hán.
        </p>
      </div>
      {stages.map((stage, i) => (
        <div key={stage.level} className={`border-2 rounded-2xl p-5 ${stage.color}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full font-bold text-gray-700 border border-gray-200">
              {i + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-900">{stage.level}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${stage.badge}`}>{stage.topik}</span>
              </div>
              <p className="text-xs text-gray-500">{stage.duration}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">M?c tiêu</p>
              <ul className="space-y-1">
                {stage.goals.map(g => (
                  <li key={g} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <i className="ri-checkbox-circle-line text-green-500 mt-0.5 flex-shrink-0"></i>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Công c? nên dùng</p>
              <div className="flex flex-wrap gap-1.5">
                {stage.tools.map(t => (
                  <span key={t} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-600">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommunitySection() {
  return (
    <div className="space-y-5">
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
        <h4 className="font-bold text-violet-800 mb-2">C?ng d?ng Hàn Qu?c Oi!</h4>
        <p className="text-sm text-violet-700 leading-relaxed">
          H?c m?t mình có th? nhàm chán và thi?u d?ng l?c. Tham gia c?ng d?ng d? chia s? ti?n d?, h?i dáp, và cùng nhau ti?n b?. H?c cùng nhau luôn hi?u qu? hon!
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          {
            icon: "ri-discuss-line",
            title: "Di?n dàn c?ng d?ng",
            desc: "Ð?t câu h?i, chia s? m?o h?c, th?o lu?n v? K-pop và van hóa Hàn Qu?c v?i hàng nghìn h?c viên khác.",
            action: "Vào di?n dàn",
            path: "/community",
          },
          {
            icon: "ri-bar-chart-horizontal-line",
            title: "B?ng x?p h?ng tu?n",
            desc: "So sánh ti?n d? v?i b?n bè, c?nh tranh lành m?nh d? có thêm d?ng l?c h?c t?p m?i tu?n.",
            action: "Xem b?ng x?p h?ng",
            path: "/hanja-vocab",
          },
          {
            icon: "ri-sword-line",
            title: "Thách th?c tu?n",
            desc: "Tham gia thách th?c h?c t? v?ng hàng tu?n. Hoàn thành thách th?c d? nh?n XP và huy hi?u d?c bi?t.",
            action: "Xem thách th?c",
            path: "/hanja-vocab",
          },
          {
            icon: "ri-share-line",
            title: "Chia s? ti?n d?",
            desc: "Chia s? k?t qu? h?c t?p lên m?ng xã h?i d? khoe thành tích và truy?n c?m h?ng cho ngu?i khác.",
            action: "Chia s? ngay",
            path: "/hanja-vocab",
          },
        ].map(item => (
          <div key={item.title} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 flex items-center justify-center bg-violet-50 rounded-lg">
                <i className={`${item.icon} text-violet-600 text-sm`}></i>
              </div>
              <h5 className="font-semibold text-gray-900 text-sm">{item.title}</h5>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-5 text-center">
        <i className="ri-heart-line text-rose-500 text-3xl block mb-2"></i>
        <h4 className="font-bold text-gray-900 mb-2">Cùng nhau h?c ti?ng Hàn!</h4>
        <p className="text-sm text-gray-600 mb-4">
          Hàn Qu?c Oi! du?c xây d?ng v?i tình yêu dành cho ti?ng Hàn và van hóa Hàn Qu?c. Chúng tôi tin r?ng m?i ngu?i d?u có th? h?c ti?ng Hàn — ch? c?n có phuong pháp dúng và c?ng d?ng h? tr?.
        </p>
        <p className="text-xs text-gray-400">
          <strong>??? ?? ???!</strong> (C? lên trong vi?c h?c ti?ng Hàn!)
        </p>
      </div>
    </div>
  );
}

const SECTION_CONTENT: Record<string, React.ReactNode> = {
  intro: <IntroSection />,
  features: <FeaturesSection />,
  hanja: <HanjaSection />,
  topik: <TopikSection />,
  kpop: <KpopSection />,
  tips: <TipsSection />,
  roadmap: <RoadmapSection />,
  community: <CommunitySection />,
};

export default function GuidePage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("intro");

  const current = GUIDE_SECTIONS.find(s => s.id === activeSection)!;

  return (
    <DashboardLayout title="Hu?ng d?n Hàn Qu?c Oi!" subtitle="T?t c? nh?ng gì b?n c?n bi?t d? h?c ti?ng Hàn hi?u qu?">
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden mb-6 h-40">
          <img
            src="https://readdy.ai/api/search-image?query=Korean%20language%20learning%20guide%20book%20open%20pages%20with%20Korean%20characters%20hangul%20written%20beautifully%2C%20soft%20warm%20lighting%2C%20minimalist%20clean%20aesthetic%2C%20educational%20atmosphere%2C%20cherry%20blossom%20petals%20floating&width=1200&height=320&seq=guide-hero1&orientation=landscape"
            alt="Hu?ng d?n Hàn Qu?c Oi!"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center px-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Hu?ng d?n Hàn Qu?c Oi!</h1>
              <p className="text-white/70 text-sm">H?c ti?ng Hàn thông minh — dành riêng cho ngu?i Vi?t</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar navigation */}
          <div className="w-full lg:w-56 flex-shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden sticky top-4">
              <div className="p-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 tracking-normal">M?c l?c</p>
              </div>
              <div className="p-2">
                {GUIDE_SECTIONS.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all text-left ${
                      activeSection === section.id
                        ? `${section.bg} ${section.color} font-semibold`
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <i className={`${section.icon} text-sm flex-shrink-0`}></i>
                    <span className="leading-tight">{section.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 flex items-center justify-center ${current.bg} rounded-xl`}>
                <i className={`${current.icon} ${current.color} text-lg`}></i>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{current.title}</h2>
            </div>
            {SECTION_CONTENT[activeSection]}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8 pt-5 border-t border-gray-100">
              {GUIDE_SECTIONS.findIndex(s => s.id === activeSection) > 0 ? (
                <button
                  onClick={() => {
                    const idx = GUIDE_SECTIONS.findIndex(s => s.id === activeSection);
                    setActiveSection(GUIDE_SECTIONS[idx - 1].id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <i className="ri-arrow-left-line"></i>
                  {GUIDE_SECTIONS[GUIDE_SECTIONS.findIndex(s => s.id === activeSection) - 1].title}
                </button>
              ) : <div />}
              {GUIDE_SECTIONS.findIndex(s => s.id === activeSection) < GUIDE_SECTIONS.length - 1 ? (
                <button
                  onClick={() => {
                    const idx = GUIDE_SECTIONS.findIndex(s => s.id === activeSection);
                    setActiveSection(GUIDE_SECTIONS[idx + 1].id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm cursor-pointer hover:bg-rose-600 transition-colors"
                >
                  {GUIDE_SECTIONS[GUIDE_SECTIONS.findIndex(s => s.id === activeSection) + 1].title}
                  <i className="ri-arrow-right-line"></i>
                </button>
              ) : (
                <button
                  onClick={() => navigate("/hanja-vocab")}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm cursor-pointer hover:bg-rose-600 transition-colors"
                >
                  B?t d?u h?c ngay!
                  <i className="ri-arrow-right-line"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
