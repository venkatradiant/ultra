import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import signals from '../../../data/ussfcu/cfo/signals.json';
import SourceBadge from '../../chat/SourceBadge';
import { tierFor, colorFor } from '../../../utils/confidence';

const severityStyles = {
  critical: { border: 'border-red-200', bg: 'bg-red-50', icon: AlertTriangle, iconColor: 'text-red-500', chip: 'bg-red-100 text-red-600' },
  warning: { border: 'border-amber-200', bg: 'bg-amber-50', icon: TrendingDown, iconColor: 'text-amber-500', chip: 'bg-amber-100 text-amber-600' },
};

export default function GovernanceSignalsTable() {
  return (
    <div className="space-y-3">
      {signals.map((signal, idx) => {
        const style = severityStyles[signal.severity] || severityStyles.warning;
        const Icon = style.icon;
        return (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className={`rounded-xl border ${style.border} ${style.bg} p-4`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${style.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-text">{signal.title}</h4>
                  <span className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${style.chip}`}>
                    {signal.severity}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-text-muted mb-2">{signal.description}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {signal.sources.map((s, i) => <SourceBadge key={i} source={s} />)}
                  {signal.confidence && (
                    <span
                      className="ml-auto text-[10px] font-semibold tabular-nums"
                      style={{ color: colorFor(tierFor(signal.confidence.score)) }}
                    >
                      Confidence {signal.confidence.score}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
