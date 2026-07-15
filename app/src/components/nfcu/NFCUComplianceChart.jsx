import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const data = [
  { day: 'Apr 13', rate: 97 },
  { day: 'Apr 14', rate: 96 },
  { day: 'Apr 15', rate: 97 },
  { day: 'Apr 16', rate: 95 },
  { day: 'Apr 17', rate: 62, scriptChange: true },
  { day: 'Apr 18', rate: 74 },
  { day: 'Apr 19', rate: 71 },
  { day: 'Apr 20', rate: 68 },
  { day: 'Apr 21', rate: 77 },
  { day: 'Apr 22', rate: 78 },
  { day: 'Apr 23', rate: 77 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = data.find(d => d.day === label);
  return (
    <div className="bg-surface border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-text-muted mb-1">{label}</p>
      <p className="text-text-muted">Completion rate: <strong className={payload[0].value < 80 ? 'text-red-600' : 'text-emerald-600'}>{payload[0].value}%</strong></p>
      {d?.scriptChange && <p className="text-red-600 font-semibold mt-1">⚠ Script update deployed</p>}
    </div>
  );
};

export default function NFCUComplianceChart() {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs font-semibold text-text-muted">BSA/AML Verification Completion Rate by Day</p>
        <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-semibold">Compliance gap</span>
      </div>
      <p className="text-[10px] text-text-subtle mb-3">Source: Dynamics 365 Process Adherence · April 17 = script change date</p>
      <ResponsiveContainer width="100%" height={165}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#999' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 9, fill: '#999' }}
            axisLine={false}
            tickLine={false}
            domain={[50, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={96} stroke="var(--color-brand)" strokeDasharray="4 3" strokeWidth={1.5}
            label={{ value: 'Baseline 96%', fontSize: 9, fill: 'var(--color-brand)', position: 'right' }} />
          <Bar dataKey="rate" radius={[3,3,0,0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.rate < 80 ? '#EF4444' : d.rate < 90 ? '#F59E0B' : 'var(--color-brand)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center gap-4 text-[10px]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-brand rounded" /> Above baseline</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded" /> Degraded</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded" /> Critical — verification skipped</span>
      </div>
    </div>
  );
}
