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
  { rank: 1, korean: "?/?", pronunciation: "i/ga", partOfSpeech: "Tr? t?", meaning: "Ch? ng? (là/thì)", example: "?? ?????.", exampleVi: "Tôi là h?c sinh.", topikLevel: "I", frequency: 85, category: "Ng? pháp" },
  { rank: 2, korean: "?/?", pronunciation: "eun/neun", partOfSpeech: "Tr? t?", meaning: "Ch? d? (thì/là)", example: "?? ??? ?????.", exampleVi: "Tôi là ngu?i Vi?t Nam.", topikLevel: "I", frequency: 82, category: "Ng? pháp" },
  { rank: 3, korean: "??", pronunciation: "ha-da", partOfSpeech: "Ð?ng t?", meaning: "Làm/Th?c hi?n", example: "??? ??.", exampleVi: "Tôi h?c bài.", topikLevel: "I", frequency: 78, category: "Hành d?ng" },
  { rank: 4, korean: "??", pronunciation: "it-da", partOfSpeech: "Ð?ng t?", meaning: "Có/T?n t?i", example: "?? ???.", exampleVi: "Có sách.", topikLevel: "I", frequency: 75, category: "Tr?ng thái" },
  { rank: 5, korean: "??", pronunciation: "doe-da", partOfSpeech: "Ð?ng t?", meaning: "Tr? thành/Ðu?c", example: "??? ?? ???.", exampleVi: "Tôi mu?n tr? thành bác si.", topikLevel: "I", frequency: 72, category: "Hành d?ng" },
  { rank: 6, korean: "?", pronunciation: "su", partOfSpeech: "Danh t?", meaning: "Kh? nang (-(?)? ? ??)", example: "? ? ???.", exampleVi: "Có th? làm du?c.", topikLevel: "I", frequency: 70, category: "Ng? pháp" },
  { rank: 7, korean: "??", pronunciation: "sa-ram", partOfSpeech: "Danh t?", meaning: "Ngu?i", example: "?? ?????.", exampleVi: "Là ngu?i Hàn Qu?c.", topikLevel: "I", frequency: 68, category: "Con ngu?i" },
  { rank: 8, korean: "??", pronunciation: "u-ri", partOfSpeech: "Ð?i t?", meaning: "Chúng tôi/C?a tôi", example: "?? ?????.", exampleVi: "Là gia dình tôi.", topikLevel: "I", frequency: 65, category: "Con ngu?i" },
  { rank: 9, korean: "???", pronunciation: "mal-ha-da", partOfSpeech: "Ð?ng t?", meaning: "Nói", example: "???? ???.", exampleVi: "Nói b?ng ti?ng Hàn.", topikLevel: "I", frequency: 63, category: "Giao ti?p" },
  { rank: 10, korean: "??", pronunciation: "al-da", partOfSpeech: "Ð?ng t?", meaning: "Bi?t/Hi?u", example: "? ??? ???.", exampleVi: "Tôi bi?t ngu?i dó.", topikLevel: "I", frequency: 61, category: "Nh?n th?c" },
  { rank: 11, korean: "????", pronunciation: "saeng-gak-ha-da", partOfSpeech: "Ð?ng t?", meaning: "Nghi/Suy nghi", example: "??? ?????", exampleVi: "B?n nghi th? nào?", topikLevel: "I", frequency: 58, category: "Nh?n th?c" },
  { rank: 12, korean: "??", pronunciation: "bo-da", partOfSpeech: "Ð?ng t?", meaning: "Nhìn/Xem", example: "??? ??.", exampleVi: "Xem phim.", topikLevel: "I", frequency: 56, category: "Hành d?ng" },
  { rank: 13, korean: "??", pronunciation: "o-da", partOfSpeech: "Ð?ng t?", meaning: "Ð?n/T?i", example: "??? ???.", exampleVi: "Ðã d?n Hàn Qu?c.", topikLevel: "I", frequency: 54, category: "Di chuy?n" },
  { rank: 14, korean: "??", pronunciation: "ga-da", partOfSpeech: "Ð?ng t?", meaning: "Ði", example: "??? ??.", exampleVi: "Ði h?c.", topikLevel: "I", frequency: 53, category: "Di chuy?n" },
  { rank: 15, korean: "?", pronunciation: "ttae", partOfSpeech: "Danh t?", meaning: "Lúc/Khi", example: "?? ? ?????.", exampleVi: "Lúc nh? tôi h?nh phúc.", topikLevel: "I", frequency: 51, category: "Th?i gian" },
  { rank: 16, korean: "??", pronunciation: "mun-je", partOfSpeech: "Danh t?", meaning: "V?n d?/Câu h?i", example: "??? ???.", exampleVi: "Có v?n d?.", topikLevel: "II", frequency: 49, category: "Tr?u tu?ng" },
  { rank: 17, korean: "??", pronunciation: "gyeong-u", partOfSpeech: "Danh t?", meaning: "Tru?ng h?p", example: "?? ???? ??? ???", exampleVi: "Trong tru?ng h?p này làm th? nào?", topikLevel: "II", frequency: 47, category: "Tr?u tu?ng" },
  { rank: 18, korean: "??", pronunciation: "sa-hoe", partOfSpeech: "Danh t?", meaning: "Xã h?i", example: "?? ??? ??? ???.", exampleVi: "Xã h?i hi?n d?i dang thay d?i.", topikLevel: "II", frequency: 45, category: "Xã h?i" },
  { rank: 19, korean: "??", pronunciation: "tong-hae", partOfSpeech: "Tr? t?", meaning: "Qua/Thông qua", example: "???? ?? ???.", exampleVi: "H?c qua internet.", topikLevel: "II", frequency: 44, category: "Ng? pháp" },
  { rank: 20, korean: "??", pronunciation: "wi-hae", partOfSpeech: "Tr? t?", meaning: "Vì/Ð?", example: "??? ?? ????.", exampleVi: "T?p th? d?c vì s?c kh?e.", topikLevel: "II", frequency: 43, category: "Ng? pháp" },
  { rank: 21, korean: "????", pronunciation: "jung-yo-ha-da", partOfSpeech: "Tính t?", meaning: "Quan tr?ng", example: "??? ????.", exampleVi: "Giáo d?c quan tr?ng.", topikLevel: "II", frequency: 42, category: "Ðánh giá" },
  { rank: 22, korean: "????", pronunciation: "pil-lyo-ha-da", partOfSpeech: "Tính t?", meaning: "C?n thi?t", example: "??? ????.", exampleVi: "C?n s? giúp d?.", topikLevel: "II", frequency: 41, category: "Ðánh giá" },
  { rank: 23, korean: "????", pronunciation: "da-yang-ha-da", partOfSpeech: "Tính t?", meaning: "Ða d?ng", example: "??? ??? ???.", exampleVi: "Có nhi?u van hóa da d?ng.", topikLevel: "II", frequency: 39, category: "Ðánh giá" },
  { rank: 24, korean: "????", pronunciation: "bal-jeon-ha-da", partOfSpeech: "Ð?ng t?", meaning: "Phát tri?n", example: "??? ?????.", exampleVi: "Công ngh? dã phát tri?n.", topikLevel: "II", frequency: 38, category: "Thay d?i" },
  { rank: 25, korean: "??", pronunciation: "yeong-hyang", partOfSpeech: "Danh t?", meaning: "?nh hu?ng", example: "??? ??? ??.", exampleVi: "?nh hu?ng d?n môi tru?ng.", topikLevel: "II", frequency: 37, category: "Tr?u tu?ng" },
  { rank: 26, korean: "??", pronunciation: "gwan-gye", partOfSpeech: "Danh t?", meaning: "M?i quan h?", example: "?? ??? ????.", exampleVi: "Duy trì m?i quan h? t?t.", topikLevel: "II", frequency: 36, category: "Xã h?i" },
  { rank: 27, korean: "??", pronunciation: "hyeon-jae", partOfSpeech: "Danh t?", meaning: "Hi?n t?i", example: "?? ??? ????", exampleVi: "Tình hình hi?n t?i th? nào?", topikLevel: "II", frequency: 35, category: "Th?i gian" },
  { rank: 28, korean: "??", pronunciation: "gyeol-gwa", partOfSpeech: "Danh t?", meaning: "K?t qu?", example: "?? ??? ????.", exampleVi: "K?t qu? t?t dã ra.", topikLevel: "II", frequency: 34, category: "Tr?u tu?ng" },
  { rank: 29, korean: "??", pronunciation: "bang-beop", partOfSpeech: "Danh t?", meaning: "Phuong pháp/Cách", example: "?? ??? ???.", exampleVi: "Có cách t?t.", topikLevel: "II", frequency: 33, category: "Tr?u tu?ng" },
  { rank: 30, korean: "????", pronunciation: "ga-neung-ha-da", partOfSpeech: "Tính t?", meaning: "Có th?/Kh? thi", example: "??? ?????", exampleVi: "Ði?u dó có th? không?", topikLevel: "II", frequency: 32, category: "Ðánh giá" },
];

