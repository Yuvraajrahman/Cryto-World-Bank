import { useEffect } from 'react';

/**
 * Locks background scroll while a full-screen overlay (mobile menu sheet,
 * bottom sheet, modal) is open — otherwise the page behind scrolls along
 * with the overlay's own content on touch devices, which breaks the
 * "native app" feel this whole system is going for.
 *
 * Usage:
 *   useLockBodyScroll(isMenuOpen);
 */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [locked]);
}
