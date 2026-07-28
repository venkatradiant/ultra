/**
 * Newfold Digital — shared demo constants.
 *
 * The two incident threads that run through all seven personas. Per the spec,
 * names, amounts, and timestamps MUST stay consistent across every persona's
 * flows and every governance fixture. Import from here rather than re-typing.
 */

// ─── Thread A: the renewal spike ────────────────────────────────────
// Network Solutions price-increase + auto-renewal batch. Drives Sofia (ops),
// Marisol (director), Tomas (workforce), Aisha (quality), and Arjun (governance).
export const RENEWAL_SPIKE = {
  brand: 'Network Solutions',
  batchCustomers: 240000, // price-increase + auto-renewal notice recipients
  sendTime: '7:15 AM',
  volumeMultiplier: '3.1x', // billing queue vs. normal within 2 hours
  noticeToCare: false, // no advance notification to care operations
  priorBatchDate: 'April 18',
  priorMultiplier: '1.9x',
  priceIncreaseHandleTime: '12:40', // vs. 8:50 standard billing
  standardHandleTime: '8:50',
};

// ─── Thread B: the site-down (Grace Bello) ──────────────────────────
// Failed hosting renewal → suspension. Drives Grace (self-service) and
// Jordan (agent-assist). Same reasoning, at the point of contact.
export const SITE_DOWN = {
  customer: 'Grace Bello',
  brand: 'Bluehost',
  business: 'florist and online shop',
  renewalAmount: '$203.88',
  netAfterCredit: '$178.88', // after 6-year loyalty credit
  renewalDate: 'November 24',
  dunningNotices: 4,
  dunningToOutdatedEmail: true,
  gracePeriodDays: 15,
  tenureYears: 6,
  restoreMinutes: 15,
  reactivationWindowDays: 4,
};

// ─── The portfolio (brand-context selector) ─────────────────────────
// Cross-brand roll-up is the default; the selector narrows per brand.
export const BRANDS = [
  { id: 'all', name: 'All Brands (Cross-Brand Roll-up)' },
  { id: 'bluehost', name: 'Bluehost' },
  { id: 'network_solutions', name: 'Network Solutions' },
  { id: 'web_com', name: 'Web.com' },
  { id: 'hostgator', name: 'HostGator' },
  { id: 'crazy_domains', name: 'Crazy Domains' },
];

// The eight connected data sources (spec Table 69), scaled to ~7M customers.
export const DATA_SOURCE_RECORD_COUNTS = {
  serviceCloud: 2600000,
  billing: 9400000,
  domain: 12100000,
  hosting: 4300000,
  customer360: 6900000,
  marketing: 1400000,
  itMonitoring: 58000,
  workforceSnowflake: 620000,
};
