import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Eye, Zap, ArrowRight } from 'lucide-react';
import { tierFor, colorFor } from '../../../utils/confidence';

/**
 * The Finance Team persona's opening briefing: the three signals the overnight
 * scan surfaced, badged the way the narrative badges them — ACT NOW or WATCH —
 * rather than the shared cards' Critical / Warning. Each card opens the
 * approved question it answers (via signalToChip).
 */
const BADGES = {
  critical: { Icon: AlertTriangle, accent: 'bg-critical', badge: 'bg-critical text-white', iconColor: 'text-critical' },
  warning: { Icon: Eye, accent: 'bg-warning', badge: 'bg-warning-subtle text-warning border border-warning/30', iconColor: 'text-warning' },
};

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
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-brand/8">
              <Zap className="h-3 w-3 text-brand" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Overnight portfolio scan</span>
            <div className="ml-1 h-px flex-1 bg-surface-2" />
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {signals.slice(0, 3).map((signal, idx) => {
              const style = BADGES[signal.severity] || BADGES.warning;
              const { Icon } = style;
              const conf = signal.confidence?.score;
              return (
                <motion.button
                  key={signal.id}
                  type="button"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.06 }}
                  onClick={() => open(signal)}
                  className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-surface p-3 pl-4 text-left shadow-sm transition-all hover:border-brand/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
                >
                  <span className={`absolute inset-y-0 left-0 w-1 ${style.accent}`} aria-hidden="true" />
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${style.badge}`}>
                      <Icon className="h-3 w-3" />
                      {signal.severity_label}
                    </span>
                    {conf != null ? (
                      <span className="text-[10px] font-semibold tabular-nums" style={{ color: colorFor(tierFor(conf)) }}>
                        {conf}% conf.
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-[12.5px] font-semibold leading-snug text-text">{signal.title}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-text-muted">{signal.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className={`truncate text-[10px] font-semibold ${style.iconColor}`}>{signal.metric_text}</span>
                    <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
