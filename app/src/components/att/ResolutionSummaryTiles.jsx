/**
 * ResolutionSummaryTiles — what this session actually resolved.
 *
 * The success rate is 60%, and it is shown as 60% rather than dressed up.
 * Three of five executed, one marked a false positive, one escalated — the
 * escalation and the false positive are not failures, they are the two outcomes
 * that prove the operator was allowed to disagree with the system. A demo that
 * reported 100% here would be describing a workflow with no judgment in it.
 */
import { motion } from 'framer-motion';
import { CheckCircle2, ListChecks, ArrowUpRight, Percent } from 'lucide-react';
import IllustrativeChip from './IllustrativeChip';

export default function ResolutionSummaryTiles({ summary }) {
  if (!summary) return null;

  const tiles = [
    { id: 'total', icon: ListChecks, value: summary.totalResolutions, label: 'Total Resolutions', tint: 'text-brand', bg: 'bg-brand/10' },
    { id: 'executed', icon: CheckCircle2, value: summary.executed, label: 'Approved & Executed', tint: 'text-emerald-700', bg: 'bg-emerald-500/10' },
    { id: 'escalated', icon: ArrowUpRight, value: summary.escalations, label: 'Escalated to SME', tint: 'text-amber-700', bg: 'bg-amber-500/10' },
    { id: 'rate', icon: Percent, value: `${summary.successRate}%`, label: 'Direct-Resolution Rate', tint: 'text-text', bg: 'bg-surface-2' },
  ];

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">
          This Session
        </span>
        <IllustrativeChip />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {tiles.map(({ id, icon: Icon, value, label, tint, bg }, i) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className="rounded-xl border border-border-subtle bg-surface-2/40 p-3.5 min-w-0"
          >
            <span className={`inline-flex w-6 h-6 rounded-md items-center justify-center mb-2 ${bg}`}>
              <Icon className={`w-3.5 h-3.5 ${tint}`} />
            </span>
            <p className={`text-2xl font-bold leading-none tracking-tight ${tint}`}>{value}</p>
            <p className="text-[10.5px] text-text-muted mt-1.5 leading-snug">{label}</p>
          </motion.div>
        ))}
      </div>

      <p className="text-[11px] text-text-muted mt-3.5 pt-3.5 border-t border-border-subtle leading-relaxed">
        The remaining {summary.totalResolutions - summary.executed} are not failures.{' '}
        {summary.falsePositives} was marked a false positive and {summary.escalations} escalated to SME —
        the two outcomes that show the operator was able to disagree with the system rather than only
        approve it.
      </p>
    </div>
  );
}
