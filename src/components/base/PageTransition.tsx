import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * PageTransition v3 — KHÔNG fade-out (tránh màn đen).
 * Chỉ fade-in nhẹ khi vào trang mới.
 * Content render ngay lập tức, không bị block.
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [key, setKey] = useState(0);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === prevPathRef.current) return;
    prevPathRef.current = location.pathname;
    // Trigger re-mount để chạy animation fade-in
    setKey(k => k + 1);
  }, [location.pathname]);

  return (
    <div
      key={key}
      style={{
        animation: "pageFadeIn 0.18s ease-out forwards",
        opacity: 1,
        pointerEvents: "auto",
      }}
    >
      {children}
    </div>
  );
}
