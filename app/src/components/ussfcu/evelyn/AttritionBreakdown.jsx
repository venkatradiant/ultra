import { motion } from 'framer-motion';
import { TrendingDown } from 'lucide-react';
import data from '../../../data/ussfcu/evelyn/attrition.json';

// Withdrawn vs denied, the trigger words in the final interactions, and a
// days-to-decision comparison between originated and withdrawn.
const outcomeTone = {
  warn: 'text-amber-600 bg-amber-500/10',
  neutral: 'text-text-muted bg-slate-500/10',
};

export default function AttritionBreakdown() {
  const maxDays = Math.max(...data.days_to_decision.map((d) => d.days));
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="flex items-center gap-2 mb-1">
        <TrendingDown className="w-4 h-4 text-amber-600" />
        <p className="text-xs font-semibold text-text-muted">{data.title}</p>
      </div>
      <p className="text-[10px] text-text-subtle mb-3">{data.subtitle}</p>

      {/* Outcomes */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {data.outcomes.map((o) => (
          <div key={o.id} className="bg-surface rounded-lg border border-border-subtle px-3 py-2.5">
            <span className={`text-[18px] font-bold leading-none ${outcomeTone[o.tone]?.split(' ')[0] || 'text-text'}`}>{o.value}</span>
            <p className="text-[10px] text-text-subtle font-medium mt-1">{o.label}</p>
          </div>
        ))}
      </div>

      {/* Trigger words */}
      <div className="space-y-1.5 mb-3">
        {data.triggers.map((t) => (
          <div key={t.id} className="flex items-center justify-between bg-surface rounded-lg border border-border-subtle px-3 py-2">
            <span className="text-[11px] text-text-muted">{t.label}</span>
            <span className="text-[11px] font-semibold text-text tabular-nums">{t.value} of {t.of}</span>
          </div>
        ))}
      </div>

      {/* Days-to-decision comparison */}
      <div className="bg-surface rounded-lg border border-border-subtle p-3">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-text-subtle mb-2">Avg days to decision</p>
        <div className="space-y-2">
          {data.days_to_decision.map((d) => (
            <div key={d.id} className="flex items-center gap-2">
              <span className="w-[70px] text-[10px] text-text-muted flex-shrink-0">{d.label}</span>
              <div className="flex-1 h-4 rounded bg-surface-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.days / maxDays) * 100}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className={`h-full rounded ${d.id === 'withdrawn' ? 'bg-amber-500' : 'bg-brand'}`}
                />
              </div>
              <span className="w-[52px] text-right text-[10px] font-semibold text-text tabular-nums flex-shrink-0">{d.days} days</span>
            </div>
          ))}
        </div>
        <p className="text-[9.5px] text-amber-600 font-semibold mt-2">Withdrawn group took {data.days_gap} days longer</p>
      </div>

      <p className="text-[9.5px] text-text-subtle mt-2.5 leading-snug">{data.footnote}</p>
    </motion.div>
  );
}
