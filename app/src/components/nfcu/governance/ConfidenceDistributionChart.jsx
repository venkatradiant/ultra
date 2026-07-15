import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts';

export default function ConfidenceDistributionChart({ distribution }) {
  const buckets = distribution?.buckets || { high: 0, mid: 0, low: 0 };
  const total = (buckets.high || 0) + (buckets.mid || 0) + (buckets.low || 0);
  const data = [
    { tier: 'High ≥85', count: buckets.high || 0, color: '#16A34A' },
    { tier: 'Mid 70–84', count: buckets.mid || 0, color: '#D97706' },
    { tier: 'Low <70', count: buckets.low || 0, color: '#DC2626' },
  ];

  const lowPct = total ? Math.round(((buckets.low || 0) / total) * 100) : 0;

  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[9px] uppercase tracking-wider font-bold text-text-subtle">Confidence Distribution · 7d</div>
          <div className="text-2xl font-bold text-text tabular-nums mt-1">{total}<span className="text-[11px] font-medium text-text-subtle ml-1">turns</span></div>
        </div>
        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded text-text-muted bg-surface-2">
          {lowPct}% low
        </span>
      </div>

      <div className="h-20 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <XAxis dataKey="tier" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (<Cell key={i} fill={d.color} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
