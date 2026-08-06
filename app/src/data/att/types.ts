/**
 * AI Billing Workbench — data contracts (spec §12).
 *
 * The interfaces the spec names, plus the ones the ported prototype actually
 * needs. Every accessor in `billing-operator/index.js` and
 * `platform-admin/index.js` returns one of these shapes, so pointing an
 * accessor at a live feed later is a change in that file and nowhere else.
 *
 * All figures are illustrative. There is no named customer and no real public
 * backdrop behind this demo — see the Data Sources screen.
 */

/** One of the six bulk-resolvable anomaly groups (spec §6A). */
export interface AnomalyPattern {
  id: string;
  name: string;
  description: string;
  impactedAccounts: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  averageConfidence: number;
  totalFinancialDelta: number;
  rootCause: string;
  rootCauseTag: string;
  detectedDate: string;
  chargeType: string;
  estimatedResolutionTime: string;
  priority: 'Critical' | 'High' | 'Medium';
  severity: 'critical' | 'warning' | 'info';
  /** Downstream effect the fix prevents; only the hero pattern carries one. */
  projectedCallsPrevented?: number;
  projectedHoldHours?: number;
  dataSource: string;
  action: string;
}

/** One row of a pattern's impacted-accounts table. */
export interface ImpactedAccount {
  id: string;
  name: string;
  currentAmount: number;
  correctedAmount: number;
  confidence: number;
}

/** An agent in either fleet — the 4 pipeline agents or the 5 charge-type ones. */
export interface AgentHealth {
  id: string;
  name: string;
  description: string;
  status: 'healthy' | 'warning' | 'critical';
  accuracy: number;
  latencyMs: number;
  errorRate: number;
  lastRunLabel: string;
}

/** A row in the Resolution History audit log. */
export interface ResolutionRecord {
  id: string;
  accountId: string;
  issue: string;
  action: string;
  confidenceTier: 'High' | 'Medium' | 'Low';
  user: string;
  timestamp: string;
  rebillId: string;
  beforeAmount: string;
  afterAmount: string;
  status: 'Completed' | 'Closed' | 'Escalated' | 'Deferred';
}

/** A stage on the detection-to-BRN pipeline rail (spec §15). */
export interface PipelineStage {
  name: string;
  percentage: number;
  status: 'complete' | 'active' | 'pending';
  description: string;
}
