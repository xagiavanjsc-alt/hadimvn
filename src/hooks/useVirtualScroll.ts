import { useState, useRef, useCallback, useEffect } from "react";

interface UseVirtualScrollOptions {
  itemCount: number;
  itemHeight: number;       // px height per item (fixed)
  containerHeight: number;  // px height of scroll container
  overscan?: number;        // extra items to render above/below viewport
}

interface VirtualScrollResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  offsetY: number;
}

/**
 * Simple fixed-height virtual scroll hook.
 * Renders only the items visible in the viewport + overscan buffer.
 */
export function useVirtualScroll({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5,
}: UseVirtualScrollOptions): VirtualScrollResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const totalHeight = itemCount * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + overscan * 2);
  const offsetY = startIndex * itemHeight;

  return { containerRef, totalHeight, startIndex, endIndex, offsetY };
}
