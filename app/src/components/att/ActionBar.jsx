/**
 * ActionBar — the four things an operator can do with a pattern.
 *
 * Apply Fix to All is the only destructive one, so it is the only one that
 * asks twice, and the confirm step restates the exact count and dollar figure
 * rather than saying "are you sure?". "Are you sure?" is a speed bump; "87
 * accounts, $850.14" is a last chance to notice the number is wrong.
 *
 * Escalate and Defer are deliberately given equal weight to Apply. An operator
 * who can only proceed will proceed — the demo's claim is that she has real
 * choices, and a UI that visually favours one of them contradicts that.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, ArrowUpRight, Clock, Zap, X } from 'lucide-react';

function money(n) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ActionBar({
  pattern,
  selectedCount,
  selectedTotal,
  isPartial = false,
  onApply = null,
}) {
  const [pending, setPending] = useState(null);
  const [done, setDone] = useState(null);

  if (!pattern) return null;

  const actions = [
    {
      id: 'apply_all',
      label: isPartial ? 'Apply to Selected' : 'Apply Fix to All',
      sub: `${selectedCount} account${selectedCount === 1 ? '' : 's'} · ${money(selectedTotal)}`,
      icon: Zap,
      primary: true,
      confirm: `This writes ${selectedCount} correction${selectedCount === 1 ? '' : 's'} totalling ${money(selectedTotal)} through the rebilling API. Each one gets a rebill ID and an audit row. It reaches customer bills.`,
      resultTitle: 'Corrections executed',
      resultBody: `${selectedCount} accounts corrected for ${money(selectedTotal)}. Zero failures. Every row written to Resolution History with its rebill ID.`,
    },
    {
      id: 'escalate',
      label: 'Escalate',
      sub: 'SME review',
      icon: ArrowUpRight,
      confirm: `Routes this pattern to SME review with the root-cause evidence and per-account confidence attached. It will not resolve inside this cycle's window.`,
      resultTitle: 'Escalated to SME',
      resultBody: 'Logged as Escalated with the evidence attached. Nothing was written to a customer bill.',
    },
    {
      id: 'defer',
      label: 'Defer',
      sub: 'Next cycle',
      icon: Clock,
      confirm: 'Carries this pattern into the next cycle. The dollars stay at risk and the projected support calls still arrive — deferring delays the correction, not the consequence.',
      resultTitle: 'Deferred to next cycle',
      resultBody: 'Logged as Deferred. The pattern remains open and counts against next cycle at the same dollar figure.',
    },
    {
      id: 'false_positive',
      label: 'Mark False Positive',
      sub: 'Close without action',
      icon: X,
      confirm: 'Closes the pattern as a detection error. This is training data: the model learns from it, so the same charge shape is less likely to be flagged next cycle.',
      resultTitle: 'Marked false positive',
      resultBody: 'Closed with no rebill. Captured as a labeled correction for the next retraining pass.',
    },
  ];

  const act = (a) => {
    setPending(null);
    setDone(a);
    if (a.id === 'apply_all' && onApply) onApply({ count: selectedCount, total: selectedTotal });
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">
          Reviewed Action
        </span>
        <span className="text-[10.5px] text-text-subtle">
          Every option below writes an audit row — including the ones that change nothing.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => { setDone(null); setPending(a); }}
              className={`group flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left transition-all duration-200 cursor-pointer min-w-0 ${
                a.primary
                  ? 'border-brand bg-brand text-white hover:brightness-110'
                  : 'border-border bg-surface-2/40 text-text hover:border-brand/35 hover:bg-surface-2'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${a.primary ? 'text-white' : 'text-text-muted'}`} />
              <span className="min-w-0">
                <span className="block text-[12.5px] font-semibold leading-tight truncate">{a.label}</span>
                <span className={`block text-[10.5px] leading-tight mt-0.5 truncate ${a.primary ? 'text-white/75' : 'text-text-subtle'}`}>
                  {a.sub}
                </span>
              </span>
              <ChevronRight className={`w-3.5 h-3.5 ml-auto flex-shrink-0 ${a.primary ? 'text-white/60' : 'text-text-subtle'}`} />
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {pending && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-amber-300 bg-amber-500/[0.07] p-3.5">
              <p className="text-[12px] text-text leading-relaxed">
                <span className="font-bold">{pending.label} — confirm.</span> {pending.confirm}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => act(pending)}
                  className="rounded-lg bg-brand px-3.5 py-2 text-[11.5px] font-semibold text-white hover:brightness-110 transition-all cursor-pointer"
                >
                  Confirm {pending.label}
                </button>
                <button
                  type="button"
                  onClick={() => setPending(null)}
                  className="rounded-lg border border-border bg-surface px-3.5 py-2 text-[11.5px] font-semibold text-text-muted hover:text-text transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {done && (
          <motion.div
            key="done"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-500/[0.07] p-3.5">
              <p className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4" /> {done.resultTitle}
              </p>
              <p className="text-[11.5px] text-text-muted mt-1.5 leading-relaxed">{done.resultBody}</p>
              <p className="text-[10px] text-text-subtle mt-2">
                Illustrative — no request left this demo.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
