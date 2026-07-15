import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import SignalCard from '../cards/SignalCard';

// Trend signals are always shown — they don't follow the per-step signalIds
// filter that the live row uses. The framing is "review when you have time",
// not "act now".
export default function TrendSignalsRow({ baseline }) {
  const trends = baseline?.trend_signals_inline || [];
  if (!trends.length) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
          <Clock className="w-2.5 h-2.5" />
          Trends · Review when ready
        </span>
        <span className="text-[10px] font-medium text-text-subtle">
          {trends.length} insight{trends.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="space-y-2">
        {trends.map((sig, idx) => (
          <motion.div
            key={sig.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.05, ease: 'easeOut' }}
          >
            <SignalCard signal={sig} tone="calm" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
