import { motion } from 'framer-motion';
import { Database, Filter, ShieldQuestion, DollarSign, Cpu, Globe, ArrowDown } from 'lucide-react';

/**
 * Routing Logic Process Diagram — the sovereignty-aware decision path rendered as
 * a hand-built themed flow (house pattern; no mermaid dependency). Vertical stack
 * of gates that forks into "stay in SLM" vs "route to LLM".
 * Data: { title, subtitle, steps[], outcomes[] }.
 */
const STEP_ICON = { source: Database, process: Filter, gate: ShieldQuestion };
const COST_ICON = DollarSign;

function StepNode({ step, index }) {
  const Icon = step.id === 'cost_gate' ? COST_ICON : (STEP_ICON[step.kind] || Filter);
  const isGate = step.kind === 'gate';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className={`w-full max-w-sm rounded-xl border px-4 py-3 flex items-start gap-3 ${
        isGate ? 'border-brand/30 bg-brand/[0.04]' : 'border-border bg-surface'
      }`}
    >
      <span
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: isGate ? 'color-mix(in srgb, var(--color-brand) 12%, transparent)' : 'var(--color-surface-2)' }}
      >
        <Icon className="w-4 h-4" style={{ color: isGate ? 'var(--color-brand)' : 'var(--color-text-muted)' }} />
      </span>
      <div className="min-w-0">
        <div className="text-[12px] font-semibold text-text leading-tight">{step.label}</div>
        <div className="text-[10.5px] text-text-muted mt-0.5 leading-snug">{step.detail}</div>
      </div>
    </motion.div>
  );
}

function OutcomeNode({ outcome }) {
  const isSlm = outcome.kind === 'slm';
  const Icon = isSlm ? Cpu : Globe;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className={`flex-1 rounded-xl border px-4 py-3 ${isSlm ? 'border-brand/40' : 'border-violet-300'}`}
      style={{ background: isSlm ? 'color-mix(in srgb, var(--color-brand) 6%, var(--color-surface))' : 'rgba(139,92,246,0.05)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" style={{ color: isSlm ? 'var(--color-brand)' : '#7c3aed' }} />
        <span className="text-[12px] font-bold" style={{ color: isSlm ? 'var(--color-brand)' : '#7c3aed' }}>{outcome.label}</span>
      </div>
      <p className="text-[10.5px] text-text-muted leading-snug">{outcome.detail}</p>
    </motion.div>
  );
}

export default function RoutingLogicDiagram({ data }) {
  if (!data?.steps) return null;
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-5">
      <h3 className="text-sm font-semibold text-text mb-0.5">{data.title}</h3>
      <p className="text-xs text-text-subtle mb-4">{data.subtitle}</p>

      <div className="flex flex-col items-center">
        {data.steps.map((step, i) => (
          <div key={step.id} className="w-full flex flex-col items-center">
            <StepNode step={step} index={i} />
            <ArrowDown className="w-4 h-4 text-text-subtle my-1.5" />
          </div>
        ))}

        {/* Fork into the two outcomes */}
        <div className="w-full max-w-sm flex items-stretch gap-3">
          {(data.outcomes || []).map((o) => (
            <OutcomeNode key={o.id} outcome={o} />
          ))}
        </div>
      </div>
    </div>
  );
}
