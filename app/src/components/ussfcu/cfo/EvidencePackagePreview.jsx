import { motion } from 'framer-motion';
import { FileCheck, Check } from 'lucide-react';

const BEFORE = 53;
const AFTER = 100;

const contents = [
  { title: 'Governed loan-loss reconciliation', detail: '$14.49M reconciled across core, ledger, and origination' },
  { title: 'CFO-Lending portfolio reconciliation', detail: 'Timing drivers documented, one governed schedule' },
  { title: 'Source-to-report lineage', detail: 'All 47 figures traceable from Tableau back to Jack Henry core' },
];

export default function EvidencePackagePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="flex items-center gap-2 mb-3">
        <FileCheck className="w-4 h-4 text-brand" />
        <p className="text-xs font-semibold text-text-muted">Lineage-Backed Audit Evidence Package</p>
      </div>

      {/* Traceability meter */}
      <div className="bg-surface rounded-lg p-3 border border-border-subtle mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-text-subtle">Traceability coverage</span>
          <span className="text-[12px] font-bold text-emerald-600">{BEFORE}% → {AFTER}%</span>
        </div>
        <div className="h-3 rounded-full bg-surface-2 overflow-hidden relative">
          <motion.div
            initial={{ width: `${BEFORE}%` }}
            animate={{ width: `${AFTER}%` }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-brand to-emerald-500"
          />
        </div>
        <p className="text-[9px] text-text-subtle mt-1">Every reported figure now carries a source-to-report trace · NCUA 5300-ready</p>
      </div>

      {/* Package contents */}
      <div className="space-y-1.5">
        {contents.map((c) => (
          <div key={c.title} className="flex items-start gap-2 bg-surface rounded-lg px-2.5 py-2 border border-border-subtle">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-text leading-tight">{c.title}</p>
              <p className="text-[10px] text-text-muted leading-snug mt-0.5">{c.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
