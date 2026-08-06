/**
 * Dashboard — the traditional metrics view.
 *
 * Spec §15 calls this the visual centrepiece, but its real job in the demo is
 * to be the counter-argument: the conversation collapses a cycle into six
 * decisions, and an operator who wants to check that collapse comes here to see
 * the raw counts, the distribution and the individual rows with their source
 * systems named.
 *
 * The pipeline rail sits at the top for the same reason — it shows what
 * produced the numbers below it before any of them are read.
 */
import { usePersona } from '../context/PersonaContext';
import useAsyncData from '../hooks/useAsyncData';
import { getDashboard, getAnomalyExplorer, getCycle, getSla } from '../data/att/billing-operator';
import WorkbenchPageHeader from '../components/att/WorkbenchPageHeader';
import PipelineRail from '../components/att/PipelineRail';
import SlaCountdown from '../components/att/SlaCountdown';
import DashboardKpiTiles from '../components/att/DashboardKpiTiles';
import { AnomalyTrendChart, ConfidenceDistributionPanel, ChargeTypeDonut } from '../components/att/DashboardCharts';
import RiskHeatmap from '../components/att/RiskHeatmap';
import MicroAgentTable from '../components/att/MicroAgentTable';
import AnomalyExplorer from '../components/att/AnomalyExplorer';

export default function BillingDashboard() {
  const persona = usePersona();
  const dashboard = useAsyncData(getDashboard);
  const explorer = useAsyncData(getAnomalyExplorer);
  const cycle = useAsyncData(getCycle);
  const sla = useAsyncData(getSla);

  if (persona?.id !== 'att_billing_operator') {
    return (
      <div className="flex-1 py-8 px-6 lg:px-8 overflow-y-auto">
        <p className="text-sm text-text-muted">This view is not available for the active persona.</p>
      </div>
    );
  }

  if (!dashboard) return <div className="flex-1 bg-bg" />;

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto scrollbar-sleek">
      <WorkbenchPageHeader
        title="Dashboard"
        subtitle="Cycle-wide counts, the detection pipeline that produced them, and the individual rows behind the six patterns. This is where the conversation's grouping can be checked against the raw data."
        cycle={cycle}
        asOf="8 minutes ago"
      >
        <SlaCountdown sla={sla} />
      </WorkbenchPageHeader>

      <div className="space-y-4">
        <PipelineRail />

        <DashboardKpiTiles kpis={dashboard.kpis} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AnomalyTrendChart data={dashboard.anomalyTrend} />
          <ConfidenceDistributionPanel data={dashboard.confidenceDistribution} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <ChargeTypeDonut data={dashboard.byChargeType} />
          <div className="xl:col-span-2 min-w-0">
            <RiskHeatmap rows={dashboard.riskHeatmap} />
          </div>
        </div>

        <MicroAgentTable agents={dashboard.microAgents} />

        <AnomalyExplorer rows={explorer || []} />
      </div>
    </div>
  );
}
