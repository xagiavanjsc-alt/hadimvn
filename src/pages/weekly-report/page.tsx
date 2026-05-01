import { useState, useMemo, useCallback, useRef } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { useWebPush } from "@/hooks/useWebPush";
import { epsQuestions } from "@/mocks/epsQuestions";
import { epsVocabulary } from "@/mocks/epsVocabulary";

// ─── Types ────────────────────────────────────────────────────────────────
interface WeeklyReportData {
  weekLabel: string;
  startDate: string;
  endDate: string;
  xpEarned: number;
  wordsLearned: number;
  questionsAnswered: number;
  correctAnswers: number;
  streakDays: number;
  studyDays: number;
  topicsStudied: string[];
  quizScores: { date: string; score: number; total: number; lesson: string }[];
  srCardsReviewed: number;
  srMastered: number;
}

interface EmailStatus {
  loading: boolean;
  success: boolean;
  error: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function getWeekRange(weeksAgo: number): { start: Date; end: Date; label: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - dayOfWeek);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const start = new Date(startOfThisWeek);
  start.setDate(start.getDate() - weeksAgo * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
  const label = weeksAgo === 0 ? `Tuần này (${fmt(start)} - ${fmt(end)})` : weeksAgo === 1 ? `Tuần trước (${fmt(start)} - ${fmt(end)})` : `${fmt(start)} - ${fmt(end)}`;

  return { start, end, label };
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

// ─── Stat Card ────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 flex items-center justify-center rounded-2xl flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
        <i className={`${icon} text-xl`} style={{ color }}></i>
      </div>
      <div>
        <p className="text-white font-bold text-2xl leading-none">{value}</p>
        <p className="text-white/50 text-xs mt-1">{label}</p>
        {sub && <p className="text-white/25 text-[10px] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────
function MiniBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-sm transition-all duration-500" style={{ height: `${(d.value / max) * 52}px`, backgroundColor: d.value > 0 ? color : "rgba(255,255,255,0.05)", minHeight: "4px" }}></div>
          <span className="text-[9px] text-white/25">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Email Preview Modal ──────────────────────────────────────────────────
function EmailPreviewModal({ report, email, onClose, onSend, sending }: {
  report: WeeklyReportData; email: string; onClose: () => void; onSend: () => void; sending: boolean;
}) {
  const accuracy = report.questionsAnswered > 0 ? Math.round((report.correctAnswers / report.questionsAnswered) * 100) : 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1a1d27] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-white font-bold text-base">Xem trước email báo cáo</h3>
            <p className="text-white/40 text-xs mt-0.5">Gửi đến: {email}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Email preview */}
        <div className="p-6">
          <div className="bg-[#0f1117] rounded-2xl overflow-hidden border border-white/5">
            {/* Email header */}
            <div className="bg-gradient-to-r from-[#e8c84a]/20 to-[#fb923c]/10 p-6 text-center border-b border-white/5">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#e8c84a]/20 mx-auto mb-3">
                <i className="ri-bar-chart-box-line text-[#e8c84a] text-2xl"></i>
              </div>
              <h2 className="text-white font-bold text-lg">Báo cáo học tập tuần</h2>
              <p className="text-white/50 text-sm mt-1">{report.weekLabel}</p>
              <p className="text-white/30 text-xs mt-1">Hàn Quốc Ơi! — Học tiếng Hàn</p>
            </div>

            {/* Stats grid */}
            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                { icon: "ri-flashlight-line", label: "XP kiếm được", value: `+${report.xpEarned}`, color: "#e8c84a" },
                { icon: "ri-translate-2", label: "Từ đã học", value: report.wordsLearned, color: "#34d399" },
                { icon: "ri-fire-line", label: "Streak", value: `${report.streakDays} ngày`, color: "#fb923c" },
                { icon: "ri-percent-line", label: "Độ chính xác", value: `${accuracy}%`, color: "#a78bfa" },
                { icon: "ri-calendar-check-line", label: "Ngày học", value: `${report.studyDays}/7`, color: "#38bdf8" },
                { icon: "ri-brain-line", label: "SR đã ôn", value: report.srCardsReviewed, color: "#f43f5e" },
              ].map(s => (
                <div key={s.label} className="bg-white/3 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                  </div>
                  <div>
                    <p className="text-white font-bold text-base leading-none">{s.value}</p>
                    <p className="text-white/40 text-[10px] mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quiz scores */}
            {report.quizScores.length > 0 && (
              <div className="px-5 pb-5">
                <p className="text-white/50 text-xs font-semibold mb-3 tracking-normal">Kết quả quiz tuần này</p>
                <div className="space-y-2">
                  {report.quizScores.slice(0, 5).map((q, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-2">
                      <span className="text-white/60 text-xs truncate flex-1">{q.lesson}</span>
                      <span className="text-[#e8c84a] font-bold text-xs ml-2">{q.score}/{q.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Motivational message */}
            <div className="px-5 pb-5">
              <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-4 text-center">
                <p className="text-[#e8c84a] text-sm font-semibold mb-1">
                  {report.studyDays >= 5 ? "Xuất sắc! Bạn học rất chăm chỉ!" : report.studyDays >= 3 ? "Tốt lắm! Tiếp tục duy trì nhé!" : "Hãy cố gắng hơn tuần tới!"}
                </p>
                <p className="text-white/40 text-xs">Tiếp tục học mỗi ngày để đạt mục tiêu EPS-TOPIK!</p>
              </div>
            </div>

            <div className="px-5 pb-5 text-center">
              <p className="text-white/20 text-[10px]">Email này được gửi tự động từ Hàn Quốc Ơi!</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/8 text-white/60 text-sm rounded-xl cursor-pointer whitespace-nowrap transition-colors">
            Hủy
          </button>
          <button onClick={onSend} disabled={sending} className="flex-1 py-3 bg-[#e8c84a] hover:bg-[#d4b43a] disabled:opacity-50 text-[#0f1117] font-bold text-sm rounded-xl cursor-pointer whitespace-nowrap transition-colors">
            {sending ? <><i className="ri-loader-4-line animate-spin mr-2"></i>Đang gửi...</> : <><i className="ri-send-plane-line mr-2"></i>Gửi email ngay</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function WeeklyReportPage() {
  const { user, profile } = useAuth();
  const [xpData] = useLocalStorage<{ total: number }>("kts_xp_total", { total: 0 });
  const [streak] = useLocalStorage<{ count: number; lastDate: string }>("kts_streak", { count: 0, lastDate: "" });
  const [epsAnswers] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [quizHistory] = useLocalStorage<{ date: string; score: number; total: number; lesson: string }[]>("kts_quiz_history", []);
  const [srCards] = useLocalStorage<Record<string, { repetitions: number; lastReview?: string }>>("kts_eps_sr_cards", {});
  const [srWrongCards] = useLocalStorage<Record<string, { repetitions: number; lastReview?: string }>>("kts_eps_wrong_sr", {});
  const [flashcardKnown] = useLocalStorage<Record<string, boolean>>("kts_flashcard_known", {});

  const [selectedWeek, setSelectedWeek] = useState(0);
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [exportingPdf, setExportingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>({ loading: false, success: false, error: "" });
  const [autoSendEnabled, setAutoSendEnabled] = useLocalStorage<boolean>("kts_weekly_report_auto", false);
  const [reportEmail, setReportEmail] = useLocalStorage<string>("kts_weekly_report_email", "");
  const [savedEmail, setSavedEmail] = useState(false);
  const { supported: pushSupported, permission: pushPermission, settings: pushSettings, requestPermission, updateSettings: updatePushSettings, testNotification, testSRNotification, countSRDueToday } = useWebPush();

  const weeks = [0, 1, 2, 3].map(w => getWeekRange(w));

  // Build report data for selected week
  const report = useMemo((): WeeklyReportData => {
    const { start, end, label } = weeks[selectedWeek];
    const startStr = formatDate(start);
    const endStr = formatDate(end);

    // Quiz scores in this week
    const weekQuizzes = quizHistory.filter(q => q.date >= startStr && q.date <= endStr);
    const correctAnswers = weekQuizzes.reduce((sum, q) => sum + q.score, 0);
    const totalAnswered = weekQuizzes.reduce((sum, q) => sum + q.total, 0);

    // EPS answers (all time, approximate for week)
    const totalEpsAnswered = Object.keys(epsAnswers).length;
    const totalEpsCorrect = Object.entries(epsAnswers).filter(([id, ans]) => {
      const q = epsQuestions.find(q => q.id === id);
      return q && ans === q.correctIndex;
    }).length;

    // Words learned (flashcard known)
    const wordsLearned = Object.values(flashcardKnown).filter(Boolean).length;

    // SR reviewed this week
    const srReviewed = Object.values({ ...srCards, ...srWrongCards }).filter(c => c.lastReview && c.lastReview >= startStr && c.lastReview <= endStr).length;
    const srMastered = Object.values(srCards).filter(c => c.repetitions >= 5).length;

    // Study days (approximate from quiz history)
    const studyDatesSet = new Set(weekQuizzes.map(q => q.date));
    const studyDays = studyDatesSet.size;

    // XP earned this week (approximate: 10 XP per quiz question correct)
    const xpEarned = correctAnswers * 10 + wordsLearned * 5;

    // Topics studied
    const topicsSet = new Set(weekQuizzes.map(q => q.lesson.split(" ")[0]));
    const topicsStudied = Array.from(topicsSet).slice(0, 5);

    return {
      weekLabel: label,
      startDate: startStr,
      endDate: endStr,
      xpEarned: Math.min(xpEarned, xpData.total),
      wordsLearned,
      questionsAnswered: totalAnswered || totalEpsAnswered,
      correctAnswers: correctAnswers || totalEpsCorrect,
      streakDays: streak.count,
      studyDays: Math.max(studyDays, selectedWeek === 0 ? 1 : 0),
      topicsStudied,
      quizScores: weekQuizzes,
      srCardsReviewed: srReviewed,
      srMastered,
    };
  }, [selectedWeek, quizHistory, epsAnswers, flashcardKnown, srCards, srWrongCards, xpData, streak]);

  // Daily activity chart (mock based on quiz history)
  const dailyActivity = useMemo(() => {
    const { start } = weeks[selectedWeek];
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days.map((label, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = formatDate(d);
      const dayQuizzes = quizHistory.filter(q => q.date === dateStr);
      const value = dayQuizzes.reduce((sum, q) => sum + q.score, 0);
      return { label, value };
    });
  }, [selectedWeek, quizHistory]);

  const accuracy = report.questionsAnswered > 0 ? Math.round((report.correctAnswers / report.questionsAnswered) * 100) : 0;

  const handleSendEmail = useCallback(async () => {
    const targetEmail = emailInput.trim() || user?.email || "";
    if (!targetEmail) {
      setEmailStatus({ loading: false, success: false, error: "Vui lòng nhập địa chỉ email" });
      return;
    }

    setEmailStatus({ loading: true, success: false, error: "" });

    try {
      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

      const emailBody = `
Xin chào ${profile?.display_name || "Học viên"}!

📊 BÁO CÁO HỌC TẬP TUẦN — ${report.weekLabel}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ XP kiếm được: +${report.xpEarned} XP
📚 Từ đã học: ${report.wordsLearned} từ
🔥 Streak hiện tại: ${report.streakDays} ngày liên tiếp
🎯 Độ chính xác: ${accuracy}%
📅 Số ngày học: ${report.studyDays}/7 ngày
🧠 Thẻ SR đã ôn: ${report.srCardsReviewed} thẻ
🏆 Thẻ SR nắm vững: ${report.srMastered} thẻ

${report.quizScores.length > 0 ? `📝 KẾT QUẢ QUIZ TUẦN NÀY:
${report.quizScores.slice(0, 5).map(q => `  • ${q.lesson}: ${q.score}/${q.total} điểm`).join("\n")}` : ""}

${report.studyDays >= 5 ? "🌟 Xuất sắc! Bạn học rất chăm chỉ tuần này!" : report.studyDays >= 3 ? "👍 Tốt lắm! Tiếp tục duy trì nhé!" : "💪 Hãy cố gắng hơn tuần tới!"}

Tiếp tục học mỗi ngày để đạt mục tiêu EPS-TOPIK!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hàn Quốc Ơi! — Học tiếng Hàn hiệu quả
      `.trim();

      const res = await fetch(`${supabaseUrl}/functions/v1/send-email-resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          type: "weekly_report",
          to: targetEmail,
          subject: `📊 Báo cáo học tập tuần — ${report.weekLabel} | Hàn Quốc Ơi!`,
          displayName: profile?.display_name || "Học viên",
          body: emailBody,
          reportData: {
            weekLabel: report.weekLabel,
            xpEarned: report.xpEarned,
            wordsLearned: report.wordsLearned,
            streakDays: report.streakDays,
            accuracy,
            studyDays: report.studyDays,
            srCardsReviewed: report.srCardsReviewed,
            srMastered: report.srMastered,
            quizScores: report.quizScores.slice(0, 5),
          },
        }),
      });

      if (res.ok) {
        setEmailStatus({ loading: false, success: true, error: "" });
        setShowPreview(false);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gửi email thất bại");
      }
    } catch (err) {
      setEmailStatus({ loading: false, success: false, error: err instanceof Error ? err.message : "Lỗi không xác định" });
    }
  }, [emailInput, user, profile, report, accuracy]);

  const handleSaveEmail = () => {
    setReportEmail(emailInput);
    setSavedEmail(true);
    setTimeout(() => setSavedEmail(false), 2000);
  };

  const handleExportPdf = useCallback(() => {
    setExportingPdf(true);
    // Inject print styles
    const styleId = "kts-print-style";
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.textContent = `
      @media print {
        body > * { display: none !important; }
        #kts-pdf-content { display: block !important; }
        #kts-pdf-content { position: fixed; top: 0; left: 0; width: 100%; background: white; color: black; padding: 24px; font-family: sans-serif; }
        .pdf-stat { display: inline-block; width: 30%; margin: 4px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
        .pdf-title { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
        .pdf-sub { font-size: 13px; color: #666; margin-bottom: 16px; }
        .pdf-section { margin-top: 16px; }
        .pdf-section-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        .pdf-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
        .pdf-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
      }
    `;

    // Build print content
    const el = document.getElementById("kts-pdf-content");
    if (el) {
      el.style.display = "block";
      el.innerHTML = `
        <div class="pdf-title">📊 Báo cáo học tập tuần</div>
        <div class="pdf-sub">${report.weekLabel} — Hàn Quốc Ơi!</div>
        <div>
          <div class="pdf-stat"><strong>${report.xpEarned}</strong><br/><small>XP kiếm được</small></div>
          <div class="pdf-stat"><strong>${report.wordsLearned}</strong><br/><small>Từ đã học</small></div>
          <div class="pdf-stat"><strong>${report.streakDays} ngày</strong><br/><small>Streak</small></div>
          <div class="pdf-stat"><strong>${accuracy}%</strong><br/><small>Độ chính xác</small></div>
          <div class="pdf-stat"><strong>${report.studyDays}/7</strong><br/><small>Ngày học</small></div>
          <div class="pdf-stat"><strong>${report.srCardsReviewed}</strong><br/><small>SR đã ôn</small></div>
        </div>
        ${report.quizScores.length > 0 ? `
        <div class="pdf-section">
          <div class="pdf-section-title">Kết quả quiz tuần này</div>
          ${report.quizScores.slice(0, 8).map(q => `
            <div class="pdf-row">
              <span>${q.lesson}</span>
              <span><strong>${q.score}/${q.total}</strong> (${q.total > 0 ? Math.round(q.score / q.total * 100) : 0}%)</span>
            </div>
          `).join("")}
        </div>` : ""}
        <div class="pdf-section">
          <div class="pdf-section-title">Tóm tắt</div>
          <div class="pdf-row"><span>Tổng XP tích lũy</span><span><strong>${xpData.total.toLocaleString()} XP</strong></span></div>
          <div class="pdf-row"><span>Streak hiện tại</span><span><strong>${streak.count} ngày</strong></span></div>
          <div class="pdf-row"><span>Thẻ SR nắm vững</span><span><strong>${report.srMastered}</strong></span></div>
        </div>
        <div style="margin-top:20px; font-size:11px; color:#999; text-align:center;">Xuất từ Hàn Quốc Ơi! — ${new Date().toLocaleDateString("vi-VN")}</div>
      `;
    }

    setTimeout(() => {
      window.print();
      if (el) el.style.display = "none";
      setExportingPdf(false);
    }, 200);
  }, [report, accuracy, xpData, streak]);

  return (
    <DashboardLayout
      title="Báo cáo học tập tuần"
      subtitle="Tổng kết XP, từ đã học, streak và điểm quiz — gửi qua email mỗi tuần"
      actions={
        <button
          onClick={handleExportPdf}
          disabled={exportingPdf}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/80 text-sm rounded-xl cursor-pointer whitespace-nowrap transition-colors disabled:opacity-50"
        >
          <i className={exportingPdf ? "ri-loader-4-line animate-spin" : "ri-file-pdf-line"}></i>
          {exportingPdf ? "Đang xuất..." : "Xuất PDF"}
        </button>
      }
    >
      {/* Hidden print content */}
      <div id="kts-pdf-content" style={{ display: "none" }} ref={printRef}></div>
      {/* Week selector */}
      <div className="flex items-center gap-3 mb-6">
        <p className="text-white/50 text-sm">Chọn tuần:</p>
        <div className="flex items-center bg-white/5 rounded-xl p-1 flex-wrap gap-1">
          {weeks.map((w, i) => (
            <button
              key={i}
              onClick={() => setSelectedWeek(i)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedWeek === i ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/70"}`}
            >
              {i === 0 ? "Tuần này" : i === 1 ? "Tuần trước" : w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon="ri-flashlight-line" label="XP kiếm được" value={`+${report.xpEarned}`} sub="tuần này" color="#e8c84a" />
        <StatCard icon="ri-translate-2" label="Từ đã học" value={report.wordsLearned} sub="tổng cộng" color="#34d399" />
        <StatCard icon="ri-fire-line" label="Streak hiện tại" value={`${report.streakDays} ngày`} sub="liên tiếp" color="#fb923c" />
        <StatCard icon="ri-percent-line" label="Độ chính xác" value={`${accuracy}%`} sub={`${report.correctAnswers}/${report.questionsAnswered} câu`} color="#a78bfa" />
        <StatCard icon="ri-calendar-check-line" label="Ngày học" value={`${report.studyDays}/7`} sub="ngày trong tuần" color="#38bdf8" />
        <StatCard icon="ri-brain-line" label="SR đã ôn" value={report.srCardsReviewed} sub={`${report.srMastered} thẻ nắm vững`} color="#f43f5e" />
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6">
        {/* Left */}
        <div className="space-y-5">
          {/* Activity chart */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-semibold text-sm">Hoạt động trong tuần</p>
              <span className="text-white/30 text-xs">{report.weekLabel}</span>
            </div>
            <MiniBarChart data={dailyActivity} color="#e8c84a" />
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#e8c84a]"></div>
                <span className="text-white/30 text-[10px]">Điểm quiz mỗi ngày</span>
              </div>
            </div>
          </div>

          {/* Quiz history */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-4">Kết quả quiz tuần này</p>
            {report.quizScores.length === 0 ? (
              <div className="text-center py-6">
                <i className="ri-file-list-3-line text-white/15 text-3xl mb-2 block"></i>
                <p className="text-white/30 text-sm">Chưa có quiz nào trong tuần này</p>
                <p className="text-white/20 text-xs mt-1">Hãy làm bài thi EPS hoặc quiz để có dữ liệu</p>
              </div>
            ) : (
              <div className="space-y-2">
                {report.quizScores.map((q, i) => {
                  const pct = q.total > 0 ? Math.round((q.score / q.total) * 100) : 0;
                  const color = pct >= 80 ? "#34d399" : pct >= 60 ? "#e8c84a" : "#f87171";
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                        <i className="ri-file-list-3-line text-sm" style={{ color }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-xs font-medium truncate">{q.lesson}</p>
                        <p className="text-white/30 text-[10px]">{q.date}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-sm" style={{ color }}>{q.score}/{q.total}</p>
                        <p className="text-white/30 text-[10px]">{pct}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Progress comparison */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-4">Tiến độ tổng thể</p>
            <div className="space-y-4">
              {[
                { label: "Từ vựng EPS", current: report.wordsLearned, total: 1500, color: "#e8c84a" },
                { label: "Câu hỏi EPS đã làm", current: report.questionsAnswered, total: epsQuestions.length, color: "#34d399" },
                { label: "Thẻ SR nắm vững", current: report.srMastered, total: epsVocabulary.length, color: "#a78bfa" },
              ].map(item => {
                const pct = Math.min(100, Math.round((item.current / item.total) * 100));
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white/50 text-xs">{item.label}</span>
                      <span className="text-white/30 text-xs">{item.current}/{item.total} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: item.color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Email settings */}
        <div className="space-y-4">
          {/* Send report */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#e8c84a]/10">
                <i className="ri-mail-send-line text-[#e8c84a] text-sm"></i>
              </div>
              <p className="text-white font-semibold text-sm">Gửi báo cáo qua email</p>
            </div>

            <div className="mb-4">
              <label className="text-white/40 text-xs mb-1.5 block">Địa chỉ email nhận báo cáo</label>
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/40"
              />
            </div>

            {emailStatus.success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-3 flex items-center gap-2">
                <i className="ri-checkbox-circle-fill text-emerald-400"></i>
                <p className="text-emerald-400 text-xs">Email đã được gửi thành công!</p>
              </div>
            )}
            {emailStatus.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-3">
                <p className="text-red-400 text-xs">{emailStatus.error}</p>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => { setEmailStatus({ loading: false, success: false, error: "" }); setShowPreview(true); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm rounded-xl cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-eye-line"></i>Xem trước & Gửi email
              </button>
              <button
                onClick={handleSaveEmail}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/8 text-white/60 text-sm rounded-xl cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className={savedEmail ? "ri-checkbox-circle-line text-emerald-400" : "ri-save-line"}></i>
                {savedEmail ? "Đã lưu!" : "Lưu email mặc định"}
              </button>
            </div>
          </div>

          {/* Auto send */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-semibold text-sm">Gửi tự động hàng tuần</p>
                <p className="text-white/35 text-xs mt-0.5">Mỗi thứ Hai lúc 8:00 sáng</p>
              </div>
              <button
                onClick={() => setAutoSendEnabled(v => !v)}
                className={`relative w-10 h-5 rounded-full transition-all cursor-pointer flex-shrink-0 ${autoSendEnabled ? "bg-[#e8c84a]" : "bg-white/10"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${autoSendEnabled ? "left-5" : "left-0.5"}`}></div>
              </button>
            </div>
            {autoSendEnabled && (
              <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-3">
                <p className="text-[#e8c84a] text-xs">
                  <i className="ri-information-line mr-1"></i>
                  Báo cáo sẽ được gửi đến: <strong>{reportEmail || emailInput || "chưa cài đặt"}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Summary card */}
          <div className="bg-gradient-to-br from-[#1a1600] to-[#0f1117] border border-[#e8c84a]/15 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-trophy-line text-[#e8c84a] text-sm"></i>
              <p className="text-white font-semibold text-sm">Tóm tắt tuần</p>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Tổng XP tích lũy", value: `${xpData.total.toLocaleString()} XP`, color: "#e8c84a" },
                { label: "Streak hiện tại", value: `${streak.count} ngày`, color: "#fb923c" },
                { label: "Từ vựng đã học", value: `${report.wordsLearned} từ`, color: "#34d399" },
                { label: "Độ chính xác EPS", value: `${accuracy}%`, color: "#a78bfa" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">{s.label}</span>
                  <span className="font-bold text-sm" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Web Push Notifications */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#a78bfa]/10">
                <i className="ri-notification-3-line text-[#a78bfa] text-sm"></i>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Web Push Notifications</p>
                <p className="text-white/30 text-[10px]">Nhắc nhở học tập trên trình duyệt</p>
              </div>
            </div>

            {!pushSupported ? (
              <div className="bg-white/3 rounded-xl p-3">
                <p className="text-white/30 text-xs">Trình duyệt của bạn không hỗ trợ Web Push</p>
              </div>
            ) : pushPermission === "denied" ? (
              <div className="bg-[#f87171]/5 border border-[#f87171]/15 rounded-xl p-3">
                <p className="text-[#f87171] text-xs">
                  <i className="ri-error-warning-line mr-1"></i>
                  Thông báo bị chặn. Vào cài đặt trình duyệt để bật lại.
                </p>
              </div>
            ) : pushPermission !== "granted" ? (
              <button
                onClick={requestPermission}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#a78bfa]/10 hover:bg-[#a78bfa]/20 border border-[#a78bfa]/20 text-[#a78bfa] text-sm font-semibold rounded-xl cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-notification-3-line"></i>Bật thông báo
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/65 text-xs font-medium">Nhắc báo cáo thứ Hai</p>
                    <p className="text-white/30 text-[10px]">Lúc {pushSettings.weeklyReportHour}:00 sáng</p>
                  </div>
                  <button
                    onClick={() => updatePushSettings({ weeklyReport: !pushSettings.weeklyReport })}
                    className={`relative w-9 h-5 rounded-full transition-all cursor-pointer flex-shrink-0 ${pushSettings.weeklyReport ? "bg-[#a78bfa]" : "bg-white/10"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${pushSettings.weeklyReport ? "left-4" : "left-0.5"}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/65 text-xs font-medium">Nhắc học hàng ngày</p>
                    <p className="text-white/30 text-[10px]">Lúc {pushSettings.studyReminderHour}:00 tối</p>
                  </div>
                  <button
                    onClick={() => updatePushSettings({ studyReminder: !pushSettings.studyReminder })}
                    className={`relative w-9 h-5 rounded-full transition-all cursor-pointer flex-shrink-0 ${pushSettings.studyReminder ? "bg-[#a78bfa]" : "bg-white/10"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${pushSettings.studyReminder ? "left-4" : "left-0.5"}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/65 text-xs font-medium">Nhắc ôn tập SR</p>
                    <p className="text-white/30 text-[10px]">
                      Lúc {pushSettings.srReminderHour}:00 sáng
                      {countSRDueToday() > 0 && <span className="text-[#f43f5e] ml-1">· {countSRDueToday()} thẻ hôm nay</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => updatePushSettings({ srReminder: !pushSettings.srReminder })}
                    className={`relative w-9 h-5 rounded-full transition-all cursor-pointer flex-shrink-0 ${pushSettings.srReminder ? "bg-[#f43f5e]" : "bg-white/10"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${pushSettings.srReminder ? "left-4" : "left-0.5"}`}></div>
                  </button>
                </div>
                <button
                  onClick={testSRNotification}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#f43f5e]/5 hover:bg-[#f43f5e]/10 text-[#f43f5e]/60 text-xs rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                >
                  <i className="ri-brain-line text-xs"></i>Thử nhắc SR
                </button>
                <button
                  onClick={testNotification}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/8 text-white/40 text-xs rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                >
                  <i className="ri-send-plane-line text-xs"></i>Gửi thông báo thử
                </button>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <p className="text-emerald-400/70 text-[10px]">Thông báo đã được bật</p>
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <p className="text-white/50 text-xs font-semibold mb-3 tracking-normal">Gợi ý cải thiện</p>
            <div className="space-y-2.5">
              {accuracy < 70 && (
                <div className="flex items-start gap-2">
                  <i className="ri-error-warning-line text-[#f87171] text-sm flex-shrink-0 mt-0.5"></i>
                  <p className="text-white/45 text-xs">Độ chính xác thấp — hãy ôn lại câu sai qua SR</p>
                </div>
              )}
              {report.studyDays < 5 && (
                <div className="flex items-start gap-2">
                  <i className="ri-calendar-line text-[#fb923c] text-sm flex-shrink-0 mt-0.5"></i>
                  <p className="text-white/45 text-xs">Cố gắng học ít nhất 5 ngày/tuần để duy trì streak</p>
                </div>
              )}
              {report.srCardsReviewed === 0 && (
                <div className="flex items-start gap-2">
                  <i className="ri-brain-line text-[#a78bfa] text-sm flex-shrink-0 mt-0.5"></i>
                  <p className="text-white/45 text-xs">Chưa ôn SR tuần này — vào Spaced Repetition để ôn</p>
                </div>
              )}
              {report.studyDays >= 5 && accuracy >= 70 && report.srCardsReviewed > 0 && (
                <div className="flex items-start gap-2">
                  <i className="ri-checkbox-circle-line text-emerald-400 text-sm flex-shrink-0 mt-0.5"></i>
                  <p className="text-white/45 text-xs">Tuyệt vời! Bạn đang học rất hiệu quả tuần này!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email preview modal */}
      {showPreview && (
        <EmailPreviewModal
          report={report}
          email={emailInput}
          onClose={() => setShowPreview(false)}
          onSend={handleSendEmail}
          sending={emailStatus.loading}
        />
      )}
    </DashboardLayout>
  );
}
