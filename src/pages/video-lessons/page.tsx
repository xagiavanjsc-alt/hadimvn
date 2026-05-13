import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface VideoLesson {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  level: string;
  topic: string;
  views: number;
  likes: number;
  instructor: string;
  tags: string[];
  playlist: string;
}

const VIDEO_LESSONS: VideoLesson[] = [
  {
    id: "v1",
    title: "Bảng chữ cái Hangul - Học từ A đến Z",
    description: "Học toàn bộ bảng chữ cái Hangul trong 30 phút với phương pháp ghi nhớ hiệu quả nhất.",
    youtubeId: "s5aobqyEaMQ",
    duration: "28:45",
    level: "A1",
    topic: "Hangul",
    views: 125400,
    likes: 8920,
    instructor: "Thầy Kim",
    tags: ["hangul", "cơ bản", "bảng chữ cái"],
    playlist: "Khóa A1 - Cơ bản",
  },
  {
    id: "v2",
    title: "Chào hỏi tiếng Hàn - 20 câu cơ bản nhất",
    description: "Học 20 câu chào hỏi thông dụng nhất trong tiếng Hàn, dùng được ngay trong giao tiếp hàng ngày.",
    youtubeId: "YkgkThdzX-8",
    duration: "15:32",
    level: "A1",
    topic: "Giao tiếp",
    views: 98700,
    likes: 7340,
    instructor: "Cô Park",
    tags: ["chào hỏi", "giao tiếp", "cơ bản"],
    playlist: "Khóa A1 - Cơ bản",
  },
  {
    id: "v3",
    title: "Số đếm tiếng Hàn - Hán Hàn và Thuần Hàn",
    description: "Phân biệt và học thuộc 2 hệ thống số đếm trong tiếng Hàn: Hán Hàn (일이삼) và Thuần Hàn (하나둘셋).",
    youtubeId: "MoU4FpBqMXk",
    duration: "22:18",
    level: "A1",
    topic: "Số đếm",
    views: 87300,
    likes: 6120,
    instructor: "Thầy Kim",
    tags: ["số đếm", "hán hàn", "thuần hàn"],
    playlist: "Khóa A1 - Cơ bản",
  },
  {
    id: "v4",
    title: "Ngữ pháp A2 - Trợ từ 은/는, 이/가, 을/를",
    description: "Hiểu rõ cách dùng các trợ từ quan trọng nhất trong tiếng Hàn với ví dụ thực tế.",
    youtubeId: "pIFHGxCVMYc",
    duration: "35:20",
    level: "A2",
    topic: "Ngữ pháp",
    views: 76500,
    likes: 5890,
    instructor: "Cô Park",
    tags: ["ngữ pháp", "trợ từ", "A2"],
    playlist: "Khóa A2 - Sơ cấp",
  },
  {
    id: "v5",
    title: "Từ vựng chủ đề Gia đình - 50 từ thiết yếu",
    description: "Học 50 từ vựng về gia đình, các mối quan hệ thân tộc trong tiếng Hàn với cách phát âm chuẩn.",
    youtubeId: "3AtDnEC4zak",
    duration: "18:45",
    level: "A2",
    topic: "Từ vựng",
    views: 65200,
    likes: 4780,
    instructor: "Thầy Kim",
    tags: ["từ vựng", "gia đình", "A2"],
    playlist: "Khóa A2 - Sơ cấp",
  },
  {
    id: "v6",
    title: "Luyện nghe B1 - Hội thoại tại nhà hàng",
    description: "Luyện nghe và hiểu hội thoại thực tế tại nhà hàng Hàn Quốc với phụ đề song ngữ.",
    youtubeId: "BKorP55Aqvg",
    duration: "24:10",
    level: "B1",
    topic: "Luyện nghe",
    views: 54800,
    likes: 4120,
    instructor: "Cô Lee",
    tags: ["luyện nghe", "nhà hàng", "B1"],
    playlist: "Khóa B1 - Trung cấp",
  },
  {
    id: "v7",
    title: "TOPIK I - Chiến lược làm bài thi hiệu quả",
    description: "Hướng dẫn chi tiết cách làm bài thi TOPIK I, phân tích cấu trúc đề thi và mẹo làm bài.",
    youtubeId: "Yw6u6YkTgQ4",
    duration: "42:30",
    level: "B1",
    topic: "TOPIK",
    views: 112000,
    likes: 9340,
    instructor: "Thầy Choi",
    tags: ["TOPIK", "thi cử", "chiến lược"],
    playlist: "Luyện thi TOPIK",
  },
  {
    id: "v8",
    title: "EPS-TOPIK - Từ vựng chủ đề Công xưởng",
    description: "Học từ vựng EPS-TOPIK chủ đề công xưởng, an toàn lao động với hình ảnh minh họa rõ ràng.",
    youtubeId: "dQw4w9WgXcQ",
    duration: "31:15",
    level: "B1",
    topic: "EPS-TOPIK",
    views: 89400,
    likes: 7230,
    instructor: "Thầy Kim",
    tags: ["EPS", "công xưởng", "từ vựng"],
    playlist: "Luyện thi EPS-TOPIK",
  },
  {
    id: "v9",
    title: "Ngữ pháp B2 - Câu điều kiện và giả định",
    description: "Học các cấu trúc câu điều kiện -면/으면, -다면, -았/었더라면 với ví dụ phong phú.",
    youtubeId: "9bZkp7q19f0",
    duration: "38:50",
    level: "B2",
    topic: "Ngữ pháp",
    views: 43200,
    likes: 3560,
    instructor: "Cô Park",
    tags: ["ngữ pháp", "điều kiện", "B2"],
    playlist: "Khóa B2 - Trung cao cấp",
  },
  {
    id: "v10",
    title: "K-pop Lesson - BTS Dynamite phân tích từng câu",
    description: "Học tiếng Hàn qua bài hát Dynamite của BTS, phân tích ngữ pháp và từ vựng từng câu.",
    youtubeId: "gdZLi9oWNZg",
    duration: "26:40",
    level: "A2",
    topic: "K-pop",
    views: 198000,
    likes: 15600,
    instructor: "Cô Lee",
    tags: ["K-pop", "BTS", "Dynamite"],
    playlist: "Học qua K-pop",
  },
  {
    id: "v11",
    title: "Phát âm chuẩn - Quy tắc biến âm tiếng Hàn",
    description: "Học 7 quy tắc biến âm quan trọng nhất trong tiếng Hàn để phát âm tự nhiên như người bản ngữ.",
    youtubeId: "kffacxfA7G4",
    duration: "33:25",
    level: "A2",
    topic: "Phát âm",
    views: 67800,
    likes: 5430,
    instructor: "Thầy Choi",
    tags: ["phát âm", "biến âm", "A2"],
    playlist: "Khóa A2 - Sơ cấp",
  },
  {
    id: "v12",
    title: "TOPIK II - Luyện viết luận văn mẫu",
    description: "Hướng dẫn viết bài luận TOPIK II với cấu trúc chuẩn, từ vựng học thuật và mẫu câu nâng cao.",
    youtubeId: "JGwWNGJdvx8",
    duration: "55:10",
    level: "C1",
    topic: "TOPIK",
    views: 38900,
    likes: 3120,
    instructor: "Cô Park",
    tags: ["TOPIK II", "viết luận", "C1"],
    playlist: "Luyện thi TOPIK",
  },
];

