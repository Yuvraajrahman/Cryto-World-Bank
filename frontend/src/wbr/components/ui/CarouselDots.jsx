/**
 * Dot pagination for the mobile `.snap-row` carousels (product grid, stat
 * row). Hidden automatically at desktop widths (1024px+) via CSS, once
 * those sections switch back to a static grid — see `.carousel-dots` in
 * global.css.
 */
export default function CarouselDots({ count, active, onSelect }) {
  if (count <= 1) return null;
  return (
    <div className="carousel-dots" role="tablist" aria-label="Carousel position">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={`Go to item ${i + 1}`}
          className={i === active ? 'active' : ''}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}
