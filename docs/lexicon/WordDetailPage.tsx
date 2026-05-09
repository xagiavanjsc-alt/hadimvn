import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import AudioButton from "./components/AudioButton";
import { findVocabByKorean, vocabularyDetails } from "@/mocks/vocabularyDetail";
import { vocabularyList } from "@/mocks/vocabulary";
import MarkdownText from "@/components/base/MarkdownText";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const LEVEL_COLORS: Record<string, string> = {
  "TOPIK 1": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "TOPIK 2": "bg-amber-50 text-amber-700 border-amber-200",
  "TOPIK 3": "bg-orange-50 text-orange-700 border-orange-200",
  "TOPIK 4": "bg-rose-50 text-rose-600 border-rose-200",
  "TOPIK 5": "bg-red-50 text-red-600 border-red-200",
  "TOPIK 6": "bg-red-100 text-red-700 border-red-300",
  "EPS": "bg-[#FFF8E8] text-[#8B6914] border-[#C9A84C]/40",
};

const LEVEL_DOT: Record<string, string> = {
  "TOPIK 1": "bg-emerald-500",
  "TOPIK 2": "bg-amber-500",
  "TOPIK 3": "bg-orange-500",
  "TOPIK 4": "bg-rose-500",
  "TOPIK 5": "bg-red-600",
  "TOPIK 6": "bg-red-700",
  "EPS": "bg-[#8B6914]",
};

