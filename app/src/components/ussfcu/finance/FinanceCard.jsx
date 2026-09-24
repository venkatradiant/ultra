import { motion } from 'framer-motion';
import IllustrativeDataChip from '../../common/IllustrativeDataChip';

/**
 * Card chrome for the Finance Team persona's inline answers: one eyebrow
 * (the capability the turn demonstrates), a title, the illustrative-data
 * marker, the body, and an optional provenance footnote. Every figure these
 * cards show is sample data (the narrative says so), so the marker is not
 * optional.
 */
export default function FinanceCard({ eyebrow, title, aside, children, footnote }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-3 rounded-xl border border-border-subtle bg-surface-2 p-4 min-w-0"
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-brand">{eyebrow}</p>
          ) : null}
          <h4 className="text-[13px] font-semibold leading-snug text-text">{title}</h4>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {aside}
          <IllustrativeDataChip size="sm" />
        </div>
      </header>
      {children}
      {footnote ? <p className="mt-3 text-[10px] leading-relaxed text-text-subtle">{footnote}</p> : null}
    </motion.section>
  );
}

/** Small status pill used across the finance cards. */
export function StatusPill({ tone = 'neutral', children }) {
  const tones = {
    critical: 'bg-critical-subtle text-critical border-critical/20',
    warning: 'bg-warning-subtle text-warning border-warning/20',
    success: 'bg-success-subtle text-success border-success/20',
    brand: 'bg-brand-subtle text-brand border-brand/20',
    neutral: 'bg-surface text-text-muted border-border',
  };
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${tones[tone] || tones.neutral}`}
    >
      {children}
    </span>
  );
}
