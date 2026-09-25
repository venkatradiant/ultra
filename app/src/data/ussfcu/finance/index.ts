/**
 * Fiona's data layer (spec §12): every mock source behind a getter that
 * returns the spec's interface. Today each getter reads constants.ts; a live
 * feed (Symitar, UST Finex, Greenplum) replaces the getter body, not the
 * components.
 */
import signalsJson from './signals.json';
import currentState from './currentState.json';
import journey from './journey.json';
import {
  KPIS,
  DQ_QUARTERS,
  DQ_SEGMENTS,
  HIL_PARAMETER_PCT,
  HIL_DRIVER,
  MORTGAGE_GROWTH_PER_QUARTER_M,
  QUARTERS_TO_CAP,
  NEAR_LIMIT_POINTS,
  PORTFOLIO_LIMITS,
  pctOfNetWorth,
  headroomM,
  SHUTDOWN,
  CUSHION,
  NW_EARLY_WARNING_PCT,
  FUNDING_REVIEW_TRIGGER_LTS_PCT,
  CAPITAL_RECONCILIATION,
  PLAYBOOK,
  SEG_GROUPS,
  SEG_OUTFLOW_TRIGGER_PCT,
  segChangePct,
} from './constants';
import type { Signal, Kpi, PortfolioLimit, ShockScenario, CapitalLiquidity, PlaybookAction, SegDeposit } from './types';

export type * from './types';

export const getSignals = (): Signal[] => signalsJson as Signal[];

export const getKpis = (): Kpi[] => KPIS.map((k) => ({ ...k }) as Kpi);

/** Step 2's eight-quarter delinquency trend (no spec interface; same shape idea). */
export const getDelinquencyTrend = () => ({
  quarters: [...DQ_QUARTERS],
  parameter: HIL_PARAMETER_PCT,
  driver: HIL_DRIVER,
  segments: DQ_SEGMENTS.map((s) => ({ id: s.id, segment: s.label, series: [...s.series], flagged: s.flagged })),
});

/** Step 3's projection inputs. */
export const getLimitProjection = () => ({
  growthPerQuarter: MORTGAGE_GROWTH_PER_QUARTER_M,
  quartersToCap: QUARTERS_TO_CAP,
  nearLimitPoints: NEAR_LIMIT_POINTS,
});

export const getPortfolioLimits = (): PortfolioLimit[] =>
  PORTFOLIO_LIMITS.map((p) => ({
    id: p.id,
    portfolio: p.label,
    balance: p.balanceM,
    pctOfNetWorth: pctOfNetWorth(p.balanceM),
    cap: p.capPctOfNw,
    headroom: headroomM(p.balanceM, p.capPctOfNw),
  }));

export const getShockScenario = (): ShockScenario => ({
  scenario: SHUTDOWN.scenario,
  days: SHUTDOWN.days,
  membersAffectedPct: SHUTDOWN.membersAffectedPct,
  depositDrawdownPct: SHUTDOWN.depositDrawdownPct,
  paymentDelayPct: SHUTDOWN.paymentDelayPct,
  delinquencyBySegment: SHUTDOWN.projectedDq.map((s) => ({ id: s.id, segment: s.label, before: s.beforePct, after: s.afterPct })),
  lossOverTwoQuarters: SHUTDOWN.lossOverTwoQuartersM,
  netWorthAfter: CUSHION.after.nwRatioPct,
});

export const getCapitalLiquidity = (): CapitalLiquidity => ({
  netWorthBefore: CUSHION.before.nwRatioPct,
  netWorthAfter: CUSHION.after.nwRatioPct,
  earlyWarning: NW_EARLY_WARNING_PCT,
  liquiditySurplusBefore: CUSHION.before.liquiditySurplusM,
  liquiditySurplus: CUSHION.after.liquiditySurplusM,
  loanToShareBefore: CUSHION.before.ltsPct,
  loanToShareAfter: CUSHION.after.ltsPct,
  trigger: FUNDING_REVIEW_TRIGGER_LTS_PCT,
  reconciliation: CAPITAL_RECONCILIATION.map((r) => ({ id: r.id, layer: r.layer, system: r.system, netWorth: r.netWorthM, ratio: r.nwRatioPct })),
});

export const getPlaybookActions = (): PlaybookAction[] =>
  PLAYBOOK.bands.flatMap((b) => b.actions.map((action) => ({ band: b.band, range: b.range, action, recommendedFlag: b.recommended })));

export const getSegDeposits = (): SegDeposit[] =>
  SEG_GROUPS.map((g) => {
    const momChange = segChangePct(g);
    return {
      id: g.id,
      seg: g.label,
      amount: g.thisM,
      count: g.thisCount,
      countChange: g.thisCount - g.lastCount,
      momChange,
      triggered: momChange <= -SEG_OUTFLOW_TRIGGER_PCT,
    };
  });

// ─── Spec §8 and §9, for the shared process components ─────────────────────
/** How Fiona answers a portfolio-and-scenario question today, and the five interventions (spec §8). */
export async function getCurrentState() {
  return currentState;
}

/** Fiona's journey from the morning signal to a recommendation, with its traceability (spec §9). */
export async function getJourney() {
  return journey;
}
