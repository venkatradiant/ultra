import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Governance KPI carousel for the Platform Admin persona. Shows 4 roomy tiles per
 * page (2×2 on mobile) with prev/next arrows + a page indicator in the top-right,
 * so the 7 governance metrics never crowd into one tight row. Token-based;
 * clickable tiles dispatch their `chipText` into the chat.
 * Props: { visible, onStatClick, stats } (the manifest statsComponent contract).
 */
const PER_PAGE = 4;

function StatTile({ stat, onClick }) {
  const Icon = stat.icon;
  const isClickable = !!stat.chipText;
  return (
    <button
      type="button"
      onClick={isClickable ? () => onClick(stat.chipText) : undefined}
      disabled={!isClickable}
      className={`text-left rounded-xl px-3.5 py-3 bg-surface border border-border-subtle transition-all duration-200 ${
        isClickable
          ? 'cursor-pointer hover:border-brand/25 hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)]'
          : 'cursor-default'
      }`}
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
          <Icon className={`w-4 h-4 ${stat.iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-bold text-text leading-tight truncate">{stat.value}</div>
          <div className="text-[10px] text-text-subtle font-medium leading-tight truncate mt-0.5">{stat.label}</div>
          {stat.trend && (
            <div className={`text-[9.5px] font-semibold leading-tight truncate mt-1 ${stat.positive ? 'text-emerald-600' : 'text-amber-600'}`}>
              {stat.trend}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function PlatformAdminKpiCarousel({ visible, onStatClick, stats }) {
  const [page, setPage] = useState(0);
  if (!stats || stats.length === 0 || !visible) return null;

  const totalPages = Math.ceil(stats.length / PER_PAGE);
  const clampedPage = Math.min(page, totalPages - 1);
  const visibleStats = stats.slice(clampedPage * PER_PAGE, clampedPage * PER_PAGE + PER_PAGE);
  const canPrev = clampedPage > 0;
  const canNext = clampedPage < totalPages - 1;

  return (
    <div className="mb-3">
      {/* Section header row — label left, carousel controls top-right */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-text-subtle uppercase tracking-widest">Governance Metrics</span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-text-subtle font-medium tabular-nums">{clampedPage + 1}/{totalPages}</span>
            <button
              type="button"
              onClick={() => canPrev && setPage(clampedPage - 1)}
              disabled={!canPrev}
              aria-label="Previous metrics"
              className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                canPrev ? 'border-border text-text-muted hover:text-brand hover:border-brand/30 hover:bg-brand/[0.04] cursor-pointer' : 'border-border-subtle text-text-subtle cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => canNext && setPage(clampedPage + 1)}
              disabled={!canNext}
              aria-label="Next metrics"
              className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                canNext ? 'border-border text-text-muted hover:text-brand hover:border-brand/30 hover:bg-brand/[0.04] cursor-pointer' : 'border-border-subtle text-text-subtle cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Tiles — fixed 4-col grid keeps tile widths consistent across pages. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={clampedPage}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
        >
          {visibleStats.map((stat) => (
            <StatTile key={stat.id} stat={stat} onClick={onStatClick} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
