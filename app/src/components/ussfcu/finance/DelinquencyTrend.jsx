import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  ResponsiveContainer,
} from 'recharts';
import FinanceCard, { StatusPill } from './FinanceCard';
import RiskRead from './RiskRead';
import { getDelinquencyTrend } from '../../../data/ussfcu/finance';
import { fmtPct } from '../../../data/ussfcu/finance/constants';

/**
 * Step 2 · Anomaly Detection — "Delinquency-by-segment trend lines over eight
 * quarters, the Home Improvement Loan book flagged red and crossing the 1.5%
 * parameter line." The band above the parameter is shaded as outside
 * tolerance, and the quarter HIL first crosses it is marked.
 */
const COLORS = {
  hil: 'var(--color-critical)',
  first_mortgage: 'var(--color-brand)',
  heloc: 'var(--color-chart-2)',
  other_unsecured: 'var(--color-chart-4)',
};
const Y_MAX = 2.2;

export default function DelinquencyTrend({ eyebrow = 'Anomaly Detection' }) {
  const { quarters, parameter, driver, segments } = getDelinquencyTrend();
  const LAST = quarters.length - 1;
  const hil = segments.find((s) => s.id === 'hil');
  const crossAt = hil.series.findIndex((v) => v > parameter);
  const chartData = quarters.map((q, i) => Object.fromEntries([['quarter', q], ...segments.map((s) => [s.id, s.series[i]])]));

  return (
    <FinanceCard
      eyebrow={eyebrow}
      title="60-day delinquency by loan segment · eight quarters"
      aside={<StatusPill tone="critical">1 pool outside tolerance</StatusPill>}
      footnote={`Quarter-end 60-day delinquency, ${quarters[0]} – ${quarters[LAST]}. Source: Jack Henry Symitar (loan servicing and delinquency).`}
    >
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <RiskRead
          label="Home Improvement Loan (unsecured)"
          value={fmtPct(hil.series[LAST])}
          limit={`Parameter ${fmtPct(parameter)} · ${fmtPct(hil.series[LAST - 2])} two quarters ago`}
          status={`Breach +${(hil.series[LAST] - parameter).toFixed(1)} pts`}
          tone="critical"
          trend={hil.series}
          source="Symitar"
        />
        {segments
          .filter((s) => s.id === 'first_mortgage' || s.id === 'heloc')
          .map((s) => (
            <RiskRead
              key={s.id}
              label={s.segment}
              value={fmtPct(s.series[LAST])}
              limit="Steady across eight quarters"
              status="Inside tolerance"
              tone="success"
              trend={s.series}
              source="Symitar"
            />
          ))}
      </div>

      <div className="min-w-0 rounded-lg border border-border-subtle bg-surface p-3">
        <ResponsiveContainer width="100%" height={230}>
          <ComposedChart data={chartData} margin={{ top: 14, right: 16, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)" />
            <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: 'var(--color-chart-axis)' }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[0, Y_MAX]}
              ticks={[0, 0.5, 1, 1.5, 2]}
              tick={{ fontSize: 10, fill: 'var(--color-chart-axis)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v.toFixed(1)}%`}
            />
            {/* Outside tolerance: everything above the aligned parameter. */}
            <ReferenceArea y1={parameter} y2={Y_MAX} fill="var(--color-critical)" fillOpacity={0.06} ifOverflow="extendDomain" />
            <ReferenceLine
              y={parameter}
              stroke="var(--color-critical)"
              strokeDasharray="4 4"
              label={{ value: `Aligned parameter ${fmtPct(parameter)}`, fill: 'var(--color-critical)', fontSize: 9, position: 'insideTopLeft' }}
            />
            <Tooltip
              formatter={(v, id) => [fmtPct(v, 2), segments.find((s) => s.id === id)?.segment ?? id]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--color-border)' }}
            />
            {segments.map((s) => (
              <Line
                key={s.id}
                type="monotone"
                dataKey={s.id}
                stroke={COLORS[s.id]}
                strokeWidth={s.flagged ? 2.75 : 1.5}
                strokeOpacity={s.flagged ? 1 : 0.8}
                dot={s.flagged ? { r: 3, fill: COLORS[s.id] } : false}
                animationDuration={800}
              />
            ))}
            {crossAt >= 0 ? (
              <ReferenceDot
                x={quarters[crossAt]}
                y={hil.series[crossAt]}
                r={6}
                fill="var(--color-surface)"
                stroke="var(--color-critical)"
                strokeWidth={2}
                label={{ value: `${fmtPct(hil.series[crossAt])} · past ${fmtPct(parameter)}`, position: 'left', offset: 10, fill: 'var(--color-critical)', fontSize: 10, fontWeight: 600 }}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend, with each segment's latest value. */}
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px]">
          {segments.map((s) => (
            <li key={s.id} className="flex items-center gap-1.5">
              <span className="h-0.5 w-3.5 rounded-full" style={{ background: COLORS[s.id] }} aria-hidden="true" />
              <span className={s.flagged ? 'font-semibold text-critical' : 'text-text-muted'}>{s.segment}</span>
              <span className="tabular-nums text-text-subtle">{fmtPct(s.series[LAST])}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 rounded-lg border border-critical/20 bg-critical-subtle px-3 py-2 text-[11px] leading-relaxed text-text">
        <span className="font-semibold text-critical">Where the rise sits: </span>
        {`${driver.vintage}, through ${driver.channel}.`}
      </p>
    </FinanceCard>
  );
}
