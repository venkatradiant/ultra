/**
 * WorkbenchPageHeader — shared chrome for the Workbench's four routes.
 *
 * Carries the cycle context (cycle, instance, status) because every one of
 * these pages is scoped to a single billing run, and a figure read without
 * knowing which cycle it belongs to is worse than no figure.
 */
import { motion } from 'framer-motion';
import IllustrativeChip from './IllustrativeChip';

export default function WorkbenchPageHeader({
  title,
  subtitle,
  cycle = null,
  asOf = null,
  illustrative = true,
  children,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border-subtle bg-surface p-5 mb-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-text tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-[13px] text-text-muted mt-1 leading-relaxed max-w-3xl">{subtitle}</p>
          )}
        </div>
        {/* No flex-shrink-0: at 375px the chips are wider than the column, and
            letting them shrink and wrap beats pushing them off the edge. */}
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {/* The cycle chip wraps rather than nowrapping: at 375px the
              three-part context is wider than the viewport, and clipping the
              instance name is worse than letting the chip take two lines. */}
          {cycle && (
            <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[10px] font-medium text-text-muted max-w-full">
              <span className="font-bold text-text">{cycle.id}</span>
              <span className="text-text-subtle">·</span>
              {cycle.instance}
              <span className="text-text-subtle">·</span>
              {cycle.status}
            </span>
          )}
          {asOf && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[10px] font-medium text-text-muted whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Updated {asOf}
            </span>
          )}
          {illustrative && <IllustrativeChip />}
        </div>
      </div>

      {children && <div className="mt-4">{children}</div>}
    </motion.div>
  );
}
