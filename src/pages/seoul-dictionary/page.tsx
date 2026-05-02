import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { seoulBooks } from "@/mocks/seoulTextbook";

const bookColors: Record<string, string> = {
  "1A": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "1B": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "2A": "text-app-accent-success bg-emerald-500/10 border-emerald-500/20",
  "2B": "text-teal-400 bg-teal-500/10 border-teal-500/20",
  "3A": "text-violet-400 bg-violet-500/10 border-violet-500/20",
  "3B": "text-pink-400 bg-pink-500/10 border-pink-500/20",
  "4A": "text-lime-400 bg-lime-500/10 border-lime-500/20",
  "4B": "text-red-400 bg-red-500/10 border-red-500/20",
};

interface VocabEntry {
  korean: string;
  pronunciation: string;
  vietnamese: string;
  partOfSpeech: string;
  example: string;
  exampleVi: string;
  bookId: string;
  bookName: string;
  lessonNumber: number;
  lessonTitle: string;
}

interface VocabNote {
  note: string;
  isHard: boolean;
  updatedAt: string;
}

type VocabNotes = Record<string, VocabNote>;

function buildDictionary(): VocabEntry[] {
  const entries: VocabEntry[] = [];
  seoulBooks.forEach(book => {
    book.lessons.forEach(lesson => {
      lesson.vocabulary.forEach(vocab => {
        entries.push({
          ...vocab,
          bookId: book.id,
          bookName: book.name,
          lessonNumber: lesson.lessonNumber,
          lessonTitle: lesson.titleVi,
        });
      });
    });
  });
  return entries;
}

const ALL_VOCAB = buildDictionary();

