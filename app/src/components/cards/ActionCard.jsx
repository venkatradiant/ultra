import { motion } from 'framer-motion';
import { Ticket, Calendar, FileText, Check, Pencil } from 'lucide-react';
import { tierFor, colorFor, bgFor, borderFor } from '../../utils/confidence';

const iconMap = {
  'JIRA': Ticket,
  'Calendar / Salesforce': Calendar,
  'Report Engine': FileText,
};

export default function ActionCard({ action, onConfirm, onEdit, isConfirmed }) {
  const Icon = iconMap[action.system] || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border p-4 transition-all ${
        isConfirmed
          ? 'border-green-200 bg-green-50'
          : 'border-border bg-surface hover:border-border hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isConfirmed ? 'bg-green-100' : 'bg-brand/10'
        }`}>
          {isConfirmed ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Icon className="w-4 h-4 text-brand" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="text-sm font-semibold text-text">{action.title}</h4>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-muted font-medium">{action.system}</span>
            {action.confidence && (() => {
              const tier = tierFor(action.confidence.score);
              return (
                <span
                  className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded"
                  style={{ color: colorFor(tier), background: bgFor(tier), border: `1px solid ${borderFor(tier)}` }}
                >
                  Confidence {action.confidence.score}%
                </span>
              );
            })()}
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-3">{action.description}</p>
          {!isConfirmed && (
            <div className="flex gap-2">
              <button
                onClick={() => onConfirm(action.id)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand hover:bg-brand/90 transition-colors cursor-pointer"
              >
                Confirm
              </button>
              <button
                onClick={() => onEdit?.(action.id)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-text-muted bg-surface-2 hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Pencil className="w-3 h-3" />
                Edit First
              </button>
            </div>
          )}
          {isConfirmed && (
            <p className="text-xs font-medium text-green-600">Confirmed</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
