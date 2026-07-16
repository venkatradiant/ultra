import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';

/**
 * Policy Card — renders a governing rule from the KAG (e.g. DG-04) as a readable
 * card beside the node view. Data shape: { id, title, body }.
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
        <span className="text-[11px] font-mono font-bold text-amber-700">{policy.id}</span>
        <span className="text-xs font-semibold text-text truncate">{policy.title}</span>
        <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex-shrink-0">
          Governing policy
        </span>
      </div>
      <p className="text-[11px] text-text-muted leading-relaxed">{policy.body}</p>
      <p className="text-[10px] text-text-subtle mt-2 pt-2 border-t border-amber-200/70">
        Classification by meaning, not keyword matching — the graph, not the field name, decided this.
      </p>
    </motion.div>
  );
}
