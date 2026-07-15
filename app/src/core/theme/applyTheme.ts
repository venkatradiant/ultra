/**
 * Writes resolved theme variables onto <html>. Clears every managed var first so
 * switching from a heavily-themed client to a lightly-themed one never leaves
 * stale overrides behind. Sets `data-theme` for the light/dark surface tokens.
 */

import { MANAGED_VARS, type ThemeMode } from './tokens';

export function applyThemeVars(vars: Record<string, string>, mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  el.setAttribute('data-theme', mode);
  el.style.colorScheme = mode;

  MANAGED_VARS.forEach((name) => el.style.removeProperty(name));
  Object.entries(vars).forEach(([name, value]) => el.style.setProperty(name, value));
}
