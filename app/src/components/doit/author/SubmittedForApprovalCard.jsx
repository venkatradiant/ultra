import { Clock3, Send } from 'lucide-react';
import { GovernanceRow, StatusBadge } from '../shared/TrustBits';
import { useAuthorState } from '../shared/authorState';
import { FORMAT_BY_ID, NATIVE_IDS } from '../../../data/doit/_shared/deliveryFormats';
import { APPROVER, SURVEY_2 } from '../../../data/doit/_shared/constants';

const DETAIL = {
  conversational: 'voce.maryland.gov/survey/permit-renewal',
  webform: 'voce.maryland.gov/form/permit-renewal',
  pdf: 'Tagged, screen-reader-navigable PDF',
  qualtrics: 'Publishes to your connected Qualtrics account',
  msforms: 'Creates it in your Microsoft 365 environment',
  gforms: 'Queued — awaiting a data-sharing agreement',
};

/**
 * The receipt for submitting a survey — NOT for publishing one.
 *
 * This card used to announce the survey was live and list its public URLs, and
 * the turn that followed offered to show results. Both were wrong for the same
 * reason: an author does not publish. The draft goes to their manager, and until
 * that sign-off there is no live survey, no URL a resident could open, and by
 * definition not one response to review.
 *
 * It lists exactly the formats the author selected — not a fixed three — so the
 * receipt cannot promise a channel that was never chosen.
 */
export default function SubmittedForApprovalCard() {
  const { formats, distributionList, draftQuestions } = useAuthorState();
  const chosen = formats.length ? formats : ['conversational'];

  return (
    <div className="rounded-xl border border-info/25 bg-info/[0.06] p-4">
      <div className="mb-3 flex items-start gap-2.5">
        <Send className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-info" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-text">
            {SURVEY_2.name} is with {APPROVER.name} for approval
          </p>
          <p className="mt-0.5 text-[12px] text-text-muted">
            {draftQuestions.length} questions, for {distributionList}. I will notify you the moment it
            goes live — or straight away if it comes back with edits.
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-info/20 bg-surface px-2.5 py-2">
        <Clock3 className="h-3.5 w-3.5 flex-shrink-0 text-text-subtle" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-[11.5px] text-text-muted">
          {APPROVER.role} sign-off, {APPROVER.turnaround}. Nothing reaches a resident before then.
        </p>
        <StatusBadge label="Awaiting approval" variant="blocked" />
      </div>

      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-subtle">
        Goes live in, once approved
      </p>
      <ul className="space-y-1.5 rounded-lg border border-info/20 bg-surface p-2.5">
        {chosen.map((id) => {
          const format = FORMAT_BY_ID[id];
          const isNative = NATIVE_IDS.has(id);
          return (
            <li key={id} className="flex items-start justify-between gap-2">
              <span className="min-w-0">
                <span className="block text-[12.5px] font-medium text-text">{format?.name || id}</span>
                <span className="block text-[11px] text-text-muted">{DETAIL[id]}</span>
              </span>
              <StatusBadge
                label={isNative || format?.connected ? 'Ready' : 'Queued'}
                variant={isNative || format?.connected ? 'generated' : 'blocked'}
              />
            </li>
          );
        })}
      </ul>

      <div className="mt-3 border-t border-info/20 pt-2.5">
        <GovernanceRow action="Submitted for approval" approvedBy="Sarah Chen" />
      </div>
    </div>
  );
}
