export const FEATURES = [
  { icon: "ri-font-size", title: "Hangul từ A–Z", desc: "Học bảng chữ cái với phát âm chuẩn, bài tập viết và nhận diện ký tự tương tác.", color: "#22c55e" },
  { icon: "ri-file-list-3-line", title: "Đề thi EPS 2025 thật", desc: "Đề thi EPS-TOPIK 2025 chính thức có đáp án và audio nghe — không phải đề tự chế.", color: "#f59e0b" },
  { icon: "ri-music-2-line", title: "Học qua K-pop", desc: "Giải mã lời bài hát K-pop để vừa giải trí vừa nhớ từ vựng tiếng Hàn.", color: "#ec4899" },
  { icon: "ri-timer-line", title: "Thi thử EPS-TOPIK", desc: "40 câu, 50 phút — mô phỏng kỳ thi thật. Phân tích điểm yếu theo chủ đề.", color: "#f97316" },
  { icon: "ri-translate-2", title: "Giải thích tiếng Việt", desc: "Mọi từ vựng, ngữ pháp đều giải thích bằng tiếng Việt — phù hợp cho lao động XKLĐ.", color: "#a78bfa" },
  { icon: "ri-group-line", title: "Cộng đồng XKLĐ", desc: "Tham gia nhóm Facebook hỏi đáp, chia sẻ kinh nghiệm thi và đi XKLĐ Hàn Quốc.", color: "#06b6d4" },
];

export const STATS = [
  { value: "60+", label: "Bài học EPS" },
  { value: "2", label: "Đề thi thật 2025" },
  { value: "4,000+", label: "Từ vựng EPS" },
  { value: "100%", label: "Miễn phí" },
];

export const TESTIMONIALS = [
  {
    name: "Nguyễn Thị Lan",
    role: "Đậu EPS-TOPIK lần 3",
    avatar: "/images/brand/logo.svg",
    text: "Nhờ thi thử EPS mỗi ngày trên Hàn Quốc Ơi!, mình biết chính xác chủ đề nào yếu để ôn. Điểm tăng từ 65 lên 89 chỉ trong 2 tháng!",
    score: "89/100",
    badgeColor: "#f59e0b",
    badge: "ri-trophy-fill",
  },
  {
    name: "Trần Văn Minh",
    role: "TOPIK II — Streak 64 ngày",
    avatar: "/images/brand/logo.svg",
    text: "Học qua tin tức tiếng Hàn thật sự khác hẳn sách giáo khoa. Từ vựng nhớ lâu hơn vì học trong ngữ cảnh thực tế.",
    score: "🔥 64 ngày",
    badgeColor: "#f97316",
    badge: "ri-fire-fill",
  },
  {
    name: "Lê Quang Hùng",
    role: "Công nhân xuất khẩu lao động",
    avatar: "/images/brand/logo.svg",
    text: "Chỉ 20 phút/ngày trên Hàn Quốc Ơi! là đủ. Sau 3 tháng đã đậu EPS và chuẩn bị sang Hàn! Cộng đồng ở đây nhiệt tình lắm.",
    score: "Đậu EPS",
    badgeColor: "#22c55e",
    badge: "ri-medal-fill",
  },
];

export const FAQ_ITEMS = [
  { q: "Hàn Quốc Ơi! phù hợp với ai?", a: "Phù hợp với người mới bắt đầu, người đang ôn thi EPS-TOPIK, và người muốn nâng cao từ TOPIK I lên TOPIK II. Lộ trình AI sẽ tự điều chỉnh theo trình độ của bạn." },
  { q: "Thi thử EPS có giống đề thi thật không?", a: "Ngân hàng đề được cập nhật từ các đề thi EPS-TOPIK thực tế. 40 câu, 50 phút — đúng format kỳ thi chính thức. Phân tích điểm yếu theo từng chủ đề sau mỗi lần thi." },
  { q: "Dữ liệu học tập có bị mất khi đổi thiết bị không?", a: "Không! Đăng nhập tài khoản trên bất kỳ thiết bị nào, dữ liệu streak, EPS, flashcard đều được khôi phục tự động qua cloud Supabase." },
  { q: "Hệ thống XP và phần thưởng hoạt động như thế nào?", a: "Bạn nhận XP từ mọi hoạt động học tập. Tích lũy đủ XP để đổi lấy coupon giảm giá VIP hoặc VIP miễn phí!" },
  { q: "Có thể hủy VIP bất cứ lúc nào không?", a: "Có, bạn có thể hủy bất cứ lúc nào. Tính năng VIP vẫn hoạt động đến hết chu kỳ thanh toán hiện tại." },
];

export const LEARNING_PATHS = [
  { step: "01", title: "Test trình độ", desc: "AI đánh giá trình độ hiện tại trong 5 phút", icon: "ri-clipboard-line", color: "#22c55e" },
  { step: "02", title: "Lộ trình cá nhân", desc: "Nhận kế hoạch học tập được tùy chỉnh cho bạn", icon: "ri-route-line", color: "#f59e0b" },
  { step: "03", title: "Học mỗi ngày", desc: "20 phút/ngày với flashcard, quiz và tin tức thật", icon: "ri-calendar-check-line", color: "#ec4899" },
  { step: "04", title: "Thi & Đậu", desc: "Luyện đề thật, phân tích điểm yếu, tự tin thi EPS", icon: "ri-trophy-line", color: "#f97316" },
];
