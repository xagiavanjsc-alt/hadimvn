import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import { useAuth } from "@/hooks/useAuth";
import { epsQuestions } from "@/mocks/epsQuestions";
import { epsVocabulary } from "@/mocks/epsVocabulary";

// --- Types --------------------------------------------------------------------
interface FeedItem {
  id: string;
  type: "progress" | "suggestion" | "community" | "achievement" | "streak" | "challenge";
  title: string;
  body: string;
  icon: string;
  color: string;
  action?: { label: string; path: string };
  time: string;
  pinned?: boolean;
  xp?: number;
}

// --- Helpers ------------------------------------------------------------------
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Chào bu?i sáng";
  if (h < 18) return "Chào bu?i chi?u";
  return "Chào bu?i t?i";
}

function getDayOfWeek() {
  return ["Ch? nh?t", "Th? hai", "Th? ba", "Th? tu", "Th? nam", "Th? sáu", "Th? b?y"][new Date().getDay()];
}

// --- Feed Card ----------------------------------------------------------------
interface FeedCardProps {
  item: FeedItem;
  onDismiss?: (id: string) => void;
}

function FeedCard({ item, onDismiss }: FeedCardProps) {
  const navigate = useNavigate();
  return (
    <div className={`bg-app-bg border rounded-2xl p-5 transition-all hover:border-app-border ${item.pinned ? "border-app-accent-primary/20" : "border-app-border"}`}>
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
          <i className={`${item.icon} text-xl`} style={{ color: item.color }}></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-semibold text-sm">{item.title}</p>
              {item.pinned && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-app-accent-primary/15 text-app-accent-primary">Ghim</span>}
              {item.xp && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${item.color}15`, color: item.color }}>+{item.xp} XP</span>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-app-text-muted text-[10px] whitespace-nowrap">{item.time}</span>
              {onDismiss && (
                <button onClick={() => onDismiss(item.id)} className="w-5 h-5 flex items-center justify-center rounded text-app-text-muted hover:text-white/50 cursor-pointer transition-colors">
                  <i className="ri-close-line text-xs"></i>
                </button>
              )}
            </div>
          </div>
          <p className="text-white/45 text-xs leading-relaxed">{item.body}</p>
          {item.action && (
            <button
              onClick={() => navigate(item.action!.path)}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors hover:opacity-80"
              style={{ color: item.color }}
            >
              {item.action.label} <i className="ri-arrow-right-line text-xs"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Daily Progress Ring ------------------------------------------------------
function DailyProgressRing({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-sm">{pct}%</span>
        </div>
      </div>
      <p className="text-app-text-secondary text-[10px] text-center leading-tight">{label}</p>
      <p className="text-white/60 text-xs font-semibold">{value}/{max}</p>
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------
export default function StudyFeedPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { totalXP, currentRank, xpHistory } = useXPSystem();
  const [streak] = useLocalStorage<{ count: number; lastDate: string }>("kts_streak", { count: 0, lastDate: "" });
  const [answeredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [masteredIds] = useLocalStorage<string[]>("kts_eps_vocab_mastered", []);
  const [flashcardKnownMap] = useLocalStorage<Record<string, boolean>>("kts_flashcard_known", {});
  const [dismissedIds, setDismissedIds] = useLocalStorage<string[]>("kts_feed_dismissed", []);
  const [filterType, setFilterType] = useState<string>("all");

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "H?c viên";

  // Daily stats
  const today = new Date().toISOString().split("T")[0];
  const todayXP = xpHistory.filter(h => new Date(h.ts).toISOString().split("T")[0] === today).reduce((s, h) => s + h.amount, 0);
  const epsDone = Object.keys(answeredMap).length;
  const epsCorrect = epsQuestions.filter(q => answeredMap[q.id] === q.correctIndex).length;
  const epsAccuracy = epsDone > 0 ? Math.round((epsCorrect / epsDone) * 100) : 0;
  const vocabMastered = masteredIds.filter(id => epsVocabulary.some(v => v.id === id)).length;
  const flashcardKnown = Object.values(flashcardKnownMap).filter(Boolean).length;

  // Suggested next lessons based on progress
  const suggestions = useMemo(() => {
    const items: { title: string; desc: string; path: string; icon: string; color: string; reason: string }[] = [];
    if (epsDone < 50) items.push({ title: "Luy?n thi EPS theo ch? d?", desc: "B?n chua làm nhi?u câu EPS. B?t d?u v?i ch? d? An toàn lao d?ng!", path: "/eps-topic-drill", icon: "ri-focus-3-line", color: "#34d399", reason: `M?i làm ${epsDone} câu` });
    if (vocabMastered < 30) items.push({ title: "Flashcard EPS theo ch? d?", desc: "H?c t? v?ng theo ch? d? Y t? và Giao thông — quan tr?ng cho k? thi!", path: "/eps-vocab-flashcard", icon: "ri-stack-line", color: "app-accent-primary", reason: `M?i thu?c ${vocabMastered} t?` });
    if (streak.count < 7) items.push({ title: "Duy trì streak hàng ngày", desc: `Streak hi?n t?i: ${streak.count} ngày. H?c thêm hôm nay d? gi? streak!`, path: "/daily-review", icon: "ri-fire-line", color: "#fb923c", reason: "Streak chua d? 7 ngày" });
    if (epsAccuracy < 70 && epsDone > 10) items.push({ title: "Ôn l?i câu sai EPS", desc: `Ð? chính xác ${epsAccuracy}% — c?n ôn l?i các câu sai d? c?i thi?n!`, path: "/study-history", icon: "ri-refresh-line", color: "#f472b6", reason: `Ð? chính xác ${epsAccuracy}%` });
    if (flashcardKnown < 20) items.push({ title: "Flashcard t? v?ng t?ng h?p", desc: "H?c t? v?ng qua flashcard — cách nhanh nh?t d? m? r?ng v?n t?!", path: "/flashcard", icon: "ri-translate-2", color: "#a78bfa", reason: "Chua h?c nhi?u t? v?ng" });
    items.push({ title: "Thi th? EPS d?y d? (40 câu)", desc: "Ki?m tra trình d? th?c t? v?i bài thi mô ph?ng 40 câu trong 50 phút.", path: "/eps-exam", icon: "ri-timer-line", color: "#06b6d4", reason: "Luy?n thi th?c t?" });
    return items.slice(0, 4);
  }, [epsDone, vocabMastered, streak.count, epsAccuracy, flashcardKnown]);

  // Build feed items
  const allFeedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];

    // Streak status
    if (streak.count > 0) {
      items.push({
        id: "streak-status",
        type: "streak",
        title: `?? Streak ${streak.count} ngày — Ð?ng d? m?t!`,
        body: streak.count >= 7 ? `Tuy?t v?i! B?n dang có streak ${streak.count} ngày liên ti?p. Ti?p t?c h?c hôm nay d? duy trì!` : `B?n dang có streak ${streak.count} ngày. C?n ${7 - streak.count} ngày n?a d? nh?n bonus 50 XP!`,
        icon: "ri-fire-fill",
        color: "#fb923c",
        action: { label: "H?c ngay hôm nay", path: "/daily-review" },
        time: "Hôm nay",
        pinned: true,
        xp: streak.count >= 7 ? 50 : undefined,
      });
    }

    // Today XP summary
    if (todayXP > 0) {
      items.push({
        id: "today-xp",
        type: "progress",
        title: `Hôm nay b?n dã ki?m ${todayXP} XP`,
        body: `Ti?n d? t?t! T?ng XP tích luy: ${totalXP.toLocaleString()} XP — C?p ${currentRank.name}.`,
        icon: "ri-star-fill",
        color: "app-accent-primary",
        action: { label: "Xem th?ng kê XP", path: "/xp-stats" },
        time: "Hôm nay",
        xp: todayXP,
      });
    }

    // Weekly challenge reminder
    items.push({
      id: "weekly-challenge",
      type: "challenge",
      title: "Th? thách tu?n này dang ch? b?n!",
      body: "7 th? thách m?i v?i t?ng 810 XP ph?n thu?ng. Hoàn thành t?t c? d? nh?n thêm 300 XP bonus!",
      icon: "ri-trophy-line",
      color: "#34d399",
      action: { label: "Xem th? thách", path: "/weekly-challenge" },
      time: "Ð?u tu?n",
    });

    // EPS progress
    if (epsDone > 0) {
      items.push({
        id: "eps-progress",
        type: "progress",
        title: `EPS: ${epsDone} câu dã làm — ${epsAccuracy}% chính xác`,
        body: epsAccuracy >= 80 ? "Xu?t s?c! B?n dang ? m?c s?n sàng thi th?t. Hãy th? bài thi d?y d?!" : `C?n c?i thi?n thêm. M?c tiêu: d?t 80%+ d? t? tin thi th?t.`,
        icon: "ri-file-list-3-line",
        color: epsAccuracy >= 80 ? "#34d399" : "app-accent-primary",
        action: { label: epsAccuracy >= 80 ? "Thi th? ngay" : "Luy?n thêm", path: epsAccuracy >= 80 ? "/eps-exam" : "/eps-topic-drill" },
        time: "C?p nh?t",
      });
    }

    // Vocab progress
    items.push({
      id: "vocab-progress",
      type: "progress",
      title: `T? v?ng EPS: ${vocabMastered}/${epsVocabulary.length} t? dã thu?c`,
      body: vocabMastered >= 100 ? "V?n t? v?ng t?t! Hãy ôn l?i các t? khó d? c?ng c?." : `Còn ${epsVocabulary.length - vocabMastered} t? chua thu?c. H?c thêm m?i ngày 10 t? d? ti?n b? nhanh!`,
      icon: "ri-translate-2",
      color: "#a78bfa",
      action: { label: "H?c flashcard", path: "/eps-flashcard" },
      time: "C?p nh?t",
    });

    // Community activity
    items.push({
      id: "community-1",
      type: "community",
      title: "C?ng d?ng: Bài dang m?i t? Minh Tu?n",
      body: "\"M?o nh? t? v?ng an toàn lao d?ng nhanh — chia s? kinh nghi?m 3 tháng h?c EPS\" — 24 lu?t thích",
      icon: "ri-group-line",
      color: "#f472b6",
      action: { label: "Xem c?ng d?ng", path: "/community" },
      time: "2 gi? tru?c",
    });

    // Rank progress
    items.push({
      id: "rank-progress",
      type: "achievement",
      title: `C?p b?c: ${currentRank.name} — Ti?p t?c ti?n lên!`,
      body: `T?ng XP: ${totalXP.toLocaleString()}. Hãy ki?m thêm XP qua flashcard, thi EPS và duy trì streak d? lên c?p ti?p theo!`,
      icon: currentRank.icon,
      color: currentRank.color,
      action: { label: "Xem c?p b?c", path: "/community-ranks" },
      time: "C?p nh?t",
    });

    // Referral nudge
    items.push({
      id: "referral-nudge",
      type: "community",
      title: "M?i b?n bè — C? hai cùng nh?n XP!",
      body: "Chia s? link m?i v?i b?n bè h?c ti?ng Hàn. B?n nh?n +100 XP, b?n bè nh?n +50 XP khi dang ký.",
      icon: "ri-user-add-line",
      color: "#06b6d4",
      action: { label: "M?i ngay", path: "/referral" },
      time: "M?i",
    });

    return items.filter(item => !dismissedIds.includes(item.id));
  }, [streak, todayXP, totalXP, currentRank, epsDone, epsAccuracy, vocabMastered, dismissedIds, xpHistory]);

  const filteredFeed = filterType === "all" ? allFeedItems : allFeedItems.filter(i => i.type === filterType);

  const FILTER_TABS = [
    { key: "all", label: "T?t c?", icon: "ri-apps-line" },
    { key: "progress", label: "Ti?n d?", icon: "ri-bar-chart-line" },
    { key: "suggestion", label: "G?i ý", icon: "ri-lightbulb-line" },
    { key: "streak", label: "Streak", icon: "ri-fire-line" },
    { key: "challenge", label: "Th? thách", icon: "ri-trophy-line" },
    { key: "community", label: "C?ng d?ng", icon: "ri-group-line" },
  ];

  return (
    <DashboardLayout
      title="B?ng tin h?c t?p"
      subtitle={`${getDayOfWeek()} · ${new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}`}
    >
      {/* Hero greeting */}
      <div className="bg-gradient-to-r from-app-surface via-[#0f1117] to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-app-accent-primary/70 text-xs font-semibold tracking-normal mb-1">{getGreeting()}</p>
            <h2 className="text-white font-bold text-2xl mb-1">{displayName}!</h2>
            <p className="text-app-text-secondary text-sm">
              C?p <span style={{ color: currentRank.color }} className="font-semibold">{currentRank.name}</span> · {totalXP.toLocaleString()} XP · Streak {streak.count} ngày
            </p>
          </div>
          <div className="flex items-center gap-6">
            <DailyProgressRing value={todayXP} max={100} label="XP hôm nay" color="app-accent-primary" />
            <DailyProgressRing value={streak.count} max={30} label="Streak" color="#fb923c" />
            <DailyProgressRing value={epsAccuracy} max={100} label="EPS chính xác" color="#34d399" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left: feed */}
        <div>
          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 mb-5 flex-wrap">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${filterType === tab.key ? "bg-app-accent-primary/15 text-app-accent-primary border border-app-accent-primary/25" : "bg-app-surface/50 text-app-text-secondary border border-app-border hover:text-white/60"}`}
              >
                <i className={`${tab.icon} text-xs`}></i>{tab.label}
              </button>
            ))}
          </div>

          {/* Feed items */}
          <div className="space-y-3">
            {filteredFeed.length === 0 ? (
              <div className="bg-app-bg border border-app-border rounded-2xl p-12 text-center">
                <i className="ri-inbox-line text-white/10 text-4xl mb-3"></i>
                <p className="text-app-text-muted text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              filteredFeed.map(item => (
                <FeedCard
                  key={item.id}
                  item={item}
                  onDismiss={!item.pinned ? (id) => setDismissedIds(prev => [...prev, id]) : undefined}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: suggestions + quick actions */}
        <div className="space-y-4">
          {/* Suggested next lessons */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <i className="ri-lightbulb-line text-app-accent-primary text-sm"></i>
              <h3 className="text-white font-semibold text-sm">G?i ý bài h?c ti?p theo</h3>
            </div>
            <div className="space-y-2.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => navigate(s.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/2 hover:bg-app-card/50 border border-app-border hover:border-app-border transition-all cursor-pointer text-left"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs font-medium truncate">{s.title}</p>
                    <p className="text-app-text-muted text-[10px]">{s.reason}</p>
                  </div>
                  <i className="ri-arrow-right-s-line text-app-text-muted text-sm flex-shrink-0"></i>
                </button>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Truy c?p nhanh</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Thi EPS", icon: "ri-timer-line", color: "#34d399", path: "/eps-exam" },
                { label: "Flashcard", icon: "ri-stack-line", color: "app-accent-primary", path: "/eps-flashcard" },
                { label: "C?ng d?ng", icon: "ri-group-line", color: "#f472b6", path: "/community" },
                { label: "Th? thách", icon: "ri-trophy-line", color: "#fb923c", path: "/weekly-challenge" },
                { label: "T? v?ng", icon: "ri-translate-2", color: "#a78bfa", path: "/eps-vocab-flashcard" },
                { label: "Th?ng kê XP", icon: "ri-bar-chart-line", color: "#06b6d4", path: "/xp-stats" },
              ].map(a => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-app-surface/50 hover:bg-white/6 border border-app-border hover:border-app-border transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${a.color}15` }}>
                    <i className={`${a.icon} text-xs`} style={{ color: a.color }}></i>
                  </div>
                  <span className="text-white/60 text-xs font-medium whitespace-nowrap">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Today's goal */}
          <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-focus-3-line text-app-accent-primary text-sm"></i>
              <h3 className="text-white font-semibold text-sm">M?c tiêu hôm nay</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "H?c 10 flashcard", done: vocabMastered > 0, icon: "ri-stack-line" },
                { label: "Làm 20 câu EPS", done: epsDone >= 20, icon: "ri-file-list-3-line" },
                { label: "Duy trì streak", done: streak.lastDate === today, icon: "ri-fire-line" },
                { label: "Ki?m 50 XP", done: todayXP >= 50, icon: "ri-star-line" },
              ].map((g, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ${g.done ? "bg-emerald-500/20" : "bg-app-card/50"}`}>
                    <i className={`${g.done ? "ri-checkbox-circle-fill text-app-accent-success" : "ri-circle-line text-app-text-muted"} text-xs`}></i>
                  </div>
                  <span className={`text-xs ${g.done ? "text-white/60 line-through" : "text-app-text-secondary"}`}>{g.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

