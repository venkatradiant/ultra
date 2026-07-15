import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

// Step 5 (Predictive Intelligence): with-fix vs without-fix forecast.
// Green path resolves before the grace deadline; red path re-declines.
const ROWS = [
  { label: 'Held salary credit', withFix: '$3,140.00 posts within 1 business day', without: 'Stays held — routing still missing' },
  { label: 'Available balance', withFix: 'Recovers to $4,987.20', without: 'Stays at $1,847.20' },
  { label: 'Auto loan payment', withFix: '$412.00 retries and clears', without: 'Likely re-declines next cycle' },
  { label: 'Late fee ($25)', withFix: 'Avoided — clears inside grace window', without: 'At risk after grace period' },
];

export default function MemberFixForecast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-gradient-to-b from-[#F8F9FB] to-white p-4"
    >
      <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted mb-3">
        With the fix vs. without
      </h4>
      <div className="grid grid-cols-[1fr_1fr] gap-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-[11px] font-semibold text-emerald-800">Fix the routing now</span>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-[11px] font-semibold text-red-800">Do nothing</span>
        </div>
      </div>

      <ul className="mt-2 divide-y divide-border-subtle rounded-lg border border-border-subtle overflow-hidden">
        {ROWS.map((r, i) => (
          <li key={i} className="grid grid-cols-[1fr_1fr] gap-2 px-1 py-2">
            <div className="px-2">
              <p className="text-[9px] uppercase tracking-wide font-bold text-text-subtle mb-0.5">{r.label}</p>
              <p className="text-[11px] text-emerald-700 leading-snug">{r.withFix}</p>
            </div>
            <div className="px-2 border-l border-border-subtle">
              <p className="text-[9px] uppercase tracking-wide font-bold text-text-subtle mb-0.5">&nbsp;</p>
              <p className="text-[11px] text-red-600/90 leading-snug">{r.without}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-3 rounded-lg bg-brand/[0.05] border border-brand/10 px-3 py-2">
        <p className="text-[11px] text-brand font-medium">
          Grace window closes in 3 days — the fix resolves everything before the deadline with no fee.
        </p>
      </div>
    </motion.div>
  );
}
