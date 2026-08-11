import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, TrendingUp, Route, ShieldCheck, FileText, GitMerge, ArrowRight } from 'lucide-react';
import lineage from '../../../data/esfcu/ceo/lineage.json';
import { tierFor, colorFor } from '../../../utils/confidence';
import LineageTraceModal from '../shared/LineageTraceModal';

// Same stage → icon mapping as LineageTraceModal so the horizontal flow and the
// drill-in modal stay visually consistent.
const STAGE_ICON = {
  Core: Database,
  Source: Database,
  Sources: Database,
  Mapping: GitMerge,
  'General Ledger': TrendingUp,
  Warehouse: Route,
  'Trust Layer': ShieldCheck,
  Brief: FileText,
};

// "Trace the enterprise deposit figure to source" — a horizontal source-to-report
// flow for the enterprise share balance, driven entirely by lineage.json. This is
// the figure that IS safe to cite; the modal is where the consolidated figure's
// broken chain can be inspected alongside it.
export default function DepositLineageTrace() {
  const [traceOpen, setTraceOpen] = useState(false);
  const fig = lineage.figures.find((f) => f.id === 'enterprise_deposits') || lineage.figures[0];
  const confColor = colorFor(tierFor(fig.confidence));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border-subtle bg-surface-2 p-4"
    >
      <div className="mb-3.5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-text-subtle">{fig.label} · source to report</p>
          <p className="text-[22px] font-bold leading-none tabular-nums text-text">{fig.value}</p>
        </div>
        <span
          className="flex-shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold tabular-nums"
          style={{ color: confColor, background: `${confColor}14` }}
        >
          {fig.confidence}% confidence
        </span>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex items-stretch">
          {fig.chain.map((node, i) => {
            const Icon = STAGE_ICON[node.stage] || Database;
            const isLast = i === fig.chain.length - 1;
            return (
              <div key={`${node.system}-${i}`} className="flex items-stretch">
                <div className="w-[150px] flex-shrink-0 rounded-xl border border-border-subtle bg-surface p-3">
                  <span className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg ${isLast ? 'bg-brand text-white' : 'bg-brand/[0.07] text-brand'}`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-text-subtle">{node.stage}</p>
                  <p className="text-[12.5px] font-bold leading-tight text-text">{node.system}</p>
                  <p className="mt-1 text-[10.5px] leading-snug text-text-muted">{node.note}</p>
                </div>
                {!isLast ? (
                  <div className="flex w-9 flex-shrink-0 items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-text-subtle" />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
        <span className="text-[10.5px] text-text-subtle">Source: {fig.source} · as of {fig.asOf}</span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#00897B]">
            <ShieldCheck className="h-3 w-3" /> Traceable — board &amp; NCUA ready
          </span>
          <button
            type="button"
            onClick={() => setTraceOpen(true)}
            title="Trace any figure to source"
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
          >
            <Route className="h-3 w-3" /> Trace another figure →
          </button>
        </div>
      </div>

      <LineageTraceModal open={traceOpen} onClose={() => setTraceOpen(false)} initialFigureId="enterprise_deposits" />
    </motion.div>
  );
}
