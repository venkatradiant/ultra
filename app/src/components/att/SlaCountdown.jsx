/**
 * SlaCountdown — the 36-hour BRN review window.
 *
 * The bar is frozen at the demo's mid-cycle state (24.3 elapsed, 11.7
 * remaining) rather than ticking off a real clock: a live countdown would drift
 * out of the scripted conversation, which quotes "11.7 hours" verbatim, within
 * a day of anyone opening this.
 *
 * The remaining figure leads and is the one that gets colour, because the
 * operator's decision is always about what is left, never about what is spent.
 */
import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';

export default function SlaCountdown({ sla, className = '', compact = false }) {
  if (!sla) return null;
  const { windowHours, elapsedHours, remainingHours, percentage } = sla;

  // Under a quarter of the window left is where "comfortable" stops being the
  // right reading; at 11.7 of 36 this is amber, not red.
  const tone = percentage >= 85 ? 'critical' : percentage >= 60 ? 'warning' : 'ok';
  const barColor = tone === 'critical' ? 'bg-rose-600' : tone === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';
  const textColor = tone === 'critical' ? 'text-rose-700' : tone === 'warning' ? 'text-amber-700' : 'text-emerald-700';

  return (
    <div className={`rounded-xl border border-border-subtle bg-surface-2/40 p-3.5 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-subtle">
          <Timer className="w-3.5 h-3.5" /> BRN SLA Window
        </span>
        <span className="text-[11px] text-text-muted">
          <span className={`font-bold ${textColor}`}>{remainingHours}h remaining</span>
          {!compact && <> · {elapsedHours}h elapsed of {windowHours}h</>}
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
      {!compact && (
        <p className="text-[10px] text-text-subtle mt-1.5 leading-snug">
          {percentage}% through the window. Enough to clear every bulk-resolvable pattern — the five edge
          cases are the constraint, not the clock.
        </p>
      )}
    </div>
  );
}
