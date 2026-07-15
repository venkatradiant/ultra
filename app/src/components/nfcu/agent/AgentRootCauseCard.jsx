import { motion } from 'framer-motion';
import { Landmark, Receipt, Building2, BookText, GitMerge } from 'lucide-react';

// Step 2 (Converged Conversation): one consolidated root-cause answer that
// visibly draws from four source systems — the talk-to-data moment.
const SOURCES = [
  { icon: Landmark, label: 'Core Banking', note: 'Balance $208.14 at draw' },
  { icon: Receipt, label: 'Payments Log', note: '$412.00 declined (NSF)' },
  { icon: Building2, label: 'Employer File', note: '$3,140.00 early credit sent' },
  { icon: BookText, label: 'Deposit SOP', note: 'Routing required to post' },
];

export default function AgentRootCauseCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-brand/20 bg-gradient-to-br from-brand/[0.04] to-white p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
          <GitMerge className="w-4 h-4 text-brand" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-text leading-tight">Root Cause — correlated in real time</h4>
          <p className="text-[10.5px] text-text-muted">Four systems, one answer</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {SOURCES.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-surface px-2.5 py-2">
              <Icon className="w-3.5 h-3.5 text-brand flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10.5px] font-semibold text-text-muted leading-tight truncate">{s.label}</p>
                <p className="text-[9.5px] text-text-muted leading-snug">{s.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg bg-brand/[0.05] border border-brand/10 px-3 py-2.5">
        <p className="text-[11.5px] text-text-muted leading-relaxed">
          An early salary credit is unapplied because the checking account has an
          <span className="font-semibold text-brand"> early-credit flag with no matching direct deposit routing</span>.
          The fix: add the routing, apply the credit, retry the payment inside the grace window.
        </p>
      </div>
    </motion.div>
  );
}
