import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import proj from '../../../data/ussfcu/ceo/projection.json';
import { tierFor, colorFor } from '../../../utils/confidence';

const SERIES = [
  { key: 'base', label: 'Base case (no action)', color: '#CC0000', dash: '5 4' },
  { key: 'campaign', label: 'Deposit campaign', color: '#F59E0B', dash: null },
  { key: 'campaign_plus_funding', label: '+ Funding-line review', color: 'var(--color-brand)', dash: null },
];

export default function LiquidityProjectionChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-text-muted">Liquidity projection through Q4 — base case vs. two moves</p>
        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
          Base dips below target by late Q4
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={proj.series} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: '#999' }}
            axisLine={false}
            tickLine={false}
            domain={[85, 115]}
            width={32}
          />
          <Tooltip
            formatter={(value, name) => {
              const s = SERIES.find((x) => x.key === name);
              return [value, s ? s.label : name];
            }}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }}
          />
          <Legend verticalAlign="top" height={24} formatter={(v) => (SERIES.find((x) => x.key === v)?.label || v)} wrapperStyle={{ fontSize: 10 }} />
          <ReferenceLine y={proj.target_index} stroke="#64748B" strokeDasharray="4 4" label={{ value: proj.target_label, fontSize: 9, fill: '#64748B', position: 'insideTopRight' }} />
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2.5}
              strokeDasharray={s.dash || undefined}
              dot={{ r: 2 }}
              animationDuration={900}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Action cards */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {proj.actions.map((a) => {
          const confColor = colorFor(tierFor(a.confidence));
          return (
            <div key={a.id} className="bg-surface rounded-lg border border-border-subtle p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-brand" />
                <p className="text-[11px] font-semibold text-text">{a.title}</p>
              </div>
              <p className="text-[10px] text-text-muted leading-snug mb-2">{a.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-brand">{a.projected_impact}</span>
                <span className="text-[9.5px] font-semibold tabular-nums" style={{ color: confColor }}>{a.confidence}% conf.</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
