import { AnimatePresence, motion } from 'framer-motion';
import { Workflow, ChevronDown } from 'lucide-react';
import { useIntraday } from '../../context/IntradayContext';
import TierSelector from './TierSelector';
import SupervisorKpiGrid from './SupervisorKpiGrid';
import ExecutiveKpiGrid from './ExecutiveKpiGrid';
import AgentStatusBar from './AgentStatusBar';
import PrioritySignalsRow from './PrioritySignalsRow';
import TrendSignalsRow from './TrendSignalsRow';
import RootCauseTree from './RootCauseTree';
import ScenarioComparisonCards from './ScenarioComparisonCards';
import ExecutionTracker from './ExecutionTracker';
import IncidentStatusBar from './IncidentStatusBar';

function Section({ id, title, meta, rightSlot, collapsible = true, children }) {
  const { collapsedSections, toggleSection } = useIntraday();
  const collapsed = collapsible && id ? collapsedSections.has(id) : false;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => (collapsible && id ? toggleSection(id) : undefined)}
          disabled={!collapsible || !id}
          className={`flex items-baseline gap-1.5 min-w-0 ${collapsible && id ? 'cursor-pointer group' : 'cursor-default'}`}
        >
          {collapsible && id ? (
            <motion.span
              animate={{ rotate: collapsed ? -90 : 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex translate-y-px text-text-subtle group-hover:text-text-muted"
            >
              <ChevronDown className="w-3 h-3" />
            </motion.span>
          ) : null}
          <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted group-hover:text-text-muted transition-colors">
            {title}
          </h3>
          {meta ? <span className="text-[10px] font-medium text-text-subtle">{meta}</span> : null}
        </button>
        {rightSlot ? <div className="flex-shrink-0">{rightSlot}</div> : null}
      </div>
      <AnimatePresence initial={false}>
        {!collapsed ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function Placeholder({ Icon, title, blurb }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-gray-50/70 p-3 flex items-start gap-3">
      <div className="rounded-lg bg-surface p-2 border border-border">
        <Icon className="w-4 h-4 text-text-subtle" />
      </div>
      <div>
        <p className="text-xs font-semibold text-text-muted">{title}</p>
        <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">{blurb}</p>
      </div>
    </div>
  );
}

export default function IntradayDashboardPanel({ availableTiers = ['supervisor'] }) {
  const { tier, setTier, baseline, snapshot } = useIntraday();

  if (!baseline) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 text-xs text-text-muted">
        Intraday dashboard data is not loaded for this persona yet.
      </div>
    );
  }

  const scenarioReveal = !!snapshot?.scenarioReveal;
  const executionActive =
    snapshot?.executionStep !== undefined &&
    snapshot?.executionStep !== null &&
    snapshot?.executionStep !== 0;

  const liveCount = Array.isArray(snapshot?.signalIds)
    ? snapshot.signalIds.length
    : (baseline.priority_signals_inline?.length || 0);
  const trendCount = baseline.trend_signals_inline?.length || 0;
  const signalCount = liveCount + trendCount;

  return (
    <motion.div
      key="intraday-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3"
    >
      <IncidentStatusBar baseline={baseline} snapshot={snapshot} stepLabel={snapshot?.label} />

      <Section
        id="signals"
        title="Priority Signals"
        meta={
          signalCount > 0
            ? `${liveCount} live · ${trendCount} trend`
            : 'all clear'
        }
      >
        <div className="space-y-3">
          <PrioritySignalsRow baseline={baseline} snapshot={snapshot} />
          {trendCount > 0 ? <TrendSignalsRow baseline={baseline} /> : null}
        </div>
      </Section>

      <Section
        id="kpis"
        title={tier === 'agent' ? 'Agent Status' : tier === 'executive' ? 'Executive KPIs' : 'Supervisor KPIs'}
        rightSlot={<TierSelector tier={tier} onChange={setTier} availableTiers={availableTiers} />}
      >
        {tier === 'supervisor' ? (
          <SupervisorKpiGrid baseline={baseline} snapshot={snapshot} />
        ) : tier === 'executive' ? (
          <ExecutiveKpiGrid baseline={baseline} snapshot={snapshot} />
        ) : (
          <AgentStatusBar baseline={baseline} snapshot={snapshot} />
        )}
      </Section>

      <Section id="tree" title="Root-Cause Correlation" meta="cross-source">
        <RootCauseTree tree={baseline.root_cause_tree} highlight={snapshot?.treeHighlight || []} />
      </Section>

      <AnimatePresence initial={false}>
        {scenarioReveal ? (
          <motion.div
            key="scenarios"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Section id="scenarios" title="Recovery Scenarios">
              <ScenarioComparisonCards scenarios={baseline.scenarios || []} />
            </Section>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {executionActive ? (
          <motion.div
            key="execution"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Section id="execution" title="Execution Tracker">
              <ExecutionTracker
                steps={baseline.execution_steps || []}
                completed={snapshot.executionStep}
              />
            </Section>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!scenarioReveal && !executionActive ? (
        <Placeholder
          Icon={Workflow}
          title="Scenarios + execution unlock as the flow advances"
          blurb="Plan A / B / C appear at Step 4. Execution tracker animates from Step 5."
        />
      ) : null}
    </motion.div>
  );
}
