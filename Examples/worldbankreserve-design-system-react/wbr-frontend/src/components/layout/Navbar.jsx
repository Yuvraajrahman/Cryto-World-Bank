import { useEffect, useState } from 'react';
import Glass from '../ui/Glass';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import LogoMark from '../ui/LogoMark';
import MobileMenuSheet from './MobileMenuSheet';
import { useWalletConnection } from '../../hooks/useWalletConnection';
import { useToast } from '../ui/Toast';

const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'Tiers', href: '#tiers' },
  { label: 'Transparency', href: '#transparency' },
  { label: 'About', href: '#about' },
];

/**
 * Shared across every public page. Mobile shows only the logo + a menu
 * button (opens <MobileMenuSheet>); the full link row + CTA only appear
 * at the 1024px desktop breakpoint (see .nav-links / .nav-cta in
 * global.css) — there simply isn't room for five tap targets in a
 * thumb-friendly floating pill at phone widths.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { status, address, connect } = useWalletConnection();
  const toast = useToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Menu sheet, if open, should close itself once navigation happens.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onHashChange = () => setMenuOpen(false);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [menuOpen]);

  const handleConnect = async () => {
    const result = await connect();
    if (result?.ok) toast.show('Wallet connected', { variant: 'success' });
  };

  const label =
    status === 'connected' && address
      ? `${address.slice(0, 6)}…${address.slice(-4)}`
      : status === 'connecting'
      ? 'Connecting…'
      : 'Connect Wallet';

  return (
    <>
      <nav className="navbar">
        <Glass as="div" className={`nav-inner${scrolled ? ' scrolled' : ''}`}>
          <a className="logo" href="/">
            <LogoMark />
            WorldBankReserve
          </a>

          <div className="nav-links">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>

          <Button
            className="nav-cta"
            variant="primary"
            size="sm"
            showArrow={false}
            onClick={handleConnect}
            disabled={status === 'connecting'}
          >
            {label}
          </Button>

          <button
            type="button"
            className="icon-btn nav-menu-btn"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={18} />
          </button>
        </Glass>
      </nav>

      <MobileMenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={NAV_LINKS}
        walletLabel={label}
        walletStatus={status}
        onConnect={handleConnect}
      />
    </>
  );
}
