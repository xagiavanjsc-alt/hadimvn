import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ─── All features data ────────────────────────────────────────────────────────
interface Feature {
  path: string;
  label: string;
  icon: string;
  tags: string[];
  description: string;
  isNew?: boolean;
  isHot?: boolean;
}

const ALL_FEATURES: Feature[] = [
  // EPS hidden features
  { path: "/eps", label: "Tổng quan EPS", icon: "ri-file-list-3-line", tags: ["EPS", "Tổng quan"], description: "Trang tổng quan EPS-TOPIK với thống kê và lộ trình học" },
  { path: "/eps-lesson-quiz", label: "Quiz theo bài EPS", icon: "ri-gamepad-line", tags: ["EPS", "Quiz"], description: "Làm quiz theo từng bài học EPS cụ thể" },
  { path: "/eps-topic-drill", label: "Luyện tập chủ đề EPS", icon: "ri-focus-3-line", tags: ["EPS", "Luyện tập"], description: "Luyện tập chuyên sâu theo từng chủ đề EPS" },
  { path: "/eps-topic-study", label: "Học theo chủ đề EPS", icon: "ri-apps-line", tags: ["EPS", "Học tập"], description: "Học từ vựng và ngữ pháp theo chủ đề EPS" },
  { path: "/eps-topic-stats", label: "Thống kê chủ đề EPS", icon: "ri-pie-chart-line", tags: ["EPS", "Thống kê"], description: "Xem thống kê tiến độ theo từng chủ đề EPS" },
  { path: "/eps-vocab-export", label: "Xuất từ vựng EPS", icon: "ri-download-2-line", tags: ["EPS", "Xuất file"], description: "Xuất từ vựng EPS ra CSV, Anki, PDF" },
  { path: "/eps-vocab-flashcard", label: "Flashcard từ vựng EPS", icon: "ri-stack-line", tags: ["EPS", "Flashcard"], description: "Flashcard chuyên biệt cho từ vựng EPS" },
  { path: "/eps-weakness-analysis", label: "Phân tích điểm yếu EPS", icon: "ri-stethoscope-line", tags: ["EPS", "Phân tích"], description: "AI phân tích điểm yếu và đề xuất ôn tập" },
  { path: "/eps-weekly-progress", label: "Tiến độ tuần EPS", icon: "ri-calendar-check-line", tags: ["EPS", "Tiến độ"], description: "Theo dõi tiến độ học EPS theo tuần" },
  { path: "/eps-wrong-topic", label: "Câu sai theo chủ đề EPS", icon: "ri-error-warning-line", tags: ["EPS", "Ôn tập"], description: "Xem và ôn lại câu sai phân loại theo chủ đề" },
  { path: "/eps-review-history", label: "Lịch sử ôn tập EPS", icon: "ri-history-line", tags: ["EPS", "Lịch sử"], description: "Xem lại toàn bộ lịch sử ôn tập EPS" },
  { path: "/eps-quick-review", label: "Ôn nhanh EPS", icon: "ri-flashlight-line", tags: ["EPS", "Ôn tập"], description: "Ôn tập nhanh 10 phút mỗi ngày với EPS" },
  { path: "/eps-official-exam", label: "Đề thi chính thức EPS", icon: "ri-file-paper-2-line", tags: ["EPS", "Thi thử"], description: "Làm đề thi EPS chính thức từ các năm trước" },
  { path: "/eps-personalized-roadmap", label: "Lộ trình cá nhân EPS", icon: "ri-route-line", tags: ["EPS", "Lộ trình"], description: "Lộ trình học EPS được cá nhân hóa theo trình độ" },
  { path: "/eps-progress-roadmap", label: "Bản đồ tiến độ EPS", icon: "ri-map-2-line", tags: ["EPS", "Tiến độ"], description: "Bản đồ trực quan tiến độ học EPS" },
  { path: "/eps-study-group", label: "Nhóm học EPS", icon: "ri-group-line", tags: ["EPS", "Cộng đồng"], description: "Tham gia nhóm học EPS cùng bạn bè" },
  { path: "/eps-global-leaderboard", label: "BXH toàn cầu EPS", icon: "ri-earth-line", tags: ["EPS", "Xếp hạng"], description: "Bảng xếp hạng EPS toàn cầu" },
  { path: "/eps-30day-plan", label: "Kế hoạch 30 ngày EPS", icon: "ri-calendar-2-line", tags: ["EPS", "Kế hoạch"], description: "Kế hoạch học EPS 30 ngày đến khi thi" },
  { path: "/eps-exam-history", label: "Lịch sử thi EPS", icon: "ri-file-history-line", tags: ["EPS", "Lịch sử"], description: "Xem lại toàn bộ lịch sử thi thử EPS" },
  { path: "/eps-melon", label: "K-pop học EPS", icon: "ri-music-2-line", tags: ["EPS", "K-pop"], description: "Học từ vựng EPS qua bài hát K-pop" },

  // Seoul hidden features
  { path: "/seoul-hanja", label: "Hán tự Seoul", icon: "ri-character-recognition-line", tags: ["Seoul", "Hán tự"], description: "Học Hán tự trong giáo trình Seoul" },
  { path: "/seoul-learning-path", label: "Lộ trình Seoul", icon: "ri-route-line", tags: ["Seoul", "Lộ trình"], description: "Lộ trình học Seoul từ 1A đến 4B" },
  { path: "/seoul-listening-quiz", label: "Quiz nghe Seoul", icon: "ri-headphone-line", tags: ["Seoul", "Nghe"], description: "Luyện nghe với quiz theo bài Seoul" },
  { path: "/seoul-phrases", label: "Cụm từ Seoul", icon: "ri-chat-quote-line", tags: ["Seoul", "Từ vựng"], description: "Học cụm từ và thành ngữ trong Seoul" },
  { path: "/seoul-progress", label: "Tiến độ Seoul", icon: "ri-bar-chart-grouped-line", tags: ["Seoul", "Tiến độ"], description: "Theo dõi tiến độ học giáo trình Seoul" },
  { path: "/seoul-streak", label: "Streak Seoul", icon: "ri-fire-line", tags: ["Seoul", "Streak"], description: "Duy trì streak học Seoul hàng ngày" },
  { path: "/seoul-topic-review", label: "Ôn tập chủ đề Seoul", icon: "ri-refresh-line", tags: ["Seoul", "Ôn tập"], description: "Ôn tập từ vựng Seoul theo chủ đề" },
  { path: "/seoul-vocab-export", label: "Xuất từ vựng Seoul", icon: "ri-download-2-line", tags: ["Seoul", "Xuất file"], description: "Xuất từ vựng Seoul ra CSV, Anki" },
  { path: "/seoul-word-pairs", label: "Cặp từ Seoul", icon: "ri-links-line", tags: ["Seoul", "Từ vựng"], description: "Học từ vựng Seoul theo cặp đối lập" },
  { path: "/seoul-writing", label: "Luyện viết Seoul", icon: "ri-edit-line", tags: ["Seoul", "Viết"], description: "Luyện viết câu theo bài học Seoul" },

  // TOPIK hidden features
  { path: "/topik-topic-quiz", label: "Quiz chủ đề TOPIK", icon: "ri-survey-line", tags: ["TOPIK", "Quiz"], description: "Quiz từ vựng TOPIK theo từng chủ đề" },

  // Hangul hidden features
  // HIDDEN 2026-05-25 (focus EPS+du học): duplicate hangul, keep /hangul-write
  // { path: "/hangul-canvas", label: "Vẽ Hangul", icon: "ri-brush-line", tags: ["Hangul", "Viết tay"], description: "Luyện viết tay Hangul trên canvas" },
  { path: "/hangul-write", label: "Luyện viết Hangul", icon: "ri-pencil-line", tags: ["Hangul", "Viết"], description: "Luyện viết từng ký tự Hangul" },
  { path: "/handwriting-practice", label: "Luyện viết nâng cao", icon: "ri-edit-line", tags: ["Hangul", "Hán tự", "Viết"], description: "Luyện viết chữ Hán và Hangul với nhận diện nét" },

  // Community hidden features
  { path: "/community-ranks", label: "Hạng cộng đồng", icon: "ri-vip-crown-line", tags: ["Cộng đồng", "Xếp hạng"], description: "Hệ thống hạng và danh hiệu cộng đồng" },
  { path: "/challenge-history", label: "Lịch sử thử thách", icon: "ri-history-line", tags: ["Cộng đồng", "Lịch sử"], description: "Xem lại lịch sử các thử thách đã tham gia" },
  { path: "/challenge-leaderboard", label: "BXH thử thách", icon: "ri-trophy-line", tags: ["Cộng đồng", "Xếp hạng"], description: "Bảng xếp hạng thử thách bạn bè" },
  { path: "/challenge-stats", label: "Thống kê thử thách", icon: "ri-bar-chart-line", tags: ["Cộng đồng", "Thống kê"], description: "Thống kê kết quả các thử thách" },
  // HIDDEN 2026-05-25 (focus EPS+du học): social games, not EPS audience
  // { path: "/friend-challenge", label: "Thách đấu bạn bè", icon: "ri-sword-line", tags: ["Cộng đồng", "Thử thách"], description: "Thách đấu trực tiếp với bạn bè" },
  // { path: "/friend-streak", label: "Streak bạn bè", icon: "ri-fire-line", tags: ["Cộng đồng", "Streak"], description: "So sánh streak học tập với bạn bè" },
  { path: "/compare", label: "So sánh tiến độ", icon: "ri-scales-line", tags: ["Cộng đồng", "So sánh"], description: "So sánh tiến độ học tập với người khác" },
  // HIDDEN 2026-05-25 (focus EPS+du học): social comparison, not EPS audience
  // { path: "/compare-friends", label: "So sánh với bạn bè", icon: "ri-group-line", tags: ["Cộng đồng", "So sánh"], description: "So sánh chi tiết với từng người bạn" },

  // Stats hidden features
  { path: "/personal-stats", label: "Thống kê cá nhân", icon: "ri-user-3-line", tags: ["Thống kê", "Cá nhân"], description: "Thống kê học tập chi tiết của cá nhân" },
  // HIDDEN 2026-05-25 (focus EPS+du học): generic stats duplicates. Use /eps-stats / /seoul-stats / /topik-stats instead.
  // { path: "/study-analytics", label: "Phân tích học tập", icon: "ri-line-chart-line", tags: ["Thống kê", "Phân tích"], description: "Phân tích sâu về thói quen và hiệu quả học" },
  // { path: "/study-stats-detail", label: "Chi tiết thống kê", icon: "ri-bar-chart-box-line", tags: ["Thống kê", "Chi tiết"], description: "Xem chi tiết thống kê theo từng môn học" },
  { path: "/progress", label: "Tiến độ tổng thể", icon: "ri-progress-3-line", tags: ["Thống kê", "Tiến độ"], description: "Tổng quan tiến độ học tập toàn bộ" },
  // { path: "/xp-stats", label: "Thống kê XP", icon: "ri-star-line", tags: ["Thống kê", "XP"], description: "Xem lịch sử và thống kê điểm XP" },
  { path: "/weekly-report", label: "Báo cáo tuần", icon: "ri-file-chart-line", tags: ["Thống kê", "Báo cáo"], description: "Báo cáo tổng kết học tập hàng tuần" },

  // Planning hidden features
  { path: "/roadmap", label: "Lộ trình học", icon: "ri-map-2-line", tags: ["Kế hoạch", "Lộ trình"], description: "Lộ trình học tiếng Hàn từ cơ bản đến nâng cao" },
  // HIDDEN 2026-05-25 (focus EPS+du học): generic roadmap duplicates. EPS audience uses /eps-30day-plan or /eps-personalized-roadmap.
  // { path: "/learning-path", label: "Con đường học tập", icon: "ri-route-line", tags: ["Kế hoạch", "Lộ trình"], description: "Con đường học tập được cá nhân hóa" },
  // { path: "/personalized-roadmap", label: "Lộ trình cá nhân hóa", icon: "ri-brain-line", tags: ["Kế hoạch", "AI"], description: "AI tạo lộ trình học phù hợp với bạn", isNew: true },
  { path: "/daily-plan", label: "Kế hoạch ngày", icon: "ri-calendar-todo-line", tags: ["Kế hoạch", "Hàng ngày"], description: "Lập kế hoạch học tập chi tiết theo ngày" },
  { path: "/scheduler", label: "Lịch học", icon: "ri-calendar-schedule-line", tags: ["Kế hoạch", "Lịch"], description: "Sắp xếp lịch học tập theo tuần" },
  { path: "/study-reminder", label: "Nhắc nhở học", icon: "ri-notification-3-line", tags: ["Kế hoạch", "Nhắc nhở"], description: "Cài đặt nhắc nhở học tập hàng ngày" },
  { path: "/study-journal", label: "Nhật ký học tập", icon: "ri-book-2-line", tags: ["Kế hoạch", "Nhật ký"], description: "Ghi chép nhật ký học tập hàng ngày" },
  // HIDDEN 2026-05-25 (focus EPS+du học): social feed, not EPS audience
  // { path: "/study-feed", label: "Feed học tập", icon: "ri-rss-line", tags: ["Kế hoạch", "Feed"], description: "Xem hoạt động học tập của cộng đồng" },
  { path: "/review-schedule", label: "Lịch ôn tập", icon: "ri-calendar-event-line", tags: ["Kế hoạch", "Ôn tập"], description: "Lịch ôn tập theo Spaced Repetition" },

  // Profile hidden features
  { path: "/account-settings", label: "Cài đặt tài khoản", icon: "ri-settings-3-line", tags: ["Tài khoản", "Cài đặt"], description: "Quản lý thông tin và bảo mật tài khoản" },
  { path: "/notification-settings", label: "Cài đặt thông báo", icon: "ri-notification-line", tags: ["Tài khoản", "Thông báo"], description: "Tùy chỉnh thông báo và nhắc nhở" },

  // Rewards hidden features
  { path: "/coupon", label: "Mã giảm giá", icon: "ri-coupon-3-line", tags: ["Phần thưởng", "Coupon"], description: "Nhập và quản lý mã giảm giá" },
  { path: "/referral", label: "Giới thiệu bạn bè", icon: "ri-share-line", tags: ["Phần thưởng", "Giới thiệu"], description: "Giới thiệu bạn bè và nhận thưởng" },

  // Content hidden features
  { path: "/dictionary", label: "Từ điển tổng hợp", icon: "ri-book-open-line", tags: ["Từ điển", "Tổng hợp"], description: "Từ điển tiếng Hàn tổng hợp đa nguồn" },
  { path: "/phrase-dictionary", label: "Từ điển cụm từ", icon: "ri-chat-quote-line", tags: ["Từ điển", "Cụm từ"], description: "Tra cứu cụm từ và thành ngữ tiếng Hàn" },
  { path: "/quiz", label: "Quiz tổng hợp", icon: "ri-gamepad-line", tags: ["Học tập", "Quiz"], description: "Quiz tổng hợp nhiều chủ đề và cấp độ" },
  { path: "/pronunciation", label: "Luyện phát âm", icon: "ri-mic-2-line", tags: ["Học tập", "Phát âm"], description: "Luyện phát âm tiếng Hàn với AI" },
  { path: "/wrong-review", label: "Ôn tập câu sai", icon: "ri-error-warning-line", tags: ["Học tập", "Ôn tập"], description: "Ôn lại tất cả câu trả lời sai" },
  // HIDDEN 2026-05-25 (focus EPS+du học): K-pop entertainment, not EPS audience
  // { path: "/melon-history", label: "Lịch sử K-pop", icon: "ri-history-line", tags: ["K-pop", "Lịch sử"], description: "Lịch sử các bài K-pop đã học" },
  // { path: "/melon-stats", label: "Thống kê K-pop", icon: "ri-bar-chart-line", tags: ["K-pop", "Thống kê"], description: "Thống kê tiến độ học qua K-pop" },
  { path: "/series", label: "Quản lý Series", icon: "ri-stack-line", tags: ["Nội dung", "Series"], description: "Xem và quản lý các series ebook" },
  { path: "/placement-test", label: "Kiểm tra đầu vào", icon: "ri-test-tube-line", tags: ["Học tập", "Kiểm tra"], description: "Kiểm tra trình độ tiếng Hàn đầu vào" },
  { path: "/learn-overview", label: "Tổng quan học tập", icon: "ri-dashboard-line", tags: ["Học tập", "Tổng quan"], description: "Tổng quan toàn bộ tiến độ học tập" },
  { path: "/learning-certificate", label: "Chứng chỉ học tập", icon: "ri-award-line", tags: ["Học tập", "Chứng chỉ"], description: "Nhận chứng chỉ hoàn thành khóa học", isNew: true },
];

