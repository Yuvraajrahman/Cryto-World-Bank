import { useEffect, useState } from 'react';

/**
 * Thin wrapper around matchMedia for the rare cases where a component needs
 * to branch in JS instead of CSS (e.g. disabling a pointer-tilt effect on
 * touch devices, or swapping a full nav for a menu button). Prefer CSS media
 * queries for anything purely visual — reach for this hook only when the
 * *behavior*, not just the layout, needs to change.
 *
 * Usage:
 *   const isDesktop = useMediaQuery('(min-width: 1024px)');
 */
export function useMediaQuery(query) {
  const getMatch = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Matches the design.md breakpoint token for the desktop nav / tilt switchover. */
export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}

/** True only on devices that support real hover + a precise pointer (mouse/trackpad). */
export function useHasHover() {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}
