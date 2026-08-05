/**
 * HsePageHeader — shared page chrome for the three HSE routes.
 *
 * Deliberately plain. Aramco owns the sidebar mark, the palette and the browser
 * tab, so a page header that re-announced the client would be repetition; and
 * the "not a current customer" qualifier now lives in the sidebar where it
 * follows every route rather than only these three.
 *
 * What stays here is what the page itself needs: what you are looking at, how
 * fresh it is, and that the figures are illustrative.
 */
import { motion } from 'framer-motion';
import IllustrativeDataChip from './IllustrativeDataChip';

export default function HsePageHeader({ title, subtitle, asOf, illustrative = true, children }) {
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
          {subtitle && <p className="text-[13px] text-text-muted mt-1 leading-relaxed max-w-3xl">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {asOf && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[10px] font-medium text-text-muted whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Updated {asOf}
            </span>
          )}
          {illustrative && <IllustrativeDataChip />}
        </div>
      </div>

      {children && <div className="mt-4">{children}</div>}
    </motion.div>
  );
}
