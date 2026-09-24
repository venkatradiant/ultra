import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import FinanceCard, { StatusPill } from './FinanceCard';
import {
  RATE_SHOCKS,
  PUBLIC_FACTS,
  NW_EARLY_WARNING_PCT,
  fmtSignedM,
  fmtBps,
  fmtPct,
} from '../../../data/ussfcu/finance/constants';

/**
 * Q3 · Predictive Intelligence — parallel rate shocks of ±25, ±50 and ±100
 * basis points across the balance sheet. Effects are proportional and mirror
 * each other; +100 is where net worth dips toward the 7.0% early-warning line.
 */
const ordered = [...RATE_SHOCKS].sort((a, b) => a.bps - b.bps);
const chartData = ordered.map((s) => ({ shock: fmtBps(s.bps), nw: s.nwRatioPct, bps: s.bps }));

const ROWS = [
  { key: 'loanIncomeM', label: 'Loan income (12-mo)', fmt: (v) => fmtSignedM(v, 1) },
  { key: 'nimBps', label: 'Net interest margin', fmt: (v) => fmtBps(v) },
  { key: 'investmentMarkM', label: 'Investment portfolio mark', fmt: (v) => fmtSignedM(v, 1) },
  { key: 'nwRatioPct', label: 'Net worth ratio', fmt: (v) => fmtPct(v, 2) },
];

const isPressure = (s) => s.bps === 100;

export default function RateShockMatrix() {
  return (
    <FinanceCard
      eyebrow="Predictive Intelligence"
      title="Rate shock across the balance sheet · ±25, ±50, ±100 bp"
      aside={<StatusPill tone="warning">+100 bp nears 7.0%</StatusPill>}
      footnote={`Parallel, instantaneous shocks from today's ${fmtPct(PUBLIC_FACTS.netWorthRatioPct, 2)} net worth ratio. Deposits reprice faster than loans on the way up, so margin compresses while loan income rises.`}
    >
      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface">
        <table className="w-full min-w-[520px] text-[11px]">
          <thead>
            <tr className="border-b border-border-subtle text-[10px] text-text-subtle">
              <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide">Shock</th>
              {ordered.map((s) => (
                <th
                  key={s.bps}
                  className={`px-2 py-2 text-right font-bold tabular-nums ${isPressure(s) ? 'bg-warning-subtle text-warning' : 'text-text'}`}
                >
                  {fmtBps(s.bps)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.key} className="border-b border-border-subtle last:border-0">
                <td className="px-3 py-1.5 text-left font-medium text-text-muted">{row.label}</td>
                {ordered.map((s) => (
                  <td
                    key={s.bps}
                    className={`px-2 py-1.5 text-right tabular-nums ${isPressure(s) ? 'bg-warning-subtle/70 font-semibold text-text' : 'text-text'}`}
                  >
                    {row.fmt(s[row.key])}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="px-3 py-1.5 text-left font-medium text-text-muted">Policy</td>
              {ordered.map((s) => (
                <td key={s.bps} className={`px-2 py-1.5 text-right ${isPressure(s) ? 'bg-warning-subtle/70' : ''}`}>
                  {isPressure(s) ? <StatusPill tone="warning">Watch</StatusPill> : <StatusPill tone="success">Inside</StatusPill>}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-lg border border-border-subtle bg-surface p-3">
        <p className="mb-2 text-[11px] font-semibold text-text">Net worth ratio by shock</p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData} margin={{ top: 6, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)" />
            <XAxis dataKey="shock" tick={{ fontSize: 10, fill: 'var(--color-chart-axis)' }} axisLine={false} tickLine={false} />
            <YAxis domain={[6.5, 8.0]} ticks={[6.5, 7.0, 7.5, 8.0]} tick={{ fontSize: 10, fill: 'var(--color-chart-axis)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(1)}%`} />
            <Tooltip formatter={(v) => [fmtPct(v, 2), 'Net worth ratio']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--color-border)' }} />
            <ReferenceLine
              y={NW_EARLY_WARNING_PCT}
              stroke="var(--color-critical)"
              strokeDasharray="4 4"
              label={{ value: `Early-warning line ${fmtPct(NW_EARLY_WARNING_PCT)}`, fill: 'var(--color-critical)', fontSize: 9, position: 'insideBottomRight' }}
            />
            <Bar dataKey="nw" radius={[4, 4, 0, 0]} animationDuration={800}>
              {chartData.map((d) => (
                <Cell key={d.bps} fill={d.bps === 100 ? 'var(--color-warning)' : 'var(--color-brand)'} fillOpacity={d.bps === 100 ? 1 : 0.75} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </FinanceCard>
  );
}
