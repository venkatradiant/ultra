/**
 * ESFCU CEO palette constants.
 *
 * `NAVY` and `ACCENT` come from the theme so a brand-kit change in the client
 * manifest propagates for free. The three literals below cannot: they are used
 * inside inline SVG fills, recharts props and the presentation deck's own CSS
 * scope, where a CSS custom property is either unsupported or resolves against
 * the wrong element.
 *
 * ACCENT_SOFT is the light warm tone used on navy — the deck and the modal
 * headers. It is deliberately brighter than the theme's `accent` (#B45309),
 * which is tuned for legibility on white and disappears against navy.
 *
 * MAROON is ESFCU's real second brand colour. It is used ONLY in the logo
 * lockup, never as a UI state or accent — it reads as critical-severity red
 * everywhere else in this app.
 */
export const NAVY = 'var(--color-brand)';
export const ACCENT = 'var(--color-accent)';

/** Warm tone for use ON navy (deck chrome, modal headers, ribbon icons). */
export const ACCENT_SOFT = '#E8A33D';
/** Literal navy, for SVG/canvas contexts that cannot read a CSS variable. */
export const NAVY_HEX = '#003768';
/** Real ESFCU maroon — logo lockup only. */
export const MAROON_HEX = '#8A0D04';

/** Trust/severity states. Text-plus-icon everywhere; colour is never the only cue. */
export const STATE_COLOR = {
  good: '#00897B',
  warning: '#B45309',
  critical: '#DC2626',
};
