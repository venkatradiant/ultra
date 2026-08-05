/**
 * Aramco — the archetypal downstream target for the TrackLynk.AI reference demo.
 *
 * Aramco is NOT a current customer. Company-level facts shown in the demo are
 * public and sourced to the Aramco FY2025 Annual Report; every operational
 * figure is illustrative and labeled as such. See the Data Sources screen for
 * the full statement.
 *
 * Branding is Aramco-primary: the client carries the mark and the palette, and
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

export const aramcoClient: ClientManifest = {
  id: 'aramco',
  marketId: 'oil_gas',
  branding: {
    name: 'Aramco',
    shortName: 'Aramco',
    nameLines: ['Aramco'],
    tagline: 'HSE Intelligence',
    // The emblem square cropped from the official lockup — it carries its own
    // green-to-blue field, so it reads on light surfaces (sidebar, client tile).
    // The full white lockup is kept for dark fields.
    logo: '/logos/aramco-emblem.png',
    favicon: '/logos/aramco-emblem.png',
    primaryColor: '#0071CE',
    // Official TrackLynk lockup (coral mark over the wordmark), taken from
    // TrackLynk's own deck rather than recreated.
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
  defaultPersonaId: 'aramco_hse_gm',
};
