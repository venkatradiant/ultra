import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Sparkles } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getFieldLedger } from '@/data/nfcu/platform-admin/governanceData';

/**
 * Turn 2 — Field Sovereignty Ledger.
 *
 * The point on screen: EVERY field row reads SLM (fields never route to the
 * frontier), and the frontier appears exactly once — in the task strip below,
 * on non-PII inputs only. Badge: 0 PII to frontier.
 */
const sensitivityPill = (s) => {
  if (s === 'PII') return 'bg-red-50 text-red-600 border border-red-200';
  if (s === 'Sensitive-Internal') return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-surface-2 text-text-muted border border-border';
};

export default function FieldSovereigntyLedger() {
  const data = useAsyncData(getFieldLedger);
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-sm font-semibold text-text">Field Sovereignty Ledger</h3>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-shrink-0">
          <ShieldCheck className="w-3 h-3" /> {data.badge}
        </span>
      </div>
      <p className="text-xs text-text-subtle mb-4">
        Priya&apos;s auto loan spike response · every field resolved in-environment
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Field</th>
              <th className="text-center py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Sensitivity</th>
              <th className="text-center py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Model</th>
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.fields.map((row, idx) => {
              const isPii = row.sensitivity === 'PII';
              const isInternal = row.sensitivity === 'Sensitive-Internal';
              return (
                <tr
                  key={idx}
                  className={`border-b border-border-subtle transition-colors ${
                    isPii ? 'bg-red-50/40' : isInternal ? 'bg-amber-50/30' : 'hover:bg-surface-2/50'
                  }`}
                >
                  <td className="py-3 px-3 text-text font-medium text-[11px] whitespace-nowrap">{row.field}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${sensitivityPill(row.sensitivity)}`}>
                      {row.sensitivity}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-brand"
                      style={{ background: 'color-mix(in srgb, var(--color-brand) 10%, transparent)' }}
                    >
                      <Cpu className="w-3 h-3" />
                      {row.model}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-text-muted text-[11px]">{row.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* The frontier never processes a field. It runs one task, on non-PII inputs. */}
      <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/40 p-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          </span>
          <span className="text-[11px] font-bold text-violet-700 uppercase tracking-wide">Frontier task · 1</span>
          <span className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {data.frontierTask.pii} PII
          </span>
        </div>
        <div className="text-[12px] font-semibold text-text">{data.frontierTask.task}</div>
        <div className="text-[10.5px] text-text-muted mt-0.5">
          {data.frontierTask.model} · {data.frontierTask.inputs}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border-subtle flex items-start gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] font-medium text-text-muted">
          Fields never route to the frontier model — tasks do. Every field above stayed in the in-environment SLM;
          the single frontier task ran on non-PII signals only.
        </p>
      </div>
    </motion.div>
  );
}
