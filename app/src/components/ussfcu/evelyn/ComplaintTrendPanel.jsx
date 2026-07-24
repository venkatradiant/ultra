import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import data from '../../../data/ussfcu/evelyn/trends.json';

// Part 4 of the deep-query spec: surface trends normalized for member volume,
// with a threshold KRI and pattern-vs-one-off context — because it is trends,
// not one-off mistakes, that trigger examinations.
export default function ComplaintTrendPanel() {
  const { title, subtitle, kri_threshold_pct, series, normalized_note, kri_note, pattern } = data;
  const chartData = series.map((s) => ({ ...s }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-4 h-4 text-amber-600" />
        <p className="text-xs font-semibold text-text-muted">{title}</p>
      </div>
      <p className="text-[10px] text-text-subtle mb-3">{subtitle}</p>

      {/* QoQ % change with the 5% KRI threshold line */}
      <div className="bg-surface rounded-lg border border-border-subtle p-3 mb-3">
        <ResponsiveContainer width="100%" height={170}>
          <BarChart data={chartData} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} unit="%" domain={[0, 8]} />
            <Tooltip
              formatter={(value) => [`${value}%`, 'QoQ change']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }}
            />
            <ReferenceLine
              y={kri_threshold_pct}
              stroke="#dc2626"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{ value: `KRI ${kri_threshold_pct}%`, position: 'right', fontSize: 9, fill: '#dc2626', fontWeight: 700 }}
            />
            <Bar dataKey="qoq" radius={[4, 4, 0, 0]} animationDuration={900}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.qoq >= kri_threshold_pct ? '#dc2626' : '#f59e0b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[9.5px] text-text-subtle mt-1 flex items-center gap-1">
          <Layers className="w-3 h-3 flex-shrink-0" />
          {normalized_note}
        </p>
      </div>

      {/* KRI callout */}
      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 mb-2">
        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] leading-snug text-red-700">{kri_note}</p>
      </div>

      {/* Pattern vs one-off */}
      <div className="rounded-lg border border-border-subtle bg-surface p-3">
        <p className="text-[11px] font-semibold text-text mb-1">{pattern.verdict}</p>
        <p className="text-[10px] text-text-muted leading-snug">{pattern.detail}</p>
      </div>
    </motion.div>
  );
}
