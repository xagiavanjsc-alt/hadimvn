import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
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
  const [adminSubTab, setAdminSubTab] = useState<"overview" | "chart" | "quiz" | "groups" | "content">("overview");

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
    { key: "chart" as const, label: "Biểu đồ học", icon: "ri-bar-chart-2-line" },
    { key: "quiz" as const, label: "Từ khó nhất", icon: "ri-error-warning-line" },
    { key: "groups" as const, label: "Theo nhóm", icon: "ri-list-check" },
    { key: "content" as const, label: "Quản lý nội dung", icon: "ri-settings-3-line" },
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
      <div className="flex gap-1 bg-white/3 p-1 rounded-xl w-fit flex-wrap">
        {subTabs.map(t => (
          <button key={t.key} onClick={() => setAdminSubTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${adminSubTab === t.key ? "bg-amber-500 text-white" : "text-white/40 hover:text-white/60"}`}>
            <i className={t.icon}></i>{t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {adminSubTab === "overview" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Tổng từ Hán Hàn", value: totalWords.toLocaleString(), icon: "ri-translate-2", color: "#e8c84a" },
              { label: "Đã thuộc", value: totalMastered, icon: "ri-check-double-line", color: "#34d399" },
              { label: "Đang học", value: totalLearning, icon: "ri-book-open-line", color: "#fb923c" },
              { label: "Tổng lần ôn", value: totalReviews.toLocaleString(), icon: "ri-refresh-line", color: "#a78bfa" },
            ].map(s => (
              <div key={s.label} className="bg-[#0f1117] border border-white/5 rounded-xl p-4">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg mb-2" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <i className="ri-user-line text-white/40"></i>Hoạt động người dùng
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "XP tích lũy", value: xpData.toLocaleString() + " XP", color: "#e8c84a" },
                { label: "Streak hiện tại", value: (streakData?.currentStreak || 0) + " ngày", color: "#fb923c" },
                { label: "% hoàn thành", value: totalWords > 0 ? Math.round((totalMastered / totalWords) * 100) + "%" : "0%", color: "#34d399" },
              ].map(s => (
                <div key={s.label} className="text-center bg-white/3 rounded-xl p-3">
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-white/30 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <i className="ri-settings-3-line text-white/40"></i>Quản lý nhanh
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Reset dữ liệu học Hán Hàn", icon: "ri-delete-bin-line", color: "#ef4444", action: () => { if (confirm("Reset toàn bộ dữ liệu học Hán Hàn?")) { localStorage.removeItem("hanja_sr_data"); window.location.reload(); } } },
                { label: "Reset XP & Streak", icon: "ri-refresh-line", color: "#fb923c", action: () => { if (confirm("Reset XP và streak?")) { localStorage.removeItem("kts_total_xp"); localStorage.removeItem("kts_streak"); window.location.reload(); } } },
                { label: "Xem dữ liệu SR (JSON)", icon: "ri-code-line", color: "#a78bfa", action: () => { const d = localStorage.getItem("hanja_sr_data"); alert(d ? `${Object.keys(JSON.parse(d)).length} từ đã học` : "Chưa có dữ liệu"); } },
                { label: "Xuất báo cáo JSON", icon: "ri-download-line", color: "#34d399", action: () => { const data = { totalWords, totalMastered, totalLearning, totalReviews, groupStats }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "hanja-report.json"; a.click(); } },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action}
                  className="flex items-center gap-3 px-4 py-3 bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl cursor-pointer transition-colors text-left">
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
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1 flex items-center gap-2">
            <i className="ri-bar-chart-2-line text-white/40"></i>Hoạt động học 30 ngày qua
          </h3>
          <p className="text-white/30 text-xs mb-5">Số từ ôn tập mỗi ngày (từ dữ liệu Spaced Repetition)</p>

          {activityData.every(d => d.count === 0) ? (
            <div className="text-center py-12">
              <i className="ri-bar-chart-2-line text-white/10 text-4xl mb-3 block"></i>
              <p className="text-white/30 text-sm">Chưa có dữ liệu học tập</p>
              <p className="text-white/20 text-xs mt-1">Bắt đầu ôn tập Spaced Repetition để xem biểu đồ</p>
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
                    {i % 5 === 0 && <span className="text-white/20" style={{ fontSize: "9px" }}>{d.label}</span>}
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
                  <div key={s.label} className="bg-white/3 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-white/30 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Hardest words (quiz wrong most) */}
      {adminSubTab === "quiz" && (
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <i className="ri-error-warning-line text-amber-400"></i>Từ được ôn nhiều nhất (khó nhất)
            </h3>
            <p className="text-white/30 text-xs mt-0.5">Sắp xếp theo số lần ôn tập — từ cần ôn nhiều nhất</p>
          </div>

          {hardestWords.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-emotion-happy-line text-white/10 text-4xl mb-3 block"></i>
              <p className="text-white/30 text-sm">Chưa có dữ liệu quiz</p>
              <p className="text-white/20 text-xs mt-1">Làm quiz và Spaced Repetition để xem thống kê</p>
            </div>
          ) : (
            <div className="divide-y divide-white/3">
              {hardestWords.map((w, i) => (
                <div key={w.korean} className="flex items-center gap-4 px-5 py-3 hover:bg-white/2 transition-colors">
                  <span className="text-white/20 text-sm font-bold w-6 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-bold text-base">{w.korean}</span>
                      <span className="text-rose-400 font-bold text-sm">{w.hanja}</span>
                    </div>
                    <p className="text-white/40 text-xs truncate">{w.vietnamese}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-amber-400 font-bold text-sm">{w.totalReviews}</p>
                      <p className="text-white/20 text-xs">lần ôn</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-400 font-bold text-sm">{w.correctStreak}</p>
                      <p className="text-white/20 text-xs">streak</p>
                    </div>
                    <div className="w-16">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/20">Khó</span>
                        <span className="text-white/40">{w.failRate}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5">
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
        <div className="bg-[#0f1117] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-white font-semibold text-sm">Thống kê theo nhóm chữ cái</h3>
            <p className="text-white/30 text-xs mt-0.5">Tổng {totalWords} từ · {totalMastered} đã thuộc ({totalWords > 0 ? Math.round((totalMastered / totalWords) * 100) : 0}%)</p>
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
                      <span className="text-white/30">{g.unlearned} mới</span>
                      <span className="text-white/50 font-bold">{g.pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
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
              { label: "Ghi chú", value: contentStats.noteCount, icon: "ri-sticky-note-line", color: "#e8c84a" },
              { label: "Lần thi TOPIK", value: contentStats.topikExams, icon: "ri-file-paper-2-line", color: "#a78bfa" },
              { label: "Lần luyện phát âm", value: contentStats.pronunciationSessions, icon: "ri-mic-line", color: "#34d399" },
              { label: "Thách thức tuần", value: contentStats.hasWeeklyChallenge ? "Đang có" : "Chưa có", icon: "ri-sword-line", color: "#fb923c" },
              { label: "Tổng từ vựng", value: totalWords.toLocaleString(), icon: "ri-translate-2", color: "#06b6d4" },
            ].map(s => (
              <div key={s.label} className="bg-[#0f1117] border border-white/5 rounded-xl p-4">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg mb-2" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                </div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick navigation */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <i className="ri-navigation-line text-white/40"></i>Điều hướng nhanh đến các tính năng
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Từ vựng Hán Hàn", icon: "ri-translate-2", color: "#f43f5e", path: "/hanja-vocab" },
                { label: "Spaced Repetition", icon: "ri-brain-line", color: "#a78bfa", path: "/hanja-vocab" },
                { label: "Thi thử TOPIK", icon: "ri-file-paper-2-line", color: "#e8c84a", path: "/hanja-vocab" },
                { label: "Luyện phát âm", icon: "ri-mic-line", color: "#34d399", path: "/hanja-vocab" },
                { label: "So sánh Hán Việt", icon: "ri-translate-2", color: "#06b6d4", path: "/hanja-vocab" },
                { label: "Câu ví dụ thực tế", icon: "ri-newspaper-line", color: "#fb923c", path: "/hanja-vocab" },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 px-4 py-3 bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl cursor-pointer transition-colors text-left group"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                    <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
                  </div>
                  <span className="text-white/60 text-xs group-hover:text-white/80 transition-colors">{item.label}</span>
                  <i className="ri-arrow-right-line text-white/20 text-xs flex-shrink-0"></i>
                </button>
              ))}
            </div>
          </div>

          {/* Data management */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <i className="ri-database-2-line text-white/40"></i>Quản lý dữ liệu người dùng
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
                  color: "#e8c84a",
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
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl cursor-pointer transition-colors text-left"
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${btn.color}15` }}>
                    <i className={`${btn.icon} text-sm`} style={{ color: btn.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm font-medium">{btn.label}</p>
                    <p className="text-white/30 text-xs">{btn.desc}</p>
                  </div>
                  <i className="ri-arrow-right-line text-white/20 text-xs flex-shrink-0"></i>
                </button>
              ))}
            </div>
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
  { id: "r1", title: "Giảm 20% VIP tháng đầu", desc: "Áp dụng khi đăng ký gói VIP lần đầu tiên", xpCost: 2500, type: "discount", icon: "ri-coupon-3-line", color: "#e8c84a", stock: 50, popular: true },
  { id: "r2", title: "VIP 7 ngày miễn phí", desc: "Trải nghiệm toàn bộ tính năng VIP trong 1 tuần", xpCost: 5000, type: "vip", icon: "ri-vip-crown-line", color: "#FFD700", stock: 20, popular: true },
  { id: "r3", title: "Giảm 50% VIP tháng đầu", desc: "Ưu đãi lớn cho học viên cực kỳ tích cực", xpCost: 8000, type: "discount", icon: "ri-percent-line", color: "#34d399", stock: 10 },
  { id: "r5", title: "VIP 30 ngày miễn phí", desc: "1 tháng VIP hoàn toàn miễn phí — phần thưởng cao nhất", xpCost: 15000, type: "vip", icon: "ri-vip-diamond-line", color: "#fb923c", stock: 5 },
];

