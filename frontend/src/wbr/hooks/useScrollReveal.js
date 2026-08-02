import { useEffect, useRef, useState } from 'react';

/**
 * Attaches an IntersectionObserver-based fade/slide-in reveal to the
 * returned ref. Respects prefers-reduced-motion automatically.
 *
 * Reused across every section on every page — not landing-page-specific.
 * Pairs with the `.reveal` / `.reveal.visible` classes in global.css.
 *
 * Usage:
 *   const { ref, className, style } = useScrollReveal({ delay: 120 });
 *   <div ref={ref} className={`my-card ${className}`} style={style}>...</div>
 */
export function useScrollReveal({ threshold = 0.15, delay = 0 } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return {
    ref,
    className: `reveal${visible ? ' visible' : ''}`,
    style: { transitionDelay: `${delay}ms` },
  };
}
