/**
 * AI Billing Workbench — Platform Admin data accessors.
 *
 * Same seam as the operator's (spec §12): async getters over frozen fixtures,
 * so a live agent-runtime feed or a real model registry replaces a fixture here
 * and nowhere else.
 *
 * Note the deliberate overlap with the operator's data. The admin's
 * root-cause distribution and the operator's six patterns describe the same
 * cycle from two altitudes — that is the point of the two-persona demo, and it
 * is why the numbers have to reconcile: System Sync at 45% is the category the
 * operator's largest pattern belongs to.
 */

import agentFleet from './agentFleet.json';
import observability from './observability.json';
import adminConsole from './adminConsole.json';
import kpis from './kpis.json';
import signals from './signals.json';
import currentState from './currentState.json';
import journey from './journey.json';
import dataSources from '../_shared/dataSources.json';
import pipeline from '../_shared/pipeline.json';
import { CYCLE, THRESHOLD_DEFAULTS } from '../_shared/constants';

/** The four pipeline agents: detect, score, explain, resolve. */
export async function getAgentFleet() {
  return agentFleet;
}

/** One agent by id, or null. */
export async function getAgent(agentId) {
  return agentFleet.find((a) => a.id === agentId) || null;
}

/** Fleet metrics, accuracy/latency/failure series, root causes, retrain history. */
export async function getObservability() {
  return observability;
}

/** Root-cause categories with counts and shares (totals 202). */
export async function getRootCauseDistribution() {
  return observability.rootCauseDistribution;
}

/** Model versions from v2.4.1 back to v2.2.5, with the lift each delivered. */
export async function getRetrainingHistory() {
  return observability.retrainingHistory;
}

/** KPI tiles, thresholds, cycle config, retraining panel and advanced settings. */
export async function getAdminConsole() {
  return adminConsole;
}

/** Just the confidence-tier configuration and its copy. */
export async function getThresholds() {
  return adminConsole.thresholds;
}

/** Cycle, SLA window and instance selection. */
export async function getCycleConfig() {
  return adminConsole.cycleConfig;
}

/** The retraining forecast panel: quality, corrections, improvement areas. */
export async function getRetraining() {
  return adminConsole.retraining;
}

/** Nine toggles across three groups. */
export async function getAdvancedSettings() {
  return adminConsole.advancedSettings;
}

/** The eight platform KPIs shown in the workspace's stats row. */
export async function getKpis() {
  return kpis;
}

/** The five admin priority signal cards (spec §6B). */
export async function getSignals() {
  return signals;
}

/** Connected systems, shared with the operator. */
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

/** The shipped threshold defaults, before any in-session change. */
export async function getThresholdDefaults() {
  return THRESHOLD_DEFAULTS;
}

/** How tuning happens without the console, and the four interventions (§8B). */
export async function getCurrentState() {
  return currentState;
}

/** The admin's notice → diagnose → decide journey (spec §9B). */
export async function getJourney() {
  return journey;
}
