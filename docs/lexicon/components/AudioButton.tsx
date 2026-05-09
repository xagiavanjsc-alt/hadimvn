import { useKoreanAudio } from "@/hooks/useKoreanAudio";

interface AudioButtonProps {
  text: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "solid" | "outline";
  label?: string;
  slowMode?: boolean;
}

export default function AudioButton({
  text,
  size = "md",
  variant = "outline",
  label,
  slowMode = false,
}: AudioButtonProps) {
  const { speak, speakSlow, isPlaying, isSupported } = useKoreanAudio();

  if (!isSupported) return null;

  const handleClick = () => {
    if (slowMode) {
      speakSlow(text);
    } else {
      speak(text);
    }
  };

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-3.5 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
  };

  const iconSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const variantClasses = {
    ghost: "bg-transparent hover:bg-white/8 text-white/60 hover:text-white",
    solid: "bg-[#D4AF37] hover:bg-[#C9A42E] text-[#1A1E23]",
    outline: "bg-white/8 hover:bg-white/15 border border-white/15 text-white/80",
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPlaying}
      className={`
        flex items-center rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${isPlaying ? "opacity-70 scale-95" : ""}
      `}
      title={slowMode ? "Phát âm chậm" : "Nghe phát âm chuẩn Seoul"}
    >
      <div className={`w-4 h-4 flex items-center justify-center shrink-0 ${iconSize[size]}`}>
        {isPlaying ? (
          <i className="ri-loader-4-line animate-spin"></i>
        ) : slowMode ? (
          <i className="ri-speed-line"></i>
        ) : (
          <i className="ri-volume-up-line"></i>
        )}
      </div>
      {label && <span>{label}</span>}
    </button>
  );
}
