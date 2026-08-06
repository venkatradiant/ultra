/**
 * RetrainingHistory — v2.4.1 back to v2.2.5.
 *
 * The track record the "+6–8%" forecast is measured against. Four entries is a
 * small sample and the panel says the average out loud (+4.9%) so nobody has to
 * do the arithmetic to notice the forecast is optimistic against history.
 */
import { motion } from 'framer-motion';
import { History as HistoryIcon } from 'lucide-react';
import IllustrativeChip from './IllustrativeChip';

export default function RetrainingHistory({ history = [] }) {
  if (!history.length) return null;
  const avg = (history.reduce((s, h) => s + h.improvement, 0) / history.length).toFixed(1);
  const max = Math.max(...history.map((h) => h.improvement));

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="inline-flex items-center gap-1.5 text-[13px] font-bold text-text tracking-tight">
          <HistoryIcon className="w-4 h-4 text-brand" /> Retraining History
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10.5px] text-text-subtle">
            {history.length} retrainings · avg <span className="font-bold text-emerald-700">+{avg}%</span>
          </span>
          <IllustrativeChip />
        </div>
      </div>

      <ol className="space-y-2.5">
        {history.map((h, i) => (
          <motion.li
            key={h.version}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-2/40 px-3.5 py-2.5 min-w-0"
          >
            <span className="text-[11.5px] font-mono font-bold text-text flex-shrink-0 w-[52px]">{h.version}</span>
            <span className="text-[11px] text-text-subtle flex-shrink-0 w-[92px] hidden sm:block">{h.date}</span>
            <span className="flex-1 min-w-0 h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: `${(h.improvement / max) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                className="block h-full rounded-full bg-emerald-500"
              />
            </span>
            <span className="text-[11.5px] font-bold text-emerald-700 tabular-nums flex-shrink-0 w-[46px] text-right">
              +{h.improvement}%
            </span>
            <span className="text-[10.5px] text-text-subtle tabular-nums flex-shrink-0 w-[68px] text-right hidden lg:block">
              {h.dataPoints.toLocaleString()} pts
            </span>
          </motion.li>
        ))}
      </ol>

      <p className="text-[10.5px] text-text-subtle mt-3.5 leading-relaxed">
        Four passes, +3.8% to +6.4%, averaging +{avg}%. The next one is projected at +6–8%, which sits at
        the optimistic end of that record — worth knowing before it is used to justify a threshold change.
      </p>
    </div>
  );
}
