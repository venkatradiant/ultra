import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import kpiMeta from '../../../data/esfcu/ceo/kpis.json';
import { tierFor, colorFor } from '../../../utils/confidence';

// Forked from CapmKpiCarousel for ESFCU. The one addition is the honest-data
// marker: every tile says whether its figure is public and sourced or
// illustrative, because spec §7 requires each KPI to name its source and the
// data posture requires the two never to be confused. The flag comes from
// kpis.json rather than from the manifest's `ui.stats`, so the shared StatTile
// type stays untouched.

const PER_PAGE = 4;

function StatCard({ stat, onClick }) {
  const Icon = stat.icon;
  const isClickable = !!stat.chipText;
  const meta = kpiMeta.kpis[stat.id];

  return (
    <div
      onClick={isClickable ? () => onClick(stat.chipText) : undefined}
      title={meta ? `${meta.sourceLabel} · ${meta.calc} · ${meta.provenance}` : undefined}
      className={`flex-1 min-w-0 rounded-lg px-3 py-2.5 bg-surface border border-gray-100/80 ${
        isClickable
          ? 'cursor-pointer hover:border-brand/15 hover:shadow-[0_2px_8px_rgba(0,55,104,0.06)] transition-all duration-200'
          : ''
      }`}
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
          <Icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
        </div>
        <div className="min-w-0 flex-1 flex flex-col gap-[2px]">
          <span className="text-[14px] font-bold text-text leading-none truncate">{stat.value}</span>
          <span className="text-[10px] text-text-subtle font-medium leading-none truncate">{stat.label}</span>
          <span className={`text-[9.5px] font-semibold leading-none truncate ${stat.positive ? 'text-emerald-600' : 'text-amber-600'}`}>
            {stat.trend}
          </span>
        </div>
      </div>
      {meta ? (
        <div className="mt-1.5 space-y-1 border-t border-border-subtle pt-1.5">
          <div className="flex items-center gap-1">
            <span
              className={`rounded px-1 py-px text-[8px] font-bold uppercase tracking-wide ${
                meta.real ? 'bg-[#00897B]/10 text-[#00897B]' : 'bg-surface-2 text-text-subtle'
              }`}
            >
              {meta.real ? 'Real' : 'Illustrative'}
            </span>
            {/* Spec §13: a confidence badge on EVERY business figure, not just
                every exhibit — and the CEO's mental model of what it means
                ("validated" vs "reconcile before you cite this"). */}
            <span
              className="inline-flex items-center gap-0.5 text-[8.5px] font-bold tabular-nums"
              style={{ color: colorFor(tierFor(meta.confidence)) }}
              title={meta.state === 'pending' ? 'Reconcile before you cite this' : 'Current, validated and traceable'}
            >
              {meta.state === 'pending'
                ? <AlertTriangle className="h-2.5 w-2.5" />
                : <CheckCircle2 className="h-2.5 w-2.5" />}
              {meta.confidence}%
            </span>
            <span className="min-w-0 flex-1 truncate text-right text-[8.5px] text-text-subtle">{meta.sourceLabel}</span>
          </div>
          {/* Spec §7 gives every KPI a Target and a calculation. Both used to
              live only in a `title` tooltip, which is invisible on a projector
              and on touch — the two places this demo actually gets shown. */}
          <p className="truncate text-[8.5px] leading-tight text-text-subtle">
            <span className="font-semibold">Target:</span> {meta.target}
          </p>
          <p className="truncate text-[8.5px] leading-tight text-text-subtle">{meta.calc}</p>
        </div>
      ) : null}
    </div>
  );
}

export default function EsfcuKpiCarousel({ visible, onStatClick, stats }) {
  const [page, setPage] = useState(0);
  if (!stats || stats.length === 0 || !visible) return null;

  const totalPages = Math.ceil(stats.length / PER_PAGE);
  const visibleStats = stats.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 'auto' }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="mb-3"
      >
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-1.5 mb-1.5">
            <span className="text-[10px] text-text-subtle font-medium tabular-nums">{page + 1}/{totalPages}</span>
            <button
              type="button"
              onClick={() => canPrev && setPage((p) => p - 1)}
              disabled={!canPrev}
              aria-label="Previous KPIs"
              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                canPrev ? 'text-text-muted hover:text-brand hover:bg-brand/[0.06] cursor-pointer' : 'text-text-subtle cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => canNext && setPage((p) => p + 1)}
              disabled={!canNext}
              aria-label="Next KPIs"
              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                canNext ? 'text-text-muted hover:text-brand hover:bg-brand/[0.06] cursor-pointer' : 'text-text-subtle cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Two-up on narrow screens so the tiles never squeeze below legibility. */}
        <div className="grid grid-cols-2 gap-2 lg:flex">
          {visibleStats.map((stat) => (
            <StatCard key={stat.id} stat={stat} onClick={onStatClick} />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
