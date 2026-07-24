import { motion } from 'framer-motion';
import { ClipboardCheck, X, Check } from 'lucide-react';
import data from '../../../data/ussfcu/nadia/procedureAdherence.json';

// Required steps versus what happened on this file, with deviations marked, plus
// a small pattern chart of late disclosures by intake channel.
export default function ProcedureAdherenceView() {
  const { title, steps, pattern } = data;
  const maxRate = Math.max(...pattern.by_channel.map((c) => c.late_rate_pct));
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="flex items-center gap-2 mb-3">
        <ClipboardCheck className="w-4 h-4 text-brand" />
        <p className="text-xs font-semibold text-text-muted">{title}</p>
      </div>

      {/* Required vs actual */}
      <div className="space-y-1.5 mb-3">
        {steps.map((s, idx) => {
          const deviated = s.status === 'deviation';
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 ${deviated ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${deviated ? 'bg-red-500' : 'bg-emerald-600'}`}>
                {deviated ? <X className="w-2.5 h-2.5 text-white" /> : <Check className="w-2.5 h-2.5 text-white" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-text leading-tight">{s.required}</p>
                <p className={`text-[10px] leading-snug mt-0.5 ${deviated ? 'text-red-600' : 'text-emerald-700'}`}>{s.actual}</p>
              </div>
              <span className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${deviated ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                {deviated ? 'Deviation' : 'Met'}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Pattern chart */}
      <div className="bg-surface rounded-lg border border-border-subtle p-3">
        <p className="text-[10px] font-semibold text-text-muted mb-0.5">{pattern.title}</p>
        <p className="text-[9.5px] text-text-subtle mb-2 leading-snug">{pattern.detail}</p>
        <div className="space-y-1.5">
          {pattern.by_channel.map((c) => (
            <div key={c.channel} className="flex items-center gap-2">
              <span className="w-[120px] text-[10px] text-text-muted flex-shrink-0 truncate">{c.channel}</span>
              <div className="flex-1 h-4 rounded bg-surface-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.late_rate_pct / maxRate) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded ${c.late_rate_pct >= 10 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                />
              </div>
              <span className="w-[36px] text-right text-[10px] font-semibold text-text tabular-nums flex-shrink-0">{c.late_rate_pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
