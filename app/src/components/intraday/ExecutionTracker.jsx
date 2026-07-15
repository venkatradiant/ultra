import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

function statusFor(index, completed) {
  if (completed === 'done' || (typeof completed === 'number' && index < completed)) return 'done';
  if (typeof completed === 'number' && index === completed) return 'running';
  return 'pending';
}

export default function ExecutionTracker({ steps = [], completed = 0 }) {
  if (!steps.length) return null;
  const total = steps.length;
  const completedCount = completed === 'done' ? total : (typeof completed === 'number' ? Math.min(completed, total) : 0);
  const progressPct = (completedCount / total) * 100;

  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      {/* Top: progress meta */}
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          Plan C · Action Execution
        </p>
        <p className="text-[10.5px] font-semibold tabular-nums text-text-muted">
          {completedCount} / {total}
        </p>
      </div>

      {/* Track + nodes */}
      <div className="relative px-3 pt-1.5 pb-1">
        {/* Background track */}
        <div className="absolute left-3 right-3 top-[14px] h-0.5 bg-gray-200 rounded-full" />
        {/* Filled progress */}
        <motion.div
          className="absolute left-3 top-[14px] h-0.5 bg-emerald-500 rounded-full"
          initial={false}
          animate={{ width: `calc((100% - 1.5rem) * ${progressPct / 100})` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Nodes */}
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
          {steps.map((step, idx) => {
            const status = statusFor(idx, completed);
            return (
              <div key={step.id} className="flex flex-col items-center gap-1.5">
                {status === 'done' ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 ring-4 ring-white flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                ) : status === 'running' ? (
                  <motion.div
                    className="w-6 h-6 rounded-full bg-brand ring-4 ring-white flex items-center justify-center shadow-sm"
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <span className="text-[10px] font-bold text-white tabular-nums">{idx + 1}</span>
                  </motion.div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-surface border-2 border-border ring-4 ring-white flex items-center justify-center">
                    <span className="text-[10px] font-bold text-text-subtle tabular-nums">{idx + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Labels under each node */}
      <div className="grid mt-1" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {steps.map((step, idx) => {
          const status = statusFor(idx, completed);
          return (
            <p
              key={`${step.id}-label`}
              className={`text-center text-[10px] leading-tight px-1 ${
                status === 'done'
                  ? 'text-text-muted font-medium'
                  : status === 'running'
                  ? 'text-brand font-semibold'
                  : 'text-text-subtle'
              }`}
              title={step.label}
            >
              {step.label}
            </p>
          );
        })}
      </div>
    </div>
  );
}
