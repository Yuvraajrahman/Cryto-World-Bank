import Glass from '../ui/Glass';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useGlassTilt } from '../../hooks/useGlassTilt';

const TIERS = [
  {
    id: 'tier-1',
    tag: 'Tier 1 · Global',
    name: 'World Bank',
    desc: 'Global reserve custody, proof-of-reserve attestation, and national bank registration.',
  },
  {
    id: 'tier-2',
    tag: 'Tier 2 · Country',
    name: 'National Bank',
    desc: 'Capital allocation to local branches, rate policy, and reserve ratio settings.',
  },
  {
    id: 'tier-3',
    tag: 'Tier 3 · Branch',
    name: 'Local Bank',
    desc: 'Loan approval, KYC review, and day-to-day community lending decisions.',
  },
  {
    id: 'tier-4',
    tag: 'Tier 4 · You',
    name: 'Client',
    desc: 'Borrow, save, and build credit — collateral-based or credit-based.',
  },
];

function TierCard({ id, tag, name, desc, delay }) {
  const { ref, className, style } = useScrollReveal({ delay });
  const tilt = useGlassTilt({ max: 4 });
  return (
    <Glass ref={ref} tilt={tilt} className={`tier-card ${id} ${className}`} style={style}>
      <span className="tier-tag">{tag}</span>
      <span className="tier-name">{name}</span>
      <p>{desc}</p>
    </Glass>
  );
}

/**
 * The signature element: capital narrows visually as it moves through
 * World -> National -> Local -> Client. At mobile widths the narrowing
 * reads through symmetric inset margins (see .tier-card.tier-2/3/4 in
 * global.css) since there's no room for shrinking width in one column;
 * desktop reverts to the original explicit-width funnel. A pulse
 * animates down the connecting line either way, representing the
 * platform's real downward capital allocation mechanic.
 */
export default function TierCascade() {
  const head = useScrollReveal();

  return (
    <section className="section" id="tiers">
      <div ref={head.ref} className={`section-head ${head.className}`} style={head.style}>
        <p className="eyebrow center">The Hierarchy</p>
        <h2 className="section-title center">
          Capital cascades through <em>four tiers</em> of accountability.
        </h2>
        <p className="section-lede center">
          Every reserve balance narrows in scope as it moves down the chain — broad at the top,
          personal at the bottom, transparent throughout.
        </p>
      </div>

      <div className="cascade">
        <div className="cascade-line" />
        <div className="cascade-pulse" />
        {TIERS.map((tier, i) => (
          <TierCard key={tier.id} {...tier} delay={(i % 4) * 60} />
        ))}
      </div>
    </section>
  );
}
