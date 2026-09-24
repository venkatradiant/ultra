import { BellRing } from 'lucide-react';
import FinanceCard, { StatusPill } from './FinanceCard';
import {
  SEG_GROUPS,
  SEG_OUTFLOW_TRIGGER_PCT,
  SEG_A_OUTFLOW_MIX,
  segChangePct,
  segTotals,
  fmtM,
  fmtSignedPct,
} from '../../../data/ussfcu/finance/constants';

/**
 * Q6 · Automated Action — deposit activity by core SEG group this month, with
 * the outflow alert rule applied. One payroll group crosses the 3% trigger and
 * is flagged; the other is trending down but inside it. The flagged outflow is
 * mostly certificate closures, not full attrition.
 */
const MAX_ABS = 5; // bar scale, % either side of zero

function statusFor(change) {
  if (change <= -SEG_OUTFLOW_TRIGGER_PCT) return <StatusPill tone="critical">Alert</StatusPill>;
  if (change < 0) return <StatusPill tone="warning">Trending down</StatusPill>;
  return <StatusPill tone="success">Stable</StatusPill>;
}

export default function SegDepositMonitor() {
  const totals = segTotals();
  const flagged = SEG_GROUPS.filter((g) => segChangePct(g) <= -SEG_OUTFLOW_TRIGGER_PCT);
  const a = flagged[0];
  const outflow = a.lastM - a.thisM;
  const certShare = SEG_A_OUTFLOW_MIX.certificateClosuresM / outflow;

  return (
    <FinanceCard
      eyebrow="Automated Action"
      title="Deposit activity by core SEG · this month vs. last"
      aside={<StatusPill tone={totals.changePct >= 0 ? 'success' : 'warning'}>Total {fmtSignedPct(totals.changePct)}</StatusPill>}
      footnote="SEG groups are anonymised: the balances are illustrative, so they are not attached to a real sponsor."
    >
      <div className="mb-3 flex flex-wrap items-start gap-3 rounded-lg border border-critical/25 bg-critical-subtle p-3">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-critical text-white">
          <BellRing className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11.5px] font-semibold text-critical">
            Alert raised · {a.label} {fmtSignedPct(segChangePct(a))} vs. last month
          </p>
          <p className="mt-0.5 text-[10.5px] leading-relaxed text-text-muted">
            Rule: alert when a SEG group&apos;s balances fall more than {SEG_OUTFLOW_TRIGGER_PCT}% month over month. {fmtM(outflow, 1)} left;{' '}
            {Math.round(certShare * 100)}% of it is certificate closures chasing a competitor promotional rate.
          </p>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-surface" aria-hidden="true">
            <div className="h-full bg-critical" style={{ width: `${certShare * 100}%` }} />
            <div className="h-full bg-critical/30" style={{ width: `${(1 - certShare) * 100}%` }} />
          </div>
          <div className="mt-1 flex flex-wrap justify-between gap-2 text-[9.5px] text-text-muted">
            <span>Certificate closures {fmtM(SEG_A_OUTFLOW_MIX.certificateClosuresM, 2)}</span>
            <span>Other outflow {fmtM(SEG_A_OUTFLOW_MIX.otherM, 2)}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface">
        <table className="w-full min-w-[480px] text-[11px]">
          <thead>
            <tr className="border-b border-border-subtle text-[9.5px] uppercase tracking-wide text-text-subtle">
              <th className="px-3 py-2 text-left font-semibold">SEG group</th>
              <th className="px-2 py-2 text-right font-semibold">Last month</th>
              <th className="px-2 py-2 text-right font-semibold">This month</th>
              <th className="w-[30%] px-2 py-2 text-center font-semibold">Change</th>
              <th className="px-3 py-2 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {SEG_GROUPS.map((g) => {
              const change = segChangePct(g);
              const width = `${(Math.min(Math.abs(change), MAX_ABS) / MAX_ABS) * 50}%`;
              const alert = change <= -SEG_OUTFLOW_TRIGGER_PCT;
              return (
                <tr key={g.id} className={`border-b border-border-subtle ${alert ? 'bg-critical-subtle/60' : ''}`}>
                  <td className={`px-3 py-1.5 text-left font-medium ${alert ? 'text-critical' : 'text-text'}`}>{g.label}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-text-muted">{fmtM(g.lastM, 1)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-text">{fmtM(g.thisM, 1)}</td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="relative h-2 flex-1 rounded-full bg-surface-2">
                        <span className="absolute inset-y-0 left-1/2 w-px bg-border" aria-hidden="true" />
                        <span
                          className={`absolute inset-y-0 rounded-full ${change < 0 ? (alert ? 'bg-critical' : 'bg-warning') : 'bg-success'}`}
                          style={change < 0 ? { right: '50%', width } : { left: '50%', width }}
                        />
                      </div>
                      <span className={`w-12 text-right font-semibold tabular-nums ${change < 0 ? (alert ? 'text-critical' : 'text-warning') : 'text-success'}`}>
                        {fmtSignedPct(change)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-right">{statusFor(change)}</td>
                </tr>
              );
            })}
            <tr className="bg-surface-2">
              <td className="px-3 py-1.5 text-left font-semibold text-text">All core SEGs</td>
              <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-text-muted">{fmtM(totals.lastM, 1)}</td>
              <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-text">{fmtM(totals.thisM, 1)}</td>
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
