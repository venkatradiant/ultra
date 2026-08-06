/**
 * Resolve a CSS colour expression to a concrete `#rrggbb` string.
 *
 * The theme layer lives entirely in CSS custom properties on <html>, written at
 * runtime by ThemeProvider. That works for anything Tailwind renders, but a
 * non-CSS renderer — a mermaid theme object, a MapLibre style, a WebGL uniform —
 * cannot consume `var()` or `color-mix()`. It needs a literal.
 *
 * The trick is to let the browser do the resolving: set the expression on a
 * detached-but-attached element and read back the computed value. This was
 * solved once inside RoutingDiagram for mermaid; it lives here now because the
 * map is the second caller and a third copy would be one too many.
 */

/**
 * Normalise a computed colour to `#rrggbb`.
 *
 * Handles both `rgb(0-255 …)` and the `color(srgb 0-1 …)` form browsers return
 * for `color-mix()` results — the two differ by a factor of 255, and mistaking
 * one for the other yields black.
 */
export function rgbToHex(color) {
  const nums = color.match(/[\d.]+/g);
  if (!nums || nums.length < 3) return color;
  let [r, g, b] = nums.map(Number);
  if (/^color\(/i.test(color) || (r <= 1 && g <= 1 && b <= 1)) {
    r *= 255; g *= 255; b *= 255;
  }
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Resolve a CSS colour expression (`var(--color-brand)`, `color-mix(…)`, a bare
 * hex) to `#rrggbb`.
 *
 * `fallback` is returned when there is no DOM — which is the case under vitest's
 * jsdom-less runs and would otherwise throw inside a module-scope call.
 */
export function resolveColor(expr, fallback = '#000000') {
  if (typeof document === 'undefined') return fallback;
  const el = document.createElement('span');
  el.style.color = expr;
  el.style.display = 'none';
  document.body.appendChild(el);
  const value = getComputedStyle(el).color;
  el.remove();
  return value ? rgbToHex(value) : fallback;
}

/** Resolve several expressions at once, reusing one probe element. */
export function resolveColors(map) {
  if (typeof document === 'undefined') {
    return Object.fromEntries(Object.keys(map).map((k) => [k, '#000000']));
  }
  const el = document.createElement('span');
  el.style.display = 'none';
  document.body.appendChild(el);
  const out = {};
  for (const [key, expr] of Object.entries(map)) {
    el.style.color = expr;
    out[key] = rgbToHex(getComputedStyle(el).color);
  }
  el.remove();
  return out;
}

export default resolveColor;
