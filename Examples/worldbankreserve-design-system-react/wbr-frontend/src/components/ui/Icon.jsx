/**
 * Central icon set. Add new icons here as new pages need them, rather
 * than inlining <svg> markup inside individual components — keeps every
 * page's icon usage consistent (same stroke width, same viewBox).
 */
const ICONS = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  check: <path d="M5 13l4 4L19 7" />,
  node: <circle cx="12" cy="12" r="8" />,
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12M18 6L6 18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  alert: (
    <>
      <path d="M12 9v4M12 16.5h.01" />
      <path d="M10.3 3.9L2.6 17.5a1.6 1.6 0 0 0 1.4 2.4h16a1.6 1.6 0 0 0 1.4-2.4L13.7 3.9a1.6 1.6 0 0 0-2.8 0z" />
    </>
  ),
  loan: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M8 12h5M8 15h8" />
    </>
  ),
  group: (
    <>
      <circle cx="8" cy="9" r="3" />
      <circle cx="16" cy="9" r="3" />
      <path d="M2 19c0-3 3-5 6-5s6 2 6 5M12 19c0-2.5 2.4-4.4 5-4.4s5 1.9 5 4.4" />
    </>
  ),
  savings: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  passport: (
    <>
      <path d="M12 3l7 3v6c0 5-3 7.5-7 9-4-1.5-7-4-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  agent: (
    <>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  home: (
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v9h5v-5h2v5h5v-9" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M16 13.5h2.5" />
    </>
  ),
};

export default function Icon({ name, size = 20, className = '' }) {
  const content = ICONS[name];
  if (!content) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}
