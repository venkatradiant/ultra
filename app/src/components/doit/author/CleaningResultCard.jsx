import { CheckCircle2 } from 'lucide-react';
import { useAuthorState } from '../shared/authorState';
import { GovernanceRow } from '../shared/TrustBits';
import { SURVEY_1_TOTAL, computeValidCount, cleaningSummaryLine } from '../../../data/doit/_shared/constants';

/**
 * The receipt for the cleaning decision.
 *
 * Both the sentence and the count come from the same helpers the card above
 * used, so the AI's account of what it did cannot contradict the arithmetic
 * beneath it — the prototype's version claimed "4 of the 5 fixes, kept the
 * speeders" on every path, including the one where it applied all five.
 */
export default function CleaningResultCard() {
  const { cleaning } = useAuthorState();
  const valid = computeValidCount(cleaning);

  return (
    <div className="rounded-xl border border-success/25 bg-success/[0.07] p-4">
      <div className="flex items-start gap-2.5">
        <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-success" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[13px] leading-relaxed text-text">{cleaningSummaryLine(cleaning)}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-text">
            <span className="font-semibold">{valid} valid responses</span> used for analysis, from{' '}
            {SURVEY_1_TOTAL}.
          </p>
        </div>
      </div>
      <div className="mt-3 border-t border-success/20 pt-2.5">
        <GovernanceRow action="Cleaning applied" approvedBy="Sarah Chen" />
      </div>
    </div>
  );
}
