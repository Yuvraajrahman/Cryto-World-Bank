import Glass from './Glass';
import { useScrollReveal } from '../../hooks/useScrollReveal';

/**
 * A single glass stat tile (big Fraunces numeral + mono label). Used in the
 * landing page's transparency row today; the same shape works for balance
 * tiles on the Client Dashboard and admin dashboards later — keep it
 * data-agnostic (label/value in, nothing else) so it travels well.
 */
export default function StatCard({ label, value, delay = 0, className = '' }) {
  const { ref, className: revealClass, style } = useScrollReveal({ delay });
  return (
    <Glass ref={ref} className={`stat ${revealClass} ${className}`.trim()} style={style}>
      <span className="stat-num">{value}</span>
      <span className="stat-label">{label}</span>
    </Glass>
  );
}
