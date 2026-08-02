import { useEffect, useState } from 'react';
import Button from '../ui/Button';

/**
 * Mobile/tablet only (hidden at 1024px+ via .sticky-cta in global.css,
 * since desktop already keeps the CTA live in the navbar). Watches
 * `targetRef` — pass the hero's ref — and appears once it scrolls out of
 * view, so the primary action stays in thumb reach without the person
 * needing to scroll back up. This is the kind of native-app touch that
 * makes a mobile web page stop feeling like a shrunk desktop site.
 */
export default function StickyMobileCTA({ targetRef, label = 'Connect Wallet', onClick, href }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = targetRef.current;
    if (!node) return undefined;
    const io = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0 });
    io.observe(node);
    return () => io.disconnect();
  }, [targetRef]);

  return (
    <div className={`sticky-cta${visible ? ' visible' : ''}`} aria-hidden={!visible}>
      <Button variant="primary" href={href} onClick={onClick} showArrow={false}>
        {label}
      </Button>
    </div>
  );
}
