import DoitCard from '../shared/DoitCard';
import { ConfidenceBadge, ReferenceBadge } from '../shared/TrustBits';
import { SURVEY_2 } from '../../../data/doit/_shared/constants';

/**
 * VOCE's proposed answer options for the unfinished question.
 *
 * The citation matters more than the options do: the scale is not invented, it
 * is the one this author's own prior permit surveys used. That is what makes
 * accepting it a low-risk click rather than a leap of faith.
 */
export default function SuggestedOptionsCard() {
  return (
    <DoitCard
      eyebrow="Suggested answer options — Q7"
      intro="“How easy was the permit renewal process overall?”"
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <ReferenceBadge label="Matched to your Q1 2025 permit survey" />
          <ConfidenceBadge score={91} />
        </div>
      }
    >
      <div className="flex flex-wrap gap-2">
        {SURVEY_2.q7SuggestedOptions.map((option) => (
          <span
            key={option}
            className="rounded-md border border-brand/20 bg-brand/[0.06] px-3 py-1.5 text-[12.5px] font-semibold text-brand"
          >
            {option}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-text-muted">
        A consistent four-point scale with no neutral midpoint — the same one your Q1 permit survey
        used, so the two waves stay comparable.
      </p>
    </DoitCard>
  );
}