export default function WordDetailPage() {
  const { word } = useParams<{ word: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [reviewMarked, setReviewMarked] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewToast, setReviewToast] = useState<string | null>(null);

  const vocab = word ? findVocabByKorean(word) : undefined;

  // Load trạng thái bookmark từ Supabase
  useEffect(() => {
    if (!user || !vocab) return;
    supabase
      .from("user_progress")
      .select("bookmarked")
      .eq("user_id", user.id)
      .eq("word_id", vocab.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setReviewMarked(!!data.bookmarked);
      });
  }, [user, vocab]);

  const handleMarkReview = useCallback(async () => {
    if (!user || !vocab) {
      setReviewToast("Đăng nhập để lưu từ vào danh sách ôn tập!");
      setTimeout(() => setReviewToast(null), 3000);
      return;
    }
    setReviewLoading(true);
    const newVal = !reviewMarked;
    const { error } = await supabase.from("user_progress").upsert(
      {
        user_id: user.id,
        word_id: vocab.id,
        word_korean: vocab.korean,
        word_meaning: vocab.meaningVi,
        hanja: vocab.hanja,
        level: vocab.level,
        topic: vocab.topic,
        status: newVal ? "review" : "known",
        bookmarked: newVal,
        last_reviewed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,word_id" }
    );
    setReviewLoading(false);
    if (!error) {
      setReviewMarked(newVal);
      setReviewToast(newVal ? "Đã thêm vào danh sách cần ôn!" : "Đã bỏ đánh dấu");
    } else {
      setReviewToast("Lỗi lưu, thử lại!");
    }
    setTimeout(() => setReviewToast(null), 3000);
  }, [user, vocab, reviewMarked]);

  const related = vocabularyList
    .filter((v) => vocab && v.topic === vocab.topic && v.korean !== vocab.korean)
    .slice(0, 6);

  useEffect(() => {
    if (vocab) {
      document.title = `${vocab.korean} (${vocab.hanja}) – ${vocab.sinoVietnamese} | hadim.vn`;
    }
  }, [vocab]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Toast notification
  const ToastEl = reviewToast ? (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] bg-[#2C1810] text-[#F5EFD7] text-sm font-medium px-5 py-3 rounded-xl border border-[#C9A84C]/30 animate-fade-in-up">
      {reviewMarked ? <i className="ri-check-line text-amber-400 mr-2"></i> : <i className="ri-information-line mr-2"></i>}
      {reviewToast}
    </div>
  ) : null;

  if (!vocab) {
    return (
      <div className="min-h-screen bg-[#F5F2ED]" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        <main className="pt-24 px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-8xl font-bold text-[#2C1810]/10 mb-6" style={{ fontFamily: "'Noto Serif', serif" }}>?</div>
            <h2 className="text-xl font-bold text-[#2C1810] mb-3">Không tìm thấy từ này</h2>
            <p className="text-[#5A4030]/60 text-sm mb-6">
              Từ &ldquo;{word}&rdquo; chưa có trong hệ thống. Thử tìm kiếm từ khác.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/search" className="bg-[#8B6914] text-[#F5EFD7] font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap">
                Tra cứu từ vựng
              </Link>
              <button onClick={() => navigate(-1)}
                className="bg-white border border-[#D6C9A0] text-[#5A4030] font-medium text-sm px-5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap">
                Quay lại
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const levelColor = LEVEL_COLORS[vocab.level] || "bg-[#F0EAD6] text-[#5A4030] border-[#D6C9A0]";
  const levelDot = LEVEL_DOT[vocab.level] || "bg-[#8B6914]";

  return (
    <div className="min-h-screen bg-[#F5F2ED]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {ToastEl}
      <Navbar />

      <main className="pt-16">
        {/* Breadcrumb */}
        <div className="border-b border-[#D6C9A0] bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-xs text-[#5A4030]/50">
            <Link to="/" className="hover:text-[#8B6914] cursor-pointer transition-colors">Trang chủ</Link>
            <i className="ri-arrow-right-s-line text-[#5A4030]/30"></i>
            <Link to="/lexicon" className="hover:text-[#8B6914] cursor-pointer transition-colors">Từ điển</Link>
            <i className="ri-arrow-right-s-line text-[#5A4030]/30"></i>
            <span className="text-[#8B6914] font-semibold" style={{ fontFamily: "'Noto Serif', serif" }}>{vocab.korean}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">

            {/* ── Main Column ── */}
            <div className="lg:col-span-3 space-y-5">

              {/* Hero Card */}
              <div className="bg-[#2C1810] rounded-2xl p-8 md:p-10 relative overflow-hidden">
                {/* Deco hanja bg */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[160px] font-bold opacity-[0.05] select-none pointer-events-none leading-none text-[#F5EFD7]"
                  style={{ fontFamily: "'Noto Serif', serif" }}>
                  {vocab.hanja[0]}
                </div>

                <div className="relative z-10">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${levelColor}`}>
                      {vocab.level}
                    </span>
                    <span className="text-xs bg-[#F5EFD7]/10 text-[#F5EFD7]/50 px-3 py-1 rounded-full border border-[#F5EFD7]/15 capitalize">
                      {vocab.topic}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
                    <div className="flex-1">
                      {/* Korean word big */}
                      <h1 className="text-7xl md:text-9xl font-bold text-[#F5EFD7] leading-none mb-3"
                        style={{ fontFamily: "'Noto Serif', serif" }}>
                        {vocab.korean}
                      </h1>
                      {/* Hanja + pronunciation */}
                      <div className="flex items-center gap-4 mt-4">
                        <span className="text-3xl md:text-4xl text-[#C9A84C] font-bold"
                          style={{ fontFamily: "'Noto Serif', serif" }}>
                          {vocab.hanja}
                        </span>
                        <div className="h-8 w-px bg-[#F5EFD7]/15 shrink-0"></div>
                        <div>
                          <div className="text-lg font-bold text-[#F5EFD7]/90">{vocab.sinoVietnamese}</div>
                          <div className="text-sm text-[#F5EFD7]/45">[{vocab.pronunciation}]</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                      <div className="text-xl font-bold text-[#2C1810] bg-[#C9A84C] px-5 py-2.5 rounded-xl">
                        {vocab.meaningVi}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <AudioButton text={vocab.korean} size="md" variant="outline" label="Nghe chuẩn" />
                        <AudioButton text={vocab.korean} size="md" variant="ghost" label="Chậm" slowMode />
                        <AudioButton text={vocab.hanja} size="md" variant="ghost" label="Hán tự" />
                        <button
                          onClick={() => setBookmarked((b) => !b)}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                            bookmarked
                              ? "bg-[#C9A84C]/20 border-[#C9A84C]/50 text-[#C9A84C]"
                              : "bg-[#F5EFD7]/8 border-[#F5EFD7]/15 text-[#F5EFD7]/40 hover:text-[#F5EFD7]/70"
                          }`}
                          title="Lưu từ"
                        >
                          <i className={bookmarked ? "ri-bookmark-fill" : "ri-bookmark-line"}></i>
                        </button>
                        {/* Nút Đánh dấu cần ôn */}
                        <button
                          onClick={handleMarkReview}
                          disabled={reviewLoading}
                          className={`flex items-center gap-1.5 px-3 h-9 rounded-lg border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            reviewMarked
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                              : "bg-[#F5EFD7]/8 border-[#F5EFD7]/15 text-[#F5EFD7]/50 hover:text-[#F5EFD7]/80 hover:border-amber-400/40"
                          } disabled:opacity-60`}
                          title={reviewMarked ? "Bỏ đánh dấu cần ôn" : "Đánh dấu cần ôn"}
                        >
                          {reviewLoading ? (
                            <i className="ri-loader-4-line animate-spin text-sm"></i>
                          ) : (
                            <i className={reviewMarked ? "ri-alarm-warning-fill text-sm" : "ri-alarm-warning-line text-sm"}></i>
                          )}
                          <span className="hidden sm:inline">{reviewMarked ? "Đang ôn" : "Cần ôn"}</span>
                        </button>
                        <button
                          onClick={handleCopyLink}
                          className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#F5EFD7]/15 bg-[#F5EFD7]/8 text-[#F5EFD7]/40 hover:text-[#F5EFD7]/70 transition-colors cursor-pointer"
                          title="Chia sẻ"
                        >
                          <i className={copied ? "ri-check-line text-[#C9A84C]" : "ri-share-line"}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Root Analysis */}
              <div className="bg-white border border-[#D6C9A0] rounded-2xl p-6 md:p-7">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 flex items-center justify-center bg-[#FFF8E8] rounded-lg">
                    <i className="ri-quill-pen-line text-[#8B6914] text-sm"></i>
                  </div>
                  <h2 className="text-sm font-bold text-[#2C1810] uppercase tracking-wider">Phân tích gốc Hán</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  {[vocab.rootAnalysis.char1, vocab.rootAnalysis.char2].map((char, i) => (
                    <div key={i} className="bg-[#F9F6F0] border border-[#D6C9A0] rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-4xl font-bold text-[#8B6914]" style={{ fontFamily: "'Noto Serif', serif" }}>
                          {char.hanja}
                        </div>
                        <div>
                          <div className="text-base font-bold text-[#2C1810]">{char.sinoViet}</div>
                          <AudioButton text={char.hanja} size="sm" variant="ghost" />
                        </div>
                      </div>
                      <p className="text-xs text-[#5A4030]/65 leading-relaxed">{char.meaning}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-[#FFF8E8] border border-[#C9A84C]/25 rounded-xl p-4">
                  <p className="text-sm text-[#2C1810]/80 leading-relaxed"><MarkdownText text={vocab.rootAnalysis.explanation} /></p>
                </div>
              </div>

              {/* Mnemonic Tip */}
              {vocab.mnemonicTip && (
                <div className="bg-[#FFF8E8] border border-[#C9A84C]/25 rounded-2xl p-6 md:p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 flex items-center justify-center bg-[#C9A84C]/15 rounded-lg">
                      <i className="ri-lightbulb-flash-line text-[#8B6914] text-sm"></i>
                    </div>
                    <h2 className="text-sm font-bold text-[#2C1810] uppercase tracking-wider">Mẹo nhớ nhanh</h2>
                  </div>
                  <p className="text-sm text-[#5A4030]/80 leading-relaxed"><MarkdownText text={vocab.mnemonicTip} /></p>
                </div>
              )}

              {/* Mnemonic Story */}
              <div className="bg-white border border-[#D6C9A0] rounded-2xl p-6 md:p-7">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 flex items-center justify-center bg-amber-50 rounded-lg">
                    <i className="ri-book-2-line text-amber-600 text-sm"></i>
                  </div>
                  <h2 className="text-sm font-bold text-[#2C1810] uppercase tracking-wider">Câu chuyện ghi nhớ</h2>
                </div>
                <div className="relative pl-5 border-l-2 border-[#C9A84C]/40">
                  <p className="text-sm text-[#5A4030]/75 leading-relaxed italic">
                    &ldquo;<MarkdownText text={vocab.story} />&rdquo;
                  </p>
                </div>
              </div>

              {/* Related Words */}
              <div className="bg-white border border-[#D6C9A0] rounded-2xl p-6 md:p-7">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 flex items-center justify-center bg-[#EFF6E8] rounded-lg">
                    <i className="ri-git-branch-line text-[#4A5D23] text-sm"></i>
                  </div>
                  <h2 className="text-sm font-bold text-[#2C1810] uppercase tracking-wider">Gia đình từ vựng</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vocab.relatedWords.map((rw, i) => (
                    <Link
                      key={i}
                      to={`/lexicon/${encodeURIComponent(rw.korean)}`}
                      className="group flex items-center gap-4 p-4 bg-[#F9F6F0] hover:bg-[#F0EAD6] border border-[#D6C9A0] hover:border-[#C9A84C]/40 rounded-xl transition-all cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-lg font-bold text-[#2C1810] group-hover:text-[#8B6914] transition-colors"
                            style={{ fontFamily: "'Noto Serif', serif" }}>
                            {rw.korean}
                          </span>
                          <span className="text-sm text-[#8B6914]/60" style={{ fontFamily: "'Noto Serif', serif" }}>
                            {rw.hanja}
                          </span>
                        </div>
                        <div className="text-xs text-[#5A4030]/50">{rw.meaning}</div>
                      </div>
                      <div className="w-5 h-5 flex items-center justify-center">
                        <AudioButton text={rw.korean} size="sm" variant="ghost" />
                      </div>
                      <i className="ri-arrow-right-line text-[#5A4030]/25 group-hover:text-[#8B6914]/60 transition-colors text-sm"></i>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Example Sentences */}
              <div className="bg-white border border-[#D6C9A0] rounded-2xl p-6 md:p-7">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 flex items-center justify-center bg-[#F0F4FF] rounded-lg">
                      <i className="ri-chat-quote-line text-indigo-500 text-sm"></i>
                    </div>
                    <h2 className="text-sm font-bold text-[#2C1810] uppercase tracking-wider">Ví dụ thực chiến</h2>
                  </div>
                  <span className="text-xs text-[#5A4030]/40">{vocab.examples.length} câu</span>
                </div>
                <div className="space-y-5">
                  {vocab.examples.map((ex, i) => (
                    <div key={i} className="border-b border-[#D6C9A0]/50 pb-5 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <span className="text-[10px] bg-[#F0EAD6] text-[#8B6914] px-2 py-0.5 rounded font-bold mt-1 shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          {(ex as { context?: string }).context && (
                            <span className="inline-block text-[9px] bg-[#F9F6F0] border border-[#D6C9A0] text-[#5A4030]/50 px-2 py-0.5 rounded-full mb-2">
                              {(ex as { context?: string }).context}
                            </span>
                          )}
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-base font-semibold text-[#2C1810] leading-relaxed"
                              style={{ fontFamily: "'Noto Serif', serif" }}>
                              {ex.korean}
                            </p>
                            <AudioButton text={ex.korean} size="sm" variant="ghost" />
                          </div>
                          <p className="text-xs text-[#5A4030]/45 mb-1 italic">{ex.romanization}</p>
                          <p className="text-xs text-[#8B6914]/80 mb-2">{ex.phonetic}</p>
                          <p className="text-sm text-[#5A4030]/70"><MarkdownText text={ex.meaning} /></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synonyms & Antonyms */}
              {((vocab.synonyms && vocab.synonyms.length > 0) || (vocab.antonyms && vocab.antonyms.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vocab.synonyms && vocab.synonyms.length > 0 && (
                    <div className="bg-white border border-[#D6C9A0] rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <i className="ri-links-line text-emerald-600 text-sm"></i>
                        <h3 className="text-xs font-bold text-[#2C1810] uppercase tracking-wider">Từ đồng nghĩa</h3>
                      </div>
                      <div className="space-y-2">
                        {vocab.synonyms.map((s, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Link to={`/lexicon/${encodeURIComponent(s.korean)}`}
                              className="text-base font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                              style={{ fontFamily: "'Noto Serif', serif" }}>
                              {s.korean}
                            </Link>
                            <AudioButton text={s.korean} size="sm" variant="ghost" />
                            <span className="text-xs text-[#5A4030]/50">– {s.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {vocab.antonyms && vocab.antonyms.length > 0 && (
                    <div className="bg-white border border-[#D6C9A0] rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <i className="ri-contrast-2-line text-rose-500 text-sm"></i>
                        <h3 className="text-xs font-bold text-[#2C1810] uppercase tracking-wider">Từ trái nghĩa</h3>
                      </div>
                      <div className="space-y-2">
                        {vocab.antonyms.map((a, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Link to={`/lexicon/${encodeURIComponent(a.korean)}`}
                              className="text-base font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                              style={{ fontFamily: "'Noto Serif', serif" }}>
                              {a.korean}
                            </Link>
                            <AudioButton text={a.korean} size="sm" variant="ghost" />
                            <span className="text-xs text-[#5A4030]/50">– {a.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation prev/next */}
              <div className="flex items-center justify-between gap-4">
                {(() => {
                  const allWords = vocabularyDetails;
                  const idx = allWords.findIndex((v) => v.korean === vocab.korean);
                  const prev = allWords[idx - 1];
                  const next = allWords[idx + 1];
                  return (
                    <>
                      {prev ? (
                        <Link to={`/lexicon/${encodeURIComponent(prev.korean)}`}
                          className="flex items-center gap-2 bg-white hover:bg-[#F0EAD6] border border-[#D6C9A0] rounded-xl px-4 py-3 text-[#5A4030]/60 hover:text-[#2C1810] text-sm transition-all cursor-pointer">
                          <i className="ri-arrow-left-line text-sm"></i>
                          <div>
                            <div className="text-[10px] text-[#5A4030]/35 leading-none mb-0.5">Từ trước</div>
                            <div className="font-bold" style={{ fontFamily: "'Noto Serif', serif" }}>{prev.korean}</div>
                          </div>
                        </Link>
                      ) : <div></div>}
                      {next ? (
                        <Link to={`/lexicon/${encodeURIComponent(next.korean)}`}
                          className="flex items-center gap-2 bg-white hover:bg-[#F0EAD6] border border-[#D6C9A0] rounded-xl px-4 py-3 text-[#5A4030]/60 hover:text-[#2C1810] text-sm transition-all cursor-pointer ml-auto">
                          <div className="text-right">
                            <div className="text-[10px] text-[#5A4030]/35 leading-none mb-0.5">Từ tiếp</div>
                            <div className="font-bold" style={{ fontFamily: "'Noto Serif', serif" }}>{next.korean}</div>
                          </div>
                          <i className="ri-arrow-right-line text-sm"></i>
                        </Link>
                      ) : <div></div>}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className="lg:col-span-1 space-y-5">

              {/* Quick stats */}
              <div className="bg-white border border-[#D6C9A0] rounded-2xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#5A4030]/40 mb-4">Thông tin nhanh</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5A4030]/45">Cấp độ</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${levelColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${levelDot}`}></span>
                      {vocab.level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5A4030]/45">Chủ đề</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-[#F0EAD6] text-[#5A4030]/70 border-[#D6C9A0] capitalize">
                      {vocab.topic}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5A4030]/45">Phát âm</span>
                    <span className="text-xs font-medium text-[#2C1810]/60 bg-[#F9F6F0] border border-[#D6C9A0] px-2.5 py-1 rounded-full">
                      [{vocab.pronunciation}]
                    </span>
                  </div>
                </div>
              </div>

              {/* Audio practice */}
              <div className="bg-white border border-[#D6C9A0] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <i className="ri-headphone-line text-[#8B6914] text-sm"></i>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#5A4030]/40">Luyện phát âm</h3>
                </div>
                <div className="text-4xl font-bold text-[#2C1810] text-center py-4 bg-[#F9F6F0] rounded-xl mb-3"
                  style={{ fontFamily: "'Noto Serif', serif" }}>
                  {vocab.korean}
                </div>
                <div className="space-y-2">
                  <AudioButton text={vocab.korean} size="md" variant="solid" label="Tốc độ thường" />
                  <AudioButton text={vocab.korean} size="md" variant="outline" label="Phát âm chậm" slowMode />
                </div>
                <p className="text-[10px] text-[#5A4030]/35 mt-3 text-center leading-relaxed">
                  Sử dụng giọng Korean Seoul chuẩn
                </p>
              </div>

              {/* Same topic words */}
              {related.length > 0 && (
                <div className="bg-white border border-[#D6C9A0] rounded-2xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#5A4030]/40 mb-4">Cùng chủ đề</h3>
                  <div className="space-y-1">
                    {related.map((rw) => (
                      <Link
                        key={rw.id}
                        to={`/lexicon/${encodeURIComponent(rw.korean)}`}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F0EAD6] transition-colors cursor-pointer group"
                      >
                        <span className="text-lg font-bold text-[#5A4030]/70 group-hover:text-[#8B6914] transition-colors w-10 text-center"
                          style={{ fontFamily: "'Noto Serif', serif" }}>
                          {rw.korean}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-[#2C1810]/70 truncate">{rw.sinoViet}</div>
                          <div className="text-[10px] text-[#5A4030]/40 truncate">{rw.meaning}</div>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${LEVEL_COLORS[rw.level] || "bg-[#F0EAD6] text-[#5A4030]/50 border-[#D6C9A0]"} whitespace-nowrap`}>
                          {rw.level}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link to={`/search?topic=${vocab.topic}`}
                    className="mt-3 flex items-center justify-center gap-1 text-xs text-[#8B6914]/70 hover:text-[#8B6914] transition-colors cursor-pointer">
                    Xem tất cả <i className="ri-arrow-right-line"></i>
                  </Link>
                </div>
              )}

              {/* VIP promo */}
              <div className="bg-[#2C1810] rounded-2xl p-5">
                <div className="w-9 h-9 flex items-center justify-center bg-[#C9A84C]/15 rounded-xl mb-3">
                  <i className="ri-vip-crown-fill text-[#C9A84C] text-base"></i>
                </div>
                <h3 className="text-sm font-bold text-[#F5EFD7] mb-1.5">Mở khóa 2.600 từ</h3>
                <p className="text-xs text-[#F5EFD7]/50 mb-4 leading-relaxed">
                  Audio chuẩn Seoul, flashcard AI, truyện chêm và sơ đồ cây Hanja không giới hạn.
                </p>
                <Link to="/vip"
                  className="block w-full text-center bg-[#C9A84C] text-[#2C1810] text-xs font-bold py-2.5 rounded-xl cursor-pointer hover:bg-[#b8943e] transition-colors whitespace-nowrap">
                  Kích hoạt VIP – từ 99K/tháng
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
