import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import behavioralAnalytics from '../../data/behavioral_analytics.json';

const data = behavioralAnalytics.mortgage_application_funnel.map((step, idx) => ({
  name: step.page.length > 18 ? step.page.substring(0, 18) + '…' : step.page,
  fullName: step.page,
  dropOff: Math.round(step.drop_off_rate * 100),
  visitors: step.visitors,
  isHighlight: idx === 4, // Step 4 = Income Verification
}));

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface rounded-lg shadow-lg border border-border-subtle px-4 py-3 text-xs">
      <p className="font-semibold text-text mb-1">{d.fullName}</p>
      <p className="text-text-muted">Drop-off: <span className="font-semibold text-text">{d.dropOff}%</span></p>
      <p className="text-text-muted">Visitors: <span className="font-semibold text-text">{d.visitors.toLocaleString()}</span></p>
    </div>
  );
};

export default function MortgageFunnelBar() {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-5">
      <h3 className="text-sm font-semibold text-text mb-1">Drop-Off Rate by Application Step</h3>
      <p className="text-xs text-text-subtle mb-4">Mortgage application funnel — current week</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 40 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: '#999' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 50]}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: '#666' }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Bar dataKey="dropOff" radius={[0, 4, 4, 0]} animationDuration={800} animationEasing="ease-out">
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.isHighlight ? '#CC0000' : 'var(--color-brand)'} opacity={entry.isHighlight ? 1 : 0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
