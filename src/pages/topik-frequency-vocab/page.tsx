import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface FreqWord {
  rank: number;
  korean: string;
  pronunciation: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
  exampleVi: string;
  topikLevel: "I" | "II";
  frequency: number; // times per 1000 words
  category: string;
}

const freqWords: FreqWord[] = [
  { rank: 1, korean: "이/가", pronunciation: "i/ga", partOfSpeech: "Trợ từ", meaning: "Chủ ngữ (là/thì)", example: "저가 학생이에요.", exampleVi: "Tôi là học sinh.", topikLevel: "I", frequency: 85, category: "Ngữ pháp" },
  { rank: 2, korean: "은/는", pronunciation: "eun/neun", partOfSpeech: "Trợ từ", meaning: "Chủ đề (thì/là)", example: "저는 베트남 사람이에요.", exampleVi: "Tôi là người Việt Nam.", topikLevel: "I", frequency: 82, category: "Ngữ pháp" },
  { rank: 3, korean: "하다", pronunciation: "ha-da", partOfSpeech: "Động từ", meaning: "Làm/Thực hiện", example: "공부를 해요.", exampleVi: "Tôi học bài.", topikLevel: "I", frequency: 78, category: "Hành động" },
  { rank: 4, korean: "있다", pronunciation: "it-da", partOfSpeech: "Động từ", meaning: "Có/Tồn tại", example: "책이 있어요.", exampleVi: "Có sách.", topikLevel: "I", frequency: 75, category: "Trạng thái" },
  { rank: 5, korean: "되다", pronunciation: "doe-da", partOfSpeech: "Động từ", meaning: "Trở thành/Được", example: "의사가 되고 싶어요.", exampleVi: "Tôi muốn trở thành bác sĩ.", topikLevel: "I", frequency: 72, category: "Hành động" },
  { rank: 6, korean: "수", pronunciation: "su", partOfSpeech: "Danh từ", meaning: "Khả năng (-(으)ㄹ 수 있다)", example: "할 수 있어요.", exampleVi: "Có thể làm được.", topikLevel: "I", frequency: 70, category: "Ngữ pháp" },
  { rank: 7, korean: "사람", pronunciation: "sa-ram", partOfSpeech: "Danh từ", meaning: "Người", example: "한국 사람이에요.", exampleVi: "Là người Hàn Quốc.", topikLevel: "I", frequency: 68, category: "Con người" },
  { rank: 8, korean: "우리", pronunciation: "u-ri", partOfSpeech: "Đại từ", meaning: "Chúng tôi/Của tôi", example: "우리 가족이에요.", exampleVi: "Là gia đình tôi.", topikLevel: "I", frequency: 65, category: "Con người" },
  { rank: 9, korean: "말하다", pronunciation: "mal-ha-da", partOfSpeech: "Động từ", meaning: "Nói", example: "한국어로 말해요.", exampleVi: "Nói bằng tiếng Hàn.", topikLevel: "I", frequency: 63, category: "Giao tiếp" },
  { rank: 10, korean: "알다", pronunciation: "al-da", partOfSpeech: "Động từ", meaning: "Biết/Hiểu", example: "그 사람을 알아요.", exampleVi: "Tôi biết người đó.", topikLevel: "I", frequency: 61, category: "Nhận thức" },
  { rank: 11, korean: "생각하다", pronunciation: "saeng-gak-ha-da", partOfSpeech: "Động từ", meaning: "Nghĩ/Suy nghĩ", example: "어떻게 생각해요?", exampleVi: "Bạn nghĩ thế nào?", topikLevel: "I", frequency: 58, category: "Nhận thức" },
  { rank: 12, korean: "보다", pronunciation: "bo-da", partOfSpeech: "Động từ", meaning: "Nhìn/Xem", example: "영화를 봐요.", exampleVi: "Xem phim.", topikLevel: "I", frequency: 56, category: "Hành động" },
  { rank: 13, korean: "오다", pronunciation: "o-da", partOfSpeech: "Động từ", meaning: "Đến/Tới", example: "한국에 왔어요.", exampleVi: "Đã đến Hàn Quốc.", topikLevel: "I", frequency: 54, category: "Di chuyển" },
  { rank: 14, korean: "가다", pronunciation: "ga-da", partOfSpeech: "Động từ", meaning: "Đi", example: "학교에 가요.", exampleVi: "Đi học.", topikLevel: "I", frequency: 53, category: "Di chuyển" },
  { rank: 15, korean: "때", pronunciation: "ttae", partOfSpeech: "Danh từ", meaning: "Lúc/Khi", example: "어릴 때 행복했어요.", exampleVi: "Lúc nhỏ tôi hạnh phúc.", topikLevel: "I", frequency: 51, category: "Thời gian" },
  { rank: 16, korean: "문제", pronunciation: "mun-je", partOfSpeech: "Danh từ", meaning: "Vấn đề/Câu hỏi", example: "문제가 있어요.", exampleVi: "Có vấn đề.", topikLevel: "II", frequency: 49, category: "Trừu tượng" },
  { rank: 17, korean: "경우", pronunciation: "gyeong-u", partOfSpeech: "Danh từ", meaning: "Trường hợp", example: "이런 경우에는 어떻게 해요?", exampleVi: "Trong trường hợp này làm thế nào?", topikLevel: "II", frequency: 47, category: "Trừu tượng" },
  { rank: 18, korean: "사회", pronunciation: "sa-hoe", partOfSpeech: "Danh từ", meaning: "Xã hội", example: "현대 사회가 변하고 있어요.", exampleVi: "Xã hội hiện đại đang thay đổi.", topikLevel: "II", frequency: 45, category: "Xã hội" },
  { rank: 19, korean: "통해", pronunciation: "tong-hae", partOfSpeech: "Trợ từ", meaning: "Qua/Thông qua", example: "인터넷을 통해 배워요.", exampleVi: "Học qua internet.", topikLevel: "II", frequency: 44, category: "Ngữ pháp" },
  { rank: 20, korean: "위해", pronunciation: "wi-hae", partOfSpeech: "Trợ từ", meaning: "Vì/Để", example: "건강을 위해 운동해요.", exampleVi: "Tập thể dục vì sức khỏe.", topikLevel: "II", frequency: 43, category: "Ngữ pháp" },
  { rank: 21, korean: "중요하다", pronunciation: "jung-yo-ha-da", partOfSpeech: "Tính từ", meaning: "Quan trọng", example: "교육이 중요해요.", exampleVi: "Giáo dục quan trọng.", topikLevel: "II", frequency: 42, category: "Đánh giá" },
  { rank: 22, korean: "필요하다", pronunciation: "pil-lyo-ha-da", partOfSpeech: "Tính từ", meaning: "Cần thiết", example: "도움이 필요해요.", exampleVi: "Cần sự giúp đỡ.", topikLevel: "II", frequency: 41, category: "Đánh giá" },
  { rank: 23, korean: "다양하다", pronunciation: "da-yang-ha-da", partOfSpeech: "Tính từ", meaning: "Đa dạng", example: "다양한 문화가 있어요.", exampleVi: "Có nhiều văn hóa đa dạng.", topikLevel: "II", frequency: 39, category: "Đánh giá" },
  { rank: 24, korean: "발전하다", pronunciation: "bal-jeon-ha-da", partOfSpeech: "Động từ", meaning: "Phát triển", example: "기술이 발전했어요.", exampleVi: "Công nghệ đã phát triển.", topikLevel: "II", frequency: 38, category: "Thay đổi" },
  { rank: 25, korean: "영향", pronunciation: "yeong-hyang", partOfSpeech: "Danh từ", meaning: "Ảnh hưởng", example: "환경에 영향을 줘요.", exampleVi: "Ảnh hưởng đến môi trường.", topikLevel: "II", frequency: 37, category: "Trừu tượng" },
  { rank: 26, korean: "관계", pronunciation: "gwan-gye", partOfSpeech: "Danh từ", meaning: "Mối quan hệ", example: "좋은 관계를 유지해요.", exampleVi: "Duy trì mối quan hệ tốt.", topikLevel: "II", frequency: 36, category: "Xã hội" },
  { rank: 27, korean: "현재", pronunciation: "hyeon-jae", partOfSpeech: "Danh từ", meaning: "Hiện tại", example: "현재 상황이 어때요?", exampleVi: "Tình hình hiện tại thế nào?", topikLevel: "II", frequency: 35, category: "Thời gian" },
  { rank: 28, korean: "결과", pronunciation: "gyeol-gwa", partOfSpeech: "Danh từ", meaning: "Kết quả", example: "좋은 결과가 나왔어요.", exampleVi: "Kết quả tốt đã ra.", topikLevel: "II", frequency: 34, category: "Trừu tượng" },
  { rank: 29, korean: "방법", pronunciation: "bang-beop", partOfSpeech: "Danh từ", meaning: "Phương pháp/Cách", example: "좋은 방법이 있어요.", exampleVi: "Có cách tốt.", topikLevel: "II", frequency: 33, category: "Trừu tượng" },
  { rank: 30, korean: "가능하다", pronunciation: "ga-neung-ha-da", partOfSpeech: "Tính từ", meaning: "Có thể/Khả thi", example: "그것이 가능해요?", exampleVi: "Điều đó có thể không?", topikLevel: "II", frequency: 32, category: "Đánh giá" },
];

