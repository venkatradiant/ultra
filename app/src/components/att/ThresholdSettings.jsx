/**
 * ThresholdSettings — the three tiers that decide what a human sees.
 *
 * The sliders move and the projection under them recalculates from the actual
 * pattern confidences, so raising High to 92% visibly pushes Duplicate Device
 * Installments (92%) onto the boundary and Plan Migration (85%) into review.
 * A demo where the control moves and nothing downstream changes teaches that
 * the control does not matter — which is the opposite of this console's claim.
 *
 * State is in-session only: it resets on reload, and the copy says so rather
 * than implying a save that did not happen.
 */
import { useMemo, useState } from 'react';
import { SlidersHorizontal, ArrowRight } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getPatterns } from '../../data/att/billing-operator';
import IllustrativeChip from './IllustrativeChip';

function Tier({ label, value, tone, children, note }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-2/40 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="text-[12px] font-semibold text-text">{label}</span>
        <span className={`text-[15px] font-bold tabular-nums ${tone}`}>{value}</span>
      </div>
      {children}
      <p className="text-[10.5px] text-text-subtle mt-2 leading-snug">{note}</p>
    </div>
  );
}

export default function ThresholdSettings({ config, onChange = null }) {
  const patterns = useAsyncData(getPatterns);
  const [high, setHigh] = useState(config?.high ?? 90);
  const [medium, setMedium] = useState(config?.medium ?? 70);

  const projection = useMemo(() => {
    if (!patterns) return null;
    const acc = { auto: 0, review: 0, sme: 0, autoPatterns: [], reviewPatterns: [], smePatterns: [] };
    patterns.forEach((p) => {
      const bucket = p.averageConfidence >= high ? 'auto' : p.averageConfidence >= medium ? 'review' : 'sme';
      acc[bucket] += p.impactedAccounts;
      acc[`${bucket}Patterns`].push(p);
    });
    return acc;
  }, [patterns, high, medium]);

  const set = (nextHigh, nextMedium) => {
    setHigh(nextHigh);
    setMedium(nextMedium);
    if (onChange) onChange({ high: nextHigh, medium: nextMedium });
  };

  const copy = config?.copy || {};
  const highRange = config?.highRange || { min: 85, max: 99 };
  const mediumRange = config?.mediumRange || { min: 60, max: 85 };
  const changed = high !== (config?.high ?? 90) || medium !== (config?.medium ?? 70);

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h3 className="inline-flex items-center gap-1.5 text-[13px] font-bold text-text tracking-tight">
            <SlidersHorizontal className="w-4 h-4 text-brand" /> Confidence Threshold Settings
          </h3>
          <p className="text-[11px] text-text-subtle mt-0.5">
            Every anomaly an operator auto-resolves does so because these numbers said it was safe.
          </p>
        </div>
        <IllustrativeChip />
      </div>

      <div className="space-y-3">
        <Tier label="High Confidence Threshold" value={`≥${high}%`} tone="text-emerald-700" note={copy.high}>
          <input
            type="range"
            min={highRange.min}
            max={highRange.max}
            value={high}
            onChange={(e) => set(Number(e.target.value), medium)}
            className="w-full accent-[var(--color-brand)] cursor-pointer"
            aria-label="High confidence threshold"
          />
        </Tier>

        <Tier
          label="Medium Confidence Threshold"
          value={`${medium}–${high - 1}%`}
          tone="text-amber-700"
          note={copy.medium}
        >
          <input
            type="range"
            min={mediumRange.min}
            max={Math.min(mediumRange.max, high - 1)}
            value={medium}
            onChange={(e) => set(high, Number(e.target.value))}
            className="w-full accent-[var(--color-brand)] cursor-pointer"
            aria-label="Medium confidence threshold"
          />
        </Tier>

        <Tier label="Low Confidence Threshold" value={`<${medium}%`} tone="text-rose-700" note={copy.low} />
      </div>

      {projection && (
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-2.5">
            Projected review load — this cycle&apos;s 207 anomalies at these thresholds
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'auto', label: 'Auto-resolve', n: projection.auto, list: projection.autoPatterns, tone: 'text-emerald-700', bg: 'bg-emerald-500/[0.08]' },
              { id: 'review', label: 'Operator review', n: projection.review, list: projection.reviewPatterns, tone: 'text-amber-700', bg: 'bg-amber-500/[0.08]' },
              { id: 'sme', label: 'SME escalation', n: projection.sme, list: projection.smePatterns, tone: 'text-rose-700', bg: 'bg-rose-500/[0.08]' },
            ].map((b) => (
              <div key={b.id} className={`rounded-xl p-3 min-w-0 ${b.bg}`}>
                <p className={`text-xl font-bold leading-none tabular-nums ${b.tone}`}>{b.n}</p>
                <p className="text-[10px] text-text-muted mt-1.5 leading-snug">{b.label}</p>
                <p className="text-[9.5px] text-text-subtle mt-1.5 leading-snug">
                  {b.list.length ? b.list.map((p) => p.name).join(', ') : '—'}
                </p>
              </div>
            ))}
          </div>

          {changed && (
            <p className="inline-flex items-start gap-1.5 text-[11px] text-text-muted mt-3 leading-relaxed">
              <ArrowRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-brand" />
              Changed from ≥{config?.high}% / {config?.medium}–{(config?.high ?? 90) - 1}%. In-session only —
              this resets on reload, and the change would apply to anomalies scored from the save onward
              rather than retroactively to work an operator has already reviewed.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
