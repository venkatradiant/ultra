import DoitCard from '../shared/DoitCard';
import { AiDisclaimer, ConfidenceBadge } from '../shared/TrustBits';
import { useAuthorState, setAuthorState } from '../shared/authorState';
import {
  CLEANING_FIXES,
  SURVEY_1_TOTAL,
  computeValidCount,
  countAppliedFixes,
} from '../../../data/doit/_shared/constants';

/**
 * The data-quality sweep, offered rather than applied.
 *
 * Every row is a recommendation with its own disposition, and the running total
 * recomputes live — so the number the author ends up publishing is one they
 * watched the card derive. That derivation is the whole trust argument, which
 * is why the count comes from `computeValidCount` and not a literal.
 *
 * The speeders row starts unchecked: excluding someone for answering fast is a
 * judgement call, so VOCE states its reasoning and leaves the decision open.
 */
export default function DataCleaningCard() {
  const { cleaning } = useAuthorState();
  const valid = computeValidCount(cleaning);
  const applied = countAppliedFixes(cleaning);

  const toggle = (key) =>
    setAuthorState({ cleaning: { ...cleaning, [key]: !cleaning[key] } });

  return (
    <DoitCard
      eyebrow="Recommended data-quality fixes"
      title={`${SURVEY_1_TOTAL} responses swept`}
      intro="Uncheck anything you would rather I left alone, then apply."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12.5px] text-text">
            Applying <span className="font-semibold">{applied}</span> of {CLEANING_FIXES.length} fixes —{' '}
            <span className="font-semibold text-brand">{valid} valid responses</span> for analysis
          </p>
          <ConfidenceBadge score={94} />
        </div>
      }
    >
      <ul className="divide-y divide-border-subtle">
        {CLEANING_FIXES.map((fix) => {
          const id = `doit-clean-${fix.key}`;
          const isOn = !!cleaning[fix.key];
          return (
            <li key={fix.key} className="flex items-start gap-3 py-2.5">
              <input
                type="checkbox"
                id={id}
                checked={isOn}
                onChange={() => toggle(fix.key)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-[var(--color-brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              />
              <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
                <span className="block text-[13px] font-semibold text-text">{fix.label}</span>
                <span className="mt-0.5 block text-[12px] leading-relaxed text-text-muted">
                  {fix.description}
                </span>
                <span className="mt-1.5 inline-block rounded bg-brand/[0.08] px-2 py-0.5 text-[10.5px] font-semibold text-brand">
                  {fix.excludes > 0 ? fix.action : `${fix.action} · removes no responses`}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="mt-3">
        <AiDisclaimer />
      </div>
    </DoitCard>
  );
}
