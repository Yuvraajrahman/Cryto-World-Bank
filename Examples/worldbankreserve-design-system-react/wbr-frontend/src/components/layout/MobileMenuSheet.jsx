import Icon from '../ui/Icon';
import Button from '../ui/Button';
import LogoMark from '../ui/LogoMark';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

/**
 * The mobile primary-nav pattern for this app: a full-screen glass overlay
 * (not a bottom sheet — this is navigation, not a task, so it takes the
 * whole screen the way App Store / Safari nav overlays do) with large,
 * thumb-friendly Fraunces link rows and the primary CTA pinned above the
 * home-indicator safe area. Auto-unmounts its scroll lock on close.
 */
export default function MobileMenuSheet({ open, onClose, links, walletLabel, walletStatus, onConnect }) {
  useLockBodyScroll(open);

  return (
    <div className={`menu-sheet${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="menu-sheet-scrim" onClick={onClose} />
      <div className="menu-sheet-panel glass-elevated">
        <div className="menu-sheet-top">
          <a className="logo" href="/">
            <LogoMark />
            WorldBankReserve
          </a>
          <button type="button" className="icon-btn" aria-label="Close menu" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>

        <nav className="menu-sheet-links">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={onClose}>
              {link.label}
              <Icon name="chevronRight" size={16} />
            </a>
          ))}
        </nav>

        <div className="menu-sheet-foot">
          <Button variant="primary" block onClick={onConnect} disabled={walletStatus === 'connecting'}>
            {walletLabel}
          </Button>
          <p className="trust-strip">
            <span>Sepolia Testnet</span>
            <span className="dot" />
            <span>Slither &amp; Mythril Audited</span>
          </p>
        </div>
      </div>
    </div>
  );
}