const categories = ["Tất cả", ...new Set(freqWords.map(w => w.category))];

export default function TopikFrequencyVocabPage() {
  const [topikFilter, setTopikFilter] = useState<"all" | "I" | "II">("all");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<FreqWord | null>(null);
  const [learnedIds, setLearnedIds] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const filtered = useMemo(() => freqWords.filter(w => {
    const matchTopik = topikFilter === "all" || w.topikLevel === topikFilter;
    const matchCat = categoryFilter === "Tất cả" || w.category === categoryFilter;
    const matchSearch = !searchQuery || w.korean.includes(searchQuery) || w.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTopik && matchCat && matchSearch;
  }), [topikFilter, categoryFilter, searchQuery]);

  const handleTTS = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "ko-KR";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  const toggleLearned = (rank: number) => {
    setLearnedIds(prev => {
      const next = new Set(prev);
      if (next.has(rank)) next.delete(rank);
      else next.add(rank);
      return next;
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white font-bold text-2xl mb-1">Từ vựng theo tần suất TOPIK</h1>
          <p className="text-white/50 text-sm">30 từ xuất hiện nhiều nhất trong đề thi TOPIK — học đúng trọng tâm</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Tổng từ", value: freqWords.length, color: "#e8c84a" },
            { label: "TOPIK I", value: freqWords.filter(w => w.topikLevel === "I").length, color: "#34d399" },
            { label: "TOPIK II", value: freqWords.filter(w => w.topikLevel === "II").length, color: "#f87171" },
            { label: "Đã học", value: learnedIds.size, color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-app-border bg-app-surface/50 p-3 text-center">
              <p className="text-white font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-app-text-secondary text-xs">Tiến độ học</span>
            <span className="text-white/60 text-xs font-bold">{learnedIds.size}/{freqWords.length} từ</span>
          </div>
          <div className="h-2 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-app-accent-primary rounded-full transition-all duration-500"
              style={{ width: `${(learnedIds.size / freqWords.length) * 100}%` }} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex gap-1 p-1 bg-app-card/50 rounded-xl">
            {(["all", "I", "II"] as const).map(t => (
              <button key={t} onClick={() => setTopikFilter(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${topikFilter === t ? "bg-app-accent-primary text-[#141720]" : "text-white/50 hover:text-white/80"}`}>
                {t === "all" ? "Tất cả" : `TOPIK ${t}`}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-48">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm từ..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-app-card/50 border border-app-border text-white text-sm placeholder-white/25 outline-none focus:border-white/20" />
          </div>
          <div className="flex gap-1 p-1 bg-app-card/50 rounded-xl">
            <button onClick={() => setViewMode("list")} className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer ${viewMode === "list" ? "bg-white/15 text-white" : "text-app-text-secondary"}`}>
              <i className="ri-list-check text-sm"></i>
            </button>
            <button onClick={() => setViewMode("grid")} className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer ${viewMode === "grid" ? "bg-white/15 text-white" : "text-app-text-secondary"}`}>
              <i className="ri-grid-line text-sm"></i>
            </button>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-5">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${categoryFilter === cat ? "bg-white/15 text-white" : "bg-app-card/50 text-app-text-secondary hover:bg-white/8"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Word list */}
        {viewMode === "list" ? (
          <div className="space-y-2">
            {filtered.map(w => (
              <div key={w.rank}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl border cursor-pointer transition-all ${learnedIds.has(w.rank) ? "border-emerald-500/20 bg-emerald-500/5" : "border-app-border bg-app-surface/50 hover:bg-app-card/50"}`}
                onClick={() => setSelectedWord(w)}>
                {/* Rank */}
                <span className="text-app-text-muted text-xs font-bold w-6 text-center flex-shrink-0">#{w.rank}</span>

                {/* Frequency bar */}
                <div className="w-12 flex-shrink-0">
                  <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-app-accent-primary" style={{ width: `${(w.frequency / 85) * 100}%` }} />
                  </div>
                  <p className="text-app-text-muted text-[9px] mt-0.5 text-center">{w.frequency}/1k</p>
                </div>

                {/* Word */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-base">{w.korean}</span>
                    <span className="text-app-text-muted text-xs">[{w.pronunciation}]</span>
                    <span className="text-app-text-muted text-[10px]">{w.partOfSpeech}</span>
                  </div>
                  <p className="text-app-accent-primary text-sm">{w.meaning}</p>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${w.topikLevel === "I" ? "bg-app-accent-success/15 text-app-accent-success" : "bg-rose-500/15 text-rose-400"}`}>
                    TOPIK {w.topikLevel}
                  </span>
                  <button onClick={e => { e.stopPropagation(); handleTTS(w.korean); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-muted hover:text-white/60 cursor-pointer">
                    <i className="ri-volume-up-line text-xs"></i>
                  </button>
                  <button onClick={e => { e.stopPropagation(); toggleLearned(w.rank); }}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${learnedIds.has(w.rank) ? "bg-emerald-500/20 text-app-accent-success" : "bg-app-card/50 hover:bg-app-card/70 text-app-text-muted hover:text-white/60"}`}>
                    <i className={learnedIds.has(w.rank) ? "ri-checkbox-circle-fill text-xs" : "ri-checkbox-blank-circle-line text-xs"}></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map(w => (
              <div key={w.rank}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${learnedIds.has(w.rank) ? "border-emerald-500/20 bg-emerald-500/5" : "border-app-border bg-app-surface/50 hover:bg-app-card/50"}`}
                onClick={() => setSelectedWord(w)}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-app-text-muted text-[10px]">#{w.rank}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${w.topikLevel === "I" ? "bg-app-accent-success/15 text-app-accent-success" : "bg-rose-500/15 text-rose-400"}`}>
                    TOPIK {w.topikLevel}
                  </span>
                </div>
                <p className="text-white font-bold text-lg mb-0.5">{w.korean}</p>
                <p className="text-app-accent-primary text-sm mb-2">{w.meaning}</p>
                <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-app-accent-primary/60" style={{ width: `${(w.frequency / 85) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Word detail modal */}
        {selectedWord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setSelectedWord(null)}>
            <div className="w-full max-w-md rounded-2xl border border-app-border bg-[#1a1f2e] p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-3xl">{selectedWord.korean}</span>
                    <button onClick={() => handleTTS(selectedWord.korean)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/8 hover:bg-white/15 text-white/50 cursor-pointer">
                      <i className="ri-volume-up-line"></i>
                    </button>
                  </div>
                  <p className="text-app-text-secondary text-sm">[{selectedWord.pronunciation}] · {selectedWord.partOfSpeech}</p>
                </div>
                <button onClick={() => setSelectedWord(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary cursor-pointer">
                  <i className="ri-close-line"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-app-accent-primary/5 border border-app-accent-primary/15">
                  <p className="text-app-accent-primary font-bold text-lg">{selectedWord.meaning}</p>
                </div>

                <div className="p-3 rounded-xl bg-app-card/50 border border-app-border">
                  <p className="text-app-text-secondary text-xs mb-1">Ví dụ</p>
                  <p className="text-white text-sm mb-1">{selectedWord.example}</p>
                  <p className="text-app-text-secondary text-xs italic">{selectedWord.exampleVi}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-app-card/50">
                    <p className="text-white/60 text-xs font-bold">Hạng</p>
                    <p className="text-app-accent-primary font-bold">#{selectedWord.rank}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-app-card/50">
                    <p className="text-white/60 text-xs font-bold">Tần suất</p>
                    <p className="text-app-accent-primary font-bold">{selectedWord.frequency}/1k</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-app-card/50">
                    <p className="text-white/60 text-xs font-bold">TOPIK</p>
                    <p className={`font-bold ${selectedWord.topikLevel === "I" ? "text-app-accent-success" : "text-rose-400"}`}>
                      {selectedWord.topikLevel}
                    </p>
                  </div>
                </div>

                <button onClick={() => { toggleLearned(selectedWord.rank); setSelectedWord(null); }}
                  className={`w-full py-3 rounded-xl font-bold text-sm cursor-pointer whitespace-nowrap transition-colors ${learnedIds.has(selectedWord.rank) ? "bg-white/8 text-white/60" : "bg-app-accent-primary text-[#141720]"}`}>
                  {learnedIds.has(selectedWord.rank) ? "Bỏ đánh dấu đã học" : "Đánh dấu đã học"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


