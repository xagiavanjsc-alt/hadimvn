import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { isVipActive, supabase } from "@/lib/supabase";
import { epsQuestions } from "@/mocks/epsQuestions";
import { useXPSystem } from "@/hooks/useXPSystem";
import ShareResultCard from "@/components/feature/ShareResultCard";

interface ExamResult {
  id: string;
  date: string;
  score: number;
  total: number;
  timeUsed: number;
  correctIds: string[];
}

const TOPIK_LEVELS = [
  { level: "Nh?p môn", range: "0–200 t?", color: "#34d399", minVocab: 0, maxVocab: 200, icon: "ri-seedling-line" },
  { level: "TOPIK 1", range: "800–1500 t?", color: "app-accent-primary", minVocab: 201, maxVocab: 1500, icon: "ri-star-line" },
  { level: "TOPIK 2", range: "1500–3000 t?", color: "#fb923c", minVocab: 1501, maxVocab: 3000, icon: "ri-star-half-line" },
  { level: "TOPIK 3", range: "3000–5000 t?", color: "#a78bfa", minVocab: 3001, maxVocab: 5000, icon: "ri-star-fill" },
  { level: "TOPIK 4–6", range: "5000+ t?", color: "#f87171", minVocab: 5001, maxVocab: 99999, icon: "ri-vip-crown-line" },
];

const BADGES = [
  { id: "first_eps", icon: "ri-file-list-3-line", label: "EPS Starter", desc: "Làm câu h?i EPS d?u tiên", color: "app-accent-primary" },
  { id: "streak_7", icon: "ri-fire-line", label: "7 ngày liên ti?p", desc: "H?c 7 ngày không ngh?", color: "#fb923c" },
  { id: "hangul_done", icon: "ri-font-size", label: "Hangul Master", desc: "Hoàn thành b?ng ch? Hangul", color: "#34d399" },
  { id: "flashcard_50", icon: "ri-stack-line", label: "Flashcard Pro", desc: "Thu?c 50 t? v?ng", color: "#a78bfa" },
  { id: "eps_80", icon: "ri-trophy-line", label: "EPS Champion", desc: "Ð?t 80%+ trong thi th? EPS", color: "#06b6d4" },
  { id: "quiz_10", icon: "ri-survey-line", label: "Quiz Addict", desc: "Hoàn thành 10 bài quiz", color: "#ec4899" },
  { id: "hanja_10", icon: "ri-character-recognition-line", label: "Hán Hàn Starter", desc: "H?c 10 t? Hán Hàn", color: "#f97316" },
  { id: "hanja_50", icon: "ri-character-recognition-line", label: "Hán Hàn Pro", desc: "H?c 50 t? Hán Hàn qua SR", color: "#e879f9" },
  { id: "streak_30", icon: "ri-fire-fill", label: "Streak 30 ngày", desc: "H?c 30 ngày liên ti?p", color: "#f87171" },
  { id: "sr_review", icon: "ri-brain-line", label: "SR Master", desc: "Ôn t?p SR 5 l?n", color: "#818cf8" },
];

// DiceBear avatars - free, no API key, reliable SVG service
const AVATAR_PRESETS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Han1&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Han2&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Han3&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Han4&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Han5&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Han6&backgroundColor=c0e8a4",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Korea1&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Korea2&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Korea3&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Hanja1&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Hanja2&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Hanja3&backgroundColor=c0e8a4",
];

