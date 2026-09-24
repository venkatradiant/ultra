import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import FinanceCard, { StatusPill } from './FinanceCard';
import { DQ_QUARTERS, DQ_SEGMENTS, INDIRECT_AUTO_VINTAGE, fmtPct } from '../../../data/ussfcu/finance/constants';

/**
 * Q1 · Proactive Intelligence — 60-day delinquency by loan segment against
 * each segment's aligned parameter. Indirect auto is the one pool trending up
 * and outside tolerance; its origination-vintage split shows the rise sits in
 * loans originated in the last 18 months.
 */
const LAST = DQ_QUARTERS.length - 1;
const indirect = DQ_SEGMENTS.find((s) => s.id === 'indirect_auto');
const chartData = DQ_QUARTERS.map((q, i) => ({ quarter: q, dq: indirect.series[i] }));

function direction(series) {
  const first = series[0];
  const last = series[series.length - 1];
  if (last > first) return 'Rising';
  if (last < first) return 'Improving';
  return 'Flat';
}

export default function DelinquencyBySegmentPanel() {
  const { recent, seasoned } = INDIRECT_AUTO_VINTAGE;
  return (
    <FinanceCard
      eyebrow="Proactive Intelligence"
      title="60-day delinquency by loan segment vs. aligned parameters"
      aside={<StatusPill tone="critical">1 pool outside tolerance</StatusPill>}
      footnote={`Quarter-end 60-day delinquency, ${DQ_QUARTERS[0]} – ${DQ_QUARTERS[LAST]}. Aligned parameters from board policy.`}
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div className="min-w-0 rounded-lg border border-border-subtle bg-surface p-3 lg:col-span-3">
          <p className="mb-2 text-[11px] font-semibold text-text">Indirect auto · 60-day delinquency</p>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={chartData} margin={{ top: 6, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)" />
              <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: 'var(--color-chart-axis)' }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[0.8, 2.0]}
                ticks={[0.8, 1.1, 1.4, 1.7, 2.0]}
                tick={{ fontSize: 10, fill: 'var(--color-chart-axis)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v.toFixed(1)}%`}
              />
              <Tooltip
                formatter={(v) => [fmtPct(v, 2), '60-day delinquency']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--color-border)' }}
              />
              <ReferenceLine
                y={indirect.parameterPct}
                stroke="var(--color-critical)"
                strokeDasharray="4 4"
                label={{ value: `Aligned parameter ${fmtPct(indirect.parameterPct)}`, fill: 'var(--color-critical)', fontSize: 9, position: 'insideBottomLeft' }}
              />
              <Line type="monotone" dataKey="dq" stroke="var(--color-brand)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--color-brand)' }} animationDuration={800} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="min-w-0 rounded-lg border border-border-subtle bg-surface p-3 lg:col-span-2">
          <p className="mb-2 text-[11px] font-semibold text-text">Where the rise sits</p>
          {[recent, seasoned].map((v) => (
            <div key={v.label} className="mb-2.5 last:mb-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10.5px] text-text-muted">{v.label}</span>
                <span className={`text-[13px] font-bold tabular-nums ${v.dqPct > indirect.parameterPct ? 'text-critical' : 'text-text'}`}>
                  {fmtPct(v.dqPct, 2)}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={`h-full rounded-full ${v.dqPct > indirect.parameterPct ? 'bg-critical' : 'bg-brand/60'}`}
                  style={{ width: `${Math.min(100, (v.dqPct / 3) * 100)}%` }}
                />
              </div>
              <p className="mt-0.5 text-[9.5px] text-text-subtle">{Math.round(v.shareOfBalance * 100)}% of the indirect-auto balance</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-border-subtle bg-surface">
        <table className="w-full min-w-[440px] text-left text-[11px]">
          <thead>
            <tr className="border-b border-border-subtle text-[9.5px] uppercase tracking-wide text-text-subtle">
              <th className="px-3 py-2 font-semibold">Segment</th>
              <th className="px-2 py-2 text-right font-semibold">{DQ_QUARTERS[LAST - 2]}</th>
              <th className="px-2 py-2 text-right font-semibold">{DQ_QUARTERS[LAST]}</th>
              <th className="px-2 py-2 text-right font-semibold">Parameter</th>
              <th className="px-2 py-2 font-semibold">Trend</th>
              <th className="px-3 py-2 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {DQ_SEGMENTS.map((s) => {
              const outside = s.series[LAST] > s.parameterPct;
              const trend = direction(s.series);
              return (
                <tr key={s.id} className={`border-b border-border-subtle last:border-0 ${outside ? 'bg-critical-subtle/60' : ''}`}>
                  <td className={`px-3 py-1.5 font-medium ${outside ? 'text-critical' : 'text-text'}`}>{s.label}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-text-muted">{fmtPct(s.series[LAST - 2], 2)}</td>
                  <td className={`px-2 py-1.5 text-right font-semibold tabular-nums ${outside ? 'text-critical' : 'text-text'}`}>{fmtPct(s.series[LAST], 2)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-text-muted">{fmtPct(s.parameterPct, 2)}</td>
                  <td className={`px-2 py-1.5 ${trend === 'Rising' ? 'font-semibold text-critical' : 'text-text-muted'}`}>{trend}</td>
                  <td className="px-3 py-1.5 text-right">
                    {outside ? <StatusPill tone="critical">Outside</StatusPill> : <StatusPill tone="success">Inside</StatusPill>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </FinanceCard>
  );
}
