/**
 * ProjectedImpactPanel — what fixing this now prevents, and what waiting costs.
 *
 * Two of these three numbers are readings and one is a projection, and the
 * panel says which is which. The dollars returned come out of the billing
 * system; the calls prevented and hold time avoided come out of a model over
 * historical call-driver data. Presenting all three in identical tiles without
 * that note would be the exact failure this demo argues against.
 */
import { motion } from 'framer-motion';
import { PhoneOff, Clock3, DollarSign } from 'lucide-react';
import IllustrativeChip from './IllustrativeChip';

export default function ProjectedImpactPanel({ pattern, sla = null }) {
  if (!pattern) return null;

  const tiles = [
    {
      id: 'returned',
      icon: DollarSign,
      value: `$${pattern.totalFinancialDelta.toLocaleString(undefined, { minimumFractionDigits: pattern.totalFinancialDelta % 1 ? 2 : 0 })}`,
      label: 'returned to customers',
      tint: 'text-emerald-700',
      bg: 'bg-emerald-500/10',
      derived: false,
    },
    pattern.projectedCallsPrevented != null && {
      id: 'calls',
      icon: PhoneOff,
      value: `~${pattern.projectedCallsPrevented}`,
      label: 'support calls prevented',
      tint: 'text-brand',
      bg: 'bg-brand/10',
      derived: true,
    },
    pattern.projectedHoldHours != null && {
      id: 'hold',
      icon: Clock3,
      value: `~${pattern.projectedHoldHours} hrs`,
      label: 'customer hold time avoided',
      tint: 'text-brand',
      bg: 'bg-brand/10',
      derived: true,
    },
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">
          Projected Impact — Applying This Fix
        </span>
        <IllustrativeChip />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tiles.map(({ id, icon: Icon, value, label, tint, bg, derived }) => (
          <div key={id} className="rounded-xl border border-border-subtle bg-surface-2/40 p-3.5 min-w-0">
            <span className={`inline-flex w-6 h-6 rounded-md items-center justify-center mb-2 ${bg}`}>
              <Icon className={`w-3.5 h-3.5 ${tint}`} />
            </span>
            <p className={`text-xl font-bold leading-none tracking-tight ${tint}`}>{value}</p>
            <p className="text-[11px] text-text-muted mt-1.5 leading-snug">{label}</p>
            <p className="text-[9.5px] text-text-subtle mt-1.5">
              {derived ? 'Modeled — predictive impact model' : 'Read — billing system'}
            </p>
          </div>
        ))}
      </div>

      {sla && (
        <p className="text-[11px] text-text-muted mt-3.5 pt-3.5 border-t border-border-subtle leading-relaxed">
          If these roll into next cycle you issue the same money back as credits later instead of
          correcting it now — and the calls arrive anyway. You have{' '}
          <span className="font-semibold text-text">{sla.remainingHours} hours</span> of SLA left, which is
          enough to clear every bulk-resolvable pattern.
        </p>
      )}
    </motion.div>
  );
}
