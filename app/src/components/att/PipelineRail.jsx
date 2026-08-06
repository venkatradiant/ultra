/**
 * PipelineRail — AI Conversation → Data Ingest → … → BRN (spec §15).
 *
 * The percentages are what make this more than a diagram. Rule Layer catches
 * 40%, ML Layer 30%, LLM Edge Review 12% — so roughly 18% of the cycle never
 * gets resolved by a layer at all and lands on the operator as edge cases.
 * That is the honest shape of the system, and showing it beats implying the
 * pipeline is a funnel that empties.
 *
 * Human Review is the active stage on purpose: everything upstream of it is
 * investigation, and nothing downstream of it happens without a decision.
 */
import { motion } from 'framer-motion';
import { Check, Circle, Loader2 } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getPipeline } from '../../data/att/billing-operator';
import IllustrativeChip from './IllustrativeChip';

const STATE = {
  complete: { ring: 'border-emerald-300 bg-emerald-500/10', dot: 'text-emerald-600', Icon: Check },
  active: { ring: 'border-brand bg-brand/10', dot: 'text-brand', Icon: Loader2 },
  pending: { ring: 'border-border bg-surface-2', dot: 'text-text-subtle', Icon: Circle },
};

export default function PipelineRail({ getter = getPipeline, compact = false }) {
  const stages = useAsyncData(getter);
  if (!stages) return null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold text-text tracking-tight">Detection Pipeline</h3>
          {!compact && (
            <p className="text-[11px] text-text-subtle mt-0.5">
              Entered via the AI Conversation; every stage before Human Review is investigation, every stage
              after it is consequence.
            </p>
          )}
        </div>
        <IllustrativeChip />
      </div>

      {/* The stages share the width on a desktop and only scroll below ~1000px.
          A fixed-width rail put stage 9 (BRN) off the right edge at 1440 — and
          BRN is the stage the whole SLA argument lands on, so it has to be in
          the first look, not behind a scroll. */}
      <div className="overflow-x-auto scrollbar-sleek -mx-1 px-1 pb-1">
        <ol className="flex items-stretch gap-1.5 min-w-[940px]">
          {stages.map((s, i) => {
            const st = STATE[s.status] || STATE.pending;
            const { Icon } = st;
            return (
              <motion.li
                key={s.name}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: i * 0.04 }}
                title={s.description}
                className={`relative rounded-xl border px-3 py-2.5 flex-1 min-w-0 ${st.ring}`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon className={`w-3 h-3 flex-shrink-0 ${st.dot} ${s.status === 'active' ? 'animate-spin' : ''}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle truncate">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-[11.5px] font-semibold text-text leading-tight break-words">{s.name}</p>
                <p className="text-[10px] text-text-muted mt-1 tabular-nums">
                  {s.status === 'pending' ? 'pending' : `${s.percentage}%`}
                </p>
              </motion.li>
            );
          })}
        </ol>
      </div>

      {!compact && (
        <p className="text-[10.5px] text-text-subtle mt-3 leading-relaxed">
          Rule, ML and LLM layers resolve 40%, 30% and 12% of what they see. The remainder is not a gap in
          the diagram — it is the edge cases that reach an operator, which is what the human-review stage is
          for.
        </p>
      )}
    </div>
  );
}
