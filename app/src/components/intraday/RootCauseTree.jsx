import { useMemo } from 'react';
import { motion } from 'framer-motion';
import RootCauseNode from './RootCauseNode';
import { useIntraday } from '../../context/IntradayContext';

const CANVAS_WIDTH = 660;
const CANVAS_HEIGHT = 380;
const NODE_WIDTH = 140;
const NODE_HEIGHT = 64;

function nodeCenter(node) {
  return {
    cx: node.x + NODE_WIDTH / 2,
    cy: node.y + NODE_HEIGHT / 2,
  };
}

function curvedPath(from, to) {
  const dy = to.cy - from.cy;
  return `M ${from.cx} ${from.cy} C ${from.cx} ${from.cy + dy / 2}, ${to.cx} ${to.cy - dy / 2}, ${to.cx} ${to.cy}`;
}

export default function RootCauseTree({ tree, highlight = [] }) {
  const { baseline, hoveredKpi } = useIntraday();

  const nodesById = useMemo(() => {
    if (!tree?.nodes) return {};
    return Object.fromEntries(tree.nodes.map((n) => [n.id, n]));
  }, [tree]);

  // When a KPI is hovered, bring its linked nodes' connecting edges forward
  // as well — keeps the cause-effect story coherent.
  const kpiLinkedNodeSet = useMemo(() => {
    if (!hoveredKpi) return null;
    const linked = baseline?.kpi_to_tree?.[hoveredKpi]?.nodes;
    return linked && linked.length ? new Set(linked) : null;
  }, [hoveredKpi, baseline]);

  if (!tree?.nodes?.length) return null;

  const highlightSet = new Set(highlight);

  return (
    <div className="rounded-xl border border-border bg-surface overflow-x-auto">
      <div className="relative" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        <svg
          className="absolute inset-0 pointer-events-none"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
        >
          {tree.edges.map((e, idx) => {
            const fromNode = nodesById[e.from];
            const toNode = nodesById[e.to];
            if (!fromNode || !toNode) return null;
            const from = nodeCenter(fromNode);
            const to = nodeCenter(toNode);
            const active = highlightSet.has(e.from) && highlightSet.has(e.to);
            const kpiLinked = !!kpiLinkedNodeSet && kpiLinkedNodeSet.has(e.from) && kpiLinkedNodeSet.has(e.to);
            const stroke = active ? 'var(--color-brand)' : kpiLinked ? 'var(--color-brand)' : '#D1D5DB';
            const opacity = active ? 0.95 : kpiLinked ? 0.65 : 0.45;
            return (
              <motion.path
                key={`${e.from}-${e.to}-${idx}`}
                d={curvedPath(from, to)}
                fill="none"
                stroke={stroke}
                strokeWidth={Math.max(1.5, e.weight * 3.5)}
                strokeDasharray="6 4"
                strokeLinecap="round"
                initial={false}
                animate={
                  active
                    ? { strokeDashoffset: [-20, 0], opacity }
                    : { strokeDashoffset: 0, opacity }
                }
                transition={
                  active
                    ? { strokeDashoffset: { duration: 1.4, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.4 } }
                    : { duration: 0.4 }
                }
              />
            );
          })}
        </svg>
        {tree.nodes.map((node) => (
          <RootCauseNode
            key={node.id}
            node={node}
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            highlighted={highlightSet.has(node.id)}
          />
        ))}
      </div>
    </div>
  );
}
