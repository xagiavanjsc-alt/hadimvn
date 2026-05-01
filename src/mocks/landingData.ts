export const FEATURES = [
  { icon: "ri-font-size", title: "Hangul từ A–Z", desc: "Học bảng chữ cái với phát âm chuẩn, bài tập viết và nhận diện ký tự tương tác.", color: "#22c55e" },
  { icon: "ri-newspaper-line", title: "Tiếng Hàn \"Sống\"", desc: "Học những câu người Hàn hay nói ngoài đời, tiếng lóng trend nhất — không chỉ trong sách.", color: "#f59e0b" },
  { icon: "ri-music-2-line", title: "Học qua K-pop & Drama", desc: "Giải mã lời bài hát, câu thoại trong phim để vừa đu idol vừa giỏi tiếng Hàn.", color: "#ec4899" },
  { icon: "ri-timer-line", title: "Thi thử EPS-TOPIK", desc: "40 câu, 50 phút — mô phỏng kỳ thi thật. Phân tích điểm yếu theo chủ đề.", color: "#f97316" },
  { icon: "ri-route-line", title: "Lộ trình AI cá nhân", desc: "AI phân tích điểm yếu và gợi ý bài học phù hợp mỗi ngày — học đúng chỗ.", color: "#a78bfa" },
  { icon: "ri-group-line", title: "Cộng đồng 10,000+", desc: "Hỏi đáp, chia sẻ kinh nghiệm, khoe kết quả thi với hàng nghìn học viên.", color: "#06b6d4" },
];

export const STATS = [
  { value: "10,000+", label: "Học viên đang học" },
  { value: "3,200+", label: "Người đậu EPS" },
  { value: "2,000+", label: "Câu hỏi EPS-TOPIK" },
  { value: "98%", label: "Hài lòng sau 30 ngày" },
];

export const TESTIMONIALS = [
  {
    name: "Nguyễn Thị Lan",
    role: "Đậu EPS-TOPIK lần 3",
    avatar: "https://readdy.ai/api/search-image?query=young%20Vietnamese%20woman%20smiling%20portrait%20professional%20photo%20warm%20lighting%20natural%20background%20soft%20bokeh&width=80&height=80&seq=tdark1hqo&orientation=squarish",
    text: "Nhờ thi thử EPS mỗi ngày trên Hàn Quốc Ơi!, mình biết chính xác chủ đề nào yếu để ôn. Điểm tăng từ 65 lên 89 chỉ trong 2 tháng!",
    score: "89/100",
    badgeColor: "#f59e0b",
    badge: "ri-trophy-fill",
  },
  {
    name: "Trần Văn Minh",
    role: "TOPIK II — Streak 64 ngày",
    avatar: "https://readdy.ai/api/search-image?query=young%20Vietnamese%20man%20smiling%20portrait%20casual%20photo%20warm%20lighting%20natural%20background%20friendly%20face&width=80&height=80&seq=tdark2hqo&orientation=squarish",
    text: "Học qua tin tức tiếng Hàn thật sự khác hẳn sách giáo khoa. Từ vựng nhớ lâu hơn vì học trong ngữ cảnh thực tế.",
    score: "🔥 64 ngày",
    badgeColor: "#f97316",
    badge: "ri-fire-fill",
  },
  {
    name: "Lê Quang Hùng",
    role: "Công nhân xuất khẩu lao động",
    avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20man%20worker%20smiling%20portrait%20casual%20warm%20lighting%20natural%20background%20confident%20look&width=80&height=80&seq=tdark3hqo&orientation=squarish",
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
