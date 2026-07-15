import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { persistEscalation } from '../../../utils/confidence';

export default function EscalationNotice({ confidence, flowKey, persona, audit }) {
  const esc = confidence?.escalation;

  useEffect(() => {
    if (!esc?.triggered) return;
    const auditId =
      audit?.auditId ||
      `AUD-NFCU-${(flowKey || 'unknown').toUpperCase()}-${Date.now()}`;
    const entry = {
      auditId,
      timestamp: new Date().toISOString(),
      persona: persona?.id || 'unknown',
      personaName: persona?.name || null,
      flowKey: flowKey || null,
      score: confidence.score,
      threshold: confidence.threshold ?? 70,
      reason: esc.reason,
      route_to: esc.route_to,
      review_queue: esc.review_queue,
      model_version: confidence.model_version || null,
      kind: 'auto-escalation',
    };
    persistEscalation(entry);
    try {
      window.dispatchEvent(new CustomEvent('nfcu:escalation', { detail: entry }));
    } catch {
      /* noop */
    }
  }, [esc, confidence, flowKey, persona, audit]);

  if (!esc?.triggered) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mt-2.5 rounded-xl border border-red-200 bg-red-50/70 px-3.5 py-2.5"
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-red-700 leading-snug">
            Confidence {confidence.score}% — below {confidence.threshold ?? 70}% threshold. Auto-escalating to human-in-the-loop.
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-red-700/90">
            <span className="inline-flex items-center gap-1 font-medium">
              <ArrowRight className="w-3 h-3" /> Route to: <span className="font-semibold">{esc.route_to}</span>
            </span>
            {esc.review_queue && (
              <span>
                Queue: <span className="font-medium">{esc.review_queue}</span>
              </span>
            )}
          </div>
          {esc.reason && (
            <p className="mt-1 text-[11px] text-red-700/80 leading-relaxed">
              <span className="font-semibold">Reason:</span> {esc.reason}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
