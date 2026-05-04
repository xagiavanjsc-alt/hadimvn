import { useState, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface SyllableGroup {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  syllables: SyllableItem[];
}

interface SyllableItem {
  id: string;
  syllable: string;
  romanization: string;
  tip: string;
  similar?: string;
  words: { korean: string; meaning: string }[];
  difficulty: "easy" | "medium" | "hard";
}

const syllableGroups: SyllableGroup[] = [
  {
    id: "vowels",
    title: "Nguyên âm khó",
    description: "Các nguyên âm d? nh?m l?n",
    icon: "ri-sound-module-line",
    color: "app-accent-primary",
    syllables: [
      { id: "eu", syllable: "?", romanization: "eu", tip: "Phát âm nhu 'u' trong ti?ng Vi?t, môi không tròn", similar: "u (Vi?t)", words: [{ korean: "??", meaning: "b?ng/theo hu?ng" }, { korean: "??", meaning: "to l?n" }], difficulty: "medium" },
      { id: "oe", syllable: "?", romanization: "oe", tip: "Phát âm nhu 'oe' — môi tròn, lu?i ? v? trí 'e'", similar: "oe", words: [{ korean: "??", meaning: "nu?c ngoài" }, { korean: "???", meaning: "cô don" }], difficulty: "hard" },
      { id: "wi", syllable: "?", romanization: "wi", tip: "Phát âm nhanh 'u+i' thành m?t âm ti?t", similar: "wi", words: [{ korean: "?", meaning: "trên/d? dày" }, { korean: "??", meaning: "nguy hi?m" }], difficulty: "medium" },
      { id: "ui", syllable: "?", romanization: "ui/i/e", tip: "Ð?c '?' là 'ui' khi d?ng d?u, 'i' khi là tr? t? s? h?u, 'e' trong các tru?ng h?p khác", words: [{ korean: "??", meaning: "bác si" }, { korean: "??", meaning: "c?a tôi" }], difficulty: "hard" },
    ],
  },
  {
    id: "consonants",
    title: "Ph? âm khó",
    description: "Ph? âm d? phát âm sai",
    icon: "ri-mic-line",
    color: "#f87171",
    syllables: [
      { id: "r-l", syllable: "?", romanization: "r/l", tip: "Ð?u t?: g?n nhu 'r' nh?. Cu?i t?: 'l'. Gi?a nguyên âm: 'r' rung nh?", words: [{ korean: "??", meaning: "mì ramen" }, { korean: "?", meaning: "ng?a/l?i nói" }], difficulty: "hard" },
      { id: "ng", syllable: "?", romanization: "ng/silent", tip: "Ð?u âm ti?t: câm (không phát âm). Cu?i âm ti?t: 'ng' nhu trong 'không'", words: [{ korean: "??", meaning: "d?a tr?" }, { korean: "?", meaning: "sông" }], difficulty: "medium" },
      { id: "b-p", syllable: "?", romanization: "b/p", tip: "Ð?u t?: 'b' nh?. Cu?i t?: 'p' không b?t hoi (âm t?c)", words: [{ korean: "??", meaning: "bi?n" }, { korean: "?", meaning: "com" }], difficulty: "medium" },
      { id: "d-t", syllable: "?", romanization: "d/t", tip: "Ð?u t?: 'd' nh?. Cu?i t?: 't' không b?t hoi (âm t?c)", words: [{ korean: "??", meaning: "c?u/chân" }, { korean: "?", meaning: "c?/tru?ng" }], difficulty: "medium" },
    ],
  },
  {
    id: "tense",
    title: "Ph? âm cang (Tense)",
    description: "Ph? âm dôi — phát âm m?nh hon",
    icon: "ri-flashlight-line",
    color: "#a78bfa",
    syllables: [
      { id: "kk", syllable: "?", romanization: "kk", tip: "Cang c? h?ng, phát âm 'k' m?nh hon ?, không b?t hoi", similar: "? (nh? hon)", words: [{ korean: "?", meaning: "hoa" }, { korean: "?", meaning: "gi?c mo" }], difficulty: "hard" },
      { id: "tt", syllable: "?", romanization: "tt", tip: "Cang c? h?ng, phát âm 't' m?nh hon ?, không b?t hoi", similar: "? (nh? hon)", words: [{ korean: "?", meaning: "con gái" }, { korean: "?", meaning: "lúc/khi" }], difficulty: "hard" },
      { id: "pp", syllable: "?", romanization: "pp", tip: "Cang c? h?ng, phát âm 'p' m?nh hon ?, không b?t hoi", similar: "? (nh? hon)", words: [{ korean: "??", meaning: "nhanh" }, { korean: "??", meaning: "hôn" }], difficulty: "hard" },
      { id: "ss", syllable: "?", romanization: "ss", tip: "Cang c? h?ng, phát âm 's' m?nh hon ?, s?c hon", similar: "? (nh? hon)", words: [{ korean: "?", meaning: "h?t/ông/bà" }, { korean: "??", meaning: "vi?t/d?ng" }], difficulty: "hard" },
    ],
  },
  {
    id: "aspirated",
    title: "Ph? âm b?t hoi",
    description: "Ph? âm có lu?ng hoi m?nh",
    icon: "ri-lungs-line",
    color: "#34d399",
    syllables: [
      { id: "kh", syllable: "?", romanization: "kh", tip: "Phát âm 'k' v?i lu?ng hoi m?nh — th?i tay s? c?m nh?n du?c", similar: "? (không b?t hoi)", words: [{ korean: "??", meaning: "cà phê" }, { korean: "??", meaning: "to l?n" }], difficulty: "easy" },
      { id: "th", syllable: "?", romanization: "th", tip: "Phát âm 't' v?i lu?ng hoi m?nh", similar: "? (không b?t hoi)", words: [{ korean: "??", meaning: "cu?i/d?t" }, { korean: "???", meaning: "cà chua" }], difficulty: "easy" },
      { id: "ph", syllable: "?", romanization: "ph", tip: "Phát âm 'p' v?i lu?ng hoi m?nh", similar: "? (không b?t hoi)", words: [{ korean: "??", meaning: "dào" }, { korean: "??", meaning: "pizza" }], difficulty: "easy" },
      { id: "ch", syllable: "?", romanization: "ch", tip: "Phát âm 'ch' v?i lu?ng hoi m?nh", similar: "? (không b?t hoi)", words: [{ korean: "?", meaning: "xe/trà" }, { korean: "??", meaning: "b?n bè" }], difficulty: "easy" },
    ],
  },
  {
    id: "batchim",
    title: "Batchim (??)",
    description: "Ph? âm cu?i âm ti?t",
    icon: "ri-corner-down-left-line",
    color: "#fbbf24",
    syllables: [
      { id: "k-final", syllable: "???", romanization: "k (t?c)", tip: "Cu?i âm ti?t: âm t?c 'k' — không b?t hoi, ch? dóng c? h?ng", words: [{ korean: "??", meaning: "tru?ng h?c" }, { korean: "??", meaning: "an" }], difficulty: "medium" },
      { id: "n-final", syllable: "???", romanization: "n", tip: "Cu?i âm ti?t: âm 'n' — lu?i ch?m vòm mi?ng", words: [{ korean: "??", meaning: "Hàn Qu?c" }, { korean: "??", meaning: "chào h?i" }], difficulty: "easy" },
      { id: "m-final", syllable: "???", romanization: "m", tip: "Cu?i âm ti?t: âm 'm' — môi khép l?i", words: [{ korean: "??", meaning: "tên" }, { korean: "??", meaning: "tâm h?n" }], difficulty: "easy" },
      { id: "ng-final", syllable: "???", romanization: "ng", tip: "Cu?i âm ti?t: âm 'ng' nhu trong 'không' — c? h?ng rung", words: [{ korean: "?", meaning: "sông" }, { korean: "??", meaning: "ti?ng Anh" }], difficulty: "medium" },
    ],
  },
];

const difficultyConfig = {
  easy: { label: "D?", color: "#34d399" },
  medium: { label: "Trung bình", color: "#fbbf24" },
  hard: { label: "Khó", color: "#f87171" },
};

export default function SyllablePronunciationPage() {
  const [activeGroup, setActiveGroup] = useState(syllableGroups[0].id);
  const [activeSyllable, setActiveSyllable] = useState<SyllableItem | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const currentGroup = syllableGroups.find(g => g.id === activeGroup)!;
  const allSyllables = syllableGroups.flatMap(g => g.syllables);
  const practiceSyllable = allSyllables[practiceIdx];

  const handleTTS = useCallback((text: string, id: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(id);
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "ko-KR";
      utt.rate = 0.7;
      utt.onend = () => setIsPlaying(null);
      window.speechSynthesis.speak(utt);
    }
  }, []);

  const toggleMastered = (id: string) => {
    setMasteredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-white font-bold text-2xl mb-1">Luy?n phát âm theo âm ti?t</h1>
            <p className="text-white/50 text-sm">T?p t?ng âm ti?t khó — nguyên âm, ph? âm, batchim</p>
          </div>
          <button onClick={() => { setPracticeMode(v => !v); setPracticeIdx(0); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-all ${practiceMode ? "bg-app-card/70 text-white/60" : "bg-app-accent-primary text-[#141720]"}`}>
            {practiceMode ? "Thoát luy?n t?p" : "Ch? d? luy?n t?p"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "T?ng âm ti?t", value: allSyllables.length, color: "app-accent-primary" },
            { label: "Ðã thành th?o", value: masteredIds.size, color: "#34d399" },
            { label: "Nhóm", value: syllableGroups.length, color: "#a78bfa" },
            { label: "Khó", value: allSyllables.filter(s => s.difficulty === "hard").length, color: "#f87171" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-app-border bg-app-surface/50 p-3 text-center">
              <p className="font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {practiceMode ? (
          /* -- Practice Mode -- */
          <div className="rounded-2xl border border-app-border bg-app-surface/50 p-8 text-center">
            <p className="text-app-text-secondary text-sm mb-2">{practiceIdx + 1} / {allSyllables.length}</p>
            <div className="flex gap-1 justify-center mb-8">
              {allSyllables.map((s, i) => (
                <div key={s.id} className={`h-1 rounded-full transition-all ${i === practiceIdx ? "w-6 bg-app-accent-primary" : masteredIds.has(s.id) ? "w-2 bg-emerald-400" : "w-2 bg-white/15"}`} />
              ))}
            </div>

            <div className="mb-6">
              <p className="text-app-text-muted text-sm mb-3">Phát âm âm ti?t này:</p>
              <p className="text-white font-bold text-8xl mb-2">{practiceSyllable.syllable}</p>
              <p className="text-app-text-secondary text-lg">[{practiceSyllable.romanization}]</p>
            </div>

            <button onClick={() => handleTTS(practiceSyllable.syllable, practiceSyllable.id)}
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 cursor-pointer transition-all ${isPlaying === practiceSyllable.id ? "bg-app-accent-primary scale-110" : "bg-app-card/70 hover:bg-white/15"}`}>
              <i className={`ri-volume-up-line text-3xl ${isPlaying === practiceSyllable.id ? "text-[#141720]" : "text-white"}`}></i>
            </button>

            <div className="p-4 rounded-xl bg-app-card/50 border border-app-border mb-6 text-left">
              <p className="text-app-text-secondary text-xs mb-1">M?o phát âm:</p>
              <p className="text-white/80 text-sm">{practiceSyllable.tip}</p>
              {practiceSyllable.similar && (
                <p className="text-app-accent-primary/70 text-xs mt-2">Tuong t?: {practiceSyllable.similar}</p>
              )}
            </div>

            <div className="flex gap-2 mb-6">
              {practiceSyllable.words.map(w => (
                <button key={w.korean} onClick={() => handleTTS(w.korean, `word-${w.korean}`)}
                  className="flex-1 p-3 rounded-xl bg-app-card/50 border border-app-border hover:bg-white/8 cursor-pointer text-center">
                  <p className="text-white font-bold text-lg">{w.korean}</p>
                  <p className="text-app-text-secondary text-xs">{w.meaning}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setPracticeIdx(i => Math.max(0, i - 1)); }}
                disabled={practiceIdx === 0}
                className="flex-1 py-3 rounded-xl bg-white/8 text-white/60 text-sm cursor-pointer disabled:opacity-30 whitespace-nowrap">
                Tru?c
              </button>
              <button onClick={() => toggleMastered(practiceSyllable.id)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-colors ${masteredIds.has(practiceSyllable.id) ? "bg-emerald-500/20 text-app-accent-success" : "bg-white/8 text-white/60"}`}>
                {masteredIds.has(practiceSyllable.id) ? "Ðã thành th?o" : "Ðánh d?u thành th?o"}
              </button>
              <button onClick={() => { setPracticeIdx(i => Math.min(allSyllables.length - 1, i + 1)); }}
                disabled={practiceIdx >= allSyllables.length - 1}
                className="flex-1 py-3 rounded-xl bg-app-accent-primary text-[#141720] font-bold text-sm cursor-pointer disabled:opacity-30 whitespace-nowrap">
                Ti?p
              </button>
            </div>
          </div>
        ) : (
          /* -- Browse Mode -- */
          <div className="flex gap-5">
            {/* Group sidebar */}
            <div className="w-48 flex-shrink-0 space-y-2">
              {syllableGroups.map(g => (
                <button key={g.id} onClick={() => { setActiveGroup(g.id); setActiveSyllable(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left cursor-pointer transition-all ${activeGroup === g.id ? "border-white/15 bg-white/8" : "border-app-border bg-app-surface/50 hover:bg-app-card/50"}`}>
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${g.color}20` }}>
                    <i className={`${g.icon} text-sm`} style={{ color: g.color }}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{g.title}</p>
                    <p className="text-app-text-muted text-[10px]">{g.syllables.length} âm ti?t</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Syllable grid */}
            <div className="flex-1 min-w-0">
              <div className="mb-4">
                <h2 className="text-white font-bold text-lg">{currentGroup.title}</h2>
                <p className="text-app-text-secondary text-sm">{currentGroup.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {currentGroup.syllables.map(s => (
                  <button key={s.id} onClick={() => setActiveSyllable(activeSyllable?.id === s.id ? null : s)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${activeSyllable?.id === s.id ? "border-white/20 bg-white/8" : masteredIds.has(s.id) ? "border-emerald-500/20 bg-emerald-500/5" : "border-app-border bg-app-surface/50 hover:bg-app-card/50"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-white font-bold text-4xl">{s.syllable}</span>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${difficultyConfig[s.difficulty].color}20`, color: difficultyConfig[s.difficulty].color }}>
                          {difficultyConfig[s.difficulty].label}
                        </span>
                        {masteredIds.has(s.id) && <i className="ri-checkbox-circle-fill text-app-accent-success text-sm"></i>}
                      </div>
                    </div>
                    <p className="text-app-text-secondary text-xs">[{s.romanization}]</p>
                  </button>
                ))}
              </div>

              {/* Detail panel */}
              {activeSyllable && (
                <div className="rounded-2xl border border-app-border bg-app-card/50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-5xl">{activeSyllable.syllable}</span>
                      <div>
                        <p className="text-white/60 text-sm">[{activeSyllable.romanization}]</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${difficultyConfig[activeSyllable.difficulty].color}20`, color: difficultyConfig[activeSyllable.difficulty].color }}>
                          {difficultyConfig[activeSyllable.difficulty].label}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleTTS(activeSyllable.syllable, activeSyllable.id)}
                      className={`w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer transition-all ${isPlaying === activeSyllable.id ? "bg-app-accent-primary scale-105" : "bg-app-card/70 hover:bg-white/15"}`}>
                      <i className={`ri-volume-up-line text-xl ${isPlaying === activeSyllable.id ? "text-[#141720]" : "text-white"}`}></i>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-app-card/50 border border-app-border mb-4">
                    <p className="text-app-text-secondary text-xs mb-1">M?o phát âm:</p>
                    <p className="text-white/80 text-sm leading-relaxed">{activeSyllable.tip}</p>
                    {activeSyllable.similar && (
                      <p className="text-app-accent-primary/70 text-xs mt-2">So sánh v?i: {activeSyllable.similar}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-app-text-secondary text-xs mb-2">T? ví d?:</p>
                    <div className="flex gap-2">
                      {activeSyllable.words.map(w => (
                        <button key={w.korean} onClick={() => handleTTS(w.korean, `word-${w.korean}`)}
                          className="flex-1 p-3 rounded-xl bg-app-card/50 border border-app-border hover:bg-white/8 cursor-pointer text-center">
                          <p className="text-white font-bold text-lg">{w.korean}</p>
                          <p className="text-app-text-secondary text-xs">{w.meaning}</p>
                          <i className="ri-volume-up-line text-app-text-muted text-xs mt-1"></i>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => toggleMastered(activeSyllable.id)}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-colors ${masteredIds.has(activeSyllable.id) ? "bg-emerald-500/20 text-app-accent-success" : "bg-app-accent-primary text-[#141720]"}`}>
                    {masteredIds.has(activeSyllable.id) ? "Ðã thành th?o — B? dánh d?u" : "Ðánh d?u thành th?o"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

