import FinanceCard, { StatusPill } from './FinanceCard';
import {
  CONCENTRATION_LIMITS,
  NET_WORTH_M,
  MORTGAGE_GROWTH_PER_QUARTER_M,
  LOAN_MIX,
  pctOfNetWorth,
  capUsePct,
  headroomM,
  fmtM,
} from '../../../data/ussfcu/finance/constants';

/**
 * Q2 · Converged Conversation — each portfolio against its board
 * risk-tolerance limit (as % of net worth), plotted as share of the cap used.
 * First mortgage is the one inside the fifteen-point band.
 */
const BAND_PCT = 85; // "within fifteen points of its limit"

export default function ConcentrationLimitsPanel() {
  const rows = CONCENTRATION_LIMITS.map((c) => ({
    ...c,
    ofNw: pctOfNetWorth(c.balanceM),
    used: capUsePct(c.balanceM, c.capPctOfNw),
    headroom: headroomM(c.balanceM, c.capPctOfNw),
  })).sort((a, b) => b.used - a.used);
  const fm = rows.find((r) => r.id === 'first_mortgage');
  const quartersToCap = fm.headroom / MORTGAGE_GROWTH_PER_QUARTER_M;
  const directAuto = LOAN_MIX.find((l) => l.id === 'direct_auto');

  return (
    <FinanceCard
      eyebrow="Converged Conversation"
      title="Portfolios vs. board risk-tolerance limits"
      aside={<StatusPill tone="warning">1 portfolio close</StatusPill>}
      footnote={`Limits are set as a percentage of net worth (${fmtM(NET_WORTH_M, 2)}, from the general ledger). The shaded band is the last fifteen points before a limit. ${directAuto.label} (${fmtM(directAuto.balanceM)}) carries no separate concentration limit.`}
    >
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-warning/30 bg-warning-subtle p-3">
          <p className="text-[9.5px] font-semibold uppercase tracking-wide text-warning">First mortgage</p>
          <p className="mt-0.5 text-[18px] font-bold leading-tight tabular-nums text-text">{Math.round(fm.ofNw)}%</p>
          <p className="text-[10px] text-text-muted">of net worth · cap {fm.capPctOfNw}% · {fmtM(fm.balanceM)}</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface p-3">
          <p className="text-[9.5px] font-semibold uppercase tracking-wide text-text-subtle">Headroom to the cap</p>
          <p className="mt-0.5 text-[18px] font-bold leading-tight tabular-nums text-text">about {fmtM(Math.floor(fm.headroom))}</p>
          <p className="text-[10px] text-text-muted">before the 600% limit</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface p-3">
          <p className="text-[9.5px] font-semibold uppercase tracking-wide text-text-subtle">At the current pace</p>
          <p className="mt-0.5 text-[18px] font-bold leading-tight tabular-nums text-text">~{Math.round(quartersToCap)} quarters</p>
          <p className="text-[10px] text-text-muted">to the cap, at +{fmtM(MORTGAGE_GROWTH_PER_QUARTER_M)} a quarter</p>
        </div>
      </div>

      <ul className="space-y-2.5 rounded-lg border border-border-subtle bg-surface p-3">
        {rows.map((r) => {
          const close = r.used >= BAND_PCT;
          return (
            <li key={r.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span className={`text-[11.5px] font-semibold ${close ? 'text-warning' : 'text-text'}`}>{r.label}</span>
                <span className="text-[10.5px] tabular-nums text-text-muted">
                  {fmtM(r.balanceM)} · <span className="font-semibold text-text">{Math.round(r.ofNw)}%</span> of net worth vs. {r.capPctOfNw}% cap
                </span>
              </div>
              <div className="relative mt-1 h-2.5 overflow-hidden rounded-full bg-surface-2">
                <div className="absolute inset-y-0 bg-warning/15" style={{ left: `${BAND_PCT}%`, right: 0 }} aria-hidden="true" />
                <div
                  className={`relative h-full rounded-full ${close ? 'bg-warning' : 'bg-brand/70'}`}
                  style={{ width: `${Math.min(100, r.used)}%` }}
                />
              </div>
              <p className="mt-0.5 text-[9.5px] tabular-nums text-text-subtle">
                {Math.round(r.used)}% of the limit used · {Math.round(100 - r.used)} points from it
              </p>
            </li>
          );
        })}
      </ul>
    </FinanceCard>
  );
}
