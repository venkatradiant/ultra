import DoitCard from '../shared/DoitCard';
import { AiDisclaimer, ConfidenceBadge } from '../shared/TrustBits';
import { SURVEY_1_FINDINGS } from '../../../data/doit/_shared/constants';

const ROWS = [
  {
    value: `${SURVEY_1_FINDINGS.satisfactionPct}%`,
    label: 'Overall satisfaction',
    context: `down ${Math.abs(SURVEY_1_FINDINGS.satisfactionDeltaPts)} points from the last wave`,
  },
  {
    value: `${SURVEY_1_FINDINGS.waitTimesSharePct}%`,
    label: 'Top dissatisfaction driver',
    context: 'wait times at in-person service centers, from open-text',
  },
  {
    value: 'Emerging',
    label: 'Confusion about the new online renewal portal',
    context: 'first wave this theme has surfaced',
  },
  {
    value: SURVEY_1_FINDINGS.staffCourtesy,
    label: 'Staff courtesy',
    context: 'strongest positive finding',
  },
];

/** The four headline findings from the cleaned set. */
export default function InsightSummaryCard() {
  return (
    <DoitCard
      eyebrow="Survey insights"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AiDisclaimer />
          <ConfidenceBadge score={94} />
        </div>
      }
    >
      <ul className="divide-y divide-border-subtle">
        {ROWS.map((row) => (
          <li key={row.label} className="flex items-baseline gap-3 py-2">
            <span className="w-[78px] flex-shrink-0 text-[15px] font-bold text-brand">{row.value}</span>
            <span className="min-w-0 text-[13px] leading-relaxed text-text">
              {row.label}
              <span className="text-text-muted"> — {row.context}</span>
            </span>
          </li>
        ))}
      </ul>
    </DoitCard>
  );
}
