import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import churnData from '../../data/retention/churn_model.json';

const data = churnData.weekly_trend.map((d) => ({
  week: d.week,
  count: d.high_risk_count,
  probability: (d.avg_probability * 100).toFixed(1),
}));

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-text mb-1">{d.week}</p>
      <p className="text-red-600">{d.count} members &gt;70% churn risk</p>
      <p className="text-text-muted">Avg probability: {d.probability}%</p>
    </div>
  );
}

export default function ChurnTrendLine() {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1">High-Risk Members (&gt;70% Churn) — 12-Week Trend</h3>
      <p className="text-[11px] text-text-subtle mb-3">Members crossing the churn probability threshold</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis domain={[100, 'auto']} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={200} stroke="#E5E7EB" strokeDasharray="3 3" label={{ value: 'Baseline', fontSize: 9, fill: '#9CA3AF' }} />
          <Line type="monotone" dataKey="count" stroke="#CC0000" strokeWidth={2.5} dot={{ fill: '#CC0000', r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
