/**
 * TrackLynk.AI — Aramco reference demo: the narrative spine.
 *
 * Cross-cutting facts that must not drift between the conversation script, the
 * KPI tiles, the site map, the reconciliation panel and the muster board. If a
 * number appears in more than one place, it is defined here once.
 *
 * DATA POSTURE — read this before changing anything:
 *   • ARAMCO_PUBLIC_FACTS are real and sourced to the Aramco FY2025 Annual Report.
 *   • EVERYTHING ELSE is illustrative. Permit counts, headcounts, near-misses and
 *     muster times are realistic but invented, and are not Aramco data. Aramco is
 *     used as the archetypal downstream target, not a current customer.
 *   • Telemetry is vendor-agnostic: "location and tag data" never names a vendor.
 */

/** Real, public, sourced. Safe to show. (Aramco FY2025 Annual Report.) */
export const ARAMCO_PUBLIC_FACTS = [
  { label: 'Founded', value: '1933, headquartered in Dhahran, Saudi Arabia' },
  { label: 'Public listing', value: 'Listed on the Saudi Exchange (Tadawul) since 2019' },
  { label: 'Total hydrocarbon production', value: '12.9 million barrels of oil equivalent per day (2025)' },
  { label: 'Net refining capacity', value: '4.2 million barrels per day' },
  { label: 'Chemicals capacity', value: 'About 59 million tons per year' },
  { label: 'Total recordable case rate', value: '0.028 per 200,000 work hours (2025), improved from 0.046' },
  { label: 'Supply reliability', value: '99.9%' },
  { label: 'Workforce', value: 'About 70,000 employees globally' },
];

export const PUBLIC_FACTS_SOURCE = 'Aramco FY2025 Annual Report';

/** The demo site. Illustrative — not an actual Aramco facility. */
export const SITE_FRAME = {
  name: 'Refining and Petrochemical Complex',
  capacity: 'About 400,000 barrels per day',
  directStaff: 1200,
  contractorRange: '1,500 to 3,000 during turnarounds',
  state: 'Turnaround — full contractor load',
  illustrative: true,
};

/**
 * The single reconciled headcount, and the three disagreeing sources behind it.
 * Demo Step 4 is built on these exact numbers; the muster board in Step 6 counts
 * against RECONCILED and inherits the same 28 exceptions.
 */
export const HEADCOUNT = {
  gate: 2440,
  permit: 2400,
  timesheets: 2380,
  reconciled: 2412,
  unmatched: 28,
  method: 'Badge-ins matched to live location signal; unmatched badge-ins held as exceptions.',
};

/** Turnaround load, as quoted in the Step 1 briefing. */
export const PERMIT_LOAD = {
  active: 450,
  highRisk: 60,
  normalDay: 150,
  flaggedInHazardZone: 3,
};

/** The four risk buckets every finding is framed in. Order is deliberate. */
export const RISK_BUCKETS = ['safety', 'health', 'equipment', 'compliance'];

/** The confined-space entry that Step 3 drills into. */
export const CONFINED_SPACE = {
  permitId: 'CS-1182',
  zone: 'Unit 3 — Coker',
  entrants: 2,
  maxEntrants: 2,
  gasTestAgeMinutes: 14,
  gasTestIntervalMinutes: 15,
  standbyConfirmed: true,
};

/** Muster, Step 6. Counts resolve against HEADCOUNT.reconciled. */
export const MUSTER = {
  accounted: 2384,
  total: 2412,
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
