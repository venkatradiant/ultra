import SourceBadge from '../chat/SourceBadge';
import { useIntraday } from '../../context/IntradayContext';

const KIND_STYLES = {
  root: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    ring: 'ring-red-400/40',
    text: 'text-red-700',
    chipBg: 'bg-red-100',
    label: 'ROOT',
  },
  impact: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    ring: 'ring-amber-400/40',
    text: 'text-amber-700',
    chipBg: 'bg-amber-100',
    label: 'IMPACT',
  },
  outcome: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    ring: 'ring-blue-400/40',
    text: 'text-blue-700',
    chipBg: 'bg-blue-100',
    label: 'OUTCOME',
  },
};

export default function RootCauseNode({ node, width, height, highlighted }) {
  const style = KIND_STYLES[node.kind] || KIND_STYLES.impact;
  const { baseline, hoveredKpi, setHoveredTreeNode } = useIntraday();

  // Reverse-lookup: is any KPI in the hovered-KPI's linkage pointing at me?
  const kpiLinked = !!(hoveredKpi && baseline?.kpi_to_tree?.[hoveredKpi]?.nodes?.includes(node.id));

  const top = node.metric ? (
    <div className="flex items-baseline justify-between gap-1">
      <span className={`text-[9px] font-bold uppercase tracking-wide ${style.text} px-1 py-px rounded-sm ${style.chipBg}`}>
        {style.label}
      </span>
      <span className={`text-xs font-bold tabular-nums ${style.text}`}>{node.metric}</span>
    </div>
  ) : (
    <span className={`text-[9px] font-bold uppercase tracking-wide ${style.text} px-1 py-px rounded-sm ${style.chipBg} inline-block`}>
      {style.label}
    </span>
  );

  return (
    <div
      onMouseEnter={() => setHoveredTreeNode(node.id)}
      onMouseLeave={() => setHoveredTreeNode((cur) => (cur === node.id ? null : cur))}
      className={`absolute rounded-lg border ${style.border} ${style.bg} px-2 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 ${
        kpiLinked
          ? `ring-2 ring-brand/45 scale-[1.04] z-10`
          : highlighted
          ? `ring-2 ${style.ring} scale-[1.03]`
          : 'opacity-70'
      }`}
      style={{ left: node.x, top: node.y, width, minHeight: height }}
      title={node.sources?.join(' + ')}
    >
      <div className="flex flex-col gap-0.5">
        {top}
        <p className="text-[10.5px] font-semibold text-text leading-tight line-clamp-2">
          {node.label}
        </p>
        {node.sources?.length ? (
          <div className="flex flex-wrap gap-0.5">
            {node.sources.slice(0, 2).map((s, i) => <SourceBadge key={i} source={s} />)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
