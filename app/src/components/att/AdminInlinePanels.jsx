/**
 * Self-loading panels for the Platform Admin conversation.
 *
 * The admin surface is a control panel, so each scripted turn renders the panel
 * it is talking about rather than a bespoke chat visualization. These wrappers
 * exist only to fetch their own data, so the persona manifest can attach a
 * panel to a flow key without threading props through the chat engine.
 */
import { motion } from 'framer-motion';
import { Gauge, Timer, AlertTriangle, Layers, CheckCircle2 } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getAgentFleet, getObservability, getAdminConsole } from '../../data/att/platform-admin';
import AgentHealthCard from './AgentHealthCard';
import { LatencyChart, FailureRateChart, AccuracyTrendChart } from './ObservabilityCharts';
import RootCauseDistribution from './RootCauseDistribution';
import RetrainingInsights from './RetrainingInsights';
import RetrainingHistory from './RetrainingHistory';
import ThresholdSettings from './ThresholdSettings';
import AdvancedSettings from './AdvancedSettings';
import IllustrativeChip from './IllustrativeChip';

/**
 * The four observability KPI tiles. §10B step 1 puts these *above* the agent
 * list on purpose: "3 of 4 healthy" is only alarming or not once you know the
 * fleet aggregate it sits inside.
 */
function ObservabilityKpiRow({ metrics }) {
  if (!metrics) return null;
  const tiles = [
    { id: 'acc', icon: Gauge, label: 'Average Accuracy', value: `${metrics.avgAccuracy}%`, delta: metrics.accuracyDelta },
    { id: 'lat', icon: Timer, label: 'Average Latency', value: `${metrics.avgLatency}ms`, delta: metrics.latencyDelta },
    { id: 'fail', icon: AlertTriangle, label: 'Failure Rate', value: `${metrics.avgFailureRate}%`, delta: metrics.failureDelta },
    { id: 'inf', icon: Layers, label: 'Total Inferences', value: metrics.totalInferences.toLocaleString(), delta: `${metrics.uptime}% uptime` },
  ];
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
      {tiles.map(({ id, icon: Icon, label, value, delta }, i) => (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.04 }}
          className="rounded-xl border border-border-subtle bg-surface-2/40 p-3.5 min-w-0"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-subtle truncate">{label}</span>
            <Icon className="w-3.5 h-3.5 text-brand flex-shrink-0" />
          </div>
          <p className="text-xl font-bold text-text leading-none tracking-tight tabular-nums">{value}</p>
          <p className="text-[10px] font-semibold text-emerald-700 mt-1.5 tabular-nums">{delta}</p>
        </motion.div>
      ))}
    </div>
  );
}

/** The four pipeline agents, under the fleet aggregates that make them readable. */
export function AgentFleetPanel() {
  const agents = useAsyncData(getAgentFleet);
  const obs = useAsyncData(getObservability);
  if (!agents) return null;

  const baseline = obs?.systemMetrics || null;
  const healthy = agents.filter((a) => a.status === 'healthy').length;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold text-text tracking-tight">Agent Health Status</h3>
          <p className="text-[11px] text-text-subtle mt-0.5">
            {healthy} of {agents.length} healthy · fleet {baseline?.avgAccuracy}% accuracy,{' '}
            {baseline?.avgLatency}ms average latency, {baseline?.uptime}% uptime
          </p>
        </div>
        <IllustrativeChip />
      </div>
      <ObservabilityKpiRow metrics={baseline} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {agents.map((a, i) => (
          <AgentHealthCard key={a.id} agent={a} baseline={baseline} index={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * §10B step 6 — retraining in progress, with the estimated lift and the
 * governance entry the trigger wrote. A separate state from the idle panel:
 * the turn's whole content is "this is now running", and re-rendering the
 * "Trigger Early Retraining" button under a message saying it already started
 * would contradict the answer above it.
 */
export function RetrainingInProgressPanel() {
  const console_ = useAsyncData(getAdminConsole);
  const obs = useAsyncData(getObservability);
  if (!console_) return null;
  const r = console_.retraining;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-300 bg-emerald-500/[0.07] p-4 sm:p-5">
        <p className="inline-flex items-center gap-2 text-[13px] font-bold text-emerald-800">
          <CheckCircle2 className="w-4.5 h-4.5" /> Early retraining started — model v2.4.1
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          {[
            { value: r.correctionsCaptured.toLocaleString(), label: 'corrections in the training set' },
            { value: `${r.dataQualityScore}%`, label: `data quality — ${r.dataQualityLabel}` },
            { value: r.estimatedImprovement, label: 'estimated lift' },
            { value: `+${r.lastFourAverage}%`, label: 'last four averaged' },
          ].map((s) => (
            <div key={s.label} className="min-w-0">
              <p className="text-lg font-bold text-emerald-900 leading-none tabular-nums">{s.value}</p>
              <p className="text-[10px] text-emerald-800/75 mt-1 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3.5 pt-3.5 border-t border-emerald-300/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/70 mb-1.5">
            Governance log entry
          </p>
          <p className="font-mono text-[11px] text-emerald-900 leading-relaxed">
            RETRAIN-TRIGGER · v2.4.1 · weighted: tax-rule, sync · operator: A.Nakamura ·
            2026-02-16 10:41 AM · current cycle continues on v2.4.1 until the new version validates
          </p>
        </div>
        <p className="text-[10.5px] text-emerald-800/70 mt-3">
          Illustrative — no job was queued and nothing left this demo.
        </p>
      </div>
      {obs && <RetrainingHistory history={obs.retrainingHistory} />}
    </div>
  );
}

/** Latency (Avg/P95/P99) plus the failure trend — the diagnosis pair. */
export function LatencyDiagnosisPanel({ withFailure = true, withAccuracy = false }) {
  const obs = useAsyncData(getObservability);
  const agents = useAsyncData(getAgentFleet);
  if (!obs) return null;
  const degraded = agents?.find((a) => a.status !== 'healthy') || null;

  return (
    <div className="space-y-4">
      <LatencyChart data={obs.latencyMetrics} degradedAgent={degraded} />
      {withAccuracy && <AccuracyTrendChart data={obs.accuracyTrends} />}
      {withFailure && <FailureRateChart data={obs.failureMetrics} summary={obs.failureSummary} />}
    </div>
  );
}

/** What is actually breaking, across 202 anomalies. */
export function RootCausePanel() {
  const obs = useAsyncData(getObservability);
  if (!obs) return null;
  return <RootCauseDistribution data={obs.rootCauseDistribution} />;
}

/** The forecast beside the four retrains it is measured against. */
export function RetrainingPanel({ withHistory = true }) {
  const console_ = useAsyncData(getAdminConsole);
  const obs = useAsyncData(getObservability);
  if (!console_) return null;

  return (
    <div className="space-y-4">
      <RetrainingInsights retraining={console_.retraining} history={obs?.retrainingHistory || []} />
      {withHistory && obs && <RetrainingHistory history={obs.retrainingHistory} />}
    </div>
  );
}

/** The three tiers, live, with the review-load projection under them. */
export function ThresholdPanel() {
  const console_ = useAsyncData(getAdminConsole);
  if (!console_) return null;
  return <ThresholdSettings config={console_.thresholds} />;
}

/** The nine switches — shown on the turn that claims to have saved them. */
export function AdvancedSettingsPanel() {
  const console_ = useAsyncData(getAdminConsole);
  if (!console_) return null;
  return <AdvancedSettings groups={console_.advancedSettings} />;
}
