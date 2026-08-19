/**
 * Maryland Department of Information Technology — the SLED reference tenant.
 *
 * DoIT is an illustrative target example, not a customer. No figure anywhere in
 * this tenant describes real Maryland program data, and the Data Sources screen
 * carries that statement — the same posture Aramco and AT&T take.
 *
 * Branding is DoIT-primary: the department carries the mark and the palette.
 * Deliberately no `footerMark` — VOCE is the product, but Radiant keeps the
 * bottom-left credit here as it does everywhere except Aramco. VOCE is still
 * named throughout: it is the tagline and the `Ask VOCE` nav label.
 *
 * Palette and mark are taken from the department's own site (doit.maryland.gov):
 * #1a4480 is its primary button fill, and the arch device's gold (#fdc22e) and
 * red (#c8122c) are sampled from the official lockup.
 *
 * Keep in sync with src/config/clients.js — BrandingContext reads THAT map,
 * ChooseClientScreen reads THIS one, and nothing asserts they agree.
 */
import type { ClientManifest } from '@core/types';
import { authorPersona } from './personas/author';
import { adminPersona } from './personas/admin';
import { residentPersona } from './personas/resident';

export const doitClient: ClientManifest = {
  id: 'doit',
  marketId: 'sled',
  branding: {
    // DoIT, not the full department name — see the note in src/config/clients.js.
    // The expansion is stated once, on the Data Sources screen.
    name: 'Maryland DoIT',
    shortName: 'Maryland DoIT',
    nameLines: ['Maryland DoIT'],
    tagline: 'Voice of the Resident',
    logo: '/logos/maryland-doit-mark.svg',
    favicon: '/logos/maryland-doit-mark.svg',
    primaryColor: '#1a4480',
    // Only `ask` is relabelled. journey/risk/governance are deliberately omitted:
    // every DoIT persona sets an explicit features.navSlots, so the Sidebar's
    // fallback list is never reached and no stale "Member Journey" can leak in.
    navLabels: { ask: 'Ask VOCE' },
  },
  // Personas land one per phase — the registry-integrity test asserts this list
  // and CLIENT_PERSONAS agree in both directions, so allow-listing a persona
  // before it is built fails the suite.
  personas: [authorPersona, adminPersona, residentPersona],
  defaultPersonaId: 'doit_author',
  theme: {
    light: {
      brand: '#1a4480',
      accent: '#f0a500',
      // Maryland's own palette takes the semantic roles. `info` is teal rather
      // than a blue on purpose: a blue info state sitting beside a navy brand
      // reads as brand chrome rather than as information.
      success: '#2e8540', // 4.62:1
      warning: '#c87000', // 3.64:1 — better than the platform default #d97706
      critical: '#981b1e', // 8.36:1 — the Maryland state red
      info: '#0e7490',
      confHigh: '#2e8540',
      confMed: '#c87000',
      confLow: '#981b1e',
    },
  },
};
