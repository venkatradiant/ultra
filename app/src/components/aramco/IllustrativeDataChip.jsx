/**
 * IllustrativeDataChip + ProvenanceLine — the trust furniture.
 *
 * The demo's whole claim is that every number is traceable, so no metric, alert
 * or AI-rendered card in this market ships without one of these next to it:
 *   • IllustrativeDataChip — this figure is invented, not Aramco data.
 *   • ProvenanceLine       — where the figure came from and how fresh it is.
 */
import { Info } from 'lucide-react';

/**
 * Marks a figure as illustrative. `note` explains anything unusual (e.g. a KPI
 * that is deliberately unmeasured rather than invented).
 */
export default function IllustrativeDataChip({ note, size = 'md', className = '' }) {
  const sizing = size === 'sm' ? 'text-[9px] px-1.5 py-0.5 gap-0.5' : 'text-[10px] px-2 py-0.5 gap-1';
  return (
    <span
      title={note || 'Illustrative figure — not actual Aramco data.'}
      className={`inline-flex items-center rounded-full border border-border bg-surface-2 text-text-subtle font-medium whitespace-nowrap ${sizing} ${className}`}
    >
      <Info className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      Illustrative data
    </span>
  );
}

/** Source + freshness, and optionally a reconciliation note, under a figure. */
export function ProvenanceLine({ source, freshness, reconciled = false, note, className = '' }) {
  if (!source && !freshness) return null;
  return (
    <p className={`text-[10px] text-text-subtle leading-snug ${className}`}>
      {source && (
        <>
          <span className="font-medium text-text-muted">Source:</span> {source}
        </>
      )}
      {source && freshness ? ' · ' : ''}
      {freshness && (
        <>
          <span className="font-medium text-text-muted">Updated:</span> {freshness}
        </>
      )}
      {reconciled && <span className="ml-1 font-semibold text-emerald-700">· Reconciled</span>}
      {note && <span className="block mt-0.5 italic">{note}</span>}
    </p>
  );
}
