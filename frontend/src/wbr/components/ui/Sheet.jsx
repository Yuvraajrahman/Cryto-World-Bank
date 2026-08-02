import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

/**
 * Generic bottom sheet — the mobile-native pattern for anything that would
 * be a modal on desktop: confirm a transaction, filter a list, review a
 * form step. Not used on the public landing page itself, but every future
 * page that needs a modal (loan confirmation, KYC document picker, filter
 * controls on the approval queue) should reach for this rather than a
 * centered desktop-style dialog, to keep the interaction language
 * consistent with the rest of the mobile-first system.
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *   <Sheet open={open} onClose={() => setOpen(false)} title="Confirm transfer">
 *     ...
 *   </Sheet>
 */
export default function Sheet({ open, onClose, title, children }) {
  useLockBodyScroll(open);

  return (
    <>
      <div className={`sheet-backdrop${open ? ' open' : ''}`} onClick={onClose} aria-hidden="true" />
      <div
        className={`sheet-panel glass-elevated${open ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sheet-handle" />
        {title && <h3 className="sheet-title">{title}</h3>}
        {children}
      </div>
    </>
  );
}
