/**
 * AMISA — American International Schools in the Americas.
 *
 * The second SLED tenant, and structurally the closest thing in the platform to
 * Maryland DoIT: both are survey programmes with an authoring side, a
 * data-quality sweep and a publication deadline. AMISA differs in the one way
 * that shaped every screen — it is an ASSOCIATION, so the data belongs to its
 * member schools rather than to it, and the whole tenant is built around what
 * the association is therefore not allowed to see.
 *
 * ILLUSTRATIVE. AMISA is a live pursuit, not a customer, and the Data Sources
 * screen carries the full statement. The public backdrop — mission, motto,
 * headquarters, staff of 7, ~25 countries — is real and sourced to amisa.us and
 * the RFP question-and-answer document. Every operational figure is invented,
 * and every member school on the roster is fictional: attaching invented
 * salaries to real, named schools would manufacture a record about identifiable
 * organisations.
 *
 * THE PALETTE IS NOT THE LOGO'S RED, and that is deliberate. AMISA's #DB3D38
 * measures 4.43:1 on white — below AA for body text — and `brand` is what
 * `bg-brand text-white` fills every primary button and active nav item with. So
 * `brand` is a darkened #B22A26 (6.46:1) and the true logo red stays as
 * `accent`, on the mark and on small touches. The intake asks for exactly this
 * restraint for a second reason: large red surfaces read as an alert.
 *
 * `critical` is deepened past both, because a red brand sitting beside the
 * default red critical blunts them both. Same collision the Oil & Gas market
 * documents for TrackLynk's coral.
 *
 * Keep in sync with src/config/clients.js — BrandingContext reads THAT map,
 * ChooseClientScreen reads THIS one, and nothing asserts they agree.
 */
import type { ClientManifest } from '@core/types';
import { directorPersona } from './personas/director';
import { hrPersona } from './personas/hr';

export const amisaClient: ClientManifest = {
  id: 'amisa',
  marketId: 'sled',
  branding: {
    name: 'AMISA',
    shortName: 'AMISA',
    nameLines: ['AMISA'],
    // The association's own motto, and the right tagline for a tenant whose
    // argument is that schools get more together than they can alone.
    tagline: 'Better Together',
    // The globe device, cropped from the official lockup. Raster: AMISA has not
    // supplied vector assets, and inventing one is worse than shipping the mark
    // they actually use. Rendered on a white plate everywhere it appears
    // (picker tile, login hero, sidebar), so the near-black graticule reads.
    logo: '/logos/amisa-mark.png',
    favicon: '/logos/amisa-mark.png',
    primaryColor: '#DB3D38',
    // Only `ask` is relabelled at the client level. Both personas set an
    // explicit features.navSlots, so the Sidebar's fallback list is never
    // reached and no stale "Member Journey" can leak in.
    navLabels: { ask: 'Ask AMISA' },
  },
  // The association first, because the Executive Director is the buyer and the
  // default. The school-side persona is second and is what makes the
  // association's restraint demonstrable rather than merely stated.
  personas: [directorPersona, hrPersona],
  defaultPersonaId: 'amisa_director',
  theme: {
    light: {
      brand: '#B22A26',
      accent: '#DB3D38',
      text: '#0A0B09',
      // Deepened well past the brand red. With a red brand the default
      // #dc2626 critical is indistinguishable from ordinary chrome, and
      // "this figure is outside the range" has to survive sitting next to a
      // brand-filled button.
      critical: '#7A1416',
      warning: '#B45309',
      success: '#15803D',
      info: '#0E7490',
      confHigh: '#15803D',
      confMed: '#B45309',
      confLow: '#7A1416',
      // Brand red leads; everything after it is deliberately clear of the
      // emerald/amber/rose band the confidence tiers own, so a chart series is
      // never mistaken for a risk state.
      chart: [
        '#B22A26', // 1 AMISA red (brand)
        '#0E7490', // 2 teal — maximum separation from series 1
        '#334155', // 3 slate
        '#7C3AED', // 4 violet
        '#A16207', // 5 bronze
        '#0F766E', // 6 deep teal
        '#BE185D', // 7 magenta
        '#64748B', // 8 grey
      ],
    },
  },
};
