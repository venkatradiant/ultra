import { ArrowRight } from 'lucide-react';
import FinanceCard, { StatusPill } from './FinanceCard';
import {
  STRESS,
  LIQUIDITY,
  NW_EARLY_WARNING_PCT,
  FUNDING_REVIEW_TRIGGER_LTS_PCT,
  liquiditySpareM,
  fmtM,
  fmtPct,
} from '../../../data/ussfcu/finance/constants';

/**
 * Q4 · Anomaly Detection — the cushion under the +100 bp scenario. Capital
 * holds and liquidity covers the quarter; loan-to-share is the pressure point,
 * reaching the level that triggers the funding review.
 */
function Measure({ label, base, stressed, floorLabel, tone, verdict }) {
  return (
    <div className={`flex min-w-0 flex-col rounded-lg border p-3 ${tone === 'warning' ? 'border-warning/30 bg-warning-subtle' : 'border-border-subtle bg-surface'}`}>
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-subtle">{label}</p>
        {verdict}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-bold tabular-nums text-text-muted">{base}</span>
        <ArrowRight className="h-3.5 w-3.5 text-text-subtle" />
        <span className={`text-[20px] font-bold tabular-nums ${tone === 'warning' ? 'text-warning' : 'text-text'}`}>{stressed}</span>
      </div>
      <p className="mt-1 text-[10px] leading-snug text-text-muted">{floorLabel}</p>
    </div>
  );
}

function LiquidityBar({ label, scenario }) {
  const spare = liquiditySpareM(scenario);
  const scale = LIQUIDITY.base.onHandM;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-[10.5px]">
        <span className="font-semibold text-text">{label}</span>
        <span className="tabular-nums text-text-muted">
          {fmtM(scenario.onHandM)} on hand · {fmtM(scenario.projectedOutflowsM)} out · <span className="font-semibold text-success">{fmtM(spare)} spare</span>
        </span>
      </div>
      <div className="relative mt-1 h-3 overflow-hidden rounded-full bg-surface-2">
        <div className="absolute inset-y-0 left-0 rounded-full bg-success/25" style={{ width: `${(scenario.onHandM / scale) * 100}%` }} />
        <div className="absolute inset-y-0 left-0 rounded-full bg-brand/70" style={{ width: `${(scenario.projectedOutflowsM / scale) * 100}%` }} />
      </div>
    </div>
  );
}

export default function CapitalLiquidityStress() {
  const { base, plus100 } = STRESS;
  return (
    <FinanceCard
      eyebrow="Anomaly Detection"
      title="Dry powder under the +100 bp scenario"
      aside={<StatusPill tone="warning">Pressure point: loan-to-share</StatusPill>}
      footnote={`Well capitalized at ${fmtPct(NW_EARLY_WARNING_PCT)} or above (the NCUA threshold, and the early-warning line). The +100 bp on-hand figure carries the investment-portfolio mark from the rate shock.`}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Measure
          label="Net worth ratio"
          base={fmtPct(base.nwRatioPct, 2)}
          stressed={`~${fmtPct(plus100.nwRatioPct)}`}
          floorLabel={`Still well capitalized · floor ${fmtPct(NW_EARLY_WARNING_PCT)}`}
          verdict={<StatusPill tone="success">Holds</StatusPill>}
        />
        <Measure
          label="Liquidity to spare (quarter)"
          base={fmtM(liquiditySpareM(LIQUIDITY.base))}
          stressed={`~${fmtM(liquiditySpareM(LIQUIDITY.plus100))}`}
          floorLabel="On-hand liquidity covers projected outflows"
          verdict={<StatusPill tone="success">Covered</StatusPill>}
        />
        <Measure
          label="Loan-to-share"
          base={`${base.ltsPct}%`}
          stressed={`${plus100.ltsPct}%`}
          floorLabel={`Funding review is triggered at ${FUNDING_REVIEW_TRIGGER_LTS_PCT}%`}
          tone="warning"
          verdict={<StatusPill tone="warning">Trigger</StatusPill>}
        />
      </div>

      <div className="mt-3 space-y-2.5 rounded-lg border border-border-subtle bg-surface p-3">
        <p className="text-[11px] font-semibold text-text">Quarter liquidity · on hand vs. projected outflows</p>
        <LiquidityBar label="No shock" scenario={LIQUIDITY.base} />
        <LiquidityBar label="+100 bp" scenario={LIQUIDITY.plus100} />
        <p className="text-[10px] text-text-subtle">You have dry powder, but the scenario narrows it.</p>
      </div>
    </FinanceCard>
  );
}
