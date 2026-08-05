import Icon from './Icon';

/**
 * Small glass pill used for trust markers (audit badges, network badge)
 * and will double as the base for status chips on later pages (KYC level,
 * loan status, etc.) — keep generic rather than transparency-specific.
 */
export default function Badge({ icon = 'check', children, className = '', tone }) {
  const toneClass = tone ? `tone tone-${tone}` : '';
  return (
    <span className={`badge ${toneClass} ${className}`.trim()}>
      <Icon name={icon} size={12} />
      {children}
    </span>
  );
}
