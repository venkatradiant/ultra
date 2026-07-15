import { motion } from 'framer-motion';
import { CheckCircle2, User, Bot, Sparkles } from 'lucide-react';

// Step 6 (Automated Action): three completed steps + an AI-vs-human action log
// so quality and compliance can see exactly who did what.
const STEPS = [
  { title: 'Direct deposit routing added', detail: "Elena's checking account" },
  { title: '$3,140.00 early salary credit scheduled', detail: 'Applies within one business day' },
  { title: '$412.00 auto loan payment queued', detail: 'Retries automatically once funds post' },
];

const LOG = [
  { actor: 'human', by: 'David Torres', action: 'Identity verification (BSA/AML)' },
  { actor: 'assist', by: 'Agent + AI assist', action: 'Direct deposit routing change' },
  { actor: 'ai', by: 'Agent-Assist', action: 'Payment retry automated' },
];

const actorMeta = {
  human: { icon: User, label: 'Agent', color: 'text-brand', bg: 'bg-brand/10' },
  assist: { icon: Sparkles, label: 'Agent + AI', color: 'text-violet-700', bg: 'bg-violet-100' },
  ai: { icon: Bot, label: 'AI', color: 'text-cyan-700', bg: 'bg-cyan-100' },
};

export default function AgentActionLog() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-gradient-to-b from-[#F8F9FB] to-white p-4"
    >
      <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted mb-3">
        Executed — with a full audit trail
      </h4>

      <ul className="space-y-2 mb-3">
        {STEPS.map((s, i) => (
          <li key={i} className="flex items-start gap-2.5 rounded-lg bg-surface border border-border-subtle p-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-text leading-snug">{s.title}</p>
              <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">{s.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-3 py-1.5 bg-surface-2 border-b border-border-subtle">
          <p className="text-[9.5px] font-bold uppercase tracking-wide text-text-muted">AI vs. Human — who did what</p>
        </div>
        <ul className="divide-y divide-border-subtle">
          {LOG.map((l, i) => {
            const m = actorMeta[l.actor];
            const Icon = m.icon;
            return (
              <li key={i} className="flex items-center gap-2.5 px-3 py-2">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${m.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                </span>
                <p className="text-[11.5px] text-text-muted flex-1 min-w-0 truncate">{l.action}</p>
                <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${m.bg} ${m.color}`}>
                  {m.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );
}
