/**
 * EvidenceTrustPanel — every figure on screen, with its source and freshness.
 *
 * The answer to "can I defend every number if the auditor asks?". One row per
 * headline figure: where it came from, when it last updated, and whether it is
 * a direct read or a reconciled result. Reconciled figures link to the
 * reconciliation that produced them.
 */
import { motion } from 'framer-motion';
import { ShieldCheck, Database } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getReconciliation } from '../../data/aramco/hse-gm';
import IllustrativeDataChip from './IllustrativeDataChip';
import HeadcountReconciliationPanel from './HeadcountReconciliationPanel';

export default function EvidenceTrustPanel({ getter = getReconciliation, scope = 'all', showReconciliation = false }) {
  const rec = useAsyncData(getter);
  if (!rec) return null;

  const figures =
    scope === 'permit'
      ? rec.trustedFigures.filter((f) => f.label.toLowerCase().includes('permit'))
      : rec.trustedFigures;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3.5">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text">
              <ShieldCheck className="w-4 h-4 text-brand" />
              Can I trust these numbers?
            </h3>
            <p className="text-[11.5px] text-text-muted mt-1 leading-relaxed max-w-2xl">
              Every figure carries its source and its freshness. Anything reconciled from more than one source says so,
              and the reconciliation is logged for audit.
            </p>
          </div>
          <IllustrativeDataChip />
        </div>

        <div className="overflow-x-auto scrollbar-sleek">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="pb-2 text-[10px] font-bold uppercase tracking-wider text-text-subtle">Figure</th>
                <th className="pb-2 text-[10px] font-bold uppercase tracking-wider text-text-subtle">Value</th>
                <th className="pb-2 text-[10px] font-bold uppercase tracking-wider text-text-subtle">Source</th>
                <th className="pb-2 text-[10px] font-bold uppercase tracking-wider text-text-subtle">Freshness</th>
              </tr>
            </thead>
            <tbody>
              {figures.map((f, i) => (
                <motion.tr
                  key={f.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className="border-b border-border-subtle/60 last:border-0"
                >
                  <td className="py-2.5 pr-3 text-[12px] font-medium text-text align-top">{f.label}</td>
                  <td className="py-2.5 pr-3 text-[13px] font-bold text-text align-top whitespace-nowrap">{f.value}</td>
                  <td className="py-2.5 pr-3 text-[11.5px] text-text-muted align-top">
                    <span className="inline-flex items-start gap-1.5">
                      <Database className="w-3 h-3 flex-shrink-0 mt-0.5 text-text-subtle" />
                      <span className="min-w-0">{f.source}</span>
                    </span>
                    {f.reconciled && (
                      <span className="ml-1 inline-block text-[9.5px] font-bold uppercase tracking-wide text-emerald-700">
                        Reconciled
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-[11.5px] text-text-muted align-top whitespace-nowrap">{f.freshness}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showReconciliation && <HeadcountReconciliationPanel />}
    </div>
  );
}
