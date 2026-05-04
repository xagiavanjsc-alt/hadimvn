import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useCommunitySettings } from "@/hooks/useCommunitySettings";
import { supabase, resolveStoragePaths, getStorageUrl, isVipActive } from "@/lib/supabase";
import OnlineUsersWidget from "./components/OnlineUsersWidget";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast, ToastContainer } from "@/components/common/ToastNotification";
import { communitySlug } from "@/lib/slugify";
import AuthModal from "@/components/feature/AuthModal";

// --- SEO Component for Community Page -----------------------------------------------
function CommunitySEO({ category, search }: { category: Category; search: string }) {
  useEffect(() => {
    const catConfig = CATEGORY_CONFIG[category];
    let title = "C?ng d?ng Hàn Qu?c Oi!";
    let description = "H?i dáp, chia s? kinh nghi?m và cùng nhau ti?n b?";

    if (category !== "all") {
      title = `${catConfig.label} - ${title}`;
      description = `Xem t?t c? bài vi?t ${catConfig.label} trong c?ng d?ng Hàn Qu?c Oi!`;
    }

    if (search.trim()) {
      title = `K?t qu? tìm ki?m: "${search}" - ${title}`;
      description = `Tìm ki?m "${search}" trong c?ng d?ng Hàn Qu?c Oi!`;
    }

    document.title = title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:url', window.location.href);

    // Update Twitter Card tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:card', 'summary');

    return () => {
      // Cleanup if needed
    };
  }, [category, search]);

  return null;
}

