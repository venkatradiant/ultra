import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock } from 'lucide-react';
import InsightMiniCard from '../cards/InsightMiniCard';
import KpiChipStrip from './KpiChipStrip';

// Section heading rail — matches the styling used by TopInsightsBar on the
// other personas (small icon chip + uppercase label + thin divider line).
function SectionHeading({ Icon, iconTint, label }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-5 h-5 rounded-md ${iconTint.bg} flex items-center justify-center`}>
        <Icon className={`w-3 h-3 ${iconTint.fg}`} />
      </div>
      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
        {label}
      </span>
      <div className="flex-1 h-px bg-surface-2 ml-1" />
    </div>
  );
}

function SignalRow({ signals, onTileClick }) {
  return (
    <div className="flex gap-3">
      {signals.map((signal, idx) => (
        <InsightMiniCard
          key={signal.id}
          signal={signal}
          index={idx}
          onClick={() => onTileClick && onTileClick(signal)}
        />
      ))}
    </div>
  );
}

export default function BriefingPanel({
  baseline,
  intradayTiers,
  onSignalClick,
  signalToChip = {},
}) {
  const liveSignals = useMemo(() => (baseline?.priority_signals_inline || []).slice(0, 3), [baseline]);
  const trendSignals = useMemo(() => (baseline?.trend_signals_inline || []).slice(0, 3), [baseline]);

  if (!baseline) return null;

  const handleTileClick = (signal) => {
    const chipText = signalToChip?.[signal.id];
    if (!chipText) {
      // eslint-disable-next-line no-console
      console.warn(`[BriefingPanel] No chip mapped for signal "${signal.id}" — click blocked.`);
      return;
    }
    if (onSignalClick) onSignalClick(chipText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 'auto' }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mb-3 space-y-3"
    >
      {liveSignals.length > 0 ? (
        <section>
          <SectionHeading
            Icon={Zap}
            iconTint={{ bg: 'bg-brand/8', fg: 'text-brand' }}
            label="Intraday / Real-Time Signals"
          />
          <SignalRow signals={liveSignals} onTileClick={handleTileClick} />
        </section>
      ) : null}

      {trendSignals.length > 0 ? (
        <section>
          <SectionHeading
            Icon={Clock}
            iconTint={{ bg: 'bg-slate-100', fg: 'text-slate-500' }}
            label="Trend / Proactive Insights"
          />
          <SignalRow signals={trendSignals} onTileClick={handleTileClick} />
        </section>
      ) : null}

      {baseline.tiers && intradayTiers?.length ? (
        <section>
          <KpiChipStrip tiers={baseline.tiers} availableTiers={intradayTiers} />
        </section>
      ) : null}
    </motion.div>
  );
}
