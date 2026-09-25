/**
 * Spec §12 "Data strategy": one TypeScript interface per mock source, with
 * the spec's own field names. The components read these shapes through the
 * getters in ./index.ts, so a live feed can replace a getter later with no
 * change to the components.
 */

export interface Signal {
  id: string;
  title: string;
  severity: 'critical' | 'warning';
  bucket: string;
  description: string;
  source: string;
  action: string;
}

export interface Kpi {
  id: string;
  name: string;
  value: string;
  illustrative: boolean;
  trend: 'up' | 'down' | 'stable' | 'mixed';
  target: string;
  source: string;
  calc: string;
}

export interface PortfolioLimit {
  id: string;
  portfolio: string;
  /** $M */
  balance: number;
  pctOfNetWorth: number;
  /** % of net worth */
  cap: number;
  /** $M left before the cap */
  headroom: number;
}

export interface SegmentDelinquency {
  id: string;
  segment: string;
  /** 60-day delinquency today, % */
  before: number;
  /** projected 60-day delinquency under the scenario, % */
  after: number;
}

export interface ShockScenario {
  scenario: string;
  days: number;
  membersAffectedPct: number;
  depositDrawdownPct: number;
  paymentDelayPct: number;
  delinquencyBySegment: SegmentDelinquency[];
  /** $M */
  lossOverTwoQuarters: number;
  netWorthAfter: number;
}

export interface CapitalLiquidity {
  netWorthBefore: number;
  netWorthAfter: number;
  earlyWarning: number;
  /** $M to spare over projected quarter outflows */
  liquiditySurplusBefore: number;
  liquiditySurplus: number;
  loanToShareBefore: number;
  loanToShareAfter: number;
  /** funding-review trigger, loan-to-share % */
  trigger: number;
  reconciliation: Array<{ id: string; layer: string; system: string; netWorth: number; ratio: number }>;
}

export interface PlaybookAction {
  band: string;
  range: string;
  action: string;
  recommendedFlag: boolean;
}

export interface SegDeposit {
  id: string;
  seg: string;
  /** $M this month */
  amount: number;
  /** accounts this month */
  count: number;
  countChange: number;
  /** % month over month */
  momChange: number;
  triggered: boolean;
}
