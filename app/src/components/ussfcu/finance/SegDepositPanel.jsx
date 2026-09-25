import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { BellRing, Paperclip } from 'lucide-react';
import FinanceCard, { StatusPill } from './FinanceCard';
import RiskRead from './RiskRead';
import { getSegDeposits } from '../../../data/ussfcu/finance';
import { SEG_OUTFLOW_TRIGGER_PCT, SEG_A_OUTFLOW_MIX, SEG_GROUPS, segTotals, fmtM, fmtSignedPct, fmtInt } from '../../../data/ussfcu/finance/constants';

/**
 * Step 7 · Automated Action — "Deposit activity by SEG as bars with amount and
 * count, the flagged group in red crossing the 3% outflow trigger, and an
 * alert card with the attached detail." The bars show month-over-month change
 * against the trigger line; the table under them carries amount and count.
 * SEG groups are anonymised: the figures are illustrative.
 */
function barColor(d) {
  if (d.triggered) return 'var(--color-critical)';
  if (d.momChange < 0) return 'var(--color-warning)';
  return 'var(--color-success)';
}

function statusFor(d) {
  if (d.triggered) return <StatusPill tone="critical">Alert</StatusPill>;
  if (d.momChange < 0) return <StatusPill tone="warning">Trending down</StatusPill>;
  return <StatusPill tone="success">Stable</StatusPill>;
}

