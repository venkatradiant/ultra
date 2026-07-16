import { styleForState } from './stateStyles';

/**
 * State over time. The reference drew this as a Grafana state-timeline panel;
 * here it's a flex row of divs — no chart library, no ResponsiveContainer to
 * mis-measure, no animation to freeze. ~20 lines instead of a recharts import.
 *
 * Props: { history } — ComponentState[], oldest → newest.
 */
export default function ComponentStateHistory({ history }) {
  if (!history?.length) return null;

  // Collapse runs so the legend reads "Healthy → Degraded", not 8 identical cells.
  const runs = [];
  for (const state of history) {
    const last = runs[runs.length - 1];
    if (last && last.state === state) last.span += 1;
    else runs.push({ state, span: 1 });
  }

  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-5">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">State history</h3>
        <span className="ml-auto text-[9.5px] text-text-subtle">Last hour</span>
      </div>

      <div className="flex gap-0.5 h-7 rounded-md overflow-hidden">
        {runs.map((run, i) => {
          const style = styleForState(run.state);
          return (
            <div
              key={`${run.state}-${i}`}
              style={{ flexGrow: run.span }}
              className={`${style.bar} first:rounded-l-md last:rounded-r-md`}
              title={`${style.label} — ${run.span} interval${run.span === 1 ? '' : 's'}`}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5">
        {runs.map((run, i) => {
          const style = styleForState(run.state);
          return (
            <span key={`${run.state}-legend-${i}`} className="inline-flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              <span className="text-[10px] text-text-muted">{style.label}</span>
              {i < runs.length - 1 && <span className="text-[10px] text-text-subtle ml-1.5">→</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}
