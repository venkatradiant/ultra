import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

/**
 * Component state → styling, in one place so the fleet table, the detail header,
 * the state timeline and the health bars can never disagree about what
 * "degraded" looks like.
 *
 * These four states come from the observability API (ui_api_docs.md) and are
 * new to this codebase — SignalCard/InsightMiniCard speak severity
 * (critical/warning/review/healthy), which is a different vocabulary for a
 * different purpose. Deliberately kept separate rather than forced together.
 *
 * Raw Tailwind palette classes match every sibling component; the semantic
 * --color-success/warning/critical tokens exist but are unused repo-wide, and
 * this page isn't the place to start that migration.
 */
export const STATE_STYLES = {
  healthy: {
    label: 'Healthy',
    icon: CheckCircle2,
    text: 'text-emerald-700',
    pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    row: 'hover:bg-surface-2/50',
    gauge: 'green',
  },
  degraded: {
    label: 'Degraded',
    icon: AlertTriangle,
    text: 'text-amber-700',
    pill: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
    row: 'bg-amber-50/40 hover:bg-amber-50/70',
    gauge: 'amber',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    text: 'text-red-700',
    pill: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
    bar: 'bg-red-500',
    row: 'bg-red-50/40 hover:bg-red-50/70',
    gauge: 'red',
  },
  recovering: {
    label: 'Recovering',
    icon: RefreshCw,
    text: 'text-blue-700',
    pill: 'bg-blue-50 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
    bar: 'bg-blue-500',
    row: 'bg-blue-50/40 hover:bg-blue-50/70',
    gauge: 'amber',
  },
};

/** Case-insensitive, defaulting to healthy — mirrors styleForSeverity's contract. */
export function styleForState(state) {
  return STATE_STYLES[String(state ?? '').toLowerCase()] || STATE_STYLES.healthy;
}

/** Non-healthy first, so an incident sorts to the top of its group. */
export const STATE_PRIORITY = { failed: 0, degraded: 1, recovering: 2, healthy: 3 };

/** Relative time for the event log. Same shape as AuditTrailFeed's helper. */
export function relativeTime(iso) {
  if (!iso) return '';
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** 14:32:08 — the log shows clock time; the header shows relative. */
export function clockTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', { hour12: false });
}
