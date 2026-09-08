/**
 * ADNOC client-brand reference.
 *
 * ADNOC leads the identity in this tenant: the mark is the sidebar logo and the
 * palette drives the UI (see the client manifest). What lives here is the
 * material that does NOT belong in the theme — the white lockup for dark
 * fields, the brand field, and the public company facts.
 *
 * ADNOC is an illustrative target example, not a customer. The qualifier that
 * says so renders on the Data Sources screen; the strings below back that panel.
 *
 * Brand assets are ADNOC's own, taken from adnoc.ae so the demo is recognisable:
 *   • the white lockup at /-/media/adnoc/images/content/logo/adnoc-logo-updated
 *   • the compact blue mark at /-/media/adnoc/images/content/logo/logo-sticky-v4
 * The palette is sampled from that lockup: #0047BA and #E4087E are the two
 * colours declared in the official SVG. Reproduced for an ADNOC-facing
 * demonstration only; confirm against the ADNOC brand kit before external use.
 *
 * Company facts: ADNOC's published Key Facts, https://www.adnoc.ae/en/about-us
 */

/** Official lockup, white on transparent. Needs a dark field. */
export const LOGO_WHITE = '/logos/adnoc-logo.svg';

/** The compact blue mark — carries its own white field, so it reads on light
 *  surfaces. Used as the client mark and favicon. */
export const LOGO_EMBLEM = '/logos/adnoc-mark.png';

/** The identity band field. Dark enough for the white lockup to sit on it. */
export const ADNOC_GRADIENT =
  'linear-gradient(135deg, #0047BA 0%, #003A99 55%, #E4087E 100%)';

/** How the client is described where it needs spelling out. */
export const CLIENT_CONTEXT = {
  name: 'ADNOC',
  descriptor: 'Ruwais Industrial Complex — refining and petrochemicals',
  disclaimer: 'Illustrative target example — not a current customer',
};

export const PUBLIC_FACTS_SOURCE = 'ADNOC published Key Facts, adnoc.ae';
export const PUBLIC_FACTS_URL = 'https://www.adnoc.ae/en/about-us';

/** Real, public, sourced. The only genuine data in this tenant. */
export const ADNOC_PUBLIC_FACTS = [
  { id: 'founded', label: 'Founded', value: '1971', detail: 'Headquartered in Abu Dhabi, United Arab Emirates' },
  { id: 'ownership', label: 'Ownership', value: 'Abu Dhabi Government', detail: 'Wholly owned' },
  { id: 'oil', label: 'Oil production capacity', value: '4.85 mmbbl/d', detail: 'Million barrels per day' },
  { id: 'gas', label: 'Natural gas', value: '11.5 bcf/d', detail: 'Billion cubic feet per day' },
  { id: 'offshore', label: 'Offshore footprint', value: '9 fields', detail: 'Six artificial islands, three natural islands and eight offshore super complexes' },
  { id: 'structures', label: 'Offshore structures', value: '400+', detail: 'Across the offshore estate' },
];

/** The demo site itself. Illustrative — NOT an actual ADNOC facility layout. */
export const DEMO_SITE_FRAME = {
  capacity: 'About 817,000 barrels per day',
  directStaff: 'About 1,850 direct staff',
  contractors: '1,500 to 4,100 contractors during turnarounds',
  state: 'Turnaround — full contractor load',
};
