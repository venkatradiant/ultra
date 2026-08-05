/**
 * Aramco client-brand reference.
 *
 * Aramco leads the identity in this market: the emblem is the sidebar mark and
 * the palette drives the UI (see `markets/oil-gas/market.manifest.ts`). What
 * lives here is the material that does NOT belong in the theme — the full white
 * lockup for dark fields, the emblem gradient, and the public company facts.
 *
 * Aramco is an illustrative target example, not a customer. The qualifier that
 * says so is `branding.disclaimer` in the client config, rendered persistently
 * in the sidebar; the strings below back the Data Sources panel.
 *
 * Source of the palette: the official lockup at
 * https://www.aramco.com/-/jssmedia/project/aramcocom/aramco-logo--white.webp
 * (green→blue star-emblem gradient), mirrored locally at LOGO_WHITE.
 * Company facts: Aramco FY2025 Annual Report, via https://www.aramco.com/.
 */

/** Official white lockup: "aramco" wordmark + star emblem. Needs a dark field. */
export const LOGO_WHITE = '/logos/aramco-logo-white.webp';

/** The emblem square cropped from the lockup — carries its own field, so it
 *  reads on light surfaces. Used as the client mark and favicon. */
export const LOGO_EMBLEM = '/logos/aramco-emblem.png';

/** The emblem field. Dark enough for the white lockup to sit on it directly. */
export const ARAMCO_GRADIENT =
  'linear-gradient(135deg, #7AB800 0%, #009639 38%, #0093D0 78%, #0071CE 100%)';

/** How the client is described where it needs spelling out. Formal, unambiguous. */
export const CLIENT_CONTEXT = {
  name: 'Aramco',
  descriptor: 'Refining and petrochemical complex',
  disclaimer: 'Illustrative target example — not a current customer',
};

/**
 * Section 2 of the specification. Every row is public and sourced; this is the
 * only real data in the prototype and it is labeled as such wherever it renders.
 */
export const PUBLIC_FACTS_SOURCE = 'Aramco FY2025 Annual Report';
export const PUBLIC_FACTS_URL = 'https://www.aramco.com/';

export const ARAMCO_PUBLIC_FACTS = [
  { id: 'founded', label: 'Founded', value: '1933', detail: 'Headquartered in Dhahran, Saudi Arabia' },
  { id: 'listing', label: 'Public listing', value: 'Tadawul, 2019', detail: 'Listed on the Saudi Exchange' },
  { id: 'production', label: 'Total hydrocarbon production', value: '12.9 mmboe/d', detail: 'Million barrels of oil equivalent per day, 2025' },
  { id: 'refining', label: 'Net refining capacity', value: '4.2 mmbbl/d', detail: 'Million barrels per day' },
  { id: 'chemicals', label: 'Chemicals capacity', value: '~59 Mt/y', detail: 'Million tons per year' },
  { id: 'trcr', label: 'Total recordable case rate', value: '0.028', detail: 'Per 200,000 work hours in 2025, improved from 0.046' },
  { id: 'reliability', label: 'Supply reliability', value: '99.9%', detail: 'Company-wide' },
  { id: 'workforce', label: 'Workforce', value: '~70,000', detail: 'Employees globally' },
];

/** The demo site itself. Illustrative — NOT an actual Aramco facility. */
export const DEMO_SITE_FRAME = {
  capacity: 'About 400,000 barrels per day',
  directStaff: 'About 1,200 direct staff',
  contractors: '1,500 to 3,000 contractors during turnarounds',
  state: 'Turnaround — full contractor load',
};
