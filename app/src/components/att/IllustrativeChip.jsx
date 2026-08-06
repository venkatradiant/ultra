/**
 * IllustrativeChip + ProvenanceLine — the trust furniture for the Workbench.
 *
 * Spec §2 is unambiguous: there is no named customer and no real public
 * backdrop behind this demo, so every figure is representative. A demo whose
 * whole subject is "can I trust this number?" cannot afford to be vague about
 * which of its own numbers are invented — so no metric, pattern card or table
 * total ships without one of these beside it.
 */
import { Info } from 'lucide-react';

export default function IllustrativeChip({ note, size = 'md', className = '' }) {
  const sizing = size === 'sm' ? 'text-[9px] px-1.5 py-0.5 gap-0.5' : 'text-[10px] px-2 py-0.5 gap-1';
  return (
    <span
      title={note || 'Illustrative figure — a representative consumer telecom, not a named customer.'}
      className={`inline-flex items-center rounded-full border border-border bg-surface-2 text-text-subtle font-medium whitespace-nowrap ${sizing} ${className}`}
    >
      <Info className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      Illustrative data
    </span>
  );
}

/** Source + freshness under a figure. `note` carries anything unusual. */
export function ProvenanceLine({ source, freshness, note, className = '' }) {
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
      {note && <span className="block mt-0.5 italic">{note}</span>}
    </p>
  );
}
