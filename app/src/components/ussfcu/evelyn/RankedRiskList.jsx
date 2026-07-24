import { motion } from 'framer-motion';
import { ListOrdered, FileWarning, GitBranch } from 'lucide-react';
import data from '../../../data/ussfcu/evelyn/rankedRisk.json';

// Files and patterns ordered by exam exposure, with the regulatory basis and the
// recommended action per item.
const severityStyles = {
  critical: { border: 'border-red-200', bg: 'bg-red-50', rank: 'bg-red-500', chip: 'bg-red-100 text-red-600' },
  warning: { border: 'border-amber-200', bg: 'bg-amber-50', rank: 'bg-amber-500', chip: 'bg-amber-100 text-amber-600' },
};

export default function RankedRiskList() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="flex items-center gap-2 mb-3">
        <ListOrdered className="w-4 h-4 text-brand" />
        <div>
          <p className="text-xs font-semibold text-text-muted">{data.title}</p>
          <p className="text-[10px] text-text-subtle">{data.subtitle}</p>
        </div>
      </div>

      <div className="space-y-2">
        {data.items.map((item, idx) => {
          const style = severityStyles[item.severity] || severityStyles.warning;
          const KindIcon = item.kind === 'pattern' ? GitBranch : FileWarning;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.07 }}
              className={`flex items-start gap-3 rounded-lg border ${style.border} ${style.bg} p-3`}
            >
              <span className={`w-6 h-6 rounded-full ${style.rank} text-white flex items-center justify-center flex-shrink-0 text-[11px] font-bold`}>
                {item.rank}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h4 className="text-[12px] font-semibold text-text truncate">{item.label}</h4>
                  <span className={`flex-shrink-0 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${style.chip}`}>
                    <KindIcon className="w-2.5 h-2.5" />
                    {item.kind}
                  </span>
                </div>
                <p className="text-[10.5px] text-text-muted leading-snug">{item.basis}</p>
                <p className="text-[10px] text-text-subtle leading-snug mt-1">
                  <span className="font-semibold text-text-muted">Action:</span> {item.action}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[9.5px] text-text-subtle mt-2.5 leading-snug">{data.summary}</p>
    </motion.div>
  );
}
