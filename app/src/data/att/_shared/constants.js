/**
 * Cycle context shared by both personas.
 *
 * Static fixture, not a live clock: the SLA figures below are the demo's frozen
 * "11.7 hours remaining" state, so the story reads the same on every run. A
 * live clock would drift out of the scripted conversation within a day.
 *
 * Every value is illustrative (spec §2).
 */

export const CYCLE = {
  id: '2026-02',
  window: 'Feb 12 – Mar 11, 2026',
  instance: 'Consumer-East-02',
  status: 'Under Review',
  instances: ['Consumer East-01', 'Consumer East-02', 'Consumer West-01'],
};

/** The 36-hour BRN review window, frozen mid-cycle. */
export const SLA = {
  windowHours: 36,
  elapsedHours: 24.3,
  remainingHours: 11.7,
  percentage: 67.5,
};

/** The cycle-overview figures the operator sees first (spec §7A). */
export const CYCLE_OVERVIEW = {
  totalAnomalies: 207,
  patternedAnomalies: 207,
  patternsDetected: 6,
  totalAccounts: '12,487,233',
  totalFinancialImpact: 4850,
  averageConfidence: 91.6,
};

/** Modeled downstream effect of this cycle's resolutions (spec §7A). */
export const BUSINESS_IMPACT = [
  { id: 'call_volume', value: '-34%', label: 'Call Volume', positive: true },
  { id: 'calls_prevented', value: '2,847', label: 'Calls Prevented', positive: true },
  { id: 'hours_saved', value: '1,240', label: 'Hours Saved', positive: true },
  { id: 'ops_efficiency', value: '85%', label: 'Ops Efficiency', positive: true },
  { id: 'cost_savings', value: '$892K', label: 'Cost Savings', positive: true },
];

/** Product identity (spec §12). The client is AT&T; the Workbench is the brand. */
export const WORKBENCH = {
  name: 'AI Billing Workbench',
  subtitle: 'Enterprise Anomaly Platform',
};

/** Confidence tiers that govern auto-resolution (spec §6B). Admin-tunable. */
export const THRESHOLD_DEFAULTS = {
  high: 90,
  medium: 70,
};
