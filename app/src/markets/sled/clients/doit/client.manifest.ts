/**
 * Maryland Department of Information Technology — the SLED reference tenant.
 *
 * DoIT is an illustrative target example, not a customer. No figure anywhere in
 * this tenant describes real Maryland program data, and the Data Sources screen
 * carries that statement — the same posture Aramco and AT&T take.
 *
 * Branding is DoIT-primary: the department carries the mark and the palette, and
 * VOCE — the product being shown — sits bottom-left in the slot Radiant's mark
 * normally occupies. Same shape as Aramco/TrackLynk.
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

export const doitClient: ClientManifest = {
  id: 'doit',
  marketId: 'sled',
  branding: {
    name: 'Maryland Department of Information Technology',
    shortName: 'Maryland DoIT',
    // Three lines rather than two — see the note in src/config/clients.js.
    nameLines: ['Maryland Department', 'of Information', 'Technology'],
    tagline: 'Voice of the Resident',
    logo: '/logos/maryland-doit-mark.svg',
    favicon: '/logos/maryland-doit-mark.svg',
    primaryColor: '#1a4480',
    footerMark: {
      logo: '/logos/voce-logo.svg',
      alt: 'VOCE — Voice of the Resident',
      label: 'Powered by',
    },
    // Only `ask` is relabelled. journey/risk/governance are deliberately omitted:
    // every DoIT persona sets an explicit features.navSlots, so the Sidebar's
    // fallback list is never reached and no stale "Member Journey" can leak in.
    navLabels: { ask: 'Ask VOCE' },
  },
  // Personas land one per phase — the registry-integrity test asserts this list
  // and CLIENT_PERSONAS agree in both directions, so allow-listing a persona
  // before it is built fails the suite.
  personas: [authorPersona],
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
