/**
 * ADNOC — the archetypal downstream target for the TrackLynk.AI reference demo.
 *
 * ADNOC is NOT a current customer. Company-level facts shown in the demo are
 * public and sourced to the ADNOC FY2025 Annual Report; every operational
 * figure is illustrative and labeled as such. See the Data Sources screen for
 * the full statement.
 *
 * Branding is ADNOC-primary: the client carries the mark and the palette, and
 * TrackLynk — the product being sold — sits bottom-left in the slot Radiant's
 * mark normally occupies. The "not a current customer" statement lives on the
 * Data Sources screen (identity band + data-posture panel), which is the one
 * place the demo documents where its numbers come from.
 */
import type { ClientManifest } from '@core/types';
import { hseGmPersona } from './personas/hse-gm';
import { complexManagerPersona } from './personas/complex-manager';
import { shiftSupervisorPersona } from './personas/shift-supervisor';
import { permitIssuerPersona } from './personas/permit-issuer';

export const adnocClient: ClientManifest = {
  id: 'adnoc',
  marketId: 'oil_gas',
  branding: {
    name: 'ADNOC',
    shortName: 'ADNOC',
    nameLines: ['ADNOC'],
    tagline: 'HSE Intelligence',
    // The compact blue mark from adnoc.ae — it carries its own white field, so
    // it reads on light surfaces (sidebar, client tile). The white lockup is
    // kept in adnocBrand.js for dark fields.
    logo: '/logos/adnoc-mark.png',
    favicon: '/logos/adnoc-mark.png',
    primaryColor: '#0047BA',
    // Same product brand as the Aramco tenant: ADNOC names the client, TrackLynk
    // is the product being sold, Radiant Ultra is the platform beneath both.
    footerMark: {
      logo: '/logos/tracklynk-logo.png',
      alt: 'TrackLynk',
      label: 'Powered by',
    },
    // This persona uses dedicated HSE routes rather than borrowing the
    // journey/risk slots, so those two are left at their defaults and never
    // rendered. `governance` is intentionally unset — the spec's five routes
    // are Ask · Live Site · Permits · Muster · Data Sources.
    navLabels: {
      ask: 'Ask TrackLynk',
      liveSite: 'Live Site Picture',
      permits: 'Permit and Job Detail',
      muster: 'Muster Status',
    },
  },
  // Four altitudes on one live picture. The HSE GM is the reference demo and
  // stays the default; Complex Manager rolls the same data up across units,
  // while Shift Supervisor and Permit Issuer read it at ground level. None of
  // them required shell, chat, trust-panel or KPI rework — that is the point of
  // the manifest split. Order here is the order in the persona switcher:
  // highest altitude first, then the reference demo, then the two operators.
  personas: [complexManagerPersona, hseGmPersona, shiftSupervisorPersona, permitIssuerPersona],
  defaultPersonaId: 'adnoc_hse_gm',
  // The oil_gas market theme carries Aramco's blue. ADNOC's own palette is
  // sampled from the official lockup at adnoc.ae — #0047BA is the wordmark
  // blue and #E4087E the accent declared alongside it in that SVG. Kept as a
  // client override rather than changed at market level, so the two tenants
  // can be shown side by side without either borrowing the other's identity.
  theme: {
    light: {
      brand: '#0047BA',
      accent: '#E4087E',
      chart: ['#0047BA', '#0093D0', '#00A9CE', '#E4087E', '#D97706', '#7C3AED', '#059669', '#64748B'],
    },
  },
};
