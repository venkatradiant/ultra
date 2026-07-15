import { motion } from 'framer-motion';
import { GitBranch, ArrowRight } from 'lucide-react';

export default function ModelAdjustCard({
  title = 'Model Adjusted — Feature Reweighting Applied',
  description = 'Override captured. Future recommendations updated.',
  weights = [],
  modelVersion,
  trigger,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
          <GitBranch className="w-4 h-4 text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="text-sm font-semibold text-text">{title}</h4>
            {modelVersion && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand/[0.08] text-brand">
                {modelVersion}
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-3">{description}</p>

          {trigger && (
            <p className="text-[11px] text-text-muted mb-2.5">
              <span className="font-semibold text-text-muted">Trigger:</span> {trigger}
            </p>
          )}

          {weights.length > 0 && (
            <ul className="space-y-1.5">
              {weights.map((w, i) => {
                const direction = w.to > w.from ? 'up' : 'down';
                const dirColor = direction === 'up' ? 'text-green-700' : 'text-red-700';
                const dirBg = direction === 'up' ? 'bg-green-50' : 'bg-red-50';
                const delta = (w.to - w.from).toFixed(2);
                return (
                  <li key={i} className="flex items-center gap-2 text-[11px]">
                    <span className="font-mono text-text-muted flex-1 truncate">{w.feature}</span>
                    <span className="text-text-subtle tabular-nums">{w.from.toFixed(2)}</span>
                    <ArrowRight className="w-3 h-3 text-text-subtle" />
                    <span className="font-semibold text-text tabular-nums">{w.to.toFixed(2)}</span>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${dirColor} ${dirBg}`}>
                      {delta > 0 ? '+' : ''}{delta}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}
