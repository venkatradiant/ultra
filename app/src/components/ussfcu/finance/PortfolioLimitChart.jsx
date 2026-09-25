import FinanceCard, { StatusPill } from './FinanceCard';
import RiskRead from './RiskRead';
import { getPortfolioLimits, getLimitProjection } from '../../../data/ussfcu/finance';
import { NET_WORTH_M, fmtM } from '../../../data/ussfcu/finance/constants';

/**
 * Step 3 · Converged Conversation — "Portfolio-versus-limit horizontal bars
 * with headroom shaded, first mortgage nearest the 600% line, a two-quarter
 * projection marker." Each bar is the portfolio's share of its own board cap,
 * so every limit sits on the same line. The shaded band after each bar is
 * its headroom; the amber zone before the cap is "within fifteen points".
 */
const SCALE = 110; // % of cap shown across the bar
const at = (pctOfCap) => `${(Math.min(pctOfCap, SCALE) / SCALE) * 100}%`;

export default function PortfolioLimitChart({ eyebrow = 'Converged Conversation' }) {
  const limits = getPortfolioLimits();
  const { growthPerQuarter, quartersToCap, nearLimitPoints } = getLimitProjection();
  const use = (p) => (p.pctOfNetWorth / p.cap) * 100;
  const sorted = [...limits].sort((a, b) => use(b) - use(a));
  const fm = limits.find((p) => p.id === 'first_mortgage');
  const projectedBalance = fm.balance + growthPerQuarter * quartersToCap;
  const projectedUse = (projectedBalance / NET_WORTH_M / (fm.cap / 100)) * 100;
  const history = [3, 2, 1, 0].map((q) => ((fm.balance - q * growthPerQuarter) / NET_WORTH_M) * 100);
  const nextClosest = sorted.find((p) => p.id !== 'first_mortgage');

  return (
    <FinanceCard
      eyebrow={eyebrow}
      title="Portfolios against board risk-tolerance limits"
      aside={<StatusPill tone="warning">1 portfolio near its limit</StatusPill>}
      footnote={`Limits are percent of net worth (${fmtM(NET_WORTH_M, 2)}). Sources: Symitar, Cornerstone, UST Finex (portfolio balance, capital position, risk limits).`}
    >
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <RiskRead
          label="First mortgage, % of net worth"
          value={`${Math.round(fm.pctOfNetWorth)}%`}
          limit={`Board cap ${fm.cap}% · ${fmtM(fm.balance)} balance`}
          status={`About ${fmtM(Math.floor(fm.headroom))} headroom`}
          tone="warning"
          trend={history}
          source="Symitar + Cornerstone + UST Finex"
        />
        <RiskRead
          label="Cap reached at current pace"
          value={`~${quartersToCap} quarters`}
          limit={`First mortgage growing ${fmtM(growthPerQuarter)} a quarter`}
          status="Projection"
          tone="warning"
          trend={[...history, ((projectedBalance - growthPerQuarter) / NET_WORTH_M) * 100, (projectedBalance / NET_WORTH_M) * 100]}
          source="UST Finex"
        />
        <RiskRead
          label="Next closest portfolio"
          value={`${Math.round(use(nextClosest))}% of cap`}
          limit={`${nextClosest.portfolio} · none other within ${nearLimitPoints} points`}
          status="Inside limits"
          tone="success"
          source="Symitar + Cornerstone"
        />
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface p-3">
        {/* Axis: share of each portfolio's own cap. */}
        <div className="relative mb-1 h-3 text-[9px] tabular-nums text-text-subtle" aria-hidden="true">
          {[0, 25, 50, 75, 100].map((t) => (
            <span key={t} className="absolute -translate-x-1/2" style={{ left: at(t) }}>
              {t === 100 ? 'Cap' : `${t}%`}
            </span>
          ))}
        </div>
        <div className="space-y-4">
          {sorted.map((p) => {
            const u = use(p);
            const near = u >= 100 - nearLimitPoints;
            return (
              <div key={p.id}>
                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-[11px]">
                  <span className={`font-semibold ${near ? 'text-warning' : 'text-text'}`}>{p.portfolio}</span>
                  <span className="tabular-nums text-text-muted">
                    {fmtM(p.balance)} · {Math.round(p.pctOfNetWorth)}% of net worth vs {p.cap}% cap ·{' '}
                    <span className={near ? 'font-semibold text-warning' : ''}>{fmtM(Math.floor(p.headroom))} headroom</span>
                  </span>
                </div>
                <div className="relative h-5 rounded bg-surface-2">
                  {/* Within fifteen points of the cap. */}
                  <div
                    className="absolute inset-y-0 bg-warning/10"
                    style={{ left: at(100 - nearLimitPoints), width: `${(nearLimitPoints / SCALE) * 100}%` }}
                    aria-hidden="true"
                  />
                  {/* Headroom, shaded from the bar's end to the cap line. */}
                  <div
                    className="absolute inset-y-1 rounded-r bg-success/20"
                    style={{ left: at(u), width: `${((100 - u) / SCALE) * 100}%` }}
                    aria-hidden="true"
                  />
                  <div
                    className={`absolute inset-y-0 left-0 flex items-center justify-end rounded-l pr-1.5 text-[9.5px] font-bold text-white ${near ? 'bg-warning' : 'bg-brand/70'}`}
                    style={{ width: at(u) }}
                  >
                    {Math.round(u)}%
                  </div>
                  {/* The board cap. */}
                  <div className="absolute -inset-y-1 w-0.5 bg-critical" style={{ left: at(100) }} aria-hidden="true" />
                  {p.id === 'first_mortgage' ? (
                    <div
                      className="absolute -inset-y-1.5 w-0 border-l-2 border-dashed border-text"
                      style={{ left: at(projectedUse) }}
                      title={`Projected in ${quartersToCap} quarters: ${fmtM(projectedBalance)}`}
                      aria-hidden="true"
                    >
                      <span className="absolute -top-4 left-1 whitespace-nowrap text-[9px] font-semibold text-text">+{quartersToCap} qtrs</span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[9.5px] text-text-subtle">
          <span className="flex items-center gap-1.5"><span className="h-3 w-0.5 bg-critical" /> Board cap ({fm.cap}% of net worth for first mortgage)</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-3 rounded-sm bg-success/20" /> Headroom</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-3 rounded-sm bg-warning/15" /> Within {nearLimitPoints} points</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-0 border-l-2 border-dashed border-text" /> First mortgage in {quartersToCap} quarters at the current pace</span>
        </div>
      </div>
    </FinanceCard>
  );
}
