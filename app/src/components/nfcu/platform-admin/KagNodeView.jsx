import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, MousePointerClick, Tag, X } from 'lucide-react';
import { InteractiveNvlWrapper } from '@neo4j-nvl/react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getKagSubgraph } from '@/data/nfcu/platform-admin/governanceData';
import PolicyCard from './PolicyCard';

/**
 * Turn 3 — KAG Node View. The bounded subgraph the agent returns from Neo4j,
 * re-rendered in Ultra through Gen UI with the Neo4j Visualization Library so it
 * matches Neo4j's own look — never the Neo4j browser. Paired with the governing
 * policy card (DG-04) that explains why a public-looking field stayed local.
 *
 * Interactive: the five top-level nodes each expand into their data-lineage
 * children on click (columns, source tables, transforms, ETL, steward, policy
 * controls); clicking again collapses. Clicking any node opens an inline detail
 * panel; clicking empty canvas closes it.
 */
const COLORS = {
  // Top-level
  'field-pii': '#e46240',
  'field-internal': '#EFDB8B',
  source: '#0596ae',
  policy: '#91C36C',
  // Lineage children (muted so the top level stays dominant)
  'source-table': '#4a97a6',
  column: '#c9b96a',
  transform: '#b98fb0',
  pipeline: '#7f95c4',
  steward: '#9aa3ad',
  control: '#7fae66',
};

const LEGEND = [
  { label: 'PII field', color: COLORS['field-pii'] },
  { label: 'Member-specific', color: COLORS['field-internal'] },
  { label: 'Source system', color: COLORS.source },
  { label: 'Policy', color: COLORS.policy },
  { label: 'Lineage', color: COLORS.column },
];

export default function KagNodeView() {
  const data = useAsyncData(getKagSubgraph);
  const [expanded, setExpanded] = useState(() => new Set());
  const [selectedId, setSelectedId] = useState(null);

  // Which top-level nodes have lineage children (drives the click affordance).
  const childCount = useMemo(() => {
    const counts = {};
    if (data) {
      for (const n of data.nodes) {
        if (n.parent) counts[n.parent] = (counts[n.parent] ?? 0) + 1;
      }
    }
    return counts;
  }, [data]);

  // Visible graph: top-level nodes + children of expanded parents. Recomputed
  // only when the data or the expanded set changes (not on every render).
  const { nodes, rels } = useMemo(() => {
    if (!data) return { nodes: [], rels: [] };

    const visibleNodes = data.nodes.filter((n) => !n.parent || expanded.has(n.parent));
    const visibleIds = new Set(visibleNodes.map((n) => n.id));

    const mappedNodes = visibleNodes.map((n) => {
      const kids = childCount[n.id] ?? 0;
      const hint = kids > 0 ? (expanded.has(n.id) ? '  (−)' : `  (+${kids})`) : '';
      return {
        id: n.id,
        caption: n.caption + hint,
        color: COLORS[n.group] ?? '#93c3cd',
        size: n.parent ? 19 : n.group === 'field-internal' ? 34 : 26,
        selected: n.id === selectedId,
      };
    });

    const mappedRels = data.rels
      .filter((r) => visibleIds.has(r.from) && visibleIds.has(r.to))
      .map((r) => ({ id: r.id, from: r.from, to: r.to, caption: r.caption }));

    return { nodes: mappedNodes, rels: mappedRels };
  }, [data, expanded, childCount, selectedId]);

  const selectedNode = useMemo(
    () => (data && selectedId ? data.nodes.find((n) => n.id === selectedId) : null),
    [data, selectedId],
  );

  if (!data) return null;

  const toggleExpanded = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const mouseEventCallbacks = {
    onNodeClick: (node) => {
      setSelectedId(node.id);
      if ((childCount[node.id] ?? 0) > 0) toggleExpanded(node.id);
    },
    onZoom: true,
    onPan: true,
    onDrag: true,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-3"
    >
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-brand" />
              <span className="text-[9px] uppercase tracking-wider font-bold text-text-subtle">
                KAG Knowledge Graph · bounded subgraph
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[9.5px] text-text-muted">
              <MousePointerClick className="w-3 h-3" />
              Click a node to expand its lineage · click again to collapse
            </div>
          </div>
          <div className="hidden sm:flex flex-wrap gap-2 justify-end">
            {LEGEND.map((l) => (
              <span key={l.label} className="inline-flex items-center gap-1 text-[9.5px] text-text-muted">
                <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        <div style={{ height: 340 }} className="bg-surface-2/40">
          {/* d3Force, not forceDirected: NVL's own types note forceDirected is
              deprecated for small datasets, and it collapses a 5-node graph
              onto a single point. */}
          <InteractiveNvlWrapper
            nodes={nodes}
            rels={rels}
            layout="d3Force"
            nvlOptions={{ layout: 'd3Force', initialZoom: 0.9 }}
            mouseEventCallbacks={mouseEventCallbacks}
          />
        </div>
      </div>

      {/* Keyed motion.div: changing the key remounts on select/deselect so the
          entrance animation replays. No AnimatePresence — mode="wait" deadlocks
          when the exiting child's exit animation doesn't complete, which would
          leave the panel stuck on the previous card. */}
      <motion.div
        key={selectedNode ? selectedNode.id : 'policy'}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {selectedNode ? (
          <NodeDetailCard
            node={selectedNode}
            color={COLORS[selectedNode.group]}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <PolicyCard policy={data.policyCard} />
        )}
      </motion.div>
    </motion.div>
  );
}

/**
 * Inline detail panel for the clicked node. Kept in this file per the feature's
 * scope; mirrors PolicyCard's styling idiom (motion entry, rounded border,
 * small type) so it reads as part of the same surface.
 */
function NodeDetailCard({ node, color, onClose }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-lg flex-shrink-0"
          style={{ background: `${color}22`, color }}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        </span>
        <span className="text-xs font-semibold text-text truncate">{node.caption}</span>
        <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-text-subtle bg-surface-2 px-2 py-0.5 rounded-full flex-shrink-0">
          {node.detail.kind}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close node details"
          className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-md text-text-subtle hover:text-text hover:bg-surface-2 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-[11px] text-text-muted leading-relaxed">{node.detail.description}</p>
      {node.detail.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-border">
          {node.detail.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 text-[9.5px] text-text-muted bg-surface-2 px-2 py-0.5 rounded-full"
            >
              <Tag className="w-2.5 h-2.5" />
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