const categories = ["T?t c?", ...new Set(freqWords.map(w => w.category))];

export default function TopikFrequencyVocabPage() {
  const [topikFilter, setTopikFilter] = useState<"all" | "I" | "II">("all");
  const [categoryFilter, setCategoryFilter] = useState("T?t c?");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<FreqWord | null>(null);
  const [learnedIds, setLearnedIds] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const filtered = useMemo(() => freqWords.filter(w => {
    const matchTopik = topikFilter === "all" || w.topikLevel === topikFilter;
    const matchCat = categoryFilter === "T?t c?" || w.category === categoryFilter;
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
          <h1 className="text-white font-bold text-2xl mb-1">T? v?ng theo t?n su?t TOPIK</h1>
          <p className="text-white/50 text-sm">30 t? xu?t hi?n nhi?u nh?t trong d? thi TOPIK — h?c dúng tr?ng tâm</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "T?ng t?", value: freqWords.length, color: "app-accent-primary" },
            { label: "TOPIK I", value: freqWords.filter(w => w.topikLevel === "I").length, color: "#34d399" },
            { label: "TOPIK II", value: freqWords.filter(w => w.topikLevel === "II").length, color: "#f87171" },
            { label: "Ðã h?c", value: learnedIds.size, color: "#a78bfa" },
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
            <span className="text-app-text-secondary text-xs">Ti?n d? h?c</span>
            <span className="text-white/60 text-xs font-bold">{learnedIds.size}/{freqWords.length} t?</span>
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
                {t === "all" ? "T?t c?" : `TOPIK ${t}`}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-48">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm t?..."
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
                  <p className="text-app-text-secondary text-xs mb-1">Ví d?</p>
                  <p className="text-white text-sm mb-1">{selectedWord.example}</p>
                  <p className="text-app-text-secondary text-xs italic">{selectedWord.exampleVi}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-app-card/50">
                    <p className="text-white/60 text-xs font-bold">H?ng</p>
                    <p className="text-app-accent-primary font-bold">#{selectedWord.rank}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-app-card/50">
                    <p className="text-white/60 text-xs font-bold">T?n su?t</p>
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
                  {learnedIds.has(selectedWord.rank) ? "B? dánh d?u dã h?c" : "Ðánh d?u dã h?c"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


