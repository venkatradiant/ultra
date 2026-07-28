import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import metrics from '../../../data/newfold-digital/ops/metrics.json';

const data = metrics.renewalVolume;
const reasons = metrics.contactReasons;

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-text mb-0.5">{d.time} — {d.volume} contacts</p>
      {d.marker ? <p className="text-brand font-medium">{d.marker}</p> : <p className="text-text-muted">Billing & renewals queue</p>}
    </div>
  );
}

export default function RenewalSpikeChart() {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1">Renewals Queue Volume — Last 4 Hours</h3>
      <p className="text-[11px] text-text-subtle mb-3">3.1x normal within two hours. Markers: the 7:15 AM Marketing send and the same-morning Billing batch.</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Bar dataKey="volume" radius={[3, 3, 0, 0]} barSize={26}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.marker ? '#CC0000' : entry.volume > 120 ? '#f59e0b' : 'var(--color-brand)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 border-t border-border-subtle pt-3">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">Top Contact Reasons</p>
        <div className="space-y-1.5">
          {reasons.map((r) => (
            <div key={r.reason} className="flex items-center gap-2">
              <span className="text-[11px] text-text w-32 flex-shrink-0">{r.reason}</span>
              <div className="flex-1 bg-surface-2 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full bg-brand" style={{ width: `${r.pct * 2.5}%` }} />
              </div>
              <span className="text-[10px] font-bold text-text-muted tabular-nums w-8 text-right">{r.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
