import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import SourceBadge from '../../chat/SourceBadge';

// Shared across Evelyn (population altitude) and Nadia (file altitude): each
// regulatory characteristic becomes a test row with a pass/flag/watch status and
// its citation. Driven entirely by the `data` prop so both personas reuse it.
const statusStyles = {
  flag_critical: { border: 'border-red-200', bg: 'bg-red-50', icon: AlertTriangle, iconColor: 'text-red-500', chip: 'bg-red-100 text-red-600', label: 'Flag' },
  flag_warning: { border: 'border-amber-200', bg: 'bg-amber-50', icon: AlertTriangle, iconColor: 'text-amber-500', chip: 'bg-amber-100 text-amber-600', label: 'Flag' },
  watch: { border: 'border-slate-200', bg: 'bg-slate-50', icon: Eye, iconColor: 'text-slate-500', chip: 'bg-slate-100 text-slate-600', label: 'Watch' },
  pass: { border: 'border-emerald-200', bg: 'bg-emerald-50', icon: CheckCircle2, iconColor: 'text-emerald-500', chip: 'bg-emerald-100 text-emerald-600', label: 'Pass' },
};

function styleFor(test) {
  if (test.status === 'pass') return statusStyles.pass;
  if (test.status === 'watch') return statusStyles.watch;
  return test.severity === 'critical' ? statusStyles.flag_critical : statusStyles.flag_warning;
}

export default function RegulatoryTestPanel({ data }) {
  if (!data) return null;
  const { title, subtitle, tests = [] } = data;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="mb-3">
        <p className="text-xs font-semibold text-text-muted">{title}</p>
        {subtitle && <p className="text-[10px] text-text-subtle mt-0.5">{subtitle}</p>}
      </div>

      <div className="space-y-2">
        {tests.map((t, idx) => {
          const style = styleFor(t);
          const Icon = style.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.06 }}
              className={`rounded-lg border ${style.border} ${style.bg} p-3`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 ${style.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className="text-[12px] font-semibold text-text truncate">{t.name}</h4>
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-text-subtle">{t.regulation}</span>
                    </div>
                    <span className={`flex-shrink-0 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${style.chip}`}>
                      {style.label}
                      {t.count && <span className="font-semibold normal-case tabular-nums opacity-80">· {t.count}</span>}
                    </span>
                  </div>
                  <p className="text-[11px] leading-snug text-text-muted mb-1.5">{t.result}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(t.sources || []).map((s, i) => <SourceBadge key={i} source={s} />)}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
