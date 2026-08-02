import { useCallback, useRef } from 'react';
import { useHasHover } from './useMediaQuery';

/**
 * The signature "liquid glass" 3D tilt: a card leans toward the pointer on
 * a fine-pointer/hover-capable device (mouse, trackpad) and eases back to
 * flat on leave. Deliberately a no-op on touch devices — a tilt driven by
 * touch coordinates just feels like lag, not glass, and would fight with
 * scrolling. Mobile gets its own motion language instead: press-scale
 * feedback (`.glass-interactive:active`) and the scroll-reveal entrance.
 *
 * Usage:
 *   const tilt = useGlassTilt();
 *   <Glass {...tilt} className="product-card">...</Glass>
 *
 * Spreads onPointerMove/onPointerLeave — intentionally not a ref, so it
 * composes cleanly with the forwardRef already used by <Glass>.
 */
export function useGlassTilt({ max = 6 } = {}) {
  const hasHover = useHasHover();
  const frame = useRef(null);

  const onPointerMove = useCallback(
    (e) => {
      if (!hasHover) return;
      const el = e.currentTarget;
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(800px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * (max + 1)).toFixed(2)}deg) translateY(-2px)`;
      });
    },
    [hasHover, max]
  );

  const onPointerLeave = useCallback((e) => {
    if (frame.current) cancelAnimationFrame(frame.current);
    e.currentTarget.style.transform = '';
  }, []);

  if (!hasHover) return {};
  return { onPointerMove, onPointerLeave };
}
