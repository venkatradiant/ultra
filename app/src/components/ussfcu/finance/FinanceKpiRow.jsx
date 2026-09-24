import { AnimatePresence, motion } from 'framer-motion';

/**
 * Six KPI tiles, three by two. The first three are USS FCU's public profile
 * and say so (`publicProfile: true` on the stat); the rest are the
 * illustrative figures the six questions discuss. Each tile opens the question
 * that explains it. Buttons rather than clickable divs, so the row can be
 * walked with a keyboard.
 */
export default function FinanceKpiRow({ visible, onStatClick, stats }) {
  if (!stats || stats.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 'auto' }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="mb-3"
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              const clickable = Boolean(stat.chipText);
              return (
                <motion.button
                  key={stat.id}
                  type="button"
                  disabled={!clickable}
                  onClick={clickable ? () => onStatClick?.(stat.chipText) : undefined}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2 text-left shadow-sm transition-all enabled:cursor-pointer enabled:hover:border-brand/25 enabled:hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
                >
                  {Icon ? (
                    <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md ${stat.iconBg}`}>
                      <Icon className={`h-3.5 w-3.5 ${stat.iconColor}`} />
                    </span>
                  ) : null}
                  <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[14px] font-bold leading-none text-text tabular-nums">{stat.value}</span>
                      {stat.publicProfile ? (
                        <span
                          title="USS FCU public profile"
                          className="rounded-full border border-brand/20 bg-brand-subtle px-1.5 py-[1px] text-[8.5px] font-bold uppercase tracking-wide text-brand"
                        >
                          Public
                        </span>
                      ) : null}
                    </span>
                    <span className="truncate text-[10px] font-medium leading-tight text-text-muted">{stat.label}</span>
                    <span className={`truncate text-[9px] font-semibold leading-tight ${stat.positive ? 'text-success' : 'text-warning'}`}>
                      {stat.trend}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
