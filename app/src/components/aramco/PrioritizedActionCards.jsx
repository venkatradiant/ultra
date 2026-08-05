/**
 * PrioritizedActionCards — the two or three things to do before the next shift.
 *
 * The outcome the whole demo builds to. Each action carries its rationale, its
 * risk bucket, the evidence that justifies it, and a draft task preview — so
 * handing it to a shift supervisor hands them the proof, not just the
 * instruction. Nothing is escalated without the evidence attached.
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Send, ChevronDown, Clock, User, Paperclip } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getActions } from '../../data/aramco/hse-gm';
import RiskBucketBadge from './RiskBucketBadge';
import IllustrativeDataChip, { ProvenanceLine } from './IllustrativeDataChip';

const PRIORITY_ACCENT = {
  highest: 'border-l-rose-700',
  high: 'border-l-amber-600',
  medium: 'border-l-violet-600',
};

export default function PrioritizedActionCards({ getter = getActions }) {
  const data = useAsyncData(getter);
  const [handedOff, setHandedOff] = useState(() => new Set());
  const [openId, setOpenId] = useState(null);

  if (!data) return null;

  const handOff = (id) => setHandedOff((prev) => new Set([...prev, id]));
  const allHandedOff = data.actions.every((a) => handedOff.has(a.id));

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text">Prioritized Actions — {data.horizon}</h3>
          <ProvenanceLine
            className="mt-1"
            source="Permit-to-work system, Location and tag data (vendor-agnostic), HSE action tracker"
            freshness={data.freshness}
          />
        </div>
        <IllustrativeDataChip />
      </div>

      <div className="space-y-2.5">
        {data.actions.map((action, i) => {
          const isHandedOff = handedOff.has(action.id);
          const isOpen = openId === action.id;
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className={`rounded-xl border border-border-subtle border-l-[3px] bg-surface-2 overflow-hidden ${
                PRIORITY_ACCENT[action.priority] || 'border-l-border'
              }`}
            >
              <div className="p-3.5">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-text/[0.06] text-text text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    {action.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-text">{action.title}</span>
                      <RiskBucketBadge bucket={action.bucket} size="sm" />
                    </div>
                    <p className="text-[11.5px] text-text-muted leading-relaxed">{action.rationale}</p>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[10.5px] text-text-subtle">
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3 h-3" /> {action.owner}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {action.dueBy}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Paperclip className="w-3 h-3" /> {action.evidence.length} pieces of evidence
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 pl-9">
                  {isHandedOff ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
                      <Check className="w-3.5 h-3.5" /> Handed to {action.owner}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handOff(action.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-brand-hover transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Hand to supervisor
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : action.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-semibold text-text-muted hover:bg-surface hover:text-text transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    Draft task and evidence
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-3.5 pb-3.5 pt-0.5 border-t border-border-subtle">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mt-3 mb-1.5">
                        Draft task — {action.system}
                      </p>
                      <p className="rounded-lg border border-border-subtle bg-surface p-2.5 text-[11.5px] text-text leading-relaxed">
                        {action.draftTask}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mt-3 mb-1.5">
                        Evidence attached
                      </p>
                      <ul className="space-y-1">
                        {action.evidence.map((e, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11px] text-text-muted">
                            <Paperclip className="w-3 h-3 flex-shrink-0 mt-0.5 text-text-subtle" />
                            {e}
                          </li>
                        ))}
                      </ul>
                      <ProvenanceLine className="mt-2" source={action.sources.join(', ')} freshness={data.freshness} note={action.ownerNote} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {allHandedOff && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] font-medium text-emerald-800"
        >
          All three actions are with their supervisors, evidence attached. Anything unacknowledged within fifteen minutes
          escalates back to you.
        </motion.p>
      )}
    </div>
  );
}
