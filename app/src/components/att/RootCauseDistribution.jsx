/**
 * RootCauseDistribution — what is actually breaking, across 202 anomalies.
 *
 * A ranked bar list rather than a donut: the finding is that one category is
 * 45% and the rest tail off, and a ranked list makes an ordering readable at a
 * glance where a donut makes the reader compare arc lengths.
 *
 * The caveat under it matters. This distribution is produced by the Root Cause
 * Analysis agent — the one currently in Warning — so the console says so rather
 * than presenting the categories as ground truth.
 */
import { motion } from 'framer-motion';
import { PieChart as PieIcon } from 'lucide-react';
import IllustrativeChip from './IllustrativeChip';

const COLORS = [
  'var(--color-chart-1)', 'var(--color-chart-4)', 'var(--color-chart-2)',
  'var(--color-chart-6)', 'var(--color-chart-5)',
];

export default function RootCauseDistribution({ data = [], caveat = true }) {
  if (!data.length) return null;
  const total = data.reduce((s, d) => s + d.count, 0);
  const max = Math.max(...data.map((d) => d.count));

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="inline-flex items-center gap-1.5 text-[13px] font-bold text-text tracking-tight">
          <PieIcon className="w-4 h-4 text-brand" /> Root Cause Distribution
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10.5px] text-text-subtle tabular-nums">{total} anomalies</span>
          <IllustrativeChip />
        </div>
      </div>

      <ul className="space-y-3">
        {data.map((d, i) => (
          <li key={d.category}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
              <span className="text-[12px] font-medium text-text min-w-0 truncate">{d.category}</span>
              <span className="text-[11.5px] text-text-muted tabular-nums flex-shrink-0">
                <span className="font-bold text-text">{d.count}</span> · {d.percentage}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(d.count / max) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="h-full rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
            </div>
          </li>
        ))}
      </ul>

      {caveat && (
        <p className="text-[10.5px] text-text-subtle mt-4 pt-3.5 border-t border-border-subtle leading-relaxed">
          These categories are assigned by the Root Cause Analysis agent — the one currently in Warning. The
          volumes are reliable; the boundary between Rate Card Error and Migration Issue is where the two
          causes overlap and the labelling is least certain.
        </p>
      )}
    </div>
  );
}
