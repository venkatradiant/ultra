/**
 * Typed shapes for the CRO's fraud fixtures (spec §12's data strategy).
 *
 * The point of these is the swap the spec asks for: everything here is Tier 1
 * mock data today, and a live fraud feed later has to be able to take its place
 * without any component changing. That only holds if the components consume a
 * declared shape rather than whatever happens to be in the JSON, so these are
 * the contract — and `esfcuCroData.test.ts` checks the fixtures against it.
 *
 * `provenance` is the honest-data marker, three-state because a real published
 * benchmark that is not about ESFCU is neither "real" nor "made up". See
 * components/esfcu/shared/provenance.js.
 */

export type Provenance = 'esfcu' | 'industry' | 'illustrative';

/** good | warning | critical — the trust strip's whole vocabulary. */
export type TrustState = 'good' | 'warning' | 'critical';

/** Every exhibit-grade fixture carries these, per spec §15a. */
export interface Sourced {
  source: string;
  as_of: string;
  confidence: number;
  provenance: Provenance;
}

export interface FraudCase {
  id: string;
  type: string;
  channel: string;
  amount: number;
  amount_display: string;
  status: string;
  memberId: string;
  /** Receiving-account ids — these are linkGraph.json node ids, not free text. */
  linkedAccounts: string[];
  score: number;
  state: TrustState;
  disposition: string;
  source: string;
  asOf: string;
}

export interface Alert {
  id: string;
  channel: string;
  score: number;
  amount: number;
  amount_display: string;
  rule: string;
  likelyFraud: boolean;
  isFalsePositive: boolean;
  /** The queue's own ordering — recency and raw amount. */
  rankBefore: number;
  /** After the AI re-rank by real-fraud likelihood. */
  rankAfter: number;
  /** rankBefore − rankAfter. Positive means the alert moved up. */
  movement: number;
  note: string;
  source: string;
  asOf: string;
}

export interface CoverageItem {
  book: string;
  inScope: number;
  scored: number;
  pctScored: number;
  gap: number;
  gapReason: string;
  state: TrustState;
  lineage: string[];
}

export interface TrustWidget {
  state: TrustState;
  summary: string;
  detail: string;
  /** Present when the figure is not yet safe to put in front of a committee. */
  cite_warning?: string;
}

export interface SarItem {
  id: string;
  caseId: string;
  type: string;
  daysToDeadline: number;
  state: TrustState;
  status: string;
  source: string;
  asOf: string;
}

/** A node in the receiving-account link graph. */
export interface GraphNode {
  id: string;
  type: 'member' | 'receiver' | 'hop';
  label: string;
  sublabel: string;
  state: TrustState;
  amount?: number;
  cases?: number;
  opened?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
}
