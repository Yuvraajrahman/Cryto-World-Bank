import Glass from './Glass';
import { useScrollReveal } from '../../hooks/useScrollReveal';

/**
 * A single glass stat tile (big Fraunces numeral + mono label).
 * Class names are `wbr-stat*` so they never collide with legacy Tailwind
 * `.stat` / `.stat-label` in `styles/globals.css` (those force dark ink cards).
 */
export default function StatCard({ label, value, hint, delay = 0, className = '' }) {
  const { ref, className: revealClass, style } = useScrollReveal({ delay });
  const raw = value == null ? '—' : String(value).trim();
  const unitMatch =
    raw.match(/^([\d.,]+)\s*(%|ETH|USDC|USD)$/i) ||
    raw.match(/^(.*?)\s+(ETH|USDC|USD)$/i);
  const main = unitMatch ? unitMatch[1] : raw;
  const unit = unitMatch ? unitMatch[2] : null;

  return (
    <Glass ref={ref} className={`wbr-stat ${revealClass} ${className}`.trim()} style={style}>
      <span className="wbr-stat-num">{main}</span>
      {unit ? <span className="wbr-stat-unit">{unit}</span> : null}
      <span className="wbr-stat-label">{label}</span>
      {hint ? <span className="wbr-stat-hint">{hint}</span> : null}
    </Glass>
  );
}
