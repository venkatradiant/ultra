import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const data = [
  { period: 'Oct', dq: 1.18 },
  { period: 'Nov', dq: 1.24 },
  { period: 'Dec', dq: 1.29 },
  { period: 'Jan', dq: 1.31 },
  { period: 'Feb', dq: 1.36 },
  { period: 'Mar', dq: 1.48 },
  { period: 'Apr', dq: 1.62 },
  { period: 'May', dq: 1.78 },
];

export default function AbsDelinquencyTrend() {
  return (
    <div className="bg-surface-2 rounded-xl p-4 border border-border-subtle">
      <p className="text-xs font-semibold text-text-muted mb-3">
        PNFED 2024-A: 60+ Day Delinquency vs. Trigger Threshold
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: '#999' }}
            axisLine={false}
            tickLine={false}
            domain={[1.0, 2.1]}
            tickFormatter={(v) => `${v.toFixed(2)}%`}
          />
          <Tooltip
            formatter={(value) => [`${value.toFixed(2)}%`, '60+ DQ']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }}
          />
          <ReferenceLine
            y={1.80}
            stroke="#CC0000"
            strokeDasharray="4 4"
            label={{ value: 'Trigger (1.80%)', fill: '#CC0000', fontSize: 10, position: 'right' }}
          />
          <Line
            type="monotone"
            dataKey="dq"
            stroke="var(--color-brand)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: 'var(--color-brand)' }}
            activeDot={{ r: 5 }}
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-text-subtle mt-2">
        2 consecutive periods at or above 1.80% activates early amortization. Current month: 1.78%.
      </p>
    </div>
  );
}
