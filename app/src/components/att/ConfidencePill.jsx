/**
 * ConfidencePill — one confidence score, tiered the way the platform tiers it.
 *
 * The colour is not decoration: it is the auto-resolve decision. Green means
 * the platform would resolve this without a human, amber means it routes to an
 * operator, red means SME escalation. Using the admin's own thresholds here
 * (rather than an arbitrary 80/60 split) is what makes the operator's table and
 * the admin's slider the same story told twice.
 */
import { THRESHOLD_DEFAULTS } from '../../data/att/_shared/constants';

export default function ConfidencePill({ value, thresholds = THRESHOLD_DEFAULTS, size = 'md', showTier = false }) {
  if (value == null) return null;
  const n = typeof value === 'string' ? parseFloat(value) : value;

  const tier = n >= thresholds.high ? 'high' : n >= thresholds.medium ? 'medium' : 'low';
  const style = {
    high: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-rose-50 text-rose-700 border-rose-200',
  }[tier];
  const tierLabel = { high: 'Auto-resolve', medium: 'Operator review', low: 'SME escalation' }[tier];
  const sizing = size === 'sm' ? 'text-[9.5px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5';

  return (
    <span
      title={`${n}% — ${tierLabel} tier (high ≥${thresholds.high}%, medium ${thresholds.medium}–${thresholds.high - 1}%)`}
      className={`inline-flex items-center gap-1 rounded-full border font-bold tabular-nums whitespace-nowrap ${style} ${sizing}`}
    >
      {n}%
      {showTier && <span className="font-medium opacity-75">· {tierLabel}</span>}
    </span>
  );
}
