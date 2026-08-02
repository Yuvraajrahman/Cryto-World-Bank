import { useRef } from 'react';
import Glass from '../ui/Glass';
import Badge from '../ui/Badge';
import StatCard from '../ui/StatCard';
import CarouselDots from '../ui/CarouselDots';
import StateMessage from '../ui/StateMessage';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useReserveSummary } from '../../hooks/useReserveSummary';
import { useCarouselIndex } from '../../hooks/useCarouselIndex';

/**
 * This section is the clearest example of the data-hook pattern: it reads
 * `useReserveSummary()` and branches on `status` so the page degrades
 * gracefully if the event-listener/API is down, per the plan's spec for
 * page A.1 ("stats block should degrade gracefully ... the rest of the
 * page must still render"). The stat row itself uses the same mobile
 * snap-carousel / desktop-grid pattern as ProductGrid.
 */
export default function TransparencySection() {
  const head = useScrollReveal();
  const { status, data, source } = useReserveSummary();
  const rowRef = useRef(null);
  const { active, scrollTo } = useCarouselIndex(rowRef, 3);

  return (
    <section className="section" id="transparency">
      <div ref={head.ref} className={`section-head ${head.className}`} style={head.style}>
        <p className="eyebrow center">Reserve transparency</p>
        <h2 className="section-title center">
          Solvency reported <em>in the open.</em>
        </h2>
        <p className="section-lede center">
          Live aggregates for capital under management, active credit, and participating
          institutions — available for inspection without authentication.
          {source === "cache" ? " Cached demonstration figures are shown while the API is unreachable." : ""}
        </p>
      </div>

      {status === 'loading' && (
        <div className="stats-row snap-row" aria-busy="true" aria-live="polite">
          {[0, 1, 2].map((i) => (
            <Glass key={i} className="stat-skeleton" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <StateMessage
          variant="error"
          title="Live reserve data is unavailable"
          description="The rest of the page still works — check back shortly."
        />
      )}

      {status === 'success' && data && (
        <>
          <div ref={rowRef} className="stats-row snap-row">
            <StatCard label="Capital under management" value={data.capitalUnderManagement.display} delay={0} />
            <StatCard label="Active loans" value={data.activeLoans.display} delay={60} />
            <StatCard label="Participating banks" value={data.participatingBanks.display} delay={120} />
          </div>
          <CarouselDots count={3} active={active} onSelect={scrollTo} />
          <div className="badges">
            {data.audits.map((audit) => (
              <Badge key={audit.name}>{audit.name} Audited</Badge>
            ))}
            <Badge icon="node">{data.network.name}</Badge>
            {data.contractsVerified && <Badge>Contracts Verified</Badge>}
            {source === "api" ? <Badge icon="check">Live API</Badge> : null}
            {source === "cache" ? <Badge icon="warn">Cached fallback</Badge> : null}
          </div>
        </>
      )}
    </section>
  );
}
