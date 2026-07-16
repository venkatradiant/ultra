import { motion } from 'framer-motion';
import { Receipt, Sparkles, Cpu, TrendingDown } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getCostReport } from '@/data/nfcu/platform-admin/governanceData';

/**
 * Turn 5 — LLM Cost and Usage Report for Priya's session. One row per task with
 * Task, Complexity, Model, PII to Frontier and Cost. The three frontier rows are
 * highlighted and carry their justification. Footer reconciles the split, the
 * total, and the all-frontier counterfactual with the savings.
 */
export default function LlmCostUsageReport() {
  const data = useAsyncData(getCostReport);
  if (!data) return null;

  const { rows, footer } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-brand" />
          <h3 className="text-sm font-semibold text-text">LLM Cost and Usage — Priya&apos;s session</h3>
        </div>
        <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full flex-shrink-0">
          {footer.frontierTasks} of {footer.totalTasks} on frontier
        </span>
      </div>
      <p className="text-xs text-text-subtle mb-4">
        Every task in the session · {footer.tokenSplit}
      </p>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Task</th>
              <th className="text-left py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Complexity</th>
              <th className="text-center py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Model</th>
              <th className="text-center py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px] whitespace-nowrap">PII → Frontier</th>
              <th className="text-right py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Cost</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isFrontier = row.model === 'Frontier';
              return (
                <tr
                  key={idx}
                  className={`border-b border-border-subtle transition-colors ${
                    isFrontier ? 'bg-violet-50/40' : 'hover:bg-surface-2/50'
                  }`}
                >
                  <td className="py-2.5 px-3 text-text font-medium text-[11px]">
                    {row.task}
                    {isFrontier && row.justification && (
                      <div className="text-[10px] text-violet-700/80 font-normal mt-0.5 leading-snug">{row.justification}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-text-muted text-[10.5px] whitespace-nowrap">{row.complexity}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${isFrontier ? 'text-violet-700' : 'text-brand'}`}
                      style={{ background: isFrontier ? 'rgba(139,92,246,0.12)' : 'color-mix(in srgb, var(--color-brand) 10%, transparent)' }}
                    >
                      {isFrontier ? <Sparkles className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
                      {row.model}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="text-[11px] font-bold text-emerald-700">{row.piiToFrontier}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-[11px] font-semibold text-text tabular-nums">
                    ${row.cost.toFixed(3)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer — the reconciliation the spec owns */}
      <div className="mt-4 rounded-xl bg-surface-2 border border-border-subtle p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Token split', value: footer.tokenSplit },
            { label: 'Session total', value: `$${footer.total.toFixed(2)}` },
            { label: 'If all-frontier', value: `$${footer.allFrontier.toFixed(2)}`, muted: true },
            { label: 'Saved by routing', value: footer.saved, accent: true },
          ].map((s) => (
            <div key={s.label}>
              <div className={`text-base font-bold tabular-nums ${s.accent ? 'text-emerald-600' : s.muted ? 'text-text-subtle line-through' : 'text-text'}`}>
                {s.value}
              </div>
              <div className="text-[9.5px] text-text-subtle uppercase tracking-wide mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border flex items-start gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-text-muted">
            The frontier model ran <span className="font-semibold text-text">{footer.frontierTasks} of {footer.totalTasks} tasks</span>, all complex
            reasoning or generation, all on non-PII inputs. Routing everything through the frontier would have cost
            <span className="font-semibold text-text"> ${footer.allFrontier.toFixed(2)}</span> — a
            <span className="font-bold text-emerald-700"> {footer.saved} saving</span>.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
