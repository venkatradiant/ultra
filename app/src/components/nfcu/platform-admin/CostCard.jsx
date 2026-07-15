import { motion } from 'framer-motion';
import { Receipt, TrendingDown } from 'lucide-react';

/**
 * Cost Card (per-query) — cost, turns, tokens, and the SLM-vs-LLM split bar for
 * one conversation. Data: { conversation, timestamp, cost, turns, inputTokens,
 * outputTokens, slmPct, llmPct, llmOnlyCost, savings, note }.
 */
export default function CostCard({ data }) {
  if (!data) return null;
  const fmt = (n) => n.toLocaleString();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
            <Receipt className="w-3.5 h-3.5 text-brand" />
          </span>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-text leading-tight truncate">{data.conversation}</div>
            <div className="text-[10px] text-text-subtle">{data.timestamp}</div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-text tabular-nums leading-none">${data.cost.toFixed(2)}</div>
          <div className="text-[10px] text-text-subtle mt-0.5">total cost</div>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Turns', value: data.turns },
          { label: 'Input tokens', value: fmt(data.inputTokens) },
          { label: 'Output tokens', value: fmt(data.outputTokens) },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-surface-2 px-3 py-2">
            <div className="text-sm font-bold text-text tabular-nums">{s.value}</div>
            <div className="text-[9.5px] text-text-subtle uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* SLM vs LLM split bar */}
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Token split — SLM vs LLM</span>
      </div>
      <div className="flex w-full h-6 rounded-lg overflow-hidden border border-border-subtle">
        <div
          className="flex items-center justify-center text-[10px] font-bold text-white"
          style={{ width: `${data.slmPct}%`, background: 'var(--color-brand)' }}
        >
          {data.slmPct}% SLM
        </div>
        <div
          className="flex items-center justify-center text-[10px] font-bold text-white"
          style={{ width: `${data.llmPct}%`, background: '#7c3aed' }}
        >
          {data.llmPct}% LLM
        </div>
      </div>

      {typeof data.savings === 'number' && (
        <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <TrendingDown className="w-3.5 h-3.5" /> ${data.savings.toFixed(2)} saved vs. LLM-only
          </span>
          <span className="text-[10px] text-text-subtle">LLM-only would cost ${data.llmOnlyCost.toFixed(2)}</span>
        </div>
      )}
    </motion.div>
  );
}
