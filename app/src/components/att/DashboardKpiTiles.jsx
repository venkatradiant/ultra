/**
 * DashboardKpiTiles — the six cycle-wide counts.
 *
 * Every tile names its source system and, where the number could be
 * misunderstood, says what it is not: "Anomalies Detected: 18,742" is the
 * cycle-wide detection count, and the 207 the operator works are the subset
 * that reached a human. Two numbers that both mean "anomalies" and differ by
 * two orders of magnitude have to explain themselves on the tile, not in a
 * footnote nobody reads.
 */
import { motion } from 'framer-motion';
import { Users, AlertTriangle, CheckCircle2, Clock, DollarSign, Target } from 'lucide-react';
import IllustrativeChip from './IllustrativeChip';

const ICONS = {
  users: Users,
  'alert-triangle': AlertTriangle,
  'check-circle': CheckCircle2,
  clock: Clock,
  'dollar-sign': DollarSign,
  target: Target,
};

export default function DashboardKpiTiles({ kpis = [] }) {
  if (!kpis.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {kpis.map((k, i) => {
        const Icon = ICONS[k.icon] || Target;
        return (
          <motion.div
            key={k.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className="rounded-2xl border border-border-subtle bg-surface p-4 min-w-0"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="inline-flex w-7 h-7 rounded-lg items-center justify-center bg-brand/10 flex-shrink-0">
                <Icon className="w-4 h-4 text-brand" />
              </span>
              {k.delta && (
                <span className={`text-[10.5px] font-semibold tabular-nums ${k.positive ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {k.delta}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-text leading-none tracking-tight tabular-nums">{k.value}</p>
            <p className="text-[11.5px] font-medium text-text-muted mt-1.5 leading-snug">{k.title}</p>
            {k.note && <p className="text-[10px] text-text-subtle mt-2 leading-snug">{k.note}</p>}
            <p className="text-[9.5px] text-text-subtle mt-1.5">
              <span className="font-medium text-text-muted">Source:</span> {k.source}
            </p>
          </motion.div>
        );
      })}
      <div className="sm:col-span-2 xl:col-span-3 flex justify-end">
        <IllustrativeChip />
      </div>
    </div>
  );
}
