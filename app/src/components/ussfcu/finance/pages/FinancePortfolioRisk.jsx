import FinancePageShell from './FinancePageShell';
import FinanceKpiRow from '../FinanceKpiRow';
import PortfolioLimitChart from '../PortfolioLimitChart';
import DelinquencyTrend from '../DelinquencyTrend';
import { financeKpiTiles } from '../../../../data/ussfcu/finance/kpiTiles';

/**
 * Spec §12 route /portfolio-risk — "Portfolio and Limits": PortfolioLimitChart,
 * DelinquencyTrend, KpiRow. The same components the conversation renders at
 * Steps 3 and 2, so the page and the answer can never disagree.
 */
const tiles = financeKpiTiles({ clickable: false });

export default function FinancePortfolioRisk() {
  return (
    <FinancePageShell
      title="Portfolio and Limits"
      subtitle="Every portfolio against its board risk-tolerance limit, and delinquency by segment against its aligned parameter."
    >
      <FinanceKpiRow visible stats={tiles} />
      <PortfolioLimitChart />
      <DelinquencyTrend />
    </FinancePageShell>
  );
}
