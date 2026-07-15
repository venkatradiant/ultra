/**
 * ThemeProvider — resolves the active client's brand theme + the light/dark mode
 * and writes the token CSS variables onto <html>. This is the single runtime seam
 * that turns `branding.primaryColor` / `client.theme` into a live re-skin of the
 * whole app. Every themeable surface just reads tokens (bg-brand, text-muted, …).
 *
 * Mode is persisted (localStorage) and overridable via `?theme=dark|light`.
 */

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { useBranding } from '../../context/BrandingContext';
import { resolveThemeVars } from '../theme/themes';
import { applyThemeVars } from '../theme/applyTheme';
import type { ThemeMode } from '../theme/tokens';

const STORAGE_KEY = 'ultra_theme_mode';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function initialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const q = new URLSearchParams(window.location.search).get('theme');
  if (q === 'dark' || q === 'light') return q;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // useBranding is untyped JS; returns null if mounted outside BrandingProvider.
  const branding = useBranding() as { clientId?: string | null } | null;
  const clientId = branding?.clientId ?? null;
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    applyThemeVars(resolveThemeVars(clientId, mode), mode);
  }, [clientId, mode]);

  const toggle = useCallback(() => setMode((m) => (m === 'dark' ? 'light' : 'dark')), []);

  return <ThemeContext.Provider value={{ mode, setMode, toggle }}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- provider + hook colocated
export function useTheme(): ThemeContextValue {
  return (
    useContext(ThemeContext) ?? {
      mode: 'light',
      setMode: () => {},
      toggle: () => {},
    }
  );
}
