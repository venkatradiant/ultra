import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea, ResponsiveContainer } from 'recharts';
import { X, Building2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ACCENT_SOFT } from '../tokens';

/**
 * "Open the branch detail" — the evidence behind the branch anomaly.
 *
 * This exists because the button used to open the deposit-lineage modal, which
 * answers a completely different question. An evidence link that opens the
 * wrong evidence is worse than no link on a screen whose entire argument is
 * that you can trust what it shows you.
 *
 * Everything here is illustrative, and the branch is deliberately generic:
 * ESFCU's 13 Maryland branches are public, so attributing a deposit outflow to
 * a named one would be inventing a fact about a real location.
 */
export default function BranchDetailModal({ open, anomaly, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !anomaly) return null;

  const series = (anomaly.sparkline || []).map((v, i) => ({ i, period: `F${i + 1}`, balance: v }));
  const normal = series.slice(0, series.length - 3);
  const band = normal.length
    ? { lo: Math.min(...normal.map((p) => p.balance)), hi: Math.max(...normal.map((p) => p.balance)) }
    : null;
  const first = series[0]?.balance;
  const last = series[series.length - 1]?.balance;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ background: 'rgba(0,26,50,0.55)' }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-2xl overflow-hidden rounded-2xl bg-surface shadow-2xl"
          initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between bg-brand px-5 py-3 text-white">
            <div className="flex min-w-0 items-center gap-2">
              <Building2 className="h-4 w-4 flex-shrink-0" style={{ color: ACCENT_SOFT }} />
              <span className="truncate text-[12px] font-semibold uppercase tracking-wide">Branch detail — deposit trend</span>
            </div>
            <button type="button" onClick={onClose} aria-label="Close branch detail" className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-text-subtle">{anomaly.title}</p>
                <p className="text-[24px] font-bold leading-none tabular-nums text-[#B45309]">{anomaly.metric_text}</p>
              </div>
              <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-md bg-[#B45309]/10 px-2 py-1 text-[10px] font-semibold text-[#B45309]">
                <AlertTriangle className="h-3 w-3" /> Breaks its own trend
              </span>
            </div>

            <div className="w-full min-w-0" style={{ height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tickFormatter={(v) => `$${v.toFixed(0)}M`}
                    width={48}
                  />
                  <Tooltip formatter={(v) => [`$${v}M`, 'Share balance']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }} />
                  {/* The band is the branch's own normal range — the point is
                      not that the balance fell, it is that it fell outside it. */}
                  {band ? <ReferenceArea y1={band.lo} y2={band.hi} fill="#003768" fillOpacity={0.07} /> : null}
                  <Line type="monotone" dataKey="balance" stroke="#B45309" strokeWidth={2.5} dot={{ r: 2.5 }} animationDuration={900} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1.5 text-[10px] text-text-subtle">
              Shaded band: this branch&rsquo;s normal fortnightly range. {anomaly.sparkline_unit}.
              {first != null && last != null ? ` ${first.toFixed(1)} → ${last.toFixed(1)} over the plotted window.` : ''}
            </p>

            <div className="mt-4 space-y-2 rounded-xl border border-border-subtle bg-surface-2 p-3.5">
              <p className="text-[11.5px] leading-relaxed text-text-muted">{anomaly.detail}</p>
              <p className="text-[11px] leading-relaxed text-text-subtle">{anomaly.policy_note}</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
              <span className="text-[10.5px] text-text-subtle">Source: Branch Deposit Data · Core Banking</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#00897B]">
                <ShieldCheck className="h-3 w-3" /> Source feed loaded cleanly — reads as an outflow, not a bad extract
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
