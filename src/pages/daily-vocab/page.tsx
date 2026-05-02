import { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/lib/supabase";
import { useAudioCache } from "@/hooks/useAudioCache";

interface VocabEntry {
  id: string;
  korean: string;
  vietnamese: string;
  pronunciation: string;
  examples: { sentence: string; translation: string }[];
  category: string;
  difficulty: number;
  hanja?: string;
}

// ─── Seeded random (same 5 words per day) ────────────────────────────────────
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function getDailyWords(all: VocabEntry[], count = 5): VocabEntry[] {
  if (all.length === 0) return [];
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const rand = seededRandom(seed);
  const shuffled = [...all].sort(() => rand() - 0.5);
  return shuffled.slice(0, count);
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────
function DiffBadge({ d }: { d: number }) {
  const map = [
    { label: "Cơ bản", color: "#34d399" },
    { label: "Trung cấp", color: "app-accent-primary" },
    { label: "Nâng cao", color: "#f87171" },
  ];
  const info = map[Math.min(d - 1, 2)] || map[0];
  return (
    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${info.color}15`, color: info.color }}>
      {info.label}
    </span>
  );
}

// ─── Vocab Card ───────────────────────────────────────────────────────────────
function DailyVocabCard({
  word, index, isRevealed, onReveal, isLearned, onLearn,
}: {
  word: VocabEntry; index: number; isRevealed: boolean;
  onReveal: () => void; isLearned: boolean; onLearn: () => void;
}) {
  const { playKorean } = useAudioCache();
  const [showExample, setShowExample] = useState(false);

  return (
    <div className={`bg-app-bg border rounded-2xl p-5 transition-all ${isLearned ? "border-emerald-500/25" : "border-app-border hover:border-app-border"}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: "rgba(232,200,74,0.12)", color: "app-accent-primary" }}>
            {index + 1}
          </div>
          <DiffBadge d={word.difficulty} />
          {word.category && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-app-card/50 text-white/35">{word.category}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => playKorean(word.korean)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 cursor-pointer transition-colors">
            <i className="ri-volume-up-line text-app-text-secondary text-xs"></i>
          </button>
          <button onClick={onLearn} className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${isLearned ? "bg-app-accent-success/15" : "bg-app-card/50 hover:bg-app-card/70"}`}>
            <i className={`${isLearned ? "ri-checkbox-circle-fill text-app-accent-success" : "ri-checkbox-blank-circle-line text-app-text-muted"} text-xs`}></i>
          </button>
        </div>
      </div>

      {/* Korean word */}
      <div className="mb-3">
        <p className="text-white font-bold text-3xl mb-1">{word.korean}</p>
        {word.hanja && <p className="text-app-text-muted text-sm">{word.hanja}</p>}
        <p className="text-app-text-muted text-sm font-mono">[{word.pronunciation}]</p>
      </div>

      {/* Meaning — reveal on click */}
      {isRevealed ? (
        <div>
          <p className="text-app-accent-primary text-lg font-bold mb-2">{word.vietnamese}</p>
          {word.examples && word.examples.length > 0 && (
            <div>
              <button onClick={() => setShowExample(v => !v)} className="text-[10px] text-app-text-muted hover:text-white/50 cursor-pointer whitespace-nowrap transition-colors">
                {showExample ? "Ẩn ví dụ" : "Xem ví dụ"} <i className={`${showExample ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
              </button>
              {showExample && (
                <div className="mt-2 bg-app-surface/50 rounded-xl p-3">
                  <p className="text-white/55 text-sm">{word.examples[0].sentence}</p>
                  <p className="text-app-text-muted text-xs italic mt-1">{word.examples[0].translation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onReveal}
          className="w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap transition-all"
          style={{ backgroundColor: "rgba(232,200,74,0.08)", color: "rgba(232,200,74,0.6)", border: "1px solid rgba(232,200,74,0.15)" }}
        >
          <i className="ri-eye-line mr-2"></i>Xem nghĩa
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DailyVocabPage() {
  const [allVocab, setAllVocab] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useLocalStorage<Record<string, boolean>>("kts_daily_revealed", {});
  const [learned, setLearned] = useLocalStorage<Record<string, boolean>>("kts_daily_learned", {});
  const [notifEnabled, setNotifEnabled] = useLocalStorage<boolean>("kts_daily_notif", false);
  const [streak, setStreak] = useLocalStorage<{ count: number; lastDate: string }>("kts_daily_vocab_streak", { count: 0, lastDate: "" });

  const today = new Date().toISOString().split("T")[0];
  const todayKey = `daily_${today}`;

  // Load from Supabase
  useEffect(() => {
    supabase.from("hanja_vocab_entries").select("id, korean, vietnamese, pronunciation, examples, category, difficulty, hanja").then(({ data }) => {
      if (data && data.length > 0) {
        setAllVocab(data as VocabEntry[]);
      }
      setLoading(false);
    });
  }, []);

  const dailyWords = useMemo(() => getDailyWords(allVocab, 5), [allVocab]);

  // Update streak
  useEffect(() => {
    if (dailyWords.length === 0) return;
    const allLearned = dailyWords.every(w => learned[`${todayKey}_${w.id}`]);
    if (allLearned && streak.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1;
      setStreak({ count: newCount, lastDate: today });
    }
  }, [learned, dailyWords, today]);

  const handleReveal = useCallback((id: string) => {
    setRevealed(prev => ({ ...prev, [`${todayKey}_${id}`]: true }));
  }, [todayKey]);

  const handleLearn = useCallback((id: string) => {
    setLearned(prev => ({ ...prev, [`${todayKey}_${id}`]: !prev[`${todayKey}_${id}`] }));
  }, [todayKey]);

  const handleRevealAll = () => {
    const updates: Record<string, boolean> = {};
    dailyWords.forEach(w => { updates[`${todayKey}_${w.id}`] = true; });
    setRevealed(prev => ({ ...prev, ...updates }));
  };

  const learnedCount = dailyWords.filter(w => learned[`${todayKey}_${w.id}`]).length;
  const revealedCount = dailyWords.filter(w => revealed[`${todayKey}_${w.id}`]).length;
  const progress = dailyWords.length > 0 ? Math.round((learnedCount / dailyWords.length) * 100) : 0;

  const handleNotif = async () => {
    if (!notifEnabled) {
      if ("Notification" in window) {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          setNotifEnabled(true);
          new Notification("Hàn Quốc Ơi! 🇰🇷", {
            body: "Bật nhắc nhở thành công! Bạn sẽ nhận thông báo học từ vựng mỗi ngày lúc 8:00 sáng.",
            icon: "/favicon.ico",
          });
        }
      }
    } else {
      setNotifEnabled(false);
    }
  };

  const todayStr = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <DashboardLayout
      title="Từ vựng theo ngày"
      subtitle={`${todayStr} — 5 từ mới mỗi ngày từ Supabase`}
      actions={
        <button
          onClick={handleNotif}
          className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap font-medium ${notifEnabled ? "bg-app-accent-primary/15 text-app-accent-primary border border-app-accent-primary/25" : "bg-app-card/50 text-white/50 border border-app-border hover:bg-white/8"}`}
        >
          <i className={`${notifEnabled ? "ri-notification-fill" : "ri-notification-line"} text-sm`}></i>
          {notifEnabled ? "Đang nhắc nhở" : "Bật nhắc nhở"}
        </button>
      }
    >
      {/* Progress header */}
      <div className="bg-gradient-to-r from-app-surface to-[#0f1117] border border-app-accent-primary/10 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(232,200,74,0.12)" }}>
              <i className="ri-sun-line text-app-accent-primary text-2xl"></i>
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Từ vựng hôm nay</h2>
              <p className="text-app-text-secondary text-xs">{learnedCount}/{dailyWords.length} từ đã thuộc · Streak: {streak.count} ngày</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-app-accent-primary font-bold text-2xl">{progress}%</p>
              <p className="text-app-text-muted text-xs">hoàn thành</p>
            </div>
            <button onClick={handleRevealAll} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs cursor-pointer whitespace-nowrap transition-colors" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <i className="ri-eye-line"></i>Lật tất cả
            </button>
          </div>
        </div>
        <div className="h-2 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: progress === 100 ? "#34d399" : "app-accent-primary" }}></div>
        </div>
        {progress === 100 && (
          <div className="mt-3 flex items-center gap-2 text-app-accent-success text-sm">
            <i className="ri-checkbox-circle-fill"></i>
            <span className="font-semibold">Xuất sắc! Bạn đã học xong 5 từ hôm nay! 🎉</span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Từ hôm nay", value: dailyWords.length, icon: "ri-book-open-line", color: "app-accent-primary" },
          { label: "Đã xem nghĩa", value: revealedCount, icon: "ri-eye-line", color: "#60a5fa" },
          { label: "Đã thuộc", value: learnedCount, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Streak", value: `${streak.count} ngày`, icon: "ri-fire-line", color: "#fb923c" },
        ].map(s => (
          <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-base`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-white/35 text-xs">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Daily words */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>
        </div>
      ) : dailyWords.length === 0 ? (
        <div className="text-center py-16 bg-app-bg border border-app-border rounded-2xl">
          <i className="ri-database-line text-app-text-muted text-4xl mb-3 block"></i>
          <p className="text-app-text-muted text-sm">Chưa có từ vựng trong database</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {dailyWords.map((word, i) => (
            <DailyVocabCard
              key={word.id}
              word={word}
              index={i}
              isRevealed={!!revealed[`${todayKey}_${word.id}`]}
              onReveal={() => handleReveal(word.id)}
              isLearned={!!learned[`${todayKey}_${word.id}`]}
              onLearn={() => handleLearn(word.id)}
            />
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-app-bg border border-app-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <i className="ri-information-line text-app-text-muted text-sm"></i>
          <h4 className="text-white/50 text-sm font-medium">Về tính năng này</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-white/35">
          <div className="flex items-start gap-2">
            <i className="ri-database-2-line text-app-accent-primary mt-0.5 flex-shrink-0"></i>
            <span>Từ vựng được lấy trực tiếp từ Supabase — dữ liệu thật, không mất khi reload</span>
          </div>
          <div className="flex items-start gap-2">
            <i className="ri-calendar-line text-[#34d399] mt-0.5 flex-shrink-0"></i>
            <span>5 từ mới mỗi ngày — thay đổi lúc 0:00 theo thuật toán seeded random</span>
          </div>
          <div className="flex items-start gap-2">
            <i className="ri-notification-line text-[#60a5fa] mt-0.5 flex-shrink-0"></i>
            <span>Bật nhắc nhở để nhận push notification học từ vựng mỗi sáng 8:00</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


