import { useState, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { useXPSystem } from "@/hooks/useXPSystem";

interface ReferralRecord {
  id: string;
  name: string;
  joinedAt: string;
  xpAwarded: boolean;
  status: "active" | "pending";
}

// Mock referred friends
const MOCK_REFERRALS: ReferralRecord[] = [
  { id: "r1", name: "Nguyễn Thị Mai", joinedAt: "2026-04-10", xpAwarded: true, status: "active" },
  { id: "r2", name: "Trần Văn Hùng", joinedAt: "2026-04-08", xpAwarded: true, status: "active" },
  { id: "r3", name: "Lê Thị Lan", joinedAt: "2026-04-05", xpAwarded: true, status: "active" },
  { id: "r4", name: "Phạm Minh Đức", joinedAt: "2026-04-01", xpAwarded: false, status: "pending" },
];

const XP_PER_REFERRAL = 100;
const XP_FOR_REFERRED = 50;
const MILESTONE_REWARDS = [
  { count: 1,  xp: 100,  label: "Người mời đầu tiên",  icon: "ri-user-add-line",    color: "#34d399" },
  { count: 3,  xp: 300,  label: "Nhóm học nhỏ",        icon: "ri-group-line",       color: "#e8c84a" },
  { count: 5,  xp: 600,  label: "Đại sứ học tập",      icon: "ri-medal-line",       color: "#fb923c" },
  { count: 10, xp: 1500, label: "Huyền thoại mời bạn", icon: "ri-vip-crown-line",   color: "#a78bfa" },
];

function generateReferralCode(userId: string): string {
  // Simple deterministic code from userId — HQO = Hàn Quốc Ơi
  const base = userId ? userId.slice(-6).to() : "GUEST1";
  return `HQO-${base}`;
}

export default function ReferralPage() {
  const { user, profile } = useAuth();
  const { awardXP } = useXPSystem();
  const [referrals] = useLocalStorage<ReferralRecord[]>("kts_referrals", MOCK_REFERRALS);
  const [claimedMilestones, setClaimedMilestones] = useLocalStorage<number[]>("kts_referral_milestones_claimed", []);
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const referralCode = generateReferralCode(user?.id || "demo");
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const activeReferrals = referrals.filter(r => r.status === "active");
  const pendingReferrals = referrals.filter(r => r.status === "pending");
  const totalXPEarned = activeReferrals.filter(r => r.xpAwarded).length * XP_PER_REFERRAL;

  const handleCopy = useCallback((type: "link" | "code") => {
    const text = type === "link" ? referralLink : referralCode;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2500);
    });
  }, [referralLink, referralCode]);

  const handleClaimMilestone = useCallback((count: number, xp: number) => {
    if (claimedMilestones.includes(count)) return;
    setClaimedMilestones(prev => [...prev, count]);
    awardXP({ type: "community_post", amount: xp });
  }, [claimedMilestones, setClaimedMilestones, awardXP]);

  const nextMilestone = useMemo(() =>
    MILESTONE_REWARDS.find(m => activeReferrals.length < m.count),
    [activeReferrals.length]
  );

  const shareMessages = [
    { platform: "Facebook", icon: "ri-facebook-fill", color: "#1877f2", text: `Mình đang học tiếng Hàn trên Hàn Quốc Ơi! Dùng mã ${referralCode} để nhận 50 XP miễn phí khi đăng ký. ${referralLink}` },
    { platform: "Zalo", icon: "ri-message-2-line", color: "#0068ff", text: `Học tiếng Hàn cùng mình nhé! Dùng link này để nhận 50 XP: ${referralLink}` },
    { platform: "Copy tin nhắn", icon: "ri-chat-quote-line", color: "#34d399", text: `Bạn ơi, mình đang học tiếng Hàn trên Hàn Quốc Ơi rất hay! Đăng ký qua link ${referralLink} (mã: ${referralCode}) để cả hai cùng nhận XP thưởng nhé!` },
  ];

  return (
    <DashboardLayout
      title="Mời bạn bè"
      subtitle="Chia sẻ link mời — bạn bè đăng ký được +50 XP, bạn nhận +100 XP"
    >
      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Left main */}
        <div className="space-y-6">
          {/* Referral link card */}
          <div className="bg-gradient-to-br from-[#1a1600] to-[#0f1117] border border-[#e8c84a]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#e8c84a]/15">
                <i className="ri-gift-2-line text-[#e8c84a] text-2xl"></i>
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Link mời của bạn</h3>
                <p className="text-white/40 text-xs">Chia sẻ link này để nhận XP thưởng</p>
              </div>
            </div>

            {/* Referral code */}
            <div className="mb-4">
              <p className="text-white/30 text-xs mb-2">Mã giới thiệu</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3 bg-white/5 border border-[#e8c84a]/20 rounded-xl px-4 py-3">
                  <i className="ri-coupon-3-line text-[#e8c84a] text-lg"></i>
                  <span className="text-[#e8c84a] font-bold text-xl tracking-widest">{referralCode}</span>
                </div>
                <button
                  onClick={() => handleCopy("code")}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#e8c84a]/25 bg-[#e8c84a]/10 text-[#e8c84a] text-sm font-semibold cursor-pointer whitespace-nowrap hover:bg-[#e8c84a]/20 transition-colors"
                >
                  {copied === "code" ? <><i className="ri-checkbox-circle-fill"></i>Đã copy!</> : <><i className="ri-file-copy-line"></i>Copy mã</>}
                </button>
              </div>
            </div>

            {/* Referral link */}
            <div className="mb-5">
              <p className="text-white/30 text-xs mb-2">Link mời đầy đủ</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 overflow-hidden">
                  <i className="ri-link text-white/30 text-sm flex-shrink-0"></i>
                  <span className="text-white/50 text-xs truncate">{referralLink}</span>
                </div>
                <button
                  onClick={() => handleCopy("link")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/60 text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-white/10 transition-colors"
                >
                  {copied === "link" ? <><i className="ri-checkbox-circle-fill text-emerald-400"></i><span className="text-emerald-400">Đã copy!</span></> : <><i className="ri-file-copy-line"></i>Copy link</>}
                </button>
              </div>
            </div>

            {/* Share buttons */}
            <div>
              <p className="text-white/30 text-xs mb-3">Chia sẻ nhanh</p>
              <div className="flex gap-2 flex-wrap">
                {shareMessages.map(s => (
                  <button
                    key={s.platform}
                    onClick={() => navigator.clipboard.writeText(s.text).then(() => { setCopied("link"); setTimeout(() => setCopied(null), 2000); })}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer whitespace-nowrap transition-all border"
                    style={{ backgroundColor: `${s.color}10`, color: s.color, borderColor: `${s.color}25` }}
                  >
                    <i className={`${s.icon} text-sm`}></i>{s.platform}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Cách hoạt động</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { step: "1", icon: "ri-share-line", color: "#e8c84a", title: "Chia sẻ link", desc: "Gửi link mời hoặc mã giới thiệu cho bạn bè" },
                { step: "2", icon: "ri-user-add-line", color: "#34d399", title: "Bạn đăng ký", desc: "Bạn bè đăng ký tài khoản qua link của bạn" },
                { step: "3", icon: "ri-star-fill", color: "#fb923c", title: "Cả hai nhận XP", desc: "Bạn +100 XP, bạn bè +50 XP ngay lập tức" },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl mx-auto mb-3" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-xl`} style={{ color: s.color }}></i>
                  </div>
                  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 text-white/50 text-[10px] font-bold mx-auto mb-2">{s.step}</div>
                  <p className="text-white font-semibold text-xs mb-1">{s.title}</p>
                  <p className="text-white/35 text-[10px] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Referred friends list */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">Bạn bè đã mời ({referrals.length})</h3>
              <div className="flex items-center gap-2">
                {activeReferrals.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">{activeReferrals.length} hoạt động</span>
                )}
                {pendingReferrals.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fb923c]/15 text-[#fb923c]">{pendingReferrals.length} chờ xác nhận</span>
                )}
              </div>
            </div>

            {referrals.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 mx-auto mb-3">
                  <i className="ri-user-add-line text-white/20 text-2xl"></i>
                </div>
                <p className="text-white/30 text-sm">Chưa có bạn bè nào được mời</p>
                <p className="text-white/20 text-xs mt-1">Chia sẻ link ở trên để bắt đầu!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {referrals.map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/2 hover:bg-white/4 transition-colors">
                    <div className={`w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 ${r.status === "active" ? "bg-emerald-500/15" : "bg-[#fb923c]/15"}`}>
                      <i className={`ri-user-line text-sm ${r.status === "active" ? "text-emerald-400" : "text-[#fb923c]"}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-sm font-medium">{r.name}</p>
                      <p className="text-white/30 text-[10px]">
                        Tham gia {new Date(r.joinedAt).toLocaleDateString("vi-VN")} ·{" "}
                        <span className={r.status === "active" ? "text-emerald-400" : "text-[#fb923c]"}>
                          {r.status === "active" ? "Đang hoạt động" : "Chờ xác nhận"}
                        </span>
                      </p>
                    </div>
                    {r.xpAwarded ? (
                      <span className="text-[10px] font-bold text-[#e8c84a] whitespace-nowrap">+{XP_PER_REFERRAL} XP ✓</span>
                    ) : (
                      <span className="text-[10px] text-white/25 whitespace-nowrap">Chờ...</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Thống kê mời bạn</h3>
            <div className="space-y-3">
              {[
                { label: "Tổng bạn đã mời", value: referrals.length, color: "#e8c84a" },
                { label: "Đang hoạt động", value: activeReferrals.length, color: "#34d399" },
                { label: "Chờ xác nhận", value: pendingReferrals.length, color: "#fb923c" },
                { label: "XP đã nhận", value: `${totalXPEarned} XP`, color: "#a78bfa" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">{s.label}</span>
                  <span className="font-bold text-sm" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Mốc thưởng</h3>
            <div className="space-y-3">
              {MILESTONE_REWARDS.map(m => {
                const reached = activeReferrals.length >= m.count;
                const claimed = claimedMilestones.includes(m.count);
                return (
                  <div
                    key={m.count}
                    className={`p-3 rounded-xl border transition-all ${reached ? (claimed ? "border-white/5 bg-white/2" : "border-emerald-500/25 bg-emerald-500/5") : "border-white/5 opacity-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${m.color}15` }}>
                        <i className={`${m.icon} text-base`} style={{ color: m.color }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-xs font-semibold">{m.label}</p>
                        <p className="text-white/30 text-[10px]">{m.count} bạn bè · +{m.xp} XP</p>
                      </div>
                      {reached && !claimed ? (
                        <button
                          onClick={() => handleClaimMilestone(m.count, m.xp)}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                          style={{ backgroundColor: `${m.color}15`, color: m.color, border: `1px solid ${m.color}25` }}
                        >
                          Nhận!
                        </button>
                      ) : claimed ? (
                        <i className="ri-checkbox-circle-fill text-emerald-400 text-base"></i>
                      ) : (
                        <span className="text-white/20 text-[10px] whitespace-nowrap">{activeReferrals.length}/{m.count}</span>
                      )}
                    </div>
                    {!claimed && (
                      <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, (activeReferrals.length / m.count) * 100)}%`, backgroundColor: m.color }}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next milestone */}
          {nextMilestone && (
            <div className="bg-gradient-to-br from-[#1a1600] to-[#0f1117] border border-[#e8c84a]/15 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-flag-line text-[#e8c84a] text-sm"></i>
                <h3 className="text-white font-semibold text-sm">Mốc tiếp theo</h3>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">
                Mời thêm <strong className="text-white/70">{nextMilestone.count - activeReferrals.length} bạn</strong> để đạt mốc <strong style={{ color: nextMilestone.color }}>{nextMilestone.label}</strong> và nhận <strong className="text-[#e8c84a]">+{nextMilestone.xp} XP</strong>!
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
