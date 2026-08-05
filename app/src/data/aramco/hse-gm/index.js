/**
 * TrackLynk.AI — HSE GM data accessors.
 *
 * The ONLY seam between the views and the data. Every accessor is async and
 * returns a frozen fixture today; pointing one at a live endpoint later is a
 * change here and nowhere else. This mirrors the getter pattern the NFCU
 * governance components use, so the same `getter`-prop injection works for
 * tests and for a second client on the same components.
 *
 * Nothing in this module transforms data for presentation — the fixtures are
 * already in the shape the components consume (see ../types.ts).
 */

import siteData from './siteData.json';
import permits from './permits.json';
import reconciliation from './reconciliation.json';
import muster from './muster.json';
import actions from './actions.json';
import kpis from './kpis.json';
import signals from './signals.json';
import currentState from './currentState.json';
import journey from './journey.json';
import dataSources from '../_shared/dataSources.json';

/** The site plan: zones, per-zone headcount and permit load, flagged jobs. */
export async function getSiteData() {
  return siteData;
}

/** Just the three permit violations, ranked. */
export async function getFlaggedJobs() {
  return siteData.flaggedJobs;
}

/** Zones only — for the map and the muster board's zone coverage. */
export async function getZones() {
  return siteData.zones;
}

/** CS-1182 confined-space entry plus the permits behind the flagged jobs. */
export async function getPermits() {
  return permits;
}

/** Three headcount sources resolving to one figure, with the held exceptions. */
export async function getReconciliation() {
  return reconciliation;
}

/** Live muster: per-point accounting, the unaccounted groups, the projection. */
export async function getMuster() {
  return muster;
}

/** The prioritized actions for before the night shift. */
export async function getActions() {
  return actions;
}

/** The eight HSE KPIs, each with source, calculation and freshness. */
export async function getKpis() {
  return kpis;
}

/** The three priority signal cards. */
export async function getSignals() {
  return signals;
}

/** Connected data sources, vendor-agnostic where the spec requires it. */
export async function getDataSources() {
  return dataSources;
}

/** How high-risk work runs today, plus where TrackLynk intervenes (spec §8). */
export async function getCurrentState() {
  return currentState;
}

/** The GM's turnaround-day journey and its traceability to signals (spec §9). */
export async function getJourney() {
  return journey;
}
