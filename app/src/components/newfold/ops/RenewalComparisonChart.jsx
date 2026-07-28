import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import metrics from '../../../data/newfold-digital/ops/metrics.json';

const data = metrics.cycleComparison;

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-text mb-0.5">{label}</p>
      <p className="text-text-muted">April 18 (pre-notified): {payload[0].value}</p>
      <p className="text-brand">Today (no notice): {payload[1].value}</p>
    </div>
  );
}

export default function RenewalComparisonChart() {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1">Renewal Batch Volume — April 18 vs Today</h3>
      <p className="text-[11px] text-text-subtle mb-3">April drove 1.9x with 48 hours' notice and a pre-staffed save desk. Today: no notice, 3.1x.</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="april" name="April 18 (pre-notified)" radius={[3, 3, 0, 0]} barSize={16} fill="#cbd5e1" />
          <Bar dataKey="today" name="Today (no notice)" radius={[3, 3, 0, 0]} barSize={16} fill="var(--color-brand)" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 border-t border-border-subtle pt-3">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">Handle Time & Save-Conversation Differential</p>
        <div className="grid grid-cols-2 gap-2">
          {metrics.handleTimeDiff.map((h) => (
            <div key={h.type} className={`rounded-lg border px-3 py-2 ${h.type.includes('today') ? 'border-amber-200 bg-amber-500/[0.05]' : 'border-border-subtle bg-surface-2'}`}>
              <p className="text-[10px] text-text-muted">{h.type}</p>
              <p className="text-sm font-bold text-text tabular-nums mt-0.5">{Math.floor(h.handleTime)}:{String(Math.round((h.handleTime % 1) * 60)).padStart(2, '0')}</p>
              <p className="text-[9px] text-text-subtle mt-0.5">{h.savePct}% move to a save conversation</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 rounded-lg bg-amber-500/[0.06] px-3 py-2">
        <p className="text-[10px] text-amber-700 font-semibold">
          → Price-increase contacts run 12:40 handle time vs 8:50 normal, and far more move to a save conversation. The team is staffed for standard volume, not a price-increase batch.
        </p>
      </div>
    </div>
  );
}