const XP_SOURCES = [
  { icon: "ri-login-circle-line", label: "Đăng nhập hàng ngày", xp: "5–20 XP", color: "#e8c84a", desc: "Random mỗi ngày, tăng theo streak" },
  { icon: "ri-fire-line", label: "Duy trì streak 7 ngày", xp: "+200 XP", color: "#fb923c", desc: "Bonus khi đạt mốc 7, 14, 30 ngày" },
  { icon: "ri-timer-line", label: "Hoàn thành thi thử EPS", xp: "+15 XP/%", color: "#34d399", desc: "Theo tỷ lệ đúng × 15" },
  { icon: "ri-stack-line", label: "Học Flashcard (Spaced Rep)", xp: "+10 XP/từ", color: "#a78bfa", desc: "Mỗi từ đạt mức Mastered" },
  { icon: "ri-file-list-3-line", label: "Luyện EPS", xp: "+3 XP/câu", color: "#06b6d4", desc: "Mỗi câu đúng" },
  { icon: "ri-survey-line", label: "Hoàn thành Quiz 100%", xp: "+100 XP", color: "#f472b6", desc: "Bonus khi đạt điểm tuyệt đối" },
  { icon: "ri-group-line", label: "Mời bạn bè tham gia", xp: "+500 XP", color: "#34d399", desc: "Mỗi người bạn giới thiệu" },
  { icon: "ri-trophy-line", label: "Top 3 bảng xếp hạng tuần", xp: "+1000 XP", color: "#FFD700", desc: "Phần thưởng cuối tuần" },
  { icon: "ri-mic-line", label: "Ghi âm phát âm đúng", xp: "+5 XP/từ", color: "#34d399", desc: "Mỗi từ phát âm đạt chuẩn" },
  { icon: "ri-file-paper-2-line", label: "Thi thử TOPIK Hán Hàn", xp: "+20 XP/%", color: "#f43f5e", desc: "Theo tỷ lệ đúng × 20" },
];

