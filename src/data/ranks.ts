// ─── Rank & Badge System — Tách từ community-ranks/page để tránh ineffective dynamic import ──
//
// Rank thresholds (v2 — điều chỉnh để phù hợp với XP formula mới):
//   Tân binh   0–299    : 1-2 tuần đầu
//   Học viên   300–999  : 2-4 tuần
//   Chiến binh 1000–2999: 1-2 tháng
//   Cao thủ    3000–5999: 2-3 tháng
//   Đại sư     6000–11999: 3-6 tháng  ← NEW rank
//   Huyền thoại 12000+  : 6+ tháng học chăm

export const RANKS = [
  {
    id: "newbie",
    name: "Tân binh",
    nameKo: "신병",
    icon: "ri-seedling-line",
    color: "#94a3b8",
    bgColor: "#94a3b815",
    borderColor: "#94a3b830",
    minXP: 0,
    maxXP: 299,
    description: "Mới bắt đầu hành trình học tiếng Hàn",
    perks: ["Tham gia cộng đồng", "Đăng bài và bình luận"],
  },
  {
    id: "learner",
    name: "Học viên",
    nameKo: "학습자",
    icon: "ri-book-open-line",
    color: "#34d399",
    bgColor: "#34d39915",
    borderColor: "#34d39930",
    minXP: 300,
    maxXP: 999,
    description: "Đang xây dựng nền tảng tiếng Hàn vững chắc",
    perks: ["Huy hiệu Học viên", "Ưu tiên hiển thị bài đăng", "Tham gia sự kiện cộng đồng"],
  },
  {
    id: "warrior",
    name: "Chiến binh",
    nameKo: "전사",
    icon: "ri-sword-line",
    color: "#60a5fa",
    bgColor: "#60a5fa15",
    borderColor: "#60a5fa30",
    minXP: 1000,
    maxXP: 2999,
    description: "Kiên trì luyện tập mỗi ngày, không bỏ cuộc",
    perks: ["Huy hiệu Chiến binh", "Khung avatar đặc biệt", "Quyền tạo nhóm học tập"],
  },
  {
    id: "master",
    name: "Cao thủ",
    nameKo: "고수",
    icon: "ri-vip-crown-line",
    color: "#f59e0b",
    bgColor: "#f59e0b15",
    borderColor: "#f59e0b30",
    minXP: 3000,
    maxXP: 5999,
    description: "Thành thạo tiếng Hàn, truyền cảm hứng cho cộng đồng",
    perks: ["Huy hiệu Cao thủ", "Nhãn xác minh", "Quyền ghim bài đăng", "Tư vấn thành viên mới"],
  },
  {
    id: "expert",
    name: "Đại sư",
    nameKo: "대사",
    icon: "ri-star-s-fill",
    color: "#e879f9",
    bgColor: "#e879f915",
    borderColor: "#e879f930",
    minXP: 6000,
    maxXP: 11999,
    description: "Bậc thầy tiếng Hàn — am hiểu sâu và học bền vững",
    perks: ["Huy hiệu Đại sư", "Khung avatar tím đặc biệt", "Nhận thưởng XP hàng tháng", "Quyền tạo bài học"],
  },
  {
    id: "legend",
    name: "Huyền thoại",
    nameKo: "전설",
    icon: "ri-fire-fill",
    color: "#EAB308",
    bgColor: "#EAB30815",
    borderColor: "#EAB30840",
    minXP: 12000,
    maxXP: Infinity,
    description: "Đỉnh cao của cộng đồng — biểu tượng học tiếng Hàn EPS",
    perks: ["Huy hiệu Huyền thoại", "Tên hiển thị màu vàng", "Quyền moderator", "Phần thưởng độc quyền hàng tháng"],
  },
];

