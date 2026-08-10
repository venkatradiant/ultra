import { AnimatePresence, motion } from 'framer-motion';
import { Zap, TrendingDown, Presentation } from 'lucide-react';
import InsightMiniCard from '../../cards/InsightMiniCard';
import { ACCENT_SOFT } from './tokens';

// ESFCU CEO home priority signals — the hero briefing card.
// The primary signal (Liquidity Watch) is promoted to a navy hero tile carrying
// the "View Full Briefing" affordance; the two next-most-important signals
// render as standard mini-cards. Clicking the hero body routes into its chat
// drill; the button launches Presentation Mode.
export default function CeoHomeSignals({ signals, visible, onSignalClick, signalToChip, onViewFullBriefing }) {
  if (!signals || signals.length === 0) return null;

  const primary = signals.find((s) => s.primary) || signals[0];
  const others = signals.filter((s) => s !== primary).slice(0, 2);
  const primaryChip = signalToChip?.[primary.id];
  const conf = primary.confidence?.score;

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
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-brand/8 flex items-center justify-center">
              <Zap className="w-3 h-3 text-brand" />
            </div>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Priority Signals</span>
            <div className="flex-1 h-px bg-surface-2 ml-1" />
          </div>

          {/* Primary hero — Liquidity Watch */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => primaryChip && onSignalClick?.(primaryChip)}
            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && primaryChip) { e.preventDefault(); onSignalClick?.(primaryChip); } }}
            className="relative overflow-hidden rounded-2xl bg-brand text-white p-4 mb-3 cursor-pointer transition-shadow hover:shadow-[0_8px_30px_rgba(0,55,104,0.30)]"
            style={{ boxShadow: '0 4px 18px rgba(0,55,104,0.20)' }}
          >
            <div className="absolute top-0 left-0 bottom-0 w-1" style={{ background: ACCENT_SOFT }} />
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="rounded-md px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#00243F]" style={{ background: ACCENT_SOFT }}>
                Primary
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: ACCENT_SOFT }}>
                <TrendingDown className="h-3 w-3" /> Watch · Funding &amp; liquidity
              </span>
              {conf != null ? (
                <span className="ml-auto text-[11px] font-semibold tabular-nums text-[#7fd3a6]">Confidence {conf}%</span>
              ) : null}
            </div>
            <h3 className="text-[15px] font-bold leading-tight">{primary.title}</h3>
            <p className="text-[12px] text-white/70 mt-1 leading-relaxed line-clamp-2">{primary.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onViewFullBriefing?.(); }}
                className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-semibold text-[#00243F] transition-opacity hover:opacity-90"
                style={{ background: ACCENT_SOFT }}
              >
                <Presentation className="h-3.5 w-3.5" /> View Full Briefing
              </button>
              {primary.metric_text ? (
                <span className="text-[11px] font-medium text-white/60">{primary.metric_text}</span>
              ) : null}
            </div>
          </div>

          {/* Next signals — the reconciliation gap and the seasonality window */}
          {others.length ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              {others.map((s, i) => (
                <InsightMiniCard
                  key={s.id}
                  signal={s}
                  index={i}
                  onClick={() => { const c = signalToChip?.[s.id]; if (c) onSignalClick?.(c); }}
                />
              ))}
            </div>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
