import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Cpu, TrendingUp, Route, ShieldCheck, FileText, ChevronDown } from 'lucide-react';
import lineage from '../../../data/ussfcu/ceo/lineage.json';
import { tierFor, colorFor } from '../../../utils/confidence';

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

// Source-to-screen lineage trace. Opened from any traceable figure (the trust
// strip's Lineage-on-Demand widget, the reconciliation result, etc.). The left
// rail lets the CEO trace ANY headline figure — "click any number to trace it."
export default function LineageTraceModal({ open, onClose, initialFigureId }) {
  const figures = lineage.figures;
  const [activeId, setActiveId] = useState(initialFigureId || figures[0].id);

  useEffect(() => {
    if (open && initialFigureId) setActiveId(initialFigureId);
  }, [open, initialFigureId]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const fig = figures.find((f) => f.id === activeId) || figures[0];
  const confColor = colorFor(tierFor(fig.confidence));

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ background: 'rgba(6,24,43,0.55)' }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-3xl overflow-hidden rounded-2xl bg-surface shadow-2xl"
          initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-brand px-5 py-3 text-white">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-[#E4CE96]" />
              <span className="text-[12px] font-semibold uppercase tracking-wide">Lineage on Demand — source to screen</span>
            </div>
            <button type="button" onClick={onClose} aria-label="Close lineage trace" className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex max-h-[70vh]">
            {/* Figure picker */}
            <div className="w-48 flex-shrink-0 overflow-y-auto border-r border-border-subtle bg-gray-50/60 p-2">
              <p className="px-2 pb-1 pt-1 text-[9.5px] font-semibold uppercase tracking-wide text-text-subtle">Trace a figure</p>
              {figures.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveId(f.id)}
                  className={`mb-0.5 flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    f.id === activeId ? 'bg-brand/[0.08]' : 'hover:bg-surface-2'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-semibold text-text-muted">{f.label}</span>
                    <span className="block text-[10px] tabular-nums text-text-subtle">{f.value}</span>
                  </span>
                  {f.id === activeId ? <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" /> : null}
                </button>
              ))}
            </div>

            {/* Trace */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium text-text-subtle">{fig.label}</p>
                  <p className="text-[26px] font-bold leading-none text-text tabular-nums">{fig.value}</p>
                </div>
                <span className="rounded-md px-2 py-1 text-[10px] font-semibold tabular-nums" style={{ color: confColor, background: `${confColor}14` }}>
                  {fig.confidence}% confidence
                </span>
              </div>

              <div className="relative">
                {fig.chain.map((node, i) => {
                  const Icon = STAGE_ICON[node.stage] || Database;
                  const last = i === fig.chain.length - 1;
                  return (
                    <div key={`${node.system}-${i}`} className="relative flex gap-3 pb-3 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${last ? 'bg-brand text-white' : 'bg-brand/[0.07] text-brand'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {!last ? <ChevronDown className="my-0.5 h-3.5 w-3.5 text-text-subtle" /> : null}
                      </div>
                      <div className="pt-0.5">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-text-subtle">{node.stage}</p>
                        <p className="text-[13px] font-semibold text-text leading-tight">{node.system}</p>
                        <p className="text-[11px] text-text-muted leading-snug">{node.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
                <span className="text-[10.5px] text-text-subtle">Source: {fig.source} · as of {fig.asOf}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#00897B]">
                  <ShieldCheck className="h-3 w-3" />
                  Traceable — board &amp; NCUA ready
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
