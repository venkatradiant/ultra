import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const data = [
  { period: 'Apr 1–5', y2024: 100, y2025: 108, y2026: 145, capacity: 100 },
  { period: 'Apr 6–8', y2024: 118, y2025: 126, y2026: 162, capacity: 100 },
  { period: 'Apr 9–11', y2024: 131, y2025: 142, y2026: 178, capacity: 100 },
  { period: 'Apr 12–14', y2024: 148, y2025: 153, y2026: 195, capacity: 100 },
  { period: 'Apr 15–17', y2024: 145, y2025: 149, y2026: 190, capacity: 100 },
  { period: 'Apr 18–20', y2024: 122, y2025: 130, y2026: 162, capacity: 100 },
  { period: 'Apr 21–23', y2024: 108, y2025: 115, y2026: 140, capacity: 100 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-surface border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-text-muted mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-muted">{p.name}:</span>
          <span className="font-semibold text-text">{p.value}% of baseline</span>
        </div>
      ))}
    </div>
  );
};

export default function NFCUTaxSeasonChart() {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs font-semibold text-text-muted">Tax Season Call Volume — 3-Year Overlay</p>
        <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-semibold">22-agent gap at peak</span>
      </div>
      <p className="text-[10px] text-text-subtle mb-3">Index: 100 = normal weekday baseline. Source: Dynamics 365 + Snowflake (3-year history)</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#999' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 220]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
          <ReferenceLine y={100} stroke="var(--color-brand)" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: 'Capacity', fontSize: 9, fill: 'var(--color-brand)', position: 'right' }} />
          <Bar dataKey="y2024" name="2024 Actual" fill="#93c5fd" radius={[2,2,0,0]} />
          <Bar dataKey="y2025" name="2025 Actual" fill="#3b82f6" radius={[2,2,0,0]} />
          <Bar dataKey="y2026" name="2026 Projected" fill="#CC0000" radius={[2,2,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-text-muted">
        <span className="w-2 h-2 rounded-full bg-[#CC0000]" />
        <span>2026 projected at <strong className="text-text-muted">+45% vs baseline</strong> — peak April 12–17 requires 70 agents (48 scheduled)</span>
      </div>
    </div>
  );
}
