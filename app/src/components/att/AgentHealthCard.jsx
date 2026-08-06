/**
 * AgentHealthCard — one agent's status, accuracy, latency, error and freshness.
 *
 * Spec §13 asks for this as a single reusable pattern rather than a one-off per
 * console, and it earns that: the admin's four pipeline agents and the
 * operator's five charge-type agents are different fleets asking the same five
 * questions.
 *
 * `baseline` is what turns a reading into a judgment. 1250ms means nothing on
 * its own; 1250ms against a 499ms fleet average is a diagnosis, so when a
 * baseline is supplied the card renders the comparison rather than the bare
 * number.
 */
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const STATUS = {
  healthy: { label: 'Healthy', style: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2, ring: 'border-border-subtle' },
  warning: { label: 'Warning', style: 'bg-amber-50 text-amber-700 border-amber-200', Icon: AlertTriangle, ring: 'border-amber-300' },
  critical: { label: 'Critical', style: 'bg-rose-50 text-rose-700 border-rose-200', Icon: XCircle, ring: 'border-rose-300' },
};

function Metric({ label, value, tone = 'text-text', suffix = null }) {
  return (
    <div className="min-w-0">
      <p className={`text-[13px] font-bold leading-none tabular-nums ${tone}`}>{value}</p>
      <p className="text-[9.5px] text-text-subtle uppercase tracking-wider mt-1 truncate">{label}</p>
      {suffix && <p className="text-[9.5px] text-text-muted mt-0.5 truncate">{suffix}</p>}
    </div>
  );
}

export default function AgentHealthCard({ agent, baseline = null, index = 0, selected = false, onSelect = null }) {
  if (!agent) return null;
  const st = STATUS[agent.status] || STATUS.healthy;
  const { Icon } = st;

  const latencyOff = baseline?.avgLatency ? agent.latencyMs / baseline.avgLatency : null;
  const errorOff = baseline?.avgFailureRate ? agent.errorRate / baseline.avgFailureRate : null;
  const isSlow = latencyOff != null && latencyOff >= 1.5;
  const isErrorHeavy = errorOff != null && errorOff >= 1.5;

  const Wrapper = onSelect ? motion.button : motion.div;

  return (
    <Wrapper
      {...(onSelect ? { type: 'button', onClick: () => onSelect(agent.id) } : {})}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={`w-full text-left rounded-2xl border bg-surface p-4 min-w-0 transition-all duration-200 ${st.ring} ${
        selected ? 'ring-1 ring-brand/40' : ''
      } ${onSelect ? 'cursor-pointer hover:shadow-[0_6px_20px_-12px_rgba(0,0,0,0.25)]' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[13px] font-bold text-text leading-snug min-w-0">{agent.name}</p>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold flex-shrink-0 ${st.style}`}>
          <Icon className="w-3 h-3" /> {st.label}
        </span>
      </div>

      <p className="text-[11px] text-text-muted leading-relaxed">{agent.description}</p>

      <div className="grid grid-cols-4 gap-2 mt-3.5 pt-3.5 border-t border-border-subtle">
        <Metric label="Accuracy" value={`${agent.accuracy}%`} tone="text-emerald-700" />
        <Metric
          label="Latency"
          value={`${agent.latencyMs}ms`}
          tone={isSlow ? 'text-amber-700' : 'text-text'}
          suffix={latencyOff ? `${latencyOff.toFixed(1)}× fleet` : null}
        />
        <Metric
          label="Error"
          value={`${agent.errorRate.toFixed(2)}%`}
          tone={isErrorHeavy ? 'text-rose-700' : 'text-text'}
          suffix={errorOff ? `${errorOff.toFixed(1)}× fleet` : null}
        />
        <Metric label="Last run" value={agent.lastRunLabel} tone="text-text-muted" />
      </div>

      {agent.note && (
        <p className="text-[10.5px] text-text-subtle mt-3 leading-relaxed">{agent.note}</p>
      )}
    </Wrapper>
  );
}