function updateMetaTag(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(property.startsWith('twitter:') ? 'name' : 'property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

// --- Shared image utilities ---------------------------------------------------
function convertToWebP(file: File, maxWidth: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context not available')); return; }
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
        if (blob) resolve(blob); else reject(new Error('Canvas toBlob failed'));
      }, 'image/webp', 0.8);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function uploadImageToCommunityStorage(file: File): Promise<string> {
  const webpData = await convertToWebP(file, 800);
  const fileName = `${Date.now()}_${file.name.split('.')[0]}.webp`;
  const { error } = await supabase.storage
    .from('community-images')
    .upload(fileName, webpData, { contentType: 'image/webp', upsert: false });
  if (error) throw error;
  return getStorageUrl(`community-images/${fileName}`);
}

// --- Rich Text Editor Component (WordPress-like, no external deps) ------------
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
  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState("");

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

  // Handle paste - strip inline styles & spans d? tránh l?i H2 b? wrap span/style
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const plain = e.clipboardData.getData('text/plain');
    if (html) {
      // Strip: style attrs, class attrs, <span>, <font>, <meta>, fragments
      let cleaned = html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<meta[^>]*>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<(\w+)([^>]*)>/gi, (_m, tag, attrs) => {
          // Ch? gi? href cho <a> và src/alt cho <img>
          if (tag.toLowerCase() === 'a') {
            const href = attrs.match(/href\s*=\s*"([^"]*)"/i);
            return `<a${href ? ` href="${href[1]}"` : ''}>`;
          }
          if (tag.toLowerCase() === 'img') {
            const src = attrs.match(/src\s*=\s*"([^"]*)"/i);
            const alt = attrs.match(/alt\s*=\s*"([^"]*)"/i);
            return `<img${src ? ` src="${src[1]}"` : ''}${alt ? ` alt="${alt[1]}"` : ''}/>`;
          }
          return `<${tag}>`;
        })
        // B? <span> </span> wrap (vô nghia sau khi strip attrs)
        .replace(/<\/?span>/gi, '')
        .replace(/<\/?font>/gi, '');
      document.execCommand('insertHTML', false, cleaned);
    } else if (plain) {
      document.execCommand('insertText', false, plain);
    }
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
      alert('L?i chèn ?nh');
    }
    e.target.value = ''; // reset to allow same file again
  };

  const TOOLBAR = [
    { group: [
      { type: 'select', key: 'heading', options: [
        { label: 'Van b?n', cmd: 'formatBlock', val: 'P' },
        { label: 'Tiêu d? 1', cmd: 'formatBlock', val: 'H1' },
        { label: 'Tiêu d? 2', cmd: 'formatBlock', val: 'H2' },
        { label: 'Tiêu d? 3', cmd: 'formatBlock', val: 'H3' },
        { label: 'Trích d?n', cmd: 'formatBlock', val: 'BLOCKQUOTE' },
      ]},
    ]},
    { group: [
      { cmd: 'bold', icon: 'ri-bold', tip: 'In d?m (Ctrl+B)' },
      { cmd: 'italic', icon: 'ri-italic', tip: 'In nghiêng (Ctrl+I)' },
      { cmd: 'underline', icon: 'ri-underline', tip: 'G?ch chân (Ctrl+U)' },
      { cmd: 'strikeThrough', icon: 'ri-strikethrough', tip: 'G?ch ngang' },
    ]},
    { group: [
      { type: 'color', cmd: 'foreColor', icon: 'ri-font-color', tip: 'Màu ch?' },
      { type: 'color', cmd: 'hiliteColor', icon: 'ri-mark-pen-line', tip: 'Màu n?n' },
    ]},
    { group: [
      { cmd: 'insertUnorderedList', icon: 'ri-list-unordered', tip: 'Danh sách' },
      { cmd: 'insertOrderedList', icon: 'ri-list-ordered', tip: 'Danh sách s?' },
    ]},
    { group: [
      { cmd: 'justifyLeft', icon: 'ri-align-left', tip: 'Can trái' },
      { cmd: 'justifyCenter', icon: 'ri-align-center', tip: 'Can gi?a' },
      { cmd: 'justifyRight', icon: 'ri-align-right', tip: 'Can ph?i' },
      { cmd: 'justifyFull', icon: 'ri-align-justify', tip: 'Can d?u' },
    ]},
    { group: [
      { cmd: 'createLink', icon: 'ri-link', tip: 'Chèn link' },
      { cmd: 'unlink', icon: 'ri-link-unlink', tip: 'Xóa link' },
      { cmd: 'insertImage', icon: 'ri-image-add-line', tip: 'Chèn ?nh' },
    ]},
    { group: [
      { cmd: 'undo', icon: 'ri-arrow-go-back-line', tip: 'Hoàn tác (Ctrl+Z)' },
      { cmd: 'redo', icon: 'ri-arrow-go-forward-line', tip: 'Làm l?i (Ctrl+Y)' },
      { cmd: 'removeFormat', icon: 'ri-format-clear', tip: 'Xóa d?nh d?ng' },
    ]},
  ] as const;

  const handleToolbar = (item: any) => {
    if (item.cmd === 'createLink') {
      const url = prompt('Nh?p URL:');
      if (url) exec('createLink', url);
    } else if (item.cmd === 'insertImage') {
      fileInputRef.current?.click();
    } else {
      exec(item.cmd, item.val);
    }
  };

  // Toggle gi?a WYSIWYG <-> HTML source
  const toggleHtmlMode = () => {
    if (!htmlMode) {
      // Chuy?n WYSIWYG ? HTML: l?y innerHTML hi?n t?i
      setHtmlDraft(editorRef.current?.innerHTML || value || "");
      setHtmlMode(true);
    } else {
      // Chuy?n HTML ? WYSIWYG: ghi HTML vào editor
      if (editorRef.current) editorRef.current.innerHTML = htmlDraft;
      onChangeRef.current(htmlDraft);
      setHtmlMode(false);
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
                    <option value="" disabled>Ð?nh d?ng</option>
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
        {/* HTML source toggle - end of toolbar */}
        <div className="flex items-center gap-0.5 ml-auto">
          <div className="w-px h-5 bg-app-border mx-1" />
          <button
            type="button"
            onClick={toggleHtmlMode}
            title={htmlMode ? "Quay l?i ch? d? so?n th?o" : "Xem/s?a mã HTML (nhu WordPress)"}
            className={`h-7 px-2 flex items-center gap-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${htmlMode ? "bg-app-accent-primary/15 text-app-accent-primary border border-app-accent-primary/30" : "text-white/50 hover:text-white hover:bg-white/10"}`}
          >
            <i className="ri-code-s-slash-line text-sm"></i>
            <span>HTML</span>
          </button>
        </div>
      </div>

      {/* Hidden file input for image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInsertImage}
        className="hidden"
      />

      {/* Editable area - WYSIWYG mode */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleChange}
        onKeyUp={handleChange}
        onBlur={() => { setFocused(false); handleChange(); }}
        onFocus={() => setFocused(true)}
        onPaste={handlePaste}
        data-placeholder={placeholder || "Vi?t n?i dung bài dang..."}
        className={`rich-editor-content min-h-[300px] p-4 text-white/85 text-sm leading-relaxed outline-none ${htmlMode ? "hidden" : ""}`}
        style={{ wordBreak: 'break-word' }}
      />

      {/* HTML source mode */}
      {htmlMode && (
        <textarea
          value={htmlDraft}
          onChange={(e) => {
            setHtmlDraft(e.target.value);
            onChangeRef.current(e.target.value);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder='Dán ho?c ch?nh s?a mã HTML, ví d?: <h2>Tiêu d?</h2><p>N?i dung <strong>d?m</strong></p>'
          className="w-full min-h-[300px] p-4 bg-transparent text-emerald-300/90 text-[13px] font-mono leading-relaxed outline-none resize-y"
          spellCheck={false}
        />
      )}
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

// --- Schema.org FAQPage structured data -------------------------------------
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "name": "C?ng d?ng h?c ti?ng Hàn - Hàn Qu?c Oi!",
  "description": "C?ng d?ng h?i dáp, chia s? kinh nghi?m h?c ti?ng Hàn, EPS-TOPIK và cu?c s?ng t?i Hàn Qu?c",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Làm th? nào d? h?c ti?ng Hàn hi?u qu? cho k? thi EPS-TOPIK?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ð? h?c ti?ng Hàn hi?u qu? cho EPS-TOPIK, b?n nên: h?c t? v?ng theo ch? d? (an toàn lao d?ng, giao ti?p co b?n, pháp lu?t lao d?ng), luy?n nghe hàng ngày, làm bài thi th? thu?ng xuyên và duy trì streak h?c t?p liên t?c."
      }
    },
    {
      "@type": "Question",
      "name": "EPS-TOPIK g?m nh?ng ph?n thi nào?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "EPS-TOPIK g?m 2 ph?n: Nghe hi?u (25 câu, 25 phút) và Ð?c hi?u (25 câu, 25 phút). T?ng 50 câu, th?i gian 50 phút. Ði?m d?u t?i thi?u là 80/200 di?m."
      }
    },
    {
      "@type": "Question",
      "name": "Ngu?i lao d?ng nu?c ngoài ? Hàn Qu?c có nh?ng quy?n l?i gì?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ngu?i lao d?ng nu?c ngoài t?i Hàn Qu?c du?c hu?ng: luong t?i thi?u theo quy d?nh, 4 lo?i b?o hi?m b?t bu?c (y t?, luong huu, vi?c làm, tai n?n lao d?ng), ngh? phép có luong sau 1 nam làm vi?c, và du?c b?o v? theo Lu?t Tiêu chu?n Lao d?ng."
      }
    },
    {
      "@type": "Question",
      "name": "Khi b? tai n?n lao d?ng ? Hàn Qu?c c?n làm gì?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Khi b? tai n?n lao d?ng: 1) Báo ngay cho c?p trên và g?i 119 n?u c?n c?p c?u, 2) Ð?n b?nh vi?n di?u tr?, 3) Báo cáo lên ?????? (Công doàn phúc l?i lao d?ng) d? du?c hu?ng b?o hi?m tai n?n lao d?ng. Ngu?i nu?c ngoài cung du?c b?o v? d?y d?."
      }
    },
    {
      "@type": "Question",
      "name": "Làm th? nào d? duy trì streak h?c t?p hàng ngày?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ð? duy trì streak h?c t?p: d?t gi? h?c c? d?nh m?i ngày, h?c ít nh?t 10-15 phút/ngày, s? d?ng tính nang nh?c nh?, h?c flashcard t? v?ng EPS, và tham gia c?ng d?ng d? du?c d?ng viên t? các thành viên khác."
      }
    },
    {
      "@type": "Question",
      "name": "S? di?n tho?i kh?n c?p quan tr?ng ? Hàn Qu?c là gì?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Các s? di?n tho?i kh?n c?p quan tr?ng t?i Hàn Qu?c: 112 (C?nh sát), 119 (C?u h?a và C?p c?u), 1345 (Trung tâm h? tr? ngu?i nu?c ngoài - h? tr? ti?ng Vi?t 24/7), 1350 (Ðu?ng dây lao d?ng - tu v?n quy?n l?i lao d?ng)."
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
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: number;
  comments_count: number;
  is_pinned: boolean;
  exam_score: number | null;
  streak_days: number | null;
  created_at: string;
  status?: "pending" | "approved" | "rejected" | null;
  rating_average?: number;
  rating_count?: number;
  quiz?: QuizData | null;
  quiz_total_answers?: number;
  quiz_correct_answers?: number;
}

export interface QuizOption {
  id: number;
  text: string;
  is_correct: boolean;
}

