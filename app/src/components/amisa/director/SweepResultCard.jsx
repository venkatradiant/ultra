import { CheckCircle2 } from 'lucide-react';
import AmisaCard from '../shared/AmisaCard';
import { AppliedByRow } from '../shared/AmisaTrustBits';
import { useDirectorState } from '../shared/directorState';
import {
  HR_SURVEY,
  SWEEP_FINDINGS,
  computeValidCount,
  methodologyLine,
} from '../../../data/amisa/_shared/constants';

/**
 * The receipt: what the sweep actually did, once he decided.
 *
 * Reads the same store the sweep card wrote to, so it reports his selection
 * rather than the default. A viewer who unchecks a row and then applies sees
 * this card follow them — which is the difference between a demo that computes
 * and a demo that recites.
 */
export default function SweepResultCard() {
  const { sweep } = useDirectorState();
  const valid = computeValidCount(sweep);
  const excluded = HR_SURVEY.totalResponses - valid;

  return (
    <AmisaCard
      eyebrow="Sweep applied"
      title={`${valid} valid responses, from ${HR_SURVEY.totalResponses}`}
      intro="Every number after this point traces back to this decision."
      source="AMISA Survey Platform · AMISA Audit Log"
      freshness="Just now"
      footer={<AppliedByRow />}
    >
      <ul className="mb-3 space-y-1.5">
        {SWEEP_FINDINGS.map((finding) => {
          const on = !!sweep[finding.key];
          return (
            <li key={finding.key} className="flex items-start gap-2 text-[12px] leading-relaxed">
              <CheckCircle2
                className={`mt-px h-3.5 w-3.5 flex-shrink-0 ${on ? 'text-success' : 'text-text-subtle/50'}`}
                aria-hidden="true"
              />
              <span className={on ? 'text-text' : 'text-text-muted line-through decoration-text-subtle/40'}>
                {finding.label}
                <span className="ml-1.5 text-[11px] text-text-muted no-underline">
                  {on ? finding.action : 'kept'}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-[12.5px]">
        <span className="text-text-muted">
          Excluded <span className="font-semibold text-text">{excluded}</span>
        </span>
        <span className="text-text-muted">
          Remaining <span className="font-semibold text-brand">{valid}</span>
        </span>
      </div>

      <p className="mt-2 text-[11.5px] text-text-muted">{methodologyLine(sweep)}</p>
      <p className="mt-1 text-[12px] font-medium text-text">
        The AI did the sweep. You made the call.
      </p>
    </AmisaCard>
  );
}