const XP_PENALTIES = [
  { icon: "ri-calendar-close-line", label: "Bỏ học 1 ngày (streak &gt; 3)", xp: "-10 XP", color: "#ef4444", desc: "Mất streak sẽ bị trừ XP nhẹ" },
  { icon: "ri-close-circle-line", label: "Bỏ học 3 ngày liên tiếp", xp: "-50 XP", color: "#ef4444", desc: "Streak reset + trừ XP đáng kể" },
  { icon: "ri-spam-line", label: "Quiz sai &gt;80% (dưới 20%)", xp: "-5 XP", color: "#fb923c", desc: "Khuyến khích ôn kỹ trước khi quiz" },
  { icon: "ri-time-line", label: "Bỏ thách thức tuần giữa chừng", xp: "-30 XP", color: "#fb923c", desc: "Đã bắt đầu thì nên hoàn thành" },
];

function DailyLoginBonus() {
  const [lastLoginDate, setLastLoginDate] = useLocalStorage<string>("kts_last_login_date", "");
  const [lastLoginXp, setLastLoginXp] = useLocalStorage<number>("kts_last_login_xp", 0);
  const [totalXp, setTotalXp] = useLocalStorage<number>("kts_total_xp", 0);
  const [showBonus, setShowBonus] = useState(false);
  const [bonusXp, setBonusXp] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (lastLoginDate !== today) {
      const xp = Math.floor(Math.random() * 5) + 1; // 1-5 XP
      setBonusXp(xp);
      setLastLoginDate(today);
      setLastLoginXp(xp);
      setTotalXp(prev => prev + xp);
      setShowBonus(true);
    }
  }, []);

  if (!showBonus) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f1117] border border-[#e8c84a]/30 rounded-2xl p-8 text-center max-w-sm w-full mx-4 animate-in zoom-in-95">
        <div className="w-20 h-20 rounded-full bg-[#e8c84a]/15 flex items-center justify-center mx-auto mb-4 relative">
          <i className="ri-gift-line text-[#e8c84a] text-4xl"></i>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#e8c84a] flex items-center justify-center">
            <span className="text-[#0f1117] text-xs font-bold">+{bonusXp}</span>
          </div>
        </div>
        <h3 className="text-white font-bold text-xl mb-1">Phần thưởng đăng nhập!</h3>
        <p className="text-white/50 text-sm mb-4">Bạn nhận được <span className="text-[#e8c84a] font-bold">+{bonusXp} XP</span> hôm nay</p>
        <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-3 mb-5">
          <p className="text-[#e8c84a]/70 text-xs">
            {bonusXp === 5 ? "May mắn tối đa! Hôm nay là ngày đặc biệt!" : bonusXp >= 4 ? "Vận may tốt! Tiếp tục học nhé!" : "Đăng nhập mỗi ngày để nhận XP ngẫu nhiên 1-5!"}
          </p>
        </div>
        <button
          onClick={() => setShowBonus(false)}
          className="w-full py-3 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm cursor-pointer whitespace-nowrap transition-colors"
        >
          Nhận thưởng!
        </button>
      </div>
    </div>
  );
}

