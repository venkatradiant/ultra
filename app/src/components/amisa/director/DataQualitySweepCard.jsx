import { HelpCircle } from 'lucide-react';
import AmisaCard from '../shared/AmisaCard';
import ConfidenceBadge from '../../common/ConfidenceBadge';
import { AiDisclaimer } from '../shared/AmisaTrustBits';
import { useDirectorState, toggleSweep } from '../shared/directorState';
import {
  HR_SURVEY,
  SWEEP_FINDINGS,
  computeValidCount,
  countAppliedFindings,
} from '../../../data/amisa/_shared/constants';

/**
 * The sweep, offered rather than applied.
 *
 * Three properties are load-bearing and none of them is decorative:
 *
 *   1. Every row is a checkbox. The AI proposes; the Executive Director
 *      disposes. Nothing on this card has already happened.
 *   2. Every row states WHY it was flagged. Dr. Rhoads asked for the flagging;
 *      a flag without a reason is just an assertion he would have to take on
 *      trust, which is the thing this tenant is trying to replace.
 *   3. The running total recomputes live from `computeValidCount`, never from a
 *      literal. The figure he publishes is one he watched the card derive, and
 *      the benchmark, the methodology line and the summary all call the same
 *      function — so they cannot drift from what he chose.
 *
 * The judgement row starts unchecked and is marked as his call. Answering
 * quickly is not a rule violation: a coordinator pasting from a spreadsheet
 * they had already prepared is legitimate, and the platform says so rather than
 * quietly discarding fourteen schools' work.
 */
export default function DataQualitySweepCard() {
  const { sweep, sweepApplied } = useDirectorState();
  const valid = computeValidCount(sweep);
  const applied = countAppliedFindings(sweep);

  return (
    <AmisaCard
      eyebrow="Proposed fixes — nothing applied yet"
      title={`${HR_SURVEY.totalResponses} responses swept`}
      intro="Uncheck anything you would rather I left alone, then apply. Each row says why it was flagged."
      illustrativeNote="Flag counts and reasons are authored for this prototype."
      source="AMISA Survey Platform, checked against the AMISA Data Dictionary"
      freshness="Swept overnight at close, 5:40 AM"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12.5px] text-text">
            Applying <span className="font-semibold">{applied}</span> of {SWEEP_FINDINGS.length} —{' '}
            <span className="font-semibold text-brand">{valid} valid records</span> for analysis
          </p>
          <ConfidenceBadge score={92} note="Each finding is a rule match against a published field definition." />
        </div>
      }
    >
      <ul className="divide-y divide-border-subtle">
        {SWEEP_FINDINGS.map((finding) => {
          const id = `amisa-sweep-${finding.key}`;
          const isOn = !!sweep[finding.key];
          return (
            <li key={finding.key} className="flex items-start gap-3 py-2.5">
              <input
                type="checkbox"
                id={id}
                checked={isOn}
                disabled={sweepApplied}
                onChange={() => toggleSweep(finding.key)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-[var(--color-brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
              />
              <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[13.5px] font-semibold text-text">{finding.label}</span>
                  {finding.judgement && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-[10px] font-semibold text-info">
                      <HelpCircle className="h-3 w-3" aria-hidden="true" />
                      Your call
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-text-muted">
                  {finding.reason}
                </span>
                <span className="mt-1.5 inline-block rounded bg-brand/[0.08] px-2 py-0.5 text-[10.5px] font-semibold text-brand">
                  {finding.excludes > 0 ? finding.action : `${finding.action} · removes no records`}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="mt-3">
        <AiDisclaimer />
      </div>
    </AmisaCard>
  );
}
