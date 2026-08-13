import { CheckCircle2 } from 'lucide-react';
import { ConfidenceBadge } from '../shared/TrustBits';
import { reviewRows } from '../../../data/doit/resident/surveyLogic';

/**
 * Review before submit.
 *
 * Only the questions this resident was actually asked, and a skipped one reads
 * "Not answered" rather than inventing a plausible reply. The prototype carried
 * hardcoded per-row fallbacks left over from a different survey, so choosing
 * "None of these" made the review card show a difficulty and a verbatim the
 * resident never gave — including a duration that was not even one of the
 * options on offer.
 *
 * The Edit pills are wired. The source's had no onClick at all.
 */
export default function ResponseSummaryCard({ answers, onEdit, onSubmit }) {
  const rows = reviewRows(answers);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
        Review your answers
      </p>
      <p className="mb-3 text-[13px] leading-relaxed text-text-muted">
        Nothing is submitted until you say so. Change anything that does not look right.
      </p>

      <ul className="divide-y divide-border-subtle rounded-lg border border-border-subtle">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-start gap-x-3 gap-y-1 px-3 py-2.5">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-surface-2 text-[10.5px] font-bold text-text-muted">
              {row.label}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] leading-snug text-text-muted">{row.question}</span>
              <span
                className={`mt-0.5 block text-[13px] font-medium ${
                  row.answer === 'Not answered' ? 'italic text-text-subtle' : 'text-text'
                }`}
              >
                {row.answer}
              </span>
            </span>
            <button
              type="button"
              onClick={() => onEdit(row.id)}
              className="min-h-[32px] flex-shrink-0 rounded-full border border-border px-3 text-[11.5px] font-semibold text-brand transition-colors hover:bg-brand/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Edit
              <span className="sr-only"> question {row.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <ConfidenceBadge score={96} />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="mt-3 min-h-[44px] w-full rounded-xl bg-brand px-4 text-[14px] font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Submit my answers
      </button>
    </div>
  );
}

/** The thank-you. */
export function CompletionCard({ onWebForm, onRestart }) {
  return (
    <div className="rounded-xl border border-success/25 bg-success/[0.06] p-4 text-center">
      <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-success/15">
        <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
      </span>
      <p className="text-[15px] font-semibold text-text">Thank you — your survey is complete.</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">
        Your answers go to the team working on the Maryland Medical Assistance application process.
        They are not linked to your name.
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {onWebForm && (
          <button
            type="button"
            onClick={onWebForm}
            className="min-h-[36px] rounded-lg px-2 text-[12.5px] font-semibold text-brand underline decoration-dotted underline-offset-2 hover:text-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            See the same survey as a standard web form
          </button>
        )}
        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            className="min-h-[36px] rounded-lg px-2 text-[12.5px] text-text-muted underline decoration-dotted underline-offset-2 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
