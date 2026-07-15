import { AnimatePresence, motion } from 'framer-motion';
import { Zap, TrendingDown, Presentation } from 'lucide-react';
import InsightMiniCard from '../../cards/InsightMiniCard';

// USSFCU CEO home priority signals. The primary (Liquidity Watch) is promoted to
// a distinct navy hero tile with the "View Full Briefing" affordance inside it;
// the two steady signals render as the standard mini-cards. Clicking the hero
// body routes to its chat drill (like the mini-cards); the button launches the
// Presentation Mode deck.
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
          {/* Section label */}
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
            className="relative overflow-hidden rounded-2xl bg-brand text-white p-4 mb-3 cursor-pointer transition-shadow hover:shadow-[0_8px_30px_rgba(0,48,135,0.28)]"
            style={{ boxShadow: '0 4px 18px rgba(0,48,135,0.18)' }}
          >
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#C2A24C]" />
            <div className="flex items-center gap-2 mb-1.5">
              <span className="rounded-md bg-[#E4CE96] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#06182B]">Primary</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#E4CE96]">
                <TrendingDown className="h-3 w-3" /> Watch · Balance sheet
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
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#E4CE96] px-3.5 py-2 text-[12px] font-semibold text-[#06182B] transition-colors hover:bg-[#d8bd7d]"
              >
                <Presentation className="h-3.5 w-3.5" /> View Full Briefing
              </button>
              {primary.metric_text ? (
                <span className="text-[11px] font-medium text-white/60">{primary.metric_text}</span>
              ) : null}
            </div>
          </div>

          {/* Steady signals */}
          {others.length ? (
            <div className="flex gap-3">
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
