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
    description: "Các nguyên âm dễ nhầm lẫn",
    icon: "ri-sound-module-line",
    color: "#e8c84a",
    syllables: [
      { id: "eu", syllable: "으", romanization: "eu", tip: "Phát âm như 'ư' trong tiếng Việt, môi không tròn", similar: "ư (Việt)", words: [{ korean: "으로", meaning: "bằng/theo hướng" }, { korean: "크다", meaning: "to lớn" }], difficulty: "medium" },
      { id: "oe", syllable: "외", romanization: "oe", tip: "Phát âm như 'oe' — môi tròn, lưỡi ở vị trí 'e'", similar: "oe", words: [{ korean: "외국", meaning: "nước ngoài" }, { korean: "외롭다", meaning: "cô đơn" }], difficulty: "hard" },
      { id: "wi", syllable: "위", romanization: "wi", tip: "Phát âm nhanh 'u+i' thành một âm tiết", similar: "wi", words: [{ korean: "위", meaning: "trên/dạ dày" }, { korean: "위험", meaning: "nguy hiểm" }], difficulty: "medium" },
      { id: "ui", syllable: "의", romanization: "ui/i/e", tip: "Đọc '의' là 'ui' khi đứng đầu, 'i' khi là trợ từ sở hữu, 'e' trong các trường hợp khác", words: [{ korean: "의사", meaning: "bác sĩ" }, { korean: "나의", meaning: "của tôi" }], difficulty: "hard" },
    ],
  },
  {
    id: "consonants",
    title: "Phụ âm khó",
    description: "Phụ âm dễ phát âm sai",
    icon: "ri-mic-line",
    color: "#f87171",
    syllables: [
      { id: "r-l", syllable: "ㄹ", romanization: "r/l", tip: "Đầu từ: gần như 'r' nhẹ. Cuối từ: 'l'. Giữa nguyên âm: 'r' rung nhẹ", words: [{ korean: "라면", meaning: "mì ramen" }, { korean: "말", meaning: "ngựa/lời nói" }], difficulty: "hard" },
      { id: "ng", syllable: "ㅇ", romanization: "ng/silent", tip: "Đầu âm tiết: câm (không phát âm). Cuối âm tiết: 'ng' như trong 'không'", words: [{ korean: "아이", meaning: "đứa trẻ" }, { korean: "강", meaning: "sông" }], difficulty: "medium" },
      { id: "b-p", syllable: "ㅂ", romanization: "b/p", tip: "Đầu từ: 'b' nhẹ. Cuối từ: 'p' không bật hơi (âm tắc)", words: [{ korean: "바다", meaning: "biển" }, { korean: "밥", meaning: "cơm" }], difficulty: "medium" },
      { id: "d-t", syllable: "ㄷ", romanization: "d/t", tip: "Đầu từ: 'd' nhẹ. Cuối từ: 't' không bật hơi (âm tắc)", words: [{ korean: "다리", meaning: "cầu/chân" }, { korean: "맏", meaning: "cả/trưởng" }], difficulty: "medium" },
    ],
  },
  {
    id: "tense",
    title: "Phụ âm căng (Tense)",
    description: "Phụ âm đôi — phát âm mạnh hơn",
    icon: "ri-flashlight-line",
    color: "#a78bfa",
    syllables: [
      { id: "kk", syllable: "ㄲ", romanization: "kk", tip: "Căng cổ họng, phát âm 'k' mạnh hơn ㄱ, không bật hơi", similar: "ㄱ (nhẹ hơn)", words: [{ korean: "꽃", meaning: "hoa" }, { korean: "꿈", meaning: "giấc mơ" }], difficulty: "hard" },
      { id: "tt", syllable: "ㄸ", romanization: "tt", tip: "Căng cổ họng, phát âm 't' mạnh hơn ㄷ, không bật hơi", similar: "ㄷ (nhẹ hơn)", words: [{ korean: "딸", meaning: "con gái" }, { korean: "때", meaning: "lúc/khi" }], difficulty: "hard" },
      { id: "pp", syllable: "ㅃ", romanization: "pp", tip: "Căng cổ họng, phát âm 'p' mạnh hơn ㅂ, không bật hơi", similar: "ㅂ (nhẹ hơn)", words: [{ korean: "빨리", meaning: "nhanh" }, { korean: "뽀뽀", meaning: "hôn" }], difficulty: "hard" },
      { id: "ss", syllable: "ㅆ", romanization: "ss", tip: "Căng cổ họng, phát âm 's' mạnh hơn ㅅ, sắc hơn", similar: "ㅅ (nhẹ hơn)", words: [{ korean: "씨", meaning: "hạt/ông/bà" }, { korean: "쓰다", meaning: "viết/đắng" }], difficulty: "hard" },
    ],
  },
  {
    id: "aspirated",
    title: "Phụ âm bật hơi",
    description: "Phụ âm có luồng hơi mạnh",
    icon: "ri-lungs-line",
    color: "#34d399",
    syllables: [
      { id: "kh", syllable: "ㅋ", romanization: "kh", tip: "Phát âm 'k' với luồng hơi mạnh — thổi tay sẽ cảm nhận được", similar: "ㄱ (không bật hơi)", words: [{ korean: "커피", meaning: "cà phê" }, { korean: "크다", meaning: "to lớn" }], difficulty: "easy" },
      { id: "th", syllable: "ㅌ", romanization: "th", tip: "Phát âm 't' với luồng hơi mạnh", similar: "ㄷ (không bật hơi)", words: [{ korean: "타다", meaning: "cưỡi/đốt" }, { korean: "토마토", meaning: "cà chua" }], difficulty: "easy" },
      { id: "ph", syllable: "ㅍ", romanization: "ph", tip: "Phát âm 'p' với luồng hơi mạnh", similar: "ㅂ (không bật hơi)", words: [{ korean: "파다", meaning: "đào" }, { korean: "피자", meaning: "pizza" }], difficulty: "easy" },
      { id: "ch", syllable: "ㅊ", romanization: "ch", tip: "Phát âm 'ch' với luồng hơi mạnh", similar: "ㅈ (không bật hơi)", words: [{ korean: "차", meaning: "xe/trà" }, { korean: "친구", meaning: "bạn bè" }], difficulty: "easy" },
    ],
  },
  {
    id: "batchim",
    title: "Batchim (받침)",
    description: "Phụ âm cuối âm tiết",
    icon: "ri-corner-down-left-line",
    color: "#fbbf24",
    syllables: [
      { id: "k-final", syllable: "ㄱ받침", romanization: "k (tắc)", tip: "Cuối âm tiết: âm tắc 'k' — không bật hơi, chỉ đóng cổ họng", words: [{ korean: "학교", meaning: "trường học" }, { korean: "먹다", meaning: "ăn" }], difficulty: "medium" },
      { id: "n-final", syllable: "ㄴ받침", romanization: "n", tip: "Cuối âm tiết: âm 'n' — lưỡi chạm vòm miệng", words: [{ korean: "한국", meaning: "Hàn Quốc" }, { korean: "인사", meaning: "chào hỏi" }], difficulty: "easy" },
      { id: "m-final", syllable: "ㅁ받침", romanization: "m", tip: "Cuối âm tiết: âm 'm' — môi khép lại", words: [{ korean: "이름", meaning: "tên" }, { korean: "마음", meaning: "tâm hồn" }], difficulty: "easy" },
      { id: "ng-final", syllable: "ㅇ받침", romanization: "ng", tip: "Cuối âm tiết: âm 'ng' như trong 'không' — cổ họng rung", words: [{ korean: "강", meaning: "sông" }, { korean: "영어", meaning: "tiếng Anh" }], difficulty: "medium" },
    ],
  },
];

