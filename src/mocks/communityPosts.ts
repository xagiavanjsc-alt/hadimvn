export interface CommunityPost {
  id: string;
  author: string;
  authorAvatar: string;
  authorLevel: string;
  authorXp: number;
  category: "question" | "share" | "result" | "tip";
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  isPinned?: boolean;
  examScore?: number;
  streak?: number;
}

export const communityPosts: CommunityPost[] = [
  {
    id: "p1",
    author: "Nguyễn Thị Lan",
    authorAvatar: "https://readdy.ai/api/search-image?query=young%20Vietnamese%20woman%20smiling%20portrait%20professional%20warm%20lighting&width=60&height=60&seq=cp1&orientation=squarish",
    authorLevel: "TOPIK II",
    authorXp: 18450,
    category: "result",
    title: "Đậu EPS-TOPIK lần 3 rồi! Chia sẻ kinh nghiệm ôn thi",
    content: "Sau 2 lần trượt, mình đã đậu với 89 điểm! Bí quyết là thi thử mỗi ngày trên KTS và tập trung vào chủ đề An toàn lao động — thường chiếm 30% đề. Ai đang ôn thi cứ hỏi mình nhé!",
    tags: ["EPS-TOPIK", "kinh nghiệm", "đậu thi"],
    likes: 142,
    comments: 38,
    createdAt: "2026-04-14T08:30:00Z",
    isPinned: true,
    examScore: 89,
  },
  {
    id: "p2",
    author: "Trần Minh Khoa",
    authorAvatar: "https://readdy.ai/api/search-image?query=young%20Vietnamese%20man%20smiling%20portrait%20casual%20warm%20lighting&width=60&height=60&seq=cp2&orientation=squarish",
    authorLevel: "TOPIK I",
    authorXp: 15200,
    category: "question",
    title: "Câu hỏi: Phân biệt 이/가 và 은/는 như thế nào?",
    content: "Mình học được 3 tháng rồi nhưng vẫn hay nhầm 이/가 (chủ ngữ) và 은/는 (chủ đề). Ai có cách nhớ dễ không? Mình đọc sách giải thích nhưng vẫn chưa hiểu rõ lắm.",
    tags: ["ngữ pháp", "hỏi đáp", "cơ bản"],
    likes: 67,
    comments: 24,
    createdAt: "2026-04-14T07:15:00Z",
  },
  {
    id: "p3",
    author: "Lê Thị Hương",
    authorAvatar: "https://readdy.ai/api/search-image?query=Vietnamese%20woman%20student%20smiling%20portrait%20casual%20soft%20background&width=60&height=60&seq=cp3&orientation=squarish",
    authorLevel: "TOPIK I",
    authorXp: 12800,
    category: "tip",
    title: "Mẹo học từ vựng EPS nhanh nhớ lâu — phương pháp liên tưởng",
    content: "Mình dùng phương pháp liên tưởng hình ảnh để học từ vựng EPS. Ví dụ: 작업복 (quần áo bảo hộ) → tưởng tượng người mặc đồ bảo hộ đang 'tác nghiệp'. Áp dụng cho 200 từ EPS, nhớ được 85% sau 2 tuần!",
    tags: ["từ vựng", "mẹo học", "EPS"],
    likes: 98,
    comments: 15,
    createdAt: "2026-04-13T20:00:00Z",
  },
  {
    id: "p4",
    author: "Phạm Văn Đức",
    authorAvatar: "https://readdy.ai/api/search-image?query=Vietnamese%20man%20student%20smiling%20portrait%20casual%20natural%20background&width=60&height=60&seq=cp4&orientation=squarish",
    authorLevel: "TOPIK I",
    authorXp: 10500,
    category: "share",
    title: "Streak 41 ngày — cảm giác không thể dừng được!",
    content: "Hôm nay đạt 41 ngày streak liên tiếp! Ban đầu chỉ định học 10 phút/ngày cho có, nhưng giờ thành thói quen rồi. Mỗi ngày mở app đầu tiên trước khi làm gì khác. Ai đang ở ngày 1-7 cứ kiên trì nhé, qua ngày 21 là dễ lắm!",
    tags: ["streak", "động lực", "thói quen"],
    likes: 203,
    comments: 47,
    createdAt: "2026-04-13T18:30:00Z",
    streak: 41,
  },
  {
    id: "p5",
    author: "Hoàng Thị Mai",
    authorAvatar: "https://readdy.ai/api/search-image?query=Vietnamese%20woman%20smiling%20portrait%20warm%20lighting%20natural&width=60&height=60&seq=cp5&orientation=squarish",
    authorLevel: "TOPIK I",
    authorXp: 9800,
    category: "question",
    title: "Hỏi: Học Hangul mất bao lâu để đọc được?",
    content: "Mình mới bắt đầu học Hangul được 1 tuần. Hiện tại nhớ được khoảng 20 ký tự nhưng đọc vẫn chậm lắm. Mọi người mất bao lâu để đọc trơn tru? Có cách nào luyện đọc nhanh hơn không?",
    tags: ["Hangul", "người mới", "hỏi đáp"],
    likes: 45,
    comments: 19,
    createdAt: "2026-04-13T15:00:00Z",
  },
  {
    id: "p6",
    author: "Vũ Quang Huy",
    authorAvatar: "https://readdy.ai/api/search-image?query=Vietnamese%20man%20smiling%20portrait%20casual%20warm%20background&width=60&height=60&seq=cp6&orientation=squarish",
    authorLevel: "Cơ bản",
    authorXp: 7600,
    category: "result",
    title: "Thi thử EPS lần đầu đạt 72% — tiến bộ so với tuần trước!",
    content: "Tuần trước thi thử chỉ được 58%, hôm nay lên 72% rồi! Chủ đề Giao tiếp cơ bản và Sinh hoạt hàng ngày đã ổn hơn nhiều. Còn An toàn lao động và Pháp luật vẫn yếu, cần ôn thêm.",
    tags: ["EPS-TOPIK", "tiến bộ", "thi thử"],
    likes: 89,
    comments: 12,
    createdAt: "2026-04-13T10:00:00Z",
    examScore: 72,
  },
  {
    id: "p7",
    author: "Đặng Thị Thu",
    authorAvatar: "https://readdy.ai/api/search-image?query=Vietnamese%20woman%20portrait%20smiling%20casual%20natural%20light&width=60&height=60&seq=cp7&orientation=squarish",
    authorLevel: "Cơ bản",
    authorXp: 6400,
    category: "tip",
    title: "Playlist K-pop để học tiếng Hàn hiệu quả nhất",
    content: "Mình tổng hợp các bài K-pop có từ vựng đơn giản, phù hợp cho người mới: BTS - Spring Day, IU - Palette, BLACKPINK - Stay. Nghe đi nghe lại + học trên KTS, từ vựng nhớ rất nhanh!",
    tags: ["K-pop", "từ vựng", "mẹo học"],
    likes: 156,
    comments: 31,
    createdAt: "2026-04-12T21:00:00Z",
  },
  {
    id: "p8",
    author: "Bùi Văn Nam",
    authorAvatar: "https://readdy.ai/api/search-image?query=Vietnamese%20man%20portrait%20smiling%20casual%20warm%20light&width=60&height=60&seq=cp8&orientation=squarish",
    authorLevel: "Cơ bản",
    authorXp: 5200,
    category: "share",
    title: "Chia sẻ lịch học 30 phút/ngày cho người bận rộn",
    content: "Mình đi làm 8 tiếng/ngày nhưng vẫn học được tiếng Hàn. Lịch của mình: 7h sáng - 10 phút Hangul/Flashcard, 12h trưa - 10 phút EPS, 9h tối - 10 phút đọc tin tức. Tổng 30 phút/ngày, streak 19 ngày rồi!",
    tags: ["lịch học", "bận rộn", "kinh nghiệm"],
    likes: 178,
    comments: 42,
    createdAt: "2026-04-12T19:30:00Z",
  },
];
