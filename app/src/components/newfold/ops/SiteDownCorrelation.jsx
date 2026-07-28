import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Server } from 'lucide-react';
import metrics from '../../../data/newfold-digital/ops/metrics.json';

const data = metrics.outageTimeline;

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-text mb-0.5">{label} — {d.contacts} site-down contacts</p>
      {d.event ? <p className="text-amber-600 font-medium">{d.event}</p> : null}
    </div>
  );
}

export default function SiteDownCorrelation() {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1 flex items-center gap-2"><Server className="w-4 h-4 text-amber-500" />Site-Down Contacts vs IT Incident Timeline</h3>
      <p className="text-[11px] text-text-subtle mb-3">Contacts rose 24% within 20 minutes of the provisioning incident — the signature of a partial outage, not billing.</p>
      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={data} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x="8:20" stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'IT incident', fontSize: 9, fill: '#f59e0b', position: 'top' }} />
          <Line type="monotone" dataKey="contacts" stroke="var(--color-brand)" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 border-t border-border-subtle pt-3">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">Affected Region — {metrics.outageRegion.region}</p>
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-2 gap-1.5 flex-shrink-0">
            {metrics.outageRegion.nodes.map((n) => (
              <span key={n.id} title={n.status}
                className={`w-8 h-8 rounded-md border ${n.status === 'down' ? 'bg-red-400 border-red-500' : n.status === 'recovering' ? 'bg-amber-300 border-amber-400' : 'bg-emerald-300 border-emerald-400'}`} />
            ))}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-text tabular-nums">{metrics.outageRegion.affectedAccounts.toLocaleString()} accounts affected</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 bg-surface-2 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-brand rounded-full" style={{ width: `${metrics.outageRegion.storePlanShare}%` }} />
              </div>
              <span className="text-[10px] font-bold text-brand tabular-nums">{metrics.outageRegion.storePlanShare}%</span>
            </div>
            <p className="text-[9px] text-text-subtle mt-0.5">on the Bluehost store plan — highest urgency (lost orders)</p>
          </div>
        </div>
      </div>
      <div className="mt-2 rounded-lg bg-amber-500/[0.06] px-3 py-2">
        <p className="text-[10px] text-amber-700 font-semibold">→ 30% of affected customers are on the Bluehost store plan — every minute down is a lost order. Push the known-issue macro so agents point to the event.</p>
      </div>
    </div>
  );
}
