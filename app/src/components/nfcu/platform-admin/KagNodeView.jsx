import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { InteractiveNvlWrapper } from '@neo4j-nvl/react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getKagSubgraph } from '@/data/nfcu/platform-admin/governanceData';
import PolicyCard from './PolicyCard';

/**
 * Turn 3 — KAG Node View. The bounded subgraph the agent returns from Neo4j,
 * re-rendered in Ultra through Gen UI with the Neo4j Visualization Library so it
 * matches Neo4j's own look — never the Neo4j browser. Paired with the governing
 * policy card (DG-04) that explains why a public-looking field stayed local.
 */
const COLORS = {
  'field-pii': '#e46240',
  'field-internal': '#EFDB8B',
  source: '#0596ae',
  policy: '#91C36C',
};

const LEGEND = [
  { label: 'PII field', color: COLORS['field-pii'] },
  { label: 'Member-specific', color: COLORS['field-internal'] },
  { label: 'Source system', color: COLORS.source },
  { label: 'Policy', color: COLORS.policy },
];

export default function KagNodeView() {
  const data = useAsyncData(getKagSubgraph);
  if (!data) return null;

  const nodes = data.nodes.map((n) => ({
    id: n.id,
    caption: n.caption,
    color: COLORS[n.group] ?? '#93c3cd',
    size: n.group === 'field-internal' ? 34 : 26,
  }));
  const rels = data.rels.map((r) => ({ id: r.id, from: r.from, to: r.to, caption: r.caption }));

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
            mouseEventCallbacks={{ onZoom: true, onPan: true, onDrag: true }}
          />
        </div>
      </div>

      <PolicyCard policy={data.policyCard} />
    </motion.div>
  );
}
