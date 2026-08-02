/** The four descending bars mirror the tier hierarchy — used in the navbar, menu sheet, and footer. */
export default function LogoMark({ size = 22 }) {
  const height = Math.round(size * (18 / 24));
  return (
    <svg width={size} height={height} viewBox="0 0 24 18" fill="none" aria-hidden="true">
      <rect x="0" y="0" width="24" height="3" rx="1.5" fill="currentColor" />
      <rect x="3" y="5" width="18" height="3" rx="1.5" fill="currentColor" opacity=".78" />
      <rect x="6" y="10" width="12" height="3" rx="1.5" fill="currentColor" opacity=".56" />
      <rect x="9" y="15" width="6" height="3" rx="1.5" fill="currentColor" opacity=".36" />
    </svg>
  );
}
