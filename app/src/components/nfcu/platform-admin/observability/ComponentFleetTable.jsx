import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import {
  LAYER_LABELS,
  CATEGORY_LABELS,
  METRIC_META,
} from '@/data/nfcu/platform-admin/observabilityData';
import { styleForState, STATE_PRIORITY, relativeTime } from './stateStyles';

/**
 * Band 2 — the fleet. Every component, grouped by layer, non-healthy first.
 *
 * The row IS the picker. The reference used a searchable dropdown because it
 * had 153 components to sift; with ~34 grouped rows, a click on a visible row
 * beats typing a name — and it demos better, since the presenter can point at
 * the amber row and click it.
 *
 * A11y: the row's first cell holds a real <button> stretched over the whole row
 * via `after:inset-0`. That gives real focus, real Enter/Space and real screen
 * reader semantics, instead of an onClick on a <tr> plus hand-rolled key
 * handlers.
 *
 * Props: { components, selectedId, onSelect }
 */
const LAYER_ORDER = ['application_layer', 'data_layer', 'infrastructure_layer', 'network_layer'];

/** The one metric worth showing per category in the fleet row. */
const KEY_METRIC = {
  ai_agents: 'containment_rate_percent',
  api_services_member: 'response_time_ms',
  orchestration: 'error_rate_percent',
  knowledge_graph: 'query_latency_ms',
  routing_log: 'query_latency_ms',
  cost_records: 'query_latency_ms',
  vector_store: 'query_latency_ms',
  slm_inference: 'queue_depth',
  model_gateway: 'p95_latency_ms',
  container_platform: 'cpu_percent',
  frontier_egress: 'pii_blocked_count',
  private_endpoints: 'p95_latency_ms',
  api_gateway: 'requests_per_second',
};

function keyMetricFor(component) {
  const metric = KEY_METRIC[component.category];
  if (!metric || component.metrics[metric] == null) return null;
  const meta = METRIC_META[metric];
  return { label: meta?.label ?? metric, value: component.metrics[metric], unit: meta?.unit ?? '' };
}

function Row({ component, selected, onSelect }) {
  const style = styleForState(component.state);
  const StateIcon = style.icon;
  const metric = keyMetricFor(component);

  return (
    <tr
      className={`relative border-b border-border-subtle transition-colors ${style.row} ${
        selected ? 'bg-brand/[0.06] hover:bg-brand/[0.08]' : ''
      }`}
    >
      <td className="py-2 px-3">
        {/* Stretched button: the whole row is the hit target, but it is a real
            button for focus/keyboard/AT. */}
        <button
          type="button"
          onClick={() => onSelect(component.component)}
          aria-current={selected ? 'true' : undefined}
          className="text-left after:absolute after:inset-0 after:content-[''] cursor-pointer
                     focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand/40
                     focus-visible:after:rounded-md"
        >
          <span className={`text-[11.5px] font-medium ${selected ? 'text-brand' : 'text-text'}`}>
            {component.label ?? component.component}
          </span>
          <span className="block text-[9.5px] font-mono text-text-subtle">{component.component}</span>
        </button>
      </td>
      <td className="py-2 px-3">
        <span className={`inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-full ${style.pill}`}>
          <StateIcon className="w-2.5 h-2.5" />
          {style.label}
        </span>
      </td>
      <td className="py-2 px-3 text-[10.5px] text-text-muted hidden sm:table-cell">
        {CATEGORY_LABELS[component.category] ?? component.category}
      </td>
      <td className="py-2 px-3 text-[10.5px] text-text-muted tabular-nums hidden md:table-cell whitespace-nowrap">
        {metric ? (
          <>
            <span className="font-semibold text-text">{metric.value}{metric.unit}</span>
            <span className="text-text-subtle"> {metric.label}</span>
          </>
        ) : '—'}
      </td>
      <td className="py-2 px-3 text-[10px] text-text-subtle hidden lg:table-cell whitespace-nowrap">
        {relativeTime(component.lastUpdated)}
      </td>
    </tr>
  );
}

export default function ComponentFleetTable({ components, selectedId, onSelect }) {
  // Group by layer, incidents first within each group, then alphabetical.
  const groups = useMemo(() => {
    const out = [];
    for (const layer of LAYER_ORDER) {
      const members = (components ?? [])
        .filter((c) => c.layer === layer)
        .sort(
          (a, b) =>
            STATE_PRIORITY[a.state] - STATE_PRIORITY[b.state] ||
            (a.label ?? a.component).localeCompare(b.label ?? b.component),
        );
      if (members.length) out.push({ layer, members });
    }
    return out;
  }, [components]);

  if (!components?.length) {
    return <div className="bg-surface rounded-xl border border-border-subtle p-5 h-[240px]" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-center gap-2 mb-0.5">
        <Layers className="w-4 h-4 text-brand" />
        <h3 className="text-sm font-semibold text-text">Components</h3>
        <span className="ml-auto text-[10px] text-text-subtle">Select a row to inspect</span>
      </div>
      <p className="text-xs text-text-subtle mb-4">
        Grouped by layer · anything not healthy sorts to the top of its group
      </p>

      <div className="overflow-x-auto max-h-[380px] overflow-y-auto scrollbar-sleek">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-surface z-10">
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Component</th>
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">State</th>
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px] hidden sm:table-cell">Category</th>
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px] hidden md:table-cell">Key metric</th>
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px] hidden lg:table-cell">Updated</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(({ layer, members }) => (
              <LayerGroup key={layer} layer={layer} members={members} selectedId={selectedId} onSelect={onSelect} />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/** A layer's sub-header row plus its members. */
function LayerGroup({ layer, members, selectedId, onSelect }) {
  const unhealthy = members.filter((m) => m.state !== 'healthy').length;
  return (
    <>
      <tr className="bg-surface-2">
        <td colSpan={5} className="py-1.5 px-3">
          <span className="text-[9.5px] font-bold text-text-muted uppercase tracking-wider">
            {LAYER_LABELS[layer]}
          </span>
          <span className="text-[9.5px] text-text-subtle ml-2 tabular-nums">
            {members.length} component{members.length === 1 ? '' : 's'}
            {unhealthy > 0 && <span className="text-amber-700 font-semibold"> · {unhealthy} need attention</span>}
          </span>
        </td>
      </tr>
      {members.map((c) => (
        <Row key={c.component} component={c} selected={c.component === selectedId} onSelect={onSelect} />
      ))}
    </>
  );
}