const POS_COLORS: Record<string, string> = {
  "Danh từ": "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "Động từ": "bg-emerald-500/10 text-app-accent-success border-emerald-500/20",
  "Tính từ": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Phó từ": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Cụm từ": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Định từ": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Đại từ": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Liên từ": "bg-lime-500/10 text-lime-400 border-lime-500/20",
  "Trợ từ": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Danh từ đơn vị": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Cụm động từ": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

function getEntryId(vocab: VocabEntry): string {
  return `${vocab.bookId}-${vocab.lessonNumber}-${vocab.korean}`;
}

interface NoteModalProps {
  vocab: VocabEntry;
  note: VocabNote;
  onSave: (note: string, isHard: boolean) => void;
  onClose: () => void;
}

function NoteModal({ vocab, note, onSave, onClose }: NoteModalProps) {
  const [text, setText] = useState(note.note);
  const [isHard, setIsHard] = useState(note.isHard);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#1a1d27] border border-app-border rounded-2xl p-6 w-full max-w-md mx-4 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
              {vocab.korean}
            </h3>
            <p className="text-app-text-secondary text-sm">{vocab.vietnamese}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-app-text-muted hover:text-white/60 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Hard word toggle */}
        <button
          onClick={() => setIsHard(!isHard)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            isHard
              ? "bg-red-500/15 border-red-500/30 text-red-400"
              : "bg-app-card/50 border-app-border text-app-text-secondary hover:text-white/60"
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className={`${isHard ? "ri-flag-fill" : "ri-flag-line"} text-sm`}></i>
          </div>
          {isHard ? "Đã đánh dấu từ khó" : "Đánh dấu từ khó"}
        </button>

        {/* Note textarea */}
        <div>
          <label className="text-app-text-secondary text-xs mb-2 block">Ghi chú cá nhân</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Viết ghi chú của bạn... (ví dụ: cách nhớ từ, ngữ cảnh sử dụng, mẹo phát âm...)"
            maxLength={500}
            rows={4}
            className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/25 resize-none"
          />
          <p className="text-app-text-muted text-xs text-right mt-1">{text.length}/500</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-app-border text-app-text-secondary text-sm hover:text-white/60 transition-all cursor-pointer whitespace-nowrap"
          >
            Hủy
          </button>
          <button
            onClick={() => { onSave(text, isHard); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-app-accent-primary/15 border border-app-accent-primary/30 text-app-accent-primary text-sm font-medium hover:bg-app-accent-primary/25 transition-all cursor-pointer whitespace-nowrap"
          >
            Lưu ghi chú
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SeoulDictionaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState("all");
  const [selectedPos, setSelectedPos] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"korean" | "book">("book");
  const [filterMode, setFilterMode] = useState<"all" | "hard" | "noted">("all");
  const [notes, setNotes] = useState<VocabNotes>({});
  const [noteModal, setNoteModal] = useState<VocabEntry | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("seoul_dict_notes");
      if (saved) setNotes(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const saveNote = (vocab: VocabEntry, noteText: string, isHard: boolean) => {
    const id = getEntryId(vocab);
    const updated: VocabNotes = {
      ...notes,
      [id]: { note: noteText, isHard, updatedAt: new Date().toISOString() },
    };
    // Remove if both empty
    if (!noteText.trim() && !isHard) {
      delete updated[id];
    }
    setNotes(updated);
    localStorage.setItem("seoul_dict_notes", JSON.stringify(updated));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const allPos = useMemo(() => {
    const set = new Set(ALL_VOCAB.map(v => v.partOfSpeech));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    let result = ALL_VOCAB;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(v =>
        v.korean.toLowerCase().includes(q) ||
        v.vietnamese.toLowerCase().includes(q) ||
        v.pronunciation.toLowerCase().includes(q)
      );
    }

    if (selectedBook !== "all") {
      result = result.filter(v => v.bookId === selectedBook);
    }

    if (selectedPos !== "all") {
      result = result.filter(v => v.partOfSpeech === selectedPos);
    }

    if (filterMode === "hard") {
      result = result.filter(v => notes[getEntryId(v)]?.isHard);
    } else if (filterMode === "noted") {
      result = result.filter(v => notes[getEntryId(v)]?.note?.trim());
    }

    if (sortBy === "korean") {
      result = [...result].sort((a, b) => a.korean.localeCompare(b.korean, "ko"));
    }

    return result;
  }, [searchQuery, selectedBook, selectedPos, sortBy, filterMode, notes]);

  const speakKorean = (text: string) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ko-KR";
    utt.rate = 0.85;
    synth.speak(utt);
  };

  const totalByBook = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_VOCAB.forEach(v => {
      counts[v.bookId] = (counts[v.bookId] || 0) + 1;
    });
    return counts;
  }, []);

  const hardCount = useMemo(() => Object.values(notes).filter(n => n.isHard).length, [notes]);
  const notedCount = useMemo(() => Object.values(notes).filter(n => n.note?.trim()).length, [notes]);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Từ điển Seoul
            </h1>
            <p className="text-app-text-secondary text-sm mt-0.5">Tra cứu từ vựng theo từng cuốn 1A–4B với ghi chú cá nhân và đánh dấu từ khó</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-app-card/50 border border-app-border rounded-xl px-4 py-2 text-center">
              <p className="text-white font-bold text-xl">{ALL_VOCAB.length}</p>
              <p className="text-app-text-secondary text-xs">Tổng từ vựng</p>
            </div>
            {hardCount > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-center">
                <p className="text-red-400 font-bold text-xl">{hardCount}</p>
                <p className="text-app-accent-error/60 text-xs">Từ khó</p>
              </div>
            )}
          </div>
        </div>

        {/* Filter mode tabs */}
        <div className="flex gap-2">
          {[
            { id: "all", label: "Tất cả", icon: "ri-list-check" },
            { id: "hard", label: `Từ khó (${hardCount})`, icon: "ri-flag-line" },
            { id: "noted", label: `Có ghi chú (${notedCount})`, icon: "ri-sticky-note-line" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id as "all" | "hard" | "noted")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                filterMode === tab.id
                  ? "bg-app-accent-primary/15 border-app-accent-primary/30 text-app-accent-primary"
                  : "bg-app-card/50 border-app-border text-app-text-secondary hover:text-white/60"
              }`}
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <i className={`${tab.icon} text-xs`}></i>
              </div>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Book filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedBook("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${selectedBook === "all" ? "bg-white/15 text-white border-white/20" : "bg-app-card/50 text-app-text-secondary hover:text-white/70 border-transparent"}`}
          >
            Tất cả ({ALL_VOCAB.length})
          </button>
          {seoulBooks.map(book => (
            <button
              key={book.id}
              onClick={() => setSelectedBook(book.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${selectedBook === book.id ? bookColors[book.id] : "bg-app-card/50 text-app-text-secondary hover:text-white/70 border-transparent"}`}
            >
              {book.name} ({totalByBook[book.id] || 0})
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-app-text-muted text-sm"></i>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tiếng Hàn, tiếng Việt, phiên âm..."
              className="w-full bg-app-card/50 border border-app-border rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/25"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                <i className="ri-close-line text-app-text-muted text-sm"></i>
              </button>
            )}
          </div>

          <select
            value={selectedPos}
            onChange={e => setSelectedPos(e.target.value)}
            className="bg-app-card/50 border border-app-border rounded-xl px-3 py-2.5 text-white/60 text-sm focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả từ loại</option>
            {allPos.map(pos => <option key={pos} value={pos}>{pos}</option>)}
          </select>

          <div className="flex gap-1 bg-app-card/50 border border-app-border rounded-xl p-1">
            <button
              onClick={() => setSortBy("book")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${sortBy === "book" ? "bg-white/15 text-white" : "text-app-text-secondary hover:text-white/70"}`}
            >
              Theo cuốn
            </button>
            <button
              onClick={() => setSortBy("korean")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${sortBy === "korean" ? "bg-white/15 text-white" : "text-app-text-secondary hover:text-white/70"}`}
            >
              A–Z
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-app-text-muted text-sm">
            {filtered.length === ALL_VOCAB.length ? `${ALL_VOCAB.length} từ vựng` : `${filtered.length} kết quả`}
          </p>
        </div>

        {/* Vocabulary list */}
        {filtered.length === 0 ? (
          <div className="bg-app-card/50 border border-app-border rounded-2xl p-12 text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-app-card/50 rounded-full mx-auto mb-3">
              <i className="ri-search-line text-app-text-muted text-xl"></i>
            </div>
            <p className="text-app-text-secondary text-sm">Không tìm thấy từ vựng phù hợp</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((vocab, idx) => {
              const entryId = getEntryId(vocab);
              const isExpanded = expandedId === entryId;
              const vocabNote = notes[entryId];
              const hasNote = vocabNote?.note?.trim();
              const isHard = vocabNote?.isHard;

              return (
                <div
                  key={idx}
                  className={`bg-app-card/50 border rounded-xl transition-all ${
                    isHard
                      ? "border-red-500/20"
                      : isExpanded
                      ? "border-white/20"
                      : "border-app-border hover:border-white/15"
                  }`}
                >
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : entryId)}
                  >
                    {/* Hard flag */}
                    {isHard && (
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                        <i className="ri-flag-fill text-red-400 text-xs"></i>
                      </div>
                    )}

                    {/* Korean */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white font-semibold text-base" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                          {vocab.korean}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); speakKorean(vocab.korean); }}
                          className="w-6 h-6 flex items-center justify-center bg-white/8 hover:bg-white/15 rounded-full transition-all cursor-pointer flex-shrink-0"
                        >
                          <i className="ri-volume-up-line text-app-text-secondary text-xs"></i>
                        </button>
                        <span className="text-app-text-muted text-xs font-mono">[{vocab.pronunciation}]</span>
                        {hasNote && (
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-sticky-note-fill text-app-accent-primary/60 text-xs"></i>
                          </div>
                        )}
                      </div>
                      <p className="text-white/60 text-sm">{vocab.vietnamese}</p>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${POS_COLORS[vocab.partOfSpeech] || "bg-app-card/70 text-app-text-secondary border-app-border"}`}>
                        {vocab.partOfSpeech}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${bookColors[vocab.bookId]}`}>
                        {vocab.bookName}
                      </span>
                      {/* Note button */}
                      <button
                        onClick={e => { e.stopPropagation(); setNoteModal(vocab); }}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                          hasNote || isHard
                            ? "bg-app-accent-primary/15 text-app-accent-primary"
                            : "bg-app-card/50 text-app-text-muted hover:text-white/50 hover:bg-app-card/70"
                        }`}
                        title="Ghi chú cá nhân"
                      >
                        <i className="ri-edit-line text-xs"></i>
                      </button>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className={`${isExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-app-text-muted text-sm`}></i>
                      </div>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-app-border pt-3 space-y-3">
                      {/* Example */}
                      <div className="bg-app-card/50 rounded-xl p-3">
                        <p className="text-app-text-secondary text-xs mb-1">Ví dụ câu</p>
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => speakKorean(vocab.example)}
                            className="w-6 h-6 flex items-center justify-center bg-white/8 hover:bg-white/15 rounded-full transition-all cursor-pointer flex-shrink-0 mt-0.5"
                          >
                            <i className="ri-volume-up-line text-app-text-secondary text-xs"></i>
                          </button>
                          <div>
                            <p className="text-white/80 text-sm" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{vocab.example}</p>
                            <p className="text-app-text-secondary text-xs mt-0.5 italic">{vocab.exampleVi}</p>
                          </div>
                        </div>
                      </div>

                      {/* Personal note display */}
                      {(hasNote || isHard) && (
                        <div className={`rounded-xl p-3 border ${isHard ? "bg-red-500/5 border-red-500/15" : "bg-app-accent-primary/5 border-app-accent-primary/15"}`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            {isHard && (
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 flex items-center justify-center">
                                  <i className="ri-flag-fill text-red-400 text-xs"></i>
                                </div>
                                <span className="text-red-400 text-xs font-medium">Từ khó</span>
                              </div>
                            )}
                            {hasNote && (
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 flex items-center justify-center">
                                  <i className="ri-sticky-note-line text-app-accent-primary text-xs"></i>
                                </div>
                                <span className="text-app-accent-primary text-xs font-medium">Ghi chú của bạn</span>
                              </div>
                            )}
                          </div>
                          {hasNote && (
                            <p className="text-white/70 text-sm leading-relaxed">{vocabNote.note}</p>
                          )}
                        </div>
                      )}

                      {/* Note action */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-app-text-muted">
                          <div className="w-3 h-3 flex items-center justify-center">
                            <i className="ri-book-3-line text-xs"></i>
                          </div>
                          <span>{vocab.bookName} · Bài {vocab.lessonNumber}: {vocab.lessonTitle}</span>
                        </div>
                        <button
                          onClick={() => setNoteModal(vocab)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary hover:text-white/60 text-xs transition-all cursor-pointer whitespace-nowrap"
                        >
                          <div className="w-3 h-3 flex items-center justify-center">
                            <i className="ri-edit-line text-xs"></i>
                          </div>
                          {hasNote || isHard ? "Sửa ghi chú" : "Thêm ghi chú"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Note modal */}
      {noteModal && (
        <NoteModal
          vocab={noteModal}
          note={notes[getEntryId(noteModal)] || { note: "", isHard: false, updatedAt: "" }}
          onSave={(noteText, isHard) => saveNote(noteModal, noteText, isHard)}
          onClose={() => setNoteModal(null)}
        />
      )}

      {/* Save toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/20 border border-emerald-500/30 text-app-accent-success px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-check-line text-sm"></i>
          </div>
          Đã lưu ghi chú!
        </div>
      )}
    </DashboardLayout>
  );
}
