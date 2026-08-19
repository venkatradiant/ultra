import { CheckCircle2, Zap } from 'lucide-react';
import TopInsightsBar from '../../chat/TopInsightsBar';
import DataOverviewBar from '../../cards/DataOverviewBar';
import { useAuthorState } from './authorState';
import { useAdminState } from './adminState';
import { APPROVAL_QUEUE, isQuestionComplete } from '../../../data/doit/_shared/constants';

/**
 * The briefing's two card rows, told what has already been done.
 *
 * The greeting message was the only part of the briefing that knew about the
 * session's progress. The Priority Signals row and the KPI tiles above it read
 * from static JSON and a static manifest array, so after finishing both tasks
 * the prose said "nothing needs you" while the cards directly above it still
 * showed two open items and a red "1 draft pending".
 *
 * A finished signal is REMOVED rather than greyed. It is not a signal any more —
 * leaving it in the row and styling it differently keeps asking the reader to
 * decide whether it needs them.
 */

/**
 * Priority Signals with the finished ones taken out.
 *
 * The window is the NARRATED set — the first three, which is what TopInsightsBar
 * renders and what the greeting message enumerates — and finished items are
 * removed from inside it rather than replaced. Filtering the whole array instead
 * let a fourth signal slide up into the gap, so three cards sat above a message
 * listing two things. Whatever is displaced stays reachable by asking for it.
 */
const NARRATED = 3;

function BriefingSignals({ signals = [], doneIds, visible, ...rest }) {
  const open = signals.slice(0, NARRATED).filter((s) => !doneIds.has(s.id));

  if (open.length === 0) {
    if (!visible) return null;
    return (
      <div className="mb-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-brand/[0.08]">
            <Zap className="h-3 w-3 text-brand" aria-hidden="true" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Priority Signals
          </span>
          <div className="ml-1 h-px flex-1 bg-surface-2" />
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-success/25 bg-success/[0.06] px-3.5 py-3">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" aria-hidden="true" />
          <p className="text-[12.5px] text-text">
            Nothing is waiting on you. Everything that needed your attention today is done.
          </p>
        </div>
      </div>
    );
  }

  return <TopInsightsBar signals={open} visible={visible} {...rest} />;
}

/** The Survey Author's signal row. */
export function AuthorSignalsBar({ signals = [], ...rest }) {
  const { done, draftQuestions } = useAuthorState();
  const doneIds = new Set([
    ...(done.results ? ['SIG-DOIT-AUTH-001'] : []),
    ...(done.draft ? ['SIG-DOIT-AUTH-002'] : []),
  ]);

  // The draft card's count is derived, not read from the signal's JSON. The
  // author can add and remove questions now, so a stored "6 of 9" goes stale the
  // moment they do — and this card sits directly above a panel that recomputes
  // the same figure from the questions themselves.
  const complete = draftQuestions.filter(isQuestionComplete).length;
  const blocked = draftQuestions.length - complete;
  const live = signals.map((signal) =>
    signal.id === 'SIG-DOIT-AUTH-002'
      ? {
          ...signal,
          metric_text: `${complete} of ${draftQuestions.length} questions · ${blocked} blocker${blocked === 1 ? '' : 's'}`,
        }
      : signal,
  );

  return <BriefingSignals signals={live} doneIds={doneIds} {...rest} />;
}

/** The Survey Author's KPI tiles, recounted against what is finished. */
export function AuthorStatsBar({ stats = [], ...rest }) {
  const { done, draftQuestions } = useAuthorState();
  const next = stats.map((stat) => {
    if (stat.id === 'drafts') {
      return done.draft
        ? { ...stat, value: '0', trend: 'sent for approval', positive: true, chipText: null }
        : { ...stat, trend: `${draftQuestions.length} questions · ships tomorrow` };
    }
    if (stat.id === 'responses-week' && done.results) {
      return { ...stat, trend: 'reviewed and reported', chipText: null };
    }
    return stat;
  });
  return <DataOverviewBar stats={next} {...rest} />;
}

/** The Administrator's signal row. */
export function AdminSignalsBar(props) {
  const { done } = useAdminState();
  const doneIds = new Set([
    ...(done.approvals ? ['SIG-DOIT-ADM-001'] : []),
    ...(done.flag ? ['SIG-DOIT-ADM-004'] : []),
    ...(done.brief ? ['SIG-DOIT-ADM-002'] : []),
  ]);
  return <BriefingSignals doneIds={doneIds} {...props} />;
}

/** The Administrator's KPI tiles, recounted against what is settled. */
export function AdminStatsBar({ stats = [], ...rest }) {
  const { approved, sentBack } = useAdminState();
  const settled = new Set([...approved, ...sentBack.map((s) => s.id)]);
  const outstanding = Math.max(0, APPROVAL_QUEUE.length - settled.size);
  const next = stats.map((stat) =>
    stat.id === 'approvals'
      ? {
          ...stat,
          value: String(outstanding),
          trend: outstanding === 0 ? 'queue is clear' : 'earliest ships tomorrow',
          positive: outstanding === 0,
        }
      : stat,
  );
  return <DataOverviewBar stats={next} {...rest} />;
}
