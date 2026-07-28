import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import metrics from '../../../data/newfold-digital/ops/metrics.json';

const data = metrics.waitForecast;

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-text mb-0.5">{label}</p>
      <p className="text-brand">With intervention: {payload[0].value} min</p>
      <p className="text-red-500">Without: {payload[1].value} min</p>
    </div>
  );
}

export default function WaitTimeForecast() {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1">Wait Time Forecast — With vs Without Intervention</h3>
      <p className="text-[11px] text-text-subtle mb-3">9 cross-trained agents + self-service billing explainer. Target wait line at 4 min.</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="m" />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={4} stroke="#94a3b8" strokeDasharray="4 4" />
          <Line type="monotone" dataKey="withAction" name="With intervention" stroke="var(--color-brand)" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="withoutAction" name="Without intervention" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 border-t border-border-subtle pt-3 space-y-2">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">Recommended Actions</p>
        {metrics.recommendedActions.map((a, i) => (
          <div key={i} className={`rounded-lg border px-3 py-2 ${a.tone === 'policy' ? 'border-border-subtle bg-surface-2' : 'border-brand/25 bg-brand/[0.04]'}`}>
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${a.tone === 'policy' ? 'bg-surface text-text-muted' : 'bg-brand text-white'}`}>{i + 1}</span>
              <p className="text-[11px] font-semibold text-text">{a.title}</p>
            </div>
            <p className="text-[10px] text-emerald-700 mt-1 ml-6">✓ {a.outcome}</p>
            <p className="text-[10px] text-amber-700 ml-6">⚠ {a.tradeoff}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
