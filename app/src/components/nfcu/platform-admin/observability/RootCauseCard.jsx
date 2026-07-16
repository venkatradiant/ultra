import { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Check, X, Scale, CircleSlash, CheckCircle2 } from 'lucide-react';

/**
 * The root-cause card. The reference Grafana had no equivalent — it buried RCA
 * in a log line. This is the thing we're actually adding, so it gets to be a
 * first-class card above the event log rather than line 2 of a scroll.
 *
 * It is also where the scope line is demonstrated rather than asserted: the
 * agent diagnoses and RECOMMENDS, and nothing executes until a human clicks
 * Approve. Approving queues the action for a change window; it never claims the
 * platform acted on its own.
 *
 * The caller keys this on the component id, so selecting another component
 * remounts it and `decision` resets on its own — an approval on Card Disputes
 * must never appear to carry over to the SLM pool.
 *
 * Props: { rca, componentLabel }
 */
export default function RootCauseCard({ rca, componentLabel }) {
  const [decision, setDecision] = useState(null);

  if (!rca) {
    return (
      <div className="rounded-xl bg-surface border border-border-subtle p-5">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-text">No diagnosis needed</h3>
        </div>
        <p className="text-[11px] text-text-muted leading-snug">
          {componentLabel} is healthy. Agents are observing but have nothing to report.
        </p>
      </div>
    );
  }

  const settled = rca.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl bg-surface border border-border-subtle p-5"
    >
      <div className="flex items-center gap-2 mb-0.5">
        <Stethoscope className="w-4 h-4 text-brand" />
        <h3 className="text-sm font-semibold text-text">Root cause</h3>
        <span className="ml-auto text-[10px] font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-full tabular-nums">
          {rca.confidence.toFixed(1)}% confidence
        </span>
      </div>
      <p className="text-[13px] font-semibold text-text mt-2 mb-3">{rca.finding}</p>

      {/* Evidence */}
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Evidence</div>
      <ul className="space-y-1 mb-3">
        {rca.evidence.map((e) => (
          <li key={e} className="flex items-start gap-1.5 text-[11px] text-text-muted leading-snug">
            <span className="w-1 h-1 rounded-full bg-brand mt-1.5 flex-shrink-0" />
            {e}
          </li>
        ))}
      </ul>

      {/* Ruled out — this is what separates a diagnosis from a threshold alert. */}
      {rca.ruledOut?.length > 0 && (
        <>
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Ruled out</div>
          <ul className="space-y-1 mb-3">
            {rca.ruledOut.map((r) => (
              <li key={r} className="flex items-start gap-1.5 text-[11px] text-text-subtle leading-snug">
                <CircleSlash className="w-2.5 h-2.5 mt-1 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Recommendation + the approval gate */}
      <div className="rounded-lg border border-border-subtle overflow-hidden">
        <div className="px-3 py-2.5 bg-surface-2/60">
          <div className="text-[9.5px] font-semibold text-text-muted uppercase tracking-wider mb-1">
            Recommended action
          </div>
          <p className="text-[11.5px] font-medium text-text">{rca.recommendation}</p>
          <div className="flex items-start gap-1.5 mt-2">
            <Scale className="w-3 h-3 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="text-[10.5px] text-amber-900">{rca.policy}</p>
          </div>
        </div>

        <div className="px-3 py-2.5 border-t border-border-subtle">
          {settled ? (
            <div className="flex items-start gap-1.5 text-[10.5px] text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
              <span>{rca.outcome}</span>
            </div>
          ) : decision === 'approved' ? (
            <div className="flex items-start gap-1.5 text-[10.5px] text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
              <span>Approved by D. Okonkwo · queued for the 02:00 change window</span>
            </div>
          ) : decision === 'declined' ? (
            <div className="flex items-start gap-1.5 text-[10.5px] text-text-muted">
              <X className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
              <span>Declined · the agent will keep observing and will not retry</span>
            </div>
          ) : (
            <>
              <p className="text-[10px] text-text-subtle mb-2">
                Awaiting approval — the agent has not executed anything.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDecision('approved')}
                  className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3 h-3" /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('declined')}
                  className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-text-muted border border-border hover:border-border hover:text-text rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" /> Decline
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
