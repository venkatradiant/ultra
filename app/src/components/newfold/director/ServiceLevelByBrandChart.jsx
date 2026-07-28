import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Legend } from 'recharts';
import metrics from '../../../data/newfold-digital/director/metrics.json';

const data = metrics.serviceLevelByBrand.map((d) => ({
  brand: d.brand.length > 12 ? d.brand.slice(0, 11) + '…' : d.brand,
  fullBrand: d.brand,
  thisWeek: d.thisWeek,
  lastWeek: d.lastWeek,
}));

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-text mb-1">{d.fullBrand}</p>
      <p className="text-text-muted">This week: {d.thisWeek}% · Last week: {d.lastWeek}%</p>
    </div>
  );
}

export default function ServiceLevelByBrandChart() {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1">Service Level by Brand — This Week vs Last Week</h3>
      <p className="text-[11px] text-text-subtle mb-3">Target line at 80%. Network Solutions and Bluehost diverged after the renewal spike.</p>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} margin={{ top: 4, right: 10, left: -18, bottom: 0 }}>
          <XAxis dataKey="brand" tick={{ fontSize: 9.5, fill: '#6B7280' }} axisLine={false} tickLine={false} interval={0} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={80} stroke="#94a3b8" strokeDasharray="4 4" />
          <Bar dataKey="lastWeek" name="Last week" radius={[3, 3, 0, 0]} barSize={16} fill="#cbd5e1" />
          <Bar dataKey="thisWeek" name="This week" radius={[3, 3, 0, 0]} barSize={16} fill="var(--color-brand)">
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.thisWeek < 72 ? '#CC0000' : entry.thisWeek < 80 ? '#f59e0b' : 'var(--color-brand)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
