import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import recon from '../../../data/ussfcu/cfo/reconciliation.json';

const w = recon.waterfall;
const usdM = (n) => `$${(n / 1e6).toFixed(2)}M`;

const data = w.bars.map((b) => ({
  label: b.label,
  value: b.value_usd / 1e6,
  display: usdM(b.value_usd),
  note: b.note,
  fill: b.type === 'governed' ? '#10b981' : 'var(--color-brand)',
}));

const governedM = w.governed_usd / 1e6;

export default function ReconciliationWaterfall() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-text-muted">{w.title}</p>
        <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
          {usdM(w.spread_usd)} spread
        </span>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} interval={0} />
          <YAxis
            tick={{ fontSize: 10, fill: '#999' }}
            axisLine={false}
            tickLine={false}
            domain={[14.2, 15.0]}
            tickFormatter={(v) => `$${v.toFixed(2)}M`}
            width={64}
          />
          <Tooltip
            formatter={(_v, _n, ctx) => [ctx.payload.display, ctx.payload.note || ctx.payload.label]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }}
          />
          <ReferenceLine
            y={governedM}
            stroke="#10b981"
            strokeDasharray="4 4"
            label={{ value: `Governed (${usdM(w.governed_usd)})`, fill: '#10b981', fontSize: 9, position: 'insideTopRight' }}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} animationDuration={900}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {w.bars.filter((b) => b.type === 'source').map((b) => (
          <div key={b.label} className="bg-surface rounded-lg p-2 border border-border-subtle">
            <p className="text-[9px] uppercase text-text-subtle font-semibold truncate">{b.system}</p>
            <p className="text-[12px] font-bold text-brand">{usdM(b.value_usd)}</p>
            <p className="text-[9px] text-text-subtle leading-snug mt-0.5">{b.note}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
