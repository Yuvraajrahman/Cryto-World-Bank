import { forwardRef } from 'react';

/**
 * The one liquid-glass surface primitive used everywhere: cards, the
 * navbar, sheets, badges, panels. Polymorphic via `as` so it can render as
 * a <div>, <a>, <button>, etc. without duplicating the glass styling.
 *
 * Elevation:
 *   level="1" (default) — resting card on the void background (.glass)
 *   level="3"            — sheets/menus/popovers above content (.glass-elevated)
 *   (there is no level-2 surface class — it's the transient hover/active
 *   fill already baked into level 1 via .glass-interactive)
 *
 * `interactive` adds press-scale feedback and a hover fill-shift, gated to
 * real hover devices — see `.glass-interactive` in global.css.
 *
 * `tilt` spreads pointer handlers from useGlassTilt() for the desktop-only
 * 3D lean effect, e.g. <Glass tilt={useGlassTilt()} interactive>.
 */
const Glass = forwardRef(function Glass(
  { as: Tag = 'div', level = 1, interactive = false, tilt, className = '', children, ...rest },
  ref
) {
  const classes = [
    level === 3 ? 'glass-elevated' : 'glass',
    interactive ? 'glass-interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref} className={classes} {...tilt} {...rest}>
      {children}
    </Tag>
  );
});

export default Glass;
