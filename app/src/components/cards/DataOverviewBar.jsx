import { AnimatePresence, motion } from 'framer-motion';

function StatCard({ stat, index, onClick }) {
  const Icon = stat.icon;
  const isClickable = !!stat.chipText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: 'easeOut' }}
      onClick={isClickable ? () => onClick(stat.chipText) : undefined}
      className={`flex-1 min-w-0 rounded-lg px-2.5 py-2 bg-surface border border-gray-100/80 ${
        isClickable
          ? 'cursor-pointer hover:border-brand/15 hover:shadow-[0_2px_8px_rgba(0,48,135,0.06)] transition-all duration-200'
          : ''
      }`}
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* Icon — fixed size, never shrinks */}
        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
          <Icon className={`w-3 h-3 ${stat.iconColor}`} />
        </div>

        {/* Text block — stacked vertically, each line truncates independently */}
        <div className="min-w-0 flex-1 flex flex-col gap-[2px]">
          <span className="text-[13px] font-bold text-text leading-none truncate">
            {stat.value}
          </span>
          <span className="text-[9px] text-text-subtle font-medium leading-none truncate">
            {stat.label}
          </span>
          <span className={`text-[8.5px] font-semibold leading-none truncate ${
            stat.positive ? 'text-emerald-600' : 'text-amber-600'
          }`}>
            {stat.trend}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function DataOverviewBar({ visible, onStatClick, stats }) {
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
          <div className="flex gap-2">
            {stats.map((stat, idx) => (
              <StatCard
                key={stat.id}
                stat={stat}
                index={idx}
                onClick={onStatClick}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
