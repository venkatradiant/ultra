import { motion } from 'framer-motion';
import { Eye, User, Bot, Database, Brain, CheckCircle2 } from 'lucide-react';
import PolicyCard from './PolicyCard';

/**
 * Agent Observability Panel — a single agent action explained end to end: query,
 * response, context sources, chain-of-thought, and the applied policy. Rendered
 * conversationally (not raw Grafana). Data: { turnId, workflow, query, response,
 * contextSources[], chainOfThought[], policy, citationStatus, citationNote }.
 */
export default function AgentObservabilityPanel({ data }) {
  if (!data) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface rounded-xl border border-border-subtle p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
            <Eye className="w-3.5 h-3.5 text-brand" />
          </span>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-text leading-tight truncate">{data.workflow}</div>
            <div className="text-[10px] font-mono text-text-subtle">{data.turnId}</div>
          </div>
        </div>
      </div>

      {/* Query / response */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="w-6 h-6 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0 mt-0.5"><User className="w-3 h-3 text-text-muted" /></span>
          <div className="rounded-lg bg-surface-2 px-3 py-2 text-[11.5px] text-text">{data.query}</div>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5"><Bot className="w-3 h-3 text-brand" /></span>
          <div className="rounded-lg border border-border-subtle px-3 py-2 text-[11.5px] text-text-muted leading-relaxed">{data.response}</div>
        </div>
      </div>

      {/* Context sources */}
      <div>
        <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Database className="w-3 h-3" /> Context used
        </div>
        <div className="flex flex-wrap gap-1.5">
          {data.contextSources.map((s) => (
            <span key={s} className="text-[10px] font-medium text-text-muted bg-surface-2 border border-border-subtle px-2 py-0.5 rounded-full">{s}</span>
          ))}
        </div>
      </div>

      {/* Chain of thought */}
      <div>
        <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Brain className="w-3 h-3" /> Chain of thought
        </div>
        <ol className="space-y-1.5">
          {data.chainOfThought.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-brand text-white text-[9px] font-bold inline-flex items-center justify-center mt-0.5">{i + 1}</span>
              <span className="text-[11px] text-text-muted leading-snug">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Applied policy */}
      <div>
        <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Applied policy</div>
        <PolicyCard policy={data.policy} />
      </div>

      {data.citationNote && (
        <div className="flex items-start gap-2 rounded-lg bg-emerald-50/60 border border-emerald-200 px-3 py-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-800 leading-snug">{data.citationNote}</p>
        </div>
      )}
    </motion.div>
  );
}
