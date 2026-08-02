import { useRef } from 'react';
import Glass from '../ui/Glass';
import Icon from '../ui/Icon';
import CarouselDots from '../ui/CarouselDots';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useGlassTilt } from '../../hooks/useGlassTilt';
import { useCarouselIndex } from '../../hooks/useCarouselIndex';

const PRODUCTS = [
  {
    icon: "loan",
    title: "Credit facilities",
    desc: "Collateral-backed or credit-based lending. Approvals and disbursement settle on-chain.",
  },
  {
    icon: "group",
    title: "Group credit",
    desc: "Shared-liability facilities with explicit member consent before any funds are released.",
  },
  {
    icon: "savings",
    title: "Deposits & savings",
    desc: "Flexible vaults, term deposits, and a transactional balance for routine transfers.",
  },
  {
    icon: "passport",
    title: "Credit Passport",
    desc: "A portable on-chain credit record recognised across banks and tiers in the hierarchy.",
  },
  {
    icon: "agent",
    title: "Client advisory",
    desc: "Guided assistance on balances, limits, and applications — with human approval for actions.",
  },
  {
    icon: "eye",
    title: "Public reserve board",
    desc: "Aggregate reserves, ratios, and attestation available for inspection without login.",
  },
];

function ProductCard({ icon, title, desc, delay }) {
  const { ref, className, style } = useScrollReveal({ delay });
  const tilt = useGlassTilt();
  return (
    <Glass ref={ref} tilt={tilt} className={`product-card ${className}`} style={style}>
      <div className="product-icon">
        <Icon name={icon} />
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </Glass>
  );
}

/**
 * Mobile: a horizontal scroll-snap carousel with a peek of the next card
 * (native iOS card-row feel) and dot pagination. Desktop (1024px+): a
 * static 3-column grid, matching the original design — see
 * `.product-grid` at the 1024px breakpoint in global.css.
 */
export default function ProductGrid() {
  const head = useScrollReveal();
  const rowRef = useRef(null);
  const { active, scrollTo } = useCarouselIndex(rowRef, PRODUCTS.length);

  return (
    <section className="section" id="product">
      <div ref={head.ref} className={`section-head ${head.className}`} style={head.style}>
        <p className="eyebrow center">Client services</p>
        <h2 className="section-title center">
          Banking products for <em>digital finance.</em>
        </h2>
        <p className="section-lede center">
          Credit, deposits, identity, and reserve transparency — the operating surface of a modern
          reserve institution, underpinned by an open ledger.
        </p>
      </div>
      <div ref={rowRef} className="product-grid snap-row">
        {PRODUCTS.map((product, i) => (
          <ProductCard key={product.title} {...product} delay={(i % 3) * 60} />
        ))}
      </div>
      <CarouselDots count={PRODUCTS.length} active={active} onSelect={scrollTo} />
    </section>
  );
}
