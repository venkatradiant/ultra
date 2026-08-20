import { CheckCircle2, Zap } from 'lucide-react';
import TopInsightsBar from '../../chat/TopInsightsBar';
import DataOverviewBar from '../../cards/DataOverviewBar';
import { useDirectorState } from './directorState';
import { computeValidCount } from '../../../data/amisa/_shared/constants';

/**
 * The briefing's two card rows, told what has already been done.
 *
 * Same problem and same shape as the DoIT tenant's bars: the greeting message
 * is the only part of the briefing that knows about session progress, so
 * without this the prose can say "everything is done" while the cards directly
 * above it still show three open items.
 *
 * A finished signal is REMOVED rather than greyed. It is not a signal any more,
 * and leaving it in the row keeps asking the reader to decide whether it needs
 * them.
 */

/** The narrated window — what TopInsightsBar renders and the greeting enumerates. */
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
            Nothing is waiting on you. September 30 in, October 1 out.
          </p>
        </div>
      </div>
    );
  }

  return <TopInsightsBar signals={open} visible={visible} {...rest} />;
}

/** The Executive Director's signal row. */
export function DirectorSignalsBar(props) {
  const { done } = useDirectorState();
  const doneIds = new Set([
    ...(done.published ? ['SIG-AMISA-DIR-001'] : []),
    ...(done.quality ? ['SIG-AMISA-DIR-002'] : []),
    ...(done.approval ? ['SIG-AMISA-DIR-003'] : []),
  ]);
  return <BriefingSignals doneIds={doneIds} {...props} />;
}

/**
 * The Executive Director's KPI tiles, recounted against what is settled.
 *
 * The valid-records tile is DERIVED from the sweep he applied rather than read
 * from the manifest's static value. He can uncheck a row before applying, and a
 * tile still reading 298 above a card that just computed 284 is exactly the
 * inconsistency this tenant exists to argue against.
 */
export function DirectorStatsBar({ stats = [], ...rest }) {
  const { done, sweep, sweepApplied } = useDirectorState();
  const next = stats.map((stat) => {
    if (stat.id === 'valid-records') {
      return sweepApplied
        ? {
            ...stat,
            value: String(computeValidCount(sweep)),
            trend: 'sweep applied by you',
            positive: true,
            chipText: null,
          }
        : stat;
    }
    if (stat.id === 'approvals' && done.approval) {
      return { ...stat, value: '0', trend: 'queue is clear', positive: true, chipText: null };
    }
    if (stat.id === 'missing-office' && done.published) {
      return { ...stat, trend: 'summary published without them', chipText: null };
    }
    return stat;
  });
  return <DataOverviewBar stats={next} {...rest} />;
}
