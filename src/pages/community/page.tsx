import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { sanitizeHtml } from "@/lib/sanitize";
import { supabase, getStorageUrl, resolveStoragePaths } from "@/lib/supabase";
import { isVipActive } from "@/lib/supabase";
import { communitySlug } from "@/lib/slugify";
import { useCommunitySettings } from "@/hooks/useCommunitySettings";
import OnlineUsersWidget from "./components/OnlineUsersWidget";

// ─── Rich Text Editor Component (WordPress-like, no external deps) ────────────
function RichEditor({ value, onChange, placeholder, onImageUpload }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>; // returns URL
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [focused, setFocused] = useState(false);

  const handleChange = () => {
    if (editorRef.current) {
      onChangeRef.current(editorRef.current.innerHTML);
    }
  };

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val || undefined);
    handleChange();
  };

  // Set initial content once
  useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle paste - allow plain text + basic formatting, strip dangerous HTML
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
    if (!text) return;
    // Use execCommand to insert (keeps it in undo stack)
    document.execCommand('insertHTML', false, text);
    handleChange();
  };

  const handleInsertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;
    try {
      const url = await onImageUpload(file);
      editorRef.current?.focus();
      document.execCommand('insertHTML', false, `<img src="${url}" alt="" style="max-width:100%;border-radius:8px;margin:8px 0" /><br/>`);
      handleChange();
    } catch (err) {
      console.error('Image insert error:', err);
      alert('Lỗi chèn ảnh');
    }
    e.target.value = ''; // reset to allow same file again
  };

  const TOOLBAR = [
    { group: [
      { type: 'select', key: 'heading', options: [
        { label: 'Văn bản', cmd: 'formatBlock', val: 'P' },
        { label: 'Tiêu đề 1', cmd: 'formatBlock', val: 'H1' },
        { label: 'Tiêu đề 2', cmd: 'formatBlock', val: 'H2' },
        { label: 'Tiêu đề 3', cmd: 'formatBlock', val: 'H3' },
        { label: 'Trích dẫn', cmd: 'formatBlock', val: 'BLOCKQUOTE' },
      ]},
    ]},
    { group: [
      { cmd: 'bold', icon: 'ri-bold', tip: 'In đậm (Ctrl+B)' },
      { cmd: 'italic', icon: 'ri-italic', tip: 'In nghiêng (Ctrl+I)' },
      { cmd: 'underline', icon: 'ri-underline', tip: 'Gạch chân (Ctrl+U)' },
      { cmd: 'strikeThrough', icon: 'ri-strikethrough', tip: 'Gạch ngang' },
    ]},
    { group: [
      { type: 'color', cmd: 'foreColor', icon: 'ri-font-color', tip: 'Màu chữ' },
      { type: 'color', cmd: 'hiliteColor', icon: 'ri-mark-pen-line', tip: 'Màu nền' },
    ]},
    { group: [
      { cmd: 'insertUnorderedList', icon: 'ri-list-unordered', tip: 'Danh sách' },
      { cmd: 'insertOrderedList', icon: 'ri-list-ordered', tip: 'Danh sách số' },
    ]},
    { group: [
      { cmd: 'justifyLeft', icon: 'ri-align-left', tip: 'Căn trái' },
      { cmd: 'justifyCenter', icon: 'ri-align-center', tip: 'Căn giữa' },
      { cmd: 'justifyRight', icon: 'ri-align-right', tip: 'Căn phải' },
      { cmd: 'justifyFull', icon: 'ri-align-justify', tip: 'Căn đều' },
    ]},
    { group: [
      { cmd: 'createLink', icon: 'ri-link', tip: 'Chèn link' },
      { cmd: 'unlink', icon: 'ri-link-unlink', tip: 'Xóa link' },
      { cmd: 'insertImage', icon: 'ri-image-add-line', tip: 'Chèn ảnh' },
    ]},
    { group: [
      { cmd: 'undo', icon: 'ri-arrow-go-back-line', tip: 'Hoàn tác (Ctrl+Z)' },
      { cmd: 'redo', icon: 'ri-arrow-go-forward-line', tip: 'Làm lại (Ctrl+Y)' },
      { cmd: 'removeFormat', icon: 'ri-format-clear', tip: 'Xóa định dạng' },
    ]},
  ] as const;

  const handleToolbar = (item: any) => {
    if (item.cmd === 'createLink') {
      const url = prompt('Nhập URL:');
      if (url) exec('createLink', url);
    } else if (item.cmd === 'insertImage') {
      fileInputRef.current?.click();
    } else {
      exec(item.cmd, item.val);
    }
  };

  return (
    <div className={`bg-app-card/30 border rounded-xl overflow-hidden transition-colors ${focused ? 'border-app-accent-primary/40' : 'border-app-border'}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-app-border bg-app-card/50 flex-wrap">
        {TOOLBAR.map((section, si) => (
          <div key={si} className="flex items-center gap-0.5">
            {si > 0 && <div className="w-px h-5 bg-app-border mx-1" />}
            {section.group.map((item: any, ii) => {
              if (item.type === 'select') {
                return (
                  <select
                    key={ii}
                    onChange={(e) => {
                      const opt = item.options.find((o: any) => o.label === e.target.value);
                      if (opt) exec(opt.cmd, opt.val);
                      e.target.value = '';
                    }}
                    className="bg-app-card border border-app-border rounded-md px-2 py-1 text-white/70 text-xs cursor-pointer outline-none hover:border-white/20"
                    defaultValue=""
                  >
                    <option value="" disabled>Định dạng</option>
                    {item.options.map((o: any) => (
                      <option key={o.label} value={o.label} className="bg-app-bg">{o.label}</option>
                    ))}
                  </select>
                );
              }
              if (item.type === 'color') {
                return (
                  <label
                    key={ii}
                    title={item.tip}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative"
                  >
                    <i className={`${item.icon} text-sm`}></i>
                    <input
                      type="color"
                      onChange={(e) => exec(item.cmd, e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                );
              }
              return (
                <button
                  key={ii}
                  type="button"
                  onClick={() => handleToolbar(item)}
                  title={item.tip}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <i className={`${item.icon} text-sm`}></i>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Hidden file input for image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInsertImage}
        className="hidden"
      />

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleChange}
        onKeyUp={handleChange}
        onBlur={() => { setFocused(false); handleChange(); }}
        onFocus={() => setFocused(true)}
        onPaste={handlePaste}
        data-placeholder={placeholder || "Viết nội dung bài đăng..."}
        className="rich-editor-content min-h-[300px] p-4 text-white/85 text-sm leading-relaxed outline-none"
        style={{ wordBreak: 'break-word' }}
      />
      <style>{`
        .rich-editor-content:empty:before {
          content: attr(data-placeholder);
          color: rgba(255,255,255,0.2);
          pointer-events: none;
        }
        .rich-editor-content h1 { font-size: 1.5rem; font-weight: 700; margin: 0.5em 0; color: #fff; }
        .rich-editor-content h2 { font-size: 1.25rem; font-weight: 700; margin: 0.5em 0; color: #fff; }
        .rich-editor-content h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5em 0; color: #fff; }
        .rich-editor-content blockquote { border-left: 3px solid #d4b43a; padding-left: 12px; margin: 8px 0; color: rgba(255,255,255,0.6); font-style: italic; }
        .rich-editor-content ul, .rich-editor-content ol { padding-left: 24px; margin: 8px 0; }
        .rich-editor-content li { margin: 4px 0; }
        .rich-editor-content a { color: #d4b43a; text-decoration: underline; }
        .rich-editor-content img { max-width: 100%; border-radius: 8px; margin: 8px 0; }
      `}</style>
    </div>
  );
}

/** Check if rich text content is effectively empty */
function isRichEmpty(html: string): boolean {
  if (!html) return true;
  const text = html.replace(/<[^>]*>/g, '').trim();
  return text.length === 0;
}

// ─── Schema.org FAQPage structured data ─────────────────────────────────────
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "name": "Cộng đồng học tiếng Hàn - Hàn Quốc Ơi!",
  "description": "Cộng đồng hỏi đáp, chia sẻ kinh nghiệm học tiếng Hàn, EPS-TOPIK và cuộc sống tại Hàn Quốc",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Làm thế nào để học tiếng Hàn hiệu quả cho kỳ thi EPS-TOPIK?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Để học tiếng Hàn hiệu quả cho EPS-TOPIK, bạn nên: học từ vựng theo chủ đề (an toàn lao động, giao tiếp cơ bản, pháp luật lao động), luyện nghe hàng ngày, làm bài thi thử thường xuyên và duy trì streak học tập liên tục."
      }
    },
    {
      "@type": "Question",
      "name": "EPS-TOPIK gồm những phần thi nào?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "EPS-TOPIK gồm 2 phần: Nghe hiểu (25 câu, 25 phút) và Đọc hiểu (25 câu, 25 phút). Tổng 50 câu, thời gian 50 phút. Điểm đậu tối thiểu là 80/200 điểm."
      }
    },
    {
      "@type": "Question",
      "name": "Người lao động nước ngoài ở Hàn Quốc có những quyền lợi gì?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Người lao động nước ngoài tại Hàn Quốc được hưởng: lương tối thiểu theo quy định, 4 loại bảo hiểm bắt buộc (y tế, lương hưu, việc làm, tai nạn lao động), nghỉ phép có lương sau 1 năm làm việc, và được bảo vệ theo Luật Tiêu chuẩn Lao động."
      }
    },
    {
      "@type": "Question",
      "name": "Khi bị tai nạn lao động ở Hàn Quốc cần làm gì?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Khi bị tai nạn lao động: 1) Báo ngay cho cấp trên và gọi 119 nếu cần cấp cứu, 2) Đến bệnh viện điều trị, 3) Báo cáo lên 근로복지공단 (Công đoàn phúc lợi lao động) để được hưởng bảo hiểm tai nạn lao động. Người nước ngoài cũng được bảo vệ đầy đủ."
      }
    },
    {
      "@type": "Question",
      "name": "Làm thế nào để duy trì streak học tập hàng ngày?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Để duy trì streak học tập: đặt giờ học cố định mỗi ngày, học ít nhất 10-15 phút/ngày, sử dụng tính năng nhắc nhở, học flashcard từ vựng EPS, và tham gia cộng đồng để được động viên từ các thành viên khác."
      }
    },
    {
      "@type": "Question",
      "name": "Số điện thoại khẩn cấp quan trọng ở Hàn Quốc là gì?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Các số điện thoại khẩn cấp quan trọng tại Hàn Quốc: 112 (Cảnh sát), 119 (Cứu hỏa và Cấp cứu), 1345 (Trung tâm hỗ trợ người nước ngoài - hỗ trợ tiếng Việt 24/7), 1350 (Đường dây lao động - tư vấn quyền lợi lao động)."
      }
    }
  ]
};

function CommunityFAQSchema() {
  useEffect(() => {
    const existing = document.getElementById("community-faq-schema");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "community-faq-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById("community-faq-schema");
      if (el) el.remove();
    };
  }, []);
  return null;
}

type Category = "all" | "question" | "share" | "result" | "tip";
type SortBy = "latest" | "popular" | "comments";

interface Post {
  id: string;
  user_id: string | null;
  author_name: string;
  author_level: string;
  author_xp: number;
  category: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments_count: number;
  is_pinned: boolean;
  exam_score: number | null;
  streak_days: number | null;
  created_at: string;
  status?: "pending" | "approved" | "rejected" | null;
}

interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  user_id: string;
  author_name: string;
  author_level: string;
  content: string;
  likes: number;
  created_at: string;
  status?: "pending" | "approved" | "rejected" | null;
  replies?: Comment[];
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  all: { label: "Tất cả", icon: "ri-apps-line", color: "app-accent-primary" },
  question: { label: "Hỏi đáp", icon: "ri-question-answer-line", color: "#60a5fa" },
  share: { label: "Chia sẻ", icon: "ri-share-line", color: "#34d399" },
  result: { label: "Kết quả thi", icon: "ri-trophy-line", color: "#FFD700" },
  tip: { label: "Mẹo học", icon: "ri-lightbulb-line", color: "#fb923c" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Vừa xong";
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

// ─── Comment Item ────────────────────────────────────────────────────────────
function CommentItem({
  comment,
  depth,
  onReply,
  currentUser,
}: {
  comment: Comment;
  depth: number;
  onReply: (parentId: string, parentAuthor: string) => void;
  currentUser: { id: string; name: string } | null;
}) {
  return (
    <div className={`${depth > 0 ? "ml-8 border-l border-app-border pl-4" : ""}`}>
      <div className="flex gap-2.5 py-3">
        <div className="w-7 h-7 rounded-full bg-app-accent-primary/15 flex items-center justify-center flex-shrink-0">
          <i className="ri-user-line text-app-accent-primary text-xs"></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-white/80 text-xs font-semibold">{comment.author_name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-app-card/50 text-app-text-muted">{comment.author_level}</span>
            <span className="text-[10px] text-app-text-muted">{timeAgo(comment.created_at)}</span>
            {comment.status === "pending" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25">
                <i className="ri-time-line mr-0.5"></i>Đang chờ duyệt
              </span>
            )}
            {comment.status === "rejected" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/25">
                <i className="ri-close-circle-line mr-0.5"></i>Bị từ chối
              </span>
            )}
          </div>
          <p className="text-white/60 text-xs leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-3 mt-1.5">
            {currentUser && depth < 2 && (
              <button
                onClick={() => onReply(comment.id, comment.author_name)}
                className="text-[10px] text-app-text-muted hover:text-app-accent-primary/70 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-reply-line mr-1"></i>Trả lời
              </button>
            )}
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} currentUser={currentUser} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AI Suggestion Panel ─────────────────────────────────────────────────────
function AISuggestionPanel({ post, onClose }: { post: Post; onClose: () => void }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    // Generate AI suggestions based on post content
    const generateSuggestions = () => {
      setLoading(true);
      setTimeout(() => {
        const isQuestion = post.category === "question";
        const content = post.content.toLowerCase();

        let generated: string[] = [];

        if (content.includes("eps") || content.includes("topik")) {
          generated = [
            "EPS-TOPIK 시험은 듣기 25문제, 읽기 25문제로 구성되어 있어요. 매일 꾸준히 공부하는 것이 중요해요!\n(Kỳ thi EPS-TOPIK gồm 25 câu nghe và 25 câu đọc. Điều quan trọng là học đều đặn mỗi ngày!)",
            "저도 EPS-TOPIK 준비 중이에요. 같이 공부해요! 화이팅!\n(Tôi cũng đang chuẩn bị EPS-TOPIK. Cùng học nhé! Cố lên!)",
            "단어 암기는 플래시카드를 사용하면 효과적이에요. 하루에 20개씩 외우면 좋아요.\n(Học từ vựng bằng flashcard rất hiệu quả. Mỗi ngày học 20 từ là tốt.)",
          ];
        } else if (content.includes("문법") || content.includes("ngữ pháp") || content.includes("grammar")) {
          generated = [
            "한국어 문법은 처음에 어렵지만 꾸준히 연습하면 늘어요. 어떤 문법이 어려우세요?\n(Ngữ pháp tiếng Hàn khó lúc đầu nhưng sẽ tiến bộ nếu luyện tập đều đặn. Bạn thấy ngữ pháp nào khó?)",
            "문법 공부할 때 예문을 많이 읽으면 도움이 돼요. 예문으로 외우는 게 좋아요!\n(Khi học ngữ pháp, đọc nhiều câu ví dụ rất hữu ích. Nên học thuộc qua câu ví dụ!)",
            "저는 유튜브에서 한국어 문법 강의를 보면서 공부해요. 추천해 드릴까요?\n(Tôi học ngữ pháp qua video YouTube. Bạn có muốn tôi giới thiệu không?)",
          ];
        } else if (content.includes("발음") || content.includes("phát âm") || content.includes("pronunciation")) {
          generated = [
            "발음 연습은 매일 소리 내어 읽는 것이 중요해요. 원어민 발음을 따라 해보세요!\n(Luyện phát âm quan trọng là đọc to mỗi ngày. Hãy bắt chước phát âm của người bản ngữ!)",
            "한국어 발음 중 ㄹ 발음이 베트남 사람들에게 어렵다고 해요. 많이 연습하세요!\n(Trong tiếng Hàn, âm ㄹ được nói là khó với người Việt. Hãy luyện tập nhiều!)",
            "TTS 앱을 사용해서 발음을 들으면서 따라 하면 효과적이에요.\n(Dùng app TTS để nghe và bắt chước phát âm rất hiệu quả.)",
          ];
        } else if (isQuestion) {
          generated = [
            "좋은 질문이에요! 저도 같은 고민을 했었어요. 같이 해결해 봐요!\n(Câu hỏi hay đấy! Tôi cũng từng băn khoăn điều này. Cùng giải quyết nhé!)",
            "이 부분은 저도 공부 중이에요. 선생님께 여쭤보는 것도 좋을 것 같아요.\n(Phần này tôi cũng đang học. Hỏi giáo viên cũng là ý hay đấy.)",
            "한국어 공부 화이팅! 모르는 것을 물어보는 것이 가장 빠른 방법이에요.\n(Cố lên học tiếng Hàn! Hỏi những gì không biết là cách nhanh nhất.)",
          ];
        } else {
          generated = [
            "정말 대단해요! 열심히 공부하시는 모습이 멋있어요. 저도 더 열심히 해야겠어요!\n(Thật tuyệt vời! Hình ảnh bạn học chăm chỉ thật đáng ngưỡng mộ. Tôi cũng phải cố gắng hơn!)",
            "축하해요! 앞으로도 계속 화이팅! 같이 열심히 공부해요!\n(Chúc mừng! Tiếp tục cố lên! Cùng nhau học chăm chỉ nhé!)",
            "좋은 정보 감사해요! 저도 참고할게요. 도움이 많이 됐어요!\n(Cảm ơn thông tin hay! Tôi sẽ tham khảo. Rất hữu ích!)",
          ];
        }

        setSuggestions(generated);
        setLoading(false);
      }, 1200);
    };

    generateSuggestions();
  }, [post]);

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-app-bg border border-app-border rounded-t-2xl w-full max-w-2xl max-h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-accent-primary/15">
              <i className="ri-robot-line text-app-accent-primary text-sm"></i>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">AI Gợi ý câu trả lời</h3>
              <p className="text-app-text-muted text-[10px]">Dựa trên nội dung bài đăng</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary hover:text-white/70 cursor-pointer">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {/* Post preview */}
          <div className="bg-app-surface/50 border border-app-border rounded-xl p-3 mb-4">
            <p className="text-app-text-secondary text-[10px] tracking-normal mb-1">Bài đăng</p>
            <p className="text-white/70 text-xs font-medium line-clamp-2">{post.title}</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>
              <p className="text-app-text-muted text-xs">AI đang phân tích và tạo gợi ý...</p>
            </div>
          ) : (
            <>
              <p className="text-app-text-muted text-xs mb-3">Chọn một gợi ý để copy và dùng làm bình luận:</p>
              {suggestions.map((s, i) => (
                <div key={i} className="bg-app-surface/50 border border-app-border rounded-xl p-4 hover:border-white/15 transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-app-accent-primary/10 flex-shrink-0 mt-0.5">
                      <span className="text-app-accent-primary text-[10px] font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-xs leading-relaxed whitespace-pre-line">{s}</p>
                    </div>
                    <button
                      onClick={() => copyText(s, i)}
                      className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap ${copied === i ? "bg-emerald-500/20 text-app-accent-success" : "bg-app-card/50 text-app-text-secondary hover:bg-app-card/70 hover:text-white/70"}`}
                    >
                      <i className={`${copied === i ? "ri-check-line" : "ri-file-copy-line"} text-xs`}></i>
                      {copied === i ? "Đã copy" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-app-text-muted text-[10px] text-center pt-2">
                <i className="ri-information-line mr-1"></i>
                Gợi ý được tạo tự động — hãy chỉnh sửa cho phù hợp trước khi đăng
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Comments Panel ──────────────────────────────────────────────────────────
function CommentsPanel({
  postId,
  onClose,
  currentUser,
  profile,
}: {
  postId: string;
  onClose: () => void;
  currentUser: { id: string } | null;
  profile: { display_name: string } | null;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    // RLS policy tự động lọc: approved + of-author + admin. Query all fields để
    // hiển thị badge "Đang chờ duyệt" cho comment của chính mình.
    const { data } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data) {
      const roots: Comment[] = [];
      const map: Record<string, Comment> = {};
      data.forEach((c: Comment) => { map[c.id] = { ...c, replies: [] }; });
      data.forEach((c: Comment) => {
        if (c.parent_id && map[c.parent_id]) {
          map[c.parent_id].replies!.push(map[c.id]);
        } else {
          roots.push(map[c.id]);
        }
      });
      setComments(roots);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async () => {
    if (!text.trim() || !currentUser || submitting) return;
    setSubmitting(true);
    // Insert với status='pending' (trigger auto-approve nếu admin/mod)
    const { error } = await supabase.from("community_comments").insert({
      post_id: postId,
      parent_id: replyTo?.id || null,
      user_id: currentUser.id,
      author_name: profile?.display_name || "Học viên",
      author_level: "Học viên",
      content: text.trim(),
      status: "pending",
    });
    if (!error) {
      setText("");
      setReplyTo(null);
      await fetchComments();
      alert("Bình luận của bạn đã gửi — đang chờ quản trị viên duyệt.");
    } else {
      alert(`Lỗi gửi bình luận: ${error.message}`);
    }
    setSubmitting(false);
  };

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-app-bg border border-app-border rounded-t-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border flex-shrink-0">
          <h3 className="text-white font-bold text-sm">
            Bình luận <span className="text-app-text-muted font-normal">({totalCount})</span>
          </h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary hover:text-white/70 cursor-pointer">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 divide-y divide-white/3">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <i className="ri-chat-3-line text-white/10 text-3xl mb-2"></i>
              <p className="text-app-text-muted text-sm">Chưa có bình luận nào</p>
              <p className="text-app-text-muted text-xs mt-1">Hãy là người đầu tiên bình luận!</p>
            </div>
          ) : (
            comments.map(c => (
              <CommentItem
                key={c.id}
                comment={c}
                depth={0}
                onReply={(id, author) => setReplyTo({ id, author })}
                currentUser={currentUser ? { id: currentUser.id, name: profile?.display_name || "" } : null}
              />
            ))
          )}
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-app-border flex-shrink-0">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-lg">
              <i className="ri-reply-line text-app-accent-primary text-xs"></i>
              <span className="text-app-accent-primary/70 text-xs">Đang trả lời <strong>{replyTo.author}</strong></span>
              <button onClick={() => setReplyTo(null)} className="ml-auto text-app-text-muted hover:text-white/60 cursor-pointer">
                <i className="ri-close-line text-xs"></i>
              </button>
            </div>
          )}
          {currentUser ? (
            <div className="flex gap-2">
              <input
                value={text}
                onChange={e => setText(e.target.value.slice(0, 500))}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder={replyTo ? `Trả lời ${replyTo.author}...` : "Viết bình luận..."}
                className="flex-1 bg-app-card/50 border border-app-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary/30 placeholder-white/20"
              />
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || submitting}
                className="px-4 py-2.5 bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 text-app-bg font-bold text-sm rounded-xl cursor-pointer whitespace-nowrap transition-colors"
              >
                {submitting ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-send-plane-fill"></i>}
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-app-text-muted text-xs">Đăng nhập để bình luận</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Post Card ───────────────────────────────────────────────────────────────
function PostCard({
  post,
  onLike,
  liked,
  onOpenComments,
  onOpenDetail,
  onViewProfile,
  onAISuggest,
}: {
  post: Post;
  onLike: (id: string) => void;
  liked: boolean;
  onOpenComments: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onViewProfile: (userId: string) => void;
  onAISuggest: (post: Post) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG.share;

  return (
    <div className={`bg-app-bg border rounded-2xl p-5 transition-all hover:border-app-border ${post.is_pinned ? "border-app-accent-primary/20" : post.status === "pending" ? "border-amber-500/30" : "border-app-border"}`}>
      {post.status === "pending" && (
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[11px] font-semibold mb-3 px-2.5 py-1.5 rounded-lg">
          <i className="ri-time-line"></i>
          Bài của bạn đang chờ quản trị viên duyệt — chỉ bạn nhìn thấy.
        </div>
      )}
      {post.status === "rejected" && (
        <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/25 text-red-400 text-[11px] font-semibold mb-3 px-2.5 py-1.5 rounded-lg">
          <i className="ri-close-circle-line"></i>
          Bài này đã bị từ chối.
        </div>
      )}
      {post.is_pinned && (
        <div className="flex items-center gap-1.5 text-app-accent-primary/60 text-[10px] font-semibold mb-3">
          <i className="ri-pushpin-fill text-xs"></i>Ghim
        </div>
      )}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-app-accent-primary/15 flex items-center justify-center flex-shrink-0">
          <i className="ri-user-line text-app-accent-primary text-sm"></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/80 text-sm font-semibold">{post.author_name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-card/50 text-app-text-secondary">{post.author_level}</span>
            <span className="text-[10px] text-app-text-muted">{timeAgo(post.created_at)}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
              <i className={`${cat.icon} mr-1`}></i>{cat.label}
            </span>
            {post.exam_score && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-app-accent-success">
                <i className="ri-trophy-line mr-1"></i>{post.exam_score}%
              </span>
            )}
            {post.streak_days && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fb923c]/10 text-[#fb923c]">
                <i className="ri-fire-line mr-1"></i>{post.streak_days} ngày
              </span>
            )}
          </div>
        </div>
      </div>

      <button onClick={() => onOpenDetail(post.id)} className="text-left w-full cursor-pointer group">
        <h3 className="text-white font-semibold text-sm mb-2 leading-snug group-hover:text-app-accent-primary/90 transition-colors">{post.title}</h3>
      </button>
      <p className={`text-white/50 text-xs leading-relaxed ${!expanded && "line-clamp-3"}`}>{resolveStoragePaths(post.content)}</p>
      {post.content.length > 150 && (
        <button onClick={() => setExpanded(v => !v)} className="text-app-accent-primary/60 text-[10px] mt-1 cursor-pointer hover:text-app-accent-primary whitespace-nowrap">
          {expanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}

      <div className="flex flex-wrap gap-1.5 mt-3">
        {post.tags.map(tag => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-app-surface/50 text-app-text-muted border border-app-border">#{tag}</span>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-app-border">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer whitespace-nowrap ${liked ? "text-app-accent-primary" : "text-app-text-muted hover:text-white/60"}`}
        >
          <i className={liked ? "ri-heart-fill" : "ri-heart-line"}></i>
          {post.likes + (liked ? 1 : 0)}
        </button>
        <button
          onClick={() => onOpenComments(post.id)}
          className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-app-accent-primary/70 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-chat-3-line"></i>
          {post.comments_count} bình luận
        </button>
        {post.user_id && (
          <button
            onClick={(e) => { e.stopPropagation(); onViewProfile(post.user_id!); }}
            className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-[#a78bfa]/70 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-user-line"></i>Hồ sơ
          </button>
        )}
        <button
          onClick={() => onAISuggest(post)}
          className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-app-accent-primary/70 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-robot-line"></i>AI gợi ý
        </button>
        <button
          onClick={() => onOpenDetail(post.id)}
          className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-app-accent-primary/70 transition-colors cursor-pointer whitespace-nowrap ml-auto"
        >
          <i className="ri-external-link-line"></i>Xem chi tiết
        </button>
      </div>
    </div>
  );
}

// ─── New Post Modal ──────────────────────────────────────────────────────────
// ─── Rich Text Toolbar ───────────────────────────────────────────────────────
function RichTextToolbar({ onFormat }: { onFormat: (tag: string) => void }) {
  const tools = [
    { icon: "ri-bold", tag: "bold", title: "In đậm" },
    { icon: "ri-italic", tag: "italic", title: "In nghiêng" },
    { icon: "ri-list-unordered", tag: "list", title: "Danh sách" },
    { icon: "ri-double-quotes-l", tag: "quote", title: "Trích dẫn" },
    { icon: "ri-code-line", tag: "code", title: "Code" },
  ];
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-app-surface/50 border border-app-border rounded-t-xl border-b-0">
      {tools.map(t => (
        <button key={t.tag} onClick={() => onFormat(t.tag)} title={t.title}
          className="w-7 h-7 flex items-center justify-center rounded-md text-app-text-secondary hover:text-white/70 hover:bg-white/8 transition-colors cursor-pointer">
          <i className={`${t.icon} text-sm`}></i>
        </button>
      ))}
    </div>
  );
}

function NewPostModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; category: string; imageUrl?: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("share");
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Convert to WebP and resize
      const webpData = await convertToWebP(file, 800);
      
      // Upload to Supabase storage
      const fileName = `${Date.now()}_${file.name.split('.')[0]}.webp`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('community-images')
        .upload(fileName, webpData, {
          contentType: 'image/webp',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Store relative path (not full URL) for easy VPS migration later
      const relativePath = `community-images/${fileName}`;
      setImageUrl(relativePath);
      setImagePreview(getStorageUrl(relativePath));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Lỗi khi upload ảnh');
    } finally {
      setUploadingImage(false);
    }
  };

  const convertToWebP = (file: File, maxWidth: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculate dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        }, 'image/webp', 0.8);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async () => {
    console.log('[NewPost] handleSubmit called', { title, contentLen: content.length, isEmpty: isRichEmpty(content) });
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề');
      return;
    }
    if (isRichEmpty(content)) {
      alert('Vui lòng nhập nội dung');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ title, content, category, imageUrl: imageUrl || undefined });
      onClose();
    } catch (err) {
      console.error('Submit error:', err);
      alert('Lỗi đăng bài: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border sticky top-0 bg-app-bg z-10">
          <h3 className="text-white font-bold text-base">Tạo bài đăng mới</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary hover:text-white/70 cursor-pointer">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-2">Loại bài đăng</label>
            <div className="flex gap-2 flex-wrap">
              {(["question", "share", "result", "tip"] as const).map(cat => {
                const c = CATEGORY_CONFIG[cat];
                return (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${category === cat ? "border" : "bg-app-surface/50 text-app-text-secondary border border-app-border hover:text-white/60"}`}
                    style={category === cat ? { backgroundColor: `${c.color}15`, color: c.color, borderColor: `${c.color}30` } : {}}>
                    <i className={c.icon}></i>{c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Tiêu đề</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề bài đăng..." maxLength={100}
              className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-app-accent-primary/40 placeholder-white/20" />
          </div>

          {/* Rich text content */}
          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Nội dung</label>
            <RichEditor
              value={content}
              onChange={setContent}
              placeholder="Chia sẻ kinh nghiệm, đặt câu hỏi hoặc khoe thành tích..."
            />
          </div>

          {/* Image upload */}
          <div>
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-app-text-secondary hover:text-white/70 text-xs cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-image-add-line text-sm"></i>
              Thêm ảnh (tự động chuyển WebP, resize về 800px)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {uploadingImage && (
              <div className="mt-2 text-app-text-muted text-xs">Đang upload ảnh...</div>
            )}
            {imagePreview && (
              <div className="mt-2 relative">
                <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl border border-app-border" />
                <button onClick={() => { setImageUrl(""); setImagePreview(""); }}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white/70 hover:text-white cursor-pointer">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-app-border text-white/50 text-sm cursor-pointer whitespace-nowrap hover:bg-app-card/50">Hủy</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
              {submitting ? "Đang đăng..." : "Đăng bài"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const POSTS_PER_PAGE = 10;

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-app-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-app-surface/50 transition-colors cursor-pointer"
      >
        <i className={`ri-arrow-right-s-line text-app-accent-primary/60 text-sm mt-0.5 transition-transform flex-shrink-0 ${open ? "rotate-90" : ""}`}></i>
        <span className="text-white/70 text-[11px] leading-snug font-medium">{question}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-0">
          <p className="text-app-text-secondary text-[10px] leading-relaxed pl-5">{answer}</p>
        </div>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const visible = pages.filter(p => p === 1 || p === total || Math.abs(p - current) <= 1);
  return (
    <div className="flex items-center justify-center gap-1.5 pt-4 border-t border-app-border">
      <button onClick={() => onChange(current - 1)} disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-app-border text-app-text-secondary hover:text-white/70 hover:bg-app-card/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
        <i className="ri-arrow-left-s-line text-sm"></i>
      </button>
      {visible.map((p, i) => {
        const prev = visible[i - 1];
        return (
          <span key={p} className="flex items-center gap-1.5">
            {prev && p - prev > 1 && <span className="text-app-text-muted text-xs">...</span>}
            <button onClick={() => onChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${p === current ? "bg-app-accent-primary text-app-bg font-bold" : "border border-app-border text-app-text-secondary hover:text-white/70 hover:bg-app-card/50"}`}>
              {p}
            </button>
          </span>
        );
      })}
      <button onClick={() => onChange(current + 1)} disabled={current === total}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-app-border text-app-text-secondary hover:text-white/70 hover:bg-app-card/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
        <i className="ri-arrow-right-s-line text-sm"></i>
      </button>
      <span className="text-app-text-muted text-xs ml-1">{current}/{total}</span>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category>("all");
  const [sortBy, setSortBy] = useState<SortBy>("latest");
  const [search, setSearch] = useState("");
  const [likedPosts, setLikedPosts] = useLocalStorage<string[]>("kts_liked_posts", []);
  const [showNewPost, setShowNewPost] = useState(false);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [aiSuggestPost, setAiSuggestPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [streak] = useLocalStorage<{ count: number }>("kts_streak", { count: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const { user, profile } = useAuth();
  const { settings: commSettings } = useCommunitySettings();

  // Reset page khi filter thay đổi
  useEffect(() => { setCurrentPage(1); }, [category, sortBy, search]);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    // RLS policy đã lọc: approved + own-pending + admin-all. Không cần
    // client-side filter nữa — chỉ cần SELECT *.
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data as Post[]);
    setLoadingPosts(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const filtered = useMemo(() => {
    let list = [...posts];
    if (category !== "all") list = list.filter(p => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    if (sortBy === "popular") list.sort((a, b) => b.likes - a.likes);
    else if (sortBy === "comments") list.sort((a, b) => b.comments_count - a.comments_count);
    else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return [...list.filter(p => p.is_pinned), ...list.filter(p => !p.is_pinned)];
  }, [posts, category, sortBy, search]);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const pagedPosts = filtered.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  // Guest view limit: chỉ giới hạn khách, thành viên đăng nhập xem full
  const isGuestLimited = !user && commSettings.access_control_enabled && commSettings.access_mode === "normal";
  const guestViewCount = isGuestLimited ? commSettings.guest_view_limit : Infinity;
  const displayPosts = isGuestLimited ? pagedPosts.slice(0, guestViewCount) : pagedPosts;
  const isGuestCutoff = isGuestLimited && pagedPosts.length > guestViewCount;

  const handleLike = async (id: string) => {
    const alreadyLiked = likedPosts.includes(id);
    setLikedPosts(prev => alreadyLiked ? prev.filter(x => x !== id) : [...prev, id]);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + (alreadyLiked ? -1 : 1) } : p));
    if (user) {
      if (alreadyLiked) {
        await supabase.from("community_likes").delete().eq("user_id", user.id).eq("post_id", id);
        await supabase.from("community_posts").update({ likes: posts.find(p => p.id === id)!.likes - 1 }).eq("id", id);
      } else {
        await supabase.from("community_likes").insert({ user_id: user.id, post_id: id });
        await supabase.from("community_posts").update({ likes: posts.find(p => p.id === id)!.likes + 1 }).eq("id", id);
      }
    }
  };

  const handleNewPost = async (data: { title: string; content: string; category: string; imageUrl?: string }) => {
    if (!user || !profile) return;

    // Kiểm tra chế độ bảo trì
    if (commSettings.access_mode === "maintenance") {
      alert("Cộng đồng đang bảo trì, vui lòng quay lại sau!");
      return;
    }

    // Kiểm tra giới hạn đăng bài/ngày (chỉ áp dụng ở chế độ normal)
    if (commSettings.access_control_enabled && commSettings.access_mode === "normal") {
      const limit = isVipActive(profile) ? commSettings.vip_daily_post_limit : commSettings.member_daily_post_limit;
      if (limit > 0) {
        const today = new Date().toISOString().slice(0, 10);
        const { count } = await supabase
          .from("community_posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", today);
        if (count !== null && count >= limit) {
          alert(`Bạn chỉ có thể đăng tối đa ${limit} bài/ngày. Nâng cấp VIP để không giới hạn!`);
          return;
        }
      }
    }

    // Store relative path in DB (not full URL) for VPS migration later
    // Format: {{storage:community-images/xxx.webp}} — converted to full URL on render
    const contentWithImage = data.imageUrl
      ? `${data.content}\n\n<img src="{{storage:${data.imageUrl}}}" alt="ảnh" style="max-width:100%;border-radius:12px" />`
      : data.content;
    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      author_name: profile.display_name || "Học viên",
      author_level: "Học viên",
      author_xp: 0,
      category: data.category,
      title: data.title,
      content: contentWithImage,
      tags: [],
      status: "pending",
    });
    if (error) {
      console.error('[handleNewPost] Insert error:', error);
      throw new Error(error.message);
    }
    await fetchPosts();
    alert("Bài đăng đã gửi — đang chờ quản trị viên duyệt. Bạn có thể xem bài của mình ở mục “Đang chờ duyệt”.");
  };

  return (
    <>
    <CommunityFAQSchema />
    <DashboardLayout
      title="Cộng đồng Hàn Quốc Ơi!"
      subtitle="Hỏi đáp, chia sẻ kinh nghiệm và cùng nhau tiến bộ"
      actions={
        user ? (
          <button onClick={() => setShowNewPost(true)}
            className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-add-line"></i>Đăng bài
          </button>
        ) : (
          <div className="flex items-center gap-2 text-app-text-secondary text-xs">
            <i className="ri-lock-line"></i>Đăng nhập để đăng bài
          </div>
        )
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main feed */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm bài đăng..."
                className="w-full bg-app-bg border border-app-border rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary/30 placeholder-white/20"
              />
            </div>
            <div className="flex items-center gap-1 bg-app-surface/50 border border-app-border rounded-lg p-1">
              {([["latest", "Mới nhất"], ["popular", "Phổ biến"], ["comments", "Bình luận"]] as [SortBy, string][]).map(([s, label]) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1 rounded-md text-xs transition-all whitespace-nowrap cursor-pointer ${sortBy === s ? "bg-app-card/70 text-white" : "text-app-text-secondary hover:text-white/60"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[string]][]).map(([cat, cfg]) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${category === cat ? "border" : "bg-app-surface/50 text-app-text-secondary border border-app-border hover:text-white/60"}`}
                style={category === cat ? { backgroundColor: `${cfg.color}15`, color: cfg.color, borderColor: `${cfg.color}30` } : {}}
              >
                <i className={cfg.icon}></i>{cfg.label}
              </button>
            ))}
            {filtered.length > 0 && (
              <span className="ml-auto text-app-text-muted text-xs self-center">{filtered.length} bài · trang {currentPage}/{totalPages || 1}</span>
            )}
          </div>

          {loadingPosts ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <i className="ri-chat-3-line text-white/10 text-4xl mb-3"></i>
              <p className="text-app-text-muted text-sm">Chưa có bài đăng nào</p>
              {user && (
                <button onClick={() => setShowNewPost(true)} className="mt-3 text-app-accent-primary text-xs cursor-pointer whitespace-nowrap">
                  Hãy là người đầu tiên đăng bài →
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {displayPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    liked={likedPosts.includes(post.id)}
                    onOpenComments={setOpenCommentsPostId}
                    onOpenDetail={(id) => {
                      const p = posts.find(x => x.id === id);
                      const slug = p ? communitySlug(id, p.title) : id;
                      navigate(`/community/${slug}`);
                    }}
                    onViewProfile={(userId) => navigate(`/member/${userId}`)}
                    onAISuggest={setAiSuggestPost}
                  />
                ))}
              </div>
              {/* Guest cutoff banner */}
              {isGuestCutoff && (
                <div className="mt-4 bg-gradient-to-r from-[app-accent-primary]/10 to-[#fb923c]/10 border border-app-accent-primary/20 rounded-2xl p-5 text-center">
                  <i className="ri-lock-line text-app-accent-primary text-2xl mb-2 block"></i>
                  <p className="text-white font-bold text-sm mb-1">Bạn đã xem {guestViewCount} bài miễn phí</p>
                  <p className="text-white/50 text-xs mb-3">Đăng ký thành viên để xem tất cả bài viết và tham gia thảo luận!</p>
                  <button onClick={() => navigate("/pricing")}
                    className="inline-flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors">
                    <i className="ri-user-add-line"></i>Đăng ký ngay
                  </button>
                </div>
              )}
              {/* Holiday/maintenance mode banner */}
              {commSettings.access_mode === "holiday" && (
                <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                  <i className="ri-gift-line text-app-accent-success text-xl mb-1 block"></i>
                  <p className="text-app-accent-success font-bold text-sm">{commSettings.mode_note || "🎉 Cộng đồng mở cửa tự do!"}</p>
                  <p className="text-app-text-secondary text-xs mt-1">Đăng bài không giới hạn trong thời gian sự kiện</p>
                </div>
              )}
              {commSettings.access_mode === "maintenance" && (
                <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-center">
                  <i className="ri-tools-line text-rose-400 text-xl mb-1 block"></i>
                  <p className="text-rose-400 font-bold text-sm">Cộng đồng đang bảo trì</p>
                  <p className="text-app-text-secondary text-xs mt-1">Vui lòng quay lại sau!</p>
                </div>
              )}
              <Pagination current={currentPage} total={totalPages} onChange={p => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Cộng đồng Hàn Quốc Ơi!</h3>
            <div className="space-y-3">
              {[
                { icon: "ri-group-line", label: "Thành viên", value: "10,247", color: "app-accent-primary" },
                { icon: "ri-article-line", label: "Bài đăng", value: posts.length.toString(), color: "#34d399" },
                { icon: "ri-fire-line", label: "Streak trung bình", value: "23 ngày", color: "#fb923c" },
                { icon: "ri-trophy-line", label: "Đậu EPS tháng này", value: "142 người", color: "#FFD700" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-app-text-muted text-[10px]">{s.label}</p>
                    <p className="text-white font-bold text-sm">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!user && (
            <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-lock-line text-app-accent-primary text-sm"></i>
                <p className="text-white font-semibold text-sm">Tham gia cộng đồng</p>
              </div>
              <p className="text-app-text-secondary text-xs leading-relaxed mb-3">Đăng nhập để đăng bài, bình luận và tương tác với cộng đồng học tiếng Hàn!</p>
            </div>
          )}

          <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-app-accent-primary/15">
                <i className="ri-fire-line text-app-accent-primary text-lg"></i>
              </div>
              <div>
                <p className="text-white font-bold text-base">{streak.count} ngày streak</p>
                <p className="text-app-text-secondary text-xs">Của bạn</p>
              </div>
            </div>
            <p className="text-app-text-secondary text-xs leading-relaxed">
              {streak.count >= 30 ? "Top 10% cộng đồng! Xuất sắc!" : streak.count >= 7 ? "Đang tiến bộ tốt — tiếp tục nhé!" : "Bắt đầu streak để leo bảng xếp hạng!"}
            </p>
          </div>

          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Chủ đề hot</h3>
            <div className="flex flex-wrap gap-2">
              {["EPS-TOPIK", "ngữ pháp", "từ vựng", "streak", "K-pop", "Hangul", "mẹo học", "TOPIK II", "kinh nghiệm", "thi thử"].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearch(tag)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-app-surface/50 text-app-text-secondary border border-app-border hover:border-app-accent-primary/20 hover:text-app-accent-primary/70 transition-colors cursor-pointer whitespace-nowrap"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Online Users & Activity Feed */}
          <OnlineUsersWidget />

          {/* FAQ Section — Schema.org FAQPage */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-app-accent-primary/15">
                <i className="ri-question-answer-line text-app-accent-primary text-xs"></i>
              </div>
              <h3 className="text-white font-semibold text-sm">Câu hỏi thường gặp</h3>
            </div>
            <div className="space-y-2">
              {FAQ_SCHEMA.mainEntity.map((faq, i) => (
                <FAQItem key={i} question={faq.name} answer={faq.acceptedAnswer.text} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {showNewPost && user && (
        <NewPostModal onClose={() => setShowNewPost(false)} onSubmit={handleNewPost} />
      )}

      {openCommentsPostId && (
        <CommentsPanel
          postId={openCommentsPostId}
          onClose={() => setOpenCommentsPostId(null)}
          currentUser={user ? { id: user.id } : null}
          profile={profile}
        />
      )}

      {aiSuggestPost && (
        <AISuggestionPanel post={aiSuggestPost} onClose={() => setAiSuggestPost(null)} />
      )}
    </DashboardLayout>
    </>
  );
}

