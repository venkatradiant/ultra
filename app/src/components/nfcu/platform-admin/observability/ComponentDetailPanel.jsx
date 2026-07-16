import { motion } from 'framer-motion';
import { usePolledData } from '@/hooks/usePolledData';
import {
  getComponentMetrics,
  getComponentActivity,
  LAYER_LABELS,
  CATEGORY_LABELS,
} from '@/data/nfcu/platform-admin/observabilityData';
import { styleForState } from './stateStyles';
import LiveMetricPanel from './LiveMetricPanel';
import AgentEventLog from './AgentEventLog';
import ComponentStateHistory from './ComponentStateHistory';
import RootCauseCard from './RootCauseCard';

/**
 * Band 3 — the selected component in full: live metrics, its diagnosis, its
 * event log and its state history.
 *
 * Layout note: the reference gave the component name/state/layer/category four
 * hero tiles, because a Grafana dashboard has no page header to put them in. We
 * have one, so they collapse to a single compact bar and the space goes to the
 * root-cause card instead — which is the part the reference didn't have and the
 * reason this page exists.
 *
 * Props: { component, rootCause, stateHistory, tick }
 */
export default function ComponentDetailPanel({ component, rootCause, stateHistory }) {
  const componentId = component?.component ?? null;

  // 5s for metrics, 3s for activity — the intervals ui_api_docs.md recommends.
  // Both go through usePolledData, not useAsyncData: these getters take an
  // argument, and useAsyncData's [getter] dep would refetch every render.
  const metrics = usePolledData(getComponentMetrics, componentId, { intervalMs: 5000 });
  const activity = usePolledData(getComponentActivity, componentId, { intervalMs: 3000 });

  if (!component) return null;

  const style = styleForState(component.state);
  const StateIcon = style.icon;
  const entries = Object.entries(metrics?.metrics ?? {});

  return (
    <div className="space-y-3">
      {/* Header bar — animates on selection change; the chart grid below does
          NOT remount, so recharts never re-measures mid-transition. */}
      <motion.div
        key={componentId}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-surface rounded-xl border border-border-subtle px-5 py-3.5 flex flex-wrap items-center gap-x-4 gap-y-2"
      >
        <div className="min-w-0">
          <div className="text-[15px] font-bold text-text leading-tight truncate">
            {component.label ?? component.component}
          </div>
          <div className="text-[9.5px] font-mono text-text-subtle truncate">{component.component}</div>
        </div>

        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${style.pill}`}>
          <StateIcon className="w-3 h-3" />
          {style.label}
        </span>

        <div className="flex items-center gap-4 ml-auto">
          <div>
            <div className="text-[9px] text-text-subtle uppercase tracking-wide">Layer</div>
            <div className="text-[11px] font-semibold text-text">{LAYER_LABELS[component.layer]}</div>
          </div>
          <div>
            <div className="text-[9px] text-text-subtle uppercase tracking-wide">Category</div>
            <div className="text-[11px] font-semibold text-text">
              {CATEGORY_LABELS[component.category] ?? component.category}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-text-subtle uppercase tracking-wide">Metrics</div>
            <div className="text-[11px] font-semibold text-text tabular-nums">
              {metrics?.metrics_count ?? '—'}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-3 items-start">
        {/* Live metrics — count varies by category, so this maps rather than
            assuming a fixed panel count. */}
        <div className="space-y-3">
          <div className="bg-surface rounded-xl border border-border-subtle p-5">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Live metrics</h3>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[9.5px] text-text-subtle">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                polling every 5s
              </span>
            </div>

            {entries.length === 0 ? (
              // Skeleton, not a jump: usePolledData clears on key change so we
              // never show the previous component's numbers under this name.
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border-subtle h-[96px] bg-surface-2/40" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {entries.map(([metric, value]) => (
                  <LiveMetricPanel
                    key={metric}
                    metric={metric}
                    value={value}
                    series={metrics.series?.[metric]}
                  />
                ))}
              </div>
            )}
          </div>

          <ComponentStateHistory history={stateHistory} />
        </div>

        {/* Diagnosis + log */}
        <div className="space-y-3">
          {/* key: remount on selection change so an Approve on one component
              can't appear to carry over to the next. */}
          <RootCauseCard
            key={componentId}
            rca={rootCause}
            componentLabel={component.label ?? component.component}
          />
          <AgentEventLog events={activity?.events} />
        </div>
      </div>
    </div>
  );
}
