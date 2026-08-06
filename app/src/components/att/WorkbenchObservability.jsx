/**
 * WorkbenchObservability — the AT&T Agent Observability console.
 *
 * A parallel container to NFCU's `PlatformAdminObservability` rather than a
 * branch inside it: the two consoles watch different things (a four-agent
 * billing pipeline versus a gateway/SLM/KAG stack) and share no data shape.
 * Forcing them through one component would mean a prop for every difference,
 * and NFCU's path stays byte-identical this way.
 */
import { motion } from 'framer-motion';
import { Gauge, Timer, AlertTriangle, Layers } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getObservability, getAgentFleet } from '../../data/att/platform-admin';
import WorkbenchPageHeader from './WorkbenchPageHeader';
import AgentHealthCard from './AgentHealthCard';
import { AccuracyTrendChart, LatencyChart, FailureRateChart } from './ObservabilityCharts';
import RootCauseDistribution from './RootCauseDistribution';
import RetrainingHistory from './RetrainingHistory';
import IllustrativeChip from './IllustrativeChip';

function KpiTile({ icon: Icon, value, label, delta, positive, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="rounded-2xl border border-border-subtle bg-surface p-4 min-w-0"
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[11px] font-medium text-text-muted truncate">{label}</span>
        <Icon className="w-4 h-4 text-brand flex-shrink-0" />
      </div>
      <p className="text-2xl font-bold text-text leading-none tracking-tight tabular-nums">{value}</p>
      {delta && (
        <p className={`text-[10.5px] font-semibold mt-1.5 tabular-nums ${positive ? 'text-emerald-700' : 'text-amber-700'}`}>
          {delta}
        </p>
      )}
    </motion.div>
  );
}

export default function WorkbenchObservability() {
  const obs = useAsyncData(getObservability);
  const agents = useAsyncData(getAgentFleet);

  if (!obs) return <div className="flex-1 bg-bg" />;

  const m = obs.systemMetrics;
  const degraded = agents?.find((a) => a.status !== 'healthy') || null;
  const healthy = agents ? agents.filter((a) => a.status === 'healthy').length : 0;

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto scrollbar-sleek">
      <WorkbenchPageHeader
        title="AI Agent Observability"
        subtitle="Accuracy, latency and error rate for the four agents that detect, score, explain and resolve. The fleet is healthy on every aggregate — the finding is in one agent's latency tail, which is exactly what an average hides."
        asOf="12 minutes ago"
      />

      <div className="space-y-4">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <KpiTile index={0} icon={Gauge} label="Average Accuracy" value={`${m.avgAccuracy}%`} delta={m.accuracyDelta} positive />
          <KpiTile index={1} icon={Timer} label="Average Latency" value={`${m.avgLatency}ms`} delta={m.latencyDelta} positive />
          <KpiTile index={2} icon={AlertTriangle} label="Failure Rate" value={`${m.avgFailureRate}%`} delta={m.failureDelta} positive />
          <KpiTile index={3} icon={Layers} label="Total Inferences" value={m.totalInferences.toLocaleString()} delta={`${m.uptime}% uptime`} positive />
        </div>

        {agents && (
          <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
              <div className="min-w-0">
                <h3 className="text-[13px] font-bold text-text tracking-tight">Agent Health Status</h3>
                <p className="text-[11px] text-text-subtle mt-0.5">
                  {healthy} of {agents.length} healthy
                  {degraded && ` — ${degraded.name} is in Warning on latency`}
                </p>
              </div>
              <IllustrativeChip />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {agents.map((a, i) => (
                <AgentHealthCard key={a.id} agent={a} baseline={m} index={i} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AccuracyTrendChart data={obs.accuracyTrends} />
          <LatencyChart data={obs.latencyMetrics} degradedAgent={degraded} />
        </div>

        <FailureRateChart data={obs.failureMetrics} summary={obs.failureSummary} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <RootCauseDistribution data={obs.rootCauseDistribution} />
          <RetrainingHistory history={obs.retrainingHistory} />
        </div>
      </div>
    </div>
  );
}
