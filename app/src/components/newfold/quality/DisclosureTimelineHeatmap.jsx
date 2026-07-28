import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import metrics from '../../../data/newfold-digital/quality/metrics.json';

const data = metrics.disclosureByDay;

const heatColor = (r) => (r >= 25 ? 'bg-red-500' : r >= 12 ? 'bg-amber-400' : 'bg-emerald-400');
const heatText = (r) => (r >= 25 ? 'text-red-600' : r >= 12 ? 'text-amber-600' : 'text-emerald-600');

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-text mb-0.5">{label} — {d.rate}% completed</p>
      {d.macro ? <p className="text-red-600 font-medium">Macro moved disclosure to step 7</p> : null}
    </div>
  );
}

export default function DisclosureTimelineHeatmap() {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1">Disclosure Completion Rate by Day</h3>
      <p className="text-[11px] text-text-subtle mb-3">Completion fell from 96% to 79% after the Nov 20 macro change.</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 9.5, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <YAxis domain={[70, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x="Nov 20" stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Macro change', fontSize: 9, fill: '#ef4444', position: 'top' }} />
          <Line type="monotone" dataKey="rate" stroke="var(--color-brand)" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 border-t border-border-subtle pt-3">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">Skip Rate by Shift</p>
        <div className="space-y-1.5">
          {metrics.shiftHeatmap.map((s) => (
            <div key={s.shift} className="flex items-center gap-2">
              <span className="text-[11px] text-text w-28 flex-shrink-0">{s.shift}</span>
              <div className="flex-1 bg-surface-2 rounded-full h-2.5 overflow-hidden">
                <div className={`h-full rounded-full ${heatColor(s.skipRate)}`} style={{ width: `${s.skipRate * 2.8}%` }} />
              </div>
              <span className={`text-[10px] font-bold tabular-nums w-8 text-right ${heatText(s.skipRate)}`}>{s.skipRate}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-red-500/[0.05] px-3 py-2">
        <p className="text-[10px] text-red-600 font-semibold">→ Concentrated on the evening shift (thin supervisor coverage). 318 contacts this week may have missing disclosure.</p>
      </div>
    </div>
  );
}
