/**
 * TrackLynk.AI — ADNOC reference demo: the narrative spine.
 *
 * Cross-cutting facts that must not drift between the conversation script, the
 * KPI tiles, the site map, the reconciliation panel and the muster board. If a
 * number appears in more than one place, it is defined here once.
 *
 * DATA POSTURE — read this before changing anything:
 *   • ADNOC_PUBLIC_FACTS are real and sourced to the ADNOC public disclosures (adnoc.ae — Key Facts).
 *   • EVERYTHING ELSE is illustrative. Permit counts, headcounts, near-misses and
 *     muster times are realistic but invented, and are not ADNOC data. ADNOC is
 *     used as the archetypal downstream target, not a current customer.
 *   • Telemetry is vendor-agnostic: "location and tag data" never names a vendor.
 */

/** Real, public, sourced. Safe to show. (ADNOC public disclosures (adnoc.ae — Key Facts).) */
export const ADNOC_PUBLIC_FACTS = [
  { label: 'Founded', value: '1971, headquartered in Abu Dhabi, United Arab Emirates' },
  { label: 'Ownership', value: 'Wholly owned by the Abu Dhabi Government' },
  { label: 'Oil production capacity', value: '4.85 million barrels per day' },
  { label: 'Natural gas', value: '11.5 billion cubic feet per day' },
  { label: 'Offshore footprint', value: 'Nine established fields, six artificial islands, three natural islands and eight offshore super complexes' },
  { label: 'Offshore structures', value: 'More than 400' },
];

export const PUBLIC_FACTS_SOURCE = 'ADNOC public disclosures (adnoc.ae — Key Facts)';

/** The demo site. Illustrative — not an actual ADNOC facility. */
export const SITE_FRAME = {
  name: 'Ruwais Industrial Complex',
  capacity: 'About 817,000 barrels per day',
  directStaff: 1850,
  contractorRange: '1,500 to 4,100 during turnarounds',
  state: 'Turnaround — full contractor load',
  illustrative: true,
};

/**
 * The single reconciled headcount, and the three disagreeing sources behind it.
 * Demo Step 4 is built on these exact numbers; the muster board in Step 6 counts
 * against RECONCILED and inherits the same 28 exceptions.
 */
export const HEADCOUNT = {
  gate: 3255,
  permit: 3200,
  timesheets: 3168,
  reconciled: 3180,
  unmatched: 34,
  method: 'Badge-ins matched to live location signal; unmatched badge-ins held as exceptions.',
};

/** Turnaround load, as quoted in the Step 1 briefing. */
export const PERMIT_LOAD = {
  active: 567,
  highRisk: 78,
  normalDay: 190,
  flaggedInHazardZone: 3,
};

/** The four risk buckets every finding is framed in. Order is deliberate. */
export const RISK_BUCKETS = ['safety', 'health', 'equipment', 'compliance'];

/** The confined-space entry that Step 3 drills into. */
export const CONFINED_SPACE = {
  permitId: 'CS-1182',
  zone: 'DCU-3 — Delayed Coker',
  entrants: 2,
  maxEntrants: 2,
  gasTestAgeMinutes: 14,
  gasTestIntervalMinutes: 15,
  standbyConfirmed: true,
};

/** Muster, Step 6. Counts resolve against HEADCOUNT.reconciled. */
export const MUSTER = {
  accounted: 2384,
  total: 3180,
  unaccounted: 28,
  elapsedSeconds: 90,
  projectedFullAccountingMinutes: 3,
};

/** Every source name used in `data_sources_used`, kept vendor-agnostic. */
export const SOURCE_NAMES = {
  ptw: 'Permit-to-work system',
  gate: 'Gate access-control',
  location: 'Location and tag data (vendor-agnostic)',
  cctv: 'CCTV and presence',
  timesheets: 'Contractor timesheets',
  actionTracker: 'HSE action tracker',
  maintenance: 'Maintenance work orders',
  hseReporting: 'HSE reporting and statistics',
};

/** Shown wherever a figure is invented. Requirement: label illustrative data. */
export const ILLUSTRATIVE_LABEL = 'Illustrative data';
