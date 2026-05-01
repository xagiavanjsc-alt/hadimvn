import { ReactNode, useRef, useState, useCallback, useEffect } from "react";

interface VirtualListProps {
  items: unknown[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  renderItem: (item: unknown, index: number) => ReactNode;
  className?: string;
  emptyState?: ReactNode;
}

/**
 * Fixed-height virtual list — only renders visible items + overscan buffer.
 * Use for long lists in admin pages to reduce DOM nodes.
 */
export default function VirtualList({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
  renderItem,
  className = "",
  emptyState,
}: VirtualListProps) {
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

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);
  const offsetY = startIndex * itemHeight;

  const visibleItems = items.slice(startIndex, endIndex + 1);

  if (items.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div
      ref={containerRef}
      style={{ height: `${containerHeight}px`, overflowY: "auto" }}
      className={className}
    >
      <div style={{ height: `${totalHeight}px`, position: "relative" }}>
        <div style={{ position: "absolute", top: `${offsetY}px`, left: 0, right: 0 }}>
          <div className="space-y-0">
            {visibleItems.map((item, i) => (
              <div key={startIndex + i} style={{ height: `${itemHeight}px` }}>
                {renderItem(item, startIndex + i)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
