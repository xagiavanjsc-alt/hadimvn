import { useState, useEffect, useCallback } from "react";
import { MelonSong } from "@/mocks/melonSongs";

interface VocabItem {
  word: string;
  meaning: string;
  example: string;
}

interface DraftData {
  rank: number;
  story: string;
  vocabulary: VocabItem[];
  explanation: string;
  savedAt: string;
}

interface AIEditorProps {
  song: MelonSong | null;
  story: string;
  vocabulary: VocabItem[];
  explanation: string;
  onStoryChange: (v: string) => void;
  onVocabChange: (v: VocabItem[]) => void;
  onExplanationChange: (v: string) => void;
  onApprove: () => void;
}

export default function AIEditor({
  song,
  story,
  vocabulary,
  explanation,
  onStoryChange,
  onVocabChange,
  onExplanationChange,
  onApprove,
}: AIEditorProps) {
  const [activeTab, setActiveTab] = useState<"story" | "vocab" | "explain">("story");
  const [draftSaved, setDraftSaved] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    setActiveTab("story");
    setDraftSaved(false);
    if (song) {
      const raw = localStorage.getItem(`kts_draft_${song.rank}`);
      setHasDraft(!!raw);
    }
  }, [song?.rank]);

  const saveDraft = useCallback(() => {
    if (!song) return;
    const draft: DraftData = {
      rank: song.rank,
      story,
      vocabulary,
      explanation,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`kts_draft_${song.rank}`, JSON.stringify(draft));
    setDraftSaved(true);
    setHasDraft(true);
    setTimeout(() => setDraftSaved(false), 2000);
  }, [song, story, vocabulary, explanation]);

  const loadDraft = useCallback(() => {
    if (!song) return;
    const raw = localStorage.getItem(`kts_draft_${song.rank}`);
    if (!raw) return;
    try {
      const draft: DraftData = JSON.parse(raw);
      onStoryChange(draft.story);
      onVocabChange(draft.vocabulary);
      onExplanationChange(draft.explanation);
    } catch { /* ignore */ }
  }, [song, onStoryChange, onVocabChange, onExplanationChange]);

  const deleteDraft = useCallback(() => {
    if (!song) return;
    localStorage.removeItem(`kts_draft_${song.rank}`);
    setHasDraft(false);
  }, [song]);

  if (!song) {
    return (
      <section className="bg-app-bg border border-app-border rounded-xl p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-14 h-14 flex items-center justify-center bg-app-card/50 rounded-2xl mb-4">
          <i className="ri-edit-box-line text-app-text-muted text-2xl"></i>
        </div>
        <p className="text-app-text-muted text-sm">Chọn một bài hát từ bảng trên</p>
        <p className="text-app-text-muted text-xs mt-1">hoặc nhấn "Xử lý AI" để bắt đầu biên tập</p>
      </section>
    );
  }

  const updateVocab = (index: number, field: keyof VocabItem, value: string) => {
    const updated = vocabulary.map((v, i) => (i === index ? { ...v, [field]: value } : v));
    onVocabChange(updated);
  };

  const addVocab = () => {
    onVocabChange([...vocabulary, { word: "", meaning: "", example: "" }]);
  };

  const removeVocab = (index: number) => {
    onVocabChange(vocabulary.filter((_, i) => i !== index));
  };

  return (
    <section className="bg-app-bg border border-app-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-app-accent-primary/10 rounded-lg">
            <i className="ri-sparkling-2-line text-app-accent-primary text-base"></i>
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">AI Editor</h2>
            <p className="text-app-text-secondary text-xs">
              #{song.rank} · {song.title} — {song.artist}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Draft controls */}
          {hasDraft && (
            <button
              onClick={loadDraft}
              className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <i className="ri-draft-line"></i>
              Tải nháp
            </button>
          )}
          <button
            onClick={saveDraft}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              draftSaved
                ? "bg-emerald-500/20 text-app-accent-success"
                : "bg-app-card/50 hover:bg-app-card/70 text-white/50 hover:text-white/80"
            }`}
          >
            <i className={draftSaved ? "ri-checkbox-circle-line" : "ri-save-3-line"}></i>
            {draftSaved ? "Đã lưu nháp!" : "Lưu nháp"}
          </button>
          {hasDraft && (
            <button
              onClick={deleteDraft}
              className="w-7 h-7 flex items-center justify-center text-app-text-muted hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-red-400/10"
              title="Xóa nháp"
            >
              <i className="ri-delete-bin-line text-xs"></i>
            </button>
          )}
          <button
            onClick={onApprove}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-check-double-line"></i>
            Duyệt bài học
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 divide-x divide-white/5 min-h-[500px]">
        {/* Left: Lyrics */}
        <div className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-music-line text-app-text-secondary text-sm"></i>
            </div>
            <span className="text-white/50 text-xs font-medium tracking-normal">Lời gốc (Tiếng Hàn)</span>
          </div>
          <div className="flex-1 bg-app-surface/50 rounded-xl p-5 overflow-auto">
            <pre className="text-white/70 text-sm leading-8 font-sans whitespace-pre-wrap">{song.lyrics}</pre>
          </div>
        </div>

        {/* Right: AI Output */}
        <div className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-sparkling-line text-app-accent-primary text-sm"></i>
            </div>
            <span className="text-white/50 text-xs font-medium tracking-normal">Nội dung chế biến</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-app-card/50 p-1 rounded-lg mb-4">
            {(["story", "vocab", "explain"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 text-xs py-1.5 px-2 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-app-accent-primary text-app-bg font-semibold"
                    : "text-app-text-secondary hover:text-white/60"
                }`}
              >
                {tab === "story" ? "Truyện Chêm" : tab === "vocab" ? "Từ vựng" : "Giải thích"}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1">
            {activeTab === "story" && (
              <textarea
                value={story}
                onChange={(e) => onStoryChange(e.target.value)}
                placeholder="AI sẽ tự động tạo đoạn Truyện Chêm tiếng Việt tại đây..."
                className="w-full h-full min-h-[340px] bg-app-surface/50 border border-app-border rounded-xl p-4 text-white/80 text-sm leading-7 placeholder-white/20 focus:outline-none focus:border-app-accent-primary/30 resize-none transition-colors"
              />
            )}

            {activeTab === "vocab" && (
              <div className="space-y-3 overflow-auto max-h-[360px] pr-1">
                {vocabulary.map((v, i) => (
                  <div key={i} className="bg-app-surface/50 rounded-xl p-4 space-y-2 relative group">
                    <button
                      onClick={() => removeVocab(i)}
                      className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center text-app-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <i className="ri-close-line text-sm"></i>
                    </button>
                    <input
                      value={v.word}
                      onChange={(e) => updateVocab(i, "word", e.target.value)}
                      placeholder="Từ (ví dụ: 우주 (ujju))"
                      className="w-full bg-transparent border-b border-app-border pb-1 text-app-accent-primary text-sm font-medium focus:outline-none focus:border-app-accent-primary/40 placeholder-white/20"
                    />
                    <input
                      value={v.meaning}
                      onChange={(e) => updateVocab(i, "meaning", e.target.value)}
                      placeholder="Nghĩa tiếng Việt"
                      className="w-full bg-transparent text-white/70 text-xs focus:outline-none placeholder-white/20"
                    />
                    <input
                      value={v.example}
                      onChange={(e) => updateVocab(i, "example", e.target.value)}
                      placeholder="Ví dụ câu"
                      className="w-full bg-transparent text-app-text-secondary text-xs italic focus:outline-none placeholder-white/20"
                    />
                  </div>
                ))}
                <button
                  onClick={addVocab}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-app-border hover:border-app-accent-primary/30 text-app-text-muted hover:text-app-accent-primary/60 text-xs py-3 rounded-xl transition-colors cursor-pointer"
                >
                  <i className="ri-add-line"></i>
                  Thêm từ vựng
                </button>
              </div>
            )}

            {activeTab === "explain" && (
              <textarea
                value={explanation}
                onChange={(e) => onExplanationChange(e.target.value)}
                placeholder="AI sẽ giải thích cách dùng từ và ngữ pháp tại đây..."
                className="w-full h-full min-h-[340px] bg-app-surface/50 border border-app-border rounded-xl p-4 text-white/80 text-sm leading-7 placeholder-white/20 focus:outline-none focus:border-app-accent-primary/30 resize-none transition-colors"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
