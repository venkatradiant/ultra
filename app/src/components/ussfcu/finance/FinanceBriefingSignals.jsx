import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Zap, ChevronRight } from 'lucide-react';
import { tierFor, colorFor } from '../../../utils/confidence';

/**
 * The Finance Team persona's opening briefing: the three signals the overnight
 * scan surfaced.
 *
 * Visually this IS the shared Priority Signals row (TopInsightsBar +
 * InsightMiniCard): same section label, same three-across row, same card —
 * top accent line, icon tile, pill badge, title, metric + confidence +
 * chevron. Two things the shared card cannot carry, so it is mirrored here
 * rather than changed for every tenant: the narrative's own badges (ACT NOW /
 * WATCH instead of Critical / Warning) and each signal's one-sentence
 * description, which sits under the title in the card's muted text style.
 * Each card opens the approved question it answers (via signalToChip).
 */
const severityConfig = {
  critical: {
    accent: 'bg-red-500',
    iconBg: 'bg-red-50',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    badge: 'text-red-700 bg-red-50',
  },
  warning: {
    accent: 'bg-amber-500',
    iconBg: 'bg-amber-50',
    icon: TrendingDown,
    iconColor: 'text-amber-500',
    badge: 'text-amber-700 bg-amber-50',
  },
};

function SignalTile({ signal, onClick, index }) {
  const config = severityConfig[String(signal.severity).toLowerCase()] || severityConfig.warning;
  const Icon = config.icon;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
      onClick={onClick}
      className="flex-1 min-w-0 relative overflow-hidden rounded-xl bg-surface border border-gray-100/80 text-left cursor-pointer group hover:shadow-[0_4px_16px_rgba(0,48,135,0.07)] hover:border-brand/15 transition-all duration-200"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${config.accent}`} />

      <div className="px-3.5 py-2.5 h-full flex flex-col">
        {/* Header row */}
        <div className="flex items-center justify-between mb-1.5">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${config.iconBg}`}>
            <Icon className={`w-3 h-3 ${config.iconColor}`} />
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${config.badge}`}>
            {signal.severity_label}
          </span>
        </div>

        {/* Title */}
        <p className="text-[12px] font-semibold text-text leading-snug line-clamp-2 mb-1 group-hover:text-brand transition-colors">
          {signal.title}
        </p>

        {/* Description — the narrative's sentence for this signal */}
        <p className="text-[10.5px] text-text-muted leading-snug mb-1.5">{signal.description}</p>

        {/* Metric */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <p className="text-[10px] text-text-subtle font-medium truncate">{signal.metric_text}</p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {signal.confidence && (
              <span className="text-[10px] font-semibold tabular-nums" style={{ color: colorFor(tierFor(signal.confidence.score)) }}>
                {signal.confidence.score}%
              </span>
            )}
            <ChevronRight className="w-3 h-3 text-text-subtle group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export default function FinanceBriefingSignals({ signals, visible, onSignalClick, signalToChip }) {
  if (!signals || signals.length === 0) return null;

  const open = (signal) => {
    const chip = signalToChip?.[signal.id];
    if (!chip) {
      console.warn(`[ConversationGuard] No chip mapped for signal "${signal.id}" — click blocked.`);
      return;
    }
    onSignalClick?.(chip);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 'auto' }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="mb-3"
        >
          {/* Section label */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-brand/8 flex items-center justify-center">
              <Zap className="w-3 h-3 text-brand" />
            </div>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Overnight portfolio scan</span>
            <div className="flex-1 h-px bg-surface-2 ml-1" />
          </div>

          {/* Three across, as on every other persona; stacked on a phone so
              the descriptions stay readable. */}
          <div className="flex flex-col sm:flex-row gap-3">
            {signals.slice(0, 3).map((signal, idx) => (
              <SignalTile key={signal.id} signal={signal} index={idx} onClick={() => open(signal)} />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
