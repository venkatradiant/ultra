import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import recon from '../../../data/ussfcu/cfo/reconciliation.json';

const d = recon.divergence;
const data = d.series.map((s) => ({ ...s, gap: +(s.cfo - s.lending).toFixed(2) }));

export default function PortfolioDivergenceChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-text-muted">{d.title}</p>
        <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
          {d.current_gap_pct}% gap · {d.recurrence}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: '#999' }}
            axisLine={false}
            tickLine={false}
            domain={[1.3, 1.45]}
            tickFormatter={(v) => `$${v.toFixed(2)}B`}
            width={52}
          />
          <Tooltip
            formatter={(value, name) => [`$${value}B`, name === 'cfo' ? 'CFO (GL)' : 'Lending (Origination)']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }}
          />
          <Legend
            verticalAlign="top"
            height={24}
            formatter={(v) => (v === 'cfo' ? 'CFO board figure (GL)' : 'Lending (Origination)')}
            wrapperStyle={{ fontSize: 10 }}
          />
          <Line type="monotone" dataKey="cfo" stroke="var(--color-brand)" strokeWidth={2.5} dot={{ r: 2 }} animationDuration={900} />
          <Line type="monotone" dataKey="lending" stroke="#CC0000" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 2 }} animationDuration={900} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-subtle">Why they diverge</p>
        {d.drivers.map((driver) => (
          <p key={driver} className="text-[11px] text-text-muted leading-snug flex gap-1.5">
            <span className="text-red-500 font-bold">·</span>{driver}
          </p>
        ))}
      </div>
    </motion.div>
  );
}
