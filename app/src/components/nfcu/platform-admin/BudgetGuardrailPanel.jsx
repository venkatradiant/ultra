import { motion } from 'framer-motion';
import { Gauge, ArrowRight, CheckCircle2, Scale, TrendingDown } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getBudgetGuardrail } from '@/data/nfcu/platform-admin/governanceData';

/**
 * Turn 5 — Budget Guardrail. CR-05 / spec v2 Step 5.
 *
 * Shankar's example, made visible: "Joe User exceeded his budget. We stopped
 * using frontier models, went into an SLM, but he still got a good enough
 * answer." The demo beat is the meter crossing the budget line and the model tag
 * flipping — cost control as a live control, not a healthy KPI.
 *
 * Two thresholds, because the spec needs both sentences to be true: the SOFT
 * budget triggers the downshift, the HARD cap is never breached. The
 * counterfactual bar is the payoff — without the downshift it would have been.
 */
export default function BudgetGuardrailPanel() {
  const d = useAsyncData(getBudgetGuardrail);
  if (!d) return null;

  // Scale every bar to the counterfactual so they're comparable at a glance.
  const scale = d.counterfactual * 1.05;
  const pct = (v) => `${Math.min(100, (v / scale) * 100)}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-0.5">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-brand" />
          <h3 className="text-sm font-semibold text-text">Budget Guardrail</h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
          Held inside the cap
        </span>
      </div>
      <p className="text-xs text-text-subtle mb-4">
        {d.user} · {d.surface} · {d.window}
      </p>

      {/* Spend vs budget vs cap */}
      <div className="rounded-lg bg-surface-2 px-3.5 py-3">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Session spend</span>
          <span className="text-[11px] text-text-muted tabular-nums">
            budget ${d.budget.toFixed(2)} · cap ${d.cap.toFixed(2)}
          </span>
        </div>

        <div className="relative h-7 rounded-md bg-surface overflow-hidden border border-border-subtle">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: pct(d.finalSpend) }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 bg-brand/85"
          />
          {/* Budget line — where the downshift fired */}
          <div className="absolute inset-y-0 w-px bg-amber-500" style={{ left: pct(d.budget) }} />
          {/* Cap line — never crossed */}
          <div className="absolute inset-y-0 w-px bg-red-500" style={{ left: pct(d.cap) }} />
          <span className="absolute inset-y-0 left-2 flex items-center text-[11px] font-bold text-white tabular-nums">
            ${d.finalSpend.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-2 text-[9.5px]">
          <span className="inline-flex items-center gap-1 text-amber-700">
            <span className="w-2 h-px bg-amber-500" /> budget — downshift fires
          </span>
          <span className="inline-flex items-center gap-1 text-red-700">
            <span className="w-2 h-px bg-red-500" /> hard cap
          </span>
        </div>

        {/* The counterfactual: what it would have cost without the guardrail */}
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[10px] text-text-subtle">Without the downshift</span>
            <span className="text-[11px] font-semibold text-red-700 tabular-nums">
              ${d.counterfactual.toFixed(2)} · over cap
            </span>
          </div>
          <div className="relative h-2 rounded-full bg-surface overflow-hidden border border-border-subtle">
            <div className="absolute inset-y-0 left-0 bg-red-400/70" style={{ width: pct(d.counterfactual) }} />
            <div className="absolute inset-y-0 w-px bg-red-600" style={{ left: pct(d.cap) }} />
          </div>
        </div>
      </div>

      {/* The downshift moment */}
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mt-4 mb-2">
        The downshift · task {d.downshiftAtTask} of {d.totalTasks}
      </div>
      <div className="flex items-stretch gap-2">
        <div className="flex-1 rounded-lg border border-violet-200 bg-violet-50/60 px-3 py-2 min-w-0">
          <div className="text-[9px] font-bold text-violet-700 uppercase tracking-wider">Before</div>
          <div className="text-[11.5px] font-semibold text-text truncate mt-0.5">{d.before.model}</div>
          <div className="text-[10px] text-text-muted tabular-nums">{d.before.tasks} tasks</div>
        </div>
        <div className="flex items-center flex-shrink-0">
          <ArrowRight className="w-4 h-4 text-text-subtle" />
        </div>
        <div className="flex-1 rounded-lg border border-brand/25 bg-brand/[0.06] px-3 py-2 min-w-0">
          <div className="text-[9px] font-bold text-brand uppercase tracking-wider">After</div>
          <div className="text-[11.5px] font-semibold text-text truncate mt-0.5">{d.after.model}</div>
          <div className="text-[10px] text-text-muted tabular-nums">{d.after.tasks} tasks</div>
        </div>
      </div>

      {/* Quality — the "still got a good enough answer" half of the claim */}
      <div className="flex items-start gap-2 mt-3 rounded-lg bg-emerald-50/60 border border-emerald-200 px-3 py-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="min-w-0">
          <div className="text-[9.5px] font-semibold text-emerald-800 uppercase tracking-wider">
            Answer quality after downshift · {d.answerQuality}
          </div>
          <p className="text-[11px] text-emerald-900 mt-0.5 leading-snug">{d.qualityNote}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 mt-2 rounded-lg bg-amber-50/60 border border-amber-200 px-3 py-2">
        <Scale className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
        <p className="text-[10.5px] text-amber-900">{d.policy}</p>
      </div>

      <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-700 mt-2.5 pl-0.5">
        <TrendingDown className="w-3 h-3 flex-shrink-0" />
        Saved ${(d.counterfactual - d.finalSpend).toFixed(2)} on this session. No interruption, no manual intervention.
      </div>
    </motion.div>
  );
}
