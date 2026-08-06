/**
 * BusinessImpactStrip — the modeled downstream effect of clearing cycles well.
 *
 * These five are the only figures in the operator's view that are *derived*
 * rather than read: call volume, calls prevented, hours saved, ops efficiency
 * and cost savings all come out of a model, not out of the billing system. So
 * the strip says so on its face rather than sitting beside the cycle counts as
 * though it were the same kind of number.
 */
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getCycleOverview } from '../../data/att/billing-operator';
import IllustrativeChip from './IllustrativeChip';

export default function BusinessImpactStrip({ getter = getCycleOverview }) {
  const data = useAsyncData(getter);
  if (!data?.businessImpact) return null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-subtle">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Business Impact — This Cycle
        </span>
        <IllustrativeChip note="Modeled downstream effect, not a system reading." />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {data.businessImpact.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className="rounded-xl border border-border-subtle bg-surface-2/40 px-3 py-3 text-center min-w-0"
          >
            <p className={`text-xl font-bold leading-none tracking-tight ${m.positive ? 'text-emerald-700' : 'text-text'}`}>
              {m.value}
            </p>
            <p className="text-[10px] text-text-muted mt-1.5 leading-snug truncate">{m.label}</p>
          </motion.div>
        ))}
      </div>

      <p className="text-[10px] text-text-subtle mt-3 leading-snug">
        <span className="font-medium text-text-muted">Source:</span> Derived analytics — modeled from
        resolution volume and historical call-driver data. These are projections, not counts from the
        billing system.
      </p>
    </div>
  );
}
