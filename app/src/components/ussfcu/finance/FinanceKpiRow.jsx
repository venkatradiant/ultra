import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, ArrowRight, ArrowUpDown } from 'lucide-react';

/**
 * Spec §7: the eight KPIs, as a carousel — four tiles a page, two pages (net
 * worth ratio through SEG deposits). Same look and controls as the KPI
 * carousel the other USSFCU personas use (CapmKpiCarousel): a right-aligned
 * page count with small carets above the row, and the icon-tile stat card.
 *
 * Fiona's tiles also carry what §7 requires of every KPI: its target, its
 * source, and whether it is the public backdrop or illustrative. The spec's
 * full name, value, target and calculation are in each tile's tooltip. Each
 * tile opens the turn that explains it.
 */
const PER_PAGE = 4;

const TREND = {
  up: { icon: ArrowUpRight, label: 'Up' },
  down: { icon: ArrowDownRight, label: 'Down' },
  stable: { icon: ArrowRight, label: 'Stable' },
  mixed: { icon: ArrowUpDown, label: 'Mixed' },
};

function StatCard({ stat, onClick }) {
  const Icon = stat.icon;
  const clickable = Boolean(stat.chipText);
  const trend = TREND[stat.kpiTrend] || TREND.stable;
  const TrendIcon = trend.icon;

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={clickable ? () => onClick?.(stat.chipText) : undefined}
      title={`${stat.fullName}: ${stat.fullValue}\nTarget: ${stat.fullTarget}\nHow it is calculated: ${stat.calc}`}
      className={`min-w-0 rounded-lg px-3 py-2.5 bg-surface border border-gray-100/80 text-left ${
        clickable
          ? 'cursor-pointer hover:border-brand/15 hover:shadow-[0_2px_8px_rgba(0,48,135,0.06)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring'
          : 'cursor-default'
      }`}
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        {Icon ? (
          <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
            <Icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
          </div>
        ) : null}
        <div className="min-w-0 flex-1 flex flex-col gap-[3px]">
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="text-[14px] font-bold text-text leading-none truncate tabular-nums">{stat.value}</span>
            <span className="flex flex-shrink-0 items-center text-text-subtle" aria-label={`Trend: ${trend.label}`}>
              <TrendIcon className="w-3 h-3" />
            </span>
          </span>
          <span className="text-[10px] text-text-subtle font-medium leading-tight truncate">{stat.label}</span>
          <span className={`text-[9.5px] font-semibold leading-tight truncate ${stat.positive ? 'text-emerald-600' : 'text-amber-600'}`}>
            {stat.target}
          </span>
          <span className="flex items-center gap-1 min-w-0 text-[9px] leading-tight text-text-subtle">
            <span className="truncate">{stat.source}</span>
            <span
              className={`flex-shrink-0 rounded-full border px-1 py-[0.5px] text-[7.5px] font-bold uppercase tracking-wide ${
                stat.publicProfile ? 'border-brand/20 bg-brand-subtle text-brand' : 'border-border bg-surface-2 text-text-subtle'
              }`}
            >
              {stat.publicProfile ? 'Public backdrop' : 'Illustrative'}
            </span>
          </span>
        </div>
      </div>
    </button>
  );
}

export default function FinanceKpiRow({ visible, onStatClick, stats }) {
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
        {/* Control row — right-aligned carets and page count, as on the
            other USSFCU personas. */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-1.5 mb-1.5">
            <span className="text-[10px] text-text-subtle font-medium tabular-nums">
              {page + 1}/{totalPages}
            </span>
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

        {/* Tile row — full width, aligned with the priority signals above;
            two by two on a phone. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
          >
            {visibleStats.map((stat) => (
              <StatCard key={stat.id} stat={stat} onClick={onStatClick} />
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
