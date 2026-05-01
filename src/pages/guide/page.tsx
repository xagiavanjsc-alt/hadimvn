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
  { id: "intro", title: "Hàn Quốc Ơi! là gì?", icon: "ri-information-line", color: "text-rose-600", bg: "bg-rose-50" },
  { id: "features", title: "Tính năng nổi bật", icon: "ri-star-line", color: "text-amber-600", bg: "bg-amber-50" },
  { id: "hanja", title: "Học Hán-Hàn hiệu quả", icon: "ri-translate-2", color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "topik", title: "Luyện thi TOPIK", icon: "ri-file-paper-2-line", color: "text-green-600", bg: "bg-green-50" },
  { id: "kpop", title: "Học qua K-pop", icon: "ri-music-2-line", color: "text-pink-600", bg: "bg-pink-50" },
  { id: "tips", title: "Mẹo học tiếng Hàn", icon: "ri-lightbulb-line", color: "text-orange-600", bg: "bg-orange-50" },
  { id: "roadmap", title: "Lộ trình học", icon: "ri-route-line", color: "text-teal-600", bg: "bg-teal-50" },
  { id: "community", title: "Cộng đồng & Chia sẻ", icon: "ri-team-line", color: "text-violet-600", bg: "bg-violet-50" },
];

function IntroSection() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">Chào mừng đến với Hàn Quốc Ơi!</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          <strong>Hàn Quốc Ơi!</strong> là nền tảng học tiếng Hàn toàn diện dành riêng cho người Việt Nam — kết hợp phương pháp học khoa học với văn hóa K-pop, giúp bạn học tiếng Hàn một cách tự nhiên, hiệu quả và thú vị.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "ri-book-open-line", label: "2,400+ từ Hán-Hàn", color: "text-rose-600" },
            { icon: "ri-brain-line", label: "Spaced Repetition", color: "text-indigo-600" },
            { icon: "ri-music-2-line", label: "Học qua K-pop", color: "text-pink-600" },
            { icon: "ri-trophy-line", label: "Thi thử TOPIK", color: "text-amber-600" },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <i className={`${item.icon} ${item.color} text-2xl block mb-1`}></i>
              <p className="text-xs text-gray-600 font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 mb-3">Tại sao chọn Hàn Quốc Ơi!?</h4>
        <div className="space-y-3">
          {[
            {
              icon: "ri-flag-line",
              title: "Thiết kế cho người Việt",
              desc: "Giao diện tiếng Việt hoàn toàn, giải thích ngữ pháp bằng tiếng Việt, so sánh Hán-Việt để học nhanh hơn. Người Việt có lợi thế đặc biệt khi học tiếng Hàn nhờ gốc chữ Hán chung!",
            },
            {
              icon: "ri-brain-line",
              title: "Phương pháp khoa học SM-2",
              desc: "Thuật toán Spaced Repetition (SM-2) tự động tính toán thời điểm ôn tập tối ưu cho từng từ, giúp bạn nhớ lâu hơn với ít thời gian hơn.",
            },
            {
              icon: "ri-music-2-line",
              title: "Học qua K-pop thực tế",
              desc: "Từ vựng và ngữ pháp được học qua lời bài hát K-pop thực tế, giúp bạn nhớ từ trong ngữ cảnh tự nhiên và cảm nhận được âm nhạc Hàn Quốc.",
            },
            {
              icon: "ri-route-line",
              title: "Lộ trình cá nhân hóa",
              desc: "Hệ thống tự động đề xuất từ cần ôn, chủ đề cần học dựa trên tiến độ thực tế của bạn. Không học theo kiểu 'một size cho tất cả'.",
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
      category: "Từ vựng Hán-Hàn",
      color: "bg-rose-50 border-rose-200",
      titleColor: "text-rose-700",
      items: [
        "2,400+ từ Hán-Hàn phân loại theo chữ cái đầu",
        "Flashcard lật thẻ với TTS phát âm chuẩn",
        "Spaced Repetition (SM-2) — ôn đúng lúc, nhớ lâu",
        "So sánh Hán-Việt — người Việt học nhanh hơn 3x",
        "Học theo cặp từ đồng âm khác nghĩa (의사, 지도...)",
        "Học theo chủ đề nâng cao: Kinh tế, Y tế, Chính trị",
        "Ghép cặp drag & drop — học vui, nhớ lâu",
        "Nhật ký học tập — theo dõi tiến độ mỗi ngày",
      ],
    },
    {
      category: "Luyện thi TOPIK",
      color: "bg-green-50 border-green-200",
      titleColor: "text-green-700",
      items: [
        "Thi thử TOPIK Hán-Hàn — 30 câu + timer 30 phút",
        "3 dạng câu: Hàn→Việt, Việt→Hàn, Hán tự→Hàn",
        "Review câu sai sau khi thi",
        "Lịch sử 10 lần thi — theo dõi tiến bộ",
        "Lọc theo nhóm chữ cái để thi chuyên đề",
        "Câu ví dụ thực tế từ đề thi TOPIK",
      ],
    },
    {
      category: "K-pop & Văn hóa",
      color: "bg-pink-50 border-pink-200",
      titleColor: "text-pink-700",
      items: [
        "Học từ vựng qua lời bài hát K-pop (Melon Top 100)",
        "AI tạo truyện chêm từ bài hát yêu thích",
        "Học qua tin tức Hàn Quốc thực tế",
        "Từ điển hàng ngày — 5 từ mới mỗi ngày",
        "Luyện phát âm với ghi âm + so sánh TTS",
      ],
    },
    {
      category: "Gamification",
      color: "bg-amber-50 border-amber-200",
      titleColor: "text-amber-700",
      items: [
        "Hệ thống XP + phần thưởng hàng ngày",
        "Streak học tập — duy trì thói quen",
        "Bảng xếp hạng tuần — cạnh tranh với bạn bè",
        "Thách thức tuần — mục tiêu học tập",
        "Huy hiệu thành tích — ghi nhận nỗ lực",
        "Phạt XP khi bỏ học — tạo động lực",
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
        <h4 className="font-bold text-indigo-800 mb-2">Tại sao người Việt học Hán-Hàn dễ hơn?</h4>
        <p className="text-sm text-indigo-700 leading-relaxed">
          Tiếng Việt và tiếng Hàn đều có nguồn gốc từ chữ Hán. Khoảng <strong>60-70% từ vựng tiếng Hàn</strong> có gốc Hán, và nhiều từ phát âm rất giống tiếng Việt. Ví dụ: 국가 (quốc gia), 경제 (kinh tế), 사회 (xã hội)...
        </p>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 mb-3">Cách học Hán-Hàn hiệu quả</h4>
        <div className="space-y-3">
          {[
            {
              step: "1",
              title: "Bắt đầu với nhóm ㄱ-ㄴ",
              desc: "Học theo thứ tự chữ cái Hangul. Mỗi ngày học 10-15 từ, không cố học quá nhiều một lúc.",
              tip: "Dùng tab 'Từ vựng' → lọc theo chữ cái đầu",
            },
            {
              step: "2",
              title: "Kích hoạt Spaced Repetition",
              desc: "Sau khi học từ mới, chuyển sang tab 'Spaced Rep' để ôn tập. Hệ thống sẽ tự động nhắc bạn ôn đúng lúc.",
              tip: "Mỗi ngày dành 10-15 phút ôn SR",
            },
            {
              step: "3",
              title: "So sánh với Hán-Việt",
              desc: "Dùng tab 'So sánh Hán Việt' để tìm những từ giống tiếng Việt. Những từ này bạn sẽ nhớ ngay lập tức!",
              tip: "국가=quốc gia, 경제=kinh tế, 사회=xã hội",
            },
            {
              step: "4",
              title: "Học theo chủ đề nâng cao",
              desc: "Khi đã có nền tảng, học từ vựng chuyên ngành theo chủ đề: Kinh tế, Y tế, Chính trị, Công nghệ...",
              tip: "Tab 'Chủ đề nâng cao' — có câu ví dụ thực tế",
            },
            {
              step: "5",
              title: "Thi thử TOPIK định kỳ",
              desc: "Mỗi tuần làm 1 bài thi thử TOPIK để kiểm tra tiến độ. Review câu sai để biết điểm yếu cần cải thiện.",
              tip: "Tab 'Thi thử TOPIK' — 30 câu, 30 phút",
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
          <i className="ri-fire-line mr-1"></i>Mẹo nhanh: Nhóm từ dễ nhớ nhất
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ["국가 (國家)", "quốc gia"],
            ["경제 (經濟)", "kinh tế"],
            ["사회 (社會)", "xã hội"],
            ["문화 (文化)", "văn hóa"],
            ["교육 (敎育)", "giáo dục"],
            ["정치 (政治)", "chính trị"],
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
          <strong>TOPIK (Test of Proficiency in Korean)</strong> là kỳ thi năng lực tiếng Hàn quốc tế do Bộ Giáo dục Hàn Quốc tổ chức. Có 6 cấp độ (TOPIK I: 1-2, TOPIK II: 3-6). Chứng chỉ TOPIK được công nhận toàn cầu, cần thiết cho du học, làm việc tại Hàn Quốc.
        </p>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 mb-3">Cấu trúc đề thi TOPIK</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">Cấp độ</th>
                <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">Kỹ năng</th>
                <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">Số câu</th>
                <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["TOPIK I (1-2)", "Nghe + Đọc", "70 câu", "100 phút"],
                ["TOPIK II (3-4)", "Nghe + Đọc + Viết", "104 câu", "180 phút"],
                ["TOPIK II (5-6)", "Nghe + Đọc + Viết", "104 câu", "180 phút"],
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
        <h4 className="font-bold text-gray-900 mb-3">Lộ trình luyện thi TOPIK với Hàn Quốc Ơi!</h4>
        <div className="space-y-3">
          {[
            { level: "TOPIK 1-2", time: "3-6 tháng", desc: "Học 500-800 từ Hán-Hàn cơ bản, ngữ pháp cơ bản, luyện nghe qua K-pop", color: "bg-green-100 text-green-700" },
            { level: "TOPIK 3-4", time: "6-12 tháng", desc: "Mở rộng 1500+ từ, học từ vựng chuyên ngành, luyện đọc báo Hàn", color: "bg-amber-100 text-amber-700" },
            { level: "TOPIK 5-6", time: "12-24 tháng", desc: "Nắm vững 2400+ từ Hán-Hàn, từ vựng học thuật, viết luận", color: "bg-rose-100 text-rose-700" },
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
        <h4 className="font-bold text-pink-800 mb-2">Tại sao học qua K-pop hiệu quả?</h4>
        <p className="text-sm text-pink-700 leading-relaxed">
          Nghiên cứu ngôn ngữ học cho thấy học qua âm nhạc giúp nhớ từ vựng lâu hơn 40% so với học thuần túy. Lời bài hát K-pop chứa nhiều từ vựng thực tế, cảm xúc tự nhiên, và được lặp đi lặp lại — điều kiện lý tưởng để ghi nhớ.
        </p>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 mb-3">Cách học qua K-pop trên Hàn Quốc Ơi!</h4>
        <div className="space-y-3">
          {[
            {
              icon: "ri-music-2-line",
              title: "Melon K-pop Lesson",
              desc: "AI phân tích bài hát từ Melon Top 100, tạo bài học với từ vựng, ngữ pháp và truyện chêm thú vị. Học từ bài hát bạn yêu thích!",
              path: "/melon",
            },
            {
              icon: "ri-newspaper-line",
              title: "Học qua Tin tức",
              desc: "Đọc báo Hàn thực tế, AI highlight từ vựng quan trọng và giải thích ngữ pháp theo trình độ của bạn.",
              path: "/news",
            },
            {
              icon: "ri-volume-up-line",
              title: "Luyện phát âm",
              desc: "Ghi âm giọng nói, so sánh với phát âm chuẩn TTS. Nhận điểm số và gợi ý cải thiện.",
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
        <p className="text-sm font-semibold text-gray-700 mb-3">Nghệ sĩ phổ biến trong bài học</p>
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
      category: "Học từ vựng",
      icon: "ri-book-open-line",
      color: "text-rose-600",
      bg: "bg-rose-50",
      items: [
        "Học 10-15 từ mới mỗi ngày, không cố học quá nhiều",
        "Luôn học từ trong ngữ cảnh câu ví dụ, không học từ đơn lẻ",
        "Dùng Spaced Repetition — đừng bỏ qua phiên ôn tập",
        "Nhóm từ theo chủ đề để nhớ dễ hơn (kinh tế, y tế...)",
        "Người Việt: tận dụng gốc Hán-Việt để đoán nghĩa từ Hàn",
      ],
    },
    {
      category: "Luyện nghe & nói",
      icon: "ri-volume-up-line",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      items: [
        "Nghe TTS mỗi từ khi học — tập phát âm ngay từ đầu",
        "Dùng tính năng ghi âm để so sánh phát âm của bạn",
        "Xem phim/drama Hàn có phụ đề tiếng Hàn",
        "Nghe nhạc K-pop và cố gắng nhận ra từ đã học",
        "Luyện đọc to — không chỉ đọc thầm trong đầu",
      ],
    },
    {
      category: "Duy trì động lực",
      icon: "ri-fire-line",
      color: "text-orange-600",
      bg: "bg-orange-50",
      items: [
        "Đặt mục tiêu nhỏ hàng ngày (10 từ/ngày) thay vì mục tiêu lớn",
        "Duy trì streak học tập — đừng để chuỗi bị đứt",
        "Tham gia thách thức tuần để có mục tiêu cụ thể",
        "Ghi nhật ký học tập để thấy tiến bộ của mình",
        "Kết nối với cộng đồng học tiếng Hàn để có động lực",
      ],
    },
    {
      category: "Chuẩn bị thi TOPIK",
      icon: "ri-file-paper-2-line",
      color: "text-green-600",
      bg: "bg-green-50",
      items: [
        "Làm bài thi thử ít nhất 1 lần/tuần",
        "Review kỹ câu sai — đây là điểm yếu cần cải thiện",
        "Học từ vựng theo chủ đề TOPIK: xã hội, kinh tế, văn hóa",
        "Luyện đọc báo Hàn để quen với văn phong học thuật",
        "Đăng ký thi thật để có deadline cụ thể",
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
      level: "Sơ cấp",
      topik: "TOPIK 1-2",
      duration: "3-6 tháng",
      color: "border-green-400 bg-green-50",
      badge: "bg-green-100 text-green-700",
      goals: [
        "Thuộc bảng chữ cái Hangul",
        "Học 500-800 từ Hán-Hàn cơ bản (nhóm ㄱ-ㄷ)",
        "Ngữ pháp cơ bản: -이에요/예요, -아/어요, -고 싶다",
        "Giao tiếp đơn giản: chào hỏi, mua sắm, ăn uống",
        "Nghe hiểu hội thoại đơn giản",
      ],
      tools: ["Flashcard", "Spaced Rep", "Quiz cơ bản", "Luyện phát âm"],
    },
    {
      level: "Trung cấp",
      topik: "TOPIK 3-4",
      duration: "6-12 tháng",
      color: "border-amber-400 bg-amber-50",
      badge: "bg-amber-100 text-amber-700",
      goals: [
        "Mở rộng 1500+ từ Hán-Hàn (nhóm ㄹ-ㅅ)",
        "Ngữ pháp trung cấp: -(으)면, -기 때문에, -(으)ㄹ 것 같다",
        "Đọc hiểu bài báo đơn giản",
        "Học từ vựng chuyên ngành (kinh tế, xã hội)",
        "Viết đoạn văn ngắn",
      ],
      tools: ["Học theo chủ đề", "Đọc tin tức", "Thi thử TOPIK", "Đồng âm khác nghĩa"],
    },
    {
      level: "Cao cấp",
      topik: "TOPIK 5-6",
      duration: "12-24 tháng",
      color: "border-rose-400 bg-rose-50",
      badge: "bg-rose-100 text-rose-700",
      goals: [
        "Nắm vững 2400+ từ Hán-Hàn (tất cả nhóm)",
        "Ngữ pháp nâng cao: -(으)ㄹ수록, -는 반면에",
        "Đọc hiểu văn bản học thuật, báo chí",
        "Viết luận, báo cáo bằng tiếng Hàn",
        "Giao tiếp tự nhiên trong mọi tình huống",
      ],
      tools: ["Tất cả tính năng", "Thi thử TOPIK II", "Học theo câu ví dụ", "Bảng xếp hạng"],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4 mb-2">
        <p className="text-sm text-gray-600 leading-relaxed">
          <strong>Lưu ý:</strong> Thời gian học phụ thuộc vào cường độ học tập. Học 1-2 giờ/ngày có thể đạt TOPIK 2 trong 6 tháng. Người Việt có lợi thế nhờ gốc Hán chung — thường học nhanh hơn 20-30% so với người không biết chữ Hán.
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
              <p className="text-xs font-semibold text-gray-600 mb-2">Mục tiêu</p>
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
              <p className="text-xs font-semibold text-gray-600 mb-2">Công cụ nên dùng</p>
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
        <h4 className="font-bold text-violet-800 mb-2">Cộng đồng Hàn Quốc Ơi!</h4>
        <p className="text-sm text-violet-700 leading-relaxed">
          Học một mình có thể nhàm chán và thiếu động lực. Tham gia cộng đồng để chia sẻ tiến độ, hỏi đáp, và cùng nhau tiến bộ. Học cùng nhau luôn hiệu quả hơn!
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          {
            icon: "ri-discuss-line",
            title: "Diễn đàn cộng đồng",
            desc: "Đặt câu hỏi, chia sẻ mẹo học, thảo luận về K-pop và văn hóa Hàn Quốc với hàng nghìn học viên khác.",
            action: "Vào diễn đàn",
            path: "/community",
          },
          {
            icon: "ri-bar-chart-horizontal-line",
            title: "Bảng xếp hạng tuần",
            desc: "So sánh tiến độ với bạn bè, cạnh tranh lành mạnh để có thêm động lực học tập mỗi tuần.",
            action: "Xem bảng xếp hạng",
            path: "/hanja-vocab",
          },
          {
            icon: "ri-sword-line",
            title: "Thách thức tuần",
            desc: "Tham gia thách thức học từ vựng hàng tuần. Hoàn thành thách thức để nhận XP và huy hiệu đặc biệt.",
            action: "Xem thách thức",
            path: "/hanja-vocab",
          },
          {
            icon: "ri-share-line",
            title: "Chia sẻ tiến độ",
            desc: "Chia sẻ kết quả học tập lên mạng xã hội để khoe thành tích và truyền cảm hứng cho người khác.",
            action: "Chia sẻ ngay",
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
        <h4 className="font-bold text-gray-900 mb-2">Cùng nhau học tiếng Hàn!</h4>
        <p className="text-sm text-gray-600 mb-4">
          Hàn Quốc Ơi! được xây dựng với tình yêu dành cho tiếng Hàn và văn hóa Hàn Quốc. Chúng tôi tin rằng mọi người đều có thể học tiếng Hàn — chỉ cần có phương pháp đúng và cộng đồng hỗ trợ.
        </p>
        <p className="text-xs text-gray-400">
          <strong>한국어 공부 화이팅!</strong> (Cố lên trong việc học tiếng Hàn!)
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
    <DashboardLayout title="Hướng dẫn Hàn Quốc Ơi!" subtitle="Tất cả những gì bạn cần biết để học tiếng Hàn hiệu quả">
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden mb-6 h-40">
          <img
            src="https://readdy.ai/api/search-image?query=Korean%20language%20learning%20guide%20book%20open%20pages%20with%20Korean%20characters%20hangul%20written%20beautifully%2C%20soft%20warm%20lighting%2C%20minimalist%20clean%20aesthetic%2C%20educational%20atmosphere%2C%20cherry%20blossom%20petals%20floating&width=1200&height=320&seq=guide-hero1&orientation=landscape"
            alt="Hướng dẫn Hàn Quốc Ơi!"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center px-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Hướng dẫn Hàn Quốc Ơi!</h1>
              <p className="text-white/70 text-sm">Học tiếng Hàn thông minh — dành riêng cho người Việt</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar navigation */}
          <div className="w-full lg:w-56 flex-shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden sticky top-4">
              <div className="p-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 tracking-wider">Mục lục</p>
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
                  Bắt đầu học ngay!
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
