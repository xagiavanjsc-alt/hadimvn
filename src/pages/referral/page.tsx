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

const XP_PER_REFERRAL = 100;
const MILESTONE_REWARDS = [
  { count: 1,  xp: 100,  label: "Ngu?i m?i d?u tiên",  icon: "ri-user-add-line",    color: "#34d399" },
  { count: 3,  xp: 300,  label: "Nhóm h?c nh?",        icon: "ri-group-line",       color: "app-accent-primary" },
  { count: 5,  xp: 600,  label: "Ð?i s? h?c t?p",      icon: "ri-medal-line",       color: "#fb923c" },
  { count: 10, xp: 1500, label: "Huy?n tho?i m?i b?n", icon: "ri-vip-crown-line",   color: "#a78bfa" },
];

function generateReferralCode(userId: string): string {
  // Simple deterministic code from userId — HQO = Hàn Qu?c Oi
  const base = userId ? userId.slice(-6).toUpperCase() : "GUEST1";
  return `HQO-${base}`;
}

export default function ReferralPage() {
  const { user } = useAuth();
  const { awardXP } = useXPSystem();
  const [referrals] = useLocalStorage<ReferralRecord[]>("kts_referrals", []);
  const [claimedMilestones, setClaimedMilestones] = useLocalStorage<number[]>("kts_referral_milestones_claimed", []);
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

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
    { platform: "Facebook", icon: "ri-facebook-fill", color: "#1877f2", text: `Mình dang h?c ti?ng Hàn trên Hàn Qu?c Oi! Dùng mã ${referralCode} d? nh?n 50 XP mi?n phí khi dang ký. ${referralLink}` },
    { platform: "Zalo", icon: "ri-message-2-line", color: "#0068ff", text: `H?c ti?ng Hàn cùng mình nhé! Dùng link này d? nh?n 50 XP: ${referralLink}` },
    { platform: "Copy tin nh?n", icon: "ri-chat-quote-line", color: "#34d399", text: `B?n oi, mình dang h?c ti?ng Hàn trên Hàn Qu?c Oi r?t hay! Ðang ký qua link ${referralLink} (mã: ${referralCode}) d? c? hai cùng nh?n XP thu?ng nhé!` },
  ];

  return (
    <DashboardLayout
      title="M?i b?n bè"
      subtitle="Chia s? link m?i — b?n bè dang ký du?c +50 XP, b?n nh?n +100 XP"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left main */}
        <div className="space-y-6">
          {/* Referral link card */}
          <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-app-accent-primary/15">
                <i className="ri-gift-2-line text-app-accent-primary text-2xl"></i>
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Link m?i c?a b?n</h3>
                <p className="text-app-text-secondary text-xs">Chia s? link này d? nh?n XP thu?ng</p>
              </div>
            </div>

            {/* Referral code */}
            <div className="mb-4">
              <p className="text-app-text-muted text-xs mb-2">Mã gi?i thi?u</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3 bg-app-card/50 border border-app-accent-primary/20 rounded-xl px-4 py-3">
                  <i className="ri-coupon-3-line text-app-accent-primary text-lg"></i>
                  <span className="text-app-accent-primary font-bold text-xl tracking-widest">{referralCode}</span>
                </div>
                <button
                  onClick={() => handleCopy("code")}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-app-accent-primary/25 bg-app-accent-primary/10 text-app-accent-primary text-sm font-semibold cursor-pointer whitespace-nowrap hover:bg-app-accent-primary/20 transition-colors"
                >
                  {copied === "code" ? <><i className="ri-checkbox-circle-fill"></i>Ðã copy!</> : <><i className="ri-file-copy-line"></i>Copy mã</>}
                </button>
              </div>
            </div>

            {/* Referral link */}
            <div className="mb-5">
              <p className="text-app-text-muted text-xs mb-2">Link m?i d?y d?</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-app-card/50 border border-app-border rounded-xl px-3 py-2.5 overflow-hidden">
                  <i className="ri-link text-app-text-muted text-sm flex-shrink-0"></i>
                  <span className="text-white/50 text-xs truncate">{referralLink}</span>
                </div>
                <button
                  onClick={() => handleCopy("link")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-app-border bg-app-card/50 text-white/60 text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-app-card/70 transition-colors"
                >
                  {copied === "link" ? <><i className="ri-checkbox-circle-fill text-app-accent-success"></i><span className="text-app-accent-success">Ðã copy!</span></> : <><i className="ri-file-copy-line"></i>Copy link</>}
                </button>
              </div>
            </div>

            {/* Share buttons */}
            <div>
              <p className="text-app-text-muted text-xs mb-3">Chia s? nhanh</p>
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
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Cách ho?t d?ng</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "1", icon: "ri-share-line", color: "app-accent-primary", title: "Chia s? link", desc: "G?i link m?i ho?c mã gi?i thi?u cho b?n bè" },
                { step: "2", icon: "ri-user-add-line", color: "#34d399", title: "B?n dang ký", desc: "B?n bè dang ký tài kho?n qua link c?a b?n" },
                { step: "3", icon: "ri-star-fill", color: "#fb923c", title: "C? hai nh?n XP", desc: "B?n +100 XP, b?n bè +50 XP ngay l?p t?c" },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl mx-auto mb-3" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-xl`} style={{ color: s.color }}></i>
                  </div>
                  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-app-card/70 text-white/50 text-[10px] font-bold mx-auto mb-2">{s.step}</div>
                  <p className="text-white font-semibold text-xs mb-1">{s.title}</p>
                  <p className="text-white/35 text-[10px] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Referred friends list */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">B?n bè dã m?i ({referrals.length})</h3>
              <div className="flex items-center gap-2">
                {activeReferrals.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-app-accent-success/15 text-app-accent-success">{activeReferrals.length} ho?t d?ng</span>
                )}
                {pendingReferrals.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fb923c]/15 text-[#fb923c]">{pendingReferrals.length} ch? xác nh?n</span>
                )}
              </div>
            </div>

            {referrals.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-app-card/50 mx-auto mb-3">
                  <i className="ri-user-add-line text-app-text-muted text-2xl"></i>
                </div>
                <p className="text-app-text-muted text-sm">Chua có b?n bè nào du?c m?i</p>
                <p className="text-app-text-muted text-xs mt-1">Chia s? link ? trên d? b?t d?u!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {referrals.map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/2 hover:bg-white/4 transition-colors">
                    <div className={`w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 ${r.status === "active" ? "bg-app-accent-success/15" : "bg-[#fb923c]/15"}`}>
                      <i className={`ri-user-line text-sm ${r.status === "active" ? "text-app-accent-success" : "text-[#fb923c]"}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-sm font-medium">{r.name}</p>
                      <p className="text-app-text-muted text-[10px]">
                        Tham gia {new Date(r.joinedAt).toLocaleDateString("vi-VN")} ·{" "}
                        <span className={r.status === "active" ? "text-app-accent-success" : "text-[#fb923c]"}>
                          {r.status === "active" ? "Ðang ho?t d?ng" : "Ch? xác nh?n"}
                        </span>
                      </p>
                    </div>
                    {r.xpAwarded ? (
                      <span className="text-[10px] font-bold text-app-accent-primary whitespace-nowrap">+{XP_PER_REFERRAL} XP ?</span>
                    ) : (
                      <span className="text-[10px] text-app-text-muted whitespace-nowrap">Ch?...</span>
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
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Th?ng kê m?i b?n</h3>
            <div className="space-y-3">
              {[
                { label: "T?ng b?n dã m?i", value: referrals.length, color: "app-accent-primary" },
                { label: "Ðang ho?t d?ng", value: activeReferrals.length, color: "#34d399" },
                { label: "Ch? xác nh?n", value: pendingReferrals.length, color: "#fb923c" },
                { label: "XP dã nh?n", value: `${totalXPEarned} XP`, color: "#a78bfa" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-app-text-secondary text-xs">{s.label}</span>
                  <span className="font-bold text-sm" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">M?c thu?ng</h3>
            <div className="space-y-3">
              {MILESTONE_REWARDS.map(m => {
                const reached = activeReferrals.length >= m.count;
                const claimed = claimedMilestones.includes(m.count);
                return (
                  <div
                    key={m.count}
                    className={`p-3 rounded-xl border transition-all ${reached ? (claimed ? "border-app-border bg-white/2" : "border-emerald-500/25 bg-emerald-500/5") : "border-app-border opacity-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${m.color}15` }}>
                        <i className={`${m.icon} text-base`} style={{ color: m.color }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-xs font-semibold">{m.label}</p>
                        <p className="text-app-text-muted text-[10px]">{m.count} b?n bè · +{m.xp} XP</p>
                      </div>
                      {reached && !claimed ? (
                        <button
                          onClick={() => handleClaimMilestone(m.count, m.xp)}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                          style={{ backgroundColor: `${m.color}15`, color: m.color, border: `1px solid ${m.color}25` }}
                        >
                          Nh?n!
                        </button>
                      ) : claimed ? (
                        <i className="ri-checkbox-circle-fill text-app-accent-success text-base"></i>
                      ) : (
                        <span className="text-app-text-muted text-[10px] whitespace-nowrap">{activeReferrals.length}/{m.count}</span>
                      )}
                    </div>
                    {!claimed && (
                      <div className="mt-2 h-1 bg-app-card/50 rounded-full overflow-hidden">
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
            <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-flag-line text-app-accent-primary text-sm"></i>
                <h3 className="text-white font-semibold text-sm">M?c ti?p theo</h3>
              </div>
              <p className="text-app-text-secondary text-xs leading-relaxed">
                M?i thêm <strong className="text-white/70">{nextMilestone.count - activeReferrals.length} b?n</strong> d? d?t m?c <strong style={{ color: nextMilestone.color }}>{nextMilestone.label}</strong> và nh?n <strong className="text-app-accent-primary">+{nextMilestone.xp} XP</strong>!
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}


