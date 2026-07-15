/**
 * Theme resolution: given the active client id and mode, produce the flat map of
 * CSS variables to write. Merge order (later wins): base(index.css) ← domain.theme
 * ← client.theme, with the mode's overrides layered on the light base. When no
 * explicit brand token is given, the client's `branding.primaryColor` seeds it —
 * so a client with only a primaryColor (e.g. Riverside teal) themes for free.
 */

import { findClient } from '../runtime/registry';
import { tokensToVars, type ThemeMode, type ThemeTokens } from './tokens';

export function resolveThemeVars(clientId: string | null | undefined, mode: ThemeMode): Record<string, string> {
  const found = clientId ? findClient(clientId) : null;
  const domainTheme = found?.domain.theme;
  const clientTheme = found?.client.theme;
  const primaryColor = found?.client.branding.primaryColor;

  // Light tokens are the base for both modes; dark tokens layer on top in dark mode.
  const merged: ThemeTokens = {
    ...domainTheme?.light,
    ...clientTheme?.light,
    ...(mode === 'dark' ? { ...domainTheme?.dark, ...clientTheme?.dark } : {}),
  };

  if (!merged.brand && primaryColor) merged.brand = primaryColor;

  const vars = tokensToVars(merged);

  const fonts = clientTheme?.fonts ?? domainTheme?.fonts;
  if (fonts?.sans) vars['--font-sans'] = fonts.sans;
  if (fonts?.display) vars['--font-display'] = fonts.display;

  return vars;
}
