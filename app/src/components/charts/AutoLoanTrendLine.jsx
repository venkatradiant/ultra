import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import autoLoanTrends from '../../data/auto_loan_trends.json';

const data = autoLoanTrends.weekly_data.map((week) => ({
  week: `W${week.week.split('W')[1]}`,
  rate: Math.round(week.abandonment_rate * 100),
}));

export default function AutoLoanTrendLine() {
  return (
    <div className="bg-surface-2 rounded-xl p-4 border border-border-subtle">
      <p className="text-xs font-semibold text-text-muted mb-3">Auto Loan Inquiry-to-Application Rate — 4 Weeks</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: '#999' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 40]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Abandonment Rate']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#CC0000"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#CC0000', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#CC0000' }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
