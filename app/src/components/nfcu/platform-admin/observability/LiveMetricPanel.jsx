import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import {
  METRIC_META,
  COUNTER_METRICS,
  LOWER_IS_BETTER,
} from '@/data/nfcu/platform-admin/observabilityData';

/**
 * One live metric. Rendered per key of the polled `metrics` payload — the count
 * varies by category (ui_api_docs.md is explicit that it does), so the grid maps
 * over whatever arrives rather than assuming a fixed number of panels.
 *
 * Three deliberate calls:
 *  - `isAnimationActive={false}`. recharts defaults to a 1.5s path sweep on every
 *    data change; at a 5s poll across several panels that reads as broken rather
 *    than live.
 *  - The series arrives from the getter rather than being recomputed here, so the
 *    line's last point and the number above it cannot disagree.
 *  - Counters (pii_blocked_count) never render as a line — a chart of a monotonic
 *    tally is meaningless, and this is the Gate 1 number the room cares most about.
 *
 * Props: { metric, value, series }
 */
export default function LiveMetricPanel({ metric, value, series }) {
  const meta = METRIC_META[metric] ?? { label: metric, unit: '' };
  const isCounter = COUNTER_METRICS.has(metric);

  // Direction of travel across the window, tinted by whether that's good news:
  // without this, a climbing error rate would render the same as climbing
  // throughput.
  const delta = useMemo(() => {
    if (isCounter || !series || series.length < 2) return null;
    const first = series[0].value;
    const last = series[series.length - 1].value;
    if (!first) return null;
    return ((last - first) / Math.abs(first)) * 100;
  }, [isCounter, series]);

  const rising = delta != null && delta > 0.5;
  const falling = delta != null && delta < -0.5;
  const lowerBetter = LOWER_IS_BETTER.has(metric);
  const goodDirection = lowerBetter ? falling : rising;
  const badDirection = lowerBetter ? rising : falling;

  return (
    <div className="rounded-lg border border-border-subtle px-3 py-2.5 min-w-0">
      <div className="text-[9.5px] text-text-subtle uppercase tracking-wide truncate">{meta.label}</div>

      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className="text-[17px] font-bold text-text tabular-nums leading-none">
          {typeof value === 'number' ? value.toLocaleString() : '—'}
        </span>
        {meta.unit && <span className="text-[10px] text-text-subtle font-medium">{meta.unit}</span>}
      </div>

      {isCounter ? (
        <div className="h-[38px] flex items-end">
          <span className="text-[10px] text-text-muted leading-snug">Cumulative today · only climbs</span>
        </div>
      ) : (
        <>
          {/* Fixed-height wrapper: ResponsiveContainer measures 0 inside a flex
              column with no resolved height and never recovers from it. */}
          <div className="h-[38px] -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series ?? []} margin={{ top: 4, right: 4, bottom: 2, left: 4 }}>
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={badDirection ? '#D97706' : 'var(--color-brand)'}
                  strokeWidth={1.75}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {delta != null && (
            <div
              className={`text-[9px] font-semibold tabular-nums ${
                goodDirection ? 'text-emerald-600' : badDirection ? 'text-amber-600' : 'text-text-subtle'
              }`}
            >
              {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'} {Math.abs(delta).toFixed(1)}% over window
            </div>
          )}
        </>
      )}
    </div>
  );
}