// ─── All unique tags ──────────────────────────────────────────────────────────
const ALL_TAGS = Array.from(new Set(ALL_FEATURES.flatMap(f => f.tags))).sort();

// ─── Study history based suggestions ─────────────────────────────────────────
function getStudySuggestions(studyHistory: Record<string, number>): Feature[] {
  const pathCounts = studyHistory;
  const suggestions: Feature[] = [];

  // EPS learners
  const epsCount = Object.entries(pathCounts).filter(([k]) => k.startsWith("/eps")).reduce((s, [, v]) => s + v, 0);
  if (epsCount > 0) {
    const epsFeatures = [
      "/eps-weakness-analysis", "/eps-personalized-roadmap", "/eps-smart-wrong",
      "/eps-mock-exam", "/eps-30day-plan", "/eps-topic-drill",
    ];
    epsFeatures.forEach(p => {
      const f = ALL_FEATURES.find(x => x.path === p);
      if (f && !pathCounts[p]) suggestions.push(f);
    });
  }

  // Seoul learners
  const seoulCount = Object.entries(pathCounts).filter(([k]) => k.startsWith("/seoul")).reduce((s, [, v]) => s + v, 0);
  if (seoulCount > 0) {
    ["/seoul-progress", "/seoul-streak", "/seoul-word-pairs", "/seoul-writing"].forEach(p => {
      const f = ALL_FEATURES.find(x => x.path === p);
      if (f && !pathCounts[p]) suggestions.push(f);
    });
  }

  // TOPIK learners
  const topikCount = Object.entries(pathCounts).filter(([k]) => k.startsWith("/topik")).reduce((s, [, v]) => s + v, 0);
  if (topikCount > 0) {
    ["/topik-topic-quiz", "/topik-stats"].forEach(p => {
      const f = ALL_FEATURES.find(x => x.path === p);
      if (f && !pathCounts[p]) suggestions.push(f);
    });
  }

  // K-pop learners — HIDDEN 2026-05-25 (focus EPS+du học): melon routes hidden
  // const melonCount = Object.entries(pathCounts).filter(([k]) => k.startsWith("/melon")).reduce((s, [, v]) => s + v, 0);
  // if (melonCount > 0) {
  //   ["/melon-stats", "/melon-history", "/melon-flashcard"].forEach(p => {
  //     const f = ALL_FEATURES.find(x => x.path === p);
  //     if (f && !pathCounts[p]) suggestions.push(f);
  //   });
  // }

  // Default suggestions if no history
  if (suggestions.length === 0) {
    // /personalized-roadmap hidden 2026-05-25 — replaced with /eps-personalized-roadmap
    ["/eps-personalized-roadmap", "/placement-test", "/eps-30day-plan", "/learning-certificate"].forEach(p => {
      const f = ALL_FEATURES.find(x => x.path === p);
      if (f) suggestions.push(f);
    });
  }

  return suggestions.slice(0, 6);
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ feature, onNavigate }: { feature: Feature; onNavigate: (path: string) => void }) {
  return (
    <button
      onClick={() => onNavigate(feature.path)}
      className="w-full text-left p-4 bg-white border border-gray-100 rounded-xl hover:border-rose-200 hover:bg-rose-50/30 transition-all cursor-pointer group relative"
    >
      {feature.isNew && (
        <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400 text-white font-bold">NEW</span>
      )}
      {feature.isHot && (
        <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold">HOT</span>
      )}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 flex items-center justify-center bg-rose-50 rounded-lg flex-shrink-0 group-hover:bg-rose-100 transition-colors">
          <i className={`${feature.icon} text-rose-500 text-base`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 group-hover:text-rose-700 transition-colors truncate">{feature.label}</p>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{feature.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {feature.tags.map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{tag}</span>
            ))}
          </div>
        </div>
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <i className="ri-arrow-right-line text-rose-400 text-sm"></i>
        </div>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AllFeaturesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [studyHistory] = useLocalStorage<Record<string, number>>("kts_page_visits", {});

  // Track page visits
  const [, setPageVisits] = useLocalStorage<Record<string, number>>("kts_page_visits", {});
  useEffect(() => {
    setPageVisits(prev => ({ ...prev, "/all-features": (prev["/all-features"] || 0) + 1 }));
  }, []);

  const suggestions = useMemo(() => getStudySuggestions(studyHistory), [studyHistory]);

  const filtered = useMemo(() => {
    let list = ALL_FEATURES;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(f =>
        f.label.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedTags.length > 0) {
      list = list.filter(f => selectedTags.every(t => f.tags.includes(t)));
    }
    return list;
  }, [search, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Group by first tag
  const grouped = useMemo(() => {
    if (search.trim() || selectedTags.length > 0) return null;
    const groups: Record<string, Feature[]> = {};
    ALL_FEATURES.forEach(f => {
      const group = f.tags[0];
      if (!groups[group]) groups[group] = [];
      groups[group].push(f);
    });
    return groups;
  }, [search, selectedTags]);

  const handleNavigate = (path: string) => {
    setPageVisits(prev => ({ ...prev, [path]: (prev[path] || 0) + 1 }));
    navigate(path);
  };

  const tagGroups = [
    { label: "EPS-TOPIK", tags: ["EPS"] },
    { label: "Seoul", tags: ["Seoul"] },
    { label: "TOPIK", tags: ["TOPIK"] },
    { label: "Học tập", tags: ["Học tập", "Từ điển", "Hangul", "Hán tự"] },
    { label: "Cộng đồng", tags: ["Cộng đồng"] },
    { label: "Thống kê", tags: ["Thống kê"] },
    { label: "Kế hoạch", tags: ["Kế hoạch"] },
    { label: "K-pop", tags: ["K-pop"] },
    { label: "Phần thưởng", tags: ["Phần thưởng", "Tài khoản"] },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 cursor-pointer text-sm">
            <i className="ri-arrow-left-line"></i>Quay lại
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center bg-rose-100 rounded-xl">
              <i className="ri-apps-2-line text-rose-600 text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tất cả tính năng</h1>
              <p className="text-sm text-gray-500">{ALL_FEATURES.length} tính năng · Tìm kiếm và khám phá</p>
            </div>
          </div>
        </div>

        {/* Suggestions section */}
        {suggestions.length > 0 && !search && selectedTags.length === 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl border border-rose-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-magic-line text-rose-500 text-base"></i>
              </div>
              <p className="text-sm font-semibold text-gray-800">Gợi ý dành cho bạn</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-medium">Dựa trên lịch sử học</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestions.map(f => (
                <button
                  key={f.path}
                  onClick={() => handleNavigate(f.path)}
                  className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-rose-100 hover:border-rose-300 hover:bg-rose-50 transition-all cursor-pointer text-left group"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-rose-50 rounded-lg flex-shrink-0 group-hover:bg-rose-100 transition-colors">
                    <i className={`${f.icon} text-rose-500 text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{f.label}</p>
                    <p className="text-[10px] text-gray-400 truncate">{f.tags.join(" · ")}</p>
                  </div>
                  <i className="ri-arrow-right-line text-rose-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"></i>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
            <i className="ri-search-line text-gray-400 text-sm"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tính năng theo tên, mô tả, tag..."
            className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <i className="ri-close-line text-sm"></i>
            </button>
          )}
        </div>

        {/* Tag filter */}
        <div className="mb-5">
          <div className="flex flex-wrap gap-1.5">
            {tagGroups.map(group => (
              group.tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all border ${
                    selectedTags.includes(tag)
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:text-rose-600"
                  }`}
                >
                  {tag}
                </button>
              ))
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all border border-gray-200 text-gray-500 hover:bg-gray-100"
              >
                <i className="ri-close-line mr-1"></i>Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {(search || selectedTags.length > 0) ? (
          <div>
            <p className="text-xs text-gray-400 mb-3">{filtered.length} tính năng tìm thấy</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(f => (
                <FeatureCard key={f.path} feature={f} onNavigate={handleNavigate} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-3 text-center py-16 text-gray-400">
                  <i className="ri-search-line text-4xl mb-3 block"></i>
                  <p className="text-sm">Không tìm thấy tính năng nào</p>
                  <p className="text-xs mt-1">Thử từ khóa khác hoặc xóa bộ lọc</p>
                </div>
              )}
            </div>
          </div>
        ) : grouped ? (
          <div className="space-y-8">
            {Object.entries(grouped).map(([groupName, features]) => (
              <div key={groupName}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-bold text-gray-700">{groupName}</h2>
                  <span className="text-xs text-gray-400">({features.length})</span>
                  <div className="flex-1 h-px bg-gray-100"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {features.map(f => (
                    <FeatureCard key={f.path} feature={f} onNavigate={handleNavigate} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
