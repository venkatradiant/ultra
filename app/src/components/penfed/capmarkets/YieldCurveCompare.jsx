import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { tenor: '3M', q1_2025: 4.18, current: 4.22 },
  { tenor: '6M', q1_2025: 4.12, current: 4.18 },
  { tenor: '1Y', q1_2025: 4.05, current: 4.14 },
  { tenor: '2Y', q1_2025: 3.94, current: 4.12 },
  { tenor: '3Y', q1_2025: 3.88, current: 4.18 },
  { tenor: '5Y', q1_2025: 3.82, current: 4.31 },
  { tenor: '7Y', q1_2025: 3.86, current: 4.42 },
  { tenor: '10Y', q1_2025: 3.94, current: 4.59 },
];

export default function YieldCurveCompare() {
  return (
    <div className="bg-surface-2 rounded-xl p-4 border border-border-subtle">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-xs font-semibold text-text-muted">
          U.S. Treasury Yield Curve: Q1 2025 Entry vs. Current
        </p>
        <p className="text-[10px] font-semibold text-red-600">+47 bps (2y-10y) since March</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="tenor" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: '#999' }}
            axisLine={false}
            tickLine={false}
            domain={[3.5, 4.8]}
            tickFormatter={(v) => `${v.toFixed(2)}%`}
          />
          <Tooltip
            formatter={(value) => `${value.toFixed(2)}%`}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }}
          />
          <Legend
            verticalAlign="top"
            height={24}
            wrapperStyle={{ fontSize: 10 }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="q1_2025"
            name="Q1 2025 (swap entry)"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 2, fill: '#94a3b8' }}
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="current"
            name="Current (May 2026)"
            stroke="#CC0000"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#CC0000' }}
            activeDot={{ r: 5 }}
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-text-subtle mt-2">
        Basis mismatch between swap terms (Q1 2025) and current curve drives 3 positions below 80% effectiveness.
      </p>
    </div>
  );
}
