/**
 * HeadcountReconciliationPanel — three sources resolving to one figure.
 *
 * The moat moment. Gate, permit and contractor timesheets each measure a
 * different thing, so none of them is "wrong" and picking a favourite is not a
 * reconciliation. TrackLynk matches badge-ins to live location, resolves to one
 * defensible number, and *holds* what it cannot match rather than quietly
 * counting or discarding it. The exception list is the proof.
 */
import { motion } from 'framer-motion';
import { ArrowRight, FileCheck2, AlertTriangle } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getReconciliation } from '../../data/aramco/hse-gm';
import IllustrativeDataChip, { ProvenanceLine } from './IllustrativeDataChip';
import MaximizablePanel, { MaximizeButton } from '../common/MaximizablePanel';

const PRIORITY_STYLE = {
  high: 'border-rose-200 bg-rose-50/60 text-rose-800',
  medium: 'border-amber-200 bg-amber-50/60 text-amber-800',
  low: 'border-border-subtle bg-surface-2 text-text-muted',
};

export default function HeadcountReconciliationPanel({ getter = getReconciliation }) {
  const rec = useAsyncData(getter);
  if (!rec) return null;

  return (
    <MaximizablePanel className="p-4 sm:p-5" label="Headcount reconciliation">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text">Headcount Reconciliation — {rec.metric}</h3>
          <ProvenanceLine className="mt-1" source="Gate access-control, Permit-to-work system, Contractor timesheets, Location and tag data (vendor-agnostic)" freshness={rec.freshness} reconciled />
        </div>
        <span className="flex items-center gap-2"><IllustrativeDataChip /><MaximizeButton /></span>
      </div>

      {/* Three sources → one figure */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 min-w-0">
          {rec.sources.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="rounded-xl border border-border-subtle bg-surface-2 p-3 min-w-0"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-subtle truncate">{s.name}</p>
              <p className="text-xl font-bold text-text leading-none mt-1.5">{s.value.toLocaleString()}</p>
              <p className={`text-[10.5px] font-semibold mt-1 ${s.delta > 0 ? 'text-rose-700' : 'text-sky-700'}`}>
                {s.delta > 0 ? '+' : ''}
                {s.delta} vs reconciled
              </p>
              <p className="text-[10px] text-text-subtle mt-1.5 leading-snug">{s.note}</p>
              <p className="text-[9.5px] text-text-subtle mt-1.5">Updated {s.freshness}</p>
            </motion.div>
          ))}
        </div>

        <ArrowRight className="w-5 h-5 text-text-subtle flex-shrink-0 mx-auto lg:mx-1 rotate-90 lg:rotate-0" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.24 }}
          className="rounded-xl border-2 border-brand/40 bg-brand/[0.05] p-3.5 lg:w-[210px] flex-shrink-0"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">{rec.resolvedLabel}</p>
          <p className="text-3xl font-bold text-text leading-none mt-1.5">{rec.resolved.toLocaleString()}</p>
          <p className="text-[10.5px] text-text-muted mt-1.5 leading-snug">{rec.method}</p>
        </motion.div>
      </div>

      {/* Exceptions — held, not assumed */}
      <div className="rounded-xl border border-border-subtle bg-surface-2 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-subtle">
            <AlertTriangle className="w-3.5 h-3.5" />
            {rec.exceptions.total} held as exceptions
          </p>
          {rec.auditLogged && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
              <FileCheck2 className="w-3.5 h-3.5" /> Logged for audit
            </span>
          )}
        </div>

        <div className="space-y-2">
          {rec.exceptions.groups.map((g) => (
            <div key={g.id} className={`rounded-lg border p-2.5 ${PRIORITY_STYLE[g.priority]}`}>
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="text-base font-bold leading-none flex-shrink-0 w-8">{g.count}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-text leading-snug">{g.label}</p>
                  <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">
                    Likely cause: {g.likelyCause}
                  </p>
                  <p className="text-[10.5px] text-text-subtle mt-0.5">
                    {g.gate} · last known: {g.lastKnown}
                  </p>
                  {g.note && <p className="text-[10.5px] font-medium mt-1">{g.note}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {rec.auditNote && <p className="text-[10.5px] text-text-subtle italic mt-2.5">{rec.auditNote}</p>}
      </div>
    </MaximizablePanel>
  );
}
