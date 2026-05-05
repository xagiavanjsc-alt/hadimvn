import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { useXPSystem } from "@/hooks/useXPSystem";
import { RANKS } from "@/data/ranks";
import { supabase } from "@/lib/supabase";
import { HANJA_DATA } from "@/mocks/hanjaData";
import { sanitizeHtml } from "@/lib/sanitize";

const ADMIN_KEY = "kts_admin_mode";

function getInitial(korean: string): string {
  const code = korean.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return "기타";
  const idx = Math.floor(code / 588);
  const initials = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  return initials[idx] || "기타";
}

function AdminPanel() {
  const [srData] = useState<Record<string, { interval: number; totalReviews: number; correctStreak?: number; dueDate?: number }>>(() => {
    try { return JSON.parse(localStorage.getItem("hanja_sr_data") || "{}"); } catch { return {}; }
  });
  const [adminSubTab, setAdminSubTab] = useState<"overview" | "chart" | "quiz" | "groups" | "content" | "grant_xp" | "redemptions">("overview");

  const ALPHA_GROUPS = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

  const groupStats = useMemo(() => {
    return ALPHA_GROUPS.map(alpha => {
      const words = HANJA_DATA.filter(e => getInitial(e.korean) === alpha);
      const mastered = words.filter(e => { const c = srData[e.korean]; return c && c.interval >= 21; }).length;
      const learning = words.filter(e => { const c = srData[e.korean]; return c && c.interval < 21; }).length;
      const pct = words.length > 0 ? Math.round((mastered / words.length) * 100) : 0;
      return { alpha, total: words.length, mastered, learning, unlearned: words.length - mastered - learning, pct };
    }).filter(g => g.total > 0);
  }, [srData]);

  const totalWords = HANJA_DATA.length;
  const totalMastered = Object.values(srData).filter(c => c.interval >= 21).length;
  const totalLearning = Object.values(srData).filter(c => c.interval < 21).length;
  const totalReviews = Object.values(srData).reduce((sum, c) => sum + (c.totalReviews || 0), 0);

  // 30-day activity chart from hanja_streak history
  const activityData = useMemo(() => {
    try {
      const streakRaw = JSON.parse(localStorage.getItem("hanja_streak") || "{}");
      const history: Record<string, number> = streakRaw.history || {};
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(Date.now() - (29 - i) * 86400000);
        const key = d.toISOString().slice(0, 10);
        return { date: key, label: `${d.getMonth() + 1}/${d.getDate()}`, count: history[key] || 0 };
      });
    } catch { return []; }
  }, []);
  const maxActivity = Math.max(...activityData.map(d => d.count), 1);

  // Words reviewed most (hardest words — low correctStreak, high totalReviews)
  const hardestWords = useMemo(() => {
    return Object.entries(srData)
      .filter(([, c]) => c.totalReviews >= 2)
      .map(([korean, c]) => {
        const entry = HANJA_DATA.find(e => e.korean === korean);
        const failRate = c.totalReviews > 0 ? Math.round((1 - (c.correctStreak || 0) / c.totalReviews) * 100) : 0;
        return { korean, hanja: entry?.hanja || "", vietnamese: entry?.vietnamese || "", totalReviews: c.totalReviews, correctStreak: c.correctStreak || 0, failRate };
      })
      .sort((a, b) => b.totalReviews - a.totalReviews)
      .slice(0, 15);
  }, [srData]);

  const xpData = useMemo(() => { try { return parseInt(localStorage.getItem("kts_total_xp") || "0", 10); } catch { return 0; } }, []);
  const streakData = useMemo(() => { try { return JSON.parse(localStorage.getItem("hanja_streak") || "{}"); } catch { return {}; } }, []);

  const subTabs = [
    { key: "overview" as const, label: "Tổng quan", icon: "ri-dashboard-line" },
    { key: "chart" as const, label: "Biểu đồ", icon: "ri-bar-chart-2-line" },
    { key: "quiz" as const, label: "Quiz khó", icon: "ri-error-warning-line" },
    { key: "groups" as const, label: "Nhóm từ", icon: "ri-group-line" },
    { key: "content" as const, label: "Nội dung", icon: "ri-file-list-3-line" },
    { key: "grant_xp" as const, label: "Trao XP", icon: "ri-gift-line" },
    { key: "redemptions" as const, label: "Duyệt VIP", icon: "ri-vip-crown-line" },
  ];

  // Content management data
  const contentStats = useMemo(() => {
    const favs = (() => { try { return JSON.parse(localStorage.getItem("hanja_favorites") || "[]"); } catch { return []; } })();
    const notes = (() => { try { return JSON.parse(localStorage.getItem("hanja_notes") || "{}"); } catch { return {}; } })();
    const weeklyChallenge = (() => { try { return JSON.parse(localStorage.getItem("hanja_weekly_challenge") || "null"); } catch { return null; } })();
    const topikHistory = (() => { try { return JSON.parse(localStorage.getItem("hanja_topik_history") || "[]"); } catch { return []; } })();
    const pronunciationHistory = (() => { try { return JSON.parse(localStorage.getItem("hanja_pronunciation_history") || "[]"); } catch { return []; } })();
    return {
      favCount: Array.isArray(favs) ? favs.length : 0,
      noteCount: Object.keys(notes).length,
      hasWeeklyChallenge: !!weeklyChallenge,
      topikExams: Array.isArray(topikHistory) ? topikHistory.length : 0,
      pronunciationSessions: Array.isArray(pronunciationHistory) ? pronunciationHistory.length : 0,
    };
  }, []);

  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      {/* Admin warning */}
      <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
        <i className="ri-shield-keyhole-line text-amber-500"></i>
        <p className="text-amber-600 text-sm font-medium">Chế độ Admin — Chỉ hiển thị cho quản trị viên</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-app-surface/50 p-1 rounded-xl w-fit flex-wrap">
        {subTabs.map(t => (
          <button key={t.key} onClick={() => setAdminSubTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${adminSubTab === t.key ? "bg-amber-500 text-white" : "text-app-text-secondary hover:text-white/60"}`}>
            <i className={t.icon}></i>{t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {adminSubTab === "overview" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Tổng từ Hán Hàn", value: totalWords.toLocaleString(), icon: "ri-translate-2", color: "app-accent-primary" },
              { label: "Đã thuộc", value: totalMastered, icon: "ri-check-double-line", color: "#34d399" },
              { label: "Đang học", value: totalLearning, icon: "ri-book-open-line", color: "#fb923c" },
              { label: "Tổng lần ôn", value: totalReviews.toLocaleString(), icon: "ri-refresh-line", color: "#a78bfa" },
            ].map(s => (
              <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg mb-2" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-app-text-secondary text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <i className="ri-user-line text-app-text-secondary"></i>Hoạt động người dùng
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "XP tích lũy", value: xpData.toLocaleString() + " XP", color: "app-accent-primary" },
                { label: "Streak hiện tại", value: (streakData?.currentStreak || 0) + " ngày", color: "#fb923c" },
                { label: "% hoàn thành", value: totalWords > 0 ? Math.round((totalMastered / totalWords) * 100) + "%" : "0%", color: "#34d399" },
              ].map(s => (
                <div key={s.label} className="text-center bg-app-surface/50 rounded-xl p-3">
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-app-text-muted text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <i className="ri-settings-3-line text-app-text-secondary"></i>Quản lý nhanh
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Reset dữ liệu học Hán Hàn", icon: "ri-delete-bin-line", color: "#ef4444", action: () => { if (confirm("Reset toàn bộ dữ liệu học Hán Hàn?")) { localStorage.removeItem("hanja_sr_data"); window.location.reload(); } } },
                { label: "Reset XP & Streak", icon: "ri-refresh-line", color: "#fb923c", action: () => { if (confirm("Reset XP và streak?")) { localStorage.removeItem("kts_total_xp"); localStorage.removeItem("kts_streak"); window.location.reload(); } } },
                { label: "Xem dữ liệu SR (JSON)", icon: "ri-code-line", color: "#a78bfa", action: () => { const d = localStorage.getItem("hanja_sr_data"); alert(d ? `${Object.keys(JSON.parse(d)).length} từ đã học` : "Chưa có dữ liệu"); } },
                { label: "Xuất báo cáo JSON", icon: "ri-download-line", color: "#34d399", action: () => { const data = { totalWords, totalMastered, totalLearning, totalReviews, groupStats }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "hanja-report.json"; a.click(); } },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action}
                  className="flex items-center gap-3 px-4 py-3 bg-app-surface/50 hover:bg-app-card/50 border border-app-border rounded-xl cursor-pointer transition-colors text-left">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${btn.color}15` }}>
                    <i className={`${btn.icon} text-sm`} style={{ color: btn.color }}></i>
                  </div>
                  <span className="text-white/60 text-xs">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Activity chart */}
      {adminSubTab === "chart" && (
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1 flex items-center gap-2">
            <i className="ri-bar-chart-2-line text-app-text-secondary"></i>Hoạt động học 30 ngày qua
          </h3>
          <p className="text-app-text-muted text-xs mb-5">Số từ ôn tập mỗi ngày (từ dữ liệu Spaced Repetition)</p>

          {activityData.every(d => d.count === 0) ? (
            <div className="text-center py-12">
              <i className="ri-bar-chart-2-line text-white/10 text-4xl mb-3 block"></i>
              <p className="text-app-text-muted text-sm">Chưa có dữ liệu học tập</p>
              <p className="text-app-text-muted text-xs mt-1">Bắt đầu ôn tập Spaced Repetition để xem biểu đồ</p>
            </div>
          ) : (
            <>
              {/* Bar chart */}
              <div className="flex items-end gap-1 h-40 mb-3">
                {activityData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full rounded-t transition-all cursor-default"
                      style={{
                        height: `${Math.max(4, (d.count / maxActivity) * 128)}px`,
                        backgroundColor: d.count > 0
                          ? (d.date === new Date().toISOString().slice(0, 10) ? "#f43f5e" : "#fda4af")
                          : "#1f2937"
                      }}
                    ></div>
                    {/* Tooltip */}
                    {d.count > 0 && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white text-gray-800 text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                        {d.date}: {d.count} từ
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* X-axis labels (every 5 days) */}
              <div className="flex items-center gap-1">
                {activityData.map((d, i) => (
                  <div key={i} className="flex-1 text-center">
                    {i % 5 === 0 && <span className="text-app-text-muted" style={{ fontSize: "9px" }}>{d.label}</span>}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                {[
                  { label: "Tổng từ ôn (30 ngày)", value: activityData.reduce((s, d) => s + d.count, 0), color: "#f43f5e" },
                  { label: "Ngày học nhiều nhất", value: Math.max(...activityData.map(d => d.count)), color: "#fb923c" },
                  { label: "Ngày có học", value: activityData.filter(d => d.count > 0).length, color: "#34d399" },
                ].map(s => (
                  <div key={s.label} className="bg-app-surface/50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-app-text-muted text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Hardest words (quiz wrong most) */}
      {adminSubTab === "quiz" && (
        <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-app-border">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <i className="ri-error-warning-line text-amber-400"></i>Từ được ôn nhiều nhất (khó nhất)
            </h3>
            <p className="text-app-text-muted text-xs mt-0.5">Sắp xếp theo số lần ôn tập — từ cần ôn nhiều nhất</p>
          </div>

          {hardestWords.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-emotion-happy-line text-white/10 text-4xl mb-3 block"></i>
              <p className="text-app-text-muted text-sm">Chưa có dữ liệu quiz</p>
              <p className="text-app-text-muted text-xs mt-1">Làm quiz và Spaced Repetition để xem thống kê</p>
            </div>
          ) : (
            <div className="divide-y divide-white/3">
              {hardestWords.map((w, i) => (
                <div key={w.korean} className="flex items-center gap-4 px-5 py-3 hover:bg-white/2 transition-colors">
                  <span className="text-app-text-muted text-sm font-bold w-6 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-bold text-base">{w.korean}</span>
                      <span className="text-rose-400 font-bold text-sm">{w.hanja}</span>
                    </div>
                    <p className="text-app-text-secondary text-xs truncate">{w.vietnamese}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-amber-400 font-bold text-sm">{w.totalReviews}</p>
                      <p className="text-app-text-muted text-xs">lần ôn</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-400 font-bold text-sm">{w.correctStreak}</p>
                      <p className="text-app-text-muted text-xs">streak</p>
                    </div>
                    <div className="w-16">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-app-text-muted">Khó</span>
                        <span className="text-app-text-secondary">{w.failRate}%</span>
                      </div>
                      <div className="w-full bg-app-card/50 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all"
                          style={{ width: `${w.failRate}%`, backgroundColor: w.failRate > 60 ? "#ef4444" : w.failRate > 30 ? "#fb923c" : "#34d399" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Per-alphabet groups */}
      {adminSubTab === "groups" && (
        <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-app-border">
            <h3 className="text-white font-semibold text-sm">Thống kê theo nhóm chữ cái</h3>
            <p className="text-app-text-muted text-xs mt-0.5">Tổng {totalWords} từ · {totalMastered} đã thuộc ({totalWords > 0 ? Math.round((totalMastered / totalWords) * 100) : 0}%)</p>
          </div>
          <div className="divide-y divide-white/3">
            {groupStats.map(g => (
              <div key={g.alpha} className="flex items-center gap-4 px-5 py-3 hover:bg-white/2 transition-colors">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 flex-shrink-0">
                  <span className="text-rose-400 font-bold text-lg">{g.alpha}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white/70 text-sm font-medium">{g.total} từ</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-green-400">{g.mastered} thuộc</span>
                      <span className="text-amber-400">{g.learning} học</span>
                      <span className="text-app-text-muted">{g.unlearned} mới</span>
                      <span className="text-white/50 font-bold">{g.pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-app-card/50 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-green-400 transition-all" style={{ width: `${g.pct}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content management */}
      {adminSubTab === "content" && (
        <div className="space-y-4">
          {/* Content stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Từ yêu thích", value: contentStats.favCount, icon: "ri-heart-line", color: "#f43f5e" },
              { label: "Ghi chú", value: contentStats.noteCount, icon: "ri-sticky-note-line", color: "app-accent-primary" },
              { label: "Lần thi TOPIK", value: contentStats.topikExams, icon: "ri-file-paper-2-line", color: "#a78bfa" },
              { label: "Lần luyện phát âm", value: contentStats.pronunciationSessions, icon: "ri-mic-line", color: "#34d399" },
              { label: "Thách thức tuần", value: contentStats.hasWeeklyChallenge ? "Đang có" : "Chưa có", icon: "ri-sword-line", color: "#fb923c" },
              { label: "Tổng từ vựng", value: totalWords.toLocaleString(), icon: "ri-translate-2", color: "#06b6d4" },
            ].map(s => (
              <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg mb-2" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                </div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-app-text-secondary text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick navigation */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <i className="ri-navigation-line text-app-text-secondary"></i>Điều hướng nhanh đến các tính năng
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Từ vựng Hán Hàn", icon: "ri-translate-2", color: "#f43f5e", path: "/hanja-vocab" },
                { label: "Spaced Repetition", icon: "ri-brain-line", color: "#a78bfa", path: "/hanja-vocab" },
                { label: "Thi thử TOPIK", icon: "ri-file-paper-2-line", color: "app-accent-primary", path: "/hanja-vocab" },
                { label: "Luyện phát âm", icon: "ri-mic-line", color: "#34d399", path: "/hanja-vocab" },
                { label: "So sánh Hán Việt", icon: "ri-translate-2", color: "#06b6d4", path: "/hanja-vocab" },
                { label: "Câu ví dụ thực tế", icon: "ri-newspaper-line", color: "#fb923c", path: "/hanja-vocab" },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 px-4 py-3 bg-app-surface/50 hover:bg-app-card/50 border border-app-border rounded-xl cursor-pointer transition-colors text-left group"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                    <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
                  </div>
                  <span className="text-white/60 text-xs group-hover:text-white/80 transition-colors">{item.label}</span>
                  <i className="ri-arrow-right-line text-app-text-muted text-xs flex-shrink-0"></i>
                </button>
              ))}
            </div>
          </div>

          {/* Data management */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <i className="ri-database-2-line text-app-text-secondary"></i>Quản lý dữ liệu người dùng
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: "Xuất toàn bộ dữ liệu học",
                  desc: "SR data, favorites, notes, streak",
                  icon: "ri-download-cloud-line",
                  color: "#34d399",
                  action: () => {
                    const data = {
                      srData: localStorage.getItem("hanja_sr_data"),
                      favorites: localStorage.getItem("hanja_favorites"),
                      notes: localStorage.getItem("hanja_notes"),
                      streak: localStorage.getItem("hanja_streak"),
                      xp: localStorage.getItem("kts_total_xp"),
                      exportedAt: new Date().toISOString(),
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `hankquoc-backup-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                  }
                },
                {
                  label: "Reset dữ liệu yêu thích",
                  desc: "Xóa tất cả từ đã lưu yêu thích",
                  icon: "ri-heart-3-line",
                  color: "#f43f5e",
                  action: () => { if (confirm("Xóa tất cả từ yêu thích?")) { localStorage.removeItem("hanja_favorites"); window.location.reload(); } }
                },
                {
                  label: "Reset ghi chú",
                  desc: "Xóa tất cả ghi chú từ vựng",
                  icon: "ri-sticky-note-2-line",
                  color: "app-accent-primary",
                  action: () => { if (confirm("Xóa tất cả ghi chú?")) { localStorage.removeItem("hanja_notes"); window.location.reload(); } }
                },
                {
                  label: "Reset lịch sử thi TOPIK",
                  desc: "Xóa kết quả thi thử TOPIK Hán Hàn",
                  icon: "ri-file-paper-2-line",
                  color: "#a78bfa",
                  action: () => { if (confirm("Xóa lịch sử thi TOPIK?")) { localStorage.removeItem("hanja_topik_history"); window.location.reload(); } }
                },
              ].map(btn => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-app-surface/50 hover:bg-app-card/50 border border-app-border rounded-xl cursor-pointer transition-colors text-left"
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${btn.color}15` }}>
                    <i className={`${btn.icon} text-sm`} style={{ color: btn.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm font-medium">{btn.label}</p>
                    <p className="text-app-text-muted text-xs">{btn.desc}</p>
                  </div>
                  <i className="ri-arrow-right-line text-app-text-muted text-xs flex-shrink-0"></i>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual grant XP */}
      {adminSubTab === "grant_xp" && <GrantXPPanel />}

      {/* Redemption requests management */}
      {adminSubTab === "redemptions" && <RedemptionRequestsPanel />}
    </div>
  );
}

// ─── Admin: Redemption Requests Panel ───────────────────────────────────────
// Manages VIP redemption requests - approve or deny pending requests
function RedemptionRequestsPanel() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("reward_redemptions").select("*");
      if (filter !== "all") {
        query = query.eq("status", filter);
      }
      query = query.order("created_at", { ascending: false }).limit(50);
      const { data, error } = await query;
      if (error) throw error;
      setRequests(data || []);
    } catch (e) {
      console.error("Failed to load redemption requests:", e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (id: string) => {
    if (!confirm("Duyệt yêu cầu đổi VIP này?")) return;
    try {
      // Get redemption request details
      const { data: redemption, error: fetchError } = await supabase
        .from("reward_redemptions")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;

      // Update redemption status
      const { error: updateError } = await supabase
        .from("reward_redemptions")
        .update({ status: "approved" })
        .eq("id", id);
      if (updateError) throw updateError;

      // Activate VIP based on reward type
      const rewardTitle = redemption.reward_title;
      let vipDuration = 0;
      if (rewardTitle.includes("7 ngày")) {
        vipDuration = 7;
      } else if (rewardTitle.includes("30 ngày")) {
        vipDuration = 30;
      }

      if (vipDuration > 0) {
        // Calculate new VIP end date
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("vip_end_date")
          .eq("id", redemption.user_id)
          .single();
        
        const currentEndDate = profile?.vip_end_date ? new Date(profile.vip_end_date) : new Date();
        const newEndDate = currentEndDate > new Date() 
          ? new Date(currentEndDate.getTime() + vipDuration * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + vipDuration * 24 * 60 * 60 * 1000);

        await supabase
          .from("user_profiles")
          .update({ vip_end_date: newEndDate.toISOString() })
          .eq("id", redemption.user_id);
      }

      loadRequests();
    } catch (e) {
      alert("Lỗi khi duyệt: " + (e instanceof Error ? e.message : "Unknown error"));
    }
  };

  const handleReject = async (id: string) => {
    const note = prompt("Lý do từ chối (tùy chọn):");
    try {
      const { error } = await supabase
        .from("reward_redemptions")
        .update({ status: "rejected", admin_note: note || null })
        .eq("id", id);
      if (error) throw error;
      loadRequests();
    } catch (e) {
      alert("Lỗi khi từ chối: " + (e instanceof Error ? e.message : "Unknown error"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-1 flex items-center gap-2">
          <i className="ri-vip-crown-line text-amber-400"></i>Quản lý yêu cầu đổi VIP
        </h3>
        <p className="text-app-text-muted text-xs mb-4">
          Duyệt hoặc từ chối yêu cầu đổi VIP từ người dùng
        </p>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {(["all", "pending", "approved", "rejected"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${filter === f ? "bg-amber-500 text-white" : "bg-app-surface/50 text-app-text-secondary hover:text-white/60"}`}
            >
              {f === "all" ? "Tất cả" : f === "pending" ? "Chờ duyệt" : f === "approved" ? "Đã duyệt" : "Đã từ chối"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8 text-app-text-muted text-sm">Đang tải...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-app-text-muted text-sm">Không có yêu cầu nào</div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {requests.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-4 bg-app-surface/50 border border-app-border rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-bold text-sm">{r.reward_title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                      r.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {r.status === "pending" ? "Chờ duyệt" : r.status === "approved" ? "Đã duyệt" : "Đã từ chối"}
                    </span>
                  </div>
                  <p className="text-app-text-secondary text-xs mb-1">
                    User ID: {r.user_id} · {r.xp_cost.toLocaleString()} XP
                  </p>
                  <p className="text-app-text-muted text-[10px]">
                    {new Date(r.created_at).toLocaleString("vi-VN")}
                  </p>
                  {r.admin_note && (
                    <p className="text-rose-400 text-xs mt-1">Ghi chú: {r.admin_note}</p>
                  )}
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin: Manual Grant XP Panel ────────────────────────────────────────
// Calls Supabase RPC `grant_xp(user_id, amount, reason)` (migration 038).
// Search target user by display_name → list candidates → confirm → grant.
function GrantXPPanel() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<{ id: string; display_name: string; avatar_url: string | null; xp: number }[]>([]);
  const [selected, setSelected] = useState<{ id: string; display_name: string; xp: number } | null>(null);
  const [amount, setAmount] = useState<number>(100);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [history, setHistory] = useState<{ user_id: string; amount: number; reason: string; ts: number }[]>(() => {
    try { return JSON.parse(localStorage.getItem("kts_admin_grant_xp_history") || "[]"); } catch { return []; }
  });

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, display_name, avatar_url")
        .ilike("display_name", `%${search.trim()}%`)
        .limit(10);
      if (error) throw error;
      // Fetch XP for each
      const ids = (data || []).map(u => u.id);
      const { data: progress } = await supabase
        .from("user_progress")
        .select("user_id, xp")
        .in("user_id", ids);
      const xpMap = new Map((progress || []).map(p => [p.user_id, p.xp || 0]));
      setUsers((data || []).map(u => ({
        id: u.id,
        display_name: u.display_name || "Học viên",
        avatar_url: u.avatar_url,
        xp: xpMap.get(u.id) || 0,
      })));
    } catch (e) {
      setResult({ ok: false, msg: e instanceof Error ? e.message : "Tìm kiếm thất bại" });
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async () => {
    if (!selected || !amount || amount === 0) return;
    if (amount < 0 && !confirm(`Trừ ${Math.abs(amount)} XP của ${selected.display_name}?`)) return;
    setSubmitting(true);
    setResult(null);
    try {
      const { data, error } = await supabase.rpc("grant_xp", {
        p_target_user_id: selected.id,
        p_amount: amount,
        p_reason: reason || null,
      });
      if (error) throw error;
      const newXP = Number(data) || 0;
      setResult({ ok: true, msg: `Đã ${amount > 0 ? "trao" : "trừ"} ${Math.abs(amount)} XP cho ${selected.display_name}. XP mới: ${newXP}` });
      // Update local history
      const next = [{ user_id: selected.id, amount, reason, ts: Date.now() }, ...history].slice(0, 20);
      setHistory(next);
      try { localStorage.setItem("kts_admin_grant_xp_history", JSON.stringify(next)); } catch { /* ignore */ }
      // Refresh selected user XP
      setSelected({ ...selected, xp: newXP });
      setUsers(prev => prev.map(u => u.id === selected.id ? { ...u, xp: newXP } : u));
      setReason("");
    } catch (e) {
      setResult({ ok: false, msg: e instanceof Error ? e.message : "Trao XP thất bại — kiểm tra quyền admin" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-1 flex items-center gap-2">
          <i className="ri-gift-2-line text-amber-400"></i>Trao XP thủ công cho học viên
        </h3>
        <p className="text-app-text-muted text-xs mb-4">
          Tìm học viên theo tên hiển thị, sau đó trao bonus XP (positive) hoặc trừ XP (negative). Mọi thay đổi tuân thủ rule never-decrease ở client; muốn trừ XP hãy nhập số âm.
        </p>

        {/* Search */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
            placeholder="Tìm theo tên hiển thị..."
            className="flex-1 px-4 py-2.5 bg-app-card/50 border border-app-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !search.trim()}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors"
          >
            {loading ? "Đang tìm..." : "Tìm"}
          </button>
        </div>

        {/* User results */}
        {users.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => setSelected({ id: u.id, display_name: u.display_name, xp: u.xp })}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-colors ${selected?.id === u.id ? "bg-amber-500/10 border-amber-400/30" : "bg-app-surface/50 border-app-border hover:border-app-border"}`}
              >
                <div className="w-9 h-9 rounded-full bg-app-card flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt={u.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <i className="ri-user-3-line text-app-text-muted text-sm"></i>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{u.display_name}</p>
                  <p className="text-app-text-muted text-[10px] font-mono truncate">{u.id.slice(0, 8)}...</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-amber-400 font-bold text-sm">{u.xp.toLocaleString()} XP</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Grant form */}
        {selected && (
          <div className="bg-amber-500/5 border border-amber-400/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <i className="ri-arrow-right-line text-amber-400"></i>
              <span className="text-white/70">Trao XP cho:</span>
              <span className="text-white font-semibold">{selected.display_name}</span>
              <span className="text-app-text-muted text-xs">(hiện: {selected.xp.toLocaleString()} XP)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-app-text-muted text-xs mb-1 block">Số XP (âm = trừ)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-app-card/50 border border-app-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                />
              </div>
              <div>
                <label className="text-app-text-muted text-xs mb-1 block">Lý do (tuỳ chọn)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="VD: Bonus event, fix lỗi..."
                  className="w-full px-3 py-2 bg-app-card/50 border border-app-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 border border-app-border text-white/50 rounded-lg text-sm cursor-pointer hover:bg-app-card/50 transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={handleGrant}
                disabled={submitting || !amount}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap transition-colors"
              >
                {submitting ? "Đang xử lý..." : `${amount > 0 ? "+" : ""}${amount} XP — Xác nhận`}
              </button>
            </div>
          </div>
        )}

        {/* Result toast */}
        {result && (
          <div className={`mt-3 p-3 rounded-xl text-sm flex items-start gap-2 ${result.ok ? "bg-emerald-500/10 border border-emerald-500/25 text-app-accent-success" : "bg-red-500/10 border border-red-500/25 text-red-400"}`}>
            <i className={result.ok ? "ri-checkbox-circle-fill" : "ri-error-warning-fill"}></i>
            <span>{result.msg}</span>
          </div>
        )}
      </div>

      {/* Recent history */}
      {history.length > 0 && (
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <i className="ri-history-line text-app-text-muted"></i>Lịch sử trao XP gần đây
          </h4>
          <div className="space-y-2">
            {history.slice(0, 10).map((h, i) => (
              <div key={i} className="flex items-center gap-3 text-xs py-2 border-b border-app-border last:border-0">
                <span className={`font-bold ${h.amount > 0 ? "text-amber-400" : "text-red-400"}`}>{h.amount > 0 ? "+" : ""}{h.amount} XP</span>
                <span className="text-app-text-muted font-mono">{h.user_id.slice(0, 8)}</span>
                {h.reason && <span className="text-white/50 truncate">— {h.reason}</span>}
                <span className="text-app-text-muted ml-auto whitespace-nowrap">{new Date(h.ts).toLocaleString("vi-VN")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface RewardItem {
  id: string;
  title: string;
  desc: string;
  xpCost: number;
  type: "discount" | "vip" | "badge" | "feature";
  icon: string;
  color: string;
  stock: number;
  popular?: boolean;
}

const REWARDS: RewardItem[] = [
  { id: "r4", title: "Huy hiệu Học viên Tích cực", desc: "Huy hiệu đặc biệt hiển thị trên hồ sơ và bảng xếp hạng", xpCost: 500, type: "badge", icon: "ri-medal-2-line", color: "#a78bfa", stock: 999 },
  { id: "r6", title: "Mở khóa giao diện tối", desc: "Dark mode đặc biệt — chỉ dành cho học viên tích cực", xpCost: 1500, type: "feature", icon: "ri-moon-line", color: "#06b6d4", stock: 999 },
  { id: "r1", title: "Giảm 20% VIP tháng đầu", desc: "Áp dụng khi đăng ký gói VIP lần đầu tiên", xpCost: 2500, type: "discount", icon: "ri-coupon-3-line", color: "app-accent-primary", stock: 50, popular: true },
  { id: "r2", title: "VIP 7 ngày miễn phí", desc: "Trải nghiệm toàn bộ tính năng VIP trong 1 tuần", xpCost: 5000, type: "vip", icon: "ri-vip-crown-line", color: "#FFD700", stock: 20, popular: true },
  { id: "r3", title: "Giảm 50% VIP tháng đầu", desc: "Ưu đãi lớn cho học viên cực kỳ tích cực", xpCost: 8000, type: "discount", icon: "ri-percent-line", color: "#34d399", stock: 10 },
  { id: "r5", title: "VIP 30 ngày miễn phí", desc: "1 tháng VIP hoàn toàn miễn phí — phần thưởng cao nhất", xpCost: 15000, type: "vip", icon: "ri-vip-diamond-line", color: "#fb923c", stock: 5 },
];

// ─── XP SOURCES ─────────────────────────────────────────────────────────────
// Sync EXACTLY with XP_REWARDS + DAILY_EVENT_CAPS in @/src/hooks/useXPSystem.ts.
// When you edit values there, edit them here too to keep the UI honest.
const XP_SOURCES = [
  // ── Học tập ─────────────────────────────────────────────────────────
  { icon: "ri-login-circle-line", label: "Đăng nhập hằng ngày", xp: "+10 XP", color: "app-accent-primary", desc: "1 lần/ngày — giữ streak để nhận bonus" },
  { icon: "ri-fire-line", label: "Streak 7 ngày liên tiếp", xp: "+50 XP", color: "#fb923c", desc: "Bonus 1 lần khi đạt mốc 7 ngày" },
  { icon: "ri-fire-line", label: "Streak 30 ngày liên tiếp", xp: "+200 XP", color: "#fb923c", desc: "Bonus 1 lần khi đạt mốc 30 ngày" },
  { icon: "ri-fire-fill", label: "Streak 100 ngày liên tiếp", xp: "+500 XP", color: "#f59e0b", desc: "Bonus 1 lần khi đạt mốc 100 ngày" },
  { icon: "ri-stack-line", label: "Học Flashcard mới", xp: "+5 XP/từ", color: "#a78bfa", desc: "Tối đa 100 từ/ngày (500 XP)" },
  { icon: "ri-file-list-3-line", label: "EPS trả lời đúng", xp: "+3 XP/câu", color: "#06b6d4", desc: "Tối đa 200 câu/ngày (600 XP)" },
  { icon: "ri-timer-line", label: "Hoàn thành thi thử EPS", xp: "+20 XP", color: "#34d399", desc: "Tối đa 5 bài/ngày" },
  { icon: "ri-file-paper-2-line", label: "Hoàn thành thi TOPIK", xp: "+25 XP", color: "#f43f5e", desc: "Tối đa 5 bài/ngày" },
  { icon: "ri-book-2-line", label: "Hoàn thành luyện chủ đề", xp: "+15 XP", color: "#22d3ee", desc: "Tối đa 10 bài/ngày" },
  { icon: "ri-survey-line", label: "Hoàn thành quiz", xp: "+10 XP", color: "#f472b6", desc: "Tối đa 10 quiz/ngày" },
  // ── Hán Hàn ─────────────────────────────────────────────────────────
  { icon: "ri-translate-2", label: "Học từ Hán Hàn mới", xp: "+3 XP/từ", color: "#a78bfa", desc: "Tối đa 100 từ/ngày" },
  { icon: "ri-plant-line", label: "Hoàn thành cây Hán", xp: "+30 XP", color: "#34d399", desc: "Tối đa 5 cây/ngày" },
  { icon: "ri-question-answer-line", label: "Hoàn thành quiz Hán", xp: "+15 XP", color: "#60a5fa", desc: "Tối đa 10 quiz/ngày" },
  // ── Cộng đồng ───────────────────────────────────────────────────────
  { icon: "ri-article-line", label: "Đăng bài (được duyệt)", xp: "+15 XP", color: "#60a5fa", desc: "Tối đa 5 bài/ngày" },
  { icon: "ri-heart-3-line", label: "Bài viết nhận lượt thích", xp: "+2 XP", color: "#f87171", desc: "Tối đa 100 lượt/ngày" },
];

// Phần thưởng khác (ngoài XP_REWARDS): dùng `addXP(amount, reason)` — tự do
const XP_MANUAL_REWARDS = [
  { icon: "ri-gift-line", label: "Phần thưởng admin trao", xp: "Tuỳ", color: "#a78bfa", desc: "Admin có thể cấp bonus thủ công" },
  { icon: "ri-trophy-line", label: "Hoàn thành bài/lesson", xp: "+5 → +50 XP", color: "#FFD700", desc: "Tuỳ loại bài: Seoul, EPS, luyện tập..." },
];

const XP_NOTES = [
  { icon: "ri-shield-check-line", label: "Anti-cheat", desc: "Hệ thống có giới hạn XP mỗi ngày theo loại hoạt động để chống spam. Một số hoạt động (bonus streak, hoàn thành bài) chỉ cộng 1 lần duy nhất.", color: "#34d399" },
  { icon: "ri-refresh-line", label: "Đồng bộ server", desc: "XP chỉ tăng, không giảm. Leaderboard cập nhật theo max(công thức, tổng local) để bảo vệ điểm của bạn.", color: "#60a5fa" },
];

function DailyLoginBonus() {
  // Daily login bonus is handled globally by `DailyLoginBonusGate` in App.tsx
  // (uses `useXPSystem.awardXP` → toast + Supabase sync). No-op here.
  return null;
  // The original UI block below is intentionally unused.
  // eslint-disable-next-line no-unreachable
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-app-bg border border-app-accent-primary/30 rounded-2xl p-8 text-center max-w-sm w-full mx-4 animate-in zoom-in-95">
        <div />
      </div>
    </div>
  );
}

export default function RewardsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [streak] = useLocalStorage<{ count: number }>("kts_streak", { count: 0 });
  const [redeemedRewards, setRedeemedRewards] = useLocalStorage<string[]>("kts_redeemed_rewards", []);
  const [redeemMsg, setRedeemMsg] = useState<{ id: string; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"rewards" | "history" | "earn" | "admin">("rewards");
  const [isAdmin] = useLocalStorage<boolean>(ADMIN_KEY, false);
  const [adminCode, setAdminCode] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [, setAdminMode] = useLocalStorage<boolean>(ADMIN_KEY, false);

  // ─── UNIFIED XP SOURCE ────────────────────────────────────────────────────
  // Single source of truth site-wide = useXPSystem().totalXP (persisted in
  // `kts_xp_total` localStorage, synced to Supabase user_progress via the
  // max(formula, local_total) rule). This page only spends/redeems locally.
  const { totalXP, currentRank, awardXP } = useXPSystem();
  const [redeemSpent, setRedeemSpent] = useLocalStorage<number>("kts_xp_redeem_spent", 0);

  // Available XP after redemptions. NEVER display a negative number.
  const displayXp = Math.max(0, totalXP - redeemSpent);

  const handleRedeem = async (reward: RewardItem) => {
    if (displayXp < reward.xpCost) return;
    if (redeemedRewards.includes(reward.id) && reward.type !== "badge") return;
    
    // VIP rewards require admin approval
    if (reward.type === "vip") {
      if (!user) {
        alert("Vui lòng đăng nhập để đổi VIP");
        return;
      }
      
      // Save redemption request to database
      const { error } = await supabase.from("reward_redemptions").insert({
        user_id: user.id,
        reward_id: reward.id,
        reward_title: reward.title,
        reward_type: reward.type,
        xp_cost: reward.xpCost,
        status: "pending",
      });
      
      if (error) {
        alert("Lỗi khi gửi yêu cầu đổi VIP: " + error.message);
        return;
      }
      
      setRedeemMsg({ id: reward.id, msg: `Đã gửi yêu cầu đổi ${reward.title} - chờ admin duyệt!` });
    } else {
      // Non-VIP rewards are automatic
      setRedeemSpent(prev => prev + reward.xpCost);
      setRedeemedRewards(prev => [...prev, reward.id]);
      setRedeemMsg({ id: reward.id, msg: `Đã đổi thành công: ${reward.title}!` });
    }
    
    setTimeout(() => setRedeemMsg(null), 5000);
  };

  const xpToNextReward = useMemo(() => {
    const affordable = REWARDS.filter(r => r.xpCost <= displayXp);
    const next = REWARDS.filter(r => r.xpCost > displayXp).sort((a, b) => a.xpCost - b.xpCost)[0];
    return { affordable: affordable.length, next };
  }, [displayXp]);

  // XP level (uses rank from useXPSystem for consistency with other pages)
  const xpLevel = {
    label: currentRank.name,
    color: currentRank.color || "app-accent-primary",
    icon: "ri-vip-crown-line",
  };

  // Use RANKS from data/ranks.ts for progress bar (keeps in sync with rank system)
  const nextRankData = RANKS[RANKS.indexOf(currentRank) + 1] ?? null;
  const nextLevelXp = nextRankData ? nextRankData.minXP : currentRank.minXP;
  const prevLevelXp = currentRank.minXP;
  const levelProgress = nextRankData
    ? Math.min(100, Math.round(((displayXp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100))
    : 100;

  // Keep awardXP referenced for admin manual-grant flow below
  void awardXP;

  return (
    <DashboardLayout
      title="Phần thưởng & XP"
      subtitle="Tích lũy XP từ việc học, đổi lấy ưu đãi VIP và huy hiệu"
    >
      <DailyLoginBonus />

      {redeemMsg && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2 bg-app-accent-success/15 border border-emerald-500/25 text-app-accent-success text-sm font-medium px-4 py-3 rounded-xl">
          <i className="ri-checkbox-circle-fill"></i>
          {redeemMsg.msg}
        </div>
      )}

      {/* XP Overview */}
      <div className="bg-gradient-to-r from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${xpLevel.color}15`, border: `2px solid ${xpLevel.color}30` }}>
              <i className={`${xpLevel.icon} text-3xl`} style={{ color: xpLevel.color }}></i>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <p className="text-white font-bold text-2xl">{displayXp.toLocaleString()} XP</p>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${xpLevel.color}15`, color: xpLevel.color }}>
                {xpLevel.label}
              </span>
            </div>
            <p className="text-app-text-secondary text-sm mb-3">
              {xpToNextReward.affordable > 0 ? `Có thể đổi ${xpToNextReward.affordable} phần thưởng ngay!` : "Tiếp tục học để tích lũy XP"}
              {xpToNextReward.next && ` · Cần thêm ${(xpToNextReward.next.xpCost - displayXp).toLocaleString()} XP cho phần thưởng tiếp theo`}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-app-card/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${levelProgress}%`, backgroundColor: xpLevel.color }} />
              </div>
              <span className="text-app-text-muted text-xs whitespace-nowrap">{displayXp}/{nextLevelXp} XP</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            {[
              { label: "Streak", value: `${streak.count}d`, color: "#fb923c" },
              { label: "Đã đổi", value: redeemedRewards.length, color: "#34d399" },
            ].map(s => (
              <div key={s.label}>
                <p className="font-bold text-lg" style={{ color: s.color }}>{s.value}</p>
                <p className="text-app-text-muted text-[10px]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-app-surface/50 p-1 rounded-xl mb-6 w-fit">
        {([["rewards", "ri-gift-line", "Đổi thưởng"], ["earn", "ri-add-circle-line", "Cách kiếm XP"], ["history", "ri-history-line", "Lịch sử"]] as const).map(([tab, icon, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}
          >
            <i className={icon}></i>{label}
          </button>
        ))}
        {isAdmin ? (
          <button onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === "admin" ? "bg-amber-500 text-white" : "text-amber-400/60 hover:text-amber-400"}`}>
            <i className="ri-shield-keyhole-line"></i>Admin
          </button>
        ) : (
          <button onClick={() => setShowAdminLogin(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/15 hover:text-app-text-muted cursor-pointer transition-colors whitespace-nowrap">
            <i className="ri-lock-line"></i>
          </button>
        )}
      </div>

      {/* Admin login modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAdminLogin(false)}>
          <div className="bg-app-bg border border-app-border rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><i className="ri-shield-keyhole-line text-amber-400"></i>Xác thực Admin</h3>
            <input type="password" value={adminCode} onChange={e => setAdminCode(e.target.value)}
              placeholder="Nhập mã admin..."
              className="w-full px-4 py-2.5 bg-app-card/50 border border-app-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 mb-3" />
            <div className="flex gap-3">
              <button onClick={() => setShowAdminLogin(false)} className="flex-1 py-2.5 border border-app-border text-white/50 rounded-xl text-sm cursor-pointer hover:bg-app-card/50 transition-colors">Hủy</button>
              <button onClick={() => {
                if (adminCode === "admin2024" || adminCode === "hankquoc") {
                  setAdminMode(true);
                  setShowAdminLogin(false);
                  setActiveTab("admin");
                  setAdminCode("");
                } else {
                  setAdminCode("");
                }
              }} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-amber-600 transition-colors">Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* Rewards tab */}
      {activeTab === "rewards" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {REWARDS.map(reward => {
            const canAfford = displayXp >= reward.xpCost;
            const redeemed = redeemedRewards.includes(reward.id);
            return (
              <div
                key={reward.id}
                className={`bg-app-bg border rounded-2xl p-5 transition-all relative ${reward.popular ? "border-app-accent-primary/20" : "border-app-border"} ${!canAfford ? "opacity-60" : "hover:border-app-border"}`}
              >
                {reward.popular && (
                  <div className="absolute -top-2.5 left-4">
                    <span className="bg-app-accent-primary text-app-bg text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">Phổ biến</span>
                  </div>
                )}
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl mb-4" style={{ backgroundColor: `${reward.color}15` }}>
                  <i className={`${reward.icon} text-2xl`} style={{ color: reward.color }}></i>
                </div>
                <h3 className="text-white font-bold text-sm mb-1">{reward.title}</h3>
                <p className="text-app-text-secondary text-xs leading-relaxed mb-4">{reward.desc}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <i className="ri-star-fill text-app-accent-primary text-xs"></i>
                    <span className="text-app-accent-primary font-bold text-sm">{reward.xpCost.toLocaleString()} XP</span>
                  </div>
                  <span className="text-app-text-muted text-[10px]">Còn {reward.stock}</span>
                </div>
                {redeemed ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-app-accent-success text-xs font-bold text-center">
                    <i className="ri-checkbox-circle-fill mr-1"></i>Đã đổi
                  </div>
                ) : (
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${canAfford ? "bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg" : "bg-app-card/50 text-app-text-muted cursor-not-allowed"}`}
                  >
                    {canAfford ? "Đổi ngay" : `Thiếu ${(reward.xpCost - displayXp).toLocaleString()} XP`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Earn XP tab */}
      {activeTab === "earn" && (
        <div className="space-y-4 max-w-2xl">
          {/* Daily login highlight */}
          <div className="bg-gradient-to-r from-app-surface to-[#0f1117] border border-app-accent-primary/20 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-app-accent-primary/15 flex-shrink-0">
                <i className="ri-gift-line text-app-accent-primary text-2xl"></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-bold text-base">Đăng nhập hàng ngày</p>
                  <span className="bg-app-accent-primary/15 text-app-accent-primary text-[10px] font-bold px-2 py-0.5 rounded-full">Mới!</span>
                </div>
                <p className="text-white/50 text-sm">Nhận <span className="text-app-accent-primary font-bold">1–5 XP ngẫu nhiên</span> mỗi ngày khi mở app. Hôm nay bạn đã nhận rồi!</p>
              </div>
              <div className="text-center">
                <p className="text-app-accent-primary font-bold text-2xl">1–5</p>
                <p className="text-app-text-muted text-xs">XP/ngày</p>
              </div>
            </div>
          </div>

          <div className="bg-white/2 border border-app-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-app-border bg-app-surface/30">
              <h3 className="text-white font-semibold text-sm">Tất cả cách kiếm XP</h3>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-[48px_1fr_120px_120px] gap-0 px-5 py-3 border-b border-white/3 min-w-[400px]">
                <span className="text-app-text-muted text-[10px] tracking-normal"></span>
                <span className="text-app-text-muted text-[10px] tracking-normal">Hoạt động</span>
                <span className="text-app-text-muted text-[10px] tracking-normal text-right">XP</span>
                <span className="text-app-text-muted text-[10px] tracking-normal text-right">Ghi chú</span>
              </div>
              {XP_SOURCES.map((s, idx) => (
                <div key={s.label} className="grid grid-cols-[48px_1fr_120px_120px] gap-0 px-5 py-3.5 border-b border-white/3 min-w-[400px] hover:bg-white/2 transition-colors">
                  <div className="flex items-center">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                      <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="text-white/80 text-sm font-medium">{s.label}</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <p className="font-bold text-sm" style={{ color: s.color }}>{s.xp}</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <p className="text-app-text-muted text-[10px] text-right">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manual/Bonus XP sources */}
          <div className="bg-white/2 border border-[#a78bfa]/15 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#a78bfa]/20 bg-[#a78bfa]/5">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <i className="ri-gift-line text-[#a78bfa]"></i>Phần thưởng bonus — Ngoài công thức cố định
              </h3>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-[48px_1fr_140px_140px] gap-0 px-5 py-3 border-b border-[#a78bfa]/10 min-w-[400px]">
                <span className="text-app-text-muted text-[10px] tracking-normal"></span>
                <span className="text-app-text-muted text-[10px] tracking-normal">Nguồn</span>
                <span className="text-app-text-muted text-[10px] tracking-normal text-right">XP</span>
                <span className="text-app-text-muted text-[10px] tracking-normal text-right">Ghi chú</span>
              </div>
              {XP_MANUAL_REWARDS.map(s => (
                <div key={s.label} className="grid grid-cols-[48px_1fr_140px_140px] gap-0 px-5 py-3.5 border-b border-[#a78bfa]/10 min-w-[400px] hover:bg-[#a78bfa]/5 transition-colors">
                  <div className="flex items-center">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                      <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="text-white/80 text-sm font-medium">{s.label}</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <p className="font-bold text-sm" style={{ color: s.color }}>{s.xp}</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <p className="text-app-text-muted text-[10px] text-right">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* XP Rules notes */}
          <div className="grid sm:grid-cols-2 gap-3">
            {XP_NOTES.map(n => (
              <div key={n.label} className="rounded-xl p-4 border" style={{ borderColor: `${n.color}25`, backgroundColor: `${n.color}08` }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${n.color}15` }}>
                    <i className={`${n.icon} text-sm`} style={{ color: n.color }}></i>
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1" style={{ color: n.color }}>{n.label}</p>
                    <p className="text-app-text-secondary text-xs leading-relaxed">{n.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4">
            <p className="text-app-accent-primary/80 text-xs font-semibold mb-1">Mẹo tích XP nhanh nhất</p>
            <p className="text-app-text-secondary text-xs leading-relaxed">
              Duy trì streak mỗi ngày là cách kiếm XP hiệu quả nhất. Kết hợp học flashcard, luyện EPS/TOPIK, quiz Hán Hàn và đóng góp bài cộng đồng để leo hạng. XP chỉ tăng — không bao giờ giảm!
            </p>
            <button onClick={() => navigate("/daily-plan")} className="mt-2 flex items-center gap-1.5 text-app-accent-primary text-xs font-semibold cursor-pointer whitespace-nowrap hover:text-app-accent-primary/80">
              <i className="ri-route-line"></i>Xem lộ trình hôm nay →
            </button>
          </div>
        </div>
      )}

      {/* Admin tab */}
      {activeTab === "admin" && isAdmin && <AdminPanel />}

      {/* History tab */}
      {activeTab === "history" && (
        <div className="max-w-xl">
          {redeemedRewards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <i className="ri-history-line text-white/10 text-4xl mb-3"></i>
              <p className="text-app-text-muted text-sm">Chưa đổi phần thưởng nào</p>
              <button onClick={() => setActiveTab("rewards")} className="mt-3 text-app-accent-primary text-xs cursor-pointer whitespace-nowrap">
                Xem phần thưởng có thể đổi →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {redeemedRewards.map(id => {
                const reward = REWARDS.find(r => r.id === id);
                if (!reward) return null;
                return (
                  <div key={id} className="flex items-center gap-4 px-4 py-4 bg-app-bg border border-app-border rounded-xl">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${reward.color}15` }}>
                      <i className={`${reward.icon} text-lg`} style={{ color: reward.color }}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/80 text-sm font-medium">{reward.title}</p>
                      <p className="text-app-text-muted text-xs">{reward.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 text-sm font-bold">-{reward.xpCost.toLocaleString()} XP</p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <i className="ri-checkbox-circle-fill text-app-accent-success text-xs"></i>
                        <span className="text-app-accent-success text-[10px]">Đã đổi</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