function StatCard({ icon, color, bg, label, value, sub }: {
  icon: string; color: string; bg: string; label: string; value: string | number; sub?: string;
}) {
  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-4 sm:p-5">
      <div className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center ${bg} rounded-xl mb-2 sm:mb-3`}>
        <i className={`${icon} ${color} text-base sm:text-lg`}></i>
      </div>
      <p className="text-white font-bold text-lg sm:text-xl leading-none">{value}</p>
      <p className="text-app-text-secondary text-[10px] sm:text-xs mt-1">{label}</p>
      {sub && <p className="text-app-text-muted text-[9px] sm:text-[10px] mt-1">{sub}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, signOut, refreshProfile, loading: authLoading } = useAuth();

  // Refresh profile on mount to ensure VIP status is current
  useEffect(() => {
    if (user) refreshProfile();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const [streak] = useLocalStorage<{ count: number; lastDate: string }>("kts_streak", { count: 0, lastDate: "" });
  const [answeredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [flashcardProgress] = useLocalStorage<Record<string, boolean>>("kts_flashcard_known", {});
  const [hangulProgress] = useLocalStorage<Record<string, boolean>>("kts_hangul_known", {});
  const [examResults] = useLocalStorage<ExamResult[]>("kts_eps_exam_history", []);
  const [quizHistory] = useLocalStorage<{ date: string; score: number; total: number }[]>("kts_quiz_history", []);

  // Hanja stats
  const [srCards] = useLocalStorage<{ id: string; word: string; meaning: string; repetitions: number; nextReview: string; easeFactor: number; interval: number }[]>("kts_sr_cards", []);
  const [hanjaFavorites] = useLocalStorage<string[]>("kts_hanja_favorites", []);
  const [srReviewHistory] = useLocalStorage<{ date: string; count: number }[]>("kts_sr_review_history", []);
  const [studyDiary] = useLocalStorage<{ date: string; wordsLearned: number; quizScore: number; quizTotal: number }[]>("kts_study_diary", []);

  const [activeTab, setActiveTab] = useState<"overview" | "eps" | "hanja" | "badges" | "history">("overview");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.display_name || "");
  const [savingName, setSavingName] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { currentRank, totalXP } = useXPSystem();

  const showSuccess = useCallback((msg: string) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(null), 2500);
  }, []);

  const handleCopyProfileLink = useCallback(() => {
    if (!user) return;
    const link = `${window.location.origin}/public-profile/${user.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  }, [user]);

  const handleSaveName = useCallback(async () => {
    if (!nameInput.trim() || nameInput === profile?.display_name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    await updateProfile({ display_name: nameInput.trim() });
    setSavingName(false);
    setEditingName(false);
    showSuccess("Ðã c?p nh?t tên!");
  }, [nameInput, profile, updateProfile, showSuccess]);

  const handleSelectAvatar = useCallback(async (url: string) => {
    setSavingAvatar(true);
    setShowAvatarPicker(false);
    await updateProfile({ avatar_url: url });
    setSavingAvatar(false);
    showSuccess("Ðã c?p nh?t avatar!");
  }, [updateProfile, showSuccess]);

  const handleUploadAvatar = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = ''; // reset

    if (!file.type.startsWith('image/')) {
      alert('Ch? ch?p nh?n file ?nh');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('?nh không du?c vu?t quá 5MB');
      return;
    }

    setSavingAvatar(true);
    setShowAvatarPicker(false);
    try {
      // Resize + convert to WebP (256x256 square crop)
      const blob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const SIZE = 256;
          const canvas = document.createElement('canvas');
          canvas.width = SIZE;
          canvas.height = SIZE;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas not supported'));
          // Center crop
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, SIZE, SIZE);
          canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/webp', 0.85);
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = URL.createObjectURL(file);
      });

      const fileName = `${user.id}/avatar-${Date.now()}.webp`;
      const { error: uploadErr } = await supabase.storage
        .from('community-images')
        .upload(fileName, blob, { contentType: 'image/webp', upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('community-images')
        .getPublicUrl(fileName);

      await updateProfile({ avatar_url: publicUrl });
      showSuccess("Ðã c?p nh?t avatar!");
    } catch (err) {
      console.error('[uploadAvatar] error:', err);
      alert('L?i upload avatar: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setSavingAvatar(false);
    }
  }, [user, updateProfile, showSuccess]);

  // Computed stats
  const epsTotal = epsQuestions.length;
  const epsDone = Object.keys(answeredMap).length;
  const epsCorrect = epsQuestions.filter(q => answeredMap[q.id] === q.correctIndex).length;
  const epsAccuracy = epsDone > 0 ? Math.round((epsCorrect / epsDone) * 100) : 0;
  const flashcardKnown = Object.values(flashcardProgress).filter(Boolean).length;
  const hangulKnown = Object.values(hangulProgress).filter(Boolean).length;

  // Hanja computed
  const srLearned = srCards.filter(c => c.repetitions > 0).length;
  const srDueToday = srCards.filter(c => c.nextReview && new Date(c.nextReview) <= new Date()).length;
  const srMastered = srCards.filter(c => c.repetitions >= 5 && c.easeFactor >= 2.5).length;
  const totalSRReviews = srReviewHistory.length;
  const totalDiaryDays = studyDiary.length;
  const avgDiaryWords = totalDiaryDays > 0 ? Math.round(studyDiary.reduce((s, d) => s + d.wordsLearned, 0) / totalDiaryDays) : 0;

  const bestExam = useMemo(() => {
    if (examResults.length === 0) return null;
    return examResults.reduce((best, r) => (r.score / r.total > best.score / best.total ? r : best));
  }, [examResults]);

  const avgExamScore = useMemo(() => {
    if (examResults.length === 0) return 0;
    return Math.round(examResults.reduce((s, r) => s + Math.round((r.score / r.total) * 100), 0) / examResults.length);
  }, [examResults]);

  const estimatedVocab = flashcardKnown * 3 + hangulKnown * 2 + epsCorrect * 2 + srLearned * 2;
  const topikLevel = TOPIK_LEVELS.find(l => estimatedVocab >= l.minVocab && estimatedVocab <= l.maxVocab) ?? TOPIK_LEVELS[0];
  const nextLevel = TOPIK_LEVELS[TOPIK_LEVELS.indexOf(topikLevel) + 1];
  const topikProgress = nextLevel
    ? Math.min(100, Math.round(((estimatedVocab - topikLevel.minVocab) / (nextLevel.minVocab - topikLevel.minVocab)) * 100))
    : 100;

  const earnedBadges = useMemo(() => {
    const earned: string[] = [];
    if (epsDone > 0) earned.push("first_eps");
    if (streak.count >= 7) earned.push("streak_7");
    if (streak.count >= 30) earned.push("streak_30");
    if (hangulKnown >= 30) earned.push("hangul_done");
    if (flashcardKnown >= 50) earned.push("flashcard_50");
    if (bestExam && Math.round((bestExam.score / bestExam.total) * 100) >= 80) earned.push("eps_80");
    if (quizHistory.length >= 10) earned.push("quiz_10");
    if (srLearned >= 10) earned.push("hanja_10");
    if (srLearned >= 50) earned.push("hanja_50");
    if (totalSRReviews >= 5) earned.push("sr_review");
    return earned;
  }, [epsDone, streak, hangulKnown, flashcardKnown, bestExam, quizHistory, srLearned, totalSRReviews]);

  const epsByTopic = useMemo(() => {
    const topics: Record<string, { total: number; correct: number }> = {};
    epsQuestions.forEach(q => {
      if (!topics[q.topic]) topics[q.topic] = { total: 0, correct: 0 };
      topics[q.topic].total += 1;
      if (answeredMap[q.id] === q.correctIndex) topics[q.topic].correct += 1;
    });
    return topics;
  }, [answeredMap]);

  const weekActivity = useMemo(() => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayName = days[d.getDay()];
      const isActive = i >= 7 - streak.count;
      return { day: dayName, active: isActive };
    });
  }, [streak]);

  // SR progress by interval bucket
  const srByInterval = useMemo(() => {
    const buckets = [
      { label: "M?i", min: 0, max: 1, color: "#f87171" },
      { label: "1-3 ngày", min: 1, max: 3, color: "#fb923c" },
      { label: "4-7 ngày", min: 4, max: 7, color: "app-accent-primary" },
      { label: "1-2 tu?n", min: 8, max: 14, color: "#34d399" },
      { label: "Thu?c lòng", min: 15, max: 9999, color: "#a78bfa" },
    ];
    return buckets.map(b => ({
      ...b,
      count: srCards.filter(c => c.interval >= b.min && c.interval <= b.max).length,
    }));
  }, [srCards]);

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "H?c viên";
  // VIP logic dùng hàm chung: is_vip=true và chua h?t h?n
  const isVip = isVipActive(profile);
  const vipExpires = isVip && profile?.vip_expires_at ? new Date(profile.vip_expires_at) : null;
  const vipType = profile?.vip_type;

  return (
    <DashboardLayout
      title="H? so h?c viên"
      subtitle="Theo dõi ti?n d? và thành tích h?c ti?ng Hàn c?a b?n"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {saveMsg && (
            <span className="flex items-center gap-1.5 text-app-accent-success text-xs font-medium px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <i className="ri-checkbox-circle-fill"></i>
              {saveMsg}
            </span>
          )}
          {linkCopied && (
            <span className="flex items-center gap-1.5 text-app-accent-primary text-xs font-medium px-3 py-1.5 bg-app-accent-primary/10 rounded-lg border border-app-accent-primary/20">
              <i className="ri-checkbox-circle-fill"></i>
              Ðã copy link!
            </span>
          )}
          {user && (
            <>
              <button
                onClick={() => setShowShareCard(true)}
                className="flex items-center gap-2 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 text-app-accent-primary text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap border border-app-accent-primary/20"
              >
                <i className="ri-share-line"></i>
                <span className="hidden sm:inline">Chia s? streak</span>
                <span className="sm:hidden">Chia s?</span>
              </button>
              <button
                onClick={handleCopyProfileLink}
                className="flex items-center gap-2 bg-app-card/50 hover:bg-app-card/70 text-white/60 hover:text-white/80 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap border border-app-border"
              >
                <i className="ri-link"></i>
                <span className="hidden sm:inline">Copy link</span>
                <span className="sm:hidden">Link</span>
              </button>
            </>
          )}
          {profile && !isVip && (
            <button
              onClick={() => navigate("/pricing")}
              className="flex items-center gap-2 bg-app-card/50 hover:bg-app-card/70 text-white/60 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap border border-app-border"
            >
              <i className="ri-vip-crown-line"></i>
              <span className="hidden sm:inline">Nâng c?p VIP</span>
              <span className="sm:hidden">VIP</span>
            </button>
          )}
        </div>
      }
    >
      {/* Profile header */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => user && setShowAvatarPicker(true)}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[app-accent-primary]/30 to-[#fb923c]/30 flex items-center justify-center">
                  <i className="ri-user-3-line text-app-accent-primary text-xl sm:text-2xl"></i>
                </div>
              )}
              {user && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                  <i className="ri-camera-line text-white text-sm"></i>
                </div>
              )}
            </div>
            {savingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
                <div className="w-4 h-4 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-app-accent-primary text-app-bg">
              <i className="ri-fire-line text-[10px] font-bold"></i>
            </div>
          </div>

          {/* Name + info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={nameInputRef}
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                    className="bg-app-card/50 border border-app-accent-primary/30 rounded-lg px-3 py-1 text-white text-base font-bold focus:outline-none focus:border-app-accent-primary/60 w-48 text-sm"
                    autoFocus
                    maxLength={40}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="flex items-center gap-1 px-3 py-1 bg-app-accent-primary text-app-bg text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    {savingName ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-check-line"></i>}
                    Luu
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameInput(displayName); }}
                    className="px-2 py-1 bg-app-card/50 text-app-text-secondary text-xs rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    H?y
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-bold text-lg">{displayName}</h2>
                  {isVip && (
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${vipType === "year" ? "bg-app-accent-primary/15 text-app-accent-primary border-app-accent-primary/25" : "bg-app-accent-success/15 text-app-accent-success border-emerald-500/25"}`}>
                      <i className="ri-vip-crown-fill text-[10px]"></i>
                      VIP {vipType === "year" ? "Nam" : "Tháng"}
                    </span>
                  )}
                  {user && (
                    <button
                      onClick={() => { setEditingName(true); setNameInput(displayName); }}
                      className="w-6 h-6 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-muted hover:text-white/60 transition-colors cursor-pointer"
                    >
                      <i className="ri-pencil-line text-xs"></i>
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="text-app-text-secondary text-sm">
              {user ? user.email : "Chua dang nh?p"} {user ? `· M?c tiêu: ${topikLevel.level}` : ""}
            </p>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-[#fb923c] text-xs font-semibold">
                <i className="ri-fire-line"></i>
                {streak.count} ngày streak
              </span>
              <span className="text-app-text-muted">·</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: topikLevel.color }}>
                <i className={topikLevel.icon}></i>
                {topikLevel.level}
              </span>
              <span className="text-app-text-muted">·</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: currentRank.color }}>
                <i className={currentRank.icon}></i>
                {currentRank.name} · {totalXP.toLocaleString()} XP
              </span>
              <span className="text-app-text-muted">·</span>
              <span className="text-app-text-secondary text-xs">{earnedBadges.length}/{BADGES.length} huy hi?u</span>
              {srLearned > 0 && (
                <>
                  <span className="text-app-text-muted">·</span>
                  <span className="flex items-center gap-1.5 text-[#a78bfa] text-xs font-semibold">
                    <i className="ri-character-recognition-line"></i>
                    {srLearned} t? Hán Hàn
                  </span>
                </>
              )}
            </div>

            {/* VIP status */}
            {isVip && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <i className={`ri-vip-crown-fill ${vipType === "year" ? "text-app-accent-primary" : "text-app-accent-success"}`}></i>
                <span className={vipType === "year" ? "text-app-accent-primary/70" : "text-app-accent-success/70"}>
                  VIP {vipType === "year" ? "Nam" : "Tháng"}{vipExpires ? ` d?n ${vipExpires.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}` : ""}
                </span>
              </div>
            )}
          </div>

          {/* TOPIK progress */}
          <div className="w-full sm:w-48">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-app-text-secondary text-xs">Ti?n d? TOPIK</span>
              <span className="text-xs font-bold" style={{ color: topikLevel.color }}>{topikProgress}%</span>
            </div>
            <div className="h-2 bg-app-card/50 rounded-full overflow-hidden mb-1.5">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${topikProgress}%`, backgroundColor: topikLevel.color }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-app-text-muted text-[10px]">{topikLevel.level}</span>
              {nextLevel && <span className="text-app-text-muted text-[10px]">{nextLevel.level}</span>}
            </div>
          </div>
        </div>

        {/* Account actions */}
        {user && (
          <div className="mt-4 pt-4 border-t border-app-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-app-text-secondary text-xs">Ðã dang nh?p · D? li?u d?ng b? cloud</span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-app-text-muted hover:text-white/60 text-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-logout-box-line"></i>
              Ðang xu?t
            </button>
          </div>
        )}

        {/* Weekly streak calendar */}
        <div className="mt-5 pt-4 border-t border-app-border">
          <p className="text-app-text-muted text-xs mb-3">Ho?t d?ng 7 ngày qua</p>
          <div className="flex gap-2">
            {weekActivity.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`w-full h-8 rounded-lg flex items-center justify-center transition-all ${d.active ? "bg-app-accent-primary/20 border border-app-accent-primary/30" : "bg-app-surface/50 border border-app-border"}`}>
                  {d.active && <i className="ri-check-line text-app-accent-primary text-xs"></i>}
                </div>
                <span className="text-app-text-muted text-[10px]">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Avatar picker modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowAvatarPicker(false)}>
          <div className="bg-app-bg border border-app-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-base">Ch?n avatar</h3>
              <button onClick={() => setShowAvatarPicker(false)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary hover:text-white/70 cursor-pointer">
                <i className="ri-close-line text-sm"></i>
              </button>
            </div>

            {/* Upload from device */}
            <label className="block mb-4 cursor-pointer">
              <input type="file" accept="image/*" onChange={handleUploadAvatar} className="hidden" />
              <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-app-accent-primary/10 hover:bg-app-accent-primary/20 border border-app-accent-primary/30 text-app-accent-primary text-sm font-semibold transition-colors">
                <i className="ri-upload-cloud-line text-lg"></i>
                T?i ?nh t? máy (t? crop vuông, max 5MB)
              </div>
            </label>

            <div className="text-app-text-muted text-xs mb-2">Ho?c ch?n avatar có s?n:</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {AVATAR_PRESETS.map((url, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectAvatar(url)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${profile?.avatar_url === url ? "border-app-accent-primary" : "border-app-border hover:border-white/30"}`}
                >
                  <img src={url} alt={`Avatar ${i + 1}`} className="w-full aspect-square object-cover bg-white/5" />
                  {profile?.avatar_url === url && (
                    <div className="absolute inset-0 bg-app-accent-primary/20 flex items-center justify-center">
                      <i className="ri-checkbox-circle-fill text-app-accent-primary text-xl"></i>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-app-text-muted text-xs text-center mt-4">Nh?n vào avatar d? ch?n</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-app-surface/50 p-1 rounded-xl mb-6 overflow-x-auto w-full sm:w-fit">
        {(["overview", "eps", "hanja", "badges", "history"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${activeTab === tab ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}
          >
            {tab === "overview" ? "T?ng quan" : tab === "eps" ? "EPS-TOPIK" : tab === "hanja" ? "Hán Hàn" : tab === "badges" ? "Huy hi?u" : "L?ch s?"}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon="ri-file-list-3-line" color="text-app-accent-primary" bg="bg-app-accent-primary/10" label="Câu EPS dã làm" value={epsDone} sub={`${epsAccuracy}% chính xác`} />
            <StatCard icon="ri-stack-line" color="text-[#a78bfa]" bg="bg-[#a78bfa]/10" label="T? v?ng dã thu?c" value={flashcardKnown} sub="qua Flashcard" />
            <StatCard icon="ri-font-size" color="text-app-accent-success" bg="bg-emerald-500/10" label="Hangul dã h?c" value={`${hangulKnown}/40`} sub="ký t? co b?n" />
            <StatCard icon="ri-survey-line" color="text-[#06b6d4]" bg="bg-[#06b6d4]/10" label="Bài quiz hoàn thành" value={quizHistory.length} sub={quizHistory.length > 0 ? `TB ${Math.round(quizHistory.reduce((s, q) => s + Math.round(q.score / q.total * 100), 0) / quizHistory.length)}%` : "Chua có"} />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">L?ch s? thi th? EPS</h3>
                <button onClick={() => navigate("/eps-exam")} className="text-app-accent-primary text-xs cursor-pointer whitespace-nowrap hover:text-[#d4b43a]">
                  Thi ngay <i className="ri-arrow-right-line"></i>
                </button>
              </div>
              {examResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <i className="ri-file-list-3-line text-white/10 text-3xl mb-2"></i>
                  <p className="text-app-text-muted text-sm">Chua có l?n thi nào</p>
                  <button onClick={() => navigate("/eps-exam")} className="mt-3 text-app-accent-primary text-xs cursor-pointer whitespace-nowrap">
                    B?t d?u thi th? ?
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {examResults.slice(-5).reverse().map((r, i) => {
                    const pct = Math.round((r.score / r.total) * 100);
                    const color = pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171";
                    return (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-app-surface/50 rounded-xl">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                          <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/70 text-xs font-medium">{r.score}/{r.total} câu dúng</p>
                          <p className="text-app-text-muted text-[10px]">{new Date(r.date).toLocaleDateString("vi-VN")} · {Math.floor(r.timeUsed / 60)}:{String(r.timeUsed % 60).padStart(2, "0")} phút</p>
                        </div>
                        <div className="w-16 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    );
                  })}
                  {bestExam && (
                    <div className="pt-2 border-t border-app-border flex items-center justify-between">
                      <span className="text-app-text-muted text-xs">Ði?m cao nh?t</span>
                      <span className="text-app-accent-success font-bold text-sm">{Math.round((bestExam.score / bestExam.total) * 100)}% ({bestExam.score}/{bestExam.total})</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">L? trình TOPIK</h3>
                <button onClick={() => navigate("/roadmap")} className="text-app-accent-primary text-xs cursor-pointer whitespace-nowrap hover:text-[#d4b43a]">
                  Chi ti?t <i className="ri-arrow-right-line"></i>
                </button>
              </div>
              <div className="space-y-3">
                {TOPIK_LEVELS.map((lvl, i) => {
                  const isCurrent = lvl.level === topikLevel.level;
                  const isPast = TOPIK_LEVELS.indexOf(topikLevel) > i;
                  return (
                    <div key={lvl.level} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isCurrent ? "bg-app-card/50 border border-app-border" : "opacity-50"}`}>
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${lvl.color}15` }}>
                        {isPast ? (
                          <i className="ri-check-line text-xs" style={{ color: lvl.color }}></i>
                        ) : (
                          <i className={`${lvl.icon} text-xs`} style={{ color: lvl.color }}></i>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-semibold ${isCurrent ? "text-white" : "text-app-text-secondary"}`}>{lvl.level}</p>
                        <p className="text-app-text-muted text-[10px]">{lvl.range}</p>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${lvl.color}15`, color: lvl.color }}>
                          Hi?n t?i
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EPS tab */}
      {activeTab === "eps" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
            <div className="bg-app-bg border border-app-border rounded-2xl p-5 text-center">
              <p className="text-app-accent-primary font-bold text-3xl">{epsDone}</p>
              <p className="text-app-text-secondary text-xs mt-1">Câu dã làm</p>
              <p className="text-app-text-muted text-[10px] mt-0.5">/ {epsTotal} t?ng</p>
            </div>
            <div className="bg-app-bg border border-app-border rounded-2xl p-5 text-center">
              <p className="text-app-accent-success font-bold text-3xl">{epsAccuracy}%</p>
              <p className="text-app-text-secondary text-xs mt-1">T? l? dúng</p>
              <p className="text-app-text-muted text-[10px] mt-0.5">{epsCorrect} câu dúng</p>
            </div>
            <div className="bg-app-bg border border-app-border rounded-2xl p-5 text-center">
              <p className="text-[#06b6d4] font-bold text-3xl">{examResults.length}</p>
              <p className="text-app-text-secondary text-xs mt-1">L?n thi th?</p>
              <p className="text-app-text-muted text-[10px] mt-0.5">TB {avgExamScore}%</p>
            </div>
          </div>

          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Ti?n d? theo ch? d?</h3>
            <div className="space-y-3">
              {Object.entries(epsByTopic).map(([topicId, data]) => {
                const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                const color = pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : pct >= 40 ? "#fb923c" : "#f87171";
                const topicLabels: Record<string, string> = {
                  greeting: "Giao ti?p co b?n", safety: "An toàn lao d?ng", culture: "Van hóa Hàn Qu?c",
                  workplace: "Noi làm vi?c", daily: "Sinh ho?t hàng ngày", emergency: "Tình hu?ng kh?n c?p",
                  listening: "Nghe hi?u", reading: "Ð?c hi?u", law: "Pháp lu?t lao d?ng",
                };
                return (
                  <div key={topicId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white/60 text-xs">{topicLabels[topicId] ?? topicId}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-app-text-muted text-[10px]">{data.correct}/{data.total}</span>
                        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => navigate("/eps-exam")}
              className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-timer-line"></i>
              Thi th? EPS d?y d? (40 câu · 50 phút)
            </button>
          </div>
        </div>
      )}

      {/* Hanja tab */}
      {activeTab === "hanja" && (
        <div className="space-y-5">
          {/* Stats overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-app-bg border border-app-border rounded-2xl p-5 text-center">
              <p className="text-[#f97316] font-bold text-3xl">{srCards.length}</p>
              <p className="text-app-text-secondary text-xs mt-1">T? trong SR</p>
              <p className="text-app-text-muted text-[10px] mt-0.5">T?ng c?ng</p>
            </div>
            <div className="bg-app-bg border border-app-border rounded-2xl p-5 text-center">
              <p className="text-app-accent-primary font-bold text-3xl">{srLearned}</p>
              <p className="text-app-text-secondary text-xs mt-1">Ðã h?c</p>
              <p className="text-app-text-muted text-[10px] mt-0.5">&gt;0 l?n ôn</p>
            </div>
            <div className="bg-app-bg border border-app-border rounded-2xl p-5 text-center">
              <p className="text-[#a78bfa] font-bold text-3xl">{srMastered}</p>
              <p className="text-app-text-secondary text-xs mt-1">Thu?c lòng</p>
              <p className="text-app-text-muted text-[10px] mt-0.5">=5 l?n ôn</p>
            </div>
            <div className="bg-app-bg border border-app-border rounded-2xl p-5 text-center">
              <p className={`font-bold text-3xl ${srDueToday > 0 ? "text-[#f87171]" : "text-app-accent-success"}`}>{srDueToday}</p>
              <p className="text-app-text-secondary text-xs mt-1">C?n ôn hôm nay</p>
              <p className="text-app-text-muted text-[10px] mt-0.5">{srDueToday > 0 ? "Ôn ngay!" : "Ðã ôn xong"}</p>
            </div>
          </div>

          {/* SR interval distribution */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">Phân b? kho?ng ôn t?p</h3>
              <button onClick={() => navigate("/hanja-vocab")} className="text-[#f97316] text-xs cursor-pointer whitespace-nowrap">
                Ôn ngay <i className="ri-arrow-right-line"></i>
              </button>
            </div>
            {srCards.length === 0 ? (
              <div className="text-center py-8">
                <i className="ri-character-recognition-line text-white/10 text-3xl mb-2 block"></i>
                <p className="text-app-text-muted text-sm">Chua có t? Hán Hàn nào</p>
                <button onClick={() => navigate("/hanja-vocab")} className="mt-3 text-[#f97316] text-xs cursor-pointer">B?t d?u h?c ?</button>
              </div>
            ) : (
              <div className="space-y-3">
                {srByInterval.map(bucket => {
                  const pct = srCards.length > 0 ? Math.round((bucket.count / srCards.length) * 100) : 0;
                  return (
                    <div key={bucket.label}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: bucket.color }}></div>
                        <span className="text-white/60 text-xs">{bucket.label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-app-text-muted text-[10px]">{bucket.count} t?</span>
                        <span className="text-xs font-bold" style={{ color: bucket.color }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: bucket.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Study diary summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-app-accent-primary/10">
                  <i className="ri-book-open-line text-app-accent-primary text-sm"></i>
                </div>
                <h3 className="text-white font-semibold text-sm">Nh?t ký h?c t?p</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-app-text-secondary text-xs">Ngày dã ghi</span>
                  <span className="text-white font-bold">{totalDiaryDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-app-text-secondary text-xs">TB t?/ngày</span>
                  <span className="text-app-accent-primary font-bold">{avgDiaryWords}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-app-text-secondary text-xs">T? yêu thích</span>
                  <span className="text-[#f97316] font-bold">{hanjaFavorites.length}</span>
                </div>
              </div>
              <button onClick={() => navigate("/hanja-vocab")} className="mt-4 w-full py-2 rounded-xl bg-app-accent-primary/10 text-app-accent-primary text-xs font-medium cursor-pointer hover:bg-app-accent-primary/20 transition-colors whitespace-nowrap">
                Xem nh?t ký
              </button>
            </div>

            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#a78bfa]/10">
                  <i className="ri-brain-line text-[#a78bfa] text-sm"></i>
                </div>
                <h3 className="text-white font-semibold text-sm">Spaced Repetition</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-app-text-secondary text-xs">Phiên ôn t?p</span>
                  <span className="text-white font-bold">{totalSRReviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-app-text-secondary text-xs">Ð?n h?n hôm nay</span>
                  <span className={`font-bold ${srDueToday > 0 ? "text-[#f87171]" : "text-app-accent-success"}`}>{srDueToday}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-app-text-secondary text-xs">T? l? thu?c lòng</span>
                  <span className="text-[#a78bfa] font-bold">{srCards.length > 0 ? Math.round((srMastered / srCards.length) * 100) : 0}%</span>
                </div>
              </div>
              <button onClick={() => navigate("/hanja-vocab")} className="mt-4 w-full py-2 rounded-xl bg-[#a78bfa]/10 text-[#a78bfa] text-xs font-medium cursor-pointer hover:bg-[#a78bfa]/20 transition-colors whitespace-nowrap">
                Ôn t?p SR
              </button>
            </div>
          </div>

          {/* Share SR result */}
          {srLearned > 0 && (
            <div className="bg-gradient-to-r from-[#0f0a1a] to-[#0f1117] border border-[#a78bfa]/20 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#a78bfa]/15">
                  <i className="ri-share-line text-[#a78bfa] text-lg"></i>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Chia s? thành tích Hán Hàn</p>
                  <p className="text-app-text-secondary text-xs">Ðã h?c {srLearned} t? Hán Hàn qua Spaced Repetition</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareCard(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#a78bfa]/15 border border-[#a78bfa]/25 text-[#a78bfa] text-sm font-medium cursor-pointer hover:bg-[#a78bfa]/25 transition-colors whitespace-nowrap"
              >
                <i className="ri-share-line"></i>
                Chia s?
              </button>
            </div>
          )}
        </div>
      )}

      {/* Badges tab */}
      {activeTab === "badges" && (
        <div>
          {/* Progress summary */}
          <div className="flex items-center gap-4 mb-5 p-4 bg-app-bg border border-app-border rounded-2xl">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-app-accent-primary/10 flex-shrink-0">
              <i className="ri-medal-line text-app-accent-primary text-2xl"></i>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-base">{earnedBadges.length}/{BADGES.length} huy hi?u dã d?t</p>
              <p className="text-app-text-secondary text-sm">Hoàn thành thêm th? thách d? m? khóa huy hi?u m?i</p>
              <div className="mt-2 h-2 bg-app-card/50 rounded-full overflow-hidden">
                <div className="h-full bg-app-accent-primary rounded-full transition-all" style={{ width: `${Math.round((earnedBadges.length / BADGES.length) * 100)}%` }} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-app-accent-primary font-bold text-2xl">{Math.round((earnedBadges.length / BADGES.length) * 100)}%</p>
              <p className="text-app-text-muted text-xs">hoàn thành</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BADGES.map(badge => {
              const earned = earnedBadges.includes(badge.id);
              return (
                <div key={badge.id} className={`bg-app-bg border rounded-2xl p-4 transition-all relative overflow-hidden ${earned ? "border-app-border" : "border-white/3"}`}>
                  {earned && (
                    <div className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500/20">
                      <i className="ri-check-line text-app-accent-success text-[10px]"></i>
                    </div>
                  )}
                  <div className={`w-12 h-12 flex items-center justify-center rounded-2xl mb-3 transition-all ${earned ? "" : "opacity-30"}`} style={{ backgroundColor: `${badge.color}15` }}>
                    <i className={`${badge.icon} text-xl`} style={{ color: badge.color }}></i>
                  </div>
                  <p className={`text-xs font-bold mb-1 ${earned ? "text-white" : "text-app-text-muted"}`}>{badge.label}</p>
                  <p className="text-app-text-muted text-[10px] leading-relaxed">{badge.desc}</p>
                  {earned ? (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg w-fit" style={{ backgroundColor: `${badge.color}15`, color: badge.color }}>
                      <i className="ri-checkbox-circle-fill"></i>
                      Ð?t du?c
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-app-text-muted">
                      <i className="ri-lock-line"></i>
                      Chua m?
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History tab */}
      {activeTab === "history" && (
        <div className="space-y-5">
          {/* Quiz history */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <i className="ri-survey-line text-[#a78bfa]"></i>
                L?ch s? Quiz
              </h3>
              <button onClick={() => navigate("/quiz")} className="text-app-accent-primary text-xs cursor-pointer whitespace-nowrap">
                Làm quiz <i className="ri-arrow-right-line"></i>
              </button>
            </div>
            {quizHistory.length === 0 ? (
              <div className="text-center py-6">
                <i className="ri-survey-line text-white/10 text-3xl mb-2 block"></i>
                <p className="text-app-text-muted text-sm">Chua có l?ch s? quiz</p>
              </div>
            ) : (
              <div className="space-y-2">
                {quizHistory.slice(-8).reverse().map((q, i) => {
                  const pct = Math.round((q.score / q.total) * 100);
                  const color = pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171";
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-app-surface/50 rounded-xl">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white/70 text-xs">{q.score}/{q.total} câu dúng</p>
                      </div>
                      <div className="w-20 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-app-border flex items-center justify-between">
                  <span className="text-app-text-muted text-xs">T?ng {quizHistory.length} l?n</span>
                  <span className="text-[#a78bfa] font-bold text-sm">
                    TB {quizHistory.length > 0 ? Math.round(quizHistory.reduce((s, q) => s + Math.round(q.score / q.total * 100), 0) / quizHistory.length) : 0}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Exam history */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <i className="ri-file-list-3-line text-app-accent-primary"></i>
                L?ch s? thi th? EPS
              </h3>
              <button onClick={() => navigate("/eps-exam")} className="text-app-accent-primary text-xs cursor-pointer whitespace-nowrap">
                Thi ngay <i className="ri-arrow-right-line"></i>
              </button>
            </div>
            {examResults.length === 0 ? (
              <div className="text-center py-6">
                <i className="ri-file-list-3-line text-white/10 text-3xl mb-2 block"></i>
                <p className="text-app-text-muted text-sm">Chua có l?n thi nào</p>
                <button onClick={() => navigate("/eps-exam")} className="mt-3 text-app-accent-primary text-xs cursor-pointer">B?t d?u thi th? ?</button>
              </div>
            ) : (
              <div className="space-y-2">
                {examResults.slice(-8).reverse().map((r, i) => {
                  const pct = Math.round((r.score / r.total) * 100);
                  const color = pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171";
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-app-surface/50 rounded-xl">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white/70 text-xs font-medium">{r.score}/{r.total} câu dúng</p>
                        <p className="text-app-text-muted text-[10px]">{new Date(r.date).toLocaleDateString("vi-VN")} · {Math.floor(r.timeUsed / 60)}:{String(r.timeUsed % 60).padStart(2, "0")} phút</p>
                      </div>
                      <div className="w-16 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
                {bestExam && (
                  <div className="pt-2 border-t border-app-border flex items-center justify-between">
                    <span className="text-app-text-muted text-xs">Ði?m cao nh?t · {examResults.length} l?n thi</span>
                    <span className="text-app-accent-success font-bold text-sm">{Math.round((bestExam.score / bestExam.total) * 100)}%</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "L? trình h?c", icon: "ri-route-line", color: "app-accent-primary", route: "/learning-path" },
              { label: "Th?ng kê XP", icon: "ri-bar-chart-line", color: "#34d399", route: "/xp-stats" },
              { label: "Thành tích", icon: "ri-trophy-line", color: "#fb923c", route: "/achievements" },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.route)}
                className="flex flex-col items-center gap-2 p-4 bg-app-bg border border-app-border rounded-2xl hover:border-app-border transition-all cursor-pointer"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${item.color}15` }}>
                  <i className={`${item.icon} text-lg`} style={{ color: item.color }}></i>
                </div>
                <span className="text-white/60 text-xs text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Share Result Card Modal */}
      {showShareCard && (
        <ShareResultCard
          type="streak"
          streakCount={streak.count}
          displayName={displayName}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </DashboardLayout>
  );
}


