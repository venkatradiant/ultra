/**
 * ReconciliationPanel — the arithmetic behind "can I trust this?".
 *
 * The claim being tested is narrow and checkable: for every one of these
 * accounts, current minus corrected equals the discount that failed to apply.
 * If that holds, the correction is not a model's opinion about the right
 * amount — it is a reversal of a known, named failure. So the panel shows the
 * per-account deltas' spread first, and the confidence distribution second.
 *
 * The distribution is computed from the rows rather than read from a fixture,
 * which means it cannot drift away from the table above it — a confidence chart
 * that disagrees with its own table is the worst possible artefact in a demo
 * about trusting numbers.
 */
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Cell, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Equal, AlertTriangle } from 'lucide-react';
import { THRESHOLD_DEFAULTS } from '../../data/att/_shared/constants';
import IllustrativeChip from './IllustrativeChip';

const BUCKETS = [
  { id: 'gte95', label: '≥95%', test: (c) => c >= 95, color: '#059669' },
  { id: 'b9095', label: '90–94%', test: (c) => c >= 90 && c < 95, color: '#10B981' },
  { id: 'b8590', label: '85–89%', test: (c) => c >= 85 && c < 90, color: '#F59E0B' },
  { id: 'b8085', label: '80–84%', test: (c) => c >= 80 && c < 85, color: '#F97316' },
  { id: 'b7080', label: '70–79%', test: (c) => c >= 70 && c < 80, color: '#EF4444' },
  { id: 'lt70', label: '<70%', test: (c) => c < 70, color: '#DC2626' },
];

export default function ReconciliationPanel({ pattern, rows = [] }) {
  if (!pattern || !rows.length) return null;

  const data = BUCKETS.map((b) => ({
    label: b.label,
    count: rows.filter((r) => b.test(r.confidence)).length,
    color: b.color,
  })).filter((b) => b.count > 0);

  const deltas = rows.map((r) => Math.abs(r.correctedAmount - r.currentAmount));
  const minDelta = Math.min(...deltas);
  const maxDelta = Math.max(...deltas);
  const totalDelta = deltas.reduce((s, d) => s + d, 0);
  const avgConf = Math.round(rows.reduce((s, r) => s + r.confidence, 0) / rows.length);
  const belowThreshold = rows.filter((r) => r.confidence < THRESHOLD_DEFAULTS.high);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-subtle">
          <Equal className="w-3.5 h-3.5 text-brand" /> Current vs Corrected — Reconciled
        </span>
        <IllustrativeChip />
      </div>

      <p className="text-[12.5px] text-text-muted leading-relaxed">
        For every account, <span className="font-semibold text-text">current − corrected</span> equals the
        discount that failed to apply when the sync did not land. Deltas run{' '}
        <span className="font-semibold text-text">${minDelta.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> to{' '}
        <span className="font-semibold text-text">${maxDelta.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> across{' '}
        {rows.length} accounts, totalling{' '}
        <span className="font-semibold text-text">${totalDelta.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>. The correction reverses a
        named failure rather than estimating a right answer, which is why it can be applied in bulk.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4 mt-4 pt-4 border-t border-border-subtle">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-2">
            Confidence distribution · {rows.length} accounts · avg {avgConf}%
          </p>
          <div className="h-[132px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                <XAxis dataKey="label" tick={{ fontSize: 9.5, fill: 'var(--color-text-subtle)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'var(--color-surface-2)' }}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" name="Accounts" radius={[4, 4, 0, 0]}>
                  {data.map((d) => (<Cell key={d.label} fill={d.color} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-amber-300 bg-amber-500/[0.06] p-3.5 min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" /> {belowThreshold.length} below {THRESHOLD_DEFAULTS.high}%
          </p>
          <p className="text-[11px] text-text-muted mt-2 leading-relaxed">
            Same error, thinner evidence: these accounts had their eligibility records touched closer to the
            sync window. Exclude them and apply to the rest, or escalate them to SME review — either way
            they are held, not dropped.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
