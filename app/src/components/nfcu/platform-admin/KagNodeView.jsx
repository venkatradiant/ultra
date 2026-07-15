import { motion } from 'framer-motion';
import { KeyRound, Database, Scale } from 'lucide-react';
import PolicyCard from './PolicyCard';

/**
 * KAG Node View — the bounded subgraph the agent returns from Neo4j, re-rendered
 * in Ultra (never the raw Neo4j browser): the flagged field node linked to its
 * source-system node and its governing policy node. Hand-rolled themed SVG.
 * Data: { nodes[], edges[], policy }.
 */
const CANVAS_W = 460;
const CANVAS_H = 232;
const NODE_W = 132;
const NODE_H = 56;

// Fixed 3-node layout: field (left-center) → source (top-right), policy (bottom-right).
const POS = {
  field: { x: 16, y: 88 },
  source: { x: 300, y: 20 },
  policy: { x: 300, y: 156 },
};

const KIND = {
  field: { icon: KeyRound, color: 'var(--color-brand)', bg: 'color-mix(in srgb, var(--color-brand) 8%, var(--color-surface))', border: 'color-mix(in srgb, var(--color-brand) 35%, transparent)' },
  source: { icon: Database, color: '#2563eb', bg: 'rgba(37,99,235,0.06)', border: 'rgba(37,99,235,0.30)' },
  policy: { icon: Scale, color: '#b45309', bg: 'rgba(217,119,6,0.07)', border: 'rgba(217,119,6,0.30)' },
};

const center = (id) => ({ cx: POS[id].x + NODE_W / 2, cy: POS[id].y + NODE_H / 2 });

function edgePath(from, to) {
  const a = center(from), b = center(to);
  const mx = (a.cx + b.cx) / 2;
  return `M ${a.cx} ${a.cy} C ${mx} ${a.cy}, ${mx} ${b.cy}, ${b.cx} ${b.cy}`;
}

export default function KagNodeView({ data }) {
  if (!data?.nodes) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-3"
    >
      <div className="rounded-xl border border-border bg-surface overflow-x-auto">
        <div className="px-4 pt-3 pb-1">
          <div className="text-[9px] uppercase tracking-wider font-bold text-text-subtle">KAG Knowledge Graph · bounded subgraph</div>
          <p className="text-[11px] text-text-muted mt-0.5">Queried via Cypher, re-rendered in Ultra — not the Neo4j browser</p>
        </div>
        <div className="relative mx-auto" style={{ width: CANVAS_W, height: CANVAS_H }}>
          <svg className="absolute inset-0 pointer-events-none" width={CANVAS_W} height={CANVAS_H}>
            {data.edges.map((e, i) => {
              const a = center(e.from), b = center(e.to);
              const lx = (a.cx + b.cx) / 2, ly = (a.cy + b.cy) / 2;
              return (
                <g key={i}>
                  <motion.path
                    d={edgePath(e.from, e.to)}
                    fill="none"
                    stroke="var(--color-brand)"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.55, strokeDashoffset: [-20, 0] }}
                    transition={{ opacity: { duration: 0.4 }, strokeDashoffset: { duration: 1.4, repeat: Infinity, ease: 'linear' } }}
                  />
                  {e.label && (
                    <text x={lx} y={ly - 5} textAnchor="middle" className="fill-text-subtle" style={{ fontSize: 9, fontWeight: 600 }}>
                      {e.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {data.nodes.map((node) => {
            const k = KIND[node.kind] || KIND.field;
            const Icon = k.icon;
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="absolute rounded-xl flex items-center gap-2 px-2.5"
                style={{ left: POS[node.id].x, top: POS[node.id].y, width: NODE_W, height: NODE_H, background: k.bg, border: `1.5px solid ${k.border}` }}
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: k.color }} />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-text leading-tight truncate">{node.label}</div>
                  <div className="text-[9px] text-text-subtle uppercase tracking-wide truncate">{node.sub}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <PolicyCard policy={data.policy} />
    </motion.div>
  );
}
