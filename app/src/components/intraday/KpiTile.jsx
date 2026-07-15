import { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, MessageSquarePlus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import useTickingValue from '../../hooks/useTickingValue';
import SourceBadge from '../chat/SourceBadge';
import ConfidenceBadge from '../nfcu/confidence/ConfidenceBadge';
import { useIntraday } from '../../context/IntradayContext';

const directionStyles = {
  negative: { color: 'text-red-600',     Arrow: ArrowDownRight },
  positive: { color: 'text-emerald-600', Arrow: ArrowUpRight },
  neutral:  { color: 'text-text-muted',    Arrow: Minus },
};

// Surface confidence inline only when noteworthy (<85). High-confidence
// telemetry hides the chrome — the value alone is the message.
const CONFIDENCE_REVEAL_THRESHOLD = 85;
const FADE_MS = 520;

// Subtle "live refresh" fade — value briefly dips opacity then settles. The
// motion alone says "this just updated" without the alarm of a ring flash.
function NumericValue({ value, unit }) {
  const ticked = useTickingValue(value, Math.max(0.05, Math.abs(value) * 0.01), 4000);
  const display = Number.isInteger(value) ? Math.round(ticked) : ticked.toFixed(1);
  return (
    <motion.span
      key={display}
      className="tabular-nums inline-block"
      initial={{ opacity: 0.35, y: -1 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: FADE_MS / 1000, ease: 'easeOut' }}
    >
      {display}
      {unit ? <span className="text-[13px] font-semibold text-text-subtle ml-0.5">{unit}</span> : null}
    </motion.span>
  );
}

export default function KpiTile({ kpi }) {
  const { baseline, hoveredKpi, setHoveredKpi, hoveredTreeNode, askAboutMetric } = useIntraday();
  const linkage = baseline?.kpi_to_tree?.[kpi?.id];
  const linkedNodeIds = useMemo(() => new Set(linkage?.nodes || []), [linkage]);

  if (!kpi) return null;
  const { id, label, value, unit, delta, deltaDirection, sources, confidence } = kpi;
  const dir = directionStyles[deltaDirection] || directionStyles.neutral;
  const isNumeric = typeof value === 'number';
  const showConfidence = confidence && typeof confidence.score === 'number' && confidence.score < CONFIDENCE_REVEAL_THRESHOLD;

  const isHovered = hoveredKpi === id;
  const treeLinkActive = hoveredTreeNode && linkedNodeIds.has(hoveredTreeNode);
  const askChip = linkage?.ask;

  // Refresh is communicated by the value-level fade in NumericValue — keep the
  // tile chrome calm; only hover and root-cause linkage emphasize the tile.
  const ringClass = treeLinkActive
    ? 'ring-2 ring-brand/40 border-brand/30'
    : isHovered
    ? 'ring-1 ring-gray-300 border-border'
    : 'border-border';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onMouseEnter={() => setHoveredKpi(id)}
      onMouseLeave={() => setHoveredKpi((cur) => (cur === id ? null : cur))}
      className={`relative rounded-xl border bg-surface p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col gap-1.5 transition-shadow group ${ringClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-muted leading-tight">
          {label}
        </p>
        {showConfidence ? <ConfidenceBadge confidence={confidence} compact /> : null}
      </div>

      <div className="text-[22px] font-bold text-text leading-none tabular-nums">
        {isNumeric
          ? <NumericValue value={value} unit={unit} />
          : <span>{value}{unit ? <span className="text-[13px] font-semibold text-text-subtle ml-0.5">{unit}</span> : null}</span>}
      </div>

      {delta ? (
        <div className={`inline-flex items-center gap-1 text-[11px] font-semibold ${dir.color} tabular-nums`}>
          <dir.Arrow className="w-3.5 h-3.5" />
          <span>{delta}</span>
        </div>
      ) : null}

      {sources?.length ? (
        <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-gray-100/70">
          {sources.map((s, i) => <SourceBadge key={i} source={s} />)}
        </div>
      ) : null}

      {askChip ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            askAboutMetric(askChip);
          }}
          className="absolute right-1.5 bottom-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold text-brand bg-white/95 border border-brand/15 opacity-0 group-hover:opacity-100 hover:bg-brand/[0.06] transition-opacity cursor-pointer"
          title={`Ask AI: ${askChip}`}
        >
          <MessageSquarePlus className="w-3 h-3" />
          Ask AI
        </button>
      ) : null}
    </motion.div>
  );
}
