import { useRef } from 'react';
import Glass from '../ui/Glass';
import Icon from '../ui/Icon';
import CarouselDots from '../ui/CarouselDots';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useGlassTilt } from '../../hooks/useGlassTilt';
import { useCarouselIndex } from '../../hooks/useCarouselIndex';

const PRODUCTS = [
  { icon: 'loan', title: 'Retail Loans', desc: 'Collateral-based or credit-based applications, scored and disbursed on-chain.' },
  { icon: 'group', title: 'Group Lending', desc: 'Pooled borrowing with multisig consent and shared credit exposure.' },
  { icon: 'savings', title: 'Savings & Deposits', desc: 'Savings vaults, fixed deposits, and current accounts that earn in reserve.' },
  { icon: 'passport', title: 'Credit Passport', desc: 'A soulbound credit identity that travels with you across every tier.' },
  { icon: 'agent', title: 'AI Banking Agent', desc: 'A conversational agent for balances, applications, and everyday banking.' },
  { icon: 'eye', title: 'Reserve Transparency', desc: 'A public dashboard of reserve health, verifiable against the chain.' },
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
        <p className="eyebrow center">On the Platform</p>
        <h2 className="section-title center">Everything a tier needs, nothing it doesn&apos;t.</h2>
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
