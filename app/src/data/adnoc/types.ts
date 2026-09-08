/**
 * TrackLynk.AI data contracts (Tier 1).
 *
 * These mirror the schemas in the persona/demo specification so the mock JSON
 * fixtures and a future live feed describe the same shapes. The accessors in
 * `hse-gm/index.js` return these; components consume the accessors and never
 * import a fixture directly, so swapping a fixture for an HTTP call is a change
 * to one module rather than to every view.
 */

export type RiskBucket = 'safety' | 'health' | 'equipment' | 'compliance';
export type HazardLevel = 'high' | 'medium' | 'low';
export type PermitType = 'hot-work' | 'confined-space' | 'work-at-height' | 'general';
export type PermitStatus = 'valid' | 'expired' | 'breached';

export interface Worker {
  id: string;
  role: 'staff' | 'contractor';
  zoneId: string;
  lastSeen: string;
  source: 'gate' | 'location';
}

export interface Permit {
  id: string;
  type: PermitType;
  zoneId: string;
  validFrom: string;
  validTo: string;
  conditions: string[];
  status: PermitStatus;
}

export interface Zone {
  id: string;
  name: string;
  hazard: HazardLevel;
  /** Plan-view geometry, in the site map's own viewBox units. */
  x: number;
  y: number;
  w: number;
  h: number;
  people: number;
  permits: number;
  highRiskPermits: number;
}

export interface Signal {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  bucket: RiskBucket;
  source: string;
}

export interface Kpi {
  id: string;
  label: string;
  value: string;
  trend: string;
  direction: 'up' | 'down' | 'stable' | 'watch' | 'unknown';
  target: string;
  source: string;
  calculation: string;
  freshness: string;
  illustrative: boolean;
  chipText?: string | null;
}

export interface MusterRecord {
  workerId: string;
  zoneId: string;
  accountedFor: boolean;
  lastKnownZoneId: string;
}

/** Provenance every figure on screen must be able to show. */
export interface Provenance {
  source: string;
  freshness: string;
  illustrative: boolean;
  reconciled?: boolean;
}
