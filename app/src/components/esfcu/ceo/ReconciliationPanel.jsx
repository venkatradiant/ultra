import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, CheckCircle2, ChevronDown, Database, FileText, GitMerge, Route, ShieldCheck, ArrowRight,
} from 'lucide-react';
import recon from '../../../data/esfcu/ceo/reconciliation.json';
import ExhibitCard from './ExhibitCard';
import LineageTraceModal from './LineageTraceModal';

// ─── Reconciliation Panel — the ESFCU centerpiece ────────────────
//
// Net-new for this build; there is no USSFCU equivalent. Step 3 of the guided
// flow: the enterprise total and the Howard University division ledger side by
// side, the delta highlighted, an expandable lineage trail to source, and the
// "reconcile before you cite this" badge.
//
// The design point is that the gap is SHOWN, not smoothed. The clean enterprise
// figure sits first so Girado sees what he can cite, then the division break,
// then exactly which hop failed. A prettier dashboard would have shown one
// consolidated number and been quietly wrong.

const STAGE_ICON = {
  Source: Database,
  Mapping: GitMerge,
  Warehouse: Route,
  Brief: FileText,
};

const STAGE_TONE = {
  good: { dot: 'bg-[#00897B]', text: 'text-text', chip: 'bg-[#00897B]/10 text-[#00897B]', label: 'Clean' },
  warning: { dot: 'bg-[#B45309]', text: 'text-[#B45309]', chip: 'bg-[#B45309]/10 text-[#B45309]', label: 'Partial' },
  critical: { dot: 'bg-[#DC2626]', text: 'text-[#DC2626]', chip: 'bg-[#DC2626]/10 text-[#DC2626]', label: 'Broken' },
};

export default function ReconciliationPanel() {
  const [openId, setOpenId] = useState(recon.items[0]?.id ?? null);
  const [traceOpen, setTraceOpen] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <ExhibitCard
        title="Post-merger reconciliation — Howard University division"
        note={recon.cause}
        source="Enterprise Data Warehouse vs Howard University Division Ledger · Governance & Lineage Layer"
        asOf={recon.as_of}
        confidence={71}
        illustrative
      >
        {/* The headline verdict, stated before any numbers. */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-900 ring-1 ring-inset ring-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            {recon.cite_warning}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-[#00897B]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {recon.enterprise_clean.summary}
          </span>
        </div>
        <p className="mb-4 text-[11px] leading-relaxed text-text-muted">{recon.enterprise_clean.detail}</p>

        <div className="space-y-3">
          {recon.items.map((item) => {
            const expanded = openId === item.id;
            return (
              <div key={item.id} className="overflow-hidden rounded-xl border border-border-subtle bg-surface-2">
                {/* Side-by-side comparison */}
                <div className="grid grid-cols-1 gap-px bg-border-subtle sm:grid-cols-[1fr_auto_1fr]">
                  <Side
                    label={item.enterpriseLabel}
                    caption="Carries for the division"
                    figure={item.enterpriseDisplay}
                    sub={`incl. ${item.mappedDisplay} of the division`}
                    state="good"
                  />
                  <div className="flex items-center justify-center bg-surface px-3 py-3 sm:px-4">
                    <div className="text-center">
                      <p className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-[#B45309]">{item.deltaLabel}</p>
                      <p className="text-[19px] font-bold leading-tight tabular-nums text-[#B45309]">{item.deltaDisplay}</p>
                      <p className="mt-0.5 text-[9px] text-text-subtle">delta</p>
                    </div>
                  </div>
                  <Side
                    label={item.divisionLabel}
                    caption="Reports on its own ledger"
                    figure={item.divisionDisplay}
                    sub={`${item.mappedDisplay} mapped · ${item.deltaDisplay} not`}
                    state="warning"
                    align="right"
                  />
                </div>

                {/* Verdict row + lineage disclosure */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle bg-surface px-3 py-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-[10.5px] font-semibold text-text-muted">{item.figure}</span>
                    <span className="text-[10px] text-text-subtle">
                      True consolidated once mapped: <span className="font-semibold tabular-nums text-text-muted">{item.trueConsolidatedDisplay}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenId(expanded ? null : item.id)}
                    aria-expanded={expanded}
                    className="inline-flex flex-shrink-0 items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
                  >
                    {expanded ? 'Hide the lineage trail' : 'Where does it break?'}
                    <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-border-subtle bg-surface"
                    >
                      <div className="-mx-1 overflow-x-auto px-4 py-3">
                        <div className="flex items-stretch">
                          {item.lineage.map((node, i) => {
                            const Icon = STAGE_ICON[node.stage] || Database;
                            const tone = STAGE_TONE[node.state] || STAGE_TONE.good;
                            const isLast = i === item.lineage.length - 1;
                            return (
                              <div key={`${node.system}-${i}`} className="flex items-stretch">
                                <div className="w-[168px] flex-shrink-0 rounded-xl border border-border-subtle bg-surface p-3">
                                  <div className="mb-2 flex items-center justify-between gap-1.5">
                                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${node.state === 'critical' ? 'bg-red-50 text-red-600' : 'bg-brand/[0.07] text-brand'}`}>
                                      <Icon className="h-4 w-4" />
                                    </span>
                                    <span className={`rounded px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide ${tone.chip}`}>
                                      {tone.label}
                                    </span>
                                  </div>
                                  <p className="text-[9px] font-semibold uppercase tracking-wide text-text-subtle">{node.stage}</p>
                                  <p className={`text-[12px] font-bold leading-tight ${tone.text}`}>{node.system}</p>
                                  <p className="mt-1 text-[10px] leading-snug text-text-muted">{node.note}</p>
                                </div>
                                {!isLast ? (
                                  <div className="flex w-8 flex-shrink-0 items-center justify-center">
                                    <ArrowRight className="h-4 w-4 text-text-subtle" />
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            Flagged, not hidden — the consolidated figure is held back until the mapping completes
          </span>
          <button
            type="button"
            onClick={() => setTraceOpen(true)}
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
          >
            <ShieldCheck className="h-3 w-3" /> Trace the enterprise figure to source →
          </button>
        </div>

        <LineageTraceModal open={traceOpen} onClose={() => setTraceOpen(false)} initialFigureId="enterprise_deposits" />
      </ExhibitCard>
    </motion.div>
  );
}

function Side({ label, caption, figure, sub, state, align = 'left' }) {
  const tone = STAGE_TONE[state] || STAGE_TONE.good;
  return (
    <div className={`min-w-0 bg-surface px-3 py-3 ${align === 'right' ? 'sm:text-right' : ''}`}>
      <div className={`mb-1 flex items-center gap-1.5 ${align === 'right' ? 'sm:justify-end' : ''}`}>
        <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${tone.dot}`} />
        <p className="truncate text-[9.5px] font-semibold uppercase tracking-wide text-text-subtle">{label}</p>
      </div>
      <p className="text-[20px] font-bold leading-tight tabular-nums text-text">{figure}</p>
      <p className="mt-0.5 text-[10px] text-text-muted">{sub}</p>
      <p className="mt-1 text-[9px] text-text-subtle">{caption}</p>
    </div>
  );
}
