import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import metrics from '../../../data/newfold-digital/ops/metrics.json';

/**
 * The visual half of Sofia's daily ops report.
 *
 * The report names four workstreams and then makes one promise — service level
 * back to target by 2 PM. That promise is what the chart exists to show, because
 * it is the only claim in the summary a reader cannot check from the prose: the
 * measured line stops at the current hour and the projection carries on from the
 * same point, so where the modelling starts is visible rather than implied.
 *
 * Underneath, the four workstreams as a status board. Each row carries what was
 * found, what was done about it, and the number that says whether it is handled
 * — which is the difference between a report you read and a report you act on.
 */
const { serviceLevel, target, nowLabel, workstreams } = metrics.dailyReport;

const TONE = {
  progress: {
    chip: 'bg-brand/10 text-brand border-brand/25',
    rail: 'var(--color-brand)',
  },
  watch: {
    chip: 'bg-amber-500/10 text-amber-700 border-amber-500/25',
    rail: '#d97706',
  },
  pending: {
    chip: 'bg-surface-2 text-text-muted border-border',
    rail: 'var(--color-border)',
  },
};

function SlTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const measured = row?.actual != null && label !== nowLabel;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="mb-0.5 font-semibold text-text">{label}</p>
      <p className="text-brand">
        Service level {(row?.actual ?? row?.projected)?.toFixed(1)}%
      </p>
      <p className="text-[10px] text-text-subtle">{measured ? 'Measured' : 'Projected'}</p>
    </div>
  );
}

export default function DailyOpsReport() {
  return (
    <div
      className="rounded-xl border border-border-subtle bg-surface p-4"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <h3 className="mb-1 text-sm font-bold text-text">Daily Ops Report — Shift Summary</h3>
      <p className="mb-3 text-[11px] text-text-subtle">
        Service level against the 80% target. Solid to {nowLabel}, projected after.
      </p>

      <ResponsiveContainer width="100%" height={180}>
        {/* Right margin holds the target label, which renders outside the plot
            area and gets clipped at the default 12. */}
        <LineChart data={serviceLevel} margin={{ top: 4, right: 58, left: -20, bottom: 0 }}>
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[60, 90]}
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            unit="%"
          />
          <Tooltip content={<SlTooltip />} />
          <ReferenceLine
            y={target}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            label={{ value: `Target ${target}%`, position: 'right', fontSize: 9, fill: '#94a3b8' }}
          />
          <ReferenceLine x={nowLabel} stroke="var(--color-border)" />
          <Line
            type="monotone"
            dataKey="actual"
            name="Measured"
            stroke="var(--color-brand)"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="projected"
            name="Projected"
            stroke="var(--color-brand)"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={{ r: 3 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Four workstreams this shift
        </p>
        {workstreams.map((w) => {
          const tone = TONE[w.tone] || TONE.pending;
          return (
            <div
              key={w.id}
              className="relative overflow-hidden rounded-lg border border-border-subtle bg-surface-2 py-2 pl-3.5 pr-3"
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-[2.5px]"
                style={{ background: tone.rail }}
              />
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-[11.5px] font-semibold text-text">{w.title}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[9.5px] font-semibold ${tone.chip}`}>
                  {w.status}
                </span>
              </div>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-text-muted">{w.detail}</p>
              <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-[10px] text-emerald-700">✓ {w.action}</p>
                <p className="text-[10px] text-text-muted">
                  <span className="text-[12px] font-bold text-text">{w.metric}</span> {w.metricLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