export interface QuizData {
  question: string;
  image_url?: string;
  options: QuizOption[];
  explanation?: string;
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
  all: { label: "T?t c?", icon: "ri-apps-line", color: "app-accent-primary" },
  question: { label: "H?i dáp", icon: "ri-question-answer-line", color: "#60a5fa" },
  share: { label: "Chia s?", icon: "ri-share-line", color: "#34d399" },
  result: { label: "K?t qu? thi", icon: "ri-trophy-line", color: "#FFD700" },
  tip: { label: "M?o h?c", icon: "ri-lightbulb-line", color: "#fb923c" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "V?a xong";
  if (h < 24) return `${h} gi? tru?c`;
  return `${Math.floor(h / 24)} ngày tru?c`;
}

// --- Comment Item ------------------------------------------------------------
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
                <i className="ri-time-line mr-0.5"></i>Ðang ch? duy?t
              </span>
            )}
            {comment.status === "rejected" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/25">
                <i className="ri-close-circle-line mr-0.5"></i>B? t? ch?i
              </span>
            )}
          </div>
          <div
            className="text-white/60 text-xs leading-relaxed comment-content"
            dangerouslySetInnerHTML={{ __html: resolveStoragePaths(comment.content) }}
          />
          <div className="flex items-center gap-3 mt-1.5">
            {currentUser && depth < 2 && (
              <button
                onClick={() => onReply(comment.id, comment.author_name)}
                className="text-[10px] text-app-text-muted hover:text-app-accent-primary/70 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-reply-line mr-1"></i>Tr? l?i
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

// --- AI Suggestion Panel -----------------------------------------------------
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
            "EPS-TOPIK ??? ?? 25??, ?? 25??? ???? ???. ?? ??? ???? ?? ????!\n(K? thi EPS-TOPIK g?m 25 câu nghe và 25 câu d?c. Ði?u quan tr?ng là h?c d?u d?n m?i ngày!)",
            "?? EPS-TOPIK ?? ????. ?? ????! ???!\n(Tôi cung dang chu?n b? EPS-TOPIK. Cùng h?c nhé! C? lên!)",
            "?? ??? ?????? ???? ??????. ??? 20?? ??? ???.\n(H?c t? v?ng b?ng flashcard r?t hi?u qu?. M?i ngày h?c 20 t? là t?t.)",
          ];
        } else if (content.includes("??") || content.includes("ng? pháp") || content.includes("grammar")) {
          generated = [
            "??? ??? ??? ???? ??? ???? ???. ?? ??? ??????\n(Ng? pháp ti?ng Hàn khó lúc d?u nhung s? ti?n b? n?u luy?n t?p d?u d?n. B?n th?y ng? pháp nào khó?)",
            "?? ??? ? ??? ?? ??? ??? ??. ???? ??? ? ???!\n(Khi h?c ng? pháp, d?c nhi?u câu ví d? r?t h?u ích. Nên h?c thu?c qua câu ví d?!)",
            "?? ????? ??? ?? ??? ??? ????. ??? ?????\n(Tôi h?c ng? pháp qua video YouTube. B?n có mu?n tôi gi?i thi?u không?)",
          ];
        } else if (content.includes("??") || content.includes("phát âm") || content.includes("pronunciation")) {
          generated = [
            "?? ??? ?? ?? ?? ?? ?? ????. ??? ??? ?? ????!\n(Luy?n phát âm quan tr?ng là d?c to m?i ngày. Hãy b?t chu?c phát âm c?a ngu?i b?n ng?!)",
            "??? ?? ? ? ??? ??? ????? ???? ??. ?? ?????!\n(Trong ti?ng Hàn, âm ? du?c nói là khó v?i ngu?i Vi?t. Hãy luy?n t?p nhi?u!)",
            "TTS ?? ???? ??? ???? ?? ?? ??????.\n(Dùng app TTS d? nghe và b?t chu?c phát âm r?t hi?u qu?.)",
          ];
        } else if (isQuestion) {
          generated = [
            "?? ?????! ?? ?? ??? ????. ?? ??? ??!\n(Câu h?i hay d?y! Tôi cung t?ng ban khoan di?u này. Cùng gi?i quy?t nhé!)",
            "? ??? ?? ?? ????. ???? ???? ?? ?? ? ???.\n(Ph?n này tôi cung dang h?c. H?i giáo viên cung là ý hay d?y.)",
            "??? ?? ???! ??? ?? ???? ?? ?? ?? ?????.\n(C? lên h?c ti?ng Hàn! H?i nh?ng gì không bi?t là cách nhanh nh?t.)",
          ];
        } else {
          generated = [
            "?? ????! ??? ????? ??? ????. ?? ? ??? ?????!\n(Th?t tuy?t v?i! Hình ?nh b?n h?c cham ch? th?t dáng ngu?ng m?. Tôi cung ph?i c? g?ng hon!)",
            "????! ???? ?? ???! ?? ??? ????!\n(Chúc m?ng! Ti?p t?c c? lên! Cùng nhau h?c cham ch? nhé!)",
            "?? ?? ????! ?? ?????. ??? ?? ???!\n(C?m on thông tin hay! Tôi s? tham kh?o. R?t h?u ích!)",
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
              <h3 className="text-white font-bold text-sm">AI G?i ý câu tr? l?i</h3>
              <p className="text-app-text-muted text-[10px]">D?a trên n?i dung bài dang</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary hover:text-white/70 cursor-pointer">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {/* Post preview */}
          <div className="bg-app-surface/50 border border-app-border rounded-xl p-3 mb-4">
            <p className="text-app-text-secondary text-[10px] tracking-normal mb-1">Bài dang</p>
            <p className="text-white/70 text-xs font-medium line-clamp-2">{post.title}</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>
              <p className="text-app-text-muted text-xs">AI dang phân tích và t?o g?i ý...</p>
            </div>
          ) : (
            <>
              <p className="text-app-text-muted text-xs mb-3">Ch?n m?t g?i ý d? copy và dùng làm bình lu?n:</p>
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
                      {copied === i ? "Ðã copy" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-app-text-muted text-[10px] text-center pt-2">
                <i className="ri-information-line mr-1"></i>
                G?i ý du?c t?o t? d?ng — hãy ch?nh s?a cho phù h?p tru?c khi dang
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Comments Panel ----------------------------------------------------------
function CommentsPanel({
  postId,
  onClose,
  currentUser,
  profile,
  showToast,
}: {
  postId: string;
  onClose: () => void;
  currentUser: { id: string } | null;
  profile: { display_name: string } | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    // RLS policy t? d?ng l?c: approved + of-author + admin. Query all fields d?
    // hi?n th? badge "Ðang ch? duy?t" cho comment c?a chính mình.
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
    // Insert v?i status='pending' (trigger auto-approve n?u admin/mod)
    const { error } = await supabase.from("community_comments").insert({
      post_id: postId, // postId ? dây là UUID t? post.id (không ph?i slug)
      parent_id: replyTo?.id || null,
      user_id: currentUser.id,
      author_name: profile?.display_name || "H?c viên",
      author_level: "H?c viên",
      content: text.trim(),
      status: "pending",
    });
    if (!error) {
      setText("");
      setReplyTo(null);
      await fetchComments();
      showToast("Bình lu?n dã g?i — dang ch? qu?n tr? viên duy?t.", "success");
    } else {
      showToast(`L?i g?i bình lu?n: ${error.message}`, "error");
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
            Bình lu?n <span className="text-app-text-muted font-normal">({totalCount})</span>
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
              <p className="text-app-text-muted text-sm">Chua có bình lu?n nào</p>
              <p className="text-app-text-muted text-xs mt-1">Hãy là ngu?i d?u tiên bình lu?n!</p>
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
              <span className="text-app-accent-primary/70 text-xs">Ðang tr? l?i <strong>{replyTo.author}</strong></span>
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
                placeholder={replyTo ? `Tr? l?i ${replyTo.author}...` : "Vi?t bình lu?n..."}
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
              <p className="text-app-text-muted text-xs">Ðang nh?p d? bình lu?n</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Quiz Card (trong post) -------------------------------------------------
function QuizCard({ post, currentUser, profile }: { post: Post; currentUser: { id: string } | null; profile: { display_name?: string } | null }) {
  const quiz = post.quiz;
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAnswers, setTotalAnswers] = useState(post.quiz_total_answers || 0);
  const [correctAnswers, setCorrectAnswers] = useState(post.quiz_correct_answers || 0);
  const [showAnswer, setShowAnswer] = useState(false);

  const isAuthor = currentUser && post.user_id === currentUser.id;
  const correctOption = quiz?.options?.find(o => o.is_correct);

  // Fetch existing answer
  useEffect(() => {
    if (!currentUser || !quiz) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("community_quiz_answers")
        .select("selected_option, is_correct")
        .eq("post_id", post.id)
        .eq("user_id", currentUser.id)
        .maybeSingle();
      if (data) {
        setSelected(data.selected_option);
        setSubmitted(true);
      }
      setLoading(false);
    })();
  }, [post.id, currentUser?.id, quiz]);

  if (!quiz) return null;

  const handleSelect = async (optionId: number) => {
    if (!currentUser) {
      setError("Vui lòng dang nh?p d? tr? l?i");
      return;
    }
    if (isAuthor) {
      setError("B?n không th? tr? l?i câu h?i c?a chính mình");
      return;
    }
    if (submitted || submitting) return;

    setSubmitting(true);
    setError(null);

    const option = quiz.options.find(o => o.id === optionId);
    const isCorrect = option?.is_correct || false;

    const { error: insertError } = await supabase
      .from("community_quiz_answers")
      .insert({
        post_id: post.id,
        user_id: currentUser.id,
        selected_option: optionId,
        is_correct: isCorrect,
      });

    if (insertError) {
      setError("L?i: " + insertError.message);
      setSubmitting(false);
      return;
    }

    setSelected(optionId);
    setSubmitted(true);
    setTotalAnswers(v => v + 1);
    if (isCorrect) setCorrectAnswers(v => v + 1);

    // Auto-post comment: tang engagement + SEO cho bài vi?t
    const letter = String.fromCharCode(65 + (quiz.options.findIndex(o => o.id === optionId)));
    const correct = quiz.options.find(o => o.is_correct);
    const commentText = isCorrect
      ? `? Mình ch?n <strong>${letter}. ${option?.text}</strong> và dã tr? l?i dúng! ??`
      : `? Mình ch?n <strong>${letter}. ${option?.text}</strong>, dáp án dúng là <strong>${correct?.text}</strong>.`;

    await supabase.from("community_comments").insert({
      post_id: post.id,
      parent_id: null,
      user_id: currentUser.id,
      author_name: profile?.display_name || "H?c viên",
      author_level: "H?c viên",
      content: commentText,
      status: "approved", // auto-approve quiz answer comments
    });

    setSubmitting(false);
  };

  const correctPct = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
  const selectedOption = quiz.options.find(o => o.id === selected);
  const isSelectedCorrect = selectedOption?.is_correct || false;

  return (
    <div className="mt-4 bg-gradient-to-br from-app-accent-primary/5 to-[#60a5fa]/5 border border-app-accent-primary/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <i className="ri-question-line text-app-accent-primary"></i>
        <span className="text-app-accent-primary text-xs font-bold uppercase tracking-wide">Câu h?i tr?c nghi?m</span>
        {totalAnswers > 0 && (
          <span className="ml-auto text-app-text-muted text-[10px]">
            <i className="ri-group-line mr-0.5"></i>
            {correctAnswers}/{totalAnswers} dúng ({correctPct}%)
          </span>
        )}
      </div>

      {quiz.image_url && (
        <img src={quiz.image_url} alt="" className="w-full max-h-64 object-contain rounded-lg mb-3 border border-app-border" />
      )}

      {loading ? (
        <p className="text-app-text-muted text-xs">Ðang t?i...</p>
      ) : (
        <div className="space-y-2">
          {quiz.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selected === opt.id;
            const showCorrect = submitted && showAnswer && opt.is_correct;
            const showWrong = submitted && showAnswer && isSelected && !opt.is_correct;

            return (
              <button
                key={opt.id}
                onClick={(e) => { e.stopPropagation(); handleSelect(opt.id); }}
                disabled={submitted || submitting || isAuthor || !currentUser}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                  showCorrect
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : showWrong
                    ? "bg-red-500/15 border-red-500/40 text-red-300"
                    : isSelected
                    ? "bg-app-accent-primary/15 border-app-accent-primary/40 text-white"
                    : "bg-app-card/30 border-app-border text-white/70 hover:border-white/20 cursor-pointer"
                } ${submitted || submitting || isAuthor || !currentUser ? "cursor-not-allowed" : ""}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  showCorrect ? "bg-emerald-500/30 text-emerald-200" :
                  showWrong ? "bg-red-500/30 text-red-200" :
                  "bg-app-card/50 text-app-text-secondary"
                }`}>
                  {showCorrect ? <i className="ri-check-line"></i> : showWrong ? <i className="ri-close-line"></i> : letter}
                </span>
                <span className="text-sm flex-1">{opt.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs mt-2"><i className="ri-error-warning-line mr-1"></i>{error}</p>
      )}

      {submitted && !showAnswer && (
        <button
          onClick={() => setShowAnswer(true)}
          className="mt-3 text-xs text-app-accent-primary hover:underline cursor-pointer"
        >
          <i className="ri-eye-line mr-1"></i>Xem dáp án
        </button>
      )}

      {submitted && showAnswer && (
        <>
          <div className={`mt-3 p-3 rounded-lg border ${
            isSelectedCorrect
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}>
            {isSelectedCorrect ? (
              <p className="text-emerald-400 text-sm font-semibold">
                <i className="ri-trophy-line mr-1"></i>Chính xác! B?n du?c +1 XP ??
              </p>
            ) : (
              <p className="text-red-400 text-sm font-semibold mb-1">
                <i className="ri-close-circle-line mr-1"></i>Sai r?i. Ðáp án dúng: <strong>{correctOption?.text}</strong>
              </p>
            )}
            {quiz.explanation && (
              <div className="text-white/70 text-xs mt-2 leading-relaxed post-content-preview">
                <div className="flex items-center gap-1 mb-1 text-[#FFD700]">
                  <i className="ri-lightbulb-line"></i>
                  <span className="font-semibold">Gi?i thích:</span>
                </div>
                <div dangerouslySetInnerHTML={{ __html: resolveStoragePaths(quiz.explanation) }} />
              </div>
            )}
          </div>
          <button
            onClick={() => setShowAnswer(false)}
            className="mt-2 text-xs text-app-text-muted hover:text-white cursor-pointer"
          >
            <i className="ri-arrow-up-line mr-1"></i>Thu g?n
          </button>
        </>
      )}

      {!currentUser && (
        <p className="text-app-text-muted text-[11px] mt-2 text-center">
          <i className="ri-lock-line mr-1"></i>Ðang nh?p d? tham gia tr? l?i
        </p>
      )}
      {isAuthor && (
        <p className="text-app-text-muted text-[11px] mt-2 text-center">
          <i className="ri-information-line mr-1"></i>B?n là tác gi? — không th? t? tr? l?i
        </p>
      )}
    </div>
  );
}

// --- Post Card ---------------------------------------------------------------
function PostCard({
  post,
  onLike,
  liked,
  onOpenComments,
  onOpenDetail,
  onViewProfile,
  onAISuggest,
  onEdit,
  onDelete,
  currentUser,
  currentProfile,
}: {
  post: Post;
  onLike: (id: string) => void;
  liked: boolean;
  onOpenComments: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onViewProfile: (userId: string) => void;
  onAISuggest: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
  currentUser: { id: string } | null;
  currentProfile: { display_name?: string } | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG.share;
  const isAuthor = currentUser && post.user_id === currentUser.id;

  return (
    <div className={`bg-app-bg border rounded-2xl p-5 transition-all hover:border-app-border ${post.is_pinned ? "border-app-accent-primary/20" : post.status === "pending" ? "border-amber-500/30" : "border-app-border"}`}>
      {post.status === "pending" && (
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[11px] font-semibold mb-3 px-2.5 py-1.5 rounded-lg">
          <i className="ri-time-line"></i>
          Bài c?a b?n dang ch? qu?n tr? viên duy?t — ch? b?n nhìn th?y.
        </div>
      )}
      {post.status === "rejected" && (
        <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/25 text-red-400 text-[11px] font-semibold mb-3 px-2.5 py-1.5 rounded-lg">
          <i className="ri-close-circle-line"></i>
          Bài này dã b? t? ch?i.
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
      <div
        className={`post-content-preview text-white/55 text-xs leading-relaxed ${!expanded ? "max-h-[4.5rem] overflow-hidden" : ""}`}
        dangerouslySetInnerHTML={{ __html: resolveStoragePaths(post.content) }}
      />
      <style>{`
        .post-content-preview img { max-width: 100%; height: auto; border-radius: 8px; margin: 6px 0; display: block; }
        .post-content-preview h1, .post-content-preview h2, .post-content-preview h3 { font-weight: 700; color: rgba(255,255,255,0.85); margin: 0.3em 0; }
        .post-content-preview h1 { font-size: 1rem; }
        .post-content-preview h2 { font-size: 0.95rem; }
        .post-content-preview h3 { font-size: 0.9rem; }
        .post-content-preview p { margin: 0.3em 0; }
        .post-content-preview strong, .post-content-preview b { color: rgba(255,255,255,0.85); font-weight: 700; }
        .post-content-preview a { color: #d4b43a; }
      `}</style>
      {post.content.length > 150 && (
        <button onClick={() => setExpanded(v => !v)} className="text-app-accent-primary/60 text-[10px] mt-1 cursor-pointer hover:text-app-accent-primary whitespace-nowrap">
          {expanded ? "Thu g?n" : "Xem thêm"}
        </button>
      )}

      <div className="flex flex-wrap gap-1.5 mt-3">
        {post.tags.map(tag => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-app-surface/50 text-app-text-muted border border-app-border">#{tag}</span>
        ))}
      </div>

      {/* Quiz (n?u post là câu h?i tr?c nghi?m) */}
      {post.quiz && <QuizCard post={post} currentUser={currentUser} profile={currentProfile} />}

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
          {post.comments_count} bình lu?n
        </button>
        {post.rating_count > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-app-text-muted">
            <i className="ri-star-fill text-[#FFD700]"></i>
            <span>{post.rating_average?.toFixed(1) || "0.0"}</span>
            <span className="text-[10px]">({post.rating_count})</span>
          </div>
        )}
        {post.user_id && (
          <button
            onClick={(e) => { e.stopPropagation(); onViewProfile(post.user_id!); }}
            className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-[#a78bfa]/70 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-user-line"></i>H? so
          </button>
        )}
        <button
          onClick={() => onAISuggest(post)}
          className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-app-accent-primary/70 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-robot-line"></i>AI g?i ý
        </button>
        {isAuthor && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(post); }}
              className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-app-accent-primary/70 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-edit-line"></i>S?a
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(post); }}
              className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-red-400/70 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-delete-bin-line"></i>Xóa
            </button>
          </>
        )}
        <button
          onClick={() => onOpenDetail(post.id)}
          className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-app-accent-primary/70 transition-colors cursor-pointer whitespace-nowrap ml-auto"
        >
          <i className="ri-external-link-line"></i>Xem chi ti?t
        </button>
      </div>
    </div>
  );
}

