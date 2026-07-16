import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ChevronDown, Sparkles, Database, Brain, Scale, User, Bot } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getGovernance } from '@/data/nfcu/platform-admin/governanceData';

/**
 * Turn 6 — Agent Observability and Governance Dashboard. Agent health + activity,
 * frontier task share and spend trend, and an expandable action view revealing
 * the chain of thought and the applied policy. Rendered in Ultra through Gen UI,
 * not raw Grafana.
 */
const healthPill = (h) =>
  h === 'Healthy'
    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    : 'bg-amber-50 text-amber-700 border border-amber-200';

function SpendTrend({ points }) {
  if (!points?.length) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 100;
  const h = 28;
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (points.length - 1)) * w} ${h - ((p - min) / range) * h}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-7 mt-1">
      <path d={path} fill="none" stroke="var(--color-brand)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AgentObservabilityGovernanceDashboard() {
  const data = useAsyncData(getGovernance);
  const [open, setOpen] = useState(false);
  if (!data) return null;

  const totalTasks = data.agents.reduce((sum, a) => sum + a.tasks, 0);
  const latestSpend = data.spendTrend[data.spendTrend.length - 1];
  const a = data.sampleAction;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-center gap-2 mb-0.5">
        <Activity className="w-4 h-4 text-brand" />
        <h3 className="text-sm font-semibold text-text">Agent Observability &amp; Governance</h3>
        <span className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          All justified · PII-safe
        </span>
      </div>
      <p className="text-xs text-text-subtle mb-4">Contact center · this month</p>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
        <div className="rounded-lg bg-surface-2 px-3 py-2.5">
          <div className="text-base font-bold text-text tabular-nums">{data.frontierTaskShare}</div>
          <div className="text-[9.5px] text-text-subtle uppercase tracking-wide mt-0.5">Frontier task share</div>
        </div>
        <div className="rounded-lg bg-surface-2 px-3 py-2.5">
          <div className="text-base font-bold text-text tabular-nums">{totalTasks.toLocaleString()}</div>
          <div className="text-[9.5px] text-text-subtle uppercase tracking-wide mt-0.5">Tasks handled</div>
        </div>
        <div className="rounded-lg bg-surface-2 px-3 py-2.5 col-span-2 sm:col-span-1">
          <div className="text-base font-bold text-text tabular-nums">${latestSpend.toFixed(2)}</div>
          <div className="text-[9.5px] text-text-subtle uppercase tracking-wide mt-0.5">Spend trend</div>
          <SpendTrend points={data.spendTrend} />
        </div>
      </div>

      {/* Agent health */}
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Agent health</div>
      <div className="space-y-2 mb-4">
        {data.agents.map((agent) => (
          <div key={agent.name} className="flex items-center gap-3 rounded-lg border border-border-subtle px-3 py-2">
            <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${healthPill(agent.health)}`}>
              {agent.health}
            </span>
            <span className="text-[11.5px] font-medium text-text flex-1 min-w-0 truncate">{agent.name}</span>
            <span className="text-[10.5px] text-text-muted tabular-nums whitespace-nowrap">
              {agent.tasks} tasks · <span className="text-violet-700 font-semibold">{agent.frontier} frontier</span>
            </span>
          </div>
        ))}
      </div>

      {/* Expandable action */}
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Recent agent action</div>
      <div className="rounded-lg border border-border-subtle overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface-2/60 transition-colors cursor-pointer"
        >
          <span className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
            <Bot className="w-3 h-3 text-brand" />
          </span>
          <span className="text-[11.5px] font-medium text-text flex-1 min-w-0 truncate">{a.action}</span>
          <span className="text-[9.5px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex-shrink-0">
            {a.policy.split(',')[0]}
          </span>
          <ChevronDown className={`w-4 h-4 text-text-subtle flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden border-t border-border-subtle"
            >
              <div className="p-3 space-y-3 bg-surface-2/40">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded bg-surface flex items-center justify-center flex-shrink-0 mt-0.5"><User className="w-3 h-3 text-text-muted" /></span>
                  <div className="text-[11px] text-text">{a.query}</div>
                </div>
                <div>
                  <div className="text-[9.5px] font-semibold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Database className="w-3 h-3" /> Context used
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {a.context.split(',').map((c) => (
                      <span key={c} className="text-[10px] font-medium text-text-muted bg-surface border border-border-subtle px-2 py-0.5 rounded-full">{c.trim()}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[9.5px] font-semibold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Brain className="w-3 h-3" /> Chain of thought
                  </div>
                  <p className="text-[11px] text-text-muted leading-snug">{a.chainOfThought}</p>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-amber-50/60 border border-amber-200 px-3 py-2">
                  <Scale className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[9.5px] font-semibold text-amber-800 uppercase tracking-wider">Applied policy</div>
                    <p className="text-[11px] text-amber-900 mt-0.5">{a.policy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10.5px] text-violet-700">
                  <Sparkles className="w-3 h-3" />
                  Frontier use on this action was justified and ran on non-PII inputs.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
