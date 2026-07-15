import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Globe } from 'lucide-react';

/**
 * Model Routing Provenance Trace — proves which model processed each field.
 * PII rows are visually distinct (red-tinted) so "sensitive stayed in the SLM"
 * reads at a glance. Data: { title, subtitle, verdict, rows[] }.
 */
const sensitivityPill = (s) => {
  if (s === 'PII') return 'bg-red-50 text-red-600 border border-red-200';
  if (s === 'Sensitive-Internal') return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-surface-2 text-text-muted border border-border';
};

export default function ModelRoutingProvenanceTrace({ data }) {
  if (!data?.rows) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-sm font-semibold text-text">{data.title}</h3>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-shrink-0">
          <ShieldCheck className="w-3 h-3" /> 0 PII → LLM
        </span>
      </div>
      <p className="text-xs text-text-subtle mb-4">{data.subtitle}</p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Data Element</th>
              <th className="text-center py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Sensitivity</th>
              <th className="text-center py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Model</th>
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, idx) => {
              const isPii = row.sensitivity === 'PII';
              const isSlm = row.model === 'SLM';
              return (
                <tr
                  key={idx}
                  className={`border-b border-border-subtle transition-colors ${isPii ? 'bg-red-50/40' : 'hover:bg-surface-2/50'}`}
                >
                  <td className="py-3 px-3 text-text font-medium text-[11px] whitespace-nowrap">{row.element}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${sensitivityPill(row.sensitivity)}`}>
                      {row.sensitivity}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isSlm ? 'text-brand' : 'text-violet-600'
                      }`}
                      style={{ background: isSlm ? 'color-mix(in srgb, var(--color-brand) 10%, transparent)' : 'rgba(139,92,246,0.10)' }}
                    >
                      {isSlm ? <Cpu className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
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

      {data.verdict && (
        <div className="mt-3 pt-3 border-t border-border-subtle flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium text-text-muted">{data.verdict}</p>
        </div>
      )}
    </motion.div>
  );
}