// --- New Post Modal ----------------------------------------------------------
// --- Rich Text Toolbar -------------------------------------------------------
function RichTextToolbar({ onFormat }: { onFormat: (tag: string) => void }) {
  const tools = [
    { icon: "ri-bold", tag: "bold", title: "In d?m" },
    { icon: "ri-italic", tag: "italic", title: "In nghiêng" },
    { icon: "ri-list-unordered", tag: "list", title: "Danh sách" },
    { icon: "ri-double-quotes-l", tag: "quote", title: "Trích d?n" },
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

function EditPostModal({ post, onClose, showToast }: { post: Post; onClose: () => void; user: { id: string }; showToast: (message: string, type?: "success" | "error" | "info") => void }) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [category, setCategory] = useState(post.category);
  const [tags, setTags] = useState(post.tags.join(", "));
  const [submitting, setSubmitting] = useState(false);
  // Quiz state - load from existing post.quiz
  const [isQuiz, setIsQuiz] = useState<boolean>(!!post.quiz);
  const [quizOptions, setQuizOptions] = useState<QuizOption[]>(
    post.quiz?.options || [
      { id: 1, text: "", is_correct: true },
      { id: 2, text: "", is_correct: false },
    ]
  );
  const [quizExplanation, setQuizExplanation] = useState<string>(post.quiz?.explanation || "");

  const handleSubmit = async () => {
    if (!title.trim() || submitting) return;
    if (!isQuiz && isRichEmpty(content)) {
      showToast("Vui lòng nh?p n?i dung", "error");
      return;
    }

    // Validate quiz
    let quizData: QuizData | null = null;
    if (isQuiz) {
      const filled = quizOptions.filter(o => o.text.trim());
      if (filled.length < 2) {
        showToast("Tr?c nghi?m c?n ít nh?t 2 dáp án", "error");
        return;
      }
      if (!filled.some(o => o.is_correct)) {
        showToast("C?n ch?n ít nh?t 1 dáp án dúng", "error");
        return;
      }
      quizData = {
        question: title,
        options: filled.map((o, idx) => ({ ...o, id: idx + 1 })),
        explanation: quizExplanation.trim() || undefined,
      };
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("community_posts")
      .update({
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        quiz: quizData,
        status: "pending", // Set l?i status pending d? admin ki?m duy?t l?i
      })
      .eq("id", post.id);

    setSubmitting(false);
    if (error) {
      showToast(`L?i c?p nh?t bài vi?t: ${error.message}`, "error");
    } else {
      showToast("Bài vi?t dã c?p nh?t - dang ch? qu?n tr? viên duy?t l?i.", "success");
      onClose();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-app-bg border border-app-border rounded-t-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border flex-shrink-0">
          <h3 className="text-white font-bold text-sm">Ch?nh s?a bài vi?t</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary hover:text-white/70 cursor-pointer">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="text-white/70 text-xs font-semibold mb-2 block">Tiêu d?</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-app-card/50 border border-app-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-app-accent-primary/30"
              placeholder="Nh?p tiêu d?..."
            />
          </div>
          <div>
            <label className="text-white/70 text-xs font-semibold mb-2 block">Danh m?c</label>
            <div className="flex gap-2 flex-wrap">
              {["question", "share", "result", "tip"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${category === cat ? "bg-app-accent-primary text-app-bg" : "bg-app-card/50 text-app-text-secondary hover:bg-app-card/70"}`}
                >
                  {cat === "question" ? "H?i dáp" : cat === "share" ? "Chia s?" : cat === "result" ? "K?t qu? thi" : "M?o h?c"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-white/70 text-xs font-semibold mb-2 block">N?i dung</label>
            <RichEditor
              value={content}
              onChange={setContent}
              placeholder="Ch?nh s?a n?i dung bài vi?t..."
              onImageUpload={uploadImageToCommunityStorage}
            />
          </div>
          <div>
            <label className="text-white/70 text-xs font-semibold mb-2 block">Tags (ngan cách b?ng d?u ph?y)</label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full px-4 py-2.5 bg-app-card/50 border border-app-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-app-accent-primary/30"
              placeholder="ví d?: eps, topik, ng? pháp"
            />
          </div>

          {/* Quiz section */}
          <div className="border border-app-border rounded-xl p-4 bg-app-card/20">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isQuiz}
                onChange={e => setIsQuiz(e.target.checked)}
                className="w-4 h-4 accent-app-accent-primary cursor-pointer"
              />
              <span className="text-white text-sm font-medium">
                <i className="ri-question-line mr-1 text-app-accent-primary"></i>
                Bài tr?c nghi?m
              </span>
            </label>
            <p className="text-app-text-muted text-[11px] mt-1 ml-6">
              Luu ý: n?u s?a dáp án, lu?t tr? l?i cu v?n gi?. N?u admin t? ch?i bài dã s?a, XP c?a b?n và ngu?i tr? l?i dúng s? b? tr? t? d?ng.
            </p>

            {isQuiz && (
              <div className="mt-4 space-y-3">
                <p className="text-app-text-secondary text-xs">
                  <i className="ri-information-line mr-1"></i>
                  Tiêu d? bài vi?t = câu h?i.
                </p>

                {quizOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuizOptions(opts => opts.map((o, i) => ({ ...o, is_correct: i === idx })))}
                      title="Ch?n dây là dáp án dúng"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${opt.is_correct ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400" : "bg-app-card/50 border border-app-border text-app-text-muted hover:text-white/60"}`}
                    >
                      <i className={opt.is_correct ? "ri-check-line" : "ri-circle-line"}></i>
                    </button>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={e => setQuizOptions(opts => opts.map((o, i) => i === idx ? { ...o, text: e.target.value } : o))}
                      placeholder={`Ðáp án ${String.fromCharCode(65 + idx)}...`}
                      maxLength={200}
                      className="flex-1 bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary/40 placeholder-white/20"
                    />
                    {quizOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setQuizOptions(opts => opts.filter((_, i) => i !== idx))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-app-text-muted hover:text-red-400 cursor-pointer"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    )}
                  </div>
                ))}

                {quizOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setQuizOptions(opts => [...opts, { id: opts.length + 1, text: "", is_correct: false }])}
                    className="w-full py-2 rounded-lg border border-dashed border-app-border text-app-text-secondary text-xs hover:text-white/60 hover:border-white/20 cursor-pointer"
                  >
                    <i className="ri-add-line mr-1"></i>Thêm dáp án (t?i da 4)
                  </button>
                )}

                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Gi?i thích dáp án dúng (tùy ch?n)</label>
                  <RichEditor
                    value={quizExplanation}
                    onChange={setQuizExplanation}
                    placeholder="Gi?i thích chi ti?t: in d?m, màu ch?, ?nh, link, dán HTML... d?u du?c"
                    onImageUpload={uploadImageToCommunityStorage}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-app-border flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-app-card/50 text-white/70 text-sm font-medium cursor-pointer hover:bg-app-card/70 transition-colors"
          >
            H?y
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
            className="flex-1 py-2.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-sm font-bold cursor-pointer whitespace-nowrap transition-colors disabled:opacity-50"
          >
            {submitting ? "Ðang luu..." : "Luu thay d?i"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewPostModal({
  onClose,
  onSubmit,
  showToast,
}: {
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; category: string; imageUrl?: string; quiz?: QuizData | null }) => Promise<void>;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("share");
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Quiz state
  const [isQuiz, setIsQuiz] = useState(false);
  const [quizOptions, setQuizOptions] = useState<QuizOption[]>([
    { id: 1, text: "", is_correct: true },
    { id: 2, text: "", is_correct: false },
  ]);
  const [quizExplanation, setQuizExplanation] = useState("");

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
      alert('L?i khi upload ?nh');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    console.log('[NewPost] handleSubmit called', { title, contentLen: content.length, isEmpty: isRichEmpty(content) });
    if (!title.trim()) {
      showToast('Vui lòng nh?p tiêu d?', 'error');
      return;
    }
    if (!isQuiz && isRichEmpty(content)) {
      showToast('Vui lòng nh?p n?i dung', 'error');
      return;
    }

    // Validate quiz n?u b?t ch? d? tr?c nghi?m
    let quizData: QuizData | null = null;
    if (isQuiz) {
      const filledOptions = quizOptions.filter(o => o.text.trim());
      if (filledOptions.length < 2) {
        showToast('Tr?c nghi?m c?n ít nh?t 2 dáp án', 'error');
        return;
      }
      if (!filledOptions.some(o => o.is_correct)) {
        showToast('C?n ch?n ít nh?t 1 dáp án dúng', 'error');
        return;
      }
      quizData = {
        question: title,
        image_url: imageUrl ? undefined : undefined,
        options: filledOptions.map((o, idx) => ({ ...o, id: idx + 1 })),
        explanation: quizExplanation.trim() || undefined,
      };
    }

    setSubmitting(true);
    try {
      await onSubmit({ title, content, category, imageUrl: imageUrl || undefined, quiz: quizData });
      onClose();
    } catch (err) {
      console.error('Submit error:', err);
      showToast('L?i dang bài: ' + (err instanceof Error ? err.message : 'unknown'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border sticky top-0 bg-app-bg z-10">
          <h3 className="text-white font-bold text-base">T?o bài dang m?i</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary hover:text-white/70 cursor-pointer">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-2">Lo?i bài dang</label>
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
            <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Tiêu d?</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tiêu d? bài dang..." maxLength={100}
              className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-app-accent-primary/40 placeholder-white/20" />
          </div>

          {/* Rich text content */}
          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-1.5">N?i dung</label>
            <RichEditor
              value={content}
              onChange={setContent}
              placeholder="Chia s? kinh nghi?m, d?t câu h?i ho?c khoe thành tích..."
              onImageUpload={uploadImageToCommunityStorage}
            />
          </div>

          {/* Image upload */}
          <div>
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-app-text-secondary hover:text-white/70 text-xs cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-image-add-line text-sm"></i>
              Thêm ?nh (t? d?ng chuy?n WebP, resize v? 800px)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {uploadingImage && (
              <div className="mt-2 text-app-text-muted text-xs">Ðang upload ?nh...</div>
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

          {/* Quiz toggle */}
          <div className="border border-app-border rounded-xl p-4 bg-app-card/20">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isQuiz}
                onChange={e => setIsQuiz(e.target.checked)}
                className="w-4 h-4 accent-app-accent-primary cursor-pointer"
              />
              <span className="text-white text-sm font-medium">
                <i className="ri-question-line mr-1 text-app-accent-primary"></i>
                Bi?n bài vi?t này thành câu h?i tr?c nghi?m
              </span>
            </label>
            <p className="text-app-text-muted text-[11px] mt-1 ml-6">
              Thành viên tr? l?i dúng s? du?c +1 XP. M?i ngu?i ch? du?c tr? l?i 1 l?n.
            </p>

            {isQuiz && (
              <div className="mt-4 space-y-3">
                <p className="text-app-text-secondary text-xs">
                  <i className="ri-information-line mr-1"></i>
                  Tiêu d? bài vi?t s? là câu h?i. Nh?p các dáp án du?i dây:
                </p>

                {quizOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuizOptions(opts => opts.map((o, i) => ({ ...o, is_correct: i === idx })))}
                      title="Ch?n dây là dáp án dúng"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${opt.is_correct ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400" : "bg-app-card/50 border border-app-border text-app-text-muted hover:text-white/60"}`}
                    >
                      <i className={opt.is_correct ? "ri-check-line" : "ri-circle-line"}></i>
                    </button>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={e => setQuizOptions(opts => opts.map((o, i) => i === idx ? { ...o, text: e.target.value } : o))}
                      placeholder={`Ðáp án ${String.fromCharCode(65 + idx)}...`}
                      maxLength={200}
                      className="flex-1 bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary/40 placeholder-white/20"
                    />
                    {quizOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setQuizOptions(opts => opts.filter((_, i) => i !== idx))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-app-text-muted hover:text-red-400 cursor-pointer"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    )}
                  </div>
                ))}

                {quizOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setQuizOptions(opts => [...opts, { id: opts.length + 1, text: "", is_correct: false }])}
                    className="w-full py-2 rounded-lg border border-dashed border-app-border text-app-text-secondary text-xs hover:text-white/60 hover:border-white/20 cursor-pointer"
                  >
                    <i className="ri-add-line mr-1"></i>Thêm dáp án (t?i da 4)
                  </button>
                )}

                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Gi?i thích dáp án dúng (tùy ch?n)</label>
                  <RichEditor
                    value={quizExplanation}
                    onChange={setQuizExplanation}
                    placeholder="Gi?i thích chi ti?t: in d?m, màu ch?, ?nh, link, HTML... d?u du?c"
                    onImageUpload={uploadImageToCommunityStorage}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-app-border text-white/50 text-sm cursor-pointer whitespace-nowrap hover:bg-app-card/50">H?y</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
              {submitting ? "Ðang dang..." : "Ðang bài"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const POSTS_PER_PAGE = 10;

// --- FAQ Item -----------------------------------------------------------------
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

// --- Pagination ---------------------------------------------------------------
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

// --- Main Page ---------------------------------------------------------------
export default function CommunityPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category>("all");
  const [sortBy, setSortBy] = useState<SortBy>("latest");
  const [search, setSearch] = useState("");
  const [likedPosts, setLikedPosts] = useLocalStorage<string[]>("kts_liked_posts", []);
  const [showNewPost, setShowNewPost] = useState(false);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [aiSuggestPost, setAiSuggestPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [streak] = useLocalStorage<{ count: number }>("kts_streak", { count: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, profile } = useAuth();
  const { settings: commSettings } = useCommunitySettings();
  const { showToast, toasts, removeToast } = useToast();

  // Reset page khi filter thay d?i
  useEffect(() => { setCurrentPage(1); }, [category, sortBy, search]);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    // RLS policy dã l?c: approved + own-pending + admin-all. Không c?n
    // client-side filter n?a — ch? c?n SELECT *.
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data as Post[]);
    setLoadingPosts(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Sync likes t? DB cho user dã dang nh?p (tránh conflict v?i localStorage)
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("community_likes")
        .select("post_id")
        .eq("user_id", user.id);
      if (data) setLikedPosts(data.map((r: { post_id: string }) => r.post_id));
    })();
  }, [user?.id, setLikedPosts]);

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

  // Guest view limit: ch? gi?i h?n khách, thành viên dang nh?p xem full
  const isGuestLimited = !user && commSettings.access_control_enabled && commSettings.access_mode === "normal";
  const guestViewCount = isGuestLimited ? commSettings.guest_view_limit : Infinity;
  const displayPosts = isGuestLimited ? pagedPosts.slice(0, guestViewCount) : pagedPosts;
  const isGuestCutoff = isGuestLimited && pagedPosts.length > guestViewCount;

  const handleDeletePost = async (post: Post) => {
    if (!user) return;
    if (!confirm(`Xác nh?n xóa bài vi?t "${post.title}"? Hành d?ng này không th? hoàn tác.`)) return;

    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", post.id)
      .eq("user_id", user.id); // RLS double-check: ch? tác gi? du?c xóa

    if (error) {
      showToast(`L?i xóa bài: ${error.message}`, "error");
    } else {
      setPosts(prev => prev.filter(p => p.id !== post.id));
      showToast("Ðã xóa bài vi?t.", "success");
    }
  };

  const handleLike = async (id: string) => {
    if (!user) {
      showToast("Vui lòng dang nh?p d? thích bài vi?t", "error");
      return;
    }
    const alreadyLiked = likedPosts.includes(id);
    // Optimistic update
    setLikedPosts(prev => alreadyLiked ? prev.filter(x => x !== id) : [...prev, id]);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: Math.max(0, p.likes + (alreadyLiked ? -1 : 1)) } : p));

    // Trigger `trg_update_post_likes_count` s? t? c?p nh?t community_posts.likes
    if (alreadyLiked) {
      const { error } = await supabase.from("community_likes").delete().eq("user_id", user.id).eq("post_id", id);
      if (error) {
        // Rollback on error
        setLikedPosts(prev => [...prev, id]);
        setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
        showToast("L?i b? thích: " + error.message, "error");
      }
    } else {
      const { error } = await supabase.from("community_likes").insert({ user_id: user.id, post_id: id });
      if (error && !error.message.includes("duplicate")) {
        // Rollback
        setLikedPosts(prev => prev.filter(x => x !== id));
        setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: Math.max(0, p.likes - 1) } : p));
        showToast("L?i thích: " + error.message, "error");
      }
    }
  };

  const handleNewPost = async (data: { title: string; content: string; category: string; imageUrl?: string; quiz?: QuizData | null }) => {
    if (!user || !profile) return;

    // Ki?m tra ch? d? b?o trì
    if (commSettings.access_mode === "maintenance") {
      showToast("C?ng d?ng dang b?o trì, vui lòng quay l?i sau!", "error");
      return;
    }

    // Ki?m tra gi?i h?n dang bài/ngày (ch? áp d?ng ? ch? d? normal)
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
          showToast(`B?n ch? có th? dang t?i da ${limit} bài/ngày. Nâng c?p VIP d? không gi?i h?n!`, "error");
          return;
        }
      }
    }

    // Store relative path in DB (not full URL) for VPS migration later
    // Format: {{storage:community-images/xxx.webp}} — converted to full URL on render
    const contentWithImage = data.imageUrl
      ? `${data.content}\n\n<img src="{{storage:${data.imageUrl}}}" alt="?nh" style="max-width:100%;border-radius:12px" />`
      : data.content;

    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      author_name: profile.display_name || "H?c viên",
      author_level: "H?c viên",
      title: data.title,
      content: contentWithImage,
      category: data.category,
      tags: [],
      status: "pending",
      quiz: data.quiz || null,
    });

    if (error) {
      console.error('[handleNewPost] Insert error:', error);
      throw new Error(error.message);
    }
    await fetchPosts();
    showToast("Bài dang dã g?i — dang ch? qu?n tr? viên duy?t. B?n có th? xem bài c?a mình ? m?c \"Ðang ch? duy?t\".", "success");
  };

  return (
    <>
    <CommunitySEO category={category} search={search} />
    <CommunityFAQSchema />
    <ToastContainer toasts={toasts} removeToast={removeToast} />
    <DashboardLayout
      title="C?ng d?ng Hàn Qu?c Oi!"
      subtitle="H?i dáp, chia s? kinh nghi?m và cùng nhau ti?n b?"
      actions={
        user ? (
          <button
            onClick={() => setShowNewPost(true)}
            className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-add-line"></i>Ðang bài m?i
          </button>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-user-add-line"></i>Ðang ký/Ðang nh?p
          </button>
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
                placeholder="Tìm ki?m bài dang..."
                className="w-full bg-app-bg border border-app-border rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary/30 placeholder-white/20"
              />
            </div>
            <div className="flex items-center gap-1 bg-app-surface/50 border border-app-border rounded-lg p-1">
              {([["latest", "M?i nh?t"], ["popular", "Ph? bi?n"], ["comments", "Bình lu?n"]] as [SortBy, string][]).map(([s, label]) => (
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
              <p className="text-app-text-muted text-sm">Chua có bài dang nào</p>
              {user && (
                <button onClick={() => setShowNewPost(true)} className="mt-3 text-app-accent-primary text-xs cursor-pointer whitespace-nowrap">
                  Hãy là ngu?i d?u tiên dang bài ?
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
                    onEdit={(post) => setEditingPost(post)}
                    onDelete={handleDeletePost}
                    currentUser={user ? { id: user.id } : null}
                    currentProfile={profile}
                  />
                ))}
              </div>
              {/* Guest cutoff banner */}
              {isGuestCutoff && (
                <div className="mt-4 bg-gradient-to-r from-[app-accent-primary]/10 to-[#fb923c]/10 border border-app-accent-primary/20 rounded-2xl p-5 text-center">
                  <i className="ri-lock-line text-app-accent-primary text-2xl mb-2 block"></i>
                  <p className="text-white font-bold text-sm mb-1">B?n dã xem {guestViewCount} bài mi?n phí</p>
                  <p className="text-white/50 text-xs mb-3">Ðang ký thành viên d? xem t?t c? bài vi?t và tham gia th?o lu?n!</p>
                  <button onClick={() => setAuthModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors">
                    <i className="ri-user-add-line"></i>Ðang ký ngay
                  </button>
                </div>
              )}
              {/* Holiday/maintenance mode banner */}
              {commSettings.access_mode === "holiday" && (
                <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                  <i className="ri-gift-line text-app-accent-success text-xl mb-1 block"></i>
                  <p className="text-app-accent-success font-bold text-sm">{commSettings.mode_note || "?? C?ng d?ng m? c?a t? do!"}</p>
                  <p className="text-app-text-secondary text-xs mt-1">Ðang bài không gi?i h?n trong th?i gian s? ki?n</p>
                </div>
              )}
              {commSettings.access_mode === "maintenance" && (
                <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-center">
                  <i className="ri-tools-line text-rose-400 text-xl mb-1 block"></i>
                  <p className="text-rose-400 font-bold text-sm">C?ng d?ng dang b?o trì</p>
                  <p className="text-app-text-secondary text-xs mt-1">Vui lòng quay l?i sau!</p>
                </div>
              )}
              <Pagination current={currentPage} total={totalPages} onChange={p => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">C?ng d?ng Hàn Qu?c Oi!</h3>
            <div className="space-y-3">
              {[
                { icon: "ri-group-line", label: "Thành viên", value: "10,247", color: "app-accent-primary" },
                { icon: "ri-article-line", label: "Bài dang", value: posts.length.toString(), color: "#34d399" },
                { icon: "ri-fire-line", label: "Streak trung bình", value: "23 ngày", color: "#fb923c" },
                { icon: "ri-trophy-line", label: "Ð?u EPS tháng này", value: "142 ngu?i", color: "#FFD700" },
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
                <p className="text-white font-semibold text-sm">Tham gia c?ng d?ng</p>
              </div>
              <p className="text-app-text-secondary text-xs leading-relaxed mb-3">Ðang nh?p d? dang bài, bình lu?n và tuong tác v?i c?ng d?ng h?c ti?ng Hàn!</p>
            </div>
          )}

          <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-app-accent-primary/15">
                <i className="ri-fire-line text-app-accent-primary text-lg"></i>
              </div>
              <div>
                <p className="text-white font-bold text-base">{streak.count} ngày streak</p>
                <p className="text-app-text-secondary text-xs">C?a b?n</p>
              </div>
            </div>
            <p className="text-app-text-secondary text-xs leading-relaxed">
              {streak.count >= 30 ? "Top 10% c?ng d?ng! Xu?t s?c!" : streak.count >= 7 ? "Ðang ti?n b? t?t — ti?p t?c nhé!" : "B?t d?u streak d? leo b?ng x?p h?ng!"}
            </p>
          </div>

          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Ch? d? hot</h3>
            <div className="flex flex-wrap gap-2">
              {["EPS-TOPIK", "ng? pháp", "t? v?ng", "streak", "K-pop", "Hangul", "m?o h?c", "TOPIK II", "kinh nghi?m", "thi th?"].map(tag => (
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
              <h3 className="text-white font-semibold text-sm">Câu h?i thu?ng g?p</h3>
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
        <NewPostModal onClose={() => setShowNewPost(false)} onSubmit={handleNewPost} showToast={showToast} />
      )}

      {editingPost && user && (
        <EditPostModal post={editingPost} onClose={() => setEditingPost(null)} user={user} showToast={showToast} />
      )}

      {openCommentsPostId && (
        <CommentsPanel
          postId={openCommentsPostId}
          onClose={() => setOpenCommentsPostId(null)}
          currentUser={user ? { id: user.id } : null}
          profile={profile}
          showToast={showToast}
        />
      )}

      {aiSuggestPost && (
        <AISuggestionPanel post={aiSuggestPost} onClose={() => setAiSuggestPost(null)} />
      )}

      {authModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} />
      )}
    </DashboardLayout>
    </>
  );
}

