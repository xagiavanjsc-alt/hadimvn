import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import { useAuth } from "@/hooks/useAuth";
import { epsQuestions } from "@/mocks/epsQuestions";
import { epsVocabulary } from "@/mocks/epsVocabulary";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function getDayOfWeek() {
  return ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"][new Date().getDay()];
}

// ─── Feed Card ────────────────────────────────────────────────────────────────
function FeedCard({ item, onDismiss }: { item: FeedItem; onDismiss?: (id: string) => void }) {
  const navigate = useNavigate();
  return (
    <div className={`bg-[#0f1117] border rounded-2xl p-5 transition-all hover:border-white/10 ${item.pinned ? "border-[#e8c84a]/20" : "border-white/5"}`}>
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
          <i className={`${item.icon} text-xl`} style={{ color: item.color }}></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-semibold text-sm">{item.title}</p>
              {item.pinned && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#e8c84a]/15 text-[#e8c84a]">Ghim</span>}
              {item.xp && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${item.color}15`, color: item.color }}>+{item.xp} XP</span>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-white/20 text-[10px] whitespace-nowrap">{item.time}</span>
              {onDismiss && (
                <button onClick={() => onDismiss(item.id)} className="w-5 h-5 flex items-center justify-center rounded text-white/20 hover:text-white/50 cursor-pointer transition-colors">
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

// ─── Daily Progress Ring ──────────────────────────────────────────────────────
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
      <p className="text-white/40 text-[10px] text-center leading-tight">{label}</p>
      <p className="text-white/60 text-xs font-semibold">{value}/{max}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Học viên";

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
    if (epsDone < 50) items.push({ title: "Luyện thi EPS theo chủ đề", desc: "Bạn chưa làm nhiều câu EPS. Bắt đầu với chủ đề An toàn lao động!", path: "/eps-topic-drill", icon: "ri-focus-3-line", color: "#34d399", reason: `Mới làm ${epsDone} câu` });
    if (vocabMastered < 30) items.push({ title: "Flashcard EPS theo chủ đề", desc: "Học từ vựng theo chủ đề Y tế và Giao thông — quan trọng cho kỳ thi!", path: "/eps-vocab-flashcard", icon: "ri-stack-line", color: "#e8c84a", reason: `Mới thuộc ${vocabMastered} từ` });
    if (streak.count < 7) items.push({ title: "Duy trì streak hàng ngày", desc: `Streak hiện tại: ${streak.count} ngày. Học thêm hôm nay để giữ streak!`, path: "/daily-review", icon: "ri-fire-line", color: "#fb923c", reason: "Streak chưa đủ 7 ngày" });
    if (epsAccuracy < 70 && epsDone > 10) items.push({ title: "Ôn lại câu sai EPS", desc: `Độ chính xác ${epsAccuracy}% — cần ôn lại các câu sai để cải thiện!`, path: "/study-history", icon: "ri-refresh-line", color: "#f472b6", reason: `Độ chính xác ${epsAccuracy}%` });
    if (flashcardKnown < 20) items.push({ title: "Flashcard từ vựng tổng hợp", desc: "Học từ vựng qua flashcard — cách nhanh nhất để mở rộng vốn từ!", path: "/flashcard", icon: "ri-translate-2", color: "#a78bfa", reason: "Chưa học nhiều từ vựng" });
    items.push({ title: "Thi thử EPS đầy đủ (40 câu)", desc: "Kiểm tra trình độ thực tế với bài thi mô phỏng 40 câu trong 50 phút.", path: "/eps-exam", icon: "ri-timer-line", color: "#06b6d4", reason: "Luyện thi thực tế" });
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
        title: `🔥 Streak ${streak.count} ngày — Đừng để mất!`,
        body: streak.count >= 7 ? `Tuyệt vời! Bạn đang có streak ${streak.count} ngày liên tiếp. Tiếp tục học hôm nay để duy trì!` : `Bạn đang có streak ${streak.count} ngày. Cần ${7 - streak.count} ngày nữa để nhận bonus 50 XP!`,
        icon: "ri-fire-fill",
        color: "#fb923c",
        action: { label: "Học ngay hôm nay", path: "/daily-review" },
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
        title: `Hôm nay bạn đã kiếm ${todayXP} XP`,
        body: `Tiến độ tốt! Tổng XP tích lũy: ${totalXP.toLocaleString()} XP — Cấp ${currentRank.name}.`,
        icon: "ri-star-fill",
        color: "#e8c84a",
        action: { label: "Xem thống kê XP", path: "/xp-stats" },
        time: "Hôm nay",
        xp: todayXP,
      });
    }

    // Weekly challenge reminder
    items.push({
      id: "weekly-challenge",
      type: "challenge",
      title: "Thử thách tuần này đang chờ bạn!",
      body: "7 thử thách mới với tổng 810 XP phần thưởng. Hoàn thành tất cả để nhận thêm 300 XP bonus!",
      icon: "ri-trophy-line",
      color: "#34d399",
      action: { label: "Xem thử thách", path: "/weekly-challenge" },
      time: "Đầu tuần",
    });

    // EPS progress
    if (epsDone > 0) {
      items.push({
        id: "eps-progress",
        type: "progress",
        title: `EPS: ${epsDone} câu đã làm — ${epsAccuracy}% chính xác`,
        body: epsAccuracy >= 80 ? "Xuất sắc! Bạn đang ở mức sẵn sàng thi thật. Hãy thử bài thi đầy đủ!" : `Cần cải thiện thêm. Mục tiêu: đạt 80%+ để tự tin thi thật.`,
        icon: "ri-file-list-3-line",
        color: epsAccuracy >= 80 ? "#34d399" : "#e8c84a",
        action: { label: epsAccuracy >= 80 ? "Thi thử ngay" : "Luyện thêm", path: epsAccuracy >= 80 ? "/eps-exam" : "/eps-topic-drill" },
        time: "Cập nhật",
      });
    }

    // Vocab progress
    items.push({
      id: "vocab-progress",
      type: "progress",
      title: `Từ vựng EPS: ${vocabMastered}/${epsVocabulary.length} từ đã thuộc`,
      body: vocabMastered >= 100 ? "Vốn từ vựng tốt! Hãy ôn lại các từ khó để củng cố." : `Còn ${epsVocabulary.length - vocabMastered} từ chưa thuộc. Học thêm mỗi ngày 10 từ để tiến bộ nhanh!`,
      icon: "ri-translate-2",
      color: "#a78bfa",
      action: { label: "Học flashcard", path: "/eps-flashcard" },
      time: "Cập nhật",
    });

    // Community activity
    items.push({
      id: "community-1",
      type: "community",
      title: "Cộng đồng: Bài đăng mới từ Minh Tuấn",
      body: "\"Mẹo nhớ từ vựng an toàn lao động nhanh — chia sẻ kinh nghiệm 3 tháng học EPS\" — 24 lượt thích",
      icon: "ri-group-line",
      color: "#f472b6",
      action: { label: "Xem cộng đồng", path: "/community" },
      time: "2 giờ trước",
    });

    // Rank progress
    items.push({
      id: "rank-progress",
      type: "achievement",
      title: `Cấp bậc: ${currentRank.name} — Tiếp tục tiến lên!`,
      body: `Tổng XP: ${totalXP.toLocaleString()}. Hãy kiếm thêm XP qua flashcard, thi EPS và duy trì streak để lên cấp tiếp theo!`,
      icon: currentRank.icon,
      color: currentRank.color,
      action: { label: "Xem cấp bậc", path: "/community-ranks" },
      time: "Cập nhật",
    });

    // Referral nudge
    items.push({
      id: "referral-nudge",
      type: "community",
      title: "Mời bạn bè — Cả hai cùng nhận XP!",
      body: "Chia sẻ link mời với bạn bè học tiếng Hàn. Bạn nhận +100 XP, bạn bè nhận +50 XP khi đăng ký.",
      icon: "ri-user-add-line",
      color: "#06b6d4",
      action: { label: "Mời ngay", path: "/referral" },
      time: "Mới",
    });

    return items.filter(item => !dismissedIds.includes(item.id));
  }, [streak, todayXP, totalXP, currentRank, epsDone, epsAccuracy, vocabMastered, dismissedIds, xpHistory]);

  const filteredFeed = filterType === "all" ? allFeedItems : allFeedItems.filter(i => i.type === filterType);

  const FILTER_TABS = [
    { key: "all", label: "Tất cả", icon: "ri-apps-line" },
    { key: "progress", label: "Tiến độ", icon: "ri-bar-chart-line" },
    { key: "suggestion", label: "Gợi ý", icon: "ri-lightbulb-line" },
    { key: "streak", label: "Streak", icon: "ri-fire-line" },
    { key: "challenge", label: "Thử thách", icon: "ri-trophy-line" },
    { key: "community", label: "Cộng đồng", icon: "ri-group-line" },
  ];

  return (
    <DashboardLayout
      title="Bảng tin học tập"
      subtitle={`${getDayOfWeek()} · ${new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}`}
    >
      {/* Hero greeting */}
      <div className="bg-gradient-to-r from-[#1a1600] via-[#0f1117] to-[#0f1117] border border-[#e8c84a]/15 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#e8c84a]/70 text-xs font-semibold tracking-normal mb-1">{getGreeting()}</p>
            <h2 className="text-white font-bold text-2xl mb-1">{displayName}!</h2>
            <p className="text-white/40 text-sm">
              Cấp <span style={{ color: currentRank.color }} className="font-semibold">{currentRank.name}</span> · {totalXP.toLocaleString()} XP · Streak {streak.count} ngày
            </p>
          </div>
          <div className="flex items-center gap-6">
            <DailyProgressRing value={todayXP} max={100} label="XP hôm nay" color="#e8c84a" />
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${filterType === tab.key ? "bg-[#e8c84a]/15 text-[#e8c84a] border border-[#e8c84a]/25" : "bg-white/3 text-white/40 border border-white/8 hover:text-white/60"}`}
              >
                <i className={`${tab.icon} text-xs`}></i>{tab.label}
              </button>
            ))}
          </div>

          {/* Feed items */}
          <div className="space-y-3">
            {filteredFeed.length === 0 ? (
              <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-12 text-center">
                <i className="ri-inbox-line text-white/10 text-4xl mb-3"></i>
                <p className="text-white/30 text-sm">Không có thông báo nào</p>
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
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <i className="ri-lightbulb-line text-[#e8c84a] text-sm"></i>
              <h3 className="text-white font-semibold text-sm">Gợi ý bài học tiếp theo</h3>
            </div>
            <div className="space-y-2.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => navigate(s.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer text-left"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs font-medium truncate">{s.title}</p>
                    <p className="text-white/30 text-[10px]">{s.reason}</p>
                  </div>
                  <i className="ri-arrow-right-s-line text-white/20 text-sm flex-shrink-0"></i>
                </button>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Truy cập nhanh</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Thi EPS", icon: "ri-timer-line", color: "#34d399", path: "/eps-exam" },
                { label: "Flashcard", icon: "ri-stack-line", color: "#e8c84a", path: "/eps-flashcard" },
                { label: "Cộng đồng", icon: "ri-group-line", color: "#f472b6", path: "/community" },
                { label: "Thử thách", icon: "ri-trophy-line", color: "#fb923c", path: "/weekly-challenge" },
                { label: "Từ vựng", icon: "ri-translate-2", color: "#a78bfa", path: "/eps-vocab-flashcard" },
                { label: "Thống kê XP", icon: "ri-bar-chart-line", color: "#06b6d4", path: "/xp-stats" },
              ].map(a => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
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
          <div className="bg-gradient-to-br from-[#1a1600] to-[#0f1117] border border-[#e8c84a]/15 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-focus-3-line text-[#e8c84a] text-sm"></i>
              <h3 className="text-white font-semibold text-sm">Mục tiêu hôm nay</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Học 10 flashcard", done: vocabMastered > 0, icon: "ri-stack-line" },
                { label: "Làm 20 câu EPS", done: epsDone >= 20, icon: "ri-file-list-3-line" },
                { label: "Duy trì streak", done: streak.lastDate === today, icon: "ri-fire-line" },
                { label: "Kiếm 50 XP", done: todayXP >= 50, icon: "ri-star-line" },
              ].map((g, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ${g.done ? "bg-emerald-500/20" : "bg-white/5"}`}>
                    <i className={`${g.done ? "ri-checkbox-circle-fill text-emerald-400" : "ri-circle-line text-white/20"} text-xs`}></i>
                  </div>
                  <span className={`text-xs ${g.done ? "text-white/60 line-through" : "text-white/40"}`}>{g.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

