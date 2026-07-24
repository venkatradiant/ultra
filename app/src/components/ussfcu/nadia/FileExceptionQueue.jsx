import { motion } from 'framer-motion';
import { AlertTriangle, FileWarning, MessageSquareWarning } from 'lucide-react';
import FileTimeline from './FileTimeline';
import fileExceptions from '../../../data/ussfcu/nadia/fileExceptions.json';

// Compliance Query nav page (file altitude): today's file-level exception queue,
// each with the member file number, the rule at issue, and a severity flag, plus
// the assembled timeline for the file to open first.
const severityStyles = {
  critical: { border: 'border-red-200', bg: 'bg-red-50', icon: AlertTriangle, iconColor: 'text-red-500', chip: 'bg-red-100 text-red-600' },
  warning: { border: 'border-amber-200', bg: 'bg-amber-50', icon: FileWarning, iconColor: 'text-amber-500', chip: 'bg-amber-100 text-amber-600' },
};

const kindIcon = {
  'call-4471': MessageSquareWarning,
};

export default function FileExceptionQueue() {
  return (
    <div className="max-w-4xl">
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Compliance Query — File Exceptions</h2>
      <p className="text-[12px] text-text-muted mb-4 max-w-2xl">
        {fileExceptions.subtitle}. Each file arrives with its timeline already assembled from MeridianLink and the contact
        center, so your time goes to judgment rather than pulling and cross-referencing records.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Exception list */}
        <div className="space-y-3">
          {fileExceptions.exceptions.map((ex, idx) => {
            const style = severityStyles[ex.severity] || severityStyles.warning;
            const Icon = kindIcon[ex.id] || style.icon;
            return (
              <motion.div
                key={ex.id}
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
                      <h4 className="text-sm font-semibold text-text">{ex.file}</h4>
                      <span className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${style.chip}`}>
                        {ex.severity}
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-text-subtle mb-1">{ex.rule}</p>
                    <p className="text-xs leading-relaxed text-text-muted">{ex.detail}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Timeline for the file to open first */}
        <FileTimeline />
      </div>
    </div>
  );
}
