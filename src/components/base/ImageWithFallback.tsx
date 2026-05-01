import { useState, useCallback } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  caption?: string;
  showPlaceholder?: boolean;
  placeholderText?: string;
}

/**
 * ImageWithFallback — Hiển thị ảnh với fallback tự động
 * - Nếu ảnh từ VPS (img.hanquocoi.vn) lỗi → fallback về placeholder
 * - Hỗ trợ lazy loading
 * - Hiển thị skeleton khi đang tải
 */
export default function ImageWithFallback({
  src,
  alt,
  className = "",
  style,
  fallbackSrc,
  caption,
  showPlaceholder = true,
  placeholderText,
}: ImageWithFallbackProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = useCallback(() => setStatus("loaded"), []);

  const handleError = useCallback(() => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setStatus("loading");
    } else {
      setStatus("error");
    }
  }, [fallbackSrc, currentSrc]);

  if (status === "error" && showPlaceholder) {
    return (
      <div className={`flex flex-col items-center justify-center bg-white/3 border border-white/8 rounded-xl ${className}`} style={style}>
        <i className="ri-image-line text-white/20 text-3xl mb-2"></i>
        <p className="text-white/25 text-xs text-center px-3">
          {placeholderText || "Ảnh minh họa chưa có"}
        </p>
        {caption && <p className="text-white/15 text-[10px] mt-1 italic">{caption}</p>}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Skeleton loading */}
      {status === "loading" && (
        <div className={`absolute inset-0 bg-white/5 animate-pulse rounded-xl ${className}`} style={style} />
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${status === "loading" ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        style={style}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
      />
      {caption && status === "loaded" && (
        <div className="px-3 py-1.5 bg-white/3 border-t border-white/5 rounded-b-xl">
          <p className="text-white/30 text-[10px] italic">{caption}</p>
        </div>
      )}
    </div>
  );
}
