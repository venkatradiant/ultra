import { motion } from 'framer-motion';
import { Database, Cpu, TrendingUp, Users, Monitor, AlertTriangle, ArrowRight } from 'lucide-react';
import lineage from '../../../data/ussfcu/cfo/dataFlowLineage.json';

const stageIcons = {
  core: Database,
  ledger: Cpu,
  gl: TrendingUp,
  snowflake: Database,
  tableau: Monitor,
};

const riskStyles = {
  high: 'text-red-600 bg-red-50 border-red-100',
  medium: 'text-amber-600 bg-amber-50 border-amber-100',
};

export default function DataFlowLineageMap() {
  const { stages, transformations, summary, top_gap_figures, title } = lineage;
  const txByFrom = Object.fromEntries(transformations.map((t) => [t.from, t]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-b from-[#F8F9FB] to-white rounded-xl p-4 border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-text-muted">{title}</p>
        <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
          {summary.undocumented_points} undocumented transforms
        </span>
      </div>

      {/* Flow rail */}
      <div className="flex items-stretch gap-1 overflow-x-auto pb-2 scrollbar-sleek">
        {stages.map((stage, idx) => {
          const Icon = stageIcons[stage.id] || Database;
          const tx = txByFrom[stage.id];
          return (
            <div key={stage.id} className="flex items-stretch gap-1 flex-shrink-0">
              <div className="w-[120px] rounded-lg border border-brand/20 bg-surface p-2.5 flex flex-col">
                <div className="w-7 h-7 rounded-md bg-brand/10 flex items-center justify-center mb-1.5">
                  <Icon className="w-3.5 h-3.5 text-brand" />
                </div>
                <p className="text-[11px] font-bold text-text leading-tight">{stage.name}</p>
                {stage.subtitle ? (
                  <p className="text-[9px] text-text-subtle font-medium leading-tight mt-0.5">{stage.subtitle}</p>
                ) : null}
                <p className="text-[9px] text-text-muted leading-snug mt-1">{stage.detail}</p>
              </div>

              {/* Connector with transformation gap badge. Each undocumented
                  transform renders as a deliberate "lineage gap" pill rather than
                  bare red text, so it reads as a data annotation, not an error. */}
              {idx < stages.length - 1 ? (
                <div className="flex flex-col items-center justify-center px-1 min-w-[96px]">
                  <ArrowRight className="w-4 h-4 text-text-subtle mb-1.5" />
                  {tx ? (
                    <div className={`w-full rounded-md border px-1.5 py-1 flex flex-col items-center text-center ${
                      tx.documented
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-red-200 bg-red-50 text-red-600'
                    }`}>
                      <div className="flex items-center gap-1">
                        {!tx.documented ? <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" /> : null}
                        <span className="text-[8.5px] font-semibold leading-tight">{tx.label}</span>
                      </div>
                      <span className="text-[7.5px] uppercase tracking-wide font-bold leading-tight mt-0.5">
                        {tx.documented ? 'Documented' : 'Lineage gap'}
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="bg-surface rounded-lg p-2 border border-border-subtle">
          <p className="text-[9px] uppercase text-text-subtle font-semibold">Figures w/o lineage</p>
          <p className="text-[13px] font-bold text-red-600">{summary.figures_lacking_lineage}</p>
        </div>
        <div className="bg-surface rounded-lg p-2 border border-border-subtle">
          <p className="text-[9px] uppercase text-text-subtle font-semibold">Reconstruct / figure</p>
          <p className="text-[13px] font-bold text-amber-600">{summary.avg_reconstruction_hours} hrs</p>
        </div>
        <div className="bg-surface rounded-lg p-2 border border-border-subtle">
          <p className="text-[9px] uppercase text-text-subtle font-semibold">Traceability</p>
          <p className="text-[13px] font-bold text-brand">{summary.traceability_coverage_pct}%</p>
        </div>
      </div>

      {/* Highest-risk untraced figures */}
      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-subtle mb-1.5">Highest-risk untraced figures</p>
        <div className="space-y-1">
          {top_gap_figures.map((f) => (
            <div key={f.figure} className="flex items-center justify-between bg-surface rounded-lg px-2.5 py-1.5 border border-border-subtle">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-text truncate">{f.figure}</p>
                <p className="text-[9px] text-text-subtle">{f.dashboard}</p>
              </div>
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${riskStyles[f.risk] || riskStyles.medium}`}>
                {f.risk}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
