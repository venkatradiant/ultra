/**
 * RootCauseCallout — the sentence that makes a bulk fix feel safe.
 *
 * The confidence score is not what convinces an operator; a named cause is.
 * "94%" tells her the system is fairly sure. "A CGCM sync failure during the
 * Feb 12 maintenance window" tells her *why every one of these 87 accounts is
 * wrong in the same way* — which is the actual precondition for correcting them
 * in one action.
 *
 * So the cause leads and the score sits beside it as support, not the reverse.
 */
import { motion } from 'framer-motion';
import { GitBranch, Calendar, Tag } from 'lucide-react';
import ConfidencePill from './ConfidencePill';
import IllustrativeChip from './IllustrativeChip';

export default function RootCauseCallout({ pattern }) {
  if (!pattern) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-subtle">
          <GitBranch className="w-3.5 h-3.5 text-brand" /> Root Cause
        </span>
        <div className="flex items-center gap-2">
          <ConfidencePill value={pattern.averageConfidence} showTier />
          <IllustrativeChip />
        </div>
      </div>

      <p className="text-[15px] font-semibold text-text leading-snug">{pattern.rootCause}</p>
      <p className="text-[12.5px] text-text-muted mt-2 leading-relaxed">{pattern.description}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3.5 pt-3.5 border-t border-border-subtle">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-text-muted">
          <Tag className="w-3 h-3 text-text-subtle" />
          <span className="font-medium text-text-subtle">Category:</span> {pattern.rootCauseTag}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-text-muted">
          <Calendar className="w-3 h-3 text-text-subtle" />
          <span className="font-medium text-text-subtle">Detected:</span> {pattern.detectedDate}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-text-muted">
          <span className="font-medium text-text-subtle">Charge type:</span> {pattern.chargeType}
        </span>
      </div>

      <p className="text-[10px] text-text-subtle mt-2.5 leading-snug">
        <span className="font-medium text-text-muted">Sources:</span> {pattern.dataSource}
      </p>
    </motion.div>
  );
}
