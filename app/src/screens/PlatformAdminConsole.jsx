/**
 * Platform Administration — the guardrails behind the operator's automation.
 *
 * Ordered by consequence rather than by category: the confidence thresholds
 * come first because they decide what a human ever sees, then the cycle and SLA
 * configuration, then the agents doing the work, then the model that will
 * replace them next month, then the nine switches that change the shape of all
 * of it.
 */
import { usePersona } from '../context/PersonaContext';
import useAsyncData from '../hooks/useAsyncData';
import {
  getAdminConsole,
  getAgentFleet,
  getObservability,
  getCycle,
} from '../data/att/platform-admin';
import WorkbenchPageHeader from '../components/att/WorkbenchPageHeader';
import AdminKpiTiles from '../components/att/AdminKpiTiles';
import ThresholdSettings from '../components/att/ThresholdSettings';
import BillingCycleConfig from '../components/att/BillingCycleConfig';
import AgentHealthCard from '../components/att/AgentHealthCard';
import RetrainingInsights from '../components/att/RetrainingInsights';
import AdvancedSettings from '../components/att/AdvancedSettings';
import IllustrativeChip from '../components/att/IllustrativeChip';

export default function PlatformAdminConsole() {
  const persona = usePersona();
  const console_ = useAsyncData(getAdminConsole);
  const agents = useAsyncData(getAgentFleet);
  const observability = useAsyncData(getObservability);
  const cycle = useAsyncData(getCycle);

  if (persona?.id !== 'att_platform_admin') {
    return (
      <div className="flex-1 py-8 px-6 lg:px-8 overflow-y-auto">
        <p className="text-sm text-text-muted">This view is not available for the active persona.</p>
      </div>
    );
  }

  if (!console_) return <div className="flex-1 bg-bg" />;

  const baseline = observability?.systemMetrics || null;
  const degraded = agents?.filter((a) => a.status !== 'healthy').length ?? 0;

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto scrollbar-sleek">
      <WorkbenchPageHeader
        title="Platform Administration"
        subtitle="The thresholds, SLA windows and agents that make it safe for operators to auto-resolve at volume. Nothing here is per-account: if a setting on this page is wrong, the failure is systemic."
        cycle={cycle}
        asOf="2 hours ago"
      />

      <div className="space-y-4">
        <AdminKpiTiles kpis={console_.kpis} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ThresholdSettings config={console_.thresholds} />
          <BillingCycleConfig config={console_.cycleConfig} />
        </div>

        {agents && (
          <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
              <div className="min-w-0">
                <h3 className="text-[13px] font-bold text-text tracking-tight">Agent Performance</h3>
                <p className="text-[11px] text-text-subtle mt-0.5">
                  {agents.length - degraded} of {agents.length} healthy
                  {degraded > 0 && ' — latency, not accuracy, is what moved'}
                </p>
              </div>
              <IllustrativeChip />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {agents.map((a, i) => (
                <AgentHealthCard key={a.id} agent={a} baseline={baseline} index={i} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <RetrainingInsights
            retraining={console_.retraining}
            history={observability?.retrainingHistory || []}
          />
          <div className="min-w-0">
            <AdvancedSettings groups={console_.advancedSettings} />
          </div>
        </div>
      </div>
    </div>
  );
}
