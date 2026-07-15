import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Cpu, TrendingUp, Route, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import lineage from '../../../data/ussfcu/ceo/lineage.json';
import { tierFor, colorFor } from '../../../utils/confidence';
import LineageTraceModal from './LineageTraceModal';

// Same stage → icon mapping as LineageTraceModal, so the horizontal flow and the
// drill-in modal stay visually consistent.
const STAGE_ICON = {
  Core: Database,
  Ledger: Cpu,
  'General Ledger': TrendingUp,
  Source: Database,
  Sources: Database,
  Warehouse: Route,
  'Trust Layer': ShieldCheck,
  Brief: FileText,
};

// "Trace net income back to source" — a horizontal source-to-report lineage flow
// for the Net Income figure, driven entirely by lineage.json. Clicking "Trace to
// source" opens the full LineageTraceModal on the same figure.
export default function NetIncomeTrace() {
  const [traceOpen, setTraceOpen] = useState(false);
  const fig = lineage.figures.find((f) => f.id === 'net_income') || lineage.figures[0];
  const confColor = colorFor(tierFor(fig.confidence));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      {/* Header — figure + confidence */}
      <div className="mb-3.5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-text-subtle">{fig.label} · source to report</p>
          <p className="text-[22px] font-bold leading-none text-text tabular-nums">{fig.value}</p>
        </div>
        <span
          className="flex-shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold tabular-nums"
          style={{ color: confColor, background: `${confColor}14` }}
        >
          {fig.confidence}% confidence
        </span>
      </div>

      {/* Horizontal lineage flow */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex items-stretch">
          {fig.chain.map((node, i) => {
            const Icon = STAGE_ICON[node.stage] || Database;
            const isLast = i === fig.chain.length - 1;
            return (
              <div key={`${node.system}-${i}`} className="flex items-stretch">
                {/* Stage card */}
                <div className="w-[150px] flex-shrink-0 rounded-xl border border-border-subtle bg-surface p-3">
                  <span
                    className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg ${
                      isLast ? 'bg-brand text-white' : 'bg-brand/[0.07] text-brand'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-text-subtle">{node.stage}</p>
                  <p className="text-[12.5px] font-bold leading-tight text-text">{node.system}</p>
                  <p className="mt-1 text-[10.5px] leading-snug text-text-muted">{node.note}</p>
                </div>

                {/* Connector */}
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

      {/* Footer — source + traceable badge + drill-in */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
        <span className="text-[10.5px] text-text-subtle">Source: {fig.source} · as of {fig.asOf}</span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#00897B]">
            <ShieldCheck className="h-3 w-3" /> Traceable — board &amp; NCUA ready
          </span>
          <button
            type="button"
            onClick={() => setTraceOpen(true)}
            title="Trace this figure to source"
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
          >
            <Route className="h-3 w-3" /> Trace to source →
          </button>
        </div>
      </div>

      <LineageTraceModal open={traceOpen} onClose={() => setTraceOpen(false)} initialFigureId="net_income" />
    </motion.div>
  );
}
