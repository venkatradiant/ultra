import FinancePageShell from './FinancePageShell';
import ScenarioImpactTable from '../ScenarioImpactTable';
import CapitalLiquidityGauges from '../CapitalLiquidityGauges';
import PlaybookActionTable from '../PlaybookActionTable';

/**
 * Spec §12 route /scenarios — "Scenarios and ALM": ScenarioImpactTable,
 * CapitalLiquidityGauges, PlaybookActionTable. The same components the
 * conversation renders at Steps 4, 5 and 6.
 */
export default function FinanceScenarios() {
  return (
    <FinancePageShell
      title="Scenarios and ALM"
      subtitle="The 30-day government shutdown, modeled as an employment shock on our own members: the impact, the capital and liquidity cushion, and the board playbook."
    >
      <ScenarioImpactTable />
      <CapitalLiquidityGauges />
      <PlaybookActionTable />
    </FinancePageShell>
  );
}
