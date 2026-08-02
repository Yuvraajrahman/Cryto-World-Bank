import { Link } from "react-router-dom";
import Icon from "../ui/Icon";
import Button from "../ui/Button";
import LogoMark from "../ui/LogoMark";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";

function MenuLink({ href, children, onClick }) {
  if (href.startsWith("/") && !href.includes("#")) {
    return (
      <Link to={href} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  );
}

export default function MobileMenuSheet({
  open,
  onClose,
  links,
  walletLabel,
  walletStatus,
  onConnect,
}) {
  useLockBodyScroll(open);

  return (
    <div className={`menu-sheet${open ? " open" : ""}`} aria-hidden={!open}>
      <div className="menu-sheet-scrim" onClick={onClose} />
      <div className="menu-sheet-panel glass-elevated" role="dialog" aria-modal="true">
        <div className="menu-sheet-top">
          <Link className="logo" to="/" onClick={onClose}>
            <LogoMark />
            Crypto World Bank
          </Link>
          <button type="button" className="icon-btn" aria-label="Close menu" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>

        <nav className="menu-sheet-links">
          {links.map((link) => (
            <MenuLink key={link.href + link.label} href={link.href} onClick={onClose}>
              {link.label}
              <Icon name="chevronRight" size={16} />
            </MenuLink>
          ))}
        </nav>

        <div className="menu-sheet-foot">
          <Button as={Link} to="/login" variant="primary" block onClick={onClose}>
            Open an account
          </Button>
          <Button
            variant="ghost"
            block
            showArrow={false}
            type="button"
            onClick={onConnect}
            disabled={walletStatus === "connecting"}
            style={{ marginTop: 10 }}
          >
            {walletLabel}
          </Button>
          <p className="trust-strip" style={{ marginTop: 18 }}>
            <span>Sepolia testnet</span>
            <span className="dot" />
            <span>Independent contract audits</span>
          </p>
        </div>
      </div>
    </div>
  );
}
