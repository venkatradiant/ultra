import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Database, TrendingUp, Users, ArrowRight, Route } from 'lucide-react';
import conv from '../../../data/ussfcu/ceo/convergence.json';
import { tierFor, colorFor } from '../../../utils/confidence';
import LineageTraceModal from './LineageTraceModal';

const SOURCE_ICON = { loans: Database, shares: TrendingUp, pipeline: Users };

function fmtUsd(v) {
  if (v >= 1000000000) return `$${(v / 1000000000).toFixed(2)}B`;
  if (v >= 1000000) return `$${(v / 1000000).toFixed(0)}M`;
  return `$${v.toLocaleString()}`;
}

export default function LiquidityReconciliation() {
  const g = conv.governed_metric;
  const confColor = colorFor(tierFor(g.confidence));
  const [traceOpen, setTraceOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-text-muted">One governed number, reconciled across three systems</p>
        <span className="text-[10px] font-semibold tabular-nums" style={{ color: confColor }}>
          Confidence {g.confidence}%
        </span>
      </div>

      {/* Convergence: three sources → governed figure */}
      <div className="flex items-stretch gap-2">
        <div className="flex-1 space-y-2">
          {conv.inputs.map((inp) => {
            const Icon = SOURCE_ICON[inp.id] || Database;
            return (
              <div key={inp.id} className="bg-surface rounded-lg border border-border-subtle p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-text-muted truncate">{inp.label}</span>
                  </div>
                  <span className="text-[12px] font-bold text-text tabular-nums flex-shrink-0">{fmtUsd(inp.value_usd)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-text-subtle">{inp.source}</span>
                  {inp.growth_ytd_pct != null ? (
                    <span className="text-[9px] font-semibold text-text-muted tabular-nums">+{inp.growth_ytd_pct}% YTD</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center">
          <ArrowRight className="w-4 h-4 text-text-subtle" />
        </div>

        {/* Governed figure — click to trace its lineage, source to screen. */}
        <button
          type="button"
          onClick={() => setTraceOpen(true)}
          title="Trace this figure to source"
          className="w-[38%] rounded-xl bg-brand text-white p-3 flex flex-col justify-center items-center text-center cursor-pointer transition-shadow hover:shadow-[0_4px_16px_rgba(0,48,135,0.3)]"
        >
          <p className="text-[9.5px] font-semibold uppercase tracking-wide text-white/60">{g.label}</p>
          <p className="text-[30px] font-bold leading-none mt-1 tabular-nums">{g.value_pct}%</p>
          <p className="text-[10px] text-white/70 mt-1">+{g.delta_pts} pts · highest in 5 years</p>
          <span className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-semibold text-[#E4CE96]">
            <Route className="w-2.5 h-2.5" /> Trace to source
          </span>
        </button>
      </div>

      {/* 5-year trend */}
      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-subtle mb-1">Loan-to-share, five-year trend</p>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={conv.trend_5yr} margin={{ top: 6, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: '#999' }}
              axisLine={false}
              tickLine={false}
              domain={[65, 90]}
              tickFormatter={(v) => `${v}%`}
              width={40}
            />
            <Tooltip formatter={(v) => [`${v}%`, 'Loan-to-share']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }} />
            <Line type="monotone" dataKey="loan_to_share_pct" stroke="var(--color-brand)" strokeWidth={2.5} dot={{ r: 2 }} animationDuration={900} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <LineageTraceModal open={traceOpen} onClose={() => setTraceOpen(false)} initialFigureId="loan_to_share" />
    </motion.div>
  );
}
