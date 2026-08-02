import { useEffect, useState } from 'react';

/**
 * Tracks which card is centered in a horizontal scroll-snap row (see
 * `.snap-row` in global.css) so a dot-pagination indicator can stay in
 * sync, and exposes `scrollTo(i)` so tapping a dot jumps to that card.
 * Assumes roughly-uniform card widths, which holds for every carousel in
 * this system (product grid, stat row) — good enough for a visual
 * indicator without needing per-card measurement.
 *
 * Usage:
 *   const rowRef = useRef(null);
 *   const { active, scrollTo } = useCarouselIndex(rowRef, items.length);
 *   <div ref={rowRef} className="snap-row">...</div>
 *   <CarouselDots count={items.length} active={active} onSelect={scrollTo} />
 */
export function useCarouselIndex(ref, count) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || count === 0) return undefined;

    const onScroll = () => {
      const cardWidth = el.scrollWidth / count;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActive(Math.min(count - 1, Math.max(0, idx)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [ref, count]);

  const scrollTo = (i) => {
    const el = ref.current;
    if (!el || count === 0) return;
    const cardWidth = el.scrollWidth / count;
    el.scrollTo({ left: cardWidth * i, behavior: 'smooth' });
  };

  return { active, scrollTo };
}
