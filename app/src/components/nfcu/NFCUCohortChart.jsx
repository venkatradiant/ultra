import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const data = [
  { week: 'Wk 1', cohort: 22.5, benchmark: 18.0 },
  { week: 'Wk 2', cohort: 20.1, benchmark: 15.5 },
  { week: 'Wk 3', cohort: 18.4, benchmark: 13.2 },
  { week: 'Wk 4', cohort: 17.2, benchmark: 11.0 },
  { week: 'Wk 5', cohort: 16.0, benchmark: 9.4 },
  { week: 'Wk 6', cohort: 14.5, benchmark: 9.0 },
  { week: 'Wk 7', cohort: null, benchmark: 9.0 },
  { week: 'Wk 8', cohort: null, benchmark: 9.0 },
  { week: 'Wk 9', cohort: null, benchmark: 9.0 },
];

const fmt = (v) => v != null ? `${v}:00` : '—';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-text-muted mb-1">{label}</p>
      {payload.filter(p => p.value != null).map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-muted">{p.name}: <strong>{fmt(p.value)}</strong> AHT</span>
        </div>
      ))}
    </div>
  );
};

export default function NFCUCohortChart() {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs font-semibold text-text-muted">AHT by Week — March Cohort vs. Benchmark</p>
        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">3 weeks behind</span>
      </div>
      <p className="text-[10px] text-text-subtle mb-3">Source: Dynamics 365 Quality Mgmt + Training System</p>
      <ResponsiveContainer width="100%" height={165}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: '#999' }}
            axisLine={false}
            tickLine={false}
            domain={[8, 24]}
            tickFormatter={(v) => `${v}:00`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
          <ReferenceLine y={9} stroke="var(--color-brand)" strokeDasharray="4 3" strokeWidth={1.5}
            label={{ value: 'Target 9:00', fontSize: 9, fill: 'var(--color-brand)', position: 'right' }} />
          <Line
            type="monotone" dataKey="benchmark" name="Benchmark Cohort" stroke="var(--color-brand)"
            strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3"
            connectNulls={false}
          />
          <Line
            type="monotone" dataKey="cohort" name="March 2026 Cohort" stroke="#CC0000"
            strokeWidth={2.5} dot={{ r: 4, fill: '#CC0000' }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center gap-1 text-[10px] text-text-muted">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span>Week 6 AHT: <strong className="text-red-600">14:30</strong> vs. benchmark <strong className="text-brand">9:00</strong> — KB adherence 62% (target 85%)</span>
      </div>
    </div>
  );
}
