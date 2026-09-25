import { Users, TrendingDown } from 'lucide-react';
import FinanceCard, { StatusPill } from './FinanceCard';
import { getShockScenario } from '../../../data/ussfcu/finance';
import { membersAffected, membersDrawingDown, membersDelayingPayment, fmtPct, fmtInt } from '../../../data/ussfcu/finance/constants';

/**
 * Step 4 · Predictive Intelligence — "Shutdown-scenario impact panel: members
 * affected, deposit drawdown and payment-delay rates, projected delinquency by
 * segment (Home Improvement Loan leading), and modeled loss over two
 * quarters." Modeled on USS FCU's own members, not industry averages. The
 * member funnel reads left to right: affected, then what they do.
 */
const MAX_DQ = 3.5;

export default function ScenarioImpactTable({ eyebrow = 'Predictive Intelligence' }) {
  const s = getShockScenario();
  const funnel = [
    { label: 'Affected members', pct: s.membersAffectedPct, of: 'of all members', count: membersAffected(), tone: 'bg-brand' },
    { label: 'Draw down deposits', pct: s.depositDrawdownPct, of: 'of affected members', count: membersDrawingDown(), tone: 'bg-warning' },
    { label: 'Delay a loan payment', pct: s.paymentDelayPct, of: 'of affected members', count: membersDelayingPayment(), tone: 'bg-critical' },
  ];

  return (
    <FinanceCard
      eyebrow={eyebrow}
      title={`Scenario: ${s.scenario}, modeled as an employment shock`}
      aside={<StatusPill tone="brand">Calibrated to our members</StatusPill>}
      footnote="Sources: UST Finex (asset-liability model), Symitar (member and portfolio history)."
    >
      <div className="mb-3 grid grid-cols-1 gap-2 lg:grid-cols-3">
        {/* Member behaviour */}
        <div className="min-w-0 rounded-lg border border-border-subtle bg-surface p-3 lg:col-span-2">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-subtle">
            <Users className="h-3.5 w-3.5" /> Member behaviour in a {s.days}-day shutdown
          </p>
          <div className="space-y-2.5">
            {funnel.map((f) => (
              <div key={f.label}>
                <div className="flex items-baseline justify-between gap-2 text-[11px]">
                  <span className="font-medium text-text">{f.label}</span>
                  <span className="tabular-nums text-text-muted">
                    <span className="text-[13px] font-bold text-text">{f.pct}%</span> {f.of} · ~{fmtInt(f.count)}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-surface-2" aria-hidden="true">
                  <div className={`h-full rounded-full ${f.tone}`} style={{ width: `${Math.max(f.pct, 2)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modeled loss */}
        <div className="flex min-w-0 flex-col justify-between rounded-lg border border-critical/25 bg-critical-subtle p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-critical">
            <TrendingDown className="h-3.5 w-3.5" /> Modeled loan losses
          </p>
          <p className="mt-2 text-[26px] font-bold leading-none tabular-nums text-critical">+${s.lossOverTwoQuarters.toFixed(1)}M</p>
          <p className="mt-1.5 text-[10.5px] text-text-muted">Over two quarters, led by the Home Improvement Loan book</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface">
        <table className="w-full min-w-[480px] text-[11px]">
          <thead>
            <tr className="border-b border-border-subtle text-[9.5px] uppercase tracking-wide text-text-subtle">
              <th className="px-3 py-2 text-left font-semibold">Segment</th>
              <th className="px-2 py-2 text-right font-semibold">Today</th>
              <th className="px-2 py-2 text-right font-semibold">Projected</th>
              <th className="w-[38%] px-3 py-2 text-left font-semibold">60-day delinquency, today → projected</th>
            </tr>
          </thead>
          <tbody>
            {s.delinquencyBySegment.map((d, i) => {
              const lead = i === 0;
              return (
                <tr key={d.id} className={`border-b border-border-subtle last:border-0 ${lead ? 'bg-critical-subtle/60' : ''}`}>
                  <td className={`px-3 py-1.5 font-medium ${lead ? 'text-critical' : 'text-text'}`}>
                    {d.segment}
                    {lead ? <span className="ml-1.5"><StatusPill tone="critical">Leading</StatusPill></span> : null}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-text-muted">{fmtPct(d.before, 2)}</td>
                  <td className={`px-2 py-1.5 text-right font-semibold tabular-nums ${lead ? 'text-critical' : 'text-text'}`}>{fmtPct(d.after, 2)}</td>
                  <td className="px-3 py-1.5">
                    <div className="relative h-2.5 rounded-full bg-surface-2" aria-hidden="true">
                      <span className="absolute inset-y-0 left-0 rounded-l-full bg-text-subtle/40" style={{ width: `${(d.before / MAX_DQ) * 100}%` }} />
                      <span
                        className={`absolute inset-y-0 rounded-r-full ${lead ? 'bg-critical' : 'bg-warning'}`}
                        style={{ left: `${(d.before / MAX_DQ) * 100}%`, width: `${((d.after - d.before) / MAX_DQ) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-text-muted">
        Calibrated to our own members, the impact lands sharper and faster than a generic ALM shock would show.
      </p>
    </FinanceCard>
  );
}
