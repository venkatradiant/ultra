import { Flag } from 'lucide-react';
import DoitCard from '../shared/DoitCard';
import { ConfidenceBadge, EscalationNote } from '../shared/TrustBits';
import { useAdminState } from '../shared/adminState';
import { DATA_QUALITY_FLAG, DATA_QUALITY_FLAG_PCT } from '../../../data/doit/_shared/constants';

/**
 * The restraint card.
 *
 * VOCE found a pattern it could have acted on, and did not — because excluding
 * an eighth of a dataset moves the headline number by three points, and that is a
 * decision with a name on it. The card states what it found, what it would cost
 * either way, and that it is deliberately holding.
 *
 * Note the pattern is genuinely ambiguous: a single IP range is what group
 * completion at a service center looks like AND what bot traffic looks like.
 * Saying so is the point. Confidence is 78 rather than the 90s the other cards
 * carry, and that gap is the honest part.
 */
const ROWS = [
  { label: 'Flagged responses', value: `${DATA_QUALITY_FLAG.responses} of ${DATA_QUALITY_FLAG.total} (${DATA_QUALITY_FLAG_PCT}% of the dataset)` },
  { label: 'Why it flagged', value: 'Same IP range, all inside a 40-minute window' },
  { label: 'Reading', value: 'Ambiguous — consistent with group completion at a service center, and with bot traffic' },
  { label: 'If excluded', value: 'Satisfaction for this survey moves by about 3 points' },
];

export default function DataQualityFlagCard() {
  const { flagDisposition } = useAdminState();

  return (
    <DoitCard
      eyebrow="Data quality flag"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] italic text-text-muted">
            {flagDisposition === 'kept'
              ? 'Kept in the results and flagged for readers.'
              : flagDisposition === 'excluded'
                ? 'Excluded from the analysis set, with the decision logged.'
                : 'No action taken yet.'}
          </p>
          <ConfidenceBadge score={78} note="Deliberately below the action threshold" />
        </div>
      }
    >
      <div className="mb-3 flex items-start gap-2.5">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-warning/15">
          <Flag className="h-4 w-4 text-warning" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-text">{DATA_QUALITY_FLAG.survey}</p>
          <p className="text-[11.5px] text-text-muted">Authored by Sarah Chen · {DATA_QUALITY_FLAG.total} total responses</p>
        </div>
      </div>

      <dl className="divide-y divide-border-subtle rounded-lg border border-border-subtle">
        {ROWS.map((row) => (
          <div key={row.label} className="flex flex-wrap gap-x-3 gap-y-0.5 px-3 py-2">
            <dt className="w-[124px] flex-shrink-0 text-[11.5px] text-text-muted">{row.label}</dt>
            <dd className="min-w-0 flex-1 text-[12px] leading-relaxed text-text">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-3">
        <EscalationNote>
          I held off making this call automatically because the impact is significant enough to warrant
          human judgment.
        </EscalationNote>
      </div>
    </DoitCard>
  );
}
