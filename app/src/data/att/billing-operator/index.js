/**
 * AI Billing Workbench — Billing Operator data accessors.
 *
 * The ONLY seam between the views and the data (spec §12: "every source is a
 * pre-authored mock behind the Ultra data layer, so components can swap to a
 * live feed later with no change"). Every accessor is async and returns a
 * frozen fixture today; pointing one at a live anomaly service or a rebilling
 * sandbox is a change here and nowhere else.
 *
 * The impacted-account rows are ported from the source prototype's own
 * deterministic generator rather than regenerated, so the numbers a viewer
 * checks against the live demo agree exactly: PATTERN-001 is 87 rows summing to
 * $850.14 at 92.7% average confidence, 17 of them below 90%.
 */

import patterns from './patterns.json';
import impactedAccounts from './impactedAccounts.json';
import resolutionHistory from './resolutionHistory.json';
import dashboard from './dashboard.json';
import anomalyExplorer from './anomalyExplorer.json';
import kpis from './kpis.json';
import signals from './signals.json';
import currentState from './currentState.json';
import journey from './journey.json';
import dataSources from '../_shared/dataSources.json';
import pipeline from '../_shared/pipeline.json';
import { CYCLE, SLA, CYCLE_OVERVIEW, BUSINESS_IMPACT } from '../_shared/constants';

/** The six bulk-resolvable anomaly patterns, in the order the demo presents them. */
export async function getPatterns() {
  return patterns;
}

/** One pattern by id, or null. */
export async function getPattern(patternId) {
  return patterns.find((p) => p.id === patternId) || null;
}

/** The hero pattern — Missing AutoPay Discount. */
export async function getHeroPattern() {
  return patterns.find((p) => p.hero) || patterns[0];
}

/** Every impacted-account row, keyed by pattern id. */
export async function getImpactedAccounts() {
  return impactedAccounts;
}

/** The rows for one pattern (empty array if the pattern has none). */
export async function getImpactedAccountsFor(patternId) {
  return impactedAccounts[patternId] || [];
}

/** The audit log: five resolutions plus the summary tiles above them. */
export async function getResolutionHistory() {
  return resolutionHistory;
}

/** KPI tiles, charts, risk heatmap and micro-agent rows for the Dashboard. */
export async function getDashboard() {
  return dashboard;
}

/** The Anomaly Explorer's filterable row set. */
export async function getAnomalyExplorer() {
  return anomalyExplorer;
}

/** The eight cycle KPIs shown in the workspace's stats row. */
export async function getKpis() {
  return kpis;
}

/** The six pattern signal cards (spec §6A). */
export async function getSignals() {
  return signals;
}

/** Connected systems, vendor-agnostic per spec §2. */
export async function getDataSources() {
  return dataSources;
}

/** The nine-stage detection-to-BRN rail (spec §15). */
export async function getPipeline() {
  return pipeline;
}

/** Cycle id, window, instance and status. */
export async function getCycle() {
  return CYCLE;
}

/** The frozen 36-hour SLA state: 24.3 elapsed, 11.7 remaining. */
export async function getSla() {
  return SLA;
}

/** The four cycle-overview cards plus the business-impact strip. */
export async function getCycleOverview() {
  return { ...CYCLE_OVERVIEW, sla: SLA, businessImpact: BUSINESS_IMPACT };
}

/** How a cycle is cleared today, and the five interventions (spec §8A). */
export async function getCurrentState() {
  return currentState;
}

/** The operator's four-phase cycle journey and its traceability (spec §9A). */
export async function getJourney() {
  return journey;
}
