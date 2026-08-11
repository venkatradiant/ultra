import { tierFor, colorFor } from '../../../utils/confidence';
import { provenanceOf } from './provenance';

/**
 * Exhibit-grade chrome: title, optional note, a confidence pill, and a footer
 * carrying the source and the as-of date. Spec §15a — "each exhibit shows its
 * source, an as-of date, and a confidence figure."
 *
 * The USSFCU build has the same idea as a module-local helper inside
 * BusinessPerformanceView; here it is a real component because four ESFCU
 * surfaces need it — the two conversation charts, the anomaly list, and the
 * Business Performance page.
 *
 * `provenance` renders the honest-data marker the spec's data posture requires:
 * every exhibit says whether its figures are ESFCU's, the industry's, or made up
 * for the demo. Omitting it marks the exhibit illustrative — the cautious
 * default, so a forgotten prop can never overclaim.
 */
export default function ExhibitCard({
  title,
  note,
  source,
  asOf,
  confidence,
  provenance,
  className = '',
  children,
}) {
  const confColor = confidence != null ? colorFor(tierFor(confidence)) : null;
  const prov = provenanceOf(provenance);
  return (
    <div
      className={`bg-surface rounded-2xl border border-border-subtle p-4 flex flex-col min-w-0 ${className}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-[13px] font-semibold text-text">{title}</h3>
            <span
              className={`rounded px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide ${prov.className}`}
              title={prov.title}
            >
              {prov.label}
            </span>
          </div>
          {note ? <p className="text-[10.5px] text-text-subtle mt-0.5 leading-snug">{note}</p> : null}
        </div>
        {confidence != null ? (
          <span
            className="flex-shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold tabular-nums"
            style={{ color: confColor, background: `${confColor}14` }}
          >
            {confidence}% conf.
          </span>
        ) : null}
      </div>
      <div className="flex-1 min-h-0 min-w-0">{children}</div>
      {(source || asOf) ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border-subtle pt-2">
          <span className="text-[9.5px] text-text-subtle">{source}</span>
          {asOf ? <span className="text-[9.5px] text-text-subtle">as of {asOf}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
