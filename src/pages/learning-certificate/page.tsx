import { useState, useRef } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Certificate {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  requirement: string;
  unlocked: boolean;
  unlockedDate?: string;
  shareText: string;
}

function useCertificateData() {
  const [xpData] = useLocalStorage<{ total: number }>("kts_xp_total", { total: 0 });
  const [streak] = useLocalStorage<{ count: number }>("kts_streak", { count: 0 });
  const [epsHistory] = useLocalStorage<Array<{ score: number; total: number }>>("kts_eps_exam_history", []);
  const [vocabProgress] = useLocalStorage<Record<string, { known: boolean }>>("kts_vocab_progress", {});

  const totalXP = xpData.total || 0;
  const streakCount = streak.count || 0;
  const bestEpsScore = epsHistory.length > 0 ? Math.max(...epsHistory.map(h => Math.round((h.score / h.total) * 100))) : 0;
  const knownVocab = Object.values(vocabProgress).filter(v => v.known).length;

  return { totalXP, streakCount, bestEpsScore, knownVocab };
}

export default function LearningCertificatePage() {
  const { totalXP, streakCount, bestEpsScore, knownVocab } = useCertificateData();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const CERTIFICATES: Certificate[] = [
    {
      id: "streak_7",
      title: "H?c viên kiên trì",
      subtitle: "7 ngày liên ti?p",
      description: "Duy trì streak h?c t?p 7 ngày liên ti?p không ngh?",
      icon: "ri-fire-fill",
      color: "#ea580c",
      bgColor: "#fff7ed",
      requirement: `Streak hi?n t?i: ${streakCount}/7 ngày`,
      unlocked: streakCount >= 7,
      unlockedDate: streakCount >= 7 ? "2026-04-10" : undefined,
      shareText: "Tôi dã duy trì streak h?c ti?ng Hàn 7 ngày liên ti?p trên Hàn Qu?c Oi! ??",
    },
    {
      id: "streak_30",
      title: "Chi?n binh tháng",
      subtitle: "30 ngày liên ti?p",
      description: "Duy trì streak h?c t?p 30 ngày liên ti?p — không b? ngày nào!",
      icon: "ri-fire-fill",
      color: "#dc2626",
      bgColor: "#fef2f2",
      requirement: `Streak hi?n t?i: ${streakCount}/30 ngày`,
      unlocked: streakCount >= 30,
      unlockedDate: streakCount >= 30 ? "2026-03-15" : undefined,
      shareText: "Tôi dã h?c ti?ng Hàn 30 ngày liên ti?p không ngh? trên Hàn Qu?c Oi! ??",
    },
    {
      id: "streak_100",
      title: "Huy?n tho?i 100 ngày",
      subtitle: "100 ngày liên ti?p",
      description: "Thành tích hi?m có — 100 ngày h?c ti?ng Hàn không gián do?n",
      icon: "ri-award-fill",
      color: "#d97706",
      bgColor: "#fffbeb",
      requirement: `Streak hi?n t?i: ${streakCount}/100 ngày`,
      unlocked: streakCount >= 100,
      shareText: "Tôi dã chinh ph?c 100 ngày h?c ti?ng Hàn liên ti?p trên Hàn Qu?c Oi! ??",
    },
    {
      id: "eps_60",
      title: "Vu?t ngu?ng EPS",
      subtitle: "Ði?m EPS = 60%",
      description: "Ð?t di?m thi th? EPS-TOPIK t? 60% tr? lên",
      icon: "ri-medal-fill",
      color: "#059669",
      bgColor: "#f0fdf4",
      requirement: `Ði?m cao nh?t: ${bestEpsScore}%/60%`,
      unlocked: bestEpsScore >= 60,
      unlockedDate: bestEpsScore >= 60 ? "2026-04-05" : undefined,
      shareText: `Tôi dã d?t ${bestEpsScore}% trong bài thi th? EPS-TOPIK trên Hàn Qu?c Oi! ??`,
    },
    {
      id: "eps_80",
      title: "Xu?t s?c EPS",
      subtitle: "Ði?m EPS = 80%",
      description: "Ð?t di?m thi th? EPS-TOPIK t? 80% tr? lên — s?n sàng thi th?t!",
      icon: "ri-trophy-fill",
      color: "#7c3aed",
      bgColor: "#f5f3ff",
      requirement: `Ði?m cao nh?t: ${bestEpsScore}%/80%`,
      unlocked: bestEpsScore >= 80,
      unlockedDate: bestEpsScore >= 80 ? "2026-04-12" : undefined,
      shareText: `Tôi dã d?t ${bestEpsScore}% trong bài thi th? EPS-TOPIK — s?n sàng thi th?t! ??`,
    },
    {
      id: "vocab_100",
      title: "T? v?ng co b?n",
      subtitle: "100 t? v?ng",
      description: "H?c thu?c 100 t? v?ng ti?ng Hàn d?u tiên",
      icon: "ri-book-fill",
      color: "#0891b2",
      bgColor: "#ecfeff",
      requirement: `T? dã thu?c: ${knownVocab}/100`,
      unlocked: knownVocab >= 100,
      unlockedDate: knownVocab >= 100 ? "2026-03-20" : undefined,
      shareText: "Tôi dã h?c thu?c 100 t? v?ng ti?ng Hàn trên Hàn Qu?c Oi! ??",
    },
    {
      id: "vocab_500",
      title: "T? v?ng nâng cao",
      subtitle: "500 t? v?ng",
      description: "H?c thu?c 500 t? v?ng — d? d? giao ti?p co b?n v?i ngu?i Hàn",
      icon: "ri-book-3-fill",
      color: "#ec4899",
      bgColor: "#fdf2f8",
      requirement: `T? dã thu?c: ${knownVocab}/500`,
      unlocked: knownVocab >= 500,
      shareText: "Tôi dã h?c thu?c 500 t? v?ng ti?ng Hàn trên Hàn Qu?c Oi! ??",
    },
    {
      id: "xp_1000",
      title: "H?c viên tích c?c",
      subtitle: "1,000 XP",
      description: "Tích luy 1,000 XP t? các ho?t d?ng h?c t?p",
      icon: "ri-star-fill",
      color: "#f59e0b",
      bgColor: "#fffbeb",
      requirement: `XP hi?n t?i: ${totalXP.toLocaleString()}/1,000`,
      unlocked: totalXP >= 1000,
      unlockedDate: totalXP >= 1000 ? "2026-03-25" : undefined,
      shareText: `Tôi dã tích luy ${totalXP.toLocaleString()} XP trên Hàn Qu?c Oi! ?`,
    },
    {
      id: "xp_5000",
      title: "H?c viên xu?t s?c",
      subtitle: "5,000 XP",
      description: "Tích luy 5,000 XP — ch?ng minh s? n? l?c không ng?ng",
      icon: "ri-vip-crown-fill",
      color: "#d97706",
      bgColor: "#fffbeb",
      requirement: `XP hi?n t?i: ${totalXP.toLocaleString()}/5,000`,
      unlocked: totalXP >= 5000,
      shareText: `Tôi dã tích luy ${totalXP.toLocaleString()} XP trên Hàn Qu?c Oi! ??`,
    },
  ];

  const unlockedCerts = CERTIFICATES.filter(c => c.unlocked);
  const lockedCerts = CERTIFICATES.filter(c => !c.unlocked);

  const handleShare = (cert: Certificate) => {
    const text = `${cert.shareText}\n\nH?c ti?ng Hàn cùng t?i mình t?i Hàn Qu?c Oi! ??`;
    if (navigator.share) {
      navigator.share({ title: cert.title, text });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ch?ng ch? h?c t?p</h1>
          <p className="text-gray-500 text-sm mt-1">M? khóa ch?ng ch? khi d?t các m?c h?c t?p — chia s? thành tích v?i b?n bè!</p>
        </div>

        {/* Progress summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Ðã m? khóa", value: `${unlockedCerts.length}/${CERTIFICATES.length}`, icon: "ri-award-line", color: "#d97706" },
            { label: "Streak hi?n t?i", value: `${streakCount} ngày`, icon: "ri-fire-line", color: "#ea580c" },
            { label: "Ði?m EPS cao nh?t", value: `${bestEpsScore}%`, icon: "ri-trophy-line", color: "#7c3aed" },
            { label: "T?ng XP", value: totalXP.toLocaleString(), icon: "ri-star-line", color: "#f59e0b" },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                  <i className={`${stat.icon} text-sm`} style={{ color: stat.color }}></i>
                </div>
                <p className="text-gray-400 text-xs">{stat.label}</p>
              </div>
              <p className="text-gray-800 font-bold text-lg">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Unlocked certificates */}
        {unlockedCerts.length > 0 && (
          <div>
            <h2 className="text-gray-700 font-bold text-base mb-4 flex items-center gap-2">
              <i className="ri-award-fill text-amber-500"></i>
              Ch?ng ch? dã m? khóa ({unlockedCerts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedCerts.map(cert => (
                <div
                  key={cert.id}
                  className="border-2 rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-all"
                  style={{ backgroundColor: cert.bgColor, borderColor: cert.color + "40" }}
                  onClick={() => setSelectedCert(cert)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: cert.color + "20" }}>
                      <i className={`${cert.icon} text-2xl`} style={{ color: cert.color }}></i>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: cert.color + "15", color: cert.color }}>
                      Ðã m? khóa ?
                    </span>
                  </div>
                  <h3 className="text-gray-800 font-bold text-base mb-0.5">{cert.title}</h3>
                  <p className="text-sm font-medium mb-2" style={{ color: cert.color }}>{cert.subtitle}</p>
                  <p className="text-gray-500 text-xs leading-relaxed mb-3">{cert.description}</p>
                  {cert.unlockedDate && (
                    <p className="text-gray-400 text-xs">Ð?t du?c: {new Date(cert.unlockedDate).toLocaleDateString("vi-VN")}</p>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShare(cert); }}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                    style={{ backgroundColor: cert.color + "15", color: cert.color }}
                  >
                    <i className="ri-share-line"></i>
                    Chia s? thành tích
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked certificates */}
        <div>
          <h2 className="text-gray-700 font-bold text-base mb-4 flex items-center gap-2">
            <i className="ri-lock-line text-gray-400"></i>
            Ch?ng ch? chua m? khóa ({lockedCerts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedCerts.map(cert => (
              <div key={cert.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 opacity-70">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200 flex items-center justify-center">
                    <i className="ri-lock-line text-gray-400 text-xl"></i>
                  </div>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Chua m?</span>
                </div>
                <h3 className="text-gray-600 font-bold text-base mb-0.5">{cert.title}</h3>
                <p className="text-gray-400 text-sm font-medium mb-2">{cert.subtitle}</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-3">{cert.description}</p>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <p className="text-gray-500 text-xs font-medium">{cert.requirement}</p>
                  {cert.id.startsWith("streak") && (
                    <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-400 transition-all"
                        style={{ width: `${Math.min(100, (streakCount / parseInt(cert.subtitle)) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificate detail modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
            {/* Certificate card */}
            <div ref={certRef} className="p-8 text-center" style={{ backgroundColor: selectedCert.bgColor }}>
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-px flex-1" style={{ backgroundColor: selectedCert.color + "40" }}></div>
                <span className="text-xs font-bold tracking-normal" style={{ color: selectedCert.color }}>Hàn Qu?c Oi!</span>
                <div className="h-px flex-1" style={{ backgroundColor: selectedCert.color + "40" }}></div>
              </div>

              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: selectedCert.color + "20" }}>
                <i className={`${selectedCert.icon} text-4xl`} style={{ color: selectedCert.color }}></i>
              </div>

              <p className="text-gray-500 text-sm mb-1">Ch?ng nh?n</p>
              <h2 className="text-gray-900 font-extrabold text-2xl mb-1">{selectedCert.title}</h2>
              <p className="font-bold text-lg mb-3" style={{ color: selectedCert.color }}>{selectedCert.subtitle}</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{selectedCert.description}</p>

              {selectedCert.unlockedDate && (
                <p className="text-gray-400 text-xs">Ð?t du?c ngày {new Date(selectedCert.unlockedDate).toLocaleDateString("vi-VN")}</p>
              )}

              <div className="flex items-center justify-center gap-2 mt-6">
                <div className="h-px flex-1" style={{ backgroundColor: selectedCert.color + "40" }}></div>
                <i className="ri-leaf-line text-sm" style={{ color: selectedCert.color }}></i>
                <div className="h-px flex-1" style={{ backgroundColor: selectedCert.color + "40" }}></div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 space-y-3">
              <button
                onClick={() => handleShare(selectedCert)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-colors whitespace-nowrap cursor-pointer"
                style={{ backgroundColor: selectedCert.color }}
              >
                <i className="ri-share-line"></i>
                {copied ? "Ðã copy link!" : "Chia s? thành tích"}
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="w-full py-3 rounded-xl font-medium text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                Ðóng
              </button>
            </div>
          </div>
        </div>
      )}

      {copied && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <i className="ri-check-line text-app-accent-success"></i>
          Ðã copy vào clipboard!
        </div>
      )}
    </DashboardLayout>
  );
}
