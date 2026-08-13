import { CheckCircle2 } from 'lucide-react';
import { GovernanceRow, StatusBadge } from '../shared/TrustBits';
import { useAuthorState } from '../shared/authorState';
import { FORMAT_BY_ID, NATIVE_IDS } from '../../../data/doit/_shared/deliveryFormats';
import { SURVEY_2 } from '../../../data/doit/_shared/constants';

const DETAIL = {
  conversational: 'voce.maryland.gov/survey/permit-renewal',
  webform: 'voce.maryland.gov/form/permit-renewal',
  pdf: 'Tagged, screen-reader-navigable PDF',
  qualtrics: 'Published to your connected Qualtrics account',
  msforms: 'Created in your Microsoft 365 environment',
  gforms: 'Queued — awaiting a data-sharing agreement',
};

/**
 * The receipt for publishing.
 *
 * It lists exactly the formats the author selected — not a fixed three — so the
 * confirmation cannot claim a channel went live that was never chosen.
 */
export default function PublishConfirmationCard() {
  const { formats, distributionList } = useAuthorState();
  const chosen = formats.length ? formats : ['conversational'];

  return (
    <div className="rounded-xl border border-success/25 bg-success/[0.06] p-4">
      <div className="mb-3 flex items-start gap-2.5">
        <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-success" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-text">{SURVEY_2.name} is live</p>
          <p className="mt-0.5 text-[12px] text-text-muted">
            On its way to {distributionList}. I will surface a summary as soon as there are enough
            responses to see patterns.
          </p>
        </div>
      </div>

      <ul className="space-y-1.5 rounded-lg border border-success/20 bg-surface p-2.5">
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
                label={isNative ? 'Live' : format?.connected ? 'Published' : 'Queued'}
                variant={isNative || format?.connected ? 'live' : 'blocked'}
              />
            </li>
          );
        })}
      </ul>

      <div className="mt-3 border-t border-success/20 pt-2.5">
        <GovernanceRow action="Published" approvedBy="Sarah Chen" />
      </div>
    </div>
  );
}
