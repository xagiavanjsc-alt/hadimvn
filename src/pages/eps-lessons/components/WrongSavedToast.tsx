import { useState } from "react";

interface WrongSavedToastProps {
  count: number;
  onDone: () => void;
}

export default function WrongSavedToast({ count, onDone }: WrongSavedToastProps) {
  useState(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  });
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl bg-[#1a1f2e] border border-red-500/30 text-white text-sm font-semibold shadow-xl flex items-center gap-3"
      style={{ animation: "slideUpFade 0.35s ease" }}
    >
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/15 flex-shrink-0">
        <i className="ri-bookmark-line text-red-400 text-base"></i>
      </div>
      <div>
        <p className="text-white font-semibold">Đã lưu {count} từ cần ôn lại</p>
        <p className="text-white/40 text-xs">Vào &quot;Ôn tập sai theo chủ đề&quot; để ôn</p>
      </div>
      <button onClick={onDone} className="ml-2 text-white/30 hover:text-white/60 cursor-pointer">
        <i className="ri-close-line"></i>
      </button>
    </div>
  );
}
