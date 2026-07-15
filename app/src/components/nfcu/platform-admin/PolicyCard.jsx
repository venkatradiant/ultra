import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';

/**
 * Policy Card — renders a governance rule node (e.g. DG-07) as a readable card.
 * Used inline in the KAG node view and on the Governance module page.
 * Data: { id, name, classification, text, owner, effective, sourceSystem }.
 */
export default function PolicyCard({ policy }) {
  if (!policy) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="rounded-xl border border-amber-200 bg-amber-50/50 p-4"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/15 text-amber-700 flex-shrink-0">
          <Scale className="w-3.5 h-3.5" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-amber-700">{policy.id}</span>
            <span className="text-xs font-semibold text-text truncate">{policy.name}</span>
          </div>
        </div>
        {policy.classification && (
          <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex-shrink-0">
            {policy.classification}
          </span>
        )}
      </div>
      <p className="text-[11px] text-text-muted leading-relaxed">{policy.text}</p>
      {(policy.owner || policy.effective || policy.sourceSystem) && (
        <div className="mt-2.5 pt-2.5 border-t border-amber-200/70 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-text-subtle">
          {policy.owner && <span>Owner: <span className="font-medium text-text-muted">{policy.owner}</span></span>}
          {policy.sourceSystem && <span>Source: <span className="font-medium text-text-muted">{policy.sourceSystem}</span></span>}
          {policy.effective && <span>Effective: <span className="font-medium text-text-muted">{policy.effective}</span></span>}
        </div>
      )}
    </motion.div>
  );
}
