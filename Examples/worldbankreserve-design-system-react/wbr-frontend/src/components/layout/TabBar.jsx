import Icon from '../ui/Icon';

/**
 * NOT used on the public landing page — the marketing site uses the
 * floating pill Navbar + MobileMenuSheet instead. This is the pattern to
 * reach for once the authenticated app shell exists (Client Home
 * Dashboard, page 10 onward): a floating glass tab bar with a "liquid"
 * indicator pill that slides and settles under the active tab (spring
 * easing, see .tab-bar-indicator in global.css).
 *
 * Usage (inside an authenticated layout):
 *   const [active, setActive] = useState('home');
 *   <TabBar
 *     active={active}
 *     onChange={setActive}
 *     items={[
 *       { key: 'home', label: 'Home', icon: 'home' },
 *       { key: 'loans', label: 'Loans', icon: 'loan' },
 *       { key: 'passport', label: 'Passport', icon: 'passport' },
 *       { key: 'wallet', label: 'Wallet', icon: 'wallet' },
 *     ]}
 *   />
 */
export default function TabBar({ items, active, onChange }) {
  const activeIndex = Math.max(0, items.findIndex((i) => i.key === active));

  return (
    <nav className="tab-bar glass-elevated" aria-label="Primary">
      <div
        className="tab-bar-indicator"
        style={{ width: `calc(${100 / items.length}% - 4px)`, transform: `translateX(calc(${activeIndex * 100}% + ${activeIndex * 4}px))` }}
      />
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`tab-bar-item${item.key === active ? ' active' : ''}`}
          onClick={() => onChange(item.key)}
          aria-current={item.key === active ? 'page' : undefined}
        >
          <Icon name={item.icon} size={20} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
