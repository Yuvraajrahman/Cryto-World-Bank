import Icon from './Icon';

/**
 * Polymorphic CTA — renders as <a> when given `href`, otherwise <button>.
 * Used for every call-to-action across every page, so keep this the only
 * place button styling logic lives.
 *
 * `block` makes it full-width — the default posture for primary mobile CTAs
 * (see .hero-cta at mobile widths in global.css, which stacks buttons and
 * relies on this).
 */
export default function Button({
  as,
  href,
  variant = 'primary', // 'primary' | 'ghost'
  size = 'md', // 'md' | 'sm'
  block = false,
  showArrow = variant === 'primary',
  className = '',
  children,
  ...rest
}) {
  const Tag = as || (href ? 'a' : 'button');
  const classes = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : '',
    block ? 'btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} href={href} {...rest}>
      {children}
      {showArrow && <Icon name="arrow" size={14} />}
    </Tag>
  );
}