const PLAYLISTS = ["Tất cả", "Khóa A1 - Cơ bản", "Khóa A2 - Sơ cấp", "Khóa B1 - Trung cấp", "Khóa B2 - Trung cao cấp", "Luyện thi TOPIK", "Luyện thi EPS-TOPIK", "Học qua K-pop"];
const LEVELS = ["Tất cả", "A1", "A2", "B1", "B2", "C1"];
const TOPICS = ["Tất cả", "Hangul", "Giao tiếp", "Ngữ pháp", "Từ vựng", "Luyện nghe", "Phát âm", "TOPIK", "EPS-TOPIK", "K-pop"];

export default function VideoLessonsPage() {
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [playlist, setPlaylist] = useState("Tất cả");
  const [level, setLevel] = useState("Tất cả");
  const [topic, setTopic] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());
  const [showPlayer, setShowPlayer] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const filtered = VIDEO_LESSONS.filter(v => {
    if (playlist !== "Tất cả" && v.playlist !== playlist) return false;
    if (level !== "Tất cả" && v.level !== level) return false;
    if (topic !== "Tất cả" && v.topic !== topic) return false;
    if (search && !v.title.toLowerCase().includes(search.toLowerCase()) && !v.tags.some(t => t.includes(search.toLowerCase()))) return false;
    return true;
  });

  const handlePlay = (video: VideoLesson) => {
    setSelectedVideo(video);
    setShowPlayer(true);
    setTimeout(() => playerRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const toggleLike = (id: string) => {
    setLikedVideos(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSave = (id: string) => {
    setSavedVideos(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const levelColor: Record<string, string> = {
    A1: "bg-emerald-500/20 text-app-accent-success",
    A2: "bg-teal-500/20 text-teal-400",
    B1: "bg-amber-500/20 text-amber-400",
    B2: "bg-orange-500/20 text-orange-400",
    C1: "bg-rose-500/20 text-rose-400",
  };

  return (
    <DashboardLayout>
      <div className="py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Video Bài Giảng</h1>
            <p className="text-white/50 text-sm mt-1">Học tiếng Hàn qua video chất lượng cao từ giáo viên bản ngữ</p>
          </div>
          <div className="flex items-center gap-2 text-app-text-secondary text-sm">
            <i className="ri-play-circle-line"></i>
            <span>{VIDEO_LESSONS.length} video</span>
          </div>
        </div>

        {/* Video Player */}
        {showPlayer && selectedVideo && (
          <div ref={playerRef} className="bg-[#1a1f2e] rounded-2xl overflow-hidden border border-app-border animate-fade-in">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${levelColor[selectedVideo.level]}`}>{selectedVideo.level}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-white/50">{selectedVideo.topic}</span>
                    <span className="text-xs text-app-text-muted">{selectedVideo.playlist}</span>
                  </div>
                  <h2 className="text-white font-bold text-lg">{selectedVideo.title}</h2>
                  <p className="text-white/50 text-sm mt-1">{selectedVideo.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-app-text-secondary text-sm">
                    <span><i className="ri-eye-line mr-1"></i>{selectedVideo.views.toLocaleString()} lượt xem</span>
                    <span><i className="ri-time-line mr-1"></i>{selectedVideo.duration}</span>
                    <span><i className="ri-user-line mr-1"></i>{selectedVideo.instructor}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLike(selectedVideo.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap ${
                      likedVideos.has(selectedVideo.id) ? "bg-rose-500/20 text-rose-400" : "bg-white/8 text-white/50 hover:bg-white/12"
                    }`}
                  >
                    <i className={likedVideos.has(selectedVideo.id) ? "ri-heart-fill" : "ri-heart-line"}></i>
                    {selectedVideo.likes + (likedVideos.has(selectedVideo.id) ? 1 : 0)}
                  </button>
                  <button
                    onClick={() => toggleSave(selectedVideo.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap ${
                      savedVideos.has(selectedVideo.id) ? "bg-app-accent-primary/20 text-app-accent-primary" : "bg-white/8 text-white/50 hover:bg-white/12"
                    }`}
                  >
                    <i className={savedVideos.has(selectedVideo.id) ? "ri-bookmark-fill" : "ri-bookmark-line"}></i>
                    {savedVideos.has(selectedVideo.id) ? "Đã lưu" : "Lưu"}
                  </button>
                  <button
                    onClick={() => setShowPlayer(false)}
                    className="p-2 rounded-lg bg-white/8 text-white/50 hover:bg-white/12 transition-all cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              </div>
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedVideo.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-app-card/50 text-app-text-muted">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#1a1f2e] rounded-xl p-4 border border-app-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
              <input
                type="text"
                placeholder="Tìm kiếm video..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-app-card/50 border border-app-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-app-accent-primary/40"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-app-text-muted text-xs">Cấp độ:</span>
              {LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                    level === l ? "bg-app-accent-primary/20 text-app-accent-primary font-semibold" : "bg-app-card/50 text-app-text-secondary hover:bg-app-card/70"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-app-text-muted text-xs">Chủ đề:</span>
              {TOPICS.map(t => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                    topic === t ? "bg-app-accent-primary/20 text-app-accent-primary font-semibold" : "bg-app-card/50 text-app-text-secondary hover:bg-app-card/70"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Playlist tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {PLAYLISTS.map(p => (
            <button
              key={p}
              onClick={() => setPlaylist(p)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                playlist === p ? "bg-app-accent-primary/20 text-app-accent-primary font-semibold border border-app-accent-primary/20" : "bg-app-card/50 text-app-text-secondary hover:bg-app-card/70 border border-transparent"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-app-text-muted text-sm">{filtered.length} video</p>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(video => (
            <div
              key={video.id}
              className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-app-border hover:border-white/15 transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative cursor-pointer" onClick={() => handlePlay(video)}>
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-44 object-cover"
                  onError={e => {
                    (e.target as HTMLImageElement).style.background = "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)";
                  }}
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-app-border/200 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="ri-play-fill text-white text-xl ml-0.5"></i>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                  {video.duration}
                </div>
                <div className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-semibold ${levelColor[video.level]}`}>
                  {video.level}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3
                    className="text-white text-sm font-semibold leading-snug cursor-pointer hover:text-app-accent-primary transition-colors line-clamp-2"
                    onClick={() => handlePlay(video)}
                  >
                    {video.title}
                  </h3>
                </div>
                <p className="text-app-text-secondary text-xs line-clamp-2 mb-3">{video.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-app-text-muted text-xs">
                    <span><i className="ri-eye-line mr-0.5"></i>{(video.views / 1000).toFixed(0)}K</span>
                    <span><i className="ri-heart-line mr-0.5"></i>{(video.likes / 1000).toFixed(1)}K</span>
                    <span><i className="ri-user-line mr-0.5"></i>{video.instructor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleSave(video.id)}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        savedVideos.has(video.id) ? "text-app-accent-primary" : "text-app-text-muted hover:text-white/60"
                      }`}
                    >
                      <i className={savedVideos.has(video.id) ? "ri-bookmark-fill" : "ri-bookmark-line"}></i>
                    </button>
                    <button
                      onClick={() => handlePlay(video)}
                      className="px-3 py-1.5 rounded-lg bg-app-accent-primary/15 text-app-accent-primary text-xs font-semibold hover:bg-app-accent-primary/25 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Xem ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-app-text-muted">
            <i className="ri-video-off-line text-4xl mb-3 block"></i>
            <p>Không tìm thấy video phù hợp</p>
          </div>
        )}

        {/* YouTube Playlist CTA */}
        <div className="bg-gradient-to-r from-red-600/10 to-red-500/5 border border-red-500/20 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <i className="ri-youtube-line text-red-400 text-2xl"></i>
            </div>
            <div>
              <p className="text-white font-semibold">Kênh YouTube Hàn Quốc Ơi!</p>
              <p className="text-app-text-secondary text-sm">Đăng ký để nhận thông báo video mới nhất</p>
            </div>
          </div>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-external-link-line mr-1.5"></i>
            Đăng ký kênh
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
