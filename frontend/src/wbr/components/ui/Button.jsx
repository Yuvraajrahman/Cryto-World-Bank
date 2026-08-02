import Icon from './Icon';

export default function Button({
  as,
  href,
  variant = 'primary',
  size = 'md',
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

  const props = href != null ? { href, ...rest } : rest;

  return (
    <Tag className={classes} {...props}>
      {children}
      {showArrow && <Icon name="arrow" size={14} />}
    </Tag>
  );
}