const difficultyConfig = {
  easy: { label: "Dễ", color: "#34d399" },
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
            <h1 className="text-white font-bold text-2xl mb-1">Luyện phát âm theo âm tiết</h1>
            <p className="text-white/50 text-sm">Tập từng âm tiết khó — nguyên âm, phụ âm, batchim</p>
          </div>
          <button onClick={() => { setPracticeMode(v => !v); setPracticeIdx(0); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-all ${practiceMode ? "bg-white/10 text-white/60" : "bg-[#e8c84a] text-[#141720]"}`}>
            {practiceMode ? "Thoát luyện tập" : "Chế độ luyện tập"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Tổng âm tiết", value: allSyllables.length, color: "#e8c84a" },
            { label: "Đã thành thạo", value: masteredIds.size, color: "#34d399" },
            { label: "Nhóm", value: syllableGroups.length, color: "#a78bfa" },
            { label: "Khó", value: allSyllables.filter(s => s.difficulty === "hard").length, color: "#f87171" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-3 text-center">
              <p className="font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {practiceMode ? (
          /* ── Practice Mode ── */
          <div className="rounded-2xl border border-white/8 bg-white/3 p-8 text-center">
            <p className="text-white/40 text-sm mb-2">{practiceIdx + 1} / {allSyllables.length}</p>
            <div className="flex gap-1 justify-center mb-8">
              {allSyllables.map((s, i) => (
                <div key={s.id} className={`h-1 rounded-full transition-all ${i === practiceIdx ? "w-6 bg-[#e8c84a]" : masteredIds.has(s.id) ? "w-2 bg-emerald-400" : "w-2 bg-white/15"}`} />
              ))}
            </div>

            <div className="mb-6">
              <p className="text-white/30 text-sm mb-3">Phát âm âm tiết này:</p>
              <p className="text-white font-bold text-8xl mb-2">{practiceSyllable.syllable}</p>
              <p className="text-white/40 text-lg">[{practiceSyllable.romanization}]</p>
            </div>

            <button onClick={() => handleTTS(practiceSyllable.syllable, practiceSyllable.id)}
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 cursor-pointer transition-all ${isPlaying === practiceSyllable.id ? "bg-[#e8c84a] scale-110" : "bg-white/10 hover:bg-white/15"}`}>
              <i className={`ri-volume-up-line text-3xl ${isPlaying === practiceSyllable.id ? "text-[#141720]" : "text-white"}`}></i>
            </button>

            <div className="p-4 rounded-xl bg-white/5 border border-white/8 mb-6 text-left">
              <p className="text-white/40 text-xs mb-1">Mẹo phát âm:</p>
              <p className="text-white/80 text-sm">{practiceSyllable.tip}</p>
              {practiceSyllable.similar && (
                <p className="text-[#e8c84a]/70 text-xs mt-2">Tương tự: {practiceSyllable.similar}</p>
              )}
            </div>

            <div className="flex gap-2 mb-6">
              {practiceSyllable.words.map(w => (
                <button key={w.korean} onClick={() => handleTTS(w.korean, `word-${w.korean}`)}
                  className="flex-1 p-3 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 cursor-pointer text-center">
                  <p className="text-white font-bold text-lg">{w.korean}</p>
                  <p className="text-white/40 text-xs">{w.meaning}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setPracticeIdx(i => Math.max(0, i - 1)); }}
                disabled={practiceIdx === 0}
                className="flex-1 py-3 rounded-xl bg-white/8 text-white/60 text-sm cursor-pointer disabled:opacity-30 whitespace-nowrap">
                Trước
              </button>
              <button onClick={() => toggleMastered(practiceSyllable.id)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-colors ${masteredIds.has(practiceSyllable.id) ? "bg-emerald-500/20 text-emerald-400" : "bg-white/8 text-white/60"}`}>
                {masteredIds.has(practiceSyllable.id) ? "Đã thành thạo" : "Đánh dấu thành thạo"}
              </button>
              <button onClick={() => { setPracticeIdx(i => Math.min(allSyllables.length - 1, i + 1)); }}
                disabled={practiceIdx >= allSyllables.length - 1}
                className="flex-1 py-3 rounded-xl bg-[#e8c84a] text-[#141720] font-bold text-sm cursor-pointer disabled:opacity-30 whitespace-nowrap">
                Tiếp
              </button>
            </div>
          </div>
        ) : (
          /* ── Browse Mode ── */
          <div className="flex gap-5">
            {/* Group sidebar */}
            <div className="w-48 flex-shrink-0 space-y-2">
              {syllableGroups.map(g => (
                <button key={g.id} onClick={() => { setActiveGroup(g.id); setActiveSyllable(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left cursor-pointer transition-all ${activeGroup === g.id ? "border-white/15 bg-white/8" : "border-white/5 bg-white/3 hover:bg-white/5"}`}>
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${g.color}20` }}>
                    <i className={`${g.icon} text-sm`} style={{ color: g.color }}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{g.title}</p>
                    <p className="text-white/30 text-[10px]">{g.syllables.length} âm tiết</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Syllable grid */}
            <div className="flex-1 min-w-0">
              <div className="mb-4">
                <h2 className="text-white font-bold text-lg">{currentGroup.title}</h2>
                <p className="text-white/40 text-sm">{currentGroup.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {currentGroup.syllables.map(s => (
                  <button key={s.id} onClick={() => setActiveSyllable(activeSyllable?.id === s.id ? null : s)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${activeSyllable?.id === s.id ? "border-white/20 bg-white/8" : masteredIds.has(s.id) ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/8 bg-white/3 hover:bg-white/5"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-white font-bold text-4xl">{s.syllable}</span>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${difficultyConfig[s.difficulty].color}20`, color: difficultyConfig[s.difficulty].color }}>
                          {difficultyConfig[s.difficulty].label}
                        </span>
                        {masteredIds.has(s.id) && <i className="ri-checkbox-circle-fill text-emerald-400 text-sm"></i>}
                      </div>
                    </div>
                    <p className="text-white/40 text-xs">[{s.romanization}]</p>
                  </button>
                ))}
              </div>

              {/* Detail panel */}
              {activeSyllable && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
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
                      className={`w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer transition-all ${isPlaying === activeSyllable.id ? "bg-[#e8c84a] scale-105" : "bg-white/10 hover:bg-white/15"}`}>
                      <i className={`ri-volume-up-line text-xl ${isPlaying === activeSyllable.id ? "text-[#141720]" : "text-white"}`}></i>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/8 mb-4">
                    <p className="text-white/40 text-xs mb-1">Mẹo phát âm:</p>
                    <p className="text-white/80 text-sm leading-relaxed">{activeSyllable.tip}</p>
                    {activeSyllable.similar && (
                      <p className="text-[#e8c84a]/70 text-xs mt-2">So sánh với: {activeSyllable.similar}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-white/40 text-xs mb-2">Từ ví dụ:</p>
                    <div className="flex gap-2">
                      {activeSyllable.words.map(w => (
                        <button key={w.korean} onClick={() => handleTTS(w.korean, `word-${w.korean}`)}
                          className="flex-1 p-3 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 cursor-pointer text-center">
                          <p className="text-white font-bold text-lg">{w.korean}</p>
                          <p className="text-white/40 text-xs">{w.meaning}</p>
                          <i className="ri-volume-up-line text-white/20 text-xs mt-1"></i>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => toggleMastered(activeSyllable.id)}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-colors ${masteredIds.has(activeSyllable.id) ? "bg-emerald-500/20 text-emerald-400" : "bg-[#e8c84a] text-[#141720]"}`}>
                    {masteredIds.has(activeSyllable.id) ? "Đã thành thạo — Bỏ đánh dấu" : "Đánh dấu thành thạo"}
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
