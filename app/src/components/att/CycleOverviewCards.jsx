/**
 * CycleOverviewCards — the four figures that answer "how bad is this cycle?".
 *
 * Deliberately four, not eight. The operator's first question is scope and
 * clock, and the SLA bar underneath is what turns those four numbers into a
 * decision. Everything else (auto-corrected, pending review, accuracy) belongs
 * on the Dashboard, where she goes when she is not under a countdown.
 *
 * The "In Patterns" card carries its own progress bar because 207 of 207 is
 * the claim the whole demo rests on — every anomaly is bulk-resolvable, and
 * none is hiding outside a group.
 */
import { motion } from 'framer-motion';
import { AlertTriangle, Layers, DollarSign, Target } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getCycleOverview } from '../../data/att/billing-operator';
import IllustrativeChip, { ProvenanceLine } from './IllustrativeChip';
import SlaCountdown from './SlaCountdown';

const CARD_META = [
  { id: 'totalAnomalies', label: 'Total Anomalies', icon: AlertTriangle, tint: 'text-amber-600', bg: 'bg-amber-500/10' },
  { id: 'patternedAnomalies', label: 'In Patterns', icon: Layers, tint: 'text-brand', bg: 'bg-brand/10' },
  { id: 'totalFinancialImpact', label: 'Revenue at Risk', icon: DollarSign, tint: 'text-rose-600', bg: 'bg-rose-500/10' },
  { id: 'averageConfidence', label: 'Avg Confidence', icon: Target, tint: 'text-emerald-600', bg: 'bg-emerald-500/10' },
];

export default function CycleOverviewCards({ getter = getCycleOverview, showSla = true }) {
  const data = useAsyncData(getter);
  if (!data) return null;

  const values = {
    totalAnomalies: {
      value: data.totalAnomalies.toLocaleString(),
      sub: `across ${data.totalAccounts} accounts`,
      source: 'Anomaly-detection engine',
    },
    patternedAnomalies: {
      value: data.patternedAnomalies.toLocaleString(),
      sub: `in ${data.patternsDetected} of ${data.patternsDetected} groups — bulk-resolvable`,
      source: 'Pattern-detection agent',
      progress: (data.patternedAnomalies / data.totalAnomalies) * 100,
    },
    totalFinancialImpact: {
      value: `$${data.totalFinancialImpact.toLocaleString()}`,
      sub: 'pending resolution',
      source: 'Billing system',
    },
    averageConfidence: {
      value: `${data.averageConfidence}%`,
      sub: 'above the 90% auto-resolve threshold',
      source: 'Confidence-scoring agent',
    },
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold text-text tracking-tight">Billing Cycle Overview</h3>
          <p className="text-[11px] text-text-subtle mt-0.5">Feb 2026 · Consumer-East-02</p>
        </div>
        <IllustrativeChip />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {CARD_META.map(({ id, label, icon: Icon, tint, bg }, i) => {
          const v = values[id];
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="rounded-xl border border-border-subtle bg-surface-2/40 p-3.5 min-w-0"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${tint}`} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-subtle truncate">
                  {label}
                </span>
              </div>
              <p className="text-2xl font-bold text-text leading-none tracking-tight">{v.value}</p>
              <p className="text-[11px] text-text-muted mt-1.5 leading-snug">{v.sub}</p>
              {v.progress != null && (
                <div className="mt-2 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${v.progress}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="h-full rounded-full bg-brand"
                  />
                </div>
              )}
              <ProvenanceLine source={v.source} className="mt-2" />
            </motion.div>
          );
        })}
      </div>

      {showSla && <SlaCountdown className="mt-4" sla={data.sla} />}
    </div>
  );
}
