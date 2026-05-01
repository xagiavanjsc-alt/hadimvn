import { useState, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import { epsQuestions } from "@/mocks/epsQuestions";
import { RANKS } from "@/pages/community-ranks/page";

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

// Mock friend data for demo
const MOCK_FRIENDS: FriendData[] = [
  {
    id: "friend1",
    name: "Nguyễn Minh Tuấn",
    xp: 1850,
    streak: 23,
    epsAccuracy: 78,
    epsDone: 145,
    flashcardKnown: 89,
    badges: 7,
    level: "Cao thủ",
    levelColor: "#a78bfa",
    levelIcon: "ri-vip-crown-line",
  },
  {
    id: "friend2",
    name: "Trần Thu Hương",
    xp: 620,
    streak: 8,
    epsAccuracy: 65,
    epsDone: 87,
    flashcardKnown: 54,
    badges: 4,
    level: "Chiến binh",
    levelColor: "#fb923c",
    levelIcon: "ri-sword-line",
  },
  {
    id: "friend3",
    name: "Lê Văn Đức",
    xp: 320,
    streak: 5,
    epsAccuracy: 55,
    epsDone: 60,
    flashcardKnown: 32,
    badges: 2,
    level: "Học viên",
    levelColor: "#34d399",
    levelIcon: "ri-book-open-line",
  },
];

const COMPARE_METRICS = [
  { key: "xp", label: "Tổng XP", icon: "ri-star-line", color: "#e8c84a", format: (v: number) => v.toLocaleString() },
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
    <div className="bg-[#0f1117] border border-white/5 rounded-xl p-4">
      <p className="text-white/40 text-xs mb-3">{label}</p>
      <div className="space-y-2">
        {/* My bar */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/50 w-12 text-right whitespace-nowrap">Bạn</span>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${myPct}%`, backgroundColor: color }}></div>
          </div>
          <span className="text-xs font-bold w-16 whitespace-nowrap" style={{ color: iWin ? color : "rgba(255,255,255,0.4)" }}>
            {format(myVal)} {iWin && <i className="ri-arrow-up-s-line text-xs"></i>}
          </span>
        </div>
        {/* Friend bar */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/50 w-12 text-right whitespace-nowrap">Bạn bè</span>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
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
  const [streak] = useLocalStorage<{ count: number }>("kts_streak", { count: 0 });
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
    streak: streak.count,
    epsAccuracy,
    epsDone,
    flashcardKnown,
    badges: earnedBadgeIds.length,
    level: currentRank.name,
    levelColor: currentRank.color,
    levelIcon: currentRank.icon,
  };

  const handleLoadFriend = useCallback(() => {
    if (!linkInput.trim()) return;
    setLoading(true);
    setLoadError("");
    // Simulate loading — in real app would fetch from Supabase by userId
    setTimeout(() => {
      // Extract userId from link if possible
      const match = linkInput.match(/\/member\/([a-zA-Z0-9-]+)/);
      if (match) {
        // Try to find in mock friends or generate random
        const mockIdx = Math.floor(Math.random() * MOCK_FRIENDS.length);
        const friend = { ...MOCK_FRIENDS[mockIdx], id: match[1] };
        setSelectedFriend(friend);
        setSavedFriends(prev => {
          const exists = prev.find(f => f.id === friend.id);
          return exists ? prev : [friend, ...prev.slice(0, 4)];
        });
        setLinkInput("");
      } else {
        setLoadError("Link không hợp lệ. Hãy dùng link hồ sơ công khai dạng /member/...");
      }
      setLoading(false);
    }, 1000);
  }, [linkInput, setSavedFriends]);

  const winsCount = selectedFriend
    ? COMPARE_METRICS.filter(m => (myData[m.key as keyof FriendData] as number) >= (selectedFriend[m.key as keyof FriendData] as number)).length
    : 0;

  return (
    <DashboardLayout
      title="So sánh tiến độ bạn bè"
      subtitle="Nhập link hồ sơ công khai để so sánh cấp bậc, streak và điểm EPS"
    >
      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Main */}
        <div className="space-y-6">
          {/* Input */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Nhập link hồ sơ bạn bè</h3>
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5">
                <i className="ri-link text-white/30 text-sm"></i>
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
                className="flex items-center gap-2 bg-[#e8c84a] hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-[#0f1117] font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
              >
                {loading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-search-line"></i>}
                So sánh
              </button>
            </div>
            {loadError && <p className="text-red-400 text-xs mt-2"><i className="ri-error-warning-line mr-1"></i>{loadError}</p>}
            <p className="text-white/20 text-xs mt-2">
              <i className="ri-information-line mr-1"></i>
              Lấy link hồ sơ công khai từ trang Profile → nút "Chia sẻ hồ sơ"
            </p>
          </div>

          {/* Comparison result */}
          {selectedFriend ? (
            <>
              {/* Header comparison */}
              <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
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
                    <p className="text-white/40 text-xs mt-1">{myData.xp.toLocaleString()} XP</p>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 mx-auto mb-2">
                      <span className="text-white/40 font-bold text-sm">VS</span>
                    </div>
                    <div className="text-center">
                      <p className="text-[#e8c84a] font-bold text-lg">{winsCount}/{COMPARE_METRICS.length}</p>
                      <p className="text-white/30 text-[10px]">chỉ số thắng</p>
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
                    <p className="text-white/40 text-xs mt-1">{selectedFriend.xp.toLocaleString()} XP</p>
                  </div>
                </div>

                {/* Result banner */}
                <div className={`mt-4 p-3 rounded-xl text-center ${winsCount > COMPARE_METRICS.length / 2 ? "bg-emerald-500/10 border border-emerald-500/20" : winsCount === COMPARE_METRICS.length / 2 ? "bg-[#e8c84a]/10 border border-[#e8c84a]/20" : "bg-red-500/10 border border-red-500/20"}`}>
                  <p className="font-bold text-sm" style={{ color: winsCount > COMPARE_METRICS.length / 2 ? "#34d399" : winsCount === COMPARE_METRICS.length / 2 ? "#e8c84a" : "#f87171" }}>
                    {winsCount > COMPARE_METRICS.length / 2 ? "🏆 Bạn đang dẫn trước!" : winsCount === COMPARE_METRICS.length / 2 ? "🤝 Ngang nhau!" : "💪 Cần cố gắng thêm!"}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">
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
            <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/5 mx-auto mb-4">
                <i className="ri-group-line text-white/20 text-3xl"></i>
              </div>
              <p className="text-white/40 text-base font-medium mb-2">Chưa có bạn bè để so sánh</p>
              <p className="text-white/20 text-sm">Nhập link hồ sơ công khai của bạn bè ở trên để bắt đầu so sánh</p>

              {/* Demo with mock friends */}
              <div className="mt-6">
                <p className="text-white/20 text-xs mb-3">Hoặc thử so sánh với học viên mẫu:</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {MOCK_FRIENDS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFriend(f)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all bg-white/5 text-white/40 border border-white/8 hover:text-white/70 hover:bg-white/10"
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* My stats summary */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Chỉ số của bạn</h3>
            <div className="space-y-3">
              {COMPARE_METRICS.map(m => (
                <div key={m.key} className="flex items-center gap-3">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${m.color}15` }}>
                    <i className={`${m.icon} text-xs`} style={{ color: m.color }}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/40 text-[10px]">{m.label}</p>
                    <p className="text-white font-semibold text-sm">{m.format(myData[m.key as keyof FriendData] as number)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved friends */}
          {savedFriends.length > 0 && (
            <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">Bạn bè đã so sánh</h3>
              <div className="space-y-2">
                {savedFriends.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFriend(f)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${selectedFriend?.id === f.id ? "bg-white/8 border border-white/10" : "hover:bg-white/5"}`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${f.levelColor}15` }}>
                      <i className={`${f.levelIcon} text-sm`} style={{ color: f.levelColor }}></i>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-white/70 text-xs font-medium truncate">{f.name}</p>
                      <p className="text-white/30 text-[10px]">{f.level} · {f.xp.toLocaleString()} XP</p>
                    </div>
                    {selectedFriend?.id === f.id && <i className="ri-arrow-right-s-line text-[#e8c84a] text-sm"></i>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gradient-to-br from-[#1a1600] to-[#0f1117] border border-[#e8c84a]/15 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-lightbulb-line text-[#e8c84a] text-sm"></i>
              <h3 className="text-white font-semibold text-sm">Cách chia sẻ hồ sơ</h3>
            </div>
            <div className="space-y-2 text-white/40 text-xs leading-relaxed">
              <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Vào trang <strong className="text-white/60">Hồ sơ</strong></p>
              <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Nhấn nút <strong className="text-white/60">"Chia sẻ hồ sơ"</strong></p>
              <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Gửi link cho bạn bè</p>
              <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Bạn bè dán link vào đây để so sánh</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
