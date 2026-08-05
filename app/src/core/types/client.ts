/**
 * ClientManifest — one tenant (NFCU, PenFed, USSFCU…). Owns branding and the
 * set of personas it exposes. (Was `config/clients.js` + the CLIENT_PERSONAS /
 * CLIENT_DEFAULT_PERSONA maps scattered in PersonaContext.)
 */

import type { NavKey, PersonaModule } from './persona';
import type { BrandTheme } from '../theme/tokens';

export interface ClientBranding {
  name: string;
  shortName: string;
  nameLines: string[];
  tagline: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  navLabels?: Partial<Record<NavKey, string>>;
  /**
   * Replaces the default "Powered by Radiant Digital" mark in the sidebar footer
   * and the capability deep-dive modal. Set when a client's demo leads with a
   * product brand of its own rather than with Radiant's.
   */
  footerMark?: {
    logo: string;
    alt: string;
    /** Optional lead-in, e.g. "Powered by". Omit for a bare mark. */
    label?: string;
  };
}

export interface ClientManifest {
  id: string;
  marketId: string;
  branding: ClientBranding;
  /** Personas this client exposes, in display order. */
  personas: PersonaModule[];
  /** Default persona id when the client is first entered. */
  defaultPersonaId: string;
  /**
   * Optional per-client brand theme (colors, fonts, chart palette, dark variant).
   * Overrides the market theme; `branding.primaryColor` seeds the brand if omitted.
   */
  theme?: BrandTheme;
}