export default function SegDepositPanel({ eyebrow = 'Automated Action' }) {
  const segs = getSegDeposits();
  const totals = segTotals();
  const flagged = segs.find((d) => d.triggered);
  const flaggedRaw = SEG_GROUPS.find((g) => g.id === flagged.id);
  const outflow = flaggedRaw.lastM - flaggedRaw.thisM;
  const certShare = SEG_A_OUTFLOW_MIX.certificateClosuresM / outflow;
  const down = segs.filter((d) => d.momChange < 0).length;
  const chartData = segs.map((d) => ({ ...d, short: d.seg.replace('Payroll group ', 'Payroll ') }));

  return (
    <FinanceCard
      eyebrow={eyebrow}
      title="Deposit activity by core SEG · this month vs. last"
      aside={<StatusPill tone="success">Total {fmtSignedPct(totals.changePct)}</StatusPill>}
      footnote="Source: Jack Henry Symitar (deposit transactions by SEG). SEG groups are anonymised."
    >
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <RiskRead
          label="All core SEGs"
          value={fmtSignedPct(totals.changePct)}
          limit={`${fmtM(totals.thisM, 1)} this month`}
          status="Funding stable"
          tone="success"
          trend={[totals.lastM, totals.thisM]}
          source="Symitar"
        />
        <RiskRead
          label="Payroll groups trending down"
          value={`${down}`}
          limit={`${segs.length} core SEGs tracked`}
          status="Watch"
          tone="warning"
          source="Symitar"
        />
        <RiskRead
          label={flagged.seg}
          value={fmtSignedPct(flagged.momChange)}
          limit={`Outflow trigger −${SEG_OUTFLOW_TRIGGER_PCT}%`}
          status="Past the trigger"
          tone="critical"
          trend={[flaggedRaw.lastM, flaggedRaw.thisM]}
          source="Symitar"
        />
      </div>

      <div className="mb-3 min-w-0 rounded-lg border border-border-subtle bg-surface p-3">
        <p className="mb-1 text-[11px] font-semibold text-text">Month-over-month change by SEG</p>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={chartData} margin={{ top: 16, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)" />
            <XAxis dataKey="short" tick={{ fontSize: 10, fill: 'var(--color-chart-axis)' }} axisLine={false} tickLine={false} interval={0} />
            <YAxis
              domain={[-5, 5]}
              ticks={[-5, -3, 0, 3, 5]}
              tick={{ fontSize: 10, fill: 'var(--color-chart-axis)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(v, _n, { payload }) => [`${fmtSignedPct(v)} · ${fmtM(payload.amount, 1)} · ${fmtInt(payload.count)} accounts`, payload.seg]}
              labelFormatter={() => ''}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--color-border)' }}
            />
            <ReferenceLine y={0} stroke="var(--color-border)" />
            <ReferenceLine
              y={-SEG_OUTFLOW_TRIGGER_PCT}
              stroke="var(--color-critical)"
              strokeDasharray="4 4"
              label={{ value: `Outflow trigger −${SEG_OUTFLOW_TRIGGER_PCT}%`, fill: 'var(--color-critical)', fontSize: 9, position: 'insideBottomRight' }}
            />
            <Bar dataKey="momChange" radius={[3, 3, 3, 3]} maxBarSize={34} animationDuration={700}>
              {chartData.map((d) => (
                <Cell key={d.id} fill={barColor(d)} />
              ))}
              <LabelList dataKey="momChange" position="top" formatter={(v) => fmtSignedPct(v)} style={{ fontSize: 9.5, fill: 'var(--color-text-muted)' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-3 flex flex-wrap items-start gap-3 rounded-lg border border-critical/25 bg-critical-subtle p-3">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-critical text-white">
          <BellRing className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11.5px] font-semibold text-critical">
            Alert raised · {flagged.seg} {fmtSignedPct(flagged.momChange)} vs. last month
          </p>
          <p className="mt-0.5 text-[10.5px] leading-relaxed text-text-muted">
            Rule: alert when a SEG group&apos;s balances fall more than {SEG_OUTFLOW_TRIGGER_PCT}% month over month. {fmtM(outflow, 1)} left;{' '}
            mostly certificate closures chasing a competitor promotional rate rather than full attrition.
          </p>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-surface" aria-hidden="true">
            <div className="h-full bg-critical" style={{ width: `${certShare * 100}%` }} />
            <div className="h-full bg-critical/30" style={{ width: `${(1 - certShare) * 100}%` }} />
          </div>
          <div className="mt-1 flex flex-wrap justify-between gap-2 text-[9.5px] text-text-muted">
            <span>Certificate closures {fmtM(SEG_A_OUTFLOW_MIX.certificateClosuresM, 2)}</span>
            <span>Other outflow {fmtM(SEG_A_OUTFLOW_MIX.otherM, 2)}</span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-text">
            <Paperclip className="h-3 w-3" /> Detail attached: accounts, balances and closures for {flagged.seg}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface">
        <table className="w-full min-w-[480px] text-[11px]">
          <thead>
            <tr className="border-b border-border-subtle text-[9.5px] uppercase tracking-wide text-text-subtle">
              <th className="px-3 py-2 text-left font-semibold">SEG group</th>
              <th className="px-2 py-2 text-right font-semibold">Amount</th>
              <th className="px-2 py-2 text-right font-semibold">Accounts</th>
              <th className="px-2 py-2 text-right font-semibold">Change</th>
              <th className="px-3 py-2 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {segs.map((d) => (
              <tr key={d.id} className={`border-b border-border-subtle ${d.triggered ? 'bg-critical-subtle/60' : ''}`}>
                <td className={`px-3 py-1.5 text-left font-medium ${d.triggered ? 'text-critical' : 'text-text'}`}>{d.seg}</td>
                <td className="px-2 py-1.5 text-right tabular-nums text-text">{fmtM(d.amount, 1)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums text-text">
                  {fmtInt(d.count)}{' '}
                  <span className={d.countChange < 0 ? 'text-critical' : 'text-text-subtle'}>
                    ({d.countChange < 0 ? '−' : '+'}{fmtInt(Math.abs(d.countChange))})
                  </span>
                </td>
                <td className={`px-2 py-1.5 text-right font-semibold tabular-nums ${d.triggered ? 'text-critical' : d.momChange < 0 ? 'text-warning' : 'text-success'}`}>
                  {fmtSignedPct(d.momChange)}
                </td>
                <td className="px-3 py-1.5 text-right">{statusFor(d)}</td>
              </tr>
            ))}
            <tr className="bg-surface-2">
              <td className="px-3 py-1.5 text-left font-semibold text-text">All core SEGs</td>
              <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-text">{fmtM(totals.thisM, 1)}</td>
              <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-text">{fmtInt(segs.reduce((n, d) => n + d.count, 0))}</td>
              <td className="px-2 py-1.5 text-right font-bold tabular-nums text-success">{fmtSignedPct(totals.changePct)}</td>
              <td className="px-3 py-1.5 text-right">
                <StatusPill tone="success">Funding stable</StatusPill>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </FinanceCard>
  );
}