export const BADGES = [
  // Streak badges
  { id: "streak7", name: "Streak 7 ngày", nameKo: "7일 연속", icon: "ri-fire-line", color: "#fb923c", category: "streak", condition: "Duy trì streak 7 ngày liên tiếp", xpReward: 50 },
  { id: "streak30", name: "Streak 30 ngày", nameKo: "30일 연속", icon: "ri-fire-fill", color: "#ef4444", category: "streak", condition: "Duy trì streak 30 ngày liên tiếp", xpReward: 200 },
  { id: "streak100", name: "Streak 100 ngày", nameKo: "100일 연속", icon: "ri-meteor-line", color: "app-accent-primary", category: "streak", condition: "Duy trì streak 100 ngày liên tiếp", xpReward: 500 },
  // Achievement badges
  { id: "eps_pass", name: "Đậu EPS", nameKo: "EPS 합격", icon: "ri-trophy-fill", color: "#FFD700", category: "achievement", condition: "Đạt điểm đậu trong bài thi thử EPS", xpReward: 300 },
  { id: "topik1_pass", name: "Đậu TOPIK I", nameKo: "TOPIK I 합격", icon: "ri-medal-line", color: "#34d399", category: "achievement", condition: "Đạt điểm đậu trong bài thi thử TOPIK I", xpReward: 200 },
  { id: "topik2_pass", name: "Đậu TOPIK II", nameKo: "TOPIK II 합격", icon: "ri-medal-fill", color: "#60a5fa", category: "achievement", condition: "Đạt điểm đậu trong bài thi thử TOPIK II", xpReward: 400 },
  // Community badges
  { id: "first_post", name: "Bài đăng đầu tiên", nameKo: "첫 게시물", icon: "ri-quill-pen-line", color: "#a78bfa", category: "community", condition: "Đăng bài đầu tiên trong cộng đồng", xpReward: 20 },
  { id: "helpful", name: "Người hữu ích", nameKo: "도움이 되는 사람", icon: "ri-heart-fill", color: "#f43f5e", category: "community", condition: "Nhận 50 lượt thích trong cộng đồng", xpReward: 100 },
  { id: "top10", name: "Top 10 BXH", nameKo: "상위 10위", icon: "ri-bar-chart-fill", color: "app-accent-primary", category: "community", condition: "Lọt vào top 10 bảng xếp hạng", xpReward: 150 },
  // Learning badges
  { id: "vocab200", name: "200 từ vựng", nameKo: "단어 200개", icon: "ri-translate-2", color: "#22d3ee", category: "learning", condition: "Học 200 từ vựng EPS", xpReward: 100 },
  { id: "hangul_master", name: "Thành thạo Hangul", nameKo: "한글 마스터", icon: "ri-font-size", color: "#84cc16", category: "learning", condition: "Hoàn thành tất cả bài học Hangul", xpReward: 80 },
  { id: "perfect_score", name: "Điểm tuyệt đối", nameKo: "만점", icon: "ri-star-fill", color: "#f59e0b", category: "learning", condition: "Đạt 100% trong một bài thi thử", xpReward: 200 },
  // Special badges
  { id: "early_bird", name: "Chim sớm", nameKo: "얼리버드", icon: "ri-sun-line", color: "#fbbf24", category: "special", condition: "Học trước 7 giờ sáng 10 ngày", xpReward: 60 },
  { id: "night_owl", name: "Cú đêm", nameKo: "올빼미", icon: "ri-moon-line", color: "#818cf8", category: "special", condition: "Học sau 11 giờ đêm 10 ngày", xpReward: 60 },
  { id: "veteran", name: "Lão làng", nameKo: "베테랑", icon: "ri-time-line", color: "#94a3b8", category: "special", condition: "Tham gia cộng đồng hơn 1 năm", xpReward: 100 },
  // Weekly reward badges (trao bởi admin mỗi tuần)
  { id: "gold_weekly", name: "Top 1 Tuần", nameKo: "주간 1위", icon: "ri-trophy-fill", color: "#FFD700", category: "weekly", condition: "Đứng top 1 bảng xếp hạng tuần", xpReward: 500 },
  { id: "silver_weekly", name: "Top 2 Tuần", nameKo: "주간 2위", icon: "ri-medal-fill", color: "#C0C0C0", category: "weekly", condition: "Đứng top 2 bảng xếp hạng tuần", xpReward: 300 },
  { id: "bronze_weekly", name: "Top 3 Tuần", nameKo: "주간 3위", icon: "ri-medal-line", color: "#CD7F32", category: "weekly", condition: "Đứng top 3 bảng xếp hạng tuần", xpReward: 200 },
];
