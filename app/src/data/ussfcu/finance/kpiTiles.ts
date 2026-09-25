/**
 * Spec §7's eight KPIs as the tiles the briefing (and the Portfolio and
 * Limits page) render. Each briefing tile opens the turn that explains it.
 */
import { Scale, Percent, Home, Hammer, TrendingUp, PiggyBank, Droplets, Users } from 'lucide-react';
import type { StatTile } from '@core/types';
import { KPIS, FINANCE_CHIPS } from './constants';

export type FinanceKpiTile = StatTile & {
  target: string;
  fullName: string;
  fullValue: string;
  fullTarget: string;
  source: string;
  calc: string;
  kpiTrend: string;
  publicProfile: boolean;
};

/**
 * A slightly shorter tile wording for the briefing. The spec's full KPI name,
 * value and target stay in constants.ts and show in the tile's tooltip.
 */
const SHORT: Record<(typeof KPIS)[number]['id'], { label: string; value?: string; target?: string }> = {
  net_worth: { label: 'Net worth ratio' },
  loan_to_share: { label: 'Loan-to-share ratio' },
  first_mortgage_nw: { label: 'First mortgage, % of net worth' },
  hil_dq: { label: 'Home Improvement Loan 60-day delinquency', target: 'At or below 1.5%' },
  loan_growth: { label: 'Loan growth, YTD' },
  share_growth: { label: 'Share (deposit) growth, YTD' },
  shutdown_liquidity: { label: 'Liquidity surplus, 30-day shutdown', value: '~$35M', target: 'Positive quarter coverage' },
  seg_deposits: { label: 'SEG deposits, month over month', value: '+0.6%', target: 'One group −4.2% · trigger −3%' },
};

/**
 * Icon and tone per tile, as in the other USSFCU personas' KPI carousel.
 * `positive` colours the target line: on target (green) or watch (amber).
 */
const LOOK: Record<(typeof KPIS)[number]['id'], Pick<StatTile, 'icon' | 'iconColor' | 'iconBg' | 'positive'>> = {
  net_worth: { icon: Scale, iconColor: 'text-brand', iconBg: 'bg-brand/10', positive: true },
  loan_to_share: { icon: Percent, iconColor: 'text-warning', iconBg: 'bg-warning-subtle', positive: false },
  first_mortgage_nw: { icon: Home, iconColor: 'text-warning', iconBg: 'bg-warning-subtle', positive: false },
  hil_dq: { icon: Hammer, iconColor: 'text-critical', iconBg: 'bg-critical-subtle', positive: false },
  loan_growth: { icon: TrendingUp, iconColor: 'text-brand', iconBg: 'bg-brand/10', positive: false },
  share_growth: { icon: PiggyBank, iconColor: 'text-brand', iconBg: 'bg-brand/10', positive: true },
  shutdown_liquidity: { icon: Droplets, iconColor: 'text-success', iconBg: 'bg-success-subtle', positive: true },
  seg_deposits: { icon: Users, iconColor: 'text-warning', iconBg: 'bg-warning-subtle', positive: false },
};

/** KPI id → the turn it opens. */
const OPENS: Record<(typeof KPIS)[number]['id'], string> = {
  net_worth: FINANCE_CHIPS.cushion,
  loan_to_share: FINANCE_CHIPS.cushion,
  first_mortgage_nw: FINANCE_CHIPS.limits,
  hil_dq: FINANCE_CHIPS.delinquency,
  loan_growth: FINANCE_CHIPS.limits,
  share_growth: FINANCE_CHIPS.segDeposits,
  shutdown_liquidity: FINANCE_CHIPS.cushion,
  seg_deposits: FINANCE_CHIPS.segDeposits,
};

export function financeKpiTiles({ clickable = true } = {}): FinanceKpiTile[] {
  return KPIS.map((k) => ({
    id: k.id,
    ...LOOK[k.id],
    label: SHORT[k.id].label,
    value: SHORT[k.id].value ?? k.value,
    target: SHORT[k.id].target ?? k.target,
    fullName: k.name,
    fullValue: k.value,
    fullTarget: k.target,
    source: k.source,
    calc: k.calc,
    kpiTrend: k.trend,
    publicProfile: !k.illustrative,
    chipText: clickable ? OPENS[k.id] : null,
  }));
}
