import { useState } from "react";

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  showSettingsLink?: boolean;
}

const ERROR_HINTS: { pattern: RegExp; hint: string }[] = [
  {
    pattern: /token|hợp lệ|hết hạn|401|403/i,
    hint: "Kiểm tra lại Apify Token trong trang Cài đặt.",
  },
  {
    pattern: /404|không tìm thấy actor/i,
    hint: "Actor ID có thể đã thay đổi. Liên hệ admin để cập nhật.",
  },
  {
    pattern: /429|giới hạn/i,
    hint: "Tài khoản Apify miễn phí có giới hạn request. Nâng cấp plan hoặc chờ reset.",
  },
  {
    pattern: /timeout|quá thời gian|vẫn đang chạy/i,
    hint: "Actor đang bận hoặc Melon/Naver phản hồi chậm. Thử lại sau 1-2 phút.",
  },
  {
    pattern: /trống|không tìm thấy câu hỏi/i,
    hint: "Thử từ khóa khác hoặc kiểm tra kết nối internet.",
  },
  {
    pattern: /mất kết nối|network/i,
    hint: "Kiểm tra kết nối internet và thử lại.",
  },
];

function getHint(message: string): string | null {
  for (const { pattern, hint } of ERROR_HINTS) {
    if (pattern.test(message)) return hint;
  }
  return null;
}

export default function ErrorAlert({ message, onDismiss, onRetry, showSettingsLink = true }: ErrorAlertProps) {
  const [expanded, setExpanded] = useState(false);
  const hint = getHint(message);

  // Split multiline messages for better display
  const lines = message.split("\n").filter(Boolean);
  const mainLine = lines[0];
  const extraLines = lines.slice(1);

  return (
    <div className="flex items-start gap-3 bg-red-500/8 border border-red-500/20 rounded-xl px-5 py-4 mb-5">
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
        <i className="ri-error-warning-fill text-red-400 text-base"></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-red-300 text-sm font-medium">Lỗi kết nối API</p>
        <p className="text-red-400/70 text-xs mt-1 leading-relaxed">{mainLine}</p>

        {extraLines.length > 0 && (
          <ul className="mt-1.5 space-y-0.5">
            {extraLines.map((line, i) => (
              <li key={i} className="text-red-400/50 text-[11px] leading-relaxed flex items-start gap-1.5">
                <i className="ri-arrow-right-s-line text-red-400/30 flex-shrink-0 mt-0.5"></i>
                {line.replace(/^→\s*/, "")}
              </li>
            ))}
          </ul>
        )}

        {hint && (
          <div className="flex items-start gap-2 mt-2.5 bg-amber-500/5 rounded-lg px-3 py-2">
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-lightbulb-line text-amber-400 text-xs"></i>
            </div>
            <p className="text-amber-400/80 text-xs leading-relaxed">{hint}</p>
          </div>
        )}

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 text-xs bg-red-500/15 hover:bg-red-500/25 text-red-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-red-500/20 whitespace-nowrap"
            >
              <i className="ri-refresh-line text-[11px]"></i>
              Thử lại
            </button>
          )}
          {showSettingsLink && (
            <a
              href="/settings"
              className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-300 transition-colors"
            >
              <i className="ri-settings-3-line text-[11px]"></i>
              Vào Cài đặt
            </a>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-white/50 transition-colors cursor-pointer"
          >
            <i className={`ri-${expanded ? "arrow-up" : "arrow-down"}-s-line text-[11px]`}></i>
            {expanded ? "Ẩn chi tiết" : "Xem chi tiết kỹ thuật"}
          </button>
        </div>

        {expanded && (
          <pre className="mt-2 text-[10px] text-app-text-muted bg-app-surface/50 rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap break-all">
            {message}
          </pre>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="w-5 h-5 flex items-center justify-center text-app-text-muted hover:text-white/50 transition-colors cursor-pointer flex-shrink-0"
        >
          <i className="ri-close-line text-sm"></i>
        </button>
      )}
    </div>
  );
}
