import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PER_PAGE = 4;

function StatCard({ stat, onClick }) {
  const Icon = stat.icon;
  const isClickable = !!stat.chipText;

  return (
    <div
      onClick={isClickable ? () => onClick(stat.chipText) : undefined}
      className={`flex-1 min-w-0 rounded-lg px-3 py-2.5 bg-surface border border-gray-100/80 ${
        isClickable
          ? 'cursor-pointer hover:border-brand/15 hover:shadow-[0_2px_8px_rgba(0,48,135,0.06)] transition-all duration-200'
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
          <span className={`text-[9.5px] font-semibold leading-none truncate ${
            stat.positive ? 'text-emerald-600' : 'text-amber-600'
          }`}>
            {stat.trend}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CapmKpiCarousel({ visible, onStatClick, stats }) {
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
        {/* Control row — right-aligned tiny carets + page count.
            Sits above the tiles so the tiles can use the full row width and
            align edge-to-edge with the priority signals row above. */}
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
                canPrev
                  ? 'text-text-muted hover:text-brand hover:bg-brand/[0.06] cursor-pointer'
                  : 'text-text-subtle cursor-not-allowed'
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
                canNext
                  ? 'text-text-muted hover:text-brand hover:bg-brand/[0.06] cursor-pointer'
                  : 'text-text-subtle cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tile row — full width, aligns with priority signals above. */}
        <div className="flex gap-2">
          {visibleStats.map((stat) => (
            <StatCard key={stat.id} stat={stat} onClick={onStatClick} />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
