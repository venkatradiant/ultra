import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import mortgageFunnel from '../../data/mortgage_funnel.json';

const data = mortgageFunnel.daily_data.map((day) => ({
  date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  rate: Math.round(day.steps[3].completion_rate * 100),
}));

export default function Step4DailyChart() {
  return (
    <div className="bg-surface-2 rounded-xl p-4 border border-border-subtle">
      <p className="text-xs font-semibold text-text-muted mb-3">Step 4 Completion Rate — Last 7 Days</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: '#999' }}
            axisLine={false}
            tickLine={false}
            domain={[50, 70]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Completion Rate']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }}
          />
          <Bar dataKey="rate" radius={[4, 4, 0, 0]} animationDuration={800} animationEasing="ease-out">
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.rate < 60 ? '#CC0000' : 'var(--color-brand)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
