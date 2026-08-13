import { Check } from 'lucide-react';
import DoitCard from '../shared/DoitCard';
import { PlatformChip } from '../shared/TrustBits';
import { useAdminState, setAdminState } from '../shared/adminState';
import { ACTIVE_SURVEYS, PLATFORM_COLORS, PORTFOLIO_SURVEYS } from '../../../data/doit/_shared/constants';

/**
 * Scope for the cross-survey query.
 *
 * The six resident-experience surveys are pre-selected out of eighteen active —
 * a starting point, not a decision. The running total is summed from the
 * selection rather than stated, so the number quoted in the answer and in the
 * leadership brief is one the administrator watched assemble.
 */
export default function SurveyPickerCard() {
  const { selectedSurveys } = useAdminState();
  const total = PORTFOLIO_SURVEYS.filter((s) => selectedSurveys.includes(s.id)).reduce(
    (sum, s) => sum + s.responses,
    0,
  );

  const toggle = (id) =>
    setAdminState({
      selectedSurveys: selectedSurveys.includes(id)
        ? selectedSurveys.filter((s) => s !== id)
        : [...selectedSurveys, id],
    });

  return (
    <DoitCard
      eyebrow="Surveys in scope"
      title={`${selectedSurveys.length} of ${ACTIVE_SURVEYS} active surveys`}
      intro="I have pre-selected the six resident-experience surveys — the most common starting point. Change the selection and the analysis follows it."
      footer={
        <p className="text-[12.5px] text-text">
          <span className="font-semibold text-brand">{total.toLocaleString()} responses</span> across{' '}
          {selectedSurveys.length} survey{selectedSurveys.length === 1 ? '' : 's'} and{' '}
          {new Set(PORTFOLIO_SURVEYS.filter((s) => selectedSurveys.includes(s.id)).map((s) => s.platform)).size}{' '}
          platforms
        </p>
      }
    >
      <ul className="space-y-1.5">
        {PORTFOLIO_SURVEYS.map((survey) => {
          const on = selectedSurveys.includes(survey.id);
          return (
            <li key={survey.id}>
              <button
                type="button"
                onClick={() => toggle(survey.id)}
                aria-pressed={on}
                className={`flex min-h-[44px] w-full items-center gap-2.5 rounded-lg border-2 px-2.5 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  on ? 'border-brand bg-brand/[0.05]' : 'border-border-subtle bg-surface hover:border-brand/35'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-[17px] w-[17px] flex-shrink-0 items-center justify-center rounded border-2 ${
                    on ? 'border-brand bg-brand text-white' : 'border-border bg-surface'
                  }`}
                >
                  {on && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-text">{survey.name}</span>
                  <span className="text-[11px] text-text-muted">
                    {survey.period} · {survey.author}
                  </span>
                </span>
                <PlatformChip platform={survey.platform} color={PLATFORM_COLORS[survey.platform]} />
                <span className="w-11 flex-shrink-0 text-right text-[12px] font-semibold tabular-nums text-text">
                  {survey.responses}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </DoitCard>
  );
}