export default function RewardsPage() {
  const navigate = useNavigate();
  const [streak] = useLocalStorage<{ count: number }>("kts_streak", { count: 0 });
  const [examResults] = useLocalStorage<{ score: number; total: number }[]>("kts_eps_exam_results", []);
  const [flashcardKnown] = useLocalStorage<Record<string, boolean>>("kts_flashcard_known", {});
  const [answeredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [totalXp, setTotalXp] = useLocalStorage<number>("kts_total_xp", 0);
  const [redeemedRewards, setRedeemedRewards] = useLocalStorage<string[]>("kts_redeemed_rewards", []);
  const [redeemMsg, setRedeemMsg] = useState<{ id: string; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"rewards" | "history" | "earn" | "admin">("rewards");
  const [isAdmin] = useLocalStorage<boolean>(ADMIN_KEY, false);
  const [adminCode, setAdminCode] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [, setAdminMode] = useLocalStorage<boolean>(ADMIN_KEY, false);

  // Compute XP from activities
  const computedXp = useMemo(() => {
    const myBestScore = examResults.length > 0
      ? Math.max(...examResults.map(r => Math.round((r.score / r.total) * 100))) : 0;
    const wordsLearned = Object.values(flashcardKnown).filter(Boolean).length;
    const epsDone = Object.keys(answeredMap).length;
    return streak.count * 50 + myBestScore * 10 + wordsLearned * 5 + epsDone * 2;
  }, [streak, examResults, flashcardKnown, answeredMap]);

  // Use max of computed or stored
  const displayXp = Math.max(computedXp, totalXp);

  const handleRedeem = (reward: RewardItem) => {
    if (displayXp < reward.xpCost) return;
    if (redeemedRewards.includes(reward.id) && reward.type !== "badge") return;
    setTotalXp(prev => Math.max(0, prev - reward.xpCost));
    setRedeemedRewards(prev => [...prev, reward.id]);
    setRedeemMsg({ id: reward.id, msg: `Đã đổi thành công: ${reward.title}!` });
    setTimeout(() => setRedeemMsg(null), 3000);
  };

  const xpToNextReward = useMemo(() => {
    const affordable = REWARDS.filter(r => r.xpCost <= displayXp);
    const next = REWARDS.filter(r => r.xpCost > displayXp).sort((a, b) => a.xpCost - b.xpCost)[0];
    return { affordable: affordable.length, next };
  }, [displayXp]);

  // XP level
  const xpLevel = displayXp >= 5000 ? { label: "Huyền thoại", color: "#fb923c", icon: "ri-vip-diamond-line" }
    : displayXp >= 2000 ? { label: "Sử thi", color: "#a78bfa", icon: "ri-vip-crown-line" }
    : displayXp >= 1000 ? { label: "Hiếm", color: "#34d399", icon: "ri-medal-line" }
    : displayXp >= 300 ? { label: "Phổ thông", color: "#e8c84a", icon: "ri-star-line" }
    : { label: "Mới bắt đầu", color: "#ffffff60", icon: "ri-seedling-line" };

  const nextLevelXp = displayXp >= 5000 ? 5000 : displayXp >= 2000 ? 5000 : displayXp >= 1000 ? 2000 : displayXp >= 300 ? 1000 : 300;
  const prevLevelXp = displayXp >= 5000 ? 2000 : displayXp >= 2000 ? 1000 : displayXp >= 1000 ? 300 : 0;
  const levelProgress = Math.min(100, Math.round(((displayXp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));

  return (
    <DashboardLayout
      title="Phần thưởng & XP"
      subtitle="Tích lũy XP từ việc học, đổi lấy ưu đãi VIP và huy hiệu"
    >
      <DailyLoginBonus />

      {redeemMsg && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-medium px-4 py-3 rounded-xl">
          <i className="ri-checkbox-circle-fill"></i>
          {redeemMsg.msg}
        </div>
      )}

      {/* XP Overview */}
      <div className="bg-gradient-to-r from-[#1a1600] to-[#0f1117] border border-[#e8c84a]/15 rounded-2xl p-6 mb-6">
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
            <p className="text-white/40 text-sm mb-3">
              {xpToNextReward.affordable > 0 ? `Có thể đổi ${xpToNextReward.affordable} phần thưởng ngay!` : "Tiếp tục học để tích lũy XP"}
              {xpToNextReward.next && ` · Cần thêm ${(xpToNextReward.next.xpCost - displayXp).toLocaleString()} XP cho phần thưởng tiếp theo`}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${levelProgress}%`, backgroundColor: xpLevel.color }} />
              </div>
              <span className="text-white/30 text-xs whitespace-nowrap">{displayXp}/{nextLevelXp} XP</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            {[
              { label: "Streak", value: `${streak.count}d`, color: "#fb923c" },
              { label: "Đã đổi", value: redeemedRewards.length, color: "#34d399" },
            ].map(s => (
              <div key={s.label}>
                <p className="font-bold text-lg" style={{ color: s.color }}>{s.value}</p>
                <p className="text-white/30 text-[10px]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-white/3 p-1 rounded-xl mb-6 w-fit">
        {([["rewards", "ri-gift-line", "Đổi thưởng"], ["earn", "ri-add-circle-line", "Cách kiếm XP"], ["history", "ri-history-line", "Lịch sử"]] as const).map(([tab, icon, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/60"}`}
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
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/15 hover:text-white/30 cursor-pointer transition-colors whitespace-nowrap">
            <i className="ri-lock-line"></i>
          </button>
        )}
      </div>

      {/* Admin login modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAdminLogin(false)}>
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><i className="ri-shield-keyhole-line text-amber-400"></i>Xác thực Admin</h3>
            <input type="password" value={adminCode} onChange={e => setAdminCode(e.target.value)}
              placeholder="Nhập mã admin..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 mb-3" />
            <div className="flex gap-3">
              <button onClick={() => setShowAdminLogin(false)} className="flex-1 py-2.5 border border-white/10 text-white/50 rounded-xl text-sm cursor-pointer hover:bg-white/5 transition-colors">Hủy</button>
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
                className={`bg-[#0f1117] border rounded-2xl p-5 transition-all relative ${reward.popular ? "border-[#e8c84a]/20" : "border-white/5"} ${!canAfford ? "opacity-60" : "hover:border-white/10"}`}
              >
                {reward.popular && (
                  <div className="absolute -top-2.5 left-4">
                    <span className="bg-[#e8c84a] text-[#0f1117] text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">Phổ biến</span>
                  </div>
                )}
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl mb-4" style={{ backgroundColor: `${reward.color}15` }}>
                  <i className={`${reward.icon} text-2xl`} style={{ color: reward.color }}></i>
                </div>
                <h3 className="text-white font-bold text-sm mb-1">{reward.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed mb-4">{reward.desc}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <i className="ri-star-fill text-[#e8c84a] text-xs"></i>
                    <span className="text-[#e8c84a] font-bold text-sm">{reward.xpCost.toLocaleString()} XP</span>
                  </div>
                  <span className="text-white/20 text-[10px]">Còn {reward.stock}</span>
                </div>
                {redeemed ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center">
                    <i className="ri-checkbox-circle-fill mr-1"></i>Đã đổi
                  </div>
                ) : (
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${canAfford ? "bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117]" : "bg-white/5 text-white/25 cursor-not-allowed"}`}
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
          <div className="bg-gradient-to-r from-[#1a1600] to-[#0f1117] border border-[#e8c84a]/20 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#e8c84a]/15 flex-shrink-0">
                <i className="ri-gift-line text-[#e8c84a] text-2xl"></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-bold text-base">Đăng nhập hàng ngày</p>
                  <span className="bg-[#e8c84a]/15 text-[#e8c84a] text-[10px] font-bold px-2 py-0.5 rounded-full">Mới!</span>
                </div>
                <p className="text-white/50 text-sm">Nhận <span className="text-[#e8c84a] font-bold">1–5 XP ngẫu nhiên</span> mỗi ngày khi mở app. Hôm nay bạn đã nhận rồi!</p>
              </div>
              <div className="text-center">
                <p className="text-[#e8c84a] font-bold text-2xl">1–5</p>
                <p className="text-white/30 text-xs">XP/ngày</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Tất cả cách kiếm XP</h3>
            <div className="space-y-3">
              {XP_SOURCES.map(s => (
                <div key={s.label} className="flex items-center gap-4 px-4 py-3 bg-white/3 rounded-xl">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/80 text-sm font-medium">{s.label}</p>
                    <p className="text-white/30 text-xs">{s.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: s.color }}>{s.xp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* XP Penalties */}
          <div className="bg-[#0f1117] border border-red-500/15 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-1 flex items-center gap-2">
              <i className="ri-error-warning-line text-red-400"></i>Phạt XP — Tránh những điều này
            </h3>
            <p className="text-white/30 text-xs mb-4">Hệ thống phạt nhẹ để tạo động lực duy trì thói quen học</p>
            <div className="space-y-3">
              {XP_PENALTIES.map(s => (
                <div key={s.label} className="flex items-center gap-4 px-4 py-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 bg-red-500/10">
                    <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/80 text-sm font-medium" dangerouslySetInnerHTML={{ __html: sanitizeHtml(s.label) }}></p>
                    <p className="text-white/30 text-xs">{s.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-red-400">{s.xp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-4">
            <p className="text-[#e8c84a]/80 text-xs font-semibold mb-1">Mẹo tích XP nhanh nhất</p>
            <p className="text-white/40 text-xs leading-relaxed">
              Duy trì streak mỗi ngày là cách kiếm XP hiệu quả nhất. Kết hợp thi thử EPS điểm cao, học flashcard Hán Hàn và ghi âm phát âm để leo hạng nhanh. Tránh bỏ học nhiều ngày liên tiếp vì sẽ bị phạt XP!
            </p>
            <button onClick={() => navigate("/daily-plan")} className="mt-2 flex items-center gap-1.5 text-[#e8c84a] text-xs font-semibold cursor-pointer whitespace-nowrap hover:text-[#e8c84a]/80">
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
              <p className="text-white/30 text-sm">Chưa đổi phần thưởng nào</p>
              <button onClick={() => setActiveTab("rewards")} className="mt-3 text-[#e8c84a] text-xs cursor-pointer whitespace-nowrap">
                Xem phần thưởng có thể đổi →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {redeemedRewards.map(id => {
                const reward = REWARDS.find(r => r.id === id);
                if (!reward) return null;
                return (
                  <div key={id} className="flex items-center gap-4 px-4 py-4 bg-[#0f1117] border border-white/5 rounded-xl">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${reward.color}15` }}>
                      <i className={`${reward.icon} text-lg`} style={{ color: reward.color }}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/80 text-sm font-medium">{reward.title}</p>
                      <p className="text-white/30 text-xs">{reward.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 text-sm font-bold">-{reward.xpCost.toLocaleString()} XP</p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <i className="ri-checkbox-circle-fill text-emerald-400 text-xs"></i>
                        <span className="text-emerald-400 text-[10px]">Đã đổi</span>
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

