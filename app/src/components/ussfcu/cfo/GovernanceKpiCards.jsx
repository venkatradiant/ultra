import { motion } from 'framer-motion';
import { ClipboardList, GitCompareArrows, FileWarning, ShieldCheck } from 'lucide-react';

const kpis = [
  { id: 'audit', label: 'Audit Items Open', value: '38 of 64', sub: 'Audit / GRC System', icon: ClipboardList, tone: 'amber' },
  { id: 'breaks', label: 'Reconciliation Breaks (Unresolved)', value: '19', sub: 'GL + Thought Machine Ledger', icon: GitCompareArrows, tone: 'red' },
  { id: 'parity', label: 'CFO-to-Lending Data Parity', value: '82%', sub: 'GL + Lending Origination', icon: GitCompareArrows, tone: 'amber' },
  { id: 'lineage', label: 'Figures Lacking Lineage (Tableau)', value: '47', sub: 'Tableau + Radiant Lineage Map', icon: FileWarning, tone: 'red' },
];

const toneStyles = {
  red: 'text-red-600 bg-red-500/10',
  amber: 'text-amber-600 bg-amber-500/10',
};

export default function GovernanceKpiCards() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((k, idx) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className="bg-surface rounded-xl border border-border-subtle p-3.5"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${toneStyles[k.tone]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-[17px] font-bold text-text leading-none">{k.value}</p>
              <p className="text-[11px] text-text-muted font-medium mt-1 leading-tight">{k.label}</p>
              <p className="text-[9px] text-text-subtle mt-1">{k.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Traceability readiness */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.2 }}
        className="bg-surface rounded-xl border border-border-subtle p-4"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-brand" />
          <p className="text-xs font-semibold text-text-muted">Audit-Evidence Readiness</p>
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-wide font-semibold text-text-subtle">Traceability coverage</span>
          <span className="text-[12px] font-bold text-text">53%</span>
        </div>
        <div className="h-3 rounded-full bg-surface-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '53%' }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="h-full rounded-full bg-brand"
          />
        </div>
        <p className="text-[10px] text-text-subtle mt-2 leading-snug">
          Governed lineage closes the remaining 47% — moving every board and regulatory figure to a source-to-report trace ahead of the next NCUA 5300 filing.
        </p>
      </motion.div>
    </div>
  );
}
