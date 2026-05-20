import { useState, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import { epsQuestions } from "@/mocks/epsQuestions";
import { RANKS } from "@/data/ranks";
import { supabase } from "@/lib/supabase";
import { getStreakData } from "@/utils/streak";

function getRankForXP(xp: number) {
  return [...RANKS].reverse().find(r => xp >= r.minXP) || RANKS[0];
}

interface FriendData {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  streak: number;
  epsAccuracy: number;
  epsDone: number;
  flashcardKnown: number;
  badges: number;
  level: string;
  levelColor: string;
  levelIcon: string;
}

// Friend data giờ được fetch thật từ Supabase (không còn mock)

const COMPARE_METRICS = [
  { key: "xp", label: "Tổng XP", icon: "ri-star-line", color: "app-accent-primary", format: (v: number) => v.toLocaleString() },
  { key: "streak", label: "Streak hiện tại", icon: "ri-fire-line", color: "#fb923c", format: (v: number) => `${v} ngày` },
  { key: "epsAccuracy", label: "Độ chính xác EPS", icon: "ri-percent-line", color: "#34d399", format: (v: number) => `${v}%` },
  { key: "epsDone", label: "Câu EPS đã làm", icon: "ri-file-list-3-line", color: "#06b6d4", format: (v: number) => `${v} câu` },
  { key: "flashcardKnown", label: "Từ vựng đã thuộc", icon: "ri-translate-2", color: "#a78bfa", format: (v: number) => `${v} từ` },
  { key: "badges", label: "Huy hiệu đạt được", icon: "ri-medal-line", color: "#f472b6", format: (v: number) => `${v} huy hiệu` },
];

function StatBar({ label, myVal, friendVal, color, format }: {
  label: string; myVal: number; friendVal: number; color: string; format: (v: number) => string;
}) {
  const max = Math.max(myVal, friendVal, 1);
  const myPct = Math.round((myVal / max) * 100);
  const friendPct = Math.round((friendVal / max) * 100);
  const iWin = myVal >= friendVal;

  return (
    <div className="bg-app-bg border border-app-border rounded-xl p-4">
      <p className="text-app-text-secondary text-xs mb-3">{label}</p>
      <div className="space-y-2">
        {/* My bar */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/50 w-12 text-right whitespace-nowrap">Bạn</span>
          <div className="flex-1 h-2 bg-app-card/50 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${myPct}%`, backgroundColor: color }}></div>
          </div>
          <span className="text-xs font-bold w-16 whitespace-nowrap" style={{ color: iWin ? color : "rgba(255,255,255,0.4)" }}>
            {format(myVal)} {iWin && <i className="ri-arrow-up-s-line text-xs"></i>}
          </span>
        </div>
        {/* Friend bar */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/50 w-12 text-right whitespace-nowrap">Bạn bè</span>
          <div className="flex-1 h-2 bg-app-card/50 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${friendPct}%`, backgroundColor: "rgba(255,255,255,0.2)" }}></div>
          </div>
          <span className="text-xs font-bold w-16 whitespace-nowrap" style={{ color: !iWin ? "#f87171" : "rgba(255,255,255,0.4)" }}>
            {format(friendVal)} {!iWin && <i className="ri-arrow-up-s-line text-xs"></i>}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CompareFriendsPage() {
  const [linkInput, setLinkInput] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<FriendData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedFriends, setSavedFriends] = useLocalStorage<FriendData[]>("kts_saved_friends", []);

  const { totalXP, currentRank } = useXPSystem();
  const streak = getStreakData();
  const [answeredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [flashcardProgress] = useLocalStorage<Record<string, boolean>>("kts_flashcard_known", {});
  const [earnedBadgeIds] = useLocalStorage<string[]>("kts_earned_badges", []);

  const epsCorrect = epsQuestions.filter(q => answeredMap[q.id] === q.correctIndex).length;
  const epsDone = Object.keys(answeredMap).length;
  const epsAccuracy = epsDone > 0 ? Math.round((epsCorrect / epsDone) * 100) : 0;
  const flashcardKnown = Object.values(flashcardProgress).filter(Boolean).length;

  const myData: FriendData = {
    id: "me",
    name: "Bạn",
    xp: totalXP,
    streak: streak.currentStreak,
    epsAccuracy,
    epsDone,
    flashcardKnown,
    badges: earnedBadgeIds.length,
    level: currentRank.name,
    levelColor: currentRank.color,
    levelIcon: currentRank.icon,
  };

  const handleLoadFriend = useCallback(async () => {
    if (!linkInput.trim()) return;
    setLoading(true);
    setLoadError("");
    try {
      // Hỗ trợ cả /member/:id (legacy) và /public-profile/:id
      const match = linkInput.match(/\/(?:member|public-profile)\/([a-zA-Z0-9-]+)/);
      if (!match) {
        setLoadError("Link không hợp lệ. Dùng link dạng /public-profile/... hoặc /member/...");
        setLoading(false);
        return;
      }
      const userId = match[1];

      // Query user_profiles + leaderboard + exam_results + study_progress song song
      const [{ data: profile }, { data: lb }, { data: epsRows }, { data: sp }] = await Promise.all([
        supabase.from("user_profiles").select("id, display_name, avatar_url").eq("id", userId).maybeSingle(),
        supabase.from("leaderboard").select("xp, streak").eq("user_id", userId).maybeSingle(),
        supabase.from("exam_results").select("score, total, exam_type").eq("user_id", userId).ilike("exam_type", "eps%"),
        supabase.from("study_progress").select("flashcard_known, vocab_known").eq("user_id", userId).maybeSingle(),
      ]);

      if (!profile) {
        setLoadError("Không tìm thấy hồ sơ người dùng này.");
        setLoading(false);
        return;
      }

      // EPS stats
      let epsAccuracy = 0;
      let epsDone = 0;
      if (epsRows && epsRows.length > 0) {
        let totalScore = 0;
        let totalQuestions = 0;
        epsRows.forEach((r: { score: number; total: number }) => {
          totalScore += r.score || 0;
          totalQuestions += r.total || 0;
        });
        epsAccuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
        epsDone = totalQuestions;
      }

      const flashcardKnown =
        (Array.isArray(sp?.flashcard_known) ? sp.flashcard_known.length : 0) +
        (Array.isArray(sp?.vocab_known) ? sp.vocab_known.length : 0);

      const xp = lb?.xp || 0;
      const streak = lb?.streak || 0;
      const rank = getRankForXP(xp);

      // Badges: cùng công thức với public-profile để nhất quán
      const badges =
        (streak >= 7 ? 1 : 0) + (streak >= 30 ? 1 : 0) + (streak >= 100 ? 1 : 0) +
        (xp >= 1000 ? 1 : 0) + (xp >= 5000 ? 1 : 0) + (xp >= 10000 ? 1 : 0) +
        (epsDone >= 50 ? 1 : 0) + (epsDone >= 200 ? 1 : 0) +
        (epsAccuracy >= 80 ? 1 : 0) + (flashcardKnown >= 100 ? 1 : 0);

      const friend: FriendData = {
        id: userId,
        name: profile.display_name || "Học viên",
        avatar: profile.avatar_url,
        xp,
        streak,
        epsAccuracy,
        epsDone,
        flashcardKnown,
        badges,
        level: rank.name,
        levelColor: rank.color,
        levelIcon: rank.icon,
      };

      setSelectedFriend(friend);
      setSavedFriends(prev => {
        const exists = prev.find(f => f.id === friend.id);
        return exists ? prev.map(f => f.id === friend.id ? friend : f) : [friend, ...prev.slice(0, 4)];
      });
      setLinkInput("");
    } catch (e) {
      setLoadError("Lỗi khi tải dữ liệu. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [linkInput, setSavedFriends]);

  const winsCount = selectedFriend
    ? COMPARE_METRICS.filter(m => (myData[m.key as keyof FriendData] as number) >= (selectedFriend[m.key as keyof FriendData] as number)).length
    : 0;

  return (
    <DashboardLayout
      title="So sánh tiến độ bạn bè"
      subtitle="Nhập link hồ sơ công khai để so sánh cấp bậc, streak và điểm EPS"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main */}
        <div className="space-y-6">
          {/* Input */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Nhập link hồ sơ bạn bè</h3>
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-2 bg-app-card/50 border border-app-border rounded-xl px-4 py-2.5">
                <i className="ri-link text-app-text-muted text-sm"></i>
                <input
                  type="text"
                  value={linkInput}
                  onChange={e => setLinkInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLoadFriend()}
                  placeholder="https://...hanquocoi.../member/abc123"
                  className="flex-1 bg-transparent text-white/70 text-sm outline-none placeholder-white/20"
                />
              </div>
              <button
                onClick={handleLoadFriend}
                disabled={loading || !linkInput.trim()}
                className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-app-bg font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
              >
                {loading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-search-line"></i>}
                So sánh
              </button>
            </div>
            {loadError && <p className="text-red-400 text-xs mt-2"><i className="ri-error-warning-line mr-1"></i>{loadError}</p>}
            <p className="text-app-text-muted text-xs mt-2">
              <i className="ri-information-line mr-1"></i>
              Lấy link hồ sơ công khai từ trang Profile → nút "Chia sẻ hồ sơ"
            </p>
          </div>

          {/* Comparison result */}
          {selectedFriend ? (
            <>
              {/* Header comparison */}
              <div className="bg-app-bg border border-app-border rounded-2xl p-5">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                  {/* Me */}
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${myData.levelColor}15` }}>
                      <i className={`${myData.levelIcon} text-3xl`} style={{ color: myData.levelColor }}></i>
                    </div>
                    <p className="text-white font-bold text-base">Bạn</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${myData.levelColor}15`, color: myData.levelColor }}>
                      {myData.level}
                    </span>
                    <p className="text-app-text-secondary text-xs mt-1">{myData.xp.toLocaleString()} XP</p>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-app-card/50 mx-auto mb-2">
                      <span className="text-app-text-secondary font-bold text-sm">VS</span>
                    </div>
                    <div className="text-center">
                      <p className="text-app-accent-primary font-bold text-lg">{winsCount}/{COMPARE_METRICS.length}</p>
                      <p className="text-app-text-muted text-[10px]">chỉ số thắng</p>
                    </div>
                  </div>

                  {/* Friend */}
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${selectedFriend.levelColor}15` }}>
                      <i className={`${selectedFriend.levelIcon} text-3xl`} style={{ color: selectedFriend.levelColor }}></i>
                    </div>
                    <p className="text-white font-bold text-base">{selectedFriend.name}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${selectedFriend.levelColor}15`, color: selectedFriend.levelColor }}>
                      {selectedFriend.level}
                    </span>
                    <p className="text-app-text-secondary text-xs mt-1">{selectedFriend.xp.toLocaleString()} XP</p>
                  </div>
                </div>

                {/* Result banner */}
                <div className={`mt-4 p-3 rounded-xl text-center ${winsCount > COMPARE_METRICS.length / 2 ? "bg-emerald-500/10 border border-emerald-500/20" : winsCount === COMPARE_METRICS.length / 2 ? "bg-app-accent-primary/10 border border-app-accent-primary/20" : "bg-red-500/10 border border-red-500/20"}`}>
                  <p className="font-bold text-sm" style={{ color: winsCount > COMPARE_METRICS.length / 2 ? "#34d399" : winsCount === COMPARE_METRICS.length / 2 ? "app-accent-primary" : "#f87171" }}>
                    {winsCount > COMPARE_METRICS.length / 2 ? "🏆 Bạn đang dẫn trước!" : winsCount === COMPARE_METRICS.length / 2 ? "🤝 Ngang nhau!" : "💪 Cần cố gắng thêm!"}
                  </p>
                  <p className="text-app-text-muted text-xs mt-0.5">
                    {winsCount > COMPARE_METRICS.length / 2 ? "Tiếp tục duy trì phong độ tốt!" : "Hãy học thêm để vượt qua bạn bè!"}
                  </p>
                </div>
              </div>

              {/* Metric bars */}
              <div className="grid grid-cols-2 gap-3">
                {COMPARE_METRICS.map(m => (
                  <StatBar
                    key={m.key}
                    label={m.label}
                    myVal={myData[m.key as keyof FriendData] as number}
                    friendVal={selectedFriend[m.key as keyof FriendData] as number}
                    color={m.color}
                    format={m.format}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="bg-app-bg border border-app-border rounded-2xl p-12 text-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-app-card/50 mx-auto mb-4">
                <i className="ri-group-line text-app-text-muted text-3xl"></i>
              </div>
              <p className="text-app-text-secondary text-base font-medium mb-2">Chưa có bạn bè để so sánh</p>
              <p className="text-app-text-muted text-sm">Nhập link hồ sơ công khai của bạn bè ở trên để bắt đầu so sánh</p>

            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* My stats summary */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Chỉ số của bạn</h3>
            <div className="space-y-3">
              {COMPARE_METRICS.map(m => (
                <div key={m.key} className="flex items-center gap-3">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${m.color}15` }}>
                    <i className={`${m.icon} text-xs`} style={{ color: m.color }}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-app-text-secondary text-[10px]">{m.label}</p>
                    <p className="text-white font-semibold text-sm">{m.format(myData[m.key as keyof FriendData] as number)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved friends */}
          {savedFriends.length > 0 && (
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">Bạn bè đã so sánh</h3>
              <div className="space-y-2">
                {savedFriends.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFriend(f)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${selectedFriend?.id === f.id ? "bg-white/8 border border-app-border" : "hover:bg-app-card/50"}`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${f.levelColor}15` }}>
                      <i className={`${f.levelIcon} text-sm`} style={{ color: f.levelColor }}></i>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-white/70 text-xs font-medium truncate">{f.name}</p>
                      <p className="text-app-text-muted text-[10px]">{f.level} · {f.xp.toLocaleString()} XP</p>
                    </div>
                    {selectedFriend?.id === f.id && <i className="ri-arrow-right-s-line text-app-accent-primary text-sm"></i>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-lightbulb-line text-app-accent-primary text-sm"></i>
              <h3 className="text-white font-semibold text-sm">Cách chia sẻ hồ sơ</h3>
            </div>
            <div className="space-y-2 text-app-text-secondary text-xs leading-relaxed">
              <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Vào trang <strong className="text-white/60">Hồ sơ</strong></p>
              <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Nhấn nút <strong className="text-white/60">"Chia sẻ hồ sơ"</strong></p>
              <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Gửi link cho bạn bè</p>
              <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Bạn bè dán link vào đây để so sánh</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

